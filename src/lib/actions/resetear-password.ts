'use server';

import { z } from 'zod';
import { getUser, getProfile } from '@/lib/supabase-helpers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { generarPassword } from '@/lib/email-generator';

const UserIdSchema = z.string().uuid();

export type ResetearPasswordResult =
  | { ok: true; email: string; password: string }
  | { error: string };

// Reset de contraseña admin-asistido (ADMIN-FLOW.md §7: "Reset de contraseña
// individual"). En vez de auth.admin.generateLink tipo recovery (que exige un
// flujo de email que la plataforma no tiene configurado), se sigue el mismo
// patrón ya usado en alta-masiva.ts y cambiar-password.ts: generar una
// contraseña temporal, forzar must_change_password y mostrarla una sola vez
// para que el admin la entregue por un canal seguro.
export async function resetearPassword(userId: string): Promise<ResetearPasswordResult> {
  const parsedId = UserIdSchema.safeParse(userId);
  if (!parsedId.success) return { error: 'Identificador de usuario inválido' };

  const user = await getUser();
  if (!user) return { error: 'No autorizado' };

  const profile = await getProfile(user.id);
  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    return { error: 'Solo administradores pueden restablecer contraseñas' };
  }

  const sbAdmin = getSupabaseAdmin();

  // Aislamiento multi-tenant: mismo criterio que /admin/usuarios (lee con
  // service_role, que salta RLS, así que el filtro por escuela debe aplicarse
  // aquí explícitamente). Un admin escolar solo puede resetear usuarios de SU
  // escuela y nunca a un super_admin.
  const { data: target, error: targetError } = await sbAdmin
    .from('profiles')
    .select('id, email, escuela_id, role')
    .eq('id', parsedId.data)
    .single();

  if (targetError || !target) {
    return { error: 'Usuario no encontrado' };
  }

  if (profile.role !== 'super_admin') {
    if (target.escuela_id !== profile.escuela_id || target.role === 'super_admin') {
      return { error: 'No tienes permiso sobre este usuario' };
    }
  }

  const password = generarPassword();

  // updateUserById no documenta si user_metadata se reemplaza o se combina;
  // para no arriesgar borrar full_name/role/escuela_id/semestre existentes se
  // lee el usuario primero y se hace el merge explícitamente en el cliente.
  const { data: authUser, error: getUserError } = await sbAdmin.auth.admin.getUserById(parsedId.data);
  if (getUserError || !authUser?.user) {
    return { error: 'No se pudo leer el usuario en el sistema de autenticación' };
  }

  const { error: updateError } = await sbAdmin.auth.admin.updateUserById(parsedId.data, {
    password,
    user_metadata: {
      ...authUser.user.user_metadata,
      must_change_password: true,
    },
  });

  if (updateError) {
    return { error: `Error actualizando contraseña: ${updateError.message}` };
  }

  const { error: profileError } = await sbAdmin
    .from('profiles')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update({ must_change_password: true } as any)
    .eq('id', parsedId.data);
  if (profileError) {
    console.error('[resetearPassword] no se pudo sincronizar profiles.must_change_password:', profileError.message);
  }

  return { ok: true, email: target.email, password };
}

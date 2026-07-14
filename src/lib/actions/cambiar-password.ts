'use server';

import { z } from 'zod';
import { getUser, getProfile, getSupabaseServer } from '@/lib/supabase-helpers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const CambiarPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(72, 'La contraseña no puede superar 72 caracteres'),
  confirmar: z.string(),
}).refine((d) => d.password === d.confirmar, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmar'],
});

export async function cambiarPassword(
  password: string,
  confirmar: string
): Promise<{ ok: true; rol: string } | { error: string }> {
  const user = await getUser();
  if (!user) return { error: 'No autenticado' };

  const parsed = CambiarPasswordSchema.safeParse({ password, confirmar });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };
  }

  // Verificar que realmente necesita cambiar password
  if (user.user_metadata?.must_change_password !== true) {
    return { error: 'No se requiere cambio de contraseña' };
  }

  // Actualizar password y limpiar flag usando la sesión activa del usuario
  const sb = await getSupabaseServer();
  const { error: updateError } = await sb.auth.updateUser({
    password: parsed.data.password,
    data: { must_change_password: false },
  });

  if (updateError) {
    return { error: `Error actualizando contraseña: ${updateError.message}` };
  }

  // Sincronizar profiles.must_change_password usando service_role (bypass RLS + trigger).
  // Cast necesario hasta que migration 09 se aplique y los tipos se regeneren.
  const sbAdmin = getSupabaseAdmin();
  await sbAdmin
    .from('profiles')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update({ must_change_password: false } as any)
    .eq('id', user.id);

  // Devolver el rol para que el cliente redirija al dashboard correcto.
  // Se lee de profiles.role (fuente de verdad), no de user_metadata: el JWT
  // puede traer un rol obsoleto si el admin lo cambió después del alta.
  const profile = await getProfile(user.id);
  const role = profile?.role ?? 'student';
  return { ok: true, rol: role };
}

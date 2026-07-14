'use server';

import { z } from 'zod';
import { getUser, getProfile } from '@/lib/supabase-helpers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { generarPassword } from '@/lib/email-generator';

const CrearAdminEscolarSchema = z.object({
  full_name: z.string().trim().min(1, 'El nombre es obligatorio').max(200, 'Máximo 200 caracteres'),
  email: z.string().trim().toLowerCase().min(1, 'El correo es obligatorio').email('Correo inválido'),
  escuela_id: z.string().uuid('Selecciona una escuela válida'),
});

export type CrearAdminEscolarResult =
  | { ok: true; email: string; password: string }
  | { error: string };

// ADMIN-FLOW.md §5.2: solo super_admin crea admins escolares. El perfil se
// crea vía el trigger handle_new_user (migración 01/09) a partir de
// user_metadata, igual que en alta-masiva.ts — no se inserta en profiles
// directamente.
export async function crearAdminEscolar(input: unknown): Promise<CrearAdminEscolarResult> {
  const user = await getUser();
  if (!user) return { error: 'No autorizado' };

  const profile = await getProfile(user.id);
  if (!profile || profile.role !== 'super_admin') {
    return { error: 'Solo super_admin puede crear administradores escolares' };
  }

  const parsed = CrearAdminEscolarSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };
  }

  const sbAdmin = getSupabaseAdmin();

  const { data: escuela, error: escuelaError } = await sbAdmin
    .from('escuelas')
    .select('id')
    .eq('id', parsed.data.escuela_id)
    .single();
  if (escuelaError || !escuela) {
    return { error: 'La escuela seleccionada no existe' };
  }

  const password = generarPassword();

  const { data: authData, error: authError } = await sbAdmin.auth.admin.createUser({
    email: parsed.data.email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: parsed.data.full_name,
      role: 'admin',
      escuela_id: parsed.data.escuela_id,
      must_change_password: true,
    },
  });

  if (authError || !authData?.user) {
    if (authError?.code === 'email_exists') {
      return { error: 'Ya existe un usuario con ese correo' };
    }
    return { error: `Error creando usuario: ${authError?.message ?? 'respuesta vacía'}` };
  }

  return { ok: true, email: parsed.data.email, password };
}

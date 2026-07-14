'use server';

import { getUser, getProfile } from '@/lib/supabase-helpers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { CrearEscuelaSchema } from '@/lib/schemas/crear-escuela.schema';

export type CrearEscuelaResult =
  | { ok: true; id: string; nombre: string }
  | { error: string };

// ADMIN-FLOW.md §5.1: solo super_admin (visión global de la plataforma)
// registra escuelas nuevas — coincide con la policy "super_admin can manage
// escuelas" (FOR ALL) de la migración 01.
export async function crearEscuela(input: unknown): Promise<CrearEscuelaResult> {
  const user = await getUser();
  if (!user) return { error: 'No autorizado' };

  const profile = await getProfile(user.id);
  if (!profile || profile.role !== 'super_admin') {
    return { error: 'Solo super_admin puede registrar escuelas' };
  }

  const parsed = CrearEscuelaSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };
  }

  const sbAdmin = getSupabaseAdmin();
  const { data, error } = await sbAdmin
    .from('escuelas')
    .insert({
      nombre: parsed.data.nombre,
      cct: parsed.data.cct ?? null,
      subsistema: parsed.data.subsistema ?? null,
      estado: parsed.data.estado ?? null,
      municipio: parsed.data.municipio ?? null,
    })
    .select('id, nombre')
    .single();

  if (error || !data) {
    if (error?.code === '23505') {
      return { error: 'Ya existe una escuela registrada con esa CCT' };
    }
    return { error: `Error creando escuela: ${error?.message ?? 'respuesta vacía'}` };
  }

  return { ok: true, id: data.id, nombre: data.nombre };
}

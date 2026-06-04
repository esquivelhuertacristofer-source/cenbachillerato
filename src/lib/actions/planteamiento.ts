'use server';

import { getUser, getSupabaseServer } from '@/lib/supabase-helpers';
import type { ProgresionPlan } from '@/lib/schemas/planteamiento.schema';

/**
 * Server Action: devuelve las progresiones de planteamiento (contenido MCCEMS)
 * de una UAC, leídas desde Supabase (tabla planteamiento_progresiones).
 *
 * Reemplaza la carga estática de JSON (loadUACProgresiones) para que el
 * contenido NO se empaquete en el bundle del Worker. El contenido vive en la
 * base de datos; aquí solo se proyecta el JSONB `contenido` (== ProgresionPlan).
 */
export async function getPlanteamientoPorUAC(
  uacCodigo: string
): Promise<ProgresionPlan[]> {
  const user = await getUser();
  if (!user) return [];

  const sb = await getSupabaseServer();

  // 1. UAC → id
  const { data: uac } = await sb
    .from('uac')
    .select('id')
    .eq('codigo', uacCodigo)
    .maybeSingle();

  if (!uac) return [];

  // 2. Progresiones de esa UAC
  const { data: progresiones } = await sb
    .from('progresiones')
    .select('id')
    .eq('uac_id', uac.id);

  if (!progresiones || progresiones.length === 0) return [];

  const progresionIds = progresiones.map((p) => p.id);

  // 3. Planteamiento (contenido pedagógico) de esas progresiones
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sba: any = sb;
  const { data: planteamientos } = await sba
    .from('planteamiento_progresiones')
    .select('contenido')
    .in('progresion_id', progresionIds)
    .eq('version_curricular', 'MCCEMS_2025');

  if (!planteamientos || planteamientos.length === 0) return [];

  // 4. Proyectar el JSONB `contenido` (== ProgresionPlan) y ordenar por
  //    número de progresión (sufijo -Pnn del code), igual que el loader previo.
  const planes = (planteamientos as Array<{ contenido: ProgresionPlan }>)
    .map((p) => p.contenido)
    .filter(Boolean);

  planes.sort((a, b) => {
    const numA = parseInt(a.code.split('-P')[1] ?? '0', 10);
    const numB = parseInt(b.code.split('-P')[1] ?? '0', 10);
    return numA - numB;
  });

  return planes;
}

/**
 * Utilidades compartidas para seeds de actividades pedagógicas.
 * Todas las actividades se insertan con estado='borrador' (requieren validación pedagógica).
 */

import { createClient } from "@supabase/supabase-js";
import type { Database, Json } from "../../src/types/database.types";
import { validarContenidoActividad } from "../../src/lib/activities/validators";
import type { TipoActividadKey } from "../../src/lib/activities/validators";

export type SB = ReturnType<typeof createClient<Database>>;

export interface ActividadInput {
  codigo: string;
  titulo: string;
  descripcion: string;
  tipo: TipoActividadKey;
  contenido: unknown;
  progresion_id: string;
  xp?: number;
  estado?: "borrador" | "publicada" | "archivada";
}

let logLines: string[] = [];

export function log(msg: string) {
  console.log(msg);
  logLines.push(msg);
}

export function getLogs() { return logLines; }
export function resetLogs() { logLines = []; }

/** Obtiene el ID de una progresión por su código. */
export async function getProgresionId(sb: SB, codigo: string): Promise<string> {
  const { data, error } = await sb
    .from("progresiones")
    .select("id")
    .eq("codigo", codigo)
    .single();
  if (error || !data) throw new Error(`Progresión ${codigo} no encontrada: ${error?.message}`);
  return data.id;
}

/** Obtiene todos los IDs de progresiones de una UAC por semestre y código de UAC. */
export async function getProgresionesDeUAC(sb: SB, uacCodigo: string): Promise<Array<{ id: string; codigo: string; numero: number }>> {
  const { data: uac, error: uacErr } = await sb
    .from("uac").select("id").eq("codigo", uacCodigo).single();
  if (uacErr || !uac) throw new Error(`UAC ${uacCodigo} no encontrada`);

  const { data, error } = await sb
    .from("progresiones")
    .select("id, codigo, numero")
    .eq("uac_id", uac.id)
    .order("numero");
  if (error || !data) throw new Error(`Error obteniendo progresiones de ${uacCodigo}: ${error?.message}`);
  return data;
}

/**
 * Valida y hace upsert de una actividad. Retorna true si fue exitosa.
 * NO lanza excepción en fallo de validación — loguea y retorna false.
 */
export async function upsertActividad(sb: SB, act: ActividadInput): Promise<boolean> {
  const validacion = validarContenidoActividad(act.tipo, act.contenido);
  if (!validacion.success) {
    log(`  ✗ VALIDACIÓN FALLÓ [${act.codigo}]: ${JSON.stringify((validacion.error as unknown as { issues: unknown[] }).issues)}`);
    return false;
  }

  const { error } = await sb.from("actividades").upsert({
    codigo: act.codigo,
    titulo: act.titulo,
    descripcion: act.descripcion,
    tipo: act.tipo,
    tipo_codigo: act.tipo,
    contenido: validacion.data as unknown as Json,
    progresion_id: act.progresion_id,
    xp: act.xp ?? 10,
    estado: act.estado ?? "borrador",
  }, { onConflict: "codigo" });

  if (error) {
    log(`  ✗ ERROR DB [${act.codigo}]: ${error.message}`);
    return false;
  }

  log(`  ✓ ${act.codigo} — ${act.titulo.substring(0, 60)}`);
  return true;
}

/** Crea el cliente de Supabase desde variables de entorno. */
export function createSB(): SB {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  return createClient<Database>(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

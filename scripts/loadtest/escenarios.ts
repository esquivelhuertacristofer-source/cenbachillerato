/**
 * Escenarios de carga — replican, verbatim en forma, las consultas REALES que un
 * alumno dispara contra Supabase. El catálogo se sirve desde KV y NO toca la BD,
 * así que la carga real de Postgres son las lecturas PERSONALES autenticadas:
 *
 *   - snapshot        → hub.ts getSnapshotCompletadas (lookup por PK, lo más
 *                       frecuente al navegar el hub)
 *   - progresoDetalle → progreso.ts getProgresoDetallePorUAC (4 queries en lote)
 *   - resumen         → progreso.ts getResumenActividadAlumno (3 en paralelo + RPC)
 *   - escritura       → entregar-actividad.ts insert en `intentos` (SOLO --writes,
 *                       solo cuentas sintéticas; dispara el trigger del snapshot)
 *
 * Cada escenario LANZA si Supabase responde error, para que el driver lo cuente
 * como fallo. Se mantienen alineados a mano con src/lib/queries/*; si esas
 * consultas cambian, actualizar aquí también.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

// Cliente con sesión de usuario. `any` a propósito: replicamos selects con
// relaciones anidadas cuyo tipado exacto no aporta a un script de carga.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UserSb = SupabaseClient<any, "public", any>;

export interface VU {
  userId: string;
  semestre: number;
  sb: UserSb;
  /** Cache de actividad_ids del semestre (para el escenario de escritura). */
  actividadIds?: string[];
}

const CATEGORIA_COMPLEMENTO = "Complemento (no oficial 2025)";

function lanzarSiError(error: unknown, ctx: string): void {
  if (error) {
    const msg =
      typeof error === "object" && error && "message" in error
        ? String((error as { message: unknown }).message)
        : String(error);
    throw new Error(`${ctx}: ${msg}`);
  }
}

// ── snapshot: lookup por PK ───────────────────────────────────────────────────
export async function escSnapshot(vu: VU): Promise<void> {
  const { error } = await vu.sb
    .from("progreso_alumno_snapshot")
    .select("completadas")
    .eq("user_id", vu.userId)
    .maybeSingle();
  lanzarSiError(error, "snapshot");
}

// ── progresoDetalle: las 4 queries en lote de getProgresoDetallePorUAC ─────────
export async function escProgresoDetalle(vu: VU): Promise<void> {
  const { data: uacRows, error: e1 } = await vu.sb
    .from("uac")
    .select("id, codigo, nombre")
    .eq("semestre", vu.semestre)
    .order("codigo", { ascending: true });
  lanzarSiError(e1, "progresoDetalle.uac");
  if (!uacRows || uacRows.length === 0) return;

  const uacIds = (uacRows as { id: string }[]).map((u) => u.id);
  const { data: progRows, error: e2 } = await vu.sb
    .from("progresiones")
    .select("id, categoria, uac_id")
    .in("uac_id", uacIds);
  lanzarSiError(e2, "progresoDetalle.progresiones");

  const progIds: string[] = [];
  for (const p of (progRows ?? []) as { id: string; categoria: string }[]) {
    if (p.categoria === CATEGORIA_COMPLEMENTO) continue;
    progIds.push(p.id);
  }
  if (progIds.length === 0) return;

  const { data: actRows, error: e3 } = await vu.sb
    .from("actividades")
    .select("id, progresion_id")
    .in("progresion_id", progIds);
  lanzarSiError(e3, "progresoDetalle.actividades");

  const actIds = (actRows ?? []).map((a: { id: string }) => a.id);
  if (actIds.length === 0) return;

  const { error: e4 } = await vu.sb
    .from("intentos")
    .select("actividad_id, completed_at")
    .eq("user_id", vu.userId)
    .in("actividad_id", actIds)
    .eq("status", "completed");
  lanzarSiError(e4, "progresoDetalle.intentos");
}

// ── resumen: las 3 consultas en paralelo de getResumenActividadAlumno ──────────
export async function escResumen(vu: VU): Promise<void> {
  const desde = fechaInicioVentana30Dias();
  const [recientesRes, calendarioRes, statsRes] = await Promise.all([
    vu.sb
      .from("intentos")
      .select(
        `id, completed_at,
         actividades!actividad_id!inner (
           titulo, tipo_codigo,
           progresiones!progresion_id ( uac!uac_id ( codigo ) )
         )`
      )
      .eq("user_id", vu.userId)
      .eq("status", "completed")
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(15),
    vu.sb
      .from("intentos")
      .select(
        `completed_at,
         actividades!actividad_id!inner (
           progresiones!progresion_id ( uac!uac_id ( codigo ) )
         )`
      )
      .eq("user_id", vu.userId)
      .eq("status", "completed")
      .not("completed_at", "is", null)
      .gte("completed_at", desde)
      .order("completed_at", { ascending: false }),
    vu.sb.rpc("resumen_stats_alumno"),
  ]);

  lanzarSiError(recientesRes.error, "resumen.recientes");
  lanzarSiError(calendarioRes.error, "resumen.calendario");
  // La RPC puede no existir aún (migración 23 se aplica a mano). En la app eso
  // NO es error (hay fallback legacy), así que aquí igual: solo lanzamos si el
  // error NO es "función inexistente".
  if (statsRes.error && !esRpcInexistente(statsRes.error)) {
    lanzarSiError(statsRes.error, "resumen.stats");
  }
}

// ── escritura: insert en intentos (SOLO --writes, solo cuentas sintéticas) ─────
export async function escEscritura(vu: VU): Promise<void> {
  if (!vu.actividadIds || vu.actividadIds.length === 0) {
    // Cargar una vez los ids de actividad del semestre para poder escribir.
    const { data: uacRows } = await vu.sb
      .from("uac")
      .select("id")
      .eq("semestre", vu.semestre)
      .limit(1);
    const uacId = (uacRows as { id: string }[] | null)?.[0]?.id;
    if (!uacId) throw new Error("escritura: sin UAC para el semestre");
    const { data: progRows } = await vu.sb
      .from("progresiones")
      .select("id")
      .eq("uac_id", uacId)
      .limit(3);
    const progIds = (progRows ?? []).map((p: { id: string }) => p.id);
    if (progIds.length === 0) throw new Error("escritura: sin progresiones");
    const { data: actRows } = await vu.sb
      .from("actividades")
      .select("id")
      .in("progresion_id", progIds)
      .limit(50);
    vu.actividadIds = (actRows ?? []).map((a: { id: string }) => a.id);
    if (vu.actividadIds.length === 0) throw new Error("escritura: sin actividades");
  }

  const actId = vu.actividadIds[Math.floor(Math.random() * vu.actividadIds.length)];
  const ahora = new Date().toISOString();
  const { error } = await vu.sb.from("intentos").insert({
    user_id: vu.userId,
    actividad_id: actId,
    status: "completed",
    score: 100,
    tiempo_segundos: 42,
    respuestas: { carga: true } as never,
    started_at: ahora,
    completed_at: ahora,
  });
  lanzarSiError(error, "escritura.insert");
}

// ── helpers (equivalentes a progreso-shared) ──────────────────────────────────
function fechaInicioVentana30Dias(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString();
}

function esRpcInexistente(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: string; message?: string };
  return (
    e.code === "PGRST202" ||
    (typeof e.message === "string" &&
      /function .* does not exist|could not find the function/i.test(e.message))
  );
}

export type NombreEscenario = "snapshot" | "progresoDetalle" | "resumen" | "escritura";

export const ESCENARIOS: Record<NombreEscenario, (vu: VU) => Promise<void>> = {
  snapshot: escSnapshot,
  progresoDetalle: escProgresoDetalle,
  resumen: escResumen,
  escritura: escEscritura,
};

/**
 * Hub queries — centralizadas aquí per arquitectura.
 * Todas usan getSupabaseServer() (server-side, sesión del alumno).
 */

import { getSupabaseServer } from "@/lib/supabase-helpers";
import { CATEGORIA_COMPLEMENTO } from "@/lib/mccems/categorias";
import { withTimeout, withTimeoutOrThrow } from "@/lib/with-timeout";
import { getRespuestas } from "@/lib/r2-respuestas";

// Timeout budget for the Supabase query chain inside each function below.
// On timeout (or any rejection), each function resolves to its own
// already-established "nothing found" fallback instead of hanging/throwing.
const QUERY_TIMEOUT_MS = 3500;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ContinuarData {
  progresionId: string;
  progresionNumero: number;
  progresionTitulo: string;
  uacCodigo: string;
  uacNombre: string;
  uacRscCodigo: string;
  actividadOrden: number;
  actividadTitulo: string;
  actividadTipo: string;
  actividadesCompletadas: number;
  totalActividades: number;
}

export interface ActividadConEstado {
  id: string;
  codigo: string;
  titulo: string;
  tipo: string;
  orden: number;
  estado: "no_iniciada" | "en_progreso" | "completada";
  intentoId: string | null;
}

export interface ProgresionConEstado {
  id: string;
  numero: number;
  titulo: string;
  descripcion: string | null;
  tiempo_estimado_horas: number | null;
  ejes_articuladores: string[] | null;
  transversalidades: string[] | null;
  estado: "no_iniciada" | "en_progreso" | "completada";
  actividadesCompletadas: number;
  totalActividades: number;
  actividades?: ActividadConEstado[];
}

export interface ProgresoSemestre {
  totalProgresiones: number;
  progresionesCompletadas: number;
  actividadesEstaSemana: number;
  minutosEstaSemana: number;
  porcentaje: number;
}

export interface RachaData {
  diasConsecutivos: number;
  ultimos7Dias: { fecha: string; activo: boolean }[];
}

// ─── getUltimaActividadActiva ─────────────────────────────────────────────────

/**
 * Devuelve la actividad por la que el alumno debe "continuar": la primera de su
 * semestre (en orden por código) que aún no ha completado. Si ya completó todas,
 * devuelve la última. Los intentos se guardan ya como "completed" (no existe un
 * estado "in_progress" persistido), así que el avance se deriva de las completadas.
 */
export async function getUltimaActividadActiva(
  userId: string,
  semestre: number
): Promise<ContinuarData | null> {
  const sb = await getSupabaseServer();

  return withTimeout(
    (async (): Promise<ContinuarData | null> => {
      // 1. UACs del semestre (con nombre, para no re-consultar después)
      const { data: uacRows } = await sb
        .from("uac")
        .select("id, codigo, nombre")
        .eq("semestre", semestre);
      if (!uacRows || uacRows.length === 0) return null;
      const uacById = new Map(uacRows.map((u) => [u.id, u] as const));

      // 2. Progresiones publicadas del semestre (con título)
      const { data: progRows } = await sb
        .from("progresiones")
        .select("id, numero, titulo, uac_id")
        .in("uac_id", uacRows.map((u) => u.id))
        .eq("es_placeholder", false);
      if (!progRows || progRows.length === 0) return null;
      const progById = new Map(progRows.map((p) => [p.id, p] as const));

      // 3. Todas las actividades del semestre, ordenadas por código
      const { data: actRows } = await sb
        .from("actividades")
        .select("id, codigo, titulo, tipo, progresion_id")
        .in("progresion_id", progRows.map((p) => p.id))
        .order("codigo");
      if (!actRows || actRows.length === 0) return null;

      // 4. Actividades ya completadas por el alumno
      const { data: completadosData } = await sb
        .from("intentos")
        .select("actividad_id")
        .eq("user_id", userId)
        .eq("status", "completed")
        .in("actividad_id", actRows.map((a) => a.id));
      const completadasSet = new Set(completadosData?.map((i) => i.actividad_id) ?? []);

      // 5. "Continuar" = primera actividad no completada (en orden por código); si el
      //    alumno ya completó todo el semestre, la última. Antes este paso consultaba
      //    intentos con status "in_progress", que nunca se escriben (los intentos se
      //    guardan ya como "completed"), así que el resultado siempre era la actividad 1.
      const siguiente = actRows.find((a) => !completadasSet.has(a.id)) ?? actRows[actRows.length - 1];
      if (!siguiente?.progresion_id) return null;

      const prog = progById.get(siguiente.progresion_id);
      if (!prog?.uac_id) return null;

      const uac = uacById.get(prog.uac_id);
      if (!uac) return null;

      // 6. Info estática de la UAC para rscCodigo
      const { getUACPorCodigo } = await import("@/lib/mccems/estructura");
      const uacStatic = getUACPorCodigo(uac.codigo);

      // 7. Conteo de actividades de la progresión y completadas (derivado en memoria)
      const actsDeProg = actRows.filter((a) => a.progresion_id === prog.id);
      const totalActividades = actsDeProg.length || 3;
      const completadas = actsDeProg.filter((a) => completadasSet.has(a.id)).length;

      // 8. Extract orden from codigo (last char: A1, A2, A3 → 1, 2, 3)
      const ordenMatch = siguiente.codigo.match(/-A(\d+)$/);
      const orden = ordenMatch?.[1] ? parseInt(ordenMatch[1]) : 1;

      return {
        progresionId: prog.id,
        progresionNumero: prog.numero,
        progresionTitulo: prog.titulo,
        uacCodigo: uac.codigo,
        uacNombre: uac.nombre,
        uacRscCodigo: uacStatic?.recursoCodigo ?? "RSC-LC",
        actividadOrden: orden,
        actividadTitulo: siguiente.titulo,
        actividadTipo: siguiente.tipo,
        actividadesCompletadas: completadas,
        totalActividades,
      };
    })(),
    QUERY_TIMEOUT_MS,
    null
  );
}

// ─── getProgresionesConEstado ─────────────────────────────────────────────────

/**
 * Returns all progresiones for a UAC with student status.
 */
export async function getProgresionesConEstado(
  codigoUAC: string,
  userId: string
): Promise<ProgresionConEstado[]> {
  const sb = await getSupabaseServer();

  return withTimeout(
    (async (): Promise<ProgresionConEstado[]> => {
      // Get UAC id
      const { data: uacRow } = await sb
        .from("uac")
        .select("id")
        .eq("codigo", codigoUAC)
        .single();

      if (!uacRow) return [];

      // Get all progresiones
      const { data: progs } = await sb
        .from("progresiones")
        .select("id, numero, titulo, descripcion, tiempo_estimado_horas, ejes_articuladores, transversalidades")
        .eq("uac_id", uacRow.id)
        .eq("es_placeholder", false)
        .order("numero");

      if (!progs || progs.length === 0) return [];

      const progIds = progs.map((p) => p.id);

      // Get all actividades for these progresiones
      const { data: allActs } = await sb
        .from("actividades")
        .select("id, codigo, titulo, tipo, progresion_id")
        .in("progresion_id", progIds)
        .order("codigo");

      const allActIds = (allActs ?? []).map((a) => a.id);

      // Get student's intentos for all these activities
      const intentosByActId: Map<string, "in_progress" | "completed"> = new Map();
      const intentoIdByActId: Map<string, string> = new Map();
      if (allActIds.length > 0) {
        const { data: intentos } = await sb
          .from("intentos")
          .select("id, actividad_id, status, started_at")
          .eq("user_id", userId)
          .in("actividad_id", allActIds)
          .order("started_at", { ascending: false });

        // Keep only the most recent intento per actividad
        for (const i of intentos ?? []) {
          if (!intentosByActId.has(i.actividad_id)) {
            intentosByActId.set(i.actividad_id, i.status as "in_progress" | "completed");
            intentoIdByActId.set(i.actividad_id, i.id);
          }
        }
      }

      // Build result
      return progs.map((prog) => {
        const actsForProg = (allActs ?? [])
          .filter((a) => a.progresion_id === prog.id)
          .map((a) => {
            const ordenMatch = a.codigo.match(/-A(\d+)$/);
            const orden = ordenMatch?.[1] ? parseInt(ordenMatch[1]) : 1;
            const intentoStatus = intentosByActId.get(a.id);
            return {
              id: a.id,
              codigo: a.codigo,
              titulo: a.titulo,
              tipo: a.tipo,
              orden,
              estado: (intentoStatus === "completed"
                ? "completada"
                : intentoStatus === "in_progress"
                  ? "en_progreso"
                  : "no_iniciada") as "no_iniciada" | "en_progreso" | "completada",
              intentoId: intentoIdByActId.get(a.id) ?? null,
            };
          })
          .sort((a, b) => a.orden - b.orden);

        const totalActs = actsForProg.length;
        const completadas = actsForProg.filter((a) => a.estado === "completada").length;
        const hayEnProgreso = actsForProg.some((a) => a.estado === "en_progreso");

        let estado: "no_iniciada" | "en_progreso" | "completada" = "no_iniciada";
        if (completadas === totalActs && totalActs > 0) estado = "completada";
        else if (completadas > 0 || hayEnProgreso) estado = "en_progreso";

        return {
          id: prog.id,
          numero: prog.numero,
          titulo: prog.titulo,
          descripcion: prog.descripcion,
          tiempo_estimado_horas: prog.tiempo_estimado_horas,
          ejes_articuladores: prog.ejes_articuladores,
          transversalidades: prog.transversalidades,
          estado,
          actividadesCompletadas: completadas,
          totalActividades: totalActs,
          actividades: actsForProg,
        };
      });
    })(),
    QUERY_TIMEOUT_MS,
    []
  );
}

// ─── getSiguienteProgresion ───────────────────────────────────────────────────

/**
 * Siguiente propósito formativo (la progresión con el menor `numero` mayor al
 * actual) de la misma UAC, o null si el actual es el último. Alimenta el CTA
 * "Siguiente propósito →" al completar una progresión. Consulta ligera: solo
 * numero + titulo, sin actividades ni intentos.
 */
export async function getSiguienteProgresion(
  codigoUAC: string,
  numeroActual: number
): Promise<{ numero: number; titulo: string } | null> {
  const sb = await getSupabaseServer();

  return withTimeout(
    (async (): Promise<{ numero: number; titulo: string } | null> => {
      const { data: uacRow } = await sb
        .from("uac")
        .select("id")
        .eq("codigo", codigoUAC)
        .single();
      if (!uacRow) return null;

      const { data: sig } = await sb
        .from("progresiones")
        .select("numero, titulo")
        .eq("uac_id", uacRow.id)
        .eq("es_placeholder", false)
        .gt("numero", numeroActual)
        .order("numero")
        .limit(1)
        .maybeSingle();

      return sig ?? null;
    })(),
    QUERY_TIMEOUT_MS,
    null
  );
}

// ─── getActividadesConEstado ──────────────────────────────────────────────────

async function fetchActividadesConEstado(
  codigoUAC: string,
  progNumero: number,
  userId: string
): Promise<{ progresion: ProgresionConEstado | null; actividades: ActividadConEstado[] }> {
  const sb = await getSupabaseServer();

  return (async (): Promise<{ progresion: ProgresionConEstado | null; actividades: ActividadConEstado[] }> => {
      const { data: uacRow, error: uacError } = await sb
        .from("uac")
        .select("id")
        .eq("codigo", codigoUAC)
        .single();

      if (uacError) console.error("[getActividadesConEstado] UAC lookup error:", uacError, { codigoUAC });
      if (!uacRow) return { progresion: null, actividades: [] };

      const { data: prog, error: progError } = await sb
        .from("progresiones")
        .select("id, numero, titulo, descripcion, tiempo_estimado_horas, ejes_articuladores, transversalidades")
        .eq("uac_id", uacRow.id)
        .eq("numero", progNumero)
        .maybeSingle();

      if (progError) console.error("[getActividadesConEstado] Progresion lookup error:", progError, { uacId: uacRow.id, progNumero });
      if (!prog) return { progresion: null, actividades: [] };

      const { data: acts, error: actsError } = await sb
        .from("actividades")
        .select("id, codigo, titulo, tipo")
        .eq("progresion_id", prog.id)
        .order("codigo");

      if (actsError) {
        console.error("[getActividadesConEstado] Supabase error fetching actividades:", actsError, { codigoUAC, progNumero, progresionId: prog.id });
      }

      if (!actsError && acts && acts.length === 0) {
        console.warn("[getActividadesConEstado] Query OK but no actividades found for progresion_id:", prog.id, { codigoUAC, progNumero });
      }

      if (!acts || acts.length === 0)
        return {
          progresion: { ...prog, estado: "no_iniciada", actividadesCompletadas: 0, totalActividades: 0 },
          actividades: [],
        };

      const actIds = acts.map((a) => a.id);
      const { data: intentos } = await sb
        .from("intentos")
        .select("id, actividad_id, status, started_at")
        .eq("user_id", userId)
        .in("actividad_id", actIds)
        .order("started_at", { ascending: false });

      const intentoMap = new Map<string, { status: string; id: string }>();
      for (const i of intentos ?? []) {
        if (!intentoMap.has(i.actividad_id)) {
          intentoMap.set(i.actividad_id, { status: i.status, id: i.id });
        }
      }

      const actividades: ActividadConEstado[] = acts.map((a) => {
        const ordenMatch = a.codigo.match(/-A(\d+)$/);
        const orden = ordenMatch?.[1] ? parseInt(ordenMatch[1]) : 1;
        const intento = intentoMap.get(a.id);
        return {
          id: a.id,
          codigo: a.codigo,
          titulo: a.titulo,
          tipo: a.tipo,
          orden,
          estado: (intento?.status === "completed"
            ? "completada"
            : intento?.status === "in_progress"
              ? "en_progreso"
              : "no_iniciada") as "no_iniciada" | "en_progreso" | "completada",
          intentoId: intento?.id ?? null,
        };
      }).sort((a, b) => a.orden - b.orden);

      const completadas = actividades.filter((a) => a.estado === "completada").length;
      const hayEnProgreso = actividades.some((a) => a.estado === "en_progreso");
      let estadoProg: "no_iniciada" | "en_progreso" | "completada" = "no_iniciada";
      if (completadas === actividades.length && actividades.length > 0) estadoProg = "completada";
      else if (completadas > 0 || hayEnProgreso) estadoProg = "en_progreso";

      return {
        progresion: {
          ...prog,
          estado: estadoProg,
          actividadesCompletadas: completadas,
          totalActividades: actividades.length,
        },
        actividades,
      };
  })();
}

/**
 * Returns activities for a progresion (by numero) with student status.
 * Degrada a `{ progresion: null, actividades: [] }` en timeout — apto para
 * llamadas donde ese resultado no dispara notFound()/redirect() (p.ej. la
 * lista lateral de actividades en la página de actividad individual).
 */
export async function getActividadesConEstado(
  codigoUAC: string,
  progNumero: number,
  userId: string
): Promise<{ progresion: ProgresionConEstado | null; actividades: ActividadConEstado[] }> {
  return withTimeout(
    fetchActividadesConEstado(codigoUAC, progNumero, userId),
    QUERY_TIMEOUT_MS,
    { progresion: null, actividades: [] }
  );
}

/**
 * Misma consulta que {@link getActividadesConEstado}, pero relanza en vez de
 * degradar en timeout/error. Usar donde `progresion: null` se interpreta
 * como "no existe" y dispara notFound()/redirect() — sin esto, una consulta
 * lenta-pero-exitosa se confunde con una ausencia real (ver src/app/hub/error.tsx).
 */
export async function getActividadesConEstadoOrThrow(
  codigoUAC: string,
  progNumero: number,
  userId: string
): Promise<{ progresion: ProgresionConEstado | null; actividades: ActividadConEstado[] }> {
  return withTimeoutOrThrow(
    fetchActividadesConEstado(codigoUAC, progNumero, userId),
    QUERY_TIMEOUT_MS
  );
}

// ─── getProgresoSemestre ──────────────────────────────────────────────────────

export async function getProgresoSemestre(
  userId: string,
  semestre: number
): Promise<ProgresoSemestre> {
  const sb = await getSupabaseServer();
  const vacio: ProgresoSemestre = { totalProgresiones: 0, progresionesCompletadas: 0, actividadesEstaSemana: 0, minutosEstaSemana: 0, porcentaje: 0 };

  return withTimeout(
    (async (): Promise<ProgresoSemestre> => {
      const { data: uacRows } = await sb
        .from("uac")
        .select("id")
        .eq("semestre", semestre);

      if (!uacRows || uacRows.length === 0) {
        return { totalProgresiones: 0, progresionesCompletadas: 0, actividadesEstaSemana: 0, minutosEstaSemana: 0, porcentaje: 0 };
      }

      const uacIds = uacRows.map((u) => u.id);

      const { data: progs } = await sb
        .from("progresiones")
        .select("id, categoria")
        .in("uac_id", uacIds)
        .eq("es_placeholder", false);

      // Solo cuentan los propósitos oficiales 2025; los complementos no inflan la meta.
      const oficiales = (progs ?? []).filter((p) => p.categoria !== CATEGORIA_COMPLEMENTO);
      const totalProgresiones = oficiales.length;
      if (totalProgresiones === 0) {
        return { totalProgresiones: 0, progresionesCompletadas: 0, actividadesEstaSemana: 0, minutosEstaSemana: 0, porcentaje: 0 };
      }

      const progIds = oficiales.map((p) => p.id);

      const { data: allActs } = await sb
        .from("actividades")
        .select("id, progresion_id")
        .in("progresion_id", progIds);

      const actIds = (allActs ?? []).map((a) => a.id);

      if (actIds.length === 0) {
        return { totalProgresiones, progresionesCompletadas: 0, actividadesEstaSemana: 0, minutosEstaSemana: 0, porcentaje: 0 };
      }

      // Get all completed intentos
      const { data: completedIntentos } = await sb
        .from("intentos")
        .select("actividad_id, tiempo_segundos, started_at")
        .eq("user_id", userId)
        .eq("status", "completed")
        .in("actividad_id", actIds);

      // Count completed progresiones (all activities completed)
      const completedByProg = new Map<string, Set<string>>();
      for (const act of allActs ?? []) {
        if (!act.progresion_id) continue;
        if (!completedByProg.has(act.progresion_id)) {
          completedByProg.set(act.progresion_id, new Set());
        }
      }
      const completedActIds = new Set(completedIntentos?.map((i) => i.actividad_id) ?? []);
      for (const act of allActs ?? []) {
        if (!act.progresion_id) continue;
        if (completedActIds.has(act.id)) {
          completedByProg.get(act.progresion_id)?.add(act.id);
        }
      }

      // A progresion is complete when all its activities are completed
      const actsByProg = new Map<string, string[]>();
      for (const act of allActs ?? []) {
        if (!act.progresion_id) continue;
        if (!actsByProg.has(act.progresion_id)) actsByProg.set(act.progresion_id, []);
        actsByProg.get(act.progresion_id)!.push(act.id);
      }

      let progresionesCompletadas = 0;
      for (const [progId, acts] of actsByProg) {
        const completed = completedByProg.get(progId) ?? new Set();
        if (acts.every((id) => completed.has(id))) progresionesCompletadas++;
      }

      // This week stats
      const inicioSemana = new Date();
      inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
      inicioSemana.setHours(0, 0, 0, 0);

      const thisWeek = (completedIntentos ?? []).filter(
        (i) => new Date(i.started_at) >= inicioSemana
      );
      const actividadesEstaSemana = thisWeek.length;
      const minutosEstaSemana = Math.round(
        thisWeek.reduce((sum, i) => sum + (i.tiempo_segundos ?? 0), 0) / 60
      );

      const porcentaje = totalProgresiones > 0
        ? Math.round((progresionesCompletadas / totalProgresiones) * 100)
        : 0;

      return { totalProgresiones, progresionesCompletadas, actividadesEstaSemana, minutosEstaSemana, porcentaje };
    })(),
    QUERY_TIMEOUT_MS,
    vacio
  );
}

// ─── getRachaDelAlumno ────────────────────────────────────────────────────────

export async function getRachaDelAlumno(userId: string): Promise<RachaData> {
  const sb = await getSupabaseServer();

  // Fallback skeleton on timeout/error: same 7-day shape the UI expects,
  // just with no activity (no Supabase data available to derive it from).
  const hoyFallback = new Date();
  const ultimos7DiasFallback = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(hoyFallback);
    d.setDate(d.getDate() - (6 - i));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return { fecha: key, activo: false };
  });

  return withTimeout(
    (async (): Promise<RachaData> => {
      const hace30Dias = new Date();
      hace30Dias.setDate(hace30Dias.getDate() - 30);

      const { data: intentos } = await sb
        .from("intentos")
        .select("started_at")
        .eq("user_id", userId)
        .gte("started_at", hace30Dias.toISOString())
        .order("started_at", { ascending: false });

      // Collect unique activity dates
      const activeDates = new Set<string>();
      for (const i of intentos ?? []) {
        const d = new Date(i.started_at);
        activeDates.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
      }

      // Calculate consecutive days from today backwards
      let diasConsecutivos = 0;
      const hoy = new Date();
      for (let i = 0; i < 30; i++) {
        const d = new Date(hoy);
        d.setDate(d.getDate() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        if (activeDates.has(key)) {
          diasConsecutivos++;
        } else {
          break;
        }
      }

      // Last 7 days
      const ultimos7Dias = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(hoy);
        d.setDate(d.getDate() - (6 - i));
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        return { fecha: key, activo: activeDates.has(key) };
      });

      return { diasConsecutivos, ultimos7Dias };
    })(),
    QUERY_TIMEOUT_MS,
    { diasConsecutivos: 0, ultimos7Dias: ultimos7DiasFallback }
  );
}

// ─── getActividadConContenido ─────────────────────────────────────────────────

/**
 * Fetches a single activity with its full contenido for the activity runner.
 * Looks up by (uacCodigo, progresionNumero, orden) — orden is extracted from codigo suffix -A{n}.
 */
export async function getActividadConContenido(
  codigoUAC: string,
  progNumero: number,
  orden: number,
  userId: string
): Promise<{
  id: string;
  codigo: string;
  titulo: string;
  descripcion: string | null;
  tipo: string;
  contenido: unknown;
  estado: "no_iniciada" | "en_progreso" | "completada";
  intentoId: string | null;
  respuestasIntento: Record<string, string> | null;
  nivel_revision: string | null;
  practica_slug: string | null;
} | null> {
  const sb = await getSupabaseServer();

  return withTimeoutOrThrow(
    (async () => {
      const { data: uacRow } = await sb
        .from("uac")
        .select("id")
        .eq("codigo", codigoUAC)
        .single();

      if (!uacRow) return null;

      const { data: prog } = await sb
        .from("progresiones")
        .select("id")
        .eq("uac_id", uacRow.id)
        .eq("numero", progNumero)
        .maybeSingle();

      if (!prog) return null;

      // Paso 1/2: query LIGERA (sin "contenido", que puede ser un jsonb
      // pesado) de todas las actividades de la progresión, solo para
      // resolver cuál id corresponde al sufijo -A{orden} del código. Antes
      // esto se resolvía descargando el "contenido" completo de TODAS las
      // actividades de la progresión para usar solo una — con progresiones
      // largas eso es transferencia desperdiciada en cada carga del runner.
      const { data: actsLigero } = await sb
        .from("actividades")
        .select("id, codigo")
        .eq("progresion_id", prog.id)
        .order("codigo");

      if (!actsLigero) return null;

      const actLigero = actsLigero.find((a) => {
        const m = a.codigo.match(/-A(\d+)$/);
        return m?.[1] ? parseInt(m[1]) === orden : false;
      });

      if (!actLigero) return null;

      // Paso 2/2: ahora sí, "contenido" (y el resto de columnas pesadas)
      // pero de SOLO esa actividad.
      const { data: act } = await sb
        .from("actividades")
        .select("id, codigo, titulo, descripcion, tipo, contenido, nivel_revision, practica_slug")
        .eq("id", actLigero.id)
        .maybeSingle();

      if (!act) return null;

      // Get student's latest intento for this activity
      const { data: intento } = await sb
        .from("intentos")
        .select("id, status, respuestas")
        .eq("user_id", userId)
        .eq("actividad_id", act.id)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const estado =
        intento?.status === "completed"
          ? "completada"
          : intento?.status === "in_progress"
            ? "en_progreso"
            : "no_iniciada";

      let respuestasRaw = intento?.respuestas;
      // Marcador dejado por entregar-actividad.ts cuando "respuestas" superó
      // el umbral y se descargó a R2 en vez de vivir en el jsonb de Postgres.
      // Si el objeto no existe en R2 (o no hay binding, p.ej. `next dev`
      // local/Jest) se trata como sin datos: los componentes de actividad ya
      // muestran un estado neutral de revisión cuando respuestasIntento es
      // null/vacío, así que degradar a null aquí nunca rompe la pantalla.
      if (
        respuestasRaw &&
        typeof respuestasRaw === "object" &&
        !Array.isArray(respuestasRaw) &&
        (respuestasRaw as Record<string, unknown>).__r2 === 1
      ) {
        respuestasRaw = (await getRespuestas(userId, act.id)) as typeof respuestasRaw;
      }

      const respuestasIntento: Record<string, string> | null =
        respuestasRaw && typeof respuestasRaw === "object" && !Array.isArray(respuestasRaw)
          ? Object.fromEntries(
              Object.entries(respuestasRaw as Record<string, unknown>).map(([k, v]) => [k, String(v)])
            )
          : null;

      return {
        id: act.id,
        codigo: act.codigo,
        titulo: act.titulo,
        descripcion: act.descripcion,
        tipo: act.tipo,
        contenido: act.contenido,
        estado: estado as "no_iniciada" | "en_progreso" | "completada",
        intentoId: intento?.id ?? null,
        respuestasIntento,
        nivel_revision: act.nivel_revision ?? null,
        practica_slug: act.practica_slug ?? null,
      };
    })(),
    QUERY_TIMEOUT_MS
  );
}

// ─── getProgresionesCompletadasDeUAC ─────────────────────────────────────────

/**
 * Returns count of completed progresiones for a UAC for the sidebar/cards.
 */
export async function getProgresionesCompletadasDeUAC(
  codigoUAC: string,
  userId: string
): Promise<{ completadas: number; total: number; ultimaActividad: string | null }> {
  const sb = await getSupabaseServer();

  return withTimeout(
    (async (): Promise<{ completadas: number; total: number; ultimaActividad: string | null }> => {
      const { data: uacRow } = await sb
        .from("uac")
        .select("id")
        .eq("codigo", codigoUAC)
        .single();

      if (!uacRow) return { completadas: 0, total: 0, ultimaActividad: null };

      const { data: progs } = await sb
        .from("progresiones")
        .select("id")
        .eq("uac_id", uacRow.id)
        .eq("es_placeholder", false);

      const total = progs?.length ?? 0;
      if (total === 0) return { completadas: 0, total: 0, ultimaActividad: null };

      const progIds = (progs ?? []).map((p) => p.id);

      const { data: acts } = await sb
        .from("actividades")
        .select("id, progresion_id")
        .in("progresion_id", progIds);

      const actIds = (acts ?? []).map((a) => a.id);
      if (actIds.length === 0) return { completadas: 0, total, ultimaActividad: null };

      const { data: intentos } = await sb
        .from("intentos")
        .select("actividad_id, status, started_at")
        .eq("user_id", userId)
        .in("actividad_id", actIds)
        .order("started_at", { ascending: false });

      const completedSet = new Set<string>();
      let ultimaActividad: string | null = null;

      for (const i of intentos ?? []) {
        if (!ultimaActividad) ultimaActividad = i.started_at;
        if (i.status === "completed") completedSet.add(i.actividad_id);
      }

      // Group acts by progresion
      const actsByProg = new Map<string, string[]>();
      for (const a of acts ?? []) {
        if (!a.progresion_id) continue;
        if (!actsByProg.has(a.progresion_id)) actsByProg.set(a.progresion_id, []);
        actsByProg.get(a.progresion_id)!.push(a.id);
      }

      let completadas = 0;
      for (const [, actList] of actsByProg) {
        if (actList.every((id) => completedSet.has(id))) completadas++;
      }

      return { completadas, total, ultimaActividad };
    })(),
    QUERY_TIMEOUT_MS,
    { completadas: 0, total: 0, ultimaActividad: null }
  );
}

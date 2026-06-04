/**
 * Hub queries — centralizadas aquí per arquitectura.
 * Todas usan getSupabaseServer() (server-side, sesión del alumno).
 */

import { getSupabaseServer } from "@/lib/supabase-helpers";

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
  xp: number;
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
 * Devuelve la última actividad en progreso del alumno, o la primera no iniciada
 * de su semestre si no hay ninguna en progreso.
 */
export async function getUltimaActividadActiva(
  userId: string,
  semestre: number
): Promise<ContinuarData | null> {
  const sb = await getSupabaseServer();

  // 1. Buscar intento en progreso más reciente
  const { data: intentoRaw } = await sb
    .from("intentos")
    .select("id, actividad_id, status, started_at")
    .eq("user_id", userId)
    .eq("status", "in_progress")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let actividadId: string | null = intentoRaw?.actividad_id ?? null;

  // 2. Si no hay en progreso, buscar la primera actividad no completada del semestre
  if (!actividadId) {
    const { data: uacRows } = await sb
      .from("uac")
      .select("id, codigo")
      .eq("semestre", semestre);

    if (!uacRows || uacRows.length === 0) return null;

    const uacIds = uacRows.map((u) => u.id);

    const { data: progRows } = await sb
      .from("progresiones")
      .select("id, numero, uac_id")
      .in("uac_id", uacIds)
      .eq("es_placeholder", false)
      .order("numero");

    if (!progRows || progRows.length === 0) return null;

    const progIds = progRows.map((p) => p.id);

    // Get first activity of first progresion
    const { data: actRow } = await sb
      .from("actividades")
      .select("id, codigo")
      .in("progresion_id", progIds)
      .order("codigo")
      .limit(1)
      .maybeSingle();

    if (!actRow) return null;
    actividadId = actRow.id;
  }

  // 3. Get activity details
  const { data: act } = await sb
    .from("actividades")
    .select("id, codigo, titulo, tipo, progresion_id")
    .eq("id", actividadId)
    .single();

  if (!act?.progresion_id) return null;

  // 4. Get progresion
  const { data: prog } = await sb
    .from("progresiones")
    .select("id, numero, titulo, uac_id")
    .eq("id", act.progresion_id)
    .single();

  if (!prog?.uac_id) return null;

  // 5. Get UAC
  const { data: uac } = await sb
    .from("uac")
    .select("id, codigo, nombre")
    .eq("id", prog.uac_id)
    .single();

  if (!uac) return null;

  // 6. Get UAC static info for rscCodigo
  const { getUACPorCodigo } = await import("@/lib/mccems/estructura");
  const uacStatic = getUACPorCodigo(uac.codigo);

  // 7. Count completed activities in this progresion
  const { data: allActs } = await sb
    .from("actividades")
    .select("id, codigo")
    .eq("progresion_id", prog.id)
    .order("codigo");

  const totalActividades = allActs?.length ?? 3;
  const actIds = (allActs ?? []).map((a) => a.id);

  let completadas = 0;
  if (actIds.length > 0) {
    const { data: completadosData } = await sb
      .from("intentos")
      .select("actividad_id")
      .eq("user_id", userId)
      .eq("status", "completed")
      .in("actividad_id", actIds);
    const uniqueCompleted = new Set(completadosData?.map((i) => i.actividad_id) ?? []);
    completadas = uniqueCompleted.size;
  }

  // 8. Extract orden from codigo (last char: A1, A2, A3 → 1, 2, 3)
  const ordenMatch = act.codigo.match(/-A(\d+)$/);
  const orden = ordenMatch?.[1] ? parseInt(ordenMatch[1]) : 1;

  return {
    progresionId: prog.id,
    progresionNumero: prog.numero,
    progresionTitulo: prog.titulo,
    uacCodigo: uac.codigo,
    uacNombre: uac.nombre,
    uacRscCodigo: uacStatic?.recursoCodigo ?? "RSC-LC",
    actividadOrden: orden,
    actividadTitulo: act.titulo,
    actividadTipo: act.tipo,
    actividadesCompletadas: completadas,
    totalActividades,
  };
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
    .select("id, codigo, titulo, tipo, xp, progresion_id")
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
          xp: a.xp,
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
}

// ─── getActividadesConEstado ──────────────────────────────────────────────────

/**
 * Returns activities for a progresion (by numero) with student status.
 */
export async function getActividadesConEstado(
  codigoUAC: string,
  progNumero: number,
  userId: string
): Promise<{ progresion: ProgresionConEstado | null; actividades: ActividadConEstado[] }> {
  const sb = await getSupabaseServer();

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
    .select("id, codigo, titulo, tipo, xp")
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
      xp: a.xp,
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
}

// ─── getProgresoSemestre ──────────────────────────────────────────────────────

export async function getProgresoSemestre(
  userId: string,
  semestre: number
): Promise<ProgresoSemestre> {
  const sb = await getSupabaseServer();

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
    .select("id")
    .in("uac_id", uacIds)
    .eq("es_placeholder", false);

  const totalProgresiones = progs?.length ?? 0;
  if (totalProgresiones === 0) {
    return { totalProgresiones: 0, progresionesCompletadas: 0, actividadesEstaSemana: 0, minutosEstaSemana: 0, porcentaje: 0 };
  }

  const progIds = (progs ?? []).map((p) => p.id);

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
    if (!completedByProg.has(act.progresion_id!)) {
      completedByProg.set(act.progresion_id!, new Set());
    }
  }
  const completedActIds = new Set(completedIntentos?.map((i) => i.actividad_id) ?? []);
  for (const act of allActs ?? []) {
    if (completedActIds.has(act.id)) {
      completedByProg.get(act.progresion_id!)?.add(act.id);
    }
  }

  // A progresion is complete when all its activities are completed
  const actsByProg = new Map<string, string[]>();
  for (const act of allActs ?? []) {
    if (!actsByProg.has(act.progresion_id!)) actsByProg.set(act.progresion_id!, []);
    actsByProg.get(act.progresion_id!)!.push(act.id);
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
}

// ─── getRachaDelAlumno ────────────────────────────────────────────────────────

export async function getRachaDelAlumno(userId: string): Promise<RachaData> {
  const sb = await getSupabaseServer();

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
  xp: number;
  contenido: unknown;
  estado: "no_iniciada" | "en_progreso" | "completada";
  intentoId: string | null;
  respuestasIntento: Record<string, string> | null;
  nivel_revision: string | null;
  practica_slug: string | null;
} | null> {
  const sb = await getSupabaseServer();

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

  // Get all activities for this progresion and find by order suffix
  const { data: acts } = await sb
    .from("actividades")
    .select("id, codigo, titulo, descripcion, tipo, xp, contenido, nivel_revision, practica_slug")
    .eq("progresion_id", prog.id)
    .order("codigo");

  if (!acts) return null;

  const act = acts.find((a) => {
    const m = a.codigo.match(/-A(\d+)$/);
    return m?.[1] ? parseInt(m[1]) === orden : false;
  });

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

  const respuestasRaw = intento?.respuestas;
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
    xp: act.xp,
    contenido: act.contenido,
    estado: estado as "no_iniciada" | "en_progreso" | "completada",
    intentoId: intento?.id ?? null,
    respuestasIntento,
    nivel_revision: act.nivel_revision ?? null,
    practica_slug: act.practica_slug ?? null,
  };
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
    if (!actsByProg.has(a.progresion_id!)) actsByProg.set(a.progresion_id!, []);
    actsByProg.get(a.progresion_id!)!.push(a.id);
  }

  let completadas = 0;
  for (const [, actList] of actsByProg) {
    if (actList.every((id) => completedSet.has(id))) completadas++;
  }

  return { completadas, total, ultimaActividad };
}

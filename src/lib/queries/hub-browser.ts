/**
 * hub-browser.ts — Browser-client versions of hub queries.
 * Used by Client Component pages ('use client') in the Hub.
 * Mirrors the logic of hub.ts but uses createBrowserClient.
 */

import { createBrowserClient } from "@supabase/ssr";
import { CATEGORIA_COMPLEMENTO } from "@/lib/mccems/categorias";
import { ORDEN_TIPOS } from "@/lib/mccems/tipos-recurso";
import { getUACPorCodigo } from "@/lib/mccems/estructura";
import type { ContinuarData } from "@/lib/queries/hub";

/** Tipos con etiqueta propia. Cualquier otro colapsa en un único "otro". */
const TIPOS_CONOCIDOS = new Set(ORDEN_TIPOS);
function normalizarTipo(tipo: string): string {
  return TIPOS_CONOCIDOS.has(tipo) ? tipo : "otro";
}

function getClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export interface HubProfile {
  userId: string;
  fullName: string | null;
  email: string | null;
  semestre: number;
}

/** Returns the current authenticated user's profile, or null if not logged in. */
export async function getCurrentProfile(): Promise<HubProfile | null> {
  const sb = getClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;

  const { data: profile } = await sb
    .from("profiles")
    .select("full_name, email, semestre")
    .eq("id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    fullName: profile?.full_name ?? null,
    email: profile?.email ?? user.email ?? null,
    semestre: profile?.semestre ?? 1,
  };
}

/**
 * Última actividad en progreso del alumno, o la primera no iniciada de su
 * semestre si no hay ninguna en progreso. Alimenta la ContinuarCard del hub.
 * Versión browser de getUltimaActividadActiva (hub.ts) usando createBrowserClient.
 */
export async function getUltimaActividadActivaBrowser(
  userId: string,
  semestre: number
): Promise<ContinuarData | null> {
  const sb = getClient();

  // 1. Intento en progreso más reciente
  const { data: intentoRaw } = await sb
    .from("intentos")
    .select("id, actividad_id, status, started_at")
    .eq("user_id", userId)
    .eq("status", "in_progress")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let actividadId: string | null = intentoRaw?.actividad_id ?? null;

  // 2. Si no hay en progreso, primera actividad de la primera progresión del semestre
  if (!actividadId) {
    const { data: uacRows } = await sb
      .from("uac")
      .select("id, codigo")
      .eq("semestre", semestre);
    if (!uacRows || uacRows.length === 0) return null;

    const { data: progRows } = await sb
      .from("progresiones")
      .select("id, numero, uac_id")
      .in("uac_id", uacRows.map((u) => u.id))
      .eq("es_placeholder", false)
      .order("numero");
    if (!progRows || progRows.length === 0) return null;

    const { data: actRow } = await sb
      .from("actividades")
      .select("id, codigo")
      .in("progresion_id", progRows.map((p) => p.id))
      .order("codigo")
      .limit(1)
      .maybeSingle();
    if (!actRow) return null;
    actividadId = actRow.id;
  }

  // 3. Detalles de la actividad
  const { data: act } = await sb
    .from("actividades")
    .select("id, codigo, titulo, tipo, progresion_id")
    .eq("id", actividadId)
    .maybeSingle();
  if (!act?.progresion_id) return null;

  // 4. Progresión
  const { data: prog } = await sb
    .from("progresiones")
    .select("id, numero, titulo, uac_id")
    .eq("id", act.progresion_id)
    .maybeSingle();
  if (!prog?.uac_id) return null;

  // 5. UAC
  const { data: uac } = await sb
    .from("uac")
    .select("id, codigo, nombre")
    .eq("id", prog.uac_id)
    .maybeSingle();
  if (!uac) return null;

  const uacStatic = getUACPorCodigo(uac.codigo);

  // 6. Contar actividades completadas de esta progresión
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
    completadas = new Set(completadosData?.map((i) => i.actividad_id) ?? []).size;
  }

  // 7. orden desde el sufijo -A{n} del código
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

export interface UACProgreso {
  completadas: number;
  total: number;
  ultimaActividad: string | null;
}

/** Returns completed/total progresiones count for a single UAC. */
export async function getProgresionesCompletadasDeUAC(
  codigoUAC: string,
  userId: string
): Promise<UACProgreso> {
  const sb = getClient();

  const { data: uacRow } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", codigoUAC)
    .maybeSingle();

  if (!uacRow) return { completadas: 0, total: 0, ultimaActividad: null };

  const { data: progs } = await sb
    .from("progresiones")
    .select("id, categoria")
    .eq("uac_id", uacRow.id)
    .eq("es_placeholder", false);

  // Solo cuentan los propósitos oficiales 2025; los complementos no inflan la meta.
  const oficiales = (progs ?? []).filter((p) => p.categoria !== CATEGORIA_COMPLEMENTO);
  const total = oficiales.length;
  if (total === 0) return { completadas: 0, total: 0, ultimaActividad: null };

  const progIds = oficiales.map((p) => p.id);

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
}

/** Categoría que marca contenido construido fuera de los propósitos oficiales 2025. */
export { CATEGORIA_COMPLEMENTO };

export interface ProgresionBrowser {
  id: string;
  numero: number;
  titulo: string;
  descripcion: string | null;
  ejes_articuladores: string[] | null;
  categoria: string | null;
  estado: "no_iniciada" | "en_progreso" | "completada";
  actividades: Array<{
    orden: number;
    tipo: string;
    estado: "no_iniciada" | "en_progreso" | "completada";
  }>;
}

/** Returns all progresiones for a UAC with status info. */
export async function getProgresionesConEstadoBrowser(
  codigoUAC: string,
  userId: string
): Promise<ProgresionBrowser[]> {
  const sb = getClient();

  const { data: uacRow } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", codigoUAC)
    .single();

  if (!uacRow) return [];

  const { data: progs } = await sb
    .from("progresiones")
    .select("id, numero, titulo, descripcion, ejes_articuladores, categoria")
    .eq("uac_id", uacRow.id)
    .eq("es_placeholder", false)
    .order("numero");

  if (!progs || progs.length === 0) return [];

  const progIds = progs.map((p) => p.id);

  const { data: allActs } = await sb
    .from("actividades")
    .select("id, codigo, tipo, progresion_id")
    .in("progresion_id", progIds)
    .order("codigo");

  const allActIds = (allActs ?? []).map((a) => a.id);

  const intentosByActId = new Map<string, "in_progress" | "completed">();
  if (allActIds.length > 0) {
    const { data: intentos } = await sb
      .from("intentos")
      .select("actividad_id, status, started_at")
      .eq("user_id", userId)
      .in("actividad_id", allActIds)
      .order("started_at", { ascending: false });

    for (const i of intentos ?? []) {
      if (!intentosByActId.has(i.actividad_id)) {
        intentosByActId.set(i.actividad_id, i.status as "in_progress" | "completed");
      }
    }
  }

  return progs.map((prog) => {
    const actsForProg = (allActs ?? [])
      .filter((a) => a.progresion_id === prog.id)
      .map((a) => {
        const ordenMatch = a.codigo.match(/-A(\d+)$/);
        const orden = ordenMatch?.[1] ? parseInt(ordenMatch[1]) : 1;
        const status = intentosByActId.get(a.id);
        return {
          orden,
          tipo: a.tipo,
          estado: (status === "completed"
            ? "completada"
            : status === "in_progress"
            ? "en_progreso"
            : "no_iniciada") as "no_iniciada" | "en_progreso" | "completada",
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
      ejes_articuladores: prog.ejes_articuladores,
      categoria: prog.categoria,
      estado,
      actividades: actsForProg,
    };
  });
}

export interface ProgresoSemestreBrowser {
  totalProgresiones: number;
  progresionesCompletadas: number;
  porcentaje: number;
}

/** Light aggregated progress stats for the hub hero. */
export async function getProgresoSemestreBrowser(
  userId: string,
  semestre: number
): Promise<ProgresoSemestreBrowser> {
  const sb = getClient();

  const { data: uacRows } = await sb
    .from("uac")
    .select("id")
    .eq("semestre", semestre);

  if (!uacRows || uacRows.length === 0)
    return { totalProgresiones: 0, progresionesCompletadas: 0, porcentaje: 0 };

  const uacIds = uacRows.map((u) => u.id);

  const { data: progs } = await sb
    .from("progresiones")
    .select("id, categoria")
    .in("uac_id", uacIds)
    .eq("es_placeholder", false);

  // Solo cuentan los propósitos oficiales 2025; los complementos no inflan la meta.
  const oficiales = (progs ?? []).filter((p) => p.categoria !== CATEGORIA_COMPLEMENTO);
  const totalProgresiones = oficiales.length;
  if (totalProgresiones === 0)
    return { totalProgresiones: 0, progresionesCompletadas: 0, porcentaje: 0 };

  const progIds = oficiales.map((p) => p.id);

  const { data: allActs } = await sb
    .from("actividades")
    .select("id, progresion_id")
    .in("progresion_id", progIds);

  const actIds = (allActs ?? []).map((a) => a.id);
  if (actIds.length === 0)
    return { totalProgresiones, progresionesCompletadas: 0, porcentaje: 0 };

  const { data: completedIntentos } = await sb
    .from("intentos")
    .select("actividad_id")
    .eq("user_id", userId)
    .eq("status", "completed")
    .in("actividad_id", actIds);

  const completedActIds = new Set(completedIntentos?.map((i) => i.actividad_id) ?? []);

  const actsByProg = new Map<string, string[]>();
  for (const act of allActs ?? []) {
    if (!act.progresion_id) continue;
    if (!actsByProg.has(act.progresion_id)) actsByProg.set(act.progresion_id, []);
    actsByProg.get(act.progresion_id)!.push(act.id);
  }

  let progresionesCompletadas = 0;
  for (const [, acts] of actsByProg) {
    if (acts.every((id) => completedActIds.has(id))) progresionesCompletadas++;
  }

  const porcentaje =
    totalProgresiones > 0
      ? Math.round((progresionesCompletadas / totalProgresiones) * 100)
      : 0;

  return { totalProgresiones, progresionesCompletadas, porcentaje };
}

// ─── Centro de Recursos (acceso por tipo) ───────────────────────────────────

export interface ProgresoTipo {
  tipo: string;
  total: number;
  completadas: number;
}

/**
 * Progreso por tipo de actividad en un semestre (total y completadas del usuario),
 * para los tiles de "Accesos rápidos" del Home. Solo devuelve tipos con
 * al menos 1 actividad real.
 */
export async function getProgresoRecursosSemestre(
  userId: string,
  semestre: number
): Promise<ProgresoTipo[]> {
  const sb = getClient();

  const { data: uacRows } = await sb
    .from("uac")
    .select("id")
    .eq("semestre", semestre);
  if (!uacRows || uacRows.length === 0) return [];

  const { data: progs } = await sb
    .from("progresiones")
    .select("id")
    .in("uac_id", uacRows.map((u) => u.id))
    .eq("es_placeholder", false);
  if (!progs || progs.length === 0) return [];

  const { data: acts } = await sb
    .from("actividades")
    .select("id, tipo")
    .in("progresion_id", progs.map((p) => p.id));
  if (!acts || acts.length === 0) return [];

  const { data: completed } = await sb
    .from("intentos")
    .select("actividad_id")
    .eq("user_id", userId)
    .eq("status", "completed")
    .in("actividad_id", acts.map((a) => a.id));

  const doneSet = new Set(completed?.map((i) => i.actividad_id) ?? []);

  const totalByTipo = new Map<string, number>();
  const doneByTipo = new Map<string, number>();
  for (const a of acts) {
    const tipo = normalizarTipo(a.tipo);
    totalByTipo.set(tipo, (totalByTipo.get(tipo) ?? 0) + 1);
    if (doneSet.has(a.id)) doneByTipo.set(tipo, (doneByTipo.get(tipo) ?? 0) + 1);
  }

  return [...totalByTipo.entries()].map(([tipo, total]) => ({
    tipo,
    total,
    completadas: doneByTipo.get(tipo) ?? 0,
  }));
}

export interface RecursoActividad {
  id: string;
  titulo: string;
  tipo: string;
  xp: number;
  uacCodigo: string;
  uacNombre: string;
  progresionId: string;
  progresionNumero: number;
  orden: number;
  estado: "no_iniciada" | "en_progreso" | "completada";
}

/**
 * Lista completa de actividades del semestre con estado por usuario,
 * para la página /hub/recursos. Cada item trae el deep-link (uac + progresión + orden).
 */
export async function getRecursosSemestreBrowser(
  userId: string,
  semestre: number
): Promise<RecursoActividad[]> {
  const sb = getClient();

  const { data: uacRows } = await sb
    .from("uac")
    .select("id, codigo, nombre")
    .eq("semestre", semestre);
  if (!uacRows || uacRows.length === 0) return [];

  const uacById = new Map(uacRows.map((u) => [u.id, u]));

  const { data: progs } = await sb
    .from("progresiones")
    .select("id, numero, uac_id")
    .in("uac_id", uacRows.map((u) => u.id))
    .eq("es_placeholder", false);
  if (!progs || progs.length === 0) return [];

  const progById = new Map(progs.map((p) => [p.id, p]));

  const { data: acts } = await sb
    .from("actividades")
    .select("id, codigo, titulo, tipo, xp, progresion_id")
    .in("progresion_id", progs.map((p) => p.id));
  if (!acts || acts.length === 0) return [];

  const actIds = acts.map((a) => a.id);
  const estadoByAct = new Map<string, "in_progress" | "completed">();
  const { data: intentos } = await sb
    .from("intentos")
    .select("actividad_id, status, started_at")
    .eq("user_id", userId)
    .in("actividad_id", actIds)
    .order("started_at", { ascending: false });
  for (const i of intentos ?? []) {
    if (!estadoByAct.has(i.actividad_id)) {
      estadoByAct.set(i.actividad_id, i.status as "in_progress" | "completed");
    }
  }

  const items: RecursoActividad[] = [];
  for (const a of acts) {
    if (!a.progresion_id) continue;
    const prog = progById.get(a.progresion_id);
    if (!prog) continue;
    const uac = uacById.get(prog.uac_id);
    if (!uac) continue;
    const ordenMatch = a.codigo.match(/-A(\d+)$/);
    const orden = ordenMatch?.[1] ? parseInt(ordenMatch[1]) : 1;
    const st = estadoByAct.get(a.id);
    items.push({
      id: a.id,
      titulo: a.titulo,
      tipo: a.tipo,
      xp: a.xp,
      uacCodigo: uac.codigo,
      uacNombre: uac.nombre,
      progresionId: prog.id,
      progresionNumero: prog.numero,
      orden,
      estado:
        st === "completed" ? "completada" : st === "in_progress" ? "en_progreso" : "no_iniciada",
    });
  }

  return items;
}

// ─── Laboratorios 3D (todas las prácticas experimentales del semestre) ───────

export interface LaboratorioItem {
  /** id de la actividad que monta el lab. */
  id: string;
  /** practica_slug — clave del registro de laboratorios. */
  slug: string;
  /** Título de la actividad asociada. */
  actividadTitulo: string;
  uacCodigo: string;
  uacNombre: string;
  progresionNumero: number;
  orden: number;
  estado: "no_iniciada" | "en_progreso" | "completada";
}

/**
 * Todas las prácticas experimentales (laboratorios 3D) del semestre del alumno,
 * con su deep-link directo (uac + progresión + orden → /practica) y estado por
 * usuario. Alimenta la pantalla dedicada /hub/recursos/laboratorios para que el
 * alumno los abra sin navegar UAC → progresión → actividad.
 */
export async function getLaboratoriosSemestreBrowser(
  userId: string,
  semestre: number
): Promise<LaboratorioItem[]> {
  const sb = getClient();

  const { data: uacRows } = await sb
    .from("uac")
    .select("id, codigo, nombre")
    .eq("semestre", semestre);
  if (!uacRows || uacRows.length === 0) return [];

  const uacById = new Map(uacRows.map((u) => [u.id, u]));

  const { data: progs } = await sb
    .from("progresiones")
    .select("id, numero, uac_id")
    .in("uac_id", uacRows.map((u) => u.id))
    .eq("es_placeholder", false);
  if (!progs || progs.length === 0) return [];

  const progById = new Map(progs.map((p) => [p.id, p]));

  const { data: acts } = await sb
    .from("actividades")
    .select("id, codigo, titulo, progresion_id, practica_slug")
    .in("progresion_id", progs.map((p) => p.id))
    .not("practica_slug", "is", null);
  if (!acts || acts.length === 0) return [];

  const actIds = acts.map((a) => a.id);
  const estadoByAct = new Map<string, "in_progress" | "completed">();
  const { data: intentos } = await sb
    .from("intentos")
    .select("actividad_id, status, started_at")
    .eq("user_id", userId)
    .in("actividad_id", actIds)
    .order("started_at", { ascending: false });
  for (const i of intentos ?? []) {
    if (!estadoByAct.has(i.actividad_id)) {
      estadoByAct.set(i.actividad_id, i.status as "in_progress" | "completed");
    }
  }

  const items: LaboratorioItem[] = [];
  for (const a of acts) {
    if (!a.progresion_id || !a.practica_slug) continue;
    const prog = progById.get(a.progresion_id);
    if (!prog) continue;
    const uac = uacById.get(prog.uac_id);
    if (!uac) continue;
    const ordenMatch = a.codigo.match(/-A(\d+)$/);
    const orden = ordenMatch?.[1] ? parseInt(ordenMatch[1]) : 1;
    const st = estadoByAct.get(a.id);
    items.push({
      id: a.id,
      slug: a.practica_slug,
      actividadTitulo: a.titulo,
      uacCodigo: uac.codigo,
      uacNombre: uac.nombre,
      progresionNumero: prog.numero,
      orden,
      estado:
        st === "completed" ? "completada" : st === "in_progress" ? "en_progreso" : "no_iniciada",
    });
  }

  // Orden estable: por UAC, luego progresión, luego orden de actividad.
  return items.sort(
    (a, b) =>
      a.uacCodigo.localeCompare(b.uacCodigo) ||
      a.progresionNumero - b.progresionNumero ||
      a.orden - b.orden
  );
}

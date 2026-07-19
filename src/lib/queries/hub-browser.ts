/**
 * hub-browser.ts — Browser-client versions of hub queries.
 * Used by Client Component pages ('use client') in the Hub.
 * Mirrors the logic of hub.ts but uses createBrowserClient.
 *
 * El progreso del hub (tarjetas de UAC, héroe y tiles de recursos) se sirve
 * desde un núcleo consolidado de 3 queries por carga (ver "Datos consolidados
 * del semestre" abajo) en lugar de una cascada de ~4 queries por UAC.
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

// ─── Datos consolidados del semestre (anti-cascada N×4) ──────────────────────
//
// El hub llama a getProgresionesCompletadasDeUAC una vez POR CADA UAC del
// semestre; con la cascada original (uac → progresiones → actividades →
// intentos) eso eran ~4 queries × 6-7 UAC ≈ 24-28 requests browser→Supabase
// en cada carga — el mayor amplificador de tráfico contra el plan Free.
// Aquí se consolida en 3 queries TOTALES por carga, compartidas por todas las
// tarjetas de UAC, el héroe (getProgresoSemestreBrowser) y los tiles de
// recursos (getProgresoRecursosSemestre); cada función reconstruye en memoria
// lo que antes calculaba con su propia cascada.
//
// La fuente de verdad sigue siendo la BD bajo RLS con la sesión del alumno:
// las actividades en borrador NO cuentan porque la policy solo expone
// estado='publicada' (migración 01), exactamente igual que en la cascada
// original. El catálogo estático solo se usa para derivar el semestre de un
// código de UAC (agrupar la carga), nunca para conteos.

interface DatosSemestre {
  /** Progresiones no-placeholder con el código de su UAC (join con uac). */
  progresiones: Array<{ id: string; uacCodigo: string; categoria: string | null }>;
  /** Actividades visibles bajo RLS, sin contenido (solo id/agrupación/tipo). */
  actividades: Array<{ id: string; progresionId: string; tipo: string }>;
  /** TODOS los intentos del usuario, ordenados por started_at desc. */
  intentos: Array<{ actividadId: string; status: string; startedAt: string }>;
  /** actividad_ids agrupadas por progresión (derivado de `actividades`). */
  actsPorProgresion: Map<string, string[]>;
  /** actividad_ids con al menos un intento completed (derivado de `intentos`). */
  completadas: Set<string>;
  /** true si alguna query falló (red/RLS): el resultado no se cachea. */
  huboError: boolean;
}

/**
 * Las 3 queries consolidadas. El filtro admite un semestre completo (caso
 * normal, cacheable) o una sola UAC por código (fallback para códigos fuera
 * del catálogo estático, sin caché).
 */
async function fetchDatosUACs(
  userId: string,
  filtro: { semestre: number } | { codigo: string }
): Promise<DatosSemestre> {
  const sb = getClient();

  // (a) Progresiones de TODAS las UAC del alcance en UNA query. El join
  //     !inner con uac (FK progresiones.uac_id → uac.id, migración 01)
  //     permite filtrar por semestre/código sin una query previa a la tabla
  //     uac.
  const progsBase = sb
    .from("progresiones")
    .select("id, categoria, uac!inner(codigo)")
    .eq("es_placeholder", false);
  const progsQuery =
    "semestre" in filtro
      ? progsBase.eq("uac.semestre", filtro.semestre)
      : progsBase.eq("uac.codigo", filtro.codigo);

  // (c) Intentos del usuario SIN .in(actividad_id, [...]): con cientos de
  //     actividades por semestre ese .in reventaría el límite de longitud de
  //     URL de PostgREST. Son pocas filas (UNIQUE user/actividad/status) y el
  //     cruce con las actividades del semestre se hace en memoria. Además de
  //     actividad_id se piden status y started_at porque
  //     UACProgreso.ultimaActividad necesita el intento más reciente de
  //     CUALQUIER status, no solo completed.
  const intentosQuery = sb
    .from("intentos")
    .select("actividad_id, status, started_at")
    .eq("user_id", userId)
    .order("started_at", { ascending: false });

  // (a) y (c) no dependen entre sí: en paralelo para ahorrar un round-trip.
  const [progsRes, intentosRes] = await Promise.all([progsQuery, intentosQuery]);

  // Sin tipos generados de la BD, supabase-js no conoce la cardinalidad del
  // embed y tipa `uac` como arreglo; en runtime PostgREST devuelve UN objeto
  // (FK muchos-a-uno), así que se castea a la forma real (mismo patrón que
  // progreso.ts con sus embeds).
  const progsData = (progsRes.data ?? []) as unknown as Array<{
    id: string;
    categoria: string | null;
    uac: { codigo: string } | null;
  }>;
  const progresiones: DatosSemestre["progresiones"] = progsData.map((p) => ({
    id: p.id,
    uacCodigo: p.uac?.codigo ?? "",
    categoria: p.categoria ?? null,
  }));

  // (b) Actividades de esas progresiones en UNA query (~decenas de UUIDs en
  //     el .in, muy por debajo del límite de URL). Solo columnas de identidad
  //     y agrupación más `tipo` (tiles de recursos): nada de `contenido`
  //     (jsonb) ni títulos que inflarían la respuesta de cada carga del hub.
  let actividades: DatosSemestre["actividades"] = [];
  let errorActividades: unknown = null;
  if (progresiones.length > 0) {
    const { data, error } = await sb
      .from("actividades")
      .select("id, progresion_id, tipo")
      .in("progresion_id", progresiones.map((p) => p.id));
    errorActividades = error;
    actividades = (data ?? [])
      .filter((a) => a.progresion_id)
      .map((a) => ({ id: a.id, progresionId: a.progresion_id, tipo: a.tipo }));
  }

  const intentos: DatosSemestre["intentos"] = (intentosRes.data ?? []).map((i) => ({
    actividadId: i.actividad_id,
    status: i.status,
    startedAt: i.started_at,
  }));

  const actsPorProgresion = new Map<string, string[]>();
  for (const a of actividades) {
    const lista = actsPorProgresion.get(a.progresionId);
    if (lista) lista.push(a.id);
    else actsPorProgresion.set(a.progresionId, [a.id]);
  }

  const completadas = new Set<string>();
  for (const i of intentos) {
    if (i.status === "completed") completadas.add(i.actividadId);
  }

  return {
    progresiones,
    actividades,
    intentos,
    actsPorProgresion,
    completadas,
    huboError: Boolean(progsRes.error || intentosRes.error || errorActividades),
  };
}

/**
 * Caché en memoria del módulo con TTL corto. Su único objetivo es que las
 * ~6-7 tarjetas de UAC + el héroe + los tiles de UNA MISMA carga del hub
 * compartan las 3 queries (antes cada tarjeta lanzaba su propia cascada).
 * El TTL corto mantiene la frescura entre navegaciones: al volver al hub
 * después de completar una actividad la caché ya expiró y se refetchea.
 * Se cachea la PROMESA (no el resultado) para que las llamadas concurrentes
 * de una misma carga se deduplen aunque la primera aún no haya resuelto.
 */
const TTL_DATOS_SEMESTRE_MS = 15_000;
const cacheDatosSemestre = new Map<
  string,
  { creadoEn: number; promesa: Promise<DatosSemestre> }
>();

/** Vacía la caché consolidada del hub (tests, o tras registrar un intento). */
export function limpiarCacheDatosSemestre(): void {
  cacheDatosSemestre.clear();
}

function descartarSiVigente(clave: string, promesa: Promise<DatosSemestre>): void {
  if (cacheDatosSemestre.get(clave)?.promesa === promesa) {
    cacheDatosSemestre.delete(clave);
  }
}

function getDatosSemestre(userId: string, semestre: number): Promise<DatosSemestre> {
  const clave = `${userId}:${semestre}`;
  const vigente = cacheDatosSemestre.get(clave);
  if (vigente && Date.now() - vigente.creadoEn < TTL_DATOS_SEMESTRE_MS) {
    return vigente.promesa;
  }

  const promesa = fetchDatosUACs(userId, { semestre }).then((datos) => {
    // Un fallo (red, RLS) no se cachea: la siguiente carga reintenta en vez
    // de congelar ceros durante todo el TTL.
    if (datos.huboError) descartarSiVigente(clave, promesa);
    return datos;
  });
  // Rechazo inesperado (throw dentro de supabase-js): tampoco se cachea.
  promesa.catch(() => descartarSiVigente(clave, promesa));
  cacheDatosSemestre.set(clave, { creadoEn: Date.now(), promesa });
  return promesa;
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

  // 1. Intento en progreso más reciente (started_at solo ordena; no se lee)
  const { data: intentoRaw } = await sb
    .from("intentos")
    .select("actividad_id")
    .eq("user_id", userId)
    .eq("status", "in_progress")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let actividadId: string | null = intentoRaw?.actividad_id ?? null;

  // 2. Si no hay en progreso, primera actividad de la primera progresión del
  //    semestre (solo se necesitan ids; los .order funcionan sin seleccionar
  //    la columna)
  if (!actividadId) {
    const { data: uacRows } = await sb
      .from("uac")
      .select("id")
      .eq("semestre", semestre);
    if (!uacRows || uacRows.length === 0) return null;

    const { data: progRows } = await sb
      .from("progresiones")
      .select("id")
      .in("uac_id", uacRows.map((u) => u.id))
      .eq("es_placeholder", false)
      .order("numero");
    if (!progRows || progRows.length === 0) return null;

    const { data: actRow } = await sb
      .from("actividades")
      .select("id")
      .in("progresion_id", progRows.map((p) => p.id))
      .order("codigo")
      .limit(1)
      .maybeSingle();
    if (!actRow) return null;
    actividadId = actRow.id;
  }

  // 3. Detalles de la actividad (el id ya lo tenemos en actividadId)
  const { data: act } = await sb
    .from("actividades")
    .select("codigo, titulo, tipo, progresion_id")
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
    .select("codigo, nombre")
    .eq("id", prog.uac_id)
    .maybeSingle();
  if (!uac) return null;

  const uacStatic = getUACPorCodigo(uac.codigo);

  // 6. Contar actividades completadas de esta progresión (solo ids: el
  //    resultado se cuenta y se convierte en Set, el orden no importa)
  const { data: allActs } = await sb
    .from("actividades")
    .select("id")
    .eq("progresion_id", prog.id);

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
  // El semestre sale del catálogo estático SOLO para que todas las tarjetas
  // del hub compartan la misma carga consolidada; los conteos siempre vienen
  // de la BD. Un código fuera del catálogo cae a una carga puntual sin caché.
  const semestre = getUACPorCodigo(codigoUAC)?.semestre;
  const datos =
    semestre !== undefined
      ? await getDatosSemestre(userId, semestre)
      : await fetchDatosUACs(userId, { codigo: codigoUAC });

  // Solo cuentan los propósitos oficiales 2025; los complementos no inflan la meta.
  const oficiales = datos.progresiones.filter(
    (p) => p.uacCodigo === codigoUAC && p.categoria !== CATEGORIA_COMPLEMENTO
  );
  const total = oficiales.length;
  if (total === 0) return { completadas: 0, total: 0, ultimaActividad: null };

  // Actividades de las progresiones oficiales de ESTA UAC.
  const actIds = new Set<string>();
  for (const p of oficiales) {
    for (const id of datos.actsPorProgresion.get(p.id) ?? []) actIds.add(id);
  }
  if (actIds.size === 0) return { completadas: 0, total, ultimaActividad: null };

  // Los intentos vienen ordenados por started_at desc: el primero que toque
  // una actividad de esta UAC es la última actividad trabajada.
  const ultimaActividad =
    datos.intentos.find((i) => actIds.has(i.actividadId))?.startedAt ?? null;

  // Una progresión cuenta como completada si TODAS sus actividades lo están;
  // las progresiones sin actividades no cuentan (igual que la cascada previa).
  let completadas = 0;
  for (const p of oficiales) {
    const acts = datos.actsPorProgresion.get(p.id) ?? [];
    if (acts.length > 0 && acts.every((id) => datos.completadas.has(id))) {
      completadas++;
    }
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
    // started_at solo ordena (gana el intento más reciente); no se selecciona
    const { data: intentos } = await sb
      .from("intentos")
      .select("actividad_id, status")
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
  const datos = await getDatosSemestre(userId, semestre);

  // Solo cuentan los propósitos oficiales 2025; los complementos no inflan la meta.
  const oficiales = datos.progresiones.filter(
    (p) => p.categoria !== CATEGORIA_COMPLEMENTO
  );
  const totalProgresiones = oficiales.length;
  if (totalProgresiones === 0)
    return { totalProgresiones: 0, progresionesCompletadas: 0, porcentaje: 0 };

  // Una progresión cuenta como completada si TODAS sus actividades lo están;
  // las que no tienen actividades no cuentan (igual que la cascada previa).
  let progresionesCompletadas = 0;
  for (const p of oficiales) {
    const acts = datos.actsPorProgresion.get(p.id) ?? [];
    if (acts.length > 0 && acts.every((id) => datos.completadas.has(id))) {
      progresionesCompletadas++;
    }
  }

  const porcentaje = Math.round((progresionesCompletadas / totalProgresiones) * 100);

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
  const datos = await getDatosSemestre(userId, semestre);
  if (datos.actividades.length === 0) return [];

  // A diferencia del avance por UAC, aquí SÍ cuentan los complementos: los
  // tiles muestran todo lo que el alumno puede abrir (igual que antes).
  const totalByTipo = new Map<string, number>();
  const doneByTipo = new Map<string, number>();
  for (const a of datos.actividades) {
    const tipo = normalizarTipo(a.tipo);
    totalByTipo.set(tipo, (totalByTipo.get(tipo) ?? 0) + 1);
    if (datos.completadas.has(a.id)) {
      doneByTipo.set(tipo, (doneByTipo.get(tipo) ?? 0) + 1);
    }
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
    .select("id, codigo, titulo, tipo, progresion_id")
    .in("progresion_id", progs.map((p) => p.id));
  if (!acts || acts.length === 0) return [];

  const actIds = acts.map((a) => a.id);
  const estadoByAct = new Map<string, "in_progress" | "completed">();
  // started_at solo ordena (gana el intento más reciente); no se selecciona
  const { data: intentos } = await sb
    .from("intentos")
    .select("actividad_id, status")
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
  // started_at solo ordena (gana el intento más reciente); no se selecciona
  const { data: intentos } = await sb
    .from("intentos")
    .select("actividad_id, status")
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

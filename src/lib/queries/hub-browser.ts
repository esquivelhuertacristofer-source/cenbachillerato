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
import { getUACPorCodigo, UAC_BASE } from "@/lib/mccems/estructura";
import type { ContinuarData, RachaData } from "@/lib/queries/hub";
import {
  type SbAny,
  type ProgresoUAC,
  type ResumenActividadAlumno,
  type EstadisticasProgreso,
  type IntentoRecienteRow,
  type IntentoCalendarioRow,
  type StatsRpcPayload,
  statsVacias,
  calendarioVacio,
  fechaInicioVentana30Dias,
  deriveRecientes,
  deriveCalendario,
  esRpcInexistente,
  normalizarStatsRpc,
  statsLegacyEnMemoria,
} from "@/lib/queries/progreso-shared";

// Re-export de los tipos que consume la página /hub/progreso, para que su
// versión client-side importe todo desde un único módulo browser-safe.
export type { ProgresoUAC, ResumenActividadAlumno } from "@/lib/queries/progreso-shared";
export type { RachaData } from "@/lib/queries/hub";

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
  intentos: Array<{
    actividadId: string;
    status: string;
    startedAt: string;
    /** Segundos dedicados (para los minutos de "esta semana" en /hub/progreso). */
    tiempoSegundos: number | null;
  }>;
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
  //     CUALQUIER status, no solo completed; y tiempo_segundos para los minutos
  //     de "esta semana" del héroe de /hub/progreso (un entero por fila, egress
  //     despreciable, sin query extra).
  const intentosQuery = sb
    .from("intentos")
    .select("actividad_id, status, started_at, tiempo_segundos")
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
    tiempoSegundos: i.tiempo_segundos ?? null,
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
  /** Actividades completadas iniciadas desde el domingo 00:00 (héroe de /hub/progreso). */
  actividadesEstaSemana: number;
  /** Minutos de esas actividades (tiempo_segundos / 60, redondeado). */
  minutosEstaSemana: number;
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
    return {
      totalProgresiones: 0,
      progresionesCompletadas: 0,
      actividadesEstaSemana: 0,
      minutosEstaSemana: 0,
      porcentaje: 0,
    };

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

  // ── Stats de "esta semana" (mismo cómputo que getProgresoSemestre en hub.ts):
  //    intentos completados de actividades de progresiones OFICIALES de este
  //    semestre, iniciados desde el domingo 00:00 local. tiempo_segundos → min.
  const inicioSemana = new Date();
  inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
  inicioSemana.setHours(0, 0, 0, 0);

  const actIdsOficiales = new Set<string>();
  for (const p of oficiales) {
    for (const id of datos.actsPorProgresion.get(p.id) ?? []) actIdsOficiales.add(id);
  }

  let actividadesEstaSemana = 0;
  let segundosEstaSemana = 0;
  for (const it of datos.intentos) {
    if (it.status !== "completed") continue;
    if (!actIdsOficiales.has(it.actividadId)) continue;
    if (new Date(it.startedAt) < inicioSemana) continue;
    actividadesEstaSemana++;
    segundosEstaSemana += it.tiempoSegundos ?? 0;
  }
  const minutosEstaSemana = Math.round(segundosEstaSemana / 60);

  return {
    totalProgresiones,
    progresionesCompletadas,
    actividadesEstaSemana,
    minutosEstaSemana,
    porcentaje,
  };
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

// ─── /hub/progreso (versión client-side, lever #2: hidratación en navegador) ──
//
// Las tres funciones siguientes son la contraparte browser de las que
// alimentan /hub/progreso en servidor (getRachaDelAlumno, getProgresoDetallePorUAC,
// getResumenActividadAlumno). Reutilizan la misma lógica de derivación que la
// ruta de servidor (progreso-shared.ts) para tener UNA fuente de verdad.
//
// Costo: las dos primeras NO lanzan queries nuevas — derivan de la caché
// consolidada `getDatosSemestre`, que la propia página ya puebla al llamar a
// getProgresoSemestreBrowser. La tercera (resumen/stats) sí hace sus 3 queries
// acotadas (recientes/calendario/RPC), idénticas a las del servidor.

/**
 * Versión browser de getRachaDelAlumno (hub.ts): racha diaria y últimos 7 días.
 * Deriva de la caché consolidada (que ya trae TODOS los intentos del usuario,
 * sin filtro de semestre — igual que el scan del servidor) sin lanzar queries
 * nuevas. Se cuentan solo los intentos `completed`, reproduciendo la ruta de
 * snapshot del servidor (migración 25), donde el snapshot solo guarda
 * completados.
 */
export async function getRachaDelAlumnoBrowser(
  userId: string,
  semestre: number
): Promise<RachaData> {
  const hoy = new Date();
  const claveDia = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  // Skeleton de 7 días sin actividad (misma forma que espera la UI) por si la
  // caché consolidada falló: no inventamos racha sobre datos incompletos.
  const ultimos7DiasVacio = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(hoy);
    d.setDate(d.getDate() - (6 - i));
    return { fecha: claveDia(d), activo: false };
  });

  const datos = await getDatosSemestre(userId, semestre);
  if (datos.huboError) {
    return { diasConsecutivos: 0, ultimos7Dias: ultimos7DiasVacio };
  }

  const hace30Dias = new Date();
  hace30Dias.setDate(hace30Dias.getDate() - 30);

  const activeDates = new Set<string>();
  for (const it of datos.intentos) {
    if (it.status !== "completed") continue;
    const d = new Date(it.startedAt);
    if (d >= hace30Dias) activeDates.add(claveDia(d));
  }

  // Días consecutivos desde hoy hacia atrás (idéntico a hub.ts).
  let diasConsecutivos = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(hoy);
    d.setDate(d.getDate() - i);
    if (activeDates.has(claveDia(d))) diasConsecutivos++;
    else break;
  }

  const ultimos7Dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(hoy);
    d.setDate(d.getDate() - (6 - i));
    return { fecha: claveDia(d), activo: activeDates.has(claveDia(d)) };
  });

  return { diasConsecutivos, ultimos7Dias };
}

/**
 * Versión browser de getProgresoDetallePorUAC (progreso.ts): avance por UAC del
 * semestre. Deriva de la caché consolidada sin lanzar queries nuevas. El
 * nombre y el recurso (color) de cada UAC salen del catálogo estático UAC_BASE
 * (el servidor los lee de la tabla `uac`, pero son los mismos valores). El
 * campo `ultimaActividad` sale del started_at del intento más reciente que
 * toque la UAC — la grilla (ProgresoUACGrid) no lo pinta, así que su fidelidad
 * exacta no importa.
 */
export async function getProgresoDetallePorUACBrowser(
  userId: string,
  semestre: number
): Promise<ProgresoUAC[]> {
  const datos = await getDatosSemestre(userId, semestre);

  // Todas las UAC del semestre según el catálogo oficial 2025, ordenadas por
  // código (igual que el `.order("codigo")` del servidor).
  const uacsDelSemestre = UAC_BASE.filter((u) => u.semestre === semestre).sort((a, b) =>
    a.codigo.localeCompare(b.codigo)
  );

  const results: ProgresoUAC[] = [];
  for (const uac of uacsDelSemestre) {
    // Solo propósitos oficiales 2025; los complementos no inflan la meta.
    const oficiales = datos.progresiones.filter(
      (p) => p.uacCodigo === uac.codigo && p.categoria !== CATEGORIA_COMPLEMENTO
    );
    const total = oficiales.length;

    if (total === 0) {
      results.push({
        codigo: uac.codigo,
        nombre: uac.nombre,
        rscCodigo: uac.recursoCodigo ?? "RSC-LC",
        completadas: 0,
        total: 0,
        pct: 0,
        ultimaActividad: null,
      });
      continue;
    }

    // Actividades de las progresiones oficiales de esta UAC.
    const actIds = new Set<string>();
    for (const p of oficiales) {
      for (const id of datos.actsPorProgresion.get(p.id) ?? []) actIds.add(id);
    }

    // Progresión completada = TODAS sus actividades completadas (igual que servidor).
    let completadas = 0;
    for (const p of oficiales) {
      const acts = datos.actsPorProgresion.get(p.id) ?? [];
      if (acts.length > 0 && acts.every((id) => datos.completadas.has(id))) {
        completadas++;
      }
    }

    // Intentos ordenados por started_at desc: el primero que toque esta UAC es
    // el más reciente. (Best-effort; la grilla no consume este campo.)
    const ultimaActividad =
      datos.intentos.find((i) => actIds.has(i.actividadId))?.startedAt ?? null;

    results.push({
      codigo: uac.codigo,
      nombre: uac.nombre,
      rscCodigo: uac.recursoCodigo ?? "RSC-LC",
      completadas,
      total,
      pct: total > 0 ? Math.round((completadas / total) * 100) : 0,
      ultimaActividad,
    });
  }

  return results;
}

// Avisar UNA sola vez por pestaña: el fallback legacy corre en cada carga de
// /hub/progreso y no queremos un warn por render en la consola del alumno.
let warnedRpcStatsFaltanteBrowser = false;

/**
 * Versión browser de getResumenActividadAlumno (progreso.ts): recientes +
 * heatmap de 30 días + stats agregadas. Mismas 3 queries acotadas que el
 * servidor (recientes con .limit, calendario de 30 días, RPC resumen_stats_alumno)
 * y misma lógica de derivación (progreso-shared.ts). Si la RPC aún no existe en
 * la BD, statsLegacyEnMemoria reproduce el cálculo en memoria (fail-open).
 */
export async function getResumenActividadAlumnoBrowser(
  limiteRecientes = 15
): Promise<ResumenActividadAlumno> {
  const vacio: ResumenActividadAlumno = {
    recientes: [],
    calendario: calendarioVacio(),
    stats: statsVacias(),
  };

  try {
    // SbAny: la RPC resumen_stats_alumno no está en los tipos generados de la BD.
    const sba: SbAny = getClient();
    const desde = fechaInicioVentana30Dias();

    // Las tres consultas no reciben user_id: la RLS de `intentos` limita las
    // filas al propio alumno con su sesión (y la RPC usa auth.uid() adentro).
    const [recientesRes, calendarioRes, statsRes] = await Promise.all([
      sba
        .from("intentos")
        .select(`
          id,
          completed_at,
          actividades!actividad_id!inner (
            titulo,
            tipo_codigo,
            progresiones!progresion_id (
              uac!uac_id ( codigo )
            )
          )
        `)
        .eq("status", "completed")
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(limiteRecientes),
      sba
        .from("intentos")
        .select(`
          completed_at,
          actividades!actividad_id!inner (
            progresiones!progresion_id (
              uac!uac_id ( codigo )
            )
          )
        `)
        .eq("status", "completed")
        .not("completed_at", "is", null)
        .gte("completed_at", desde)
        .order("completed_at", { ascending: false }),
      sba.rpc("resumen_stats_alumno"),
    ]);

    let stats: EstadisticasProgreso;
    if (!statsRes.error && statsRes.data) {
      stats = normalizarStatsRpc(statsRes.data as StatsRpcPayload);
    } else if (esRpcInexistente(statsRes.error)) {
      if (!warnedRpcStatsFaltanteBrowser) {
        warnedRpcStatsFaltanteBrowser = true;
        console.warn(
          "[progreso] La RPC resumen_stats_alumno no existe aún en la BD — " +
            "usando cálculo legacy en memoria. Aplica " +
            "supabase/migrations/23_rpc_resumen_stats_alumno.sql en el SQL Editor."
        );
      }
      // El fallback necesita user_id (no corre bajo auth.uid()): lo tomamos de
      // la sesión actual del navegador.
      const {
        data: { user },
      } = await sba.auth.getUser();
      stats = user ? await statsLegacyEnMemoria(sba, user.id) : statsVacias();
    } else {
      stats = statsVacias();
    }

    const recRows = ((recientesRes.data ?? []) as IntentoRecienteRow[]).filter(
      (i) => i.actividades && i.completed_at
    );
    const calRows = ((calendarioRes.data ?? []) as IntentoCalendarioRow[]).filter(
      (i) => i.actividades && i.completed_at
    );

    return {
      recientes: deriveRecientes(recRows),
      calendario: deriveCalendario(calRows),
      stats,
    };
  } catch {
    return vacio;
  }
}

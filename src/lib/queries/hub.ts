/**
 * Hub queries — centralizadas aquí per arquitectura.
 *
 * Cada función separa dos mundos:
 *  - CATÁLOGO (currículo: uac / progresiones / actividades / contenido): idéntico
 *    para todos los alumnos, se sirve desde KV vía getCachedCatalog (ver
 *    src/lib/catalog-cache.ts). La primera request lo trae de Postgres; las demás
 *    lo leen de KV sin tocar la base. Los "productores" (getSemestreTree,
 *    getUacProgTree, getActividadContenido) corren la consulta autenticada del
 *    alumno solo en cache MISS.
 *  - PERSONAL (intentos / progreso del alumno): SIEMPRE en vivo con el cliente de
 *    sesión (RLS). Nunca se cachea; la clave de catálogo no incluye userId.
 *
 * Las firmas y los tipos de retorno públicos son idénticos a antes: el split es
 * puramente interno, cero blast radius en los callers.
 */

import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase-helpers";
import { CATEGORIA_COMPLEMENTO } from "@/lib/mccems/categorias";
import { getUACPorCodigo } from "@/lib/mccems/estructura";
import { withTimeout, withTimeoutOrThrow } from "@/lib/with-timeout";
import { getRespuestas } from "@/lib/r2-respuestas";
import { getCachedCatalog, CATALOG_TTL } from "@/lib/catalog-cache";

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

// ─── Productores de catálogo (cacheados en KV, sin userId) ────────────────────
//
// Estos tipos son SOLO la porción compartida (currículo). Todo lo derivado del
// alumno se calcula después, en vivo. Las columnas se eligen como la UNIÓN de lo
// que necesitan las funciones que consumen cada árbol, para reutilizar una sola
// clave de caché entre varias.

interface SemestreTree {
  uac: { id: string; codigo: string; nombre: string }[];
  prog: {
    id: string;
    numero: number;
    titulo: string;
    uac_id: string;
    categoria: string | null;
  }[];
  act: {
    id: string;
    codigo: string;
    titulo: string;
    tipo: string;
    progresion_id: string | null;
  }[];
}

/**
 * Árbol de catálogo de un semestre completo (uac + progresiones publicadas +
 * actividades), compartido por getUltimaActividadActiva y getProgresoSemestre.
 * Devuelve null SOLO si el semestre no tiene UACs (no existe); un semestre con
 * UACs pero sin progresiones/actividades devuelve arreglos vacíos (estado
 * legítimo, cacheable) para preservar el comportamiento original de cada caller.
 */
async function getSemestreTree(semestre: number): Promise<SemestreTree | null> {
  return getCachedCatalog(
    `sem:${semestre}:tree`,
    CATALOG_TTL.TREE,
    async (): Promise<SemestreTree | null> => {
      const sb = await getSupabaseServer();

      const { data: uacRows } = await sb
        .from("uac")
        .select("id, codigo, nombre")
        .eq("semestre", semestre);
      if (!uacRows || uacRows.length === 0) return null;

      const { data: progRows } = await sb
        .from("progresiones")
        .select("id, numero, titulo, uac_id, categoria")
        .in("uac_id", uacRows.map((u) => u.id))
        .eq("es_placeholder", false);
      const prog = progRows ?? [];

      let act: SemestreTree["act"] = [];
      if (prog.length > 0) {
        const { data: actRows } = await sb
          .from("actividades")
          .select("id, codigo, titulo, tipo, progresion_id")
          .in("progresion_id", prog.map((p) => p.id))
          .order("codigo");
        act = actRows ?? [];
      }

      return { uac: uacRows, prog, act };
    }
  );
}

interface UacProgTree {
  uacId: string;
  prog: {
    id: string;
    numero: number;
    titulo: string;
    descripcion: string | null;
    tiempo_estimado_horas: number | null;
    ejes_articuladores: string[] | null;
    transversalidades: string[] | null;
  }[];
  act: {
    id: string;
    codigo: string;
    titulo: string;
    tipo: string;
    progresion_id: string | null;
  }[];
}

/**
 * Árbol de catálogo de una UAC (progresiones publicadas + sus actividades),
 * compartido por getProgresionesConEstado, getSiguienteProgresion,
 * fetchActividadesConEstado y getProgresionesCompletadasDeUAC. Las progresiones
 * vienen ordenadas por `numero`; las actividades por `codigo`. Devuelve null solo
 * si la UAC (código) no existe; una UAC sin progresiones publicadas devuelve
 * `prog: []` (cacheable).
 */
async function getUacProgTree(codigoUAC: string): Promise<UacProgTree | null> {
  return getCachedCatalog(
    `uac:${codigoUAC}:progtree`,
    CATALOG_TTL.TREE,
    async (): Promise<UacProgTree | null> => {
      const sb = await getSupabaseServer();

      const { data: uacRow } = await sb
        .from("uac")
        .select("id")
        .eq("codigo", codigoUAC)
        .single();
      if (!uacRow) return null;

      const { data: progs } = await sb
        .from("progresiones")
        .select(
          "id, numero, titulo, descripcion, tiempo_estimado_horas, ejes_articuladores, transversalidades"
        )
        .eq("uac_id", uacRow.id)
        .eq("es_placeholder", false)
        .order("numero");
      const prog = progs ?? [];

      let act: UacProgTree["act"] = [];
      if (prog.length > 0) {
        const { data: allActs } = await sb
          .from("actividades")
          .select("id, codigo, titulo, tipo, progresion_id")
          .in("progresion_id", prog.map((p) => p.id))
          .order("codigo");
        act = allActs ?? [];
      }

      return { uacId: uacRow.id, prog, act };
    }
  );
}

interface ActividadContenido {
  id: string;
  codigo: string;
  titulo: string;
  descripcion: string | null;
  tipo: string;
  contenido: unknown;
  nivel_revision: string | null;
  practica_slug: string | null;
}

/**
 * Registro completo (incluido el jsonb pesado `contenido`) de UNA actividad,
 * resuelta por (codigoUAC, progNumero, orden). Es la caché de mayor valor: el
 * contenido curricular es idéntico para todos los alumnos y el payload es grande.
 * El intento personal + las respuestas de R2 se resuelven aparte, en vivo. La
 * consulta corre con la sesión del alumno, así que la RLS `actividades
 * publicadas` sigue aplicando: nunca se cachea contenido de borrador/no público.
 */
async function getActividadContenido(
  codigoUAC: string,
  progNumero: number,
  orden: number
): Promise<ActividadContenido | null> {
  return getCachedCatalog(
    `act:${codigoUAC}:${progNumero}:${orden}:full`,
    CATALOG_TTL.CONTENT,
    async (): Promise<ActividadContenido | null> => {
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

      // Paso 1/2: query LIGERA (sin "contenido") solo para resolver cuál id
      // corresponde al sufijo -A{orden} del código, sin bajar el jsonb pesado de
      // TODAS las actividades de la progresión.
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

      // Paso 2/2: ahora sí "contenido" (y demás columnas pesadas), pero de SOLO
      // esa actividad.
      const { data: act } = await sb
        .from("actividades")
        .select(
          "id, codigo, titulo, descripcion, tipo, contenido, nivel_revision, practica_slug"
        )
        .eq("id", actLigero.id)
        .maybeSingle();
      if (!act) return null;

      return act;
    }
  );
}

// ─── Snapshot de progreso (PERSONAL, denormalizado) ───────────────────────────
//
// Lever de costo #3 (escalabilidad a costo cero): las lecturas PERSONALES del hub
// (qué actividades completó el alumno) hoy escanean `intentos` con un IN sobre los
// ids de actividad de la UAC/semestre en CADA request. La migración 25 crea
// `progreso_alumno_snapshot` — 1 fila por alumno, PK user_id, con un jsonb
// `completadas` { actividad_id: { i, s, t } } mantenido por trigger SECURITY
// DEFINER — para resolver todo eso con UN lookup por PK.
//
// `intentos` sigue siendo la fuente de verdad; el snapshot es una caché derivada.

interface SnapshotEntry {
  /** id del intento 'completed' → ActividadConEstado.intentoId */
  intentoId: string;
  /** started_at → racha, stats de la semana, "última actividad" */
  startedAt: string;
  /** tiempo_segundos → minutos de la semana */
  tiempoSegundos: number | null;
}

/**
 * Lee el snapshot denormalizado del alumno y lo devuelve como
 * Map<actividad_id, SnapshotEntry> (solo actividades 'completed').
 *
 * FALLA ABIERTO — devuelve null si:
 *   · la tabla no existe todavía (migración 25 sin aplicar) → error PostgREST,
 *   · el alumno aún no tiene fila (0 completadas) → maybeSingle da data null,
 *   · cualquier otro error o forma inesperada del jsonb.
 * En todos esos casos el caller cae a su scan vivo de `intentos` (comportamiento
 * previo). Por eso este código es seguro de desplegar ANTES de aplicar la
 * migración: sin la tabla, cada función se comporta exactamente como hoy.
 *
 * cache() (React) memoiza por userId dentro de un mismo render de RSC: las varias
 * funciones del hub de una request (racha + última actividad en el layout,
 * progresiones/semestre en la página) comparten UN solo SELECT por PK. Mismo
 * patrón que getUser/getProfile en supabase-helpers.ts.
 */
const getSnapshotCompletadas = cache(async function getSnapshotCompletadas(
  userId: string
): Promise<Map<string, SnapshotEntry> | null> {
  try {
    const sb = await getSupabaseServer();
    const { data, error } = await sb
      .from("progreso_alumno_snapshot")
      .select("completadas")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) return null;

    const completadas = (data as { completadas?: unknown }).completadas;
    if (
      !completadas ||
      typeof completadas !== "object" ||
      Array.isArray(completadas)
    ) {
      return null;
    }

    const map = new Map<string, SnapshotEntry>();
    for (const [actId, raw] of Object.entries(
      completadas as Record<string, unknown>
    )) {
      if (!raw || typeof raw !== "object") continue;
      const meta = raw as { i?: unknown; s?: unknown; t?: unknown };
      // i (intento id) y s (started_at) son obligatorios; una entrada sin ellos
      // se ignora en vez de envenenar el mapa con datos a medias.
      if (typeof meta.i !== "string" || typeof meta.s !== "string") continue;
      map.set(actId, {
        intentoId: meta.i,
        startedAt: meta.s,
        tiempoSegundos: typeof meta.t === "number" ? meta.t : null,
      });
    }
    return map;
  } catch {
    return null;
  }
});

// ─── getUltimaActividadActiva ─────────────────────────────────────────────────

/**
 * Devuelve la actividad por la que el alumno debe "continuar": la primera de su
 * semestre (en orden por código) que aún no ha completado. Si ya completó todas,
 * devuelve la última. Los intentos se guardan ya como "completed" (no existe un
 * estado "in_progress" persistido), así que el avance se deriva de las completadas.
 *
 * Catálogo (árbol del semestre) cacheado; solo las actividades completadas del
 * alumno se consultan en vivo.
 */
export async function getUltimaActividadActiva(
  userId: string,
  semestre: number
): Promise<ContinuarData | null> {
  return withTimeout(
    (async (): Promise<ContinuarData | null> => {
      // 1-3. Catálogo del semestre (cacheado): uac + progresiones + actividades
      const tree = await getSemestreTree(semestre);
      if (!tree || tree.uac.length === 0) return null;
      if (tree.prog.length === 0) return null;
      if (tree.act.length === 0) return null;

      const uacById = new Map(tree.uac.map((u) => [u.id, u] as const));
      const progById = new Map(tree.prog.map((p) => [p.id, p] as const));

      // 4. Actividades ya completadas por el alumno (PERSONAL). Snapshot (1 lookup
      //    por PK) con fallback al scan vivo de `intentos` (fail-open).
      let completadasSet: Set<string>;
      const snap = await getSnapshotCompletadas(userId);
      if (snap) {
        // El snapshot trae TODAS las completadas del alumno; abajo solo se
        // consulta la pertenencia de ids que están en tree.act (este semestre),
        // así que las claves de otros semestres son inofensivas y no hace falta
        // filtrarlas.
        completadasSet = new Set(snap.keys());
      } else {
        const sb = await getSupabaseServer();
        const { data: completadosData } = await sb
          .from("intentos")
          .select("actividad_id")
          .eq("user_id", userId)
          .eq("status", "completed")
          .in("actividad_id", tree.act.map((a) => a.id));
        completadasSet = new Set(completadosData?.map((i) => i.actividad_id) ?? []);
      }

      // 5. "Continuar" = primera actividad no completada (en orden por código); si
      //    el alumno ya completó todo el semestre, la última.
      const siguiente =
        tree.act.find((a) => !completadasSet.has(a.id)) ?? tree.act[tree.act.length - 1];
      if (!siguiente?.progresion_id) return null;

      const prog = progById.get(siguiente.progresion_id);
      if (!prog?.uac_id) return null;

      const uac = uacById.get(prog.uac_id);
      if (!uac) return null;

      // 6. Info estática de la UAC para rscCodigo
      const uacStatic = getUACPorCodigo(uac.codigo);

      // 7. Conteo de actividades de la progresión y completadas (derivado en memoria)
      const actsDeProg = tree.act.filter((a) => a.progresion_id === prog.id);
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
 * Catálogo (árbol de la UAC) cacheado; los intentos del alumno en vivo.
 */
export async function getProgresionesConEstado(
  codigoUAC: string,
  userId: string
): Promise<ProgresionConEstado[]> {
  return withTimeout(
    (async (): Promise<ProgresionConEstado[]> => {
      const tree = await getUacProgTree(codigoUAC);
      if (!tree || tree.prog.length === 0) return [];

      const allActIds = tree.act.map((a) => a.id);

      // Intentos del alumno para estas actividades (PERSONAL). Snapshot (1 lookup
      // por PK) con fallback al scan vivo de `intentos` (fail-open).
      const intentosByActId: Map<string, "in_progress" | "completed"> = new Map();
      const intentoIdByActId: Map<string, string> = new Map();
      if (allActIds.length > 0) {
        const snap = await getSnapshotCompletadas(userId);
        if (snap) {
          // Todo lo del snapshot está 'completed' (no se persiste 'in_progress').
          // Las claves ajenas a esta UAC nunca se leen abajo (solo se consulta
          // por los ids de tree.act).
          for (const [actId, meta] of snap) {
            intentosByActId.set(actId, "completed");
            intentoIdByActId.set(actId, meta.intentoId);
          }
        } else {
          const sb = await getSupabaseServer();
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
      }

      // Build result
      return tree.prog.map((prog) => {
        const actsForProg = tree.act
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
 * "Siguiente propósito →" al completar una progresión.
 *
 * 100% catálogo: se deriva del árbol de la UAC cacheado, sin ninguna consulta
 * personal ni a Postgres en cache HIT.
 */
export async function getSiguienteProgresion(
  codigoUAC: string,
  numeroActual: number
): Promise<{ numero: number; titulo: string } | null> {
  return withTimeout(
    (async (): Promise<{ numero: number; titulo: string } | null> => {
      const tree = await getUacProgTree(codigoUAC);
      if (!tree) return null;

      // tree.prog viene ordenado por numero asc → el primero con numero mayor es
      // el siguiente propósito.
      const sig = tree.prog.find((p) => p.numero > numeroActual);
      return sig ? { numero: sig.numero, titulo: sig.titulo } : null;
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
  // Catálogo de la UAC (cacheado). tree null ⇒ UAC inexistente.
  const tree = await getUacProgTree(codigoUAC);
  if (!tree) return { progresion: null, actividades: [] };

  const prog = tree.prog.find((p) => p.numero === progNumero);
  if (!prog) return { progresion: null, actividades: [] };

  // Actividades de la progresión (ya vienen ordenadas por código en el árbol).
  const acts = tree.act.filter((a) => a.progresion_id === prog.id);

  if (acts.length === 0) {
    console.warn(
      "[getActividadesConEstado] Progresion sin actividades:",
      { codigoUAC, progNumero, progresionId: prog.id }
    );
    return {
      progresion: {
        id: prog.id,
        numero: prog.numero,
        titulo: prog.titulo,
        descripcion: prog.descripcion,
        tiempo_estimado_horas: prog.tiempo_estimado_horas,
        ejes_articuladores: prog.ejes_articuladores,
        transversalidades: prog.transversalidades,
        estado: "no_iniciada",
        actividadesCompletadas: 0,
        totalActividades: 0,
      },
      actividades: [],
    };
  }

  // Intentos del alumno (PERSONAL). Snapshot (1 lookup por PK) con fallback al
  // scan vivo de `intentos` (fail-open).
  const actIds = acts.map((a) => a.id);
  const intentoMap = new Map<string, { status: string; id: string }>();
  const snap = await getSnapshotCompletadas(userId);
  if (snap) {
    // Todo lo del snapshot está 'completed'. Las claves ajenas a esta progresión
    // nunca se leen abajo (solo se consulta por los ids de `acts`).
    for (const [actId, meta] of snap) {
      intentoMap.set(actId, { status: "completed", id: meta.intentoId });
    }
  } else {
    const sb = await getSupabaseServer();
    const { data: intentos } = await sb
      .from("intentos")
      .select("id, actividad_id, status, started_at")
      .eq("user_id", userId)
      .in("actividad_id", actIds)
      .order("started_at", { ascending: false });

    for (const i of intentos ?? []) {
      if (!intentoMap.has(i.actividad_id)) {
        intentoMap.set(i.actividad_id, { status: i.status, id: i.id });
      }
    }
  }

  const actividades: ActividadConEstado[] = acts
    .map((a) => {
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
    })
    .sort((a, b) => a.orden - b.orden);

  const completadas = actividades.filter((a) => a.estado === "completada").length;
  const hayEnProgreso = actividades.some((a) => a.estado === "en_progreso");
  let estadoProg: "no_iniciada" | "en_progreso" | "completada" = "no_iniciada";
  if (completadas === actividades.length && actividades.length > 0) estadoProg = "completada";
  else if (completadas > 0 || hayEnProgreso) estadoProg = "en_progreso";

  return {
    progresion: {
      id: prog.id,
      numero: prog.numero,
      titulo: prog.titulo,
      descripcion: prog.descripcion,
      tiempo_estimado_horas: prog.tiempo_estimado_horas,
      ejes_articuladores: prog.ejes_articuladores,
      transversalidades: prog.transversalidades,
      estado: estadoProg,
      actividadesCompletadas: completadas,
      totalActividades: actividades.length,
    },
    actividades,
  };
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
  const vacio: ProgresoSemestre = {
    totalProgresiones: 0,
    progresionesCompletadas: 0,
    actividadesEstaSemana: 0,
    minutosEstaSemana: 0,
    porcentaje: 0,
  };

  return withTimeout(
    (async (): Promise<ProgresoSemestre> => {
      // Catálogo del semestre (cacheado).
      const tree = await getSemestreTree(semestre);
      if (!tree || tree.uac.length === 0) return vacio;

      // Solo cuentan los propósitos oficiales 2025; los complementos no inflan la meta.
      const oficiales = tree.prog.filter((p) => p.categoria !== CATEGORIA_COMPLEMENTO);
      const totalProgresiones = oficiales.length;
      if (totalProgresiones === 0) return vacio;

      const progIdSet = new Set(oficiales.map((p) => p.id));
      const allActs = tree.act.filter(
        (a) => a.progresion_id && progIdSet.has(a.progresion_id)
      );
      const actIds = allActs.map((a) => a.id);

      if (actIds.length === 0) {
        return { ...vacio, totalProgresiones };
      }

      // Intentos completados del alumno (PERSONAL). Snapshot (1 lookup por PK)
      // con fallback al scan vivo de `intentos` (fail-open).
      type CompletadoRow = {
        actividad_id: string;
        tiempo_segundos: number | null;
        started_at: string;
      };
      let completedIntentos: CompletadoRow[] | null;
      const snap = await getSnapshotCompletadas(userId);
      if (snap) {
        // El snapshot trae TODAS las completadas del alumno; el scan vivo solo
        // traía las de este semestre (actIds). Se replica ese filtro para no
        // contar actividades de otros semestres en las stats de la semana.
        const actIdSet = new Set(actIds);
        completedIntentos = [];
        for (const [actId, meta] of snap) {
          if (actIdSet.has(actId)) {
            completedIntentos.push({
              actividad_id: actId,
              tiempo_segundos: meta.tiempoSegundos,
              started_at: meta.startedAt,
            });
          }
        }
      } else {
        const sb = await getSupabaseServer();
        const { data } = await sb
          .from("intentos")
          .select("actividad_id, tiempo_segundos, started_at")
          .eq("user_id", userId)
          .eq("status", "completed")
          .in("actividad_id", actIds);
        completedIntentos = data;
      }

      // Count completed progresiones (all activities completed)
      const completedByProg = new Map<string, Set<string>>();
      for (const act of allActs) {
        if (!act.progresion_id) continue;
        if (!completedByProg.has(act.progresion_id)) {
          completedByProg.set(act.progresion_id, new Set());
        }
      }
      const completedActIds = new Set(completedIntentos?.map((i) => i.actividad_id) ?? []);
      for (const act of allActs) {
        if (!act.progresion_id) continue;
        if (completedActIds.has(act.id)) {
          completedByProg.get(act.progresion_id)?.add(act.id);
        }
      }

      // A progresion is complete when all its activities are completed
      const actsByProg = new Map<string, string[]>();
      for (const act of allActs) {
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
// 100% personal (racha del alumno): sin catálogo, se deja intacta.

export async function getRachaDelAlumno(userId: string): Promise<RachaData> {
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

      // Fechas de actividad de los últimos 30 días (PERSONAL). Snapshot (1 lookup
      // por PK) con fallback al scan vivo de `intentos` (fail-open). Todos los
      // intentos son 'completed', así que los started_at del snapshot reproducen
      // exactamente el scan `started_at >= hace30Dias`.
      let startedAts: string[];
      const snap = await getSnapshotCompletadas(userId);
      if (snap) {
        startedAts = [];
        for (const meta of snap.values()) {
          if (new Date(meta.startedAt) >= hace30Dias) startedAts.push(meta.startedAt);
        }
      } else {
        const sb = await getSupabaseServer();
        const { data: intentos } = await sb
          .from("intentos")
          .select("started_at")
          .eq("user_id", userId)
          .gte("started_at", hace30Dias.toISOString())
          .order("started_at", { ascending: false });
        startedAts = (intentos ?? []).map((i) => i.started_at);
      }

      // Collect unique activity dates
      const activeDates = new Set<string>();
      for (const startedAt of startedAts) {
        const d = new Date(startedAt);
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
 *
 * El registro de la actividad (incluido el jsonb `contenido`) se sirve desde la
 * caché de catálogo; el intento del alumno y sus respuestas (posible fetch a R2)
 * se resuelven en vivo.
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
  return withTimeoutOrThrow(
    (async () => {
      // Registro de la actividad (CATÁLOGO — cacheado, incluye contenido).
      const act = await getActividadContenido(codigoUAC, progNumero, orden);
      if (!act) return null;

      // Intento del alumno para esta actividad (PERSONAL — en vivo).
      const sb = await getSupabaseServer();
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
 * Catálogo (árbol de la UAC) cacheado; los intentos del alumno en vivo.
 */
export async function getProgresionesCompletadasDeUAC(
  codigoUAC: string,
  userId: string
): Promise<{ completadas: number; total: number; ultimaActividad: string | null }> {
  return withTimeout(
    (async (): Promise<{ completadas: number; total: number; ultimaActividad: string | null }> => {
      const tree = await getUacProgTree(codigoUAC);
      if (!tree) return { completadas: 0, total: 0, ultimaActividad: null };

      const total = tree.prog.length;
      if (total === 0) return { completadas: 0, total: 0, ultimaActividad: null };

      const acts = tree.act;
      const actIds = acts.map((a) => a.id);
      if (actIds.length === 0) return { completadas: 0, total, ultimaActividad: null };

      // Intentos del alumno (PERSONAL). Snapshot (1 lookup por PK) con fallback
      // al scan vivo de `intentos` (fail-open).
      const completedSet = new Set<string>();
      let ultimaActividad: string | null = null;

      const snap = await getSnapshotCompletadas(userId);
      if (snap) {
        // Todo lo del snapshot está 'completed'. Se restringe a las actividades
        // de esta UAC (actIds) y se toma el started_at más reciente como "última
        // actividad" (el scan vivo ordenaba desc y tomaba el primero).
        const actIdSet = new Set(actIds);
        let ultimaTs = -Infinity;
        for (const [actId, meta] of snap) {
          if (!actIdSet.has(actId)) continue;
          completedSet.add(actId);
          const ts = new Date(meta.startedAt).getTime();
          if (ts > ultimaTs) {
            ultimaTs = ts;
            ultimaActividad = meta.startedAt;
          }
        }
      } else {
        const sb = await getSupabaseServer();
        const { data: intentos } = await sb
          .from("intentos")
          .select("actividad_id, status, started_at")
          .eq("user_id", userId)
          .in("actividad_id", actIds)
          .order("started_at", { ascending: false });

        for (const i of intentos ?? []) {
          if (!ultimaActividad) ultimaActividad = i.started_at;
          if (i.status === "completed") completedSet.add(i.actividad_id);
        }
      }

      // Group acts by progresion
      const actsByProg = new Map<string, string[]>();
      for (const a of acts) {
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

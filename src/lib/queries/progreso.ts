/**
 * Progreso queries — estadísticas personales del alumno (ruta de servidor / RSC).
 *
 * La lógica PURA de derivación (tipos + deriveRecientes/deriveCalendario/
 * deriveStats + fallback de la RPC) vive en progreso-shared.ts y la comparten
 * esta ruta de servidor y la ruta de navegador (hub-browser.ts), para no tener
 * dos copias del cálculo que puedan derivar entre sí.
 */

import { getSupabaseServer } from "@/lib/supabase-helpers";
import { UAC_BASE } from "@/lib/mccems/estructura";
import { CATEGORIA_COMPLEMENTO } from "@/lib/mccems/categorias";
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

// Re-export de los tipos públicos: los consumidores que hoy importan desde
// "@/lib/queries/progreso" siguen funcionando sin cambios.
export type {
  ProgresoUAC,
  ActividadReciente,
  EstadisticasProgreso,
  CalendarioDia,
  ResumenActividadAlumno,
} from "@/lib/queries/progreso-shared";

// ─── getProgresoDetallePorUAC ─────────────────────────────────────────────────

export async function getProgresoDetallePorUAC(
  alumnoId: string,
  semestre: number
): Promise<ProgresoUAC[]> {
  try {
    const sb = await getSupabaseServer();

    // total_progresiones NO se selecciona: el total real sale de contar las
    // progresiones oficiales abajo (la columna de BD está desalineada con eso).
    const { data: uacRows } = await sb
      .from("uac")
      .select("id, codigo, nombre")
      .eq("semestre", semestre)
      .order("codigo", { ascending: true });

    if (!uacRows || uacRows.length === 0) return [];

    // ── Carga por lotes (evita N+1): 3 consultas para todo el semestre en lugar
    //    de ~(2 + nProgresiones) consultas por UAC. Todo lo demás se agrupa en
    //    memoria. Mismo patrón que getResumenGrupoDocente en docente.ts.
    const uacIds = (uacRows as { id: string }[]).map((u) => u.id);

    const { data: progRows } = await sb
      .from("progresiones")
      .select("id, categoria, uac_id")
      .in("uac_id", uacIds);

    // Solo cuentan los propósitos oficiales 2025; los complementos no inflan la meta.
    const oficialesPorUac = new Map<string, string[]>(); // uac_id -> progIds oficiales
    const uacIdPorProg = new Map<string, string>();      // prog_id -> uac_id
    const allProgIds: string[] = [];
    for (const p of (progRows ?? []) as { id: string; categoria: string; uac_id: string }[]) {
      if (p.categoria === CATEGORIA_COMPLEMENTO) continue;
      const arr = oficialesPorUac.get(p.uac_id) ?? [];
      arr.push(p.id);
      oficialesPorUac.set(p.uac_id, arr);
      uacIdPorProg.set(p.id, p.uac_id);
      allProgIds.push(p.id);
    }

    // Actividades de todas las progresiones oficiales, en una sola consulta.
    const actsPorProg = new Map<string, string[]>(); // prog_id -> actIds
    const uacIdPorAct = new Map<string, string>();   // act_id -> uac_id (para "última actividad")
    const allActIds: string[] = [];
    if (allProgIds.length > 0) {
      const { data: actRows } = await sb
        .from("actividades")
        .select("id, progresion_id")
        .in("progresion_id", allProgIds);
      for (const a of (actRows ?? []) as { id: string; progresion_id: string }[]) {
        const arr = actsPorProg.get(a.progresion_id) ?? [];
        arr.push(a.id);
        actsPorProg.set(a.progresion_id, arr);
        allActIds.push(a.id);
        const uid = uacIdPorProg.get(a.progresion_id);
        if (uid) uacIdPorAct.set(a.id, uid);
      }
    }

    // Intentos completados del alumno, en una sola consulta.
    const completadasSet = new Set<string>();
    const intentosPorUac = new Map<string, string[]>(); // uac_id -> completed_at[]
    if (allActIds.length > 0) {
      const { data: intentos } = await sb
        .from("intentos")
        .select("actividad_id, completed_at")
        .eq("user_id", alumnoId)
        .in("actividad_id", allActIds)
        .eq("status", "completed");
      for (const it of (intentos ?? []) as { actividad_id: string; completed_at: string | null }[]) {
        completadasSet.add(it.actividad_id);
        const uid = uacIdPorAct.get(it.actividad_id);
        if (uid && it.completed_at) {
          const arr = intentosPorUac.get(uid) ?? [];
          arr.push(it.completed_at);
          intentosPorUac.set(uid, arr);
        }
      }
    }

    // Ensamblar resultados por UAC en memoria.
    const results: ProgresoUAC[] = [];
    for (const uac of uacRows as { id: string; codigo: string; nombre: string }[]) {
      const baseUAC = UAC_BASE.find((b) => b.codigo === uac.codigo);
      const rscCodigo = baseUAC?.recursoCodigo ?? "RSC-LC";
      const oficiales = oficialesPorUac.get(uac.id) ?? [];

      if (oficiales.length === 0) {
        results.push({
          codigo: uac.codigo,
          nombre: uac.nombre,
          rscCodigo,
          completadas: 0,
          total: 0,
          pct: 0,
          ultimaActividad: null,
        });
        continue;
      }

      // Progresión completada = todas sus actividades tienen intento "completed".
      let completadasProg = 0;
      for (const progId of oficiales) {
        const allActs = actsPorProg.get(progId) ?? [];
        if (allActs.length > 0 && allActs.every((id) => completadasSet.has(id))) {
          completadasProg++;
        }
      }

      const ultimaActividad = (intentosPorUac.get(uac.id) ?? [])
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null;

      const total = oficiales.length;
      results.push({
        codigo: uac.codigo,
        nombre: uac.nombre,
        rscCodigo,
        completadas: completadasProg,
        total,
        pct: total > 0 ? Math.round((completadasProg / total) * 100) : 0,
        ultimaActividad,
      });
    }

    return results;
  } catch {
    return [];
  }
}

// ─── getResumenActividadAlumno ────────────────────────────────────────────────
//
// Antes este resumen bajaba el HISTORIAL COMPLETO de intentos del alumno (join
// intentos→actividades→progresiones→uac, SIN .limit()) y derivaba las tres
// vistas en memoria. Con 15-20k alumnos activos eso son decenas de GB/mes de
// egress — y el plan Free de Supabase da 5 GB. Ahora son 3 consultas ACOTADAS
// que corren en paralelo:
//
//   1. recientes  → solo las N filas y columnas que pinta la lista (.limit()).
//   2. calendario → solo completed_at + codigo de la UAC de los últimos 30 días
//                   (el color del heatmap sale del codigo vía UAC_BASE). Va
//                   aparte porque los N recientes no cubren 30 días de heatmap.
//   3. stats      → RPC resumen_stats_alumno: los agregados (total, minutos,
//                   materia más fuerte, top tipos) se calculan EN Postgres y
//                   viajan ~200 bytes en lugar del historial entero.
//
// El costo es volver de 1 a 3 subrequests del Worker, pero el cuello de botella
// real a escala es el egress de Supabase, no los subrequests (van en paralelo).
// Si la RPC aún no existe en la BD (las migraciones se aplican A MANO en el SQL
// Editor), statsLegacyEnMemoria() reproduce el cálculo antiguo como fallback:
// este código puede desplegarse ANTES de aplicar
// supabase/migrations/23_rpc_resumen_stats_alumno.sql sin romper /hub/progreso.

// Avisar UNA sola vez por instancia: el fallback corre en cada carga de
// /hub/progreso y no queremos un warn por request en los logs del Worker.
let warnedRpcStatsFaltante = false;

export async function getResumenActividadAlumno(
  alumnoId: string,
  limiteRecientes = 15
): Promise<ResumenActividadAlumno> {
  const vacio: ResumenActividadAlumno = {
    recientes: [],
    calendario: calendarioVacio(),
    stats: statsVacias(),
  };

  try {
    const sba: SbAny = await getSupabaseServer();
    const desde = fechaInicioVentana30Dias();

    // `!inner` en actividades: si la actividad no es visible (RLS / no
    // publicada), la fila no viaja ni ocupa un lugar del .limit() — equivale al
    // filtro `i.actividades` que hacía el código en memoria. progresiones/uac
    // quedan en LEFT: una actividad sin UAC sí cuenta (con color por defecto).
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
        .eq("user_id", alumnoId)
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
        .eq("user_id", alumnoId)
        .eq("status", "completed")
        .not("completed_at", "is", null)
        .gte("completed_at", desde)
        .order("completed_at", { ascending: false }),
      // La RPC NO recibe user_id: usa auth.uid() adentro (SECURITY INVOKER),
      // así nadie puede pedir stats ajenas aunque manipule el request.
      sba.rpc("resumen_stats_alumno"),
    ]);

    let stats: EstadisticasProgreso;
    if (!statsRes.error && statsRes.data) {
      stats = normalizarStatsRpc(statsRes.data as StatsRpcPayload);
    } else if (esRpcInexistente(statsRes.error)) {
      if (!warnedRpcStatsFaltante) {
        warnedRpcStatsFaltante = true;
        console.warn(
          "[progreso] La RPC resumen_stats_alumno no existe aún en la BD — " +
            "usando cálculo legacy en memoria. Aplica " +
            "supabase/migrations/23_rpc_resumen_stats_alumno.sql en el SQL Editor."
        );
      }
      stats = await statsLegacyEnMemoria(sba, alumnoId);
    } else {
      // Otro error de la RPC: mismas stats vacías que devolvía el catch legacy.
      stats = statsVacias();
    }

    const recRows = ((recientesRes.data ?? []) as IntentoRecienteRow[])
      .filter((i) => i.actividades && i.completed_at);
    const calRows = ((calendarioRes.data ?? []) as IntentoCalendarioRow[])
      .filter((i) => i.actividades && i.completed_at);

    return {
      recientes: deriveRecientes(recRows),
      calendario: deriveCalendario(calRows),
      stats,
    };
  } catch {
    return vacio;
  }
}

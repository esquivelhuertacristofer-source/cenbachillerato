import { getSupabaseServer } from "@/lib/supabase-helpers";
import type {
  GrupoConAlumnos,
  Recomendacion,
  PlanteamientoData,
  IntentoReciente,
  FichaBiblioteca,
  PlanteamientoContenido,
  AvanceProgresion,
} from "./docente";
import {
  getUACsConCompletionGrupo,
  getProgresionesPorSemestre,
  getActividadesDificiles,
  getAlumnosEnRiesgo,
} from "./docente-stats";

// ── Planning + Library ───────────────────────────────────────────────────────

/** Recomendaciones automáticas derivadas de datos reales (3 heurísticas) */
export async function getRecomendacionesGrupo(
  grupoId: string,
  docenteId: string
): Promise<Recomendacion[]> {
  const recomendaciones: Recomendacion[] = [];

  const [uacs, dificiles, enRiesgo] = await Promise.all([
    getUACsConCompletionGrupo(grupoId, docenteId),
    getActividadesDificiles(grupoId, docenteId),
    getAlumnosEnRiesgo(grupoId),
  ]);

  // Heurística 1: UAC con avance < 60%
  for (const uac of uacs) {
    if (uac.estado === "rojo" && uac.total_actividades > 0) {
      recomendaciones.push({
        tipo: "UAC_BAJO",
        titulo: `Avance bajo en ${uac.codigo}`,
        descripcion: `La UAC "${uac.nombre}" tiene solo ${uac.pct_completion}% de completion en la cohorte.`,
        dato_respaldo: `${uac.actividades_completadas_cohorte} completadas de ${uac.total_actividades * (uac.pct_completion > 0 ? Math.round(uac.actividades_completadas_cohorte / (uac.pct_completion / 100)) : 1)} posibles`,
        accion_sugerida: "Revisa si los alumnos tuvieron acceso a las actividades de esta UAC. Considera dedicar clase a reforzar los conceptos.",
        prioridad: "alta",
        ref_id: uac.id,
      });
    } else if (uac.estado === "amarillo" && uac.total_actividades > 0) {
      recomendaciones.push({
        tipo: "UAC_BAJO",
        titulo: `Avance moderado en ${uac.codigo}`,
        descripcion: `La UAC "${uac.nombre}" está al ${uac.pct_completion}% — por debajo del 70% esperado.`,
        dato_respaldo: `${uac.pct_completion}% de completion de la cohorte`,
        accion_sugerida: "Monitorea de cerca esta semana. Si no sube, considera una sesión de apoyo.",
        prioridad: "media",
        ref_id: uac.id,
      });
    }
  }

  // Heurística 2: Actividades con score promedio < 50
  for (const act of dificiles.slice(0, 3)) {
    if (act.razon === "score_bajo") {
      recomendaciones.push({
        tipo: "ACTIVIDAD_DIFICIL",
        titulo: `Dificultad en actividad ${act.codigo}`,
        descripcion: `"${act.titulo}" tiene score promedio de ${act.score_promedio}/100 con ${act.total_intentos} intentos registrados.`,
        dato_respaldo: `Score promedio: ${act.score_promedio}/100 · UAC: ${act.uac_codigo}`,
        accion_sugerida: "Revisa la actividad antes de la próxima clase. Puede necesitar instrucción adicional o ajuste de dificultad.",
        prioridad: "alta",
        ref_id: act.id,
      });
    } else if (act.razon === "abandono_alto") {
      recomendaciones.push({
        tipo: "ACTIVIDAD_DIFICIL",
        titulo: `Alta tasa de abandono en ${act.codigo}`,
        descripcion: `"${act.titulo}" tiene ${act.tasa_abandono}% de abandono — los alumnos no terminan la actividad.`,
        dato_respaldo: `Tasa de abandono: ${act.tasa_abandono}% · ${act.total_intentos} intentos`,
        accion_sugerida: "Verifica si la actividad tiene problemas técnicos o si el tiempo estimado es insuficiente.",
        prioridad: "media",
        ref_id: act.id,
      });
    }
  }

  // Heurística 3: Alumnos sin actividad en >7 días
  if (enRiesgo.length > 0) {
    recomendaciones.push({
      tipo: "ALUMNO_RIESGO",
      titulo: `${enRiesgo.length} alumno${enRiesgo.length > 1 ? "s" : ""} sin actividad reciente`,
      descripcion: `${enRiesgo.length} alumno${enRiesgo.length > 1 ? "s" : ""} no ha${enRiesgo.length > 1 ? "n" : ""} registrado actividad en los últimos 7 días.`,
      dato_respaldo: enRiesgo.slice(0, 3).map((a) => a.full_name ?? a.email).join(", ") +
        (enRiesgo.length > 3 ? ` y ${enRiesgo.length - 3} más` : ""),
      accion_sugerida: "Contacta a estos alumnos directamente. Puede haber problemas de acceso, motivación o circunstancias personales.",
      prioridad: enRiesgo.length >= 3 ? "alta" : "media",
    });
  }

  return recomendaciones.sort((a, b) => {
    const p = { alta: 0, media: 1, baja: 2 };
    return p[a.prioridad] - p[b.prioridad];
  });
}

/** Datos completos de planteamiento para un grupo */
export async function getPlanteamientoGrupo(
  grupoId: string,
  docenteId: string
): Promise<PlanteamientoData | null> {
  const sb = await getSupabaseServer();

  const { data: grupoRaw } = await sb
    .from("grupos")
    .select("id, nombre, semestre")
    .eq("id", grupoId)
    .eq("id_docente", docenteId)
    .maybeSingle();

  if (!grupoRaw) return null;

  const { count: totalAlumnos } = await sb
    .from("alumnos_grupos")
    .select("id_alumno", { count: "exact", head: true })
    .eq("id_grupo", grupoId);

  const grupo: GrupoConAlumnos = {
    ...grupoRaw,
    total_alumnos: totalAlumnos ?? 0,
  };

  const [uacs, progresiones, recomendaciones] = await Promise.all([
    getUACsConCompletionGrupo(grupoId, docenteId),
    getProgresionesPorSemestre(grupoRaw.semestre, grupoId),
    getRecomendacionesGrupo(grupoId, docenteId),
  ]);

  const totalActividadesSemestre = uacs.reduce((s, u) => s + u.total_actividades, 0);
  const totalCompletadasGlobal = uacs.reduce((s, u) => s + u.actividades_completadas_cohorte, 0);
  const maxPosible = totalActividadesSemestre * grupo.total_alumnos;
  const pctGlobal = maxPosible > 0 ? Math.round((totalCompletadasGlobal / maxPosible) * 100) : 0;

  return {
    grupo,
    uacs,
    progresiones,
    recomendaciones,
    total_actividades_semestre: totalActividadesSemestre,
    pct_completion_global: pctGlobal,
  };
}

/** Intentos recientes de alumnos del docente (para feed de actividad en home) */
export async function getIntentosRecientesDocente(
  docenteId: string,
  limit = 10
): Promise<IntentoReciente[]> {
  const sb = await getSupabaseServer();

  const { data: grupos } = await sb
    .from("grupos")
    .select("id")
    .eq("id_docente", docenteId);

  if (!grupos || grupos.length === 0) return [];

  const grupoIds = grupos.map((g) => g.id);

  const { data: relaciones } = await sb
    .from("alumnos_grupos")
    .select("id_alumno")
    .in("id_grupo", grupoIds);

  const alumnoIds = [...new Set(relaciones?.map((r) => r.id_alumno) ?? [])];
  if (alumnoIds.length === 0) return [];

  const { data: intentos } = await sb
    .from("intentos")
    .select("id, user_id, actividad_id, score, tiempo_segundos, status, completed_at, started_at")
    .in("user_id", alumnoIds)
    .order("started_at", { ascending: false })
    .limit(limit * 3); // extra para deduplicar

  if (!intentos || intentos.length === 0) return [];

  const actividadIds = [...new Set(intentos.map((i) => i.actividad_id))];
  const perfilIds = [...new Set(intentos.map((i) => i.user_id))];

  const [{ data: actividades }, { data: perfiles }] = await Promise.all([
    sb.from("actividades").select("id, codigo, titulo").in("id", actividadIds),
    sb.from("profiles").select("id, full_name, email").in("id", perfilIds),
  ]);

  const actMap = new Map(actividades?.map((a) => [a.id, a]) ?? []);
  const perfilMap = new Map(perfiles?.map((p) => [p.id, p]) ?? []);

  return intentos.slice(0, limit).map((i) => {
    const act = actMap.get(i.actividad_id);
    const perfil = perfilMap.get(i.user_id);
    return {
      id: i.id,
      alumno_nombre: perfil?.full_name ?? null,
      alumno_email: perfil?.email ?? "—",
      actividad_titulo: act?.titulo ?? "—",
      actividad_codigo: act?.codigo ?? "—",
      score: i.score,
      tiempo_segundos: i.tiempo_segundos,
      status: i.status,
      completed_at: i.completed_at,
      started_at: i.started_at,
    };
  });
}

/** Fichas de biblioteca del semestre del grupo */
export async function getFichasBibliotecaPorSemestre(
  semestre: number
): Promise<FichaBiblioteca[]> {
  const sb = await getSupabaseServer();

  const { data: uacs } = await sb
    .from("uac")
    .select("id, codigo, nombre")
    .eq("semestre", semestre);

  if (!uacs || uacs.length === 0) return [];

  const uacIds = uacs.map((u) => u.id);
  const uacMap = new Map(uacs.map((u) => [u.id, u]));

  // fichas_biblioteca is not in the generated types until migration 05_biblioteca.sql runs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sba: any = sb;
  const { data: fichas } = await sba
    .from("fichas_biblioteca")
    .select("id, titulo, categoria, slug, tiempo_lectura_minutos, uac_id")
    .in("uac_id", uacIds)
    .order("orden", { ascending: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (fichas ?? []).map((f: any) => {
    const uac = uacMap.get(f.uac_id);
    return {
      ...f,
      uac_codigo: uac?.codigo,
      uac_nombre: uac?.nombre,
    };
  });
}

/**
 * Devuelve el contenido pedagógico MCCEMS de una progresión específica.
 * Retorna null si la progresión no tiene planteamiento cargado.
 */
export async function getPlanteamientoPorProgresion(
  progresionId: string
): Promise<PlanteamientoContenido | null> {
  const sb = await getSupabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sba: any = sb;
  const { data, error } = await sba
    .from("planteamiento_progresiones")
    .select("id, progresion_id, contenido, version_curricular, nivel_revision, updated_at")
    .eq("progresion_id", progresionId)
    .eq("version_curricular", "MCCEMS_2025")
    .maybeSingle();

  if (error || !data) return null;
  return data as PlanteamientoContenido;
}

/**
 * Devuelve mapa { progresion_id: contenido } para todas las progresiones
 * del semestre del grupo. Útil para precargar el visor de contenido.
 */
export async function getPlanteamientosDelGrupo(
  grupoId: string
): Promise<Map<string, PlanteamientoContenido>> {
  const sb = await getSupabaseServer();

  const { data: grupoRaw } = await sb
    .from("grupos")
    .select("semestre")
    .eq("id", grupoId)
    .maybeSingle();

  if (!grupoRaw) return new Map();

  // Obtener IDs de todas las progresiones del semestre via uac
  const { data: uacs } = await sb
    .from("uac")
    .select("id")
    .eq("semestre", grupoRaw.semestre);

  if (!uacs || uacs.length === 0) return new Map();

  const uacIds = uacs.map((u) => u.id);

  const { data: progresiones } = await sb
    .from("progresiones")
    .select("id")
    .in("uac_id", uacIds);

  if (!progresiones || progresiones.length === 0) return new Map();

  const progresionIds = progresiones.map((p) => p.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sba: any = sb;
  const { data: planteamientos } = await sba
    .from("planteamiento_progresiones")
    .select("id, progresion_id, contenido, version_curricular, nivel_revision, updated_at")
    .in("progresion_id", progresionIds)
    .eq("version_curricular", "MCCEMS_2025");

  const resultado = new Map<string, PlanteamientoContenido>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const p of (planteamientos ?? []) as any[]) {
    resultado.set(p.progresion_id as string, p as PlanteamientoContenido);
  }
  return resultado;
}

/**
 * Calcula avance de los alumnos del grupo en una progresión específica:
 * % de alumnos que completaron alguna actividad de esa progresión y score promedio.
 */
export async function getAvanceGrupoEnProgresion(
  grupoId: string,
  progresionId: string
): Promise<AvanceProgresion> {
  const sb = await getSupabaseServer();

  // Total alumnos en el grupo
  const { count: totalAlumnos } = await sb
    .from("alumnos_grupos")
    .select("id_alumno", { count: "exact", head: true })
    .eq("id_grupo", grupoId);

  if (!totalAlumnos || totalAlumnos === 0) {
    return { progresion_id: progresionId, total_alumnos: 0, alumnos_con_actividad: 0, pct_completion: 0, score_promedio: null };
  }

  // Actividades de la progresión
  const { data: actividades } = await sb
    .from("actividades")
    .select("id")
    .eq("progresion_id", progresionId);

  if (!actividades || actividades.length === 0) {
    return { progresion_id: progresionId, total_alumnos: totalAlumnos, alumnos_con_actividad: 0, pct_completion: 0, score_promedio: null };
  }

  const actividadIds = actividades.map((a) => a.id);

  // Alumnos del grupo
  const { data: alumnosGrupo } = await sb
    .from("alumnos_grupos")
    .select("id_alumno")
    .eq("id_grupo", grupoId);

  const alumnoIds = (alumnosGrupo ?? []).map((a) => a.id_alumno);

  // Intentos completados de esos alumnos en esas actividades
  const { data: intentos } = await sb
    .from("intentos")
    .select("user_id, score")
    .in("actividad_id", actividadIds)
    .in("user_id", alumnoIds)
    .eq("status", "completed");

  const alumnosConActividad = new Set((intentos ?? []).map((i) => i.user_id)).size;
  const pct = Math.round((alumnosConActividad / totalAlumnos) * 100);
  const scores = (intentos ?? []).map((i) => i.score).filter((s): s is number => s !== null);
  const scorePromedio = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  return {
    progresion_id: progresionId,
    total_alumnos: totalAlumnos,
    alumnos_con_actividad: alumnosConActividad,
    pct_completion: pct,
    score_promedio: scorePromedio,
  };
}

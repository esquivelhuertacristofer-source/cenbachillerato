import { getSupabaseServer } from "@/lib/supabase-helpers";

// ── Tipos base ──────────────────────────────────────────────────────────────

export interface GrupoConAlumnos {
  id: string;
  nombre: string;
  semestre: number;
  total_alumnos: number;
}

export interface AlumnoConGrupo {
  id: string;
  full_name: string | null;
  email: string;
  grupo_id: string;
  grupo_nombre: string;
  semestre: number;
  actividades_completadas: number;
  score_promedio: number | null;
  ultimo_intento: string | null;
}

export interface AlumnoConProgreso {
  id: string;
  full_name: string | null;
  email: string;
  actividades_completadas: number;
  score_promedio: number | null;
  tiempo_total_minutos: number;
  ultimo_intento: string | null;
}

export interface UACCompletionData {
  id: string;
  codigo: string;
  nombre: string;
  semestre: number;
  total_progresiones: number;
  total_actividades: number;
  actividades_completadas_cohorte: number;
  pct_completion: number;
  estado: "verde" | "amarillo" | "rojo" | "sin-datos";
}

export interface ProgresionData {
  id: string;
  codigo: string;
  numero: number;
  titulo: string;
  uac_id: string;
  uac_codigo: string;
  uac_nombre: string;
  total_actividades: number;
  alumnos_completaron: number;
  total_alumnos: number;
  pct_completion: number;
}

export interface ActividadStats {
  id: string;
  codigo: string;
  titulo: string;
  tipo: string;
  uac_codigo: string;
  uac_nombre: string;
  total_intentos: number;
  completadas: number;
  score_promedio: number | null;
  tiempo_promedio_min: number | null;
  tasa_abandono: number;
  ultima_actividad: string | null;
}

export interface ActividadDificil {
  id: string;
  codigo: string;
  titulo: string;
  tipo: string;
  uac_codigo: string;
  score_promedio: number;
  tasa_error: number;
  tasa_abandono: number;
  total_intentos: number;
  razon: "score_bajo" | "abandono_alto" | "fallo_alto";
}

export interface AlumnoRiesgo {
  id: string;
  full_name: string | null;
  email: string;
  grupo_nombre: string;
  dias_sin_actividad: number;
  actividades_completadas: number;
}

export type TipoRecomendacion =
  | "UAC_BAJO"
  | "ACTIVIDAD_DIFICIL"
  | "ALUMNO_RIESGO"
  | "PROGRESION_PENDIENTE";

export interface Recomendacion {
  tipo: TipoRecomendacion;
  titulo: string;
  descripcion: string;
  dato_respaldo: string;
  accion_sugerida: string;
  prioridad: "alta" | "media" | "baja";
  ref_id?: string;
}

export interface PlanteamientoData {
  grupo: GrupoConAlumnos;
  uacs: UACCompletionData[];
  progresiones: ProgresionData[];
  recomendaciones: Recomendacion[];
  total_actividades_semestre: number;
  pct_completion_global: number;
}

export interface IntentoReciente {
  id: string;
  alumno_nombre: string | null;
  alumno_email: string;
  actividad_titulo: string;
  actividad_codigo: string;
  score: number | null;
  tiempo_segundos: number | null;
  status: string;
  completed_at: string | null;
  started_at: string;
}

export interface FichaBiblioteca {
  id: string;
  titulo: string;
  categoria: string | null;
  slug: string;
  tiempo_lectura_minutos: number | null;
  uac_id: string;
  uac_codigo?: string;
  uac_nombre?: string;
}

// ── Queries base (existentes) ───────────────────────────────────────────────

export async function getGruposDocente(docenteId: string): Promise<GrupoConAlumnos[]> {
  const sb = await getSupabaseServer();

  const { data: grupos } = await sb
    .from("grupos")
    .select("id, nombre, semestre")
    .eq("id_docente", docenteId);

  if (!grupos || grupos.length === 0) return [];

  const gruposConAlumnos = await Promise.all(
    grupos.map(async (g) => {
      const { count } = await sb
        .from("alumnos_grupos")
        .select("id_alumno", { count: "exact", head: true })
        .eq("id_grupo", g.id);
      return { ...g, total_alumnos: count ?? 0 };
    })
  );

  return gruposConAlumnos;
}

export async function getMetricasDocente(docenteId: string) {
  const grupos = await getGruposDocente(docenteId);
  const totalAlumnos = grupos.reduce((sum, g) => sum + g.total_alumnos, 0);
  const uacEnCurso = new Set(grupos.map((g) => g.semestre)).size;

  return {
    totalGrupos: grupos.length,
    totalAlumnos,
    uacEnCurso,
    grupos,
  };
}

// ── Queries nuevas ──────────────────────────────────────────────────────────

/** Todos los alumnos de todos los grupos del docente, con métricas básicas */
export async function getAlumnosDelDocente(docenteId: string): Promise<AlumnoConGrupo[]> {
  const sb = await getSupabaseServer();

  const { data: grupos } = await sb
    .from("grupos")
    .select("id, nombre, semestre")
    .eq("id_docente", docenteId);

  if (!grupos || grupos.length === 0) return [];

  const grupoIds = grupos.map((g) => g.id);
  const grupoMap = new Map(grupos.map((g) => [g.id, g]));

  const { data: relaciones } = await sb
    .from("alumnos_grupos")
    .select("id_alumno, id_grupo")
    .in("id_grupo", grupoIds);

  if (!relaciones || relaciones.length === 0) return [];

  const alumnoIds = [...new Set(relaciones.map((r) => r.id_alumno))];

  const { data: profiles } = await sb
    .from("profiles")
    .select("id, full_name, email")
    .in("id", alumnoIds);

  if (!profiles) return [];

  const { data: intentos } = await sb
    .from("intentos")
    .select("user_id, score, status, completed_at")
    .in("user_id", alumnoIds)
    .eq("status", "completed");

  const intentosPorAlumno = new Map<string, { count: number; scoreSum: number; ultimo: string | null }>();
  for (const i of intentos ?? []) {
    const prev = intentosPorAlumno.get(i.user_id) ?? { count: 0, scoreSum: 0, ultimo: null };
    intentosPorAlumno.set(i.user_id, {
      count: prev.count + 1,
      scoreSum: prev.scoreSum + (i.score ?? 0),
      ultimo: !prev.ultimo || (i.completed_at ?? "") > prev.ultimo ? (i.completed_at ?? null) : prev.ultimo,
    });
  }

  return profiles.map((p) => {
    const relacion = relaciones.find((r) => r.id_alumno === p.id);
    const grupo = relacion ? grupoMap.get(relacion.id_grupo) : undefined;
    const stats = intentosPorAlumno.get(p.id);
    return {
      id: p.id,
      full_name: p.full_name,
      email: p.email,
      grupo_id: relacion?.id_grupo ?? "",
      grupo_nombre: grupo?.nombre ?? "—",
      semestre: grupo?.semestre ?? 0,
      actividades_completadas: stats?.count ?? 0,
      score_promedio: stats && stats.count > 0 ? Math.round(stats.scoreSum / stats.count) : null,
      ultimo_intento: stats?.ultimo ?? null,
    };
  });
}

/** Alumnos de un grupo específico con progreso de intentos */
export async function getAlumnosConProgreso(
  grupoId: string,
  docenteId: string
): Promise<AlumnoConProgreso[]> {
  const sb = await getSupabaseServer();

  // Verificar que el grupo pertenece al docente
  const { data: grupo } = await sb
    .from("grupos")
    .select("id")
    .eq("id", grupoId)
    .eq("id_docente", docenteId)
    .maybeSingle();

  if (!grupo) return [];

  const { data: relaciones } = await sb
    .from("alumnos_grupos")
    .select("id_alumno")
    .eq("id_grupo", grupoId);

  if (!relaciones || relaciones.length === 0) return [];

  const alumnoIds = relaciones.map((r) => r.id_alumno);

  const { data: profiles } = await sb
    .from("profiles")
    .select("id, full_name, email")
    .in("id", alumnoIds);

  if (!profiles) return [];

  const { data: intentos } = await sb
    .from("intentos")
    .select("user_id, score, tiempo_segundos, status, completed_at")
    .in("user_id", alumnoIds)
    .eq("status", "completed");

  const statsPorAlumno = new Map<string, {
    count: number;
    scoreSum: number;
    tiempoTotal: number;
    ultimo: string | null;
  }>();

  for (const i of intentos ?? []) {
    const prev = statsPorAlumno.get(i.user_id) ?? { count: 0, scoreSum: 0, tiempoTotal: 0, ultimo: null };
    statsPorAlumno.set(i.user_id, {
      count: prev.count + 1,
      scoreSum: prev.scoreSum + (i.score ?? 0),
      tiempoTotal: prev.tiempoTotal + (i.tiempo_segundos ?? 0),
      ultimo: !prev.ultimo || (i.completed_at ?? "") > prev.ultimo ? (i.completed_at ?? null) : prev.ultimo,
    });
  }

  return profiles.map((p) => {
    const stats = statsPorAlumno.get(p.id);
    return {
      id: p.id,
      full_name: p.full_name,
      email: p.email,
      actividades_completadas: stats?.count ?? 0,
      score_promedio: stats && stats.count > 0 ? Math.round(stats.scoreSum / stats.count) : null,
      tiempo_total_minutos: stats ? Math.round(stats.tiempoTotal / 60) : 0,
      ultimo_intento: stats?.ultimo ?? null,
    };
  });
}

/** UACs del semestre del grupo con completion de la cohorte */
export async function getUACsConCompletionGrupo(grupoId: string): Promise<UACCompletionData[]> {
  const sb = await getSupabaseServer();

  const { data: grupo } = await sb
    .from("grupos")
    .select("semestre")
    .eq("id", grupoId)
    .maybeSingle();

  if (!grupo) return [];

  const { data: uacs } = await sb
    .from("uac")
    .select("id, codigo, nombre, semestre, total_progresiones")
    .eq("semestre", grupo.semestre)
    .order("orden", { ascending: true });

  if (!uacs || uacs.length === 0) return [];

  const { data: relaciones } = await sb
    .from("alumnos_grupos")
    .select("id_alumno")
    .eq("id_grupo", grupoId);

  const totalAlumnos = relaciones?.length ?? 0;
  const alumnoIds = relaciones?.map((r) => r.id_alumno) ?? [];

  const resultados: UACCompletionData[] = await Promise.all(
    uacs.map(async (uac) => {
      // Actividades de esta UAC (publicadas)
      const { data: progs } = await sb
        .from("progresiones")
        .select("id")
        .eq("uac_id", uac.id);

      const progIds = progs?.map((p) => p.id) ?? [];

      if (progIds.length === 0) {
        return {
          id: uac.id,
          codigo: uac.codigo,
          nombre: uac.nombre,
          semestre: uac.semestre,
          total_progresiones: uac.total_progresiones,
          total_actividades: 0,
          actividades_completadas_cohorte: 0,
          pct_completion: 0,
          estado: "sin-datos" as const,
        };
      }

      const { data: actividades } = await sb
        .from("actividades")
        .select("id")
        .in("progresion_id", progIds)
        .eq("estado", "publicada");

      const totalActividades = actividades?.length ?? 0;
      const actividadIds = actividades?.map((a) => a.id) ?? [];

      // Intentos completados de alumnos del grupo en actividades de esta UAC
      let completadasCohorte = 0;
      if (actividadIds.length > 0 && alumnoIds.length > 0) {
        const { count } = await sb
          .from("intentos")
          .select("id", { count: "exact", head: true })
          .in("actividad_id", actividadIds)
          .in("user_id", alumnoIds)
          .eq("status", "completed");
        completadasCohorte = count ?? 0;
      }

      const maxPosible = totalActividades * totalAlumnos;
      const pct = maxPosible > 0 ? Math.round((completadasCohorte / maxPosible) * 100) : 0;
      const estado =
        totalAlumnos === 0 ? "sin-datos" :
        pct >= 70 ? "verde" :
        pct >= 40 ? "amarillo" : "rojo";

      return {
        id: uac.id,
        codigo: uac.codigo,
        nombre: uac.nombre,
        semestre: uac.semestre,
        total_progresiones: uac.total_progresiones,
        total_actividades: totalActividades,
        actividades_completadas_cohorte: completadasCohorte,
        pct_completion: pct,
        estado: estado as UACCompletionData["estado"],
      };
    })
  );

  return resultados;
}

/** Progresiones de un semestre con completion de la cohorte */
export async function getProgresionesPorSemestre(
  semestre: number,
  grupoId: string
): Promise<ProgresionData[]> {
  const sb = await getSupabaseServer();

  const { data: uacs } = await sb
    .from("uac")
    .select("id, codigo, nombre")
    .eq("semestre", semestre);

  if (!uacs || uacs.length === 0) return [];

  const uacIds = uacs.map((u) => u.id);
  const uacMap = new Map(uacs.map((u) => [u.id, u]));

  const { data: progresiones } = await sb
    .from("progresiones")
    .select("id, codigo, numero, titulo, uac_id")
    .in("uac_id", uacIds)
    .order("uac_id")
    .order("numero");

  if (!progresiones || progresiones.length === 0) return [];

  const { data: relaciones } = await sb
    .from("alumnos_grupos")
    .select("id_alumno")
    .eq("id_grupo", grupoId);

  const totalAlumnos = relaciones?.length ?? 0;
  const alumnoIds = relaciones?.map((r) => r.id_alumno) ?? [];

  const resultado: ProgresionData[] = await Promise.all(
    progresiones.map(async (prog) => {
      const { data: actividades } = await sb
        .from("actividades")
        .select("id")
        .eq("progresion_id", prog.id)
        .eq("estado", "publicada");

      const actividadIds = actividades?.map((a) => a.id) ?? [];
      let alumnosCompletaron = 0;

      if (actividadIds.length > 0 && alumnoIds.length > 0) {
        // Un alumno "completó la progresión" si completó al menos 1 actividad de ella
        const { data: intentosCompletados } = await sb
          .from("intentos")
          .select("user_id")
          .in("actividad_id", actividadIds)
          .in("user_id", alumnoIds)
          .eq("status", "completed");

        const alumnosUnicos = new Set(intentosCompletados?.map((i) => i.user_id) ?? []);
        alumnosCompletaron = alumnosUnicos.size;
      }

      const uac = uacMap.get(prog.uac_id);
      const pct = totalAlumnos > 0 ? Math.round((alumnosCompletaron / totalAlumnos) * 100) : 0;

      return {
        id: prog.id,
        codigo: prog.codigo,
        numero: prog.numero,
        titulo: prog.titulo,
        uac_id: prog.uac_id,
        uac_codigo: uac?.codigo ?? "—",
        uac_nombre: uac?.nombre ?? "—",
        total_actividades: actividadIds.length,
        alumnos_completaron: alumnosCompletaron,
        total_alumnos: totalAlumnos,
        pct_completion: pct,
      };
    })
  );

  return resultado;
}

/** Stats de actividades para un grupo (seguimiento de actividades) */
export async function getActividadesStatsGrupo(
  grupoId: string,
  docenteId: string
): Promise<ActividadStats[]> {
  const sb = await getSupabaseServer();

  const { data: grupo } = await sb
    .from("grupos")
    .select("semestre")
    .eq("id", grupoId)
    .eq("id_docente", docenteId)
    .maybeSingle();

  if (!grupo) return [];

  const { data: relaciones } = await sb
    .from("alumnos_grupos")
    .select("id_alumno")
    .eq("id_grupo", grupoId);

  const alumnoIds = relaciones?.map((r) => r.id_alumno) ?? [];
  if (alumnoIds.length === 0) return [];

  // UACs del semestre
  const { data: uacs } = await sb
    .from("uac")
    .select("id, codigo, nombre")
    .eq("semestre", grupo.semestre);

  if (!uacs || uacs.length === 0) return [];

  const uacIds = uacs.map((u) => u.id);
  const uacMap = new Map(uacs.map((u) => [u.id, u]));

  const { data: progs } = await sb
    .from("progresiones")
    .select("id, uac_id")
    .in("uac_id", uacIds);

  const progMap = new Map(progs?.map((p) => [p.id, p.uac_id]) ?? []);
  const progIds = progs?.map((p) => p.id) ?? [];

  const { data: actividades } = await sb
    .from("actividades")
    .select("id, codigo, titulo, tipo, progresion_id")
    .in("progresion_id", progIds)
    .eq("estado", "publicada");

  if (!actividades || actividades.length === 0) return [];

  const actividadIds = actividades.map((a) => a.id);

  const { data: intentos } = await sb
    .from("intentos")
    .select("actividad_id, user_id, score, tiempo_segundos, status, completed_at")
    .in("actividad_id", actividadIds)
    .in("user_id", alumnoIds);

  const intentosPorActividad = new Map<string, {
    total: number;
    completadas: number;
    abandonadas: number;
    fallidas: number;
    scoreSum: number;
    tiempoSum: number;
    ultima: string | null;
  }>();

  for (const i of intentos ?? []) {
    const prev = intentosPorActividad.get(i.actividad_id) ?? {
      total: 0, completadas: 0, abandonadas: 0, fallidas: 0,
      scoreSum: 0, tiempoSum: 0, ultima: null,
    };
    intentosPorActividad.set(i.actividad_id, {
      total: prev.total + 1,
      completadas: prev.completadas + (i.status === "completed" ? 1 : 0),
      abandonadas: prev.abandonadas + (i.status === "abandoned" ? 1 : 0),
      fallidas: prev.fallidas + (i.status === "failed" ? 1 : 0),
      scoreSum: prev.scoreSum + (i.score ?? 0),
      tiempoSum: prev.tiempoSum + (i.tiempo_segundos ?? 0),
      ultima: !prev.ultima || (i.completed_at ?? "") > prev.ultima
        ? (i.completed_at ?? null)
        : prev.ultima,
    });
  }

  return actividades.map((act) => {
    const stats = intentosPorActividad.get(act.id);
    const uacId = progMap.get(act.progresion_id ?? "");
    const uac = uacId ? uacMap.get(uacId) : undefined;

    return {
      id: act.id,
      codigo: act.codigo,
      titulo: act.titulo,
      tipo: act.tipo,
      uac_codigo: uac?.codigo ?? "—",
      uac_nombre: uac?.nombre ?? "—",
      total_intentos: stats?.total ?? 0,
      completadas: stats?.completadas ?? 0,
      score_promedio: stats && stats.completadas > 0
        ? Math.round(stats.scoreSum / stats.completadas) : null,
      tiempo_promedio_min: stats && stats.completadas > 0
        ? Math.round(stats.tiempoSum / stats.completadas / 60) : null,
      tasa_abandono: stats && stats.total > 0
        ? Math.round((stats.abandonadas / stats.total) * 100) : 0,
      ultima_actividad: stats?.ultima ?? null,
    };
  });
}

/** Actividades con dificultad elevada (score bajo o abandon alto) */
export async function getActividadesDificiles(
  grupoId: string,
  docenteId: string
): Promise<ActividadDificil[]> {
  const stats = await getActividadesStatsGrupo(grupoId, docenteId);
  const MIN_INTENTOS = 2;

  return stats
    .filter((a) => a.total_intentos >= MIN_INTENTOS)
    .filter((a) =>
      (a.score_promedio !== null && a.score_promedio < 50) ||
      a.tasa_abandono > 30
    )
    .map((a) => {
      let razon: ActividadDificil["razon"] = "score_bajo";
      if (a.tasa_abandono > 30) razon = "abandono_alto";
      else if (a.score_promedio !== null && a.score_promedio < 50) razon = "score_bajo";

      return {
        id: a.id,
        codigo: a.codigo,
        titulo: a.titulo,
        tipo: a.tipo,
        uac_codigo: a.uac_codigo,
        score_promedio: a.score_promedio ?? 0,
        tasa_error: 100 - (a.score_promedio ?? 0),
        tasa_abandono: a.tasa_abandono,
        total_intentos: a.total_intentos,
        razon,
      };
    })
    .sort((a, b) => a.score_promedio - b.score_promedio);
}

/** Alumnos sin actividad reciente (>7 días sin intentos) */
export async function getAlumnosEnRiesgo(grupoId: string): Promise<AlumnoRiesgo[]> {
  const sb = await getSupabaseServer();

  const { data: grupo } = await sb
    .from("grupos")
    .select("nombre")
    .eq("id", grupoId)
    .maybeSingle();

  if (!grupo) return [];

  const { data: relaciones } = await sb
    .from("alumnos_grupos")
    .select("id_alumno")
    .eq("id_grupo", grupoId);

  if (!relaciones || relaciones.length === 0) return [];

  const alumnoIds = relaciones.map((r) => r.id_alumno);

  const { data: profiles } = await sb
    .from("profiles")
    .select("id, full_name, email")
    .in("id", alumnoIds);

  if (!profiles) return [];

  const haceUnaSemana = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: intentosRecientes } = await sb
    .from("intentos")
    .select("user_id, completed_at, status")
    .in("user_id", alumnoIds)
    .gte("started_at", haceUnaSemana);

  const alumnosActivos = new Set(intentosRecientes?.map((i) => i.user_id) ?? []);

  const { data: todosSusBtns } = await sb
    .from("intentos")
    .select("user_id, status")
    .in("user_id", alumnoIds)
    .eq("status", "completed");

  const completadasPorAlumno = new Map<string, number>();
  for (const i of todosSusBtns ?? []) {
    completadasPorAlumno.set(i.user_id, (completadasPorAlumno.get(i.user_id) ?? 0) + 1);
  }

  return profiles
    .filter((p) => !alumnosActivos.has(p.id))
    .map((p) => ({
      id: p.id,
      full_name: p.full_name,
      email: p.email,
      grupo_nombre: grupo.nombre,
      dias_sin_actividad: 7,
      actividades_completadas: completadasPorAlumno.get(p.id) ?? 0,
    }));
}

/** Recomendaciones automáticas derivadas de datos reales (3 heurísticas) */
export async function getRecomendacionesGrupo(
  grupoId: string,
  docenteId: string
): Promise<Recomendacion[]> {
  const recomendaciones: Recomendacion[] = [];

  const [uacs, dificiles, enRiesgo] = await Promise.all([
    getUACsConCompletionGrupo(grupoId),
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
    getUACsConCompletionGrupo(grupoId),
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

  const { data: fichas } = await sb
    .from("fichas_biblioteca")
    .select("id, titulo, categoria, slug, tiempo_lectura_minutos, uac_id")
    .in("uac_id", uacIds)
    .order("orden", { ascending: true });

  return (fichas ?? []).map((f) => {
    const uac = uacMap.get(f.uac_id);
    return {
      ...f,
      uac_codigo: uac?.codigo,
      uac_nombre: uac?.nombre,
    };
  });
}

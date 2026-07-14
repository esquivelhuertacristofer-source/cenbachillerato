import { getSupabaseServer } from "@/lib/supabase-helpers";
import type {
  GrupoConAlumnos,
  AlumnoConGrupo,
  AlumnoConProgreso,
  TopAlumno,
  AlumnoDetalle,
} from "./docente";

// ── Group & Student Management ───────────────────────────────────────────────

export async function getGruposDocente(docenteId: string): Promise<GrupoConAlumnos[]> {
  const sb = await getSupabaseServer();

  const { data: grupos } = await sb
    .from("grupos")
    .select("id, nombre, semestre")
    .eq("id_docente", docenteId);

  if (!grupos || grupos.length === 0) return [];

  const grupoIds = grupos.map((g) => g.id);
  const { data: relsBatch } = await sb
    .from("alumnos_grupos")
    .select("id_grupo")
    .in("id_grupo", grupoIds);

  const countByGrupo = new Map<string, number>();
  for (const r of relsBatch ?? []) {
    countByGrupo.set(r.id_grupo, (countByGrupo.get(r.id_grupo) ?? 0) + 1);
  }

  const gruposConAlumnos = grupos.map((g) => ({
    ...g,
    total_alumnos: countByGrupo.get(g.id) ?? 0,
  }));

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

/** Top N alumnos del docente por score acumulado de intentos completados */
export async function getTopAlumnosDocente(
  docenteId: string,
  limit = 5
): Promise<TopAlumno[]> {
  const sb = await getSupabaseServer();

  const { data: grupos } = await sb
    .from('grupos')
    .select('id')
    .eq('id_docente', docenteId);

  if (!grupos || grupos.length === 0) return [];

  const grupoIds = grupos.map((g) => g.id);

  const { data: relaciones } = await sb
    .from('alumnos_grupos')
    .select('id_alumno')
    .in('id_grupo', grupoIds);

  const alumnoIds = [...new Set(relaciones?.map((r) => r.id_alumno) ?? [])];
  if (alumnoIds.length === 0) return [];

  const { data: profiles } = await sb
    .from('profiles')
    .select('id, full_name, email')
    .in('id', alumnoIds);

  const { data: intentos } = await sb
    .from('intentos')
    .select('user_id, score')
    .in('user_id', alumnoIds)
    .eq('status', 'completed');

  const statsPorAlumno = new Map<string, { count: number; scoreSum: number }>();
  for (const i of intentos ?? []) {
    const prev = statsPorAlumno.get(i.user_id) ?? { count: 0, scoreSum: 0 };
    statsPorAlumno.set(i.user_id, {
      count: prev.count + 1,
      scoreSum: prev.scoreSum + (i.score ?? 0),
    });
  }

  return (profiles ?? [])
    .map((p) => {
      const stats = statsPorAlumno.get(p.id);
      return {
        id: p.id,
        full_name: p.full_name,
        email: p.email,
        actividades_completadas: stats?.count ?? 0,
        score_total: stats?.scoreSum ?? 0,
        score_promedio: stats && stats.count > 0 ? Math.round(stats.scoreSum / stats.count) : null,
      };
    })
    .filter((a) => a.actividades_completadas > 0)
    .sort((a, b) => b.score_total - a.score_total)
    .slice(0, limit);
}

/** Detalle completo de un alumno: stats + historial de intentos */
export async function getAlumnoDetalle(alumnoId: string): Promise<AlumnoDetalle | null> {
  const sb = await getSupabaseServer();

  const { data: profile } = await sb
    .from('profiles')
    .select('id, full_name, email')
    .eq('id', alumnoId)
    .maybeSingle();

  if (!profile) return null;

  const { data: intentos } = await sb
    .from('intentos')
    .select('id, actividad_id, score, tiempo_segundos, status, completed_at, started_at')
    .eq('user_id', alumnoId)
    .order('started_at', { ascending: false })
    .limit(50);

  const actividadIds = [...new Set((intentos ?? []).map((i) => i.actividad_id))];
  const { data: actividades } = actividadIds.length > 0
    ? await sb.from('actividades').select('id, codigo, titulo').in('id', actividadIds)
    : { data: [] };

  const actMap = new Map((actividades ?? []).map((a) => [a.id, a]));

  const completadas = (intentos ?? []).filter((i) => i.status === 'completed');
  const scoreSum = completadas.reduce((s, i) => s + (i.score ?? 0), 0);
  const tiempoSum = completadas.reduce((s, i) => s + (i.tiempo_segundos ?? 0), 0);
  const ultimo = completadas[0]?.completed_at ?? null;

  return {
    id: profile.id,
    full_name: profile.full_name,
    email: profile.email,
    actividades_completadas: completadas.length,
    score_promedio: completadas.length > 0 ? Math.round(scoreSum / completadas.length) : null,
    tiempo_total_minutos: Math.round(tiempoSum / 60),
    ultimo_intento: ultimo,
    historial: (intentos ?? []).map((i) => {
      const act = actMap.get(i.actividad_id);
      return {
        id: i.id,
        actividad_titulo: act?.titulo ?? '—',
        actividad_codigo: act?.codigo ?? '—',
        score: i.score,
        status: i.status,
        completed_at: i.completed_at,
        started_at: i.started_at,
      };
    }),
  };
}

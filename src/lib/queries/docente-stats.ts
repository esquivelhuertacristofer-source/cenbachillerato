import { getSupabaseServer } from "@/lib/supabase-helpers";
import type {
  UACCompletionData,
  ProgresionData,
  ActividadStats,
  ActividadDificil,
  AlumnoRiesgo,
  UACResumen,
  ProgresionAlumno,
} from "./docente";

// ── Curriculum Analytics ─────────────────────────────────────────────────────

/** UACs del semestre del grupo con completion de la cohorte */
export async function getUACsConCompletionGrupo(grupoId: string, docenteId: string): Promise<UACCompletionData[]> {
  const sb = await getSupabaseServer();

  const { data: grupo } = await sb
    .from("grupos")
    .select("semestre")
    .eq("id", grupoId)
    .eq("id_docente", docenteId)
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

  const uacIds = uacs.map((u) => u.id);

  // 1 query: todas las progresiones de todas las UACs del semestre
  const { data: todasProgs } = await sb
    .from("progresiones")
    .select("id, uac_id")
    .in("uac_id", uacIds);

  const allProgIds = (todasProgs ?? []).map((p) => p.id);

  // 2 query: todas las actividades de todas las progresiones
  const { data: todasActs } = allProgIds.length > 0
    ? await sb.from("actividades").select("id, progresion_id").in("progresion_id", allProgIds).eq("estado", "publicada")
    : { data: [] };

  const allActIds = (todasActs ?? []).map((a) => a.id);

  // 3 query: todos los intentos completados del grupo en esas actividades
  const { data: todosIntentos } = allActIds.length > 0 && alumnoIds.length > 0
    ? await sb.from("intentos").select("actividad_id").in("actividad_id", allActIds).in("user_id", alumnoIds).eq("status", "completed")
    : { data: [] };

  // Mapas para aggregate en memoria
  const progsByUac = new Map<string, string[]>();
  for (const p of todasProgs ?? []) {
    const arr = progsByUac.get(p.uac_id) ?? [];
    arr.push(p.id);
    progsByUac.set(p.uac_id, arr);
  }

  const actsByProg = new Map<string, string[]>();
  for (const a of todasActs ?? []) {
    if (!a.progresion_id || !a.id) continue;
    const arr = actsByProg.get(a.progresion_id) ?? [];
    arr.push(a.id);
    actsByProg.set(a.progresion_id, arr);
  }

  const completadasByAct = new Map<string, number>();
  for (const i of todosIntentos ?? []) {
    if (!i.actividad_id) continue;
    completadasByAct.set(i.actividad_id, (completadasByAct.get(i.actividad_id) ?? 0) + 1);
  }

  const resultados: UACCompletionData[] = uacs.map((uac) => {
    const uacProgIds = progsByUac.get(uac.id) ?? [];
    const uacActIds = uacProgIds.flatMap((pid) => actsByProg.get(pid) ?? []);
    const totalActividades = uacActIds.length;
    const completadasCohorte = uacActIds.reduce((s, aid) => s + (completadasByAct.get(aid) ?? 0), 0);

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
  });

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

  const progIds = progresiones.map((p) => p.id);

  // 1 query: todas las actividades de todas las progresiones
  const { data: todasActs } = await sb
    .from("actividades")
    .select("id, progresion_id")
    .in("progresion_id", progIds)
    .eq("estado", "publicada");

  const actsByProg = new Map<string, string[]>();
  for (const a of todasActs ?? []) {
    if (!a.progresion_id || !a.id) continue;
    const arr = actsByProg.get(a.progresion_id) ?? [];
    arr.push(a.id);
    actsByProg.set(a.progresion_id, arr);
  }

  const allActIds = (todasActs ?? []).filter((a) => a.id).map((a) => a.id as string);

  // 2 query: todos los intentos completados de alumnos del grupo
  const { data: todosIntentos } = allActIds.length > 0 && alumnoIds.length > 0
    ? await sb.from("intentos").select("actividad_id, user_id").in("actividad_id", allActIds).in("user_id", alumnoIds).eq("status", "completed")
    : { data: [] };

  // Aggregate: alumnos únicos que completaron al menos 1 actividad de cada progresión
  const alumnosByProg = new Map<string, Set<string>>();
  for (const intento of todosIntentos ?? []) {
    // Encontrar a qué progresión pertenece esta actividad
    for (const [progId, actIds] of actsByProg.entries()) {
      if (actIds.includes(intento.actividad_id)) {
        const set = alumnosByProg.get(progId) ?? new Set<string>();
        set.add(intento.user_id);
        alumnosByProg.set(progId, set);
        break;
      }
    }
  }

  const resultado: ProgresionData[] = progresiones.map((prog) => {
    const actividadIds = actsByProg.get(prog.id) ?? [];
    const alumnosCompletaron = alumnosByProg.get(prog.id)?.size ?? 0;
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
  });

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

/** UACs de un semestre (para página módulos) */
export async function getUACsForSemestre(semestre: number): Promise<UACResumen[]> {
  const sb = await getSupabaseServer();

  const { data } = await sb
    .from('uac')
    .select('id, codigo, nombre, semestre, total_progresiones')
    .eq('semestre', semestre)
    .order('orden', { ascending: true });

  return data ?? [];
}

/** Progresiones de un alumno en su grupo con completion individual */
export async function getProgresionesAlumno(
  alumnoId: string,
  grupoId: string
): Promise<ProgresionAlumno[]> {
  const sb = await getSupabaseServer();

  const { data: grupo } = await sb
    .from('grupos')
    .select('semestre')
    .eq('id', grupoId)
    .maybeSingle();

  if (!grupo) return [];

  const { data: uacs } = await sb
    .from('uac')
    .select('id, codigo')
    .eq('semestre', grupo.semestre);

  if (!uacs || uacs.length === 0) return [];

  const uacIds = uacs.map((u) => u.id);
  const uacMap = new Map(uacs.map((u) => [u.id, u]));

  const { data: progresiones } = await sb
    .from('progresiones')
    .select('id, codigo, numero, titulo, uac_id')
    .in('uac_id', uacIds)
    .order('uac_id')
    .order('numero');

  if (!progresiones || progresiones.length === 0) return [];

  const progIds = progresiones.map((p) => p.id);

  // 1 query: todas las actividades de todas las progresiones
  const { data: todasActs } = await sb
    .from('actividades')
    .select('id, progresion_id')
    .in('progresion_id', progIds)
    .eq('estado', 'publicada');

  const actsByProg = new Map<string, string[]>();
  for (const a of todasActs ?? []) {
    if (!a.progresion_id || !a.id) continue;
    const arr = actsByProg.get(a.progresion_id) ?? [];
    arr.push(a.id);
    actsByProg.set(a.progresion_id, arr);
  }

  const allActIds = (todasActs ?? []).filter((a) => a.id).map((a) => a.id as string);

  // 2 query: todos los intentos completados del alumno en esas actividades
  const { data: intentosAlumno } = allActIds.length > 0
    ? await sb.from('intentos').select('actividad_id').in('actividad_id', allActIds).eq('user_id', alumnoId).eq('status', 'completed')
    : { data: [] };

  const completadasSet = new Set((intentosAlumno ?? []).map((i) => i.actividad_id));

  return progresiones.map((prog) => {
    const actividadIds = actsByProg.get(prog.id) ?? [];
    const completadas = actividadIds.filter((aid) => completadasSet.has(aid)).length;
    const total = actividadIds.length;
    const pct = total > 0 ? Math.round((completadas / total) * 100) : 0;
    const uac = uacMap.get(prog.uac_id);

    return {
      id: prog.id,
      codigo: prog.codigo,
      numero: prog.numero,
      titulo: prog.titulo,
      uac_id: prog.uac_id,
      uac_codigo: uac?.codigo ?? '—',
      actividades_completadas: completadas,
      total_actividades: total,
      pct_completion: pct,
    };
  });
}

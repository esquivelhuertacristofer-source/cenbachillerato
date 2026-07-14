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

export interface TopAlumno {
  id: string;
  full_name: string | null;
  email: string;
  actividades_completadas: number;
  score_total: number;
  score_promedio: number | null;
}

export interface AlumnoDetalle {
  id: string;
  full_name: string | null;
  email: string;
  actividades_completadas: number;
  score_promedio: number | null;
  tiempo_total_minutos: number;
  ultimo_intento: string | null;
  historial: Array<{
    id: string;
    actividad_titulo: string;
    actividad_codigo: string;
    score: number | null;
    status: string;
    completed_at: string | null;
    started_at: string;
  }>;
}

export interface UACResumen {
  id: string;
  codigo: string;
  nombre: string;
  semestre: number;
  total_progresiones: number;
}

export interface ProgresionAlumno {
  id: string;
  codigo: string;
  numero: number;
  titulo: string;
  uac_id: string;
  uac_codigo: string;
  actividades_completadas: number;
  total_actividades: number;
  pct_completion: number;
}

export interface PlanteamientoContenido {
  id: string;
  progresion_id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contenido: Record<string, any>;
  version_curricular: string;
  nivel_revision: string;
  updated_at: string;
}

export interface AvanceProgresion {
  progresion_id: string;
  total_alumnos: number;
  alumnos_con_actividad: number;
  pct_completion: number;
  score_promedio: number | null;
}

// ── Re-exports from sub-modules ─────────────────────────────────────────────

export {
  getGruposDocente,
  getMetricasDocente,
  getAlumnosDelDocente,
  getAlumnosConProgreso,
  getTopAlumnosDocente,
  getAlumnoDetalle,
} from "./docente-grupos";

export {
  getUACsConCompletionGrupo,
  getProgresionesPorSemestre,
  getActividadesStatsGrupo,
  getActividadesDificiles,
  getAlumnosEnRiesgo,
  getUACsForSemestre,
  getProgresionesAlumno,
} from "./docente-stats";

export {
  getRecomendacionesGrupo,
  getPlanteamientoGrupo,
  getIntentosRecientesDocente,
  getFichasBibliotecaPorSemestre,
  getPlanteamientoPorProgresion,
  getPlanteamientosDelGrupo,
  getAvanceGrupoEnProgresion,
} from "./docente-planteamiento";

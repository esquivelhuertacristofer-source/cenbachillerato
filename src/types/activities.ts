// =============================================================================
// CEN Bachillerato — Tipos de actividades pedagógicas
// Alineado con tabla tipos_actividad (migración 03)
// TODO: Marcar es_placeholder=true en todas las instancias hasta validación
// =============================================================================

// ── Tipo base compartido ──────────────────────────────────────────────────────

export interface ActividadBase {
  /** ID de la actividad en la DB */
  id?: string;
  /** Código único (ej: LC-I-P01-A01) */
  codigo?: string;
  /** Título visible al estudiante */
  titulo: string;
  /** Descripción breve del propósito pedagógico */
  descripcion?: string;
  /** XP que otorga al completarse */
  xp?: number;
}

// ── 1. LECTURA ────────────────────────────────────────────────────────────────

export interface PreguntaComprension {
  pregunta: string;
  respuesta_guia?: string;
}

export interface ContenidoLectura {
  texto: string;
  fuente?: string;
  nivel_lectura?: 'basico' | 'intermedio' | 'avanzado';
  preguntas_comprension?: PreguntaComprension[];
  tiempo_estimado_minutos?: number;
}

export interface ActividadLectura extends ActividadBase {
  tipo: 'lectura';
  contenido: ContenidoLectura;
}

// ── 2. QUIZ OPCIÓN MÚLTIPLE ───────────────────────────────────────────────────

export interface PreguntaOpcionMultiple {
  enunciado: string;
  opciones: string[];
  respuesta_correcta: number;
  retroalimentacion?: string;
  imagen_url?: string;
}

export interface ContenidoQuizMultipleOpcion {
  preguntas: PreguntaOpcionMultiple[];
  intentos_maximos?: number;
  puntaje_minimo_aprobacion?: number;
  mezclar_preguntas?: boolean;
}

export interface ActividadQuizMultipleOpcion extends ActividadBase {
  tipo: 'quiz_multiple_opcion';
  contenido: ContenidoQuizMultipleOpcion;
}

// ── 3. QUIZ VERDADERO O FALSO ─────────────────────────────────────────────────

export interface PreguntaVerdaderoFalso {
  enunciado: string;
  respuesta: boolean;
  retroalimentacion?: string;
}

export interface ContenidoQuizVerdaderoFalso {
  preguntas: PreguntaVerdaderoFalso[];
  intentos_maximos?: number;
  puntaje_minimo_aprobacion?: number;
}

export interface ActividadQuizVerdaderoFalso extends ActividadBase {
  tipo: 'quiz_verdadero_falso';
  contenido: ContenidoQuizVerdaderoFalso;
}

// ── 4. COMPLETAR ESPACIOS ─────────────────────────────────────────────────────

export interface HuecoFillBlanks {
  posicion: number;
  respuesta_correcta: string;
  alternativas_aceptadas?: string[];
  pista?: string;
}

export interface ContenidoFillBlanks {
  instrucciones?: string;
  /** Usa ___ para marcar cada hueco */
  texto_con_huecos: string;
  huecos: HuecoFillBlanks[];
  distingue_mayusculas?: boolean;
}

export interface ActividadFillBlanks extends ActividadBase {
  tipo: 'fill_blanks';
  contenido: ContenidoFillBlanks;
}

// ── 5. EJERCICIO MATEMÁTICO ───────────────────────────────────────────────────

export type TipoRespuestaMatematica = 'numerica' | 'algebraica' | 'desarrollo' | 'seleccion';

export interface ContenidoEjercicioMatematico {
  instrucciones?: string;
  problema: string;
  /** Situación real que da sentido al problema */
  contexto?: string;
  tipo_respuesta: TipoRespuestaMatematica;
  pasos_guia?: string[];
  respuesta_final?: string;
  unidades?: string;
  tolerancia_error?: number;
  imagen_problema?: string;
}

export interface ActividadEjercicioMatematico extends ActividadBase {
  tipo: 'ejercicio_matematico';
  contenido: ContenidoEjercicioMatematico;
}

// ── 6. REFLEXIÓN ESCRITA ──────────────────────────────────────────────────────

export type FormatoReflexion = 'libre' | 'ensayo' | 'carta' | 'diario' | 'descripcion';

export interface ContenidoReflexionEscrita {
  prompt: string;
  pistas?: string[];
  longitud_minima_palabras?: number;
  longitud_maxima_palabras?: number;
  criterios_evaluacion?: string[];
  ejemplo_respuesta?: string;
  formato_esperado?: FormatoReflexion;
}

export interface ActividadReflexionEscrita extends ActividadBase {
  tipo: 'reflexion_escrita';
  contenido: ContenidoReflexionEscrita;
}

// ── 7. VIDEO CON PREGUNTAS ────────────────────────────────────────────────────

export type TipoPreguntaVideo = 'abierta' | 'opcion_multiple' | 'verdadero_falso';

export interface PreguntaVideo {
  tiempo_segundos?: number;
  pregunta: string;
  tipo?: TipoPreguntaVideo;
  opciones?: string[];
  respuesta_correcta?: number | boolean | string;
}

export interface ContenidoVideoConPreguntas {
  url_video: string;
  titulo_video: string;
  descripcion_video?: string;
  duracion_segundos?: number;
  subtitulos_disponibles?: boolean;
  preguntas?: PreguntaVideo[];
}

export interface ActividadVideoConPreguntas extends ActividadBase {
  tipo: 'video_con_preguntas';
  contenido: ContenidoVideoConPreguntas;
}

// ── 8. INFOGRAFÍA ─────────────────────────────────────────────────────────────

export interface ContenidoInfografia {
  titulo: string;
  url_imagen: string;
  /** Alt text descriptivo para accesibilidad */
  descripcion_accesible?: string;
  puntos_clave?: string[];
  fuente?: string;
  /** Consigna de actividad posterior a la revisión */
  actividad_post?: string;
}

export interface ActividadInfografia extends ActividadBase {
  tipo: 'infografia';
  contenido: ContenidoInfografia;
}

// ── 9. DEBATE ESTRUCTURADO ────────────────────────────────────────────────────

export type ModalidadDebate = 'oral' | 'escrito' | 'hibrido';

export interface ContenidoDebateEstructurado {
  tema: string;
  posturas: string[];
  argumentos_guia?: Record<string, string[]>;
  reglas?: string[];
  tiempo_argumentacion_minutos?: number;
  criterios_evaluacion?: string[];
  modalidad?: ModalidadDebate;
}

export interface ActividadDebateEstructurado extends ActividadBase {
  tipo: 'debate_estructurado';
  contenido: ContenidoDebateEstructurado;
}

// ── 10. SIMULACIÓN ────────────────────────────────────────────────────────────

export type TipoSimulacion = 'laboratorio' | 'matematica' | 'social' | 'tecnologia' | 'historica';

export interface ContenidoSimulacion {
  tipo_simulacion: TipoSimulacion;
  descripcion: string;
  url_simulacion?: string;
  instrucciones?: string[];
  variables_a_explorar?: string[];
  preguntas_reflexion?: string[];
  reporte_esperado?: string;
}

export interface ActividadSimulacion extends ActividadBase {
  tipo: 'simulacion';
  contenido: ContenidoSimulacion;
}

// ── 11. GLOSARIO INTERACTIVO ──────────────────────────────────────────────────

export interface TerminoGlosario {
  termino: string;
  definicion: string;
  ejemplo?: string;
  imagen_url?: string;
  etiquetas?: string[];
}

export interface ContenidoGlosarioInteractivo {
  terminos: TerminoGlosario[];
  /** Consigna integradora posterior al estudio */
  actividad_final?: string;
}

export interface ActividadGlosarioInteractivo extends ActividadBase {
  tipo: 'glosario_interactivo';
  contenido: ContenidoGlosarioInteractivo;
}

// ── 12. AUTOEVALUACIÓN ────────────────────────────────────────────────────────

export interface EscalaAutoevaluacion {
  valor: number;
  etiqueta: string;
  descripcion?: string;
}

export interface CriterioAutoevaluacion {
  descripcion: string;
  escala: EscalaAutoevaluacion[];
}

export interface ContenidoAutoevaluacion {
  instrucciones?: string;
  criterios: CriterioAutoevaluacion[];
  reflexion_final_prompt?: string;
  visible_para_docente?: boolean;
}

export interface ActividadAutoevaluacion extends ActividadBase {
  tipo: 'autoevaluacion';
  contenido: ContenidoAutoevaluacion;
}

// ── UNIÓN DISCRIMINADA ────────────────────────────────────────────────────────

export type Actividad =
  | ActividadLectura
  | ActividadQuizMultipleOpcion
  | ActividadQuizVerdaderoFalso
  | ActividadFillBlanks
  | ActividadEjercicioMatematico
  | ActividadReflexionEscrita
  | ActividadVideoConPreguntas
  | ActividadInfografia
  | ActividadDebateEstructurado
  | ActividadSimulacion
  | ActividadGlosarioInteractivo
  | ActividadAutoevaluacion;

export type TipoActividad = Actividad['tipo'];

export const TIPOS_ACTIVIDAD: Record<TipoActividad, string> = {
  lectura:               'Lectura',
  quiz_multiple_opcion:  'Quiz: Opción múltiple',
  quiz_verdadero_falso:  'Quiz: Verdadero o Falso',
  fill_blanks:           'Completar espacios',
  ejercicio_matematico:  'Ejercicio matemático',
  reflexion_escrita:     'Reflexión escrita',
  video_con_preguntas:   'Video con preguntas',
  infografia:            'Infografía',
  debate_estructurado:   'Debate estructurado',
  simulacion:            'Simulación',
  glosario_interactivo:  'Glosario interactivo',
  autoevaluacion:        'Autoevaluación',
};

// ── Resultado de intento ──────────────────────────────────────────────────────

export interface ResultadoActividad {
  actividadId: string;
  completada: boolean;
  puntaje?: number;
  respuestas?: unknown;
  tiempoSegundos?: number;
}

export type CallbackProgreso = (resultado: ResultadoActividad) => void;

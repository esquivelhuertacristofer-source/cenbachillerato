// =============================================================================
// CEN Bachillerato — Tipos de actividades pedagógicas
// Alineado con tabla tipos_actividad (migración 03)
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
}

// ── 1. LECTURA ────────────────────────────────────────────────────────────────

export interface PreguntaComprension {
  pregunta: string;
  respuesta_guia?: string;
}

export interface CalloutLectura {
  tipo: 'info' | 'importante' | 'sabias' | 'advertencia';
  contenido: string;
}

export interface ContenidoLectura {
  texto: string;
  fuente?: string;
  nivel_lectura?: 'basico' | 'intermedio' | 'avanzado';
  preguntas_comprension?: PreguntaComprension[];
  tiempo_estimado_minutos?: number;
  callouts?: CalloutLectura[];
  /** Imagen de ambientación específica para esta lectura (fallback: pool temático por UAC) */
  url_imagen?: string;
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
}

export interface ContenidoQuizMultipleOpcion {
  preguntas: PreguntaOpcionMultiple[];
  intentos_maximos?: number;
  puntaje_minimo_aprobacion?: number;
  mezclar_preguntas?: boolean;
  /** Imagen de ambientación específica para esta actividad (fallback: pool temático por UAC) */
  url_imagen?: string;
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
  /** Imagen de ambientación específica para esta actividad (fallback: pool temático por UAC) */
  url_imagen?: string;
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
  /** Imagen de ambientación específica para esta actividad (fallback: pool temático por UAC) */
  url_imagen?: string;
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
  /** Imagen de ambientación específica para esta actividad (fallback: pool temático por UAC) */
  url_imagen?: string;
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
  /** Imagen de ambientación específica para esta actividad (fallback: pool temático por UAC) */
  url_imagen?: string;
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
  /** Miniatura/portada específica mostrada antes de reproducir el video (fallback: pool temático por UAC) */
  url_miniatura?: string;
}

export interface ActividadVideoConPreguntas extends ActividadBase {
  tipo: 'video_con_preguntas';
  contenido: ContenidoVideoConPreguntas;
}

// ── 8. INFOGRAFÍA ─────────────────────────────────────────────────────────────

export interface GlosarioTerminoInfografia {
  termino: string;
  definicion: string;
}

export interface ContenidoInfografia {
  titulo: string;
  url_imagen: string;
  /** Alt text descriptivo para accesibilidad */
  descripcion_accesible?: string;
  puntos_clave?: string[];
  fuente?: string;
  /** Consigna de actividad posterior a la revisión */
  actividad_post?: string;
  /** Contextualización del tema en México con datos reales */
  contexto_mexicano?: string;
  /** Términos clave con definición pedagógica */
  glosario?: GlosarioTerminoInfografia[];
  /** Preguntas de análisis para activar reflexión crítica */
  preguntas_reflexion?: string[];
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
  /** Imagen de ambientación específica para esta actividad (fallback: pool temático por UAC) */
  url_imagen?: string;
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
  etiquetas?: string[];
}

export interface ContenidoGlosarioInteractivo {
  terminos: TerminoGlosario[];
  /** Consigna integradora posterior al estudio */
  actividad_final?: string;
  /** Imagen de ambientación específica para esta actividad (fallback: pool temático por UAC) */
  url_imagen?: string;
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
  /** Imagen de ambientación específica para esta actividad (fallback: pool temático por UAC) */
  url_imagen?: string;
}

export interface ActividadAutoevaluacion extends ActividadBase {
  tipo: 'autoevaluacion';
  contenido: ContenidoAutoevaluacion;
}

// ── UNIÓN DISCRIMINADA ────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS DINÁMICOS (migración 26) — se responden moviendo y decidiendo
// ═══════════════════════════════════════════════════════════════════════════

// ── 13. ORDENAR SECUENCIA ─────────────────────────────────────────────────────

export type CriterioSecuencia = 'cronologia' | 'procedimiento' | 'jerarquia';

export interface PasoSecuencia {
  texto: string;
  explicacion?: string;
  marca?: string;
}

export interface ContenidoOrdenarSecuencia {
  instrucciones?: string;
  /** EN SU ORDEN CORRECTO; la app los baraja al presentarlos. */
  pasos: PasoSecuencia[];
  criterio?: CriterioSecuencia;
  puntaje_minimo_aprobacion?: number;
  url_imagen?: string;
}

export interface ActividadOrdenarSecuencia extends ActividadBase {
  tipo: 'ordenar_secuencia';
  contenido: ContenidoOrdenarSecuencia;
}

// ── 14. RELACIONAR COLUMNAS ───────────────────────────────────────────────────

export interface ParejaRelacion {
  izquierda: string;
  derecha: string;
  explicacion?: string;
}

export interface ContenidoRelacionarColumnas {
  instrucciones?: string;
  titulo_izquierda?: string;
  titulo_derecha?: string;
  parejas: ParejaRelacion[];
  distractores?: string[];
  puntaje_minimo_aprobacion?: number;
  url_imagen?: string;
}

export interface ActividadRelacionarColumnas extends ActividadBase {
  tipo: 'relacionar_columnas';
  contenido: ContenidoRelacionarColumnas;
}

// ── 15. CLASIFICAR EN CATEGORÍAS ──────────────────────────────────────────────

export interface CategoriaClasificacion {
  nombre: string;
  descripcion?: string;
}

export interface ElementoClasificable {
  texto: string;
  categoria: string;
  explicacion?: string;
}

export interface ContenidoClasificarCategorias {
  instrucciones?: string;
  categorias: CategoriaClasificacion[];
  elementos: ElementoClasificable[];
  puntaje_minimo_aprobacion?: number;
  url_imagen?: string;
}

export interface ActividadClasificarCategorias extends ActividadBase {
  tipo: 'clasificar_categorias';
  contenido: ContenidoClasificarCategorias;
}

// ── 16. CASO CON DECISIONES ───────────────────────────────────────────────────

export interface OpcionDecision {
  texto: string;
  consecuencia: string;
  /** 0 = mala, 1 = aceptable, 2 = la mejor. */
  calidad: number;
}

export interface EscenaCaso {
  situacion: string;
  pregunta: string;
  opciones: OpcionDecision[];
}

export interface ContenidoCasoDecision {
  contexto: string;
  escenas: EscenaCaso[];
  cierre_bueno: string;
  cierre_regular: string;
  cierre_malo: string;
  pregunta_reflexion?: string;
  url_imagen?: string;
}

export interface ActividadCasoDecision extends ActividadBase {
  tipo: 'caso_decision';
  contenido: ContenidoCasoDecision;
}

// ── 17. RETO CONTRARRELOJ ─────────────────────────────────────────────────────

export interface PreguntaReto {
  enunciado: string;
  opciones: string[];
  respuesta_correcta: number;
  pista?: string;
}

export interface ContenidoRetoCronometrado {
  instrucciones?: string;
  segundos_por_pregunta?: number;
  preguntas: PreguntaReto[];
  puntaje_minimo_aprobacion?: number;
  url_imagen?: string;
}

export interface ActividadRetoCronometrado extends ActividadBase {
  tipo: 'reto_cronometrado';
  contenido: ContenidoRetoCronometrado;
}


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
  | ActividadAutoevaluacion
  | ActividadOrdenarSecuencia
  | ActividadRelacionarColumnas
  | ActividadClasificarCategorias
  | ActividadCasoDecision
  | ActividadRetoCronometrado;

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
  ordenar_secuencia:     'Ordena la secuencia',
  relacionar_columnas:   'Relaciona columnas',
  clasificar_categorias: 'Clasifica en categorías',
  caso_decision:         'Caso con decisiones',
  reto_cronometrado:     'Reto contrarreloj',
};

// ── Resultado de intento ──────────────────────────────────────────────────────

export interface ResultadoActividad {
  actividadId: string;
  completada: boolean;
  puntaje?: number;
  respuestas?: unknown;
  tiempoSegundos?: number;
}

/**
 * Resultado de persistir un intento. Lo devuelve `onProgreso` para que el hijo
 * (botón de envío) sepa si la entrega tuvo éxito y NO deje el botón colgado en
 * "Registrando…" cuando falla. `ActivityRunner` lo usa para mostrar un banner de
 * reintento y NO navegar si el alumno perdería su trabajo.
 */
export type ResultadoEntrega = { ok: boolean; error?: string };

export type CallbackProgreso = (
  resultado: ResultadoActividad
) => void | Promise<ResultadoEntrega>;

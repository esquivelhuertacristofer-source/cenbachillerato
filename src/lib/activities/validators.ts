// =============================================================================
// CEN Bachillerato — Validadores Zod para tipos de actividades pedagógicas
// Espejo de schemas JSON en migración 03_tipos_actividades.sql
// =============================================================================

import { z } from 'zod';

// ── 1. LECTURA ────────────────────────────────────────────────────────────────

export const PreguntaComprensionSchema = z.object({
  pregunta: z.string().min(1),
  respuesta_guia: z.string().optional(),
});

export const ContenidoLecturaSchema = z.object({
  texto: z.string().min(50, 'El texto debe tener al menos 50 caracteres'),
  fuente: z.string().optional(),
  nivel_lectura: z.enum(['basico', 'intermedio', 'avanzado']).optional(),
  preguntas_comprension: z.array(PreguntaComprensionSchema).optional(),
  tiempo_estimado_minutos: z.number().int().positive().optional(),
});

// ── 2. QUIZ OPCIÓN MÚLTIPLE ───────────────────────────────────────────────────

export const PreguntaOpcionMultipleSchema = z.object({
  enunciado: z.string().min(1),
  opciones: z.array(z.string()).min(2).max(5),
  respuesta_correcta: z.number().int().min(0),
  retroalimentacion: z.string().optional(),
}).refine(
  (data) => data.respuesta_correcta < data.opciones.length,
  { message: 'respuesta_correcta debe ser un índice válido dentro de opciones' }
);

export const ContenidoQuizMultipleOpcionSchema = z.object({
  preguntas: z.array(PreguntaOpcionMultipleSchema).min(1),
  intentos_maximos: z.number().int().positive().optional().default(3),
  puntaje_minimo_aprobacion: z.number().int().min(0).max(100).optional().default(70),
  mezclar_preguntas: z.boolean().optional().default(false),
});

// ── 3. QUIZ VERDADERO O FALSO ─────────────────────────────────────────────────

export const PreguntaVerdaderoFalsoSchema = z.object({
  enunciado: z.string().min(1),
  respuesta: z.boolean(),
  retroalimentacion: z.string().optional(),
});

export const ContenidoQuizVerdaderoFalsoSchema = z.object({
  preguntas: z.array(PreguntaVerdaderoFalsoSchema).min(1),
  intentos_maximos: z.number().int().positive().optional().default(2),
  puntaje_minimo_aprobacion: z.number().int().min(0).max(100).optional().default(70),
});

// ── 4. COMPLETAR ESPACIOS ─────────────────────────────────────────────────────

export const HuecoSchema = z.object({
  posicion: z.number().int().min(0),
  respuesta_correcta: z.string().min(1),
  alternativas_aceptadas: z.array(z.string()).optional(),
  pista: z.string().optional(),
});

export const ContenidoFillBlanksSchema = z.object({
  instrucciones: z.string().optional(),
  texto_con_huecos: z.string().min(1, 'Debe incluir texto con al menos un hueco (___)'),
  huecos: z.array(HuecoSchema).min(1),
  distingue_mayusculas: z.boolean().optional().default(false),
}).refine(
  (data) => (data.texto_con_huecos.match(/___/g) || []).length >= data.huecos.length,
  { message: 'El número de ___ en texto_con_huecos debe coincidir con el número de huecos' }
);

// ── 5. EJERCICIO MATEMÁTICO ───────────────────────────────────────────────────

export const ContenidoEjercicioMatematicoSchema = z.object({
  instrucciones: z.string().optional(),
  problema: z.string().min(1),
  contexto: z.string().optional(),
  tipo_respuesta: z.enum(['numerica', 'algebraica', 'desarrollo', 'seleccion']),
  pasos_guia: z.array(z.string()).optional(),
  respuesta_final: z.string().optional(),
  unidades: z.string().optional(),
  tolerancia_error: z.number().min(0).optional().default(0),
});

// ── 6. REFLEXIÓN ESCRITA ──────────────────────────────────────────────────────

export const ContenidoReflexionEscritaSchema = z.object({
  prompt: z.string().min(10, 'El prompt debe tener al menos 10 caracteres'),
  pistas: z.array(z.string()).optional(),
  longitud_minima_palabras: z.number().int().min(10).optional().default(80),
  longitud_maxima_palabras: z.number().int().positive().optional(),
  criterios_evaluacion: z.array(z.string()).optional(),
  ejemplo_respuesta: z.string().optional(),
  formato_esperado: z.enum(['libre', 'ensayo', 'carta', 'diario', 'descripcion']).optional().default('libre'),
}).refine(
  (data) =>
    data.longitud_maxima_palabras === undefined ||
    data.longitud_minima_palabras === undefined ||
    data.longitud_maxima_palabras > data.longitud_minima_palabras,
  { message: 'longitud_maxima_palabras debe ser mayor que longitud_minima_palabras' }
);

// ── 7. VIDEO CON PREGUNTAS ────────────────────────────────────────────────────

export const PreguntaVideoSchema = z.object({
  tiempo_segundos: z.number().int().min(0).optional(),
  pregunta: z.string().min(1),
  tipo: z.enum(['abierta', 'opcion_multiple', 'verdadero_falso']).optional(),
  opciones: z.array(z.string()).optional(),
  respuesta_correcta: z.union([z.number(), z.boolean(), z.string()]).optional(),
});

export const ContenidoVideoConPreguntasSchema = z.object({
  url_video: z.string().min(1, 'La URL del video es requerida'),
  titulo_video: z.string().min(1),
  descripcion_video: z.string().optional(),
  duracion_segundos: z.number().int().positive().optional(),
  subtitulos_disponibles: z.boolean().optional().default(false),
  preguntas: z.array(PreguntaVideoSchema).optional(),
});

// ── 8. INFOGRAFÍA ─────────────────────────────────────────────────────────────

export const GlosarioTerminoInfografiaSchema = z.object({
  termino: z.string().min(1),
  definicion: z.string().min(5),
});

export const ContenidoInfografiaSchema = z.object({
  titulo: z.string().min(1),
  url_imagen: z.string().min(1, 'La URL de la imagen es requerida'),
  descripcion_accesible: z.string().optional(),
  puntos_clave: z.array(z.string()).min(1).optional(),
  fuente: z.string().optional(),
  actividad_post: z.string().optional(),
  contexto_mexicano: z.string().optional(),
  glosario: z.array(GlosarioTerminoInfografiaSchema).optional(),
  preguntas_reflexion: z.array(z.string()).optional(),
});

// ── 9. DEBATE ESTRUCTURADO ────────────────────────────────────────────────────

export const ContenidoDebateEstructuradoSchema = z.object({
  tema: z.string().min(5),
  posturas: z.array(z.string()).min(2),
  argumentos_guia: z.record(z.string(), z.array(z.string())).optional(),
  reglas: z.array(z.string()).optional(),
  tiempo_argumentacion_minutos: z.number().int().positive().optional().default(3),
  criterios_evaluacion: z.array(z.string()).optional(),
  modalidad: z.enum(['oral', 'escrito', 'hibrido']).optional().default('escrito'),
});

// ── 10. SIMULACIÓN ────────────────────────────────────────────────────────────

export const ContenidoSimulacionSchema = z.object({
  tipo_simulacion: z.enum(['laboratorio', 'matematica', 'social', 'tecnologia', 'historica']),
  descripcion: z.string().min(1),
  url_simulacion: z.string().url().optional().or(z.literal('')),
  instrucciones: z.array(z.string()).optional(),
  variables_a_explorar: z.array(z.string()).optional(),
  preguntas_reflexion: z.array(z.string()).optional(),
  reporte_esperado: z.string().optional(),
});

// ── 11. GLOSARIO INTERACTIVO ──────────────────────────────────────────────────

export const TerminoGlosarioSchema = z.object({
  termino: z.string().min(1),
  definicion: z.string().min(5),
  ejemplo: z.string().optional(),
  etiquetas: z.array(z.string()).optional(),
});

export const ContenidoGlosarioInteractivoSchema = z.object({
  terminos: z.array(TerminoGlosarioSchema).min(3, 'Un glosario debe tener al menos 3 términos'),
  actividad_final: z.string().optional(),
});

// ── 12. AUTOEVALUACIÓN ────────────────────────────────────────────────────────

export const EscalaAutoevaluacionSchema = z.object({
  valor: z.number().int(),
  etiqueta: z.string().min(1),
  descripcion: z.string().optional(),
});

export const CriterioAutoevaluacionSchema = z.object({
  descripcion: z.string().min(1),
  escala: z.array(EscalaAutoevaluacionSchema).min(2),
});

export const ContenidoAutoevaluacionSchema = z.object({
  instrucciones: z.string().optional(),
  criterios: z.array(CriterioAutoevaluacionSchema).min(1),
  reflexion_final_prompt: z.string().optional(),
  visible_para_docente: z.boolean().optional().default(true),
});

// ── MAPA DE VALIDADORES ───────────────────────────────────────────────────────

export const VALIDADORES_CONTENIDO = {
  lectura:              ContenidoLecturaSchema,
  quiz_multiple_opcion: ContenidoQuizMultipleOpcionSchema,
  quiz_verdadero_falso: ContenidoQuizVerdaderoFalsoSchema,
  fill_blanks:          ContenidoFillBlanksSchema,
  ejercicio_matematico: ContenidoEjercicioMatematicoSchema,
  reflexion_escrita:    ContenidoReflexionEscritaSchema,
  video_con_preguntas:  ContenidoVideoConPreguntasSchema,
  infografia:           ContenidoInfografiaSchema,
  debate_estructurado:  ContenidoDebateEstructuradoSchema,
  simulacion:           ContenidoSimulacionSchema,
  glosario_interactivo: ContenidoGlosarioInteractivoSchema,
  autoevaluacion:       ContenidoAutoevaluacionSchema,
} as const;

export type TipoActividadKey = keyof typeof VALIDADORES_CONTENIDO;

/**
 * Valida el contenido de una actividad según su tipo.
 * Retorna { success, data } o { success: false, error }.
 */
export function validarContenidoActividad(
  tipo: TipoActividadKey,
  contenido: unknown
) {
  const schema = VALIDADORES_CONTENIDO[tipo];
  if (!schema) {
    return { success: false as const, error: new Error(`Tipo de actividad desconocido: ${tipo}`) };
  }
  return schema.safeParse(contenido);
}

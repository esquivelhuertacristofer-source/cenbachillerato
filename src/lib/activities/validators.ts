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
  url_imagen: z.string().optional(),
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
  url_imagen: z.string().optional(),
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
  url_imagen: z.string().optional(),
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
  url_imagen: z.string().optional(),
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
  url_imagen: z.string().optional(),
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
  url_imagen: z.string().optional(),
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
  /**
   * La imagen es OPCIONAL, y ese cambio tiene una historia.
   *
   * Este campo era obligatorio, y por eso 27 de las 29 infografías apuntaban a
   * `/placeholder/infografia.svg`: un archivo que se borró del disco hace meses.
   * El esquema exigía una URL y alguien le dio una que no lleva a ningún lado.
   *
   * Al limpiar esos marcadores, esas 27 filas quedaron incumpliendo su propio
   * esquema. La respuesta correcta no era devolverles una URL falsa: es que una
   * infografía NO NECESITA imagen. `<LaminaInfografia>` la dibuja con sus datos
   * —título, puntos clave, fuente— y esa lámina reflowea en un teléfono, la lee
   * un lector de pantalla y no puede dar 404. La imagen es el caso especial, no
   * el caso normal.
   */
  url_imagen: z.string().min(1).optional(),
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
  url_imagen: z.string().optional(),
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
  url_imagen: z.string().optional(),
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
  url_imagen: z.string().optional(),
});


// ═══════════════════════════════════════════════════════════════════════════
// TIPOS DINÁMICOS (migración 26)
//
// Los doce tipos de arriba se responden leyendo y eligiendo. Estos cinco se
// responden MOVIENDO cosas y DECIDIENDO, que es donde un alumno de bachillerato
// deja de leer en diagonal. No sustituyen a los otros: cubren lo que a los
// otros no les sale —secuencia, correspondencia, criterio de clasificación,
// consecuencia de una decisión y automatización bajo presión—.
// ═══════════════════════════════════════════════════════════════════════════

// ── 13. ORDENAR SECUENCIA ─────────────────────────────────────────────────────

export const PasoSecuenciaSchema = z.object({
  /** El texto de la tarjeta, tal como se arrastra. */
  texto: z.string().min(1),
  /** Por qué va en esa posición. Se muestra al revisar. */
  explicacion: z.string().optional(),
  /** Etiqueta corta opcional (una fecha, un número de paso). */
  marca: z.string().optional(),
});

export const ContenidoOrdenarSecuenciaSchema = z.object({
  instrucciones: z.string().optional(),
  /** Los pasos EN SU ORDEN CORRECTO. La app los baraja al presentarlos. */
  pasos: z.array(PasoSecuenciaSchema).min(3).max(10),
  /** Qué se está ordenando: "cronologia" cambia el rótulo a antes/después. */
  criterio: z.enum(['cronologia', 'procedimiento', 'jerarquia']).optional().default('procedimiento'),
  puntaje_minimo_aprobacion: z.number().int().min(0).max(100).optional().default(70),
  url_imagen: z.string().optional(),
});

// ── 14. RELACIONAR COLUMNAS ───────────────────────────────────────────────────

export const ParejaRelacionSchema = z.object({
  izquierda: z.string().min(1),
  derecha: z.string().min(1),
  explicacion: z.string().optional(),
});

export const ContenidoRelacionarColumnasSchema = z.object({
  instrucciones: z.string().optional(),
  titulo_izquierda: z.string().optional(),
  titulo_derecha: z.string().optional(),
  parejas: z.array(ParejaRelacionSchema).min(3).max(10),
  /** Opciones de la derecha que no emparejan con nada (distractores). */
  distractores: z.array(z.string()).max(4).optional().default([]),
  puntaje_minimo_aprobacion: z.number().int().min(0).max(100).optional().default(70),
  url_imagen: z.string().optional(),
});

// ── 15. CLASIFICAR EN CATEGORÍAS ──────────────────────────────────────────────

export const ElementoClasificableSchema = z.object({
  texto: z.string().min(1),
  /** Nombre EXACTO de la categoría a la que pertenece. */
  categoria: z.string().min(1),
  explicacion: z.string().optional(),
});

export const ContenidoClasificarCategoriasSchema = z.object({
  instrucciones: z.string().optional(),
  categorias: z.array(z.object({
    nombre: z.string().min(1),
    descripcion: z.string().optional(),
  })).min(2).max(4),
  elementos: z.array(ElementoClasificableSchema).min(4).max(16),
  puntaje_minimo_aprobacion: z.number().int().min(0).max(100).optional().default(70),
  url_imagen: z.string().optional(),
}).refine(
  (d) => d.elementos.every((e) => d.categorias.some((c) => c.nombre === e.categoria)),
  { message: 'Cada elemento debe pertenecer a una categoría declarada' }
);

// ── 16. CASO CON DECISIONES ───────────────────────────────────────────────────

export const OpcionDecisionSchema = z.object({
  texto: z.string().min(1),
  /** Lo que pasa si el alumno elige esto. Es la enseñanza, no un "correcto". */
  consecuencia: z.string().min(1),
  /** Cuánto acerca al mejor desenlace: 0 = mala, 1 = aceptable, 2 = la mejor. */
  calidad: z.number().int().min(0).max(2),
});

export const EscenaCasoSchema = z.object({
  situacion: z.string().min(1),
  pregunta: z.string().min(1),
  opciones: z.array(OpcionDecisionSchema).min(2).max(4),
});

export const ContenidoCasoDecisionSchema = z.object({
  contexto: z.string().min(1),
  escenas: z.array(EscenaCasoSchema).min(2).max(6),
  /** Qué se cierra al final, según cómo le fue. */
  cierre_bueno: z.string().min(1),
  cierre_regular: z.string().min(1),
  cierre_malo: z.string().min(1),
  pregunta_reflexion: z.string().optional(),
  url_imagen: z.string().optional(),
});

// ── 17. RETO CONTRARRELOJ ─────────────────────────────────────────────────────

export const PreguntaRetoSchema = z.object({
  enunciado: z.string().min(1),
  opciones: z.array(z.string()).min(2).max(4),
  respuesta_correcta: z.number().int().min(0),
  pista: z.string().optional(),
}).refine(
  (d) => d.respuesta_correcta < d.opciones.length,
  { message: 'respuesta_correcta debe ser un índice válido dentro de opciones' }
);

export const ContenidoRetoCronometradoSchema = z.object({
  instrucciones: z.string().optional(),
  /** Segundos por pregunta. Corto a propósito: se responde de memoria. */
  segundos_por_pregunta: z.number().int().min(5).max(60).optional().default(20),
  preguntas: z.array(PreguntaRetoSchema).min(5).max(20),
  puntaje_minimo_aprobacion: z.number().int().min(0).max(100).optional().default(60),
  url_imagen: z.string().optional(),
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
  // Tipos dinámicos (migración 26)
  ordenar_secuencia:      ContenidoOrdenarSecuenciaSchema,
  relacionar_columnas:    ContenidoRelacionarColumnasSchema,
  clasificar_categorias:  ContenidoClasificarCategoriasSchema,
  caso_decision:          ContenidoCasoDecisionSchema,
  reto_cronometrado:      ContenidoRetoCronometradoSchema,
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

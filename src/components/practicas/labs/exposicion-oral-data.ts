/**
 * Datos del Laboratorio — La exposición oral formal: coloquio, simposio y foro
 * (LC-III-P07, Lengua y Comunicación III).
 *
 * Contenido VERBATIM de LC-III·P07. Las descripciones de cada formato, los
 * conceptos, las definiciones del glosario, los escenarios y las afirmaciones
 * del cuestionario se toman literalmente de las actividades A1 (lectura
 * publicada), A2 (quiz), A4 (V/F publicada) y A5 (glosario). Los escenarios a
 * clasificar son los ejemplos que las propias actividades asignan a cada
 * formato (ejemplos del glosario A5 y casos de la lectura A1).
 */

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 1 — ¿Coloquio, simposio o foro? (clasifica por formato de exposición)
 * ───────────────────────────────────────────────────────────────────────── */
export type Formato = "coloquio" | "simposio" | "foro";

export const FORMATO_INFO: Record<
  Formato,
  { titulo: string; subtitulo: string; icono: string }
> = {
  coloquio: {
    titulo: "Coloquio",
    subtitulo: "Diálogo académico entre un grupo reducido (3 a 8) con conocimiento del tema: interacción directa, preguntas cruzadas y pluralidad de opiniones fundamentadas.",
    icono: "fa-comments",
  },
  simposio: {
    titulo: "Simposio",
    subtitulo: "Varias personas expertas exponen aspectos distintos de un mismo tema de forma breve e independiente; un moderador sintetiza las conclusiones al final.",
    icono: "fa-chalkboard-user",
  },
  foro: {
    titulo: "Foro",
    subtitulo: "El formato más abierto y participativo: la audiencia interviene directamente con preguntas, posiciones o experiencias; la distinción experto-público es más difusa.",
    icono: "fa-users",
  },
};

/** Escenarios verbatim (ejemplos del glosario A5 y casos de la lectura A1). */
export const ESCENARIOS: { id: string; texto: string; formato: Formato }[] = [
  { id: "es-c1", texto: "Coloquio sobre literatura mexicana contemporánea con tres estudiantes que defienden distintos autores", formato: "coloquio" },
  { id: "es-c2", texto: "Un grupo de seis personas con conocimiento del tema dialoga con preguntas y respuestas cruzadas, sin llegar a una conclusión unánime", formato: "coloquio" },
  { id: "es-s1", texto: "Simposio sobre los movimientos literarios del siglo XX: cada ponente expone uno diferente", formato: "simposio" },
  { id: "es-s2", texto: "Varios especialistas hacen exposiciones breves e independientes y, al final, un moderador sintetiza las conclusiones", formato: "simposio" },
  { id: "es-f1", texto: "Foro de discusión virtual sobre la reseña crítica: el moderador cede la palabra al público", formato: "foro" },
  { id: "es-f2", texto: "La UNAM y el ITAM organizan un espacio estudiantil donde los bachilleres del público intervienen con preguntas y experiencias", formato: "foro" },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 2 — Empareja concepto y definición (conceptos del proceso, A5 + A1)
 * ───────────────────────────────────────────────────────────────────────── */
export const CONCEPTOS: { id: string; concepto: string; definicion: string; ejemplo: string }[] = [
  {
    id: "co-planeacion",
    concepto: "Planeación logística",
    definicion: "Organización previa que define tema, tiempo, materiales, roles y distribución del espacio para la exposición.",
    ejemplo: "Distribuir el tiempo: 5 min de introducción, 15 min de desarrollo, 5 min de cierre y 5 de preguntas.",
  },
  {
    id: "co-ejecucion",
    concepto: "Ejecución",
    definicion: "Desarrollo real de la exposición oral siguiendo el plan establecido, con claridad, cohesión y adecuación al público.",
    ejemplo: "Presentar el tema con voz clara, apoyarse en diapositivas y mantener contacto visual con el público.",
  },
  {
    id: "co-seguimiento",
    concepto: "Seguimiento y retroalimentación",
    definicion: "Evaluación del proceso antes, durante y después de la exposición para identificar fortalezas y áreas de mejora.",
    ejemplo: "Después del coloquio, el grupo reflexiona: ¿qué salió bien? ¿qué mejoraremos la próxima vez?",
  },
  {
    id: "co-introduccion",
    concepto: "Introducción",
    definicion: "Primer momento de la lógica argumentativa: presentación del tema, contexto y tesis o posición central.",
    ejemplo: "Abrir la intervención situando el tema y enunciando con claridad la posición que se va a defender.",
  },
  {
    id: "co-desarrollo",
    concepto: "Desarrollo",
    definicion: "Cuerpo argumentativo de la exposición: argumentos sostenidos con evidencia (datos, citas, ejemplos).",
    ejemplo: "Encadenar argumentos con conectores discursivos y respaldar cada afirmación con datos o citas.",
  },
  {
    id: "co-conclusion",
    concepto: "Conclusión",
    definicion: "Cierre de la lógica argumentativa: síntesis de lo argumentado y propuesta o llamado a la reflexión.",
    ejemplo: "Recapitular los puntos centrales y cerrar con un llamado a la reflexión del público.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 3 — Empareja término y definición (glosario A5, verbatim)
 * ───────────────────────────────────────────────────────────────────────── */
export const PARES: { id: string; termino: string; definicion: string; ejemplo: string }[] = [
  {
    id: "gl-coloquio",
    termino: "Coloquio",
    definicion: "Conversación académica estructurada entre participantes que debaten un tema con posiciones argumentadas.",
    ejemplo: "Coloquio sobre literatura mexicana contemporánea con tres estudiantes que defienden distintos autores.",
  },
  {
    id: "gl-simposio",
    termino: "Simposio",
    definicion: "Evento académico donde varios especialistas o ponentes presentan perspectivas distintas sobre un mismo tema.",
    ejemplo: "Simposio sobre los movimientos literarios del siglo XX: cada ponente expone uno diferente.",
  },
  {
    id: "gl-foro",
    termino: "Foro",
    definicion: "Espacio de debate abierto, presencial o virtual, donde el público puede intervenir con preguntas y comentarios.",
    ejemplo: "Foro de discusión virtual sobre la reseña crítica: el moderador cede la palabra al público.",
  },
  {
    id: "gl-planeacion",
    termino: "Planeación logística",
    definicion: "Organización previa que define tema, tiempo, materiales, roles y distribución del espacio para la exposición.",
    ejemplo: "Distribuir el tiempo: 5 min de introducción, 15 min de desarrollo, 5 min de cierre y 5 de preguntas.",
  },
  {
    id: "gl-ejecucion",
    termino: "Ejecución",
    definicion: "Desarrollo real de la exposición oral siguiendo el plan establecido, con claridad, cohesión y adecuación al público.",
    ejemplo: "Presentar el tema con voz clara, apoyarse en diapositivas y mantener contacto visual con el público.",
  },
  {
    id: "gl-seguimiento",
    termino: "Seguimiento y retroalimentación",
    definicion: "Evaluación del proceso antes, durante y después de la exposición para identificar fortalezas y áreas de mejora.",
    ejemplo: "Después del coloquio, el grupo reflexiona: ¿qué salió bien? ¿qué mejoraremos la próxima vez?",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * Cuestionario de comprensión.
 * Q1–Q5 son las afirmaciones V/F de A4 (verbatim) renderizadas como
 * Verdadero / Falso. Q6 es la pregunta de opción múltiple de A2 (verbatim)
 * sobre coloquio vs foro, reducida a dos opciones contrastantes verbatim.
 * ───────────────────────────────────────────────────────────────────────── */
export const QUIZ: {
  pregunta: string;
  opciones: [string, string];
  correcta: 0 | 1;
  retro: string;
}[] = [
  {
    pregunta: "Un coloquio es una conversación académica entre participantes que debaten un tema de forma estructurada.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: el coloquio implica diálogo entre participantes con posiciones argumentadas sobre un tema específico.",
  },
  {
    pregunta: "En un simposio, un único orador presenta durante todo el evento sin intervención de otros participantes.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "No: en un simposio participan varios especialistas que presentan perspectivas distintas sobre un mismo tema.",
  },
  {
    pregunta: "La planeación logística de una exposición oral incluye definir el tema, el tiempo, los materiales y la distribución del espacio.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: la planeación contempla todos esos elementos para garantizar una exposición organizada y efectiva.",
  },
  {
    pregunta: "El seguimiento de una exposición oral solo se realiza durante la presentación, no antes ni después.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "No: el seguimiento implica evaluar y retroalimentar el proceso antes (preparación), durante (ejecución) y después (reflexión y mejora).",
  },
  {
    pregunta: "Un foro presencial o virtual permite la participación del público mediante preguntas y comentarios.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Sí: el foro es un espacio de debate abierto donde el público interviene activamente.",
  },
  {
    pregunta: "¿Cuál es la diferencia principal entre un coloquio y un foro?",
    opciones: [
      "El coloquio es una conversación entre expertos; el foro abre la participación al público general",
      "No hay diferencia: son sinónimos",
    ],
    correcta: 0,
    retro: "El coloquio convoca a expertos en diálogo; el foro amplía la voz al público, que puede preguntar o participar.",
  },
];

/** Dato verbatim del callout «importante» de la lectura A1. */
export const DATO_EXPOSICION =
  "Preparar una exposición oral no significa memorizar un texto para recitar. Significa conocer el tema tan bien que puedas explicarlo con tus propias palabras ante cualquier pregunta. Los apoyos visuales (diapositivas, infografías) deben complementar lo que dices, no repetirlo ni sustituirlo.";

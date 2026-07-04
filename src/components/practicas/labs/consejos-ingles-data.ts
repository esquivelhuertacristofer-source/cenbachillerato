/**
 * Datos del Laboratorio — Advice in English: should, shouldn't and imperatives
 * (IN-IV-P04, Inglés IV — A2+).
 *
 * Contenido VERBATIM de IN-IV·P04 ("Advice in English: Should, Shouldn't and
 * Imperatives"). Las oraciones a clasificar, los huecos a completar, el glosario
 * y las afirmaciones del cuestionario se toman literalmente de las actividades
 * A1 (lectura), A2 (quiz V/F), A4 (quiz V/F) y A5 (glosario interactivo).
 */

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 1 — Should, shouldn't or imperative? (clasifica por forma)
 * Las tres formas y sus ejemplos son verbatim de A1.
 * ───────────────────────────────────────────────────────────────────────── */
export type Forma = "should" | "shouldnt" | "imperative";

export const FORMA_INFO: Record<
  Forma,
  { titulo: string; subtitulo: string; ejemplo: string; icono: string }
> = {
  should: {
    titulo: "SHOULD + base verb",
    subtitulo: "Recomienda una acción: deberías hacer algo.",
    ejemplo: "You should drink more water.",
    icono: "fa-thumbs-up",
  },
  shouldnt: {
    titulo: "SHOULDN'T + base verb",
    subtitulo: "Aconseja EN CONTRA de una acción: no deberías hacer algo.",
    ejemplo: "You shouldn't eat too much junk food.",
    icono: "fa-thumbs-down",
  },
  imperative: {
    titulo: "IMPERATIVES",
    subtitulo: "Instrucciones o consejos directos (con o sin Don't).",
    ejemplo: "Eat more fruit and vegetables. / Don't skip breakfast.",
    icono: "fa-bullhorn",
  },
};

export const ORACIONES: { id: string; texto: string; forma: Forma }[] = [
  { id: "or-sh1", texto: "You should drink more water.", forma: "should" },
  { id: "or-sh2", texto: "She should study a little every day.", forma: "should" },
  { id: "or-sh3", texto: "You should talk to your teacher if you have a problem.", forma: "should" },
  { id: "or-sn1", texto: "You shouldn't eat too much junk food.", forma: "shouldnt" },
  { id: "or-sn2", texto: "He shouldn't use his phone during class.", forma: "shouldnt" },
  { id: "or-sn3", texto: "You shouldn't stay up all night before an exam.", forma: "shouldnt" },
  { id: "or-im1", texto: "Eat more fruit and vegetables.", forma: "imperative" },
  { id: "or-im2", texto: "Don't skip breakfast.", forma: "imperative" },
  { id: "or-im3", texto: "Study for at least 30 minutes every day.", forma: "imperative" },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 2 — Complete the advice (arrastra la forma correcta al hueco)
 * Cada hueco es un ejemplo verbatim de A1; la ficha correcta completa la
 * recomendación. Hay distractores que no encajan en ningún hueco.
 * ───────────────────────────────────────────────────────────────────────── */
export const HUECOS: {
  id: string;
  antes: string;
  resp: string;
  despues: string;
  pista: string;
}[] = [
  {
    id: "hu-should",
    antes: "You",
    resp: "should",
    despues: "drink more water. (health advice)",
    pista: "Recomienda una acción amable.",
  },
  {
    id: "hu-shouldnt",
    antes: "You",
    resp: "shouldn't",
    despues: "eat too much junk food. (health)",
    pista: "Aconseja en contra de una acción.",
  },
  {
    id: "hu-dont",
    antes: "",
    resp: "Don't",
    despues: "skip breakfast. (imperative)",
    pista: "Imperativo negativo: instrucción directa.",
  },
  {
    id: "hu-ask",
    antes: "What",
    resp: "should",
    despues: "I do? (asking for advice)",
    pista: "Pregunta estándar para pedir consejo.",
  },
];

/** Distractores del modo «completar»: formas que no encajan en ningún hueco. */
export const DISTRACTORES_HUECO: string[] = ["should to", "must", "shoulds", "musn't"];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 3 — Match the structure (glosario A5, verbatim)
 * ───────────────────────────────────────────────────────────────────────── */
export const PARES: { id: string; termino: string; definicion: string; ejemplo: string }[] = [
  {
    id: "gl-should",
    termino: "You should / shouldn't + infinitive",
    definicion: "Consejo directo: deberías / no deberías hacer algo.",
    ejemplo: "You should drink more water and you shouldn't skip breakfast.",
  },
  {
    id: "gl-ifiwere",
    termino: "If I were you, I would...",
    definicion: "Consejo empático usando el condicional II.",
    ejemplo: "If I were you, I would talk to the teacher about it.",
  },
  {
    id: "gl-thought",
    termino: "Have you thought about + verb-ing?",
    definicion: "Sugerencia amable que invita a reflexionar.",
    ejemplo: "Have you thought about joining the study group?",
  },
  {
    id: "gl-whydont",
    termino: "Why don't you + verb?",
    definicion: "Sugerencia informal y amistosa.",
    ejemplo: "Why don't you take a short break and then continue?",
  },
  {
    id: "gl-whatdo",
    termino: "What do you think I should do?",
    definicion: "Pregunta estándar para pedir consejo en inglés.",
    ejemplo: "I feel overwhelmed. What do you think I should do?",
  },
  {
    id: "gl-empathy",
    termino: "That must be tough / I understand",
    definicion: "Expresiones de empatía antes de dar un consejo.",
    ejemplo: "That must be tough. If I were you, I would ask for help.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * Cuestionario de comprensión (V/F de A4, verbatim).
 * Renderizado como opción doble Verdadero / Falso.
 * ───────────────────────────────────────────────────────────────────────── */
export const QUIZ: {
  pregunta: string;
  opciones: [string, string];
  correcta: 0 | 1;
  retro: string;
}[] = [
  {
    pregunta: "'You should + bare infinitive' is one of the most common ways to give advice in English.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correct: 'You should rest more' = te recomiendo que descanses más.",
  },
  {
    pregunta: "'If I were you, I would...' is a conditional structure used to give advice empathetically.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correct: this structure invites the listener to imagine the advisor's perspective.",
  },
  {
    pregunta: "'What do you think I should do?' is an incorrect way to ask for advice.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "No, it's a perfectly correct and natural way to ask for advice in English.",
  },
  {
    pregunta: "'You must exercise' sounds softer and more empathetic than 'You should exercise'.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "'Must' is stronger and more imposing. 'Should' or 'Why don't you...?' sound more empathetic.",
  },
  {
    pregunta: "'Have you thought about + verb-ing?' is a gentle, suggestion-style way to give advice.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correct: it invites reflection without imposing, which is especially empathetic.",
  },
  {
    pregunta: "'You should to eat more vegetables' is grammatically correct.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "Incorrecto. 'Should' es un verbo modal y siempre va seguido del verbo base SIN 'to'. La forma correcta es: 'You should eat more vegetables.' Comparar: should + base verb (never 'should to').",
  },
  {
    pregunta: "'Don't eat too much sugar' is an imperative giving advice about health.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto. Los imperativos negativos (Don't + base verb) se usan para dar instrucciones o consejos directos. 'Don't eat too much sugar' = No comas demasiada azúcar — es un consejo de salud directo y gramaticalmente correcto.",
  },
];

/** Dato verbatim de A1 (el contexto importa). */
export const DATO_CONSEJOS =
  "Context matters (el contexto importa). The same advice changes depending on who you are talking to: para un amigo es informal; para un estudiante más joven es alentador; en un contexto comunitario es más responsable.";

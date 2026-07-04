/**
 * Datos VERBATIM de IN-V·P02 «Sharing experiences: present perfect for life
 * events» (Inglés V, Present Perfect). Fuente: A1 (glosario de vocabulario),
 * A2 (fill_blanks), A4 (quiz V/F), A5 (glosario de estructuras clave).
 *
 * Módulo de datos puro (sin three.js, sin React) que alimenta a
 * LabPresentPerfectIngles.
 *
 * Foco del laboratorio: PRESENT PERFECT (have/has + past participle) para
 * experiencias de vida sin tiempo específico (ever / never / already / yet /
 * just / since / always), CONTRASTADO con el past simple, que pide un momento
 * concreto (last year, yesterday, when I was...). El contraste es verbatim de
 * A4 («I have visited a hospital last year» es INCORRECTO; con «since» se exige
 * present perfect, etc.) y de las pistas de A2.
 *
 * El glosario de vocabulario académico de A1 (career, internship, skill…) es
 * léxico, no gramática del present perfect; NO se incluye por fidelidad al tema.
 */

/* ── Modo 1: «Present perfect or past simple?» (clasifica por la pista) ────────
 * Clasifica oraciones/expresiones según el tiempo verbal que exigen. Las reglas
 * son verbatim de A4 y de las pistas de A2:
 *  - present perfect (have/has + participle): experiencia sin tiempo concreto;
 *    marcadores ever/never/already/yet/just/since/always.
 *  - past simple: evento terminado en un momento específico
 *    (last year, yesterday, when I was..., two days ago).
 */
export type Tiempo = "present_perfect" | "past_simple";

export interface TiempoInfo {
  titulo: string;
  subtitulo: string;
  ejemplo: string;
  icono: string;
}

export const TIEMPO_INFO: Record<Tiempo, TiempoInfo> = {
  present_perfect: {
    titulo: "Present perfect",
    subtitulo: "have / has + past participle. Experiencias de vida SIN tiempo concreto.",
    ejemplo: "I have visited a hospital before.",
    icono: "fa-infinity",
  },
  past_simple: {
    titulo: "Past simple",
    subtitulo: "Evento terminado en un momento ESPECÍFICO del pasado.",
    ejemplo: "I visited a hospital last year.",
    icono: "fa-clock-rotate-left",
  },
};

export interface CasoTiempo {
  id: string;
  texto: string;
  tiempo: Tiempo;
}

/**
 * Casos a clasificar. Marcadores y oraciones tomados verbatim de A4 y de las
 * pistas de A2. Los marcadores «ever/never/already/yet/just» son los del foco
 * del tema (present perfect for life events).
 */
export const CASOS: CasoTiempo[] = [
  // present perfect: sin tiempo concreto / since / always / ever-never-already-yet-just
  { id: "pp-since", texto: "I have enjoyed working with computers since I was a child.", tiempo: "present_perfect" },
  { id: "pp-always", texto: "I have always been interested in medicine.", tiempo: "present_perfect" },
  { id: "pp-before", texto: "I have visited a hospital before.", tiempo: "present_perfect" },
  { id: "pp-ever", texto: "Have you ever done volunteer work?", tiempo: "present_perfect" },
  { id: "pp-never", texto: "I have never been to a science fair.", tiempo: "present_perfect" },
  { id: "pp-already", texto: "She has already finished the internship.", tiempo: "present_perfect" },
  // past simple: tiempo específico
  { id: "ps-lastyear", texto: "I visited a hospital last year.", tiempo: "past_simple" },
  { id: "ps-when", texto: "When I was in middle school, I discovered my passion for technology.", tiempo: "past_simple" },
  { id: "ps-secondary", texto: "When I was in secondary school, I did my first chemistry experiment.", tiempo: "past_simple" },
  { id: "ps-fair", texto: "Last year, I participated in a science fair at my school.", tiempo: "past_simple" },
];

/* ── Modo 2: «Complete the paragraph» (arrastra al hueco) ─────────────────────
 * Reconstruye el párrafo de A2 hueco por hueco. Cada hueco pide la forma
 * correcta (auxiliar del present perfect, past simple, participio o base) según
 * la pista verbatim de A2. Hay distractores que NO encajan en ningún hueco.
 */
export interface Hueco {
  id: string;
  antes: string;
  despues: string;
  resp: string;
  pista: string;
}

/** Huecos verbatim de A2 (texto y respuestas correctas). */
export const HUECOS: Hueco[] = [
  {
    id: "hu-have1",
    antes: "I",
    despues: "always been passionate about science.",
    resp: "have",
    pista: "Present perfect con 'always': have + participio.",
  },
  {
    id: "hu-did",
    antes: "When I was in secondary school, I",
    despues: "my first chemistry experiment.",
    resp: "did",
    pista: "Past simple: evento específico ('When I was...').",
  },
  {
    id: "hu-have2",
    antes: "Since then, I",
    despues: "taken many science classes.",
    resp: "have",
    pista: "'Since then' → present perfect: auxiliar 'have'.",
  },
  {
    id: "hu-participated",
    antes: "Last year, I",
    despues: "in a science fair at my school.",
    resp: "participated",
    pista: "'Last year' → past simple.",
  },
  {
    id: "hu-taken",
    antes: "I have also",
    despues: "some online courses about programming.",
    resp: "taken",
    pista: "'I have also ___' → participio pasado de 'take'.",
  },
  {
    id: "hu-develop",
    antes: "This semester, I am going to",
    despues: "a science project for the school community.",
    resp: "develop",
    pista: "'Going to ___' → verbo base (infinitivo sin 'to').",
  },
];

/** Distractores típicos que NO encajan en ningún hueco. */
export const DISTRACTORES_HUECO: string[] = ["has", "took", "taked", "developed"];

/* ── Modo 3: «Match the structure» (glosario A5, verbatim) ────────────────────
 * Empareja cada estructura clave con su definición (verbatim de A5).
 */
export interface ParGlosario {
  id: string;
  termino: string;
  definicion: string;
  ejemplo: string;
}

export const PARES: ParGlosario[] = [
  {
    id: "gl-when",
    termino: "When I was..., I...",
    definicion: "A structure using the past simple to set a time context and narrate what happened. 'When I was [age/place], I [past simple verb]...'",
    ejemplo: "When I was in secondary school, I joined a science club.",
  },
  {
    id: "gl-always",
    termino: "I have always been interested in...",
    definicion: "Uses the present perfect with 'always' to describe a long-standing interest that started in the past and continues now.",
    ejemplo: "I have always been interested in medicine.",
  },
  {
    id: "gl-taught",
    termino: "This experience taught me...",
    definicion: "A past simple structure to explain what you learned from a specific experience. 'Teach' (past: taught) is used with a person as the indirect object.",
    ejemplo: "This experience taught me the importance of teamwork.",
  },
  {
    id: "gl-sequence",
    termino: "First... Then... After that... Finally...",
    definicion: "Sequencing connectors used to organize a narrative in chronological order. Essential for telling a story or describing a sequence of events clearly.",
    ejemplo: "First, I read about biotechnology. Then, I attended a workshop. Finally, I decided this was my field.",
  },
  {
    id: "gl-thatiswhy",
    termino: "That is why I decided to...",
    definicion: "A cause-and-effect connector in the past tense, used to explain the reason for a decision. Links an experience to a conclusion or action.",
    ejemplo: "I saw how engineers helped my community. That is why I decided to study civil engineering.",
  },
  {
    id: "gl-itwas",
    termino: "It was a challenging / rewarding / eye-opening experience.",
    definicion: "Adjective phrases used to evaluate a past experience. 'Challenging' = difficult but worthy. 'Rewarding' = satisfying. 'Eye-opening' = it changed how you see something.",
    ejemplo: "Working in the health center was a rewarding experience.",
  },
];

/* ── Cuestionario (5 ítems V/F verbatim de A4) ───────────────────────────────
 * El campo `correcta` es 0 = Verdadero, 1 = Falso (verbatim de A4.respuesta).
 */
export interface QuizItem {
  pregunta: string;
  opciones: [string, string];
  correcta: 0 | 1;
  retro: string;
}

export const QUIZ: QuizItem[] = [
  {
    pregunta: "The sentence 'I have visited a hospital last year' is grammatically correct in English.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "False. When a specific past time is mentioned ('last year'), you must use the simple past: 'I visited a hospital last year.' The present perfect ('have visited') is used for experiences without a specific time, e.g., 'I have visited a hospital before.'",
  },
  {
    pregunta: "To narrate a personal experience in sequence, connecting words like 'first', 'then', 'after that', and 'finally' are commonly used in English.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correct! Sequencing words (discourse markers) help organize a narrative clearly. Example: 'First, I observed the experiment. Then, I recorded the results. Finally, I wrote my conclusion.'",
  },
  {
    pregunta: "The sentence 'When I was in middle school, I discovered my passion for technology' uses the past simple correctly.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correct! 'Was' (past of 'be') and 'discovered' (past simple of 'discover') are both correct. This sentence describes a completed event in the past at a specific time ('when I was in middle school').",
  },
  {
    pregunta: "In English, 'I enjoyed working with computers since I was a child' is a correct sentence.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "False. 'Since' requires the present perfect: 'I have enjoyed working with computers since I was a child.' Using simple past 'enjoyed' with 'since' is incorrect because 'since' connects a past starting point to the present.",
  },
  {
    pregunta: "The phrase 'This experience made me realize that...' is a useful structure to explain how a past experience influenced your interest in a field.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correct! 'This experience made me realize that...' is a natural and effective structure to express the impact of a past event. 'Made me + base verb' (made me realize / made me understand / made me want) is a common English pattern.",
  },
];

/** Dato verbatim del foco de A4/A2: la regla clave present perfect vs past simple. */
export const DATO_PRESENT_PERFECT =
  "Use the present perfect (have/has + past participle) for life experiences without a specific time, and with 'since' and 'always': «I have visited a hospital before.» When a specific past time is mentioned (last year, yesterday, when I was...), use the simple past: «I visited a hospital last year.»";

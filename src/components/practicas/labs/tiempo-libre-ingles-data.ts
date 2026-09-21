/**
 * Datos del laboratorio «Free time activities» — IN-II-P02 (Inglés II).
 *
 * Contenido VERBATIM de la progresión IN-II·P02:
 *   · A1 (lectura «Free Time Activities: What Do People Do?») → reglas de la
 *     -s, posición de los adverbios de frecuencia, porcentajes y el callout
 *     sobre «go + -ing»;
 *   · A2 (fill_blanks «Third Person Present Simple: Gaps») → el modo
 *     «Completa el texto» (vive en tiempo-libre-ingles-huecos.ts);
 *   · A4 (quiz V/F «True or False — Free time & negatives») y A9 (preguntas
 *     del video) → el reto evaluable;
 *   · A5 (glosario) → el glosario de la ficha.
 *
 * Las oraciones de práctica que NO son verbatim están escritas aquí a mano en
 * inglés estadounidense estándar y revisadas una a una; los nombres y lugares
 * son ficticios pero verosímiles en México (el tianguis, el parque), en línea
 * con el contexto que la propia lectura A1 usa.
 *
 * Archivo de datos puros: sin React, sin three.
 */

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 1 — «Spin the subject»: la -s que aparece y desaparece
 * El alumno gira el sujeto y el verbo tiene que seguirlo.
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface RondaSujeto {
  id: string;
  /** El sujeto tal y como se lee en la oración. */
  sujeto: string;
  /** Etiqueta corta para el dial (I, you, he, she, it, we, they…). */
  pronombre: string;
  /** ¿Es tercera persona del singular? */
  tercera: boolean;
  /** Trozo de la oración antes del verbo (vacío: el sujeto ya va delante). */
  antes: string;
  despues: string;
  /** Infinitivo del verbo que hay que ajustar. */
  base: string;
  /** Las tres formas ofrecidas, en orden fijo (nada de barajar en render). */
  opciones: string[];
  /** Índice de la forma correcta dentro de `opciones`. */
  correcta: number;
  /** Por qué, en español, con el ejemplo en inglés. */
  porque: string;
}

export const RONDAS_SUJETO: RondaSujeto[] = [
  {
    id: "s-i",
    sujeto: "I",
    pronombre: "I",
    tercera: false,
    antes: "",
    despues: " soccer on Saturdays.",
    base: "play",
    opciones: ["play", "plays", "playes"],
    correcta: 0,
    porque:
      "Con I el verbo se queda en su forma base. La -s es solo de he, she e it.",
  },
  {
    id: "s-you",
    sujeto: "You",
    pronombre: "you",
    tercera: false,
    antes: "",
    despues: " graphic novels in your free time.",
    base: "read",
    opciones: ["read", "reads", "reades"],
    correcta: 0,
    porque:
      "You nunca lleva marca en el verbo, ni cuando es una persona ni cuando son varias.",
  },
  {
    id: "s-he",
    sujeto: "He",
    pronombre: "he",
    tercera: true,
    antes: "",
    despues: " TV series after school.",
    base: "watch",
    opciones: ["watch", "watchs", "watches"],
    correcta: 2,
    porque:
      "He es tercera persona del singular, y watch termina en -ch: se le añade -es, no solo -s.",
  },
  {
    id: "s-she",
    sujeto: "She",
    pronombre: "she",
    tercera: true,
    antes: "",
    despues: " English every evening.",
    base: "study",
    opciones: ["study", "studys", "studies"],
    correcta: 2,
    porque:
      "Study termina en consonante + y (d + y): la y se convierte en i y se añade -es.",
  },
  {
    id: "s-it",
    sujeto: "The gym",
    pronombre: "it",
    tercera: true,
    antes: "",
    despues: " at six in the morning.",
    base: "open",
    opciones: ["open", "opens", "openes"],
    correcta: 1,
    porque:
      "The gym es una cosa: funciona como it, tercera persona del singular. Open es un verbo normal, así que basta con -s.",
  },
  {
    id: "s-we",
    sujeto: "We",
    pronombre: "we",
    tercera: false,
    antes: "",
    despues: " to the tianguis on Sundays.",
    base: "go",
    opciones: ["go", "goes", "gos"],
    correcta: 0,
    porque:
      "We es plural: forma base. Goes solo aparecería con he, she o it.",
  },
  {
    id: "s-they",
    sujeto: "They",
    pronombre: "they",
    tercera: false,
    antes: "",
    despues: " to music in the park.",
    base: "listen",
    opciones: ["listen", "listens", "listenes"],
    correcta: 0,
    porque: "They es plural: el verbo no cambia nunca.",
  },
  {
    id: "s-brother",
    sujeto: "My brother",
    pronombre: "he",
    tercera: true,
    antes: "",
    despues: " pictures everywhere.",
    base: "take",
    opciones: ["take", "takes", "takees"],
    correcta: 1,
    porque:
      "My brother es una sola persona: equivale a he. Take es un verbo normal, así que añade -s.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 2 — «The three -s rules»: clasificar, no memorizar la lista
 * VERBATIM de A1: «Most verbs simply add -s (play → plays, read → reads).
 * Verbs ending in -sh, -ch, -x, -o, or -ss add -es (watch → watches, go →
 * goes). Verbs ending in a consonant + y change the y to i and add -es
 * (study → studies).»
 * ═══════════════════════════════════════════════════════════════════════════ */

export type TipoRegla = "s" | "es" | "ies";

export interface VerboRegla {
  id: string;
  base: string;
  /** Traducción breve al español, como apoyo léxico. */
  es: string;
  tercera: string;
  tipo: TipoRegla;
  /** Por qué le toca esa regla. */
  nota: string;
}

export const VERBOS: VerboRegla[] = [
  { id: "v-play", base: "play", es: "jugar", tercera: "plays", tipo: "s", nota: "Termina en y, pero la y va después de VOCAL (a + y): no cambia, solo añade -s." },
  { id: "v-read", base: "read", es: "leer", tercera: "reads", tipo: "s", nota: "Verbo regular sin terminación especial: basta con -s." },
  { id: "v-love", base: "love", es: "encantar", tercera: "loves", tipo: "s", nota: "Termina en -e muda: solo se añade -s." },
  { id: "v-enjoy", base: "enjoy", es: "disfrutar", tercera: "enjoys", tipo: "s", nota: "Otra y después de vocal (o + y): nunca «enjoies»." },
  { id: "v-watch", base: "watch", es: "ver (tele)", tercera: "watches", tipo: "es", nota: "Termina en -ch: se añade -es para poder pronunciarlo." },
  { id: "v-go", base: "go", es: "ir", tercera: "goes", tipo: "es", nota: "Termina en -o, como do." },
  { id: "v-do", base: "do", es: "hacer", tercera: "does", tipo: "es", nota: "Termina en -o, y su tercera persona es el mismo does del auxiliar." },
  { id: "v-miss", base: "miss", es: "perderse / extrañar", tercera: "misses", tipo: "es", nota: "Termina en -ss, igual que kiss o pass." },
  { id: "v-study", base: "study", es: "estudiar", tercera: "studies", tipo: "ies", nota: "Consonante + y (d + y): la y se vuelve i y se añade -es." },
  { id: "v-fly", base: "fly", es: "volar", tercera: "flies", tipo: "ies", nota: "Consonante + y (l + y): la y se vuelve i." },
  { id: "v-carry", base: "carry", es: "llevar", tercera: "carries", tipo: "ies", nota: "Consonante + y (r + y), la misma regla que study." },
  { id: "v-cry", base: "cry", es: "llorar", tercera: "cries", tipo: "ies", nota: "Consonante + y (r + y), la misma regla que carry." },
];

export const REGLA_INFO: Record<TipoRegla, { titulo: string; subtitulo: string; ejemplo: string; icono: string }> = {
  s: {
    titulo: "Add -s",
    subtitulo: "La mayoría de los verbos",
    ejemplo: "play → plays · read → reads",
    icono: "fa-plus",
  },
  es: {
    titulo: "Add -es",
    subtitulo: "Terminan en -sh, -ch, -x, -o o -ss",
    ejemplo: "watch → watches · go → goes",
    icono: "fa-plus-minus",
  },
  ies: {
    titulo: "y → ies",
    subtitulo: "Terminan en CONSONANTE + y",
    ejemplo: "study → studies",
    icono: "fa-arrows-rotate",
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 3 — «Negative & question machine»: don't / doesn't, do / does
 * La trampa central: tras el auxiliar el verbo VUELVE a su forma base.
 * A4 lo dice verbatim: «tras don't/doesn't el verbo va en forma base».
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Auxiliar = "Do" | "Does" | "don't" | "doesn't";

export const AUXILIARES: Auxiliar[] = ["Do", "Does", "don't", "doesn't"];

export interface Transformacion {
  id: string;
  /** La oración afirmativa de partida. */
  afirmativa: string;
  /** «negativa» | «pregunta» */
  meta: "negativa" | "pregunta";
  /** Sujeto que encabeza la frase resultante. */
  sujeto: string;
  /** Auxiliar correcto. */
  aux: Auxiliar;
  /** Las dos formas del verbo que se ofrecen, en orden fijo. */
  verbos: [string, string];
  /** Índice de la forma correcta (siempre la base). */
  verboCorrecto: number;
  /** Lo que queda después del verbo. */
  resto: string;
  /** El error típico, para verlo tachado al resolver. */
  error: string;
  /** Respuesta corta modelo (verbatim del patrón de A5/A6). */
  corta: string;
  porque: string;
}

export const TRANSFORMACIONES: Transformacion[] = [
  {
    id: "t-1",
    afirmativa: "She plays tennis.",
    meta: "negativa",
    sujeto: "She",
    aux: "doesn't",
    verbos: ["plays", "play"],
    verboCorrecto: 1,
    resto: "tennis.",
    error: "She doesn't plays tennis.",
    corta: "No, she doesn't.",
    porque:
      "La marca de tercera persona ya la lleva doesn't (does + not). El verbo principal vuelve a su forma base: «She doesn't play tennis.»",
  },
  {
    id: "t-2",
    afirmativa: "He watches TV series.",
    meta: "pregunta",
    sujeto: "he",
    aux: "Does",
    verbos: ["watches", "watch"],
    verboCorrecto: 1,
    resto: "TV series?",
    error: "Does he watches TV series?",
    corta: "Yes, he does.",
    porque:
      "Does + sujeto + verbo base. Las -es de watches se mudan al auxiliar: «Does he watch TV series?»",
  },
  {
    id: "t-3",
    afirmativa: "They go to the park.",
    meta: "negativa",
    sujeto: "They",
    aux: "don't",
    verbos: ["goes", "go"],
    verboCorrecto: 1,
    resto: "to the park.",
    error: "They doesn't go to the park.",
    corta: "No, they don't.",
    porque:
      "They es plural: le toca don't, no doesn't. Y el verbo se queda en base: «They don't go to the park.»",
  },
  {
    id: "t-4",
    afirmativa: "You read comics.",
    meta: "pregunta",
    sujeto: "you",
    aux: "Do",
    verbos: ["reads", "read"],
    verboCorrecto: 1,
    resto: "comics?",
    error: "Does you read comics?",
    corta: "Yes, I do.",
    porque:
      "Con I, you, we y they la pregunta empieza con Do: «Do you read comics?» La respuesta corta es «Yes, I do.»",
  },
  {
    id: "t-5",
    afirmativa: "My sister studies English.",
    meta: "negativa",
    sujeto: "My sister",
    aux: "doesn't",
    verbos: ["studies", "study"],
    verboCorrecto: 1,
    resto: "English.",
    error: "My sister doesn't studies English.",
    corta: "No, she doesn't.",
    porque:
      "My sister equivale a she, así que doesn't. Studies pierde su -ies y vuelve a study: «My sister doesn't study English.»",
  },
  {
    id: "t-6",
    afirmativa: "Your brother plays soccer.",
    meta: "pregunta",
    sujeto: "your brother",
    aux: "Does",
    verbos: ["plays", "play"],
    verboCorrecto: 1,
    resto: "soccer?",
    error: "Does your brother plays soccer?",
    corta: "No, he doesn't.",
    porque:
      "Your brother es tercera persona del singular: Does. Y detrás, verbo base: «Does your brother play soccer?» (es la pregunta de la actividad A6).",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 4 — «Where does the adverb go?»
 * VERBATIM de A1: «In a sentence, frequency adverbs go before the main verb:
 * She always dances at parties. He never misses a football game. They
 * sometimes go to the cinema.» Con el matiz que la lectura no dice y sí hace
 * falta: con el verbo «to be» el adverbio va DESPUÉS.
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface Adverbio {
  palabra: string;
  /** Porcentaje verbatim de A1. */
  porcentaje: string;
  /** Valor 0-100 para pintar la barra. */
  nivel: number;
}

/** Escala completa de A1, de mayor a menor frecuencia. */
export const ADVERBIOS: Adverbio[] = [
  { palabra: "always", porcentaje: "100%", nivel: 100 },
  { palabra: "usually", porcentaje: "about 80%", nivel: 80 },
  { palabra: "often", porcentaje: "about 60%", nivel: 60 },
  { palabra: "sometimes", porcentaje: "about 40%", nivel: 40 },
  { palabra: "rarely / seldom", porcentaje: "about 20%", nivel: 20 },
  { palabra: "never", porcentaje: "0%", nivel: 0 },
];

export interface FraseAdverbio {
  id: string;
  /** El sujeto, que nunca es un hueco (así no se descarta «Sometimes they…», que también sería válido). */
  sujeto: string;
  /** El resto de la oración, palabra a palabra. Los huecos van entre estas piezas. */
  tokens: string[];
  adverbio: string;
  /** Hueco correcto: 0 = justo después del sujeto. */
  hueco: number;
  /** ¿El verbo de la oración es «to be»? */
  esToBe: boolean;
  porque: string;
  /** Lo que se lee al resolverla. */
  completa: string;
}

export const FRASES_ADVERBIO: FraseAdverbio[] = [
  {
    id: "f-1",
    sujeto: "She",
    tokens: ["dances", "at", "parties."],
    adverbio: "always",
    hueco: 0,
    esToBe: false,
    porque: "El adverbio de frecuencia va ANTES del verbo principal. Es la oración de la lectura A1.",
    completa: "She always dances at parties.",
  },
  {
    id: "f-2",
    sujeto: "He",
    tokens: ["misses", "a", "football", "game."],
    adverbio: "never",
    hueco: 0,
    esToBe: false,
    porque: "Never va antes del verbo principal, igual que always. Oración verbatim de la lectura A1.",
    completa: "He never misses a football game.",
  },
  {
    id: "f-3",
    sujeto: "They",
    tokens: ["go", "to", "the", "cinema."],
    adverbio: "sometimes",
    hueco: 0,
    esToBe: false,
    porque: "Antes del verbo principal. Oración verbatim de la lectura A1.",
    completa: "They sometimes go to the cinema.",
  },
  {
    id: "f-4",
    sujeto: "We",
    tokens: ["play", "football", "in", "the", "park."],
    adverbio: "often",
    hueco: 0,
    esToBe: false,
    porque: "Often también se coloca delante del verbo principal.",
    completa: "We often play football in the park.",
  },
  {
    id: "f-5",
    sujeto: "My sister",
    tokens: ["studies", "English", "in", "the", "evening."],
    adverbio: "usually",
    hueco: 0,
    esToBe: false,
    porque: "Delante del verbo principal, aunque el sujeto sean dos palabras.",
    completa: "My sister usually studies English in the evening.",
  },
  {
    id: "f-6",
    sujeto: "The tianguis",
    tokens: ["is", "busy", "on", "Sundays."],
    adverbio: "always",
    hueco: 1,
    esToBe: true,
    porque:
      "Aquí el verbo es «to be» (is), y con to be el adverbio va DESPUÉS del verbo. Nunca «The tianguis always is…».",
    completa: "The tianguis is always busy on Sundays.",
  },
  {
    id: "f-7",
    sujeto: "Luis",
    tokens: ["is", "late", "for", "practice."],
    adverbio: "never",
    hueco: 1,
    esToBe: true,
    porque: "Otra vez «to be»: el adverbio se coloca detrás de is, nunca delante.",
    completa: "Luis is never late for practice.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * Reto evaluable — VERBATIM de A4 (quiz V/F) y de A9 (preguntas del video)
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface ReactivoQuiz {
  enunciado: string;
  opciones: string[];
  respuestaCorrecta: number;
  retroalimentacion: string;
}

export const QUIZ_TITULO = "True or False — Free time & negatives";
/** Verbatim de A4: puntaje_minimo_aprobacion. */
export const QUIZ_MINIMO = 70;

export const QUIZ: ReactivoQuiz[] = [
  {
    enunciado: "Con he/she la negación se forma con 'doesn't' + verbo base ('He doesn't play').",
    opciones: ["Verdadero", "Falso"],
    respuestaCorrecta: 0,
    retroalimentacion: "Correcto: doesn't + verbo SIN -s.",
  },
  {
    enunciado: "'Does she like soccer?' es una pregunta correcta en presente simple.",
    opciones: ["Verdadero", "Falso"],
    respuestaCorrecta: 0,
    retroalimentacion: "Sí: Does + sujeto + verbo base.",
  },
  {
    enunciado: "La respuesta corta a 'Do you read?' es 'Yes, I read'.",
    opciones: ["Verdadero", "Falso"],
    respuestaCorrecta: 1,
    retroalimentacion: "La respuesta corta es 'Yes, I do' / 'No, I don't'.",
  },
  {
    enunciado: "Después de 'doesn't' el verbo lleva -s ('She doesn't plays').",
    opciones: ["Verdadero", "Falso"],
    respuestaCorrecta: 1,
    retroalimentacion: "No: tras don't/doesn't el verbo va en forma base: 'She doesn't play'.",
  },
  {
    enunciado: "'They don't watch TV' es presente simple negativo.",
    opciones: ["Verdadero", "Falso"],
    respuestaCorrecta: 0,
    retroalimentacion: "Correcto: don't para I/you/we/they.",
  },
  {
    enunciado: "¿Cuál es la forma correcta de la tercera persona del verbo 'watch'?",
    opciones: ["watchs", "watches", "watchies"],
    respuestaCorrecta: 1,
    retroalimentacion:
      "Watch termina en -ch, así que añade -es: watches. (Pregunta del video IN-II-P02-A9.)",
  },
  {
    enunciado:
      "En la pregunta 'Does he play basketball?', el verbo principal vuelve a su forma base porque la marca de tercera persona la lleva 'does'.",
    opciones: ["Verdadero", "Falso"],
    respuestaCorrecta: 0,
    retroalimentacion:
      "Correcto: la -s viaja al auxiliar. (Pregunta del video IN-II-P02-A9.)",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * Nota verbatim del callout de A1
 * ═══════════════════════════════════════════════════════════════════════════ */

export const DATO_TIEMPO_LIBRE =
  'The verb "go" is often followed by a gerund (-ing form) for activities: go swimming, go dancing, go shopping, go hiking. This is a fixed structure in English: you cannot say "go to swim" in the same way. Note also "play" (for sports and games with rules: play football, play chess) vs "go" (for activities: go swimming, go running).';

/** Vocabulario de ocio que la lectura A1 enumera, verbatim. */
export const VOCABULARIO_OCIO =
  "play sports, watch TV series, listen to music, hang out with friends, go to the park, cook, read books or comics, dance, take photos, play video games, go swimming, do yoga, paint or draw.";

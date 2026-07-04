/**
 * Datos del laboratorio "English Lab — Greetings & introductions" (IN-I-P01-A2).
 *
 * Módulo de datos PURO (sin three, sin React): contenido alineado VERBATIM a la
 * lectura A1 «Hello! Nice to meet you» (IN-I·P01), la actividad A2 «Complete my
 * introduction», el quiz A4 y el glosario A6 de Inglés I.
 *
 * Las oraciones del constructor se toman literalmente del texto con huecos de A2;
 * las formas del verbo "to be", las funciones (saludo/presentación/despedida) y
 * el cuestionario son verbatim de A1/A4/A6.
 */

/* ── Modo «Build the sentence» (ordenar palabras) ──────────────────────── */
// Oraciones verbatim de A2: "Hi! My name is Valeria. I am 16 years old.
// I am from Guadalajara, Mexico. This is my friend Diego. He is from Monterrey.
// Nice to meet you!"
export interface Oracion {
  id: string;
  /** Palabras EN SU ORDEN correcto. */
  palabras: string[];
  traduccion: string;
}

export const ORACIONES: Oracion[] = [
  { id: "o1", palabras: ["My", "name", "is", "Valeria"], traduccion: "Mi nombre es Valeria." },
  { id: "o2", palabras: ["I", "am", "from", "Guadalajara"], traduccion: "Soy de Guadalajara." },
  { id: "o3", palabras: ["This", "is", "my", "friend", "Diego"], traduccion: "Este es mi amigo Diego." },
  { id: "o4", palabras: ["Nice", "to", "meet", "you"], traduccion: "Mucho gusto (encantado de conocerte)." },
];

/* ── Modo «The verb to be» (sujeto → am / is / are) ────────────────────── */
// Verbatim A6: "Verbo ser/estar. I am, you are, he/she is."
export type ToBe = "am" | "is" | "are";

export const TOBE_INFO: Record<ToBe, { label: string; descripcion: string; icono: string; color: string }> = {
  am: { label: "am", descripcion: "Solo con I.", icono: "fa-user", color: "#5BA8FF" },
  is: { label: "is", descripcion: "He / She / It (3.ª persona singular).", icono: "fa-user-tag", color: "#34D399" },
  are: { label: "are", descripcion: "You / We / They (plural y «you»).", icono: "fa-user-group", color: "#C792EA" },
};

export interface Sujeto {
  id: string;
  texto: string;
  traduccion: string;
  forma: ToBe;
}

export const SUJETOS: Sujeto[] = [
  { id: "s-i", texto: "I", traduccion: "yo", forma: "am" },
  { id: "s-you", texto: "You", traduccion: "tú / ustedes", forma: "are" },
  { id: "s-he", texto: "He", traduccion: "él", forma: "is" },
  { id: "s-she", texto: "She", traduccion: "ella", forma: "is" },
  { id: "s-it", texto: "It", traduccion: "eso / ello", forma: "is" },
  { id: "s-we", texto: "We", traduccion: "nosotros", forma: "are" },
  { id: "s-they", texto: "They", traduccion: "ellos / ellas", forma: "are" },
];

/* ── Modo «Greeting, introduction or farewell?» ────────────────────────── */
// Verbatim A1/A6: saludos (Hello/Hi, Good morning/afternoon/evening),
// presentación (Nice to meet you, This is..., My name is...),
// despedida (Goodbye, Bye, See you later, See you tomorrow).
export type Funcion = "greeting" | "introduction" | "farewell";

export const FUNCION_INFO: Record<Funcion, { label: string; descripcion: string; icono: string; color: string }> = {
  greeting: { label: "Greeting", descripcion: "Saludo", icono: "fa-hand", color: "#34D399" },
  introduction: { label: "Introduction", descripcion: "Presentación", icono: "fa-handshake", color: "#5BA8FF" },
  farewell: { label: "Farewell", descripcion: "Despedida", icono: "fa-hand-peace", color: "#F2A33C" },
};

export interface Frase {
  id: string;
  texto: string;
  funcion: Funcion;
}

export const FRASES: Frase[] = [
  { id: "f-hello", texto: "Hello", funcion: "greeting" },
  { id: "f-goodmorning", texto: "Good morning", funcion: "greeting" },
  { id: "f-goodafternoon", texto: "Good afternoon", funcion: "greeting" },
  { id: "f-goodevening", texto: "Good evening", funcion: "greeting" },
  { id: "f-nice", texto: "Nice to meet you", funcion: "introduction" },
  { id: "f-thisis", texto: "This is…", funcion: "introduction" },
  { id: "f-myname", texto: "My name is…", funcion: "introduction" },
  { id: "f-goodbye", texto: "Goodbye", funcion: "farewell" },
  { id: "f-seelater", texto: "See you later", funcion: "farewell" },
  { id: "f-seetomorrow", texto: "See you tomorrow", funcion: "farewell" },
];

/* ── Cuestionario (verbatim del quiz A4) ───────────────────────────────── */
export interface QuizItem {
  pregunta: string;
  opciones: string[];
  correcta: number;
  retro: string;
}

export const QUIZ: QuizItem[] = [
  {
    pregunta: "¿Cuál es la forma correcta de presentarte?",
    opciones: ["I are Ana.", "I am Ana.", "I is Ana.", "Me Ana."],
    correcta: 1,
    retro: "Con 'I' siempre se usa 'am': I am Ana / I'm Ana.",
  },
  {
    pregunta: "Conoces a alguien por primera vez. ¿Qué dices?",
    opciones: ["Goodbye!", "See you later!", "Nice to meet you!", "How old are you?"],
    correcta: 2,
    retro: "'Nice to meet you' = mucho gusto, al conocer a alguien.",
  },
  {
    pregunta: "¿Cuál saludo es FORMAL?",
    opciones: ["Hi!", "Hey!", "Good morning.", "What's up?"],
    correcta: 2,
    retro: "'Good morning/afternoon/evening' son formales; 'Hi/Hey' son informales.",
  },
  {
    pregunta: "Para presentar a tu amiga Sofía dices:",
    opciones: ["This is Sofía.", "She are Sofía.", "This Sofía.", "Her Sofía."],
    correcta: 0,
    retro: "Para presentar a alguien: 'This is + nombre'.",
  },
  {
    pregunta: "¿Cómo se contrae 'I am'?",
    opciones: ["Im", "I'm", "Iam", "I's"],
    correcta: 1,
    retro: "La contracción correcta es I'm (con apóstrofo).",
  },
];

/** Dato verbatim de A1 (regla de mayúsculas en inglés). */
export const DATO_INGLES =
  "En inglés, los nombres propios y el pronombre «I» (yo) SIEMPRE se escriben con mayúscula, estén donde estén en la oración. La primera palabra de cada oración también lleva mayúscula, igual que en español.";

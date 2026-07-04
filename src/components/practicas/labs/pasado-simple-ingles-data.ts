/**
 * Datos VERBATIM de IN-III·P01 «What Did You Do Yesterday?» (Inglés III, Past
 * Simple). Fuente: A1 (lectura), A2 (fill_blanks), A3 (quiz), A4 (quiz V/F).
 *
 * Módulo de datos puro (sin three.js, sin React) que alimenta a
 * LabPasadoSimpleIngles. La callout «importante» de A1 (ENDUTIH/INEGI/brecha
 * digital/Informática) es ajena al tema (Past Simple) y NO se incluye, por
 * fidelidad.
 */

/* ── Modo 1: «Regular or irregular?» (clasifica los verbos) ────────────────── */
export type TipoVerbo = "regular" | "irregular";

export interface TipoInfo {
  titulo: string;
  subtitulo: string;
  ejemplo: string;
  icono: string;
}

export const TIPO_INFO: Record<TipoVerbo, TipoInfo> = {
  regular: { titulo: "Regular (-ed)", subtitulo: "Just add -ed", ejemplo: "walk → walked", icono: "fa-plus" },
  irregular: { titulo: "Irregular", subtitulo: "Special past form — memorize", ejemplo: "go → went", icono: "fa-star-of-life" },
};

export interface Verbo {
  id: string;
  base: string;
  pasado: string;
  tipo: TipoVerbo;
  es: string;
}

/** Verbos verbatim de A1 y A2 (regulares e irregulares). */
export const VERBOS: Verbo[] = [
  { id: "vb-walk", base: "walk", pasado: "walked", tipo: "regular", es: "caminar" },
  { id: "vb-clean", base: "clean", pasado: "cleaned", tipo: "regular", es: "limpiar" },
  { id: "vb-play", base: "play", pasado: "played", tipo: "regular", es: "jugar" },
  { id: "vb-study", base: "study", pasado: "studied", tipo: "regular", es: "estudiar (y → i)" },
  { id: "vb-talk", base: "talk", pasado: "talked", tipo: "regular", es: "hablar" },
  { id: "vb-rest", base: "rest", pasado: "rested", tipo: "regular", es: "descansar" },
  { id: "vb-go", base: "go", pasado: "went", tipo: "irregular", es: "ir" },
  { id: "vb-eat", base: "eat", pasado: "ate", tipo: "irregular", es: "comer" },
  { id: "vb-see", base: "see", pasado: "saw", tipo: "irregular", es: "ver" },
  { id: "vb-have", base: "have", pasado: "had", tipo: "irregular", es: "tener" },
  { id: "vb-make", base: "make", pasado: "made", tipo: "irregular", es: "hacer" },
  { id: "vb-buy", base: "buy", pasado: "bought", tipo: "irregular", es: "comprar" },
];

/* ── Modo 2: «Build the past form» (arrastra la forma correcta) ────────────── */
export interface FormaVerbo {
  id: string;
  base: string;
  pasado: string;
  tipo: TipoVerbo;
  nota: string;
}

/** Subconjunto para construir la forma de pasado a partir del verbo base. */
export const FORMAS: FormaVerbo[] = [
  { id: "fm-go", base: "go", pasado: "went", tipo: "irregular", nota: "Irregular: cambia por completo." },
  { id: "fm-eat", base: "eat", pasado: "ate", tipo: "irregular", nota: "Irregular: nunca 'eated'." },
  { id: "fm-study", base: "study", pasado: "studied", tipo: "regular", nota: "Regular: la y cambia a i + -ed." },
  { id: "fm-buy", base: "buy", pasado: "bought", tipo: "irregular", nota: "Irregular: nunca 'buyed'." },
  { id: "fm-make", base: "make", pasado: "made", tipo: "irregular", nota: "Irregular: nunca 'maked'." },
  { id: "fm-play", base: "play", pasado: "played", tipo: "regular", nota: "Regular: solo agrega -ed." },
];

/** Formas incorrectas típicas (sobre-regularización) que no encajan. */
export const DISTRACTORES_FORMA: string[] = ["eated", "buyed", "goed", "maked"];

/* ── Modo 3: «Complete the sentence» (arrastra al hueco) ───────────────────── */
export interface Oracion {
  id: string;
  antes: string;
  despues: string;
  resp: string;
  nota: string;
}

/** Oraciones verbatim de A1 (ejemplos con expresiones de tiempo). */
export const ORACIONES: Oracion[] = [
  { id: "or-market", antes: "Yesterday I", despues: "to the market.", resp: "went", nota: "go → ? (irregular)" },
  { id: "or-studied", antes: "Last week she", despues: "a lot.", resp: "studied", nota: "study → ? (y → i)" },
  { id: "or-ate", antes: "He", despues: "pizza last night.", resp: "ate", nota: "eat → ? (irregular)" },
  { id: "or-saw", antes: "We", despues: "a great movie two days ago.", resp: "saw", nota: "see → ? (irregular)" },
  { id: "or-came", antes: "They", despues: "back in 2020.", resp: "came", nota: "come → ? (irregular)" },
];

/* ── Cuestionario (5 ítems V/F verbatim de A4) ─────────────────────────────── */
export interface QuizItem {
  pregunta: string;
  opciones: string[];
  correcta: number;
  retro: string;
}

export const QUIZ: QuizItem[] = [
  {
    pregunta: "Los verbos regulares en pasado simple agregan -ed ('I worked', 'She played').",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: work → worked, play → played.",
  },
  {
    pregunta: "'Go' tiene la forma irregular 'went' en pasado simple.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Sí: go → went. Los irregulares cambian completamente.",
  },
  {
    pregunta: "Para negar en pasado simple se usa 'didn't' + verbo base ('I didn't go').",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: didn't + verbo base para todos los sujetos.",
  },
  {
    pregunta: "La forma interrogativa del pasado es 'Did you went...?'.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "No: tras 'did' el verbo va en forma base: 'Did you go...?'",
  },
  {
    pregunta: "'Yesterday', 'last week' y 'ago' son marcadores de tiempo del pasado.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Sí: indican cuándo ocurrió la acción en el pasado.",
  },
];

/** Dato verbatim de A1: regla general regulares vs irregulares. */
export const DATO_PASADO =
  "Most verbs are regular — we just add -ed. But many common verbs are irregular — they have a special past form. To make negatives and questions we use did / didn't + the base verb.";

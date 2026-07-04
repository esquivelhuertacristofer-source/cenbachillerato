/**
 * Datos VERBATIM de IN-II·P05 «Making Comparisons in English» (Inglés II).
 * Fuente: A1 (lectura), A2 + A4 (quiz V/F), A5 (glosario), A6 (fill_blanks).
 *
 * Módulo de datos puro (sin three.js, sin React) que alimenta a
 * LabComparativosIngles. La callout de A1 sobre el Tec de Monterrey / Informática
 * es ajena al tema (comparativos) y NO se incluye, por fidelidad.
 */

/** Las tres maneras de formar el comparativo en inglés. */
export type TipoRegla = "er" | "more" | "irregular";

export interface ReglaInfo {
  titulo: string;
  subtitulo: string;
  ejemplo: string;
  icono: string;
}

export const REGLA_INFO: Record<TipoRegla, ReglaInfo> = {
  er: {
    titulo: "-er + than",
    subtitulo: "Adjetivos cortos (1 sílaba)",
    ejemplo: "tall → taller than",
    icono: "fa-plus",
  },
  more: {
    titulo: "more + adj + than",
    subtitulo: "Adjetivos largos (2+ sílabas)",
    ejemplo: "interesting → more interesting than",
    icono: "fa-angles-up",
  },
  irregular: {
    titulo: "Irregular",
    subtitulo: "Sin regla — memorízalos",
    ejemplo: "good → better than",
    icono: "fa-star-of-life",
  },
};

/* ── Modo 1: «Build the comparative» (arrastra la forma correcta) ──────────── */
export interface Comparativo {
  id: string;
  adjetivo: string;
  comparativo: string;
  tipo: TipoRegla;
  es: string;
  regla: string;
}

export const COMPARATIVOS: Comparativo[] = [
  { id: "cm-tall", adjetivo: "tall", comparativo: "taller", tipo: "er", es: "alto", regla: "Adjetivo de 1 sílaba: tall + -er → taller than." },
  { id: "cm-big", adjetivo: "big", comparativo: "bigger", tipo: "er", es: "grande", regla: "Termina en consonante-vocal-consonante: se duplica la consonante → bigger than." },
  { id: "cm-interesting", adjetivo: "interesting", comparativo: "more interesting", tipo: "more", es: "interesante", regla: "Adjetivo largo (2+ sílabas): more + adjetivo → more interesting than." },
  { id: "cm-expensive", adjetivo: "expensive", comparativo: "more expensive", tipo: "more", es: "caro", regla: "Adjetivo largo: more + adjetivo → more expensive than." },
  { id: "cm-good", adjetivo: "good", comparativo: "better", tipo: "irregular", es: "bueno", regla: "Irregular: good → better than (no «gooder»)." },
  { id: "cm-bad", adjetivo: "bad", comparativo: "worse", tipo: "irregular", es: "malo", regla: "Irregular: bad → worse than → the worst." },
];

/** Formas erróneas que no encajan en ninguna fila (errores típicos a evitar). */
export const DISTRACTORES_COMP: string[] = ["more tall", "gooder", "bigger more"];

/* ── Modo 2: «-er, more, or irregular?» (clasifica por regla) ──────────────── */
export interface Adjetivo {
  id: string;
  palabra: string;
  tipo: TipoRegla;
  es: string;
}

export const ADJETIVOS: Adjetivo[] = [
  { id: "aj-tall", palabra: "tall", tipo: "er", es: "alto" },
  { id: "aj-fast", palabra: "fast", tipo: "er", es: "rápido" },
  { id: "aj-big", palabra: "big", tipo: "er", es: "grande" },
  { id: "aj-cheap", palabra: "cheap", tipo: "er", es: "barato" },
  { id: "aj-interesting", palabra: "interesting", tipo: "more", es: "interesante" },
  { id: "aj-expensive", palabra: "expensive", tipo: "more", es: "caro" },
  { id: "aj-beautiful", palabra: "beautiful", tipo: "more", es: "bonito" },
  { id: "aj-intelligent", palabra: "intelligent", tipo: "more", es: "inteligente" },
  { id: "aj-good", palabra: "good", tipo: "irregular", es: "bueno" },
  { id: "aj-bad", palabra: "bad", tipo: "irregular", es: "malo" },
  { id: "aj-far", palabra: "far", tipo: "irregular", es: "lejos" },
];

/* ── Modo 3: «Complete the comparison» (arrastra al hueco) ─────────────────── */
export interface Oracion {
  id: string;
  antes: string;
  despues: string;
  resp: string;
  nota: string;
}

export const ORACIONES: Oracion[] = [
  { id: "or-train", antes: "A train is", despues: "than a bus.", resp: "faster", nota: "fast + -er" },
  { id: "or-city", antes: "My city is", despues: "than your town.", resp: "bigger", nota: "big → duplica la consonante" },
  { id: "or-movie", antes: "This movie is", despues: "than that one.", resp: "more interesting", nota: "adjetivo largo → more" },
  { id: "or-summer", antes: "For me, summer is", despues: "than winter.", resp: "better", nota: "good → irregular" },
  { id: "or-mountains", antes: "The mountains are", despues: "than the beach.", resp: "farther", nota: "far → irregular" },
  { id: "or-sister", antes: "My sister is", despues: "than me.", resp: "more intelligent", nota: "adjetivo largo → more" },
];

/* ── Cuestionario (5 ítems V/F verbatim de A4) ────────────────────────────── */
export interface QuizItem {
  pregunta: string;
  opciones: string[];
  correcta: number;
  retro: string;
}

export const QUIZ: QuizItem[] = [
  {
    pregunta: "Los adjetivos cortos forman el comparativo con -er + than ('bigger than').",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: big → bigger than.",
  },
  {
    pregunta: "Los adjetivos largos usan 'more ... than' ('more interesting than').",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Sí: con adjetivos de 2+ sílabas se usa 'more'.",
  },
  {
    pregunta: "'Bigger more than' es la forma correcta del comparativo.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "No: o usas -er (bigger than) o 'more' (more interesting), nunca ambos.",
  },
  {
    pregunta: "En el comparativo se usa la palabra 'than' para comparar dos cosas.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: A is taller THAN B.",
  },
  {
    pregunta: "'Good' tiene un comparativo irregular: 'better'.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Sí: good → better than (no 'gooder').",
  },
];

/** Dato verbatim de A1: comparativos irregulares (sin regla). */
export const DATO_COMPARATIVOS =
  "Comparativos irregulares (no rules — memorize these): good → better than, bad → worse than, far → farther / further than.";

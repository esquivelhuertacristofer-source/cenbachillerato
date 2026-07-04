/**
 * Datos del laboratorio "Possession — mine or yours?" (IN-I-P08-A4).
 *
 * Módulo de datos PURO (sin three, sin React): contenido alineado VERBATIM a la
 * lectura A1 «Mine or yours?», el quiz A4, el fill_blanks A2, el V/F A5 y el
 * glosario A6 de Inglés I · P08 (genitivo sajón y pronombres posesivos).
 */

/* ── Modo 1 «Saxon genitive» (arrastra el marcador correcto) ────────────── */
// El alumno arrastra el marcador de posesión correcto al hueco tras el poseedor:
//  's  para poseedores singulares   ·   '  para plurales que terminan en s.
export interface Genitivo {
  id: string;
  es: string; // frase en español (lo que se quiere expresar)
  dueno: string; // poseedor en inglés
  marker: "'s" | "'"; // marcador correcto a arrastrar
  noun: string; // sustantivo poseído
  plural: boolean;
  regla: string;
}

export const GENITIVOS: Genitivo[] = [
  { id: "g-ana", es: "el libro de Ana", dueno: "Ana", marker: "'s", noun: "book", plural: false, regla: "Poseedor singular → apóstrofo + s: «Ana's book»." },
  { id: "g-teacher", es: "el escritorio del maestro", dueno: "the teacher", marker: "'s", noun: "desk", plural: false, regla: "Poseedor singular → apóstrofo + s: «the teacher's desk»." },
  { id: "g-students", es: "los cuadernos de los estudiantes", dueno: "the students", marker: "'", noun: "notebooks", plural: true, regla: "Plural terminado en s → solo apóstrofo: «the students' notebooks»." },
  { id: "g-maria", es: "el libro de María", dueno: "María", marker: "'s", noun: "book", plural: false, regla: "Poseedor singular → apóstrofo + s: «María's book»." },
];

// Marcadores reutilizables del modo 1.
export interface Marcador {
  id: string;
  label: "'s" | "'";
  desc: string;
}
export const MARCADORES: Marcador[] = [
  { id: "m-s", label: "'s", desc: "poseedor singular" },
  { id: "m-apos", label: "'", desc: "plural terminado en s" },
];

/* ── Modo 2 «Complete the sentence» (arrastra la palabra al hueco) ───────── */
// Verbatim del fill_blanks A2: cada oración necesita el posesivo o genitivo
// correcto según el contexto (¿va antes de un sustantivo o va solo?).
export interface Oracion {
  id: string;
  antes: string;
  resp: string; // forma correcta a arrastrar
  despues: string;
  nota: string; // pista contextual breve
}

export const ORACIONES: Oracion[] = [
  { id: "o-my", antes: "This is", resp: "my", despues: "book — it belongs to me.", nota: "adjetivo (va antes de 'book')" },
  { id: "o-ana", antes: "That is Ana", resp: "'s", despues: "pencil.", nota: "genitivo sajón" },
  { id: "o-his", antes: "Carlos left", resp: "his", despues: "backpack in class.", nota: "adjetivo (de él)" },
  { id: "o-their", antes: "The students forgot", resp: "their", despues: "homework.", nota: "adjetivo (de ellos)" },
  { id: "o-our", antes: "", resp: "Our", despues: "teacher is very funny.", nota: "adjetivo (nuestro/a)" },
  { id: "o-whose", antes: "", resp: "Whose", despues: "notebook is this?", nota: "pregunta de posesión" },
  { id: "o-hers", antes: "That pen is not mine, it is", resp: "hers", despues: ".", nota: "pronombre (va solo, de ella)" },
  { id: "o-mine", antes: "This pen is not yours, it is", resp: "mine", despues: ".", nota: "pronombre (va solo, mío)" },
];

/* ── Modo 3 «Adjective or pronoun?» (clasifica en dos columnas) ──────────── */
// La distinción central: los adjetivos posesivos van ANTES de un sustantivo;
// los pronombres posesivos van SOLOS. (Nota: 'his' es idéntico en ambas formas;
// se omite para que la clasificación sea inequívoca.)
export type BinPos = "adj" | "pron";

export interface PosInfo {
  bin: BinPos;
  titulo: string;
  subtitulo: string;
  ejemplo: string;
  icono: string;
}
export const BIN_INFO: Record<BinPos, PosInfo> = {
  adj: {
    bin: "adj",
    titulo: "Adjetivo posesivo",
    subtitulo: "va ANTES de un sustantivo",
    ejemplo: "My book · Her pencil",
    icono: "fa-arrow-right-long",
  },
  pron: {
    bin: "pron",
    titulo: "Pronombre posesivo",
    subtitulo: "va SOLO, sin sustantivo",
    ejemplo: "It's mine · It's hers",
    icono: "fa-circle-dot",
  },
};

export interface Posesivo {
  id: string;
  palabra: string;
  bin: BinPos;
  es: string; // traducción
}
export const POSESIVOS: Posesivo[] = [
  { id: "p-my", palabra: "my", bin: "adj", es: "mi/mis" },
  { id: "p-your", palabra: "your", bin: "adj", es: "tu/tus" },
  { id: "p-her", palabra: "her", bin: "adj", es: "su (de ella)" },
  { id: "p-our", palabra: "our", bin: "adj", es: "nuestro/a" },
  { id: "p-their", palabra: "their", bin: "adj", es: "su (de ellos)" },
  { id: "p-mine", palabra: "mine", bin: "pron", es: "mío/mía" },
  { id: "p-yours", palabra: "yours", bin: "pron", es: "tuyo/a" },
  { id: "p-hers", palabra: "hers", bin: "pron", es: "suyo (de ella)" },
  { id: "p-ours", palabra: "ours", bin: "pron", es: "nuestro/a" },
  { id: "p-theirs", palabra: "theirs", bin: "pron", es: "suyo (de ellos)" },
];

/* ── Cuestionario (verbatim del quiz A4) ────────────────────────────────── */
export interface QuizItem {
  pregunta: string;
  opciones: string[];
  correcta: number;
  retro: string;
}

export const QUIZ: QuizItem[] = [
  {
    pregunta: "¿Cómo dices 'el libro de Ana'?",
    opciones: ["the book of Ana", "Ana's book", "Ana book", "book Ana's"],
    correcta: 1,
    retro: "Genitivo sajón: 'Ana's book'.",
  },
  {
    pregunta: "¿Cómo preguntas de quién es algo?",
    opciones: ["Who is this?", "Whose is this?", "Where is this?", "What is this?"],
    correcta: 1,
    retro: "'Whose...?' = ¿de quién...?",
  },
  {
    pregunta: "'It is ___ (de ella).' Completa:",
    opciones: ["his", "hers", "their", "our"],
    correcta: 1,
    retro: "'hers' = de ella (pronombre posesivo solo).",
  },
  {
    pregunta: "Para un plural que termina en s (the students), el genitivo es:",
    opciones: ["students's", "students'", "student's", "students"],
    correcta: 1,
    retro: "Solo se agrega apóstrofo: 'the students' notebooks'.",
  },
  {
    pregunta: "'This pen is mine.' 'Mine' significa:",
    opciones: ["mi", "mío", "tuyo", "suyo"],
    correcta: 1,
    retro: "'Mine' = mío (pronombre posesivo).",
  },
];

/** Dato verbatim de A1 (los pronombres posesivos que van solos). */
export const DATO_POSESION =
  "Los pronombres posesivos que van solos (sin sustantivo después) son: mine (mío), yours (tuyo), his (suyo — de él), hers (suyo — de ella), ours (nuestro) y theirs (suyo — de ellos).";

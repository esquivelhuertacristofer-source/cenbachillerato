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

/* ═══════════════════════════════════════════════════════════════════════════
 * SIMULADOR (2026-10): la oficina de objetos perdidos de una escuela ficticia.
 * La etiqueta que escribe el alumno decide a quién le entrega el objeto el
 * empleado. El contenido curricular de arriba no cambia.
 * ═══════════════════════════════════════════════════════════════════════════ */

export const OFICINA = { nombre: "Objetos perdidos · Maple High (escuela ficticia)", empleado: "El empleado" };

/** Objeto ilustrado: /media/labs-sim/posesivos-ingles/<clave>.webp */
export interface ObjetoPerdido {
  clave: string;
  nombre: string;
  icono: string;
}

export const OBJETOS: Record<string, ObjetoPerdido> = {
  libro: { clave: "libro", nombre: "libro", icono: "fa-book" },
  lapiz: { clave: "lapiz", nombre: "lápiz", icono: "fa-pencil" },
  mochila: { clave: "mochila", nombre: "mochila", icono: "fa-bag-shopping" },
  tarea: { clave: "tarea", nombre: "tarea", icono: "fa-file-lines" },
  cuadernos: { clave: "cuadernos", nombre: "cuadernos", icono: "fa-book-open" },
  pluma: { clave: "pluma", nombre: "pluma", icono: "fa-pen" },
  escritorio: { clave: "escritorio", nombre: "escritorio", icono: "fa-chair" },
  maestro: { clave: "", nombre: "maestro", icono: "fa-chalkboard-user" },
};

export interface Persona {
  id: string;
  nombre: string;
  icono: string;
}

/** Una forma posible para el hueco: a quién señala (o `null` si la etiqueta no se entiende). */
export interface OpcionPos {
  w: string;
  apunta: string | null;
  /** Solo cuando `apunta` es null: por qué la etiqueta no se entiende. */
  motivo?: string;
}

export interface CasoOracion {
  /** id de la `Oracion` a la que pertenece. */
  id: string;
  objeto: string;
  personas: Persona[];
  dueno: string;
  opciones: OpcionPos[];
}

const TU: Persona = { id: "tu", nombre: "Tú", icono: "fa-user" };
const LEO: Persona = { id: "leo", nombre: "Leo", icono: "fa-user" };
const ANA: Persona = { id: "ana", nombre: "Ana", icono: "fa-user" };
const CARLOS: Persona = { id: "carlos", nombre: "Carlos", icono: "fa-user" };
const MARTA: Persona = { id: "marta", nombre: "Marta", icono: "fa-user" };
const LUCIA: Persona = { id: "lucia", nombre: "Lucía", icono: "fa-user" };

export const CASOS_ORACION: CasoOracion[] = [
  { id: "o-my", objeto: "libro", personas: [TU, LEO], dueno: "tu", opciones: [
    { w: "my", apunta: "tu" },
    { w: "your", apunta: "leo" },
    { w: "mine", apunta: null, motivo: "«mine» va solo, no antes de «book»" },
  ] },
  { id: "o-ana", objeto: "lapiz", personas: [ANA, LEO], dueno: "ana", opciones: [
    { w: "'s", apunta: "ana" },
    { w: "s", apunta: null, motivo: "«Anas» se lee como otro nombre: falta el apóstrofo" },
    { w: "'", apunta: null, motivo: "«Ana'» no marca posesión: falta la s" },
  ] },
  { id: "o-his", objeto: "mochila", personas: [CARLOS, MARTA], dueno: "carlos", opciones: [
    { w: "his", apunta: "carlos" },
    { w: "her", apunta: "marta" },
    { w: "hers", apunta: null, motivo: "«hers» va solo, no antes de «backpack»" },
  ] },
  { id: "o-their", objeto: "tarea", personas: [{ id: "estud", nombre: "Los estudiantes", icono: "fa-users" }, CARLOS], dueno: "estud", opciones: [
    { w: "their", apunta: "estud" },
    { w: "his", apunta: "carlos" },
    { w: "theirs", apunta: null, motivo: "«theirs» va solo, no antes de «homework»" },
  ] },
  { id: "o-our", objeto: "maestro", personas: [{ id: "nos", nombre: "Tu grupo", icono: "fa-users" }, { id: "otro", nombre: "El otro grupo", icono: "fa-users" }], dueno: "nos", opciones: [
    { w: "Our", apunta: "nos" },
    { w: "Your", apunta: "otro" },
    { w: "Ours", apunta: null, motivo: "«Ours» va solo, no antes de «teacher»" },
  ] },
  { id: "o-whose", objeto: "cuadernos", personas: [LUCIA, LEO], dueno: "lucia", opciones: [
    { w: "Whose", apunta: "lucia" },
    { w: "Who's", apunta: null, motivo: "«Who's» es «who is»: la pregunta queda «¿Quién es cuaderno?»" },
    { w: "Who", apunta: null, motivo: "falta la forma posesiva: queda «¿Quién cuaderno?»" },
  ] },
  { id: "o-hers", objeto: "pluma", personas: [MARTA, CARLOS], dueno: "marta", opciones: [
    { w: "hers", apunta: "marta" },
    { w: "his", apunta: "carlos" },
    { w: "her", apunta: null, motivo: "«her» necesita un sustantivo después y aquí va solo" },
  ] },
  { id: "o-mine", objeto: "pluma", personas: [TU, LEO], dueno: "tu", opciones: [
    { w: "mine", apunta: "tu" },
    { w: "yours", apunta: "leo" },
    { w: "my", apunta: null, motivo: "«my» necesita un sustantivo después y aquí va solo" },
  ] },
];

/** Objeto de cada genitivo (para la ilustración). */
export const OBJETO_GENITIVO: Record<string, string> = {
  "g-ana": "libro",
  "g-teacher": "escritorio",
  "g-students": "cuadernos",
  "g-maria": "libro",
};

/** Porqué falla cada marcador equivocado, según el poseedor. */
export function motivoMarcador(g: Genitivo, elegido: "'s" | "'" | ""): string {
  if (elegido === "") return `«${g.dueno} ${g.noun}» no dice de quién es: parece una lista de dos palabras.`;
  if (g.plural && elegido === "'s") return `«${g.dueno}'s» suena mal: el plural ya termina en s, solo lleva apóstrofo.`;
  return `«${g.dueno}'» se queda corto: el poseedor es singular y pide apóstrofo + s.`;
}

/** Plantillas de la etiqueta del modo «Adjective or pronoun?». */
export const PLANTILLA_ADJ = (w: string) => `${w} backpack`;
export const PLANTILLA_PRON = (w: string) => `The backpack is ${w}.`;

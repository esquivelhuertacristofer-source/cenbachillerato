/**
 * Datos del Laboratorio — Subgéneros narrativos: del suspenso al Antropoceno
 * (LC-III-P04, Lenguaje y Comunicación III).
 *
 * Contenido VERBATIM de LC-III·P04 ("Subgéneros narrativos: del suspenso al
 * Antropoceno"). Las descripciones de cada subgénero, los ejemplos, las
 * definiciones del glosario y las afirmaciones del cuestionario se toman
 * literalmente de las actividades A1 (lectura), A2 (fill_blanks), A4 (V/F) y A5
 * (glosario interactivo). Las obras a clasificar son los ejemplos que la propia
 * actividad A5 asocia explícitamente a cada subgénero.
 *
 * Los seis subgéneros son los únicos que nombra la fuente: suspenso, terror,
 * ciencia ficción, autoficción, neorrealismo urbano y literaturas del
 * Antropoceno.
 */

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 1 — ¿A qué subgénero pertenece? (clasifica obras y rasgos por subgénero)
 * ───────────────────────────────────────────────────────────────────────── */
export type Subgenero =
  | "suspenso"
  | "terror"
  | "cienciaficcion"
  | "autoficcion"
  | "neorrealismo"
  | "antropoceno";

export const SUBGENERO_INFO: Record<
  Subgenero,
  { titulo: string; subtitulo: string; icono: string }
> = {
  suspenso: {
    titulo: "Suspenso",
    subtitulo: "Mantiene al lector en tensión mediante la incertidumbre: no saber qué ocurrirá o temer que ocurra algo terrible.",
    icono: "fa-hourglass-half",
  },
  terror: {
    titulo: "Terror",
    subtitulo: "Busca producir miedo, incomodidad o repulsión. Puede ser sobrenatural o psicológico.",
    icono: "fa-ghost",
  },
  cienciaficcion: {
    titulo: "Ciencia ficción",
    subtitulo: "Explora futuros posibles, tecnologías imaginadas y sociedades alternativas para reflexionar sobre el presente.",
    icono: "fa-rocket",
  },
  autoficcion: {
    titulo: "Autoficción",
    subtitulo: "Mezcla la autobiografía con la invención: el autor escribe sobre sí mismo pero alterando o inventando eventos.",
    icono: "fa-pen-fancy",
  },
  neorrealismo: {
    titulo: "Neorrealismo urbano",
    subtitulo: "Retrata la vida en las ciudades contemporáneas con sus tensiones sociales, violencia, marginalidad y diversidad.",
    icono: "fa-city",
  },
  antropoceno: {
    titulo: "Literaturas del Antropoceno",
    subtitulo: "Sitúan la crisis ecológica y el cambio climático en el centro de la narración.",
    icono: "fa-leaf",
  },
};

/**
 * Obras a clasificar. Los ejemplos son los que A5 asocia a cada subgénero
 * (verbatim) y las descripciones de rasgo son verbatim de la lectura A1.
 */
export const OBRAS: { id: string; texto: string; subgenero: Subgenero }[] = [
  // Ejemplos verbatim del glosario A5
  { id: "ob-su1", texto: "Relatos de Patricia Highsmith", subgenero: "suspenso" },
  { id: "ob-te1", texto: "Cuentos de Edgar Allan Poe", subgenero: "terror" },
  { id: "ob-cf1", texto: "«Fahrenheit 451» de Ray Bradbury", subgenero: "cienciaficcion" },
  { id: "ob-au1", texto: "«Escenas de la vida rural» de Emmanuel Carrère", subgenero: "autoficcion" },
  { id: "ob-ne1", texto: "Narrativa de Roberto Arlt o Juan Villoro", subgenero: "neorrealismo" },
  { id: "ob-an1", texto: "Textos de Richard Powers o autores latinoamericanos de ecoficción", subgenero: "antropoceno" },
  // Rasgos / recursos verbatim de la lectura A1
  { id: "ob-su2", texto: "Usa el cliffhanger, la información incompleta y el tiempo en cuenta regresiva", subgenero: "suspenso" },
  { id: "ob-te2", texto: "El miedo nace de una mente perturbada o de la propia realidad", subgenero: "terror" },
  { id: "ob-cf2", texto: "Proyecta el presente hacia adelante o hacia mundos paralelos", subgenero: "cienciaficcion" },
  { id: "ob-au2", texto: "La frontera entre lo vivido y lo imaginado es deliberadamente borrosa", subgenero: "autoficcion" },
  { id: "ob-ne2", texto: "Es crudo y directo, sin romantizar la realidad", subgenero: "neorrealismo" },
  { id: "ob-an2", texto: "Pregunta: ¿cómo vivir y narrar en un planeta en colapso?", subgenero: "antropoceno" },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 2 — El rasgo de cada subgénero (empareja subgénero con su rasgo)
 * Rasgos verbatim de la lectura A1.
 * ───────────────────────────────────────────────────────────────────────── */
export const RASGOS: { id: string; subgenero: string; rasgo: string; ejemplo: string }[] = [
  {
    id: "suspenso",
    subgenero: "Suspenso",
    rasgo: "Mantiene al lector en tensión mediante la incertidumbre: no saber qué ocurrirá o temer que ocurra algo terrible.",
    ejemplo: "Sus recursos incluyen el cliffhanger, la información incompleta y el tiempo en cuenta regresiva.",
  },
  {
    id: "terror",
    subgenero: "Terror",
    rasgo: "Busca producir miedo, incomodidad o repulsión, ya sea de forma sobrenatural o psicológica.",
    ejemplo: "Los mejores textos de terror nos dicen algo sobre miedos reales.",
  },
  {
    id: "cienciaficcion",
    subgenero: "Ciencia ficción",
    rasgo: "Explora futuros posibles, tecnologías imaginadas y sociedades alternativas.",
    ejemplo: "No es solo especulación tecnológica: es una forma de reflexionar sobre el presente.",
  },
  {
    id: "autoficcion",
    subgenero: "Autoficción",
    rasgo: "Mezcla la autobiografía con la invención: el autor escribe sobre sí mismo pero alterando, exagerando o inventando eventos.",
    ejemplo: "La frontera entre lo vivido y lo imaginado es deliberadamente borrosa.",
  },
  {
    id: "neorrealismo",
    subgenero: "Neorrealismo urbano",
    rasgo: "Retrata la vida en las ciudades contemporáneas con sus tensiones sociales, violencia, marginalidad y diversidad cultural.",
    ejemplo: "Es crudo y directo, sin romantizar la realidad.",
  },
  {
    id: "antropoceno",
    subgenero: "Literaturas del Antropoceno",
    rasgo: "Sitúa la crisis ecológica y el cambio climático en el centro de la narración.",
    ejemplo: "Nos preguntan: ¿cómo vivir y narrar en un planeta en colapso?",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 3 — Empareja término y definición (glosario A5, verbatim)
 * ───────────────────────────────────────────────────────────────────────── */
export const PARES: { id: string; termino: string; definicion: string; ejemplo: string }[] = [
  {
    id: "gl-suspenso",
    termino: "Suspenso",
    definicion: "Subgénero que genera tensión e incertidumbre mediante la dilación de la resolución y la amenaza constante.",
    ejemplo: "Relatos de Patricia Highsmith.",
  },
  {
    id: "gl-terror",
    termino: "Terror",
    definicion: "Subgénero que busca provocar miedo mediante lo sobrenatural, lo abyecto o lo psicológico.",
    ejemplo: "Cuentos de Edgar Allan Poe.",
  },
  {
    id: "gl-cienciaficcion",
    termino: "Ciencia ficción",
    definicion: "Subgénero que especula sobre futuros posibles a partir de avances científicos o tecnológicos y sus consecuencias sociales.",
    ejemplo: "Fahrenheit 451 de Ray Bradbury.",
  },
  {
    id: "gl-autoficcion",
    termino: "Autoficción",
    definicion: "Subgénero que combina elementos autobiográficos reales con recursos ficcionales, borrando los límites entre verdad y ficción.",
    ejemplo: "Escenas de la vida rural de Emmanuel Carrère.",
  },
  {
    id: "gl-neorrealismo",
    termino: "Neorrealismo urbano",
    definicion: "Subgénero contemporáneo que retrata la vida cotidiana en las ciudades, sus conflictos sociales y personajes marginales.",
    ejemplo: "Narrativa de Roberto Arlt o Juan Villoro.",
  },
  {
    id: "gl-antropoceno",
    termino: "Literaturas del Antropoceno",
    definicion: "Narrativas que reflexionan sobre el impacto humano en el planeta, la crisis ecológica y las relaciones entre naturaleza y cultura.",
    ejemplo: "Textos de Richard Powers o autores latinoamericanos de ecoficción.",
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
    pregunta: "El suspenso como subgénero narrativo se construye mediante la tensión, la incertidumbre y la dilación de la resolución.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: el suspenso mantiene al lector en un estado de expectativa constante gracias a estas estrategias.",
  },
  {
    pregunta: "La autoficción es un subgénero en el que el autor presenta eventos completamente imaginarios sin ninguna relación con su vida real.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "No: la autoficción combina elementos autobiográficos reales con ficcionales, creando una zona ambigua entre verdad y ficción.",
  },
  {
    pregunta: "La ciencia ficción explora mundos futuros, tecnologías avanzadas y sus implicaciones sociales o éticas.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: la ciencia ficción especula sobre el futuro de la humanidad a partir de avances científicos o tecnológicos.",
  },
  {
    pregunta: "Las literaturas del Antropoceno abordan temas relacionados con el impacto humano en el medio ambiente y la crisis ecológica.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Sí: el Antropoceno designa la era geológica marcada por la influencia humana en la Tierra, y esta literatura reflexiona sobre ello.",
  },
  {
    pregunta: "El neorrealismo urbano retrata la vida rural y campesina alejada de las grandes ciudades.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "No: el neorrealismo urbano se enfoca precisamente en la vida en las ciudades contemporáneas, sus conflictos y sus personajes marginales.",
  },
];

/** Dato verbatim de la lectura A1 (introducción a los subgéneros narrativos). */
export const DATO_SUBGENEROS =
  "Dentro de la narrativa, los subgéneros son especializaciones que desarrollan convenciones propias de trama, personajes, atmósfera y lectores esperados. Conocerlos amplía nuestra comprensión de lo que la literatura puede hacer.";

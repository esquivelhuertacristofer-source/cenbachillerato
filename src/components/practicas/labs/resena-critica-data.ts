/**
 * Datos del Laboratorio — La reseña crítica: leer para evaluar y comunicar
 * (LC-III-P06, Lenguaje y Comunicación III).
 *
 * Contenido VERBATIM de LC-III·P06. La estructura a ordenar, las frases a
 * clasificar (resumen/descripción vs juicio crítico), el glosario y las
 * afirmaciones del cuestionario se toman literalmente de las actividades
 * A1 (lectura), A2 (fill_blanks), A4 (V/F) y A5 (glosario interactivo).
 */

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 1 — Ordena la estructura de una reseña (introducción → desarrollo →
 * conclusión, con sus componentes verbatim de A1).
 * ───────────────────────────────────────────────────────────────────────── */
export const ESTRUCTURA: { id: string; orden: number; etapa: string; texto: string }[] = [
  {
    id: "es-1",
    orden: 0,
    etapa: "Introducción",
    texto: "Presentación de la obra y su contexto: se identifica la obra reseñada y su autor.",
  },
  {
    id: "es-2",
    orden: 1,
    etapa: "Desarrollo",
    texto: "Síntesis del contenido de la obra, sin spoilers innecesarios.",
  },
  {
    id: "es-3",
    orden: 2,
    etapa: "Desarrollo",
    texto: "Análisis de los elementos formales destacados: estilo, estructura y recursos.",
  },
  {
    id: "es-4",
    orden: 3,
    etapa: "Conclusión",
    texto: "Valoración final y recomendación al lector potencial de la obra.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 2 — ¿Resumen o juicio crítico? (clasifica cada frase).
 * Una reseña combina descripción/síntesis (informa el contenido) con un juicio
 * crítico fundamentado (evalúa y argumenta). A1 y A4: el resumen solo describe;
 * la reseña añade valoración, interpretación y argumentación.
 * ───────────────────────────────────────────────────────────────────────── */
export type Clase = "resumen" | "juicio";

export const CLASE_INFO: Record<
  Clase,
  { titulo: string; subtitulo: string; icono: string }
> = {
  resumen: {
    titulo: "Resumen / síntesis",
    subtitulo: "Describe e informa el contenido de la obra, sin evaluarlo. Responde qué ocurre o de qué trata.",
    icono: "fa-align-left",
  },
  juicio: {
    titulo: "Juicio crítico",
    subtitulo: "Evalúa, interpreta y argumenta. Expresa la valoración del reseñista fundamentada en argumentos.",
    icono: "fa-scale-balanced",
  },
};

export const FRASES: { id: string; texto: string; clase: Clase }[] = [
  { id: "fr-r1", texto: "La novela narra la llegada de un hombre al pueblo de Comala en busca de su padre.", clase: "resumen" },
  { id: "fr-r2", texto: "El relato transcurre durante la Revolución y abarca tres generaciones de una familia.", clase: "resumen" },
  { id: "fr-r3", texto: "La obra se publicó en 1955 y consta de fragmentos breves narrados por varias voces.", clase: "resumen" },
  { id: "fr-r4", texto: "El argumento sigue a la protagonista desde su infancia hasta su exilio.", clase: "resumen" },
  { id: "fr-j1", texto: "La estructura fragmentaria logra reflejar con maestría el tiempo circular de los muertos.", clase: "juicio" },
  { id: "fr-j2", texto: "Considero que el uso de voces fragmentadas es el mayor acierto estilístico del autor.", clase: "juicio" },
  { id: "fr-j3", texto: "Es una obra imprescindible cuya innovación narrativa la convierte en un hito del género.", clase: "juicio" },
  { id: "fr-j4", texto: "El ritmo del desarrollo decae a la mitad y debilita la tensión que el inicio había construido.", clase: "juicio" },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 3 — Empareja término y definición (glosario A5, verbatim).
 * ───────────────────────────────────────────────────────────────────────── */
export const PARES: { id: string; termino: string; definicion: string; ejemplo: string }[] = [
  {
    id: "gl-resena",
    termino: "Reseña crítica",
    definicion: "Texto que presenta una obra, la describe brevemente, la interpreta y emite una valoración argumentada.",
    ejemplo: "Una reseña de «Pedro Páramo» que analiza su estructura fragmentaria y su relación con el Realismo mágico.",
  },
  {
    id: "gl-idea-principal",
    termino: "Idea principal",
    definicion: "Tesis o valoración central que el reseñista defiende sobre la obra.",
    ejemplo: "Idea principal: la novela subvierte la narrativa lineal para reflejar el tiempo circular de los muertos.",
  },
  {
    id: "gl-idea-secundaria",
    termino: "Idea secundaria",
    definicion: "Argumento o ejemplo que apoya y desarrolla la idea principal de la reseña.",
    ejemplo: "Idea secundaria: el uso de voces fragmentadas refuerza la sensación de desorientación y pérdida.",
  },
  {
    id: "gl-interpretacion",
    termino: "Interpretación",
    definicion: "Lectura argumentada y personal de los temas, recursos y sentidos de la obra.",
    ejemplo: "Interpreto que el silencio de los personajes es una crítica a la represión social.",
  },
  {
    id: "gl-valoracion",
    termino: "Valoración",
    definicion: "Juicio global sobre la calidad, relevancia o impacto de la obra, justificado con argumentos.",
    ejemplo: "Valoro la obra como un hito del Realismo mágico por su innovación narrativa.",
  },
  {
    id: "gl-contextualizacion",
    termino: "Contextualización",
    definicion: "Situar la obra en su contexto histórico, cultural y literario (movimiento, época, autor).",
    ejemplo: "La novela se inscribe en el Realismo mágico latinoamericano de mediados del siglo XX.",
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
    pregunta: "La reseña crítica combina la presentación descriptiva de una obra con una valoración argumentada por parte del autor de la reseña.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: la reseña no solo describe, también evalúa y argumenta el juicio del reseñista.",
  },
  {
    pregunta: "En una reseña crítica, la idea principal es la que el reseñista quiere transmitir sobre la obra, apoyada por ideas secundarias.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Sí: la idea principal expresa la tesis o valoración central y las ideas secundarias la argumentan.",
  },
  {
    pregunta: "La reseña crítica de una obra literaria puede prescindir completamente del análisis del movimiento literario al que pertenece.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "No: contextualizar la obra en su movimiento literario enriquece la interpretación y da profundidad a la reseña.",
  },
  {
    pregunta: "La interpretación en una reseña es la lectura subjetiva y argumentada que el reseñista hace de los temas y recursos de la obra.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: la interpretación va más allá del resumen e implica una lectura crítica y personal.",
  },
  {
    pregunta: "Una reseña crítica es equivalente a un resumen argumental porque ambos solo describen lo que ocurre en la obra.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "No: el resumen solo describe; la reseña crítica añade valoración, interpretación y argumentación.",
  },
];

/** Dato verbatim de la lectura A1 (propósito final de una buena reseña). */
export const DATO_RESENA =
  "Una buena reseña no convence al lector de que su opinión es la correcta: le da elementos para que forme su propia opinión de manera informada.";

/**
 * Datos del Laboratorio — Figuras retóricas: analiza fragmentos de poesía
 * (LC-III-P05, Lengua y Comunicación III, "El género lírico").
 *
 * Contenido VERBATIM de LC-III·P05 ("El género lírico: figuras retóricas y
 * musicalidad del verso"). Las definiciones, los ejemplos en verso y las
 * afirmaciones del cuestionario se toman literalmente de las actividades:
 *  - A1 (lectura/video): definiciones y versos de metáfora, símil,
 *    personificación, hipérbole, anáfora.
 *  - A2 (quiz de reconocimiento): versos-ejemplo verbatim que la propia
 *    actividad clasifica explícitamente por figura.
 *  - A4 (V/F): cinco afirmaciones verdadero/falso verbatim.
 *  - A5 (glosario): seis términos con definición, ejemplo y etiqueta (tipo).
 *
 * Distribución por modos del laboratorio:
 *  - Modo 1 (definiciones): empareja cada figura con su definición (glosario A5).
 *  - Modo 2 (versos): empareja cada figura con un ejemplo en verso (A5 + A2).
 *  - Modo 3 (clasifica por tipo): figura retórica vs. forma poética (A5 etiquetas).
 *  - Cuestionario: las cinco afirmaciones V/F verbatim de A4.
 */

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 1 — Empareja figura y definición (glosario A5, verbatim)
 * ───────────────────────────────────────────────────────────────────────── */
export const PARES_DEF: { id: string; figura: string; definicion: string }[] = [
  {
    id: "fg-metafora",
    figura: "Metáfora",
    definicion: "Identificación implícita de dos elementos por su semejanza, sin usar 'como'.",
  },
  {
    id: "fg-hiperbaton",
    figura: "Hipérbaton",
    definicion: "Alteración del orden sintáctico habitual para lograr énfasis o musicalidad.",
  },
  {
    id: "fg-hiperbole",
    figura: "Hipérbole",
    definicion: "Exageración extrema de una cualidad o situación para crear un efecto expresivo intenso.",
  },
  {
    id: "fg-ironia",
    figura: "Ironía",
    definicion: "Expresión que dice lo contrario de lo que se piensa, con intención crítica o humorística.",
  },
  {
    id: "fg-prosopopeya",
    figura: "Prosopopeya",
    definicion: "Atribución de cualidades o acciones humanas a seres inanimados, animales o abstracciones.",
  },
  {
    id: "fg-rimametrica",
    figura: "Rima y métrica",
    definicion: "La rima es la repetición de sonidos al final del verso; la métrica es la medida silábica de cada verso.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 2 — Empareja figura y ejemplo en verso (A5 ejemplos + A2 versos, verbatim)
 * Los versos provienen de la lectura A1, el glosario A5 y el quiz A2, que los
 * clasifican explícitamente por figura.
 * ───────────────────────────────────────────────────────────────────────── */
export const PARES_VERSO: { id: string; figura: string; verso: string; nota: string }[] = [
  {
    id: "fg-metafora",
    figura: "Metáfora",
    verso: "«Tus ojos son dos luceros que iluminan la noche»",
    nota: "Establece una identidad entre dos realidades distintas: los ojos = luceros por su brillo.",
  },
  {
    id: "fg-hiperbaton",
    figura: "Hipérbaton",
    verso: "«Del salón en el ángulo oscuro»",
    nota: "Altera el orden normal: 'en el ángulo oscuro del salón'.",
  },
  {
    id: "fg-hiperbole",
    figura: "Hipérbole",
    verso: "«Te lo he dicho mil veces»",
    nota: "Exagera el número de veces para intensificar la expresión.",
  },
  {
    id: "fg-ironia",
    figura: "Ironía",
    verso: "«¡Qué puntual eres!» (dicho a alguien que llega tarde)",
    nota: "Dice lo contrario de lo que se piensa; el receptor reconoce la distancia entre lo dicho y lo querido decir.",
  },
  {
    id: "fg-prosopopeya",
    figura: "Prosopopeya",
    verso: "«El mar llora su soledad de espuma»",
    nota: "Atribuye al mar una acción humana (llorar): se personifica algo no humano.",
  },
  {
    id: "fg-rimametrica",
    figura: "Rima y métrica",
    verso: "Un soneto tiene 14 versos endecasílabos (11 sílabas cada uno)",
    nota: "Combina medida silábica (métrica) y repetición de sonidos al final del verso (rima).",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 3 — Clasifica por tipo (etiquetas verbatim del glosario A5)
 * ───────────────────────────────────────────────────────────────────────── */
export type TipoRecurso = "figura" | "forma";

export const TIPO_INFO: Record<
  TipoRecurso,
  { titulo: string; subtitulo: string; icono: string }
> = {
  figura: {
    titulo: "Figura retórica",
    subtitulo: "Recurso del lenguaje que amplía o transforma el significado ordinario de las palabras para producir efectos estéticos, emocionales o cognitivos.",
    icono: "fa-wand-magic-sparkles",
  },
  forma: {
    titulo: "Forma poética",
    subtitulo: "Elemento formal del poema relativo a su construcción sonora y rítmica: la medida del verso y la repetición de sonidos.",
    icono: "fa-music",
  },
};

export const RECURSOS: { id: string; texto: string; tipo: TipoRecurso }[] = [
  { id: "rc-metafora", texto: "Metáfora", tipo: "figura" },
  { id: "rc-hiperbaton", texto: "Hipérbaton", tipo: "figura" },
  { id: "rc-hiperbole", texto: "Hipérbole", tipo: "figura" },
  { id: "rc-ironia", texto: "Ironía", tipo: "figura" },
  { id: "rc-prosopopeya", texto: "Prosopopeya", tipo: "figura" },
  { id: "rc-rimametrica", texto: "Rima y métrica", tipo: "forma" },
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
    pregunta: "La metáfora es una figura retórica que identifica un elemento con otro basándose en una semejanza implícita.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: por ejemplo, 'tus ojos son estrellas' identifica los ojos con estrellas por su brillo, sin usar 'como'.",
  },
  {
    pregunta: "El hipérbaton consiste en exagerar una cualidad o situación de forma extrema para crear efecto expresivo.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "No: el hipérbaton es la alteración del orden sintáctico habitual. La exageración extrema es la hipérbole.",
  },
  {
    pregunta: "La prosopopeya (personificación) atribuye cualidades humanas a seres inanimados o abstractos.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: 'el viento susurra secretos' es un ejemplo de prosopopeya.",
  },
  {
    pregunta: "La rima consonante coincide tanto en vocales como en consonantes desde la última vocal acentuada.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Sí: por ejemplo, 'amor' y 'calor' riman en consonante porque comparten '-or'.",
  },
  {
    pregunta: "La métrica se refiere únicamente al tipo de rima que tiene un poema, no a la medida de sus versos.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "No: la métrica estudia la medida (número de sílabas) de los versos; la rima es un concepto relacionado pero distinto.",
  },
];

/** Dato verbatim de la lectura A1. */
export const DATO_FIGURAS =
  "Las figuras retóricas son recursos del lenguaje que amplían o transforman el significado ordinario de las palabras para producir efectos estéticos, emocionales o cognitivos.";

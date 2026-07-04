/**
 * Datos del Laboratorio — Tipos de preguntas: científicas, cotidianas y
 * filosóficas (PFH-I-P02, Pensamiento Filosófico y Humanidades I).
 *
 * Contenido VERBATIM de PFH-I-P02 («Tipos de preguntas: científicas,
 * cotidianas y filosóficas»). Las definiciones, los ejemplos de cada tipo, las
 * ramas filosóficas y las afirmaciones del cuestionario se toman literalmente
 * de las actividades A1 (lectura) y A2 (quiz). El modo 3 («de cotidiana a
 * filosófica») parte del par verbatim de la lectura («¿Qué hora es?» →
 * «¿Qué es el tiempo?») y extiende esa misma idea con pares coherentes.
 */

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 1 — 3 tipos (clasifica cada pregunta según su tipo)
 * ───────────────────────────────────────────────────────────────────────── */
export type TipoPregunta = "cotidiana" | "cientifica" | "filosofica";

export const TIPO_INFO: Record<
  TipoPregunta,
  { titulo: string; subtitulo: string; icono: string }
> = {
  cotidiana: {
    titulo: "Cotidiana",
    subtitulo: "Tiene respuestas inmediatas y prácticas. Se resuelve con un dato o una observación directa.",
    icono: "fa-mug-hot",
  },
  cientifica: {
    titulo: "Científica",
    subtitulo: "Busca explicaciones de fenómenos a través de la observación, la experimentación y la evidencia empírica. Sus respuestas son verificables.",
    icono: "fa-flask",
  },
  filosofica: {
    titulo: "Filosófica",
    subtitulo: "No puede responderse solo con datos o experimentos: requiere reflexión conceptual y análisis de supuestos.",
    icono: "fa-brain",
  },
};

export const PREGUNTAS: { id: string; texto: string; tipo: TipoPregunta }[] = [
  // cotidianas (ejemplos verbatim de la lectura A1 y del quiz A2)
  { id: "pr-co1", texto: "¿Qué hora es?", tipo: "cotidiana" },
  { id: "pr-co2", texto: "¿Cuánto cuesta este producto?", tipo: "cotidiana" },
  { id: "pr-co3", texto: "¿Dónde está el baño?", tipo: "cotidiana" },
  { id: "pr-co4", texto: "¿Cuántos habitantes tiene México?", tipo: "cotidiana" },
  // científicas (verbatim de A1 y A2)
  { id: "pr-ci1", texto: "¿Por qué se propagan los virus?", tipo: "cientifica" },
  { id: "pr-ci2", texto: "¿Cómo se forman las estrellas?", tipo: "cientifica" },
  { id: "pr-ci3", texto: "¿Cómo se forman los terremotos?", tipo: "cientifica" },
  { id: "pr-ci4", texto: "¿A qué temperatura hierve el agua?", tipo: "cientifica" },
  // filosóficas (verbatim de A1 y A2)
  { id: "pr-fi1", texto: "¿Qué existe realmente?", tipo: "filosofica" },
  { id: "pr-fi2", texto: "¿Cómo sabemos lo que sabemos?", tipo: "filosofica" },
  { id: "pr-fi3", texto: "¿Qué debemos hacer ante la injusticia?", tipo: "filosofica" },
  { id: "pr-fi4", texto: "¿Qué hace legítimo a un gobierno?", tipo: "filosofica" },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 2 — Ramas filosóficas (clasifica cada pregunta filosófica en su rama)
 * ───────────────────────────────────────────────────────────────────────── */
export type RamaFilosofica = "ontologia" | "epistemologia" | "etica" | "estetica" | "politica";

export const RAMA_INFO: Record<
  RamaFilosofica,
  { titulo: string; subtitulo: string; icono: string }
> = {
  ontologia: {
    titulo: "Ontología",
    subtitulo: "Pregunta por el ser: qué existe realmente.",
    icono: "fa-globe",
  },
  epistemologia: {
    titulo: "Epistemología",
    subtitulo: "Pregunta por el conocimiento: cómo sabemos lo que sabemos.",
    icono: "fa-magnifying-glass",
  },
  etica: {
    titulo: "Ética",
    subtitulo: "Pregunta por el bien y lo correcto: qué debemos hacer.",
    icono: "fa-scale-balanced",
  },
  estetica: {
    titulo: "Estética",
    subtitulo: "Pregunta por la belleza y el arte: qué es lo bello.",
    icono: "fa-palette",
  },
  politica: {
    titulo: "Filosofía política",
    subtitulo: "Pregunta por el poder y la justicia: qué hace legítimo a un gobierno.",
    icono: "fa-landmark",
  },
};

export const PREGUNTAS_RAMA: { id: string; texto: string; rama: RamaFilosofica }[] = [
  // ontología (ejemplo verbatim A1/A2)
  { id: "rm-on1", texto: "¿Qué existe realmente?", rama: "ontologia" },
  { id: "rm-on2", texto: "¿Es real el mundo o solo una apariencia?", rama: "ontologia" },
  // epistemología (verbatim A1/A2)
  { id: "rm-ep1", texto: "¿Cómo sabemos lo que sabemos?", rama: "epistemologia" },
  { id: "rm-ep2", texto: "¿Podemos conocer realmente la realidad o solo nuestras percepciones de ella?", rama: "epistemologia" },
  // ética (verbatim A1/A2)
  { id: "rm-et1", texto: "¿Qué debemos hacer?", rama: "etica" },
  { id: "rm-et2", texto: "¿Qué debemos hacer ante la injusticia?", rama: "etica" },
  // estética (verbatim A1)
  { id: "rm-es1", texto: "¿Qué es lo bello?", rama: "estetica" },
  // filosofía política (verbatim A1/A2)
  { id: "rm-po1", texto: "¿Qué hace legítimo a un gobierno?", rama: "politica" },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 3 — De cotidiana a filosófica (empareja cada pregunta cotidiana con su
 * versión filosófica profundizada). El primer par es verbatim de la lectura A1
 * («¿Qué hora es?» → «¿Qué es el tiempo?»); los demás extienden esa idea.
 * ───────────────────────────────────────────────────────────────────────── */
export const PARES: { id: string; cotidiana: string; filosofica: string; pista: string }[] = [
  {
    id: "pa-tiempo",
    cotidiana: "¿Qué hora es?",
    filosofica: "¿Qué es el tiempo?",
    pista: "La pregunta práctica por la hora, llevada a fondo, se vuelve la pregunta por la naturaleza del tiempo.",
  },
  {
    id: "pa-valor",
    cotidiana: "¿Cuánto cuesta este producto?",
    filosofica: "¿Qué da valor a las cosas?",
    pista: "Preguntar por un precio concreto puede profundizarse hasta preguntar de dónde proviene el valor mismo.",
  },
  {
    id: "pa-espacio",
    cotidiana: "¿Dónde está el baño?",
    filosofica: "¿Qué es el espacio?",
    pista: "Buscar una ubicación concreta puede abrir la pregunta por la naturaleza del espacio.",
  },
  {
    id: "pa-justicia",
    cotidiana: "¿Quién ganó la competencia?",
    filosofica: "¿Qué es la justicia?",
    pista: "Saber quién resultó vencedor puede profundizarse hasta preguntar qué hace que un resultado sea justo.",
  },
  {
    id: "pa-conocer",
    cotidiana: "¿Es verdad esta noticia?",
    filosofica: "¿Cómo sabemos lo que sabemos?",
    pista: "Verificar un dato concreto puede llevarnos a la pregunta por cómo conocemos la verdad.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * Cuestionario de comprensión (verbatim de A1/A2).
 * Soporta V/F (opciones ["Verdadero","Falso"]) y opción múltiple (opciones[]).
 * ───────────────────────────────────────────────────────────────────────── */
export const QUIZ: {
  pregunta: string;
  opciones: string[];
  correcta: number;
  retro: string;
}[] = [
  {
    pregunta: "Las preguntas científicas buscan explicaciones de fenómenos a través de la observación, la experimentación y la evidencia empírica.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto. Las respuestas científicas pueden ser provisionales, pero son verificables mediante observación y experimentación.",
  },
  {
    pregunta: "¿De qué tipo es la pregunta «¿Cómo se forman los terremotos?»?",
    opciones: ["Cotidiana", "Científica", "Filosófica"],
    correcta: 1,
    retro: "Es una pregunta científica: se responde con observación y evidencia empírica sobre el fenómeno.",
  },
  {
    pregunta: "La pregunta «¿Podemos conocer realmente la realidad o solo nuestras percepciones de ella?» es una pregunta filosófica de tipo epistemológico.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto. La epistemología pregunta por el conocimiento: cómo y qué podemos conocer.",
  },
  {
    pregunta: "¿A qué rama de la filosofía corresponde la pregunta «¿Qué hace legítimo a un gobierno?»?",
    opciones: ["Ontología", "Ética", "Filosofía política", "Estética"],
    correcta: 2,
    retro: "Es filosofía política: pregunta por el poder y la justicia, en concreto por la legitimidad de un gobierno.",
  },
  {
    pregunta: "Muchas preguntas cotidianas se vuelven filosóficas cuando profundizamos en ellas; por ejemplo, «¿Qué hora es?» puede volverse «¿Qué es el tiempo?».",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto. La lectura lo señala como ejemplo: profundizar una pregunta cotidiana puede convertirla en filosófica.",
  },
];

/** Dato verbatim de cierre de la lectura A1. */
export const DATO_PREGUNTAS =
  "Muchas preguntas cotidianas se vuelven filosóficas cuando profundizamos en ellas. «¿Qué hora es?» puede volverse «¿Qué es el tiempo?».";

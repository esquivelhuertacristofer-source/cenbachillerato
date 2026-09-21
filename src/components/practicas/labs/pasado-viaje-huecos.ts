/**
 * «Completa el texto» — pasado-viaje (IN-IV-P01).
 *
 * Son DOS textos, los dos VERBATIM de la progresión:
 *  · A2 «Fill in the Past: Irregular Verbs and Sequence» — la excursión a
 *    Teotihuacán, seis huecos de past simple (regulares e irregulares).
 *  · A6 «Fill in the blanks — A memorable experience» — el verano en la costa,
 *    cuatro huecos donde entra el past continuous.
 *
 * El párrafo, las pistas, las respuestas y las alternativas aceptadas son las
 * de esas actividades; aquí sólo se parte cada texto por sus huecos y se
 * traduce la pista al español (el alumno es hispanohablante y la pista no es
 * lengua meta: es la ayuda).
 *
 * Nota de contenido: en A6 el hueco 2 acepta «walked» como alternativa a «were
 * walking», pero la instrucción de la actividad y la pista piden explícitamente
 * el past continuous; y el hueco 1 acepta «was staying» además de «stayed».
 * Se conservan las dos alternativas tal como están en la base para no alterar
 * el contenido publicado, y la explicación del laboratorio aclara cuál es la
 * forma que la progresión enseña.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

/** A2 — past simple, regulares e irregulares. */
export const PASADO_VIAJE_HUECOS_A2: TextoHuecosData = {
  ancla: "IN-IV-P01-A2 · Fill in the Past: Irregular Verbs and Sequence",
  instrucciones: "Complete the story with the correct past simple form of the verb in parentheses. Pay attention to regular and irregular verbs.",
  partes: [
    "Last December, my school ",
    " (organize) a trip to Teotihuacán. We ",
    " (wake up) very early and ",
    " (take) the bus at 5:30 am. When we arrived, our guide ",
    " (tell) us about the history of the pyramids. First, we ",
    " (climb) the Pyramid of the Sun — it ",
    " (be) exhausting but worth it!",
  ],
  huecos: [
    { respuesta: "organized", alternativas: ["organised"], pista: "Regular: organize + d" },
    { respuesta: "woke up", alternativas: ["woke"], pista: "Irregular: wake up → woke up" },
    { respuesta: "took", alternativas: [], pista: "Irregular: take → took" },
    { respuesta: "told", alternativas: [], pista: "Irregular: tell → told" },
    { respuesta: "climbed", alternativas: [], pista: "Regular: climb + ed" },
    { respuesta: "was", alternativas: [], pista: "Irregular: be → was (singular subject)" },
  ],
};

/** A6 — past continuous, past simple y expresiones de tiempo. */
export const PASADO_VIAJE_HUECOS_A6: TextoHuecosData = {
  ancla: "IN-IV-P01-A6 · Fill in the blanks — A memorable experience",
  instrucciones: "Completa los huecos usando past continuous (was/were + -ing), past simple o la expresión de tiempo correcta.",
  partes: [
    "Last summer, I ",
    " with my cousins at a small beach town. While we ",
    " along the shore, we found an old fishing boat. It ",
    " the first time I had ever seen one up close. We ",
    " photos and talked about the adventure all evening.",
  ],
  huecos: [
    { respuesta: "stayed", alternativas: ["was staying"], pista: "Situación en el pasado: I ___ with my cousins (vivía / me quedé)." },
    { respuesta: "were walking", alternativas: ["walked"], pista: "Acción en progreso interrumpida: While we ___ (past continuous)." },
    { respuesta: "was", alternativas: [], pista: "It ___ the first time — pasado simple de 'be'." },
    { respuesta: "took", alternativas: ["took some"], pista: "Pasado irregular de 'take': take → ___." },
  ],
};

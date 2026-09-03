/**
 * «Completa el texto» — pasado-simple-ingles
 *
 * VERBATIM de IN-III-P01-A2 (Past Simple: Fill in the Blanks), progresión IN-III-P01.
 * El párrafo, las pistas, las respuestas y las alternativas aceptadas son las
 * de esa actividad; aquí sólo se parte el texto por sus huecos. Generado por
 * scripts/generar-huecos-labs.ts — no editar a mano.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const PASADO_SIMPLE_INGLES_HUECOS: TextoHuecosData = {
  ancla: "IN-III-P01-A2 · Past Simple: Fill in the Blanks",
  instrucciones: "Complete the text with the correct past simple form of the verbs in parentheses. Some are regular, some are irregular.",
  partes: [
    "Last Sunday, my family ",
    " (go) to the countryside. We ",
    " (wake up) early and ",
    " (eat) a big breakfast. My mother ",
    " (make) tamales the night before. We ",
    " (travel) by bus for two hours. When we arrived, the children ",
    " (play) by the river while the adults ",
    " (talk) and ",
    " (rest). In the evening, we ",
    " (buy) fresh fruit from a local farmer. It ",
    " (be) a perfect day.",
  ],
  huecos: [
    { respuesta: "went", alternativas: [], pista: "Irregular: go → ?" },
    { respuesta: "woke up", alternativas: ["woke"], pista: "Irregular: wake up → ?" },
    { respuesta: "ate", alternativas: [], pista: "Irregular: eat → ?" },
    { respuesta: "made", alternativas: [], pista: "Irregular: make → ?" },
    { respuesta: "travelled", alternativas: ["traveled"], pista: "Regular: travel + ed" },
    { respuesta: "played", alternativas: [], pista: "Regular: play + ed" },
    { respuesta: "talked", alternativas: ["chatted"], pista: "Regular: talk + ed" },
    { respuesta: "rested", alternativas: [], pista: "Regular: rest + ed" },
    { respuesta: "bought", alternativas: [], pista: "Irregular: buy → ?" },
    { respuesta: "was", alternativas: [], pista: "Irregular: be → was/were" },
  ],
};

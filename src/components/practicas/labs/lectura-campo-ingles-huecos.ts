/**
 * «Completa el texto» — lectura-campo-ingles
 *
 * VERBATIM de IN-V-P05-A6 «Fill in the Blanks — Analyzing a Text in English».
 * El texto, las pistas, las respuestas y las alternativas aceptadas son las de
 * esa actividad; aquí sólo se parte el texto por sus huecos («___»).
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

const TEXTO_A6 =
  "The ___ idea of the article is that renewable energy can reduce carbon emissions significantly. ___ to the author, solar power is the most accessible option for developing countries. The text is well-organized; ___, some technical terms are not explained clearly. To ___ up, the article makes a strong case for investing in clean energy technologies.";

export const LECTURA_CAMPO_INGLES_HUECOS: TextoHuecosData = {
  ancla: "IN-V-P05-A6 · Fill in the Blanks — Analyzing a Text in English",
  instrucciones: "Complete the blanks with the correct word or phrase to complete this reading analysis.",
  partes: TEXTO_A6.split("___"),
  huecos: [
    { respuesta: "main", alternativas: ["central"], pista: "'The ___ idea of the article is...' — what adjective describes the most important or central idea?" },
    { respuesta: "According", alternativas: [], pista: "'___ to the author, solar power is...' — which word introduces a reference to what the author says?" },
    { respuesta: "however", alternativas: ["nevertheless"], pista: "This connector introduces a contrasting idea. The text is well-organized; ___, some terms are unclear." },
    { respuesta: "sum", alternativas: [], pista: "'To ___ up' is a phrase used to introduce a summary or conclusion. What word completes it?" },
  ],
};

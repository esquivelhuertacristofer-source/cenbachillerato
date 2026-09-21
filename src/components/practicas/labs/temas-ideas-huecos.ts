/**
 * «Completa el texto» — temas-ideas-narrativa
 *
 * VERBATIM de LC-II-P05-A6 (Completa: tema e ideas). El párrafo, las pistas,
 * las respuestas y las alternativas aceptadas son las de esa actividad; aquí
 * sólo se parte el texto por sus huecos.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const TEMAS_IDEAS_HUECOS: TextoHuecosData = {
  ancla: "LC-II-P05-A6 · Completa: tema e ideas",
  instrucciones: "Completa con la palabra correcta.",
  partes: [
    "El asunto general de un texto es el ",
    ". Lo más importante que el texto afirma sobre ese asunto es la idea ",
    ". Las ideas que la apoyan y ejemplifican son las ideas ",
    ". Un mismo tema se puede ",
    " en varias narrativas distintas.",
  ],
  huecos: [
    { respuesta: "tema", alternativas: [], pista: "El asunto general." },
    { respuesta: "principal", alternativas: ["central"], pista: "La más importante." },
    { respuesta: "secundarias", alternativas: [], pista: "Las que apoyan." },
    { respuesta: "comparar", alternativas: [], pista: "Ver semejanzas y diferencias." },
  ],
};

/**
 * «Completa el texto» — personajes-escenarios
 *
 * VERBATIM de LC-II-P04-A6 (Completa: personajes y escenarios), progresión LC-II-P04.
 * El párrafo, las pistas, las respuestas y las alternativas aceptadas son las
 * de esa actividad; aquí sólo se parte el texto por sus huecos. Generado por
 * scripts/generar-huecos-labs.ts — no editar a mano.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const PERSONAJES_ESCENARIOS_HUECOS: TextoHuecosData = {
  ancla: "LC-II-P04-A6 · Completa: personajes y escenarios",
  instrucciones: "Completa con la palabra correcta.",
  partes: [
    "Describir los rasgos de un personaje es ",
    " lo. El personaje principal es el ",
    " y quien se le opone es el ",
    ". El lugar y ambiente donde ocurre la historia es el ",
    ".",
  ],
  huecos: [
    { respuesta: "caracterizar", alternativas: [], pista: "Describir cómo es." },
    { respuesta: "protagonista", alternativas: [], pista: "Personaje principal." },
    { respuesta: "antagonista", alternativas: [], pista: "Se opone al protagonista." },
    { respuesta: "escenario", alternativas: ["ambiente"], pista: "Lugar de la historia." },
  ],
};

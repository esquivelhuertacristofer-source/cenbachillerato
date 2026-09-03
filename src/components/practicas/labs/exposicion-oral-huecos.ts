/**
 * «Completa el texto» — exposicion-oral
 *
 * VERBATIM de LC-III-P07-A6 (Completa el texto — Exposición oral formal), progresión LC-III-P07.
 * El párrafo, las pistas, las respuestas y las alternativas aceptadas son las
 * de esa actividad; aquí sólo se parte el texto por sus huecos. Generado por
 * scripts/generar-huecos-labs.ts — no editar a mano.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const EXPOSICION_ORAL_HUECOS: TextoHuecosData = {
  ancla: "LC-III-P07-A6 · Completa el texto — Exposición oral formal",
  instrucciones: "Completa los huecos con: coloquio, simposio, foro, planeación, seguimiento.",
  partes: [
    "Cuando varios especialistas presentan perspectivas distintas sobre un mismo tema en un evento académico, el formato es el ",
    ". Si el público puede intervenir con preguntas al final de la presentación, el formato es el ",
    ". El debate estructurado entre participantes con posiciones argumentadas se llama ",
    ". La etapa previa que organiza tema, tiempo y materiales es la ",
    " logística. La evaluación que ocurre antes, durante y después de la exposición se llama ",
    ".",
  ],
  huecos: [
    { respuesta: "simposio", alternativas: [], pista: "Varios ponentes, perspectivas distintas, un mismo tema." },
    { respuesta: "foro", alternativas: [], pista: "El público interviene con preguntas; puede ser presencial o virtual." },
    { respuesta: "coloquio", alternativas: [], pista: "Conversación académica estructurada con posiciones argumentadas." },
    { respuesta: "planeación", alternativas: ["planeación logística"], pista: "Etapa previa de organización del tema, tiempo y materiales." },
    { respuesta: "seguimiento y retroalimentación", alternativas: ["seguimiento","retroalimentación","seguimiento y retroalimentacion"], pista: "Evaluación del proceso antes, durante y después de la exposición." },
  ],
};

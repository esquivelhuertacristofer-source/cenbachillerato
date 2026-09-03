/**
 * «Completa el texto» — procesos-ingles
 *
 * VERBATIM de IN-V-P03-A6 (Fill in the Blanks — Explaining a Process in English), progresión IN-V-P03.
 * El párrafo, las pistas, las respuestas y las alternativas aceptadas son las
 * de esa actividad; aquí sólo se parte el texto por sus huecos. Generado por
 * scripts/generar-huecos-labs.ts — no editar a mano.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const PROCESOS_INGLES_HUECOS: TextoHuecosData = {
  ancla: "IN-V-P03-A6 · Fill in the Blanks — Explaining a Process in English",
  instrucciones: "Complete the blanks with the correct word or structure to complete this interview about a field-related process.",
  partes: [
    "A: Could you ",
    " the steps for conducting a basic experiment? B: Of course. The ",
    " step is to define your question or hypothesis. Then, you design the method. ",
    ", you collect and analyze your data. A: How ",
    " you record the results? B: The data is usually recorded in a table and then analyzed using statistics.",
  ],
  huecos: [
    { respuesta: "explain", alternativas: ["describe"], pista: "'Could you ___ the steps...?' — use the base form of the verb that means 'make something clear'." },
    { respuesta: "first", alternativas: [], pista: "'The ___ step is to...' — what ordinal word begins a sequence?" },
    { respuesta: "Finally", alternativas: ["After that","Then"], pista: "Use a sequencing connector to indicate the last step in the process." },
    { respuesta: "do", alternativas: [], pista: "'How ___ you record...?' — present simple question with 'you' requires the auxiliary ___." },
  ],
};

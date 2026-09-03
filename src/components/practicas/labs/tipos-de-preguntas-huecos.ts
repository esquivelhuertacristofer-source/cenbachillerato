/**
 * «Completa el texto» — tipos-de-preguntas
 *
 * VERBATIM de PFH-I-P02-A6 (Completa: la pregunta filosófica), progresión PFH-I-P02.
 * El párrafo, las pistas, las respuestas y las alternativas aceptadas son las
 * de esa actividad; aquí sólo se parte el texto por sus huecos. Generado por
 * scripts/generar-huecos-labs.ts — no editar a mano.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const TIPOS_DE_PREGUNTAS_HUECOS: TextoHuecosData = {
  ancla: "PFH-I-P02-A6 · Completa: la pregunta filosófica",
  instrucciones: "Completa con la palabra correcta.",
  partes: [
    "Una pregunta ",
    " problematiza lo evidente. Las preguntas sobre el ser son ",
    "; las que tratan del conocimiento son epistemológicas; las que tratan de lo bueno y lo justo son ",
    ". Que una pregunta esté bien formulada y sea pertinente se refiere a su ",
    ".",
  ],
  huecos: [
    { respuesta: "filosófica", alternativas: ["filosofica"], pista: "Tipo de pregunta del tema." },
    { respuesta: "ontológicas", alternativas: ["ontologicas"], pista: "Sobre el ser." },
    { respuesta: "éticas", alternativas: ["eticas"], pista: "Sobre lo bueno y lo justo." },
    { respuesta: "validez", alternativas: [], pista: "Que esté bien formulada." },
  ],
};

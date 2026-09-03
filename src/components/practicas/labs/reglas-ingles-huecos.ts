/**
 * «Completa el texto» — reglas-ingles
 *
 * VERBATIM de IN-III-P05-A6 (Fill in the blanks — Rules and responsibilities), progresión IN-III-P05.
 * El párrafo, las pistas, las respuestas y las alternativas aceptadas son las
 * de esa actividad; aquí sólo se parte el texto por sus huecos. Generado por
 * scripts/generar-huecos-labs.ts — no editar a mano.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const REGLAS_INGLES_HUECOS: TextoHuecosData = {
  ancla: "IN-III-P05-A6 · Fill in the blanks — Rules and responsibilities",
  instrucciones: "Completa los huecos con must, mustn't, have to o don't have to. Piensa si es obligatorio, prohibido o simplemente no necesario.",
  partes: [
    "At school, students ",
    " wear their uniform every day. You ",
    " use your phone during the exam — it is not allowed. My brother ",
    " finish his project tonight; the deadline is tomorrow. You ",
    " bring food; I already cooked.",
  ],
  huecos: [
    { respuesta: "have to", alternativas: ["must"], pista: "Obligación externa (norma del colegio): ___ wear uniform." },
    { respuesta: "mustn't", alternativas: ["must not"], pista: "Está prohibido usar el celular: you ___ use it." },
    { respuesta: "has to", alternativas: ["must"], pista: "Obligación para 'my brother' (3ª persona): he ___ finish." },
    { respuesta: "don't have to", alternativas: ["do not have to"], pista: "No es necesario traer comida (pero si quieres puedes): you ___ bring." },
  ],
};

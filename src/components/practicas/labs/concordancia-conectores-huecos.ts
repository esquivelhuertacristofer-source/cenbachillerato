/**
 * «Completa el texto» — concordancia-conectores
 *
 * VERBATIM de LC-I-P06-A4 (Completa: conectores en su lugar), progresión LC-I-P06.
 * El párrafo, las pistas, las respuestas y las alternativas aceptadas son las
 * de esa actividad; aquí sólo se parte el texto por sus huecos. Generado por
 * scripts/generar-huecos-labs.ts — no editar a mano.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const CONCORDANCIA_CONECTORES_HUECOS: TextoHuecosData = {
  ancla: "LC-I-P06-A4 · Completa: conectores en su lugar",
  instrucciones: "Completa con un conector adecuado: porque, además, como (en comparación) u otro pertinente.",
  partes: [
    "Llegué tarde a clase ",
    " el autobús se descompuso. Estudié mucho para el examen; ",
    ", repasé con mis compañeros. Este texto es claro, ",
    " un río que fluye sin obstáculos. No traje la tarea, ",
    " por lo tanto no pude participar.",
  ],
  huecos: [
    { respuesta: "porque", alternativas: [], pista: "Conector causal: indica la causa." },
    { respuesta: "además", alternativas: [], pista: "Conector de adición: agrega información." },
    { respuesta: "como", alternativas: [], pista: "Conector comparativo: establece semejanza." },
    { respuesta: "y", alternativas: ["así que"], pista: "Une la idea con su consecuencia." },
  ],
};

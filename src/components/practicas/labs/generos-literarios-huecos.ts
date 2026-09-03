/**
 * «Completa el texto» — generos-literarios
 *
 * VERBATIM de LC-III-P03-A6 (Completa el texto — Géneros literarios), progresión LC-III-P03.
 * El párrafo, las pistas, las respuestas y las alternativas aceptadas son las
 * de esa actividad; aquí sólo se parte el texto por sus huecos. Generado por
 * scripts/generar-huecos-labs.ts — no editar a mano.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const GENEROS_LITERARIOS_HUECOS: TextoHuecosData = {
  ancla: "LC-III-P03-A6 · Completa el texto — Géneros literarios",
  instrucciones: "Completa los huecos con el género literario que corresponde a cada descripción.",
  partes: [
    "Pedro Páramo es una ",
    " del siglo XX que explora el mundo de los muertos. 'El aleph' de Borges es un ",
    " breve con un final sorprendente. Un texto no ficcional donde el autor argumenta su perspectiva se llama ",
    ". La obra de García Lorca escrita para ser representada en escena pertenece al ",
    ".",
  ],
  huecos: [
    { respuesta: "novela", alternativas: [], pista: "Género narrativo extenso con múltiples capítulos." },
    { respuesta: "cuento", alternativas: [], pista: "Género narrativo breve con un único conflicto central." },
    { respuesta: "ensayo", alternativas: [], pista: "Texto no ficcional donde el autor argumenta sobre un tema." },
    { respuesta: "drama", alternativas: ["teatro"], pista: "Género concebido para la representación escénica." },
  ],
};

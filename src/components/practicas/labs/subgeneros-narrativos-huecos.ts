/**
 * «Completa el texto» — subgeneros-narrativos
 *
 * VERBATIM de LC-III-P04-A2 (Completa el universo de los subgéneros narrativos), progresión LC-III-P04.
 * El párrafo, las pistas, las respuestas y las alternativas aceptadas son las
 * de esa actividad; aquí sólo se parte el texto por sus huecos. Generado por
 * scripts/generar-huecos-labs.ts — no editar a mano.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const SUBGENEROS_NARRATIVOS_HUECOS: TextoHuecosData = {
  ancla: "LC-III-P04-A2 · Completa el universo de los subgéneros narrativos",
  instrucciones: "Lee el texto con atención y completa cada espacio en blanco (___)  con la palabra o frase más adecuada. Puedes releer el texto cuantas veces necesites.",
  partes: [
    "El ",
    " mantiene al lector en tensión mediante la incertidumbre sobre lo que ocurrirá. El terror ",
    " usa monstruos y fantasmas, mientras que el terror ",
    " amenaza desde la mente del personaje. La ",
    " mezcla autobiografía con invención, haciendo borrosa la frontera entre lo real y lo imaginado. Las literaturas del ",
    " sitúan la crisis ecológica en el centro de la narración.",
  ],
  huecos: [
    { respuesta: "suspenso", alternativas: ["thriller","género de suspenso"], pista: "Subgénero que genera expectativa sobre el desenlace" },
    { respuesta: "sobrenatural", alternativas: ["fantástico","de lo sobrenatural"], pista: "Terror que usa elementos fantásticos como monstruos o fantasmas" },
    { respuesta: "psicológico", alternativas: ["interior","mental"], pista: "Terror que viene de la mente, no de criaturas externas" },
    { respuesta: "autoficción", alternativas: ["auto-ficción","ficción autobiográfica"], pista: "Subgénero que combina lo autobiográfico con lo inventado" },
    { respuesta: "Antropoceno", alternativas: ["antropoceno","Anthropocene"], pista: "Época geológica caracterizada por el impacto humano en el planeta" },
  ],
};

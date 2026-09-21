/**
 * «Completa el texto» — narrativas-populares-lengua
 *
 * VERBATIM de LC-II-P03-A2 («Características lingüísticas de la narrativa
 * popular»). El párrafo, las pistas, las respuestas y las alternativas
 * aceptadas son las de esa actividad; aquí sólo se parte el texto por sus
 * huecos.
 *
 * Es el texto con huecos de la progresión que habla de LA LENGUA (el otro,
 * A6, repasa los tipos de relato), así que es el que corresponde a este
 * laboratorio.
 *
 * Nota sobre la base: la pista del cuarto hueco dice «una sola palabra que
 * empieza con "C"», pero entre las alternativas aceptadas figura «Se dice»,
 * que son dos palabras; lo mismo pasa en el tercero con «pasado/presente». Se
 * conservan tal cual —el laboratorio no corrige la base— y queda anotado en el
 * informe.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const NARRATIVAS_POPULARES_HUECOS: TextoHuecosData = {
  ancla: "LC-II-P03-A2 · Características lingüísticas de la narrativa popular",
  instrucciones:
    "Completa las afirmaciones sobre las características lingüísticas de las narrativas populares.",
  partes: [
    "Las narrativas populares suelen usar un vocabulario ",
    " y regional. Sus estructuras sintácticas son ",
    ". El tiempo verbal predominante es el ",
    ". Abundan fórmulas de inicio como '",
    " que…'. Un recurso expresivo muy común es la ",
    " (exageración de algo para producir efecto).",
  ],
  huecos: [
    {
      respuesta: "coloquial",
      alternativas: ["accesible", "cotidiano", "sencillo"],
      pista: 'La respuesta es una sola palabra que empieza con "C".',
    },
    {
      respuesta: "simples",
      alternativas: ["sencillas", "directas"],
      pista: 'La respuesta es una sola palabra que empieza con "S".',
    },
    {
      respuesta: "pasado",
      alternativas: ["pretérito", "pasado/presente"],
      pista: 'La respuesta es una sola palabra que empieza con "P".',
    },
    {
      respuesta: "Cuentan",
      alternativas: ["Se dice", "Dicen"],
      pista: 'La respuesta es una sola palabra que empieza con "C".',
    },
    {
      respuesta: "hipérbole",
      alternativas: ["exageración"],
      pista: 'La respuesta es una sola palabra que empieza con "H".',
    },
  ],
};

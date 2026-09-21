/**
 * «Completa el texto» — describir-personas-clima
 *
 * VERBATIM de IN-II-P04-A2 («Appearance and Weather: Fill in the Blanks»).
 * El párrafo, las pistas, las respuestas y las alternativas aceptadas son las
 * de esa actividad; aquí sólo se parte el texto por sus seis huecos.
 *
 * Nota de contenido: las instrucciones de la actividad ofrecen «is wearing,
 * has, are, looks, is», pero ningún hueco admite «are» (el primero es «there
 * IS a young woman», singular). «are» es un distractor de la lista, no una
 * respuesta; se conserva el enunciado verbatim tal como está en la base.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const DESCRIBIR_PERSONAS_CLIMA_HUECOS: TextoHuecosData = {
  ancla: "IN-II-P04-A2 · Appearance and Weather: Fill in the Blanks",
  instrucciones: "Complete the description of the photo using: is wearing, has, are, looks, is.",
  partes: [
    "In the photo, there ",
    " a young woman. She ",
    " long dark hair and brown eyes. She ",
    " a colorful jacket and blue jeans. The weather ",
    " cold, so she also ",
    " a scarf around her neck. She ",
    " happy and comfortable.",
  ],
  huecos: [
    { respuesta: "is", alternativas: [], pista: 'La respuesta es una sola palabra que empieza con "I".' },
    { respuesta: "has", alternativas: [], pista: 'La respuesta es una sola palabra que empieza con "H".' },
    { respuesta: "is wearing", alternativas: ["wears"], pista: 'La respuesta tiene 2 palabras y empieza con "I".' },
    { respuesta: "is", alternativas: [], pista: 'La respuesta es una sola palabra que empieza con "I".' },
    { respuesta: "is wearing", alternativas: ["wears", "has"], pista: 'La respuesta tiene 2 palabras y empieza con "I".' },
    { respuesta: "looks", alternativas: ["seems"], pista: 'La respuesta es una sola palabra que empieza con "L".' },
  ],
};

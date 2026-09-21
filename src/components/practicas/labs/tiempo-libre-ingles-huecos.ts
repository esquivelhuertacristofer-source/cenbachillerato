/**
 * «Completa el texto» — tiempo-libre-ingles
 *
 * VERBATIM de IN-II-P02-A2 (Third Person Present Simple: Gaps), progresión
 * IN-II-P02. El párrafo, las pistas, las respuestas y las alternativas
 * aceptadas son las de esa actividad; aquí sólo se parte el texto por sus
 * huecos.
 *
 * `normaliza()` de _mecanica-huecos ignora acentos, mayúsculas y puntuación,
 * así que «doesnt watch» también se da por bueno: lo que se evalúa es la
 * estructura (auxiliar + verbo base), no el apóstrofo.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const TIEMPO_LIBRE_INGLES_HUECOS: TextoHuecosData = {
  ancla: "IN-II-P02-A2 · Third Person Present Simple: Gaps",
  instrucciones: "Complete with the correct third person form of the verbs in parentheses.",
  partes: [
    "My brother ",
    " (play) soccer every Saturday. He also ",
    " (read) graphic novels in his free time. He ",
    " (not watch) TV much. On Sundays, he ",
    " (go) to the park with his friends. He ",
    " (love) photography and ",
    " (take) pictures everywhere.",
  ],
  huecos: [
    { respuesta: "plays", alternativas: [], pista: 'La respuesta es una sola palabra que empieza con "P".' },
    { respuesta: "reads", alternativas: [], pista: 'La respuesta es una sola palabra que empieza con "R".' },
    {
      respuesta: "doesn't watch",
      alternativas: ["does not watch"],
      pista: 'La respuesta tiene 2 palabras y empieza con "D".',
    },
    { respuesta: "goes", alternativas: [], pista: 'La respuesta es una sola palabra que empieza con "G".' },
    { respuesta: "loves", alternativas: [], pista: 'La respuesta es una sola palabra que empieza con "L".' },
    { respuesta: "takes", alternativas: [], pista: 'La respuesta es una sola palabra que empieza con "T".' },
  ],
};

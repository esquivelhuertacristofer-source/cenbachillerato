/**
 * «Completa el texto» — reescritura-taller
 *
 * VERBATIM de LC-II-P06-A2 (Reescribe completando los elementos narrativos).
 * El párrafo, las pistas, las respuestas y las alternativas aceptadas son las
 * de esa actividad; aquí sólo se parte el texto por sus huecos.
 *
 * (La progresión trae un segundo `fill_blanks`, LC-II-P06-A6, pero sus cuatro
 * respuestas son exactamente los términos del glosario A5, que el modo
 * «Escribe el término» ya hace producir de memoria. Repetirlo aquí sería el
 * mismo acto dos veces.)
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const REESCRITURA_HUECOS: TextoHuecosData = {
  ancla: "LC-II-P06-A2 · Reescribe completando los elementos narrativos",
  instrucciones:
    "Completa este texto narrativo reescrito con las palabras que faltan: perspectiva, tono, conflicto, humorístico, protagonista.",
  partes: [
    "La reescritura puede cambiar la ",
    " desde la que se cuenta la historia: de primera a tercera persona. También puede modificar el ",
    " narrativo: un texto dramático puede reescribirse en clave ",
    ". El ",
    " de la historia puede transformarse: lo que era una pérdida puede convertirse en una ganancia. Incluso el ",
    " puede cambiar de rol: el villano puede convertirse en el héroe de su propia versión.",
  ],
  huecos: [
    { respuesta: "perspectiva", alternativas: ["punto de vista", "voz"], pista: 'La respuesta es una sola palabra que empieza con "P".' },
    { respuesta: "tono", alternativas: ["registro", "estilo"], pista: 'La respuesta es una sola palabra que empieza con "T".' },
    { respuesta: "humorístico", alternativas: ["cómico", "irónico"], pista: 'La respuesta es una sola palabra que empieza con "H".' },
    { respuesta: "conflicto", alternativas: ["problema", "nudo"], pista: 'La respuesta es una sola palabra que empieza con "C".' },
    { respuesta: "protagonista", alternativas: ["personaje principal", "héroe"], pista: 'La respuesta es una sola palabra que empieza con "P".' },
  ],
};

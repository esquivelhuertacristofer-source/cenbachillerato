/**
 * «Completa el texto» — presentaciones-ingles
 *
 * VERBATIM de IN-I-P01-A2 (Complete my introduction), progresión IN-I-P01.
 * El párrafo, las pistas, las respuestas y las alternativas aceptadas son las
 * de esa actividad; aquí sólo se parte el texto por sus huecos. Generado por
 * scripts/generar-huecos-labs.ts — no editar a mano.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const PRESENTACIONES_INGLES_HUECOS: TextoHuecosData = {
  ancla: "IN-I-P01-A2 · Complete my introduction",
  instrucciones: "Completa las oraciones con la palabra correcta del cuadro: am / is / are / Hi / Nice / name / from / years",
  partes: [
    "",
    " ! My ",
    " is Valeria. I ",
    " 16 ",
    " old. I ",
    " from Guadalajara, Mexico. This ",
    " my friend Diego. He ",
    " from Monterrey. ",
    " to meet you!",
  ],
  huecos: [
    { respuesta: "Hi", alternativas: ["Hello","hey"], pista: "Saludo informal" },
    { respuesta: "name", alternativas: [], pista: "My ___ is Valeria" },
    { respuesta: "am", alternativas: ["'m"], pista: "I ___ (verbo to be, primera persona)" },
    { respuesta: "years", alternativas: [], pista: "___ old = años de edad" },
    { respuesta: "am", alternativas: ["'m"], pista: "I ___ from (verbo to be)" },
    { respuesta: "is", alternativas: [], pista: "This ___ my friend" },
    { respuesta: "is", alternativas: ["'s"], pista: "He ___ from (verbo to be, tercera persona)" },
    { respuesta: "Nice", alternativas: ["nice"], pista: "___ to meet you!" },
  ],
};

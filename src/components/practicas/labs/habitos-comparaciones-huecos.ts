/**
 * «Completa el texto» — habitos-comparaciones-ingles
 *
 * VERBATIM de IN-III-P04-A2 («Comparatives and Frequency: Fill in the Blanks»).
 * El párrafo, las instrucciones, las pistas y las respuestas correctas son las
 * de esa actividad; aquí solo se parte el texto por sus siete huecos.
 *
 * DOS ALTERNATIVAS DE LA BASE DE DATOS SE OMITEN A PROPÓSITO, porque son
 * inglés incorrecto y aceptarlas enseñaría el error:
 *   · hueco 1 («My sister ___ at home»): la actividad acepta «like cooking»
 *     además de «likes cooking». Con «my sister» el verbo lleva -s.
 *   · hueco 6 («My brother doesn't ___»): la actividad acepta «likes running»
 *     además de «like running». Después de «doesn't» el verbo va en forma base.
 * Se reportan como defectos de contenido; no se tocan en la base de datos.
 *
 * `distingue_mayusculas` viene en falso en la actividad y `normaliza()` ya
 * ignora mayúsculas y acentos, así que «Always» y «always» valen igual.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const HABITOS_COMPARACIONES_HUECOS: TextoHuecosData = {
  ancla: "IN-III-P04-A2 · Comparatives and Frequency: Fill in the Blanks",
  instrucciones:
    "Complete the sentences with the correct comparative or superlative form, the correct frequency adverb, or 'like + verb-ing'. Choose from: more interesting, the healthiest, better, usually, always, like cooking, like running.",
  partes: [
    "My sister ",
    " at home — she says it is cheaper and more fun than eating out. She ",
    " wakes up at 6:00 am, even on weekends. According to nutritionists, walking is ",
    " exercise you can do every day. My father thinks history is ",
    " than mathematics, but I disagree. I ",
    " prefer science subjects. My brother doesn't ",
    ", but he goes to the gym three times a week. He says the gym is ",
    " than jogging outside.",
  ],
  huecos: [
    { respuesta: "likes cooking", alternativas: [], pista: "like + verb-ing (she → likes)" },
    { respuesta: "always", alternativas: [], pista: "100% of the time" },
    { respuesta: "the healthiest", alternativas: [], pista: "Superlative of healthy" },
    { respuesta: "more interesting", alternativas: [], pista: "Comparative of interesting (2 syllables+)" },
    { respuesta: "usually", alternativas: ["normally"], pista: "About 80% of the time" },
    { respuesta: "like running", alternativas: [], pista: "like + verb-ing (después de doesn't, forma base)" },
    { respuesta: "better", alternativas: [], pista: "Irregular comparative of good" },
  ],
};

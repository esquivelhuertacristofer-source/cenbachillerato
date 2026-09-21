/**
 * «Completa el texto» — lectura-en-voz-alta
 *
 * VERBATIM de LC-I-P07-A6 («Completa: la voz que da vida al texto»). El
 * párrafo, las pistas y las respuestas son las de esa actividad; aquí solo se
 * parte el texto por sus huecos. Las alternativas declaradas son las formas sin
 * acento: `normaliza()` ya ignora tildes y mayúsculas, pero se dejan escritas
 * para que el dato sea explícito.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const LECTURA_VOZ_ALTA_HUECOS: TextoHuecosData = {
  ancla: "LC-I-P07-A6 · Completa: la voz que da vida al texto",
  instrucciones: "Completa con: dicción, entonación, ritmo o pausas.",
  partes: [
    "Para que el público entienda cada palabra, cuido mi ",
    ". Para expresar una pregunta, subo el tono usando la ",
    ". Para no leer demasiado rápido, controlo el ",
    ". Y para que el oyente procese lo dicho, hago ",
    " en los puntos.",
  ],
  huecos: [
    { respuesta: "dicción", alternativas: ["diccion"], pista: "Pronunciación clara." },
    { respuesta: "entonación", alternativas: ["entonacion"], pista: "Variación de tono." },
    { respuesta: "ritmo", alternativas: [], pista: "Velocidad de la lectura." },
    { respuesta: "pausas", alternativas: ["pausa"], pista: "Silencios breves." },
  ],
};

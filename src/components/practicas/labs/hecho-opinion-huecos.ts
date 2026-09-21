/**
 * «Completa el texto» — hecho-opinion-texto
 *
 * VERBATIM de LC-I-P03-A5 (Completa: información, idea y opinión), progresión
 * LC-I-P03. El párrafo, las pistas y las respuestas son las de esa actividad;
 * aquí sólo se parte el texto por sus huecos. Las alternativas aceptadas son
 * las formas sin acento: `normaliza()` ya ignora tildes y mayúsculas, pero se
 * dejan escritas para que el dato sea explícito.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const HECHO_OPINION_HUECOS: TextoHuecosData = {
  ancla: "LC-I-P03-A5 · Completa: información, idea y opinión",
  instrucciones: "Completa con la palabra correcta: información, idea u opinión.",
  partes: [
    "«México tiene 32 entidades federativas» es una ",
    " verificable. «La diversidad cultural de México es su mayor riqueza» es una ",
    " del autor. «Deberíamos viajar más por nuestro país» es una ",
    " personal. Para leer de forma ",
    ", conviene distinguir estos tres elementos.",
  ],
  huecos: [
    { respuesta: "información", alternativas: ["informacion"], pista: "Dato comprobable." },
    { respuesta: "idea", alternativas: [], pista: "Interpretación o valoración a partir de información." },
    { respuesta: "opinión", alternativas: ["opinion"], pista: "Postura personal de quien escribe." },
    { respuesta: "crítica", alternativas: ["critica"], pista: "Forma de leer que cuestiona el texto." },
  ],
};

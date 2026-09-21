/**
 * «Completa el texto» — lectura-critica-postura
 *
 * VERBATIM de LC-III-P01-A6 (Completa el texto — Análisis textual), progresión
 * LC-III-P01. El párrafo, las pistas, las respuestas y las alternativas
 * aceptadas son las de esa actividad; aquí solo se parte el texto por sus
 * huecos. Las formas sin acento se dejan escritas aunque `normaliza()` ya
 * ignore tildes y mayúsculas, para que el dato quede explícito.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const LECTURA_CRITICA_HUECOS: TextoHuecosData = {
  ancla: "LC-III-P01-A6 · Completa el texto — Análisis textual",
  instrucciones:
    "Completa los huecos con el término más adecuado según el contexto. Las respuestas son: sentido global, paráfrasis, postura, intención, inferencia.",
  partes: [
    "Para analizar un texto es fundamental identificar la ",
    " del autor, es decir, qué quiso lograr con su escritura. Luego construimos el ",
    " integrando tema y estructura. Reformular las ideas con nuestras palabras se llama ",
    ". Cuando deducimos algo que no está escrito directamente hacemos una ",
    ". Finalmente, expresar nuestra ",
    " implica argumentar si estamos de acuerdo o no con el autor.",
  ],
  huecos: [
    {
      respuesta: "intención",
      alternativas: ["intención del autor", "intencion", "intencion del autor"],
      pista: "¿Qué quiso lograr el autor al escribir? Eso se llama ___.",
    },
    {
      respuesta: "sentido global",
      alternativas: ["sentido"],
      pista: "La interpretación completa que integra tema, estructura e intención es el ___.",
    },
    {
      respuesta: "paráfrasis",
      alternativas: ["parafrasis"],
      pista: "Decir con tus propias palabras lo que dice el autor es hacer una ___.",
    },
    {
      respuesta: "inferencia",
      alternativas: [],
      pista: "Deducir lo que no está escrito explícitamente es hacer una ___.",
    },
    {
      respuesta: "postura",
      alternativas: ["opinión", "opinion"],
      pista: "Argumentar si estás de acuerdo o no con el autor.",
    },
  ],
};

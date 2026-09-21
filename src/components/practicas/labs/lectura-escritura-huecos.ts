/**
 * «Completa el texto» — lectura-escritura-dialogo
 *
 * VERBATIM de LC-I-P01-A6 (Completa: la lengua como práctica social), progresión
 * LC-I-P01. El párrafo, las pistas, las respuestas y las alternativas aceptadas
 * son las de esa actividad; aquí sólo se parte el texto por sus huecos.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const LECTURA_ESCRITURA_HUECOS: TextoHuecosData = {
  ancla: "LC-I-P01-A6 · Completa: la lengua como práctica social",
  instrucciones: "Escribe la palabra que completa correctamente cada espacio.",
  partes: [
    "Cuando ",
    " construimos significado a partir de las palabras de otras personas; cuando ",
    " creamos significado para que otras personas lo lean. La lengua es, antes que nada, una práctica ",
    ", porque la usamos para relacionarnos, aprender y expresarnos. Leer un texto literario nos invita a ",
    ", mientras que leer un artículo informativo activa nuestra capacidad ",
    ".",
  ],
  huecos: [
    { respuesta: "leemos", alternativas: ["leer"], pista: "Acción de interpretar lo escrito." },
    { respuesta: "escribimos", alternativas: ["escribir"], pista: "Acción de producir un texto." },
    { respuesta: "social", alternativas: [], pista: "Tiene que ver con relacionarnos con otros." },
    { respuesta: "imaginar", alternativas: ["imaginar mundos"], pista: "Lo que provoca la literatura." },
    { respuesta: "crítica", alternativas: [], pista: "Capacidad de evaluar y cuestionar la información." },
  ],
};

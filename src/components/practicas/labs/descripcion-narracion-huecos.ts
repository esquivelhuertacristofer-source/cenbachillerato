/**
 * «Completa el texto» — taller-descripcion-narracion
 *
 * VERBATIM de LC-II-P02-A6 («Completa: escribir mi texto»). El párrafo, las
 * pistas, las respuestas y las alternativas aceptadas son las de esa actividad;
 * aquí sólo se parte el texto por sus huecos.
 *
 * Nota: la actividad de la base escribe «conviene ___ lo para mejorarlo», con
 * el pronombre suelto («revisar» + « lo»). Se conserva tal cual porque el
 * laboratorio no corrige la base de datos; queda anotado en el informe.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const DESCRIPCION_NARRACION_HUECOS: TextoHuecosData = {
  ancla: "LC-II-P02-A6 · Completa: escribir mi texto",
  instrucciones: "Completa con la palabra correcta.",
  partes: [
    "Antes de escribir conviene ",
    " las ideas con un esquema o lista. El propósito con que se escribe es el ",
    " comunicativo. La primera versión del texto se llama ",
    ", y conviene ",
    " lo para mejorarlo.",
  ],
  huecos: [
    { respuesta: "organizar", alternativas: ["ordenar"], pista: "Poner en orden." },
    { respuesta: "sentido", alternativas: [], pista: "___ comunicativo: la intención." },
    { respuesta: "borrador", alternativas: [], pista: "Primera versión." },
    { respuesta: "revisar", alternativas: ["corregir"], pista: "Mejorar el borrador." },
  ],
};

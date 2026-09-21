/**
 * «Completa el texto» — procedimientos-narrativos
 *
 * VERBATIM de LC-II-P07-A6 («Completa: análisis colaborativo»), progresión
 * LC-II-P07. El párrafo, las instrucciones, las pistas, las respuestas y las
 * alternativas aceptadas son las de esa actividad; aquí solo se parte el texto
 * por sus huecos.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const PROCEDIMIENTOS_NARRATIVOS_HUECOS: TextoHuecosData = {
  ancla: "LC-II-P07-A6 · Completa: análisis colaborativo",
  instrucciones: "Completa con la palabra correcta.",
  partes: [
    "El ",
    " entre pares permite compartir distintos puntos de vista sobre un texto. Los comentarios que ayudan a corregir y mejorar se llaman ",
    ". Las estrategias para construir un relato son los ",
    " narrativos, y un texto creado en equipo es un texto ",
    ".",
  ],
  huecos: [
    { respuesta: "diálogo", alternativas: ["dialogo"], pista: "Conversación entre compañeros." },
    { respuesta: "retroalimentación", alternativas: ["retroalimentacion", "realimentación", "realimentacion"], pista: "Comentarios para mejorar." },
    { respuesta: "procedimientos", alternativas: [], pista: "Estrategias narrativas." },
    { respuesta: "colaborativo", alternativas: [], pista: "Hecho en equipo." },
  ],
};

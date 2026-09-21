/**
 * «Completa el texto» — aula-ingles
 *
 * VERBATIM de IN-I-P02-A2 (What do we say in class?), progresión IN-I-P02.
 * El diálogo, las pistas, las respuestas y las alternativas aceptadas son las
 * de esa actividad; aquí sólo se parte el texto por sus huecos.
 *
 * La actividad declara `distingue_mayusculas: false`, y `CompletaTexto`
 * normaliza mayúsculas y acentos, así que «open» y «Open» valen igual.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const AULA_INGLES_HUECOS: TextoHuecosData = {
  ancla: "IN-I-P02-A2 · What do we say in class?",
  instrucciones:
    "Completa los diálogos de salón de clase con las palabras correctas: understand / repeat / open / page / question / mean / pairs / homework",
  partes: [
    "Teacher: ",
    " your books to ",
    " 45. Work in ",
    " please. — Student: I have a ",
    ". What does 'assignment' ",
    "? — Teacher: It means ",
    ". Can you ",
    " that? — Student: Sorry, I don't ",
    ". Could you speak more slowly?",
  ],
  huecos: [
    { respuesta: "Open", alternativas: ["open"], pista: "___ your books" },
    { respuesta: "page", alternativas: [], pista: "to ___ 45" },
    { respuesta: "pairs", alternativas: [], pista: "Work in ___" },
    { respuesta: "question", alternativas: [], pista: "I have a ___" },
    { respuesta: "mean", alternativas: [], pista: "What does it ___?" },
    { respuesta: "homework", alternativas: [], pista: "It means ___ (tarea)" },
    { respuesta: "repeat", alternativas: [], pista: "Can you ___ that?" },
    { respuesta: "understand", alternativas: [], pista: "I don't ___" },
  ],
};

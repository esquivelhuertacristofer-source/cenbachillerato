/**
 * «Completa el texto» — encuesta-lectora-comunidad
 *
 * VERBATIM de LC-I-P02-A6 (Completa: clasificando textos cotidianos), progresión
 * LC-I-P02. El texto, las pistas y las respuestas son los de esa actividad;
 * aquí solo se parte el texto por sus huecos.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const ENCUESTA_LECTORA_HUECOS: TextoHuecosData = {
  ancla: "LC-I-P02-A6 · Completa: clasificando textos cotidianos",
  instrucciones: "Completa con el tipo de texto correspondiente: informativo, narrativo o digital.",
  partes: [
    "Una receta de cocina que explica pasos a seguir es un texto ",
    ". Un cuento que relata las aventuras de un personaje es un texto ",
    ". Una publicación que tu amistad sube a sus redes sociales es un texto ",
    ". El reporte del clima en el periódico es un texto ",
    ".",
  ],
  huecos: [
    { respuesta: "informativo", alternativas: [], pista: "Reporta datos o instrucciones verificables." },
    { respuesta: "narrativo", alternativas: [], pista: "Relata hechos a lo largo del tiempo." },
    { respuesta: "digital", alternativas: [], pista: "Circula en pantallas y plataformas." },
    { respuesta: "informativo", alternativas: [], pista: "Reporta datos verificables." },
  ],
};

/**
 * «Completa el texto» — anatomia-exposicion-oral
 *
 * VERBATIM de LC-I-P08-A6 (Completa: las etapas de exponer), progresión
 * LC-I-P08. El párrafo, las pistas, las respuestas y las alternativas
 * aceptadas son las de esa actividad; aquí sólo se parte el texto por sus
 * huecos.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const ANATOMIA_EXPOSICION_HUECOS: TextoHuecosData = {
  ancla: "LC-I-P08-A6 · Completa: las etapas de exponer",
  instrucciones: "Completa con: planeación, introducción, desarrollo, conclusión.",
  partes: [
    "Primero, en la ",
    ", defino el tema e investigo. Al exponer, empiezo con la ",
    " para presentar el tema. Luego, en el ",
    ", explico los puntos principales. Finalmente, en la ",
    ", retomo lo esencial y cierro.",
  ],
  huecos: [
    { respuesta: "planeación", alternativas: ["planeacion", "planificación"], pista: "Etapa previa: definir e investigar." },
    { respuesta: "introducción", alternativas: ["introduccion"], pista: "Presenta el tema." },
    { respuesta: "desarrollo", alternativas: [], pista: "Explica los puntos principales." },
    { respuesta: "conclusión", alternativas: ["conclusion"], pista: "Cierra la exposición." },
  ],
};

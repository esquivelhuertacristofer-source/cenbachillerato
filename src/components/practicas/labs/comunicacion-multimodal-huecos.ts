/**
 * «Completa el texto» — comunicacion-multimodal
 *
 * VERBATIM de CD-III-P01-A6 (Completa los espacios — Comunicación multimodal e identidad digital), progresión CD-III-P01.
 * El párrafo, las pistas, las respuestas y las alternativas aceptadas son las
 * de esa actividad; aquí sólo se parte el texto por sus huecos. Generado por
 * scripts/generar-huecos-labs.ts — no editar a mano.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const COMUNICACION_MULTIMODAL_HUECOS: TextoHuecosData = {
  ancla: "CD-III-P01-A6 · Completa los espacios — Comunicación multimodal e identidad digital",
  instrucciones: "Completa los huecos con el término o concepto correcto.",
  partes: [
    "La comunicación que combina texto, imagen, audio y video de manera integrada se denomina comunicación ",
    ". El fenómeno por el cual los algoritmos limitan la exposición a perspectivas distintas se llama burbuja de ",
    ". La representación digital que una persona construye de sí misma y que las plataformas elaboran con sus datos se denomina identidad ",
    ". El análisis que cuestiona quién produce un mensaje, con qué intención y qué efectos tiene se llama análisis ",
    " de medios.",
  ],
  huecos: [
    { respuesta: "multimodal", alternativas: [], pista: "La comunicación que usa múltiples modos semióticos (texto, imagen, audio, video) se llama comunicación ___." },
    { respuesta: "filtro", alternativas: ["filter bubble"], pista: "El algoritmo crea una ___ de filtro al personalizar el contenido y reducir la diversidad de perspectivas." },
    { respuesta: "digital", alternativas: [], pista: "La huella en línea y los datos que definen a una persona en el ciberespacio forman su identidad ___." },
    { respuesta: "crítico", alternativas: ["crítica"], pista: "Cuestionar la fuente, la intención y el efecto de un mensaje es hacer análisis ___ de medios." },
  ],
};

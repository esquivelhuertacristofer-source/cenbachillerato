/**
 * «Completa el texto» — herramientas-colaborativas
 *
 * VERBATIM de CD-II-P02-A6 (Completa: TICCAD y manejo de información), progresión CD-II-P02.
 * El párrafo, las pistas, las respuestas y las alternativas aceptadas son las
 * de esa actividad; aquí sólo se parte el texto por sus huecos. Generado por
 * scripts/generar-huecos-labs.ts — no editar a mano.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const HERRAMIENTAS_COLABORATIVAS_HUECOS: TextoHuecosData = {
  ancla: "CD-II-P02-A6 · Completa: TICCAD y manejo de información",
  instrucciones: "Completa con la palabra correcta.",
  partes: [
    "Las ",
    " son las Tecnologías de Información, Comunicación, Conocimiento y Aprendizajes Digitales. Para investigar un fenómeno primero hay que ",
    " información, luego ",
    " las fuentes confiables y por último ",
    " la información de forma ordenada.",
  ],
  huecos: [
    { respuesta: "TICCAD", alternativas: ["ticcad"], pista: "La sigla del tema." },
    { respuesta: "buscar", alternativas: [], pista: "Localizar datos." },
    { respuesta: "discriminar", alternativas: ["evaluar","seleccionar"], pista: "Distinguir lo confiable." },
    { respuesta: "gestionar", alternativas: ["organizar"], pista: "Organizar y dar sentido." },
  ],
};

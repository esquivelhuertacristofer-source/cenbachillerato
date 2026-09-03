/**
 * «Completa el texto» — hipotesis-historicas
 *
 * VERBATIM de CH-II-P02-A6 (Completa los espacios — Hipótesis históricas y fuentes), progresión CH-II-P02.
 * El párrafo, las pistas, las respuestas y las alternativas aceptadas son las
 * de esa actividad; aquí sólo se parte el texto por sus huecos. Generado por
 * scripts/generar-huecos-labs.ts — no editar a mano.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const HIPOTESIS_HISTORICAS_HUECOS: TextoHuecosData = {
  ancla: "CH-II-P02-A6 · Completa los espacios — Hipótesis históricas y fuentes",
  instrucciones: "Completa los huecos con el término o concepto correcto.",
  partes: [
    "Una ",
    " histórica es una proposición provisional que busca explicar un fenómeno del pasado y debe verificarse con fuentes y evidencias. El Plan de Ayala, proclamado por Zapata en 1911, es un ejemplo de fuente ",
    " porque fue producida durante el período estudiado. Una interpretación académica elaborada por un historiador décadas después de los hechos es una fuente ",
    ". El proceso de evaluar la autenticidad y confiabilidad de un documento histórico se llama ",
    " de fuentes.",
  ],
  huecos: [
    { respuesta: "hipótesis", alternativas: [], pista: "Proposición provisional que busca explicar un hecho histórico y que debe contrastarse con evidencias." },
    { respuesta: "primaria", alternativas: [], pista: "Las fuentes producidas durante el período histórico estudiado, por testigos o participantes directos, son fuentes ___." },
    { respuesta: "secundaria", alternativas: [], pista: "Los análisis e interpretaciones de historiadores elaborados después de los hechos son fuentes ___." },
    { respuesta: "crítica", alternativas: ["heurística"], pista: "El método para evaluar la autenticidad, sesgo y confiabilidad de una fuente se llama ___ de fuentes." },
  ],
};

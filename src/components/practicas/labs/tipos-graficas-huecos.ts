/**
 * «Completa el texto» — tipos-graficas
 *
 * VERBATIM de CD-II-P04-A6 (Completa: estadística con software libre), progresión CD-II-P04.
 * El párrafo, las pistas, las respuestas y las alternativas aceptadas son las
 * de esa actividad; aquí sólo se parte el texto por sus huecos. Generado por
 * scripts/generar-huecos-labs.ts — no editar a mano.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const TIPOS_GRAFICAS_HUECOS: TextoHuecosData = {
  ancla: "CD-II-P04-A6 · Completa: estadística con software libre",
  instrucciones: "Completa con la palabra correcta.",
  partes: [
    "La media, la mediana y la moda son medidas de tendencia ",
    ". La desviación estándar y el rango son medidas de ",
    ". Para visualizar los datos usamos representaciones ",
    ". Un software estadístico libre muy usado es ",
    ".",
  ],
  huecos: [
    { respuesta: "central", alternativas: [], pista: "Tendencia ___." },
    { respuesta: "dispersión", alternativas: ["dispersion"], pista: "Qué tan separados están los datos." },
    { respuesta: "gráficas", alternativas: ["graficas"], pista: "Visuales." },
    { respuesta: "Jamovi", alternativas: ["jamovi","JASP","jasp","XLSTAT"], pista: "Jamovi, JASP..." },
  ],
};

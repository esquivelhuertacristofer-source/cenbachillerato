/**
 * «Completa el texto» — kit-herramientas-digitales
 *
 * VERBATIM de CD-I-P08-A6 («Completa: herramientas escolares»). El párrafo,
 * las instrucciones, las pistas, las respuestas y las alternativas aceptadas
 * son las de esa actividad; aquí solo se parte el texto por sus huecos.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const KIT_HERRAMIENTAS_HUECOS: TextoHuecosData = {
  ancla: "CD-I-P08-A6 · Completa: herramientas escolares",
  instrucciones: "Completa con la palabra correcta.",
  partes: [
    "Para escribir documentos usamos un ",
    " de texto; para organizar datos y hacer cálculos, una ",
    " de cálculo. Para exponer un tema con diapositivas usamos una ",
    " electrónica. Guardar una copia de seguridad de tus trabajos se llama ",
    ".",
  ],
  huecos: [
    { respuesta: "procesador", alternativas: [], pista: "Para escribir." },
    { respuesta: "hoja", alternativas: [], pista: "___ de cálculo." },
    { respuesta: "presentación", alternativas: ["presentacion"], pista: "Diapositivas." },
    { respuesta: "respaldo", alternativas: ["backup", "copia de seguridad"], pista: "Copia de seguridad." },
  ],
};

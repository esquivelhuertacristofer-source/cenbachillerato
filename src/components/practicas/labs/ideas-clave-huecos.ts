/**
 * «Completa el texto» — ideas-clave-subrayado
 *
 * VERBATIM de LC-I-P05-A4 (Completa: ideas principales y secundarias).
 * El párrafo, las pistas, las respuestas y las alternativas aceptadas son las
 * de esa actividad; aquí sólo se parte el texto por sus huecos.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const IDEAS_CLAVE_HUECOS: TextoHuecosData = {
  ancla: "LC-I-P05-A4 · Completa: ideas principales y secundarias",
  instrucciones: "Completa el texto con los conceptos correctos.",
  partes: [
    "La idea ",
    " es la información más importante de un párrafo; las ideas ",
    " la apoyan con ejemplos y detalles. Los elementos ",
    ", como el título, los subtítulos y las imágenes, ayudan a anticipar el contenido. Para identificar lo esencial es útil ",
    " las palabras clave del texto.",
  ],
  huecos: [
    { respuesta: "principal", alternativas: [], pista: "La más importante." },
    { respuesta: "secundarias", alternativas: [], pista: "Apoyan a la principal." },
    { respuesta: "paratextuales", alternativas: ["paratextos"], pista: "Rodean al texto: título, imágenes…" },
    { respuesta: "subrayar", alternativas: [], pista: "Marcar lo importante con una línea." },
  ],
};

/**
 * «Completa el texto» — historia-de-vida-relato
 *
 * VERBATIM de LC-II-P01-A2 (Completa la narrativa autobiográfica), progresión
 * LC-II-P01. El párrafo, las pistas, las respuestas y las alternativas
 * aceptadas son las de esa actividad; aquí sólo se parte el texto por sus
 * huecos.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const HISTORIA_DE_VIDA_HUECOS: TextoHuecosData = {
  ancla: "LC-II-P01-A2 · Completa la narrativa autobiográfica",
  instrucciones: "Completa el texto con las palabras del banco: huella, experiencia, reflexión, narrar, significado.",
  partes: [
    "Las narrativas de vida nos permiten ",
    " episodios significativos de nuestra historia personal. Al escribir, no solo recordamos: construimos ",
    " sobre lo que vivimos. Elegir una situación que dejó una ",
    " en nosotros requiere ",
    " honesta. Compartir esa ",
    " con otros es un acto de comunicación profunda.",
  ],
  huecos: [
    { respuesta: "narrar", alternativas: ["contar", "relatar"], pista: 'La respuesta es una sola palabra que empieza con "N".' },
    { respuesta: "significado", alternativas: ["sentido"], pista: 'La respuesta es una sola palabra que empieza con "S".' },
    { respuesta: "huella", alternativas: ["marca", "impresión"], pista: 'La respuesta es una sola palabra que empieza con "H".' },
    { respuesta: "reflexión", alternativas: ["reflexionar"], pista: 'La respuesta es una sola palabra que empieza con "R".' },
    { respuesta: "experiencia", alternativas: ["vivencia"], pista: 'La respuesta es una sola palabra que empieza con "E".' },
  ],
};

/**
 * «Completa el texto» — carreras-digitales
 *
 * VERBATIM de CD-III-P03-A6 (Completa los espacios — Vocaciones digitales y perspectiva de género), progresión CD-III-P03.
 * El párrafo, las pistas, las respuestas y las alternativas aceptadas son las
 * de esa actividad; aquí sólo se parte el texto por sus huecos. Generado por
 * scripts/generar-huecos-labs.ts — no editar a mano.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const CARRERAS_DIGITALES_HUECOS: TextoHuecosData = {
  ancla: "CD-III-P03-A6 · Completa los espacios — Vocaciones digitales y perspectiva de género",
  instrucciones: "Completa los huecos con el término o concepto correcto.",
  partes: [
    "El campo profesional que se ocupa de proteger sistemas y datos de ataques digitales se llama ",
    ". La disciplina que combina estadística y programación para extraer valor de grandes conjuntos de datos se denomina ciencia de ",
    ". El acrónimo que agrupa Ciencia, Tecnología, Ingeniería y Matemáticas, áreas donde persiste una brecha de género, es ",
    ". El diseño de interfaces digitales que prioriza la experiencia del usuario se conoce como diseño ",
    " .",
  ],
  huecos: [
    { respuesta: "ciberseguridad", alternativas: ["seguridad informática","seguridad digital"], pista: "El campo que protege sistemas, redes y datos de ataques o accesos no autorizados se llama ___." },
    { respuesta: "datos", alternativas: [], pista: "La ciencia que extrae información valiosa de grandes conjuntos de información es la ciencia de ___." },
    { respuesta: "STEM", alternativas: ["CTIM"], pista: "Las iniciales en inglés de Ciencia, Tecnología, Ingeniería y Matemáticas forman el acrónimo ___." },
    { respuesta: "UX", alternativas: ["UX/UI","experiencia de usuario"], pista: "El diseño centrado en la experiencia y satisfacción del usuario se conoce como diseño ___ (o UX/UI)." },
  ],
};

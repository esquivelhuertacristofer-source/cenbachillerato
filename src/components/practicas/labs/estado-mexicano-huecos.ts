/**
 * «Completa el texto» — estado-mexicano
 *
 * ESCRITO A MANO, y por eso lleva esta nota. Es el único de los 45
 * laboratorios DOM cuya progresión ancla (CS-I-P01) NO tiene actividad
 * `fill_blanks`, así que no había nada que volcar: `generar-huecos-labs.ts` lo
 * dejó fuera con razón.
 *
 * Lo que SÍ es verbatim es el párrafo: sale tal cual de CS-I-P01-A1 («El
 * Estado: ¿qué es y para qué sirve?»), sólo unido en un párrafo continuo. Las
 * seis palabras tapadas no son una elección libre: son exactamente las que la
 * propia lectura pregunta en sus `preguntas_comprension` («¿Cuáles son los tres
 * elementos clásicos del Estado?» → territorio, población, gobierno; «¿Cuáles
 * son los tres poderes del Estado mexicano?» → Ejecutivo, Legislativo,
 * Judicial). Las respuestas están, literalmente, en el mismo texto.
 *
 * Si algún día CS-I-P01 gana su `fill_blanks`, este archivo se sustituye
 * corriendo `scripts/generar-huecos-labs.ts` como los otros 44.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const ESTADO_MEXICANO_HUECOS: TextoHuecosData = {
  ancla: "CS-I-P01-A1 · El Estado: ¿qué es y para qué sirve?",
  instrucciones: "Completa el texto de la lectura con los elementos y los poderes del Estado.",
  partes: [
    "El Estado es la forma de organización política que permite a una sociedad vivir bajo un sistema de normas comunes, resolver conflictos y tomar decisiones colectivas. En la teoría política clásica, el Estado se define por tres elementos: un ",
    " delimitado, una ",
    " que lo habita y un ",
    " con el monopolio legítimo de la fuerza. En México, el Estado está compuesto por tres poderes: el ",
    " (presidente de la república, gobernadores, presidentes municipales), el ",
    " (Congreso de la Unión: Senado y Cámara de Diputados; congresos locales) y el ",
    " (Suprema Corte de Justicia, tribunales). Cada uno tiene funciones específicas y se supone que se controlan mutuamente.",
  ],
  huecos: [
    { respuesta: "territorio", alternativas: [], pista: "El espacio delimitado sobre el que el Estado manda." },
    { respuesta: "población", alternativas: ["poblacion"], pista: "La gente que habita ese espacio." },
    { respuesta: "gobierno", alternativas: [], pista: "Quien ejerce el monopolio legítimo de la fuerza." },
    { respuesta: "Ejecutivo", alternativas: [], pista: "Presidente, gobernadores, presidentes municipales." },
    { respuesta: "Legislativo", alternativas: [], pista: "Congreso de la Unión y congresos locales." },
    { respuesta: "Judicial", alternativas: [], pista: "Suprema Corte de Justicia y tribunales." },
  ],
};

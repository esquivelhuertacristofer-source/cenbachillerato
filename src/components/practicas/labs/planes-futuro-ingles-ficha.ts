/**
 * Datos de la Ficha Teórica del laboratorio "Plans and purposes: la colonia
 * que planeamos" (IN-IV-P05, progresión 5 de Inglés IV).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: lectura A1 «Plans and Goals: Be Going To and Will» y su
 *     recuadro sobre «gonna».
 *   - Glosario: glosario interactivo A5 (6 términos).
 *   - Present continuous para acuerdos: retroalimentación del verdadero/falso A4.
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, LECTURA_A1, CALLOUT_A1, FUENTE, TITULO_A1 } from "./planes-futuro-ingles-data";

export const PLANES_FUTURO_INGLES_FICHA: FichaTeoricaData = {
  ancla: `IN-IV · P05 · A1 — ${TITULO_A1}`,

  marcoTeorico: [...LECTURA_A1, `Nota: ${CALLOUT_A1}`],

  objetivos: [
    "Distinguir un plan ya decidido (be going to) de una decisión tomada en el momento (will).",
    "Predecir con be going to cuando hay evidencia a la vista y con will cuando es una opinión o una idea no decidida.",
    "Hablar de citas y acuerdos con fecha y hora con present continuous.",
    "Proponer un proyecto comunitario con we could + verbo base.",
    "Anunciar un plan completo: quién + be going to + qué + cuándo + por qué.",
    "Explicar el propósito de un plan con to + verbo, so that y because.",
    "Escribir metas personales con be going to, I'm planning to, I hope to y will, y su expresión de tiempo.",
  ],

  materiales: [
    { nombre: "Carrusel de situaciones", detalle: "Ocho escenas de la colonia (nubes, bolsas, una carta de aceptación, un salón caluroso, una cita, una idea, un mural y una despedida) que reaccionan a la forma que eliges.", icono: "fa-cloud-sun-rain" },
    { nombre: "Maqueta de la colonia", detalle: "Parque, huerto escolar, biblioteca, cancha y plaza, que cambian cuando propones y planeas cada proyecto.", icono: "fa-city" },
    { nombre: "Fichas de palabras", detalle: "Sujeto, tres formas de be going to, acción, dos expresiones de tiempo, tres conectores y tres razones.", icono: "fa-puzzle-piece" },
    { nombre: "Agenda de metas", detalle: "Un camino con cinco fechas, de next week a in five years, donde escribes tus metas.", icono: "fa-flag-checkered" },
  ],

  conceptos: [
    {
      termino: "Be going to: planes y evidencia",
      definicion: "am / is / are + going to + verbo base. Para planes decididos ANTES de hablar (I'm going to study nursing next year) y para predicciones con evidencia a la vista (Look at those clouds — it's going to rain).",
    },
    {
      termino: "Will: decisiones, promesas y opiniones",
      definicion: "will + verbo base (sin to). Para decisiones en el momento de hablar (It's very hot in here. I'll open the window), ofrecimientos y promesas (I'll call you when I arrive) y predicciones basadas en una opinión o ideas aún no decididas (I think…, Maybe I'll…).",
    },
    {
      termino: "Present continuous para acuerdos (A4)",
      definicion: "am / is / are + verbo con -ing para citas y acuerdos con fecha y hora: I'm seeing the dentist tomorrow at 4 p.m. Según A4: 'be going to', present continuous for arrangements, and 'will' are all used for the future with different nuances.",
    },
    {
      termino: "Proponer y planear en grupo",
      definicion: "We could + verbo base es una propuesta amable (We could clean up the park). Cuando el grupo ya lo decidió, se anuncia con be going to: We are going to clean up the park next Saturday.",
    },
    {
      termino: "Explicar el propósito",
      definicion: "to + verbo base (to make it safe for families) · so that + oración, casi siempre con can (so that children can play there again) · because + la causa (because there is trash everywhere). En español «para + verbo» se dice «to + verbo», no «for + verbo».",
    },
    {
      termino: "Intenciones y deseos (A5)",
      definicion: "I'm planning to + verbo = intención bien pensada. I hope to + verbo = deseo o aspiración. Ambas llevan to y el verbo en forma base.",
    },
    {
      termino: "Expresiones de tiempo (A1)",
      definicion: "next week, next month, next year, in the future, tomorrow, soon, in five years, by the end of the semester. Pueden ir al final o al principio de la oración (con coma): Next Saturday, we are going to…",
    },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: `${g.definicion} Ejemplo: ${g.ejemplo}` })),

  aplicaciones: [
    "Contestar en una entrevista qué vas a hacer después del bachillerato y por qué.",
    "Presentar en inglés un proyecto comunitario: qué harán, cuándo y para qué.",
    "Hacer una promesa o un ofrecimiento en el momento: I'll help you. I'll call you.",
    "Escribir tus metas de estudio o de trabajo con fechas claras y su propósito.",
  ],

  fuente: FUENTE,
};

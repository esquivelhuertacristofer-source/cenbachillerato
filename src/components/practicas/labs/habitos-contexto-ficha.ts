/**
 * Ficha teórica — habitos-contexto-ingles
 *
 * Contenido VERBATIM de la progresión IN-IV-P03 (Inglés IV). La progresión no
 * tiene lectura: el marco teórico reúne su propósito, la descripción del video
 * A8, las retroalimentaciones del verdadero/falso A4 y el criterio «Logrado» de
 * la autoevaluación A3 sobre because/so. Conceptos = glosario A5; glosario =
 * glosario A1.
 */
import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO_A1, GLOSARIO_A5, PROGRESION_TITULO, VIDEO_A8 } from "./habitos-contexto-data";

export const HABITOS_CONTEXTO_FICHA: FichaTeoricaData = {
  ancla: "IN-IV-P03-A1 · Daily Routines and Habits: Key Vocabulary",
  marcoTeorico: [
    PROGRESION_TITULO,
    VIDEO_A8.descripcion,
    "The present simple expresses habitual or repeated actions.",
    "'so that' and 'in order to' express purpose and make routines more meaningful.",
    "'Be used to + verb-ing' means the action is familiar and no longer difficult.",
    "Frequency adverbs usually come before the main verb ('I always have breakfast') but after 'be' ('She is always on time').",
    "'I tend to check my phone first thing in the morning' = it's a regular tendency.",
    "Uso 'because' correctamente para explicar causas: 'I exercise because it helps me feel better.' Distingo entre 'because' (causa) y 'so' (consecuencia).",
  ],
  objetivos: [
    "Completa el modo «My week»: los cuatro medidores de Lucía en verde en Maple Falls.",
    "Completa el modo «Explain why»: tres hábitos explicados con su frecuencia y su razón.",
    "Completa el modo «Escribe el término».",
    "Completa el modo «Complete the text» (los dos textos).",
    "Aprueba el cuestionario de comprensión.",
  ],
  materiales: [],
  conceptos: GLOSARIO_A5.map((t) => ({ termino: t.termino, definicion: t.definicion })),
  glosario: GLOSARIO_A1.map((t) => ({ termino: t.termino, definicion: t.definicion })),
  fuente: "Material CEN Bachillerato — IN-IV-P03 (A2+)",
};

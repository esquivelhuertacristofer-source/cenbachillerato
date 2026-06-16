/**
 * Datos puros del laboratorio de Enlaces químicos (CNEYT-I-P10).
 *
 * Contiene el QUIZ evaluable VERBATIM de la actividad ancla A2 «Enlaces
 * químicos — Quiz». Se usa en la tarjeta interactiva (parte B del tratamiento):
 * el alumno responde el quiz real dentro del lab.
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { QuizEvaluable } from "./_reto-quiz";

// VERBATIM de CNEYT-I-P10-A2 (quiz_multiple_opcion).
export const QUIZ_A2: QuizEvaluable = {
  titulo: "Enlaces químicos — Quiz",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "Un átomo que PIERDE electrones se convierte en:",
      opciones: [
        "Un anión (carga negativa)",
        "Un catión (carga positiva)",
        "Un isótopo",
        "Un neutrón",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "Al perder electrones (negativos) queda con carga positiva: catión.",
    },
    {
      enunciado: "El enlace en el que dos no metales COMPARTEN electrones se llama:",
      opciones: [
        "Iónico",
        "Covalente",
        "Metálico",
        "Nuclear",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "Compartir electrones entre no metales = enlace covalente; forma moléculas.",
    },
    {
      enunciado: "La sal de mesa (NaCl) es un ejemplo de enlace:",
      opciones: [
        "Covalente",
        "Metálico",
        "Iónico",
        "Sin enlace",
      ],
      respuestaCorrecta: 2,
      retroalimentacion: "El sodio (metal) cede un electrón al cloro (no metal): enlace iónico.",
    },
    {
      enunciado: "Los isótopos de un elemento se diferencian en su número de:",
      opciones: [
        "Protones",
        "Electrones de valencia",
        "Neutrones",
        "Enlaces",
      ],
      respuestaCorrecta: 2,
      retroalimentacion: "Mismo elemento (mismos protones), distinto número de neutrones.",
    },
    {
      enunciado: "La electronegatividad es la tendencia de un átomo a:",
      opciones: [
        "Atraer electrones",
        "Perder neutrones",
        "Emitir luz",
        "Ganar protones",
      ],
      respuestaCorrecta: 0,
      retroalimentacion: "Mide cuánto atrae un átomo los electrones del enlace.",
    },
  ],
};

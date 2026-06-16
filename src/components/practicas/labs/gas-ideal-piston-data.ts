/**
 * Datos puros del laboratorio de Gas ideal y primera ley (CNEYT-II-P09).
 *
 * Contiene el QUIZ evaluable VERBATIM de la actividad ancla A2 «Gas ideal y
 * primera ley — Opción múltiple». Se usa en la tarjeta interactiva (parte B del
 * tratamiento): el alumno responde el quiz real dentro del lab.
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { QuizEvaluable } from "./_reto-quiz";

// VERBATIM de CNEYT-II-P09-A2 (quiz_multiple_opcion).
export const QUIZ_A2: QuizEvaluable = {
  titulo: "Gas ideal y primera ley — Opción múltiple",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "Un sistema que intercambia energía con el entorno pero NO materia se llama…",
      opciones: ["abierto", "cerrado", "aislado", "ideal"],
      respuestaCorrecta: 1,
      retroalimentacion: "El sistema cerrado intercambia solo energía (p. ej. una olla con tapa).",
    },
    {
      enunciado: "La ecuación de estado del gas ideal es…",
      opciones: ["ΔU = Q − W", "PV = nRT", "Ec = ½mv²", "W = F·d"],
      respuestaCorrecta: 1,
      retroalimentacion: "PV = nRT relaciona presión, volumen, moles, R y temperatura.",
    },
    {
      enunciado: "El principio cero de la termodinámica fundamenta el concepto de…",
      opciones: ["trabajo", "presión", "temperatura", "volumen"],
      respuestaCorrecta: 2,
      retroalimentacion: "Da sentido a la temperatura y al equilibrio térmico.",
    },
    {
      enunciado: "La equivalencia entre caloría y joule es…",
      opciones: ["1 caloría = 4.184 J", "1 caloría = 1 J", "1 caloría = 8.314 J", "1 caloría = 100 J"],
      respuestaCorrecta: 0,
      retroalimentacion: "1 caloría = 4.184 J (experimento de Joule).",
    },
    {
      enunciado: "Según la primera ley (ΔU = Q − W), si un sistema recibe calor y no realiza trabajo, su energía interna…",
      opciones: ["disminuye", "aumenta", "no cambia", "se vuelve negativa"],
      respuestaCorrecta: 1,
      retroalimentacion: "Con W = 0, ΔU = Q: la energía interna aumenta al recibir calor.",
    },
  ],
};

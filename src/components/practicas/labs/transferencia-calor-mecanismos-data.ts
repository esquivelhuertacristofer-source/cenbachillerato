/**
 * Datos puros del laboratorio de Transferencia de calor (CNEYT-II-P04).
 *
 * Contiene el QUIZ evaluable VERBATIM de la actividad ancla A4 «Calor y
 * temperatura — Verdadero o falso». Se usa en la tarjeta interactiva (parte B
 * del tratamiento): el alumno responde el quiz real dentro del lab.
 *
 * El quiz original es verdadero/falso; se adapta a la tarjeta de opción
 * múltiple con las opciones ["Verdadero", "Falso"] (respuesta true → índice 0).
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { QuizEvaluable } from "./_reto-quiz";

// VERBATIM de CNEYT-II-P04-A4 (quiz_verdadero_falso); puntaje_minimo_aprobacion = 70.
export const QUIZ_A2: QuizEvaluable = {
  titulo: "Calor y temperatura — Verdadero o falso",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "Calor y temperatura son lo mismo.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 1,
      retroalimentacion: "Falso: el calor es energía en tránsito; la temperatura mide la agitación de las partículas.",
    },
    {
      enunciado: "El equilibrio térmico se alcanza cuando dos cuerpos en contacto llegan a la misma temperatura.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto: el calor fluye hasta igualar las temperaturas.",
    },
    {
      enunciado: "La conducción, la convección y la radiación son formas de propagación del calor.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto: son los tres mecanismos de transferencia de calor.",
    },
    {
      enunciado: "En la escala Kelvin, las temperaturas pueden ser negativas con frecuencia.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 1,
      retroalimentacion: "Falso: el cero de la escala Kelvin es el cero absoluto; no hay valores por debajo.",
    },
  ],
};

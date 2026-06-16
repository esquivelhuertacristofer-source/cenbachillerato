/**
 * Datos puros del laboratorio de Entropía y leyes de la termodinámica
 * (CNEYT-II-P10).
 *
 * Contiene el QUIZ evaluable VERBATIM de la actividad ancla A2 «Entropía,
 * entalpía y leyes — Opción múltiple». Se usa en la tarjeta interactiva
 * (parte B del tratamiento): el alumno responde el quiz real dentro del lab.
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { QuizEvaluable } from "./_reto-quiz";

// VERBATIM de CNEYT-II-P10-A2 (quiz_multiple_opcion).
export const QUIZ_A2: QuizEvaluable = {
  titulo: "Entropía, entalpía y leyes — Opción múltiple",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "Un proceso que libera calor al entorno se llama…",
      opciones: ["endotérmico", "exotérmico", "isotérmico", "adiabático"],
      respuestaCorrecta: 1,
      retroalimentacion: "Exotérmico: libera calor (p. ej. una combustión).",
    },
    {
      enunciado: "La entropía (S) es una medida de…",
      opciones: [
        "la presión del sistema",
        "el desorden o dispersión de la energía",
        "la masa del sistema",
        "el trabajo realizado",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "La entropía mide el desorden o la dispersión de la energía.",
    },
    {
      enunciado: "Según la segunda ley, en todo proceso espontáneo la entropía del universo…",
      opciones: ["disminuye", "se mantiene constante", "aumenta", "se vuelve cero"],
      respuestaCorrecta: 2,
      retroalimentacion: "La entropía total del universo aumenta.",
    },
    {
      enunciado: "El cero absoluto corresponde a…",
      opciones: ["0 °C", "−273.15 °C (0 K)", "100 K", "−100 °C"],
      respuestaCorrecta: 1,
      retroalimentacion: "0 K = −273.15 °C, la temperatura más baja posible.",
    },
    {
      enunciado: "Una consecuencia de la segunda ley es que ninguna máquina térmica…",
      opciones: ["puede funcionar", "es 100% eficiente", "produce trabajo", "necesita combustible"],
      respuestaCorrecta: 1,
      retroalimentacion: "Siempre se dispersa algo de energía como calor; no hay eficiencia del 100%.",
    },
  ],
};

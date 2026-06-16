/**
 * Datos puros del laboratorio de Tipos de Reacciones Químicas (CNEYT-IV-P02).
 *
 * Contiene el QUIZ evaluable VERBATIM de la actividad ancla A2
 * «Clasifica las reacciones: quiz de tipos» (quiz_multiple_opcion).
 * Se usa en la tarjeta interactiva RetoQuizCard dentro del lab.
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { QuizEvaluable } from "./_reto-quiz";

// VERBATIM de CNEYT-IV-P02-A2 (quiz_multiple_opcion).
export const QUIZ_A2: QuizEvaluable = {
  titulo: "Clasifica las reacciones: quiz de tipos",
  puntajeMinimo: 70, // puntaje_minimo_aprobacion verbatim
  reactivos: [
    {
      enunciado:
        "La reacción N₂ + 3 H₂ → 2 NH₃ (síntesis de amoníaco — Proceso Haber-Bosch) es un ejemplo de:",
      opciones: [
        "Descomposición",
        "Síntesis o combinación",
        "Sustitución simple",
        "Combustión",
      ],
      respuestaCorrecta: 1, // "Síntesis o combinación"
      retroalimentacion:
        "Es una síntesis (A + B → AB): dos reactivos se combinan para formar un solo producto (NH₃). El proceso Haber-Bosch es la reacción industrial más importante del siglo XX: el amoníaco producido es la base de los fertilizantes nitrogenados que alimentan a ~50% de la humanidad.",
    },
    {
      enunciado:
        "El calcio (Ca) se añade a agua y desplaza al hidrógeno: Ca + 2 H₂O → Ca(OH)₂ + H₂. Este tipo de reacción se llama:",
      opciones: [
        "Combustión",
        "Síntesis",
        "Sustitución simple o desplazamiento",
        "Doble sustitución",
      ],
      respuestaCorrecta: 2, // "Sustitución simple o desplazamiento"
      retroalimentacion:
        "Es una sustitución simple: un elemento (Ca) desplaza a otro (H) de un compuesto. El calcio es más reactivo que el hidrógeno, por lo que el desplazamiento procede espontáneamente. Este tipo de reacciones sigue el orden de la serie de actividad química (serie de reactividad).",
    },
    {
      enunciado: "La reacción: HCl + NaOH → NaCl + H₂O es un ejemplo de:",
      opciones: [
        "Síntesis",
        "Descomposición",
        "Combustión",
        "Doble sustitución (neutralización)",
      ],
      respuestaCorrecta: 3, // "Doble sustitución (neutralización)"
      retroalimentacion:
        "Es una doble sustitución o metátesis, específicamente una reacción de neutralización: el ácido (HCl) y la base (NaOH) intercambian sus iones para formar una sal (NaCl) y agua. El producto NaCl es el cloruro de sodio (sal de mesa).",
    },
    {
      enunciado: "¿Cuál de estas reacciones es una COMBUSTIÓN COMPLETA?",
      opciones: [
        "C + O₂ → CO (sin suficiente O₂)",
        "C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O",
        "2 H₂O₂ → 2 H₂O + O₂",
        "2 Na + 2 H₂O → 2 NaOH + H₂",
      ],
      respuestaCorrecta: 1, // "C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O"
      retroalimentacion:
        "La combustión completa de un hidrocarburo produce CO₂ y H₂O exclusivamente. C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O es la combustión completa del propano (gas LP). La opción A es combustión incompleta (produce CO tóxico, no CO₂).",
    },
    {
      enunciado:
        "¿Cuál es la principal diferencia entre una reacción de síntesis y una de descomposición?",
      opciones: [
        "En la síntesis se libera calor; en la descomposición se absorbe siempre",
        "En la síntesis, múltiples reactivos forman un solo producto; en la descomposición, un solo reactivo origina múltiples productos",
        "Son lo mismo con nombres distintos",
        "En la síntesis participan solo elementos; en la descomposición, solo compuestos",
      ],
      respuestaCorrecta: 1, // opción B
      retroalimentacion:
        "La síntesis une para formar: A + B → AB. La descomposición divide: AB → A + B. Son procesos inversos. Ejemplo: 2 H₂ + O₂ → 2 H₂O (síntesis); 2 H₂O → 2 H₂ + O₂ (descomposición por electrólisis).",
    },
  ],
};

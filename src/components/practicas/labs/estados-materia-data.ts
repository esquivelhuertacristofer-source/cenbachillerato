/**
 * Datos puros del laboratorio de Estados de la materia (CNEYT-I-P05).
 *
 * Contiene el QUIZ evaluable VERBATIM de la actividad ancla A2
 * «¿En qué estado está y por qué cambia?». Se usa en la tarjeta interactiva
 * (parte B del tratamiento): el alumno responde el quiz real dentro del lab.
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { QuizEvaluable } from "./_reto-quiz";

// VERBATIM de CNEYT-I-P05-A2 (quiz_multiple_opcion).
export const QUIZ_A2: QuizEvaluable = {
  titulo: "¿En qué estado está y por qué cambia?",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Cuál es la característica principal del estado sólido?",
      opciones: [
        "Las partículas se mueven libremente en todas direcciones",
        "Las partículas están muy juntas y vibran en posiciones fijas",
        "Las partículas están muy separadas",
        "Las partículas tienen muy alta energía cinética",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "En el estado sólido, las partículas vibran pero no se mueven libremente: por eso los sólidos tienen forma definida.",
    },
    {
      enunciado: "¿Qué nombre recibe el cambio de líquido a gas?",
      opciones: [
        "Fusión",
        "Solidificación",
        "Sublimación",
        "Vaporización o evaporación",
      ],
      respuestaCorrecta: 3,
      retroalimentacion:
        "El cambio de líquido a gas se llama vaporización (si ocurre en toda la masa del líquido: ebullición) o evaporación (en la superficie).",
    },
    {
      enunciado:
        "El hielo seco (CO₂ sólido) pasa directamente de sólido a gas sin pasar por el estado líquido. ¿Cómo se llama ese cambio?",
      opciones: [
        "Fusión",
        "Condensación",
        "Sublimación",
        "Deposición",
      ],
      respuestaCorrecta: 2,
      retroalimentacion:
        "La sublimación es el cambio directo de sólido a gas. El hielo seco es el ejemplo más conocido.",
    },
    {
      enunciado: "¿Por qué el agua hierve a 100°C a nivel del mar?",
      opciones: [
        "Porque todos los líquidos hierven a 100°C",
        "Porque es el punto de ebullición específico del agua a la presión atmosférica estándar",
        "Porque esa es la temperatura máxima que puede alcanzar el agua",
        "Porque el agua es H₂O y eso determina arbitrariamente su temperatura de ebullición",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "El punto de ebullición es una propiedad específica de cada sustancia pura, que varía con la presión atmosférica.",
    },
    {
      enunciado: "¿Por qué los cambios de estado son 'reversibles'?",
      opciones: [
        "Porque siempre pueden deshacerse con la misma temperatura",
        "Porque la materia no cambia su naturaleza química, solo su forma de organizarse",
        "Porque el agua siempre puede volver a ser hielo",
        "Porque todos los cambios en la naturaleza son reversibles",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "Los cambios de estado son físicos: la composición química no cambia, por lo que el proceso puede revertirse.",
    },
  ],
};

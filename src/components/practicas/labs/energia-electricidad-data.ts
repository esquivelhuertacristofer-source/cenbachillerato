/**
 * Datos puros del laboratorio de Energía y electricidad (CNEYT-I-P11).
 *
 * Contiene el QUIZ evaluable VERBATIM de la actividad ancla A2
 * «Materia, energía y electricidad — Quiz». Se usa en la tarjeta interactiva
 * (parte B del tratamiento): el alumno responde el quiz real dentro del lab.
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { QuizEvaluable } from "./_reto-quiz";

// VERBATIM de CNEYT-I-P11-A2 (quiz_multiple_opcion).
export const QUIZ_A2: QuizEvaluable = {
  titulo: "Materia, energía y electricidad",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "Que la materia sea 'corpuscular' significa que está hecha de:",
      opciones: [
        "Ondas de sonido",
        "Partículas (átomos, iones, electrones)",
        "Energía pura sin materia",
        "Luz solamente",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "Corpuscular = formada por partículas.",
    },
    {
      enunciado: "Una corriente eléctrica es, en esencia:",
      opciones: [
        "Protones que vibran sin moverse",
        "El movimiento ordenado de electrones",
        "Calor sin partículas",
        "Luz reflejada",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "Es el movimiento ordenado de cargas (electrones) por un material.",
    },
    {
      enunciado: "¿Cuál de estos es un buen conductor de electricidad?",
      opciones: [
        "El plástico",
        "El vidrio",
        "El cobre",
        "La madera seca",
      ],
      respuestaCorrecta: 2,
      retroalimentacion: "El cobre es un metal con electrones libres: buen conductor.",
    },
    {
      enunciado: "Los chips de las computadoras y celulares se basan en:",
      opciones: [
        "Aislantes perfectos",
        "Semiconductores como el silicio",
        "Cargas que no se mueven",
        "Materiales sin átomos",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "Los semiconductores (silicio) son la base de la electrónica.",
    },
    {
      enunciado: "Dos cargas eléctricas del mismo signo:",
      opciones: [
        "Se atraen",
        "Se repelen",
        "No interactúan",
        "Se convierten en luz",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "Cargas iguales se repelen; opuestas se atraen.",
    },
  ],
};

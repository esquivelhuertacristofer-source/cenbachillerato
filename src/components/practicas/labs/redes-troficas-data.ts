/**
 * Datos puros del laboratorio de Redes tróficas (CNEYT-III-P02).
 *
 * Contiene el QUIZ evaluable VERBATIM de la actividad ancla A4
 * «Verdadero o Falso — Flujo de energía y redes tróficas».
 * Se usa en la tarjeta interactiva (parte B del tratamiento): el alumno
 * responde el quiz real dentro del lab.
 *
 * Fuente: CNEYT-III-P02-A4 (quiz_verdadero_falso).
 * Cada pregunta V/F se mapea a QuizReactivo con opciones ["Verdadero","Falso"];
 * respuestaCorrecta = 0 si respuesta era true, 1 si era false.
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { QuizEvaluable } from "./_reto-quiz";

// VERBATIM de CNEYT-III-P02-A4 (quiz_verdadero_falso).
export const QUIZ_A2: QuizEvaluable = {
  titulo: "Verdadero o Falso — Flujo de energía y redes tróficas",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "Los productores son organismos que fabrican su propio alimento a partir de energía solar o química.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto: los autótrofos (plantas, algas, algunas bacterias) producen materia orgánica sin consumir otros seres vivos.",
    },
    {
      enunciado: "En una cadena trófica, la energía fluye desde los consumidores hacia los productores.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 1,
      retroalimentacion: "El flujo de energía es unidireccional: va de los productores a los consumidores primarios, luego a los secundarios y así sucesivamente.",
    },
    {
      enunciado: "Al pasar de un nivel trófico al siguiente se transfiere aproximadamente el 10 % de la energía disponible.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto: la regla del 10 % explica que el 90 % restante se pierde como calor en la respiración.",
    },
    {
      enunciado: "Los descomponedores son organismos que devuelven nutrientes al suelo al degradar materia orgánica muerta.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Sí: hongos y bacterias descomponedoras mineralizan la materia orgánica y cierran los ciclos de nutrientes.",
    },
    {
      enunciado: "Una red trófica es simplemente una sola cadena alimentaria lineal.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 1,
      retroalimentacion: "Una red trófica es la interconexión de múltiples cadenas alimentarias dentro de un ecosistema.",
    },
  ],
};

/**
 * Datos puros del laboratorio de Modelos atómicos (CNEYT-I-P03).
 *
 * Contiene el QUIZ evaluable VERBATIM de la actividad ancla A2 «Estructura
 * atómica: componentes y propiedades». Se usa en la tarjeta interactiva
 * (parte B del tratamiento): el alumno responde el quiz real dentro del lab.
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { QuizEvaluable } from "./_reto-quiz";

// VERBATIM de CNEYT-I-P03-A2 (quiz_multiple_opcion).
export const QUIZ_A2: QuizEvaluable = {
  titulo: "Estructura atómica: componentes y propiedades",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Dónde se encuentran los protones en un átomo?",
      opciones: [
        "En las capas de electrones",
        "En el núcleo, junto con los neutrones",
        "Orbitando el núcleo",
        "En toda la estructura del átomo por igual",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "Los protones (y neutrones) están en el núcleo central del átomo.",
    },
    {
      enunciado: "¿Qué determina a qué elemento pertenece un átomo?",
      opciones: [
        "El número de neutrones",
        "El número de electrones en la capa exterior",
        "El número de protones (número atómico)",
        "El tamaño del átomo",
      ],
      respuestaCorrecta: 2,
      retroalimentacion: "El número atómico (número de protones) es lo que define el elemento. Todos los átomos de carbono tienen 6 protones.",
    },
    {
      enunciado: "¿Qué son los isótopos?",
      opciones: [
        "Átomos de diferentes elementos con propiedades similares",
        "Átomos del mismo elemento con diferente número de neutrones",
        "Átomos con el mismo número de electrones pero diferente número de protones",
        "Moléculas formadas por el mismo tipo de átomo",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "Los isótopos son átomos del mismo elemento (mismo número de protones) con diferente número de neutrones.",
    },
    {
      enunciado: "¿Cuál es la carga eléctrica del electrón?",
      opciones: [
        "Positiva",
        "Negativa",
        "Neutra (sin carga)",
        "Variable según el elemento",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "Los electrones tienen carga negativa; los protones tienen carga positiva; los neutrones son neutros.",
    },
    {
      enunciado: "¿Por qué los electrones de valencia son importantes?",
      opciones: [
        "Porque determinan el tamaño del átomo",
        "Porque determinan cómo reacciona químicamente un elemento con otros",
        "Porque determinan la masa del átomo",
        "Porque son los electrones más cercanos al núcleo",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "Los electrones de valencia (en la capa exterior) son los que participan en los enlaces químicos.",
    },
  ],
};

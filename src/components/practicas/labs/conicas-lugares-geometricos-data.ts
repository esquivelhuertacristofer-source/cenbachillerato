/**
 * Datos puros del laboratorio de Cónicas (PM-IV-P07).
 *
 * Contiene el QUIZ evaluable VERBATIM de la actividad ancla A2
 * «Identifico cónicas por su ecuación y calculo sus elementos».
 * Se usa en la tarjeta interactiva (parte B del tratamiento): el alumno
 * responde el quiz real dentro del lab.
 *
 * Fuente: PM-IV-P07-A2 (quiz_multiple_opcion, practica_slug=conicas-lugares-geometricos).
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { QuizEvaluable } from "./_reto-quiz";

// VERBATIM de PM-IV-P07-A2 (quiz_multiple_opcion).
// respuestaCorrecta: índice 0-based (el dump ya usa indexación 0-based).
export const QUIZ_A2: QuizEvaluable = {
  titulo: "Identifico cónicas por su ecuación y calculo sus elementos",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Cuál es la ecuación de la circunferencia con centro en (3, -2) y radio 5?",
      opciones: [
        "(x + 3)² + (y - 2)² = 25",
        "(x - 3)² + (y + 2)² = 25",
        "(x - 3)² + (y + 2)² = 5",
        "(x + 3)² + (y - 2)² = 5",
      ],
      respuestaCorrecta: 1, // "(x-3)²+(y+2)²=25" — h=3, k=-2, r²=25
      retroalimentacion:
        "La ecuación canónica de la circunferencia con centro (h, k) y radio r es (x-h)² + (y-k)² = r². Con h=3, k=-2 y r=5: (x-3)² + (y-(-2))² = 5² → (x-3)² + (y+2)² = 25.",
    },
    {
      enunciado: "La ecuación x² + y² - 4x + 6y - 3 = 0 representa una circunferencia. ¿Cuál es su centro?",
      opciones: [
        "(-2, 3)",
        "(2, -3)",
        "(4, -6)",
        "(-4, 6)",
      ],
      respuestaCorrecta: 1, // "(2,-3)"
      retroalimentacion:
        "Completando el cuadrado: (x²-4x+4) + (y²+6y+9) = 3+4+9 → (x-2)²+(y+3)²=16. El centro es (2,-3) y el radio es 4.",
    },
    {
      enunciado: "La parábola y = 2(x - 1)² + 3 tiene su vértice en:",
      opciones: [
        "(1, 3)",
        "(-1, -3)",
        "(2, 3)",
        "(1, -3)",
      ],
      respuestaCorrecta: 0, // "(1,3)"
      retroalimentacion:
        "En la forma y = a(x-h)² + k, el vértice es el punto (h, k). Aquí h=1 y k=3, así que el vértice es (1, 3). Como a=2>0, la parábola abre hacia arriba y el vértice es un mínimo.",
    },
    {
      enunciado: "¿Cuál de las siguientes ecuaciones representa una parábola que abre hacia abajo?",
      opciones: [
        "y = 3x² + 2x - 1",
        "x² + y² = 16",
        "y = -½x² + 4x",
        "y = (x + 2)² - 5",
      ],
      respuestaCorrecta: 2, // "y = -½x² + 4x" — coeficiente a=-½<0
      retroalimentacion:
        "Una parábola y = ax² + bx + c abre hacia abajo cuando a < 0. En y = -½x² + 4x, el coeficiente a = -½ < 0, por lo que abre hacia abajo y tiene un máximo. La opción b es una circunferencia; c y d tienen a > 0 (abren hacia arriba).",
    },
    {
      enunciado:
        "¿Cuál es la aplicación tecnológica que aprovecha la propiedad reflexiva de la parábola (que los rayos paralelos al eje se reflejan en el foco)?",
      opciones: [
        "Las ventanas circulares de los aviones",
        "Las antenas parabólicas satelitales y los espejos de telescopios reflectores",
        "Los arcos de los puentes colgantes (que son catenarias, no parábolas)",
        "Las pantallas curvas de televisores OLED",
      ],
      respuestaCorrecta: 1, // "Las antenas parabólicas satelitales y los espejos de telescopios reflectores"
      retroalimentacion:
        "La propiedad de la parábola establece que toda onda paralela al eje se refleja hacia el foco. Las antenas parabólicas concentran las señales satelitales en el receptor colocado en el foco. Los espejos de los telescopios reflectores (Cassegrain, Newton) usan paraboloides por la misma razón.",
    },
  ],
};

/**
 * Datos puros del laboratorio de Óptica geométrica (CNEYT-V-P06).
 *
 * Contiene el QUIZ evaluable VERBATIM de la actividad ancla A4
 * «Verdadero o Falso — Fenómenos ópticos» (tipo=quiz_verdadero_falso).
 *
 * Mapeo V/F → QuizReactivo:
 *   opciones: ["Verdadero", "Falso"]
 *   respuestaCorrecta: respuesta === true ? 0 : 1
 *   retroalimentacion: VERBATIM del campo "retroalimentacion" del ancla.
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { QuizEvaluable } from "./_reto-quiz";

// VERBATIM de CNEYT-V-P06-A4 (quiz_verdadero_falso). puntajeMinimo=70.
export const QUIZ_A2: QuizEvaluable = {
  titulo: "Verdadero o Falso — Fenómenos ópticos",
  puntajeMinimo: 70, // puntaje_minimo_aprobacion verbatim del ancla
  reactivos: [
    {
      // respuesta: true → respuestaCorrecta: 0 ("Verdadero")
      enunciado:
        "En la reflexión de la luz, el ángulo de incidencia (medido respecto a la normal) es siempre igual al ángulo de reflexión.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion:
        "Correcto. Esta es la ley de reflexión: θᵢ = θᵣ, donde ambos ángulos se miden respecto a la normal a la superficie reflectante.",
    },
    {
      // respuesta: true → respuestaCorrecta: 0 ("Verdadero")
      enunciado:
        "La ley de Snell establece que n₁·sen(θ₁) = n₂·sen(θ₂), donde n es el índice de refracción del medio.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion:
        "Correcto. La ley de Snell-Descartes describe cuánto cambia la dirección de la luz al pasar de un medio con índice n₁ a otro con índice n₂.",
    },
    {
      // respuesta: false → respuestaCorrecta: 1 ("Falso")
      enunciado:
        "Cuando la luz pasa del agua (n ≈ 1.33) al aire (n = 1), la luz se acerca a la normal porque pasa a un medio más denso.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 1,
      retroalimentacion:
        "Falso. Al pasar del agua al aire, la luz pasa a un medio menos denso (n menor), por lo que el rayo se aleja de la normal (el ángulo de refracción es mayor que el de incidencia).",
    },
    {
      // respuesta: true → respuestaCorrecta: 0 ("Verdadero")
      enunciado:
        "La dispersión de la luz blanca a través de un prisma separa los colores porque cada longitud de onda tiene un índice de refracción ligeramente diferente en el vidrio.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion:
        "Correcto. La dispersión ocurre porque el índice de refracción del vidrio varía con la longitud de onda: la luz violeta se refracta más que la roja, separando los colores.",
    },
    {
      // respuesta: false → respuestaCorrecta: 1 ("Falso")
      enunciado:
        "Una lente convergente (convexa) hace que los rayos paralelos al eje óptico divergan después de atravesarla.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 1,
      retroalimentacion:
        "Falso. Una lente convergente (convexa) hace que los rayos paralelos al eje óptico converjan en un punto llamado foco principal. Las lentes divergentes (cóncavas) son las que dispersan los rayos.",
    },
  ],
};

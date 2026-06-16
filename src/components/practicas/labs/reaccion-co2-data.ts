/**
 * Datos puros del laboratorio de Reacción vinagre + bicarbonato (CNEYT-IV-P08).
 *
 * Contiene el QUIZ evaluable VERBATIM de la actividad ancla A4
 * «Verdadero o Falso — Experimentos de química casera». Se usa en la tarjeta
 * interactiva (parte B del tratamiento): el alumno responde el quiz real dentro
 * del lab.
 *
 * La convención de nombre QUIZ_A2 se conserva aunque la fuente sea A4, para
 * consistencia con el patrón del resto de labs (siempre llamado QUIZ_A2).
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { QuizEvaluable } from "./_reto-quiz";

// VERBATIM de CNEYT-IV-P08-A4 (quiz_verdadero_falso).
// Mapeo V/F → QuizReactivo:
//   respuesta: true  → respuestaCorrecta: 0 (índice de "Verdadero")
//   respuesta: false → respuestaCorrecta: 1 (índice de "Falso")
//   puntaje_minimo_aprobacion: 70 → puntajeMinimo: 70
export const QUIZ_A2: QuizEvaluable = {
  titulo: "Verdadero o Falso — Experimentos de química casera",
  puntajeMinimo: 70,
  reactivos: [
    {
      // fuente: pregunta 1 — respuesta: true
      enunciado:
        "Una variable controlada en un experimento es aquella que el investigador mantiene constante para que no afecte los resultados.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion:
        "Correcto: en el método científico, las variables controladas (o de control) son las que se mantienen iguales en todos los grupos del experimento.",
    },
    {
      // fuente: pregunta 2 — respuesta: true
      enunciado:
        "El volcán de bicarbonato es un ejemplo de reacción ácido-base porque el vinagre (ácido acético) reacciona con el bicarbonato de sodio (base).",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion:
        "Correcto: CH₃COOH + NaHCO₃ → CH₃COONa + H₂O + CO₂↑. El CO₂ genera la 'erupción'.",
    },
    {
      // fuente: pregunta 3 — respuesta: false
      enunciado:
        "En todo experimento químico, el uso de equipo de protección personal (bata, gafas) es opcional si los reactivos son caseros.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 1,
      retroalimentacion:
        "El equipo de protección siempre es necesario, incluso con reactivos caseros; el ácido acético concentrado puede irritar los ojos y la piel, y el bicarbonato puede generar salpicaduras.",
    },
    {
      // fuente: pregunta 4 — respuesta: true
      enunciado:
        "Una hipótesis debe ser falsable, es decir, debe poder ser refutada mediante observaciones o experimentos.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion:
        "Correcto: la falsabilidad es un criterio central del método científico (Popper); una hipótesis no falsable no es científica.",
    },
    {
      // fuente: pregunta 5 — respuesta: false
      enunciado:
        "Los resultados de un experimento solo son válidos si confirman la hipótesis planteada.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 1,
      retroalimentacion:
        "Los resultados que refutan la hipótesis son igualmente válidos y valiosos; en ciencia, refutar hipótesis es parte esencial del proceso de construcción del conocimiento.",
    },
  ],
};

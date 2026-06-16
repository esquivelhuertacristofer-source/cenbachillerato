/**
 * Datos puros del laboratorio de Máquinas térmicas y ciclos (CNEYT-II-P03).
 *
 * Contiene el QUIZ evaluable VERBATIM de la actividad ancla A4 «Trabajo
 * mecánico y calor — Verdadero o falso» (quiz_verdadero_falso). Se adapta a la
 * tarjeta de opción múltiple (parte B del tratamiento): cada enunciado
 * verdadero/falso se presenta con las opciones "Verdadero" / "Falso" y el
 * alumno responde el quiz real dentro del lab.
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { QuizEvaluable } from "./_reto-quiz";

// VERBATIM de CNEYT-II-P03-A4 (quiz_verdadero_falso) — mapeado a opción múltiple
// V/F: respuesta true → "Verdadero" (índice 0); respuesta false → "Falso" (índice 1).
export const QUIZ_A2: QuizEvaluable = {
  titulo: "Trabajo mecánico y calor — Verdadero o falso",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "El trabajo mecánico se calcula como fuerza por distancia (W = F·d).",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto: cuando la fuerza actúa en la dirección del movimiento.",
    },
    {
      enunciado: "Si una fuerza no produce desplazamiento, no realiza trabajo mecánico.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto: sin desplazamiento (d = 0) el trabajo es cero.",
    },
    {
      enunciado: "Los procesos mecánicos, como la fricción, pueden producir calor.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto: frotar dos superficies genera calor.",
    },
    {
      enunciado: "El trabajo y el calor no tienen ninguna relación con la energía.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 1,
      retroalimentacion: "Falso: ambos son formas de transferir energía.",
    },
  ],
};

/**
 * Datos puros del reto evaluable del laboratorio de Análisis de función:
 * extremos e inflexión (PM-V-P06).
 *
 * Reproduce VERBATIM el ejercicio ancla A2 «Análisis completo de función:
 * encontrando extremos e inflexión» (ejercicio_matematico, practica_slug=
 * extremos-inflexion). El alumno identifica los valores numéricos clave:
 * puntos críticos, valores de f en esos puntos, y la abscisa del punto de
 * inflexión; verifica con tolerancia cero.
 *
 * Aritmética verificada (f(x) = x³ − 3x² − 9x + 5):
 *   f'(x) = 3x² − 6x − 9 = 3(x−3)(x+1) → críticos x = −1 y x = 3
 *   f''(x) = 6x − 6
 *   f''(−1) = −12 < 0 → máximo local;  f(−1) = (−1) − 3 + 9 + 5 = 10
 *   f''(3)  = 12  > 0 → mínimo local;  f(3)  = 27 − 27 − 27 + 5 = −22
 *   f''(x) = 0 → x = 1 (inflexión);    f(1)  = 1 − 3 − 9 + 5   = −6
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

// VERBATIM de PM-V-P06-A2 (ejercicio_matematico, tipo_respuesta "desarrollo").
import type { RetoNumericoData } from "./_reto-numerico";

export const RETO_A2: RetoNumericoData = {
  titulo: "Análisis completo de función: encontrando extremos e inflexión",
  contexto:
    "Para la función f(x) = x³ - 3x² - 9x + 5, realiza el análisis completo usando derivadas.",
  problema:
    "Para la función f(x) = x³ - 3x² - 9x + 5:\n\n" +
    "(a) Encuentra todos los puntos críticos (donde f'(x) = 0).\n" +
    "    Escribe el punto crítico x₁ (el menor, máximo local).\n\n" +
    "(b) Clasifica cada punto crítico como máximo o mínimo local usando el criterio de la segunda derivada.\n" +
    "    Escribe el valor de f en el máximo local: f(x₁).\n\n" +
    "(c) Encuentra todos los puntos de inflexión.\n" +
    "    Escribe la abscisa del punto de inflexión: x₃.\n\n" +
    "(d) El segundo punto crítico x₂ (el mayor, mínimo local):\n" +
    "    Escribe el valor de f en el mínimo local: f(x₂).",
  campos: [
    {
      etiqueta: "(a) Punto crítico x₁ (máximo local, el menor)",
      objetivo: -1,
      tolerancia: 0,
      placeholder: "−1",
    },
    {
      etiqueta: "(b) f(x₁) — valor de f en el máximo local",
      objetivo: 10,
      tolerancia: 0,
      placeholder: "10",
    },
    {
      etiqueta: "(c) Abscisa del punto de inflexión x₃",
      objetivo: 1,
      tolerancia: 0,
      placeholder: "1",
    },
    {
      etiqueta: "(d) f(x₂) — valor de f en el mínimo local (x₂ = 3)",
      objetivo: -22,
      tolerancia: 0,
      placeholder: "−22",
    },
  ],
  pasosGuia: [
    "(a) f'(x) = 3x² - 6x - 9 = 3(x² - 2x - 3) = 3(x-3)(x+1). Igualando a cero: x = 3 y x = -1. Puntos críticos: x = -1 y x = 3.",
    "(b) f''(x) = 6x - 6. En x = -1: f''(-1) = -6 - 6 = -12 < 0 → máximo local. f(-1) = -1 - 3 + 9 + 5 = 10. Máximo local en (-1, 10). En x = 3: f''(3) = 18 - 6 = 12 > 0 → mínimo local. f(3) = 27 - 27 - 27 + 5 = -22. Mínimo local en (3, -22).",
    "(c) Puntos de inflexión donde f'' cambia de signo: f''(x) = 6x - 6 = 0 → x = 1. Verifica cambio de signo: f''(0) = -6 < 0 y f''(2) = 6 > 0 → sí cambia de signo en x=1. f(1) = 1 - 3 - 9 + 5 = -6. Punto de inflexión en (1, -6).",
    "(d) Crecimiento: f' > 0 cuando (x+1)(x-3) > 0, es decir x < -1 o x > 3. Decrecimiento: -1 < x < 3. Cóncava hacia abajo (f'' < 0): x < 1. Cóncava hacia arriba (f'' > 0): x > 1.",
  ],
  respuestaFinal:
    "a) Puntos críticos: x = −1 (máximo local) y x = 3 (mínimo local). " +
    "b) Máximo local en (−1, 10); mínimo local en (3, −22). " +
    "c) Punto de inflexión en (1, −6). " +
    "d) Crece en x < −1 o x > 3; decrece en −1 < x < 3. Cóncava abajo para x < 1; cóncava arriba para x > 1.",
};

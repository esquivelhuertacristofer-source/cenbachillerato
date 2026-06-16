/**
 * Datos puros del reto evaluable del laboratorio de la Derivada:
 * secante → tangente (PM-V-P03).
 *
 * Reproduce VERBATIM el ejercicio ancla A2 «Derivando desde la definición:
 * el cociente de Newton» (ejercicio_matematico, practica_slug=derivada-secante-
 * tangente). El alumno captura los resultados numéricos clave de cada apartado
 * y comprueba con tolerancia; la retroalimentación (pasos guía + respuesta
 * final) es verbatim del ejercicio.
 *
 * Aritmética verificada:
 *   (a) f(x) = x² + 3x:  f'(x) = lim(h→0)[2xh+h²+3h]/h = 2x+3.
 *       Coeficiente de x → 2.  Término constante → 3.
 *   (b) f(x) = 1/x:  f'(x) = lim(h→0)[-h/(h·x(x+h))] = -1/x².
 *       Evaluado en x=1: f'(1) = -1/1² = -1.
 *   (c) f(x) = x², tangente en x=2:  m = f'(2) = 2·2 = 4.
 *       Punto de tangencia: (2, f(2)) = (2, 4).
 *       y − 4 = 4(x − 2)  →  y = 4x − 8 + 4  →  y = 4x − 4.
 *       Pendiente → 4.  Término independiente (b) → -4.
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { RetoNumericoData } from "./_reto-numerico";

// VERBATIM de PM-V-P03-A2 (ejercicio_matematico, tipo_respuesta "desarrollo").
export const RETO_A2: RetoNumericoData = {
  titulo: "Derivando desde la definición: el cociente de Newton",
  contexto:
    "Usa la definición de derivada — límite del cociente de Newton lim(h→0)[f(x+h)−f(x)]/h — para calcular las derivadas indicadas y hallar la recta tangente.",
  problema:
    "Usando la definición de derivada (límite del cociente de Newton), calcula:\n\n" +
    "(a) f'(x) si f(x) = x² + 3x\n" +
    "    Ingresa el coeficiente de x en f'(x) y el término constante.\n\n" +
    "(b) f'(x) si f(x) = 1/x\n" +
    "    Ingresa el valor de f'(1) (evalúa -1/x² en x = 1).\n\n" +
    "(c) Ecuación de la recta tangente a f(x) = x² en el punto donde x = 2.\n" +
    "    La tangente es y = mx + b. Ingresa la pendiente m y el término independiente b.",
  campos: [
    // (a) f'(x) = 2x + 3
    {
      etiqueta: "(a) Coeficiente de x en f'(x) — f(x) = x² + 3x",
      objetivo: 2,
      tolerancia: 0,
      placeholder: "2",
    },
    {
      etiqueta: "(a) Término constante en f'(x) — f(x) = x² + 3x",
      objetivo: 3,
      tolerancia: 0,
      placeholder: "3",
    },
    // (b) f'(x) = -1/x², evaluado en x = 1
    {
      etiqueta: "(b) Valor de f'(1) — f(x) = 1/x  [f'(x) = -1/x², x = 1]",
      objetivo: -1,
      tolerancia: 0,
      placeholder: "-1",
    },
    // (c) tangente a x² en x = 2: y = 4x - 4
    {
      etiqueta: "(c) Pendiente m de la tangente a x² en x = 2",
      objetivo: 4,
      tolerancia: 0,
      placeholder: "4",
    },
    {
      etiqueta: "(c) Término independiente b (y = mx + b) de la tangente",
      objetivo: -4,
      tolerancia: 0,
      placeholder: "-4",
    },
  ],
  pasosGuia: [
    "(a) f'(x) = lim(h→0) [(x+h)² + 3(x+h) - (x²+3x)] / h = lim(h→0) [x²+2xh+h²+3x+3h-x²-3x] / h = lim(h→0) [2xh+h²+3h] / h = lim(h→0) [2x+h+3] = 2x+3.",
    "(b) f'(x) = lim(h→0) [1/(x+h) - 1/x] / h = lim(h→0) [x-(x+h)] / [h·x(x+h)] = lim(h→0) [-h] / [h·x(x+h)] = lim(h→0) -1/[x(x+h)] = -1/x². En x=1: f'(1) = -1.",
    "(c) Para f(x)=x², f'(x)=2x. En x=2: pendiente m = f'(2) = 4. Punto de tangencia: (2, f(2)) = (2, 4). Ecuación punto-pendiente: y - 4 = 4(x - 2) → y = 4x - 8 + 4 → y = 4x - 4.",
    "Verificación (c): la tangente y=4x-4 pasa por (2,4): 4(2)-4=4 ✓. Es tangente porque tiene pendiente f'(2)=4 y comparte el punto (2,4) con la parábola ✓.",
  ],
  respuestaFinal:
    "(a) f'(x) = 2x+3 (coef. 2, constante 3). (b) f'(x) = −1/x²; f'(1) = −1. (c) Pendiente m = 4; tangente: y = 4x − 4 (b = −4).",
};

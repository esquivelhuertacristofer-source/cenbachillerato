/**
 * Datos puros del reto evaluable del laboratorio de Ecuaciones cuadráticas
 * (PM-III-P02).
 *
 * Reproduce VERBATIM el ejercicio ancla A2 «Resuelvo una ecuación cuadrática
 * en contexto real» (ejercicio_matematico). El alumno captura el ancho w y la
 * longitud l del terreno; la retroalimentación (pasos guía + respuesta final)
 * es verbatim del ejercicio.
 *
 * Aritmética verificada:
 *   Ecuación: w(2w + 5) = 133 → 2w² + 5w − 133 = 0
 *   a = 2, b = 5, c = −133
 *   Δ = b² − 4ac = 25 − 4(2)(−133) = 25 + 1064 = 1089
 *   √1089 = 33
 *   w = (−5 ± 33) / 4
 *     w₁ = (−5 + 33) / 4 = 28 / 4 = 7  ← válida
 *     w₂ = (−5 − 33) / 4 = −38 / 4 = −9.5  ← descartada (no puede ser negativa)
 *   Longitud: l = 2(7) + 5 = 19 m
 *   Verificación: 7 × 19 = 133 m²  ✓
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { RetoNumericoData } from "./_reto-numerico";

// VERBATIM de PM-III-P02-A2 (ejercicio_matematico, tipo_respuesta "desarrollo").
export const RETO_A2: RetoNumericoData = {
  titulo: "Resuelvo una ecuación cuadrática en contexto real",
  contexto:
    "Las ecuaciones cuadráticas modelan situaciones donde el área, el volumen o la trayectoria dependen del cuadrado de una variable. En este caso, las dimensiones de un terreno generan una ecuación de segundo grado.",
  problema:
    "Un agricultor tiene un terreno rectangular cuya longitud es 5 metros más que el doble del ancho. El área total del terreno es 133 m².\n" +
    "(a) Plantea la ecuación cuadrática que modela el problema (usa w para el ancho).\n" +
    "(b) Resuélvela usando la fórmula general.\n" +
    "(c) ¿Cuáles son las dimensiones reales del terreno? Descarta las soluciones no físicas.\n" +
    "(d) Verifica tu respuesta calculando el área con las dimensiones encontradas.",
  campos: [
    {
      etiqueta: "Ancho del terreno (w)",
      objetivo: 7,
      tolerancia: 0,
      unidad: "m",
      placeholder: "7",
    },
    {
      etiqueta: "Longitud del terreno (l = 2w + 5)",
      objetivo: 19,
      tolerancia: 0,
      unidad: "m",
      placeholder: "19",
    },
  ],
  pasosGuia: [
    "Define la variable: sea w el ancho (en metros). Entonces la longitud es 2w + 5.",
    "Plantea la ecuación de área: w·(2w + 5) = 133 → 2w² + 5w - 133 = 0.",
    "Identifica a = 2, b = 5, c = -133. Calcula el discriminante: b² - 4ac = 25 + 1064 = 1089.",
    "Aplica la fórmula: w = (-5 ± √1089) / 4 = (-5 ± 33) / 4.",
    "Obtén las dos raíces y descarta la negativa (el ancho no puede ser negativo).",
  ],
  respuestaFinal: "w = 7 m (ancho), l = 19 m (longitud). Verificación: 7 × 19 = 133 m².",
};

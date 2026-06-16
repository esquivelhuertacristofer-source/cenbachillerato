/**
 * Datos puros del reto evaluable del laboratorio Funciones de variable real
 * (PM-V-P09).
 *
 * Reproduce VERBATIM el ejercicio ancla A2 «Analizando f(x) = x³ − 3x:
 * simetría, raíces y extremos» (ejercicio_matematico, PM-V-P09-A2).
 * Los campos numéricos se extraen de los pasos_guia y la respuesta_final
 * verbatim; la tolerancia_error del ejercicio original es 0.01.
 *
 * Aritmética verificada:
 *   a) f(−x) = (−x)³ − 3(−x) = −x³ + 3x = −(x³ − 3x) = −f(x) → IMPAR.
 *      Para comprometerse a un campo numérico: f(−1) = (−1)³ − 3(−1) = −1 + 3 = 2 ✓
 *      y f(1)  = 1³ − 3(1) = 1 − 3 = −2 ✓  →  f(−1) = −f(1) → impar confirmado.
 *   b) x³ − 3x = x(x²−3)=0 → x=0, x=±√3. √3 ≈ 1.7320508… → 1.73 (2 dec). ✓
 *      Número total de raíces: 3 ✓
 *   c) f'(x)=3x²−3=0 → x=±1.
 *      f(−1) = (−1)³ − 3(−1) = −1+3 = 2 → MÁXIMO local (−1, 2) ✓
 *      f( 1) = 1³ − 3(1)    = 1−3 = −2 → MÍNIMO local (1, −2) ✓
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { RetoNumericoData } from "./_reto-numerico";

// VERBATIM de PM-V-P09-A2 (ejercicio_matematico).
export const RETO_A2: RetoNumericoData = {
  titulo: "Analizando f(x) = x³ − 3x: simetría, raíces y extremos",

  // Verbatim del campo "contexto" de A2.
  contexto:
    "Los tres incisos recorren el contenido formativo de la progresión: la simetría (a) con las funciones pares e impares, las raíces (b) con la lectura de la gráfica, y los extremos (c) con los máximos y mínimos locales. En el laboratorio 3D la función está en el catálogo y los rasgos y el reflejo se marcan en vivo sobre el plano cartesiano.",

  // Verbatim del campo "problema" de A2 (enunciado de los incisos).
  problema:
    "Dada la función f(x) = x³ − 3x, analiza su gráfica:\n\n" +
    "a) SIMETRÍA. Calcula f(−x) y compáralo con f(x). ¿La función es par, impar o ninguna? ¿Qué simetría tiene su gráfica?\n\n" +
    "b) RAÍCES. Halla los valores de x para los que f(x) = 0 (dónde la curva cruza el eje X).\n\n" +
    "c) EXTREMOS. La función sube, baja y vuelve a subir. ¿Tiene máximos o mínimos locales y en qué puntos?",

  // Campos numéricos extraídos de los pasos_guia y respuesta_final verbatim.
  // tolerancia_error del ejercicio original = 0.01.
  campos: [
    {
      etiqueta: "a) f(−1) — verifica la simetría: ¿cuánto vale f(−1)?",
      objetivo: 2,
      tolerancia: 0,
      placeholder: "2",
    },
    {
      etiqueta: "b) Número total de raíces de f(x) = x³ − 3x",
      objetivo: 3,
      tolerancia: 0,
      placeholder: "3",
    },
    {
      etiqueta: "b) Raíz positiva no nula (√3, aprox. 2 decimales)",
      objetivo: 1.73,
      tolerancia: 0.01,
      placeholder: "1.73",
    },
    {
      etiqueta: "c) Coordenada y del máximo local (en x = −1)",
      objetivo: 2,
      tolerancia: 0,
      placeholder: "2",
    },
    {
      etiqueta: "c) Coordenada y del mínimo local (en x = 1)",
      objetivo: -2,
      tolerancia: 0,
      placeholder: "−2",
    },
  ],

  // Verbatim de pasos_guia de A2.
  pasosGuia: [
    "a) f(−x) = (−x)³ − 3(−x) = −x³ + 3x = −(x³ − 3x) = −f(x). Como f(−x) = −f(x), la función es IMPAR: su gráfica es simétrica respecto al origen (gira 180° alrededor de (0,0)).",
    "b) x³ − 3x = x(x² − 3) = 0 ⇒ x = 0, o x² = 3 ⇒ x = ±√3 ≈ ±1.73. Tres raíces: −√3, 0 y √3.",
    "c) Derivando, f'(x) = 3x² − 3 = 0 ⇒ x = ±1. En x = −1 hay un MÁXIMO local en (−1, 2) y en x = 1 un MÍNIMO local en (1, −2).",
  ],

  // Verbatim de respuesta_final de A2.
  respuestaFinal:
    "a) Es IMPAR (f(−x) = −f(x)), simétrica respecto al origen. b) Raíces en −√3 ≈ −1.73, 0 y √3 ≈ 1.73. c) Máximo local (−1, 2) y mínimo local (1, −2).",
};

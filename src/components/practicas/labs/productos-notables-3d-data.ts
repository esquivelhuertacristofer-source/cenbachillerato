/**
 * Datos puros del reto evaluable del laboratorio de Productos notables
 * (PM-II-P08).
 *
 * Reproduce VERBATIM el ejercicio ancla A8 «Ejercicio — Productos notables y
 * operaciones con polinomios» (ejercicio_matematico, tipo_respuesta
 * "algebraica"). Como la respuesta es algebraica en x, cada inciso se evalúa
 * por su valor numérico clave: el alumno captura el COEFICIENTE / término
 * constante que define cada desarrollo, y la respuesta final algebraica se
 * conserva verbatim. El nombre del export se mantiene como RETO_A2 por
 * convención del patrón compartido; la fuente es la actividad A8.
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { RetoNumericoData } from "./_reto-numerico";

// VERBATIM de PM-II-P08-A8 (ejercicio_matematico, tipo_respuesta "algebraica").
export const RETO_A2: RetoNumericoData = {
  titulo: "Productos notables y operaciones con polinomios",
  contexto:
    "Los productos notables permiten desarrollar productos sin multiplicar término a término: el binomio al cuadrado (a + b)² = a² + 2ab + b², y los binomios conjugados (a + b)(a − b) = a² − b². Al sumar polinomios se agrupan los términos semejantes.",
  problema:
    "Una plaza cuadrada de la comunidad mide (x + 5) metros por lado. Resuelve:\n" +
    "(a) Área de la plaza, desarrollando el binomio al cuadrado: (x + 5)². Resultado: x² + ___·x + ___ → captura el coeficiente de x y el término constante.\n" +
    "(b) Producto de binomios conjugados: (x + 5)(x − 5) = x² − ___ → captura el término constante (sin signo).\n" +
    "(c) Suma los polinomios: (x² + 2x − 1) + (3x² − x + 4) = ___·x² + ___·x + ___ → captura los tres coeficientes.",
  campos: [
    { etiqueta: "(a) Coeficiente de x en (x + 5)²", objetivo: 10, tolerancia: 0, placeholder: "10" },
    { etiqueta: "(a) Término constante en (x + 5)²", objetivo: 25, tolerancia: 0, placeholder: "25" },
    { etiqueta: "(b) Término constante en (x + 5)(x − 5) = x² − ___", objetivo: 25, tolerancia: 0, placeholder: "25" },
    { etiqueta: "(c) Coeficiente de x² en la suma", objetivo: 4, tolerancia: 0, placeholder: "4" },
    { etiqueta: "(c) Coeficiente de x en la suma", objetivo: 1, tolerancia: 0, placeholder: "1" },
    { etiqueta: "(c) Término constante en la suma", objetivo: 3, tolerancia: 0, placeholder: "3" },
  ],
  pasosGuia: [
    "(a) (x + 5)² = x² + 2·(x)·(5) + 5² = x² + 10x + 25.",
    "(b) Conjugados: (x + 5)(x − 5) = x² − 5² = x² − 25 (el término del medio se cancela).",
    "(c) Agrupa semejantes: x² + 3x² = 4x²; 2x − x = x; −1 + 4 = 3, así que el resultado es 4x² + x + 3.",
  ],
  respuestaFinal: "(a) x² + 10x + 25; (b) x² − 25; (c) 4x² + x + 3",
};

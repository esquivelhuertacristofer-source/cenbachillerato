/**
 * Datos puros del reto evaluable del laboratorio de Factorización: el modelo de
 * área (PM-II-P03).
 *
 * Reproduce VERBATIM el ejercicio ancla A2 «Factorizo polinomios paso a paso»
 * (ejercicio_matematico). El polinomio a factorizar es algebraico; para el reto
 * NUMÉRICO el alumno captura los coeficientes/términos clave de cada
 * factorización (los números que debe hallar al aplicar cada técnica). La
 * retroalimentación (pasos guía + respuesta final) es verbatim del ejercicio.
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { RetoNumericoData } from "./_reto-numerico";

// VERBATIM de PM-II-P03-A2 (ejercicio_matematico, tipo_respuesta "algebraica").
export const RETO_A2: RetoNumericoData = {
  titulo: "Factorizo polinomios paso a paso",
  contexto: "La factorización permite simplificar fracciones algebraicas y resolver ecuaciones cuadráticas con facilidad.",
  problema:
    "Factoriza completamente cada polinomio indicando la técnica utilizada:\n" +
    "(a) 6x³ + 9x²\n" +
    "(b) x² - 25\n" +
    "(c) x² + 6x + 9\n" +
    "(d) x² - 7x + 12",
  campos: [
    { etiqueta: "(a) Factor común: 6x³ + 9x² = ___ · x²(2x + 3). Escribe el número.", objetivo: 3, tolerancia: 0, placeholder: "3" },
    { etiqueta: "(b) Diferencia de cuadrados: x² − 25 = (x + ___)(x − ___). Escribe el número.", objetivo: 5, tolerancia: 0, placeholder: "5" },
    { etiqueta: "(c) Trinomio cuadrado perfecto: x² + 6x + 9 = (x + ___)². Escribe el número.", objetivo: 3, tolerancia: 0, placeholder: "3" },
    { etiqueta: "(d) Trinomio x² − 7x + 12 = (x − ___)(x − ___). Escribe el MAYOR de los dos.", objetivo: 4, tolerancia: 0, placeholder: "4" },
  ],
  pasosGuia: [
    "(a) Identifica el factor común: ¿qué número y potencia de x divide a ambos términos?",
    "(b) Reconoce el patrón a²-b²: ¿cuál es a y cuál es b?",
    "(c) Reconoce el trinomio cuadrado perfecto: (a+b)² = a² + 2ab + b²",
    "(d) Busca dos números cuya suma sea -7 y cuyo producto sea 12.",
  ],
  respuestaFinal: "(a) 3x²(2x+3); (b) (x+5)(x-5); (c) (x+3)²; (d) (x-3)(x-4)",
};

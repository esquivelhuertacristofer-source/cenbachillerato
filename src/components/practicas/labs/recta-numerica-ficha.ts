/**
 * Datos de la Ficha Teórica del laboratorio de Recta numérica (PM-I-P02).
 *
 * Contenido VERBATIM de la actividad ancla A1 «Números que usamos todos los
 * días» (lectura). La progresión P02 no tiene actividad de glosario; los
 * conceptos centrales se formulan a partir de la lectura A1 (sin inventar
 * datos), y el reto evaluable vive en recta-numerica-data.ts (A2).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const RECTA_NUMERICA_FICHA: FichaTeoricaData = {
  ancla: "PM-I · P02 · A1 — Números que usamos todos los días",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "Los números que usamos en matemáticas no son todos del mismo tipo. Los números naturales (1, 2, 3, 4...) son los que usamos para contar objetos concretos. Los números enteros incluyen también los números negativos (-3, -2, -1, 0) y nos permiten representar situaciones como temperaturas bajo cero, deudas o pisos de un edificio bajo tierra. Los números racionales son los que pueden expresarse como una fracción de dos enteros, e incluyen decimales finitos y periódicos.",
    "Cada conjunto de números amplía las posibilidades de lo que podemos calcular. Con solo los naturales no podríamos representar deudas. Con solo los enteros no podríamos calcular medidas exactas que requieren partes (como 1.5 litros o 3/4 de taza). Con los racionales podemos hacer casi cualquier cálculo de la vida cotidiana.",
    "Las operaciones básicas (suma, resta, multiplicación y división) funcionan de manera diferente en cada conjunto. Por ejemplo, dividir dos números naturales no siempre da un natural: 7 ÷ 2 = 3.5, que es racional. Multiplicar dos números negativos da un número positivo: (-3) × (-4) = 12. Conocer estas reglas y saber cuándo aplicarlas es fundamental para resolver problemas reales con precisión.",
  ],

  objetivos: [
    "Clasificar los números en naturales, enteros y racionales según la situación.",
    "Ubicar un número sobre la recta según su signo y su distancia al cero.",
    "Reconocer el opuesto −a y el valor absoluto |a| de un número.",
    "Sumar y restar enteros como saltos sobre la recta numérica.",
    "Resolver el ejercicio de operaciones con enteros en contexto (A2).",
  ],

  materiales: [
    { nombre: "Recta numérica 3D", detalle: "Ubica cualquier número entre −10 y +10 según su signo", icono: "fa-ruler-horizontal" },
    { nombre: "Contextos reales", detalle: "Termómetro, altitud, dinero y número puro", icono: "fa-temperature-half" },
    { nombre: "Opuesto y valor absoluto", detalle: "Visualiza −a y |a| como distancia al cero", icono: "fa-left-right" },
    { nombre: "Modo operar", detalle: "Sumar = salto a la derecha; restar = salto a la izquierda", icono: "fa-plus-minus" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Números naturales (N)", definicion: "Los que usamos para contar objetos concretos: 1, 2, 3, 4..." },
    { termino: "Números enteros (Z)", definicion: "Incluyen también los negativos (−3, −2, −1, 0): permiten representar temperaturas bajo cero, deudas o pisos bajo tierra." },
    { termino: "Números racionales (Q)", definicion: "Los que pueden expresarse como fracción de dos enteros; incluyen decimales finitos y periódicos (como 1.5 o 3/4)." },
    { termino: "Opuesto (−a)", definicion: "El número que está a la misma distancia del cero, pero del otro lado de la recta." },
    { termino: "Valor absoluto (|a|)", definicion: "La distancia de un número al cero; siempre es positiva o cero." },
    { termino: "Regla de los signos", definicion: "Multiplicar dos números negativos da un número positivo: (−3) × (−4) = 12." },
  ],

  // La progresión P02 no tiene actividad de glosario; los términos clave
  // viven en "conceptos" (formulados desde la lectura A1).
  glosario: [],

  aplicaciones: [
    "Representar deudas y ganancias en la economía familiar con números positivos y negativos.",
    "Medir cambios de temperatura, donde el cero no es el menor valor (existen los grados bajo cero).",
    "Ubicar pisos de un edificio: el sótano se representa con números negativos.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1, PM-I-P02.",
};

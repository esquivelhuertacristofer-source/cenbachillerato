/**
 * Ficha teórica del laboratorio «Álgebra con mosaicos».
 * Anclada verbatim a PM-II «Introducción al álgebra» (lecturas y ejercicios A2).
 */

import type { FichaTeoricaData } from "./_ficha";

export const ALGEBRA_TILES_FICHA: FichaTeoricaData = {
  ancla:
    "PM-II · «Introducción al álgebra» — Lenguaje algebraico, clasificación de expresiones y operaciones con monomios y binomios (P01–P03)",
  marcoTeorico: [
    "El lenguaje algebraico usa letras (variables) y símbolos para representar cantidades desconocidas o generales. Traducir «el doble de un número más tres» a 2x + 3 es escribir en lenguaje algebraico.",
    "Un término algebraico está formado por un coeficiente (el número), una variable (la letra) y un exponente. Cuando el coeficiente es 1 no se escribe: x² significa 1x².",
    "Las expresiones se clasifican por su número de términos: monomio (1), binomio (2), trinomio (3) y polinomio (4 o más). El grado es el mayor exponente de la variable.",
    "Solo se pueden sumar o restar TÉRMINOS SEMEJANTES, es decir, los que tienen la misma variable elevada al mismo exponente: 3x² + 5x² = 8x², pero x² y x no se combinan.",
    "Multiplicar dos binomios equivale a calcular el área de un rectángulo de lados (x + a) y (x + b): se obtiene x² + (a + b)x + a·b. Los mosaicos algebraicos hacen visible esa área.",
    "Los mosaicos algebraicos (algebra tiles) son piezas geométricas: x² es un cuadrado de lado x, x es una tira de largo x y ancho 1, y la unidad es un cuadrito de lado 1.",
  ],
  objetivos: [
    "Traducir frases verbales al lenguaje algebraico y evaluarlas para un valor de x",
    "Identificar coeficiente, variable y exponente en un término",
    "Clasificar expresiones como monomio, binomio, trinomio o polinomio y leer su grado",
    "Combinar términos semejantes para sumar y restar expresiones",
    "Multiplicar binomios con el modelo de área de mosaicos",
  ],
  materiales: [
    { nombre: "Mosaicos algebraicos x², x y unidad", detalle: "Piezas geométricas que representan cada tipo de término.", icono: "fa-shapes" },
    { nombre: "Plano de trabajo", detalle: "Tablero donde se acomodan y agrupan los mosaicos.", icono: "fa-table-cells" },
    { nombre: "Tablero de área", detalle: "Rectángulo de lados (x + a) y (x + b) para multiplicar binomios.", icono: "fa-vector-square" },
    { nombre: "Marcadores de signo", detalle: "Color azul/verde/dorado para positivos; rojo para negativos.", icono: "fa-palette" },
  ],
  conceptos: [
    { termino: "Variable", definicion: "Letra que representa una cantidad desconocida o variable." },
    { termino: "Coeficiente", definicion: "Número que multiplica a la variable e indica cuántas veces se tiene." },
    { termino: "Término semejante", definicion: "Término con la misma variable y mismo exponente que otro; solo entre ellos se suma o resta." },
    { termino: "Grado", definicion: "El mayor exponente de la variable presente en la expresión." },
    { termino: "Modelo de área", definicion: "Representar un producto como el área de un rectángulo dividido en mosaicos." },
  ],
  glosario: [
    { termino: "Monomio", definicion: "Expresión de un solo término, p. ej. 7x³." },
    { termino: "Binomio", definicion: "Expresión de dos términos, p. ej. 3x + 7." },
    { termino: "Trinomio", definicion: "Expresión de tres términos, p. ej. x² + 4x − 2." },
    { termino: "Polinomio", definicion: "Expresión de cuatro o más términos." },
    { termino: "Distributiva", definicion: "Propiedad que reparte la multiplicación: a(b + c) = ab + ac." },
    { termino: "Términos semejantes", definicion: "Misma parte literal (variable y exponente); se pueden combinar." },
  ],
  aplicaciones: [
    "Calcular el área de un lote del INFONAVIT cuyas medidas dependen de una variable: x·(2x + 5) = 2x² + 5x.",
    "Generalizar el costo de n unidades de un producto con una fórmula algebraica antes de conocer la cantidad.",
    "Modelar trayectorias y áreas en ingeniería y arquitectura con expresiones de segundo grado.",
    "Programar fórmulas en hojas de cálculo, que son lenguaje algebraico aplicado.",
  ],
  fuente:
    "MCCEMS 2025 — Pensamiento Matemático II «Introducción al álgebra». Anclas: PM-II-P01-A1/A2 (lenguaje y patrones), PM-II-P02-A1/A2 (monomios, clasificación, operaciones).",
};

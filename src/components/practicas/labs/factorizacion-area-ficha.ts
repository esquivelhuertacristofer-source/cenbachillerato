/**
 * Datos de la Ficha Teórica del laboratorio de Factorización: el modelo de
 * área (PM-II-P03).
 *
 * Contenido VERBATIM de la actividad ancla A1 «Factorizar: descomponer para
 * comprender mejor» (lectura) y del glosario A5 «Glosario: factorización y
 * aplicaciones» (glosario_interactivo). El reto evaluable vive en
 * factorizacion-area-data.ts (A2).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const FACTORIZACION_AREA_FICHA: FichaTeoricaData = {
  ancla: "PM-II · P03 · A1 — Factorizar: descomponer para comprender mejor",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "Factorizar un polinomio es encontrar los factores cuya multiplicación produce ese polinomio. Es el proceso inverso a la multiplicación algebraica. Por ejemplo, x² + 5x + 6 puede factorizarse como (x + 2)(x + 3), porque al multiplicar esos dos binomios obtenemos el polinomio original.",
    "¿Para qué sirve factorizar? En primer lugar, para simplificar expresiones algebraicas. En segundo lugar, para resolver ecuaciones cuadráticas con mayor facilidad. En tercer lugar, para encontrar los ceros de una función, que tienen muchas aplicaciones en física, economía e ingeniería.",
    "Las técnicas básicas de factorización son: (1) factor común (sacar afuera el factor que comparten todos los términos: 3x + 6 = 3(x + 2)), (2) diferencia de cuadrados (a² - b² = (a+b)(a-b)), (3) trinomio cuadrado perfecto (a² + 2ab + b² = (a+b)²), y (4) trinomio de la forma x² + bx + c (buscar dos números cuya suma sea b y cuyo producto sea c).",
  ],

  // Objetivos — derivados fielmente de la lectura A1.
  objetivos: [
    "Comprender que factorizar es el proceso inverso a la multiplicación algebraica.",
    "Aplicar el factor común para extraer el factor que comparten todos los términos.",
    "Reconocer y factorizar la diferencia de cuadrados a² − b² = (a + b)(a − b).",
    "Identificar el trinomio cuadrado perfecto a² + 2ab + b² = (a + b)².",
    "Factorizar trinomios x² + bx + c buscando dos números cuya suma sea b y cuyo producto sea c (A2).",
  ],

  materiales: [
    { nombre: "Modelo de área 3D", detalle: "El trinomio es el área de un rectángulo; los factores son sus dos lados", icono: "fa-table-cells-large" },
    { nombre: "Lados ajustables (p y q)", detalle: "Mueve los lados x + p y x + q y observa cómo cambia el trinomio", icono: "fa-arrows-left-right-to-line" },
    { nombre: "Suma y producto", detalle: "Comprueba en vivo que b = p + q y c = p·q", icono: "fa-plus-minus" },
    { nombre: "Panel de las 4 técnicas", detalle: "Factor común, diferencia de cuadrados, trinomio cuadrado perfecto y x² + bx + c", icono: "fa-list-check" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Factorizar", definicion: "Encontrar los factores cuya multiplicación produce un polinomio; es el proceso inverso a la multiplicación algebraica." },
    { termino: "Factor común", definicion: "Técnica que saca afuera el factor que comparten todos los términos: 3x + 6 = 3(x + 2)." },
    { termino: "Diferencia de cuadrados", definicion: "Patrón a² − b² que se factoriza como (a + b)(a − b)." },
    { termino: "Trinomio cuadrado perfecto", definicion: "Patrón a² + 2ab + b² que se factoriza como (a + b)²." },
    { termino: "Trinomio x² + bx + c", definicion: "Se factoriza buscando dos números cuya suma sea b y cuyo producto sea c." },
  ],

  // Glosario — VERBATIM del glosario A5 (PM-II-P03-A5).
  glosario: [
    { termino: "Factorizar", definicion: "Escribir una expresión como producto de factores. Ejemplo: 6x² + 9x = 3x(2x + 3)." },
    { termino: "Factor común", definicion: "Factor compartido por todos los términos que se extrae al factorizar. Ejemplo: en 4x + 8 el factor común es 4: 4(x + 2)." },
    { termino: "Diferencia de cuadrados", definicion: "Expresión a² − b² que se factoriza como (a + b)(a − b). Ejemplo: x² − 9 = (x + 3)(x − 3)." },
    { termino: "Trinomio cuadrado perfecto", definicion: "Trinomio que es el cuadrado de un binomio. Ejemplo: x² + 6x + 9 = (x + 3)²." },
    { termino: "Porcentaje", definicion: "Proporción referida a 100, útil en descuentos y aumentos. Ejemplo: 20% de 100 es 20." },
  ],

  aplicaciones: [
    "Simplificar expresiones algebraicas.",
    "Resolver ecuaciones cuadráticas con mayor facilidad.",
    "Encontrar los ceros de una función, con aplicaciones en física, economía e ingeniería.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1, PM-II-P03.",
};

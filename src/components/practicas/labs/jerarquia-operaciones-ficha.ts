/**
 * Ficha Teórica del laboratorio «Jerarquía de operaciones» (PM-I, progresión 7;
 * actividades PM-I-P10).
 *
 * Marco teórico: lectura A1 «El orden importa: jerarquía de operaciones»,
 * VERBATIM (un párrafo, partido en sus oraciones). La progresión no trae
 * glosario interactivo: el glosario es propio del laboratorio.
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO_LAB, LECTURA_A1, FUENTE, TITULO_A1 } from "./jerarquia-operaciones-data";

export const JERARQUIA_OPERACIONES_FICHA: FichaTeoricaData = {
  ancla: `PM-I · P10 · A1 — ${TITULO_A1}`,

  marcoTeorico: LECTURA_A1,

  objetivos: [
    "Aplicar el orden de la jerarquía: agrupación, potencias y raíces, multiplicación y división, suma y resta.",
    "Resolver operaciones del mismo nivel de izquierda a derecha.",
    "Explicar qué resultado equivocado produce cada operación hecha fuera de orden.",
    "Distinguir −3² de (−3)² y reconocer por qué (a + b)² no es a² + b².",
    "Reconocer que una calculadora básica, una hoja de cálculo o una persona pueden leer distinto la misma escritura, y quitar la ambigüedad con paréntesis.",
    "Operar con números reales —enteros con signo, fracciones, decimales y raíces— y ubicar el resultado en la recta numérica.",
  ],

  materiales: [
    { nombre: "Torre de pasos", detalle: "Fichas con los números y signos; cada paso correcto baja un renglón.", icono: "fa-layer-group" },
    { nombre: "Escalera de la jerarquía", detalle: "Cuatro escalones que se encienden según la operación que se hace.", icono: "fa-stairs" },
    { nombre: "Árbol de la expresión", detalle: "La estructura de la expresión: cada operación espera a sus dos operandos.", icono: "fa-diagram-project" },
    { nombre: "Calculadoras, hoja de cálculo y cuadernos", detalle: "Máquinas y personas que leen la misma expresión con reglas distintas.", icono: "fa-calculator" },
    { nombre: "Recta numérica", detalle: "Donde cae el resultado de cada expresión que construyes.", icono: "fa-ruler-horizontal" },
  ],

  conceptos: [
    { termino: "Orden de la jerarquía", definicion: "1) Agrupación ( ) [ ] { }; 2) potencias y raíces; 3) multiplicación y división; 4) suma y resta." },
    { termino: "Mismo nivel, de izquierda a derecha", definicion: "18 ÷ 3 × 2 = 6 × 2 = 12. Si se multiplicara primero daría 18 ÷ 6 = 3." },
    { termino: "Árbol de operaciones", definicion: "Toda expresión tiene una estructura: una operación solo puede hacerse cuando sus dos lados ya son números. La jerarquía y los paréntesis deciden esa estructura." },
    { termino: "El exponente y el signo", definicion: "El exponente afecta solo a lo que tiene pegado: −3² = −(3²) = −9, mientras que (−3)² = 9." },
    { termino: "No se reparten", definicion: "(10 − 6)² = 4² = 16, pero 10² − 6² = 64; √(9 + 16) = √25 = 5, pero √9 + √16 = 7." },
    { termino: "Restar es sumar el opuesto", definicion: "10 − 4 + 2 = 10 + (−4) + 2 = 8: escrita como suma, el orden de los sumandos ya no cambia el resultado." },
    { termino: "Ambigüedad", definicion: "6 ÷ 2(1 + 2) da 9 o 1 según cómo se trate la multiplicación sin signo. Unos paréntesis de más evitan la discusión: 6 ÷ [2 × (1 + 2)] = 1." },
  ],

  glosario: GLOSARIO_LAB,

  aplicaciones: [
    "Calcular una cuenta compartida: (240 + 60) ÷ 5 = 60 pesos por persona, no 240 + 60 ÷ 5 = 252.",
    "Escribir fórmulas en una hoja de cálculo sabiendo que =-3^2 da 9 y =-(3^2) da −9.",
    "Usar una calculadora básica (ejecución inmediata) tecleando primero las multiplicaciones: 3 × 4 + 2.",
    "Programar: los lenguajes de programación también tienen una tabla de precedencia de operadores.",
  ],

  fuente: FUENTE,
};

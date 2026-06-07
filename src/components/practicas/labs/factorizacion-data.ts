/**
 * Datos para el laboratorio de Factorización — el modelo de área (PM-II-P03-A2).
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabFactorizacion.tsx) y la escena 3D (FactorizacionScene.tsx) sin arrastrar
 * three.js al bundle del shell.
 *
 * Idea pedagógica (MCCEMS 2025 — PM-II, Pensamiento algebraico):
 * un trinomio x² + bx + c es el ÁREA de un rectángulo, y factorizarlo es hallar
 * sus dos LADOS. Con "algebra tiles":
 *   · una pieza x²  = un cuadrado de lado x
 *   · cada pieza x  = un rectángulo x por 1
 *   · cada pieza 1  = un cuadradito 1 por 1
 * Al acomodarlas en un rectángulo de lados (x + p) y (x + q) se ve que
 *   (x + p)(x + q) = x² + (p + q)x + p·q,
 * es decir b = p + q  y  c = p·q  ("suma y producto"). Cuando p = q el
 * rectángulo es un CUADRADO → trinomio cuadrado perfecto (x + p)².
 */

/** Longitud con que se dibuja la incógnita x (en unidades de las piezas "1").
 *  No es un entero a propósito: así x nunca "cuadra" con un número de unidades
 *  y se entiende que x es una longitud desconocida, no un número fijo. */
export const XLEN = 3.2;

// Rango de los deslizadores p y q (los factores x+p, x+q). Enteros.
export const P_MIN = 1;
export const P_MAX = 6;
export const P_STEP = 1;

export interface Escenario {
  key: string;
  titulo: string;
  icono: string; // Font Awesome 6 (solid, free)
  contexto: string;
  p: number;
  q: number;
}

export const ESCENARIOS: Escenario[] = [
  {
    key: "perfecto",
    titulo: "Trinomio cuadrado perfecto",
    icono: "fa-square",
    contexto:
      "x² + 6x + 9 = (x + 3)². Cuando los dos lados son iguales (p = q), el rectángulo es un cuadrado perfecto. Es exactamente el inciso (c) de tu actividad.",
    p: 3,
    q: 3,
  },
  {
    key: "tres-cuatro",
    titulo: "Dos factores distintos",
    icono: "fa-table-cells-large",
    contexto:
      "x² + 7x + 12 = (x + 3)(x + 4). Busca dos números cuya suma sea 7 y cuyo producto sea 12: son 3 y 4. (El inciso (d) usa los mismos números con signo negativo.)",
    p: 3,
    q: 4,
  },
  {
    key: "dos-seis",
    titulo: "Suma 8, producto 12",
    icono: "fa-table-cells",
    contexto:
      "x² + 8x + 12 = (x + 2)(x + 6). Mismos 12 de producto, pero otra pareja: 2 y 6. Cambian las dimensiones del rectángulo, no su 'tipo'.",
    p: 2,
    q: 6,
  },
  {
    key: "uno-cinco",
    titulo: "Un lado muy delgado",
    icono: "fa-ruler-combined",
    contexto:
      "x² + 6x + 5 = (x + 1)(x + 5). Con p = 1 el rectángulo queda largo y angosto: una sola fila de unidades. Aun así, sus lados son los factores.",
    p: 1,
    q: 5,
  },
];

/** Las 4 técnicas de factorización que cubre esta actividad (panel de referencia). */
export interface Tecnica {
  etiqueta: string; // (a), (b), ...
  nombre: string;
  polinomio: string;
  factorizado: string;
  pista: string;
  interactivo: boolean; // ¿se puede ver en vivo en el modelo de área de arriba?
}

export const TECNICAS: Tecnica[] = [
  {
    etiqueta: "(a)",
    nombre: "Factor común",
    polinomio: "6x³ + 9x²",
    factorizado: "3x²(2x + 3)",
    pista: "¿Qué número y potencia de x divide a ambos términos? Aquí, 3x².",
    interactivo: false,
  },
  {
    etiqueta: "(b)",
    nombre: "Diferencia de cuadrados",
    polinomio: "x² − 25",
    factorizado: "(x + 5)(x − 5)",
    pista: "a² − b² = (a + b)(a − b). Aquí a = x y b = 5.",
    interactivo: false,
  },
  {
    etiqueta: "(c)",
    nombre: "Trinomio cuadrado perfecto",
    polinomio: "x² + 6x + 9",
    factorizado: "(x + 3)²",
    pista: "a² + 2ab + b² = (a + b)². El rectángulo es un cuadrado de lado x + 3.",
    interactivo: true,
  },
  {
    etiqueta: "(d)",
    nombre: "Trinomio x² + bx + c",
    polinomio: "x² − 7x + 12",
    factorizado: "(x − 3)(x − 4)",
    pista: "Dos números con suma −7 y producto 12: −3 y −4 (el modelo de área usa la versión positiva).",
    interactivo: true,
  },
];

/** Coeficientes del trinomio desarrollado (x + p)(x + q) = x² + b·x + c. */
export const desarrolla = (p: number, q: number) => ({ b: p + q, c: p * q });

/** Cadena de la forma factorizada: (x + p)(x + q), o (x + p)² si p = q. */
export const formaFactorizada = (p: number, q: number) =>
  p === q ? `(x + ${p})²` : `(x + ${p})(x + ${q})`;

/** Cadena de la forma desarrollada: x² + b x + c. */
export const formaDesarrollada = (p: number, q: number) => {
  const { b, c } = desarrolla(p, q);
  return `x² + ${b}x + ${c}`;
};

/**
 * Datos para el laboratorio de Productos notables — área y volumen
 * (PM-II-P08-A8, "Ejercicio — Productos notables y operaciones con polinomios").
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabProductos.tsx) y la escena 3D (ProductosScene.tsx).
 *
 * Idea pedagógica (MCCEMS 2025 — PM-II, productos notables):
 * un producto notable no se memoriza, se VE. El binomio al cuadrado es el área
 * de un cuadrado de lado (a + b); el binomio al cubo es el volumen de un cubo
 * de arista (a + b); los binomios conjugados son un cuadrado al que se le quita
 * otro cuadrado. Descomponer la figura da, pieza por pieza, cada término:
 *   (a + b)²        = a² + 2ab + b²            (cuadrado, 4 piezas)
 *   (a + b)³        = a³ + 3a²b + 3ab² + b³    (cubo, 8 piezas)
 *   (a + b)(a − b)  = a² − b²                  (diferencia de cuadrados)
 */

export type Modo = "cuadrado" | "cubo" | "conjugados";

export interface ModoInfo {
  key: Modo;
  titulo: string;
  icono: string; // Font Awesome 6 (solid, free)
  identidad: string; // identidad simbólica
  piezas: string; // descripción de las piezas
  descripcion: string;
}

export const MODOS: ModoInfo[] = [
  {
    key: "cuadrado",
    titulo: "Binomio al cuadrado",
    icono: "fa-square",
    identidad: "(a + b)² = a² + 2ab + b²",
    piezas: "1 cuadrado a², 2 rectángulos ab, 1 cuadrado b²",
    descripcion: "El área de un cuadrado de lado (a + b) se parte en cuatro piezas. El término del medio 2ab son los dos rectángulos: por eso aparece el doble.",
  },
  {
    key: "cubo",
    titulo: "Binomio al cubo",
    icono: "fa-cube",
    identidad: "(a + b)³ = a³ + 3a²b + 3ab² + b³",
    piezas: "1 cubo a³, 3 losas a²b, 3 columnas ab², 1 cubo b³",
    descripcion: "El volumen de un cubo de arista (a + b) se parte en ocho piezas. Hay 3 losas a²b y 3 columnas ab²: por eso los coeficientes son 3. Esto es imposible de ver en 2D.",
  },
  {
    key: "conjugados",
    titulo: "Binomios conjugados",
    icono: "fa-square-minus",
    identidad: "(a + b)(a − b) = a² − b²",
    piezas: "Un cuadrado a² al que se le quita un cuadrado b²",
    descripcion: "A un cuadrado de área a² se le recorta un cuadrado de área b². Lo que queda se reacomoda en un rectángulo de lados (a + b) y (a − b): el término del medio se cancela.",
  },
];

/** Rangos de las aristas (longitudes en el mundo). */
export const A_MIN = 1;
export const A_MAX = 4;
export const A_STEP = 0.5;
export const B_MIN = 0.5;
export const B_MAX = 3;
export const B_STEP = 0.5;

/** (a + b)² descompuesto. */
export const cuadrado = (a: number, b: number) => ({
  a2: a * a,
  dosAB: 2 * a * b,
  b2: b * b,
  total: (a + b) * (a + b),
});

/** (a + b)³ descompuesto. */
export const cubo = (a: number, b: number) => ({
  a3: a * a * a,
  tresA2B: 3 * a * a * b,
  tresAB2: 3 * a * b * b,
  b3: b * b * b,
  total: (a + b) * (a + b) * (a + b),
});

/** (a + b)(a − b) = a² − b². */
export const conjugados = (a: number, b: number) => ({
  a2: a * a,
  b2: b * b,
  resultado: a * a - b * b,
  ladoLargo: a + b,
  ladoCorto: a - b,
});

/** Tipo de pieza de un cubo según cuántas dimensiones usan b (0..3). */
export type TipoPieza = "a3" | "a2b" | "ab2" | "b3";
export const TIPO_POR_UNOS: Record<number, TipoPieza> = {
  0: "a3",
  1: "a2b",
  2: "ab2",
  3: "b3",
};

export const ETIQUETA_PIEZA: Record<TipoPieza, string> = {
  a3: "a³",
  a2b: "a²b",
  ab2: "ab²",
  b3: "b³",
};

/** Formatea un número con coma decimal es-MX y "−" tipográfico. */
export const fmtNum = (n: number, dec = 2) => {
  const r = Math.round(n * 100) / 100;
  const s = r.toLocaleString("es-MX", { maximumFractionDigits: dec });
  return s.replace("-", "−");
};

/** Construye una cadena tipo "a² + 2ab + b²" con valores numéricos sustituidos. */
export const numerico = (modo: Modo, a: number, b: number): string => {
  if (modo === "cuadrado") {
    const c = cuadrado(a, b);
    return `${fmtNum(c.a2)} + ${fmtNum(c.dosAB)} + ${fmtNum(c.b2)} = ${fmtNum(c.total)}`;
  }
  if (modo === "cubo") {
    const c = cubo(a, b);
    return `${fmtNum(c.a3)} + ${fmtNum(c.tresA2B)} + ${fmtNum(c.tresAB2)} + ${fmtNum(c.b3)} = ${fmtNum(c.total)}`;
  }
  const c = conjugados(a, b);
  return `${fmtNum(c.a2)} − ${fmtNum(c.b2)} = ${fmtNum(c.resultado)}`;
};

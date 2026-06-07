/**
 * Datos para el laboratorio "Funciones de 1.º y 2.º grado y sus transformaciones"
 * (PM-IV-P02-A2, ejercicio_matematico "Modelo la trayectoria de un balón con una
 * función cuadrática"; UAC PM-IV; progresión 2: "Analiza y grafica funciones
 * polinomiales de primer y segundo grado y sus transformaciones").
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabTransformacionesFunciones.tsx) y la escena 3D
 * (TransformacionesFuncionesScene.tsx).
 *
 * Idea pedagógica (MCCEMS 2025 — PM-IV P2): una función se grafica y se TRANSFORMA.
 * Partiendo de la función PADRE —y = x² (cuadrática) o y = x (lineal)— se llega a
 * la forma de vértice/transformaciones:
 *   cuadrática:  f(x) = a·(x − h)² + k
 *   lineal:      f(x) = a·(x − h)  + k
 * donde cada parámetro es UNA transformación geométrica del padre:
 *   · a → ESTIRAMIENTO/COMPRESIÓN vertical y REFLEXIÓN (a<0 voltea la gráfica:
 *         la parábola abre hacia abajo, como la trayectoria de un balón);
 *   · h → TRASLACIÓN HORIZONTAL (derecha si h>0, izquierda si h<0);
 *   · k → TRASLACIÓN VERTICAL  (arriba si k>0, abajo si k<0).
 * En la cuadrática el VÉRTICE queda en (h, k); en la lineal (h, k) es un punto por
 * el que pasa la recta y a es su pendiente. Aplicación: con a<0, f(x)=a(x−h)²+k es
 * la trayectoria de un balón cuyo punto más alto (vértice) está en (h, k).
 * Cálculo exacto.
 */

export type Modo = "cuadratica" | "lineal";

/* ── Controles ────────────────────────────────────────────────────────────── */
export const A_MIN = -2, A_MAX = 2, A_STEP = 0.25, A_DEF = -0.5;
export const H_MIN = -5, H_MAX = 5, H_STEP = 0.5, H_DEF = 2;
export const K_MIN = -5, K_MAX = 5, K_STEP = 0.5, K_DEF = 4;
export const MODO_DEF: Modo = "cuadratica";

const EPS = 1e-6;

/** Evalúa la función transformada f(x) según el modo. */
export function evalF(modo: Modo, a: number, h: number, k: number, x: number): number {
  return modo === "cuadratica" ? a * (x - h) * (x - h) + k : a * (x - h) + k;
}

/** Evalúa la función PADRE: y = x² (cuadrática) o y = x (lineal). */
export function evalPadre(modo: Modo, x: number): number {
  return modo === "cuadratica" ? x * x : x;
}

export interface Funcion {
  modo: Modo;
  a: number; h: number; k: number;
  // cuadrática
  verticeX: number; verticeY: number;   // vértice (cuadrática) / punto ancla (lineal)
  abreHaciaArriba: boolean;              // a > 0
  reflejada: boolean;                    // a < 0
  estirada: boolean;                     // |a| > 1
  comprimida: boolean;                   // 0 < |a| < 1
  // lineal
  pendiente: number;                     // = a
  ordenadaOrigen: number;                // b = k − a·h  (donde corta el eje Y)
  // común
  grado: 1 | 2;
}

/** Analiza la función transformada (exacto). */
export function calcFuncion(modo: Modo, a: number, h: number, k: number): Funcion {
  const aa = Math.abs(a);
  return {
    modo, a, h, k,
    verticeX: h, verticeY: k,
    abreHaciaArriba: a > 0,
    reflejada: a < 0,
    estirada: aa > 1 + EPS,
    comprimida: aa < 1 - EPS && aa > EPS,
    pendiente: a,
    ordenadaOrigen: k - a * h,
    grado: modo === "cuadratica" ? 2 : 1,
  };
}

/* ── Las tres transformaciones (panel) ────────────────────────────────────── */
export interface TransformDef {
  param: string;
  nombre: string;
  efecto: string;
  color: string;
}

export const TRANSFORMACIONES: TransformDef[] = [
  {
    param: "a",
    nombre: "Estiramiento y reflexión",
    efecto: "|a| > 1 estira la gráfica (más estrecha); |a| < 1 la comprime (más abierta); a < 0 la refleja (abre hacia abajo).",
    color: "#f97316",
  },
  {
    param: "h",
    nombre: "Traslación horizontal",
    efecto: "mueve toda la gráfica h unidades: a la derecha si h > 0, a la izquierda si h < 0. Es la x del vértice.",
    color: "#34D399",
  },
  {
    param: "k",
    nombre: "Traslación vertical",
    efecto: "mueve toda la gráfica k unidades: hacia arriba si k > 0, hacia abajo si k < 0. Es la y del vértice.",
    color: "#c4b5fd",
  },
];

/* ── Escenarios guiados ───────────────────────────────────────────────────── */
export interface Escenario {
  label: string;
  icono: string;
  modo: Modo;
  a: number; h: number; k: number;
  desc: string;
}

export const ESCENARIOS: Escenario[] = [
  { label: "Padre y = x²", icono: "fa-square", modo: "cuadratica", a: 1, h: 0, k: 0, desc: "La función cuadrática base, sin transformar: vértice en el origen, abre hacia arriba." },
  { label: "Balón (a<0)", icono: "fa-futbol", modo: "cuadratica", a: -0.5, h: 2, k: 4, desc: "a negativa: la parábola se voltea y modela un balón cuyo punto más alto (vértice) está en (2, 4)." },
  { label: "Trasladada", icono: "fa-up-down-left-right", modo: "cuadratica", a: 1, h: 3, k: -2, desc: "Misma forma que el padre, pero movida 3 a la derecha y 2 hacia abajo: vértice en (3, −2)." },
  { label: "Estrecha", icono: "fa-compress", modo: "cuadratica", a: 2, h: -2, k: 1, desc: "|a| = 2 > 1: la parábola se estira y queda más estrecha (sube más rápido)." },
  { label: "Recta padre y = x", icono: "fa-slash", modo: "lineal", a: 1, h: 0, k: 0, desc: "La función lineal base: pendiente 1, pasa por el origen." },
  { label: "Recta inclinada", icono: "fa-arrow-trend-down", modo: "lineal", a: -1.5, h: 1, k: 3, desc: "Recta con pendiente −1.5 (baja) que pasa por el punto (1, 3)." },
];

/* ── Ideas clave ──────────────────────────────────────────────────────────── */
export const IDEAS: string[] = [
  "Toda función de 2.º grado se grafica como una PARÁBOLA; toda función de 1.º grado, como una RECTA.",
  "La forma de vértice f(x) = a(x − h)² + k revela las transformaciones de un vistazo: a estira/refleja, h traslada horizontal y k traslada vertical.",
  "El vértice de la parábola transformada queda exactamente en (h, k): h es su posición horizontal y k su altura.",
  "El parámetro a controla la 'forma': si a < 0 la gráfica se refleja y abre hacia abajo; si |a| crece, se estira y se vuelve más estrecha.",
  "h y k NO cambian la forma, solo la POSICIÓN: deslizan la gráfica completa por el plano sin deformarla.",
  "Una trayectoria de balón es una parábola con a < 0: el vértice (h, k) es el punto más alto del tiro.",
  "Comparar la gráfica transformada con su 'padre' (y = x² o y = x) hace visible qué hizo cada parámetro.",
];

/* ── Datos / fórmulas (panel) ─────────────────────────────────────────────── */
export const DATOS: { valor: string; texto: string; icono: string }[] = [
  { valor: "f(x) = a(x − h)² + k", texto: "forma de vértice de la cuadrática", icono: "fa-square-root-variable" },
  { valor: "vértice = (h, k)", texto: "posición del punto más alto/bajo", icono: "fa-location-dot" },
  { valor: "a < 0 → abre hacia abajo", texto: "reflexión: trayectoria de balón", icono: "fa-futbol" },
  { valor: "f(x) = a(x − h) + k", texto: "forma de la recta (1.º grado)", icono: "fa-slash" },
];

/* ── Formato ──────────────────────────────────────────────────────────────── */
const ES = (n: number, dec: number) =>
  n.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 }).replace("-", "−");

export const fmtNum2 = (n: number): string => ES(n, 2);
export const fmtNum1 = (n: number): string => ES(n, 1);
/** Coordenada con 1 decimal. */
export const fmtCoord = (n: number): string => ES(n, 1);
/** Par ordenado (x, y). */
export const fmtPar = (x: number, y: number): string => `(${ES(x, 1)}, ${ES(y, 1)})`;

/** "− 3" / "+ 2" para escribir (x − h) y "+ k" en la ecuación. */
const term = (n: number): string => (n >= 0 ? `− ${ES(n, 1)}` : `+ ${ES(-n, 1)}`);
const suma = (n: number): string => (n >= 0 ? `+ ${ES(n, 1)}` : `− ${ES(-n, 1)}`);

/** Ecuación en forma de vértice, lista para mostrar. */
export function ecuacion(modo: Modo, a: number, h: number, k: number): string {
  const fa = ES(a, 2);
  const cuerpo = modo === "cuadratica" ? `(x ${term(h)})²` : `(x ${term(h)})`;
  return `f(x) = ${fa}·${cuerpo} ${suma(k)}`;
}

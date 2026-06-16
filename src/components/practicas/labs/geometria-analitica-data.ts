/**
 * Datos para el laboratorio "Geometría analítica: distancia, punto medio y
 * pendiente" (PM-IV-P06-A2, ejercicio_matematico; UAC PM-IV "Pensamiento
 * Matemático IV"; progresión 6: "Introduce la geometría analítica: distancia,
 * punto medio y ecuación de la recta en el plano cartesiano").
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabGeometriaAnalitica.tsx) y la escena 3D (GeometriaAnaliticaScene.tsx).
 *
 * Idea pedagógica (MCCEMS 2025 — PM-IV P6): dados dos puntos P₁(x₁,y₁) y
 * P₂(x₂,y₂) en el plano cartesiano, tres preguntas básicas y sus fórmulas:
 *   · DISTANCIA entre ellos:  d = √((x₂−x₁)² + (y₂−y₁)²)
 *     —no es más que el Teorema de Pitágoras sobre los catetos Δx y Δy—.
 *   · PUNTO MEDIO:  M = ( (x₁+x₂)/2 , (y₁+y₂)/2 )  —el promedio de las coordenadas—.
 *   · PENDIENTE de la recta:  m = Δy/Δx = (y₂−y₁)/(x₂−x₁)  —la inclinación—.
 * Δx = x₂−x₁ (avance horizontal, "run") y Δy = y₂−y₁ (subida vertical, "rise")
 * son los catetos del triángulo de la recta; la distancia es su hipotenusa.
 * Si Δx = 0 la recta es VERTICAL y la pendiente es INDEFINIDA. Cálculo exacto.
 */

/* ── Controles ────────────────────────────────────────────────────────────── */
export const MIN = -10, MAX = 10, STEP = 1;
export const X1_DEF = -4, Y1_DEF = -2, X2_DEF = 5, Y2_DEF = 4;

export interface Geom {
  x1: number; y1: number; x2: number; y2: number;
  dx: number; dy: number;       // catetos Δx, Δy
  dist: number;                 // distancia (hipotenusa)
  mx: number; my: number;       // punto medio
  pendienteDef: boolean;        // ¿la pendiente está definida? (Δx ≠ 0)
  pendiente: number;            // Δy/Δx (NaN si vertical)
  anguloDeg: number;            // ángulo de inclinación de la recta, grados
}

const EPS = 1e-6;

/** Calcula distancia, punto medio y pendiente entre P₁ y P₂ (exacto). */
export function calcGeom(x1: number, y1: number, x2: number, y2: number): Geom {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const pendienteDef = Math.abs(dx) > EPS;
  const pendiente = pendienteDef ? dy / dx : NaN;
  const anguloDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
  return { x1, y1, x2, y2, dx, dy, dist, mx, my, pendienteDef, pendiente, anguloDeg };
}

/* ── Las tres fórmulas (panel) ────────────────────────────────────────────── */
export interface FormulaDef {
  nombre: string;
  formula: string;
  uso: string;
  color: string;
}

export const FORMULAS: FormulaDef[] = [
  {
    nombre: "Distancia",
    formula: "d = √((x₂−x₁)² + (y₂−y₁)²)",
    uso: "el largo del segmento P₁P₂; es Pitágoras sobre los catetos Δx y Δy",
    color: "#f5d36b",
  },
  {
    nombre: "Punto medio",
    formula: "M = ( (x₁+x₂)/2 , (y₁+y₂)/2 )",
    uso: "el punto que parte el segmento en dos mitades iguales (promedio de coordenadas)",
    color: "#c4b5fd",
  },
  {
    nombre: "Pendiente",
    formula: "m = (y₂−y₁) / (x₂−x₁)",
    uso: "la inclinación de la recta: cuánto sube (Δy) por cada paso horizontal (Δx)",
    color: "#fbbf24",
  },
];

/* ── Escenarios guiados ───────────────────────────────────────────────────── */
export interface Escenario {
  label: string;
  icono: string;
  x1: number; y1: number; x2: number; y2: number;
  desc: string;
}

export const ESCENARIOS: Escenario[] = [
  { label: "Diagonal", icono: "fa-arrow-trend-up", x1: -4, y1: -2, x2: 5, y2: 4, desc: "Dos puntos en diagonal: distancia, punto medio y pendiente positiva." },
  { label: "Pendiente 1 (45°)", icono: "fa-angle-up", x1: -3, y1: -3, x2: 4, y2: 4, desc: "Cuando Δy = Δx la pendiente vale 1 y la recta sube a 45°." },
  { label: "Horizontal (m = 0)", icono: "fa-arrows-left-right", x1: -5, y1: 3, x2: 6, y2: 3, desc: "Si Δy = 0 la recta es horizontal: la pendiente es 0." },
  { label: "Vertical (m indef.)", icono: "fa-arrows-up-down", x1: 2, y1: -4, x2: 2, y2: 5, desc: "Si Δx = 0 la recta es vertical: la pendiente es indefinida (no se puede dividir entre 0)." },
  { label: "Pendiente negativa", icono: "fa-arrow-trend-down", x1: -4, y1: 4, x2: 5, y2: -3, desc: "Si la recta baja de izquierda a derecha, la pendiente es negativa." },
  { label: "Empinada", icono: "fa-mountain", x1: -1, y1: -5, x2: 2, y2: 6, desc: "Mucho Δy con poco Δx: pendiente grande, recta muy empinada." },
];

/* ── Ideas clave ──────────────────────────────────────────────────────────── */
export const IDEAS: string[] = [
  "La geometría analítica une álgebra y geometría: cada punto del plano es un par (x, y) y cada figura tiene una fórmula.",
  "Distancia entre dos puntos: d = √(Δx² + Δy²). Es el Teorema de Pitágoras, donde Δx y Δy son los catetos y la distancia es la hipotenusa.",
  "Punto medio: se promedian las coordenadas, M = ((x₁+x₂)/2, (y₁+y₂)/2). Siempre cae exactamente a la mitad del segmento.",
  "Pendiente: m = Δy/Δx mide la inclinación; es 'lo que sube' entre 'lo que avanza'.",
  "Pendiente positiva → la recta sube; negativa → baja; cero → horizontal; indefinida → vertical (Δx = 0, no se divide entre 0).",
  "Δx = x₂−x₁ y Δy = y₂−y₁ son los mismos catetos que sirven para la distancia y para la pendiente.",
  "Estas fórmulas son la base del GPS, los mapas digitales, los gráficos por computadora y la robótica.",
];

/* ── Datos / fórmulas (panel) ─────────────────────────────────────────────── */
export const DATOS: { valor: string; texto: string; icono: string }[] = [
  { valor: "d = √(Δx² + Δy²)", texto: "distancia entre los dos puntos (Pitágoras)", icono: "fa-ruler-combined" },
  { valor: "M = promedio de coordenadas", texto: "el punto medio del segmento", icono: "fa-crosshairs" },
  { valor: "m = Δy / Δx", texto: "la pendiente: inclinación de la recta", icono: "fa-angle-up" },
  { valor: "Δx = x₂−x₁ , Δy = y₂−y₁", texto: "los catetos compartidos por todo", icono: "fa-up-down-left-right" },
];

/* ── Formato ──────────────────────────────────────────────────────────────── */
const ES = (n: number, dec: number) =>
  n.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 }).replace("-", "−");

export const fmtNum = (n: number): string => ES(n, 3);
export const fmtNum2 = (n: number): string => ES(n, 2);
export const fmtInt = (n: number): string => ES(Math.round(n), 0);
/** Formatea un par ordenado (x, y). */
export const fmtPar = (x: number, y: number): string => `(${ES(x, 2)}, ${ES(y, 2)})`;
export const fmtPend = (g: { pendienteDef: boolean; pendiente: number }): string =>
  g.pendienteDef ? ES(g.pendiente, 2) : "indefinida";

/* ── Reto evaluable (PM-IV-P06-A2) ──────────────────────────────────────────
 * VERBATIM del ejercicio_matematico A2 «Distancia, punto medio y pendiente
 * entre dos puntos reales».  Fuente: scripts/_sem4_dump.txt líneas 5041-5056.
 *
 * Aritmética verificada:
 *   A(2, -1), B(8, 7)
 *   (a) d = √((8-2)²+(7-(-1))²) = √(36+64) = √100 = 10 km
 *   (b) Mx = (2+8)/2 = 5  ;  My = (-1+7)/2 = 3
 *   (c) m = (7-(-1))/(8-2) = 8/6 = 4/3 ≈ 1.3333…
 *   (d) y+1 = (4/3)(x-2) → y = (4/3)x − 8/3 − 3/3 = (4/3)x − 11/3 → b = −11/3 ≈ −3.6667
 *   (e) AM = √((5-2)²+(3-(-1))²) = √(9+16) = 5 km  ;  MB = √((8-5)²+(7-3)²) = 5 km ✓
 * ─────────────────────────────────────────────────────────────────────────── */
import type { RetoNumericoData } from "./_reto-numerico";

// VERBATIM de PM-IV-P06-A2 (ejercicio_matematico, tipo_respuesta "desarrollo").
export const RETO_A2: RetoNumericoData = {
  titulo: "Distancia, punto medio y pendiente entre dos puntos reales",
  contexto:
    "Dos técnicos de una empresa de telecomunicaciones colocan repetidoras de señal en dos puntos del mapa de la Ciudad de México, representados en coordenadas (en kilómetros desde un punto de referencia central) como: A(2, -1) y B(8, 7).",
  problema:
    "(a) Calcula la distancia entre las dos repetidoras.\n" +
    "(b) Encuentra el punto medio M entre A y B (donde colocarán un amplificador de señal).\n" +
    "    · Coordenada x del punto medio M\n" +
    "    · Coordenada y del punto medio M\n" +
    "(c) Calcula la pendiente de la recta que une A con B (escribe la fracción como decimal, 2 decimales).\n" +
    "(d) Escribe la ecuación de la recta y = mx + b — ¿cuánto vale el intercepto b (en fracción decimal, 2 decimales)?\n" +
    "(e) ¿Cuánto mide el segmento AM?",
  campos: [
    {
      etiqueta: "(a) Distancia entre las repetidoras d",
      objetivo: 10,
      tolerancia: 0,
      unidad: "km",
      placeholder: "10",
    },
    {
      etiqueta: "(b) Coordenada x del punto medio M",
      objetivo: 5,
      tolerancia: 0,
      placeholder: "5",
    },
    {
      etiqueta: "(b) Coordenada y del punto medio M",
      objetivo: 3,
      tolerancia: 0,
      placeholder: "3",
    },
    {
      etiqueta: "(c) Pendiente m (decimal, 2 dec.)",
      objetivo: 4 / 3,
      tolerancia: 0.005,
      placeholder: "1.33",
    },
    {
      etiqueta: "(d) Intercepto b (decimal, 2 dec.)",
      objetivo: -(11 / 3),
      tolerancia: 0.005,
      placeholder: "-3.67",
    },
    {
      etiqueta: "(e) Longitud del segmento AM",
      objetivo: 5,
      tolerancia: 0,
      unidad: "km",
      placeholder: "5",
    },
  ],
  pasosGuia: [
    "(a) d = √((x₂-x₁)² + (y₂-y₁)²) = √((8-2)² + (7-(-1))²) = √(36 + 64) = √100 = 10 km.",
    "(b) M = ((2+8)/2, (-1+7)/2) = (10/2, 6/2) = (5, 3).",
    "(c) m = (y₂-y₁)/(x₂-x₁) = (7-(-1))/(8-2) = 8/6 = 4/3.",
    "(d) Usa la forma punto-pendiente con A(2,-1) y m=4/3: y - (-1) = (4/3)(x - 2) → y + 1 = (4/3)x - 8/3 → y = (4/3)x - 8/3 - 1 = (4/3)x - 11/3.",
    "(e) AM = √((5-2)² + (3-(-1))²) = √(9+16) = √25 = 5 km. MB = √((8-5)²+(7-3)²) = √(9+16) = 5 km. AM = MB = 5 = d/2. ✓",
  ],
  respuestaFinal:
    "(a) d = 10 km. (b) M = (5, 3). (c) m = 4/3. (d) y = (4/3)x - 11/3. (e) AM = MB = 5 km, confirma que M es el punto medio.",
};

/**
 * Datos para el laboratorio "El discriminante: naturaleza de las raíces"
 * (PM-III-P03-A2, ejercicio_matematico; UAC PM-III "Pensamiento Matemático III";
 * progresión 3: "Analiza e interpreta la naturaleza de las raíces de una
 * ecuación cuadrática (discriminante)").
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabDiscriminante.tsx) y la escena 3D (DiscriminanteScene.tsx).
 *
 * Idea pedagógica (MCCEMS 2025 — PM-III P3): el discriminante Δ = b² − 4ac de
 * ax² + bx + c = 0 dice, SIN resolver toda la fórmula general, cuántas raíces
 * reales hay y de qué tipo:
 *   Δ > 0  → dos raíces reales distintas  → la parábola cruza el eje X dos veces
 *   Δ = 0  → una raíz real doble          → la parábola es tangente al eje X (vértice)
 *   Δ < 0  → ninguna raíz real            → no toca el eje X; raíces complejas a ± bi
 * Visualización distintiva: cuando Δ < 0, las dos raíces se "despegan" del eje
 * real y suben por el eje IMAGINARIO (parte ± i), volviendo tangible el caso
 * complejo. Aplicación (A2): el cohete h(t) = −5t² + 30t + 10 (pirotecnia).
 *
 * Todo es matemática EXACTA (no hay aproximación didáctica): Δ, raíces, vértice
 * y la recta y = k se calculan de forma cerrada. La única convención es de
 * dominio físico (en el cohete sólo t ≥ 0 tiene sentido).
 */

/* ── Controles (coeficientes de y = ax² + bx + c) ─────────────────────────── */
export const A_MIN = -5, A_MAX = 5, A_STEP = 0.5, A_DEF = 1;
export const B_MIN = -30, B_MAX = 30, B_STEP = 1, B_DEF = -1;
export const C_MIN = -20, C_MAX = 60, C_STEP = 1, C_DEF = -6;
/** Recta horizontal de exploración y = k ("¿cuántas veces alcanza la altura k?"). */
export const K_MIN = -20, K_MAX = 120, K_STEP = 5, K_DEF = 0;

export type Caso = "dos" | "una" | "ninguna" | "lineal";

export interface Discriminante {
  esCuadratica: boolean;
  delta: number;
  caso: Caso;
  vx: number;          // x del vértice (-b/2a)
  vy: number;          // y del vértice
  raices: number[];    // raíces reales (0, 1 ó 2)
  compleja: { re: number; im: number } | null; // raíces complejas re ± im·i
}

const EPS = 1e-9;

/** Discriminante y naturaleza de las raíces de ax² + bx + c = 0 (exacto). */
export function calcDiscriminante(a: number, b: number, c: number): Discriminante {
  if (Math.abs(a) < EPS) {
    // Ya no es cuadrática: y = bx + c (recta).
    const raiz = Math.abs(b) < EPS ? [] : [-c / b];
    return { esCuadratica: false, delta: NaN, caso: "lineal", vx: 0, vy: c, raices: raiz, compleja: null };
  }
  const delta = b * b - 4 * a * c;
  const vx = -b / (2 * a);
  const vy = c - (b * b) / (4 * a);
  if (delta > EPS) {
    const r = Math.sqrt(delta);
    const r1 = (-b - r) / (2 * a);
    const r2 = (-b + r) / (2 * a);
    return { esCuadratica: true, delta, caso: "dos", vx, vy, raices: [Math.min(r1, r2), Math.max(r1, r2)], compleja: null };
  }
  if (delta < -EPS) {
    const im = Math.sqrt(-delta) / (2 * Math.abs(a));
    return { esCuadratica: true, delta, caso: "ninguna", vx, vy, raices: [], compleja: { re: vx, im } };
  }
  return { esCuadratica: true, delta: 0, caso: "una", vx, vy, raices: [vx], compleja: null };
}

/** Intersecciones de la parábola con la recta y = k (resuelve ax²+bx+(c−k)=0). */
export function calcAltura(a: number, b: number, c: number, k: number): { delta: number; n: number; xs: number[] } {
  if (Math.abs(a) < EPS) {
    if (Math.abs(b) < EPS) return { delta: NaN, n: 0, xs: [] };
    return { delta: NaN, n: 1, xs: [(k - c) / b] };
  }
  const delta = b * b - 4 * a * (c - k);
  if (delta > EPS) {
    const r = Math.sqrt(delta);
    const x1 = (-b - r) / (2 * a);
    const x2 = (-b + r) / (2 * a);
    return { delta, n: 2, xs: [Math.min(x1, x2), Math.max(x1, x2)] };
  }
  if (delta < -EPS) return { delta, n: 0, xs: [] };
  return { delta: 0, n: 1, xs: [-b / (2 * a)] };
}

/* ── Información de cada caso ─────────────────────────────────────────────── */
export interface CasoInfo {
  label: string;
  signo: string;        // "Δ > 0", etc.
  color: string;
  icono: string;
  geom: string;         // interpretación gráfica
  desc: string;
}

export const CASOS: Record<Exclude<Caso, "lineal">, CasoInfo> = {
  dos: {
    label: "Dos raíces reales distintas", signo: "Δ > 0", color: "#34D399", icono: "fa-equals",
    geom: "La parábola cruza el eje X en dos puntos.",
    desc: "La raíz cuadrada de un número positivo existe en los reales y el signo ± da dos valores diferentes.",
  },
  una: {
    label: "Una raíz real doble", signo: "Δ = 0", color: "#fbbf24", icono: "fa-circle-dot",
    geom: "La parábola es tangente al eje X en su vértice.",
    desc: "Los dos valores de la fórmula coinciden: (−b + 0)/2a = (−b − 0)/2a = −b/2a.",
  },
  ninguna: {
    label: "Sin raíces reales", signo: "Δ < 0", color: "#f87171", icono: "fa-ban",
    geom: "La parábola no toca el eje X: queda por completo arriba o abajo.",
    desc: "La raíz de un número negativo no existe en los reales: las raíces son complejas a ± b·i.",
  },
};

/* ── Escenarios guiados ──────────────────────────────────────────────────── */
export interface Escenario {
  label: string;
  icono: string;
  a: number; b: number; c: number; k: number;
  desc: string;
}

export const ESCENARIOS: Escenario[] = [
  { label: "Dos raíces", icono: "fa-equals", a: 1, b: -1, c: -6, k: 0, desc: "y = x² − x − 6 · Δ = 25 > 0 · raíces en x = −2 y x = 3." },
  { label: "Tangente (una)", icono: "fa-circle-dot", a: 1, b: -4, c: 4, k: 0, desc: "y = x² − 4x + 4 · Δ = 0 · raíz doble en x = 2 (el vértice)." },
  { label: "Sin raíces reales", icono: "fa-ban", a: 1, b: 0, c: 4, k: 0, desc: "y = x² + 4 · Δ = −16 < 0 · raíces complejas 0 ± 2i." },
  { label: "Cohete 🚀", icono: "fa-rocket", a: -5, b: 30, c: 10, k: 55, desc: "h(t) = −5t² + 30t + 10 · toca el suelo (Δ = 1100) y llega a 55 m una sola vez (tangente)." },
  { label: "No llega a 100 m", icono: "fa-arrow-up", a: -5, b: 30, c: 10, k: 100, desc: "Para h = 100 m: Δ = −900 < 0 → el cohete nunca alcanza esa altura." },
];

/* ── La fórmula general (para el panel) ──────────────────────────────────── */
export const FORMULA = "x = ( −b ± √(b² − 4ac) ) / 2a";

/* ── Ideas clave ─────────────────────────────────────────────────────────── */
export const IDEAS: string[] = [
  "El discriminante Δ = b² − 4ac es la parte que vive bajo el radical de la fórmula general.",
  "Su SIGNO basta para saber el número de raíces sin resolver toda la ecuación: + dos, 0 una, − ninguna real.",
  "Gráficamente: Δ>0 la parábola cruza el eje X dos veces; Δ=0 lo toca una vez (tangente en el vértice); Δ<0 no lo toca.",
  "Cuando Δ < 0 las raíces son números complejos a ± b·i: existen, pero fuera de la recta real.",
  "Los números complejos no son abstracción inútil: el audio de tu celular, la ingeniería eléctrica y la física cuántica los usan.",
  "Aplicación: con el discriminante una empresa sabe si tendrá dos, uno o ningún punto de equilibrio antes de hacer todo el cálculo.",
];

/* ── Datos / contexto (verbatim de la actividad) ─────────────────────────── */
export const DATOS: { valor: string; texto: string; icono: string }[] = [
  { valor: "Δ = b² − 4ac", texto: "el discriminante: la expresión bajo el radical de la fórmula general", icono: "fa-square-root-variable" },
  { valor: "a ± b·i", texto: "forma de las raíces complejas cuando Δ < 0 (i = √−1)", icono: "fa-infinity" },
  { valor: "Δ = 1100", texto: "del cohete h(t) = −5t² + 30t + 10: sí toca el suelo", icono: "fa-rocket" },
  { valor: "55 m", texto: "altura máxima del cohete (vértice): la alcanza una sola vez (Δ = 0)", icono: "fa-arrow-up" },
];

/* ── Formato ─────────────────────────────────────────────────────────────── */
const ES = (n: number, dec: number) =>
  n.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 }).replace("-", "−");

export const fmtDelta = (n: number): string => (Number.isNaN(n) ? "—" : ES(n, 2));
export const fmtNum = (n: number): string => ES(n, 2);
export const fmtCoef = (n: number): string => ES(n, 1);

/* ── Reto evaluable: verbatim de PM-III-P03-A2 (ejercicio_matematico) ─────── */
import type { RetoNumericoData } from "./_reto-numerico";

// VERBATIM de PM-III-P03-A2 (ejercicio_matematico, tipo_respuesta "desarrollo").
// Aritmética verificada:
//   (a) a=-5, b=30, c=10 → Δ = 30²−4(−5)(10) = 900+200 = 1100 > 0 ✓
//   (b) h(t)=55 → −5t²+30t−45=0 → t²−6t+9=0 → Δ = 36−36 = 0 → t = 3 s ✓
//   (c) h(t)=100 → −5t²+30t−90=0 → t²−6t+18=0 → Δ = 36−72 = −36 < 0 ✓
export const RETO_A2: RetoNumericoData = {
  titulo: "Determino el número de soluciones reales usando el discriminante",
  contexto:
    "El discriminante es una herramienta de análisis previo: permite saber cuántas soluciones reales tendrá un problema antes de resolverlo completamente, lo que es útil en ingeniería y diseño.",
  problema:
    "Una empresa de pirotecnia modela la altura (en metros) de un cohete con la función h(t) = -5t² + 30t + 10, donde t es el tiempo en segundos.\n" +
    "(a) Calcula el discriminante de la ecuación -5t² + 30t + 10 = 0. ¿Cuántas veces toca el suelo el cohete?\n" +
    "(b) ¿A qué tiempo alcanza el cohete exactamente 55 m de altura? Plantea la ecuación correspondiente y calcula el discriminante.\n" +
    "(c) ¿Puede el cohete alcanzar 100 m de altura? Calcula el discriminante de t² - 6t + 18 = 0 para justificar sin resolver la ecuación completa.",
  campos: [
    {
      etiqueta: "(a) Discriminante de −5t² + 30t + 10 = 0",
      objetivo: 1100,
      tolerancia: 0,
      placeholder: "1100",
    },
    {
      etiqueta: "(b) Discriminante de t² − 6t + 9 = 0 (h = 55 m)",
      objetivo: 0,
      tolerancia: 0,
      placeholder: "0",
    },
    {
      etiqueta: "(b) Tiempo en que el cohete alcanza 55 m",
      objetivo: 3,
      tolerancia: 0,
      unidad: "s",
      placeholder: "3",
    },
    {
      etiqueta: "(c) Discriminante de t² − 6t + 18 = 0 (h = 100 m)",
      objetivo: -36,
      tolerancia: 0,
      placeholder: "−36",
    },
  ],
  pasosGuia: [
    "(a) Ecuación al tocar el suelo: h(t) = 0 → −5t² + 30t + 10 = 0. Identifica a = −5, b = 30, c = 10.",
    "(a) Calcula Δ = b² − 4ac = 900 − 4(−5)(10) = 900 + 200 = 1100 > 0 → dos raíces reales, pero solo la positiva es física.",
    "(b) h(t) = 55 → −5t² + 30t + 10 = 55 → −5t² + 30t − 45 = 0 → t² − 6t + 9 = 0. Δ = 36 − 36 = 0 → raíz doble: t = 3 s.",
    "(c) h(t) = 100 → −5t² + 30t − 90 = 0 → t² − 6t + 18 = 0. Δ = 36 − 72 = −36 < 0 → no alcanza 100 m.",
  ],
  respuestaFinal:
    "(a) Δ = 1100 > 0, el cohete toca el suelo una vez (raíz positiva). (b) t = 3 s (raíz doble, toca los 55 m exactamente en el vértice). (c) No puede alcanzar 100 m porque Δ < 0.",
};

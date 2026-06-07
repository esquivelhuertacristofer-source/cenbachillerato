/**
 * Datos para el laboratorio de Ecuaciones cuadráticas (PM-III-P02-A2,
 * "Resuelvo una ecuación cuadrática en contexto real"; progresión 2).
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabCuadratica.tsx) y la escena 3D (CuadraticaScene.tsx).
 *
 * Idea pedagógica (MCCEMS 2025 — PM-III P2): una ecuación cuadrática
 * ax² + bx + c = 0 (con a ≠ 0) se resuelve por tres métodos —factorización,
 * completar el cuadrado y la fórmula general— y el DISCRIMINANTE Δ = b² − 4ac
 * dice cuántas soluciones reales tiene: dos (Δ>0), una doble (Δ=0) o ninguna
 * (Δ<0). En la escena la parábola es un "valle" y el plano y = 0 es el "agua":
 * las raíces son justo donde el valle toca el agua.
 *
 * Datos verbatim de la actividad: el terreno del agricultor mide de largo
 * "5 metros más que el doble del ancho" y su área es 133 m²; con w = ancho se
 * plantea w·(2w+5)=133 → 2w² + 5w − 133 = 0, cuya raíz física es w = 7 m
 * (largo l = 19 m); 7 × 19 = 133 m². (Fórmula general, INEE/MCCEMS.)
 */

/* ── Controles: coeficientes a, b, c ──────────────────────────────────── */
export const A_MIN = -4, A_MAX = 4, A_STEP = 1, A_DEFAULT = 1; // a ≠ 0
export const B_MIN = -10, B_MAX = 10, B_STEP = 1, B_DEFAULT = -5;
export const C_MIN = -15, C_MAX = 15, C_STEP = 1, C_DEFAULT = 6;
// Default: x² − 5x + 6 = 0  →  (x−2)(x−3)  →  x = 2, 3.

/** y de la parábola en un punto x. */
export const evalY = (a: number, b: number, c: number, x: number): number => a * x * x + b * x + c;

/** Discriminante Δ = b² − 4ac. */
export const discriminante = (a: number, b: number, c: number): number => b * b - 4 * a * c;

/** Vértice de la parábola (xv, yv). */
export const vertice = (a: number, b: number, c: number): { x: number; y: number } => {
  const x = a === 0 ? 0 : -b / (2 * a);
  return { x, y: evalY(a, b, c, x) };
};

export type TipoRaices = "dos" | "una" | "ninguna" | "no_cuadratica";

export interface Raices {
  tipo: TipoRaices;
  reales: number[]; // 0, 1 o 2 valores
}

/** Resuelve ax² + bx + c = 0 por la fórmula general. */
export const resolver = (a: number, b: number, c: number): Raices => {
  if (a === 0) return { tipo: "no_cuadratica", reales: [] };
  const d = discriminante(a, b, c);
  if (d > 0) {
    const s = Math.sqrt(d);
    const r1 = (-b - s) / (2 * a);
    const r2 = (-b + s) / (2 * a);
    return { tipo: "dos", reales: [r1, r2].sort((p, q) => p - q) };
  }
  if (d === 0) return { tipo: "una", reales: [-b / (2 * a)] };
  return { tipo: "ninguna", reales: [] };
};

/* ── Ejemplos guiados (uno por método/caso de la lectura) ─────────────── */
export interface Ejemplo {
  label: string;
  a: number; b: number; c: number;
  metodo: string;
  nota: string;
}

export const EJEMPLOS: Ejemplo[] = [
  { label: "x² − 5x + 6", a: 1, b: -5, c: 6, metodo: "Factorización",
    nota: "(x − 2)(x − 3) = 0  →  x = 2, 3" },
  { label: "x² + 6x + 5", a: 1, b: 6, c: 5, metodo: "Completar el cuadrado",
    nota: "(x + 3)² = 4  →  x = −1, −5" },
  { label: "x² − 4x + 4", a: 1, b: -4, c: 4, metodo: "Δ = 0",
    nota: "raíz doble: x = 2 (la parábola solo roza el eje)" },
  { label: "x² + x + 1", a: 1, b: 1, c: 1, metodo: "Δ < 0",
    nota: "sin raíces reales (la parábola no toca el eje)" },
];

/* ── Caso real verbatim: el terreno del agricultor ────────────────────── */
export const CASO_AGRICULTOR = {
  a: 2, b: 5, c: -133,
  w: 7, l: 19, area: 133,
  ecuacion: "2w² + 5w − 133 = 0",
  disc: 1089, // 5² − 4·2·(−133) = 25 + 1064
  raizFisica: 7,
  raizDescartada: -9.5,
  resumen:
    "El largo es 5 m más que el doble del ancho y el área es 133 m². Con w = ancho: w·(2w+5)=133 → 2w²+5w−133=0. Δ=25+1064=1089, √1089=33, w=(−5±33)/4. Se descarta w=−9.5 (un ancho no puede ser negativo): w = 7 m y l = 19 m. Comprobación: 7 × 19 = 133 m².",
} as const;

/* ── Los tres métodos (para el panel) ─────────────────────────────────── */
export interface Metodo {
  nombre: string;
  icono: string; // Font Awesome 6 Free solid
  desc: string;
}

export const METODOS: Metodo[] = [
  { nombre: "Factorización", icono: "fa-puzzle-piece",
    desc: "Si la ecuación se escribe como producto de dos binomios, cada factor igualado a cero da una raíz. Rápido cuando factoriza con enteros, pero no siempre es posible." },
  { nombre: "Completar el cuadrado", icono: "fa-square-root-variable",
    desc: "Transforma ax²+bx+c=0 en a(x+h)²=k y se aplica raíz cuadrada. Siempre funciona y de aquí se deduce la fórmula general." },
  { nombre: "Fórmula general", icono: "fa-superscript",
    desc: "La herramienta universal: x = (−b ± √(b²−4ac)) / 2a. Sirve para cualquier cuadrática; bajo la raíz está el discriminante." },
];

/* ── Formato ──────────────────────────────────────────────────────────── */
const ES = (n: number, dec: number) =>
  n.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 }).replace("-", "−");

/** Número con hasta 2 decimales (raíces). */
export const fmt = (n: number): string => ES(Math.abs(n) < 1e-9 ? 0 : n, 2);

/** Coeficiente entero con signo (para escribir el polinomio). */
export const fmtCoef = (n: number): string => ES(n, 2);

/** Arma "ax² + bx + c" legible (signos y términos cero/uno). */
export const polinomio = (a: number, b: number, c: number): string => {
  const term = (coef: number, sufijo: string, primero: boolean): string => {
    if (coef === 0) return "";
    const signo = coef < 0 ? "−" : primero ? "" : "+";
    const mag = Math.abs(coef);
    const num = sufijo && mag === 1 ? "" : ES(mag, 2);
    return ` ${signo} ${num}${sufijo}`.replace("  ", " ");
  };
  let s = "";
  s += term(a, "x²", true);
  const restoPrimero = a === 0;
  s += term(b, "x", restoPrimero);
  s += term(c, "", restoPrimero && b === 0);
  return (s.trim() || "0") + " = 0";
};

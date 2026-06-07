/**
 * Datos para el laboratorio "Análisis completo de una función: máximos, mínimos
 * e inflexión" (PM-V-P06-A2, ejercicio_matematico "Análisis completo de función:
 * encontrando extremos e inflexión"; UAC PM-V Cálculo Diferencial; progresión 6).
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabAnalisis.tsx) y la escena 3D (AnalisisScene.tsx).
 *
 * Idea pedagógica (MCCEMS 2025 — PM-V P6, verbatim A2):
 *  · La PRIMERA derivada f'(x) localiza los puntos críticos (f'(x) = 0) y dice
 *    dónde f crece (f' > 0) o decrece (f' < 0).
 *  · La SEGUNDA derivada f''(x) clasifica cada crítico (criterio de la 2.ª
 *    derivada: f''<0 → máximo, f''>0 → mínimo) y da la CONCAVIDAD; donde f''
 *    cambia de signo hay un PUNTO DE INFLEXIÓN.
 *  · f, f' y f'' son tres funciones que se leen juntas: la altura de f' es la
 *    pendiente de f, y la altura de f'' es la pendiente de f'.
 *
 * Caso verbatim del A2 (una sola función, análisis completo):
 *  f(x)  = x³ − 3x² − 9x + 5
 *  f'(x) = 3x² − 6x − 9 = 3(x − 3)(x + 1)      → críticos x = −1 y x = 3
 *  f''(x)= 6x − 6                              → inflexión x = 1
 *  Máximo local (−1, 10) · Mínimo local (3, −22) · Inflexión (1, −6)
 *  Crece: x < −1 ó x > 3 · Decrece: −1 < x < 3
 *  Cóncava abajo: x < 1 · Cóncava arriba: x > 1
 *
 * Todos los valores son EXACTOS (cálculo simbólico cerrado, hecho a mano).
 */

export type Curva = "f" | "d1" | "d2";
export type FocoId = "max" | "min" | "infl" | "libre";
export type Pt2 = [number, number];

/* ── Vista (mapeo datos → plano) ──────────────────────────────────────────── */
export interface Vista {
  xmin: number; xmax: number; ymin: number; ymax: number;
  xticks: number[]; yticks: number[];
  xlabel: string; ylabel: string;
}

export const VISTA: Vista = {
  xmin: -3, xmax: 5, ymin: -24, ymax: 15,
  xticks: [-3, -2, -1, 0, 1, 2, 3, 4, 5],
  yticks: [-24, -18, -12, -6, 0, 6, 12],
  xlabel: "x", ylabel: "y",
};

/* La función y sus derivadas (verbatim A2) ── exactas ─────────────────────── */
export const F_EXPR = "f(x) = x³ − 3x² − 9x + 5";
export const D1_EXPR = "f'(x) = 3x² − 6x − 9 = 3(x − 3)(x + 1)";
export const D2_EXPR = "f''(x) = 6x − 6";

export function evalF(x: number): number { return x ** 3 - 3 * x * x - 9 * x + 5; }
export function evalD1(x: number): number { return 3 * x * x - 6 * x - 9; }
export function evalD2(x: number): number { return 6 * x - 6; }

export function valorEn(which: Curva, x: number): number {
  return which === "f" ? evalF(x) : which === "d1" ? evalD1(x) : evalD2(x);
}

/* ── Puntos notables (exactos) ────────────────────────────────────────────── */
export interface PuntoNotable {
  id: Exclude<FocoId, "libre">;
  x: number; y: number;
  tipo: string;            // "Máximo local"…
  color: string;
  icono: string;
  criterio: string;        // resumen del criterio aplicado
  detalle: string;
}

export const PUNTOS: PuntoNotable[] = [
  {
    id: "max", x: -1, y: 10, tipo: "Máximo local", color: "#34D399", icono: "fa-arrow-up",
    criterio: "f'(−1) = 0  y  f''(−1) = −12 < 0",
    detalle: "En x = −1 la pendiente es cero y la concavidad es hacia abajo (∩): la curva hace cima. Máximo local en (−1, 10).",
  },
  {
    id: "min", x: 3, y: -22, tipo: "Mínimo local", color: "#F87171", icono: "fa-arrow-down",
    criterio: "f'(3) = 0  y  f''(3) = 12 > 0",
    detalle: "En x = 3 la pendiente es cero y la concavidad es hacia arriba (∪): la curva hace valle. Mínimo local en (3, −22).",
  },
  {
    id: "infl", x: 1, y: -6, tipo: "Punto de inflexión", color: "#C084FC", icono: "fa-wave-square",
    criterio: "f''(1) = 0  y  f'' cambia de signo",
    detalle: "En x = 1, f'' pasa de negativa (∩) a positiva (∪): ahí la curva cambia de concavidad. Punto de inflexión en (1, −6).",
  },
];

export function punto(id: Exclude<FocoId, "libre">): PuntoNotable {
  return PUNTOS.find((p) => p.id === id)!;
}

/* ── Clasificación en vivo en x = a ───────────────────────────────────────── */
export interface Clasif {
  creciente: boolean;       // f'(a) > 0
  decreciente: boolean;     // f'(a) < 0
  concavaArriba: boolean;   // f''(a) > 0
  concavaAbajo: boolean;    // f''(a) < 0
  cerca: PuntoNotable | null; // si a coincide (±tol) con un punto notable
}

export function clasificar(a: number, tol = 0.06): Clasif {
  const d1 = evalD1(a);
  const d2 = evalD2(a);
  const cerca = PUNTOS.find((p) => Math.abs(a - p.x) <= tol) ?? null;
  return {
    creciente: d1 > 1e-9,
    decreciente: d1 < -1e-9,
    concavaArriba: d2 > 1e-9,
    concavaAbajo: d2 < -1e-9,
    cerca,
  };
}

/* ── Intervalos (verbatim A2 (d)) ─────────────────────────────────────────── */
export const INTERVALOS = {
  crece: "x < −1  ó  x > 3",
  decrece: "−1 < x < 3",
  concavaAbajo: "x < 1",
  concavaArriba: "x > 1",
};

/**
 * Muestrea una curva (f, f' o f'') en coordenadas de DATOS. Devuelve una o
 * varias polilíneas: corta el trazo donde el valor sale del rango visible.
 */
export function muestrear(which: Curva, n = 480): Pt2[][] {
  const polis: Pt2[][] = [];
  let actual: Pt2[] = [];
  const lo = VISTA.xmin;
  const hi = VISTA.xmax;
  for (let i = 0; i <= n; i++) {
    const x = lo + ((hi - lo) * i) / n;
    const y = valorEn(which, x);
    if (Number.isFinite(y) && y >= VISTA.ymin - 0.5 && y <= VISTA.ymax + 0.5) {
      actual.push([x, y]);
    } else if (actual.length > 1) {
      polis.push(actual); actual = [];
    } else {
      actual = [];
    }
  }
  if (actual.length > 1) polis.push(actual);
  return polis;
}

/**
 * Recorta la recta infinita y = m·x + b al rectángulo de la vista. Devuelve los
 * dos extremos del segmento visible (o [] si no cruza el rectángulo).
 */
export function clipRecta(m: number, b: number, v: Vista = VISTA): Pt2[] {
  const cand: Pt2[] = [];
  const push = (x: number, y: number) => {
    if (x >= v.xmin - 1e-6 && x <= v.xmax + 1e-6 && y >= v.ymin - 1e-6 && y <= v.ymax + 1e-6) {
      cand.push([Math.min(v.xmax, Math.max(v.xmin, x)), Math.min(v.ymax, Math.max(v.ymin, y))]);
    }
  };
  push(v.xmin, m * v.xmin + b);
  push(v.xmax, m * v.xmax + b);
  if (Math.abs(m) > 1e-9) {
    push((v.ymin - b) / m, v.ymin);
    push((v.ymax - b) / m, v.ymax);
  }
  const out: Pt2[] = [];
  for (const p of cand) {
    if (!out.some((q) => Math.abs(q[0] - p[0]) < 1e-4 && Math.abs(q[1] - p[1]) < 1e-4)) out.push(p);
  }
  return out.length >= 2 ? [out[0]!, out[out.length - 1]!] : [];
}

/** Recta tangente a f en x = a (m = f'(a), b = f(a) − m·a). */
export function tangente(a: number): { m: number; b: number } {
  const m = evalD1(a);
  const b = evalF(a) - m * a;
  return { m, b };
}

/* ── Pasos verbatim del A2 (pasos_guia) ───────────────────────────────────── */
export interface PasoReto { etiqueta: string; texto: string; }

export const PASOS: PasoReto[] = [
  {
    etiqueta: "a",
    texto: "f'(x) = 3x² − 6x − 9 = 3(x² − 2x − 3) = 3(x − 3)(x + 1). Igualando a cero: x = 3 y x = −1. Puntos críticos: x = −1 y x = 3.",
  },
  {
    etiqueta: "b",
    texto: "f''(x) = 6x − 6. En x = −1: f''(−1) = −6 − 6 = −12 < 0 → máximo local; f(−1) = 10 → (−1, 10). En x = 3: f''(3) = 18 − 6 = 12 > 0 → mínimo local; f(3) = −22 → (3, −22).",
  },
  {
    etiqueta: "c",
    texto: "Inflexión donde f'' cambia de signo: f''(x) = 6x − 6 = 0 → x = 1. f''(0) = −6 < 0 y f''(2) = 6 > 0 → sí cambia de signo. f(1) = −6 → punto de inflexión en (1, −6).",
  },
  {
    etiqueta: "d",
    texto: "Crecimiento: f' > 0 cuando (x + 1)(x − 3) > 0, es decir x < −1 ó x > 3. Decrecimiento: −1 < x < 3. Cóncava abajo (f'' < 0): x < 1. Cóncava arriba (f'' > 0): x > 1.",
  },
];

/* ── Contenido pedagógico (verbatim-alineado A2 / A1) ─────────────────────── */
export const IDEAS: string[] = [
  "Punto crítico = donde f'(x) = 0 (o no existe): la tangente es horizontal y f puede tener un máximo o un mínimo.",
  "Criterio de la 1.ª derivada: si f' pasa de + a −, hay máximo; si pasa de − a +, hay mínimo; el signo de f' marca crecimiento/decrecimiento.",
  "Criterio de la 2.ª derivada: en un crítico, f'' < 0 → máximo (cóncava ∩); f'' > 0 → mínimo (cóncava ∪).",
  "Punto de inflexión = donde f'' cambia de signo: la curva pasa de cóncava hacia abajo a cóncava hacia arriba (o al revés).",
  "La altura de f'(x) es la pendiente de f, y la altura de f''(x) es la pendiente de f': leerlas juntas describe toda la forma de la curva.",
  "Para esta cúbica: máximo en (−1, 10), inflexión en (1, −6) y mínimo en (3, −22); entre el máximo y el mínimo, f decrece.",
];

export const DATOS: { valor: string; texto: string; icono: string }[] = [
  { valor: "f'(x) = 0", texto: "localiza los puntos críticos: x = −1 y x = 3", icono: "fa-crosshairs" },
  { valor: "f'' < 0 → máx", texto: "f'' > 0 → mín (criterio de la 2.ª derivada)", icono: "fa-arrows-up-down" },
  { valor: "f'' = 0", texto: "candidato a inflexión si f'' cambia de signo: x = 1", icono: "fa-wave-square" },
  { valor: "(−1,10)·(3,−22)", texto: "máximo y mínimo locales; inflexión en (1, −6)", icono: "fa-location-dot" },
];

/* ── Formato ──────────────────────────────────────────────────────────────── */
const ES = (n: number, dec: number) =>
  n.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 }).replace("-", "−");

export const fmt0 = (n: number): string => ES(n, 0);
export const fmt1 = (n: number): string => ES(n, 1);
export const fmt2 = (n: number): string => ES(n, 2);
export const fmt3 = (n: number): string => ES(n, 3);

/** Cadena legible "y = m x + b" (maneja signos, m = ±1, b ≈ 0, m = 0). */
export function rectaStr(m: number, b: number): string {
  const mr = Math.round(m * 1000) / 1000;
  const br = Math.round(b * 1000) / 1000;
  if (!Number.isFinite(mr) || !Number.isFinite(br)) return "—";
  if (Math.abs(mr) < 1e-9) return `y = ${ES(br, 2)}`;
  let mPart: string;
  if (Math.abs(mr - 1) < 1e-9) mPart = "x";
  else if (Math.abs(mr + 1) < 1e-9) mPart = "−x";
  else mPart = `${ES(mr, 2)}x`;
  let bPart = "";
  if (Math.abs(br) >= 1e-9) bPart = br > 0 ? ` + ${ES(br, 2)}` : ` − ${ES(Math.abs(br), 2)}`;
  return `y = ${mPart}${bPart}`;
}

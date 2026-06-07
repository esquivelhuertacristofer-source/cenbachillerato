/**
 * Datos para el laboratorio "Derivadas de funciones trascendentes: trig, exp y log"
 * (PM-V-P05-A2, ejercicio_matematico "Calculando derivadas de funciones
 * trigonométricas y exponenciales"; UAC PM-V Cálculo Diferencial; progresión 5).
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabTrascendentes.tsx) y la escena 3D (TrascendentesScene.tsx).
 *
 * Idea pedagógica (MCCEMS 2025 — PM-V P5, verbatim A2):
 *  · Las funciones TRASCENDENTES (sen, cos, tan, eˣ, ln) tienen derivadas
 *    "básicas" que se memorizan, y se combinan con las reglas ya conocidas
 *    (linealidad, producto, cadena).
 *  · La derivada f'(x) es a su vez una FUNCIÓN: una curva cuya ALTURA en x = a
 *    vale la PENDIENTE de la tangente a f en a.
 *  · Donde f crece, f'(x) > 0; donde decrece, f'(x) < 0; donde la tangente es
 *    horizontal, f'(x) = 0.
 *
 * Derivadas básicas usadas (verbatim lectura A1 / pasos_guia A2):
 *  (sen x)' = cos x   (cos x)' = −sen x   (tan x)' = sec²x
 *  (eˣ)' = eˣ   (e^(kx))' = k·e^(kx)   (ln x)' = 1/x
 *
 * Casos verbatim del A2 (calcula la derivada, indica regla):
 *  (a) f(x) = 3 sen x − 2 cos x + tan x → 3 cos x + 2 sen x + sec²x   (linealidad)
 *  (b) g(x) = e^(2x)·cos x             → e^(2x)(2 cos x − sen x)      (producto + cadena)
 *  (c) h(x) = ln(x² + 1)               → 2x/(x² + 1)                  (cadena)
 *  (d) k(x) = sen(x³)                  → 3x² cos(x³)                  (cadena)
 *
 * Todas las derivadas son SIMBÓLICAS EXACTAS (las reglas aplicadas a mano). La
 * escena dibuja f y f' a una escala propia por caso para que ambas curvas quepan.
 */

export type FuncId = "trig" | "expprod" | "logaritmo" | "senocadena";
export type Curva = "f" | "d";
export type Pt2 = [number, number];

export const FUNC_DEF: FuncId = "trig";

/* ── Vista (mapeo datos → plano) ──────────────────────────────────────────── */
export interface Vista {
  xmin: number; xmax: number; ymin: number; ymax: number;
  xticks: number[]; yticks: number[];
  xlabel: string; ylabel: string;
}

export interface PasoReto { etiqueta: string; texto: string; }

export interface Funcion {
  id: FuncId;
  label: string;          // corto (chips)
  titulo: string;         // descriptivo
  icono: string;
  color: string;          // color de la curva f
  regla: string;          // nombre de la regla / combinación
  reglaFormula: string;   // forma simbólica clave
  expr: string;           // fórmula de f
  derivExpr: string;      // fórmula de f'
  vista: Vista;
  cortes: number[];       // x donde se rompe la polilínea (aquí ninguno)
  aMin: number;           // rango de la sonda x = a
  aMax: number;
  aDef: number;
  contexto: string;
  pasos: PasoReto[];
  nota?: string;
}

/* ── Catálogo de funciones (4 casos verbatim del A2) ──────────────────────── */
export const FUNCIONES: Funcion[] = [
  {
    id: "trig",
    label: "3 sen x − 2 cos x + tan x",
    titulo: "f(x) = 3 sen x − 2 cos x + tan x — linealidad + básicas",
    icono: "fa-wave-square",
    color: "#2DD4BF",
    regla: "Linealidad + derivadas básicas",
    reglaFormula: "(sen)'=cos · (cos)'=−sen · (tan)'=sec²",
    expr: "f(x) = 3 sen x − 2 cos x + tan x",
    derivExpr: "f'(x) = 3 cos x + 2 sen x + sec²x",
    vista: {
      xmin: -1.1, xmax: 1.1, ymin: -7, ymax: 9,
      xticks: [-1, -0.5, 0, 0.5, 1], yticks: [-6, -3, 0, 3, 6],
      xlabel: "x (rad)", ylabel: "y",
    },
    cortes: [],
    aMin: -1.05, aMax: 1.05, aDef: 0.6,
    contexto: "El caso verbatim del A2 (a). Por linealidad, la derivada de la suma es la suma de derivadas y las constantes multiplican: cada término usa su derivada básica. Como sec²x = 1/cos²x ≥ 1, la derivada f'(x) = 3 cos x + 2 sen x + sec²x se mantiene positiva en este tramo, así que f va creciendo. (Cerca de x = π/2 ≈ 1.57 la tangente tiene asíntota; el plano se queda dentro de ±1.05 rad.)",
    pasos: [
      { etiqueta: "a", texto: "Linealidad: deriva término a término f(x) = 3 sen x − 2 cos x + tan x." },
      { etiqueta: "1", texto: "d/dx[3 sen x] = 3 cos x   y   d/dx[−2 cos x] = +2 sen x." },
      { etiqueta: "2", texto: "d/dx[tan x] = sec²x (derivada básica de la tangente)." },
      { etiqueta: "3", texto: "f'(x) = 3 cos x + 2 sen x + sec²x." },
    ],
    nota: "Caso verbatim del enunciado A2 (a). Las derivadas básicas (sen)'=cos, (cos)'=−sen, (tan)'=sec² se aplican con linealidad; no hace falta cadena.",
  },
  {
    id: "expprod",
    label: "e^(2x)·cos x",
    titulo: "g(x) = e^(2x)·cos x — producto + cadena",
    icono: "fa-xmark",
    color: "#A78BFA",
    regla: "Producto + cadena",
    reglaFormula: "(f·g)' = f'·g + f·g',  (e^{2x})' = 2e^{2x}",
    expr: "g(x) = e^(2x)·cos x",
    derivExpr: "g'(x) = e^(2x)(2 cos x − sen x)",
    vista: {
      xmin: -1.6, xmax: 1.35, ymin: -7, ymax: 6,
      xticks: [-1.5, -1, -0.5, 0, 0.5, 1], yticks: [-6, -4, -2, 0, 2, 4],
      xlabel: "x", ylabel: "y",
    },
    cortes: [],
    aMin: -1.4, aMax: 1.3, aDef: 0.4,
    contexto: "El caso verbatim del A2 (b). Es un PRODUCTO de dos funciones, y uno de los factores, e^(2x), necesita a su vez la CADENA: (e^(2x))' = 2e^(2x). Con f = e^(2x) (f' = 2e^(2x)) y g = cos x (g' = −sen x), la regla del producto da g'(x) = e^(2x)(2 cos x − sen x). La derivada cruza el eje (cambia de signo) donde 2 cos x = sen x: ahí g alcanza su máximo y la tangente es horizontal.",
    pasos: [
      { etiqueta: "b", texto: "Regla del producto sobre g = e^(2x)·cos x, con f = e^(2x) y g = cos x." },
      { etiqueta: "1", texto: "f' = (e^(2x))' = 2e^(2x) (cadena: exterior eᵘ por interior u'=2)   y   g' = (cos x)' = −sen x." },
      { etiqueta: "2", texto: "g'(x) = 2e^(2x)·cos x + e^(2x)·(−sen x)." },
      { etiqueta: "3", texto: "Factor común e^(2x): g'(x) = e^(2x)(2 cos x − sen x)." },
    ],
    nota: "Caso verbatim del enunciado A2 (b). Combina dos reglas: el producto por fuera y la cadena dentro del factor exponencial.",
  },
  {
    id: "logaritmo",
    label: "ln(x² + 1)",
    titulo: "h(x) = ln(x² + 1) — regla de la cadena (logaritmo)",
    icono: "fa-divide",
    color: "#F472B6",
    regla: "Cadena (logaritmo)",
    reglaFormula: "(ln u)' = u'/u",
    expr: "h(x) = ln(x² + 1)",
    derivExpr: "h'(x) = 2x/(x² + 1)",
    vista: {
      xmin: -3.6, xmax: 3.6, ymin: -1.6, ymax: 3,
      xticks: [-3, -2, -1, 0, 1, 2, 3], yticks: [-1, 0, 1, 2],
      xlabel: "x", ylabel: "y",
    },
    cortes: [],
    aMin: -3.4, aMax: 3.4, aDef: 1.5,
    contexto: "El caso verbatim del A2 (c). Es una CADENA: exterior ln(u) (derivada 1/u) por interior u = x² + 1 (derivada 2x). La derivada h'(x) = 2x/(x² + 1) es impar: positiva para x > 0 (h crece) y negativa para x < 0 (h decrece), con su máxima pendiente en x = 1 (h'(1) = 1) y mínima en x = −1. En x = 0 la tangente es horizontal: ahí h tiene su mínimo.",
    pasos: [
      { etiqueta: "c", texto: "Regla de la cadena sobre h = ln(x² + 1), con exterior ln(u) e interior u = x² + 1." },
      { etiqueta: "1", texto: "Derivada exterior: (ln u)' = 1/u = 1/(x² + 1)." },
      { etiqueta: "2", texto: "Derivada interior: u' = (x² + 1)' = 2x." },
      { etiqueta: "3", texto: "h'(x) = (1/(x² + 1))·2x = 2x/(x² + 1)." },
    ],
    nota: "Caso verbatim del enunciado A2 (c). El logaritmo siempre se deriva como (ln u)' = u'/u; aquí u' = 2x.",
  },
  {
    id: "senocadena",
    label: "sen(x³)",
    titulo: "k(x) = sen(x³) — regla de la cadena (trig)",
    icono: "fa-link",
    color: "#60A5FA",
    regla: "Cadena (trigonométrica)",
    reglaFormula: "(sen u)' = cos(u)·u'",
    expr: "k(x) = sen(x³)",
    derivExpr: "k'(x) = 3x² cos(x³)",
    vista: {
      xmin: -1.35, xmax: 1.35, ymin: -3.5, ymax: 2.5,
      xticks: [-1, -0.5, 0, 0.5, 1], yticks: [-3, -2, -1, 0, 1, 2],
      xlabel: "x", ylabel: "y",
    },
    cortes: [],
    aMin: -1.3, aMax: 1.3, aDef: 0.9,
    contexto: "El caso verbatim del A2 (d). Otra CADENA: exterior sen(u) (derivada cos(u)) por interior u = x³ (derivada 3x²). Aunque k(x) = sen(x³) siempre vive entre −1 y 1, su derivada k'(x) = 3x² cos(x³) AMPLIFICA al crecer x: el factor 3x² hace que la curva de la derivada se dispare y la tangente se empine, mostrando que sen(x³) oscila cada vez más rápido.",
    pasos: [
      { etiqueta: "d", texto: "Regla de la cadena sobre k = sen(x³), con exterior sen(u) e interior u = x³." },
      { etiqueta: "1", texto: "Derivada exterior: (sen u)' = cos(u) = cos(x³)." },
      { etiqueta: "2", texto: "Derivada interior: u' = (x³)' = 3x²." },
      { etiqueta: "3", texto: "k'(x) = cos(x³)·3x² = 3x² cos(x³)." },
    ],
    nota: "Caso verbatim del enunciado A2 (d). El interior x³ entra como factor 3x²; por eso la derivada crece aunque la función esté acotada entre −1 y 1.",
  },
];

const FUNC_MAP: Record<FuncId, Funcion> = FUNCIONES.reduce((acc, f) => {
  acc[f.id] = f;
  return acc;
}, {} as Record<FuncId, Funcion>);

export function func(id: FuncId): Funcion {
  return FUNC_MAP[id];
}

/* ── Evaluación de f (exacta) ─────────────────────────────────────────────── */
export function evalFunc(id: FuncId, x: number): number {
  switch (id) {
    case "trig": return 3 * Math.sin(x) - 2 * Math.cos(x) + Math.tan(x);
    case "expprod": return Math.exp(2 * x) * Math.cos(x);
    case "logaritmo": return Math.log(x * x + 1);
    case "senocadena": return Math.sin(x ** 3);
    default: return NaN;
  }
}

/** Derivada simbólica EXACTA f'(x) (las reglas aplicadas a mano). */
export function deriv(id: FuncId, x: number): number {
  switch (id) {
    case "trig": {
      const sec = 1 / Math.cos(x);
      return 3 * Math.cos(x) + 2 * Math.sin(x) + sec * sec;
    }
    case "expprod": return Math.exp(2 * x) * (2 * Math.cos(x) - Math.sin(x));
    case "logaritmo": return (2 * x) / (x * x + 1);
    case "senocadena": return 3 * x * x * Math.cos(x ** 3);
    default: return NaN;
  }
}

/** Evalúa la curva pedida: "f" → f(x), "d" → f'(x). */
export function valorEn(id: FuncId, which: Curva, x: number): number {
  return which === "f" ? evalFunc(id, x) : deriv(id, x);
}

export function enDominio(id: FuncId, x: number): boolean {
  const f = func(id);
  return x >= f.vista.xmin - 1e-9 && x <= f.vista.xmax + 1e-9 && !f.cortes.some((c) => Math.abs(x - c) < 1e-6);
}

/**
 * Muestrea la curva pedida (f o f') en coordenadas de DATOS. Devuelve una o
 * varias polilíneas: corta el trazo en los `cortes` y donde el valor sale del
 * rango visible (asíntotas naturales como la de tan x cerca de ±π/2).
 */
export function muestrear(id: FuncId, which: Curva, n = 420): Pt2[][] {
  const f = func(id);
  const polis: Pt2[][] = [];
  let actual: Pt2[] = [];
  const lo = f.vista.xmin;
  const hi = f.vista.xmax;
  let prevX = lo;
  for (let i = 0; i <= n; i++) {
    const x = lo + ((hi - lo) * i) / n;
    const cruza = f.cortes.some((c) => prevX < c && x >= c);
    if (cruza && actual.length > 1) { polis.push(actual); actual = []; }
    const y = valorEn(id, which, x);
    if (Number.isFinite(y) && y >= f.vista.ymin - 0.5 && y <= f.vista.ymax + 0.5) {
      actual.push([x, y]);
    } else if (actual.length > 1) {
      polis.push(actual); actual = [];
    } else {
      actual = [];
    }
    prevX = x;
  }
  if (actual.length > 1) polis.push(actual);
  return polis;
}

/**
 * Recorta la recta infinita y = m·x + b al rectángulo de la vista. Devuelve los
 * dos extremos del segmento visible (o [] si no cruza el rectángulo).
 */
export function clipRecta(m: number, b: number, v: Vista): Pt2[] {
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

/** Ecuación de la recta tangente a f en x = a (m = f'(a), b = f(a) − m·a). */
export function tangente(id: FuncId, a: number): { m: number; b: number } {
  const m = deriv(id, a);
  const b = evalFunc(id, a) - m * a;
  return { m, b };
}

/* ── Contenido pedagógico (verbatim-alineado A2) ──────────────────────────── */
export const IDEAS: string[] = [
  "Derivadas básicas trascendentes: (sen x)' = cos x, (cos x)' = −sen x, (tan x)' = sec²x, (eˣ)' = eˣ y (ln x)' = 1/x.",
  "Por linealidad, la derivada de una suma de funciones es la suma de sus derivadas y las constantes multiplicativas se conservan.",
  "La exponencial con argumento k·x usa la cadena: (e^(kx))' = k·e^(kx). Por eso (e^(2x))' = 2e^(2x).",
  "El logaritmo se deriva siempre con la cadena: (ln u)' = u'/u. Aquí, con u = x²+1, queda 2x/(x²+1).",
  "Funciones trigonométricas compuestas también usan la cadena: (sen u)' = cos(u)·u'. Con u = x³ se obtiene 3x²·cos(x³).",
  "La derivada f'(x) es a su vez una FUNCIÓN: su ALTURA en x = a es la pendiente de la tangente a f en ese punto.",
];

export const DATOS: { valor: string; texto: string; icono: string }[] = [
  { valor: "(sen x)' = cos x", texto: "y (cos x)' = −sen x: el seno y el coseno se relevan", icono: "fa-wave-square" },
  { valor: "(tan x)' = sec²x", texto: "tangente: sec²x = 1/cos²x, siempre ≥ 1", icono: "fa-angle-up" },
  { valor: "(e^(kx))' = k·e^(kx)", texto: "exponencial con cadena: baja el factor k", icono: "fa-bolt" },
  { valor: "(ln u)' = u'/u", texto: "logaritmo: derivada del interior sobre el interior", icono: "fa-divide" },
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

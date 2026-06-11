/**
 * Datos para el laboratorio "La función y su derivada: las cuatro reglas"
 * (PM-V-P04-A2, ejercicio_matematico "Ejercicios de derivación con todas las
 * reglas"; UAC PM-V Cálculo Diferencial; progresión 4).
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabReglas.tsx) y la escena 3D (ReglasScene.tsx).
 *
 * Idea pedagógica (MCCEMS 2025 — PM-V P4, verbatim A2):
 *  · Derivar es aplicar REGLAS. La derivada f'(x) es a su vez una FUNCIÓN: una
 *    curva nueva cuya ALTURA en x = a vale la PENDIENTE de la tangente a f en a.
 *  · Cuatro reglas básicas: potencia, producto, cociente y cadena.
 *  · Donde f crece, f'(x) > 0 (la curva de la derivada va por encima del eje);
 *    donde f decrece, f'(x) < 0; donde la tangente es horizontal, f'(x) = 0.
 *
 * Casos verbatim del A2 (deriva indicando la regla):
 *  (a) f(x) = 3x⁵ − 2x³ + 7x − 1   → f'(x) = 15x⁴ − 6x² + 7        (potencia)
 *  (b) g(x) = (x² + 1)(3x − 2)      → g'(x) = 9x² − 4x + 3          (producto)
 *  (c) h(x) = (x² + 1)/(x − 1)      → h'(x) = (x² − 2x − 1)/(x−1)²  (cociente)
 *  (d) k(x) = (2x³ + 1)⁴            → k'(x) = 24x²(2x³ + 1)³        (cadena)
 *
 * Todas las derivadas son SIMBÓLICAS EXACTAS (las reglas aplicadas a mano). La
 * escena dibuja f y f' a una escala propia por caso para que ambas curvas quepan.
 */

export type FuncId = "potencia" | "producto" | "cociente" | "cadena";
export type Curva = "f" | "d";
export type Pt2 = [number, number];

export const FUNC_DEF: FuncId = "producto";

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
  regla: string;          // nombre de la regla
  reglaFormula: string;   // forma simbólica de la regla
  expr: string;           // fórmula de f
  derivExpr: string;      // fórmula de f'
  vista: Vista;
  cortes: number[];       // x donde se rompe la polilínea (cociente → [1])
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
    id: "potencia",
    label: "3x⁵ − 2x³ + 7x − 1",
    titulo: "f(x) = 3x⁵ − 2x³ + 7x − 1 — regla de la potencia",
    icono: "fa-superscript",
    color: "#34D399",
    regla: "Potencia (término a término)",
    reglaFormula: "(xⁿ)' = n·xⁿ⁻¹",
    expr: "f(x) = 3x⁵ − 2x³ + 7x − 1",
    derivExpr: "f'(x) = 15x⁴ − 6x² + 7",
    vista: {
      xmin: -1.15, xmax: 1.15, ymin: -13, ymax: 27,
      xticks: [-1, -0.5, 0, 0.5, 1], yticks: [-10, 0, 10, 20],
      xlabel: "x", ylabel: "y",
    },
    cortes: [],
    aMin: -1.1, aMax: 1.1, aDef: 1,
    contexto: "El caso verbatim del A2 (a). Se deriva cada potencia por separado: cada xⁿ aporta n·xⁿ⁻¹ y la constante −1 desaparece. La derivada f'(x) = 15x⁴ − 6x² + 7 es siempre positiva (mínimo 6.4), así que la curva de la derivada nunca baja del eje: f crece en todo su dominio.",
    pasos: [
      { etiqueta: "a", texto: "Regla de la potencia término a término sobre f(x) = 3x⁵ − 2x³ + 7x − 1." },
      { etiqueta: "1", texto: "3x⁵ → 3·5x⁴ = 15x⁴   y   −2x³ → −2·3x² = −6x²." },
      { etiqueta: "2", texto: "7x → 7·1 = 7   y   la constante −1 → 0." },
      { etiqueta: "3", texto: "f'(x) = 15x⁴ − 6x² + 7. (Es ≥ 6.4 siempre: f siempre crece.)" },
    ],
    nota: "Caso verbatim del enunciado A2 (a). La derivada de una suma es la suma de las derivadas; la constante se anula.",
  },
  {
    id: "producto",
    label: "(x² + 1)(3x − 2)",
    titulo: "g(x) = (x² + 1)(3x − 2) — regla del producto",
    icono: "fa-xmark",
    color: "#FB923C",
    regla: "Producto",
    reglaFormula: "(f·g)' = f'·g + f·g'",
    expr: "g(x) = (x² + 1)(3x − 2)",
    derivExpr: "g'(x) = 9x² − 4x + 3",
    vista: {
      xmin: -1.3, xmax: 1.9, ymin: -17, ymax: 29,
      xticks: [-1, 0, 1], yticks: [-10, 0, 10, 20],
      xlabel: "x", ylabel: "y",
    },
    cortes: [],
    aMin: -1.2, aMax: 1.8, aDef: 1,
    contexto: "El caso verbatim del A2 (b). Con la regla del producto, cada factor 'presta' su derivada: g'(x) = f'·g + f·g'. Aquí f = x² + 1 (f' = 2x) y g = 3x − 2 (g' = 3). Como el discriminante de g'(x) = 9x² − 4x + 3 es negativo, la derivada nunca toca el eje: g crece en todo su dominio.",
    pasos: [
      { etiqueta: "b", texto: "Regla del producto (f·g)' = f'·g + f·g', con f = x² + 1 y g = 3x − 2." },
      { etiqueta: "1", texto: "f' = 2x   y   g' = 3." },
      { etiqueta: "2", texto: "g'(x) = 2x·(3x − 2) + (x² + 1)·3 = 6x² − 4x + 3x² + 3." },
      { etiqueta: "3", texto: "Reduciendo términos semejantes: g'(x) = 9x² − 4x + 3." },
    ],
    nota: "Caso verbatim del enunciado A2 (b). También se podría desarrollar el producto y usar potencias; el resultado es el mismo.",
  },
  {
    id: "cociente",
    label: "(x² + 1)/(x − 1)",
    titulo: "h(x) = (x² + 1)/(x − 1) — regla del cociente",
    icono: "fa-divide",
    color: "#F472B6",
    regla: "Cociente",
    reglaFormula: "(f/g)' = (f'·g − f·g') / g²",
    expr: "h(x) = (x² + 1)/(x − 1)",
    derivExpr: "h'(x) = (x² − 2x − 1)/(x − 1)²",
    vista: {
      xmin: 1.6, xmax: 4.3, ymin: -6, ymax: 8,
      xticks: [2, 3, 4], yticks: [-4, -2, 0, 2, 4, 6],
      xlabel: "x", ylabel: "y",
    },
    cortes: [1],
    aMin: 1.75, aMax: 4.1, aDef: 2.4,
    contexto: "El caso verbatim del A2 (c). La regla del cociente: (f/g)' = (f'·g − f·g')/g². Con f = x² + 1 (f' = 2x) y g = x − 1 (g' = 1). El numerador de h' se anula en x = 1 + √2 ≈ 2.41: ahí la tangente es horizontal (mínimo de la rama). Se muestra sólo la rama x > 1 (la asíntota está en x = 1) para una lectura clara.",
    pasos: [
      { etiqueta: "c", texto: "Regla del cociente (f/g)' = (f'·g − f·g')/g², con f = x² + 1 y g = x − 1." },
      { etiqueta: "1", texto: "f' = 2x   y   g' = 1." },
      { etiqueta: "2", texto: "h'(x) = [2x·(x − 1) − (x² + 1)·1] / (x − 1)²." },
      { etiqueta: "3", texto: "= [2x² − 2x − x² − 1] / (x − 1)² = (x² − 2x − 1)/(x − 1)²." },
    ],
    nota: "Caso verbatim del enunciado A2 (c). El denominador g² = (x − 1)² es siempre positivo, así que el signo de h' lo decide su numerador.",
  },
  {
    id: "cadena",
    label: "(2x³ + 1)⁴",
    titulo: "k(x) = (2x³ + 1)⁴ — regla de la cadena",
    icono: "fa-link",
    color: "#60A5FA",
    regla: "Cadena (composición)",
    reglaFormula: "(f∘u)' = f'(u)·u'",
    expr: "k(x) = (2x³ + 1)⁴",
    derivExpr: "k'(x) = 24x²(2x³ + 1)³",
    vista: {
      xmin: -0.95, xmax: 0.5, ymin: -9, ymax: 13,
      xticks: [-0.75, -0.5, -0.25, 0, 0.25, 0.5], yticks: [-5, 0, 5, 10],
      xlabel: "x", ylabel: "y",
    },
    cortes: [],
    aMin: -0.9, aMax: 0.45, aDef: 0.4,
    contexto: "El caso verbatim del A2 (d). La regla de la cadena deriva 'de afuera hacia adentro': exterior u⁴ (→ 4u³) por la derivada del interior u = 2x³ + 1 (→ 6x²). Fíjate cómo la cadena AMPLIFICA: aunque k(x) se ve pequeña, su derivada k'(x) = 24x²(2x³+1)³ alcanza valores grandes (la tangente se empina muchísimo).",
    pasos: [
      { etiqueta: "d", texto: "Regla de la cadena (f∘u)' = f'(u)·u', con exterior u⁴ e interior u = 2x³ + 1." },
      { etiqueta: "1", texto: "Derivada exterior: (u⁴)' = 4u³ = 4(2x³ + 1)³." },
      { etiqueta: "2", texto: "Derivada interior: u' = (2x³ + 1)' = 6x²." },
      { etiqueta: "3", texto: "k'(x) = 4(2x³ + 1)³ · 6x² = 24x²(2x³ + 1)³." },
    ],
    nota: "Caso verbatim del enunciado A2 (d). Sin la cadena, derivar (2x³+1)⁴ exigiría desarrollar la potencia: la regla lo resuelve en dos pasos.",
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
    case "potencia": return 3 * x ** 5 - 2 * x ** 3 + 7 * x - 1;
    case "producto": return (x * x + 1) * (3 * x - 2);
    case "cociente":
      if (Math.abs(x - 1) < 1e-9) return NaN;
      return (x * x + 1) / (x - 1);
    case "cadena": return (2 * x ** 3 + 1) ** 4;
    default: return NaN;
  }
}

/** Derivada simbólica EXACTA f'(x) (las cuatro reglas aplicadas a mano). */
export function deriv(id: FuncId, x: number): number {
  switch (id) {
    case "potencia": return 15 * x ** 4 - 6 * x * x + 7;
    case "producto": return 9 * x * x - 4 * x + 3;
    case "cociente":
      if (Math.abs(x - 1) < 1e-9) return NaN;
      return (x * x - 2 * x - 1) / ((x - 1) * (x - 1));
    case "cadena": return 24 * x * x * (2 * x ** 3 + 1) ** 3;
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
 * varias polilíneas: corta el trazo en los `cortes` (asíntotas) y donde el valor
 * sale del rango visible.
 */
export function muestrear(id: FuncId, which: Curva, n = 360): Pt2[][] {
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
  "Derivar es aplicar REGLAS: la derivada de una potencia es (xⁿ)' = n·xⁿ⁻¹; la de una suma, la suma de las derivadas; la de una constante, 0.",
  "Regla del producto: (f·g)' = f'·g + f·g'. No es f'·g' — cada factor 'presta' su derivada por turnos.",
  "Regla del cociente: (f/g)' = (f'·g − f·g')/g². El denominador g² siempre es ≥ 0, así que el signo de la derivada lo decide el numerador.",
  "Regla de la cadena: (f∘u)' = f'(u)·u'. Se deriva 'de afuera hacia adentro' y se multiplica por la derivada del interior.",
  "La derivada f'(x) es a su vez una FUNCIÓN (una curva): su ALTURA en x = a es la pendiente de la tangente a f en ese punto.",
  "Donde la curva de f' va por encima del eje, f crece; por debajo, f decrece; donde f' cruza el eje (f'=0), la tangente de f es horizontal.",
];

export const DATOS: { valor: string; texto: string; icono: string }[] = [
  { valor: "(xⁿ)' = n·xⁿ⁻¹", texto: "regla de la potencia: baja el exponente y resta 1", icono: "fa-superscript" },
  { valor: "(f·g)' = f'g + fg'", texto: "producto: cada factor presta su derivada", icono: "fa-xmark" },
  { valor: "(f/g)' = (f'g − fg')/g²", texto: "cociente: numerador cruzado sobre g²", icono: "fa-divide" },
  { valor: "(f∘u)' = f'(u)·u'", texto: "cadena: exterior por derivada del interior", icono: "fa-link" },
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

/**
 * Datos para el laboratorio "La derivada: la secante que se vuelve tangente
 * (cociente de Newton)" (PM-V-P03-A2, ejercicio_matematico "Derivando desde la
 * definición: el cociente de Newton"; UAC PM-V Cálculo Diferencial; progresión 3).
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabDerivada.tsx) y la escena 3D (DerivadaScene.tsx).
 *
 * Idea pedagógica (MCCEMS 2025 — PM-V P3, verbatim A1/A2):
 *  · El cociente de Newton (cociente diferencial) [f(x+h) − f(x)] / h es la
 *    PENDIENTE de la recta SECANTE por (x, f(x)) y (x+h, f(x+h)).
 *  · Cuando h→0, la secante se convierte en la recta TANGENTE y su pendiente es
 *    la DERIVADA:  f'(x) = lim(h→0) [f(x+h) − f(x)] / h.
 *  · f'(a) = pendiente de la tangente en (a, f(a)). Físicamente, si s(t) es la
 *    posición, s'(t) es la velocidad.
 *
 * Casos verbatim del A2:
 *  (a) f(x) = x² + 3x  → f'(x) = 2x + 3
 *  (b) f(x) = 1/x      → f'(x) = −1/x²
 *  (c) tangente a f(x) = x² en x = 2  → y = 4x − 4   (pendiente f'(2) = 4)
 * Caso físico (verbatim A1, lectura): h(t) = −5t² + 30t → h'(t) = −10t + 30
 * (velocidad); en t = 3 s la velocidad es 0 (altura máxima).
 *
 * Todos los valores son EXACTOS (la derivada es simbólica; el cociente de Newton
 * se evalúa con la fórmula real). La escena dibuja a escala propia por caso.
 */

export type FuncId = "cuadratica_lineal" | "reciproca" | "cuadratica" | "proyectil";
export type Pt2 = [number, number];

export const FUNC_DEF: FuncId = "cuadratica";

/* rango del separador h (cociente de Newton); h → 0 ⇒ secante → tangente */
export const H_MIN = 0.05;
export const H_MAX = 2.5;
export const H_DEF = 1.2;
export const H_STEP = 0.05;

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
  color: string;
  expr: string;           // fórmula de f
  derivExpr: string;      // fórmula de f'
  vista: Vista;
  cortes: number[];       // x donde se rompe la polilínea (1/x → [0])
  domMin: number;
  domMax: number;
  xStep: number;
  aMin: number;           // rango del punto de tangencia a
  aMax: number;
  aDef: number;
  unidadX: string;
  unidadY: string;
  esFisica: boolean;      // interpretación física (velocidad)
  contexto: string;
  pasos: PasoReto[];
  nota?: string;
}

/* ── Catálogo de funciones ────────────────────────────────────────────────── */
export const FUNCIONES: Funcion[] = [
  {
    id: "cuadratica",
    label: "x²  (tangente en x=2)",
    titulo: "f(x) = x² — recta tangente en x = 2",
    icono: "fa-bullseye",
    color: "#34D399",
    expr: "f(x) = x²",
    derivExpr: "f'(x) = 2x",
    vista: {
      xmin: -3.5, xmax: 3.5, ymin: -1, ymax: 10,
      xticks: [-3, -2, -1, 0, 1, 2, 3], yticks: [0, 2, 4, 6, 8, 10],
      xlabel: "x", ylabel: "f(x)",
    },
    cortes: [],
    domMin: -3.3, domMax: 3.3, xStep: 0.05,
    aMin: -3, aMax: 3, aDef: 2,
    unidadX: "", unidadY: "", esFisica: false,
    contexto: "El caso verbatim del A2 (c): la pendiente de la parábola y = x² en cualquier punto x es f'(x) = 2x. En x = 2 la pendiente es 4 y la recta tangente es y = 4x − 4. Mueve el punto de tangencia y reduce h para ver la secante convertirse en la tangente.",
    pasos: [
      { etiqueta: "1", texto: "Para f(x) = x², la derivada desde la definición es f'(x) = lim(h→0) [(x+h)² − x²]/h = lim(h→0) [2x + h] = 2x." },
      { etiqueta: "2", texto: "En x = 2: pendiente m = f'(2) = 4. Punto de tangencia: (2, f(2)) = (2, 4)." },
      { etiqueta: "3", texto: "Ecuación punto-pendiente: y − 4 = 4(x − 2) → y = 4x − 8 + 4 → y = 4x − 4." },
      { etiqueta: "4", texto: "Verificación: la tangente y = 4x − 4 pasa por (2, 4): 4(2) − 4 = 4 ✓, y tiene pendiente f'(2) = 4 ✓." },
    ],
    nota: "Caso verbatim del enunciado A2 (c). La pendiente de la secante [f(2+h) − f(2)]/h vale 4 + h, que tiende a 4 cuando h → 0.",
  },
  {
    id: "cuadratica_lineal",
    label: "x² + 3x",
    titulo: "f(x) = x² + 3x — derivada por definición",
    icono: "fa-chart-line",
    color: "#FB923C",
    expr: "f(x) = x² + 3x",
    derivExpr: "f'(x) = 2x + 3",
    vista: {
      xmin: -4, xmax: 1.5, ymin: -3, ymax: 7,
      xticks: [-4, -3, -2, -1, 0, 1], yticks: [-2, 0, 2, 4, 6],
      xlabel: "x", ylabel: "f(x)",
    },
    cortes: [],
    domMin: -4, domMax: 1.5, xStep: 0.05,
    aMin: -3.2, aMax: 1.2, aDef: 0.5,
    unidadX: "", unidadY: "", esFisica: false,
    contexto: "El caso verbatim del A2 (a). Aplicando la definición se obtiene f'(x) = 2x + 3: la pendiente de la tangente cambia con x. Donde f'(x) = 0 (en x = −3/2) la tangente es horizontal: es el vértice de la parábola.",
    pasos: [
      { etiqueta: "1", texto: "f'(x) = lim(h→0) [(x+h)² + 3(x+h) − (x²+3x)] / h." },
      { etiqueta: "2", texto: "= lim(h→0) [x² + 2xh + h² + 3x + 3h − x² − 3x] / h = lim(h→0) [2xh + h² + 3h] / h." },
      { etiqueta: "3", texto: "= lim(h→0) [2x + h + 3] = 2x + 3." },
      { etiqueta: "4", texto: "Comprobación: f'(x) = 0 ⇒ 2x + 3 = 0 ⇒ x = −3/2, justo el vértice donde la tangente es horizontal." },
    ],
    nota: "Caso verbatim del enunciado A2 (a). La pendiente de la secante [f(x+h) − f(x)]/h vale 2x + 3 + h, que tiende a 2x + 3.",
  },
  {
    id: "reciproca",
    label: "1/x",
    titulo: "f(x) = 1/x — derivada por definición",
    icono: "fa-wave-square",
    color: "#F472B6",
    expr: "f(x) = 1/x",
    derivExpr: "f'(x) = −1/x²",
    vista: {
      xmin: -4, xmax: 4, ymin: -4, ymax: 4,
      xticks: [-4, -2, -1, 0, 1, 2, 4], yticks: [-4, -2, 0, 2, 4],
      xlabel: "x", ylabel: "f(x)",
    },
    cortes: [0],
    domMin: -4, domMax: 4, xStep: 0.02,
    aMin: 0.45, aMax: 3.5, aDef: 1,
    unidadX: "", unidadY: "", esFisica: false,
    contexto: "El caso verbatim del A2 (b). Para f(x) = 1/x la derivada es f'(x) = −1/x²: SIEMPRE negativa, así que la función decrece en todo su dominio. La tangente se inclina más donde la curva es más empinada (cerca de la asíntota).",
    pasos: [
      { etiqueta: "1", texto: "f'(x) = lim(h→0) [1/(x+h) − 1/x] / h." },
      { etiqueta: "2", texto: "= lim(h→0) [x − (x+h)] / [h·x(x+h)] = lim(h→0) [−h] / [h·x(x+h)]." },
      { etiqueta: "3", texto: "= lim(h→0) −1/[x(x+h)] = −1/x²." },
      { etiqueta: "4", texto: "f'(x) = −1/x² < 0 para todo x ≠ 0: la curva siempre decrece. En x = 1, m = −1 (tangente y = −x + 2)." },
    ],
    nota: "Caso verbatim del enunciado A2 (b). Aquí el punto de tangencia se mueve sólo sobre la rama positiva (x > 0) para mantener la lectura clara.",
  },
  {
    id: "proyectil",
    label: "−5t² + 30t  (física)",
    titulo: "h(t) = −5t² + 30t — la derivada es la velocidad",
    icono: "fa-rocket",
    color: "#60A5FA",
    expr: "h(t) = −5t² + 30t",
    derivExpr: "h'(t) = −10t + 30",
    vista: {
      xmin: 0, xmax: 6.2, ymin: 0, ymax: 50,
      xticks: [0, 1, 2, 3, 4, 5, 6], yticks: [0, 10, 20, 30, 40, 50],
      xlabel: "t (s)", ylabel: "h (m)",
    },
    cortes: [],
    domMin: 0, domMax: 6.2, xStep: 0.05,
    aMin: 0.2, aMax: 5.6, aDef: 1,
    unidadX: "s", unidadY: "m", esFisica: true,
    contexto: "Interpretación física (verbatim A1): la altura de un proyectil es h(t) = −5t² + 30t. La pendiente de la tangente en el instante t es la VELOCIDAD: h'(t) = −10t + 30 m/s. La velocidad promedio en [t, t+h] (la secante) tiende a la velocidad instantánea (la tangente) cuando h → 0.",
    pasos: [
      { etiqueta: "1", texto: "Velocidad promedio en [1, 2]: [h(2) − h(1)] / 1 = [(−20 + 60) − (−5 + 30)] / 1 = [40 − 25] = 15 m/s (es la secante)." },
      { etiqueta: "2", texto: "Velocidad instantánea = derivada: h'(t) = lim(h→0) [h(t+h) − h(t)]/h = −10t + 30 m/s." },
      { etiqueta: "3", texto: "En t = 1 s: h'(1) = 20 m/s (sube). En t = 3 s: h'(3) = 0 m/s → la altura es máxima (45 m)." },
      { etiqueta: "4", texto: "Después de t = 3 s la velocidad es negativa (el proyectil baja): h'(5) = −20 m/s." },
    ],
    nota: "Interpretación física verbatim de la lectura A1 (mismo propósito P3). Liga la derivada con la velocidad; la secante es la velocidad promedio y la tangente la velocidad instantánea.",
  },
];

const FUNC_MAP: Record<FuncId, Funcion> = FUNCIONES.reduce((acc, f) => {
  acc[f.id] = f;
  return acc;
}, {} as Record<FuncId, Funcion>);

export function func(id: FuncId): Funcion {
  return FUNC_MAP[id];
}

/* ── Evaluación (exacta) ──────────────────────────────────────────────────── */
export function evalFunc(id: FuncId, x: number): number {
  switch (id) {
    case "cuadratica": return x * x;
    case "cuadratica_lineal": return x * x + 3 * x;
    case "reciproca":
      if (Math.abs(x) < 1e-9) return NaN;
      return 1 / x;
    case "proyectil": return -5 * x * x + 30 * x;
    default: return NaN;
  }
}

/** Derivada simbólica EXACTA f'(x). */
export function deriv(id: FuncId, x: number): number {
  switch (id) {
    case "cuadratica": return 2 * x;
    case "cuadratica_lineal": return 2 * x + 3;
    case "reciproca":
      if (Math.abs(x) < 1e-9) return NaN;
      return -1 / (x * x);
    case "proyectil": return -10 * x + 30;
    default: return NaN;
  }
}

/** Pendiente de la secante (cociente de Newton) por (a, f(a)) y (a+h, f(a+h)). */
export function pendienteSecante(id: FuncId, a: number, h: number): number {
  if (Math.abs(h) < 1e-12) return NaN;
  return (evalFunc(id, a + h) - evalFunc(id, a)) / h;
}

/** ¿hay un corte (asíntota) entre a y a+h? (la secante no sería válida). */
export function cruzaCorte(id: FuncId, a: number, h: number): boolean {
  const f = func(id);
  const lo = Math.min(a, a + h);
  const hi = Math.max(a, a + h);
  return f.cortes.some((c) => c > lo + 1e-9 && c < hi - 1e-9);
}

export function enDominio(id: FuncId, x: number): boolean {
  const f = func(id);
  return x >= f.domMin - 1e-9 && x <= f.domMax + 1e-9;
}

/**
 * Muestrea la curva en coordenadas de DATOS. Devuelve una o varias polilíneas:
 * corta el trazo en los `cortes` (asíntotas) y donde f(x) sale del rango visible.
 */
export function muestrear(id: FuncId, n = 320): Pt2[][] {
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
    const y = evalFunc(id, x);
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
  // dedupe
  const out: Pt2[] = [];
  for (const p of cand) {
    if (!out.some((q) => Math.abs(q[0] - p[0]) < 1e-4 && Math.abs(q[1] - p[1]) < 1e-4)) out.push(p);
  }
  return out.length >= 2 ? [out[0]!, out[out.length - 1]!] : [];
}

/** Ecuación de la recta tangente en x = a (m = f'(a), b = f(a) − m·a). */
export function tangente(id: FuncId, a: number): { m: number; b: number } {
  const m = deriv(id, a);
  const b = evalFunc(id, a) - m * a;
  return { m, b };
}

/* ── Tabla de acercamiento: pendiente de la secante cuando h → 0 ──────────── */
export interface FilaSecante { h: number; pendiente: number; valido: boolean; }

export function tablaSecante(id: FuncId, a: number): { der: FilaSecante[]; izq: FilaSecante[] } {
  const hs = [0.5, 0.1, 0.05, 0.01];
  const fila = (h: number): FilaSecante => {
    const valido = !cruzaCorte(id, a, h) && Number.isFinite(evalFunc(id, a + h)) && Number.isFinite(evalFunc(id, a));
    return { h, pendiente: valido ? pendienteSecante(id, a, h) : NaN, valido };
  };
  return {
    der: hs.map((h) => fila(h)),
    izq: hs.map((h) => fila(-h)),
  };
}

/* ── Contenido pedagógico (verbatim-alineado A1/A2) ───────────────────────── */
export const IDEAS: string[] = [
  "El cociente de Newton [f(x+h) − f(x)] / h es la pendiente de la recta SECANTE por (x, f(x)) y (x+h, f(x+h)).",
  "Cuando h → 0 la secante se convierte en la recta TANGENTE; su pendiente es la DERIVADA: f'(x) = lim(h→0) [f(x+h) − f(x)]/h.",
  "f'(a) es la pendiente de la tangente en (a, f(a)): positiva ⇒ la función crece, negativa ⇒ decrece, cero ⇒ posible máximo/mínimo.",
  "Recta tangente (punto-pendiente): y − f(a) = f'(a)·(x − a). Para x² en x = 2 da y = 4x − 4.",
  "Físicamente, si s(t) es la posición, s'(t) es la velocidad: la secante es la velocidad promedio y la tangente la velocidad instantánea.",
  "Si f es derivable en a, entonces f es continua en a; el recíproco es falso (|x| es continua en 0 pero no derivable: hay un pico).",
];

export const DATOS: { valor: string; texto: string; icono: string }[] = [
  { valor: "f'(x) = lim(h→0) cociente", texto: "la derivada es el límite del cociente de Newton", icono: "fa-infinity" },
  { valor: "x² → 2x", texto: "tangente en x = 2: y = 4x − 4 (m = 4)", icono: "fa-bullseye" },
  { valor: "1/x → −1/x²", texto: "siempre negativa: la curva decrece", icono: "fa-wave-square" },
  { valor: "h'(t) = −10t + 30", texto: "velocidad; en t = 3 s vale 0 (altura máxima)", icono: "fa-rocket" },
];

/* ── Formato ──────────────────────────────────────────────────────────────── */
const ES = (n: number, dec: number) =>
  n.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 }).replace("-", "−");

export const fmt0 = (n: number): string => ES(n, 0);
export const fmt1 = (n: number): string => ES(n, 1);
export const fmt2 = (n: number): string => ES(n, 2);
export const fmt3 = (n: number): string => ES(n, 3);

export function conUnidad(n: number, unidad: string, dec = 2): string {
  if (!Number.isFinite(n)) return "indefinido";
  const s = ES(n, dec);
  return unidad ? `${s} ${unidad}` : s;
}

/** Cadena legible "y = m x + b" (maneja signos, m = ±1, b ≈ 0, m = 0). */
export function rectaStr(m: number, b: number): string {
  const mr = Math.round(m * 1000) / 1000;
  const br = Math.round(b * 1000) / 1000;
  if (Math.abs(mr) < 1e-9) return `y = ${ES(br, 2)}`;
  let mPart: string;
  if (Math.abs(mr - 1) < 1e-9) mPart = "x";
  else if (Math.abs(mr + 1) < 1e-9) mPart = "−x";
  else mPart = `${ES(mr, 2)}x`;
  let bPart = "";
  if (Math.abs(br) >= 1e-9) bPart = br > 0 ? ` + ${ES(br, 2)}` : ` − ${ES(Math.abs(br), 2)}`;
  return `y = ${mPart}${bPart}`;
}

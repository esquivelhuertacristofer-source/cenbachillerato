/**
 * Datos para el laboratorio "El diferencial: la recta tangente como
 * aproximación" (PM-V-P08-A2, ejercicio_matematico "Aplicando diferenciales
 * para estimar errores y valores"; UAC PM-V Cálculo Diferencial; progresión 8).
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabDiferencial.tsx) y la escena 3D (DiferencialScene.tsx).
 *
 * Idea pedagógica (MCCEMS 2025 — PM-V P8, verbatim A2):
 *  Cerca de un punto base a, la RECTA TANGENTE es casi idéntica a la curva. Esa
 *  recta es la LINEALIZACIÓN  L(x) = f(a) + f'(a)·(x − a). El DIFERENCIAL
 *  dy = f'(a)·dx es el cambio MEDIDO SOBRE LA TANGENTE cuando x avanza dx; el
 *  cambio real es Δy = f(a + dx) − f(a). Para dx pequeño, dy ≈ Δy, y la brecha
 *  |f(x) − L(x)| (el ERROR) es diminuta. Dos usos:
 *   · Estimar valores sin calculadora:  f(a + dx) ≈ f(a) + f'(a)·dx.
 *   · Estimar/propagar errores de medición:  si y = f(x), entonces dy = f'(x)·dx.
 *
 * Casos verbatim del A2:
 *  (a) √(9.04) con f(x) = √x en a = 9:  L(x) = 3 + (1/6)(x − 9) → L(9.04) ≈ 3.0067.
 *  (b) e^(0.1) con f(x) = eˣ en a = 0:  L(x) = 1 + x → L(0.1) = 1.1 (real ≈ 1.1052).
 *  (c) esfera r = 5.0 ± 0.05 cm:  dV = 4πr²·dr = 5π ≈ 15.71 cm³; error relativo
 *      dV/V = 3·dr/r = 3 %  (1 % en el radio → 3 % en el volumen).
 *
 * Todos los valores son de cálculo cerrado / funciones exactas.
 */

export type Pt2 = [number, number];

export interface Vista {
  xmin: number; xmax: number; ymin: number; ymax: number;
  xticks: number[]; yticks: number[];
  xlabel: string; ylabel: string;
}

/* ════════════════════════════════════════════════════════════════════════════
 * MODO 1 — ESTIMAR UN VALOR (linealización de una función)
 * ════════════════════════════════════════════════════════════════════════════ */

export type LinId = "raiz" | "exp";

export interface LinCaso {
  id: LinId;
  etiqueta: string;      // "√x"
  titulo: string;
  fExpr: string;         // "f(x) = √x"
  d1Expr: string;        // "f'(x) = 1 / (2√x)"
  lExpr: string;         // "L(x) = 3 + (1/6)(x − 9)"
  a: number;             // punto base de la linealización
  xEval: number;         // punto verbatim a estimar (9.04 / 0.1)
  xmin: number;          // rango explorable de la sonda x
  xmax: number;
  color: string;
  vista: Vista;
  f: (x: number) => number;
  d1: (x: number) => number;
  pasos: string[];       // resolución verbatim del A2
}

export const LIN_CASOS: LinCaso[] = [
  {
    id: "raiz",
    etiqueta: "√x",
    titulo: "Estimar √(9.04)",
    fExpr: "f(x) = √x",
    d1Expr: "f'(x) = 1 / (2√x)",
    lExpr: "L(x) = 3 + (1/6)(x − 9)",
    a: 9,
    xEval: 9.04,
    xmin: 4,
    xmax: 16,
    color: "#2DD4BF",
    vista: {
      xmin: 3.5, xmax: 16.5, ymin: 1.2, ymax: 4.6,
      xticks: [4, 6, 8, 9, 10, 12, 14, 16],
      yticks: [1.5, 2, 2.5, 3, 3.5, 4, 4.5],
      xlabel: "x", ylabel: "y",
    },
    f: (x) => Math.sqrt(x),
    d1: (x) => 1 / (2 * Math.sqrt(x)),
    pasos: [
      "f(x) = √x, f'(x) = 1/(2√x). En a = 9: f(9) = 3, f'(9) = 1/6.",
      "Linealización: L(x) = 3 + (1/6)(x − 9).",
      "Para x = 9.04: L(9.04) = 3 + (1/6)(0.04) = 3 + 0.00667 ≈ 3.0067.",
      "Valor real √9.04 ≈ 3.00666; el error de la aproximación es menor a 0.0001.",
    ],
  },
  {
    id: "exp",
    etiqueta: "eˣ",
    titulo: "Estimar e^(0.1)",
    fExpr: "f(x) = eˣ",
    d1Expr: "f'(x) = eˣ",
    lExpr: "L(x) = 1 + x",
    a: 0,
    xEval: 0.1,
    xmin: -1.4,
    xmax: 1.4,
    color: "#fbbf24",
    vista: {
      xmin: -1.6, xmax: 1.6, ymin: -0.6, ymax: 4.8,
      xticks: [-1.5, -1, -0.5, 0, 0.5, 1, 1.5],
      yticks: [0, 1, 2, 3, 4],
      xlabel: "x", ylabel: "y",
    },
    f: (x) => Math.exp(x),
    d1: (x) => Math.exp(x),
    pasos: [
      "f(x) = eˣ, f'(x) = eˣ. En a = 0: f(0) = 1, f'(0) = 1.",
      "Linealización: L(x) = 1 + 1·(x − 0) = 1 + x.",
      "Para x = 0.1: L(0.1) = 1 + 0.1 = 1.1.",
      "Valor real e^0.1 ≈ 1.1052; el error es menor al 0.5 %.",
    ],
  },
];

export function linCaso(id: LinId): LinCaso {
  return LIN_CASOS.find((c) => c.id === id) ?? LIN_CASOS[0]!;
}

/** Linealización L(x) = f(a) + f'(a)(x − a) del caso dado. */
export function lineal(c: LinCaso, x: number): number {
  return c.f(c.a) + c.d1(c.a) * (x - c.a);
}

/**
 * Muestrea la curva f del caso sobre su vista (una o varias polilíneas,
 * cortando donde se sale del recuadro visible).
 */
export function muestrear(c: LinCaso, n = 360): Pt2[][] {
  const v = c.vista;
  const polis: Pt2[][] = [];
  let actual: Pt2[] = [];
  for (let i = 0; i <= n; i++) {
    const x = v.xmin + ((v.xmax - v.xmin) * i) / n;
    const y = c.f(x);
    if (Number.isFinite(y) && y >= v.ymin - 0.5 && y <= v.ymax + 0.5) {
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

/** Recorta la recta y = m·x + b al rectángulo de la vista. */
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

/** La recta tangente (= linealización) en el punto base: m = f'(a), b = f(a) − m·a. */
export function tangenteBase(c: LinCaso): { m: number; b: number } {
  const m = c.d1(c.a);
  const b = c.f(c.a) - m * c.a;
  return { m, b };
}

export interface LinLectura {
  dx: number;        // x − a
  dy: number;        // f'(a)·dx  (diferencial: cambio sobre la tangente)
  deltaY: number;    // f(a+dx) − f(a)  (cambio real)
  real: number;      // f(x)  (valor real)
  estimado: number;  // L(x)  (valor estimado)
  error: number;     // |real − estimado|
}

export function linLectura(c: LinCaso, x: number): LinLectura {
  const dx = x - c.a;
  const dy = c.d1(c.a) * dx;
  const real = c.f(x);
  const estimado = lineal(c, x);
  return {
    dx,
    dy,
    deltaY: real - c.f(c.a),
    real,
    estimado,
    error: Math.abs(real - estimado),
  };
}

/* ════════════════════════════════════════════════════════════════════════════
 * MODO 2 — ESTIMAR UN ERROR (diferencial del volumen de una esfera)
 * ════════════════════════════════════════════════════════════════════════════ */

export const R_BASE = 5;       // cm (radio medido, verbatim A2)
export const DR_BASE = 0.05;   // cm (incertidumbre, verbatim A2)
export const R_MIN = 1;
export const R_MAX = 8;
export const DR_MIN = 0.01;
export const DR_MAX = 0.5;

export const PI = Math.PI;

/** Volumen de la esfera, V = (4/3)π r³. */
export function volEsfera(r: number): number { return (4 / 3) * PI * r * r * r; }

/** Área de la superficie, A = 4π r². */
export function areaEsfera(r: number): number { return 4 * PI * r * r; }

/** Diferencial del volumen, dV = 4π r²·dr (= área × grosor). */
export function dVol(r: number, dr: number): number { return areaEsfera(r) * dr; }

/** Incremento REAL del volumen, ΔV = V(r+dr) − V(r). */
export function dVolReal(r: number, dr: number): number { return volEsfera(r + dr) - volEsfera(r); }

/** Error relativo del volumen en %, dV/V·100 = (3·dr/r)·100. */
export function errorPctVol(r: number, dr: number): number { return (3 * dr / r) * 100; }

export interface EsferaLectura {
  V: number;        // volumen
  area: number;     // superficie
  dV: number;       // diferencial (estimado)
  dVreal: number;   // incremento real
  pct: number;      // % de error en volumen
}

export function esferaLectura(r: number, dr: number): EsferaLectura {
  return {
    V: volEsfera(r),
    area: areaEsfera(r),
    dV: dVol(r, dr),
    dVreal: dVolReal(r, dr),
    pct: errorPctVol(r, dr),
  };
}

/* ── Contenido pedagógico (verbatim-alineado A2 / A1) ─────────────────────── */
export interface PasoReto { etiqueta: string; texto: string; }

export const PASOS_ESFERA: PasoReto[] = [
  { etiqueta: "1", texto: "El volumen depende del radio: V = (4/3)π r³. Su diferencial es dV = 4π r²·dr, que es exactamente el área de la superficie (4π r²) por el grosor dr." },
  { etiqueta: "2", texto: "Con r = 5.0 cm y dr = 0.05 cm: dV = 4π(25)(0.05) = 4π(1.25) = 5π ≈ 15.71 cm³. Ese es el error máximo estimado del volumen: ±15.7 cm³." },
  { etiqueta: "3", texto: "Error relativo: (dV/V)·100 = (4π r²·dr)/[(4/3)π r³]·100 = (3·dr/r)·100 = (3·0.05/5)·100 = 3 %." },
  { etiqueta: "4", texto: "Conclusión: un error del 1 % en el radio produce un 3 % de error en el volumen (el exponente 3 de r³ amplifica el error)." },
];

export const IDEAS: string[] = [
  "Cerca de un punto base a, la recta tangente y la curva casi coinciden: por eso L(x) = f(a) + f'(a)(x − a) sirve para estimar f cerca de a.",
  "El diferencial dy = f'(a)·dx es el cambio MEDIDO SOBRE LA TANGENTE; el cambio real es Δy = f(a+dx) − f(a). Para dx pequeño, dy ≈ Δy.",
  "El error de la aproximación, |f(x) − L(x)|, crece cuando te alejas del punto base o cuando la curva se dobla más (mayor concavidad).",
  "Estimar valores: √(9.04) ≈ 3 + (1/6)(0.04) ≈ 3.0067 y e^0.1 ≈ 1 + 0.1 = 1.1, sin calculadora.",
  "Propagar errores: si y = f(x), una incertidumbre dx en la medición produce dy = f'(x)·dx en el resultado.",
  "En la esfera, dV = 4π r²·dr = (superficie)·(grosor): el error del volumen es como una cáscara delgada; en términos relativos, dV/V = 3·dr/r.",
];

export const DATOS: { valor: string; texto: string; icono: string }[] = [
  { valor: "L(x) = f(a) + f'(a)(x − a)", texto: "linealización: la recta tangente", icono: "fa-ruler" },
  { valor: "dy = f'(a)·dx", texto: "diferencial: cambio sobre la tangente", icono: "fa-arrows-up-down" },
  { valor: "dV = 4π r²·dr", texto: "error del volumen = superficie × grosor", icono: "fa-globe" },
  { valor: "dV/V = 3·dr/r", texto: "1 % en r → 3 % en el volumen", icono: "fa-percent" },
];

/* ── Formato (es-MX; el signo menos tipográfico) ──────────────────────────── */
const ES = (n: number, dec: number) =>
  n.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 }).replace("-", "−");

export const fmt0 = (n: number): string => ES(n, 0);
export const fmt1 = (n: number): string => ES(n, 1);
export const fmt2 = (n: number): string => ES(n, 2);
export const fmt3 = (n: number): string => ES(n, 3);
export const fmt4 = (n: number): string => ES(n, 4);

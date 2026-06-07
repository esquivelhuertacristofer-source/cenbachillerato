/**
 * Datos para el laboratorio de Inecuaciones lineales
 * (PM-II-P06-A2, "Planteo y resuelvo inecuaciones lineales"; progresión 103).
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabInecuaciones.tsx) y la escena 3D (InecuacionesScene.tsx).
 *
 * Idea pedagógica (MCCEMS 2025 — PM-II, álgebra):
 * Una INECUACIÓN compara dos cantidades con <, ≤, > o ≥. A diferencia de una
 * ecuación (solución única), su solución es un CONJUNTO infinito: un intervalo
 * sobre la recta numérica (una variable) o un SEMIPLANO en el plano (dos
 * variables). Se resuelve igual que una ecuación con UNA excepción crítica: al
 * multiplicar o dividir ambos lados por un número NEGATIVO, el signo de la
 * desigualdad se INVIERTE (−2x > 6 → x < −3). En la recta: punto abierto (○) si
 * el límite no se incluye (<, >), cerrado (●) si se incluye (≤, ≥). En el plano:
 * la recta es la frontera (continua si ≤/≥, punteada si </>) y la región
 * sombreada es el conjunto solución.
 */

/* ── Modos del laboratorio ────────────────────────────────────────────── */
export type ModoKey = "recta" | "plano";

export interface Modo {
  key: ModoKey;
  nombre: string;
  icono: string; // Font Awesome 6 (solid)
  formula: string;
  resumen: string;
}

export const MODOS: Modo[] = [
  {
    key: "recta",
    nombre: "Una variable",
    icono: "fa-arrows-left-right-to-line",
    formula: "a·x + b  ⧁  c",
    resumen:
      "Una inecuación con una incógnita. Despejas la x igual que en una ecuación, pero si divides entre un número negativo el signo se voltea. La solución es un rayo sobre la recta numérica: punto abierto (○) si el límite no se incluye, cerrado (●) si sí.",
  },
  {
    key: "plano",
    nombre: "Dos variables",
    icono: "fa-chart-area",
    formula: "a·x + b·y  ⧁  c",
    resumen:
      "Una inecuación con dos incógnitas. Su solución no es un punto: es todo un semiplano. La recta a·x + b·y = c es la frontera (continua si se incluye, punteada si no) y la región solución se eleva como una meseta. Es la base de la región factible en programación lineal.",
  },
];

export const getModo = (key: ModoKey): Modo => MODOS.find((m) => m.key === key) ?? MODOS[0]!;

/* ── Operadores de desigualdad ────────────────────────────────────────── */
export type Op = "lt" | "le" | "gt" | "ge"; // <, ≤, >, ≥

export interface OpDef {
  key: Op;
  sim: string; // símbolo
  lee: string; // lectura en español
  incluye: boolean; // ¿el límite forma parte de la solución? (≤, ≥)
  haciaMayor: boolean; // ¿la solución va hacia valores mayores? (>, ≥)
}

export const OPS: OpDef[] = [
  { key: "lt", sim: "<", lee: "menor que", incluye: false, haciaMayor: false },
  { key: "le", sim: "≤", lee: "menor o igual que", incluye: true, haciaMayor: false },
  { key: "gt", sim: ">", lee: "mayor que", incluye: false, haciaMayor: true },
  { key: "ge", sim: "≥", lee: "mayor o igual que", incluye: true, haciaMayor: true },
];

export const getOp = (k: Op): OpDef => OPS.find((o) => o.key === k) ?? OPS[0]!;

/** Invierte el sentido de la desigualdad (al multiplicar/dividir por negativo). */
export const flipOp = (k: Op): Op => (k === "lt" ? "gt" : k === "gt" ? "lt" : k === "le" ? "ge" : "le");

/* ── Rangos de los controles ──────────────────────────────────────────── */
export const A_MIN = -5;
export const A_MAX = 5;
export const A_STEP = 1;
export const B_MIN = -10;
export const B_MAX = 10;
export const B_STEP = 1;
export const C_MIN = -10;
export const C_MAX = 10;
export const C_STEP = 1;

/** Valores por defecto. Recta = ejercicio (a) 3x − 5 > 7 → x > 4. */
export const DEFAULTS = {
  recta: { a: 3, b: -5, c: 7, op: "gt" as Op },
  plano: { a: 2, b: 3, c: 6, op: "le" as Op },
};

/* ── Dominios de la escena (coordenadas matemáticas) ──────────────────── */
export const RECTA_MIN = -12;
export const RECTA_MAX = 12;
export const PLANO_MIN = -6;
export const PLANO_MAX = 6;
export const PLANO_TILES = 22; // resolución de la malla de la región (por eje)

/* ── Evaluación de la desigualdad ─────────────────────────────────────── */
/** ¿El valor del lado izquierdo cumple la desigualdad contra c? */
export const cumple = (lhs: number, c: number, op: Op): boolean => {
  switch (op) {
    case "lt": return lhs < c;
    case "le": return lhs <= c;
    case "gt": return lhs > c;
    case "ge": return lhs >= c;
  }
};

export const lhsRecta = (a: number, b: number, x: number) => a * x + b;
export const satisfaceRecta = (x: number, a: number, b: number, c: number, op: Op) =>
  cumple(a * x + b, c, op);

export const lhsPlano = (a: number, b: number, x: number, y: number) => a * x + b * y;
export const satisfacePlano = (x: number, y: number, a: number, b: number, c: number, op: Op) =>
  cumple(a * x + b * y, c, op);

/* ── Resolución de la inecuación de una variable ──────────────────────── */
export interface SolucionRecta {
  k: number; // valor frontera x = (c − b) / a
  flipped: boolean; // ¿se invirtió el signo? (a < 0)
  opFinal: Op; // operador después de despejar
  incluye: boolean; // punto cerrado (●) o abierto (○)
  haciaMayor: boolean; // rayo hacia la derecha (true) o izquierda (false)
}

/** Resuelve a·x + b OP c despejando x. Devuelve la frontera y el sentido. */
export const resolverRecta = (a: number, b: number, c: number, op: Op): SolucionRecta => {
  const k = (c - b) / a;
  const flipped = a < 0;
  const opFinal = flipped ? flipOp(op) : op;
  const o = getOp(opFinal);
  return { k, flipped, opFinal, incluye: o.incluye, haciaMayor: o.haciaMayor };
};

/* ── Frontera del semiplano (intersección de a·x + b·y = c con el dominio) ─ */
export interface Pt2 { x: number; y: number; }

/** Devuelve los dos puntos donde la recta frontera corta el cuadrado del dominio. */
export const fronteraPlano = (a: number, b: number, c: number): [Pt2, Pt2] | null => {
  const lo = PLANO_MIN, hi = PLANO_MAX;
  const pts: Pt2[] = [];
  const dentro = (v: number) => v >= lo - 1e-6 && v <= hi + 1e-6;
  if (Math.abs(b) > 1e-9) {
    for (const x of [lo, hi]) {
      const y = (c - a * x) / b;
      if (dentro(y)) pts.push({ x, y });
    }
  }
  if (Math.abs(a) > 1e-9) {
    for (const y of [lo, hi]) {
      const x = (c - b * y) / a;
      if (dentro(x)) pts.push({ x, y });
    }
  }
  // quita duplicados (esquinas)
  const uniq: Pt2[] = [];
  for (const p of pts) {
    if (!uniq.some((q) => Math.abs(q.x - p.x) < 1e-4 && Math.abs(q.y - p.y) < 1e-4)) uniq.push(p);
  }
  if (uniq.length < 2) return null;
  return [uniq[0]!, uniq[1]!];
};

/* ── Formato ──────────────────────────────────────────────────────────── */
/** Formatea un número con coma decimal es-MX y "−" tipográfico. */
export const fmtNum = (n: number, dec = 2) => {
  if (!Number.isFinite(n)) return "∞";
  const r = Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec);
  const s = r.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 });
  return s.replace("-", "−");
};

/** "+ 5", "− 3", "+ 0" para encadenar términos en un texto de fórmula. */
export const fmtSigno = (n: number) => (n < 0 ? `− ${fmtNum(Math.abs(n), 0)}` : `+ ${fmtNum(n, 0)}`);

/** Construye el texto "a·x + b" (omite coeficientes triviales). */
export const fmtTerminoX = (a: number, b: number) => {
  const ax = a === 1 ? "x" : a === -1 ? "−x" : `${fmtNum(a, 0)}x`;
  return b === 0 ? ax : `${ax} ${fmtSigno(b)}`;
};

/** Construye el texto "a·x + b·y" (omite coeficientes triviales). */
export const fmtTerminoXY = (a: number, b: number) => {
  const ax = a === 1 ? "x" : a === -1 ? "−x" : a === 0 ? "" : `${fmtNum(a, 0)}x`;
  const by = b === 1 ? "y" : b === -1 ? "−y" : b === 0 ? "" : `${fmtNum(Math.abs(b), 0)}y`;
  if (a === 0) return b < 0 ? `−${by.replace("−", "")}` : by;
  if (b === 0) return ax;
  return `${ax} ${b < 0 ? "−" : "+"} ${by.replace("−", "")}`;
};

/**
 * Datos para el laboratorio "Continuidad: las 3 condiciones, los tipos de
 * discontinuidad y el Teorema del Valor Intermedio"
 * (PM-V-P02-A2, ejercicio_matematico "Analizando discontinuidades: evitable,
 * salto y esencial"; UAC PM-V Cálculo Diferencial; progresión 2).
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabContinuidad.tsx) y la escena 3D (ContinuidadScene.tsx).
 *
 * Idea pedagógica (MCCEMS 2025 — PM-V P2, verbatim A1/A2):
 *  · Una función f es CONTINUA en x = a si y solo si se cumplen TRES condiciones:
 *      (1) f(a) existe, (2) lim(x→a) f(x) existe (laterales coinciden),
 *      (3) lim(x→a) f(x) = f(a). Si falla cualquiera, hay DISCONTINUIDAD.
 *  · EVITABLE (removible): el límite existe pero f(a) no, o difiere. Se repara.
 *  · SALTO (primera especie): los límites laterales existen pero son distintos.
 *  · ESENCIAL (segunda especie): un límite lateral no existe o es infinito (asíntota).
 *  · TEOREMA DEL VALOR INTERMEDIO: si f es continua en [a,b] y N está entre f(a)
 *    y f(b), existe c∈(a,b) con f(c)=N. (Garantiza raíces de funciones continuas.)
 *
 * Caso ancla verbatim del A2: f(x) = (x²−4)/(x−2) — discontinuidad EVITABLE en
 * x=2 (lim=4, pero f(2) no existe), reparable con F(2)=4; y el TVI sobre
 * g(x)=x³−x−1 en [1,2] (g(1)=−1, g(2)=5 → hay raíz). Los ejemplos de salto y
 * esencial son didácticos, alineados con la infografía A1.
 *
 * Todos los valores son EXACTOS (salen de la fórmula). La escena dibuja a escala
 * propia por caso para mostrar valores reales.
 */

export type Modo = "continuidad" | "tvi";
export type FuncId = "evitable" | "salto" | "esencial" | "continua";
export type Lado = "izq" | "der";

export const MODO_DEF: Modo = "continuidad";
export const FUNC_DEF: FuncId = "evitable";
export const LADO_DEF: Lado = "izq";

export type Pt2 = [number, number]; // par (x, y) en coordenadas de DATOS

/* ── Vista (mapeo datos → plano) ──────────────────────────────────────────── */
export interface Vista {
  xmin: number; xmax: number; ymin: number; ymax: number;
  xticks: number[]; yticks: number[];
  xlabel: string; ylabel: string;
}

export interface PasoReto { etiqueta: string; texto: string; }

export type TipoDiscont = "evitable" | "salto" | "esencial" | "ninguna";

export interface Funcion {
  id: FuncId;
  label: string;          // corto (chips)
  titulo: string;         // descriptivo
  icono: string;
  color: string;
  expr: string;           // fórmula de f
  exprTrozos?: string[];  // ramas (si es a trozos)
  a: number;              // punto de interés donde se analiza la continuidad
  tipo: TipoDiscont;
  tipoLabel: string;
  continua: boolean;      // ¿es continua en a?
  fa: number | null;      // f(a) (null si no existe)
  limIzq: number | null;  // límite por la izquierda (null si no existe / ±∞)
  limDer: number | null;  // límite por la derecha (null si no existe / ±∞)
  lim: number | null;     // límite bilateral (null si no existe)
  infIzq?: "+" | "-";     // signo del infinito por la izquierda (esencial)
  infDer?: "+" | "-";     // signo del infinito por la derecha (esencial)
  reparable: boolean;
  reparacion?: string;
  vista: Vista;
  cortes: number[];       // x donde se rompe la polilínea
  domMin: number;
  domMax: number;
  xStep: number;
  xDef: number;
  contexto: string;
  pasos: PasoReto[];
  nota?: string;
}

/* ── Catálogo de funciones ────────────────────────────────────────────────── */
export const FUNCIONES: Funcion[] = [
  {
    id: "evitable",
    label: "Evitable (hueco)",
    titulo: "f(x) = (x²−4)/(x−2) — discontinuidad evitable",
    icono: "fa-circle-notch",
    color: "#FB923C",
    expr: "f(x) = (x²−4)/(x−2) = x + 2",
    a: 2,
    tipo: "evitable",
    tipoLabel: "Evitable (removible)",
    continua: false,
    fa: null,
    limIzq: 4,
    limDer: 4,
    lim: 4,
    reparable: true,
    reparacion: "F(x) = (x²−4)/(x−2) si x ≠ 2, y F(2) = 4.",
    vista: {
      xmin: -2, xmax: 6, ymin: -2, ymax: 9,
      xticks: [-2, 0, 2, 4, 6], yticks: [-2, 0, 2, 4, 6, 8],
      xlabel: "x", ylabel: "f(x)",
    },
    cortes: [2],
    domMin: -2, domMax: 6, xStep: 0.05, xDef: 0.5,
    contexto: "Al sustituir x = 2 sale 0/0: f(2) NO existe (hay un hueco). Pero la curva es la recta y = x + 2 y al acercar x a 2 los valores se acercan a 4. El límite existe (=4) aunque f(2) no.",
    pasos: [
      { etiqueta: "a", texto: "Condición 1: f(2) = (4−4)/(2−2) = 0/0 — no está definida. La primera condición falla, por lo tanto f NO es continua en x = 2." },
      { etiqueta: "b", texto: "lim(x→2)(x²−4)/(x−2) = lim(x→2)(x+2)(x−2)/(x−2) = lim(x→2)(x+2) = 4. El límite existe y es finito, pero f(2) no está definida → discontinuidad evitable (removible)." },
      { etiqueta: "c", texto: "Sí se puede reparar: F(x) = (x²−4)/(x−2) si x ≠ 2, y F(2) = 4. Ahora F es continua en todo su dominio, incluyendo x = 2." },
    ],
    nota: "(x²−4)/(x−2) es idéntica a x + 2 en todas partes EXCEPTO en x = 2, donde no está definida (el anillo abierto). Caso verbatim del enunciado A2.",
  },
  {
    id: "salto",
    label: "Salto",
    titulo: "función a trozos — discontinuidad de salto",
    icono: "fa-stairs",
    color: "#60A5FA",
    expr: "f(x) = x si x < 2 ;  f(x) = x + 3 si x ≥ 2",
    exprTrozos: ["x        si x < 2", "x + 3   si x ≥ 2"],
    a: 2,
    tipo: "salto",
    tipoLabel: "De salto (primera especie)",
    continua: false,
    fa: 5,
    limIzq: 2,
    limDer: 5,
    lim: null,
    reparable: false,
    vista: {
      xmin: -1, xmax: 5, ymin: -1, ymax: 9,
      xticks: [-1, 0, 1, 2, 3, 4, 5], yticks: [0, 2, 4, 6, 8],
      xlabel: "x", ylabel: "f(x)",
    },
    cortes: [2],
    domMin: -1, domMax: 5, xStep: 0.05, xDef: 0.6,
    contexto: "Función a trozos como las tarifas por bloques de la CFE: los límites laterales existen pero son distintos (por la izquierda → 2, por la derecha → 5). La función 'salta' en x = 2, así que el límite NO existe ahí.",
    pasos: [
      { etiqueta: "1", texto: "Por la izquierda: lim(x→2⁻) f(x) = 2 (usa la rama x)." },
      { etiqueta: "2", texto: "Por la derecha: lim(x→2⁺) f(x) = 5 (usa la rama x + 3); además f(2) = 5." },
      { etiqueta: "3", texto: "Los límites laterales existen pero son distintos (2 ≠ 5) → el límite NO existe → discontinuidad de salto. No es reparable." },
    ],
    nota: "Ejemplo DIDÁCTICO de función a trozos (el enunciado A2 cita la tarifa CFE como caso de salto). El salto vale 5 − 2 = 3 unidades; los límites laterales son exactos.",
  },
  {
    id: "esencial",
    label: "Esencial (asíntota)",
    titulo: "f(x) = 1/(x−1) — discontinuidad esencial",
    icono: "fa-bolt",
    color: "#F472B6",
    expr: "f(x) = 1/(x−1)",
    a: 1,
    tipo: "esencial",
    tipoLabel: "Esencial (segunda especie)",
    continua: false,
    fa: null,
    limIzq: null,
    limDer: null,
    lim: null,
    infIzq: "-",
    infDer: "+",
    reparable: false,
    vista: {
      xmin: -2, xmax: 4, ymin: -6, ymax: 6,
      xticks: [-2, -1, 0, 1, 2, 3, 4], yticks: [-6, -4, -2, 0, 2, 4, 6],
      xlabel: "x", ylabel: "f(x)",
    },
    cortes: [1],
    domMin: -2, domMax: 4, xStep: 0.02, xDef: -0.5,
    contexto: "En x = 1 hay una asíntota vertical: por la izquierda la función baja a −∞ y por la derecha sube a +∞. Ningún límite lateral es finito, así que la discontinuidad es esencial y NO se puede reparar.",
    pasos: [
      { etiqueta: "1", texto: "f(1) = 1/0 — no está definida; la primera condición falla." },
      { etiqueta: "2", texto: "Por la izquierda lim(x→1⁻) 1/(x−1) = −∞; por la derecha lim(x→1⁺) = +∞. Ningún límite lateral es finito." },
      { etiqueta: "3", texto: "Como un límite lateral es infinito, el límite no existe → discontinuidad esencial (asíntota vertical). No es reparable por ninguna redefinición." },
    ],
    nota: "Ejemplo DIDÁCTICO de discontinuidad esencial (la infografía A1 usa 1/x). La asíntota vertical en x = 1 es real; los valores se calculan con la fórmula exacta.",
  },
  {
    id: "continua",
    label: "Continua",
    titulo: "f(x) = x² − 2x + 2 — continua en todo punto",
    icono: "fa-circle-check",
    color: "#34D399",
    expr: "f(x) = x² − 2x + 2",
    a: 1,
    tipo: "ninguna",
    tipoLabel: "Continua (sin discontinuidad)",
    continua: true,
    fa: 1,
    limIzq: 1,
    limDer: 1,
    lim: 1,
    reparable: false,
    vista: {
      xmin: -1, xmax: 4, ymin: 0, ymax: 7,
      xticks: [-1, 0, 1, 2, 3, 4], yticks: [0, 1, 2, 3, 4, 5, 6, 7],
      xlabel: "x", ylabel: "f(x)",
    },
    cortes: [],
    domMin: -1, domMax: 4, xStep: 0.05, xDef: 1,
    contexto: "Un polinomio es continuo en todos los reales: para cualquier a se cumplen las tres condiciones. En a = 1, f(1) = 1, el límite existe y vale 1, y ambos coinciden — el semáforo se pone en verde.",
    pasos: [
      { etiqueta: "1", texto: "f(1) = 1 − 2 + 2 = 1 — está definida (condición 1 ✓)." },
      { etiqueta: "2", texto: "lim(x→1) (x²−2x+2) = 1 — el límite existe (condición 2 ✓)." },
      { etiqueta: "3", texto: "lim = f(1) = 1 — coinciden (condición 3 ✓). f es continua en x = 1 (y en todo ℝ, por ser polinomial)." },
    ],
    nota: "Caso de control: los polinomios son continuos en todo ℝ. Sirve para contrastar con las tres discontinuidades.",
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
/** Valor f(x). Devuelve NaN en los puntos donde la función no está definida. */
export function evalFunc(id: FuncId, x: number): number {
  switch (id) {
    case "evitable":
      if (Math.abs(x - 2) < 1e-7) return NaN; // 0/0
      return (x * x - 4) / (x - 2);
    case "salto":
      return x < 2 ? x : x + 3;
    case "esencial":
      if (Math.abs(x - 1) < 1e-7) return NaN; // 1/0
      return 1 / (x - 1);
    case "continua":
      return x * x - 2 * x + 2;
    default:
      return NaN;
  }
}

export function enDominio(id: FuncId, x: number): boolean {
  const f = func(id);
  return x >= f.domMin - 1e-9 && x <= f.domMax + 1e-9;
}

/**
 * Muestrea la curva en coordenadas de DATOS. Devuelve una o varias polilíneas:
 * corta el trazo en los `cortes` (saltos/huecos/asíntotas) y cuando f(x) se sale
 * del rango visible (asíntotas verticales).
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
    // ¿cruzamos un corte entre prevX y x? → rompe la polilínea
    const cruzaCorte = f.cortes.some((c) => prevX < c && x >= c);
    if (cruzaCorte && actual.length > 1) {
      polis.push(actual);
      actual = [];
    }
    const y = evalFunc(id, x);
    if (Number.isFinite(y) && y >= f.vista.ymin - 0.5 && y <= f.vista.ymax + 0.5) {
      actual.push([x, y]);
    } else if (actual.length > 1) {
      polis.push(actual);
      actual = [];
    } else {
      actual = [];
    }
    prevX = x;
  }
  if (actual.length > 1) polis.push(actual);
  return polis;
}

/* ── Las tres condiciones de continuidad en x = a ─────────────────────────── */
export interface Condicion { etiqueta: string; texto: string; cumple: boolean; }

export function condiciones(id: FuncId): Condicion[] {
  const f = func(id);
  const c1 = f.fa !== null;
  const c2 = f.lim !== null;
  const c3 = c1 && c2 && f.fa !== null && f.lim !== null && Math.abs(f.fa - f.lim) < 1e-9;
  return [
    {
      etiqueta: "1",
      texto: `f(${fmt0(f.a)}) existe`,
      cumple: c1,
    },
    {
      etiqueta: "2",
      texto: `lim(x→${fmt0(f.a)}) f(x) existe (laterales coinciden)`,
      cumple: c2,
    },
    {
      etiqueta: "3",
      texto: `lim(x→${fmt0(f.a)}) f(x) = f(${fmt0(f.a)})`,
      cumple: c3,
    },
  ];
}

/* ── Teorema del Valor Intermedio (g(x) = x³ − x − 1 en [1,2], verbatim A2) ── */
export interface TviDef {
  expr: string;
  a: number;
  b: number;
  ga: number;
  gb: number;
  vista: Vista;
  contexto: string;
  pasos: PasoReto[];
  nota: string;
}

export const TVI: TviDef = {
  expr: "g(x) = x³ − x − 1",
  a: 1,
  b: 2,
  ga: -1, // g(1) = 1 − 1 − 1 = −1
  gb: 5,  // g(2) = 8 − 2 − 1 = 5
  vista: {
    xmin: 0.8, xmax: 2.2, ymin: -2, ymax: 6,
    xticks: [1, 1.5, 2], yticks: [-2, 0, 2, 4, 6],
    xlabel: "x", ylabel: "g(x)",
  },
  contexto: "Como g es continua en [1,2] (es polinomial) y g(1) = −1 < 0 < 5 = g(2), el TVI garantiza un c ∈ (1,2) con g(c) = 0: la gráfica cruza el eje X. Mueve el valor objetivo N entre −1 y 5 y observa que SIEMPRE hay un x donde g(x) = N.",
  pasos: [
    { etiqueta: "1", texto: "g(1) = 1 − 1 − 1 = −1 < 0." },
    { etiqueta: "2", texto: "g(2) = 8 − 2 − 1 = 5 > 0." },
    { etiqueta: "3", texto: "g es continua en [1,2] (es polinomial) y g(1) < 0 < g(2)." },
    { etiqueta: "4", texto: "Por el TVI existe al menos un c ∈ (1,2) con g(c) = 0 → hay una raíz en (1,2)." },
  ],
  nota: "g(x)=x³−x−1 y el intervalo [1,2] son verbatim del A2. La raíz c se obtiene por bisección sobre la fórmula real (no hay solución elemental sencilla).",
};

export function evalG(x: number): number {
  return x * x * x - x - 1;
}

/**
 * Bisección sobre [1,2] para hallar c con g(c) = N (N entre g(1) y g(2)).
 * g es estrictamente creciente en [1,2] (g'(x)=3x²−1>0 ahí), así que la raíz es única.
 */
export function bisectN(N: number, iter = 60): number {
  let lo = TVI.a;
  let hi = TVI.b;
  // g(lo)-N < 0 < g(hi)-N porque g es creciente
  for (let i = 0; i < iter; i++) {
    const mid = (lo + hi) / 2;
    const v = evalG(mid) - N;
    if (v === 0) return mid;
    if (v < 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Muestrea g(x) en la vista del TVI. */
export function muestrearG(n = 240): Pt2[] {
  const pts: Pt2[] = [];
  const lo = TVI.vista.xmin;
  const hi = TVI.vista.xmax;
  for (let i = 0; i <= n; i++) {
    const x = lo + ((hi - lo) * i) / n;
    pts.push([x, evalG(x)]);
  }
  return pts;
}

/* ── Contenido pedagógico (verbatim-alineado A1/A2) ───────────────────────── */
export const IDEAS: string[] = [
  "f es CONTINUA en x = a si y solo si: (1) f(a) existe, (2) el límite existe y (3) el límite es igual a f(a). Si falla cualquiera, hay discontinuidad.",
  "Discontinuidad EVITABLE: el límite existe, pero f(a) no está definida o difiere. Se repara redefiniendo f(a) = límite.",
  "Discontinuidad de SALTO: los límites laterales existen pero son distintos (las tarifas por bloques de la CFE funcionan así).",
  "Discontinuidad ESENCIAL: un límite lateral es infinito o no existe (asíntota vertical, como 1/x). No se puede reparar.",
  "Los polinomios son continuos en todo ℝ; las funciones racionales lo son salvo donde se anula el denominador.",
  "Teorema del Valor Intermedio: si f es continua en [a,b] y N está entre f(a) y f(b), existe c∈(a,b) con f(c)=N. Garantiza la existencia de raíces (base de la bisección).",
];

export const DATOS: { valor: string; texto: string; icono: string }[] = [
  { valor: "3 condiciones", texto: "f(a) existe · lim existe · lim = f(a)", icono: "fa-traffic-light" },
  { valor: "evitable → repara", texto: "(x²−4)/(x−2): lim = 4, se define F(2) = 4", icono: "fa-circle-notch" },
  { valor: "salto / esencial", texto: "límites laterales distintos / asíntota: no se reparan", icono: "fa-stairs" },
  { valor: "TVI: raíz en (1,2)", texto: "g(1)=−1, g(2)=5 → existe c con g(c)=0", icono: "fa-arrow-down-up-across-line" },
];

/* ── Formato ──────────────────────────────────────────────────────────────── */
const ES = (n: number, dec: number) =>
  n.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 }).replace("-", "−");

export const fmt0 = (n: number): string => ES(n, 0);
export const fmt1 = (n: number): string => ES(n, 1);
export const fmt2 = (n: number): string => ES(n, 2);
export const fmt3 = (n: number): string => ES(n, 3);

/** Número con su unidad (la unidad puede ser ""). */
export function conUnidad(n: number, unidad: string, dec = 2): string {
  if (!Number.isFinite(n)) return "indefinido";
  const s = ES(n, dec);
  return unidad ? `${s} ${unidad}` : s;
}

/** Texto de un valor de límite/valor que puede no existir o ser ±∞. */
export function valOInf(v: number | null, signo?: "+" | "-"): string {
  if (v !== null) return fmt2(v);
  if (signo === "+") return "+∞";
  if (signo === "-") return "−∞";
  return "no existe";
}

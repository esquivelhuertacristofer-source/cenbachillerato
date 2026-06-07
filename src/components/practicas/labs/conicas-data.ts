/**
 * Datos para el laboratorio "Cónicas: circunferencia y parábola como lugares
 * geométricos" (PM-IV-P07-A1, infografía; UAC PM-IV "Pensamiento Matemático IV";
 * progresión 7: "Analiza cónicas básicas: circunferencia y parábola como lugares
 * geométricos en el plano").
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabConicas.tsx) y la escena 3D (ConicasScene.tsx).
 *
 * Idea pedagógica (MCCEMS 2025 — PM-IV P7): las cónicas se DEFINEN como lugares
 * geométricos (el conjunto de todos los puntos que cumplen una condición):
 *   · CIRCUNFERENCIA = puntos que equidistan de un CENTRO fijo (la distancia es el
 *     radio r). Ecuación canónica: (x − h)² + (y − k)² = r².
 *   · PARÁBOLA = puntos que equidistan de un punto fijo (FOCO) y de una recta fija
 *     (DIRECTRIZ). Con vértice en el origen y eje vertical: x² = 4py, con foco
 *     (0, p) y directriz y = −p; equivalente a y = (1/4p)·x².
 * Todos los valores son EXACTOS (cálculo cerrado, sin simulación).
 */

/* ── Modo ─────────────────────────────────────────────────────────────────── */
export type Modo = "circunferencia" | "parabola";

/* ── CIRCUNFERENCIA: controles ────────────────────────────────────────────── */
export const H_MIN = -6, H_MAX = 6, K_MIN = -6, K_MAX = 6, R_MIN = 1, R_MAX = 8, C_STEP = 1;
export const H_DEF = 1, K_DEF = -1, R_DEF = 4;
// punto de prueba Q (¿dentro, sobre o fuera?)
export const QX_DEF = 4, QY_DEF = 2;

export type EstadoPunto = "dentro" | "sobre" | "fuera";

export interface Circ {
  h: number; k: number; r: number;
  area: number;          // π r²
  perimetro: number;     // 2π r
  // punto de prueba
  qx: number; qy: number;
  distQ: number;         // distancia de Q al centro
  estadoQ: EstadoPunto;  // dentro / sobre / fuera
}

const EPS = 1e-6;

/** Calcula la circunferencia y clasifica el punto de prueba Q (exacto). */
export function calcCirc(h: number, k: number, r: number, qx: number, qy: number): Circ {
  const distQ = Math.hypot(qx - h, qy - k);
  const estadoQ: EstadoPunto =
    Math.abs(distQ - r) < EPS ? "sobre" : distQ < r ? "dentro" : "fuera";
  return {
    h, k, r,
    area: Math.PI * r * r,
    perimetro: 2 * Math.PI * r,
    qx, qy, distQ, estadoQ,
  };
}

/** Puntos de la circunferencia (lugar geométrico) para dibujar la curva. */
export function curvaCirc(h: number, k: number, r: number, pasos = 96): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i <= pasos; i++) {
    const a = (i / pasos) * Math.PI * 2;
    pts.push([h + r * Math.cos(a), k + r * Math.sin(a)]);
  }
  return pts;
}

/* ── PARÁBOLA: controles ──────────────────────────────────────────────────── */
// p = distancia del vértice al foco (y del vértice a la directriz). Vértice en el
// origen, eje vertical, abre hacia arriba (p > 0). Ecuación x² = 4py.
export const P_MIN = 0.25, P_MAX = 4, P_STEP = 0.25, P_DEF = 1;
// medio-ancho del trazo de la parábola (en x), para la curva y la propiedad focal
export const PARAB_HALF = 5;

export interface Parab {
  p: number;             // parámetro focal
  a: number;             // coeficiente: a = 1/(4p), de modo que y = a·x²
  focoX: number; focoY: number;   // foco (0, p)
  directrizY: number;    // recta y = −p
}

/** Calcula los elementos de la parábola x² = 4py (exacto). */
export function calcParab(p: number): Parab {
  return { p, a: 1 / (4 * p), focoX: 0, focoY: p, directrizY: -p };
}

/** Punto de la parábola para el parámetro t (la coordenada x): (t, t²/4p). */
export function puntoParab(t: number, p: number): [number, number] {
  return [t, (t * t) / (4 * p)];
}

/**
 * Para un punto P sobre la parábola, su distancia al foco y su distancia a la
 * directriz son IGUALES (esa es la definición de la parábola como lugar
 * geométrico). Devuelve ambas para mostrar la igualdad.
 */
export function distanciasParab(t: number, p: number): { aFoco: number; aDirectriz: number } {
  const [px, py] = puntoParab(t, p);
  const aFoco = Math.hypot(px - 0, py - p);
  const aDirectriz = Math.abs(py - -p); // distancia vertical a y = −p
  return { aFoco, aDirectriz };
}

/** Puntos de la parábola (lugar geométrico) para dibujar la curva. */
export function curvaParab(p: number, half = PARAB_HALF, pasos = 80): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i <= pasos; i++) {
    const x = -half + (i / pasos) * (2 * half);
    pts.push([x, (x * x) / (4 * p)]);
  }
  return pts;
}

/* ── Escenarios guiados (valores verbatim de PM-IV-P07) ───────────────────── */
export interface EscenarioCirc {
  label: string; icono: string; h: number; k: number; r: number; desc: string;
}
export const ESCENARIOS_CIRC: EscenarioCirc[] = [
  { label: "Centro (3,−2), r=5", icono: "fa-circle-dot", h: 3, k: -2, r: 5, desc: "Circunferencia con centro (3, −2) y radio 5: (x−3)² + (y+2)² = 25." },
  { label: "x²+y²=25", icono: "fa-bullseye", h: 0, k: 0, r: 5, desc: "Centro en el origen y radio 5: la forma más simple, x² + y² = 25." },
  { label: "Centro (2,−3), r=4", icono: "fa-circle-notch", h: 2, k: -3, r: 4, desc: "x² + y² − 4x + 6y − 3 = 0 completando el cuadrado → (x−2)² + (y+3)² = 16." },
  { label: "Centro (−4,1), r=3", icono: "fa-circle", h: -4, k: 1, r: 3, desc: "Centro en el segundo cuadrante: (x+4)² + (y−1)² = 9." },
];

export interface EscenarioParab {
  label: string; icono: string; p: number; desc: string;
}
export const ESCENARIOS_PARAB: EscenarioParab[] = [
  { label: "Antena x²=4(0.25)y", icono: "fa-satellite-dish", p: 0.25, desc: "Antena satelital doméstica: x² = 4(0.25)y. Foco en (0, 0.25), directriz y = −0.25." },
  { label: "p = 1 (x²=4y)", icono: "fa-circle-dot", p: 1, desc: "Parábola x² = 4y: foco en (0, 1) y directriz y = −1. Equivale a y = ¼x²." },
  { label: "p = 2 (más abierta)", icono: "fa-arrows-left-right-to-line", p: 2, desc: "x² = 8y: el foco sube a (0, 2) y la parábola se abre más." },
  { label: "p = 0.5 (más cerrada)", icono: "fa-compress", p: 0.5, desc: "x² = 2y: el foco baja a (0, 0.5) y la parábola se cierra (más profunda)." },
];

/* ── Ideas clave (verbatim-alineadas con PM-IV-P07-A1) ────────────────────── */
export const IDEAS: string[] = [
  "Un lugar geométrico es el conjunto de todos los puntos del plano que cumplen una condición. Las cónicas se definen así.",
  "Circunferencia: el conjunto de puntos que equidistan de un centro fijo. Esa distancia constante es el radio r.",
  "Ecuación canónica de la circunferencia: (x − h)² + (y − k)² = r², donde (h, k) es el centro y r el radio.",
  "Un punto está dentro de la circunferencia si su distancia al centro es menor que r, sobre ella si es igual a r, y fuera si es mayor.",
  "Parábola: el conjunto de puntos que equidistan de un punto fijo (foco) y de una recta fija (directriz).",
  "Parábola canónica con vértice en el origen y eje vertical: x² = 4py. El foco está en (0, p) y la directriz es y = −p.",
  "Propiedad focal: todo rayo paralelo al eje se refleja exactamente hacia el foco. Por eso el GTM del INAOE (reflector parabólico de 50 m) y las antenas satelitales concentran la señal en el receptor.",
  "Una cónica es la curva al cortar un cono de doble napa con un plano: perpendicular al eje → circunferencia; paralelo a una generatriz → parábola.",
];

/* ── Datos / fórmulas (panel) ─────────────────────────────────────────────── */
export const DATOS: { valor: string; texto: string; icono: string }[] = [
  { valor: "(x−h)² + (y−k)² = r²", texto: "circunferencia: centro (h, k) y radio r", icono: "fa-circle-dot" },
  { valor: "x² = 4py", texto: "parábola: foco (0, p), directriz y = −p", icono: "fa-bullseye" },
  { valor: "dist al foco = dist a la directriz", texto: "la condición que define la parábola", icono: "fa-arrows-up-down" },
  { valor: "dist al centro = r", texto: "la condición que define la circunferencia", icono: "fa-ruler-combined" },
];

/* ── Formato ──────────────────────────────────────────────────────────────── */
const ES = (n: number, dec: number) =>
  n.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 }).replace("-", "−");

export const fmtNum = (n: number): string => ES(n, 3);
export const fmtNum2 = (n: number): string => ES(n, 2);
export const fmtInt = (n: number): string => ES(Math.round(n), 0);
/** Formatea un par ordenado (x, y). */
export const fmtPar = (x: number, y: number): string => `(${ES(x, 2)}, ${ES(y, 2)})`;

/** Un término binomial con signo: (x − 3), (x + 2) o x si el valor es 0. */
function term(varName: string, v: number): string {
  if (Math.abs(v) < EPS) return varName;
  return v > 0 ? `(${varName} − ${ES(v, 2)})` : `(${varName} + ${ES(-v, 2)})`;
}

/** Ecuación canónica de la circunferencia, p. ej. "(x − 3)² + (y + 2)² = 25". */
export function ecCircunferencia(h: number, k: number, r: number): string {
  return `${term("x", h)}² + ${term("y", k)}² = ${ES(r * r, 2)}`;
}

/** Ecuación de la parábola en forma x² = 4py. */
export function ecParabFoco(p: number): string {
  return `x² = 4(${ES(p, 2)})y`;
}
/** Ecuación de la parábola en forma y = a·x² (a = 1/4p). */
export function ecParabAbierta(p: number): string {
  return `y = ${ES(1 / (4 * p), 3)} x²`;
}

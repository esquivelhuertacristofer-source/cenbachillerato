/**
 * Datos para el laboratorio "El círculo unitario genera las ondas seno y coseno"
 * (PM-IV-P04-A2, ejercicio_matematico; UAC PM-IV "Pensamiento Matemático IV";
 * progresión 4: "Extiende las razones trigonométricas a ángulos en el círculo
 * unitario y maneja sus valores").
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabCirculoUnitario.tsx) y la escena 3D (CirculoUnitarioScene.tsx).
 *
 * Idea pedagógica (MCCEMS 2025 — PM-IV P4): en el triángulo rectángulo el seno y
 * el coseno solo viven entre 0° y 90°. El CÍRCULO UNITARIO (radio 1, centro en
 * el origen) los EXTIENDE a cualquier ángulo: el punto que gira es siempre
 *   P = (cos θ, sen θ)
 * y al recorrer el círculo su ALTURA (la coordenada vertical) va dibujando la
 * onda SENO, mientras su posición HORIZONTAL dibuja la onda COSENO. Por eso son
 * funciones periódicas y por eso conservan signo según el cuadrante. La identidad
 * sen²θ + cos²θ = 1 es, literalmente, el Teorema de Pitágoras del triángulo que
 * se forma dentro del círculo (catetos sen y cos, hipotenusa = radio = 1).
 *
 * Todo es matemática EXACTA: en los ángulos notables se muestran los valores
 * cerrados (√3/2, √2/2, 1/2, …) y la medida en radianes (π/6, π/4, …).
 */

/* ── Control (el ángulo θ, en grados) ─────────────────────────────────────── */
export const THETA_MIN = 0, THETA_MAX = 360, THETA_STEP = 1, THETA_DEF = 30;

export type Cuadrante = 1 | 2 | 3 | 4 | "eje";

export interface Trig {
  deg: number;
  rad: number;
  cos: number;
  sin: number;
  tan: number | null;   // null cuando cos = 0 (90°, 270°): indefinida
  cuadrante: Cuadrante;
  refDeg: number;        // ángulo de referencia (agudo respecto al eje X)
  signos: { sin: 1 | -1 | 0; cos: 1 | -1 | 0; tan: 1 | -1 | 0 };
}

const EPS = 1e-9;
const sgn = (n: number): 1 | -1 | 0 => (Math.abs(n) < EPS ? 0 : n > 0 ? 1 : -1);

/** Razones trigonométricas de θ (grados) usando el círculo unitario (exacto). */
export function calcTrig(deg: number): Trig {
  const d = ((deg % 360) + 360) % 360;
  const rad = (d * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const tanDef = Math.abs(cos) > 1e-7;
  const tan = tanDef ? sin / cos : null;

  let cuadrante: Cuadrante;
  if (Math.abs(d % 90) < EPS) cuadrante = "eje";
  else if (d < 90) cuadrante = 1;
  else if (d < 180) cuadrante = 2;
  else if (d < 270) cuadrante = 3;
  else cuadrante = 4;

  let refDeg: number;
  if (d <= 90) refDeg = d;
  else if (d <= 180) refDeg = 180 - d;
  else if (d <= 270) refDeg = d - 180;
  else refDeg = 360 - d;

  return {
    deg: d, rad, cos, sin, tan, cuadrante, refDeg,
    signos: { sin: sgn(sin), cos: sgn(cos), tan: tanDef ? sgn(tan!) : 0 },
  };
}

/* ── Valores exactos en los ángulos notables ──────────────────────────────── */
export interface Notable {
  deg: number;
  radStr: string;   // medida en radianes
  sinStr: string;
  cosStr: string;
  tanStr: string;
}

export const ANGULOS_NOTABLES: Notable[] = [
  { deg: 0,   radStr: "0",     sinStr: "0",     cosStr: "1",     tanStr: "0" },
  { deg: 30,  radStr: "π/6",   sinStr: "1/2",   cosStr: "√3/2",  tanStr: "√3/3" },
  { deg: 45,  radStr: "π/4",   sinStr: "√2/2",  cosStr: "√2/2",  tanStr: "1" },
  { deg: 60,  radStr: "π/3",   sinStr: "√3/2",  cosStr: "1/2",   tanStr: "√3" },
  { deg: 90,  radStr: "π/2",   sinStr: "1",     cosStr: "0",     tanStr: "∄" },
  { deg: 120, radStr: "2π/3",  sinStr: "√3/2",  cosStr: "−1/2",  tanStr: "−√3" },
  { deg: 135, radStr: "3π/4",  sinStr: "√2/2",  cosStr: "−√2/2", tanStr: "−1" },
  { deg: 150, radStr: "5π/6",  sinStr: "1/2",   cosStr: "−√3/2", tanStr: "−√3/3" },
  { deg: 180, radStr: "π",     sinStr: "0",     cosStr: "−1",    tanStr: "0" },
  { deg: 210, radStr: "7π/6",  sinStr: "−1/2",  cosStr: "−√3/2", tanStr: "√3/3" },
  { deg: 225, radStr: "5π/4",  sinStr: "−√2/2", cosStr: "−√2/2", tanStr: "1" },
  { deg: 240, radStr: "4π/3",  sinStr: "−√3/2", cosStr: "−1/2",  tanStr: "√3" },
  { deg: 270, radStr: "3π/2",  sinStr: "−1",    cosStr: "0",     tanStr: "∄" },
  { deg: 300, radStr: "5π/3",  sinStr: "−√3/2", cosStr: "1/2",   tanStr: "−√3" },
  { deg: 315, radStr: "7π/4",  sinStr: "−√2/2", cosStr: "√2/2",  tanStr: "−1" },
  { deg: 330, radStr: "11π/6", sinStr: "−1/2",  cosStr: "√3/2",  tanStr: "−√3/3" },
  { deg: 360, radStr: "2π",    sinStr: "0",     cosStr: "1",     tanStr: "0" },
];

/** Si θ coincide con un ángulo notable (±0.5°), devuelve sus valores exactos. */
export function valorExacto(deg: number): Notable | null {
  const d = ((deg % 360) + 360) % 360;
  for (const n of ANGULOS_NOTABLES) {
    if (Math.abs(n.deg - d) < 0.5 || (n.deg === 360 && d < 0.5)) return n;
  }
  return null;
}

/* ── Los cuatro cuadrantes (regla de signos) ──────────────────────────────── */
export interface CuadInfo {
  q: 1 | 2 | 3 | 4;
  rango: string;
  sin: "+" | "−";
  cos: "+" | "−";
  tan: "+" | "−";
  positivas: string;   // qué razones son positivas
  color: string;
}

export const CUADRANTES: CuadInfo[] = [
  { q: 1, rango: "0° – 90°",   sin: "+", cos: "+", tan: "+", positivas: "todas positivas", color: "#34D399" },
  { q: 2, rango: "90° – 180°", sin: "+", cos: "−", tan: "−", positivas: "solo el seno", color: "#60a5fa" },
  { q: 3, rango: "180° – 270°", sin: "−", cos: "−", tan: "+", positivas: "solo la tangente", color: "#c084fc" },
  { q: 4, rango: "270° – 360°", sin: "−", cos: "+", tan: "−", positivas: "solo el coseno", color: "#fbbf24" },
];

/* ── Escenarios guiados (ángulos clave) ───────────────────────────────────── */
export interface Escenario {
  label: string;
  icono: string;
  deg: number;
  desc: string;
}

export const ESCENARIOS: Escenario[] = [
  { label: "30°", icono: "fa-angle-up", deg: 30, desc: "θ = 30° (π/6) · sen = 1/2 · cos = √3/2 · Q1: todas positivas." },
  { label: "45°", icono: "fa-angle-up", deg: 45, desc: "θ = 45° (π/4) · sen = cos = √2/2 · la diagonal exacta." },
  { label: "60°", icono: "fa-angle-up", deg: 60, desc: "θ = 60° (π/3) · sen = √3/2 · cos = 1/2." },
  { label: "90°", icono: "fa-arrow-up", deg: 90, desc: "θ = 90° (π/2) · sen = 1 (máximo) · cos = 0 · tan indefinida." },
  { label: "135°", icono: "fa-angle-left", deg: 135, desc: "θ = 135° (3π/4) · Q2: el coseno ya es negativo (−√2/2)." },
  { label: "210°", icono: "fa-angle-down", deg: 210, desc: "θ = 210° (7π/6) · Q3: seno y coseno negativos, tangente positiva." },
  { label: "300°", icono: "fa-angle-right", deg: 300, desc: "θ = 300° (5π/3) · Q4: solo el coseno es positivo." },
];

/* ── Ideas clave ──────────────────────────────────────────────────────────── */
export const IDEAS: string[] = [
  "El círculo unitario tiene radio 1 y centro en el origen; cualquier punto sobre él es exactamente P = (cos θ, sen θ).",
  "El coseno es la coordenada HORIZONTAL del punto y el seno es la coordenada VERTICAL (su altura).",
  "Al girar el radio, la altura del punto va dibujando la onda SENO y su posición horizontal dibuja la onda COSENO: por eso son periódicas.",
  "Seno y coseno van desfasados 90°: cuando uno vale 1 el otro vale 0. En 3D, el punto que gira mientras avanza el tiempo traza una hélice cuyas dos sombras son esas ondas.",
  "El signo de cada razón depende del cuadrante: en Q1 todas son positivas; después solo el seno (Q2), solo la tangente (Q3) y solo el coseno (Q4).",
  "sen²θ + cos²θ = 1 siempre: es el Teorema de Pitágoras del triángulo dentro del círculo (catetos sen y cos, hipotenusa = radio = 1).",
  "Gracias al círculo, el seno y el coseno existen para CUALQUIER ángulo —no solo de 0° a 90°—: así la trigonometría se libera del triángulo rectángulo.",
];

/* ── Datos / identidades (para el panel) ──────────────────────────────────── */
export const DATOS: { valor: string; texto: string; icono: string }[] = [
  { valor: "P = (cos θ, sen θ)", texto: "todo punto del círculo unitario, para cualquier ángulo θ", icono: "fa-location-dot" },
  { valor: "radio = 1", texto: "por eso las coordenadas SON directamente el coseno y el seno", icono: "fa-ruler-combined" },
  { valor: "sen²θ + cos²θ = 1", texto: "identidad pitagórica: vale para todo ángulo", icono: "fa-square-root-variable" },
  { valor: "tan θ = sen θ / cos θ", texto: "indefinida cuando cos θ = 0 (en 90° y 270°)", icono: "fa-slash" },
];

/* ── Formato ──────────────────────────────────────────────────────────────── */
const ES = (n: number, dec: number) =>
  n.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 }).replace("-", "−");

export const fmtNum = (n: number): string => ES(n, 3);
export const fmtNum2 = (n: number): string => ES(n, 2);
export const fmtDeg = (n: number): string => `${ES(Math.round(n), 0)}°`;
export const fmtTan = (n: number | null): string => (n === null ? "∄ (indef.)" : ES(n, 3));

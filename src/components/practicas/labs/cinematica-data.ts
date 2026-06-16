/**
 * Datos para el laboratorio "Cinemática del MRUA: acelerar y frenar"
 * (CNEYT-V-P02-A2, ejercicio "Práctica de verificación y ejercicio científico";
 * UAC CNEYT-V "La energía en procesos de vida diaria"; progresión 2
 * "Describe el movimiento rectilíneo uniforme y uniformemente acelerado con
 * representaciones gráficas y algebraicas").
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabCinematica.tsx) y la escena 3D (CinematicaScene.tsx).
 *
 * Problema VERBATIM del A2 (autopista Puebla–CDMX): un automóvil parte del
 * reposo y acelera uniformemente a 3 m/s² durante 10 s; después frena con una
 * desaceleración uniforme de 5 m/s² hasta detenerse.
 *   (a) v = v₀ + a·t = 0 + 3·10 = 30 m/s ≈ 108 km/h
 *   (b) x = v₀·t + ½·a·t² = ½·3·10² = 150 m
 *   (c) frenado: t = 30/5 = 6 s,  x = 30·6 − ½·5·6² = 90 m
 *   total: 150 + 90 = 240 m.
 *
 * Movimiento rectilíneo uniformemente acelerado (MRUA) en DOS FASES, todo de
 * cálculo cerrado. v₀ = 0 (parte del reposo, verbatim). Convenciones:
 *  · Fase 1 (acelerando): a₁ > 0 durante t₁ ⇒ v₁ = a₁·t₁, x₁ = ½·a₁·t₁².
 *  · Fase 2 (frenando): desaceleración de magnitud a₂ ⇒ t₂ = v₁/a₂,
 *    x₂ = v₁·t₂ − ½·a₂·t₂² = v₁²/(2·a₂); luego el auto queda detenido.
 */

/* ── Constantes / valores verbatim del problema ───────────────────────────── */
export const V0 = 0;        // m/s — parte del reposo (verbatim)
export const A1_DEF = 3;    // m/s² — aceleración (verbatim)
export const T1_DEF = 10;   // s — duración de la aceleración (verbatim)
export const A2_DEF = 5;    // m/s² — magnitud de la desaceleración / frenado (verbatim)

/* ── Rangos explorables (sliders) ─────────────────────────────────────────── */
export const A1_MIN = 1;
export const A1_MAX = 5;
export const T1_MIN = 4;
export const T1_MAX = 12;
export const A2_MIN = 2;
export const A2_MAX = 8;

/* ── Parámetros del recorrido ─────────────────────────────────────────────── */
export interface Mov {
  a1: number;     // aceleración fase 1 (m/s²)
  t1: number;     // duración fase 1 (s)
  a2: number;     // magnitud de la desaceleración fase 2 (m/s²)
  v1: number;     // velocidad al terminar la aceleración (m/s)
  x1: number;     // distancia recorrida en la aceleración (m)
  t2: number;     // tiempo de frenado (s)
  x2: number;     // distancia recorrida al frenar (m)
  tTotal: number; // tiempo total del recorrido (s)
  xTotal: number; // distancia total (m)
}

/** Resuelve el recorrido completo de las dos fases (cálculo cerrado). */
export function resolver(a1: number, t1: number, a2: number): Mov {
  const v1 = a1 * t1;                 // v = v₀ + a·t,  v₀ = 0
  const x1 = 0.5 * a1 * t1 * t1;      // x = ½·a·t²
  const t2 = v1 / a2;                 // 0 = v₁ − a₂·t₂
  const x2 = (v1 * v1) / (2 * a2);    // = v₁·t₂ − ½·a₂·t₂²
  return { a1, t1, a2, v1, x1, t2, x2, tTotal: t1 + t2, xTotal: x1 + x2 };
}

/* ── Estado instantáneo en un tiempo t ────────────────────────────────────── */
export interface Estado {
  t: number;
  x: number;     // posición (m)
  v: number;     // velocidad (m/s)
  a: number;     // aceleración (m/s²) — con signo
  fase: 1 | 2 | 3; // 1 acelerando, 2 frenando, 3 detenido
}

/** Posición, velocidad y aceleración del auto en el instante t. */
export function estadoEn(m: Mov, t: number): Estado {
  if (t <= m.t1) {
    return { t, x: 0.5 * m.a1 * t * t, v: m.a1 * t, a: m.a1, fase: 1 };
  }
  if (t <= m.tTotal) {
    const tau = t - m.t1;
    const v = Math.max(0, m.v1 - m.a2 * tau);
    const x = m.x1 + m.v1 * tau - 0.5 * m.a2 * tau * tau;
    return { t, x, v, a: -m.a2, fase: 2 };
  }
  return { t, x: m.xTotal, v: 0, a: 0, fase: 3 };
}

/** Tiempo en el que el auto pasa por la posición `xm` (inversa de x(t)).
 *  Como x(t) es monótona creciente (el auto siempre avanza hasta detenerse),
 *  la posición se puede invertir: sirve para ARRASTRAR el auto sobre la
 *  autopista y que el instante de tiempo siga la física correcta. */
export function tiempoEnX(m: Mov, xm: number): number {
  const x = Math.max(0, Math.min(xm, m.xTotal));
  if (x <= m.x1) {
    // fase 1: x = ½·a₁·t²  ⇒  t = √(2x/a₁)
    return Math.sqrt((2 * x) / Math.max(m.a1, 1e-6));
  }
  // fase 2: ½·a₂·τ² − v₁·τ + (x − x₁) = 0  ⇒  τ = (v₁ − √(v₁² − 2·a₂·(x−x₁)))/a₂
  const c = x - m.x1;
  const disc = Math.max(0, m.v1 * m.v1 - 2 * m.a2 * c);
  const tau = (m.v1 - Math.sqrt(disc)) / Math.max(m.a2, 1e-6);
  return m.t1 + tau;
}

/* ── Muestreo para las gráficas (x-t, v-t, a-t) ───────────────────────────── */
export interface Punto { t: number; x: number; v: number; a: number; }

/** Muestrea el recorrido en `n` puntos (incluye los quiebres t₁ y t_total). */
export function muestrear(m: Mov, n = 120): Punto[] {
  const pts: Punto[] = [];
  for (let i = 0; i <= n; i++) {
    const t = (m.tTotal * i) / n;
    const e = estadoEn(m, t);
    pts.push({ t, x: e.x, v: e.v, a: e.a });
  }
  return pts;
}

/* ── Resultados clave (para tarjetas de respuesta verbatim) ───────────────── */
export interface Resultado {
  vFin: number;    // velocidad al final de la aceleración (m/s)
  vKmh: number;    // la misma en km/h
  dAccel: number;  // distancia de la aceleración (m)
  tFreno: number;  // tiempo de frenado (s)
  dFreno: number;  // distancia de frenado (m)
  dTotal: number;  // distancia total (m)
}

export function resultado(m: Mov): Resultado {
  return {
    vFin: m.v1,
    vKmh: m.v1 * 3.6,
    dAccel: m.x1,
    tFreno: m.t2,
    dFreno: m.x2,
    dTotal: m.xTotal,
  };
}

/* ── Enunciado verbatim del A2 ────────────────────────────────────────────── */
export const PROBLEMA =
  "Un automóvil en la autopista Puebla–CDMX parte del reposo y acelera uniformemente a 3 m/s² durante 10 segundos. (a) ¿Qué velocidad alcanza? (b) ¿Qué distancia recorrió en esos 10 s? (c) Si después frena con una desaceleración uniforme de 5 m/s² hasta detenerse, ¿cuánto tarda en detenerse y qué distancia adicional recorre?";

/* ── Resolución paso a paso (verbatim pasos_guia del A2) ──────────────────── */
export interface PasoReto { etiqueta: string; texto: string; }

export const PASOS: PasoReto[] = [
  { etiqueta: "Datos", texto: "v₀ = 0 (parte del reposo), a₁ = +3 m/s², t₁ = 10 s (fase de aceleración). Fase de frenado: v₀' = resultado del inciso (a), a₂ = −5 m/s² (desaceleración), v_f = 0." },
  { etiqueta: "a", texto: "Velocidad al final de la aceleración: v = v₀ + a₁·t₁ = 0 + 3 × 10 = 30 m/s. En km/h: 30 × 3.6 = 108 km/h, una velocidad típica de autopista en México." },
  { etiqueta: "b", texto: "Distancia durante la aceleración: x = v₀·t₁ + ½·a₁·t₁² = ½ × 3 × 10² = 150 m. Verificación: x = (v² − v₀²)/(2a) = 900/6 = 150 m ✓." },
  { etiqueta: "c", texto: "Tiempo de frenado: 0 = v₀' + a₂·t₂ → 0 = 30 + (−5)·t₂ → t₂ = 30/5 = 6 s." },
  { etiqueta: "c", texto: "Distancia de frenado: x₂ = v₀'·t₂ + ½·a₂·t₂² = 30×6 + ½×(−5)×36 = 180 − 90 = 90 m. Verificación: x₂ = (0 − 900)/(2×−5) = 90 m ✓." },
  { etiqueta: "✓", texto: "Resumen: (a) v = 30 m/s ≈ 108 km/h; (b) d₁ = 150 m; (c) t_freno = 6 s, d₂ = 90 m. Distancia total: 150 + 90 = 240 m." },
];

/* ── Ideas clave del MRUA ─────────────────────────────────────────────────── */
export const IDEAS: string[] = [
  "En el MRUA la aceleración es constante: la velocidad cambia de forma uniforme (en partes iguales de tiempo, partes iguales de velocidad).",
  "Las tres ecuaciones del MRUA: v = v₀ + a·t,  x = v₀·t + ½·a·t²,  v² = v₀² + 2·a·x. La tercera resuelve sin conocer el tiempo.",
  "En la gráfica v-t la PENDIENTE es la aceleración y el ÁREA bajo la recta es la distancia recorrida; en la x-t la pendiente es la velocidad.",
  "Frenar es acelerar con signo contrario al movimiento: la velocidad baja, pero el auto SIGUE avanzando hasta que v = 0 (por eso hay distancia de frenado).",
  "Con a₂ mayor (mejores frenos) el auto se detiene en menos tiempo y en menos distancia; la distancia de frenado crece con el CUADRADO de la velocidad: x = v²/(2a).",
];

/* ── Datos rápidos (tarjetas) ─────────────────────────────────────────────── */
export const DATOS: { valor: string; texto: string; icono: string }[] = [
  { valor: "v = v₀ + a·t", texto: "velocidad en el MRUA: cambia de forma uniforme", icono: "fa-gauge-high" },
  { valor: "x = v₀t + ½at²", texto: "posición: la distancia crece como t² al acelerar", icono: "fa-road" },
  { valor: "v² = v₀² + 2ax", texto: "relación sin tiempo, útil para distancias", icono: "fa-equals" },
  { valor: "área v-t = distancia", texto: "el área bajo la curva velocidad-tiempo", icono: "fa-chart-area" },
];

/* ── Formato (es-MX) ──────────────────────────────────────────────────────── */
const ES = (n: number, dec: number) =>
  n.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 }).replace("-", "−");

export const fmt0 = (n: number): string => ES(n, 0);
export const fmt1 = (n: number): string => ES(n, 1);
export const fmt2 = (n: number): string => ES(n, 2);

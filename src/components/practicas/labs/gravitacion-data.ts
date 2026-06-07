/**
 * Datos para el laboratorio "Gravitación universal: fuerza, peso y órbitas"
 * (CNEYT-V-P03-A2, ejercicio "Cálculos de gravitación: fuerza, peso y órbitas";
 * UAC CNEYT-V "La energía en procesos de vida diaria"; progresión 3
 * "Analiza la gravitación universal y sus implicaciones en el sistema solar y la
 * exploración espacial").
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabGravitacion.tsx) y la escena 3D (GravitacionScene.tsx).
 *
 * Tres incisos del A2, modelados como tres MODOS:
 *  (a) "fuerza"  — Ley de Gravitación Universal entre la Tierra y la Luna:
 *        F = G·M·m / r².  Con M_T = 5.97×10²⁴ kg, m_L = 7.34×10²² kg,
 *        r = 3.84×10⁸ m, G = 6.674×10⁻¹¹ ⇒ F ≈ 1.98×10²⁰ N.
 *  (b) "peso"    — Peso en distintos cuerpos: W = m·g (y kg-fuerza = W/g_Tierra).
 *        Persona de 70 kg en la Luna (g = 1.62) ⇒ 113.4 N ≈ 11.6 kg-fuerza.
 *  (c) "orbita"  — Órbita circular y 3.ª ley de Kepler: T = 2π·√(r³/GM),
 *        v = √(GM/r). A 35 786 km de altura ⇒ T ≈ 24 h (geoestacionaria): el
 *        satélite parece fijo porque su período iguala la rotación terrestre.
 *
 * Todo es de cálculo cerrado. Convención del proyecto: g_Tierra = 9.81 m/s².
 */

export type Modo = "fuerza" | "peso" | "orbita";

/* ── Constantes físicas ───────────────────────────────────────────────────── */
export const G = 6.674e-11;            // N·m²/kg²
export const M_TIERRA = 5.97e24;       // kg
export const M_LUNA = 7.34e22;         // kg
export const R_TIERRA_LUNA = 3.84e8;   // m (centro a centro)
export const R_TIERRA = 6.371e6;       // m (radio terrestre medio)
export const G_TIERRA = 9.81;          // m/s² (convención del proyecto)
export const GM_TIERRA = G * M_TIERRA; // ≈ 3.984×10¹⁴ m³/s²
export const T_TIERRA_H = 24;          // h — período de rotación terrestre (aprox)

/* ── (a) Fuerza gravitacional Tierra–Luna ─────────────────────────────────── */
export const R_MIN = 1.0e8;            // m
export const R_MAX = 8.0e8;            // m
export const R_DEF = R_TIERRA_LUNA;    // m (verbatim)

export interface Fuerza {
  r: number;   // distancia centro a centro (m)
  F: number;   // fuerza gravitacional (N)
}

/** Ley de Gravitación Universal entre la Tierra y la Luna a distancia r. */
export function resolverFuerza(r: number): Fuerza {
  return { r, F: (G * M_TIERRA * M_LUNA) / (r * r) };
}

export const F_DEF = resolverFuerza(R_DEF).F;   // ≈ 1.98×10²⁰ N

/* ── (b) Peso en distintos cuerpos ────────────────────────────────────────── */
export interface Cuerpo {
  id: string;
  nombre: string;
  g: number;       // gravedad superficial (m/s²)
  color: string;
  icono: string;
  rel: string;     // gravedad relativa a la Tierra (texto)
}

export const CUERPOS: Cuerpo[] = [
  { id: "luna",    nombre: "Luna",    g: 1.62,  color: "#cbd5e1", icono: "fa-moon",           rel: "0.17 g⊕" },
  { id: "marte",   nombre: "Marte",   g: 3.71,  color: "#c1440e", icono: "fa-mars",           rel: "0.38 g⊕" },
  { id: "tierra",  nombre: "Tierra",  g: 9.81,  color: "#3b82f6", icono: "fa-earth-americas", rel: "1.00 g⊕" },
  { id: "jupiter", nombre: "Júpiter", g: 24.79, color: "#e0a872", icono: "fa-circle",         rel: "2.53 g⊕" },
];

export function cuerpoPorId(id: string): Cuerpo {
  return CUERPOS.find((c) => c.id === id) ?? CUERPOS[0]!;
}

export const M_MIN = 20;
export const M_MAX = 120;
export const M_DEF = 70;          // kg (verbatim)
export const CUERPO_DEF = "luna"; // verbatim (inciso b)

export interface Peso {
  m: number;       // masa (kg)
  g: number;       // gravedad del cuerpo (m/s²)
  W: number;       // peso (N)
  kgf: number;     // peso en kilogramos-fuerza (W / g_Tierra)
  WTierra: number; // peso de la misma masa en la Tierra (N)
}

/** Peso de una masa m en un cuerpo de gravedad g. */
export function resolverPeso(m: number, g: number): Peso {
  return { m, g, W: m * g, kgf: (m * g) / G_TIERRA, WTierra: m * G_TIERRA };
}

/* ── (c) Órbita circular y 3.ª ley de Kepler ──────────────────────────────── */
export const ALT_MIN = 400e3;     // m (órbita baja, LEO)
export const ALT_MAX = 50000e3;   // m
export const ALT_GEO = 35786e3;   // m (geoestacionaria, verbatim)
export const ALT_DEF = ALT_GEO;

export interface Orbita {
  alt: number;  // altura sobre la superficie (m)
  r: number;    // radio orbital desde el centro (m)
  T: number;    // período orbital (s)
  Th: number;   // período orbital (h)
  v: number;    // rapidez orbital (m/s)
  geo: boolean; // ¿es geoestacionaria? (T ≈ 24 h)
}

/** Órbita circular a una altura `alt`: período (Kepler) y rapidez orbital. */
export function resolverOrbita(alt: number): Orbita {
  const r = R_TIERRA + alt;
  const T = 2 * Math.PI * Math.sqrt((r * r * r) / GM_TIERRA);  // s
  const Th = T / 3600;
  const v = Math.sqrt(GM_TIERRA / r);
  return { alt, r, T, Th, v, geo: Math.abs(Th - T_TIERRA_H) < 0.4 };
}

export const ORBITA_DEF = resolverOrbita(ALT_DEF);  // T ≈ 24 h, v ≈ 3.07 km/s

/* ── Enunciado verbatim del A2 ────────────────────────────────────────────── */
export const PROBLEMA =
  "Aplica la Ley de Gravitación Universal a situaciones reales del sistema Tierra-Luna y los satélites mexicanos. (a) Calcula la fuerza gravitacional entre la Tierra (M_T = 5.97×10²⁴ kg) y la Luna (m_L = 7.34×10²² kg), sabiendo que la distancia promedio entre sus centros es r = 3.84×10⁸ m. Usa G = 6.674×10⁻¹¹ N·m²/kg². (b) Una persona de 70 kg viaja en una misión espacial y llega a la Luna (g_Luna = 1.62 m/s²). ¿Cuánto pesa ahí en newtons? ¿Y en 'kilogramos-fuerza' (dividiendo entre 9.8)? (c) Los satélites Mexsat orbitan en órbita geoestacionaria a 35,786 km de altura. Explica (sin calcular) por qué esta órbita hace que el satélite parezca fijo desde la Tierra. ¿Qué condición debe cumplir el período orbital del satélite?";

/* ── Resolución paso a paso (verbatim pasos_guia del A2) ──────────────────── */
export interface PasoReto { etiqueta: string; texto: string; }

export const PASOS: PasoReto[] = [
  { etiqueta: "a", texto: "Inciso (a): F = G·M_T·m_L/r². Sustituir: F = (6.674×10⁻¹¹)(5.97×10²⁴)(7.34×10²²) / (3.84×10⁸)². Numerador: 6.674×10⁻¹¹ × 5.97×10²⁴ = 3.982×10¹⁴; luego × 7.34×10²² = 2.922×10³⁷. Denominador: (3.84×10⁸)² = 14.75×10¹⁶ = 1.475×10¹⁷. F = 2.922×10³⁷ / 1.475×10¹⁷ ≈ 1.98×10²⁰ N." },
  { etiqueta: "a", texto: "Interpretación: F ≈ 1.98×10²⁰ N es una fuerza enorme (casi 200 quintillones de newtons) que mantiene a la Luna en órbita alrededor de la Tierra y produce las mareas oceánicas en México (Golfo de México y Pacífico)." },
  { etiqueta: "b", texto: "Inciso (b): Peso en Luna = m × g_Luna = 70 × 1.62 = 113.4 N. En kg-fuerza: 113.4 / 9.8 ≈ 11.6 kg-fuerza. La persona 'pesa' apenas el 16.5% de su peso en la Tierra (70 kg × 9.8 = 686 N en la Tierra). La masa sigue siendo 70 kg." },
  { etiqueta: "c", texto: "Inciso (c): La órbita geoestacionaria a 35,786 km tiene el período orbital T = 24 h (exactamente igual al período de rotación de la Tierra sobre su propio eje). Como el satélite da exactamente la misma vuelta angular que la Tierra en el mismo tiempo, desde cualquier punto de la superficie parece inmóvil. Las antenas parabólicas (Dish, SKY México) pueden apuntar siempre al mismo punto del cielo sin mecanismo de seguimiento." },
  { etiqueta: "✓", texto: "Verificación conceptual: si el período fuera diferente al de rotación terrestre (como en una órbita baja LEO a 400 km, T ≈ 92 minutos), el satélite se movería rápidamente por el cielo y solo sería visible durante minutos desde cada punto de la Tierra." },
];

/** Respuesta final verbatim. */
export const RESPUESTA_FINAL =
  "(a) F ≈ 1.98×10²⁰ N; (b) 113.4 N ≈ 11.6 kg-fuerza (≈1/6 del peso terrestre); (c) período orbital = 24 h, igual al período de rotación terrestre";

/* ── Ideas clave de la gravitación universal ──────────────────────────────── */
export const IDEAS: string[] = [
  "Ley de Gravitación Universal: dos masas se atraen con F = G·M·m/r². La fuerza es mutua (3.ª ley de Newton): la Tierra atrae a la Luna con la misma fuerza con que la Luna atrae a la Tierra.",
  "Ley del inverso del cuadrado: si la distancia se duplica, la fuerza baja a la CUARTA parte (1/2² ). Por eso la gravedad se debilita muy rápido al alejarse, pero nunca llega a cero.",
  "Masa NO es peso: la masa (kg) es la misma en todos lados; el peso (N) es la fuerza de gravedad, W = m·g, y cambia con el cuerpo (en la Luna pesas ~1/6 que en la Tierra).",
  "3.ª ley de Kepler: T² ∝ r³. Cuanto más alta la órbita, más largo el período. Hay una sola altura (35 786 km) donde T = 24 h y el satélite gira al mismo ritmo que la Tierra.",
  "Geoestacionaria: como el satélite y la superficie completan una vuelta en el mismo tiempo, el satélite queda 'clavado' sobre el mismo punto. Por eso las antenas de SKY/Dish apuntan siempre al mismo lugar del cielo.",
];

/* ── Datos rápidos (tarjetas) ─────────────────────────────────────────────── */
export const DATOS: { valor: string; texto: string; icono: string }[] = [
  { valor: "F = G·M·m/r²", texto: "atracción gravitacional entre dos masas", icono: "fa-down-left-and-up-right-to-center" },
  { valor: "W = m·g", texto: "peso: la fuerza de gravedad sobre una masa", icono: "fa-weight-hanging" },
  { valor: "T² ∝ r³", texto: "3.ª ley de Kepler: período contra radio", icono: "fa-satellite" },
  { valor: "35 786 km → 24 h", texto: "altura geoestacionaria: parece fija", icono: "fa-satellite-dish" },
];

/* ── Formato (es-MX) ──────────────────────────────────────────────────────── */
const SUP: Record<string, string> = {
  "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
};
const sup = (n: number): string => String(n).split("").map((c) => SUP[c] ?? c).join("");

const ES = (n: number, dec: number) =>
  n.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 }).replace("-", "−");

export const fmt0 = (n: number): string => ES(n, 0);
export const fmt1 = (n: number): string => ES(n, 1);
export const fmt2 = (n: number): string => ES(n, 2);

/** Notación científica con superíndices: 1.98×10²⁰. */
export function sci(n: number, dec = 2): string {
  if (!isFinite(n)) return "—";
  if (n === 0) return "0";
  const neg = n < 0;
  const a = Math.abs(n);
  let exp = Math.floor(Math.log10(a));
  let m = a / Math.pow(10, exp);
  m = Number(m.toFixed(dec));
  if (m >= 10) { m /= 10; exp += 1; }
  return `${neg ? "−" : ""}${m.toFixed(dec)}×10${sup(exp)}`;
}

/** Distancia en km, separador de miles es-MX. */
export const fmtKm = (m: number): string => ES(m / 1000, 0);

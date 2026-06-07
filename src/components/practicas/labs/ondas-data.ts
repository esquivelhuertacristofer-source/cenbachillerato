/**
 * Datos para el laboratorio "Ondas: amplitud, frecuencia y longitud de onda"
 * (CNEYT-V-P04-A2, simulación "Simulación de ondas: amplitud, frecuencia y
 * longitud de onda"; UAC CNEYT-V "La energía en procesos de vida diaria";
 * progresión 4 "El movimiento ondulatorio: sonido, mar y terremotos").
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabOndas.tsx) y la escena 3D (OndasScene.tsx).
 *
 * Tres modos, según la simulación verbatim del A2:
 *  (a) "onda"          — generador de una onda: A, f y el medio (v) fijan la
 *        longitud de onda por la relación fundamental v = λ·f. Sube f y λ baja.
 *  (b) "interferencia" — dos ondas que se superponen: en fase → interferencia
 *        constructiva (se suman); en oposición → destructiva (se cancelan); en
 *        sentidos opuestos → onda estacionaria con nodos y antinodos.
 *  (c) "doppler"       — una fuente en movimiento comprime las ondas por delante
 *        (tono más agudo) y las estira por detrás (más grave): el efecto Doppler.
 *
 * Toda la física es de cálculo cerrado. Velocidad del sonido en aire = 340 m/s.
 */

export type Modo = "onda" | "interferencia" | "doppler";

/* ── Constantes físicas ───────────────────────────────────────────────────── */
export const V_AIRE = 340;      // m/s — sonido en aire a 20 °C (verbatim A1)
export const V_AGUA = 1480;     // m/s — sonido en agua (verbatim A1)
export const V_ACERO = 5000;    // m/s — sonido en sólidos (verbatim A1, "≈5000")

/* ── (a) Generador de onda ────────────────────────────────────────────────── */
export const A_MIN = 0.3;
export const A_MAX = 2.0;
export const A_DEF = 1.0;

export const F_MIN = 1;         // Hz (verbatim: "1-20 Hz")
export const F_MAX = 20;        // Hz
export const F_DEF = 4;

export interface Medio {
  id: string;
  nombre: string;
  v: number;     // velocidad de propagación (m/s)
  color: string;
  icono: string;
}

export const MEDIOS: Medio[] = [
  { id: "aire",  nombre: "Aire (20 °C)", v: V_AIRE,  color: "#7dd3fc", icono: "fa-wind" },
  { id: "agua",  nombre: "Agua",         v: V_AGUA,  color: "#38bdf8", icono: "fa-water" },
  { id: "acero", nombre: "Acero",        v: V_ACERO, color: "#cbd5e1", icono: "fa-gear" },
];

export const MEDIO_DEF = "aire";

export function medioPorId(id: string): Medio {
  return MEDIOS.find((mm) => mm.id === id) ?? MEDIOS[0]!;
}

export interface Onda {
  A: number;       // amplitud
  f: number;       // frecuencia (Hz)
  v: number;       // velocidad de propagación (m/s)
  lambda: number;  // longitud de onda (m) = v / f
  T: number;       // período (s) = 1 / f
  k: number;       // número de onda (rad/m) = 2π / λ
  omega: number;   // frecuencia angular (rad/s) = 2π f
}

/** Onda mecánica: longitud de onda y período a partir de A, f y v. */
export function resolverOnda(A: number, f: number, v: number): Onda {
  const lambda = v / f;
  const T = 1 / f;
  return { A, f, v, lambda, T, k: (2 * Math.PI) / lambda, omega: 2 * Math.PI * f };
}

/* ── (b) Interferencia / onda estacionaria ────────────────────────────────── */
export const FASE_MIN = 0;
export const FASE_MAX = 2 * Math.PI;
export const FASE_DEF = 0;

export interface Interferencia {
  A: number;        // amplitud de cada onda
  phi: number;      // desfase entre las dos ondas (rad)
  Ares: number;     // amplitud resultante = |2A·cos(φ/2)|
  pct: number;      // Ares / (2A)  (1 = totalmente constructiva, 0 = destructiva)
  tipo: "constructiva" | "destructiva" | "parcial";
}

/** Superposición de dos ondas iguales con desfase φ (misma dirección). */
export function resolverInterferencia(A: number, phi: number): Interferencia {
  const Ares = Math.abs(2 * A * Math.cos(phi / 2));
  const pct = Ares / (2 * A);
  const tipo: Interferencia["tipo"] =
    pct > 0.92 ? "constructiva" : pct < 0.08 ? "destructiva" : "parcial";
  return { A, phi, Ares, pct, tipo };
}

/* ── (c) Efecto Doppler ───────────────────────────────────────────────────── */
export const FD_MIN = 300;      // Hz (frecuencia de la fuente)
export const FD_MAX = 1000;
export const FD_DEF = 700;      // ≈ sirena de ambulancia

export const VS_MIN = 0;        // m/s (rapidez de la fuente)
export const VS_MAX = 120;
export const VS_DEF = 30;       // ≈ 108 km/h

export interface Doppler {
  f: number;        // frecuencia emitida (Hz)
  vs: number;       // rapidez de la fuente (m/s)
  v: number;        // velocidad del sonido (m/s)
  fAcerca: number;  // frecuencia percibida al acercarse (más aguda)
  fAleja: number;   // frecuencia percibida al alejarse (más grave)
  dAcerca: number;  // corrimiento al acercarse (Hz)
  dAleja: number;   // corrimiento al alejarse (Hz)
}

/** Efecto Doppler para una fuente que se mueve hacia / desde un observador en reposo. */
export function resolverDoppler(f: number, vs: number, v = V_AIRE): Doppler {
  const fAcerca = (f * v) / (v - vs);
  const fAleja = (f * v) / (v + vs);
  return { f, vs, v, fAcerca, fAleja, dAcerca: fAcerca - f, dAleja: f - fAleja };
}

/* ── Enunciado verbatim de la simulación A2 ───────────────────────────────── */
export const PROBLEMA =
  "Simulación de generador de ondas: el alumno configura los parámetros de una onda mecánica (amplitud, frecuencia, velocidad de propagación) y observa cómo afecta la longitud de onda y la forma de la onda. Puede comparar dos ondas (interferencia constructiva y destructiva) y explorar el efecto Doppler.";

/* ── Instrucciones verbatim de la simulación ──────────────────────────────── */
export const INSTRUCCIONES: string[] = [
  "Ajusta la frecuencia con el control deslizante (1-20 Hz)",
  "Observa cómo cambia la longitud de onda cuando aumentas la frecuencia (v = λf)",
  "Activa la segunda fuente de ondas y experimenta con interferencia",
  "Mueve la fuente para observar el efecto Doppler",
  "Registra los valores de λ, f y v para 3 configuraciones distintas",
  "Verifica la ecuación v = λf con tus datos",
];

/* ── Preguntas de reflexión verbatim ──────────────────────────────────────── */
export const PREGUNTAS: string[] = [
  "¿Qué pasa con la longitud de onda cuando duplicas la frecuencia manteniendo v constante?",
  "¿Cómo se forma una onda estacionaria? ¿Qué condición debe cumplirse?",
  "¿Por qué el sonido de una ambulancia cambia de tono cuando pasa frente a ti?",
];

/* ── Ideas clave del movimiento ondulatorio (de la lectura A1) ────────────── */
export const IDEAS: string[] = [
  "Una onda transporta ENERGÍA sin transportar materia: las partículas del medio solo oscilan en su sitio; lo que viaja es la perturbación.",
  "Relación fundamental v = λ·f. Si el medio no cambia (v constante), subir la frecuencia ACORTA la longitud de onda: al duplicar f, λ se reduce a la mitad.",
  "Amplitud ≠ frecuencia: la amplitud (A) es la intensidad (en sonido, el volumen); la frecuencia (f) es el tono (agudo/grave). Son independientes.",
  "Transversal vs longitudinal: en la transversal la perturbación es perpendicular a la propagación (ondas S, luz); en la longitudinal es paralela (sonido, ondas P).",
  "Onda estacionaria: se forma al superponerse dos ondas iguales que viajan en sentidos opuestos; aparecen NODOS fijos (siempre en reposo) y antinodos (oscilación máxima), separados λ/2.",
  "Efecto Doppler: si la fuente se acerca, las ondas se comprimen (más frecuencia, tono agudo); si se aleja, se estiran (menos frecuencia, tono grave). Así suena la sirena de una ambulancia al pasar.",
  "El SASMEX (CIRES) aprovecha que las ondas P (≈8 km/s) llegan antes que las S (≈4 km/s): detecta las P en la costa y avisa por radio a la CDMX 40–120 s antes de las ondas S destructivas.",
];

/* ── Datos rápidos (tarjetas) ─────────────────────────────────────────────── */
export const DATOS: { valor: string; texto: string; icono: string }[] = [
  { valor: "v = λ·f", texto: "relación fundamental de toda onda", icono: "fa-wave-square" },
  { valor: "340 m/s", texto: "rapidez del sonido en aire a 20 °C", icono: "fa-wind" },
  { valor: "P ≈ 8 km/s · S ≈ 4 km/s", texto: "ondas sísmicas: la P llega primero", icono: "fa-house-crack" },
  { valor: "40–120 s", texto: "margen de alerta del SASMEX", icono: "fa-tower-broadcast" },
];

/* ── Ejemplo resuelto verbatim (pregunta de comprensión A1) ───────────────── */
export const EJEMPLO = {
  enunciado: "Si una onda de sonido tiene frecuencia 680 Hz y velocidad 340 m/s, ¿cuál es su longitud de onda?",
  f: 680,
  v: 340,
  lambda: 0.5,
  solucion: "v = λ·f → λ = v/f = 340/680 = 0.5 m (50 cm).",
};

/* ── Formato (es-MX) ──────────────────────────────────────────────────────── */
const ES = (n: number, dec: number) =>
  n.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 }).replace("-", "−");

export const fmt0 = (n: number): string => ES(n, 0);
export const fmt1 = (n: number): string => ES(n, 1);
export const fmt2 = (n: number): string => ES(n, 2);

/** Longitud de onda legible: usa m, cm o km según el tamaño. */
export function fmtLambda(m: number): string {
  if (m >= 1000) return `${ES(m / 1000, 2)} km`;
  if (m >= 1) return `${ES(m, 2)} m`;
  return `${ES(m * 100, 1)} cm`;
}

/**
 * Datos para el laboratorio de Gas ideal y primera ley de la termodinámica
 * (CNEYT-II-P09-A1, "Gas ideal y primera ley de la termodinámica").
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabGasIdeal.tsx) y la escena 3D (GasIdealScene.tsx).
 *
 * Idea pedagógica (MCCEMS 2025 — CNEYT-II, termodinámica):
 * Un gas ideal es un modelo en el que las partículas no interactúan (salvo en
 * choques) y su volumen propio es despreciable. Su estado se describe con cuatro
 * variables: presión P, volumen V, temperatura T y cantidad de sustancia n. Se
 * relacionan por la ecuación de estado  PV = nRT  (R = 8.314 J/mol·K).
 *
 * El lab hace VISIBLE de dónde sale la presión: las partículas chocan contra las
 * paredes y el pistón. Si subes la temperatura, se mueven más rápido y chocan con
 * más fuerza (↑P). Si comprimes (↓V), chocan más seguido (↑P). Si metes más gas
 * (↑n), hay más choques (↑P). Y la energía interna de un gas ideal monoatómico es
 * U = 3/2·n·R·T; la primera ley ΔU = Q − W dice que esa energía solo cambia por
 * el calor que entra (Q) menos el trabajo que el gas hace al expandirse (W).
 */

/** Constante universal de los gases (J/mol·K). */
export const R_GAS = 8.314;

/** Rangos de los controles. */
export const T_MIN = 200; // K
export const T_MAX = 600;
export const T_STEP = 10;

export const V_MIN = 4; // L
export const V_MAX = 20;
export const V_STEP = 0.5;

export const N_MIN = 0.2; // mol
export const N_MAX = 2.0;
export const N_STEP = 0.1;

/** Tope del manómetro (kPa) para dibujar la barra de presión. */
export const P_GAUGE_MAX = 1500;

/** Temperatura de referencia para la rapidez relativa de las partículas (K). */
export const T_REF = 300;

/**
 * Presión del gas ideal a partir de n, T y V: P = n·R·T / V.
 * Con V en litros y P en kPa la cuenta es directa (kPa·L = J).
 */
export const presion = (n: number, T: number, V: number) => (n * R_GAS * T) / V;

/** Energía interna de un gas ideal monoatómico: U = 3/2·n·R·T (J). */
export const energiaInterna = (n: number, T: number) => 1.5 * n * R_GAS * T;

/**
 * Rapidez relativa de las partículas frente a la referencia: v_rms ∝ √T.
 * Devuelve √(T / T_REF) para escalar la animación (1 a 300 K).
 */
export const velocidadRel = (T: number) => Math.sqrt(T / T_REF);

/** Temperatura en grados Celsius (para una lectura más intuitiva). */
export const kelvinACelsius = (T: number) => T - 273.15;

/** Formatea un número con coma decimal es-MX y "−" tipográfico. */
export const fmtNum = (n: number, dec = 2) => {
  const r = Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec);
  const s = r.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 });
  return s.replace("-", "−");
};

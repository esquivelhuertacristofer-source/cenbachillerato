/**
 * Datos para el laboratorio de Conservación de la energía — el péndulo
 * (CNEYT-II-P02-A1, "Transformación, transferencia y conservación de la energía").
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabConservacion.tsx) y la escena 3D (ConservacionScene.tsx).
 *
 * Idea pedagógica (MCCEMS 2025 — CNEYT-II, conservación de la energía):
 * "la energía no se crea ni se destruye, solo se transforma". Un péndulo lo hace
 * evidente: en lo alto toda la energía es POTENCIAL (Ep = m·g·h) y la velocidad
 * es cero; en el punto más bajo toda es CINÉTICA (Ec = ½·m·v²) y la velocidad es
 * máxima. Sin fricción, la suma Ep + Ec se mantiene CONSTANTE en todo momento.
 * Con fricción, parte de la energía se disipa como calor (energía térmica) y el
 * péndulo se va deteniendo: la energía no desaparece, cambia de forma.
 */

export interface Planeta {
  key: string;
  nombre: string;
  icono: string; // Font Awesome 6 (solid, free)
  g: number; // m/s²
}

export const PLANETAS: Planeta[] = [
  { key: "tierra", nombre: "Tierra", icono: "fa-earth-americas", g: 9.81 },
  { key: "luna", nombre: "Luna", icono: "fa-moon", g: 1.62 },
  { key: "marte", nombre: "Marte", icono: "fa-mars", g: 3.71 },
  { key: "jupiter", nombre: "Júpiter", icono: "fa-circle-dot", g: 24.79 },
];

/** Rangos de los controles. */
export const ANG_MIN = 10; // grados
export const ANG_MAX = 80;
export const ANG_STEP = 1;
export const LARGO_MIN = 0.6; // m
export const LARGO_MAX = 2.4;
export const LARGO_STEP = 0.1;
export const MASA_MIN = 0.5; // kg
export const MASA_MAX = 5;
export const MASA_STEP = 0.5;

export const grados2rad = (deg: number) => (deg * Math.PI) / 180;

/** Altura del punto más bajo a la que sube el péndulo para un ángulo θ y largo L. */
export const altura = (L: number, thetaRad: number) => L * (1 - Math.cos(thetaRad));

/** Energía potencial gravitatoria Ep = m·g·h (J). */
export const energiaPotencial = (m: number, g: number, h: number) => m * g * h;

/**
 * Energía mecánica total (J) de un péndulo soltado desde el reposo a un ángulo
 * inicial θ0: toda es potencial en el punto de partida.
 */
export const energiaTotal = (m: number, g: number, L: number, theta0Rad: number) =>
  energiaPotencial(m, g, altura(L, theta0Rad));

/** Rapidez máxima (en el punto más bajo): v = √(2·g·h_max) (m/s). */
export const velocidadMax = (g: number, L: number, theta0Rad: number) =>
  Math.sqrt(2 * g * altura(L, theta0Rad));

/** Periodo aproximado (oscilaciones pequeñas): T = 2π·√(L/g) (s). */
export const periodo = (L: number, g: number) => 2 * Math.PI * Math.sqrt(L / g);

/** Formatea un número con coma decimal es-MX y "−" tipográfico. */
export const fmtNum = (n: number, dec = 2) => {
  const r = Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec);
  const s = r.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 });
  return s.replace("-", "−");
};

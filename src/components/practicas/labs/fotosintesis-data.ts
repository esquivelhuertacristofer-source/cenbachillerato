/**
 * Datos para el laboratorio de Fotosíntesis (CNEYT-III-P03-A1,
 * "Fotosíntesis: la fábrica de vida del planeta"; progresión 3). Módulo de DATOS
 * PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabFotosintesis.tsx) y la escena 3D (FotosintesisScene.tsx).
 *
 * Idea pedagógica (MCCEMS 2025 — CNEYT-III P3: "Analiza la fotosíntesis como
 * proceso fundamental de transformación de energía en los ecosistemas"):
 * la planta convierte energía LUMINOSA en energía QUÍMICA (glucosa). La ecuación
 * general, verbatim de la actividad, es:
 *
 *     6 CO₂ + 6 H₂O + energía luminosa → C₆H₁₂O₆ + 6 O₂
 *
 * Ocurre en los cloroplastos, en dos fases: las reacciones de luz (en los
 * tilacoides) capturan la luz, producen ATP y NADPH y liberan O₂ por la fotólisis
 * del agua; el ciclo de Calvin (en el estroma) usa ese ATP/NADPH para fijar el
 * CO₂ y formar glucosa. La TASA fotosintética (velocidad del proceso) depende de
 * varios factores —intensidad luminosa, concentración de CO₂, temperatura y
 * agua— y la limita el factor que esté en menor proporción (factor limitante).
 *
 * NOTA de honestidad: el modelo de tasa de este laboratorio es CUALITATIVO
 * (relativo, en %), pensado para mostrar la idea de saturación y de factor
 * limitante; no son mediciones de una especie concreta.
 */

/* ── Controles ────────────────────────────────────────────────────────── */
// Intensidad luminosa (%). A más luz, más tasa, pero hasta cierto límite (satura).
export const LUZ_MIN = 0;
export const LUZ_MAX = 100;
export const LUZ_STEP = 1;
export const LUZ_DEFAULT = 70;

// Concentración de CO₂ (%, relativa). También satura.
export const CO2_MIN = 0;
export const CO2_MAX = 100;
export const CO2_STEP = 1;
export const CO2_DEFAULT = 50;

// Temperatura (°C). Hay un óptimo para las enzimas del ciclo de Calvin.
export const TEMP_MIN = 0;
export const TEMP_MAX = 45;
export const TEMP_STEP = 1;
export const TEMP_DEFAULT = 25;

export const TEMP_OPT = 28; // óptimo enzimático aproximado

/* ── Estequiometría (ecuación balanceada, verbatim) ───────────────────── */
// 6 CO₂ + 6 H₂O + luz → C₆H₁₂O₆ + 6 O₂
export const ESTEQ = {
  co2: 6,
  h2o: 6,
  glucosa: 1,
  o2: 6,
} as const;

/* ── Fases del proceso (para el panel lateral) ────────────────────────── */
export interface Fase {
  key: string;
  nombre: string;
  lugar: string;
  resumen: string;
  color: string;
}

export const FASES: Fase[] = [
  {
    key: "luz",
    nombre: "Reacciones de luz",
    lugar: "en los tilacoides",
    resumen: "Capturan la energía luminosa, producen ATP y NADPH y liberan O₂ al romper el agua (fotólisis).",
    color: "#ffd24a",
  },
  {
    key: "calvin",
    nombre: "Ciclo de Calvin",
    lugar: "en el estroma",
    resumen: "Usa el ATP y el NADPH para fijar el CO₂ del aire y sintetizar glucosa.",
    color: "#34D399",
  },
];

/* ── Tipos de plantas según su estrategia (panel lateral) ─────────────── */
export interface TipoPlanta {
  tipo: string;
  ejemplo: string;
  ventaja: string;
}

export const TIPOS_PLANTA: TipoPlanta[] = [
  { tipo: "C3", ejemplo: "trigo, arroz, árboles", ventaja: "las más comunes; fijan el CO₂ directamente en el ciclo de Calvin" },
  { tipo: "C4", ejemplo: "maíz, caña de azúcar", ventaja: "pre-fijan y concentran el CO₂; más eficientes en calor y mucha luz" },
  { tipo: "CAM", ejemplo: "agaves, cactus, piña", ventaja: "abren sus estomas de noche; ahorran agua en ambientes áridos" },
];

/* ── Modelo de tasa fotosintética (cualitativo, 0..1) ─────────────────── */
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Respuesta saturante a la luz, normalizada a 1 en el máximo del deslizador. */
export function factorLuz(luzPct: number): number {
  const K = 25; // mitad de saturación
  const f = luzPct / (luzPct + K);
  const fMax = LUZ_MAX / (LUZ_MAX + K);
  return clamp01(f / fMax);
}

/** Respuesta saturante al CO₂, normalizada a 1 en el máximo del deslizador. */
export function factorCO2(co2Pct: number): number {
  const K = 20;
  const f = co2Pct / (co2Pct + K);
  const fMax = CO2_MAX / (CO2_MAX + K);
  return clamp01(f / fMax);
}

/** Respuesta a la temperatura: campana con óptimo enzimático (~28 °C). */
export function factorTemp(tempC: number): number {
  const sigma = 10;
  const d = tempC - TEMP_OPT;
  return clamp01(Math.exp(-(d * d) / (2 * sigma * sigma)));
}

/** Tasa fotosintética relativa (0..1): producto de los tres factores. */
export function tasa(luzPct: number, co2Pct: number, tempC: number): number {
  return clamp01(factorLuz(luzPct) * factorCO2(co2Pct) * factorTemp(tempC));
}

/** Tasa en porcentaje (0..100). */
export const tasaPct = (luz: number, co2: number, temp: number): number => tasa(luz, co2, temp) * 100;

export type FactorKey = "luz" | "co2" | "temperatura";

/** Identifica el factor que más limita la tasa (el de menor valor). */
export function factorLimitante(luzPct: number, co2Pct: number, tempC: number): FactorKey {
  const fl = factorLuz(luzPct);
  const fc = factorCO2(co2Pct);
  const ft = factorTemp(tempC);
  if (fl <= fc && fl <= ft) return "luz";
  if (fc <= fl && fc <= ft) return "co2";
  return "temperatura";
}

export const ETIQUETA_FACTOR: Record<FactorKey, string> = {
  luz: "la luz",
  co2: "el CO₂",
  temperatura: "la temperatura",
};

/* ── Formato ──────────────────────────────────────────────────────────── */
/** Porcentaje con un decimal cuando hace falta (es-MX, "−"). */
export const fmtPct = (p: number): string => {
  const dec = p < 10 ? 1 : 0;
  const r = Math.round(p * Math.pow(10, dec)) / Math.pow(10, dec);
  return r.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 }).replace("-", "−") + "%";
};

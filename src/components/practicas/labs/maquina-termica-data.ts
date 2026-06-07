/**
 * Datos para el laboratorio de Máquinas térmicas
 * (CNEYT-II-P03-A1, "Introducción a la termodinámica: leyes y aplicaciones").
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabMaquinaTermica.tsx) y la escena 3D (MaquinaTermicaScene.tsx).
 *
 * Idea pedagógica (MCCEMS 2025 — CNEYT-II, termodinámica):
 * La primera ley es la conservación de la energía aplicada al calor: ΔU = Q − W.
 * Un motor de calor toma calor de un foco caliente (Q_c), convierte una parte en
 * trabajo útil (W) y forzosamente arroja el resto (Q_f) a un foco frío. La segunda
 * ley pone el límite: ninguna máquina es 100% eficiente, porque siempre sobra
 * calor que se desecha. La eficiencia máxima posible (Carnot) depende solo de las
 * temperaturas: η = 1 − T_f / T_c. Un refrigerador es el proceso al revés: usa
 * trabajo (electricidad) para mover calor del interior frío al exterior caliente,
 * en contra de su flujo espontáneo; su rendimiento se mide con el COP = Q_f / W,
 * que en el caso ideal vale T_f / (T_c − T_f). Por eso un refri "rinde" menos
 * cuanto más caliente está afuera (días de verano).
 */

/* ── Modos de la máquina ──────────────────────────────────────────────── */
export type ModoKey = "motor" | "refrigerador";

export interface Modo {
  key: ModoKey;
  nombre: string;
  icono: string; // Font Awesome 6 (solid)
  ley: string;
  resumen: string;
}

export const MODOS: Modo[] = [
  {
    key: "motor",
    nombre: "Motor de calor",
    icono: "fa-gears",
    ley: "1.ª y 2.ª ley",
    resumen:
      "Toma calor del foco caliente (Q_c), convierte una parte en trabajo útil (W) y arroja el resto (Q_f) al foco frío. Por la 2.ª ley nunca puede aprovecharlo todo: siempre sobra calor. Su eficiencia máxima es η = 1 − T_f / T_c.",
  },
  {
    key: "refrigerador",
    nombre: "Refrigerador",
    icono: "fa-snowflake",
    ley: "2.ª ley",
    resumen:
      "Es el motor al revés: gasta trabajo eléctrico (W) para sacar calor del interior frío (Q_f) y echarlo al exterior caliente (Q_c = Q_f + W), en contra del flujo natural. Su rendimiento es el COP = Q_f / W; baja cuando afuera hace más calor.",
  },
];

export const getModo = (key: ModoKey): Modo =>
  MODOS.find((m) => m.key === key) ?? MODOS[0]!;

/* ── Temperaturas de los focos (Kelvin) ───────────────────────────────── */
export const T_CAL_MIN = 290; // K  (≈ 17 °C)
export const T_CAL_MAX = 900; // K  (≈ 627 °C)
export const T_FRIO_MIN = 250; // K  (≈ −23 °C)
export const T_FRIO_MAX = 600; // K
export const T_STEP = 5;

/** Holgura mínima entre focos: T_f siempre por debajo de T_c. */
export const T_GAP_MIN = 10; // K

/** Valores por defecto según el modo (un motor quema combustible muy caliente;
 *  un refrigerador trabaja entre el ambiente y su interior). */
export const DEFAULTS: Record<ModoKey, { tCal: number; tFrio: number }> = {
  motor: { tCal: 700, tFrio: 320 },
  refrigerador: { tCal: 308, tFrio: 278 }, // ≈ 35 °C afuera, 5 °C adentro
};

/** Calor que entra por ciclo (unidades arbitrarias) para el balance del motor. */
export const Q_CALIENTE = 100;
/** Trabajo eléctrico que se mete por ciclo en el refrigerador (unidades). */
export const W_ELECTRICO = 100;

export const kelvinACelsius = (k: number) => k - 273.15;
export const CERO_ABSOLUTO_C = -273.15;

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/** Eficiencia ideal (Carnot) de un motor de calor: η = 1 − T_f / T_c, en 0–1. */
export const eficienciaCarnot = (tCal: number, tFrio: number) =>
  clamp01(1 - tFrio / tCal);

/** Coeficiente de rendimiento ideal de un refrigerador: COP = T_f / (T_c − T_f). */
export const copRefrigerador = (tCal: number, tFrio: number) => {
  const d = tCal - tFrio;
  if (d <= 0) return Infinity;
  return tFrio / d;
};

/** Reparte el calor del foco caliente del motor en trabajo y calor de desecho. */
export const balanceMotor = (tCal: number, tFrio: number, qCal = Q_CALIENTE) => {
  const eta = eficienciaCarnot(tCal, tFrio);
  const W = eta * qCal;
  const Qf = qCal - W;
  return { eta, qCal, W, Qf };
};

/** Reparte el trabajo eléctrico del refrigerador: Q_f bombeado y Q_c expulsado. */
export const balanceRefrigerador = (tCal: number, tFrio: number, w = W_ELECTRICO) => {
  const cop = copRefrigerador(tCal, tFrio);
  const Qf = Number.isFinite(cop) ? cop * w : w * 20;
  const Qc = Qf + w;
  return { cop, w, Qf, Qc };
};

/* ── Primera ley (concepto de la lectura) ─────────────────────────────── */
/** Variación de energía interna: ΔU = Q − W. */
export const deltaU = (Q: number, W: number) => Q - W;

/** Formatea un número con coma decimal es-MX y "−" tipográfico. */
export const fmtNum = (n: number, dec = 2) => {
  if (!Number.isFinite(n)) return "∞";
  const r = Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec);
  const s = r.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 });
  return s.replace("-", "−");
};

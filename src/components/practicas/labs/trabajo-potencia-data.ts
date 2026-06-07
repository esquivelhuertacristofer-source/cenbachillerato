/**
 * Datos para el laboratorio de Trabajo y potencia mecánica
 * (CNEYT-II-P05-A1, "Trabajo y potencia mecánica: fórmulas y contexto real").
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabTrabajoPotencia.tsx) y la escena 3D (TrabajoPotenciaScene.tsx).
 *
 * Idea pedagógica (MCCEMS 2025 — CNEYT-II, energía mecánica):
 * En física, TRABAJO (W) es la transferencia de energía cuando una fuerza
 * desplaza un objeto en la dirección de esa fuerza: W = F · d · cos θ (en Joules,
 * 1 J = 1 N·m). El ángulo θ entre la fuerza y el desplazamiento es decisivo: si la
 * fuerza va en la misma dirección (θ = 0°, cos 0° = 1) todo el empuje cuenta; si es
 * perpendicular (θ = 90°, cos 90° = 0) el trabajo es CERO (cargar una mochila sin
 * caminar no hace trabajo). La POTENCIA (P) mide qué tan rápido se hace ese
 * trabajo: P = W / t (en Watts, 1 W = 1 J/s; 1 hp ≈ 746 W). Dos motores pueden
 * hacer el mismo trabajo, pero el de más potencia lo termina en menos tiempo.
 */

/* ── Modos del laboratorio ────────────────────────────────────────────── */
export type ModoKey = "trabajo" | "potencia";

export interface Modo {
  key: ModoKey;
  nombre: string;
  icono: string; // Font Awesome 6 (solid)
  formula: string;
  resumen: string;
}

export const MODOS: Modo[] = [
  {
    key: "trabajo",
    nombre: "Trabajo",
    icono: "fa-person-walking",
    formula: "W = F · d · cos θ",
    resumen:
      "Una fuerza empuja una caja por una distancia. Solo cuenta la parte de la fuerza que va en la dirección del movimiento (F · cos θ). Gira el ángulo: cuando la fuerza es perpendicular al desplazamiento (θ = 90°), el trabajo es cero.",
  },
  {
    key: "potencia",
    nombre: "Potencia",
    icono: "fa-gauge-high",
    formula: "P = W / t",
    resumen:
      "Dos máquinas levantan la misma carga a la misma altura, así que hacen el mismo trabajo. La de más potencia lo termina en menos tiempo: la potencia es la rapidez con que se hace el trabajo (t = W / P).",
  },
];

export const getModo = (key: ModoKey): Modo => MODOS.find((m) => m.key === key) ?? MODOS[0]!;

/* ── Rangos de los controles ──────────────────────────────────────────── */
// Trabajo
export const F_MIN = 10; // N
export const F_MAX = 120; // N
export const F_STEP = 5;
export const D_MIN = 1; // m
export const D_MAX = 8; // m
export const D_STEP = 0.5;
export const THETA_MIN = 0; // grados
export const THETA_MAX = 90;
export const THETA_STEP = 5;

// Potencia
export const P_MIN = 200; // W
export const P_MAX = 3000; // W
export const P_STEP = 50;

export const DEFAULTS = {
  F: 40, // N
  d: 4, // m
  theta: 0, // grados
  pA: 1000, // W
  pB: 500, // W
};

/** Trabajo (mismo W para las dos máquinas de la carrera de potencia), en Joules.
 *  Equivale a subir ≈ 153 kg a 4 m (m·g·h), un valor cómodo para la animación. */
export const W_POTENCIA = 6000; // J
/** Altura visual a la que sube la carga en el modo potencia (metros de escena). */
export const H_POTENCIA = 4;

export const HP_EN_WATT = 746; // 1 hp ≈ 746 W

const rad = (grados: number) => (grados * Math.PI) / 180;

/* ── Fórmulas (concepto de la lectura) ────────────────────────────────── */
/** Trabajo mecánico: W = F · d · cos θ  (θ en grados). En Joules. */
export const trabajo = (F: number, d: number, thetaGrados: number) =>
  F * d * Math.cos(rad(thetaGrados));

/** Componente de la fuerza útil (en la dirección del movimiento): F · cos θ. */
export const fuerzaUtil = (F: number, thetaGrados: number) => F * Math.cos(rad(thetaGrados));

/** Componente perpendicular (desperdiciada): F · sen θ. */
export const fuerzaPerp = (F: number, thetaGrados: number) => F * Math.sin(rad(thetaGrados));

/** Tiempo en realizar un trabajo W con potencia P: t = W / P (segundos). */
export const tiempo = (W: number, P: number) => (P > 0 ? W / P : Infinity);

/** Potencia: P = W / t (Watts). */
export const potenciaDesde = (W: number, t: number) => (t > 0 ? W / t : Infinity);

/** Convierte Watts a caballos de fuerza (hp). */
export const wattAHp = (w: number) => w / HP_EN_WATT;

/** Formatea un número con coma decimal es-MX y "−" tipográfico. */
export const fmtNum = (n: number, dec = 2) => {
  if (!Number.isFinite(n)) return "∞";
  const r = Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec);
  const s = r.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 });
  return s.replace("-", "−");
};

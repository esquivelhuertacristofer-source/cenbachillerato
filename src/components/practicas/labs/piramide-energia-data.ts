/**
 * Datos para el laboratorio de Pirámide de energía / flujo trófico
 * (CNEYT-III-P02-A2, "Calcula: ¿cuánta energía llega al tercer nivel trófico?";
 * progresión 2). Módulo de DATOS PUROS (sin three, sin react): lo comparten el
 * shell de UI (LabPiramideEnergia.tsx) y la escena 3D (PiramideEnergiaScene.tsx).
 *
 * También exporta RETO_A2: RetoNumericoData (el ejercicio evaluable A2 verbatim).
 *
 * Idea pedagógica (MCCEMS 2025 — CNEYT-III P2: "Explica el flujo de energía y el
 * ciclo de materia en los ecosistemas"): la energía entra por los productores
 * (fotosíntesis) y sube por la cadena trófica, pero en cada salto solo se
 * transfiere ~10% al siguiente nivel (eficiencia ecológica); el ~90% restante se
 * pierde como calor en la respiración, el movimiento y el calor corporal. Por eso
 * la energía disponible forma una PIRÁMIDE: muchísimos productores sostienen a
 * pocos depredadores tope.
 *
 * Problema verbatim de la actividad:
 *   Productores 10,000 kcal → primarios 1,000 → secundarios 100 → terciarios 10.
 *   Al nivel terciario llega 0.1% de la energía original; el 99.9% se disipó.
 *   (La "regla del 10%" es una simplificación didáctica; lo real es 5–20%.)
 */

import type { RetoNumericoData } from "./_reto-numerico";

/* ── Controles ────────────────────────────────────────────────────────── */
// Energía fijada por los productores (kcal). Por defecto, los 10,000 verbatim.
export const E0_MIN = 1000;
export const E0_MAX = 50000;
export const E0_STEP = 1000;
export const E0_DEFAULT = 10000;

// Eficiencia ecológica (%). La actividad usa 10%; A1 aclara que lo real es 5–20%.
export const EFIC_MIN = 5;
export const EFIC_MAX = 20;
export const EFIC_STEP = 1;
export const EFIC_DEFAULT = 10;

/* ── Niveles tróficos ─────────────────────────────────────────────────── */
export interface Nivel {
  key: string;
  nombre: string;
  ejemplo: string;
  icono: string; // Font Awesome 6 free solid
  color: string;
}

// Del más abundante (base) al depredador tope (cúspide).
export const NIVELES: Nivel[] = [
  { key: "productores", nombre: "Productores", ejemplo: "pastos", icono: "fa-seedling", color: "#34D399" },
  { key: "primarios", nombre: "Consumidores primarios", ejemplo: "ratones y conejos", icono: "fa-carrot", color: "#a8d84a" },
  { key: "secundarios", nombre: "Consumidores secundarios", ejemplo: "zorros", icono: "fa-paw", color: "#ffd24a" },
  { key: "terciarios", nombre: "Consumidores terciarios", ejemplo: "águilas", icono: "fa-crow", color: "#ff7a4a" },
];

export const N_NIVELES = NIVELES.length; // 4

/* ── Cálculo del flujo de energía ─────────────────────────────────────── */
export interface FlujoNivel {
  energia: number; // kcal disponibles en este nivel
  perdidaHaciaArriba: number; // kcal que se pierden como calor al pasar al siguiente nivel
  pctDelOriginal: number; // % de la energía original (E0) que queda en este nivel
}

/**
 * Energía disponible en cada nivel y la pérdida a calor hacia el siguiente.
 * efic se pasa como porcentaje (p. ej. 10 = 10%).
 */
export function flujo(e0: number, eficPct: number): FlujoNivel[] {
  const efic = eficPct / 100;
  const res: FlujoNivel[] = [];
  let actual = e0;
  for (let i = 0; i < N_NIVELES; i++) {
    const siguiente = i < N_NIVELES - 1 ? actual * efic : 0;
    const perdida = i < N_NIVELES - 1 ? actual - siguiente : 0;
    res.push({
      energia: actual,
      perdidaHaciaArriba: perdida,
      pctDelOriginal: (actual / e0) * 100,
    });
    actual = siguiente;
  }
  return res;
}

/** Energía que llega al último nivel (terciarios). */
export const energiaTope = (e0: number, eficPct: number): number => flujo(e0, eficPct)[N_NIVELES - 1]!.energia;

/** Porcentaje de la energía original que llega al último nivel. */
export const pctTope = (e0: number, eficPct: number): number => (energiaTope(e0, eficPct) / e0) * 100;

/** Calor total disipado a lo largo de toda la cadena (E0 − energía del tope). */
export const calorTotal = (e0: number, eficPct: number): number => e0 - energiaTope(e0, eficPct);

/* ── Formato ──────────────────────────────────────────────────────────── */
/** Formatea kcal con separador de miles es-MX. */
export const fmtKcal = (n: number): string => {
  const r = Math.round(n);
  return r.toLocaleString("es-MX", { maximumFractionDigits: 0 });
};

/** Formatea un porcentaje con los decimales necesarios (es-MX, "−"). */
export const fmtPct = (p: number): string => {
  let dec = 0;
  if (p < 0.1) dec = 3;
  else if (p < 1) dec = 2;
  else if (p < 10) dec = 1;
  const r = Math.round(p * Math.pow(10, dec)) / Math.pow(10, dec);
  return r.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 }).replace("-", "−") + "%";
};

/* ── Reto evaluable — VERBATIM de CNEYT-III-P02-A2 ─────────────────────── */
// VERBATIM de CNEYT-III-P02-A2 (ejercicio_matematico, tipo_respuesta "numerica").
// Aritmética verificada:
//   (a) 10 000 × 10% = 1 000 kcal  ✓
//   (b) 1 000 × 10% = 100 kcal  ✓
//   (c) 100 × 10% = 10 kcal  ✓
//   (d) (10 / 10 000) × 100 = 0.1%  ✓
export const RETO_A2: RetoNumericoData = {
  titulo: "Calcula: ¿cuánta energía llega al tercer nivel trófico?",
  contexto: "En una pradera, los productores (pastos) fijan 10,000 kcal de energía solar mediante fotosíntesis. Aplica la regla del 10% de eficiencia ecológica.",
  problema:
    "(a) ¿Cuánta energía (en kcal) estará disponible para los consumidores primarios (ratones y conejos)?\n" +
    "(b) ¿Cuánta energía estará disponible para los consumidores secundarios (zorros)?\n" +
    "(c) ¿Cuánta energía estará disponible para los consumidores terciarios (águilas)?\n" +
    "(d) ¿Qué porcentaje de la energía original de los productores llega al nivel de los consumidores terciarios?\n\n" +
    "Datos: Energía fijada por productores: 10,000 kcal. Eficiencia ecológica entre niveles: 10% (regla del 10%). Niveles: productores → consumidores primarios → consumidores secundarios → consumidores terciarios.",
  campos: [
    { etiqueta: "(a) Energía para consumidores primarios", objetivo: 1000, tolerancia: 0, unidad: "kcal", placeholder: "1000" },
    { etiqueta: "(b) Energía para consumidores secundarios", objetivo: 100, tolerancia: 0, unidad: "kcal", placeholder: "100" },
    { etiqueta: "(c) Energía para consumidores terciarios", objetivo: 10, tolerancia: 0, unidad: "kcal", placeholder: "10" },
    { etiqueta: "(d) Porcentaje que llega al nivel terciario", objetivo: 0.1, tolerancia: 0, unidad: "%", placeholder: "0.1" },
  ],
  pasosGuia: [
    "Nivel 1 (productores): 10,000 kcal",
    "Nivel 2 (consumidores primarios): 10,000 × 10% = 10,000 × 0.10 = 1,000 kcal",
    "Nivel 3 (consumidores secundarios): 1,000 × 10% = 1,000 × 0.10 = 100 kcal",
    "Nivel 4 (consumidores terciarios): 100 × 10% = 100 × 0.10 = 10 kcal",
    "Porcentaje que llega al nivel 4: (10 kcal / 10,000 kcal) × 100 = 0.1%",
  ],
  respuestaFinal:
    "10 kcal llegan al nivel de consumidores terciarios. (a) 1,000 kcal; (b) 100 kcal; (c) 10 kcal; (d) 0.1% de la energía original llega al nivel de los consumidores terciarios. El 99.9% se pierde como calor en los procesos metabólicos de los niveles intermedios.",
};

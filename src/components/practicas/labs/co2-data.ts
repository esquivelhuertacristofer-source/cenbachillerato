/**
 * Datos y química del laboratorio "Reacción vinagre + bicarbonato" (CNEYT-IV-P08).
 *
 * Experimento 1 de la simulación "experimentos de química casera":
 *   CH₃COOH + NaHCO₃ → CH₃COONa + H₂O + CO₂
 *
 * El módulo es PURO (sin three, sin React) para no arrastrar three.js al bundle
 * del shell. Toda la química es estequiometría real (relación molar 1:1) con
 * cálculo del REACTIVO LIMITANTE; los valores caseros (gramos por cucharada,
 * tiempo de reacción) van marcados como aproximados/cualitativos.
 */

export const ECUACION = "CH₃COOH + NaHCO₃ → CH₃COONa + H₂O + CO₂";
export const TIPO_REACCION = "Doble sustitución (ácido-base con desprendimiento de gas)";

/* ── Masas molares (g/mol) ───────────────────────────────────────────────── */
export const M_ACIDO = 60.05; // ácido acético CH₃COOH
export const M_BICARB = 84.01; // bicarbonato de sodio NaHCO₃
export const M_CO2 = 44.01; // dióxido de carbono

/** Volumen molar de un gas a 25 °C y 1 atm: 24.45 L/mol = 24.45 mL/mmol. */
export const VM_GAS = 24.45;

/* ── Referencias caseras (APROXIMADAS) ───────────────────────────────────── */
export const CUCHARADITA_G = 4; // ~4 g (aprox.)
export const CUCHARADA_G = 14; // ~14 g (aprox.)

/* ── Vinagre: concentración y volumen ────────────────────────────────────── */
export interface Vinagre {
  pct: number; // % de ácido acético (m/V aprox.: g por 100 mL)
  etiqueta: string;
}
export const VINAGRES: Vinagre[] = [
  { pct: 5, etiqueta: "Vinagre blanco · 5%" },
  { pct: 10, etiqueta: "Vinagre fuerte · 10%" },
];
export const VOLUMENES = [25, 50, 100]; // mL
export const VOL_DEF = 50;
export const PCT_DEF = 5;

/* ── Bicarbonato: rango del control (gramos) ─────────────────────────────── */
export const BICARB_MIN = 0;
export const BICARB_MAX = 20; // g
export const BICARB_PASO = 0.5;
export const BICARB_DEF = 4; // ≈ 1 cucharadita

/* ── Cantidades de sustancia (mmol) ──────────────────────────────────────── */
/** mmol de ácido acético en `volMl` de vinagre al `pct`% (m/V). */
export function mmolAcido(volMl: number, pct: number): number {
  const gramos = volMl * (pct / 100); // g de ácido acético
  return (gramos / M_ACIDO) * 1000;
}
export function mmolBicarb(g: number): number {
  return (g / M_BICARB) * 1000;
}

export type Limitante = "acido" | "bicarbonato" | "iguales";
export type Quien = "acido" | "bicarbonato" | "ninguno";

export interface Resultado {
  nAcido: number; // mmol de ácido acético
  nBicarb: number; // mmol de bicarbonato
  nCO2: number; // mmol de CO₂ (= reactivo limitante, relación 1:1)
  volCO2mL: number; // volumen de CO₂ (mL) a 25 °C y 1 atm
  masaCO2: number; // g de CO₂
  limitante: Limitante;
  sobranteMmol: number; // mmol del reactivo en exceso que NO reacciona
  sobranteQuien: Quien;
}

/** Estequiometría 1:1 con reactivo limitante. */
export function calcula(volMl: number, pct: number, gBicarb: number): Resultado {
  const nAcido = mmolAcido(volMl, pct);
  const nBicarb = mmolBicarb(gBicarb);
  const nCO2 = Math.min(nAcido, nBicarb); // relación molar 1:1
  const dif = nAcido - nBicarb;

  let limitante: Limitante;
  let sobranteQuien: Quien;
  if (Math.abs(dif) < 0.05) {
    limitante = "iguales";
    sobranteQuien = "ninguno";
  } else if (dif > 0) {
    // sobra ácido → el bicarbonato es el limitante
    limitante = "bicarbonato";
    sobranteQuien = "acido";
  } else {
    limitante = "acido";
    sobranteQuien = "bicarbonato";
  }

  return {
    nAcido,
    nBicarb,
    nCO2,
    volCO2mL: nCO2 * VM_GAS,
    masaCO2: (nCO2 / 1000) * M_CO2,
    limitante,
    sobranteMmol: Math.abs(dif) < 0.05 ? 0 : Math.abs(dif),
    sobranteQuien,
  };
}

/** Gramos de bicarbonato en el punto estequiométrico (consume todo el ácido). */
export function gEstequiometrico(volMl: number, pct: number): number {
  return (mmolAcido(volMl, pct) / 1000) * M_BICARB;
}

/**
 * Tiempo de reacción APROXIMADO (s), modelo didáctico: a mayor concentración de
 * ácido, mayor velocidad de reacción → menor tiempo. NO es un valor medido.
 * 5% → ~40 s, 10% → ~20 s.
 */
export function tiempoReaccion(pct: number): number {
  return Math.round(200 / pct);
}

/* ── Curva CO₂ producido vs gramos de bicarbonato ────────────────────────── */
export interface PuntoG {
  g: number;
  volCO2mL: number;
}
/** Para un vinagre fijo, recorre el bicarbonato 0→max y devuelve el CO₂. */
export function curvaCO2(volMl: number, pct: number, pasos = 40): PuntoG[] {
  const arr: PuntoG[] = [];
  for (let i = 0; i <= pasos; i++) {
    const g = (BICARB_MAX / pasos) * i;
    arr.push({ g, volCO2mL: calcula(volMl, pct, g).volCO2mL });
  }
  return arr;
}

/* ── Datos clave (tarjetas) ──────────────────────────────────────────────── */
export interface Dato {
  valor: string;
  texto: string;
  icono: string;
}
export const DATOS: Dato[] = [
  { valor: "1 : 1", texto: "Relación molar ácido : bicarbonato en la reacción", icono: "fa-scale-balanced" },
  { valor: "24.45 L/mol", texto: "Volumen de un gas a 25 °C y 1 atm (volumen molar)", icono: "fa-wind" },
  { valor: "CO₂", texto: "Gas que se desprende e infla el globo (evidencia de la reacción)", icono: "fa-circle-nodes" },
  { valor: "≈ 14 g", texto: "Una cucharada de bicarbonato (valor aproximado)", icono: "fa-spoon" },
];

/* ── Ideas clave (método científico + reacción) ──────────────────────────── */
export const IDEAS: string[] = [
  "La reacción es de doble sustitución: el ácido acético del vinagre reacciona con el bicarbonato y libera CO₂ gaseoso.",
  "El gas que infla el globo es la EVIDENCIA observable de que ocurrió una reacción química.",
  "Reactivo limitante: la cantidad de CO₂ la decide el reactivo que se agota primero. Añadir más del otro no produce más gas.",
  "Variable independiente: la que tú cambias (gramos de bicarbonato o % del vinagre). Variable dependiente: la que mides (volumen de CO₂, tiempo).",
  "Variables controladas: todo lo demás que mantienes igual para que la comparación sea justa.",
  "Control: una muestra de referencia (agua en lugar de vinagre) que NO debe reaccionar; sirve para confirmar que el CO₂ viene del ácido.",
  "Conservación de la masa: los átomos no se crean ni se destruyen; el CO₂ que escapa explica por qué el frasco abierto 'pesa menos' al final.",
];

/* ── Formato ─────────────────────────────────────────────────────────────── */
export const fmt1 = (n: number) => n.toFixed(1);
export const fmt0 = (n: number) => Math.round(n).toString();
/** mL → texto legible (mL si <1000, si no en L con 2 decimales). */
export function fmtVol(mL: number): string {
  return mL < 1000 ? `${Math.round(mL)} mL` : `${(mL / 1000).toFixed(2)} L`;
}

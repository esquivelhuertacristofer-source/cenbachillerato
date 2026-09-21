/**
 * Datos y modelo del laboratorio "Energía nuclear: fisión y ética"
 * (CNEYT-V, progresión 9; códigos de actividad CNEYT-V-P08-A1…A9).
 *
 * Propósito: «Reflexiona sobre las implicaciones éticas y sociales del
 * desarrollo tecnológico en física (energía nuclear, telecomunicaciones).»
 *
 * Es una progresión de ÉTICA: lo manipulable es la física (la reacción en
 * cadena, E = mc², el decaimiento radiactivo y la propagación de las ondas de
 * radio) y el debate ético se conserva VERBATIM (lectura A1, reflexión A3,
 * autoevaluación A7, actividad final A5, pregunta abierta del video A9).
 *
 * Anclas verbatim:
 *   - A1 lectura «Física y ética: energía nuclear, telecomunicaciones y sociedad».
 *   - A2 quiz de opción múltiple (evaluable).
 *   - A4 verdadero/falso (hechos). A5 glosario. A6 completa el texto.
 *
 * Todo lo demás es MODELO con cifras reales verificables (masas atómicas
 * AME2020, vidas medias NUBASE, ICNIRP 2020, INEGI ENDUTIH 2024, CFE 2024,
 * IPCC AR5) o ILUSTRATIVO (lo dice cada constante).
 *
 * Datos puros (sin three ni React).
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { TextoHuecosData } from "./_mecanica-huecos";

/* ── Modos ────────────────────────────────────────────────────────────── */

export type Modo = "reactor" | "energia" | "residuos" | "telecom";
export const MODOS: Modo[] = ["reactor", "energia", "residuos", "telecom"];

export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string }> = {
  reactor: { etq: "Reacción en cadena", subtitulo: "Controla un reactor como el de Laguna Verde", icono: "fa-atom", color: "#38bdf8" },
  energia: { etq: "E = mc²", subtitulo: "Una fisión, un gramo y el carbón", icono: "fa-bolt", color: "#fbbf24" },
  residuos: { etq: "Residuos y tiempo", subtitulo: "Vidas medias frente a la historia humana", icono: "fa-hourglass-half", color: "#a78bfa" },
  telecom: { etq: "Ondas y sociedad", subtitulo: "Cobertura, exposición y vigilancia", icono: "fa-tower-cell", color: "#34d399" },
};

export function mulberry32(semilla: number) {
  let t = semilla >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Número con separador de miles (espacio fino) y signo menos tipográfico. */
export function num(x: number, dec = 0): string {
  const s = Math.abs(x).toFixed(dec);
  const [ent, frac] = s.split(".");
  const conMiles = ent!.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${x < 0 ? "−" : ""}${conMiles}${frac ? `.${frac}` : ""}`;
}

const SUP: Record<string, string> = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
/** Notación científica legible: 8.99 × 10¹³. */
export function cient(x: number, dec = 2): string {
  if (x === 0) return "0";
  const e = Math.floor(Math.log10(Math.abs(x)));
  if (e >= -2 && e <= 5) return num(x, e >= 2 ? 0 : dec);
  const m = x / Math.pow(10, e);
  return `${m.toFixed(dec)} × 10${String(e)
    .split("")
    .map((c) => SUP[c] ?? c)
    .join("")}`;
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. REACCIÓN EN CADENA — núcleo de un reactor
 * ════════════════════════════════════════════════════════════════════════ */

export type TipoReactor = "bwr" | "rbmk";
export type Enriquecimiento = "natural" | "leu";

export const TIPOS_REACTOR: { id: TipoReactor; etq: string; detalle: string }[] = [
  {
    id: "bwr",
    etq: "Agua en ebullición (BWR) · Laguna Verde",
    detalle: "El agua es a la vez moderador y refrigerante. Si el agua se convierte en vapor, hay menos moderador y la reacción se frena sola (coeficiente de vacíos negativo).",
  },
  {
    id: "rbmk",
    etq: "Grafito y agua (RBMK) · Chernóbil",
    detalle: "El grafito modera y el agua solo enfría (y absorbe neutrones). Si el agua se convierte en vapor, se absorben menos neutrones y la reacción se acelera (coeficiente de vacíos positivo).",
  },
];

export const ENRIQUECIMIENTOS: { id: Enriquecimiento; etq: string; pct: number }[] = [
  { id: "natural", etq: "Uranio natural · 0.72 % de U-235", pct: 0.72 },
  { id: "leu", etq: "Enriquecido · 4 % de U-235", pct: 4 },
];

/**
 * Modelo ILUSTRATIVO de reactividad (no es un cálculo de física de reactores):
 *   k = k₀(tipo, enriquecimiento) · (1 + cv · vacíos) · (1 − W · barras)
 * Reproduce los hechos cualitativos reales: el uranio natural no alcanza la
 * criticidad con agua ligera; un BWR sin agua se apaga; en un RBMK el vapor
 * aumenta la reactividad; las barras de control la reducen.
 */
export const K0: Record<TipoReactor, Record<Enriquecimiento, number>> = {
  bwr: { natural: 0.95, leu: 1.318 },
  rbmk: { natural: 1.02, leu: 1.08 },
};
export const CV: Record<TipoReactor, number> = { bwr: -0.6, rbmk: 0.2 };
export const W_BARRAS = 0.3;

export function kEff(tipo: TipoReactor, enr: Enriquecimiento, vacios: number, barras: number): number {
  return K0[tipo][enr] * (1 + CV[tipo] * vacios) * (1 - W_BARRAS * barras);
}

export type Regimen = "subcritico" | "critico" | "supercritico";
export const TOL_CRITICO = 0.01;
export function regimen(k: number): Regimen {
  if (k < 1 - TOL_CRITICO) return "subcritico";
  if (k > 1 + TOL_CRITICO) return "supercritico";
  return "critico";
}
export const REGIMEN_DEF: Record<Regimen, { etq: string; color: string; explica: string }> = {
  subcritico: { etq: "Subcrítico (k < 1)", color: "#60a5fa", explica: "Cada fisión produce, en promedio, menos de una fisión nueva: la población de neutrones decae y la reacción se apaga." },
  critico: { etq: "Crítico (k = 1)", color: "#34d399", explica: "Cada fisión provoca exactamente otra: la potencia se mantiene constante. Así opera una central." },
  supercritico: { etq: "Supercrítico (k > 1)", color: "#f87171", explica: "Cada fisión provoca más de una: la potencia crece generación tras generación hasta que algo la detiene." },
};

/** Potencia térmica nominal de una unidad de Laguna Verde tras su repotenciación (MWt). */
export const P_TERMICA_MW = 2317;
/** Potencia eléctrica bruta de una unidad (MWe, CFE). */
export const P_ELECTRICA_MW = 810;
/** Disparo automático (SCRAM) al 120 % de la potencia nominal. */
export const SCRAM_UMBRAL = 1.2;
/** Tasa del modelo: dP/dt = TASA · (k − 1) · P + FUENTE (en unidades de potencia nominal por segundo real). */
export const TASA = 3;
export const FUENTE_NEUTRONES = 0.002;
/** Fracción de neutrones retardados del U-235 (dato real). Sin ellos, el reactor no sería controlable. */
export const BETA_U235 = 0.0065;
/** Segundos simulados por segundo real después del apagado (1 s = 15 min). */
export const ACELERACION = 900;
/** Agua sobre el combustible al apagar, en toneladas (ILUSTRATIVO). */
export const AGUA_SOBRE_NUCLEO_T = 150;
/** Calor latente de vaporización del agua a 1 atm (J/kg). */
export const L_VAPOR = 2.26e6;

/** Calor residual tras el apagado (fórmula de Way–Wigner): fracción de la potencia previa. */
export function calorResidual(tSeg: number, tOperacionSeg = 3.156e7): number {
  const t = Math.max(1, tSeg);
  return 0.0622 * (Math.pow(t, -0.2) - Math.pow(t + tOperacionSeg, -0.2));
}

export interface SimReactor {
  /** Potencia de fisión relativa a la nominal. */
  p: number;
  scram: boolean;
  motivo: "sobrepotencia" | "manual" | "bombas" | null;
  /** Inserción efectiva de las barras durante el SCRAM (0–1). */
  barrasScram: number;
  /** Segundos simulados desde el apagado. */
  tApagado: number;
  /** Toneladas de agua sobre el combustible. */
  agua: number;
  /** Segundos reales seguidos en crítico con potencia estable. */
  tCritico: number;
  historial: number[];
}

export function simInicial(): SimReactor {
  return { p: 1, scram: false, motivo: null, barrasScram: 0, tApagado: 0, agua: AGUA_SOBRE_NUCLEO_T, tCritico: 0, historial: Array.from({ length: 60 }, () => 1) };
}

/** Un paso de dt segundos reales. Función pura. */
export function pasoReactor(s: SimReactor, c: { tipo: TipoReactor; enr: Enriquecimiento; vacios: number; barras: number; bombas: boolean }, dt: number): SimReactor {
  let { p, scram, motivo, barrasScram, tApagado, agua, tCritico } = s;
  if (!scram && !c.bombas) {
    scram = true;
    motivo = "bombas";
  }
  if (scram) barrasScram = Math.min(1, barrasScram + dt / 2);
  const barras = Math.max(c.barras, barrasScram);
  const k = kEff(c.tipo, c.enr, c.vacios, barras);
  p = Math.max(0, p + (TASA * (k - 1) * p + (scram ? 0 : FUENTE_NEUTRONES)) * dt);
  p = Math.min(p, 3);
  if (!scram && p > SCRAM_UMBRAL) {
    scram = true;
    motivo = "sobrepotencia";
  }
  if (scram) {
    const dtSim = dt * ACELERACION;
    tApagado += dtSim;
    if (!c.bombas) {
      const calorW = calorResidual(tApagado) * P_TERMICA_MW * 1e6;
      agua -= (calorW * dtSim) / L_VAPOR / 1000;
      agua = Math.max(agua, -80);
    } else if (agua < AGUA_SOBRE_NUCLEO_T) {
      // Con las bombas funcionando se repone el agua (60 t por hora simulada; ILUSTRATIVO).
      agua = Math.min(AGUA_SOBRE_NUCLEO_T, agua + (60 * dtSim) / 3600);
    }
  }
  const estable = !scram && Math.abs(k - 1) <= TOL_CRITICO && p > 0.5 && p < SCRAM_UMBRAL;
  tCritico = estable ? tCritico + dt : 0;
  return { p, scram, motivo, barrasScram, tApagado, agua, tCritico, historial: s.historial };
}

export function formatoDuracion(seg: number): string {
  if (seg < 60) return `${num(seg)} s`;
  if (seg < 3600) return `${num(seg / 60)} min`;
  const h = Math.floor(seg / 3600);
  const m = Math.floor((seg - h * 3600) / 60);
  return `${h} h ${String(m).padStart(2, "0")} min`;
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. E = mc²
 * ════════════════════════════════════════════════════════════════════════ */

export const C_LUZ = 2.99792458e8;
export const U_MEV = 931.494;
export const MEV_J = 1.602176634e-13;
export const N_A = 6.02214076e23;

/** Masas atómicas (u), AME2020. */
export const MASAS = {
  u235: 235.0439299,
  n: 1.00866491595,
  ba141: 140.9144035,
  kr92: 91.9261731,
} as const;

export const REACCION = "n + ²³⁵U → ¹⁴¹Ba + ⁹²Kr + 3 n";
export const MASA_ANTES = MASAS.u235 + MASAS.n;
export const MASA_DESPUES = MASAS.ba141 + MASAS.kr92 + 3 * MASAS.n;
export const DEFECTO_U = MASA_ANTES - MASA_DESPUES;
/** Energía liberada al instante por esta fisión (MeV). */
export const E_FISION_MEV = DEFECTO_U * U_MEV;
/** Energía total típica por fisión, incluidos los decaimientos posteriores de los fragmentos (MeV). */
export const E_FISION_TOTAL_MEV = 200;
export const TOL_E_MEV = 2;

/** Energía de convertir 1 g de masa (J). */
export const E_UN_GRAMO_J = 1e-3 * C_LUZ * C_LUZ;
/** Energía de la combustión de un átomo de carbono, C + O₂ → CO₂ (eV); 393.5 kJ/mol. */
export const E_COMBUSTION_EV = 393.5e3 / N_A / 1.602176634e-19;
/** Energía de fisionar por completo 1 kg de U-235 (J). */
export const E_KG_U235_J = (1000 / 235.0439) * N_A * E_FISION_TOTAL_MEV * MEV_J;
/** 1 kilotón de TNT (J). */
export const KT_TNT_J = 4.184e12;
/** Hiroshima: unos 15 kt (estimación usual). */
export const HIROSHIMA_KT = 15;

/** Combustible real: quemado típico de un BWR, 45 GWd por tonelada de uranio (J/kg). */
export const E_KG_COMBUSTIBLE_J = 45 * 1e9 * 86400 / 1000;
/** Carbón: poder calorífico típico, 24 MJ/kg. */
export const E_KG_CARBON_J = 24e6;
export const ETA_NUCLEAR = 0.35;
export const ETA_CARBON = 0.36;
/** Emisiones de ciclo de vida (g CO₂e/kWh), medianas IPCC AR5 (2014). */
export const CO2_NUCLEAR = 12;
export const CO2_CARBON = 820;
/** Una pastilla de UO₂ ≈ 10 g, de los cuales ≈ 8.8 g son uranio. */
export const PASTILLA_U_G = 8.8;
/** Góndola de carbón de 100 t (ILUSTRATIVO). */
export const VAGON_T = 100;

export type DemandaId = "casa" | "ciudad" | "laguna";
export const DEMANDAS: { id: DemandaId; etq: string; kwh: number; nota: string }[] = [
  { id: "casa", etq: "Tu casa, un año", kwh: 2000, nota: "≈ 2 000 kWh: orden de magnitud del consumo de un hogar mexicano (ilustrativo)." },
  { id: "ciudad", etq: "Un millón de hogares, un año", kwh: 2e9, nota: "Un millón de hogares de 2 000 kWh al año (ilustrativo)." },
  { id: "laguna", etq: "Laguna Verde, un año", kwh: 12306.58e6, nota: "12 306.58 GWh brutos generados por las dos unidades en 2024 (CFE)." },
];

export interface Comparacion {
  kwh: number;
  uKg: number;
  pastillas: number;
  carbonKg: number;
  vagones: number;
  co2NucKg: number;
  co2CarKg: number;
  razon: number;
}

export function comparar(kwh: number): Comparacion {
  const eJ = kwh * 3.6e6;
  const uKg = eJ / ETA_NUCLEAR / E_KG_COMBUSTIBLE_J;
  const carbonKg = eJ / ETA_CARBON / E_KG_CARBON_J;
  return {
    kwh,
    uKg,
    pastillas: (uKg * 1000) / PASTILLA_U_G,
    carbonKg,
    vagones: carbonKg / 1000 / VAGON_T,
    co2NucKg: (kwh * CO2_NUCLEAR) / 1000,
    co2CarKg: (kwh * CO2_CARBON) / 1000,
    razon: carbonKg / uKg,
  };
}

export const OPCIONES_RAZON: { valor: number; etq: string }[] = [
  { valor: 15, etq: "≈ 15 veces" },
  { valor: 1500, etq: "≈ 1 500 veces" },
  { valor: 150000, etq: "≈ 150 000 veces" },
  { valor: 15000000, etq: "≈ 15 millones de veces" },
];
export function razonCorrecta(): number {
  const r = comparar(1).razon;
  return OPCIONES_RAZON.reduce((a, b) => (Math.abs(Math.log10(b.valor / r)) < Math.abs(Math.log10(a.valor / r)) ? b : a)).valor;
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. RESIDUOS Y TIEMPO — decaimiento radiactivo
 * ════════════════════════════════════════════════════════════════════════ */

export type IsotopoId = "i131" | "co60" | "sr90" | "cs137" | "am241" | "pu239" | "tc99" | "i129";

/** Vidas medias reales (años), NUBASE2020 / NNDC. */
export const ISOTOPOS: { id: IsotopoId; etq: string; simbolo: string; t12: number; color: string; nota: string }[] = [
  { id: "i131", etq: "Yodo-131", simbolo: "I-131", t12: 8.0252 / 365.25, color: "#f472b6", nota: "8 días. Se acumula en la tiroides; fue el mayor riesgo inmediato tras Chernóbil." },
  { id: "co60", etq: "Cobalto-60", simbolo: "Co-60", t12: 5.2714, color: "#60a5fa", nota: "5.3 años. Se forma en el acero del reactor; también se usa en radioterapia." },
  { id: "sr90", etq: "Estroncio-90", simbolo: "Sr-90", t12: 28.79, color: "#fb923c", nota: "28.8 años. Químicamente parecido al calcio: se fija en los huesos." },
  { id: "cs137", etq: "Cesio-137", simbolo: "Cs-137", t12: 30.08, color: "#facc15", nota: "30 años. El principal contaminante del suelo en Chernóbil y Fukushima." },
  { id: "am241", etq: "Americio-241", simbolo: "Am-241", t12: 432.6, color: "#4ade80", nota: "433 años. Se forma a partir del plutonio; se usa en detectores de humo." },
  { id: "pu239", etq: "Plutonio-239", simbolo: "Pu-239", t12: 24110, color: "#f87171", nota: "24 110 años. Se produce en el reactor; es fisionable." },
  { id: "tc99", etq: "Tecnecio-99", simbolo: "Tc-99", t12: 211100, color: "#22d3ee", nota: "211 000 años. Muy móvil en el agua subterránea." },
  { id: "i129", etq: "Yodo-129", simbolo: "I-129", t12: 1.57e7, color: "#c084fc", nota: "15.7 millones de años. Emite poca radiación, pero casi no desaparece." },
];

export function fraccionRestante(tAnios: number, t12: number): number {
  return Math.pow(0.5, tAnios / t12);
}

/** Línea de tiempo en escala logarítmica: log10(años). */
/** ≈ 1 día (10^−2.56 años); redondeado para que el deslizador tenga pasos exactos de 0.01. */
export const LOG_T_MIN = -2.56;
export const LOG_T_MAX = 7;
export const ANIOS_GENERACION = 25;

export function formatoAnios(t: number): string {
  if (t < 1 / 12) return `${num(t * 365.25)} ${Math.round(t * 365.25) === 1 ? "día" : "días"}`;
  if (t < 1) return `${num(t * 12)} meses`;
  if (t < 1e6) return `${num(t)} ${Math.round(t) === 1 ? "año" : "años"}`;
  return `${num(t / 1e6, 1)} millones de años`;
}

/** Referencias de la historia humana (años hacia atrás desde hoy, redondeados). */
export const HITOS_HUMANOS: { anios: number; etq: string }[] = [
  { anios: 80, etq: "Una vida humana" },
  { anios: 500, etq: "La caída de México-Tenochtitlan (1521)" },
  { anios: 1500, etq: "Teotihuacán en su esplendor" },
  { anios: 4500, etq: "Las pirámides de Guiza" },
  { anios: 9000, etq: "La domesticación del maíz en México" },
  { anios: 300000, etq: "Los primeros Homo sapiens" },
];

export function hitoHumano(t: number): string {
  let mejor = "Menos que una vida humana";
  for (const h of HITOS_HUMANOS) if (t >= h.anios) mejor = `Más que ${h.etq.charAt(0).toLowerCase()}${h.etq.slice(1)}`;
  return mejor;
}

/** Reto: tiempo para que quede 1/8 del Pu-239 (tres vidas medias). */
export const RETO_PU_ANIOS = 3 * 24110;
export const TOL_PU_ANIOS = 1500;

/** Profundidad del repositorio geológico de Onkalo (Finlandia), ≈ 430 m. */
export const PROFUNDIDAD_ONKALO_M = 430;

/* ════════════════════════════════════════════════════════════════════════
 * 4. ONDAS Y SOCIEDAD — telecomunicaciones
 * ════════════════════════════════════════════════════════════════════════ */

export type SubTelecom = "cobertura" | "exposicion" | "rastreo";
export const SUBS_TELECOM: { id: SubTelecom; etq: string; icono: string }[] = [
  { id: "cobertura", etq: "Cobertura y brecha digital", icono: "fa-signal" },
  { id: "exposicion", etq: "Exposición junto a la antena", icono: "fa-person-walking" },
  { id: "rastreo", etq: "¿Dónde está este celular?", icono: "fa-location-crosshairs" },
];

export type BandaId = "b700" | "b3500";
export const BANDAS_TEL: { id: BandaId; etq: string; mhz: number; limite: number; uso: string }[] = [
  { id: "b700", etq: "700 MHz", mhz: 700, limite: 700 / 200, uso: "Banda de 4G usada en México para cubrir zonas extensas (Red Compartida)." },
  { id: "b3500", etq: "3.5 GHz", mhz: 3500, limite: 10, uso: "Banda del 5G en México: más capacidad, menos alcance." },
];

/** PIRE de un sector de estación base: 59 dBm ≈ 794 W (ILUSTRATIVO, orden típico). */
export const PIRE_DBM = 59;
export const PIRE_W = Math.pow(10, PIRE_DBM / 10) / 1000;
/** Sensibilidad útil de un teléfono 4G (dBm), margen por vegetación y muros (dB) y exponente de pérdidas (ILUSTRATIVO). */
export const SENSIBILIDAD_DBM = -105;
export const MARGEN_DB = 20;
export const EXPONENTE_N = 4;

/** Pérdida en espacio libre a 1 km (dB) para f en MHz. */
export function fspl1km(mhz: number): number {
  return 32.44 + 20 * Math.log10(mhz);
}

/** Alcance (km) con el modelo de pérdidas log-distancia. */
export function alcanceKm(mhz: number): number {
  return Math.pow(10, (PIRE_DBM - SENSIBILIDAD_DBM - MARGEN_DB - fspl1km(mhz)) / (10 * EXPONENTE_N));
}

export type TorreId = "ciudad" | "cerro" | "tres";
export const TORRES: { id: TorreId; etq: string; x: number; z: number; fija: boolean }[] = [
  { id: "ciudad", etq: "Torre de la ciudad", x: 0, z: 0, fija: true },
  { id: "cerro", etq: "Torre en el cerro", x: 26, z: -4, fija: false },
  { id: "tres", etq: "Torre en Tres Cruces", x: 20.5, z: 10, fija: false },
];

/** Localidades ILUSTRATIVAS (km desde la torre de la ciudad). */
export const LOCALIDADES: { id: string; etq: string; x: number; z: number; habitantes: number; ciudad?: boolean }[] = [
  { id: "ciudad", etq: "Ciudad", x: -1.5, z: 1, habitantes: 250000, ciudad: true },
  { id: "joya", etq: "La Joya", x: 6, z: -3.5, habitantes: 3200 },
  { id: "tres", etq: "Tres Cruces", x: 18, z: 6.5, habitantes: 900 },
  { id: "mirador", etq: "El Mirador", x: 34, z: -2, habitantes: 450 },
];

export function cubiertas(mhz: number, torres: TorreId[]): Set<string> {
  const r = alcanceKm(mhz);
  const out = new Set<string>();
  for (const l of LOCALIDADES) {
    for (const t of TORRES) {
      if (!torres.includes(t.id)) continue;
      if (Math.hypot(l.x - t.x, l.z - t.z) <= r) out.add(l.id);
    }
  }
  return out;
}

/** Densidad de potencia en el haz principal a d metros (W/m²). */
export function densidadPotencia(dM: number): number {
  return PIRE_W / (4 * Math.PI * dM * dM);
}
export function distanciaLimite(limite: number): number {
  return Math.sqrt(PIRE_W / (4 * Math.PI * limite));
}
export const H_PLANCK_EV = 4.135667696e-15;
/** Energía para ionizar una molécula de agua (eV). */
export const E_IONIZACION_AGUA_EV = 12.6;
export const D_MIN_M = 1;
export const D_MAX_M = 300;

/** Rastreo: tres antenas de una ciudad (km). */
export const ANTENAS_RASTREO: { id: number; x: number; z: number }[] = [
  { id: 0, x: -2.4, z: 1.4 },
  { id: 1, x: 2.6, z: 1.6 },
  { id: 2, x: 0.2, z: -2.6 },
];
/** Incertidumbre de la distancia estimada por el tiempo de respuesta (≈ ±80 m en 4G; ILUSTRATIVO). */
export const INCERTIDUMBRE_KM = 0.08;

/* ── Estrellas: ¿pregunta científica o pregunta ética? ──────────────────── */

export const ENUNCIADOS: { texto: string; etica: boolean; porque: string }[] = [
  { texto: "¿Cuánta energía libera la fisión de un núcleo de uranio-235?", etica: false, porque: "Se responde midiendo masas y aplicando E = mc²: unos 200 MeV." },
  { texto: "¿Debe México construir más reactores nucleares?", etica: true, porque: "Los datos informan, pero decidir exige ponderar riesgos, costos y quién los asume." },
  { texto: "¿Cuántos años tarda el cesio-137 en perder la mitad de su actividad?", etica: false, porque: "Es una propiedad física medible: 30 años." },
  { texto: "¿Es justo dejar residuos peligrosos a generaciones que no pueden opinar?", etica: true, porque: "Ningún experimento lo decide: es una pregunta de justicia entre generaciones." },
  { texto: "¿Qué densidad de potencia hay a 10 m de una antena de telefonía?", etica: false, porque: "Se calcula o se mide con un medidor de campo." },
  { texto: "¿Puede el gobierno conocer la ubicación de tu celular sin tu consentimiento?", etica: true, porque: "Técnicamente es posible; si debe permitirse es una cuestión de derechos y leyes." },
  { texto: "¿Por qué un reactor BWR se frena si pierde el agua?", etica: false, porque: "El agua modera los neutrones: sin ella hay menos fisiones." },
  { texto: "¿Quién debe pagar la antena de un pueblo de 450 habitantes?", etica: true, porque: "Es un problema de equidad y de política pública, no de física." },
  { texto: "¿Los fotones de 5G tienen energía suficiente para ionizar el ADN?", etica: false, porque: "Se calcula con E = hf: tienen casi un millón de veces menos energía de la necesaria." },
  { texto: "¿Debió Oppenheimer negarse a trabajar en la bomba atómica?", etica: true, porque: "Es una pregunta sobre responsabilidad personal, no sobre cómo funciona la fisión." },
];

export function rondaEnunciados(rnd: () => number, n = 6): number[] {
  const cien = ENUNCIADOS.map((e, i) => ({ e, i })).filter((x) => !x.e.etica).map((x) => x.i);
  const eti = ENUNCIADOS.map((e, i) => ({ e, i })).filter((x) => x.e.etica).map((x) => x.i);
  const baraja = (xs: number[]) => {
    const a = [...xs];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j]!, a[i]!];
    }
    return a;
  };
  const mitad = Math.floor(n / 2);
  return baraja([...baraja(cien).slice(0, n - mitad), ...baraja(eti).slice(0, mitad)]);
}

export function estrellasPorErrores(errores: number): number {
  return errores === 0 ? 3 : errores <= 2 ? 2 : 1;
}

/* ════════════════════════════════════════════════════════════════════════
 * Contenido VERBATIM
 * ════════════════════════════════════════════════════════════════════════ */

export const TITULO_A1 = "Física y ética: energía nuclear, telecomunicaciones y sociedad";

/** Lectura A1 — seis párrafos, verbatim. */
export const LECTURA_A1: string[] = [
  "La física no produce tecnología en el vacío: produce tecnología en un contexto social, político y económico que determina para qué y para quién se usa. La pregunta de si la ciencia puede ser neutral —si el conocimiento científico existe independientemente de sus usos y consecuencias— es una de las más profundas de la filosofía de la ciencia y la ética.",
  "La fisión nuclear es el proceso por el cual núcleos de átomos pesados (como el uranio-235 o el plutonio-239) se dividen al ser bombardeados con neutrones, liberando enormes cantidades de energía y más neutrones que perpetúan la reacción en cadena. Este mismo proceso físico es el que alimenta las bombas atómicas —cuyo primer uso militar en Hiroshima y Nagasaki en 1945 mató a más de 200,000 personas— y el que genera electricidad en las plantas nucleares, donde la reacción se controla cuidadosamente para producir calor y mover turbinas.",
  "En México, la planta nucleoeléctrica de Laguna Verde, ubicada en el municipio de Alto Lucero en Veracruz, cuenta con dos reactores de agua en ebullición y produce aproximadamente el 3.5% de la electricidad nacional (CFE 2023). No emite CO2 durante la generación, lo que la hace relevante en el contexto de la transición energética. Sin embargo, el problema de los residuos radiactivos de alta actividad sigue sin resolverse globalmente: estos materiales mantienen su peligrosidad durante miles de años y no existe todavía un repositorio geológico permanente y operativo en ningún país del mundo.",
  "Las telecomunicaciones plantean un dilema diferente. Las ondas electromagnéticas que hacen posible el WiFi, el 4G y el 5G son la misma física que permite la comunicación global, el acceso al conocimiento y la medicina telemática en zonas rurales de México. Pero también son la infraestructura sobre la que operan sistemas de vigilancia masiva: cámaras de reconocimiento facial, seguimiento de dispositivos móviles, recopilación de datos sin consentimiento informado. La Ley Federal de Telecomunicaciones y Radiodifusión en México establece algunos límites, pero la vigilancia digital es un campo en constante expansión regulatoria.",
  "El principio de precaución, adoptado en el ámbito ambiental y tecnológico, propone que cuando existe incertidumbre científica sobre los riesgos de una tecnología, la carga de la prueba recae sobre quienes la desarrollan: deben demostrar que es segura antes de ser adoptada masivamente, no al revés.",
  "El caso de los físicos del Proyecto Manhattan es paradigmático: muchos de ellos —entre ellos Robert Oppenheimer— expresaron públicamente su arrepentimiento por haber contribuido al desarrollo de la bomba atómica una vez que vieron sus consecuencias. (Albert Einstein no participó en el Proyecto Manhattan: solo firmó en 1939 la carta a Roosevelt que alertó sobre la posibilidad del arma, decisión de la que también se arrepintió.) La responsabilidad del científico ante las aplicaciones de su conocimiento es una pregunta que la física del siglo XXI no puede eludir.",
];

/** Recuadro «importante» de la lectura A1 — verbatim. */
export const RECUADRO_A1 =
  "El dilema del científico ante las aplicaciones de su trabajo no es solo histórico. Hoy, ingenieros de inteligencia artificial enfrentan preguntas similares: ¿debo trabajar en sistemas de reconocimiento facial que pueden usarse para vigilar a manifestantes? ¿Debo desarrollar algoritmos de recomendación que amplifican la desinformación? La ética profesional en ciencia y tecnología es una disciplina viva y urgente.";

/** Notas de actualización (NO verbatim): lo que cambió después de escribirse la lectura. */
export const NOTAS_ACTUALIZACION: string[] = [
  "La Ley Federal de Telecomunicaciones y Radiodifusión fue abrogada: el 16 de julio de 2025 se publicó la Ley en Materia de Telecomunicaciones y Radiodifusión, y en octubre de 2025 la Comisión Reguladora de Telecomunicaciones sustituyó al IFT.",
  "El repositorio de Onkalo (Finlandia) está a punto de ser el primero: en agosto de 2026 el regulador finlandés (STUK) concluyó que cumple los requisitos de seguridad; falta la licencia de operación del gobierno.",
  "En 2024 las dos unidades de Laguna Verde generaron 12 306.58 GWh brutos (CFE).",
];

/** Preguntas de comprensión de la lectura A1 — verbatim. */
export const PREGUNTAS: string[] = [
  "¿Cómo puede el mismo proceso físico —la fisión nuclear— dar lugar a tecnologías con consecuencias tan opuestas?",
  "¿Qué es el principio de precaución y por qué es relevante para las nuevas tecnologías?",
  "¿Qué dilema ético plantea la vigilancia digital habilitada por las telecomunicaciones?",
];

/** Debate — reflexión A3 (verbatim). */
export const TITULO_A3 = "Reflexión: ¿debería México expandir su energía nuclear?";
export const DEBATE_A3 =
  "México tiene la planta nuclear de Laguna Verde en Veracruz, operada por CFE, con dos reactores de agua en ebullición (BWR). Reflexiona: (1) ¿Cuáles son los argumentos a favor y en contra de expandir la energía nuclear en México frente al cambio climático? (2) ¿Cómo se compara la energía nuclear con las energías renovables (solar, eólica) en términos de costo, riesgo y emisiones? (3) ¿Quién debería tomar esas decisiones y cómo debe participar la ciudadanía en decisiones sobre tecnología de alto impacto?";
export const PISTAS_A3: string[] = [
  "¿Cuánta energía produce Laguna Verde como porcentaje del total nacional?",
  "¿Qué ocurrió en Chernóbil (1986) y Fukushima (2011)?",
  "¿Cuál es la diferencia entre fisión y fusión nuclear?",
];
/** Autoevaluación A7 — reflexión final (verbatim). */
export const REFLEXION_A7 =
  "Si tuvieras que votar como ciudadano sobre construir una planta nuclear en tu región, ¿cuáles serían tus argumentos a favor y en contra? ¿Qué información científica y ética considerarías esencial antes de tomar una decisión?";
/** Video A9 — pregunta abierta (verbatim). */
export const PREGUNTA_A9 = "Argumenta a favor o en contra de ampliar la generación nucleoeléctrica en México, usando al menos un dato del video.";

/** Hechos: quiz A4 (verdadero/falso), cada enunciado con su retroalimentación. */
export const HECHOS: string[] = [
  "Verdadero: «La fisión nuclear consiste en la división de núcleos pesados (como el uranio-235) liberando grandes cantidades de energía según E = mc².» Correcto. En la fisión nuclear, núcleos pesados se dividen en núcleos más ligeros, liberando energía según la ecuación de Einstein E = mc², donde la pequeña diferencia de masa se convierte en enorme cantidad de energía.",
  "Falso: «Las plantas nucleares no emiten gases de efecto invernadero durante su operación normal, lo que las hace completamente inocuas para el medio ambiente.» Si bien las plantas nucleares tienen bajas emisiones de CO₂ en operación, generan residuos radiactivos de larga vida que representan un desafío ambiental y ético significativo.",
  "Verdadero: «La brecha digital es una desigualdad social en la que ciertos grupos no tienen acceso a tecnologías de telecomunicación como internet o telefonía, lo que limita sus oportunidades.» Correcto. La brecha digital es una problemática ética y social real: el acceso desigual a las TIC amplía las desigualdades educativas, económicas y sociales.",
  "Falso: «La fusión nuclear, proceso que ocurre en el Sol, ya es utilizada comercialmente como fuente de energía eléctrica en plantas de fusión operativas alrededor del mundo.» La fusión nuclear controlada todavía no es comercialmente viable. Proyectos como ITER en Francia buscan demostrar su viabilidad, pero a 2026 aún no existen plantas de fusión comerciales.",
  "Verdadero: «La privacidad de los datos personales es una implicación ética de las telecomunicaciones modernas, ya que las redes de comunicación pueden almacenar y transmitir información privada de los usuarios.» Correcto. El manejo ético de los datos personales es un desafío central de las telecomunicaciones modernas, regulado en muchos países por leyes de protección de datos (como el GDPR en Europa o la LFPDPPP en México).",
];

/** Glosario A5 — verbatim. */
export const GLOSARIO: { termino: string; definicion: string; ejemplo: string }[] = [
  {
    termino: "Fisión nuclear",
    definicion: "Proceso en el que un núcleo atómico pesado (como ²³⁵U) absorbe un neutrón y se divide en núcleos más ligeros, liberando energía (E = mc²) y más neutrones que pueden provocar una reacción en cadena.",
    ejemplo: "Los reactores nucleares de fisión generan calor que produce vapor para mover turbinas. La planta de Laguna Verde en Veracruz, México, opera con este principio.",
  },
  {
    termino: "Fusión nuclear",
    definicion: "Proceso en el que dos núcleos ligeros (como deuterio y tritio, isótopos del hidrógeno) se fusionan formando un núcleo más pesado y liberando enorme cantidad de energía. Es la fuente de energía del Sol.",
    ejemplo: "El Sol fusiona ~620 millones de toneladas de hidrógeno cada segundo, liberando energía equivalente a 3.8 × 10²⁶ W.",
  },
  {
    termino: "Radiactividad y residuos nucleares",
    definicion: "Los materiales radiactivos emiten partículas o radiación al desintegrarse. Los residuos nucleares de alta actividad pueden permanecer peligrosos durante miles de años, representando un desafío ético de almacenamiento seguro para generaciones futuras.",
    ejemplo: "El plutonio-239, producto de los reactores, tiene una vida media de 24 100 años, lo que plantea el dilema ético de legar estos residuos a futuras generaciones.",
  },
  {
    termino: "Brecha digital",
    definicion: "Desigualdad en el acceso y uso de tecnologías de la información y comunicación (TIC) entre diferentes grupos sociales, regiones geográficas o países. Tiene implicaciones éticas sobre equidad educativa y oportunidades.",
    ejemplo: "En México, las comunidades rurales indígenas tienen menor acceso a internet que las zonas urbanas, limitando el acceso a educación digital y oportunidades laborales.",
  },
  {
    termino: "Ética tecnológica",
    definicion: "Reflexión sobre las consecuencias morales, sociales y ambientales del desarrollo y uso de tecnologías. Incluye preguntas sobre quién se beneficia, quién asume los riesgos, y la responsabilidad de los desarrolladores y gobiernos.",
    ejemplo: "El despliegue de redes 5G genera debates éticos sobre privacidad, vigilancia digital, impacto ambiental de la infraestructura y acceso igualitario.",
  },
  {
    termino: "Principio de precaución",
    definicion: "Principio ético y político según el cual ante la incertidumbre sobre riesgos de daño grave o irreversible (ambiental, de salud), se deben tomar medidas preventivas aunque no haya certeza científica absoluta.",
    ejemplo: "La moratoria sobre pruebas nucleares en zonas habitadas y el debate sobre el almacenamiento de residuos radiactivos aplican el principio de precaución.",
  },
];

export const ACTIVIDAD_A5 =
  "Selecciona una tecnología física de alto impacto (energía nuclear, 5G, inteligencia artificial, satélites de comunicación) y analiza: (a) beneficios científicos o sociales, (b) riesgos éticos o ambientales, (c) quiénes se ven más beneficiados y quiénes asumen más riesgos. Presenta una postura argumentada.";

export const FUENTE =
  "CEN Bachillerato — UAC Ciencias Naturales, Experimentales y Tecnología V, progresión 9 (actividades CNEYT-V-P08): lectura A1, quiz A2, reflexión A3, quiz A4, glosario A5, texto A6, autoevaluación A7 y video A9.";

export const PROBLEMA =
  "La misma física enciende una ciudad o destruye una. En este laboratorio controlas una reacción en cadena, calculas con E = mc² por qué un gramo de uranio vale una tonelada de carbón, sigues los residuos durante miles de años y descubres que las antenas que conectan a un pueblo también pueden ubicar tu celular. Los datos no deciden por ti: te dan con qué argumentar.";

export const INSTRUCCIONES: string[] = [
  "En Reacción en cadena, mueve las barras de control y el vapor del núcleo: lleva el reactor a subcrítico, crítico y supercrítico. Después del apagado, corta las bombas y observa el calor residual.",
  "En E = mc², dispara un neutrón contra un núcleo de uranio-235, calcula la energía con las masas y predice cuánto carbón haría falta para lo mismo.",
  "En Residuos y tiempo, calcula cuándo quedará 1/8 del plutonio-239 y lleva la línea del tiempo hasta ahí.",
  "En Ondas y sociedad, conecta tres pueblos eligiendo banda y torres, acércate a una antena y ubica un celular con tres antenas.",
  "Clasifica preguntas en «¿Ciencia o ética?», resuelve el quiz A2 y el texto A6, y lleva tus datos al debate.",
];

export const IDEAS: string[] = [
  "La reacción en cadena se controla con k: menos de 1 se apaga, igual a 1 es estable, más de 1 crece.",
  "Un reactor con uranio al 4 % no puede explotar como una bomba, pero sin enfriamiento el calor residual puede fundir el núcleo.",
  "E = mc²: la fisión convierte en energía menos de una milésima de la masa, y aun así una pastilla de combustible rinde lo que más de una tonelada de carbón.",
  "Algunos residuos desaparecen en años; otros duran más que toda la historia humana: decidir por generaciones futuras es un problema ético.",
  "Las ondas de radio no son ionizantes; su dilema no es el cáncer, sino quién queda conectado y quién puede rastrearnos.",
  "La ciencia informa la decisión; la decisión sobre qué tecnología usar y cómo se toma en sociedad.",
];

/** Quiz A2 «¿Cuánto sabes sobre la ética del desarrollo tecnológico?» — verbatim. */
export const QUIZ_A2: QuizEvaluable = {
  titulo: "¿Cuánto sabes sobre la ética del desarrollo tecnológico?",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "La planta nucleoeléctrica de Laguna Verde, en Veracruz, opera con reactores de tipo BWR (Boiling Water Reactor). ¿Cuál es el proceso físico que genera la energía en un reactor nuclear?",
      opciones: [
        "Fusión nuclear controlada de hidrógeno (como en el Sol)",
        "Fisión nuclear del uranio-235: el núcleo se divide liberando energía, calentando agua para mover turbinas",
        "Combustión del uranio metálico con oxígeno",
        "Reacción química exotérmica entre plutonio y agua",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "En Laguna Verde se usa fisión nuclear: neutrones impactan núcleos de U-235, que se dividen en fragmentos más pequeños liberando energía (calor), más neutrones y radiación. El calor produce vapor que mueve turbinas conectadas a generadores eléctricos. La fusión (opción A) es el proceso del Sol, pero aún no se ha logrado de forma comercial en reactores terrestres.",
    },
    {
      enunciado: "¿Cuál es la principal ventaja ambiental de la energía nuclear frente a las termoeléctricas de gas natural o carbón?",
      opciones: ["No genera ningún tipo de residuos", "Produce emisiones de CO₂ extremadamente bajas durante su operación", "Sus residuos radiactivos desaparecen al cabo de 10 años", "No necesita agua para su operación"],
      respuestaCorrecta: 1,
      retroalimentacion:
        "La energía nuclear genera prácticamente cero emisiones de CO₂ durante su operación (la principal causa del cambio climático). Esto la hace relevante en los debates sobre descarbonización de la economía. Sus desventajas incluyen: generación de residuos radiactivos de alta actividad con vida media de miles a millones de años; riesgo de accidente grave; alto costo de construcción y desmantelamiento.",
    },
    {
      enunciado: "En el accidente de Fukushima (2011), el sistema de refrigeración del reactor falló tras el tsunami. ¿Qué riesgo fundamental ilustra este accidente?",
      opciones: [
        "Que los reactores nucleares pueden explotar como una bomba atómica",
        "Que sin refrigeración continua, el calor del decaimiento radiactivo puede fundir el núcleo del reactor y liberar radiación",
        "Que el uranio se termina rápidamente y deja de funcionar el reactor",
        "Que los generadores eléctricos del reactor producen radiación directamente",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "Aunque un reactor nuclear NO puede explotar como una bomba (la geometría del combustible no lo permite), el calor generado por el decaimiento radiactivo continúa incluso después de apagado el reactor. Sin refrigeración, el núcleo puede fundirse (meltdown), dañar el contenedor y liberar sustancias radiactivas. Esto es lo que ocurrió en Fukushima Daiichi con los reactores 1, 2 y 3 tras el tsunami del 11 de marzo de 2011.",
    },
    {
      enunciado: "¿Qué es la 'basura electrónica' (e-waste) y cuál es el principal riesgo ambiental asociado a su manejo inadecuado?",
      opciones: [
        "Son archivos digitales corruptos que contaminan los servidores",
        "Son dispositivos eléctricos y electrónicos desechados que contienen metales pesados tóxicos (plomo, mercurio, cadmio) que contaminan suelo y agua",
        "Son emisiones de CO₂ de los centros de datos de internet",
        "Son los residuos radiactivos de los teléfonos celulares viejos",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "La basura electrónica incluye celulares, computadoras, televisores, pilas y otros dispositivos desechados. Contienen plomo en soldaduras, mercurio en pantallas, cadmio en baterías y arsénico en chips. En tiraderos informales, estos metales tóxicos lixivian al suelo y acuíferos. México genera más de 1 millón de toneladas anuales de e-waste; la NOM-161-SEMARNAT establece criterios para su gestión como residuo de manejo especial.",
    },
    {
      enunciado: "¿Cuál de las siguientes afirmaciones sobre la responsabilidad ética en el desarrollo tecnológico es MÁS correcta?",
      opciones: [
        "Los científicos solo son responsables de descubrir; los ingenieros de aplicar; los políticos de decidir",
        "La responsabilidad ética es colectiva y abarca a científicos, ingenieros, empresas, gobiernos y ciudadanos informados",
        "Los riesgos tecnológicos son exclusiva responsabilidad del Estado",
        "El progreso tecnológico siempre compensa cualquier riesgo, por lo que la ética no debe frenar la innovación",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "El principio de responsabilidad ética en tecnología establece que todos los actores involucrados comparten responsabilidad: los científicos deben comunicar honestamente los riesgos; los ingenieros deben diseñar con seguridad máxima; las empresas deben actuar sin anteponer ganancias a la seguridad pública; los gobiernos deben regular y supervisar; los ciudadanos deben participar informados en decisiones que los afectan. La bioética y la ética de la ingeniería son disciplinas académicas que estudian estos principios.",
    },
  ],
};

/** Actividad A6 «Completa los espacios — Ética y tecnología en física» — verbatim. */
export const HUECOS_A6: TextoHuecosData = {
  ancla: "CNEYT-V-P08-A6 · Completa los espacios — Ética y tecnología en física",
  instrucciones: "Completa los huecos con el término o expresión correcta.",
  partes: [
    "La ecuación de Einstein que relaciona masa y energía en los procesos nucleares es E = ",
    ". La fisión nuclear libera energía al ",
    " núcleos atómicos pesados. La fusión nuclear es la fuente de energía que ocurre en el ",
    ". La desigualdad en el acceso a las tecnologías de comunicación se denomina ",
    " digital.",
  ],
  huecos: [
    // «mc2» no está en la actividad: se acepta porque el «²» no se puede teclear en muchos teclados.
    { respuesta: "mc²", alternativas: ["m·c²", "mc^2", "mc2"], pista: "La famosa ecuación de Einstein: E = ___ (masa por velocidad de la luz al cuadrado)." },
    { respuesta: "dividir", alternativas: ["separar", "fragmentar"], pista: "La fisión nuclear consiste en ___ (partir) núcleos pesados en núcleos más pequeños." },
    { respuesta: "Sol", alternativas: ["sol", "el Sol"], pista: "La fusión nuclear es el proceso que proporciona energía al ___, nuestra estrella." },
    { respuesta: "brecha", alternativas: [], pista: "La ___ digital describe la desigualdad de acceso a internet y tecnologías entre distintos grupos sociales." },
  ],
};

/** Brecha digital en México (INEGI, ENDUTIH 2024). */
export const ENDUTIH_2024 = { total: 83.1, urbano: 86.9, rural: 68.5 };

/** Uranio en un ensamble de combustible de BWR (≈ 180 kg; ILUSTRATIVO, orden típico). */
export const ENSAMBLE_U_KG = 180;

/** Puntos donde se cortan dos circunferencias en el plano (x, z). */
export function interseccionCirculos(a: { x: number; z: number; r: number }, b: { x: number; z: number; r: number }): { x: number; z: number }[] {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const d = Math.hypot(dx, dz);
  if (d === 0 || d > a.r + b.r || d < Math.abs(a.r - b.r)) return [];
  const l = (a.r * a.r - b.r * b.r + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, a.r * a.r - l * l));
  const mx = a.x + (l * dx) / d;
  const mz = a.z + (l * dz) / d;
  return [
    { x: mx + (h * dz) / d, z: mz - (h * dx) / d },
    { x: mx - (h * dz) / d, z: mz + (h * dx) / d },
  ];
}

/** Posición al azar del celular dentro de la ciudad (km). */
export function posicionCelular(rnd: () => number = Math.random): { x: number; z: number } {
  const a = rnd() * Math.PI * 2;
  const r = 0.3 + rnd() * 1.6;
  return { x: Math.cos(a) * r, z: Math.sin(a) * r * 0.8 };
}

/**
 * Datos y modelos del laboratorio "Hidrósfera y atmósfera: capas, composición
 * e intercambio" (CNEYT-III, progresión 2; códigos de actividad CNEYT-III-P10).
 *
 * Anclas:
 *   - A1 lectura «Aire y agua: las capas y la química de la atmósfera y la
 *     hidrósfera»: marco teórico verbatim (6 párrafos) y sus 3 preguntas.
 *   - A2 ejercicio matemático «Densidad, presión y el ciclo del agua»: reto
 *     evaluable (RetoNumericoCard), verbatim.
 *   - A4 verdadero/falso: hechos. A5 glosario: 10 términos. A6 completa el
 *     texto. A3 reflexión: la pregunta para la localidad del alumno.
 *
 * Modelos (no verbatim, con cifras reales):
 *   - Atmósfera Estándar de EUA 1976 (NOAA/NASA/USAF): temperatura y presión
 *     exactas hasta 86 km y tabla oficial de 86 a 120 km.
 *   - Punto de ebullición con la ecuación de Antoine del agua (1–100 °C).
 *   - Globo sonda: gas ideal (V ∝ T/P) con diámetro de lanzamiento de 1.8 m y
 *     de ruptura de 8 m, ascenso de 5 m/s (valores típicos de radiosondeo).
 *   - Agua de mar: ecuación de estado internacional UNESCO 1981 (EOS-80) a
 *     presión de una atmósfera. Los perfiles de temperatura y salinidad de las
 *     tres zonas son TÍPICOS e ILUSTRATIVOS, con valores del orden de los del
 *     World Ocean Atlas (NOAA).
 *   - Parcela de aire: ascenso adiabático seco (g/cp) y saturado
 *     (pseudoadiabático) con presión de vapor de Bolton (1980); toda el agua
 *     que se condensa cae como lluvia. Terreno Veracruz → Xalapa → sierra →
 *     Perote simplificado.
 *   - Distribución del agua de la Tierra: USGS (con datos de Shiklomanov).
 *
 * Datos puros (sin three ni React).
 */

import type { RetoNumericoData } from "./_reto-numerico";
import type { TextoHuecosData } from "./_mecanica-huecos";

/* ── Modos ────────────────────────────────────────────────────────────── */

export type Modo = "atmosfera" | "oceano" | "ciclo";
export const MODOS: Modo[] = ["atmosfera", "oceano", "ciclo"];

export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string }> = {
  atmosfera: { etq: "Columna de aire", subtitulo: "Capas, presión y un globo sonda", icono: "fa-cloud-arrow-up", color: "#7dd3fc" },
  oceano: { etq: "Océano en corte", subtitulo: "Temperatura, salinidad y densidad", icono: "fa-water", color: "#2dd4bf" },
  ciclo: { etq: "Aire y agua se mezclan", subtitulo: "Evaporación, nube, lluvia y calor latente", icono: "fa-cloud-rain", color: "#a78bfa" },
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

export function num(x: number, dec = 0): string {
  const s = Math.abs(x).toFixed(dec);
  const [ent, frac] = s.split(".");
  const conMiles = ent!.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const negativo = x < 0 && Number(s) !== 0;
  return `${negativo ? "−" : ""}${conMiles}${frac ? `.${frac}` : ""}`;
}

/** Número en notación científica legible: 5.3 × 10²¹. */
export function cientifico(x: number, dec = 1): string {
  if (x === 0) return "0";
  const e = Math.floor(Math.log10(Math.abs(x)));
  const m = x / Math.pow(10, e);
  const sup: Record<string, string> = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
  const exp = String(e)
    .split("")
    .map((c) => sup[c] ?? c)
    .join("");
  return `${m.toFixed(dec)} × 10${exp}`;
}

/** Presión legible: kPa si es grande, Pa si es pequeña. */
export function presionTxt(pPa: number): string {
  if (pPa >= 1000) return `${num(pPa / 1000, pPa >= 10000 ? 1 : 2)} kPa`;
  if (pPa >= 1) return `${num(pPa, pPa >= 100 ? 0 : 1)} Pa`;
  return `${num(pPa, pPa >= 0.01 ? 3 : 4)} Pa`;
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. COLUMNA DE AIRE — Atmósfera Estándar de EUA 1976
 * ════════════════════════════════════════════════════════════════════════ */

export const Z_MAX_KM = 120;
const R0_KM = 6356.766;
/** g₀·M/R en K/km. */
const GMR = 34.163195;
const M_AIRE = 0.0289644; // kg/mol
const R_GAS = 8.31446; // J/(mol·K)
const K_BOLTZ = 1.380649e-23; // J/K

/** Capas de la atmósfera estándar hasta 86 km (altitud geopotencial). */
const BASES_1976: { h: number; t: number; l: number; p: number }[] = [
  { h: 0, t: 288.15, l: -6.5, p: 101325 },
  { h: 11, t: 216.65, l: 0, p: 22632.06 },
  { h: 20, t: 216.65, l: 1.0, p: 5474.889 },
  { h: 32, t: 228.65, l: 2.8, p: 868.0187 },
  { h: 47, t: 270.65, l: 0, p: 110.9063 },
  { h: 51, t: 270.65, l: -2.8, p: 66.93887 },
  { h: 71, t: 214.65, l: -2.0, p: 3.95642 },
];

/** Tabla oficial de 86 a 120 km (altitud geométrica): [km, K, Pa]. */
const TABLA_ALTA: [number, number, number][] = [
  [86, 186.87, 0.37338],
  [90, 186.87, 0.18359],
  [95, 188.42, 0.075966],
  [100, 195.08, 0.032011],
  [110, 240.0, 0.0071042],
  [120, 360.0, 0.0025382],
];

export interface EstadoAire {
  zKm: number;
  tK: number;
  tC: number;
  pPa: number;
  /** Densidad en kg/m³. */
  rho: number;
}

/** Temperatura, presión y densidad del aire a una altitud geométrica (km). */
export function atmosfera(zKmEntrada: number): EstadoAire {
  const zKm = Math.min(Z_MAX_KM, Math.max(0, zKmEntrada));
  let tK: number;
  let pPa: number;
  if (zKm < 86) {
    const h = (R0_KM * zKm) / (R0_KM + zKm);
    let base = BASES_1976[0]!;
    for (const b of BASES_1976) if (h >= b.h) base = b;
    tK = base.t + base.l * (h - base.h);
    pPa = base.l === 0 ? base.p * Math.exp((-GMR * (h - base.h)) / base.t) : base.p * Math.pow(base.t / tK, GMR / base.l);
  } else {
    let i = 0;
    while (i < TABLA_ALTA.length - 2 && zKm > TABLA_ALTA[i + 1]![0]) i++;
    const [z0, t0, p0] = TABLA_ALTA[i]!;
    const [z1, t1, p1] = TABLA_ALTA[i + 1]!;
    const f = (zKm - z0) / (z1 - z0);
    tK = t0 + (t1 - t0) * f;
    pPa = Math.exp(Math.log(p0) + (Math.log(p1) - Math.log(p0)) * f);
  }
  return { zKm, tK, tC: tK - 273.15, pPa, rho: (pPa * M_AIRE) / (R_GAS * tK) };
}

export const AIRE_0 = atmosfera(0);

/** Capas: fronteras de la atmósfera estándar (varían con la latitud y la estación). */
export type CapaId = "troposfera" | "estratosfera" | "mesosfera" | "termosfera";
export const CAPAS: { id: CapaId; etq: string; desde: number; hasta: number; color: string; clave: string; temp: string }[] = [
  { id: "troposfera", etq: "Tropósfera", desde: 0, hasta: 11, color: "#38bdf8", clave: "Aquí vivimos y ocurre el clima: nubes, lluvia y viento. Contiene casi toda la masa del aire y el vapor de agua.", temp: "La temperatura baja unos 6.5 °C por kilómetro." },
  { id: "estratosfera", etq: "Estratósfera", desde: 11, hasta: 50, color: "#818cf8", clave: "Tiene la capa de ozono (O₃), que absorbe la radiación ultravioleta del Sol.", temp: "La temperatura deja de bajar y luego sube: el ozono se calienta al absorber luz UV." },
  { id: "mesosfera", etq: "Mesósfera", desde: 50, hasta: 86, color: "#c084fc", clave: "Aquí se queman casi todos los meteoros: las «estrellas fugaces».", temp: "La temperatura vuelve a bajar: en su tope está el aire más frío de toda la atmósfera (≈ −86 °C en la atmósfera estándar)." },
  { id: "termosfera", etq: "Termósfera", desde: 86, hasta: 600, color: "#f472b6", clave: "Aire tan escaso que casi no hay presión. Aquí ocurren las auroras y orbita la Estación Espacial (≈ 400 km).", temp: "Sube mucho la temperatura: las pocas partículas absorben rayos X y UV extremo." },
];

export function capaDe(zKm: number) {
  return CAPAS.find((c) => zKm < c.hasta) ?? CAPAS[CAPAS.length - 1]!;
}

/** Ozono: la capa se concentra entre ~15 y ~35 km (máximo de densidad hacia 20–25 km en latitudes medias). */
export const OZONO = { desde: 15, hasta: 35, maximo: 25 };

/** Composición del aire seco (fracción en volumen). */
export const COMPOSICION: { formula: string; etq: string; pct: number; color: string }[] = [
  { formula: "N₂", etq: "Nitrógeno", pct: 78.08, color: "#60a5fa" },
  { formula: "O₂", etq: "Oxígeno", pct: 20.95, color: "#f87171" },
  { formula: "Ar", etq: "Argón", pct: 0.93, color: "#fbbf24" },
  { formula: "CO₂", etq: "Dióxido de carbono", pct: 0.042, color: "#a3e635" },
];

/** Moléculas de O₂ en un litro de aire: 0.2095 · P / (k·T). */
export function o2PorLitro(e: EstadoAire): number {
  return (0.2095 * e.pPa) / (K_BOLTZ * e.tK) / 1000;
}

/* ── Punto de ebullición (Antoine, agua, 1–100 °C) ─────────────────────── */

/** Presión del punto triple del agua: por debajo no puede existir agua líquida. */
export const P_TRIPLE_PA = 611.657;

export function ebullicionC(pPa: number): number | null {
  if (pPa < P_TRIPLE_PA) return null;
  const mmHg = pPa / 133.322;
  const t = 1730.63 / (8.07131 - Math.log10(mmHg)) - 233.426;
  return Math.min(100.5, Math.max(0.01, t));
}

/* ── Lugares y alturas de referencia ───────────────────────────────────── */

export const LUGARES: { id: string; etq: string; zKm: number; icono: string; nota: string }[] = [
  { id: "veracruz", etq: "Puerto de Veracruz", zKm: 0.01, icono: "fa-anchor", nota: "Al nivel del mar el aire tiene toda la columna encima." },
  { id: "cdmx", etq: "Ciudad de México", zKm: 2.24, icono: "fa-city", nota: "Con menos aire encima, el agua hierve antes y cada respiración trae menos oxígeno." },
  { id: "orizaba", etq: "Pico de Orizaba", zKm: 5.636, icono: "fa-mountain", nota: "La cumbre más alta de México: la presión es la mitad que en la costa." },
  { id: "everest", etq: "Cima del Everest", zKm: 8.849, icono: "fa-mountain-sun", nota: "Un tercio de la presión del nivel del mar: los alpinistas suelen usar oxígeno embotellado." },
  { id: "avion", etq: "Avión comercial", zKm: 11, icono: "fa-plane", nota: "Los aviones vuelan cerca de la tropopausa, arriba de casi todas las nubes." },
  { id: "armstrong", etq: "Límite de Armstrong", zKm: 19, icono: "fa-user-astronaut", nota: "La presión es tan baja que el agua hierve a 37 °C, la temperatura del cuerpo: sin traje presurizado no se sobrevive." },
  { id: "ozono", etq: "Capa de ozono", zKm: 25, icono: "fa-shield-halved", nota: "El ozono absorbe la radiación ultravioleta y calienta la estratósfera." },
  { id: "meteoros", etq: "Estrellas fugaces", zKm: 90, icono: "fa-meteor", nota: "Los meteoros se queman por fricción con el aire, casi siempre entre 80 y 100 km." },
  { id: "karman", etq: "Línea de Kármán", zKm: 100, icono: "fa-rocket", nota: "Convención internacional para decir dónde empieza el espacio." },
];

/** Lugares donde tiene sentido comparar la ebullición (en tierra firme). */
export const LUGARES_TIERRA = ["veracruz", "cdmx", "orizaba", "everest"];

/* ── Predicción: ¿qué pasa con la temperatura en la estratósfera? ──────── */

export const PREDICCIONES_T: { id: string; etq: string; correcta: boolean }[] = [
  { id: "baja", etq: "Sigue bajando, como en la tropósfera", correcta: false },
  { id: "sube", etq: "Deja de bajar y después sube", correcta: true },
  { id: "rapido", etq: "Baja todavía más rápido", correcta: false },
];

export const EXPLICA_INVERSION = `En la tropopausa (11 km) el aire llega a ${num(atmosfera(11).tC, 1)} °C; después la temperatura se mantiene y sube hasta ${num(atmosfera(47.4).tC, 1)} °C cerca de 47 km. El ozono absorbe la radiación ultravioleta del Sol y calienta el aire de la estratósfera.`;

/* ── Globo sonda ───────────────────────────────────────────────────────── */

export const GLOBO = {
  /** Diámetro al soltarlo, m. */
  d0: 1.8,
  /** Diámetro al que revienta el látex, m. */
  dRuptura: 8,
  /** Velocidad de ascenso, m/s. */
  velocidad: 5,
  /** Segundos de animación por kilómetro subido. */
  segPorKm: 0.5,
};

/** Diámetro del globo a una altitud: el gas se expande según V ∝ T/P. */
export function diametroGlobo(zKm: number): number {
  const e = atmosfera(zKm);
  const razonV = (AIRE_0.pPa / e.pPa) * (e.tK / AIRE_0.tK);
  return GLOBO.d0 * Math.cbrt(razonV);
}

/** Altitud (km) a la que el globo alcanza su diámetro de ruptura. */
export function alturaRuptura(): number {
  let a = 0;
  let b = 60;
  for (let i = 0; i < 60; i++) {
    const m = (a + b) / 2;
    if (diametroGlobo(m) < GLOBO.dRuptura) a = m;
    else b = m;
  }
  return (a + b) / 2;
}

export const Z_RUPTURA = alturaRuptura();

/* ════════════════════════════════════════════════════════════════════════
 * 2. OCÉANO EN CORTE — EOS-80 a 1 atm
 * ════════════════════════════════════════════════════════════════════════ */

/** Densidad del agua de mar (kg/m³) a presión atmosférica: UNESCO 1981. T en °C, S en g/kg. */
export function rhoMar(t: number, s: number): number {
  const rw = 999.842594 + 6.793952e-2 * t - 9.09529e-3 * t ** 2 + 1.001685e-4 * t ** 3 - 1.120083e-6 * t ** 4 + 6.536332e-9 * t ** 5;
  const a = 8.24493e-1 - 4.0899e-3 * t + 7.6438e-5 * t ** 2 - 8.2467e-7 * t ** 3 + 5.3875e-9 * t ** 4;
  const b = -5.72466e-3 + 1.0227e-4 * t - 1.6546e-6 * t ** 2;
  const c = 4.8314e-4;
  const sPos = Math.max(0, s);
  return rw + a * sPos + b * Math.pow(sPos, 1.5) + c * sPos * sPos;
}

export const PROF_MAX = 4000;

export type ZonaId = "tropical" | "templada" | "polar";

export interface Zona {
  id: ZonaId;
  etq: string;
  lugar: string;
  /** [profundidad m, temperatura °C, salinidad g/kg] */
  perfil: [number, number, number][];
  picnoclina: { causa: "termoclina" | "haloclina"; desde: number; hasta: number };
  explica: string;
  hielo: boolean;
}

export const ZONAS: Zona[] = [
  {
    id: "tropical",
    etq: "Trópico",
    lugar: "Golfo de México, en verano",
    perfil: [
      [0, 29.5, 36.3],
      [40, 29.0, 36.3],
      [75, 26.0, 36.4],
      [150, 20.0, 36.4],
      [300, 14.0, 35.6],
      [500, 9.5, 35.1],
      [800, 6.0, 34.9],
      [1200, 4.8, 34.95],
      [2000, 4.3, 34.97],
      [4000, 4.2, 34.97],
    ],
    picnoclina: { causa: "termoclina", desde: 40, hasta: 800 },
    explica: "El Sol calienta una capa superficial que el viento mezcla. Debajo, la temperatura cae rápido (termoclina) hasta el agua fría del fondo. El agua cálida es menos densa y se queda arriba.",
    hielo: false,
  },
  {
    id: "templada",
    etq: "Latitudes medias",
    lugar: "Pacífico frente a Baja California",
    perfil: [
      [0, 20.0, 33.7],
      [50, 19.0, 33.7],
      [100, 14.0, 33.6],
      [200, 10.0, 34.0],
      [400, 7.5, 34.2],
      [700, 5.0, 34.4],
      [1000, 3.8, 34.5],
      [2000, 2.2, 34.62],
      [4000, 1.5, 34.68],
    ],
    picnoclina: { causa: "termoclina", desde: 50, hasta: 700 },
    explica: "La superficie es más templada y la termoclina más suave que en el trópico; el agua profunda es casi helada (≈ 1.5 °C) en todos los océanos.",
    hielo: false,
  },
  {
    id: "polar",
    etq: "Polar",
    lugar: "Océano Ártico, bajo el hielo",
    perfil: [
      [0, -1.7, 31.0],
      [30, -1.6, 31.5],
      [100, -1.5, 33.0],
      [200, -1.0, 34.4],
      [300, 0.5, 34.8],
      [500, 0.8, 34.88],
      [1000, 0.0, 34.9],
      [2000, -0.7, 34.92],
      [4000, -0.9, 34.94],
    ],
    picnoclina: { causa: "haloclina", desde: 30, hasta: 200 },
    explica: "Aquí casi toda el agua está helada, así que la temperatura no separa las capas: lo hace la SALINIDAD. Los ríos y el hielo derretido dejan arriba agua menos salada (haloclina).",
    hielo: true,
  },
];

export interface EstadoAgua {
  prof: number;
  t: number;
  s: number;
  rho: number;
}

export function aguaEn(zona: Zona, profEntrada: number): EstadoAgua {
  const prof = Math.min(PROF_MAX, Math.max(0, profEntrada));
  const p = zona.perfil;
  let i = 0;
  while (i < p.length - 2 && prof > p[i + 1]![0]) i++;
  const [d0, t0, s0] = p[i]!;
  const [d1, t1, s1] = p[i + 1]!;
  const f = Math.min(1, Math.max(0, (prof - d0) / (d1 - d0)));
  const t = t0 + (t1 - t0) * f;
  const s = s0 + (s1 - s0) * f;
  return { prof, t, s, rho: rhoMar(t, s) };
}

/** Escala de dibujo no lineal: los primeros cientos de metros ocupan más espacio. */
export function profADibujo(prof: number): number {
  return Math.sqrt(Math.max(0, prof) / PROF_MAX);
}
export function dibujoAProf(f: number): number {
  return Math.max(0, f) ** 2 * PROF_MAX;
}

/**
 * Profundidad a la que se estaciona una masa de agua de densidad `rho`: donde
 * la del entorno la iguala. Si es más ligera que la superficie, flota; si es
 * más densa que el fondo, llega al fondo.
 */
export function profundidadEquilibrio(zona: Zona, rho: number): { prof: number; donde: "flota" | "capa" | "fondo" } {
  if (rho <= aguaEn(zona, 0).rho) return { prof: 0, donde: "flota" };
  let previo = aguaEn(zona, 0);
  for (let d = 5; d <= PROF_MAX; d += 5) {
    const e = aguaEn(zona, d);
    if (e.rho >= rho) {
      const f = (rho - previo.rho) / Math.max(1e-9, e.rho - previo.rho);
      return { prof: previo.prof + (e.prof - previo.prof) * f, donde: "capa" };
    }
    previo = e;
  }
  return { prof: PROF_MAX, donde: "fondo" };
}

export const MASAS: { id: string; etq: string; t: number; s: number; nota: string }[] = [
  { id: "rio", etq: "Agua de río", t: 20, s: 0.2, nota: "Agua dulce: como la que el Papaloapan o el Grijalva vierten al Golfo." },
  { id: "tropical", etq: "Agua superficial tropical", t: 28, s: 36, nota: "Cálida y salada por la evaporación intensa." },
  { id: "intermedia", etq: "Agua Intermedia Antártica", t: 4, s: 34.3, nota: "Se hunde cerca de la Antártida y viaja hacia el norte por debajo de la termoclina, a unos 700–1 000 m." },
  { id: "helada", etq: "Agua helada y salada", t: -1.9, s: 34.9, nota: "Al formarse el hielo marino, la sal se queda en el agua líquida, que se vuelve fría, salada y muy densa." },
];

export const T_MASA = { min: -2, max: 30 };
export const S_MASA = { min: 0, max: 40 };

/** Densidad del hielo puro a 0 °C. */
export const RHO_HIELO = 917;

/** Fracción del volumen de hielo que queda bajo el agua: ρ hielo / ρ agua. */
export function fraccionSumergida(rhoAgua: number): number {
  return RHO_HIELO / rhoAgua;
}

/** Toda el agua de la Tierra repartida en 1000 litros (USGS, con datos de Shiklomanov). */
export const AGUA_1000L: { etq: string; litros: number; dulce: boolean; color: string }[] = [
  { etq: "Océanos y mares", litros: 965, dulce: false, color: "#0ea5e9" },
  { etq: "Hielo y glaciares", litros: 17.4, dulce: true, color: "#e0f2fe" },
  { etq: "Agua subterránea (dulce y salada)", litros: 16.9, dulce: true, color: "#a16207" },
  { etq: "Lagos", litros: 0.13, dulce: true, color: "#22d3ee" },
  { etq: "Vapor en la atmósfera", litros: 0.01, dulce: true, color: "#cbd5e1" },
  { etq: "Ríos", litros: 0.002, dulce: true, color: "#34d399" },
];

/* ════════════════════════════════════════════════════════════════════════
 * 3. AIRE Y AGUA SE MEZCLAN — una parcela de aire cruza la sierra
 * ════════════════════════════════════════════════════════════════════════ */

const G = 9.80665;
const CP = 1004.7; // J/(kg·K), aire seco
const RD = 287.05; // J/(kg·K)
const EPS = 0.622;
/** Gradiente adiabático seco, °C/km. */
export const GAMMA_SECO = (G / CP) * 1000;

/** Calor latente de vaporización (J/kg) a T °C. */
export function calorLatente(tC: number): number {
  return 2.501e6 - 2370 * tC;
}

/** Presión de vapor de saturación (hPa), Bolton (1980). */
export function presionVaporSat(tC: number): number {
  return 6.112 * Math.exp((17.67 * tC) / (tC + 243.5));
}

/** Punto de rocío (°C) a partir de T y humedad relativa (%). */
export function puntoRocio(tC: number, hr: number): number {
  const g = Math.log(Math.max(1, hr) / 100) + (17.67 * tC) / (tC + 243.5);
  return (243.5 * g) / (17.67 - g);
}

function razonMezclaSat(tC: number, pHPa: number): number {
  const es = presionVaporSat(tC);
  return (EPS * es) / Math.max(1, pHPa - es);
}

/** Terreno: [posición 0–1, altitud m, nombre]. */
export const TERRENO: [number, number, string][] = [
  [0, 0, "Golfo de México"],
  [0.26, 0, "Veracruz"],
  [0.58, 1400, "Xalapa"],
  [0.78, 3000, "Paso de la sierra"],
  [1, 2400, "Perote"],
];

export function alturaTerreno(s: number): number {
  const x = Math.min(1, Math.max(0, s));
  let i = 0;
  while (i < TERRENO.length - 2 && x > TERRENO[i + 1]![0]) i++;
  const [s0, z0] = TERRENO[i]!;
  const [s1, z1] = TERRENO[i + 1]!;
  return z0 + ((z1 - z0) * (x - s0)) / (s1 - s0);
}

export const T_PARCELA = { min: 10, max: 34, def: 26 };
export const HR_PARCELA = { min: 20, max: 100, def: 80 };

export interface PuntoParcela {
  s: number;
  z: number;
  tC: number;
  /** Vapor de agua en g por kg de aire seco. */
  r: number;
  hr: number;
  nube: boolean;
  /** g/kg que se condensaron y cayeron en este tramo. */
  lluvia: number;
}

export interface ViajeParcela {
  puntos: PuntoParcela[];
  t0: number;
  hr0: number;
  rocio0: number;
  r0: number;
  /** Altitud del nivel de condensación (base de la nube), m; null si nunca se satura. */
  zNube: number | null;
  sNube: number | null;
  /** Posición donde deja de llover (cresta), si llovió. */
  sFinLluvia: number | null;
  tCresta: number;
  tFinal: number;
  hrFinal: number;
  /** Temperatura final si nada se hubiera condensado. */
  tFinalSeco: number;
  lluviaTotal: number;
  /** Calor latente liberado, kJ por kg de aire. */
  calorKJ: number;
  /** Altitud donde la parcela llega a 0 °C, m; null si no llega. */
  zCero: number | null;
}

/** Simula el viaje de una parcela de aire del mar a Perote. */
export function viajeParcela(t0: number, hr0: number): ViajeParcela {
  const pHPa = (z: number) => atmosfera(z / 1000).pPa / 100;
  const e0 = (presionVaporSat(t0) * hr0) / 100;
  const r0 = (EPS * e0) / (pHPa(0) - e0);
  let t = t0;
  let r = r0;
  let z = 0;
  let saturado = false;
  let zNube: number | null = null;
  let sNube: number | null = null;
  let sFinLluvia: number | null = null;
  let lluviaTotal = 0;
  let calor = 0;
  let zCero: number | null = t0 <= 0 ? 0 : null;
  const N = 400;
  const puntos: PuntoParcela[] = [];
  for (let k = 0; k <= N; k++) {
    const s = k / N;
    const zDestino = alturaTerreno(s);
    let lluviaTramo = 0;
    const pasos = Math.max(1, Math.ceil(Math.abs(zDestino - z) / 5));
    const dz = (zDestino - z) / pasos;
    for (let j = 0; j < pasos; j++) {
      const p = pHPa(z);
      if (dz > 0) {
        const rs = razonMezclaSat(t, p);
        if (r >= rs) {
          // Ascenso saturado: el vapor se condensa y libera calor latente.
          const tk = t + 273.15;
          const L = calorLatente(t);
          const gm = (G * (1 + (L * rs) / (RD * tk))) / (CP + (L * L * rs * EPS) / (RD * tk * tk));
          t -= gm * dz;
          const rsNuevo = razonMezclaSat(t, pHPa(z + dz));
          const condensa = Math.max(0, r - rsNuevo);
          r -= condensa;
          lluviaTramo += condensa * 1000;
          calor += L * condensa;
          saturado = true;
        } else {
          t -= (G / CP) * dz;
          if (r >= razonMezclaSat(t, pHPa(z + dz)) && zNube === null) {
            zNube = z + dz;
            sNube = s;
          }
        }
      } else if (dz < 0) {
        // Descenso: se comprime y se calienta en seco (la lluvia ya cayó).
        t -= (G / CP) * dz;
        saturado = false;
      }
      z += dz;
      if (zCero === null && t <= 0) zCero = z;
    }
    if (saturado && zNube === null) {
      zNube = 0;
      sNube = s;
    }
    if (lluviaTramo > 0) sFinLluvia = s;
    lluviaTotal += lluviaTramo;
    const rsAqui = razonMezclaSat(t, pHPa(z));
    puntos.push({ s, z, tC: t, r: r * 1000, hr: Math.min(100, (100 * r) / rsAqui), nube: saturado && dz >= 0 && r >= rsAqui * 0.999, lluvia: lluviaTramo });
  }
  const iCresta = puntos.reduce((m, p, i) => (p.z > puntos[m]!.z ? i : m), 0);
  const fin = puntos[puntos.length - 1]!;
  return {
    puntos,
    t0,
    hr0,
    rocio0: puntoRocio(t0, hr0),
    r0: r0 * 1000,
    zNube,
    sNube,
    sFinLluvia,
    tCresta: puntos[iCresta]!.tC,
    tFinal: fin.tC,
    hrFinal: fin.hr,
    tFinalSeco: t0 - (GAMMA_SECO * fin.z) / 1000,
    lluviaTotal,
    calorKJ: calor / 1000,
    zCero,
  };
}

/** Estado físico del agua dentro de la parcela en un punto. */
export function estadoAguaParcela(p: PuntoParcela): { etq: string; icono: string } {
  if (!p.nube) return { etq: "vapor invisible (gas)", icono: "fa-wind" };
  if (p.tC < 0) return { etq: "cristales de hielo y gotas (sólido y líquido)", icono: "fa-snowflake" };
  return { etq: "gotitas de nube (líquido)", icono: "fa-cloud" };
}

/** Segundos de animación del viaje de la parcela. */
export const SEG_VIAJE = 9;

/** Datos reales de contraste: normales climatológicas (SMN/CONAGUA), cifras redondeadas. */
export const CONTRASTE_SIERRA = "En la realidad: Xalapa, en la ladera que mira al Golfo, recibe alrededor de 1 500 mm de lluvia al año; Perote, del otro lado de la sierra, alrededor de 500 mm.";

/* ════════════════════════════════════════════════════════════════════════
 * Estrellas: ¿tiempo atmosférico o clima?
 * ════════════════════════════════════════════════════════════════════════ */

export const ENUNCIADOS: { texto: string; clima: boolean; porque: string }[] = [
  { texto: "Hoy en Monterrey amaneció a 8 °C y con neblina.", clima: false, porque: "Describe un lugar en un momento concreto: hoy." },
  { texto: "Mérida tiene veranos calurosos y lluviosos año tras año.", clima: true, porque: "Es el patrón que se repite durante muchos años." },
  { texto: "Mañana se esperan lluvias fuertes en Veracruz por un frente frío.", clima: false, porque: "Es un pronóstico para un día: tiempo atmosférico." },
  { texto: "En el centro de México la temporada de lluvias suele ir de mayo a octubre.", clima: true, porque: "«Suele» resume lo que pasa en promedio cada año." },
  { texto: "Esta tarde cayó granizo en Toluca.", clima: false, porque: "Es un evento de un lugar y un momento." },
  { texto: "El desierto de Sonora es cálido y seco la mayor parte del año.", clima: true, porque: "Describe el patrón promedio de una región." },
  { texto: "Ahora mismo hay 85 % de humedad en Tampico.", clima: false, porque: "«Ahora mismo» es el estado actual de la atmósfera." },
  { texto: "La temporada de huracanes del Atlántico va del 1 de junio al 30 de noviembre.", clima: true, porque: "Se define con décadas de registros: es climatología." },
  { texto: "El huracán de esta semana tocó tierra en Guerrero.", clima: false, porque: "Un huracán concreto es un fenómeno del tiempo atmosférico." },
  { texto: "En Chiapas, las lluvias abundantes en verano son lo habitual.", clima: true, porque: "«Lo habitual» es el patrón de muchos años." },
  { texto: "Ayer la Ciudad de México llegó a 30 °C, más de lo normal para la fecha.", clima: false, porque: "Describe un día; lo «normal» es el clima con el que se compara." },
  { texto: "La costa de Oaxaca es cálida todo el año.", clima: true, porque: "Es un promedio de largo plazo de la región." },
];

export function rondaEnunciados(rnd: () => number, n = 6): number[] {
  const deClima = ENUNCIADOS.map((e, i) => ({ e, i })).filter((x) => x.e.clima).map((x) => x.i);
  const deTiempo = ENUNCIADOS.map((e, i) => ({ e, i })).filter((x) => !x.e.clima).map((x) => x.i);
  const baraja = (xs: number[]) => {
    const a = [...xs];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j]!, a[i]!];
    }
    return a;
  };
  const mitad = Math.floor(n / 2);
  return baraja([...baraja(deClima).slice(0, n - mitad), ...baraja(deTiempo).slice(0, mitad)]);
}

export function estrellasPorErrores(errores: number): number {
  return errores === 0 ? 3 : errores <= 2 ? 2 : 1;
}

/* ════════════════════════════════════════════════════════════════════════
 * Contenido VERBATIM
 * ════════════════════════════════════════════════════════════════════════ */

export const TITULO_A1 = "Aire y agua: las capas y la química de la atmósfera y la hidrósfera";

/** Lectura A1 — seis párrafos, verbatim. */
export const LECTURA_A1: string[] = [
  "La Tierra es un sistema de esferas que interactúan. Dos de ellas, la ATMÓSFERA (el aire) y la HIDRÓSFERA (el agua), se explican muy bien aplicando lo que sabemos de los ESTADOS DE AGREGACIÓN de la materia (sólido, líquido, gas) y de sus propiedades: densidad, presión y temperatura. Entender su composición química y sus capas es clave para comprender el clima, el agua que bebemos y la vida en el planeta.",
  "LA ATMÓSFERA: un océano de aire. La atmósfera es la capa de gases que rodea la Tierra. El AIRE es una mezcla: aproximadamente 78% de nitrógeno (N₂), 21% de oxígeno (O₂) y un 1% de otros gases (argón, dióxido de carbono CO₂, vapor de agua). Se organiza en CAPAS según su temperatura y altura: la TROPÓSFERA (donde vivimos y ocurre el clima, los primeros ~12 km), la ESTRATÓSFERA (con la capa de ozono que filtra la radiación ultravioleta), la MESÓSFERA, la TERMÓSFERA y la EXÓSFERA. La PRESIÓN ATMOSFÉRICA —el peso del aire— disminuye con la altura: por eso en la Ciudad de México (a 2240 m) el agua hierve a unos 92 °C en lugar de 100 °C, y por eso cuesta más respirar en la montaña.",
  "DENSIDAD, PRESIÓN Y TEMPERATURA. Estas tres propiedades explican el comportamiento del aire y el agua. La DENSIDAD es la masa por unidad de volumen (densidad = masa/volumen): el aire caliente es menos denso y sube, lo que genera vientos y nubes. La PRESIÓN es la fuerza por unidad de área; en los gases aumenta con la temperatura y disminuye con la altura. La TEMPERATURA mide la energía del movimiento de las partículas. Juntas explican fenómenos cotidianos: por qué sube el humo, por qué se forman las nubes o por qué el agua del mar circula.",
  "LA HIDRÓSFERA: toda el agua del planeta. La hidrósfera es el conjunto del agua terrestre en sus tres estados: líquida (océanos, ríos, lagos), sólida (glaciares, hielo polar) y gaseosa (vapor en el aire). El AGUA (H₂O) es un compuesto con propiedades únicas: gran capacidad para disolver (por eso el agua de mar contiene sales) y para almacenar calor (regula el clima). La mayor parte (~97%) es agua salada de los océanos; solo una pequeña fracción es agua dulce, y de ella casi toda está congelada, lo que vuelve crucial cuidar el agua disponible.",
  "EL CICLO DEL AGUA. La atmósfera y la hidrósfera se conectan en el CICLO BIOGEOQUÍMICO DEL AGUA, un viaje continuo entre estados de agregación impulsado por el Sol: el agua se EVAPORA de océanos y lagos (líquido → gas), se CONDENSA en las nubes (gas → líquido), PRECIPITA como lluvia o nieve (líquido o sólido), y regresa por ríos e infiltración. Es un ejemplo perfecto de cambios de estado de la materia operando a escala planetaria.",
  "CLIMA vs TIEMPO ATMOSFÉRICO. Conviene no confundir dos conceptos. El TIEMPO ATMOSFÉRICO es el estado de la atmósfera en un lugar y momento concretos (hoy está nublado y llueve). El CLIMA es el patrón promedio del tiempo en una región durante muchos años (el clima de Mérida es cálido y húmedo). México tiene una enorme variedad de climas —desérticos en el norte, templados en el centro, tropicales en el sur— precisamente por su relieve, latitud y la interacción entre la atmósfera y la hidrósfera. Aplicar las propiedades de la materia permite explicar todos estos fenómenos de nuestro hogar, el sistema terrestre.",
];

/** Preguntas de comprensión de la lectura A1 — verbatim. */
export const PREGUNTAS: string[] = [
  "¿Cuál es la composición aproximada del aire y cómo se organiza la atmósfera?",
  "¿Cómo explican la densidad, la presión y la temperatura el comportamiento del aire?",
  "¿En qué se diferencian el tiempo atmosférico y el clima?",
];

/** Reflexión A3 «El agua y el aire en tu localidad» — verbatim. */
export const REFLEXION_A3 =
  "Observa un fenómeno de la atmósfera o la hidrósfera de tu localidad —la lluvia o las nubes, la neblina, el rocío de la mañana, un río o presa, el agua que llega a tu casa, el clima de tu región o por qué hierve distinto el agua según la altura— y explícalo aplicando lo que aprendiste. Usa al menos dos conceptos (estados de agregación, densidad, presión, temperatura, ciclo del agua) y distingue si describes el tiempo atmosférico o el clima. Reflexiona sobre por qué cuidar el agua y el aire es importante para tu comunidad.";

/** Hechos: quiz A4 (verdadero/falso), cada enunciado con su retroalimentación verbatim. */
export const HECHOS: { enunciado: string; verdadero: boolean; retro: string }[] = [
  { enunciado: "El aire está compuesto en su mayoría por nitrógeno (~78%) y oxígeno (~21%).", verdadero: true, retro: "Correcto: el N₂ es el gas más abundante, seguido del O₂, y el ~1% restante son otros gases." },
  { enunciado: "La presión atmosférica aumenta a medida que subimos a mayor altura.", verdadero: false, retro: "Falso: la presión DISMINUYE con la altura, porque hay menos aire encima; por eso el agua hierve a menor temperatura en lugares altos." },
  { enunciado: "La densidad se calcula como masa dividida entre volumen.", verdadero: true, retro: "Correcto: densidad = masa/volumen; el agua tiene ~1.0 g/cm³." },
  { enunciado: "En el ciclo del agua, la evaporación es el paso de líquido a gas.", verdadero: true, retro: "Correcto: el agua líquida se transforma en vapor; luego se condensa (gas→líquido) y precipita." },
  { enunciado: "El clima y el tiempo atmosférico son exactamente lo mismo.", verdadero: false, retro: "Falso: el tiempo es el estado de la atmósfera aquí y ahora; el clima es el patrón promedio de muchos años en una región." },
  { enunciado: "El hielo flota en el agua porque es menos denso que el agua líquida.", verdadero: true, retro: "Correcto: el hielo (~0.92 g/cm³) es menos denso que el agua (~1.0 g/cm³), por eso flota." },
];

/** Glosario A5 — verbatim. */
export const GLOSARIO: { termino: string; definicion: string; ejemplo: string }[] = [
  { termino: "Atmósfera", definicion: "Capa de gases que rodea la Tierra; el aire.", ejemplo: "Sus capas: tropósfera, estratósfera, mesósfera, termósfera, exósfera." },
  { termino: "Hidrósfera", definicion: "Conjunto del agua del planeta en estado sólido, líquido y gaseoso.", ejemplo: "Océanos, glaciares y vapor atmosférico." },
  { termino: "Aire", definicion: "Mezcla de gases: ~78% N₂, ~21% O₂ y ~1% otros.", ejemplo: "Incluye argón, CO₂ y vapor de agua." },
  { termino: "Densidad", definicion: "Masa por unidad de volumen (masa/volumen).", ejemplo: "Agua ≈ 1.0 g/cm³; hielo ≈ 0.92 g/cm³." },
  { termino: "Presión atmosférica", definicion: "Peso del aire por unidad de área; disminuye con la altura.", ejemplo: "En la CDMX el agua hierve a ~92 °C." },
  { termino: "Temperatura", definicion: "Medida de la energía del movimiento de las partículas.", ejemplo: "El aire caliente es menos denso y sube." },
  { termino: "Estados de agregación", definicion: "Formas de la materia: sólido, líquido y gas.", ejemplo: "El agua aparece en los tres en la naturaleza." },
  { termino: "Ciclo del agua", definicion: "Movimiento continuo del agua por cambios de estado: evaporación, condensación y precipitación.", ejemplo: "Impulsado por la energía del Sol." },
  { termino: "Tiempo atmosférico", definicion: "Estado de la atmósfera en un lugar y momento concretos.", ejemplo: "Hoy está nublado y llueve." },
  { termino: "Clima", definicion: "Patrón promedio del tiempo en una región durante muchos años.", ejemplo: "El clima cálido-húmedo del sureste de México." },
];

export const ACTIVIDAD_A5 =
  "Para una muestra de 250 g de agua que ocupa 250 cm³: (1) calcula su densidad; (2) di en qué se diferencia del hielo; (3) ordena los tres pasos del ciclo del agua indicando el cambio de estado de cada uno.";

export const FUENTE_A1 =
  "MCCEMS 2025 — Ciencias Naturales, Experimentales y Tecnología III «Nuestro hogar. El sistema terrestre», contenido formativo: Capas y composición química de la hidrósfera y la atmósfera · Conceptos involucrados: aire, agua, densidad, presión, temperatura y compuestos químicos · Ciclo biogeoquímico del agua · Concepto de clima y tiempo atmosférico.";

export const FUENTE = `CEN Bachillerato — CNEYT-III, progresión 2 (actividades CNEYT-III-P10): lectura A1, ejercicio A2, reflexión A3, verdadero/falso A4, glosario A5 y texto A6. ${FUENTE_A1}`;

/** Ejercicio A2 «Densidad, presión y el ciclo del agua» — verbatim. */
export const RETO_A2: RetoNumericoData = {
  titulo: "Densidad, presión y el ciclo del agua (A2)",
  contexto:
    "El ejercicio aplica el contenido formativo: densidad como propiedad de la materia, los estados de agregación en el ciclo biogeoquímico del agua y la presión atmosférica, con un caso real de la Ciudad de México.",
  problema:
    "a) DENSIDAD DEL AGUA. Una muestra de agua tiene una masa de 500 g y ocupa un volumen de 500 cm³. Calcula su densidad. (Fórmula: densidad = masa / volumen.)\n\nb) ¿FLOTA O SE HUNDE? El hielo tiene una densidad de aproximadamente 0.92 g/cm³ y el agua líquida 1.0 g/cm³. ¿Por qué el hielo flota en el agua?\n\nc) CICLO DEL AGUA. Nombra, en orden, los tres cambios de estado principales del ciclo del agua e indica qué transformación de la materia ocurre en cada uno (de qué estado a qué estado).\n\nd) PRESIÓN Y ALTURA. En la Ciudad de México (2240 m) el agua hierve a ~92 °C y no a 100 °C. Explica por qué, usando el concepto de presión atmosférica.",
  campos: [
    { etiqueta: "a) Densidad de la muestra de agua", objetivo: 1.0, tolerancia: 0.01, unidad: "g/cm³" },
    { etiqueta: "d) Temperatura a la que hierve el agua en la Ciudad de México", objetivo: 92, tolerancia: 1, unidad: "°C" },
  ],
  pasosGuia: [
    "a) densidad = masa/volumen = 500 g / 500 cm³ = 1.0 g/cm³ (la densidad típica del agua).",
    "b) El hielo (0.92 g/cm³) es MENOS denso que el agua líquida (1.0 g/cm³); como tiene menos masa por unidad de volumen, flota. (Es una propiedad inusual del agua: al congelarse se expande.)",
    "c) Evaporación: líquido → gas (el agua de océanos y lagos pasa a vapor). Condensación: gas → líquido (el vapor forma las gotas de las nubes). Precipitación: líquido o sólido cae como lluvia o nieve.",
    "d) A mayor altura hay menos aire encima, así que la presión atmosférica es menor. El agua hierve cuando su presión de vapor iguala a la presión externa; si esta es menor (como en la CDMX), hierve a menor temperatura (~92 °C).",
  ],
  respuestaFinal:
    "a) 1.0 g/cm³. b) El hielo flota por ser menos denso (0.92 < 1.0 g/cm³). c) Evaporación (líq→gas), condensación (gas→líq), precipitación (cae líq/sólido). d) Menor presión atmosférica en altura ⇒ el agua hierve a menor temperatura (~92 °C).",
};

/** Actividad A6 «Completa: el aire, el agua y sus propiedades» — verbatim. */
export const HUECOS_A6: TextoHuecosData = {
  ancla: "CNEYT-III-P10-A6 · Completa: el aire, el agua y sus propiedades",
  instrucciones: "Arrastra o escribe la palabra correcta en cada espacio.",
  partes: [
    "La ",
    " es la capa de gases que rodea la Tierra; el aire es ~78% de ",
    " y ~21% de oxígeno. La ",
    " es toda el agua del planeta en sus tres estados. La ",
    " es la masa por unidad de volumen, y la presión atmosférica ",
    " con la altura. En el ciclo del agua, el agua se ",
    " (líquido a gas), se condensa (gas a líquido) y ",
    " como lluvia o nieve. El ",
    " atmosférico es el estado de la atmósfera ahora, mientras que el ",
    " es el patrón promedio de muchos años. El hielo flota porque es menos ",
    " que el agua líquida.",
  ],
  huecos: [
    { respuesta: "atmósfera", alternativas: ["atmosfera", "la atmósfera"] },
    { respuesta: "nitrógeno", alternativas: ["nitrogeno", "N₂", "N2"] },
    { respuesta: "hidrósfera", alternativas: ["hidrosfera", "la hidrósfera"] },
    { respuesta: "densidad", alternativas: ["la densidad"] },
    { respuesta: "disminuye", alternativas: ["baja", "decrece"] },
    { respuesta: "evapora", alternativas: ["evaporación", "evaporiza"] },
    { respuesta: "precipita", alternativas: ["precipitación", "cae"] },
    { respuesta: "tiempo", alternativas: ["tiempo atmosférico"] },
    { respuesta: "clima", alternativas: ["el clima"] },
    { respuesta: "denso", alternativas: ["densa", "denso que"] },
  ],
};

/* ── Textos del laboratorio (no verbatim) ──────────────────────────────── */

export const PROBLEMA =
  "¿Por qué el aire se acomoda en capas, por qué el mar tiene agua cálida arriba y helada abajo, y por qué llueve más de un lado de la sierra que del otro? Con densidad, presión, temperatura y los cambios de estado del agua puedes explicarlo: sube un globo sonda por la atmósfera, baja un sensor al fondo del mar y sigue una parcela de aire húmedo desde el Golfo de México hasta Perote.";

export const INSTRUCCIONES: string[] = [
  "En Columna de aire, predice qué pasa con la temperatura en la estratósfera, mueve la sonda o salta a un lugar, y suelta el globo sonda para ver cómo crece hasta reventar.",
  "En Océano en corte, elige una zona, baja el sensor CTD por debajo de la picnoclina y suelta masas de agua o un bloque de hielo para ver dónde se acomodan.",
  "En Aire y agua se mezclan, ajusta la temperatura y la humedad del aire del Golfo y suelta la parcela: mira dónde se forma la nube, dónde llueve y cómo llega el aire a Perote.",
  "Gana estrellas en «¿Tiempo o clima?» y resuelve el reto A2 y el texto A6.",
];

export const IDEAS: string[] = [
  "La presión es el peso del aire que queda encima: por eso baja con la altura, y con ella el punto de ebullición del agua.",
  "Las capas de la atmósfera se definen por cómo cambia la temperatura: en la estratósfera sube porque el ozono absorbe luz ultravioleta.",
  "El aire es una mezcla cuya proporción (78 % N₂, 21 % O₂) casi no cambia hasta ~100 km; lo que cambia es cuántas moléculas hay en cada litro.",
  "El océano se acomoda por densidad: agua cálida o poco salada arriba, fría y salada abajo; la zona de cambio brusco es la picnoclina.",
  "El hielo flota porque es menos denso que el agua; en el mar, alrededor del 90 % de su volumen queda bajo la superficie.",
  "Cuando el vapor se condensa en una nube libera el calor latente que absorbió al evaporarse: por eso el aire que cruza la sierra llega más cálido y seco.",
];

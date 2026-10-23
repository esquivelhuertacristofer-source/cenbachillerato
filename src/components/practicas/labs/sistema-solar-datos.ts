// =============================================================================
// Sistema Solar (laboratorio insignia) — datos, efemérides y física
// =============================================================================
// Fusión de dos labs de NEM básica (Explorador espacial y El Sistema Solar) con
// la capa de física de bachillerato: gravitación (CNEYT-V P3) y leyes de Kepler
// (PM-IV P6).
//
// DÓNDE ESTÁ CADA PLANETA HOY. Elementos orbitales medios de J2000 y su ritmo
// por siglo (JPL, «Approximate Positions of the Planets», E. M. Standish). Aquí,
// a diferencia del original, la anomalía verdadera sale de resolver la ECUACIÓN
// DE KEPLER (M = E − e·sen E, Newton-Raphson), no de la serie hasta e²: así la
// distancia al Sol de cada día también es la real, y con ella la fuerza.
// Error de ~1° en la longitud entre 1800 y 2050; las órbitas se dibujan en un
// mismo plano (no se dibuja la inclinación de cada una).
//
// LOS NÚMEROS. Masas, radios, periodos y datos de ficha: NASA, Planetary Fact
// Sheet. GM del Sol: IAU 2015 (1.32712440018 × 10²⁰ m³/s²). UA: IAU 2012.
// TODO lo que se muestra se CALCULA de esos datos; nada se escribe a mano.
// =============================================================================

import type { RetoNumericoData } from "./_reto-numerico";

const GRAD = Math.PI / 180;

/* ── Constantes físicas ─────────────────────────────────────────────────── */
export const G = 6.674e-11; // N·m²/kg²
/** Parámetro gravitacional del Sol, G·M☉ (m³/s²). */
export const GM_SOL = 1.32712440018e20;
/** Masa del Sol (kg) = GM☉ / G. */
export const M_SOL = 1.989e30;
/** Unidad astronómica (m). */
export const UA = 1.495978707e11;
/** Año sideral de la Tierra (días): el patrón con que se miden los periodos. */
export const ANIO_DIAS = 365.256;
/** Rapidez de una órbita circular a 1 UA: √(GM☉/UA) ≈ 29.78 km/s. */
export const V_UA = Math.sqrt(GM_SOL / UA);
/** T²/a³ en el SI: 4π²/GM☉ (s²/m³). */
export const KEPLER_SI = (4 * Math.PI * Math.PI) / GM_SOL;

/* ── Tiempo ─────────────────────────────────────────────────────────────── */
export const DIA_MS = 86_400_000;

/** Días desde J2000.0 (1 de enero de 2000, 12:00 UT). */
export function diasJ2000(fecha: Date | number): number {
  const t = typeof fecha === "number" ? fecha : fecha.getTime();
  return t / DIA_MS + 2_440_587.5 - 2_451_545.0;
}

export function normal360(x: number): number {
  return ((x % 360) + 360) % 360;
}

/* ── Ecuación de Kepler ─────────────────────────────────────────────────── */
/** Resuelve M = E − e·sen E por Newton-Raphson (M en radianes). Devuelve E. */
export function resolverKepler(M: number, e: number): number {
  const m = ((M % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  let E = e < 0.8 ? m : Math.PI;
  for (let i = 0; i < 30; i++) {
    const d = (E - e * Math.sin(E) - m) / (1 - e * Math.cos(E));
    E -= d;
    if (Math.abs(d) < 1e-12) break;
  }
  return E;
}

/**
 * Punto de una elipse de Kepler con el Sol en el foco (origen) y el perihelio
 * sobre +x. `M` = anomalía media (rad). Devuelve coordenadas en el plano de la
 * órbita (unidades de `a`), la distancia r y la anomalía verdadera ν.
 */
export function puntoKepler(a: number, e: number, M: number): { x: number; y: number; r: number; nu: number; E: number } {
  const E = resolverKepler(M, e);
  const x = a * (Math.cos(E) - e);
  const y = a * Math.sqrt(1 - e * e) * Math.sin(E);
  return { x, y, r: Math.hypot(x, y), nu: Math.atan2(y, x), E };
}

/**
 * 2.ª ley de Kepler, MEDIDA (no supuesta): divide el periodo en N tiempos
 * iguales (pasos iguales de anomalía media), arma el abanico Sol–arco de cada
 * uno y calcula su área con la fórmula del cordón (shoelace). Devuelve la
 * fracción del área total de la elipse (πab) que barre cada intervalo. Si la
 * ley se cumple, todas valen 1/N.
 */
export function areasSectores(e: number, N: number, pasos = e > 0.8 ? 600 : 96): number[] {
  const a = 1;
  const total = Math.PI * a * a * Math.sqrt(1 - e * e);
  const out: number[] = [];
  for (let i = 0; i < N; i++) {
    let doble = 0;
    let prev = puntoKepler(a, e, (i / N) * 2 * Math.PI);
    for (let k = 1; k <= pasos; k++) {
      const p = puntoKepler(a, e, ((i + k / pasos) / N) * 2 * Math.PI);
      // triángulo (foco = origen, prev, p): área = ½·|x1·y2 − x2·y1|
      doble += prev.x * p.y - p.x * prev.y;
      prev = p;
    }
    out.push(Math.abs(doble) / 2 / total);
  }
  return out;
}

/* ── Física ─────────────────────────────────────────────────────────────── */
/** Fuerza del Sol sobre una masa m (kg) a r (UA): F = G·M☉·m / r² (N). */
export function fuerzaSol(mKg: number, rUA: number): number {
  return (GM_SOL * mKg) / (rUA * UA) ** 2;
}
/** Aceleración que produce el Sol a r (UA): g = G·M☉ / r² (m/s²). */
export function aceleracionSol(rUA: number): number {
  return GM_SOL / (rUA * UA) ** 2;
}
/** 3.ª ley de Kepler con el Sol: T (años) = a^(3/2), a en UA. */
export function periodoAnios(aUA: number): number {
  return Math.pow(aUA, 1.5);
}
/** Vis-viva: v² = G·M☉·(2/r − 1/a). Rapidez en km/s, r y a en UA. */
export function visViva(rUA: number, aUA: number): number {
  return (V_UA * Math.sqrt(Math.max(0, 2 / rUA - 1 / aUA))) / 1000;
}

/* ── Formato (es-MX, sin toLocaleString: servidor y navegador difieren) ─── */
const SUP: Record<string, string> = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
/** 3.54 × 10²² */
export function sci(n: number, dec = 2): string {
  if (!Number.isFinite(n) || n === 0) return "0";
  const exp = Math.floor(Math.log10(Math.abs(n)));
  const man = n / Math.pow(10, exp);
  const sup = String(exp).split("").map((c) => SUP[c] ?? c).join("");
  return `${man.toFixed(dec)} × 10${sup}`;
}
/** Miles con coma, como se escriben en México. */
export function miles(n: number, dec = 0): string {
  const [ent, frac] = Math.abs(n).toFixed(dec).split(".");
  const s = ent!.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${n < 0 ? "−" : ""}${s}${frac ? `.${frac}` : ""}`;
}

/* ── Planetas ───────────────────────────────────────────────────────────── */
export type IdPlaneta = "mercurio" | "venus" | "tierra" | "marte" | "jupiter" | "saturno" | "urano" | "neptuno";

export interface Planeta {
  id: IdPlaneta;
  nombre: string;
  /** Archivo de textura en /media/espacio, sin resolución ni extensión. */
  textura: string;
  /** Hay versión 4K para la computadora. */
  cuatroK: boolean;
  radioKm: number;
  masaKg: number;
  /** Semieje mayor (UA). */
  ua: number;
  e: number;
  /** Longitud media en J2000 y su avance por siglo juliano (°). */
  L0: number;
  Lsiglo: number;
  /** Longitud del perihelio (°). */
  perihelio: number;
  /** Inclinación del eje respecto a su órbita (°; más de 90 = gira al revés). */
  ejeGrados: number;
  /** Un giro sobre su eje (h). */
  giroHoras: number;
  /** Una vuelta al Sol (días). */
  anioDias: number;
  color: string;
  anillo?: { interior: number; exterior: number };
  tipo: string;
  resumen: string;
  /** Cómo lo conocemos (del lab «El Sistema Solar» de NEM). */
  historia: string;
  datos: { etiqueta: string; valor: string }[];
}

export const PLANETAS: Planeta[] = [
  {
    id: "mercurio", nombre: "Mercurio", textura: "mercurio", cuatroK: false, radioKm: 2440.5, masaKg: 3.3011e23,
    ua: 0.38709927, e: 0.20563593, L0: 252.2503235, Lsiglo: 149472.67411175, perihelio: 77.45779628,
    ejeGrados: 0.03, giroHoras: 1407.6, anioDias: 87.969, color: "#c4bdb5",
    tipo: "Planeta rocoso · el más cercano al Sol",
    resumen: "El más pequeño de los ocho. Casi no tiene aire que guarde el calor: de día se calienta muchísimo y de noche se congela. Su órbita es la más excéntrica de los ocho.",
    historia: "Se ve a simple vista, cerca del horizonte al amanecer o al atardecer.",
    datos: [
      { etiqueta: "Diámetro", valor: "4,879 km" },
      { etiqueta: "Un giro sobre su eje", valor: "58.6 días" },
      { etiqueta: "Lunas", valor: "0" },
      { etiqueta: "Temperatura media", valor: "167 °C" },
    ],
  },
  {
    id: "venus", nombre: "Venus", textura: "venus", cuatroK: false, radioKm: 6051.8, masaKg: 4.8675e24,
    ua: 0.72333566, e: 0.00677672, L0: 181.9790995, Lsiglo: 58517.81538729, perihelio: 131.60246718,
    ejeGrados: 177.4, giroHoras: 5832.5, anioDias: 224.701, color: "#e9d8a6",
    tipo: "Planeta rocoso · segundo desde el Sol",
    resumen: "Sus nubes gruesas atrapan el calor: es el planeta más caliente, más que Mercurio. Gira al revés que casi todos, y muy despacio.",
    historia: "Se ve a simple vista: después del Sol y la Luna, es lo que más brilla en el cielo.",
    datos: [
      { etiqueta: "Diámetro", valor: "12,104 km" },
      { etiqueta: "Un giro sobre su eje", valor: "243 días, al revés" },
      { etiqueta: "Lunas", valor: "0" },
      { etiqueta: "Temperatura media", valor: "464 °C" },
    ],
  },
  {
    id: "tierra", nombre: "Tierra", textura: "tierra-dia", cuatroK: true, radioKm: 6371, masaKg: 5.9724e24,
    ua: 1.00000261, e: 0.01671123, L0: 100.46457166, Lsiglo: 35999.37244981, perihelio: 102.93768193,
    ejeGrados: 23.44, giroHoras: 23.93, anioDias: 365.256, color: "#60a5fa",
    tipo: "Planeta rocoso · tercero desde el Sol",
    resumen: "El único lugar conocido con vida. Casi tres cuartas partes de su superficie están cubiertas de agua; por eso se ve azul desde el espacio.",
    historia: "Las naves y los satélites artificiales la fotografían completa desde el espacio.",
    datos: [
      { etiqueta: "Diámetro", valor: "12,756 km" },
      { etiqueta: "Un giro sobre su eje", valor: "23 h 56 min" },
      { etiqueta: "Lunas", valor: "1" },
      { etiqueta: "Temperatura media", valor: "15 °C" },
    ],
  },
  {
    id: "marte", nombre: "Marte", textura: "marte", cuatroK: true, radioKm: 3396.2, masaKg: 6.4171e23,
    ua: 1.52371034, e: 0.0933941, L0: -4.55343205, Lsiglo: 19140.30268499, perihelio: -23.94362959,
    ejeGrados: 25.19, giroHoras: 24.62, anioDias: 686.98, color: "#e0714a",
    tipo: "Planeta rocoso · cuarto desde el Sol",
    resumen: "Se ve rojo por el óxido de hierro de su suelo. Tiene el volcán más alto que se conoce, el monte Olimpo, y varios robots lo recorren.",
    historia: "Se ve a simple vista. Con sus observaciones de Marte, Tycho Brahe le dio a Kepler los datos para descubrir que las órbitas son elipses.",
    datos: [
      { etiqueta: "Diámetro", valor: "6,792 km" },
      { etiqueta: "Un giro sobre su eje", valor: "24 h 37 min" },
      { etiqueta: "Lunas", valor: "2" },
      { etiqueta: "Temperatura media", valor: "−65 °C" },
    ],
  },
  {
    id: "jupiter", nombre: "Júpiter", textura: "jupiter", cuatroK: true, radioKm: 71492, masaKg: 1.89819e27,
    ua: 5.202887, e: 0.04838624, L0: 34.39644051, Lsiglo: 3034.74612775, perihelio: 14.72847983,
    ejeGrados: 3.13, giroHoras: 9.93, anioDias: 4332.59, color: "#e3bf94",
    tipo: "Planeta gaseoso · el más grande",
    resumen: "Cabrían más de mil Tierras dentro. La Gran Mancha Roja es una tormenta más grande que nuestro planeta que dura siglos.",
    historia: "Se ve a simple vista. En 1610, con un telescopio, Galileo Galilei descubrió cuatro de sus lunas.",
    datos: [
      { etiqueta: "Diámetro", valor: "142,984 km" },
      { etiqueta: "Un giro sobre su eje", valor: "9 h 56 min" },
      { etiqueta: "Lunas", valor: "Más de 90" },
      { etiqueta: "Temperatura media", valor: "−110 °C" },
    ],
  },
  {
    id: "saturno", nombre: "Saturno", textura: "saturno", cuatroK: true, radioKm: 60268, masaKg: 5.6834e26,
    ua: 9.53667594, e: 0.05386179, L0: 49.95424423, Lsiglo: 1222.49362201, perihelio: 92.59887831,
    ejeGrados: 26.73, giroHoras: 10.66, anioDias: 10759.22, color: "#ecd9a6",
    anillo: { interior: 1.239, exterior: 2.27 },
    tipo: "Planeta gaseoso · el de los anillos",
    resumen: "Sus anillos están hechos de trozos de hielo y roca, desde granos de polvo hasta bloques como casas. Es tan ligero que flotaría en el agua.",
    historia: "Se ve a simple vista. A mediados del siglo XVII, con un telescopio, Christiaan Huygens explicó que lo rodea un anillo.",
    datos: [
      { etiqueta: "Diámetro", valor: "120,536 km" },
      { etiqueta: "Un giro sobre su eje", valor: "10 h 40 min" },
      { etiqueta: "Lunas", valor: "Más de 140" },
      { etiqueta: "Temperatura media", valor: "−140 °C" },
    ],
  },
  {
    id: "urano", nombre: "Urano", textura: "urano", cuatroK: false, radioKm: 25559, masaKg: 8.6813e25,
    ua: 19.18916464, e: 0.04725744, L0: 313.23810451, Lsiglo: 428.48202785, perihelio: 170.9542763,
    ejeGrados: 97.77, giroHoras: 17.24, anioDias: 30688.5, color: "#a5e3ec",
    tipo: "Gigante de hielo · séptimo desde el Sol",
    resumen: "Gira acostado: su eje está casi tumbado sobre su órbita, como una pelota que rueda. Por eso cada polo pasa 42 años de día y 42 de noche.",
    historia: "William Herschel lo descubrió con un telescopio en 1781. Solo una sonda lo ha visitado: la Voyager 2, en 1986.",
    datos: [
      { etiqueta: "Diámetro", valor: "51,118 km" },
      { etiqueta: "Un giro sobre su eje", valor: "17 h 14 min, al revés" },
      { etiqueta: "Lunas", valor: "Más de 25" },
      { etiqueta: "Temperatura media", valor: "−195 °C" },
    ],
  },
  {
    id: "neptuno", nombre: "Neptuno", textura: "neptuno", cuatroK: false, radioKm: 24764, masaKg: 1.02413e26,
    ua: 30.06992276, e: 0.00859048, L0: -55.12002969, Lsiglo: 218.45945325, perihelio: 44.96476227,
    ejeGrados: 28.32, giroHoras: 16.11, anioDias: 60182, color: "#6f8ff0",
    tipo: "Gigante de hielo · el más lejano",
    resumen: "El planeta con los vientos más rápidos. Se descubrió con matemáticas: la gravitación de Newton dijo dónde buscarlo antes de verlo con un telescopio.",
    historia: "Se descubrió con un telescopio en 1846, en el lugar del cielo donde los cálculos decían que debía estar. La Voyager 2 lo visitó en 1989.",
    datos: [
      { etiqueta: "Diámetro", valor: "49,528 km" },
      { etiqueta: "Un giro sobre su eje", valor: "16 h 6 min" },
      { etiqueta: "Lunas", valor: "Más de 10" },
      { etiqueta: "Temperatura media", valor: "−200 °C" },
    ],
  },
];

export const TIERRA = PLANETAS[2]!;
export const JUPITER = PLANETAS[4]!;
export function planetaPorId(id: string): Planeta | undefined {
  return PLANETAS.find((p) => p.id === id);
}

/**
 * Estado heliocéntrico del planeta en una fecha: longitud eclíptica (°),
 * distancia al Sol (UA) y anomalía media (rad). La anomalía verdadera sale de
 * la ecuación de Kepler.
 */
export function estadoPlaneta(p: Planeta, fecha: Date | number): { lon: number; r: number; M: number } {
  const T = diasJ2000(fecha) / 36525;
  const L = p.L0 + p.Lsiglo * T;
  const M = (L - p.perihelio) * GRAD;
  const k = puntoKepler(p.ua, p.e, M);
  return { lon: normal360(p.perihelio + k.nu / GRAD), r: k.r, M };
}

/** Periodo en años y T²/a³ con los datos reales (T en años, a en UA). */
export function keplerDe(p: Planeta): { T: number; T2a3: number } {
  const T = p.anioDias / ANIO_DIAS;
  return { T, T2a3: (T * T) / Math.pow(p.ua, 3) };
}

/* ── La Luna (del Explorador de NEM) ───────────────────────────────────── */
function longitudSol(n: number): number {
  const L = normal360(280.46 + 0.9856474 * n);
  const g = normal360(357.528 + 0.9856003 * n) * GRAD;
  return normal360(L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g));
}
/** Elongación de la Luna (° 0–360): 0 = nueva, 180 = llena. */
export function elongacionLuna(fecha: Date | number): number {
  const n = diasJ2000(fecha);
  const Lp = 218.316 + 13.176396 * n;
  const Mp = normal360(134.963 + 13.064993 * n) * GRAD;
  const lonLuna = normal360(Lp + 6.289 * Math.sin(Mp));
  return normal360(lonLuna - longitudSol(n));
}

/* ── Órbitas para las leyes 2.ª y vis-viva ─────────────────────────────── */
export interface OrbitaPreset {
  id: string;
  nombre: string;
  a: number; // UA
  e: number;
  textura: string | null; // null = cometa
  color: string;
  nota: string;
}

export const ORBITAS: OrbitaPreset[] = [
  { id: "tierra", nombre: "Tierra", a: TIERRA.ua, e: TIERRA.e, textura: "tierra-dia", color: "#60a5fa", nota: "Casi un círculo: e = 0.017." },
  { id: "mercurio", nombre: "Mercurio", a: PLANETAS[0]!.ua, e: PLANETAS[0]!.e, textura: "mercurio", color: "#c4bdb5", nota: "La más excéntrica de los ocho: e = 0.206." },
  { id: "marte", nombre: "Marte", a: PLANETAS[3]!.ua, e: PLANETAS[3]!.e, textura: "marte", color: "#e0714a", nota: "La órbita con la que Kepler descubrió las elipses: e = 0.093." },
  { id: "halley", nombre: "Cometa Halley", a: 17.834, e: 0.96714, textura: null, color: "#bfe0ff", nota: "Pasa dentro de la órbita de Venus y se aleja más allá de Neptuno: e = 0.967." },
  { id: "libre", nombre: "Órbita libre", a: 1, e: 0.6, textura: "neptuno", color: "#a78bfa", nota: "Tú eliges a y e." },
];

/* ── «Predice» de cada modo ─────────────────────────────────────────────── */
export interface PrediccionModo {
  escena: string;
  pregunta: string;
  opciones: { id: string; texto: string; icono: string }[];
  correcta: string;
  porque: string;
  comoComprobarlo: string;
}

export type ModoSS = "explorador" | "periodos" | "areas" | "rapidez";

export const PREDICCIONES_MODO: Record<ModoSS, PrediccionModo> = {
  explorador: {
    escena: "Júpiter está 5 veces más lejos del Sol que la Tierra, pero tiene 318 veces su masa.",
    pregunta: "¿A quién jala con más fuerza el Sol: a la Tierra o a Júpiter?",
    opciones: [
      { id: "a", texto: "A la Tierra: está mucho más cerca", icono: "fa-earth-americas" },
      { id: "b", texto: "A Júpiter, a pesar de la distancia", icono: "fa-weight-hanging" },
      { id: "c", texto: "A los dos con la misma fuerza", icono: "fa-equals" },
    ],
    correcta: "b",
    porque: "F = G·M·m/r². La masa de Júpiter es 318 veces la de la Tierra; su distancia, 5.2 veces mayor, divide la fuerza entre 5.2² ≈ 27. Resultado: unas 12 veces más fuerza que sobre la Tierra.",
    comoComprobarlo: "Elige la Tierra y luego Júpiter en «Controles» y compara la fuerza F en las lecturas.",
  },
  periodos: {
    escena: "El planeta X da vueltas al Sol en una órbita casi circular.",
    pregunta: "Si X está al doble de distancia del Sol que la Tierra, ¿cuánto tarda en dar una vuelta?",
    opciones: [
      { id: "a", texto: "2 años", icono: "fa-clock" },
      { id: "b", texto: "Casi 3 años", icono: "fa-hourglass-half" },
      { id: "c", texto: "4 años", icono: "fa-calendar" },
    ],
    correcta: "b",
    porque: "La 3.ª ley de Kepler dice que T² ∝ a³. Con a = 2 UA, T² = 2³ = 8 y T = √8 ≈ 2.83 años: la órbita es más larga y, además, el planeta va más despacio.",
    comoComprobarlo: "Pon el deslizador del planeta X en 2 UA, toca «Alinear y soltar» y cuenta las vueltas de la Tierra mientras X da una.",
  },
  areas: {
    escena: "Un planeta recorre una órbita alargada: a veces pasa cerca del Sol y a veces lejos.",
    pregunta: "La línea Sol–planeta barre un área en un mes. ¿Dónde barre más área?",
    opciones: [
      { id: "a", texto: "Cerca del Sol", icono: "fa-sun" },
      { id: "b", texto: "Lejos del Sol", icono: "fa-arrows-left-right" },
      { id: "c", texto: "En los dos lados igual", icono: "fa-equals" },
    ],
    correcta: "c",
    porque: "Es la 2.ª ley de Kepler. Cerca del Sol el planeta va rápido y el triángulo es largo y flaco; lejos va lento y el triángulo es corto y ancho. Las áreas en tiempos iguales son las mismas.",
    comoComprobarlo: "Sube la excentricidad a 0.6 o más, deja que el planeta pinte una vuelta y compara los números de cada sector.",
  },
  rapidez: {
    escena: "El cometa Halley pasa cerca del Sol y después se aleja hasta más allá de Neptuno.",
    pregunta: "¿Cuántas veces más rápido va el Halley en el perihelio que en el afelio?",
    opciones: [
      { id: "a", texto: "Casi igual de rápido", icono: "fa-equals" },
      { id: "b", texto: "Unas 2 veces", icono: "fa-gauge" },
      { id: "c", texto: "Unas 60 veces", icono: "fa-gauge-high" },
    ],
    correcta: "c",
    porque: "Con vis-viva, v² = GM(2/r − 1/a), la razón de rapideces es (1+e)/(1−e). Para el Halley, e = 0.967: 1.967/0.033 ≈ 60. Pasa a 54.6 km/s junto al Sol y a 0.9 km/s en el otro extremo.",
    comoComprobarlo: "Elige «Cometa Halley», toca «Ir al perihelio» y luego «Ir al afelio», y compara la rapidez v.",
  },
};

/* ── Reto del laboratorio (numérico) ───────────────────────────────────── */

export const RETO_SISTEMA_SOLAR: RetoNumericoData = {
  titulo: "Gravitación y leyes de Kepler con datos reales",
  contexto:
    "Usa los datos reales de la NASA. G = 6.674 × 10⁻¹¹ N·m²/kg², masa del Sol M = 1.989 × 10³⁰ kg. Para la 3.ª ley, con el Sol: T² = a³ (T en años, a en UA).",
  problema:
    "(a) Calcula la fuerza con que el Sol atrae a Marte (m = 6.42 × 10²³ kg) a su distancia media r = 2.28 × 10¹¹ m. Escribe el resultado en × 10²¹ N.\n\n" +
    "(b) Un asteroide del cinturón principal gira alrededor del Sol con semieje mayor a = 4 UA. ¿Cuántos años tarda en dar una vuelta?\n\n" +
    "(c) La órbita de Mercurio tiene excentricidad e = 0.206. Con vis-viva, la razón entre su rapidez en el perihelio y en el afelio es (1 + e)/(1 − e). Calcúlala.",
  campos: [
    { etiqueta: "a) Fuerza Sol–Marte (en × 10²¹ N)", objetivo: 1.64, tolerancia: 0.04, unidad: "× 10²¹ N", placeholder: "?" },
    { etiqueta: "b) Periodo del asteroide", objetivo: 8, tolerancia: 0.05, unidad: "años", placeholder: "?" },
    { etiqueta: "c) v perihelio / v afelio de Mercurio", objetivo: 1.52, tolerancia: 0.02, unidad: "veces", placeholder: "?" },
  ],
  pasosGuia: [
    "(a) F = G·M·m/r² = (6.674 × 10⁻¹¹)(1.989 × 10³⁰)(6.42 × 10²³) / (2.28 × 10¹¹)² = 8.52 × 10⁴³ / 5.20 × 10²² ≈ 1.64 × 10²¹ N.",
    "(b) T² = a³ = 4³ = 64, así que T = √64 = 8 años.",
    "(c) (1 + 0.206)/(1 − 0.206) = 1.206/0.794 ≈ 1.52: en el perihelio Mercurio va 1.52 veces más rápido (59.0 km/s contra 38.9 km/s).",
  ],
  respuestaFinal: "(a) F ≈ 1.64 × 10²¹ N · (b) T = 8 años · (c) ≈ 1.52 veces",
};

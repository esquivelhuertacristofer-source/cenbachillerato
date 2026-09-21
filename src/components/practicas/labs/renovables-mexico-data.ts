/**
 * Datos y modelo del laboratorio "Energías renovables y no renovables en
 * México" (CNEYT-II, progresión 11; códigos de actividad CNEYT-II-P07-A*).
 *
 * Anclas:
 *   - A1 infografía «Matriz energética de México: renovables, no renovables y
 *     la transición pendiente»: marco teórico verbatim (contexto, puntos clave,
 *     preguntas de reflexión, glosario y actividad posterior).
 *   - A2 quiz verdadero/falso «¿Verdadero o falso? Energía en México»: reto
 *     evaluable (6 reactivos con su retroalimentación verbatim).
 *   - A4 verdadero/falso: hechos. A5 glosario. A6 completa el texto.
 *   - A11 clasificar «Energías renovables y no renovables en México» y A10
 *     reto contrarreloj (15 s por reactivo): inspiran la tarjeta de estrellas,
 *     que usa los nueve elementos de A11 verbatim.
 *
 * Modelo (no verbatim):
 *   - Centrales del mapa: nombres, ubicación y tecnología reales; capacidades
 *     redondeadas y factores de planta TÍPICOS (aproximados), marcados así.
 *   - Red de un día: región ILUSTRATIVA; perfiles de demanda, sol y viento
 *     ilustrativos con la estacionalidad real (el viento del Istmo sopla más
 *     en invierno; el sol, más horas y más alto en verano).
 *   - Emisiones de ciclo de vida: medianas del IPCC (AR5, 2014, anexo III),
 *     salvo el combustóleo (estimación, no IPCC).
 *   - Producción de petróleo: 2004 y 2023 son los datos de A1; los años
 *     intermedios son aproximados (Pemex, crudo y condensados).
 *
 * Datos puros (sin three ni React).
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { TextoHuecosData } from "./_mecanica-huecos";

/* ── Modos ────────────────────────────────────────────────────────────── */

export type Modo = "mapa" | "red" | "mezcla";
export const MODOS: Modo[] = ["mapa", "red", "mezcla"];

export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string }> = {
  mapa: { etq: "Mapa de centrales", subtitulo: "Capacidad instalada no es generación", icono: "fa-map-location-dot", color: "#38bdf8" },
  red: { etq: "Un día en la red", subtitulo: "Sol, viento y demanda hora por hora", icono: "fa-tower-broadcast", color: "#facc15" },
  mezcla: { etq: "Emisiones y agotamiento", subtitulo: "La mezcla del país y lo que se acaba", icono: "fa-smog", color: "#fb7185" },
};

export function num(x: number, dec = 0): string {
  const s = Math.abs(x).toFixed(dec);
  const [ent, frac] = s.split(".");
  const conMiles = ent!.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${x < 0 ? "−" : ""}${conMiles}${frac ? `.${frac}` : ""}`;
}

export function mulberry32(semilla: number) {
  let t = semilla >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/* ════════════════════════════════════════════════════════════════════════
 * Tecnologías
 * ════════════════════════════════════════════════════════════════════════ */

export type TecId = "gas" | "combustoleo" | "carbon" | "nuclear" | "hidro" | "eolica" | "solar" | "geotermia" | "bio";

export interface Tecnologia {
  id: TecId;
  etq: string;
  renovable: boolean;
  /** Energía limpia en la ley mexicana (renovables + nuclear). */
  limpia: boolean;
  /** Emisiones de ciclo de vida, g CO₂e por kWh. */
  gCO2: number;
  color: string;
  icono: string;
}

export const TECNOLOGIAS: Tecnologia[] = [
  { id: "gas", etq: "Gas natural", renovable: false, limpia: false, gCO2: 490, color: "#fb923c", icono: "fa-fire-flame-simple" },
  { id: "combustoleo", etq: "Combustóleo y diésel", renovable: false, limpia: false, gCO2: 800, color: "#c2410c", icono: "fa-oil-can" },
  { id: "carbon", etq: "Carbón", renovable: false, limpia: false, gCO2: 820, color: "#94a3b8", icono: "fa-cubes-stacked" },
  { id: "nuclear", etq: "Nuclear", renovable: false, limpia: true, gCO2: 12, color: "#a78bfa", icono: "fa-atom" },
  { id: "hidro", etq: "Hidroeléctrica", renovable: true, limpia: true, gCO2: 24, color: "#38bdf8", icono: "fa-water" },
  { id: "eolica", etq: "Eólica", renovable: true, limpia: true, gCO2: 11, color: "#5eead4", icono: "fa-wind" },
  { id: "solar", etq: "Solar", renovable: true, limpia: true, gCO2: 48, color: "#facc15", icono: "fa-solar-panel" },
  { id: "geotermia", etq: "Geotérmica", renovable: true, limpia: true, gCO2: 38, color: "#f472b6", icono: "fa-volcano" },
  { id: "bio", etq: "Bioenergía (bagazo)", renovable: true, limpia: true, gCO2: 230, color: "#84cc16", icono: "fa-seedling" },
];

export const TEC: Record<TecId, Tecnologia> = Object.fromEntries(TECNOLOGIAS.map((t) => [t.id, t])) as Record<TecId, Tecnologia>;
export const FOSILES: TecId[] = ["gas", "combustoleo", "carbon"];

/* ════════════════════════════════════════════════════════════════════════
 * 1. MAPA DE CENTRALES
 * ════════════════════════════════════════════════════════════════════════ */

export interface Central {
  id: string;
  nombre: string;
  lugar: string;
  tec: TecId;
  lon: number;
  lat: number;
  /** Capacidad instalada, MW (redondeada). */
  mw: number;
  /** Factor de planta típico (fracción del año a plena potencia), aproximado. */
  fp: number;
  nota: string;
  /** true si la cifra de capacidad es aproximada o el caso es ilustrativo. */
  aprox: boolean;
}

export const CENTRALES: Central[] = [
  { id: "cerro-prieto", nombre: "Cerro Prieto", lugar: "Mexicali, Baja California", tec: "geotermia", lon: -115.24, lat: 32.4, mw: 570, fp: 0.6, aprox: true, nota: "La mayor central geotérmica de México. El vapor sale de pozos junto a una falla activa; hoy opera por debajo de su capacidad porque el yacimiento ha perdido presión." },
  { id: "los-azufres", nombre: "Los Azufres", lugar: "Michoacán", tec: "geotermia", lon: -100.67, lat: 19.79, mw: 270, fp: 0.8, aprox: true, nota: "Segundo campo geotérmico del país, en el Eje Neovolcánico. Como toda geotermia, genera día y noche sin depender del clima." },
  { id: "los-humeros", nombre: "Los Humeros", lugar: "Puebla", tec: "geotermia", lon: -97.45, lat: 19.68, mw: 95, fp: 0.8, aprox: true, nota: "Campo geotérmico en una caldera volcánica. Pequeño en capacidad, pero con factor de planta alto." },
  { id: "istmo", nombre: "Corredor eólico del Istmo", lugar: "La Ventosa, Oaxaca", tec: "eolica", lon: -94.95, lat: 16.55, mw: 2700, fp: 0.4, aprox: true, nota: "Decenas de parques (La Venta, La Ventosa, Juchitán) suman unos 2 700 MW. El viento del Istmo es de los más intensos del mundo y sopla más fuerte de octubre a febrero." },
  { id: "villanueva", nombre: "Parque solar Villanueva", lugar: "Viesca, Coahuila", tec: "solar", lon: -103.0, lat: 25.4, mw: 828, fp: 0.3, aprox: false, nota: "828 MW pico de paneles fotovoltaicos. Al abrir en 2018 fue de los mayores de América. Solo genera de día, más en verano." },
  { id: "chicoasen", nombre: "Chicoasén (Manuel Moreno Torres)", lugar: "Río Grijalva, Chiapas", tec: "hidro", lon: -93.1, lat: 16.94, mw: 2400, fp: 0.3, aprox: false, nota: "La hidroeléctrica de mayor capacidad del país, en el sistema de presas del Grijalva. Su generación depende de la lluvia: en años de sequía produce mucho menos." },
  { id: "infiernillo", nombre: "Infiernillo", lugar: "Río Balsas, Michoacán–Guerrero", tec: "hidro", lon: -101.9, lat: 18.27, mw: 1200, fp: 0.25, aprox: true, nota: "Gran presa del río Balsas. Además de energía, las presas regulan avenidas, pero inundan valles y alteran el río." },
  { id: "laguna-verde", nombre: "Laguna Verde", lugar: "Alto Lucero, Veracruz", tec: "nuclear", lon: -96.41, lat: 19.72, mw: 1608, fp: 0.88, aprox: false, nota: "Única nucleoeléctrica de México, dos reactores enfriados con agua del Golfo. Casi no emite CO₂, pero el uranio es finito: limpia no es lo mismo que renovable." },
  { id: "tuxpan", nombre: "Termoeléctrica Tuxpan", lugar: "Tuxpan, Veracruz", tec: "combustoleo", lon: -97.33, lat: 21.0, mw: 2100, fp: 0.3, aprox: true, nota: "Central de vapor de la CFE que quema combustóleo, un derivado del petróleo. Es de las más contaminantes por kWh." },
  { id: "carbon-ii", nombre: "Carboeléctrica Carbón II", lugar: "Nava, Coahuila", tec: "carbon", lon: -100.77, lat: 28.42, mw: 1400, fp: 0.4, aprox: true, nota: "Quema carbón de Coahuila, el estado donde está casi todo el carbón mexicano (como la cuenca de Sabinas): el combustible que más CO₂ emite por unidad de energía." },
  { id: "tamazunchale", nombre: "Ciclo combinado Tamazunchale", lugar: "San Luis Potosí", tec: "gas", lon: -98.8, lat: 21.26, mw: 1100, fp: 0.65, aprox: true, nota: "Quema gas natural en turbinas y aprovecha el calor de escape para mover una turbina de vapor. El gas es el mayor pilar de la electricidad en México." },
  { id: "ingenio", nombre: "Ingenio azucarero con cogeneración", lugar: "Cuenca del Papaloapan, Veracruz", tec: "bio", lon: -96.1, lat: 18.35, mw: 40, fp: 0.35, aprox: true, nota: "Caso ilustrativo: los ingenios queman el bagazo de caña en sus calderas durante la zafra. La caña se vuelve a sembrar cada ciclo." },
];

export const HORAS_ANIO = 8760;

/** Generación anual en GWh. */
export function generacionGWh(mw: number, fp: number): number {
  return (mw * fp * HORAS_ANIO) / 1000;
}

/** Emisiones de ciclo de vida anuales en toneladas de CO₂e (GWh × g/kWh = t). */
export function emisionesT(gwh: number, gCO2: number): number {
  return gwh * gCO2;
}

/** Predicción: ¿cuál genera más electricidad al año? */
export const PAR_PREDICCION: [string, string] = ["chicoasen", "laguna-verde"];

/** Reto de equivalencia: igualar con paneles la energía anual de Laguna Verde. */
export const FP_SOLAR_TIPICO = 0.25;
export const SOLAR_MAX_MW = 8000;
export const TOLERANCIA_EQUIV = 0.05;

export function mwSolarEquivalente(mw: number, fp: number): number {
  return (mw * fp) / FP_SOLAR_TIPICO;
}

/* ── Contorno simplificado de México (lon, lat) ────────────────────────── */

export const CONTORNO_MEXICO: [number, number][] = [
  // Frontera norte, de Tijuana al Golfo
  [-117.12, 32.53], [-114.72, 32.72], [-114.81, 32.49], [-111.07, 31.33], [-108.21, 31.33], [-108.21, 31.78], [-106.53, 31.78],
  [-106.0, 31.39], [-104.9, 30.6], [-104.5, 29.6], [-103.3, 28.98], [-102.7, 29.75], [-101.4, 29.77], [-100.9, 29.3], [-100.3, 28.3],
  [-99.5, 27.5], [-99.1, 26.4], [-98.2, 26.05], [-97.15, 25.95],
  // Golfo de México
  [-97.4, 25.0], [-97.7, 24.0], [-97.75, 22.5], [-97.3, 21.5], [-97.35, 20.9], [-96.4, 19.6], [-96.1, 19.15], [-95.2, 18.7], [-94.5, 18.15],
  [-93.4, 18.45], [-92.0, 18.65], [-91.3, 18.6], [-90.7, 19.3], [-90.5, 19.85], [-90.4, 20.8], [-90.1, 21.2], [-88.7, 21.5], [-87.05, 21.6],
  // Caribe
  [-86.8, 21.1], [-87.4, 20.2], [-87.7, 19.4], [-87.85, 18.5], [-88.3, 18.5],
  // Belice y Guatemala
  [-88.8, 17.95], [-89.15, 17.95], [-89.15, 17.82], [-90.98, 17.82], [-90.98, 17.25], [-91.43, 17.25], [-90.44, 16.07], [-91.73, 16.07], [-92.2, 15.25], [-92.23, 14.53],
  // Pacífico, hacia el noroeste
  [-93.2, 15.4], [-94.1, 16.1], [-95.2, 16.17], [-96.5, 15.65], [-97.8, 16.0], [-98.6, 16.5], [-99.9, 16.85], [-101.0, 17.25], [-102.2, 17.95],
  [-103.5, 18.3], [-104.3, 19.1], [-105.3, 19.9], [-105.25, 20.6], [-105.4, 21.4], [-105.8, 22.5], [-106.42, 23.2], [-107.4, 24.3],
  [-108.2, 25.2], [-109.05, 25.6], [-109.6, 26.6], [-110.3, 27.3], [-110.9, 27.92], [-111.95, 28.82], [-112.68, 29.9], [-113.1, 30.8],
  [-113.54, 31.3], [-114.5, 31.7], [-114.8, 31.85],
  // Península de Baja California: costa del Golfo hacia el sur
  [-114.84, 31.02], [-114.5, 30.2], [-113.55, 28.95], [-112.9, 28.2], [-112.27, 27.34], [-111.98, 26.9], [-111.34, 26.0], [-110.7, 24.9],
  [-110.3, 24.15], [-109.8, 24.0], [-109.45, 23.4], [-109.91, 22.88],
  // Costa del Pacífico hacia el norte
  [-110.3, 23.5], [-111.1, 24.1], [-112.1, 24.8], [-112.2, 25.9], [-113.2, 26.7], [-114.1, 27.2], [-115.08, 27.85], [-114.1, 28.1],
  [-114.3, 28.8], [-115.1, 29.7], [-115.95, 30.5], [-116.6, 31.85],
];

export const MAPA_ESCALA = 0.32;
export const MAPA_LON0 = -101.5;
export const MAPA_LAT0 = 23.6;

/** Proyección simple del mapa: x hacia el este, z hacia el sur. */
export function proyecta(lon: number, lat: number): [number, number] {
  return [(lon - MAPA_LON0) * Math.cos((MAPA_LAT0 * Math.PI) / 180) * MAPA_ESCALA, -(lat - MAPA_LAT0) * MAPA_ESCALA];
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. UN DÍA EN LA RED (región ilustrativa)
 * ════════════════════════════════════════════════════════════════════════ */

export type Estacion = "verano" | "invierno";

export const ESTACIONES: { id: Estacion; etq: string; icono: string; explica: string }[] = [
  { id: "verano", etq: "Verano", icono: "fa-sun", explica: "Días largos y sol alto; el aire acondicionado dispara la demanda por la tarde; en el Istmo el viento amaina." },
  { id: "invierno", etq: "Invierno", icono: "fa-snowflake", explica: "Días cortos y sol bajo; la demanda sube al anochecer; el viento del Istmo (los «nortes») sopla fuerte día y noche." },
];

/** Geotermia de base, disponible las 24 horas (A1). */
export const GEO_MW = 100;
export const PASOS_DIA = 96;
export const DT_H = 24 / PASOS_DIA;
export const EFICIENCIA_BATERIA = 0.85;
/** Horas de descarga a plena potencia: la potencia es la energía entre 4. */
export const HORAS_BATERIA = 4;
export const LIMITES_RED = { solar: 3000, eolica: 2000, bateria: 6000, gas: 1200 };

export interface ParamsRed {
  estacion: Estacion;
  nublado: boolean;
  solarMW: number;
  eolicaMW: number;
  bateriaMWh: number;
  gasMW: number;
}

export const RED_INICIAL: Omit<ParamsRed, "estacion" | "nublado"> = { solarMW: 600, eolicaMW: 400, bateriaMWh: 0, gasMW: 1000 };

/** Demanda de la región (MW) a la hora h. */
export function demandaMW(h: number, e: Estacion): number {
  if (e === "verano") return 925 + 210 * Math.cos((2 * Math.PI * (h - 16.5)) / 24) + 25 * Math.cos((4 * Math.PI * (h - 16.5)) / 24);
  return 760 + 140 * Math.cos((2 * Math.PI * (h - 19.5)) / 24) + 50 * Math.cos((4 * Math.PI * (h - 19.5)) / 24);
}

export const SOL: Record<Estacion, { sale: number; pone: number; pico: number }> = {
  verano: { sale: 6.5, pone: 20.0, pico: 0.8 },
  invierno: { sale: 7.3, pone: 18.2, pico: 0.65 },
};

/** Fracción de la capacidad solar que se genera a la hora h. */
export function factorSolar(h: number, e: Estacion, nublado: boolean): number {
  const s = SOL[e];
  if (h <= s.sale || h >= s.pone) return 0;
  const f = s.pico * Math.sin((Math.PI * (h - s.sale)) / (s.pone - s.sale));
  return nublado ? f * 0.35 : f;
}

/** Elevación normalizada del Sol (−1 a 1) para dibujar el cielo. */
export function alturaSol(h: number, e: Estacion): number {
  const s = SOL[e];
  const medio = (s.sale + s.pone) / 2;
  const semi = (s.pone - s.sale) / 2;
  return Math.cos((Math.PI * (h - medio)) / (2 * semi));
}

/** Fracción de la capacidad eólica que se genera a la hora h (perfil del Istmo, ilustrativo). */
export function factorEolico(h: number, e: Estacion): number {
  if (e === "verano") return 0.22 + 0.12 * Math.sin((2 * Math.PI * (h - 10)) / 24);
  return 0.55 + 0.1 * Math.sin((2 * Math.PI * (h - 8)) / 24);
}

export interface PasoRed {
  h: number;
  demanda: number;
  geo: number;
  solar: number;
  eolica: number;
  /** Descarga de la batería hacia la demanda. */
  descarga: number;
  /** Carga de la batería con excedente renovable. */
  carga: number;
  gas: number;
  deficit: number;
  vertido: number;
  /** Estado de carga, fracción 0–1. */
  soc: number;
}

export interface ResultadoRed {
  pasos: PasoRed[];
  demandaMWh: number;
  renovableMWh: number;
  gasMWh: number;
  deficitMWh: number;
  vertidoMWh: number;
  descargaMWh: number;
  horasDeficit: number;
  pctRenovable: number;
  co2t: number;
  /** Primera hora con déficit, o null. */
  primerDeficit: number | null;
  /** Hubo déficit con el Sol ya puesto. */
  deficitNocturno: boolean;
}

/**
 * Despacho de 15 en 15 minutos: primero geotermia, sol y viento; el excedente
 * carga la batería (y lo que no cabe se vierte); si falta, descarga la
 * batería, luego entra el gas; lo que aún falte es déficit. Se simulan dos
 * días seguidos y se reporta el segundo, para que la batería no empiece
 * «regalada» con carga.
 */
export function simulaRed(p: ParamsRed): ResultadoRed {
  const eta = Math.sqrt(EFICIENCIA_BATERIA);
  const potBat = p.bateriaMWh / HORAS_BATERIA;
  let soc = 0;
  const pasos: PasoRed[] = [];
  for (let dia = 0; dia < 2; dia++) {
    for (let k = 0; k < PASOS_DIA; k++) {
      const h = (k + 0.5) * DT_H;
      const demanda = demandaMW(h, p.estacion);
      const geo = GEO_MW;
      const solar = p.solarMW * factorSolar(h, p.estacion, p.nublado);
      const eolica = p.eolicaMW * factorEolico(h, p.estacion);
      const ren = geo + solar + eolica;
      let descarga = 0;
      let carga = 0;
      let gas = 0;
      let deficit = 0;
      let vertido = 0;
      if (ren >= demanda) {
        const sobra = ren - demanda;
        carga = p.bateriaMWh > 0 ? Math.min(sobra, potBat, (p.bateriaMWh - soc) / (eta * DT_H)) : 0;
        soc += carga * eta * DT_H;
        vertido = sobra - carga;
      } else {
        let falta = demanda - ren;
        descarga = p.bateriaMWh > 0 ? Math.min(falta, potBat, (soc * eta) / DT_H) : 0;
        soc -= (descarga / eta) * DT_H;
        falta -= descarga;
        gas = Math.min(falta, p.gasMW);
        deficit = falta - gas;
      }
      soc = Math.max(0, soc);
      if (dia === 1) pasos.push({ h, demanda, geo, solar, eolica, descarga, carga, gas, deficit, vertido, soc: p.bateriaMWh > 0 ? soc / p.bateriaMWh : 0 });
    }
  }
  let demandaMWh = 0;
  let renovableMWh = 0;
  let gasMWh = 0;
  let deficitMWh = 0;
  let vertidoMWh = 0;
  let descargaMWh = 0;
  let horasDeficit = 0;
  let primerDeficit: number | null = null;
  let deficitNocturno = false;
  const s = SOL[p.estacion];
  for (const x of pasos) {
    demandaMWh += x.demanda * DT_H;
    const renDirecta = Math.min(x.demanda, x.geo + x.solar + x.eolica);
    renovableMWh += (renDirecta + x.descarga) * DT_H;
    gasMWh += x.gas * DT_H;
    deficitMWh += x.deficit * DT_H;
    vertidoMWh += x.vertido * DT_H;
    descargaMWh += x.descarga * DT_H;
    if (x.deficit > 0.5) {
      horasDeficit += DT_H;
      if (primerDeficit === null) primerDeficit = x.h;
      if (x.h >= s.pone || x.h <= s.sale) deficitNocturno = true;
    }
  }
  const servida = demandaMWh - deficitMWh;
  return {
    pasos,
    demandaMWh,
    renovableMWh,
    gasMWh,
    deficitMWh,
    vertidoMWh,
    descargaMWh,
    horasDeficit,
    pctRenovable: servida > 0 ? (100 * renovableMWh) / servida : 0,
    co2t: (gasMWh * TEC.gas.gCO2) / 1000,
    primerDeficit,
    deficitNocturno,
  };
}

/** Paso de la simulación que corresponde a la hora h. */
export function pasoEn(r: ResultadoRed, h: number): PasoRed {
  const k = Math.min(PASOS_DIA - 1, Math.max(0, Math.floor(h / DT_H)));
  return r.pasos[k]!;
}

export function horaTexto(h: number): string {
  const hh = Math.floor(h) % 24;
  const mm = Math.floor((h - Math.floor(h)) * 60);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. EMISIONES Y AGOTAMIENTO
 * ════════════════════════════════════════════════════════════════════════ */

/** Generación eléctrica anual de México, aproximada. */
export const TWH_MEXICO = 350;
export const META_LIMPIA = 35;

export type Mezcla = Record<TecId, number>;

export type PresetId = "mexico" | "meta" | "alemania" | "costarica";

export const PRESETS: { id: PresetId; etq: string; explica: string; mezcla: Mezcla }[] = [
  {
    id: "mexico",
    etq: "México hoy (A1)",
    explica: "Composición de la infografía A1: ~75 % fósil, ~10 % hidro, ~7 % eólica, ~4 % solar, ~1.5 % geotérmica y el resto nuclear y otras. El reparto entre gas, combustóleo y carbón es aproximado.",
    mezcla: { gas: 60, combustoleo: 9, carbon: 6, nuclear: 2, hidro: 10, eolica: 7, solar: 4, geotermia: 1.5, bio: 0.5 },
  },
  {
    id: "meta",
    etq: "Meta 35 % limpia",
    explica: "Una mezcla ilustrativa que cumple la meta de la Ley de Transición Energética para 2024 (A1), que aún no se alcanza.",
    mezcla: { gas: 55, combustoleo: 5, carbon: 5, nuclear: 3, hidro: 10, eolica: 11, solar: 9, geotermia: 1.5, bio: 0.5 },
  },
  {
    id: "alemania",
    etq: "55 % renovable",
    explica: "El nivel de renovables de Alemania que cita A1 (~55 %), aplicado a una mezcla hipotética de México con mucho más sol y viento.",
    mezcla: { gas: 35, combustoleo: 2, carbon: 5, nuclear: 3, hidro: 10, eolica: 22, solar: 20, geotermia: 2, bio: 1 },
  },
  {
    id: "costarica",
    etq: "99 % renovable",
    explica: "El nivel de Costa Rica (~99 %, A1). Costa Rica lo logra sobre todo con hidro y geotermia; esta mezcla para México es hipotética.",
    mezcla: { gas: 1, combustoleo: 0, carbon: 0, nuclear: 0, hidro: 22, eolica: 34, solar: 33, geotermia: 8, bio: 2 },
  },
];

export type OrdenRetiro = "sucios" | "gas";
export const ORDENES: Record<OrdenRetiro, { etq: string; orden: TecId[] }> = {
  sucios: { etq: "Carbón y combustóleo primero", orden: ["carbon", "combustoleo", "gas"] },
  gas: { etq: "Gas primero", orden: ["gas", "combustoleo", "carbon"] },
};

/**
 * Aplica las barras de solar y eólica sobre una mezcla base: lo que se agrega
 * se le quita a los fósiles en el orden elegido; lo que se quita vuelve al gas.
 */
export function mezclaAjustada(base: Mezcla, solar: number, eolica: number, orden: OrdenRetiro): { mezcla: Mezcla; recortado: boolean } {
  const m: Mezcla = { ...base };
  let delta = solar - base.solar + (eolica - base.eolica);
  const fosil = FOSILES.reduce((a, t) => a + base[t], 0);
  let s = solar;
  let e = eolica;
  let recortado = false;
  if (delta > fosil) {
    const extraS = solar - base.solar;
    const extraE = eolica - base.eolica;
    const f = fosil / delta;
    s = base.solar + extraS * f;
    e = base.eolica + extraE * f;
    delta = fosil;
    recortado = true;
  }
  m.solar = s;
  m.eolica = e;
  if (delta >= 0) {
    let resta = delta;
    for (const t of ORDENES[orden].orden) {
      const q = Math.min(resta, m[t]);
      m[t] -= q;
      resta -= q;
    }
  } else m.gas += -delta;
  return { mezcla: m, recortado };
}

export function pctRenovable(m: Mezcla): number {
  return TECNOLOGIAS.reduce((a, t) => a + (t.renovable ? m[t.id] : 0), 0);
}
export function pctLimpia(m: Mezcla): number {
  return TECNOLOGIAS.reduce((a, t) => a + (t.limpia ? m[t.id] : 0), 0);
}
/** Emisiones anuales de ciclo de vida en Mt CO₂e (TWh × g/kWh = kt). */
export function emisionesMt(m: Mezcla): number {
  return TECNOLOGIAS.reduce((a, t) => a + ((m[t.id] / 100) * TWH_MEXICO * t.gCO2) / 1000, 0);
}
export function twh(m: Mezcla, t: TecId): number {
  return (m[t] / 100) * TWH_MEXICO;
}

/** Producción de petróleo crudo (con condensados), millones de barriles diarios. 2004 y 2023: A1; el resto, aproximado. */
export const PRODUCCION: { anio: number; mbd: number; nota: string }[] = [
  { anio: 2004, mbd: 3.4, nota: "Pico histórico (A1). Cantarell, en la Sonda de Campeche, daba por sí solo más de 2 millones de barriles diarios." },
  { anio: 2008, mbd: 2.8, nota: "Cantarell entra en declive acelerado: la presión del yacimiento cae y cada pozo rinde menos." },
  { anio: 2013, mbd: 2.5, nota: "Nuevos campos (Ku-Maloob-Zaap) compensan en parte, pero no detienen la caída." },
  { anio: 2018, mbd: 1.8, nota: "La producción ya es poco más de la mitad del pico de 2004." },
  { anio: 2023, mbd: 1.8, nota: "1.8 millones de barriles diarios (A1). Mantener la producción exige perforar campos cada vez más difíciles y caros." },
];

/* ════════════════════════════════════════════════════════════════════════
 * Estrellas: ¿renovable o no renovable? (A11 verbatim, contrarreloj como A10)
 * ════════════════════════════════════════════════════════════════════════ */

export const SEGUNDOS_POR_REACTIVO = 15;

export const ELEMENTOS_A11: { texto: string; renovable: boolean; explicacion: string }[] = [
  { texto: "Campo geotérmico de Cerro Prieto, Baja California", renovable: true, explicacion: "El calor interno de la Tierra se repone continuamente. Es la mayor planta geotérmica de México." },
  { texto: "Parque eólico de La Ventosa, Oaxaca", renovable: true, explicacion: "El viento del Istmo de Tehuantepec no se agota por usarlo." },
  { texto: "Central hidroeléctrica Chicoasén, Chiapas", renovable: true, explicacion: "El ciclo del agua la repone. Renovable no significa sin impacto: una presa transforma el ecosistema del río." },
  { texto: "Planta fotovoltaica de Villanueva, Coahuila", renovable: true, explicacion: "La radiación solar llega todos los días independientemente de cuánta se aproveche." },
  { texto: "Bagazo de caña quemado en un ingenio azucarero", renovable: true, explicacion: "Biomasa: la caña se vuelve a sembrar cada ciclo agrícola." },
  { texto: "Gas natural de la cuenca de Burgos", renovable: false, explicacion: "Hidrocarburo fósil. Es el que menos CO₂ emite por unidad de energía, y sigue siendo finito." },
  { texto: "Combustóleo en una termoeléctrica de la CFE", renovable: false, explicacion: "Derivado del petróleo: se formó en millones de años y no se repone." },
  { texto: "Carbón de la cuenca de Sabinas, Coahuila", renovable: false, explicacion: "Fósil, finito y el de mayor emisión por unidad de energía." },
  { texto: "Uranio de la central nucleoeléctrica de Laguna Verde", renovable: false, explicacion: "Genera electricidad casi sin emitir CO₂, pero el uranio es un mineral finito. Limpio y renovable no son sinónimos." },
];

export const CRITERIO_A11 = "El criterio no es si contamina, es si se repone en una escala de tiempo humana. Hay fuentes limpias que no son renovables y renovables que sí tienen impacto ambiental.";

export function rondaElementos(rnd: () => number, n = 6): number[] {
  const si = ELEMENTOS_A11.map((e, i) => ({ e, i })).filter((x) => x.e.renovable).map((x) => x.i);
  const no = ELEMENTOS_A11.map((e, i) => ({ e, i })).filter((x) => !x.e.renovable).map((x) => x.i);
  const baraja = (xs: number[]) => {
    const a = [...xs];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j]!, a[i]!];
    }
    return a;
  };
  const mitad = Math.floor(n / 2);
  return baraja([...baraja(si).slice(0, n - mitad), ...baraja(no).slice(0, mitad)]);
}

export function estrellasPorErrores(errores: number): number {
  return errores === 0 ? 3 : errores <= 2 ? 2 : 1;
}

/* ════════════════════════════════════════════════════════════════════════
 * Contenido VERBATIM
 * ════════════════════════════════════════════════════════════════════════ */

export const TITULO_A1 = "Matriz energética de México: renovables, no renovables y la transición pendiente";

/** Contexto mexicano de la infografía A1 — verbatim (2 párrafos). */
export const CONTEXTO_A1: string[] = [
  "México tiene uno de los mayores potenciales de energía renovable del mundo: el norte es de los lugares con más radiación solar del planeta, el Istmo de Tehuantepec tiene vientos de clase 7 (los más intensos clasificados), y su posición geotectónica le da un enorme recurso geotérmico. Sin embargo, la transición energética es lenta y políticamente compleja: Pemex y CFE son empresas estratégicas del Estado con millones de trabajadores y décadas de inversión acumulada.",
  "El INECC proyecta que, sin una aceleración en la transición energética, México no cumplirá sus compromisos del Acuerdo de París para 2030. Al mismo tiempo, la llegada de inversión industrial por nearshoring —que requiere garantías de suministro eléctrico limpio para cumplir estándares ESG de sus clientes norteamericanos— presiona al gobierno a expandir la capacidad de generación renovable, especialmente en los estados del norte.",
];

/** Puntos clave de la infografía A1 — verbatim. */
export const PUNTOS_A1: string[] = [
  "Composición actual de la generación eléctrica en México: ~75% combustibles fósiles (gas natural, petróleo, carbón), ~10% hidroeléctrica, ~7% eólica, ~4% solar, ~1.5% geotérmica, resto nuclear y otras (SENER 2024).",
  "Petróleo: México produjo 1.8 millones de barriles diarios en 2023 (Pemex). Los principales campos están en el Golfo (Campeche, Tabasco, Veracruz). La producción ha caído desde el pico histórico de 3.4 mbd en 2004.",
  "Hidroeléctrica: segunda fuente de generación renovable. Las presas de Chiapas (Angostura, Malpaso) y Guerrero generan la mayor parte. Riesgo creciente por sequías intensificadas por el cambio climático.",
  "Eólica: México tiene el mayor corredor eólico de América Latina en el Istmo de Tehuantepec (La Ventosa, La Venta). Oaxaca concentra el 70% de la capacidad instalada eólica del país.",
  "Solar: México recibe entre 4.4 y 6.3 kWh/m²/día de radiación solar. Sonora, Chihuahua y Baja California tienen el mayor potencial solar del planeta. La capacidad instalada solar creció 300% entre 2018 y 2023.",
  "Geotermia: México es el quinto productor mundial de energía geotérmica. Los campos Los Humeros (Puebla) y Cerro Prieto (Baja California) son los principales. Recurso disponible las 24 horas, sin variabilidad climática.",
  "Compromiso del Acuerdo de París: en su Contribución Determinada a Nivel Nacional, México se comprometió a reducir sus emisiones de gases de efecto invernadero un 22% (hasta 36% con apoyo internacional) para 2030. Por separado, la Ley de Transición Energética fijó la meta de 35% de generación eléctrica limpia para 2024 (aún no alcanzada).",
  "Debate soberanía energética vs. transición: la política energética de México privilegia el fortalecimiento de Pemex y CFE como empresas del Estado. El debate entre soberanía energética y transición acelerada a renovables define el futuro del sector.",
  "Nearshoring y demanda energética: la llegada de nuevas plantas industriales por nearshoring aumenta la demanda de electricidad en el norte de México, presionando la capacidad de generación y la necesidad de nuevas plantas.",
];

/** Preguntas de reflexión de A1 — verbatim. */
export const PREGUNTAS_A1: string[] = [
  "¿Por qué México, teniendo uno de los mayores potenciales solares y eólicos del mundo, aún genera el 75% de su electricidad con combustibles fósiles? ¿Qué factores explican esta paradoja?",
  "¿Cómo se relaciona la llegada de empresas industriales por nearshoring con la urgencia de expandir la generación de energía renovable en el norte de México?",
  "¿Crees que México debería priorizar la soberanía energética (control estatal de Pemex y CFE) o la transición acelerada a renovables con inversión privada? ¿Qué implicaciones tiene cada opción para los trabajadores del sector energético?",
];

export const ACTIVIDAD_POST_A1 =
  "Compara el porcentaje de generación eléctrica renovable de México (~25%) con el de Alemania (~55%) o Costa Rica (~99%). ¿Qué factores geográficos, políticos y económicos explican estas diferencias? ¿Qué ventajas tiene México que aún no aprovecha al máximo?";

/** Glosario de la infografía A1 — verbatim. */
export const GLOSARIO_A1: { termino: string; definicion: string }[] = [
  { termino: "Matriz energética", definicion: "Distribución porcentual de las distintas fuentes de energía que un país usa para generar electricidad y calefacción. Refleja decisiones políticas, geográficas y económicas." },
  { termino: "Energía geotérmica", definicion: "Energía producida aprovechando el calor interno de la Tierra. Se extrae perforando pozos en zonas volcánicamente activas y usando el vapor para mover turbinas. México es el 5° productor mundial." },
  { termino: "Capacidad instalada", definicion: "Potencia máxima de generación eléctrica que puede producir una planta o un país en condiciones óptimas. Se mide en megawatts (MW) o gigawatts (GW). Diferente de la generación real, que depende de condiciones climáticas." },
  { termino: "Soberanía energética", definicion: "Principio político que defiende el control estatal sobre los recursos y la producción de energía de un país, priorizando la autonomía frente a empresas extranjeras o mercados internacionales." },
  { termino: "ESG (Environmental, Social, Governance)", definicion: "Estándares internacionales que evalúan a las empresas según su desempeño ambiental, social y de gobernanza. Empresas con presencia en México exigen energía renovable (ESG ambiental) para cumplir compromisos con sus clientes globales." },
];

/** Hechos: quiz A4 (verdadero/falso), con su retroalimentación — verbatim. */
export const HECHOS: string[] = [
  "Verdadero: «La energía solar, eólica, hidráulica y geotérmica son fuentes renovables». Correcto: se reponen de forma natural y son más limpias.",
  "Verdadero: «El petróleo, el carbón y el gas natural son combustibles fósiles no renovables». Correcto: se agotan y contaminan más.",
  "Falso: «México no cuenta con ningún potencial para las energías renovables». Falso: México tiene gran potencial solar, eólico, hidráulico y geotérmico.",
  "Verdadero: «Las energías renovables ayudan a reducir la contaminación frente a los combustibles fósiles». Correcto: emiten menos gases contaminantes.",
];

/** Glosario A5 — verbatim. */
export const GLOSARIO: { termino: string; definicion: string; ejemplo: string }[] = [
  { termino: "Energía renovable", definicion: "Energía que proviene de fuentes que se reponen de forma natural.", ejemplo: "Solar, eólica, hidráulica y geotérmica." },
  { termino: "Energía solar", definicion: "Energía obtenida de la radiación del Sol.", ejemplo: "Los paneles fotovoltaicos." },
  { termino: "Energía eólica", definicion: "Energía obtenida del viento mediante aerogeneradores.", ejemplo: "Los parques eólicos del Istmo de Tehuantepec, en Oaxaca." },
  { termino: "Energía geotérmica", definicion: "Energía obtenida del calor interno de la Tierra.", ejemplo: "La central geotérmica de Cerro Prieto, en Baja California." },
  { termino: "Energía no renovable", definicion: "Energía de fuentes que se agotan, como los combustibles fósiles.", ejemplo: "Petróleo, carbón y gas natural." },
];

export const ACTIVIDAD_A5 = "Investiga qué fuente de energía predomina en la región donde vives.";

export const FUENTE_A1 =
  "Secretaría de Energía (SENER) — Balance Nacional de Energía 2024; Comisión Reguladora de Energía (CRE); IRENA (Agencia Internacional de Energías Renovables) — Perfil Energético México 2024.";

export const FUENTE = `CEN Bachillerato — CNEYT-II, progresión 11: infografía A1 (${FUENTE_A1}), quiz A2, quiz A4, glosario A5, actividad A6, reto A10 y clasificación A11.`;

export const PROBLEMA =
  "México tiene sol, viento y calor volcánico de sobra, y aun así genera cerca de tres cuartas partes de su electricidad quemando combustibles fósiles. En este laboratorio recorres las centrales reales del país, operas una red durante un día entero para ver por qué el sol y el viento no bastan solos, y ajustas la mezcla nacional para medir sus emisiones.";

export const INSTRUCCIONES: string[] = [
  "En Mapa de centrales, toca las centrales y compara su capacidad instalada con lo que de verdad generan en un año. Predice cuál genera más e intenta igualar Laguna Verde con paneles solares.",
  "En Un día en la red, elige estación, instala sol, viento, baterías y respaldo de gas, y reproduce el día: busca cubrir la demanda las 24 horas.",
  "En Emisiones y agotamiento, ajusta la mezcla del país, decide qué fósil retirar primero y mira cómo cayó la producción de petróleo.",
  "Clasifica fuentes contrarreloj para ganar estrellas y resuelve el quiz A2 y el texto A6.",
];

export const IDEAS: string[] = [
  "Renovable es la fuente que se repone en una escala de tiempo humana; limpia es la que casi no emite. La nuclear es limpia pero no renovable (A11).",
  "La capacidad instalada (MW) no es la energía generada (MWh): depende del factor de planta.",
  "El sol y el viento son variables; cubrir la demanda de noche o sin viento exige almacenamiento o respaldo.",
  "Las renovables emiten mucho menos en su ciclo de vida, pero no cero (A2).",
  "Sustituir carbón o combustóleo reduce más emisiones que sustituir gas.",
  "Los yacimientos de petróleo se agotan: la producción mexicana cayó de 3.4 a 1.8 millones de barriles diarios (A1).",
];

/** Quiz A2 «¿Verdadero o falso? Energía en México» — verbatim. */
export const QUIZ_A2: QuizEvaluable = {
  titulo: "¿Verdadero o falso? Energía en México",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "México tiene uno de los mayores potenciales solares del mundo, especialmente en el norte del país.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto. Sonora, Chihuahua y Baja California reciben entre 5.5 y 6.3 kWh/m²/día, nivel de irradiación entre los más altos del planeta.",
    },
    {
      enunciado: "La energía geotérmica solo se puede generar en países con volcanes activos como Islandia y no en México.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 1,
      retroalimentacion: "México es el 5º productor mundial de energía geotérmica; los campos de Los Humeros (Puebla) y Cerro Prieto (Baja California) son relevantes a nivel mundial.",
    },
    {
      enunciado: "Las fuentes de energía renovable no emiten ningún tipo de gases de efecto invernadero en todo su ciclo de vida.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 1,
      retroalimentacion: "Las renovables emiten mucho menos GEI que los combustibles fósiles, pero no son cero en todo el ciclo de vida (fabricación, instalación, mantenimiento de paneles, turbinas, etc.).",
    },
    {
      enunciado: "El corredor eólico de Oaxaca es el principal en México por generación de energía eólica.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto. El Istmo de Tehuantepec en Oaxaca tiene vientos constantes que lo hacen el mayor productor de energía eólica del país.",
    },
    {
      enunciado: "México ha cumplido ya el 100% de su generación eléctrica con fuentes renovables.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 1,
      retroalimentacion: "México aún genera aproximadamente el 80% de su electricidad con combustibles fósiles; las renovables representan alrededor del 20% aunque van en aumento.",
    },
    {
      enunciado: "La energía hidroeléctrica es una fuente renovable pero puede tener impactos ambientales negativos como inundación de ecosistemas.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto. Las grandes represas son renovables pero pueden inundar valles, desplazar comunidades y alterar ecosistemas acuáticos.",
    },
  ],
};

/** Actividad A6 «Completa: fuentes de energía» — verbatim. */
export const HUECOS_A6: TextoHuecosData = {
  ancla: "CNEYT-II-P07-A6 · Completa: fuentes de energía",
  instrucciones: "Completa con la palabra correcta.",
  partes: [
    "Las energías ",
    " provienen de fuentes que se reponen de forma natural, como la solar, la eólica, la ",
    " y la geotérmica. Las energías no renovables, como los combustibles ",
    ", se agotan y contaminan más. México tiene gran ",
    " para las energías limpias.",
  ],
  huecos: [
    { respuesta: "renovables", alternativas: [], pista: "Se reponen naturalmente." },
    { respuesta: "hidráulica", alternativas: ["hidraulica"], pista: "Aprovecha el agua." },
    { respuesta: "fósiles", alternativas: ["fosiles"], pista: "Petróleo, carbón, gas." },
    { respuesta: "potencial", alternativas: [], pista: "Capacidad o posibilidad." },
  ],
};

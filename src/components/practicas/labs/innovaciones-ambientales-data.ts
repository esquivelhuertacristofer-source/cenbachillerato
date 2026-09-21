/**
 * Datos y modelos del laboratorio "Innovaciones tecnológicas para el ambiente"
 * (CNEYT-III-P08, progresión 8 de Ciencias Naturales, Experimentales y
 * Tecnología III). Propósito: «Construye explicaciones sobre innovaciones
 * tecnológicas que utilizan el conocimiento de los subsistemas terrestres para
 * reducir el deterioro ambiental.»
 *
 * La progresión NO tiene lectura A1 ni quiz de opción múltiple propio. Lo que
 * existe en la base de datos y se usa VERBATIM:
 *   - A1 glosario «Glosario de sustentabilidad y acción ambiental» (10 términos).
 *   - A3 reflexión «Mi propuesta de acción local» (instrucciones y pistas).
 *   - A4 verdadero/falso «Acciones locales para la conservación» → hechos.
 *   - A5 glosario «Acciones locales de conservación» (6 términos + actividad).
 *   - A6 fill_blanks → «Completa el texto» (evaluable principal).
 *   - A8 video «Innovaciones tecnológicas contra el deterioro ambiental»:
 *     descripción y sus tres preguntas.
 *   - A9 relacionar columnas: sus cinco parejas se reformulan como reactivos de
 *     opción múltiple (definición verbatim → concepto verbatim) y se suma la
 *     pregunta de opción múltiple del video A8. A10 no existe.
 *
 * Los tres modos son MODELOS SENCILLOS con cifras reales y fuentes:
 *   1. Cosecha de lluvia: V = A · P · Ce, con la normal climatológica
 *      1991–2020 de cuatro ciudades (valores mensuales redondeados) y
 *      coeficientes de escurrimiento de la guía OPS/CEPIS. Balance mensual
 *      simplificado de la cisterna.
 *   2. Humedal artificial de flujo subsuperficial: modelo de primer orden de
 *      Reed, Crites y Middlebrooks (1995): C = C₀·e^(−K_T·t), K₂₀ = 1.104 d⁻¹,
 *      θ = 1.06, t = n·A·d / Q. Límites de DBO₅ de la NOM-003-SEMARNAT-1997.
 *   3. Restauración de manglar: atenuación exponencial del oleaje dentro del
 *      rango medido (13–66 % en 100 m, McIvor et al. 2012) y captura de
 *      6–8 t CO₂e/ha/año (Blue Carbon Initiative). La supervivencia por zona y
 *      la curva de madurez son ILUSTRATIVAS.
 *
 * Datos puros (sin three ni React).
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { TextoHuecosData } from "./_mecanica-huecos";
import type { RetoNumericoData } from "./_reto-numerico";

/* ── Utilidades ───────────────────────────────────────────────────────── */

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

/* ── Modos y subsistemas ──────────────────────────────────────────────── */

export type Modo = "lluvia" | "humedal" | "manglar";
export const MODOS: Modo[] = ["lluvia", "humedal", "manglar"];

export type Subsistema = "atmosfera" | "hidrosfera" | "geosfera" | "biosfera";

export const SUBSISTEMA_DEF: Record<Subsistema, { etq: string; icono: string; color: string }> = {
  atmosfera: { etq: "Atmósfera", icono: "fa-cloud", color: "#93c5fd" },
  hidrosfera: { etq: "Hidrósfera", icono: "fa-droplet", color: "#38bdf8" },
  geosfera: { etq: "Geósfera", icono: "fa-mountain", color: "#d6a36b" },
  biosfera: { etq: "Biósfera", icono: "fa-seedling", color: "#4ade80" },
};

export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string; subsistemas: Subsistema[]; conocimiento: string }> = {
  lluvia: {
    etq: "Cosecha de lluvia",
    subtitulo: "La azotea como captador de agua",
    icono: "fa-cloud-showers-heavy",
    color: "#38bdf8",
    subsistemas: ["atmosfera", "hidrosfera"],
    conocimiento: "Usa lo que sabemos de la atmósfera —cuánto llueve y en qué meses— para guardar agua de la hidrósfera y extraer menos del acuífero.",
  },
  humedal: {
    etq: "Humedal artificial",
    subtitulo: "Plantas, grava y microbios depuran el agua",
    icono: "fa-water",
    color: "#a3e635",
    subsistemas: ["biosfera", "geosfera", "hidrosfera"],
    conocimiento: "Imita un humedal natural: la grava (geósfera) sostiene a las bacterias y las raíces (biósfera) que degradan la materia orgánica del agua (hidrósfera).",
  },
  manglar: {
    etq: "Restaurar el manglar",
    subtitulo: "Barrera contra el oleaje y sumidero de carbono",
    icono: "fa-tree",
    color: "#2dd4bf",
    subsistemas: ["biosfera", "hidrosfera", "geosfera", "atmosfera"],
    conocimiento: "Una solución basada en la naturaleza: el bosque (biósfera) frena las olas (hidrósfera), retiene el sedimento de la costa (geósfera) y guarda carbono que no vuelve a la atmósfera.",
  },
};

/* ════════════════════════════════════════════════════════════════════════
 * 1. COSECHA DE LLUVIA
 * ════════════════════════════════════════════════════════════════════════ */

export const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
export const MESES_CORTOS = ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
export const DIAS_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export interface Ciudad {
  id: "cdmx" | "monterrey" | "merida" | "tijuana";
  etq: string;
  /** Precipitación media mensual (mm), normal 1991–2020 redondeada a 5 mm. */
  mm: number[];
  regimen: string;
}

export const CIUDADES: Ciudad[] = [
  { id: "cdmx", etq: "Ciudad de México", mm: [10, 5, 10, 25, 55, 110, 160, 150, 120, 45, 15, 5], regimen: "Lluvias de verano: de junio a septiembre cae casi el 80 % del año." },
  { id: "monterrey", etq: "Monterrey", mm: [15, 15, 20, 30, 50, 70, 45, 80, 150, 75, 25, 15], regimen: "Poca lluvia y muy variable; el máximo llega en septiembre con los ciclones." },
  { id: "merida", etq: "Mérida", mm: [40, 30, 25, 25, 70, 140, 160, 140, 185, 130, 55, 45], regimen: "Clima cálido subhúmedo: llueve de mayo a octubre y algo en invierno por los nortes." },
  { id: "tijuana", etq: "Tijuana", mm: [45, 35, 45, 20, 5, 0, 0, 0, 5, 10, 35, 35], regimen: "Clima mediterráneo seco: llueve en invierno y el verano no deja caer ni una gota." },
];
export type CiudadId = Ciudad["id"];

export function lluviaAnual(c: Ciudad): number {
  return c.mm.reduce((a, b) => a + b, 0);
}

/** Coeficiente de escurrimiento (fracción de la lluvia que llega a la cisterna). Valores medios de los rangos de la guía OPS/CEPIS. */
export const TECHOS = [
  { id: "concreto", etq: "Losa de concreto", ce: 0.7, rango: "0.6–0.8" },
  { id: "teja", etq: "Teja de arcilla", ce: 0.85, rango: "0.8–0.9" },
  { id: "lamina", etq: "Lámina metálica", ce: 0.9, rango: "0.8–0.9" },
] as const;
export type TechoId = (typeof TECHOS)[number]["id"];

export const AREA_MIN = 20;
export const AREA_MAX = 200;
export const AREA_PASO = 10;
export const CISTERNAS = [1100, 2500, 5000, 10000, 20000];
export const PERSONAS_MIN = 1;
export const PERSONAS_MAX = 8;
/** Uso no potable por persona (sanitario y lavado de ropa), litros por día. Valor ilustrativo. */
export const USO_NO_POTABLE = 40;

/** Litros que capta una azotea: V = A (m²) · P (mm) · Ce. 1 mm sobre 1 m² = 1 litro. */
export function litrosCaptados(areaM2: number, mm: number, ce: number): number {
  return areaM2 * mm * ce;
}

export interface MesBalance {
  mes: number;
  mm: number;
  captado: number;
  demanda: number;
  usado: number;
  desborde: number;
  /** Litros en la cisterna al terminar el mes. */
  nivel: number;
}

export interface BalanceAnual {
  meses: MesBalance[];
  captado: number;
  demanda: number;
  usado: number;
  desborde: number;
  cobertura: number;
  mesesCubiertos: number;
}

/**
 * Balance mensual simplificado de la cisterna. Se simula un año de
 * «calentamiento» y se reporta el segundo, para que el nivel inicial de enero
 * sea el que deja el año anterior y no una cisterna vacía por convención.
 */
export function balanceAnual(c: Ciudad, areaM2: number, ce: number, capacidad: number, personas: number): BalanceAnual {
  let nivel = 0;
  let meses: MesBalance[] = [];
  for (let vuelta = 0; vuelta < 2; vuelta++) {
    meses = c.mm.map((mm, i) => {
      const captado = litrosCaptados(areaM2, mm, ce);
      const demanda = personas * USO_NO_POTABLE * DIAS_MES[i]!;
      const disponible = nivel + captado;
      const usado = Math.min(demanda, disponible);
      const resto = disponible - usado;
      const desborde = Math.max(0, resto - capacidad);
      nivel = Math.min(capacidad, resto);
      return { mes: i, mm, captado, demanda, usado, desborde, nivel };
    });
  }
  const suma = (k: keyof MesBalance) => meses.reduce((a, m) => a + m[k], 0);
  const demanda = suma("demanda");
  const usado = suma("usado");
  return {
    meses,
    captado: suma("captado"),
    demanda,
    usado,
    desborde: suma("desborde"),
    cobertura: demanda > 0 ? usado / demanda : 0,
    mesesCubiertos: meses.filter((m) => m.usado >= m.demanda - 0.5).length,
  };
}

/** Datos del programa de la CDMX (SEDEMA, consultado en 2026). */
export const PROGRAMA_CDMX =
  "El programa Cosecha de Lluvia de la SEDEMA (Ciudad de México) empezó en 2019 y ha instalado más de 73 mil sistemas en viviendas de 11 alcaldías, con más de 230 mil habitantes beneficiados. Cada sistema lleva canaletas, un separador de primeras lluvias, filtros, cisterna y desinfección.";

/* ════════════════════════════════════════════════════════════════════════
 * 2. HUMEDAL ARTIFICIAL DE FLUJO SUBSUPERFICIAL
 * ════════════════════════════════════════════════════════════════════════ */

/** Constante de primer orden a 20 °C para DBO₅ en flujo subsuperficial (d⁻¹). Reed, Crites y Middlebrooks (1995). */
export const K20 = 1.104;
export const THETA = 1.06;
/** Porosidad de la grava. */
export const POROSIDAD = 0.38;
/** Profundidad del lecho de grava (m). */
export const PROFUNDIDAD = 0.6;
/** DBO₅ típica del agua que sale de una fosa séptica (mg/L). Valor típico ilustrativo. */
export const DBO_ENTRADA = 150;
/** Aguas residuales por persona (L/día). Valor típico ilustrativo. */
export const AGUA_POR_PERSONA = 120;
/** NOM-003-SEMARNAT-1997, agua residual tratada que se reúsa en servicios al público (promedio mensual). */
export const NOM_DIRECTO = 20;
export const NOM_INDIRECTO = 30;

export const HUM_PERSONAS_MIN = 10;
export const HUM_PERSONAS_MAX = 200;
export const HUM_AREA_MIN = 10;
export const HUM_AREA_MAX = 300;
export const HUM_T_MIN = 8;
export const HUM_T_MAX = 30;

export const CLIMAS = [
  { id: "toluca", etq: "Toluca en enero", t: 10 },
  { id: "cdmx", etq: "Ciudad de México", t: 17 },
  { id: "merida", etq: "Mérida", t: 26 },
] as const;

export function kT(tC: number): number {
  return K20 * Math.pow(THETA, tC - 20);
}

/** Caudal (m³/día). */
export function caudal(personas: number): number {
  return (personas * AGUA_POR_PERSONA) / 1000;
}

/** Tiempo de residencia hidráulica (días): t = n · A · d / Q. */
export function tiempoResidencia(areaM2: number, personas: number): number {
  return (POROSIDAD * areaM2 * PROFUNDIDAD) / caudal(personas);
}

/** DBO₅ a una fracción x (0–1) del largo del humedal. */
export function dboEn(x: number, areaM2: number, personas: number, tC: number): number {
  return DBO_ENTRADA * Math.exp(-kT(tC) * tiempoResidencia(areaM2, personas) * x);
}

export function dboSalida(areaM2: number, personas: number, tC: number): number {
  return dboEn(1, areaM2, personas, tC);
}

/** Área mínima (m²) para lograr una DBO₅ de salida dada. */
export function areaNecesaria(personas: number, tC: number, objetivo: number): number {
  const t = Math.log(DBO_ENTRADA / objetivo) / kT(tC);
  return (t * caudal(personas)) / (POROSIDAD * PROFUNDIDAD);
}

export type CalidadAgua = "directo" | "indirecto" | "no";
export function calidad(dbo: number): CalidadAgua {
  return dbo <= NOM_DIRECTO ? "directo" : dbo <= NOM_INDIRECTO ? "indirecto" : "no";
}
export const CALIDAD_DEF: Record<CalidadAgua, { etq: string; color: string; explica: string }> = {
  directo: { etq: "Reúso con contacto directo", color: "#34d399", explica: "DBO₅ ≤ 20 mg/L: puede regar parques y camellones donde la gente toca el agua o el pasto." },
  indirecto: { etq: "Reúso con contacto indirecto", color: "#fbbf24", explica: "DBO₅ entre 20 y 30 mg/L: sirve para riego donde el público no tiene contacto, pero no para más." },
  no: { etq: "No cumple la NOM-003", color: "#f87171", explica: "DBO₅ > 30 mg/L: todavía lleva mucha materia orgánica; al llegar a un río le quitaría el oxígeno a los peces." },
};

export interface Medicion {
  personas: number;
  area: number;
  t: number;
  dbo: number;
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. RESTAURACIÓN DE MANGLAR
 * ════════════════════════════════════════════════════════════════════════ */

export type ZonaId = "borde" | "media" | "interna";
export const ZONAS: { id: ZonaId; etq: string; inundacion: string }[] = [
  { id: "borde", etq: "Borde del agua", inundacion: "Se inunda con cada marea: lodo blando y salado" },
  { id: "media", etq: "Zona media", inundacion: "Se inunda solo en mareas altas: suelo firme y muy salino" },
  { id: "interna", etq: "Tierra adentro", inundacion: "Rara vez se inunda: suelo más seco y menos salado" },
];

export type EspecieId = "rojo" | "negro" | "blanco" | "casuarina";
export const ESPECIES: { id: EspecieId; etq: string; cientifico: string; nativa: boolean; color: string; rasgo: string; zona: ZonaId | null }[] = [
  { id: "rojo", etq: "Mangle rojo", cientifico: "Rhizophora mangle", nativa: true, color: "#b45309", rasgo: "Raíces en zanco que lo sostienen en el lodo inundado.", zona: "borde" },
  { id: "negro", etq: "Mangle negro", cientifico: "Avicennia germinans", nativa: true, color: "#57534e", rasgo: "Neumatóforos: raíces que salen del lodo para respirar.", zona: "media" },
  { id: "blanco", etq: "Mangle blanco", cientifico: "Laguncularia racemosa", nativa: true, color: "#a8a29e", rasgo: "Tolera menos inundación; crece detrás de los otros.", zona: "interna" },
  { id: "casuarina", etq: "Casuarina", cientifico: "Casuarina equisetifolia", nativa: false, color: "#65a30d", rasgo: "Árbol australiano introducido; en México se considera invasor.", zona: null },
];

/** Supervivencia de cada especie según la zona (ILUSTRATIVA: refleja la zonación, no una medición). */
const SUPERVIVENCIA: Record<EspecieId, Record<ZonaId, number>> = {
  rojo: { borde: 0.9, media: 0.45, interna: 0.2 },
  negro: { borde: 0.3, media: 0.9, interna: 0.5 },
  blanco: { borde: 0.1, media: 0.4, interna: 0.9 },
  casuarina: { borde: 0, media: 0, interna: 0.3 },
};

export function supervivencia(e: EspecieId | null, z: ZonaId): number {
  return e ? SUPERVIVENCIA[e][z] : 0;
}

/** ¿La especie forma bosque de manglar que frena el agua? La casuarina no. */
export function aportaManglar(e: EspecieId | null): boolean {
  return e !== null && e !== "casuarina";
}

export type Plantacion = Record<ZonaId, EspecieId | null>;
export const PLANTACION_VACIA: Plantacion = { borde: null, media: null, interna: null };

export function zonacionCorrecta(p: Plantacion): boolean {
  return ZONAS.every((z) => ESPECIES.find((e) => e.id === p[z.id])?.zona === z.id);
}

export const ANCHO_MAX = 400;
export const ANCHO_PASO = 25;
export const ANIOS_MAX = 20;
/** Largo del tramo de costa restaurado (m). */
export const LARGO_COSTA = 2000;
/** Altura de la ola de tormenta al llegar a la orilla (m). */
export const OLA_INICIAL = 1.5;
/** Manglar maduro y denso: la ola pierde la mitad de su altura en 100 m (dentro del rango 13–66 % de McIvor et al. 2012). */
export const K_OLA = Math.log(2) / 100;
/** Captura de un manglar establecido (t CO₂e por hectárea al año), valor medio de 6–8. */
export const CAPTURA_HA = 7;
/** Emisiones de un auto de pasajeros típico (t CO₂ al año, US EPA). */
export const CO2_AUTO = 4.6;
/** Años para que una plantación se comporte como bosque maduro (ILUSTRATIVO). */
export const ANIOS_MADUREZ = 15;

export function madurez(anios: number): number {
  const f = Math.min(1, Math.max(0, anios / ANIOS_MADUREZ));
  return f * f * (3 - 2 * f);
}

/** Altura de la ola (m) tras cruzar el cinturón, zona por zona (cada zona ocupa un tercio del ancho). */
export function olaTrasZonas(p: Plantacion, anchoM: number, anios: number): number[] {
  const m = madurez(anios);
  let h = OLA_INICIAL;
  return ZONAS.map((z) => {
    const e = p[z.id];
    const k = aportaManglar(e) ? K_OLA * supervivencia(e, z.id) * m : 0;
    h *= Math.exp(-k * (anchoM / 3));
    return h;
  });
}

export function olaEnPueblo(p: Plantacion, anchoM: number, anios: number): number {
  return olaTrasZonas(p, anchoM, anios)[2]!;
}

export function hectareas(anchoM: number): number {
  return (anchoM * LARGO_COSTA) / 10000;
}

/** Supervivencia media ponderada del cinturón (solo especies de manglar). */
export function coberturaManglar(p: Plantacion): number {
  return ZONAS.reduce((a, z) => a + (aportaManglar(p[z.id]) ? supervivencia(p[z.id], z.id) : 0), 0) / ZONAS.length;
}

/** CO₂e capturado acumulado (t) tras `anios`: tasa anual proporcional a la cobertura y la madurez. */
export function co2Acumulado(p: Plantacion, anchoM: number, anios: number): number {
  const ha = hectareas(anchoM) * coberturaManglar(p);
  let total = 0;
  const pasos = Math.max(1, Math.round(anios * 12));
  for (let i = 0; i < pasos; i++) {
    const t = ((i + 0.5) / pasos) * anios;
    total += CAPTURA_HA * ha * madurez(t) * (anios / pasos);
  }
  return anios <= 0 ? 0 : total;
}

/* ════════════════════════════════════════════════════════════════════════
 * Tarjeta de estrellas: ¿qué innovación resuelve el problema?
 * ════════════════════════════════════════════════════════════════════════ */

export type InnovacionId = "lluvia" | "humedal" | "manglar" | "biodigestor" | "techo" | "infiltracion";

export const INNOVACIONES: { id: InnovacionId; etq: string; icono: string; subsistema: Subsistema; usa: string }[] = [
  { id: "lluvia", etq: "Cosecha de lluvia", icono: "fa-cloud-showers-heavy", subsistema: "atmosfera", usa: "usa el conocimiento del régimen de lluvias (atmósfera) para guardar agua" },
  { id: "humedal", etq: "Humedal artificial", icono: "fa-water", subsistema: "biosfera", usa: "usa bacterias, raíces y grava (biósfera y geósfera) para degradar la materia orgánica del agua" },
  { id: "manglar", etq: "Restaurar manglar", icono: "fa-tree", subsistema: "biosfera", usa: "usa un ecosistema nativo (biósfera) que frena las olas y guarda carbono" },
  { id: "biodigestor", etq: "Biodigestor", icono: "fa-fire-flame-simple", subsistema: "biosfera", usa: "usa bacterias que, sin oxígeno, convierten el estiércol en biogás en vez de liberar metano a la atmósfera" },
  { id: "techo", etq: "Techo verde", icono: "fa-leaf", subsistema: "atmosfera", usa: "usa la sombra y la evapotranspiración de las plantas para enfriar el aire junto a la azotea (atmósfera)" },
  { id: "infiltracion", etq: "Pavimento permeable y pozos de absorción", icono: "fa-arrow-down-long", subsistema: "geosfera", usa: "usa la porosidad del suelo (geósfera) para que la lluvia se infiltre y recargue el acuífero" },
];

export const PROBLEMAS: { texto: string; solucion: InnovacionId }[] = [
  { texto: "En una colonia de Iztapalapa el agua de la red llega por tandeo, pero en verano caen aguaceros fuertes sobre las azoteas.", solucion: "lluvia" },
  { texto: "Una escuela rural sin red de agua necesita agua para sus sanitarios y en su región llueve 1 000 mm al año.", solucion: "lluvia" },
  { texto: "Una comunidad de 80 familias sin drenaje descarga sus aguas negras directo a un arroyo.", solucion: "humedal" },
  { texto: "Un hotel ecoturístico junto a un cenote debe tratar sus aguas residuales sin electricidad ni químicos.", solucion: "humedal" },
  { texto: "Un pueblo pesquero de la costa de Nayarit pierde casas con cada huracán desde que se taló el bosque inundable de la orilla.", solucion: "manglar" },
  { texto: "Una laguna costera se quedó sin crías de camarón y de peces después de que rellenaron y talaron sus orillas.", solucion: "manglar" },
  { texto: "Una granja porcina de Yucatán amontona estiércol que huele, escurre hacia el acuífero y emite metano.", solucion: "biodigestor" },
  { texto: "Una familia campesina cocina con leña y el estiércol de sus cinco vacas se amontona en el corral.", solucion: "biodigestor" },
  { texto: "La azotea de lámina de una escuela de Monterrey convierte el salón de clases en un horno cada verano.", solucion: "techo" },
  { texto: "En el centro de la ciudad, sin árboles, el concreto guarda el calor del día y las noches son varios grados más calientes que en las afueras.", solucion: "techo" },
  { texto: "Una colonia completamente pavimentada se inunda en cada tormenta mientras el acuífero de abajo se sigue agotando.", solucion: "infiltracion" },
  { texto: "Un estacionamiento de concreto manda toda la lluvia al drenaje y ni una gota llega al subsuelo.", solucion: "infiltracion" },
];

export function rondaProblemas(rnd: () => number, n = 6): number[] {
  // Uno por innovación, en orden aleatorio: así nadie puede ganar repitiendo el mismo botón.
  const elegidos = INNOVACIONES.map((inv) => {
    const idx = PROBLEMAS.map((p, i) => ({ p, i })).filter((x) => x.p.solucion === inv.id);
    return idx[Math.floor(rnd() * idx.length)]!.i;
  });
  const a = [...elegidos];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a.slice(0, n);
}

export function estrellasPorErrores(errores: number): number {
  return errores === 0 ? 3 : errores <= 2 ? 2 : 1;
}

/* ════════════════════════════════════════════════════════════════════════
 * Contenido VERBATIM de la base de datos
 * ════════════════════════════════════════════════════════════════════════ */

export const PROPOSITO = "Construye explicaciones sobre innovaciones tecnológicas que utilizan el conocimiento de los subsistemas terrestres para reducir el deterioro ambiental.";

/** Video A8 — título, descripción y preguntas, verbatim. */
export const VIDEO_A8 = {
  titulo: "Innovaciones tecnológicas contra el deterioro ambiental",
  descripcion: "Video que muestra ejemplos de innovaciones tecnológicas diseñadas a partir del conocimiento de los subsistemas terrestres para reducir o mitigar el deterioro ambiental.",
  abierta: "Menciona una innovación tecnológica que ayude a reducir el deterioro ambiental y explica cómo funciona.",
  verdaderoFalso: "El conocimiento científico de los subsistemas terrestres puede aplicarse para desarrollar tecnología que reduzca el daño ambiental.",
};

/** Reflexión A3 — primer párrafo, requisitos y pistas, verbatim. */
export const REFLEXION_A3 = {
  intro: "Has estudiado ecosistemas, ciclos biogeoquímicos, deterioro ambiental, políticas de conservación y conceptos de sustentabilidad. Ahora es momento de pasar del conocimiento a la acción.",
  pide: "Diseña una propuesta de acción ambiental local basada en los principios de la Investigación Acción Participativa (IAP). Tu propuesta debe:",
  requisitos: [
    "Identificar un problema ambiental específico de tu comunidad, escuela o barrio.",
    "Proponer al menos dos acciones concretas y factibles (no solo 'sensibilizar').",
    "Mencionar quiénes son los actores que deberían involucrarse.",
    "Conectar tu propuesta con al menos un ODS.",
    "Proponer cómo medirías si la acción funcionó.",
  ],
  cierre: "Sé específico/a. No sirve 'plantar árboles en general'; sí sirve 'reforestar el camellón de la calle X con especies nativas del Bajío en coordinación con la delegación municipal'.",
  pistas: [
    "Investiga si hay un comité ambiental en tu escuela, municipio o colonia.",
    "Los ODS 13 (Acción por el clima), 14 (Vida submarina) y 15 (Vida de ecosistemas terrestres) son los más relevantes, pero ODS 11 (ciudades sostenibles) o 3 (salud) también pueden conectar.",
    "Una métrica sencilla puede ser: número de árboles plantados que sobrevivieron a 6 meses, kilos de residuos separados por mes, % de compañeros que cambiaron un hábito.",
    "Recuerda: el principio de la IAP es que la comunidad participa en todo el proceso, no solo como 'beneficiaria'.",
  ],
};

/** Hechos: verdadero/falso A4, con su retroalimentación. */
export const HECHOS: string[] = [
  "Verdadero: «Una acción de conservación fundamentada en evidencia se basa en datos científicos para evaluar su efectividad antes y después de aplicarla». Correcto: la ciencia de la conservación requiere monitoreo con indicadores medibles para demostrar que la acción funciona.",
  "Falso: «Plantar cualquier especie de árbol en un área degradada es siempre la mejor estrategia de restauración». La restauración exitosa requiere plantar especies nativas adaptadas al ecosistema local; las especies exóticas pueden convertirse en invasoras y agravar la degradación.",
  "Verdadero: «El monitoreo ciudadano (ciencia ciudadana) puede aportar datos válidos para la toma de decisiones en conservación». Sí: proyectos de ciencia ciudadana como el monitoreo de aves, mariposas o calidad del agua generan grandes bases de datos útiles para la conservación.",
  "Falso: «Las acciones locales de conservación no tienen impacto en problemas ambientales de escala global». Las acciones locales acumuladas (reducción de emisiones, restauración de vegetación, gestión de residuos) contribuyen significativamente a mitigar problemas globales.",
  "Verdadero: «Un diagnóstico ambiental previo es fundamental para diseñar acciones de conservación eficaces». Correcto: sin conocer el estado actual del ecosistema (diagnóstico), las acciones pueden ser inadecuadas o ineficientes.",
];

export interface TerminoGlosario {
  termino: string;
  definicion: string;
  ejemplo: string;
  fuente: "A1" | "A5";
}

/** Glosarios A1 y A5 — verbatim. */
export const GLOSARIO: TerminoGlosario[] = [
  { fuente: "A1", termino: "Objetivos de Desarrollo Sostenible (ODS)", definicion: "Los 17 objetivos adoptados por la ONU en 2015 como parte de la Agenda 2030, que buscan erradicar la pobreza, proteger el planeta y garantizar la paz y prosperidad para 2030.", ejemplo: "El ODS 14 (Vida submarina) impulsa la protección de océanos y mares; el ODS 15 (Vida de ecosistemas terrestres) busca detener la deforestación." },
  { fuente: "A1", termino: "Huella ecológica", definicion: "Indicador que mide cuánta superficie bioproductiva (tierra y agua) necesita una población para generar los recursos que consume y absorber los residuos que produce.", ejemplo: "La huella ecológica de México es ~2.5 ha/persona; la biocapacidad disponible es ~1.8 ha/persona, lo que indica un déficit ecológico." },
  { fuente: "A1", termino: "Resiliencia ecológica", definicion: "Capacidad de un ecosistema para absorber perturbaciones y reorganizarse mientras experimenta cambios, manteniendo esencialmente la misma estructura, función y biodiversidad.", ejemplo: "Un arrecife de coral con alta diversidad de especies tiene mayor resiliencia: si una especie desaparece, otras ocupan su nicho." },
  { fuente: "A1", termino: "Área Natural Protegida (ANP)", definicion: "Zona del territorio nacional en la que el Estado restringe actividades humanas para conservar ecosistemas, biodiversidad y servicios ambientales, según la LGEEPA.", ejemplo: "La Reserva de Biosfera de Calakmul (Campeche) protege la mayor extensión de selva maya en México y es Patrimonio de la Humanidad." },
  { fuente: "A1", termino: "Restauración ecológica", definicion: "Proceso de asistir la recuperación de un ecosistema degradado, dañado o destruido para retornar su estructura, función y biodiversidad.", ejemplo: "Reforestar con especies nativas en una cuenca deforestada, eliminar especies invasoras y restaurar el flujo hídrico natural son acciones de restauración ecológica." },
  { fuente: "A1", termino: "Biodiversidad", definicion: "Variedad de formas de vida en la Tierra en sus tres niveles: diversidad genética (dentro de una especie), diversidad de especies (entre especies) y diversidad de ecosistemas.", ejemplo: "México es megadiverso: posee ~10-12% de las especies del mundo en solo ~1.5% de la superficie terrestre, incluyendo ~800 especies de reptiles y ~30,000 de plantas vasculares." },
  { fuente: "A1", termino: "Servicios ecosistémicos", definicion: "Beneficios que los ecosistemas proveen a las sociedades humanas, clasificados en: servicios de aprovisionamiento (alimentos, agua, madera), servicios de regulación (clima, inundaciones, polinización), servicios culturales y servicios de soporte (ciclos de nutrientes, fotosíntesis).", ejemplo: "Los manglares proveen servicios de aprovisionamiento (pesca), regulación (protección costera ante huracanes) y culturales (turismo, identidad local)." },
  { fuente: "A1", termino: "Carbono neutral", definicion: "Estado en que las emisiones de CO₂ de una actividad u organización son compensadas por la captura o reducción equivalente de CO₂, resultando en un balance neto de cero emisiones.", ejemplo: "Una empresa puede ser carbono neutral plantando bosques que absorban el CO₂ que emite, o comprando bonos de carbono certificados que financien proyectos de reducción de emisiones." },
  { fuente: "A1", termino: "Investigación acción participativa (IAP)", definicion: "Metodología que combina investigación científica y acción social: los propios afectados participan en identificar el problema, investigar sus causas y diseñar soluciones. Valora el conocimiento local.", ejemplo: "Una comunidad costera que mapea con los pescadores las zonas de pesca sobreexplotada y diseña vedas temporales basadas en sus observaciones realiza IAP." },
  { fuente: "A1", termino: "Agencia ciudadana ambiental", definicion: "Capacidad y disposición de los ciudadanos para actuar deliberadamente en defensa y mejora del ambiente, a través de acciones individuales, colectivas o políticas.", ejemplo: "Participar en la consulta ciudadana de un plan de desarrollo urbano para exigir áreas verdes, unirse a brigadas de limpieza de ríos o votar informado en elecciones sobre política ambiental son ejercicios de agencia ciudadana." },
  { fuente: "A5", termino: "Diagnóstico ambiental", definicion: "Evaluación del estado actual de un ecosistema que identifica sus principales problemas, causas y actores involucrados como base para la acción.", ejemplo: "Un diagnóstico ambiental de una barranca urbana puede revelar contaminación por residuos sólidos, pérdida de vegetación y erosión del suelo." },
  { fuente: "A5", termino: "Indicador de impacto", definicion: "Variable medible que permite evaluar el efecto de una acción de conservación sobre el ecosistema.", ejemplo: "El porcentaje de cobertura vegetal nativa antes y después de una reforestación es un indicador de impacto." },
  { fuente: "A5", termino: "Especie nativa", definicion: "Especie que evolucionó en un ecosistema y forma parte de sus relaciones ecológicas naturales.", ejemplo: "El encino (Quercus spp.) es una especie nativa de los bosques templados de México." },
  { fuente: "A5", termino: "Especie invasora", definicion: "Especie introducida fuera de su distribución natural que compite con las nativas y puede alterar el ecosistema.", ejemplo: "El pez diablo (Pterygoplichthys spp.) es una especie invasora que afecta ríos y lagos de México." },
  { fuente: "A5", termino: "Ciencia ciudadana", definicion: "Participación de ciudadanos no especializados en la recolección y análisis de datos científicos para proyectos de investigación o conservación.", ejemplo: "El conteo navideño de aves de la National Audubon Society es un ejemplo de ciencia ciudadana con décadas de datos." },
  { fuente: "A5", termino: "Servicio ecosistémico", definicion: "Beneficio que los ecosistemas proveen a los seres humanos: provisión (agua, alimentos), regulación (clima, inundaciones), soporte (ciclos de nutrientes) y culturales.", ejemplo: "Los manglares proveen servicios de regulación al proteger costas de huracanes y almacenar carbono." },
];

export const ACTIVIDAD_A5 =
  "Diseña una acción de conservación para un problema ambiental de tu comunidad: define el diagnóstico, la acción propuesta, las especies nativas involucradas y los indicadores para evaluar su éxito.";

export const FUENTE =
  "CEN Bachillerato — CNEYT-III, progresión 8: glosarios A1 y A5, reflexión A3, verdadero/falso A4, texto A6, video A8 y relacionar columnas A9. Modelos: normales climatológicas 1991–2020 (SMN), guía OPS/CEPIS de captación de lluvia, SEDEMA (Cosecha de Lluvia), Reed, Crites y Middlebrooks (1995), NOM-003-SEMARNAT-1997, McIvor et al. (2012), CONABIO (2020), Blue Carbon Initiative, US EPA.";

export const PROBLEMA =
  "Conocer cómo funcionan la atmósfera, la hidrósfera, la geósfera y la biósfera no solo sirve para explicar el deterioro ambiental: también sirve para diseñar tecnología que lo reduzca. En este laboratorio instalas tres innovaciones reales —una cosecha de lluvia, un humedal que depura aguas residuales y un manglar restaurado— y mides con modelos sencillos cuánto ayudan y por qué.";

export const INSTRUCCIONES: string[] = [
  "En Cosecha de lluvia elige la ciudad, el techo, el área y la cisterna; simula un año y mira mes a mes cuánta agua entra, cuánta se usa y cuánta se desborda.",
  "En Humedal artificial ajusta cuántas personas lo usan, su área y el clima; mide la DBO₅ a la salida y compárala con la NOM-003.",
  "En Restaurar el manglar planta una especie en cada zona, elige el ancho del cinturón, deja pasar los años y lanza la ola de tormenta.",
  "Resuelve «¿Qué innovación lo resuelve?» para ganar estrellas y termina con el quiz, el cálculo y el texto A6.",
];

export const IDEAS: string[] = [
  "Una innovación ambiental funciona mejor cuando se diseña con datos del subsistema que aprovecha: cuánto llueve, qué temperatura tiene el agua, dónde se inunda la costa.",
  "Un milímetro de lluvia sobre un metro cuadrado es un litro de agua: la azotea de una casa puede captar decenas de miles de litros al año.",
  "Lo que limita la cosecha de lluvia no suele ser la lluvia, sino guardarla: la cisterna tiene que cruzar la temporada seca.",
  "Un humedal artificial depura porque le da tiempo al agua: más área o menos caudal significan más días entre la grava y las raíces.",
  "Las bacterias trabajan más lento en el frío; por eso el mismo humedal depura menos en invierno o en clima templado.",
  "Restaurar un manglar es plantar la especie nativa correcta en la zona correcta: la zonación depende de cuánto se inunda cada franja.",
  "Las soluciones basadas en la naturaleza dan varios servicios ecosistémicos a la vez: protección costera, pesca y carbono almacenado.",
];

/** Quiz: parejas del relacionar A9 (definición → concepto) + pregunta de opción múltiple del video A8. */
export const QUIZ_A9: QuizEvaluable = {
  titulo: "Conceptos clave de la progresión (A9) y el video (A8)",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Qué concepto corresponde a esta definición? «Metodología que combina investigación científica y acción social: los propios afectados participan en identificar el problema, investigar sus causas y diseñar soluciones. Valora el conocimiento local.»",
      opciones: ["Agencia ciudadana ambiental", "Investigación acción participativa (IAP)", "Restauración ecológica", "Objetivos de Desarrollo Sostenible (ODS)"],
      respuestaCorrecta: 1,
      retroalimentacion: "Es la Investigación acción participativa (IAP): la comunidad afectada investiga y diseña la solución, no solo la recibe.",
    },
    {
      enunciado: "¿Qué concepto corresponde a esta definición? «Indicador que mide cuánta superficie bioproductiva (tierra y agua) necesita una población para generar los recursos que consume y absorber los residuos que produce.»",
      opciones: ["Biodiversidad", "Área Natural Protegida (ANP)", "Huella ecológica", "Investigación acción participativa (IAP)"],
      respuestaCorrecta: 2,
      retroalimentacion: "Es la huella ecológica: se expresa como superficie por persona y se compara con la biocapacidad disponible.",
    },
    {
      enunciado: "¿Qué concepto corresponde a esta definición? «Proceso de asistir la recuperación de un ecosistema degradado, dañado o destruido para retornar su estructura, función y biodiversidad.»",
      opciones: ["Restauración ecológica", "Huella ecológica", "Agencia ciudadana ambiental", "Biodiversidad"],
      respuestaCorrecta: 0,
      retroalimentacion: "Es la restauración ecológica, como la del manglar de este laboratorio: devolverle al ecosistema su estructura y su función.",
    },
    {
      enunciado: "¿Qué concepto corresponde a esta definición? «Zona del territorio nacional en la que el Estado restringe actividades humanas para conservar ecosistemas, biodiversidad y servicios ambientales, según la LGEEPA.»",
      opciones: ["Objetivos de Desarrollo Sostenible (ODS)", "Restauración ecológica", "Investigación acción participativa (IAP)", "Área Natural Protegida (ANP)"],
      respuestaCorrecta: 3,
      retroalimentacion: "Es un Área Natural Protegida (ANP), definida en la Ley General del Equilibrio Ecológico y la Protección al Ambiente (LGEEPA).",
    },
    {
      enunciado: "¿Qué concepto corresponde a esta definición? «Los 17 objetivos adoptados por la ONU en 2015 como parte de la Agenda 2030, que buscan erradicar la pobreza, proteger el planeta y garantizar la paz y prosperidad para 2030.»",
      opciones: ["Huella ecológica", "Objetivos de Desarrollo Sostenible (ODS)", "Área Natural Protegida (ANP)", "Agencia ciudadana ambiental"],
      respuestaCorrecta: 1,
      retroalimentacion: "Son los Objetivos de Desarrollo Sostenible (ODS) de la Agenda 2030.",
    },
    {
      enunciado: "¿Cuál de las siguientes es una innovación tecnológica orientada a reducir el deterioro ambiental?",
      opciones: ["Los paneles solares", "Los motores de combustión sin filtro", "La tala no regulada"],
      respuestaCorrecta: 0,
      retroalimentacion: "Los paneles solares convierten la luz del Sol en electricidad sin quemar combustibles; las otras dos opciones aumentan el deterioro.",
    },
  ],
};

/** Actividad A6 «Rellena los huecos — Acciones locales de conservación» — verbatim. */
export const HUECOS_A6: TextoHuecosData = {
  ancla: "CNEYT-III-P08-A6 · Rellena los huecos — Acciones locales de conservación",
  instrucciones: "Completa los cuatro huecos con el término o concepto correcto.",
  partes: [
    "Antes de diseñar cualquier acción de conservación, es necesario realizar un ",
    " ambiental que describa el estado actual del ecosistema. Para restaurar un área degradada se recomienda plantar ",
    " nativas, no introducidas, para respetar las relaciones ecológicas locales. El avance de la restauración se mide con ",
    " de impacto como la cobertura vegetal o la riqueza de especies. La participación de la comunidad en el monitoreo ambiental se conoce como ciencia ",
    ".",
  ],
  huecos: [
    { respuesta: "diagnóstico", alternativas: ["diagnostico"], pista: "Evaluación inicial que identifica los problemas y causas en un ecosistema." },
    { respuesta: "especies", alternativas: ["especie"], pista: "Organismos propios del ecosistema que evolucionaron en él y forman relaciones ecológicas naturales." },
    { respuesta: "indicadores", alternativas: ["indicador"], pista: "Variables medibles que permiten saber si una acción de conservación está teniendo efecto." },
    { respuesta: "ciudadana", alternativas: [], pista: "Tipo de ciencia en la que participan personas no especializadas en la recolección de datos." },
  ],
};

/** Reto de cálculo del laboratorio (NO es de la base de datos): cosecha de lluvia en la CDMX. */
export const RETO_LLUVIA: RetoNumericoData = {
  titulo: "Reto de cálculo: ¿cuánta lluvia cabe en una azotea?",
  contexto: "Volumen captado = área de la azotea (m²) × precipitación (mm) × coeficiente de escurrimiento. Un milímetro de lluvia sobre un metro cuadrado equivale a un litro.",
  problema:
    "Una vivienda de Iztapalapa tiene una azotea de losa de concreto de 60 m² (Ce = 0.7). En la Ciudad de México llueven en promedio 710 mm al año. ¿Cuántos litros puede captar al año? Si la familia usa 160 litros diarios de agua no potable, ¿para cuántos días de uso alcanza esa agua?",
  campos: [
    { etiqueta: "Agua captada al año", objetivo: 29820, tolerancia: 30, unidad: "L" },
    { etiqueta: "Días de uso", objetivo: 186.4, tolerancia: 1, unidad: "días" },
  ],
  pasosGuia: ["V = 60 m² × 710 mm × 0.7 = 29 820 L.", "Días = 29 820 L ÷ 160 L/día ≈ 186 días.", "Alcanza para medio año, pero solo si la cisterna es tan grande que guarda el agua del verano para el invierno."],
  respuestaFinal: "29 820 litros al año, suficientes para unos 186 días de uso no potable.",
};

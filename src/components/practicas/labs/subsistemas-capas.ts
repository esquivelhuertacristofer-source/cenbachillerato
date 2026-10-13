/**
 * Datos puros de la Tierra «élite» del laboratorio de Subsistemas terrestres
 * (CNEYT-III-P05): las capas del interior y de la atmósfera, los lugares donde
 * ocurre cada proceso y el trazo de los principales límites de placas.
 *
 * Sin three ni react: lo comparten el shell (pestaña Teoría) y la escena.
 *
 * ESCALAS. El interior va con radios PROPORCIONALES al radio real de la Tierra
 * (6 371 km), salvo la corteza: con sus ~35 km sería un trazo de un píxel, así
 * que se dibuja unas tres veces más gruesa. La atmósfera, en cambio, es una
 * película finísima (el 99 % de su masa está bajo los 30 km): sus capas se
 * dibujan EXAGERADAS en un casquete, como en las infografías, y así se dice.
 */

/* ── Modos (esferas) que recorre la cámara ───────────────────────────────── */
export type ModoEsfera = "sistema" | "atmosfera" | "hidrosfera" | "litosfera" | "biosfera";

export const MODOS_ESFERA: { id: ModoEsfera; etiqueta: string; icono: string }[] = [
  { id: "sistema", etiqueta: "Sistema", icono: "fa-earth-americas" },
  { id: "atmosfera", etiqueta: "Atmósfera", icono: "fa-wind" },
  { id: "hidrosfera", etiqueta: "Hidrosfera", icono: "fa-water" },
  { id: "litosfera", etiqueta: "Litosfera", icono: "fa-mountain" },
  { id: "biosfera", etiqueta: "Biosfera", icono: "fa-leaf" },
];

/** Qué mirar y qué mover en cada esfera (panel «Controles»). */
export const FOCO_ESFERA: Record<ModoEsfera, { titulo: string; mira: string; mueve: string }> = {
  sistema: {
    titulo: "La Tierra como un solo sistema",
    mira: "La Tierra abierta en cuña: por fuera, la foto de la NASA; por dentro, las capas del planeta. El termómetro de la izquierda es la temperatura media.",
    mueve: "Sube el CO₂ y mira el termómetro, el halo de la atmósfera y los hielos del polo.",
  },
  atmosfera: {
    titulo: "Atmósfera: el casquete exagerado",
    mira: "Las capas de la atmósfera en el borde del corte. La luz del Sol (amarilla) calienta el suelo; el suelo devuelve calor infrarrojo (rojo).",
    mueve: "Con más CO₂, más rayos rojos rebotan en la troposfera y no escapan: así funciona el efecto invernadero.",
  },
  hidrosfera: {
    titulo: "Hidrosfera: el ciclo del agua en el Golfo de México",
    mira: "El agua se evapora del Golfo, se condensa en nubes, llueve sobre la sierra y escurre de vuelta al mar.",
    mueve: "Calienta el planeta (más evaporación) o quita bosque: el agua que escurre se vuelve café, arrastra suelo (erosión) y lo deja en el mar.",
  },
  litosfera: {
    titulo: "Litosfera: el interior y las placas",
    mira: "El corte muestra la corteza, el manto que circula en celdas de convección y el núcleo. Las líneas naranjas son los límites de las placas tectónicas.",
    mueve: "Activa el volcán (Popocatépetl): la litosfera inyecta ceniza, SO₂ y CO₂ a la atmósfera.",
  },
  biosfera: {
    titulo: "Biosfera: los bosques fijan CO₂",
    mira: "Las zonas verdes son vegetación. Las partículas claras son CO₂ que la selva toma del aire por fotosíntesis.",
    mueve: "Baja la cobertura vegetal: aparecen claros cafés, sube el humo y se fija menos CO₂.",
  },
};

/* ── Interior de la Tierra (radio como fracción del radio terrestre) ────────
 * Radios reales: núcleo interno 1 221 km; límite núcleo–manto 3 480 km;
 * manto superior/inferior a 660 km de profundidad; astenósfera ~100–410 km;
 * litosfera ~100 km (corteza continental ~35 km, oceánica ~7 km). */
export const RADIO_TIERRA_KM = 6371;
export const R_NUCLEO_INTERNO = 1221 / RADIO_TIERRA_KM;   // 0.192
export const R_NUCLEO_EXTERNO = 3480 / RADIO_TIERRA_KM;   // 0.546
export const R_MANTO_INFERIOR = (RADIO_TIERRA_KM - 660) / RADIO_TIERRA_KM; // 0.896
export const R_ASTENOSFERA = (RADIO_TIERRA_KM - 410) / RADIO_TIERRA_KM;    // 0.936
export const R_LITOSFERA = 0.965;  // base de la litosfera (≈100 km, un poco engrosada)
export const R_CORTEZA = 0.982;    // base de la corteza (dibujada ~3 veces más gruesa)

export interface CapaInterior { nombre: string; rango: string; estado: string; nota: string; color: string }

export const CAPAS_INTERIOR: CapaInterior[] = [
  { nombre: "Corteza", rango: "0–35 km (oceánica ~7 km)", estado: "sólida", color: "#b08a6a",
    nota: "Es la «cáscara» donde vivimos. Junto con la parte rígida del manto superior forma la litosfera, partida en placas." },
  { nombre: "Astenósfera (manto superior)", rango: "~100–410 km", estado: "sólida pero plástica", color: "#f0a050",
    nota: "Roca caliente que fluye muy despacio: sobre ella se deslizan las placas tectónicas." },
  { nombre: "Manto", rango: "35–2 890 km", estado: "sólido, fluye en millones de años", color: "#d9592b",
    nota: "Sus corrientes de convección —roca caliente que sube y fría que baja— arrastran las placas." },
  { nombre: "Núcleo externo", rango: "2 890–5 150 km", estado: "líquido (hierro y níquel)", color: "#ffb030",
    nota: "Su movimiento genera el campo magnético que nos protege del viento solar." },
  { nombre: "Núcleo interno", rango: "5 150–6 371 km", estado: "sólido, ~5 400 °C", color: "#fff1b0",
    nota: "Hierro y níquel tan comprimidos que siguen sólidos aunque están tan calientes como la superficie del Sol." },
];

/* ── Capas de la atmósfera (alturas reales; en la escena, exageradas) ────── */
export interface CapaAtmosfera { nombre: string; rango: string; nota: string; color: string }

export const CAPAS_ATMOSFERA: CapaAtmosfera[] = [
  { nombre: "Troposfera", rango: "0–12 km", color: "#6fb8ff",
    nota: "Aquí está casi todo el vapor de agua, las nubes y el clima. Los gases de efecto invernadero retienen aquí el calor." },
  { nombre: "Estratosfera", rango: "12–50 km", color: "#8f7bff",
    nota: "Contiene la capa de ozono (15–35 km), que absorbe la radiación ultravioleta del Sol." },
  { nombre: "Mesosfera", rango: "50–85 km", color: "#4a64d8",
    nota: "La capa más fría: ahí se queman la mayoría de los meteoros (estrellas fugaces)." },
  { nombre: "Termosfera", rango: "85–600 km", color: "#b06ad8",
    nota: "Muy poco aire y muy caliente; ahí ocurren las auroras y orbita la Estación Espacial." },
];

/** Altura DIBUJADA de cada límite (fracción del radio, sobre la superficie). */
export const ALT_ATMOS = { tropo: 0.06, ozonoBase: 0.075, ozonoTope: 0.11, estrato: 0.15, meso: 0.22, termo: 0.32 } as const;

/* ── Lugares (longitud, latitud en grados) ───────────────────────────────── */
export type LonLat = readonly [number, number];
export const LUGAR = {
  popocatepetl: [-98.6, 19.0] as LonLat,
  golfo: [-91.5, 24.5] as LonLat,
  nube: [-97.2, 21.6] as LonLat,
  sierra: [-99.4, 20.4] as LonLat,
  desembocadura: [-97.6, 22.3] as LonLat,
  amazonia: [-62, -5] as LonLat,
  permafrostAlaska: [-145, 66] as LonLat,
  permafrostCanada: [-112, 66] as LonLat,
};

/* ── Límites de placas (trazo APROXIMADO de los principales) ─────────────── */
export const LIMITES_PLACAS: { nombre: string; tipo: "divergente" | "convergente" | "transformante"; pts: LonLat[] }[] = [
  { nombre: "Dorsal Mesoatlántica", tipo: "divergente", pts: [
    [5, 74], [-8, 71], [-18, 66], [-24, 62], [-30, 57], [-33, 52], [-29, 46], [-28, 39], [-36, 33], [-42, 26], [-46, 18],
    [-45, 12], [-38, 8], [-30, 3], [-20, 0], [-14, -5], [-13, -12], [-14, -20], [-13, -28], [-15, -36], [-16, -44], [-10, -50], [-2, -54]] },
  { nombre: "Fosa de las Aleutianas y costa del Pacífico de Norteamérica", tipo: "convergente", pts: [
    [165, 54], [175, 51], [-175, 51], [-165, 53], [-155, 56], [-148, 59], [-138, 58], [-132, 53], [-128, 49], [-125, 44], [-124, 40],
    [-121, 36], [-117, 33], [-113, 30], [-109, 25]] },
  { nombre: "Fosa Mesoamericana", tipo: "convergente", pts: [
    [-106, 20], [-103, 18], [-100, 16.5], [-96, 15.3], [-92, 14], [-88, 12.5], [-85, 10], [-83, 7.5]] },
  { nombre: "Fosa de Perú–Chile", tipo: "convergente", pts: [
    [-80, 2], [-81, -5], [-78, -11], [-74, -16], [-71.5, -21], [-71.2, -27], [-72.5, -34], [-74, -40], [-75.5, -47], [-75, -53]] },
  { nombre: "Dorsal del Pacífico Oriental", tipo: "divergente", pts: [
    [-109, 22], [-106, 16], [-104, 9], [-102.5, 2], [-104, -8], [-110, -17], [-113, -27], [-111, -36], [-115, -46], [-120, -55],
    [-135, -59], [-150, -62], [-170, -63], [172, -62], [155, -60]] },
  { nombre: "Rift de Galápagos", tipo: "divergente", pts: [[-102.5, 2], [-95, 2.2], [-86, 1.5]] },
  { nombre: "Fosas de Kamchatka, Japón y las Marianas", tipo: "convergente", pts: [
    [163, 57], [159, 51], [153, 46.5], [147, 42.5], [143, 38], [142, 33], [142.5, 28], [144, 22], [147, 16], [145.5, 12], [141, 10.5]] },
  { nombre: "Fosas de Ryukyu y Filipinas", tipo: "convergente", pts: [[132, 32], [129, 27.5], [124.5, 22.5], [126.5, 13], [127.5, 5]] },
  { nombre: "Fosa de Tonga–Kermadec", tipo: "convergente", pts: [[-173, -15], [-175, -22], [-177, -30], [-179, -37], [177, -41], [173, -45], [167, -49]] },
  { nombre: "Fosa de la Sonda", tipo: "convergente", pts: [[95, 15], [94, 6], [97, 0], [101, -5], [106, -9.5], [113, -11], [120, -11], [127, -8.5], [132, -6]] },
  { nombre: "Melanesia", tipo: "convergente", pts: [[140, -3.5], [148, -6], [155, -7.5], [161, -10.5], [166.5, -14.5], [170, -21]] },
  { nombre: "Cinturón Alpino–Himalaya", tipo: "convergente", pts: [
    [-10, 36], [0, 36.5], [10, 37.5], [20, 37], [28, 35], [35, 36.5], [42, 38], [48, 34], [55, 28], [62, 26], [68, 29.5], [73, 34], [80, 31], [88, 28], [95, 27.5], [97, 21], [95, 15]] },
  { nombre: "Mar Rojo y dorsal Índica Central", tipo: "divergente", pts: [
    [34, 28], [38, 21], [42, 14.5], [45, 12], [51, 13.5], [57, 14], [60, 10], [66, 3], [69, -4], [67, -13], [65, -20], [63, -26]] },
  { nombre: "Dorsal Índica Sudoriental", tipo: "divergente", pts: [[63, -26], [72, -31], [80, -37], [95, -42], [110, -48], [128, -50], [145, -55], [155, -60]] },
  { nombre: "Dorsal Índica Sudoccidental", tipo: "divergente", pts: [[63, -26], [52, -33], [40, -40], [30, -45], [15, -52], [-2, -54]] },
  { nombre: "Rift de África Oriental", tipo: "divergente", pts: [[42, 11], [39, 5], [36.5, -1], [35, -8], [34, -14]] },
];

/**
 * Efecto invernadero del casquete: fracción del infrarrojo que la troposfera
 * devuelve al suelo según el CO₂ efectivo (ppm). Cualitativa y monótona:
 * ~25 % en 1850 (280 ppm), ~50 % hoy, ~70 % al duplicar el CO₂; tope 85 %.
 */
export function retencionInfrarrojo(co2eff: number): number {
  const r = 0.25 + 0.45 * (Math.log(Math.max(co2eff, 1) / 280) / Math.log(2));
  return Math.min(0.85, Math.max(0.15, r));
}

/**
 * Datos para el laboratorio "Biomas y ecosistemas: clima → vida"
 * (CNEYT-III-P01-A1, infografía; UAC CNEYT-III "Ecosistemas, interacciones y
 * energía"; progresión 1: "Describe los componentes y características de los
 * principales biomas y ecosistemas del planeta"). Módulo de DATOS PUROS (sin
 * three, sin react): lo comparten el shell de UI (LabBiomas.tsx) y la escena 3D
 * (BiomasScene.tsx).
 *
 * Idea pedagógica (MCCEMS 2025 — CNEYT-III P1): un BIOMA es una gran región
 * caracterizada por su vegetación dominante, clima y comunidad de seres vivos.
 * Lo que determina qué bioma se forma en un lugar es, sobre todo, el CLIMA: la
 * temperatura media anual y la precipitación. Este laboratorio convierte esa
 * idea en un explorador tipo "diagrama de Whittaker": el alumno mueve la
 * temperatura y la lluvia y ve qué bioma emerge, anclado a ejemplos REALES de
 * México —el país megadiverso con 12 de los 14 biomas terrestres— con su flora,
 * su fauna emblemática y su estado de conservación (datos verbatim CONABIO 2023,
 * CONAFOR 2020 y SEMARNAT 2022).
 *
 * ⚠️ MODELO CUALITATIVO. Los umbrales de temperatura/precipitación son
 * APROXIMADOS y didácticos (basados en el esquema clásico de Whittaker): sirven
 * para mostrar la RELACIÓN clima→bioma, no para clasificar un sitio con
 * precisión. El manglar, además, depende de ser costa salobre y no solo del
 * clima; aquí se representa en el extremo cálido y muy húmedo como aproximación.
 */

/* ── Controles (ejes del diagrama de Whittaker) ──────────────────────────── */
export const TEMP_MIN = -5, TEMP_MAX = 30, TEMP_STEP = 1, TEMP_DEFAULT = 22;        // °C, temperatura media anual
export const PRECIP_MIN = 0, PRECIP_MAX = 4000, PRECIP_STEP = 50, PRECIP_DEFAULT = 800; // mm/año, precipitación anual

/* ── Clasificación del bioma a partir del clima (DETERMINISTA) ───────────── */
export type BiomaKey =
  | "tundra" | "bosque_templado" | "pastizal"
  | "desierto" | "selva_seca" | "selva_humeda" | "manglar";

/**
 * Devuelve el bioma para una temperatura media anual (°C) y una precipitación
 * anual (mm), siguiendo umbrales cualitativos al estilo Whittaker.
 */
export const biomaDe = (temp: number, precip: number): BiomaKey => {
  if (temp <= 2) return "tundra";                       // muy frío: alta montaña
  if (temp <= 13) return precip < 400 ? "pastizal" : "bosque_templado";
  // cálido (temp > 13 °C)
  if (precip < 250) return "desierto";
  if (precip < 1000) return "selva_seca";
  if (precip < 2600) return "selva_humeda";
  return "manglar";                                     // cálido + muy húmedo (costa)
};

/* ── Los biomas (anclados a ejemplos de México, datos verbatim) ──────────── */
export interface Bioma {
  key: BiomaKey;
  nombre: string;
  icono: string;       // Font Awesome 6 Free solid
  colorSuelo: string;  // color del terreno en la escena
  colorVeg: string;    // color de la vegetación
  tipoVeg: "tundra" | "conifera" | "pasto" | "cactus" | "selvaSeca" | "selva" | "manglar";
  densidad: number;    // 0–1: fracción de vegetación visible en el diorama
  agua: boolean;       // ¿el diorama se inunda (manglar)?
  resumen: string;
  ejemploMx: string;   // ejemplo mexicano emblemático
  especies: string[];  // fauna/flora representativa
  dato: string;        // cifra/dato verbatim
}

export const BIOMAS: Record<BiomaKey, Bioma> = {
  tundra: {
    key: "tundra", nombre: "Tundra alpina / zacatonal de alta montaña", icono: "fa-snowflake",
    colorSuelo: "#8a98a6", colorVeg: "#9fb98e", tipoVeg: "tundra", densidad: 0.45, agua: false,
    resumen: "Frío extremo y suelo casi sin árboles: solo pastos duros (zacatón), musgos y líquenes resisten sobre las cumbres.",
    ejemploMx: "Cumbres del Pico de Orizaba e Iztaccíhuatl (zacatonal alpino).",
    especies: ["Conejo de los volcanes (teporingo)", "Musgos y líquenes", "Gorrión serrano"],
    dato: "Vegetación de muy alta montaña, arriba del límite del bosque.",
  },
  bosque_templado: {
    key: "bosque_templado", nombre: "Bosque templado (coníferas y encinos)", icono: "fa-tree",
    colorSuelo: "#5c6b3f", colorVeg: "#2f6b3a", tipoVeg: "conifera", densidad: 0.95, agua: false,
    resumen: "Clima fresco y lluvia suficiente: dominan pinos y encinos. Forma los grandes bosques de montaña de México.",
    ejemploMx: "Sierra Madre Occidental y bosques de Oaxaca y Michoacán.",
    especies: ["Oso negro", "Cotorra serrana", "Pino y encino", "Mariposa monarca (hibernación)"],
    dato: "Hábitat de la mariposa monarca en su santuario de Michoacán.",
  },
  pastizal: {
    key: "pastizal", nombre: "Pastizal", icono: "fa-wheat-awn",
    colorSuelo: "#9e8a3f", colorVeg: "#c9b85a", tipoVeg: "pasto", densidad: 0.9, agua: false,
    resumen: "Temperatura templada y poca lluvia: el agua no alcanza para árboles, así que domina el mar de pastos.",
    ejemploMx: "Pastizales del altiplano y norte de México.",
    especies: ["Berrendo", "Perro llanero", "Águila real", "Perrito de la pradera"],
    dato: "Hogar del berrendo, uno de los mamíferos más veloces de América.",
  },
  desierto: {
    key: "desierto", nombre: "Desierto y matorral xerófilo", icono: "fa-sun-plant-wilt",
    colorSuelo: "#d8b777", colorVeg: "#6f9a55", tipoVeg: "cactus", densidad: 0.4, agua: false,
    resumen: "Mucho calor y casi nada de lluvia: la vida se adapta para guardar agua. Las cactáceas reinan aquí.",
    ejemploMx: "Desierto Chihuahuense, el más grande de Norteamérica.",
    especies: ["Borrego cimarrón", "Cactáceas (>900 especies)", "Correcaminos", "Águila real"],
    dato: "El desierto más biodiverso del mundo en cactáceas: más de 900 especies, muchas endémicas.",
  },
  selva_seca: {
    key: "selva_seca", nombre: "Selva seca (bosque tropical caducifolio)", icono: "fa-leaf",
    colorSuelo: "#a98a4a", colorVeg: "#7fae4c", tipoVeg: "selvaSeca", densidad: 0.7, agua: false,
    resumen: "Calor todo el año pero con una larga sequía: los árboles tiran la hoja en secas y reverdecen con las lluvias.",
    ejemploMx: "Costa del Pacífico, como Chamela (Jalisco).",
    especies: ["Iguana verde", "Ceiba", "Jaguarundi", "Guacamaya verde"],
    dato: "Uno de los ecosistemas más amenazados y con mayor endemismo de México.",
  },
  selva_humeda: {
    key: "selva_humeda", nombre: "Selva húmeda (selva tropical)", icono: "fa-tree",
    colorSuelo: "#3f5a2a", colorVeg: "#1f7a3a", tipoVeg: "selva", densidad: 1.0, agua: false,
    resumen: "Calor y lluvia abundante todo el año: la mayor explosión de vida. Árboles altísimos en varios pisos y máxima biodiversidad.",
    ejemploMx: "Selva Lacandona (Chiapas), ~600,000 ha.",
    especies: ["Jaguar", "Quetzal", "Mono aullador", "Más de 3,000 plantas y 450 aves"],
    dato: "Mayor remanente de selva tropical húmeda de Mesoamérica en México: >3,000 plantas y 450 aves.",
  },
  manglar: {
    key: "manglar", nombre: "Manglar y humedal costero", icono: "fa-water",
    colorSuelo: "#5a7a55", colorVeg: "#2f7d5e", tipoVeg: "manglar", densidad: 0.85, agua: true,
    resumen: "Bosque que crece con las raíces en agua salobre, entre la tierra y el mar. Criadero de peces y barrera contra huracanes.",
    ejemploMx: "Campeche, Yucatán y Quintana Roo (~775,000 ha en el país).",
    especies: ["Flamenco rosa", "Cocodrilo de pantano", "Garza", "Manatí"],
    dato: "México es el 4.º país con mayor extensión de manglar: ~775,000 hectáreas.",
  },
};

/** Lista ordenada (de frío a cálido) para paneles. */
export const BIOMAS_LISTA: Bioma[] = [
  BIOMAS.tundra, BIOMAS.bosque_templado, BIOMAS.pastizal,
  BIOMAS.desierto, BIOMAS.selva_seca, BIOMAS.selva_humeda, BIOMAS.manglar,
];

/* ── Escenarios guiados (climas reales de biomas mexicanos) ──────────────── */
export interface EscenarioBioma {
  label: string;
  icono: string;
  temp: number;
  precip: number;
  desc: string;
}

export const ESCENARIOS: EscenarioBioma[] = [
  { label: "Selva Lacandona", icono: "fa-tree", temp: 25, precip: 3000,
    desc: "Cálido y muy lluvioso: la selva húmeda de Chiapas." },
  { label: "Desierto Chihuahuense", icono: "fa-sun-plant-wilt", temp: 20, precip: 250,
    desc: "Caluroso y árido: el reino de las cactáceas." },
  { label: "Bosque de Michoacán", icono: "fa-tree", temp: 12, precip: 1000,
    desc: "Fresco y húmedo: pinos y encinos, santuario de la monarca." },
  { label: "Pastizal del norte", icono: "fa-wheat-awn", temp: 16, precip: 350,
    desc: "Templado y seco: mar de pastos del altiplano." },
  { label: "Manglar de Yucatán", icono: "fa-water", temp: 26, precip: 3500,
    desc: "Cálido y costero: bosque con raíces en agua salobre." },
  { label: "Cumbre del Orizaba", icono: "fa-snowflake", temp: -2, precip: 600,
    desc: "Frío de alta montaña: zacatonal alpino sobre el bosque." },
];

/* ── México megadiverso: cifras destacadas (verbatim) ────────────────────── */
export const CIFRAS_MX: { valor: string; texto: string; icono: string }[] = [
  { valor: "10–12%", texto: "de la biodiversidad mundial (en solo 1.5% del territorio)", icono: "fa-earth-americas" },
  { valor: "12 de 14", texto: "biomas terrestres del planeta están en México", icono: "fa-layer-group" },
  { valor: "182", texto: "Áreas Naturales Protegidas federales (11.6% del territorio)", icono: "fa-shield-halved" },
  { valor: "126,000+", texto: "especies registradas (SNIB/CONABIO); 30–50% endémicas", icono: "fa-paw" },
];

/* ── Megadiversidad y conservación: datos verbatim para el panel ─────────── */
export const DATOS_MX: string[] = [
  "México es uno de los cinco países megadiversos (con Brasil, Indonesia, Colombia y China), por su posición entre las regiones Neártica y Neotropical.",
  "Las zonas áridas y semiáridas cubren el 60% del territorio mexicano.",
  "El Sistema Arrecifal Mesoamericano es el segundo del mundo; la blanqueación de 2023 dañó el 80% del coral de Cozumel (temperaturas de 33 °C).",
  "La pérdida neta de bosques y selvas fue de ~244,000 ha por año entre 2000 y 2020 (CONAFOR/Global Forest Watch).",
  "La vaquita marina tiene menos de 10 individuos (2024); el ajolote y el quetzal son otros emblemas de la crisis de biodiversidad.",
  "El Corredor Biológico Mesoamericano conecta ANP desde el sur de México hasta Panamá para mantener los hábitats comunicados.",
];

/* ── Formato ──────────────────────────────────────────────────────────────── */
const ES = (n: number, dec: number) =>
  n.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: dec }).replace("-", "−");

export const fmt0 = (n: number): string => ES(Math.round(n), 0);
export const fmt1 = (n: number): string => ES(n, 1);

/**
 * Datos para el laboratorio "Deforestación y sus efectos"
 * (CNEYT-III-P06-A1, lectura; UAC CNEYT-III "Ecosistemas, interacciones y
 * energía"; progresión 6: "Investiga el deterioro ambiental en sus escalas
 * local, regional y global (contaminación, deforestación, cambio climático)").
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabDeforestacion.tsx) y la escena 3D (DeforestacionScene.tsx).
 *
 * Idea pedagógica (MCCEMS 2025 — CNEYT-III P6): la deforestación no es solo
 * "perder árboles". Un bosque presta SERVICIOS ECOSISTÉMICOS —fija carbono,
 * alberga biodiversidad, regula el ciclo hídrico y sujeta el suelo—, así que al
 * talarlo todos esos servicios caen a la vez. Además entra en una TRAMPA DE
 * SINERGIAS: menos bosque → menos CO₂ absorbido → más calentamiento → más
 * sequías e incendios → más deforestación (ciclo vicioso). La restauración
 * (reforestación comunitaria, corredores biológicos, agroecología) revierte
 * parte del daño.
 *
 * ⚠️ MODELO DIDÁCTICO. Los porcentajes de servicios ecosistémicos son RELATIVOS
 * a un bosque intacto (cualitativos), para mostrar la DIRECCIÓN y proporción de
 * los efectos, no medidas de un sitio concreto. Las cifras nacionales (92,000
 * ha/año, causas 55/28/17 %, regiones) son verbatim de la actividad (CONAFOR 2023).
 */

/* ── Controles ───────────────────────────────────────────────────────────── */
export const COB_MIN = 0, COB_MAX = 100, COB_STEP = 5, COB_DEFAULT = 100;   // % cobertura forestal del predio
export const REF_MIN = 0, REF_MAX = 100, REF_STEP = 5, REF_DEFAULT = 0;     // % de restauración del área perdida

/* ── Causas de la deforestación (verbatim CONAFOR 2023) ───────────────────── */
export type CausaKey = "ganaderia" | "agricultura" | "tala";

export interface Causa {
  key: CausaKey;
  nombre: string;
  porcentaje: number;   // % de la deforestación nacional
  icono: string;        // Font Awesome 6 Free solid
  color: string;
  reemplazo: string;    // en qué queda convertido el bosque
  humoColor: string;    // color de las partículas que se elevan del área talada
  descripcion: string;
}

export const CAUSAS: Causa[] = [
  {
    key: "ganaderia", nombre: "Ganadería extensiva", porcentaje: 55,
    icono: "fa-cow", color: "#f59e0b", reemplazo: "Potreros para ganado", humoColor: "#9aa0a6",
    descripcion: "Principal causa en México: se tala el bosque para abrir potreros. El suelo, sin raíces que lo sujeten, se compacta y empobrece.",
  },
  {
    key: "agricultura", nombre: "Roza-tumba-quema", porcentaje: 28,
    icono: "fa-fire", color: "#ef4444", reemplazo: "Parcelas quemadas", humoColor: "#ff7847",
    descripcion: "Se corta y se quema la vegetación para sembrar. El fuego libera de golpe el carbono almacenado y puede salirse de control.",
  },
  {
    key: "tala", nombre: "Tala ilegal", porcentaje: 17,
    icono: "fa-person-digging", color: "#a16207", reemplazo: "Tocones y claros", humoColor: "#b0b6bd",
    descripcion: "Extracción clandestina de madera sin manejo ni reposición. Fragmenta el bosque y abre paso a más deterioro.",
  },
];

export const causaDe = (k: CausaKey): Causa => CAUSAS.find((c) => c.key === k) ?? CAUSAS[0]!;

/* ── Cobertura efectiva (deforestación + restauración) ────────────────────── */
/** La restauración recupera una fracción del área perdida. */
export function coberturaEfectiva(cobertura: number, restauracion: number): number {
  const perdido = 100 - cobertura;
  return Math.min(100, Math.max(0, cobertura + (restauracion / 100) * perdido));
}

/* ── Servicios ecosistémicos (efectos de la deforestación) ────────────────── */
export interface Efecto {
  key: string;
  nombre: string;
  icono: string;
  color: string;
  bueno: boolean;     // true: más alto es mejor (servicio) · false: más alto es peor (daño)
  descripcion: string;
  /** valor 0–100 en función de la cobertura efectiva (%). */
  calc: (cobEf: number) => number;
}

export const EFECTOS: Efecto[] = [
  {
    key: "carbono", nombre: "Carbono fijado", icono: "fa-leaf", color: "#34D399", bueno: true,
    descripcion: "El bosque captura CO₂ y lo guarda en madera y suelo. Al talarlo deja de absorberlo y libera el ya almacenado.",
    calc: (c) => c,
  },
  {
    key: "biodiversidad", nombre: "Biodiversidad", icono: "fa-paw", color: "#a3e635", bueno: true,
    descripcion: "El bosque es hábitat de miles de especies. Al fragmentarse, la biodiversidad cae aún más rápido que la superficie.",
    calc: (c) => Math.pow(c / 100, 1.3) * 100,
  },
  {
    key: "agua", nombre: "Regulación hídrica", icono: "fa-droplet", color: "#38bdf8", bueno: true,
    descripcion: "Las raíces y la hojarasca dejan que el agua se infiltre y recarguen los acuíferos. Sin bosque, la lluvia escurre y se pierde.",
    calc: (c) => c,
  },
  {
    key: "erosion", nombre: "Erosión del suelo", icono: "fa-mountain-sun", color: "#f97316", bueno: false,
    descripcion: "Sin raíces que lo sujeten, el suelo fértil se lava con la lluvia y el viento. Es de los daños más difíciles de revertir.",
    calc: (c) => 100 - c,
  },
];

/** CO₂ liberado (índice relativo) por la pérdida de cobertura. */
export const co2Liberado = (cobEf: number): number => 100 - cobEf;
/** Riesgo de incendio (trampa de sinergias): sube con la pérdida de cobertura. */
export const riesgoIncendio = (cobEf: number): number => Math.min(100, (100 - cobEf) * 1.25);

/* ── Escenarios guiados ──────────────────────────────────────────────────── */
export interface Escenario {
  label: string;
  icono: string;
  cobertura: number;
  restauracion: number;
  causa: CausaKey;
  desc: string;
}

export const ESCENARIOS: Escenario[] = [
  { label: "Bosque intacto", icono: "fa-tree", cobertura: 100, restauracion: 0, causa: "tala", desc: "Cobertura completa: todos los servicios ecosistémicos al máximo." },
  { label: "Ganadería", icono: "fa-cow", cobertura: 45, restauracion: 0, causa: "ganaderia", desc: "Bosque convertido en potreros (55 % de la deforestación nacional)." },
  { label: "Roza-tumba-quema", icono: "fa-fire", cobertura: 60, restauracion: 0, causa: "agricultura", desc: "Parcelas abiertas con fuego (28 %): el carbono se libera de golpe." },
  { label: "Tala ilegal", icono: "fa-person-digging", cobertura: 72, restauracion: 0, causa: "tala", desc: "Extracción clandestina (17 %): el bosque queda fragmentado." },
  { label: "Restauración", icono: "fa-seedling", cobertura: 40, restauracion: 85, causa: "ganaderia", desc: "Reforestación comunitaria y corredores biológicos recuperan el área perdida." },
];

/* ── Regiones más afectadas (verbatim) ───────────────────────────────────── */
export const REGIONES: { nombre: string; lugar: string }[] = [
  { nombre: "Selva Lacandona", lugar: "Chiapas" },
  { nombre: "Sierra Madre Occidental", lugar: "Noroeste" },
  { nombre: "La Huasteca", lugar: "Golfo / centro-este" },
];

/* ── Trampa de sinergias (ciclo vicioso, verbatim) ───────────────────────── */
export const SINERGIA: { texto: string; icono: string }[] = [
  { texto: "La deforestación reduce la absorción de CO₂", icono: "fa-tree" },
  { texto: "Más CO₂ amplifica el calentamiento global", icono: "fa-temperature-arrow-up" },
  { texto: "El calor aumenta sequías e incendios forestales", icono: "fa-fire" },
  { texto: "Los incendios amplifican la deforestación", icono: "fa-arrows-spin" },
];

/* ── Soluciones (verbatim) ───────────────────────────────────────────────── */
export const SOLUCIONES: { texto: string; icono: string }[] = [
  { texto: "Reforestación comunitaria (brigadas del CONAFOR)", icono: "fa-seedling" },
  { texto: "Corredores biológicos que reconectan ecosistemas fragmentados", icono: "fa-bridge" },
  { texto: "Agricultura agroecológica que evita el desmonte", icono: "fa-wheat-awn" },
  { texto: "Manejo de los territorios por comunidades indígenas", icono: "fa-people-group" },
];

/* ── Cifras de México (verbatim, CONAFOR 2023 / Constitución) ─────────────── */
export const CIFRAS_MX: { valor: string; texto: string; icono: string }[] = [
  { valor: "92,000 ha", texto: "de bosque y selva pierde México cada año (CONAFOR 2023)", icono: "fa-tree" },
  { valor: "55 %", texto: "de la deforestación se debe a la ganadería extensiva", icono: "fa-cow" },
  { valor: "> 70 %", texto: "de su masa han perdido los glaciares del Iztaccíhuatl y el Pico de Orizaba en un siglo", icono: "fa-mountain" },
  { valor: "Art. 4°", texto: "la Constitución reconoce el derecho a un medio ambiente sano (desde 2012)", icono: "fa-scale-balanced" },
];

/* ── Ideas clave ─────────────────────────────────────────────────────────── */
export const IDEAS: string[] = [
  "Un bosque no es solo árboles: presta servicios ecosistémicos —fija carbono, alberga biodiversidad, regula el agua y sujeta el suelo—.",
  "Al deforestar, todos esos servicios caen a la vez; la biodiversidad cae aún más rápido por la fragmentación del hábitat.",
  "En México la causa principal es la ganadería extensiva (55 %), seguida de la roza-tumba-quema (28 %) y la tala ilegal (17 %).",
  "Trampa de sinergias: menos bosque → más CO₂ → más calor → más incendios → más deforestación (ciclo vicioso).",
  "El suelo erosionado es de los daños más difíciles de revertir: puede tardar décadas en recuperarse.",
  "La restauración (reforestación, corredores, agroecología, manejo comunitario) funciona cuando se articula con políticas públicas.",
];

/* ── Formato ─────────────────────────────────────────────────────────────── */
const ES = (n: number, dec: number) =>
  n.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: dec }).replace("-", "−");

export const fmt0 = (n: number): string => ES(Math.round(n), 0);
export const fmt1 = (n: number): string => ES(n, 1);

/**
 * Datos para el laboratorio "Redes tróficas y flujo de energía"
 * (CNEYT-III-P02-A1, lectura; UAC CNEYT-III "Ecosistemas, interacciones y
 * energía"; progresión 2: "Explica el flujo de energía y el ciclo de materia
 * en los ecosistemas (cadenas y redes tróficas)"). Módulo de DATOS PUROS (sin
 * three, sin react): lo comparten el shell de UI (LabTroficas.tsx) y la escena
 * 3D (TroficasScene.tsx).
 *
 * Idea pedagógica (MCCEMS 2025 — CNEYT-III P2): la energía entra al ecosistema
 * por el Sol, los PRODUCTORES la fijan por fotosíntesis y de ahí sube por los
 * niveles tróficos (primarios → secundarios → terciarios). Pero la transferencia
 * es ineficiente: la EFICIENCIA ECOLÓGICA es de solo 5–20% (la "regla del 10%"),
 * así que ~90% se pierde como CALOR en cada paso (respiración, movimiento, calor
 * corporal, heces). Por eso las pirámides tróficas se estrechan hacia arriba: un
 * ecosistema sostiene muchos más herbívoros que carnívoros. Los DESCOMPONEDORES
 * cierran el ciclo de la materia devolviendo nutrientes al suelo.
 *
 * Este laboratorio convierte esa idea en una pirámide de energía 3D: el alumno
 * fija la energía de los productores y la eficiencia, y ve subir la energía como
 * partículas verdes mientras el calor perdido se escapa en naranja en cada nivel.
 *
 * ⚠️ MODELO DIDÁCTICO. La "regla del 10%" es una simplificación reconocida; la
 * eficiencia real varía (5–20%). Las kcal son valores de referencia para mostrar
 * la PROPORCIÓN entre niveles, no medidas de un ecosistema concreto.
 */

/* ── Controles ───────────────────────────────────────────────────────────── */
export const ENERGIA_MIN = 1000, ENERGIA_MAX = 50000, ENERGIA_STEP = 1000, ENERGIA_DEFAULT = 10000; // kcal/m²·año fijadas por los productores
export const EF_MIN = 5, EF_MAX = 20, EF_STEP = 1, EF_DEFAULT = 10; // % eficiencia ecológica (regla del 10%)

/* ── Niveles tróficos ────────────────────────────────────────────────────── */
export type NivelKey = "productores" | "primarios" | "secundarios" | "terciarios";

export interface NivelInfo {
  key: NivelKey;
  orden: number;     // 0 = base
  nombre: string;
  rol: string;
  icono: string;     // Font Awesome 6 Free solid
  color: string;
  descripcion: string;
}

export const NIVELES: NivelInfo[] = [
  {
    key: "productores", orden: 0, nombre: "Productores", rol: "Autótrofos",
    icono: "fa-seedling", color: "#34D399",
    descripcion: "Plantas, algas y algunas bacterias: capturan la energía del Sol por fotosíntesis y fabrican materia orgánica (glucosa). Son la base de toda red trófica.",
  },
  {
    key: "primarios", orden: 1, nombre: "Consumidores primarios", rol: "Herbívoros",
    icono: "fa-leaf", color: "#a3e635",
    descripcion: "Herbívoros: comen a los productores. Disponen de solo una fracción de la energía que estos fijaron.",
  },
  {
    key: "secundarios", orden: 2, nombre: "Consumidores secundarios", rol: "Carnívoros de 1.er orden",
    icono: "fa-fish", color: "#fbbf24",
    descripcion: "Carnívoros que comen herbívoros. La energía disponible ya cayó mucho respecto a la base.",
  },
  {
    key: "terciarios", orden: 3, nombre: "Consumidores terciarios", rol: "Depredadores tope",
    icono: "fa-crow", color: "#f97316",
    descripcion: "Depredadores de alto nivel que comen otros carnívoros. Reciben apenas una mínima parte de la energía original: por eso son pocos.",
  },
];

/** Descomponedores: cierran el ciclo de la materia (aparte de la pirámide). */
export const DESCOMPONEDORES = {
  nombre: "Descomponedores",
  rol: "Hongos y bacterias",
  icono: "fa-recycle",
  color: "#c084fc",
  descripcion: "Hongos y bacterias degradan la materia orgánica muerta de todos los niveles y devuelven los nutrientes al suelo, cerrando el ciclo de la materia para que los productores vuelvan a usarlos.",
};

/* ── Cálculo del flujo de energía ────────────────────────────────────────── */
export interface NivelCalc extends NivelInfo {
  energia: number;       // kcal disponibles en este nivel
  porcentaje: number;    // % respecto a los productores
  calorPerdido: number;  // kcal que NO pasan al siguiente nivel (se pierden como calor)
}

/**
 * Reparte la energía de los productores por los niveles según la eficiencia
 * ecológica. Eᵢ = E₀ · ef^i ; el calor perdido al subir = Eᵢ · (1 − ef).
 */
export function calcularNiveles(energia0: number, eficienciaPct: number): NivelCalc[] {
  const ef = eficienciaPct / 100;
  return NIVELES.map((nv) => {
    const energia = energia0 * Math.pow(ef, nv.orden);
    return {
      ...nv,
      energia,
      porcentaje: Math.pow(ef, nv.orden) * 100,
      calorPerdido: energia * (1 - ef),
    };
  });
}

/* ── Ecosistemas guiados (anclados a México) ─────────────────────────────── */
export type Habitat = "marino" | "bosque" | "selva";

export interface Ecosistema {
  key: string;
  nombre: string;
  icono: string;
  habitat: Habitat;
  organismos: Record<NivelKey, string[]>; // ejemplos por nivel
  descomponedor: string;
  dato: string; // dato verbatim / contexto mexicano
}

export const ECOSISTEMAS: Ecosistema[] = [
  {
    key: "mar_cortes", nombre: "Mar de Cortés", icono: "fa-water", habitat: "marino",
    organismos: {
      productores: ["Fitoplancton", "Algas marinas"],
      primarios: ["Zooplancton", "Sardina"],
      secundarios: ["Atún", "Jurel"],
      terciarios: ["Tiburón", "Orca"],
    },
    descomponedor: "Bacterias marinas",
    dato: "El Mar de Cortés —'el acuario del mundo' (Cousteau)— reúne más de 900 especies de peces, 32 de cetáceos y millones de aves marinas migratorias.",
  },
  {
    key: "bosque_templado", nombre: "Bosque templado", icono: "fa-tree", habitat: "bosque",
    organismos: {
      productores: ["Pinos y encinos", "Pastos"],
      primarios: ["Venado cola blanca", "Conejo"],
      secundarios: ["Zorro gris", "Coyote"],
      terciarios: ["Puma", "Águila real"],
    },
    descomponedor: "Hongos del suelo",
    dato: "En los bosques templados de México (Sierra Madre, Michoacán) la energía del Sol sostiene desde el pino hasta el puma, pasando por el venado.",
  },
  {
    key: "selva_humeda", nombre: "Selva húmeda", icono: "fa-leaf", habitat: "selva",
    organismos: {
      productores: ["Árboles de selva", "Helechos"],
      primarios: ["Mono aullador", "Tapir"],
      secundarios: ["Ocelote", "Boa"],
      terciarios: ["Jaguar", "Águila arpía"],
    },
    descomponedor: "Hongos y bacterias",
    dato: "En la Selva Lacandona, la altísima productividad de las plantas sostiene una de las redes tróficas más complejas de México, coronada por el jaguar.",
  },
];

/* ── Datos de México (megadiversidad marina, verbatim) ───────────────────── */
export const DATOS_MX: { valor: string; texto: string; icono: string }[] = [
  { valor: "14%", texto: "de todas las especies marinas del planeta viven en aguas de México", icono: "fa-fish" },
  { valor: "900+", texto: "especies de peces en el Mar de Cortés, el 'acuario del mundo'", icono: "fa-water" },
  { valor: "32", texto: "especies de cetáceos (ballenas y delfines) en el Mar de Cortés", icono: "fa-otter" },
  { valor: "~90%", texto: "de la energía se pierde como calor al subir de un nivel al siguiente", icono: "fa-fire" },
];

/* ── Ideas clave para el panel ───────────────────────────────────────────── */
export const IDEAS: string[] = [
  "Toda la energía viene del Sol: los productores la fijan por fotosíntesis y la convierten en materia orgánica.",
  "Eficiencia ecológica: solo el 5–20% de la energía pasa de un nivel al siguiente (la 'regla del 10%' es la simplificación didáctica).",
  "El ~90% restante se pierde como calor en la respiración, el movimiento, el calor corporal y las heces.",
  "Por eso las pirámides se estrechan: un ecosistema sostiene muchos más herbívoros que carnívoros tope.",
  "Comer del primer nivel (plantas) es más eficiente: evita las pérdidas de los niveles intermedios.",
  "Los descomponedores cierran el ciclo de la materia devolviendo nutrientes al suelo.",
];

/* ── Formato ─────────────────────────────────────────────────────────────── */
const ES = (n: number, dec: number) =>
  n.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: dec }).replace("-", "−");

export const fmt0 = (n: number): string => ES(Math.round(n), 0);
export const fmt1 = (n: number): string => ES(n, 1);

/** Formatea kcal de forma legible (decimales pequeños cuando hace falta). */
export const fmtKcal = (n: number): string => {
  if (n >= 100) return ES(Math.round(n), 0);
  if (n >= 10) return ES(n, 0);
  if (n >= 1) return ES(n, 1);
  return ES(n, 2);
};

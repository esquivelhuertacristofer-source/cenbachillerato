/**
 * Datos y matemática del laboratorio "Selección natural" (CNEYT-VI-P07).
 *
 * Anclado a la actividad A2 `simulacion` "Selección natural en conejos":
 * el estudiante controla el ambiente y la presión depredadora de una población
 * de conejos con distinto color de pelaje y observa cómo cambian las
 * FRECUENCIAS ALÉLICAS a lo largo de las generaciones.
 *
 * Tres modos:
 *  (1) conejos     — selección natural sobre el color del pelaje (ancla A2).
 *  (2) tipos       — selección estabilizadora / direccional / disruptiva (A5).
 *  (3) evidencias  — estructuras homólogas: húmero–radio–cúbito–carpos–falanges
 *                    en humano, ballena y murciélago = ancestro común (A1 + A5).
 *
 * Módulo PURO: no importa three ni @react-three (vive fuera del bundle de la
 * escena, respetando el límite de 3 MiB gzipped del Worker de Cloudflare).
 */

export type Pt = [number, number, number];
export type Modo = "conejos" | "tipos" | "evidencias";

/* ── Definición de los tres modos ─────────────────────────────────────────── */
export interface ModoDef {
  id: Modo;
  etq: string;
  subtitulo: string;
  icono: string;
  color: string;
  fuente: "A2" | "A5" | "A1";
}
export const MODOS_DEF: Record<Modo, ModoDef> = {
  conejos: {
    id: "conejos",
    etq: "Selección natural",
    subtitulo: "Conejos y depredación",
    icono: "fa-paw",
    color: "#34d399",
    fuente: "A2",
  },
  tipos: {
    id: "tipos",
    etq: "Tipos de selección",
    subtitulo: "Estabiliz. · direcc. · disrupt.",
    icono: "fa-chart-column",
    color: "#fbbf24",
    fuente: "A5",
  },
  evidencias: {
    id: "evidencias",
    etq: "Evidencias",
    subtitulo: "Homología y ancestro común",
    icono: "fa-bone",
    color: "#38bdf8",
  fuente: "A1",
  },
};
export const MODOS: Modo[] = ["conejos", "tipos", "evidencias"];

/* ════════════════════════════════════════════════════════════════════════════
   MODO 1 — Selección natural en conejos (ancla A2)
   Modelo de genética de poblaciones: un gen, dos alelos.
     D (oscuro, dominante)  ·  d (claro, recesivo)
     Fenotipo oscuro = DD + Dd = 1 − q²   ·   claro = dd = q²   (q = frec. de d)
   El ambiente fija qué fenotipo se camufla; el depredador (coeficiente s)
   reduce la aptitud del fenotipo que resalta. Selección sobre el FENOTIPO:
     p' = p·w_o / W̄ ,  con  W̄ = w_o·(1−q²) + w_c·q²
   ════════════════════════════════════════════════════════════════════════════ */

export const MORFO_CLARO = "#e9eef4"; // pelaje claro
export const MORFO_OSCURO = "#4a3a2c"; // pelaje oscuro

export interface AmbienteDef {
  id: string;
  etq: string;
  icono: string;
  terreno: string; // color del suelo en la escena
  cielo: string;
  favorece: "claro" | "oscuro";
  descripcion: string;
}
export const AMBIENTES: AmbienteDef[] = [
  {
    id: "pradera",
    etq: "Pradera",
    icono: "fa-seedling",
    terreno: "#3f6f3a",
    cielo: "#1a3326",
    favorece: "oscuro",
    descripcion:
      "Suelo y vegetación oscuros: el pelaje oscuro se camufla y sobrevive; el claro resalta y es presa fácil.",
  },
  {
    id: "nieve",
    etq: "Campo nevado",
    icono: "fa-snowflake",
    terreno: "#dbe7f0",
    cielo: "#24344a",
    favorece: "claro",
    descripcion:
      "Nieve blanca: el pelaje claro se camufla y sobrevive; el oscuro resalta contra el blanco y es cazado.",
  },
  {
    id: "volcanico",
    etq: "Malpaís volcánico",
    icono: "fa-mountain",
    terreno: "#2b2620",
    cielo: "#241c1c",
    favorece: "oscuro",
    descripcion:
      "Roca volcánica oscura (malpaís): el pelaje oscuro se camufla; el claro resalta sobre la lava negra.",
  },
];
export function ambientePorId(id: string): AmbienteDef {
  return AMBIENTES.find((a) => a.id === id) ?? AMBIENTES[0]!;
}

export interface PredacionDef {
  id: string;
  etq: string;
  s: number; // coeficiente de selección contra el fenotipo que resalta
  predadores: number;
}
export const PREDACION: PredacionDef[] = [
  { id: "baja", etq: "Baja", s: 0.2, predadores: 1 },
  { id: "media", etq: "Media", s: 0.42, predadores: 2 },
  { id: "alta", etq: "Alta", s: 0.65, predadores: 3 },
];
export function predacionPorId(id: string): PredacionDef {
  return PREDACION.find((p) => p.id === id) ?? PREDACION[1]!;
}

export const MAXGEN_CONEJOS = 12;
export const P0_DEFECTO = 0.5; // frecuencia inicial del alelo D (oscuro)
export const POBLACION_TOTAL = 24;

export interface Generacion {
  gen: number;
  pD: number; // frecuencia del alelo D (oscuro)
  qd: number; // frecuencia del alelo d (claro)
  fOscuro: number; // frecuencia del FENOTIPO oscuro = 1 − q²
  fClaro: number; // frecuencia del FENOTIPO claro = q²
  wbar: number; // aptitud media de la población
}

/**
 * Trayectoria de las frecuencias alélicas a lo largo de las generaciones,
 * dada la presión depredadora (s) y el fenotipo que favorece el ambiente.
 */
export function simular(
  favorece: "claro" | "oscuro",
  s: number,
  p0: number = P0_DEFECTO,
  gens: number = MAXGEN_CONEJOS,
): Generacion[] {
  const wO = favorece === "oscuro" ? 1 : 1 - s; // aptitud fenotipo oscuro
  const wC = favorece === "claro" ? 1 : 1 - s; // aptitud fenotipo claro
  const out: Generacion[] = [];
  let p = Math.min(0.999, Math.max(0.001, p0));
  for (let g = 0; g <= gens; g++) {
    const q = 1 - p;
    const fClaro = q * q;
    const fOscuro = 1 - fClaro;
    const wbar = wO * fOscuro + wC * fClaro;
    out.push({ gen: g, pD: p, qd: q, fOscuro, fClaro, wbar });
    // selección → nueva frecuencia del alelo D
    p = (p * wO) / wbar;
  }
  return out;
}

/** Posiciones fijas (esparcidas) de los conejos sobre el terreno. */
export const RABBIT_SLOTS: { pos: Pt; rot: number }[] = (() => {
  const slots: { pos: Pt; rot: number }[] = [];
  const cols = 6;
  const rows = 4;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const jx = Math.sin(i * 2.3994) * 0.55; // dispersión determinista
      const jz = Math.cos(i * 1.7321) * 0.45;
      const x = (c - (cols - 1) / 2) * 1.7 + jx;
      const z = (r - (rows - 1) / 2) * 1.85 + jz;
      slots.push({ pos: [x, 0, z], rot: Math.sin(i * 5.1) * Math.PI });
    }
  }
  return slots;
})();

/* Texto verbatim de la actividad A2 (descripcion + preguntas_reflexion). */
export const A2_DESCRIPCION =
  "El estudiante controla variables de una población de conejos con distinto color de pelaje en ambientes cambiantes y observa cómo la presión depredadora cambia las frecuencias alélicas a lo largo de generaciones.";
export const PREGUNTAS_A2: string[] = [
  "¿Que le sucederia a la poblacion si el ambiente cambiara bruscamente de pradera a campo nevado?",
  "¿Por que la seleccion natural no puede crear variacion nueva, solo actuar sobre la existente?",
  "¿Como ilustra esta simulacion los cuatro postulados de Darwin?",
];

/* Los cuatro postulados de la selección natural (verbatim de la lectura A1). */
export interface Postulado {
  n: number;
  texto: string;
}
export const POSTULADOS: Postulado[] = [
  { n: 1, texto: "existe variación heredable en las poblaciones" },
  { n: 2, texto: "los individuos producen más descendencia de la que puede sobrevivir" },
  { n: 3, texto: "algunos rasgos aumentan la probabilidad de sobrevivir y reproducirse" },
  { n: 4, texto: "los rasgos favorables se hacen más frecuentes en la población con el tiempo" },
];

/* ════════════════════════════════════════════════════════════════════════════
   MODO 2 — Tipos de selección natural (A5)
   Distribución de un rasgo cuantitativo (9 clases) reformada por la selección.
   ════════════════════════════════════════════════════════════════════════════ */

export const BINS = 9;
export const MAXGEN_TIPOS = 8;
const INIT_DIST: number[] = [2, 5, 11, 18, 28, 18, 11, 5, 2]; // ~campana, suma 100

export interface TipoSelDef {
  id: string;
  etq: string;
  icono: string;
  color: string;
  definicion: string; // verbatim A5
  ejemplo: string;
}
export const TIPOS_SEL: TipoSelDef[] = [
  {
    id: "estabilizadora",
    etq: "Estabilizadora",
    icono: "fa-mountain",
    color: "#34d399",
    definicion: "favorece fenotipos intermedios, reduce la varianza (ej: peso al nacer en humanos)",
    ejemplo:
      "Peso al nacer en humanos (~3.3 kg): los bebés de talla intermedia tienen mayor supervivencia; muy grandes o muy pequeños, mayor riesgo.",
  },
  {
    id: "direccional",
    etq: "Direccional",
    icono: "fa-arrow-trend-up",
    color: "#fbbf24",
    definicion: "favorece un extremo del rango fenotípico (ej: resistencia a antibióticos)",
    ejemplo:
      "Resistencia a antibióticos: las bacterias más resistentes sobreviven y el rango se desplaza hacia mayor resistencia.",
  },
  {
    id: "disruptiva",
    etq: "Disruptiva",
    icono: "fa-arrows-left-right-to-line",
    color: "#a855f7",
    definicion: "favorece ambos extremos, puede llevar a especiación",
    ejemplo:
      "Favorece los dos extremos del rasgo y desfavorece el intermedio; con el tiempo puede conducir a especiación.",
  },
];
export function tipoSelPorId(id: string): TipoSelDef {
  return TIPOS_SEL.find((t) => t.id === id) ?? TIPOS_SEL[0]!;
}

/** Aptitud por clase del rasgo (0..BINS-1) según el tipo de selección. */
export function fitnessTipo(tipo: string): number[] {
  const c = (BINS - 1) / 2; // centro = 4
  const out: number[] = [];
  for (let i = 0; i < BINS; i++) {
    const d = i - c;
    let w: number;
    if (tipo === "estabilizadora") w = Math.exp(-(d * d) / 6);
    else if (tipo === "direccional") w = Math.exp(d * 0.42);
    else w = 0.22 + Math.pow(Math.abs(d) / c, 1.7); // disruptiva (forma de U)
    out.push(w);
  }
  const mx = Math.max(...out);
  return out.map((w) => w / mx);
}

/** Distribución del rasgo en cada generación al aplicar la selección. */
export function distribucionTipo(tipo: string, gens: number = MAXGEN_TIPOS): number[][] {
  const w = fitnessTipo(tipo);
  const out: number[][] = [];
  let dist = INIT_DIST.slice();
  const norm = (arr: number[]): number[] => {
    const s = arr.reduce((a, b) => a + b, 0) || 1;
    return arr.map((v) => (v / s) * 100);
  };
  dist = norm(dist);
  for (let g = 0; g <= gens; g++) {
    out.push(dist.slice());
    dist = norm(dist.map((v, i) => v * (w[i] ?? 1)));
  }
  return out;
}

/* ════════════════════════════════════════════════════════════════════════════
   MODO 3 — Evidencias: estructuras homólogas (A1 + A5)
   Húmero, radio, cúbito, carpos y falanges en humano, ballena y murciélago:
   misma disposición ósea (ancestro amnioide común), distinta función.
   ════════════════════════════════════════════════════════════════════════════ */

export const HUESO_COLOR: Record<string, string> = {
  húmero: "#f97316",
  radio: "#38bdf8",
  cúbito: "#a855f7",
  carpos: "#fbbf24",
  falange: "#34d399",
};
export interface HuesoLeyenda {
  tipo: string;
  color: string;
  nota: string;
}
export const HUESOS_LEYENDA: HuesoLeyenda[] = [
  { tipo: "Húmero", color: HUESO_COLOR.húmero!, nota: "hueso único del brazo/aleta" },
  { tipo: "Radio", color: HUESO_COLOR.radio!, nota: "antebrazo, lado externo" },
  { tipo: "Cúbito", color: HUESO_COLOR.cúbito!, nota: "antebrazo, lado interno" },
  { tipo: "Carpos", color: HUESO_COLOR.carpos!, nota: "huesos de la muñeca" },
  { tipo: "Falanges", color: HUESO_COLOR.falange!, nota: "dedos / radios de la mano" },
];

export interface Hueso {
  tipo: string;
  color: string;
  a: Pt;
  b: Pt;
  grosor: number;
}
interface AnimalParams {
  humero: number;
  antebrazo: number;
  digitos: number;
  digitLen: number;
  falangesPorDedo: number;
  spread: number;
  grosor: number;
}
export interface AnimalDef {
  id: string;
  etq: string;
  icono: string;
  funcion: string;
  descripcion: string;
  params: AnimalParams;
}
export const ANIMALES: AnimalDef[] = [
  {
    id: "humano",
    etq: "Brazo humano",
    icono: "fa-hand",
    funcion: "manipular y agarrar",
    descripcion:
      "Extremidad de proporciones equilibradas: húmero, radio y cúbito de longitud media y cinco dedos de tres falanges para la manipulación fina.",
    params: { humero: 1.9, antebrazo: 1.6, digitos: 5, digitLen: 1.5, falangesPorDedo: 3, spread: 1.4, grosor: 0.13 },
  },
  {
    id: "ballena",
    etq: "Aleta de ballena",
    icono: "fa-water",
    funcion: "nadar",
    descripcion:
      "Aleta corta y robusta: húmero y antebrazo acortados, pero los dedos tienen MUCHAS falanges (hiperfalangia) muy juntas para formar un remo rígido.",
    params: { humero: 1.1, antebrazo: 0.9, digitos: 5, digitLen: 2.0, falangesPorDedo: 6, spread: 0.8, grosor: 0.2 },
  },
  {
    id: "murcielago",
    etq: "Ala de murciélago",
    icono: "fa-feather",
    funcion: "volar",
    descripcion:
      "Ala de vuelo: antebrazo y dedos enormemente alargados y delgados, muy separados, que tensan la membrana alar (patagio).",
    params: { humero: 1.7, antebrazo: 2.3, digitos: 5, digitLen: 3.3, falangesPorDedo: 3, spread: 2.4, grosor: 0.06 },
  },
];
export function animalPorId(id: string): AnimalDef {
  return ANIMALES.find((a) => a.id === id) ?? ANIMALES[0]!;
}

/** Construye los huesos de una extremidad a partir de sus proporciones. */
export function huesosDe(id: string): Hueso[] {
  const p = animalPorId(id).params;
  const out: Hueso[] = [];
  const topY = 2.4;
  const elbowY = topY - p.humero;
  out.push({ tipo: "húmero", color: HUESO_COLOR.húmero!, a: [0, topY, 0], b: [0, elbowY, 0], grosor: p.grosor * 1.4 });
  const wristY = elbowY - p.antebrazo;
  out.push({ tipo: "radio", color: HUESO_COLOR.radio!, a: [-0.16, elbowY, 0], b: [-0.13, wristY, 0], grosor: p.grosor });
  out.push({ tipo: "cúbito", color: HUESO_COLOR.cúbito!, a: [0.16, elbowY, 0], b: [0.13, wristY, 0], grosor: p.grosor });
  const carpY = wristY - 0.28;
  out.push({ tipo: "carpos", color: HUESO_COLOR.carpos!, a: [-0.1, wristY, 0], b: [-0.1, carpY, 0], grosor: p.grosor * 0.85 });
  out.push({ tipo: "carpos", color: HUESO_COLOR.carpos!, a: [0.1, wristY, 0], b: [0.1, carpY, 0], grosor: p.grosor * 0.85 });
  for (let d = 0; d < p.digitos; d++) {
    const frac = p.digitos > 1 ? d / (p.digitos - 1) - 0.5 : 0; // −0.5..0.5
    const dxBase = frac * p.spread;
    const segs = p.falangesPorDedo;
    let ax = dxBase * 0.4;
    let ay = carpY;
    for (let s = 0; s < segs; s++) {
      const t1 = (s + 1) / segs;
      const bx = dxBase * 0.4 + (dxBase - dxBase * 0.4) * t1;
      const by = carpY - p.digitLen * t1;
      out.push({ tipo: "falange", color: HUESO_COLOR.falange!, a: [ax, ay, 0], b: [bx, by, 0], grosor: p.grosor * (1 - 0.25 * (s / segs)) });
      ax = bx;
      ay = by;
    }
  }
  return out;
}

/* Homólogas vs análogas (verbatim del glosario A5). */
export const HOMOLOGAS_DEF =
  "Homólogas: misma estructura anatómica derivada del mismo ancestro, adaptada a funciones distintas (ej: extremidad anterior de humano, ballena, murciélago). Son evidencia de ancestro común.";
export const ANALOGAS_DEF =
  "Análogas: funciones similares pero origen evolutivo independiente (convergencia); ej: ala de ave vs ala de insecto.";

/* ════════════════════════════════════════════════════════════════════════════
   Texto compartido (lectura A1 + glosario A5) — verbatim
   ════════════════════════════════════════════════════════════════════════════ */

export const PROBLEMA =
  "Este visor es un laboratorio vivo de evolución. Cambia el ambiente y la presión de los depredadores y observa, generación a generación, cómo la selección natural reordena las frecuencias alélicas de la población. La evolución no es azar: opera sobre la variación que ya existe, favoreciendo a los mejor adaptados al ambiente actual.";

export const INSTRUCCIONES: string[] = [
  "Elige un modo: «Selección natural» (conejos), «Tipos de selección» o «Evidencias» (homología).",
  "En conejos, selecciona el ambiente (pradera, nieve o malpaís) y la presión depredadora (baja, media o alta).",
  "Pulsa ▶ o arrastra el control de generaciones para avanzar el tiempo y ver cambiar el color predominante.",
  "Observa los porcentajes: el fenotipo camuflado aumenta; el que resalta disminuye, pero el alelo recesivo persiste oculto en heterocigotos.",
  "En «Tipos de selección», cambia entre estabilizadora, direccional y disruptiva y mira cómo se reforma la distribución del rasgo.",
  "En «Evidencias», compara los mismos huesos (mismo color) en el brazo humano, la aleta de ballena y el ala de murciélago.",
];

export const IDEAS: string[] = [
  "La selección natural no es aleatoria: opera sobre la variación existente, favoreciendo los fenotipos mejor adaptados al ambiente actual.",
  "Los cuatro postulados de Darwin: variación heredable; sobreproducción de descendencia; ventaja de ciertos rasgos; aumento de su frecuencia con el tiempo.",
  "La evolución es el cambio en las frecuencias alélicas de una población a lo largo del tiempo.",
  "La selección no crea variación nueva: solo actúa sobre la que ya existe (mutación y recombinación la generan).",
  "Un alelo recesivo desfavorable no desaparece de golpe: queda oculto en los heterocigotos, por eso la selección contra él es lenta.",
  "La especiación alopátrica ocurre cuando el aislamiento geográfico acumula diferencias genéticas hasta impedir la reproducción entre poblaciones.",
  "Las evidencias de la evolución son múltiples y convergentes: registro fósil, anatomía comparada (homologías), biogeografía y genómica comparada.",
  "México es uno de los 17 países megadiversos según la CONABIO: ese acervo de variación es la materia prima sobre la que actúa la selección.",
];

export interface GlosarioItem {
  termino: string;
  definicion: string;
}
export const GLOSARIO: GlosarioItem[] = [
  {
    termino: "Selección natural (Darwin-Wallace)",
    definicion:
      "Mecanismo evolutivo que actúa sobre la variación heredable en una población. Los individuos con variaciones que aumentan su supervivencia y reproducción en el ambiente actual dejan más descendencia, por lo que esas variaciones se vuelven más frecuentes en la siguiente generación.",
  },
  {
    termino: "Tipos de selección natural",
    definicion:
      "Selección estabilizadora: favorece fenotipos intermedios, reduce la varianza (ej: peso al nacer en humanos). Selección direccional: favorece un extremo del rango fenotípico (ej: resistencia a antibióticos). Selección disruptiva: favorece ambos extremos, puede llevar a especiación.",
  },
  {
    termino: "Deriva génica",
    definicion:
      "Cambio aleatorio en la frecuencia de alelos en una población, especialmente pronunciado en poblaciones pequeñas. No es adaptativo; puede fijar alelos neutros o perjudiciales. Incluye el efecto fundador y el cuello de botella.",
  },
  {
    termino: "Evidencia fósil de la evolución",
    definicion:
      "El registro fósil muestra la cronología de aparición de grupos biológicos, formas de transición y extinciones. Las dataciones radiométricas permiten establecer la edad de los fósiles.",
  },
  {
    termino: "Estructuras homólogas y analogías",
    definicion:
      "Homólogas: misma estructura anatómica derivada del mismo ancestro, adaptada a funciones distintas (evidencia de ancestro común). Análogas: funciones similares pero origen evolutivo independiente (convergencia).",
  },
  {
    termino: "Especiación",
    definicion:
      "Proceso por el cual surgen nuevas especies. Alopátrica: la separación geográfica impide el flujo génico entre poblaciones que divergen hasta no poder reproducirse. Simpátrica: aislamiento reproductivo dentro del mismo territorio.",
  },
];

export const CONTEXTO =
  "México es uno de los 17 países megadiversos del planeta según la CONABIO (Comisión Nacional para el Conocimiento y Uso de la Biodiversidad). Alberga el 10% de las especies conocidas en la Tierra, con más de 200,000 especies registradas en su territorio: el mayor número en el mundo en relación a su extensión.";

export const FUENTE =
  "Material elaborado para CEN Bachillerato — CNEYT-VI. Ref: Campbell, Biología (12a ed.); Darwin, El origen de las especies.";

export interface DatoCard {
  valor: string;
  texto: string;
  icono: string;
}
export const DATOS: DatoCard[] = [
  { valor: "~98.7%", texto: "del genoma compartimos los humanos con los chimpancés (genómica comparada).", icono: "fa-dna" },
  { valor: "17 países", texto: "megadiversos del planeta; México es uno de ellos (CONABIO).", icono: "fa-earth-americas" },
  { valor: "1859", texto: "Darwin publica «El origen de las especies».", icono: "fa-book" },
  { valor: "4 postulados", texto: "fundamentan la selección natural de Darwin-Wallace.", icono: "fa-list-check" },
];

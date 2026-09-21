/**
 * Datos y modelo del laboratorio "Places to visit: Rincón del Colibrí"
 * (IN-III-P03, progresión 3 de Inglés III: «Describe lugares conocidos y
 * actividades que se pueden realizar ahí (da información y recomendaciones
 * básicas)»).
 *
 * Anclas VERBATIM (IN-III-P03):
 *   - A1 glosario «Describing Places with Prepositions» y A5 glosario «Places,
 *     prepositions & recommendations»: esta progresión NO tiene lectura, así que
 *     el marco teórico de la ficha se arma con sus definiciones y ejemplos.
 *   - A2 y A6 fill_blanks: «Completa el texto».
 *   - A3 y A4 verdadero/falso: hechos.
 *   - A5 actividad final: «Tu turno». A7 autoevaluación.
 *   - A8 video: sus dos preguntas cerradas forman el reto evaluable.
 *   - A9 relacionar columnas: tarjeta de estrellas.
 *
 * Lo que NO es verbatim: el pueblo de Rincón del Colibrí, sus siete lugares, la
 * guía turística, los visitantes y sus nombres son FICTICIOS e ILUSTRATIVOS.
 * Los precios (30 y 40 pesos), los 200 y 300 escalones y los horarios también.
 * Todas las oraciones en inglés que no vienen de la BD son del laboratorio y
 * siguen el inglés estadounidense estándar.
 *
 * Modelo de las maquetas: cada lugar es un tablero de 5.2 × 5.2 (x, z de −2.6 a
 * 2.6; z negativa = fondo). Las cantidades y posiciones de los objetos que se
 * pueden contar viven AQUÍ y la escena 3D dibuja exactamente esas piezas, así
 * que «There are six benches» se revisa contra lo que el alumno ve.
 *
 * Datos puros (sin three ni React).
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { TextoHuecosData } from "./_mecanica-huecos";

/* ── Modos ────────────────────────────────────────────────────────────── */

export type Modo = "describir" | "guia" | "recomendar";
export const MODOS: Modo[] = ["describir", "guia", "recomendar"];

export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string }> = {
  describir: { etq: "Describe the place", subtitulo: "Arma oraciones verdaderas sobre cada maqueta", icono: "fa-map-location-dot", color: "#38bdf8" },
  guia: { etq: "Guidebook", subtitulo: "Lee la guía y lleva a cada visitante a su lugar", icono: "fa-book-atlas", color: "#fbbf24" },
  recomendar: { etq: "Recommend it", subtitulo: "Escribe una recomendación con su razón", icono: "fa-comment-dots", color: "#f472b6" },
};

export type Pt = [number, number, number];

export function mulberry32(semilla: number) {
  let t = semilla >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function baraja<T>(xs: readonly T[], rnd: () => number): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function estrellasPorErrores(errores: number): number {
  return errores === 0 ? 3 : errores <= 2 ? 2 : 1;
}

/** Minúsculas, apóstrofos rectos, sin acentos ni puntuación y espacios simples. */
export function normalizaIngles(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[.,;:!?¡¿"()—–-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const CONTRACCIONES: [RegExp, string][] = [
  [/\bi'm\b/g, "i am"],
  [/\bi'd\b/g, "i would"],
  [/\bit's\b/g, "it is"],
  [/\bits a\b/g, "it is a"],
  [/\bthere's\b/g, "there is"],
  [/\btheres\b/g, "there is"],
  [/\bthey're\b/g, "they are"],
  [/\byou're\b/g, "you are"],
  [/\bdon't\b/g, "do not"],
  [/\bdont\b/g, "do not"],
  [/\bcan't\b/g, "cannot"],
  [/\bcant\b/g, "cannot"],
  [/\bcan not\b/g, "cannot"],
  [/\bisn't\b/g, "is not"],
  [/\baren't\b/g, "are not"],
  [/\bshouldn't\b/g, "should not"],
  [/\byou'll\b/g, "you will"],
];

/** Normaliza y expande contracciones: «it's» = «it is», «don't» = «do not». */
export function expandeIngles(s: string): string {
  let r = normalizaIngles(s);
  for (const [re, v] of CONTRACCIONES) r = r.replace(re, v);
  return r.replace(/\s+/g, " ").trim();
}

/** Oración lista para mostrarse: mayúscula inicial y punto final. */
export function pulirOracion(s: string): string {
  const t = s.trim().replace(/\s+/g, " ");
  if (!t) return "";
  const c = `${t.charAt(0).toUpperCase()}${t.slice(1)}`;
  return /[.!?]$/.test(c) ? c : `${c}.`;
}

const NUM_EN = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
export const numeroEn = (n: number) => NUM_EN[n] ?? String(n);

/* ════════════════════════════════════════════════════════════════════════
 * 1. LOS LUGARES DE RINCÓN DEL COLIBRÍ
 * ════════════════════════════════════════════════════════════════════════ */

export type LugarId = "plaza" | "mercado" | "museo" | "cascada" | "ruinas" | "playa" | "mirador";
export const LUGAR_IDS: LugarId[] = ["plaza", "mercado", "museo", "cascada", "ruinas", "playa", "mirador"];

/** Sustantivos que se pueden contar en las maquetas (clave → inglés / español). */
export const NOMBRES: Record<string, { sg: string; pl: string; es: string; esPl: string; fem: boolean }> = {
  church: { sg: "church", pl: "churches", es: "iglesia", esPl: "iglesias", fem: true },
  fountain: { sg: "fountain", pl: "fountains", es: "fuente", esPl: "fuentes", fem: true },
  kiosk: { sg: "kiosk", pl: "kiosks", es: "kiosco", esPl: "kioscos", fem: false },
  bench: { sg: "bench", pl: "benches", es: "banca", esPl: "bancas", fem: true },
  tree: { sg: "tree", pl: "trees", es: "árbol", esPl: "árboles", fem: false },
  icecream: { sg: "ice cream cart", pl: "ice cream carts", es: "carrito de nieves", esPl: "carritos de nieves", fem: false },
  arch: { sg: "entrance arch", pl: "entrance arches", es: "arco de entrada", esPl: "arcos de entrada", fem: false },
  craftstall: { sg: "craft stall", pl: "craft stalls", es: "puesto de artesanías", esPl: "puestos de artesanías", fem: false },
  foodstall: { sg: "food stall", pl: "food stalls", es: "puesto de comida", esPl: "puestos de comida", fem: false },
  table: { sg: "table", pl: "tables", es: "mesa", esPl: "mesas", fem: true },
  ramp: { sg: "ramp", pl: "ramps", es: "rampa", esPl: "rampas", fem: true },
  elevator: { sg: "elevator", pl: "elevators", es: "elevador", esPl: "elevadores", fem: false },
  displaycase: { sg: "display case", pl: "display cases", es: "vitrina", esPl: "vitrinas", fem: true },
  mural: { sg: "mural", pl: "murals", es: "mural", esPl: "murales", fem: false },
  photo: { sg: "old photo", pl: "old photos", es: "foto antigua", esPl: "fotos antiguas", fem: true },
  sign: { sg: "sign", pl: "signs", es: "letrero", esPl: "letreros", fem: false },
  waterfall: { sg: "waterfall", pl: "waterfalls", es: "cascada", esPl: "cascadas", fem: true },
  pool: { sg: "natural pool", pl: "natural pools", es: "poza natural", esPl: "pozas naturales", fem: true },
  bridge: { sg: "wooden bridge", pl: "wooden bridges", es: "puente de madera", esPl: "puentes de madera", fem: false },
  picnictable: { sg: "picnic table", pl: "picnic tables", es: "mesa de picnic", esPl: "mesas de picnic", fem: true },
  pyramid: { sg: "pyramid", pl: "pyramids", es: "pirámide", esPl: "pirámides", fem: true },
  monument: { sg: "stone monument", pl: "stone monuments", es: "monumento de piedra", esPl: "monumentos de piedra", fem: false },
  ballcourt: { sg: "ball court", pl: "ball courts", es: "juego de pelota", esPl: "juegos de pelota", fem: false },
  visitorcenter: { sg: "visitor center", pl: "visitor centers", es: "centro de visitantes", esPl: "centros de visitantes", fem: false },
  lifeguard: { sg: "lifeguard tower", pl: "lifeguard towers", es: "torre de salvavidas", esPl: "torres de salvavidas", fem: true },
  restaurant: { sg: "restaurant", pl: "restaurants", es: "restaurante", esPl: "restaurantes", fem: false },
  turtlecamp: { sg: "turtle camp", pl: "turtle camps", es: "campamento tortuguero", esPl: "campamentos tortugueros", fem: false },
  umbrella: { sg: "beach umbrella", pl: "beach umbrellas", es: "sombrilla", esPl: "sombrillas", fem: true },
  kayak: { sg: "kayak", pl: "kayaks", es: "kayak", esPl: "kayaks", fem: false },
  palm: { sg: "palm tree", pl: "palm trees", es: "palmera", esPl: "palmeras", fem: true },
  telescope: { sg: "telescope", pl: "telescopes", es: "telescopio", esPl: "telescopios", fem: false },
  lamp: { sg: "lamp", pl: "lamps", es: "farol", esPl: "faroles", fem: false },
  staircase: { sg: "long staircase", pl: "long staircases", es: "escalinata", esPl: "escalinatas", fem: true },
  busstop: { sg: "bus stop", pl: "bus stops", es: "parada de autobús", esPl: "paradas de autobús", fem: true },
  parking: { sg: "parking lot", pl: "parking lots", es: "estacionamiento", esPl: "estacionamientos", fem: false },
};

export interface Objeto {
  clave: string;
  /** Posición local de cada pieza (su número = cuántas hay). */
  pos: Pt[];
  /** Altura del marcador sobre la pieza. */
  alto: number;
}

/** Ficha de sustantivo del modo «Describe the place». */
export interface FichaSust {
  texto: string;
  clave: string;
  num: "sg" | "pl";
  /** 1 = a/an; número exacto; «many» (4 o más) o «some» (2 o más). */
  cant: number | "many" | "some";
}

export type Prep = "between" | "next to" | "around" | "behind" | "in the middle of" | "in the corners of" | "in front of" | "on" | "above" | "below" | "over" | "at" | "along";
/** Las preposiciones de lugar del glosario A1 que cuentan para el objetivo. */
export const PREPS_A1: Prep[] = ["next to", "in front of", "between", "behind", "above", "below"];

export interface FichaUbic {
  texto: string;
  es: string;
  prep: Prep;
  /** Sustantivos (claves) para los que la ubicación es cierta en la maqueta. */
  verdad: string[];
}

export interface FichaAct {
  /** Verbo base + complemento: va después de «You can» / «You can't». */
  texto: string;
  es: string;
  /** ¿Se puede hacer en este lugar? */
  aqui: boolean;
  /** Regla visible en la maqueta (un letrero): «You can't …» es información útil. */
  regla?: boolean;
}

export type TagGuia = "accesible" | "historia" | "ninos" | "nadar" | "barato" | "souvenirs" | "tranquilo" | "atardecer" | "tour" | "caminar" | "musica" | "gratis";

export interface Lugar {
  id: LugarId;
  /** Nombre en inglés con artículo, como se usa en una oración. */
  en: string;
  /** Nombre propio en la guía. */
  nombre: string;
  es: string;
  icono: string;
  color: string;
  /** Centro del tablero en el mapa general. */
  mapa: [number, number];
  objetos: Objeto[];
  sustantivos: FichaSust[];
  ubicaciones: FichaUbic[];
  actividades: FichaAct[];
  /** Guía turística (modo 2): oraciones en inglés. */
  guia: string[];
  /** Evidencia de la guía: etiqueta → [¿sí?, índice de la oración]. */
  evid: Partial<Record<TagGuia, [boolean, number]>>;
}

export const LUGARES: Lugar[] = [
  {
    id: "plaza",
    en: "the main square",
    nombre: "Main Square",
    es: "la plaza principal",
    icono: "fa-landmark-dome",
    color: "#f59e0b",
    mapa: [0, -1.4],
    objetos: [
      { clave: "church", pos: [[0, 0, -1.75]], alto: 2.9 },
      { clave: "fountain", pos: [[0, 0, -0.72]], alto: 1.0 },
      { clave: "kiosk", pos: [[0, 0, 1.0]], alto: 1.9 },
      { clave: "icecream", pos: [[1.08, 0, 0.32]], alto: 0.95 },
      {
        clave: "bench",
        pos: [
          [-1.75, 0, 0.45],
          [-1.75, 0, 1.45],
          [1.75, 0, 0.75],
          [1.75, 0, 1.6],
          [-0.7, 0, 2.3],
          [0.7, 0, 2.3],
        ],
        alto: 0.6,
      },
      {
        clave: "tree",
        pos: [
          [-2.15, 0, -0.6],
          [2.15, 0, -0.6],
          [-2.15, 0, 2.2],
          [2.15, 0, 2.2],
        ],
        alto: 1.7,
      },
    ],
    sustantivos: [
      { texto: "an old church", clave: "church", num: "sg", cant: 1 },
      { texto: "a fountain", clave: "fountain", num: "sg", cant: 1 },
      { texto: "two fountains", clave: "fountain", num: "pl", cant: 2 },
      { texto: "a kiosk", clave: "kiosk", num: "sg", cant: 1 },
      { texto: "an ice cream cart", clave: "icecream", num: "sg", cant: 1 },
      { texto: "a bench", clave: "bench", num: "sg", cant: 1 },
      { texto: "six benches", clave: "bench", num: "pl", cant: 6 },
      { texto: "four trees", clave: "tree", num: "pl", cant: 4 },
      { texto: "a pyramid", clave: "pyramid", num: "sg", cant: 1 },
    ],
    ubicaciones: [
      { texto: "between the church and the kiosk", es: "entre la iglesia y el kiosco", prep: "between", verdad: ["fountain"] },
      { texto: "next to the kiosk", es: "al lado del kiosco", prep: "next to", verdad: ["icecream"] },
      { texto: "behind the fountain", es: "detrás de la fuente", prep: "behind", verdad: ["church"] },
      { texto: "around the kiosk", es: "alrededor del kiosco", prep: "around", verdad: ["bench"] },
      { texto: "in the middle of the square", es: "en medio de la plaza", prep: "in the middle of", verdad: ["kiosk"] },
      { texto: "in the corners of the square", es: "en las esquinas de la plaza", prep: "in the corners of", verdad: ["tree"] },
    ],
    actividades: [
      { texto: "listen to live music", es: "escuchar música en vivo", aqui: true },
      { texto: "eat ice cream", es: "comer nieve", aqui: true },
      { texto: "sit and relax", es: "sentarte a descansar", aqui: true },
      { texto: "swim in the fountain", es: "nadar en la fuente", aqui: false, regla: true },
      { texto: "rent a kayak", es: "rentar un kayak", aqui: false },
    ],
    guia: [
      "The Main Square is the heart of Rincón del Colibrí.",
      "There is an old church, and there is a kiosk in the middle of the square.",
      "On Sunday evenings, there is live music in the kiosk, and it's free.",
      "The square is flat, so it's easy to visit in a wheelchair or with a stroller.",
      "It's a good place to eat ice cream and relax.",
    ],
    evid: { musica: [true, 2], gratis: [true, 2], accesible: [true, 3] },
  },
  {
    id: "mercado",
    en: "the crafts market",
    nombre: "Crafts Market",
    es: "el mercado de artesanías",
    icono: "fa-store",
    color: "#ef4444",
    mapa: [4.7, -1.4],
    objetos: [
      { clave: "arch", pos: [[0, 0, 2.05]], alto: 2.0 },
      {
        clave: "craftstall",
        pos: [
          [-1.5, 0, -1.55],
          [0, 0, -1.55],
          [1.5, 0, -1.55],
          [-1.5, 0, -0.3],
          [0, 0, -0.3],
          [1.5, 0, -0.3],
        ],
        alto: 1.55,
      },
      {
        clave: "foodstall",
        pos: [
          [-1.35, 0, 1.05],
          [1.35, 0, 1.05],
        ],
        alto: 1.55,
      },
      {
        clave: "table",
        pos: [
          [-2.2, 0, 0.55],
          [-2.2, 0, 1.55],
          [2.2, 0, 0.55],
          [2.2, 0, 1.55],
        ],
        alto: 0.75,
      },
    ],
    sustantivos: [
      { texto: "an entrance arch", clave: "arch", num: "sg", cant: 1 },
      { texto: "six craft stalls", clave: "craftstall", num: "pl", cant: 6 },
      { texto: "three craft stalls", clave: "craftstall", num: "pl", cant: 3 },
      { texto: "two food stalls", clave: "foodstall", num: "pl", cant: 2 },
      { texto: "a food stall", clave: "foodstall", num: "sg", cant: 1 },
      { texto: "four tables", clave: "table", num: "pl", cant: 4 },
      { texto: "a natural pool", clave: "pool", num: "sg", cant: 1 },
    ],
    ubicaciones: [
      { texto: "in front of the market", es: "enfrente del mercado", prep: "in front of", verdad: ["arch"] },
      { texto: "next to the entrance", es: "al lado de la entrada", prep: "next to", verdad: ["foodstall"] },
      { texto: "next to the food stalls", es: "al lado de los puestos de comida", prep: "next to", verdad: ["table"] },
      { texto: "behind the food stalls", es: "detrás de los puestos de comida", prep: "behind", verdad: ["craftstall"] },
    ],
    actividades: [
      { texto: "buy handmade crafts", es: "comprar artesanías", aqui: true },
      { texto: "eat traditional food", es: "comer comida tradicional", aqui: true },
      { texto: "buy souvenirs", es: "comprar recuerdos", aqui: true },
      { texto: "pay with a credit card", es: "pagar con tarjeta de crédito", aqui: false, regla: true },
      { texto: "watch the sunset", es: "ver el atardecer", aqui: false },
    ],
    guia: [
      "The Crafts Market is next to the Main Square.",
      "There are six craft stalls and two food stalls.",
      "You can buy handmade crafts and souvenirs, like clay pots and hammocks, at low prices.",
      "It's open every day from 8 a.m. to 6 p.m., and most stalls only accept cash.",
      "It's usually very crowded and noisy on weekends.",
    ],
    evid: { souvenirs: [true, 2], barato: [true, 2], tranquilo: [false, 4] },
  },
  {
    id: "museo",
    en: "the community museum",
    nombre: "Community Museum",
    es: "el museo comunitario",
    icono: "fa-building-columns",
    color: "#a78bfa",
    mapa: [-4.7, -1.4],
    objetos: [
      { clave: "ramp", pos: [[0, 0, 1.75]], alto: 0.6 },
      { clave: "elevator", pos: [[1.95, 0, -0.35]], alto: 2.95 },
      {
        clave: "displaycase",
        pos: [
          [-1.35, 0.3, -0.35],
          [-0.35, 0.3, -0.35],
          [0.65, 0.3, -0.35],
        ],
        alto: 0.95,
      },
      { clave: "mural", pos: [[-0.35, 1.45, -1.15]], alto: 1.05 },
      {
        clave: "photo",
        pos: [
          [-1.74, 1.8, -0.95],
          [-1.74, 1.8, -0.45],
          [-1.74, 1.8, 0.05],
          [-1.74, 1.8, 0.55],
          [-1.74, 2.25, -0.95],
          [-1.74, 2.25, -0.45],
          [-1.74, 2.25, 0.05],
          [-1.74, 2.25, 0.55],
        ],
        alto: 0.28,
      },
      { clave: "sign", pos: [[0, 1.6, 0.97]], alto: 0.3 },
    ],
    sustantivos: [
      { texto: "a ramp", clave: "ramp", num: "sg", cant: 1 },
      { texto: "an elevator", clave: "elevator", num: "sg", cant: 1 },
      { texto: "three display cases", clave: "displaycase", num: "pl", cant: 3 },
      { texto: "a display case", clave: "displaycase", num: "sg", cant: 1 },
      { texto: "a big mural", clave: "mural", num: "sg", cant: 1 },
      { texto: "many old photos", clave: "photo", num: "pl", cant: "many" },
      { texto: "a sign", clave: "sign", num: "sg", cant: 1 },
      { texto: "a lifeguard tower", clave: "lifeguard", num: "sg", cant: 1 },
    ],
    ubicaciones: [
      { texto: "in front of the entrance", es: "enfrente de la entrada", prep: "in front of", verdad: ["ramp"] },
      { texto: "next to the stairs", es: "al lado de las escaleras", prep: "next to", verdad: ["elevator"] },
      { texto: "above the entrance", es: "encima de la entrada", prep: "above", verdad: ["sign"] },
      { texto: "on the first floor", es: "en la planta baja (first floor, en inglés de EE. UU.)", prep: "on", verdad: ["displaycase"] },
      { texto: "on the second floor", es: "en el primer piso (second floor, en inglés de EE. UU.)", prep: "on", verdad: ["mural", "photo"] },
    ],
    actividades: [
      { texto: "learn about the history of the town", es: "aprender la historia del pueblo", aqui: true },
      { texto: "see a big mural", es: "ver un mural grande", aqui: true },
      { texto: "see old photos", es: "ver fotos antiguas", aqui: true },
      { texto: "touch the objects", es: "tocar los objetos", aqui: false, regla: true },
      { texto: "swim in the sea", es: "nadar en el mar", aqui: false },
    ],
    guia: [
      "The Community Museum is opposite the Crafts Market, on the other side of the Main Square.",
      "You can learn about the history of the town and see a big mural on the second floor.",
      "There is a ramp in front of the entrance, and there is an elevator next to the stairs.",
      "On Saturdays, there is a free art workshop for children.",
      "It's indoors, so it's a great option on rainy days. It's closed on Mondays.",
    ],
    evid: { historia: [true, 1], accesible: [true, 2], ninos: [true, 3] },
  },
  {
    id: "cascada",
    en: "the waterfall",
    nombre: "El Salto Waterfall",
    es: "la cascada El Salto",
    icono: "fa-water",
    color: "#22d3ee",
    mapa: [10.2, -6.6],
    objetos: [
      { clave: "waterfall", pos: [[0.2, 0, -2.0]], alto: 3.3 },
      { clave: "pool", pos: [[0.2, 0, -0.85]], alto: 0.5 },
      { clave: "bridge", pos: [[1.3, 0, 1.1]], alto: 0.7 },
      {
        clave: "picnictable",
        pos: [
          [-0.85, 0, 0.75],
          [-0.45, 0, 1.7],
          [0.35, 0, 2.2],
        ],
        alto: 0.7,
      },
      {
        clave: "tree",
        pos: [
          [-2.2, 0, -0.9],
          [-2.2, 0, 0.35],
          [-2.05, 0, 1.6],
          [2.25, 0, -0.55],
          [2.3, 0, 0.55],
          [-1.25, 0, 2.3],
        ],
        alto: 1.7,
      },
    ],
    sustantivos: [
      { texto: "a waterfall", clave: "waterfall", num: "sg", cant: 1 },
      { texto: "a natural pool", clave: "pool", num: "sg", cant: 1 },
      { texto: "two natural pools", clave: "pool", num: "pl", cant: 2 },
      { texto: "a wooden bridge", clave: "bridge", num: "sg", cant: 1 },
      { texto: "three picnic tables", clave: "picnictable", num: "pl", cant: 3 },
      { texto: "a picnic table", clave: "picnictable", num: "sg", cant: 1 },
      { texto: "many trees", clave: "tree", num: "pl", cant: "many" },
      { texto: "a restaurant", clave: "restaurant", num: "sg", cant: 1 },
    ],
    ubicaciones: [
      { texto: "below the waterfall", es: "debajo de la cascada", prep: "below", verdad: ["pool"] },
      { texto: "above the natural pool", es: "encima de la poza", prep: "above", verdad: ["waterfall"] },
      { texto: "over the river", es: "sobre el río (de un lado al otro)", prep: "over", verdad: ["bridge"] },
      { texto: "next to the river", es: "al lado del río", prep: "next to", verdad: ["picnictable"] },
    ],
    actividades: [
      { texto: "swim in the natural pool", es: "nadar en la poza", aqui: true },
      { texto: "walk along the trail", es: "caminar por el sendero", aqui: true },
      { texto: "have a picnic", es: "hacer un picnic", aqui: true },
      { texto: "jump from the waterfall", es: "saltar desde la cascada", aqui: false, regla: true },
      { texto: "buy handmade crafts", es: "comprar artesanías", aqui: false },
    ],
    guia: [
      "El Salto is a beautiful waterfall in the mountains, 20 minutes from the town.",
      "There is a natural pool below the waterfall, and you can swim there.",
      "To get there, you walk along a trail with 200 steps.",
      "The water in the pool is very deep, so it isn't a good place for small children.",
      "You can have a picnic next to the river. The entrance is 40 pesos.",
    ],
    evid: { nadar: [true, 1], caminar: [true, 2], accesible: [false, 2], ninos: [false, 3], gratis: [false, 4] },
  },
  {
    id: "ruinas",
    en: "the archaeological site",
    nombre: "Archaeological Site",
    es: "la zona arqueológica",
    icono: "fa-monument",
    color: "#84cc16",
    mapa: [-11.2, 2.4],
    objetos: [
      { clave: "pyramid", pos: [[0, 0, -1.25]], alto: 2.2 },
      {
        clave: "monument",
        pos: [
          [-0.8, 0, 0.45],
          [0, 0, 0.45],
          [0.8, 0, 0.45],
        ],
        alto: 1.0,
      },
      { clave: "ballcourt", pos: [[-2.0, 0, -1.0]], alto: 0.8 },
      { clave: "visitorcenter", pos: [[1.55, 0, 1.75]], alto: 1.2 },
      {
        clave: "tree",
        pos: [
          [2.15, 0, -2.1],
          [2.2, 0, -0.6],
          [2.25, 0, 0.65],
          [-2.25, 0, 1.0],
          [-2.25, 0, 2.25],
        ],
        alto: 1.7,
      },
    ],
    sustantivos: [
      { texto: "a big pyramid", clave: "pyramid", num: "sg", cant: 1 },
      { texto: "two pyramids", clave: "pyramid", num: "pl", cant: 2 },
      { texto: "three stone monuments", clave: "monument", num: "pl", cant: 3 },
      { texto: "a ball court", clave: "ballcourt", num: "sg", cant: 1 },
      { texto: "a visitor center", clave: "visitorcenter", num: "sg", cant: 1 },
      { texto: "five trees", clave: "tree", num: "pl", cant: 5 },
      { texto: "a fountain", clave: "fountain", num: "sg", cant: 1 },
    ],
    ubicaciones: [
      { texto: "in front of the pyramid", es: "enfrente de la pirámide", prep: "in front of", verdad: ["monument"] },
      { texto: "next to the pyramid", es: "al lado de la pirámide", prep: "next to", verdad: ["ballcourt"] },
      { texto: "at the entrance", es: "en la entrada", prep: "at", verdad: ["visitorcenter"] },
    ],
    actividades: [
      { texto: "learn about ancient cultures", es: "aprender sobre culturas antiguas", aqui: true },
      { texto: "take a guided tour", es: "tomar un recorrido guiado", aqui: true },
      { texto: "walk around the ruins", es: "caminar entre las ruinas", aqui: true },
      { texto: "climb the pyramid", es: "subir a la pirámide", aqui: false, regla: true },
      { texto: "swim in the sea", es: "nadar en el mar", aqui: false },
    ],
    guia: [
      "The Archaeological Site has the ruins of an ancient city. It's more than 1,000 years old.",
      "There is a big pyramid, and there are three stone monuments in front of it.",
      "You can take a guided tour and learn about ancient cultures.",
      "You can't climb the pyramid, and the paths have a lot of stone steps.",
      "It's in the jungle, so bring water and insect repellent.",
    ],
    evid: { historia: [true, 2], tour: [true, 2], accesible: [false, 3] },
  },
  {
    id: "playa",
    en: "the beach",
    nombre: "Colibrí Beach",
    es: "la playa Colibrí",
    icono: "fa-umbrella-beach",
    color: "#38bdf8",
    mapa: [3.2, 6.8],
    objetos: [
      { clave: "restaurant", pos: [[-1.55, 0, -1.05]], alto: 1.75 },
      { clave: "turtlecamp", pos: [[1.55, 0, -1.05]], alto: 0.9 },
      { clave: "lifeguard", pos: [[0, 0, -1.0]], alto: 2.0 },
      {
        clave: "umbrella",
        pos: [
          [-2.0, 0, 0.4],
          [-1.05, 0, 0.4],
        ],
        alto: 1.25,
      },
      {
        clave: "kayak",
        pos: [
          [0.95, 0, 0.95],
          [1.55, 0, 0.95],
          [2.15, 0, 0.95],
        ],
        alto: 0.45,
      },
      {
        clave: "palm",
        pos: [
          [-2.2, 0, -2.2],
          [-1.1, 0, -2.3],
          [0, 0, -2.2],
          [1.1, 0, -2.3],
          [2.2, 0, -2.2],
        ],
        alto: 2.1,
      },
    ],
    sustantivos: [
      { texto: "a lifeguard tower", clave: "lifeguard", num: "sg", cant: 1 },
      { texto: "a restaurant", clave: "restaurant", num: "sg", cant: 1 },
      { texto: "a turtle camp", clave: "turtlecamp", num: "sg", cant: 1 },
      { texto: "three kayaks", clave: "kayak", num: "pl", cant: 3 },
      { texto: "a kayak", clave: "kayak", num: "sg", cant: 1 },
      { texto: "two beach umbrellas", clave: "umbrella", num: "pl", cant: 2 },
      { texto: "five palm trees", clave: "palm", num: "pl", cant: 5 },
      { texto: "a telescope", clave: "telescope", num: "sg", cant: 1 },
    ],
    ubicaciones: [
      { texto: "between the restaurant and the turtle camp", es: "entre el restaurante y el campamento tortuguero", prep: "between", verdad: ["lifeguard"] },
      { texto: "in front of the restaurant", es: "enfrente del restaurante", prep: "in front of", verdad: ["umbrella"] },
      { texto: "next to the water", es: "junto al agua", prep: "next to", verdad: ["kayak"] },
      { texto: "along the beach", es: "a lo largo de la playa", prep: "along", verdad: ["palm"] },
    ],
    actividades: [
      { texto: "swim in the sea", es: "nadar en el mar", aqui: true },
      { texto: "rent a kayak", es: "rentar un kayak", aqui: true },
      { texto: "see baby sea turtles", es: "ver tortugas marinas bebé", aqui: true },
      { texto: "eat fresh seafood", es: "comer mariscos frescos", aqui: true },
      { texto: "touch the baby turtles", es: "tocar a las tortugas bebé", aqui: false, regla: true },
      { texto: "see a big mural", es: "ver un mural grande", aqui: false },
    ],
    guia: [
      "Colibrí Beach is a long beach with soft sand and warm water.",
      "There is a lifeguard tower, so it's a safe place to swim with children.",
      "You can rent a kayak or eat fresh seafood at the restaurant, but the restaurant is expensive.",
      "During turtle season, you can see baby sea turtles at the turtle camp.",
      "There aren't any ramps, so it's difficult to go on the sand in a wheelchair.",
    ],
    evid: { nadar: [true, 1], ninos: [true, 1], barato: [false, 2], accesible: [false, 4] },
  },
  {
    id: "mirador",
    en: "the viewpoint",
    nombre: "The Viewpoint",
    es: "el mirador",
    icono: "fa-binoculars",
    color: "#fb7185",
    mapa: [-9.6, -6.6],
    objetos: [
      { clave: "telescope", pos: [[0.45, 1.6, -1.35]], alto: 0.75 },
      {
        clave: "bench",
        pos: [
          [-0.45, 1.6, -1.55],
          [-1.25, 1.6, -1.55],
        ],
        alto: 0.55,
      },
      {
        clave: "lamp",
        pos: [
          [-0.62, 0.39, 1.55],
          [0.62, 0.39, 1.55],
          [-0.62, 1.15, 0.3],
          [0.62, 1.15, 0.3],
        ],
        alto: 1.0,
      },
      { clave: "staircase", pos: [[0, 0.8, 0.95]], alto: 0.6 },
      { clave: "busstop", pos: [[1.85, 0, 2.05]], alto: 1.1 },
    ],
    sustantivos: [
      { texto: "a telescope", clave: "telescope", num: "sg", cant: 1 },
      { texto: "two benches", clave: "bench", num: "pl", cant: 2 },
      { texto: "a bench", clave: "bench", num: "sg", cant: 1 },
      { texto: "four lamps", clave: "lamp", num: "pl", cant: 4 },
      { texto: "a long staircase", clave: "staircase", num: "sg", cant: 1 },
      { texto: "a bus stop", clave: "busstop", num: "sg", cant: 1 },
      { texto: "a parking lot", clave: "parking", num: "sg", cant: 1 },
    ],
    ubicaciones: [
      { texto: "at the top of the hill", es: "en la cima del cerro", prep: "at", verdad: ["telescope", "bench"] },
      { texto: "next to the telescope", es: "al lado del telescopio", prep: "next to", verdad: ["bench"] },
      { texto: "along the staircase", es: "a lo largo de la escalinata", prep: "along", verdad: ["lamp"] },
      { texto: "at the bottom of the hill", es: "al pie del cerro", prep: "at", verdad: ["busstop"] },
    ],
    actividades: [
      { texto: "watch the sunset", es: "ver el atardecer", aqui: true },
      { texto: "see the whole town", es: "ver todo el pueblo", aqui: true },
      { texto: "use the telescope", es: "usar el telescopio", aqui: true },
      { texto: "drive to the top", es: "subir en coche hasta la cima", aqui: false, regla: true },
      { texto: "swim in the sea", es: "nadar en el mar", aqui: false },
    ],
    guia: [
      "The Viewpoint is at the top of a hill, north of the town.",
      "From there, you can see the whole town and the ocean.",
      "It's a quiet place, and it's perfect for watching the sunset.",
      "There are more than 300 steps to the top, and there isn't a road for cars.",
      "There is a telescope, and it's free.",
    ],
    evid: { tranquilo: [true, 2], atardecer: [true, 2], accesible: [false, 3], gratis: [true, 4] },
  },
];

export const lugar = (id: LugarId) => LUGARES.find((l) => l.id === id)!;

/* ════════════════════════════════════════════════════════════════════════
 * 2. MODO «DESCRIBE THE PLACE»: revisar una oración armada con fichas
 * ════════════════════════════════════════════════════════════════════════ */

export type Apertura = "There is" | "There are" | "It has" | "You can" | "You can't";
export const APERTURAS: Apertura[] = ["There is", "There are", "It has", "You can", "You can't"];

export const APERTURA_ES: Record<Apertura, string> = {
  "There is": "hay (singular)",
  "There are": "hay (plural)",
  "It has": "tiene",
  "You can": "puedes (posibilidad)",
  "You can't": "no puedes (regla)",
};

/** Qué aporta una oración correcta a la entrada de la guía. */
export type TipoOracion = "sg" | "pl" | "can" | "cant";

export interface RevisionOracion {
  estado: "ok" | "valida" | "mal";
  titulo: string;
  msg: string;
  oracion: string;
  tipo: TipoOracion | null;
  prep: Prep | null;
  /** Clave del objeto que la escena resalta (si existe en la maqueta). */
  resalta: string | null;
}

const art = (fem: boolean, pl = false) => (pl ? (fem ? "las" : "los") : fem ? "la" : "el");

/** Dónde está de verdad un objeto, según las fichas de ubicación del lugar. */
export function dondeEsta(l: Lugar, clave: string): string | null {
  const u = l.ubicaciones.filter((x) => x.verdad.includes(clave));
  if (!u.length) return null;
  const n = NOMBRES[clave]!;
  const obj = l.objetos.find((o) => o.clave === clave);
  const muchos = (obj?.pos.length ?? 1) > 1;
  return u.map((x) => (muchos ? `The ${n.pl} are ${x.texto}.` : `The ${n.sg} is ${x.texto}.`)).join(" ");
}

/** ¿En qué otro lugar sí hay ese objeto? */
function otroLugarCon(clave: string, salvo: LugarId): Lugar | null {
  return LUGARES.find((l) => l.id !== salvo && l.objetos.some((o) => o.clave === clave)) ?? null;
}

export function armaOracion(ap: Apertura | null, sust: FichaSust | null, act: FichaAct | null, ubic: FichaUbic | null): string {
  if (!ap) return "";
  const cuerpo = ap === "You can" || ap === "You can't" ? (act?.texto ?? sust?.texto ?? "") : (sust?.texto ?? act?.texto ?? "");
  const partes = [ap, cuerpo, ubic && ap !== "You can" && ap !== "You can't" ? ubic.texto : ""].filter(Boolean);
  return `${partes.join(" ")}.`;
}

/**
 * Revisa una oración armada con fichas en el modo «Describe the place». Primero
 * la gramática (there is + singular, there are + plural, can + verbo base) y
 * luego la verdad contra la maqueta (cuántos hay, dónde están, qué se puede
 * hacer).
 */
export function revisaOracion(l: Lugar, ap: Apertura | null, sust: FichaSust | null, act: FichaAct | null, ubic: FichaUbic | null): RevisionOracion {
  const oracion = armaOracion(ap, sust, act, ubic);
  const mal = (titulo: string, msg: string, resalta: string | null = null): RevisionOracion => ({ estado: "mal", titulo, msg, oracion, tipo: null, prep: null, resalta });
  if (!ap) return mal("Falta el inicio", "Elige cómo empieza la oración: There is, There are, It has, You can o You can't.");
  const esCan = ap === "You can" || ap === "You can't";

  // ── Gramática
  if (esCan) {
    if (!act) {
      if (sust) return mal("Después de can va un verbo", `«${ap} ${sust.texto}» no tiene verbo. Can expresa posibilidad y va con el verbo en forma base: «You can ${l.actividades[0]!.texto}». Para decir que algo existe usa There is / There are.`);
      return mal("Falta la actividad", `Elige qué se puede hacer: «${ap} + verbo base», por ejemplo «You can ${l.actividades[0]!.texto}».`);
    }
  } else {
    if (!sust) {
      if (act) return mal("There is / There are van con un sustantivo", `«${ap} ${act.texto}» no funciona: there is / there are dicen que algo EXISTE (un sustantivo: a fountain, six benches). Para actividades usa You can + verbo: «You can ${act.texto}».`);
      return mal("Falta qué hay", `Elige un sustantivo: «${ap} + a / an / número + sustantivo».`);
    }
    if (ap === "There is" && sust.num === "pl")
      return mal(
        "There is va con singular",
        `«${sust.texto}» es plural, así que va «There are ${sust.texto}». Como dice A3: 'There are' is used with plural nouns; 'There is' con un solo objeto: «There is a ${NOMBRES[sust.clave]!.sg}».`,
      );
    if (ap === "There are" && sust.num === "sg") return mal("There are va con plural", `«${sust.texto}» es singular (a / an = uno), así que va «There is ${sust.texto}». There are es para varios: «There are two…».`);
  }

  // ── Verdad: actividades
  if (esCan && act) {
    if (ap === "You can") {
      if (!act.aqui) return mal("No es cierto en este lugar", `En ${l.es} no se puede ${act.es}.${act.regla ? " Hay un letrero que lo prohíbe: aquí va «You can't»." : ""} Mira la maqueta y elige algo que sí se pueda hacer ahí.`);
      return { estado: "ok", titulo: "¡Cierto!", msg: `Can expresa posibilidad: en ${l.es} puedes ${act.es}.`, oracion, tipo: "can", prep: null, resalta: null };
    }
    if (act.aqui) return mal("Eso sí se puede hacer", `En ${l.es} SÍ puedes ${act.es}: di «You can ${act.texto}». «You can't» es para lo que no se permite.`);
    if (act.regla) return { estado: "ok", titulo: "¡Buena advertencia!", msg: `El letrero de la maqueta lo dice: no se puede ${act.es}. «You can't + verbo base» avisa una regla del lugar.`, oracion, tipo: "cant", prep: null, resalta: "sign" };
    return {
      estado: "valida",
      titulo: "Cierto, pero poco útil",
      msg: `Es verdad que en ${l.es} no se puede ${act.es}, pero nadie lo esperaría ahí. En una guía, «You can't» sirve para advertir una regla que el visitante debe conocer (busca el letrero en la maqueta).`,
      oracion,
      tipo: null,
      prep: null,
      resalta: null,
    };
  }

  // ── Verdad: sustantivos
  const s = sust!;
  const n = NOMBRES[s.clave]!;
  const obj = l.objetos.find((o) => o.clave === s.clave);
  if (!obj) {
    const otro = otroLugarCon(s.clave, l.id);
    return mal("No está en esta maqueta", `En ${l.es} no hay ${n.fem ? "ninguna" : "ningún"} ${n.es}.${otro ? ` Hay ${n.fem ? "una" : "un"} ${n.es} en ${otro.es}.` : ""} Describe solo lo que ves.`);
  }
  const cuantos = obj.pos.length;
  if (s.num === "sg" && cuantos > 1)
    return mal("Cuenta otra vez", `En la maqueta hay ${cuantos} ${n.esPl}, no ${n.fem ? "una" : "uno"}. Di «There are ${numeroEn(cuantos)} ${n.pl}» (o «It has ${numeroEn(cuantos)} ${n.pl}»).`, s.clave);
  if (s.num === "pl" && cuantos === 1) return mal("Solo hay uno", `En ${l.es} hay solo ${n.fem ? "una" : "un"} ${n.es}: «There is a ${n.sg}».`, s.clave);
  if (typeof s.cant === "number" && s.num === "pl" && s.cant !== cuantos) return mal("Cuenta otra vez", `Hay ${cuantos} ${n.esPl}, no ${s.cant}: «There are ${numeroEn(cuantos)} ${n.pl}».`, s.clave);
  if (s.cant === "many" && cuantos < 4) return mal("No son tantos", `Hay solo ${cuantos} ${n.esPl}: «many» es para muchos. Di «There are ${numeroEn(cuantos)} ${n.pl}».`, s.clave);
  if (s.cant === "some" && cuantos < 2) return mal("Solo hay uno", `«Some» es para varios; aquí hay ${n.fem ? "una" : "un"} ${n.es}.`, s.clave);

  // ── Verdad: ubicación
  if (ubic && !ubic.verdad.includes(s.clave)) {
    const real = dondeEsta(l, s.clave);
    const plural = cuantos > 1;
    return mal(
      "Mira bien dónde está",
      `${art(n.fem, plural).charAt(0).toUpperCase()}${art(n.fem, plural).slice(1)} ${plural ? n.esPl : n.es} no ${plural ? "están" : "está"} ${ubic.es}.${real ? ` En la maqueta: «${real}»` : " Busca en la maqueta dónde está y prueba otra ubicación, o arma la oración sin ubicación."}`,
      s.clave,
    );
  }

  const tipo: TipoOracion = s.num === "sg" ? "sg" : "pl";
  const extraHas = ap === "It has" ? " «It has» sirve igual para singular y plural." : "";
  const extraUbic = ubic ? ` «${ubic.texto}» = ${ubic.es}.` : "";
  return {
    estado: "ok",
    titulo: "¡Cierto!",
    msg: `${s.num === "sg" ? `Hay ${n.fem ? "una" : "un"} ${n.es}` : `Hay ${cuantos} ${n.esPl}`} en ${l.es}.${extraHas}${extraUbic}`,
    oracion,
    tipo,
    prep: ubic?.prep ?? null,
    resalta: s.clave,
  };
}

export const TIPO_DEF: Record<TipoOracion, { etq: string; es: string }> = {
  sg: { etq: "There is / It has + singular", es: "algo que hay (uno)" },
  pl: { etq: "There are / It has + plural", es: "algo que hay (varios)" },
  can: { etq: "You can + verbo", es: "algo que se puede hacer" },
  cant: { etq: "You can't + verbo", es: "una regla del lugar" },
};

/** Una entrada de la guía está completa con singular, plural y una actividad. */
export const TIPOS_ENTRADA: TipoOracion[] = ["sg", "pl", "can"];

/* ════════════════════════════════════════════════════════════════════════
 * 3. MODO «GUIDEBOOK»: leer la guía y elegir el lugar de cada visitante
 * ════════════════════════════════════════════════════════════════════════ */

export const TAG_GUIA_ES: Record<TagGuia, string> = {
  accesible: "entrar en silla de ruedas",
  historia: "aprender historia",
  ninos: "ir con niños pequeños",
  nadar: "nadar",
  barato: "precios bajos",
  souvenirs: "comprar recuerdos",
  tranquilo: "un lugar tranquilo",
  atardecer: "ver el atardecer",
  tour: "un recorrido con guía",
  caminar: "caminar por un sendero",
  musica: "música en vivo",
  gratis: "que sea gratis",
};

export interface VisitanteGuia {
  id: string;
  nombre: string;
  /** Lo que dice en inglés. */
  pide: string;
  es: string;
  req: TagGuia[];
  /** La etiqueta cuya evidencia hay que señalar en la guía. */
  clave: TagGuia;
  preguntaEvidencia: string;
  ropa: string;
  accesorio: "silla" | "ninos" | "mochila" | "pareja" | "libro" | "toalla" | "sombrero";
}

export const VISITANTES_GUIA: VisitanteGuia[] = [
  {
    id: "ernesto",
    nombre: "Don Ernesto",
    pide: "I use a wheelchair, and I want to learn about the history of the town.",
    es: "Usa silla de ruedas y quiere aprender la historia del pueblo.",
    req: ["accesible", "historia"],
    clave: "accesible",
    preguntaEvidencia: "¿Qué oración de la guía prueba que Don Ernesto puede entrar y subir en silla de ruedas?",
    ropa: "#0ea5e9",
    accesorio: "silla",
  },
  {
    id: "perez",
    nombre: "The Pérez family",
    pide: "We have two small children, and we want to swim in a safe place.",
    es: "Tienen dos hijos pequeños y quieren nadar en un lugar seguro.",
    req: ["nadar", "ninos"],
    clave: "ninos",
    preguntaEvidencia: "¿Qué oración prueba que es un lugar seguro para nadar con niños?",
    ropa: "#f97316",
    accesorio: "ninos",
  },
  {
    id: "sam",
    nombre: "Sam",
    pide: "I don't have much money, and I want to buy souvenirs for my family.",
    es: "Tiene poco dinero y quiere comprar recuerdos para su familia.",
    req: ["souvenirs", "barato"],
    clave: "barato",
    preguntaEvidencia: "¿Qué oración prueba que ahí los precios son bajos?",
    ropa: "#22c55e",
    accesorio: "mochila",
  },
  {
    id: "ana-luis",
    nombre: "Ana and Luis",
    pide: "We want to watch the sunset in a quiet place.",
    es: "Quieren ver el atardecer en un lugar tranquilo.",
    req: ["atardecer", "tranquilo"],
    clave: "tranquilo",
    preguntaEvidencia: "¿Qué oración prueba que es un lugar tranquilo?",
    ropa: "#e11d48",
    accesorio: "pareja",
  },
  {
    id: "mei",
    nombre: "Mei",
    pide: "I love history, and I want to take a tour with a guide.",
    es: "Le encanta la historia y quiere un recorrido con guía.",
    req: ["historia", "tour"],
    clave: "tour",
    preguntaEvidencia: "¿Qué oración prueba que ahí hay recorridos con guía?",
    ropa: "#8b5cf6",
    accesorio: "libro",
  },
  {
    id: "diego",
    nombre: "Diego",
    pide: "I love hiking, and I want to swim in fresh water, not in the ocean.",
    es: "Le encanta caminar en la naturaleza y quiere nadar en agua dulce, no en el mar.",
    req: ["caminar", "nadar"],
    clave: "caminar",
    preguntaEvidencia: "¿Qué oración prueba que para llegar se camina por un sendero?",
    ropa: "#14b8a6",
    accesorio: "toalla",
  },
  {
    id: "rojas",
    nombre: "Mrs. Rojas",
    pide: "It's Sunday evening. I want to listen to live music, but I don't want to spend money.",
    es: "Es domingo en la tarde; quiere escuchar música en vivo sin gastar dinero.",
    req: ["musica", "gratis"],
    clave: "musica",
    preguntaEvidencia: "¿Qué oración prueba que hay música en vivo gratis?",
    ropa: "#eab308",
    accesorio: "sombrero",
  },
];

/** Lugares que cumplen TODO lo que pide un visitante según la guía. */
export function lugaresQueCumplen(v: VisitanteGuia): LugarId[] {
  return LUGARES.filter((l) => v.req.every((t) => l.evid[t]?.[0] === true)).map((l) => l.id);
}

export interface JuicioGuia {
  ok: boolean;
  msg: string;
  /** Oración de la guía que explica el problema (si la guía lo menciona). */
  cita: string | null;
}

/** ¿Por qué un lugar sirve o no a un visitante? Siempre citando la guía. */
export function juzgaGuia(v: VisitanteGuia, id: LugarId): JuicioGuia {
  const l = lugar(id);
  for (const t of v.req) {
    const e = l.evid[t];
    if (e && !e[0]) return { ok: false, msg: `${v.nombre} necesita ${TAG_GUIA_ES[t]}, y la guía de ${l.es} dice lo contrario.`, cita: l.guia[e[1]]! };
  }
  const falta = v.req.find((t) => !l.evid[t]);
  if (falta) return { ok: false, msg: `La guía de ${l.es} no dice nada sobre ${TAG_GUIA_ES[falta]}, y ${v.nombre} lo necesita. Busca un lugar cuya guía lo diga claramente.`, cita: null };
  const e = l.evid[v.clave]!;
  return { ok: true, msg: `¡Buena lectura! ${l.nombre} cumple con todo lo que pide ${v.nombre}.`, cita: l.guia[e[1]]! };
}

/** Oraciones de la guía que prueban la etiqueta clave del visitante. */
export function evidenciasValidas(v: VisitanteGuia, id: LugarId): number[] {
  const l = lugar(id);
  const e = l.evid[v.clave];
  return e && e[0] ? [e[1]] : [];
}

/* ════════════════════════════════════════════════════════════════════════
 * 4. MODO «RECOMMEND IT»: revisar una recomendación escrita
 * ════════════════════════════════════════════════════════════════════════ */

export type TagRazon =
  | "nadar"
  | "deporte"
  | "animales"
  | "comida"
  | "compras"
  | "barato"
  | "caro"
  | "historia"
  | "antigua"
  | "arte"
  | "fotos"
  | "paisaje"
  | "atardecer"
  | "tranquilo"
  | "concurrido"
  | "caminar"
  | "musica"
  | "accesible"
  | "escaleras"
  | "ninos"
  | "peligroNinos"
  | "telescopio"
  | "picnic"
  | "tour"
  | "gratis";

export const TAG_RAZON_ES: Record<TagRazon, string> = {
  nadar: "nadar",
  deporte: "hacer deportes acuáticos como el kayak",
  animales: "ver animales",
  comida: "comer",
  compras: "comprar cosas",
  barato: "encontrar precios bajos",
  caro: "que sea caro",
  historia: "aprender historia",
  antigua: "ver ruinas antiguas",
  arte: "ver arte o artesanías",
  fotos: "tomar o ver fotos",
  paisaje: "ver un buen paisaje",
  atardecer: "ver el atardecer",
  tranquilo: "estar en un lugar tranquilo",
  concurrido: "que haya mucha gente",
  caminar: "caminar o hacer senderismo",
  musica: "escuchar música",
  accesible: "llegar sin escaleras (rampa o elevador)",
  escaleras: "subir muchas escaleras",
  ninos: "hacer actividades con niños",
  peligroNinos: "que sea peligroso para niños",
  telescopio: "usar un telescopio",
  picnic: "hacer un picnic",
  tour: "tomar un recorrido guiado",
  gratis: "entrar gratis",
};

/** Etiquetas que son una desventaja: no sirven como razón para recomendar. */
export const TAGS_NEGATIVOS: TagRazon[] = ["caro", "concurrido", "escaleras", "peligroNinos"];

/** Palabras que delatan cada etiqueta en el texto del alumno (ya normalizado). */
const LEXICO: [TagRazon, RegExp][] = [
  ["nadar", /\bswim(?:ming)?\b/],
  ["deporte", /\b(?:kayak(?:s|ing)?|water sports?|surf(?:ing)?|snorkel(?:ing)?|paddle(?:board)?)\b/],
  ["animales", /\b(?:turtles?|animals?|wildlife)\b/],
  ["comida", /\b(?:eat|eating|food|seafood|quesadillas?|ice cream|snacks?|tacos?|delicious|restaurant)\b/],
  ["compras", /\b(?:buy|buying|shopping|shop|souvenirs?)\b/],
  ["barato", /\b(?:cheap|low prices?|inexpensive|affordable)\b/],
  ["caro", /\bexpensive\b/],
  ["historia", /\b(?:history|historic|historical)\b/],
  ["antigua", /\b(?:ancient|ruins|pyramids?|archaeological|archeological|stone monuments?|ball court)\b/],
  ["arte", /\b(?:art|arts|mural|murals|paintings?|crafts?|handmade|pottery|clay pots)\b/],
  ["fotos", /\b(?:photos?|pictures?|photograph(?:s|y)?)\b/],
  ["paisaje", /\b(?:views?|landscapes?|scenery|whole town|panoramic)\b/],
  ["atardecer", /\bsunsets?\b/],
  ["tranquilo", /\b(?:quiet|peaceful|calm|relax|relaxing)\b/],
  ["concurrido", /\b(?:crowded|noisy)\b/],
  ["caminar", /\b(?:hike|hiking|trails?|walk|walking)\b/],
  ["musica", /\b(?:music|band|concerts?|musicians?)\b/],
  ["accesible", /\b(?:elevator|ramps?|wheelchairs?|accessible)\b/],
  ["escaleras", /\b(?:stairs|steps|staircase)\b/],
  ["ninos", /\b(?:children|kids?|child|workshop)\b/],
  ["telescopio", /\btelescopes?\b/],
  ["picnic", /\bpicnics?\b/],
  ["tour", /\b(?:tours?|guided)\b/],
  ["gratis", /\bfree\b/],
];

const NEGADORES = new Set(["no", "not", "without", "never", "cannot", "any"]);

/** Etiquetas mencionadas en un texto normalizado, sin las que van negadas (no stairs, not crowded…). */
export function tagsDe(texto: string): TagRazon[] {
  const out = new Set<TagRazon>();
  for (const [tag, re] of LEXICO) {
    const g = new RegExp(re.source, "g");
    for (const m of texto.matchAll(g)) {
      const antes = texto.slice(0, m.index).trim().split(" ").slice(-3);
      if (antes.some((w) => NEGADORES.has(w))) continue;
      out.add(tag);
    }
  }
  return [...out];
}

export interface VerdadLugar {
  si: TagRazon[];
  no: TagRazon[];
}

/** Lo que es cierto (si) y claramente falso (no) de cada lugar; lo demás no se puede verificar. */
export const VERDAD: Record<LugarId, VerdadLugar> = {
  plaza: { si: ["comida", "musica", "accesible", "gratis", "fotos", "tranquilo"], no: ["nadar", "deporte", "animales", "antigua", "telescopio", "escaleras", "picnic"] },
  mercado: { si: ["compras", "arte", "comida", "barato", "concurrido", "fotos"], no: ["nadar", "deporte", "animales", "antigua", "telescopio", "tranquilo", "atardecer", "paisaje", "picnic"] },
  museo: { si: ["historia", "arte", "accesible", "ninos", "fotos"], no: ["nadar", "deporte", "animales", "comida", "telescopio", "picnic", "atardecer", "paisaje", "escaleras"] },
  cascada: { si: ["nadar", "caminar", "picnic", "paisaje", "fotos", "escaleras", "peligroNinos"], no: ["deporte", "historia", "antigua", "compras", "musica", "telescopio", "accesible", "gratis", "arte", "animales"] },
  ruinas: { si: ["historia", "antigua", "tour", "caminar", "fotos", "escaleras"], no: ["nadar", "deporte", "compras", "musica", "telescopio", "accesible", "comida", "picnic", "animales"] },
  playa: { si: ["nadar", "deporte", "animales", "comida", "caro", "ninos", "paisaje", "fotos", "caminar"], no: ["historia", "antigua", "telescopio", "accesible", "barato", "musica", "escaleras"] },
  mirador: { si: ["paisaje", "atardecer", "tranquilo", "fotos", "telescopio", "gratis", "escaleras", "caminar"], no: ["nadar", "deporte", "animales", "compras", "comida", "antigua", "historia", "accesible", "musica", "concurrido", "picnic"] },
};

/** Explicación, por lugar, de las desventajas (etiquetas negativas). */
export const DESVENTAJA_ES: Partial<Record<LugarId, Partial<Record<TagRazon, string>>>> = {
  mercado: { concurrido: "El mercado se llena de gente y hay mucho ruido, sobre todo el fin de semana." },
  cascada: { escaleras: "Para llegar a la cascada hay un sendero con 200 escalones.", peligroNinos: "La poza de la cascada es muy profunda: no es un buen lugar para niños pequeños." },
  ruinas: { escaleras: "Los caminos de la zona arqueológica tienen muchos escalones de piedra." },
  playa: { caro: "El restaurante de la playa es caro." },
  mirador: { escaleras: "Hay más de 300 escalones para subir al mirador." },
};

export interface Turista {
  id: string;
  nombre: string;
  /** Lo que cuenta de sí en inglés. */
  dice: string;
  es: string;
  quiere: TagRazon[];
  evita: TagRazon[];
  /** Línea en inglés cuando le encanta cada lugar bueno. */
  feliz: Partial<Record<LugarId, string>>;
  meh: string;
  ropa: string;
  pelo: string;
  accesorio: "camara" | "baston" | "tabla" | "nino" | "bolsa" | "gorra";
}

export const TURISTAS: Turista[] = [
  {
    id: "lucia",
    nombre: "Lucía",
    dice: "I love taking photos of landscapes, but I don't like crowded places.",
    es: "Le encanta fotografiar paisajes, pero no le gustan los lugares llenos de gente.",
    quiere: ["paisaje"],
    evita: ["concurrido"],
    feliz: { mirador: "What a view! I can see the whole town from here.", cascada: "This waterfall is perfect for my photos!", playa: "The ocean looks amazing in my photos!" },
    meh: "It's OK, but there aren't any great landscapes here.",
    ropa: "#f472b6",
    pelo: "#1c1917",
    accesorio: "camara",
  },
  {
    id: "grant",
    nombre: "Mr. Grant",
    dice: "I love art, but I have a bad knee, so I can't climb a lot of stairs.",
    es: "Le encanta el arte, pero le duele la rodilla y no puede subir muchas escaleras.",
    quiere: ["arte"],
    evita: ["escaleras"],
    feliz: { museo: "The mural is beautiful, and there's an elevator. Perfect!", mercado: "These handmade crafts are real works of art!" },
    meh: "It's nice, but I wanted to see some art.",
    ropa: "#64748b",
    pelo: "#cbd5e1",
    accesorio: "baston",
  },
  {
    id: "tom",
    nombre: "Tom",
    dice: "I love the ocean and water sports.",
    es: "Le encantan el mar y los deportes acuáticos.",
    quiere: ["deporte"],
    evita: [],
    feliz: { playa: "I'm renting a kayak right now. This is great!" },
    meh: "It's nice, but I wanted to be on the ocean.",
    ropa: "#0ea5e9",
    pelo: "#d8b25a",
    accesorio: "tabla",
  },
  {
    id: "ramirez",
    nombre: "The Ramírez family",
    dice: "Our son is five years old, and he loves animals.",
    es: "Su hijo tiene cinco años y le encantan los animales.",
    quiere: ["animales"],
    evita: ["peligroNinos"],
    feliz: { playa: "Look, son! Baby sea turtles!" },
    meh: "It's nice, but there aren't any animals for our son here.",
    ropa: "#16a34a",
    pelo: "#3f2a1d",
    accesorio: "nino",
  },
  {
    id: "aisha",
    nombre: "Aisha",
    dice: "I love trying local food, but I'm on a tight budget.",
    es: "Le encanta probar comida local, pero tiene poco presupuesto.",
    quiere: ["comida"],
    evita: ["caro"],
    feliz: { mercado: "These quesadillas are delicious, and they're cheap!", plaza: "This ice cream is delicious, and it doesn't cost much!" },
    meh: "It's nice, but I'm hungry. Where can I eat?",
    ropa: "#f59e0b",
    pelo: "#111827",
    accesorio: "bolsa",
  },
  {
    id: "ken",
    nombre: "Ken",
    dice: "I'm really interested in ancient history, and I love walking outdoors.",
    es: "Le interesa mucho la historia antigua y le encanta caminar al aire libre.",
    quiere: ["antigua"],
    evita: [],
    feliz: { ruinas: "An ancient pyramid and a ball court! This is amazing!" },
    meh: "It's interesting, but I wanted to see ancient ruins.",
    ropa: "#a3e635",
    pelo: "#27272a",
    accesorio: "gorra",
  },
];

/** Queja en inglés por la desventaja que el visitante quería evitar. */
export const QUEJA_EN: Partial<Record<TagRazon, string>> = {
  concurrido: "Oh no, there are too many people here!",
  escaleras: "Oh no! There are too many steps for my knee.",
  peligroNinos: "The water is too deep for our son!",
  caro: "This restaurant is too expensive for me!",
};

export type Reaccion = "feliz" | "meh" | "triste";

export interface JuicioTurista {
  reaccion: Reaccion;
  linea: string;
  msg: string;
}

export function reaccionTurista(t: Turista, id: LugarId): JuicioTurista {
  const l = lugar(id);
  const v = VERDAD[id];
  const malo = t.evita.find((x) => v.si.includes(x));
  if (malo) return { reaccion: "triste", linea: QUEJA_EN[malo] ?? "Oh no…", msg: `${t.nombre} quería evitar ${TAG_RAZON_ES[malo]}. ${DESVENTAJA_ES[id]?.[malo] ?? ""} Recomiéndale otro lugar.` };
  const bueno = t.quiere.find((x) => v.si.includes(x));
  if (bueno) return { reaccion: "feliz", linea: t.feliz[id] ?? "I love it here. Thank you!", msg: `¡A ${t.nombre} le encantó ${l.es}! Ahí puede ${TAG_RAZON_ES[bueno]}, justo lo que buscaba.` };
  return { reaccion: "meh", linea: t.meh, msg: `${t.nombre} no se queja, pero en ${l.es} no puede ${TAG_RAZON_ES[t.quiere[0]!]}, que es lo que busca. Recomiéndale un lugar que encaje mejor.` };
}

export function lugaresFelices(t: Turista): LugarId[] {
  return LUGAR_IDS.filter((id) => reaccionTurista(t, id).reaccion === "feliz");
}

/** Sinónimos de cada lugar (texto normalizado, sin acentos). El primero en aparecer manda. */
const SINONIMOS: [LugarId, RegExp][] = [
  ["plaza", /\b(?:main square|town square|square|plaza|zocalo|kiosk)\b/],
  ["mercado", /\b(?:crafts? market|market|mercado)\b/],
  ["museo", /\b(?:community museum|museum|museo)\b/],
  ["cascada", /\b(?:el salto|waterfalls?|falls|cascada|natural pool)\b/],
  ["ruinas", /\b(?:archaeological site|archeological site|archaeological zone|ruins|pyramid|zona arqueologica)\b/],
  ["playa", /\b(?:colibri beach|beach|playa)\b/],
  ["mirador", /\b(?:viewpoint|view point|lookout|mirador)\b/],
];
const NOMBRES_ES = /\b(?:mercado|museo|cascada|zona arqueologica|playa|mirador)\b/;

export type FormaRec = "should" | "recommend" | "dontmiss" | "goodplace" | "whynot";
export const FORMA_REC_DEF: Record<FormaRec, string> = {
  should: "You should + verbo",
  recommend: "I recommend…",
  dontmiss: "Don't miss…",
  goodplace: "It's a good place to…",
  whynot: "Why don't you…?",
};

export interface RevisionRec {
  estado: "ok" | "valida" | "mal";
  errores: string[];
  /** Inglés correcto, pero con una observación (forma débil, razón que no se puede verificar…). */
  notas: string[];
  lugar: LugarId | null;
  forma: FormaRec | null;
  oracion: string;
}

const VERBOS_BASE = new Set(
  "visit go see try check explore take swim eat buy rent watch walk hike learn listen use have climb enjoy relax sit bring spend find take".split(" "),
);
const PLURALES = /\bthere is (?:many|some|a lot of|lots of|two|three|four|five|six|seven|eight|nine|ten|\d+)\b/;
const NO_ING = new Set(["bring", "sing", "ring", "thing", "spring", "string", "king", "evening", "morning", "building", "nothing", "something", "everything", "anything"]);

const MARCAS_ESPANOL = /\b(?:deberias|visitar|porque|puedes|nadar|comer|lugar|recomiendo|hay|muy|para|donde|el|la|los|las|que|con|una)\b/g;

/**
 * Revisa una recomendación escrita. Tolerante con mayúsculas, puntuación,
 * acentos y contracciones (it's = it is, don't = do not). Exige tres cosas: una
 * forma de recomendar, UN lugar del pueblo y una razón. La razón se compara con
 * lo que es cierto de ese lugar. Los errores son solo de inglés incorrecto o de
 * información falsa; las formas válidas pero menos naturales (you can visit,
 * visit the…, you must…) se aceptan en ámbar con su explicación.
 */
export function revisaRecomendacion(texto: string): RevisionRec {
  const oracion = pulirOracion(texto);
  const s = expandeIngles(texto);
  const errores: string[] = [];
  const notas: string[] = [];
  const res = (estado: RevisionRec["estado"], lugarId: LugarId | null = null, forma: FormaRec | null = null): RevisionRec => ({ estado, errores: errores.slice(0, 3), notas, lugar: lugarId, forma, oracion });
  if (!s) {
    errores.push("Escribe tu recomendación en inglés.");
    return res("mal");
  }
  const palabras = s.split(" ");
  if ((s.match(MARCAS_ESPANOL) ?? []).length >= 3) {
    errores.push("Escríbela en inglés. Por ejemplo: «You should visit the waterfall because you can swim there.»");
    return res("mal");
  }
  if (palabras.length < 5) {
    errores.push("Escribe una oración completa: recomendación + lugar + razón. Por ejemplo: «You should visit the beach because you can rent a kayak.»");
    return res("mal");
  }

  // ── Errores de inglés frecuentes
  if (/\bshould to\b/.test(s)) errores.push("Después de «should» va el verbo base SIN «to»: «You should visit…», no «should to visit».");
  const shouldIng = /\bshould ([a-z]+ing)\b/.exec(s);
  if (shouldIng && !NO_ING.has(shouldIng[1]!)) errores.push(`Después de «should» va el verbo en forma base: «You should visit», no «should ${shouldIng[1]}».`);
  if (/\bshould (?:visits|goes|sees|tries|takes)\b/.test(s)) errores.push("Después de «should» el verbo no lleva -s: «You should visit…».");
  if (/\bshould (?:visited|went|saw|tried|took)\b/.test(s)) errores.push("Después de «should» va el verbo base, no el pasado: «You should go…», «You should see…».");
  if (/\brecommend (?:you|him|her|them) to\b/.test(s)) errores.push("«I recommend you to visit» no es correcto en inglés estándar. Di «I recommend visiting the…» o «I recommend that you visit the…».");
  else if (/\brecommend to (?:visit|go|see|try)\b/.test(s)) errores.push("Después de «recommend» no va «to + verbo»: «I recommend visiting the…» o «I recommend the…».");
  if (/\bvisit to\b/.test(s)) errores.push("«Visit» no lleva «to»: «visit the museum». Con «go» sí: «go to the museum».");
  if (/\b(?:go|going) (?:the|a)\b/.test(s)) errores.push("Con «go» hace falta «to»: «go to the beach», no «go the beach».");
  if (/\bcan to\b/.test(s)) errores.push("Después de «can» va el verbo base sin «to»: «you can swim», no «can to swim».");
  const canMal = /\bcan ([a-z]+(?:ing|s))\b/.exec(s);
  if (canMal && !NO_ING.has(canMal[1]!) && !/(?:ss|us|is)$/.test(canMal[1]!) && canMal[1] !== "kayaks") errores.push(`Después de «can» va el verbo base: «you can swim», no «can ${canMal[1]}».`);
  if (PLURALES.test(s)) errores.push("Con plural va «there are»: «There are many food stalls» (A3: 'There are' is used with plural nouns).");
  if (/\bthere are (?:a|an|one)\b/.test(s)) errores.push("Con singular va «there is»: «There is a natural pool» (A3).");
  if (/\bmiss to\b/.test(s)) errores.push("«Don't miss» va directo con el lugar: «Don't miss the viewpoint!», sin «to».");
  if (/\bplace for (?:swim|eat|buy|watch|see|walk|hike|learn|relax|rent)\b/.test(s)) errores.push("Di «a good place to swim» (to + verbo) o «a good place for swimming» (for + -ing), no «for swim».");
  const becauseVerbo = /\bbecause ([a-z]+)/.exec(s);
  if (becauseVerbo && (becauseVerbo[1] === "can" || VERBOS_BASE.has(becauseVerbo[1]!))) errores.push("Después de «because» va una oración con sujeto: «because you can swim there», no «because can swim».");

  // ── Forma de recomendar
  let forma: FormaRec | null = null;
  let finForma = -1;
  const formas: [FormaRec | "can" | "imperativo" | "must", RegExp][] = [
    ["should", /\byou (?:really |definitely |also )?should (?:really |definitely |also )?(?:visit|go|see|check out|try|explore|take|spend)\b/],
    ["recommend", /\bi (?:would |really |highly |strongly )?recommend(?:s)?\b/],
    ["dontmiss", /\bdo not miss\b/],
    ["whynot", /\bwhy do not you (?:visit|go|see|try)\b/],
    ["goodplace", /\b(?:is|it is) (?:a |the )?(?:really )?(?:good|great|perfect|nice|wonderful|excellent|beautiful) place (?:to|for)\b/],
    ["must", /\byou (?:must|have to) (?:visit|go|see|try)\b/],
    ["can", /\byou can (?:visit|go to|see|try)\b/],
    ["imperativo", /^(?:please )?(?:visit|go to|see|try|check out)\b/],
  ];
  let debil: "can" | "imperativo" | "must" | null = null;
  for (const [f, re] of formas) {
    const m = re.exec(s);
    if (!m) continue;
    if (f === "can" || f === "imperativo" || f === "must") {
      if (!debil && forma === null) {
        debil = f;
        finForma = m.index + m[0].length;
      }
      continue;
    }
    if (forma === null) {
      forma = f;
      finForma = f === "goodplace" ? 0 : m.index + m[0].length;
    }
  }
  if (forma === null && debil === null && !errores.some((e) => e.includes("should") || e.includes("recommend"))) {
    errores.push("Falta la recomendación. Usa «You should visit…», «I recommend…», «Don't miss…» o «It's a good place to…» (A5: you should / you can).");
  }

  // ── El lugar
  const buscaLugar = (desde: number): { id: LugarId; ini: number; fin: number } | null => {
    let mejor: { id: LugarId; ini: number; fin: number } | null = null;
    const base = Math.max(0, desde);
    const sub = s.slice(base);
    for (const [id, re] of SINONIMOS) {
      const m = re.exec(sub);
      if (m && (!mejor || base + m.index < mejor.ini)) mejor = { id, ini: base + m.index, fin: base + m.index + m[0].length };
    }
    return mejor;
  };
  const hall = buscaLugar(finForma >= 0 ? finForma : 0) ?? buscaLugar(0);
  if (!hall) {
    errores.push("¿Qué lugar recomiendas? Nómbralo en inglés: the main square, the crafts market, the museum, the waterfall, the archaeological site, the beach o the viewpoint.");
    return res("mal", null, forma);
  }
  const nombreLugar = s.slice(hall.ini, hall.fin);
  if (NOMBRES_ES.test(nombreLugar)) notas.push("Usa el nombre del lugar en inglés (the beach, the viewpoint…): tu visitante no habla español.");
  else if (!/^(?:el salto|colibri beach)$/.test(nombreLugar) && !/\bthe (?:[a-z]+ )?$/.test(s.slice(Math.max(0, hall.ini - 20), hall.ini)))
    notas.push(`Los lugares llevan «the»: «${lugar(hall.id).en}».`);

  // ── La razón
  const resto = forma === "goodplace" ? s : s.slice(hall.fin);
  const hayRazon = forma === "goodplace" || /\b(?:because|you can|there is|there are|it has|it is|so|to [a-z]+|for [a-z]+ing|where|if you)\b/.test(resto);
  if (!hayRazon) {
    errores.push("Falta la razón: explica por qué, por ejemplo «…because you can swim there» o «…because it is quiet».");
    return res("mal", hall.id, forma);
  }
  const tags = tagsDe(resto);
  const v = VERDAD[hall.id];
  const l = lugar(hall.id);
  const falsos = tags.filter((t) => v.no.includes(t));
  if (falsos.length) {
    const ejemplo = l.actividades.find((a) => a.aqui)!;
    errores.push(`Tu razón no es cierta: en ${l.es} no se puede ${TAG_RAZON_ES[falsos[0]!]}. Algo que sí es cierto: «You can ${ejemplo.texto} there».`);
  }
  if (errores.length) return res("mal", hall.id, forma);

  const negativos = tags.filter((t) => TAGS_NEGATIVOS.includes(t) && v.si.includes(t));
  if (negativos.length) notas.push(`Eso es cierto, pero ${TAG_RAZON_ES[negativos[0]!]} no es una razón para recomendar un lugar. Menciona algo bueno que se pueda hacer ahí.`);
  if (!tags.some((t) => v.si.includes(t))) notas.push("No pude verificar tu razón con lo que hay en ese lugar; asegúrate de que sea cierta.");
  if (debil === "can" && forma === null) notas.push("Correcto: «You can visit…» dice que es posible. Para RECOMENDAR suena más claro «You should visit…» (A4: should + verbo base).");
  if (debil === "imperativo" && forma === null) notas.push("Correcto: el imperativo («Visit the…») es un consejo directo. Para una recomendación amable usa «You should visit…» o «I recommend…».");
  if (debil === "must" && forma === null) notas.push("Correcto, pero «must / have to» suena a obligación. Para recomendar es más natural «You should…» o «Don't miss…».");
  return res(notas.length ? "valida" : "ok", hall.id, forma);
}

/** ¿La razón del alumno toca lo que le interesa al turista? */
export function razonRelevante(texto: string, lugarId: LugarId, t: Turista): boolean {
  const s = expandeIngles(texto);
  const tags = tagsDe(s);
  const v = VERDAD[lugarId];
  return tags.some((x) => t.quiere.includes(x) && v.si.includes(x));
}

/* ════════════════════════════════════════════════════════════════════════
 * 5. «TU TURNO» — actividad final del glosario A5 (revisión orientativa)
 * ════════════════════════════════════════════════════════════════════════ */

export const PREPS_TEXTO = ["next to", "in front of", "between", "behind", "opposite", "above", "below", "on the corner of", "across from", "near", "inside", "in the middle of"];

export interface AnalisisA5 {
  palabras: number;
  thereIsAre: number;
  preps: string[];
  should: number;
  errores: string[];
}

export function analizaA5(texto: string): AnalisisA5 {
  const s = expandeIngles(texto);
  const palabras = texto.split(/\s+/).filter((w) => /[a-zA-Z0-9áéíóúñ]/.test(w)).length;
  const thereIsAre = (s.match(/\bthere (?:is|are)\b/g) ?? []).length;
  const preps = PREPS_TEXTO.filter((p) => new RegExp(`\\b${p}\\b`).test(s));
  const should = (s.match(/\byou should (?:really |definitely )?([a-z]+)/g) ?? []).filter((m) => !/should (?:to|[a-z]+ing)$/.test(m)).length;
  const errores: string[] = [];
  if (PLURALES.test(s)) errores.push("there is + plural (usa there are)");
  if (/\bthere are (?:a|an|one)\b/.test(s)) errores.push("there are + singular (usa there is)");
  if (/\bshould to\b/.test(s)) errores.push("should to (sin to)");
  const ing = /\bshould ([a-z]+ing)\b/.exec(s);
  if (ing && !NO_ING.has(ing[1]!)) errores.push(`should ${ing[1]} (verbo base)`);
  return { palabras, thereIsAre, preps, should, errores };
}

export const A5_CONSIGNA = "Describe un lugar conocido de tu ciudad usando there is/are, al menos 3 preposiciones de lugar y una recomendación con 'you should'.";
export const A5_MIN = 35;

/* ════════════════════════════════════════════════════════════════════════
 * Estrellas — A9 «Relaciona los conceptos clave» (verbatim)
 * ════════════════════════════════════════════════════════════════════════ */

export const PAREJAS_A9: { izquierda: string; derecha: string }[] = [
  { izquierda: "between", derecha: "In the space that separates two things (entre — dos cosas)." },
  { izquierda: "opposite", derecha: "On the other side of a street or space (frente a, en el lado contrario)." },
  { izquierda: "on the corner of", derecha: "Located at the intersection of two streets (en la esquina de)." },
  { izquierda: "in front of", derecha: "Facing something, on the opposite side (enfrente de)." },
  { izquierda: "next to", derecha: "Immediately beside something or someone (al lado de)." },
];
export const DISTRACTORES_A9 = ["At the back of something (detrás de).", "'Can' is also used to express possibility — something that is possible to find or do in a place."];
export const INSTRUCCIONES_A9 =
  "Toca un concepto de la izquierda y después la definición que le corresponde. Son los términos del glosario de esta progresión: la idea es reconstruirlos de memoria, no buscarlos.";
export const DEFINICIONES_A9: string[] = [...PAREJAS_A9.map((p) => p.derecha), ...DISTRACTORES_A9];

export function rondaA9(rnd: () => number): { orden: number[]; defs: number[] } {
  return {
    orden: baraja(
      PAREJAS_A9.map((_, i) => i),
      rnd,
    ),
    defs: baraja(
      DEFINICIONES_A9.map((_, i) => i),
      rnd,
    ),
  };
}

/* ════════════════════════════════════════════════════════════════════════
 * Contenido VERBATIM
 * ════════════════════════════════════════════════════════════════════════ */

/** Glosario A1 «Describing Places with Prepositions» — verbatim. */
export const GLOSARIO_A1: { termino: string; definicion: string; ejemplo: string }[] = [
  { termino: "next to", definicion: "Immediately beside something or someone (al lado de).", ejemplo: "The pharmacy is next to the bakery." },
  { termino: "in front of", definicion: "Facing something, on the opposite side (enfrente de).", ejemplo: "There is a fountain in front of the school." },
  { termino: "between", definicion: "In the space that separates two things (entre — dos cosas).", ejemplo: "The bank is between the hotel and the restaurant." },
  { termino: "behind", definicion: "At the back of something (detrás de).", ejemplo: "The parking lot is behind the shopping center." },
  { termino: "there is", definicion: "Used to say that something exists or can be found in a place (singular).", ejemplo: "There is a library on the second floor." },
  { termino: "there are", definicion: "Used to say that multiple things exist or can be found in a place (plural).", ejemplo: "There are three parks in this neighborhood." },
  { termino: "can (posibilidad)", definicion: "'Can' is also used to express possibility — something that is possible to find or do in a place.", ejemplo: "You can find fresh fruit at the market next to the church." },
  { termino: "opposite", definicion: "On the other side of a street or space (frente a, en el lado contrario).", ejemplo: "The school is opposite the park." },
  { termino: "above / below", definicion: "Higher than (above) or lower than (below) something (encima de / debajo de).", ejemplo: "The apartment is above the store. The basement is below the lobby." },
  { termino: "on the corner of", definicion: "Located at the intersection of two streets (en la esquina de).", ejemplo: "There is a pharmacy on the corner of Juárez and Hidalgo." },
];
export const TITULO_A1 = "Describing Places with Prepositions";
export const ACTIVIDAD_A1 = "Elige 5 preposiciones del glosario. Escribe una oración en inglés para cada una describiendo un lugar real de tu comunidad. Ejemplo: 'The market is next to the church on Morelos street.'";

/** Glosario A5 «Glossary — Places, prepositions & recommendations» — verbatim. */
export const GLOSARIO_A5: { termino: string; definicion: string; ejemplo: string }[] = [
  { termino: "There is / There are", definicion: "Hay (singular / plural) para describir lo que existe en un lugar.", ejemplo: "There are three coffee shops near my school." },
  { termino: "can (possibility)", definicion: "'Can' para indicar lo que es posible hacer en un lugar.", ejemplo: "You can rent bikes in the park." },
  { termino: "next to / between / in front of", definicion: "Preposiciones de lugar: al lado de / entre / enfrente de.", ejemplo: "The museum is between the park and the library." },
  { termino: "behind / opposite", definicion: "Preposiciones de lugar: detrás de / frente a (al otro lado).", ejemplo: "The pharmacy is behind the supermarket." },
  { termino: "you should / you can", definicion: "Recomendaciones básicas: deberías / puedes.", ejemplo: "You should try the local food there!" },
  { termino: "places of interest", definicion: "Lugares de interés: market, cathedral, museum, park, beach.", ejemplo: "There is a beautiful cathedral in the city centre." },
];
export const TITULO_A5 = "Glossary — Places, prepositions & recommendations";

/** Hechos: verdadero/falso A3 y A4, cada enunciado con su retroalimentación (verbatim). */
export const HECHOS_A3: { enunciado: string; respuesta: boolean; retro: string }[] = [
  { enunciado: "'Between' is used to describe the position of something surrounded by more than two objects.", respuesta: false, retro: "False. 'Between' is used with exactly two reference points. For more than two, we use 'among'. Example: The statue is between the fountain and the gate." },
  { enunciado: "'There are a pharmacy on the corner' is a grammatically correct sentence.", respuesta: false, retro: "False. 'Pharmacy' is singular, so the correct form is 'There IS a pharmacy on the corner.' 'There are' is used with plural nouns." },
  { enunciado: "'Next to' means immediately beside something, at the same level.", respuesta: true, retro: "True! 'Next to' means al lado de — right beside something. Example: The bookstore is next to the café." },
  { enunciado: "'In front of the school there is a large garden' — this sentence is grammatically correct.", respuesta: true, retro: "True! The preposition 'in front of' is used correctly, and 'there is' matches the singular noun 'garden'." },
  { enunciado: "'Behind' and 'in front of' describe the same position in relation to a reference point.", respuesta: false, retro: "False. 'Behind' means detrás de (at the back), while 'in front of' means enfrente de (facing). They are opposites." },
  { enunciado: "'Can' can be used to describe what is possible to find or do in a specific place.", respuesta: true, retro: "True! 'Can' expresses possibility. Example: 'You can find fresh fish at the coastal market.'" },
  { enunciado: "'There is many students in the classroom' is correct English.", respuesta: false, retro: "False. 'Students' is plural, so we use 'there ARE'. Correct: 'There are many students in the classroom.'" },
];
export const HECHOS_A4: { enunciado: string; respuesta: boolean; retro: string }[] = [
  { enunciado: "'There is' se usa para un solo lugar o cosa y 'there are' para más de uno.", respuesta: true, retro: "Correcto: There is a library. / There are two parks near my school." },
  { enunciado: "'Can' puede expresar posibilidad ('You can visit the market on Sundays').", respuesta: true, retro: "Sí: can también indica posibilidad/recomendación." },
  { enunciado: "'Between' significa 'al lado de' (next to).", respuesta: false, retro: "'Between' significa 'entre' dos cosas; 'next to' significa 'al lado de'." },
  { enunciado: "'In front of' significa 'detrás de'.", respuesta: false, retro: "'In front of' = enfrente de; 'behind' = detrás de." },
  { enunciado: "'You should visit the cathedral' es una recomendación básica en inglés.", respuesta: true, retro: "Correcto: should + verbo base para dar recomendaciones." },
];

/** A2 «Where Is It? Fill in the Blanks» — verbatim (el laboratorio añade «opposite» al hueco 2; ver la nota). */
export const HUECOS_A2: TextoHuecosData = {
  ancla: "IN-III-P03-A2 · Where Is It? Fill in the Blanks",
  instrucciones: "Complete the description of the town center using: next to, in front of, between, behind, there is, there are, can, on the corner of.",
  partes: [
    "",
    " a large plaza in the center of town. The church is ",
    " the plaza, so you can see it as soon as you arrive. ",
    " the church and the city hall, ",
    " a small garden with benches. The market is ",
    " the church — you have to walk past it to reach the entrance. You ",
    " find handmade crafts and fresh food inside. ",
    " many food stalls ",
    " Hidalgo and Morelos streets. The bus stop is ",
    " the pharmacy.",
  ],
  huecos: [
    { respuesta: "There is", alternativas: ["There's"], pista: "Singular existence" },
    { respuesta: "in front of", alternativas: ["opposite"], pista: "Facing something, on the opposite side" },
    { respuesta: "Between", alternativas: ["between"], pista: "In the space separating two things" },
    { respuesta: "there is", alternativas: ["there's"], pista: "Singular — one garden" },
    { respuesta: "behind", alternativas: [], pista: "At the back of something" },
    { respuesta: "can", alternativas: [], pista: "Possibility: you ___ find..." },
    { respuesta: "There are", alternativas: ["there are"], pista: "Plural existence — many stalls" },
    { respuesta: "on the corner of", alternativas: ["at the corner of"], pista: "At the intersection of two streets" },
    { respuesta: "next to", alternativas: ["beside"], pista: "Immediately beside something" },
  ],
};

/** A6 «Fill in the blanks — Describing my town» — verbatim. */
export const HUECOS_A6: TextoHuecosData = {
  ancla: "IN-III-P03-A6 · Fill in the blanks — Describing my town",
  instrucciones: "Completa los huecos para describir el centro de una ciudad. Elige la preposición o expresión correcta.",
  partes: ["In the city centre, ", " a big market next to the cathedral. You ", " buy fresh food there every day. The park is ", " the market and the library. You should ", " the cathedral — it is beautiful!"],
  huecos: [
    { respuesta: "there is", alternativas: ["there's"], pista: "Hay un solo mercado (singular): ___ a big market." },
    { respuesta: "can", alternativas: [], pista: "Expresar posibilidad: you ___ buy = puedes comprar." },
    { respuesta: "between", alternativas: [], pista: "Preposición: está entre dos cosas (market y library)." },
    { respuesta: "visit", alternativas: ["see"], pista: "Recomendación: you should ___ (verbo base)." },
  ],
};

/** A7 autoevaluación — verbatim. */
export const A7 = {
  instrucciones: "Marca tu nivel honesto en cada criterio.",
  criterios: [
    "Uso there is / there are para describir lo que hay en un lugar.",
    "Uso preposiciones de lugar (next to, between, in front of, behind).",
    "Uso can para expresar posibilidad en un lugar ('You can rent bikes').",
    "Hago recomendaciones básicas con 'you should' + verbo.",
  ],
  escala: [
    { valor: 1, etiqueta: "En inicio", descripcion: "Todavía necesito apoyo y consultar el material." },
    { valor: 2, etiqueta: "En proceso", descripcion: "Lo logro con algunos errores o dudas." },
    { valor: 3, etiqueta: "Logrado", descripcion: "Lo hago bien de forma autónoma." },
    { valor: 4, etiqueta: "Destacado", descripcion: "Lo hago con seguridad y puedo ayudar a otra persona." },
  ],
  reflexion: "¿Qué lugar de tu comunidad puedes describir en inglés y qué recomendarías visitar?",
};

/**
 * Reto evaluable: las dos preguntas cerradas del video A8 (enunciados y
 * opciones verbatim; la retroalimentación es del laboratorio). La pregunta
 * abierta se muestra como reflexión.
 */
export const QUIZ_A8: QuizEvaluable = {
  titulo: "Video A8 · Describir lugares y dar recomendaciones en inglés",
  puntajeMinimo: 100,
  reactivos: [
    {
      enunciado: "¿Cuál de las siguientes expresiones sirve para dar una recomendación en inglés?",
      opciones: ["You should visit...", "I have never...", "She is doing..."],
      respuestaCorrecta: 0,
      retroalimentacion: "«You should + verbo base» recomienda algo (A4 y A5). «I have never…» es present perfect (una experiencia) y «She is doing…» es present continuous (lo que pasa ahora).",
    },
    {
      enunciado: "Al describir un lugar en inglés también se pueden mencionar actividades que se realizan ahí.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Verdadero: con «You can + verbo» dices qué se puede hacer en un lugar: «You can rent bikes in the park» (A5).",
    },
  ],
};
export const PREGUNTA_ABIERTA_A8 = "¿Qué información es útil incluir al describir un lugar en inglés?";

export const FUENTE =
  "CEN Bachillerato — UAC Inglés III, progresión 3: glosarios A1 «Describing Places with Prepositions» y A5 «Places, prepositions & recommendations», fill_blanks A2 y A6, verdadero/falso A3 y A4, autoevaluación A7, preguntas del video A8 y relacionar columnas A9.";

export const PROBLEMA =
  "Un turista llega a tu pueblo y te pregunta: «What can I do here?». Para contestarle necesitas describir qué hay en cada lugar (there is / there are), qué se puede hacer ahí (you can) y recomendarle el lugar que va con lo que busca (you should…, because…). En Rincón del Colibrí, un pueblo costero ficticio, describes siete maquetas, lees una guía turística para llevar a cada visitante a su lugar y escribes recomendaciones que los visitantes siguen al pie de la letra.";

export const INSTRUCCIONES: string[] = [
  "En Describe the place, elige un lugar y arma oraciones con fichas: There is / There are / It has + lo que ves, y You can + una actividad. Cada oración se compara con la maqueta: cuenta bien y fíjate dónde está cada cosa.",
  "Completa la entrada de 4 lugares (una oración en singular, una en plural y una con You can) y usa varias preposiciones de lugar (next to, in front of, between, behind, above, below).",
  "En Guidebook, lee lo que pide cada visitante y la guía en inglés; elige el lugar que cumple TODO y señala la oración de la guía que lo prueba.",
  "En Recommend it, escribe una recomendación con su razón («You should visit the waterfall because you can swim there»). El visitante viaja al lugar y te dice si le encantó.",
  "Relaciona los conceptos de A9 para ganar estrellas, responde el reto del video A8, completa los textos A2 y A6 y describe un lugar de tu comunidad (A5).",
];

export const IDEAS: string[] = [
  "There is + singular (There is a fountain) · There are + plural (There are six benches). It has sirve para los dos: It has a kiosk / It has four trees.",
  "You can + verbo base dice qué se puede hacer (You can swim there); You can't + verbo base advierte una regla (You can't climb the pyramid).",
  "Preposiciones de lugar: next to (al lado), in front of (delante), behind (detrás), between … and … (entre dos), above (encima), below (debajo), opposite (del otro lado, frente a frente).",
  "Para recomendar: You should + verbo base (sin to), I recommend + lugar o verbo con -ing, Don't miss + lugar, It's a good place to + verbo.",
  "Una buena recomendación da una razón cierta y que le importe a quien la recibe: «You should visit the beach because you can see baby sea turtles».",
  "En inglés de EE. UU., first floor = planta baja y second floor = primer piso.",
];

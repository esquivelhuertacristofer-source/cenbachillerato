/**
 * Datos y modelo del laboratorio "Directions in town" (IN-II-P06, Inglés II:
 * «Pregunta cómo llegar a un lugar y orienta a otras personas en su
 * comunidad»).
 *
 * Anclas (verbatim):
 *   - A1 lectura «How to Ask for and Give Directions in English»: marco teórico
 *     (7 párrafos), recuadro y preguntas de comprensión.
 *   - A4 verdadero/falso y A9 (preguntas del video): reto evaluable.
 *   - A6 completa el texto «Giving directions».
 *   - A5 glosario; A3 escritura; A7 autoevaluación.
 *   Inspiración: IN-III-P06 (instrucciones en imperativo) e IN-I-P05 (Where…?).
 *
 * El barrio es FICTICIO (una colonia genérica con nombres de calles comunes en
 * México). Las oraciones en inglés que no vienen de la BD son del laboratorio
 * y siguen el inglés estadounidense estándar.
 *
 * Modelo: cuadrícula de 4 calles norte-sur × 4 avenidas este-oeste (nodos
 * x, z ∈ 0..3; z = 0 es el norte). Entre ellas hay 3 × 3 manzanas; cada
 * manzana es de 3 × 3 lotes (el centro es patio). Quien camina está siempre en
 * una esquina (nodo) mirando a un rumbo; «It's on your left/right» se refiere a
 * la cuadra que tiene enfrente.
 *
 * Datos puros (sin three ni React).
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { TextoHuecosData } from "./_mecanica-huecos";

/* ── Modos ────────────────────────────────────────────────────────────── */

export type Modo = "seguir" | "dar" | "donde";
export const MODOS: Modo[] = ["seguir", "dar", "donde"];

export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string }> = {
  seguir: { etq: "Follow the directions", subtitulo: "Comprende y lleva a Emma a su destino", icono: "fa-person-walking", color: "#38bdf8" },
  dar: { etq: "Give directions", subtitulo: "Escribe la ruta y Sam la sigue al pie de la letra", icono: "fa-pen-to-square", color: "#f59e0b" },
  donde: { etq: "Where is it?", subtitulo: "Pregunta con cortesía y ubica con preposiciones", icono: "fa-map-location-dot", color: "#a78bfa" },
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

export function estrellasPorErrores(errores: number): number {
  return errores === 0 ? 3 : errores <= 2 ? 2 : 1;
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. EL BARRIO
 * ════════════════════════════════════════════════════════════════════════ */

/** Rumbo: 0 norte, 1 este, 2 sur, 3 oeste. */
export type Rumbo = 0 | 1 | 2 | 3;
export const DIRS: [number, number][] = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];
export const RUMBO_ES = ["norte", "este", "sur", "oeste"] as const;
export const N_NODOS = 4;

export interface Estado {
  x: number;
  z: number;
  h: Rumbo;
}

export const girarRumbo = (h: Rumbo, lado: Lado): Rumbo => ((h + (lado === "R" ? 1 : 3)) % 4) as Rumbo;
export const dentro = (x: number, z: number) => x >= 0 && x < N_NODOS && z >= 0 && z < N_NODOS;

export type Lado = "L" | "R";
export const LADO_EN: Record<Lado, string> = { L: "left", R: "right" };
export const LADO_ES: Record<Lado, string> = { L: "izquierda", R: "derecha" };

/* ── Calles ───────────────────────────────────────────────────────────── */

export type CalleId = "morelos" | "juarez" | "hidalgo" | "allende" | "madero" | "reforma" | "independencia" | "zaragoza";

export interface Calle {
  id: CalleId;
  nombre: string;
  corto: string;
  /** v: corre de norte a sur (fija x); h: corre de este a oeste (fija z). */
  eje: "v" | "h";
  idx: number;
}

export const CALLES: Calle[] = [
  { id: "morelos", nombre: "Morelos Street", corto: "Morelos St.", eje: "v", idx: 0 },
  { id: "juarez", nombre: "Juárez Street", corto: "Juárez St.", eje: "v", idx: 1 },
  { id: "hidalgo", nombre: "Hidalgo Street", corto: "Hidalgo St.", eje: "v", idx: 2 },
  { id: "allende", nombre: "Allende Street", corto: "Allende St.", eje: "v", idx: 3 },
  { id: "madero", nombre: "Madero Avenue", corto: "Madero Ave.", eje: "h", idx: 0 },
  { id: "reforma", nombre: "Reforma Avenue", corto: "Reforma Ave.", eje: "h", idx: 1 },
  { id: "independencia", nombre: "Independencia Avenue", corto: "Independencia Ave.", eje: "h", idx: 2 },
  { id: "zaragoza", nombre: "Zaragoza Avenue", corto: "Zaragoza Ave.", eje: "h", idx: 3 },
];

export const calle = (id: CalleId) => CALLES.find((c) => c.id === id)!;
export const calleV = (x: number) => CALLES.find((c) => c.eje === "v" && c.idx === x)!;
export const calleH = (z: number) => CALLES.find((c) => c.eje === "h" && c.idx === z)!;

/** Calle sobre la que camina quien está en un nodo con cierto rumbo. */
export const calleActual = (e: Estado) => (e.h % 2 === 0 ? calleV(e.x) : calleH(e.z));
/** Nombre de la esquina de un nodo: «Juárez St. & Reforma Ave.». */
export const nombreEsquina = (x: number, z: number) => `${calleV(x).corto} & ${calleH(z).corto}`;

/** Esquinas con semáforo. */
export const SEMAFOROS: [number, number][] = [
  [1, 1],
  [2, 2],
  [3, 1],
];
export const haySemaforo = (x: number, z: number) => SEMAFOROS.some(([a, b]) => a === x && b === z);

/* ── Lugares ──────────────────────────────────────────────────────────── */

export type LugarId = "health" | "church" | "pharmacy" | "supermarket" | "hotel" | "tacos" | "market" | "bank" | "bakery" | "butcher" | "post" | "school" | "library" | "gym";
/** Un referente es un lugar, el parque (toda una manzana) o la parada de autobús. */
export type Referente = LugarId | "park" | "busstop";

export interface Lugar {
  id: LugarId;
  en: string;
  es: string;
  /** Manzana (bx, bz ∈ 0..2) y lote (cx, cz ∈ 0..2, sin el centro). */
  bx: number;
  bz: number;
  cx: number;
  cz: number;
  /** Hacia dónde mira la fachada. */
  frente: Rumbo;
  icono: string;
  color: string;
  alias: string[];
}

export const LUGARES: Lugar[] = [
  { id: "health", en: "health center", es: "el centro de salud", bx: 0, bz: 0, cx: 2, cz: 2, frente: 2, icono: "fa-house-medical", color: "#2dd4bf", alias: ["health center", "health centre", "clinic", "health clinic"] },
  { id: "church", en: "church", es: "la iglesia", bx: 1, bz: 0, cx: 0, cz: 2, frente: 2, icono: "fa-church", color: "#fcd34d", alias: ["church"] },
  { id: "pharmacy", en: "pharmacy", es: "la farmacia", bx: 1, bz: 0, cx: 1, cz: 2, frente: 2, icono: "fa-prescription-bottle-medical", color: "#4ade80", alias: ["pharmacy", "drugstore", "drug store"] },
  { id: "supermarket", en: "supermarket", es: "el supermercado", bx: 1, bz: 0, cx: 2, cz: 2, frente: 2, icono: "fa-cart-shopping", color: "#f87171", alias: ["supermarket", "big supermarket"] },
  { id: "hotel", en: "hotel", es: "el hotel", bx: 2, bz: 0, cx: 1, cz: 2, frente: 2, icono: "fa-hotel", color: "#818cf8", alias: ["hotel"] },
  { id: "tacos", en: "taco shop", es: "la taquería", bx: 0, bz: 1, cx: 2, cz: 0, frente: 1, icono: "fa-utensils", color: "#fb923c", alias: ["taco shop", "taqueria", "taco stand", "taco restaurant"] },
  { id: "market", en: "market", es: "el mercado", bx: 0, bz: 1, cx: 2, cz: 1, frente: 1, icono: "fa-store", color: "#f472b6", alias: ["market"] },
  { id: "bank", en: "bank", es: "el banco", bx: 2, bz: 1, cx: 0, cz: 0, frente: 3, icono: "fa-building-columns", color: "#94a3b8", alias: ["bank"] },
  { id: "bakery", en: "bakery", es: "la panadería", bx: 2, bz: 1, cx: 0, cz: 1, frente: 3, icono: "fa-bread-slice", color: "#fbbf24", alias: ["bakery"] },
  { id: "butcher", en: "butcher shop", es: "la carnicería", bx: 2, bz: 1, cx: 0, cz: 2, frente: 3, icono: "fa-drumstick-bite", color: "#ef4444", alias: ["butcher shop", "butcher's", "butchers", "butcher"] },
  { id: "post", en: "post office", es: "la oficina de correos", bx: 1, bz: 2, cx: 0, cz: 0, frente: 0, icono: "fa-envelope", color: "#60a5fa", alias: ["post office"] },
  { id: "school", en: "school", es: "la escuela", bx: 1, bz: 2, cx: 1, cz: 0, frente: 0, icono: "fa-school", color: "#facc15", alias: ["school", "secondary school"] },
  { id: "library", en: "library", es: "la biblioteca", bx: 1, bz: 2, cx: 2, cz: 0, frente: 0, icono: "fa-book", color: "#c084fc", alias: ["library"] },
  { id: "gym", en: "gym", es: "el gimnasio", bx: 2, bz: 2, cx: 2, cz: 1, frente: 1, icono: "fa-dumbbell", color: "#22d3ee", alias: ["gym"] },
];

export const PARQUE = { bx: 1, bz: 1 };
export const lugar = (id: LugarId) => LUGARES.find((l) => l.id === id)!;

export function nombreEn(r: Referente): string {
  if (r === "park") return "park";
  if (r === "busstop") return "bus stop";
  return lugar(r).en;
}
export function nombreEs(r: Referente): string {
  if (r === "park") return "el parque";
  if (r === "busstop") return "la parada de autobús";
  return lugar(r).es;
}
export function iconoDe(r: Referente): string {
  if (r === "park") return "fa-tree";
  if (r === "busstop") return "fa-bus";
  return lugar(r).icono;
}

export function lugarEn(bx: number, bz: number, cx: number, cz: number): LugarId | null {
  return LUGARES.find((l) => l.bx === bx && l.bz === bz && l.cx === cx && l.cz === cz)?.id ?? null;
}
const esParque = (bx: number, bz: number) => bx === PARQUE.bx && bz === PARQUE.bz;

/** Calles a las que da un lote (1 o 2 si es de esquina). */
export function callesDeLote(bx: number, bz: number, cx: number, cz: number): { dir: Rumbo; calle: CalleId }[] {
  const out: { dir: Rumbo; calle: CalleId }[] = [];
  if (cz === 0) out.push({ dir: 0, calle: calleH(bz).id });
  if (cz === 2) out.push({ dir: 2, calle: calleH(bz + 1).id });
  if (cx === 0) out.push({ dir: 3, calle: calleV(bx).id });
  if (cx === 2) out.push({ dir: 1, calle: calleV(bx + 1).id });
  return out;
}

/** Lo que hay cruzando la calle desde un lote, en el mismo punto de la calle. */
function cruzando(bx: number, bz: number, cx: number, cz: number, dir: Rumbo): Referente | null {
  const [dx, dz] = DIRS[dir]!;
  const nbx = bx + dx;
  const nbz = bz + dz;
  if (nbx < 0 || nbx > 2 || nbz < 0 || nbz > 2) return null;
  if (esParque(nbx, nbz)) return "park";
  const ncx = dir === 1 ? 0 : dir === 3 ? 2 : cx;
  const ncz = dir === 2 ? 0 : dir === 0 ? 2 : cz;
  return lugarEn(nbx, nbz, ncx, ncz);
}

/** Vecinos del lote alrededor de la manzana (los que están «next to»). */
function vecinosAnillo(cx: number, cz: number): [number, number][] {
  const c: [number, number][] = [
    [cx - 1, cz],
    [cx + 1, cz],
    [cx, cz - 1],
    [cx, cz + 1],
  ];
  return c.filter(([a, b]) => a >= 0 && a <= 2 && b >= 0 && b <= 2 && !(a === 1 && b === 1));
}

/** Nodo de la esquina de un lote de esquina, o null. */
export function esquinaDeLote(l: Lugar): { x: number; z: number } | null {
  if (l.cx === 1 || l.cz === 1) return null;
  return { x: l.bx + l.cx / 2, z: l.bz + l.cz / 2 };
}

/* ── Preposiciones de lugar ───────────────────────────────────────────── */

export type Prep = "next" | "across" | "between" | "corner" | "front";
export const PREPS: Prep[] = ["next", "across", "between", "corner", "front"];

export const PREP_DEF: Record<Prep, { en: string; es: string; regla: string }> = {
  next: { en: "next to", es: "al lado de", regla: "next to = pegado a otro lugar, del mismo lado de la calle (The bank is next to the school)." },
  across: { en: "across from", es: "enfrente de, cruzando la calle", regla: "across from = del otro lado de la calle, frente a frente; también se dice opposite (The school is across from the park)." },
  between: { en: "between … and …", es: "entre … y …", regla: "between … and … = en medio de dos lugares, uno a cada lado (The bakery is between the bank and the butcher shop)." },
  corner: { en: "on the corner of … and …", es: "en la esquina de … y …", regla: "on the corner of … and … = en la esquina donde se cruzan dos calles; se nombran las dos calles." },
  front: { en: "in front of", es: "frente a, delante de", regla: "in front of = justo delante de la fachada, del mismo lado de la calle (The bus stop is in front of the school). Si hay una calle en medio, en inglés se dice across from." },
};

export interface Relacion {
  prep: Prep;
  a?: Referente;
  b?: Referente;
  calles?: [CalleId, CalleId];
}

export function fraseRelacion(r: Relacion): string {
  const the = (x?: Referente) => (x ? `the ${nombreEn(x)}` : "…");
  if (r.prep === "next") return `next to ${the(r.a)}`;
  if (r.prep === "across") return `across from ${the(r.a)}`;
  if (r.prep === "front") return `in front of ${the(r.a)}`;
  if (r.prep === "between") return `between ${the(r.a)} and ${the(r.b)}`;
  const [c1, c2] = r.calles ?? [];
  return `on the corner of ${c1 ? calle(c1).nombre : "…"} and ${c2 ? calle(c2).nombre : "…"}`;
}

/** ¿Es cierta la relación en el mapa? */
export function relacionVerdadera(sujeto: Referente, r: Relacion): boolean {
  if (sujeto === "park") return false;
  if (sujeto === "busstop") {
    if (r.prep === "front") return r.a === "school";
    if (r.prep === "across") return r.a === "park";
    return false;
  }
  const l = lugar(sujeto);
  if (r.prep === "front") return false;
  if (r.prep === "next" || r.prep === "between") {
    const vec = vecinosAnillo(l.cx, l.cz)
      .map(([a, b]) => lugarEn(l.bx, l.bz, a, b))
      .filter((v): v is LugarId => v !== null);
    if (r.prep === "next") return !!r.a && r.a !== sujeto && (vec as Referente[]).includes(r.a);
    return !!r.a && !!r.b && r.a !== r.b && vec.length === 2 && (vec as Referente[]).includes(r.a) && (vec as Referente[]).includes(r.b);
  }
  if (r.prep === "across") {
    if (!r.a) return false;
    return callesDeLote(l.bx, l.bz, l.cx, l.cz).some((c) => cruzando(l.bx, l.bz, l.cx, l.cz, c.dir) === r.a);
  }
  // corner
  const esq = esquinaDeLote(l);
  if (!esq || !r.calles) return false;
  const ok = [calleV(esq.x).id, calleH(esq.z).id];
  return r.calles[0] !== r.calles[1] && r.calles.every((c) => ok.includes(c));
}

/** Todas las relaciones ciertas de un referente (para explicar y generar enunciados). */
export function relacionesVerdaderas(sujeto: Referente): Relacion[] {
  if (sujeto === "park") return [];
  if (sujeto === "busstop") return [{ prep: "front", a: "school" }, { prep: "across", a: "park" }];
  const l = lugar(sujeto);
  const out: Relacion[] = [];
  const vec = vecinosAnillo(l.cx, l.cz)
    .map(([a, b]) => lugarEn(l.bx, l.bz, a, b))
    .filter((v): v is LugarId => v !== null);
  if (vec.length === 2) out.push({ prep: "between", a: vec[0], b: vec[1] });
  vec.forEach((v) => out.push({ prep: "next", a: v }));
  callesDeLote(l.bx, l.bz, l.cx, l.cz).forEach((c) => {
    const x = cruzando(l.bx, l.bz, l.cx, l.cz, c.dir);
    if (x && !out.some((o) => o.prep === "across" && o.a === x)) out.push({ prep: "across", a: x });
  });
  const esq = esquinaDeLote(l);
  if (esq) out.push({ prep: "corner", calles: [calleH(esq.z).id, calleV(esq.x).id] });
  return out;
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. INTÉRPRETE DE INDICACIONES EN INGLÉS
 * ════════════════════════════════════════════════════════════════════════ */

export type Ref = { t: "semaforo" } | { t: "aqui" } | { t: "lugar"; id: LugarId } | { t: "calle"; id: CalleId } | { t: "esquina"; a: CalleId; b: CalleId };

export type Cmd =
  | { k: "recto"; n: number; calle?: CalleId }
  | { k: "girar"; lado: Lado; ref?: Ref }
  | { k: "tomar"; lado: Lado; n: number }
  | { k: "cruzar"; calle?: CalleId }
  | { k: "final"; lado: Lado; lugar?: Referente; rel?: Relacion };

export type Lectura = { ok: true; cmd: Cmd | null; lee: string } | { ok: false; error: string };

/** Normaliza para comparar: sin acentos ni mayúsculas, contracciones expandidas. */
export function normalizaEn(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/\bit's\b/g, "it is")
    .replace(/\bthat's\b/g, "that is")
    .replace(/\byou'll\b/g, "you will")
    .replace(/\bcan't\b/g, "cannot")
    .replace(/\bdon't\b/g, "do not")
    .replace(/-/g, " ")
    .replace(/[.,;:!?¡¿"()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Parte un texto en indicaciones: renglones, puntos y «and / then» antes de un verbo. */
export function dividirIndicaciones(texto: string): string[] {
  return texto
    .replace(/\b(st|ave|av)\./gi, "$1§")
    .split(/[\n.;!?]+|§(?=\s+[A-Z])/)
    .map((s) => s.replace(/§/g, ""))
    .flatMap((s) => s.split(/,?\s+(?:and then|and|then|after that|next)\s*,?\s+(?=(?:turn|go|walk|take|cross|keep|continue|make|it's|it is|it will|you will|you'll|you can)\b)/i))
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

const NUMEROS: Record<string, number> = { a: 1, one: 1, "1": 1, two: 2, "2": 2, three: 3, "3": 3, four: 4, "4": 4 };
const ORDINALES: Record<string, number> = { first: 1, "1st": 1, next: 1, second: 2, "2nd": 2, third: 3, "3rd": 3 };
const CUADRAS = (n: number) => `${n} ${n === 1 ? "cuadra" : "cuadras"}`;

const ALIAS_LUGAR: [string, Referente][] = [
  ...LUGARES.flatMap((l) => l.alias.map((a) => [a, l.id] as [string, Referente])),
  ["park", "park"],
  ["big park", "park"],
  ["plaza", "park"],
  ["bus stop", "busstop"],
];

export function lugarPorNombre(s: string): Referente | null {
  const t = normalizaEn(s).replace(/^(the|a|an)\s+/, "").replace(/^nearest\s+/, "");
  return ALIAS_LUGAR.find(([a]) => a === t)?.[1] ?? null;
}

export function callePorNombre(s: string): CalleId | null {
  const t = normalizaEn(s)
    .replace(/^the\s+/, "")
    .replace(/\s+(street|st|avenue|ave|av)$/, "")
    .trim();
  return CALLES.find((c) => c.id === t)?.id ?? null;
}

function parseRef(s: string): Ref | { error: string } {
  const t = s.trim();
  if (/^(the\s+)?(traffic\s+lights?|lights?|stop\s*lights?|semaforo)$/.test(t)) return { t: "semaforo" };
  if (/^(the|this|next)\s+corner$/.test(t)) return { t: "aqui" };
  const esq = t.match(/^(?:the\s+)?corner\s+of\s+(.+?)\s+and\s+(.+)$/);
  if (esq) {
    const a = callePorNombre(esq[1]!);
    const b = callePorNombre(esq[2]!);
    if (!a || !b) return { error: `No encuentro esas calles en el barrio. Las calles son: ${CALLES.map((c) => c.nombre).join(", ")}.` };
    return { t: "esquina", a, b };
  }
  const c = callePorNombre(t);
  if (c) return { t: "calle", id: c };
  const l = lugarPorNombre(t);
  if (l === "park") return { error: "El parque ocupa toda una manzana y tiene cuatro esquinas: di en qué calle girar o usa un lugar de esquina (the bank, the church…)." };
  if (l === "busstop") return { error: "La parada de autobús no está en una esquina: usa otra referencia (the traffic light, una calle o un lugar de esquina)." };
  if (l) {
    if (!esquinaDeLote(lugar(l))) return { error: `The ${lugar(l).en} no está en una esquina, así que no sirve para indicar dónde girar. Usa una calle, el semáforo o un lugar de esquina.` };
    return { t: "lugar", id: l };
  }
  return { error: `No reconozco «${s}» como referencia. Ejemplos: «at the traffic light», «at the bank», «at Reforma Avenue», «at the corner of Juárez Street and Reforma Avenue».` };
}

/** «de el banco» → «del banco». */
export const deEs = (es: string) => (es.startsWith("el ") ? `del ${es.slice(3)}` : `de ${es}`);

export function leeRef(r: Ref): string {
  if (r.t === "semaforo") return "en el semáforo";
  if (r.t === "aqui") return "en esta esquina";
  if (r.t === "lugar") return `en la esquina ${deEs(lugar(r.id).es)}`;
  if (r.t === "calle") return `en ${calle(r.id).nombre}`;
  return `en la esquina de ${calle(r.a).nombre} y ${calle(r.b).nombre}`;
}

function parseRelacion(s: string): Relacion | { error: string } {
  const t = s.trim();
  const noLugar = (x: string) => ({ error: `No encuentro «${x}» en el barrio.` });
  let m = t.match(/^(?:right\s+)?(?:next\s+to|beside)\s+(.+)$/);
  if (m) {
    const a = lugarPorNombre(m[1]!);
    return a ? { prep: "next", a } : noLugar(m[1]!);
  }
  m = t.match(/^(?:across\s+the\s+street\s+from|across\s+from|opposite(?:\s+to)?)\s+(.+)$/);
  if (m) {
    const a = lugarPorNombre(m[1]!);
    return a ? { prep: "across", a } : noLugar(m[1]!);
  }
  m = t.match(/^in\s+front\s+of\s+(.+)$/);
  if (m) {
    const a = lugarPorNombre(m[1]!);
    return a ? { prep: "front", a } : noLugar(m[1]!);
  }
  m = t.match(/^between\s+(.+?)\s+and\s+(.+)$/);
  if (m) {
    const a = lugarPorNombre(m[1]!);
    const b = lugarPorNombre(m[2]!);
    return a && b ? { prep: "between", a, b } : noLugar(!a ? m[1]! : m[2]!);
  }
  m = t.match(/^(?:on|at)\s+the\s+corner\s+of\s+(.+?)\s+and\s+(.+)$/);
  if (m) {
    const a = callePorNombre(m[1]!);
    const b = callePorNombre(m[2]!);
    return a && b ? { prep: "corner", calles: [a, b] } : { error: "Nombra dos calles del barrio: «on the corner of Reforma Avenue and Juárez Street»." };
  }
  return { error: `No entendí «${s}». Después del lado puedes precisar con next to, across from, between … and … u on the corner of … and ….` };
}

const CORTESIA =
  /^(sure|of course|no problem|ok|okay|yes|yes there is|yes there is one|no it is not|it is not far|it is very close|it is near here|it is close|you cannot miss it|good luck|you are welcome|excuse me.*|thank you.*|let me think|hello|hi|well|it is easy|follow me|it is a five minute walk.*|it is only a five minute walk.*)$/;

/** Interpreta UNA indicación en inglés. */
export function parseIndicacion(texto: string): Lectura {
  let s = normalizaEn(texto);
  // Conectores y rellenos al principio (First, Then, After that…)
  for (let k = 0; k < 4; k++) s = s.replace(/^(first|first of all|then|next|after that|finally|now|and|so|please|from here|ok|okay)\s+/, "");
  s = s.replace(/\s+(please|carefully)$/, "").trim();
  if (!s) return { ok: false, error: "Indicación vacía." };
  if (CORTESIA.test(s)) return { ok: true, cmd: null, lee: "Cortesía: no mueve a nadie, pero se agradece." };
  if (/\b(izquierda|derecha|derecho|sigue|dobla|gira|voltea|cuadras?|esquina|cruza)\b/.test(s))
    return { ok: false, error: "Escríbelo en inglés: izquierda = left, derecha = right, sigue derecho = go straight, cuadra = block, cruza = cross." };

  // Go straight (ahead) for N blocks
  let m = s.match(/^(?:go|walk|keep going|keep walking|continue|drive)\s+(?:straight\s+)?(?:ahead\s+|on\s+)?(?:(?:down|up|along)\s+(.+?)\s+)?(?:for\s+)?(a|one|two|three|four|1|2|3|4)\s+(?:more\s+)?blocks?(?:\s+(?:straight\s+ahead|straight|ahead))?$/);
  if (m) {
    const n = NUMEROS[m[2]!]!;
    if (m[1]) {
      const c = callePorNombre(m[1]);
      if (!c) return { ok: false, error: `No encuentro la calle «${m[1]}».` };
      return { ok: true, cmd: { k: "recto", n, calle: c }, lee: `Seguir derecho ${CUADRAS(n)} por ${calle(c).nombre}` };
    }
    return { ok: true, cmd: { k: "recto", n }, lee: `Seguir derecho ${CUADRAS(n)}` };
  }
  if (/^(go|walk|keep going|continue)\s+(straight|ahead|straight ahead|straight on)$/.test(s))
    return { ok: false, error: "¿Cuántas cuadras? En inglés se precisa: «Go straight for two blocks.»" };

  // Take the first/second street on the left/right
  m = s.match(/^take\s+the\s+(first|second|third|next|1st|2nd|3rd)\s+(?:street\s+|road\s+|turn\s+|one\s+)?(?:on\s+(?:the|your)\s+|to\s+the\s+)?(left|right)(?:\s+(?:street|road|turn))?$/);
  if (m) {
    const n = ORDINALES[m[1]!]!;
    const lado: Lado = m[2] === "left" ? "L" : "R";
    return { ok: true, cmd: { k: "tomar", lado, n }, lee: `Tomar la ${["", "primera", "segunda", "tercera"][n]} calle a la ${LADO_ES[lado]}` };
  }

  // At the bank, turn left
  m = s.match(/^at\s+(.+?)\s+(?:turn|go)\s+(?:to\s+the\s+)?(left|right)$/);
  if (m) {
    const ref = parseRef(m[1]!);
    if ("error" in ref) return { ok: false, error: ref.error };
    const lado: Lado = m[2] === "left" ? "L" : "R";
    return { ok: true, cmd: { k: "girar", lado, ref }, lee: `Girar a la ${LADO_ES[lado]} ${leeRef(ref)}` };
  }

  // Turn left / Turn right (at … / onto …)
  m = s.match(/^(?:turn|go|make\s+a)\s+(?:to\s+the\s+)?(left|right)(?:\s+turn)?(?:\s+(?:at|on|onto|into)\s+(.+))?$/);
  if (m) {
    const lado: Lado = m[1] === "left" ? "L" : "R";
    if (!m[2]) return { ok: true, cmd: { k: "girar", lado }, lee: `Girar a la ${LADO_ES[lado]} aquí` };
    const ref = parseRef(m[2]);
    if ("error" in ref) return { ok: false, error: ref.error };
    return { ok: true, cmd: { k: "girar", lado, ref }, lee: `Girar a la ${LADO_ES[lado]} ${leeRef(ref)}` };
  }
  if (/^turn(\s|$)/.test(s)) return { ok: false, error: "¿Hacia dónde? «Turn left» (izquierda) o «Turn right» (derecha)." };

  // Cross the street / Cross Hidalgo Street
  m = s.match(/^(?:cross|walk\s+across|go\s+across)(?:\s+over)?\s+(.+)$/);
  if (m) {
    const rest = m[1]!;
    if (/^(the\s+)?(street|road|avenue)$/.test(rest)) return { ok: true, cmd: { k: "cruzar" }, lee: "Cruzar la calle que tiene enfrente (sin avanzar cuadras)" };
    const c = callePorNombre(rest);
    if (!c) return { ok: false, error: `No encuentro la calle «${rest}». Ejemplo: «Cross Hidalgo Street.»` };
    return { ok: true, cmd: { k: "cruzar", calle: c }, lee: `Caminar hasta ${calle(c).nombre} y cruzarla` };
  }

  // It's on your left / The bakery is on your right, next to the bank
  m = s.match(/^(?:it\s+is|it\s+will\s+be|you\s+will\s+see\s+it|you\s+can\s+see\s+it|you\s+will\s+find\s+it|(?:the\s+)?(.+?)\s+is)\s+on\s+(?:your|the)\s+(left|right)(?:\s+hand(?:\s+side)?|\s+side)?(?:\s+(.+))?$/);
  if (m) {
    const lado: Lado = m[2] === "left" ? "L" : "R";
    let lugarF: Referente | undefined;
    if (m[1]) {
      const l = lugarPorNombre(m[1]);
      if (!l) return { ok: false, error: `No encuentro «${m[1]}» en el barrio.` };
      lugarF = l;
    }
    let rel: Relacion | undefined;
    if (m[3]) {
      const r = parseRelacion(m[3]);
      if ("error" in r) return { ok: false, error: r.error };
      rel = r;
    }
    return { ok: true, cmd: { k: "final", lado, lugar: lugarF, rel }, lee: `Llegó: está a la ${LADO_ES[lado]}${rel ? ` (${fraseRelacion(rel)})` : ""}` };
  }
  if (/\bon\s+(your|the)\s+(left|right)\b/.test(s)) return { ok: false, error: "Para el final usa «It's on your left» o «The … is on your right»." };

  return {
    ok: false,
    error: "No entendí esta indicación. Usa frases como «Go straight for two blocks», «Turn left at the bank», «Take the first street on the right», «Cross Hidalgo Street» o «It's on your left».",
  };
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. EJECUCIÓN LITERAL
 * ════════════════════════════════════════════════════════════════════════ */

/** Acción elemental: avanzar una cuadra, girar, o declarar que llegó (izq./der.). */
export type Prim = "F" | "L" | "R" | "EL" | "ER";

export function aplicarPrim(e: Estado, p: Prim): Estado | null {
  if (p === "L" || p === "R") return { ...e, h: girarRumbo(e.h, p) };
  if (p === "F") {
    const [dx, dz] = DIRS[e.h]!;
    return dentro(e.x + dx, e.z + dz) ? { ...e, x: e.x + dx, z: e.z + dz } : null;
  }
  return e;
}

export function estadosDe(inicio: Estado, prims: Prim[]): Estado[] {
  const out: Estado[] = [inicio];
  let e = inicio;
  for (const p of prims) {
    const n = aplicarPrim(e, p);
    if (!n) break;
    e = n;
    out.push(e);
  }
  return out;
}

const puedeAvanzar = (e: Estado) => aplicarPrim(e, "F") !== null;

function coincideRef(e: Estado, ref: Ref): boolean {
  if (ref.t === "aqui") return true;
  if (ref.t === "semaforo") return haySemaforo(e.x, e.z);
  if (ref.t === "lugar") {
    const q = esquinaDeLote(lugar(ref.id));
    return !!q && q.x === e.x && q.z === e.z;
  }
  if (ref.t === "calle") {
    const c = calle(ref.id);
    return c.eje === "v" ? e.x === c.idx : e.z === c.idx;
  }
  const ids = [calleV(e.x).id, calleH(e.z).id];
  return ids.includes(ref.a) && ids.includes(ref.b);
}

export interface Ejecucion {
  prims: Prim[];
  /** Rango [desde, hasta) de primitivas de cada indicación. */
  rangos: [number, number][];
  error: { paso: number; msg: string } | null;
  final: { lado: Lado; paso: number } | null;
}

/** Ejecuta al pie de la letra una lista de comandos desde un estado inicial. */
export function ejecutar(cmds: (Cmd | null)[], inicio: Estado): Ejecucion {
  const prims: Prim[] = [];
  const rangos: [number, number][] = [];
  let e = inicio;
  const avanza = () => {
    prims.push("F");
    e = aplicarPrim(e, "F")!;
  };
  for (let i = 0; i < cmds.length; i++) {
    const c = cmds[i];
    const desde = prims.length;
    const fallo = (msg: string): Ejecucion => {
      rangos.push([desde, prims.length]);
      return { prims, rangos, error: { paso: i, msg }, final: null };
    };
    if (!c) {
      rangos.push([desde, desde]);
      continue;
    }
    const sobre = calleActual(e).nombre;
    if (c.k === "recto") {
      if (c.calle && calleActual(e).id !== c.calle) return fallo(`Quien camina va por ${sobre}, no por ${calle(c.calle).nombre}.`);
      for (let k = 0; k < c.n; k++) {
        if (!puedeAvanzar(e)) return fallo(`Después de ${CUADRAS(k)} se acaba ${sobre} hacia el ${RUMBO_ES[e.h]}: el barrio termina ahí.`);
        avanza();
      }
    } else if (c.k === "girar") {
      if (c.ref) {
        if (c.ref.t === "calle" && calleActual(e).id === c.ref.id) return fallo(`Ya camina sobre ${sobre}: no puede girar «at ${calle(c.ref.id).nombre}». Nombra la calle que cruza.`);
        let pasos = 0;
        while (!coincideRef(e, c.ref)) {
          if (!puedeAvanzar(e)) return fallo(`Caminó hasta el final de ${sobre} y nunca encontró la referencia (${leeRef(c.ref).replace(/^en /, "")}).`);
          avanza();
          pasos++;
          if (pasos > 4) break;
        }
      }
      const h = girarRumbo(e.h, c.lado);
      const [dx, dz] = DIRS[h]!;
      if (!dentro(e.x + dx, e.z + dz)) return fallo(`En ${nombreEsquina(e.x, e.z)} no hay calle hacia la ${LADO_ES[c.lado]} (el barrio termina).`);
      prims.push(c.lado);
      e = { ...e, h };
    } else if (c.k === "tomar") {
      let cuenta = 0;
      let ok = false;
      while (puedeAvanzar(e)) {
        avanza();
        const h = girarRumbo(e.h, c.lado);
        const [dx, dz] = DIRS[h]!;
        if (dentro(e.x + dx, e.z + dz)) cuenta++;
        if (cuenta === c.n) {
          prims.push(c.lado);
          e = { ...e, h };
          ok = true;
          break;
        }
      }
      if (!ok) return fallo(`Caminó hasta el final de ${sobre} y solo encontró ${cuenta} ${cuenta === 1 ? "calle" : "calles"} a la ${LADO_ES[c.lado]}.`);
    } else if (c.k === "cruzar") {
      if (c.calle) {
        const cc = calle(c.calle);
        if (calleActual(e).id === c.calle) return fallo(`Ya camina sobre ${cc.nombre}: no la puede cruzar a lo largo.`);
        let pasos = 0;
        while (!(cc.eje === "v" ? e.x === cc.idx : e.z === cc.idx)) {
          if (!puedeAvanzar(e)) return fallo(`Caminó hasta el final de ${sobre} y nunca llegó a ${cc.nombre}.`);
          avanza();
          pasos++;
          if (pasos > 4) break;
        }
      }
    } else {
      rangos.push([desde, desde + 1]);
      prims.push(c.lado === "L" ? "EL" : "ER");
      if (i < cmds.length - 1 && cmds.slice(i + 1).some((x) => x !== null)) return { prims, rangos, error: { paso: i + 1, msg: "Ya le dijiste que llegó: la indicación final («It's on your left/right») debe ir al último." }, final: null };
      return { prims, rangos, error: null, final: { lado: c.lado, paso: i } };
    }
    rangos.push([desde, prims.length]);
  }
  return { prims, rangos, error: null, final: null };
}

/* ── Lugares a cada lado de la cuadra que se tiene enfrente ────────────── */

export interface Lote {
  bx: number;
  bz: number;
  cx: number;
  cz: number;
}

export function lotesAlLado(e: Estado, lado: Lado): Lote[] {
  const [dx, dz] = DIRS[e.h]!;
  if (!dentro(e.x + dx, e.z + dz)) return [];
  const r: [number, number] = lado === "R" ? [-dz, dx] : [dz, -dx];
  const px = e.x + dx / 2 + r[0] / 2;
  const pz = e.z + dz / 2 + r[1] / 2;
  const bx = Math.floor(px);
  const bz = Math.floor(pz);
  if (bx < 0 || bx > 2 || bz < 0 || bz > 2) return [];
  if (esParque(bx, bz)) return [];
  // La manzana da a la calle por el lado opuesto a r.
  const out: Lote[] = [];
  for (let k = 0; k < 3; k++) {
    if (r[0] === 1) out.push({ bx, bz, cx: 0, cz: k });
    else if (r[0] === -1) out.push({ bx, bz, cx: 2, cz: k });
    else if (r[1] === 1) out.push({ bx, bz, cx: k, cz: 0 });
    else out.push({ bx, bz, cx: k, cz: 2 });
  }
  return out;
}

/** ¿Qué hay a ese lado de la cuadra? (para explicar). */
export function queHayAlLado(e: Estado, lado: Lado): Referente[] {
  const [dx, dz] = DIRS[e.h]!;
  const r: [number, number] = lado === "R" ? [-dz, dx] : [dz, -dx];
  const bx = Math.floor(e.x + dx / 2 + r[0] / 2);
  const bz = Math.floor(e.z + dz / 2 + r[1] / 2);
  if (dentro(e.x + dx, e.z + dz) && esParque(bx, bz)) return ["park"];
  return lotesAlLado(e, lado)
    .map((l) => lugarEn(l.bx, l.bz, l.cx, l.cz))
    .filter((v): v is LugarId => v !== null);
}

export function estaAlLado(e: Estado, lado: Lado, destino: LugarId): boolean {
  const d = lugar(destino);
  return lotesAlLado(e, lado).some((l) => l.bx === d.bx && l.bz === d.bz && l.cx === d.cx && l.cz === d.cz);
}

/** Distancia (en cuadras) de un nodo a la cuadra del destino. */
export function distanciaA(e: { x: number; z: number }, destino: LugarId): number {
  const d = lugar(destino);
  const extremos: [number, number][] = [];
  callesDeLote(d.bx, d.bz, d.cx, d.cz).forEach(({ dir }) => {
    if (dir === 0) extremos.push([d.bx, d.bz], [d.bx + 1, d.bz]);
    if (dir === 2) extremos.push([d.bx, d.bz + 1], [d.bx + 1, d.bz + 1]);
    if (dir === 3) extremos.push([d.bx, d.bz], [d.bx, d.bz + 1]);
    if (dir === 1) extremos.push([d.bx + 1, d.bz], [d.bx + 1, d.bz + 1]);
  });
  return Math.min(...extremos.map(([x, z]) => Math.abs(x - e.x) + Math.abs(z - e.z)));
}

/** Lado en el que está el destino desde un estado, o null si no está en la cuadra de enfrente. */
export function ladoDelDestino(e: Estado, destino: LugarId): Lado | null {
  if (estaAlLado(e, "L", destino)) return "L";
  if (estaAlLado(e, "R", destino)) return "R";
  return null;
}

/* ════════════════════════════════════════════════════════════════════════
 * 4. MODO 1 — FOLLOW THE DIRECTIONS
 * ════════════════════════════════════════════════════════════════════════ */

export interface Mision {
  id: string;
  lugar: LugarId;
  inicio: Estado;
  pregunta: string;
  intro: string;
  pasos: string[];
  cierre: string;
}

export const MISIONES: Mision[] = [
  {
    id: "school",
    lugar: "school",
    inicio: { x: 1, z: 3, h: 0 },
    pregunta: "Excuse me, how do I get to the school?",
    intro: "Sure! It's very close.",
    pasos: ["Go straight for one block.", "Turn right onto Independencia Avenue.", "The school is on your right, across from the park."],
    cierre: "You can't miss it.",
  },
  {
    id: "hotel",
    lugar: "hotel",
    inicio: { x: 3, z: 3, h: 0 },
    pregunta: "Excuse me, is there a hotel near here?",
    intro: "Yes, there is. It's on Reforma Avenue.",
    pasos: ["Go straight ahead for two blocks.", "Turn left at the traffic light.", "The hotel is on your right."],
    cierre: "Enjoy your stay!",
  },
  {
    id: "pharmacy",
    lugar: "pharmacy",
    inicio: { x: 0, z: 3, h: 0 },
    pregunta: "Excuse me, where is the nearest pharmacy?",
    intro: "It's not far from here.",
    pasos: ["Take the second street on the right.", "Go straight for one block.", "The pharmacy is on your left, between the church and the supermarket."],
    cierre: "I hope you feel better!",
  },
  {
    id: "health",
    lugar: "health",
    inicio: { x: 2, z: 3, h: 0 },
    pregunta: "Excuse me, I am looking for the health center. Is it far?",
    intro: "No, it isn't. It's only a five-minute walk from here.",
    pasos: ["Go straight for two blocks.", "Turn left at the bank.", "Go straight for one more block.", "The health center is on your right, on the corner of Reforma Avenue and Juárez Street."],
    cierre: "Good luck!",
  },
  {
    id: "library",
    lugar: "library",
    inicio: { x: 3, z: 0, h: 2 },
    pregunta: "Excuse me, could you help me? How do I get to the library?",
    intro: "Of course.",
    pasos: ["Turn right at Independencia Avenue.", "Cross Hidalgo Street.", "The library is on your left, on the corner of Independencia Avenue and Hidalgo Street."],
    cierre: "You're welcome!",
  },
];

export interface MisionCompilada {
  mision: Mision;
  lecturas: Lectura[];
  ejec: Ejecucion;
}

export function compilarMision(m: Mision): MisionCompilada {
  const lecturas = m.pasos.map(parseIndicacion);
  const cmds = lecturas.map((l) => (l.ok ? l.cmd : null));
  return { mision: m, lecturas, ejec: ejecutar(cmds, m.inicio) };
}

export const MISIONES_COMP: MisionCompilada[] = MISIONES.map(compilarMision);

/** Qué pide una primitiva, en español, para explicar. */
const PRIM_ES: Record<Prim, string> = {
  F: "seguir derecho una cuadra",
  L: "girar a la izquierda",
  R: "girar a la derecha",
  EL: "decir que llegó y que está a la izquierda",
  ER: "decir que llegó y que está a la derecha",
};

/** Compara lo que hizo el alumno con la ruta literal de la misión. */
export function evaluarSeguimiento(mc: MisionCompilada, alumno: Prim[]): { ok: boolean; msg: string; paso: number | null } {
  const esperado = mc.ejec.prims;
  const inicio = mc.mision.inicio;
  const finA = estadosDe(inicio, alumno.slice(0, -1));
  const eA = finA[finA.length - 1]!;
  const ultimo = alumno[alumno.length - 1];
  const destino = mc.mision.lugar;
  if (ultimo === "EL" || ultimo === "ER") {
    const lado: Lado = ultimo === "EL" ? "L" : "R";
    if (estaAlLado(eA, lado, destino)) {
      return { ok: true, msg: `¡Llegó! ${lugar(destino).es[0]!.toUpperCase()}${lugar(destino).es.slice(1)} está a la ${LADO_ES[lado]} de Emma.`, paso: null };
    }
  }
  let k = 0;
  while (k < alumno.length && k < esperado.length && alumno[k] === esperado[k]) k++;
  const paso = Math.max(0, mc.ejec.rangos.findIndex(([a, b]) => k >= a && k < b));
  const texto = mc.mision.pasos[paso] ?? "";
  const estadoK = estadosDe(inicio, esperado.slice(0, k));
  const eK = estadoK[estadoK.length - 1]!;
  const hizo = alumno[k];
  const debia = esperado[k];
  let msg = "";
  if (!debia || !hizo) msg = "No llegó al destino.";
  else if ((debia === "EL" || debia === "ER") && (hizo === "EL" || hizo === "ER")) {
    const lado: Lado = debia === "EL" ? "L" : "R";
    msg = `Estaba en la cuadra correcta, pero «on your ${LADO_EN[lado]}» significa a la ${LADO_ES[lado]} de quien camina.`;
  } else if ((debia === "L" && hizo === "R") || (debia === "R" && hizo === "L")) {
    const lado: Lado = debia;
    msg = `«${texto}» pide girar a la ${LADO_ES[lado]} (${LADO_EN[lado]}). Emma miraba al ${RUMBO_ES[eK.h]}: su ${LADO_ES[lado]} no es la tuya frente a la pantalla.`;
  } else if (debia === "F") {
    msg = `En «${texto}» todavía tocaba ${PRIM_ES.F}; tú elegiste ${PRIM_ES[hizo]}. ${explicaCmd(mc.lecturas[paso])}`;
  } else if (hizo === "F") {
    msg = `En ${nombreEsquina(eK.x, eK.z)} ya no había que avanzar: «${texto}» pedía ${PRIM_ES[debia]} ahí. ${explicaCmd(mc.lecturas[paso])}`;
  } else {
    msg = `«${texto}» pedía ${PRIM_ES[debia]}; tú elegiste ${PRIM_ES[hizo]}.`;
  }
  return { ok: false, msg, paso };
}

function explicaCmd(l: Lectura | undefined): string {
  if (!l || !l.ok || !l.cmd) return "";
  const c = l.cmd;
  if (c.k === "recto") return `«Go straight for ${c.n === 1 ? "one block" : `${["", "one", "two", "three", "four"][c.n]} blocks`}» = seguir derecho ${CUADRAS(c.n)}.`;
  if (c.k === "girar" && c.ref) return `Con una referencia («at …») se camina hasta encontrarla y ahí se gira.`;
  if (c.k === "tomar") return "«Take the second street on the right» = cuenta las calles que salen a ese lado y entra en la que toca.";
  if (c.k === "cruzar") return "«Cross … Street» = camina hasta esa calle y crúzala.";
  return "";
}

/* ════════════════════════════════════════════════════════════════════════
 * 5. MODO 2 — GIVE DIRECTIONS
 * ════════════════════════════════════════════════════════════════════════ */

export interface Tarea {
  id: string;
  lugar: LugarId;
  inicio: Estado;
  pregunta: string;
  ejemplo: string;
}

export const TAREAS: Tarea[] = [
  { id: "market", lugar: "market", inicio: { x: 3, z: 2, h: 3 }, pregunta: "Excuse me, how do I get to the market?", ejemplo: "Go straight for two blocks. Turn right. It's on your left, next to the taco shop." },
  { id: "bakery", lugar: "bakery", inicio: { x: 0, z: 3, h: 1 }, pregunta: "Excuse me, where is the bakery?", ejemplo: "Turn left at Hidalgo Street. Go straight for one block. It's on your right, between the bank and the butcher shop." },
  { id: "gym", lugar: "gym", inicio: { x: 0, z: 0, h: 2 }, pregunta: "Excuse me, is there a gym near here?", ejemplo: "Go straight for two blocks. Turn left. Go straight for three blocks. Turn right. It's on your right." },
];

export const BANCO_FRASES: string[] = [
  "Go straight for one block.",
  "Go straight for two blocks.",
  "Go straight for three blocks.",
  "Turn left.",
  "Turn right.",
  "Turn left at the traffic light.",
  "Turn right at the traffic light.",
  "Take the first street on the left.",
  "Take the second street on the right.",
  "Cross the street.",
  "It's on your left.",
  "It's on your right.",
];

export interface VeredictoDar {
  ok: boolean;
  titulo: string;
  msg: string;
  /** Índice de la indicación culpable (si la hay). */
  culpable: number | null;
  prims: Prim[];
  usoReferencia: boolean;
}

/** Ejecuta la ruta escrita y explica, en español, si llegó y qué lo desvió. */
export function evaluarRuta(textos: string[], t: Tarea): VeredictoDar {
  const lecturas = textos.map(parseIndicacion);
  const malo = lecturas.findIndex((l) => !l.ok);
  if (malo >= 0) {
    const l = lecturas[malo]!;
    return { ok: false, titulo: `Sam no entiende la indicación ${malo + 1}`, msg: l.ok ? "" : l.error, culpable: malo, prims: [], usoReferencia: false };
  }
  const cmds = lecturas.map((l) => (l.ok ? l.cmd : null));
  const usoReferencia = cmds.some((c) => !!c && ((c.k === "girar" && !!c.ref && c.ref.t !== "aqui") || c.k === "tomar" || (c.k === "cruzar" && !!c.calle)));
  const ej = ejecutar(cmds, t.inicio);
  const destino = lugar(t.lugar);
  if (ej.error) return { ok: false, titulo: `La indicación ${ej.error.paso + 1} no se puede seguir`, msg: ej.error.msg, culpable: ej.error.paso, prims: ej.prims, usoReferencia };

  const estados = estadosDe(t.inicio, ej.prims.filter((p) => p !== "EL" && p !== "ER"));
  const fin = estados[estados.length - 1]!;

  // ¿Qué indicación lo alejó primero del destino?
  const culpableDesvio = (): { i: number; txt: string } | null => {
    let mejor = distanciaA(t.inicio, t.lugar);
    for (let i = 0; i < ej.rangos.length; i++) {
      const [, b] = ej.rangos[i]!;
      const e = estadosDe(t.inicio, ej.prims.slice(0, b).filter((p) => p !== "EL" && p !== "ER"));
      const d = distanciaA(e[e.length - 1]!, t.lugar);
      if (d > mejor) {
        const previo = i > 0 ? cmds[i - 1] : null;
        const eAntes = estadosDe(t.inicio, ej.prims.slice(0, ej.rangos[i]![0]).filter((p) => p !== "EL" && p !== "ER"));
        const rumbo = RUMBO_ES[eAntes[eAntes.length - 1]!.h];
        if (previo && previo.k === "girar")
          return { i: i - 1, txt: `Después de «${textos[i - 1]}», Sam quedó mirando al ${rumbo}, y «${textos[i]}» lo alejó del destino. Revisa el lado del giro: left = izquierda, right = derecha, siempre desde quien camina.` };
        return { i, txt: `«${textos[i]}» llevó a Sam hacia el ${rumbo} y lo alejó del destino (quedó a ${CUADRAS(d)}).` };
      }
      mejor = Math.min(mejor, d);
    }
    return null;
  };

  const esquinaMalRumbo = () => {
    const bueno = ([0, 1, 2, 3] as Rumbo[]).find((h) => estaAlLado({ ...fin, h }, "L", t.lugar) || estaAlLado({ ...fin, h }, "R", t.lugar));
    const junto = destino.es.startsWith("el ") ? `al ${destino.es.slice(3)}` : `a ${destino.es}`;
    let pista = " Revisa el último giro: left = izquierda y right = derecha de quien camina.";
    if (bueno !== undefined) {
      if (bueno === girarRumbo(fin.h, "L")) pista = " Desde ahí le faltaba girar a la izquierda (turn left).";
      else if (bueno === girarRumbo(fin.h, "R")) pista = " Desde ahí le faltaba girar a la derecha (turn right).";
      else pista = ` El lugar está hacia el ${RUMBO_ES[bueno]}, justo al revés: lo más probable es que un giro fuera hacia el lado contrario (left ↔ right).`;
    }
    return `Sam llegó a ${nombreEsquina(fin.x, fin.z)}, junto ${junto}, pero quedó mirando al ${RUMBO_ES[fin.h]} y el lugar no está en esa cuadra.${pista}`;
  };

  if (!ej.final) {
    const lado = ladoDelDestino(fin, t.lugar);
    if (lado) return { ok: false, titulo: "Casi: falta la indicación final", msg: `Sam ya tiene ${destino.es} en la cuadra de enfrente, pero no le dijiste de qué lado está. Termina con «It's on your ${LADO_EN[lado]}».`, culpable: null, prims: ej.prims, usoReferencia };
    const desv = culpableDesvio();
    if (!desv && distanciaA(fin, t.lugar) === 0) return { ok: false, titulo: "Esquina correcta, rumbo equivocado", msg: esquinaMalRumbo(), culpable: null, prims: ej.prims, usoReferencia };
    return { ok: false, titulo: "Sam no llegó", msg: desv ? desv.txt : `Sam se quedó en ${nombreEsquina(fin.x, fin.z)}, a ${CUADRAS(distanciaA(fin, t.lugar))} ${deEs(destino.es)}: faltan indicaciones.`, culpable: desv?.i ?? null, prims: ej.prims, usoReferencia };
  }

  const cmdFinal = cmds[ej.final.paso];
  const lado = ej.final.lado;
  if (cmdFinal && cmdFinal.k === "final" && cmdFinal.lugar && cmdFinal.lugar !== t.lugar)
    return { ok: false, titulo: "Ese no es el lugar que busca Sam", msg: `Sam pregunta por ${destino.es} (the ${destino.en}), no por ${nombreEs(cmdFinal.lugar)}.`, culpable: ej.final.paso, prims: ej.prims, usoReferencia };

  if (estaAlLado(fin, lado, t.lugar)) {
    if (cmdFinal && cmdFinal.k === "final" && cmdFinal.rel && !relacionVerdadera(t.lugar, cmdFinal.rel)) {
      const ciertas = relacionesVerdaderas(t.lugar).map(fraseRelacion);
      return {
        ok: false,
        titulo: "Llegó, pero tu pista final no es cierta",
        msg: `Sam está frente a ${destino.es}, pero no está «${fraseRelacion(cmdFinal.rel)}». ${PREP_DEF[cmdFinal.rel.prep].regla} En el mapa, the ${destino.en} is ${ciertas.slice(0, 2).join(" / ")}.`,
        culpable: ej.final.paso,
        prims: ej.prims,
        usoReferencia,
      };
    }
    return { ok: true, titulo: "¡Sam llegó!", msg: `Siguiendo tus ${textos.length} indicaciones al pie de la letra, Sam encontró ${destino.es} a su ${LADO_ES[lado]}.`, culpable: null, prims: ej.prims, usoReferencia };
  }
  const otro: Lado = lado === "L" ? "R" : "L";
  if (estaAlLado(fin, otro, t.lugar))
    return { ok: false, titulo: "Cuadra correcta, lado equivocado", msg: `Sam llegó a la cuadra, pero ${destino.es} está a su ${LADO_ES[otro]}: escribe «It's on your ${LADO_EN[otro]}». Sam mira al ${RUMBO_ES[fin.h]}; imagina que caminas con él.`, culpable: ej.final.paso, prims: ej.prims, usoReferencia };
  const desv = culpableDesvio();
  if (!desv && distanciaA(fin, t.lugar) === 0) return { ok: false, titulo: "Esquina correcta, rumbo equivocado", msg: esquinaMalRumbo(), culpable: ej.final.paso, prims: ej.prims, usoReferencia };
  const hay = queHayAlLado(fin, lado).map(nombreEn);
  return {
    ok: false,
    titulo: "Sam no encontró el lugar",
    msg: `${desv ? desv.txt : `Sam se detuvo en ${nombreEsquina(fin.x, fin.z)}, a ${CUADRAS(distanciaA(fin, t.lugar))} ${deEs(destino.es)}.`} A su ${LADO_ES[lado]} ve: ${hay.length ? hay.map((h) => `the ${h}`).join(", ") : "solo casas"}.`,
    culpable: desv?.i ?? ej.final.paso,
    prims: ej.prims,
    usoReferencia,
  };
}

/* ════════════════════════════════════════════════════════════════════════
 * 6. MODO 3 — WHERE IS IT?
 * ════════════════════════════════════════════════════════════════════════ */

export type Marco = "where" | "how" | "isthere";

export const MARCO_DEF: Record<Marco, { es: string }> = {
  where: { es: "Pregunta dónde está (Where…?)" },
  how: { es: "Pregunta cómo llegar (How…?)" },
  isthere: { es: "Pregunta si hay uno cerca (Is there…?)" },
};

export interface RondaDonde {
  sujeto: Referente;
  marco: Marco;
}

export const RONDAS: RondaDonde[] = [
  { sujeto: "pharmacy", marco: "where" },
  { sujeto: "bank", marco: "isthere" },
  { sujeto: "school", marco: "how" },
  { sujeto: "health", marco: "where" },
  { sujeto: "bakery", marco: "how" },
  { sujeto: "busstop", marco: "where" },
  { sujeto: "market", marco: "isthere" },
  { sujeto: "library", marco: "where" },
];

/** Oraciones aceptadas y fichas (con distractores) de la pregunta cortés. */
export function preguntaDe(r: RondaDonde): { validas: string[]; fichas: string[] } {
  const n = nombreEn(r.sujeto);
  if (r.marco === "where") return { validas: [`Excuse me, where is the ${n}?`], fichas: ["Excuse me,", "where", "is", "the", n, "?", "when", "are"] };
  if (r.marco === "how") return { validas: [`Excuse me, how can I get to the ${n}?`, `Excuse me, how do I get to the ${n}?`], fichas: ["Excuse me,", "how", "can", "I", "get", "to", "the", n, "?", "do", "what"] };
  return { validas: [`Excuse me, is there a ${n} near here?`], fichas: ["Excuse me,", "is", "there", "a", n, "near", "here", "?", "are", "the"] };
}

export function unirFichas(fichas: string[]): string {
  return fichas.join(" ").replace(/\s+\?/g, "?").replace(/\s+,/g, ",");
}

/** Revisa la pregunta armada y explica la regla si está mal. */
export function revisarPregunta(r: RondaDonde, fichas: string[]): { ok: boolean; msg: string } {
  const { validas } = preguntaDe(r);
  const txt = unirFichas(fichas);
  if (validas.some((v) => normalizaEn(v) === normalizaEn(txt) && txt.trim().endsWith("?"))) return { ok: true, msg: "¡Pregunta cortés y correcta!" };
  if (fichas[0] !== "Excuse me,") return { ok: false, msg: "Empieza con «Excuse me,»: es la forma cortés de dirigirte a un desconocido antes de preguntar." };
  if (fichas.includes("when")) return { ok: false, msg: "When = cuándo (tiempo). Para preguntar por un lugar se usa where = dónde." };
  if (fichas.includes("what")) return { ok: false, msg: "What = qué. Para preguntar cómo llegar se usa how: «How can I get to…?» = ¿Cómo llego a…?" };
  if (fichas.includes("are")) return { ok: false, msg: "Hablas de un solo lugar: se usa is. There is = singular, there are = plural (Is there a bank…?)." };
  if (r.marco === "isthere" && fichas.includes("the")) return { ok: false, msg: "Para preguntar si existe uno cerca se usa a: «Is there a … near here?». The se usa cuando ya sabes cuál." };
  if (fichas[fichas.length - 1] !== "?") return { ok: false, msg: "Una pregunta termina con signo de interrogación (solo al final en inglés)." };
  if (r.marco === "where") return { ok: false, msg: "Revisa el orden: palabra interrogativa + verbo + lugar: «Where is the …?»." };
  if (r.marco === "how") return { ok: false, msg: "Revisa el orden: «How can I get to the …?» (how + can/do + I + get to + lugar)." };
  return { ok: false, msg: "Revisa el orden: en la pregunta el verbo va primero: «Is there a … near here?»." };
}

/** La oración de respuesta según el marco de la pregunta. */
export function respuestaDe(r: RondaDonde, rel: Relacion): string {
  if (r.marco === "isthere") return `Yes, there is one ${fraseRelacion(rel)}.`;
  if (r.marco === "how") return `It's ${fraseRelacion(rel)}.`;
  return `The ${nombreEn(r.sujeto)} is ${fraseRelacion(rel)}.`;
}

/** Explica por qué una relación es falsa y da una cierta. */
export function explicaRelacionFalsa(sujeto: Referente, rel: Relacion): string {
  const ciertas = relacionesVerdaderas(sujeto);
  const misma = ciertas.find((c) => c.prep === rel.prep);
  const base = PREP_DEF[rel.prep].regla;
  const ejemplo = misma ?? ciertas[0];
  return `${base} En el mapa no es así. Una forma correcta: «The ${nombreEn(sujeto)} is ${ejemplo ? fraseRelacion(ejemplo) : "…"}».`;
}

/* ── Tarjeta de estrellas: ¿es cierto en el mapa? ─────────────────────── */

export interface EnunciadoMapa {
  texto: string;
  cierto: boolean;
  porque: string;
}

const SUJETOS: Referente[] = ["health", "church", "pharmacy", "supermarket", "tacos", "market", "bank", "bakery", "butcher", "post", "school", "library", "busstop"];

export function rondaEnunciados(rnd: () => number, n = 6): EnunciadoMapa[] {
  const out: EnunciadoMapa[] = [];
  const usados = new Set<string>();
  let intentos = 0;
  while (out.length < n && intentos < 400) {
    intentos++;
    const sujeto = SUJETOS[Math.floor(rnd() * SUJETOS.length)]!;
    const ciertas = relacionesVerdaderas(sujeto);
    if (!ciertas.length) continue;
    const quiereCierto = out.filter((e) => e.cierto).length < Math.ceil(n / 2) && (out.filter((e) => !e.cierto).length >= Math.floor(n / 2) || rnd() < 0.5);
    let rel: Relacion;
    if (quiereCierto) rel = ciertas[Math.floor(rnd() * ciertas.length)]!;
    else {
      // Cambia el referente o la preposición hasta que sea falsa.
      const base = ciertas[Math.floor(rnd() * ciertas.length)]!;
      const otros = SUJETOS.filter((s) => s !== sujeto && s !== "busstop") as Referente[];
      if (base.prep === "corner") {
        const cs = CALLES.map((c) => c.id);
        rel = { prep: "corner", calles: [cs[Math.floor(rnd() * cs.length)]!, cs[Math.floor(rnd() * cs.length)]!] };
      } else if (base.prep === "between") {
        rel = { prep: "between", a: base.a, b: otros[Math.floor(rnd() * otros.length)] };
      } else {
        const preps: Prep[] = ["next", "across"];
        rel = { prep: preps[Math.floor(rnd() * preps.length)]!, a: [...otros, "park" as Referente][Math.floor(rnd() * (otros.length + 1))] };
      }
      if (relacionVerdadera(sujeto, rel)) continue;
      if (rel.prep === "corner" && rel.calles && (rel.calles[0] === rel.calles[1] || calle(rel.calles[0]).eje === calle(rel.calles[1]).eje)) continue;
      if (rel.prep === "between" && rel.a === rel.b) continue;
      if ((rel.prep === "next" || rel.prep === "across") && rel.a === sujeto) continue;
    }
    const texto = `The ${nombreEn(sujeto)} is ${fraseRelacion(rel)}.`;
    if (usados.has(texto)) continue;
    usados.add(texto);
    const cierto = relacionVerdadera(sujeto, rel);
    out.push({ texto, cierto, porque: cierto ? `Cierto: ${PREP_DEF[rel.prep].regla}` : `Falso. ${explicaRelacionFalsa(sujeto, rel)}` });
  }
  return out;
}

/* ════════════════════════════════════════════════════════════════════════
 * 7. GEOMETRÍA DEL MUNDO (números puros, la escena los usa)
 * ════════════════════════════════════════════════════════════════════════ */

export const CELDA = 1.3;
export const ANCHO_CALLE = 2.2;
export const BLOQUE = CELDA * 3;
export const PASO = BLOQUE + ANCHO_CALLE;
export const nodoW = (i: number) => (i - 1.5) * PASO;
export function centroLote(bx: number, bz: number, cx: number, cz: number): [number, number] {
  return [nodoW(bx) + ANCHO_CALLE / 2 + CELDA * (cx + 0.5), nodoW(bz) + ANCHO_CALLE / 2 + CELDA * (cz + 0.5)];
}
export function centroReferente(r: Referente): [number, number] {
  if (r === "park") return [nodoW(1) + PASO / 2, nodoW(1) + PASO / 2];
  if (r === "busstop") {
    const [x, z] = centroLote(1, 2, 1, 0);
    return [x, z - CELDA / 2 + 0.12];
  }
  const l = lugar(r);
  return centroLote(l.bx, l.bz, l.cx, l.cz);
}

export interface Punto {
  x: number;
  z: number;
  ang: number;
}

const OFFSET = 0.55;
const angDe = (h: Rumbo) => Math.atan2(DIRS[h]![0], DIRS[h]![1]);

function puntoNodo(e: Estado): Punto {
  const [dx, dz] = DIRS[e.h]!;
  return { x: nodoW(e.x) - dz * OFFSET, z: nodoW(e.z) + dx * OFFSET, ang: angDe(e.h) };
}

/** Puntos de paso del personaje (mundo) para una lista de primitivas. */
export function puntosRuta(inicio: Estado, prims: Prim[], destino: LugarId | null): Punto[] {
  const out: Punto[] = [puntoNodo(inicio)];
  let e = inicio;
  for (const p of prims) {
    if (p === "EL" || p === "ER") {
      const lado: Lado = p === "EL" ? "L" : "R";
      const [dx, dz] = DIRS[e.h]!;
      if (!dentro(e.x + dx, e.z + dz)) break;
      const r: [number, number] = lado === "R" ? [-dz, dx] : [dz, -dx];
      let t = 0.5;
      if (destino && estaAlLado(e, lado, destino)) {
        const [cx, cz] = centroReferente(destino);
        const ax = nodoW(e.x);
        const az = nodoW(e.z);
        t = ((cx - ax) * dx + (cz - az) * dz) / PASO;
        t = Math.min(0.9, Math.max(0.1, t));
      }
      const bx = nodoW(e.x) + dx * PASO * t + r[0] * 0.7;
      const bz = nodoW(e.z) + dz * PASO * t + r[1] * 0.7;
      out.push({ x: bx, z: bz, ang: angDe(e.h) });
      out.push({ x: bx, z: bz, ang: Math.atan2(r[0], r[1]) });
      break;
    }
    const n = aplicarPrim(e, p);
    if (!n) break;
    e = n;
    out.push(puntoNodo(e));
  }
  return out;
}

/* ════════════════════════════════════════════════════════════════════════
 * 8. CONTENIDO VERBATIM (IN-II-P06)
 * ════════════════════════════════════════════════════════════════════════ */

export const TITULO_A1 = "How to Ask for and Give Directions in English";

/** Lectura A1 — verbatim. */
export const LECTURA_A1: string[] = [
  "Knowing how to ask for and give directions in English is one of the most practical communication skills you can develop. Whether you are helping a foreign tourist navigate your city or asking for help in an English-speaking country, these phrases are immediately useful.",
  "To ask for directions politely, start with an excuse: Excuse me, could you help me? Then ask your question: How do I get to the nearest pharmacy? Where is the bus station? Is there a bank near here? Is it far from here? Can I walk there or should I take a bus?",
  "To give directions clearly, use these key phrases. Turn left at the traffic light. Turn right at the corner. Go straight ahead for two blocks. Take the first street on the left. Take the second street on the right. It is on your left. It is on your right. You will see it on the corner.",
  "Prepositions of place are essential for giving precise directions. The pharmacy is next to the supermarket. The school is opposite the park. The bakery is between the bank and the butcher shop. The clinic is on the corner of Reforma and Juarez. The market is in front of the municipal palace. The bus stop is behind the church. Across from the plaza, you will find the post office.",
  "In Mexican cities and towns, people often give directions using local landmarks rather than street names or numbers, because in practice street addresses are rarely memorized. A Mexican might say: go past the OXXO, turn left at the taqueria, and the secondary school is right next to the pharmacy, you cannot miss it. This landmark-based navigation is very common in smaller towns where everyone knows the local reference points.",
  "Transport vocabulary is also useful in this context. You can take the camion (bus), the metro, the pesero (minibus), or a taxi. Many cities now also have bicicletas publicas (public bicycles) available. If the destination is close, you can go on foot: it is only a five-minute walk from here.",
  "Practice dialogue: A tourist stops you on the street. She says: Excuse me, I am looking for the health center. Is it far? You look at the map in your head and give her clear directions using at least four of the phrases above.",
];

/** Recuadro de la lectura A1 — verbatim. */
export const RECUADRO_A1 =
  "When you are not sure of directions in an English-speaking context, it is perfectly acceptable to say: I am sorry, I am not from here. I think it is that way but I am not completely sure. You might want to ask someone else to be certain. Being honest about uncertainty is more helpful than giving wrong directions.";

/** Preguntas de comprensión de la lectura A1 — verbatim. */
export const PREGUNTAS_A1: string[] = [
  "What are three phrases you can use to ask for directions politely in English?",
  'What is the difference between "next to", "opposite", and "between" as prepositions of place?',
  "Why do Mexicans often use landmarks instead of street names when giving directions?",
];

/** Glosario A5 — verbatim. */
export const GLOSARIO: { termino: string; definicion: string; ejemplo: string }[] = [
  { termino: "go straight", definicion: "Imperativo: sigue derecho/recto.", ejemplo: "Go straight for two blocks." },
  { termino: "turn left / turn right", definicion: "Imperativos: da vuelta a la izquierda / derecha.", ejemplo: "Turn left at the corner." },
  { termino: "next to / across from", definicion: "Preposiciones de lugar: al lado de / enfrente de.", ejemplo: "The bank is next to the school." },
  { termino: "into / across", definicion: "Preposiciones de movimiento: hacia dentro de / a través de.", ejemplo: "Walk across the street." },
  { termino: "places in town", definicion: "Lugares en la ciudad: park, hospital, market, bus station.", ejemplo: "There is a market near my house." },
  { termino: "by bus / on foot", definicion: "Medios de transporte: en autobús / a pie.", ejemplo: "I go to school by bus." },
];
export const ACTIVIDAD_A5 = "Escribe indicaciones de tu casa a la escuela usando 3 imperativos y 2 preposiciones de lugar.";

/** Escritura A3 — verbatim. */
export const A3 = {
  titulo: "Giving Directions to My School",
  prompt:
    "Write directions in English from your school (or home) to a place in your community (a store, a park, a market, a bus stop). Use at least 6 direction phrases (turn left, go straight, cross the street, etc.) and prepositions of location (next to, between, on the corner of).",
  pistas: ["Start with: 'To get to [place], start at [starting point]...'", "Be specific: 'Walk two blocks', 'Turn right at the traffic light.'", "End with: 'You will see [landmark]. [Place] is next to it.'"],
};

/** Autoevaluación A7 — criterios verbatim. */
export const AUTOEVALUACION_A7: string[] = [
  "Doy indicaciones usando imperativos (go straight, turn left).",
  "Uso 'There is / There are' para describir lo que hay en un lugar.",
  "Uso preposiciones de lugar y movimiento (next to, across, into).",
  "Conozco vocabulario de lugares en la ciudad y de transporte.",
];
export const REFLEXION_A7 = "¿A qué lugar de tu comunidad podrías dar indicaciones en inglés?";

/** Pregunta abierta del video A9 — verbatim. */
export const ABIERTA_A9 = "Escribe en inglés las indicaciones para llegar de tu escuela a la farmacia más cercana, usando al menos cuatro de las frases del video.";

export const FUENTE = "CEN Bachillerato — UAC Inglés II, progresión 6: lectura A1, texto A6, verdadero/falso A4, glosario A5, escritura A3, autoevaluación A7 y preguntas del video A9.";

export const PROBLEMA =
  "Un turista te detiene en la calle: «Excuse me, how do I get to…?». Para orientarlo en inglés no basta con saber palabras: hay que decirlas en orden, desde el punto de vista de quien camina, y con referencias que se puedan ver. En este barrio 3D sigues indicaciones, las das tú y ubicas lugares con preposiciones; la escena ejecuta exactamente lo que dices.";

export const INSTRUCCIONES: string[] = [
  "En Follow the directions lee (o escucha) las indicaciones en inglés y lleva a Emma paso a paso con los botones. Al final di de qué lado está el lugar.",
  "En Give directions escribe la ruta en inglés para Sam. Sam la ejecuta al pie de la letra; si no llega, verás qué indicación lo desvió.",
  "En Where is it? arma la pregunta cortés con fichas y responde dónde está el lugar con next to, across from, between u on the corner of.",
  "Juega «¿Es cierto en el mapa?» para ganar estrellas, aprueba el reto (A4 + A9) y completa el texto A6.",
];

export const IDEAS: string[] = [
  "Las indicaciones se dan en imperativo: verbo base sin sujeto (Go straight, Turn left, Cross the street).",
  "Left y right son la izquierda y la derecha de quien camina, no las de quien mira el mapa.",
  "Con una referencia («Turn left at the bank») se camina hasta verla y ahí se gira.",
  "Next to = al lado; across from / opposite = del otro lado de la calle; between = en medio de dos.",
  "On the corner of … and … nombra las dos calles que se cruzan.",
  "Para preguntar con cortesía: Excuse me, where is…? / how can I get to…? / is there a … near here?",
];

/** Hechos: verdadero/falso A4 — verbatim (se evalúan en el reto). */
export const QUIZ: QuizEvaluable = {
  titulo: "True or False — Directions (A4) y video (A9)",
  puntajeMinimo: 70,
  reactivos: [
    { enunciado: "'Go straight' y 'turn left' son imperativos para dar indicaciones.", opciones: ["Verdadero", "Falso"], respuestaCorrecta: 0, retroalimentacion: "Correcto: el imperativo usa el verbo base sin sujeto." },
    { enunciado: "'Turn right' significa 'da vuelta a la izquierda'.", opciones: ["Verdadero", "Falso"], respuestaCorrecta: 1, retroalimentacion: "'Turn right' = da vuelta a la derecha; 'turn left' = a la izquierda." },
    { enunciado: "'There is' se usa para singular y 'There are' para plural.", opciones: ["Verdadero", "Falso"], respuestaCorrecta: 0, retroalimentacion: "Sí: There is a park / There are two banks." },
    { enunciado: "'Next to' significa 'al lado de'.", opciones: ["Verdadero", "Falso"], respuestaCorrecta: 0, retroalimentacion: "Correcto: next to = junto a / al lado de." },
    { enunciado: "'Across from' significa 'detrás de'.", opciones: ["Verdadero", "Falso"], respuestaCorrecta: 1, retroalimentacion: "'Across from' = enfrente de / cruzando; 'behind' = detrás de." },
    {
      enunciado: "¿Cómo se dice en inglés 'sigue derecho dos cuadras'?",
      opciones: ["Turn right for two blocks", "Go straight ahead for two blocks", "Take the second street"],
      respuestaCorrecta: 1,
      retroalimentacion: "Go straight (ahead) = sigue derecho; for two blocks = dos cuadras. «Take the second street» es tomar la segunda calle, y «turn right» es girar a la derecha.",
    },
    {
      enunciado: "En muchas comunidades mexicanas es normal dar indicaciones por referencias locales en vez de por nombres de calle.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Verdadero: la lectura A1 explica que en México se suelen usar referencias (una tienda, la taquería, la iglesia) porque casi nadie memoriza las direcciones.",
    },
  ],
};

/** Actividad A6 «Fill in the blanks — Giving directions» — verbatim. */
export const HUECOS_A6: TextoHuecosData = {
  ancla: "IN-II-P06-A6 · Fill in the blanks — Giving directions",
  instrucciones: "Completa los huecos para dar indicaciones claras hacia el hospital.",
  partes: ["Excuse me, where is the hospital? Go ", " for two blocks, then turn ", " at the bank. ", " a big park next to it. The hospital is across ", " the park."],
  huecos: [
    { respuesta: "straight", alternativas: ["ahead"], pista: "Imperativo: seguir derecho." },
    { respuesta: "left", alternativas: ["right"], pista: "Dirección al dar vuelta (izquierda o derecha)." },
    { respuesta: "There is", alternativas: ["there is", "There's"], pista: "Para indicar que hay UN parque (singular)." },
    { respuesta: "from", alternativas: [], pista: "'across ___' = enfrente de, cruzando." },
  ],
};

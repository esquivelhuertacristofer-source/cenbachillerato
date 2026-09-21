/**
 * Datos y modelo del laboratorio "Objects and spaces" (IN-I-P03, progresión 3
 * de Inglés I: «Identifica y describe objetos y espacios cotidianos del hogar
 * o la escuela (reconoce características como forma, color y tamaño)»).
 *
 * Anclas VERBATIM:
 *   - A1 lectura «What's around us? — Objetos y espacios cotidianos»: marco
 *     teórico, panel de lectura y preguntas de comprensión.
 *   - A2 fill_blanks «Describe it!»: «Completa el texto».
 *   - A3 reflexión escrita: panel «Tu turno».
 *   - A4 quiz «Describing objects — Quiz»: reto evaluable.
 *   - A5 verdadero/falso: hechos. A6 glosario. A7 autoevaluación.
 *
 * Lo que NO es verbatim: los objetos del aula, del estante de objetos
 * perdidos y de la recámara, sus colores y tamaños (se generan al azar) y las
 * instrucciones de los tres modos son ILUSTRATIVOS. Todas las oraciones en
 * inglés están en inglés estadounidense estándar.
 *
 * Orden de los adjetivos: la lectura A1 propone «[tamaño] [color] [forma]»;
 * las gramáticas de referencia (p. ej. Cambridge Dictionary, «Adjectives:
 * order») ponen la forma antes del color: tamaño → forma → color → objeto.
 * El laboratorio enseña el orden estándar y acepta el de la lectura con una
 * nota.
 *
 * Datos puros (sin three ni React).
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { TextoHuecosData } from "./_mecanica-huecos";

/* ── Modos ────────────────────────────────────────────────────────────── */

export type Modo = "buscar" | "perdidos" | "acomodar";
export const MODOS: Modo[] = ["buscar", "perdidos", "acomodar"];

export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string }> = {
  buscar: { etq: "Find it", subtitulo: "Lee la instrucción y encuentra el objeto en el aula", icono: "fa-magnifying-glass", color: "#38bdf8" },
  perdidos: { etq: "Lost and found", subtitulo: "Describe tu objeto para recuperarlo", icono: "fa-box-open", color: "#f472b6" },
  acomodar: { etq: "Arrange the room", subtitulo: "Sigue instrucciones y describe el cuarto", icono: "fa-couch", color: "#fbbf24" },
};

/* ── Utilidades ───────────────────────────────────────────────────────── */

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

function elige<T>(xs: readonly T[], rnd: () => number): T {
  return xs[Math.floor(rnd() * xs.length) % xs.length]!;
}

function otro<T>(xs: readonly T[], excluir: readonly T[], rnd: () => number): T {
  return elige(
    xs.filter((x) => !excluir.includes(x)),
    rnd,
  );
}

export function estrellasPorErrores(errores: number): number {
  return errores === 0 ? 3 : errores <= 2 ? 2 : 1;
}

/* ════════════════════════════════════════════════════════════════════════
 * VOCABULARIO
 * ════════════════════════════════════════════════════════════════════════ */

export type Tamano = "big" | "small" | "long" | "short";
export type Forma = "round" | "square" | "rectangular" | "triangular";
export type ColorId = "red" | "blue" | "green" | "yellow" | "orange" | "purple" | "black" | "white" | "brown" | "pink" | "gray";
type Genero = "m" | "f";

export const COLORES: Record<ColorId, { hex: string; es: [string, string] }> = {
  red: { hex: "#e0393e", es: ["rojo", "roja"] },
  blue: { hex: "#2f6fe4", es: ["azul", "azul"] },
  green: { hex: "#2eaa55", es: ["verde", "verde"] },
  yellow: { hex: "#f4c430", es: ["amarillo", "amarilla"] },
  orange: { hex: "#f37b21", es: ["naranja", "naranja"] },
  purple: { hex: "#8b4fd8", es: ["morado", "morada"] },
  black: { hex: "#23262e", es: ["negro", "negra"] },
  white: { hex: "#f4f5f7", es: ["blanco", "blanca"] },
  brown: { hex: "#8a5a36", es: ["café", "café"] },
  pink: { hex: "#f39ac0", es: ["rosa", "rosa"] },
  gray: { hex: "#8b93a1", es: ["gris", "gris"] },
};

/** Colores con los que se generan los objetos (bien distinguibles entre sí). */
export const PALETA: ColorId[] = ["red", "blue", "green", "yellow", "orange", "purple", "black", "white"];

export const TAMANO_ES: Record<Tamano, [string, string]> = {
  big: ["grande", "grande"],
  small: ["pequeño", "pequeña"],
  long: ["largo", "larga"],
  short: ["corto", "corta"],
};

export const FORMA_ES: Record<Forma, [string, string]> = {
  round: ["redondo", "redonda"],
  square: ["cuadrado", "cuadrada"],
  rectangular: ["rectangular", "rectangular"],
  triangular: ["triangular", "triangular"],
};

export type NounId = "clock" | "box" | "backpack" | "notebook" | "pencil" | "lunchbox" | "pencilcase" | "ball" | "lamp" | "book" | "shoe";

export interface NounDef {
  en: string;
  plural: string;
  es: string;
  esPlural: string;
  genero: Genero;
  /** Formas posibles; null si la forma no distingue a este objeto. */
  formas: Forma[] | null;
  /** Forma que el objeto siempre tiene (una pelota es redonda). */
  formaImplicita?: Forma;
  tamanos: Tamano[];
}

export const NOUNS: Record<NounId, NounDef> = {
  clock: { en: "clock", plural: "clocks", es: "reloj", esPlural: "relojes", genero: "m", formas: ["round", "square", "triangular"], tamanos: ["big", "small"] },
  box: { en: "box", plural: "boxes", es: "caja", esPlural: "cajas", genero: "f", formas: ["square", "rectangular", "round", "triangular"], tamanos: ["big", "small"] },
  backpack: { en: "backpack", plural: "backpacks", es: "mochila", esPlural: "mochilas", genero: "f", formas: null, tamanos: ["big", "small"] },
  notebook: { en: "notebook", plural: "notebooks", es: "cuaderno", esPlural: "cuadernos", genero: "m", formas: null, tamanos: ["big", "small"] },
  pencil: { en: "pencil", plural: "pencils", es: "lápiz", esPlural: "lápices", genero: "m", formas: null, tamanos: ["long", "short"] },
  lunchbox: { en: "lunch box", plural: "lunch boxes", es: "lonchera", esPlural: "loncheras", genero: "f", formas: ["square", "rectangular", "round"], tamanos: ["big", "small"] },
  pencilcase: { en: "pencil case", plural: "pencil cases", es: "estuche", esPlural: "estuches", genero: "m", formas: ["rectangular", "round", "triangular"], tamanos: ["big", "small"] },
  ball: { en: "ball", plural: "balls", es: "pelota", esPlural: "pelotas", genero: "f", formas: null, formaImplicita: "round", tamanos: ["big", "small"] },
  lamp: { en: "lamp", plural: "lamps", es: "lámpara", esPlural: "lámparas", genero: "f", formas: null, tamanos: [] },
  book: { en: "book", plural: "books", es: "libro", esPlural: "libros", genero: "m", formas: null, tamanos: [] },
  shoe: { en: "shoe", plural: "shoes", es: "zapato", esPlural: "zapatos", genero: "m", formas: null, tamanos: [] },
};

/** Un objeto concreto de una escena. */
export interface Objeto {
  id: string;
  noun: NounId;
  tamano: Tamano;
  forma: Forma | null;
  color: ColorId;
  /** Lugar (índice de hueco en la escena) que ocupa. */
  slot: number;
}

export interface Rasgos {
  noun: NounId;
  tamano?: Tamano;
  forma?: Forma;
  color?: ColorId;
}

const VOCAL = /^[aeiou]/;
export const articuloIndef = (palabra: string) => (VOCAL.test(palabra) ? "an" : "a");

/** «small round red clock» (sin artículo), en el orden tamaño → forma → color → objeto. */
export function nucleo(r: Rasgos, plural = false): string {
  const n = NOUNS[r.noun];
  return [r.tamano, r.forma, r.color, plural ? n.plural : n.en].filter(Boolean).join(" ");
}

/** «a small round red clock» / «an orange ball». */
export function conArticulo(r: Rasgos): string {
  const s = nucleo(r);
  return `${articuloIndef(s)} ${s}`;
}

export function rasgosDe(o: Objeto): Rasgos {
  return { noun: o.noun, tamano: o.tamano, forma: o.forma ?? undefined, color: o.color };
}

/* ── Español ──────────────────────────────────────────────────────────── */

const gi = (g: Genero) => (g === "m" ? 0 : 1);

export function adjEs(campo: "tamano" | "forma" | "color", valor: string, g: Genero): string {
  if (campo === "tamano") return `${TAMANO_ES[valor as Tamano][gi(g)]} (${valor})`;
  if (campo === "forma") return `${FORMA_ES[valor as Forma][gi(g)]} (${valor})`;
  return `${COLORES[valor as ColorId].es[gi(g)]} (${valor})`;
}

/** «el reloj pequeño, redondo y rojo». */
export function nombreEs(r: Rasgos, definido = true): string {
  const n = NOUNS[r.noun];
  const g = n.genero;
  const art = definido ? (g === "m" ? "el" : "la") : g === "m" ? "un" : "una";
  const adjs = [r.tamano ? TAMANO_ES[r.tamano][gi(g)] : null, r.forma ? FORMA_ES[r.forma][gi(g)] : null, r.color ? COLORES[r.color].es[gi(g)] : null].filter(Boolean) as string[];
  const lista = adjs.length <= 1 ? adjs.join("") : `${adjs.slice(0, -1).join(", ")} y ${adjs[adjs.length - 1]}`;
  return `${art} ${n.es}${lista ? ` ${lista}` : ""}`;
}

const CAMPOS = ["tamano", "forma", "color"] as const;
type Campo = (typeof CAMPOS)[number];

export const CAMPO_ES: Record<Campo, string> = { tamano: "el tamaño", forma: "la forma", color: "el color" };

/**
 * Explica en español en qué se distingue el objeto que eligió el alumno del
 * que buscaba. «Ese reloj es grande (big) y cuadrado (square); buscas uno
 * pequeño (small) y redondo (round).»
 */
export function diferenciasEs(elegido: Objeto, buscado: Objeto): string {
  const ne = NOUNS[elegido.noun];
  const nb = NOUNS[buscado.noun];
  if (elegido.noun !== buscado.noun) {
    return `Eso es ${ne.genero === "m" ? "un" : "una"} ${ne.es} (${ne.en}); buscas ${nb.genero === "m" ? "un" : "una"} ${nb.es} (${nb.en}).`;
  }
  const g = nb.genero;
  const a: string[] = [];
  const b: string[] = [];
  for (const c of CAMPOS) {
    const ve = c === "forma" ? elegido.forma : elegido[c];
    const vb = c === "forma" ? buscado.forma : buscado[c];
    if (ve && vb && ve !== vb) {
      a.push(adjEs(c, ve, g));
      b.push(adjEs(c, vb, g));
    }
  }
  return `${g === "m" ? "Ese" : "Esa"} ${nb.es} es ${a.join(" y ")}; buscas ${g === "m" ? "uno" : "una"} ${b.join(" y ")}.`;
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. FIND IT — el aula
 * ════════════════════════════════════════════════════════════════════════ */

/** Grupos del aula: cada uno ocupa 4 huecos de su zona (pared, estantes, piso, bancas, escritorio). */
export const GRUPOS_AULA: NounId[] = ["clock", "box", "backpack", "notebook", "pencil"];
export const HUECOS_POR_GRUPO = 4;
export const PASOS_BUSCAR = 6;

/**
 * Variantes de un objeto que difieren en UN rasgo cada una (y, si no tiene
 * forma, una cuarta que cambia tamaño y color). Así, para identificar cada
 * objeto hace falta leer TODOS sus adjetivos.
 */
function variantes(noun: NounId, prefijo: string, n: number, rnd: () => number, colores: readonly ColorId[] = PALETA): Objeto[] {
  const def = NOUNS[noun];
  const tam = elige(def.tamanos, rnd);
  const tam2 = def.tamanos.find((t) => t !== tam)!;
  const col = elige(colores, rnd);
  const col2 = otro(colores, [col], rnd);
  const forma = def.formas ? elige(def.formas, rnd) : null;
  const base = { noun, tamano: tam, forma, color: col };
  const out: Omit<Objeto, "id" | "slot">[] = [base, { ...base, tamano: tam2 }];
  if (def.formas && forma) {
    out.push({ ...base, forma: otro(def.formas, [forma], rnd) });
    out.push({ ...base, color: col2 });
  } else {
    out.push({ ...base, color: col2 });
    out.push({ ...base, tamano: tam2, color: col2 });
  }
  return out.slice(0, n).map((o, i) => ({ ...o, id: `${prefijo}${i}`, slot: 0 }));
}

export function generaAula(rnd: () => number): Objeto[] {
  const out: Objeto[] = [];
  for (const noun of GRUPOS_AULA) {
    // Los lápices blancos casi no se ven sobre la madera: se excluyen.
    const colores = noun === "pencil" ? PALETA.filter((c) => c !== "white" && c !== "black") : PALETA;
    const vs = variantes(noun, `${noun}-`, HUECOS_POR_GRUPO, rnd, colores);
    const slots = baraja([0, 1, 2, 3], rnd);
    vs.forEach((v, i) => out.push({ ...v, slot: slots[i]! }));
  }
  return out;
}

/** Seis objetos a buscar: uno de cada grupo y uno extra, en orden al azar. */
export function rondaBuscar(aula: Objeto[], rnd: () => number): string[] {
  const ids: string[] = [];
  for (const noun of GRUPOS_AULA) ids.push(elige(aula.filter((o) => o.noun === noun), rnd).id);
  const extra = elige(
    aula.filter((o) => !ids.includes(o.id)),
    rnd,
  );
  ids.push(extra.id);
  return baraja(ids, rnd);
}

export function instruccionBuscar(o: Objeto): string {
  return `Find the ${nucleo(rasgosDe(o))}.`;
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. LOST AND FOUND — describir para recuperar
 * ════════════════════════════════════════════════════════════════════════ */

export const CUBOS = 16; // estante de 4 × 4
export const NOUNS_PERDIDOS: NounId[] = ["lunchbox", "pencilcase", "backpack", "ball", "notebook"];

export interface Estante {
  objetos: Objeto[];
  /** Los cuatro objetos del alumno, en el orden en que los busca. */
  tuyos: string[];
}

export function generaEstante(rnd: () => number): Estante {
  const grupos: Objeto[][] = [
    variantes("lunchbox", "lb-", 4, rnd),
    variantes("pencilcase", "pc-", 4, rnd),
    variantes("backpack", "bp-", 3, rnd),
    variantes("ball", "ba-", 3, rnd),
  ];
  const tuyos = baraja(
    grupos.map((g) => g[0]!.id),
    rnd,
  );
  const relleno = variantes("notebook", "nb-", 2, rnd);
  const todos = [...grupos.flat(), ...relleno];
  const cubos = baraja(
    Array.from({ length: CUBOS }, (_, i) => i),
    rnd,
  );
  return { objetos: todos.map((o, i) => ({ ...o, slot: cubos[i]! })), tuyos };
}

export function coincide(o: Objeto, d: Rasgos): boolean {
  if (o.noun !== d.noun) return false;
  if (d.tamano && d.tamano !== o.tamano) return false;
  if (d.color && d.color !== o.color) return false;
  if (d.forma) {
    const n = NOUNS[o.noun];
    if (n.formaImplicita) return d.forma === n.formaImplicita;
    if (o.forma && d.forma !== o.forma) return false;
  }
  return true;
}

const NUMEROS_EN = ["zero", "one", "two", "three", "four", "five", "six"];
const NUMEROS_ES = ["cero", "uno", "dos", "tres", "cuatro", "cinco", "seis"];

export const SALUDO_ENCARGADO = "Hi! Can I help you? What does it look like?";

export function preguntaFaltante(objs: Objeto[]): { campo: Campo; en: string } {
  for (const c of CAMPOS) {
    const vals = new Set(objs.map((o) => (c === "forma" ? o.forma : o[c])));
    if (vals.size > 1) {
      return { campo: c, en: c === "tamano" ? "Is it big or small?" : c === "forma" ? "What shape is it?" : "What color is it?" };
    }
  }
  return { campo: "color", en: "Which one is it?" };
}

export function respuestaVarios(d: Rasgos, objs: Objeto[]): string {
  return `I have ${NUMEROS_EN[objs.length] ?? objs.length} ${nucleo(d, true)}. ${preguntaFaltante(objs).en}`;
}
export const respuestaNinguno = (d: Rasgos) => `Sorry, I don't have ${conArticulo(d)}.`;
export const respuestaOtro = (o: Objeto) => `Here's ${conArticulo(rasgosDe(o))}. Is it yours?`;
export const respuestaTuyo = (o: Objeto) => `Here you are! Your ${nucleo(rasgosDe(o))}.`;

/** Qué rasgos de lo que escribió el alumno NO corresponden a su objeto. */
export function erroresContraTuyo(d: Rasgos, tuyo: Objeto): string {
  const n = NOUNS[tuyo.noun];
  if (d.noun !== tuyo.noun) {
    const nd = NOUNS[d.noun];
    return `Tu objeto no es ${nd.genero === "m" ? "un" : "una"} ${nd.es} (${nd.en}): es ${n.genero === "m" ? "un" : "una"} ${n.es} (${n.en}).`;
  }
  const partes: string[] = [];
  const g = n.genero;
  if (d.tamano && d.tamano !== tuyo.tamano) partes.push(`no es ${adjEs("tamano", d.tamano, g)}, es ${adjEs("tamano", tuyo.tamano, g)}`);
  if (d.forma) {
    const real = n.formaImplicita ?? tuyo.forma;
    if (real && d.forma !== real) partes.push(`no es ${adjEs("forma", d.forma, g)}, es ${adjEs("forma", real, g)}`);
  }
  if (d.color && d.color !== tuyo.color) partes.push(`no es ${adjEs("color", d.color, g)}, es ${adjEs("color", tuyo.color, g)}`);
  if (partes.length === 0) return "";
  return `Revisa: tu ${n.es} ${partes.join("; ")}.`;
}

/* ════════════════════════════════════════════════════════════════════════
 * ANÁLISIS DE LO QUE ESCRIBE EL ALUMNO (validación tolerante)
 * ════════════════════════════════════════════════════════════════════════ */

/** Minúsculas, sin acentos, apóstrofos rectos, sin puntuación ni espacios de sobra. */
export function normalizaIngles(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .toLowerCase()
    .replace(/[‘’`´]/g, "'")
    .replace(/[.,;:!?¡¿"()—-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** it's → it is, there's → there is… y junta los sustantivos de dos palabras. */
function expande(s: string): string {
  return ` ${s} `
    .replace(/ (it|that|there|here|what)'s /g, " $1 is ")
    .replace(/ (its|thats|theres|heres) /g, (_, w: string) => ` ${w.slice(0, -1)} is `)
    .replace(/ i'm | im /g, " i am ")
    .replace(/ (lunch box|lunchbox)es /g, " lunchboxes ")
    .replace(/ (lunch box|lunchbox) /g, " lunchbox ")
    .replace(/ pencil cases /g, " pencilcases ")
    .replace(/ pencil case /g, " pencilcase ")
    .replace(/ in front of /g, " in_front_of ")
    .replace(/ next to /g, " next_to ")
    .replace(/\s+/g, " ")
    .trim();
}

const TAM_PAL: Record<string, Tamano> = { big: "big", large: "big", small: "small", little: "small", long: "long", short: "short" };
const FORMA_PAL: Record<string, { v: Forma; nota?: string }> = {
  round: { v: "round" },
  circular: { v: "round" },
  square: { v: "square" },
  rectangular: { v: "rectangular" },
  triangular: { v: "triangular" },
  circle: { v: "round", nota: "«circle» es el sustantivo (círculo); para describir un objeto usa el adjetivo «round»." },
  triangle: { v: "triangular", nota: "«triangle» es el sustantivo (triángulo); el adjetivo es «triangular»." },
  rectangle: { v: "rectangular", nota: "«rectangle» es el sustantivo (rectángulo); el adjetivo es «rectangular»." },
};
const COLOR_PAL: Record<string, ColorId> = {
  red: "red",
  blue: "blue",
  green: "green",
  yellow: "yellow",
  orange: "orange",
  purple: "purple",
  black: "black",
  white: "white",
  brown: "brown",
  pink: "pink",
  gray: "gray",
  grey: "gray",
};

function tablaSustantivos(permitidos: NounId[]): Record<string, { noun: NounId; plural: boolean; nota?: string }> {
  const t: Record<string, { noun: NounId; plural: boolean; nota?: string }> = {};
  for (const id of permitidos) {
    const n = NOUNS[id];
    t[n.en.replace(" ", "")] = { noun: id, plural: false };
    t[n.plural.replace(" ", "")] = { noun: id, plural: true };
  }
  if (permitidos.includes("lunchbox") && !permitidos.includes("box")) {
    t.box = { noun: "lunchbox", plural: false, nota: "En la escuela, una caja para la comida se llama «lunch box»." };
    t.boxes = { noun: "lunchbox", plural: true };
  }
  return t;
}

/** Palabras en español que el alumno puede escribir sin querer. */
const ESPANOL: Record<string, string> = {
  rojo: "red",
  roja: "red",
  azul: "blue",
  verde: "green",
  amarillo: "yellow",
  amarilla: "yellow",
  naranja: "orange",
  anaranjado: "orange",
  morado: "purple",
  morada: "purple",
  negro: "black",
  negra: "black",
  blanco: "white",
  blanca: "white",
  cafe: "brown",
  rosa: "pink",
  gris: "gray",
  grande: "big",
  pequeno: "small",
  pequena: "small",
  chico: "small",
  chica: "small",
  largo: "long",
  larga: "long",
  corto: "short",
  corta: "short",
  redondo: "round",
  redonda: "round",
  cuadrado: "square",
  cuadrada: "square",
  triangulo: "triangular",
  caja: "box",
  mochila: "backpack",
  pelota: "ball",
  balon: "ball",
  lonchera: "lunch box",
  estuche: "pencil case",
  cuaderno: "notebook",
  libreta: "notebook",
  reloj: "clock",
  libro: "book",
  libros: "books",
  zapato: "shoe",
  zapatos: "shoes",
  lampara: "lamp",
  cama: "bed",
  escritorio: "desk",
  puerta: "door",
  estante: "shelf",
  librero: "shelf",
  tapete: "rug",
  sobre: "on",
  debajo: "under",
  dentro: "in",
  junto: "next to",
  entre: "between",
  hay: "there is / there are",
  es: "is",
  un: "a",
  una: "a",
  el: "the",
  la: "the",
  y: "and",
};

function distancia(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0]![j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i]![j] = Math.min(dp[i - 1]![j]! + 1, dp[i]![j - 1]! + 1, dp[i - 1]![j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length]![b.length]!;
}

function desconocida(w: string, vocab: string[]): string {
  if (ESPANOL[w]) return `«${w}» está en español: en inglés es «${ESPANOL[w]}».`;
  let mejor = "";
  let d = 99;
  for (const v of vocab) {
    const x = distancia(w, v);
    if (x < d) {
      d = x;
      mejor = v;
    }
  }
  if (w.length >= 3 && d <= 2) return `No reconozco «${w}». ¿Quisiste decir «${mejor.replace("_", " ")}»?`;
  return `No reconozco «${w}». Usa palabras de tamaño, forma y color, y el nombre del objeto.`;
}

const legible = (w: string) => w.replace("lunchbox", "lunch box").replace("pencilcase", "pencil case").replace(/_/g, " ");

type Token =
  | { cat: "tam"; v: Tamano; w: string }
  | { cat: "forma"; v: Forma; w: string }
  | { cat: "color"; v: ColorId; w: string }
  | { cat: "noun"; v: NounId; plural: boolean; w: string }
  | { cat: "and"; w: string }
  | { cat: "otra"; w: string };

function clasifica(w: string, sust: ReturnType<typeof tablaSustantivos>, notas: string[]): Token {
  if (TAM_PAL[w]) return { cat: "tam", v: TAM_PAL[w], w };
  const f = FORMA_PAL[w];
  if (f) {
    if (f.nota && !notas.includes(f.nota)) notas.push(f.nota);
    return { cat: "forma", v: f.v, w };
  }
  if (COLOR_PAL[w]) return { cat: "color", v: COLOR_PAL[w], w };
  const s = sust[w];
  if (s) {
    if (s.nota && !notas.includes(s.nota)) notas.push(s.nota);
    return { cat: "noun", v: s.noun, plural: s.plural, w };
  }
  if (w === "and") return { cat: "and", w };
  return { cat: "otra", w };
}

export interface GrupoNominal {
  rasgos: Rasgos | null;
  plural: boolean;
  /** Palabras que forman el grupo, para dar ejemplos. */
  palabras: string[];
}

/**
 * Analiza «[tamaño] [forma] [color] objeto» (sin artículo). Añade errores y
 * notas en español que explican la regla.
 */
function analizaGrupo(toks: string[], permitidos: NounId[], errores: string[], notas: string[]): GrupoNominal {
  const sust = tablaSustantivos(permitidos);
  const vocab = [...Object.keys(TAM_PAL), ...Object.keys(FORMA_PAL), ...Object.keys(COLOR_PAL), ...Object.keys(sust)];
  const ts = toks.map((w) => clasifica(w, sust, notas));
  const nombres = ts.filter((t) => t.cat === "noun");
  for (const t of ts) if (t.cat === "otra") errores.push(desconocida(t.w, vocab));
  if (ts.some((t) => t.cat === "and")) notas.push("Antes del sustantivo los adjetivos van seguidos, sin «and»: «a big red ball».");
  if (nombres.length === 0) {
    errores.push("Falta el objeto: termina la descripción con el sustantivo (por ejemplo, «backpack»).");
    return { rasgos: null, plural: false, palabras: toks };
  }
  if (nombres.length > 1) {
    errores.push("Describe un solo objeto a la vez: usa un solo sustantivo.");
    return { rasgos: null, plural: false, palabras: toks };
  }
  const iNoun = ts.findIndex((t) => t.cat === "noun");
  const noun = ts[iNoun] as Extract<Token, { cat: "noun" }>;
  const adjs = ts.filter((t) => t.cat === "tam" || t.cat === "forma" || t.cat === "color") as Extract<Token, { cat: "tam" | "forma" | "color" }>[];
  const despues = ts.slice(iNoun + 1).filter((t) => t.cat === "tam" || t.cat === "forma" || t.cat === "color");
  if (despues.length > 0) {
    const ej = [...adjs.map((a) => a.w), noun.w].map(legible).join(" ");
    errores.push(`En inglés el adjetivo va ANTES del sustantivo (al revés que en español): «${ej}», no «${toks.map(legible).join(" ")}».`);
  }
  const rasgos: Rasgos = { noun: noun.v };
  for (const cat of ["tam", "forma", "color"] as const) {
    const xs = adjs.filter((a) => a.cat === cat);
    const distintos = new Set(xs.map((x) => x.v));
    if (distintos.size > 1) errores.push(`Usa un solo ${cat === "tam" ? "tamaño" : cat === "forma" ? "adjetivo de forma" : "color"}: el objeto no puede ser «${xs.map((x) => x.w).join("» y «")}» a la vez.`);
    const x = xs[0];
    if (x) {
      if (cat === "tam") rasgos.tamano = x.v as Tamano;
      if (cat === "forma") rasgos.forma = x.v as Forma;
      if (cat === "color") rasgos.color = x.v as ColorId;
    }
  }
  if (despues.length === 0) {
    const pos = (cat: Token["cat"]) => ts.findIndex((t) => t.cat === cat);
    const iT = pos("tam");
    const iF = pos("forma");
    const iC = pos("color");
    if (iT >= 0 && ((iF >= 0 && iF < iT) || (iC >= 0 && iC < iT))) {
      errores.push(`El tamaño va primero: tamaño → forma → color → objeto. Di «${nucleo(rasgos)}».`);
    } else if (iF >= 0 && iC >= 0 && iC < iF) {
      notas.push(`Se entiende (la lectura A1 usa ese orden), pero lo más común en inglés es tamaño → forma → color: «${nucleo(rasgos)}».`);
    }
  }
  const n = NOUNS[noun.v];
  if (rasgos.forma && !n.formas && !n.formaImplicita) notas.push(`Para ${n.genero === "m" ? "un" : "una"} ${n.es} la forma no hace falta: basta con el tamaño y el color.`);
  if (rasgos.tamano && n.tamanos.length > 0 && !n.tamanos.includes(rasgos.tamano)) {
    const par = n.tamanos.join(" / ");
    notas.push(`Para ${n.genero === "m" ? "un" : "una"} ${n.es} usamos ${par}.`);
  }
  return { rasgos, plural: noun.plural, palabras: toks };
}

export interface AnalisisDescripcion {
  ok: boolean;
  rasgos: Rasgos | null;
  errores: string[];
  notas: string[];
}

/** «It's a small square red lunch box.» → rasgos + errores explicados. */
export function analizaDescripcion(texto: string, permitidos: NounId[] = NOUNS_PERDIDOS): AnalisisDescripcion {
  const errores: string[] = [];
  const notas: string[] = [];
  const crudo = normalizaIngles(texto);
  if (!crudo) return { ok: false, rasgos: null, errores: ["Escribe la descripción en inglés."], notas };
  if (/(^| )(its|thats|theres)( |$)/.test(crudo)) notas.push("Recuerda el apóstrofo: «it's» = «it is».");
  let s = expande(crudo);
  let conPrefijo = false;
  for (const p of ["it is", "this is", "that is", "i have lost", "i lost", "i am looking for", "i need", "here is"]) {
    if (s === p || s.startsWith(`${p} `)) {
      s = s.slice(p.length).trim();
      conPrefijo = true;
      break;
    }
  }
  if (!conPrefijo) notas.push("Para describir usa la oración completa: «It's a …».");
  const toks = s.split(" ").filter(Boolean);
  const art = toks[0];
  let resto = toks;
  if (art === "a" || art === "an" || art === "my" || art === "the" || art === "one") {
    resto = toks.slice(1);
    const sig = resto[0];
    if ((art === "a" || art === "an") && sig) {
      const debe = articuloIndef(sig);
      if (debe !== art) {
        errores.push(debe === "an" ? `Antes de un sonido vocal se usa «an»: «an ${sig}…».` : `Antes de un sonido consonante se usa «a»: «a ${sig}…».`);
      }
    }
  } else {
    errores.push("Falta el artículo antes de la descripción: «It's a small red ball» (a, o an antes de vocal).");
  }
  if (resto.includes("is") || resto.includes("are")) {
    errores.push("Describe el objeto en una sola frase, con los adjetivos antes del objeto: «It's a big purple backpack» (en lugar de «The backpack is big and purple»).");
    const sust = tablaSustantivos(permitidos);
    const sinVerbo = resto.filter((w) => w !== "is" && w !== "are" && w !== "and");
    resto = [...sinVerbo.filter((w) => !sust[w]), ...sinVerbo.filter((w) => sust[w])];
  }
  const g = analizaGrupo(resto, permitidos, errores, notas);
  if (g.plural && g.rasgos) errores.push(`Es un solo objeto: usa el singular («${NOUNS[g.rasgos.noun].en}», no «${NOUNS[g.rasgos.noun].plural}»).`);
  return { ok: errores.length === 0 && g.rasgos !== null, rasgos: g.rasgos, errores, notas };
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. ARRANGE THE ROOM — la recámara
 * ════════════════════════════════════════════════════════════════════════ */

export type SpotId = "bedOn" | "bedUnder" | "deskOn" | "deskUnder" | "boxIn" | "shelfOn" | "shelfFront" | "between" | "doorNext" | "rug";

export const SPOTS: { id: SpotId; en: string; es: string; prep: string }[] = [
  { id: "bedOn", en: "on the bed", es: "sobre la cama", prep: "on" },
  { id: "bedUnder", en: "under the bed", es: "debajo de la cama", prep: "under" },
  { id: "deskOn", en: "on the desk", es: "sobre el escritorio", prep: "on" },
  { id: "deskUnder", en: "under the desk", es: "debajo del escritorio", prep: "under" },
  { id: "boxIn", en: "in the box", es: "dentro de la caja", prep: "in" },
  { id: "shelfOn", en: "on the shelf", es: "sobre el estante", prep: "on" },
  { id: "shelfFront", en: "in front of the shelf", es: "enfrente del estante", prep: "in front of" },
  { id: "between", en: "between the bed and the desk", es: "entre la cama y el escritorio", prep: "between" },
  { id: "doorNext", en: "next to the door", es: "junto a la puerta", prep: "next to" },
  { id: "rug", en: "on the rug", es: "sobre el tapete", prep: "on" },
];
/** Lugares con marcador numerado (el tapete es donde empiezan los objetos). */
export const SPOTS_MARCADOS: SpotId[] = ["bedOn", "bedUnder", "deskOn", "deskUnder", "boxIn", "shelfOn", "shelfFront", "between", "doorNext"];
export const spot = (id: SpotId) => SPOTS.find((s) => s.id === id)!;

export const REGLA_PREP: Record<string, string> = {
  on: "«on» = sobre una superficie (on the desk).",
  under: "«under» = debajo de algo (under the bed).",
  in: "«in» = dentro de algo (in the box).",
  "in front of": "«in front of» = enfrente, delante de algo (in front of the shelf).",
  between: "«between» = entre dos cosas (between the bed and the desk).",
  "next to": "«next to» = junto a, al lado de algo (next to the door).",
};

export type MovibleId = "ballSmall" | "ballBig" | "lamp" | "books" | "shoes" | "backpack";
export const MOVIBLES: MovibleId[] = ["ballSmall", "ballBig", "lamp", "books", "shoes", "backpack"];

export const MOVIBLE_DEF: Record<MovibleId, { noun: NounId; unidades: number; tamano?: Tamano; color: ColorId; es: string }> = {
  ballSmall: { noun: "ball", unidades: 1, tamano: "small", color: "red", es: "la pelota pequeña y roja" },
  ballBig: { noun: "ball", unidades: 1, tamano: "big", color: "blue", es: "la pelota grande y azul" },
  lamp: { noun: "lamp", unidades: 1, color: "green", es: "la lámpara verde" },
  books: { noun: "book", unidades: 2, color: "yellow", es: "los libros amarillos" },
  shoes: { noun: "shoe", unidades: 2, color: "black", es: "los zapatos negros" },
  backpack: { noun: "backpack", unidades: 1, color: "purple", es: "la mochila morada" },
};

export const nombreMovible = (m: MovibleId) => {
  const d = MOVIBLE_DEF[m];
  return nucleo({ noun: d.noun, tamano: d.tamano, color: d.color }, d.unidades > 1);
};

/** Lugares donde tiene sentido pedir cada objeto. */
export const COMPATIBLE: Record<MovibleId, SpotId[]> = {
  ballSmall: ["bedUnder", "boxIn", "shelfOn", "deskUnder", "bedOn"],
  ballBig: ["boxIn", "deskUnder", "between", "shelfFront", "bedOn"],
  lamp: ["deskOn", "shelfOn", "between", "doorNext"],
  books: ["shelfOn", "deskOn", "bedOn", "boxIn"],
  shoes: ["bedUnder", "doorNext", "between", "shelfFront", "deskUnder"],
  backpack: ["doorNext", "bedOn", "deskUnder", "shelfFront", "between"],
};

export interface Instruccion {
  obj: MovibleId;
  spot: SpotId;
}
export const PASOS_ACOMODAR = 5;

/** Cinco instrucciones con objetos distintos y lugares distintos. */
export function generaInstrucciones(rnd: () => number): Instruccion[] {
  for (let intento = 0; intento < 200; intento++) {
    const objs = baraja(MOVIBLES, rnd).slice(0, PASOS_ACOMODAR);
    const usados = new Set<SpotId>();
    const out: Instruccion[] = [];
    for (const obj of objs) {
      const libres = COMPATIBLE[obj].filter((s) => !usados.has(s));
      if (libres.length === 0) break;
      const s = elige(libres, rnd);
      usados.add(s);
      out.push({ obj, spot: s });
    }
    if (out.length === PASOS_ACOMODAR) return out;
  }
  return [
    { obj: "ballSmall", spot: "bedUnder" },
    { obj: "books", spot: "shelfOn" },
    { obj: "lamp", spot: "deskOn" },
    { obj: "backpack", spot: "doorNext" },
    { obj: "ballBig", spot: "boxIn" },
  ];
}

export const instruccionEn = (i: Instruccion) => `Put the ${nombreMovible(i.obj)} ${spot(i.spot).en}.`;
export const confirmacionEn = (i: Instruccion) => {
  const d = MOVIBLE_DEF[i.obj];
  const s = nombreMovible(i.obj);
  return `Great! The ${s} ${d.unidades > 1 ? "are" : "is"} ${spot(i.spot).en}.`;
};

/* ── «There is / There are» ───────────────────────────────────────────── */

export interface FraseHay {
  verbo: "is" | "are";
  /** Número explícito (a/an/one = 1, two = 2…) o null («There are books…»). */
  cantidad: number | null;
  rasgos: Rasgos;
  plural: boolean;
  spot: SpotId;
}

export interface AnalisisHay {
  ok: boolean;
  frase: FraseHay | null;
  errores: string[];
  notas: string[];
}

const NOUNS_CUARTO: NounId[] = ["ball", "lamp", "book", "shoe", "backpack"];
const REFS: Record<string, string> = { bed: "la cama", desk: "el escritorio", box: "la caja", shelf: "el estante", door: "la puerta", rug: "el tapete", window: "la ventana", chair: "la silla", carpet: "el tapete" };

function lugarDe(toks: string[], errores: string[]): SpotId | null {
  const s = toks.join(" ").replace(/_/g, " ");
  const prep = toks[0]?.replace(/_/g, " ");
  if (!prep) {
    errores.push("Falta decir DÓNDE está: termina con un lugar, por ejemplo «on the desk».");
    return null;
  }
  const directo = SPOTS.find((x) => x.en === s);
  if (directo) return directo.id;
  if (s === "between the desk and the bed") return "between";
  if (s === "on the carpet") return "rug";
  if (/^(near|beside|by) the door$/.test(s)) return "doorNext";
  const PREPS = ["on", "under", "in", "in front of", "between", "next to", "near", "beside", "by", "behind", "above"];
  if (!PREPS.includes(prep)) {
    errores.push(`Después del objeto va una preposición de lugar (on, in, under, next to, between, in front of). ${ESPANOL[prep] ? `«${prep}» está en español: en inglés es «${ESPANOL[prep]}».` : `No reconozco «${prep}».`}`);
    return null;
  }
  const art = toks[1];
  const ref = toks[2];
  if (art !== "the") {
    errores.push(`Usa «the» antes del lugar: «${prep} the ${art ?? "desk"}».`);
    return null;
  }
  if (!ref || !REFS[ref]) {
    errores.push(`No hay «${toks.slice(2).join(" ")}» en este cuarto: los lugares son la cama (bed), el escritorio (desk), la caja (box), el estante (shelf), la puerta (door) y el tapete (rug).`);
    return null;
  }
  if (prep === "between") {
    errores.push("«between» necesita DOS cosas: «between the bed and the desk».");
    return null;
  }
  const sugerencias: Record<string, string> = {
    bed: "Con la cama usa «on the bed» (sobre) o «under the bed» (debajo).",
    desk: "Con el escritorio usa «on the desk» (sobre) o «under the desk» (debajo).",
    box: "La caja está abierta: los objetos van «in the box» (dentro).",
    shelf: "Con el estante usa «on the shelf» (sobre) o «in front of the shelf» (enfrente).",
    door: "Junto a la puerta se dice «next to the door».",
    rug: "Sobre el tapete se dice «on the rug».",
  };
  errores.push(`«${s}» no es un lugar de este cuarto. ${sugerencias[ref] ?? "Elige un lugar de la recámara."} ${REGLA_PREP[prep === "near" || prep === "beside" || prep === "by" ? "next to" : prep] ?? ""}`.trim());
  return null;
}

/** «There are two yellow books on the shelf.» */
export function analizaHay(texto: string): AnalisisHay {
  const errores: string[] = [];
  const notas: string[] = [];
  const crudo = normalizaIngles(texto);
  if (!crudo) return { ok: false, frase: null, errores: ["Arma o escribe una oración que empiece con «There is» o «There are»."], notas };
  if (/(^| )theres( |$)/.test(crudo)) notas.push("Recuerda el apóstrofo: «there's» = «there is».");
  const s = expande(crudo);
  if (s === "there is" || s === "there are") {
    errores.push("Completa la oración: di QUÉ hay y DÓNDE, por ejemplo «There is a lamp on the desk».");
    return { ok: false, frase: null, errores, notas };
  }
  const m = s.match(/^there (is|are) (.*)$/);
  if (!m) {
    errores.push("Para decir que algo HAY en un lugar, empieza con «There is» (singular) o «There are» (plural).");
    return { ok: false, frase: null, errores, notas };
  }
  const verbo = m[1] as "is" | "are";
  let toks = m[2]!.split(" ");
  const CANT: Record<string, number> = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, some: 0 };
  let cantidad: number | null = null;
  const q = toks[0]!;
  if (q in CANT) {
    cantidad = CANT[q]! === 0 ? null : CANT[q]!;
    toks = toks.slice(1);
  }
  // Grupo nominal: hasta la primera preposición.
  const PREP_INI = new Set(["on", "under", "in", "in_front_of", "between", "next_to", "near", "beside", "by", "behind", "above", "sobre", "debajo", "dentro", "junto", "entre"]);
  const iPrep = toks.findIndex((w) => PREP_INI.has(w));
  const grupo = iPrep >= 0 ? toks.slice(0, iPrep) : toks;
  const lugarToks = iPrep >= 0 ? toks.slice(iPrep) : [];
  const g = analizaGrupo(grupo, NOUNS_CUARTO, errores, notas);
  if (q === "a" || q === "an") {
    const sig = grupo[0];
    if (sig && articuloIndef(sig) !== q) errores.push(articuloIndef(sig) === "an" ? `Antes de un sonido vocal se usa «an»: «an ${sig}».` : `Antes de un sonido consonante se usa «a»: «a ${sig}».`);
  }
  if (g.rasgos) {
    const n = NOUNS[g.rasgos.noun];
    if (verbo === "is" && g.plural) errores.push(`«There is» va con singular. Con varios objetos usa «There are»: «There are two ${nucleo(g.rasgos, true)}».`);
    if (verbo === "are" && !g.plural) errores.push(`«There are» va con plural. Con un solo objeto usa «There is»: «There is ${conArticulo(g.rasgos)}».`);
    if (verbo === "is" && cantidad === null && !g.plural) errores.push(`Falta el artículo: «There is ${conArticulo(g.rasgos)}».`);
    if (cantidad !== null && cantidad > 1 && !g.plural) errores.push(`Con «${q}» el sustantivo va en plural: «${q} ${n.plural}».`);
    if (cantidad === 1 && g.plural) errores.push(`Con «${q}» el sustantivo va en singular: «${q} ${n.en}».`);
  }
  const lugar = lugarToks.length ? lugarDe(lugarToks, errores) : (errores.push("Falta decir DÓNDE está: termina con un lugar, por ejemplo «on the desk»."), null);
  if (!g.rasgos || !lugar || errores.length > 0) return { ok: false, frase: null, errores, notas };
  return { ok: true, frase: { verbo, cantidad, rasgos: g.rasgos, plural: g.plural, spot: lugar }, errores, notas };
}

/** ¿Es verdad en el cuarto? Devuelve null si sí, o la explicación si no. */
export function verificaHay(f: FraseHay, ubic: Record<MovibleId, SpotId>): string | null {
  const candidatos = MOVIBLES.filter((m) => {
    const d = MOVIBLE_DEF[m];
    if (d.noun !== f.rasgos.noun) return false;
    if (f.rasgos.color && f.rasgos.color !== d.color) return false;
    if (f.rasgos.tamano && d.tamano && f.rasgos.tamano !== d.tamano) return false;
    return true;
  });
  const n = NOUNS[f.rasgos.noun];
  if (candidatos.length === 0) {
    return `En este cuarto no hay ${n.genero === "m" ? "ningún" : "ninguna"} ${n.es} así (${nucleo(f.rasgos)}). Mira los colores y tamaños de los objetos.`;
  }
  const aqui = candidatos.filter((m) => ubic[m] === f.spot);
  const unidades = aqui.reduce((a, m) => a + MOVIBLE_DEF[m].unidades, 0);
  const lugarEs = spot(f.spot).es;
  if (unidades === 0) {
    const donde = candidatos.map((m) => `${MOVIBLE_DEF[m].es} ${MOVIBLE_DEF[m].unidades > 1 ? "están" : "está"} ${spot(ubic[m]).en} (${spot(ubic[m]).es})`).join("; ");
    return `No es cierto: ${lugarEs} no hay ${n.esPlural}. Ahora mismo ${donde}.`;
  }
  const plural = `There are ${NUMEROS_EN[unidades]} ${nucleo(f.rasgos, true)} ${spot(f.spot).en}`;
  const Lugar = `${lugarEs[0]!.toUpperCase()}${lugarEs.slice(1)}`;
  if (f.cantidad === 1) {
    if (aqui.some((m) => MOVIBLE_DEF[m].unidades === 1)) return null;
    return `${Lugar} hay ${NUMEROS_ES[unidades]} ${n.esPlural}, no uno: usa el plural, «${plural}».`;
  }
  if (f.cantidad !== null) {
    if (f.cantidad === unidades) return null;
    return `Casi: ${lugarEs} hay ${unidades === 1 ? "solo uno" : NUMEROS_ES[unidades]}, no ${NUMEROS_ES[f.cantidad] ?? f.cantidad}. ${unidades === 1 ? `Di «There is ${conArticulo(f.rasgos)} ${spot(f.spot).en}».` : `Di «${plural}».`}`;
  }
  if (f.plural && unidades < 2) return `${Lugar} solo hay uno: di «There is ${conArticulo(f.rasgos)} ${spot(f.spot).en}».`;
  return null;
}

/** Oración canónica para mostrar y leer en voz alta. */
export function fraseHayEn(f: FraseHay): string {
  const cantidad = f.cantidad === null ? "" : f.cantidad === 1 ? articuloIndef(nucleo(f.rasgos)) : NUMEROS_EN[f.cantidad] ?? String(f.cantidad);
  return `There ${f.verbo} ${[cantidad, nucleo(f.rasgos, f.plural)].filter(Boolean).join(" ")} ${spot(f.spot).en}.`;
}

export const FICHAS_HAY: { grupo: string; fichas: string[] }[] = [
  { grupo: "Inicio", fichas: ["There is", "There are"] },
  { grupo: "Cantidad", fichas: ["a", "an", "two"] },
  { grupo: "Rasgos", fichas: ["small", "big", "red", "blue", "green", "yellow", "black", "purple"] },
  { grupo: "Objeto", fichas: ["ball", "balls", "lamp", "book", "books", "shoes", "backpack"] },
  { grupo: "Preposición", fichas: ["on", "in", "under", "next to", "between", "in front of"] },
  { grupo: "Lugar", fichas: ["the bed", "the desk", "the box", "the shelf", "the door", "the rug", "the bed and the desk"] },
];

export const FRASES_META = 4;

/* ════════════════════════════════════════════════════════════════════════
 * ESTRELLAS — ¿tamaño, forma, color u objeto?
 * ════════════════════════════════════════════════════════════════════════ */

export type Categoria = "tamano" | "forma" | "color" | "objeto";
export const CATEGORIAS: { id: Categoria; etq: string; en: string; icono: string; color: string }[] = [
  { id: "tamano", etq: "Tamaño", en: "size", icono: "fa-up-right-and-down-left-from-center", color: "#38bdf8" },
  { id: "forma", etq: "Forma", en: "shape", icono: "fa-shapes", color: "#f472b6" },
  { id: "color", etq: "Color", en: "color", icono: "fa-palette", color: "#fbbf24" },
  { id: "objeto", etq: "Objeto", en: "object", icono: "fa-chair", color: "#34d399" },
];

/** Vocabulario de la lectura A1, con su traducción de la propia lectura. */
export const PALABRAS: { w: string; cat: Categoria; es: string }[] = [
  { w: "big", cat: "tamano", es: "grande" },
  { w: "large", cat: "tamano", es: "grande" },
  { w: "small", cat: "tamano", es: "pequeño" },
  { w: "little", cat: "tamano", es: "pequeño" },
  { w: "medium", cat: "tamano", es: "mediano" },
  { w: "long", cat: "tamano", es: "largo" },
  { w: "short", cat: "tamano", es: "corto" },
  { w: "tall", cat: "tamano", es: "alto" },
  { w: "round", cat: "forma", es: "redondo" },
  { w: "square", cat: "forma", es: "cuadrado" },
  { w: "rectangular", cat: "forma", es: "rectangular" },
  { w: "triangular", cat: "forma", es: "triangular" },
  { w: "red", cat: "color", es: "rojo" },
  { w: "blue", cat: "color", es: "azul" },
  { w: "green", cat: "color", es: "verde" },
  { w: "yellow", cat: "color", es: "amarillo" },
  { w: "white", cat: "color", es: "blanco" },
  { w: "black", cat: "color", es: "negro" },
  { w: "orange", cat: "color", es: "naranja" },
  { w: "purple", cat: "color", es: "morado" },
  { w: "desk", cat: "objeto", es: "escritorio" },
  { w: "chair", cat: "objeto", es: "silla" },
  { w: "board", cat: "objeto", es: "pizarrón" },
  { w: "window", cat: "objeto", es: "ventana" },
  { w: "door", cat: "objeto", es: "puerta" },
  { w: "pencil", cat: "objeto", es: "lápiz" },
  { w: "notebook", cat: "objeto", es: "cuaderno" },
  { w: "backpack", cat: "objeto", es: "mochila" },
  { w: "table", cat: "objeto", es: "mesa" },
  { w: "shelf", cat: "objeto", es: "estante" },
  { w: "lamp", cat: "objeto", es: "lámpara" },
];

/** Ocho palabras: dos de cada categoría, en orden al azar. */
export function rondaPalabras(rnd: () => number): number[] {
  const out: number[] = [];
  for (const c of CATEGORIAS) {
    const idx = PALABRAS.map((p, i) => (p.cat === c.id ? i : -1)).filter((i) => i >= 0);
    out.push(...baraja(idx, rnd).slice(0, 2));
  }
  return baraja(out, rnd);
}

/* ════════════════════════════════════════════════════════════════════════
 * CONTENIDO VERBATIM
 * ════════════════════════════════════════════════════════════════════════ */

export const TITULO_A1 = "What's around us? — Objetos y espacios cotidianos";

/** Lectura A1 — verbatim (4 párrafos). */
export const LECTURA_A1: string[] = [
  'Describir objetos en inglés requiere conocer vocabulario de forma, color y tamaño. En inglés, los adjetivos van ANTES del sustantivo, al revés que en español: decimos "a red book" (un libro rojo), no "a book red".',
  "Palabras de tamaño: big/large (grande), small/little (pequeño), medium (mediano), long (largo), short (corto), tall (alto — personas y edificios). Colores básicos: red (rojo), blue (azul), green (verde), yellow (amarillo), white (blanco), black (negro), orange (naranja), purple (morado). Formas: circle/round (círculo/redondo), square (cuadrado), triangle (triángulo), rectangular (rectangular).",
  'Para describir un objeto: "It is a [tamaño] [color] [forma] [objeto]." Por ejemplo: "It is a big blue rectangular table" (Es una mesa rectangular azul grande).',
  "En el hogar y la escuela, los objetos comunes en inglés son: desk (escritorio), chair (silla), board (pizarrón), window (ventana), door (puerta), pencil (lápiz), notebook (cuaderno), backpack (mochila), table (mesa), shelf (estante), lamp (lámpara).",
];

/** Nota del laboratorio (no verbatim) sobre el orden de los adjetivos. */
export const NOTA_ORDEN =
  "Nota del laboratorio: la lectura pone el color antes de la forma. Se entiende, pero las gramáticas de referencia ponen la forma antes del color: tamaño → forma → color → objeto («a big rectangular blue table»). Es el orden que usa el quiz A4 («a small square table») y el que practicas aquí.";

/** Preguntas de comprensión de la lectura A1 — verbatim. */
export const PREGUNTAS_A1: { pregunta: string; guia: string }[] = [
  { pregunta: "¿Dónde va el adjetivo en inglés respecto al sustantivo?", guia: "Antes del sustantivo: 'a red book', no 'a book red'." },
  { pregunta: "¿Cómo se dice 'una mesa cuadrada pequeña' en inglés?", guia: "A small square table." },
  { pregunta: "¿Qué significa 'backpack'?", guia: "Mochila." },
];

/** Hechos: verdadero/falso A5, con su retroalimentación — verbatim. */
export const HECHOS: { enunciado: string; verdadero: boolean; retro: string }[] = [
  { enunciado: "En inglés el adjetivo va después del sustantivo, como en español.", verdadero: false, retro: "Falso: en inglés va ANTES ('a red book')." },
  { enunciado: "'Desk' significa escritorio.", verdadero: true, retro: "Correcto." },
  { enunciado: "'There is' se usa para un objeto en singular.", verdadero: true, retro: "Sí: 'There is a chair' (singular); 'There are' para plural." },
  { enunciado: "'Big' y 'small' son colores.", verdadero: false, retro: "Son tamaños, no colores." },
];

/** Glosario A6 — verbatim. */
export const GLOSARIO: { termino: string; definicion: string; ejemplo: string; etiqueta: string }[] = [
  { termino: "desk", definicion: "Escritorio o pupitre.", ejemplo: "The teacher's desk is big.", etiqueta: "objeto" },
  { termino: "backpack", definicion: "Mochila.", ejemplo: "My backpack is blue.", etiqueta: "objeto" },
  { termino: "round / square", definicion: "Formas: redondo / cuadrado.", ejemplo: "The clock is round.", etiqueta: "forma" },
  { termino: "big / small", definicion: "Tamaños: grande / pequeño.", ejemplo: "It is a small table.", etiqueta: "tamaño" },
  { termino: "There is / There are", definicion: "Para indicar que hay algo (singular / plural).", ejemplo: "There are 30 chairs.", etiqueta: "gramática" },
  { termino: "board", definicion: "Pizarrón.", ejemplo: "The board is on the wall.", etiqueta: "objeto" },
];
export const ACTIVIDAD_A6 = "Describe 4 objetos a tu alrededor en inglés (color, tamaño o forma).";

/** Reflexión escrita A3 — verbatim. */
export const A3 = {
  prompt:
    "Describe en inglés el lugar donde estudias o donde estás en este momento (puede ser tu cuarto, aula, biblioteca, etc.). Menciona al menos 6 objetos con sus características (color, tamaño, forma). Luego escribe en español: ¿qué diferencia notaste entre cómo se describe un objeto en inglés vs en español?",
  pistas: [
    "Recuerda: en inglés el adjetivo va antes del sustantivo (big blue table)",
    "Usa: There is a... / There are... para describir lo que hay",
    "¿Qué preposiciones de lugar puedes usar? (on, near, next to, in front of)",
  ],
  criterios: [
    "Describe al menos 6 objetos con características (color, tamaño o forma)",
    "Usa correctamente el orden adjetivo-sustantivo en inglés",
    "Reflexiona sobre la diferencia estructural entre inglés y español",
    "Ortografía y vocabulario del tema",
  ],
  min: 80,
  max: 250,
};

/** Autoevaluación A7 — verbatim. */
export const A7 = {
  instrucciones: "Marca tu nivel honesto en cada criterio.",
  criterios: [
    "Conozco vocabulario de objetos del aula y del hogar.",
    "Uso colores, tamaños y formas para describir.",
    "Coloco el adjetivo antes del sustantivo correctamente.",
    "Uso 'There is/There are' para decir qué hay en un lugar.",
  ],
  escala: [
    { valor: 1, etiqueta: "En inicio", descripcion: "Todavía necesito apoyo y consultar el material." },
    { valor: 2, etiqueta: "En proceso", descripcion: "Lo logro con algunos errores o dudas." },
    { valor: 3, etiqueta: "Logrado", descripcion: "Lo hago bien de forma autónoma." },
    { valor: 4, etiqueta: "Destacado", descripcion: "Lo hago con seguridad y puedo ayudar a otra persona." },
  ],
  reflexion: "¿Qué objeto de tu día a día ya sabes nombrar y describir en inglés?",
};

/** Quiz A4 «Describing objects — Quiz» — verbatim. */
export const QUIZ_A4: QuizEvaluable = {
  titulo: "Describing objects — Quiz",
  puntajeMinimo: 70,
  reactivos: [
    { enunciado: "¿Cuál es el orden correcto en inglés?", opciones: ["a book red", "a red book", "red a book", "book a red"], respuestaCorrecta: 1, retroalimentacion: "En inglés el adjetivo va ANTES del sustantivo: 'a red book'." },
    { enunciado: "'Backpack' significa:", opciones: ["pizarrón", "mochila", "escritorio", "ventana"], respuestaCorrecta: 1, retroalimentacion: "'Backpack' = mochila." },
    {
      enunciado: "¿Cómo dices 'una mesa cuadrada pequeña'?",
      opciones: ["a square small table", "a small square table", "a table small square", "small a square table"],
      respuestaCorrecta: 1,
      retroalimentacion: "Orden: tamaño + forma + sustantivo → 'a small square table'.",
    },
    { enunciado: "¿Cuál es un color?", opciones: ["round", "big", "purple", "short"], respuestaCorrecta: 2, retroalimentacion: "'Purple' (morado) es color; los otros son forma o tamaño." },
    { enunciado: "'The clock is round.' La palabra 'round' indica:", opciones: ["color", "tamaño", "forma", "material"], respuestaCorrecta: 2, retroalimentacion: "'Round' (redondo) es una forma." },
  ],
};

/** Actividad A2 «Describe it!» — verbatim (el texto partido por sus 8 huecos). */
export const HUECOS_A2: TextoHuecosData = {
  ancla: "IN-I-P03-A2 · Describe it!",
  instrucciones: "Describe los objetos completando las oraciones con las palabras del cuadro: big / small / red / blue / round / square / on / near",
  partes: [
    "In my classroom there is a ",
    " green board ",
    " the wall. The teacher has a ",
    " brown desk. There are 30 ",
    " yellow chairs. The clock is ",
    " and white. It is ",
    " the board. The library is ",
    " the school — it is a ",
    " yellow building.",
  ],
  huecos: [
    { respuesta: "big", alternativas: ["large"], pista: "Tamaño grande" },
    { respuesta: "on", alternativas: [], pista: "___ the wall (sobre/en)" },
    { respuesta: "big", alternativas: ["large"], pista: "El escritorio es grande" },
    { respuesta: "small", alternativas: ["little"], pista: "Sillas pequeñas" },
    { respuesta: "round", alternativas: [], pista: "El reloj es _____ (forma)" },
    { respuesta: "near", alternativas: ["next to"], pista: "Cerca del pizarrón" },
    { respuesta: "near", alternativas: ["next to"], pista: "La biblioteca está ___ la escuela" },
    { respuesta: "big", alternativas: ["large"], pista: "Un edificio grande" },
  ],
};

export const FUENTE = "CEN Bachillerato — Inglés I, progresión 3: lectura A1 (Material elaborado para CEN Bachillerato), actividades A2, A3, A4, A5, A6 y A7.";

export const PROBLEMA =
  "¿Puedes decir en inglés cómo es algo y dónde está? En este laboratorio lees instrucciones para encontrar objetos en un aula, describes tus cosas perdidas con tamaño, forma y color para que el encargado las encuentre y acomodas una recámara siguiendo instrucciones con preposiciones de lugar.";

export const INSTRUCCIONES: string[] = [
  "En Find it, lee la instrucción en inglés y haz clic en el objeto del aula que corresponde. Los distractores cambian en un solo rasgo: lee todos los adjetivos.",
  "En Lost and found, mira cuál es tu objeto (la flecha) y escribe su descripción en inglés: «It's a big round red …». El encargado busca lo que escribiste.",
  "En Arrange the room, sigue las instrucciones: elige un objeto y luego el lugar numerado. Después arma oraciones con There is / There are que el cuarto confirme.",
  "Clasifica palabras en «Size, shape or color?» para ganar estrellas y resuelve el quiz A4 y el texto A2.",
];

export const IDEAS: string[] = [
  "En inglés el adjetivo va antes del sustantivo: «a red book», no «a book red».",
  "Orden más común: tamaño → forma → color → objeto: «a small round blue clock».",
  "Los adjetivos en inglés no cambian con el género ni el número: «a red ball», «two red balls».",
  "«a» antes de sonido consonante, «an» antes de sonido vocal: «an orange box».",
  "«There is» + singular («There is a lamp»); «There are» + plural («There are two books»).",
  "on = sobre · in = dentro · under = debajo · next to = junto a · between = entre · in front of = enfrente.",
];

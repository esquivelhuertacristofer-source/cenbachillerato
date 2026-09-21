/**
 * Datos y modelo del laboratorio "Where and when? — la terminal de autobuses"
 * (IN-I-P05, Inglés I: «Hace preguntas sencillas para obtener información
 * general (ubicación, horarios)»).
 *
 * Anclas VERBATIM:
 *   - A1 lectura «Where and when? — Preguntas sencillas en inglés»: marco
 *     teórico y preguntas de comprensión con su respuesta guía. (Su recuadro
 *     «Sabías que» habla de desarrolladores de software: es de otra
 *     asignatura y no se incluye.)
 *   - A2 fill_blanks «Ask the right question»: CompletaTexto (con UNA
 *     adaptación declarada: «___ time is it? — It is at 2:30 pm» no es inglés
 *     correcto; aquí dice «___ time is the exam? — It is at 2:30 pm»).
 *   - A4 quiz «Where & when? — Quiz» + preguntas del video A8: reto evaluable.
 *   - A5 verdadero/falso: hechos. A6 glosario. A3 escritura. A7 autoevaluación.
 *   - A9 (relacionar) repite el glosario A6: inspira la tarjeta «¿Qué se
 *     preguntó?», que empareja respuestas con palabras interrogativas.
 *
 * Lo que NO es verbatim: la terminal «Central Valle Verde» es FICTICIA; los
 * destinos son ciudades reales, pero horarios, andenes, precios y servicios son
 * ILUSTRATIVOS (precios del orden de un boleto de primera clase desde la Ciudad
 * de México en 2025; duraciones aproximadas por carretera). Personas ficticias.
 * Todas las oraciones en inglés que no vienen de la BD son del laboratorio y
 * siguen el inglés estadounidense estándar (por eso el tablero dice
 * «Canceled», con una sola l).
 *
 * Datos puros (sin three ni React).
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { TextoHuecosData } from "./_mecanica-huecos";

/* ── Modos ────────────────────────────────────────────────────────────── */

export type Modo = "preguntar" | "tablero" | "informacion";
export const MODOS: Modo[] = ["preguntar", "tablero", "informacion"];

export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string }> = {
  preguntar: { etq: "Ask the right question", subtitulo: "Escribe la pregunta y consigue el dato", icono: "fa-circle-question", color: "#38bdf8" },
  tablero: { etq: "Read the board", subtitulo: "Responde a viajeros leyendo el tablero en vivo", icono: "fa-table-list", color: "#f59e0b" },
  informacion: { etq: "Info desk", subtitulo: "Tú atiendes el módulo de información", icono: "fa-circle-info", color: "#a78bfa" },
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

export function barajar<T>(xs: T[], rnd: () => number): T[] {
  const out = [...xs];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

export function estrellasPorErrores(errores: number): number {
  return errores === 0 ? 3 : errores <= 2 ? 2 : 1;
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. NORMALIZACIÓN, NÚMEROS Y HORAS
 * ════════════════════════════════════════════════════════════════════════ */

/** Minúsculas, sin acentos ni puntuación, contracciones expandidas. */
export function normalizaEn(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/(\d{1,2})\.(\d{2})\b/g, "$1:$2")
    .replace(/(\d)\s*([ap])\.?\s?m\b\.?/g, "$1 $2m")
    .replace(/\bwhere's\b|\bwheres\b/g, "where is")
    .replace(/\bwhat's\b|\bwhats\b/g, "what is")
    .replace(/\bwhen's\b/g, "when is")
    .replace(/\bit's\b|\bits\b/g, "it is")
    .replace(/\bthey're\b|\btheyre\b/g, "they are")
    .replace(/\bthere's\b|\btheres\b/g, "there is")
    .replace(/\bisn't\b|\bisnt\b/g, "is not")
    .replace(/\baren't\b|\barent\b/g, "are not")
    .replace(/\bdoesn't\b|\bdoesnt\b/g, "does not")
    .replace(/\bdon't\b|\bdont\b/g, "do not")
    .replace(/\bi'm\b/g, "i am")
    .replace(/\bthat's\b/g, "that is")
    .replace(/\bo'clock\b|\bo clock\b|\boclock\b/g, "oclock")
    .replace(/\bcancelled\b/g, "canceled")
    .replace(/-/g, " ")
    .replace(/[.,;:!?¡¿"()](?!\d)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const NUM_W: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
};

/** Números escritos con cifras o con palabras («one hundred sixty», «a hundred and sixty», «$160»). */
export function numerosEn(s: string): number[] {
  const out: number[] = [];
  const toks = s.split(" ");
  let total = -1;
  let parte = 0;
  const cerrar = () => {
    if (total >= 0) out.push(total + parte);
    total = -1;
    parte = 0;
  };
  for (let i = 0; i < toks.length; i++) {
    const w = toks[i]!;
    if (/^\$?\d+(,\d{3})*(\.\d+)?$/.test(w)) {
      cerrar();
      out.push(Number(w.replace(/[$,]/g, "")));
      continue;
    }
    if (w in NUM_W) {
      const v = NUM_W[w]!;
      if (total < 0) {
        total = 0;
        parte = v;
      } else if (parte === 0) parte = v;
      else if (v < 10 && parte >= 20 && parte % 10 === 0) parte += v;
      else {
        cerrar();
        total = 0;
        parte = v;
      }
      continue;
    }
    if (w === "a" && toks[i + 1] === "hundred") {
      cerrar();
      total = 0;
      parte = 1;
      continue;
    }
    if (w === "hundred" && total >= 0) {
      total += (parte || 1) * 100;
      parte = 0;
      continue;
    }
    if (w === "thousand" && total >= 0) {
      total = (total + (parte || 1)) * 1000;
      parte = 0;
      continue;
    }
    if (w === "and" && total >= 0 && (toks[i + 1] ?? "") in NUM_W) continue;
    cerrar();
  }
  cerrar();
  return out;
}

const HORA_W = "(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)";

/** Horas mencionadas (minutos desde medianoche; en reloj de 12 h se compara con mismaHora). */
export function horasEn(s: string): number[] {
  const out: number[] = [];
  let m: RegExpExecArray | null;
  const reD = /\b(\d{1,2}):(\d{2})(?: ([ap])m)?/g;
  while ((m = reD.exec(s))) {
    let h = Number(m[1]);
    if (m[3] === "p" && h < 12) h += 12;
    out.push(h * 60 + Number(m[2]));
  }
  const reH = /(^|[^:\d])(\d{1,2}) (?:([ap])m|oclock)\b/g;
  while ((m = reH.exec(s))) {
    let h = Number(m[2]);
    if (m[3] === "p" && h < 12) h += 12;
    out.push(h * 60);
  }
  const reHalf = new RegExp(String.raw`\b(half|quarter) (past|to) ${HORA_W}\b`, "g");
  while ((m = reHalf.exec(s))) {
    const h = NUM_W[m[3]!]!;
    out.push(m[1] === "half" ? h * 60 + 30 : m[2] === "past" ? h * 60 + 15 : h * 60 - 15);
  }
  const reWo = new RegExp(String.raw`\b${HORA_W} oclock\b`, "g");
  while ((m = reWo.exec(s))) out.push(NUM_W[m[1]!]! * 60);
  const reWm = new RegExp(String.raw`\b${HORA_W} ((?:twenty|thirty|forty|fifty)(?: (?:one|two|three|four|five|six|seven|eight|nine))?|oh (?:one|two|three|four|five|six|seven|eight|nine)|ten|fifteen|eleven|twelve|thirteen|fourteen|sixteen|seventeen|eighteen|nineteen)\b`, "g");
  while ((m = reWm.exec(s))) {
    const mins = numerosEn(m[2]!.replace(/^oh /, ""))[0];
    if (mins !== undefined && mins < 60) out.push(NUM_W[m[1]!]! * 60 + mins);
  }
  if (/\bnoon\b/.test(s)) out.push(12 * 60);
  if (/\bmidnight\b/.test(s)) out.push(0);
  return out;
}

export const mismaHora = (a: number, b: number) => ((a % 720) + 720) % 720 === ((b % 720) + 720) % 720;

/** «11:40» en 24 h, como en los tableros de México. */
export function fmtHora(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
}

/** «10:00 p.m.» para los horarios de servicios. */
export function fmt12(min: number): string {
  const h24 = Math.floor(min / 60) % 24;
  const m = min % 60;
  const suf = h24 < 12 ? "a.m." : "p.m.";
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${String(m).padStart(2, "0")} ${suf}`;
}

/** Duración en minutos: «about three hours», «an hour and a half», «6 hours 30 minutes». */
export function duracionMin(s: string): number | null {
  const t = s.split(" ");
  let total = 0;
  let hay = false;
  for (let i = 0; i < t.length; i++) {
    const w = t[i]!;
    if (w === "hour" || w === "hours") {
      let j = i - 1;
      let extra = 0;
      if (t[j] === "half" && t[j - 1] === "a" && t[j - 2] === "and") {
        extra = 30;
        j -= 3;
      }
      const prev = t[j];
      let n: number | null = null;
      if (prev === "an" || prev === "a") n = 1;
      else if (prev && /^\d+(\.\d+)?$/.test(prev)) n = Number(prev);
      else if (prev && prev in NUM_W) n = NUM_W[prev]!;
      if (n !== null && !(prev === "an" && t[j - 1] === "half")) {
        total += n * 60 + extra;
        hay = true;
      }
      if (t[i + 1] === "and" && t[i + 2] === "a" && t[i + 3] === "half") total += 30;
    }
    if (w === "minute" || w === "minutes") {
      const nums = numerosEn(t.slice(Math.max(0, i - 2), i).join(" "));
      const n = nums[nums.length - 1];
      if (n !== undefined) {
        total += n;
        hay = true;
      }
    }
  }
  if (!hay && /\bhalf an hour\b/.test(s)) return 30;
  return hay ? Math.round(total) : null;
}

const ES_DELATORES = /\b(donde|esta|estan|cuando|hora|cuanto|cuesta|boleto|autobus|camion|bano|banos|sale|llega|hay|cerca|abre|cierra|anden|precio|viaje|dura|si hay|junto|lado|enfrente|detras|lunes|viernes|pesos mexicanos|horas y media)\b/;
export const pareceEspanol = (s: string) => ES_DELATORES.test(s) && !/\b(the|is|are|does|what|where|how|it|there|they)\b/.test(s);

/* ════════════════════════════════════════════════════════════════════════
 * 2. LA TERMINAL (ficticia): lugares, relaciones y rutas
 * ════════════════════════════════════════════════════════════════════════ */

export const NOMBRE_TERMINAL = "Central Valle Verde";

export type LugarId = "tickets" | "atm" | "pharmacy" | "lostfound" | "cafe" | "restrooms" | "luggage" | "exit" | "info" | "waiting" | "gates" | "entrance";

export interface Lugar {
  id: LugarId;
  /** Nombre en inglés, singular y plural (con artículo se arma aparte). */
  en: string;
  enPl: string;
  /** El nombre usual es plural (restrooms). */
  plural: boolean;
  es: string;
  /** «un cajero automático», «baños»: para decir «si hay …». */
  esUn: string;
  icono: string;
  color: string;
  /** Lado de la sala: izq (x < 0), der (x > 0) o centro. */
  lado: "izq" | "der" | "centro";
  x: number;
  z: number;
  ancho: number;
  /** Aparece como local con letrero. */
  local: boolean;
}

export const LUGARES: Lugar[] = [
  { id: "tickets", esUn: "taquillas", en: "ticket office", enPl: "ticket offices", plural: false, es: "las taquillas", icono: "fa-ticket", color: "#f59e0b", lado: "izq", x: -11.2, z: -2.3, ancho: 3.8, local: true },
  { id: "atm", esUn: "un cajero automático", en: "ATM", enPl: "ATMs", plural: false, es: "el cajero automático", icono: "fa-money-bill-wave", color: "#22c55e", lado: "izq", x: -11.2, z: 0.45, ancho: 1.3, local: true },
  { id: "pharmacy", esUn: "una farmacia", en: "pharmacy", enPl: "pharmacies", plural: false, es: "la farmacia", icono: "fa-prescription-bottle-medical", color: "#10b981", lado: "izq", x: -11.2, z: 2.75, ancho: 2.9, local: true },
  { id: "lostfound", esUn: "una oficina de objetos perdidos", en: "lost and found office", enPl: "lost and found offices", plural: false, es: "la oficina de objetos perdidos", icono: "fa-box-open", color: "#a78bfa", lado: "izq", x: -11.2, z: 5.6, ancho: 2.5, local: true },
  { id: "cafe", esUn: "una cafetería", en: "café", enPl: "cafés", plural: false, es: "la cafetería", icono: "fa-mug-hot", color: "#f97316", lado: "der", x: 11.2, z: -2.3, ancho: 3.8, local: true },
  { id: "restrooms", esUn: "baños", en: "restroom", enPl: "restrooms", plural: true, es: "los baños", icono: "fa-restroom", color: "#38bdf8", lado: "der", x: 11.2, z: 0.55, ancho: 2.3, local: true },
  { id: "luggage", esUn: "lockers para equipaje", en: "luggage storage", enPl: "lockers", plural: false, es: "el guardaequipaje (lockers)", icono: "fa-suitcase-rolling", color: "#eab308", lado: "der", x: 11.2, z: 3.05, ancho: 2.7, local: true },
  { id: "exit", esUn: "una salida a los taxis", en: "exit to the taxis", enPl: "exits", plural: false, es: "la salida a los taxis", icono: "fa-taxi", color: "#facc15", lado: "der", x: 11.2, z: 5.7, ancho: 2.1, local: true },
  { id: "info", esUn: "un módulo de información", en: "information desk", enPl: "information desks", plural: false, es: "el módulo de información", icono: "fa-circle-info", color: "#60a5fa", lado: "centro", x: 0, z: 4.6, ancho: 3.4, local: false },
  { id: "waiting", esUn: "una sala de espera", en: "waiting area", enPl: "waiting areas", plural: false, es: "la sala de espera", icono: "fa-couch", color: "#94a3b8", lado: "centro", x: 0, z: -1.5, ancho: 10, local: false },
  { id: "gates", esUn: "andenes", en: "gate", enPl: "gates", plural: true, es: "los andenes (gates)", icono: "fa-door-open", color: "#cbd5e1", lado: "centro", x: 0, z: -6.9, ancho: 22, local: false },
  { id: "entrance", esUn: "una entrada", en: "main entrance", enPl: "entrances", plural: false, es: "la entrada principal", icono: "fa-door-closed", color: "#cbd5e1", lado: "centro", x: 0, z: 8, ancho: 3.6, local: false },
];

export const lugar = (id: LugarId) => LUGARES.find((l) => l.id === id)!;

/** «the restrooms», «the ATM», «the café». */
export function conArticulo(id: LugarId, plural = lugar(id).plural): string {
  const l = lugar(id);
  return `the ${plural ? l.enPl : l.en}`;
}

export type Prep = "next" | "near" | "between" | "across" | "front" | "behind";
export const PREP_EN: Record<Prep, string> = { next: "next to", near: "near", between: "between", across: "across from", front: "in front of", behind: "behind" };
export const PREP_ES: Record<Prep, string> = { next: "al lado de", near: "cerca de", between: "entre", across: "enfrente de, del otro lado del pasillo", front: "enfrente de (delante)", behind: "detrás de" };

export interface Relacion {
  prep: Prep;
  refs: LugarId[];
}

/** Relaciones VERDADERAS en el plano de la terminal (cada lado de la sala es una fila de locales). */
export const RELACIONES: Record<LugarId, Relacion[]> = {
  tickets: [
    { prep: "next", refs: ["atm"] },
    { prep: "across", refs: ["cafe"] },
    { prep: "near", refs: ["gates"] },
  ],
  atm: [
    { prep: "next", refs: ["tickets"] },
    { prep: "next", refs: ["pharmacy"] },
    { prep: "between", refs: ["tickets", "pharmacy"] },
    { prep: "across", refs: ["restrooms"] },
  ],
  pharmacy: [
    { prep: "next", refs: ["atm"] },
    { prep: "next", refs: ["lostfound"] },
    { prep: "between", refs: ["atm", "lostfound"] },
    { prep: "across", refs: ["luggage"] },
  ],
  lostfound: [
    { prep: "next", refs: ["pharmacy"] },
    { prep: "near", refs: ["entrance"] },
    { prep: "across", refs: ["exit"] },
  ],
  cafe: [
    { prep: "next", refs: ["restrooms"] },
    { prep: "across", refs: ["tickets"] },
    { prep: "near", refs: ["gates"] },
  ],
  restrooms: [
    { prep: "next", refs: ["cafe"] },
    { prep: "next", refs: ["luggage"] },
    { prep: "between", refs: ["cafe", "luggage"] },
    { prep: "across", refs: ["atm"] },
  ],
  luggage: [
    { prep: "next", refs: ["restrooms"] },
    { prep: "next", refs: ["exit"] },
    { prep: "between", refs: ["restrooms", "exit"] },
    { prep: "across", refs: ["pharmacy"] },
  ],
  exit: [
    { prep: "next", refs: ["luggage"] },
    { prep: "near", refs: ["entrance"] },
    { prep: "across", refs: ["lostfound"] },
  ],
  info: [
    { prep: "front", refs: ["entrance"] },
    { prep: "near", refs: ["entrance"] },
    { prep: "front", refs: ["waiting"] },
  ],
  waiting: [
    { prep: "behind", refs: ["info"] },
    { prep: "front", refs: ["gates"] },
    { prep: "between", refs: ["tickets", "cafe"] },
  ],
  gates: [{ prep: "behind", refs: ["waiting"] }],
  entrance: [{ prep: "near", refs: ["info"] }],
};

export function relacionVerdadera(id: LugarId, prep: Prep, refs: LugarId[]): boolean {
  const rs = RELACIONES[id];
  if (refs.length === 0) return false;
  if (prep === "between") {
    if (refs.length < 2) return false;
    const [a, b] = refs;
    return rs.some((r) => r.prep === "between" && r.refs.includes(a!) && r.refs.includes(b!) && a !== b);
  }
  const ref = refs[0]!;
  if (prep === "near") return rs.some((r) => (r.prep === "near" || r.prep === "next" || r.prep === "between") && r.refs.includes(ref));
  return rs.some((r) => r.prep === prep && r.refs[0] === ref);
}

/** Frase verdadera en inglés: «next to the café and the luggage storage». */
export function ubicacionEn(id: LugarId): string {
  const rs = RELACIONES[id];
  const entre = rs.find((r) => r.prep === "between");
  const frente = rs.find((r) => r.prep === "across");
  const partes: string[] = [];
  if (entre) partes.push(`between ${conArticulo(entre.refs[0]!)} and ${conArticulo(entre.refs[1]!)}`);
  else {
    const next = rs.find((r) => r.prep === "next" || r.prep === "front");
    if (next) partes.push(`${PREP_EN[next.prep]} ${conArticulo(next.refs[0]!)}`);
  }
  if (frente) partes.push(`across from ${conArticulo(frente.refs[0]!)}`);
  return partes.join(", ");
}

/** Andenes: x de cada gate (1…6) en la pared de cristal del fondo. */
export const GATES_X = [-10, -6, -2, 2, 6, 10];
export const DESK_FRENTE: [number, number] = [0, 5.75];
export const ENTRADA_FUERA: [number, number] = [0, 11];
const PASILLO_X = 7.3;
const PASILLO_FRENTE_Z = 6.55;
const PASILLO_FONDO_Z = -4.9;

/** Ruta caminando desde el frente del módulo de información hasta un lugar o un gate. */
export function rutaDesdeModulo(destino: { lugar: LugarId } | { gate: number }): [number, number][] {
  const inicio = DESK_FRENTE;
  if ("gate" in destino) {
    const gx = GATES_X[Math.max(0, Math.min(5, destino.gate - 1))]!;
    const s = gx < 0 ? -1 : 1;
    return [inicio, [s * PASILLO_X, PASILLO_FRENTE_Z], [s * PASILLO_X, PASILLO_FONDO_Z], [gx, PASILLO_FONDO_Z], [gx, -6.35]];
  }
  const l = lugar(destino.lugar);
  if (l.lado === "centro") {
    if (l.id === "waiting") return [inicio, [PASILLO_X, PASILLO_FRENTE_Z], [PASILLO_X, 1.4], [5.9, 1.4]];
    if (l.id === "gates") return rutaDesdeModulo({ gate: 3 });
    return [inicio, [0, 7.2]];
  }
  const s = l.lado === "izq" ? -1 : 1;
  const zl = Math.min(l.z, 5.9);
  return [inicio, [s * PASILLO_X, PASILLO_FRENTE_Z], [s * PASILLO_X, zl], [s * 9.85, zl]];
}

/** Servicios: horarios, precios (ILUSTRATIVOS). Minutos desde medianoche. */
export interface Servicio {
  id: LugarId;
  abre: number | null; // null = 24 h
  cierra: number | null;
  dias: "diario" | "lunvie";
  precio?: { pesos: number; en: string };
}
export const SERVICIOS: Partial<Record<LugarId, Servicio>> = {
  tickets: { id: "tickets", abre: null, cierra: null, dias: "diario" },
  atm: { id: "atm", abre: null, cierra: null, dias: "diario" },
  pharmacy: { id: "pharmacy", abre: 7 * 60, cierra: 23 * 60, dias: "diario" },
  lostfound: { id: "lostfound", abre: 9 * 60, cierra: 18 * 60, dias: "lunvie" },
  cafe: { id: "cafe", abre: 6 * 60, cierra: 22 * 60, dias: "diario" },
  restrooms: { id: "restrooms", abre: null, cierra: null, dias: "diario", precio: { pesos: 5, en: "They cost 5 pesos." } },
  luggage: { id: "luggage", abre: 6 * 60, cierra: 24 * 60, dias: "diario", precio: { pesos: 25, en: "It's 25 pesos per hour." } },
  info: { id: "info", abre: null, cierra: null, dias: "diario" },
};

export function horarioEn(id: LugarId): string {
  const s = SERVICIOS[id];
  const l = lugar(id);
  const suj = l.plural ? "They're" : "It's";
  if (!s || s.abre === null || s.cierra === null) return `${suj} open 24 hours, every day.`;
  const cierra = s.cierra >= 24 * 60 ? "midnight." : fmt12(s.cierra);
  return s.dias === "lunvie" ? `${suj} open Monday to Friday, from ${fmt12(s.abre)} to ${cierra}` : `${suj} open every day, from ${fmt12(s.abre)} to ${cierra}`;
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. EL TABLERO: salidas y llegadas que cambian con el reloj
 * ════════════════════════════════════════════════════════════════════════ */

export const T_INICIO = 10 * 60 + 30;
export const T_FIN = 12 * 60 + 45;

export type DestId = "puebla" | "queretaro" | "pachuca" | "oaxaca" | "veracruz" | "toluca" | "guadalajara";
export type OrigenId = "acapulco" | "cuernavaca" | "veracruz" | "guadalajara" | "puebla";
export type Ciudad = DestId | OrigenId;

export const CIUDAD_EN: Record<Ciudad, string> = {
  puebla: "Puebla",
  queretaro: "Querétaro",
  pachuca: "Pachuca",
  oaxaca: "Oaxaca",
  veracruz: "Veracruz",
  toluca: "Toluca",
  guadalajara: "Guadalajara",
  acapulco: "Acapulco",
  cuernavaca: "Cuernavaca",
};

export interface Salida {
  id: DestId;
  hora: number;
  puerta: number;
  retraso?: { en: number; min: number };
  cambio?: { en: number; puerta: number };
  cancelada?: { en: number };
  /** Precio ILUSTRATIVO (pesos, primera clase, sencillo). */
  precio: number;
  /** Duración aproximada por carretera desde la Ciudad de México. */
  duracion: number;
  duracionEn: string;
  color: string;
}

const hm = (h: number, m: number) => h * 60 + m;

export const SALIDAS: Salida[] = [
  { id: "puebla", hora: hm(10, 40), puerta: 2, precio: 290, duracion: 120, duracionEn: "about two hours", color: "#dc2626" },
  { id: "queretaro", hora: hm(10, 55), puerta: 4, precio: 450, duracion: 180, duracionEn: "about three hours", color: "#2563eb" },
  { id: "pachuca", hora: hm(11, 10), puerta: 1, retraso: { en: hm(10, 38), min: 20 }, precio: 160, duracion: 90, duracionEn: "about an hour and a half", color: "#16a34a" },
  { id: "oaxaca", hora: hm(11, 25), puerta: 5, cambio: { en: hm(10, 47), puerta: 3 }, precio: 890, duracion: 390, duracionEn: "about six and a half hours", color: "#9333ea" },
  { id: "veracruz", hora: hm(11, 40), puerta: 6, precio: 780, duracion: 330, duracionEn: "about five and a half hours", color: "#0891b2" },
  { id: "toluca", hora: hm(11, 45), puerta: 2, cancelada: { en: hm(10, 58) }, precio: 95, duracion: 60, duracionEn: "about an hour", color: "#ea580c" },
  { id: "guadalajara", hora: hm(12, 15), puerta: 4, retraso: { en: hm(11, 20), min: 15 }, precio: 1050, duracion: 420, duracionEn: "about seven hours", color: "#be123c" },
];

export interface Llegada {
  id: OrigenId;
  hora: number;
  retraso?: { en: number; min: number };
  duracion: number;
}

export const LLEGADAS: Llegada[] = [
  { id: "acapulco", hora: hm(10, 35), duracion: 300 },
  { id: "cuernavaca", hora: hm(10, 50), retraso: { en: hm(10, 33), min: 25 }, duracion: 75 },
  { id: "veracruz", hora: hm(11, 5), duracion: 330 },
  { id: "guadalajara", hora: hm(11, 30), duracion: 420 },
  { id: "puebla", hora: hm(12, 0), duracion: 120 },
];

export const salida = (id: DestId) => SALIDAS.find((s) => s.id === id)!;
export const llegadaDe = (id: OrigenId) => LLEGADAS.find((s) => s.id === id)!;

export type EstadoSalida = "ontime" | "delayed" | "boarding" | "departed" | "canceled";

export interface EstadoS {
  horaActual: number;
  puerta: number;
  estado: EstadoSalida;
  hayRetraso: boolean;
  cambioPuerta: boolean;
  cancel: boolean;
  remarks: string;
}

export function estadoSalida(s: Salida, t: number): EstadoS {
  const hayRetraso = !!s.retraso && t >= s.retraso.en;
  const horaActual = s.hora + (hayRetraso ? s.retraso!.min : 0);
  const cambioPuerta = !!s.cambio && t >= s.cambio.en;
  const puerta = cambioPuerta ? s.cambio!.puerta : s.puerta;
  const cancel = !!s.cancelada && t >= s.cancelada.en;
  let estado: EstadoSalida;
  if (cancel) estado = "canceled";
  else if (t >= horaActual) estado = "departed";
  else if (t >= horaActual - 15) estado = "boarding";
  else if (hayRetraso) estado = "delayed";
  else estado = "ontime";
  const remarks =
    estado === "canceled" ? "Canceled" : estado === "departed" ? "Departed" : estado === "boarding" ? "Boarding" : estado === "delayed" ? `Delayed – ${fmtHora(horaActual)}` : cambioPuerta ? "Gate changed" : "On time";
  return { horaActual, puerta, estado, hayRetraso, cambioPuerta, cancel, remarks };
}

export type EstadoLlegada = "ontime" | "delayed" | "arrived";
export function estadoLlegada(l: Llegada, t: number): { horaActual: number; estado: EstadoLlegada; hayRetraso: boolean; remarks: string } {
  const hayRetraso = !!l.retraso && t >= l.retraso.en;
  const horaActual = l.hora + (hayRetraso ? l.retraso!.min : 0);
  const estado: EstadoLlegada = t >= horaActual ? "arrived" : hayRetraso ? "delayed" : "ontime";
  const remarks = estado === "arrived" ? "Arrived" : estado === "delayed" ? `Delayed – ${fmtHora(horaActual)}` : "On time";
  return { horaActual, estado, hayRetraso, remarks };
}

export interface FilaTablero {
  hora: string;
  lugar: string;
  gate: string;
  remarks: string;
  tono: "ok" | "warn" | "info" | "off" | "bad" | "gate";
}

export function filasSalidas(t: number): FilaTablero[] {
  return SALIDAS.map((s) => {
    const e = estadoSalida(s, t);
    const tono: FilaTablero["tono"] = e.estado === "canceled" ? "bad" : e.estado === "departed" ? "off" : e.estado === "boarding" ? "info" : e.estado === "delayed" ? "warn" : e.cambioPuerta ? "gate" : "ok";
    return { hora: fmtHora(s.hora), lugar: CIUDAD_EN[s.id], gate: e.cancel ? "–" : String(e.puerta), remarks: e.remarks, tono };
  });
}

export function filasLlegadas(t: number): FilaTablero[] {
  return LLEGADAS.map((l) => {
    const e = estadoLlegada(l, t);
    return { hora: fmtHora(l.hora), lugar: CIUDAD_EN[l.id], gate: "", remarks: e.remarks, tono: e.estado === "arrived" ? "off" : e.estado === "delayed" ? "warn" : "ok" };
  });
}

/** Avisos por altavoz (cuando ocurre un cambio en el tablero). */
export interface Aviso {
  en: number;
  texto: string;
  es: string;
}
export const AVISOS: Aviso[] = [
  { en: hm(10, 33), texto: "Attention, please. The bus from Cuernavaca is delayed. The new arrival time is 11:15.", es: "El autobús que viene de Cuernavaca se retrasó: ahora llega a las 11:15." },
  { en: hm(10, 38), texto: "Attention, please. The bus to Pachuca is delayed. The new departure time is 11:30.", es: "El autobús a Pachuca se retrasó 20 minutos: ahora sale a las 11:30." },
  { en: hm(10, 47), texto: "Attention, please. The bus to Oaxaca now leaves from gate 3, not gate 5.", es: "Cambio de andén: el autobús a Oaxaca ahora sale del gate 3." },
  { en: hm(10, 58), texto: "Attention, please. The 11:45 bus to Toluca is canceled. We are sorry.", es: "Se canceló el autobús de las 11:45 a Toluca." },
  { en: hm(11, 20), texto: "Attention, please. The bus to Guadalajara is delayed. The new departure time is 12:30.", es: "El autobús a Guadalajara se retrasó 15 minutos: ahora sale a las 12:30." },
];

export function avisoVigente(t: number): Aviso | null {
  const vig = AVISOS.filter((a) => t >= a.en && t < a.en + 9);
  return vig[vig.length - 1] ?? null;
}

/* ════════════════════════════════════════════════════════════════════════
 * 4. MODO 1 — ASK THE RIGHT QUESTION: el intérprete de preguntas
 * ════════════════════════════════════════════════════════════════════════ */

export type Qw = "where" | "whattime" | "when" | "howmuch" | "howlong" | "which" | "isthere" | "yesno";

export const QW_EN: Record<Qw, string> = {
  where: "Where",
  whattime: "What time",
  when: "When",
  howmuch: "How much",
  howlong: "How long",
  which: "Which",
  isthere: "Is there / Are there",
  yesno: "una pregunta de sí o no",
};

export const QW_PIDE: Record<Qw, string> = {
  where: "un lugar (dónde)",
  whattime: "una hora exacta (a qué hora)",
  when: "un momento: hora, día o fecha (cuándo)",
  howmuch: "un precio (cuánto cuesta)",
  howlong: "una duración (cuánto tiempo)",
  which: "una opción entre varias (cuál: qué andén, qué autobús)",
  isthere: "si algo existe (¿hay…?)",
  yesno: "solo un sí o un no",
};

export type Verbo = "leave" | "arrive" | "open" | "close" | "be" | "cost" | "take" | "find";

export type Tema =
  | { t: "lugar"; id: LugarId; plural: boolean }
  | { t: "noexiste"; nombre: string }
  | { t: "bus"; dir: "to" | "from"; ciudad: Ciudad }
  | { t: "boleto"; ciudad: Ciudad; plural: boolean }
  | { t: "viaje"; ciudad: Ciudad }
  | { t: "ciudad"; ciudad: Ciudad }
  | { t: "wifi" }
  | { t: "reloj" };

export interface Interpretacion {
  ok: boolean;
  qw: Qw | null;
  tema: Tema | null;
  verbo: Verbo | null;
  /** Días («What days…?»). */
  dia: boolean;
  cortes: boolean;
  indirecta: boolean;
  error?: string;
}

const CIU = "(puebla|queretaro|pachuca|oaxaca|veracruz|toluca|guadalajara|acapulco|cuernavaca)";
const ART = "(?:(?:the|a|an|any|one|some|this|that) )?(?:(?:next|first|last) )?";

interface PatronTema {
  re: RegExp;
  tema: (m: RegExpExecArray) => Tema;
}

const PLURAL_RE = /\b(restrooms|bathrooms|toilets|washrooms|atms|lockers|pharmacies|drugstores|exits|taxis|ticket offices|ticket counters|ticket windows|cafes|cash machines|gates|platforms)\b/;

const lugarTema = (id: LugarId) => (m: RegExpExecArray): Tema => ({ t: "lugar", id, plural: PLURAL_RE.test(m[0]) });

const PATRONES_TEMA: PatronTema[] = [
  { re: new RegExp(String.raw`\b${ART}(?:bus|buses|coach) (to|for|from) ${CIU}\b`), tema: (m) => ({ t: "bus", dir: m[1] === "from" ? "from" : "to", ciudad: m[2] as Ciudad }) },
  { re: new RegExp(String.raw`\b${ART}(?:bus )?(tickets?|fares?) (?:to|for) ${CIU}\b`), tema: (m) => ({ t: "boleto", ciudad: m[2] as Ciudad, plural: m[1]!.endsWith("s") }) },
  { re: new RegExp(String.raw`\b${ART}(?:bus )?(?:trip|ride|journey|drive) (?:to|for) ${CIU}\b`), tema: (m) => ({ t: "viaje", ciudad: m[1] as Ciudad }) },
  { re: new RegExp(String.raw`\b(?:to|for) ${CIU}\b`), tema: (m) => ({ t: "ciudad", ciudad: m[1] as Ciudad }) },
  { re: new RegExp(String.raw`\b${ART}(?:ticket offices?|ticket counters?|ticket windows?|ticket booths?|box office)\b`), tema: lugarTema("tickets") },
  { re: new RegExp(String.raw`\b${ART}(?:lost and found(?: office)?|lost property(?: office)?)\b`), tema: lugarTema("lostfound") },
  { re: new RegExp(String.raw`\b${ART}(?:luggage storage|baggage storage|left luggage(?: office)?|luggage room|(?:luggage )?lockers?(?: for (?:luggage|bags|my luggage))?)\b`), tema: (m) => ({ t: "lugar", id: "luggage", plural: /lockers/.test(m[0]) }) },
  { re: new RegExp(String.raw`\b${ART}(?:restrooms?|bathrooms?|toilets?|washrooms?)\b`), tema: lugarTema("restrooms") },
  { re: new RegExp(String.raw`\b${ART}(?:cafeteria|cafes?|coffee shop|coffee place)\b`), tema: lugarTema("cafe") },
  { re: new RegExp(String.raw`\b${ART}(?:atms?|cash machines?|cash points?|cashpoints?|cash dispensers?)\b`), tema: lugarTema("atm") },
  { re: new RegExp(String.raw`\b${ART}(?:pharmacy|pharmacies|drugstores?|drug store)\b`), tema: lugarTema("pharmacy") },
  { re: new RegExp(String.raw`\b${ART}(?:information desk|info desk|information booth|information counter|information office)\b`), tema: lugarTema("info") },
  { re: new RegExp(String.raw`\b${ART}(?:waiting (?:area|room|lounge|hall))\b`), tema: lugarTema("waiting") },
  { re: new RegExp(String.raw`\b${ART}(?:taxi stand|taxi rank|taxis|exit to the taxis|exits?)\b`), tema: lugarTema("exit") },
  { re: new RegExp(String.raw`\b${ART}(?:main entrance|entrance)\b`), tema: lugarTema("entrance") },
  { re: new RegExp(String.raw`\b${ART}(?:gates|platforms)\b`), tema: lugarTema("gates") },
  { re: new RegExp(String.raw`\b${ART}(?:wi fi|wifi|internet)\b`), tema: () => ({ t: "wifi" }) },
  { re: new RegExp(String.raw`\b${ART}(bank|hotel|restaurant|supermarket|gym|library|parking lot|hospital|bookstore|post office)\b`), tema: (m) => ({ t: "noexiste", nombre: m[1]! }) },
];

function buscarTema(s: string): { tema: Tema; skel: string } | null {
  for (const p of PATRONES_TEMA) {
    const m = p.re.exec(s);
    if (m) {
      const skel = `${s.slice(0, m.index)}§${s.slice(m.index + m[0].length)}`.replace(/\s+/g, " ").trim();
      return { tema: p.tema(m), skel };
    }
  }
  return null;
}

const esPlural = (t: Tema) => (t.t === "lugar" ? t.plural : t.t === "boleto" ? t.plural : false);

/** Frase nominal del tema, en inglés: «the restrooms», «the bus to Veracruz», «a ticket to Veracruz». */
export function nombreTema(t: Tema): string {
  switch (t.t) {
    case "lugar":
      return conArticulo(t.id, t.plural);
    case "noexiste":
      return `a ${t.nombre}`;
    case "bus":
      return `the bus ${t.dir} ${CIUDAD_EN[t.ciudad]}`;
    case "boleto":
      return `a ticket to ${CIUDAD_EN[t.ciudad]}`;
    case "viaje":
      return `the trip to ${CIUDAD_EN[t.ciudad]}`;
    case "ciudad":
      return `the bus to ${CIUDAD_EN[t.ciudad]}`;
    case "wifi":
      return "Wi-Fi";
    default:
      return "the time";
  }
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Pregunta modelo para un tipo de pregunta y un tema (para explicar errores). */
export function modeloPregunta(qw: Qw, t: Tema, verbo: Verbo | null): string {
  const nt = t.t === "boleto" ? `a ticket to ${CIUDAD_EN[t.ciudad]}` : nombreTema(t);
  const pl = esPlural(t);
  const be = pl ? "are" : "is";
  const aux = pl ? "do" : "does";
  const esBus = t.t === "bus" || t.t === "ciudad" || t.t === "boleto" || t.t === "viaje";
  const bus = t.t === "bus" ? nombreTema(t) : esBus ? `the bus to ${CIUDAD_EN[(t as { ciudad: Ciudad }).ciudad]}` : nt;
  const vb = verbo === "arrive" || (t.t === "bus" && t.dir === "from") ? "arrive" : verbo === "close" ? "close" : verbo === "open" ? "open" : "leave";
  switch (qw) {
    case "where":
      return esBus ? `Where does ${bus} leave from?` : `Where ${be} ${nt}?`;
    case "whattime":
      return esBus ? `What time does ${bus} ${vb}?` : `What time ${aux} ${nt} ${verbo === "close" ? "close" : "open"}?`;
    case "when":
      return esBus ? `When does ${bus} ${vb}?` : `When ${be} ${nt} open?`;
    case "howmuch":
      return t.t === "lugar" ? `How much ${be} ${nt}?` : `How much is a ticket to ${CIUDAD_EN[(t as { ciudad: Ciudad }).ciudad] ?? ""}?`;
    case "howlong":
      return esBus ? `How long is the trip to ${CIUDAD_EN[(t as { ciudad: Ciudad }).ciudad]}?` : `How long is it?`;
    case "which":
      return `Which gate does ${bus} leave from?`;
    case "isthere": {
      if (t.t === "lugar") {
        const l = lugar(t.id);
        return pl ? `Are there any ${l.enPl}?` : `Is there ${/^[aeiou]/i.test(l.en) || l.id === "atm" ? "an" : "a"} ${l.en} in the terminal?`;
      }
      return `Is there ${nt} here?`;
    }
    default:
      return cap(`${be} ${nt} open?`);
  }
}

const W = "(what time|at what time|when|what days?|which days?)";
const VB = "(leave|depart|arrive|get in|get here|get there|open|close|start)";
const VS = "(leaves|departs|arrives|gets in|gets here|opens|closes|starts)";
const LOC = "(?: here| near here| nearby| around here| in (?:the|this) (?:terminal|station|bus station|building)| inside)?";
const G = "(?:gate|platform|bay)";

function verboDe(w: string | undefined): Verbo | null {
  if (!w) return null;
  if (/^(leave|leaves|leaving|depart|departs|departing|start|starts|go|going)$/.test(w)) return "leave";
  if (/^(arrive|arrives|arriving|get in|gets in|get here|gets here|get there)$/.test(w)) return "arrive";
  if (/^(open|opens|opening)$/.test(w)) return "open";
  if (/^(close|closes|closing|closed)$/.test(w)) return "close";
  return null;
}

function qwDe(w: string): { qw: Qw; dia: boolean } {
  if (w === "when") return { qw: "when", dia: false };
  if (/day/.test(w)) return { qw: "when", dia: true };
  return { qw: "whattime", dia: false };
}

interface Ctx {
  tema: Tema;
  plural: boolean;
  nt: string;
}

type Resultado = { ok: true; qw: Qw; verbo: Verbo | null; dia?: boolean } | { ok: false; qw: Qw | null; error: string };

function concordancia(be: string, c: Ctx, modelo: string): string | null {
  if (be === "is" && c.plural) return `«${c.nt.replace(/^the /, "")}» es plural: se usa are, no is. Así: «${modelo}»`;
  if (be === "are" && !c.plural) return `«${c.nt.replace(/^the /, "")}» es singular: se usa is, no are. Así: «${modelo}»`;
  return null;
}

function reglasDirectas(sk: string, c: Ctx): Resultado | null {
  let m: RegExpMatchArray | null;
  const md = (qw: Qw, v: Verbo | null = null) => modeloPregunta(qw, c.tema, v);

  /* ── Where ── */
  if ((m = sk.match(/^where (is|are) §(?: located)?$/))) {
    const e = concordancia(m[1]!, c, md("where"));
    return e ? { ok: false, qw: "where", error: e } : { ok: true, qw: "where", verbo: "be" };
  }
  if (/^where (?:can|could|do|should|may) i (?:find|get|buy|take|catch|use|leave|store|get to|go to|pay for) §(?: here)?$/.test(sk)) return { ok: true, qw: "where", verbo: "find" };
  if ((m = sk.match(/^where (does|is|do) § (leave|depart|leaving|departing|arrive|arriving)(?: from)?$/))) {
    if (m[1] === "do" && !c.plural) return { ok: false, qw: "where", error: `Con he / she / it (el autobús) el auxiliar es does, no do. Así: «${md("where")}»` };
    return { ok: true, qw: "where", verbo: verboDe(m[2]) };
  }
  if (/^where does § (?:leaves|departs|arrives)(?: from)?$/.test(sk)) return { ok: false, qw: "where", error: `Después de does el verbo va en forma base, sin -s: does … leave. Así: «${md("where")}»` };
  if (/^where § (?:is|are)$/.test(sk)) return { ok: false, qw: "where", error: `En una pregunta el verbo va ANTES del sujeto: Where + is/are + lugar. Así: «${md("where")}»` };
  if (/^where § (?:leaves?|departs?|arrives?)(?: from)?$/.test(sk)) return { ok: false, qw: "where", error: `Falta el auxiliar does: Where + does + sujeto + verbo base. Así: «${md("where")}»` };
  if (/^where §$/.test(sk)) return { ok: false, qw: "where", error: `Falta el verbo. Una pregunta necesita verbo: Where + is/are + lugar. Así: «${md("where")}»` };

  /* ── What time / When / What days ── */
  if (/^what hour/.test(sk)) return { ok: false, qw: "whattime", error: `«¿A qué hora…?» se dice What time…?, no what hour. Así: «${md("whattime", "leave")}»` };
  if ((m = sk.match(new RegExp(String.raw`^${W} does § ${VB}(?: from gate \w+| in \w+| here| there| today)?$`)))) {
    const q = qwDe(m[1]!);
    return { ok: true, qw: q.qw, verbo: verboDe(m[2]), dia: q.dia };
  }
  if ((m = sk.match(new RegExp(String.raw`^${W} do § ${VB}$`)))) {
    const q = qwDe(m[1]!);
    if (!c.plural) return { ok: false, qw: q.qw, error: `Con un sujeto singular (${c.nt}) el auxiliar es does, no do. Así: «${md(q.qw, verboDe(m[2]))}»` };
    return { ok: true, qw: q.qw, verbo: verboDe(m[2]), dia: q.dia };
  }
  if ((m = sk.match(new RegExp(String.raw`^${W} (is|are) § (open|leaving|departing|arriving|closing|opening|closed)(?: today| now)?$`)))) {
    const q = qwDe(m[1]!);
    const e = concordancia(m[2]!, c, md(q.qw, verboDe(m[3])));
    if (e) return { ok: false, qw: q.qw, error: e };
    return { ok: true, qw: q.qw, verbo: m[3] === "open" || m[3] === "closed" ? "be" : verboDe(m[3]), dia: q.dia };
  }
  if ((m = sk.match(new RegExp(String.raw`^${W} (is|are) §$`)))) {
    const q = qwDe(m[1]!);
    const e = concordancia(m[2]!, c, md(q.qw));
    if (e) return { ok: false, qw: q.qw, error: e };
    return { ok: true, qw: q.qw, verbo: "be", dia: q.dia };
  }
  if ((m = sk.match(new RegExp(String.raw`^${W} is there a bus §$`)))) {
    const q = qwDe(m[1]!);
    return { ok: true, qw: q.qw, verbo: "leave", dia: q.dia };
  }
  if ((m = sk.match(new RegExp(String.raw`^what hours (?:is|are) § open$`)))) return { ok: true, qw: "when", verbo: "be" };
  if ((m = sk.match(new RegExp(String.raw`^${W} does § ${VS}$`)))) {
    const q = qwDe(m[1]!);
    return { ok: false, qw: q.qw, error: `Después de does el verbo va en forma base, sin -s (does … ${verboDe(m[2]) ?? "leave"}). Así: «${md(q.qw, verboDe(m[2]))}»` };
  }
  if ((m = sk.match(new RegExp(String.raw`^${W} § (?:${VS}|${VB})$`)))) {
    const q = qwDe(m[1]!);
    const v = verboDe(m[2] ?? m[3]);
    return { ok: false, qw: q.qw, error: `Falta el auxiliar ${c.plural ? "do" : "does"}. En presente simple la pregunta es: ${QW_EN[q.qw]} + ${c.plural ? "do" : "does"} + sujeto + verbo base. Así: «${md(q.qw, v)}»` };
  }
  if ((m = sk.match(new RegExp(String.raw`^${W} (?:${VS}|${VB}) §$`)))) {
    const q = qwDe(m[1]!);
    const v = verboDe(m[2] ?? m[3]);
    return { ok: false, qw: q.qw, error: `El orden del español («¿A qué hora sale el autobús?») no funciona en inglés: se necesita does y el sujeto antes del verbo. Así: «${md(q.qw, v)}»` };
  }
  if ((m = sk.match(new RegExp(String.raw`^${W} (?:is|are) § (leave|depart|arrive|close|start)s?$`)))) {
    const q = qwDe(m[1]!);
    return { ok: false, qw: q.qw, error: `No mezcles is con otro verbo («is … leave»). Con un verbo de acción se usa does. Así: «${md(q.qw, verboDe(m[2]))}»` };
  }

  /* ── How much ── */
  if ((m = sk.match(/^how much (is|are) §$/))) {
    const e = concordancia(m[1]!, c, md("howmuch"));
    return e ? { ok: false, qw: "howmuch", error: e } : { ok: true, qw: "howmuch", verbo: "cost" };
  }
  if (/^how much (?:does|will) § cost$/.test(sk)) return { ok: true, qw: "howmuch", verbo: "cost" };
  if (/^how much do § cost$/.test(sk)) return c.plural ? { ok: true, qw: "howmuch", verbo: "cost" } : { ok: false, qw: "howmuch", error: `Con un sujeto singular el auxiliar es does: «How much does ${c.nt} cost?»` };
  if (/^how much (?:is it|does it cost|will it cost)(?: to (?:go|get|travel))? §(?: by bus)?$/.test(sk)) return { ok: true, qw: "howmuch", verbo: "cost" };
  if (/^what (?:is|are) the (?:price|cost|fare)s? (?:of|for) §$/.test(sk)) return { ok: true, qw: "howmuch", verbo: "cost" };
  if (c.tema.t === "boleto" && /^what (?:is|are) §$/.test(sk)) return { ok: true, qw: "howmuch", verbo: "cost" };
  if (/^what does § cost$/.test(sk)) return { ok: true, qw: "howmuch", verbo: "cost" };
  if (/^how much costs? §$/.test(sk)) return { ok: false, qw: "howmuch", error: `«¿Cuánto cuesta…?» no se traduce palabra por palabra. Usa How much is…? o How much does … cost? Así: «${md("howmuch")}»` };
  if (/^how much does (?:§|it) costs/.test(sk)) return { ok: false, qw: "howmuch", error: `Después de does el verbo va sin -s: does … cost. Así: «${md("howmuch")}»` };
  if (/^how much § (?:is|are|costs?)$/.test(sk)) return { ok: false, qw: "howmuch", error: `En una pregunta directa el verbo va antes del sujeto. Así: «${md("howmuch")}»` };
  if (/^how many\b/.test(sk) && !/hours?/.test(sk)) return { ok: false, qw: "howmuch", error: `Para precios se usa How much (el dinero no se cuenta pieza por pieza). Así: «${md("howmuch")}»` };

  /* ── How long ── */
  if (/^how (?:long|many hours) (?:is|does) §(?: take| last)?$/.test(sk)) return { ok: true, qw: "howlong", verbo: "take" };
  if (/^how (?:long|many hours) does it take(?: to (?:go|get|travel))? §(?: by bus)?$/.test(sk)) return { ok: true, qw: "howlong", verbo: "take" };
  if (/^how long is it §$/.test(sk)) return { ok: true, qw: "howlong", verbo: "take" };
  if (/^how long takes?\b/.test(sk)) return { ok: false, qw: "howlong", error: `Falta el auxiliar does: How long + does + sujeto + take? (o How long is…?). Así: «${md("howlong")}»` };
  if (/^how long does (?:§|it) takes/.test(sk)) return { ok: false, qw: "howlong", error: `Después de does el verbo va sin -s: does … take. Así: «${md("howlong")}»` };
  if (/^how long § (?:takes?|is|lasts?)$/.test(sk)) return { ok: false, qw: "howlong", error: `En una pregunta directa el verbo va antes del sujeto. Así: «${md("howlong")}»` };

  /* ── Which gate ── */
  if (new RegExp(String.raw`^(?:which|what) ${G} (?:does|is|will) § (?:leave|depart|leaving|departing|go|going)(?: from)?$`).test(sk)) return { ok: true, qw: "which", verbo: "leave" };
  if (new RegExp(String.raw`^(?:which|what) ${G} is §(?: at| in| on)?$`).test(sk)) return { ok: true, qw: "which", verbo: "leave" };
  if (new RegExp(String.raw`^(?:which|what) ${G} does § use$`).test(sk)) return { ok: true, qw: "which", verbo: "leave" };
  if (new RegExp(String.raw`^from (?:which|what) ${G} (?:does|is) § (?:leave|depart|leaving|departing)$`).test(sk)) return { ok: true, qw: "which", verbo: "leave" };
  if (new RegExp(String.raw`^what is the ${G} (?:for|of) §$`).test(sk)) return { ok: true, qw: "which", verbo: "leave" };
  if (new RegExp(String.raw`^(?:which|what) ${G} does § (?:leaves|departs)(?: from)?$`).test(sk)) return { ok: false, qw: "which", error: `Después de does el verbo va sin -s: does … leave. Así: «${md("which")}»` };
  if (new RegExp(String.raw`^(?:which|what) ${G} § (?:leaves?|departs?)(?: from)?$`).test(sk)) return { ok: false, qw: "which", error: `Falta el auxiliar does: Which gate + does + sujeto + leave from? Así: «${md("which")}»` };
  if (new RegExp(String.raw`^(?:which|what) ${G} (?:leaves?|departs?) §`).test(sk)) return { ok: false, qw: "which", error: `El sujeto va antes del verbo y se necesita does. Así: «${md("which")}»` };

  /* ── Is there / Are there ── */
  if (new RegExp(String.raw`^is there §${LOC}$`).test(sk)) {
    if (c.plural) return { ok: false, qw: "isthere", error: `«${c.nt.replace(/^the /, "")}» es plural: se pregunta Are there any…? Así: «${md("isthere")}»` };
    return { ok: true, qw: "isthere", verbo: "be" };
  }
  if (new RegExp(String.raw`^are there §${LOC}$`).test(sk)) {
    if (!c.plural && c.tema.t !== "wifi") return { ok: false, qw: "isthere", error: `Es singular: se pregunta Is there a / an…? Así: «${md("isthere")}»` };
    if (c.tema.t === "wifi") return { ok: false, qw: "isthere", error: `Wi-Fi es incontable (singular): «Is there Wi-Fi here?»` };
    return { ok: true, qw: "isthere", verbo: "be" };
  }
  if (new RegExp(String.raw`^there (?:is|are) §${LOC}$`).test(sk)) return { ok: false, qw: "isthere", error: `Así es una afirmación. Para preguntar se invierte: Is there…? / Are there…? Así: «${md("isthere")}»` };
  if (/^(?:has|have|haves|exists?|there has|there have)\b/.test(sk)) return { ok: false, qw: "isthere", error: `«¿Hay…?» no se dice con have ni exist: se dice Is there a…? (singular) o Are there any…? (plural). Así: «${md("isthere")}»` };
  if (new RegExp(String.raw`^(?:does|do) (?:the|this) (?:terminal|station|bus station|building) have §${LOC}$`).test(sk)) return { ok: true, qw: "isthere", verbo: "be" };
  if (new RegExp(String.raw`^do you have §${LOC}$`).test(sk)) return { ok: true, qw: "isthere", verbo: "be" };

  /* ── Sí / no ── */
  if ((m = sk.match(/^(is|are) § (?:open|closed|on time|delayed|late|here|far|free|canceled|full|boarding)(?: now| today| yet)?$/))) {
    const e = concordancia(m[1]!, c, `${cap(m[1]!)} ${c.nt} open?`);
    return e ? { ok: false, qw: "yesno", error: e } : { ok: true, qw: "yesno", verbo: "be" };
  }
  if (/^(?:does|do) § (?:leave|arrive|go|stop|open|close|have|cost)\b/.test(sk)) return { ok: true, qw: "yesno", verbo: null };
  if (/^(?:can|could|may) i (?:buy|get|pay|use|leave|take)\b/.test(sk)) return { ok: true, qw: "yesno", verbo: null };
  return null;
}

function reglasIndirectas(sk: string, c: Ctx): Resultado | null {
  let m: RegExpMatchArray | null;
  if ((m = sk.match(/^where § (is|are)(?: located)?$/))) {
    const e = concordancia(m[1]!, c, `Can you tell me where ${c.nt} ${c.plural ? "are" : "is"}?`);
    return e ? { ok: false, qw: "where", error: e } : { ok: true, qw: "where", verbo: "be" };
  }
  if (/^where § (?:leaves|departs)(?: from)?$/.test(sk)) return { ok: true, qw: "where", verbo: "leave" };
  if (/^where i can (?:find|get|buy|take) §$/.test(sk)) return { ok: true, qw: "where", verbo: "find" };
  if ((m = sk.match(new RegExp(String.raw`^${W} § ${VS}$`)))) {
    const q = qwDe(m[1]!);
    return { ok: true, qw: q.qw, verbo: verboDe(m[2]), dia: q.dia };
  }
  if ((m = sk.match(new RegExp(String.raw`^${W} § (?:is|are)(?: open)?$`)))) {
    const q = qwDe(m[1]!);
    return { ok: true, qw: q.qw, verbo: "be", dia: q.dia };
  }
  if (/^how much § (?:is|are|costs|cost)$/.test(sk) || /^how much it (?:is|costs)(?: to (?:go|get|travel))? §$/.test(sk)) return { ok: true, qw: "howmuch", verbo: "cost" };
  if (/^how long § (?:takes|is|lasts)$/.test(sk) || /^how long it takes(?: to (?:go|get|travel))? §$/.test(sk)) return { ok: true, qw: "howlong", verbo: "take" };
  if (new RegExp(String.raw`^(?:which|what) ${G} § (?:leaves|departs) from$`).test(sk)) return { ok: true, qw: "which", verbo: "leave" };
  if ((m = sk.match(new RegExp(String.raw`^(?:if|whether) there (is|are) §${LOC}$`)))) {
    const e = concordancia(m[1]!, c, `Can you tell me if there ${c.plural ? "are any" : "is a"} …?`);
    return e ? { ok: false, qw: "isthere", error: e } : { ok: true, qw: "isthere", verbo: "be" };
  }
  return null;
}

const INDIRECTA = /^(?:(?:can|could) you (?:please )?tell me|do you know|i (?:would like|want|need) to know) (.+)$/;

export function interpretarPregunta(texto: string): Interpretacion {
  const base: Interpretacion = { ok: false, qw: null, tema: null, verbo: null, dia: false, cortes: false, indirecta: false };
  let s = normalizaEn(texto);
  if (!s) return { ...base, error: "Escribe una pregunta en inglés." };
  if (pareceEspanol(s)) return { ...base, error: "Escríbela en inglés: la empleada es de la terminal, pero Lucy practica su inglés contigo. Empieza con una palabra interrogativa (Where, What time, How much…)." };
  const cortes = /^(?:excuse me|pardon me|sorry|hi|hello|good (?:morning|afternoon|evening))\b/.test(s);
  let prev = "";
  while (prev !== s) {
    prev = s;
    s = s.replace(/^(?:excuse me|pardon me|sorry|hi|hello|good (?:morning|afternoon|evening)|sir|madam|miss|please|ma'am)\s*/, "").replace(/\s*(?:please|sir|madam|miss|ma'am|thank you|thanks)$/, "");
  }
  base.cortes = cortes;
  const ind = INDIRECTA.exec(s);
  if (ind) {
    base.indirecta = true;
    s = ind[1]!;
  }
  if (/^what time is it$|^what is the time$|^do you have the time$/.test(s)) return { ...base, ok: true, qw: "whattime", tema: { t: "reloj" }, verbo: "be" };
  const bt = buscarTema(s);
  if (!bt) {
    if (/^(?:where|when|what time|how much|how long|which|is there|are there)\b/.test(s)) return { ...base, error: "No encuentro de qué lugar o de qué autobús preguntas. Nómbralo en inglés: the restrooms, the café, the ATM, the bus to Veracruz, a ticket to Veracruz…" };
    return { ...base, error: "No reconozco una pregunta. Empieza con una palabra interrogativa (Where, What time, When, How much, How long, Which) o con Is there / Are there, y nombra el lugar o el autobús." };
  }
  const tema = bt.tema;
  const c: Ctx = { tema, plural: esPlural(tema), nt: nombreTema(tema) };
  base.tema = tema;
  if (base.indirecta) {
    const r = reglasIndirectas(bt.skel, c);
    if (r) return r.ok ? { ...base, ok: true, qw: r.qw, verbo: r.verbo, dia: !!r.dia } : { ...base, qw: r.qw, error: r.error };
    const d = reglasDirectas(bt.skel, c);
    if (d && d.ok && d.qw !== "yesno") {
      return { ...base, qw: d.qw, error: `Muy cortés, pero en una pregunta indirecta (Can you tell me…?) el orden NO se invierte: va como afirmación. Ejemplo: «Can you tell me where the restrooms are?» (no «where are the restrooms»).` };
    }
    return { ...base, error: "Revisa el orden de la pregunta indirecta: Can you tell me + palabra interrogativa + sujeto + verbo. Ejemplo: «Can you tell me what time the bus to Puebla leaves?»" };
  }
  const r = reglasDirectas(bt.skel, c);
  if (r) return r.ok ? { ...base, ok: true, qw: r.qw, verbo: r.verbo, dia: !!r.dia } : { ...base, qw: r.qw, error: r.error };
  if (/^(?:where|when|what time|how much|how long|which|what)\b/.test(bt.skel)) {
    return { ...base, error: `Casi: revisa el orden. Palabra interrogativa + auxiliar (is / are / does) + sujeto + verbo. Por ejemplo: «${modeloPregunta(/^where/.test(bt.skel) ? "where" : /^how much/.test(bt.skel) ? "howmuch" : /^how long/.test(bt.skel) ? "howlong" : /^which/.test(bt.skel) ? "which" : "whattime", tema, null)}»` };
  }
  if (/§/.test(bt.skel) && bt.skel.replace(/§/, "").trim() === "") return { ...base, error: `Solo nombraste el lugar. Hazlo pregunta: «${modeloPregunta(tema.t === "lugar" ? "where" : "whattime", tema, null)}»` };
  return { ...base, error: "No reconozco la estructura. Una pregunta de información empieza con Where, What time, When, How much, How long, Which o Is there / Are there." };
}

/* ── Lo que responde la empleada (Rosa) según lo que se preguntó ────────── */

export type Dato = "lugar" | "hora" | "dia" | "precio" | "duracion" | "anden" | "existe" | "sino" | "otro";

export type Foco = { t: "lugar"; id: LugarId } | { t: "salida"; id: DestId } | { t: "llegada"; id: OrigenId } | null;

export interface RespuestaEmpleada {
  texto: string;
  clave: string;
  dato: Dato;
  foco: Foco;
  /** Qué te dijo, en español. */
  describe: string;
}

const esDestino = (c: Ciudad): c is DestId => SALIDAS.some((s) => s.id === c);
const esOrigen = (c: Ciudad): c is OrigenId => LLEGADAS.some((s) => s.id === c);

export function responder(i: Interpretacion, t: number): RespuestaEmpleada {
  const tema = i.tema;
  const qw = i.qw ?? "yesno";
  const nada: RespuestaEmpleada = { texto: "Sorry, I don't understand.", clave: "nada", dato: "otro", foco: null, describe: "nada útil" };
  if (!tema) return nada;
  if (tema.t === "reloj") return { texto: `It's ${fmtHora(t)}.`, clave: "reloj", dato: "hora", foco: null, describe: "la hora que es ahora" };
  if (tema.t === "wifi") {
    if (qw === "howmuch") return { texto: "It's free.", clave: "precio:wifi", dato: "precio", foco: null, describe: "cuánto cuesta el Wi-Fi" };
    return { texto: "Yes, there is. It's free, everywhere in the terminal.", clave: "hay:wifi", dato: "existe", foco: null, describe: "si hay Wi-Fi" };
  }
  if (tema.t === "noexiste") {
    return { texto: `No, there isn't. Sorry, there isn't a ${tema.nombre} in the terminal.`, clave: "hay:no", dato: qw === "where" ? "lugar" : "existe", foco: null, describe: `que no hay ${tema.nombre} en la terminal` };
  }
  if (tema.t === "lugar") {
    const l = lugar(tema.id);
    const suj = l.plural ? "They're" : "It's";
    const serv = SERVICIOS[tema.id];
    if (qw === "where") return { texto: `${suj} ${ubicacionEn(tema.id)}.`, clave: `donde:${tema.id}`, dato: "lugar", foco: { t: "lugar", id: tema.id }, describe: `dónde está${l.plural ? "n" : ""} ${l.es}` };
    if (qw === "isthere") {
      const si = tema.plural ? "Yes, there are. They're" : "Yes, there is. It's";
      return { texto: `${si} ${ubicacionEn(tema.id)}.`, clave: `hay:${tema.id}`, dato: "existe", foco: { t: "lugar", id: tema.id }, describe: `si hay ${l.esUn}` };
    }
    if (qw === "whattime" || qw === "when") {
      const abierto = !serv || serv.abre === null;
      if (i.verbo === "open" && !abierto && !i.dia) return { texto: `${l.plural ? "They open" : "It opens"} at ${fmt12(serv!.abre!)}.`, clave: `abre:${tema.id}`, dato: "hora", foco: { t: "lugar", id: tema.id }, describe: `a qué hora ABRE ${l.es}` };
      if (i.verbo === "close" && !abierto && !i.dia) {
        const c = serv!.cierra! >= 24 * 60 ? "midnight" : fmt12(serv!.cierra!);
        return { texto: `${l.plural ? "They close" : "It closes"} at ${c}.`, clave: `cierra:${tema.id}`, dato: "hora", foco: { t: "lugar", id: tema.id }, describe: `a qué hora CIERRA ${l.es}` };
      }
      return { texto: horarioEn(tema.id), clave: `horario:${tema.id}`, dato: "dia", foco: { t: "lugar", id: tema.id }, describe: `el horario de ${l.es} (días y horas)` };
    }
    if (qw === "howmuch") {
      const p = serv?.precio;
      return { texto: p ? p.en : `${l.plural ? "They're" : "It's"} free.`, clave: `precio:${tema.id}`, dato: "precio", foco: { t: "lugar", id: tema.id }, describe: `cuánto cuesta ${l.es}` };
    }
    if (qw === "yesno") {
      const abierto = !serv || serv.abre === null || (t >= serv.abre && t < serv.cierra!);
      return { texto: abierto ? (l.plural ? "Yes, they are." : "Yes, it is.") : l.plural ? "No, they aren't." : "No, it isn't.", clave: `sino:${tema.id}`, dato: "sino", foco: { t: "lugar", id: tema.id }, describe: "solo un sí o un no" };
    }
    return { texto: `Sorry? Do you mean where ${l.plural ? "they are" : "it is"}?`, clave: "nada", dato: "otro", foco: null, describe: "una duda: esa pregunta no tiene sentido para un lugar" };
  }
  // Autobuses, boletos, viajes
  const ciudad = tema.ciudad;
  const dirFrom = tema.t === "bus" && tema.dir === "from";
  const nombre = CIUDAD_EN[ciudad];
  if (!dirFrom && (tema.t === "boleto" || (tema.t === "ciudad" && qw === "howmuch") || qw === "howmuch")) {
    if (!esDestino(ciudad)) return { texto: `Sorry, there aren't any buses to ${nombre} from this terminal.`, clave: "nobus", dato: "otro", foco: null, describe: `que no hay autobuses a ${nombre}` };
    const s = salida(ciudad);
    if (qw === "howmuch") return { texto: `A ticket to ${nombre} is ${s.precio} pesos.`, clave: `precio:${ciudad}`, dato: "precio", foco: { t: "lugar", id: "tickets" }, describe: `cuánto cuesta el boleto a ${nombre}` };
  }
  if (dirFrom) {
    if (!esOrigen(ciudad)) return { texto: `Sorry, there isn't a bus from ${nombre} today.`, clave: "nobus", dato: "otro", foco: null, describe: `que hoy no llega un autobús de ${nombre}` };
    const l = llegadaDe(ciudad);
    const e = estadoLlegada(l, t);
    if (qw === "whattime" || qw === "when") {
      if (i.verbo === "leave") return { texto: `It left ${nombre} at about ${fmtHora(l.hora - l.duracion)}. It arrives here at ${fmtHora(e.horaActual)}.`, clave: `saleorigen:${ciudad}`, dato: "hora", foco: { t: "llegada", id: ciudad }, describe: `a qué hora SALIÓ de ${nombre} (y cuándo llega)` };
      const txt = e.estado === "arrived" ? `It already arrived. It arrived at ${fmtHora(e.horaActual)}.` : e.hayRetraso ? `It's delayed. It arrives at ${fmtHora(e.horaActual)} now.` : `It arrives at ${fmtHora(e.horaActual)}.`;
      return { texto: txt, clave: `llega:${ciudad}`, dato: "hora", foco: { t: "llegada", id: ciudad }, describe: `a qué hora LLEGA el autobús de ${nombre}` };
    }
    if (qw === "where" || qw === "which") return { texto: "Buses arrive at the gates, behind the waiting area.", clave: `dondellega:${ciudad}`, dato: "anden", foco: { t: "lugar", id: "gates" }, describe: "a dónde llegan los autobuses" };
    if (qw === "howlong") return { texto: `The trip from ${nombre} takes about ${Math.round(l.duracion / 30) / 2} hours.`, clave: `dura:${ciudad}`, dato: "duracion", foco: { t: "llegada", id: ciudad }, describe: `cuánto dura el viaje desde ${nombre}` };
    return { texto: e.estado === "arrived" ? "Yes, it already arrived." : e.hayRetraso ? "No, it's delayed." : "Yes, it's on time.", clave: `sino:${ciudad}`, dato: "sino", foco: { t: "llegada", id: ciudad }, describe: "solo un sí o un no" };
  }
  if (!esDestino(ciudad)) return { texto: `Sorry, there aren't any buses to ${nombre} from this terminal.`, clave: "nobus", dato: "otro", foco: null, describe: `que no hay autobuses a ${nombre}` };
  const s = salida(ciudad);
  const e = estadoSalida(s, t);
  const foco: Foco = { t: "salida", id: ciudad };
  if (qw === "howlong") return { texto: `It takes ${s.duracionEn}.`, clave: `dura:${ciudad}`, dato: "duracion", foco, describe: `cuánto dura el viaje a ${nombre}` };
  if (e.estado === "canceled" && qw !== "isthere") return { texto: "I'm sorry, it's canceled.", clave: qw === "where" || qw === "which" ? `anden:${ciudad}` : `sale:${ciudad}`, dato: qw === "where" || qw === "which" ? "anden" : "hora", foco, describe: `que el autobús a ${nombre} está CANCELADO` };
  if (qw === "where" || qw === "which") {
    const txt = e.estado === "departed" ? `Sorry, it already left. It left from gate ${e.puerta}.` : `It leaves from gate ${e.puerta}.`;
    return { texto: txt, clave: `anden:${ciudad}`, dato: "anden", foco, describe: `de qué andén (gate) sale el autobús a ${nombre}` };
  }
  if (qw === "whattime" || qw === "when") {
    if (i.verbo === "arrive") return { texto: `It arrives in ${nombre} at about ${fmt12(e.horaActual + s.duracion)}.`, clave: `llegadestino:${ciudad}`, dato: "hora", foco, describe: `a qué hora LLEGA a ${nombre}` };
    const txt = e.estado === "departed" ? `Sorry, it already left at ${fmtHora(e.horaActual)}.` : e.hayRetraso ? `It's delayed. It leaves at ${fmtHora(e.horaActual)} now.` : `It leaves at ${fmtHora(e.horaActual)}.`;
    return { texto: txt, clave: `sale:${ciudad}`, dato: "hora", foco, describe: `a qué hora SALE el autobús a ${nombre}` };
  }
  if (qw === "isthere") {
    const txt = e.estado === "canceled" ? `No, there isn't. The bus to ${nombre} is canceled.` : `Yes, there is. It leaves at ${fmtHora(e.horaActual)} from gate ${e.puerta}.`;
    return { texto: txt, clave: `haybus:${ciudad}`, dato: "existe", foco, describe: `si hay autobús a ${nombre}` };
  }
  const txt = e.estado === "departed" ? "No, it already left." : e.estado === "canceled" ? "No, it's canceled." : e.hayRetraso ? "No, it's delayed." : "Yes, it is.";
  return { texto: txt, clave: `sino:${ciudad}`, dato: "sino", foco, describe: "solo un sí o un no" };
}

/* ── Las necesidades de Lucy ─────────────────────────────────────────── */

export interface Necesidad {
  id: string;
  /** Lo que Lucy necesita saber, en español. */
  pide: string;
  claves: string[];
  dato: Dato;
  qwSugerida: string;
  icono: string;
  /** Ayuda de vocabulario (sin regalar la pregunta). */
  vocab: string;
  modelo: string;
  fichas: string[];
  /** A dónde camina Lucy al conseguir el dato. */
  camina?: { lugar: LugarId } | { gateDe: DestId };
}

export const NECESIDADES: Necesidad[] = [
  { id: "banos", pide: "dónde están los baños", claves: ["donde:restrooms"], dato: "lugar", qwSugerida: "Where", icono: "fa-restroom", vocab: "baños = restrooms (plural)", modelo: "Excuse me, where are the restrooms?", fichas: ["the restrooms", "the café"], camina: { lugar: "restrooms" } },
  { id: "horaVeracruz", pide: "a qué hora sale el autobús a Veracruz", claves: ["sale:veracruz"], dato: "hora", qwSugerida: "What time (o When)", icono: "fa-clock", vocab: "salir = leave · el autobús a Veracruz = the bus to Veracruz", modelo: "What time does the bus to Veracruz leave?", fichas: ["the bus to Veracruz", "leave", "leaves", "arrive"] },
  { id: "precioVeracruz", pide: "cuánto cuesta un boleto a Veracruz", claves: ["precio:veracruz"], dato: "precio", qwSugerida: "How much", icono: "fa-money-bill", vocab: "boleto = ticket", modelo: "How much is a ticket to Veracruz?", fichas: ["a ticket to Veracruz", "cost", "costs"], camina: { lugar: "tickets" } },
  { id: "gateOaxaca", pide: "de qué andén (gate) sale el autobús a Oaxaca", claves: ["anden:oaxaca"], dato: "anden", qwSugerida: "Which gate (o Where … from)", icono: "fa-door-open", vocab: "andén = gate · salir de = leave from", modelo: "Which gate does the bus to Oaxaca leave from?", fichas: ["which gate", "the bus to Oaxaca", "leave", "from"], camina: { gateDe: "oaxaca" } },
  { id: "duraOaxaca", pide: "cuánto dura el viaje a Oaxaca", claves: ["dura:oaxaca"], dato: "duracion", qwSugerida: "How long", icono: "fa-hourglass-half", vocab: "el viaje = the trip · tardar = take", modelo: "How long is the trip to Oaxaca?", fichas: ["the trip to Oaxaca", "take", "takes"] },
  { id: "cajero", pide: "si hay un cajero automático en la terminal", claves: ["hay:atm"], dato: "existe", qwSugerida: "Is there", icono: "fa-money-bill-wave", vocab: "cajero automático = ATM (se dice «an ATM»)", modelo: "Is there an ATM in the terminal?", fichas: ["an ATM", "in the terminal", "have"], camina: { lugar: "atm" } },
  { id: "cierraCafe", pide: "a qué hora cierra la cafetería", claves: ["cierra:cafe", "horario:cafe"], dato: "hora", qwSugerida: "What time (o When)", icono: "fa-mug-hot", vocab: "cerrar = close · abrir = open", modelo: "What time does the café close?", fichas: ["the café", "open", "close", "closes"], camina: { lugar: "cafe" } },
  { id: "diasObjetos", pide: "qué días abre la oficina de objetos perdidos (Lucy olvidó su gorra ayer)", claves: ["horario:lostfound"], dato: "dia", qwSugerida: "When (o What days)", icono: "fa-calendar-days", vocab: "objetos perdidos = lost and found office · abierto = open", modelo: "When is the lost and found office open?", fichas: ["the lost and found office", "open", "opens"], camina: { lugar: "lostfound" } },
  { id: "llegaGdl", pide: "a qué hora llega el autobús que viene de Guadalajara (ahí viene su amiga)", claves: ["llega:guadalajara"], dato: "hora", qwSugerida: "What time (o When)", icono: "fa-bus", vocab: "llegar = arrive · el autobús de Guadalajara = the bus from Guadalajara", modelo: "What time does the bus from Guadalajara arrive?", fichas: ["the bus from Guadalajara", "arrive", "arrives", "leave"] },
];

export const FICHAS_COMUNES = ["Excuse me,", "where", "what time", "when", "how much", "how long", "is there", "are there", "is", "are", "does", "do", "?"];

export const DATO_ES: Record<Dato, string> = {
  lugar: "un lugar (dónde está)",
  hora: "una hora",
  dia: "unos días (qué días abre)",
  precio: "un precio",
  duracion: "una duración",
  anden: "un andén (gate)",
  existe: "saber si existe",
  sino: "un sí o un no",
  otro: "otra cosa",
};

/** Compara lo que respondió Rosa con lo que Lucy necesita y explica el desajuste. */
export function evaluarNecesidad(n: Necesidad, i: Interpretacion, r: RespuestaEmpleada): { ok: boolean; msg: string } {
  if (n.claves.includes(r.clave)) {
    const extra =
      i.qw === "when" && n.dato === "hora"
        ? " (When también funciona; What time pide la hora exacta.)"
        : i.qw === "where" && n.dato === "anden"
          ? " (Where … from? también sirve; Which gate…? elige entre los andenes.)"
          : i.indirecta
            ? " Y con una pregunta indirecta muy cortés."
            : "";
    return { ok: true, msg: `¡Dato conseguido! Preguntaste con ${QW_EN[i.qw!]}, que pide ${QW_PIDE[i.qw!]}, y Rosa te dijo ${r.describe}.${extra}` };
  }
  const qw = i.qw!;
  if (r.dato === "sino") return { ok: false, msg: `Hiciste una pregunta de sí o no: Rosa solo puede contestar «${r.texto}». Lucy necesita ${DATO_ES[n.dato]}: usa ${n.qwSugerida}.` };
  if (r.clave === "nada" || r.clave === "nobus" || r.clave === "hay:no") return { ok: false, msg: `Rosa te dijo ${r.describe}. Lucy necesita saber ${n.pide}.` };
  if (r.dato === n.dato || (n.dato === "hora" && r.dato === "dia") || (n.dato === "dia" && r.dato === "hora")) {
    if (n.id === "cierraCafe" && r.clave === "abre:cafe") return { ok: false, msg: "Preguntaste a qué hora ABRE (open). Lucy necesita a qué hora CIERRA: close = cerrar." };
    if (n.id === "diasObjetos" && r.dato === "hora") return { ok: false, msg: `What time … open? pide solo la hora de apertura; Lucy necesita los DÍAS. Pregunta con When … open? (o What days … open?).` };
    if (r.clave.startsWith("llegadestino")) return { ok: false, msg: "Preguntaste a qué hora LLEGA a su destino (arrive). Lucy necesita a qué hora SALE de aquí: leave = salir." };
    if (r.clave.startsWith("saleorigen")) return { ok: false, msg: "Preguntaste a qué hora SALIÓ de Guadalajara (leave). Lucy necesita a qué hora LLEGA aquí: arrive = llegar." };
    if (r.clave.startsWith("sale:") && n.id === "llegaGdl") return { ok: false, msg: "Ese es un autobús que SALE hacia Guadalajara (the bus to…). Lucy espera el que VIENE de Guadalajara: the bus from Guadalajara." };
    return { ok: false, msg: `Buena pregunta, pero Rosa te dijo ${r.describe}. Lucy necesita saber ${n.pide}.` };
  }
  return { ok: false, msg: `Con «${QW_EN[qw]}» pediste ${QW_PIDE[qw]}, y eso te dio Rosa: ${r.describe}. Pero Lucy necesita ${DATO_ES[n.dato]}: pregunta con ${n.qwSugerida}.` };
}

/** Une fichas con espacios razonables («Excuse me, where are the restrooms?»). */
export function unirFichas(xs: string[]): string {
  const s = xs.reduce((acc, f) => (f === "?" ? `${acc.trimEnd()}?` : acc ? `${acc} ${f}` : f), "");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ════════════════════════════════════════════════════════════════════════
 * 5. MODO 2 — READ THE BOARD
 * ════════════════════════════════════════════════════════════════════════ */

export interface OpcionTab {
  texto: string;
  clave: string;
}

export interface PreguntaTablero {
  id: string;
  quien: string;
  texto: string;
  tablero: "salidas" | "llegadas";
  fila: DestId | OrigenId;
  opciones: OpcionTab[];
  /** Clave correcta según la hora del reloj. */
  correcta: (t: number) => string;
  /** Explicación leyendo el tablero en ese momento. */
  porque: (t: number) => string;
  /** Depende de un cambio en vivo que ya ocurrió. */
  enVivo: (t: number) => boolean;
}

const lineaSal = (id: DestId, t: number) => {
  const s = salida(id);
  const e = estadoSalida(s, t);
  return `En DEPARTURES, ${CIUDAD_EN[id]}: TIME ${fmtHora(s.hora)} · GATE ${e.cancel ? "–" : e.puerta} · REMARKS «${e.remarks}».`;
};
const lineaLl = (id: OrigenId, t: number) => {
  const l = llegadaDe(id);
  const e = estadoLlegada(l, t);
  return `En ARRIVALS, ${CIUDAD_EN[id]}: TIME ${fmtHora(l.hora)} · REMARKS «${e.remarks}».`;
};

function estadoClave(id: DestId, t: number): string {
  const e = estadoSalida(salida(id), t);
  return e.estado === "canceled" ? "cancel" : e.estado === "departed" ? "salio" : e.hayRetraso ? "retraso" : "si";
}

export const PREGUNTAS_TABLERO: PreguntaTablero[] = [
  {
    id: "horaPachuca",
    quien: "Mr. Walker",
    texto: "Excuse me, what time does the bus to Pachuca leave?",
    tablero: "salidas",
    fila: "pachuca",
    opciones: [
      { texto: "It leaves at 11:10.", clave: "prog" },
      { texto: "It leaves at 11:30.", clave: "nueva" },
      { texto: "It leaves from gate 1.", clave: "anden" },
      { texto: "Sorry, it already left.", clave: "salio" },
    ],
    correcta: (t) => {
      const e = estadoSalida(salida("pachuca"), t);
      return e.estado === "departed" ? "salio" : e.hayRetraso ? "nueva" : "prog";
    },
    porque: (t) => `${lineaSal("pachuca", t)} ${estadoSalida(salida("pachuca"), t).hayRetraso ? "«Delayed – 11:30» significa retrasado: la hora programada era 11:10, pero ahora sale a las 11:30." : "Sin retraso, la hora es la de la columna TIME."} «It leaves from gate 1» responde Where/Which, no What time.`,
    enVivo: (t) => estadoSalida(salida("pachuca"), t).hayRetraso,
  },
  {
    id: "gateOaxaca",
    quien: "Ms. Carter",
    texto: "Which gate does the bus to Oaxaca leave from?",
    tablero: "salidas",
    fila: "oaxaca",
    opciones: [
      { texto: "From gate 5.", clave: "g0" },
      { texto: "From gate 3.", clave: "g1" },
      { texto: "At 11:25.", clave: "hora" },
      { texto: "Sorry, it already left.", clave: "salio" },
    ],
    correcta: (t) => {
      const e = estadoSalida(salida("oaxaca"), t);
      return e.estado === "departed" ? "salio" : e.cambioPuerta ? "g1" : "g0";
    },
    porque: (t) => `${lineaSal("oaxaca", t)} ${estadoSalida(salida("oaxaca"), t).cambioPuerta ? "Hubo cambio de andén (gate changed): ahora sale del gate 3, ya no del 5." : "La columna GATE dice de qué andén sale."} «At 11:25» responde What time, no Which gate.`,
    enVivo: (t) => estadoSalida(salida("oaxaca"), t).cambioPuerta,
  },
  {
    id: "estadoToluca",
    quien: "Kenji",
    texto: "Is the bus to Toluca on time?",
    tablero: "salidas",
    fila: "toluca",
    opciones: [
      { texto: "Yes, it is.", clave: "si" },
      { texto: "No, it isn't. It's delayed.", clave: "retraso" },
      { texto: "No, it isn't. It's canceled.", clave: "cancel" },
      { texto: "It already left.", clave: "salio" },
    ],
    correcta: (t) => estadoClave("toluca", t),
    porque: (t) => `${lineaSal("toluca", t)} On time = a tiempo; Delayed = retrasado; Canceled = cancelado; Departed = ya salió. A «Is…?» se responde Yes, it is / No, it isn't.`,
    enVivo: (t) => estadoSalida(salida("toluca"), t).cancel,
  },
  {
    id: "estadoPuebla",
    quien: "Amelia",
    texto: "Excuse me, is the bus to Puebla still here?",
    tablero: "salidas",
    fila: "puebla",
    opciones: [
      { texto: "Yes, it is. It's boarding at gate 2.", clave: "si" },
      { texto: "No, it isn't. It already left.", clave: "salio" },
      { texto: "No, it isn't. It's canceled.", clave: "cancel" },
    ],
    correcta: (t) => (estadoSalida(salida("puebla"), t).estado === "departed" ? "salio" : "si"),
    porque: (t) => `${lineaSal("puebla", t)} Boarding = abordando (todavía está en el andén); Departed = ya salió.`,
    enVivo: () => false,
  },
  {
    id: "llegaVeracruz",
    quien: "Tom",
    texto: "What time does the bus from Veracruz arrive?",
    tablero: "llegadas",
    fila: "veracruz",
    opciones: [
      { texto: "At 11:05.", clave: "prog" },
      { texto: "At 11:40.", clave: "otra" },
      { texto: "It already arrived.", clave: "llego" },
      { texto: "From gate 6.", clave: "anden" },
    ],
    correcta: (t) => (estadoLlegada(llegadaDe("veracruz"), t).estado === "arrived" ? "llego" : "prog"),
    porque: (t) => `${lineaLl("veracruz", t)} Cuidado: 11:40 es la SALIDA del autobús a Veracruz (the bus TO Veracruz); Tom espera el que viene DE Veracruz (the bus FROM Veracruz), que está en ARRIVALS.`,
    enVivo: () => false,
  },
  {
    id: "llegaCuernavaca",
    quien: "Priya",
    texto: "What time does the bus from Cuernavaca arrive?",
    tablero: "llegadas",
    fila: "cuernavaca",
    opciones: [
      { texto: "At 10:50.", clave: "prog" },
      { texto: "At 11:15.", clave: "nueva" },
      { texto: "It already arrived.", clave: "llego" },
      { texto: "It's canceled.", clave: "cancel" },
    ],
    correcta: (t) => {
      const e = estadoLlegada(llegadaDe("cuernavaca"), t);
      return e.estado === "arrived" ? "llego" : e.hayRetraso ? "nueva" : "prog";
    },
    porque: (t) => `${lineaLl("cuernavaca", t)} ${estadoLlegada(llegadaDe("cuernavaca"), t).hayRetraso ? "Delayed – 11:15: llega 25 minutos tarde." : "Sin retraso, la hora es la de TIME."}`,
    enVivo: (t) => estadoLlegada(llegadaDe("cuernavaca"), t).hayRetraso,
  },
  {
    id: "cualQueretaro",
    quien: "Ms. Lee",
    texto: "Which bus leaves at 10:55?",
    tablero: "salidas",
    fila: "queretaro",
    opciones: [
      { texto: "The bus to Querétaro.", clave: "q" },
      { texto: "The bus to Puebla.", clave: "p" },
      { texto: "The bus to Pachuca.", clave: "pa" },
    ],
    correcta: () => "q",
    porque: (t) => `${lineaSal("queretaro", t)} Which pide elegir uno entre varios: busca 10:55 en la columna TIME y lee DESTINATION.`,
    enVivo: () => false,
  },
  {
    id: "hayGdl",
    quien: "Mr. Johnson",
    texto: "Is there a bus to Guadalajara before 12:30?",
    tablero: "salidas",
    fila: "guadalajara",
    opciones: [
      { texto: "Yes, there is. It leaves at 12:15.", clave: "si" },
      { texto: "No, there isn't. It leaves at 12:30.", clave: "no" },
      { texto: "Yes, there are two.", clave: "dos" },
    ],
    correcta: (t) => (estadoSalida(salida("guadalajara"), t).hayRetraso ? "no" : "si"),
    porque: (t) => `${lineaSal("guadalajara", t)} ${estadoSalida(salida("guadalajara"), t).hayRetraso ? "Con el retraso sale a las 12:30, y 12:30 no es ANTES de las 12:30." : "Sale a las 12:15, antes de las 12:30."} A «Is there…?» se responde Yes, there is / No, there isn't.`,
    enVivo: (t) => estadoSalida(salida("guadalajara"), t).hayRetraso,
  },
  {
    id: "hayToluca",
    quien: "Sophie",
    texto: "Is there a bus to Toluca this morning?",
    tablero: "salidas",
    fila: "toluca",
    opciones: [
      { texto: "Yes, there is. It leaves at 11:45.", clave: "si" },
      { texto: "No, there isn't. It's canceled.", clave: "cancel" },
      { texto: "Yes, at gate 4.", clave: "g" },
    ],
    correcta: (t) => (estadoSalida(salida("toluca"), t).cancel ? "cancel" : "si"),
    porque: (t) => `${lineaSal("toluca", t)} ${estadoSalida(salida("toluca"), t).cancel ? "Canceled = cancelado: ya no hay autobús a Toluca esta mañana." : "Hay uno a las 11:45, del gate 2 (no del 4)."}`,
    enVivo: (t) => estadoSalida(salida("toluca"), t).cancel,
  },
  {
    id: "abordaQro",
    quien: "Daniel",
    texto: "Excuse me, is the bus to Querétaro boarding?",
    tablero: "salidas",
    fila: "queretaro",
    opciones: [
      { texto: "Yes, it is. Go to gate 4.", clave: "si" },
      { texto: "No, it isn't. Boarding starts at 10:40.", clave: "no" },
      { texto: "No, it already left.", clave: "salio" },
    ],
    correcta: (t) => {
      const e = estadoSalida(salida("queretaro"), t);
      return e.estado === "departed" ? "salio" : e.estado === "boarding" ? "si" : "no";
    },
    porque: (t) => `${lineaSal("queretaro", t)} Boarding = abordando: empieza 15 minutos antes de la salida (10:40 para el de 10:55).`,
    enVivo: () => false,
  },
  {
    id: "estadoGdl",
    quien: "Grace",
    texto: "Is the bus to Guadalajara on time?",
    tablero: "salidas",
    fila: "guadalajara",
    opciones: [
      { texto: "Yes, it is.", clave: "si" },
      { texto: "No, it isn't. It's delayed.", clave: "retraso" },
      { texto: "No, it isn't. It's canceled.", clave: "cancel" },
      { texto: "It already left.", clave: "salio" },
    ],
    correcta: (t) => estadoClave("guadalajara", t),
    porque: (t) => `${lineaSal("guadalajara", t)} Lee la columna REMARKS: On time, Delayed, Boarding, Departed o Canceled.`,
    enVivo: (t) => estadoSalida(salida("guadalajara"), t).hayRetraso,
  },
];

/** Ronda de 6 preguntas: al menos una de llegadas y al menos tres que cambian con el reloj. */
export function rondaTablero(rnd: () => number): PreguntaTablero[] {
  const vivas = ["horaPachuca", "gateOaxaca", "estadoToluca", "llegaCuernavaca", "hayGdl", "hayToluca", "estadoGdl"];
  const llegadas = PREGUNTAS_TABLERO.filter((p) => p.tablero === "llegadas");
  for (let intento = 0; intento < 50; intento++) {
    const r = barajar(PREGUNTAS_TABLERO, rnd).slice(0, 6);
    const filas = new Set(r.map((p) => p.fila + p.tablero));
    if (r.some((p) => llegadas.includes(p)) && r.filter((p) => vivas.includes(p.id)).length >= 3 && filas.size >= 5) {
      return r.map((p) => ({ ...p, opciones: barajar(p.opciones, rnd) }));
    }
  }
  return PREGUNTAS_TABLERO.slice(0, 6);
}

/* ════════════════════════════════════════════════════════════════════════
 * 6. MODO 3 — INFO DESK: tú respondes
 * ════════════════════════════════════════════════════════════════════════ */

export type TipoVisita = "lugar" | "hora" | "dia" | "existe" | "anden" | "precio" | "duracion";

export interface Visitante {
  id: string;
  nombre: string;
  color: string;
  pregunta: string;
  tipo: TipoVisita;
  lugar?: LugarId;
  destino?: DestId;
  plural?: boolean;
  /** Pista en español, sin la respuesta. */
  pista: string;
  camina: { lugar: LugarId } | { gateDe: DestId };
}

export const VISITANTES: Visitante[] = [
  { id: "v1", nombre: "Ms. Carter", color: "#f472b6", pregunta: "Excuse me, where are the restrooms?", tipo: "lugar", lugar: "restrooms", plural: true, pista: "Búscalos en el plano y usa una preposición de lugar: next to, between, across from… Restrooms es plural.", camina: { lugar: "restrooms" } },
  { id: "v2", nombre: "Kenji", color: "#34d399", pregunta: "Hi! What time does the bus to Veracruz leave?", tipo: "hora", destino: "veracruz", pista: "Lee la pantalla de salidas del módulo. Para una hora específica se usa at.", camina: { gateDe: "veracruz" } },
  { id: "v3", nombre: "Mr. Walker", color: "#fbbf24", pregunta: "Is there a pharmacy in the terminal?", tipo: "existe", lugar: "pharmacy", plural: false, pista: "A «Is there…?» se responde con there is / there isn't. Si quieres, agrega dónde está.", camina: { lugar: "pharmacy" } },
  { id: "v4", nombre: "Amelia", color: "#c084fc", pregunta: "When is the lost and found office open?", tipo: "dia", lugar: "lostfound", pista: "Revisa la hoja de servicios: ¿qué días abre?", camina: { lugar: "lostfound" } },
  { id: "v5", nombre: "Tom", color: "#60a5fa", pregunta: "Which gate does the bus to Oaxaca leave from?", tipo: "anden", destino: "oaxaca", pista: "Mira la columna GATE de la pantalla (¡puede cambiar!).", camina: { gateDe: "oaxaca" } },
  { id: "v6", nombre: "Priya", color: "#fb7185", pregunta: "How much is a ticket to Pachuca?", tipo: "precio", destino: "pachuca", pista: "Revisa la lista de precios de la hoja.", camina: { lugar: "tickets" } },
  { id: "v7", nombre: "Daniel", color: "#2dd4bf", pregunta: "How long is the trip to Querétaro?", tipo: "duracion", destino: "queretaro", pista: "Revisa los tiempos de viaje de la hoja. Se responde con It takes about…", camina: { gateDe: "queretaro" } },
  { id: "v8", nombre: "Sophie", color: "#fdba74", pregunta: "Are there any lockers for my luggage?", tipo: "existe", lugar: "luggage", plural: true, pista: "Lockers es plural: there are / there aren't. Si quieres, agrega dónde están.", camina: { lugar: "luggage" } },
];

export interface Veredicto {
  ok: boolean;
  msg: string;
  usaAt?: boolean;
  usaPrep?: boolean;
  /** Oración completa (con sujeto y verbo), no solo la frase corta. */
  completa?: boolean;
}

const PREP_RE = /\b(next to|near|close to|in front of|behind|between|across from|opposite|beside|on the (?:left|right)(?: side)?|to the (?:left|right))\b/;

const REF_PATRONES: { id: LugarId; re: RegExp }[] = [
  { id: "tickets", re: /\b(ticket offices?|ticket counters?|ticket windows?|box office|tickets)\b/ },
  { id: "lostfound", re: /\b(lost and found(?: office)?|lost property)\b/ },
  { id: "luggage", re: /\b(luggage storage|baggage storage|left luggage|lockers?)\b/ },
  { id: "restrooms", re: /\b(restrooms?|bathrooms?|toilets?)\b/ },
  { id: "cafe", re: /\b(cafeteria|cafe|coffee shop)\b/ },
  { id: "atm", re: /\b(atm|cash machine)\b/ },
  { id: "pharmacy", re: /\b(pharmacy|drugstore)\b/ },
  { id: "exit", re: /\b(exit|taxi stand|taxis)\b/ },
  { id: "info", re: /\b(information desk|info desk|information)\b/ },
  { id: "waiting", re: /\b(waiting (?:area|room))\b/ },
  { id: "gates", re: /\b(gates?)\b/ },
  { id: "entrance", re: /\b(main entrance|entrance)\b/ },
];

export function referentesEn(s: string): LugarId[] {
  const hits: { id: LugarId; i: number }[] = [];
  let resto = s;
  for (const p of REF_PATRONES) {
    const m = p.re.exec(resto);
    if (m) {
      hits.push({ id: p.id, i: m.index });
      resto = resto.slice(0, m.index) + " ".repeat(m[0].length) + resto.slice(m.index + m[0].length);
    }
  }
  return hits.sort((a, b) => a.i - b.i).map((h) => h.id);
}

function prepCanon(p: string): Prep | "lado" {
  if (p === "next to" || p === "beside") return "next";
  if (p === "near" || p === "close to") return "near";
  if (p === "between") return "between";
  if (p === "across from" || p === "opposite") return "across";
  if (p === "in front of") return "front";
  if (p === "behind") return "behind";
  return "lado";
}

/** Ubicación en una respuesta: preposición + referentes, y si es verdadera. */
function evaluaUbicacion(id: LugarId, s: string): { hay: boolean; ok: boolean; msg: string } {
  const m = PREP_RE.exec(s);
  if (!m) return { hay: false, ok: false, msg: "" };
  const prep = prepCanon(m[1]!);
  const l = lugar(id);
  if (prep === "lado") return { hay: true, ok: false, msg: "Left y right dependen de hacia dónde mire la persona. Mejor usa una referencia fija: next to, between, across from…" };
  const refs = referentesEn(s.slice(m.index + m[0].length)).filter((r) => r !== id);
  if (prep === "between" && refs.length < 2) return { hay: true, ok: false, msg: "Between necesita DOS lugares: between the … and the …" };
  if (refs.length === 0) return { hay: true, ok: false, msg: `¿${PREP_EN[prep]} qué? Nombra el lugar de referencia (the café, the ATM…).` };
  if (!relacionVerdadera(id, prep, refs)) {
    const dicho = prep === "between" ? `between ${conArticulo(refs[0]!, false)} and ${conArticulo(refs[1]!, false)}` : `${PREP_EN[prep]} ${conArticulo(refs[0]!, false)}`;
    return { hay: true, ok: false, msg: `Mira el plano: ${l.es} no ${l.plural ? "están" : "está"} «${dicho}» (${PREP_EN[prep]} = ${PREP_ES[prep]}). Busca ${l.plural ? "los" : "el"} ${l.plural ? l.enPl : l.en} en la escena y fíjate qué tiene${l.plural ? "n" : ""} a los lados.` };
  }
  return { hay: true, ok: true, msg: "" };
}

const AT_HORA = /\bat (?:about |around )?(?:\d|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|half|a quarter|quarter|noon|midnight)/;

export function evaluarRespuesta(v: Visitante, texto: string, t: number): Veredicto {
  const s = normalizaEn(texto);
  if (!s) return { ok: false, msg: "Escribe tu respuesta en inglés." };
  if (/…|\.\.\./.test(texto)) return { ok: false, msg: "Cambia los puntos suspensivos (…) por el dato." };
  if (pareceEspanol(s)) return { ok: false, msg: "Respóndele en inglés: la persona no habla español." };

  if (v.tipo === "lugar") {
    const id = v.lugar!;
    const l = lugar(id);
    const u = evaluaUbicacion(id, s);
    if (!u.hay) {
      const ref = referentesEn(s).filter((r) => r !== id);
      if (ref.length) return { ok: false, msg: "Falta la preposición de lugar: ¿junto a, entre, enfrente de…? Usa next to, between, across from, near…" };
      return { ok: false, msg: `Di dónde ${l.plural ? "están" : "está"}: ${l.plural ? "They're" : "It's"} + preposición de lugar + lugar de referencia.` };
    }
    if (!u.ok) return { ok: false, msg: u.msg };
    const antes = s.slice(0, PREP_RE.exec(s)!.index).replace(/^(?:yes|sure|of course|ok|okay|well|oh)\s+/, "").trim();
    if (antes === "") return { ok: true, usaPrep: true, completa: false, msg: `¡Correcto! Respuesta corta válida. La oración completa sería: «${l.plural ? "They're" : "It's"} ${s}.»` };
    const sm = antes.match(/^(it|they|the [a-z ]+?|you can find (?:it|them)|you will find (?:it|them)|you can see (?:it|them))(?: (is|are))?$/);
    if (!sm) return { ok: false, msg: `Empieza con sujeto y verbo: ${l.plural ? "They're (They are)" : "It's (It is)"} + preposición… o da solo la frase corta.` };
    const suj = sm[1]!;
    const be = sm[2];
    if (/^you /.test(suj)) return { ok: true, usaPrep: true, completa: true, msg: "¡Correcto y muy natural!" };
    const sujPlural = suj === "they" || (suj.startsWith("the ") && /s$/.test(suj));
    if (!be) return { ok: false, msg: `Falta el verbo: ${suj === "it" ? "It is (It's)" : suj === "they" ? "They are (They're)" : `${cap(suj)} ${sujPlural ? "are" : "is"}`} + preposición. Sin verbo no es oración.` };
    if (l.plural && suj === "it") return { ok: false, msg: "Restrooms es plural: se responde They're (They are), no It's." };
    if (!l.plural && suj === "they") return { ok: false, msg: `Es singular: se responde It's (It is), no They're.` };
    if (sujPlural && be === "is") return { ok: false, msg: `«${suj}» es plural: are, no is.` };
    if (!sujPlural && be === "are") return { ok: false, msg: `«${suj}» es singular: is, no are.` };
    return { ok: true, usaPrep: true, completa: true, msg: "¡Correcto! Sujeto, verbo y preposición de lugar, y es verdad en el plano." };
  }

  if (v.tipo === "hora") {
    const s0 = salida(v.destino!);
    const e = estadoSalida(s0, t);
    if (e.estado === "canceled") return /cancel/.test(s) ? { ok: true, msg: "¡Correcto! El tablero dice Canceled." } : { ok: false, msg: `Mira la pantalla: el autobús a ${CIUDAD_EN[s0.id]} dice Canceled.` };
    if (e.estado === "departed") return /\b(left|departed|gone)\b/.test(s) ? { ok: true, msg: "¡Correcto! Ya salió (Departed)." } : { ok: false, msg: `Mira la pantalla: el autobús a ${CIUDAD_EN[s0.id]} dice Departed (ya salió). Puedes decir: «Sorry, it already left.»` };
    const hs = horasEn(s);
    if (hs.length === 0) return { ok: false, msg: "Da la hora con números o palabras: It leaves at …" };
    const h = hs[0]!;
    if (!mismaHora(h, e.horaActual)) {
      if (e.hayRetraso && mismaHora(h, s0.hora)) return { ok: false, msg: "Esa es la hora programada, pero la pantalla dice Delayed: da la hora nueva." };
      return { ok: false, msg: `Esa hora no coincide con la pantalla. Busca ${CIUDAD_EN[s0.id]} en DESTINATION y lee su hora.` };
    }
    if (/\b(?:in|on) (?:\d|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)/.test(s) && !AT_HORA.test(s)) return { ok: false, msg: "Para una hora específica se usa at, no in ni on: at 11:40 (A1)." };
    if (!AT_HORA.test(s)) return { ok: false, msg: "La hora es correcta, pero con una hora específica se usa at: «It leaves at …» (A1: at para horas)." };
    if (/\b(?:it|the bus) (?:leave|depart)\b/.test(s)) return { ok: false, msg: "Con it / the bus el verbo lleva -s en presente: It leaves at…" };
    if (/\bit is (?:leave|leaves|depart)/.test(s)) return { ok: false, msg: "No mezcles is con leave: «It leaves at …» o «It's at …»." };
    const completa = /\b(it|the bus)\b/.test(s);
    return { ok: true, usaAt: true, completa, msg: completa ? "¡Correcto! Hora de la pantalla y at para la hora." : "¡Correcto! Respuesta corta con at. Completa: «It leaves at …»." };
  }

  if (v.tipo === "dia") {
    if (/\bin (?:monday|tuesday|wednesday|thursday|friday|weekdays)\b/.test(s)) return { ok: false, msg: "Con días se usa on (on Monday), no in (A1: on para días)." };
    const lunVie = /\bmonday\b.*\bfriday\b/.test(s) || /\bweekdays?\b/.test(s);
    if (/\b(saturday|sunday|weekends?|every day|everyday|daily|24 hours|all week)\b/.test(s)) return { ok: false, msg: "Revisa la hoja de servicios: los fines de semana esa oficina está cerrada." };
    if (!lunVie) return { ok: false, msg: "Faltan los días. Revisa la hoja de servicios: ¿de qué día a qué día abre?" };
    const hs = horasEn(s);
    const serv = SERVICIOS.lostfound!;
    if (hs.length && !hs.every((h) => mismaHora(h, serv.abre!) || mismaHora(h, serv.cierra!))) return { ok: false, msg: "Los días están bien, pero el horario no coincide con la hoja." };
    if (/\bit open\b/.test(s)) return { ok: false, msg: "Falta el verbo: It's open (It is open) Monday to Friday." };
    return { ok: true, completa: /\bit is open|\bit opens\b/.test(s), msg: "¡Correcto! Monday to Friday (de lunes a viernes). Con un solo día usarías on: on Monday." };
  }

  if (v.tipo === "existe") {
    const id = v.lugar!;
    const pl = !!v.plural;
    const r = s.replace(/^(?:yes|yeah|yep|sure|of course)\s+/, "si ");
    if (/^no\b/.test(s)) return { ok: false, msg: `Revisa el plano: sí ${pl ? "hay" : "hay una"}. Búscal${pl ? "os" : "a"} en la escena.` };
    if (/^(?:yes|yeah|yep|sure|of course)$/.test(s)) return { ok: false, msg: `Completa la respuesta corta: «Yes, there ${pl ? "are" : "is"}.»` };
    if (/^si (?:it is|they are)\b/.test(r) || /^(?:it is|they are)\b/.test(s)) return { ok: false, msg: `A «${pl ? "Are there" : "Is there"}…?» se responde con there: «Yes, there ${pl ? "are" : "is"}.» (no «Yes, ${pl ? "they are" : "it is"}»).` };
    const siThere = /^(?:si )?there (is|are)\b/.exec(r);
    if (!siThere) return { ok: false, msg: `Empieza con la respuesta corta: «Yes, there ${pl ? "are" : "is"}.» y, si quieres, di dónde ${pl ? "están" : "está"}.` };
    if (pl && siThere[1] === "is") return { ok: false, msg: "Lockers es plural: Yes, there are (no there is)." };
    if (!pl && siThere[1] === "are") return { ok: false, msg: "Pharmacy es singular: Yes, there is (no there are)." };
    const u = evaluaUbicacion(id, s);
    if (u.hay && !u.ok) return { ok: false, msg: `La respuesta corta está bien, pero la ubicación no: ${u.msg}` };
    return { ok: true, usaPrep: u.hay, completa: true, msg: u.hay ? "¡Excelente! Respuesta corta con there y ubicación correcta." : `¡Correcto! «Yes, there ${pl ? "are" : "is"}.» Puedes agregar dónde con una preposición de lugar.` };
  }

  if (v.tipo === "anden") {
    const s0 = salida(v.destino!);
    const e = estadoSalida(s0, t);
    if (e.estado === "canceled") return /cancel/.test(s) ? { ok: true, msg: "¡Correcto! Está cancelado." } : { ok: false, msg: "Mira la pantalla: está Canceled." };
    const m = /\b(?:gate|platform|bay|number) (\d|one|two|three|four|five|six)\b/.exec(s);
    if (!m) return { ok: false, msg: "Di el número de andén: from gate …" };
    const g = /\d/.test(m[1]!) ? Number(m[1]) : NUM_W[m[1]!]!;
    if (g !== e.puerta) {
      if (e.cambioPuerta && g === s0.puerta) return { ok: false, msg: "¡Ojo! La pantalla dice Gate changed: el andén cambió. Lee otra vez la columna GATE." };
      return { ok: false, msg: `Ese andén no coincide con la pantalla. Busca ${CIUDAD_EN[s0.id]} y lee la columna GATE.` };
    }
    if (/\bin gate\b/.test(s)) return { ok: false, msg: "Con gate se usa from o at: «It leaves from gate …» / «At gate …»." };
    if (e.estado === "departed") return { ok: true, msg: "El andén es correcto, aunque la pantalla ya dice Departed: podrías avisar «Sorry, it already left.»" };
    return { ok: true, completa: /\bit\b/.test(s), msg: e.cambioPuerta ? "¡Correcto! Leíste el cambio de andén." : "¡Correcto! From gate … = sale del andén …" };
  }

  if (v.tipo === "precio") {
    const s0 = salida(v.destino!);
    if (/\b(dollars?|usd)\b/.test(s)) return { ok: false, msg: "En México el precio está en pesos: … pesos." };
    const nums = numerosEn(s).filter((n) => n >= 10);
    if (nums.length === 0) return { ok: false, msg: "Di el precio: It's … pesos." };
    if (!nums.includes(s0.precio)) return { ok: false, msg: `Ese precio no coincide con la hoja. Busca ${CIUDAD_EN[s0.id]} en la lista de precios.` };
    if (/\bit cost\b/.test(s)) return { ok: false, msg: "Con it el verbo lleva -s: It costs … pesos (o It's … pesos)." };
    if (/\bit is cost/.test(s)) return { ok: false, msg: "No mezcles is con cost: «It's … pesos» o «It costs … pesos»." };
    return { ok: true, completa: /\b(it|a ticket|the ticket)\b/.test(s), msg: "¡Correcto! How much pide un precio: It's / It costs … pesos." };
  }

  // duración
  const s0 = salida(v.destino!);
  const d = duracionMin(s);
  if (d === null) return { ok: false, msg: "Di cuánto tiempo: It takes about … hours." };
  if (Math.abs(d - s0.duracion) > 15) return { ok: false, msg: `Esa duración no coincide con la hoja de tiempos de viaje (${CIUDAD_EN[s0.id]}).` };
  if (/\bit take\b/.test(s)) return { ok: false, msg: "Con it el verbo lleva -s: It takes about … (tardar = take)." };
  return { ok: true, completa: /\b(it|the trip)\b/.test(s), msg: "¡Correcto! How long pide una duración: It takes about …" };
}

/** Frases de apoyo para el módulo (el alumno cambia «…» por el dato). */
export const FRASES_APOYO = ["It's next to the …", "They're between the … and the …", "It leaves at …", "It's open from … to …", "Yes, there is.", "Yes, there are.", "It leaves from gate …", "It's … pesos.", "It takes about … hours."];

/* ════════════════════════════════════════════════════════════════════════
 * 7. TARJETA DE ESTRELLAS — ¿Qué se preguntó?
 * ════════════════════════════════════════════════════════════════════════ */

export type BotonQw = "where" | "whattime" | "when" | "howmuch" | "howlong" | "which" | "isthere";
export const BOTONES_QW: BotonQw[] = ["where", "whattime", "when", "howmuch", "howlong", "which", "isthere"];

export interface ItemEstrella {
  respuesta: string;
  acepta: BotonQw[];
  porque: string;
}

export const ITEMS_ESTRELLA: ItemEstrella[] = [
  { respuesta: "They're next to the café.", acepta: ["where"], porque: "Da un lugar con una preposición (next to): la pregunta fue Where…?" },
  { respuesta: "It's between the ATM and the lost and found office.", acepta: ["where"], porque: "Between … and … ubica un lugar: responde Where…?" },
  { respuesta: "From gate 3.", acepta: ["which", "where"], porque: "Un andén: Which gate…? (o Where does it leave from?)." },
  { respuesta: "At 11:40.", acepta: ["whattime", "when"], porque: "At + hora: What time…? (When también pide un momento)." },
  { respuesta: "It closes at 10:00 p.m.", acepta: ["whattime", "when"], porque: "Una hora de cierre: What time does it close?" },
  { respuesta: "It's open Monday to Friday.", acepta: ["when"], porque: "Días, no una hora exacta: When is it open? What time no pide días." },
  { respuesta: "The exam is on Monday.", acepta: ["when"], porque: "On + día (A1): When is the exam?" },
  { respuesta: "The holiday is in December.", acepta: ["when"], porque: "In + mes (A1): When is the holiday?" },
  { respuesta: "It's 780 pesos.", acepta: ["howmuch"], porque: "Un precio: How much is it?" },
  { respuesta: "They cost 5 pesos.", acepta: ["howmuch"], porque: "Cost + cantidad: How much do they cost?" },
  { respuesta: "It takes about three hours.", acepta: ["howlong"], porque: "Una duración (take): How long does it take?" },
  { respuesta: "About an hour and a half.", acepta: ["howlong"], porque: "Cuánto tiempo: How long is the trip?" },
  { respuesta: "Yes, there is. It's next to the ticket office.", acepta: ["isthere"], porque: "«Yes, there is» responde Is there…?" },
  { respuesta: "No, there aren't any lockers here.", acepta: ["isthere"], porque: "«There aren't any» responde Are there any…?" },
  { respuesta: "The bus to Pachuca.", acepta: ["which"], porque: "Elige un autobús entre varios: Which bus…?" },
  { respuesta: "It's 10:30.", acepta: ["whattime"], porque: "La hora actual: What time is it?" },
];

export const BOTON_EN: Record<BotonQw, string> = { where: "Where", whattime: "What time", when: "When", howmuch: "How much", howlong: "How long", which: "Which", isthere: "Is there / Are there" };

export function rondaEstrellas(rnd: () => number): ItemEstrella[] {
  return barajar(ITEMS_ESTRELLA, rnd).slice(0, 8);
}

/* ════════════════════════════════════════════════════════════════════════
 * 8. CONTENIDO VERBATIM (IN-I-P05)
 * ════════════════════════════════════════════════════════════════════════ */

export const TITULO_A1 = "Where and when? — Preguntas sencillas en inglés";

/** Lectura A1 — verbatim (un párrafo por renglón). */
export const LECTURA_A1: string[] = [
  "Hacer preguntas en inglés requiere conocer las palabras interrogativas (question words) y la estructura correcta. Las principales son:",
  "• Where (dónde): \"Where is the library?\" (¿Dónde está la biblioteca?)",
  "• When (cuándo): \"When does the class start?\" (¿Cuándo empieza la clase?)",
  "• What time (a qué hora): \"What time is it?\" (¿Qué hora es?)",
  "Para preguntar la ubicación, usamos el verbo \"to be\": \"Where is [lugar]?\" y respondemos con preposiciones: \"It is next to / near / in front of / behind / between / on the corner of...\" (Está al lado de / cerca de / enfrente de / detrás de / entre / en la esquina de...).",
  "Para hablar de horarios, usamos \"at\" para horas específicas (\"The class is at 9 o'clock\"), \"on\" para días (\"The exam is on Monday\") y \"in\" para meses y años (\"The holiday is in December\"). Las horas se pueden decir como \"nine o'clock\", \"nine fifteen\", \"nine thirty\" o \"half past nine\".",
  "Ejemplos de preguntas cotidianas: \"Excuse me, where is the bathroom?\" (Disculpe, ¿dónde está el baño?), \"What time does the store close?\" (¿A qué hora cierra la tienda?), \"Is there a pharmacy near here?\" (¿Hay una farmacia cerca de aquí?).",
];

/** Preguntas de comprensión de la lectura A1 con su respuesta guía — verbatim. */
export const PREGUNTAS_A1: { pregunta: string; guia: string }[] = [
  { pregunta: "¿Qué preposición usas para decir una hora específica en inglés?", guia: "'at': The class is at 9 o'clock." },
  { pregunta: "¿Cómo preguntas dónde está la biblioteca?", guia: "Where is the library?" },
  { pregunta: "¿Cómo dices 'nueve y media' en inglés?", guia: "Nine thirty / Half past nine." },
];

/** Verdadero/falso A5 — verbatim. */
export const HECHOS_A5: { enunciado: string; respuesta: boolean; retro: string }[] = [
  { enunciado: "'at' se usa para horas específicas (at 8 am).", respuesta: true, retro: "Correcto." },
  { enunciado: "'When' pregunta por un lugar.", respuesta: false, retro: "'When' pregunta por tiempo; 'Where' por lugar." },
  { enunciado: "'on' se usa para días de la semana.", respuesta: true, retro: "Sí: on Monday, on Friday." },
  { enunciado: "'in front of' significa 'detrás de'.", respuesta: false, retro: "'in front of' = enfrente de; 'behind' = detrás de." },
];

/** Glosario A6 — verbatim. */
export const GLOSARIO: { termino: string; definicion: string; ejemplo: string }[] = [
  { termino: "Where", definicion: "Palabra interrogativa para lugar (dónde).", ejemplo: "Where is the bathroom?" },
  { termino: "When / What time", definicion: "Palabras para preguntar tiempo (cuándo / a qué hora).", ejemplo: "What time is it?" },
  { termino: "at / on / in", definicion: "Preposiciones de tiempo: at (hora), on (día), in (mes/año).", ejemplo: "at 8 am, on Monday, in December." },
  { termino: "next to / near", definicion: "Preposiciones de lugar: al lado de / cerca de.", ejemplo: "It is next to the gym." },
  { termino: "in front of / behind", definicion: "Enfrente de / detrás de.", ejemplo: "The car is in front of the house." },
  { termino: "Excuse me", definicion: "Frase cortés para iniciar una pregunta a un desconocido.", ejemplo: "Excuse me, where is the library?" },
];
export const ACTIVIDAD_A6 = "Escribe 3 preguntas con Where, When y What time, con sus respuestas.";

/** Escritura A3 — verbatim. */
export const A3 = {
  titulo: "Pregunto y respondo en inglés",
  prompt:
    "Escribe un mini-diálogo en inglés donde preguntas cómo llegar a un lugar y qué horario tiene. Usa al menos 3 preguntas con Where, When y What time. Luego reflexiona en español: ¿qué tan útil te parece saber hacer estas preguntas en inglés? ¿En qué situaciones reales de tu vida o de tu comunidad te serviría?",
  pistas: ["Usa: Excuse me, where is...? / What time does...open/close? / When is...?", "Responde con preposiciones: next to / near / in front of / on the corner", "Piensa en situaciones de turismo, trabajo, trámites"],
};

/** Autoevaluación A7 — criterios verbatim. */
export const AUTOEVALUACION_A7: string[] = ["Puedo preguntar dónde está un lugar.", "Puedo preguntar la hora y los horarios.", "Uso correctamente at / on / in con el tiempo.", "Uso preposiciones de lugar (next to, near, in front of)."];
export const REFLEXION_A7 = "¿En qué lugar de tu comunidad te serviría preguntar ubicaciones en inglés?";

/** Pregunta abierta del video A8 — verbatim. */
export const ABIERTA_A8 = "¿Qué pregunta harías en inglés para saber dónde queda la biblioteca de tu escuela?";

export const FUENTE = "CEN Bachillerato — UAC Inglés I, progresión 5: lectura A1, texto A2, escritura A3, quiz A4, verdadero/falso A5, glosario A6, autoevaluación A7 y preguntas del video A8.";

export const PROBLEMA =
  "Lucy acaba de llegar a la Central Valle Verde y no conoce la terminal. Necesita datos concretos: dónde están los baños, a qué hora sale su autobús, cuánto cuesta el boleto. En inglés, cada dato se pide con su palabra interrogativa: si preguntas «Where» cuando necesitas una hora, te darán un lugar. Aquí pides información, lees un tablero que cambia en vivo y, al final, tú atiendes el módulo de información.";

export const INSTRUCCIONES: string[] = [
  "En Ask the right question elige qué necesita Lucy y escribe la pregunta en inglés (o ármala con fichas). Rosa, la empleada, solo responde si la pregunta está bien hecha, y responde exactamente lo que preguntaste.",
  "En Read the board pon a correr el reloj y responde a los viajeros leyendo DEPARTURES y ARRIVALS. El tablero cambia en vivo: retrasos, cambios de andén y cancelaciones.",
  "En Info desk tú eres quien atiende: lee la pregunta de cada visitante, busca el dato en el plano 3D o en la hoja del módulo y escribe una respuesta corta y completa.",
  "Juega «¿Qué se preguntó?» para ganar estrellas, aprueba el reto (A4 + video A8) y completa el texto A2.",
];

export const IDEAS: string[] = [
  "Cada dato tiene su palabra interrogativa: Where (lugar), What time (hora), When (momento o días), How much (precio), How long (duración), Which (cuál de varios), Is there / Are there (si existe).",
  "Con verbos de acción se usa does y el verbo en forma base: What time does the bus leave? (no «What time the bus leaves?»).",
  "Con to be se invierte: Where is the café? / Where are the restrooms? (is singular, are plural).",
  "At para horas (at 11:40), on para días (on Monday), in para meses y años (in December).",
  "A «Is there…?» se responde Yes, there is / No, there isn't; a «Are there…?», Yes, there are / No, there aren't.",
  "En un tablero: departure = salida, arrival = llegada, gate = andén, on time = a tiempo, delayed = retrasado, boarding = abordando, canceled = cancelado.",
  "Excuse me abre con cortesía una pregunta a un desconocido (A6).",
];

/** Reto: quiz A4 (verbatim) + preguntas de opción múltiple y V/F del video A8. */
export const QUIZ: QuizEvaluable = {
  titulo: "Where & when? — Quiz (A4) y video (A8)",
  puntajeMinimo: 70,
  reactivos: [
    { enunciado: "¿Cómo preguntas dónde está la biblioteca?", opciones: ["When is the library?", "Where is the library?", "What is the library?", "Who is the library?"], respuestaCorrecta: 1, retroalimentacion: "'Where' = dónde." },
    { enunciado: "¿Qué preposición usas para una hora específica?", opciones: ["in", "on", "at", "to"], respuestaCorrecta: 2, retroalimentacion: "'at' para horas: 'at 9 o'clock'." },
    { enunciado: "'The exam is ___ Monday.'", opciones: ["in", "on", "at", "of"], respuestaCorrecta: 1, retroalimentacion: "'on' para días de la semana: 'on Monday'." },
    { enunciado: "¿Cómo dices 'nueve y media'?", opciones: ["nine and half", "half nine", "nine thirty", "thirty nine"], respuestaCorrecta: 2, retroalimentacion: "'Nine thirty' o 'half past nine'." },
    { enunciado: "'It is next to the gym.' 'Next to' significa:", opciones: ["enfrente de", "al lado de", "detrás de", "entre"], respuestaCorrecta: 1, retroalimentacion: "'Next to' = al lado de." },
    {
      enunciado: "¿Cuál de las siguientes preguntas se usa en inglés para conocer un horario?",
      opciones: ["What time does the class start?", "What is your name?", "How are you?"],
      respuestaCorrecta: 0,
      retroalimentacion: "What time… pregunta por una hora: «What time does the class start?». Las otras dos preguntan el nombre y cómo está alguien.",
    },
    {
      enunciado: "Las preguntas sencillas en inglés sirven para obtener información general como ubicación y horarios.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Verdadero: con Where preguntas ubicaciones y con When / What time, horarios.",
    },
  ],
};

/**
 * Actividad A2 «Ask the right question» — verbatim, salvo una adaptación
 * declarada: el original dice «___ time is it? — It is ___ 2:30 pm» con «at»
 * como respuesta, que no es inglés correcto (a «What time is it?» se responde
 * «It is 2:30 pm», sin at). Aquí la pregunta es «___ time is the exam?», con la
 * que «It is at 2:30 pm» sí es correcto y los huecos no cambian.
 */
export const HUECOS_A2: TextoHuecosData = {
  ancla: "IN-I-P05-A2 · Ask the right question",
  instrucciones: "Completa las preguntas y respuestas con las palabras correctas: where / when / what / is / at / on / time / there",
  partes: ["", " is the cafeteria? — It ", " next to the gym. ", " time is the exam? — It is ", " 2:30 pm. ", " does the class start? — It starts ", " Monday ", " 8 am. Is ", " a pharmacy near here? — Yes, ", " is one on the corner."],
  huecos: [
    { respuesta: "Where", alternativas: ["where"], pista: "Pregunta de lugar" },
    { respuesta: "is", alternativas: [], pista: "It ___ next to..." },
    { respuesta: "What", alternativas: ["what"], pista: "___ time is the exam?" },
    { respuesta: "at", alternativas: [], pista: "It is ___ 2:30 (hora específica)" },
    { respuesta: "When", alternativas: ["when"], pista: "Pregunta de tiempo/día" },
    { respuesta: "on", alternativas: [], pista: "___ Monday (día de la semana)" },
    { respuesta: "at", alternativas: [], pista: "___ 8 am (hora)" },
    { respuesta: "there", alternativas: [], pista: "Is ___ a pharmacy..." },
    { respuesta: "there", alternativas: ["There"], pista: "Yes, ___ is one on the corner (ahí hay una)" },
  ],
};

/**
 * Datos y modelo del laboratorio "Daily routines: el día de Ana"
 * (IN-II-P01, progresión 1 de Inglés II: «Describe rutinas diarias y
 * actividades cotidianas en casa, la escuela o la comunidad»).
 *
 * Anclas VERBATIM:
 *   - A1 lectura «Daily Routines Around the World»: marco teórico y la rutina
 *     de la estudiante que el alumno reconstruye en el modo «Build a day».
 *   - A2 y A6 fill_blanks: «Completa el texto».
 *   - A4 verdadero/falso: hechos. A5 glosario. A10 clasificar (Present Simple
 *     o Present Continuous): tarjeta de estrellas. A3 escritura: «Tu turno».
 *   - Escala de frecuencia (always 100 % … never 0 %): lectura IN-III-P04-A1.
 *
 * Lo que NO es verbatim: las horas de las acciones que la lectura A1 no
 * fecha (ducha, desayuno, comida, tarea, programa), el calendario semanal de
 * Ana y las horas del modo «What time…?» son ILUSTRATIVOS. Ana y su colonia
 * son ficticias. Todas las oraciones en inglés están en inglés estadounidense
 * estándar.
 *
 * Datos puros (sin three ni React).
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { TextoHuecosData } from "./_mecanica-huecos";

/* ── Modos ────────────────────────────────────────────────────────────── */

export type Modo = "dia" | "hora" | "frecuencia";
export const MODOS: Modo[] = ["dia", "hora", "frecuencia"];

export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string }> = {
  dia: { etq: "Build a day", subtitulo: "Ordena el día de Ana y cuéntalo en inglés", icono: "fa-sun", color: "#fbbf24" },
  hora: { etq: "What time…?", subtitulo: "Pregunta, pon el reloj y di la hora", icono: "fa-clock", color: "#38bdf8" },
  frecuencia: { etq: "How often?", subtitulo: "Cuenta en el calendario y arma la oración", icono: "fa-calendar-week", color: "#a78bfa" },
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

/** Minúsculas, sin puntuación, apóstrofos rectos y espacios simples. */
export function normalizaIngles(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[.,;!?¡¿"()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* ════════════════════════════════════════════════════════════════════════
 * Horas
 * ════════════════════════════════════════════════════════════════════════ */

const UNIDADES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const DECENAS: Record<string, number> = { twenty: 20, thirty: 30, forty: 40, fifty: 50 };

/** Número en palabras en inglés (1–59), con guion: "forty-five". */
export function numeroIngles(n: number): string {
  if (n < 20) return UNIDADES[n]!;
  const d = Math.floor(n / 10) * 10;
  const nombre = Object.keys(DECENAS).find((k) => DECENAS[k] === d)!;
  return n % 10 === 0 ? nombre : `${nombre}-${UNIDADES[n % 10]}`;
}

/** "6:30 a.m." a partir de minutos desde la medianoche. */
export function horaDigital(min: number): string {
  const h24 = Math.floor(min / 60) % 24;
  const m = min % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${h24 < 12 ? "a.m." : "p.m."}`;
}

/** Parte del día en inglés: in the morning / in the afternoon / in the evening / at night. */
export function parteDelDia(min: number): string {
  const h = Math.floor(min / 60) % 24;
  if (h >= 5 && h < 12) return "in the morning";
  if (h >= 12 && h < 18) return "in the afternoon";
  if (h >= 18 && h < 21) return "in the evening";
  return "at night";
}

/** La hora "a la británica y a la americana" con past / to: "a quarter to eight". */
export function horaEnIngles(min: number): string {
  const h24 = Math.floor(min / 60) % 24;
  const m = min % 60;
  const h12 = (h: number) => (h % 12 === 0 ? 12 : h % 12);
  const hora = numeroIngles(h12(h24));
  const siguiente = numeroIngles(h12(h24 + 1));
  if (m === 0) return `${hora} o'clock`;
  if (m === 15) return `a quarter past ${hora}`;
  if (m === 30) return `half past ${hora}`;
  if (m === 45) return `a quarter to ${siguiente}`;
  if (m < 30) return `${numeroIngles(m)}${m % 5 === 0 ? "" : m === 1 ? " minute" : " minutes"} past ${hora}`;
  const faltan = 60 - m;
  return `${numeroIngles(faltan)}${faltan % 5 === 0 ? "" : faltan === 1 ? " minute" : " minutes"} to ${siguiente}`;
}

/** Forma digital en palabras: "seven forty-five", "six oh five", "eight o'clock". */
export function horaDigitalEnIngles(min: number): string {
  const h24 = Math.floor(min / 60) % 24;
  const m = min % 60;
  const hora = numeroIngles(h24 % 12 === 0 ? 12 : h24 % 12);
  if (m === 0) return `${hora} o'clock`;
  if (m < 10) return `${hora} oh ${numeroIngles(m)}`;
  return `${hora} ${numeroIngles(m)}`;
}

export interface HoraLeida {
  /** Minutos en reloj de 12 horas (0–719). */
  min12: number;
  forma: "past" | "to" | "oclock" | "digital";
  /** Parte del día que el alumno escribió, si escribió una. */
  parte: "morning" | "afternoon" | "evening" | "night" | "am" | "pm" | null;
}

export type LecturaHora = { ok: true; hora: HoraLeida } | { ok: false; motivo: "vacio" | "digitos" | "noEntiendo" };

/**
 * Lee una hora escrita en inglés con palabras. Acepta, con o sin «it's» / «it
 * is» / «at» al principio y con o sin parte del día al final:
 *   half past seven · (a) quarter past/to eight · twenty(-five) (minutes) past six ·
 *   ten to ten · seven o'clock · seven forty-five · six oh five.
 */
export function leeHoraIngles(texto: string): LecturaHora {
  let s = normalizaIngles(texto).replace(/-/g, " ").replace(/o ?'? ?clock/g, "oclock");
  if (!s) return { ok: false, motivo: "vacio" };
  if (/\d/.test(s)) return { ok: false, motivo: "digitos" };
  s = s.replace(/^(it'?s|it is|its|at)\s+/, "");
  let parte: HoraLeida["parte"] = null;
  const finales: [RegExp, NonNullable<HoraLeida["parte"]>][] = [
    [/\s+in the morning$/, "morning"],
    [/\s+in the afternoon$/, "afternoon"],
    [/\s+in the evening$/, "evening"],
    [/\s+at night$/, "night"],
    [/\s+a ?m$/, "am"],
    [/\s+p ?m$/, "pm"],
  ];
  for (const [re, p] of finales) {
    if (re.test(s)) {
      parte = p;
      s = s.replace(re, "");
      break;
    }
  }
  const t = s.split(" ").filter(Boolean);

  /** Lee un número (1–59) desde la posición i. */
  const leeNumero = (i: number): { n: number; sig: number } | null => {
    const a = t[i];
    if (a === undefined) return null;
    if (a === "oh") {
      const u = UNIDADES.indexOf(t[i + 1] ?? "");
      return u >= 1 && u <= 9 ? { n: u, sig: i + 2 } : null;
    }
    if (a in DECENAS) {
      const u = UNIDADES.indexOf(t[i + 1] ?? "");
      if (u >= 1 && u <= 9) return { n: DECENAS[a]! + u, sig: i + 2 };
      return { n: DECENAS[a]!, sig: i + 1 };
    }
    const u = UNIDADES.indexOf(a);
    return u >= 1 ? { n: u, sig: i + 1 } : null;
  };
  const hora12 = (i: number): number | null => {
    const u = UNIDADES.indexOf(t[i] ?? "");
    return u >= 1 && u <= 12 && i === t.length - 1 ? u % 12 : null;
  };
  const listo = (min12: number, forma: HoraLeida["forma"]): LecturaHora => ({ ok: true, hora: { min12: ((min12 % 720) + 720) % 720, forma, parte } });

  // «seven o'clock»
  if (t.length === 2 && t[1] === "oclock") {
    const h = UNIDADES.indexOf(t[0]!);
    if (h >= 1 && h <= 12) return listo((h % 12) * 60, "oclock");
  }
  // «half past seven»
  if (t[0] === "half" && t[1] === "past") {
    const h = hora12(2);
    if (h !== null) return listo(h * 60 + 30, "past");
  }
  // «(a) quarter past / to eight»
  const q = t[0] === "a" && t[1] === "quarter" ? 2 : t[0] === "quarter" ? 1 : -1;
  if (q > 0 && (t[q] === "past" || t[q] === "to")) {
    const h = hora12(q + 1);
    if (h !== null) return listo(t[q] === "past" ? h * 60 + 15 : h * 60 - 15, t[q] === "past" ? "past" : "to");
  }
  // «twenty-five (minutes) past six» · «ten to ten»
  const n = leeNumero(0);
  if (n && n.n <= 30) {
    let i = n.sig;
    if (t[i] === "minutes" || t[i] === "minute") i++;
    if (t[i] === "past" || t[i] === "to") {
      const h = hora12(i + 1);
      if (h !== null && n.n < 60) return listo(t[i] === "past" ? h * 60 + n.n : h * 60 - n.n, t[i] === "past" ? "past" : "to");
    }
  }
  // «seven forty-five» · «six oh five»
  const h = UNIDADES.indexOf(t[0] ?? "");
  if (h >= 1 && h <= 12 && t.length >= 2) {
    const m = leeNumero(1);
    if (m && m.sig === t.length && m.n >= 1 && m.n <= 59) return listo((h % 12) * 60 + m.n, "digital");
  }
  return { ok: false, motivo: "noEntiendo" };
}

/** ¿La parte del día escrita contradice la hora real (24 h)? */
export function parteContradice(parte: HoraLeida["parte"], min: number): boolean {
  if (!parte) return false;
  const h = Math.floor(min / 60) % 24;
  switch (parte) {
    case "morning":
      return !(h >= 5 && h < 12);
    case "afternoon":
      return !(h >= 12 && h < 18);
    case "evening":
      return !(h >= 17 && h < 22);
    case "night":
      return !(h >= 20 || h < 5);
    case "am":
      return h >= 12;
    case "pm":
      return h < 12;
  }
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. BUILD A DAY — la rutina de la lectura A1
 * ════════════════════════════════════════════════════════════════════════ */

export type LugarId = "cama" | "regadera" | "mesa" | "parada" | "escuela" | "escritorio" | "sala";

/** Present Simple de 3.ª persona con las reglas de ortografía (-s, -es, -ies, has). */
export function terceraPersona(base: string): string {
  const [verbo, ...resto] = base.split(" ");
  const v = verbo!;
  let f: string;
  if (v === "have") f = "has";
  else if (v === "be") f = "is";
  else if (/(ch|sh|ss|x|z|o)$/.test(v)) f = `${v}es`;
  else if (/[^aeiou]y$/.test(v)) f = `${v.slice(0, -1)}ies`;
  else f = `${v}s`;
  return [f, ...resto].join(" ");
}

export type Sujeto = "She" | "I";

export interface HuecoVerbo {
  /** Verbo base que se muestra entre paréntesis. */
  base: string;
}

export interface Accion {
  id: string;
  /** Etiqueta de la tarjeta (verbo base + complemento, en inglés). */
  tarjeta: string;
  icono: string;
  lugar: LugarId;
  /** Minutos desde la medianoche. */
  min: number;
  /** true si la hora aparece en la lectura A1; false si es ilustrativa. */
  horaA1: boolean;
  sujeto: Sujeto;
  /** Oración partida por los huecos (N+1 trozos para N huecos). */
  partes: string[];
  huecos: HuecoVerbo[];
  /** Traducción de apoyo. */
  es: string;
}

export const ACCIONES: Accion[] = [
  { id: "wake", tarjeta: "wake up", icono: "fa-bell", lugar: "cama", min: 6 * 60 + 30, horaA1: true, sujeto: "She", partes: ["She ", " at 6:30 a.m."], huecos: [{ base: "wake up" }], es: "Se despierta a las 6:30." },
  { id: "shower", tarjeta: "shower and get dressed", icono: "fa-shower", lugar: "regadera", min: 6 * 60 + 40, horaA1: false, sujeto: "She", partes: ["She ", " and ", " dressed."], huecos: [{ base: "shower" }, { base: "get" }], es: "Se baña y se viste." },
  { id: "breakfast", tarjeta: "eat breakfast with the family", icono: "fa-mug-hot", lugar: "mesa", min: 6 * 60 + 55, horaA1: false, sujeto: "I", partes: ["I ", " breakfast with my family."], huecos: [{ base: "eat" }], es: "(Ana habla) Desayuno con mi familia." },
  { id: "bus", tarjeta: "take the bus to school", icono: "fa-bus", lugar: "parada", min: 7 * 60 + 15, horaA1: true, sujeto: "She", partes: ["She ", " the bus to school at 7:15 a.m."], huecos: [{ base: "take" }], es: "Toma el camión a la escuela a las 7:15." },
  { id: "classes", tarjeta: "have classes", icono: "fa-school", lugar: "escuela", min: 8 * 60, horaA1: true, sujeto: "She", partes: ["She ", " classes from 8:00 a.m. to 2:00 p.m."], huecos: [{ base: "have" }], es: "Tiene clases de 8:00 a 14:00." },
  { id: "lunch", tarjeta: "eat lunch at home", icono: "fa-bowl-food", lugar: "mesa", min: 15 * 60, horaA1: false, sujeto: "She", partes: ["She ", " lunch at home."], huecos: [{ base: "eat" }], es: "Come en casa." },
  { id: "homework", tarjeta: "do homework", icono: "fa-book", lugar: "escritorio", min: 16 * 60 + 20, horaA1: false, sujeto: "I", partes: ["I ", " my homework in the afternoon."], huecos: [{ base: "do" }], es: "(Ana habla) Hago mi tarea en la tarde." },
  { id: "show", tarjeta: "watch a show with the family", icono: "fa-tv", lugar: "sala", min: 20 * 60 + 30, horaA1: false, sujeto: "She", partes: ["She ", " a show with her family at night."], huecos: [{ base: "watch" }], es: "Ve un programa con su familia en la noche." },
  { id: "bed", tarjeta: "go to bed", icono: "fa-bed", lugar: "cama", min: 22 * 60, horaA1: true, sujeto: "She", partes: ["She ", " to bed at 10:00 p.m."], huecos: [{ base: "go" }], es: "Se va a dormir a las 22:00." },
];

/** Forma correcta de un hueco según el sujeto. */
export function formaCorrecta(sujeto: Sujeto, base: string): string {
  return sujeto === "I" ? base : terceraPersona(base);
}

/** La oración completa, lista para leerse en voz alta. */
export function oracionCompleta(a: Accion): string {
  return a.partes.map((p, i) => p + (i < a.huecos.length ? formaCorrecta(a.sujeto, a.huecos[i]!.base) : "")).join("");
}

const PASADOS: Record<string, string> = { wake: "woke", shower: "showered", get: "got", eat: "ate", take: "took", have: "had", do: "did", watch: "watched", go: "went" };

/**
 * Revisa lo que el alumno escribió en un hueco. Devuelve null si está bien o
 * la explicación de la regla en español, con el ejemplo correcto en inglés.
 */
export function revisaVerbo(sujeto: Sujeto, base: string, escrito: string): string | null {
  const e = normalizaIngles(escrito);
  const bien = formaCorrecta(sujeto, base);
  if (e === bien) return null;
  const [vBase, ...resto] = base.split(" ");
  const cola = resto.length ? ` ${resto.join(" ")}` : "";
  const tercera = terceraPersona(base);
  const pronombre = sujeto === "I" ? "I" : "she";
  if (!e) return `Escribe el verbo «${base}» en Present Simple.`;
  if (resto.length && e === bien.split(" ")[0]) return `Falta «${resto.join(" ")}»: «${base}» es un verbo de dos palabras y las dos se escriben → «${pronombre} ${bien}».`;
  if (sujeto === "I" && e === tercera) return `Con «I» el verbo NO lleva -s: «I ${bien}». Solo he / she / it agregan -s (por eso es «she ${tercera}»).`;
  if (sujeto === "She" && e === base) return `Con he / she / it el verbo agrega -s en Present Simple: «she ${bien}» (y con I sería «I ${base}»).`;
  if (sujeto === "She" && vBase === "have" && e === `haves${cola}`) return "«Have» es irregular en 3.ª persona: no es «haves», es «has» → «she has classes».";
  if (sujeto === "She" && /es$/.test(tercera.split(" ")[0]!) && e === `${vBase}s${cola}`) return `Los verbos que terminan en -ch, -sh, -ss, -x u -o agregan -es: «${vBase}» → «${tercera.split(" ")[0]}». Por eso «she ${bien}».`;
  if (e.split(" ")[0]!.endsWith("ing")) return `Con -ing es Present Continuous: algo que pasa AHORA (actividad A10). Una rutina se cuenta en Present Simple → «${pronombre} ${bien}».`;
  if (e.split(" ")[0] === PASADOS[vBase!]) return `«${PASADOS[vBase!]}» es pasado. Lo que Ana hace todos los días va en Present Simple → «${pronombre} ${bien}».`;
  if (e.startsWith("is ") || e.startsWith("am ")) return `No hace falta «is» / «am» antes del verbo en Present Simple: «${pronombre} ${bien}».`;
  return `El verbo es «${base}». Con «${pronombre}» se escribe «${bien}».`;
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. WHAT TIME…? — preguntas con do/does y la hora
 * ════════════════════════════════════════════════════════════════════════ */

export interface PreguntaHora {
  id: string;
  /** La pregunta partida por el hueco del auxiliar. */
  partes: [string, string];
  aux: "do" | "does";
  porque: string;
  /** Respuesta en inglés que el alumno debe leer para poner el reloj. */
  respuesta: string;
  min: number;
  a1: boolean;
}

export const PREGUNTAS_HORA: PreguntaHora[] = [
  { id: "q-wake", partes: ["What time ", " Ana wake up?"], aux: "does", porque: "Ana = she (3.ª persona singular) → does. Y el verbo principal vuelve a su forma base: «does Ana wake up?», no «wakes».", respuesta: "She wakes up at half past six in the morning.", min: 6 * 60 + 30, a1: true },
  { id: "q-bus", partes: ["What time ", " she take the bus to school?"], aux: "does", porque: "Con she → does + verbo base: «does she take…?».", respuesta: "She takes the bus at a quarter past seven.", min: 7 * 60 + 15, a1: true },
  { id: "q-start", partes: ["What time ", " Ana's classes start?"], aux: "do", porque: "«Ana's classes» es plural (they) → do. Con I / you / we / they se usa do.", respuesta: "They start at eight o'clock in the morning.", min: 8 * 60, a1: true },
  { id: "q-finish", partes: ["What time ", " her classes finish?"], aux: "do", porque: "«Her classes» = they → do: «do her classes finish?».", respuesta: "They finish at two o'clock in the afternoon.", min: 14 * 60, a1: true },
  { id: "q-bed", partes: ["What time ", " Ana go to bed?"], aux: "does", porque: "Ana = she → does + verbo base: «does Ana go to bed?», no «goes».", respuesta: "She goes to bed at ten o'clock at night.", min: 22 * 60, a1: true },
];

export interface DecirHora {
  id: string;
  contexto: string;
  min: number;
}

/** Horas ilustrativas del día de Ana: el alumno las dice en inglés. */
export const DECIR_HORA: DecirHora[] = [
  { id: "d-shower", contexto: "Ana showers and gets dressed. What time is it?", min: 6 * 60 + 40 },
  { id: "d-breakfast", contexto: "Ana has breakfast with her family. What time is it?", min: 6 * 60 + 55 },
  { id: "d-arrive", contexto: "Ana arrives at school. What time is it?", min: 7 * 60 + 45 },
  { id: "d-homework", contexto: "Ana does her homework. What time is it?", min: 16 * 60 + 20 },
  { id: "d-show", contexto: "Ana watches a show with her family. What time is it?", min: 20 * 60 + 30 },
];

/** Explica en español cómo se lee una hora con past / to. */
export function explicaHora(min: number): string {
  const m = min % 60;
  if (m === 0) return "Hora en punto: «o'clock».";
  if (m === 15) return "15 minutos = a quarter (un cuarto) → «a quarter past…».";
  if (m === 30) return "30 minutos = half (media) → «half past…».";
  if (m === 45) return "Faltan 15 para la hora siguiente → «a quarter to…» (to = para).";
  if (m < 30) return `Pasan ${m} minutos de la hora → «past» (pasado de): «${horaEnIngles(min)}».`;
  return `Pasan de la media: se cuenta cuántos faltan (${60 - m}) para la hora SIGUIENTE → «to»: «${horaEnIngles(min)}».`;
}

/** «7:45» sin a.m./p.m., a partir de minutos en reloj de 12 horas. */
export function hora12Texto(min12: number): string {
  const h = Math.floor(min12 / 60) % 12;
  return `${h === 0 ? 12 : h}:${String(min12 % 60).padStart(2, "0")}`;
}

export interface RevisionHora {
  ok: boolean;
  msg: string;
  forma: HoraLeida["forma"] | null;
}

/** Revisa la hora que el alumno escribió con palabras frente a la hora real (24 h). */
export function revisaHoraEscrita(texto: string, min: number): RevisionHora {
  const r = leeHoraIngles(texto);
  const m12 = min % 720;
  if (!r.ok) {
    if (r.motivo === "vacio") return { ok: false, msg: "Escribe la hora en inglés, con palabras.", forma: null };
    if (r.motivo === "digitos") return { ok: false, msg: "Escríbela con palabras, no con números: por ejemplo «half past seven», «a quarter to eight» o «seven forty-five».", forma: null };
    return { ok: false, msg: "No reconozco esa hora. Formas válidas: «half past seven», «a quarter to eight», «twenty past six», «seven forty-five», «ten o'clock».", forma: null };
  }
  const h = r.hora;
  const minutos = m12 % 60;
  if (h.min12 !== m12) {
    const escrita = hora12Texto(h.min12);
    const real = hora12Texto(m12);
    if (h.forma === "to" && h.min12 === (m12 + 660) % 720)
      return { ok: false, msg: `Escribiste las ${escrita}: una hora antes. Con «to» se nombra la hora SIGUIENTE (to = para). ${explicaHora(min)}`, forma: h.forma };
    if (h.forma === "past" && minutos > 30) return { ok: false, msg: `Escribiste las ${escrita}, pero el reloj marca las ${real}. Pasando la media hora se cuenta lo que FALTA para la hora siguiente con «to». ${explicaHora(min)}`, forma: h.forma };
    if (h.forma === "to" && minutos > 0 && minutos < 30) return { ok: false, msg: `Escribiste las ${escrita}, pero el reloj marca las ${real}. Antes de la media hora se dice cuánto PASA de la hora con «past». ${explicaHora(min)}`, forma: h.forma };
    return { ok: false, msg: `Escribiste las ${escrita}, pero el reloj marca las ${real}. ${explicaHora(min)}`, forma: h.forma };
  }
  if (parteContradice(h.parte, min))
    return { ok: false, msg: `La hora está bien, pero son las ${horaDigital(min)}: eso es «${parteDelDia(min)}». Morning = mañana (5–12 h), afternoon = tarde (12–18 h), evening = tarde-noche, night = noche.`, forma: h.forma };
  return { ok: true, msg: `¡Correcto! ${horaDigital(min)} = «${horaEnIngles(min)}» o «${horaDigitalEnIngles(min)}», ${parteDelDia(min)}.`, forma: h.forma };
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. HOW OFTEN? — calendario semanal y adverbios de frecuencia
 * ════════════════════════════════════════════════════════════════════════ */

export const DIAS_SEMANA = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export type Adverbio = "always" | "usually" | "often" | "sometimes" | "rarely" | "never";

/** Escala VERBATIM de la lectura IN-III-P04-A1. */
export const ESCALA: { adv: Adverbio; es: string; pct: number }[] = [
  { adv: "always", es: "siempre", pct: 100 },
  { adv: "usually", es: "normalmente", pct: 80 },
  { adv: "often", es: "frecuentemente", pct: 70 },
  { adv: "sometimes", es: "a veces", pct: 50 },
  { adv: "rarely", es: "rara vez", pct: 20 },
  { adv: "never", es: "nunca", pct: 0 },
];

export interface Habito {
  id: string;
  etq: string;
  icono: string;
  color: string;
  /** Lunes a domingo: 1 si Ana lo hace ese día. */
  dias: number[];
  /** Verbo: forma correcta (3.ª persona) y distractor (forma base). */
  verbo: string;
  distractor: string;
  esBe: boolean;
  complemento: string;
}

export const HABITOS: Habito[] = [
  { id: "breakfast", etq: "has breakfast with her family", icono: "fa-mug-hot", color: "#f59e0b", dias: [1, 1, 1, 1, 1, 1, 1], verbo: "has", distractor: "have", esBe: false, complemento: "breakfast with her family" },
  { id: "homework", etq: "does her homework", icono: "fa-book", color: "#38bdf8", dias: [1, 1, 1, 1, 1, 0, 1], verbo: "does", distractor: "do", esBe: false, complemento: "her homework" },
  { id: "bus", etq: "takes the bus to school", icono: "fa-bus", color: "#22c55e", dias: [1, 1, 1, 1, 1, 0, 0], verbo: "takes", distractor: "take", esBe: false, complemento: "the bus to school" },
  { id: "soccer", etq: "plays soccer in the park", icono: "fa-futbol", color: "#f472b6", dias: [0, 1, 0, 1, 0, 1, 0], verbo: "plays", distractor: "play", esBe: false, complemento: "soccer in the park" },
  { id: "tired", etq: "is tired in the morning", icono: "fa-face-tired", color: "#fb923c", dias: [1, 0, 1, 0, 1, 0, 0], verbo: "is", distractor: "are", esBe: true, complemento: "tired in the morning" },
  { id: "fastfood", etq: "eats fast food", icono: "fa-burger", color: "#ef4444", dias: [0, 0, 0, 0, 0, 1, 0], verbo: "eats", distractor: "eat", esBe: false, complemento: "fast food" },
  { id: "late", etq: "is late for school", icono: "fa-person-running", color: "#a78bfa", dias: [0, 0, 0, 0, 0, 0, 0], verbo: "is", distractor: "are", esBe: true, complemento: "late for school" },
];

export const cuentaDias = (h: Habito) => h.dias.reduce((a, b) => a + b, 0);

/** La pregunta del hábito en inglés: «How often does Ana take the bus to school?» · «How often is Ana late for school?». */
export function preguntaFrecuencia(h: Habito): string {
  return h.esBe ? `How often is Ana ${h.complemento}?` : `How often does Ana ${h.distractor} ${h.complemento}?`;
}
export const porcentaje = (h: Habito) => Math.round((cuentaDias(h) / 7) * 100);

/**
 * Adverbios que describen bien la frecuencia: el más cercano en la escala y
 * cualquiera a 10 puntos o menos (la escala es aproximada: 5 de 7 días, 71 %,
 * admite «often» y también «usually»).
 */
export function adverbiosAceptados(h: Habito): Adverbio[] {
  const p = (cuentaDias(h) / 7) * 100;
  const dist = ESCALA.map((e) => Math.abs(e.pct - p));
  const minimo = Math.min(...dist);
  return ESCALA.filter((_, i) => dist[i]! <= Math.max(minimo, 10)).map((e) => e.adv);
}

/** Adverbios que pueden ir también al principio (y «sometimes», además, al final). */
const INICIALES: Adverbio[] = ["sometimes", "usually", "often"];

export type Ficha = "S" | "V" | "D" | "C" | Adverbio;

export const ADVERBIOS: Adverbio[] = ESCALA.map((e) => e.adv);

/** Fichas de cada hábito, revueltas con semilla fija (no cambian entre renders). */
export const FICHAS_HABITO: Ficha[][] = HABITOS.map((_, i) => baraja<Ficha>(["S", "V", "D", "C", ...ADVERBIOS], mulberry32(31 + i * 7)));

export function textoFicha(h: Habito, f: Ficha): string {
  if (f === "S") return "she";
  if (f === "V") return h.verbo;
  if (f === "D") return h.distractor;
  if (f === "C") return h.complemento;
  return f;
}

/** La oración armada, con mayúscula inicial y punto. */
export function oracionFichas(h: Habito, fichas: Ficha[]): string {
  if (!fichas.length) return "";
  const s = fichas.map((f) => textoFicha(h, f)).join(" ");
  return `${s.charAt(0).toUpperCase()}${s.slice(1)}.`;
}

export function oracionModelo(h: Habito): string {
  const adv = adverbiosAceptados(h)[0]!;
  return oracionFichas(h, h.esBe ? ["S", "V", adv, "C"] : ["S", adv, "V", "C"]);
}

/** Revisa la oración armada con fichas. Lista vacía = correcta. */
export function revisaFrecuencia(h: Habito, fichas: Ficha[]): string[] {
  const errores: string[] = [];
  const advs = fichas.filter((f): f is Adverbio => (ADVERBIOS as string[]).includes(f));
  const n = cuentaDias(h);
  const pct = porcentaje(h);
  const faltan: string[] = [];
  if (!fichas.includes("S")) faltan.push("el sujeto «she»");
  if (!fichas.includes("V") && !fichas.includes("D")) faltan.push("el verbo");
  if (!fichas.includes("C")) faltan.push(`«${h.complemento}»`);
  if (advs.length === 0) faltan.push("un adverbio de frecuencia");
  if (faltan.length) errores.push(`Falta ${faltan.join(", ")}.`);
  if (fichas.includes("V") && fichas.includes("D")) errores.push("Usa una sola forma del verbo.");
  if (advs.length > 1) errores.push("Usa un solo adverbio de frecuencia.");
  if (fichas.includes("D"))
    errores.push(h.esBe ? "Con she el verbo be es «is» («she is»); «are» va con you / we / they." : `Con she el verbo lleva -s en Present Simple: «she ${h.verbo}», no «she ${h.distractor}».`);
  const adv = advs[0];
  const aceptados = adverbiosAceptados(h);
  if (adv && !aceptados.includes(adv)) {
    const e = ESCALA.find((x) => x.adv === adv)!;
    errores.push(`Ana lo hace ${n} de 7 días (≈ ${pct} %). «${adv}» es ${e.es}, cerca de ${e.pct} %: aquí va «${aceptados.join("» o «")}».`);
  }
  if (errores.length) return errores;
  // Orden: con todas las piezas presentes y una sola de cada una.
  const v: Ficha = "V";
  const a = adv!;
  const validos: Ficha[][] = h.esBe ? [["S", v, a, "C"]] : [["S", a, v, "C"]];
  if (INICIALES.includes(a)) validos.push([a, "S", v, "C"]);
  if (a === "sometimes") validos.push(["S", v, "C", a]);
  const ok = validos.some((o) => o.length === fichas.length && o.every((x, i) => x === fichas[i]));
  if (!ok) {
    if (fichas[0] !== "S" && !(INICIALES.includes(a) && fichas[0] === a)) errores.push(`La oración empieza con el sujeto: «She…».${a === "always" || a === "never" || a === "rarely" ? ` «${a}» no puede ir al principio.` : ""}`);
    else if (h.esBe) errores.push(`Con el verbo be el adverbio va DESPUÉS de «is»: «She is ${a} ${h.complemento}».`);
    else errores.push(`El adverbio va ANTES del verbo principal: «She ${a} ${h.verbo} ${h.complemento}» (como en «I always get up early», actividad A4).`);
  }
  return errores;
}

/* ════════════════════════════════════════════════════════════════════════
 * Estrellas — A10 «Present Simple or Present Continuous?» (verbatim)
 * ════════════════════════════════════════════════════════════════════════ */

export type Tiempo = "Present Simple" | "Present Continuous";

export const CLASIFICA_A10: { texto: string; categoria: Tiempo; explicacion: string }[] = [
  { texto: "I take the bus to school every day.", categoria: "Present Simple", explicacion: "'every day' marca hábito: es una rutina, no lo que pasa ahora." },
  { texto: "She usually studies after dinner.", categoria: "Present Simple", explicacion: "'usually' es un adverbio de frecuencia: pide Present Simple." },
  { texto: "Water boils at 100 °C at sea level.", categoria: "Present Simple", explicacion: "Un hecho que siempre es cierto. El Present Simple también sirve para verdades generales." },
  { texto: "My brother works at a workshop in Lerma.", categoria: "Present Simple", explicacion: "Una situación permanente, aunque en este segundo no esté trabajando." },
  { texto: "Look! It is raining again.", categoria: "Present Continuous", explicacion: "'Look!' señala el momento: está pasando mientras se habla." },
  { texto: "I am studying for the exam right now.", categoria: "Present Continuous", explicacion: "'right now' fija la acción en este instante." },
  { texto: "They are building a new library at the school.", categoria: "Present Continuous", explicacion: "Un proceso en curso, aunque hoy no haya nadie trabajando: sigue sin terminar." },
  { texto: "Be quiet, the baby is sleeping.", categoria: "Present Continuous", explicacion: "La acción está ocurriendo ahora y por eso hay que callarse." },
];

export const CATEGORIAS_A10: { nombre: Tiempo; descripcion: string }[] = [
  { nombre: "Present Simple", descripcion: "Rutinas, hábitos y hechos permanentes. Palabras clave: always, usually, every day." },
  { nombre: "Present Continuous", descripcion: "Lo que ocurre en este momento. Palabras clave: now, right now, at the moment." },
];

export const INSTRUCCIONES_A10 =
  "En inglés el presente se parte en dos y la diferencia no es el momento, es el TIPO de acción: lo que se hace habitualmente (Present Simple) o lo que está pasando ahora (Present Continuous).";

export function rondaA10(rnd: () => number): number[] {
  return baraja(
    CLASIFICA_A10.map((_, i) => i),
    rnd,
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * A3 — Tu turno: escribe tu rutina (revisión automática orientativa)
 * ════════════════════════════════════════════════════════════════════════ */

export const A3 = {
  prompt:
    "Write about YOUR daily routine in English. Describe at least 6 activities from when you wake up to when you go to bed. Include the time for each activity. Use frequency adverbs (always, usually, sometimes, never) for at least 2 activities.",
  pistas: ["Start with: 'I wake up at...'", "Use Present Simple: I eat, I go, I study.", "Add frequency: I usually have breakfast with my family. I sometimes walk to school."],
  criterios: ["Describes at least 6 daily activities", "Uses correct Present Simple forms", "Includes time expressions or frequency adverbs", "Writing is clear and understandable"],
  min: 60,
  max: 200,
};

const TERCERAS_COMUNES = ["wakes", "gets", "eats", "takes", "goes", "does", "has", "watches", "studies", "showers", "walks", "plays", "brushes", "leaves", "arrives", "finishes", "starts", "works", "comes", "makes", "reads", "sleeps", "lives", "likes", "helps", "cooks", "runs", "drinks", "listens", "uses"];

export interface AnalisisA3 {
  palabras: number;
  adverbios: number;
  horas: number;
  /** Fragmentos «I wakes» y similares. */
  erroresI: string[];
}

export function analizaA3(texto: string): AnalisisA3 {
  const limpio = texto.toLowerCase().replace(/[’‘]/g, "'");
  const palabras = limpio.split(/\s+/).filter((w) => /[a-z0-9]/.test(w)).length;
  const adverbios = (limpio.match(/\b(always|usually|often|sometimes|rarely|never|normally|frequently|seldom)\b/g) ?? []).length;
  const horas = (limpio.match(/\bat\s+(\d{1,2}([:.]\d{2})?|half past|a quarter|quarter|noon|midnight|(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\b)/g) ?? []).length;
  const erroresI: string[] = [];
  const re = /\bi\s+(always\s+|usually\s+|often\s+|sometimes\s+|rarely\s+|never\s+)?([a-z]+)\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(limpio))) {
    if (TERCERAS_COMUNES.includes(m[2]!)) erroresI.push(m[0]);
  }
  return { palabras, adverbios, horas, erroresI };
}

/* ════════════════════════════════════════════════════════════════════════
 * Contenido VERBATIM
 * ════════════════════════════════════════════════════════════════════════ */

export const TITULO_A1 = "Daily Routines Around the World";

/** Lectura A1 — verbatim (el segundo párrafo se separa en su encabezado y la rutina). */
export const LECTURA_A1: string[] = [
  "Daily routines are the activities we do regularly, day after day. In many countries, routines are similar but the timing is different. In Mexico, many families have lunch (comida) as the main meal of the day, usually around 2:00 or 3:00 pm. In Spain, dinner is often after 9:00 pm. In Japan, many people take the train to work or school every morning.",
  "Here is a typical routine for a high school student in Mexico:",
  "She wakes up at 6:30 am. She showers and gets dressed. She eats breakfast with her family. She takes the bus to school at 7:15 am. She has classes from 8:00 am to 2:00 pm. She eats lunch at home. In the afternoon, she does her homework. She watches a show with her family at night. She goes to bed at 10:00 pm.",
  "In English, we describe routines with the Present Simple tense. For I/you/we/they: I wake up, you eat, they go. For he/she/it: she wakes up, he eats, it starts. Notice the -s ending for third person singular.",
];

/** Preguntas de comprensión de la lectura A1 — verbatim. */
export const PREGUNTAS_A1: { pregunta: string; respuesta: string }[] = [
  { pregunta: "What time does the student in the text wake up?", respuesta: "She wakes up at 6:30 am." },
  { pregunta: "How does Present Simple change for he/she/it?", respuesta: "We add -s to the verb: she wakes, he eats, it starts." },
  { pregunta: "What is different about mealtimes in Mexico and Spain?", respuesta: "In Mexico, comida is the main meal around 2-3 pm. In Spain, dinner is after 9 pm." },
];

/** Quiz A4 «True or False — Daily routines» — verbatim, como reto evaluable. */
export const QUIZ_A4: QuizEvaluable = {
  titulo: "True or False — Daily routines",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "Con 'he' y 'she' el verbo en presente simple lleva -s ('She gets up at 7').",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto: 3ª persona singular agrega -s: works, plays, gets up.",
    },
    {
      enunciado: "'Always', 'usually', 'sometimes' y 'never' son adverbios de frecuencia.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Sí: indican qué tan seguido haces algo.",
    },
    {
      enunciado: "El adverbio de frecuencia va después del verbo principal ('I get up always').",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 1,
      retroalimentacion: "Va ANTES del verbo principal: 'I always get up early'.",
    },
    {
      enunciado: "'I go to school every day' está en presente simple afirmativo.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correcto: describe una rutina habitual.",
    },
    {
      enunciado: "Con 'I' y 'you' el verbo agrega -s ('I works').",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 1,
      retroalimentacion: "No: solo he/she/it agregan -s. Es 'I work'.",
    },
  ],
};

/** Glosario A5 — verbatim. */
export const GLOSARIO: { termino: string; definicion: string; ejemplo: string }[] = [
  { termino: "to get up", definicion: "Levantarse de la cama.", ejemplo: "I get up at 6:30." },
  { termino: "always / usually / sometimes / never", definicion: "Adverbios de frecuencia (siempre / usualmente / a veces / nunca).", ejemplo: "She always has breakfast." },
  { termino: "to have breakfast", definicion: "Desayunar.", ejemplo: "We have breakfast at 7." },
  { termino: "to do homework", definicion: "Hacer la tarea.", ejemplo: "He does his homework after school." },
  { termino: "every day / on weekends", definicion: "Expresiones de tiempo: todos los días / los fines de semana.", ejemplo: "I study English every day." },
  { termino: "3rd person -s", definicion: "Con he/she/it el verbo agrega -s en presente simple.", ejemplo: "She gets up early." },
];

export const ACTIVIDAD_A5 = "Escribe 4 oraciones sobre tu rutina diaria usando un adverbio de frecuencia en cada una.";

/** Posición del adverbio — verbatim de la lectura IN-III-P04-A1. */
export const POSICION_IN3 = ["Position: frequency adverbs go BEFORE the main verb but AFTER 'be':", "• She always drinks tea in the morning. (before main verb)", "• He is usually late for class. (after 'be')"];

/** A2 «My Daily Routine: Fill in the Blanks» — verbatim. */
export const HUECOS_A2: TextoHuecosData = {
  ancla: "IN-II-P01-A2 · My Daily Routine: Fill in the Blanks",
  instrucciones: "Complete the sentences about Ana's daily routine. Use the correct form of the verbs: wake up, have, take, go, finish, do.",
  partes: ["Ana ", " at 6:00 am every day. She ", " a shower and gets dressed. She ", " breakfast with her family at 6:30. She ", " the bus at 7:10 am. She ", " school at 2:00 pm. Then she ", " her homework before dinner."],
  huecos: [
    { respuesta: "wakes up", alternativas: ["wakes"], pista: "La respuesta tiene 2 palabras y empieza con \"W\"." },
    { respuesta: "takes", alternativas: ["has"], pista: "La respuesta es una sola palabra que empieza con \"T\"." },
    { respuesta: "has", alternativas: ["eats"], pista: "La respuesta es una sola palabra que empieza con \"H\"." },
    { respuesta: "takes", alternativas: ["catches"], pista: "La respuesta es una sola palabra que empieza con \"T\"." },
    { respuesta: "finishes", alternativas: ["leaves"], pista: "La respuesta es una sola palabra que empieza con \"F\"." },
    { respuesta: "does", alternativas: ["finishes"], pista: "La respuesta es una sola palabra que empieza con \"D\"." },
  ],
};

/** A6 «Fill in the blanks — My daily routine» — verbatim. */
export const HUECOS_A6: TextoHuecosData = {
  ancla: "IN-II-P01-A6 · Fill in the blanks — My daily routine",
  instrucciones: "Completa los huecos. Cuida la -s de la 3ª persona y la posición del adverbio de frecuencia.",
  partes: ["Every day Ana ", " up at six. She ", " has breakfast with her family. After school, she ", " her homework. She ", " goes to bed late because she likes to sleep."],
  huecos: [
    { respuesta: "gets", alternativas: ["wakes"], pista: "3ª persona de 'get up' (levantarse): get + ___" },
    { respuesta: "always", alternativas: ["usually"], pista: "Adverbio de frecuencia: lo hace el 100% de las veces." },
    { respuesta: "does", alternativas: [], pista: "3ª persona de 'do' (hacer la tarea)." },
    { respuesta: "never", alternativas: [], pista: "Adverbio de frecuencia: el 0% de las veces (no se acuesta tarde)." },
  ],
};

export const FUENTE =
  "CEN Bachillerato — Inglés II, progresión 1: lectura A1 «Daily Routines Around the World» (Material elaborado para CEN Bachillerato — IN-II), fill_blanks A2 y A6, escritura A3, verdadero/falso A4, glosario A5 y clasificación A10; escala y posición de los adverbios de frecuencia de la lectura IN-III-P04-A1.";

export const PROBLEMA =
  "¿Cómo le cuentas a alguien, en inglés, lo que haces cada día? En este laboratorio sigues el día de Ana, una estudiante de bachillerato de una colonia de México: ordenas su rutina y la narras con la -s de la 3.ª persona, preguntas y dices la hora con un reloj, y cuentas en su calendario qué tan seguido hace cada cosa para elegir el adverbio de frecuencia.";

export const INSTRUCCIONES: string[] = [
  "En Build a day, toca las tarjetas en el orden en que Ana hace cada cosa (guíate por la lectura A1). Luego escribe el verbo de cada oración mientras Ana vive su día.",
  "En What time…?, elige do o does para cada pregunta, lee la respuesta y pon el reloj a esa hora. Después, di en inglés la hora que marca el reloj.",
  "En How often?, cuenta en el calendario cuántos días hace Ana cada actividad y arma la oración con fichas: el adverbio correcto en su lugar.",
  "Clasifica las oraciones de A10 para ganar estrellas, completa los textos A2 y A6 y escribe tu propia rutina (A3).",
];

export const IDEAS: string[] = [
  "Las rutinas y los hábitos se cuentan en Present Simple: I wake up, she wakes up.",
  "Con he / she / it el verbo lleva -s; con -ch, -sh, -ss, -x, -o lleva -es (watches, goes, does) y have cambia a has.",
  "En preguntas, does va con he / she / it y do con I / you / we / they; el verbo principal queda en forma base.",
  "Para la hora: past = pasado de la hora; to = para la siguiente; a quarter = 15 min; half = 30 min.",
  "El adverbio de frecuencia va antes del verbo principal (she always has breakfast) y después de be (she is never late).",
  "Always, usually, often, sometimes, rarely y never son una escala aproximada de 100 % a 0 %.",
];

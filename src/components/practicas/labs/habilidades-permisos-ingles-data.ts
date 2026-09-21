/**
 * Datos y modelo del laboratorio "Can you…? May I…? El centro comunitario"
 * (IN-II-P03, progresión 3 de Inglés II: «Expresa habilidades y pide o da
 * permiso en situaciones cotidianas»).
 *
 * Anclas VERBATIM:
 *   - A1 lectura «Can and Can't: Abilities and Permissions»: marco teórico y
 *     ejemplos de la tarjeta de estrellas (habilidad o permiso).
 *   - A2 quiz de opción múltiple «Using Can and Can't Correctly»: RetoQuizCard.
 *   - A3 escritura «Things I Can and Cannot Do»: «Tu turno».
 *   - A4 verdadero/falso: hechos. A5 glosario. A6 fill_blanks: «Completa el
 *     texto». A7 autoevaluación: criterios.
 *
 * Lo que NO es verbatim: el centro comunitario «Los Fresnos», sus letreros y
 * horarios, las personas (nombres ficticios), sus habilidades, las situaciones
 * de permiso y las respuestas son ILUSTRATIVOS. Todas las oraciones en inglés
 * están en inglés estadounidense estándar.
 *
 * Datos puros (sin three ni React).
 */

import type { TextoHuecosData } from "./_mecanica-huecos";
import type { QuizEvaluable } from "./_reto-quiz";

/* ── Modos ────────────────────────────────────────────────────────────── */

export type Modo = "club" | "permiso" | "letreros";
export const MODOS: Modo[] = ["club", "permiso", "letreros"];

export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string }> = {
  club: { etq: "Can you…?", subtitulo: "Entrevista y forma los equipos de los clubes", icono: "fa-people-group", color: "#fbbf24" },
  permiso: { etq: "May I…? Can I…?", subtitulo: "Pide permiso y entiende la respuesta", icono: "fa-hand", color: "#38bdf8" },
  letreros: { etq: "Read the signs", subtitulo: "Lee los letreros y escribe la regla", icono: "fa-sign-hanging", color: "#f472b6" },
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

/**
 * Palabras en inglés sin acentos, mayúsculas ni puntuación. Las formas
 * negativas equivalentes (can't, cant, cannot, can not) quedan como «cant»;
 * «Wi-Fi», «wifi» y «wi fi» quedan como «wifi».
 */
export function tokensIngles(texto: string): string[] {
  const s = texto
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/\bwi[\s-]?fi\b/g, "wifi")
    .replace(/\bcan\s?not\b/g, "cant")
    .replace(/\bcan'?t\b/g, "cant")
    .replace(/'/g, "")
    .replace(/[^a-z0-9\s]/g, " ");
  return s.split(/\s+/).filter(Boolean);
}

/* ════════════════════════════════════════════════════════════════════════
 * El centro comunitario (ilustrativo)
 * ════════════════════════════════════════════════════════════════════════ */

export type EspacioId = "library" | "computer" | "music" | "kitchen" | "court" | "pool";
export type LugarId = EspacioId | "patio";
export const ESPACIOS: EspacioId[] = ["library", "computer", "music", "kitchen", "court", "pool"];

export const LUGAR_DEF: Record<LugarId, { en: string; es: string; icono: string; color: string; letrero: string[] }> = {
  library: { en: "Library", es: "Biblioteca", icono: "fa-book", color: "#a78bfa", letrero: ["Quiet, please.", "No food allowed."] },
  computer: { en: "Computer lab", es: "Laboratorio de cómputo", icono: "fa-desktop", color: "#38bdf8", letrero: ["No food or drinks."] },
  music: { en: "Music room", es: "Salón de música", icono: "fa-guitar", color: "#f472b6", letrero: ["You can borrow a guitar.", "Please ask the teacher."] },
  kitchen: { en: "Kitchen", es: "Cocina", icono: "fa-utensils", color: "#fb923c", letrero: ["You can eat here."] },
  court: { en: "Basketball court", es: "Cancha de básquetbol", icono: "fa-basketball", color: "#f97316", letrero: ["No bikes on the court."] },
  pool: { en: "Swimming pool", es: "Alberca", icono: "fa-person-swimming", color: "#22d3ee", letrero: ["Open 4:00–6:00 p.m.", "No running.", "No ball games."] },
  patio: { en: "Patio", es: "Patio", icono: "fa-wifi", color: "#34d399", letrero: ["Visitors can use the Wi-Fi."] },
};

/** Tipo de línea de un letrero: prohibición, permiso o información. */
export function tipoLinea(linea: string): "no" | "si" | "info" {
  if (/^no\b/i.test(linea) || /\bcan't\b/i.test(linea)) return "no";
  if (/\bcan\b/i.test(linea)) return "si";
  return "info";
}

/* ════════════════════════════════════════════════════════════════════════
 * Personas (ficticias)
 * ════════════════════════════════════════════════════════════════════════ */

export type HabilidadId = "swim" | "basketball" | "cook" | "nahuatl" | "guitar" | "video";
export const HABILIDADES_ORDEN: HabilidadId[] = ["swim", "basketball", "cook", "nahuatl", "guitar", "video"];

export const HABILIDAD_DEF: Record<HabilidadId, { frase: string; es: string; icono: string; espacio: EspacioId; verbo: string; /** Formas aceptadas después del verbo (lo que sigue a «can you»). */ variantes: string[][] }> = {
  swim: { frase: "swim", es: "nadar", icono: "fa-person-swimming", espacio: "pool", verbo: "swim", variantes: [["swim"]] },
  basketball: { frase: "play basketball", es: "jugar básquetbol", icono: "fa-basketball", espacio: "court", verbo: "play", variantes: [["play", "basketball"]] },
  cook: { frase: "cook", es: "cocinar", icono: "fa-fire-burner", espacio: "kitchen", verbo: "cook", variantes: [["cook"]] },
  nahuatl: { frase: "speak Nahuatl", es: "hablar náhuatl", icono: "fa-comments", espacio: "library", verbo: "speak", variantes: [["speak", "nahuatl"]] },
  guitar: { frase: "play the guitar", es: "tocar la guitarra", icono: "fa-guitar", espacio: "music", verbo: "play", variantes: [["play", "the", "guitar"], ["play", "guitar"]] },
  video: { frase: "edit videos", es: "editar videos", icono: "fa-film", espacio: "computer", verbo: "edit", variantes: [["edit", "videos"], ["edit", "video"], ["edit", "a", "video"]] },
};

export type Genero = "he" | "she";

export interface Persona {
  id: string;
  nombre: string;
  genero: Genero;
  /** Rol en inglés y en español (solo adultos o visitantes). */
  rol?: { en: string; es: string };
  adulto: boolean;
  camisa: string;
  pantalon: string;
  pelo: string;
  piel: string;
  peinado: "corto" | "largo" | "cola" | "chongo";
  lentes?: boolean;
  gorra?: string;
  falda?: boolean;
  /** Habilidades (solo los seis candidatos del club). */
  puede?: Record<HabilidadId, boolean>;
}

const hab = (swim: boolean, basketball: boolean, cook: boolean, nahuatl: boolean, guitar: boolean, video: boolean): Record<HabilidadId, boolean> => ({ swim, basketball, cook, nahuatl, guitar, video });

export const PERSONAS: Persona[] = [
  { id: "ximena", nombre: "Ximena", genero: "she", adulto: false, camisa: "#f472b6", pantalon: "#1e3a8a", pelo: "#2b1b12", piel: "#d9a47a", peinado: "largo", puede: hab(true, false, true, false, true, false) },
  { id: "diego", nombre: "Diego", genero: "he", adulto: false, camisa: "#22c55e", pantalon: "#334155", pelo: "#111827", piel: "#c68a5e", peinado: "corto", puede: hab(false, true, false, true, false, true) },
  { id: "itzel", nombre: "Itzel", genero: "she", adulto: false, camisa: "#f59e0b", pantalon: "#1f2937", pelo: "#1a120c", piel: "#b97a4f", peinado: "cola", puede: hab(true, true, true, true, false, false) },
  { id: "mateo", nombre: "Mateo", genero: "he", adulto: false, camisa: "#38bdf8", pantalon: "#3f3f46", pelo: "#4a2e1a", piel: "#e0b089", peinado: "corto", lentes: true, puede: hab(false, false, true, false, true, true) },
  { id: "renata", nombre: "Renata", genero: "she", adulto: false, camisa: "#a78bfa", pantalon: "#0f172a", pelo: "#6b3f1f", piel: "#e8b98f", peinado: "cola", puede: hab(true, false, false, true, false, true) },
  { id: "tomas", nombre: "Tomás", genero: "he", adulto: false, camisa: "#ef4444", pantalon: "#1e293b", pelo: "#0b0b0b", piel: "#a86b43", peinado: "corto", gorra: "#1d4ed8", puede: hab(false, true, false, false, true, false) },
  { id: "lupe", nombre: "Doña Lupe", genero: "she", rol: { en: "visitor", es: "visitante" }, adulto: true, camisa: "#0d9488", pantalon: "#7c2d12", pelo: "#c7c9cc", piel: "#b98160", peinado: "chongo", falda: true },
  { id: "ortega", nombre: "Ms. Ortega", genero: "she", rol: { en: "librarian", es: "bibliotecaria" }, adulto: true, camisa: "#7c3aed", pantalon: "#1f2937", pelo: "#3b2314", piel: "#d6a27c", peinado: "chongo", lentes: true },
  { id: "ramirez", nombre: "Mr. Ramírez", genero: "he", rol: { en: "computer teacher", es: "maestro de cómputo" }, adulto: true, camisa: "#e2e8f0", pantalon: "#475569", pelo: "#1f2937", piel: "#c9916a", peinado: "corto" },
  { id: "salas", nombre: "Coach Salas", genero: "she", rol: { en: "swimming coach", es: "entrenadora de natación" }, adulto: true, camisa: "#0284c7", pantalon: "#0f172a", pelo: "#20140c", piel: "#b47a52", peinado: "cola", gorra: "#dc2626" },
  { id: "tu", nombre: "You", genero: "she", adulto: false, camisa: "#facc15", pantalon: "#1e40af", pelo: "#2a1a10", piel: "#d4a07a", peinado: "corto" },
];

export function persona(id: string): Persona {
  return PERSONAS.find((p) => p.id === id) ?? PERSONAS[0]!;
}

export const CANDIDATOS = ["ximena", "diego", "itzel", "mateo", "renata", "tomas"];

/** Nombre sin acentos en minúsculas, dividido en palabras («Tomás» → ["tomas"]). */
export function nombreTokens(p: Persona): string[] {
  return tokensIngles(p.nombre);
}

/* ════════════════════════════════════════════════════════════════════════
 * Verbos: formas que NO van después de can
 * ════════════════════════════════════════════════════════════════════════ */

const IRREGULARES: Record<string, string[]> = {
  swim: ["swims", "swimming", "swam"],
  eat: ["eats", "eating", "ate"],
  drink: ["drinks", "drinking", "drank"],
  ride: ["rides", "riding", "rode"],
  take: ["takes", "taking", "took"],
  have: ["has", "having", "had"],
  go: ["goes", "going", "went"],
  run: ["runs", "running", "ran"],
  speak: ["speaks", "speaking", "spoke"],
  bring: ["brings", "bringing", "brought"],
};

/** Formas conjugadas de un verbo (con -s, -ing o en pasado). */
export function formasConjugadas(v: string): string[] {
  if (IRREGULARES[v]) return IRREGULARES[v]!;
  const sinE = v.endsWith("e") ? v.slice(0, -1) : v;
  return [`${v}s`, `${v}es`, `${v}ing`, `${sinE}ing`, `${sinE}ed`, `${v}ed`];
}

/** Si la palabra es una forma conjugada de alguno de los verbos, devuelve la base. */
export function baseDe(palabra: string, verbos: string[]): string | null {
  for (const v of verbos) if (formasConjugadas(v).includes(palabra)) return v;
  return null;
}

const MODALES_OTROS = ["must", "mustnt", "should", "shouldnt", "may", "could", "will"];

/* ════════════════════════════════════════════════════════════════════════
 * 1. CAN YOU…? — entrevistas y equipos de los clubes
 * ════════════════════════════════════════════════════════════════════════ */

export interface Mision {
  id: string;
  club: string;
  es: string;
  /** Cartel en inglés. */
  cartel: string;
  color: string;
  icono: string;
  /** Cada puesto pide una o varias habilidades a la misma persona. */
  puestos: HabilidadId[][];
}

export const MISIONES: Mision[] = [
  { id: "sports", club: "Sports Day team", es: "Equipo del día deportivo", cartel: "We need someone who can swim and someone who can play basketball.", color: "#22d3ee", icono: "fa-medal", puestos: [["swim"], ["basketball"]] },
  { id: "cooking", club: "Cooking workshop with grandparents", es: "Taller de cocina con abuelos", cartel: "We need someone who can cook and speak Nahuatl.", color: "#fb923c", icono: "fa-fire-burner", puestos: [["cook", "nahuatl"]] },
  { id: "video", club: "Festival video", es: "Video del festival", cartel: "We need someone who can play the guitar and someone who can edit videos.", color: "#f472b6", icono: "fa-film", puestos: [["guitar"], ["video"]] },
];

export function frasePuesto(p: HabilidadId[]): string {
  return p.map((h) => HABILIDAD_DEF[h].frase).join(" and ");
}

/** Respuesta corta de la persona entrevistada. */
export function respuestaCorta(p: Persona, h: HabilidadId): string {
  if (p.puede?.[h]) return "Yes, I can!";
  const otra = HABILIDADES_ORDEN.find((x) => p.puede?.[x]);
  return otra ? `No, I can't. But I can ${HABILIDAD_DEF[otra].frase}.` : "No, I can't.";
}

/** Nota en 3.ª persona para la libreta del alumno: «Ximena can swim.» */
export function notaTercera(p: Persona, h: HabilidadId): string {
  return `${p.nombre} ${p.puede?.[h] ? "can" : "can't"} ${HABILIDAD_DEF[h].frase}.`;
}

/** Busca una habilidad a partir de la posición i. */
function frasesEn(t: string[], i: number): { h: HabilidadId; len: number } | null {
  for (const h of HABILIDADES_ORDEN) {
    for (const v of HABILIDAD_DEF[h].variantes) {
      if (v.every((w, k) => t[i + k] === w)) return { h, len: v.length };
    }
  }
  return null;
}

/** ¿De qué habilidad habla el texto (aunque el verbo esté mal conjugado)? */
function habilidadMencionada(t: string[]): HabilidadId | null {
  if (t.includes("guitar")) return "guitar";
  if (t.includes("basketball")) return "basketball";
  if (t.includes("nahuatl")) return "nahuatl";
  if (t.some((w) => w === "video" || w === "videos")) return "video";
  if (t.some((w) => w === "swim" || formasConjugadas("swim").includes(w))) return "swim";
  if (t.some((w) => w === "cook" || formasConjugadas("cook").includes(w))) return "cook";
  return null;
}

export type RevisionPregunta = { ok: true; h: HabilidadId; nota: string | null } | { ok: false; msg: string };

const VERBOS_HAB = ["swim", "play", "cook", "speak", "edit"];

/**
 * Revisa una pregunta de habilidad dirigida a una persona: «Can you swim?».
 * Tolera mayúsculas, signos, el nombre como vocativo («Itzel, can you cook?»)
 * y palabras al final («Can you swim well?»).
 */
export function revisaPregunta(texto: string, p: Persona): RevisionPregunta {
  let t = tokensIngles(texto);
  if (!t.length) return { ok: false, msg: "Escribe tu pregunta en inglés: Can + you + verbo…?" };
  const nom = nombreTokens(p);
  if (nom.every((w, k) => t[k] === w)) t = t.slice(nom.length);
  if (t.length > nom.length && nom.every((w, k) => t[t.length - nom.length + k] === w)) t = t.slice(0, t.length - nom.length);
  const h = habilidadMencionada(t);
  const lista = HABILIDADES_ORDEN.map((x) => HABILIDAD_DEF[x].frase).join(", ");
  if (!h) return { ok: false, msg: `No reconozco la habilidad. En este club puedes preguntar por: ${lista}.` };
  const frase = HABILIDAD_DEF[h].frase;
  const modelo = `«Can you ${frase}?»`;

  if (t[0] === "do" || t[0] === "does" || t[0] === "are" || t[0] === "is") {
    if (t.includes("can")) return { ok: false, msg: `No se usa «${t[0]}» con can: es «Can you…?» (can va al inicio, sin do; actividad A4). → ${modelo}` };
    return { ok: false, msg: `Para preguntar por una habilidad usa can: ${modelo}` };
  }
  if (t[0] === "cans" || t.includes("cans")) return { ok: false, msg: `«Cans» no existe: can nunca cambia de forma. → ${modelo}` };
  if (t[0] === "cant") return { ok: false, msg: `Pregunta en afirmativo; la respuesta dirá si puede o no. → ${modelo}` };
  if (t[0] !== "can") {
    if (t[0] === "you" && t[1] === "can") return { ok: false, msg: `«You can ${frase}» es una afirmación. En la pregunta, can va ANTES del sujeto: ${modelo}` };
    if (MODALES_OTROS.includes(t[0]!)) return { ok: false, msg: `Aquí practicamos can para habilidades: ${modelo}` };
    return { ok: false, msg: `Falta can al principio. Pregunta = Can + sujeto + verbo: ${modelo}` };
  }
  const suj = t[1];
  if (suj === "i") return { ok: false, msg: `«Can I…?» pide permiso para ti. Para saber lo que ${p.nombre} sabe hacer, pregúntale con you: ${modelo}` };
  if (suj === "he" || suj === "she" || (suj && nom.includes(suj))) return { ok: false, msg: `Le hablas directamente a ${p.nombre}, así que usa you: ${modelo}` };
  if (suj !== "you") return { ok: false, msg: `Después de can va el sujeto you: ${modelo}` };
  const i = 2;
  if (t[i] === "not" || t[i] === "cant") return { ok: false, msg: `Pregunta en afirmativo: ${modelo}` };
  if (t[i] === "to") return { ok: false, msg: `Después de can no va to: «Can you ${frase}?», no «Can you to ${frase}?» (A2).` };
  const conj = t[i] ? baseDe(t[i]!, VERBOS_HAB) : null;
  if (conj) return { ok: false, msg: `Después de can el verbo va en forma base, sin -s ni -ing: «${conj}», no «${t[i]}». → ${modelo}` };
  const m = frasesEn(t, i);
  if (m && m.h === h) {
    const nota = h === "guitar" && t[3] !== "the" ? "También es común «play the guitar»: con instrumentos se suele usar the." : null;
    return { ok: true, h, nota };
  }
  if (h === "basketball" && t[i] === "play" && t[i + 1] === "the") return { ok: false, msg: "Con deportes no se usa the: «Can you play basketball?» (con instrumentos sí: play the guitar)." };
  if (h === "nahuatl" && t[i] === "speak" && (t[i + 1] === "the" || t[i + 1] === "in")) return { ok: false, msg: "Con idiomas no va the ni in: «Can you speak Nahuatl?» (como speak English, speak Spanish)." };
  if (h === "nahuatl" && t[i] === "talk") return { ok: false, msg: "Con idiomas se usa speak: «Can you speak Nahuatl?»." };
  if ((h === "guitar" || h === "basketball") && t[i] !== "play") return { ok: false, msg: `Con instrumentos y deportes el verbo es play: ${modelo}` };
  if (h === "nahuatl" && t[i] !== "speak") return { ok: false, msg: `Falta el verbo speak: ${modelo}` };
  if (h === "video" && t[i] !== "edit") return { ok: false, msg: `Falta el verbo edit: ${modelo}` };
  return { ok: false, msg: `Revisa el orden: Can + you + verbo en forma base. → ${modelo}` };
}

export type RevisionAviso = { ok: true } | { ok: false; msg: string };

/**
 * Revisa el aviso del club en 3.ª persona: cada integrante con lo que puede
 * hacer en su puesto («Itzel can cook and speak Nahuatl.»).
 */
export function revisaAviso(texto: string, m: Mision, equipo: string[]): RevisionAviso {
  const t = tokensIngles(texto);
  if (!t.length) return { ok: false, msg: "Escribe el aviso: quién está en el equipo y qué puede hacer." };
  const miembros = equipo.map((id) => persona(id));
  const esNombre = (k: number): Persona | null => miembros.find((p) => nombreTokens(p).every((w, j) => t[k + j] === w)) ?? null;
  for (let s = 0; s < m.puestos.length; s++) {
    const p = miembros[s]!;
    const nom = nombreTokens(p);
    const puesto = m.puestos[s]!;
    const modelo = `«${p.nombre} can ${frasePuesto(puesto)}.»`;
    const j = t.findIndex((_, k) => nom.every((w, q) => t[k + q] === w));
    if (j < 0) return { ok: false, msg: `Falta ${p.nombre} en el aviso. Escribe qué puede hacer: ${modelo}` };
    let k = j + nom.length;
    // «Ximena and Mateo can…»: salta los demás nombres del sujeto.
    while (t[k] === "and" && esNombre(k + 1)) k += 1 + nombreTokens(esNombre(k + 1)!).length;
    const w = t[k];
    const pr = p.genero;
    if (w === "cans") return { ok: false, msg: `«Cans» es incorrecto: can nunca cambia, ni con ${pr} (A2: «She can play», no «She cans play»). → ${modelo}` };
    if (w === "cant") return { ok: false, msg: `El aviso anuncia lo que ${p.nombre} SÍ puede hacer en el equipo: ${modelo}` };
    if (w === "is" || w === "are") return { ok: false, msg: `No se usa be con can: ${modelo}` };
    if (w === "does" || w === "do" || w === "dont" || w === "doesnt") return { ok: false, msg: `No se usa do con can: ${modelo}` };
    if (w !== "can") {
      const b = w ? baseDe(w, VERBOS_HAB) : null;
      if (b) return { ok: false, msg: `Falta can. «${p.nombre} ${w}…» habla de lo que hace, no de lo que sabe hacer: ${modelo}` };
      return { ok: false, msg: `Después de ${p.nombre} va can + verbo: ${modelo}` };
    }
    k++;
    if (t[k] === "to") return { ok: false, msg: `Después de can no va to (A2): ${modelo}` };
    const encontradas: HabilidadId[] = [];
    for (;;) {
      const b = t[k] ? baseDe(t[k]!, VERBOS_HAB) : null;
      if (b) return { ok: false, msg: `Aunque el sujeto sea ${p.nombre} (${pr}), después de can el verbo va en forma base: «${b}», no «${t[k]}» (A2: «She can sing», no «She can sings»). → ${modelo}` };
      const f = frasesEn(t, k);
      if (!f) break;
      encontradas.push(f.h);
      k += f.len;
      if (t[k] === "and" && !esNombre(k + 1)) {
        k++;
        if (t[k] === "can") k++;
        continue;
      }
      break;
    }
    if (!encontradas.length) return { ok: false, msg: `Escribe qué puede hacer ${p.nombre} en este equipo: ${modelo}` };
    const mal = encontradas.find((h) => !p.puede?.[h]);
    if (mal) return { ok: false, msg: `${p.nombre} can't ${HABILIDAD_DEF[mal].frase}: en la entrevista te dijo «No, I can't». → ${modelo}` };
    const falta = puesto.find((h) => !encontradas.includes(h));
    if (falta) return { ok: false, msg: `Falta decir que ${p.nombre} can ${HABILIDAD_DEF[falta].frase}: es lo que pide su puesto. → ${modelo}` };
  }
  return { ok: true };
}

export function avisoModelo(m: Mision, equipo: string[]): string {
  return equipo.map((id, s) => `${persona(id).nombre} can ${frasePuesto(m.puestos[s]!)}.`).join(" ");
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. MAY I…? CAN I…? — pedir permiso con fichas
 * ════════════════════════════════════════════════════════════════════════ */

export type FichaP = "May" | "Can" | "Do" | "I" | "you" | "V" | "D" | "C" | "please";
export type Registro = "formal" | "cortes" | "neutral";

export interface Situacion {
  id: string;
  lugar: EspacioId;
  quien: string;
  deseo: string;
  verbo: string;
  /** Distractor: el verbo con -s, -ing o con to. */
  distractor: string;
  complemento: string;
  respuesta: string;
  permitido: boolean;
  /** «¿Puedes hacerlo?» en inglés, para contestar con respuesta corta. */
  puedes: string;
  /** Pregunta de comprensión sobre la respuesta. */
  pregunta: string;
  opciones: string[];
  correcta: number;
  porque: string;
  /** Lugar donde termina haciéndolo. */
  destino: EspacioId;
}

export const SITUACIONES: Situacion[] = [
  { id: "book", lugar: "library", quien: "ortega", deseo: "Quieres llevarte este libro a tu casa.", verbo: "borrow", distractor: "borrows", complemento: "this book", respuesta: "Sure, go ahead. You can keep it for one week.", permitido: true, puedes: "Can you borrow the book?", pregunta: "How long can you keep the book?", opciones: ["for one day", "for one week", "for one month"], correcta: 1, porque: "Ms. Ortega dijo «You can keep it for one week»: puedes quedártelo una semana.", destino: "library" },
  { id: "sandwich", lugar: "library", quien: "ortega", deseo: "Tienes hambre y quieres comer tu torta aquí, en la biblioteca.", verbo: "eat", distractor: "to eat", complemento: "my sandwich here", respuesta: "Sorry, you can't eat in the library. You can eat in the kitchen.", permitido: false, puedes: "Can you eat your sandwich in the library?", pregunta: "Where can you eat your sandwich?", opciones: ["in the library", "in the kitchen", "in the computer lab"], correcta: 1, porque: "«You can't eat in the library. You can eat in the kitchen.» El letrero de la biblioteca dice «No food allowed».", destino: "kitchen" },
  { id: "computer", lugar: "computer", quien: "ramirez", deseo: "Necesitas una computadora para hacer tu tarea.", verbo: "use", distractor: "uses", complemento: "a computer", respuesta: "Yes, you can. Computer number three is free.", permitido: true, puedes: "Can you use a computer?", pregunta: "Which computer can you use?", opciones: ["computer number one", "computer number two", "computer number three"], correcta: 2, porque: "«Computer number three is free»: la computadora número tres está libre (free = libre, desocupada).", destino: "computer" },
  { id: "ball-pool", lugar: "pool", quien: "salas", deseo: "Trajiste una pelota y quieres jugar con ella en la alberca.", verbo: "play", distractor: "to play", complemento: "with my ball in the pool", respuesta: "Sorry, you can't play ball games in the pool. You can play on the basketball court.", permitido: false, puedes: "Can you play with your ball in the pool?", pregunta: "Where can you play with your ball?", opciones: ["in the pool", "in the kitchen", "on the basketball court"], correcta: 2, porque: "«You can play on the basketball court.» El letrero de la alberca dice «No ball games».", destino: "court" },
  { id: "ball-diego", lugar: "court", quien: "diego", deseo: "Tu amigo Diego tiene un balón de básquetbol y quieres usarlo.", verbo: "borrow", distractor: "borrowing", complemento: "your ball", respuesta: "Sure! Here you go. You can use it until five o'clock.", permitido: true, puedes: "Can you borrow Diego's ball?", pregunta: "Until what time can you use the ball?", opciones: ["until four o'clock", "until five o'clock", "until six o'clock"], correcta: 1, porque: "«You can use it until five o'clock»: puedes usarlo hasta las cinco.", destino: "court" },
  { id: "guitar-kitchen", lugar: "kitchen", quien: "itzel", deseo: "Estás en la cocina con tu amiga Itzel y quieres tocar tu guitarra mientras la gente come.", verbo: "play", distractor: "plays", complemento: "my guitar here", respuesta: "Sorry, you can't play here. People are eating. You can play in the music room.", permitido: false, puedes: "Can you play your guitar in the kitchen?", pregunta: "Where can you play your guitar?", opciones: ["in the kitchen", "in the music room", "in the library"], correcta: 1, porque: "«You can't play here. People are eating. You can play in the music room.»", destino: "music" },
];

export const FICHAS_SITUACION: FichaP[][] = SITUACIONES.map((_, i) => baraja<FichaP>(["May", "Can", "Do", "I", "you", "V", "D", "C", "please"], mulberry32(71 + i * 13)));

export function textoFichaP(s: Situacion, f: FichaP): string {
  if (f === "V") return s.verbo;
  if (f === "D") return s.distractor;
  if (f === "C") return s.complemento;
  return f;
}

/** La petición armada: «May I borrow this book, please?». */
export function peticion(s: Situacion, fichas: FichaP[]): string {
  if (!fichas.length) return "";
  const partes = fichas.map((f, i) => {
    const w = textoFichaP(s, f);
    if (f === "please" && i === fichas.length - 1 && i > 0) return `, please`;
    if (f === "please" && i === 0) return "Please,";
    if (i > 0 && (f === "May" || f === "Can" || f === "Do")) return w.toLowerCase();
    return w;
  });
  const txt = partes.join(" ").replace(/ ,/g, ",");
  const conMay = txt.charAt(0).toUpperCase() + txt.slice(1);
  return `${conMay.replace(/\s+/g, " ")}?`;
}

export interface RevisionPermiso {
  errores: string[];
  registro: Registro | null;
  notaRegistro: string | null;
  /** true si fue cortés con un adulto (May I o please). */
  cortesAdulto: boolean;
}

/** Revisa la petición armada con fichas. */
export function revisaPermiso(s: Situacion, fichas: FichaP[]): RevisionPermiso {
  const quien = persona(s.quien);
  const errores: string[] = [];
  const modelo = `«${quien.adulto ? "May" : "Can"} I ${s.verbo} ${s.complemento}${quien.adulto ? ", please" : ""}?»`;
  const tiene = (f: FichaP) => fichas.includes(f);
  const vacio: RevisionPermiso = { errores, registro: null, notaRegistro: null, cortesAdulto: false };
  if (!fichas.length) {
    errores.push("Toca las fichas para armar tu petición.");
    return vacio;
  }
  if (tiene("Do")) errores.push("No se usa do con can ni con may: es «Can I…?» o «May I…?» (A4: nunca «Do you can…?»).");
  if (tiene("May") && tiene("Can")) errores.push("Usa un solo modal: May o Can.");
  if (tiene("you")) errores.push("«Can you…?» pregunta si la otra persona puede hacer algo. Para pedir permiso para ti, el sujeto es I: «Can I…?» / «May I…?».");
  if (tiene("D"))
    errores.push(s.distractor.startsWith("to ") ? `Después de can o may no va to: «${s.verbo}», no «${s.distractor}».` : `Después de can o may el verbo va en forma base: «${s.verbo}», no «${s.distractor}».`);
  const faltan: string[] = [];
  if (!tiene("May") && !tiene("Can")) faltan.push("el modal (May o Can)");
  if (!tiene("I")) faltan.push("el sujeto I");
  if (!tiene("V") && !tiene("D")) faltan.push("el verbo");
  if (!tiene("C")) faltan.push(`«${s.complemento}»`);
  if (faltan.length) errores.push(`Falta ${faltan.join(", ")}.`);
  if (errores.length) return vacio;
  const modal: FichaP = tiene("May") ? "May" : "Can";
  const base: FichaP[] = [modal, "I", "V", "C"];
  const validos: FichaP[][] = tiene("please") ? [["please", ...base], [modal, "I", "please", "V", "C"], [...base, "please"]] : [base];
  const ok = validos.some((o) => o.length === fichas.length && o.every((x, i) => x === fichas[i]));
  if (!ok) {
    if (fichas[0] === "I" || (fichas[0] === "please" && fichas[1] === "I")) errores.push(`«I ${modal.toLowerCase()}…» es una afirmación. En la pregunta, el modal va ANTES del sujeto: ${modelo}`);
    else if (tiene("please")) errores.push(`Orden: ${modal} + I + verbo + complemento; please va al final (o al principio): ${modelo}`);
    else errores.push(`Orden: ${modal} + I + verbo + complemento: ${modelo}`);
    return vacio;
  }
  const registro: Registro = modal === "May" ? "formal" : tiene("please") ? "cortes" : "neutral";
  let notaRegistro: string;
  let cortesAdulto = false;
  if (quien.adulto) {
    if (registro === "neutral") notaRegistro = `Es correcto: «Can I…?» es una forma cortés de pedir permiso (A2). Con un adulto de la escuela suena todavía más amable con please o con May I: «May I ${s.verbo} ${s.complemento}, please?».`;
    else {
      cortesAdulto = true;
      notaRegistro = registro === "formal" ? `Muy bien: May I es la forma más formal; es ideal con ${quien.nombre} (${quien.rol?.es ?? "adulto"}).` : `Muy bien: con please, «Can I…?» suena amable con ${quien.nombre} (${quien.rol?.es ?? "adulto"}).`;
    }
  } else {
    notaRegistro = registro === "formal" ? `Es correcto, pero con ${quien.nombre}, que es tu amigo${quien.genero === "she" ? "a" : ""}, May I suena muy formal. Lo natural entre amigos es «Can I…?».` : `Natural entre amigos: «Can I…?»${registro === "cortes" ? " (con please, además, amable)" : ""}.`;
  }
  return { errores, registro, notaRegistro, cortesAdulto };
}

export const REGISTRO_DEF: Record<Registro, { etq: string; es: string; nivel: number }> = {
  formal: { etq: "May I…?", es: "formal", nivel: 3 },
  cortes: { etq: "Can I…, please?", es: "cortés", nivel: 2 },
  neutral: { etq: "Can I…?", es: "neutral", nivel: 1 },
};

/* ════════════════════════════════════════════════════════════════════════
 * 3. READ THE SIGNS — decidir y escribir la regla
 * ════════════════════════════════════════════════════════════════════════ */

export interface Caso {
  id: string;
  lugar: LugarId;
  quien: string;
  /** Situación en inglés. */
  deseo: string;
  puede: boolean;
  /** Verbos base aceptados en la regla. */
  verbos: string[];
  /** Línea del letrero que decide el caso. */
  linea: string;
  /** Hora en minutos (solo en la alberca). */
  hora?: number;
  porque: string;
  modelo: string;
  /** Sujetos extra aceptados además del nombre y el pronombre. */
  sujetosExtra?: string[][];
  objeto: "phone" | "chips" | "soda" | "guitar" | "bike" | "swim" | "lunch";
}

export const CASOS: Caso[] = [
  { id: "wifi", lugar: "patio", quien: "lupe", deseo: "Doña Lupe is a visitor. She wants to use the Wi-Fi.", puede: true, verbos: ["use", "connect"], linea: "Visitors can use the Wi-Fi.", porque: "El letrero dice «Visitors can use the Wi-Fi»: los visitantes SÍ pueden usarlo, y Doña Lupe es visitante.", modelo: "She can use the Wi-Fi.", sujetosExtra: [["visitors"], ["lupe"]], objeto: "phone" },
  { id: "chips", lugar: "library", quien: "mateo", deseo: "Mateo wants to eat chips in the library.", puede: false, verbos: ["eat", "have"], linea: "No food allowed.", porque: "«No food allowed» = no se permite comida. Las papitas (chips) son comida.", modelo: "He can't eat chips in the library.", objeto: "chips" },
  { id: "soda", lugar: "computer", quien: "diego", deseo: "Diego wants to drink a soda in the computer lab.", puede: false, verbos: ["drink", "have"], linea: "No food or drinks.", porque: "«No food or drinks» = ni comida ni bebidas: un refresco (soda) es una bebida (drink).", modelo: "He can't drink a soda in the computer lab.", objeto: "soda" },
  { id: "guitar", lugar: "music", quien: "itzel", deseo: "Itzel wants to borrow a guitar. She asks the teacher.", puede: true, verbos: ["borrow", "use", "take", "play"], linea: "You can borrow a guitar.", porque: "El letrero da permiso: «You can borrow a guitar», con una condición: «Please ask the teacher». Itzel sí le pregunta al maestro.", modelo: "She can borrow a guitar.", objeto: "guitar" },
  { id: "bike", lugar: "court", quien: "tomas", deseo: "Tomás wants to ride his bike on the basketball court.", puede: false, verbos: ["ride", "use", "bring"], linea: "No bikes on the court.", porque: "«No bikes on the court» = no se permiten bicicletas en la cancha.", modelo: "He can't ride his bike on the court.", objeto: "bike" },
  { id: "swim5", lugar: "pool", quien: "renata", deseo: "It's five o'clock in the afternoon. Renata wants to swim.", puede: true, verbos: ["swim", "use", "go"], linea: "Open 4:00–6:00 p.m.", hora: 17 * 60, porque: "La alberca abre de 4:00 a 6:00 p.m. y el reloj marca las 5:00 p.m.: está abierta.", modelo: "She can swim now.", objeto: "swim" },
  { id: "swim7", lugar: "pool", quien: "ximena", deseo: "It's seven o'clock in the evening. Ximena wants to swim.", puede: false, verbos: ["swim", "use", "go"], linea: "Open 4:00–6:00 p.m.", hora: 19 * 60, porque: "Son las 7:00 p.m. y la alberca cierra a las 6:00 p.m.: ya está cerrada.", modelo: "She can't swim now.", objeto: "swim" },
  { id: "lunch", lugar: "kitchen", quien: "mateo", deseo: "Mateo is hungry. He wants to eat his lunch in the kitchen.", puede: true, verbos: ["eat", "have"], linea: "You can eat here.", porque: "En la cocina el letrero dice «You can eat here»: aquí sí se puede comer (compáralo con la biblioteca).", modelo: "He can eat his lunch in the kitchen.", objeto: "lunch" },
];

export type RevisionRegla = { ok: true } | { ok: false; msg: string; polaridad?: boolean };

/** Revisa la regla escrita con can / can't. Tolera cannot, can not y cant. */
export function revisaRegla(texto: string, c: Caso): RevisionRegla {
  const t = tokensIngles(texto);
  const p = persona(c.quien);
  const pr = p.genero;
  const modelo = `«${c.modelo}»`;
  if (!t.length) return { ok: false, msg: "Escribe la regla completa: sujeto + can o can't + verbo." };
  const sujetos: string[][] = [[pr], nombreTokens(p), ...(c.sujetosExtra ?? [])];
  let k = -1;
  for (const s of sujetos) if (s.every((w, j) => t[j] === w)) k = Math.max(k, s.length);
  if (k < 0) {
    if (t[0] === "can" || t[0] === "cant") return { ok: false, msg: `Falta el sujeto: en inglés siempre se escribe quién. → ${modelo}` };
    const otro = pr === "he" ? "she" : "he";
    if (t[0] === otro) return { ok: false, msg: `${p.nombre} es ${pr === "he" ? "él" : "ella"}: usa ${pr}. → ${modelo}` };
    if (["i", "you", "we", "they", "it"].includes(t[0]!)) return { ok: false, msg: `La regla es sobre ${p.nombre}: empieza con ${p.nombre} o con ${pr}. → ${modelo}` };
    return { ok: false, msg: `Empieza con el sujeto (${p.nombre} o ${pr}) y luego can o can't. → ${modelo}` };
  }
  let w = t[k];
  if (w === "cans") return { ok: false, msg: `«Cans» es incorrecto: can no cambia con ${pr} (A2). → ${modelo}` };
  if ((w === "doesnt" || w === "dont" || w === "does" || w === "do") && (t[k + 1] === "can" || t[k + 1] === "cant")) return { ok: false, msg: `No se usa do con can: la negativa es can't (cannot). → ${modelo}` };
  if (w === "is" || w === "isnt") {
    if (t[k + 1] === "allowed" || (t[k + 1] === "not" && t[k + 2] === "allowed")) return { ok: false, msg: `«Is (not) allowed to» también es correcto, pero aquí practicamos can / can't. → ${modelo}` };
    return { ok: false, msg: `No se usa be con can. → ${modelo}` };
  }
  if (w && MODALES_OTROS.includes(w)) return { ok: false, msg: `«${w === "mustnt" ? "mustn't" : w}» es otro modal${w.startsWith("must") ? " (las reglas con must se ven en Inglés III)" : ""}. Aquí escribe la regla con can o can't. → ${modelo}` };
  let negativa: boolean;
  if (w === "can" && t[k + 1] === "not") {
    negativa = true;
    k += 2;
  } else if (w === "cant") {
    negativa = true;
    k += 1;
  } else if (w === "can") {
    negativa = false;
    k += 1;
  } else {
    const b = w ? baseDe(w, c.verbos) : null;
    if (b || (w && c.verbos.includes(w))) return { ok: false, msg: `Falta can o can't antes del verbo. → ${modelo}` };
    return { ok: false, msg: `Después del sujeto va can o can't. → ${modelo}` };
  }
  if (negativa === c.puede) return { ok: false, polaridad: true, msg: `${negativa ? `Sí puede: ${c.porque}` : `No puede: ${c.porque}`} → ${modelo}` };
  w = t[k];
  if (w === "to") return { ok: false, msg: `Después de can${negativa ? "'t" : ""} no va to: ${modelo}` };
  const b = w ? baseDe(w, c.verbos) : null;
  if (b) return { ok: false, msg: `Después de can${negativa ? "'t" : ""} el verbo va en forma base, aunque el sujeto sea ${pr}: «${b}», no «${w}». → ${modelo}` };
  if (!w) return { ok: false, msg: `Falta el verbo después de can${negativa ? "'t" : ""}. → ${modelo}` };
  if (!c.verbos.includes(w)) return { ok: false, msg: `El verbo de la situación es «${c.verbos[0]}»: ${modelo}` };
  return { ok: true };
}

/* ════════════════════════════════════════════════════════════════════════
 * Estrellas — ¿habilidad o permiso? (ejemplos verbatim de A1, A2 y A5)
 * ════════════════════════════════════════════════════════════════════════ */

export type Uso = "Ability" | "Permission";

export const CLASIFICA_USO: { texto: string; uso: Uso; fuente: string; explicacion: string }[] = [
  { texto: "I can swim.", uso: "Ability", fuente: "A1", explicacion: "(I know how to do it.) Sé hacerlo: es una habilidad." },
  { texto: "She can speak three languages.", uso: "Ability", fuente: "A1", explicacion: "(She has that skill.) Es algo que sabe hacer." },
  { texto: "They can't cook.", uso: "Ability", fuente: "A1", explicacion: "(They don't know how.) No saben cocinar: falta de habilidad." },
  { texto: "Can I use your phone?", uso: "Permission", fuente: "A1", explicacion: "(May I? Is it allowed?) Pide permiso." },
  { texto: "You can leave class early today.", uso: "Permission", fuente: "A1", explicacion: "(Permission granted.) Alguien te da permiso." },
  { texto: "You can't park here.", uso: "Permission", fuente: "A1", explicacion: "(It is not allowed.) No está permitido." },
  { texto: "Can I open the window?", uso: "Permission", fuente: "A2", explicacion: "Asking 'Can I...?' is a polite way to request permission." },
  { texto: "My dog can swim, but it can't climb trees.", uso: "Ability", fuente: "A2", explicacion: "Dogs can swim (ability), but they can't climb trees (lack of ability)." },
  { texto: "You can't use your phone in the exam.", uso: "Permission", fuente: "A2", explicacion: "'Can't' expresses that something is not permitted." },
  { texto: "She can play the guitar.", uso: "Ability", fuente: "A5", explicacion: "Tocar la guitarra es una habilidad." },
  { texto: "Can you cook? — Yes, I can.", uso: "Ability", fuente: "A5", explicacion: "Pregunta y respuesta corta sobre una habilidad común (cocinar)." },
];

export const USOS: { nombre: Uso; es: string; descripcion: string }[] = [
  { nombre: "Ability", es: "Habilidad", descripcion: "Something we know how to do." },
  { nombre: "Permission", es: "Permiso", descripcion: "Something we are allowed to do." },
];

export function rondaUso(rnd: () => number): number[] {
  return baraja(
    CLASIFICA_USO.map((_, i) => i),
    rnd,
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * A3 — Tu turno (revisión automática orientativa)
 * ════════════════════════════════════════════════════════════════════════ */

export const A3 = {
  prompt:
    "Write a short text in English about YOUR abilities and permissions. Include: (a) 3 things you CAN do, (b) 2 things you CAN'T do, (c) 2 things you are permitted to do at school or home, and (d) 1 thing you are NOT permitted to do.",
  pistas: ["Can + base verb: I can dance salsa. I can't play piano.", "For permission: I can use my phone at home. I can't use it in class.", "Be honest and specific about real abilities!"],
  criterios: ["Correctly uses can and can't for ability", "Correctly uses can and can't for permission", "Includes the required number of examples", "Grammar is clear and correct"],
  min: 60,
  max: 180,
};

export interface AnalisisA3 {
  palabras: number;
  afirmativas: number;
  negativas: number;
  contextos: number;
  errores: string[];
}

const TERCERAS = ["swims", "plays", "cooks", "speaks", "dances", "sings", "drives", "rides", "uses", "goes", "does", "has", "reads", "writes", "draws", "runs", "eats", "drinks", "watches", "leaves", "stays", "gets", "makes", "takes", "works", "helps", "wears", "listens"];

export function analizaA3(texto: string): AnalisisA3 {
  const t = tokensIngles(texto);
  const palabras = texto.split(/\s+/).filter((w) => /[a-z0-9]/i.test(w)).length;
  let afirmativas = 0;
  let negativas = 0;
  const errores: string[] = [];
  t.forEach((w, i) => {
    const sig = t[i + 1];
    if (w === "i" && sig === "can") afirmativas++;
    if (w === "i" && sig === "cant") negativas++;
    if (w === "cans") errores.push("«cans» (can nunca cambia)");
    if ((w === "can" || w === "cant") && sig === "to") errores.push(`«${w === "can" ? "can" : "can't"} to» (sin to)`);
    if ((w === "can" || w === "cant") && sig && TERCERAS.includes(sig)) errores.push(`«${w === "can" ? "can" : "can't"} ${sig}» (verbo base, sin -s)`);
    if ((w === "do" || w === "dont" || w === "does" || w === "doesnt") && (sig === "can" || (sig === "you" && t[i + 2] === "can"))) errores.push("«do … can» (no se usa do con can)");
  });
  const contextos = (texto.toLowerCase().match(/\b(at school|at home|in class|in the classroom|in the library|my parents|my mom|my dad|my teacher|allowed|permitted|at night|on weekends)\b/g) ?? []).length;
  return { palabras, afirmativas, negativas, contextos, errores: [...new Set(errores)] };
}

/** Autoevaluación A7 — criterios verbatim. */
export const AUTOEVALUACION_A7 = {
  instrucciones: "Marca tu nivel honesto en cada criterio.",
  criterios: [
    "Uso 'can' y 'can't' para hablar de habilidades.",
    "Pido permiso de forma cortés con 'Can I...?'.",
    "Hago preguntas y doy respuestas cortas con can (Yes, I can / No, I can't).",
    "Uso los momentos del día (in the morning, at night).",
  ],
  escala: ["En inicio", "En proceso", "Logrado", "Destacado"],
  reflexion: "¿Qué habilidad tuya ya puedes expresar en inglés con 'I can...'?",
};

/* ════════════════════════════════════════════════════════════════════════
 * Contenido VERBATIM
 * ════════════════════════════════════════════════════════════════════════ */

export const TITULO_A1 = "Can and Can't: Abilities and Permissions";

/** Lectura A1 — verbatim, en sus párrafos. */
export const LECTURA_A1: string[] = [
  "Can and can't are two very useful words in English. We use 'can' to talk about ability (something we know how to do) and permission (something we are allowed to do).",
  "Ability examples:\n• I can swim. (I know how to do it.)\n• She can speak three languages. (She has that skill.)\n• They can't cook. (They don't know how.)",
  "Permission examples:\n• Can I use your phone? (May I? Is it allowed?)\n• You can leave class early today. (Permission granted.)\n• You can't park here. (It is not allowed.)",
  "Important: 'Can' does NOT change for any subject. We say: I can, you can, he can, she can, we can, they can. There is no -s for third person.",
  "To make a question: Can + subject + verb? Can you help me? Can she drive?\nNegative: cannot or can't. She can't come to the party.",
];

/** Preguntas de comprensión de la lectura A1 — verbatim. */
export const PREGUNTAS_A1: { pregunta: string; respuesta: string }[] = [
  { pregunta: "What are the two uses of 'can'?", respuesta: "Ability (knowing how to do something) and permission (being allowed to do something)." },
  { pregunta: "Does 'can' change for third person singular (he/she/it)?", respuesta: "No, 'can' stays the same for all subjects. No -s for he/she/it." },
  { pregunta: "How do you form a question with 'can'?", respuesta: "Can + subject + verb (base form): Can she drive?" },
];

/** Hechos: quiz A4 (verdadero/falso) — verbatim. */
export const HECHOS: { enunciado: string; respuesta: boolean; retro: string }[] = [
  { enunciado: "Después de 'can' el verbo va en forma base ('She can swim').", respuesta: true, retro: "Correcto: can + verbo base, sin -s ni 'to'." },
  { enunciado: "'Can' sirve para hablar de habilidad y también para pedir permiso.", respuesta: true, retro: "Sí: 'I can cook' (habilidad) / 'Can I go out?' (permiso)." },
  { enunciado: "'Can't' es la forma negativa de 'can' (cannot).", respuesta: true, retro: "Correcto: can't = cannot." },
  { enunciado: "'In the morning' significa 'en la noche'.", respuesta: false, retro: "'In the morning' = en la mañana; 'at night' = en la noche." },
  { enunciado: "Para preguntar usamos 'Do you can...?'.", respuesta: false, retro: "No: es 'Can you...?' (can va al inicio, sin do)." },
];

/** Glosario A5 — verbatim. */
export const GLOSARIO: { termino: string; definicion: string; ejemplo: string }[] = [
  { termino: "can / can't", definicion: "Verbo modal para habilidad y permiso (poder / no poder).", ejemplo: "I can swim. I can't drive." },
  { termino: "to play the guitar", definicion: "Tocar la guitarra.", ejemplo: "She can play the guitar." },
  { termino: "to cook / to swim", definicion: "Cocinar / nadar (habilidades comunes).", ejemplo: "Can you cook? — Yes, I can." },
  { termino: "in the morning / at night", definicion: "Momentos del día: en la mañana / en la noche.", ejemplo: "I study at night." },
  { termino: "days of the week", definicion: "Días de la semana: Monday, Tuesday, Wednesday...", ejemplo: "We have English on Monday." },
  { termino: "Can I...?", definicion: "Forma de pedir permiso de manera cortés.", ejemplo: "Can I open the window?" },
];

export const ACTIVIDAD_A5 = "Escribe 3 cosas que puedes hacer (can) y 2 que no puedes (can't).";

/** A2 «Using Can and Can't Correctly» — verbatim. */
export const QUIZ_A2: QuizEvaluable = {
  titulo: "Using Can and Can't Correctly",
  puntajeMinimo: 70,
  reactivos: [
    { enunciado: "Choose the correct sentence:", opciones: ["She can sings very well.", "She can sing very well.", "She cans sing very well.", "She can to sing very well."], respuestaCorrecta: 1, retroalimentacion: "After 'can', use the base form of the verb (no -s, no to)." },
    { enunciado: "'You ___ use your phone in the exam' (not allowed):", opciones: ["can", "can't", "cans", "cannot to"], respuestaCorrecta: 1, retroalimentacion: "'Can't' expresses that something is not permitted." },
    { enunciado: "What does 'Can I open the window?' express?", opciones: ["Ability", "Permission", "A comparison", "A routine"], respuestaCorrecta: 1, retroalimentacion: "Asking 'Can I...?' is a polite way to request permission." },
    { enunciado: "'My dog ___ swim, but it ___ climb trees.' Choose:", opciones: ["can / can't", "can / cans", "can't / can", "cans / can't"], respuestaCorrecta: 0, retroalimentacion: "Dogs can swim (ability), but they can't climb trees (lack of ability)." },
    { enunciado: "Which sentence uses 'can' INCORRECTLY?", opciones: ["He can drive a truck.", "They can't speak French.", "She cans play basketball.", "Can you help me?"], respuestaCorrecta: 2, retroalimentacion: "'Cans' is wrong — 'can' never changes form. The correct form is 'She can play'." },
  ],
};

/**
 * A6 «Fill in the blanks — What can you do?» — verbatim. En el hueco 4 se
 * aceptan además «May» y «Could», que la actividad no declara pero también son
 * correctas para pedir permiso (se indica en la nota al pie).
 */
export const HUECOS_A6: TextoHuecosData = {
  ancla: "IN-II-P03-A6 · Fill in the blanks — What can you do?",
  instrucciones: "Completa los huecos con can o can't, y con las expresiones de tiempo correctas.",
  partes: ["Leo ", " play the guitar very well, but he ", " swim. He practices music ", " the morning. ", " I borrow your pen, please?"],
  huecos: [
    { respuesta: "can", alternativas: [], pista: "Habilidad afirmativa: sí puede tocar la guitarra." },
    { respuesta: "can't", alternativas: ["cannot", "can not"], pista: "Habilidad negativa: no puede nadar." },
    { respuesta: "in", alternativas: [], pista: "Preposición para 'the morning': ___ the morning." },
    { respuesta: "Can", alternativas: ["can", "May", "Could"], pista: "Pedir permiso de forma cortés." },
  ],
};

export const FUENTE =
  "CEN Bachillerato — Inglés II, progresión 3: lectura A1 «Can and Can't: Abilities and Permissions» (Material elaborado para CEN Bachillerato — IN-II), quiz A2 «Using Can and Can't Correctly», escritura A3, verdadero/falso A4, glosario A5, fill_blanks A6 y autoevaluación A7. Hablantes de náhuatl: INEGI, Censo de Población y Vivienda 2020.";

export const NAHUATL_DATO = "El náhuatl es la lengua indígena con más hablantes en México: 1 651 958 personas de 3 años y más (INEGI, Censo 2020). «Niltze» es un saludo usado en varias variantes del náhuatl.";

export const PROBLEMA =
  "¿Cómo dices en inglés lo que sabes hacer y cómo pides permiso sin sonar grosero? En el Centro Comunitario Los Fresnos entrevistas a seis jóvenes para formar los equipos de tres clubes, pides permiso a adultos y amigos en cada espacio y entiendes lo que te responden, y lees los letreros para escribir qué se puede y qué no se puede hacer.";

export const INSTRUCCIONES: string[] = [
  "En Can you…?, elige a una persona, escríbele una pregunta con «Can you…?» y mira cómo lo intenta. Con lo que te responde, forma cada equipo y escribe su aviso en 3.ª persona.",
  "En May I…? Can I…?, arma con fichas tu petición según a quién le hablas (adulto o amigo), lee la respuesta y contesta si puedes hacerlo y dónde o cuándo.",
  "En Read the signs, lee el letrero del espacio, decide si la persona puede o no, y escribe la regla con can o can't.",
  "Clasifica los ejemplos de A1, A2 y A5 (habilidad o permiso) para ganar estrellas, resuelve el quiz A2, completa el texto A6 y escribe tu propio texto (A3).",
];

export const IDEAS: string[] = [
  "Can sirve para dos cosas: habilidad (I can swim) y permiso (Can I use your phone?).",
  "Can nunca cambia: I can, she can, they can. Sin -s, sin to: she can sing, no «she cans sing» ni «she can to sing».",
  "Pregunta: Can + sujeto + verbo base (Can you cook?). Respuesta corta: Yes, I can. / No, I can't. Nunca «Do you can…?».",
  "Negativa: can't = cannot (también se ve «can not», menos común).",
  "Para pedir permiso: Can I…? es cortés; con please o con May I suena más formal, ideal con adultos. Entre amigos lo natural es Can I…?",
  "En los letreros: «No food allowed», «No running» y «No bikes» prohíben (you can't); «Visitors can use the Wi-Fi» da permiso.",
];

/** Hora «5:00 p.m.» a partir de minutos. */
export function horaCorta(min: number): string {
  const h24 = Math.floor(min / 60) % 24;
  const m = min % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${h24 < 12 ? "a.m." : "p.m."}`;
}

/** ¿La alberca está abierta (4:00–6:00 p.m.) a esa hora? */
export function albercaAbierta(min: number): boolean {
  return min >= 16 * 60 && min < 18 * 60;
}

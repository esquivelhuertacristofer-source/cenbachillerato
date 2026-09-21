/**
 * Datos y modelo del laboratorio "Likes and opinions: la feria de gustos"
 * (IN-I-P07, progresión 7 de Inglés I: «Expresa gustos y opiniones simples en
 * situaciones cotidianas (habla sobre preferencias y razones de forma
 * empática)»).
 *
 * Anclas VERBATIM (IN-I-P07):
 *   - A1 lectura «What do you like? — Gustos y opiniones en inglés»: marco
 *     teórico y panel «Lectura A1» con sus preguntas de comprensión. Su recuadro
 *     sobre la ENDUTIH y la Informática es ajeno al tema y NO se incluye.
 *   - A2 fill_blanks «Do you like...?»: «Completa el diálogo».
 *   - A3 reflexión escrita «Mis gustos en inglés»: «Tu turno».
 *   - A4 quiz de opción múltiple «Likes & opinions — Quiz»: reto evaluable.
 *   - A5 verdadero/falso: hechos. A6 glosario. A7 autoevaluación.
 *   - A8 video: su pregunta abierta y sus dos preguntas cerradas.
 *   - A9 relacionar columnas repite el glosario A6: no se duplica.
 *
 * Lo que NO es verbatim: la Feria de Gustos de la Preparatoria Las Jacarandas,
 * los seis compañeros (nombres ficticios), sus gustos y razones, los perfiles,
 * las mesas, los diálogos y las tarjetas de papel son ILUSTRATIVOS. Todas las
 * oraciones en inglés que no vienen de la BD están en inglés estadounidense
 * estándar.
 *
 * Datos puros (sin three ni React).
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { TextoHuecosData } from "./_mecanica-huecos";

/* ── Modos ────────────────────────────────────────────────────────────── */

export type Modo = "encuesta" | "mesas" | "opinion";
export const MODOS: Modo[] = ["encuesta", "mesas", "opinion"];

export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string }> = {
  encuesta: { etq: "Likes survey", subtitulo: "Entrevista, grafica y escribe conclusiones", icono: "fa-square-poll-vertical", color: "#34d399" },
  mesas: { etq: "Match the friends", subtitulo: "Lee los perfiles y sienta a todos contentos", icono: "fa-people-group", color: "#fbbf24" },
  opinion: { etq: "Give your opinion kindly", subtitulo: "Responde con tu gusto, una razón y empatía", icono: "fa-comments", color: "#f472b6" },
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

export interface Aviso {
  tipo: "error" | "consejo";
  texto: string;
}

/**
 * Palabras en inglés sin acentos, mayúsculas ni puntuación. Las contracciones
 * equivalentes quedan iguales: don't / dont / do not → «dont»; doesn't /
 * does not → «doesnt»; it's → «it is»; that's → «that is»; what's → «what
 * is»; they're → «they are». «videogames» → «video games»; «favourite» →
 * «favorite»; «no one» → «noone».
 */
export function tokens(texto: string): string[] {
  const s = ` ${texto
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .toLowerCase()} `
    .replace(/[’‘`´]/g, "'")
    .replace(/\bdo\s+not\b/g, "dont")
    .replace(/\bdon'?t\b/g, "dont")
    .replace(/\bdoes\s+not\b/g, "doesnt")
    .replace(/\bdoesn'?t\b/g, "doesnt")
    .replace(/\bit'?s\b/g, "it is")
    .replace(/\bthat'?s\b/g, "that is")
    .replace(/\bwhat'?s\b/g, "what is")
    .replace(/\bthey'?re\b/g, "they are")
    .replace(/\bi'?m\b/g, "i am")
    .replace(/\bisn'?t\b/g, "is not")
    .replace(/\bvideo\s?games\b/g, "video games")
    .replace(/\bvideo\s?game\b/g, "video game")
    .replace(/\bfavourite\b/g, "favorite")
    .replace(/\bno\s+one\b/g, "noone")
    .replace(/\bokay\b/g, "ok")
    .replace(/'/g, "")
    .replace(/[^a-z0-9\s]/g, " ");
  return s.split(/\s+/).filter(Boolean);
}

/** ¿La secuencia `w` aparece en `t` a partir de la posición `i`? */
function en(t: string[], i: number, w: string[]): boolean {
  return w.every((x, k) => t[i + k] === x);
}

/** Primera posición donde aparece la secuencia, o -1. */
function busca(t: string[], w: string[], desde = 0): number {
  for (let i = desde; i <= t.length - w.length; i++) if (en(t, i, w)) return i;
  return -1;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/* ════════════════════════════════════════════════════════════════════════
 * La feria: seis puestos, seis temas
 * ════════════════════════════════════════════════════════════════════════ */

export type TemaId = "soccer" | "videogames" | "reading" | "drawing" | "spicy" | "karaoke";
export const TEMAS: TemaId[] = ["soccer", "videogames", "reading", "drawing", "spicy", "karaoke"];

/** Cómo aparece el tema después de like: sustantivo, verbo -ing, to + verbo o verbo base (error). */
export type Forma = "ing" | "noun" | "to" | "base" | "adj";

export interface TemaDef {
  /** Nombre del puesto en inglés. */
  puesto: string;
  /** Cómo se dice el gusto (lo que va después de like). */
  en: string;
  es: string;
  /** Tipo de lo que va después de like en `en`. */
  tipo: "ing" | "noun";
  icono: string;
  color: string;
  variantes: { w: string[]; forma: Forma; football?: boolean }[];
}

export const TEMA_DEF: Record<TemaId, TemaDef> = {
  soccer: {
    puesto: "Sports",
    en: "playing soccer",
    es: "jugar futbol",
    tipo: "ing",
    icono: "fa-futbol",
    color: "#22c55e",
    variantes: [
      { w: ["to", "play", "soccer"], forma: "to" },
      { w: ["to", "play", "football"], forma: "to", football: true },
      { w: ["playing", "soccer"], forma: "ing" },
      { w: ["playing", "football"], forma: "ing", football: true },
      { w: ["play", "soccer"], forma: "base" },
      { w: ["play", "football"], forma: "base", football: true },
      { w: ["soccer"], forma: "noun" },
      { w: ["football"], forma: "noun", football: true },
    ],
  },
  videogames: {
    puesto: "Video games",
    en: "playing video games",
    es: "jugar videojuegos",
    tipo: "ing",
    icono: "fa-gamepad",
    color: "#818cf8",
    variantes: [
      { w: ["to", "play", "video", "games"], forma: "to" },
      { w: ["playing", "video", "games"], forma: "ing" },
      { w: ["play", "video", "games"], forma: "base" },
      { w: ["video", "games"], forma: "noun" },
    ],
  },
  reading: {
    puesto: "Books",
    en: "reading",
    es: "leer",
    tipo: "ing",
    icono: "fa-book-open",
    color: "#38bdf8",
    variantes: [
      { w: ["to", "read", "books"], forma: "to" },
      { w: ["to", "read", "comics"], forma: "to" },
      { w: ["to", "read"], forma: "to" },
      { w: ["reading", "books"], forma: "ing" },
      { w: ["reading", "comics"], forma: "ing" },
      { w: ["reading"], forma: "ing" },
      { w: ["read", "books"], forma: "base" },
      { w: ["read", "comics"], forma: "base" },
      { w: ["read"], forma: "base" },
      { w: ["books"], forma: "noun" },
      { w: ["comics"], forma: "noun" },
    ],
  },
  drawing: {
    puesto: "Art",
    en: "drawing",
    es: "dibujar",
    tipo: "ing",
    icono: "fa-palette",
    color: "#f472b6",
    variantes: [
      { w: ["to", "draw"], forma: "to" },
      { w: ["to", "paint"], forma: "to" },
      { w: ["drawing"], forma: "ing" },
      { w: ["painting"], forma: "ing" },
      { w: ["draw"], forma: "base" },
      { w: ["paint"], forma: "base" },
      { w: ["art"], forma: "noun" },
    ],
  },
  spicy: {
    puesto: "Spicy food",
    en: "spicy food",
    es: "la comida picante",
    tipo: "noun",
    icono: "fa-pepper-hot",
    color: "#f97316",
    variantes: [
      { w: ["to", "eat", "spicy", "food"], forma: "to" },
      { w: ["eating", "spicy", "food"], forma: "ing" },
      { w: ["eat", "spicy", "food"], forma: "base" },
      { w: ["spicy", "food"], forma: "noun" },
      { w: ["spicy", "tacos"], forma: "noun" },
      { w: ["spicy"], forma: "adj" },
    ],
  },
  karaoke: {
    puesto: "Karaoke",
    en: "karaoke",
    es: "el karaoke",
    tipo: "noun",
    icono: "fa-microphone",
    color: "#e879f9",
    variantes: [
      { w: ["to", "sing", "karaoke"], forma: "to" },
      { w: ["to", "sing"], forma: "to" },
      { w: ["singing", "karaoke"], forma: "ing" },
      { w: ["singing"], forma: "ing" },
      { w: ["sing", "karaoke"], forma: "base" },
      { w: ["sing"], forma: "base" },
      { w: ["karaoke"], forma: "noun" },
    ],
  },
};

/** El tema que empieza en la posición i (la variante más larga). */
export function temaEn(t: string[], i: number): { tema: TemaId; forma: Forma; len: number; football: boolean } | null {
  let mejor: { tema: TemaId; forma: Forma; len: number; football: boolean } | null = null;
  for (const id of TEMAS)
    for (const v of TEMA_DEF[id].variantes) if (en(t, i, v.w) && (!mejor || v.w.length > mejor.len)) mejor = { tema: id, forma: v.forma, len: v.w.length, football: !!v.football };
  return mejor;
}

/** ¿Menciona el texto algún tema, en cualquier posición? */
function temaMencionado(t: string[]): TemaId | null {
  for (let i = 0; i < t.length; i++) {
    const m = temaEn(t, i);
    if (m) return m.tema;
  }
  return null;
}

/** «playing soccer» → «play soccer» (lo que escribiría quien olvida el -ing). */
function baseDe(tema: TemaId): string {
  return TEMA_DEF[tema].variantes.find((v) => v.forma === "base")?.w.join(" ") ?? TEMA_DEF[tema].en;
}

/* ════════════════════════════════════════════════════════════════════════
 * Grados de gusto (lectura A1)
 * ════════════════════════════════════════════════════════════════════════ */

/** 5 love · 4 really like · 3 like · 2 don't mind · 1 don't like · 0 hate. */
export type Grado = 0 | 1 | 2 | 3 | 4 | 5;
export const GRADOS: Grado[] = [5, 4, 3, 2, 1, 0];

export const GRADO_DEF: Record<Grado, { en: string; tercera: string; es: string; tu: string; grupo: "like" | "mind" | "dislike"; col: string; icono: string }> = {
  5: { en: "I love", tercera: "loves", es: "Me encanta", tu: "te encanta", grupo: "like", col: "#f472b6", icono: "fa-face-grin-hearts" },
  4: { en: "I really like", tercera: "really likes", es: "Me gusta mucho", tu: "te gusta mucho", grupo: "like", col: "#34d399", icono: "fa-face-grin-stars" },
  3: { en: "I like", tercera: "likes", es: "Me gusta", tu: "te gusta", grupo: "like", col: "#a3e635", icono: "fa-face-smile" },
  2: { en: "I don't mind", tercera: "doesn't mind", es: "No me molesta", tu: "no te molesta", grupo: "mind", col: "#fbbf24", icono: "fa-face-meh" },
  1: { en: "I don't like", tercera: "doesn't like", es: "No me gusta", tu: "no te gusta", grupo: "dislike", col: "#fb923c", icono: "fa-face-frown" },
  0: { en: "I hate", tercera: "hates", es: "Odio", tu: "odias", grupo: "dislike", col: "#ef4444", icono: "fa-face-angry" },
};

/* ════════════════════════════════════════════════════════════════════════
 * Compañeros (ficticios) y sus gustos
 * ════════════════════════════════════════════════════════════════════════ */

export type PersonaId = "ana" | "luis" | "paola" | "jorge" | "daniela" | "emiliano";
export const COMPANEROS: PersonaId[] = ["ana", "luis", "paola", "jorge", "daniela", "emiliano"];

export interface Persona {
  id: PersonaId | "tu";
  nombre: string;
  genero: "he" | "she";
  camisa: string;
  pantalon: string;
  pelo: string;
  piel: string;
  peinado: "corto" | "largo" | "cola" | "chongo";
  lentes?: boolean;
  gorra?: string;
  falda?: boolean;
}

export const PERSONAS: Record<PersonaId | "tu", Persona> = {
  ana: { id: "ana", nombre: "Ana", genero: "she", camisa: "#f472b6", pantalon: "#1e3a8a", pelo: "#2b1b12", piel: "#d9a47a", peinado: "largo" },
  luis: { id: "luis", nombre: "Luis", genero: "he", camisa: "#22c55e", pantalon: "#334155", pelo: "#111827", piel: "#c68a5e", peinado: "corto", gorra: "#1d4ed8" },
  paola: { id: "paola", nombre: "Paola", genero: "she", camisa: "#a78bfa", pantalon: "#0f172a", pelo: "#6b3f1f", piel: "#e8b98f", peinado: "cola", lentes: true },
  jorge: { id: "jorge", nombre: "Jorge", genero: "he", camisa: "#ef4444", pantalon: "#1e293b", pelo: "#0b0b0b", piel: "#a86b43", peinado: "corto" },
  daniela: { id: "daniela", nombre: "Daniela", genero: "she", camisa: "#f59e0b", pantalon: "#7c2d12", pelo: "#1a120c", piel: "#b97a4f", peinado: "chongo", falda: true },
  emiliano: { id: "emiliano", nombre: "Emiliano", genero: "he", camisa: "#38bdf8", pantalon: "#3f3f46", pelo: "#4a2e1a", piel: "#e0b089", peinado: "corto", lentes: true },
  tu: { id: "tu", nombre: "You", genero: "she", camisa: "#facc15", pantalon: "#1e40af", pelo: "#2a1a10", piel: "#d4a07a", peinado: "cola" },
};

export function persona(id: PersonaId | "tu"): Persona {
  return PERSONAS[id];
}

/** Gusto de una persona por un tema: grado y razón (lo que sigue a «because»; null si no da razón). */
export interface Gusto {
  g: Grado;
  razon: string | null;
  /** Palabra clave de la razón («fun», «relaxing»…). */
  clave: string | null;
}

const gu = (g: Grado, razon: string | null, clave: string | null = null): Gusto => ({ g, razon, clave: clave ?? (razon ? razon.split(" ").pop()! : null) });

/**
 * La matriz de gustos (ilustrativa). Diseñada para que:
 *  - las encuestas den conteos distintos (soccer 3, video games 4, reading 2,
 *    drawing 4, spicy food 5, karaoke 3 compañeros a los que les gusta);
 *  - las mesas del modo 2 tengan solución, con trampas de «I don't mind».
 */
export const GUSTOS: Record<PersonaId, Record<TemaId, Gusto>> = {
  ana: {
    soccer: gu(3, "it is fun"),
    videogames: gu(1, "it is boring"),
    reading: gu(4, "it is interesting"),
    drawing: gu(3, "it is relaxing"),
    spicy: gu(0, "it is too spicy for me", "spicy"),
    karaoke: gu(5, "it is fun"),
  },
  luis: {
    soccer: gu(5, "it is exciting"),
    videogames: gu(4, "it is fun"),
    reading: gu(1, "it is boring"),
    drawing: gu(3, "it is easy"),
    spicy: gu(3, "it is delicious"),
    karaoke: gu(0, "it is scary"),
  },
  paola: {
    soccer: gu(0, "it is difficult"),
    videogames: gu(2, null),
    reading: gu(5, "it is interesting"),
    drawing: gu(5, "it is relaxing"),
    spicy: gu(3, "it is delicious"),
    karaoke: gu(3, "it is fun"),
  },
  jorge: {
    soccer: gu(4, "it is exciting"),
    videogames: gu(5, "it is exciting"),
    reading: gu(0, "it is boring"),
    drawing: gu(0, "it is difficult"),
    spicy: gu(5, "it is delicious"),
    karaoke: gu(1, "it is noisy"),
  },
  daniela: {
    soccer: gu(1, "it is difficult"),
    videogames: gu(3, "it is fun"),
    reading: gu(2, null),
    drawing: gu(4, "it is relaxing"),
    spicy: gu(4, "it is delicious"),
    karaoke: gu(2, null),
  },
  emiliano: {
    soccer: gu(2, null),
    videogames: gu(3, "it is fun"),
    reading: gu(1, "it is boring"),
    drawing: gu(1, "it is difficult"),
    spicy: gu(5, "it is delicious"),
    karaoke: gu(4, "it is fun"),
  },
};

/* ════════════════════════════════════════════════════════════════════════
 * 1. LIKES SURVEY — preguntar, graficar y concluir
 * ════════════════════════════════════════════════════════════════════════ */

export type TipoPregunta = "do" | "think";

/** Respuesta del compañero a la pregunta de la encuesta. */
export function respuestaEncuesta(p: PersonaId, tema: TemaId, tipo: TipoPregunta): string {
  const { g, razon } = GUSTOS[p][tema];
  const r = razon ? ` because ${razon}` : "";
  const corta = tipo === "do" ? (g >= 3 ? (g === 5 ? "Yes, I do! " : "Yes, I do. ") : g <= 1 ? (g === 0 ? "No, I don't! " : "No, I don't. ") : "Well, ") : "";
  switch (g) {
    case 5:
      return `${corta}I love it${r}.`;
    case 4:
      return `${corta}I really like it${r}.`;
    case 3:
      return `${corta}I like it${r}.`;
    case 2:
      return tipo === "do" ? "Well, I don't mind it." : "It's OK. I don't mind it.";
    case 1:
      return `${corta}I don't like it${r}.`;
    default:
      return `${corta}I hate it${r}.`;
  }
}

export type RevisionPregunta = { ok: true; forma: Forma; tipo: TipoPregunta; avisos: Aviso[] } | { ok: false; avisos: Aviso[] };

const NOMBRE_TOK: Record<PersonaId, string> = { ana: "ana", luis: "luis", paola: "paola", jorge: "jorge", daniela: "daniela", emiliano: "emiliano" };

/**
 * Revisa la pregunta de la encuesta: «Do you like playing soccer?».
 * Tolera mayúsculas, signos, el nombre como vocativo («Ana, do you like…?»),
 * like + sustantivo o + -ing, y avisa en ámbar de formas válidas no preferidas
 * (like to play, love/enjoy, What do you think of…?).
 */
export function revisaPregunta(texto: string, tema: TemaId, p: PersonaId): RevisionPregunta {
  let t = tokens(texto);
  const avisos: Aviso[] = [];
  const d = TEMA_DEF[tema];
  const modelo = `«Do you like ${d.en}?»`;
  const err = (texto: string): RevisionPregunta => ({ ok: false, avisos: [{ tipo: "error", texto }] });
  const nom = NOMBRE_TOK[p];
  if (t[0] === nom) t = t.slice(1);
  if (t[t.length - 1] === nom) t = t.slice(0, -1);
  if (!t.length) return err(`Escribe tu pregunta en inglés: ${modelo}`);
  if (t.some((w) => ["te", "gusta", "gustan", "porque", "que"].includes(w))) return err(`Escribe la pregunta en inglés: ${modelo}`);
  const otro = COMPANEROS.find((x) => x !== p && t.includes(NOMBRE_TOK[x]));
  if (otro) return err(`Le estás preguntando a ${PERSONAS[p].nombre}, no a ${PERSONAS[otro].nombre}. Háblale directamente con you: ${modelo}`);

  let idx = -1;
  let tipo: TipoPregunta = "do";
  if (
    (t[0] === "what" && t[1] === "do" && t[2] === "you" && t[3] === "think" && (t[4] === "of" || t[4] === "about")) ||
    (t[0] === "how" && t[1] === "do" && t[2] === "you" && t[3] === "feel" && t[4] === "about")
  ) {
    idx = 5;
    tipo = "think";
    avisos.push({ tipo: "consejo", texto: `Tu pregunta es correcta y pide una opinión. Para una encuesta de sí o no, la más directa es ${modelo}` });
  } else if (t[0] === "what" && t.includes("favorite")) {
    return err(`«What's your favorite…?» pide su favorito entre muchas cosas. La encuesta cuenta a quién le gusta ${d.en}: ${modelo}`);
  } else if (t[0] === "do" && t[1] === "you") {
    let v = 2;
    if (t[v] === "really") v++;
    const verbo = t[v];
    if (verbo === "like" || verbo === "love" || verbo === "enjoy") {
      idx = v + 1;
      if (verbo !== "like")
        avisos.push({
          tipo: "consejo",
          texto: `«Do you ${verbo}…?» es correcta, pero ${verbo === "love" ? "pregunta por un gusto muy fuerte (me encanta)" : "enjoy (disfrutar) es un poco más formal"}. En una encuesta neutra se pregunta ${modelo}`,
        });
      else if (t[2] === "really") avisos.push({ tipo: "consejo", texto: `«Do you really like…?» suena a que dudas de su gusto. En la encuesta basta con ${modelo}` });
    } else if (verbo === "likes" || verbo === "loves" || verbo === "enjoys") return err(`Con do, el verbo va sin -s: «Do you like…?», no «Do you ${verbo}…?». → ${modelo}`);
    else if (verbo === "liking") return err(`Después de do you, like va en forma base: ${modelo}`);
    else return err(`Después de «Do you» va el verbo like: ${modelo}`);
  } else if (t[0] === "does") {
    return err(`Con you se usa do: «Do you like…?». Does es para he / she: «Does she like…?». → ${modelo}`);
  } else if (t[0] === "are" || t[0] === "is") {
    return err(`No se usa to be para preguntar por gustos: «Are you like pizza?» es incorrecta (A4). → ${modelo}`);
  } else if (t[0] === "you" && ["like", "likes", "love"].includes(t[1] ?? "")) {
    return err(`Falta do al inicio. En inglés la pregunta de gusto empieza con Do: «You like pizza?» no es la forma correcta (A4). → ${modelo}`);
  } else if (t[0] === "like" || (t[0] === "likes" && t[1] === "you")) {
    return err(`El orden es Do + you + like: «Like you pizza?» es incorrecta (A4). → ${modelo}`);
  } else if (t[0] === "do") {
    return err(`Después de do va el sujeto you: ${modelo}`);
  } else {
    const m = temaMencionado(t);
    return err(m ? `Pregunta con Do you like…? para que te conteste sí o no: ${modelo}` : `Pregunta con Do you like…?: ${modelo}`);
  }

  const m = temaEn(t, idx);
  if (!m) {
    if (idx >= t.length) return err(`Falta qué le gusta: ${modelo}`);
    const otroTema = temaMencionado(t.slice(idx));
    if (otroTema) return err(`Revisa el orden: después de like va directamente el tema. → ${modelo}`);
    return err(`No reconozco el tema. Tu encuesta es sobre el puesto ${d.puesto}: ${modelo}`);
  }
  if (m.tema !== tema) return err(`Tu encuesta de ahora es sobre el puesto ${d.puesto}. Pregunta por ${d.en}: ${modelo}`);
  if (m.forma === "base") return err(`Después de like, el verbo va en -ing: «like ${d.en}», no «like ${baseDe(tema)}» (A4: «I like playing soccer»). → ${modelo}`);
  if (m.forma === "adj") return err(`Spicy (picante) es un adjetivo: necesita el sustantivo. «Do you like spicy food?»`);
  if (m.forma === "to") avisos.push({ tipo: "consejo", texto: `«like to + verbo» también es correcto, pero en A1 practicamos like + -ing: ${modelo}` });
  if (m.football) avisos.push({ tipo: "consejo", texto: "En inglés de Estados Unidos, football es el futbol americano; el futbol se llama soccer." });
  if (m.forma === "noun" && d.tipo === "ing") avisos.push({ tipo: "consejo", texto: `Correcto: like + sustantivo. También puedes preguntar con -ing: ${modelo}` });
  return { ok: true, forma: m.forma, tipo, avisos };
}

/* ── Conclusiones ───────────────────────────────────────────────────── */

/** Categoría de lo que dice la conclusión. */
export type Cat = "love" | "reallylike" | "like" | "mind" | "dislike" | "hate";

export function cuentaCat(tema: TemaId, c: Cat): number {
  return COMPANEROS.filter((p) => cumple(GUSTOS[p][tema].g, c)).length;
}

export function cumple(g: Grado, c: Cat): boolean {
  if (c === "love") return g === 5;
  if (c === "reallylike") return g === 4;
  if (c === "like") return g >= 3;
  if (c === "mind") return g === 2;
  if (c === "dislike") return g <= 1;
  return g === 0;
}

export function conteoTema(tema: TemaId): { like: number; mind: number; dislike: number } {
  return { like: cuentaCat(tema, "like"), mind: cuentaCat(tema, "mind"), dislike: cuentaCat(tema, "dislike") };
}

const NUMEROS: Record<string, number> = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6 };
const PALABRA_NUM = ["zero", "one", "two", "three", "four", "five", "six"];
const RELLENO_SUJ = new Set([
  "students",
  "student",
  "people",
  "person",
  "classmates",
  "classmate",
  "friends",
  "friend",
  "kids",
  "kid",
  "of",
  "them",
  "the",
  "my",
  "our",
  "in",
  "class",
  "group",
  "boys",
  "girls",
  "teenagers",
  "us",
]);

interface Verbo {
  cat: Cat;
  /** true si lleva -s o does (3.ª persona singular). */
  tercera: boolean;
  len: number;
}

/**
 * Verbo de gusto a partir de i: likes / like / really likes / doesn't like /
 * don't mind / loves / hates / enjoys. Devuelve un error si la forma no existe.
 */
function verboEn(t: string[], i: number): Verbo | { error: string } | null {
  const w = t[i];
  const s = t[i + 1];
  if (w === "doesnt" || w === "dont") {
    const tercera = w === "doesnt";
    const aux = tercera ? "doesn't" : "don't";
    if (s === "likes" || s === "loves" || s === "minds" || s === "hates" || s === "enjoys")
      return { error: `Después de ${aux} el verbo va sin -s: «${aux} ${s.slice(0, -1)}», no «${aux} ${s}».` };
    if (s === "like") return { cat: "dislike", tercera, len: 2 };
    if (s === "really" && t[i + 2] === "like") return { cat: "dislike", tercera, len: 3 };
    if (s === "mind") return { cat: "mind", tercera, len: 2 };
    if (s === "love" || s === "enjoy") return { cat: "dislike", tercera, len: 2 };
    return null;
  }
  if (w === "really" && (s === "like" || s === "likes")) return { cat: "reallylike", tercera: s === "likes", len: 2 };
  if (w === "like" || w === "likes") return { cat: "like", tercera: w === "likes", len: 1 };
  if (w === "enjoy" || w === "enjoys") return { cat: "like", tercera: w === "enjoys", len: 1 };
  if (w === "love" || w === "loves") return { cat: "love", tercera: w === "loves", len: 1 };
  if (w === "hate" || w === "hates") return { cat: "hate", tercera: w === "hates", len: 1 };
  if ((w === "no" || w === "not") && (s === "like" || s === "likes"))
    return { error: "En inglés la negativa lleva auxiliar: «doesn't like» (he / she) o «don't like» (I / you / they), no «no like»." };
  if ((w === "is" || w === "are" || w === "am") && (s === "like" || s === "likes")) return { error: "No se usa to be con like: «Ana likes…», no «Ana is like…»." };
  return null;
}

function catFrase(c: Cat, tercera: boolean): string {
  const m: Record<Cat, [string, string]> = {
    love: ["love", "loves"],
    reallylike: ["really like", "really likes"],
    like: ["like", "likes"],
    mind: ["don't mind", "doesn't mind"],
    dislike: ["don't like", "doesn't like"],
    hate: ["hate", "hates"],
  };
  return m[c][tercera ? 1 : 0];
}

function numPalabra(n: number): string {
  return PALABRA_NUM[n] ?? String(n);
}

/** Oración modelo con número: «Three students like playing soccer.» */
export function modeloNumero(tema: TemaId): string {
  const n = cuentaCat(tema, "like");
  const d = TEMA_DEF[tema];
  if (n === 0) return `Nobody likes ${d.en}.`;
  if (n === 6) return `All the students like ${d.en}.`;
  return n === 1 ? `One student likes ${d.en}.` : `${cap(numPalabra(n))} students like ${d.en}.`;
}

export type RevisionConclusion = { ok: boolean; avisos: Aviso[] };

/** Revisa la tercera persona del tema después del verbo. */
function revisaObjeto(t: string[], i: number, tema: TemaId, avisos: Aviso[], modelo: string): boolean {
  const d = TEMA_DEF[tema];
  const m = temaEn(t, i);
  if (!m) {
    if (t[i] === "it" || t[i] === "them") avisos.push({ tipo: "error", texto: `En un reporte escribe el tema, no «${t[i]}»: nadie sabría de qué hablas. → ${modelo}` });
    else if (i >= t.length) avisos.push({ tipo: "error", texto: `Falta el tema después del verbo. → ${modelo}` });
    else avisos.push({ tipo: "error", texto: `Después del verbo va el tema de la encuesta (${d.en}). → ${modelo}` });
    return false;
  }
  if (m.tema !== tema) {
    avisos.push({ tipo: "error", texto: `Esta encuesta es sobre ${d.en}, no sobre ${TEMA_DEF[m.tema].en}. → ${modelo}` });
    return false;
  }
  if (m.forma === "base") {
    avisos.push({ tipo: "error", texto: `Después de like / love / hate / mind, el verbo va en -ing: «${d.en}», no «${baseDe(tema)}». → ${modelo}` });
    return false;
  }
  if (m.forma === "adj") {
    avisos.push({ tipo: "error", texto: `Spicy es adjetivo: escribe «spicy food». → ${modelo}` });
    return false;
  }
  if (m.forma === "to") avisos.push({ tipo: "consejo", texto: `«like to + verbo» es correcto; en A1 practicamos like + -ing: ${d.en}.` });
  if (m.football) avisos.push({ tipo: "consejo", texto: "En inglés de Estados Unidos el futbol es soccer (football es el americano)." });
  return true;
}

/**
 * Conclusión con número: «Three students like playing soccer.», «One student
 * likes…», «Nobody likes…», «All the students like…», «Two students don't like…».
 * La cuenta tiene que coincidir con la encuesta.
 */
export function revisaConclusionNumero(texto: string, tema: TemaId): RevisionConclusion {
  const t = tokens(texto);
  const avisos: Aviso[] = [];
  const modelo = `«${modeloNumero(tema)}»`;
  const fin = (): RevisionConclusion => ({ ok: !avisos.some((a) => a.tipo === "error"), avisos });
  if (!t.length) {
    avisos.push({ tipo: "error", texto: `Escribe cuántos compañeros: número + students + like… → ${modelo}` });
    return fin();
  }
  let i = 0;
  let n: number | null = null;
  let singular: boolean | null = null;
  const w0 = t[0]!;
  if (w0 === "nobody" || w0 === "noone") {
    n = 0;
    singular = true;
    i = 1;
  } else if (w0 === "everybody" || w0 === "everyone") {
    n = 6;
    singular = true;
    i = 1;
  } else if (w0 === "none") {
    n = 0;
    singular = null;
    i = 1;
  } else if (w0 === "all") {
    n = 6;
    singular = false;
    i = 1;
  } else if (w0 === "half") {
    n = 3;
    singular = false;
    i = 1;
  } else if (w0 === "no" && (t[1] === "students" || t[1] === "classmates" || t[1] === "people" || t[1] === "one")) {
    n = 0;
    singular = false;
    i = 1;
  } else if (NUMEROS[w0] !== undefined) {
    n = NUMEROS[w0]!;
    singular = n === 1;
    i = 1;
  } else if (COMPANEROS.some((p) => NOMBRE_TOK[p] === w0)) {
    avisos.push({ tipo: "error", texto: `Esa oración habla de una persona; va en el segundo renglón. Aquí escribe cuántos: ${modelo}` });
    return fin();
  } else {
    avisos.push({ tipo: "error", texto: `Empieza con cuántos compañeros (One, Two, Three… o Nobody / All the students). → ${modelo}` });
    return fin();
  }
  const inicioRelleno = i;
  while (i < t.length && RELLENO_SUJ.has(t[i]!)) i++;
  if (n === 1 && t.slice(inicioRelleno, i).includes("students")) avisos.push({ tipo: "error", texto: `Con uno va el singular: «One student», no «One students». → ${modelo}` });
  if (n !== null && n > 1 && t.slice(inicioRelleno, i).includes("student"))
    avisos.push({ tipo: "error", texto: `Con más de uno va el plural: «${cap(numPalabra(n))} students». → ${modelo}` });
  const v = verboEn(t, i);
  if (!v) {
    avisos.push({ tipo: "error", texto: `Después del sujeto va el verbo de gusto: like / likes, don't like / doesn't like… → ${modelo}` });
    return fin();
  }
  if ("error" in v) {
    avisos.push({ tipo: "error", texto: `${v.error} → ${modelo}` });
    return fin();
  }
  if (singular === true && !v.tercera)
    avisos.push({
      tipo: "error",
      texto: `«${t.slice(0, i).join(" ")}» es singular (una persona): el verbo lleva -s o doesn't. «${cap(t.slice(0, i).join(" "))} ${catFrase(v.cat, true)}…», no «${catFrase(v.cat, false)}». → ${modelo}`,
    });
  if (singular === false && v.tercera)
    avisos.push({
      tipo: "error",
      texto: `«${t.slice(0, i).join(" ")}» es plural: el verbo va sin -s y con don't. «${catFrase(v.cat, false)}», no «${catFrase(v.cat, true)}». → ${modelo}`,
    });
  if (avisos.some((a) => a.tipo === "error")) return fin();
  if (!revisaObjeto(t, i + v.len, tema, avisos, modelo)) return fin();
  const real = cuentaCat(tema, v.cat);
  if (n !== real) {
    const d = TEMA_DEF[tema];
    const c = conteoTema(tema);
    if (v.cat === "like" && n === c.like + c.mind)
      avisos.push({
        tipo: "error",
        texto: `Contaste también a quien dijo «I don't mind it». I don't mind = no me molesta: no es un gusto. En la gráfica: ${c.like} like, ${c.mind} don't mind, ${c.dislike} don't like. → ${modelo}`,
      });
    else if (v.cat === "love" || v.cat === "hate" || v.cat === "reallylike")
      avisos.push({
        tipo: "error",
        texto: `Revisa la gráfica: ${real === 1 ? "solo una persona dijo" : `${real} personas dijeron`} «${GRADO_DEF[v.cat === "love" ? 5 : v.cat === "hate" ? 0 : 4].en.replace("I ", "")}» ${d.en}.${v.cat === "hate" ? "" : " Para contar a todos a quienes les gusta usa like:"} ${modelo}`,
      });
    else
      avisos.push({
        tipo: "error",
        texto: `La encuesta no dice eso: ${real} ${real === 1 ? "compañero" : "compañeros"} ${catFrase(v.cat, real === 1)} ${d.en}. Cuenta las columnas de la gráfica. → ${modelo}`,
      });
  }
  return fin();
}

/** Oración modelo sobre una persona. */
export function modeloPersona(p: PersonaId, tema: TemaId): string {
  return `${PERSONAS[p].nombre} ${GRADO_DEF[GUSTOS[p][tema].g].tercera} ${TEMA_DEF[tema].en}.`;
}

/**
 * Oración en 3.ª persona sobre un compañero: «Jorge doesn't like reading.»
 * Revisa -s, doesn't + verbo base, -ing y que sea verdad. Si `soloPersona`
 * se da, la oración debe hablar de ella.
 */
export function revisaConclusionPersona(texto: string, tema: TemaId, soloPersona?: PersonaId, t0?: string[]): RevisionConclusion & { persona: PersonaId | null; fin: number } {
  const t = t0 ?? tokens(texto);
  const avisos: Aviso[] = [];
  const fin = (persona: PersonaId | null, k: number) => ({ ok: !avisos.some((a) => a.tipo === "error"), avisos, persona, fin: k });
  const p = COMPANEROS.find((x) => t[0] === NOMBRE_TOK[x]) ?? null;
  const modeloDe = (x: PersonaId) => `«${modeloPersona(x, tema)}»`;
  if (!p) {
    const ej = soloPersona ?? "jorge";
    if (t[0] === "he" || t[0] === "she") avisos.push({ tipo: "error", texto: `En un reporte empieza con el nombre: quien lo lea no sabe quién es ${t[0]}. → ${modeloDe(ej)}` });
    else if (t[0] && NUMEROS[t[0]] !== undefined)
      avisos.push({ tipo: "error", texto: `Esa oración cuenta a varios; va en el primer renglón. Aquí escribe sobre una persona: ${modeloDe(ej)}` });
    else avisos.push({ tipo: "error", texto: `Empieza con el nombre de ${soloPersona ? PERSONAS[soloPersona].nombre : "un compañero"}. → ${modeloDe(ej)}` });
    return fin(null, 0);
  }
  if (soloPersona && p !== soloPersona) {
    avisos.push({ tipo: "error", texto: `Aquí escribe sobre ${PERSONAS[soloPersona].nombre}. → ${modeloDe(soloPersona)}` });
    return fin(p, 0);
  }
  const nombre = PERSONAS[p].nombre;
  const modelo = modeloDe(p);
  const v = verboEn(t, 1);
  if (!v) {
    avisos.push({ tipo: "error", texto: `Después de ${nombre} va el verbo de gusto con -s: likes, loves, hates, doesn't like… → ${modelo}` });
    return fin(p, 1);
  }
  if ("error" in v) {
    avisos.push({ tipo: "error", texto: `${v.error} → ${modelo}` });
    return fin(p, 1);
  }
  if (!v.tercera) {
    const w = t[1];
    if (w === "dont")
      avisos.push({ tipo: "error", texto: `Con ${nombre} (${PERSONAS[p].genero}) la negativa es doesn't: «${nombre} doesn't like…», no «${nombre} don't like…». → ${modelo}` });
    else
      avisos.push({
        tipo: "error",
        texto: `Con ${nombre} (${PERSONAS[p].genero}, 3.ª persona) el verbo lleva -s: «${nombre} ${catFrase(v.cat, true)}», no «${nombre} ${catFrase(v.cat, false)}». → ${modelo}`,
      });
    return fin(p, 1);
  }
  const k = 1 + v.len;
  if (!revisaObjeto(t, k, tema, avisos, modelo)) return fin(p, k);
  const m = temaEn(t, k)!;
  const { g } = GUSTOS[p][tema];
  const dijo = respuestaEncuesta(p, tema, "do");
  if (!cumple(g, v.cat)) {
    avisos.push({ tipo: "error", texto: `No es lo que respondió ${nombre}. Dijo: «${dijo}» → ${modelo}` });
    return fin(p, k + m.len);
  }
  if (v.cat === "like" && g === 5) avisos.push({ tipo: "consejo", texto: `Es verdad; y como dijo «I love it», también puedes escribir «${nombre} loves ${TEMA_DEF[tema].en}».` });
  if (v.cat === "dislike" && g === 0)
    avisos.push({ tipo: "consejo", texto: `Es verdad; y como dijo «I hate it», también puedes escribir «${nombre} hates ${TEMA_DEF[tema].en}».` });
  return fin(p, k + m.len);
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. MATCH THE FRIENDS — perfiles y mesas
 * ════════════════════════════════════════════════════════════════════════ */

export interface Escenario {
  id: string;
  titulo: string;
  es: string;
  consigna: string;
  temas: [TemaId, TemaId, TemaId];
  mesa: Record<string, string>;
}

export const ESCENARIOS: Escenario[] = [
  {
    id: "recreo",
    titulo: "Recess clubs",
    es: "Clubes del recreo",
    consigna: "There are three tables at recess and two seats at each table. Everyone wants to have fun!",
    temas: ["videogames", "drawing", "karaoke"],
    mesa: { videogames: "Video game table", drawing: "Drawing table", karaoke: "Karaoke table" },
  },
  {
    id: "sabado",
    titulo: "Saturday groups",
    es: "Grupos del sábado",
    consigna: "On Saturday there are three groups with two places each. Put every friend in a group they like.",
    temas: ["soccer", "reading", "spicy"],
    mesa: { soccer: "Soccer group", reading: "Book club", spicy: "Spicy taco night" },
  },
];

const SALUDO: Record<PersonaId, string> = {
  ana: "Hi, I'm Ana.",
  luis: "Hello! My name is Luis.",
  paola: "Hi! I'm Paola.",
  jorge: "Hey, I'm Jorge.",
  daniela: "Hi, my name is Daniela.",
  emiliano: "Hello, I'm Emiliano.",
};

/** Oración del perfil sobre un tema, según el grado. */
export function fraseGusto(p: PersonaId, tema: TemaId): string {
  const { g, razon } = GUSTOS[p][tema];
  const x = TEMA_DEF[tema].en;
  const r = razon ? ` because ${razon}` : "";
  if (g === 5) return `I love ${x}${r}.`;
  if (g === 4) return `I really like ${x}${r}.`;
  if (g === 3) return `I like ${x}${r}.`;
  if (g === 2) return `${cap(x)}? I don't mind it.`;
  if (g === 1) return `I don't like ${x}${r}.`;
  return `I hate ${x}${r}.`;
}

/** Perfil de un compañero en un escenario (el orden de los temas rota por persona). */
export function perfil(p: PersonaId, esc: Escenario): string {
  const k = COMPANEROS.indexOf(p);
  const orden = [0, 1, 2].map((j) => esc.temas[(j + k) % 3]!);
  return `${SALUDO[p]} ${orden.map((tm) => fraseGusto(p, tm)).join(" ")}`;
}

export interface ResultadoMesa {
  persona: PersonaId;
  tema: TemaId;
  g: Grado;
  feliz: boolean;
  texto: string;
}

/** Revisa quién queda contento en su mesa (like, really like o love). */
export function revisaMesas(asientos: Partial<Record<PersonaId, TemaId>>): ResultadoMesa[] {
  return COMPANEROS.filter((p) => asientos[p]).map((p) => {
    const tema = asientos[p]!;
    const { g } = GUSTOS[p][tema];
    const nombre = PERSONAS[p].nombre;
    const frase = fraseGusto(p, tema);
    let texto: string;
    if (g >= 3) texto = `${nombre} está contento${PERSONAS[p].genero === "she" ? "a" : ""}: «${frase}»`;
    else if (g === 2) texto = `${nombre} dijo «${frase}» I don't mind = no me molesta: no le disgusta, pero tampoco le gusta. Busca una mesa que diga like, really like o love.`;
    else texto = `${nombre} dijo «${frase}» En esa mesa no la pasaría bien${g === 0 ? " (hate = odiar, el grado más fuerte)" : ""}.`;
    return { persona: p, tema, g, feliz: g >= 3, texto };
  });
}

export const CUPO_MESA = 2;

/**
 * Explica con because por qué un amigo está contento en su mesa:
 * «Paola loves drawing because it is relaxing.» La razón debe ser la del perfil.
 */
export function revisaPorQue(texto: string, asientos: Partial<Record<PersonaId, TemaId>>): RevisionConclusion & { persona: PersonaId | null } {
  const t = tokens(texto);
  const avisos: Aviso[] = [];
  const fin = (persona: PersonaId | null) => ({ ok: !avisos.some((a) => a.tipo === "error"), avisos, persona });
  const p = COMPANEROS.find((x) => t[0] === NOMBRE_TOK[x]) ?? null;
  if (!p) {
    avisos.push({ tipo: "error", texto: "Empieza con el nombre de un amigo que ya está en su mesa: «Paola loves drawing because it is relaxing.»" });
    return fin(null);
  }
  const tema = asientos[p];
  const nombre = PERSONAS[p].nombre;
  if (!tema) {
    avisos.push({ tipo: "error", texto: `${nombre} todavía no está en una mesa.` });
    return fin(p);
  }
  const { g, razon, clave } = GUSTOS[p][tema];
  const modelo = `«${modeloPersona(p, tema).replace(/\.$/, "")}${razon ? ` because ${razon}` : ""}.»`;
  const kb = t.indexOf("because");
  const antes = kb >= 0 ? t.slice(0, kb) : t;
  const r = revisaConclusionPersona("", tema, p, antes);
  avisos.push(...r.avisos);
  if (!r.ok) return fin(p);
  if (g < 3) {
    avisos.push({ tipo: "error", texto: `${nombre} no está contento${PERSONAS[p].genero === "she" ? "a" : ""} en esa mesa: cámbialo de lugar primero.` });
    return fin(p);
  }
  if (r.fin < antes.length) {
    const resto = antes.slice(r.fin);
    if (!(resto.length <= 3 && resto.every((w) => ["a", "lot", "very", "much", "so", "too", "and"].includes(w))))
      avisos.push({ tipo: "consejo", texto: `Revisa lo que va entre el tema y because («${resto.join(" ")}»).` });
  }
  if (kb < 0) {
    avisos.push({ tipo: "error", texto: `Falta la razón con because (porque). El perfil dice «…because ${razon}». → ${modelo}` });
    return fin(p);
  }
  const des = t.slice(kb + 1);
  if (!des.length) {
    avisos.push({ tipo: "error", texto: `Después de because va la razón completa: ${modelo}` });
    return fin(p);
  }
  if (des[0] === "is" || des[0] === "are") {
    avisos.push({ tipo: "error", texto: `Falta el sujeto después de because: «because it is…», no «because is…». En inglés el sujeto no se omite. → ${modelo}` });
    return fin(p);
  }
  if (clave && !des.includes(clave)) {
    avisos.push({ tipo: "error", texto: `Lee otra vez el perfil de ${nombre}: «${fraseGusto(p, tema)}» → ${modelo}` });
    return fin(p);
  }
  if (!(des[0] === "it" || des[0] === "they" || des[0] === "she" || des[0] === "he"))
    avisos.push({ tipo: "consejo", texto: `La razón suele empezar con sujeto + to be: because it is ${clave ?? "fun"}.` });
  return fin(p);
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. GIVE YOUR OPINION KINDLY — responder con gusto, razón y empatía
 * ════════════════════════════════════════════════════════════════════════ */

export type TipoTurno = "do" | "think" | "favorite";

export interface Turno {
  id: string;
  quien: PersonaId;
  tema: TemaId;
  tipo: TipoTurno;
  /** Lo que dice el compañero (opinión + pregunta). */
  linea: string;
  /** Grado de gusto del compañero (su emoji). */
  gradoCompa: Grado;
  /** Tu tarjeta de papel. */
  tarjeta: {
    /** Tu grado (null en «favorite»). */
    grado: Grado | null;
    /** Palabra clave de tu razón, en inglés. */
    razon: string;
    razonEs: string;
    /** Tu favorito (solo «favorite»). */
    favorito?: { en: string; es: string; w: string[][] };
    /** Lo que prefieres (obligatorio si `requierePrefer`). */
    prefiere?: { en: string; es: string; w: string[][] };
    requierePrefer?: boolean;
    categoria?: string;
  };
  /** ¿Tu gusto es distinto al del compañero? Entonces la empatía es obligatoria. */
  diferente: boolean;
  modelo: string;
}

export const TURNOS: Turno[] = [
  {
    id: "videojuegos",
    quien: "jorge",
    tema: "videogames",
    tipo: "do",
    linea: "I love playing video games! They are so exciting. Do you like playing video games?",
    gradoCompa: 5,
    tarjeta: { grado: 1, razon: "boring", razonEs: "aburrido", prefiere: { en: "reading", es: "leer", w: [["reading"]] } },
    diferente: true,
    modelo: "That's cool! No, I don't. I don't like playing video games because it is boring for me. I prefer reading.",
  },
  {
    id: "lectura",
    quien: "paola",
    tema: "reading",
    tipo: "think",
    linea: "What do you think of reading? I think it's great! It's so interesting.",
    gradoCompa: 5,
    tarjeta: { grado: 4, razon: "relaxing", razonEs: "relajante" },
    diferente: false,
    modelo: "Me too! I really like reading because it is relaxing.",
  },
  {
    id: "deporte",
    quien: "luis",
    tema: "soccer",
    tipo: "favorite",
    linea: "My favorite sport is soccer. It's so exciting! What's your favorite sport?",
    gradoCompa: 5,
    tarjeta: { grado: null, razon: "fun", razonEs: "divertido", favorito: { en: "basketball", es: "el básquetbol", w: [["basketball"]] }, categoria: "sport" },
    diferente: true,
    modelo: "That's cool! My favorite sport is basketball because it is fun.",
  },
  {
    id: "picante",
    quien: "ana",
    tema: "spicy",
    tipo: "do",
    linea: "I hate spicy food. It's too spicy for me! Do you like spicy food?",
    gradoCompa: 0,
    tarjeta: { grado: 5, razon: "delicious", razonEs: "delicioso" },
    diferente: true,
    modelo: "I see. Yes, I do! I love spicy food because it is delicious. That's fine, everyone is different.",
  },
  {
    id: "karaoke",
    quien: "emiliano",
    tema: "karaoke",
    tipo: "think",
    linea: "What do you think of karaoke? I really like it! It's fun.",
    gradoCompa: 4,
    tarjeta: { grado: 2, razon: "relaxing", razonEs: "relajante", prefiere: { en: "drawing", es: "dibujar", w: [["drawing"], ["painting"]] }, requierePrefer: true },
    diferente: true,
    modelo: "That's nice! I don't mind karaoke, but I prefer drawing because it is relaxing.",
  },
  {
    id: "pasatiempo",
    quien: "daniela",
    tema: "drawing",
    tipo: "favorite",
    linea: "I really like drawing. It's relaxing. What's your favorite hobby?",
    gradoCompa: 4,
    tarjeta: { grado: null, razon: "interesting", razonEs: "interesante", favorito: { en: "reading", es: "leer", w: [["reading"], ["reading", "books"]] }, categoria: "hobby" },
    diferente: true,
    modelo: "That's nice! My favorite hobby is reading because it is interesting.",
  },
];

/** Adjetivos para dar razones (lectura A1 y pistas de A3). */
export const ADJETIVOS: { en: string; es: string; pos: boolean }[] = [
  { en: "fun", es: "divertido", pos: true },
  { en: "interesting", es: "interesante", pos: true },
  { en: "delicious", es: "delicioso", pos: true },
  { en: "exciting", es: "emocionante", pos: true },
  { en: "easy", es: "fácil", pos: true },
  { en: "relaxing", es: "relajante", pos: true },
  { en: "boring", es: "aburrido", pos: false },
  { en: "difficult", es: "difícil", pos: false },
  { en: "expensive", es: "caro", pos: false },
  { en: "scary", es: "que da miedo", pos: false },
];

const SINONIMOS: Record<string, string[]> = {
  fun: ["fun", "entertaining"],
  delicious: ["delicious", "tasty", "yummy"],
  relaxing: ["relaxing"],
  interesting: ["interesting"],
  boring: ["boring"],
  exciting: ["exciting"],
};

const EMPATIA: string[][] = [
  ["that", "is", "cool"],
  ["that", "is", "nice"],
  ["that", "is", "great"],
  ["that", "is", "awesome"],
  ["that", "is", "fine"],
  ["that", "is", "ok"],
  ["that", "is", "interesting"],
  ["that", "is", "fair"],
  ["cool"],
  ["nice"],
  ["awesome"],
  ["i", "see"],
  ["really"],
  ["why"],
  ["everyone", "is", "different"],
  ["everybody", "is", "different"],
  ["fair", "enough"],
  ["i", "understand"],
  ["good", "for", "you"],
  ["no", "problem"],
  ["me", "too"],
  ["so", "do", "i"],
  ["i", "respect", "that"],
];

/**
 * ¿Hay una reacción empática? Las palabras sueltas cuentan solo como reacción:
 * «really» no cuenta en «I really like» ni en «not really», y «cool» / «nice»
 * no cuentan como razón («because it is nice»).
 */
export function esEmpatico(t: string[]): boolean {
  return EMPATIA.some((w) => {
    let k = busca(t, w);
    while (k >= 0) {
      if (w.length > 1) return true;
      const prev = t[k - 1];
      const sig = t[k + 1];
      const suelta =
        w[0] === "really"
          ? prev !== "i" && prev !== "not" && prev !== "dont" && !["like", "likes", "love", "enjoy", "dont", "want"].includes(sig ?? "")
          : !["is", "are", "very", "so", "really", "a", "it", "be"].includes(prev ?? "");
      if (suelta) return true;
      k = busca(t, w, k + 1);
    }
    return false;
  });
}

const GROSERIAS: { w: string[]; texto: string }[] = [
  { w: ["stupid"], texto: "«stupid» (tonto) descalifica" },
  { w: ["dumb"], texto: "«dumb» (tonto) descalifica" },
  { w: ["weird"], texto: "«weird» (raro) juzga a la persona" },
  { w: ["crazy"], texto: "«crazy» (loco) juzga a la persona" },
  { w: ["ugly"], texto: "«ugly» (feo) es un insulto" },
  { w: ["gross"], texto: "«gross» (asqueroso) desprecia lo que le gusta" },
  { w: ["disgusting"], texto: "«disgusting» (asqueroso) desprecia lo que le gusta" },
  { w: ["yuck"], texto: "«yuck» (¡guácala!) desprecia lo que le gusta" },
  { w: ["terrible"], texto: "«terrible» exagera y desprecia su gusto" },
  { w: ["horrible"], texto: "«horrible» exagera y desprecia su gusto" },
  { w: ["sucks"], texto: "«sucks» es grosero" },
  { w: ["lame"], texto: "«lame» (patético) descalifica" },
  { w: ["you", "are", "wrong"], texto: "«you are wrong»: en los gustos nadie está equivocado" },
  { w: ["nobody", "likes"], texto: "«nobody likes…» descalifica su gusto" },
  { w: ["who", "likes"], texto: "«who likes…?» suena a burla" },
  { w: ["bad", "taste"], texto: "«bad taste» (mal gusto) descalifica" },
  { w: ["shut", "up"], texto: "«shut up» (cállate) es grosero" },
];

const ESPANOL = ["me", "gusta", "gustan", "encanta", "porque", "odio", "prefiero", "eso", "genial", "tambien", "mucho", "comida", "leer", "dibujar", "favorito"];
const VERBOS_BASE = ["play", "read", "draw", "paint", "eat", "sing", "watch", "dance", "swim", "cook", "go", "listen", "run", "write"];

/** Afirmaciones de gusto con sujeto I: cat y posición. */
function gustosDeYo(t: string[]): { cat: Cat; i: number; len: number }[] {
  const out: { cat: Cat; i: number; len: number }[] = [];
  for (let i = 0; i < t.length; i++) {
    if (t[i] !== "i") continue;
    const v = verboEn(t, i + 1);
    if (v && !("error" in v)) out.push({ cat: v.cat, i: i + 1, len: v.len });
  }
  return out;
}

export interface RevisionTurno {
  ok: boolean;
  avisos: Aviso[];
  rudo: boolean;
  empatico: boolean;
  /** Única falla: faltó reaccionar con empatía ante un gusto distinto. */
  faltaEmpatia: boolean;
}

function mencionaAlguna(t: string[], ws: string[][], desde = 0): number {
  for (const w of ws) {
    const k = busca(t, w, desde);
    if (k >= 0) return k;
  }
  return -1;
}

/**
 * Revisa la respuesta a un compañero: tu gusto (según tu tarjeta), una razón
 * con because y, si tu gusto es distinto, una reacción empática antes. Detecta
 * descalificaciones y los errores típicos (I likes, I no like, like + verbo
 * base, because is…, Yes, I like).
 */
export function revisaTurno(texto: string, tu: Turno): RevisionTurno {
  const t = tokens(texto);
  const avisos: Aviso[] = [];
  const nombre = PERSONAS[tu.quien].nombre;
  const res = (rudo = false, empatico = false, faltaEmpatia = false): RevisionTurno => ({ ok: !avisos.some((a) => a.tipo === "error"), avisos, rudo, empatico, faltaEmpatia });
  const modelo = `«${tu.modelo}»`;
  if (t.length === 0) {
    avisos.push({ tipo: "error", texto: `Escribe tu respuesta en inglés. Por ejemplo: ${modelo}` });
    return res();
  }
  if (t.filter((w) => ESPANOL.includes(w)).length >= 2) {
    avisos.push({ tipo: "error", texto: "Hay palabras en español. Responde en inglés: tu tarjeta te da la idea y el banco de razones las palabras." });
    return res();
  }

  // 1 · Descalificaciones
  const grosera = GROSERIAS.filter((g) => busca(t, g.w) >= 0);
  if (grosera.length) {
    avisos.push({
      tipo: "error",
      texto: `${grosera.map((g) => g.texto).join("; ")}. Puedes no compartir su gusto sin despreciarlo: di lo que tú prefieres y por qué («I see. I don't like it because it is boring for me»). Respetar gustos distintos es parte de la empatía (A5).`,
    });
    return res(true, false);
  }

  const empatico = esEmpatico(t);
  const card = tu.tarjeta;

  // 2 · Errores de forma
  t.forEach((w, i) => {
    const s = t[i + 1];
    if (w === "i" && (s === "likes" || s === "loves" || s === "hates" || s === "enjoys" || s === "prefers"))
      avisos.push({ tipo: "error", texto: `Con I el verbo va sin -s: «I ${s.slice(0, -1)}», no «I ${s}» (la -s es para he / she).` });
    if (w === "i" && (s === "no" || s === "not") && (t[i + 2] === "like" || t[i + 2] === "mind"))
      avisos.push({ tipo: "error", texto: `La negativa lleva don't: «I don't ${t[i + 2]}», no «I ${s} ${t[i + 2]}».` });
    if (w === "i" && s === "am" && (t[i + 2] === "like" || t[i + 2] === "love")) avisos.push({ tipo: "error", texto: `No se usa am con like: «I like…», no «I am like…».` });
    if (w === "dont" && (s === "likes" || s === "minds")) avisos.push({ tipo: "error", texto: `Después de don't el verbo va sin -s: «don't ${s.slice(0, -1)}».` });
    if ((w === "like" || w === "love" || w === "hate" || w === "enjoy" || w === "prefer" || w === "mind") && s && VERBOS_BASE.includes(s) && t[i - 1] !== "to")
      avisos.push({
        tipo: "error",
        texto: `Después de ${w} el verbo va en -ing: «${w} ${s === "swim" ? "swimming" : s === "run" ? "running" : s === "dance" ? "dancing" : s === "write" ? "writing" : `${s}ing`}», no «${w} ${s}» (A4).`,
      });
    if (w === "because" && (s === "is" || s === "are"))
      avisos.push({ tipo: "error", texto: `Falta el sujeto: «because it is…», no «because ${s}…». En inglés el sujeto no se omite.` });
    if (w === "yes" && s === "i" && (t[i + 2] === "like" || t[i + 2] === "am") && (t[i + 3] === "because" || t[i + 3] === undefined))
      avisos.push({ tipo: "error", texto: `La respuesta corta es «Yes, I do», no «Yes, I ${t[i + 2]}» (A4).` });
    if (w === "no" && s === "i" && t[i + 2] === "not") avisos.push({ tipo: "error", texto: "La respuesta corta negativa es «No, I don't»." });
  });
  if (avisos.some((a) => a.tipo === "error")) return res(false, empatico);

  // 3 · Contenido según el tipo de pregunta
  const gustos = gustosDeYo(t);
  const pos = gustos.filter((x) => x.cat === "love" || x.cat === "reallylike" || x.cat === "like");
  const neg = gustos.filter((x) => x.cat === "dislike" || x.cat === "hate");
  const mind = gustos.filter((x) => x.cat === "mind");
  const siCorto = busca(t, ["yes", "i", "do"]) >= 0;
  const noCorto = busca(t, ["no", "i", "dont"]) >= 0 || busca(t, ["not", "really"]) >= 0;
  const temaEs = TEMA_DEF[tu.tema].es;

  if (tu.tipo === "favorite") {
    const fav = card.favorito!;
    const kf = t.indexOf("favorite");
    if (kf < 0) {
      avisos.push({ tipo: "error", texto: `${nombre} te preguntó por tu favorito. Responde con «My favorite ${card.categoria} is…». → ${modelo}` });
    } else if (t[kf - 1] === "i" || (t[kf - 1] !== "my" && t[kf - 1] !== "is")) {
      avisos.push({ tipo: "error", texto: `Favorite es adjetivo: «My favorite ${card.categoria} is ${fav.en}», no «I favorite…». → ${modelo}` });
    } else {
      const kItem = mencionaAlguna(t, fav.w);
      const kCompa = mencionaAlguna(
        t,
        TEMA_DEF[tu.tema].variantes.map((v) => v.w),
      );
      if (kItem < 0) {
        if (kCompa >= 0)
          avisos.push({ tipo: "error", texto: `El favorito de ${nombre} es ${TEMA_DEF[tu.tema].en}; el tuyo, según tu tarjeta, es ${fav.es} (${fav.en}). → ${modelo}` });
        else avisos.push({ tipo: "error", texto: `Tu tarjeta dice que tu favorito es ${fav.es}: en inglés, ${fav.en}. → ${modelo}` });
      } else {
        const antes = kItem < kf;
        // «My favorite sport is basketball» o «Basketball is my favorite sport».
        const bienOrden = antes ? t[kItem + fav.w[0]!.length] === "is" && t[kf - 1] === "my" : t[kf - 1] === "my" && (t[kf + 1] === "is" || t[kf + 2] === "is");
        if (!bienOrden) {
          if (t.includes("are")) avisos.push({ tipo: "error", texto: `Con un solo favorito se usa is: «My favorite ${card.categoria} is ${fav.en}». → ${modelo}` });
          else avisos.push({ tipo: "error", texto: `Revisa la estructura: My favorite + ${card.categoria} + is + ${fav.en}. → ${modelo}` });
        } else if (t[kf + 1] === "is") avisos.push({ tipo: "consejo", texto: `Correcto. Puedes decir el tipo de favorito: «My favorite ${card.categoria} is ${fav.en}».` });
      }
    }
    if (/favourite/i.test(texto))
      avisos.push({ tipo: "consejo", texto: "«Favourite» es la ortografía británica; en inglés de Estados Unidos se escribe «favorite». Ambas son correctas." });
  } else {
    const g = card.grado!;
    if (g >= 3) {
      if (neg.length || noCorto) avisos.push({ tipo: "error", texto: `Tu tarjeta dice que ${GRADO_DEF[g].tu} ${temaEs}, pero tu respuesta dice que no. → ${modelo}` });
      else if (!pos.length && !siCorto) avisos.push({ tipo: "error", texto: `Di tu gusto: «${GRADO_DEF[g].en} ${TEMA_DEF[tu.tema].en}» o «${GRADO_DEF[g].en} it». → ${modelo}` });
      else if (pos.length) {
        const cat = pos[0]!.cat;
        const esperado: Cat = g === 5 ? "love" : g === 4 ? "reallylike" : "like";
        if (cat !== esperado)
          avisos.push({
            tipo: "consejo",
            texto: `Tu tarjeta dice «${GRADO_DEF[g].es}»: en inglés, «${GRADO_DEF[g].en}». Tu respuesta dice «I ${catFrase(cat, false)}», que también es un gusto positivo.`,
          });
      }
    } else if (g === 2) {
      if (!mind.length)
        avisos.push({
          tipo: "error",
          texto: `Tu tarjeta dice «no me molesta»: en inglés, «I don't mind ${TEMA_DEF[tu.tema].en}» o «I don't mind it». No es lo mismo que like ni que don't like. → ${modelo}`,
        });
    } else {
      if (pos.length || siCorto) avisos.push({ tipo: "error", texto: `Tu tarjeta dice que ${GRADO_DEF[g].tu} ${temaEs}, pero tu respuesta dice que sí. → ${modelo}` });
      else if (!neg.length && !noCorto) avisos.push({ tipo: "error", texto: `Di tu gusto: «I don't like ${TEMA_DEF[tu.tema].en}» o «No, I don't». → ${modelo}` });
      else if (neg.some((x) => x.cat === "hate") && g === 1)
        avisos.push({
          tipo: "consejo",
          texto: `A ${nombre} le encanta. «I hate it» es correcto, pero muy fuerte: con alguien que opina distinto suena mejor «I don't really like it».`,
        });
    }
    if (tu.tipo === "do" && !siCorto && !noCorto && g !== 2 && !avisos.some((a) => a.tipo === "error"))
      avisos.push({ tipo: "consejo", texto: `Bien. A una pregunta con «Do you like…?» también puedes empezar con la respuesta corta: ${g >= 3 ? "Yes, I do." : "No, I don't."}` });
  }

  // 4 · Preferencia
  if (card.prefiere) {
    const kp = t.indexOf("prefer");
    const kItem = mencionaAlguna(t, card.prefiere.w);
    if (kp >= 0 && t[kp + 1] === "to") avisos.push({ tipo: "consejo", texto: `«prefer to + verbo» es correcto; también «I prefer ${card.prefiere.en}».` });
    if (card.requierePrefer && (kp < 0 || kItem < 0))
      avisos.push({ tipo: "error", texto: `Tu tarjeta dice que prefieres ${card.prefiere.es}: «I prefer ${card.prefiere.en}». → ${modelo}` });
    else if (!card.requierePrefer && (kp < 0 || kItem < 0) && !avisos.some((a) => a.tipo === "error"))
      avisos.push({ tipo: "consejo", texto: `Para cerrar con amabilidad puedes ofrecer tu alternativa: «I prefer ${card.prefiere.en}».` });
  }

  // 5 · Razón con because
  const kb = t.indexOf("because");
  if (kb < 0) avisos.push({ tipo: "error", texto: `Falta tu razón con because (porque). Tu tarjeta: ${card.razonEs} = ${card.razon}. → ${modelo}` });
  else {
    const des = t.slice(kb + 1);
    const sin = SINONIMOS[card.razon] ?? [card.razon];
    if (!des.some((w) => sin.includes(w))) {
      const otro = ADJETIVOS.find((a) => des.includes(a.en));
      avisos.push({
        tipo: "error",
        texto: `${otro ? `«${otro.en}» = ${otro.es}. ` : ""}Tu tarjeta dice que tu razón es «${card.razonEs}»: en inglés, «${card.razon}». → ${modelo}`,
      });
    }
  }

  // 6 · Empatía
  if (tu.diferente && !empatico && !avisos.some((a) => a.tipo === "error")) {
    avisos.push({
      tipo: "error",
      texto: `Tu gusto es distinto al de ${nombre}. Antes de dar tu opinión, reacciona con empatía: «That's cool!», «That's nice!», «I see.» o «Really? Why?». Así ${nombre} sabe que respetas su gusto.`,
    });
    return res(false, false, true);
  }
  if (!tu.diferente && !empatico && !avisos.some((a) => a.tipo === "error"))
    avisos.push({ tipo: "consejo", texto: "Como opinan parecido, puedes empezar con «Me too!» (yo también)." });
  return res(false, empatico);
}

/* ════════════════════════════════════════════════════════════════════════
 * Estrellas — ¿qué tanto le gusta? (ejemplos verbatim de A1, A2, A4 y A6)
 * ════════════════════════════════════════════════════════════════════════ */

export const CLASIFICA_GRADO: { texto: string; g: Grado; fuente: string }[] = [
  { texto: "I love pizza.", g: 5, fuente: "A6" },
  { texto: "I hate spiders.", g: 0, fuente: "A6" },
  { texto: "I don't mind math.", g: 2, fuente: "A6" },
  { texto: "I like music.", g: 3, fuente: "A1" },
  { texto: "I don't like coffee.", g: 1, fuente: "A1" },
  { texto: "I like playing soccer.", g: 3, fuente: "A1" },
  { texto: "Yes, I really like it!", g: 4, fuente: "A2" },
  { texto: "I love math!", g: 5, fuente: "A2" },
  { texto: "I don't like math. It is boring.", g: 1, fuente: "A2" },
  { texto: "I don't mind it.", g: 2, fuente: "A4" },
];

export function rondaGrado(rnd: () => number): number[] {
  return baraja(
    CLASIFICA_GRADO.map((_, i) => i),
    rnd,
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * A3 — Tu turno (revisión automática orientativa)
 * ════════════════════════════════════════════════════════════════════════ */

export const A3 = {
  prompt:
    "Escribe en inglés 8-10 oraciones sobre tus gustos: qué te gusta, qué no te gusta, qué amas y qué odias (en diferentes áreas: comida, música, deportes, materias, actividades). Para cada gusto, da una razón usando 'because'. Luego reflexiona en español: ¿en qué se parecen y en qué se diferencian las formas de expresar gustos en inglés y en español?",
  pistas: [
    "I love / I like / I don't like / I hate + sustantivo o verbo-ing",
    "I like it because it is fun/interesting/delicious/exciting/easy",
    "I don't like it because it is boring/difficult/expensive/scary",
  ],
  criterios: [
    "Escribe al menos 8 oraciones de gustos con razones",
    "Usa correctamente la estructura 'like + sustantivo/verbo-ing'",
    "Incluye variedad de intensidad (love, like, don't like, hate)",
    "Reflexión comparativa entre inglés y español",
  ],
  min: 80,
  max: 300,
};

export interface AnalisisA3 {
  palabras: number;
  gustos: number;
  porque: number;
  grados: { love: boolean; like: boolean; dislike: boolean; hate: boolean };
  espanol: number;
  errores: string[];
}

const ESP_REFLEXION = new Set([
  "que",
  "en",
  "el",
  "la",
  "los",
  "las",
  "es",
  "se",
  "y",
  "de",
  "un",
  "una",
  "porque",
  "gusta",
  "gustos",
  "ingles",
  "espanol",
  "parecen",
  "diferencian",
  "como",
  "mas",
  "para",
  "con",
  "pero",
  "decir",
  "verbo",
  "sujeto",
  "nosotros",
  "yo",
  "mi",
  "cosa",
  "diferencia",
  "parecido",
  "igual",
  "tambien",
  "usa",
  "usamos",
  "dice",
  "decimos",
  "lo",
  "del",
  "al",
  "no",
  "si",
]);

export function analizaA3(texto: string): AnalisisA3 {
  const t = tokens(texto);
  const palabras = texto.split(/\s+/).filter((w) => /[a-z0-9áéíóúñ]/i.test(w)).length;
  const gustos = gustosDeYo(t);
  const errores: string[] = [];
  t.forEach((w, i) => {
    const s = t[i + 1];
    if (w === "i" && (s === "likes" || s === "loves" || s === "hates")) errores.push(`«I ${s}» (con I, sin -s)`);
    if (w === "i" && s === "no" && t[i + 2] === "like") errores.push("«I no like» (I don't like)");
    if (w === "dont" && s === "likes") errores.push("«don't likes» (don't like)");
    if ((w === "like" || w === "love" || w === "hate") && s && VERBOS_BASE.includes(s) && t[i - 1] !== "to" && t[i - 1] !== "would") errores.push(`«${w} ${s}» (verbo en -ing)`);
    if (w === "because" && (s === "is" || s === "are")) errores.push(`«because ${s}» (falta it)`);
  });
  return {
    palabras,
    gustos: gustos.length,
    porque: t.filter((w) => w === "because").length,
    grados: {
      love: gustos.some((g) => g.cat === "love"),
      like: gustos.some((g) => g.cat === "like" || g.cat === "reallylike"),
      dislike: gustos.some((g) => g.cat === "dislike"),
      hate: gustos.some((g) => g.cat === "hate"),
    },
    espanol: t.filter((w) => ESP_REFLEXION.has(w)).length,
    errores: [...new Set(errores)],
  };
}

/** Autoevaluación A7 — criterios verbatim. */
export const AUTOEVALUACION_A7 = {
  instrucciones: "Marca tu nivel honesto en cada criterio.",
  criterios: [
    "Puedo decir qué me gusta y qué no me gusta.",
    "Uso distintos grados (love, like, don't like, hate).",
    "Doy razones de mis gustos usando 'because'.",
    "Pregunto y respondo sobre gustos (Do you like...? Yes, I do).",
  ],
  escala: ["En inicio", "En proceso", "Logrado", "Destacado"],
  reflexion: "¿Qué gusto tuyo ya puedes explicar en inglés con una razón?",
};

/* ════════════════════════════════════════════════════════════════════════
 * Contenido VERBATIM
 * ════════════════════════════════════════════════════════════════════════ */

export const TITULO_A1 = "What do you like? — Gustos y opiniones en inglés";

/** Lectura A1 — verbatim, en sus párrafos (sin el recuadro ajeno sobre la ENDUTIH). */
export const LECTURA_A1: string[] = [
  'Expresar gustos y preferencias en inglés es más fácil de lo que parece. Usamos el verbo "to like" (gustar) de la siguiente manera:',
  '• "I like [sustantivo/verbo-ing]" (Me gusta...): "I like music." / "I like playing soccer."\n• "I don\'t like [sustantivo/verbo-ing]" (No me gusta...): "I don\'t like coffee."\n• "Do you like [sustantivo/verbo-ing]?" (¿Te gusta...?): "Do you like pizza?"\n• Respuestas: "Yes, I do." / "No, I don\'t."',
  'Para expresar diferentes grados: "I love..." (Me encanta), "I really like..." (Me gusta mucho), "I like..." (Me gusta), "I don\'t mind..." (No me molesta), "I don\'t like..." (No me gusta), "I hate..." (Odio).',
  'Para dar razones: "I like it because it is fun/interesting/delicious/easy" (Me gusta porque es divertido/interesante/delicioso/fácil). "I don\'t like it because it is boring/difficult/expensive" (No me gusta porque es aburrido/difícil/caro).',
  'Ser empático al hablar de gustos significa respetar que los demás pueden tener preferencias diferentes: "That\'s fine, everyone is different" (Está bien, todos somos diferentes).',
];

export const FUENTE_A1 = "Material elaborado para CEN Bachillerato";

/** Preguntas de comprensión de la lectura A1 — verbatim. */
export const PREGUNTAS_A1: { pregunta: string; respuesta: string }[] = [
  { pregunta: "¿Cómo preguntas si a alguien le gusta la música?", respuesta: "Do you like music?" },
  { pregunta: "¿Cuál es la diferencia entre 'I like' y 'I love'?", respuesta: "'I love' expresa un gusto más intenso o apasionado que 'I like'." },
  { pregunta: "¿Cómo dices 'No me gusta porque es aburrido'?", respuesta: "I don't like it because it is boring." },
];

/** Hechos: quiz A5 (verdadero/falso) — verbatim. */
export const HECHOS: { enunciado: string; respuesta: boolean; retro: string }[] = [
  { enunciado: "'I love it' expresa un gusto más fuerte que 'I like it'.", respuesta: true, retro: "Correcto." },
  { enunciado: "Después de 'like', el verbo va en infinitivo con 'to' solamente.", respuesta: false, retro: "Lo más común en A1 es 'like + verbo-ing': 'I like playing'." },
  { enunciado: "'because' sirve para dar una razón.", respuesta: true, retro: "Sí: 'I like it because it is fun'." },
  { enunciado: "Respetar gustos distintos a los míos es parte de la empatía.", respuesta: true, retro: "Correcto: 'Everyone is different'." },
];

/** Glosario A6 — verbatim. */
export const GLOSARIO: { termino: string; definicion: string; ejemplo: string }[] = [
  { termino: "I like / I don't like", definicion: "Me gusta / no me gusta.", ejemplo: "I like music. I don't like coffee." },
  { termino: "I love / I hate", definicion: "Me encanta / odio (grados extremos).", ejemplo: "I love pizza. I hate spiders." },
  { termino: "Do you like...?", definicion: "Pregunta de gusto. Respuesta: Yes, I do / No, I don't.", ejemplo: "Do you like soccer? — Yes, I do." },
  { termino: "because", definicion: "Conector para dar una razón.", ejemplo: "I like it because it is fun." },
  { termino: "verb + -ing", definicion: "Forma del verbo tras 'like' (gerundio).", ejemplo: "I like reading." },
  { termino: "I don't mind", definicion: "No me molesta (gusto neutro).", ejemplo: "I don't mind math." },
];

export const ACTIVIDAD_A6 = "Escribe 4 oraciones de gustos con razones usando 'because'.";

/** A4 «Likes & opinions — Quiz» — verbatim. */
export const QUIZ_A4: QuizEvaluable = {
  titulo: "Likes & opinions — Quiz",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Cómo preguntas si a alguien le gusta la pizza?",
      opciones: ["You like pizza?", "Do you like pizza?", "Are you like pizza?", "Like you pizza?"],
      respuestaCorrecta: 1,
      retroalimentacion: "'Do you like...?' es la forma correcta.",
    },
    {
      enunciado: "¿Cuál expresa el gusto MÁS intenso?",
      opciones: ["I like it.", "I don't mind it.", "I love it.", "I don't like it."],
      respuestaCorrecta: 2,
      retroalimentacion: "'I love it' es el gusto más intenso.",
    },
    {
      enunciado: "Después de 'I like' un verbo va en forma:",
      opciones: ["infinitivo (to play)", "-ing (playing)", "pasado (played)", "futuro (will play)"],
      respuestaCorrecta: 1,
      retroalimentacion: "Tras 'like' se usa el verbo en -ing: 'I like playing soccer'.",
    },
    {
      enunciado: "¿Qué palabra introduce una razón?",
      opciones: ["but", "because", "and", "or"],
      respuestaCorrecta: 1,
      retroalimentacion: "'because' = porque, introduce la razón.",
    },
    {
      enunciado: "Respuesta corta a 'Do you like English?' (afirmativa):",
      opciones: ["Yes, I like.", "Yes, I do.", "Yes, I am.", "Yes, I like it do."],
      respuestaCorrecta: 1,
      retroalimentacion: "La respuesta corta correcta es 'Yes, I do'.",
    },
  ],
};

/**
 * A2 «Do you like...?» — texto y respuestas verbatim. Se aceptan además «do
 * not» en el hueco 4 (equivale a don't). En el último hueco la actividad
 * declara «yes» como alternativa, pero «Yes, I yes!» no es inglés correcto: aquí
 * NO se acepta (se indica en la nota al pie).
 */
export const HUECOS_A2: TextoHuecosData = {
  ancla: "IN-I-P07-A2 · Do you like...?",
  instrucciones: "Completa el diálogo sobre gustos con: like / love / don't / do / because / hate / really / boring",
  partes: [
    "A: Do you ",
    " soccer? B: Yes, I ",
    " like it! I ",
    " it because it is exciting. A: And math? B: I ",
    " like math. It is ",
    ". C: I ",
    " math! I think it is interesting ",
    " it helps me in real life. A: ",
    " you like English? B: Yes, I ",
    "!",
  ],
  huecos: [
    { respuesta: "like", alternativas: [], pista: "Do you ___ soccer?" },
    { respuesta: "really", alternativas: [], pista: "I ___ like it = Me gusta mucho" },
    { respuesta: "love", alternativas: [], pista: "I ___ it = Me encanta" },
    { respuesta: "don't", alternativas: ["do not"], pista: "I ___ like math = No me gusta" },
    { respuesta: "boring", alternativas: [], pista: "It is ___ = Es aburrido" },
    { respuesta: "love", alternativas: [], pista: "I ___ math = Me encanta" },
    { respuesta: "because", alternativas: [], pista: "interesting ___ it helps..." },
    { respuesta: "Do", alternativas: ["do"], pista: "___ you like English? (pregunta con Do/do)" },
    { respuesta: "do", alternativas: ["Do"], pista: "Yes, I ___! (respuesta afirmativa)" },
  ],
};

/** A8 video — sus preguntas (verbatim). */
export const VIDEO_A8 = {
  titulo: "Expresar gustos y opiniones en inglés",
  abierta: "¿Cómo expresarías en inglés que te gusta una actividad y por qué?",
  opcion: {
    pregunta: "¿Cuál de las siguientes frases en inglés expresa una preferencia?",
    opciones: ["Where is the bathroom?", "It is Monday today", "I like this because it is fun"],
    correcta: 2,
  },
  vf: { pregunta: "Expresar opiniones de forma empática implica también respetar la opinión de los demás.", respuesta: true },
};

export const FUENTE =
  "CEN Bachillerato — Inglés I, progresión 7: lectura A1 «What do you like? — Gustos y opiniones en inglés» (Material elaborado para CEN Bachillerato), fill_blanks A2 «Do you like...?», reflexión escrita A3 «Mis gustos en inglés», quiz A4 «Likes & opinions — Quiz», verdadero/falso A5, glosario A6, autoevaluación A7 y video A8 «Expresar gustos y opiniones en inglés».";

export const PROBLEMA =
  "¿Cómo dices en inglés lo que te gusta, lo que no y por qué, sin hacer sentir mal a quien piensa distinto? En la Feria de Gustos de la Preparatoria Las Jacarandas entrevistas a seis compañeros y grafica sus respuestas, lees sus perfiles para formar mesas y grupos donde todos la pasen bien, y respondes a sus opiniones con tu gusto, una razón y empatía.";

export const INSTRUCCIONES: string[] = [
  "En Likes survey, elige un puesto y un compañero, escríbele «Do you like…?» y mira su reacción: si le gusta, va al puesto; la gráfica 3D suma su respuesta. Con los seis, escribe dos conclusiones en 3.ª persona.",
  "En Match the friends, lee los perfiles en inglés y sienta a cada amigo en una mesa donde esté contento (cuidado con «I don't mind»). Luego explica con because por qué a uno le gusta su mesa.",
  "En Give your opinion kindly, lee lo que dice cada compañero y tu tarjeta de papel, y responde en inglés: reacción empática, tu gusto y tu razón con because.",
  "Clasifica los grados de gusto para ganar estrellas, resuelve el quiz A4, completa el diálogo A2 y escribe tu propio texto (A3).",
];

export const IDEAS: string[] = [
  "Like + sustantivo (I like music) o like + verbo-ing (I like playing soccer). «I like play» es incorrecto.",
  "Grados, de más a menos: I love · I really like · I like · I don't mind · I don't like · I hate. «I don't mind» es neutro: no es un gusto.",
  "Pregunta: Do you like…? Respuesta corta: Yes, I do. / No, I don't. Nunca «Yes, I like» ni «Are you like…?».",
  "Con he / she / un nombre, el verbo lleva -s: Ana likes, Jorge loves, Luis hates. La negativa es doesn't + like sin -s: Paola doesn't like soccer.",
  "Con plural no hay -s: Four students like drawing. Con uno sí: One student likes reading. Nobody y everybody van en singular.",
  "Because da la razón y lleva sujeto: because it is fun (no «because is fun»).",
  "Empatía: reacciona antes de dar tu gusto distinto (That's cool! · I see. · Really? Why?) y habla de lo que tú prefieres, sin descalificar el gusto del otro.",
];

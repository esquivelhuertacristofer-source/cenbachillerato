/**
 * Datos y modelo del laboratorio "Plans and purposes: la colonia que planeamos"
 * (IN-IV-P05, progresión 5 de Inglés IV: «Habla sobre planes y propósitos
 * personales o comunitarios (expresa lo que se piensa hacer y por qué es
 * importante)»).
 *
 * Anclas VERBATIM:
 *   - A1 lectura «Plans and Goals: Be Going To and Will»: marco teórico y regla
 *     de cada situación del modo «Plan or decision?».
 *   - A2 y A6 fill_blanks: «Completa el texto».
 *   - A3 reflexión escrita: «Tu turno». A4 verdadero/falso: hechos.
 *   - A5 glosario (we could, I'm planning to, I hope to, so that / because).
 *   - A7 autoevaluación. A8 relacionar columnas: tarjeta de estrellas.
 *   - A9 video: sus dos preguntas cerradas forman el reto evaluable.
 *
 * Lo que NO es verbatim: las ocho situaciones, los cinco proyectos de la
 * colonia, las metas de la agenda, los nombres (Diego, Doña Lupe, Sofía,
 * Carmen) y la colonia son ILUSTRATIVOS y ficticios. Todas las oraciones en
 * inglés que no vienen de la BD están en inglés estadounidense estándar.
 *
 * Datos puros (sin three ni React).
 */

import type { TextoHuecosData } from "./_mecanica-huecos";
import type { QuizEvaluable } from "./_reto-quiz";

/* ── Modos ────────────────────────────────────────────────────────────── */

export type Modo = "situaciones" | "comunidad" | "metas";
export const MODOS: Modo[] = ["situaciones", "comunidad", "metas"];

export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string }> = {
  situaciones: { etq: "Plan or decision?", subtitulo: "Lee la situación y elige la forma del futuro", icono: "fa-cloud-sun-rain", color: "#38bdf8" },
  comunidad: { etq: "Community project", subtitulo: "Propón, planea y di por qué: la colonia cambia", icono: "fa-seedling", color: "#fbbf24" },
  metas: { etq: "My goals", subtitulo: "Escribe tus metas en la agenda, con su propósito", icono: "fa-flag-checkered", color: "#a78bfa" },
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

/** Minúsculas, apóstrofos rectos, sin puntuación y espacios simples. */
export function normalizaIngles(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[.,;:!?¡¿"()—–-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const CONTRACCIONES: [RegExp, string][] = [
  [/\bi'm\b/g, "i am"],
  [/\bim\b/g, "i am"],
  [/\bi'll\b/g, "i will"],
  [/\bwe're\b/g, "we are"],
  [/\bwe'll\b/g, "we will"],
  [/\bthey're\b/g, "they are"],
  [/\byou're\b/g, "you are"],
  [/\bit's\b/g, "it is"],
  [/\bhe's\b/g, "he is"],
  [/\bshe's\b/g, "she is"],
  [/\bthere's\b/g, "there is"],
  [/\bthat's\b/g, "that is"],
  [/\bwon't\b/g, "will not"],
  [/\bdon't\b/g, "do not"],
  [/\bdoesn't\b/g, "does not"],
  [/\bcan't\b/g, "cannot"],
  [/\bi'd\b/g, "i would"],
];

/** Normaliza y expande las contracciones: «I'm» = «I am», «I'll» = «I will». */
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

/* ════════════════════════════════════════════════════════════════════════
 * 1. PLAN OR DECISION? — ocho situaciones
 * ════════════════════════════════════════════════════════════════════════ */

export type TipoFuturo = "plan" | "evidencia" | "acuerdo" | "decision" | "promesa" | "opinion";

export const TIPOS: TipoFuturo[] = ["plan", "evidencia", "acuerdo", "decision", "promesa", "opinion"];

export const TIPOS_DEF: Record<TipoFuturo, { etq: string; forma: string; icono: string; color: string }> = {
  plan: { etq: "Plan ya decidido", forma: "be going to", icono: "fa-clipboard-check", color: "#34d399" },
  evidencia: { etq: "Predicción con evidencia a la vista", forma: "be going to", icono: "fa-eye", color: "#38bdf8" },
  acuerdo: { etq: "Cita o acuerdo con fecha y hora", forma: "present continuous", icono: "fa-calendar-check", color: "#f472b6" },
  decision: { etq: "Decisión u ofrecimiento en el momento", forma: "will", icono: "fa-bolt", color: "#fbbf24" },
  promesa: { etq: "Promesa", forma: "will", icono: "fa-handshake", color: "#fb923c" },
  opinion: { etq: "Idea no decidida u opinión (maybe, I think)", forma: "will", icono: "fa-comment-dots", color: "#a78bfa" },
};

/** ok = la forma que recomienda A1 · valida = inglés correcto pero menos natural aquí · mal = no encaja. */
export type NivelOpcion = "ok" | "valida" | "mal";

export interface OpcionFutura {
  texto: string;
  nivel: NivelOpcion;
  porque: string;
}

export interface Situacion {
  id: "nubes" | "bolsas" | "sofia" | "calor" | "dentista" | "curso" | "mural" | "llamada";
  titulo: string;
  icono: string;
  contexto: string;
  hablante: string;
  /** Oración partida por el hueco del verbo. */
  partes: [string, string];
  opciones: OpcionFutura[];
  /** Tipos de futuro que describen bien la situación (el primero es el principal). */
  tipos: TipoFuturo[];
  pistaTipo: string;
  es: string;
  /** Qué pasa en la maqueta cuando se resuelve. */
  consecuencia: string;
}

export const SITUACIONES: Situacion[] = [
  {
    id: "nubes",
    titulo: "Nubes negras en la plaza",
    icono: "fa-cloud-showers-heavy",
    contexto: "Estás en la plaza con Diego. El cielo se puso negro de repente y ya se oyen truenos.",
    hablante: "Diego",
    partes: ["Look at those dark clouds! It ", " soon."],
    opciones: [
      { texto: "is going to rain", nivel: "ok", porque: "Correcto: hay evidencia a la vista (las nubes negras), así que va be going to: «It's going to rain soon.» Es el mismo caso de la lectura A1 y del video A9." },
      { texto: "will rain", nivel: "valida", porque: "También es correcto. Con evidencia visible, lo más natural es «It's going to rain soon» porque la predicción se basa en algo que ves AHORA (las nubes negras); will se prefiere para opiniones o predicciones sin evidencia enfrente (lectura A1, video A9)." },
      { texto: "rains", nivel: "mal", porque: "«It rains» es Present Simple: un hecho general o un hábito («It rains a lot in July»). Para lo que está a punto de pasar, con evidencia: «It's going to rain soon.»" },
    ],
    tipos: ["evidencia"],
    pistaTipo: "Fíjate en el cielo: ¿Diego ya lo había decidido, o está VIENDO algo que anuncia lo que va a pasar?",
    es: "¡Mira esas nubes negras! Va a llover pronto.",
    consecuencia: "Empieza a llover y Diego abre el paraguas: la predicción con evidencia se cumplió.",
  },
  {
    id: "bolsas",
    titulo: "Doña Lupe y sus bolsas",
    icono: "fa-bag-shopping",
    contexto: "Doña Lupe sale del mercado con muchas bolsas pesadas y se le está cayendo una. Tú la ves justo en ese momento.",
    hablante: "Tú",
    partes: ["Doña Lupe, you're carrying a lot of bags! I ", " you."],
    opciones: [
      { texto: "will help", nivel: "ok", porque: "Correcto: decides ayudar en ese instante, al ver las bolsas → will: «I'll help you.» (lectura A1)." },
      { texto: "am going to help", nivel: "valida", porque: "También es correcto: en el habla también se oye «I'm going to help you». Como ofrecimiento que decides en ese instante, lo más natural es «I'll help you» porque will expresa la decisión tomada al hablar (lectura A1)." },
      { texto: "am helping", nivel: "mal", porque: "«I'm helping» es algo que ya está pasando o un acuerdo con fecha. Aquí decides ahora mismo → «I'll help you.»" },
    ],
    tipos: ["decision", "promesa"],
    pistaTipo: "¿Lo tenías planeado desde ayer, o lo decides al ver las bolsas?",
    es: "Doña Lupe, ¡trae muchas bolsas! Yo le ayudo.",
    consecuencia: "Llegas junto a Doña Lupe y le cargas dos bolsas: una decisión tomada en el momento.",
  },
  {
    id: "sofia",
    titulo: "Sofía ya tiene lugar",
    icono: "fa-user-nurse",
    contexto: "Tu prima Sofía presentó el examen de admisión, la aceptaron y ya se inscribió en la carrera de Enfermería, que empieza el próximo año.",
    hablante: "Tú",
    partes: ["Sofía got accepted! She ", " nursing at the university next year."],
    opciones: [
      { texto: "is going to study", nivel: "ok", porque: "Correcto: es un plan decidido antes de hablar (ya se inscribió) → be going to: «She's going to study nursing next year.» (A1: I am going to study nursing at the university next year)." },
      { texto: "will study", nivel: "valida", porque: "También es correcto: «She will study nursing next year» anuncia un hecho futuro. Lo más natural es «She's going to study nursing next year» porque Sofía ya lo decidió e hizo el trámite: es un plan (lectura A1)." },
      { texto: "studies", nivel: "mal", porque: "«She studies» es Present Simple: una rutina de ahora («She studies every day»). Para su plan del próximo año: «She's going to study nursing.»" },
    ],
    tipos: ["plan"],
    pistaTipo: "¿Sofía lo está decidiendo ahora, o ya lo decidió y hasta se inscribió?",
    es: "¡Aceptaron a Sofía! Va a estudiar Enfermería en la universidad el próximo año.",
    consecuencia: "Sofía recibe su carta de aceptación y la universidad se ilumina: un plan ya decidido.",
  },
  {
    id: "calor",
    titulo: "Un salón a 32 °C",
    icono: "fa-temperature-high",
    contexto: "Llegas al salón después del recreo: hace muchísimo calor, todas las ventanas están cerradas y tu compañero se abanica con el cuaderno.",
    hablante: "Tú",
    partes: ["It's very hot in here. I ", " the window."],
    opciones: [
      { texto: "will open", nivel: "ok", porque: "Correcto: decides abrirla en ese momento, por el calor → will: «I'll open the window.» (ejemplo de la lectura A1)." },
      { texto: "am going to open", nivel: "valida", porque: "También es correcto: «I'm going to open the window» anuncia lo que vas a hacer. Lo más natural es «I'll open the window» porque la decisión nace en ese momento, al sentir el calor (ejemplo de la lectura A1)." },
      { texto: "opened", nivel: "mal", porque: "«opened» es pasado: ya ocurrió. La ventana sigue cerrada; lo que decides hacer ahora → «I'll open the window.»" },
    ],
    tipos: ["decision"],
    pistaTipo: "¿Es un plan de antes o una reacción al calor que sientes ahora?",
    es: "Hace mucho calor aquí. Abro la ventana.",
    consecuencia: "La ventana se abre, entra aire y el termómetro baja: una decisión espontánea.",
  },
  {
    id: "dentista",
    titulo: "La cita con la dentista",
    icono: "fa-tooth",
    contexto: "El consultorio te llamó para confirmar tu cita: mañana a las 4:00 p.m. Ya está anotada en tu agenda.",
    hablante: "Tú",
    partes: ["I ", " the dentist tomorrow at 4 p.m."],
    opciones: [
      { texto: "am seeing", nivel: "ok", porque: "Correcto: es una cita con fecha y hora ya acordada con otra persona → present continuous: «I'm seeing the dentist tomorrow at 4 p.m.» (A4: present continuous for arrangements)." },
      { texto: "am going to see", nivel: "valida", porque: "También es correcto: es un plan decidido. Lo más natural es «I'm seeing the dentist tomorrow at 4 p.m.» porque es una cita con día y hora acordada con otra persona (A4: present continuous for arrangements)." },
      { texto: "will see", nivel: "mal", porque: "Will no suena a cita ya agendada: suena a algo que decides o predices ahora. Para un acuerdo con fecha y hora: «I'm seeing the dentist tomorrow at 4 p.m.» (también «I'm going to see…»)." },
    ],
    tipos: ["acuerdo", "plan"],
    pistaTipo: "Hay otra persona, un día y una hora confirmados: ¿qué tipo de futuro es?",
    es: "Mañana a las 4 p.m. voy a la dentista.",
    consecuencia: "La cita queda sellada en el calendario de mañana a las 4:00 p.m.: un acuerdo con fecha y hora.",
  },
  {
    id: "curso",
    titulo: "¿Qué harás en vacaciones?",
    icono: "fa-laptop",
    contexto: "Tu amigo te pregunta qué vas a hacer en vacaciones. De verdad no lo has decidido; solo tienes una idea.",
    hablante: "Tú",
    partes: ["I don't know yet. Maybe I ", " an English course online."],
    opciones: [
      { texto: "will take", nivel: "ok", porque: "Correcto: es una idea que todavía no decides (maybe) → will: «Maybe I'll take an English course online.» (actividad A2)." },
      { texto: "am going to take", nivel: "valida", porque: "También es correcto gramaticalmente. Lo más natural es «Maybe I'll take an English course online» porque «maybe» dice que todavía no lo decides, y be going to suele anunciar algo ya decidido (actividad A2)." },
      { texto: "am taking", nivel: "mal", porque: "«I'm taking» suena a algo ya inscrito y con fecha. Todavía no lo decides: «Maybe I'll take an English course online.»" },
    ],
    tipos: ["opinion"],
    pistaTipo: "La palabra «maybe» es una pista: ¿ya está decidido?",
    es: "Todavía no sé. Tal vez tome un curso de inglés en línea.",
    consecuencia: "La idea aparece en la laptop, todavía con signos de interrogación: algo posible, no decidido.",
  },
  {
    id: "mural",
    titulo: "El mural de la colonia",
    icono: "fa-paint-roller",
    contexto: "Los vecinos votaron la semana pasada, ya compraron la pintura y acordaron pintar la barda el sábado.",
    hablante: "Carmen",
    partes: ["We bought the paint last week. We ", " a mural on this wall on Saturday."],
    opciones: [
      { texto: "are going to paint", nivel: "ok", porque: "Correcto: los vecinos ya lo decidieron y compraron la pintura → be going to: «We're going to paint a mural on Saturday.» (A1: They are going to start a community garden…)." },
      { texto: "will paint", nivel: "valida", porque: "También es correcto: «We will paint a mural on Saturday» se entiende bien. Lo más natural es «We're going to paint a mural on Saturday» porque los vecinos ya lo decidieron y hasta compraron la pintura: es un plan (lectura A1)." },
      { texto: "paint", nivel: "mal", porque: "«We paint» es Present Simple: algo habitual. Para el plan del sábado, ya decidido: «We're going to paint a mural on Saturday.»" },
    ],
    tipos: ["plan", "acuerdo"],
    pistaTipo: "Votaron y compraron la pintura la semana pasada: ¿se decidió antes o se decide ahora?",
    es: "Compramos la pintura la semana pasada. Vamos a pintar un mural en esta barda el sábado.",
    consecuencia: "La barda gris se llena de color: el plan decidido de los vecinos.",
  },
  {
    id: "llamada",
    titulo: "Antes de subir al autobús",
    icono: "fa-phone",
    contexto: "Vas a viajar a Puebla y tu mamá está preocupada en la central de autobuses.",
    hablante: "Tú",
    partes: ["Don't worry, Mom. I ", " you when I arrive."],
    opciones: [
      { texto: "will call", nivel: "ok", porque: "Correcto: es una promesa → will: «I'll call you when I arrive.» (actividad A2: promesa → will)." },
      { texto: "am going to call", nivel: "valida", porque: "También es correcto: informa lo que vas a hacer. Para tranquilizar a tu mamá, lo más natural es «I'll call you when I arrive» porque will expresa la promesa, el compromiso (actividad A2: promesa → will)." },
      { texto: "call", nivel: "mal", porque: "«I call you» es Present Simple (un hábito). Una promesa para el futuro: «I'll call you when I arrive.»" },
    ],
    tipos: ["promesa"],
    pistaTipo: "Tu mamá está preocupada: ¿qué le das con esta frase?",
    es: "No te preocupes, mamá. Te llamo cuando llegue.",
    consecuencia: "El autobús arranca y el teléfono de mamá queda listo para tu llamada: una promesa.",
  },
];

/** Orden fijo de las opciones de cada situación (no cambia entre renders). */
export const ORDEN_OPCIONES: number[][] = SITUACIONES.map((s, i) =>
  baraja(
    s.opciones.map((_, k) => k),
    mulberry32(11 + i * 5),
  ),
);

export function fraseSituacion(s: Situacion, texto: string | null): string {
  return `${s.partes[0]}${texto ?? "___"}${s.partes[1]}`;
}

/** Explica por qué el tipo elegido no describe la situación. */
export function explicaTipo(s: Situacion, elegido: TipoFuturo): string {
  const t = TIPOS_DEF[elegido];
  const bien = TIPOS_DEF[s.tipos[0]!];
  return `No es «${t.etq.toLowerCase()}». ${s.pistaTipo} Aquí es: ${bien.etq.toLowerCase()} (en inglés, ${bien.forma}).`;
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. COMMUNITY PROJECT — cinco proyectos de la colonia
 * ════════════════════════════════════════════════════════════════════════ */

export type ZonaId = "parque" | "huerto" | "biblioteca" | "cancha" | "plaza";
export type Be = "am" | "is" | "are";
export type Conector = "to" | "so that" | "because";
export type Pieza = "S" | Be | "A" | "T" | "Tx" | "to" | "so" | "because" | "Rinf" | "Rcan" | "Rfact";

export interface Proyecto {
  id: ZonaId;
  lugar: string;
  icono: string;
  color: string;
  problema: string;
  sujeto: string;
  be: Be;
  accion: string;
  tiempo: string;
  tiempoMal: string;
  razon: { inf: string; can: string; fact: string };
  /** Formas mal construidas de la propuesta con could. */
  propuestaMal: [string, string];
  es: string;
}

export const PROYECTOS: Proyecto[] = [
  {
    id: "parque",
    lugar: "Park",
    icono: "fa-tree",
    color: "#22c55e",
    problema: "El parque de la colonia está lleno de basura y ya casi nadie va.",
    sujeto: "We",
    be: "are",
    accion: "clean up the park",
    tiempo: "next Saturday",
    tiempoMal: "last Saturday",
    razon: { inf: "make it safe for families", can: "children can play there again", fact: "there is trash everywhere" },
    propuestaMal: ["to clean up the park", "cleaning up the park"],
    es: "Vamos a limpiar el parque el próximo sábado.",
  },
  {
    id: "huerto",
    lugar: "School garden",
    icono: "fa-carrot",
    color: "#84cc16",
    problema: "Detrás de la escuela hay un terreno vacío lleno de hierba que nadie usa.",
    sujeto: "Our class",
    be: "is",
    accion: "start a school garden",
    tiempo: "next month",
    tiempoMal: "last month",
    razon: { inf: "grow our own vegetables", can: "students can learn where food comes from", fact: "the empty lot is full of weeds" },
    propuestaMal: ["to start a school garden", "starting a school garden"],
    es: "Nuestro grupo va a empezar un huerto escolar el próximo mes.",
  },
  {
    id: "biblioteca",
    lugar: "Library",
    icono: "fa-book",
    color: "#38bdf8",
    problema: "La biblioteca comunitaria tiene los estantes casi vacíos.",
    sujeto: "I",
    be: "am",
    accion: "organize a book drive",
    tiempo: "by the end of the semester",
    tiempoMal: "last semester",
    razon: { inf: "get new books for the library", can: "more kids can borrow books for free", fact: "the library has very few books" },
    propuestaMal: ["to organize a book drive", "organizing a book drive"],
    es: "Voy a organizar una colecta de libros antes de que termine el semestre.",
  },
  {
    id: "cancha",
    lugar: "Basketball court",
    icono: "fa-basketball",
    color: "#f97316",
    problema: "Las líneas de la cancha ya casi no se ven y el piso está gris y agrietado.",
    sujeto: "The basketball team",
    be: "is",
    accion: "paint the court",
    tiempo: "next weekend",
    tiempoMal: "last weekend",
    razon: { inf: "make it look new again", can: "teams can play tournaments there", fact: "the lines are almost invisible" },
    propuestaMal: ["to paint the court", "painting the court"],
    es: "El equipo de básquetbol va a pintar la cancha el próximo fin de semana.",
  },
  {
    id: "plaza",
    lugar: "Plaza",
    icono: "fa-sun",
    color: "#f472b6",
    problema: "En la plaza no hay ni un árbol: al mediodía nadie puede sentarse.",
    sujeto: "The neighbors",
    be: "are",
    accion: "plant trees in the plaza",
    tiempo: "next week",
    tiempoMal: "last week",
    razon: { inf: "make the plaza cooler", can: "people can sit in the shade", fact: "there is no shade at noon" },
    propuestaMal: ["to plant trees in the plaza", "planting trees in the plaza"],
    es: "Los vecinos van a plantar árboles en la plaza la próxima semana.",
  },
];

export const propuestaBien = (p: Proyecto) => `We could ${p.accion}.`;

/** Las tres versiones de la propuesta, en orden fijo por proyecto. */
export const PROPUESTAS: { texto: string; ok: boolean }[][] = PROYECTOS.map((p, i) =>
  baraja(
    [
      { texto: propuestaBien(p), ok: true },
      { texto: `We could ${p.propuestaMal[0]}.`, ok: false },
      { texto: `We could ${p.propuestaMal[1]}.`, ok: false },
    ],
    mulberry32(71 + i * 13),
  ),
);

export function explicaPropuesta(p: Proyecto, texto: string): string {
  if (texto.includes(`could ${p.propuestaMal[0]}`)) return `Después de «could» va el verbo en forma base, SIN «to»: «We could ${p.accion}.» (A5 y A6: we could + verbo base).`;
  return `Después de «could» no va -ing: el verbo va en forma base → «We could ${p.accion}.» (A5: we could + verbo).`;
}

const PIEZAS_BASE: Pieza[] = ["S", "am", "is", "are", "A", "T", "Tx", "to", "so", "because", "Rinf", "Rcan", "Rfact"];

/** Fichas de cada proyecto, revueltas con semilla fija. */
export const FICHAS_PROYECTO: Pieza[][] = PROYECTOS.map((_, i) => baraja(PIEZAS_BASE, mulberry32(101 + i * 17)));

export function textoPieza(p: Proyecto, x: Pieza): string {
  switch (x) {
    case "S":
      return p.sujeto;
    case "am":
    case "is":
    case "are":
      return `${x} going to`;
    case "A":
      return p.accion;
    case "T":
      return p.tiempo;
    case "Tx":
      return p.tiempoMal;
    case "to":
      return "to";
    case "so":
      return "so that";
    case "because":
      return "because";
    case "Rinf":
      return p.razon.inf;
    case "Rcan":
      return p.razon.can;
    case "Rfact":
      return p.razon.fact;
  }
}

const esBe = (x: Pieza): x is Be => x === "am" || x === "is" || x === "are";
const esConector = (x: Pieza) => x === "to" || x === "so" || x === "because";
const esRazon = (x: Pieza) => x === "Rinf" || x === "Rcan" || x === "Rfact";
const esTiempo = (x: Pieza) => x === "T" || x === "Tx";

export function conectorDe(x: Pieza): Conector | null {
  return x === "to" ? "to" : x === "so" ? "so that" : x === "because" ? "because" : null;
}

/** La oración armada, con mayúsculas y la coma del tiempo al principio. */
export function oracionPlan(p: Proyecto, piezas: Pieza[]): string {
  if (!piezas.length) return "";
  const partes = piezas.map((x, i) => {
    let t = textoPieza(p, x);
    if (x === "S" && i > 0 && p.sujeto !== "I") t = t.charAt(0).toLowerCase() + t.slice(1);
    if (i === 0 && esTiempo(x) && piezas.length > 1) t = `${t},`;
    return t;
  });
  return pulirOracion(partes.join(" "));
}

export function oracionPlanModelo(p: Proyecto, conector: Conector = "so that"): string {
  const r: Pieza = conector === "to" ? "Rinf" : conector === "so that" ? "Rcan" : "Rfact";
  const c: Pieza = conector === "to" ? "to" : conector === "so that" ? "so" : "because";
  return oracionPlan(p, ["S", p.be, "A", "T", c, r]);
}

/** Revisa el plan armado con fichas. Lista vacía = correcto. */
export function revisaPlan(p: Proyecto, piezas: Pieza[]): string[] {
  const errores: string[] = [];
  const bes = piezas.filter(esBe);
  const tiempos = piezas.filter(esTiempo);
  const cons = piezas.filter(esConector);
  const razones = piezas.filter(esRazon);
  const faltan: string[] = [];
  if (!piezas.includes("S")) faltan.push(`quién (el sujeto «${p.sujeto}»)`);
  if (bes.length === 0) faltan.push("la forma be going to");
  if (!piezas.includes("A")) faltan.push(`qué van a hacer («${p.accion}»)`);
  if (tiempos.length === 0) faltan.push("cuándo");
  if (cons.length === 0) faltan.push("el conector de propósito (to, so that o because)");
  if (razones.length === 0) faltan.push("la razón");
  if (faltan.length) errores.push(`Falta ${faltan.length > 1 ? `${faltan.slice(0, -1).join(", ")} y ${faltan[faltan.length - 1]}` : faltan[0]}.`);
  if (bes.length > 1) errores.push("Usa una sola forma de be going to.");
  if (tiempos.length > 1) errores.push("Usa una sola expresión de tiempo.");
  if (cons.length > 1) errores.push("Usa un solo conector de propósito.");
  if (razones.length > 1) errores.push("Usa una sola razón.");
  if (bes.length === 1 && bes[0] !== p.be)
    errores.push(`Con «${p.sujeto}» va «${p.be} going to». Recuerda: am → I · is → he, she, it o un grupo en singular (our class, the team) · are → we, you, they (the neighbors).`);
  if (piezas.includes("Tx")) errores.push(`«${p.tiempoMal}» es pasado y un plan habla del futuro: «${p.tiempo}». Las expresiones de futuro de A1: next week, next month, next year, soon, by the end of the semester.`);
  if (cons.length === 1 && razones.length === 1) {
    const c = cons[0]!;
    const r = razones[0]!;
    if (c === "to" && r !== "Rinf")
      errores.push(`Después de «to» va un verbo en forma base: «to ${p.razon.inf}». «${textoPieza(p, r)}» ya tiene sujeto y verbo: úsala con ${r === "Rcan" ? "so that" : "because"}.`);
    if (c === "so" && r === "Rinf") errores.push(`«So that» pide una oración con sujeto: «so that ${p.razon.can}». Con el verbo solo se usa to: «to ${p.razon.inf}».`);
    if (c === "so" && r === "Rfact") errores.push(`«So that» expresa lo que quieren LOGRAR (casi siempre con can). «${p.razon.fact}» es la causa, lo que pasa hoy: va con because.`);
    if (c === "because" && r === "Rinf") errores.push(`Después de «because» va una oración con sujeto y verbo: «because ${p.razon.fact}». Para «${p.razon.inf}» usa to.`);
    if (c === "because" && r === "Rcan")
      errores.push(`«Because ${p.razon.can}» diría que eso YA pasa hoy. Es lo que quieren lograr, un propósito: «so that ${p.razon.can}».`);
  }
  if (errores.length) return errores;
  const b = p.be;
  const c = cons[0]!;
  const r = razones[0]!;
  const validos: Pieza[][] = [
    ["S", b, "A", "T", c, r],
    ["T", "S", b, "A", c, r],
  ];
  const ok = validos.some((o) => o.length === piezas.length && o.every((x, i) => x === piezas[i]));
  if (!ok) errores.push(`El orden de un plan es: quién + be going to + qué + cuándo + por qué → «${oracionPlan(p, validos[0]!)}» El «cuándo» también puede ir al principio: «${oracionPlan(p, validos[1]!)}»`);
  return errores;
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. MY GOALS — la agenda de metas (escritura con revisión tolerante)
 * ════════════════════════════════════════════════════════════════════════ */

export type Estructura = "going" | "planning" | "hope" | "will";

export const ESTRUCTURAS: Record<Estructura, { etq: string; es: string; molde: string }> = {
  going: { etq: "be going to + verb", es: "plan ya decidido (A1)", molde: "I'm going to + verbo" },
  planning: { etq: "I'm planning to + verb", es: "intención bien pensada (A5)", molde: "I'm planning to + verbo" },
  hope: { etq: "I hope to + verb", es: "deseo o aspiración (A5)", molde: "I hope to + verbo" },
  will: { etq: "I think / Maybe I will + verb", es: "predicción o idea aún no decidida (A1, A3)", molde: "I think I'll + verbo" },
};

export interface Hito {
  id: string;
  tiempo: string;
  /** Formas equivalentes aceptadas (ya normalizadas). */
  variantes: string[];
  es: string;
  estructura: Estructura;
  icono: string;
  color: string;
  ideas: { es: string; icono: string }[];
  ejemplo: string;
}

export const HITOS: Hito[] = [
  {
    id: "semana",
    tiempo: "next week",
    variantes: ["next week"],
    es: "la próxima semana",
    estructura: "going",
    icono: "fa-calendar-week",
    color: "#38bdf8",
    ideas: [
      { es: "Estudiar para el examen de admisión, para entrar a la universidad que quieres", icono: "fa-graduation-cap" },
      { es: "Ayudar en el huerto escolar, porque es importante para tu comunidad", icono: "fa-seedling" },
      { es: "Leer un libro en inglés, para mejorar tu vocabulario", icono: "fa-book-open" },
    ],
    ejemplo: "Next week, I'm going to study for the entrance exam so that I can get into the university I want.",
  },
  {
    id: "mes",
    tiempo: "next month",
    variantes: ["next month"],
    es: "el próximo mes",
    estructura: "planning",
    icono: "fa-calendar-days",
    color: "#34d399",
    ideas: [
      { es: "Entrar al equipo de futbol de la escuela, para estar sano", icono: "fa-futbol" },
      { es: "Abrir una cuenta de ahorro, porque quieres comprar una computadora", icono: "fa-piggy-bank" },
      { es: "Tomar un curso de primeros auxilios, para poder ayudar en una emergencia", icono: "fa-kit-medical" },
    ],
    ejemplo: "Next month, I'm planning to join the school soccer team because I want to stay healthy.",
  },
  {
    id: "semestre",
    tiempo: "by the end of the semester",
    variantes: ["by the end of the semester", "by the end of this semester"],
    es: "antes de que termine el semestre",
    estructura: "hope",
    icono: "fa-hourglass-half",
    color: "#fbbf24",
    ideas: [
      { es: "Aprobar todas tus materias, para que tu familia esté orgullosa", icono: "fa-award" },
      { es: "Terminar tu proyecto comunitario, para ayudar a tu colonia", icono: "fa-people-group" },
      { es: "Hablar inglés con más confianza, porque quieres trabajar en turismo", icono: "fa-comments" },
    ],
    ejemplo: "By the end of the semester, I hope to pass all my subjects so that my family can feel proud.",
  },
  {
    id: "anio",
    tiempo: "next year",
    variantes: ["next year"],
    es: "el próximo año",
    estructura: "will",
    icono: "fa-calendar",
    color: "#f472b6",
    ideas: [
      { es: "Quizá buscar un trabajo de medio tiempo, para ahorrar para la universidad", icono: "fa-briefcase" },
      { es: "Crees que aprenderás a programar, porque te interesa la tecnología", icono: "fa-laptop-code" },
      { es: "Quizá hacer voluntariado en tu comunidad, para conocer gente nueva", icono: "fa-hand-holding-heart" },
    ],
    ejemplo: "Next year, I think I'll look for a part-time job to save money for college.",
  },
  {
    id: "cinco",
    tiempo: "in five years",
    variantes: ["in five years", "in 5 years", "five years from now", "5 years from now"],
    es: "dentro de cinco años",
    estructura: "going",
    icono: "fa-mountain-sun",
    color: "#a78bfa",
    ideas: [
      { es: "Ser enfermero o enfermera, porque quieres ayudar a la gente", icono: "fa-user-nurse" },
      { es: "Terminar tu carrera, para conseguir un buen trabajo", icono: "fa-user-graduate" },
      { es: "Abrir tu propio negocio en tu colonia, para dar empleo a tus vecinos", icono: "fa-store" },
    ],
    ejemplo: "In five years, I'm going to be a nurse because I want to help people in my community.",
  },
];

/** Verbos en forma base frecuentes: sirven para reconocer «to + verbo» de propósito. */
const VERBOS_BASE = new Set(
  (
    "be get help learn improve have become save pay buy travel find work study make give support pass go visit practice meet start open build earn feel stay " +
    "keep read speak understand prepare apply enter graduate win take see spend live change protect reduce grow teach share show use do finish achieve know " +
    "contribute care move play look join create write clean plant organize organise collect raise love enjoy sell run lead serve fix train develop discover " +
    "explore try get stop avoid lose afford continue return provide offer volunteer invest design eat sleep exercise"
  ).split(" "),
);

const IRREGULARES_PASADO = new Set(["was", "were", "went", "did", "had", "got", "made", "took", "saw", "came", "gave", "found", "bought", "wrote", "began", "became", "left", "met", "paid", "spent", "won", "ran", "ate"]);
const NO_ING = new Set(["bring", "sing", "ring", "swing", "sting", "spring", "string", "thing"]);
const NO_ED = new Set(["need", "feed", "speed", "succeed", "proceed", "exceed", "bleed", "breed", "seed", "shed", "embed", "wed", "bed", "red"]);
const TERCERAS = new Set(["has", "does", "goes", "is"]);

/** ¿La palabra NO está en forma base? Devuelve el tipo de error o null. */
export function formaNoBase(v: string): "ing" | "pasado" | "tercera" | null {
  if (TERCERAS.has(v)) return "tercera";
  if (IRREGULARES_PASADO.has(v)) return "pasado";
  if (v.length > 4 && v.endsWith("ing") && !NO_ING.has(v)) return "ing";
  if (v.length > 3 && v.endsWith("ed") && !NO_ED.has(v)) return "pasado";
  if (v.length > 3 && (v.endsWith("ies") || (/[^s]s$/.test(v) && !/(us|is|ss|os|as)$/.test(v)))) return "tercera";
  return null;
}

const OTROS_TIEMPOS = [
  "next week",
  "next month",
  "next year",
  "next semester",
  "next summer",
  "next weekend",
  "by the end of the semester",
  "by the end of this semester",
  "by the end of the year",
  "in five years",
  "in 5 years",
  "in ten years",
  "tomorrow",
  "soon",
  "in the future",
  "this weekend",
];
const TIEMPOS_PASADOS = ["last week", "last month", "last year", "yesterday", "last semester", "ago"];

const MARCAS_ESPANOL = /\b(voy|vas|va|para|porque|quiero|estudiar|ayudar|mi|mis|el|la|los|las|que|con|una|próximo|proximo|semana|año|ano|meses|tener)\b/g;

const tieneFrase = (s: string, f: string) => new RegExp(`(^|\\s)${f.replace(/\s+/g, "\\s+")}($|\\s|')`).test(s);

export interface RevisionMeta {
  ok: boolean;
  errores: string[];
  /** Inglés correcto pero con otra forma: se acepta y se sugiere la estructura que se practica. */
  sugerencias: string[];
  conector: Conector | null;
  /** La oración del alumno, pulida (mayúscula y punto). */
  oracion: string;
}

type FormaMeta = Estructura | "hopeClause" | "gonna";

/** Formas de futuro correctas que se reconocen: [forma, patrón con el verbo en el grupo 1, marca]. */
const FORMAS_META: [FormaMeta, RegExp, string][] = [
  ["going", /\b(?:i am|(?:we|and i) are) (?:really |definitely |also |not |still )?going to ([a-z']+)/, "going to"],
  ["planning", /\b(?:(?:i am|(?:we|and i) are) (?:really |also |not )?planning|(?:i|we) (?:really |also )?plan) to ([a-z']+)/, "planning to"],
  ["hope", /\b(?:(?:i|we) (?:really |also )?hope|i am hoping) to ([a-z']+)/, "hope to"],
  ["hopeClause", /\b(?:i|we) (?:really )?hope (?:that )?(?:i|we) (?:will|can|would) (?:be able to )?([a-z']+)/, "will"],
  ["will", /\b(?:i|we) will (?:probably |maybe |definitely |also |not )?([a-z']+)/, "will"],
  ["gonna", /\b(?:i am|(?:we|and i) are) (?:really |also )?gonna ([a-z']+)/, "gonna"],
];

const DUDA = /\b(i think|i believe|i guess|i imagine|maybe|perhaps|probably)\b/;

/**
 * Revisa una meta escrita en inglés. Es tolerante: ignora mayúsculas,
 * puntuación y espacios, y trata «I'm» = «I am», «I'll» = «I will». Pide la
 * expresión de tiempo del hito, una forma de futuro con el verbo en forma base
 * y el porqué. Solo es ERROR el inglés incorrecto (I going to, will to, hope
 * study, for + verbo…) o lo que la consigna exige (tiempo y porqué). Si la
 * oración es correcta pero usa otra estructura (I hope I will…, will sin
 * I think, for + sustantivo, gonna), se ACEPTA con una sugerencia.
 */
export function revisaMeta(texto: string, h: Hito): RevisionMeta {
  const oracion = pulirOracion(texto);
  const fallo = (errores: string[]): RevisionMeta => ({ ok: false, errores, sugerencias: [], conector: null, oracion });
  const s = expandeIngles(texto);
  if (!s) return fallo(["Escribe tu meta en inglés."]);
  const palabras = s.split(" ").filter(Boolean);
  const espanol = (s.match(MARCAS_ESPANOL) ?? []).length;
  if (espanol >= 3) return fallo([`Escríbela en inglés. Por ejemplo: «${h.ejemplo}»`]);
  if (palabras.length < 6) return fallo([`Escribe una oración completa: cuándo + qué vas a hacer + por qué. Por ejemplo: «${h.ejemplo}»`]);
  const errores: string[] = [];
  const sugerencias: string[] = [];
  const est = ESTRUCTURAS[h.estructura];

  // ── Tiempo (lo pide la consigna)
  if (!h.variantes.some((v) => tieneFrase(s, v))) {
    const pasado = TIEMPOS_PASADOS.find((t) => tieneFrase(s, t));
    const otro = OTROS_TIEMPOS.find((t) => tieneFrase(s, t));
    if (pasado) errores.push(`«${pasado}» habla del pasado. Esta meta es para «${h.tiempo}» (${h.es}).`);
    else if (otro) errores.push(`Esta meta de la agenda es para «${h.tiempo}» (${h.es}), no para «${otro}».`);
    else errores.push(`Falta la expresión de tiempo: «${h.tiempo}» (${h.es}). Puede ir al principio o al final.`);
  }

  // ── Inglés mal construido: estos sí son errores
  if (/\bi (?:is|are) (?:\w+ )?going to\b/.test(s)) errores.push("Con «I» el verbo be es «am»: «I am going to…» o «I'm going to…».");
  else if (/\b(?:i|we) (?:going to|gonna)\b/.test(s)) errores.push("Falta el verbo be: «I am going to…» o «I'm going to…». Sin am / are no hay futuro con going to.");
  if (/\bwill to [a-z]+/.test(s)) errores.push("Después de «will» va el verbo sin «to»: «I will look for…», no «will to look».");
  if (/\bplaning\b/.test(s)) errores.push("Se escribe «planning», con doble n: «I'm planning to…».");
  else if (/\bi planning\b/.test(s)) errores.push("Falta «am»: «I am planning to…» o «I'm planning to…».");
  const sinTo = [...s.matchAll(/\b(going|planning|hope) ([a-z']+)/g)].find((m) => m[2] !== "to" && VERBOS_BASE.has(m[2]!));
  if (sinTo) errores.push(`Falta «to»: «${sinTo[1]} to ${sinTo[2]}», no «${sinTo[1]} ${sinTo[2]}».`);
  if (/\bi hopes\b/.test(s)) errores.push("Con «I» el verbo no lleva -s: «I hope to…».");

  // ── Forma de futuro
  const buscar = (f: FormaMeta) => {
    const def = FORMAS_META.find((x) => x[0] === f)!;
    const m = def[1].exec(s);
    return m ? { forma: f, verbo: m[1]!, fin: m.index + m[0].length, marca: def[2] } : null;
  };
  let hall = buscar(h.estructura);
  if (!hall) {
    for (const [f] of FORMAS_META) {
      hall = buscar(f);
      if (hall) break;
    }
  }
  const roto = /\b(?:i|we)(?: is| are)? (?:going to|gonna) ([a-z']+)/.exec(s);
  if (hall) {
    if (hall.forma === "gonna") sugerencias.push("«Gonna» es informal, del inglés hablado; por escrito se prefiere la forma completa: «going to» (nota de la lectura A1).");
    if (hall.forma === "hopeClause" && h.estructura === "hope") sugerencias.push("Correcto. Para practicar la estructura de A5 también puedes decir «I hope to + verbo»: «I hope to pass all my subjects…».");
    else if (hall.forma === "will" && h.estructura === "will" && !DUDA.test(s)) sugerencias.push("Correcto. Como es una idea todavía no decidida, suena más natural con «I think I'll…» o «Maybe I'll…» (pista de A3).");
    else if (hall.forma !== h.estructura && !(hall.forma === "gonna" && h.estructura === "going"))
      sugerencias.push(`Correcto. En esta fecha se practica «${est.molde}», ${est.es}. Por ejemplo: «${h.ejemplo}»`);
  } else if (!errores.some((e) => e.includes("verbo be") || e.includes("«to»") || e.includes("planning") || e.includes("will»"))) {
    errores.push(`Falta la forma de futuro: «${est.molde}» (${est.es}).`);
  }

  // ── Verbo en forma base
  const verbo = hall?.verbo ?? roto?.[1] ?? null;
  const marca = hall?.marca ?? "going to";
  if (verbo) {
    const f = formaNoBase(verbo);
    if (f === "ing") errores.push(`Después de «${marca}» el verbo va en forma base, sin -ing: «${marca} study», no «${marca} ${verbo}».`);
    else if (f === "pasado") errores.push(`«${verbo}» es pasado. Después de «${marca}» va el verbo en forma base: «${marca} study», «${marca} be».`);
    else if (f === "tercera") errores.push(`Después de «${marca}» el verbo va en forma base, sin -s: «${marca} go», no «${marca} ${verbo}».`);
  }

  // ── Propósito (lo pide la consigna)
  let conector: Conector | null = null;
  const fin = hall?.fin ?? (roto ? roto.index + roto[0].length : -1);
  if (fin >= 0) {
    const resto = s.slice(fin);
    if (/\bso that\b/.test(resto)) {
      const sig = /\bso that ([a-z']+)/.exec(resto)?.[1];
      if (sig === "to" || (sig && VERBOS_BASE.has(sig))) errores.push("Después de «so that» va sujeto + verbo: «so that I can…», «so that my family can…».");
      else conector = "so that";
    } else if (/\bbecause\b/.test(resto)) {
      const sig = /\bbecause ([a-z']+)/.exec(resto)?.[1];
      if (sig === "to" || (sig && VERBOS_BASE.has(sig))) errores.push("Después de «because» va una oración con sujeto y verbo: «because I want to help…».");
      else if (!sig) errores.push("Completa la razón después de «because»: «because I want to…».");
      else conector = "because";
    } else {
      const tos = [...resto.matchAll(/\b(?:in order )?to ([a-z']+)/g)].map((m) => m[1]!);
      const bueno = tos.find((w) => VERBOS_BASE.has(w));
      const malo = tos.find((w) => formaNoBase(w) === "ing");
      if (bueno) conector = "to";
      else if (malo) errores.push(`Después de «to» va el verbo en forma base: «to learn», no «to ${malo}».`);
      else {
        const fors = [...resto.matchAll(/\bfor ([a-z']+)/g)].map((x) => x[1]!);
        const paraVerbo = fors.find((w) => VERBOS_BASE.has(w) && w !== "work");
        if (paraVerbo) errores.push(`«Para + verbo» en inglés es «to + verbo»: «to get…», no «for ${paraVerbo}».`);
        else if (fors.length) sugerencias.push("Correcto: «for + sustantivo» dice para qué es tu meta. En esta práctica también puedes explicar el porqué con «to + verbo», «so that…» o «because…».");
        else errores.push("Falta el porqué: explica la importancia de tu meta con «because…», «so that…» o «to + verbo» (A5).");
      }
    }
  }

  return errores.length ? fallo(errores.slice(0, 3)) : { ok: true, errores: [], sugerencias, conector, oracion };
}

/* ════════════════════════════════════════════════════════════════════════
 * Estrellas — A8 «Relaciona los conceptos clave» (verbatim)
 * ════════════════════════════════════════════════════════════════════════ */

export const PAREJAS_A8: { izquierda: string; derecha: string }[] = [
  { izquierda: "I'm planning to + infinitive", derecha: "Intención planificada o bien pensada." },
  { izquierda: "be going to + infinitive", derecha: "Plan o intención ya decidida para el futuro." },
  { izquierda: "so that / because it matters", derecha: "Explicar por qué el plan es importante." },
  { izquierda: "I hope to + infinitive", derecha: "Deseo o aspiración para el futuro." },
  { izquierda: "We could + infinitive", derecha: "Propuesta amable de plan grupal o comunitario." },
];
export const DISTRACTORES_A8 = ["Marcadores temporales: next year, soon, by the end of, in the future."];
export const INSTRUCCIONES_A8 = "Toca un concepto de la izquierda y después la definición que le corresponde. Son los términos del glosario de esta progresión: la idea es reconstruirlos de memoria, no buscarlos.";
export const DEFINICIONES_A8: string[] = [...PAREJAS_A8.map((p) => p.derecha), ...DISTRACTORES_A8];

export function rondaA8(rnd: () => number): { orden: number[]; defs: number[] } {
  return {
    orden: baraja(
      PAREJAS_A8.map((_, i) => i),
      rnd,
    ),
    defs: baraja(
      DEFINICIONES_A8.map((_, i) => i),
      rnd,
    ),
  };
}

/* ════════════════════════════════════════════════════════════════════════
 * A3 — Tu turno: My Plans for Next Year (revisión orientativa)
 * ════════════════════════════════════════════════════════════════════════ */

export const A3 = {
  titulo: "My Plans for Next Year",
  prompt:
    "Escribe sobre tus planes para el próximo año o para cuando termines el bachillerato. ¿Qué vas a hacer? ¿Por qué es importante para ti?\n\nEscribe en inglés o en español. Usa 'be going to' para al menos 3 planes y explica por qué cada plan importa usando 'because'.",
  pistas: [
    "Estructura be going to: 'I am going to + base verb...' (para planes decididos).",
    "Estructura will: 'I think I will...' o 'Maybe I will...' (para decisiones no tan firmes).",
    "Razones con because: 'I am going to study English because I want to work in tourism.'",
    "Ideas: estudiar en una universidad, aprender un idioma, trabajar, viajar, ayudar a mi familia, participar en un proyecto comunitario.",
  ],
  criterios: [
    "Usa 'be going to' correctamente para al menos 3 planes (am/is/are going to + base verb)",
    "Explica al menos 2 planes con 'because' + razón personal",
    "Los planes son concretos y específicos, no solo ideas vagas",
    "El texto tiene coherencia y muestra reflexión personal genuina",
  ],
  min: 80,
};

export interface AnalisisA3 {
  palabras: number;
  goingTo: number;
  because: number;
  gonna: number;
  /** «I going to», «I is going to» y similares. */
  erroresBe: string[];
  /** «going to studying», «going to studied». */
  erroresVerbo: string[];
}

export function analizaA3(texto: string): AnalisisA3 {
  const s = expandeIngles(texto);
  const palabras = texto.split(/\s+/).filter((w) => /[a-zA-Z0-9áéíóúñ]/.test(w)).length;
  const goingTo = [...s.matchAll(/\b(?:am|is|are) (?:not |really |also |definitely )?going to ([a-z']+)/g)];
  const because = (s.match(/\bbecause\b/g) ?? []).length;
  const gonna = (s.match(/\bgonna\b/g) ?? []).length;
  const erroresBe = [...(s.match(/\b(?:i|you|we|they|he|she|it) going to\b/g) ?? []), ...(s.match(/\bi (?:is|are) going to\b/g) ?? []), ...(s.match(/\b(?:he|she|it) (?:am|are) going to\b/g) ?? []), ...(s.match(/\b(?:we|they|you) (?:am|is) going to\b/g) ?? [])];
  const erroresVerbo = goingTo.filter((m) => formaNoBase(m[1]!) !== null).map((m) => m[0]);
  return { palabras, goingTo: goingTo.length - erroresVerbo.length, because, gonna, erroresBe, erroresVerbo };
}

/* ════════════════════════════════════════════════════════════════════════
 * Contenido VERBATIM
 * ════════════════════════════════════════════════════════════════════════ */

export const TITULO_A1 = "Plans and Goals: Be Going To and Will";

/** Lectura A1 — verbatim. */
export const LECTURA_A1: string[] = [
  "In English, we use two main structures to talk about the future: be going to and will. Although both refer to future events, they are used in different situations and their choice changes the meaning of what we say.",
  "We use 'be going to' for plans and intentions that were already decided before the moment of speaking. This means the person thought about it, made a decision, and now announces it. For example: I am going to study nursing at the university next year — this means the person already applied or made that decision. She is going to visit her grandparents this weekend — she already called and arranged the visit. They are going to start a community garden in their neighborhood — they already talked about it and made plans.",
  "We use 'will' for two main situations. First, for spontaneous decisions made at the moment of speaking: Oh, you are carrying a lot of bags, I will help you. It is very hot in here, I will open the window. Second, for predictions about the future based on an opinion or a logical guess, when there is no immediate evidence in front of us: According to the report, prices will increase next year. Technology will change education in the next decade. (When the prediction is based on present evidence we can see right now, English prefers be going to: Look at those clouds — it is going to rain this afternoon.)",
  "Common time expressions that go with future tenses include: next week, next month, next year, in the future, tomorrow, soon, in five years, by the end of the semester. These expressions help make the future reference clear.",
  "Contrasting the two structures is important. 'I am going to visit my grandparents in Veracruz next holiday' tells us this is a plan already in place. 'I will visit my grandparents if I have time' tells us it is a conditional prediction, not yet decided. The difference matters in real communication.",
  "In the context of bachillerato in Mexico, students talk about future plans constantly: plans to graduate, to take the university entrance exam (examen de admision), to learn a trade, to help in their community. Practice by interviewing a classmate: What are you going to do after bachillerato? Do you think you will continue studying? What skills will be most important for your future?",
  "Write at least five sentences about your own plans and predictions using both be going to and will.",
];

/** Recuadro de la lectura A1 — verbatim. */
export const CALLOUT_A1 =
  'In informal spoken English, "going to" is very often contracted to "gonna": I am gonna study. He is gonna be late. While this is common in speech and informal writing, in academic and formal English you should write the full form: going to.';

/** Preguntas de comprensión de la lectura A1 — verbatim. */
export const PREGUNTAS_A1: { pregunta: string; respuesta: string }[] = [
  {
    pregunta: "What is the main difference between be going to and will when talking about the future?",
    respuesta: "Be going to is used for plans already decided before speaking; will is used for spontaneous decisions made at the moment of speaking or for predictions.",
  },
  {
    pregunta: "Which structure would you use in each situation: (a) You see your friend struggling with heavy books and you decide to help. (b) You bought a bus ticket to Oaxaca next Friday.",
    respuesta: "(a) Will: I will help you — spontaneous decision. (b) Be going to: I am going to travel to Oaxaca next Friday — already planned.",
  },
  {
    pregunta: "Write two sentences about your life goals: one with be going to and one with will.",
    respuesta: "Open answer. Example: I am going to study graphic design at the university. / I think technology will change the way artists work in the next ten years.",
  },
];

/** Hechos: quiz A4 (verdadero/falso), cada enunciado con su retroalimentación. */
export const HECHOS: string[] = [
  "Verdadero: «'Be going to + infinitive' is used to talk about plans and intentions already decided.» Correct: 'I'm going to study medicine' = a decided plan or intention.",
  "Falso: «'Will + infinitive' is the only way to talk about the future in English.» No: 'be going to', present continuous for arrangements, and 'will' are all used for the future with different nuances.",
  "Verdadero: «'I'm planning to + infinitive' expresses a thought-out intention.» Correct: 'I'm planning to join the school team next year' = a deliberate plan.",
  "Verdadero: «'I hope to + infinitive' is used to express a wish or desired outcome for the future.» Correct: 'I hope to travel abroad after graduation' = a future wish.",
  "Verdadero: «'We could + infinitive' is a good way to propose a plan to a group.» Correct: 'We could organise a community event' = a polite proposal.",
];

/** Glosario A5 — verbatim. */
export const GLOSARIO: { termino: string; definicion: string; ejemplo: string }[] = [
  { termino: "be going to + infinitive", definicion: "Plan o intención ya decidida para el futuro.", ejemplo: "I'm going to volunteer at the community garden next month." },
  { termino: "I'm planning to + infinitive", definicion: "Intención planificada o bien pensada.", ejemplo: "We're planning to organise a book drive for the school." },
  { termino: "I hope to + infinitive", definicion: "Deseo o aspiración para el futuro.", ejemplo: "I hope to study abroad when I finish school." },
  { termino: "We could + infinitive", definicion: "Propuesta amable de plan grupal o comunitario.", ejemplo: "We could start a recycling programme at school." },
  { termino: "so that / because it matters", definicion: "Explicar por qué el plan es importante.", ejemplo: "I'm going to join the clean-up day because it matters for our neighbourhood." },
  { termino: "future time expressions", definicion: "Marcadores temporales: next year, soon, by the end of, in the future.", ejemplo: "By the end of the year, we plan to have planted 50 trees." },
];

export const ACTIVIDAD_A5 = "Escribe 5 oraciones sobre tus planes y propósitos para el próximo semestre o año. Incluye al menos 2 estructuras diferentes del glosario y explica la importancia de un plan con 'because' o 'so that'.";

/** A2 «Fill in the Future: Be Going To and Will» — verbatim. */
export const HUECOS_A2: TextoHuecosData = {
  ancla: "IN-IV-P05-A2 · Fill in the Future: Be Going To and Will",
  instrucciones: "Complete each sentence with the correct future form. Use 'be going to' (am/is/are going to + base verb) for decided plans, or 'will' for spontaneous decisions and general predictions.",
  partes: [
    "Look at those dark clouds — it ",
    " rain soon. I think I ",
    " bring an umbrella, just in case. My sister already has a plan: she ",
    " study in Querétaro next semester. She applied last month and got accepted. As for me, I haven't decided yet, but maybe I ",
    " take an English course online. Oh wait — your phone is ringing. ",
    " you answer it? Don't worry, I ",
    " wait for you.",
  ],
  huecos: [
    { respuesta: "is going to", alternativas: ["'s going to"], pista: "Predicción basada en evidencia visible (nubes oscuras) → be going to" },
    { respuesta: "will", alternativas: ["'ll"], pista: "Decisión espontánea tomada en el momento de hablar → will" },
    { respuesta: "is going to", alternativas: ["'s going to"], pista: "Plan decidido antes de este momento (ya aplicó) → be going to" },
    { respuesta: "will", alternativas: ["'ll"], pista: "Decisión no tomada aún, espontánea o tentativa → will" },
    { respuesta: "Will", alternativas: ["will"], pista: "Ofrecimiento espontáneo o decisión inmediata → will" },
    { respuesta: "will", alternativas: ["'ll"], pista: "Promesa o decisión espontánea en el momento → will" },
  ],
};

/** A6 «Fill in the blanks — Talking about plans» — verbatim. */
export const HUECOS_A6: TextoHuecosData = {
  ancla: "IN-IV-P05-A6 · Fill in the blanks — Talking about plans",
  instrucciones: "Completa los huecos con la estructura de futuro o conector de propósito correcta.",
  partes: [
    "Next semester, our class ",
    " going to launch a recycling project. We ",
    " planning to collect plastic bottles every Friday. I ",
    " to involve the whole school because it matters for our environment. We could ",
    " community events to raise awareness too.",
  ],
  huecos: [
    { respuesta: "is", alternativas: ["'s"], pista: "Our class ___ going to (3ª persona singular del presente de 'be')." },
    { respuesta: "are", alternativas: ["'re"], pista: "We ___ planning to (1ª persona plural del presente de 'be')." },
    { respuesta: "hope", alternativas: [], pista: "I ___ to involve = espero involucrar (deseo futuro)." },
    { respuesta: "organise", alternativas: ["organize", "hold", "plan"], pista: "We could ___ events (verbo base después de 'could')." },
  ],
};

/** A7 autoevaluación — verbatim. */
export const A7 = {
  instrucciones: "Marca tu nivel honesto en cada criterio.",
  criterios: [
    "Uso 'be going to + infinitive' para hablar de planes ya decididos.",
    "Uso 'I'm planning to' e 'I hope to' para expresar intenciones y deseos.",
    "Explico la importancia de mis planes con 'because' o 'so that'.",
    "Propongo planes comunitarios o grupales con 'we could + infinitive'.",
  ],
  escala: [
    { valor: 1, etiqueta: "En inicio", descripcion: "Todavía necesito apoyo y consultar el material." },
    { valor: 2, etiqueta: "En proceso", descripcion: "Lo logro con algunos errores o dudas." },
    { valor: 3, etiqueta: "Logrado", descripcion: "Lo hago bien de forma autónoma." },
    { valor: 4, etiqueta: "Destacado", descripcion: "Lo hago con seguridad y puedo ayudar a otra persona." },
  ],
  reflexion: "¿Qué plan o propósito tienes para el próximo semestre que ya puedes expresar en inglés?",
};

/**
 * Reto evaluable: las dos preguntas cerradas del video A9 (enunciados y
 * opciones verbatim; la retroalimentación es del laboratorio, basada en A1).
 */
export const QUIZ_A9: QuizEvaluable = {
  titulo: "Video A9 · Planes y propósitos: be going to y will",
  puntajeMinimo: 100,
  reactivos: [
    {
      enunciado: "Al ver nubes oscuras ahora mismo, ¿qué estructura prefiere el inglés?",
      opciones: ["It will rain this afternoon", "It is going to rain this afternoon", "It rains this afternoon"],
      respuestaCorrecta: 1,
      retroalimentacion: "Con evidencia presente (las nubes que ves ahora) el inglés prefiere be going to: «It is going to rain this afternoon». Will queda para predicciones sin evidencia enfrente y «It rains» es Present Simple (lectura A1).",
    },
    {
      enunciado: "'Will' se usa para decisiones espontáneas tomadas en el momento de hablar.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Verdadero: «It is very hot in here, I will open the window» — la decisión nace en el momento de hablar (lectura A1).",
    },
  ],
};

export const FUENTE =
  "CEN Bachillerato — UAC Inglés IV, progresión 5: lectura A1 «Plans and Goals: Be Going To and Will», fill_blanks A2 y A6, reflexión escrita A3, verdadero/falso A4, glosario A5, autoevaluación A7, relacionar columnas A8 y preguntas del video A9.";

export const PROBLEMA =
  "¿Cómo cuentas en inglés lo que piensas hacer y por qué importa? En este laboratorio decides qué forma del futuro pide cada situación y ves lo que pasa, propones y planeas cinco proyectos que transforman una colonia, y escribes tus propias metas en una agenda que va de la próxima semana a dentro de cinco años.";

export const INSTRUCCIONES: string[] = [
  "En Plan or decision?, lee la situación: primero di qué tipo de futuro es (plan, evidencia, cita, decisión, promesa u opinión) y luego elige la forma del verbo. La maqueta muestra la consecuencia.",
  "En Community project, elige un lugar de la colonia, propón el proyecto con «We could…» y arma el plan con fichas: quién + be going to + qué + cuándo + por qué. Cada plan correcto transforma la maqueta.",
  "En My goals, escribe en inglés una meta para cada fecha de la agenda con la estructura que se pide y su propósito (to, so that o because). Se aceptan contracciones: I'm = I am, I'll = I will.",
  "Relaciona los conceptos de A8 para ganar estrellas, responde el reto del video A9, completa los textos A2 y A6 y escribe tus planes (A3).",
];

export const IDEAS: string[] = [
  "Be going to: planes ya decididos antes de hablar (I'm going to study nursing) y predicciones con evidencia a la vista (It's going to rain).",
  "Will: decisiones en el momento (I'll open the window), promesas y ofrecimientos (I'll call you) y opiniones o ideas no decididas (Maybe I'll…, I think… will).",
  "Present continuous: citas y acuerdos con fecha y hora (I'm seeing the dentist tomorrow at 4 p.m.).",
  "Para proponer a un grupo: We could + verbo base, sin to (We could clean up the park).",
  "Para explicar por qué: to + verbo (to make it safe), so that + oración, casi siempre con can (so that children can play) y because + la causa (because there is trash everywhere).",
  "Con be going to cuida el verbo be: I am, he / she / it / our class is, we / you / they are. Por escrito, going to y no gonna.",
];

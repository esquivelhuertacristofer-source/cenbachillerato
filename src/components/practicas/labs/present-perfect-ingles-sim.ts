/**
 * Lógica pura de la conversación con Sam (Present perfect, IN-V·P02).
 *
 * Sam es un estudiante de intercambio FICTICIO que hace tres preguntas sobre
 * tus experiencias. Cada pregunta tiene dos turnos y el segundo depende de lo
 * que respondiste (rama «vive» o «nunca»): así el alumno pasa del present
 * perfect (experiencia sin fecha, ever / never / already / yet / for / since)
 * al past simple (cuándo ocurrió, con un momento concreto). Una forma o un
 * tiempo equivocado confunde a Sam y se explica la regla en español.
 *
 * Sin React: lo usa el componente y se puede probar aparte.
 */

export type Rama = "vive" | "nunca";
export type TipoRespuesta = "ok" | "tiempo" | "forma";

export interface OpcionConv {
  id: string;
  texto: string;
  tipo: TipoRespuesta;
  /** Solo en el primer turno: qué camino abre una respuesta correcta. */
  rama?: Rama;
  /** Lo que contesta Sam (en inglés). */
  reaccion: string;
  /** La regla, en español. */
  porque: string;
  /** Solo en el segundo turno, si es correcta: etiqueta y posición (0 = lejos, 1 = hoy) en la línea de tiempo. */
  cuando?: string;
  pos?: number;
}

export interface Turno {
  sam: string;
  opciones: OpcionConv[];
}

export interface Tema {
  id: string;
  /** Rótulo del carril del mapa de experiencias. */
  lugar: string;
  icono: string;
  foto: string;
  t1: Turno;
  t2: Record<Rama, Turno>;
}

const R_TIEMPO_EXP =
  "Contar que la experiencia existe, sin decir cuándo, pide present perfect (have + participio). El past simple exige un momento concreto.";
const R_FECHA_PP =
  "Un momento específico (yesterday, last…, ago) exige past simple. El present perfect no se combina con una fecha concreta.";
const R_SINCE =
  "«since» y «for» unen el pasado con el presente: llevan present perfect (have + participio), no past simple ni presente simple.";

export const TEMAS: Tema[] = [
  {
    id: "viajes",
    lugar: "Viajes",
    icono: "fa-bus",
    foto: "viajes",
    t1: {
      sam: "Have you ever travelled to another state in Mexico?",
      opciones: [
        { id: "v1-a", texto: "Yes, I have travelled to Veracruz.", tipo: "ok", rama: "vive", reaccion: "Nice! I've never been there.", porque: "Correcto: have + participio (travelled) cuenta una experiencia sin fecha." },
        { id: "v1-b", texto: "No, I have never travelled outside my city.", tipo: "ok", rama: "nunca", reaccion: "I see. Maybe one day!", porque: "Correcto: «never» con have + participio dice que la experiencia no ha ocurrido hasta hoy." },
        { id: "v1-c", texto: "I travelled to Veracruz.", tipo: "tiempo", reaccion: "Hmm... when? I asked if you have ever travelled.", porque: R_TIEMPO_EXP },
        { id: "v1-d", texto: "Yes, I have gone to Veracruz yesterday.", tipo: "forma", reaccion: "Wait, yesterday? I'm confused.", porque: R_FECHA_PP },
      ],
    },
    t2: {
      vive: {
        sam: "Cool! When did you go?",
        opciones: [
          { id: "v2v-a", texto: "I went there last summer.", tipo: "ok", reaccion: "Summer in Veracruz, sounds great!", porque: "Correcto: «last summer» es un momento específico, así que va en past simple (went).", cuando: "last summer", pos: 0.8 },
          { id: "v2v-b", texto: "I travelled there two years ago.", tipo: "ok", reaccion: "Two years ago! That's a while.", porque: "Correcto: «ago» marca un momento concreto del pasado: past simple.", cuando: "two years ago", pos: 0.55 },
          { id: "v2v-c", texto: "I have gone there last summer.", tipo: "tiempo", reaccion: "Sorry? Have gone... last summer? That sounds strange.", porque: R_FECHA_PP },
          { id: "v2v-d", texto: "I go there last summer.", tipo: "forma", reaccion: "Do you mean you go there every summer?", porque: "Un hecho terminado en el pasado necesita la forma de pasado (went), no el verbo base." },
        ],
      },
      nunca: {
        sam: "How long have you wanted to travel?",
        opciones: [
          { id: "v2n-a", texto: "I have wanted to travel for years.", tipo: "ok", reaccion: "For years! You should plan a trip.", porque: "Correcto: «for» + duración que llega hasta hoy lleva present perfect (have wanted).", cuando: "for years", pos: 0.4 },
          { id: "v2n-b", texto: "I have wanted to travel since I was ten.", tipo: "ok", reaccion: "Since you were ten? Wow.", porque: "Correcto: «since» + punto de inicio en el pasado lleva present perfect.", cuando: "since I was ten", pos: 0.25 },
          { id: "v2n-c", texto: "I wanted to travel since I was ten.", tipo: "tiempo", reaccion: "Wait, do you still want to? I don't understand.", porque: R_SINCE },
          { id: "v2n-d", texto: "I want to travel for years.", tipo: "forma", reaccion: "For years? In the future?", porque: R_SINCE },
        ],
      },
    },
  },
  {
    id: "cocina",
    lugar: "Cocina",
    icono: "fa-utensils",
    foto: "cocina",
    t1: {
      sam: "Have you ever cooked dinner for your family?",
      opciones: [
        { id: "c1-a", texto: "Yes, I have cooked for them many times.", tipo: "ok", rama: "vive", reaccion: "That's awesome!", porque: "Correcto: have + participio (cooked) para una experiencia repetida, sin fechas." },
        { id: "c1-b", texto: "No, I have never cooked a whole dinner.", tipo: "ok", rama: "nunca", reaccion: "Don't worry, it's never too late.", porque: "Correcto: have never + participio expresa que nunca ha pasado." },
        { id: "c1-c", texto: "Yes, I cooked for them.", tipo: "tiempo", reaccion: "OK... but when? I'm not sure what you mean.", porque: R_TIEMPO_EXP },
        { id: "c1-d", texto: "Yes, I have cooked for them last Sunday.", tipo: "forma", reaccion: "Last Sunday? I'm confused.", porque: R_FECHA_PP },
      ],
    },
    t2: {
      vive: {
        sam: "What did you make last time?",
        opciones: [
          { id: "c2v-a", texto: "I made enchiladas last Sunday.", tipo: "ok", reaccion: "Enchiladas! I'm hungry now.", porque: "Correcto: «last Sunday» es un momento concreto: past simple (made).", cuando: "last Sunday", pos: 0.9 },
          { id: "c2v-b", texto: "I made soup two weeks ago.", tipo: "ok", reaccion: "Soup is a good choice.", porque: "Correcto: «two weeks ago» fija el momento: past simple.", cuando: "two weeks ago", pos: 0.75 },
          { id: "c2v-c", texto: "I have made enchiladas last Sunday.", tipo: "tiempo", reaccion: "Sorry? Have made... last Sunday?", porque: R_FECHA_PP },
          { id: "c2v-d", texto: "I maked enchiladas last Sunday.", tipo: "forma", reaccion: "Maked? Do you mean made?", porque: "«make» es irregular: su pasado es made, no «maked»." },
        ],
      },
      nunca: {
        sam: "How long have you been interested in cooking?",
        opciones: [
          { id: "c2n-a", texto: "I have been interested in cooking since last year.", tipo: "ok", reaccion: "Since last year, great!", porque: "Correcto: «since» + punto de inicio lleva present perfect (have been).", cuando: "since last year", pos: 0.45 },
          { id: "c2n-b", texto: "I have been interested in cooking for six months.", tipo: "ok", reaccion: "Six months, you are a beginner!", porque: "Correcto: «for» + duración lleva present perfect.", cuando: "for six months", pos: 0.6 },
          { id: "c2n-c", texto: "I was interested in cooking since last year.", tipo: "tiempo", reaccion: "Were? So you aren't interested now?", porque: R_SINCE },
          { id: "c2n-d", texto: "I am interested in cooking since last year.", tipo: "forma", reaccion: "Hmm, that sounds strange to me.", porque: "Con «since» no se usa el presente simple: se necesita have been." },
        ],
      },
    },
  },
  {
    id: "voluntariado",
    lugar: "Voluntariado",
    icono: "fa-hand-holding-heart",
    foto: "voluntariado",
    t1: {
      sam: "Have you done any volunteer work yet?",
      opciones: [
        { id: "w1-a", texto: "Yes, I have already helped at an animal shelter.", tipo: "ok", rama: "vive", reaccion: "Really? That's wonderful!", porque: "Correcto: «already» acompaña al present perfect: ya ocurrió, sin decir cuándo." },
        { id: "w1-b", texto: "Not yet, I haven't done any volunteer work.", tipo: "ok", rama: "nunca", reaccion: "OK, maybe soon.", porque: "Correcto: «not yet» + haven't + participio: todavía no ha ocurrido." },
        { id: "w1-c", texto: "Yes, I helped at an animal shelter.", tipo: "tiempo", reaccion: "Hmm... when did that happen?", porque: R_TIEMPO_EXP },
        { id: "w1-d", texto: "Yes, I have already helped at a shelter last month.", tipo: "forma", reaccion: "Last month and already? I'm lost.", porque: R_FECHA_PP },
      ],
    },
    t2: {
      vive: {
        sam: "That's great! When was that?",
        opciones: [
          { id: "w2v-a", texto: "I helped there last month.", tipo: "ok", reaccion: "Last month, so it was recent!", porque: "Correcto: «last month» es un momento concreto: past simple (helped).", cuando: "last month", pos: 0.85 },
          { id: "w2v-b", texto: "I helped there two months ago.", tipo: "ok", reaccion: "Two months ago. Nice.", porque: "Correcto: «two months ago»: past simple.", cuando: "two months ago", pos: 0.7 },
          { id: "w2v-c", texto: "I have helped there last month.", tipo: "tiempo", reaccion: "Have helped... last month? I don't get it.", porque: R_FECHA_PP },
          { id: "w2v-d", texto: "I helping there last month.", tipo: "forma", reaccion: "Sorry, I didn't understand.", porque: "El past simple usa el verbo en pasado (helped), sin «-ing» y sin auxiliar." },
        ],
      },
      nunca: {
        sam: "Would you like to? How long have you thought about it?",
        opciones: [
          { id: "w2n-a", texto: "I have thought about it for a long time.", tipo: "ok", reaccion: "For a long time! Then do it.", porque: "Correcto: «for» + duración lleva present perfect (have thought).", cuando: "for a long time", pos: 0.35 },
          { id: "w2n-b", texto: "I have thought about it since January.", tipo: "ok", reaccion: "Since January. You should start!", porque: "Correcto: «since» + punto de inicio lleva present perfect.", cuando: "since January", pos: 0.5 },
          { id: "w2n-c", texto: "I thought about it since January.", tipo: "tiempo", reaccion: "Do you still think about it? I'm confused.", porque: R_SINCE },
          { id: "w2n-d", texto: "I have think about it for a long time.", tipo: "forma", reaccion: "Have think? I don't understand.", porque: "El present perfect usa el participio (thought), no el verbo base «think»." },
        ],
      },
    },
  },
];

/* ── Estado de la conversación ──────────────────────────────────────── */

export interface TemaProg {
  fase: 0 | 1 | 2;
  rama?: Rama;
  cuando?: string;
  pos?: number;
}

export interface Mensaje {
  id: number;
  de: "sam" | "tu";
  texto: string;
  estado?: "ok" | "confuso";
}

export interface Ultimo {
  tipo: TipoRespuesta;
  porque: string;
  opcionId: string;
}

export interface EstadoConv {
  progreso: Record<string, TemaProg>;
  log: Mensaje[];
  /** Opciones ya probadas (y falladas) en el turno actual. */
  fallos: string[];
  ultimo: Ultimo | null;
  errores: number;
}

export function estadoInicial(): EstadoConv {
  const progreso: Record<string, TemaProg> = {};
  for (const t of TEMAS) progreso[t.id] = { fase: 0 };
  return {
    progreso,
    log: [
      { id: 0, de: "sam", texto: "Hi! I'm Sam, an exchange student. I want to know you better." },
      { id: 1, de: "sam", texto: TEMAS[0]!.t1.sam },
    ],
    fallos: [],
    ultimo: null,
    errores: 0,
  };
}

export function temaActivo(e: EstadoConv): Tema | null {
  return TEMAS.find((t) => e.progreso[t.id]!.fase < 2) ?? null;
}

export function turnoActual(e: EstadoConv): { tema: Tema; turno: Turno } | null {
  const tema = temaActivo(e);
  if (!tema) return null;
  const p = e.progreso[tema.id]!;
  const turno = p.fase === 0 ? tema.t1 : tema.t2[p.rama ?? "vive"];
  return { tema, turno };
}

export function conversacionCompleta(e: EstadoConv): boolean {
  return temaActivo(e) === null;
}

export function temasCompletos(e: EstadoConv): number {
  return TEMAS.filter((t) => e.progreso[t.id]!.fase === 2).length;
}

/** Una respuesta del alumno. Si es correcta avanza; si no, Sam se confunde y se explica la regla. */
export function responder(e: EstadoConv, opcionId: string): EstadoConv {
  const actual = turnoActual(e);
  if (!actual || e.fallos.includes(opcionId)) return e;
  const op = actual.turno.opciones.find((o) => o.id === opcionId);
  if (!op) return e;
  let id = e.log.length;
  const log = [...e.log];

  if (op.tipo !== "ok") {
    log.push({ id: id++, de: "tu", texto: op.texto, estado: "confuso" });
    log.push({ id: id++, de: "sam", texto: op.reaccion, estado: "confuso" });
    return { ...e, log, fallos: [...e.fallos, opcionId], ultimo: { tipo: op.tipo, porque: op.porque, opcionId }, errores: e.errores + 1 };
  }

  log.push({ id: id++, de: "tu", texto: op.texto, estado: "ok" });
  log.push({ id: id++, de: "sam", texto: op.reaccion, estado: "ok" });
  const p = e.progreso[actual.tema.id]!;
  const sig: TemaProg = p.fase === 0 ? { fase: 1, rama: op.rama } : { ...p, fase: 2, cuando: op.cuando, pos: op.pos };
  const progreso = { ...e.progreso, [actual.tema.id]: sig };
  const siguiente: EstadoConv = { ...e, progreso, log, fallos: [], ultimo: { tipo: "ok", porque: op.porque, opcionId } };
  const prox = turnoActual(siguiente);
  if (prox) {
    log.push({ id: id++, de: "sam", texto: prox.turno.sam });
  } else {
    log.push({ id: id++, de: "sam", texto: "Thanks! Now I know a lot about you. See you at school!" });
  }
  return siguiente;
}

/* ── Mapa de experiencias (línea de tiempo) ─────────────────────────── */

export interface CarrilMapa {
  id: string;
  lugar: string;
  icono: string;
  estado: "vacio" | "vive" | "nunca" | "vive-fechado" | "nunca-duracion";
  cuando?: string;
  pos?: number;
}

export function mapa(e: EstadoConv): CarrilMapa[] {
  return TEMAS.map((t) => {
    const p = e.progreso[t.id]!;
    let estado: CarrilMapa["estado"] = "vacio";
    if (p.fase >= 1) estado = p.rama === "vive" ? "vive" : "nunca";
    if (p.fase === 2) estado = p.rama === "vive" ? "vive-fechado" : "nunca-duracion";
    return { id: t.id, lugar: t.lugar, icono: t.icono, estado, cuando: p.cuando, pos: p.pos };
  });
}

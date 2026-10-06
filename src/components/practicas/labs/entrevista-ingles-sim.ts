/**
 * Modelo determinista del laboratorio «La entrevista» (IN-V-P07). Lógica pura,
 * sin React, para que la pantalla y las pruebas usen las mismas reglas.
 *
 * 1. «Interview» — una entrevista de beca simulada (Bridgeway Exchange
 *    Program, ficticio). Siete preguntas, cada una con un reloj de silencio.
 *    El alumno puede usar tres estrategias (repetir, aclarar, ganar tiempo) y
 *    arma su respuesta con piezas: respuesta + detalle + ejemplo. Tres
 *    medidores —fluidez, desarrollo y escucha— hacen la impresión; al final,
 *    la decisión (accepted / waitlist / not selected) con la libreta del
 *    entrevistador que explica por qué.
 * 2. «Panel» — un panel estudiantil (ficticio) en cinco momentos. Las seis
 *    jugadas son siempre las mismas; lo que cambia es el MOMENTO: la misma
 *    frase es correcta o descortés según quién tiene la palabra.
 * 3. «Your turn» — analizador de lo que el alumno escribe: detecta las seis
 *    frases del glosario A5, algunos errores frecuentes y si la respuesta es
 *    demasiado corta.
 *
 * Personas, organizaciones y lugares FICTICIOS; puntajes de simulación.
 * Inglés estadounidense estándar; explicaciones en español de México.
 */
import type { FraseId } from "./entrevista-ingles-data";

/* ═══════════════════════════════════════════════════════════════════════
 * 1 · LA ENTREVISTA
 * ═══════════════════════════════════════════════════════════════════════ */

export type MedidorId = "flu" | "des" | "esc";
export type Medidores = Record<MedidorId, number>;

export const INICIO: Medidores = { flu: 50, des: 50, esc: 50 };

export const MEDIDOR_INFO: Record<MedidorId, { etiqueta: string; icono: string; color: string; que: string }> = {
  flu: { etiqueta: "Fluidez", icono: "fa-wave-square", color: "#5BA8FF", que: "Sin silencios largos; ganas tiempo con cortesía." },
  des: { etiqueta: "Desarrollo", icono: "fa-layer-group", color: "#FFC75A", que: "Respuesta + detalle + ejemplo, no solo «yes» o «no»." },
  esc: { etiqueta: "Escucha", icono: "fa-ear-listen", color: "#34D399", que: "Pides aclaración, preguntas y cierras con cortesía." },
};

export const ORDEN_MEDIDORES: MedidorId[] = ["flu", "des", "esc"];

/** La impresión es el promedio de los tres medidores. */
export function impresion(m: Medidores): number {
  return Math.round((m.flu + m.des + m.esc) / 3);
}

const lim = (v: number) => Math.max(0, Math.min(100, v));

export function suma(m: Medidores, d: Partial<Medidores>): Medidores {
  return { flu: lim(m.flu + (d.flu ?? 0)), des: lim(m.des + (d.des ?? 0)), esc: lim(m.esc + (d.esc ?? 0)) };
}

export type Tono = "bien" | "regular" | "mal";
export type TipoTurno = "abierta" | "ambigua" | "confusa" | "dificil" | "preguntas" | "cierre";
export type RolFila = "respuesta" | "detalle" | "ejemplo" | "pregunta" | "seguimiento" | "cierre";

export interface Pieza {
  id: string;
  /** Lo que dice el alumno. Vacío = «sin detalle», «sin ejemplo»… */
  en: string;
  tono: Tono | "nada";
  delta: Partial<Medidores>;
  /** Por qué suma o resta, en español. */
  porque: string;
}

export interface Fila {
  rol: RolFila;
  etiqueta: string;
  opciones: Pieza[];
}

export interface Turno {
  id: string;
  tipo: TipoTurno;
  pregunta: string;
  es: string;
  /** Lo que se alcanza a oír (confusa): las partes tapadas van con ▒. */
  oido?: string;
  oidoEs?: string;
  /** Palabra que no queda clara (ambigua). */
  palabraClave?: string;
  /** La pregunta, ya aclarada o repetida con claridad. */
  aclarada?: string;
  aclaradaEs?: string;
  /** Segundos de silencio que aguanta el entrevistador. */
  reloj: number;
  /** Lo que el alumno cree que le preguntaron si no aclara (adivinanzas). */
  filasAntes?: Fila[];
  filas: Fila[];
  reaccion: Record<Tono, string>;
  /** La reacción cuando se respondió sin entender. */
  reaccionSinEntender?: string;
}

const SIN = (rol: RolFila): Pieza => ({ id: `sin-${rol}`, en: "", tono: "nada", delta: {}, porque: "" });

export const ENTREVISTADOR = { nombre: "Mr. Daniel Brooks", rol: "entrevistador del Bridgeway Exchange Program (ficticio)" };

export const TURNOS: Turno[] = [
  {
    id: "t1",
    tipo: "abierta",
    pregunta: "Thanks for coming in today. To start, could you tell me a little about yourself?",
    es: "Gracias por venir hoy. Para empezar, ¿me cuentas un poco sobre ti?",
    reloj: 40,
    filas: [
      {
        rol: "respuesta",
        etiqueta: "Tu respuesta",
        opciones: [
          { id: "t1-r1", en: "I'm a student.", tono: "mal", delta: { des: -8 }, porque: "Es verdad, pero él ya lo sabía: una respuesta de tres palabras no le deja nada que anotar." },
          { id: "t1-r2", en: "I'm in my fifth semester of high school, and I'm really interested in environmental science.", tono: "bien", delta: { des: 4 }, porque: "Responde directo y dice algo de ti: tu semestre y tu interés." },
          { id: "t1-r3", en: "My favorite food is pozole.", tono: "mal", delta: { des: -8 }, porque: "Es sobre ti, pero no sobre lo que importa en una entrevista de beca: tu perfil y tus intereses." },
        ],
      },
      {
        rol: "detalle",
        etiqueta: "Un detalle",
        opciones: [
          SIN("detalle"),
          { id: "t1-d1", en: "On weekends, I volunteer at a recycling center in my town.", tono: "bien", delta: { des: 6 }, porque: "Un detalle concreto hace creíble tu interés." },
          { id: "t1-d2", en: "Also, I have three cats and a turtle.", tono: "mal", delta: { des: -4 }, porque: "Simpático, pero no tiene que ver con lo que te preguntan: distrae." },
        ],
      },
      {
        rol: "ejemplo",
        etiqueta: "Un ejemplo",
        opciones: [
          SIN("ejemplo"),
          { id: "t1-e1", en: "For example, last year I helped organize a cleanup of the river near my school.", tono: "bien", delta: { des: 6 }, porque: "El ejemplo convierte una afirmación en evidencia (A1: «Always link your opinions to data, examples, or expert sources»)." },
        ],
      },
    ],
    reaccion: {
      bien: "That's great. A river cleanup — I'm writing that down.",
      regular: "Okay, thank you. Let's move on.",
      mal: "Hmm. Okay...",
    },
  },
  {
    id: "t2",
    tipo: "abierta",
    pregunta: "Why do you want to join the Bridgeway Exchange Program?",
    es: "¿Por qué quieres entrar al programa de intercambio Bridgeway?",
    reloj: 40,
    filas: [
      {
        rol: "respuesta",
        etiqueta: "Tu respuesta",
        opciones: [
          { id: "t2-r1", en: "Because.", tono: "mal", delta: { des: -10 }, porque: "«Because» solo no es una razón: es la palabra con la que EMPIEZA la razón." },
          { id: "t2-r2", en: "I want to improve my English and learn how other countries take care of the environment.", tono: "bien", delta: { des: 4 }, porque: "Dos razones claras y ligadas a tu interés." },
          { id: "t2-r3", en: "I heard the food there is really good.", tono: "mal", delta: { des: -6 }, porque: "Razón superficial: suena a viaje de vacaciones, no a un programa académico." },
        ],
      },
      {
        rol: "detalle",
        etiqueta: "Un detalle",
        opciones: [
          SIN("detalle"),
          { id: "t2-d1", en: "Most of the articles I read for my science classes are in English, so I need it for my future studies.", tono: "bien", delta: { des: 6 }, porque: "Explica POR QUÉ te importa el inglés: la razón se vuelve convincente." },
          { id: "t2-d2", en: "My cousin went last year and he bought a new phone there.", tono: "mal", delta: { des: -4 }, porque: "No responde por qué TÚ quieres ir." },
        ],
      },
      {
        rol: "ejemplo",
        etiqueta: "Un ejemplo",
        opciones: [
          SIN("ejemplo"),
          { id: "t2-e1", en: "From my experience in the recycling project, I learn best when I work with people from different places.", tono: "bien", delta: { des: 6 }, porque: "«From my experience...» (glosario A5) presenta tu vivencia como apoyo de la respuesta." },
        ],
      },
    ],
    reaccion: {
      bien: "I like that answer. You clearly know why you're here.",
      regular: "I see. Thank you.",
      mal: "Hmm... I see.",
    },
  },
  {
    id: "t3",
    tipo: "ambigua",
    pregunta: "So, how would you rate yourself on adaptability?",
    es: "Entonces, ¿cómo te calificarías en «adaptability»?",
    palabraClave: "adaptability",
    aclarada: "Good question. I mean: how would you adapt to living with a host family in a different culture?",
    aclaradaEs: "Buena pregunta. Me refiero a: ¿cómo te adaptarías a vivir con una familia anfitriona de otra cultura?",
    reloj: 40,
    filasAntes: [
      {
        rol: "respuesta",
        etiqueta: "Tu respuesta (lo que crees que pregunta)",
        opciones: [
          { id: "t3-a1", en: "I adapt quickly to new apps and phones.", tono: "mal", delta: { esc: -10 }, porque: "Adivinaste un significado (tecnología) y no era ese. Ante una palabra clave poco clara, pregunta antes: «Could you clarify what you mean by 'adaptability'?»" },
          { id: "t3-a2", en: "I can adapt my schedule if I need to.", tono: "mal", delta: { esc: -10 }, porque: "Adivinaste otro significado (horarios). Responder sin entender suele terminar fuera de tema." },
          { id: "t3-a3", en: "Yes, I'm very adaptable.", tono: "mal", delta: { esc: -6, des: -6 }, porque: "Un «yes» que no dice a qué te adaptas ni cómo: ni aclaras ni desarrollas." },
        ],
      },
    ],
    filas: [
      {
        rol: "respuesta",
        etiqueta: "Tu respuesta",
        opciones: [
          { id: "t3-r1", en: "I would be fine.", tono: "mal", delta: { des: -8 }, porque: "Casi un monosílabo: no dice cómo te adaptarías." },
          { id: "t3-r2", en: "I think I would adapt well, because I'm open to new routines and new food.", tono: "bien", delta: { des: 4 }, porque: "Responde y da una razón con «because»." },
          { id: "t3-r3", en: "I like traveling by plane.", tono: "mal", delta: { des: -8 }, porque: "Fuera de tema: te preguntan por vivir con una familia, no por el viaje." },
        ],
      },
      {
        rol: "detalle",
        etiqueta: "Un detalle",
        opciones: [
          SIN("detalle"),
          { id: "t3-d1", en: "I would ask my host family about their rules at home and try to follow them.", tono: "bien", delta: { des: 6 }, porque: "Una acción concreta muestra CÓMO lo harías." },
          { id: "t3-d2", en: "I don't really like vegetables, though.", tono: "mal", delta: { des: -4 }, porque: "Un detalle negativo que no responde la pregunta." },
        ],
      },
      {
        rol: "ejemplo",
        etiqueta: "Un ejemplo",
        opciones: [
          SIN("ejemplo"),
          { id: "t3-e1", en: "For example, when I stayed with my aunt in Monterrey for a month, I learned to share the chores.", tono: "bien", delta: { des: 6 }, porque: "Una experiencia real (dónde, cuánto tiempo, qué aprendiste) prueba que sí te adaptas." },
        ],
      },
    ],
    reaccion: {
      bien: "That's exactly what I wanted to hear. Thank you.",
      regular: "Okay, good.",
      mal: "I see...",
    },
    reaccionSinEntender: "Hmm... that's not really what I was asking about.",
  },
  {
    id: "t4",
    tipo: "confusa",
    pregunta: "And what would you do if you felt homesick during the program?",
    es: "¿Y qué harías si extrañaras tu casa durante el programa?",
    oido: "And what would you do if you ▒▒▒ ▒▒▒sick during the ▒▒▒?",
    oidoEs: "(Sonó su teléfono a media pregunta: no se oyó completa.)",
    aclarada: "Sorry about that, my phone rang. I said: what would you do if you felt homesick during the program?",
    aclaradaEs: "Perdón, sonó mi teléfono. Dije: ¿qué harías si extrañaras tu casa durante el programa?",
    reloj: 40,
    filasAntes: [
      {
        rol: "respuesta",
        etiqueta: "Tu respuesta (lo que crees que pregunta)",
        opciones: [
          { id: "t4-a1", en: "I would go to the doctor.", tono: "mal", delta: { esc: -10 }, porque: "Oíste «sick» y respondiste sobre enfermedad; la pregunta era «homesick» (extrañar tu casa). Si no la captaste: «Could you repeat that, please?» o «I beg your pardon?»." },
          { id: "t4-a2", en: "I would take some medicine and rest.", tono: "mal", delta: { esc: -10 }, porque: "Respondiste a una pregunta que no te hicieron. Pedir que la repita es educado (A4: «I beg your pardon?» no es grosero)." },
          { id: "t4-a3", en: "I never get sick.", tono: "mal", delta: { esc: -8, des: -4 }, porque: "Adivinas, y además cierras la conversación con una respuesta de cuatro palabras." },
        ],
      },
    ],
    filas: [
      {
        rol: "respuesta",
        etiqueta: "Tu respuesta",
        opciones: [
          { id: "t4-r1", en: "Nothing.", tono: "mal", delta: { des: -8 }, porque: "«Nothing» cierra la conversación y suena a que no lo has pensado." },
          { id: "t4-r2", en: "I would call my family on video, but not every day, so I can enjoy the experience.", tono: "bien", delta: { des: 4 }, porque: "Un plan concreto con un límite sensato." },
          { id: "t4-r3", en: "I would just go back home.", tono: "mal", delta: { des: -8 }, porque: "Suena a que abandonarías el programa: justo lo que le preocupa a quien te entrevista." },
        ],
      },
      {
        rol: "detalle",
        etiqueta: "Un detalle",
        opciones: [
          SIN("detalle"),
          { id: "t4-d1", en: "I would also join a club at the school to meet new people.", tono: "bien", delta: { des: 6 }, porque: "Agrega una segunda acción que muestra iniciativa." },
          { id: "t4-d2", en: "I hate cold weather anyway.", tono: "mal", delta: { des: -4 }, porque: "Una queja que no viene al caso." },
        ],
      },
      {
        rol: "ejemplo",
        etiqueta: "Un ejemplo",
        opciones: [
          SIN("ejemplo"),
          { id: "t4-e1", en: "For example, when I went to a summer camp, I wrote in a journal every night, and it really helped me.", tono: "bien", delta: { des: 6 }, porque: "Un ejemplo real de cómo ya lo resolviste antes." },
        ],
      },
    ],
    reaccion: {
      bien: "That's a very mature answer.",
      regular: "Okay. Thank you.",
      mal: "Hmm, I see.",
    },
    reaccionSinEntender: "Oh — no, I asked about feeling homesick. You know, missing home.",
  },
  {
    id: "t5",
    tipo: "dificil",
    pregunta: "Here's a tough one: what would you say is your biggest weakness?",
    es: "Una difícil: ¿cuál dirías que es tu mayor debilidad?",
    reloj: 15,
    filas: [
      {
        rol: "respuesta",
        etiqueta: "Tu respuesta",
        opciones: [
          { id: "t5-r1", en: "I don't have any.", tono: "mal", delta: { des: -8 }, porque: "Nadie te lo cree: suena a arrogancia o a que evades la pregunta." },
          { id: "t5-r2", en: "Sometimes I get nervous when I speak English in front of a group.", tono: "bien", delta: { des: 4 }, porque: "Honesta y concreta: una debilidad real que se puede trabajar." },
          { id: "t5-r3", en: "I work too hard.", tono: "regular", delta: { des: -2 }, porque: "Frase hecha: los entrevistadores la oyen tanto que no dice nada de ti." },
        ],
      },
      {
        rol: "detalle",
        etiqueta: "Un detalle",
        opciones: [
          SIN("detalle"),
          { id: "t5-d1", en: "But I'm working on it: I joined the debate club this semester.", tono: "bien", delta: { des: 6 }, porque: "Decir qué haces para mejorar convierte la debilidad en un plan." },
          { id: "t5-d2", en: "Also, my phone battery always dies.", tono: "mal", delta: { des: -4 }, porque: "Un chiste fuera de lugar en una pregunta seria." },
        ],
      },
      {
        rol: "ejemplo",
        etiqueta: "Un ejemplo",
        opciones: [
          SIN("ejemplo"),
          { id: "t5-e1", en: "For example, last month I presented my science project in English, and I felt much more confident.", tono: "bien", delta: { des: 6 }, porque: "La evidencia de que ya mejoras." },
        ],
      },
    ],
    reaccion: {
      bien: "Honest, and you're doing something about it. Good.",
      regular: "Okay... thank you.",
      mal: "Hmm. Everyone has a weakness.",
    },
  },
  {
    id: "t6",
    tipo: "preguntas",
    pregunta: "That's all from my list. Do you have any questions for me?",
    es: "Es todo lo de mi lista. ¿Tienes alguna pregunta para mí?",
    reloj: 30,
    filas: [
      {
        rol: "pregunta",
        etiqueta: "Tu pregunta",
        opciones: [
          { id: "t6-p1", en: "No.", tono: "mal", delta: { esc: -10 }, porque: "Decir que no tienes preguntas suena a desinterés: es tu turno de preguntar." },
          { id: "t6-p2", en: "Yes. Could you tell me more about the host families? How are they chosen?", tono: "bien", delta: { esc: 10, des: 4 }, porque: "Una pregunta sobre el programa muestra interés real." },
          { id: "t6-p3", en: "How much free time will I have to go shopping?", tono: "regular", delta: { esc: -3 }, porque: "Válida, pero sugiere que te importa más pasear que aprender." },
        ],
      },
      {
        rol: "seguimiento",
        etiqueta: "Pregunta de seguimiento (tras su respuesta)",
        opciones: [
          SIN("seguimiento"),
          { id: "t6-s1", en: "That sounds great. And what do students usually find most challenging at first?", tono: "bien", delta: { esc: 6 }, porque: "Una pregunta de seguimiento retoma lo que te contestó: es escucha activa." },
          { id: "t6-s2", en: "Wait, I have another one: is there Wi-Fi in the houses?", tono: "mal", delta: { esc: -4 }, porque: "Cambias de tema sin retomar lo que te acaba de contestar." },
        ],
      },
    ],
    reaccion: {
      bien: "Great question. Our team visits every family first. And yes — most students say the first week is the hardest.",
      regular: "Some, yes. Anything else?",
      mal: "Oh... okay.",
    },
  },
  {
    id: "t7",
    tipo: "cierre",
    pregunta: "Well, thank you for coming in today. We'll be in touch by Friday.",
    es: "Bueno, gracias por venir hoy. Te avisamos a más tardar el viernes.",
    reloj: 25,
    filas: [
      {
        rol: "cierre",
        etiqueta: "Tu cierre",
        opciones: [
          { id: "t7-c1", en: "Okay. Bye.", tono: "mal", delta: { esc: -6 }, porque: "Seco: te despides, pero no agradeces el tiempo." },
          { id: "t7-c2", en: "Thank you for your time. It was a pleasure to meet you.", tono: "bien", delta: { esc: 8 }, porque: "Agradece y cierra con cortesía: la última impresión también cuenta." },
          { id: "t7-c3", en: "So... did I get the scholarship?", tono: "mal", delta: { esc: -8 }, porque: "Presionar por la respuesta incomoda: ya te dijo cuándo te avisan." },
        ],
      },
    ],
    reaccion: {
      bien: "The pleasure was mine. Have a great day.",
      regular: "Thanks. Bye now.",
      mal: "We'll let you know.",
    },
  },
];

/* ── Estrategias: repetir, aclarar, ganar tiempo ─────────────────────── */

export type Estrategia = "repetir" | "aclarar" | "tiempo";

export const ESTRATEGIAS: Record<Estrategia, { en: (t: Turno) => string; etiqueta: string; icono: string }> = {
  repetir: { en: () => "Could you repeat that, please?", etiqueta: "Pedir que repita", icono: "fa-rotate-right" },
  aclarar: {
    en: (t) => `Could you clarify what you mean by '${t.palabraClave ?? "that"}'?`,
    etiqueta: "Pedir aclaración",
    icono: "fa-circle-question",
  },
  tiempo: { en: () => "That's a great question. Let me think about that for a moment.", etiqueta: "Ganar tiempo", icono: "fa-hourglass-half" },
};

/** A partir de cuántos usos «ganar tiempo» ya suena a muletilla. */
export const TIEMPO_MAX_SIN_CASTIGO = 2;
/** Segundos que da de más «Let me think about that for a moment». */
export const RELOJ_EXTRA = 12;

export interface EfectoEstrategia {
  delta: Partial<Medidores>;
  tono: Tono;
  /** Lo que contesta el entrevistador. */
  respuesta: string;
  /** ¿Ya se entiende la pregunta? */
  desbloquea: boolean;
  /** ¿Se reinicia el reloj? */
  rellena: boolean;
  porque: string;
  libreta: string;
}

/**
 * Qué pasa al usar una estrategia en este turno. `usosTiempo` = cuántas veces
 * se ha ganado tiempo ANTES en toda la entrevista.
 */
export function efectoEstrategia(t: Turno, e: Estrategia, usosTiempo: number): EfectoEstrategia {
  if (e === "repetir") {
    if (t.tipo === "confusa")
      return { delta: { esc: 12 }, tono: "bien", respuesta: t.aclarada!, desbloquea: true, rellena: true, porque: "«Could you repeat that, please?» era justo lo que pedía una pregunta que no se oyó: la repite completa.", libreta: "Asked me to repeat — good listener." };
    if (t.tipo === "ambigua")
      return { delta: {}, tono: "regular", respuesta: `Sure. ${t.pregunta}`, desbloquea: false, rellena: false, porque: `Repetir no aclara: sí la oíste, lo que no sabes es qué quiere decir «${t.palabraClave}» aquí. Para eso: «Could you clarify what you mean by...?»`, libreta: "Asked me to repeat the same words." };
    return { delta: { esc: -4 }, tono: "regular", respuesta: `Of course. ${t.pregunta}`, desbloquea: false, rellena: false, porque: "La pregunta se oyó clara; pedirla otra vez sugiere que no escuchabas. Úsala cuando de verdad no la captaste.", libreta: "Asked to repeat a clear question." };
  }
  if (e === "aclarar") {
    if (t.tipo === "ambigua")
      return { delta: { esc: 12 }, tono: "bien", respuesta: t.aclarada!, desbloquea: true, rellena: true, porque: "Preguntar qué significa la palabra clave muestra interés (A1: «Clarifying questions show engagement») y te evita responder otra cosa.", libreta: "Checked what I meant — great." };
    if (t.tipo === "confusa")
      return { delta: { esc: 6 }, tono: "regular", respuesta: t.aclarada!, desbloquea: true, rellena: true, porque: "Funcionó, pero el problema era que NO SE OYÓ: «Could you repeat that, please?» o «I beg your pardon?» es más directo.", libreta: "Asked for clarification." };
    return { delta: { esc: -4 }, tono: "regular", respuesta: `What I mean is simple: ${t.pregunta}`, desbloquea: false, rellena: false, porque: "No había nada ambiguo que aclarar; pedir aclaración de más hace que parezca que no entiendes preguntas sencillas.", libreta: "Needed help with a simple question." };
  }
  // ganar tiempo
  if (usosTiempo >= TIEMPO_MAX_SIN_CASTIGO)
    return { delta: { flu: -5 }, tono: "mal", respuesta: "Sure... take your time.", desbloquea: false, rellena: true, porque: `Ya la usaste ${usosTiempo} veces: como muletilla en cada pregunta pierde efecto y suena a que evades.`, libreta: "Uses the same filler every time." };
  if (t.tipo === "dificil")
    return { delta: { flu: 8 }, tono: "bien", respuesta: "Of course. Take your time.", desbloquea: false, rellena: true, porque: "«That's a great question. Let me think about that for a moment.» llena el silencio con cortesía mientras piensas.", libreta: "Took a moment to think — calm." };
  return { delta: {}, tono: "regular", respuesta: "Sure.", desbloquea: false, rellena: true, porque: "No hace daño, pero esta pregunta era sencilla: guárdala para las difíciles.", libreta: "Paused before an easy question." };
}

/** El reloj llegó a cero sin que el alumno dijera nada. */
export const SILENCIO: { delta: Partial<Medidores>; porque: string; libreta: string; respuesta: string } = {
  delta: { flu: -12 },
  porque: "Silencio largo: el entrevistador esperó sin oír nada. Si necesitas pensar, dilo: «Let me think about that for a moment.»",
  libreta: "Long, awkward silence.",
  respuesta: "...Are you still with me?",
};

/** ¿La pregunta necesita aclararse/repetirse antes de poder responderla? */
export const requiereEntender = (t: Turno) => t.tipo === "ambigua" || t.tipo === "confusa";

export const filasDe = (t: Turno, entendida: boolean): Fila[] => (requiereEntender(t) && !entendida ? t.filasAntes ?? t.filas : t.filas);

/** La frase completa que dice el alumno. */
export const frase = (piezas: Pieza[]) => piezas.map((p) => p.en).filter(Boolean).join(" ");

export type Nivel = "monosilabo" | "sinEntender" | "corta" | "conDetalle" | "desarrollada" | "unica";

export const NIVEL_INFO: Record<Nivel, { en: string; es: string }> = {
  monosilabo: { en: "weak or off-topic answer", es: "Respuesta débil: monosílabo, fuera de tema o que no ayuda." },
  sinEntender: { en: "answered without understanding the question", es: "Respondiste sin entender la pregunta: ni la mejor respuesta da en el blanco." },
  corta: { en: "short answer, no support", es: "Correcta pero corta: agrega un detalle y un ejemplo (respuesta + detalle + ejemplo)." },
  conDetalle: { en: "answer + support", es: "Respuesta con apoyo; con detalle Y ejemplo quedaría completa." },
  desarrollada: { en: "developed answer: detail + example", es: "Respuesta + detalle + ejemplo: así se desarrolla una respuesta de entrevista." },
  unica: { en: "", es: "" },
};

export interface NotaTurno {
  texto: string;
  tono: Tono;
  porque: string;
}

export interface ResultadoTurno {
  delta: Medidores;
  despues: Medidores;
  tono: Tono;
  nivel: Nivel;
  notas: NotaTurno[];
  respuesta: string;
  libreta: string;
}

/**
 * Evalúa la respuesta armada. `entendida` = ya se aclaró/repitió (sólo importa
 * en preguntas ambiguas o confusas); `silencio` = el reloj llegó a cero en
 * este turno (el castigo ya se aplicó; aquí sólo se pierde el bono de fluidez).
 */
export function evaluaRespuesta(t: Turno, piezas: Pieza[], entendida: boolean, silencio: boolean, antes: Medidores): ResultadoTurno {
  const d: Medidores = { flu: 0, des: 0, esc: 0 };
  const notas: NotaTurno[] = [];
  for (const p of piezas) {
    if (p.tono === "nada") continue;
    d.flu += p.delta.flu ?? 0;
    d.des += p.delta.des ?? 0;
    d.esc += p.delta.esc ?? 0;
    notas.push({ texto: p.en, tono: p.tono, porque: p.porque });
  }
  if (!silencio) {
    d.flu += 4;
    notas.push({ texto: "Sin silencios largos", tono: "bien", porque: "Respondiste antes de que el silencio se volviera incómodo: +4 de fluidez." });
  }

  const sinEntender = requiereEntender(t) && !entendida;
  const principal = piezas[0];
  const extras = piezas.slice(1).filter((p) => p.tono !== "nada");
  const extrasBien = extras.filter((p) => p.tono === "bien").length;
  const extrasMal = extras.filter((p) => p.tono === "mal").length;
  const multi = t.filas.length > 1 && (t.filas[0]!.rol === "respuesta");

  let nivel: Nivel = "unica";
  let tono: Tono;
  if (sinEntender) {
    nivel = "sinEntender";
    tono = "mal";
  } else if (!principal || principal.tono === "mal") {
    nivel = multi ? "monosilabo" : "unica";
    tono = "mal";
  } else if (multi) {
    nivel = extrasBien >= 2 ? "desarrollada" : extrasBien === 1 ? "conDetalle" : "corta";
    tono = principal.tono === "bien" && extrasBien >= 1 && extrasMal === 0 ? "bien" : "regular";
  } else {
    tono = principal.tono === "bien" && extrasMal === 0 ? "bien" : principal.tono === "bien" ? "regular" : principal.tono === "nada" ? "mal" : principal.tono;
  }

  if (nivel !== "unica") notas.unshift({ texto: NIVEL_INFO[nivel].en, tono: nivel === "desarrollada" ? "bien" : nivel === "conDetalle" || nivel === "corta" ? "regular" : "mal", porque: NIVEL_INFO[nivel].es });

  const respuesta = sinEntender ? t.reaccionSinEntender ?? t.reaccion.mal : t.reaccion[tono];
  const libreta = nivel !== "unica" ? NIVEL_INFO[nivel].en : tono === "bien" ? (t.tipo === "cierre" ? "polite closing" : "good questions for me") : tono === "regular" ? (t.tipo === "cierre" ? "closing ok" : "question not very relevant") : t.tipo === "cierre" ? "abrupt or pushy closing" : "no real questions";
  return { delta: d, despues: suma(antes, d), tono, nivel, notas, respuesta, libreta };
}

/* ── La decisión ──────────────────────────────────────────────────────── */

export const UMBRAL_ACEPTADO = 70;
export const UMBRAL_ESPERA = 55;

export type DecisionId = "aceptado" | "espera" | "no";

export function decision(m: Medidores): { id: DecisionId; sello: string; titulo: string; texto: string; color: string; icono: string } {
  const imp = impresion(m);
  const flojo = ORDEN_MEDIDORES.reduce((a, b) => (m[a] <= m[b] ? a : b));
  const consejo = `Tu medidor más bajo fue ${MEDIDOR_INFO[flojo].etiqueta.toLowerCase()}: ${MEDIDOR_INFO[flojo].que}`;
  if (imp >= UMBRAL_ACEPTADO)
    return { id: "aceptado", sello: "ACCEPTED", titulo: "Aceptado", texto: `Impresión ${imp}: respondiste desarrollando, entendiste antes de contestar y cerraste con cortesía.`, color: "#34D399", icono: "fa-circle-check" };
  if (imp >= UMBRAL_ESPERA)
    return { id: "espera", sello: "WAITLIST", titulo: "Lista de espera", texto: `Impresión ${imp}: buen candidato, pero no destacaste. ${consejo}`, color: "#FFC75A", icono: "fa-hourglass-half" };
  return { id: "no", sello: "NOT SELECTED", titulo: "No seleccionado", texto: `Impresión ${imp}: el entrevistador no tuvo suficiente para decir que sí. ${consejo}`, color: "#FF5E5E", icono: "fa-circle-xmark" };
}

/* ═══════════════════════════════════════════════════════════════════════
 * 2 · EL PANEL
 * ═══════════════════════════════════════════════════════════════════════ */

export type MovidaId = "interrumpir" | "backchannel" | "palabra" | "parafrasear" | "coincidir" | "discrepar";

export const MOVIDAS: Record<MovidaId, { en: string; etiqueta: string; icono: string }> = {
  interrumpir: { en: "No, no, that's wrong! Listen—", etiqueta: "Interrumpir", icono: "fa-hand" },
  backchannel: { en: "Mm-hmm. I see.", etiqueta: "Backchannel", icono: "fa-ear-listen" },
  palabra: { en: "May I add something?", etiqueta: "Pedir la palabra", icono: "fa-hand-point-up" },
  parafrasear: { en: "So what you are saying is that...", etiqueta: "Parafrasear", icono: "fa-arrows-rotate" },
  coincidir: { en: "That is a valid point, and I would add that...", etiqueta: "Coincidir y ampliar", icono: "fa-thumbs-up" },
  discrepar: { en: "I see your point; however, I would argue that...", etiqueta: "Discrepar con respeto", icono: "fa-scale-balanced" },
};

export const ORDEN_MOVIDAS: MovidaId[] = ["backchannel", "palabra", "parafrasear", "coincidir", "discrepar", "interrumpir"];

export type PanelistaId = "reyes" | "tom" | "aisha" | "tu";

export const PANELISTAS: Record<PanelistaId, { nombre: string; rol: string; foto: string; icono: string }> = {
  reyes: { nombre: "Ms. Reyes", rol: "moderadora", foto: "moderadora", icono: "fa-user-tie" },
  tom: { nombre: "Tom", rol: "panelista", foto: "tom", icono: "fa-user" },
  aisha: { nombre: "Aisha", rol: "panelista", foto: "aisha", icono: "fa-user" },
  tu: { nombre: "Tú", rol: "panelista", foto: "", icono: "fa-user-graduate" },
};

export const TEMA_PANEL = "Should our school ban single-use plastics?";
export const TEMA_PANEL_ES = "¿Debería nuestra escuela prohibir los plásticos de un solo uso?";

export interface EfectoMovida {
  conf: number;
  aud: number;
  porque: string;
}

export interface Momento {
  id: string;
  habla: Exclude<PanelistaId, "tu">;
  linea: string;
  es: string;
  /** ¿Está a media frase? */
  hablando: boolean;
  situacion: string;
  mejor: MovidaId;
  /** Lo que dices completo cuando eliges la mejor jugada. */
  tuLinea: string;
  /** Lo que pasa después con la mejor jugada / con una mala. */
  sigueBien: string;
  sigueMal: string;
  efectos: Record<MovidaId, EfectoMovida>;
}

export const INICIO_PANEL = { conf: 50, aud: 50 };
export const META_PANEL = 70;

export const MOMENTOS: Momento[] = [
  {
    id: "m1",
    habla: "tom",
    linea: "Our cafeteria throws away about four hundred plastic cups every single day, and most of them—",
    es: "Nuestra cafetería tira unos cuatrocientos vasos de plástico al día, y la mayoría—",
    hablando: true,
    situacion: "Tom está a media frase.",
    mejor: "backchannel",
    tuLinea: "Mm-hmm. I see.",
    sigueBien: "Tom: \"...end up in the trash. Thank you.\"",
    sigueMal: "Ms. Reyes: \"Please let Tom finish his point.\"",
    efectos: {
      backchannel: { conf: 12, aud: 6, porque: "«Mm-hmm. I see.» le dice a Tom que lo escuchas sin quitarle la palabra: eso es backchanneling (A2)." },
      interrumpir: { conf: -15, aud: -10, porque: "Cortaste a Tom a media frase. A2: interrumpir abruptamente se considera descortés." },
      palabra: { conf: -8, aud: -2, porque: "Pedir la palabra está bien, pero no a media frase: espera una pausa natural." },
      parafrasear: { conf: -6, aud: -2, porque: "Aún no termina: no puedes resumir una idea que todavía no dice completa." },
      coincidir: { conf: -6, aud: -2, porque: "Ni siquiera terminó su punto: coincidir ahora es interrumpir con buenos modales." },
      discrepar: { conf: -10, aud: -4, porque: "Discrepar a media frase sigue siendo interrumpir, aunque la frase sea cortés." },
    },
  },
  {
    id: "m2",
    habla: "reyes",
    linea: "Thank you, Tom. Would anyone like to respond?",
    es: "Gracias, Tom. ¿Alguien quiere responder?",
    hablando: false,
    situacion: "La moderadora abre el turno.",
    mejor: "palabra",
    tuLinea: "May I add something?",
    sigueBien: "Ms. Reyes: \"Of course, go ahead.\"",
    sigueMal: "Ms. Reyes: \"Aisha, would you like to go first?\"",
    efectos: {
      palabra: { conf: 12, aud: 6, porque: "La moderadora ofreció el turno: «May I add something?» es la forma cortés de tomarlo (A1)." },
      coincidir: { conf: 6, aud: 4, porque: "Aceptable: coincides y amplías. Lo ideal era pedir la palabra primero y dejar que la moderadora te la diera." },
      parafrasear: { conf: 4, aud: 2, porque: "Resumir a Tom no está mal, pero la moderadora pidió respuestas, no un resumen." },
      backchannel: { conf: -4, aud: -4, porque: "«Mm-hmm» es para cuando otro habla; aquí te ofrecen el turno y lo dejas pasar." },
      discrepar: { conf: -2, aud: -2, porque: "Tom dio un dato, no una opinión: ¿con qué estás en desacuerdo?" },
      interrumpir: { conf: -10, aud: -6, porque: "Nadie hablaba, pero «No, no, that's wrong!» suena agresivo para empezar." },
    },
  },
  {
    id: "m3",
    habla: "aisha",
    linea: "Honestly, I think banning plastic is impossible. People will never change their habits.",
    es: "Sinceramente, creo que prohibir el plástico es imposible. La gente nunca cambiará sus hábitos.",
    hablando: false,
    situacion: "Aisha terminó una idea con la que no estás de acuerdo.",
    mejor: "discrepar",
    tuLinea: "I see your point; however, I would argue that people change when the school gives them options, like water fountains.",
    sigueBien: "Aisha: \"Hmm, that's fair. Fountains could help.\"",
    sigueMal: "Aisha: \"Well... okay.\" (El público pierde el hilo.)",
    efectos: {
      discrepar: { conf: 12, aud: 8, porque: "Reconoces su punto y luego das el tuyo con una razón: así se discrepa con respeto (A1)." },
      parafrasear: { conf: 4, aud: 2, porque: "Parafrasear antes de responder es buena escucha, pero falta tu postura." },
      palabra: { conf: 2, aud: 0, porque: "Correcto pedir turno, pero ya era momento de responderle a Aisha." },
      backchannel: { conf: -2, aud: -4, porque: "Solo asentir deja pasar sin respuesta una idea con la que no estás de acuerdo." },
      coincidir: { conf: -6, aud: -4, porque: "Dices que tiene razón… y piensas lo contrario: el público no entiende tu postura." },
      interrumpir: { conf: -12, aud: -6, porque: "Aisha ya terminó, pero «that's wrong!» ataca a la persona en vez de argumentar." },
    },
  },
  {
    id: "m4",
    habla: "reyes",
    linea: "Before we go on, could someone summarize Aisha's position for the audience?",
    es: "Antes de seguir, ¿alguien puede resumir la postura de Aisha para el público?",
    hablando: false,
    situacion: "La moderadora pide un resumen.",
    mejor: "parafrasear",
    tuLinea: "So what you are saying is that a ban won't work unless people change their habits first.",
    sigueBien: "Aisha: \"Yes, exactly. Thank you.\"",
    sigueMal: "Ms. Reyes: \"I asked for a summary. Tom?\"",
    efectos: {
      parafrasear: { conf: 12, aud: 8, porque: "«So what you are saying is that...» muestra que entendiste, y Aisha puede corregirte si no fue así (A1)." },
      palabra: { conf: 2, aud: 0, porque: "Ya te ofrecen la palabra: ahora toca resumir." },
      coincidir: { conf: -2, aud: -2, porque: "Coincidir no es resumir: te pidieron la idea de Aisha, no tu opinión." },
      backchannel: { conf: -4, aud: -4, porque: "La moderadora pidió un resumen: «Mm-hmm» no lo es." },
      discrepar: { conf: -4, aud: -2, porque: "Te pidieron resumir su postura, no rebatirla todavía." },
      interrumpir: { conf: -12, aud: -6, porque: "Nadie te atacó: «that's wrong!» rompe el tono del panel." },
    },
  },
  {
    id: "m5",
    habla: "tom",
    linea: "So maybe we could start small: reusable cups in the cafeteria first.",
    es: "Entonces tal vez podríamos empezar poco a poco: primero vasos reutilizables en la cafetería.",
    hablando: false,
    situacion: "Tom propone algo con lo que coincides.",
    mejor: "coincidir",
    tuLinea: "That is a valid point, and I would add that students could design the cups in art class.",
    sigueBien: "Ms. Reyes: \"A great way to close. Thank you, panel!\"",
    sigueMal: "Ms. Reyes: \"Okay... let's wrap up there.\"",
    efectos: {
      coincidir: { conf: 12, aud: 6, porque: "«That is a valid point, and I would add that...» suma tu idea a la suya (A1)." },
      palabra: { conf: 4, aud: 0, porque: "Bien pedir turno; ahora di algo concreto." },
      parafrasear: { conf: 2, aud: 0, porque: "Resumir está bien, pero la idea de Tom ya era clara: aporta la tuya." },
      backchannel: { conf: 0, aud: -2, porque: "Asentir es cortés, pero perdiste la oportunidad de sumar tu idea." },
      discrepar: { conf: -4, aud: -4, porque: "Discrepar de una propuesta con la que coincides solo confunde al público." },
      interrumpir: { conf: -12, aud: -6, porque: "Tom ya terminó, y además coincides con él: no hay nada que cortar." },
    },
  },
];

export function aplicaMovida(m: { conf: number; aud: number }, mo: Momento, id: MovidaId) {
  const e = mo.efectos[id];
  const tono: Tono = id === mo.mejor ? "bien" : e.conf > 0 ? "regular" : "mal";
  return { despues: { conf: lim(m.conf + e.conf), aud: lim(m.aud + e.aud) }, efecto: e, tono };
}

/* ═══════════════════════════════════════════════════════════════════════
 * 3 · YOUR TURN — el alumno escribe
 * ═══════════════════════════════════════════════════════════════════════ */

export interface Consigna {
  id: string;
  espera: FraseId;
  quien: string;
  en: string;
  es: string;
  /** Lo que contesta quien preguntó cuando la respuesta funciona. */
  ok: string;
}

export const CONSIGNAS: Consigna[] = [
  { id: "w1", espera: "apertura", quien: "Ms. Reyes", en: "You have two minutes. Please open your presentation about your field of study.", es: "Tienes dos minutos. Abre tu presentación sobre tu campo de estudio.", ok: "Clear opening. Everyone knows the topic now." },
  { id: "w2", espera: "transicion", quien: "Ms. Reyes", en: "Good. Now go to your second point.", es: "Bien. Ahora pasa a tu segundo punto.", ok: "Nice transition — easy to follow." },
  { id: "w3", espera: "aclaracion", quien: "Someone in the audience", en: "What's your view on the ▒▒▒ part of it?", es: "(Alguien del público habla rápido y no se entiende una palabra.)", ok: "Sorry! I asked: what's your view on the cost part of it?" },
  { id: "w4", espera: "tiempo", quien: "Someone in the audience", en: "What's the biggest challenge in your field right now?", es: "¿Cuál es el mayor reto de tu campo ahora mismo?", ok: "Thanks for thinking it through." },
  { id: "w5", espera: "experiencia", quien: "Ms. Reyes", en: "Why do you personally care about this topic?", es: "¿Por qué te importa a ti, personalmente, este tema?", ok: "That personal story makes it convincing." },
  { id: "w6", espera: "cierre", quien: "Ms. Reyes", en: "We're almost out of time. Please finish your presentation.", es: "Casi se acaba el tiempo. Termina tu presentación.", ok: "Great wrap-up. Thank you!" },
];

export const DETECTORES: Record<FraseId, RegExp> = {
  apertura: /\btoday,? i(?: am|'m) going to (?:talk|present|speak)\b|\bmy presentation (?:today )?focuses on\b/,
  transicion: /\bmoving on to\b|\bnow let'?s look at\b|\bturning to\b/,
  aclaracion: /\bcould you (?:please )?repeat that\b|\bcould you clarify what you mean by\b|\bi beg your pardon\b|\bi didn'?t (?:quite )?catch that\b/,
  tiempo: /\bthat'?s a (?:great|good) question\b|\blet me think about that\b/,
  cierre: /\bin conclusion\b|\bto wrap up\b|\bto summari[sz]e\b/,
  experiencia: /\bfrom my experience\b|\bbased on what i(?: have|'ve) learned\b/,
};

const ERRORES: { id: string; re: RegExp; porque: string }[] = [
  { id: "moving-to", re: /\bmoving to\b/, porque: "Es «Moving ON to...»: sin «on» la transición queda incompleta." },
  { id: "conclusion-of", re: /\bin conclusion of\b/, porque: "«In conclusion,» va sola, seguida de coma: no lleva «of»." },
  { id: "repeat-again", re: /\brepeat (?:that )?again\b/, porque: "«Repeat» ya significa «decir otra vez»: «Could you repeat that, please?», sin «again»." },
  { id: "explain-me", re: /\bexplain me\b/, porque: "En inglés no se dice «explain me»: «Could you explain that to me?»" },
  { id: "experiencie", re: /\bexperiencie\b/, porque: "Se escribe «experience» (sin la i del español «experiencia»)." },
  { id: "i-going", re: /\btoday i going\b/, porque: "Falta el verbo: «Today I AM going to talk about...»." },
];

export type EfectoEscrito = "bien" | "corta" | "otra" | "error" | "sinFrase" | "vacio";

export interface AnalisisEscrito {
  efecto: EfectoEscrito;
  palabras: number;
  /** Frases del glosario detectadas (sólo cuentan si no hay errores). */
  frases: FraseId[];
  errores: { id: string; porque: string }[];
  /** Cambio en la atención del público (0–8 asientos). */
  atencion: number;
}

export const MIN_PALABRAS_DESARROLLO = 8;

export function normalizaEscrito(s: string): string {
  return s.toLowerCase().replace(/[‘’`´]/g, "'").replace(/\s+/g, " ").trim();
}

export function analizaEscrito(texto: string, espera: FraseId): AnalisisEscrito {
  const t = normalizaEscrito(texto);
  const palabras = t ? t.split(" ").filter((w) => /[a-z]/.test(w)).length : 0;
  if (palabras < 3) return { efecto: "vacio", palabras, frases: [], errores: [], atencion: 0 };
  const errores = ERRORES.filter((e) => e.re.test(t)).map(({ id, porque }) => ({ id, porque }));
  const halladas = (Object.keys(DETECTORES) as FraseId[]).filter((f) => DETECTORES[f].test(t));
  if (errores.length > 0) return { efecto: "error", palabras, frases: [], errores, atencion: -1 };
  if (halladas.includes(espera)) {
    const larga = espera === "aclaracion" || palabras >= MIN_PALABRAS_DESARROLLO;
    return { efecto: larga ? "bien" : "corta", palabras, frases: halladas, errores, atencion: larga ? 2 : 0 };
  }
  if (halladas.length > 0) return { efecto: "otra", palabras, frases: halladas, errores, atencion: -1 };
  return { efecto: "sinFrase", palabras, frases: [], errores, atencion: -1 };
}

export const ATENCION_MAX = 8;
export const ATENCION_INICIO = 4;

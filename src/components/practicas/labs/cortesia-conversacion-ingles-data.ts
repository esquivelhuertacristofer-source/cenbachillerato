/**
 * Datos y modelo del laboratorio "Polite conversations" (IN-IV-P06, Inglés IV:
 * «Participa en conversaciones sociales breves con expresiones de cortesía:
 * inicia, mantiene y cierra intercambios breves con respeto y empatía»).
 *
 * Anclas (verbatim):
 *   - A1 glosario «Social English: Small Talk Vocabulary» (10 términos): marco
 *     teórico de la ficha y panel lateral.
 *   - A2 quiz de opción múltiple y las dos preguntas cerradas del video A8:
 *     reto evaluable.
 *   - A4 verdadero/falso: panel «Hechos».
 *   - A5 glosario (abrir, mantener, cerrar); A6 texto con huecos.
 *   - A3 y A7 autoevaluaciones (criterios y reflexiones); A8 pregunta abierta.
 *   - A9 (relacionar columnas) repite términos del glosario A1: no se duplica.
 *
 * Todo lo demás (conversaciones, personajes, lugares, piezas de registro y
 * diálogos por arreglar) es ILUSTRATIVO y del laboratorio: personas y lugares
 * ficticios. Las oraciones en inglés siguen el inglés estadounidense estándar.
 *
 * Datos puros (sin three ni React).
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { TextoHuecosData } from "./_mecanica-huecos";

/* ── Modos ────────────────────────────────────────────────────────────── */

export type Modo = "conversar" | "registro" | "arreglar";
export const MODOS: Modo[] = ["conversar", "registro", "arreglar"];

export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string }> = {
  conversar: { etq: "Open, keep, close", subtitulo: "Abre, mantén y cierra una conversación", icono: "fa-comments", color: "#38bdf8" },
  registro: { etq: "Formal or informal?", subtitulo: "Ajusta tu frase a quien te escucha", icono: "fa-user-tie", color: "#f59e0b" },
  arreglar: { etq: "Fix the conversation", subtitulo: "Encuentra la línea descortés y reescríbela", icono: "fa-wand-magic-sparkles", color: "#a78bfa" },
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

/* ── Personajes, lugares y lenguaje corporal ─────────────────────────── */

export type Emocion = "neutral" | "feliz" | "incomoda" | "confundida" | "triste" | "despide";

export const EMOCION_DEF: Record<Emocion, { es: string; icono: string; col: string }> = {
  neutral: { es: "escucha", icono: "fa-face-meh", col: "#cbd5e1" },
  feliz: { es: "sonríe", icono: "fa-face-smile", col: "#34d399" },
  incomoda: { es: "se incomoda", icono: "fa-face-frown", col: "#fb923c" },
  confundida: { es: "se confunde", icono: "fa-circle-question", col: "#fbbf24" },
  triste: { es: "está triste", icono: "fa-face-sad-tear", col: "#93c5fd" },
  despide: { es: "se despide", icono: "fa-hand", col: "#a78bfa" },
};

export type Escenario = "cafeteria" | "fiesta" | "videollamada" | "clinica" | "salon";

export const ESCENARIO_DEF: Record<Escenario, { es: string; icono: string }> = {
  cafeteria: { es: "Cafetería de la escuela", icono: "fa-utensils" },
  fiesta: { es: "Fiesta de cumpleaños de tu vecina", icono: "fa-cake-candles" },
  videollamada: { es: "Videollamada de intercambio", icono: "fa-video" },
  clinica: { es: "Recepción de la clínica", icono: "fa-house-medical" },
  salon: { es: "Salón de inglés", icono: "fa-chalkboard-user" },
};

/** Rasgos visuales de un personaje (ficticio). */
export interface Aspecto {
  piel: string;
  pelo: string;
  peinado: "corto" | "largo" | "coleta" | "chongo";
  camisa: string;
  pantalon: string;
  lentes?: boolean;
  escala?: number;
  /** Detalle de uniforme: mandil (cocina) o chaleco (recepción). */
  uniforme?: "mandil" | "chaleco" | "saco";
}

export type PersonajeId = "tu" | "carlos" | "sofia" | "emily" | "lupita" | "recepcionista" | "ramirez";

export const PERSONAJES: Record<PersonajeId, { nombre: string; rol: string; aspecto: Aspecto }> = {
  tu: { nombre: "Alex (tú)", rol: "estudiante", aspecto: { piel: "#c98b5e", pelo: "#1c130d", peinado: "corto", camisa: "#2563eb", pantalon: "#1f2937" } },
  carlos: { nombre: "Carlos", rol: "tu compañero y amigo", aspecto: { piel: "#b97a4f", pelo: "#140e0a", peinado: "corto", camisa: "#16a34a", pantalon: "#334155" } },
  sofia: { nombre: "Sofía", rol: "la sobrina de tu vecina", aspecto: { piel: "#d9a47a", pelo: "#3b2414", peinado: "coleta", camisa: "#db2777", pantalon: "#1e3a8a" } },
  emily: { nombre: "Emily", rol: "estudiante de intercambio", aspecto: { piel: "#f1c7a8", pelo: "#b7792f", peinado: "largo", camisa: "#7c3aed", pantalon: "#1f2937", lentes: true } },
  lupita: { nombre: "Lupita", rol: "la cocinera de la cafetería", aspecto: { piel: "#a86b45", pelo: "#2b1b12", peinado: "chongo", camisa: "#f59e0b", pantalon: "#374151", uniforme: "mandil", escala: 0.95 } },
  recepcionista: { nombre: "La recepcionista", rol: "la recepcionista de la clínica", aspecto: { piel: "#c48a63", pelo: "#20150e", peinado: "chongo", camisa: "#e2e8f0", pantalon: "#0f172a", uniforme: "chaleco", lentes: true } },
  ramirez: { nombre: "Ms. Ramírez", rol: "tu maestra de inglés", aspecto: { piel: "#c7926b", pelo: "#4a2f1d", peinado: "largo", camisa: "#0e7490", pantalon: "#1f2937", uniforme: "saco" } },
};

/* ════════════════════════════════════════════════════════════════════════
 * 1. OPEN, KEEP, CLOSE — conversaciones ramificadas
 * ════════════════════════════════════════════════════════════════════════ */

export type Etapa = "open" | "keep" | "close";

export const ETAPA_DEF: Record<Etapa, { en: string; es: string; col: string; ayuda: string }> = {
  open: { en: "Open", es: "Abrir", col: "#38bdf8", ayuda: "Saludo + una pregunta o presentación (Hi! How have you been? / Nice to meet you)." },
  keep: { en: "Keep", es: "Mantener", col: "#f59e0b", ayuda: "Backchannels (Really? That's great!), preguntas de vuelta (What about you?), By the way… y empatía." },
  close: { en: "Close", es: "Cerrar", col: "#a78bfa", ayuda: "Transición (Anyway, I should get going) + despedida cordial (It was nice talking to you. See you around!)." },
};

export type Calidad = "ideal" | "seca" | "fuera" | "brusca" | "corta";

/** Cómo pesa cada tipo de respuesta en los medidores (0–100). */
export const CALIDAD_DEF: Record<Calidad, { es: string; cort: number; flu: number; col: string }> = {
  ideal: { es: "Cortés y fluida", cort: 100, flu: 100, col: "#34d399" },
  seca: { es: "Correcta pero seca", cort: 75, flu: 35, col: "#fbbf24" },
  fuera: { es: "Fuera de lugar", cort: 70, flu: 25, col: "#fbbf24" },
  brusca: { es: "Descortés", cort: 0, flu: 45, col: "#fb923c" },
  corta: { es: "Corta la conversación", cort: 30, flu: 0, col: "#fb923c" },
};

export type Marca = "backchannel" | "bytheway" | "empatia" | "cierre";

export interface Opcion {
  texto: string;
  calidad: Calidad;
  /** Explicación en español de por qué funciona o no. */
  porque: string;
  /** Lo que contesta el interlocutor ante una respuesta no ideal (inglés). */
  reaccion?: string;
  emo: Emocion;
  marca?: Marca;
  /** Es una acción (no se dice nada): se muestra en cursiva. */
  accion?: boolean;
}

export interface Turno {
  etapa: Etapa;
  /** Lo que dice el interlocutor antes de que elijas (null: abres tú). */
  npc: string | null;
  npcEmo: Emocion;
  contexto: string;
  opciones: Opcion[];
}

export interface Conversacion {
  id: string;
  escenario: Escenario;
  npc: PersonajeId;
  titulo: string;
  situacion: string;
  turnos: Turno[];
}

export const CONVERSACIONES: Conversacion[] = [
  {
    id: "carlos",
    escenario: "cafeteria",
    npc: "carlos",
    titulo: "Carlos en la cafetería",
    situacion: "Carlos es tu compañero. No se ven desde hace dos semanas y se encuentran en la fila de la cafetería.",
    turnos: [
      {
        etapa: "open",
        npc: null,
        npcEmo: "neutral",
        contexto: "Ves a Carlos en la fila de la cafetería. No se ven desde hace dos semanas. Abre tú la conversación.",
        opciones: [
          { texto: "Hi, Carlos! How have you been?", calidad: "ideal", emo: "feliz", porque: "Saludo + How have you been?: la pregunta natural para alguien que no ves desde hace tiempo (A4, A5)." },
          { texto: "Nice to meet you, Carlos!", calidad: "fuera", emo: "confundida", reaccion: "Uh… we already know each other! But hi!", porque: "Nice to meet you se dice solo la primera vez que conoces a alguien (A1). Carlos ya es tu compañero: usa How have you been?" },
          { texto: "Move. I'm next.", calidad: "brusca", emo: "incomoda", reaccion: "Wow. Hi to you too…", porque: "Es una orden, sin saludo: suena agresivo. Para abrir, saluda primero y pregunta: Hi, Carlos! How have you been?" },
          { texto: "See you around!", calidad: "corta", emo: "confundida", reaccion: "Oh… okay. Bye?", porque: "See you around es una despedida (A1): cierras la conversación antes de empezarla." },
        ],
      },
      {
        etapa: "keep",
        npc: "Pretty good, thanks! I just finished my biology project.",
        npcEmo: "feliz",
        contexto: "Carlos te cuenta una buena noticia. Muestra que te interesa.",
        opciones: [
          { texto: "Really? That's great!", calidad: "ideal", emo: "feliz", marca: "backchannel", porque: "Really? That's great! es un backchannel (A4, A5): muestra que escuchas y anima a Carlos a seguir contando." },
          { texto: "Okay.", calidad: "seca", emo: "neutral", reaccion: "Yeah… so…", porque: "No es grosero, pero es seco: no muestra interés y la conversación se apaga. Un backchannel (Really? That's great!) la mantiene viva." },
          { texto: "I don't care about biology.", calidad: "brusca", emo: "incomoda", reaccion: "Oh… okay. Sorry.", porque: "Descalificas lo que te contó. Aunque el tema no te interese, reacciona con respeto: That's great!" },
        ],
      },
      {
        etapa: "keep",
        npc: "Thanks! It was a lot of work. What have you been up to?",
        npcEmo: "feliz",
        contexto: "Carlos te devuelve el turno con una pregunta (A1: What have you been up to?). Contesta y agrega un tema.",
        opciones: [
          { texto: "Not much, just studying for finals. By the way, did you see the announcement about the school trip?", calidad: "ideal", emo: "feliz", marca: "bytheway", porque: "Contestas su pregunta y usas By the way para abrir un tema nuevo (A1, A5): la conversación sigue sin esfuerzo." },
          { texto: "Not much.", calidad: "seca", emo: "neutral", reaccion: "Oh. Cool…", porque: "Contestas, pero no das nada con qué seguir. Agrega un detalle o un tema nuevo: By the way, did you see…?" },
          { texto: "By the way, nobody asked you.", calidad: "brusca", emo: "incomoda", reaccion: "Excuse me?", porque: "By the way sirve para cambiar de tema, pero esta frase es un insulto (A2). Contesta su pregunta con respeto." },
        ],
      },
      {
        etapa: "keep",
        npc: "Yes! I'm so excited. Are you going?",
        npcEmo: "feliz",
        contexto: "Responde a su pregunta y muestra entusiasmo.",
        opciones: [
          { texto: "Yes! I can't wait. Let's sit together on the bus!", calidad: "ideal", emo: "feliz", porque: "Respondes con entusiasmo y propones algo: comparten el tema y la conversación fluye." },
          { texto: "Maybe.", calidad: "seca", emo: "neutral", reaccion: "Oh… okay.", porque: "Una sola palabra no da pie a seguir. Agrega algo: Yes! I can't wait." },
          { texto: "Why do you care?", calidad: "brusca", emo: "incomoda", reaccion: "I was just asking…", porque: "Suena defensivo y agresivo; su pregunta era amistosa." },
        ],
      },
      {
        etapa: "close",
        npc: "Great idea! Oh no, the bell! My next class is on the second floor.",
        npcEmo: "neutral",
        contexto: "Sonó el timbre y Carlos tiene clase: es la señal para cerrar la conversación.",
        opciones: [
          { texto: "Anyway, I should get going. It was nice talking to you!", calidad: "ideal", emo: "feliz", marca: "cierre", porque: "Anyway, I should get going es la transición para cerrar (A5) y It was nice talking to you, la frase cordial (A6)." },
          { texto: "By the way, what did you eat for dinner?", calidad: "fuera", emo: "incomoda", reaccion: "Um… I really have to go!", porque: "Abres un tema nuevo justo cuando Carlos necesita irse (A2). Escuchar también es notar cuándo cerrar." },
          { texto: "I need to leave immediately.", calidad: "brusca", emo: "neutral", reaccion: "Oh… okay.", porque: "Cierras, pero suena brusco (A2). Usa una transición amable: Anyway, I should get going." },
        ],
      },
      {
        etapa: "close",
        npc: "You too! See you around!",
        npcEmo: "despide",
        contexto: "Carlos se despide. Responde a su despedida.",
        opciones: [
          { texto: "See you! Take care!", calidad: "ideal", emo: "despide", porque: "Contestas la despedida en el mismo tono informal y amable (A3: Take care!)." },
          { texto: "Farewell.", calidad: "fuera", emo: "confundida", reaccion: "Ha! Farewell? Okay… bye!", porque: "Farewell es demasiado formal (A2); entre amigos suena extraño. Mejor: See you! Take care!" },
          { texto: "(Te vas sin decir nada.)", accion: true, calidad: "brusca", emo: "incomoda", reaccion: "…Bye?", porque: "No responder a una despedida es descortés: siempre contesta (See you! / Bye! / Take care!)." },
        ],
      },
    ],
  },
  {
    id: "sofia",
    escenario: "fiesta",
    npc: "sofia",
    titulo: "Sofía en la fiesta",
    situacion: "Es el cumpleaños de tu vecina, la señora Torres. En el patio conoces a Sofía, su sobrina, que vino de Puebla.",
    turnos: [
      {
        etapa: "open",
        npc: "Hi! I'm Sofía. I'm Mrs. Torres's niece.",
        npcEmo: "feliz",
        contexto: "En la fiesta se te acerca una chica que no conoces y se presenta.",
        opciones: [
          { texto: "Hi, Sofía! I'm Alex. Nice to meet you!", calidad: "ideal", emo: "feliz", porque: "Al conocer a alguien: saludo, tu nombre y Nice to meet you (A1, A2)." },
          { texto: "How have you been?", calidad: "fuera", emo: "confundida", reaccion: "Um… have we met before?", porque: "How have you been? es para alguien que no ves desde hace tiempo (A5); a Sofía la acabas de conocer." },
          { texto: "So what?", calidad: "brusca", emo: "incomoda", reaccion: "Oh… sorry.", porque: "Suena despectivo. Cuando alguien se presenta, preséntate tú también: Hi! I'm Alex. Nice to meet you!" },
        ],
      },
      {
        etapa: "keep",
        npc: "Nice to meet you too! How do you know my aunt?",
        npcEmo: "feliz",
        contexto: "Sofía te pregunta algo para conocerte. Contesta y devuélvele el turno.",
        opciones: [
          { texto: "I live next door. She's a great neighbor! What about you? Do you live near here?", calidad: "ideal", emo: "feliz", porque: "Contestas y devuelves el turno con What about you? (turn-taking, A1): los dos participan." },
          { texto: "I live next door.", calidad: "seca", emo: "neutral", reaccion: "Oh, cool.", porque: "Contestas bien, pero no preguntas nada y la conversación depende solo de ella. Devuelve el turno: What about you?" },
          { texto: "That's none of your business.", calidad: "brusca", emo: "incomoda", reaccion: "Sorry, I was just asking…", porque: "Su pregunta era amable; esta respuesta la rechaza de forma grosera." },
        ],
      },
      {
        etapa: "keep",
        npc: "No, I live in Puebla. I came by bus, but I lost my phone at the bus station.",
        npcEmo: "triste",
        contexto: "Sofía te cuenta algo malo que le pasó. Responde con empatía.",
        opciones: [
          { texto: "Oh no, I'm sorry to hear that. Can I help you call someone?", calidad: "ideal", emo: "feliz", marca: "empatia", porque: "I'm sorry to hear that reconoce lo que siente, y ofrecer ayuda muestra empatía real." },
          { texto: "Really? That's great!", calidad: "fuera", emo: "incomoda", reaccion: "Great? I lost my phone…", porque: "Really? That's great! es para buenas noticias (A5); ante una mala noticia suena a burla." },
          { texto: "Anyway, is the cake chocolate?", calidad: "brusca", emo: "triste", reaccion: "Um… I don't know.", porque: "Ignoras lo que te contó y cambias de tema. Primero, empatía: Oh no, I'm sorry to hear that." },
        ],
      },
      {
        etapa: "keep",
        npc: "That's so kind! My aunt already called my mom, so it's okay now.",
        npcEmo: "feliz",
        contexto: "Todo se resolvió. Reacciona y mantén la conversación con un tema nuevo.",
        opciones: [
          { texto: "I'm glad to hear that! By the way, have you tried the tamales? They're delicious.", calidad: "ideal", emo: "feliz", marca: "bytheway", porque: "I'm glad to hear that reacciona a la buena noticia y By the way abre un tema nuevo con naturalidad (A1)." },
          { texto: "Good.", calidad: "seca", emo: "neutral", reaccion: "Yeah…", porque: "Correcto pero seco. Reacciona con más interés (I'm glad to hear that!) y propón un tema: By the way…" },
          { texto: "Okay. Bye.", calidad: "corta", emo: "confundida", reaccion: "Oh… bye?", porque: "Cortas la conversación de golpe, sin transición ni frase cordial." },
        ],
      },
      {
        etapa: "close",
        npc: "Not yet! Oh, look! They're bringing out the piñata!",
        npcEmo: "feliz",
        contexto: "Llega la piñata: buen momento para cerrar la charla con amabilidad.",
        opciones: [
          { texto: "Let's go! Anyway, I should say hi to Mrs. Torres. It was really nice meeting you!", calidad: "ideal", emo: "feliz", marca: "cierre", porque: "Anyway abre el cierre (A1) y It was nice meeting you es la despedida para alguien que acabas de conocer (con alguien que ya conocías: It was nice talking to you)." },
          { texto: "I need to leave immediately.", calidad: "brusca", emo: "neutral", reaccion: "Oh… okay.", porque: "Suena brusco (A2), como si quisieras huir. Usa una transición amable: Anyway, I should…" },
          { texto: "See you around, also…", calidad: "fuera", emo: "confundida", reaccion: "Also… what?", porque: "No es una frase natural (A2): See you around cierra y also deja la idea colgando." },
        ],
      },
      {
        etapa: "close",
        npc: "You too, Alex! Enjoy the party!",
        npcEmo: "despide",
        contexto: "Sofía se despide. Responde.",
        opciones: [
          { texto: "Thanks, you too! See you around!", calidad: "ideal", emo: "despide", porque: "Agradeces, le deseas lo mismo (you too) y te despides informal y amable (A1)." },
          { texto: "Goodbye forever.", calidad: "fuera", emo: "confundida", reaccion: "Forever? Ha… okay.", porque: "Suena dramático, como si no quisieras volver a verla. Mejor: Thanks, you too!" },
          { texto: "(Le das la espalda sin contestar.)", accion: true, calidad: "brusca", emo: "incomoda", reaccion: "…Okay then.", porque: "Ignorar una despedida es descortés. Contesta siempre: Thanks, you too!" },
        ],
      },
    ],
  },
  {
    id: "emily",
    escenario: "videollamada",
    npc: "emily",
    titulo: "Emily por videollamada",
    situacion: "Tu escuela te asignó a Emily, estudiante de intercambio de Ohio que llega a México el próximo mes. Hoy es su primera videollamada.",
    turnos: [
      {
        etapa: "open",
        npc: "Hello? Can you hear me?",
        npcEmo: "neutral",
        contexto: "Se conecta la llamada y Emily pregunta si la escuchas. Abre la conversación.",
        opciones: [
          { texto: "Yes, I can hear you! Hi, Emily. Nice to meet you!", calidad: "ideal", emo: "feliz", porque: "Contestas su pregunta, saludas y, como es la primera vez que hablan, dices Nice to meet you (A1)." },
          { texto: "What?", calidad: "brusca", emo: "confundida", reaccion: "Um… hello? Is this Alex?", porque: "What? a secas suena brusco. Contesta y saluda: Yes, I can hear you! Hi, Emily." },
          { texto: "See you around!", calidad: "corta", emo: "confundida", reaccion: "Wait… are you leaving?", porque: "See you around es una despedida (A1): la llamada apenas empieza." },
        ],
      },
      {
        etapa: "keep",
        npc: "Nice to meet you too! Sorry, I'm a bit tired today.",
        npcEmo: "neutral",
        contexto: "Emily comenta que está cansada (A2). Responde con empatía y una pregunta de seguimiento.",
        opciones: [
          { texto: "Oh, that happens to me too sometimes. Did you sleep well?", calidad: "ideal", emo: "feliz", marca: "empatia", porque: "Es empático: valida el sentimiento de Emily y hace una pregunta de seguimiento (A2)." },
          { texto: "Anyway, let's start the activity.", calidad: "fuera", emo: "neutral", reaccion: "Oh… okay.", porque: "Ignora su comentario (A2): pasas directo a la tarea sin reconocer cómo se siente." },
          { texto: "Nice to meet you — are you always tired?", calidad: "brusca", emo: "incomoda", reaccion: "Um… no?", porque: "Suena a crítica, no a interés (A2). Valida primero: That happens to me too sometimes." },
        ],
      },
      {
        etapa: "keep",
        npc: "Not really. We're moving to a new house, and I had to say goodbye to my best friend.",
        npcEmo: "triste",
        contexto: "Emily te cuenta algo triste. Responde con empatía.",
        opciones: [
          { texto: "I'm sorry to hear that. That must be hard.", calidad: "ideal", emo: "feliz", marca: "empatia", porque: "I'm sorry to hear that + That must be hard: reconoces lo que siente sin cambiar de tema." },
          { texto: "Really? That's amazing!", calidad: "fuera", emo: "incomoda", reaccion: "Amazing? Not really…", porque: "Really? That's amazing! es un backchannel para buenas noticias (A5); aquí suena insensible." },
          { texto: "By the way, what's the weather like in Ohio?", calidad: "fuera", emo: "triste", reaccion: "Um… it's cold, I guess.", porque: "By the way cambia de tema, pero aquí ignora lo que te contó. Primero: I'm sorry to hear that." },
        ],
      },
      {
        etapa: "keep",
        npc: "Thanks. But I'm really excited about Mexico! What's your school like?",
        npcEmo: "feliz",
        contexto: "Emily pasa a un tema alegre y te pregunta. Contesta y devuélvele el turno.",
        opciones: [
          { texto: "It's big, and the people are really friendly. What are you most excited about?", calidad: "ideal", emo: "feliz", porque: "Das una respuesta con detalle y devuelves el turno con una pregunta (turn-taking, A1)." },
          { texto: "It's a school.", calidad: "seca", emo: "neutral", reaccion: "Ha… okay.", porque: "Técnicamente contestas, pero no das nada con qué seguir. Agrega un detalle y pregunta algo." },
          { texto: "Why are you asking so many questions?", calidad: "brusca", emo: "incomoda", reaccion: "Sorry! I'm just curious.", porque: "Hacer preguntas es parte del small talk (A1); reclamarlo suena hostil." },
        ],
      },
      {
        etapa: "close",
        npc: "The food! Oh, it's getting late here. My mom is calling me for dinner.",
        npcEmo: "neutral",
        contexto: "Emily da la señal de que tiene que irse. Cierra la llamada con cortesía.",
        opciones: [
          { texto: "No problem! Anyway, I should let you go. It was great talking to you!", calidad: "ideal", emo: "feliz", marca: "cierre", porque: "Aceptas la señal, cierras con Anyway (A1) y te despides con It was great talking to you (A4, A5)." },
          { texto: "Wait! Let's talk for two more hours.", calidad: "fuera", emo: "incomoda", reaccion: "Um… I really can't.", porque: "Ignoras la señal de que debe irse. Escuchar incluye notar cuándo cerrar." },
          { texto: "Bye.", calidad: "brusca", emo: "neutral", reaccion: "Oh… bye.", porque: "Bye a secas corta la llamada en seco. Antes usa una transición (Anyway…) y una frase cordial." },
        ],
      },
      {
        etapa: "close",
        npc: "You too! Take care, and see you next month!",
        npcEmo: "despide",
        contexto: "Emily se despide. Responde antes de colgar.",
        opciones: [
          { texto: "Take care, Emily! See you soon!", calidad: "ideal", emo: "despide", porque: "Contestas en el mismo tono cálido: Take care y See you soon." },
          { texto: "I must go now. Goodbye.", calidad: "fuera", emo: "neutral", reaccion: "Oh… okay. Goodbye.", porque: "Es correcto pero rígido y frío (A2) cuando ella acaba de despedirse con cariño. Contesta en su mismo tono." },
          { texto: "(Cuelgas sin decir nada.)", accion: true, calidad: "brusca", emo: "confundida", reaccion: "Alex? Hello?", porque: "Colgar sin despedirte es descortés, sobre todo en una primera llamada." },
        ],
      },
    ],
  },
];

/** Medidores: promedio de las respuestas elegidas (50 antes de empezar). */
export function medidores(calidades: Calidad[]): { cort: number; flu: number } {
  if (calidades.length === 0) return { cort: 50, flu: 50 };
  const cort = calidades.reduce((a, c) => a + CALIDAD_DEF[c].cort, 0) / calidades.length;
  const flu = calidades.reduce((a, c) => a + CALIDAD_DEF[c].flu, 0) / calidades.length;
  return { cort: Math.round(cort), flu: Math.round(flu) };
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. FORMAL OR INFORMAL? — el registro según quién escucha
 * ════════════════════════════════════════════════════════════════════════ */

export type InterId = "amigo" | "maestra" | "recepcion";
export type Banda = "informal" | "neutral" | "formal";

export const BANDA_DEF: Record<Banda, { es: string; col: string }> = {
  informal: { es: "informal", col: "#34d399" },
  neutral: { es: "neutral", col: "#38bdf8" },
  formal: { es: "formal", col: "#a78bfa" },
};

export interface Interlocutor {
  id: InterId;
  personaje: PersonajeId;
  escenario: Escenario;
  /** Qué registro espera: con un amigo, informal o neutral; con la maestra o en la recepción, formal. */
  espera: "informal" | "formal";
  /** Cómo se le nombra en un saludo o despedida (null: no se sabe su nombre). */
  nombre: string | null;
  /** Lo que se le pide (forma base y forma -ing para would you mind). */
  pedido: { base: string; ing: string };
  situacion: Record<PropId, string>;
}

export type PropId = "saludar" | "pedir" | "agradecer" | "despedirse";

export const INTERLOCUTORES: Interlocutor[] = [
  {
    id: "amigo",
    personaje: "carlos",
    escenario: "cafeteria",
    espera: "informal",
    nombre: "Carlos",
    pedido: { base: "lend me your notes", ing: "lending me your notes" },
    situacion: {
      saludar: "Llegas a la mesa de tu amigo Carlos en la cafetería.",
      pedir: "Faltaste ayer a clase: pídele a Carlos que te preste sus apuntes.",
      agradecer: "Carlos te prestó sus apuntes. Dale las gracias.",
      despedirse: "Terminó el recreo y te vas a tu clase.",
    },
  },
  {
    id: "maestra",
    personaje: "ramirez",
    escenario: "salon",
    espera: "formal",
    nombre: "Ms. Ramírez",
    pedido: { base: "repeat the instructions", ing: "repeating the instructions" },
    situacion: {
      saludar: "Entras al salón y saludas a tu maestra de inglés, Ms. Ramírez.",
      pedir: "No entendiste la actividad: pídele a tu maestra que repita las instrucciones.",
      agradecer: "Ms. Ramírez te explicó otra vez la actividad. Agradécele.",
      despedirse: "Termina la clase y sales del salón.",
    },
  },
  {
    id: "recepcion",
    personaje: "recepcionista",
    escenario: "clinica",
    espera: "formal",
    nombre: null,
    pedido: { base: "help me with this form", ing: "helping me with this form" },
    situacion: {
      saludar: "Llegas a la recepción de la clínica. No conoces a la recepcionista.",
      pedir: "Tienes que llenar un formulario y no entiendes una parte: pide ayuda.",
      agradecer: "La recepcionista te ayudó con el formulario. Agradécele.",
      despedirse: "Terminó tu consulta y sales de la clínica.",
    },
  },
];

export const inter = (id: InterId) => INTERLOCUTORES.find((i) => i.id === id)!;

export interface Pieza {
  id: string;
  /** Texto con marcadores: {n} nombre, {base}/{ing} lo que se pide. */
  txt: string;
  /** 0 informal · 1 neutral · 2 formal. */
  nivel: 0 | 1 | 2;
  nota: string;
  imperativo?: boolean;
  cortante?: boolean;
  suaviza?: boolean;
}

export interface Proposito {
  id: PropId;
  es: string;
  etapa: Etapa;
  icono: string;
  ranuras: { etq: string; piezas: Pieza[] }[];
}

export const PROPOSITOS: Proposito[] = [
  {
    id: "saludar",
    es: "Saludar",
    etapa: "open",
    icono: "fa-hand",
    ranuras: [
      {
        etq: "Saludo",
        piezas: [
          { id: "hey", txt: "Hey{n}!", nivel: 0, nota: "Hey es muy informal: solo entre amigos." },
          { id: "hi", txt: "Hi{n}!", nivel: 1, nota: "Hi es neutral: sirve con casi cualquier persona." },
          { id: "morning", txt: "Good morning{n}.", nivel: 2, nota: "Good morning es formal y respetuoso." },
        ],
      },
      {
        etq: "Pregunta",
        piezas: [
          { id: "up", txt: "What's up?", nivel: 0, nota: "What's up? es coloquial, de amigos." },
          { id: "going", txt: "How's it going?", nivel: 1, nota: "How's it going? es amable y relajado." },
          { id: "today", txt: "How are you today?", nivel: 2, nota: "How are you today? es cortés y formal (A1: How are you?)." },
        ],
      },
    ],
  },
  {
    id: "pedir",
    es: "Pedir algo",
    etapa: "keep",
    icono: "fa-hand-holding-heart",
    ranuras: [
      {
        etq: "Para empezar",
        piezas: [
          { id: "hey", txt: "Hey", nivel: 0, nota: "Hey es muy informal: solo entre amigos." },
          { id: "nada", txt: "", nivel: 1, nota: "Sin saludo previo: neutral." },
          { id: "excuse", txt: "Excuse me", nivel: 2, nota: "Excuse me abre con cortesía (A5: Excuse me, could I…?)." },
        ],
      },
      {
        etq: "La petición",
        piezas: [
          { id: "imp", txt: "{base}", nivel: 0, imperativo: true, nota: "El imperativo solo es una orden, no una petición." },
          { id: "can", txt: "can you {base}", nivel: 1, nota: "Can you…? es una petición normal, informal-neutral." },
          { id: "could", txt: "could you {base}", nivel: 2, nota: "Could you…? es más cortés y formal (A8: Could you please help me?)." },
          { id: "mind", txt: "would you mind {ing}", nivel: 2, nota: "Would you mind + verbo con -ing es muy cortés." },
        ],
      },
      {
        etq: "Para terminar",
        piezas: [
          { id: "nada", txt: "", nivel: 1, nota: "Sin cierre: neutral." },
          { id: "please", txt: "please", nivel: 2, suaviza: true, nota: "Please suaviza cualquier petición (A1: polite expressions)." },
          { id: "thanks", txt: "Thanks!", nivel: 1, suaviza: true, nota: "Thanks! agradece por adelantado, en tono relajado." },
        ],
      },
    ],
  },
  {
    id: "agradecer",
    es: "Agradecer",
    etapa: "keep",
    icono: "fa-heart",
    ranuras: [
      {
        etq: "Gracias",
        piezas: [
          { id: "thanks", txt: "Thanks", nivel: 0, nota: "Thanks es informal." },
          { id: "thankyou", txt: "Thank you", nivel: 1, nota: "Thank you es neutral: sirve con cualquiera." },
          { id: "very", txt: "Thank you very much", nivel: 2, nota: "Thank you very much es formal y enfático." },
        ],
      },
      {
        etq: "Complemento",
        piezas: [
          { id: "owe", txt: "I owe you one!", nivel: 0, nota: "I owe you one! (te debo una) es coloquial." },
          { id: "help", txt: "for your help.", nivel: 2, nota: "for your help dice qué agradeces: completo y cortés." },
          { id: "appreciate", txt: "I really appreciate your help.", nivel: 2, nota: "I really appreciate your help es formal y cálido." },
          { id: "forever", txt: "That took forever.", nivel: 0, cortante: true, nota: "That took forever (eso tardó una eternidad) es un reproche: arruina el agradecimiento." },
        ],
      },
    ],
  },
  {
    id: "despedirse",
    es: "Despedirse",
    etapa: "close",
    icono: "fa-door-open",
    ranuras: [
      {
        etq: "Transición",
        piezas: [
          { id: "gotta", txt: "Gotta go.", nivel: 0, nota: "Gotta go (got to go) es coloquial, de amigos." },
          { id: "anyway", txt: "Anyway, I should get going.", nivel: 1, nota: "Anyway, I should get going es la transición amable para cerrar (A5)." },
          { id: "afraid", txt: "I'm afraid I have to go now.", nivel: 2, nota: "I'm afraid I have to go now es formal y cortés." },
        ],
      },
      {
        etq: "Despedida",
        piezas: [
          { id: "around", txt: "See you around{n}!", nivel: 0, nota: "See you around es informal (A1)." },
          { id: "take", txt: "Take care{n}!", nivel: 1, nota: "Take care es cálido y neutral (A5)." },
          { id: "nice", txt: "Have a nice day{n}.", nivel: 2, nota: "Have a nice day es formal y amable." },
        ],
      },
    ],
  },
];

export const proposito = (id: PropId) => PROPOSITOS.find((p) => p.id === id)!;

function capital(s: string): string {
  return s.length > 0 ? s[0]!.toUpperCase() + s.slice(1) : s;
}

function pieza(p: Proposito, ranura: number, id: string | null | undefined): Pieza | null {
  if (!id) return null;
  return p.ranuras[ranura]?.piezas.find((x) => x.id === id) ?? null;
}

/** Arma la frase en inglés con las piezas elegidas (null si falta alguna). */
export function componer(propId: PropId, sel: (string | null)[], interId: InterId): string | null {
  const p = proposito(propId);
  const it = inter(interId);
  const ps = p.ranuras.map((_, i) => pieza(p, i, sel[i]));
  if (ps.some((x) => !x)) return null;
  const n = it.nombre ? `, ${it.nombre}` : "";
  const t = (x: Pieza) => x.txt.replace("{n}", n).replace("{base}", it.pedido.base).replace("{ing}", it.pedido.ing);
  const [a, b, c] = ps as Pieza[];
  if (propId === "saludar" || propId === "despedirse") return `${t(a!)} ${t(b!)}`;
  if (propId === "agradecer") {
    if (b!.id === "help") return `${t(a!)} ${t(b!)}`;
    return `${t(a!)}${a!.id === "thanks" ? "!" : "."} ${t(b!)}`;
  }
  // pedir
  const nucleo = t(b!);
  const fin = b!.imperativo ? "." : "?";
  let frase = a!.txt ? `${t(a!)}, ${nucleo}` : capital(nucleo);
  if (c!.id === "please") frase = `${frase}, please${fin}`;
  else if (c!.id === "thanks") frase = `${frase}${fin} Thanks!`;
  else frase = `${frase}${fin}`;
  return frase;
}

/** Promedio de formalidad (0–2) de lo elegido hasta ahora; null si no hay nada. */
export function nivelParcial(propId: PropId, sel: (string | null)[]): number | null {
  const p = proposito(propId);
  const ps = p.ranuras.map((_, i) => pieza(p, i, sel[i])).filter((x): x is Pieza => !!x);
  if (ps.length === 0) return null;
  return ps.reduce((acc, x) => acc + x.nivel, 0) / ps.length;
}

export const bandaDe = (prom: number): Banda => (prom < 0.75 ? "informal" : prom < 1.33 ? "neutral" : "formal");

export interface VeredictoRegistro {
  ok: boolean;
  casi: boolean;
  frase: string;
  prom: number;
  banda: Banda;
  titulo: string;
  msg: string;
  respuesta: string;
  emo: Emocion;
}

const RESPUESTA_OK: Record<PropId, Record<InterId, string>> = {
  saludar: { amigo: "Pretty good, thanks! And you?", maestra: "Hello! I'm very well, thank you. And you?", recepcion: "Hello! I'm fine, thank you. How can I help you?" },
  pedir: { amigo: "Sure! Here you go.", maestra: "Of course. Listen carefully.", recepcion: "Of course. Let me help you." },
  agradecer: { amigo: "No problem!", maestra: "You're welcome. Good luck!", recepcion: "You're welcome. It's my pleasure." },
  despedirse: { amigo: "See you later!", maestra: "Goodbye! See you tomorrow.", recepcion: "Take care. Have a nice day." },
};

const RESPUESTA_BRUSCA: Record<InterId, string> = {
  amigo: "Hey, that was kind of rude!",
  maestra: "Excuse me? Let's try that again, politely.",
  recepcion: "Excuse me? There's no need to be rude.",
};

const ROL: Record<InterId, string> = { amigo: "un amigo", maestra: "tu maestra", recepcion: "una recepcionista que no conoces" };

/** Evalúa si la frase armada tiene el registro adecuado para ese interlocutor. */
export function evaluarRegistro(propId: PropId, sel: (string | null)[], interId: InterId): VeredictoRegistro | null {
  const p = proposito(propId);
  const it = inter(interId);
  const frase = componer(propId, sel, interId);
  if (!frase) return null;
  const ps = p.ranuras.map((_, i) => pieza(p, i, sel[i])!) as Pieza[];
  const prom = ps.reduce((a, x) => a + x.nivel, 0) / ps.length;
  const banda = bandaDe(prom);
  const base = { frase, prom, banda };

  const cortante = ps.find((x) => x.cortante);
  if (cortante) {
    return { ...base, ok: false, casi: false, titulo: "Suena descortés", msg: `${cortante.nota} Con cualquier persona, agradece sin reproches: ${interId === "amigo" ? "Thanks! I owe you one!" : "Thank you very much for your help."}`, respuesta: RESPUESTA_BRUSCA[interId], emo: "incomoda" };
  }
  const imp = ps.find((x) => x.imperativo);
  if (imp) {
    const suave = ps.some((x) => x.suaviza);
    if (!suave) {
      return { ...base, ok: false, casi: false, titulo: "Suena a orden", msg: `«${capital(it.pedido.base)}.» sin please ni pregunta es una orden: incomoda hasta a un amigo. Agrega please o pregunta con Can you…? / Could you…?`, respuesta: RESPUESTA_BRUSCA[interId], emo: "incomoda" };
    }
    if (it.espera === "formal") {
      return { ...base, ok: false, casi: false, titulo: "Demasiado directo", msg: `Aunque lleve please, el imperativo sigue siendo una orden, y con ${ROL[interId]} suena brusco. Pregunta: Could you ${it.pedido.base}, please?`, respuesta: interId === "maestra" ? "Hmm… how do we ask politely?" : "Um… okay.", emo: "incomoda" };
    }
  }

  if (it.espera === "informal") {
    if (prom >= 1.99) {
      return { ...base, ok: false, casi: false, titulo: "Demasiado formal para un amigo", msg: `No es grosero, pero con Carlos suena distante, casi como si estuvieras enojado o bromeando. Relaja una pieza: ${ps.map((x) => x.nota).join(" ")}`, respuesta: "Ha! Why so formal? We're friends!", emo: "confundida" };
    }
    const nota = imp ? " Entre amigos se entiende; con please o Thanks! ya no suena a orden, aunque Can you…? sigue siendo más amable." : "";
    return { ...base, ok: true, casi: false, titulo: "Registro adecuado", msg: `Con un amigo lo natural es un registro ${BANDA_DEF[banda].es}, y tu frase lo es.${nota}`, respuesta: propId === "saludar" && sel[1] === "up" ? "Not much! What about you?" : RESPUESTA_OK[propId][interId], emo: "feliz" };
  }

  // Interlocutor formal
  const informales = ps.filter((x) => x.nivel === 0);
  if (informales.length > 0 && prom >= 1 && !ps.some((x) => x.id === "hey")) {
    return {
      ...base,
      ok: false,
      casi: true,
      titulo: "Un poco informal",
      msg: `${informales.map((x) => x.nota).join(" ")} Con ${ROL[interId]} no es grosero, pero cambia esa pieza por una más formal.`,
      respuesta: interId === "maestra" ? "Sure." : "Okay.",
      emo: "neutral",
    };
  }
  if (informales.length > 0) {
    return {
      ...base,
      ok: false,
      casi: false,
      titulo: "Demasiado informal",
      msg: `Con ${ROL[interId]} esto suena confianzudo: ${informales.map((x) => x.nota).join(" ")} Sube el registro con Good morning, Excuse me, Could you…? o Thank you.`,
      respuesta: interId === "maestra" ? "Hmm… that's a little too casual for class." : "Um… okay.",
      emo: "incomoda",
    };
  }
  if (prom < 1.33) {
    return { ...base, ok: false, casi: true, titulo: "Casi: amable, pero neutral", msg: `No es descortés, pero con ${ROL[interId]} conviene un registro formal. Cambia al menos una pieza neutral por una formal (Good morning, Could you…?, please, Thank you very much, Have a nice day).`, respuesta: interId === "maestra" ? "Sure." : "Okay.", emo: "neutral" };
  }
  return { ...base, ok: true, casi: false, titulo: "Registro adecuado", msg: `Con ${ROL[interId]} se espera un registro formal y tu frase lo es: cortés y respetuosa.`, respuesta: RESPUESTA_OK[propId][interId], emo: "feliz" };
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. FIX THE CONVERSATION — detectar y reescribir
 * ════════════════════════════════════════════════════════════════════════ */

export type TipoArreglo = "pedido" | "respuesta" | "empatia" | "turno" | "cierre";

export const TIPO_DEF: Record<TipoArreglo, { es: string; regla: string }> = {
  pedido: { es: "Pedir con cortesía", regla: "Pide con Could I have…? / Can I have…? / I'd like…, y agrega please." },
  respuesta: { es: "Responder con amabilidad", regla: "Acepta y agradece: Okay, thank you. / No problem. Thank you very much." },
  empatia: { es: "Responder con empatía", regla: "Ante una mala noticia: I'm sorry to hear that. / Oh no! I hope he gets better soon." },
  turno: { es: "Tomar el turno sin interrumpir", regla: "Suaviza y pide el turno: That's interesting! Can I add something? / Sorry to interrupt, but…" },
  cierre: { es: "Cerrar sin cortar", regla: "Transición + despedida: Anyway, I should get going. It was nice talking to you!" },
};

export interface LineaDialogo {
  quien: "npc" | "tu";
  texto: string;
  /** Por qué esta línea NO es el problema (para retroalimentar si la eligen). */
  bien: string;
  emo?: Emocion;
}

export interface Arreglo {
  id: string;
  escenario: Escenario;
  npc: PersonajeId;
  titulo: string;
  situacion: string;
  lineas: LineaDialogo[];
  problema: number;
  tipo: TipoArreglo;
  porque: string;
  /** Una reescritura posible (se muestra tras dos intentos o al lograrlo). */
  ejemplo: string;
  /** Lo que contesta el interlocutor después de la línea arreglada. */
  respuestaOk: string;
  /** Palabra que la reescritura debe conservar (lo que se pide), si aplica. */
  conservar?: { palabras: string[]; aviso: string };
}

export const ARREGLOS: Arreglo[] = [
  {
    id: "quesadilla",
    escenario: "cafeteria",
    npc: "lupita",
    titulo: "El pedido en la cafetería",
    situacion: "Pides tu almuerzo a Lupita, la cocinera de la cafetería.",
    lineas: [
      { quien: "npc", texto: "Good morning! What can I get you?", emo: "feliz", bien: "Lupita saluda y ofrece ayuda con una pregunta amable: abre muy bien." },
      { quien: "tu", texto: "Give me a quesadilla.", bien: "" },
      { quien: "npc", texto: "…Okay. Here you go.", emo: "incomoda", bien: "Lupita contesta seca porque la línea anterior la incomodó: el problema está justo antes." },
      { quien: "tu", texto: "Thank you! Have a nice day.", bien: "Thank you + Have a nice day es un cierre muy cortés." },
      { quien: "npc", texto: "You too!", emo: "feliz", bien: "You too! es la respuesta natural a Have a nice day." },
    ],
    problema: 1,
    tipo: "pedido",
    porque: "«Give me a quesadilla.» es una orden en imperativo: sin please ni una forma de pedir, a Lupita le suena brusco (A8: Give me that now. no es una expresión de cortesía).",
    ejemplo: "Could I have a quesadilla, please?",
    respuestaOk: "Sure! Here you go.",
    conservar: { palabras: ["quesadilla"], aviso: "Conserva lo que pides: una quesadilla (a quesadilla)." },
  },
  {
    id: "clinica",
    escenario: "clinica",
    npc: "recepcionista",
    titulo: "La espera en la clínica",
    situacion: "Llegas a tu cita en la clínica y hablas con la recepcionista.",
    lineas: [
      { quien: "npc", texto: "Good afternoon. How can I help you?", emo: "feliz", bien: "Saludo formal y ofrecimiento de ayuda: perfecto para una recepción." },
      { quien: "tu", texto: "Hi. I have an appointment with Dr. Pérez at four o'clock.", bien: "Saludas y explicas a qué vienes con claridad: correcto." },
      { quien: "npc", texto: "Thank you. Please have a seat. The doctor will see you in ten minutes.", emo: "feliz", bien: "La recepcionista agradece y te indica con please qué hacer: muy cortés." },
      { quien: "tu", texto: "Ugh, ten minutes? Whatever.", bien: "" },
      { quien: "npc", texto: "…", emo: "incomoda", bien: "El silencio incómodo es la reacción a la línea anterior." },
    ],
    problema: 3,
    tipo: "respuesta",
    porque: "«Ugh… Whatever.» muestra fastidio y desprecio. La recepcionista te atendió con amabilidad: acepta la indicación y agradece.",
    ejemplo: "Okay, thank you very much.",
    respuestaOk: "You're welcome.",
  },
  {
    id: "emily",
    escenario: "videollamada",
    npc: "emily",
    titulo: "Una mala noticia por videollamada",
    situacion: "Hablas con Emily, tu compañera de intercambio, por videollamada.",
    lineas: [
      { quien: "npc", texto: "Hi! Sorry, I'm not in a good mood today.", emo: "triste", bien: "Emily saluda y es honesta sobre cómo se siente: no hay nada descortés." },
      { quien: "tu", texto: "Hi, Emily! What's wrong?", bien: "Preguntar What's wrong? muestra interés por ella: bien." },
      { quien: "npc", texto: "My dog is sick. We took him to the vet this morning.", emo: "triste", bien: "Emily te cuenta su mala noticia: la cortesía se pone a prueba en la respuesta." },
      { quien: "tu", texto: "Oh. So, what's the weather like there?", bien: "" },
      { quien: "npc", texto: "Um… it's cold, I guess.", emo: "triste", bien: "Emily contesta desanimada porque sintió que no la escuchaste." },
    ],
    problema: 3,
    tipo: "empatia",
    porque: "Emily te contó algo triste y cambias de tema como si nada. Antes de cualquier otro tema, responde con empatía (A2: valida el sentimiento).",
    ejemplo: "Oh no, I'm sorry to hear that. I hope he gets better soon.",
    respuestaOk: "Thank you. That's really kind of you.",
  },
  {
    id: "sofia",
    escenario: "fiesta",
    npc: "sofia",
    titulo: "La interrupción en la fiesta",
    situacion: "En la fiesta, Sofía te cuenta sobre su escuela en Puebla.",
    lineas: [
      { quien: "npc", texto: "At my school in Puebla, we have a science fair every year, and—", emo: "feliz", bien: "Sofía está contando algo: no hay nada descortés en su línea." },
      { quien: "tu", texto: "Stop! Let me talk now.", bien: "" },
      { quien: "npc", texto: "Oh… sorry. Go ahead.", emo: "incomoda", bien: "Sofía se disculpa incómoda porque la interrumpiste." },
      { quien: "tu", texto: "My school has a science fair too! It's in May.", bien: "Compartir algo en común es buen small talk." },
      { quien: "npc", texto: "Really? That's great!", emo: "feliz", bien: "Really? That's great! es un backchannel amable (A5)." },
    ],
    problema: 1,
    tipo: "turno",
    porque: "«Stop! Let me talk now.» interrumpe de forma agresiva (A2). Para tomar el turno, primero reconoce lo que dice y luego pide la palabra con cortesía (turn-taking, A1).",
    ejemplo: "That's interesting! Can I add something?",
    respuestaOk: "Sure! Go ahead.",
  },
  {
    id: "carlos",
    escenario: "cafeteria",
    npc: "carlos",
    titulo: "El cierre con Carlos",
    situacion: "Carlos te cuenta su fin de semana en la cafetería, pero ya sonó el timbre y tienes que ir a clase.",
    lineas: [
      { quien: "npc", texto: "…and then we went to the museum. It was so cool!", emo: "feliz", bien: "Carlos cuenta su fin de semana con entusiasmo." },
      { quien: "tu", texto: "Really? That sounds great!", bien: "Really? That sounds great! es un backchannel que muestra interés (A4, A5)." },
      { quien: "npc", texto: "Yeah! And after that, we went to a really good taco place, and…", emo: "feliz", bien: "Carlos sigue contando: es normal en una conversación entre amigos." },
      { quien: "tu", texto: "Bye.", bien: "" },
      { quien: "npc", texto: "Oh… bye?", emo: "confundida", bien: "Carlos se confunde porque lo cortaste de golpe." },
    ],
    problema: 3,
    tipo: "cierre",
    porque: "«Bye.» corta a Carlos a media historia. Tienes que irte, pero cierra con una transición y una despedida cordial (A5).",
    ejemplo: "Sorry, Carlos, I have to go to class. It was nice talking to you. See you later!",
    respuestaOk: "Oh, okay! See you later!",
  },
];

/* ── Validación tolerante de lo escrito ──────────────────────────────── */

/** Minúsculas, sin acentos, apóstrofos rectos, contracciones expandidas y sin puntuación. */
export function normalizaEn(s: string): string {
  return ` ${s.normalize("NFD").replace(/\p{Mn}/gu, "").toLowerCase()} `
    .replace(/[’‘`´]/g, "'")
    .replace(/\bi'm\b/g, "i am")
    .replace(/\bit's\b/g, "it is")
    .replace(/\bthat's\b/g, "that is")
    .replace(/\bwhat's\b/g, "what is")
    .replace(/\bhow's\b/g, "how is")
    .replace(/\bhe's\b/g, "he is")
    .replace(/\bshe's\b/g, "she is")
    .replace(/\byou're\b/g, "you are")
    .replace(/\bi'd\b/g, "i would")
    .replace(/\bi'll\b/g, "i will")
    .replace(/\bi've\b/g, "i have")
    .replace(/\blet's\b/g, "let us")
    .replace(/\bcan't\b/g, "cannot")
    .replace(/\bdon't\b/g, "do not")
    .replace(/\bwon't\b/g, "will not")
    .replace(/\bgotta\b/g, "got to")
    .replace(/\bgonna\b/g, "going to")
    .replace(/\bpls\b|\bplz\b/g, "please")
    .replace(/\bthx\b/g, "thanks")
    .replace(/[^a-z0-9' ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export interface Aviso {
  tipo: "error" | "consejo";
  texto: string;
}

export interface ResultadoReescritura {
  ok: boolean;
  avisos: Aviso[];
}

const ESPANOL = /\b(gracias|por favor|perdon|disculpa|disculpe|lo siento|adios|hola|quiero|quisiera|puedes|podria|nos vemos|que mal|me tengo que ir|oye)\b/;
const GROSERO = /\b(whatever|ugh|shut up|be quiet|stop|let me talk|nobody asked|who cares|i do not care|hurry up|move)\b|\bso what\b(?! is)/;

const has = (n: string, re: RegExp) => re.test(n);

/** Revisa la reescritura del alumno para la línea problemática. */
export function revisarReescritura(texto: string, a: Arreglo): ResultadoReescritura {
  const n = normalizaEn(texto);
  const avisos: Aviso[] = [];
  const err = (t: string) => avisos.push({ tipo: "error", texto: t });
  const tip = (t: string) => avisos.push({ tipo: "consejo", texto: t });
  const palabras = n.split(" ").filter(Boolean);
  if (palabras.length === 0) return { ok: false, avisos: [{ tipo: "error", texto: "Escribe la línea en inglés." }] };
  if (has(n, ESPANOL)) err("Hay palabras en español. Escribe la línea completa en inglés.");
  if (palabras.length < 2) err("Una sola palabra casi siempre suena cortante. Escribe una frase completa.");
  const original = normalizaEn(a.lineas[a.problema]!.texto);
  if (n === original) err("Es la misma línea que ya estaba. Reescríbela con cortesía.");
  if (has(n, GROSERO)) err("Tu frase todavía tiene una expresión brusca (stop, whatever, ugh, move…). Quítala.");

  if (a.tipo === "pedido") {
    const formaCortes = has(n, /\b(could|can|may) i (please )?(have|get)\b/) || has(n, /\bi would like\b/) || has(n, /\b(could|can|would) you (please )?(give|get|pass|bring|make)\b/) || has(n, /\bwould you mind\b/);
    const please = has(n, /\bplease\b/);
    const orden = has(n, /^(please )?give me\b/);
    const quiero = has(n, /\bi want\b/);
    if (a.conservar && !a.conservar.palabras.some((w) => n.includes(w))) err(a.conservar.aviso);
    if (!formaCortes && !please) err("Sigue sonando a orden. Pide con Could I have…? / Can I have…? / I'd like…, y agrega please.");
    else if (orden && !formaCortes) tip("Con please ya no es tan brusco, pero «Give me…» sigue siendo una orden. Suena mejor: Could I have a quesadilla, please?");
    else if (quiero && !formaCortes) tip("«I want…» suena exigente en inglés aunque lleve please. Mejor: I'd like a quesadilla, please.");
    else if (formaCortes && !please) tip("Correcto y cortés. Con please al final suena todavía más amable.");
  } else if (a.tipo === "respuesta") {
    const gracias = has(n, /\b(thank you|thanks|thank u)\b/);
    if (!gracias) err("La recepcionista te está ayudando: agradécele (thank you / thanks).");
    else if (!has(n, /\b(okay|ok|sure|no problem|all right|alright|that is fine|great|perfect|of course)\b/)) tip("Bien. También puedes aceptar la indicación antes de agradecer: Okay, thank you.");
  } else if (a.tipo === "empatia") {
    const empatia = has(n, /\bsorry to hear\b/) || has(n, /\bi am (so |really |very )?sorry\b/) || has(n, /\bthat is (too bad|terrible|awful|so sad|sad)\b/) || has(n, /\boh no\b/) || has(n, /\bi hope (he|your dog|he is|he will)\b/) || has(n, /\bpoor (dog|thing|guy|boy|him)\b/);
    const alegre = has(n, /\b(great|amazing|awesome|cool|lucky|funny|nice)\b/) && !has(n, /\bi hope\b/);
    const clima = has(n, /\bweather\b/);
    if (!empatia) err("Falta la empatía. Ante una mala noticia di algo como: I'm sorry to hear that. / Oh no! I hope he gets better soon.");
    if (alegre) err("Hay una palabra de buena noticia (great, amazing, cool…): ante algo triste suena insensible.");
    if (empatia && clima) tip("Bien por la empatía. Aun así, cambiar al clima en la misma frase suena apresurado: deja que Emily hable de su perro.");
  } else if (a.tipo === "turno") {
    const suaviza = has(n, /\b(that is (interesting|cool|great|amazing)|that sounds (interesting|great|cool)|sorry to interrupt|sorry for interrupting|sorry|excuse me|really)\b/);
    const pide = has(n, /\b(can|could|may) i (add|say|ask|share|tell)\b/) || has(n, /\bcan i add\b/) || has(n, /\b(let me add|i would like to add|if i may)\b/);
    if (!pide) err("Pide el turno con una pregunta: Can I add something? / Could I say something?");
    if (!suaviza) err("Antes de pedir el turno, reconoce lo que dice Sofía: That's interesting! / Sorry to interrupt, but…");
  } else if (a.tipo === "cierre") {
    const transicion = has(n, /\banyway\b/) || has(n, /\b(should|have to|need to|must|got to|have got to) (get going|go|leave|run)\b/) || has(n, /\b(my class|the bell|i am late|i am going to be late)\b/);
    const despedida = has(n, /\b(nice|great|good) (talking|to talk|to see you|seeing you)\b/) || has(n, /\b(see you|see ya|take care|talk to you|catch you|bye|goodbye|have a (nice|good) (day|weekend))\b/);
    if (!transicion) err("Falta la transición: explica que te tienes que ir (Anyway, I should get going / Sorry, I have to go to class).");
    if (!despedida) err("Falta la despedida cordial: It was nice talking to you. / See you later!");
  }

  const ok = !avisos.some((x) => x.tipo === "error");
  return { ok, avisos };
}

/* ════════════════════════════════════════════════════════════════════════
 * 4. ESTRELLAS — ¿abrir, mantener o cerrar?
 * ════════════════════════════════════════════════════════════════════════ */

export interface ExpresionEtapa {
  texto: string;
  etapa: Etapa;
  porque: string;
}

export const BANCO_ETAPAS: ExpresionEtapa[] = [
  { texto: "Hi! How have you been?", etapa: "open", porque: "How have you been? es un saludo de continuación para alguien que no ves desde hace tiempo (A5): abre." },
  { texto: "Excuse me, could I ask you about the homework?", etapa: "open", porque: "Excuse me, could I…? es una forma educada de iniciar una conversación (A5)." },
  { texto: "Nice to meet you, Sofía!", etapa: "open", porque: "Nice to meet you se dice al conocer a alguien, al inicio (A1)." },
  { texto: "Hey! What have you been up to?", etapa: "open", porque: "What have you been up to? sirve para iniciar la conversación y ponerse al día (A1)." },
  { texto: "Good morning! How are you today?", etapa: "open", porque: "Saludo + How are you? abre la conversación (A1)." },
  { texto: "Really? That's amazing!", etapa: "keep", porque: "Es un backchannel: muestra atención y mantiene la conversación (A5)." },
  { texto: "By the way, are you coming to the event on Friday?", etapa: "keep", porque: "By the way introduce un tema nuevo sin cerrar la conversación (A5)." },
  { texto: "That's interesting, but can I add something?", etapa: "keep", porque: "Es una señal de turn-taking para participar sin interrumpir (A2)." },
  { texto: "Oh no, I'm sorry to hear that.", etapa: "keep", porque: "La empatía ante una mala noticia mantiene la conversación con respeto." },
  { texto: "What about you?", etapa: "keep", porque: "What about you? devuelve el turno: la conversación sigue (A1)." },
  { texto: "Anyway, I should get going.", etapa: "close", porque: "Anyway, I should get going empieza a cerrar la conversación (A5)." },
  { texto: "It was really nice talking to you. Take care!", etapa: "close", porque: "Es una frase de despedida cordial (A5)." },
  { texto: "See you around!", etapa: "close", porque: "See you around es una despedida informal (A1)." },
  { texto: "I have to go to class now. See you tomorrow!", etapa: "close", porque: "Anuncias que te vas y te despides (A1): cierra." },
  { texto: "Talk to you soon!", etapa: "close", porque: "Talk to you soon es una despedida amistosa." },
];

export function rondaEtapas(rnd: () => number, n = 8): ExpresionEtapa[] {
  // Garantiza al menos dos de cada etapa.
  const por = (e: Etapa) => baraja(BANCO_ETAPAS.filter((x) => x.etapa === e), rnd);
  const base = [...por("open").slice(0, 2), ...por("keep").slice(0, 2), ...por("close").slice(0, 2)];
  const resto = baraja(
    BANCO_ETAPAS.filter((x) => !base.includes(x)),
    rnd,
  ).slice(0, Math.max(0, n - base.length));
  return baraja([...base, ...resto], rnd);
}

/* ════════════════════════════════════════════════════════════════════════
 * 5. CONTENIDO VERBATIM (IN-IV-P06)
 * ════════════════════════════════════════════════════════════════════════ */

export interface TerminoGlosario {
  termino: string;
  definicion: string;
  ejemplo: string;
}

export const TITULO_A1 = "Social English: Small Talk Vocabulary";

/** Glosario A1 — verbatim (10 términos). */
export const GLOSARIO_A1: TerminoGlosario[] = [
  { termino: "How are you?", definicion: "Saludo informal: ¿Cómo estás? / ¿Cómo te encuentras? Es una expresión de cortesía, no siempre una pregunta literal sobre la salud.", ejemplo: "'How are you?' — 'I'm fine, thanks! And you?' (Informal greeting exchange between classmates.)" },
  { termino: "What have you been up to?", definicion: "¿Qué has estado haciendo últimamente? Pregunta informal para iniciar conversación y ponerse al día con alguien.", ejemplo: "'Hey! What have you been up to?' — 'Not much, just studying for finals. What about you?'" },
  { termino: "By the way", definicion: "Por cierto, a propósito. Se usa para introducir un tema nuevo o información adicional en la conversación.", ejemplo: "'By the way, did you see the fútbol game last night? América won again!' (A propósito, ¿viste el partido de fútbol anoche?)" },
  { termino: "Anyway", definicion: "De todas formas, de todos modos, bueno. Se usa para cambiar de tema, volver al tema principal, o cerrar educadamente una conversación.", ejemplo: "'Anyway, I should get going — see you tomorrow!' (De todas formas, debo irme — ¡hasta mañana!)" },
  { termino: "Nice to meet you", definicion: "Mucho gusto / Encantado(a) de conocerte. Expresión formal o informal al conocer a alguien por primera vez.", ejemplo: "'Hi, I'm Sofía.' — 'Nice to meet you, Sofía! I'm Diego.' ('Mucho gusto, Sofía. Soy Diego.')" },
  { termino: "See you around", definicion: "Nos vemos por ahí, hasta luego. Expresión informal para despedirse sin una fecha concreta de volverte a ver.", ejemplo: "'I have to go to class now. See you around!' (Tengo que ir a clase. ¡Nos vemos!)" },
  { termino: "Small talk", definicion: "Conversación informal y ligera sobre temas poco importantes (clima, fin de semana, fútbol) para romper el hielo o ser sociable. No busca profundidad.", ejemplo: "Talking about the weather or weekend plans at the start of a class is typical small talk: 'Did you have a good weekend?' — 'Yes, I went to a quinceañera!' (¿Tuviste un buen fin de semana?)" },
  { termino: "Turn-taking", definicion: "El turno para hablar en una conversación. En inglés, las señales de turn-taking indican cuándo ceder o tomar la palabra de forma educada.", ejemplo: "Phrases like 'That's interesting, but...' or 'Can I add something?' are turn-taking signals. (Frases que señalan que quieres tomar el turno de hablar.)" },
  { termino: "Polite expressions", definicion: "Expresiones de cortesía en inglés: please, thank you, excuse me, I'm sorry, you're welcome. Son esenciales en conversaciones formales e informales.", ejemplo: "'Excuse me, could you help me find this classroom?' — 'Of course! It's on the second floor.' ('Con permiso, ¿podrías ayudarme a encontrar este salón?')" },
  { termino: "Ice-breaker", definicion: "Una actividad o pregunta para romper el hielo — para hacer que personas que no se conocen se sientan más cómodas al inicio de una conversación o reunión.", ejemplo: "A typical ice-breaker question: 'If you could visit any place in Mexico, where would you go and why?' (Una pregunta típica para romper el hielo al inicio de clase.)" },
];
export const ACTIVIDAD_A1 = "Practica con un compañero: elige 3 expresiones del glosario y crea un diálogo breve de 6-8 líneas. El diálogo debe incluir: un saludo, un tema de small talk (fútbol mexicano, fin de semana, una película), y una despedida.";

/** Glosario A5 — verbatim (6 términos, con su etiqueta). */
export const GLOSARIO_A5: (TerminoGlosario & { etiqueta: string })[] = [
  { termino: "How have you been?", definicion: "Saludo de continuación para alguien que no ves hace tiempo.", ejemplo: "— Hi! How have you been? — Pretty good, thanks! Busy with school.", etiqueta: "inicio" },
  { termino: "Excuse me, could I...?", definicion: "Forma educada de iniciar una conversación o pedir algo.", ejemplo: "Excuse me, could I ask you about the homework?", etiqueta: "cortesía" },
  { termino: "backchannels (Really? / That's great!)", definicion: "Respuestas breves que muestran atención e interés.", ejemplo: "— I got the highest mark! — Really? That's amazing!", etiqueta: "mantenimiento" },
  { termino: "By the way", definicion: "Expresión para introducir un tema nuevo o lateral.", ejemplo: "By the way, are you coming to the event on Friday?", etiqueta: "cambio de tema" },
  { termino: "Anyway, I should get going.", definicion: "Expresión para empezar a cerrar la conversación.", ejemplo: "Anyway, I should get going. It was great talking to you!", etiqueta: "cierre" },
  { termino: "It was nice/great talking to you!", definicion: "Frase de despedida cordial y natural.", ejemplo: "It was really nice talking to you. Take care!", etiqueta: "cierre" },
];
export const ACTIVIDAD_A5 = "Escribe un diálogo completo de 8-10 intercambios entre dos compañeros que se encuentran en el pasillo. Incluye: inicio, al menos 2 backchannels, un cambio de tema con 'by the way' y un cierre educado.";

/** Verdadero/falso A4 — verbatim. */
export const HECHOS_A4: { enunciado: string; respuesta: boolean; retroalimentacion: string }[] = [
  { enunciado: "'How have you been?' is a polite way to continue a conversation after greeting someone you haven't seen for a while.", respuesta: true, retroalimentacion: "Correct: it's a natural follow-up after 'Hello!' when you haven't met recently." },
  { enunciado: "'That's interesting!' and 'Really?' are examples of conversation fillers that show you are listening.", respuesta: true, retroalimentacion: "Correct: these are called 'backchannels' — small responses that keep the conversation flowing." },
  { enunciado: "To close a conversation politely you can say 'It was great talking to you. Take care!'", respuesta: true, retroalimentacion: "Correct: this is a natural and friendly way to end a short social exchange." },
  { enunciado: "Starting a conversation with 'Excuse me, could I ask you something?' is too formal and should be avoided.", respuesta: false, retroalimentacion: "No: it is polite and appropriate in many contexts, especially with people you don't know well." },
  { enunciado: "'By the way' is used to introduce a new, often unrelated topic in a conversation.", respuesta: true, retroalimentacion: "Correct: 'By the way, did you hear about the school trip?' introduces a side topic." },
];

/** Autoevaluación A3 — criterios verbatim y escritura final. */
export const AUTOEVALUACION_A3: string[] = [
  "Puedo iniciar y responder a un saludo en inglés de forma natural y apropiada para el contexto.",
  "Puedo mantener una conversación breve usando small talk y expresiones de cortesía.",
  "Puedo cerrar una conversación de forma educada y natural usando expresiones de despedida.",
  "Reconozco y uso señales de turn-taking para participar respetuosamente en una conversación en inglés.",
];
export const ESCRITURA_A3 =
  "Write a short social dialogue in English (6-8 lines) between two classmates who haven't seen each other for two weeks. Include: a greeting, at least one small talk topic (weekend, fútbol mexicano, a recent event), and a friendly farewell. Use at least 3 expressions from the vocabulary studied.";

/** Autoevaluación A7 — criterios verbatim. */
export const AUTOEVALUACION_A7: string[] = [
  "Inicio conversaciones con saludos y preguntas corteses ('How have you been?', 'Excuse me, could I...?').",
  "Uso backchannels ('Really?', 'That's great!') para mostrar interés y mantener la conversación.",
  "Introduzco nuevos temas con 'By the way' o cambio de tema de forma natural.",
  "Cierro conversaciones con frases educadas ('Anyway, I should get going / It was nice talking to you').",
];
export const REFLEXION_A7 = "¿Con quién tendrías una conversación breve en inglés esta semana? ¿Cómo la empezarías y la terminarías?";

/** Video A8 — título, descripción y pregunta abierta verbatim. */
export const VIDEO_A8 = {
  titulo: "Conversaciones sociales breves y expresiones de cortesía en inglés",
  descripcion: "Video que explica cómo iniciar, mantener y cerrar una conversación breve en inglés utilizando expresiones de cortesía y respeto.",
  abierta: "¿Qué expresiones en inglés usarías para iniciar y cerrar una conversación breve de forma cortés?",
};

export const FUENTE =
  "CEN Bachillerato — UAC Inglés IV, progresión 6: glosarios A1 y A5, quiz A2, verdadero/falso A4, texto A6, autoevaluaciones A3 y A7, y preguntas del video A8.";

export const PROBLEMA =
  "Saber decir «Hello» no basta: una conversación breve tiene que abrirse, mantenerse y cerrarse, y cada frase cambia cómo se siente la otra persona. En estos escenarios 3D hablas con compañeros, una maestra, una recepcionista y una estudiante de intercambio; ellos reaccionan a lo que dices: sonríen, se incomodan, se confunden o se despiden.";

export const INSTRUCCIONES: string[] = [
  "En Open, keep, close elige qué dices en cada turno. Observa cómo reacciona tu interlocutor y los medidores de cortesía y fluidez; llega al cierre sin cortar la conversación.",
  "En Formal or informal? arma la frase con piezas para Carlos, Ms. Ramírez o la recepcionista. La aguja muestra tu registro; di la frase y mira su reacción.",
  "En Fix the conversation toca la línea que suena descortés, reescríbela en inglés y reproduce la conversación arreglada.",
  "Gana estrellas clasificando expresiones (abrir, mantener o cerrar), aprueba el reto (A2 + A8) y completa el texto A6.",
];

export const IDEAS: string[] = [
  "Una conversación breve tiene tres partes: abrir (saludo + pregunta), mantener (backchannels, preguntas de vuelta, By the way) y cerrar (transición + despedida).",
  "How have you been? y What have you been up to? son para alguien que ya conoces; Nice to meet you, solo la primera vez.",
  "Really? That's great! muestra que escuchas; What about you? devuelve el turno.",
  "Ante una mala noticia, primero la empatía: I'm sorry to hear that. Después, si acaso, cambia de tema.",
  "No cortes con «Bye.»: usa una transición (Anyway, I should get going) y una frase cordial (It was nice talking to you).",
  "El registro depende de quién escucha: Hey / Can you…? con amigos; Good morning / Excuse me, could you…, please? con la maestra o en una recepción.",
];

/** Reto evaluable: quiz A2 (verbatim) + preguntas cerradas del video A8. */
export const QUIZ: QuizEvaluable = {
  titulo: "Quiz: Polite Expressions and Conversation (A2) y video (A8)",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "You meet someone for the first time. What is the most appropriate expression?",
      opciones: ["See you around!", "What have you been up to?", "Nice to meet you!", "Anyway, I have to go."],
      respuestaCorrecta: 2,
      retroalimentacion: "'Nice to meet you' es la expresión estándar al conocer a alguien por primera vez. 'See you around' es una despedida; 'What have you been up to?' asume que ya se conocen; 'Anyway' se usa para cambiar de tema o despedirse.",
    },
    {
      enunciado: "Your friend is talking a lot. You want to add your opinion politely. What do you say?",
      opciones: ["Stop! Let me talk now.", "Anyway, you are wrong.", "That's interesting, but can I add something?", "By the way, nobody asked you."],
      respuestaCorrecta: 2,
      retroalimentacion: "'That's interesting, but can I add something?' es una señal de turn-taking educada: reconoces lo que dijo tu amigo y pides permiso para hablar. 'Stop!' y las otras opciones son agresivas o descorteses.",
    },
    {
      enunciado: "You want to change the topic in a friendly conversation. Which connector works best?",
      opciones: ["Nice to meet you, but...", "By the way, did you see the fútbol game last night?", "See you around, also...", "How are you, however..."],
      respuestaCorrecta: 1,
      retroalimentacion: "'By the way' se usa para introducir un tema nuevo o cambiar la dirección de la conversación de forma natural y amigable. Es el conector ideal para small talk.",
    },
    {
      enunciado: "A classmate says: 'I'm a bit tired today.' What is a good empathetic response?",
      opciones: ["Anyway, let's start the activity.", "Oh, that happens to me too sometimes. Did you sleep well?", "By the way, what did you eat for dinner?", "Nice to meet you — are you always tired?"],
      respuestaCorrecta: 1,
      retroalimentacion: "'Oh, that happens to me too sometimes. Did you sleep well?' es empático: valida el sentimiento del compañero y hace una pregunta de seguimiento. Las otras opciones ignoran el comentario o son inapropiadas.",
    },
    {
      enunciado: "You are leaving after a casual conversation. Which farewell is the most informal and friendly?",
      opciones: ["I must go now. Goodbye.", "See you around!", "It was a pleasure to meet you. Farewell.", "I need to leave immediately."],
      respuestaCorrecta: 1,
      retroalimentacion: "'See you around!' es una despedida informal y amigable, perfecta para conversaciones casuales entre jóvenes. 'Farewell' y 'It was a pleasure to meet you' son demasiado formales. 'I need to leave immediately' suena brusco.",
    },
    {
      enunciado: "¿Cuál de las siguientes frases es una expresión de cortesía en inglés?",
      opciones: ["Give me that now.", "Do it now.", "Could you please help me?"],
      respuestaCorrecta: 2,
      retroalimentacion: "«Could you please help me?» pide ayuda con could y please; las otras dos son órdenes en imperativo, sin ninguna expresión de cortesía.",
    },
    {
      enunciado: "Una conversación social breve en inglés puede incluir un saludo, el tema principal y una despedida cortés.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Verdadero: abrir (saludo), mantener (el tema) y cerrar (despedida cortés) son las tres partes que practicas en «Open, keep, close».",
    },
  ],
};

/** Actividad A6 «Fill in the blanks — A brief social exchange» — verbatim. */
export const TEXTO_A6 =
  "— Hi, Carlos! How ___ you been? — Pretty good, thanks! I just finished my biology project. — ___ ? That's great! — By the ___, did you see the announcement about the school trip? — Yes! I'm so excited. Anyway, I should ___ going. It was nice talking to you!";

export const HUECOS_A6: TextoHuecosData = {
  ancla: "IN-IV-P06-A6 · Fill in the blanks — A brief social exchange",
  instrucciones: "Completa los huecos con la expresión de cortesía o el backchannel correcto.",
  partes: TEXTO_A6.split("___"),
  huecos: [
    { respuesta: "have", alternativas: [], pista: "How ___ you been? — present perfect de 'be'." },
    { respuesta: "Really", alternativas: ["really"], pista: "Backchannel de sorpresa positiva: ___? That's great!" },
    { respuesta: "way", alternativas: [], pista: "By the ___ = a propósito / por cierto." },
    { respuesta: "get", alternativas: [], pista: "I should ___ going = tengo que irme (phrasal verb)." },
  ],
};

/**
 * Simulador «Open mic night» (IN-IV-P07): lógica pura, sin React.
 *
 * Leo (personaje FICTICIO) va a contar una anécdota en el micrófono abierto de
 * un café. Su borrador está mal armado. El alumno lo edita: elige el conector y
 * el tiempo verbal de cada parte, y puede mover las partes de lugar. El público
 * responde a cada parte: la atención sube con una apertura que engancha, una
 * escena con cuándo/dónde/quién, el past continuous de fondo, un clímax con
 * «Suddenly», un cierre con «In the end» y una reacción final; se desploma con
 * tiempos en presente, conectores que dicen otra cosa o un final contado antes
 * del problema (spoiler).
 *
 * La estructura es la de la progresión: setting (when/where/who), complication,
 * resolution/reaction (A4), con los conectores y frases del glosario A5 y los
 * patrones «I was … when …» / «While I was …» de la lectura A1.
 *
 * Personas y lugares FICTICIOS (Villa Encino, Café La Lámpara, Don Ramiro).
 * La atención del público es una SIMULACIÓN, no una medición.
 */

export type BeatId = "apertura" | "escena" | "complicacion" | "climax" | "resolucion" | "reaccion";
export type Calidad = 0 | 1 | 2;

export interface OpcionSlot {
  id: string;
  texto: string;
  /** 2 = lo que la progresión enseña · 1 = se entiende pero debilita · 0 = rompe la historia. */
  calidad: Calidad;
  porque: string;
}

export interface SlotSim {
  id: string;
  /** Qué se está eligiendo (en español). */
  etiqueta: string;
  opciones: OpcionSlot[];
}

export interface BeatSim {
  id: BeatId;
  /** Lugar que le toca en la anécdota bien contada (0 = primero). */
  canon: number;
  nombre: string;
  es: string;
  icono: string;
  /** Oración con huecos `{slot}`. */
  plantilla: string;
  slots: SlotSim[];
  /** Hecho real que narra (la apertura no narra un hecho). */
  evento: { orden: number; titulo: string; foto: string } | null;
}

export const RUTA_FOTOS = "/media/labs-sim/anecdota-ingles";

export const BEATS: BeatSim[] = [
  {
    id: "apertura",
    canon: 0,
    nombre: "Opener",
    es: "Apertura",
    icono: "fa-bullhorn",
    plantilla: "{opener}",
    evento: null,
    slots: [
      {
        id: "opener",
        etiqueta: "Frase de apertura",
        opciones: [
          { id: "a", texto: "Okay, so... um, this is a story.", calidad: 1, porque: "Avisa que viene una historia, pero no despierta curiosidad: el público espera sin ganas. Una apertura (anecdote opener) como «You won't believe…» o «The funniest thing happened…» engancha desde la primera línea." },
          { id: "b", texto: "Tomorrow I will travel to Villa Encino.", calidad: 0, porque: "Está en futuro (will travel): una anécdota cuenta algo que YA pasó. El público espera oír planes, no una historia, y se desconecta." },
          { id: "c", texto: "You won't believe what happened to me last summer!", calidad: 2, porque: "Es un anecdote opener: capta la atención y avisa que viene una historia. Además ya sitúa el cuándo (last summer)." },
        ],
      },
    ],
  },
  {
    id: "escena",
    canon: 1,
    nombre: "Setting the scene",
    es: "Escena: cuándo, dónde, quién",
    icono: "fa-map-location-dot",
    plantilla: "{detalle} {verbo} for the bus to the coast.",
    evento: { orden: 1, titulo: "Waiting at the station", foto: "estacion" },
    slots: [
      {
        id: "detalle",
        etiqueta: "Cuándo, dónde y quién",
        opciones: [
          { id: "a", texto: "It was a hot Saturday afternoon at the Villa Encino bus station, and my cousin Marisol and I", calidad: 2, porque: "Setting the scene completo: cuándo (a hot Saturday afternoon), dónde (the Villa Encino bus station) y quién (my cousin Marisol and I). El público ya puede imaginar la escena." },
          { id: "b", texto: "At the bus station, my cousin Marisol and I", calidad: 1, porque: "Hay dónde y quién, pero falta el cuándo. La escena queda a medias: ¿fue ayer, hace años, de día, de noche?" },
          { id: "c", texto: "One day, somewhere, some people and I", calidad: 0, porque: "No dice cuándo, dónde ni con quién: sin escena, el público no tiene nada que imaginar y se pierde desde el principio." },
        ],
      },
      {
        id: "verbo",
        etiqueta: "Tiempo verbal (wait)",
        opciones: [
          { id: "a", texto: "waited", calidad: 1, porque: "Past simple: es correcto, pero suena a un hecho ya terminado. Para el fondo de la escena la lectura usa past continuous («I was standing at the metro station…»): una acción en progreso que algo va a interrumpir." },
          { id: "b", texto: "are waiting", calidad: 0, porque: "Presente (are waiting): rompe la narración en pasado. El público no sabe si esto pasa ahora o pasó." },
          { id: "c", texto: "were waiting", calidad: 2, porque: "Past continuous (were + verb-ing): pinta el fondo, una acción en progreso. Así el público siente que algo está a punto de interrumpirla." },
        ],
      },
    ],
  },
  {
    id: "complicacion",
    canon: 2,
    nombre: "Complication",
    es: "Complicación",
    icono: "fa-bolt",
    plantilla: "{conector} we {verbo}, a man ran past us and left his guitar case on the bench.",
    evento: { orden: 2, titulo: "A man leaves a guitar", foto: "guitarra" },
    slots: [
      {
        id: "conector",
        etiqueta: "Conector",
        opciones: [
          { id: "a", texto: "While", calidad: 2, porque: "«While» + past continuous es el patrón de la lectura: «WHILE I WAS [doing something], [something happened]». El problema cae en medio de otra acción y la escena se congela." },
          { id: "b", texto: "Because", calidad: 0, porque: "«Because» marca causa: el público entiende que el hombre corrió POR culpa de la plática. No es lo que pasó; aquí se necesita simultaneidad (while), no causa." },
          { id: "c", texto: "In the end,", calidad: 0, porque: "«In the end» señala el cierre de la historia. El público cree que ya terminó… justo cuando empieza el problema." },
        ],
      },
      {
        id: "verbo",
        etiqueta: "Tiempo verbal (talk)",
        opciones: [
          { id: "a", texto: "talk", calidad: 0, porque: "Presente (talk): la historia salta del pasado al presente a mitad de la frase y el público duda de cuándo pasó." },
          { id: "b", texto: "were talking", calidad: 2, porque: "Past continuous: la plática seguía en curso cuando llegó la sorpresa (ran, left en past simple). Fondo largo + golpe breve = tensión." },
          { id: "c", texto: "talked", calidad: 1, porque: "Se entiende, pero el past simple hace la plática un bloque terminado. El patrón «While we were talking, … ran past» deja claro que la acción seguía cuando ocurrió lo inesperado." },
        ],
      },
    ],
  },
  {
    id: "climax",
    canon: 3,
    nombre: "Climax",
    es: "Momento cumbre",
    icono: "fa-mountain",
    plantilla: "{conector} the bus {verbo}, and we had to decide: get on the bus or find the owner of the guitar.",
    evento: { orden: 3, titulo: "The bus arrives", foto: "autobus" },
    slots: [
      {
        id: "conector",
        etiqueta: "Conector",
        opciones: [
          { id: "a", texto: "Eventually,", calidad: 1, porque: "«Eventually» significa «finalmente, después de un rato»: le quita la sorpresa al momento cumbre. Va mejor en la resolución." },
          { id: "b", texto: "Suddenly,", calidad: 2, porque: "«Suddenly» (de repente) marca el momento inesperado: el público se inclina hacia adelante. También sirven «all of a sudden» o «at that moment»." },
          { id: "c", texto: "First,", calidad: 0, porque: "«First» abre una secuencia desde el principio. A mitad de la historia confunde: ¿empezó otra anécdota?" },
        ],
      },
      {
        id: "verbo",
        etiqueta: "Tiempo verbal (arrive)",
        opciones: [
          { id: "a", texto: "arrived", calidad: 2, porque: "Past simple: un evento completo y puntual, justo lo que pide el clímax." },
          { id: "b", texto: "was arriving", calidad: 1, porque: "Past continuous alarga la acción («venía llegando»): el momento cumbre pierde fuerza. Los eventos que hacen avanzar la historia van en past simple." },
          { id: "c", texto: "arrives", calidad: 0, porque: "Presente (arrives): en el momento más importante la historia cambia de tiempo y el público se desorienta." },
        ],
      },
    ],
  },
  {
    id: "resolucion",
    canon: 4,
    nombre: "Resolution",
    es: "Resolución",
    icono: "fa-flag-checkered",
    plantilla: "{conector} we {verbo} the bus, but we found the owner at the ticket office. He was a street musician named Don Ramiro.",
    evento: { orden: 4, titulo: "We find the owner", foto: "taquilla" },
    slots: [
      {
        id: "conector",
        etiqueta: "Conector",
        opciones: [
          { id: "a", texto: "In the end,", calidad: 2, porque: "«In the end» señala la conclusión o el resultado de la anécdota: el público sabe que llega el desenlace." },
          { id: "b", texto: "Suddenly,", calidad: 1, porque: "«Suddenly» promete otra sorpresa, pero esto es el desenlace, no un giro nuevo. El público se prepara para un problema que no llega." },
          { id: "c", texto: "While", calidad: 0, porque: "«While we missed the bus, but…» queda incompleta: «while» pide una acción de fondo en progreso, no un cierre." },
        ],
      },
      {
        id: "verbo",
        etiqueta: "Tiempo verbal (miss)",
        opciones: [
          { id: "a", texto: "were missing", calidad: 1, porque: "Past continuous: suena a algo que seguía pasando. Perder el autobús es un hecho terminado: past simple." },
          { id: "b", texto: "miss", calidad: 0, porque: "Presente (miss): el desenlace se oye como algo que pasa siempre, no como lo que pasó ese sábado." },
          { id: "c", texto: "missed", calidad: 2, porque: "Past simple (missed, found): hechos terminados que cierran la historia." },
        ],
      },
    ],
  },
  {
    id: "reaccion",
    canon: 5,
    nombre: "Reaction",
    es: "Reacción y lección",
    icono: "fa-heart",
    plantilla: "{reaccion} He {verbo} a song just for us, and it taught me to always stop and help.",
    evento: { orden: 5, titulo: "He plays a song", foto: "cancion" },
    slots: [
      {
        id: "reaccion",
        etiqueta: "Frase de reacción",
        opciones: [
          { id: "a", texto: "Unfortunately,", calidad: 0, porque: "«Unfortunately» anuncia un mal final, pero lo que sigue es bueno (una canción solo para ellos). El público no sabe si alegrarse." },
          { id: "b", texto: "That's all.", calidad: 1, porque: "Dices que se acabó… y sigues contando, sin decir qué sentiste. Una reaction phrase («I couldn't believe it!», «I was so relieved!») le da cierre emocional." },
          { id: "c", texto: "I couldn't believe it!", calidad: 2, porque: "Reaction phrase: dice cómo te sentiste al final. Junto con «it taught me…», el público se va con la emoción y la lección." },
        ],
      },
      {
        id: "verbo",
        etiqueta: "Tiempo verbal (play)",
        opciones: [
          { id: "a", texto: "played", calidad: 2, porque: "Past simple: la canción es un evento completo del cierre." },
          { id: "b", texto: "was playing", calidad: 1, porque: "Past continuous: suena a fondo en progreso, como si la canción fuera el inicio de otra escena, no el cierre." },
          { id: "c", texto: "plays", calidad: 0, porque: "Presente (plays): el final cambia de tiempo y suena a costumbre, no a lo que pasó ese día." },
        ],
      },
    ],
  },
];

export const BEAT: Record<BeatId, BeatSim> = Object.fromEntries(BEATS.map((b) => [b.id, b])) as Record<BeatId, BeatSim>;

/** Clave de la elección de un hueco: `beat.slot`. */
export const claveSlot = (beat: BeatId, slot: string) => `${beat}.${slot}`;
export type Eleccion = Record<string, string>;

/** El borrador de Leo: se entiende a medias y está desordenado. */
export const ORDEN_BORRADOR: BeatId[] = ["apertura", "escena", "complicacion", "resolucion", "climax", "reaccion"];
export const ELECCION_BORRADOR: Eleccion = {
  "apertura.opener": "a",
  "escena.detalle": "b",
  "escena.verbo": "b",
  "complicacion.conector": "a",
  "complicacion.verbo": "c",
  "climax.conector": "a",
  "climax.verbo": "a",
  "resolucion.conector": "a",
  "resolucion.verbo": "b",
  "reaccion.reaccion": "b",
  "reaccion.verbo": "a",
};

export function opcionElegida(eleccion: Eleccion, beat: BeatSim, slot: SlotSim): OpcionSlot {
  const id = eleccion[claveSlot(beat.id, slot.id)];
  return slot.opciones.find((o) => o.id === id) ?? slot.opciones[0]!;
}

/** La oración de la parte, con lo elegido en cada hueco. */
export function oracionDe(eleccion: Eleccion, beat: BeatSim): string {
  let s = beat.plantilla;
  for (const slot of beat.slots) s = s.replace(`{${slot.id}}`, opcionElegida(eleccion, beat, slot).texto);
  return s;
}

/* ── El público ────────────────────────────────────────────────────────── */

export const ATENCION_INICIAL = 40;
export const UMBRAL_OVACION = 90;
/** Cuánto mueve la atención cada calidad de hueco (simulación). */
export const DELTA: Record<Calidad, number> = { 2: 5, 1: -2, 0: -10 };
export const CASTIGO_DESORDEN = 12;
export const PREMIO_ORDEN = 5;

const POR_QUE_DESORDEN: Record<BeatId, string> = {
  apertura: "",
  escena: "el público oye detalles sin saber que viene una historia; la apertura va primero para captar la atención.",
  complicacion: "el problema llega sin contexto: nadie sabe todavía cuándo, dónde ni con quién pasó.",
  climax: "el momento cumbre llega antes de que exista el problema: no hay tensión que resolver.",
  resolucion: "spoiler: el público ya sabe cómo terminó y deja de escuchar lo que falta.",
  reaccion: "reaccionas a algo que el público todavía no conoce.",
};

export interface PasoEval {
  beat: BeatId;
  delta: number;
  /** Atención después de contar esta parte (0–100). */
  atencion: number;
  /** Si la parte se contó ANTES que otra que debía ir primero. */
  adelantado: { antesDe: BeatId; porque: string } | null;
  /** La elección más débil de la parte, para explicar la reacción. */
  peor: OpcionSlot;
}

export interface Evaluacion {
  pasos: PasoEval[];
  /** Atención al inicio y después de cada parte. */
  curva: number[];
  final: number;
  enOrden: boolean;
  buenas: number;
  regulares: number;
  malas: number;
}

const acota = (n: number) => Math.max(0, Math.min(100, n));

export function evaluar(orden: BeatId[], eleccion: Eleccion): Evaluacion {
  let att = ATENCION_INICIAL;
  const curva = [att];
  const pasos: PasoEval[] = [];
  let buenas = 0;
  let regulares = 0;
  let malas = 0;
  let enOrden = true;

  orden.forEach((id, pos) => {
    const beat = BEAT[id];
    let delta = 0;
    let peor: OpcionSlot | null = null;
    for (const slot of beat.slots) {
      const op = opcionElegida(eleccion, beat, slot);
      delta += DELTA[op.calidad];
      if (op.calidad === 2) buenas++;
      else if (op.calidad === 1) regulares++;
      else malas++;
      if (!peor || op.calidad < peor.calidad) peor = op;
    }
    // ¿Alguna parte que debía ir ANTES se cuenta después de ésta?
    const despues = orden.slice(pos + 1).map((b) => BEAT[b]).filter((b) => b.canon < beat.canon);
    let adelantado: PasoEval["adelantado"] = null;
    if (despues.length > 0) {
      enOrden = false;
      const primero = despues.reduce((a, b) => (b.canon < a.canon ? b : a));
      adelantado = { antesDe: primero.id, porque: POR_QUE_DESORDEN[id] };
      delta -= CASTIGO_DESORDEN;
    }
    att = acota(att + delta);
    curva.push(att);
    pasos.push({ beat: id, delta, atencion: att, adelantado, peor: peor! });
  });

  if (enOrden) {
    att = acota(att + PREMIO_ORDEN);
    curva[curva.length - 1] = att;
    const ult = pasos[pasos.length - 1];
    if (ult) ult.atencion = att;
  }

  return { pasos, curva, final: att, enOrden, buenas, regulares, malas };
}

export interface Veredicto {
  titulo: string;
  texto: string;
  icono: string;
  color: string;
}

export function veredictoDe(att: number): Veredicto {
  if (att >= UMBRAL_OVACION)
    return { titulo: "¡Ovación de pie!", texto: "Apertura que engancha, escena clara, problema, clímax, cierre y reacción, todo en orden y en pasado: el público no despegó la vista.", icono: "fa-hands-clapping", color: "#34D399" };
  if (att >= 65)
    return { titulo: "Aplauso de cortesía", texto: "La historia se entiende, pero algunas partes pierden fuerza. Revisa las que restan atención.", icono: "fa-face-smile", color: "#FFC75A" };
  if (att >= 40)
    return { titulo: "Varios sacan el celular", texto: "El público se pierde en algunas partes: tiempos que cambian, conectores que dicen otra cosa o partes fuera de lugar.", icono: "fa-mobile-screen-button", color: "#FF9F5A" };
  return { titulo: "Público perdido", texto: "Sin escena, sin orden o con tiempos en presente, nadie puede seguir la historia.", icono: "fa-face-dizzy", color: "#FF5E5E" };
}

export type EstadoCara = "encantado" | "atento" | "distraido" | "perdido";

/** Ocho personas, cada una con su propia paciencia (umbral). */
export const PUBLICO: { umbral: number; tono: number }[] = [
  { umbral: 12, tono: 28 },
  { umbral: 22, tono: 200 },
  { umbral: 32, tono: 330 },
  { umbral: 44, tono: 150 },
  { umbral: 54, tono: 45 },
  { umbral: 64, tono: 265 },
  { umbral: 74, tono: 5 },
  { umbral: 86, tono: 180 },
];

export function caraDe(att: number, umbral: number): EstadoCara {
  if (att >= umbral + 10) return "encantado";
  if (att >= umbral) return "atento";
  if (att >= umbral - 15) return "distraido";
  return "perdido";
}

export const CARA_INFO: Record<EstadoCara, { icono: string; color: string; etiqueta: string }> = {
  encantado: { icono: "fa-face-grin-stars", color: "#34D399", etiqueta: "Encantado" },
  atento: { icono: "fa-face-smile", color: "#7FD1FF", etiqueta: "Atento" },
  distraido: { icono: "fa-face-meh", color: "#FFC75A", etiqueta: "Distraído" },
  perdido: { icono: "fa-mobile-screen-button", color: "#FF5E5E", etiqueta: "En el celular" },
};

/** Lo que murmura el público al oír una parte (inglés sencillo). */
export function murmulloDe(paso: PasoEval): string {
  if (paso.adelantado) return "Hold on… did that already happen?";
  if (paso.peor.calidad === 0) return "Wait, what?";
  if (paso.peor.calidad === 1) return "Hmm, okay…";
  return "Ooh… and then what?";
}

/* ── «Tell your own»: el analizador del texto del alumno ───────────────── */

const IRREGULARES = new Set([
  "ran", "fell", "dropped", "saw", "heard", "found", "met", "went", "came", "said", "took", "got", "left", "made",
  "had", "told", "felt", "gave", "knew", "thought", "bought", "caught", "began", "broke", "lost", "sat", "stood",
  "won", "wrote", "ate", "drank", "drove", "flew", "forgot", "kept", "paid", "sent", "sang", "spoke", "spent",
  "threw", "understood", "woke", "wore", "did", "brought", "chose", "hid", "rode", "rang", "shook", "slept",
  "stole", "swam", "taught", "tore", "became", "built", "fought", "grew", "held", "led", "meant", "sold",
  // Ambiguos con el presente (put, hit, read, let…) quedan fuera a propósito:
  // contarlos inflaría el recuento con «I like to read».
]);
const NO_PASADO = new Set(["need", "red", "bed", "seed", "speed", "shed", "hundred", "sacred", "naked", "wicked", "feed", "weed", "indeed", "breed"]);
const ING_NO_VERBO = new Set([
  "nothing", "something", "anything", "everything", "morning", "evening", "boring", "amazing", "interesting", "exciting",
  "surprising", "relaxing", "shocking", "annoying", "embarrassing", "terrifying", "frightening", "thing", "king", "ring",
  "spring", "building", "ceiling", "wedding", "pudding", "sibling", "darling", "charming", "stunning",
]);
const CONECTORES = new Set([
  "then", "suddenly", "eventually", "while", "when", "finally", "first", "later", "luckily", "unfortunately",
  "all of a sudden", "at that moment", "after that", "in the end", "out of nowhere", "to my surprise",
]);

export type TipoMarca = "continuo" | "simple" | "conector";
export interface Segmento {
  t: string;
  tipo: TipoMarca | null;
}

const TOKENS = /\b(?:was|were)(?:n't)?\s+(?:not\s+)?[a-z]+ing\b|\b(?:all of a sudden|at that moment|after that|in the end|out of nowhere|to my surprise)\b|\b[a-z][a-z']*\b/gi;

function tipoDe(token: string): TipoMarca | null {
  const t = token.toLowerCase();
  const cont = t.match(/^(?:was|were)(?:n't)?\s+(?:not\s+)?([a-z]+ing)$/);
  if (cont) return ING_NO_VERBO.has(cont[1]!) ? "simple" : "continuo";
  if (CONECTORES.has(t)) return "conector";
  if (t === "was" || t === "were" || t === "wasn't" || t === "weren't") return "simple";
  if (IRREGULARES.has(t)) return "simple";
  if (t.length >= 4 && t.endsWith("ed") && !NO_PASADO.has(t)) return "simple";
  return null;
}

/** El texto partido en trozos marcados (para pintarlo) — la misma lectura que cuenta. */
export function marcar(texto: string): Segmento[] {
  const out: Segmento[] = [];
  let ultimo = 0;
  const push = (t: string, tipo: TipoMarca | null) => {
    if (!t) return;
    const prev = out[out.length - 1];
    if (prev && prev.tipo === null && tipo === null) prev.t += t;
    else out.push({ t, tipo });
  };
  for (const m of texto.matchAll(TOKENS)) {
    const i = m.index ?? 0;
    push(texto.slice(ultimo, i), null);
    push(m[0], tipoDe(m[0]));
    ultimo = i + m[0].length;
  }
  push(texto.slice(ultimo), null);
  return out;
}

export interface Analisis {
  palabras: number;
  continuos: number;
  simples: number;
  conectores: number;
  inesperado: boolean;
  desenlace: boolean;
  estructura: boolean;
  apertura: boolean;
  reaccion: boolean;
  /** Los 4 criterios de A3, en su orden. */
  criterios: [boolean, boolean, boolean, boolean];
  largo: boolean;
  completo: boolean;
  atencion: number;
}

const RE_INESPERADO = /\b(suddenly|all of a sudden|at that moment|unexpectedly|out of nowhere|to my surprise)\b/i;
const RE_WHEN = /\b(?:was|were)\s+[a-z]+ing\b[^.!?]*?\b(when)\b/i;
const RE_DESENLACE = /\b(in the end|eventually|finally|luckily|unfortunately|at the end)\b/i;
const RE_CONTINUO = /\b(?:was|were)(?:n't)?\s+(?:not\s+)?[a-z]+ing\b/i;
const RE_APERTURA = /\b(you won't believe|you will never believe|the funniest thing|guess what|let me tell you)\b/i;
const RE_REACCION = /\b(couldn't believe|could not believe|so relieved|hilarious|so happy|so scared|so embarrassed|it taught me|i learned)\b/i;

export function analizarTexto(texto: string): Analisis {
  const segs = marcar(texto);
  const palabras = (texto.match(/[\p{L}']+/gu) ?? []).length;
  const continuos = segs.filter((s) => s.tipo === "continuo").length;
  const simples = segs.filter((s) => s.tipo === "simple").length;
  const conectores = segs.filter((s) => s.tipo === "conector").length;

  const iCont = texto.search(RE_CONTINUO);
  const mIn = texto.match(RE_INESPERADO);
  const mWhen = texto.match(RE_WHEN);
  const posIn = [mIn?.index, mWhen && mWhen.index !== undefined ? mWhen.index + mWhen[0].length - 4 : undefined].filter(
    (n): n is number => n !== undefined
  );
  const iIn = posIn.length ? Math.min(...posIn) : -1;
  const iFin = texto.search(RE_DESENLACE);

  const inesperado = iIn >= 0;
  const desenlace = iFin >= 0;
  const estructura = iCont >= 0 && inesperado && desenlace && iCont <= iIn && iIn < iFin;
  const criterios: [boolean, boolean, boolean, boolean] = [continuos >= 2, simples >= 4, inesperado, estructura];
  const largo = palabras >= 80;
  const completo = criterios.every(Boolean) && largo;
  const atencion = Math.min(100, 20 + criterios.filter(Boolean).length * 15 + Math.min(20, Math.floor((palabras / 80) * 20)));

  return {
    palabras,
    continuos,
    simples,
    conectores,
    inesperado,
    desenlace,
    estructura,
    apertura: RE_APERTURA.test(texto),
    reaccion: RE_REACCION.test(texto),
    criterios,
    largo,
    completo,
    atencion,
  };
}

/** Frases para empezar (de las pistas de A3 y del glosario A5): se tocan y se agregan al texto. */
export const ARRANQUES = [
  "You won't believe what happened to me last Friday!",
  "I was walking to school when",
  "We were eating tacos when suddenly",
  "a dog ran past me.",
  "At that moment,",
  "All of a sudden,",
  "In the end,",
  "I couldn't believe it!",
];

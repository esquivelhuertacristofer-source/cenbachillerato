/**
 * Modelo del SIMULADOR «Helpline» del lab consejos-ingles (IN-IV-P04).
 *
 * Los cuatro adolescentes son FICTICIOS. Las estructuras de consejo (should,
 * shouldn't, imperatives, If I were you, Have you thought about, Why don't you)
 * y las expresiones de empatía son las de la propia progresión; los puntos de
 * ánimo (0–100) son una simulación para ver el efecto de cada consejo.
 *
 * Determinista: el mismo consejo siempre produce la misma reacción.
 */

export type FraseId = "should" | "shouldnt" | "dont" | "imper" | "ifiwere" | "thought" | "whydont" | "shouldto" | "shoulds" | "must" | "was";
export type OpenerId = "none" | "tough" | "understand" | "cold";

export interface Frase {
  id: FraseId;
  /** Texto del botón. */
  etiqueta: string;
  /** ¿Recomienda hacer (+) o aconseja en contra (−)? */
  negativa: boolean;
  /** Forma gramatical incorrecta. */
  error: boolean;
  /** Sugerencia empática (da un bono de ánimo). */
  empatica: boolean;
  /** Pide el verbo con -ing. */
  ing: boolean;
}

export const FRASES: Frase[] = [
  { id: "should", etiqueta: "You should + verb", negativa: false, error: false, empatica: false, ing: false },
  { id: "shouldnt", etiqueta: "You shouldn't + verb", negativa: true, error: false, empatica: false, ing: false },
  { id: "dont", etiqueta: "Don't + verb", negativa: true, error: false, empatica: false, ing: false },
  { id: "imper", etiqueta: "Verb (imperative)", negativa: false, error: false, empatica: false, ing: false },
  { id: "ifiwere", etiqueta: "If I were you, I would + verb", negativa: false, error: false, empatica: true, ing: false },
  { id: "thought", etiqueta: "Have you thought about + verb-ing?", negativa: false, error: false, empatica: true, ing: true },
  { id: "whydont", etiqueta: "Why don't you + verb?", negativa: false, error: false, empatica: true, ing: false },
  { id: "shouldto", etiqueta: "You should to + verb", negativa: false, error: true, empatica: false, ing: false },
  { id: "shoulds", etiqueta: "You shoulds + verb", negativa: false, error: true, empatica: false, ing: false },
  { id: "was", etiqueta: "If I was you, I would + verb", negativa: false, error: true, empatica: false, ing: false },
  { id: "must", etiqueta: "You must + verb", negativa: false, error: false, empatica: false, ing: false },
];

export const OPENERS: { id: OpenerId; texto: string }[] = [
  { id: "none", texto: "(sin saludo)" },
  { id: "tough", texto: "That must be tough." },
  { id: "understand", texto: "I understand." },
  { id: "cold", texto: "That's your problem." },
];

export interface Accion {
  id: string;
  base: string;
  ing: string;
  /** hacer = conviene recomendarla; evitar = conviene aconsejar en contra. */
  tipo: "hacer" | "evitar";
}

export interface Adolescente {
  id: string;
  nombre: string;
  edad: number;
  mensaje: string;
  /** clave de imagen: /media/labs-sim/consejos-ingles/<clave>.webp */
  imagen: string;
  icono: string;
  acciones: Accion[];
}

export const ADOLESCENTES: Adolescente[] = [
  {
    id: "ana",
    nombre: "Ana",
    edad: 16,
    mensaje: "I'm really stressed about my exams. What do you think I should do?",
    imagen: "ana-escritorio",
    icono: "fa-book-open-reader",
    acciones: [
      { id: "plan", base: "make a study plan", ing: "making a study plan", tipo: "hacer" },
      { id: "grupo", base: "study with a group", ing: "studying with a group", tipo: "hacer" },
      { id: "dormir", base: "sleep at least 8 hours", ing: "sleeping at least 8 hours", tipo: "hacer" },
      { id: "noche", base: "stay up all night before an exam", ing: "staying up all night before an exam", tipo: "evitar" },
    ],
  },
  {
    id: "diego",
    nombre: "Diego",
    edad: 15,
    mensaje: "I feel tired all day. I always skip breakfast and I eat junk food at lunch.",
    imagen: "diego-cocina",
    icono: "fa-bowl-food",
    acciones: [
      { id: "agua", base: "drink more water", ing: "drinking more water", tipo: "hacer" },
      { id: "fruta", base: "eat more fruit and vegetables", ing: "eating more fruit and vegetables", tipo: "hacer" },
      { id: "desayuno", base: "skip breakfast", ing: "skipping breakfast", tipo: "evitar" },
      { id: "chatarra", base: "eat too much junk food", ing: "eating too much junk food", tipo: "evitar" },
    ],
  },
  {
    id: "valeria",
    nombre: "Valeria",
    edad: 16,
    mensaje: "I don't understand the lesson and I'm afraid to ask. I use my phone in class so I don't look lost.",
    imagen: "valeria-salon",
    icono: "fa-chalkboard-user",
    acciones: [
      { id: "maestro", base: "talk to your teacher", ing: "talking to your teacher", tipo: "hacer" },
      { id: "estudio", base: "join the study group", ing: "joining the study group", tipo: "hacer" },
      { id: "celular", base: "use your phone during class", ing: "using your phone during class", tipo: "evitar" },
      { id: "treinta", base: "study for at least 30 minutes every day", ing: "studying for at least 30 minutes every day", tipo: "hacer" },
    ],
  },
  {
    id: "mateo",
    nombre: "Mateo",
    edad: 17,
    mensaje: "I feel overwhelmed. I have too much homework. What do you think I should do?",
    imagen: "mateo-tarea",
    icono: "fa-laptop-file",
    acciones: [
      { id: "pausa", base: "take a short break and then continue", ing: "taking a short break and then continuing", tipo: "hacer" },
      { id: "ayuda", base: "ask for help", ing: "asking for help", tipo: "hacer" },
      { id: "nochetoda", base: "stay up all night", ing: "staying up all night", tipo: "evitar" },
      { id: "treinta", base: "study for at least 30 minutes every day", ing: "studying for at least 30 minutes every day", tipo: "hacer" },
    ],
  },
];

export const ANIMO_INICIO = 30;
export const ANIMO_META = 80;

export type Veredicto = "bien" | "confuso" | "danino" | "fuerte";

export interface Resultado {
  texto: string;
  delta: number;
  veredicto: Veredicto;
  /** Lo que contesta el adolescente (inglés sencillo). */
  reaccion: string;
  /** Por qué, en español. */
  explica: string;
  empatica: boolean;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function armarTexto(opener: OpenerId, frase: Frase, a: Accion): string {
  const v = frase.ing ? a.ing : a.base;
  const nucleo: Record<FraseId, string> = {
    should: `You should ${v}.`,
    shouldnt: `You shouldn't ${v}.`,
    dont: `Don't ${v}.`,
    imper: `${cap(v)}.`,
    ifiwere: `If I were you, I would ${v}.`,
    thought: `Have you thought about ${v}?`,
    whydont: `Why don't you ${v}?`,
    shouldto: `You should to ${v}.`,
    shoulds: `You shoulds ${v}.`,
    was: `If I was you, I would ${v}.`,
    must: `You must ${v}.`,
  };
  const ap = OPENERS.find((o) => o.id === opener)?.texto ?? "";
  return opener === "none" ? nucleo[frase.id] : `${ap} ${nucleo[frase.id]}`;
}

export function evaluar(a: Accion, frase: Frase, opener: OpenerId): Resultado {
  const texto = armarTexto(opener, frase, a);
  const apertura = opener === "tough" || opener === "understand" ? 8 : opener === "cold" ? -12 : 0;
  const aperturaTxt =
    opener === "cold"
      ? " Además, «That's your problem» no muestra empatía: antes de aconsejar usa «That must be tough» o «I understand»."
      : opener === "none"
        ? ""
        : " Empezar con empatía («That must be tough / I understand») suma ánimo.";

  // 1) Forma incorrecta: el otro no entiende bien el consejo.
  if (frase.error) {
    const regla =
      frase.id === "shouldto"
        ? "«Should» es un verbo modal: va seguido del verbo base SIN «to» (You should eat, no «should to»)."
        : frase.id === "shoulds"
          ? "Los verbos modales no llevan -s en tercera persona: se dice «You should», nunca «shoulds»."
          : "En el condicional II se usa «were» con todos los sujetos: «If I were you, I would…», no «was».";
    return { texto, delta: -8 + apertura, veredicto: "confuso", reaccion: "Sorry… I don't understand. Is that correct English?", explica: `La forma confunde a quien te escucha. ${regla}${aperturaTxt}`, empatica: false };
  }

  // 2) Contenido que perjudica: recomendar lo que no conviene o prohibir lo que sí.
  const daña = a.tipo === "evitar" ? !frase.negativa : frase.negativa;
  if (daña) {
    const que =
      a.tipo === "evitar"
        ? `Recomendaste algo que perjudica («${a.base}»). Para lo que NO conviene hay que aconsejar en contra: You shouldn't… o Don't…`
        : `Le aconsejaste en contra de algo que sí le ayuda («${a.base}»). Para recomendar usa You should…, Why don't you…? o If I were you, I would…`;
    return { texto, delta: -22 + apertura, veredicto: "danino", reaccion: "Really? That sounds like it will make things worse.", explica: `${que}${aperturaTxt}`, empatica: false };
  }

  // 3) «Must»: gramaticalmente correcto, pero impositivo.
  if (frase.id === "must") {
    return {
      texto,
      delta: -6 + apertura,
      veredicto: "fuerte",
      reaccion: "Wow, that sounds like an order. I feel pressured.",
      explica: `«Must» es más fuerte e impositivo; «should» o «Why don't you…?» suenan más empáticos.${aperturaTxt}`,
      empatica: false,
    };
  }

  // 4) Buen consejo.
  const bono = frase.empatica ? 6 : 0;
  const forma =
    frase.id === "thought"
      ? "«Have you thought about + verb-ing?» es una sugerencia amable que invita a reflexionar."
      : frase.id === "whydont"
        ? "«Why don't you + verb?» es una sugerencia informal y amistosa."
        : frase.id === "ifiwere"
          ? "«If I were you, I would…» es un consejo empático (condicional II)."
          : frase.id === "should"
            ? "«You should + verbo base» recomienda una acción."
            : frase.id === "shouldnt"
              ? "«You shouldn't + verbo base» aconseja en contra de una acción."
              : frase.id === "dont"
                ? "Los imperativos negativos (Don't + verbo base) dan un consejo directo."
                : "El imperativo da una instrucción directa.";
  return {
    texto,
    delta: 20 + bono + apertura,
    veredicto: "bien",
    reaccion: frase.empatica ? "Oh, thank you! That's a really kind idea. I feel better." : "Thanks! That makes sense. I'll try it.",
    explica: `${forma}${aperturaTxt}`,
    empatica: frase.empatica,
  };
}

export const aplicarAnimo = (animo: number, delta: number) => Math.max(0, Math.min(100, animo + delta));

export function caraDe(animo: number): { icono: string; color: string; texto: string } {
  if (animo >= ANIMO_META) return { icono: "fa-face-grin-beam", color: "#34D399", texto: "Feeling great" };
  if (animo >= 55) return { icono: "fa-face-smile", color: "#A3E635", texto: "Feeling better" };
  if (animo >= 30) return { icono: "fa-face-meh", color: "#FBBF24", texto: "Not sure" };
  return { icono: "fa-face-frown", color: "#F87171", texto: "Worried" };
}

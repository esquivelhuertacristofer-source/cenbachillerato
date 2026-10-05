/**
 * Simulador «First day at the English club» (IN-I-P01): lógica pura, sin React.
 *
 * Situación social ramificada: Ana (el alumno) llega a un club de inglés y debe
 * saludar, presentarse y presentar a otros. Cada respuesta cambia la reacción
 * ilustrada de los personajes y la línea del siguiente personaje. Todos los
 * personajes son FICTICIOS. Las expresiones son las de las actividades A1/A2/A4
 * (Hello / Good morning, My name is…, This is…, Nice to meet you, See you later).
 */

export type PersonajeId = "torres" | "valeria" | "diego";
export type Animo = "feliz" | "neutral" | "confuso";

export const PERSONAJES: Record<PersonajeId, { nombre: string; rol: string; foto: string; color: string }> = {
  torres: { nombre: "Ms. Torres", rol: "coordinadora del club", foto: "torres", color: "#5BA8FF" },
  valeria: { nombre: "Valeria", rol: "compañera", foto: "valeria", color: "#F2A33C" },
  diego: { nombre: "Diego", rol: "tu amigo", foto: "diego", color: "#34D399" },
};

export const ANIMO_INFO: Record<Animo, { etiqueta: string; icono: string; color: string }> = {
  feliz: { etiqueta: "Contenta", icono: "fa-face-grin-beam", color: "#34D399" },
  neutral: { etiqueta: "Normal", icono: "fa-face-meh", color: "#8FA3BF" },
  confuso: { etiqueta: "Confundida", icono: "fa-face-dizzy", color: "#FF5E5E" },
};

export interface OpcionSim {
  id: string;
  texto: string;
  /** 2 = natural y correcta · 1 = comprensible pero poco adecuada · 0 = error. */
  puntos: 0 | 1 | 2;
  animo: Animo;
  porque: string;
}

export interface NodoSim {
  id: string;
  escena: "aula" | "patio" | "salida";
  habla: PersonajeId;
  presentes: PersonajeId[];
  /** Línea en inglés; puede cambiar según cómo respondió el alumno antes. */
  linea: (pts: Record<string, number>) => string;
  traduccion: string;
  opciones: OpcionSim[];
}

export const NODOS: NodoSim[] = [
  {
    id: "n1",
    escena: "aula",
    habla: "torres",
    presentes: ["torres"],
    linea: () => "Good morning! Welcome to the English club.",
    traduccion: "¡Buenos días! Bienvenida al club de inglés.",
    opciones: [
      { id: "a", texto: "Good morning! I am Ana.", puntos: 2, animo: "feliz", porque: "«Good morning» es un saludo formal, ideal con una maestra, y «I am» es la forma correcta con I." },
      { id: "b", texto: "Hey! What's up?", puntos: 1, animo: "neutral", porque: "«Hey» es informal: con amigos va bien, pero con una maestra conviene «Good morning»." },
      { id: "c", texto: "Goodbye!", puntos: 0, animo: "confuso", porque: "«Goodbye» es una despedida, no un saludo; Ms. Torres no entiende por qué te vas." },
    ],
  },
  {
    id: "n2",
    escena: "aula",
    habla: "torres",
    presentes: ["torres"],
    linea: (p) =>
      (p.n1 ?? 0) >= 2 ? "Nice to meet you, Ana. Where are you from?" : "I am Ms. Torres. Nice to meet you. Where are you from?",
    traduccion: "Mucho gusto. ¿De dónde eres?",
    opciones: [
      { id: "a", texto: "I am from Puebla.", puntos: 2, animo: "feliz", porque: "Con I se usa «am»: I am from… responde justo lo que se preguntó." },
      { id: "b", texto: "I is from Puebla.", puntos: 0, animo: "confuso", porque: "Con I siempre va «am», nunca «is»: I am (I'm)." },
      { id: "c", texto: "My name is Ana.", puntos: 1, animo: "neutral", porque: "Es una presentación válida, pero ella preguntó de dónde eres, no tu nombre." },
    ],
  },
  {
    id: "n3",
    escena: "patio",
    habla: "valeria",
    presentes: ["valeria"],
    linea: () => "Hi! I'm Valeria. I am from Guadalajara.",
    traduccion: "¡Hola! Soy Valeria. Soy de Guadalajara.",
    opciones: [
      { id: "a", texto: "Nice to meet you, Valeria!", puntos: 2, animo: "feliz", porque: "«Nice to meet you» es lo que se dice al conocer a alguien por primera vez." },
      { id: "b", texto: "See you later, Valeria.", puntos: 0, animo: "confuso", porque: "«See you later» es una despedida; acaban de conocerse." },
      { id: "c", texto: "Hello. My name is Ana.", puntos: 1, animo: "neutral", porque: "Te presentas bien, pero primero responde a su presentación con «Nice to meet you»." },
    ],
  },
  {
    id: "n4",
    escena: "patio",
    habla: "diego",
    presentes: ["valeria", "diego"],
    linea: (p) => ((p.n3 ?? 0) >= 2 ? "Hi, Ana! Who is she?" : "Hi, Ana! Um… who is she?"),
    traduccion: "¡Hola, Ana! ¿Quién es ella?",
    opciones: [
      { id: "a", texto: "This is Valeria. Valeria, this is Diego.", puntos: 2, animo: "feliz", porque: "Para presentar a alguien se usa «This is + nombre»; así los dos se conocen." },
      { id: "b", texto: "She are Valeria.", puntos: 0, animo: "confuso", porque: "Con She va «is»: She is Valeria. Además, para presentar es mejor «This is…»." },
      { id: "c", texto: "My name is Valeria.", puntos: 0, animo: "confuso", porque: "«My name is…» sirve para decir TU nombre; dirías que tú eres Valeria." },
    ],
  },
  {
    id: "n5",
    escena: "patio",
    habla: "valeria",
    presentes: ["valeria", "diego"],
    linea: (p) => ((p.n4 ?? 0) >= 2 ? "Nice to meet you, Diego! Where is he from?" : "Sorry, who is he? Where is he from?"),
    traduccion: "¡Mucho gusto, Diego! ¿De dónde es él?",
    opciones: [
      { id: "a", texto: "He is from Monterrey.", puntos: 2, animo: "feliz", porque: "Diego es hombre: He is… (3.ª persona singular lleva «is»)." },
      { id: "b", texto: "She is from Monterrey.", puntos: 0, animo: "confuso", porque: "She es para una mujer; Diego es un chico, así que es «He»." },
      { id: "c", texto: "I am from Monterrey.", puntos: 1, animo: "neutral", porque: "La forma «I am» es correcta, pero hablas de ti y no de Diego." },
    ],
  },
  {
    id: "n6",
    escena: "salida",
    habla: "torres",
    presentes: ["torres", "valeria", "diego"],
    linea: () => "Time for class! Goodbye, everyone.",
    traduccion: "¡Hora de clase! Adiós a todos.",
    opciones: [
      { id: "a", texto: "See you tomorrow!", puntos: 2, animo: "feliz", porque: "«See you tomorrow» es una despedida natural cuando se volverán a ver." },
      { id: "b", texto: "Good morning!", puntos: 0, animo: "confuso", porque: "«Good morning» es un saludo; ahora toca despedirse." },
      { id: "c", texto: "Nice to meet you!", puntos: 1, animo: "neutral", porque: "Es amable, pero se usa al conocer a alguien, no al irse." },
    ],
  },
];

export const PUNTOS_MAX = NODOS.length * 2;

export const ESCENAS: Record<NodoSim["escena"], { foto: string; titulo: string; icono: string }> = {
  aula: { foto: "escena-aula", titulo: "Salón del club", icono: "fa-chalkboard-user" },
  patio: { foto: "escena-patio", titulo: "Patio de la escuela", icono: "fa-tree" },
  salida: { foto: "escena-salida", titulo: "Pasillo, hora de salida", icono: "fa-door-open" },
};

/** Cómo reacciona cada personaje presente ante la respuesta del alumno. */
export function animosDe(nodo: NodoSim, op: OpcionSim): Record<string, Animo> {
  const out: Record<string, Animo> = {};
  for (const p of nodo.presentes) {
    if (p === nodo.habla) out[p] = op.animo;
    else out[p] = op.animo === "confuso" ? "neutral" : op.animo;
  }
  return out;
}

export interface FinalSim {
  titulo: string;
  texto: string;
  icono: string;
  color: string;
}

export function finalDe(total: number): FinalSim {
  if (total >= 11) return { titulo: "Great first day!", texto: "Saludaste, te presentaste y presentaste a otros con naturalidad: ya tienes amigos en el club.", icono: "fa-champagne-glasses", color: "#34D399" };
  if (total >= 7) return { titulo: "Nice try!", texto: "Te hicieron entender y fuiste amable, pero algunas frases sonaron raras. Repasa en qué fallaron.", icono: "fa-face-smile", color: "#5BA8FF" };
  return { titulo: "Awkward day…", texto: "Varias frases confundieron a los demás. Reinicia la escena y fíjate en la función de cada expresión.", icono: "fa-face-meh", color: "#F2A33C" };
}

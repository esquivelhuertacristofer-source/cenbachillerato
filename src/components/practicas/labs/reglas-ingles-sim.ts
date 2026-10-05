/**
 * Lógica pura del simulador «Mia's school day» (IN-III-P05, Rules).
 *
 * Mia es una estudiante de intercambio FICTICIA. En cada situación el alumno
 * escribe la regla con un modal (must / mustn't / have to / don't have to) y
 * Mia ACTÚA según la regla elegida: lo que hace —y lo que le pasa— cambia de
 * verdad con el modal. Así se ve la diferencia clave de la progresión:
 * «mustn't» (prohibido) ≠ «don't have to» (no es necesario).
 *
 * Las cifras (minutos, avisos) son de simulación.
 */
import type { Modal } from "./reglas-ingles-data";

export const MODALES: Modal[] = ["must", "mustnt", "haveto", "donthaveto"];

export type Veredicto = "seguro" | "matiz" | "sancion" | "esfuerzo" | "perdida";

export interface Situacion {
  id: string;
  lugar: string;
  icono: string;
  /** Clave de la imagen en /media/labs-sim/reglas-ingles/<clave>.webp */
  imagen: string;
  titulo: string;
  contexto: string;
  /** Sujeto de la frase; con «Mia» el modal va en tercera persona. */
  antes: string;
  tercera: boolean;
  despues: string;
  correcta: Modal;
  /** Por qué, en español. */
  porque: string;
  /** Cuando must y have to son ambas obligación: matiz en español. */
  matiz?: string;
  res: { seguro: string; sancion?: string; esfuerzo?: string; perdida?: string };
}

export const SITUACIONES: Situacion[] = [
  {
    id: "biblioteca",
    lugar: "Library",
    icono: "fa-book-open-reader",
    imagen: "biblioteca",
    titulo: "A snack in the library",
    contexto: "The books are very old and food brings ants. Mia is hungry and has a sandwich in her bag.",
    antes: "You",
    tercera: false,
    despues: "eat in the library.",
    correcta: "mustnt",
    porque: "Comer ahí está prohibido: «mustn't». No es lo mismo que «don't have to», que diría que no es necesario pero que sí se puede.",
    res: {
      seguro: "Mia kept her sandwich in her bag and ate it outside. The librarian smiled.",
      sancion: "Mia ate her sandwich at the reading table. Crumbs fell on an old book and the librarian gave her a warning!",
    },
  },
  {
    id: "alberca",
    lugar: "Swimming pool",
    icono: "fa-person-swimming",
    imagen: "alberca",
    titulo: "The pool manager's rule",
    contexto: "The pool manager made a rule for the whole swimming club: everyone puts on a swim cap before getting in the water. No exceptions.",
    antes: "You",
    tercera: false,
    despues: "wear a swim cap in the pool.",
    correcta: "haveto",
    porque: "La obligación viene de una regla externa (el encargado de la alberca): «have to».",
    matiz: "Casi: Mia hace lo correcto, pero «must» suena a la opinión fuerte de quien habla. Aquí la regla viene de fuera (el encargado), así que «have to» encaja mejor.",
    res: {
      seguro: "Mia put on her swim cap and jumped in. The lifeguard gave her a thumbs up.",
      sancion: "Mia dived in without a cap. The lifeguard blew her whistle and sent her out of the pool!",
    },
  },
  {
    id: "diccionario",
    lugar: "English class",
    icono: "fa-chalkboard-user",
    imagen: "salon-diccionario",
    titulo: "A dictionary for today",
    contexto: "Today's reading is easy. Leo has a big dictionary for the whole table and says Mia can use it if she wants.",
    antes: "Mia",
    tercera: true,
    despues: "bring a dictionary today.",
    correcta: "donthaveto",
    porque: "No es necesario, pero tampoco está prohibido: «doesn't have to». Puede traerlo o no.",
    res: {
      seguro: "Mia left her heavy dictionary at home and shared Leo's. Her bag was lighter and the class went well.",
      esfuerzo: "Mia spent 15 minutes going home for a dictionary she did not need, because Leo's was enough.",
      perdida: "Mia thought bringing a dictionary was forbidden, so she did without and could not check a word she liked.",
    },
  },
  {
    id: "laboratorio",
    lugar: "Chemistry lab",
    icono: "fa-flask",
    imagen: "laboratorio",
    titulo: "Safety first",
    contexto: "Ms. Reyes, the chemistry teacher, says firmly: «I insist. Safety is the most important thing in my lab. Goggles on, always.»",
    antes: "Students",
    tercera: false,
    despues: "wear safety goggles in the lab.",
    correcta: "must",
    porque: "Es una obligación fuerte que expresa la autoridad de quien habla (la maestra): «must».",
    matiz: "Casi: Mia hace lo correcto, pero «have to» se usa para reglas o necesidades de fuera. Aquí es la insistencia de la propia maestra, así que «must» encaja mejor.",
    res: {
      seguro: "Mia put on her goggles before touching anything. The experiment turned blue and her eyes stayed safe.",
      sancion: "Mia mixed the liquids without goggles. A splash hit her cheek and Ms. Reyes sent her to wash up!",
    },
  },
  {
    id: "rio",
    lugar: "Field trip",
    icono: "fa-water",
    imagen: "rio",
    titulo: "A day by the river",
    contexto: "The class visits a river. The guide explains that trash hurts the fish, and the water is the town's drinking source.",
    antes: "We",
    tercera: false,
    despues: "throw trash in the river.",
    correcta: "mustnt",
    porque: "Tirar basura al río está prohibido: «mustn't». «Don't have to» no sirve aquí, porque daría permiso de hacerlo si uno quiere.",
    res: {
      seguro: "Mia kept her wrapper in her pocket until she found a bin. The river stayed clean.",
      sancion: "Mia tossed her wrapper into the river. The guide fished it out and gave the whole group a long talk. Another warning!",
    },
  },
  {
    id: "viernes",
    lugar: "Casual Friday",
    icono: "fa-shirt",
    imagen: "viernes-salon",
    titulo: "Friday at school",
    contexto: "On Fridays the school lets everyone come in casual clothes. The tie belongs to the Monday-to-Thursday uniform only.",
    antes: "Mia",
    tercera: true,
    despues: "wear a tie on Fridays.",
    correcta: "donthaveto",
    porque: "El viernes no es necesario usar corbata, pero tampoco está prohibida: «doesn't have to».",
    res: {
      seguro: "Mia came in her favorite shirt, no tie. Nobody minded, and if she wanted a tie she could still wear one.",
      esfuerzo: "Mia spent ten minutes fixing a tie that nobody asked for on a Friday.",
      perdida: "Mia thought a tie was forbidden, so she left at home the nice one she wanted to wear.",
    },
  },
];

const OBLIGACION: Modal[] = ["must", "haveto"];
const esObligacion = (m: Modal) => OBLIGACION.includes(m);

/** El modal tal como se escribe en la frase de ESTA situación. */
export function formaModal(sit: Pick<Situacion, "tercera">, m: Modal): string {
  switch (m) {
    case "must":
      return "must";
    case "mustnt":
      return "mustn't";
    case "haveto":
      return sit.tercera ? "has to" : "have to";
    case "donthaveto":
      return sit.tercera ? "doesn't have to" : "don't have to";
  }
}

export function fraseCompleta(sit: Situacion, m: Modal): string {
  return `${sit.antes} ${formaModal(sit, m)} ${sit.despues}`;
}

export interface Resultado {
  veredicto: Veredicto;
  /** 2 exacto, 1 si solo matiza (must ↔ have to), 0 si falla. */
  puntos: 0 | 1 | 2;
  avisos: number;
  minutos: number;
  /** Lo que le pasa a Mia (en inglés). */
  texto: string;
  /** Por qué, en español. */
  explica: string;
  /** ¿Mia hizo la acción? */
  hizo: boolean;
}

function explicaError(correcta: Modal, elegida: Modal, sit: Situacion): string {
  if (correcta === "mustnt" && elegida === "donthaveto")
    return `«don't have to» dice que NO es necesario, o sea, que se puede hacer si se quiere. Pero aquí está prohibido, así que Mia lo hizo. ${sit.porque}`;
  if (correcta === "mustnt")
    return `«${formaModal(sit, elegida)}» dice que hay que hacerlo; Mia obedeció la regla equivocada. ${sit.porque}`;
  if (esObligacion(correcta) && elegida === "mustnt")
    return `«mustn't» prohíbe, pero aquí la acción es obligatoria; Mia no la hizo y le costó. ${sit.porque}`;
  if (esObligacion(correcta))
    return `«don't have to» dice que es opcional, así que Mia lo omitió y la regla sí la obligaba. ${sit.porque}`;
  if (elegida === "mustnt")
    return `«mustn't» prohíbe, pero esto solo era opcional: Mia se privó de algo permitido. ${sit.porque}`;
  return `«${formaModal(sit, elegida)}» obliga, pero esto no es necesario: Mia se esforzó de más. ${sit.porque}`;
}

/** Qué hace y qué le pasa a Mia con la regla que escribió el alumno. */
export function resolver(sit: Situacion, elegida: Modal): Resultado {
  const c = sit.correcta;
  if (elegida === c) {
    return {
      veredicto: "seguro",
      puntos: 2,
      avisos: 0,
      minutos: 0,
      texto: sit.res.seguro,
      explica: `Correcto. ${sit.porque}`,
      hizo: c !== "mustnt" && c !== "donthaveto",
    };
  }
  if (esObligacion(c) && esObligacion(elegida)) {
    return {
      veredicto: "matiz",
      puntos: 1,
      avisos: 0,
      minutos: 0,
      texto: sit.res.seguro,
      explica: sit.matiz ?? sit.porque,
      hizo: true,
    };
  }
  const hizo = elegida !== "mustnt" && elegida !== "donthaveto";
  // Correcta «donthaveto»: obligarla cuesta tiempo; prohibirla es una pérdida.
  if (c === "donthaveto") {
    const v: Veredicto = hizo ? "esfuerzo" : "perdida";
    return {
      veredicto: v,
      puntos: 0,
      avisos: 0,
      minutos: v === "esfuerzo" ? 15 : 10,
      texto: sit.res[v] ?? sit.res.seguro,
      explica: explicaError(c, elegida, sit),
      hizo,
    };
  }
  return {
    veredicto: "sancion",
    puntos: 0,
    avisos: 1,
    minutos: 0,
    texto: sit.res.sancion ?? sit.res.seguro,
    explica: explicaError(c, elegida, sit),
    hizo: c === "mustnt",
  };
}

export interface Dia {
  decididas: number;
  puntos: number;
  puntosMax: number;
  avisos: number;
  minutos: number;
  limpio: boolean;
}

/** Resumen del día de Mia a partir de la PRIMERA decisión de cada situación. */
export function resumenDia(elegidas: Record<string, Modal | undefined>): Dia {
  let decididas = 0;
  let puntos = 0;
  let avisos = 0;
  let minutos = 0;
  for (const s of SITUACIONES) {
    const e = elegidas[s.id];
    if (!e) continue;
    decididas++;
    const r = resolver(s, e);
    puntos += r.puntos;
    avisos += r.avisos;
    minutos += r.minutos;
  }
  return {
    decididas,
    puntos,
    puntosMax: SITUACIONES.length * 2,
    avisos,
    minutos,
    limpio: decididas === SITUACIONES.length && avisos === 0 && minutos === 0,
  };
}

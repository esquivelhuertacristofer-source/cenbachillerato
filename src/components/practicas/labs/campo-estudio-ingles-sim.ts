/**
 * Modelo del SIMULADOR del lab «campo-estudio-ingles» (IN-V-P01).
 *
 * TODO es ficticio: la «Feria de carreras del Bachillerato Sierra Azul», sus
 * anfitriones y sus visitantes. Los puntos de interés son valores de juego.
 *
 * 1. «Career fair». Cuatro estaciones misteriosas (A–D), cada una un lugar de
 *    trabajo con cuatro objetos. El alumno los observa, deduce el campo y arma
 *    la descripción con las seis frases del glosario A5. Cada ranura ofrece
 *    tres fragmentos: el correcto, uno que MEZCLA otro campo y —en las cuatro
 *    ranuras con regla— uno con la regla rota (my field ARE, involves TO care,
 *    related WITH, goal is TO IMPROVING).
 *    Tres visitantes escuchan; a cada uno le importan dos ranuras:
 *      interés = Σ(ranuras propias: correcta 50 · regla rota 25 · otro campo 0)
 *                − 15 × (ranuras de OTRO visitante que mezclan campo)
 *    Se registra con interés ≥ 80. Determinista: misma descripción, mismo
 *    resultado.
 * 2. «On stage». Valeria (ficticia) presenta medicina del deporte y el alumno
 *    elige el conector de cada oración. Cada conector equivocado deja a dos
 *    personas del público sin el hilo (12 butacas).
 */

export type CampoId = "nursing" | "software" | "agronomy" | "tourism";
export type RanuraId = "field" | "involves" | "where" | "tools" | "related" | "goal";
export type VisitanteId = "lucia" | "ortega" | "reyes";
export type Calidad = "ok" | "regla" | "mezcla";

export interface Objeto {
  id: string;
  icono: string;
  en: string;
  es: string;
  /** Para qué sirve, en inglés. */
  uso: string;
}

export interface Estacion {
  id: CampoId;
  letra: string;
  /** Nombre del campo en inglés (se revela al ganar la estación). */
  nombre: string;
  nombreEs: string;
  /** Categoría del vocabulario temático de A1. */
  area: string;
  icono: string;
  anfitrion: string;
  /** Lo que se ve en la escena, en español (para el pie de la foto). */
  escena: string;
  objetos: Objeto[];
  /** Fragmento correcto de cada ranura. */
  frases: Record<RanuraId, string>;
  /** Fragmento con la regla rota (solo en las ranuras con regla). */
  trampas: Partial<Record<RanuraId, string>>;
}

export const ESTACIONES: Estacion[] = [
  {
    id: "nursing",
    letra: "A",
    nombre: "nursing",
    nombreEs: "Enfermería",
    area: "health",
    icono: "fa-user-nurse",
    anfitrion: "Carmen Ibarra",
    escena: "Una sala de clínica con cama, tablilla y aparatos.",
    objetos: [
      { id: "stethoscope", icono: "fa-stethoscope", en: "stethoscope", es: "estetoscopio", uso: "It is used to listen to the heart and lungs." },
      { id: "thermometer", icono: "fa-temperature-half", en: "thermometer", es: "termómetro", uso: "It measures a patient's body temperature." },
      { id: "chart", icono: "fa-clipboard-list", en: "medical chart", es: "expediente clínico", uso: "It records the patient's symptoms and medicine." },
      { id: "bed", icono: "fa-bed-pulse", en: "hospital bed", es: "cama de hospital", uso: "Patients rest and recover here." },
    ],
    frases: {
      field: "is nursing",
      involves: "caring for patients and giving them medicine",
      where: "hospitals, clinics, and patients' homes",
      tools: "stethoscopes, thermometers, and medical charts",
      related: "to biology, chemistry, and human anatomy",
      goal: "to improve people's health and quality of life",
    },
    trampas: {
      field: "are nursing",
      involves: "to care for patients and give them medicine",
      related: "with biology, chemistry, and human anatomy",
      goal: "to improving people's health and quality of life",
    },
  },
  {
    id: "software",
    letra: "B",
    nombre: "software development",
    nombreEs: "Desarrollo de software",
    area: "technology",
    icono: "fa-laptop-code",
    anfitrion: "Diego Lara",
    escena: "Un escritorio con computadoras, servidores y un tablero de notas.",
    objetos: [
      { id: "laptop", icono: "fa-laptop", en: "laptop", es: "computadora portátil", uso: "Developers write and run their programs on it." },
      { id: "editor", icono: "fa-code", en: "code editor", es: "editor de código", uso: "It is the program where you write and fix code." },
      { id: "server", icono: "fa-server", en: "cloud server", es: "servidor en la nube", uso: "It keeps an app online for thousands of users." },
      { id: "board", icono: "fa-table-columns", en: "task board", es: "tablero de tareas", uso: "The team plans and tracks its work on it." },
    ],
    frases: {
      field: "is software development",
      involves: "writing, testing, and fixing code for apps",
      where: "offices, tech companies, or from home",
      tools: "laptops, code editors, and cloud servers",
      related: "to mathematics, logic, and computer science",
      goal: "to create apps that solve real-world problems",
    },
    trampas: {
      field: "are software development",
      involves: "to write, test, and fix code for apps",
      related: "with mathematics, logic, and computer science",
      goal: "to creating apps that solve real-world problems",
    },
  },
  {
    id: "agronomy",
    letra: "C",
    nombre: "agronomy",
    nombreEs: "Agronomía",
    area: "environment",
    icono: "fa-seedling",
    anfitrion: "Rosa Méndez",
    escena: "Un campo de cultivo junto a un invernadero.",
    objetos: [
      { id: "sensor", icono: "fa-gauge-simple", en: "soil sensor", es: "sensor de suelo", uso: "It measures water and nutrients in the soil." },
      { id: "drone", icono: "fa-helicopter", en: "drone", es: "dron", uso: "It flies over the field and takes photos of the crops." },
      { id: "microscope", icono: "fa-microscope", en: "microscope", es: "microscopio", uso: "It shows tiny insects and diseases on the leaves." },
      { id: "greenhouse", icono: "fa-warehouse", en: "greenhouse", es: "invernadero", uso: "Young plants grow here, protected from cold and pests." },
    ],
    frases: {
      field: "is agronomy",
      involves: "testing soil and planning healthy crops",
      where: "farms, greenhouses, and research labs",
      tools: "soil sensors, drones, and microscopes",
      related: "to ecology, botany, and soil science",
      goal: "to grow more food and protect the soil",
    },
    trampas: {
      field: "are agronomy",
      involves: "to test soil and plan healthy crops",
      related: "with ecology, botany, and soil science",
      goal: "to growing more food and protecting the soil",
    },
  },
  {
    id: "tourism",
    letra: "D",
    nombre: "tourism",
    nombreEs: "Turismo",
    area: "business",
    icono: "fa-suitcase-rolling",
    anfitrion: "Tomás Herrera",
    escena: "El vestíbulo de un hotel con mostrador, maletas y un mapa.",
    objetos: [
      { id: "map", icono: "fa-map-location-dot", en: "map", es: "mapa", uso: "Guides use it to plan routes for a group." },
      { id: "mic", icono: "fa-microphone", en: "portable microphone", es: "micrófono portátil", uso: "A guide speaks to a big group on a tour with it." },
      { id: "tablet", icono: "fa-tablet-screen-button", en: "booking app", es: "aplicación de reservaciones", uso: "It saves rooms, tickets, and tours for visitors." },
      { id: "suitcase", icono: "fa-suitcase", en: "suitcase", es: "maleta", uso: "Travelers carry their clothes in it." },
    ],
    frases: {
      field: "is tourism",
      involves: "planning trips and guiding visitors",
      where: "hotels, airports, and travel agencies",
      tools: "maps, booking apps, and portable microphones",
      related: "to geography, history, and foreign languages",
      goal: "to give visitors safe and memorable experiences",
    },
    trampas: {
      field: "are tourism",
      involves: "to plan trips and guide visitors",
      related: "with geography, history, and foreign languages",
      goal: "to giving visitors safe and memorable experiences",
    },
  },
];

export const ESTACION: Record<CampoId, Estacion> = Object.fromEntries(ESTACIONES.map((e) => [e.id, e])) as Record<CampoId, Estacion>;

/* ── Ranuras de la descripción (frases del glosario A5) ───────────────── */

export interface Ranura {
  id: RanuraId;
  /** Conector que abre la oración en la vista previa (A1). */
  conector?: string;
  /** Inicio de la oración (frase del glosario A5). */
  antes: string;
  /** Qué pregunta responde, en español. */
  pregunta: string;
  /** Por qué la regla rota está mal (solo ranuras con regla). */
  regla?: string;
}

export const RANURAS: Ranura[] = [
  {
    id: "field",
    conector: "First,",
    antes: "my field of study",
    pregunta: "¿Qué campo es?",
    regla: "«My field of study» es singular, así que el verbo también: «My field of study IS…». Con «are» se rompe la concordancia sujeto-verbo (A4).",
  },
  {
    id: "involves",
    antes: "This area involves",
    pregunta: "¿Qué hace la gente de ese campo?",
    regla: "Después de «involve» va un gerundio (verbo + -ing): «This area involves caring…», nunca «involves to care…» (A5).",
  },
  { id: "where", conector: "Also,", antes: "professionals in this field work in", pregunta: "¿Dónde trabajan?" },
  { id: "tools", antes: "They use", pregunta: "¿Con qué herramientas?" },
  {
    id: "related",
    conector: "In addition,",
    antes: "it is related",
    pregunta: "¿Con qué materias se relaciona?",
    regla: "Después de «related» siempre va «to»: «It is related TO biology…». «Related with» es un calco del español «relacionado con» (A5).",
  },
  {
    id: "goal",
    conector: "Finally,",
    antes: "one of the main goals of this field is",
    pregunta: "¿Para qué sirve?",
    regla: "Después de «goal is» va «to + infinitive», el verbo en su forma base: «is to improve», no «to improving» (A5).",
  },
];

export interface Opcion {
  texto: string;
  calidad: Calidad;
  /** Campo del que sale el fragmento (el propio, salvo en «mezcla»). */
  de: CampoId;
}

/**
 * Las opciones de una ranura en una estación. Determinista: los campos que
 * se mezclan y el orden en que aparecen dependen solo de la estación y la
 * ranura, para que la correcta no quede siempre en el mismo lugar.
 */
export function opcionesDe(est: CampoId, ranura: RanuraId): Opcion[] {
  const i = ESTACIONES.findIndex((e) => e.id === est);
  const k = RANURAS.findIndex((r) => r.id === ranura);
  const e = ESTACIONES[i]!;
  const otra = (salto: number) => ESTACIONES[(i + salto) % ESTACIONES.length]!;
  const o1 = otra(1 + (k % 3));
  const o2 = otra(1 + ((k + 1) % 3));
  const lista: Opcion[] = [{ texto: e.frases[ranura], calidad: "ok", de: e.id }];
  const trampa = e.trampas[ranura];
  if (trampa) lista.push({ texto: trampa, calidad: "regla", de: e.id });
  lista.push({ texto: o1.frases[ranura], calidad: "mezcla", de: o1.id });
  if (!trampa) lista.push({ texto: o2.frases[ranura], calidad: "mezcla", de: o2.id });
  const giro = (i + k) % lista.length;
  return [...lista.slice(giro), ...lista.slice(0, giro)];
}

/* ── Visitantes ───────────────────────────────────────────────────────── */

export interface Visitante {
  id: VisitanteId;
  nombre: string;
  rol: string;
  icono: string;
  /** Las dos ranuras que le importan. */
  ranuras: [RanuraId, RanuraId];
  /** Lo que quiere saber, en inglés. */
  quiere: string;
  /** Lo mismo en español. */
  quiereEs: string;
  /** Lo que dice si se registra. */
  si: string;
}

export const VISITANTES: Visitante[] = [
  {
    id: "lucia",
    nombre: "Lucía Paredes",
    rol: "2nd-semester student",
    icono: "fa-user-graduate",
    ranuras: ["involves", "goal"],
    quiere: "What do people in this field do, and why does it matter?",
    quiereEs: "Qué hace la gente de ese campo y para qué sirve.",
    si: "That sounds amazing! I want to sign up for the workshop.",
  },
  {
    id: "ortega",
    nombre: "Mr. Julián Ortega",
    rol: "school counselor",
    icono: "fa-chalkboard-user",
    ranuras: ["field", "related"],
    quiere: "Which field is it, and which subjects should students take?",
    quiereEs: "Qué campo es y con qué materias se relaciona.",
    si: "Very clear. I'll recommend this field to my students.",
  },
  {
    id: "reyes",
    nombre: "Ms. Ana Paula Reyes",
    rol: "internship coordinator",
    icono: "fa-briefcase",
    ranuras: ["where", "tools"],
    quiere: "Where would an intern work, and with what tools?",
    quiereEs: "Dónde trabajaría un practicante y con qué herramientas.",
    si: "Perfect. I can offer two internships in this field.",
  },
];

export const PUNTOS_RANURA: Record<Calidad, number> = { ok: 50, regla: 25, mezcla: 0 };
export const CASTIGO_MEZCLA = 15;
export const UMBRAL_REGISTRO = 80;

export type Animo = "feliz" | "duda" | "confuso";

export interface Reaccion {
  interes: number;
  registra: boolean;
  animo: Animo;
  /** Lo que dice el visitante, en inglés. */
  dice: string;
  /** Por qué, en español. */
  porque: string;
}

/** Descripción elegida: índice de opción por ranura. */
export type Eleccion = Partial<Record<RanuraId, number>>;

export function calidadDe(est: CampoId, ranura: RanuraId, eleccion: Eleccion): Opcion | null {
  const idx = eleccion[ranura];
  if (idx === undefined) return null;
  return opcionesDe(est, ranura)[idx] ?? null;
}

export function reaccionDe(v: Visitante, est: CampoId, eleccion: Eleccion): Reaccion {
  const e = ESTACION[est];
  const propias = v.ranuras.map((r) => ({ r, op: calidadDe(est, r, eleccion) }));
  const ajenasMezcla = RANURAS.filter((r) => !v.ranuras.includes(r.id)).filter(
    (r) => calidadDe(est, r.id, eleccion)?.calidad === "mezcla"
  ).length;
  const base = propias.reduce((s, p) => s + (p.op ? PUNTOS_RANURA[p.op.calidad] : 0), 0);
  const interes = Math.max(0, Math.min(100, base - CASTIGO_MEZCLA * ajenasMezcla));
  const registra = interes >= UMBRAL_REGISTRO;

  const mezcla = propias.find((p) => p.op?.calidad === "mezcla");
  if (mezcla && mezcla.op) {
    const otro = ESTACION[mezcla.op.de];
    return {
      interes,
      registra,
      animo: "confuso",
      dice:
        mezcla.r === "field"
          ? `Wait… ${otro.nombre}? This station doesn't look like that field at all.`
          : `Wait… "${mezcla.op.texto}"? That sounds like ${otro.nombre}.`,
      porque: `Mezclaste campos: «${mezcla.op.texto}» describe ${otro.nombreEs}, no lo que se ve en la estación ${e.letra}. Quería saber: ${v.quiereEs.toLowerCase()}`,
    };
  }
  const rota = propias.find((p) => p.op?.calidad === "regla");
  if (rota) {
    const regla = RANURAS.find((r) => r.id === rota.r)?.regla ?? "";
    return {
      interes,
      registra,
      animo: "duda",
      dice: "I think I understand… but something sounds wrong.",
      porque: `Te entendió el campo, pero la frase suena mal. ${regla}`,
    };
  }
  if (!registra) {
    return {
      interes,
      registra,
      animo: "duda",
      dice: "My part was clear, but the rest mixes two fields. I'm lost.",
      porque: `Sus dos datos estaban bien, pero ${ajenasMezcla} ${ajenasMezcla === 1 ? "frase de otro campo le hizo" : "frases de otros campos le hicieron"} dudar de qué carrera describes.`,
    };
  }
  return {
    interes,
    registra,
    animo: "feliz",
    dice: v.si,
    porque:
      ajenasMezcla > 0
        ? "Lo que le importaba estaba claro y bien dicho, aunque otra frase no encajaba con el campo."
        : "Lo que le importaba estaba claro, del campo correcto y con la estructura del glosario.",
  };
}

/* ── «On stage»: la charla de Valeria y los conectores ────────────────── */

export interface OpcionConector {
  texto: string;
  ok: boolean;
  /** Por qué, en español. */
  porque: string;
}

export interface OracionCharla {
  id: string;
  /** La oración partida por el hueco del conector. */
  antes: string;
  despues: string;
  opciones: OpcionConector[];
}

export const PUBLICO = 12;
export const PERDIDOS_POR_ERROR = 2;
export const META_PUBLICO = 10;

export const CHARLA_APERTURA = "Hi, everyone. My name is Valeria Soto, and I'm in my fifth semester.";

export const CHARLA: OracionCharla[] = [
  {
    id: "c1",
    antes: "",
    despues: ", I want to explain what my field is about.",
    opciones: [
      { texto: "First", ok: true, porque: "«First» (primero) abre la descripción y avisa que viene un orden: es la oración de ejemplo de A1." },
      { texto: "Finally", ok: false, porque: "«Finally» anuncia el cierre. Si abres con él, el público cree que ya vas a terminar y deja de escuchar." },
      { texto: "Moreover", ok: false, porque: "«Moreover» agrega algo a una idea anterior, pero todavía no has dicho ninguna: no hay a qué sumarle." },
    ],
  },
  {
    id: "c2",
    antes: "I'm interested in sports medicine ",
    despues: " I want to help athletes recover.",
    opciones: [
      { texto: "because", ok: true, porque: "«because» introduce la razón: «I'm interested in [field] because…» es la estructura básica de A1." },
      { texto: "also", ok: false, porque: "«also» agrega otra cosa que te gusta; aquí falta la razón, y la razón se une con «because»." },
      { texto: "first", ok: false, porque: "«first» ordena pasos; entre el interés y su motivo no hay un primer paso, hay una causa." },
    ],
  },
  {
    id: "c3",
    antes: "This area involves treating injuries and designing safe training plans. I ",
    despues: " enjoy working with data from training sessions.",
    opciones: [
      { texto: "also", ok: true, porque: "«also» (también) agrega un gusto más y va antes del verbo: «I also enjoy…», como en A1." },
      { texto: "because", ok: false, porque: "«I because enjoy…» no es una oración: «because» necesita una idea antes y otra después." },
      { texto: "finally", ok: false, porque: "Aún no es el cierre: con «finally» a la mitad, el público espera que acabes y luego sigues hablando." },
    ],
  },
  {
    id: "c4",
    antes: "",
    despues: ", this field is growing rapidly in Mexico.",
    opciones: [
      { texto: "Moreover", ok: true, porque: "«Moreover» (además) suma una razón con fuerza: el campo crece. Es la oración de ejemplo de A1." },
      { texto: "However", ok: false, porque: "«However» anuncia un contraste, pero que el campo crezca no contradice nada de lo anterior: el público se pierde." },
      { texto: "First", ok: false, porque: "«First» ya se usó para abrir; volver a «First» a la mitad hace pensar que la charla empezó de nuevo." },
    ],
  },
  {
    id: "c5",
    antes: "Professionals in this field work in hospitals, gyms, and sports clubs. ",
    despues: ", I hope to specialize in rehabilitation for young athletes.",
    opciones: [
      { texto: "Finally", ok: true, porque: "«Finally» (finalmente) introduce la meta y cierra la descripción, igual que Rodrigo en A1." },
      { texto: "First", ok: false, porque: "Es la última idea, no la primera: «First» al final desordena toda la charla." },
      { texto: "Because", ok: false, porque: "«Because» explica una causa, pero aquí no hay causa: es tu meta, y la meta se anuncia con «Finally»." },
    ],
  },
];

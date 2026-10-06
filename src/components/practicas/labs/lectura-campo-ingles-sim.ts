/**
 * Modelo del SIMULADOR del lab «lectura-campo-ingles» (IN-V-P05).
 *
 * TODO es ficticio: el Colegio Valle Alto, su laboratorio y su biblioteca, el
 * invernadero escolar y el tour a las cascadas de Río Claro. Los segundos son
 * valores de juego (simulación).
 *
 * 1. «Read & decide» — el lector-detective con reloj. Cuatro textos breves de
 *    campos distintos (salud/química, educación/tecnología, agronomía y
 *    turismo), cada uno con una tarea real que depende de leerlo bien. Cada
 *    texto tiene 45 s de lectura y las herramientas cuestan tiempo:
 *      · skimming (10 s): muestra subtítulos y la primera oración de cada
 *        párrafo (topic sentences);
 *      · lupa de scanning (5 s por lente): hace brillar números, conectores o
 *        la palabra clave de la tarea, SIN leer la oración;
 *      · lectura detallada (8 s por oración);
 *      · pista de contexto (6 s): abre la oración de una palabra difícil y
 *        pide deducir su significado (técnicas y falsos cognados).
 *    Leer todo cuesta más de 45 s: hay que elegir. La decisión tiene una
 *    consecuencia (el experimento, la laptop, la planta, el autobús) y se
 *    señala la oración que la decidía. Cuenta «con evidencia» sólo si esa
 *    oración se leyó de verdad; acertar sin leerla es suerte.
 * 2. «Fact check» — el texto de práctica de A1 (verbatim). El boletín escolar
 *    pide idea principal, una cifra, dos hechos y una opinión; un verificador
 *    revisa cada línea y la credibilidad baja 20 puntos por error.
 *
 * Determinista: el mismo estado da siempre el mismo resultado.
 */

export type CasoId = "lab" | "biblioteca" | "invernadero" | "autobus";
export type Lente = "numeros" | "conectores" | "clave";
export type Proposito = "warn" | "inform" | "instruct" | "persuade";
export type OpcionId = "a" | "b" | "c";

export interface Oracion {
  id: string;
  texto: string;
}

export interface Parrafo {
  titulo: string;
  /** La primera oración es la topic sentence. */
  oraciones: Oracion[];
}

export interface OpcionPalabra {
  es: string;
  ok: boolean;
  porque: string;
}

export interface PalabraDificil {
  id: string;
  palabra: string;
  oracionId: string;
  tipo: "falso" | "tecnico";
  opciones: OpcionPalabra[];
}

export interface OpcionDecision {
  id: OpcionId;
  texto: string;
  ok: boolean;
  /** Lo que pasa, en español. */
  consecuencia: string;
  /** Por qué, con el inglés citado. */
  porque: string;
}

export interface Caso {
  id: CasoId;
  campo: string;
  campoEs: string;
  icono: string;
  /** Tipo de texto y quién lo publica (ficticio). */
  fuente: string;
  titulo: string;
  tarea: string;
  /** Palabra clave de la tarea para la lupa de scanning. */
  claveEtiqueta: string;
  claveTokens: string[];
  parrafos: Parrafo[];
  palabras: PalabraDificil[];
  opciones: OpcionDecision[];
  /** Oraciones que deciden la tarea. */
  claves: string[];
  proposito: Proposito;
  propositoPorque: string;
  /** Lo que se ve en la foto, en español (pie). */
  escena: string;
}

/* ── Reloj y costos ─────────────────────────────────────────────────────── */

export const PRESUPUESTO = 45;
export const COSTO = { skim: 10, lente: 5, leer: 8, contexto: 6 } as const;

export const LENTES: { id: Lente; etiqueta: string; icono: string; ayuda: string }[] = [
  { id: "numeros", etiqueta: "Numbers", icono: "fa-hashtag", ayuda: "Horas, cantidades, días" },
  { id: "conectores", etiqueta: "Connectors", icono: "fa-link", ayuda: "However, In other words…" },
  { id: "clave", etiqueta: "Task word", icono: "fa-key", ayuda: "La palabra de tu tarea" },
];

export const CONECTORES = ["however", "nevertheless", "in other words", "in addition", "therefore", "actually", "eventually", "to sum up", "in conclusion", "despite"];

export const PROPOSITOS: { id: Proposito; en: string; es: string; icono: string }[] = [
  { id: "warn", en: "to warn", es: "advertir de un riesgo", icono: "fa-triangle-exclamation" },
  { id: "inform", en: "to inform", es: "dar a conocer algo", icono: "fa-circle-info" },
  { id: "instruct", en: "to instruct", es: "decir cómo hacer algo", icono: "fa-list-ol" },
  { id: "persuade", en: "to persuade", es: "convencer", icono: "fa-bullhorn" },
];

/* ── Los cuatro casos ───────────────────────────────────────────────────── */

export const CASOS: Caso[] = [
  {
    id: "lab",
    campo: "Health sciences · Chemistry",
    campoEs: "salud y química",
    icono: "fa-flask",
    fuente: "Safety notice · Colegio Valle Alto (ficticio)",
    titulo: "SAFETY NOTICE — Chemistry Lab 2",
    tarea: "Hoy haces el experimento 3. ¿Con qué te proteges las manos?",
    claveEtiqueta: "Experiment",
    claveTokens: ["experiment"],
    parrafos: [
      {
        titulo: "New gloves",
        oraciones: [
          { id: "l1", texto: "This week, Lab 2 received two new boxes of gloves." },
          { id: "l2", texto: "The blue gloves are thin, comfortable, and very cheap." },
          { id: "l3", texto: "For that reason, many students prefer them." },
        ],
      },
      {
        titulo: "Experiment 3",
        oraciones: [
          { id: "l4", texto: "Experiment 3 uses a diluted acid, so your hands need real protection." },
          { id: "l5", texto: "However, the blue gloves are only for plants and soil samples; they are not made for chemicals." },
          { id: "l6", texto: "For Experiment 3, wear the green nitrile gloves and work under the fume hood." },
        ],
      },
      {
        titulo: "Before you start",
        oraciones: [
          { id: "l7", texto: "Wear sensible shoes: sandals are not allowed in the lab." },
          { id: "l8", texto: "If acid touches your skin, rinse it with water for 15 minutes and tell your teacher." },
        ],
      },
    ],
    palabras: [
      {
        id: "fume-hood",
        palabra: "fume hood",
        oracionId: "l6",
        tipo: "tecnico",
        opciones: [
          { es: "la capucha de la bata", ok: false, porque: "«Hood» también es capucha, pero la oración dice «work under the fume hood»: uno trabaja DEBAJO de un mueble, no de su capucha. «Fumes» son vapores." },
          { es: "una campana de extracción de vapores", ok: true, porque: "Correcto: «fumes» son vapores y se trabaja «under» (debajo de) ella. Es el mueble del laboratorio que aspira los vapores del ácido." },
          { es: "el humo de un incendio", ok: false, porque: "Nada en el texto habla de fuego. Se trabaja «under» algo: es un mueble, la campana que aspira los vapores." },
        ],
      },
      {
        id: "sensible",
        palabra: "sensible",
        oracionId: "l7",
        tipo: "falso",
        opciones: [
          { es: "sensibles, delicados", ok: false, porque: "Falso cognado. «Sensible» en inglés significa sensato, adecuado. «Sensible» del español se dice «sensitive». El contexto ayuda: «sandals are not allowed»." },
          { es: "nuevos, sin usar", ok: false, porque: "El texto no habla de zapatos nuevos: los contrasta con las sandalias. Se piden zapatos adecuados, que cubran el pie." },
          { es: "sensatos, adecuados", ok: true, porque: "Correcto: «sensible shoes» son zapatos adecuados para la tarea. Es un falso cognado: no significa «sensibles»." },
        ],
      },
    ],
    opciones: [
      {
        id: "a",
        texto: "Los guantes azules: son cómodos",
        ok: false,
        consecuencia: "Una gota de ácido atraviesa el guante azul y te arde la mano. El experimento se suspende.",
        porque: "Leíste la primera parte («thin, comfortable, and very cheap») pero no el contraste: «However, the blue gloves are only for plants and soil samples; they are not made for chemicals.»",
      },
      {
        id: "b",
        texto: "Los guantes verdes de nitrilo, bajo la campana",
        ok: true,
        consecuencia: "Terminas el experimento 3 sin una sola gota de ácido en la piel.",
        porque: "Lo decía la oración «For Experiment 3, wear the green nitrile gloves and work under the fume hood.» La lupa con la palabra «Experiment» te llevaba directo a ella.",
      },
      {
        id: "c",
        texto: "Sin guantes; me enjuago si me salpica",
        ok: false,
        consecuencia: "Te salpica una gota: pasas 15 minutos enjuagándote y no terminas el experimento.",
        porque: "«Rinse it with water for 15 minutes» es lo que se hace DESPUÉS de un accidente, no una protección. Lo que protege está en «For Experiment 3, wear the green nitrile gloves…».",
      },
    ],
    claves: ["l6"],
    proposito: "warn",
    propositoPorque: "Es un aviso de seguridad: advierte de un riesgo (el ácido) y dice cómo evitarlo. El título lo anuncia: «SAFETY NOTICE».",
    escena: "Mesa de laboratorio con dos cajas de guantes",
  },
  {
    id: "biblioteca",
    campo: "Education · Technology",
    campoEs: "educación y tecnología",
    icono: "fa-laptop",
    fuente: "Library notice · Colegio Valle Alto (ficticio)",
    titulo: "Library Notice: Borrow a Laptop",
    tarea: "Es lunes. Necesitas una laptop para tu proyecto del viernes y no tienes dinero para comprar una. ¿Qué haces?",
    claveEtiqueta: "laptop",
    claveTokens: ["laptop", "laptops"],
    parrafos: [
      {
        titulo: "A new service",
        oraciones: [
          { id: "b1", texto: "Starting this month, the school library lends laptops to students for free." },
          { id: "b2", texto: "You can take a laptop home for up to three days." },
        ],
      },
      {
        titulo: "How to reserve one",
        oraciones: [
          { id: "b3", texto: "To reserve a laptop, fill out the online form before Wednesday at 2:00 p.m." },
          { id: "b4", texto: "Actually, the form is the only way to reserve one: the librarian cannot do it for you at the desk." },
          { id: "b5", texto: "In other words, no form, no laptop." },
          { id: "b6", texto: "Bring your student ID when you pick it up on Thursday." },
        ],
      },
      {
        titulo: "Rules",
        oraciones: [
          { id: "b7", texto: "Return the laptop with its charger." },
          { id: "b8", texto: "If you return it late, you cannot borrow another one for a month." },
        ],
      },
    ],
    palabras: [
      {
        id: "library",
        palabra: "library",
        oracionId: "b1",
        tipo: "falso",
        opciones: [
          { es: "biblioteca", ok: true, porque: "Correcto: «library» es biblioteca, el lugar que PRESTA («lends») libros y aquí también laptops." },
          { es: "librería", ok: false, porque: "Falso cognado. Una librería vende libros y en inglés es «bookstore». La pista está en «lends … for free»: presta gratis, no vende." },
          { es: "laboratorio", ok: false, porque: "Laboratorio es «lab». Esta oración habla de un lugar de la escuela que presta cosas gratis: la biblioteca." },
        ],
      },
      {
        id: "actually",
        palabra: "Actually",
        oracionId: "b4",
        tipo: "falso",
        opciones: [
          { es: "actualmente, por ahora", ok: false, porque: "Falso cognado. «Actually» significa «en realidad, de hecho». «Actualmente» se dice «currently» o «nowadays». Si lo lees como «por ahora», crees que la regla es temporal." },
          { es: "en realidad, de hecho", ok: true, porque: "Correcto: «Actually» corrige una idea equivocada (que la bibliotecaria te la puede apartar). En realidad, sólo el formulario sirve." },
          { es: "activamente", ok: false, porque: "«Activamente» es «actively». Aquí «Actually» corrige una suposición: en realidad, el formulario es la única forma." },
        ],
      },
    ],
    opciones: [
      {
        id: "a",
        texto: "Llenar el formulario en línea antes del miércoles, 2:00 p.m.",
        ok: true,
        consecuencia: "El jueves recoges la laptop con tu credencial y el viernes presentas tu proyecto.",
        porque: "Lo decía «To reserve a laptop, fill out the online form before Wednesday at 2:00 p.m.», y «Actually, the form is the only way to reserve one» descartaba cualquier otro camino.",
      },
      {
        id: "b",
        texto: "Pedirla el jueves en el mostrador",
        ok: false,
        consecuencia: "El jueves no hay ninguna laptop a tu nombre. Te quedas sin proyecto.",
        porque: "«Actually, the form is the only way to reserve one: the librarian cannot do it for you at the desk.» «Actually» es «en realidad», no «actualmente»: la regla no es temporal.",
      },
      {
        id: "c",
        texto: "Conseguirla en la librería del centro",
        ok: false,
        consecuencia: "En la librería sólo hay libros a la venta, y una laptop cuesta miles de pesos.",
        porque: "«Library» es biblioteca, no librería: «the school library lends laptops to students for free». Te la prestaban gratis.",
      },
    ],
    claves: ["b3", "b4"],
    proposito: "inform",
    propositoPorque: "Es un aviso que da a conocer un servicio nuevo («A new service») y cómo funciona: su fin principal es informar.",
    escena: "Biblioteca escolar con laptops en un carrito",
  },
  {
    id: "invernadero",
    campo: "Agronomy · Environment",
    campoEs: "agronomía y medio ambiente",
    icono: "fa-seedling",
    fuente: "Instruction sheet · School greenhouse (ficticio)",
    titulo: "Instruction Sheet: Watering Tomato Seedlings",
    tarea: "Tus plántulas de jitomate tienen 10 días y hoy toca regarlas. ¿Qué les das?",
    claveEtiqueta: "fertilizer",
    claveTokens: ["fertilizer"],
    parrafos: [
      {
        titulo: "Days 1 to 7",
        oraciones: [
          { id: "i1", texto: "During the first week, water each seedling every day with 50 ml of water." },
          { id: "i2", texto: "The soil must stay moist, but never wet." },
        ],
      },
      {
        titulo: "From day 8",
        oraciones: [
          { id: "i3", texto: "From day 8, the roots are stronger and need water less often." },
          { id: "i4", texto: "Water every two days with 100 ml per pot." },
          { id: "i5", texto: "Too much water is a common mistake: the roots can rot." },
        ],
      },
      {
        titulo: "Fertilizer and support",
        oraciones: [
          { id: "i6", texto: "Do not add fertilizer before day 14." },
          { id: "i7", texto: "Fertilizer can burn young roots and stop their growth." },
          { id: "i8", texto: "Eventually, tie each stem to a stick with a soft rope." },
        ],
      },
    ],
    palabras: [
      {
        id: "moist",
        palabra: "moist",
        oracionId: "i2",
        tipo: "tecnico",
        opciones: [
          { es: "encharcada", ok: false, porque: "El texto lo descarta con un contraste: «moist, but never wet». Encharcada sería «wet»." },
          { es: "seca", ok: false, porque: "Si fuera seca no habría que regarla cada día. La oración la opone a «wet»: es un punto medio." },
          { es: "húmeda", ok: true, porque: "Correcto: «moist, but never wet» — húmeda, pero nunca encharcada. El contraste con «but» te da el significado." },
        ],
      },
      {
        id: "rope",
        palabra: "rope",
        oracionId: "i8",
        tipo: "falso",
        opciones: [
          { es: "ropa", ok: false, porque: "Falso cognado. Ropa es «clothes». La oración dice «tie each stem to a stick»: se amarra con algo." },
          { es: "cuerda", ok: true, porque: "Correcto: «tie … with a soft rope», amarrar con una cuerda suave. «Rope» no es ropa." },
          { es: "rama", ok: false, porque: "Rama es «branch». Aquí se amarra («tie») el tallo a un palo «with a soft rope»: con una cuerda." },
        ],
      },
    ],
    opciones: [
      {
        id: "a",
        texto: "50 ml de agua y un poco de fertilizante",
        ok: false,
        consecuencia: "Poca agua y fertilizante antes de tiempo: las raíces se queman y las hojas se ponen cafés.",
        porque: "50 ml es sólo para «Days 1 to 7». Desde el día 8: «Water every two days with 100 ml per pot.» Y «Do not add fertilizer before day 14.»",
      },
      {
        id: "b",
        texto: "100 ml de agua con fertilizante",
        ok: false,
        consecuencia: "El agua es la correcta, pero el fertilizante quema las raíces jóvenes: la planta deja de crecer.",
        porque: "La cantidad es correcta, pero el texto dice «Do not add fertilizer before day 14.» Tus plántulas tienen 10 días.",
      },
      {
        id: "c",
        texto: "100 ml de agua, sin fertilizante",
        ok: true,
        consecuencia: "Las plántulas crecen firmes y verdes.",
        porque: "Lo decían dos oraciones: «Water every two days with 100 ml per pot.» y «Do not add fertilizer before day 14.» La lupa de números encuentra 50 y 100; sólo leyendo sabes cuál toca el día 10.",
      },
    ],
    claves: ["i4", "i6"],
    proposito: "instruct",
    propositoPorque: "Es un instructivo («Instruction Sheet»): da pasos, cantidades y tiempos para hacer algo.",
    escena: "Invernadero escolar con plántulas en macetas",
  },
  {
    id: "autobus",
    campo: "Tourism",
    campoEs: "turismo",
    icono: "fa-bus",
    fuente: "Tour brochure · Río Claro Tours (ficticio)",
    titulo: "Río Claro Waterfalls — Day Tour",
    tarea: "Es domingo y vas a tomar el tour. ¿A qué hora llegas a la terminal?",
    claveEtiqueta: "Sunday",
    claveTokens: ["sunday", "sundays"],
    parrafos: [
      {
        titulo: "The tour",
        oraciones: [
          { id: "a1", texto: "Discover three waterfalls and a natural pool in one unforgettable day." },
          { id: "a2", texto: "The tour includes transportation, a local guide, and lunch by the river." },
        ],
      },
      {
        titulo: "Schedule",
        oraciones: [
          { id: "a3", texto: "The bus leaves from the main exit of the Central Station at 8:40 a.m., Monday to Saturday." },
          { id: "a4", texto: "However, on Sundays it leaves at 8:10 a.m. because the road is busier." },
          { id: "a5", texto: "Please arrive 15 minutes early: the bus cannot wait." },
        ],
      },
      {
        titulo: "What to bring",
        oraciones: [
          { id: "a6", texto: "Bring comfortable shoes, a hat, and a towel." },
          { id: "a7", texto: "If you cannot swim, the guide will assist you with a life jacket." },
          { id: "a8", texto: "Book today: this tour is the best way to see the region!" },
        ],
      },
    ],
    palabras: [
      {
        id: "exit",
        palabra: "exit",
        oracionId: "a3",
        tipo: "falso",
        opciones: [
          { es: "éxito", ok: false, porque: "Falso cognado. Éxito es «success». «The bus leaves from the main exit of the Central Station»: es un lugar de la terminal." },
          { es: "salida", ok: true, porque: "Correcto: «main exit» es la salida principal. El autobús parte de ahí." },
          { es: "taquilla", ok: false, porque: "Taquilla es «ticket office». La oración habla de un lugar por donde se sale de la terminal: la salida." },
        ],
      },
      {
        id: "assist",
        palabra: "assist",
        oracionId: "a7",
        tipo: "falso",
        opciones: [
          { es: "asistir a (ir)", ok: false, porque: "Falso cognado. «Asistir a» un evento se dice «attend». «Assist you with a life jacket»: te ayuda con un chaleco salvavidas." },
          { es: "vigilar desde lejos", ok: false, porque: "La oración dice «assist you with a life jacket»: el guía hace algo CONTIGO y con el chaleco. Es ayudar." },
          { es: "ayudar", ok: true, porque: "Correcto: «assist» = ayudar. Si no sabes nadar, el guía te ayuda con un chaleco salvavidas." },
        ],
      },
    ],
    opciones: [
      {
        id: "a",
        texto: "A las 7:55 a.m.",
        ok: true,
        consecuencia: "Subes al autobús con tiempo y a las 8:10 sales rumbo a las cascadas.",
        porque: "«However, on Sundays it leaves at 8:10 a.m.» y «Please arrive 15 minutes early»: 8:10 menos 15 minutos son las 7:55.",
      },
      {
        id: "b",
        texto: "A las 8:25 a.m.",
        ok: false,
        consecuencia: "Llegas a la salida principal y el autobús ya se fue: salió a las 8:10.",
        porque: "Calculaste con 8:40, que es el horario «Monday to Saturday». El «However» de la oración siguiente cambia el horario del domingo: «on Sundays it leaves at 8:10 a.m.»",
      },
      {
        id: "c",
        texto: "A las 8:40 a.m.",
        ok: false,
        consecuencia: "Encuentras la salida vacía: el autobús salió hace media hora.",
        porque: "El scanning encontró «8:40», pero esa hora no aplica en domingo: «However, on Sundays it leaves at 8:10 a.m.» Y además había que llegar 15 minutos antes.",
      },
    ],
    claves: ["a4", "a5"],
    proposito: "persuade",
    propositoPorque: "Es un folleto: informa, pero sobre todo quiere convencerte de comprar el tour («Book today», «the best way to see the region!»).",
    escena: "Autobús de turismo junto a la salida de una terminal",
  },
];

export const CASO = Object.fromEntries(CASOS.map((c) => [c.id, c])) as Record<CasoId, Caso>;

/* ── Estado de lectura de un caso ───────────────────────────────────────── */

export interface EstadoCaso {
  skim: boolean;
  lentes: Lente[];
  /** Oraciones leídas con lectura detallada. */
  leidas: string[];
  /** Palabras abiertas con la pista de contexto (se paga una vez). */
  abiertas: string[];
  /** Opciones probadas por palabra (índices). */
  intentos: Record<string, number[]>;
  decision: OpcionId | null;
  proposito: Proposito | null;
}

export function estadoInicial(): EstadoCaso {
  return { skim: false, lentes: [], leidas: [], abiertas: [], intentos: {}, decision: null, proposito: null };
}

export function tiempoUsado(e: EstadoCaso): number {
  return (e.skim ? COSTO.skim : 0) + e.lentes.length * COSTO.lente + e.leidas.length * COSTO.leer + e.abiertas.length * COSTO.contexto;
}

export function puedePagar(e: EstadoCaso, costo: number): boolean {
  return e.decision === null && tiempoUsado(e) + costo <= PRESUPUESTO;
}

export function todasLasOraciones(c: Caso): Oracion[] {
  return c.parrafos.flatMap((p) => p.oraciones);
}

/** Leer el texto entero con lectura detallada, en segundos. */
export function costoLeerTodo(c: Caso): number {
  return todasLasOraciones(c).length * COSTO.leer;
}

export function esTopic(c: Caso, oracionId: string): boolean {
  return c.parrafos.some((p) => p.oraciones[0]?.id === oracionId);
}

/** Cómo se ve una oración: leída, vista por skimming u oculta. */
export function visibilidad(c: Caso, e: EstadoCaso, oracionId: string): "leida" | "skim" | "oculta" {
  if (e.leidas.includes(oracionId)) return "leida";
  if (c.palabras.some((p) => p.oracionId === oracionId && e.abiertas.includes(p.id))) return "leida";
  if (e.skim && esTopic(c, oracionId)) return "skim";
  return "oculta";
}

const limpia = (t: string) => t.toLowerCase().replace(/[^\p{L}\p{N}:.]/gu, "").replace(/[.:]+$/, "");

/** La oración partida en palabras, con las que la lupa activa hace brillar. */
export function tokensConBrillo(c: Caso, e: EstadoCaso, texto: string): { t: string; brilla: boolean }[] {
  const toks = texto.split(/\s+/).filter(Boolean);
  const out = toks.map((t) => ({ t, brilla: false }));
  toks.forEach((tk, i) => {
    const l = limpia(tk);
    if (!l) return;
    if (e.lentes.includes("numeros") && /\d/.test(l)) out[i]!.brilla = true;
    if (e.lentes.includes("clave") && c.claveTokens.includes(l)) out[i]!.brilla = true;
    if (e.lentes.includes("conectores")) {
      for (const con of CONECTORES) {
        const partes = con.split(" ");
        if (partes.every((p, k) => toks[i + k] !== undefined && limpia(toks[i + k]!) === p)) {
          partes.forEach((_, k) => (out[i + k]!.brilla = true));
        }
      }
    }
  });
  return out;
}

/** Palabras que la lupa hizo brillar en todo el texto (para el contador). */
export function hallazgos(c: Caso, e: EstadoCaso): number {
  return todasLasOraciones(c).reduce((n, o) => n + tokensConBrillo(c, e, o.texto).filter((x) => x.brilla).length, 0);
}

export interface Resultado {
  opcion: OpcionDecision;
  correcta: boolean;
  /** Se leyeron todas las oraciones que decidían. */
  conEvidencia: boolean;
  /** Oraciones clave sin leer. */
  sinLeer: string[];
  usado: number;
  sobrante: number;
}

export function evaluar(c: Caso, e: EstadoCaso): Resultado | null {
  if (!e.decision) return null;
  const opcion = c.opciones.find((o) => o.id === e.decision)!;
  const sinLeer = c.claves.filter((k) => visibilidad(c, e, k) === "oculta");
  const usado = tiempoUsado(e);
  return { opcion, correcta: opcion.ok, conEvidencia: sinLeer.length === 0, sinLeer, usado, sobrante: PRESUPUESTO - usado };
}

export function textoDe(c: Caso, oracionId: string): string {
  return todasLasOraciones(c).find((o) => o.id === oracionId)?.texto ?? "";
}

/* ── «Fact check»: el texto de práctica de A1 ─────────────────────────── */

export type TipoAfirmacion = "hecho" | "opinion";

/** Veredicto del verificador por oración (las oraciones son verbatim, en el archivo de datos). */
export const VEREDICTO_BIO: Record<string, { tipo: TipoAfirmacion; porque: string }> = {
  s1: { tipo: "hecho", porque: "«Is considered» aquí no es la opinión de una persona: «megadiverse» es una categoría reconocida internacionalmente, con una cifra comprobable (17 países)." },
  s2: { tipo: "hecho", porque: "Describe dónde están los ecosistemas; se comprueba en cualquier mapa. No juzga nada." },
  s3: { tipo: "opinion", porque: "«Argue» es palabra señal de opinión: los científicos sostienen un punto de vista, aunque esté muy respaldado por evidencia." },
  s4: { tipo: "hecho", porque: "«According to CONABIO» cita una fuente oficial con una cifra verificable (35 %): es «according to [official data]»." },
  s5: { tipo: "hecho", porque: "Se verifica en las listas oficiales de especies en peligro." },
  s6: { tipo: "opinion", porque: "«Has made progress» es una valoración: dice que algo va bien. El texto la apoya después con datos, pero la frase en sí juzga." },
  s7: { tipo: "hecho", porque: "Cifras comprobables: más de 180 áreas protegidas y cerca de 12 % del territorio terrestre." },
  s8: { tipo: "opinion", porque: "«An important role» es un juicio de valor: ¿importante según quién? No trae un dato que lo mida." },
};

/** Palabras que la lupa de señales hace brillar en el texto de A1. */
export const SENALES_BIO = ["considered", "argue", "According to", "However", "Despite", "progress", "important"];

export const IDEAS_PRINCIPALES: { id: string; texto: string; ok: boolean; porque: string }[] = [
  { id: "m1", texto: "The axolotl is one of the most endangered species in Mexico.", ok: false, porque: "Es un detalle del segundo párrafo, no la idea de todo el texto. Las topic sentences hablan de algo más amplio." },
  { id: "m2", texto: "Mexico's biodiversity: its richness, the threats it faces, and its conservation.", ok: true, porque: "Es lo que dicen juntas las tres topic sentences: riqueza (megadiverse), amenaza (under serious threat) y avances (has made progress)." },
  { id: "m3", texto: "Coral reefs make the Caribbean the best place for tourism.", ok: false, porque: "El texto menciona los arrecifes sólo como un ecosistema más; nunca habla de turismo. Y «the best» sería una opinión." },
];

export const CIFRAS: { id: string; texto: string; ok: boolean; porque: string }[] = [
  { id: "17", texto: "17", ok: false, porque: "17 es el número de países megadiversos, no el bosque perdido." },
  { id: "70", texto: "70%", ok: false, porque: "70 % es la parte de las especies del planeta que viven en los 17 países megadiversos." },
  { id: "35", texto: "35%", ok: true, porque: "«Mexico has lost approximately 35% of its original forest cover» (según CONABIO)." },
  { id: "180", texto: "180", ok: false, porque: "180 es el número de áreas naturales protegidas." },
  { id: "12", texto: "12%", ok: false, porque: "12 % es el territorio terrestre estrictamente protegido, no el bosque perdido." },
];

export interface Boletin {
  idea: string | null;
  cifra: string | null;
  hechos: string[];
  opinion: string | null;
}

export const BOLETIN_VACIO: Boletin = { idea: null, cifra: null, hechos: [], opinion: null };
export const HECHOS_POR_BOLETIN = 2;
export const CASTIGO_ERROR = 20;

export interface Revision {
  campo: string;
  ok: boolean;
  porque: string;
}

export function boletinCompleto(b: Boletin): boolean {
  return b.idea !== null && b.cifra !== null && b.hechos.length === HECHOS_POR_BOLETIN && b.opinion !== null;
}

/** El verificador revisa cada línea del boletín. */
export function verificar(b: Boletin): { revisiones: Revision[]; errores: number; credibilidad: number; publicado: boolean } {
  const revisiones: Revision[] = [];
  const idea = IDEAS_PRINCIPALES.find((m) => m.id === b.idea);
  if (idea) revisiones.push({ campo: "Main idea", ok: idea.ok, porque: idea.porque });
  const cifra = CIFRAS.find((x) => x.id === b.cifra);
  if (cifra) revisiones.push({ campo: "Key number", ok: cifra.ok, porque: cifra.porque });
  for (const h of b.hechos) {
    const v = VEREDICTO_BIO[h];
    if (v) revisiones.push({ campo: "Fact", ok: v.tipo === "hecho", porque: v.tipo === "hecho" ? v.porque : `No es un hecho. ${v.porque}` });
  }
  if (b.opinion) {
    const v = VEREDICTO_BIO[b.opinion];
    if (v) revisiones.push({ campo: "Opinion", ok: v.tipo === "opinion", porque: v.tipo === "opinion" ? v.porque : `Esto es un hecho, no una opinión. ${v.porque}` });
  }
  const errores = revisiones.filter((r) => !r.ok).length;
  return { revisiones, errores, credibilidad: Math.max(0, 100 - CASTIGO_ERROR * errores), publicado: boletinCompleto(b) && errores === 0 };
}

/**
 * Modelo del SIMULADOR «El sábado de Ana» (lab habitos-comparaciones-ingles).
 *
 * Todo es FICTICIO: Ana, Daniela, Mateo y Sofía, los cafés, los teléfonos y
 * las cifras son valores de simulación para practicar la gramática de la
 * comparación; no son datos reales de ningún lugar.
 *
 * El alumno es el amigo que ayuda a Ana a decidir con una tabla enfrente.
 * Elige UNA oración en inglés por situación y la oración manda:
 *  · oración correcta y que dice lo que la gráfica dice → Ana escoge la
 *    opción buena;
 *  · oración mal armada (more easier, as … than, would rather to…) → Ana no
 *    entiende y, con prisa, escoge la opción impulsiva (siempre la peor);
 *  · oración bien armada pero que dice lo contrario de la gráfica → Ana le
 *    cree al alumno y escoge la opción equivocada.
 * Cada elección suma minutos y pesos al plan del sábado, que tiene un tope de
 * tiempo y de dinero: la consecuencia se ve en los medidores.
 *
 * El modelo es determinista: las mismas oraciones dan siempre el mismo plan.
 */

/** Tope de tiempo del sábado, en minutos de traslado (simulación). */
export const TOPE_MINUTOS = 90;
/** Tope de dinero del sábado, en pesos (simulación). */
export const TOPE_PESOS = 5000;

export type ClaseOracion = "ok" | "gramatica" | "datos";

export interface BarraSim {
  etiqueta: string;
  /** Lo que mide la gráfica de esta situación. */
  valor: number;
  /** Lo que cuesta en minutos y en pesos si Ana elige esta opción. */
  minutos: number;
  pesos: number;
  icono: string;
}

export interface OracionSim {
  texto: string;
  clase: ClaseOracion;
  /** Índice de la barra que Ana escoge al oír la oración. */
  elige: number;
  /** Lo que contesta Ana, en inglés. */
  ana: string;
  /** Por qué pasó eso, en español. */
  porque: string;
}

export interface SituacionSim {
  id: string;
  titulo: string;
  /** Clave de la imagen en /media/labs-sim/habitos-comparaciones-ingles/ */
  foto: string;
  icono: string;
  /** El contexto, en español, corto. */
  contexto: string;
  /** Qué mide la gráfica (con unidad). */
  medida: string;
  unidad: string;
  barras: BarraSim[];
  /** Lo que pregunta Ana, en inglés. */
  pregunta: string;
  oraciones: OracionSim[];
}

export const SITUACIONES: SituacionSim[] = [
  {
    id: "ruta",
    titulo: "Llegar al museo",
    foto: "ruta-museo",
    icono: "fa-train-subway",
    contexto: "Ana quiere llegar al museo antes de comer. La gráfica trae los minutos de cada ruta.",
    medida: "Minutos de viaje",
    unidad: "min",
    barras: [
      { etiqueta: "Metro", valor: 20, minutos: 20, pesos: 9, icono: "fa-train-subway" },
      { etiqueta: "Bicicleta", valor: 35, minutos: 35, pesos: 0, icono: "fa-bicycle" },
      { etiqueta: "Camión", valor: 50, minutos: 50, pesos: 12, icono: "fa-bus" },
    ],
    pregunta: "I want to get there fast. Which way is the fastest?",
    oraciones: [
      {
        texto: "The subway is the most fast way of the three.",
        clase: "gramatica",
        elige: 2,
        ana: "The most... what? I don't get it. I'll just take the bus.",
        porque: "«fast» es de una sílaba: lleva -est, no «most». Superlativo: the fastest. Ana no te entendió y tomó lo primero que pasó.",
      },
      {
        texto: "The bus is the fastest way of the three.",
        clase: "datos",
        elige: 2,
        ana: "Great, the bus it is!",
        porque: "La oración está bien escrita, pero la gráfica dice 50 minutos: el camión es el MÁS LENTO. Ana te creyó.",
      },
      {
        texto: "The subway is the fastest way of the three.",
        clase: "ok",
        elige: 0,
        ana: "Perfect. Let's take the subway!",
        porque: "Adjetivo de una sílaba + tres opciones: the fastest. Y los 20 minutos del metro son la barra más corta.",
      },
      {
        texto: "The subway is more faster than the others.",
        clase: "gramatica",
        elige: 2,
        ana: "More faster? Never mind. I'll take the bus.",
        porque: "«more faster» junta dos reglas: o «more» o «-er», nunca las dos. Ana se confundió y tomó el camión.",
      },
    ],
  },
  {
    id: "telefono",
    titulo: "El teléfono de regalo",
    foto: "tienda-telefonos",
    icono: "fa-mobile-screen",
    contexto: "Ana compra un teléfono para su mamá y casi no tiene presupuesto. Precios en pesos (simulación).",
    medida: "Precio",
    unidad: "$",
    barras: [
      { etiqueta: "Nova", valor: 4500, minutos: 0, pesos: 4500, icono: "fa-mobile-screen" },
      { etiqueta: "Brisa", valor: 6200, minutos: 0, pesos: 6200, icono: "fa-mobile-screen-button" },
    ],
    pregunta: "My budget is small. Which phone is cheaper?",
    oraciones: [
      {
        texto: "The Nova is the cheapest of the two.",
        clase: "gramatica",
        elige: 1,
        ana: "The cheapest of two? Ugh, I'll take the nice one.",
        porque: "El superlativo es para tres cosas o más. Con DOS se compara: cheaper than. Ana se confundió y compró el caro.",
      },
      {
        texto: "The Brisa is cheaper than the Nova.",
        clase: "datos",
        elige: 1,
        ana: "Awesome, I'll buy the Brisa!",
        porque: "Gramática perfecta, dato falso: la gráfica dice que la Brisa cuesta 6,200 y la Nova 4,500. Ana pagó de más.",
      },
      {
        texto: "The Nova is more cheap than the Brisa.",
        clase: "gramatica",
        elige: 1,
        ana: "More cheap? I can't follow you. I'll take the Brisa.",
        porque: "«cheap» es de una sílaba: cheaper, no «more cheap».",
      },
      {
        texto: "The Nova is cheaper than the Brisa.",
        clase: "ok",
        elige: 0,
        ana: "Thanks! The Nova fits my budget.",
        porque: "Dos teléfonos = comparativo: cheaper than. Y 4,500 es menos que 6,200.",
      },
    ],
  },
  {
    id: "cafe",
    titulo: "Dos cafés, el mismo precio",
    foto: "dos-cafes",
    icono: "fa-mug-hot",
    contexto: "Ana pregunta si el Café Luna es más caro que el Café Sol. Los dos cobran lo mismo, pero Sol queda a 5 minutos y Luna a 25.",
    medida: "Precio del combo",
    unidad: "$",
    barras: [
      { etiqueta: "Café Sol", valor: 45, minutos: 5, pesos: 45, icono: "fa-mug-hot" },
      { etiqueta: "Café Luna", valor: 45, minutos: 25, pesos: 45, icono: "fa-mug-saucer" },
    ],
    pregunta: "Is Café Luna more expensive than Café Sol? Then I'll pick one.",
    oraciones: [
      {
        texto: "Café Luna is not as expensive as Café Sol.",
        clase: "datos",
        elige: 1,
        ana: "So Luna is cheaper! Let's walk there.",
        porque: "«not as … as» dice que Luna es MÁS BARATO. Pero los dos cuestan 45: son iguales. Ana caminó 25 minutos por nada.",
      },
      {
        texto: "Café Sol is as expensive as Café Luna.",
        clase: "ok",
        elige: 0,
        ana: "Same price? Then let's go to the closer one: Sol.",
        porque: "Precios iguales = as + adjetivo en forma base + as. Sin diferencia de precio, Ana escogió el más cercano.",
      },
      {
        texto: "Café Sol is as expensive than Café Luna.",
        clase: "gramatica",
        elige: 1,
        ana: "As expensive than? Hmm... I'll just go to Luna.",
        porque: "La igualdad se cierra con «as», no con «than»: as expensive as.",
      },
      {
        texto: "Café Sol is as more expensive as Café Luna.",
        clase: "gramatica",
        elige: 1,
        ana: "I'm lost. Let's go to Luna, I guess.",
        porque: "Entre los dos «as» el adjetivo va en su forma base: as expensive as, sin «more».",
      },
    ],
  },
  {
    id: "cine",
    titulo: "Al cine: ¿a pie o en taxi?",
    foto: "esquina-cine",
    icono: "fa-film",
    contexto: "Ana pregunta qué prefieres tú. Las dos respuestas bien dichas valen: una gasta tiempo, la otra dinero.",
    medida: "Minutos de traslado",
    unidad: "min",
    barras: [
      { etiqueta: "A pie", valor: 30, minutos: 30, pesos: 0, icono: "fa-person-walking" },
      { etiqueta: "Taxi", valor: 8, minutos: 8, pesos: 90, icono: "fa-taxi" },
    ],
    pregunta: "We have to get to the cinema. What would you rather do?",
    oraciones: [
      {
        texto: "I'd rather walk than take a taxi.",
        clase: "ok",
        elige: 0,
        ana: "OK, let's walk. It's free!",
        porque: "would rather + verbo base + than + verbo base. Caminar cuesta 30 minutos y 0 pesos.",
      },
      {
        texto: "I'd rather to walk than take a taxi.",
        clase: "gramatica",
        elige: 1,
        ana: "Sorry? I'm late, I'm calling a taxi.",
        porque: "Después de would rather no va «to»: would rather walk. Ana no entendió y pidió un taxi.",
      },
      {
        texto: "I'd rather take a taxi than walk.",
        clase: "ok",
        elige: 1,
        ana: "Fine, a taxi it is. We'll be there in 8 minutes.",
        porque: "Misma estructura bien armada, otra preferencia: ahorras 22 minutos y gastas 90 pesos.",
      },
      {
        texto: "I prefer walk than taxi.",
        clase: "gramatica",
        elige: 1,
        ana: "I didn't catch that. Taxi, then.",
        porque: "prefer pide «to» (I prefer walking to taking a taxi), nunca «than», y el verbo lleva -ing.",
      },
    ],
  },
  {
    id: "gimnasio",
    titulo: "Quién entrena más seguido",
    foto: "gimnasio-club",
    icono: "fa-dumbbell",
    contexto: "El club necesita capitán: el que entrena con más frecuencia. La gráfica trae las veces por semana.",
    medida: "Veces por semana",
    unidad: "x",
    barras: [
      { etiqueta: "Daniela", valor: 4, minutos: 0, pesos: 0, icono: "fa-person-running" },
      { etiqueta: "Mateo", valor: 2, minutos: 0, pesos: 0, icono: "fa-person-biking" },
      { etiqueta: "Sofía", valor: 1, minutos: 0, pesos: 0, icono: "fa-person-swimming" },
    ],
    pregunta: "Who should be captain? I want the one who trains most often.",
    oraciones: [
      {
        texto: "Mateo goes to the gym more often than Daniela.",
        clase: "datos",
        elige: 1,
        ana: "Mateo, then! Congrats, captain.",
        porque: "Bien escrita, pero la gráfica dice 2 veces para Mateo y 4 para Daniela: es al revés.",
      },
      {
        texto: "Daniela goes to the gym the most often of the three.",
        clase: "ok",
        elige: 0,
        ana: "Daniela it is. She trains four times a week!",
        porque: "often es de dos sílabas: the most often. Son tres personas y Daniela tiene la barra más alta.",
      },
      {
        texto: "Daniela goes to the gym the oftenest of the three.",
        clase: "gramatica",
        elige: 2,
        ana: "The oftenest? Never heard it. Sofía, you're captain.",
        porque: "Con adverbios largos no se pega -est: the most often.",
      },
      {
        texto: "Daniela goes to the gym more often of the three.",
        clase: "gramatica",
        elige: 2,
        ana: "More often of three? I'm confused. Sofía, then.",
        porque: "«more often» compara dos; para tres se usa the most often.",
      },
    ],
  },
];

/** Resultado acumulado del plan a partir de las oraciones elegidas (índice por situación). */
export interface PlanSim {
  minutos: number;
  pesos: number;
  entendidas: number;
  buenas: number;
  hechas: number;
}

export function calcularPlan(elegidas: Record<string, number | undefined>): PlanSim {
  let minutos = 0;
  let pesos = 0;
  let entendidas = 0;
  let buenas = 0;
  let hechas = 0;
  for (const s of SITUACIONES) {
    const i = elegidas[s.id];
    if (i === undefined) continue;
    const o = s.oraciones[i];
    if (!o) continue;
    hechas++;
    const barra = s.barras[o.elige]!;
    minutos += barra.minutos;
    pesos += barra.pesos;
    if (o.clase !== "gramatica") entendidas++;
    if (o.clase === "ok") buenas++;
  }
  return { minutos, pesos, entendidas, buenas, hechas };
}

/** 1★ por terminar el plan; 2★ si cabe en tiempo y dinero; 3★ si además todas las oraciones eran correctas. */
export function estrellasDelPlan(plan: PlanSim): number {
  if (plan.hechas < SITUACIONES.length) return 0;
  const cabe = plan.minutos <= TOPE_MINUTOS && plan.pesos <= TOPE_PESOS;
  if (cabe && plan.buenas >= SITUACIONES.length) return 3;
  return cabe ? 2 : 1;
}

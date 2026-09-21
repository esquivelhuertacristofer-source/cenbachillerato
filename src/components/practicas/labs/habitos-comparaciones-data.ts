/**
 * Datos de IN-III-P04 «Hábitos, frecuencia y preferencias» (Inglés III, 3.er semestre).
 *
 * Módulo de datos puro (sin React, sin three.js) que alimenta a
 * LabHabitosComparaciones.
 *
 * VERBATIM de la base de datos: la lectura A1 con sus cuatro preguntas de
 * comprensión, el texto con huecos de A2 (vive en `habitos-comparaciones-huecos.ts`),
 * el reto evaluable de A3, los cinco enunciados verdadero/falso de A4, el
 * glosario y la actividad final de A5, y las consignas de A6/A7/A9.
 *
 * ESCRITO PARA ESTE LABORATORIO: las siete escaleras de adjetivos, las seis
 * tarjetas de datos, las seis oraciones de «as … as» y las seis estructuras de
 * preferencia. Las personas (Ana, Luis, Mateo, Sofía, Daniela), las rutas, los
 * teléfonos y las cafeterías son FICTICIOS. Las cifras de clima están
 * redondeadas a partir de las normales climatológicas y solo sirven para
 * comparar dos ciudades, no como dato de reporte.
 *
 * Por qué este laboratorio NO repite a `comparativos-ingles` (IN-II-P05) ni a
 * `tiempo-libre-ingles` (IN-II-P02):
 *  · `comparativos-ingles` construye el COMPARATIVO de adjetivos sueltos. Aquí
 *    la escalera llega hasta el SUPERLATIVO y obliga a nombrar la regla antes
 *    de aplicarla, con «more easier» dentro del mazo.
 *  · `tiempo-libre-ingles` enseña el presente simple, la -s de tercera persona
 *    y la POSICIÓN de los adverbios de frecuencia. Aquí la frecuencia solo
 *    aparece como DATO que hay que comparar («more often than»).
 *  · Nadie había tratado «as … as / not as … as» ni las estructuras de
 *    preferencia (prefer … to, would rather … than, like … better than).
 *
 * Todo el inglés de este archivo es inglés estadounidense estándar.
 */

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 1 — La escalera del adjetivo
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Las cuatro maneras de formar comparativo y superlativo en inglés. */
export type Regla = "er" | "y" | "more" | "irregular";

export interface ReglaInfo {
  id: Regla;
  etiqueta: string;
  detalle: string;
  icono: string;
}

export const REGLAS: ReglaInfo[] = [
  { id: "er", etiqueta: "-er / the -est", detalle: "Adjetivos de 1 sílaba", icono: "fa-plus" },
  { id: "y", etiqueta: "-y → -ier / the -iest", detalle: "Terminados en -y", icono: "fa-i-cursor" },
  { id: "more", etiqueta: "more / the most", detalle: "Adjetivos de 2+ sílabas", icono: "fa-angles-up" },
  { id: "irregular", etiqueta: "Irregular", detalle: "Sin regla: memorízalos", icono: "fa-star-of-life" },
];

export interface Escalon {
  id: string;
  adjetivo: string;
  es: string;
  /** Cómo se pronuncia el conteo de sílabas, para que la regla no sea magia. */
  silabas: string;
  regla: Regla;
  comparativo: string;
  superlativo: string;
  /** Opciones para el peldaño del comparativo (incluye la correcta). */
  opcionesComp: string[];
  /** Opciones para el peldaño del superlativo (incluye la correcta). */
  opcionesSup: string[];
  /** Por qué esa regla y no otra. */
  porqueRegla: string;
  /** Una oración de ejemplo, ya terminada, con las dos formas. */
  ejemplo: string;
}

export const ESCALERA: Escalon[] = [
  {
    id: "es-fast",
    adjetivo: "fast",
    es: "rápido",
    silabas: "1 sílaba: fast",
    regla: "er",
    comparativo: "faster",
    superlativo: "the fastest",
    opcionesComp: ["faster", "more fast", "fastest", "more faster"],
    opcionesSup: ["the fastest", "the most fast", "fastest", "the faster"],
    porqueRegla: "«fast» tiene una sola sílaba, así que se le pega -er y -est: faster / the fastest.",
    ejemplo: "Cycling is faster than walking, and the subway is the fastest option of the three.",
  },
  {
    id: "es-big",
    adjetivo: "big",
    es: "grande",
    silabas: "1 sílaba: big",
    regla: "er",
    comparativo: "bigger",
    superlativo: "the biggest",
    opcionesComp: ["bigger", "biger", "more big", "the bigger"],
    opcionesSup: ["the biggest", "the most big", "the bigest", "biggest"],
    porqueRegla:
      "«big» es de una sílaba y termina en consonante-vocal-consonante (b-i-g), así que la última consonante se duplica: bigger / the biggest.",
    ejemplo: "Guadalajara is bigger than Colima, but Mexico City is the biggest city in the country.",
  },
  {
    id: "es-healthy",
    adjetivo: "healthy",
    es: "saludable",
    silabas: "2 sílabas y termina en -y: heal-thy",
    regla: "y",
    comparativo: "healthier",
    superlativo: "the healthiest",
    opcionesComp: ["healthier", "healthyer", "more healthier", "the healthiest"],
    opcionesSup: ["the healthiest", "the healthyest", "the most healthiest", "healthiest"],
    porqueRegla:
      "Termina en -y después de consonante: la y se vuelve i y se añade -er / -est. healthy → healthier → the healthiest.",
    ejemplo: "Walking is healthier than driving, and cycling is the healthiest option.",
  },
  {
    id: "es-easy",
    adjetivo: "easy",
    es: "fácil",
    silabas: "2 sílabas y termina en -y: ea-sy",
    regla: "y",
    comparativo: "easier",
    superlativo: "the easiest",
    opcionesComp: ["easier", "more easier", "easyer", "more easy"],
    opcionesSup: ["the easiest", "the most easiest", "the easyest", "easiest"],
    porqueRegla: "Misma regla que healthy: easy → easier → the easiest. La y se convierte en i.",
    ejemplo: "This exercise is easier than the last one; it is the easiest one in the unit.",
  },
  {
    id: "es-interesting",
    adjetivo: "interesting",
    es: "interesante",
    silabas: "4 sílabas: in-te-res-ting",
    regla: "more",
    comparativo: "more interesting",
    superlativo: "the most interesting",
    opcionesComp: ["more interesting", "interestinger", "the more interesting", "most interesting"],
    opcionesSup: ["the most interesting", "the interestingest", "most interesting", "more interesting"],
    porqueRegla: "Con 2 sílabas o más (y sin -y al final) el adjetivo no cambia: se le pone more / the most delante.",
    ejemplo: "History is more interesting than I expected, and it is the most interesting class of my week.",
  },
  {
    id: "es-good",
    adjetivo: "good",
    es: "bueno",
    silabas: "1 sílaba, pero irregular",
    regla: "irregular",
    comparativo: "better",
    superlativo: "the best",
    opcionesComp: ["better", "gooder", "more good", "more better"],
    opcionesSup: ["the best", "the goodest", "the most good", "the better"],
    porqueRegla: "«good» no sigue ninguna regla: good → better → the best. No existe «gooder» ni «more better».",
    ejemplo: "This taquería is better than the one downtown — it is the best in the neighborhood.",
  },
  {
    id: "es-bad",
    adjetivo: "bad",
    es: "malo",
    silabas: "1 sílaba, pero irregular",
    regla: "irregular",
    comparativo: "worse",
    superlativo: "the worst",
    opcionesComp: ["worse", "badder", "more bad", "worst"],
    opcionesSup: ["the worst", "the baddest", "the most bad", "worst"],
    porqueRegla: "«bad» también es irregular: bad → worse → the worst. Ojo: «worse» compara, «the worst» es el extremo.",
    ejemplo: "Traffic today is worse than yesterday; Friday is the worst day of the week.",
  },
];

/**
 * Explica por qué una forma es incorrecta. Se usa tanto para el peldaño del
 * comparativo como para el del superlativo; las trampas son las mismas de
 * siempre y cada una tiene su explicación en español.
 */
export function explicaForma(escalon: Escalon, elegida: string, peldano: "comp" | "sup"): string {
  const trampas: Record<string, string> = {
    "more fast": "«fast» es de una sílaba: lleva -er, no «more». Lo correcto es faster than.",
    "more faster": "«more faster» junta las dos reglas a la vez. O «more» o «-er», nunca los dos: faster than.",
    fastest:
      peldano === "comp"
        ? "«fastest» es el superlativo, y además le falta «the». Para comparar dos cosas se usa faster than."
        : "Al superlativo le falta «the»: the fastest.",
    "the most fast": "Con un adjetivo de una sílaba el superlativo es the fastest, no «the most fast».",
    "the faster": "«the faster» no es superlativo. El superlativo de fast es the fastest.",
    biger: "Falta duplicar la consonante: big termina en consonante-vocal-consonante → bigger.",
    "the bigest": "Misma consonante duplicada que en el comparativo: the biggest.",
    "more big": "«big» es de una sílaba: bigger, no «more big».",
    "the bigger": "«the bigger» compara dos cosas; el superlativo de big es the biggest.",
    "the most big": "big es corto: the biggest.",
    biggest: "Al superlativo le falta «the»: the biggest.",
    healthyer: "Cuando el adjetivo termina en -y, la y se vuelve i: healthier.",
    "more healthier": "Dos reglas juntas otra vez. Con healthy basta -ier: healthier than.",
    "the healthyest": "La y se vuelve i también en el superlativo: the healthiest.",
    "the most healthiest": "«the most» y «-iest» son la misma regla dos veces. Solo the healthiest.",
    "the healthiest": "Ése es el superlativo, el extremo de una serie. Para comparar dos cosas se usa healthier than.",
    healthiest: "Al superlativo le falta «the»: the healthiest.",
    "more easier":
      "Ésta es LA trampa clásica: «more easier» usa las dos reglas a la vez. O «more» o «-er», nunca los dos. easy → easier than.",
    easyer: "La y se convierte en i: easier.",
    "more easy": "«easy» termina en -y, así que lleva -ier: easier than.",
    "the most easiest": "Otra vez las dos reglas juntas. El superlativo es the easiest.",
    "the easyest": "La y se vuelve i: the easiest.",
    easiest: "Al superlativo le falta «the»: the easiest.",
    interestinger: "A un adjetivo de cuatro sílabas no se le pega -er. Se dice more interesting than.",
    "the more interesting": "«the more» no es superlativo. Se dice the most interesting.",
    "most interesting": "Al superlativo le falta «the»: the most interesting.",
    "more interesting": "Ése es el comparativo. El superlativo lleva the most: the most interesting.",
    "the interestingest": "A los adjetivos largos no se les pega -est: the most interesting.",
    gooder: "«gooder» no existe. good es irregular: good → better → the best.",
    "more good": "good es irregular: su comparativo es better.",
    "more better": "«better» ya es comparativo; ponerle «more» delante lo repite. Solo better than.",
    "the goodest": "No existe. El superlativo de good es the best.",
    "the most good": "good es irregular: the best.",
    "the better": "«the better» no es superlativo. El superlativo de good es the best.",
    badder: "«badder» no existe: bad es irregular. bad → worse → the worst.",
    "more bad": "bad es irregular: su comparativo es worse.",
    worst: peldano === "comp" ? "«worst» es el superlativo. Para comparar dos cosas se usa worse than." : "Al superlativo le falta «the»: the worst.",
    "the baddest": "No existe: el superlativo de bad es the worst.",
    "the most bad": "bad es irregular: the worst.",
  };
  const base = trampas[elegida];
  const correcta = peldano === "comp" ? escalon.comparativo : escalon.superlativo;
  if (base) return `«${elegida}» no. ${base}`;
  return `«${elegida}» no es la forma que toca. ${escalon.porqueRegla} La respuesta es «${correcta}».`;
}

/** Explica por qué la regla elegida no es la del adjetivo. */
export function explicaRegla(escalon: Escalon, elegida: Regla): string {
  const buena = REGLAS.find((r) => r.id === escalon.regla);
  const mala = REGLAS.find((r) => r.id === elegida);
  return `«${escalon.adjetivo}» no va con «${mala?.etiqueta ?? elegida}». ${escalon.porqueRegla} Le toca la regla «${buena?.etiqueta ?? escalon.regla}».`;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 2 — Los datos mandan
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface FilaDato {
  etiqueta: string;
  valor: string;
}

export interface ColumnaDato {
  nombre: string;
  filas: FilaDato[];
}

export interface OpcionDatos {
  texto: string;
  porque: string;
}

export interface TarjetaDatos {
  id: string;
  titulo: string;
  /** Cuántas cosas se comparan: decide si el superlativo está justificado. */
  cuantas: number;
  contexto: string;
  columnas: ColumnaDato[];
  opciones: OpcionDatos[];
  correcta: number;
  nota: string;
}

export const TARJETAS: TarjetaDatos[] = [
  {
    id: "td-rutas",
    titulo: "Two ways to get to school",
    cuantas: 2,
    contexto: "Dos formas de llegar a la escuela desde la misma colonia. Solo hay estas dos en la tabla.",
    columnas: [
      { nombre: "Route 1 — bus", filas: [{ etiqueta: "Time", valor: "25 min" }, { etiqueta: "Cost", valor: "$9.00" }] },
      { nombre: "Route 2 — walking", filas: [{ etiqueta: "Time", valor: "40 min" }, { etiqueta: "Cost", valor: "$0.00" }] },
    ],
    opciones: [
      {
        texto: "Route 1 is faster than Route 2.",
        porque: "25 minutos es menos que 40, así que la ruta 1 sí es la más rápida de las dos. Comparar DOS cosas pide comparativo: faster than.",
      },
      {
        texto: "Route 2 is faster than Route 1.",
        porque: "La oración está bien escrita, pero dice lo contrario de la tabla: la ruta 2 tarda 40 minutos y la 1, 25.",
      },
      {
        texto: "Route 1 is the fastest route in the city.",
        porque: "El superlativo afirma que es la más rápida de TODAS las rutas de la ciudad. En la tabla solo hay dos, así que los datos no sostienen esa afirmación.",
      },
      {
        texto: "Route 1 is more cheaper than Route 2.",
        porque: "Dos errores a la vez: «more cheaper» repite la regla del comparativo, y además la ruta 1 cuesta $9.00 y la 2 es gratis, así que no es la barata.",
      },
    ],
    correcta: 0,
    nota: "Rutas y precios ilustrativos.",
  },
  {
    id: "td-telefonos",
    titulo: "Two phones at the store",
    cuantas: 2,
    contexto: "Dos modelos en el aparador. Los datos son los de la etiqueta.",
    columnas: [
      {
        nombre: "Phone A",
        filas: [{ etiqueta: "Price", valor: "$4,500" }, { etiqueta: "Battery", valor: "18 h" }, { etiqueta: "Storage", valor: "128 GB" }],
      },
      {
        nombre: "Phone B",
        filas: [{ etiqueta: "Price", valor: "$7,200" }, { etiqueta: "Battery", valor: "14 h" }, { etiqueta: "Storage", valor: "256 GB" }],
      },
    ],
    opciones: [
      {
        texto: "Phone B is cheaper than Phone A.",
        porque: "$7,200 es más que $4,500: el teléfono B es el caro. La oración es correcta en inglés, pero falsa según la tabla.",
      },
      {
        texto: "Phone A has a longer battery life than Phone B.",
        porque: "18 horas contra 14: el teléfono A dura más. «long» es de una sílaba, así que el comparativo es longer than.",
      },
      {
        texto: "Phone A is the most expensive phone.",
        porque: "Superlativo sin serie: solo hay dos teléfonos, y además el caro es el B. Con dos cosas se usa more expensive than.",
      },
      {
        texto: "Phone B is more better than Phone A.",
        porque: "«more better» repite el comparativo (better ya lo es) y, sobre todo, «mejor» no está en la tabla: la tabla trae precio, batería y almacenamiento, no una opinión.",
      },
    ],
    correcta: 1,
    nota: "Modelos y precios ilustrativos.",
  },
  {
    id: "td-clima",
    titulo: "Two cities, two climates",
    cuantas: 2,
    contexto: "Temperatura máxima promedio anual y lluvia acumulada al año, redondeadas.",
    columnas: [
      {
        nombre: "Mérida, Yucatán",
        filas: [{ etiqueta: "Average high", valor: "33 °C" }, { etiqueta: "Rain per year", valor: "1,000 mm" }],
      },
      {
        nombre: "Toluca, Estado de México",
        filas: [{ etiqueta: "Average high", valor: "22 °C" }, { etiqueta: "Rain per year", valor: "800 mm" }],
      },
    ],
    opciones: [
      {
        texto: "Mérida is more hot than Toluca.",
        porque: "El dato es correcto, pero la forma no: «hot» es de una sílaba y duplica la consonante → hotter than.",
      },
      {
        texto: "Mérida is the hottest city in Mexico.",
        porque: "La tabla compara DOS ciudades; el superlativo habla de todo el país. Mexicali, por ejemplo, supera a Mérida en verano.",
      },
      {
        texto: "Mérida is hotter than Toluca.",
        porque: "33 °C contra 22 °C. «hot» es de una sílaba y termina en consonante-vocal-consonante, así que duplica la t: hotter than.",
      },
      {
        texto: "Toluca is rainier than Mérida.",
        porque: "La forma es correcta (rainy → rainier), pero los datos dicen lo contrario: en Mérida llueven 1,000 mm y en Toluca, 800.",
      },
    ],
    correcta: 2,
    nota: "Cifras redondeadas a partir de las normales climatológicas; sirven para comparar dos ciudades, no como dato de reporte.",
  },
  {
    id: "td-gimnasio",
    titulo: "How often do they go?",
    cuantas: 2,
    contexto: "Cuántas veces por semana va cada quien al gimnasio de la colonia.",
    columnas: [
      { nombre: "Ana", filas: [{ etiqueta: "Gym", valor: "4 times a week" }] },
      { nombre: "Luis", filas: [{ etiqueta: "Gym", valor: "2 times a week" }] },
    ],
    opciones: [
      {
        texto: "Ana goes to the gym more often than Luis.",
        porque: "La frecuencia también se compara: 4 veces contra 2. «often» lleva more … than, y así se compara un HÁBITO, no a las personas.",
      },
      {
        texto: "Luis goes to the gym more often than Ana.",
        porque: "Los números dicen lo contrario: Luis va 2 veces y Ana, 4.",
      },
      {
        texto: "Ana goes to the gym the most often.",
        porque: "Superlativo con solo dos personas en la tabla. Para dos se usa el comparativo: more often than.",
      },
      {
        texto: "Ana goes to the gym more oftener than Luis.",
        porque: "«more oftener» es la misma regla dos veces. Basta con more often than.",
      },
    ],
    correcta: 0,
    nota: "Personas ficticias.",
  },
  {
    id: "td-lectura",
    titulo: "Three readers",
    cuantas: 3,
    contexto: "Libros que leyó cada quien el mes pasado. Aquí sí hay tres.",
    columnas: [
      { nombre: "Mateo", filas: [{ etiqueta: "Books last month", valor: "1" }] },
      { nombre: "Sofía", filas: [{ etiqueta: "Books last month", valor: "3" }] },
      { nombre: "Daniela", filas: [{ etiqueta: "Books last month", valor: "5" }] },
    ],
    opciones: [
      {
        texto: "Sofía reads the most books of the three.",
        porque: "Sofía va en medio con 3. La que está en el extremo es Daniela, con 5.",
      },
      {
        texto: "Daniela reads more books than the three.",
        porque: "Daniela es una de las tres: no puede compararse con un grupo que la incluye. Para el extremo de una serie se usa el superlativo.",
      },
      {
        texto: "Daniela reads the most books of the three.",
        porque: "Aquí SÍ toca superlativo: hay tres personas y Daniela está en el extremo. La fórmula es the most + sustantivo + of the three.",
      },
      {
        texto: "Daniela is the most reader of the three.",
        porque: "«reader» es un sustantivo, y «the most reader» no existe. Lo que se compara es cuántos libros lee: the most books.",
      },
    ],
    correcta: 2,
    nota: "Personas ficticias.",
  },
  {
    id: "td-cafe",
    titulo: "Same price, two cafés",
    cuantas: 2,
    contexto: "El café de la misma medida en dos cafeterías del centro.",
    columnas: [
      { nombre: "Café Luna", filas: [{ etiqueta: "Coffee (12 oz)", valor: "$35" }] },
      { nombre: "Café Sol", filas: [{ etiqueta: "Coffee (12 oz)", valor: "$35" }] },
    ],
    opciones: [
      {
        texto: "Coffee at Café Luna is more expensive than at Café Sol.",
        porque: "Cuestan lo mismo: ningún comparativo es verdadero aquí.",
      },
      {
        texto: "Coffee at Café Sol is cheaper than at Café Luna.",
        porque: "Tampoco: $35 contra $35. Ninguno es más barato.",
      },
      {
        texto: "Café Luna is the most expensive café in the city.",
        porque: "Además de que cuestan igual, el superlativo hablaría de todas las cafeterías de la ciudad, y en la tabla solo hay dos.",
      },
      {
        texto: "Coffee at Café Luna is as expensive as coffee at Café Sol.",
        porque: "Cuando los datos son IGUALES ningún comparativo sirve: se usa as + adjetivo + as. Es justo lo que practica el siguiente modo.",
      },
    ],
    correcta: 3,
    nota: "Cafeterías y precios ilustrativos.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 3 — as … as / not as … as
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface Equivalencia {
  pregunta: string;
  opciones: string[];
  correcta: number;
  porque: string;
}

export interface RondaIgualdad {
  id: string;
  datos: string;
  /** Lo que hay que decir, en español. */
  intencion: string;
  negativa: boolean;
  /** Las piezas en el orden correcto. */
  solucion: string[];
  /** El mazo: las piezas correctas más las trampas, en orden estable. */
  piezas: string[];
  regla: string;
  equivalencia?: Equivalencia;
}

export const IGUALDADES: RondaIgualdad[] = [
  {
    id: "ig-cafe",
    datos: "Café Luna $35 · Café Sol $35",
    intencion: "Los dos cafés cuestan lo mismo.",
    negativa: false,
    solucion: ["Coffee at Café Luna", "is", "as", "expensive", "as", "coffee at Café Sol"],
    piezas: ["as", "more expensive", "Coffee at Café Luna", "expensive", "than", "is", "as", "coffee at Café Sol", "the most expensive"],
    regla:
      "as + adjetivo en su forma BASE + as. Entre los dos «as» el adjetivo NO cambia: nunca «as more expensive as» ni «as expensiver as».",
  },
  {
    id: "ig-gym",
    datos: "Ana: 4 veces por semana · Sofía: 4 veces por semana",
    intencion: "Ana va al gimnasio con la misma frecuencia que Sofía.",
    negativa: false,
    solucion: ["Ana", "goes to the gym", "as", "often", "as", "Sofía"],
    piezas: ["often", "Ana", "as", "more often", "goes to the gym", "as", "than", "Sofía", "the most often"],
    regla: "Funciona igual con adverbios: as often as. También aquí la palabra del medio va en su forma base.",
  },
  {
    id: "ig-bus",
    datos: "Camión: 24 min · Bicicleta: 24 min",
    intencion: "El camión es tan rápido como la bicicleta.",
    negativa: false,
    solucion: ["The bus", "is", "as", "fast", "as", "the bike"],
    piezas: ["fast", "as", "The bus", "faster", "is", "as", "the bike", "than", "the fastest"],
    regla: "as fast as = exactamente lo mismo. Si pusieras «faster than» estarías afirmando una diferencia que los datos no tienen.",
  },
  {
    id: "ig-rutas",
    datos: "Ruta 1: 25 min · Ruta 2: 40 min",
    intencion: "La ruta 2 no es tan rápida como la ruta 1.",
    negativa: true,
    solucion: ["Route 2", "is not", "as", "fast", "as", "Route 1"],
    piezas: ["as", "Route 2", "is not", "fast", "as", "is", "Route 1", "faster", "than"],
    regla:
      "La negación se hace en el verbo, no en el adjetivo: is not as fast as. («isn't as fast as» es exactamente lo mismo, solo contraído.)",
    equivalencia: {
      pregunta: "¿Qué está diciendo esa oración en realidad?",
      opciones: ["Route 1 is faster than Route 2.", "Route 2 is faster than Route 1.", "Route 1 and Route 2 are equally fast."],
      correcta: 0,
      porque:
        "«not as … as» coloca a la primera cosa POR DEBAJO de la segunda. «Route 2 is not as fast as Route 1» y «Route 1 is faster than Route 2» dicen lo mismo; la primera suena más suave.",
    },
  },
  {
    id: "ig-telefono",
    datos: "Teléfono A $4,500 · Teléfono B $7,200",
    intencion: "El teléfono A no es tan caro como el B.",
    negativa: true,
    solucion: ["Phone A", "is not", "as", "expensive", "as", "Phone B"],
    piezas: ["expensive", "is not", "as", "Phone A", "as", "Phone B", "more expensive", "than", "is"],
    regla: "Otra vez: «not as» + adjetivo base + «as». El adjetivo sigue siendo expensive, no «more expensive».",
    equivalencia: {
      pregunta: "¿Qué está diciendo esa oración en realidad?",
      opciones: ["Phone B is more expensive than Phone A.", "Phone A is more expensive than Phone B.", "Both phones cost the same."],
      correcta: 0,
      porque: "Si A no llega al nivel de B en precio, entonces B es el caro: Phone B is more expensive than Phone A.",
    },
  },
  {
    id: "ig-luis",
    datos: "Luis: 2 veces por semana · Ana: 4 veces por semana",
    intencion: "Luis no va al gimnasio tan seguido como Ana.",
    negativa: true,
    solucion: ["Luis", "does not go to the gym", "as", "often", "as", "Ana"],
    piezas: ["as", "often", "Luis", "does not go to the gym", "as", "is not", "Ana", "more often", "than"],
    regla:
      "Con un verbo que no es «be», la negación va en el verbo (does not go) y la estructura no cambia: as often as. «is not go» no existe.",
    equivalencia: {
      pregunta: "¿Qué está diciendo esa oración en realidad?",
      opciones: [
        "Ana goes to the gym more often than Luis.",
        "Luis goes to the gym more often than Ana.",
        "They go to the gym the same number of times.",
      ],
      correcta: 0,
      porque: "Luis queda por debajo de Ana en frecuencia, así que Ana va más seguido: Ana goes to the gym more often than Luis.",
    },
  },
];

/** Explica por qué esa pieza no va en esa posición. */
export function explicaIgualdad(ronda: RondaIgualdad, pieza: string, posicion: number): string {
  const esperada = ronda.solucion[posicion] ?? "";
  const trampas: Record<string, string> = {
    than: "«than» es del comparativo (faster than). En la igualdad las dos palabras que sujetan al adjetivo son «as … as».",
    "more expensive": "Entre los dos «as» el adjetivo va en su forma base: as expensive as. «as more expensive as» no existe.",
    "more often": "Entre los dos «as» el adverbio va en su forma base: as often as.",
    faster: "Entre los dos «as» el adjetivo va en su forma base: as fast as.",
    "the most expensive": "Ése es el superlativo, para el extremo de una serie. Aquí las dos cosas están al mismo nivel: as expensive as.",
    "the most often": "Ése es el superlativo. Aquí van igual de seguido: as often as.",
    "the fastest": "Ése es el superlativo. Aquí tardan lo mismo: as fast as.",
  };
  const extra = trampas[pieza];
  if (extra) return `«${pieza}» no. ${extra}`;
  if (pieza === "is" && esperada === "is not") return "Falta la negación: la oración dice que NO llega al mismo nivel, así que va «is not».";
  if (pieza === "is not" && esperada === "is") return "Aquí no hay negación: las dos cosas están al mismo nivel, así que va «is».";
  if (pieza === "is not" && esperada === "does not go to the gym")
    return "«is not go» no existe: el verbo no es «be», es «go». La negación queda «does not go to the gym».";
  return `Aquí no va «${pieza}». En esta posición toca «${esperada}». ${ronda.regla}`;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Modo 4 — Preferencias
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface RanuraPref {
  /** La opción correcta para esta ranura. */
  correcta: string;
  opciones: string[];
  /** Por qué esa y no otra, según la opción equivocada que se toque. */
  errores: Record<string, string>;
}

export interface RondaPreferencia {
  id: string;
  /** Nombre de la estructura, tal como se enseña. */
  estructura: string;
  /** Familia: sirve para el objetivo de distinguir prefer de would rather. */
  familia: "prefer" | "rather" | "like";
  intencion: string;
  /** El marco de la oración: n+1 trozos para n ranuras. */
  partes: string[];
  ranuras: RanuraPref[];
  regla: string;
}

export const PREFERENCIAS: RondaPreferencia[] = [
  {
    id: "pr-cook",
    estructura: "prefer + -ing + to + -ing",
    familia: "prefer",
    intencion: "Prefiero cocinar en casa antes que comer fuera.",
    partes: ["I prefer ", " ", " eating out."],
    ranuras: [
      {
        correcta: "cooking",
        opciones: ["cooking", "to cook", "cook"],
        errores: {
          "to cook": "Si empiezas con «to cook», ya no puedes cerrar con «to eating out». La pareja que funciona aquí es -ing … to … -ing.",
          cook: "Después de «prefer» el verbo no va pelado: o «cooking» o «to cook». Aquí toca «cooking».",
        },
      },
      {
        correcta: "to",
        opciones: ["to", "than", "that"],
        errores: {
          than: "«than» es del comparativo (faster than). Con «prefer» se usa «to»: I prefer cooking TO eating out.",
          that: "«that» no une dos preferencias. La palabra es «to».",
        },
      },
    ],
    regla: "prefer + sustantivo o verbo-ing + to + sustantivo o verbo-ing. En español decimos «prefiero X a Y», y en inglés también es «to», nunca «than».",
  },
  {
    id: "pr-tea",
    estructura: "prefer + sustantivo + to + sustantivo",
    familia: "prefer",
    intencion: "A mi hermana le gusta más el té que el café.",
    partes: ["My sister prefers tea ", " coffee."],
    ranuras: [
      {
        correcta: "to",
        opciones: ["to", "than", "over than"],
        errores: {
          than: "«prefers tea than coffee» no existe. Con prefer siempre va «to»: prefers tea to coffee.",
          "over than": "«over than» no es inglés. Con prefer, «to»: prefers tea to coffee.",
        },
      },
    ],
    regla: "Con sustantivos la estructura es la misma: prefer A to B. Y ojo con la -s de prefers, que aquí el sujeto es «my sister».",
  },
  {
    id: "pr-walk",
    estructura: "would rather + base + than + base",
    familia: "rather",
    intencion: "Hoy preferiría caminar antes que tomar el camión.",
    partes: ["Today I'd rather ", " ", " ", " the bus."],
    ranuras: [
      {
        correcta: "walk",
        opciones: ["walk", "to walk", "walking"],
        errores: {
          "to walk": "Después de «would rather» el verbo va en forma BASE, sin «to»: I'd rather walk.",
          walking: "Después de «would rather» no se usa -ing: I'd rather walk, no «I'd rather walking».",
        },
      },
      {
        correcta: "than",
        opciones: ["than", "to", "that"],
        errores: {
          to: "«to» es de prefer. «would rather» se acompaña de «than»: I'd rather walk THAN take the bus.",
          that: "La palabra que une las dos opciones aquí es «than».",
        },
      },
      {
        correcta: "take",
        opciones: ["take", "to take", "taking"],
        errores: {
          "to take": "Después de «than», con would rather, el verbo también va en forma base: than take the bus.",
          taking: "Nada de -ing aquí: than take the bus.",
        },
      },
    ],
    regla: "would rather + verbo en forma BASE + than + verbo en forma BASE. Sin «to» y sin «-ing». «I'd» es la contracción de «I would».",
  },
  {
    id: "pr-question",
    estructura: "Would you rather …?",
    familia: "rather",
    intencion: "Preguntar: ¿preferirías salir o quedarte en casa?",
    partes: ["", " you rather ", " or stay home?"],
    ranuras: [
      {
        correcta: "Would",
        opciones: ["Would", "Do", "Are"],
        errores: {
          Do: "«Do you rather» no existe. La estructura lleva «would»: Would you rather…?",
          Are: "«Are you rather» tampoco. La pregunta empieza con Would.",
        },
      },
      {
        correcta: "go out",
        opciones: ["go out", "to go out", "going out"],
        errores: {
          "to go out": "Forma base después de «rather», también en la pregunta: Would you rather go out…?",
          "going out": "Sin -ing: Would you rather go out or stay home?",
        },
      },
    ],
    regla: "En pregunta la estructura no cambia: Would you rather + verbo base + or + verbo base? Fíjate en que «stay» también está en forma base.",
  },
  {
    id: "pr-run",
    estructura: "like + -ing + better than + -ing",
    familia: "like",
    intencion: "Me gusta más correr que nadar.",
    partes: ["I like running ", " ", " swimming."],
    ranuras: [
      {
        correcta: "better",
        opciones: ["better", "more better", "best"],
        errores: {
          "more better": "«better» ya es comparativo; «more better» lo repite. Solo «better than».",
          best: "«best» es superlativo y compararía con todo. Entre dos cosas va «better than».",
        },
      },
      {
        correcta: "than",
        opciones: ["than", "to", "that"],
        errores: {
          to: "«to» es la pareja de prefer. La pareja de «better» es «than»: I like running better than swimming.",
          that: "La palabra es «than».",
        },
      },
    ],
    regla: "like A better than B. Es la manera más coloquial de decir lo mismo que «prefer A to B», y cambia la palabra del final: «than», no «to».",
  },
  {
    id: "pr-mateo",
    estructura: "like … better than + would rather, en la misma oración",
    familia: "rather",
    intencion: "A Mateo le gusta más el té que el café, pero hoy preferiría un café.",
    partes: ["Mateo likes tea ", " ", " coffee, but today he'd rather ", " a coffee."],
    ranuras: [
      {
        correcta: "better",
        opciones: ["better", "more", "the best"],
        errores: {
          more: "Con «like» la fórmula fija que estamos practicando es «better than». («likes tea more than coffee» también se oye, pero aquí queremos la estructura completa.)",
          "the best": "Superlativo para comparar dos bebidas, no. Va «better than».",
        },
      },
      {
        correcta: "than",
        opciones: ["than", "to", "as"],
        errores: {
          to: "«to» va con prefer. Con «better» va «than».",
          as: "«as» es de la igualdad (as good as). Aquí hay una diferencia: better than.",
        },
      },
      {
        correcta: "have",
        opciones: ["have", "to have", "having"],
        errores: {
          "to have": "Después de «rather», forma base: he'd rather have a coffee.",
          having: "Sin -ing después de «rather»: he'd rather have a coffee.",
        },
      },
    ],
    regla:
      "Una misma idea, dos estructuras: «likes tea better than coffee» habla del gusto de siempre, y «he'd rather have a coffee» de lo que quiere HOY.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * Contenido verbatim de la base de datos
 * ═══════════════════════════════════════════════════════════════════════════ */

/** A4 — quiz_verdadero_falso, verbatim. */
export interface Hecho {
  enunciado: string;
  respuesta: boolean;
  retro: string;
}

export const HECHOS: Hecho[] = [
  {
    enunciado: "El superlativo de adjetivos cortos se forma con 'the + adjetivo + -est' ('the tallest').",
    respuesta: true,
    retro: "Correcto: tall → the tallest.",
  },
  {
    enunciado: "El superlativo de adjetivos largos usa 'the most' ('the most interesting').",
    respuesta: true,
    retro: "Sí: con adjetivos de 2+ sílabas se usa 'the most'.",
  },
  {
    enunciado: "Después de 'like' se puede usar un sustantivo o un verbo con -ing ('I like music / I like dancing').",
    respuesta: true,
    retro: "Correcto: like + noun o like + verb-ing.",
  },
  {
    enunciado: "El adverbio 'rarely' significa 'siempre'.",
    respuesta: false,
    retro: "'Rarely' significa 'raramente/casi nunca'. 'Always' significa 'siempre'.",
  },
  {
    enunciado: "'Good' tiene el superlativo irregular 'the best'.",
    respuesta: true,
    retro: "Sí: good → better (comparativo) → the best (superlativo).",
  },
];

/** A1 — preguntas de comprensión de la lectura, verbatim. */
export const COMPRENSION_A1: { pregunta: string; guia: string }[] = [
  { pregunta: "What is the superlative of 'good'?", guia: "The superlative of 'good' is 'the best'. It is irregular." },
  {
    pregunta: "What structure do we use to express things we enjoy in English?",
    guia: "Like + verb-ing. Example: I like swimming. She likes reading.",
  },
  {
    pregunta: "Where do frequency adverbs go in a sentence?",
    guia: "Before the main verb, but after the verb 'be'. Example: She always studies. He is usually tired.",
  },
  {
    pregunta: "What is the difference between 'often' and 'rarely'?",
    guia: "'Often' means about 70% of the time (frecuentemente). 'Rarely' means about 20% of the time (rara vez).",
  },
];

/** A5 — actividad final del glosario, verbatim. */
export const ACTIVIDAD_FINAL_A5 =
  "Escribe 5 oraciones sobre tus hábitos y preferencias. Usa al menos 1 superlativo, 1 comparativo y 2 adverbios de frecuencia.";

/** A7 — criterios de la autoevaluación, verbatim. */
export const CRITERIOS_A7: string[] = [
  "Uso adverbios de frecuencia (always, often, rarely, never) correctamente.",
  "Formo comparativos correctos (-er than / more...than).",
  "Formo superlativos correctos (the -est / the most).",
  "Expreso preferencias con 'like + noun/verb-ing' y 'prefer...to'.",
];

/** A1 — escala de los adverbios de frecuencia, verbatim (queda como consulta). */
export const ESCALA_FRECUENCIA: { adverbio: string; es: string; pct: string }[] = [
  { adverbio: "always", es: "siempre", pct: "100%" },
  { adverbio: "usually / normally", es: "normalmente", pct: "80%" },
  { adverbio: "often / frequently", es: "frecuentemente", pct: "70%" },
  { adverbio: "sometimes", es: "a veces", pct: "50%" },
  { adverbio: "rarely / seldom", es: "rara vez", pct: "20%" },
  { adverbio: "never", es: "nunca", pct: "0%" },
];

/** A3 — reto evaluable de opción múltiple, verbatim (5 reactivos, mínimo 70%). */
export const RETO_QUIZ = {
  titulo: "Quiz: Comparatives and Habits",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "Choose the correct comparative form:",
      opciones: [
        "She is tallest than her sister.",
        "She is taller than her sister.",
        "She is the most tall than her sister.",
        "She is more tall than her sister.",
      ],
      respuestaCorrecta: 1,
      retroalimentacion: "'Tall' is a one-syllable adjective, so we add -er: 'taller than'. 'More tall' is incorrect for single-syllable adjectives.",
    },
    {
      enunciado: "Which sentence uses 'like + verb-ing' correctly?",
      opciones: [
        "He likes to swimming in the morning.",
        "He likes swim in the morning.",
        "He like swimming in the morning.",
        "He likes swimming in the morning.",
      ],
      respuestaCorrecta: 3,
      retroalimentacion: "'Like' (with third person -s) + verb-ing: 'He likes swimming'. Not 'to swimming' or 'swim' after like.",
    },
    {
      enunciado: "Where does the frequency adverb go in: 'She ___ is ___ late for class'?",
      opciones: ["--- / always", "never / never", "always / ---", "--- / never"],
      respuestaCorrecta: 0,
      retroalimentacion: "Frequency adverbs go AFTER the verb 'be'. Correct: 'She is always late for class.'",
    },
    {
      enunciado: "Choose the correct superlative:",
      opciones: [
        "This is the goodest pizza I've eaten.",
        "This is the most good pizza I've eaten.",
        "This is the best pizza I've eaten.",
        "This is the better pizza I've eaten.",
      ],
      respuestaCorrecta: 2,
      retroalimentacion: "'Good' is irregular. Comparative: better. Superlative: the best.",
    },
    {
      enunciado: "Complete: 'Cycling is ___ walking for long distances.'",
      opciones: ["the fastest", "more fast than", "fastest than", "faster than"],
      respuestaCorrecta: 3,
      retroalimentacion: "'Fast' is one syllable: faster than. 'More fast' is incorrect for one-syllable adjectives.",
    },
  ],
};

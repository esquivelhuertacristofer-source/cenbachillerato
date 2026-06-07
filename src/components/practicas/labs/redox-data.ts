/**
 * Módulo de DATOS puro del laboratorio "Reacciones redox y combustión".
 * PROHIBIDO importar three / @react-three aquí (límite 3 MiB gzipped del
 * Worker de Cloudflare). Solo química, matemática y texto verbatim.
 *
 * Anclado a CNEYT-IV-P09-A2 (ejercicio; propósito formativo O5, UAC CNEYT-IV
 * "El poder de la química"). Contenido formativo oficial 2025:
 *   "Reacciones de oxidación-reducción. Reacciones de combustión. Reacciones
 *    redox y de combustión en la naturaleza y la vida cotidiana. Importancia de
 *    las reacciones redox y de combustión para los seres vivos y la industria."
 *
 * Cuatro modos:
 *  (1) redox      — transferencia de electrones: quién se oxida (pierde e⁻) y
 *                   quién se reduce (gana e⁻); números de oxidación.
 *  (2) combustion — reacción exotérmica con O₂; completa vs incompleta; ΔH.
 *  (3) pila       — celda galvánica de Daniell: el redox que genera corriente.
 *  (4) comparar   — los tres procesos lado a lado.
 */

export type Modo = "redox" | "combustion" | "pila" | "comparar";

export const MODOS: Modo[] = ["redox", "combustion", "pila", "comparar"];

export interface ModoDef {
  etq: string;
  subtitulo: string;
  icono: string; // font-awesome
  color: string; // hex sin #
}

export const MODOS_DEF: Record<Modo, ModoDef> = {
  redox: {
    etq: "Óxido-reducción",
    subtitulo: "transferencia de electrones",
    icono: "fa-right-left",
    color: "#34d399",
  },
  combustion: {
    etq: "Combustión",
    subtitulo: "reacción exotérmica con O₂",
    icono: "fa-fire",
    color: "#fb923c",
  },
  pila: {
    etq: "Pila galvánica",
    subtitulo: "el redox que da corriente",
    icono: "fa-car-battery",
    color: "#38bdf8",
  },
  comparar: {
    etq: "Comparar",
    subtitulo: "los tres procesos lado a lado",
    icono: "fa-layer-group",
    color: "#a78bfa",
  },
};

// ── Fases (pasos) de cada proceso ──────────────────────────────────────────
export const FASES: Record<Exclude<Modo, "comparar">, string[]> = {
  redox: ["Reactivos separados", "Contacto", "El Zn cede 2 e⁻", "El Cu²⁺ los gana", "Zn²⁺ + Cu sólido"],
  combustion: ["Combustible + O₂", "Chispa de ignición", "Llama (oxidación)", "Se libera calor", "CO₂ + H₂O + energía"],
  pila: ["Celdas en reposo", "Se cierra el circuito", "Ánodo: Zn → Zn²⁺", "e⁻ por el cable", "Cátodo: Cu²⁺ → Cu"],
};

export function numFases(modo: Modo): number {
  if (modo === "comparar") return 1;
  return FASES[modo].length;
}

export interface Escena {
  modo: Modo;
  nombre: string;
  desc: string;
  /** etiqueta corta del proceso */
  medio: string;
  /** avance del proceso 0..1 (lo usa la escena 3D para animar) */
  frac: number;
}

export function escenaPara(modo: Modo, idx: number): Escena {
  if (modo === "comparar") {
    return {
      modo,
      nombre: "Redox · Combustión · Pila",
      desc: "Tres caras del mismo fenómeno: en todas hay transferencia de electrones. La combustión es un redox muy rápido y la pila es un redox que separamos para aprovechar la corriente.",
      medio: "electrones en juego",
      frac: 1,
    };
  }
  const fases = FASES[modo];
  const i = Math.max(0, Math.min(fases.length - 1, idx));
  const frac = fases.length > 1 ? i / (fases.length - 1) : 1;
  const medio = modo === "redox" ? "transferencia directa" : modo === "combustion" ? "oxidación rápida con O₂" : "transferencia por un cable";

  const DESCS: Record<Exclude<Modo, "comparar">, string[]> = {
    redox: [
      "Tenemos zinc metálico (Zn⁰) y una disolución con iones cobre (Cu²⁺) por separado.",
      "Sumergimos la lámina de zinc en la disolución azul de sulfato de cobre.",
      "El zinc se oxida: cada átomo cede 2 electrones y pasa a Zn²⁺ (es el agente reductor).",
      "Los iones Cu²⁺ se reducen: ganan esos 2 electrones (son el agente oxidante).",
      "Resultado: Zn + Cu²⁺ → Zn²⁺ + Cu⁰. El cobre se deposita y la lámina se cubre de rojizo.",
    ],
    combustion: [
      "Partimos de un combustible (metano CH₄) mezclado con oxígeno del aire (O₂).",
      "Una chispa aporta la energía de activación que enciende la mezcla.",
      "Arde con llama: el carbono y el hidrógeno se oxidan rápidamente con el O₂.",
      "La reacción es exotérmica: libera gran cantidad de calor y luz.",
      "Combustión completa: CH₄ + 2O₂ → CO₂ + 2H₂O + energía (ΔH = −890 kJ/mol).",
    ],
    pila: [
      "Dos semiceldas: Zn en Zn²⁺ y Cu en Cu²⁺, unidas por un puente salino.",
      "Cerramos el circuito externo con un cable y un foco o voltímetro.",
      "En el ánodo (−) el zinc se oxida: Zn → Zn²⁺ + 2e⁻.",
      "Los electrones viajan por el cable: esa corriente enciende el foco.",
      "En el cátodo (+) el cobre se reduce: Cu²⁺ + 2e⁻ → Cu. E°pila = +1.10 V.",
    ],
  };
  return { modo, nombre: fases[i] ?? "", desc: DESCS[modo][i] ?? "", medio, frac };
}

// ── Constantes ──────────────────────────────────────────────────────────────
/** Constante de Faraday (C/mol e⁻). */
export const FARADAY = 96485;

// ── Potenciales estándar de reducción E° (V, vs EEH) ────────────────────────
export interface ParRedox {
  simbolo: string;
  nombre: string;
  /** semirreacción de reducción */
  semirreaccion: string;
  /** potencial estándar de reducción en volts */
  eRed: number;
  /** electrones intercambiados */
  n: number;
}

/** Ordenada de menor a mayor poder oxidante (serie de actividad). */
export const PARES_REDOX: ParRedox[] = [
  { simbolo: "Li⁺/Li", nombre: "Litio", semirreaccion: "Li⁺ + e⁻ → Li", eRed: -3.04, n: 1 },
  { simbolo: "K⁺/K", nombre: "Potasio", semirreaccion: "K⁺ + e⁻ → K", eRed: -2.93, n: 1 },
  { simbolo: "Ca²⁺/Ca", nombre: "Calcio", semirreaccion: "Ca²⁺ + 2e⁻ → Ca", eRed: -2.87, n: 2 },
  { simbolo: "Na⁺/Na", nombre: "Sodio", semirreaccion: "Na⁺ + e⁻ → Na", eRed: -2.71, n: 1 },
  { simbolo: "Mg²⁺/Mg", nombre: "Magnesio", semirreaccion: "Mg²⁺ + 2e⁻ → Mg", eRed: -2.37, n: 2 },
  { simbolo: "Al³⁺/Al", nombre: "Aluminio", semirreaccion: "Al³⁺ + 3e⁻ → Al", eRed: -1.66, n: 3 },
  { simbolo: "Zn²⁺/Zn", nombre: "Zinc", semirreaccion: "Zn²⁺ + 2e⁻ → Zn", eRed: -0.76, n: 2 },
  { simbolo: "Fe²⁺/Fe", nombre: "Hierro", semirreaccion: "Fe²⁺ + 2e⁻ → Fe", eRed: -0.44, n: 2 },
  { simbolo: "Pb²⁺/Pb", nombre: "Plomo", semirreaccion: "Pb²⁺ + 2e⁻ → Pb", eRed: -0.13, n: 2 },
  { simbolo: "H⁺/H₂", nombre: "Hidrógeno", semirreaccion: "2H⁺ + 2e⁻ → H₂", eRed: 0.0, n: 2 },
  { simbolo: "Cu²⁺/Cu", nombre: "Cobre", semirreaccion: "Cu²⁺ + 2e⁻ → Cu", eRed: 0.34, n: 2 },
  { simbolo: "Ag⁺/Ag", nombre: "Plata", semirreaccion: "Ag⁺ + e⁻ → Ag", eRed: 0.8, n: 1 },
  { simbolo: "Au³⁺/Au", nombre: "Oro", semirreaccion: "Au³⁺ + 3e⁻ → Au", eRed: 1.5, n: 3 },
];

export function parPorSimbolo(simbolo: string): ParRedox {
  return PARES_REDOX.find((p) => p.simbolo === simbolo) ?? PARES_REDOX[0]!;
}

// ── Combustibles: entalpía de combustión ΔH (kJ/mol) ────────────────────────
export interface Combustible {
  nombre: string;
  formula: string;
  /** entalpía de combustión (kJ/mol), negativa = exotérmica */
  deltaH: number;
  /** ecuación balanceada de combustión completa */
  ecuacion: string;
}

export const COMBUSTIBLES: Combustible[] = [
  { nombre: "Metano", formula: "CH₄", deltaH: -890, ecuacion: "CH₄ + 2O₂ → CO₂ + 2H₂O" },
  { nombre: "Propano", formula: "C₃H₈", deltaH: -2220, ecuacion: "C₃H₈ + 5O₂ → 3CO₂ + 4H₂O" },
  { nombre: "Butano", formula: "C₄H₁₀", deltaH: -2877, ecuacion: "2C₄H₁₀ + 13O₂ → 8CO₂ + 10H₂O" },
  { nombre: "Octano (gasolina)", formula: "C₈H₁₈", deltaH: -5470, ecuacion: "2C₈H₁₈ + 25O₂ → 16CO₂ + 18H₂O" },
  { nombre: "Etanol", formula: "C₂H₅OH", deltaH: -1367, ecuacion: "C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O" },
  { nombre: "Hidrógeno", formula: "H₂", deltaH: -286, ecuacion: "2H₂ + O₂ → 2H₂O" },
  { nombre: "Carbono", formula: "C", deltaH: -394, ecuacion: "C + O₂ → CO₂" },
  { nombre: "Glucosa", formula: "C₆H₁₂O₆", deltaH: -2805, ecuacion: "C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O" },
];

export function combustiblePorNombre(nombre: string): Combustible {
  return COMBUSTIBLES.find((c) => c.nombre === nombre) ?? COMBUSTIBLES[0]!;
}

// ── Cálculos (exactos) ─────────────────────────────────────────────────────

/**
 * Potencial estándar de una pila: E°pila = E°cátodo − E°ánodo.
 * El cátodo es el par de mayor E°red (se reduce); el ánodo el de menor (se oxida).
 */
export function potencialCelda(eRedCatodo: number, eRedAnodo: number): number {
  return eRedCatodo - eRedAnodo;
}

/**
 * Dada una pareja de pares redox, determina cuál actúa de cátodo (mayor E°red)
 * y cuál de ánodo, y devuelve el potencial de la pila (siempre ≥ 0 si es espontánea).
 */
export function celdaEspontanea(a: ParRedox, b: ParRedox): {
  catodo: ParRedox;
  anodo: ParRedox;
  ePila: number;
} {
  const catodo = a.eRed >= b.eRed ? a : b;
  const anodo = a.eRed >= b.eRed ? b : a;
  return { catodo, anodo, ePila: potencialCelda(catodo.eRed, anodo.eRed) };
}

/** Energía liberada al quemar n moles de combustible: |ΔH|·n (kJ). */
export function energiaCombustion(deltaH: number, moles: number): number {
  return Math.abs(deltaH) * moles;
}

/**
 * Energía eléctrica máxima de una pila: W = n·F·E°pila (J), con n electrones
 * por fórmula y F la constante de Faraday.
 */
export function energiaElectrica(n: number, ePila: number): number {
  return n * FARADAY * ePila;
}

/** ¿La reacción A desplaza al metal B? (A se oxida si su E°red es menor). */
export function desplaza(a: ParRedox, b: ParRedox): boolean {
  return a.eRed < b.eRed;
}

// ── Formato ────────────────────────────────────────────────────────────────
export function fmtNum(n: number, dec = 2): string {
  if (!isFinite(n)) return "∞";
  const abs = Math.abs(n);
  if (abs !== 0 && (abs >= 1e5 || abs < 1e-2)) {
    return n.toExponential(2).replace("e+", "×10^").replace("e-", "×10^-");
  }
  return n.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 });
}

export function fmtEntero(n: number): string {
  return Math.round(n).toLocaleString("es-MX");
}

// ── Tabla comparativa de los tres procesos ─────────────────────────────────
export interface FilaComparacion {
  rasgo: string;
  redox: string;
  combustion: string;
  pila: string;
}

export const COMPARACION: FilaComparacion[] = [
  { rasgo: "Qué ocurre", redox: "Transferencia de e⁻ entre especies", combustion: "Oxidación rápida con O₂", pila: "Redox separado en dos electrodos" },
  { rasgo: "¿Es redox?", redox: "Sí (caso general)", combustion: "Sí (un redox muy veloz)", pila: "Sí (aprovechado eléctricamente)" },
  { rasgo: "Energía", redox: "Puede liberar o absorber", combustion: "Libera calor y luz (exotérmica)", pila: "Produce corriente eléctrica" },
  { rasgo: "Ecuación tipo", redox: "Zn + Cu²⁺ → Zn²⁺ + Cu", combustion: "CH₄ + 2O₂ → CO₂ + 2H₂O", pila: "E°pila = E°cát − E°ánodo" },
  { rasgo: "Ejemplo cotidiano", redox: "Herrumbre del hierro, fotosíntesis", combustion: "Estufa, motor, fogata", pila: "Pila AA, batería del celular y del auto" },
];

// ── Contenido didáctico (verbatim-fiel a CNEYT-IV·O5) ───────────────────────

export const PROBLEMA =
  "Muchas de las reacciones que sostienen la vida y la industria son de óxido-reducción: " +
  "una especie pierde electrones (se oxida) mientras otra los gana (se reduce). En este laboratorio " +
  "observas en 3D tres caras del mismo fenómeno: el redox directo (zinc que desplaza al cobre), la " +
  "combustión (un redox muy rápido con O₂ que libera calor) y la pila galvánica (un redox que " +
  "separamos para aprovechar su corriente). Después calcula el potencial de una pila con los " +
  "potenciales estándar y la energía liberada por un combustible.";

export const INSTRUCCIONES: Record<Modo, string[]> = {
  redox: [
    "Elige el modo Óxido-reducción y observa el zinc y la disolución de cobre por separado.",
    "Reproduce las fases: el zinc cede 2 electrones y los iones Cu²⁺ los reciben.",
    "Identifica quién se oxida (Zn, el reductor) y quién se reduce (Cu²⁺, el oxidante).",
    "Relaciónalo con la herrumbre: el hierro se oxida al ceder electrones al oxígeno.",
  ],
  combustion: [
    "Elige el modo Combustión y observa el combustible mezclado con oxígeno.",
    "Reproduce las fases: la chispa enciende la mezcla y aparece la llama.",
    "Nota que es un redox exotérmico: el carbono se oxida y se libera calor y luz.",
    "En la calculadora cambia el combustible y compara cuánta energía libera cada uno.",
  ],
  pila: [
    "Elige el modo Pila y observa las dos semiceldas Zn|Zn²⁺ y Cu²⁺|Cu.",
    "Reproduce las fases: al cerrar el circuito los electrones viajan por el cable.",
    "Sigue el flujo: salen del ánodo de zinc (−) y llegan al cátodo de cobre (+).",
    "Calcula E°pila = E°cátodo − E°ánodo = 0.34 − (−0.76) = +1.10 V (pila de Daniell).",
  ],
  comparar: [
    "Usa el modo Comparar para ver los tres procesos al mismo tiempo.",
    "Revisa la tabla: en los tres hay transferencia de electrones.",
    "Distingue la diferencia: la combustión libera el calor de golpe; la pila lo entrega como corriente.",
    "Concluye por qué decimos que la combustión y la pila son casos de redox.",
  ],
};

export const PREGUNTAS: Record<Modo, string[]> = {
  redox: [
    "En Zn + Cu²⁺ → Zn²⁺ + Cu, ¿quién es el agente reductor y quién el oxidante?",
    "¿Por qué la herrumbre del hierro es una reacción de óxido-reducción?",
    "Si el número de oxidación de un átomo baja, ¿se oxidó o se redujo?",
  ],
  combustion: [
    "¿Por qué la combustión es a la vez una reacción redox y una reacción exotérmica?",
    "¿Qué diferencia hay entre combustión completa (CO₂) e incompleta (CO, hollín)?",
    "¿Por qué el octano de la gasolina libera mucha más energía que el metano?",
  ],
  pila: [
    "¿Por qué los electrones salen del electrodo de zinc y no del de cobre?",
    "Si en vez de cobre usaras plata (E°=+0.80 V), ¿la pila daría más o menos voltaje?",
    "¿Qué función cumple el puente salino en una pila galvánica?",
  ],
  comparar: [
    "¿Qué tienen en común una fogata, la herrumbre y la pila de tu control remoto?",
    "¿Cuál de los tres procesos convierte la energía química en eléctrica?",
    "¿Por qué la respiración celular se considera una 'combustión' lenta y controlada?",
  ],
};

export const IDEAS: string[] = [
  "En toda reacción redox hay transferencia de electrones: lo que se oxida pierde electrones y lo que se reduce los gana, siempre al mismo tiempo.",
  "El agente reductor es quien se oxida (cede e⁻); el agente oxidante es quien se reduce (gana e⁻).",
  "El número de oxidación sube cuando un átomo se oxida y baja cuando se reduce; sirve para identificar el redox.",
  "La combustión es un redox rápido con oxígeno que libera calor y luz; es exotérmica (ΔH negativa).",
  "En la combustión completa el carbono termina en CO₂; en la incompleta queda CO (tóxico) u hollín por falta de O₂.",
  "Una pila galvánica separa el redox en dos electrodos para que los electrones circulen por un cable: E°pila = E°cátodo − E°ánodo.",
  "El redox sostiene la vida (fotosíntesis y respiración) y a la industria (metalurgia, combustibles, baterías).",
];

export const GLOSARIO: { termino: string; definicion: string; ejemplo: string }[] = [
  { termino: "Oxidación", definicion: "Proceso en que una especie pierde electrones; su número de oxidación aumenta.", ejemplo: "Zn → Zn²⁺ + 2e⁻ (el zinc se oxida)." },
  { termino: "Reducción", definicion: "Proceso en que una especie gana electrones; su número de oxidación disminuye.", ejemplo: "Cu²⁺ + 2e⁻ → Cu (el cobre se reduce)." },
  { termino: "Agente reductor", definicion: "Especie que cede electrones (se oxida) y provoca la reducción de otra.", ejemplo: "El zinc en la reacción con el cobre." },
  { termino: "Agente oxidante", definicion: "Especie que gana electrones (se reduce) y provoca la oxidación de otra.", ejemplo: "El O₂ en una combustión; el Cu²⁺ frente al zinc." },
  { termino: "Número de oxidación", definicion: "Carga aparente de un átomo en un compuesto; sube al oxidarse y baja al reducirse.", ejemplo: "El C pasa de −4 en CH₄ a +4 en CO₂." },
  { termino: "Combustión", definicion: "Reacción redox rápida de un combustible con oxígeno que libera calor y luz.", ejemplo: "CH₄ + 2O₂ → CO₂ + 2H₂O + energía." },
  { termino: "Reacción exotérmica", definicion: "Reacción que libera energía al entorno; su ΔH es negativa.", ejemplo: "Toda combustión: la gasolina al arder." },
  { termino: "Pila galvánica", definicion: "Dispositivo que aprovecha un redox espontáneo para producir corriente eléctrica.", ejemplo: "La pila de Daniell Zn|Zn²⁺‖Cu²⁺|Cu, +1.10 V." },
  { termino: "Potencial de electrodo (E°)", definicion: "Tendencia de una semirreacción a reducirse, medida en volts frente al electrodo de hidrógeno.", ejemplo: "E°(Cu²⁺/Cu) = +0.34 V; E°(Zn²⁺/Zn) = −0.76 V." },
];

export const CONTEXTO =
  "En México las reacciones redox y de combustión están en todas partes: las refinerías de PEMEX " +
  "(Tula, Salina Cruz, Dos Bocas) queman y transforman hidrocarburos; las termoeléctricas de la CFE " +
  "convierten la combustión en electricidad; la herrumbre (corrosión del hierro) daña estructuras y " +
  "se combate con galvanizado; las pilas y baterías —desde la AA hasta la del auto y la del celular— " +
  "funcionan con redox controlado; y en nuestro cuerpo la respiración celular 'quema' glucosa para " +
  "obtener energía. Entender el redox permite producir energía, proteger metales y diseñar baterías.";

export const FUENTE =
  "MCCEMS 2025, Ciencias Naturales, Experimentales y Tecnología IV «El poder de la química», " +
  "propósito formativo O5 (reacciones de óxido-reducción y combustión) y su contenido formativo: " +
  "reacciones de oxidación-reducción, reacciones de combustión, su ocurrencia en la naturaleza y la " +
  "vida cotidiana, y su importancia para los seres vivos y la industria.";

export interface EjemploResuelto {
  enunciado: string;
  datos: string[];
  solucion: string;
  resultado: string;
}

export const EJEMPLO: EjemploResuelto = {
  enunciado:
    "Se arma la pila de Daniell con un electrodo de zinc en Zn²⁺ y uno de cobre en Cu²⁺. " +
    "Identifica la oxidación y la reducción, y calcula el potencial estándar de la pila. " +
    "Datos: E°(Cu²⁺/Cu) = +0.34 V; E°(Zn²⁺/Zn) = −0.76 V.",
  datos: ["E°(Cu²⁺/Cu) = +0.34 V (mayor → cátodo, se reduce)", "E°(Zn²⁺/Zn) = −0.76 V (menor → ánodo, se oxida)", "n = 2 electrones"],
  solucion:
    "El cobre tiene mayor E°red, así que es el cátodo (Cu²⁺ + 2e⁻ → Cu, reducción) y el zinc es el " +
    "ánodo (Zn → Zn²⁺ + 2e⁻, oxidación). El potencial es E°pila = E°cátodo − E°ánodo = " +
    "0.34 − (−0.76) = +1.10 V. Como es positivo, la reacción Zn + Cu²⁺ → Zn²⁺ + Cu es espontánea.",
  resultado: "E°pila = +1.10 V (pila de Daniell, espontánea).",
};

export interface DatoClave {
  valor: string;
  texto: string;
  icono: string;
}

export const DATOS: DatoClave[] = [
  { valor: "+1.10 V", texto: "Potencial estándar de la pila de Daniell (Zn–Cu).", icono: "fa-bolt" },
  { valor: "−890 kJ/mol", texto: "Energía que libera la combustión del metano.", icono: "fa-fire" },
  { valor: "2 e⁻", texto: "Electrones que cede cada átomo de zinc al oxidarse.", icono: "fa-right-left" },
  { valor: "+0.34 V", texto: "Potencial de reducción del par Cu²⁺/Cu.", icono: "fa-plus" },
  { valor: "−0.76 V", texto: "Potencial de reducción del par Zn²⁺/Zn.", icono: "fa-minus" },
  { valor: "CO", texto: "Monóxido tóxico de la combustión incompleta por falta de O₂.", icono: "fa-skull-crossbones" },
];

export const HECHOS: string[] = [
  "La respiración celular es una 'combustión' lenta: tu cuerpo oxida glucosa (C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O) para obtener energía, la misma ecuación que arder, pero por pasos.",
  "La herrumbre es hierro oxidándose con el oxígeno y el agua; por eso se protege con zinc (galvanizado), que se oxida 'en su lugar'.",
  "La fotosíntesis es el redox inverso a la combustión: usa energía solar para reducir el CO₂ a glucosa y liberar O₂.",
  "Una pila convierte energía química en eléctrica sin llama; la de tu celular es litio, con un E° muy negativo (−3.04 V) que la hace muy energética.",
  "El monóxido de carbono (CO) de una combustión incompleta es tan peligroso porque se une a la hemoglobina mejor que el oxígeno.",
];

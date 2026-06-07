/**
 * Datos y química PURA del laboratorio "Estructura de una reacción química"
 * (CNEYT-III·O4 — UAC "Nuestro hogar. El sistema terrestre").
 *
 * Propósito formativo O4 (verbatim): "Analiza la estructura de una reacción
 * química para comprender su importancia como proceso de transformación de la
 * materia."
 * Contenidos formativos C4 (verbatim): "Concepto de reacción química ·
 * Estructura de una reacción química · Ecuación química como forma de
 * representar una reacción · Simbología utilizada en fórmulas y reacciones
 * químicas."
 *
 * Este módulo es DATOS PUROS: el catálogo de reacciones reales (con la
 * composición atómica de cada especie), el conteo de átomos por elemento a
 * ambos lados de la flecha y la verificación de la conservación de la materia.
 * NO importa three / R3F (regla del Worker de Cloudflare ≤ 3 MiB gzip). La
 * escena 3D es esquemática (no a escala); las fórmulas, coeficientes y conteos
 * son exactos.
 */

export type Modo = "anatomia" | "conservacion" | "simbologia";
export const MODOS: Modo[] = ["anatomia", "conservacion", "simbologia"];

interface ModoDef {
  etq: string;
  subtitulo: string;
  icono: string;
  color: string;
}

export const MODOS_DEF: Record<Modo, ModoDef> = {
  anatomia: {
    etq: "Anatomía",
    subtitulo: "las partes de la ecuación",
    icono: "fa-diagram-project",
    color: "#34d399",
  },
  conservacion: {
    etq: "Conservación",
    subtitulo: "cuenta los átomos de cada lado",
    icono: "fa-scale-balanced",
    color: "#38bdf8",
  },
  simbologia: {
    etq: "Simbología",
    subtitulo: "qué dice cada símbolo",
    icono: "fa-icons",
    color: "#fbbf24",
  },
};

/* ── Estados de agregación (simbología de estado) ──────────────────────────── */
export type Estado = "s" | "l" | "g" | "ac";

export const ESTADO_DEF: Record<Estado, { etq: string; nombre: string; color: string }> = {
  s: { etq: "(s)", nombre: "sólido", color: "#cbd5e1" },
  l: { etq: "(l)", nombre: "líquido", color: "#60a5fa" },
  g: { etq: "(g)", nombre: "gas", color: "#fbbf24" },
  ac: { etq: "(ac)", nombre: "acuoso (disuelto en agua)", color: "#34d399" },
};

/* ── Catálogo de reacciones reales (balanceadas) ──────────────────────────── */
export interface Especie {
  coef: number; // coeficiente estequiométrico (cuántas unidades)
  formula: string; // fórmula con subíndices ("H₂O")
  estado: Estado;
  nombre: string;
  /** átomos por UNA molécula/unidad fórmula (sin multiplicar por el coeficiente) */
  atomos: Record<string, number>;
}

export interface Reaccion {
  id: string;
  nombre: string;
  ecuacion: string; // representación bonita completa
  tipo: string; // tipo de reacción
  reversible: boolean;
  reactivos: Especie[];
  productos: Especie[];
  contexto: string;
}

export const REACCIONES: Reaccion[] = [
  {
    id: "combustion-metano",
    nombre: "Combustión del metano",
    ecuacion: "CH₄ (g) + 2 O₂ (g) → CO₂ (g) + 2 H₂O (g)",
    tipo: "Combustión (exotérmica)",
    reversible: false,
    reactivos: [
      { coef: 1, formula: "CH₄", estado: "g", nombre: "metano", atomos: { C: 1, H: 4 } },
      { coef: 2, formula: "O₂", estado: "g", nombre: "oxígeno", atomos: { O: 2 } },
    ],
    productos: [
      { coef: 1, formula: "CO₂", estado: "g", nombre: "dióxido de carbono", atomos: { C: 1, O: 2 } },
      { coef: 2, formula: "H₂O", estado: "g", nombre: "agua", atomos: { H: 2, O: 1 } },
    ],
    contexto: "Es la reacción del gas natural y del gas LP que arde en las estufas y los calentadores de México: libera energía (calor y luz).",
  },
  {
    id: "sintesis-agua",
    nombre: "Síntesis del agua",
    ecuacion: "2 H₂ (g) + O₂ (g) → 2 H₂O (l)",
    tipo: "Síntesis (combinación)",
    reversible: false,
    reactivos: [
      { coef: 2, formula: "H₂", estado: "g", nombre: "hidrógeno", atomos: { H: 2 } },
      { coef: 1, formula: "O₂", estado: "g", nombre: "oxígeno", atomos: { O: 2 } },
    ],
    productos: [
      { coef: 2, formula: "H₂O", estado: "l", nombre: "agua", atomos: { H: 2, O: 1 } },
    ],
    contexto: "Dos elementos gaseosos se combinan para formar un compuesto nuevo: el agua. Es la reacción que aprovechan las celdas de hidrógeno.",
  },
  {
    id: "fotosintesis",
    nombre: "Fotosíntesis",
    ecuacion: "6 CO₂ (g) + 6 H₂O (l) → C₆H₁₂O₆ (ac) + 6 O₂ (g)",
    tipo: "Síntesis (endotérmica, usa luz)",
    reversible: false,
    reactivos: [
      { coef: 6, formula: "CO₂", estado: "g", nombre: "dióxido de carbono", atomos: { C: 1, O: 2 } },
      { coef: 6, formula: "H₂O", estado: "l", nombre: "agua", atomos: { H: 2, O: 1 } },
    ],
    productos: [
      { coef: 1, formula: "C₆H₁₂O₆", estado: "ac", nombre: "glucosa", atomos: { C: 6, H: 12, O: 6 } },
      { coef: 6, formula: "O₂", estado: "g", nombre: "oxígeno", atomos: { O: 2 } },
    ],
    contexto: "Las plantas (el maíz, los bosques) capturan CO₂ y, con la energía del Sol, fabrican glucosa y liberan el oxígeno que respiramos.",
  },
  {
    id: "amoniaco",
    nombre: "Formación de amoniaco (Haber-Bosch)",
    ecuacion: "N₂ (g) + 3 H₂ (g) ⇌ 2 NH₃ (g)",
    tipo: "Síntesis reversible",
    reversible: true,
    reactivos: [
      { coef: 1, formula: "N₂", estado: "g", nombre: "nitrógeno", atomos: { N: 2 } },
      { coef: 3, formula: "H₂", estado: "g", nombre: "hidrógeno", atomos: { H: 2 } },
    ],
    productos: [
      { coef: 2, formula: "NH₃", estado: "g", nombre: "amoniaco", atomos: { N: 1, H: 3 } },
    ],
    contexto: "Con la doble flecha ⇌ porque es reversible. Produce el amoniaco de los fertilizantes que alimentan a buena parte del mundo.",
  },
  {
    id: "neutralizacion",
    nombre: "Neutralización (ácido + base)",
    ecuacion: "HCl (ac) + NaOH (ac) → NaCl (ac) + H₂O (l)",
    tipo: "Neutralización (ácido-base)",
    reversible: false,
    reactivos: [
      { coef: 1, formula: "HCl", estado: "ac", nombre: "ácido clorhídrico", atomos: { H: 1, Cl: 1 } },
      { coef: 1, formula: "NaOH", estado: "ac", nombre: "hidróxido de sodio", atomos: { Na: 1, O: 1, H: 1 } },
    ],
    productos: [
      { coef: 1, formula: "NaCl", estado: "ac", nombre: "sal común", atomos: { Na: 1, Cl: 1 } },
      { coef: 1, formula: "H₂O", estado: "l", nombre: "agua", atomos: { H: 2, O: 1 } },
    ],
    contexto: "Un ácido y una base se cancelan formando sal y agua. Es lo que ocurre cuando un antiácido calma la acidez del estómago.",
  },
  {
    id: "descomposicion-peroxido",
    nombre: "Descomposición del agua oxigenada",
    ecuacion: "2 H₂O₂ (ac) → 2 H₂O (l) + O₂ (g)",
    tipo: "Descomposición",
    reversible: false,
    reactivos: [
      { coef: 2, formula: "H₂O₂", estado: "ac", nombre: "peróxido de hidrógeno", atomos: { H: 2, O: 2 } },
    ],
    productos: [
      { coef: 2, formula: "H₂O", estado: "l", nombre: "agua", atomos: { H: 2, O: 1 } },
      { coef: 1, formula: "O₂", estado: "g", nombre: "oxígeno", atomos: { O: 2 } },
    ],
    contexto: "Un compuesto se rompe en otros más simples: el agua oxigenada se descompone en agua y oxígeno (las burbujas que ves en una herida).",
  },
];

export function reaccionPorId(id: string): Reaccion {
  return REACCIONES.find((r) => r.id === id) ?? (REACCIONES[0] as Reaccion);
}

/* ── Química PURA: conteo de átomos y conservación de la materia ────────────── */
export interface ConteoLado {
  /** átomos totales por elemento = Σ (coef × átomos por unidad) */
  porElemento: Record<string, number>;
}

export interface Conteo {
  elementos: string[];
  reactivos: Record<string, number>;
  productos: Record<string, number>;
  balanceada: boolean;
  /** total de átomos a cada lado (debe coincidir si está balanceada) */
  totalReactivos: number;
  totalProductos: number;
}

function sumarLado(especies: Especie[], elementos: Set<string>): Record<string, number> {
  const m: Record<string, number> = {};
  for (const e of especies) {
    for (const [el, n] of Object.entries(e.atomos)) {
      m[el] = (m[el] ?? 0) + e.coef * n;
      elementos.add(el);
    }
  }
  return m;
}

export function contarAtomos(r: Reaccion): Conteo {
  const elementos = new Set<string>();
  const reactivos = sumarLado(r.reactivos, elementos);
  const productos = sumarLado(r.productos, elementos);
  const els = Array.from(elementos).sort();
  const balanceada = els.every((el) => (reactivos[el] ?? 0) === (productos[el] ?? 0));
  const totalReactivos = Object.values(reactivos).reduce((s, n) => s + n, 0);
  const totalProductos = Object.values(productos).reduce((s, n) => s + n, 0);
  return { elementos: els, reactivos, productos, balanceada, totalReactivos, totalProductos };
}

/** Cuántas moléculas/unidades hay de cada lado (suma de coeficientes). */
export function moleculasPorLado(r: Reaccion): { reactivos: number; productos: number } {
  return {
    reactivos: r.reactivos.reduce((s, e) => s + e.coef, 0),
    productos: r.productos.reduce((s, e) => s + e.coef, 0),
  };
}

/* ── Fases de animación por modo ─────────────────────────────────────────── */
export const FASES: Record<Exclude<Modo, "simbologia">, string[]> = {
  anatomia: ["Reactivos", "La flecha →", "Productos", "Coeficientes", "Subíndices"],
  conservacion: ["La ecuación", "Cuenta reactivos", "Cuenta productos", "¿Se conserva?"],
};

export function numFases(modo: Modo): number {
  if (modo === "simbologia") return 1;
  return FASES[modo].length;
}

export type Foco =
  | "reactivos"
  | "flecha"
  | "productos"
  | "coeficientes"
  | "subindices"
  | "ecuacion"
  | "comparar"
  | "galeria";

export interface Escena {
  modo: Modo;
  nombre: string;
  desc: string;
  foco: Foco;
  frac: number; // 0 → 1 a lo largo de las fases
}

export function escenaPara(modo: Modo, idx: number): Escena {
  if (modo === "simbologia") {
    return {
      modo,
      nombre: "Simbología química",
      desc: "Cada símbolo de una ecuación dice algo: la flecha, el signo +, los coeficientes, los subíndices y los estados de agregación.",
      foco: "galeria",
      frac: 1,
    };
  }
  const fases = FASES[modo];
  const n = fases.length;
  const i = Math.min(Math.max(0, idx), n - 1);
  const frac = n > 1 ? i / (n - 1) : 1;
  const nombre = fases[i] ?? "";

  const focos: Record<Exclude<Modo, "simbologia">, Foco[]> = {
    anatomia: ["reactivos", "flecha", "productos", "coeficientes", "subindices"],
    conservacion: ["ecuacion", "reactivos", "productos", "comparar"],
  };
  const descs: Record<Exclude<Modo, "simbologia">, string[]> = {
    anatomia: [
      "Los REACTIVOS son las sustancias que tienes ANTES de reaccionar: van a la izquierda de la flecha, separados por el signo +.",
      "La FLECHA → significa «se transforma en» o «produce»: separa lo que reacciona de lo que se forma. Si es doble (⇌) la reacción es reversible.",
      "Los PRODUCTOS son las sustancias NUEVAS que se forman: van a la derecha de la flecha, también separadas por +.",
      "El COEFICIENTE es el número grande DELANTE de una fórmula: indica cuántas moléculas (o moles) de esa sustancia participan. Sin número, vale 1.",
      "El SUBÍNDICE es el número pequeño DENTRO de la fórmula: indica cuántos átomos de ese elemento hay en una molécula (en H₂O hay 2 H y 1 O).",
    ],
    conservacion: [
      "Una ecuación química representa una reacción real. La clave: los átomos no se crean ni se destruyen, solo se reacomodan (Ley de Lavoisier).",
      "Cuenta los átomos de cada elemento en los REACTIVOS: multiplica el coeficiente por el subíndice de cada especie y suma.",
      "Cuenta ahora los átomos de cada elemento en los PRODUCTOS, del mismo modo.",
      "Compara: si cada elemento tiene el MISMO número de átomos en ambos lados, la ecuación está BALANCEADA y respeta la conservación de la materia.",
    ],
  };

  return {
    modo,
    nombre,
    desc: descs[modo][i] ?? "",
    foco: focos[modo][i] ?? "ecuacion",
    frac,
  };
}

/* ── Catálogo de simbología ───────────────────────────────────────────────── */
export interface Simbolo {
  simbolo: string;
  nombre: string;
  significado: string;
  ejemplo: string;
  color: string;
}

export const SIMBOLOS: Simbolo[] = [
  { simbolo: "→", nombre: "Flecha de reacción", significado: "«se transforma en» / «produce». Separa los reactivos (izquierda) de los productos (derecha).", ejemplo: "2 H₂ + O₂ → 2 H₂O", color: "#34d399" },
  { simbolo: "⇌", nombre: "Doble flecha", significado: "La reacción es reversible: ocurre en ambos sentidos a la vez (hacia productos y hacia reactivos).", ejemplo: "N₂ + 3 H₂ ⇌ 2 NH₃", color: "#a78bfa" },
  { simbolo: "+", nombre: "Signo más", significado: "Separa dos o más sustancias del mismo lado (varios reactivos o varios productos).", ejemplo: "CH₄ + 2 O₂ → …", color: "#f472b6" },
  { simbolo: "2 H₂O", nombre: "Coeficiente", significado: "Número grande DELANTE de la fórmula: cuántas moléculas (o moles) participan. Si no hay, vale 1.", ejemplo: "el 2 = dos moléculas de agua", color: "#fbbf24" },
  { simbolo: "H₂O", nombre: "Subíndice", significado: "Número pequeño DENTRO de la fórmula: cuántos átomos de ese elemento hay en UNA molécula.", ejemplo: "el ₂ = dos átomos de H por molécula", color: "#fb923c" },
  { simbolo: "(s)", nombre: "Estado sólido", significado: "La sustancia está en estado sólido.", ejemplo: "C (s) + O₂ (g) → CO₂ (g)", color: "#cbd5e1" },
  { simbolo: "(l)", nombre: "Estado líquido", significado: "La sustancia está en estado líquido.", ejemplo: "H₂O (l)", color: "#60a5fa" },
  { simbolo: "(g)", nombre: "Estado gaseoso", significado: "La sustancia está en estado gaseoso.", ejemplo: "O₂ (g), CO₂ (g)", color: "#fbbf24" },
  { simbolo: "(ac)", nombre: "Estado acuoso", significado: "La sustancia está disuelta en agua (disolución acuosa).", ejemplo: "NaCl (ac)", color: "#34d399" },
  { simbolo: "Δ", nombre: "Calor (sobre la flecha)", significado: "Indica que se aplica calor para que la reacción ocurra.", ejemplo: "CaCO₃ →(Δ) CaO + CO₂", color: "#ef4444" },
  { simbolo: "↑ / ↓", nombre: "Gas / Precipitado", significado: "↑ un gas que se desprende; ↓ un sólido (precipitado) que se forma en una disolución.", ejemplo: "AgCl ↓ (precipita)", color: "#22d3ee" },
];

/* ── Formato numérico (es-MX) ─────────────────────────────────────────────── */
export function fmtNum(n: number): string {
  return n.toLocaleString("es-MX", { maximumFractionDigits: 0 });
}

/* ── Contenido didáctico ──────────────────────────────────────────────────── */
export const PROBLEMA =
  "Una REACCIÓN QUÍMICA es un proceso en el que unas sustancias (los reactivos) se transforman en otras distintas (los productos): los enlaces se rompen y se forman, y los átomos se reacomodan. Para escribir lo que ocurre usamos una ECUACIÓN QUÍMICA, que tiene una estructura fija: a la izquierda los reactivos, una FLECHA que significa «se transforma en», y a la derecha los productos. Dentro de la ecuación cada símbolo dice algo: el signo + separa sustancias, el COEFICIENTE (número grande al frente) indica cuántas moléculas participan, el SUBÍNDICE (número pequeño) indica cuántos átomos hay en una molécula, y los estados (s, l, g, ac) dicen en qué fase está cada sustancia. La regla de oro es la conservación de la materia: los mismos átomos que entran deben salir, solo reacomodados. Manipula los modos para desarmar la ecuación parte por parte, contar los átomos a ambos lados y aprender la simbología.";

export const INSTRUCCIONES: Record<Modo, string[]> = {
  anatomia: [
    "Elige una reacción en la calculadora (combustión, síntesis, fotosíntesis…).",
    "Avanza las fases con ▶ o la barra: se irán resaltando los reactivos, la flecha, los productos, los coeficientes y los subíndices.",
    "Fíjate en la diferencia entre COEFICIENTE (número grande al frente: cuántas moléculas) y SUBÍNDICE (número pequeño dentro: cuántos átomos).",
    "Observa que los reactivos quedan a la izquierda de la flecha y los productos a la derecha.",
  ],
  conservacion: [
    "Con la reacción elegida, avanza para contar los átomos de cada elemento.",
    "Para cada especie multiplica el COEFICIENTE por el SUBÍNDICE y suma por elemento.",
    "Compara las columnas de reactivos y productos en la tabla de la calculadora.",
    "Comprueba que cada elemento tiene el mismo número de átomos en ambos lados: la materia se conserva.",
  ],
  simbologia: [
    "Recorre la galería de símbolos: la flecha →, la doble flecha ⇌, el signo +, el coeficiente, el subíndice y los estados.",
    "Relaciona cada símbolo con la reacción que estás viendo en los otros modos.",
    "Identifica en una ecuación cualquiera dónde está cada símbolo y qué te dice.",
  ],
};

export const PREGUNTAS: Record<Modo, string[]> = {
  anatomia: [
    "¿En qué se diferencia un coeficiente (delante de la fórmula) de un subíndice (dentro de la fórmula)?",
    "¿Por qué los reactivos van a la izquierda de la flecha y los productos a la derecha?",
    "Si una fórmula no lleva número delante, ¿cuántas moléculas representa?",
  ],
  conservacion: [
    "¿Por qué el número de átomos de cada elemento debe ser igual en reactivos y productos?",
    "¿Qué ley de la química garantiza que «los átomos no se crean ni se destruyen»?",
    "Si al contar los átomos no coinciden los dos lados, ¿qué le falta a la ecuación?",
  ],
  simbologia: [
    "¿Qué diferencia hay entre una flecha simple (→) y una doble flecha (⇌)?",
    "¿Qué te dicen los estados (s), (l), (g) y (ac) de una sustancia?",
    "¿Para qué sirve el signo + dentro de una ecuación química?",
  ],
};

export const IDEAS: string[] = [
  "Una reacción química transforma unas sustancias (reactivos) en otras nuevas (productos) reacomodando los átomos.",
  "La ecuación química es la forma de representar una reacción: reactivos → productos.",
  "La flecha → significa «se transforma en»; si es doble (⇌), la reacción es reversible.",
  "El coeficiente (número grande al frente) indica cuántas moléculas; el subíndice (número pequeño) cuántos átomos por molécula.",
  "El signo + separa varias sustancias del mismo lado de la ecuación.",
  "Los estados (s), (l), (g) y (ac) indican la fase de cada sustancia (sólido, líquido, gas o disuelto en agua).",
  "Conservación de la materia: los mismos átomos que entran salen, solo reacomodados (Ley de Lavoisier).",
  "Una ecuación está balanceada cuando cada elemento tiene el mismo número de átomos en reactivos y en productos.",
];

export const GLOSARIO: { termino: string; definicion: string; ejemplo: string }[] = [
  { termino: "Reacción química", definicion: "Proceso en el que unas sustancias se transforman en otras distintas, rompiendo y formando enlaces.", ejemplo: "El metano que arde en la estufa se convierte en CO₂ y agua." },
  { termino: "Reactivo", definicion: "Sustancia que se tiene ANTES de la reacción; va a la izquierda de la flecha.", ejemplo: "En 2 H₂ + O₂ → 2 H₂O, los reactivos son H₂ y O₂." },
  { termino: "Producto", definicion: "Sustancia NUEVA que se forma en la reacción; va a la derecha de la flecha.", ejemplo: "En la misma reacción, el producto es el agua (H₂O)." },
  { termino: "Ecuación química", definicion: "Representación escrita de una reacción: reactivos → productos, con fórmulas y símbolos.", ejemplo: "CH₄ + 2 O₂ → CO₂ + 2 H₂O." },
  { termino: "Flecha de reacción (→)", definicion: "Símbolo que significa «se transforma en» o «produce»; separa reactivos de productos.", ejemplo: "Si es doble (⇌), la reacción es reversible." },
  { termino: "Coeficiente", definicion: "Número grande delante de una fórmula; indica cuántas moléculas o moles participan.", ejemplo: "El 2 en «2 H₂O» = dos moléculas de agua." },
  { termino: "Subíndice", definicion: "Número pequeño dentro de una fórmula; indica cuántos átomos de ese elemento hay en una molécula.", ejemplo: "El ₂ en H₂O = dos átomos de hidrógeno." },
  { termino: "Estado de agregación", definicion: "Fase de la sustancia, indicada entre paréntesis: (s) sólido, (l) líquido, (g) gas, (ac) acuoso.", ejemplo: "H₂O (l) es agua líquida; O₂ (g) es oxígeno gaseoso." },
  { termino: "Conservación de la materia", definicion: "Los átomos no se crean ni se destruyen en una reacción; solo se reacomodan (Ley de Lavoisier).", ejemplo: "Los átomos de C, H y O que entran son los mismos que salen." },
  { termino: "Ecuación balanceada", definicion: "Aquella en la que cada elemento tiene el mismo número de átomos en reactivos y en productos.", ejemplo: "En CH₄ + 2 O₂ → CO₂ + 2 H₂O hay 1 C, 4 H y 4 O de cada lado." },
  { termino: "Reacción reversible", definicion: "Reacción que ocurre en ambos sentidos a la vez; se escribe con doble flecha (⇌).", ejemplo: "N₂ + 3 H₂ ⇌ 2 NH₃." },
];

export const CONTEXTO =
  "Las reacciones químicas explican el mundo que te rodea y buena parte de la economía y el ambiente de México. La COMBUSTIÓN del gas LP y el gas natural (CH₄ + 2 O₂ → CO₂ + 2 H₂O) cocina los alimentos y calienta el agua en millones de hogares, pero también libera el CO₂ que contribuye al efecto invernadero. La FOTOSÍNTESIS (6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂) es la reacción que hacen el maíz, los bosques de Oaxaca y Chiapas y el fitoplancton del Golfo: captura CO₂ y libera el oxígeno que respiras —por eso une el tema de la atmósfera con el de los seres vivos—. La SÍNTESIS del amoniaco (N₂ + 3 H₂ ⇌ 2 NH₃) produce los fertilizantes que sostienen la agricultura. Y la NEUTRALIZACIÓN ácido-base (HCl + NaOH → NaCl + H₂O) ocurre cuando un antiácido calma la acidez del estómago. Saber leer una ecuación —sus reactivos, su flecha, sus productos, sus coeficientes y su simbología— es entender cómo se transforma la materia en la naturaleza y en la industria.";

export const FUENTE =
  "MCCEMS 2025 · Ciencias Naturales, Experimentales y Tecnología III — 'Nuestro hogar. El sistema terrestre'. Propósito formativo O4 y contenidos C4 (concepto de reacción química; estructura de una reacción química; ecuación química como forma de representar una reacción; simbología utilizada en fórmulas y reacciones químicas). Las fórmulas, coeficientes y conteos de átomos son exactos.";

export interface EjemploResuelto {
  enunciado: string;
  datos: string[];
  solucion: string;
  resultado: string;
}

export const EJEMPLO: EjemploResuelto = {
  enunciado:
    "Observa la combustión del metano: CH₄ (g) + 2 O₂ (g) → CO₂ (g) + 2 H₂O (g). a) ¿Cuáles son los reactivos y cuáles los productos? b) ¿Cuántas moléculas de O₂ reaccionan (coeficiente) y cuántos átomos de H tiene una molécula de CH₄ (subíndice)? c) Cuenta los átomos de C, H y O en cada lado: ¿se conserva la materia? d) ¿Qué indican el símbolo (g) y la flecha →?",
  datos: ["Reactivos: CH₄, O₂", "Productos: CO₂, H₂O", "Coef. de O₂ = 2; subíndice de H en CH₄ = 4"],
  solucion:
    "a) Reactivos (izquierda de la flecha): CH₄ y O₂. Productos (derecha): CO₂ y H₂O. b) El coeficiente de O₂ es 2 → reaccionan 2 moléculas de O₂; el subíndice de H en CH₄ es 4 → una molécula de metano tiene 4 átomos de H. c) Reactivos: C = 1, H = 4, O = 2×2 = 4. Productos: C = 1, H = 2×2 = 4, O = 2 (del CO₂) + 2×1 (de 2 H₂O) = 4. Cada elemento tiene los mismos átomos en ambos lados ⇒ la materia se conserva. d) «(g)» indica que la sustancia es un gas; la flecha → significa «se transforma en / produce» y separa los reactivos de los productos.",
  resultado:
    "a) Reactivos CH₄ y O₂; productos CO₂ y H₂O. b) 2 moléculas de O₂; 4 átomos de H en CH₄. c) C 1=1, H 4=4, O 4=4 → sí se conserva (balanceada). d) (g) = gas; → = «se transforma en».",
};

export interface DatoClave {
  valor: string;
  texto: string;
  icono: string;
}

export const DATOS: DatoClave[] = [
  { valor: "Reactivos → Productos", texto: "La estructura básica de toda ecuación química.", icono: "fa-arrow-right-long" },
  { valor: "→ y ⇌", texto: "Flecha simple (irreversible) y doble flecha (reversible).", icono: "fa-arrows-left-right" },
  { valor: "Coeficiente ≠ subíndice", texto: "El grande al frente cuenta moléculas; el pequeño dentro, átomos.", icono: "fa-hashtag" },
  { valor: "(s) (l) (g) (ac)", texto: "Estados: sólido, líquido, gas y acuoso (disuelto en agua).", icono: "fa-layer-group" },
  { valor: "Átomos: entran = salen", texto: "Conservación de la materia (Ley de Lavoisier).", icono: "fa-scale-balanced" },
  { valor: "+ separa sustancias", texto: "El signo más une varios reactivos o varios productos.", icono: "fa-plus" },
];

export const HECHOS: string[] = [
  "Antoine Lavoisier estableció en el siglo XVIII que «la materia no se crea ni se destruye»: por eso una ecuación bien escrita está balanceada.",
  "El subíndice 1 nunca se escribe: en H₂O el oxígeno lleva un 1 implícito (un solo átomo de O).",
  "Cambiar un subíndice cambia la sustancia (H₂O es agua, pero H₂O₂ es agua oxigenada); para balancear solo se ajustan los coeficientes, nunca los subíndices.",
  "La doble flecha ⇌ no significa «igual»: significa que la reacción avanza y retrocede al mismo tiempo (es reversible).",
  "La fotosíntesis y la combustión son casi la reacción inversa una de la otra: una guarda energía del Sol en glucosa y la otra la libera.",
];

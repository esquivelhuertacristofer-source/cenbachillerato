/**
 * Datos para el laboratorio "Balanceo de ecuaciones químicas"
 * (CNEYT-IV-P01-A2, ejercicio_matematico "Balancea: ejercicio paso a paso con
 * ecuaciones reales"; UAC CNEYT-IV "Reacciones químicas"; progresión 1:
 * "Interpreta y balancea ecuaciones químicas aplicando la ley de conservación
 * de la masa").
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabBalanceo.tsx) y la escena 3D (BalanceoScene.tsx).
 *
 * Idea pedagógica (MCCEMS 2025 — CNEYT-IV P1 / Ley de conservación de la masa):
 * en una reacción los átomos NO se crean ni se destruyen, solo se reacomodan;
 * por eso el número de átomos de cada elemento debe ser IDÉNTICO en reactivos y
 * productos. Balancear es ajustar los COEFICIENTES (los números delante de cada
 * fórmula) —sin tocar los subíndices— hasta que cada elemento cuadre a ambos
 * lados. Las tres ecuaciones son EXACTAMENTE las de la actividad:
 *   1)  2 H₂ + O₂      → 2 H₂O
 *   2)  CH₄ + 2 O₂     → CO₂ + 2 H₂O
 *   3)  4 Fe + 3 O₂    → 2 Fe₂O₃
 * El alumno mueve los coeficientes y ve, en 3D, aparecer/desaparecer copias
 * enteras de cada molécula y los contadores de átomos por elemento igualarse.
 * Cálculo exacto.
 */

export type Elem = "H" | "C" | "O" | "Fe";

export interface ElemInfo {
  nombre: string;
  color: string; // color tipo CPK
  radio: number; // radio de la esfera en la escena
  masa: number;  // masa atómica (u)
}

/** Elementos usados por las tres ecuaciones del laboratorio. */
export const ELEMS_B: Record<Elem, ElemInfo> = {
  H:  { nombre: "Hidrógeno", color: "#E8EEF5", radio: 0.24, masa: 1.008 },
  C:  { nombre: "Carbono",   color: "#4A4A55", radio: 0.34, masa: 12.011 },
  O:  { nombre: "Oxígeno",   color: "#FF4D4D", radio: 0.32, masa: 15.999 },
  Fe: { nombre: "Hierro",    color: "#E06633", radio: 0.44, masa: 55.845 },
};

/* ── Geometría local de cada molécula (centrada en el origen) ────────────── */
export interface AtomLocal { el: Elem; p: [number, number, number]; }
export interface BondLocal { a: number; b: number; orden: 1 | 2 | 3; }
export interface MolDef {
  formula: string;                 // con subíndices Unicode, p. ej. "H₂O"
  nombre: string;
  comp: Partial<Record<Elem, number>>; // átomos de cada elemento por molécula
  atoms: AtomLocal[];
  bonds: BondLocal[];
}

export const MOLS_B: Record<string, MolDef> = {
  H2: {
    formula: "H₂", nombre: "hidrógeno", comp: { H: 2 },
    atoms: [{ el: "H", p: [-0.42, 0, 0] }, { el: "H", p: [0.42, 0, 0] }],
    bonds: [{ a: 0, b: 1, orden: 1 }],
  },
  O2: {
    formula: "O₂", nombre: "oxígeno", comp: { O: 2 },
    atoms: [{ el: "O", p: [-0.55, 0, 0] }, { el: "O", p: [0.55, 0, 0] }],
    bonds: [{ a: 0, b: 1, orden: 2 }],
  },
  H2O: {
    formula: "H₂O", nombre: "agua", comp: { H: 2, O: 1 },
    atoms: [{ el: "O", p: [0, 0.18, 0] }, { el: "H", p: [-0.72, -0.34, 0] }, { el: "H", p: [0.72, -0.34, 0] }],
    bonds: [{ a: 0, b: 1, orden: 1 }, { a: 0, b: 2, orden: 1 }],
  },
  CH4: {
    formula: "CH₄", nombre: "metano", comp: { C: 1, H: 4 },
    atoms: [
      { el: "C", p: [0, 0, 0] },
      { el: "H", p: [0.5, 0.5, 0.5] },
      { el: "H", p: [0.5, -0.5, -0.5] },
      { el: "H", p: [-0.5, 0.5, -0.5] },
      { el: "H", p: [-0.5, -0.5, 0.5] },
    ],
    bonds: [{ a: 0, b: 1, orden: 1 }, { a: 0, b: 2, orden: 1 }, { a: 0, b: 3, orden: 1 }, { a: 0, b: 4, orden: 1 }],
  },
  CO2: {
    formula: "CO₂", nombre: "dióxido de carbono", comp: { C: 1, O: 2 },
    atoms: [{ el: "C", p: [0, 0, 0] }, { el: "O", p: [-0.98, 0, 0] }, { el: "O", p: [0.98, 0, 0] }],
    bonds: [{ a: 0, b: 1, orden: 2 }, { a: 0, b: 2, orden: 2 }],
  },
  Fe: {
    formula: "Fe", nombre: "hierro", comp: { Fe: 1 },
    atoms: [{ el: "Fe", p: [0, 0, 0] }],
    bonds: [],
  },
  Fe2O3: {
    formula: "Fe₂O₃", nombre: "óxido de hierro(III)", comp: { Fe: 2, O: 3 },
    atoms: [
      { el: "Fe", p: [-0.62, 0.5, 0] },
      { el: "Fe", p: [0.62, 0.5, 0] },
      { el: "O", p: [0, -0.05, 0] },
      { el: "O", p: [-1.05, -0.5, 0] },
      { el: "O", p: [1.05, -0.5, 0] },
    ],
    bonds: [
      { a: 0, b: 2, orden: 1 }, { a: 1, b: 2, orden: 1 },
      { a: 0, b: 3, orden: 1 }, { a: 1, b: 4, orden: 1 },
    ],
  },
};

/* ── Reacciones (las tres EXACTAS de la actividad) ───────────────────────── */
export interface Especie { mol: string; }
export interface ReaccionBal {
  key: string;
  nombre: string;
  contexto: string;   // dónde ocurre en la vida real
  descripcion: string;
  reactivos: Especie[];
  productos: Especie[];
  solR: number[];     // coeficientes correctos (reactivos)
  solP: number[];     // coeficientes correctos (productos)
}

export const REACCIONES_BAL: ReaccionBal[] = [
  {
    key: "agua",
    nombre: "Síntesis del agua",
    contexto: "El hidrógeno arde con oxígeno y forma agua: la reacción de las celdas de combustible.",
    descripcion: "Con coeficiente 1 en todo, el oxígeno no cuadra (2 a la izquierda, 1 a la derecha). Sube H₂O a 2 para emparejar el O y luego H₂ a 2 para emparejar el H.",
    reactivos: [{ mol: "H2" }, { mol: "O2" }],
    productos: [{ mol: "H2O" }],
    solR: [2, 1],
    solP: [2],
  },
  {
    key: "metano",
    nombre: "Combustión del metano",
    contexto: "El gas natural de la estufa se quema con oxígeno y produce dióxido de carbono y agua.",
    descripcion: "Balancea primero el hidrógeno (2 delante de H₂O) y luego el oxígeno (2 delante de O₂); el carbono ya estaba parejo.",
    reactivos: [{ mol: "CH4" }, { mol: "O2" }],
    productos: [{ mol: "CO2" }, { mol: "H2O" }],
    solR: [1, 2],
    solP: [1, 2],
  },
  {
    key: "oxido-hierro",
    nombre: "Oxidación del hierro",
    contexto: "El hierro reacciona con el oxígeno del aire y se forma óxido de hierro: la herrumbre.",
    descripcion: "El mínimo común múltiplo del oxígeno es 6: pon 3 delante de O₂ y 2 delante de Fe₂O₃; luego 4 delante de Fe para emparejar el hierro.",
    reactivos: [{ mol: "Fe" }, { mol: "O2" }],
    productos: [{ mol: "Fe2O3" }],
    solR: [4, 3],
    solP: [2],
  },
];

/* ── Conteo y balance ─────────────────────────────────────────────────────── */
export interface FilaElem {
  el: Elem;
  izq: number;
  der: number;
  ok: boolean;
}
export interface BalanceInfo {
  filas: FilaElem[];
  balanceada: boolean;   // todos los elementos cuadran
  minima: boolean;       // además, coeficientes en su mínima expresión (mcd = 1)
  masaIzq: number;
  masaDer: number;
  nMolIzq: number;
  nMolDer: number;
  totalAtomosIzq: number;
  totalAtomosDer: number;
}

/** Cuenta los átomos de cada elemento en un lado, dados sus coeficientes. */
function contarLado(species: Especie[], coefs: number[]): Map<Elem, number> {
  const m = new Map<Elem, number>();
  species.forEach((s, i) => {
    const def = MOLS_B[s.mol]!;
    const c = coefs[i] ?? 0;
    for (const k in def.comp) {
      const el = k as Elem;
      m.set(el, (m.get(el) ?? 0) + c * (def.comp[el] ?? 0));
    }
  });
  return m;
}

function masaLado(species: Especie[], coefs: number[]): number {
  let m = 0;
  species.forEach((s, i) => {
    const def = MOLS_B[s.mol]!;
    const c = coefs[i] ?? 0;
    for (const k in def.comp) {
      const el = k as Elem;
      m += c * (def.comp[el] ?? 0) * ELEMS_B[el].masa;
    }
  });
  return m;
}

const gcd2 = (a: number, b: number): number => (b === 0 ? a : gcd2(b, a % b));

/** Elementos presentes en la reacción, en orden estable. */
export function elementosDe(r: ReaccionBal): Elem[] {
  const orden: Elem[] = ["C", "H", "O", "Fe"];
  const set = new Set<Elem>();
  for (const s of [...r.reactivos, ...r.productos]) {
    for (const k in MOLS_B[s.mol]!.comp) set.add(k as Elem);
  }
  return orden.filter((e) => set.has(e));
}

/** Calcula el estado de balance (exacto) dados los coeficientes actuales. */
export function calcBalance(r: ReaccionBal, cR: number[], cP: number[]): BalanceInfo {
  const izq = contarLado(r.reactivos, cR);
  const der = contarLado(r.productos, cP);
  const els = elementosDe(r);
  const filas: FilaElem[] = els.map((el) => {
    const a = izq.get(el) ?? 0;
    const b = der.get(el) ?? 0;
    return { el, izq: a, der: b, ok: a === b && a > 0 };
  });
  const balanceada = filas.every((f) => f.ok);
  const todos = [...cR, ...cP].filter((n) => n > 0);
  const g = todos.reduce((acc, n) => gcd2(acc, n), 0);
  const minima = balanceada && g === 1;
  const totalAtomosIzq = filas.reduce((s, f) => s + f.izq, 0);
  const totalAtomosDer = filas.reduce((s, f) => s + f.der, 0);
  return {
    filas,
    balanceada,
    minima,
    masaIzq: masaLado(r.reactivos, cR),
    masaDer: masaLado(r.productos, cP),
    nMolIzq: cR.reduce((s, n) => s + n, 0),
    nMolDer: cP.reduce((s, n) => s + n, 0),
    totalAtomosIzq,
    totalAtomosDer,
  };
}

/* ── Ideas / datos (paneles) ──────────────────────────────────────────────── */
export const IDEAS: string[] = [
  "La Ley de conservación de la masa (Lavoisier): en una reacción, la masa total de los reactivos es igual a la de los productos; nada se crea ni se destruye.",
  "Balancear es ajustar los COEFICIENTES (los números grandes delante de cada fórmula) hasta que cada elemento tenga el mismo número de átomos a ambos lados.",
  "REGLA DE ORO: nunca cambies los SUBÍNDICES (los números pequeños dentro de la fórmula); eso cambiaría la sustancia. Solo se tocan los coeficientes.",
  "Un coeficiente multiplica a TODA la molécula: 2 H₂O son 2 moléculas completas de agua (4 H y 2 O en total).",
  "Método de tanteo: balancea primero los elementos que aparecen en una sola molécula de cada lado y deja el oxígeno (o el hidrógeno) para el final.",
  "Cuando un elemento queda con número impar de un lado y par del otro, busca el mínimo común múltiplo para igualarlos.",
  "Una ecuación balanceada también es una receta: los coeficientes dicen en qué proporción (moléculas o moles) reaccionan las sustancias.",
];

export const DATOS: { valor: string; texto: string; icono: string }[] = [
  { valor: "átomos izq = átomos der", texto: "condición de una ecuación balanceada", icono: "fa-scale-balanced" },
  { valor: "solo coeficientes", texto: "los subíndices NUNCA se cambian", icono: "fa-hashtag" },
  { valor: "masa reactivos = masa productos", texto: "Ley de conservación (Lavoisier)", icono: "fa-equals" },
  { valor: "coeficiente = nº de moléculas", texto: "y también proporción en moles", icono: "fa-cubes-stacked" },
];

/* ── Formato ──────────────────────────────────────────────────────────────── */
const ES = (n: number, dec: number) =>
  n.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 }).replace("-", "−");

export const fmtMasa = (n: number): string => `${ES(n, 3)} u`;
export const fmtInt = (n: number): string => ES(n, 0);

/** Un lado de la ecuación con sus coeficientes (omite el 1). */
function lado(species: Especie[], coefs: number[]): string {
  return species
    .map((s, i) => {
      const c = coefs[i] ?? 1;
      const f = MOLS_B[s.mol]!.formula;
      return c === 1 ? f : `${c} ${f}`;
    })
    .join(" + ");
}

/** Ecuación completa con los coeficientes actuales, lista para mostrar. */
export function ecuacion(r: ReaccionBal, cR: number[], cP: number[]): string {
  return `${lado(r.reactivos, cR)} → ${lado(r.productos, cP)}`;
}

/* ── Controles ────────────────────────────────────────────────────────────── */
export const COEF_MIN = 1;
export const COEF_MAX = 8;
export const REACCION_DEF = 0;

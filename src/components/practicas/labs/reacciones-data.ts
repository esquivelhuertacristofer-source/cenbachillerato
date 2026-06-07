/**
 * Datos para el laboratorio de Conservación de la materia (CNEYT-I-P08).
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabConservacionMateria.tsx) y la escena 3D (ConservacionMateriaScene.tsx)
 * sin arrastrar three.js al bundle del shell.
 *
 * Idea pedagógica (Ley de conservación de la materia / Lavoisier): en una
 * reacción química los átomos NO se crean ni se destruyen, solo se REACOMODAN.
 * Por eso la masa total es la misma antes y después. El laboratorio toma los
 * mismos átomos de los reactivos y los reorganiza en los productos: cada átomo
 * "viaja" de su molécula inicial a su molécula final.
 */

export type Elem = "H" | "C" | "N" | "O" | "Na" | "Cl";

export interface ElemInfo {
  nombre: string;
  color: string; // color tipo CPK
  radio: number; // radio de la esfera en la escena
  masa: number; // masa atómica (u)
}

/** Elementos usados por las reacciones del laboratorio. */
export const ELEMS_R: Record<Elem, ElemInfo> = {
  H: { nombre: "Hidrógeno", color: "#E8EEF5", radio: 0.26, masa: 1.008 },
  C: { nombre: "Carbono", color: "#4A4A55", radio: 0.36, masa: 12.011 },
  N: { nombre: "Nitrógeno", color: "#3B6BFF", radio: 0.34, masa: 14.007 },
  O: { nombre: "Oxígeno", color: "#FF4D4D", radio: 0.34, masa: 15.999 },
  Na: { nombre: "Sodio", color: "#AB6BFF", radio: 0.46, masa: 22.99 },
  Cl: { nombre: "Cloro", color: "#52D07A", radio: 0.44, masa: 35.45 },
};

/* ── Geometrías locales de cada molécula (centradas en el origen) ──────── */
interface AtomLocal {
  el: Elem;
  p: [number, number, number];
}
interface BondLocal {
  a: number;
  b: number;
  orden: 1 | 2 | 3;
}
interface MolDef {
  atoms: AtomLocal[];
  bonds: BondLocal[];
}

const MOL: Record<string, MolDef> = {
  H2: { atoms: [{ el: "H", p: [-0.5, 0, 0] }, { el: "H", p: [0.5, 0, 0] }], bonds: [{ a: 0, b: 1, orden: 1 }] },
  O2: { atoms: [{ el: "O", p: [-0.6, 0, 0] }, { el: "O", p: [0.6, 0, 0] }], bonds: [{ a: 0, b: 1, orden: 2 }] },
  N2: { atoms: [{ el: "N", p: [-0.55, 0, 0] }, { el: "N", p: [0.55, 0, 0] }], bonds: [{ a: 0, b: 1, orden: 3 }] },
  Cl2: { atoms: [{ el: "Cl", p: [-0.65, 0, 0] }, { el: "Cl", p: [0.65, 0, 0] }], bonds: [{ a: 0, b: 1, orden: 1 }] },
  CH4: {
    atoms: [
      { el: "C", p: [0, 0, 0] },
      { el: "H", p: [0.55, 0.55, 0.55] },
      { el: "H", p: [0.55, -0.55, -0.55] },
      { el: "H", p: [-0.55, 0.55, -0.55] },
      { el: "H", p: [-0.55, -0.55, 0.55] },
    ],
    bonds: [
      { a: 0, b: 1, orden: 1 },
      { a: 0, b: 2, orden: 1 },
      { a: 0, b: 3, orden: 1 },
      { a: 0, b: 4, orden: 1 },
    ],
  },
  CO2: {
    atoms: [{ el: "C", p: [0, 0, 0] }, { el: "O", p: [-1.05, 0, 0] }, { el: "O", p: [1.05, 0, 0] }],
    bonds: [{ a: 0, b: 1, orden: 2 }, { a: 0, b: 2, orden: 2 }],
  },
  H2O: {
    atoms: [{ el: "O", p: [0, 0.2, 0] }, { el: "H", p: [-0.8, -0.38, 0] }, { el: "H", p: [0.8, -0.38, 0] }],
    bonds: [{ a: 0, b: 1, orden: 1 }, { a: 0, b: 2, orden: 1 }],
  },
  NH3: {
    atoms: [
      { el: "N", p: [0, 0.25, 0] },
      { el: "H", p: [0.8, -0.24, 0] },
      { el: "H", p: [-0.4, -0.24, 0.69] },
      { el: "H", p: [-0.4, -0.24, -0.69] },
    ],
    bonds: [{ a: 0, b: 1, orden: 1 }, { a: 0, b: 2, orden: 1 }, { a: 0, b: 3, orden: 1 }],
  },
  Na: { atoms: [{ el: "Na", p: [0, 0, 0] }], bonds: [] },
  NaCl: { atoms: [{ el: "Na", p: [-0.7, 0, 0] }, { el: "Cl", p: [0.7, 0, 0] }], bonds: [] },
};

/* ── Reacciones (balanceadas: los átomos se conservan) ─────────────────── */
export interface Especie {
  mol: string;
  n: number; // coeficiente
}
export interface Reaccion {
  key: string;
  ecuacion: string;
  nombre: string;
  descripcion: string;
  reactivos: Especie[];
  productos: Especie[];
}

export const REACCIONES: Reaccion[] = [
  {
    key: "combustion-metano",
    ecuacion: "CH₄ + 2 O₂ → CO₂ + 2 H₂O",
    nombre: "Combustión del metano",
    descripcion:
      "El gas de la estufa se quema con oxígeno. Cuenta los átomos: hay exactamente los mismos antes y después, solo se reacomodan en moléculas distintas.",
    reactivos: [{ mol: "CH4", n: 1 }, { mol: "O2", n: 2 }],
    productos: [{ mol: "CO2", n: 1 }, { mol: "H2O", n: 2 }],
  },
  {
    key: "sintesis-agua",
    ecuacion: "2 H₂ + O₂ → 2 H₂O",
    nombre: "Síntesis del agua",
    descripcion:
      "El hidrógeno arde con oxígeno y forma agua. Ningún átomo aparece ni desaparece: los 4 H y los 2 O siguen ahí, ahora unidos como agua.",
    reactivos: [{ mol: "H2", n: 2 }, { mol: "O2", n: 1 }],
    productos: [{ mol: "H2O", n: 2 }],
  },
  {
    key: "amoniaco",
    ecuacion: "N₂ + 3 H₂ → 2 NH₃",
    nombre: "Formación de amoniaco",
    descripcion:
      "Nitrógeno e hidrógeno se combinan (proceso Haber) para fabricar amoniaco, base de los fertilizantes. Mismos átomos, nuevo arreglo.",
    reactivos: [{ mol: "N2", n: 1 }, { mol: "H2", n: 3 }],
    productos: [{ mol: "NH3", n: 2 }],
  },
  {
    key: "sal",
    ecuacion: "2 Na + Cl₂ → 2 NaCl",
    nombre: "Formación de sal",
    descripcion:
      "El sodio (metal) reacciona con el cloro (gas) y forma sal de mesa. Los mismos átomos, ahora unidos como iones Na⁺ y Cl⁻.",
    reactivos: [{ mol: "Na", n: 2 }, { mol: "Cl2", n: 1 }],
    productos: [{ mol: "NaCl", n: 2 }],
  },
];

/* ── Construcción de la escena: átomos que viajan de reactivo a producto ─ */
export interface MovAtom {
  el: Elem;
  start: [number, number, number]; // posición en los reactivos
  end: [number, number, number]; // posición en los productos
}
export interface MovBond {
  i: number; // índice de átomo (en MovAtom[])
  j: number;
  orden: 1 | 2 | 3;
}
export interface ConteoElem {
  el: Elem;
  n: number;
  masa: number; // masa total de ese elemento (u)
}
export interface ReaccionBuilt {
  atoms: MovAtom[];
  reactBonds: MovBond[];
  prodBonds: MovBond[];
  conteo: ConteoElem[];
  masaReact: number;
  masaProd: number;
}

const CENTER_X = 3.4; // separación entre reactivos (−) y productos (+)
const SPACING = 2.15; // separación vertical entre moléculas de un lado

interface PlacedAtom {
  el: Elem;
  pos: [number, number, number];
}
interface PlacedBond {
  a: number;
  b: number;
  orden: 1 | 2 | 3;
}

/** Coloca las moléculas de un lado en una columna centrada. */
function placeSide(species: Especie[], centerX: number): { atoms: PlacedAtom[]; bonds: PlacedBond[] } {
  const instances: string[] = [];
  for (const s of species) for (let k = 0; k < s.n; k++) instances.push(s.mol);
  const count = instances.length;
  const atoms: PlacedAtom[] = [];
  const bonds: PlacedBond[] = [];
  instances.forEach((molName, idx) => {
    const def = MOL[molName]!;
    const y = (idx - (count - 1) / 2) * SPACING;
    const base = atoms.length;
    for (const a of def.atoms) atoms.push({ el: a.el, pos: [a.p[0] + centerX, a.p[1] + y, a.p[2]] });
    for (const b of def.bonds) bonds.push({ a: base + b.a, b: base + b.b, orden: b.orden });
  });
  return { atoms, bonds };
}

/**
 * Empareja cada átomo de los reactivos con un átomo del MISMO elemento en los
 * productos (la conservación garantiza que hay la misma cantidad de cada uno).
 * Devuelve la lista de átomos "viajeros" y los enlaces de cada lado.
 */
export function buildReaccion(r: Reaccion): ReaccionBuilt {
  const L = placeSide(r.reactivos, -CENTER_X);
  const R = placeSide(r.productos, CENTER_X);

  const byElemR = new Map<Elem, number[]>();
  const byElemP = new Map<Elem, number[]>();
  L.atoms.forEach((a, i) => {
    const arr = byElemR.get(a.el) ?? [];
    arr.push(i);
    byElemR.set(a.el, arr);
  });
  R.atoms.forEach((a, i) => {
    const arr = byElemP.get(a.el) ?? [];
    arr.push(i);
    byElemP.set(a.el, arr);
  });

  const movingOfReact = new Array<number>(L.atoms.length);
  const movingOfProd = new Array<number>(R.atoms.length);
  const atoms: MovAtom[] = [];
  const conteo: ConteoElem[] = [];

  for (const [el, rs] of byElemR) {
    const ps = byElemP.get(el) ?? [];
    for (let k = 0; k < rs.length; k++) {
      const ri = rs[k]!;
      const pi = ps[k]!;
      const mi = atoms.length;
      atoms.push({ el, start: L.atoms[ri]!.pos, end: R.atoms[pi]!.pos });
      movingOfReact[ri] = mi;
      movingOfProd[pi] = mi;
    }
    conteo.push({ el, n: rs.length, masa: ELEMS_R[el].masa * rs.length });
  }

  const reactBonds: MovBond[] = L.bonds.map((b) => ({ i: movingOfReact[b.a]!, j: movingOfReact[b.b]!, orden: b.orden }));
  const prodBonds: MovBond[] = R.bonds.map((b) => ({ i: movingOfProd[b.a]!, j: movingOfProd[b.b]!, orden: b.orden }));

  const masaReact = conteo.reduce((s, c) => s + c.masa, 0);
  let masaProd = 0;
  for (const [el, ps] of byElemP) masaProd += ELEMS_R[el].masa * ps.length;

  return { atoms, reactBonds, prodBonds, conteo, masaReact, masaProd };
}

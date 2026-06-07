/**
 * Datos — "Visor molecular de química orgánica" (CNEYT-IV-P04).
 *
 * Las CUATRO familias de la progresión 4 (alcanos, alquenos, alcoholes y ácidos
 * carboxílicos) con compuestos representativos tomados EXACTAMENTE de la lectura
 * A1 y el glosario A5: metano/propano/butano (gas natural y gas LP), eteno y
 * propeno (doble enlace C=C), metanol/etanol (–OH) y ácido acético (–COOH).
 *
 * Cada molécula trae su geometría ball-and-stick (esferas CPK + barras) generada
 * con ángulos tetraédricos (sp3, 109.5°) o trigonales planos (sp2, 120°). Las
 * geometrías son representaciones DIDÁCTICAS (no distancias de enlace reales),
 * pero la composición (nº de C, H, O), la fórmula y el grupo funcional son los
 * valores reales del compuesto. Los átomos del grupo funcional llevan `fg:true`
 * para poder resaltarlos en la escena.
 *
 * Módulo puro (sin three): seguro de importar desde el shell sin arrastrar
 * three.js. Las posiciones se calculan una sola vez al cargar el módulo
 * (deterministas: nada de Math.random()/Date.now()).
 */

export type Elem = "C" | "H" | "O";

export interface ElemInfo {
  nombre: string;
  color: string;
  radio: number;
}

/** Colores tipo CPK (los mismos de balanceo-data, ampliados a este set). */
export const ELEMS_O: Record<Elem, ElemInfo> = {
  H: { nombre: "Hidrógeno", color: "#E8EEF5", radio: 0.22 },
  C: { nombre: "Carbono", color: "#4A4A55", radio: 0.34 },
  O: { nombre: "Oxígeno", color: "#FF4D4D", radio: 0.32 },
};

export type V = [number, number, number];

export interface AtomLocal {
  el: Elem;
  p: V;
  fg?: boolean; // pertenece al grupo funcional (para resaltar)
}
export interface BondLocal {
  a: number;
  b: number;
  orden: 1 | 2 | 3;
  fg?: boolean;
}

export type Familia = "alcano" | "alqueno" | "alcohol" | "acido";

export interface FamiliaInfo {
  id: Familia;
  label: string;
  grupoFuncional: string;
  formulaGeneral: string;
  color: string;
  icono: string;
  descripcion: string;
}

export const FAMILIAS: FamiliaInfo[] = [
  {
    id: "alcano",
    label: "Alcanos",
    grupoFuncional: "Ninguno (solo enlaces simples C–C)",
    formulaGeneral: "CₙH₂ₙ₊₂",
    color: "#9CA3AF",
    icono: "fa-link",
    descripcion: "Hidrocarburos saturados: solo enlaces simples C–C y C–H. También llamados parafinas; son poco reactivos y su reacción principal es la combustión.",
  },
  {
    id: "alqueno",
    label: "Alquenos",
    grupoFuncional: "Doble enlace C=C",
    formulaGeneral: "CₙH₂ₙ",
    color: "#34D399",
    icono: "fa-equals",
    descripcion: "Hidrocarburos insaturados: tienen al menos un doble enlace C=C, que los hace más reactivos (reacciones de adición).",
  },
  {
    id: "alcohol",
    label: "Alcoholes",
    grupoFuncional: "Hidroxilo –OH",
    formulaGeneral: "R–OH",
    color: "#60A5FA",
    icono: "fa-tint",
    descripcion: "Tienen el grupo hidroxilo –OH unido a un carbono. El –OH los vuelve polares y capaces de oxidarse.",
  },
  {
    id: "acido",
    label: "Ácidos carboxílicos",
    grupoFuncional: "Carboxilo –COOH",
    formulaGeneral: "R–COOH",
    color: "#FBBF24",
    icono: "fa-droplet",
    descripcion: "Tienen el grupo carboxilo –COOH. Son ácidos débiles: ceden un protón H⁺ en solución.",
  },
];

export interface MolDef {
  id: string;
  familia: Familia;
  formula: string;
  nombre: string;
  contexto: string;
  reactividad: string;
  enlaces: string;
  atoms: AtomLocal[];
  bonds: BondLocal[];
  nC: number;
  nH: number;
  nO: number;
}

/* ── Helpers vectoriales (sin three) ─────────────────────────────────────── */
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scl = (a: V, s: number): V => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: V, b: V): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V, b: V): V => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const len = (a: V): number => Math.sqrt(dot(a, a));
const norm = (a: V): V => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

/** Vector unitario perpendicular a u. */
function perp(u: V): V {
  const ref: V = Math.abs(u[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  return norm(cross(u, ref));
}

/**
 * Tres direcciones unitarias sp3 que forman 109.47° con `toward` (la dirección
 * del cuarto enlace), espaciadas 120° entre sí. Sirven para los H de un –CH₃.
 */
function tetraTres(toward: V, phase = 0): V[] {
  const u = norm(toward);
  const p1 = perp(u);
  const p2 = norm(cross(u, p1));
  const c = Math.sqrt(8) / 3; // sin(109.47°)
  const out: V[] = [];
  for (let k = 0; k < 3; k++) {
    const a = phase + (k * 2 * Math.PI) / 3;
    const dir = add(scl(u, -1 / 3), scl(add(scl(p1, Math.cos(a)), scl(p2, Math.sin(a))), c));
    out.push(norm(dir));
  }
  return out;
}

/** Dos direcciones de los H de un –CH₂– dados los dos enlaces (a, b) unitarios. */
function ch2Dos(a: V, b: V): [V, V] {
  const s = scl(add(a, b), -0.5);
  const n = norm(cross(a, b));
  return [norm(add(s, scl(n, 0.8165))), norm(add(s, scl(n, -0.8165)))];
}

/* ── Constructores de moléculas ──────────────────────────────────────────── */
const LCC = 1.5;   // C–C
const LCH = 1.0;   // C–H
const LCO = 1.4;   // C–O simple
const LCOD = 1.25; // C=O doble
const LOH = 0.96;  // O–H
const T = 0.5774;  // 1/√3, componente tetraédrica
const A: V = [T, T, T];

interface Geo { atoms: AtomLocal[]; bonds: BondLocal[]; }

/** Centra la molécula en su centroide para que rote sobre su centro. */
function recenter(g: Geo): Geo {
  const n = g.atoms.length;
  let cx = 0, cy = 0, cz = 0;
  for (const at of g.atoms) { cx += at.p[0]; cy += at.p[1]; cz += at.p[2]; }
  cx /= n; cy /= n; cz /= n;
  return {
    atoms: g.atoms.map((at) => ({ ...at, p: [at.p[0] - cx, at.p[1] - cy, at.p[2] - cz] as V })),
    bonds: g.bonds,
  };
}

/** Alcano de cadena recta (zigzag tetraédrico en el plano XY). */
function alcano(n: number): Geo {
  const DX = 0.8165 * LCC;
  const DY = 0.5774 * LCC;
  const C: V[] = [];
  for (let i = 0; i < n; i++) C.push([i * DX, i % 2 === 1 ? DY : 0, 0]);

  const atoms: AtomLocal[] = C.map((p) => ({ el: "C", p: [...p] as V }));
  const bonds: BondLocal[] = [];
  for (let i = 0; i < n - 1; i++) bonds.push({ a: i, b: i + 1, orden: 1 });

  for (let i = 0; i < n; i++) {
    if (i === 0 || i === n - 1) {
      const nb = i === 0 ? C[1]! : C[n - 2]!;
      const toward = norm(sub(nb, C[i]!));
      for (const d of tetraTres(toward)) {
        const idx = atoms.length;
        atoms.push({ el: "H", p: add(C[i]!, scl(d, LCH)) });
        bonds.push({ a: i, b: idx, orden: 1 });
      }
    } else {
      const a = norm(sub(C[i - 1]!, C[i]!));
      const b = norm(sub(C[i + 1]!, C[i]!));
      for (const d of ch2Dos(a, b)) {
        const idx = atoms.length;
        atoms.push({ el: "H", p: add(C[i]!, scl(d, LCH)) });
        bonds.push({ a: i, b: idx, orden: 1 });
      }
    }
  }
  return recenter({ atoms, bonds });
}

/** Metano CH₄ (carbono tetraédrico). */
function metano(): Geo {
  const dirs: V[] = [[T, T, T], [T, -T, -T], [-T, T, -T], [-T, -T, T]];
  const atoms: AtomLocal[] = [{ el: "C", p: [0, 0, 0] }];
  const bonds: BondLocal[] = [];
  for (const d of dirs) {
    const idx = atoms.length;
    atoms.push({ el: "H", p: scl(d, LCH) });
    bonds.push({ a: 0, b: idx, orden: 1 });
  }
  return recenter({ atoms, bonds });
}

/** Eteno C₂H₄ (dos carbonos sp2, doble enlace, todo plano). */
function eteno(): Geo {
  const c0: V = [-LCC / 2, 0, 0];
  const c1: V = [LCC / 2, 0, 0];
  const atoms: AtomLocal[] = [{ el: "C", p: c0, fg: true }, { el: "C", p: c1, fg: true }];
  const bonds: BondLocal[] = [{ a: 0, b: 1, orden: 2, fg: true }];
  const h0: V[] = [[-0.5, 0.866, 0], [-0.5, -0.866, 0]];
  for (const d of h0) { const i = atoms.length; atoms.push({ el: "H", p: add(c0, scl(d, LCH)) }); bonds.push({ a: 0, b: i, orden: 1 }); }
  const h1: V[] = [[0.5, 0.866, 0], [0.5, -0.866, 0]];
  for (const d of h1) { const i = atoms.length; atoms.push({ el: "H", p: add(c1, scl(d, LCH)) }); bonds.push({ a: 1, b: i, orden: 1 }); }
  return recenter({ atoms, bonds });
}

/** Propeno CH₂=CH–CH₃ (dos sp2 + un metilo sp3). */
function propeno(): Geo {
  const c0: V = [-LCC / 2, 0, 0]; // =CH₂
  const c1: V = [LCC / 2, 0, 0];  // =CH–
  const dC2: V = [0.5, 0.866, 0];
  const c2: V = add(c1, scl(dC2, LCC)); // –CH₃
  const atoms: AtomLocal[] = [{ el: "C", p: c0, fg: true }, { el: "C", p: c1, fg: true }, { el: "C", p: c2 }];
  const bonds: BondLocal[] = [{ a: 0, b: 1, orden: 2, fg: true }, { a: 1, b: 2, orden: 1 }];
  // C0: dos H (sp2)
  for (const d of [[-0.5, 0.866, 0], [-0.5, -0.866, 0]] as V[]) {
    const i = atoms.length; atoms.push({ el: "H", p: add(c0, scl(d, LCH)) }); bonds.push({ a: 0, b: i, orden: 1 });
  }
  // C1: un H (sp2)
  { const d: V = [0.5, -0.866, 0]; const i = atoms.length; atoms.push({ el: "H", p: add(c1, scl(d, LCH)) }); bonds.push({ a: 1, b: i, orden: 1 }); }
  // C2: metilo
  for (const d of tetraTres(norm(sub(c1, c2)))) {
    const i = atoms.length; atoms.push({ el: "H", p: add(c2, scl(d, LCH)) }); bonds.push({ a: 2, b: i, orden: 1 });
  }
  return recenter({ atoms, bonds });
}

/** Metanol CH₃OH (carbono sp3 + grupo –OH). */
function metanol(): Geo {
  const c0: V = [0, 0, 0];
  const o: V = add(c0, scl(A, LCO));
  const atoms: AtomLocal[] = [{ el: "C", p: c0 }, { el: "O", p: o, fg: true }];
  const bonds: BondLocal[] = [{ a: 0, b: 1, orden: 1, fg: true }];
  // 3 H del carbono en las otras direcciones tetraédricas
  for (const d of [[T, -T, -T], [-T, T, -T], [-T, -T, T]] as V[]) {
    const i = atoms.length; atoms.push({ el: "H", p: add(c0, scl(d, LCH)) }); bonds.push({ a: 0, b: i, orden: 1 });
  }
  // H del –OH (acodado ~109° respecto a O→C)
  const dOH = tetraTres(norm(sub(c0, o)))[0]!;
  const i = atoms.length; atoms.push({ el: "H", p: add(o, scl(dOH, LOH)), fg: true }); bonds.push({ a: 1, b: i, orden: 1, fg: true });
  return recenter({ atoms, bonds });
}

/** Etanol CH₃–CH₂–OH (metilo + metileno con –OH). */
function etanol(): Geo {
  const c0: V = [0, 0, 0];           // CH₃
  const c1: V = add(c0, scl(A, LCC)); // CH₂
  const atoms: AtomLocal[] = [{ el: "C", p: c0 }, { el: "C", p: c1 }];
  const bonds: BondLocal[] = [{ a: 0, b: 1, orden: 1 }];
  // metilo del C0 (apunta hacia C1)
  for (const d of tetraTres(A)) {
    const i = atoms.length; atoms.push({ el: "H", p: add(c0, scl(d, LCH)) }); bonds.push({ a: 0, b: i, orden: 1 });
  }
  // C1: enlace de vuelta a C0 (dir −A); las otras 3 direcciones → O + 2 H
  const dirs = tetraTres(norm(scl(A, -1)));
  const o = add(c1, scl(dirs[0]!, LCO));
  const oi = atoms.length; atoms.push({ el: "O", p: o, fg: true }); bonds.push({ a: 1, b: oi, orden: 1, fg: true });
  for (const d of [dirs[1]!, dirs[2]!]) {
    const i = atoms.length; atoms.push({ el: "H", p: add(c1, scl(d, LCH)) }); bonds.push({ a: 1, b: i, orden: 1 });
  }
  // H del –OH
  const dOH = tetraTres(norm(sub(c1, o)))[0]!;
  const hi = atoms.length; atoms.push({ el: "H", p: add(o, scl(dOH, LOH)), fg: true }); bonds.push({ a: oi, b: hi, orden: 1, fg: true });
  return recenter({ atoms, bonds });
}

/** Ácido acético CH₃–COOH (metilo sp3 + carbono carboxilo sp2 con =O y –OH). */
function acetico(): Geo {
  const c0: V = [0, 0, 0];            // CH₃
  const c1: V = add(c0, scl(A, LCC)); // C del carboxilo (sp2)
  const atoms: AtomLocal[] = [{ el: "C", p: c0 }, { el: "C", p: c1, fg: true }];
  const bonds: BondLocal[] = [{ a: 0, b: 1, orden: 1 }];
  // metilo del C0
  for (const d of tetraTres(A)) {
    const i = atoms.length; atoms.push({ el: "H", p: add(c0, scl(d, LCH)) }); bonds.push({ a: 0, b: i, orden: 1 });
  }
  // plano sp2 en C1: un enlace hacia C0 (e1 = −A), los otros dos a ±120°
  const e1 = norm(scl(A, -1));
  const e2 = perp(e1);
  const dDbl = norm(add(scl(e1, -0.5), scl(e2, 0.866)));
  const dOh = norm(add(scl(e1, -0.5), scl(e2, -0.866)));
  const oD = add(c1, scl(dDbl, LCOD));
  const oS = add(c1, scl(dOh, LCO));
  const odi = atoms.length; atoms.push({ el: "O", p: oD, fg: true }); bonds.push({ a: 1, b: odi, orden: 2, fg: true });
  const osi = atoms.length; atoms.push({ el: "O", p: oS, fg: true }); bonds.push({ a: 1, b: osi, orden: 1, fg: true });
  // H del –OH, acodado en el plano del carboxilo
  const back = norm(sub(c1, oS));
  const eperp = norm(cross(norm(cross(e1, e2)), sub(oS, c1)));
  const dH = norm(add(scl(back, -1 / 3), scl(eperp, Math.sqrt(8) / 3)));
  const hi = atoms.length; atoms.push({ el: "H", p: add(oS, scl(dH, LOH)), fg: true }); bonds.push({ a: osi, b: hi, orden: 1, fg: true });
  return recenter({ atoms, bonds });
}

/* ── Cuenta átomos por elemento (consistente con la geometría) ───────────── */
function cuenta(g: Geo): { nC: number; nH: number; nO: number } {
  let nC = 0, nH = 0, nO = 0;
  for (const at of g.atoms) {
    if (at.el === "C") nC++;
    else if (at.el === "H") nH++;
    else nO++;
  }
  return { nC, nH, nO };
}

function mk(
  base: Omit<MolDef, "atoms" | "bonds" | "nC" | "nH" | "nO">,
  geo: Geo,
): MolDef {
  return { ...base, ...geo, ...cuenta(geo) };
}

/* ── Catálogo de compuestos (verbatim del contenido A1/A5) ───────────────── */
export const COMPUESTOS: MolDef[] = [
  mk({
    id: "metano", familia: "alcano", formula: "CH₄", nombre: "Metano",
    contexto: "Es el componente principal del gas natural que distribuye la CFE en México.",
    reactividad: "Poco reactivo (es una parafina); su reacción principal es la combustión.",
    enlaces: "4 enlaces simples C–H",
  }, metano()),
  mk({
    id: "propano", familia: "alcano", formula: "C₃H₈", nombre: "Propano",
    contexto: "Junto con el butano forma el gas LP que millones de hogares mexicanos usan para cocinar.",
    reactividad: "Poco reactivo; arde en la combustión (de ahí su uso como combustible).",
    enlaces: "solo enlaces simples C–C y C–H",
  }, alcano(3)),
  mk({
    id: "butano", familia: "alcano", formula: "C₄H₁₀", nombre: "Butano",
    contexto: "Junto con el propano forma el gas LP de los hogares mexicanos.",
    reactividad: "Poco reactivo; arde en la combustión.",
    enlaces: "solo enlaces simples C–C y C–H",
  }, alcano(4)),
  mk({
    id: "eteno", familia: "alqueno", formula: "C₂H₄", nombre: "Eteno (etileno)",
    contexto: "El compuesto orgánico más producido del mundo: materia prima del polietileno y el PVC; también es la hormona que madura las frutas.",
    reactividad: "Más reactivo que un alcano por el doble enlace C=C (reacciones de adición).",
    enlaces: "un doble enlace C=C + enlaces C–H",
  }, eteno()),
  mk({
    id: "propeno", familia: "alqueno", formula: "C₃H₆", nombre: "Propeno",
    contexto: "Alqueno de tres carbonos (CH₂=CHCH₃); aparece en la actividad de identificación de grupos funcionales.",
    reactividad: "Comparte con el eteno el doble enlace C=C que lo vuelve reactivo.",
    enlaces: "un doble enlace C=C + enlaces simples",
  }, propeno()),
  mk({
    id: "metanol", familia: "alcohol", formula: "CH₃OH", nombre: "Metanol",
    contexto: "Altamente tóxico; la adulteración de bebidas con metanol ha causado muertes en México (regulación de la COFEPRIS).",
    reactividad: "El grupo –OH lo hace polar; es tóxico y se oxida con facilidad.",
    enlaces: "C–O y O–H (grupo hidroxilo)",
  }, metanol()),
  mk({
    id: "etanol", familia: "alcohol", formula: "C₂H₅OH", nombre: "Etanol",
    contexto: "Es el alcohol de las bebidas fermentadas y destiladas; también se usa como aditivo de gasolinas.",
    reactividad: "El grupo –OH lo hace polar; se oxida y puede pasar a ácido acético.",
    enlaces: "C–C, C–O y O–H (grupo hidroxilo)",
  }, etanol()),
  mk({
    id: "acetico", familia: "acido", formula: "CH₃COOH", nombre: "Ácido acético",
    contexto: "Es el vinagre (al 5–8 % en solución) de la cocina mexicana.",
    reactividad: "Ácido débil: el grupo –COOH cede un protón H⁺ en solución.",
    enlaces: "C=O y C–O–H (grupo carboxilo)",
  }, acetico()),
];

export const COMP_DEF = "metano";

export function compuesto(id: string): MolDef {
  return COMPUESTOS.find((c) => c.id === id) ?? COMPUESTOS[0]!;
}
export function familiaInfo(id: Familia): FamiliaInfo {
  return FAMILIAS.find((f) => f.id === id) ?? FAMILIAS[0]!;
}
export function compuestosDe(id: Familia): MolDef[] {
  return COMPUESTOS.filter((c) => c.familia === id);
}

/* ── Texto didáctico ─────────────────────────────────────────────────────── */
export const IDEAS: string[] = [
  "La química orgánica estudia los compuestos del carbono. El carbono forma 4 enlaces covalentes y se une consigo mismo en cadenas, ramas y anillos, generando millones de compuestos.",
  "Un grupo funcional es el átomo o conjunto de átomos que define las propiedades y la reactividad de una familia de compuestos orgánicos.",
  "Alcanos: solo enlaces simples C–C (saturados, CₙH₂ₙ₊₂). Poco reactivos; ejemplo, el gas LP (propano y butano).",
  "Alquenos: al menos un doble enlace C=C (insaturados, CₙH₂ₙ). Más reactivos; ejemplo, el etileno que madura las frutas.",
  "Alcoholes: grupo hidroxilo –OH. Ejemplos, el etanol de las bebidas y el metanol tóxico.",
  "Ácidos carboxílicos: grupo carboxilo –COOH; ceden un H⁺. Ejemplo, el ácido acético del vinagre.",
  "Gira cada molécula: la geometría 3D (tetraédrica en sp3, plana en sp2) es tan importante como la fórmula para entender sus propiedades.",
];

export interface Dato { valor: string; texto: string; icono: string; }
export const DATOS: Dato[] = [
  { valor: "4 enlaces", texto: "el carbono forma cuatro enlaces covalentes", icono: "fa-share-nodes" },
  { valor: "grupo funcional", texto: "define las propiedades de cada familia", icono: "fa-atom" },
  { valor: "C, H y O", texto: "los elementos de estas cuatro familias", icono: "fa-vial" },
  { valor: "saturado / insaturado", texto: "sin o con dobles enlaces C=C", icono: "fa-equals" },
];

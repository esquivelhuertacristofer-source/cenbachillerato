/**
 * Datos — "Visor de las 4 biomoléculas" (CNEYT-IV-P05).
 *
 * Las CUATRO biomoléculas de la vida tomadas EXACTAMENTE de la infografía A1
 * ("Las cuatro biomoléculas de la vida: carbohidratos, lípidos, proteínas y
 * ácidos nucleicos en la dieta mexicana"):
 *   1) Carbohidratos — monómero glucosa (C₆H₁₂O₆) → polímero almidón.
 *   2) Lípidos       — glicerol + ácidos grasos → triglicérido (NO es polímero).
 *   3) Proteínas     — monómero aminoácido (glicina) → polímero péptido.
 *   4) Ácidos nucl.  — monómero nucleótido → polímero doble hélice de ADN.
 *
 * Cada biomolécula trae DOS geometrías ball-and-stick (esferas CPK + barras):
 * el MONÓMERO (la subunidad) y el ENSAMBLADO (el polímero / la estructura
 * grande). El concepto eje es el del glosario: "Polímero = molécula grande
 * formada por la unión repetida de subunidades llamadas monómeros" — por eso el
 * ensamblado se construye repitiendo el monómero y uniéndolo con enlaces nuevos
 * (verdes), liberando agua (condensación).
 *
 * Las geometrías son representaciones DIDÁCTICAS (no distancias de enlace
 * reales). La composición (nº de C, H, O, N, P) y la fórmula del monómero son
 * los valores REALES. El triglicérido y la doble hélice son esquemas: se indica
 * en `nota` cuando se omiten átomos para mayor claridad.
 *
 * Módulo puro (sin three): seguro de importar desde el shell sin arrastrar
 * three.js. Posiciones deterministas (nada de Math.random()/Date.now()).
 */

export type Elem = "C" | "H" | "O" | "N" | "P";

export interface ElemInfo {
  nombre: string;
  color: string;
  radio: number;
}

/** Colores tipo CPK ampliados (añade N azul y P naranja). */
export const ELEMS_B: Record<Elem, ElemInfo> = {
  H: { nombre: "Hidrógeno", color: "#E8EEF5", radio: 0.2 },
  C: { nombre: "Carbono", color: "#4A4A55", radio: 0.32 },
  O: { nombre: "Oxígeno", color: "#FF4D4D", radio: 0.3 },
  N: { nombre: "Nitrógeno", color: "#5B83F0", radio: 0.32 },
  P: { nombre: "Fósforo", color: "#F0A03C", radio: 0.42 },
};

export type V = [number, number, number];

export interface AtomLocal {
  el: Elem;
  p: V;
  fg?: boolean; // pertenece al grupo / parte que se resalta
}
export interface BondLocal {
  a: number;
  b: number;
  orden: 1 | 2;
  fg?: boolean;
  nuevo?: boolean; // enlace nuevo formado al polimerizar (se pinta verde)
}

export interface Geo {
  atoms: AtomLocal[];
  bonds: BondLocal[];
}

/* ── Helpers vectoriales (sin three) ─────────────────────────────────────── */
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scl = (a: V, s: number): V => [a[0] * s, a[1] * s, a[2] * s];
const len = (a: V): number => Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
const norm = (a: V): V => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

/** Centra una geometría en su centroide para que rote sobre su centro. */
function recenter(g: Geo): Geo {
  const n = g.atoms.length || 1;
  let cx = 0, cy = 0, cz = 0;
  for (const at of g.atoms) { cx += at.p[0]; cy += at.p[1]; cz += at.p[2]; }
  cx /= n; cy /= n; cz /= n;
  return {
    atoms: g.atoms.map((at) => ({ ...at, p: [at.p[0] - cx, at.p[1] - cy, at.p[2] - cz] as V })),
    bonds: g.bonds,
  };
}

/** Une varias geometrías reindexando los enlaces. */
function merge(...gs: Geo[]): Geo {
  const atoms: AtomLocal[] = [];
  const bonds: BondLocal[] = [];
  for (const g of gs) {
    const off = atoms.length;
    for (const a of g.atoms) atoms.push(a);
    for (const b of g.bonds) bonds.push({ ...b, a: b.a + off, b: b.b + off });
  }
  return { atoms, bonds };
}

/** Molécula de agua (para mostrar la condensación). */
function agua(c: V): Geo {
  const atoms: AtomLocal[] = [{ el: "O", p: c }];
  const bonds: BondLocal[] = [];
  atoms.push({ el: "H", p: add(c, [0.5, 0.45, 0]) }); bonds.push({ a: 0, b: 1, orden: 1 });
  atoms.push({ el: "H", p: add(c, [-0.5, 0.45, 0]) }); bonds.push({ a: 0, b: 2, orden: 1 });
  return { atoms, bonds };
}

interface Unidad { geo: Geo; aL: number; aR: number }

/**
 * Repite una unidad k veces desplazándola en x y une el ancla derecha (aR) de
 * cada copia con la izquierda (aL) de la siguiente mediante un enlace NUEVO
 * (verde). Añade una molécula de agua liberada por cada enlace (condensación).
 */
function polimerizar(u: Unidad, k: number, dx: number, conAgua: boolean): Geo {
  const atoms: AtomLocal[] = [];
  const bonds: BondLocal[] = [];
  const offs: number[] = [];
  for (let c = 0; c < k; c++) {
    const off = atoms.length;
    offs.push(off);
    for (const at of u.geo.atoms) atoms.push({ el: at.el, p: [at.p[0] + c * dx, at.p[1], at.p[2]] as V, fg: at.fg });
    for (const b of u.geo.bonds) bonds.push({ a: b.a + off, b: b.b + off, orden: b.orden, fg: b.fg });
  }
  for (let c = 0; c < k - 1; c++) {
    bonds.push({ a: offs[c]! + u.aR, b: offs[c + 1]! + u.aL, orden: 1, nuevo: true });
  }
  let g: Geo = { atoms, bonds };
  if (conAgua) {
    const aguas: Geo[] = [];
    for (let c = 0; c < k - 1; c++) aguas.push(agua([c * dx + dx / 2 - (k - 1) * dx / 2, -2.4, 0]));
    g = merge(g, ...aguas);
  }
  return recenter(g);
}

/* ── Monómeros (geometría didáctica, composición REAL) ────────────────────── */

/** Glucosa C₆H₁₂O₆ — anillo de piranosa (5 C + 1 O en el anillo, + C6 y –OH). */
function glucosa(): Unidad {
  const R = 1.25;
  const ringEl: Elem[] = ["O", "C", "C", "C", "C", "C"]; // O5, C1, C2, C3, C4, C5
  const ring: V[] = [];
  for (let k = 0; k < 6; k++) {
    const a = (k * Math.PI) / 3 - Math.PI / 2;
    ring.push([R * Math.cos(a), 0, R * Math.sin(a)]);
  }
  const atoms: AtomLocal[] = ring.map((p, i) => ({ el: ringEl[i]!, p: [p[0], p[1], p[2]] as V, fg: i === 0 }));
  const bonds: BondLocal[] = [];
  for (let i = 0; i < 6; i++) bonds.push({ a: i, b: (i + 1) % 6, orden: 1 });
  const outdir = (i: number): V => norm([ring[i]![0], 0, ring[i]![2]]);
  const addOH = (ci: number, yb: number) => {
    const base = ring[ci]!;
    const o = add(base, add(scl(outdir(ci), 1.0), [0, yb * 0.25, 0]));
    const oi = atoms.length; atoms.push({ el: "O", p: o, fg: true }); bonds.push({ a: ci, b: oi, orden: 1, fg: true });
    const h = add(o, add(scl(outdir(ci), 0.55), [0, yb * 0.45, 0]));
    atoms.push({ el: "H", p: h, fg: true }); bonds.push({ a: oi, b: atoms.length - 1, orden: 1, fg: true });
  };
  const addRingH = (ci: number, yb: number) => {
    const h = add(ring[ci]!, [0, yb * 0.95, 0]);
    atoms.push({ el: "H", p: h }); bonds.push({ a: ci, b: atoms.length - 1, orden: 1 });
  };
  addOH(1, 1); addRingH(1, -1);
  addOH(2, -1); addRingH(2, 1);
  addOH(3, 1); addRingH(3, -1);
  addOH(4, -1); addRingH(4, 1);
  // C5 (idx 5): C6 (CH₂OH) + 1 H
  const c5 = 5;
  const c6 = add(ring[c5]!, add(scl(outdir(c5), 1.1), [0, 0.6, 0]));
  const c6i = atoms.length; atoms.push({ el: "C", p: c6 }); bonds.push({ a: c5, b: c6i, orden: 1 });
  addRingH(c5, -1);
  const o6 = add(c6, [0, 0.85, 0]);
  const o6i = atoms.length; atoms.push({ el: "O", p: o6, fg: true }); bonds.push({ a: c6i, b: o6i, orden: 1, fg: true });
  atoms.push({ el: "H", p: add(o6, [0.4, 0.5, 0]), fg: true }); bonds.push({ a: o6i, b: atoms.length - 1, orden: 1, fg: true });
  atoms.push({ el: "H", p: add(c6, [0.6, 0.2, 0.5]) }); bonds.push({ a: c6i, b: atoms.length - 1, orden: 1 });
  atoms.push({ el: "H", p: add(c6, [0.6, 0.2, -0.5]) }); bonds.push({ a: c6i, b: atoms.length - 1, orden: 1 });
  return { geo: recenter({ atoms, bonds }), aL: 4 /* C4 */, aR: 1 /* C1 anomérico */ };
}

/** Aminoácido — glicina C₂H₅NO₂ (H₂N–CH₂–COOH). */
function glicina(): Unidad {
  const N: V = [-1.6, 0, 0], Ca: V = [0, 0, 0], Cc: V = [1.5, 0, 0];
  const atoms: AtomLocal[] = [
    { el: "N", p: N, fg: true }, { el: "C", p: Ca }, { el: "C", p: Cc, fg: true },
  ];
  const bonds: BondLocal[] = [{ a: 0, b: 1, orden: 1 }, { a: 1, b: 2, orden: 1 }];
  atoms.push({ el: "H", p: add(N, [-0.5, 0.8, 0]), fg: true }); bonds.push({ a: 0, b: atoms.length - 1, orden: 1, fg: true });
  atoms.push({ el: "H", p: add(N, [-0.5, -0.8, 0]), fg: true }); bonds.push({ a: 0, b: atoms.length - 1, orden: 1, fg: true });
  atoms.push({ el: "H", p: add(Ca, [0, 0.9, 0.4]) }); bonds.push({ a: 1, b: atoms.length - 1, orden: 1 });
  atoms.push({ el: "H", p: add(Ca, [0, -0.9, 0.4]) }); bonds.push({ a: 1, b: atoms.length - 1, orden: 1 });
  const oD: V = add(Cc, [0, 1.1, 0]);
  atoms.push({ el: "O", p: oD, fg: true }); bonds.push({ a: 2, b: atoms.length - 1, orden: 2, fg: true });
  const oS: V = add(Cc, [1.1, -0.5, 0]);
  const oSi = atoms.length; atoms.push({ el: "O", p: oS, fg: true }); bonds.push({ a: 2, b: oSi, orden: 1, fg: true });
  atoms.push({ el: "H", p: add(oS, [0.7, -0.3, 0]), fg: true }); bonds.push({ a: oSi, b: atoms.length - 1, orden: 1, fg: true });
  return { geo: recenter({ atoms, bonds }), aL: 0 /* N amino */, aR: 2 /* C carboxilo */ };
}

/** Glicerol C₃H₈O₃ — la "columna" de los lípidos (3 C, cada uno con –OH). */
function glicerol(): Geo {
  const C0: V = [-1.4, 0, 0], C1: V = [0, 0.4, 0], C2: V = [1.4, 0, 0];
  const atoms: AtomLocal[] = [{ el: "C", p: C0 }, { el: "C", p: C1 }, { el: "C", p: C2 }];
  const bonds: BondLocal[] = [{ a: 0, b: 1, orden: 1 }, { a: 1, b: 2, orden: 1 }];
  const addOH = (ci: number, base: V, dir: V) => {
    const o = add(base, scl(norm(dir), 1.0));
    const oi = atoms.length; atoms.push({ el: "O", p: o, fg: true }); bonds.push({ a: ci, b: oi, orden: 1, fg: true });
    atoms.push({ el: "H", p: add(o, scl(norm(dir), 0.6)), fg: true }); bonds.push({ a: oi, b: atoms.length - 1, orden: 1, fg: true });
  };
  addOH(0, C0, [-0.5, -1, 0]); addOH(1, C1, [0, 1, 0]); addOH(2, C2, [0.5, -1, 0]);
  atoms.push({ el: "H", p: add(C0, [-1, 0.7, 0]) }); bonds.push({ a: 0, b: atoms.length - 1, orden: 1 });
  atoms.push({ el: "H", p: add(C0, [-0.3, 0.5, 0.8]) }); bonds.push({ a: 0, b: atoms.length - 1, orden: 1 });
  atoms.push({ el: "H", p: add(C1, [0, -0.5, 0.9]) }); bonds.push({ a: 1, b: atoms.length - 1, orden: 1 });
  atoms.push({ el: "H", p: add(C2, [1, 0.7, 0]) }); bonds.push({ a: 2, b: atoms.length - 1, orden: 1 });
  atoms.push({ el: "H", p: add(C2, [0.3, 0.5, 0.8]) }); bonds.push({ a: 2, b: atoms.length - 1, orden: 1 });
  return recenter({ atoms, bonds });
}

/** Nucleótido (esquema): fosfato (P+O) – azúcar (anillo 5) – base nitrogenada. */
function nucleotido(): Unidad {
  const atoms: AtomLocal[] = [];
  const bonds: BondLocal[] = [];
  // Fosfato a la izquierda
  const P: V = [-2.7, 0, 0];
  const pi = atoms.length; atoms.push({ el: "P", p: P, fg: true });
  for (const d of [[-0.8, 0.9, 0], [-0.8, -0.9, 0], [0, 0, 1], [0, 0, -1]] as V[]) {
    atoms.push({ el: "O", p: add(P, scl(norm(d), 1.0)), fg: true }); bonds.push({ a: pi, b: atoms.length - 1, orden: 1, fg: true });
  }
  const o5 = pi + 1; // O que enlaza fosfato↔azúcar (ancla izquierda)
  // Azúcar: anillo de 5 (desoxirribosa esquemática: 4 C + 1 O)
  const cx = -0.3;
  const rel: Elem[] = ["O", "C", "C", "C", "C"];
  const ring: V[] = [];
  for (let k = 0; k < 5; k++) { const a = (k * 2 * Math.PI) / 5 + Math.PI / 2; ring.push([cx + 0.85 * Math.cos(a), 0.85 * Math.sin(a), 0]); }
  const ri: number[] = ring.map((p, i) => { const id = atoms.length; atoms.push({ el: rel[i]!, p: [p[0], p[1], p[2]] as V }); return id; });
  for (let i = 0; i < 5; i++) bonds.push({ a: ri[i]!, b: ri[(i + 1) % 5]!, orden: 1 });
  bonds.push({ a: pi, b: ri[1]!, orden: 1 }); // fosfato → azúcar
  // Base nitrogenada (hexágono con 2 N) a la derecha
  const bx = 2.0;
  const bel: Elem[] = ["N", "C", "C", "N", "C", "C"];
  const bring: V[] = [];
  for (let k = 0; k < 6; k++) { const a = k * (Math.PI / 3); bring.push([bx + 0.85 * Math.cos(a), 0.85 * Math.sin(a), 0]); }
  const bi: number[] = bring.map((p, i) => { const id = atoms.length; atoms.push({ el: bel[i]!, p: [p[0], p[1], p[2]] as V, fg: true }); return id; });
  for (let i = 0; i < 6; i++) bonds.push({ a: bi[i]!, b: bi[(i + 1) % 6]!, orden: i % 2 === 0 ? 2 : 1, fg: true });
  bonds.push({ a: ri[3]!, b: bi[0]!, orden: 1 }); // azúcar → base
  return { geo: recenter({ atoms, bonds }), aL: o5, aR: ri[3]! };
}

/** Triglicérido (esquema): glicerol + 3 cadenas de ácido graso (enlace éster). */
function trigliceridoGeo(): Geo {
  const gl = glicerol(); // ya centrado
  // anclas: los 3 oxígenos (–OH) del glicerol. En glicerol(), los O están en
  // los índices 3, 6 y 9 (cada addOH añade O y luego H). Reconstruimos puntos
  // de enganche de forma robusta tomando los átomos O del glicerol.
  const oIdx: number[] = [];
  gl.atoms.forEach((a, i) => { if (a.el === "O") oIdx.push(i); });
  // Cadena de carbonos (esquelética: solo C, se omiten los H para claridad).
  const cadena = (start: V, dir: V, n: number): Geo => {
    const atoms: AtomLocal[] = [];
    const bonds: BondLocal[] = [];
    const d = norm(dir);
    const perpv: V = [d[1], -d[0], 0];
    let prev = -1;
    for (let i = 0; i < n; i++) {
      const base = add(start, scl(d, i * 1.25));
      const zig = i % 2 === 0 ? 0.45 : -0.45;
      const p = add(base, scl(perpv, zig));
      atoms.push({ el: "C", p });
      if (prev >= 0) bonds.push({ a: prev, b: i, orden: 1 });
      prev = i;
    }
    // carbonilo C=O en el primer carbono (grupo éster, fg)
    atoms[0]!.fg = true;
    const oc = add(atoms[0]!.p, scl(perpv, 1.0));
    atoms.push({ el: "O", p: oc, fg: true }); bonds.push({ a: 0, b: atoms.length - 1, orden: 2, fg: true });
    return { atoms, bonds };
  };
  const partes: Geo[] = [gl];
  const dirs: V[] = [[-0.4, -1, 0], [0, 1, 0], [0.4, -1, 0]];
  const linkers: Array<[number, number]> = []; // [oGlobalIdx, cadenaStartGlobalIdx]
  let offset = gl.atoms.length;
  for (let j = 0; j < 3; j++) {
    const oAt = gl.atoms[oIdx[j]!]!;
    const start = add(oAt.p, scl(norm(dirs[j]!), 1.2));
    const ch = cadena(start, dirs[j]!, 5);
    linkers.push([oIdx[j]!, offset]); // enlace éster O(glicerol)→C1(cadena)
    partes.push(ch);
    offset += ch.atoms.length;
  }
  const g = merge(...partes);
  for (const [o, c] of linkers) g.bonds.push({ a: o, b: c, orden: 1, nuevo: true, fg: true });
  return recenter(g);
}

/** Doble hélice de ADN (esquema): 2 columnas P + pares de bases (rungs). */
function adnGeo(): Geo {
  const atoms: AtomLocal[] = [];
  const bonds: BondLocal[] = [];
  const N = 11, R = 1.5, rise = 0.5, turn = Math.PI / 3;
  const strandA: number[] = [], strandB: number[] = [];
  for (let i = 0; i < N; i++) {
    const a = i * turn;
    const y = i * rise - (N * rise) / 2;
    const pa: V = [R * Math.cos(a), y, R * Math.sin(a)];
    const pb: V = [R * Math.cos(a + Math.PI), y, R * Math.sin(a + Math.PI)];
    const ia = atoms.length; atoms.push({ el: "P", p: pa }); strandA.push(ia);
    const ib = atoms.length; atoms.push({ el: "P", p: pb }); strandB.push(ib);
    const da = norm([Math.cos(a), 0, Math.sin(a)]);
    const ja = atoms.length; atoms.push({ el: "N", p: add(pa, scl(da, -0.55)), fg: true });
    const jb = atoms.length; atoms.push({ el: "N", p: add(pb, scl(da, 0.55)), fg: true });
    bonds.push({ a: ia, b: ja, orden: 1 });
    bonds.push({ a: ib, b: jb, orden: 1 });
    bonds.push({ a: ja, b: jb, orden: 1, fg: true }); // par de bases
  }
  for (let i = 0; i < N - 1; i++) {
    bonds.push({ a: strandA[i]!, b: strandA[i + 1]!, orden: 1 });
    bonds.push({ a: strandB[i]!, b: strandB[i + 1]!, orden: 1 });
  }
  return { atoms, bonds };
}

/* ── Cuenta átomos por elemento ───────────────────────────────────────────── */
export interface Conteo { el: Elem; n: number }
export function conteo(g: Geo): Conteo[] {
  const orden: Elem[] = ["C", "H", "O", "N", "P"];
  const m = new Map<Elem, number>();
  for (const a of g.atoms) m.set(a.el, (m.get(a.el) ?? 0) + 1);
  return orden.filter((e) => m.has(e)).map((e) => ({ el: e, n: m.get(e)! }));
}
export function totalAtomos(g: Geo): number {
  return g.atoms.length;
}

/* ── Catálogo de biomoléculas (textos verbatim de la infografía A1) ───────── */
export type BioId = "carbohidrato" | "lipido" | "proteina" | "acido_nucleico";

export interface Vista { nombre: string; geo: Geo; nota?: string }

export interface Bio {
  id: BioId;
  label: string;
  color: string;
  icono: string;
  formulaMono: string;
  esPolimero: boolean;
  enlace: string;
  funcion: string;
  energia?: string;
  contexto: string;
  monomeroDesc: string;
  monomero: Vista;
  ensamblado: Vista;
}

// Precomputado una sola vez al cargar el módulo (determinista).
const _glucosa = glucosa();
const _glicina = glicina();
const _nucleotido = nucleotido();

export const BIOS: Bio[] = [
  {
    id: "carbohidrato",
    label: "Carbohidratos",
    color: "#34D399",
    icono: "fa-wheat-awn",
    formulaMono: "C₆H₁₂O₆",
    esPolimero: true,
    enlace: "enlace glucosídico",
    funcion: "Fuente principal de energía celular.",
    energia: "4 kcal/g",
    contexto:
      "México es el centro de origen del maíz. CONABIO documenta 64 razas nativas, domesticadas hace ~9,000 años en el actual Guerrero y Oaxaca; un mexicano promedio consume ~125 kg de tortillas al año.",
    monomeroDesc:
      "Monosacárido: la subunidad. La glucosa (C₆H₁₂O₆) es el azúcar más simple. Muchas glucosas unidas forman polisacáridos como el almidón, el glucógeno y la celulosa.",
    monomero: { nombre: "Glucosa (monosacárido)", geo: _glucosa.geo },
    ensamblado: {
      nombre: "Almidón (polisacárido)",
      geo: polimerizar(_glucosa, 3, 4.4, true),
      nota: "Tres glucosas unidas por enlaces glucosídicos (verdes); cada unión libera una molécula de agua (condensación).",
    },
  },
  {
    id: "lipido",
    label: "Lípidos",
    color: "#FBBF24",
    icono: "fa-droplet",
    formulaMono: "glicerol C₃H₈O₃ + ácidos grasos",
    esPolimero: false,
    enlace: "enlace éster",
    funcion: "Reserva energética densa, membranas celulares (fosfolípidos) y señalización hormonal.",
    energia: "9 kcal/g",
    contexto:
      "México es el primer productor mundial de aguacate, fruta con hasta 15% de grasa monoinsaturada cardioprotectora.",
    monomeroDesc:
      "Los lípidos NO son polímeros. Se forman de glicerol + ácidos grasos. Aquí se muestra el glicerol, la columna de 3 carbonos con tres grupos –OH donde se enganchan los ácidos grasos.",
    monomero: { nombre: "Glicerol (columna del lípido)", geo: glicerol() },
    ensamblado: {
      nombre: "Triglicérido (glicerol + 3 ácidos grasos)",
      geo: trigliceridoGeo(),
      nota: "Esquema: el glicerol esterifica (enlaces verdes) 3 cadenas de ácido graso. Se omiten los H de las cadenas para mayor claridad; los ácidos grasos reales tienen 12–20 carbonos.",
    },
  },
  {
    id: "proteina",
    label: "Proteínas",
    color: "#60A5FA",
    icono: "fa-dna",
    formulaMono: "aminoácido (glicina C₂H₅NO₂)",
    esPolimero: true,
    enlace: "enlace peptídico",
    funcion: "Estructura (colágeno), catálisis (enzimas), transporte (hemoglobina) y defensa (anticuerpos).",
    contexto:
      "El chapulín contiene 55–77% de proteína en peso seco —más que la carne de res (~25%)— y requiere 12 veces menos agua; el IPN investiga su producción industrial. El frijol y el nopal son fuentes tradicionales de proteína vegetal.",
    monomeroDesc:
      "Aminoácido: la subunidad. Hay 20 aminoácidos posibles; aquí se muestra la glicina (el más simple) con su grupo amino –NH₂ y su grupo carboxilo –COOH. Muchos aminoácidos unidos forman una proteína.",
    monomero: { nombre: "Aminoácido (glicina)", geo: _glicina.geo },
    ensamblado: {
      nombre: "Péptido (cadena de aminoácidos)",
      geo: polimerizar(_glicina, 3, 3.6, true),
      nota: "Tres aminoácidos unidos por enlaces peptídicos (verdes), entre el –COOH de uno y el –NH₂ del siguiente; cada unión libera agua.",
    },
  },
  {
    id: "acido_nucleico",
    label: "Ácidos nucleicos",
    color: "#C084FC",
    icono: "fa-diagram-project",
    formulaMono: "nucleótido (fosfato + azúcar + base)",
    esPolimero: true,
    enlace: "enlace fosfodiéster",
    funcion: "El ADN almacena la información genética; el ARN la traduce en proteínas.",
    contexto:
      "La molécula de ADN humana tiene ~3,200 millones de pares de bases —extendida mediría ~2 metros. El LANGEBIO-CINVESTAV en Irapuato ha secuenciado el genoma completo de más de 15 razas de maíz nativo mexicano.",
    monomeroDesc:
      "Nucleótido: la subunidad. Se compone de un grupo fosfato, un azúcar (desoxirribosa) y una base nitrogenada (A, T, G, C). Muchos nucleótidos unidos forman el ADN, una doble hélice.",
    monomero: { nombre: "Nucleótido (fosfato–azúcar–base)", geo: _nucleotido.geo, nota: "Esquema de las 3 partes del nucleótido; geometría didáctica." },
    ensamblado: {
      nombre: "Doble hélice de ADN",
      geo: adnGeo(),
      nota: "Esquema: dos columnas de fosfato (naranja) enrolladas en hélice, unidas por los pares de bases (azul). El ADN real tiene ~3,200 millones de pares de bases.",
    },
  },
];

export const BIO_DEF: BioId = "carbohidrato";

export function bio(id: BioId): Bio {
  return BIOS.find((b) => b.id === id) ?? BIOS[0]!;
}

/* ── Texto didáctico ─────────────────────────────────────────────────────── */
export const IDEAS: string[] = [
  "Las cuatro biomoléculas de la vida son carbohidratos, lípidos, proteínas y ácidos nucleicos. Todas están formadas principalmente por carbono, hidrógeno y oxígeno (las proteínas añaden nitrógeno; los ácidos nucleicos, nitrógeno y fósforo).",
  "Un polímero es una molécula grande formada por la unión repetida de subunidades pequeñas llamadas monómeros: las proteínas son polímeros de aminoácidos; el ADN, de nucleótidos; el almidón, de glucosa.",
  "Carbohidratos: la fuente principal de energía (4 kcal/g). Monómero: la glucosa.",
  "Lípidos: la reserva energética más densa (9 kcal/g) y el material de las membranas. NO son polímeros: se forman de glicerol + ácidos grasos.",
  "Proteínas: hacen casi todo en la célula (estructura, enzimas, transporte, defensa). Monómero: el aminoácido (hay 20 posibles).",
  "Ácidos nucleicos: guardan y traducen la información genética. Monómero: el nucleótido (fosfato + azúcar + base nitrogenada).",
  "Ningún alimento está formado por una sola biomolécula: una tortilla es sobre todo almidón con algo de proteína; un aguacate, lípidos; los chapulines, ~70% proteína.",
];

export interface Dato { valor: string; texto: string; icono: string }
export const DATOS: Dato[] = [
  { valor: "4 biomoléculas", texto: "carbohidratos, lípidos, proteínas y ácidos nucleicos", icono: "fa-layer-group" },
  { valor: "64 razas", texto: "de maíz nativo documenta CONABIO en México", icono: "fa-wheat-awn" },
  { valor: "9 vs 4 kcal/g", texto: "los lípidos dan más del doble de energía que los carbohidratos", icono: "fa-fire" },
  { valor: "~2 metros", texto: "mediría el ADN de una célula humana extendido", icono: "fa-ruler-horizontal" },
];

export const RETO = {
  intro:
    "Reto (de la infografía): elige una comida tradicional mexicana que hayas consumido esta semana. Identifica las cuatro biomoléculas presentes en cada ingrediente.",
  items: [
    "Tortilla → sobre todo carbohidratos (almidón del maíz), algo de proteína y trazas de lípidos.",
    "Aguacate → lípidos (hasta 15% de grasa), fibra y pocos carbohidratos.",
    "Frijol → proteína vegetal + carbohidratos; complementa los aminoácidos del maíz.",
    "Chapulín → ~70% proteína y ~10% grasa.",
  ],
};

/* ────────────────────────────────────────────────────────────────────────────
 * QUIZ EVALUABLE — VERBATIM de CNEYT-IV-P05-A2 (quiz_verdadero_falso)
 * "¿Verdadero o falso? Biomoléculas a fondo"
 *
 * Fuente (dump): scripts/_sem4_dump.txt líneas 1574–1611.
 * puntaje_minimo_aprobacion=70 → puntajeMinimo: 70
 * Mapeo V/F: respuesta true  → respuestaCorrecta: 0 ("Verdadero", índice 0)
 *            respuesta false → respuestaCorrecta: 1 ("Falso",     índice 1)
 * ──────────────────────────────────────────────────────────────────────────── */
import type { QuizEvaluable } from "./_reto-quiz";

export const QUIZ_A2: QuizEvaluable = {
  titulo: "¿Verdadero o falso? Biomoléculas a fondo",
  puntajeMinimo: 70,
  reactivos: [
    {
      // respuesta: true
      enunciado: "Las proteínas son polímeros de aminoácidos unidos por enlaces peptídicos.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion:
        "Correcto. Los aminoácidos se unen mediante enlaces peptídicos (–CO–NH–) formando cadenas que se pliegan en estructuras tridimensionales específicas (estructura secundaria, terciaria y cuaternaria) que determinan su función.",
    },
    {
      // respuesta: false
      enunciado: "La glucosa (C₆H₁₂O₆) es un lípido que sirve como fuente inmediata de energía para las células.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 1,
      retroalimentacion:
        "La glucosa es un carbohidrato (monosacárido), no un lípido. Es la principal fuente de energía inmediata para las células, incluyendo las neuronas del cerebro. Los lípidos (grasas) son la reserva de energía a largo plazo (9 kcal/g vs 4 kcal/g de los carbohidratos).",
    },
    {
      // respuesta: true
      enunciado: "El ADN contiene la información genética codificada en la secuencia de sus cuatro bases nitrogenadas: adenina, timina, guanina y citosina.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion:
        "Correcto. El código genético está escrito en el lenguaje de cuatro bases (A, T, G, C en el ADN; A, U, G, C en el ARN). La secuencia de estas bases en los genes determina la secuencia de aminoácidos en las proteínas.",
    },
    {
      // respuesta: false
      enunciado: "Las grasas saturadas tienen dobles enlaces C=C en sus cadenas de ácidos grasos, lo que las hace líquidas a temperatura ambiente.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 1,
      retroalimentacion:
        "Es al revés: las grasas INSATURADAS tienen dobles enlaces C=C que crean 'codos' en la cadena, impidiendo el empaquetamiento y haciéndolas líquidas (aceites). Las grasas SATURADAS no tienen dobles enlaces: sus cadenas se empaquetan bien y son sólidas a temperatura ambiente (manteca, mantequilla).",
    },
    {
      // respuesta: true
      enunciado: "El colágeno es la proteína más abundante del cuerpo humano y tiene función estructural en piel, tendones y cartílagos.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion:
        "Correcto. El colágeno representa ~30% de todas las proteínas del cuerpo humano. Forma fibras resistentes en tendones, cartílagos, huesos, piel y córnea. Su degradación con el envejecimiento produce arrugas y pérdida de elasticidad en la piel.",
    },
    {
      // respuesta: false
      enunciado: "Los ácidos nucleicos (ADN y ARN) son los únicos polímeros biológicos que existen en la naturaleza.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 1,
      retroalimentacion:
        "Los polímeros biológicos (biopolímeros) incluyen cuatro familias: ácidos nucleicos (ADN y ARN), proteínas (polímeros de aminoácidos), polisacáridos como el almidón y la celulosa (polímeros de glucosa), y en algunos contextos los lípidos de membrana (fosfolípidos). Hay muchos tipos de biopolímeros, no solo los ácidos nucleicos.",
    },
  ],
};

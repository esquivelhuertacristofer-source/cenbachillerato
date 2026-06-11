/**
 * Datos y geometría PURA del laboratorio "División celular: mitosis y meiosis".
 * (CNEYT-VI·O5). NO importa three / @react-three — es un módulo de datos para no
 * inflar el bundle del Worker (límite 3 MiB gzipped del plan FREE).
 *
 * Modela una célula con 2n = 4 (dos pares de cromosomas homólogos: un par largo
 * "A" y uno corto "B"), simplificación estándar de libro de texto, y devuelve,
 * para cada fase de la mitosis y de la meiosis, la posición de cada cromátida,
 * las membranas celulares, los núcleos y los polos del huso. La escena 3D solo
 * interpola (lerp) hacia esos objetivos por id estable.
 *
 * Fidelidad: el NÚMERO de células hijas, la ploidía resultante (2n→2n en mitosis,
 * 2n→n en meiosis), la separación reduccional de homólogos en Anafase I, la
 * separación de cromátidas hermanas en Anafase II y la recombinación (crossing
 * over) son CORRECTOS. El modelo es ESQUEMÁTICO (no a escala): representa el
 * mecanismo, no una estructura medida.
 */

export type Modo = "mitosis" | "meiosis" | "comparar";

export const MODOS: Modo[] = ["mitosis", "meiosis", "comparar"];

export interface ModoDef {
  etq: string;
  subtitulo: string;
  icono: string;
  color: string;
}

export const MODOS_DEF: Record<Modo, ModoDef> = {
  mitosis: {
    etq: "Mitosis",
    subtitulo: "1 célula → 2 idénticas (2n)",
    icono: "fa-clone",
    color: "#34d399",
  },
  meiosis: {
    etq: "Meiosis",
    subtitulo: "1 célula → 4 diversas (n)",
    icono: "fa-shuffle",
    color: "#a78bfa",
  },
  comparar: {
    etq: "Comparar",
    subtitulo: "Mitosis vs. meiosis",
    icono: "fa-scale-balanced",
    color: "#fbbf24",
  },
};

/* ── Colores de cromátidas ───────────────────────────────────────────────── */
export const COLOR_MATERNO = "#f472b6"; // rosa  (cromosomas de origen materno)
export const COLOR_PATERNO = "#60a5fa"; // azul  (cromosomas de origen paterno)
export const COLOR_CENTROMERO = "#e2e8f0";

export const THETA = 0.34; // inclinación de cada cromátida hermana → forma de "X"

const LARGO_A = 1.7; // par largo
const LARGO_B = 1.05; // par corto

type Vec3 = [number, number, number];

/** Una cromátida lista para renderizar (objetivo de interpolación). */
export interface Cromatida {
  id: string; // estable entre fases → permite lerp
  pos: Vec3;
  rot: number; // rotación z (forma de X cuando hay hermanas)
  largo: number;
  color: string;
  colorPunta: string | null; // tramo recombinado (crossing over)
  condensada: boolean;
}

/** Una célula (membrana). */
export interface Celula {
  c: Vec3;
  r: number;
}

/** Resultado completo de una fase, listo para la escena. */
export interface EscenaVis {
  nombre: string;
  desc: string;
  ploidia: string;
  celulas: Celula[];
  nucleos: Vec3[];
  polos: Vec3[]; // de a pares forman husos
  cromatidas: Cromatida[];
  recombinacion: boolean;
}

/** Cromosoma posicionado: 1 cromátida (separada) o 2 hermanas (forma de X). */
interface Croma {
  centro: Vec3;
  ids: string[]; // 1 o 2 ids de cromátida
  largo: number;
  condensado: boolean;
}

interface FaseDef {
  nombre: string;
  desc: string;
  ploidia: string;
  celulas: Celula[];
  nucleos: Vec3[];
  polos: Vec3[];
  cromas: Croma[];
}

const colorDe = (id: string): string => (id.charAt(1) === "m" ? COLOR_MATERNO : COLOR_PATERNO);

/** Cromátidas que intercambiaron un tramo en el crossing over (meiosis). */
const RECOMBINADAS = new Set(["Am1", "Ap0", "Bm1", "Bp0"]);
const puntaDe = (id: string, recomb: boolean): string | null => {
  if (!recomb || !RECOMBINADAS.has(id)) return null;
  // recibe el color del homólogo opuesto
  return id.charAt(1) === "m" ? COLOR_PATERNO : COLOR_MATERNO;
};

function expandir(cromas: Croma[], recomb: boolean): Cromatida[] {
  const out: Cromatida[] = [];
  for (const c of cromas) {
    if (c.ids.length === 2) {
      const a = c.ids[0]!;
      const b = c.ids[1]!;
      out.push({ id: a, pos: c.centro, rot: c.condensado ? THETA : 0.12, largo: c.largo, color: colorDe(a), colorPunta: puntaDe(a, recomb), condensada: c.condensado });
      out.push({ id: b, pos: c.centro, rot: c.condensado ? -THETA : -0.12, largo: c.largo, color: colorDe(b), colorPunta: puntaDe(b, recomb), condensada: c.condensado });
    } else {
      const a = c.ids[0]!;
      out.push({ id: a, pos: c.centro, rot: 0, largo: c.largo, color: colorDe(a), colorPunta: puntaDe(a, recomb), condensada: c.condensado });
    }
  }
  return out;
}

/* Helpers de construcción */
const xX = (centro: Vec3, ids: [string, string], largo: number, cond = true): Croma => ({ centro, ids, largo, condensado: cond });
const single = (centro: Vec3, id: string, largo: number, cond = true): Croma => ({ centro, ids: [id], largo, condensado: cond });

const CELULA_UNA: Celula[] = [{ c: [0, 0, 0], r: 3.1 }];
const POLOS_HORIZ: Vec3[] = [[-4.7, 0, 0], [4.7, 0, 0]];

/* ───────────────────────── MITOSIS (6 fases) ───────────────────────── */
const MITOSIS: FaseDef[] = [
  {
    nombre: "Interfase",
    desc: "La célula crece y duplica su ADN (fase S): cada cromosoma queda con dos cromátidas hermanas idénticas. La cromatina está descondensada dentro del núcleo.",
    ploidia: "2n = 4 (diploide) · ADN duplicado",
    celulas: CELULA_UNA,
    nucleos: [[0, 0, 0]],
    polos: [],
    cromas: [
      xX([-1.2, 0.9, 0.4], ["Am0", "Am1"], LARGO_A, false),
      xX([1.1, 1.0, -0.3], ["Ap0", "Ap1"], LARGO_A, false),
      xX([-1.0, -1.0, -0.4], ["Bm0", "Bm1"], LARGO_B, false),
      xX([1.2, -0.8, 0.5], ["Bp0", "Bp1"], LARGO_B, false),
    ],
  },
  {
    nombre: "Profase",
    desc: "Los cromosomas se condensan y se hacen visibles (forma de X). La envoltura nuclear se desintegra y empieza a formarse el huso mitótico desde los polos.",
    ploidia: "2n = 4 · cromosomas condensados",
    celulas: CELULA_UNA,
    nucleos: [],
    polos: POLOS_HORIZ,
    cromas: [
      xX([-1.3, 1.1, 0.3], ["Am0", "Am1"], LARGO_A),
      xX([1.2, 1.2, -0.2], ["Ap0", "Ap1"], LARGO_A),
      xX([-1.1, -1.1, -0.3], ["Bm0", "Bm1"], LARGO_B),
      xX([1.3, -0.9, 0.4], ["Bp0", "Bp1"], LARGO_B),
    ],
  },
  {
    nombre: "Metafase",
    desc: "Los cromosomas se alinean en una sola fila en el plano ecuatorial (placa metafásica). Cada cromosoma se une por el centrómero a fibras de ambos polos.",
    ploidia: "2n = 4 · alineados en el ecuador",
    celulas: CELULA_UNA,
    nucleos: [],
    polos: POLOS_HORIZ,
    cromas: [
      xX([0, 1.8, 0], ["Am0", "Am1"], LARGO_A),
      xX([0, 0.6, 0], ["Ap0", "Ap1"], LARGO_A),
      xX([0, -0.6, 0], ["Bm0", "Bm1"], LARGO_B),
      xX([0, -1.8, 0], ["Bp0", "Bp1"], LARGO_B),
    ],
  },
  {
    nombre: "Anafase",
    desc: "Las cromátidas hermanas se separan por el centrómero y son arrastradas hacia polos opuestos. Cada polo recibe una copia completa e idéntica del genoma.",
    ploidia: "se reparten cromátidas idénticas",
    celulas: CELULA_UNA,
    nucleos: [],
    polos: POLOS_HORIZ,
    cromas: [
      single([-2.7, 1.8, 0], "Am0", LARGO_A), single([2.7, 1.8, 0], "Am1", LARGO_A),
      single([-2.7, 0.6, 0], "Ap0", LARGO_A), single([2.7, 0.6, 0], "Ap1", LARGO_A),
      single([-2.7, -0.6, 0], "Bm0", LARGO_B), single([2.7, -0.6, 0], "Bm1", LARGO_B),
      single([-2.7, -1.8, 0], "Bp0", LARGO_B), single([2.7, -1.8, 0], "Bp1", LARGO_B),
    ],
  },
  {
    nombre: "Telofase",
    desc: "Los cromosomas llegan a los polos y se descondensan; se forma una nueva envoltura nuclear alrededor de cada juego. La célula empieza a estrangularse.",
    ploidia: "dos núcleos 2n = 4 en formación",
    celulas: CELULA_UNA,
    nucleos: [[-3.0, 0, 0], [3.0, 0, 0]],
    polos: [],
    cromas: [
      single([-3.0, 1.4, 0], "Am0", LARGO_A, false), single([3.0, 1.4, 0], "Am1", LARGO_A, false),
      single([-3.0, 0.5, 0], "Ap0", LARGO_A, false), single([3.0, 0.5, 0], "Ap1", LARGO_A, false),
      single([-3.0, -0.5, 0], "Bm0", LARGO_B, false), single([3.0, -0.5, 0], "Bm1", LARGO_B, false),
      single([-3.0, -1.4, 0], "Bp0", LARGO_B, false), single([3.0, -1.4, 0], "Bp1", LARGO_B, false),
    ],
  },
  {
    nombre: "Citocinesis",
    desc: "El citoplasma se divide: nacen DOS células hijas genéticamente IDÉNTICAS entre sí y a la célula madre (2n = 4). La mitosis sirve para crecer, reparar y regenerar tejidos.",
    ploidia: "2 células hijas idénticas · 2n = 4",
    celulas: [{ c: [-3.2, 0, 0], r: 2.1 }, { c: [3.2, 0, 0], r: 2.1 }],
    nucleos: [[-3.2, 0, 0], [3.2, 0, 0]],
    polos: [],
    cromas: [
      single([-3.6, 0.9, 0], "Am0", LARGO_A, false), single([-2.8, 0.9, 0], "Ap0", LARGO_A, false),
      single([-3.6, -0.9, 0], "Bm0", LARGO_B, false), single([-2.8, -0.9, 0], "Bp0", LARGO_B, false),
      single([2.8, 0.9, 0], "Am1", LARGO_A, false), single([3.6, 0.9, 0], "Ap1", LARGO_A, false),
      single([2.8, -0.9, 0], "Bm1", LARGO_B, false), single([3.6, -0.9, 0], "Bp1", LARGO_B, false),
    ],
  },
];

/* ───────────────────────── MEIOSIS (8 fases) ───────────────────────── */
const DOS_CELULAS: Celula[] = [{ c: [-3.2, 0, 0], r: 2.1 }, { c: [3.2, 0, 0], r: 2.1 }];

const MEIOSIS: FaseDef[] = [
  {
    nombre: "Interfase",
    desc: "Igual que en la mitosis: la célula duplica su ADN. Cada cromosoma queda con dos cromátidas hermanas antes de iniciar las DOS divisiones meióticas.",
    ploidia: "2n = 4 (diploide) · ADN duplicado",
    celulas: CELULA_UNA,
    nucleos: [[0, 0, 0]],
    polos: [],
    cromas: [
      xX([-1.2, 0.9, 0.4], ["Am0", "Am1"], LARGO_A, false),
      xX([1.1, 1.0, -0.3], ["Ap0", "Ap1"], LARGO_A, false),
      xX([-1.0, -1.0, -0.4], ["Bm0", "Bm1"], LARGO_B, false),
      xX([1.2, -0.8, 0.5], ["Bp0", "Bp1"], LARGO_B, false),
    ],
  },
  {
    nombre: "Profase I",
    desc: "Los cromosomas homólogos se aparean (sinapsis) formando tétradas y ocurre el CROSSING OVER: intercambian tramos de ADN. Aquí nace gran parte de la variabilidad genética.",
    ploidia: "homólogos apareados · recombinación",
    celulas: CELULA_UNA,
    nucleos: [],
    polos: POLOS_HORIZ,
    cromas: [
      xX([-0.55, 1.5, 0], ["Am0", "Am1"], LARGO_A),
      xX([0.55, 1.5, 0], ["Ap0", "Ap1"], LARGO_A),
      xX([-0.55, -1.5, 0], ["Bm0", "Bm1"], LARGO_B),
      xX([0.55, -1.5, 0], ["Bp0", "Bp1"], LARGO_B),
    ],
  },
  {
    nombre: "Metafase I",
    desc: "Las tétradas (pares de homólogos) se alinean en el ecuador en DOBLE fila. Su orientación es al azar: es la 'distribución independiente' que mezcla los cromosomas maternos y paternos.",
    ploidia: "tétradas alineadas · al azar",
    celulas: CELULA_UNA,
    nucleos: [],
    polos: POLOS_HORIZ,
    cromas: [
      xX([-0.7, 1.3, 0], ["Am0", "Am1"], LARGO_A),
      xX([0.7, 1.3, 0], ["Ap0", "Ap1"], LARGO_A),
      xX([-0.7, -1.3, 0], ["Bm0", "Bm1"], LARGO_B),
      xX([0.7, -1.3, 0], ["Bp0", "Bp1"], LARGO_B),
    ],
  },
  {
    nombre: "Anafase I",
    desc: "Se separan los cromosomas HOMÓLOGOS completos (las cromátidas hermanas siguen unidas). Es la división REDUCCIONAL: cada polo recibe la mitad de los cromosomas, mezclados al azar.",
    ploidia: "separación reduccional de homólogos",
    celulas: CELULA_UNA,
    nucleos: [],
    polos: POLOS_HORIZ,
    cromas: [
      xX([-2.7, 1.0, 0], ["Am0", "Am1"], LARGO_A),
      xX([-2.7, -1.0, 0], ["Bp0", "Bp1"], LARGO_B),
      xX([2.7, 1.0, 0], ["Ap0", "Ap1"], LARGO_A),
      xX([2.7, -1.0, 0], ["Bm0", "Bm1"], LARGO_B),
    ],
  },
  {
    nombre: "Telofase I",
    desc: "Nacen DOS células haploides (n = 2), cada una con un cromosoma de cada par —pero todavía con dos cromátidas hermanas—. La combinación de cromosomas de cada célula ya es única.",
    ploidia: "2 células n = 2 (aún duplicadas)",
    celulas: DOS_CELULAS,
    nucleos: [[-3.2, 0, 0], [3.2, 0, 0]],
    polos: [],
    cromas: [
      xX([-3.2, 0.9, 0], ["Am0", "Am1"], LARGO_A),
      xX([-3.2, -0.9, 0], ["Bp0", "Bp1"], LARGO_B),
      xX([3.2, 0.9, 0], ["Ap0", "Ap1"], LARGO_A),
      xX([3.2, -0.9, 0], ["Bm0", "Bm1"], LARGO_B),
    ],
  },
  {
    nombre: "Metafase II",
    desc: "Sin nueva duplicación de ADN, en cada una de las dos células los cromosomas se alinean en fila en el ecuador, listos para la segunda división (parecida a una mitosis).",
    ploidia: "alineados en 2 células · n = 2",
    celulas: DOS_CELULAS,
    nucleos: [],
    polos: [[-4.7, 0, 0], [-1.7, 0, 0], [1.7, 0, 0], [4.7, 0, 0]],
    cromas: [
      xX([-3.2, 0.8, 0], ["Am0", "Am1"], LARGO_A),
      xX([-3.2, -0.8, 0], ["Bp0", "Bp1"], LARGO_B),
      xX([3.2, 0.8, 0], ["Ap0", "Ap1"], LARGO_A),
      xX([3.2, -0.8, 0], ["Bm0", "Bm1"], LARGO_B),
    ],
  },
  {
    nombre: "Anafase II",
    desc: "Ahora sí se separan las cromátidas hermanas dentro de cada célula y migran a polos opuestos. Es la división ECUACIONAL (como en la mitosis).",
    ploidia: "separación de cromátidas hermanas",
    celulas: DOS_CELULAS,
    nucleos: [],
    polos: [[-4.7, 0, 0], [-1.7, 0, 0], [1.7, 0, 0], [4.7, 0, 0]],
    cromas: [
      single([-4.4, 0.8, 0], "Am0", LARGO_A), single([-2.0, 0.8, 0], "Am1", LARGO_A),
      single([-4.4, -0.8, 0], "Bp0", LARGO_B), single([-2.0, -0.8, 0], "Bp1", LARGO_B),
      single([2.0, 0.8, 0], "Ap0", LARGO_A), single([4.4, 0.8, 0], "Ap1", LARGO_A),
      single([2.0, -0.8, 0], "Bm0", LARGO_B), single([4.4, -0.8, 0], "Bm1", LARGO_B),
    ],
  },
  {
    nombre: "Telofase II",
    desc: "Resultado final: CUATRO células haploides (n = 2), todas genéticamente DISTINTAS entre sí y de la madre, por la recombinación y la distribución al azar. En animales son los gametos.",
    ploidia: "4 gametos n = 2 · todos distintos",
    celulas: [{ c: [-4.6, 0, 0], r: 1.45 }, { c: [-1.55, 0, 0], r: 1.45 }, { c: [1.55, 0, 0], r: 1.45 }, { c: [4.6, 0, 0], r: 1.45 }],
    nucleos: [[-4.6, 0, 0], [-1.55, 0, 0], [1.55, 0, 0], [4.6, 0, 0]],
    polos: [],
    cromas: [
      single([-4.8, 0.45, 0], "Am0", LARGO_A, false), single([-4.4, -0.45, 0], "Bp0", LARGO_B, false),
      single([-1.75, 0.45, 0], "Am1", LARGO_A, false), single([-1.35, -0.45, 0], "Bp1", LARGO_B, false),
      single([1.35, 0.45, 0], "Ap0", LARGO_A, false), single([1.75, -0.45, 0], "Bm0", LARGO_B, false),
      single([4.4, 0.45, 0], "Ap1", LARGO_A, false), single([4.8, -0.45, 0], "Bm1", LARGO_B, false),
    ],
  },
];

export const FASES: Record<Exclude<Modo, "comparar">, string[]> = {
  mitosis: MITOSIS.map((f) => f.nombre),
  meiosis: MEIOSIS.map((f) => f.nombre),
};

export function numFases(modo: Modo): number {
  if (modo === "mitosis") return MITOSIS.length;
  if (modo === "meiosis") return MEIOSIS.length;
  return 1;
}

/** Escena de una fase dada (mitosis/meiosis), lista para la escena 3D. */
export function escenaPara(modo: Modo, idx: number): EscenaVis {
  if (modo === "comparar") return escenaComparar();
  const fases = modo === "mitosis" ? MITOSIS : MEIOSIS;
  const i = Math.max(0, Math.min(idx, fases.length - 1));
  const f = fases[i]!;
  const recomb = modo === "meiosis" && i >= 1; // tras el crossing over de Profase I
  return {
    nombre: f.nombre,
    desc: f.desc,
    ploidia: f.ploidia,
    celulas: f.celulas,
    nucleos: f.nucleos,
    polos: f.polos,
    cromatidas: expandir(f.cromas, recomb),
    recombinacion: recomb,
  };
}

/** Comparación estática: arriba mitosis (2 idénticas), abajo meiosis (4 diversas). */
function escenaComparar(): EscenaVis {
  const cromas: Cromatida[] = [];
  // ── arriba: 2 células idénticas (mitosis) ──
  const topY = 2.25;
  const idCol = [COLOR_MATERNO, COLOR_PATERNO, COLOR_MATERNO, COLOR_PATERNO];
  const largos = [LARGO_A, LARGO_A, LARGO_B, LARGO_B];
  for (const cx of [-2.4, 2.4]) {
    const ys = [topY + 0.5, topY + 0.5, topY - 0.5, topY - 0.5];
    const xs = [cx - 0.45, cx + 0.45, cx - 0.45, cx + 0.45];
    for (let k = 0; k < 4; k++) {
      cromas.push({ id: `T${cx}_${k}`, pos: [xs[k]!, ys[k]!, 0], rot: 0, largo: largos[k]!, color: idCol[k]!, colorPunta: null, condensada: false });
    }
  }
  // ── abajo: 4 células diversas (meiosis) ──
  const botY = -2.25;
  const cellsBot: Vec3[] = [[-4.6, botY, 0], [-1.55, botY, 0], [1.55, botY, 0], [4.6, botY, 0]];
  // cada gameto: 2 cromosomas (n=2), colores/recombinación distintos
  const gametos: { c: string; tip: string | null; lg: number }[][] = [
    [{ c: COLOR_MATERNO, tip: COLOR_PATERNO, lg: LARGO_A }, { c: COLOR_PATERNO, tip: COLOR_MATERNO, lg: LARGO_B }],
    [{ c: COLOR_MATERNO, tip: null, lg: LARGO_A }, { c: COLOR_PATERNO, tip: null, lg: LARGO_B }],
    [{ c: COLOR_PATERNO, tip: COLOR_MATERNO, lg: LARGO_A }, { c: COLOR_MATERNO, tip: COLOR_PATERNO, lg: LARGO_B }],
    [{ c: COLOR_PATERNO, tip: null, lg: LARGO_A }, { c: COLOR_MATERNO, tip: null, lg: LARGO_B }],
  ];
  for (let g = 0; g < 4; g++) {
    const center = cellsBot[g]!;
    const par = gametos[g]!;
    cromas.push({ id: `G${g}_0`, pos: [center[0] - 0.2, botY + 0.45, 0], rot: 0, largo: par[0]!.lg, color: par[0]!.c, colorPunta: par[0]!.tip, condensada: false });
    cromas.push({ id: `G${g}_1`, pos: [center[0] + 0.2, botY - 0.45, 0], rot: 0, largo: par[1]!.lg, color: par[1]!.c, colorPunta: par[1]!.tip, condensada: false });
  }
  return {
    nombre: "Mitosis vs. Meiosis",
    desc: "Arriba: la mitosis produce 2 células diploides idénticas (crecimiento y reparación). Abajo: la meiosis produce 4 células haploides genéticamente distintas (gametos para la reproducción sexual).",
    ploidia: "2 idénticas (2n) · 4 diversas (n)",
    celulas: [
      { c: [-2.4, topY, 0], r: 1.45 },
      { c: [2.4, topY, 0], r: 1.45 },
      ...cellsBot.map((c) => ({ c, r: 1.4 })),
    ],
    nucleos: [[-2.4, topY, 0], [2.4, topY, 0], ...cellsBot],
    polos: [],
    cromatidas: cromas,
    recombinacion: true,
  };
}

/* ── Comparación tabular (tarjeta lateral) ───────────────────────────────── */
export interface FilaComparacion {
  rasgo: string;
  mitosis: string;
  meiosis: string;
}
export const COMPARACION: FilaComparacion[] = [
  { rasgo: "Nº de divisiones", mitosis: "1", meiosis: "2 (I y II)" },
  { rasgo: "Células hijas", mitosis: "2", meiosis: "4" },
  { rasgo: "Ploidía resultante", mitosis: "Diploide (2n)", meiosis: "Haploide (n)" },
  { rasgo: "Variación genética", mitosis: "Ninguna (clones)", meiosis: "Sí (recombinación)" },
  { rasgo: "Apareamiento de homólogos", mitosis: "No", meiosis: "Sí (tétradas)" },
  { rasgo: "Crossing over", mitosis: "No", meiosis: "Sí (Profase I)" },
  { rasgo: "Función", mitosis: "Crecer, reparar, regenerar", meiosis: "Formar gametos" },
  { rasgo: "Dónde ocurre", mitosis: "Células somáticas", meiosis: "Células germinales" },
];

/* ── Cálculo de cromosomas (para la actividad A2 / lecturas en vivo) ──────── */
export interface ResultadoDivision {
  modo: "mitosis" | "meiosis";
  cel2n: number; // cromosomas de la célula madre (2n)
  celulasHijas: number;
  cromosomasPorHija: number;
  combinaciones: number; // distribución independiente (solo meiosis), 2^n
  diploide: boolean;
}

export function calcularDivision(modo: "mitosis" | "meiosis", cel2n: number): ResultadoDivision {
  const n = Math.round(cel2n / 2);
  if (modo === "mitosis") {
    return { modo, cel2n, celulasHijas: 2, cromosomasPorHija: cel2n, combinaciones: 1, diploide: true };
  }
  return { modo, cel2n, celulasHijas: 4, cromosomasPorHija: n, combinaciones: Math.pow(2, n), diploide: false };
}

/** Nº de células tras k rondas de mitosis a partir de una sola. */
export function celulasTrasMitosis(k: number): number {
  return Math.pow(2, k);
}

/* ── Formateadores ───────────────────────────────────────────────────────── */
export function fmtEntero(n: number): string {
  return new Intl.NumberFormat("es-MX").format(Math.round(n));
}

/* ── Contenido didáctico verbatim/fiel (MCCEMS 2025 · CNEYT-VI·O5) ────────── */

export const PROBLEMA =
  "Toda célula proviene de otra célula. Pero hay dos maneras de dividirse: la mitosis hace copias idénticas para que un organismo crezca y repare sus tejidos, mientras que la meiosis fabrica gametos (óvulos y espermatozoides) con la mitad de los cromosomas y genéticamente distintos. Recorre fase por fase cada proceso y descubre por qué uno produce clones y el otro, diversidad.";

export const INSTRUCCIONES: Record<Modo, string[]> = {
  mitosis: [
    "Pulsa ▶ o arrastra la barra para avanzar fase por fase: Interfase → Profase → Metafase → Anafase → Telofase → Citocinesis.",
    "Observa en Metafase cómo los cromosomas se alinean en UNA fila, y en Anafase cómo se separan las cromátidas hermanas hacia polos opuestos.",
    "Fíjate en el resultado: 2 células hijas con los mismos colores que la madre → son genéticamente IDÉNTICAS (2n = 4).",
  ],
  meiosis: [
    "Avanza por las dos divisiones: Profase I (crossing over) → Metafase I → Anafase I (se separan homólogos) → Telofase I → Metafase II → Anafase II → Telofase II.",
    "En Profase I observa el intercambio de tramos de color (recombinación) y en Anafase I que se separan cromosomas COMPLETOS, no cromátidas.",
    "Cuenta el resultado: 4 células con la MITAD de cromosomas (n = 2) y combinaciones de color distintas → 4 gametos diversos.",
  ],
  comparar: [
    "Compara los resultados lado a lado: arriba la mitosis (2 idénticas), abajo la meiosis (4 distintas).",
    "Revisa la tabla 'Mitosis vs. Meiosis' de la derecha: nº de divisiones, células hijas, ploidía y variación.",
    "Relaciona cada proceso con su función: crecer/reparar (mitosis) frente a formar gametos y generar diversidad (meiosis).",
  ],
};

export const PREGUNTAS: Record<Modo, string[]> = {
  mitosis: [
    "¿Por qué las dos células hijas de la mitosis son idénticas a la célula madre?",
    "Si una célula 2n = 46 se divide por mitosis, ¿cuántos cromosomas tendrá cada célula hija?",
    "¿Qué pasaría si el control de la mitosis fallara y las células se dividieran sin parar?",
  ],
  meiosis: [
    "¿En qué fase se reduce a la mitad el número de cromosomas: Anafase I o Anafase II? ¿Por qué?",
    "¿Cómo contribuye el crossing over de la Profase I a la variabilidad genética?",
    "Si en la meiosis los homólogos no se separaran bien, ¿qué consecuencia tendría en el gameto?",
  ],
  comparar: [
    "Menciona dos diferencias clave entre mitosis y meiosis en cuanto al número de células hijas y su ploidía.",
    "¿Por qué la reproducción sexual (con meiosis) genera más diversidad que la reproducción asexual (con mitosis)?",
    "¿En qué tipo de células de tu cuerpo ocurre cada proceso?",
  ],
};

export const IDEAS: string[] = [
  "La mitosis conserva el número de cromosomas (2n → 2n); la meiosis lo reduce a la mitad (2n → n).",
  "La mitosis produce 2 células idénticas; la meiosis, 4 células genéticamente distintas.",
  "El ADN se duplica UNA sola vez (en la interfase), pero en la meiosis hay DOS divisiones seguidas: por eso baja la ploidía.",
  "El crossing over (Profase I) y la distribución independiente de los homólogos generan la variabilidad genética.",
  "En la Anafase I se separan cromosomas homólogos; en la Anafase II (y en la mitosis) se separan cromátidas hermanas.",
  "La mitosis permite crecer, cicatrizar y regenerar; la meiosis hace posible la reproducción sexual.",
  "El cáncer es, en esencia, mitosis sin control: células que se dividen sin detenerse.",
  "Un error al repartir cromosomas en la meiosis (no disyunción) puede producir gametos con cromosomas de más o de menos.",
];

export interface GlosarioItem {
  termino: string;
  definicion: string;
  ejemplo: string;
}
export const GLOSARIO: GlosarioItem[] = [
  { termino: "Cromosoma", definicion: "Estructura de ADN muy compactado que porta los genes; en humanos hay 46 (23 pares).", ejemplo: "Antes de dividirse, cada cromosoma se duplica en dos cromátidas hermanas." },
  { termino: "Cromátida hermana", definicion: "Cada una de las dos copias idénticas de un cromosoma duplicado, unidas por el centrómero.", ejemplo: "En la Anafase mitótica las cromátidas hermanas se separan." },
  { termino: "Cromosomas homólogos", definicion: "El par de cromosomas con los mismos genes, uno de origen materno y otro paterno.", ejemplo: "En la Profase I los homólogos se aparean formando una tétrada." },
  { termino: "Diploide (2n)", definicion: "Célula con dos juegos completos de cromosomas (uno de cada progenitor).", ejemplo: "Las células del cuerpo humano son diploides: 2n = 46." },
  { termino: "Haploide (n)", definicion: "Célula con un solo juego de cromosomas; es el estado de los gametos.", ejemplo: "Los óvulos y espermatozoides son haploides: n = 23." },
  { termino: "Mitosis", definicion: "División celular que produce dos células hijas idénticas a la madre (2n → 2n).", ejemplo: "La piel se renueva gracias a la mitosis." },
  { termino: "Meiosis", definicion: "Dos divisiones sucesivas que producen cuatro células haploides distintas (2n → n).", ejemplo: "La meiosis forma los gametos en ovarios y testículos." },
  { termino: "Crossing over", definicion: "Intercambio de fragmentos de ADN entre cromátidas de homólogos durante la Profase I.", ejemplo: "El crossing over recombina los genes y aumenta la diversidad." },
  { termino: "Recombinación genética", definicion: "Nuevas combinaciones de genes que surgen por crossing over y distribución independiente.", ejemplo: "Por la recombinación, ningún hermano es genéticamente igual a otro." },
  { termino: "Gameto", definicion: "Célula sexual haploide (óvulo o espermatozoide) que se une en la fecundación.", ejemplo: "Al unirse dos gametos haploides se restaura el número diploide (n + n = 2n)." },
];

export const CONTEXTO =
  "En México, el estudio de la división celular es clave en la salud: el Instituto Nacional de Cancerología (INCan) investiga el cáncer, que es mitosis descontrolada, y campañas como la detección temprana de cáncer cervicouterino y de mama buscan frenar esa proliferación. Por el lado de la meiosis, la enorme biodiversidad de México —uno de los países megadiversos del mundo— se sostiene en la variabilidad genética que genera la reproducción sexual.";

export const FUENTE =
  "MCCEMS 2025 — Ciencias Naturales, Experimentales y Tecnología VI, propósito formativo O5: «Identifica las fases de la mitosis y la meiosis…». Contenidos: fases e importancia de la mitosis y la meiosis; recombinación genética como factor de biodiversidad; procesos fundamentales de la división celular.";

export interface EjemploResuelto {
  enunciado: string;
  datos: string[];
  solucion: string;
  resultado: string;
}
export const EJEMPLO: EjemploResuelto = {
  enunciado:
    "Una célula somática humana tiene 2n = 46 cromosomas. (a) Si se divide por mitosis, ¿cuántas células hijas se obtienen y con cuántos cromosomas cada una? (b) Si en cambio entra en meiosis, ¿cuántas células y con cuántos cromosomas? (c) ¿Cuántas combinaciones distintas de cromosomas puede generar la distribución independiente?",
  datos: ["2n = 46 (23 pares) ⇒ n = 23 cromosomas", "Mitosis: 1 división", "Meiosis: 2 divisiones"],
  solucion:
    "(a) Mitosis: 1 célula → 2 células hijas, cada una con 46 cromosomas (2n, idénticas). (b) Meiosis: 1 célula → 4 células hijas, cada una con 23 cromosomas (n, haploides). (c) Por distribución independiente de 23 pares hay 2²³ = 8 388 608 combinaciones posibles (¡sin contar aún el crossing over!).",
  resultado: "Mitosis: 2 células × 46 · Meiosis: 4 células × 23 · 2²³ = 8 388 608 combinaciones",
};

export interface DatoClave {
  valor: string;
  texto: string;
  icono: string;
}
export const DATOS: DatoClave[] = [
  { valor: "46", texto: "cromosomas (23 pares) en una célula humana diploide", icono: "fa-list-ol" },
  { valor: "23", texto: "cromosomas en cada gameto humano (haploide)", icono: "fa-divide" },
  { valor: "8 388 608", texto: "combinaciones por distribución independiente (2²³)", icono: "fa-shuffle" },
  { valor: "≈2 billones", texto: "de divisiones celulares al día en un cuerpo humano adulto", icono: "fa-clock" },
];

export const HECHOS: string[] = [
  "La mitosis y la meiosis comparten una misma duplicación previa del ADN; lo que cambia es cuántas veces se divide la célula después.",
  "La recombinación de la meiosis es la razón de fondo por la que cada persona (salvo gemelos idénticos) es genéticamente única.",
  "Sin meiosis, la fecundación duplicaría el número de cromosomas en cada generación: la meiosis mantiene constante el 2n de la especie.",
];

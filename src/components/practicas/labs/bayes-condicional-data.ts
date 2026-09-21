/**
 * Datos del laboratorio "Bayes: actualizar creencias con nueva información"
 * (PM-VI-P06, progresión 11 de Pensamiento Matemático VI).
 *
 * OJO con la numeración: en PM-VI el sufijo del código NO coincide con el
 * número de progresión. La progresión 11 es la que lleva los códigos
 * PM-VI-P06-*.
 *
 * El laboratorio se ancla al ejercicio A2 «calcular probabilidades
 * condicionales en pruebas diagnósticas médicas», que viaja verbatim como
 * reto evaluable; el marco teórico es la lectura A1, los hechos salen del
 * quiz A4 y el glosario del A5.
 *
 * Todas las probabilidades de pantalla se calculan: las del árbol con
 * fracciones exactas y las de la prueba diagnóstica con la fórmula de Bayes
 * y, al lado, con el conteo de personas que la ilustra.
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { RetoNumericoData } from "./_reto-numerico";

/* ── Modos ────────────────────────────────────────────────────────────── */
export type Modo = "reducido" | "arbol" | "diagnostico";

export const MODOS: Modo[] = ["reducido", "arbol", "diagnostico"];

export interface ModoDef {
  etq: string;
  subtitulo: string;
  icono: string;
  color: string;
  fuente: "A1" | "A2" | "A4";
}

export const MODOS_DEF: Record<Modo, ModoDef> = {
  reducido: {
    etq: "El espacio se reduce",
    subtitulo: "P(A|B): quedarse solo con quienes cumplen B",
    icono: "fa-people-group",
    color: "#7dd3fc",
    fuente: "A1",
  },
  arbol: {
    etq: "Árbol y regla del producto",
    subtitulo: "Probabilidad total e inversión con Bayes",
    icono: "fa-code-branch",
    color: "#c084fc",
    fuente: "A4",
  },
  diagnostico: {
    etq: "Prueba diagnóstica",
    subtitulo: "Prevalencia, sensibilidad, especificidad y VPP",
    icono: "fa-vial-virus",
    color: "#fb7185",
    fuente: "A2",
  },
};

/* ── Fracciones exactas ──────────────────────────────────────────────── */
export interface Frac {
  num: number;
  den: number;
}

function mcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : mcd(b, a % b);
}

export function reducir(f: Frac): Frac {
  if (f.num === 0) return { num: 0, den: 1 };
  const g = mcd(f.num, f.den) || 1;
  return { num: f.num / g, den: f.den / g };
}

export const fr = (num: number, den: number): Frac => ({ num, den });
export const mul = (a: Frac, b: Frac): Frac => reducir({ num: a.num * b.num, den: a.den * b.den });
export const sum = (a: Frac, b: Frac): Frac => reducir({ num: a.num * b.den + b.num * a.den, den: a.den * b.den });
export const div = (a: Frac, b: Frac): Frac => reducir({ num: a.num * b.den, den: a.den * b.num });
export const comp = (a: Frac): Frac => reducir({ num: a.den - a.num, den: a.den });
export const valor = (f: Frac): number => (f.den === 0 ? 0 : f.num / f.den);
export const iguales = (a: Frac, b: Frac): boolean => a.num * b.den === b.num * a.den;
export const txtFrac = (f: Frac): string => (f.den === 1 ? String(f.num) : `${f.num}/${f.den}`);

/* ══════════════════════════════════════════════════════════════════════
 * MODO 1 · EL ESPACIO MUESTRAL SE REDUCE
 * ══════════════════════════════════════════════════════════════════════ */

export interface PoblacionDef {
  id: string;
  etq: string;
  fuente: "A1" | "A5";
  nota: string;
  total: number;
  /** Nombre del grupo que condiciona (B) y de su complemento. */
  nombreB: string;
  nombreBc: string;
  /** Singular corto para escribir P(A | hombre). */
  cortoB: string;
  cortoBc: string;
  /** El evento que se mide (A). */
  nombreA: string;
  cortoA: string;
  nB: number;
  /** Personas en A y en B. */
  nAB: number;
  /** Personas en A y fuera de B, al empezar. */
  nABcInicial: number;
  /** Si el material no da A∩Bᶜ, el alumno lo ajusta. */
  abcAjustable: boolean;
}

export const POBLACIONES: PoblacionDef[] = [
  {
    id: "fumadores",
    etq: "100 personas: ¿quién fuma?",
    fuente: "A1",
    nota: "El ejemplo de la lectura A1: 40 hombres, 60 mujeres y 10 de los hombres fuman. La lectura no dice cuántas mujeres fuman; ese dato lo eliges tú.",
    total: 100,
    nombreB: "Hombres",
    nombreBc: "Mujeres",
    cortoB: "hombre",
    cortoBc: "mujer",
    nombreA: "Fuma",
    cortoA: "fuma",
    nB: 40,
    nAB: 10,
    nABcInicial: 6,
    abcAjustable: true,
  },
  {
    id: "estudiantes",
    etq: "100 estudiantes: estudio y deporte",
    fuente: "A5",
    nota: "El ejemplo del glosario A5: 60 estudian, 40 practican deporte y 25 hacen ambas cosas.",
    total: 100,
    nombreB: "Estudian",
    nombreBc: "No estudian",
    cortoB: "estudia",
    cortoBc: "no estudia",
    nombreA: "Hace deporte",
    cortoA: "deporte",
    nB: 60,
    nAB: 25,
    nABcInicial: 15,
    abcAjustable: false,
  },
];

export function poblacionPorId(id: string): PoblacionDef {
  return POBLACIONES.find((p) => p.id === id) ?? POBLACIONES[0]!;
}

export type Condicion = "ninguna" | "B" | "Bc" | "A";

export const CONDICIONES: Condicion[] = ["ninguna", "B", "Bc", "A"];

export interface LecturaCondicional {
  /** P(fuma | hombre), por ejemplo. */
  notacion: string;
  favorables: number;
  espacio: number;
  /** Nombre del espacio muestral que queda. */
  espacioNombre: string;
}

/** Lo que se lee con cada condición: favorables entre el espacio que queda. */
export function lecturaCondicional(p: PoblacionDef, nABc: number, c: Condicion): LecturaCondicional {
  const nBc = p.total - p.nB;
  const nA = p.nAB + nABc;
  switch (c) {
    case "ninguna":
      return { notacion: `P(${p.cortoA})`, favorables: nA, espacio: p.total, espacioNombre: "todas las personas" };
    case "B":
      return { notacion: `P(${p.cortoA} | ${p.cortoB})`, favorables: p.nAB, espacio: p.nB, espacioNombre: p.nombreB.toLowerCase() };
    case "Bc":
      return { notacion: `P(${p.cortoA} | ${p.cortoBc})`, favorables: nABc, espacio: nBc, espacioNombre: p.nombreBc.toLowerCase() };
    case "A":
      return { notacion: `P(${p.cortoB} | ${p.cortoA})`, favorables: p.nAB, espacio: nA, espacioNombre: `quienes cumplen «${p.nombreA.toLowerCase()}»` };
  }
}

/** A y B son independientes si P(A|B) = P(A|Bᶜ), es decir, nAB/nB = nABc/nBc. */
export function sonIndependientes(p: PoblacionDef, nABc: number): boolean {
  const nBc = p.total - p.nB;
  return p.nAB * nBc === nABc * p.nB;
}

/** El valor de A∩Bᶜ que vuelve independientes a A y B (si es entero). */
export function nABcIndependiente(p: PoblacionDef): number | null {
  const x = (p.nAB * (p.total - p.nB)) / p.nB;
  return Number.isInteger(x) ? x : null;
}

/* ══════════════════════════════════════════════════════════════════════
 * MODO 2 · ÁRBOL, REGLA DEL PRODUCTO Y BAYES
 * ══════════════════════════════════════════════════════════════════════ */

export interface ExperimentoArbol {
  id: string;
  etq: string;
  fuente: "A2" | "A4" | "A5";
  nota: string;
  /** Resultados de la 1.ª etapa (B y Bᶜ) y de la 2.ª (A y Aᶜ), en corto. */
  b: string;
  bc: string;
  a: string;
  ac: string;
  /** Nombre de cada etapa. */
  etapa1: string;
  etapa2: string;
  pB: Frac;
  pAdadoB: Frac;
  pAdadoBc: Frac;
  /** Mostrar decimales en lugar de fracciones (datos en porcentaje). */
  decimal: boolean;
}

export const EXPERIMENTOS: ExperimentoArbol[] = [
  {
    id: "bolsa",
    etq: "Bolsa: 4 rojas y 6 azules",
    fuente: "A4",
    nota: "El caso del quiz A4: dos bolas sin reposición. La segunda depende de lo que salió primero.",
    b: "roja",
    bc: "azul",
    a: "roja",
    ac: "azul",
    etapa1: "1.ª bola",
    etapa2: "2.ª bola",
    pB: fr(4, 10),
    pAdadoB: fr(3, 9),
    pAdadoBc: fr(4, 9),
    decimal: false,
  },
  {
    id: "caja",
    etq: "Caja: 5 azules de 10",
    fuente: "A5",
    nota: "La actividad final del glosario A5: 5 azules, 3 rojas y 2 verdes; dos extracciones sin reposición.",
    b: "azul",
    bc: "no azul",
    a: "azul",
    ac: "no azul",
    etapa1: "1.ª bola",
    etapa2: "2.ª bola",
    pB: fr(5, 10),
    pAdadoB: fr(4, 9),
    pAdadoBc: fr(5, 9),
    decimal: false,
  },
  {
    id: "moneda",
    etq: "Moneda y dado",
    fuente: "A5",
    nota: "El ejemplo del glosario A5: la moneda no le avisa nada al dado. Las dos ramas de la 2.ª etapa valen lo mismo.",
    b: "cara",
    bc: "cruz",
    a: "6",
    ac: "no 6",
    etapa1: "Moneda",
    etapa2: "Dado",
    pB: fr(1, 2),
    pAdadoB: fr(1, 6),
    pAdadoBc: fr(1, 6),
    decimal: false,
  },
  {
    id: "diabetes",
    etq: "Prueba de diabetes",
    fuente: "A2",
    nota: "Los datos del ejercicio A2 como árbol: primero la realidad (diabetes o no), después el resultado de la prueba.",
    b: "diabetes",
    bc: "sin diabetes",
    a: "positivo",
    ac: "negativo",
    etapa1: "Realidad",
    etapa2: "Prueba",
    pB: fr(10, 100),
    pAdadoB: fr(90, 100),
    pAdadoBc: fr(5, 100),
    decimal: true,
  },
];

export function experimentoPorId(id: string): ExperimentoArbol {
  return EXPERIMENTOS.find((e) => e.id === id) ?? EXPERIMENTOS[0]!;
}

export interface HojaArbol {
  /** 0: B∩A · 1: B∩Aᶜ · 2: Bᶜ∩A · 3: Bᶜ∩Aᶜ */
  k: number;
  etq: string;
  enB: boolean;
  enA: boolean;
  p: Frac;
}

export interface ArbolCalculado {
  pBc: Frac;
  pAcDadoB: Frac;
  pAcDadoBc: Frac;
  hojas: HojaArbol[];
  /** Probabilidad total de A. */
  pA: Frac;
  /** Bayes: P(B|A) = P(B∩A)/P(A). */
  pBdadoA: Frac;
  independientes: boolean;
}

export function calcularArbol(e: ExperimentoArbol): ArbolCalculado {
  const pBc = comp(e.pB);
  const pAcDadoB = comp(e.pAdadoB);
  const pAcDadoBc = comp(e.pAdadoBc);
  const hojas: HojaArbol[] = [
    { k: 0, etq: `${e.b} → ${e.a}`, enB: true, enA: true, p: mul(e.pB, e.pAdadoB) },
    { k: 1, etq: `${e.b} → ${e.ac}`, enB: true, enA: false, p: mul(e.pB, pAcDadoB) },
    { k: 2, etq: `${e.bc} → ${e.a}`, enB: false, enA: true, p: mul(pBc, e.pAdadoBc) },
    { k: 3, etq: `${e.bc} → ${e.ac}`, enB: false, enA: false, p: mul(pBc, pAcDadoBc) },
  ];
  const pA = sum(hojas[0]!.p, hojas[2]!.p);
  return {
    pBc,
    pAcDadoB,
    pAcDadoBc,
    hojas,
    pA,
    pBdadoA: div(hojas[0]!.p, pA),
    independientes: iguales(e.pAdadoB, e.pAdadoBc),
  };
}

/** Repite el experimento `n` veces; devuelve los conteos por hoja. */
export function simularArbol(e: ExperimentoArbol, n: number): number[] {
  const pB = valor(e.pB);
  const pAB = valor(e.pAdadoB);
  const pABc = valor(e.pAdadoBc);
  const h = [0, 0, 0, 0];
  for (let k = 0; k < n; k++) {
    const enB = Math.random() < pB;
    const enA = Math.random() < (enB ? pAB : pABc);
    const i = enB ? (enA ? 0 : 1) : enA ? 2 : 3;
    h[i] = h[i]! + 1;
  }
  return h;
}

/** Texto de una probabilidad del árbol según el experimento. */
export function txtP(e: ExperimentoArbol, f: Frac): string {
  return e.decimal ? fmtDec(valor(f), 4) : txtFrac(f);
}

/* ══════════════════════════════════════════════════════════════════════
 * MODO 3 · PRUEBA DIAGNÓSTICA
 * ══════════════════════════════════════════════════════════════════════ */

export const PREVALENCIAS = [0.001, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.3, 0.5];
export const SENSIBILIDADES = [0.5, 0.6, 0.7, 0.8, 0.85, 0.9, 0.95, 0.99, 0.999];
export const ESPECIFICIDADES = [0.5, 0.6, 0.7, 0.8, 0.85, 0.9, 0.95, 0.98, 0.99, 0.999];

export interface EscenarioDx {
  id: string;
  etq: string;
  nota: string;
  /** El único escenario del material oficial es el de A2. */
  oficial: boolean;
  prevalencia: number;
  sensibilidad: number;
  especificidad: number;
}

export const ESCENARIOS: EscenarioDx[] = [
  {
    id: "a2",
    etq: "Diabetes (ejercicio A2)",
    nota: "Sensibilidad 90 %, especificidad 95 % y prevalencia 10 %: los datos del ejercicio A2.",
    oficial: true,
    prevalencia: 0.1,
    sensibilidad: 0.9,
    especificidad: 0.95,
  },
  {
    id: "rara",
    etq: "La misma prueba, enfermedad rara",
    nota: "Escenario del laboratorio: la prueba no cambia, solo la prevalencia baja al 1 %.",
    oficial: false,
    prevalencia: 0.01,
    sensibilidad: 0.9,
    especificidad: 0.95,
  },
  {
    id: "excelente",
    etq: "Prueba excelente, enfermedad muy rara",
    nota: "Escenario del laboratorio: 99 % de sensibilidad y de especificidad con una prevalencia de 1 en 1 000.",
    oficial: false,
    prevalencia: 0.001,
    sensibilidad: 0.99,
    especificidad: 0.99,
  },
];

export interface BayesDx {
  /** P(positivo y enfermo) = prevalencia · sensibilidad */
  pVP: number;
  /** P(positivo y sano) = (1 − prevalencia) · (1 − especificidad) */
  pFP: number;
  /** Probabilidad total de salir positivo. */
  pPos: number;
  /** Valor Predictivo Positivo: P(enfermo | positivo). */
  vpp: number;
}

export function bayesDx(prev: number, sens: number, esp: number): BayesDx {
  const pVP = prev * sens;
  const pFP = (1 - prev) * (1 - esp);
  const pPos = pVP + pFP;
  return { pVP, pFP, pPos, vpp: pPos === 0 ? 0 : pVP / pPos };
}

export interface ConteosDx {
  total: number;
  enfermos: number;
  sanos: number;
  vp: number;
  fn: number;
  fp: number;
  vn: number;
}

/** Frecuencias esperadas en una población de `total` personas. */
export function conteosDx(total: number, prev: number, sens: number, esp: number): ConteosDx {
  const enfermos = Math.round(total * prev);
  return conteosDesde(enfermos, total - enfermos, sens, esp);
}

/** Aplica la prueba a un grupo del que ya se sabe cuántos están enfermos. */
export function conteosDesde(enfermos: number, sanos: number, sens: number, esp: number): ConteosDx {
  const vp = Math.round(enfermos * sens);
  const fp = Math.round(sanos * (1 - esp));
  return { total: enfermos + sanos, enfermos, sanos, vp, fn: enfermos - vp, fp, vn: sanos - fp };
}

/** Categoría de cada persona: 0 VP · 1 FN · 2 FP · 3 VN. */
export const CAT_VP = 0;
export const CAT_FN = 1;
export const CAT_FP = 2;
export const CAT_VN = 3;

/** Generador pseudoaleatorio con semilla: la misma población en cada render. */
function mulberry32(semilla: number) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Reparte las cuatro categorías entre las personas, en orden aleatorio estable. */
export function poblacionDx(c: ConteosDx, semilla: number): Uint8Array {
  const out = new Uint8Array(c.total);
  let i = 0;
  for (let k = 0; k < c.vp; k++) out[i++] = CAT_VP;
  for (let k = 0; k < c.fn; k++) out[i++] = CAT_FN;
  for (let k = 0; k < c.fp; k++) out[i++] = CAT_FP;
  for (let k = 0; k < c.vn; k++) out[i++] = CAT_VN;
  const rnd = mulberry32(semilla);
  for (let k = out.length - 1; k > 0; k--) {
    const j = Math.floor(rnd() * (k + 1));
    const t = out[k]!;
    out[k] = out[j]!;
    out[j] = t;
  }
  return out;
}

export const COL_DX = {
  enfermo: "#f43f5e",
  sano: "#475569",
  vp: "#fb7185",
  fn: "#9f1239",
  fp: "#38bdf8",
  vn: "#334155",
};

export function fmtPct(x: number, dec = 2): string {
  return `${(x * 100).toFixed(dec)} %`;
}

export function fmtDec(x: number, dec = 4): string {
  return String(Number(x.toFixed(dec)));
}

/* ── Casos para la tarjeta de estrellas: conteos enteros en 10 000 ──────── */

export interface CasoEstimacion {
  prevalencia: number;
  sensibilidad: number;
  especificidad: number;
}

const CASO_PREV = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5];
const CASO_SENS = [0.8, 0.9, 0.95, 0.99];
const CASO_ESP = [0.9, 0.95, 0.99];

export function casoAleatorio(anterior?: CasoEstimacion): CasoEstimacion {
  for (let i = 0; i < 50; i++) {
    const c: CasoEstimacion = {
      prevalencia: CASO_PREV[Math.floor(Math.random() * CASO_PREV.length)]!,
      sensibilidad: CASO_SENS[Math.floor(Math.random() * CASO_SENS.length)]!,
      especificidad: CASO_ESP[Math.floor(Math.random() * CASO_ESP.length)]!,
    };
    if (!anterior || c.prevalencia !== anterior.prevalencia || c.sensibilidad !== anterior.sensibilidad || c.especificidad !== anterior.especificidad) return c;
  }
  return { prevalencia: 0.05, sensibilidad: 0.9, especificidad: 0.95 };
}

/** Estrellas por el error, en puntos porcentuales, de la estimación del VPP. */
export function estrellasPorError(pp: number): number {
  if (pp <= 2) return 3;
  if (pp <= 5) return 2;
  if (pp <= 12) return 1;
  return 0;
}

/* ══════════════════════════════════════════════════════════════════════
 * Textos — VERBATIM de las actividades ancla
 * ══════════════════════════════════════════════════════════════════════ */

export const PROBLEMA =
  "La probabilidad condicional responde a una pregunta fundamental: ¿como cambia la probabilidad de un evento cuando ya sabemos que otro evento ha ocurrido?";

export const DEFINICION =
  "P(A|B) = P(A interseccion B) / P(B): el espacio muestral se reduce a los resultados compatibles con B.";

/** Lectura A1 — los seis párrafos, verbatim (la fila de la plataforma viene sin tildes). */
export const LECTURA_A1: string[] = [
  "La probabilidad condicional responde a una pregunta fundamental: ¿como cambia la probabilidad de un evento cuando ya sabemos que otro evento ha ocurrido? Formalmente, la probabilidad de A dado B (escrita P(A|B)) es la probabilidad de que A ocurra sabiendo que B ya ocurrio. La formula es: P(A|B) = P(A interseccion B) / P(B), siempre que P(B) sea mayor que cero.",
  "La intuicion detras de esta formula es que el espacio muestral se reduce: ya no consideramos todos los resultados posibles, sino solo los que son compatibles con B. Por ejemplo, en un grupo de 100 personas, 40 son hombres y 60 son mujeres. De los 40 hombres, 10 fuman. La probabilidad de que una persona seleccionada al azar fume dado que es hombre es P(fuma|hombre) = 10/40 = 0.25. El espacio muestral se redujo de 100 a los 40 hombres.",
  "Dos eventos son independientes cuando conocer que uno ocurrio no cambia la probabilidad del otro: P(A|B) = P(A). Si los eventos son independientes, la regla del producto se simplifica: P(A interseccion B) = P(A) * P(B). En cambio, si son dependientes, P(A interseccion B) = P(A) * P(B|A). Esta regla del producto es esencial para calcular probabilidades conjuntas.",
  "El teorema de Bayes es una de las formulas mas poderosas de la estadistica moderna. Permite actualizar la probabilidad de una hipotesis a la luz de nueva evidencia. La formula basica es: P(B|A) = P(A|B) * P(B) / P(A). En contextos reales, esto significa que podemos calcular la probabilidad de que una hipotesis sea verdadera (por ejemplo, que un paciente tenga una enfermedad) dado que observamos cierta evidencia (que la prueba diagnostica salio positiva), usando la probabilidad previa de la enfermedad (prevalencia) y las caracteristicas de la prueba.",
  "En medicina, las pruebas diagnosticas se caracterizan por su sensibilidad y especificidad. La sensibilidad es P(positivo | enfermo): que tan bien detecta la prueba a los enfermos verdaderos. La especificidad es P(negativo | sano): que tan bien descarta a los sanos verdaderos. Un resultado positivo no garantiza la enfermedad: el Valor Predictivo Positivo (VPP) es la probabilidad de estar realmente enfermo dado que la prueba salio positiva, P(enfermo | positivo). Este valor depende crucialmente de la prevalencia de la enfermedad en la poblacion: una prueba muy buena puede tener un VPP bajo si la enfermedad es muy rara, porque los falsos positivos en personas sanas son numerosos.",
  "En Mexico, el IMSS e ISSSTE aplican estas herramientas en sus programas de deteccion temprana de cancer, diabetes e hipertension. Entender la probabilidad condicional permite al paciente y al medico interpretar correctamente un resultado positivo: no es una sentencia, es una probabilidad que debe confirmarse con pruebas adicionales.",
];

/** Preguntas de comprensión de la lectura A1 — verbatim. */
export const PREGUNTAS: string[] = [
  "¿Qué significa la probabilidad condicional P(A|B) y cómo se interpreta geométricamente en términos del espacio muestral?",
  "¿Qué significa que dos eventos sean independientes y cómo se simplifica el calculo de la probabilidad conjunta en ese caso?",
  "¿Qué hace el teorema de Bayes y por qué es importante para el razonamiento bajo incertidumbre?",
  "¿Por qué el Valor Predictivo Positivo (VPP) de una prueba diagnóstica depende de la prevalencia de la enfermedad y no solo de la sensibilidad y especificidad?",
];

export const INSTRUCCIONES: string[] = [
  "En «El espacio se reduce», elige una condición. Quienes no la cumplen se hunden: la probabilidad se cuenta solo entre los que quedan de pie.",
  "Compara P(fuma | hombre) con P(hombre | fuma). No son lo mismo: cambia el espacio muestral.",
  "Ajusta cuántas mujeres fuman hasta que P(fuma | hombre) sea igual a P(fuma | mujer). En ese punto los eventos son independientes.",
  "En «Árbol y regla del producto», sigue las partículas: cada una elige su camino con las probabilidades de las ramas. Multiplica a lo largo de un camino y suma los caminos que terminan igual.",
  "Activa «Invertir con Bayes» para saber el resultado de la 2.ª etapa y preguntar por la 1.ª.",
  "En «Prueba diagnóstica», carga los datos del ejercicio A2, aplica la prueba y quédate solo con los positivos. Compara los dos bloques.",
  "Baja la prevalencia sin tocar la prueba y observa cómo crecen los falsos positivos frente a los verdaderos.",
  "Aplica una segunda prueba a los positivos, estima un VPP en la tarjeta de estrellas y cierra con el reto evaluable del ejercicio A2.",
];

export const IDEAS: string[] = [
  "Condicionar es cambiar de espacio muestral: se cuenta dentro del grupo que cumple la condición, no entre todos.",
  "P(A|B) y P(B|A) comparten el numerador P(A∩B), pero dividen entre cosas distintas. Confundirlas es el error más común.",
  "Si P(A|B) = P(A|Bᶜ), saber B no aporta nada sobre A: los eventos son independientes y P(A∩B) = P(A)·P(B).",
  "En un árbol, se multiplica a lo largo de un camino (regla del producto) y se suman los caminos que llevan al mismo resultado (probabilidad total).",
  "El VPP no es una propiedad de la prueba sola: con la misma sensibilidad y especificidad, baja cuando la enfermedad es rara.",
  "El resultado de una prueba se vuelve la prevalencia de la siguiente: por eso una prueba confirmatoria sube tanto la certeza.",
];

/** Hechos del quiz verdadero/falso A4 — verbatim (el enunciado falso va con su corrección). */
export const HECHOS: string[] = [
  "La regla de la suma para eventos mutuamente excluyentes es P(A∪B) = P(A) + P(B), sin restar la intersección.",
  "Si P(A) = 0.4 y P(B) = 0.3 y los eventos son independientes, entonces P(A∩B) = P(A) × P(B) = 0.12.",
  "P(A|B) es la probabilidad de que ocurra A dado que ya ocurrió B: P(A|B) = P(A∩B)/P(B). La notación indica primero el evento condicionado, luego el conocido.",
  "Si en una bolsa hay 4 bolas rojas y 6 azules, la probabilidad de sacar 2 bolas rojas consecutivamente sin reposición es P = (4/10) × (3/9) = 12/90 = 2/15.",
  "Si P(A) = 0.5, P(B) = 0.4 y P(A∩B) = 0.2, entonces P(A∪B) = P(A) + P(B) − P(A∩B) = 0.5 + 0.4 − 0.2 = 0.7.",
];

export interface DatoClave {
  valor: string;
  texto: string;
  icono: string;
}

export const DATOS: DatoClave[] = [
  { valor: "10/40 = 0.25", texto: "P(fuma | hombre): el espacio se reduce de 100 personas a 40 hombres.", icono: "fa-people-group" },
  { valor: "25/60 ≈ 0.417", texto: "P(deporte | estudian) en el ejemplo de 100 estudiantes del glosario.", icono: "fa-person-running" },
  { valor: "12/90 = 2/15", texto: "Dos rojas seguidas sin reposición de una bolsa con 4 rojas y 6 azules.", icono: "fa-code-branch" },
  { valor: "0.090 / 0.135", texto: "El VPP del ejercicio A2: 66.67 % de los positivos tiene diabetes.", icono: "fa-vial-virus" },
];

export const CONTEXTO =
  "El IMSS y el ISSSTE realizan campañas de detección temprana de cáncer de cérvix (VPH/Papanicolaou), diabetes e hipertensión. Un resultado positivo en una prueba de tamizaje no es una sentencia: es una probabilidad que depende de la prevalencia en la población estudiada, y por eso los protocolos exigen confirmarlo con una segunda prueba antes de dar un diagnóstico definitivo.";

export const FUENTE = "Material CEN Bachillerato — PM-VI. Ref.: Bayes, 1763; aplicaciones diagnosticas IMSS-ISSSTE.";

/** Glosario A5 — los 6 términos verbatim. */
export interface GlosarioItem {
  termino: string;
  definicion: string;
  ejemplo: string;
}

export const GLOSARIO: GlosarioItem[] = [
  {
    termino: "Regla de la suma (general)",
    definicion: "Para dos eventos cualesquiera A y B: P(A∪B) = P(A) + P(B) − P(A∩B). Si son mutuamente excluyentes (P(A∩B)=0): P(A∪B) = P(A) + P(B).",
    ejemplo: "Sacar un as o un corazón de una baraja de 52: P(as)=4/52, P(corazón)=13/52, P(as de corazón)=1/52. P(as∪corazón) = 4/52+13/52-1/52 = 16/52 = 4/13.",
  },
  {
    termino: "Regla del producto (eventos independientes)",
    definicion: "Dos eventos A y B son independientes si la ocurrencia de uno no afecta al otro: P(A∩B) = P(A) × P(B). Si no son independientes: P(A∩B) = P(A) × P(B|A).",
    ejemplo: "Lanzar una moneda y un dado: P(cara∩6) = P(cara)×P(6) = 0.5×(1/6) = 1/12, porque son independientes.",
  },
  {
    termino: "Probabilidad condicional P(A|B)",
    definicion: "La probabilidad de que ocurra A dado que B ya ocurrió: P(A|B) = P(A∩B)/P(B), siempre que P(B)>0. Actualiza la probabilidad de A con la información de que B es cierto.",
    ejemplo: "En 100 estudiantes: 60 estudian, 40 practican deporte, 25 hacen ambas. P(deporte|estudian) = P(deporte∩estudian)/P(estudian) = 25/100 ÷ 60/100 = 25/60 ≈ 0.417.",
  },
  {
    termino: "Eventos independientes vs. dependientes",
    definicion: "A y B son independientes si P(A|B) = P(A) (o equivalentemente P(B|A) = P(B), o P(A∩B) = P(A)·P(B)). Son dependientes si la ocurrencia de uno modifica la probabilidad del otro.",
    ejemplo: "Con reposición: extraer bola roja dos veces de una urna son eventos independientes. Sin reposición: son dependientes porque el segundo sorteo depende del resultado del primero.",
  },
  {
    termino: "Diagrama de árbol",
    definicion: "Representación visual de un experimento en etapas sucesivas. Cada rama muestra un resultado posible con su probabilidad. La probabilidad de una trayectoria es el producto de las probabilidades a lo largo de la rama.",
    ejemplo: "Lanzar una moneda dos veces: árbol con ramas CC(0.25), CS(0.25), SC(0.25), SS(0.25). Las 4 trayectorias suman 1.",
  },
  {
    termino: "Eventos mutuamente excluyentes",
    definicion: "Dos eventos son mutuamente excluyentes (o disjuntos) si no pueden ocurrir simultáneamente: A∩B = ∅ → P(A∩B) = 0. No confundir con independencia: los eventos mutuamente excluyentes NO son independientes (si uno ocurre, el otro tiene probabilidad 0).",
    ejemplo: "Sacar 3 y sacar 5 en un dado son mutuamente excluyentes. Sacar número par y número mayor que 3 NO son mutuamente excluyentes (el 4 y 6 pertenecen a ambos).",
  },
];

/* ── Reto evaluable: el ejercicio A2, verbatim ────────────────────────── */

export const RETO_A2: RetoNumericoData = {
  titulo: "Calcular probabilidades condicionales en pruebas diagnósticas médicas",
  contexto:
    "El ejercicio aplica el teorema de Bayes a una prueba de detección: combina la prevalencia con la sensibilidad y la especificidad para obtener el Valor Predictivo Positivo.",
  problema:
    "Una prueba de deteccion de diabetes tiene sensibilidad del 90% (P(positivo|diabetes) = 0.90) y especificidad del 95% (P(negativo|sin diabetes) = 0.95). En una poblacion donde la prevalencia de diabetes es del 10% (P(diabetes) = 0.10). Usando el teorema de Bayes, calcula el Valor Predictivo Positivo (VPP): la probabilidad de tener diabetes dado que la prueba salio positiva, expresada en porcentaje.",
  campos: [
    { etiqueta: "P(positivo y diabetes)", objetivo: 0.09, tolerancia: 0.002, unidad: "en decimal", placeholder: "0.090" },
    { etiqueta: "P(positivo total)", objetivo: 0.135, tolerancia: 0.002, unidad: "en decimal", placeholder: "0.135" },
    { etiqueta: "Valor Predictivo Positivo", objetivo: 66.67, tolerancia: 0.5, unidad: "%", placeholder: "66.67" },
  ],
  pasosGuia: [
    "Calcula P(positivo y diabetes): P(diabetes) x P(positivo|diabetes) = 0.10 x 0.90 = 0.090.",
    "Calcula P(positivo y sin diabetes): P(sin diabetes) x P(positivo|sin diabetes) = 0.90 x 0.05 = 0.045.",
    "Calcula P(positivo total) por la regla de la probabilidad total: 0.090 + 0.045 = 0.135.",
    "Aplica el teorema de Bayes: VPP = P(diabetes|positivo) = P(positivo y diabetes) / P(positivo total) = 0.090 / 0.135 = 0.6667.",
    "Convierte a porcentaje: 0.6667 x 100 = 66.67%.",
  ],
  respuestaFinal: "VPP = 0.090 / 0.135 = 0.6667 = 66.67%.",
};

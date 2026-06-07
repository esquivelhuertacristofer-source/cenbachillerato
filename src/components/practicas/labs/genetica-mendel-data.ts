/**
 * Datos para el laboratorio "Genética mendeliana: cuadro de Punnett"
 * (CNEYT-VI-P05-A2, ejercicio matemático "Cruce monohíbrido Aa×Aa"; UAC CNEYT-VI;
 * progresión 5 "Analiza los patrones de herencia genética: leyes de Mendel y
 * herencia no mendeliana").
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabGeneticaMendel.tsx) y la escena 3D (GeneticaMendelScene.tsx).
 *
 * Tres modos:
 *  (a) "monohibrido" — cruce de un gen (Aa × Aa). Cuadro de Punnett 2×2,
 *      proporción genotípica 1 AA : 2 Aa : 1 aa y fenotípica 3 : 1; P(aa) = 25 %.
 *      Es la parte del ejercicio A2. Incluye herencia no mendeliana: dominancia
 *      incompleta (boca de dragón rojo/rosa/blanco) y codominancia.
 *  (b) "dihibrido" — dos genes (AaBb × AaBb). Cuadro de Punnett 4×4 (16 casillas)
 *      con proporción fenotípica 9 : 3 : 3 : 1 (color y forma de la semilla),
 *      la segunda ley de Mendel (surtido independiente).
 *  (c) "ligado" — herencia ligada al sexo (daltonismo). Cruce X^D X^d × X^D Y.
 *      Cuadro de Punnett 2×2 que separa hijas e hijos y calcula la probabilidad
 *      de daltonismo y de ser portadora. Es la actividad final del glosario A5.
 *
 * Toda la genética es de conteo cerrado (probabilidad de cada casilla del cuadro
 * de Punnett). Las leyes, los valores, las proporciones y los ejemplos son
 * verbatim de la lectura A1, el ejercicio A2 y el glosario A5.
 */

export type Modo = "monohibrido" | "dihibrido" | "ligado";
export type Herencia = "completa" | "incompleta" | "codominancia";

/* ── Genotipos monogénicos ────────────────────────────────────────────────── */
export type Geno1 = "AA" | "Aa" | "aa";
export const GENOS1: Geno1[] = ["AA", "Aa", "aa"];

const esDom = (c: string) => c === c.toUpperCase();
/** ¿el genotipo es homocigoto recesivo? (ambos alelos en minúscula: "aa", "bb") */
const esRecesivo = (g: string) => g === g.toLowerCase();

/**
 * Gametos de un genotipo de un gen (siempre dos, para una grilla 2×2).
 * Genérico en la letra del gen: "Aa"→["A","a"], "BB"→["B","B"], "bb"→["b","b"].
 */
export function gametos1(g: string): [string, string] {
  return [g.charAt(0), g.charAt(1)];
}

/** Combina dos alelos en un genotipo normalizado (dominante primero). */
export function normaliza1(x: string, y: string): Geno1 {
  const a = esDom(x) ? x : y;
  const b = esDom(x) ? y : x;
  return (a + b) as Geno1;
}

/* ── Fenotipos por tipo de herencia (color de flor de guisante / boca de dragón) */
export interface FenoDef { etq: string; color: string; color2?: string }
export interface HerenciaDef {
  titulo: string;
  ejemplo: string;
  /** fenotipo de cada clase genotípica */
  AA: FenoDef;
  Aa: FenoDef;
  aa: FenoDef;
  /** ¿el heterocigoto comparte fenotipo con AA? (dominancia completa) */
  AaIgualAA: boolean;
}
export const HERENCIAS: Record<Herencia, HerenciaDef> = {
  completa: {
    titulo: "Dominancia completa",
    ejemplo: "Guisante de Mendel: A = flor morada (dominante), a = flor blanca (recesiva). Aa es morada porque A domina.",
    AA: { etq: "morada (dominante)", color: "#a855f7" },
    Aa: { etq: "morada (dominante)", color: "#a855f7" },
    aa: { etq: "blanca (recesiva)", color: "#f1f5f9" },
    AaIgualAA: true,
  },
  incompleta: {
    titulo: "Dominancia incompleta",
    ejemplo: "Boca de dragón: roja (R¹R¹) × blanca (R²R²) → rosa (R¹R²). El heterocigoto tiene un fenotipo intermedio.",
    AA: { etq: "roja", color: "#ef4444" },
    Aa: { etq: "rosa (intermedia)", color: "#f9a8d4" },
    aa: { etq: "blanca", color: "#f1f5f9" },
    AaIgualAA: false,
  },
  codominancia: {
    titulo: "Codominancia",
    ejemplo: "Grupo sanguíneo: I^A I^B expresa los antígenos A y B a la vez. El heterocigoto muestra ambos alelos sin mezcla.",
    AA: { etq: "tipo A", color: "#ef4444" },
    Aa: { etq: "tipo AB (ambos)", color: "#ef4444", color2: "#f1f5f9" },
    aa: { etq: "tipo B", color: "#f1f5f9" },
    AaIgualAA: false,
  },
};

/* ── Resultado: monohíbrido ───────────────────────────────────────────────── */
export interface CeldaMono { fila: string; col: string; geno: Geno1 }
export interface FenoConteo { etq: string; color: string; color2?: string; n: number; pct: number; genos: Geno1[] }
export interface ResMono {
  p1: Geno1; p2: Geno1;
  gam1: [string, string]; gam2: [string, string];
  celdas: CeldaMono[];                 // 4 casillas
  conteo: { AA: number; Aa: number; aa: number };
  propGeno: string;                    // p.ej. "1 : 2 : 1"
  fenotipos: FenoConteo[];             // 2 (completa) o 3 (incompleta/codominancia)
  pAA: number; pAa: number; paa: number; // %
}

function razon(ns: number[]): string {
  const pos = ns.filter((n) => n > 0);
  if (pos.length === 0) return "0";
  const g = pos.reduce((a, b) => gcd(a, b));
  return ns.map((n) => Math.round(n / g)).join(" : ");
}
function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b); }

export function resolverMono(p1: Geno1, p2: Geno1, herencia: Herencia): ResMono {
  const gam1 = gametos1(p1);
  const gam2 = gametos1(p2);
  const celdas: CeldaMono[] = [];
  for (const a of gam1) for (const b of gam2) celdas.push({ fila: a, col: b, geno: normaliza1(a, b) });

  const conteo = { AA: 0, Aa: 0, aa: 0 };
  for (const c of celdas) conteo[c.geno] += 1;
  const total = celdas.length;

  const H = HERENCIAS[herencia];
  let fenotipos: FenoConteo[];
  if (H.AaIgualAA) {
    // dominancia completa: {AA, Aa} dominante vs {aa} recesivo
    const nDom = conteo.AA + conteo.Aa;
    fenotipos = [
      { etq: H.AA.etq, color: H.AA.color, color2: H.AA.color2, n: nDom, pct: (nDom / total) * 100, genos: ["AA", "Aa"] as Geno1[] },
      { etq: H.aa.etq, color: H.aa.color, color2: H.aa.color2, n: conteo.aa, pct: (conteo.aa / total) * 100, genos: ["aa"] as Geno1[] },
    ].filter((f) => f.n > 0);
  } else {
    // tres fenotipos distintos
    fenotipos = ([
      { key: "AA" as const, def: H.AA, n: conteo.AA, genos: ["AA"] as Geno1[] },
      { key: "Aa" as const, def: H.Aa, n: conteo.Aa, genos: ["Aa"] as Geno1[] },
      { key: "aa" as const, def: H.aa, n: conteo.aa, genos: ["aa"] as Geno1[] },
    ] as const)
      .filter((x) => x.n > 0)
      .map((x) => ({ etq: x.def.etq, color: x.def.color, color2: x.def.color2, n: x.n, pct: (x.n / total) * 100, genos: x.genos }));
  }

  return {
    p1, p2, gam1, gam2, celdas, conteo,
    propGeno: razon([conteo.AA, conteo.Aa, conteo.aa]),
    fenotipos,
    pAA: (conteo.AA / total) * 100,
    pAa: (conteo.Aa / total) * 100,
    paa: (conteo.aa / total) * 100,
  };
}

/* ── Resultado: dihíbrido ─────────────────────────────────────────────────── */
export type GenoDi = string; // "AaBb", "aabb", …

/** Gametos de un genotipo de dos genes (4 combinaciones). */
export function gametos2(g: GenoDi): string[] {
  const A = gametos1(g.slice(0, 2) as Geno1);
  const B = gametos1(g.slice(2, 4) as Geno1);
  const out: string[] = [];
  for (const a of A) for (const b of B) out.push(a + b);
  return out;
}
function normalizaDi(g1: string, g2: string): { genoA: Geno1; genoB: Geno1 } {
  // g1, g2 son gametos de 2 letras (gen A, gen B)
  const genoA = normaliza1(g1[0]!, g2[0]!);
  const genoB = normaliza1(g1[1]!, g2[1]!);
  return { genoA, genoB };
}
type FenoDiKey = "AB" | "Ab" | "aB" | "ab";
function fenoDi(genoA: Geno1, genoB: Geno1): FenoDiKey {
  const domA = !esRecesivo(genoA);
  const domB = !esRecesivo(genoB);
  if (domA && domB) return "AB";
  if (domA && !domB) return "Ab";
  if (!domA && domB) return "aB";
  return "ab";
}
export interface FenoDiDef { key: FenoDiKey; etq: string; color: string; rugosa: boolean }
export const FENO_DI: Record<FenoDiKey, FenoDiDef> = {
  AB: { key: "AB", etq: "amarilla y lisa", color: "#fcd34d", rugosa: false },
  Ab: { key: "Ab", etq: "amarilla y rugosa", color: "#fcd34d", rugosa: true },
  aB: { key: "aB", etq: "verde y lisa", color: "#4ade80", rugosa: false },
  ab: { key: "ab", etq: "verde y rugosa", color: "#4ade80", rugosa: true },
};
export interface CeldaDi { fila: string; col: string; genoA: Geno1; genoB: Geno1; feno: FenoDiKey }
export interface ResDi {
  p1: GenoDi; p2: GenoDi;
  gam1: string[]; gam2: string[]; // 4 cada uno
  celdas: CeldaDi[];              // 16 casillas
  conteo: Record<FenoDiKey, number>;
  fenotipos: { etq: string; color: string; rugosa: boolean; n: number; pct: number }[];
  prop: string;                  // p.ej. "9 : 3 : 3 : 1"
}
export function resolverDi(p1: GenoDi, p2: GenoDi): ResDi {
  const gam1 = gametos2(p1);
  const gam2 = gametos2(p2);
  const celdas: CeldaDi[] = [];
  for (const a of gam1) for (const b of gam2) {
    const { genoA, genoB } = normalizaDi(a, b);
    celdas.push({ fila: a, col: b, genoA, genoB, feno: fenoDi(genoA, genoB) });
  }
  const conteo: Record<FenoDiKey, number> = { AB: 0, Ab: 0, aB: 0, ab: 0 };
  for (const c of celdas) conteo[c.feno] += 1;
  const total = celdas.length;
  const orden: FenoDiKey[] = ["AB", "Ab", "aB", "ab"];
  const fenotipos = orden
    .filter((k) => conteo[k] > 0)
    .map((k) => ({ etq: FENO_DI[k].etq, color: FENO_DI[k].color, rugosa: FENO_DI[k].rugosa, n: conteo[k], pct: (conteo[k] / total) * 100 }));
  return { p1, p2, gam1, gam2, celdas, conteo, fenotipos, prop: razon(orden.map((k) => conteo[k])) };
}

/* ── Resultado: ligado al sexo (daltonismo) ───────────────────────────────── */
export type GenoMadre = "XDXD" | "XDXd" | "XdXd";
export type GenoPadre = "XDY" | "XdY";

/** Gametos de la madre: las dos X, cada una con su alelo (D o d). */
export function gametosMadre(g: GenoMadre): [string, string] {
  if (g === "XDXD") return ["D", "D"];
  if (g === "XdXd") return ["d", "d"];
  return ["D", "d"];
}
/** Gametos del padre: la X (con su alelo) y el cromosoma Y. */
export function gametosPadre(g: GenoPadre): [string, string] {
  return [g === "XDY" ? "D" : "d", "Y"];
}

export type FenoLig = "hijaNormal" | "hijaPortadora" | "hijaDaltonica" | "hijoNormal" | "hijoDaltonico";
export const FENO_LIG: Record<FenoLig, { etq: string; color: string; sexo: "hija" | "hijo"; daltonico: boolean }> = {
  hijaNormal:     { etq: "hija sana (X^D X^D)",        color: "#f9a8d4", sexo: "hija", daltonico: false },
  hijaPortadora:  { etq: "hija portadora (X^D X^d)",   color: "#c084fc", sexo: "hija", daltonico: false },
  hijaDaltonica:  { etq: "hija daltónica (X^d X^d)",   color: "#ef4444", sexo: "hija", daltonico: true },
  hijoNormal:     { etq: "hijo sano (X^D Y)",          color: "#60a5fa", sexo: "hijo", daltonico: false },
  hijoDaltonico:  { etq: "hijo daltónico (X^d Y)",     color: "#ef4444", sexo: "hijo", daltonico: true },
};

export interface CeldaLig { fila: string; col: string; etqGeno: string; feno: FenoLig }
export interface ResLig {
  madre: GenoMadre; padre: GenoPadre;
  gamMadre: [string, string]; gamPadre: [string, string];
  celdas: CeldaLig[]; // 4
  conteo: Record<FenoLig, number>;
  fenotipos: { etq: string; color: string; n: number; pct: number }[];
  // probabilidades (sobre el total de 4 descendientes)
  pHijoDaltonico: number;   // % del total
  pHijaDaltonica: number;   // % del total
  pHijaPortadora: number;   // % del total
  // condicionales por sexo
  pDaltonicoEntreVarones: number; // % de los hijos varones
  pDaltonicaEntreMujeres: number; // % de las hijas
}
export function resolverLig(madre: GenoMadre, padre: GenoPadre): ResLig {
  const gamMadre = gametosMadre(madre);
  const gamPadre = gametosPadre(padre);
  const celdas: CeldaLig[] = [];
  for (const m of gamMadre) for (const p of gamPadre) {
    if (p === "Y") {
      const dalt = m === "d";
      celdas.push({ fila: m, col: p, etqGeno: `X^${m} Y`, feno: dalt ? "hijoDaltonico" : "hijoNormal" });
    } else {
      const geno = normaliza1(m, p); // sobre alelos D/d
      const feno: FenoLig = geno === "AA"
        ? "hijaNormal"          // ambos D (representados como mayúscula)
        : geno === "Aa"
          ? "hijaPortadora"     // un D y un d
          : "hijaDaltonica";    // ambos d
      const etqGeno = `X^${m} X^${p}`;
      celdas.push({ fila: m, col: p, etqGeno, feno });
    }
  }
  const conteo = { hijaNormal: 0, hijaPortadora: 0, hijaDaltonica: 0, hijoNormal: 0, hijoDaltonico: 0 } as Record<FenoLig, number>;
  for (const c of celdas) conteo[c.feno] += 1;
  const total = celdas.length; // 4
  const nVarones = conteo.hijoNormal + conteo.hijoDaltonico;
  const nMujeres = conteo.hijaNormal + conteo.hijaPortadora + conteo.hijaDaltonica;

  const orden: FenoLig[] = ["hijaNormal", "hijaPortadora", "hijaDaltonica", "hijoNormal", "hijoDaltonico"];
  const fenotipos = orden
    .filter((k) => conteo[k] > 0)
    .map((k) => ({ etq: FENO_LIG[k].etq, color: FENO_LIG[k].color, n: conteo[k], pct: (conteo[k] / total) * 100 }));

  return {
    madre, padre, gamMadre, gamPadre, celdas, conteo, fenotipos,
    pHijoDaltonico: (conteo.hijoDaltonico / total) * 100,
    pHijaDaltonica: (conteo.hijaDaltonica / total) * 100,
    pHijaPortadora: (conteo.hijaPortadora / total) * 100,
    pDaltonicoEntreVarones: nVarones > 0 ? (conteo.hijoDaltonico / nVarones) * 100 : 0,
    pDaltonicaEntreMujeres: nMujeres > 0 ? (conteo.hijaDaltonica / nMujeres) * 100 : 0,
  };
}

/* ── Escenarios preestablecidos ───────────────────────────────────────────── */
export interface CasoMono { id: string; etq: string; p1: Geno1; p2: Geno1; herencia: Herencia; nota: string }
export const CASOS_MONO: CasoMono[] = [
  { id: "a2",        etq: "Aa × Aa (ejercicio A2)",      p1: "Aa", p2: "Aa", herencia: "completa",   nota: "El ejercicio A2: dos heterocigotos. Proporción 1:2:1 genotípica, 3:1 fenotípica; P(aa) = 25 %." },
  { id: "retro",     etq: "Aa × aa (retrocruza)",        p1: "Aa", p2: "aa", herencia: "completa",   nota: "Cruza de prueba con el homocigoto recesivo: descendencia 1 Aa : 1 aa (50 % dominante : 50 % recesivo)." },
  { id: "f1",        etq: "AA × aa (genera F1)",         p1: "AA", p2: "aa", herencia: "completa",   nota: "Padres homocigotos puros: toda la F1 es heterocigota (Aa) y muestra el fenotipo dominante." },
  { id: "bdrojaxbl", etq: "Boca de dragón roja × blanca", p1: "AA", p2: "aa", herencia: "incompleta", nota: "Dominancia incompleta: roja × blanca → toda la F1 rosa (fenotipo intermedio)." },
  { id: "bdrosaxrosa", etq: "Boca de dragón rosa × rosa", p1: "Aa", p2: "Aa", herencia: "incompleta", nota: "Rosa × rosa → 1 roja : 2 rosas : 1 blanca. Aquí la proporción fenotípica SÍ es 1:2:1 (no 3:1)." },
];

export interface CasoDi { id: string; etq: string; p1: GenoDi; p2: GenoDi; nota: string }
export const CASOS_DI: CasoDi[] = [
  { id: "clasico", etq: "AaBb × AaBb (9:3:3:1)", p1: "AaBb", p2: "AaBb", nota: "El dihíbrido clásico de Mendel (color y forma de semilla): 9 amarilla-lisa : 3 amarilla-rugosa : 3 verde-lisa : 1 verde-rugosa." },
  { id: "prueba",  etq: "AaBb × aabb (prueba)",   p1: "AaBb", p2: "aabb", nota: "Cruza de prueba dihíbrida: revela los gametos del heterocigoto → 1 : 1 : 1 : 1 en los cuatro fenotipos." },
];

export interface CasoLig { id: string; etq: string; madre: GenoMadre; padre: GenoPadre; nota: string }
export const CASOS_LIG: CasoLig[] = [
  { id: "a5",       etq: "Madre portadora × padre sano",    madre: "XDXd", padre: "XDY", nota: "La actividad del glosario A5: ningún hijo varón es daltónico al 100 %; la mitad de los varones lo son, y la mitad de las hijas son portadoras." },
  { id: "padredalt", etq: "Madre sana × padre daltónico",   madre: "XDXD", padre: "XdY", nota: "El padre daltónico pasa su X^d a TODAS las hijas (portadoras), pero a ningún hijo varón (a ellos les da la Y)." },
  { id: "ambos",    etq: "Madre portadora × padre daltónico", madre: "XDXd", padre: "XdY", nota: "Aquí sí pueden nacer hijas daltónicas (X^d X^d): un cuarto de la descendencia." },
];

/* ── Texto: descripción del laboratorio ───────────────────────────────────── */
export const PROBLEMA =
  "Mesa de cruzamientos genéticos: usa el cuadro de Punnett para predecir la descendencia. En el modo monohíbrido cruzas un gen (como el color de la flor del guisante de Mendel) y obtienes las proporciones 1:2:1 genotípica y 3:1 fenotípica; cambia a herencia no mendeliana (dominancia incompleta de la boca de dragón o codominancia). En el dihíbrido cruzas dos genes a la vez (color y forma de la semilla) y aparece la proporción 9:3:3:1 de la segunda ley de Mendel. En el modo ligado al sexo cruzas el daltonismo y calculas por qué afecta más a los hombres. Es el ejercicio A2 hecho manipulable en 3D.";

/* ── Instrucciones (basadas en el ejercicio A2 y el glosario A5) ──────────── */
export const INSTRUCCIONES: string[] = [
  "Modo Monohíbrido: elige el genotipo de cada progenitor (AA, Aa o aa) y observa cómo se llena el cuadro de Punnett 2×2.",
  "Usa el preajuste 'Aa × Aa (ejercicio A2)' y verifica que P(aa) = 25 %, con proporción genotípica 1:2:1 y fenotípica 3:1.",
  "Cambia el tipo de herencia a dominancia incompleta (boca de dragón) y mira cómo el heterocigoto se vuelve un fenotipo intermedio (rosa).",
  "Modo Dihíbrido: cruza AaBb × AaBb y cuenta las 16 casillas: la proporción fenotípica es 9 : 3 : 3 : 1.",
  "Modo Ligado al sexo: cruza una madre portadora con un padre sano y separa hijas e hijos para ver quién hereda el daltonismo.",
  "Compara: ¿por qué un hijo varón con un solo alelo X^d ya es daltónico, pero una hija necesita dos?",
];

/* ── Preguntas de reflexión (basadas en la lectura A1 y la reflexión A3) ──── */
export const PREGUNTAS: string[] = [
  "¿Qué proporción fenotípica produce un cruce Aa × Aa y por qué solo aa muestra el rasgo recesivo?",
  "¿En qué se diferencia la dominancia incompleta (rosa) de la codominancia (ambos a la vez)?",
  "¿Por qué el daltonismo afecta más a hombres que a mujeres, si ambos pueden portar el alelo X^d?",
];

/* ── Ideas clave (fieles a la lectura A1 y el glosario A5) ────────────────── */
export const IDEAS: string[] = [
  "Un gen ocupa una posición (locus) en el cromosoma; los alelos son sus formas alternativas. Un individuo diploide tiene dos alelos por locus: homocigoto (AA o aa) o heterocigoto (Aa).",
  "Primera ley de Mendel (segregación): los dos alelos de un gen se separan durante la meiosis y cada gameto recibe solo uno. Por eso un Aa produce 50 % A y 50 % a.",
  "En un cruce Aa × Aa el cuadro de Punnett da 1 AA : 2 Aa : 1 aa (genotípica) y 3 dominante : 1 recesivo (fenotípica). La probabilidad de aa es del 25 %.",
  "Segunda ley de Mendel (surtido independiente): genes en cromosomas distintos se heredan de forma independiente; en un dihíbrido AaBb × AaBb la F2 es 9 : 3 : 3 : 1.",
  "Dominancia incompleta: el heterocigoto presenta un fenotipo intermedio (boca de dragón roja × blanca → rosa). La proporción fenotípica del Aa×Aa es entonces 1:2:1, no 3:1.",
  "Codominancia: ambos alelos se expresan a la vez sin mezcla. El grupo sanguíneo AB (I^A I^B) muestra los antígenos A y B simultáneamente.",
  "Los grupos sanguíneos ABO están controlados por tres alelos (I^A, I^B, i): I^A e I^B son codominantes entre sí y dominantes sobre i.",
  "Herencia ligada al sexo: genes en el cromosoma X. Los hombres (XY) expresan cualquier alelo recesivo del X porque solo tienen una copia; las mujeres (XX) necesitan dos.",
  "El daltonismo (alelo recesivo X^d) afecta más a hombres: con un solo X^d ya son daltónicos. Una mujer con un X^d es portadora sana; necesita X^d X^d para serlo.",
  "Los caracteres poligénicos (estatura, color de piel) dependen de muchos genes y muestran variación continua, con forma de campana de Gauss en la población.",
];

/* ── Glosario (fiel al glosario A5) ───────────────────────────────────────── */
export const GLOSARIO: { termino: string; definicion: string }[] = [
  { termino: "Alelo y locus", definicion: "El locus es la posición de un gen en el cromosoma; los alelos son sus formas alternativas. Un diploide tiene dos alelos por locus (AA, Aa o aa)." },
  { termino: "Homocigoto / heterocigoto", definicion: "Homocigoto: dos alelos iguales (AA o aa). Heterocigoto: dos alelos distintos (Aa)." },
  { termino: "Genotipo / fenotipo", definicion: "Genotipo: los alelos que porta (Aa). Fenotipo: el rasgo que se observa (flor morada). En dominancia completa, AA y Aa comparten fenotipo." },
  { termino: "Primera ley (segregación)", definicion: "Los dos alelos de un gen se separan en la meiosis; cada gameto lleva uno. Explica la proporción 3:1 en la F2 de un monohíbrido." },
  { termino: "Segunda ley (surtido independiente)", definicion: "Genes en cromosomas distintos se distribuyen independientemente en los gametos. Produce proporciones 9:3:3:1 en dihíbridos." },
  { termino: "Dominancia incompleta", definicion: "El heterocigoto presenta fenotipo intermedio (rojo × blanco → rosa)." },
  { termino: "Codominancia", definicion: "Ambos alelos se expresan a la vez sin mezcla (grupo sanguíneo AB)." },
  { termino: "Herencia ligada al sexo", definicion: "Genes del cromosoma X. Los hombres (XY) expresan cualquier alelo recesivo ligado al X; las mujeres (XX) necesitan dos copias. Ej.: daltonismo, hemofilia." },
];

/* ── Contexto y fuente (verbatim/fiel a la lectura A1) ────────────────────── */
export const CONTEXTO =
  "Gregor Mendel (1865) enunció las leyes de la herencia a partir de experimentos con guisantes. El cuadro de Punnett es la herramienta para predecir la descendencia: organiza los gametos de cada progenitor en una cuadrícula y muestra cada combinación posible con su probabilidad.";

export const FUENTE =
  "Material elaborado para CEN Bachillerato — CNEYT-VI. Ref: Campbell, Biología (12a ed.); Lewin, Genes XII.";

/* ── Ejemplos resueltos (verbatim del ejercicio A2 y del glosario A5) ─────── */
export const EJEMPLO_A2 = {
  enunciado: "Cruza dos plantas heterocigotas para el color de semilla (Aa × Aa). ¿Cuál es la probabilidad de obtener descendencia homocigota recesiva (aa)? Expresa la respuesta como porcentaje.",
  pasos: [
    "Gametos: cada progenitor Aa produce A y a en igual proporción (50 % c/u).",
    "Cuadro de Punnett: AA (25 %), Aa (25 %), Aa (25 %), aa (25 %).",
    "Homocigotos recesivos: solo la combinación aa → 1 de 4 = 25 %.",
    "Proporción genotípica 1 AA : 2 Aa : 1 aa; fenotípica 3 dominante : 1 recesivo.",
  ],
  resultado: "P(aa) = 25 % · genotípica 1 : 2 : 1 · fenotípica 3 : 1",
};

export const EJEMPLO_LIG = {
  enunciado: "Una mujer portadora del daltonismo (X^D X^d) tiene hijos con un hombre de visión normal (X^D Y). ¿Probabilidad de que un hijo varón sea daltónico? ¿Y una hija?",
  pasos: [
    "Gametos madre: X^D y X^d (50 % c/u). Gametos padre: X^D y Y (50 % c/u).",
    "Punnett: X^D X^D (hija sana), X^D X^d (hija portadora), X^D Y (hijo sano), X^d Y (hijo daltónico).",
    "Hijos varones: la mitad recibe X^d y es daltónico; la otra mitad recibe X^D y es sano.",
    "Hijas: ninguna daltónica (todas reciben el X^D del padre); la mitad son portadoras.",
  ],
  resultado: "Hijo varón daltónico: 50 % de los varones (25 % del total) · Hija daltónica: 0 % · Hija portadora: 50 % de las hijas",
};

/* ── Datos rápidos (tarjetas) ─────────────────────────────────────────────── */
export const DATOS: { valor: string; texto: string; icono: string }[] = [
  { valor: "1 : 2 : 1", texto: "proporción genotípica de un cruce Aa × Aa", icono: "fa-dna" },
  { valor: "3 : 1", texto: "proporción fenotípica (dominante : recesivo) en la F2", icono: "fa-seedling" },
  { valor: "9 : 3 : 3 : 1", texto: "proporción fenotípica de un dihíbrido AaBb × AaBb", icono: "fa-table-cells" },
  { valor: "P(aa) = 25 %", texto: "probabilidad de homocigoto recesivo en Aa × Aa", icono: "fa-percent" },
];

/* ── Formato (es-MX) ──────────────────────────────────────────────────────── */
const ES = (n: number, dec: number) =>
  n.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 }).replace("-", "−");

export const fmt0 = (n: number): string => ES(n, 0);
export const fmt1 = (n: number): string => ES(n, 1);
/** Porcentaje sin decimales si es entero, con uno si no. */
export const fmtPct = (p: number): string => `${Number.isInteger(p) ? ES(p, 0) : ES(p, 1)} %`;
/** Fracción n/total como texto (p.ej. "1/4"). */
export const fmtFrac = (n: number, total: number): string => `${n}/${total}`;

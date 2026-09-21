/**
 * Datos y modelo del laboratorio "Química orgánica en la industria: de la
 * molécula al producto" (CNEYT-IV, progresión 9; actividades CNEYT-IV-P06-A1…A9).
 *
 * Propósito: relaciona la química orgánica con la industria farmacéutica,
 * alimentaria y de materiales.
 *
 * Anclas:
 *   - A1 lectura «Química orgánica en la industria: fármacos, alimentos y
 *     materiales»: marco teórico verbatim (4 párrafos + recuadro + preguntas).
 *   - A2 quiz «Aplicaciones industriales de la química orgánica»: reto evaluable.
 *   - A6 completa el texto. A4 verdadero/falso: hechos. A5 glosario.
 *   - A3 debate «¿ganancias o bienestar?»: panel verbatim (inspiración).
 *
 * Lo que NO es verbatim es modelo: masas molares (IUPAC), estequiometría,
 * equilibrio de la esterificación (K ≈ 4, ilustrativo), ecuación de Carothers
 * para la polimerización por condensación y umbrales aproximados de grado de
 * polimerización. Las moléculas de las reacciones y del modo de productos son
 * confórmeros 3D reales de PubChem (geometría optimizada, en ångströms); las
 * cadenas de polímero se construyen en zigzag extendido con longitudes y
 * ángulos de enlace típicos.
 *
 * Datos puros (sin three ni React).
 */

import type { QuizEvaluable } from "./_reto-quiz";
import type { TextoHuecosData } from "./_mecanica-huecos";

/* ── Modos ────────────────────────────────────────────────────────────── */

export type Modo = "sintesis" | "polimeros" | "productos";
export const MODOS: Modo[] = ["sintesis", "polimeros", "productos"];

export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string }> = {
  sintesis: { etq: "Reactor de síntesis", subtitulo: "Qué enlaces se rompen y cuáles se forman", icono: "fa-flask-vial", color: "#38bdf8" },
  polimeros: { etq: "Planta de polímeros", subtitulo: "Del monómero al plástico y la fibra", icono: "fa-link", color: "#a78bfa" },
  productos: { etq: "Del grupo al producto", subtitulo: "Grupo funcional → propiedad → uso", icono: "fa-boxes-stacked", color: "#fbbf24" },
};

export function num(x: number, dec = 0): string {
  const s = Math.abs(x).toFixed(dec);
  const [ent, frac] = s.split(".");
  const conMiles = ent!.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${x < 0 ? "−" : ""}${conMiles}${frac ? `.${frac}` : ""}`;
}

export function mulberry32(semilla: number) {
  let t = semilla >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function estrellasPorErrores(errores: number): number {
  return errores === 0 ? 3 : errores <= 2 ? 2 : 1;
}

/* ── Masas atómicas (IUPAC, redondeadas) y masas molares ──────────────── */

export const MASA_ATOMICA: Record<string, number> = { C: 12.011, H: 1.008, N: 14.007, O: 15.999 };

/** Masa molar (g/mol) a partir de una fórmula simple como "C9H8O4". */
export function masaMolar(formula: string): number {
  let m = 0;
  for (const [, el, n] of formula.matchAll(/([A-Z][a-z]?)(\d*)/g)) m += (MASA_ATOMICA[el!] ?? 0) * (n ? Number(n) : 1);
  return m;
}

/** Subíndices Unicode para mostrar fórmulas. */
export function fq(formula: string): string {
  const sub = "₀₁₂₃₄₅₆₇₈₉";
  return formula.replace(/\d/g, (d) => sub[Number(d)]!);
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. REACTOR DE SÍNTESIS
 * ════════════════════════════════════════════════════════════════════════ */

export type ReaccionId = "aspirina" | "paracetamol" | "ester" | "fermentacion";
export type Industria = "farmaceutica" | "alimentaria" | "materiales";

export const INDUSTRIAS: Record<Industria, { etq: string; icono: string; color: string }> = {
  farmaceutica: { etq: "Farmacéutica", icono: "fa-prescription-bottle-medical", color: "#34d399" },
  alimentaria: { etq: "Alimentaria", icono: "fa-wheat-awn", color: "#fb923c" },
  materiales: { etq: "Materiales", icono: "fa-cubes", color: "#60a5fa" },
};

export interface Especie {
  nombre: string;
  formula: string;
}

export interface Reaccion {
  id: ReaccionId;
  etq: string;
  industria: Industria;
  producto: string;
  tipo: string;
  /** Reactivo A y (opcional) reactivo B. */
  a: Especie;
  b: Especie | null;
  /** Coeficientes: 1 A + 1 B → p·P + q·Q */
  p: Especie;
  q: Especie;
  coefP: number;
  coefQ: number;
  condiciones: string;
  rompe: string[];
  forma: string[];
  grupoFormado: string;
  dato: string;
  /** Cantidades iniciales (g) y rango de los deslizadores. */
  gA: number;
  gB: number;
  maxA: number;
  maxB: number;
  /** ¿La reacción llega a un equilibrio? (esterificación de Fischer) */
  reversible: boolean;
}

export const K_ESTER = 4;

export const REACCIONES: Reaccion[] = [
  {
    id: "aspirina",
    etq: "Aspirina",
    industria: "farmaceutica",
    producto: "ácido acetilsalicílico",
    tipo: "Acetilación (sustitución en el grupo acilo)",
    a: { nombre: "ácido salicílico", formula: "C7H6O3" },
    b: { nombre: "anhídrido acético", formula: "C4H6O3" },
    p: { nombre: "ácido acetilsalicílico (aspirina)", formula: "C9H8O4" },
    q: { nombre: "ácido acético", formula: "C2H4O2" },
    coefP: 1,
    coefQ: 1,
    condiciones: "Unas gotas de ácido (H₂SO₄ o H₃PO₄) como catalizador y calor suave, entre 80 y 90 °C.",
    rompe: ["O–H del grupo fenol (–OH del anillo) del ácido salicílico", "C–O del anhídrido: entre un acilo (CH₃C=O) y el oxígeno puente"],
    forma: ["O–C: el acetilo se une al oxígeno del fenol y forma un ÉSTER", "O–H: el oxígeno puente toma el hidrógeno y queda ácido acético"],
    grupoFormado: "éster",
    dato: "Felix Hoffmann la sintetizó en Bayer en 1897. El acetilo no es adorno: en el cuerpo, la aspirina transfiere ese mismo acetilo a la enzima COX y la bloquea; así disminuye la inflamación.",
    gA: 2,
    gB: 5.4,
    maxA: 10,
    maxB: 10,
    reversible: false,
  },
  {
    id: "paracetamol",
    etq: "Paracetamol",
    industria: "farmaceutica",
    producto: "paracetamol",
    tipo: "Acetilación de una amina",
    a: { nombre: "4-aminofenol", formula: "C6H7NO" },
    b: { nombre: "anhídrido acético", formula: "C4H6O3" },
    p: { nombre: "paracetamol (acetaminofén)", formula: "C8H9NO2" },
    q: { nombre: "ácido acético", formula: "C2H4O2" },
    coefP: 1,
    coefQ: 1,
    condiciones: "En agua caliente, sin catalizador: el –NH₂ es mejor nucleófilo que el –OH, así que el anhídrido reacciona con el nitrógeno.",
    rompe: ["N–H del grupo amino (–NH₂) del 4-aminofenol", "C–O del anhídrido: entre un acilo (CH₃C=O) y el oxígeno puente"],
    forma: ["N–C: el acetilo se une al nitrógeno y forma una AMIDA (–NHCOCH₃)", "O–H: el oxígeno puente toma el hidrógeno y queda ácido acético"],
    grupoFormado: "amida",
    dato: "Es la amida del quiz A2: el grupo –NHCOCH₃. Con el mismo anhídrido acético, el ácido salicílico da un éster (aspirina) y el 4-aminofenol da una amida (paracetamol): el grupo funcional del reactivo decide el fármaco.",
    gA: 3,
    gB: 3.2,
    maxA: 10,
    maxB: 10,
    reversible: false,
  },
  {
    id: "ester",
    etq: "Aroma de plátano",
    industria: "alimentaria",
    producto: "acetato de isoamilo",
    tipo: "Esterificación de Fischer (reversible)",
    a: { nombre: "ácido acético", formula: "C2H4O2" },
    b: { nombre: "alcohol isoamílico (3-metilbutan-1-ol)", formula: "C5H12O" },
    p: { nombre: "acetato de isoamilo", formula: "C7H14O2" },
    q: { nombre: "agua", formula: "H2O" },
    coefP: 1,
    coefQ: 1,
    condiciones: "Ácido sulfúrico como catalizador y calentamiento a reflujo. Es un equilibrio: parte del éster vuelve a separarse con el agua.",
    rompe: ["C–OH del ácido acético: el ácido pierde su –OH", "O–H del alcohol: el alcohol pierde solo su hidrógeno"],
    forma: ["C–O: el acilo se une al oxígeno del alcohol y forma un ÉSTER", "O–H: el –OH del ácido y el H del alcohol forman agua"],
    grupoFormado: "éster",
    dato: "Es el olor principal del plátano y se usa como saborizante de dulces y bebidas. Con oxígeno-18, Roberts y Urey (1938) demostraron que el oxígeno del agua sale del ácido y no del alcohol: justo los enlaces que ves romperse.",
    gA: 3,
    gB: 4.4,
    maxA: 15,
    maxB: 15,
    reversible: true,
  },
  {
    id: "fermentacion",
    etq: "Bioetanol",
    industria: "alimentaria",
    producto: "etanol",
    tipo: "Fermentación alcohólica (biotecnología)",
    a: { nombre: "glucosa", formula: "C6H12O6" },
    b: null,
    p: { nombre: "etanol", formula: "C2H6O" },
    q: { nombre: "dióxido de carbono", formula: "CO2" },
    coefP: 2,
    coefQ: 2,
    condiciones: "Levadura (Saccharomyces cerevisiae) sin oxígeno, entre 30 y 35 °C. Sus enzimas son el catalizador: 12 pasos en total (10 de la glucólisis y 2 de la fermentación).",
    rompe: ["C3–C4: la glucosa se parte en dos mitades de tres carbonos", "C2–C3 y C4–C5: los carbonos 3 y 4 salen como CO₂"],
    forma: ["C–O dobles del CO₂ y los grupos –OH del etanol", "Se conservan C1–C2 y C5–C6: son el esqueleto de las dos moléculas de etanol"],
    grupoFormado: "alcohol",
    dato: "La ecuación C₆H₁₂O₆ → 2 C₂H₅OH + 2 CO₂ es el resumen global (quiz A4). En la industria se obtiene alrededor de 90–95 % del etanol teórico: la levadura usa parte del azúcar para crecer. En México el bioetanol se obtiene de la caña de azúcar (glosario A5).",
    gA: 180,
    gB: 0,
    maxA: 1000,
    maxB: 0,
    reversible: false,
  },
];

export interface ResultadoSintesis {
  molA: number;
  molB: number;
  /** "A", "B" o "igual" (proporción estequiométrica exacta, ±1 %). */
  limitante: "A" | "B" | "igual";
  /** Avance de la reacción (mol de A que reaccionan). */
  avance: number;
  /** Fracción del reactivo limitante que se convierte (0–1). */
  conversion: number;
  gP: number;
  gQ: number;
  /** Masa sobrante del reactivo en exceso (g). */
  gExceso: number;
  /** Economía atómica: masa del producto deseado / masa total de productos. */
  economiaAtomica: number;
}

/** Avance en el equilibrio de A + B ⇌ P + Q con constante K: x²/((a−x)(b−x)) = K. */
export function avanceEquilibrio(a: number, b: number, K: number): number {
  if (a <= 0 || b <= 0) return 0;
  if (Math.abs(K - 1) < 1e-9) return (a * b) / (a + b);
  const A = K - 1;
  const B = -K * (a + b);
  const C = K * a * b;
  return (-B - Math.sqrt(B * B - 4 * A * C)) / (2 * A);
}

export function sintesis(r: Reaccion, gA: number, gB: number, retirarAgua: boolean): ResultadoSintesis {
  const mA = masaMolar(r.a.formula);
  const mP = masaMolar(r.p.formula);
  const mQ = masaMolar(r.q.formula);
  const molA = gA / mA;
  const molB = r.b ? gB / masaMolar(r.b.formula) : Infinity;
  const menor = Math.min(molA, molB);
  let limitante: ResultadoSintesis["limitante"] = !r.b || molA < molB ? "A" : "B";
  if (r.b && Math.abs(molA - molB) / Math.max(molA, molB) <= 0.01) limitante = "igual";
  const avance = r.reversible && !retirarAgua ? avanceEquilibrio(molA, molB, K_ESTER) : menor;
  const exceso = r.b ? (molA > molB ? (molA - avance) * mA : (molB - avance) * masaMolar(r.b.formula)) : 0;
  const masaReactivos = mA + (r.b ? masaMolar(r.b.formula) : 0);
  return {
    molA,
    molB: r.b ? molB : 0,
    limitante,
    avance,
    conversion: menor > 0 ? avance / menor : 0,
    gP: avance * r.coefP * mP,
    gQ: avance * r.coefQ * mQ,
    gExceso: limitante === "igual" ? 0 : exceso,
    economiaAtomica: (r.coefP * mP) / masaReactivos,
  };
}

export const DENSIDAD_ETANOL = 0.789; // g/mL a 20 °C
export const VOLUMEN_MOLAR_25C = 24.47; // L/mol de gas ideal a 25 °C y 1 atm

/* ════════════════════════════════════════════════════════════════════════
 * 2. PLANTA DE POLÍMEROS
 * ════════════════════════════════════════════════════════════════════════ */

export type PolimeroId = "pe" | "pet" | "nylon";

export interface Polimero {
  id: PolimeroId;
  etq: string;
  nombre: string;
  tipo: "adicion" | "condensacion";
  monomeros: Especie[];
  unidad: string;
  enlace: string;
  /** Unidades que se dibujan como máximo en 3D. */
  maxVisibles: number;
  usos: string;
  reciclaje: string;
  dato: string;
}

export const POLIMEROS: Polimero[] = [
  {
    id: "pe",
    etq: "Polietileno",
    nombre: "Polietileno (PE)",
    tipo: "adicion",
    monomeros: [{ nombre: "etileno", formula: "C2H4" }],
    unidad: "C2H4",
    enlace: "C–C (se abre el doble enlace C=C)",
    maxVisibles: 10,
    usos: "Bolsas, películas, envases de leche y shampoo, tubería.",
    reciclaje: "Código 2 (PEAD, alta densidad) y 4 (PEBD, baja densidad).",
    dato: "Polimerización por ADICIÓN: el doble enlace C=C de cada etileno se abre y se une a la punta activa de la cadena. No sale ningún subproducto: todos los átomos del monómero quedan en el plástico.",
  },
  {
    id: "pet",
    etq: "PET",
    nombre: "Poli(tereftalato de etileno) (PET)",
    tipo: "condensacion",
    monomeros: [
      { nombre: "ácido tereftálico", formula: "C8H6O4" },
      { nombre: "etilenglicol", formula: "C2H6O2" },
    ],
    unidad: "C10H8O4",
    enlace: "éster (–COO–)",
    maxVisibles: 4,
    usos: "Botellas de refresco y agua, fibras de poliéster para ropa.",
    reciclaje: "Código 1. En México, ECOCE promueve su acopio y reciclaje (lectura A1).",
    dato: "Polimerización por CONDENSACIÓN: cada –COOH del ácido reacciona con un –OH del glicol, forma un enlace éster y libera una molécula de agua. Es la misma reacción que da el aroma de plátano, repetida miles de veces.",
  },
  {
    id: "nylon",
    etq: "Nylon 6,6",
    nombre: "Nylon 6,6 (poliamida)",
    tipo: "condensacion",
    monomeros: [
      { nombre: "ácido adípico", formula: "C6H10O4" },
      { nombre: "hexametilendiamina", formula: "C6H16N2" },
    ],
    unidad: "C12H22N2O2",
    enlace: "amida (–CONH–)",
    maxVisibles: 3,
    usos: "Hilos, medias, cuerdas, cerdas de cepillo y piezas de ingeniería.",
    reciclaje: "Código 7 (otros plásticos).",
    dato: "Wallace Carothers lo creó en DuPont en 1935. Cada –COOH reacciona con un –NH₂, forma un enlace amida (como en el paracetamol) y libera agua. Los puentes de hidrógeno entre los N–H y los C=O de cadenas vecinas le dan su resistencia.",
  },
];

/** Masa molar de una cadena lineal de n unidades (con sus dos extremos). */
export function masaCadena(pol: Polimero, n: number): number {
  const u = masaMolar(pol.unidad);
  // PE: H–(C2H4)n–H.  PET y nylon: H–[unidad]n–OH.
  return pol.tipo === "adicion" ? u * n + 2 * MASA_ATOMICA.H! : u * n + masaMolar("H2O");
}

/** Ecuación de Carothers: grado de polimerización promedio Xn = 1 / (1 − p). */
export function carothers(p: number): number {
  return 1 / Math.max(1e-9, 1 - p);
}

/** Conversión necesaria para llegar a un grado de polimerización. */
export function conversionPara(xn: number): number {
  return 1 - 1 / xn;
}

export interface Estado {
  etq: string;
  detalle: string;
  util: boolean;
  nivel: number;
}

export function estadoPolimero(id: PolimeroId, n: number): Estado {
  if (id === "pe") {
    if (n <= 2) return { etq: "Gas", detalle: "Cadenas de 2 a 4 carbonos (etano, butano): como el gas LP.", util: false, nivel: 0 };
    if (n <= 8) return { etq: "Líquido", detalle: "De 6 a 16 carbonos: como los componentes de la gasolina y el diésel.", util: false, nivel: 1 };
    if (n <= 350) return { etq: "Sólido ceroso", detalle: "Hasta unos 700 carbonos (≈ 10 000 g/mol): parafinas y ceras, se desmoronan.", util: false, nivel: 2 };
    if (n < 1000) return { etq: "Sólido quebradizo", detalle: "Cadenas aún cortas para enredarse bien: se rompe con facilidad.", util: false, nivel: 3 };
    if (n < 110000) return { etq: "Plástico tenaz", detalle: "Las cadenas largas se enredan: bolsas, envases y tubería.", util: true, nivel: 4 };
    return { etq: "UHMWPE", detalle: "Peso molecular ultra alto (más de 3 millones de g/mol): fibras para chalecos y prótesis de cadera.", util: true, nivel: 5 };
  }
  if (n < 20) return { etq: "Oligómeros", detalle: "Cadenas cortas: polvo o cera sin resistencia.", util: false, nivel: 1 };
  if (id === "pet") {
    if (n < 100) return { etq: "Resina frágil", detalle: "Todavía no aguanta tensión: no sirve para fibra ni botella.", util: false, nivel: 2 };
    if (n < 150) return { etq: "Grado fibra", detalle: "Suficiente para hilar poliéster textil.", util: true, nivel: 3 };
    return { etq: "Grado botella", detalle: "Cadenas largas y resistentes: botellas de refresco y agua.", util: true, nivel: 4 };
  }
  if (n < 60) return { etq: "Resina frágil", detalle: "Todavía no se puede hilar.", util: false, nivel: 2 };
  if (n < 100) return { etq: "Grado fibra", detalle: "Se puede hilar: medias, cuerdas y telas.", util: true, nivel: 3 };
  return { etq: "Grado ingeniería", detalle: "Piezas moldeadas resistentes: engranes y partes de auto.", util: true, nivel: 4 };
}

/** Umbral (grado de polimerización) del grado útil que persigue cada objetivo. */
export const META_POLIMERO: Record<PolimeroId, { n: number; etq: string }> = {
  pe: { n: 1000, etq: "plástico tenaz" },
  pet: { n: 150, etq: "grado botella" },
  nylon: { n: 60, etq: "grado fibra" },
};

/** Masas de monómeros por kilogramo de polímero (g) y agua liberada (g). */
export function balancePorKg(pol: Polimero): { monomeros: { nombre: string; g: number }[]; agua: number; economiaAtomica: number } {
  const u = masaMolar(pol.unidad);
  const monomeros = pol.monomeros.map((m) => ({ nombre: m.nombre, g: (1000 * masaMolar(m.formula)) / u }));
  const agua = pol.tipo === "condensacion" ? (1000 * 2 * masaMolar("H2O")) / u : 0;
  const total = pol.monomeros.reduce((s, m) => s + masaMolar(m.formula), 0);
  return { monomeros, agua, economiaAtomica: u / total };
}

/* ── Constructor de cadenas en zigzag extendido ───────────────────────── */

type Sustituyente = "H2" | "H" | "=O" | "";
interface Nodo {
  el: "C" | "N" | "O";
  sub: Sustituyente;
  /** Longitud (Å) del enlace con el átomo anterior de la cadena principal. */
  l: number;
  anillo?: boolean;
  /** Residuo del monómero del que viene (0 o 1). */
  res: 0 | 1;
  /** Átomo del enlace éster/amida (para resaltar). */
  grupo?: boolean;
}

const CH2 = (l: number, res: 0 | 1): Nodo => ({ el: "C", sub: "H2", l, res });

const UNIDADES: Record<PolimeroId, Nodo[]> = {
  pe: [CH2(1.53, 0), CH2(1.53, 0)],
  pet: [
    { el: "O", sub: "", l: 1.34, res: 0, grupo: true },
    CH2(1.44, 0),
    CH2(1.51, 0),
    { el: "O", sub: "", l: 1.44, res: 0, grupo: true },
    { el: "C", sub: "=O", l: 1.34, res: 1, grupo: true },
    { el: "C", sub: "", l: 1.49, res: 1, anillo: true },
    { el: "C", sub: "=O", l: 1.49, res: 1, grupo: true },
  ],
  nylon: [
    { el: "N", sub: "H", l: 1.33, res: 0, grupo: true },
    CH2(1.46, 0),
    CH2(1.53, 0),
    CH2(1.53, 0),
    CH2(1.53, 0),
    CH2(1.53, 0),
    CH2(1.53, 0),
    { el: "N", sub: "H", l: 1.46, res: 0, grupo: true },
    { el: "C", sub: "=O", l: 1.33, res: 1, grupo: true },
    CH2(1.52, 1),
    CH2(1.53, 1),
    CH2(1.53, 1),
    CH2(1.53, 1),
    { el: "C", sub: "=O", l: 1.52, res: 1, grupo: true },
  ],
};

export interface Cadena {
  el: string[];
  /** Posiciones en Å. */
  p: [number, number, number][];
  /** Enlaces [a, b, orden]. */
  b: [number, number, number][];
  unidad: number[];
  residuo: number[];
  grupo: boolean[];
  /** Índices en `b` de los enlaces que forma la polimerización. */
  union: number[];
  /** Punto medio (Å) de cada enlace de unión, con la unidad que lo forma. */
  uniones: { p: [number, number, number]; unidad: number }[];
  /** Largo (Å) de una unidad repetitiva a lo largo de x. */
  paso: number;
}

const ALFA = (34 * Math.PI) / 180;

/** Construye `n` unidades repetitivas en zigzag plano (plano xy), a lo largo de +x. */
export function construirCadena(id: PolimeroId, n: number): Cadena {
  const nodos = UNIDADES[id];
  // 1) Cadena principal de tres unidades seguidas (para conocer los vecinos de la unidad central).
  type P2 = [number, number];
  const bb: { p: P2; nodo: Nodo; u: number; anillo?: P2[] }[] = [];
  let salida: P2 = [0, 0];
  let signo = 1;
  let primero = true;
  for (let u = 0; u < 3; u++) {
    for (const nodo of nodos) {
      const d: P2 = [Math.cos(ALFA * signo), Math.sin(ALFA * signo)];
      const p: P2 = primero ? [0, 0] : [salida[0] + d[0] * nodo.l, salida[1] + d[1] * nodo.l];
      primero = false;
      if (nodo.anillo) {
        const nrm: P2 = [-d[1], d[0]];
        const L = 1.39;
        const c60 = 0.5;
        const s60 = Math.sqrt(3) / 2;
        const C1 = p;
        const C2: P2 = [C1[0] + L * (c60 * d[0] + s60 * nrm[0]), C1[1] + L * (c60 * d[1] + s60 * nrm[1])];
        const C3: P2 = [C2[0] + L * d[0], C2[1] + L * d[1]];
        const C4: P2 = [C1[0] + 2 * L * d[0], C1[1] + 2 * L * d[1]];
        const C6: P2 = [C1[0] + L * (c60 * d[0] - s60 * nrm[0]), C1[1] + L * (c60 * d[1] - s60 * nrm[1])];
        const C5: P2 = [C6[0] + L * d[0], C6[1] + L * d[1]];
        bb.push({ p, nodo, u, anillo: [C1, C2, C3, C4, C5, C6] });
        salida = C4;
        // El enlace que sale del anillo es colineal con el que entra: no se alterna el signo.
      } else {
        bb.push({ p, nodo, u });
        salida = p;
        signo = -signo;
      }
    }
  }
  const k = nodos.length;
  const inicio = bb[k]!.p;
  const siguiente = bb[2 * k]!.p;
  const V: P2 = [siguiente[0] - inicio[0], siguiente[1] - inicio[1]];
  const paso = Math.hypot(V[0], V[1]);
  const ang = -Math.atan2(V[1], V[0]);
  const ca = Math.cos(ang);
  const sa = Math.sin(ang);
  const rot = (q: [number, number, number]): [number, number, number] => {
    const x = q[0] - inicio[0];
    const y = q[1] - inicio[1];
    return [x * ca - y * sa, x * sa + y * ca, q[2]];
  };
  // 2) Átomos de la unidad central en coordenadas locales.
  const loc: { el: string; p: [number, number, number]; res: number; grupo: boolean }[] = [];
  const locB: [number, number, number][] = [];
  const principal: number[] = []; // índice local del átomo que entra (C1 si es anillo)
  const salidaLoc: number[] = []; // índice local del átomo por el que sale (C4 si es anillo)
  const agrega = (el: string, p: [number, number, number], res: number, grupo: boolean) => {
    loc.push({ el, p: rot(p), res, grupo });
    return loc.length - 1;
  };
  for (let j = 0; j < k; j++) {
    const act = bb[k + j]!;
    const prev = bb[k + j - 1]!;
    const sig = bb[k + j + 1]!;
    const prevSal: P2 = prev.anillo ? prev.anillo[3]! : prev.p;
    const nodo = act.nodo;
    if (act.anillo) {
      const A = act.anillo;
      const ids = A.map((q) => agrega("C", [q[0], q[1], 0], nodo.res, false));
      [
        [0, 1, 2],
        [1, 2, 1],
        [2, 3, 2],
        [3, 4, 1],
        [4, 5, 2],
        [5, 0, 1],
      ].forEach(([a, b, o]) => locB.push([ids[a!]!, ids[b!]!, o!]));
      const cx = (A[0]![0] + A[3]![0]) / 2;
      const cy = (A[0]![1] + A[3]![1]) / 2;
      [1, 2, 4, 5].forEach((i) => {
        const q = A[i]!;
        const dx = q[0] - cx;
        const dy = q[1] - cy;
        const m = Math.hypot(dx, dy);
        const h = agrega("H", [q[0] + (dx / m) * 1.08, q[1] + (dy / m) * 1.08, 0], nodo.res, false);
        locB.push([ids[i]!, h, 1]);
      });
      principal.push(ids[0]!);
      salidaLoc.push(ids[3]!);
      continue;
    }
    const i = agrega(nodo.el, [act.p[0], act.p[1], 0], nodo.res, !!nodo.grupo);
    principal.push(i);
    salidaLoc.push(i);
    const u1: P2 = [prevSal[0] - act.p[0], prevSal[1] - act.p[1]];
    const u2: P2 = [sig.p[0] - act.p[0], sig.p[1] - act.p[1]];
    const m1 = Math.hypot(u1[0], u1[1]);
    const m2 = Math.hypot(u2[0], u2[1]);
    let bx = -(u1[0] / m1 + u2[0] / m2);
    let by = -(u1[1] / m1 + u2[1] / m2);
    const mb = Math.hypot(bx, by);
    bx /= mb;
    by /= mb;
    if (nodo.sub === "H2") {
      const t = (54.75 * Math.PI) / 180;
      for (const z of [1, -1]) {
        const h = agrega("H", [act.p[0] + 1.09 * bx * Math.cos(t), act.p[1] + 1.09 * by * Math.cos(t), 1.09 * z * Math.sin(t)], nodo.res, false);
        locB.push([i, h, 1]);
      }
    } else if (nodo.sub === "=O") {
      const o = agrega("O", [act.p[0] + 1.22 * bx, act.p[1] + 1.22 * by, 0], nodo.res, true);
      locB.push([i, o, 2]);
    } else if (nodo.sub === "H") {
      const h = agrega("H", [act.p[0] + 1.01 * bx, act.p[1] + 1.01 * by, 0], nodo.res, !!nodo.grupo);
      locB.push([i, h, 1]);
    }
  }
  // Enlaces de la cadena principal dentro de la unidad.
  const internos: { b: [number, number, number]; union: boolean }[] = [];
  for (let j = 1; j < k; j++) {
    const union = nodos[j]!.res !== nodos[j - 1]!.res;
    internos.push({ b: [salidaLoc[j - 1]!, principal[j]!, 1], union });
  }
  // 3) Replicar n unidades.
  const out: Cadena = { el: [], p: [], b: [], unidad: [], residuo: [], grupo: [], union: [], uniones: [], paso };
  const nLoc = loc.length;
  for (let u = 0; u < n; u++) {
    const off = u * nLoc;
    loc.forEach((a) => {
      out.el.push(a.el);
      out.p.push([a.p[0] + u * paso, a.p[1], a.p[2]]);
      out.unidad.push(u);
      out.residuo.push(a.res);
      out.grupo.push(a.grupo);
    });
    locB.forEach(([a, b, o]) => out.b.push([a + off, b + off, o]));
    internos.forEach(({ b: [a, b, o], union }) => {
      if (union) out.union.push(out.b.length);
      out.b.push([a + off, b + off, o]);
    });
    if (u > 0) {
      // Enlace con la unidad anterior: siempre es de unión (C–C en PE, éster en PET, amida en nylon).
      out.union.push(out.b.length);
      out.b.push([salidaLoc[k - 1]! + off - nLoc, principal[0]! + off, 1]);
    }
  }
  out.union.forEach((bi) => {
    const [a, b] = out.b[bi]!;
    const pa = out.p[a]!;
    const pb = out.p[b]!;
    out.uniones.push({ p: [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2, (pa[2] + pb[2]) / 2], unidad: out.unidad[b]! });
  });
  return out;
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. DEL GRUPO FUNCIONAL AL PRODUCTO
 * ════════════════════════════════════════════════════════════════════════ */

export type GrupoId = "alqueno" | "alcohol" | "aldehido" | "acido" | "ester" | "amida";

export const GRUPOS: Record<GrupoId, { etq: string; formula: string; color: string }> = {
  alqueno: { etq: "Alqueno", formula: "C=C", color: "#34d399" },
  alcohol: { etq: "Alcohol / fenol", formula: "–OH", color: "#38bdf8" },
  aldehido: { etq: "Aldehído", formula: "–CHO", color: "#f472b6" },
  acido: { etq: "Ácido carboxílico", formula: "–COOH", color: "#f87171" },
  ester: { etq: "Éster", formula: "–COO–", color: "#fbbf24" },
  amida: { etq: "Amida", formula: "–CONH–", color: "#a78bfa" },
};
export const GRUPOS_ORDEN: GrupoId[] = ["alqueno", "alcohol", "aldehido", "acido", "ester", "amida"];

export type MolId = "aspirina" | "paracetamol" | "ibuprofeno" | "vainillina" | "isoamilo" | "benzoico" | "etileno" | "tereftalico" | "etilenglicol" | "adipico" | "hmda";

export type ObjetoId = "tableta" | "grageas" | "vainas" | "caramelo" | "refresco" | "botella" | "carrete" | "bolsa" | "frasco";

export interface Producto {
  id: string;
  etq: string;
  objeto: ObjetoId;
  industria: Industria;
  /** Molécula que se muestra: confórmero de PubChem o fragmento de cadena. */
  mol: MolId | PolimeroId;
  molEtq: string;
  formula: string;
  grupo: GrupoId;
  /** Otros grupos presentes en la molécula (no son los que la definen aquí). */
  otros: GrupoId[];
  propiedad: string;
  uso: string;
}

export const PRODUCTOS: Producto[] = [
  {
    id: "paracetamol",
    etq: "Tabletas de paracetamol",
    objeto: "tableta",
    industria: "farmaceutica",
    mol: "paracetamol",
    molEtq: "paracetamol",
    formula: "C8H9NO2",
    grupo: "amida",
    otros: ["alcohol"],
    propiedad: "El grupo –NHCOCH₃ (amida) lo clasifica, como pregunta el quiz A2; el –OH del anillo es un fenol.",
    uso: "Analgésico y antipirético (baja el dolor y la fiebre).",
  },
  {
    id: "ibuprofeno",
    etq: "Grageas de ibuprofeno",
    objeto: "grageas",
    industria: "farmaceutica",
    mol: "ibuprofeno",
    molEtq: "ibuprofeno",
    formula: "C13H18O2",
    grupo: "acido",
    otros: [],
    propiedad: "Su –COOH es un ácido débil; el resto de la molécula es apolar y le permite atravesar membranas.",
    uso: "Antiinflamatorio: bloquea las enzimas COX que producen las prostaglandinas del dolor.",
  },
  {
    id: "aspirina",
    etq: "Aspirina",
    objeto: "frasco",
    industria: "farmaceutica",
    mol: "aspirina",
    molEtq: "ácido acetilsalicílico",
    formula: "C9H8O4",
    grupo: "ester",
    otros: ["acido"],
    propiedad: "El éster (acetilo unido al anillo) es lo que la distingue del ácido salicílico; también tiene un –COOH.",
    uso: "Analgésico y antiinflamatorio: transfiere su acetilo a la enzima COX.",
  },
  {
    id: "vainillina",
    etq: "Extracto de vainilla",
    objeto: "vainas",
    industria: "alimentaria",
    mol: "vainillina",
    molEtq: "vainillina",
    formula: "C8H8O3",
    grupo: "aldehido",
    otros: ["alcohol"],
    propiedad: "El aldehído (–CHO) sobre el anillo es clave para su aroma; también tiene un fenol y un grupo metoxi.",
    uso: "Saborizante de helados, pan y chocolate. La vainilla es originaria de México (Papantla, Veracruz); la mayor parte de la vainillina que se consume hoy es sintética.",
  },
  {
    id: "isoamilo",
    etq: "Caramelo sabor plátano",
    objeto: "caramelo",
    industria: "alimentaria",
    mol: "isoamilo",
    molEtq: "acetato de isoamilo",
    formula: "C7H14O2",
    grupo: "ester",
    otros: [],
    propiedad: "Los ésteres pequeños son volátiles (se evaporan fácil) y tienen olores afrutados.",
    uso: "Saborizante con aroma a plátano en dulces y bebidas.",
  },
  {
    id: "benzoico",
    etq: "Refresco con benzoato",
    objeto: "refresco",
    industria: "alimentaria",
    mol: "benzoico",
    molEtq: "ácido benzoico",
    formula: "C7H6O2",
    grupo: "acido",
    otros: [],
    propiedad: "En bebidas ácidas (pH bajo) el benzoato está como ácido benzoico sin disociar, que entra a levaduras y hongos e inhibe su crecimiento.",
    uso: "Conservador de refrescos, jugos y salsas: benzoato de sodio, E211 (quiz A2).",
  },
  {
    id: "pet",
    etq: "Botella de PET",
    objeto: "botella",
    industria: "materiales",
    mol: "pet",
    molEtq: "unidad repetitiva del PET",
    formula: "C10H8O4",
    grupo: "ester",
    otros: [],
    propiedad: "Enlaces éster unen miles de unidades: cadenas rígidas por el anillo, transparentes y poco permeables al CO₂.",
    uso: "Botellas de refresco y agua; fibra de poliéster. Código de reciclaje 1.",
  },
  {
    id: "nylon",
    etq: "Carrete de hilo de nylon",
    objeto: "carrete",
    industria: "materiales",
    mol: "nylon",
    molEtq: "unidad repetitiva del nylon 6,6",
    formula: "C12H22N2O2",
    grupo: "amida",
    otros: [],
    propiedad: "Los N–H y C=O de las amidas forman puentes de hidrógeno entre cadenas: fibras muy resistentes.",
    uso: "Hilos, medias, cuerdas y cerdas de cepillo.",
  },
  {
    id: "polietileno",
    etq: "Bolsa de polietileno",
    objeto: "bolsa",
    industria: "materiales",
    mol: "etileno",
    molEtq: "etileno (monómero)",
    formula: "C2H4",
    grupo: "alqueno",
    otros: [],
    propiedad: "El doble enlace C=C del etileno se abre y permite unir miles de monómeros por adición. El plástico final solo tiene C–C y C–H: por eso es inerte y repele el agua.",
    uso: "Bolsas, películas y envases. Códigos de reciclaje 2 y 4.",
  },
];

/* ── Estrellas: ¿qué más sale del reactor? ─────────────────────────────── */

export type Subproducto = "nada" | "agua" | "acetico" | "glicerol" | "co2";

export const SUBPRODUCTOS: Record<Subproducto, { etq: string; icono: string }> = {
  nada: { etq: "Nada (adición)", icono: "fa-circle-dot" },
  agua: { etq: "Agua", icono: "fa-droplet" },
  acetico: { etq: "Ácido acético", icono: "fa-bottle-droplet" },
  glicerol: { etq: "Glicerol", icono: "fa-oil-can" },
  co2: { etq: "CO₂", icono: "fa-cloud" },
};
export const SUBPRODUCTOS_ORDEN: Subproducto[] = ["nada", "agua", "acetico", "glicerol", "co2"];

export const PROCESOS: { texto: string; sale: Subproducto; porque: string }[] = [
  { texto: "Etileno → polietileno (bolsas)", sale: "nada", porque: "Es una adición: el C=C se abre y todos los átomos quedan en la cadena." },
  { texto: "Estireno → poliestireno (unicel)", sale: "nada", porque: "El estireno también tiene un C=C: polimeriza por adición, sin subproducto." },
  { texto: "Cloruro de vinilo → PVC (tubería)", sale: "nada", porque: "Otra adición sobre un doble enlace C=C." },
  { texto: "Ácido tereftálico + etilenglicol → PET", sale: "agua", porque: "Cada enlace éster se forma con –COOH + –OH y libera H₂O: es una condensación." },
  { texto: "Ácido adípico + hexametilendiamina → nylon 6,6", sale: "agua", porque: "Cada enlace amida se forma con –COOH + –NH₂ y libera H₂O." },
  { texto: "Ácido acético + alcohol isoamílico → aroma de plátano", sale: "agua", porque: "Esterificación de Fischer: el –OH del ácido y el H del alcohol forman agua." },
  { texto: "Ácido salicílico + anhídrido acético → aspirina", sale: "acetico", porque: "El anhídrido cede un acetilo; la otra mitad queda como ácido acético." },
  { texto: "4-aminofenol + anhídrido acético → paracetamol", sale: "acetico", porque: "Igual que la aspirina: el anhídrido cede un acetilo y libera ácido acético." },
  { texto: "Grasa (triglicérido) + NaOH → jabón", sale: "glicerol", porque: "La saponificación rompe los tres ésteres de la grasa y libera glicerol." },
  { texto: "Glucosa + levadura → bioetanol", sale: "co2", porque: "La fermentación alcohólica da 2 etanol y 2 CO₂ por cada glucosa." },
  { texto: "Ácido láctico → PLA (bioplástico)", sale: "agua", porque: "Cada éster entre moléculas de ácido láctico libera agua." },
];

export function rondaProcesos(rnd: () => number, n = 6): number[] {
  const idx = PROCESOS.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [idx[i], idx[j]] = [idx[j]!, idx[i]!];
  }
  return idx.slice(0, n);
}

/* ════════════════════════════════════════════════════════════════════════
 * Contenido VERBATIM
 * ════════════════════════════════════════════════════════════════════════ */

export const TITULO_A1 = "Química orgánica en la industria: fármacos, alimentos y materiales";

/** Lectura A1 — cuatro párrafos, verbatim. */
export const LECTURA_A1: string[] = [
  "La química orgánica no es solo una asignatura escolar: es la base de industrias que generan millones de empleos y determinan la calidad de vida de la población mexicana. Tres sectores son especialmente relevantes: la industria farmacéutica, la industria alimentaria y la industria de los materiales plásticos y textiles.",
  "La industria farmacéutica en México tiene un valor aproximado de 16,000 millones de dólares anuales. Los laboratorios nacionales como Laboratorio Silanes, Senosiain y PiSA producen principios activos orgánicos: analgésicos (paracetamol, C₈H₉NO₂), antibióticos (amoxicilina, amiodarona), antiinflamatorios (ibuprofeno, C₁₃H₁₈O₂) y vitaminas sintéticas. El IMSS y el ISSSTE juntos distribuyen más de 700 millones de recetas al año; la mayoría de los medicamentos son moléculas orgánicas diseñadas para interactuar con receptores específicos del cuerpo humano —también moléculas orgánicas.",
  "La industria alimentaria utiliza aditivos químicos orgánicos para conservar, colorear, endulzar y potenciar sabores. El ácido benzoico y el benzoato de sodio son conservadores ampliamente utilizados en refrescos y jugos; el ácido cítrico (extraído industrialmente por fermentación del maíz) se usa en miles de productos. Los edulcorantes como la sacarina (C₇H₅NO₃S) y el aspartamo (C₁₄H₁₈N₂O₅) son moléculas orgánicas complejas que endulzan sin aportar calorías. La empresa Bimbo, con sede en México, es uno de los mayores consumidores de aditivos alimentarios orgánicos del continente.",
  "La industria de los materiales es quizás la aplicación más visible: prácticamente todo objeto plástico que usas es un polímero orgánico. El polietileno (bolsas), el PET (botellas de refresco), el PVC (tuberías), el poliestireno (unicel) y el nylon (textiles) son todos polímeros de monómeros orgánicos. En México, el programa ECOCE (Envases y Empaques de México) busca reciclar PET para reducir la dependencia de petróleo crudo como materia prima. Sin embargo, la producción de plástico en México supera los 4 millones de toneladas anuales, planteando serios retos ambientales que la industria química también debe resolver.",
];

/** Recuadro de la lectura A1 — verbatim. */
export const RECUADRO_A1 =
  "El CINVESTAV (Centro de Investigación y de Estudios Avanzados del IPN) es el principal centro de ciencia experimental de México, con laboratorios en Biología, Química, Física, Ingeniería y Biotecnología. Sus investigadores han publicado en las revistas científicas más prestigiosas del mundo.";

/** Preguntas de comprensión de la lectura A1 — verbatim. */
export const PREGUNTAS: string[] = [
  "¿Qué papel juega la química orgánica en la industria farmacéutica mexicana? Menciona un ejemplo concreto.",
  "¿Qué son los aditivos alimentarios orgánicos y cuál es su función en la industria de alimentos?",
  "¿Qué es un polímero y cómo se relaciona con los plásticos de uso cotidiano?",
  "¿Qué es el programa ECOCE y qué problema ambiental busca atender?",
];

/** Hechos: quiz A4 (verdadero/falso), cada enunciado con su retroalimentación verbatim. */
export const HECHOS: string[] = [
  "Verdadero: «Los polímeros sintéticos como el nylon y el PET están formados por cadenas largas de monómeros orgánicos repetidos». Correcto: los polímeros sintéticos se obtienen por reacciones de polimerización de monómeros orgánicos como éteres, ésteres o amidas.",
  "Verdadero: «La fermentación alcohólica es un proceso industrial en que las levaduras transforman azúcares en etanol y CO₂». Correcto: la fermentación alcohólica (C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂) se usa en la producción de bebidas, pan y biocombustibles.",
  "Falso: «Los fármacos son siempre sustancias inorgánicas; la química orgánica no participa en su síntesis». La mayoría de los fármacos modernos son compuestos orgánicos. Ejemplo: la aspirina (ácido acetilsalicílico) y la penicilina son moléculas orgánicas de síntesis o semisíntesis.",
  "Verdadero: «La petroquímica utiliza el petróleo como materia prima para producir plásticos, combustibles y solventes orgánicos». Correcto: el refinado del petróleo y el craqueo catalítico producen compuestos orgánicos base para múltiples industrias.",
  "Falso: «Los colorantes artificiales de los alimentos son siempre compuestos inorgánicos basados en metales pesados». La mayoría de los colorantes artificiales (como tartrazina, rojo 40) son compuestos orgánicos sintéticos. Algunos colorantes inorgánicos existen, pero son la minoría.",
];

/** Glosario A5 — verbatim. */
export const GLOSARIO: { termino: string; definicion: string; ejemplo: string }[] = [
  { termino: "Polímero", definicion: "Macromolécula formada por la unión repetida de unidades pequeñas llamadas monómeros mediante reacciones de polimerización.", ejemplo: "El polietileno (PE) es un polímero de etileno usado en envases y bolsas; la celulosa es un polímero natural de glucosa." },
  { termino: "Petroquímica", definicion: "Industria que procesa el petróleo y el gas natural para obtener compuestos orgánicos base: plásticos, combustibles, fibras sintéticas, solventes y fertilizantes.", ejemplo: "El etileno obtenido por craqueo del petróleo es la materia prima del polietileno y el PVC." },
  { termino: "Fermentación", definicion: "Proceso metabólico anaerobio en que microorganismos (levaduras, bacterias) transforman azúcares en productos orgánicos útiles: etanol, ácido láctico, ácido acético.", ejemplo: "La fermentación alcohólica de la caña de azúcar produce bioetanol que se mezcla con la gasolina en México." },
  { termino: "Fármaco", definicion: "Compuesto químico (mayoritariamente orgánico) que interactúa con moléculas biológicas para prevenir, tratar o curar enfermedades.", ejemplo: "La aspirina (C₉H₈O₄) es un fármaco orgánico antiinflamatorio derivado del ácido salicílico." },
  { termino: "Aditivo alimentario", definicion: "Sustancia orgánica o inorgánica añadida a los alimentos para mejorar sabor, color, textura o vida útil.", ejemplo: "El ácido cítrico (E330) es un aditivo acidulante y conservante natural de origen orgánico." },
  { termino: "Bioplástico", definicion: "Polímero derivado de fuentes biológicas renovables (almidón, celulosa, PLA) en lugar de petróleo; generalmente biodegradable.", ejemplo: "Los envases de ácido poliláctico (PLA) hechos de almidón de maíz son bioplásticos." },
];

export const ACTIVIDAD_A5 =
  "Investiga un producto de uso cotidiano (medicamento, plástico o aditivo alimentario) e identifica: qué compuesto orgánico contiene, de dónde proviene la materia prima y qué reacción química se usa en su fabricación.";

/** Debate A3 — verbatim. */
export const DEBATE_A3 = {
  tema: "¿Deben las empresas farmacéuticas y alimentarias priorizar las ganancias o el bienestar social al usar química orgánica en sus productos?",
  posturas: [
    {
      etq: "Ganancias y regulación",
      postura: "Las empresas tienen la responsabilidad primaria de generar ganancias para sus accionistas; la regulación del Estado es la que debe proteger al consumidor",
      argumentos: [
        "En una economía de mercado, las empresas son legalmente responsables ante sus accionistas, no ante el público. La regulación (COFEPRIS en México, FDA en EUA) existe precisamente para compensar esta brecha.",
        "La búsqueda de ganancias impulsa la innovación: la inversión privada en investigación y desarrollo de fármacos ha generado vacunas y medicamentos que han salvado millones de vidas; sin incentivos económicos, esa inversión no existiría.",
        "La competencia entre empresas farmacéuticas y alimentarias puede reducir precios y mejorar calidad, beneficiando a los consumidores sin necesidad de intervención directa del Estado.",
        "La responsabilidad individual del consumidor también importa: la educación científica (como la que provee la escuela) permite a las personas tomar decisiones informadas sobre qué comprar y qué evitar.",
      ],
    },
    {
      etq: "Bienestar primero",
      postura: "Las empresas farmacéuticas y alimentarias tienen una obligación ética de priorizar el bienestar humano por encima de las ganancias, dado que sus productos afectan directamente la salud",
      argumentos: [
        "A diferencia de otros productos, los alimentos y medicamentos son bienes de primera necesidad que afectan la salud; su producción involucra una relación de confianza y asimetría de información con los consumidores que genera obligaciones éticas especiales.",
        "Casos como el escándalo de la talidomida (medicamento que causó malformaciones fetales en los años 60) o los aditivos cancerígenos en alimentos ultraprocesados muestran que las ganancias a corto plazo pueden causar daños irreversibles cuando no se priorizan la seguridad y el bienestar.",
        "México tiene una epidemia de obesidad y diabetes tipo 2 (primer lugar mundial per cápita en consumo de refrescos hasta hace pocos años) directamente relacionada con el diseño de productos ultraprocesados optimizados para el consumo adictivo, no para la nutrición.",
        "La industria farmacéutica en países en desarrollo como México puede abusar de su posición fijando precios prohibitivos para medicamentos esenciales (patentes) cuando las ganancias se priorizan sobre el acceso a la salud.",
      ],
    },
  ],
  reglas: [
    "Escucha activamente la postura contraria antes de responder.",
    "Fundamenta cada argumento con evidencia o ejemplos concretos.",
    "Usa un lenguaje respetuoso, aunque el desacuerdo sea profundo.",
    "No interrumpas a quien tiene la palabra.",
    "Cita fuentes cuando afirmes datos o hechos verificables.",
  ],
};

export const FUENTE =
  "CEN Bachillerato — CNEYT-IV, progresión 9: lectura A1 (Material elaborado para CEN Bachillerato — CNEYT-IV), quiz A2, debate A3, quiz A4, glosario A5 y actividad A6. Geometrías moleculares: confórmeros 3D de PubChem (NIH).";

export const PROBLEMA =
  "Una tableta, un caramelo de plátano y una botella de refresco parecen no tener nada en común. Por dentro, los tres dependen de la química orgánica: de los mismos grupos funcionales —ésteres, amidas, ácidos— y de reacciones que la industria repite por toneladas. Aquí sigues el camino de la molécula al producto.";

export const INSTRUCCIONES: string[] = [
  "En Reactor de síntesis, elige una reacción, ajusta los gramos de cada reactivo y pulsa «Reaccionar»: mira qué enlaces se rompen (rojo) y cuáles se forman (verde), y calcula cuánto producto obtienes.",
  "En Planta de polímeros, elige PE, PET o nylon y alarga la cadena: el grado de polimerización decide si obtienes un gas, una cera o un plástico útil.",
  "En Del grupo al producto, toca cada producto, identifica su grupo funcional y mándalo a su industria.",
  "Gana estrellas en «¿Qué más sale del reactor?» y resuelve el quiz A2 y el texto A6.",
];

export const IDEAS: string[] = [
  "Los medicamentos, los aditivos y los plásticos son moléculas orgánicas; lo que cambia es su grupo funcional.",
  "Una reacción rompe enlaces específicos y forma otros: el reactivo con el grupo adecuado decide el producto (éster o amida).",
  "El reactivo limitante fija cuánto producto sale; el que sobra se desperdicia o se recupera.",
  "En un equilibrio, usar exceso de un reactivo o retirar un producto desplaza la reacción (principio de Le Châtelier).",
  "La adición no deja subproducto; la condensación libera una molécula pequeña, casi siempre agua.",
  "Un polímero útil necesita cadenas muy largas: en la condensación eso exige convertir más del 99 % de los grupos.",
  "El mismo grupo éster da una aspirina, un aroma de plátano y una botella de PET.",
];

/** Quiz A2 «Aplicaciones industriales de la química orgánica: quiz» — verbatim. */
export const QUIZ_A2: QuizEvaluable = {
  titulo: "Aplicaciones industriales de la química orgánica: quiz",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "El paracetamol (acetaminofén, C₈H₉NO₂) es un medicamento del tipo analgésico/antipirético. ¿A qué familia de compuestos orgánicos pertenece por su grupo funcional –NHCOCH₃?",
      opciones: ["Alcohol", "Amida", "Ácido carboxílico", "Éter"],
      respuestaCorrecta: 1,
      retroalimentacion:
        "El grupo –NHCO– es una amida (enlace amida). El paracetamol contiene un grupo amida (acetamida) y un grupo fenol. Es uno de los medicamentos más consumidos en México y en el mundo, distribuido masivamente por el IMSS y de venta libre en farmacias.",
    },
    {
      enunciado: "¿Qué es un polímero sintético y cuál es un ejemplo de aplicación industrial en México?",
      opciones: [
        "Una molécula natural de origen vegetal usada en perfumería",
        "Una macromolécula fabricada por la unión repetida de monómeros orgánicos, como el PET de las botellas de refresco recicladas por el programa ECOCE",
        "Un compuesto mineral extraído de rocas para la construcción",
        "Una proteína producida por ingeniería genética en laboratorio",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "Los polímeros sintéticos se fabrican por polimerización de monómeros orgánicos derivados del petróleo. El PET (polietileno tereftalato) forma las botellas de refresco; el programa ECOCE en México recicla PET para reducir dependencia del petróleo crudo y disminuir residuos sólidos.",
    },
    {
      enunciado: "El ácido benzoico y el benzoato de sodio se usan en la industria alimentaria principalmente como:",
      opciones: [
        "Colorantes artificiales para dar apariencia atractiva",
        "Conservadores antimicrobianos que inhiben el crecimiento de bacterias y hongos en bebidas y alimentos ácidos",
        "Edulcorantes no calóricos para reducir el azúcar",
        "Emulsificantes para mezclar agua y aceite en salsas",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "El benzoato de sodio es uno de los conservadores más usados a nivel global (código E211). Inhibe el crecimiento de levaduras, bacterias y hongos, especialmente en ambientes ácidos (pH < 4). Está presente en refrescos, jugos y salsas embotelladas. En México, la COFEPRIS regula sus límites de concentración.",
    },
    {
      enunciado: "La industria farmacéutica diseña medicamentos como 'moléculas que encajan en receptores del cuerpo'. Este concepto se conoce como:",
      opciones: ["Síntesis orgánica total", "El modelo llave-cerradura (o interacción fármaco-receptor)", "Polimeración en cadena", "Esterificación controlada"],
      respuestaCorrecta: 1,
      retroalimentacion:
        "El modelo llave-cerradura (propuesto por Emil Fischer en 1894) describe que un fármaco (llave) tiene una forma molecular complementaria al receptor biológico (cerradura). La interacción es altamente específica, lo que permite que medicamentos actúen sobre tejidos concretos con efectos selectivos.",
    },
    {
      enunciado: "¿Por qué la producción de plástico a partir del petróleo genera dependencia de un recurso no renovable?",
      opciones: [
        "Porque el petróleo es el único solvente que puede polimerizar plásticos",
        "Porque los monómeros de la mayoría de los plásticos sintéticos (etileno, propileno, estireno) se obtienen por refinación del petróleo crudo, un recurso fósil que tarda millones de años en formarse",
        "Porque el plástico es en realidad petróleo solidificado directamente",
        "Porque sin petróleo no hay energía para los hornos de polimerización",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "Los plásticos más comunes (polietileno, PET, PVC, poliestireno) se fabrican a partir de monómeros orgánicos como el etileno y el propileno, obtenidos por craqueo (fraccionamiento) del petróleo. Al ser el petróleo no renovable, la dependencia del plástico convencional es un problema de sostenibilidad a largo plazo.",
    },
  ],
};

/** Actividad A6 «Rellena los huecos — Química orgánica en la industria» — verbatim. */
export const HUECOS_A6: TextoHuecosData = {
  ancla: "CNEYT-IV-P06-A6 · Rellena los huecos — Química orgánica en la industria",
  instrucciones: "Completa los cuatro huecos con la palabra o expresión correcta.",
  partes: [
    "Los ",
    " son macromoléculas formadas por la unión de monómeros orgánicos repetidos; el nylon y el PET son ejemplos industriales. La ",
    " es la industria que refina el petróleo para obtener plásticos, combustibles y solventes orgánicos. La fermentación alcohólica convierte azúcares en ",
    " y dióxido de carbono mediante levaduras. La mayoría de los ",
    " modernos son compuestos orgánicos que interactúan con moléculas biológicas del cuerpo.",
  ],
  huecos: [
    { respuesta: "polímeros", alternativas: ["polimeros", "plásticos"], pista: "Macromoléculas formadas por monómeros repetidos; incluyen plásticos y fibras sintéticas." },
    { respuesta: "petroquímica", alternativas: ["industria petroquímica", "petroquimica"], pista: "Industria que procesa el petróleo para obtener compuestos orgánicos base." },
    { respuesta: "etanol", alternativas: ["alcohol etílico", "alcohol"], pista: "Alcohol de 2 carbonos producido por fermentación alcohólica de azúcares." },
    { respuesta: "fármacos", alternativas: ["medicamentos", "farmacos"], pista: "Compuestos químicos que se usan para prevenir, tratar o curar enfermedades." },
  ],
};

/* ════════════════════════════════════════════════════════════════════════
 * Geometría (tipos)
 * ════════════════════════════════════════════════════════════════════════ */

/** Molécula: `el` una letra por átomo; `xyz` coordenadas en Å (x,y,z por átomo); `b` enlaces (a, b, orden). */
export interface MolGeo {
  el: string;
  xyz: number[];
  b: number[];
}

/**
 * Coreografía de una reacción. Índices de átomo en la numeración de los reactivos.
 *  s / e: posición inicial (reactivos) y final (productos), 3 números por átomo.
 *  frag: fragmento rígido de cada átomo (lo que queda unido al romper enlaces).
 *  fr: por fragmento, cuaternión (w,x,y,z) y centroides inicial y final: 10 números.
 *  bR / bP: enlaces de reactivos (a, b, orden, ¿se rompe?) y de productos (a, b, orden, ¿se forma?).
 *  molR / molP: molécula a la que pertenece cada átomo antes y después.
 *  marca: átomos que participan en los enlaces que cambian.
 */
export interface ReaccionGeo {
  el: string;
  s: number[];
  e: number[];
  frag: number[];
  fr: number[];
  bR: number[];
  bP: number[];
  molR: number[];
  molP: number[];
  marca: number[];
}

/* ── GEOMETRÍA GENERADA (confórmeros 3D de PubChem) — no editar a mano ── */

export const MOLS: Record<MolId, MolGeo> = {
  aspirina: { el: "OOOOCCCCCCCCCHHHHHHHH", xyz: [1.14,0.4,0.79,-0.79,-2.87,-0.74,0.7,-2.34,0.88,1.68,0.66,-1.47,-0.18,0.45,0.45,-0.89,-0.71,0.13,-0.83,1.69,0.42,-2.24,-0.63,-0.21,-2.18,1.77,0.08,-2.88,0.61,-0.24,-0.24,-2.01,0.16,2.01,0.52,-0.3,3.43,0.44,0.17,-0.28,2.6,0.67,-2.82,-1.52,-0.45,-2.68,2.73,0.06,-3.94,0.67,-0.5,3.63,1.26,0.87,4.11,0.54,-0.68,3.61,-0.52,0.65,-0.35,-3.75,-0.73], b: [0,4,1,0,11,1,1,10,1,1,20,1,2,10,2,3,11,2,4,5,1,4,6,2,5,7,2,5,10,1,6,8,1,6,13,1,7,9,1,7,14,1,8,9,2,8,15,1,9,16,1,11,12,1,12,17,1,12,18,1,12,19,1] },
  paracetamol: { el: "OONCCCCCCCCHHHHHHHHH", xyz: [4.15,0.6,0,-2.3,1.55,0,-1.27,-0.57,0,0.1,-0.28,0,0.52,1.05,0,1.03,-1.31,0,1.89,1.34,0,2.4,-1.02,0,2.82,0.31,0,-2.35,0.32,0,-3.67,-0.4,0,-0.14,1.9,0,0.71,-2.35,0,-1.5,-1.56,0,2.21,2.38,0,3.12,-1.83,0,-3.76,-1,-0.91,-4.49,0.33,0.03,-3.74,-1.04,0.88,4.27,1.56,0], b: [0,8,1,0,19,1,1,9,2,2,3,1,2,9,1,2,13,1,3,4,2,3,5,1,4,6,1,4,11,1,5,7,2,5,12,1,6,8,2,6,14,1,7,8,1,7,15,1,9,10,1,10,16,1,10,17,1,10,18,1] },
  ibuprofeno: { el: "OOCCCCCCCCCCCCCHHHHHHHHHHHHHHHHHH", xyz: [-4.92,-1.01,0.43,-2.88,-1.92,0.08,3.43,-0.45,0.06,2.67,0.81,-0.41,1.18,0.73,-0.23,-1.57,0.58,0.11,-3.05,0.5,0.29,3.13,-0.79,1.52,3.05,-1.64,-0.83,0.39,0.22,-1.25,0.61,1.17,0.96,-0.99,0.14,-1.08,-0.77,1.1,1.13,-3.85,1.34,-0.73,-3.58,-0.93,0.26,4.5,-0.26,-0.05,2.9,1.01,-1.46,3.05,1.68,0.14,-3.3,0.88,1.3,2.1,-1.13,1.68,3.32,0.08,2.17,3.79,-1.6,1.86,3.7,-2.49,-0.61,2.02,-1.98,-0.66,3.17,-1.4,-1.89,0.83,-0.12,-2.18,1.23,1.57,1.76,-1.6,-0.26,-1.89,-1.2,1.44,2.07,-3.48,2.37,-0.76,-3.78,0.92,-1.74,-4.91,1.38,-0.46,-5.24,-1.94,0.4], b: [0,14,1,0,32,1,1,14,2,2,3,1,2,7,1,2,8,1,2,15,1,3,4,1,3,16,1,3,17,1,4,9,2,4,10,1,5,6,1,5,11,2,5,12,1,6,13,1,6,14,1,6,18,1,7,19,1,7,20,1,7,21,1,8,22,1,8,23,1,8,24,1,9,11,1,9,25,1,10,12,2,10,26,1,11,27,1,12,28,1,13,29,1,13,30,1,13,31,1] },
  vainillina: { el: "OOOCCCCCCCCHHHHHHHH", xyz: [2.07,-0.73,0,2.15,2.05,0,-3.86,-0.05,0,0.92,-0.01,0,-1.5,0.06,0,-0.31,-0.67,0,0.95,1.39,0,-1.46,1.45,0,-0.23,2.12,0,-2.78,-0.63,0,1.95,-2.15,0,-0.4,-1.75,0,-2.37,2.04,0,-0.22,3.2,0,-2.74,-1.74,0,1.46,-2.51,-0.91,1.46,-2.51,0.91,2.96,-2.56,0,1.98,3.01,0], b: [0,3,1,0,10,1,1,6,1,1,18,1,2,9,2,3,5,1,3,6,2,4,5,2,4,7,1,4,9,1,5,11,1,6,8,1,7,8,2,7,12,1,8,13,1,9,14,1,10,15,1,10,16,1,10,17,1] },
  isoamilo: { el: "OOCCCCCCCHHHHHHHHHHHHHH", xyz: [-1.7,-0.55,-0.05,-2.81,1.47,0.13,2.08,-0.3,-0.04,0.67,-0.91,-0.1,-0.44,0.13,0,2.26,0.71,-1.18,2.37,0.37,1.3,-2.8,0.25,0.03,-4.04,-0.6,-0.03,2.8,-1.12,-0.18,0.55,-1.65,0.7,0.55,-1.48,-1.03,-0.38,0.68,0.94,-0.4,0.83,-0.84,3.31,1.01,-1.25,1.68,1.62,-1.03,1.98,0.27,-2.15,1.76,1.27,1.45,3.42,0.69,1.34,2.19,-0.32,2.13,-4.06,-1.29,0.81,-4.08,-1.14,-0.98,-4.92,0.05,0.04], b: [0,4,1,0,7,1,1,7,2,2,3,1,2,5,1,2,6,1,2,9,1,3,4,1,3,10,1,3,11,1,4,12,1,4,13,1,5,14,1,5,15,1,5,16,1,6,17,1,6,18,1,6,19,1,7,8,1,8,20,1,8,21,1,8,22,1] },
  benzoico: { el: "OOCCCCCCCHHHHHH", xyz: [2.62,-1.11,0,2.77,1.16,0,0.62,0.11,0,-0.1,1.31,0,-0.05,-1.11,0,-1.5,1.28,0,-1.45,-1.14,0,-2.17,0.06,0,2.07,0.14,0,0.4,2.27,0,0.47,-2.06,0,-2.06,2.21,0,-1.97,-2.09,0,-3.26,0.04,0,3.6,-1.07,0], b: [0,8,1,0,14,1,1,8,2,2,3,2,2,4,1,2,8,1,3,5,1,3,9,1,4,6,2,4,10,1,5,7,2,5,11,1,6,7,1,6,12,1,7,13,1] },
  etileno: { el: "CCHHHH", xyz: [-0.67,0,0,0.67,0,0,-1.22,-0.93,0.07,-1.22,0.93,-0.07,1.22,0.93,-0.07,1.22,-0.93,0.07], b: [0,1,2,0,2,1,0,3,1,1,4,1,1,5,1] },
  tereftalico: { el: "OOOOCCCCCCCCHHHHHH", xyz: [-3.4,-1.18,0,3.4,1.18,0,-3.54,1.08,0,3.54,-1.08,0,-1.39,0.03,0,1.39,-0.03,0,-0.67,1.22,0,0.72,1.19,0,-0.72,-1.19,0,0.67,-1.22,0,-2.85,0.06,0,2.85,-0.06,0,-1.18,2.19,0,1.25,2.14,0,-1.25,-2.14,0,1.18,-2.19,0,-4.38,-1.15,0,4.38,1.15,0], b: [0,10,1,0,16,1,1,11,1,1,17,1,2,10,2,3,11,2,4,6,2,4,8,1,4,10,1,5,7,2,5,9,1,5,11,1,6,7,1,6,12,1,7,13,1,8,9,2,8,14,1,9,15,1] },
  etilenglicol: { el: "OOCCHHHHHH", xyz: [-1.34,-0.79,-0.03,1.45,-0.79,0.27,-0.64,0.37,0.42,0.75,0.37,-0.17,-1.2,1.25,0.12,-0.6,0.32,1.51,1.31,1.25,0.15,0.72,0.34,-1.27,-1.39,-0.75,-1,0.93,-1.57,-0.01], b: [0,2,1,0,8,1,1,3,1,1,9,1,2,3,1,2,4,1,2,5,1,3,6,1,3,7,1] },
  adipico: { el: "OOOOCCCCCCHHHHHHHHHH", xyz: [4.2,-0.86,0.09,-4.23,0.79,0.06,3.39,1.26,0,-3.3,-1.28,0,0.68,0.37,-0.02,-0.69,-0.33,-0.07,1.84,-0.62,-0.03,-1.85,0.65,0,3.2,0.05,0.01,-3.18,-0.06,0.03,0.74,1,0.88,0.77,1.05,-0.88,-0.76,-0.93,-0.99,-0.75,-1.04,0.77,1.8,-1.24,-0.93,1.77,-1.28,0.85,-1.77,1.26,0.91,-1.83,1.31,-0.87,5.08,-0.43,0.12,-5.09,0.32,0.07], b: [0,8,1,0,18,1,1,9,1,1,19,1,2,8,2,3,9,2,4,5,1,4,6,1,4,10,1,4,11,1,5,7,1,5,12,1,5,13,1,6,8,1,6,14,1,6,15,1,7,9,1,7,16,1,7,17,1] },
  hmda: { el: "NNCCCCCCHHHHHHHHHHHHHHHH", xyz: [4.34,0.33,0.02,-4.4,-0.24,0.04,0.58,-0.38,0.05,-0.67,0.52,0.04,1.89,0.41,0.08,-1.95,-0.32,0.05,3.13,-0.48,0.01,-3.19,0.57,0.01,0.56,-1.02,-0.83,0.54,-1.04,0.93,-0.65,1.16,-0.85,-0.65,1.18,0.92,1.93,1.02,0.99,1.9,1.11,-0.77,-1.97,-0.94,0.96,-1.95,-1,-0.81,3.15,-1.17,0.86,3.11,-1.09,-0.91,-3.19,1.18,-0.91,-3.2,1.26,0.86,4.34,0.95,-0.79,5.15,-0.27,-0.07,-4.4,-0.82,0.88,-4.4,-0.89,-0.75], b: [0,6,1,0,20,1,0,21,1,1,7,1,1,22,1,1,23,1,2,3,1,2,4,1,2,8,1,2,9,1,3,5,1,3,10,1,3,11,1,4,6,1,4,12,1,4,13,1,5,7,1,5,14,1,5,15,1,6,16,1,6,17,1,7,18,1,7,19,1] },
};

export const GRUPOS_MOL: Partial<Record<MolId, Partial<Record<GrupoId, number[]>>>> = {
  aspirina: {ester: [0,3,11],acido: [1,2,10,20]},
  paracetamol: {amida: [1,2,9,13],alcohol: [0,19]},
  ibuprofeno: {acido: [0,1,14,32]},
  vainillina: {aldehido: [2,9,14],alcohol: [1,18]},
  isoamilo: {ester: [0,1,7]},
  benzoico: {acido: [0,1,8,14]},
  etileno: {alqueno: [0,1]},
};

export const REACCIONES_GEO: Record<ReaccionId, ReaccionGeo> = {
  aspirina: {
    el: "OOOCCCCCCCHHHHHHOOOCCCCHHHHHH",
    s: [-0.72,0,0,-3.64,2.84,-0.34,-1.67,2.49,0.73,-3.03,0.62,0.1,-2.04,-0.35,0,-4.38,0.25,0.09,-2.38,-1.69,-0.11,-4.72,-1.1,-0.01,-3.73,-2.07,-0.11,-2.69,2.04,0.21,-5.18,0.98,0.18,-1.62,-2.46,-0.18,-5.77,-1.39,-0.01,-4,-3.12,-0.19,-0.18,-0.8,-0.08,-3.41,3.79,-0.27,3.84,-0.13,0,1.83,1.04,0.01,4.18,2.17,0.01,2.48,0,0,4.59,1.02,0.01,1.86,-1.37,0,6.04,0.65,0,0.77,-1.27,-0.01,2.16,-1.91,0.9,2.17,-1.91,-0.9,6.28,0.07,0.89,6.64,1.56,0.01,6.28,0.09,-0.91],
    e: [-1.33,-0.43,-0.83,-3.74,2.46,0.78,-2.27,2.18,-0.92,-3.48,0.3,-0.07,-2.59,-0.72,-0.42,-4.78,-0.01,0.35,-3,-2.05,-0.34,-5.18,-1.35,0.42,-4.29,-2.37,0.08,-3.09,1.7,-0.14,-5.5,0.75,0.61,-2.31,-2.85,-0.61,-6.19,-1.59,0.74,-4.6,-3.4,0.13,4.27,0.02,-0.04,-3.47,3.4,0.73,5.23,-0.2,-0.05,-0.62,-0.54,1.4,5.56,2.06,-0.03,-0.39,-0.36,0.21,6,0.92,-0.04,0.97,-0.04,-0.34,7.45,0.56,-0.05,1.69,0,0.47,0.94,0.93,-0.84,1.28,-0.82,-1.04,7.69,-0.02,0.85,8.05,1.47,-0.05,7.69,-0.02,-0.95],
    frag: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,2,3,2,3,2,3,2,3,3,3,2,2,2],
    fr: [0.9798,0.0282,0.1968,-0.0241,-3.26,0.05,0.01,-3.72,-0.26,0.03, 1,0,0,0,-0.18,-0.8,-0.08,4.27,0.02,-0.04, 1,-0.0033,0.0006,0.0004,5.41,0.78,0,6.81,0.68,-0.04, 0.2111,-0.3087,0.5921,0.7138,1.88,-0.9,0,0.64,-0.14,-0.02],
    bR: [0,4,1,0,0,14,1,1,1,9,1,0,1,15,1,0,2,9,2,0,3,4,1,0,3,5,2,0,3,9,1,0,4,6,2,0,5,7,1,0,5,10,1,0,6,8,1,0,6,11,1,0,7,8,2,0,7,12,1,0,8,13,1,0,16,19,1,1,16,20,1,0,17,19,2,0,18,20,2,0,19,21,1,0,20,22,1,0,21,23,1,0,21,24,1,0,21,25,1,0,22,26,1,0,22,27,1,0,22,28,1,0],
    bP: [0,4,1,0,0,19,1,1,1,9,1,0,1,15,1,0,2,9,2,0,17,19,2,0,4,3,1,0,4,6,2,0,3,5,2,0,3,9,1,0,6,8,1,0,6,11,1,0,5,7,1,0,5,10,1,0,8,7,2,0,8,13,1,0,7,12,1,0,19,21,1,0,21,25,1,0,21,23,1,0,21,24,1,0,16,20,1,0,16,14,1,1,18,20,2,0,22,20,1,0,22,26,1,0,22,28,1,0,22,27,1,0],
    molR: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
    molP: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1,0,1,0,1,0,0,0,1,1,1],
    marca: [0,14,19,16],
  },
  paracetamol: {
    el: "ONCCCCCCHHHHHHHOOOCCCCHHHHHH",
    s: [-6.27,0.13,0,-0.71,0,0,-2.12,0.03,0,-2.85,-1.16,0,-2.79,1.26,0,-4.91,0.1,0,-4.24,-1.12,0,-4.19,1.29,0,-2.34,-2.12,0,-2.24,2.19,0,-4.8,-2.06,0,-4.7,2.25,0,-0.23,-0.89,0,-0.19,0.86,0,-6.61,-0.78,0,3.85,-0.13,0,1.83,1.04,0.01,4.19,2.17,0.01,2.49,0,0,4.59,1.02,0.01,1.87,-1.37,0,6.05,0.65,0,0.78,-1.27,-0.01,2.17,-1.91,0.9,2.18,-1.91,-0.9,6.29,0.07,0.89,6.65,1.56,0.01,6.28,0.09,-0.91],
    e: [-6.84,-0.59,0,-1.37,0.29,0,-2.74,0.07,0,-3.24,-1.23,0,-3.62,1.15,0,-5.5,-0.37,0,-4.62,-1.46,0,-5,0.93,0,-2.62,-2.12,0,-3.25,2.17,-0.01,-5,-2.47,0,-5.68,1.78,0,4.44,-0.04,0,-1.08,1.27,0,-7.01,-1.55,0,5.4,-0.26,0,-0.45,-1.88,0,5.73,1.99,0.01,-0.34,-0.66,0,6.17,0.85,0,1.02,-0.01,0,7.62,0.49,0,1.8,-0.78,0.03,1.13,0.63,0.88,1.15,0.58,-0.91,7.86,-0.08,0.9,8.22,1.41,0,7.85,-0.08,-0.9],
    frag: [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,2,3,2,3,2,3,2,3,3,3,2,2,2],
    fr: [0.9958,-0.001,0.0002,0.0916,-3.5,0.06,0,-4.11,-0.15,0, 1,0,0,0,-0.23,-0.89,0,4.44,-0.04,0, 1,-0.0033,0.0006,0.0004,5.41,0.78,0,6.98,0.62,0, 0.3373,-0.0136,0.0067,0.9413,1.89,-0.9,0,0.72,-0.36,0],
    bR: [0,5,1,0,0,14,1,0,1,2,1,0,1,12,1,1,1,13,1,0,2,3,2,0,2,4,1,0,3,6,1,0,3,8,1,0,4,7,2,0,4,9,1,0,5,6,2,0,5,7,1,0,6,10,1,0,7,11,1,0,15,18,1,1,15,19,1,0,16,18,2,0,17,19,2,0,18,20,1,0,19,21,1,0,20,22,1,0,20,23,1,0,20,24,1,0,21,25,1,0,21,26,1,0,21,27,1,0],
    bP: [0,5,1,0,0,14,1,0,16,18,2,0,1,2,1,0,1,18,1,1,1,13,1,0,2,3,2,0,2,4,1,0,3,6,1,0,3,8,1,0,4,7,2,0,4,9,1,0,6,5,2,0,6,10,1,0,7,5,1,0,7,11,1,0,18,20,1,0,20,24,1,0,20,22,1,0,20,23,1,0,15,19,1,0,15,12,1,1,17,19,2,0,21,19,1,0,21,25,1,0,21,27,1,0,21,26,1,0],
    molR: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
    molP: [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,1,0,1,0,1,0,0,0,1,1,1],
    marca: [1,12,18,15],
  },
  ester: {
    el: "OOCCHHHHOCCCCCHHHHHHHHHHHH",
    s: [-3.87,-1.35,0.03,-2.93,0.72,-0.02,-5.33,0.48,-0.01,-3.91,0,0,-5.84,0.12,-0.9,-5.84,0.15,0.89,-5.34,1.58,-0.02,-2.95,-1.69,0.03,-0.91,0,0,2.84,-0.03,0.49,1.34,0.01,0.81,3.18,-1.32,-0.27,3.29,1.18,-0.33,0.44,-0.06,-0.42,3.39,-0.03,1.44,1.11,0.92,1.38,1.08,-0.82,1.49,4.26,-1.43,-0.35,2.77,-1.32,-1.29,2.79,-2.2,0.26,2.86,1.19,-1.33,4.38,1.18,-0.44,3.02,2.11,0.18,0.62,0.76,-1.11,0.57,-1.01,-0.96,-1.04,0.85,0.45],
    e: [-6.89,-1.67,0.16,-1.93,0.52,-1.51,-3.19,0.43,0.54,-1.95,0.42,-0.29,-3.28,-0.51,1.08,-3.17,1.27,1.23,-4.06,0.54,-0.12,-6.61,-2.6,0.06,-0.85,0.28,0.51,2.92,0.08,0.3,1.51,0.1,0.89,3.05,-1.07,-0.71,3.29,1.4,-0.37,0.41,0.26,-0.15,3.63,-0.1,1.12,1.43,0.91,1.63,1.33,-0.82,1.46,4.1,-1.2,-1,2.48,-0.88,-1.63,2.71,-2.01,-0.27,2.69,1.59,-1.27,4.35,1.39,-0.68,3.15,2.24,0.31,0.53,1.19,-0.7,0.41,-0.58,-0.85,-6.05,-1.19,0.26],
    frag: [0,1,1,1,1,1,1,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3],
    fr: [0.8921,0.0344,0.0435,-0.4484,-3.41,-1.52,0.03,-6.75,-2.14,0.11, 0.674,-0.5902,0.3234,0.3047,-4.86,0.51,-0.01,-2.93,0.45,0.15, 0.9922,0.0846,0.0895,-0.0201,2.18,-0.05,-0.03,2.18,0.16,-0.08, 1,0,0,0,-1.04,0.85,0.45,-6.05,-1.19,0.26],
    bR: [0,3,1,1,0,7,1,0,1,3,2,0,2,3,1,0,2,4,1,0,2,5,1,0,2,6,1,0,8,13,1,0,8,25,1,1,9,10,1,0,9,11,1,0,9,12,1,0,9,14,1,0,10,13,1,0,10,15,1,0,10,16,1,0,11,17,1,0,11,18,1,0,11,19,1,0,12,20,1,0,12,21,1,0,12,22,1,0,13,23,1,0,13,24,1,0],
    bP: [8,13,1,0,8,3,1,1,1,3,2,0,9,10,1,0,9,11,1,0,9,12,1,0,9,14,1,0,10,13,1,0,10,15,1,0,10,16,1,0,13,23,1,0,13,24,1,0,11,17,1,0,11,18,1,0,11,19,1,0,12,20,1,0,12,21,1,0,12,22,1,0,3,2,1,0,2,5,1,0,2,4,1,0,2,6,1,0,0,7,1,0,0,25,1,1],
    molR: [0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    molP: [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    marca: [3,0,8,25],
  },
  fermentacion: {
    el: "OOOOOOCCCCCCHHHHHHHHHHHH",
    s: [-0.58,1.26,0.31,-0.8,-2.35,-0.28,1.95,-1.97,0.52,2.94,0.64,-0.41,1.21,2.76,0.31,-3.29,1.07,-0.13,-0.29,-1.14,0.28,1.17,-0.97,-0.14,-1.14,0.04,-0.18,1.69,0.42,0.24,0.72,1.52,-0.2,-2.57,-0.05,0.33,-0.34,-1.25,1.38,1.29,-1.15,-1.22,-1.17,0.09,-1.28,1.88,0.46,1.32,0.68,1.62,-1.29,-2.61,-0.05,1.42,-3.07,-0.95,-0.04,-0.77,-2.26,-1.25,1.58,-2.83,0.27,2.8,0.6,-1.37,1.57,2.61,1.2,-2.84,1.87,0.2],
    e: [-5.1,-5.4,0.8,-2.7,-5.4,0.8,2.7,-5.4,0.8,7.72,1.08,-1.36,5.1,-5.4,0.8,-7.15,-0.05,0.58,3.9,-5.4,0.8,-3.9,-5.4,0.8,7.66,1.62,-0.05,-6.41,1.03,0.03,-7.37,2.12,-0.4,6.24,1.53,0.46,-7.95,2.48,0.45,7.45,0.15,-1.31,-6.83,2.95,-0.85,5.9,0.48,0.49,7.99,2.66,-0.09,-7.64,0.29,1.36,-5.84,0.65,-0.82,-8.09,1.73,-1.13,8.35,1.06,0.59,5.55,2.06,-0.21,6.15,1.95,1.47,-5.71,1.4,0.78],
    frag: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    fr: [1,0,0,0,-0.58,1.26,0.31,-5.1,-5.4,0.8, 1,0,0,0,-0.8,-2.35,-0.28,-2.7,-5.4,0.8, 1,0,0,0,1.95,-1.97,0.52,2.7,-5.4,0.8, 1,0,0,0,2.94,0.64,-0.41,7.72,1.08,-1.36, 1,0,0,0,1.21,2.76,0.31,5.1,-5.4,0.8, 1,0,0,0,-3.29,1.07,-0.13,-7.15,-0.05,0.58, 1,0,0,0,-0.29,-1.14,0.28,3.9,-5.4,0.8, 1,0,0,0,1.17,-0.97,-0.14,-3.9,-5.4,0.8, 1,0,0,0,-1.14,0.04,-0.18,7.66,1.62,-0.05, 1,0,0,0,1.69,0.42,0.24,-6.41,1.03,0.03, 1,0,0,0,0.72,1.52,-0.2,-7.37,2.12,-0.4, 1,0,0,0,-2.57,-0.05,0.33,6.24,1.53,0.46, 1,0,0,0,-0.34,-1.25,1.38,-7.95,2.48,0.45, 1,0,0,0,1.29,-1.15,-1.22,7.45,0.15,-1.31, 1,0,0,0,-1.17,0.09,-1.28,-6.83,2.95,-0.85, 1,0,0,0,1.88,0.46,1.32,5.9,0.48,0.49, 1,0,0,0,0.68,1.62,-1.29,7.99,2.66,-0.09, 1,0,0,0,-2.61,-0.05,1.42,-7.64,0.29,1.36, 1,0,0,0,-3.07,-0.95,-0.04,-5.84,0.65,-0.82, 1,0,0,0,-0.77,-2.26,-1.25,-8.09,1.73,-1.13, 1,0,0,0,1.58,-2.83,0.27,8.35,1.06,0.59, 1,0,0,0,2.8,0.6,-1.37,5.55,2.06,-0.21, 1,0,0,0,1.57,2.61,1.2,6.15,1.95,1.47, 1,0,0,0,-2.84,1.87,0.2,-5.71,1.4,0.78],
    bR: [0,8,1,1,0,10,1,1,1,6,1,1,1,19,1,1,2,7,1,1,2,20,1,1,3,9,1,1,3,21,1,1,4,10,1,1,4,22,1,1,5,11,1,1,5,23,1,1,6,7,1,1,6,8,1,1,6,12,1,1,7,9,1,1,7,13,1,1,8,11,1,0,8,14,1,1,9,10,1,0,9,15,1,1,10,16,1,1,11,17,1,1,11,18,1,1],
    bP: [5,9,1,1,5,17,1,1,9,10,1,0,9,23,1,1,9,18,1,1,10,14,1,1,10,19,1,1,10,12,1,1,3,8,1,1,3,13,1,1,8,11,1,0,8,20,1,1,8,16,1,1,11,22,1,1,11,21,1,1,11,15,1,1,0,7,2,1,1,7,2,1,2,6,2,1,4,6,2,1],
    molR: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    molP: [2,2,3,1,3,0,3,2,1,0,0,1,0,1,0,1,1,0,0,0,1,1,1,0],
    marca: [7,6],
  },
};

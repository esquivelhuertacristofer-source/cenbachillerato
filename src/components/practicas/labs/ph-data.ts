/**
 * Datos y modelo del laboratorio 3D de pH (CNEYT-IV-P03).
 *
 * Práctica experimental anclada a CNEYT-IV-P03-A2 (simulacion "Simulación de
 * laboratorio: midiendo el pH"; UAC "Reacciones químicas", progresión 3:
 * "Analiza el concepto de pH y la importancia de los ácidos y bases…").
 *
 * Módulo PURO de datos: NO importa three ni @react-three, así que es seguro
 * importarlo desde el shell sin arrastrar three.js a su bundle.
 *
 * Honestidad del modelo:
 *  - Los valores de pH de cada sustancia son los EXACTOS de la actividad
 *    (lectura A1 + simulación A2). Donde la actividad da un rango se usa un
 *    valor representativo y se conserva el texto original ("~1", "9–10"…).
 *  - El color del indicador de col morada es CUALITATIVO: reproduce la regla
 *    verbatim de A1 (rojo/rosa en ácido, morado en neutro, azul/verde en
 *    básico) interpolando tonos; no es una medición colorimétrica.
 *  - La curva de titulación usa un modelo simplificado con concentraciones y
 *    volúmenes supuestos (ácido 0.1 M en 25 mL, NaOH 0.1 M), pero las FORMAS
 *    —salto brusco en el punto de equivalencia, región buffer del ácido débil,
 *    equivalencia básica del ácido débil— son las correctas de fisicoquímica.
 */

/* ── Clasificación ácido / neutro / base ─────────────────────────────────── */
export type Tipo = "acido" | "neutro" | "base";

export interface Clase {
  tipo: Tipo;
  etiqueta: string; // "Ácido" | "Neutro" | "Base"
  matiz: string; // "fuerte" | "moderado" | "débil" | "" (cualitativo)
  color: string; // color de acento para badges
}

export function clasifica(ph: number): Clase {
  if (Math.abs(ph - 7) < 0.05) return { tipo: "neutro", etiqueta: "Neutro", matiz: "", color: "#A78BFA" };
  const d = Math.abs(ph - 7);
  const matiz = d >= 4 ? "fuerte" : d >= 2 ? "moderado" : "débil";
  return ph < 7
    ? { tipo: "acido", etiqueta: "Ácido", matiz, color: "#FB7185" }
    : { tipo: "base", etiqueta: "Base", matiz, color: "#34D399" };
}

/* ── Indicador de col morada (antocianinas): pH → color ──────────────────── */
/* Regla verbatim A1: ácido → rojo/rosa · neutro → morado · básico → azul/verde */
const COL_ANCLAS: { ph: number; rgb: [number, number, number] }[] = [
  { ph: 0, rgb: [200, 24, 52] }, // rojo intenso
  { ph: 2, rgb: [216, 30, 77] }, // rojo-rosa
  { ph: 4, rgb: [181, 23, 158] }, // magenta
  { ph: 6, rgb: [123, 44, 191] }, // violeta
  { ph: 7, rgb: [90, 24, 154] }, // morado (neutro)
  { ph: 8, rgb: [58, 80, 180] }, // azul-morado
  { ph: 9, rgb: [55, 110, 200] }, // azul
  { ph: 10, rgb: [40, 150, 170] }, // azul-verde
  { ph: 11, rgb: [42, 157, 143] }, // verde azulado
  { ph: 12, rgb: [67, 170, 139] }, // verde
  { ph: 13, rgb: [144, 190, 109] }, // verde-amarillo
  { ph: 14, rgb: [197, 216, 109] }, // amarillo-verde
];

const hex2 = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, "0");

/** Color del indicador de col morada para un pH dado (interpolación lineal). */
export function colorCol(ph: number): string {
  const p = Math.max(0, Math.min(14, ph));
  let a = COL_ANCLAS[0]!;
  let b = COL_ANCLAS[COL_ANCLAS.length - 1]!;
  for (let i = 0; i < COL_ANCLAS.length - 1; i++) {
    const lo = COL_ANCLAS[i]!;
    const hi = COL_ANCLAS[i + 1]!;
    if (p >= lo.ph && p <= hi.ph) {
      a = lo;
      b = hi;
      break;
    }
  }
  const t = b.ph === a.ph ? 0 : (p - a.ph) / (b.ph - a.ph);
  const r = a.rgb[0] + (b.rgb[0] - a.rgb[0]) * t;
  const g = a.rgb[1] + (b.rgb[1] - a.rgb[1]) * t;
  const bl = a.rgb[2] + (b.rgb[2] - a.rgb[2]) * t;
  return `#${hex2(r)}${hex2(g)}${hex2(bl)}`;
}

/** Nombre cualitativo del color del indicador para un pH dado. */
export function nombreColor(ph: number): string {
  if (ph < 3) return "rojo";
  if (ph < 5) return "rosa-magenta";
  if (ph < 6.5) return "violeta";
  if (ph <= 7.5) return "morado";
  if (ph < 9) return "azul";
  if (ph < 11) return "azul-verde";
  return "verde";
}

/* ── Sustancias (verbatim de la lectura A1 y la simulación A2) ────────────── */
export interface Sustancia {
  id: string;
  nombre: string;
  formula?: string;
  ph: number; // valor representativo usado por el modelo y la escala
  phTexto: string; // como aparece en la actividad ("~1", "7", "9–10")
  icono: string; // Font Awesome
  contexto: string; // texto de la actividad (A1/A2)
  grupo: "sim" | "cotidiana";
}

/** Las 6 soluciones del panel de la simulación A2 (verbatim). */
export const SUSTANCIAS: Sustancia[] = [
  {
    id: "hcl",
    nombre: "Ácido clorhídrico diluido",
    formula: "HCl 0.1 M",
    ph: 1,
    phTexto: "~1",
    icono: "fa-vial",
    contexto:
      "Ácido fuerte de laboratorio. El estómago humano produce HCl con pH 1.5–2, suficientemente ácido para descomponer las proteínas de los alimentos.",
    grupo: "sim",
  },
  {
    id: "vinagre",
    nombre: "Vinagre",
    formula: "ác. acético 5%",
    ph: 3,
    phTexto: "~3",
    icono: "fa-wine-bottle",
    contexto: "Ácido débil de uso doméstico (ácido acético al 5%). Útil en cocina y limpieza.",
    grupo: "sim",
  },
  {
    id: "agua",
    nombre: "Agua destilada",
    formula: "H₂O",
    ph: 7,
    phTexto: "7",
    icono: "fa-droplet",
    contexto: "El pH neutro es exactamente 7 y corresponde al agua pura a 25 °C.",
    grupo: "sim",
  },
  {
    id: "bicarbonato",
    nombre: "Bicarbonato de sodio",
    formula: "NaHCO₃ 0.1 M",
    ph: 8.3,
    phTexto: "~8.3",
    icono: "fa-flask",
    contexto:
      "Base débil. El bicarbonato (pH ≈ 8.4) se usa como antiácido: neutraliza el exceso de ácido en el estómago.",
    grupo: "sim",
  },
  {
    id: "naoh",
    nombre: "Hidróxido de sodio diluido",
    formula: "NaOH 0.01 M",
    ph: 12,
    phTexto: "~12",
    icono: "fa-flask-vial",
    contexto: "Base fuerte de laboratorio (sosa cáustica). Muy corrosiva.",
    grupo: "sim",
  },
  {
    id: "cloro",
    nombre: "Agua de cloro doméstico",
    formula: "NaClO",
    ph: 13,
    phTexto: "~13",
    icono: "fa-spray-can-sparkles",
    contexto:
      "La lejía (hipoclorito de sodio), usada para limpiar y desinfectar, tiene pH 12–13 y puede irritar la piel.",
    grupo: "sim",
  },
];

/** Sustancias cotidianas mencionadas en la lectura A1 (enriquecen "Medir"). */
export const COTIDIANAS: Sustancia[] = [
  {
    id: "gastrico",
    nombre: "Ácido gástrico",
    formula: "HCl estomacal",
    ph: 1.75,
    phTexto: "1.5–2",
    icono: "fa-stomach",
    contexto: "El ácido clorhídrico del estómago descompone las proteínas; su exceso causa acidez o gastritis.",
    grupo: "cotidiana",
  },
  {
    id: "limon",
    nombre: "Jugo de limón",
    ph: 2,
    phTexto: "~2",
    icono: "fa-lemon",
    contexto: "El jugo de limón tiene un pH de aproximadamente 2: muy ácido.",
    grupo: "cotidiana",
  },
  {
    id: "lluvia",
    nombre: "Lluvia ácida",
    ph: 4,
    phTexto: "<5.6",
    icono: "fa-cloud-rain",
    contexto:
      "La lluvia ácida tiene pH < 5.6. Cerca de la Ciudad de México puede llegar a pH 4 o menos por la contaminación; daña bosques, suelos y monumentos de piedra caliza.",
    grupo: "cotidiana",
  },
  {
    id: "cafe",
    nombre: "Café negro",
    ph: 5,
    phTexto: "~5",
    icono: "fa-mug-hot",
    contexto: "El café negro tiene un pH de aproximadamente 5: ligeramente ácido.",
    grupo: "cotidiana",
  },
  {
    id: "sangre",
    nombre: "Sangre humana",
    ph: 7.4,
    phTexto: "7.35–7.45",
    icono: "fa-heart-pulse",
    contexto:
      "La sangre debe mantenerse en un rango muy estrecho (7.35–7.45). Fuera de él se produce acidosis o alcalosis; riñones y pulmones mantienen ese equilibrio.",
    grupo: "cotidiana",
  },
  {
    id: "jabon",
    nombre: "Jabón de barra",
    ph: 9.5,
    phTexto: "9–10",
    icono: "fa-soap",
    contexto: "El jabón de barra tiene un pH entre 9 y 10: básico.",
    grupo: "cotidiana",
  },
];

export const TODAS: Sustancia[] = [...SUSTANCIAS, ...COTIDIANAS];

export const SUST_DEF = "vinagre";

export function sustancia(id: string): Sustancia {
  return TODAS.find((s) => s.id === id) ?? SUSTANCIAS[0]!;
}

/* ── Modelo de titulación (neutralización) ───────────────────────────────── */
/* Ácido (0.1 M, 25 mL) titulado con NaOH 0.1 M. f = equivalentes de base
 * añadidos (0 → 2); el punto de equivalencia está en f = 1. */
export type TipoAcido = "fuerte" | "debil";

export interface AcidoTit {
  id: TipoAcido;
  nombre: string;
  formula: string;
  ph0: number; // pH inicial (antes de añadir base)
  descripcion: string;
}

export const ACIDOS: AcidoTit[] = [
  {
    id: "fuerte",
    nombre: "Ácido fuerte — HCl",
    formula: "HCl 0.1 M",
    ph0: 1,
    descripcion:
      "Se disocia por completo. El pH casi no cambia hasta cerca de la equivalencia, donde da un salto muy brusco hasta pH 7.",
  },
  {
    id: "debil",
    nombre: "Ácido débil — vinagre",
    formula: "ác. acético 0.1 M",
    ph0: 2.87,
    descripcion:
      "Se disocia poco. Tiene una región amortiguadora (buffer) donde el pH sube despacio, y su punto de equivalencia queda en pH > 7 (≈ 8.7).",
  },
];

const CA = 0.1; // M
const KA = 1.8e-5; // ácido acético
const PKA = 4.74;

/** pH de la solución cuando se han añadido f equivalentes de base. */
export function phTitulacion(tipo: TipoAcido, f: number): number {
  let ph: number;
  if (tipo === "fuerte") {
    if (f < 1) ph = -Math.log10((CA * (1 - f)) / (1 + f));
    else if (f > 1) ph = 14 + Math.log10((CA * (f - 1)) / (1 + f));
    else ph = 7;
  } else {
    const ini = -Math.log10(Math.sqrt(KA * CA)); // ≈ 2.87
    if (f <= 0) ph = ini;
    else if (f < 1) ph = Math.max(ini, PKA + Math.log10(f / (1 - f)));
    else if (f > 1) ph = 14 + Math.log10((CA * (f - 1)) / (1 + f));
    else ph = 7 + 0.5 * (PKA + Math.log10(CA / 2)); // ≈ 8.72
  }
  return Math.max(0.2, Math.min(13.8, ph));
}

export const GOTAS_EQ = 20; // gotas hasta el punto de equivalencia (f = 1)
export const GOTAS_MAX = 40; // gotas totales (f = 2)

/** pH tras un número de gotas de base (gota = GOTAS_EQ → equivalencia). */
export function phPorGotas(tipo: TipoAcido, gotas: number): number {
  return phTitulacion(tipo, gotas / GOTAS_EQ);
}

export interface PuntoCurva {
  gota: number;
  ph: number;
}

/** Curva pH vs gotas para dibujarla en la UI. */
export function curvaTitulacion(tipo: TipoAcido): PuntoCurva[] {
  const pts: PuntoCurva[] = [];
  for (let g = 0; g <= GOTAS_MAX; g++) pts.push({ gota: g, ph: phPorGotas(tipo, g) });
  return pts;
}

/* ── Buffer (amortiguador): demostración comparativa ─────────────────────── */
/* Añadir la misma cantidad de ácido fuerte al agua pura vs a un buffer de
 * bicarbonato (sistema HCO₃⁻/H₂CO₃ que simula la sangre). Valores cualitativos. */
export interface BufferDemo {
  nombre: string;
  phAntes: number;
  phDespues: number;
  icono: string;
  nota: string;
}

export const BUFFER: BufferDemo[] = [
  {
    nombre: "Agua pura",
    phAntes: 7,
    phDespues: 3.0,
    icono: "fa-droplet",
    nota: "Sin amortiguador, el pH se desploma al agregar el ácido.",
  },
  {
    nombre: "Buffer de bicarbonato (sangre)",
    phAntes: 7.4,
    phDespues: 7.3,
    icono: "fa-heart-pulse",
    nota: "El sistema HCO₃⁻/H₂CO₃ absorbe el ácido: el pH casi no cambia.",
  },
];

/* ── Lecturas: datos y ideas clave (de A1 y A2) ──────────────────────────── */
export interface Dato {
  valor: string;
  texto: string;
  icono: string;
}

export const DATOS: Dato[] = [
  { valor: "0 – 14", texto: "rango de la escala de pH", icono: "fa-ruler-horizontal" },
  { valor: "7.35 – 7.45", texto: "pH normal de la sangre humana", icono: "fa-heart-pulse" },
  { valor: "6.5 – 8.5", texto: "pH del agua potable (NOM-127-SSA1-2021)", icono: "fa-faucet-drip" },
  { valor: "×10 por unidad", texto: "la escala de pH es logarítmica", icono: "fa-chart-line" },
];

export const IDEAS: string[] = [
  "El pH va de 0 a 14 y resume la concentración de iones hidrógeno: ácido si pH < 7, neutro si pH = 7 y básico si pH > 7.",
  "La escala es logarítmica: cada unidad de pH significa 10 veces más (o menos) iones hidrógeno. Por eso pH 1 es 100 veces más ácido que pH 3.",
  "El indicador de col morada (antocianinas) se vuelve rojo o rosa en ácido, morado en neutro y azul o verde en básico.",
  "En una neutralización se mezclan un ácido y una base; con ácido y base fuertes el punto de equivalencia llega a pH 7.",
  "Un ácido débil (vinagre) resiste más el cambio de pH que uno fuerte (HCl): tiene una región buffer.",
  "La sangre se mantiene entre 7.35 y 7.45 gracias a un buffer de bicarbonato; fuera de ese rango hay acidosis o alcalosis.",
  "En México, la NOM-127-SSA1-2021 exige que el agua potable tenga pH entre 6.5 y 8.5; la CONAGUA lo monitorea.",
];

export const fmtPh = (ph: number) => ph.toFixed(ph >= 10 ? 1 : 2);

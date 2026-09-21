/**
 * Datos y modelo del laboratorio "El descubrimiento de la célula"
 * (CNEYT-VI, progresión 2; actividades CNEYT-VI-P10-A1…A9).
 *
 * Anclas:
 *   - A1 lectura «El descubrimiento de la célula y el nacimiento de la teoría
 *     celular»: marco teórico verbatim (5 párrafos + preguntas).
 *   - A2 ejercicio matemático «La escala de la célula y la cronología del
 *     descubrimiento»: reto numérico evaluable (incisos a y b) y, en el modo
 *     «Construye la teoría», el orden cronológico del inciso c y los
 *     postulados del inciso d.
 *   - A4 verdadero/falso: hechos. A5 glosario: 10 términos. A6 completa el texto.
 *
 * Todo lo que no es verbatim es MODELO con cifras reales:
 *   - Aumento total = ocular × objetivo; tamaño real = tamaño aparente ÷ aumento.
 *   - Límite de difracción de Abbe (1873): d = λ / (2·AN), con λ = 550 nm.
 *   - El ojo distingue ≈ 0.1 mm a 25 cm (A2): la resolución efectiva combina la
 *     del instrumento y la del ojo que mira la imagen aumentada.
 *   - Campo de visión: número de campo de 18 mm con ocular de 10× → el campo
 *     real mide 180 000 µm ÷ aumento total.
 *   - Microscopio de Utrecht de Leeuwenhoek: 266×, resolución medida 1.35 µm.
 *     Las resoluciones del microscopio de Hooke, de las lentes menores de
 *     Leeuwenhoek y del acromático del siglo XIX son ESTIMACIONES.
 *   - Hooke (Micrographia, 1665, obs. XVIII): unas 60 celdas en 1/18 de pulgada
 *     → 1080 por pulgada → 1 259 712 000 por pulgada cúbica.
 *
 * Datos puros (sin three ni React).
 */

import type { TextoHuecosData } from "./_mecanica-huecos";
import type { RetoNumericoData } from "./_reto-numerico";

/* ── Utilidades ───────────────────────────────────────────────────────── */

export function num(x: number, dec = 0): string {
  const s = Math.abs(x).toFixed(dec);
  const [ent, frac] = s.split(".");
  const conMiles = ent!.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${x < 0 ? "−" : ""}${conMiles}${frac ? `.${frac}` : ""}`;
}

/** Número sin ceros de más: 0.42, 1.35, 250. */
export function numCorto(x: number): string {
  if (x >= 100) return num(x, 0);
  if (x >= 10) return num(x, x % 1 === 0 ? 0 : 1);
  if (x >= 1) return num(x, Math.abs(x - Math.round(x * 10) / 10) < 1e-9 ? 1 : 2).replace(/\.0$/, "");
  return num(x, 2);
}

/** Longitud en µm expresada en la unidad más legible (mm, µm o nm). */
export function longitud(um: number): string {
  if (um >= 1000) return `${numCorto(um / 1000)} mm`;
  if (um >= 1) return `${numCorto(um)} µm`;
  return `${numCorto(um * 1000)} nm`;
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

/** Pseudoaleatorio determinista en [0,1) para una celda (i, j) y una semilla. */
export function hash2(i: number, j: number, semilla = 0): number {
  let h = Math.imul(i | 0, 374761393) + Math.imul(j | 0, 668265263) + Math.imul(semilla | 0, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

export function estrellasPorErrores(errores: number): number {
  return errores === 0 ? 3 : errores <= 2 ? 2 : 1;
}

/* ── Modos ────────────────────────────────────────────────────────────── */

export type Modo = "instrumentos" | "medicion" | "teoria";
export const MODOS: Modo[] = ["instrumentos", "medicion", "teoria"];

export const MODOS_DEF: Record<Modo, { etq: string; subtitulo: string; icono: string; color: string }> = {
  instrumentos: { etq: "Microscopios de la historia", subtitulo: "La misma muestra, de Hooke al electrónico", icono: "fa-microscope", color: "#38bdf8" },
  medicion: { etq: "Mide como microscopista", subtitulo: "Aumento total y tamaño real", icono: "fa-ruler-combined", color: "#fbbf24" },
  teoria: { etq: "Construye la teoría celular", subtitulo: "Cada evidencia levanta un postulado", icono: "fa-landmark", color: "#a78bfa" },
};

/* ════════════════════════════════════════════════════════════════════════
 * 1. INSTRUMENTOS Y RESOLUCIÓN
 * ════════════════════════════════════════════════════════════════════════ */

/** Longitud de onda media de la luz visible usada en el modelo (nm). */
export const LAMBDA_NM = 550;
/** Lo más pequeño que distingue el ojo humano a 25 cm (A2): 0.1 mm. */
export const LIMITE_OJO_UM = 100;
/** Campo real = CAMPO_APARENTE_UM ÷ aumento (número de campo 18 mm con ocular 10×). */
export const CAMPO_APARENTE_UM = 180000;

/** Límite de Abbe d = λ/(2·AN), en µm. */
export function abbeUm(na: number): number {
  return LAMBDA_NM / (2 * na) / 1000;
}

export type InstrumentoId = "ojo" | "hooke" | "leeuwenhoek" | "acromatico" | "moderno" | "electronico";

export interface Ajuste {
  id: string;
  etq: string;
  aumento: number;
  /** Resolución propia del instrumento (µm); el ojo se suma aparte. */
  resUm: number;
  /** true si la resolución es una estimación (no una medición). */
  estimado: boolean;
  ocular?: number;
  objetivo?: number;
  na?: number;
}

export interface Instrumento {
  id: InstrumentoId;
  etq: string;
  corto: string;
  anio: string;
  icono: string;
  descripcion: string;
  ajustes: Ajuste[];
  /** El microscopio electrónico no ve colores. */
  enGris: boolean;
}

const aj = (ocular: number, objetivo: number, na: number): Ajuste => ({
  id: `${ocular}x${objetivo}`,
  etq: `${ocular * objetivo}× (${ocular}× · ${objetivo}×)`,
  aumento: ocular * objetivo,
  resUm: abbeUm(na),
  estimado: false,
  ocular,
  objetivo,
  na,
});

export const INSTRUMENTOS: Instrumento[] = [
  {
    id: "ojo",
    etq: "A simple vista",
    corto: "Ojo",
    anio: "Siempre",
    icono: "fa-eye",
    descripcion: "El ojo humano distingue objetos de unos 0.1 mm (100 µm) a 25 cm. Una célula típica de 20 µm es cinco veces más pequeña.",
    ajustes: [{ id: "1x", etq: "1× (sin aumento)", aumento: 1, resUm: 0, estimado: false }],
    enGris: false,
  },
  {
    id: "hooke",
    etq: "Microscopio compuesto de Hooke",
    corto: "Hooke",
    anio: "1665",
    icono: "fa-scroll",
    descripcion:
      "Tubo con varias lentes, forrado de cuero con adornos dorados, y una lámpara de aceite cuya luz concentraba un globo de vidrio lleno de agua. Aumentaba unas 30 a 50 veces, pero sus lentes deformaban los colores y los bordes.",
    ajustes: [
      { id: "30x", etq: "≈ 30× (tubo corto)", aumento: 30, resUm: 4, estimado: true },
      { id: "50x", etq: "≈ 50× (tubo extendido)", aumento: 50, resUm: 4, estimado: true },
    ],
    enGris: false,
  },
  {
    id: "leeuwenhoek",
    etq: "Lente simple de Leeuwenhoek",
    corto: "Leeuwenhoek",
    anio: "1674",
    icono: "fa-circle-dot",
    descripcion:
      "Una sola lente diminuta, montada entre dos placas de metal; la muestra se acercaba con tornillos. Sus microscopios que se conservan aumentan de unas 70 a 266 veces; el de Utrecht resuelve 1.35 µm.",
    ajustes: [
      { id: "70x", etq: "≈ 70× (lente débil)", aumento: 70, resUm: 4, estimado: true },
      { id: "150x", etq: "≈ 150× (lente media)", aumento: 150, resUm: 2.5, estimado: true },
      { id: "266x", etq: "266× (microscopio de Utrecht)", aumento: 266, resUm: 1.35, estimado: false },
    ],
    enGris: false,
  },
  {
    id: "acromatico",
    etq: "Compuesto acromático del siglo XIX",
    corto: "Siglo XIX",
    anio: "1830",
    icono: "fa-gem",
    descripcion:
      "Desde 1830 las lentes acromáticas (J. J. Lister) corrigieron los colores falsos del microscopio compuesto. Con instrumentos así Schleiden y Schwann vieron células en plantas y animales.",
    ajustes: [
      { id: "100x", etq: "≈ 100×", aumento: 100, resUm: 1.6, estimado: true },
      { id: "300x", etq: "≈ 300×", aumento: 300, resUm: 0.9, estimado: true },
    ],
    enGris: false,
  },
  {
    id: "moderno",
    etq: "Microscopio óptico moderno",
    corto: "Óptico",
    anio: "Hoy",
    icono: "fa-microscope",
    descripcion:
      "Ocular por objetivo. Con el objetivo de inmersión en aceite (100×, AN 1.25) llega al límite de la luz: d = λ/(2·AN) ≈ 0.2 µm. Por más que se aumente, no se distingue nada menor.",
    ajustes: [aj(10, 4, 0.1), aj(10, 10, 0.25), aj(10, 40, 0.65), aj(10, 100, 1.25), aj(20, 100, 1.25)],
    enGris: false,
  },
  {
    id: "electronico",
    etq: "Microscopio electrónico de transmisión",
    corto: "Electrónico",
    anio: "1931",
    icono: "fa-bolt",
    descripcion:
      "Knoll y Ruska (1931) usaron electrones en lugar de luz y lentes magnéticas. Su longitud de onda es miles de veces menor: en muestras biológicas distingue ≈ 2 nm. La muestra va fijada, en vacío y la imagen es en escala de grises.",
    ajustes: [
      { id: "5000x", etq: "5 000×", aumento: 5000, resUm: 0.002, estimado: false },
      { id: "20000x", etq: "20 000×", aumento: 20000, resUm: 0.002, estimado: false },
      { id: "100000x", etq: "100 000×", aumento: 100000, resUm: 0.002, estimado: false },
    ],
    enGris: true,
  },
];

export function instrumento(id: InstrumentoId): Instrumento {
  return INSTRUMENTOS.find((i) => i.id === id) ?? INSTRUMENTOS[0]!;
}

/** Resolución efectiva (µm): la del instrumento combinada con la del ojo sobre la imagen aumentada. */
export function resolucionEfectiva(a: Pick<Ajuste, "aumento" | "resUm">): number {
  const ojo = LIMITE_OJO_UM / a.aumento;
  return Math.sqrt(a.resUm * a.resUm + ojo * ojo);
}

/** Diámetro del campo de visión real (µm). */
export function campoUm(aumento: number): number {
  return CAMPO_APARENTE_UM / aumento;
}

/** Aumento útil máximo de un objetivo (regla práctica ≈ 1000 × AN). */
export function aumentoUtil(na: number): number {
  return 1000 * na;
}

/* ── Muestras ─────────────────────────────────────────────────────────── */

export type MuestraId = "corcho" | "estanque" | "cebolla" | "mejilla" | "bacterias";

export interface Rasgo {
  id: string;
  etq: string;
  /** Detalle más pequeño que hay que distinguir para verlo (µm). */
  tamUm: number;
  /** Tamaño total, para saber si cabe en el campo (µm). */
  tamMaxUm: number;
}

export interface Muestra {
  id: MuestraId;
  etq: string;
  historia: string;
  icono: string;
  rasgos: Rasgo[];
}

export const MUESTRAS: Muestra[] = [
  {
    id: "corcho",
    etq: "Lámina de corcho",
    historia: "Lo que miró Hooke en 1665: paredes de células muertas de la corteza del alcornoque.",
    icono: "fa-wine-bottle",
    rasgos: [
      { id: "lamina", etq: "La lámina completa (≈ 3 mm)", tamUm: 300, tamMaxUm: 3000 },
      { id: "celdas", etq: "Celdas del corcho (≈ 24 µm)", tamUm: 24, tamMaxUm: 24 },
      { id: "pared", etq: "Grosor de la pared (≈ 1.5 µm)", tamUm: 1.5, tamMaxUm: 1.5 },
    ],
  },
  {
    id: "estanque",
    etq: "Gota de agua de estanque",
    historia: "Como las gotas en las que Leeuwenhoek vio sus «animáculos» desde 1674.",
    icono: "fa-droplet",
    rasgos: [
      { id: "paramecio", etq: "Paramecio, protozoo de una célula (≈ 200 µm)", tamUm: 60, tamMaxUm: 200 },
      { id: "bacterias", etq: "Bacterias (≈ 2 µm)", tamUm: 2, tamMaxUm: 2 },
      { id: "cilios", etq: "Cilios uno por uno (≈ 0.25 µm de grosor)", tamUm: 0.25, tamMaxUm: 10 },
    ],
  },
  {
    id: "cebolla",
    etq: "Epidermis de cebolla (con lugol)",
    historia: "Tejido vegetal: el tipo de observación que llevó a Schleiden (1838) a decir que las plantas están hechas de células.",
    icono: "fa-seedling",
    rasgos: [
      { id: "celulas", etq: "Células (≈ 250 × 50 µm)", tamUm: 50, tamMaxUm: 250 },
      { id: "nucleo", etq: "Núcleo (≈ 15 µm)", tamUm: 15, tamMaxUm: 15 },
      { id: "nucleolo", etq: "Nucléolos (≈ 3 µm)", tamUm: 3, tamMaxUm: 3 },
    ],
  },
  {
    id: "mejilla",
    etq: "Células de mejilla (azul de metileno)",
    historia: "Tejido animal: como las células que Schwann (1839) reconoció en los animales.",
    icono: "fa-face-smile",
    rasgos: [
      { id: "celulas", etq: "Células planas (≈ 60 µm)", tamUm: 60, tamMaxUm: 60 },
      { id: "nucleo", etq: "Núcleo (≈ 7 µm)", tamUm: 7, tamMaxUm: 7 },
      { id: "bacterias", etq: "Bacterias de la boca (≈ 1 µm)", tamUm: 1, tamMaxUm: 1 },
    ],
  },
  {
    id: "bacterias",
    etq: "Bacterias E. coli con virus",
    historia: "Bacterias atacadas por bacteriófagos T4: lo que solo el microscopio electrónico pudo mostrar.",
    icono: "fa-bacterium",
    rasgos: [
      { id: "bacteria", etq: "Bacteria E. coli (≈ 2 × 0.8 µm)", tamUm: 0.8, tamMaxUm: 2 },
      { id: "fagos", etq: "Bacteriófagos T4 (cabeza ≈ 90 nm)", tamUm: 0.09, tamMaxUm: 0.2 },
      { id: "ribosomas", etq: "Ribosomas (≈ 20 nm)", tamUm: 0.02, tamMaxUm: 0.02 },
    ],
  },
];

export function muestra(id: MuestraId): Muestra {
  return MUESTRAS.find((m) => m.id === id) ?? MUESTRAS[0]!;
}

export type EstadoRasgo = "visible" | "borroso" | "grande";

export function estadoRasgo(r: Rasgo, a: Pick<Ajuste, "aumento" | "resUm">): EstadoRasgo {
  if (r.tamUm < resolucionEfectiva(a)) return "borroso";
  if (r.tamMaxUm > campoUm(a.aumento)) return "grande";
  return "visible";
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. MEDICIÓN
 * ════════════════════════════════════════════════════════════════════════ */

export const OBJETIVOS_REV = [
  { x: 4, na: 0.1, color: "#ef4444" },
  { x: 10, na: 0.25, color: "#facc15" },
  { x: 40, na: 0.65, color: "#38bdf8" },
  { x: 100, na: 1.25, color: "#f8fafc" },
] as const;
export const OCULARES = [10, 15] as const;
export type ObjetivoX = (typeof OBJETIVOS_REV)[number]["x"];
export type OcularX = (typeof OCULARES)[number];

export interface Mision {
  id: string;
  titulo: string;
  enunciado: string;
  muestra: MuestraId;
  objetivo: ObjetivoX;
  ocular: OcularX;
  /** Qué se responde. */
  pide: "aumento" | "tamano" | "hooke";
  /** Centro del campo (µm) para que el objeto quede a la vista. */
  centro: [number, number];
  /** Tamaño real del objeto que se mide (µm); dibuja el calibrador sobre él. */
  realUm?: number;
  /** Semiejes (µm) del marco punteado que señala el objeto que se mide. */
  marcoUm?: [number, number];
  respuesta: number;
  tolerancia: number;
  unidad: string;
  etqRespuesta: string;
  explica: string;
}

export const MISIONES: Mision[] = [
  {
    id: "m1",
    titulo: "1 · Aumento total",
    enunciado: "Gira el revólver al objetivo de 40× y deja el ocular de 10×. ¿Cuántas veces aumenta el microscopio la imagen?",
    muestra: "cebolla",
    objetivo: 40,
    ocular: 10,
    pide: "aumento",
    centro: [0, 0],
    respuesta: 400,
    tolerancia: 0,
    unidad: "×",
    etqRespuesta: "Aumento total",
    explica: "El ocular vuelve a aumentar la imagen que forma el objetivo, así que los aumentos se multiplican: 10 × 40 = 400×.",
  },
  {
    id: "m2",
    titulo: "2 · Célula de cebolla",
    enunciado: "Con el objetivo de 10× y el ocular de 10×, mide con el calibrador el largo de la célula del centro y calcula su tamaño real.",
    muestra: "cebolla",
    objetivo: 10,
    ocular: 10,
    pide: "tamano",
    centro: [0, 0],
    realUm: 250,
    marcoUm: [125, 25],
    respuesta: 250,
    tolerancia: 15,
    unidad: "µm",
    etqRespuesta: "Largo real",
    explica: "La célula mide 25 mm en la imagen. Tamaño real = 25 mm ÷ 100 = 0.25 mm = 250 µm.",
  },
  {
    id: "m3",
    titulo: "3 · Célula de mejilla",
    enunciado: "Pon el objetivo de 40× con el ocular de 10×. Mide el diámetro de la célula de mejilla del centro y calcula su tamaño real.",
    muestra: "mejilla",
    objetivo: 40,
    ocular: 10,
    pide: "tamano",
    centro: [0, 0],
    realUm: 60,
    marcoUm: [30, 30],
    respuesta: 60,
    tolerancia: 4,
    unidad: "µm",
    etqRespuesta: "Diámetro real",
    explica: "Mide 24 mm en la imagen. Tamaño real = 24 mm ÷ 400 = 0.06 mm = 60 µm.",
  },
  {
    id: "m4",
    titulo: "4 · Un paramecio",
    enunciado: "Cambia al ocular de 15× con el objetivo de 10×. Mide el largo del paramecio y calcula su tamaño real.",
    muestra: "estanque",
    objetivo: 10,
    ocular: 15,
    pide: "tamano",
    centro: [0, 0],
    realUm: 200,
    marcoUm: [100, 30],
    respuesta: 200,
    tolerancia: 12,
    unidad: "µm",
    etqRespuesta: "Largo real",
    explica: "Ahora el aumento es 15 × 10 = 150×. Mide 30 mm en la imagen: 30 mm ÷ 150 = 0.2 mm = 200 µm.",
  },
  {
    id: "m5",
    titulo: "5 · El núcleo",
    enunciado: "Con el objetivo de inmersión de 100× y el ocular de 10×, mide el núcleo de la célula de cebolla y calcula su tamaño real.",
    muestra: "cebolla",
    objetivo: 100,
    ocular: 10,
    pide: "tamano",
    centro: [60, 0],
    realUm: 15,
    marcoUm: [7.5, 5.5],
    respuesta: 15,
    tolerancia: 1,
    unidad: "µm",
    etqRespuesta: "Diámetro real",
    explica: "A 1000× el núcleo mide 15 mm en la imagen: 15 mm ÷ 1000 = 0.015 mm = 15 µm.",
  },
  {
    id: "m6",
    titulo: "6 · La cuenta de Hooke",
    enunciado:
      "Hooke escribió que contaba unas 60 celdas en fila en la dieciochoava parte de una pulgada (la barra amarilla). Con el objetivo de 10× y el ocular de 10×, ¿cuántas celdas habría en una pulgada completa?",
    muestra: "corcho",
    objetivo: 10,
    ocular: 10,
    pide: "hooke",
    centro: [0, 0],
    respuesta: 1080,
    tolerancia: 0,
    unidad: "celdas",
    etqRespuesta: "Celdas por pulgada",
    explica:
      "60 × 18 = 1080 celdas por pulgada. Como una pulgada son 25.4 mm, cada celda mide 25.4 mm ÷ 1080 ≈ 23.5 µm. Hooke siguió la cuenta: 1080 × 1080 = 1 166 400 en una pulgada cuadrada y 1080³ = 1 259 712 000 en una pulgada cúbica, las cifras que publicó en Micrographia.",
  },
];

/** 1/18 de pulgada en µm (la barra de Hooke). */
export const DIECIOCHOAVO_PULGADA_UM = 25400 / 18;

/* ════════════════════════════════════════════════════════════════════════
 * 3. LA TEORÍA CELULAR
 * ════════════════════════════════════════════════════════════════════════ */

export type Pilar = "estructural" | "funcional" | "origen";
export const PILARES: Pilar[] = ["estructural", "funcional", "origen"];
export const PILAR_DEF: Record<Pilar, { etq: string; postulado: string; color: string; icono: string }> = {
  estructural: { etq: "Unidad estructural", postulado: "Todos los seres vivos están formados por una o más células.", color: "#38bdf8", icono: "fa-cubes" },
  funcional: { etq: "Unidad funcional", postulado: "La célula es la unidad más pequeña capaz de realizar las funciones vitales.", color: "#34d399", icono: "fa-gears" },
  origen: { etq: "Unidad de origen", postulado: "Toda célula proviene de otra célula preexistente.", color: "#fbbf24", icono: "fa-code-branch" },
};

export interface HitoTeoria {
  id: string;
  anio: number;
  etqAnio: string;
  quien: string;
  que: string;
  pilar: Pilar;
  porque: string;
}

export const HITOS: HitoTeoria[] = [
  {
    id: "hooke",
    anio: 1665,
    etqAnio: "1665",
    quien: "Robert Hooke",
    que: "Observa una lámina de corcho dividida en celdas y las llama «cells» (Micrographia).",
    pilar: "estructural",
    porque: "Es la primera vez que alguien ve un tejido dividido en compartimentos: la estructura celular. Solo veía las paredes de células muertas, pero nombró la unidad.",
  },
  {
    id: "leeuwenhoek",
    anio: 1674,
    etqAnio: "1674",
    quien: "Anton van Leeuwenhoek",
    que: "Ve en una gota de agua «animáculos» de una sola célula que nadan y se alimentan.",
    pilar: "funcional",
    porque: "Un ser de una sola célula se mueve, come y vive por su cuenta: una célula basta para realizar todas las funciones vitales.",
  },
  {
    id: "schleiden",
    anio: 1838,
    etqAnio: "1838",
    quien: "Matthias Schleiden",
    que: "Concluye que todas las plantas están formadas por células.",
    pilar: "estructural",
    porque: "Generaliza: no es un tejido raro, todas las plantas están construidas con células.",
  },
  {
    id: "schwann",
    anio: 1839,
    etqAnio: "1839",
    quien: "Theodor Schwann",
    que: "Extiende la idea a los animales en sus «Investigaciones microscópicas».",
    pilar: "estructural",
    porque: "Con plantas y animales hechos de lo mismo, la célula se vuelve la unidad estructural de todos los seres vivos.",
  },
  {
    id: "remak",
    anio: 1852,
    etqAnio: "1852",
    quien: "Robert Remak",
    que: "En embriones de pollo y de rana ve que las células nuevas se forman cuando otra célula se divide.",
    pilar: "origen",
    porque:
      "Schleiden y Schwann creían que las células podían formarse a partir de un líquido sin estructura (el «citoblastema»). Remak mostró que nacen por división: la teoría se corrigió.",
  },
  {
    id: "virchow",
    anio: 1855,
    etqAnio: "1855",
    quien: "Rudolf Virchow",
    que: "Resume la idea en «omnis cellula e cellula»: toda célula proviene de otra célula.",
    pilar: "origen",
    porque: "Es el tercer postulado: ninguna célula aparece de la nada; siempre viene de una célula anterior.",
  },
  {
    id: "pasteur-fermentacion",
    anio: 1857,
    etqAnio: "1857",
    quien: "Louis Pasteur",
    que: "Demuestra que la fermentación láctica la producen microorganismos vivos.",
    pilar: "funcional",
    porque: "Una transformación química que parecía «espontánea» es trabajo de células vivas: las funciones de la vida ocurren en las células.",
  },
  {
    id: "pasteur-matraz",
    anio: 1860,
    etqAnio: "1859–1862",
    quien: "Louis Pasteur",
    que: "Con matraces de cuello de cisne muestra que un caldo hervido no genera vida por sí solo.",
    pilar: "origen",
    porque: "Si los microbios no surgen del caldo, la vida celular solo viene de vida celular previa: derrota la generación espontánea.",
  },
  {
    id: "engelmann",
    anio: 1882,
    etqAnio: "1882",
    quien: "Theodor Engelmann",
    que: "Ilumina un alga filamentosa con luz de colores: las bacterias que buscan oxígeno se juntan junto a sus células en la luz roja y la azul.",
    pilar: "funcional",
    porque: "Muestra que la fotosíntesis, una función vital, ocurre dentro de las células del alga.",
  },
];

/** Inciso c) del ejercicio A2, en el orden en que lo presenta el enunciado. */
export const ORDEN_A2C: { id: string; texto: string; anio: number }[] = [
  { id: "schwann", texto: "Schwann extiende la teoría a los animales", anio: 1839 },
  { id: "hooke", texto: "Hooke observa las celdas del corcho", anio: 1665 },
  { id: "virchow", texto: "Virchow afirma que toda célula viene de otra", anio: 1855 },
  { id: "schleiden", texto: "Schleiden concluye que las plantas son células", anio: 1838 },
];
export const ORDEN_CORRECTO = [...ORDEN_A2C].sort((a, b) => a.anio - b.anio).map((x) => x.id);

/** Los instrumentos que sostienen la teoría (cimientos del templo). */
export const CIMIENTOS: { anio: string; etq: string }[] = [
  { anio: "1665", etq: "Microscopio compuesto" },
  { anio: "1674", etq: "Lente simple" },
  { anio: "1830", etq: "Lente acromática" },
  { anio: "1873", etq: "Límite de Abbe" },
  { anio: "1931", etq: "Microscopio electrónico" },
];

/* ── Experimento de Pasteur ───────────────────────────────────────────── */

export type FasePasteur = "listo" | "hirviendo" | "reposo" | "fin" | "roto" | "finRoto";
export const DIAS_REPOSO = 30;
export const DIAS_ROTO = 6;
export const T_HERVIR = 2600;
export const T_REPOSO = 6500;
export const T_ROTO = 4200;

/** Turbidez (0 claro … 1 turbio) de un caldo contaminado hace `dias` días (curva ilustrativa). */
export function turbidez(dias: number): number {
  if (dias <= 0) return 0;
  const t = 1 / (1 + Math.exp(-(dias - 2) * 2.4));
  const t0 = 1 / (1 + Math.exp(2 * 2.4));
  return Math.max(0, Math.min(1, (t - t0) / (1 - t0)));
}

/* ── Estrellas: ¿con qué lo verías? ────────────────────────────────────── */

export type Visor = "ojo" | "optico" | "electronico";
export const VISORES: { id: Visor; etq: string; icono: string }[] = [
  { id: "ojo", etq: "A simple vista", icono: "fa-eye" },
  { id: "optico", etq: "Microscopio óptico", icono: "fa-microscope" },
  { id: "electronico", etq: "Microscopio electrónico", icono: "fa-bolt" },
];
/** Límite del microscopio óptico usado para clasificar (µm). */
export const LIMITE_OPTICO_UM = 0.2;

export function visorMinimo(um: number): Visor {
  if (um >= LIMITE_OJO_UM) return "ojo";
  if (um >= LIMITE_OPTICO_UM) return "optico";
  return "electronico";
}

export const OBJETOS: { texto: string; um: number }[] = [
  { texto: "El alga Acetabularia: una sola célula de unos 4 cm", um: 40000 },
  { texto: "Una fibra de algodón: una sola célula de unos 3 cm de largo", um: 30000 },
  { texto: "El óvulo de una rana: una célula de alrededor de 1 mm", um: 1000 },
  { texto: "Un glóbulo rojo humano (≈ 7.5 µm)", um: 7.5 },
  { texto: "Una bacteria E. coli (≈ 2 µm de largo)", um: 2 },
  { texto: "El núcleo de una célula de mejilla (≈ 7 µm)", um: 7 },
  { texto: "La cabeza de un espermatozoide humano (≈ 5 µm)", um: 5 },
  { texto: "El virus de la influenza (≈ 100 nm)", um: 0.1 },
  { texto: "Un ribosoma (≈ 20 nm)", um: 0.02 },
  { texto: "El grosor de la membrana celular (≈ 8 nm)", um: 0.008 },
  { texto: "La cabeza de un bacteriófago T4 (≈ 90 nm)", um: 0.09 },
];

export function rondaObjetos(rnd: () => number, n = 6): number[] {
  const porVisor = (v: Visor) => OBJETOS.map((o, i) => ({ o, i })).filter((x) => visorMinimo(x.o.um) === v).map((x) => x.i);
  const baraja = (xs: number[]) => {
    const a = [...xs];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j]!, a[i]!];
    }
    return a;
  };
  const cada = Math.floor(n / 3);
  return baraja([...baraja(porVisor("ojo")).slice(0, cada), ...baraja(porVisor("optico")).slice(0, cada), ...baraja(porVisor("electronico")).slice(0, n - 2 * cada)]);
}

export function porqueVisor(um: number): string {
  const v = visorMinimo(um);
  if (v === "ojo") return `Mide ${longitud(um)}: más que los 0.1 mm que distingue el ojo, así que se ve sin instrumento.`;
  if (v === "optico") return `Mide ${longitud(um)}: menos de 0.1 mm (el ojo no lo ve), pero más que los 0.2 µm del límite de la luz. Basta un microscopio óptico.`;
  return `Mide ${longitud(um)}: por debajo de los 0.2 µm que permite la luz visible. Solo el microscopio electrónico lo resuelve.`;
}

/* ════════════════════════════════════════════════════════════════════════
 * Contenido VERBATIM
 * ════════════════════════════════════════════════════════════════════════ */

export const TITULO_A1 = "El descubrimiento de la célula y el nacimiento de la teoría celular";

/** Lectura A1 — cinco párrafos, verbatim. */
export const LECTURA_A1: string[] = [
  "Hoy sabemos que todos los seres vivos estamos hechos de CÉLULAS, pero ese conocimiento es relativamente reciente y dependió por completo de la TECNOLOGÍA: sin el microscopio, la célula habría sido invisible para siempre. La historia de su descubrimiento muestra cómo la ciencia avanza cuando se combinan la curiosidad, la observación y las herramientas adecuadas.",
  "EL MICROSCOPIO ABRE UN MUNDO. A finales del siglo XVI y durante el XVII, la invención y mejora del MICROSCOPIO permitió ver lo que ningún ojo había visto. En 1665, el inglés ROBERT HOOKE observó con su microscopio una fina lámina de corcho y vio que estaba formada por pequeñas cavidades, como las celdas de un panal; las llamó «cells» (celdas o CÉLULAS). En realidad veía las paredes de células vegetales muertas, pero acuñó la palabra que usamos hasta hoy. Poco después, el holandés ANTON VAN LEEUWENHOEK, puliendo lentes de gran calidad, fue el primero en observar organismos vivos microscópicos —bacterias, protozoos, espermatozoides—, a los que llamó «animáculos». Por primera vez la humanidad veía la vida a escala microscópica.",
  "EL CAMINO HACIA UNA TEORÍA. Durante casi dos siglos se acumularon observaciones de células en plantas y animales, pero faltaba una idea que las unificara. Eso llegó en el siglo XIX, gracias a la mejora de los microscopios y al trabajo de varios científicos. En 1838, el botánico MATTHIAS SCHLEIDEN concluyó que todas las PLANTAS están formadas por células. En 1839, el zoólogo THEODOR SCHWANN extendió la idea a los ANIMALES: también están hechos de células. Juntos propusieron que la célula es la unidad básica de todos los seres vivos. Faltaba una pieza: ¿de dónde salen las células nuevas? En 1855, el médico RUDOLF VIRCHOW respondió con su célebre frase «omnis cellula e cellula» («toda célula proviene de otra célula»), descartando la idea de generación espontánea a nivel celular.",
  "LA TEORÍA CELULAR Y SUS POSTULADOS. La unión de estas aportaciones dio lugar a la TEORÍA CELULAR, uno de los pilares de la biología, que se resume en tres postulados: (1) todos los seres vivos están formados por una o más células —la célula es la unidad ESTRUCTURAL de la vida—; (2) la célula es la unidad FUNCIONAL, es decir, la unidad más pequeña capaz de realizar las funciones vitales; y (3) toda célula proviene de otra célula preexistente —la célula es la unidad de ORIGEN o reproducción—. Estos tres postulados explican por qué la célula es la «unidad fundamental» de los organismos vivos.",
  "POR QUÉ IMPORTA. La teoría celular cambió para siempre nuestra comprensión de la vida: unificó a todos los seres vivos bajo una misma base, desde una bacteria hasta una ballena o un ser humano (que tiene unos 37 billones de células). Además, es el ejemplo perfecto de cómo el desarrollo tecnológico (el microscopio, y más tarde el microscopio electrónico) impulsa el avance científico. Hoy, esa misma lógica sigue viva en México y el mundo: la microscopía y la biología celular son la base de la medicina, la biotecnología y la investigación en salud. Comprender cómo se descubrió la célula es comprender cómo se construye el conocimiento científico.",
];

export const PREGUNTAS: string[] = [
  "¿Qué aportaron Robert Hooke y Anton van Leeuwenhoek al descubrimiento de la célula?",
  "¿Quiénes formularon la teoría celular y qué aportó cada uno?",
  "¿Cuáles son los tres postulados de la teoría celular?",
];

/** Hechos: quiz A4 (verdadero/falso), cada enunciado con su retroalimentación, verbatim. */
export const HECHOS: string[] = [
  "Verdadero: «Robert Hooke acuñó la palabra «célula» al observar el corcho con un microscopio en 1665». Correcto: vio cavidades como celdas de panal y las llamó «cells» (células).",
  "Verdadero: «Anton van Leeuwenhoek fue el primero en observar microorganismos vivos (sus «animáculos»)». Correcto: con lentes de gran calidad vio bacterias y protozoos por primera vez.",
  "Falso: «La teoría celular fue formulada por un solo científico de forma instantánea». Falso: fue un proceso histórico con aportes de Schleiden (plantas), Schwann (animales) y Virchow (toda célula de otra célula), entre otros.",
  "Verdadero: «Uno de los postulados de la teoría celular es que toda célula proviene de otra célula preexistente». Correcto: es la frase de Virchow «omnis cellula e cellula» (unidad de origen).",
  "Verdadero: «La célula es la unidad estructural y funcional de los seres vivos». Correcto: es la unidad más pequeña que forma a los organismos y que realiza las funciones vitales.",
  "Falso: «El descubrimiento de la célula fue posible sin ningún instrumento, a simple vista». Falso: la célula es demasiado pequeña para el ojo humano; fue indispensable el microscopio.",
];

/** Glosario A5 — verbatim. */
export const GLOSARIO: { termino: string; definicion: string; ejemplo: string }[] = [
  { termino: "Célula", definicion: "Unidad fundamental (estructural, funcional y de origen) de todos los seres vivos.", ejemplo: "Un ser humano tiene unos 37 billones de células." },
  { termino: "Microscopio", definicion: "Instrumento que aumenta la imagen de objetos diminutos, invisibles al ojo.", ejemplo: "Sin él la célula no podría haberse descubierto." },
  { termino: "Robert Hooke", definicion: "Científico inglés que en 1665 observó el corcho y acuñó la palabra «célula».", ejemplo: "Vio celdas como las de un panal." },
  { termino: "Anton van Leeuwenhoek", definicion: "Holandés que observó por primera vez microorganismos vivos.", ejemplo: "Los llamó «animáculos»." },
  { termino: "Matthias Schleiden", definicion: "Botánico que concluyó (1838) que todas las plantas están hechas de células.", ejemplo: "Primer pilar de la teoría celular." },
  { termino: "Theodor Schwann", definicion: "Zoólogo que extendió (1839) la idea celular a los animales.", ejemplo: "Unificó plantas y animales bajo la célula." },
  { termino: "Rudolf Virchow", definicion: "Médico que afirmó (1855) que toda célula proviene de otra célula.", ejemplo: "«Omnis cellula e cellula»." },
  { termino: "Teoría celular", definicion: "Principio de que la célula es la unidad fundamental de la vida.", ejemplo: "Tiene tres postulados." },
  { termino: "Unidad estructural", definicion: "Todos los seres vivos están formados por una o más células.", ejemplo: "Primer postulado." },
  { termino: "Unidad de origen", definicion: "Toda célula proviene de otra célula preexistente.", ejemplo: "Tercer postulado (Virchow)." },
];

export const ACTIVIDAD_A5 =
  "Ordena cronológicamente a Hooke, Schwann, Schleiden y Virchow, y di con cuál de los tres postulados de la teoría celular se relaciona más directamente la frase de Virchow.";

export const FUENTE =
  "CEN Bachillerato — CNEYT-VI, progresión 2 (actividades CNEYT-VI-P10): lectura A1 (MCCEMS 2025 — Ciencias Naturales, Experimentales y Tecnología VI «¿Qué es la vida? Evolución y diversidad biológica»), ejercicio A2, quiz A4, glosario A5 y texto A6.";

export const PROBLEMA =
  "Una célula típica mide unos 20 µm, cinco veces menos de lo que distingue el ojo. ¿Cómo llegó la humanidad a saber que todos los seres vivos están hechos de células? Aquí miras la misma muestra con los microscopios de cada época, mides células como un microscopista y levantas, evidencia por evidencia, los tres postulados de la teoría celular.";

export const INSTRUCCIONES: string[] = [
  "En Microscopios de la historia, elige un instrumento y una muestra y cambia el aumento: la lista te dice qué detalles alcanzas a distinguir y por qué.",
  "En Mide como microscopista, gira el revólver, cambia el ocular, mide con el calibrador y calcula el tamaño real en cada misión.",
  "En Construye la teoría celular, ordena los hitos del ejercicio A2, coloca cada evidencia en su postulado y repite el experimento de Pasteur.",
  "Gana estrellas en «¿Con qué lo verías?» y resuelve el reto A2 y el texto A6.",
];

export const IDEAS: string[] = [
  "Sin tecnología no hay descubrimiento: la célula es más pequeña que lo que distingue el ojo (0.1 mm).",
  "Aumento total = aumento del ocular × aumento del objetivo.",
  "Tamaño real = tamaño en la imagen ÷ aumento total.",
  "Aumentar no basta: la resolución decide el detalle. La luz no separa nada menor de ≈ 0.2 µm; los electrones sí.",
  "La teoría celular se construyó durante casi dos siglos con aportes de muchas personas, y se corrigió en el camino.",
  "Estructural, funcional y de origen: tres postulados, tres tipos de evidencia.",
];

/** Ejercicio A2 — enunciado, contexto, pasos y respuesta verbatim. */
export const RETO_A2: RetoNumericoData = {
  titulo: "La escala de la célula y la cronología del descubrimiento (A2)",
  contexto:
    "El ejercicio aplica nociones de escala (micrómetros) para dimensionar la célula y la cronología histórica que llevó a la teoría celular, mostrando el papel del microscopio como tecnología que impulsó el descubrimiento.",
  problema:
    "a) ESCALA. Una célula animal típica mide alrededor de 20 micrómetros (µm). Sabiendo que 1 mm = 1000 µm, ¿cuántas células de 20 µm cabrían, en fila, en 1 mm?\n\nb) ¿POR QUÉ EL MICROSCOPIO? El ojo humano distingue objetos de aproximadamente 0.1 mm (100 µm) como mínimo. Explica, comparando con el tamaño de la célula (20 µm), por qué fue indispensable el microscopio para descubrir la célula.\n\nc) CRONOLOGÍA. Ordena de más antiguo a más reciente estos hitos: Schwann extiende la teoría a los animales (1839); Hooke observa las celdas del corcho (1665); Virchow afirma que toda célula viene de otra (1855); Schleiden concluye que las plantas son células (1838).\n\nd) POSTULADOS. Asocia cada postulado de la teoría celular con la palabra clave: unidad estructural, unidad funcional, unidad de origen.",
  campos: [
    { etiqueta: "a) Células de 20 µm en fila en 1 mm", objetivo: 50, tolerancia: 0, unidad: "células" },
    { etiqueta: "b) ¿Cuántas veces es la célula más pequeña que el mínimo del ojo?", objetivo: 5, tolerancia: 0, unidad: "veces" },
  ],
  pasosGuia: [
    "a) 1 mm = 1000 µm. Número de células = 1000 µm ÷ 20 µm = 50 células en fila en 1 mm.",
    "b) La célula (20 µm) es unas 5 veces más pequeña que el mínimo que ve el ojo (100 µm = 0.1 mm). Como está por debajo del límite de resolución del ojo, era invisible sin un instrumento que aumentara la imagen: por eso el microscopio fue indispensable.",
    "c) Orden cronológico: 1665 Hooke (celdas del corcho) → 1838 Schleiden (plantas) → 1839 Schwann (animales) → 1855 Virchow (toda célula de otra célula).",
    "d) Unidad estructural: todos los seres vivos están formados por células. Unidad funcional: la célula realiza las funciones vitales. Unidad de origen: toda célula proviene de otra célula.",
  ],
  respuestaFinal:
    "a) 50 células. b) La célula (20 µm) es menor que el límite del ojo (100 µm), así que se necesitó el microscopio. c) Hooke (1665) → Schleiden (1838) → Schwann (1839) → Virchow (1855). d) Estructural = formados por células; funcional = realiza funciones vitales; origen = toda célula de otra célula.",
};

/** Actividad A6 «Completa: la historia de la célula» — verbatim. */
export const HUECOS_A6: TextoHuecosData = {
  ancla: "CNEYT-VI-P10-A6 · Completa: la historia de la célula",
  instrucciones: "Escribe la palabra correcta en cada espacio.",
  partes: [
    "El descubrimiento de la célula fue posible gracias al ",
    ". En 1665, Robert ",
    " observó el corcho y acuñó la palabra «célula». Anton van ",
    " fue el primero en ver microorganismos vivos. En el siglo XIX, ",
    " concluyó que las plantas son células, ",
    " lo extendió a los animales y ",
    " afirmó que toda célula proviene de otra célula. Así nació la ",
    " celular, que dice que la célula es la unidad ",
    ", funcional y de origen de todos los seres vivos.",
  ],
  huecos: [
    { respuesta: "microscopio", alternativas: ["el microscopio"] },
    { respuesta: "Hooke", alternativas: ["hooke"] },
    { respuesta: "Leeuwenhoek", alternativas: ["leeuwenhoek", "van Leeuwenhoek"] },
    { respuesta: "Schleiden", alternativas: ["schleiden"] },
    { respuesta: "Schwann", alternativas: ["schwann"] },
    { respuesta: "Virchow", alternativas: ["virchow"] },
    { respuesta: "teoría", alternativas: ["teoria", "la teoría"] },
    { respuesta: "estructural", alternativas: ["estructura"] },
  ],
};

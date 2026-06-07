/**
 * Datos para el laboratorio "Ley de Senos y Ley de Cosenos — resolución de
 * triángulos oblicuángulos" (PM-IV-P05-A2, ejercicio_matematico; UAC PM-IV
 * "Pensamiento Matemático IV"; progresión 5: "Aplica la Ley de Senos y la Ley de
 * Cosenos en la resolución de triángulos oblicuángulos").
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabLeySenosCosenos.tsx) y la escena 3D (LeySenosCosenosScene.tsx).
 *
 * Idea pedagógica (MCCEMS 2025 — PM-IV P5): un triángulo OBLICUÁNGULO no tiene
 * ángulo recto, así que Pitágoras y SOH-CAH-TOA ya no alcanzan. Modelamos un
 * TERRENO triangular: un topógrafo quiere el lado que cruza un lago (no puede
 * medirlo con cinta), pero sí puede medir los OTROS DOS lados, a y b, y el ÁNGULO
 * C que forman entre ellos. Con eso:
 *   · LEY DE COSENOS:  c² = a² + b² − 2·a·b·cos C   →   c = √(a²+b²−2ab·cos C)
 *     (es la generalización del Teorema de Pitágoras: si C = 90°, cos C = 0 y
 *      queda c² = a² + b²).
 *   · LEY DE SENOS:    a/sen A = b/sen B = c/sen C
 *     permite hallar los ángulos restantes A y B una vez que se conoce c.
 * El ángulo C está ENTRE los lados a y b (es el ángulo "incluido"); el lado c,
 * desconocido, es el OPUESTO a ese ángulo. Todo es cálculo exacto. La escena
 * dibuja el terreno escalado para encuadrarlo, pero las etiquetas son reales.
 */

/* ── Controles ────────────────────────────────────────────────────────────── */
export const A_MIN = 10, A_MAX = 100, A_STEP = 1, A_DEF = 40;   // lado a (m)
export const B_MIN = 10, B_MAX = 100, B_STEP = 1, B_DEF = 55;   // lado b (m)
export const C_MIN = 20, C_MAX = 160, C_STEP = 1, C_DEF = 70;   // ángulo C entre a y b (°)

export interface Triangulo {
  a: number;       // lado a (m)
  b: number;       // lado b (m)
  angC: number;    // ángulo incluido C, grados
  radC: number;
  c: number;       // lado desconocido (opuesto a C), m — Ley de Cosenos
  angA: number;    // ángulo en A, grados — Ley de Senos/Cosenos
  angB: number;    // ángulo en B, grados
  area: number;    // área del triángulo, m²
  perim: number;   // perímetro, m
}

/** Resuelve el triángulo oblicuángulo dados dos lados y el ángulo incluido. */
export function calcTri(a: number, b: number, angC: number): Triangulo {
  const radC = (angC * Math.PI) / 180;
  // Ley de Cosenos: lado opuesto al ángulo conocido
  const c = Math.sqrt(Math.max(0, a * a + b * b - 2 * a * b * Math.cos(radC)));
  // Ángulos restantes por Ley de Cosenos (robusto en todo el rango)
  const cosA = c > 0 ? (b * b + c * c - a * a) / (2 * b * c) : 1;
  const cosB = c > 0 ? (a * a + c * c - b * b) / (2 * a * c) : 1;
  const angA = (Math.acos(Math.min(1, Math.max(-1, cosA))) * 180) / Math.PI;
  const angB = (Math.acos(Math.min(1, Math.max(-1, cosB))) * 180) / Math.PI;
  const area = 0.5 * a * b * Math.sin(radC);
  const perim = a + b + c;
  return { a, b, angC, radC, c, angA, angB, area, perim };
}

/* ── Las dos leyes (panel) ────────────────────────────────────────────────── */
export interface LeyDef {
  nombre: string;
  formula: string;
  uso: string;
  color: string;
}

export const LEYES: LeyDef[] = [
  {
    nombre: "Ley de Cosenos",
    formula: "c² = a² + b² − 2ab·cos C",
    uso: "halla el lado opuesto a un ángulo cuando conoces los otros dos lados y ese ángulo",
    color: "#f5d36b",
  },
  {
    nombre: "Ley de Senos",
    formula: "a / sen A = b / sen B = c / sen C",
    uso: "relaciona cada lado con el seno de su ángulo opuesto; halla los ángulos restantes",
    color: "#60a5fa",
  },
];

/* ── Escenarios guiados (terrenos / situaciones) ──────────────────────────── */
export interface Escenario {
  label: string;
  icono: string;
  a: number;
  b: number;
  angC: number;
  desc: string;
}

export const ESCENARIOS: Escenario[] = [
  { label: "Terreno", icono: "fa-draw-polygon", a: 40, b: 55, angC: 70, desc: "Predio triangular: dos lados de 40 m y 55 m con un ángulo de 70° entre ellos." },
  { label: "Lago", icono: "fa-water", a: 65, b: 48, angC: 95, desc: "Para cruzar un lago se miden las dos orillas (65 m y 48 m) y el ángulo de 95°." },
  { label: "Triángulo equilátero", icono: "fa-shapes", a: 50, b: 50, angC: 60, desc: "Dos lados iguales con 60°: el resultado también mide 50 m (equilátero)." },
  { label: "Casi recto (≈Pitágoras)", icono: "fa-square", a: 30, b: 40, angC: 90, desc: "Con C = 90° la Ley de Cosenos se vuelve Pitágoras: c = 50 m." },
  { label: "Ángulo obtuso", icono: "fa-angle-down", a: 35, b: 35, angC: 130, desc: "Un ángulo obtuso de 130° abre mucho el triángulo: el lado opuesto es el más largo." },
  { label: "Ángulo agudo", icono: "fa-angle-up", a: 60, b: 70, angC: 35, desc: "Un ángulo pequeño de 35° hace que el lado opuesto sea corto." },
];

/* ── Ideas clave ──────────────────────────────────────────────────────────── */
export const IDEAS: string[] = [
  "Un triángulo OBLICUÁNGULO no tiene ángulo recto: ni Pitágoras ni SOH-CAH-TOA bastan, por eso existen la Ley de Senos y la Ley de Cosenos.",
  "Ley de Cosenos: c² = a² + b² − 2ab·cos C. Sirve cuando conoces dos lados y el ángulo que forman, y buscas el tercer lado.",
  "Es la generalización de Pitágoras: si C = 90°, cos 90° = 0 y queda c² = a² + b².",
  "El ángulo C está ENTRE los lados a y b (ángulo incluido); el lado c que buscas es el OPUESTO a ese ángulo.",
  "Ley de Senos: a/sen A = b/sen B = c/sen C. Una vez que tienes el tercer lado, te da los ángulos que faltan.",
  "Con la misma a y b, a mayor ángulo C, más largo es el lado opuesto c (el triángulo se 'abre').",
  "El área de cualquier triángulo con dos lados y el ángulo entre ellos es A = ½·a·b·sen C.",
  "Así se mide en la vida real lo que no se puede cruzar con cinta: lagos, barrancos, terrenos irregulares (topografía y navegación).",
];

/* ── Datos / fórmulas (panel) ─────────────────────────────────────────────── */
export const DATOS: { valor: string; texto: string; icono: string }[] = [
  { valor: "c = √(a² + b² − 2ab·cos C)", texto: "lado opuesto al ángulo conocido (Ley de Cosenos)", icono: "fa-ruler-combined" },
  { valor: "a/sen A = b/sen B = c/sen C", texto: "relación lado–ángulo opuesto (Ley de Senos)", icono: "fa-scale-balanced" },
  { valor: "A + B + C = 180°", texto: "los tres ángulos internos siempre suman 180°", icono: "fa-circle-half-stroke" },
  { valor: "Área = ½·a·b·sen C", texto: "área con dos lados y el ángulo entre ellos", icono: "fa-vector-square" },
];

/* ── Formato ──────────────────────────────────────────────────────────────── */
const ES = (n: number, dec: number) =>
  n.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 }).replace("-", "−");

export const fmtNum = (n: number): string => ES(n, 3);
export const fmtNum2 = (n: number): string => ES(n, 2);
export const fmtM = (n: number): string => `${ES(n, 2)} m`;
export const fmtM2 = (n: number): string => `${ES(n, 1)} m²`;
export const fmtDeg = (n: number): string => `${ES(n, 1)}°`;

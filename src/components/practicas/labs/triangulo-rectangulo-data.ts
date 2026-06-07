/**
 * Datos para el laboratorio "Medición indirecta con razones trigonométricas"
 * (PM-IV-P03-A2, ejercicio_matematico; UAC PM-IV "Pensamiento Matemático IV";
 * progresión 3: "Define las razones trigonométricas en triángulos rectángulos y
 * las aplica en problemas de medición indirecta").
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabTrianguloRectangulo.tsx) y la escena 3D (TrianguloRectanguloScene.tsx).
 *
 * Idea pedagógica (MCCEMS 2025 — PM-IV P3): ¿cómo medir la altura de un árbol sin
 * treparlo? Te paras a una DISTANCIA d del árbol (la mides con una cinta en el
 * piso) y mides el ÁNGULO DE ELEVACIÓN θ hacia la copa con un clinómetro. Con eso
 * se forma un TRIÁNGULO RECTÁNGULO cuyos catetos son:
 *   · adyacente = d (la distancia horizontal, a la altura de tus ojos)
 *   · opuesto   = la altura del árbol POR ENCIMA de tus ojos
 * y como tan θ = opuesto / adyacente, despejamos:
 *   opuesto = d · tan θ      →      H = (altura de tus ojos) + d · tan θ
 * Eso es la MEDICIÓN INDIRECTA: deducir lo que no puedes alcanzar a partir de algo
 * que sí puedes medir (una distancia y un ángulo). La línea de visión hacia la
 * copa es la HIPOTENUSA = d / cos θ. Todo es cálculo exacto.
 */

/* ── Controles ────────────────────────────────────────────────────────────── */
export const D_MIN = 2, D_MAX = 60, D_STEP = 1, D_DEF = 18;       // distancia (m)
export const ANG_MIN = 10, ANG_MAX = 80, ANG_STEP = 1, ANG_DEF = 34; // ángulo (°)
export const EYE = 1.6;  // altura del observador / clinómetro (m)

export interface Medicion {
  d: number;          // distancia horizontal (adyacente), m
  angDeg: number;     // ángulo de elevación, grados
  rad: number;
  sin: number;
  cos: number;
  tan: number;
  ady: number;        // cateto adyacente = d
  opuesto: number;    // cateto opuesto = d·tan θ (altura sobre los ojos)
  hip: number;        // hipotenusa = línea de visión = d/cos θ
  H: number;          // altura total del objeto = EYE + opuesto
  eye: number;        // altura del observador
}

/** Resuelve el triángulo rectángulo de la medición indirecta (exacto). */
export function calcMed(d: number, angDeg: number): Medicion {
  const rad = (angDeg * Math.PI) / 180;
  const sin = Math.sin(rad);
  const cos = Math.cos(rad);
  const tan = Math.tan(rad);
  const ady = d;
  const opuesto = d * tan;
  const hip = d / cos;
  const H = EYE + opuesto;
  return { d, angDeg, rad, sin, cos, tan, ady, opuesto, hip, H, eye: EYE };
}

/* ── SOH-CAH-TOA (definición de las razones) ──────────────────────────────── */
export interface RazonDef {
  nombre: string;
  abrev: string;
  formula: string;     // en términos de cateto/hipotenusa
  mnemo: string;       // SOH / CAH / TOA
  color: string;
}

export const RAZONES: RazonDef[] = [
  { nombre: "seno",     abrev: "sen θ", formula: "opuesto / hipotenusa", mnemo: "SOH", color: "#34D399" },
  { nombre: "coseno",   abrev: "cos θ", formula: "adyacente / hipotenusa", mnemo: "CAH", color: "#60a5fa" },
  { nombre: "tangente", abrev: "tan θ", formula: "opuesto / adyacente", mnemo: "TOA", color: "#fbbf24" },
];

/* ── Escenarios guiados (objetos a medir) ─────────────────────────────────── */
export interface Escenario {
  label: string;
  icono: string;
  d: number;
  angDeg: number;
  desc: string;
}

export const ESCENARIOS: Escenario[] = [
  { label: "Árbol", icono: "fa-tree", d: 18, angDeg: 32, desc: "A 18 m de un árbol, el ángulo de elevación a la copa es 32°." },
  { label: "Poste de luz", icono: "fa-lightbulb", d: 9, angDeg: 42, desc: "A 9 m de un poste, el ángulo a su punta es 42°." },
  { label: "Edificio", icono: "fa-building", d: 28, angDeg: 55, desc: "A 28 m de un edificio, el ángulo a la azotea es 55°." },
  { label: "Asta bandera", icono: "fa-flag", d: 14, angDeg: 46, desc: "A 14 m del asta, el ángulo a la bandera es 46°." },
  { label: "Torre", icono: "fa-tower-observation", d: 40, angDeg: 60, desc: "A 40 m de una torre, el ángulo a su cima es 60°." },
  { label: "Pirámide", icono: "fa-mountain", d: 50, angDeg: 33, desc: "A 50 m de una pirámide (didáctico), el ángulo a su vértice es 33°." },
];

/* ── Ideas clave ──────────────────────────────────────────────────────────── */
export const IDEAS: string[] = [
  "Medición indirecta: para hallar una altura inalcanzable basta medir una distancia en el piso y un ángulo de elevación.",
  "En un triángulo rectángulo, respecto al ángulo θ: el cateto OPUESTO está enfrente de θ y el cateto ADYACENTE está pegado a θ.",
  "tan θ = opuesto / adyacente; como conoces el adyacente (la distancia d) y el ángulo, despejas: opuesto = d · tan θ.",
  "La altura real del objeto es H = (altura de tus ojos) + d · tan θ: hay que sumar la altura del observador o del clinómetro.",
  "SOH-CAH-TOA: Seno = Opuesto/Hipotenusa, Coseno = Adyacente/Hipotenusa, Tangente = Opuesto/Adyacente.",
  "La línea de visión hacia la cima es la hipotenusa, y mide d / cos θ.",
  "Con la misma distancia, a mayor ángulo de elevación, mayor altura: la altura crece como la tangente del ángulo.",
];

/* ── Datos / fórmulas (panel) ─────────────────────────────────────────────── */
export const DATOS: { valor: string; texto: string; icono: string }[] = [
  { valor: "H = altura ojos + d·tan θ", texto: "altura total del objeto medido", icono: "fa-ruler-vertical" },
  { valor: "tan θ = opuesto / adyacente", texto: "la razón que usa los dos catetos", icono: "fa-percent" },
  { valor: "hipotenusa = d / cos θ", texto: "la línea de visión hacia la cima", icono: "fa-ruler-combined" },
  { valor: "θ con clinómetro · d con cinta", texto: "lo único que realmente se mide en campo", icono: "fa-ruler-horizontal" },
];

/* ── Formato ──────────────────────────────────────────────────────────────── */
const ES = (n: number, dec: number) =>
  n.toLocaleString("es-MX", { maximumFractionDigits: dec, minimumFractionDigits: 0 }).replace("-", "−");

export const fmtNum = (n: number): string => ES(n, 3);
export const fmtNum2 = (n: number): string => ES(n, 2);
export const fmtM = (n: number): string => `${ES(n, 2)} m`;
export const fmtDeg = (n: number): string => `${ES(Math.round(n), 0)}°`;

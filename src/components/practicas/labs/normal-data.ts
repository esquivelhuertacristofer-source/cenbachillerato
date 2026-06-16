/**
 * Datos y matemática PURA del laboratorio de la Distribución normal (PM-VI·O8).
 *
 * ⚠️ NO importar three / @react-three aquí: este módulo es de DATOS y puede
 * entrar al bundle del Worker (límite FREE 3 MiB gzipped).
 *
 * Cubre el contenido formativo C8: Distribución normal · Medidas de tendencia
 * central · Medidas de dispersión. La campana de Gauss se describe por su media
 * μ (centro) y su desviación estándar σ (ancho). El área bajo la curva entre
 * dos valores es la PROBABILIDAD de que la variable caiga en ese rango, y el
 * área total vale 1 (100 %).
 */

export type Modo = "campana" | "empirica" | "probabilidad";

// ── Constantes de dibujo (coordenadas matemáticas) ──────────────────────────
export const PASOS_CURVA = 160;
export const SIGMA_PASO = 0.5;

const SQRT_2PI = Math.sqrt(2 * Math.PI);
const SQRT_2 = Math.SQRT2;

/** Densidad normal f(x) para media mu y desviación sigma. */
export function pdf(x: number, mu: number, sigma: number): number {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * SQRT_2PI);
}

/** Puntuación z (estandarización): cuántas σ está x por encima/debajo de μ. */
export const zScore = (x: number, mu: number, sigma: number): number => (x - mu) / sigma;

/** Función error (aprox. Abramowitz & Stegun 7.1.26, |error| < 1.5e-7). */
function erf(x: number): number {
  const signo = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-ax * ax);
  return signo * y;
}

/** Φ(z): probabilidad acumulada de la normal estándar, P(Z ≤ z). */
export const cdfEstandar = (z: number): number => 0.5 * (1 + erf(z / SQRT_2));

/** P(X ≤ x) para una normal de media mu y desviación sigma. */
export const cdf = (x: number, mu: number, sigma: number): number => cdfEstandar(zScore(x, mu, sigma));

/** Probabilidad P(a ≤ X ≤ b) = área bajo la curva entre a y b. */
export function areaEntre(a: number, b: number, mu: number, sigma: number): number {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  return cdf(hi, mu, sigma) - cdf(lo, mu, sigma);
}

// ── Muestreadores de curva ──────────────────────────────────────────────────
export function curvaNormal(mu: number, sigma: number, xMin: number, xMax: number, pasos = PASOS_CURVA): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i <= pasos; i++) {
    const x = xMin + ((xMax - xMin) * i) / pasos;
    out.push([x, pdf(x, mu, sigma)]);
  }
  return out;
}

/** Borde superior de la región [a,b] bajo la curva (para rellenar el área). */
export function bordeRegion(a: number, b: number, mu: number, sigma: number, pasos = 80): [number, number][] {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  const out: [number, number][] = [];
  for (let i = 0; i <= pasos; i++) {
    const x = lo + ((hi - lo) * i) / pasos;
    out.push([x, pdf(x, mu, sigma)]);
  }
  return out;
}

/** Altura máxima posible de la campana en un preset (con la σ mínima): fija la escala vertical. */
export const picoMaximo = (p: Preset): number => 1 / (p.sigmaMin * SQRT_2PI);

// ── Presets de contexto real (México) ───────────────────────────────────────
export interface Preset {
  id: string;
  nombre: string;
  unidad: string;
  mu: number;
  sigma: number;
  muMin: number;
  muMax: number;
  sigmaMin: number;
  sigmaMax: number;
  xMin: number;
  xMax: number;
  contexto: string;
}

export const PRESETS: Preset[] = [
  {
    id: "estaturas",
    nombre: "Estatura de adultos (México)",
    unidad: "cm",
    mu: 170,
    sigma: 7,
    muMin: 160,
    muMax: 180,
    sigmaMin: 4,
    sigmaMax: 12,
    xMin: 145,
    xMax: 195,
    contexto: "La ENSANUT (INEGI/Secretaría de Salud) mide la estatura de la población. En grandes muestras se acomoda en una campana: la mayoría cerca de la media y muy pocos en los extremos.",
  },
  {
    id: "planea",
    nombre: "Puntaje tipo PLANEA / PISA",
    unidad: "pts",
    mu: 500,
    sigma: 100,
    muMin: 400,
    muMax: 600,
    sigmaMin: 60,
    sigmaMax: 140,
    xMin: 150,
    xMax: 850,
    contexto: "Las pruebas estandarizadas (PLANEA de la SEP, PISA de la OCDE) escalan sus resultados a una normal con media y desviación fijas para comparar generaciones y países.",
  },
  {
    id: "ci",
    nombre: "Coeficiente intelectual (CI)",
    unidad: "pts",
    mu: 100,
    sigma: 15,
    muMin: 85,
    muMax: 115,
    sigmaMin: 10,
    sigmaMax: 20,
    xMin: 50,
    xMax: 150,
    contexto: "Las escalas de CI se diseñan para distribuirse normalmente con media 100 y desviación 15: por construcción, ~68 % de la gente cae entre 85 y 115.",
  },
];

export const PRESET_DEFAULT = "estaturas";
export const presetPorId = (id: string): Preset => PRESETS.find((p) => p.id === id) ?? PRESETS[0]!;

// ── Regla empírica 68–95–99.7 ───────────────────────────────────────────────
export const REGLA_EMPIRICA: { k: number; pct: number; etiqueta: string }[] = [
  { k: 1, pct: 68.27, etiqueta: "μ ± 1σ" },
  { k: 2, pct: 95.45, etiqueta: "μ ± 2σ" },
  { k: 3, pct: 99.73, etiqueta: "μ ± 3σ" },
];

// ── Formateadores ───────────────────────────────────────────────────────────
export function fmtNum(n: number, dec = 2): string {
  if (!Number.isFinite(n)) return "—";
  const r = Number(n.toFixed(dec));
  const v = Object.is(r, -0) ? 0 : r;
  return v.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: dec }).replace(/−/g, "-");
}

export const fmtPct = (frac: number, dec = 2): string => `${fmtNum(frac * 100, dec)} %`;

// ── Contenido didáctico ─────────────────────────────────────────────────────
export const MODOS: { id: Modo; nombre: string; icon: string; desc: string }[] = [
  { id: "campana", nombre: "Campana", icon: "fa-bell", desc: "Mueve μ y σ y mira cómo se desplaza y se ensancha la campana de Gauss." },
  { id: "empirica", nombre: "Regla 68-95-99.7", icon: "fa-layer-group", desc: "Las áreas dentro de ±1σ, ±2σ y ±3σ valen 68 %, 95 % y 99.7 %." },
  { id: "probabilidad", nombre: "Probabilidad / z", icon: "fa-percent", desc: "Elige un rango [a, b]: su área es la probabilidad, y z estandariza cada extremo." },
];

export const PROBLEMA = {
  titulo: "Estaturas: μ = 170 cm, σ = 7 cm",
  enunciado:
    "La estatura de los hombres adultos en México se modela con una distribución normal de media μ = 170 cm y desviación estándar σ = 7 cm.",
  solucion: [
    "a) Entre 163 y 177 cm. 163 = μ − σ y 177 = μ + σ, es el intervalo μ ± 1σ. Por la regla empírica, ahí cae el 68 % (68.27 %) de la población.",
    "b) Menos de 184 cm. Estandariza: z = (184 − 170)/7 = 2. P(z ≤ 2) = Φ(2) = 97.72 %. Casi todos miden menos de 184 cm.",
    "c) El 95 % central. Es el intervalo μ ± 2σ = 170 ± 14, es decir entre 156 cm y 184 cm.",
  ],
  respuesta:
    "a) 68 % (μ ± 1σ). b) z = 2 ⇒ P(X < 184) = Φ(2) = 97.72 %. c) μ ± 2σ = [156, 184] cm contiene el 95 % central.",
};

export const IDEAS = [
  "La campana es simétrica respecto a la media: en una normal, media = mediana = moda.",
  "μ (media) dice DÓNDE está el centro; σ (desviación estándar) dice QUÉ TAN ancha y dispersa es la campana.",
  "El área total bajo la curva es 1 (100 %). El área entre dos valores es la probabilidad de caer en ese rango.",
  "Regla empírica: ~68 % cae en μ±1σ, ~95 % en μ±2σ y ~99.7 % en μ±3σ.",
  "La puntuación z = (x − μ)/σ traduce cualquier normal a la normal estándar (μ = 0, σ = 1) para comparar y calcular probabilidades.",
];

export const GLOSARIO = [
  { termino: "Distribución normal", definicion: "Modelo de probabilidad en forma de campana simétrica, definido por su media μ y su desviación σ.", ejemplo: "Estaturas, errores de medición y puntajes estandarizados suelen seguirla." },
  { termino: "Media (μ)", definicion: "Medida de tendencia central; el centro y eje de simetría de la campana.", ejemplo: "μ = 170 cm en las estaturas." },
  { termino: "Desviación estándar (σ)", definicion: "Medida de dispersión; qué tan lejos de la media suelen estar los datos. A mayor σ, más ancha la campana.", ejemplo: "σ = 7 cm." },
  { termino: "Regla empírica 68-95-99.7", definicion: "En una normal, ~68 % de los datos caen en μ±1σ, ~95 % en μ±2σ y ~99.7 % en μ±3σ.", ejemplo: "Entre 156 y 184 cm cae el 95 % de las estaturas." },
  { termino: "Puntuación z", definicion: "z = (x − μ)/σ: número de desviaciones estándar que un valor está por encima (z>0) o por debajo (z<0) de la media.", ejemplo: "184 cm ⇒ z = 2." },
  { termino: "Área = probabilidad", definicion: "El área bajo la curva entre a y b es P(a ≤ X ≤ b); el área total vale 1.", ejemplo: "P(163 ≤ X ≤ 177) = 0.68." },
  { termino: "Normal estándar", definicion: "La normal con μ = 0 y σ = 1; cualquier normal se convierte a ella con la puntuación z.", ejemplo: "Φ(z) = P(Z ≤ z)." },
  { termino: "Medidas de tendencia central", definicion: "Media, mediana y moda; en una normal perfecta las tres coinciden en μ.", ejemplo: "media = mediana = moda = 170." },
  { termino: "Medidas de dispersión", definicion: "Rango, varianza y desviación estándar; cuantifican qué tan esparcidos están los datos.", ejemplo: "varianza = σ² = 49 cm²." },
];

export const CONTEXTO =
  "La distribución normal aparece una y otra vez en datos reales de México: estaturas y pesos de la ENSANUT (INEGI), puntajes de PLANEA (SEP) y PISA (OCDE), errores de medición en laboratorios. Entenderla permite estimar qué tan común o raro es un valor y calcular probabilidades para tomar decisiones fundamentadas.";

export const FUENTE =
  "MCCEMS 2025 — Pensamiento Matemático VI «Pensamiento estadístico y probabilístico», propósito formativo O8 y contenido formativo C8: Distribución normal · Medidas de tendencia central · Medidas de dispersión.";

// ── Reto evaluable (parte B del "tratamiento") ───────────────────────────────
// VERBATIM de PM-VI-P09-A2 (ejercicio_matematico «Estaturas en México: probabilidad
// bajo la campana (μ = 170, σ = 7)», slug=distribucion-normal, tipo_respuesta
// "desarrollo", tolerancia_error 0.5).
//
// Aritmética verificada (μ = 170 cm, σ = 7 cm):
//   a) [163, 177] = μ ± 1σ ⇒ regla empírica ⇒ 68 % (68.27 %).
//   b) z = (184 − 170)/7 = 14/7 = 2 ⇒ P(X < 184) = Φ(2) ≈ 0.9772 = 97.72 %.
//   c) 95 % central = μ ± 2σ = 170 ± 14 = [156, 184] cm.
import type { RetoNumericoData } from "./_reto-numerico";

export const RETO_A2: RetoNumericoData = {
  titulo: "Estaturas en México: probabilidad bajo la campana (μ = 170, σ = 7)",
  contexto:
    "Los tres incisos recorren el contenido formativo de la progresión: la distribución normal descrita por sus medidas de tendencia central (μ) y de dispersión (σ), la regla empírica, y el cálculo de probabilidad como área bajo la curva con la puntuación z. En el laboratorio 3D el fenómeno «estaturas» trae justo estos parámetros, y los modos «Regla 68-95-99.7» y «Probabilidad / z» hacen visible cada inciso sobre la campana.",
  problema:
    "La estatura de los hombres adultos en México se modela con una distribución normal de media μ = 170 cm y desviación estándar σ = 7 cm.\n\n" +
    "a) REGLA EMPÍRICA. ¿Qué porcentaje de la población mide entre 163 cm y 177 cm?\n\n" +
    "b) PUNTUACIÓN z. ¿Qué probabilidad hay de que una persona mida menos de 184 cm? Estandariza con z = (x − μ)/σ y usa Φ(2) ≈ 0.9772.\n\n" +
    "c) INTERVALO CENTRAL. ¿Entre qué dos estaturas se encuentra el 95 % central de la población?",
  campos: [
    { etiqueta: "a) Porcentaje entre 163 y 177 cm (μ ± 1σ)", objetivo: 68, tolerancia: 0.5, unidad: "%", placeholder: "68" },
    { etiqueta: "b) P(X < 184 cm) con z = 2 ⇒ Φ(2)", objetivo: 97.72, tolerancia: 0.5, unidad: "%", placeholder: "97.72" },
    { etiqueta: "c) Estatura inferior del 95 % central (μ − 2σ)", objetivo: 156, tolerancia: 0.5, unidad: "cm", placeholder: "156" },
    { etiqueta: "c) Estatura superior del 95 % central (μ + 2σ)", objetivo: 184, tolerancia: 0.5, unidad: "cm", placeholder: "184" },
  ],
  pasosGuia: [
    "a) 163 = 170 − 7 = μ − σ y 177 = 170 + 7 = μ + σ: es el intervalo μ ± 1σ. Por la regla empírica, ahí cae el 68 % (más exacto, 68.27 %) de la población.",
    "b) Estandariza 184 cm: z = (184 − 170)/7 = 14/7 = 2. P(X < 184) = P(Z < 2) = Φ(2) ≈ 0.9772 = 97.72 %. Casi todos miden menos de 184 cm.",
    "c) El 95 % central corresponde a μ ± 2σ = 170 ± 2·7 = 170 ± 14, es decir el intervalo [156, 184] cm.",
  ],
  respuestaFinal:
    "a) 68 % (68.27 %), porque [163, 177] = μ ± 1σ. b) z = 2 ⇒ P(X < 184) = Φ(2) ≈ 97.72 %. c) μ ± 2σ = [156, 184] cm contiene el 95 % central.",
};

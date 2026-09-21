/**
 * Datos del laboratorio "¿Están relacionadas? Independencia y correlación"
 * (PM-VI-P12, progresión 6 de Pensamiento Matemático VI).
 *
 * OJO con la numeración: en PM-VI el sufijo del código NO coincide con el
 * número de progresión. La progresión 6 es la que lleva los códigos
 * PM-VI-P12-*.
 *
 * El laboratorio se ancla al ejercicio A2 «Tabla de contingencia y
 * dispersión: ¿hay relación?», que viaja verbatim como reto evaluable; el
 * marco teórico es la lectura A1, los hechos salen del quiz A4 y el glosario
 * del A5.
 *
 * El coeficiente r, la recta de mínimos cuadrados y la correlación parcial se
 * calculan con los puntos que hay en pantalla. Los datos marcados como
 * ilustrativos los genera el laboratorio con semilla fija: no son
 * estadísticas reales.
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { QuizEvaluable } from "./_reto-quiz";

/* ── Modos ────────────────────────────────────────────────────────────── */
export type Modo = "contingencia" | "dispersion" | "causalidad";

export const MODOS: Modo[] = ["contingencia", "dispersion", "causalidad"];

export interface ModoDef {
  etq: string;
  subtitulo: string;
  icono: string;
  color: string;
  fuente: "A1" | "A2";
}

export const MODOS_DEF: Record<Modo, ModoDef> = {
  contingencia: {
    etq: "Tabla de contingencia",
    subtitulo: "Variables cualitativas: ¿independientes o asociadas?",
    icono: "fa-table-cells",
    color: "#34d399",
    fuente: "A2",
  },
  dispersion: {
    etq: "Dispersión y r",
    subtitulo: "Variables cuantitativas: sentido y fuerza",
    icono: "fa-chart-line",
    color: "#7dd3fc",
    fuente: "A2",
  },
  causalidad: {
    etq: "Correlación ≠ causalidad",
    subtitulo: "La variable oculta aparece en el tercer eje",
    icono: "fa-temperature-high",
    color: "#fb923c",
    fuente: "A1",
  },
};

/* ── Generador con semilla ───────────────────────────────────────────── */
export function mulberry32(semilla: number) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Normal estándar (Box-Muller) a partir de un generador uniforme. */
function normal(rnd: () => number): number {
  const u = Math.max(1e-9, rnd());
  const v = rnd();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/* ══════════════════════════════════════════════════════════════════════
 * MODO 1 · TABLA DE CONTINGENCIA
 * ══════════════════════════════════════════════════════════════════════ */

/** Tamaño de cada grupo: la encuesta del ejercicio A2 tiene 50 y 50. */
export const GRUPO = 50;

export interface TablaPreset {
  id: string;
  etq: string;
  nota: string;
  hombresFutbol: number;
  mujeresFutbol: number;
}

export const TABLAS: TablaPreset[] = [
  {
    id: "a2",
    etq: "Encuesta del ejercicio A2",
    nota: "Hombres: 30 fútbol y 20 básquetbol. Mujeres: 30 fútbol y 20 básquetbol.",
    hombresFutbol: 30,
    mujeresFutbol: 30,
  },
  {
    id: "lectura",
    etq: "70 % frente a 30 % (lectura A1)",
    nota: "El ejemplo de la lectura A1: el 70 % de los hombres y el 30 % de las mujeres prefieren fútbol.",
    hombresFutbol: 35,
    mujeresFutbol: 15,
  },
];

export interface TablaCalculada {
  hF: number;
  hB: number;
  mF: number;
  mB: number;
  totalF: number;
  totalB: number;
  total: number;
  pH: number;
  pM: number;
  /** Fútbol esperado en cada grupo si las variables fueran independientes. */
  esperadoF: number;
  esperadoB: number;
  diferencia: number;
  veredicto: "independientes" | "casi" | "asociadas";
}

export function calcularTabla(hF: number, mF: number): TablaCalculada {
  const totalF = hF + mF;
  const total = 2 * GRUPO;
  const pH = hF / GRUPO;
  const pM = mF / GRUPO;
  const diferencia = Math.abs(pH - pM);
  return {
    hF,
    hB: GRUPO - hF,
    mF,
    mB: GRUPO - mF,
    totalF,
    totalB: total - totalF,
    total,
    pH,
    pM,
    esperadoF: (GRUPO * totalF) / total,
    esperadoB: (GRUPO * (total - totalF)) / total,
    diferencia,
    veredicto: diferencia === 0 ? "independientes" : diferencia <= 0.1 ? "casi" : "asociadas",
  };
}

/* ══════════════════════════════════════════════════════════════════════
 * MODO 2 · DIAGRAMA DE DISPERSIÓN Y COEFICIENTE r
 * ══════════════════════════════════════════════════════════════════════ */

export interface Punto {
  x: number;
  y: number;
}

export interface Rango {
  min: number;
  max: number;
}

export interface NubePreset {
  id: string;
  etq: string;
  nota: string;
  ejeX: string;
  ejeY: string;
  rangoX: Rango;
  rangoY: Rango;
  /** Decimales para mostrar valores de cada eje. */
  decX: number;
  decY: number;
  ilustrativo: boolean;
  puntos: Punto[];
}

export function nubeSintetica(semilla: number, n: number, rX: Rango, rY: Rango, pendiente: number, ruido: number, base: number, redondeoY = 1): Punto[] {
  const rnd = mulberry32(semilla);
  const out: Punto[] = [];
  for (let i = 0; i < n; i++) {
    const x = rX.min + (rX.max - rX.min) * (0.06 + 0.88 * rnd());
    const y = base + pendiente * x + ruido * normal(rnd);
    out.push({ x: Math.round(x * 10) / 10, y: Math.min(rY.max, Math.max(rY.min, Math.round(y * redondeoY) / redondeoY)) });
  }
  return out;
}

export const NUBES: NubePreset[] = [
  {
    id: "estudio",
    etq: "Estudio y calificación (A2)",
    nota: "Los cinco estudiantes del ejercicio A2: (1, 6), (2, 7), (3, 7), (4, 9), (5, 10).",
    ejeX: "Horas de estudio",
    ejeY: "Calificación",
    rangoX: { min: 0, max: 6 },
    rangoY: { min: 4, max: 10 },
    decX: 1,
    decY: 1,
    ilustrativo: false,
    puntos: [
      { x: 1, y: 6 },
      { x: 2, y: 7 },
      { x: 3, y: 7 },
      { x: 4, y: 9 },
      { x: 5, y: 10 },
    ],
  },
  {
    id: "tv",
    etq: "Horas de TV y calificación",
    nota: "Inciso (d) del ejercicio A2: una nube descendente con r cercano a −0.9. Datos ilustrativos del laboratorio.",
    ejeX: "Horas de TV al día",
    ejeY: "Calificación",
    rangoX: { min: 0, max: 6 },
    rangoY: { min: 4, max: 10 },
    decX: 1,
    decY: 1,
    ilustrativo: true,
    puntos: nubeSintetica(3, 14, { min: 0, max: 6 }, { min: 4, max: 10 }, -0.75, 0.4, 9.4, 10),
  },
  {
    id: "pulso",
    etq: "Ejercicio y pulso en reposo (A5)",
    nota: "La actividad final del glosario A5: horas de ejercicio a la semana y pulso en reposo, con r cercano a −0.8. Datos ilustrativos del laboratorio.",
    ejeX: "Horas de ejercicio a la semana",
    ejeY: "Pulso en reposo (lat/min)",
    rangoX: { min: 0, max: 10 },
    rangoY: { min: 50, max: 90 },
    decX: 1,
    decY: 0,
    ilustrativo: true,
    puntos: nubeSintetica(27, 16, { min: 0, max: 10 }, { min: 50, max: 90 }, -2.4, 3.6, 81),
  },
  {
    id: "nube",
    etq: "Sin patrón",
    nota: "Una nube dispersa: no sube ni baja. Datos ilustrativos del laboratorio.",
    ejeX: "Número de calzado",
    ejeY: "Calificación",
    rangoX: { min: 22, max: 30 },
    rangoY: { min: 4, max: 10 },
    decX: 1,
    decY: 1,
    ilustrativo: true,
    puntos: nubeSintetica(8, 14, { min: 22, max: 30 }, { min: 4, max: 10 }, 0, 1.2, 7.2, 10),
  },
];

export function nubePorId(id: string): NubePreset {
  return NUBES.find((n) => n.id === id) ?? NUBES[0]!;
}

export interface Estadisticos {
  n: number;
  mediaX: number;
  mediaY: number;
  sxy: number;
  sxx: number;
  syy: number;
  /** Coeficiente de correlación de Pearson; null si no se puede calcular. */
  r: number | null;
  /** Recta de mínimos cuadrados y = a + b·x; null si todas las x son iguales. */
  recta: { a: number; b: number } | null;
  /** Suma de productos positivos y negativos (lo que decide el signo de r). */
  sumaPos: number;
  sumaNeg: number;
}

export function estadisticos(ps: Punto[]): Estadisticos {
  const n = ps.length;
  if (n === 0) return { n, mediaX: 0, mediaY: 0, sxy: 0, sxx: 0, syy: 0, r: null, recta: null, sumaPos: 0, sumaNeg: 0 };
  const mediaX = ps.reduce((s, p) => s + p.x, 0) / n;
  const mediaY = ps.reduce((s, p) => s + p.y, 0) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  let sumaPos = 0;
  let sumaNeg = 0;
  for (const p of ps) {
    const dx = p.x - mediaX;
    const dy = p.y - mediaY;
    const prod = dx * dy;
    sxy += prod;
    sxx += dx * dx;
    syy += dy * dy;
    if (prod >= 0) sumaPos += prod;
    else sumaNeg += prod;
  }
  const r = n >= 2 && sxx > 1e-12 && syy > 1e-12 ? sxy / Math.sqrt(sxx * syy) : null;
  const recta = n >= 2 && sxx > 1e-12 ? { b: sxy / sxx, a: mediaY - (sxy / sxx) * mediaX } : null;
  return { n, mediaX, mediaY, sxy, sxx, syy, r, recta, sumaPos, sumaNeg };
}

export function describirR(r: number | null): string {
  if (r === null) return "no se puede calcular";
  const a = Math.abs(r);
  const fuerza = a >= 0.8 ? "fuerte" : a >= 0.5 ? "moderada" : a >= 0.2 ? "débil" : "prácticamente nula";
  if (a < 0.2) return "correlación prácticamente nula";
  return `correlación ${r > 0 ? "positiva" : "negativa"} ${fuerza}`;
}

export const MAX_PUNTOS = 30;

/* ══════════════════════════════════════════════════════════════════════
 * MODO 3 · CORRELACIÓN NO ES CAUSALIDAD
 * ══════════════════════════════════════════════════════════════════════ */

export interface Semana {
  temperatura: number;
  helado: number;
  ahogamientos: number;
}

export const SEMANAS_T: Rango = { min: 14, max: 34 };
export const HELADO_R: Rango = { min: 0, max: 12 };
export const AHOGA_R: Rango = { min: 0, max: 14 };

/**
 * 52 semanas ilustrativas: la temperatura sube y baja con las estaciones, y
 * tanto el helado vendido como los ahogamientos dependen SOLO de ella, cada
 * uno con su propio ruido. No hay flecha entre helado y ahogamientos.
 */
export function generarSemanas(semilla = 1359): Semana[] {
  const rnd = mulberry32(semilla);
  const out: Semana[] = [];
  for (let s = 0; s < 52; s++) {
    const estacion = Math.sin(((s - 13) / 52) * 2 * Math.PI);
    const temperatura = Math.round((24 + 8 * estacion + 1.6 * normal(rnd)) * 10) / 10;
    const helado = Math.max(0.3, Math.round((1.2 + 0.42 * (temperatura - 14) + 0.75 * normal(rnd)) * 10) / 10);
    const ahogamientos = Math.max(0, Math.round(0.4 + 0.45 * (temperatura - 14) + 1.1 * normal(rnd)));
    out.push({ temperatura, helado, ahogamientos });
  }
  return out;
}

export const SEMANAS: Semana[] = generarSemanas();

export interface Banda {
  id: string;
  etq: string;
  min: number;
  max: number;
  color: string;
}

export const BANDAS: Banda[] = [
  { id: "fresca", etq: "Frescas · menos de 18.5 °C", min: -Infinity, max: 18.5, color: "#60a5fa" },
  { id: "templada", etq: "Templadas · 18.5 a 23.5 °C", min: 18.5, max: 23.5, color: "#34d399" },
  { id: "calida", etq: "Cálidas · 23.5 a 28.5 °C", min: 23.5, max: 28.5, color: "#fbbf24" },
  { id: "calurosa", etq: "Calurosas · 28.5 °C o más", min: 28.5, max: Infinity, color: "#f87171" },
];

export function bandaDe(t: number): Banda {
  return BANDAS.find((b) => t >= b.min && t < b.max) ?? BANDAS[BANDAS.length - 1]!;
}

function pearson(xs: number[], ys: number[]): number | null {
  return estadisticos(xs.map((x, i) => ({ x, y: ys[i]! }))).r;
}

export interface AnalisisCausal {
  rHA: number | null;
  rTH: number | null;
  rTA: number | null;
  /** Correlación parcial helado–ahogamientos descontando la temperatura. */
  parcial: number | null;
  porBanda: { banda: Banda; n: number; r: number | null }[];
}

export function analizarSemanas(sem: Semana[]): AnalisisCausal {
  const t = sem.map((s) => s.temperatura);
  const h = sem.map((s) => s.helado);
  const a = sem.map((s) => s.ahogamientos);
  const rHA = pearson(h, a);
  const rTH = pearson(t, h);
  const rTA = pearson(t, a);
  const parcial = rHA !== null && rTH !== null && rTA !== null ? (rHA - rTH * rTA) / Math.sqrt((1 - rTH * rTH) * (1 - rTA * rTA)) : null;
  const porBanda = BANDAS.map((banda) => {
    const de = sem.filter((s) => bandaDe(s.temperatura).id === banda.id);
    return { banda, n: de.length, r: pearson(de.map((s) => s.helado), de.map((s) => s.ahogamientos)) };
  });
  return { rHA, rTH, rTA, parcial, porBanda };
}

export type VistaCausal = "aparente" | "oculta" | "controlada";

/* ── Tarjeta de estrellas: adivinar r ─────────────────────────────────── */

export interface NubeAdivina {
  puntos: Punto[];
  r: number;
}

/** Una nube de 24 puntos con una correlación elegida al azar entre −0.95 y 0.95. */
export function nubeAleatoria(): NubeAdivina {
  const rho = Math.round((Math.random() * 1.9 - 0.95) * 100) / 100;
  const semilla = Math.floor(Math.random() * 1e9);
  const rnd = mulberry32(semilla);
  const puntos: Punto[] = [];
  for (let i = 0; i < 24; i++) {
    const x = normal(rnd);
    const y = rho * x + Math.sqrt(1 - rho * rho) * normal(rnd);
    puntos.push({ x, y });
  }
  return { puntos, r: estadisticos(puntos).r ?? 0 };
}

export function estrellasPorErrorR(e: number): number {
  if (e <= 0.1) return 3;
  if (e <= 0.2) return 2;
  if (e <= 0.35) return 1;
  return 0;
}

export function fmt(x: number, dec = 2): string {
  return (Math.round(x * 10 ** dec) / 10 ** dec).toFixed(dec).replace("-", "−");
}

/* ══════════════════════════════════════════════════════════════════════
 * Textos — VERBATIM de las actividades ancla
 * ══════════════════════════════════════════════════════════════════════ */

export const PROBLEMA =
  "Muchas preguntas interesantes son sobre la RELACIÓN entre dos cosas: ¿el sexo se relaciona con la preferencia deportiva?, ¿estudiar más horas se relaciona con una mejor calificación?, ¿la temperatura con el consumo de helado?";

export const DEFINICION =
  "Que dos variables estén correlacionadas NO significa que una CAUSE la otra. Puede haber una tercera variable oculta o una coincidencia.";

/** Lectura A1 — los cinco párrafos, verbatim. */
export const LECTURA_A1: string[] = [
  "Muchas preguntas interesantes son sobre la RELACIÓN entre dos cosas: ¿el sexo se relaciona con la preferencia deportiva?, ¿estudiar más horas se relaciona con una mejor calificación?, ¿la temperatura con el consumo de helado? Para responder con datos hay que distinguir el tipo de variables: CUALITATIVAS (categóricas, como sexo, color o preferencia) y CUANTITATIVAS (numéricas, como horas, calificación o temperatura). Cada tipo se analiza con herramientas distintas.",
  "VARIABLES CUALITATIVAS: tablas de contingencia e independencia. Cuando las dos variables son categóricas, se organizan en una TABLA DE CONTINGENCIA (o tabla de doble entrada), que cruza las categorías de una variable con las de la otra y cuenta cuántos casos caen en cada cruce. Con ella se pregunta si las variables son INDEPENDIENTES (no se relacionan) o están ASOCIADAS. La idea es comparar lo OBSERVADO con lo que se ESPERARÍA si fueran independientes: si la proporción de, digamos, quienes prefieren fútbol es igual entre hombres y mujeres, las variables son independientes; si difiere mucho, hay asociación. Por ejemplo, si en una encuesta el 70% de los hombres y el 30% de las mujeres prefieren cierto deporte, sexo y preferencia están asociados.",
  "VARIABLES CUANTITATIVAS: diagramas de dispersión y correlación. Cuando las dos variables son numéricas, se grafican como puntos en un DIAGRAMA DE DISPERSIÓN: cada individuo es un punto (x, y). La forma de la nube de puntos revela la relación. Si al crecer x tiende a crecer y, la CORRELACIÓN es POSITIVA (la nube sube de izquierda a derecha); si al crecer x tiende a decrecer y, es NEGATIVA (la nube baja); si no hay patrón, no hay correlación (nube dispersa).",
  "EL COEFICIENTE DE CORRELACIÓN. Para medir la fuerza y el sentido de la relación lineal se usa el COEFICIENTE DE CORRELACIÓN (r), un número entre −1 y +1. Un valor cercano a +1 indica correlación positiva fuerte (los puntos casi forman una recta ascendente); cercano a −1, negativa fuerte (recta descendente); cercano a 0, poca o ninguna relación lineal. Por ejemplo, horas de estudio y calificación suelen tener r positivo; horas frente a la TV y calificación, r negativo.",
  "CORRELACIÓN NO ES CAUSALIDAD. La advertencia más importante: que dos variables estén correlacionadas NO significa que una CAUSE la otra. Puede haber una tercera variable oculta o una coincidencia. El clásico ejemplo: las ventas de helado y los ahogamientos suben juntas, pero el helado no causa ahogamientos; ambos suben por el calor del verano. Por eso, al analizar la relación entre variables —en salud, economía o educación— se reconoce la asociación, pero se es prudente al hablar de causas. Saber leer tablas de contingencia y diagramas de dispersión permite reconocer fenómenos de interés y fundamentar decisiones con datos.",
];

/** Preguntas de comprensión de la lectura A1 — verbatim. */
export const PREGUNTAS: string[] = [
  "¿Qué herramienta se usa para analizar la relación entre dos variables cualitativas y cómo se detecta la asociación?",
  "¿Qué indica el signo y el valor del coeficiente de correlación r?",
  "¿Por qué se dice que «correlación no implica causalidad»?",
];

export const INSTRUCCIONES: string[] = [
  "En «Tabla de contingencia», carga la encuesta del ejercicio A2 y compara las dos torres: la frontera entre fútbol y básquetbol queda a la misma altura que el plano de lo esperado.",
  "Mueve los controles hasta que las proporciones difieran mucho (como el 70 % frente al 30 % de la lectura). Después busca otra tabla que vuelva a ser independiente.",
  "En «Dispersión y r», toca el tablero para agregar puntos y toca un punto para quitarlo. Observa cómo cambian r y la recta.",
  "Activa los rectángulos de productos: cada punto dibuja un rectángulo desde el centro de la nube. Los verdes suman, los rojos restan, y su balance decide el signo de r.",
  "Construye con tus propios puntos una nube con r de al menos 0.9 o de −0.9 o menos.",
  "En «Correlación ≠ causalidad», mira primero solo el helado y los ahogamientos. Después revela la temperatura en el tercer eje y gira la escena.",
  "Controla la temperatura: dentro de cada grupo de semanas parecidas, ¿sigue habiendo relación?",
  "Adivina r en la tarjeta de estrellas y cierra con el reto evaluable del ejercicio A2.",
];

export const IDEAS: string[] = [
  "Cualitativas se analizan con tablas de contingencia; cuantitativas, con diagramas de dispersión y r.",
  "Si la proporción de una categoría es la misma en todos los grupos, la tabla observada coincide con la esperada: las variables son independientes.",
  "El signo de r lo decide el balance de los productos (x − x̄)(y − ȳ): puntos en los cuadrantes que suben suman, los que bajan restan.",
  "r mide relación LINEAL: cerca de ±1 los puntos casi forman una recta; cerca de 0 no hay recta que los describa bien.",
  "Una correlación fuerte puede venir de una tercera variable. Al comparar solo casos parecidos en esa variable, la relación se desvanece.",
  "Reconocer una asociación es válido; afirmar una causa necesita más que un coeficiente.",
];

/** Hechos del quiz verdadero/falso A4 — verbatim (los enunciados falsos van con su corrección). */
export const HECHOS: string[] = [
  "La relación entre dos variables cualitativas se analiza con una tabla de contingencia.",
  "Si dos variables cualitativas tienen las mismas proporciones en todos los grupos, se consideran independientes.",
  "r cercano a +1 indica correlación POSITIVA (crecen juntas). El que decrezca al crecer la otra es r cercano a −1.",
  "El coeficiente de correlación r toma valores entre −1 y +1.",
  "Correlación NO implica causalidad; puede haber una tercera variable o una coincidencia (helado y ahogamientos suben por el calor).",
  "Un diagrama de dispersión sirve para visualizar la relación entre dos variables cuantitativas.",
];

export interface DatoClave {
  valor: string;
  texto: string;
  icono: string;
}

export const DATOS: DatoClave[] = [
  { valor: "30/50 = 60 %", texto: "Hombres y mujeres que prefieren fútbol en la encuesta del A2: independientes.", icono: "fa-futbol" },
  { valor: "70 % vs 30 %", texto: "Proporciones tan distintas indican asociación entre sexo y preferencia.", icono: "fa-table-cells" },
  { valor: "r = +0.96", texto: "Los cinco puntos de horas de estudio y calificación del ejercicio A2.", icono: "fa-arrow-trend-up" },
  { valor: "−1 ≤ r ≤ +1", texto: "El coeficiente mide fuerza y sentido de la relación lineal.", icono: "fa-ruler-horizontal" },
];

export const CONTEXTO =
  "Las ventas de helado y los ahogamientos suben juntas, pero el helado no causa ahogamientos: ambos suben por el calor del verano. En salud, economía o educación ocurre lo mismo: una asociación en los datos es un buen punto de partida para investigar, no una prueba de que una cosa provoca la otra.";

export const FUENTE =
  "MCCEMS 2025 — Pensamiento Matemático VI «Pensamiento estadístico y probabilístico», contenido formativo: Independencia de variables cualitativas · Correlación de variables cuantitativas.";

/** Glosario A5 — los 10 términos verbatim. */
export interface GlosarioItem {
  termino: string;
  definicion: string;
  ejemplo: string;
}

export const GLOSARIO: GlosarioItem[] = [
  { termino: "Variable cualitativa", definicion: "Variable que expresa categorías, no números.", ejemplo: "Sexo, color favorito, deporte." },
  { termino: "Variable cuantitativa", definicion: "Variable que toma valores numéricos.", ejemplo: "Horas de estudio, calificación, temperatura." },
  { termino: "Tabla de contingencia", definicion: "Tabla de doble entrada que cruza las categorías de dos variables cualitativas y cuenta los casos.", ejemplo: "Sexo (filas) × deporte (columnas)." },
  { termino: "Independencia", definicion: "Dos variables son independientes si la distribución de una no cambia según la otra.", ejemplo: "Mismas proporciones en todos los grupos." },
  { termino: "Asociación", definicion: "Existe cuando las proporciones difieren entre grupos; las variables se relacionan.", ejemplo: "70% de hombres vs 30% de mujeres prefieren X." },
  { termino: "Diagrama de dispersión", definicion: "Gráfica de puntos (x, y) para visualizar la relación entre dos variables cuantitativas.", ejemplo: "Horas de estudio vs calificación." },
  { termino: "Correlación positiva", definicion: "Al crecer una variable, la otra tiende a crecer (nube ascendente, r > 0).", ejemplo: "Estudio y calificación." },
  { termino: "Correlación negativa", definicion: "Al crecer una variable, la otra tiende a decrecer (nube descendente, r < 0).", ejemplo: "Horas de TV y calificación." },
  { termino: "Coeficiente de correlación (r)", definicion: "Número entre −1 y +1 que mide fuerza y sentido de la relación lineal.", ejemplo: "r ≈ +0.9 relación positiva fuerte." },
  { termino: "Correlación ≠ causalidad", definicion: "Una relación estadística no prueba que una variable cause la otra.", ejemplo: "Helado y ahogamientos suben por el calor." },
];

/* ── Reto evaluable: el ejercicio A2, verbatim ────────────────────────── */

const ENCUESTA =
  "PARTE 1 — Cualitativas. Se encuestó a 100 estudiantes sobre su sexo y su deporte favorito (fútbol o básquetbol): Hombres: 30 fútbol, 20 básquetbol (50 en total). Mujeres: 30 fútbol, 20 básquetbol (50 en total).";
const PUNTOS_A2 = "PARTE 2 — Cuantitativas. Para 5 estudiantes se registró (horas de estudio, calificación): (1, 6), (2, 7), (3, 7), (4, 9), (5, 10).";

export const QUIZ_A2: QuizEvaluable = {
  titulo: "Tabla de contingencia y dispersión: ¿hay relación?",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: `${ENCUESTA} a) ¿Qué proporción de los hombres prefiere fútbol? ¿Y de las mujeres?`,
      opciones: ["60 % de los hombres y 60 % de las mujeres", "30 % de los hombres y 30 % de las mujeres", "60 % de los hombres y 40 % de las mujeres", "50 % de los hombres y 50 % de las mujeres"],
      respuestaCorrecta: 0,
      retroalimentacion: "a) Hombres con fútbol: 30/50 = 0.60 = 60%. Mujeres con fútbol: 30/50 = 0.60 = 60%.",
    },
    {
      enunciado: `${ENCUESTA} b) Según esas proporciones, ¿el sexo y el deporte favorito son independientes o están asociados?`,
      opciones: [
        "Independientes: la proporción que prefiere fútbol es la misma en los dos grupos",
        "Asociados: en los dos grupos hay más fútbol que básquetbol",
        "Asociados: los dos grupos tienen 50 estudiantes",
        "No se puede saber sin calcular r",
      ],
      respuestaCorrecta: 0,
      retroalimentacion: "b) Las proporciones son IGUALES (60% en ambos grupos), así que el deporte favorito no depende del sexo: las variables son INDEPENDIENTES (no hay asociación).",
    },
    {
      enunciado: `${PUNTOS_A2} c) Al aumentar las horas de estudio, ¿la calificación tiende a subir, bajar o no cambia? ¿Qué signo tendría el coeficiente de correlación r?`,
      opciones: ["Tiende a subir; r positivo", "Tiende a bajar; r negativo", "No cambia; r cercano a 0", "Tiende a subir; r negativo"],
      respuestaCorrecta: 0,
      retroalimentacion: "c) Al aumentar las horas, la calificación tiende a SUBIR (de 6 a 10): correlación POSITIVA, con r de signo positivo (cercano a +1, pues los puntos casi forman una recta ascendente).",
    },
    {
      enunciado: "d) Si además registráramos (horas de TV, calificación) y r resultara cercano a −0.9, ¿cómo se interpretaría?",
      opciones: [
        "Correlación negativa fuerte: a más horas de TV, menores calificaciones",
        "Correlación positiva fuerte: a más horas de TV, mayores calificaciones",
        "Correlación débil: casi no hay relación",
        "No hay relación lineal",
      ],
      respuestaCorrecta: 0,
      retroalimentacion: "d) r ≈ −0.9 indica correlación NEGATIVA fuerte: a más horas de TV, menores calificaciones.",
    },
    {
      enunciado: "d) Con r cercano a −0.9 entre horas de TV y calificación, ¿significa que ver TV CAUSA bajas calificaciones?",
      opciones: [
        "No: correlación no implica causalidad; podría haber una tercera variable, como menos tiempo de estudio",
        "Sí, porque r es muy cercano a −1",
        "Sí, porque la relación es negativa",
        "Solo si r fuera exactamente −1",
      ],
      respuestaCorrecta: 0,
      retroalimentacion: "d) NO prueba causalidad: podría haber una tercera variable (p. ej. menos tiempo de estudio); correlación no implica causa.",
    },
  ],
};

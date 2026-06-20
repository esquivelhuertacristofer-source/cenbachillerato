/**
 * Datos + motor matemático del laboratorio «Modelado y estimación con cónicas».
 * Pensamiento Matemático IV — «Trigonometría y geometría analítica».
 * Propósito PM-IV P07: «Aplica conocimientos sobre ecuaciones con dos variables
 * para realizar estimaciones sencillas, para consolidar los aprendizajes».
 * Anclas verbatim: PM-IV-P08-A1 (lectura) y PM-IV-P08-A2 (ejercicio).
 *
 * Módulo de DATOS PUROS: nada de three.js. La geometría de la intersección
 * cono–plano se calcula aquí de forma determinista y la escena solo la dibuja.
 *
 * Idea central (verbatim del ancla A1): las cuatro cónicas son las curvas que se
 * obtienen al CORTAR UN CONO con un PLANO. El tipo de curva lo decide el ángulo
 * del plano respecto al eje del cono. Cada una tiene una ecuación con dos
 * variables (x, y) que permite MODELAR y ESTIMAR fenómenos reales.
 */

export type Variante = "seccion" | "parabola" | "circunferencia";
export type Punto3 = [number, number, number];

import type { RetoNumericoData } from "./_reto-numerico";
export type { RetoNumericoData };

/* ════════════════════ Parámetros del cono ════════════════════════════════ */

/** Semiángulo del cono (entre el eje y la generatriz), en grados. */
export const ALPHA_DEG = 30;
/** Altura de cada napa del cono (mundo). */
export const CONO_H = 5;
/** Altura del punto del eje por donde pasa el plano de corte. */
export const CORTE_Y0 = 2.4;
/** Recorte de |t| para curvas abiertas (parábola/hipérbola). */
const T_MAX = 11;

const rad = (g: number) => (g * Math.PI) / 180;

/** Ángulo crítico (plano paralelo a la generatriz) = 90° − α. */
export const GAMMA_PARABOLA = 90 - ALPHA_DEG; // 60° con α = 30°

export type TipoConica = "circunferencia" | "elipse" | "parabola" | "hiperbola";

export interface ClaseConica {
  tipo: TipoConica;
  nombre: string;
  ecuacion: string;
  descripcion: string;
  color: string;
  icono: string;
}

const CIRC = "#5fb0ff";
const ELI = "#34D399";
const PAR = "#ffd24a";
const HIP = "#f0a6ff";

/** Clasifica el corte según el ángulo γ del plano respecto a la horizontal. */
export function clasificaCorte(gammaDeg: number): ClaseConica {
  const tol = 1.6; // margen para "horizontal" y "paralelo a la generatriz"
  if (gammaDeg <= tol) {
    return {
      tipo: "circunferencia",
      nombre: "Circunferencia",
      ecuacion: "(x − h)² + (y − k)² = r²",
      descripcion:
        "El plano es PERPENDICULAR al eje del cono (horizontal). Todos los puntos del corte quedan a la misma distancia del centro: el radio r. Es el caso particular de la elipse con a = b.",
      color: CIRC,
      icono: "fa-circle",
    };
  }
  if (gammaDeg < GAMMA_PARABOLA - tol) {
    return {
      tipo: "elipse",
      nombre: "Elipse",
      ecuacion: "x²/a² + y²/b² = 1",
      descripcion:
        "El plano se inclina, pero menos que la generatriz: corta una sola napa y la cierra. Nace una circunferencia «achatada» con dos focos. Modela las órbitas (1.ª ley de Kepler) y los arcos arquitectónicos.",
      color: ELI,
      icono: "fa-egg",
    };
  }
  if (gammaDeg <= GAMMA_PARABOLA + tol) {
    return {
      tipo: "parabola",
      nombre: "Parábola",
      ecuacion: "y = a·x²   (x² = 4py)",
      descripcion:
        "El plano queda PARALELO a la generatriz del cono: la curva ya no se cierra, se abre al infinito. Concentra los rayos paralelos al eje en el foco — por eso las antenas y los faros son parabólicos.",
      color: PAR,
      icono: "fa-bowl-food",
    };
  }
  return {
    tipo: "hiperbola",
    nombre: "Hipérbola",
    ecuacion: "x²/a² − y²/b² = 1",
    descripcion:
      "El plano se inclina MÁS que la generatriz y corta las DOS napas del cono: aparecen dos ramas abiertas. Modela la proporcionalidad inversa (ley de Boyle) y los sistemas de navegación por diferencia de distancias.",
    color: HIP,
    icono: "fa-bezier-curve",
  };
}

/**
 * Curva de intersección cono–plano en coordenadas de MUNDO (mismo sistema que
 * el cono: ápice en el origen, eje +y, semiángulo α). Parametrización exacta:
 *
 *   Punto del cono:  P(t,θ) = t · (sinα cosθ, cosα, sinα sinθ)
 *   Plano por (0,y0,0) con normal n = (sinγ, cosγ, 0):  (P)·n = y0 cosγ
 *   ⇒  t(θ) = y0 cosγ / (sinα cosθ sinγ + cosα cosγ)
 *
 * Cuando el denominador → 0 la curva escapa al infinito (parábola/hipérbola);
 * recortamos a |t| ≤ T_MAX y partimos la polilínea en esos saltos.
 */
export function interseccion(gammaDeg: number): { tipo: TipoConica; segmentos: Punto3[][] } {
  const a = rad(ALPHA_DEG);
  const g = rad(gammaDeg);
  const sa = Math.sin(a);
  const ca = Math.cos(a);
  const sg = Math.sin(g);
  const cg = Math.cos(g);
  const num = CORTE_Y0 * cg;

  const N = 360;
  const segmentos: Punto3[][] = [];
  let actual: Punto3[] = [];

  for (let i = 0; i <= N; i++) {
    const th = (i / N) * Math.PI * 2;
    const den = sa * Math.cos(th) * sg + ca * cg;
    const t = den !== 0 ? num / den : Number.POSITIVE_INFINITY;
    const valido = Number.isFinite(t) && Math.abs(t) <= T_MAX;
    if (valido) {
      actual.push([t * sa * Math.cos(th), t * ca, t * sa * Math.sin(th)]);
    } else if (actual.length > 1) {
      segmentos.push(actual);
      actual = [];
    } else {
      actual = [];
    }
  }
  if (actual.length > 1) segmentos.push(actual);

  return { tipo: clasificaCorte(gammaDeg).tipo, segmentos };
}

/** Plano de corte (centro, normal) para que la escena lo posicione. */
export function planoCorte(gammaDeg: number): { normal: Punto3; centro: Punto3 } {
  const g = rad(gammaDeg);
  return { normal: [Math.sin(g), Math.cos(g), 0], centro: [0, CORTE_Y0, 0] };
}

/** Ángulos preestablecidos: un botón por cada cónica. */
export const CORTES_PRESET: { gamma: number; etiqueta: string; tipo: TipoConica }[] = [
  { gamma: 0, etiqueta: "Horizontal", tipo: "circunferencia" },
  { gamma: 34, etiqueta: "Inclinado", tipo: "elipse" },
  { gamma: GAMMA_PARABOLA, etiqueta: "Paralelo a la generatriz", tipo: "parabola" },
  { gamma: 76, etiqueta: "Muy inclinado", tipo: "hiperbola" },
];

/* ════════════════════ Modelado verbatim (PM-IV-P08-A2) ═══════════════════ */

/** Antena parabólica y = a·x²  con a = 0.25 (pasa por (1, 0.25)). */
export const PARABOLA = {
  a: 0.25,
  ecuacion: "y = 0.25·x²",
  /** Foco de y = a x²: F = (0, 1/(4a)). Con a = 0.25 ⇒ F = (0, 1). */
  foco: 1 / (4 * 0.25),
  puntoDato: [1, 0.25] as [number, number], // dato que define la antena
  puntoEstima: [2, 1] as [number, number], // estimación pedida: x=2 ⇒ y=1
  rango: 2.6, // |x| máximo a dibujar
};

export function parabolaY(x: number): number {
  return PARABOLA.a * x * x;
}

/** Circunferencia de cobertura x² + y² = 25 (radio 5 km). */
export const COBERTURA = {
  radio: 5,
  ecuacion: "x² + y² = 25",
  casa: [3, 4] as [number, number], // punto a probar
  /** 3² + 4² = 25 = r² ⇒ justo en el borde. */
  casaDist2: 3 * 3 + 4 * 4,
};

/* ════════════════════ Reto evaluable (verbatim A2) ═══════════════════════ */

export const RETO_CONICAS: RetoNumericoData = {
  titulo: "Antena parabólica y alcance de señal",
  contexto:
    "El ejercicio consolida el contenido formativo aplicando la parábola (antena/faro) y la circunferencia (alcance de señal) para modelar y estimar, tal como ocurre con la cobertura de telefonía o internet en México.",
  problema:
    "a) ANTENA: y = a·x² pasa por (1, 0.25). Halla a. b) Con esa ecuación, ¿cuánto sube la antena a x = 2 m? c) Una antena cubre un radio de 5 km; escribe r de la circunferencia x²+y²=r². d) ¿La casa en (3, 4) km tiene señal? Calcula 3²+4².",
  campos: [
    { etiqueta: "a) coeficiente a", objetivo: 0.25, tolerancia: 0.01, placeholder: "0.25 = a·(1)²" },
    { etiqueta: "b) altura a x = 2 m", objetivo: 1, tolerancia: 0.01, unidad: "m", placeholder: "0.25·(2)²" },
    { etiqueta: "c) radio r de cobertura", objetivo: 5, tolerancia: 0.01, unidad: "km", placeholder: "x²+y²=r²" },
    { etiqueta: "d) 3² + 4²", objetivo: 25, tolerancia: 0.01, placeholder: "9 + 16" },
  ],
  pasosGuia: [
    "a) Sustituye (1, 0.25) en y = a·x²: 0.25 = a·(1)² ⇒ a = 0.25. La ecuación de la antena es y = 0.25·x².",
    "b) Para x = 2: y = 0.25·(2)² = 0.25·4 = 1 m. A 2 m del eje la antena sube 1 m de profundidad.",
    "c) Circunferencia con centro en el origen y radio 5: x² + y² = 5² ⇒ x² + y² = 25 (r = 5).",
    "d) Evalúa (3, 4): 3² + 4² = 9 + 16 = 25. Como 25 = 25, la casa está justo sobre el borde del alcance (a exactamente 5 km): tiene señal en el límite. Si x²+y² < 25 está dentro (con señal) y si > 25 está fuera.",
  ],
  respuestaFinal:
    "a) a = 0.25 ⇒ y = 0.25·x². b) y = 1 m a x = 2 m. c) x² + y² = 25. d) 3²+4² = 25 = 25: la casa está en el borde del alcance (a 5 km), con señal al límite.",
};

/* ════════════════════ Variantes (modos) ══════════════════════════════════ */

export const VARIANTES: { id: Variante; nombre: string; icon: string; desc: string }[] = [
  {
    id: "seccion",
    nombre: "Cortar el cono",
    icon: "fa-scissors",
    desc: "Inclina el plano que corta el cono y observa cómo la misma figura genera las cuatro cónicas: circunferencia, elipse, parábola e hipérbola.",
  },
  {
    id: "parabola",
    nombre: "Antena (parábola)",
    icon: "fa-satellite-dish",
    desc: "La parábola y = 0.25·x² del ejercicio A2: los rayos paralelos al eje se concentran en el FOCO. Por eso las antenas y los faros son parabólicos.",
  },
  {
    id: "circunferencia",
    nombre: "Cobertura (círculo)",
    icon: "fa-tower-cell",
    desc: "La circunferencia de cobertura x² + y² = 25 (radio 5 km): prueba si la casa en (3, 4) está dentro, fuera o sobre el borde del alcance.",
  },
];

/* ════════════════════ Texto didáctico (verbatim-grounded) ════════════════ */

export const OBJETIVOS = [
  "Identificar que las cuatro cónicas salen de cortar un mismo cono",
  "Relacionar el ángulo del plano con el tipo de curva",
  "Modelar una antena parabólica y localizar su foco",
  "Estimar con la ecuación de la circunferencia si un punto tiene señal",
  "Resolver el reto evaluable de la actividad A2",
];

export const IDEAS = [
  "Las secciones cónicas —circunferencia, parábola, elipse e hipérbola— son las curvas que se obtienen al cortar un cono con un plano.",
  "El tipo de curva lo decide el ángulo del plano: horizontal → circunferencia; inclinado (menos que la generatriz) → elipse; paralelo a la generatriz → parábola; más inclinado, cortando las dos napas → hipérbola.",
  "Cada cónica tiene una ecuación con dos variables (x, y) que permite no solo dibujarla, sino MODELAR situaciones reales y hacer ESTIMACIONES.",
  "La parábola concentra los rayos paralelos al eje en un punto, el FOCO: por eso las antenas DISH, el internet satelital y los faros de un auto son parabólicos.",
  "La circunferencia (x − h)² + (y − k)² = r² modela el alcance de una señal: un punto está dentro si x²+y² < r², en el borde si = r² y fuera si > r².",
  "Modelar y estimar tiene tres pasos: (1) identificar la cónica, (2) escribir su ecuación con los datos, (3) usarla para estimar el valor buscado.",
];

export const CONTEXTO =
  "Las cónicas son el lenguaje matemático de muchísimos fenómenos: la trayectoria de un balón, la órbita de un satélite mexicano (Mexsat), la cobertura de una antena de telefonía o el haz de un faro. La geometría analítica deja de ser teoría y se vuelve una herramienta para describir y predecir el entorno.";

export const FUENTE =
  "MCCEMS 2025 — Pensamiento Matemático IV «Trigonometría y geometría analítica», contenido formativo: Modelado y estimación · Aplicación de las secciones cónicas (PM-IV-P08-A1 / A2).";

export interface GlosarioItem {
  termino: string;
  definicion: string;
  ejemplo: string;
}

export const GLOSARIO: GlosarioItem[] = [
  { termino: "Sección cónica", definicion: "Curva obtenida al cortar un cono con un plano.", ejemplo: "Circunferencia, elipse, parábola e hipérbola." },
  { termino: "Generatriz", definicion: "Recta que, al girar, genera la superficie del cono; forma el ángulo α con el eje.", ejemplo: "Si el plano queda paralelo a ella, el corte es una parábola." },
  { termino: "Foco", definicion: "Punto donde se concentran los rayos reflejados por una parábola (o uno de los dos puntos clave de la elipse e hipérbola).", ejemplo: "El receptor de una antena DISH va en el foco." },
  { termino: "Radio", definicion: "Distancia constante del centro a cualquier punto de la circunferencia.", ejemplo: "Una antena con r = 5 km cubre x²+y² = 25." },
  { termino: "Excentricidad", definicion: "Mide cuánto se «achata» o abre una cónica.", ejemplo: "Circunferencia e = 0; elipse 0<e<1; parábola e = 1; hipérbola e>1." },
  { termino: "Modelar", definicion: "Escribir la ecuación de una cónica que describe un fenómeno real.", ejemplo: "Una antena parabólica como y = 0.25·x²." },
];

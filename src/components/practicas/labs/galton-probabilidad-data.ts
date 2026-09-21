/**
 * Datos del laboratorio "Azar, frecuencia y probabilidad — el tablero de
 * Galton" (PM-VI-P05, progresión 2 de Pensamiento Matemático VI).
 *
 * OJO con la numeración: en PM-VI el sufijo del código NO coincide con el
 * número de progresión. La progresión 2 ("Identifica la incertidumbre como
 * consecuencia de la variabilidad y, a través de simulaciones, plantea una
 * hipótesis de trabajo…") es la que lleva los códigos PM-VI-P05-*.
 *
 * El laboratorio se ancla a la lectura A1 «Probabilidad: azar, incertidumbre y
 * toma de decisiones informadas»; su A2 es un quiz de opción múltiple, así que
 * el quiz viaja completo como reto evaluable. El glosario es el A5 verbatim.
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { QuizEvaluable } from "./_reto-quiz";

/* ── Modos ────────────────────────────────────────────────────────────── */
export type Modo = "laplace" | "galton" | "convergencia";

export const MODOS: Modo[] = ["laplace", "galton", "convergencia"];

export interface ModoDef {
  etq: string;
  subtitulo: string;
  icono: string;
  color: string;
  /** Actividad ancla de la que sale la teoría del modo. */
  fuente: "A1" | "A5";
}

export const MODOS_DEF: Record<Modo, ModoDef> = {
  laplace: {
    etq: "Probabilidad clásica",
    subtitulo: "Espacio muestral, evento y complemento",
    icono: "fa-dice",
    color: "#7dd3fc",
    fuente: "A1",
  },
  galton: {
    etq: "Tablero de Galton",
    subtitulo: "Frecuencia relativa frente a probabilidad teórica",
    icono: "fa-chart-column",
    color: "#fbbf24",
    fuente: "A1",
  },
  convergencia: {
    etq: "Ley de los grandes números",
    subtitulo: "La frecuencia se acerca a la probabilidad al repetir",
    icono: "fa-arrow-trend-up",
    color: "#34d399",
    fuente: "A1",
  },
};

/* ══════════════════════════════════════════════════════════════════════
 * MODO 1 · PROBABILIDAD CLÁSICA (Laplace)
 *
 * El espacio muestral se enumera de verdad: cada resultado de Ω es un objeto
 * en la escena, y el evento es un subconjunto calculado con un predicado. Así
 * P(A) = |A| / |Ω| no es un número escrito a mano, sino el conteo real de lo
 * que el alumno está viendo.
 * ══════════════════════════════════════════════════════════════════════ */

export type ExperimentoId = "dado" | "dosmonedas" | "baraja";

/** Un resultado del espacio muestral, con lo necesario para dibujarlo. */
export interface ResultadoOmega {
  /** Etiqueta corta que se pinta sobre el objeto (ej. "5", "CS", "A♥"). */
  etq: string;
  /** Valor numérico del resultado, cuando lo tiene (cara del dado, valor de carta). */
  valor: number;
  /** Palo de la carta o descripción de las monedas, según el experimento. */
  extra?: string;
  /** Color de la baraja: true = roja. */
  rojo?: boolean;
}

export interface EventoDef {
  id: string;
  etq: string;
  /** El subconjunto, escrito como se escribe en teoría de conjuntos. */
  notacion: string;
  /** Decide si un resultado de Ω pertenece al evento. */
  pertenece: (r: ResultadoOmega) => boolean;
}

export interface ExperimentoDef {
  id: ExperimentoId;
  etq: string;
  icono: string;
  /** Descripción del experimento aleatorio. */
  descripcion: string;
  /** Ω escrito como en la lectura y el glosario. */
  omegaTexto: string;
  omega: ResultadoOmega[];
  eventos: EventoDef[];
  /** Cuántos objetos por fila al acomodar Ω en la escena. */
  columnas: number;
}

const PALOS: { s: string; rojo: boolean }[] = [
  { s: "♠", rojo: false },
  { s: "♥", rojo: true },
  { s: "♦", rojo: true },
  { s: "♣", rojo: false },
];
const VALORES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function omegaBaraja(): ResultadoOmega[] {
  const out: ResultadoOmega[] = [];
  for (const p of PALOS) {
    for (let i = 0; i < VALORES.length; i++) {
      out.push({ etq: `${VALORES[i]}${p.s}`, valor: i + 1, extra: p.s, rojo: p.rojo });
    }
  }
  return out;
}

export const EXPERIMENTOS: ExperimentoDef[] = [
  {
    id: "dado",
    etq: "Un dado de 6 caras",
    icono: "fa-dice-six",
    descripcion:
      "Lanzar un dado no cargado. Los seis resultados son igualmente posibles, así que la regla de Laplace aplica.",
    omegaTexto: "Ω = {1, 2, 3, 4, 5, 6}",
    columnas: 3,
    omega: [1, 2, 3, 4, 5, 6].map((v) => ({ etq: String(v), valor: v })),
    eventos: [
      { id: "par", etq: "Sacar un número par", notacion: "A = {2, 4, 6}", pertenece: (r) => r.valor % 2 === 0 },
      { id: "mayor4", etq: "Sacar un número mayor que 4", notacion: "A = {5, 6}", pertenece: (r) => r.valor > 4 },
      { id: "seis", etq: "Sacar un 6", notacion: "A = {6}", pertenece: (r) => r.valor === 6 },
    ],
  },
  {
    id: "dosmonedas",
    etq: "Dos monedas",
    icono: "fa-coins",
    descripcion:
      "Lanzar dos monedas equilibradas a la vez. Cada moneda cae cara (C) o sello (S), y los cuatro resultados son igualmente posibles.",
    omegaTexto: "Ω = {CC, CS, SC, SS}",
    columnas: 2,
    omega: [
      { etq: "CC", valor: 2, extra: "dos caras" },
      { etq: "CS", valor: 1, extra: "cara y sello" },
      { etq: "SC", valor: 1, extra: "sello y cara" },
      { etq: "SS", valor: 0, extra: "dos sellos" },
    ],
    eventos: [
      { id: "almenos1", etq: "Al menos una cara", notacion: "A = {CC, CS, SC}", pertenece: (r) => r.valor >= 1 },
      { id: "dos", etq: "Las dos caras", notacion: "A = {CC}", pertenece: (r) => r.valor === 2 },
      { id: "exacta1", etq: "Exactamente una cara", notacion: "A = {CS, SC}", pertenece: (r) => r.valor === 1 },
    ],
  },
  {
    id: "baraja",
    etq: "Una baraja de 52 cartas",
    icono: "fa-clone",
    descripcion:
      "Extraer una carta de una baraja bien mezclada de 52 cartas. Las 52 son igualmente posibles mientras la mezcla sea justa.",
    omegaTexto: "Ω = las 52 cartas (4 palos × 13 valores)",
    columnas: 13,
    omega: omegaBaraja(),
    eventos: [
      { id: "roja", etq: "Extraer una carta roja", notacion: "A = los 26 corazones y diamantes", pertenece: (r) => r.rojo === true },
      { id: "as", etq: "Extraer un as", notacion: "A = {A♠, A♥, A♦, A♣}", pertenece: (r) => r.valor === 1 },
      { id: "figura", etq: "Extraer una figura (J, Q, K)", notacion: "A = las 12 figuras", pertenece: (r) => r.valor >= 11 },
    ],
  },
];

export function experimentoPorId(id: ExperimentoId): ExperimentoDef {
  return EXPERIMENTOS.find((e) => e.id === id) ?? EXPERIMENTOS[0]!;
}

export function eventoPorId(exp: ExperimentoDef, id: string): EventoDef {
  return exp.eventos.find((e) => e.id === id) ?? exp.eventos[0]!;
}

/** Máximo común divisor, para escribir la probabilidad como fracción reducida. */
function mcd(a: number, b: number): number {
  return b === 0 ? a : mcd(b, a % b);
}

export interface ProbClasica {
  favorables: number;
  totales: number;
  /** Fracción reducida, p. ej. "1/2". */
  fraccion: string;
  decimal: number;
  /** El complemento, ya reducido. */
  fraccionComp: string;
  decimalComp: number;
}

/**
 * P(A) = casos favorables / casos totales, contados sobre el Ω real del
 * experimento, y su complemento P(A') = 1 − P(A).
 */
export function probClasica(exp: ExperimentoDef, ev: EventoDef): ProbClasica {
  const totales = exp.omega.length;
  const favorables = exp.omega.filter((r) => ev.pertenece(r)).length;
  const g = mcd(favorables, totales) || 1;
  const gc = mcd(totales - favorables, totales) || 1;
  return {
    favorables,
    totales,
    fraccion: `${favorables / g}/${totales / g}`,
    decimal: favorables / totales,
    fraccionComp: `${(totales - favorables) / gc}/${totales / gc}`,
    decimalComp: (totales - favorables) / totales,
  };
}

/* ══════════════════════════════════════════════════════════════════════
 * MODO 2 · TABLERO DE GALTON
 *
 * Cada bola baja `filas` niveles; en cada nivel se desvía a la derecha con
 * probabilidad p. El número de desvíos a la derecha es el cajón donde cae, y
 * sigue una binomial: P(k) = C(n,k)·p^k·(1−p)^(n−k).
 *
 * Con p = 0.5 el tablero es parejo y la regla de Laplace aplica. Con p ≠ 0.5
 * el tablero queda "cargado" y la equiprobabilidad se rompe — que es justo lo
 * que la lectura A1 advierte sobre los límites de esa regla.
 * ══════════════════════════════════════════════════════════════════════ */

export const FILAS_MIN = 5;
export const FILAS_MAX = 12;

export interface SesgoDef {
  id: string;
  p: number;
  etq: string;
  nota: string;
}

export const SESGOS: SesgoDef[] = [
  {
    id: "izq",
    p: 0.35,
    etq: "Cargado a la izquierda",
    nota: "p = 0.35. El tablero deja de ser parejo: contar casos favorables ya no da la probabilidad de cada cajón.",
  },
  {
    id: "parejo",
    p: 0.5,
    etq: "Tablero parejo",
    nota: "p = 0.5. Cada clavo manda la bola a izquierda o derecha con la misma probabilidad.",
  },
  {
    id: "der",
    p: 0.65,
    etq: "Cargado a la derecha",
    nota: "p = 0.65. El montón se corre a la derecha y la distribución pierde la simetría.",
  },
];

export function sesgoPorId(id: string): SesgoDef {
  return SESGOS.find((s) => s.id === id) ?? SESGOS[1]!;
}

/** C(n, k) calculado de forma exacta para las n que admite el laboratorio. */
export function combinaciones(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return Math.round(r);
}

/** P(k) = C(n,k)·p^k·(1−p)^(n−k) para k = 0..n. */
export function binomial(n: number, p: number): number[] {
  const out: number[] = [];
  for (let k = 0; k <= n; k++) out.push(combinaciones(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k));
  return out;
}

/** Media y desviación estándar de la binomial: μ = n·p, σ = √(n·p·q). */
export function momentosBinomial(n: number, p: number): { media: number; sigma: number } {
  return { media: n * p, sigma: Math.sqrt(n * p * (1 - p)) };
}

/* ══════════════════════════════════════════════════════════════════════
 * MODO 3 · LEY DE LOS GRANDES NÚMEROS
 * ══════════════════════════════════════════════════════════════════════ */

/** Hasta cuántas repeticiones llega el eje del modo de convergencia. */
export const CONV_MAX_REPS = 5000;

/** Un punto de la traza: repeticiones acumuladas y frecuencia relativa. */
export interface PuntoConvergencia {
  n: number;
  frecuencia: number;
}

/* ══════════════════════════════════════════════════════════════════════
 * Textos — todo lo que sigue es VERBATIM de las actividades ancla
 * ══════════════════════════════════════════════════════════════════════ */

export const PROBLEMA =
  "La probabilidad es la rama de las matematicas que estudia el azar y la incertidumbre. Nos permite asignar un numero entre 0 y 1 (o entre 0% y 100%) a la posibilidad de que ocurra un evento, y eso tiene aplicaciones practicas inmensas: desde el pronostico del tiempo hasta las primas de seguros, pasando por los ensayos clinicos de medicamentos.";

export const DEFINICION =
  "Un experimento aleatorio es aquel cuyo resultado no puede predecirse con certeza. El espacio muestral (Ω o S) es el conjunto de todos los resultados posibles del experimento.";

/** Lectura A1 — párrafos verbatim. */
export const LECTURA_A1: string[] = [
  "El punto de partida es el experimento aleatorio: cualquier proceso cuyo resultado no podemos predecir con certeza antes de realizarlo. Lanzar un dado, sacar una carta de una baraja, medir la temperatura maxima de manana, o tomar una muestra de 100 personas para medir su presion arterial, son todos experimentos aleatorios. El espacio muestral (usualmente escrito como omega) es el conjunto de todos los resultados posibles del experimento. Para un dado de seis caras, omega = {1, 2, 3, 4, 5, 6}. Un evento es cualquier subconjunto del espacio muestral: por ejemplo, el evento 'sacar un numero par' es el subconjunto {2, 4, 6}.",
  "La probabilidad clasica (o de Laplace) define P(A) = numero de casos favorables al evento A / numero total de casos posibles del espacio muestral. Esta formula asume que todos los resultados son igualmente posibles (equiprobabilidad): funciona perfectamente para dados, monedas, cartas y urnas ideales, pero no para la mayoria de situaciones reales.",
  "La probabilidad frecuentista define P(A) como la frecuencia relativa del evento A en un numero muy grande de repeticiones del experimento: P(A) = numero de veces que ocurrio A / numero total de repeticiones. La ley de los grandes numeros garantiza que, conforme aumenta el numero de repeticiones, la frecuencia relativa se acerca al valor verdadero de la probabilidad.",
  "Los axiomas de Kolmogorov (1933) dan el fundamento matematico riguroso de la probabilidad: (1) P(A) es mayor o igual a 0 para cualquier evento A; (2) P(omega) = 1, la probabilidad del espacio muestral completo es 1; (3) si dos eventos A y B son mutuamente excluyentes (A interseccion B = vacio), entonces P(A union B) = P(A) + P(B). El complemento de un evento A es el conjunto de todos los resultados que no pertenecen a A: P(A') = 1 - P(A). Si la probabilidad de lluvia es 0.30, la probabilidad de que no llueva es 0.70.",
];

/** Preguntas de comprensión de la lectura A1 — verbatim. */
export const PREGUNTAS: string[] = [
  "¿Cuál es la diferencia entre probabilidad clásica, frecuentista y subjetiva? ¿En qué situaciones aplica cada una?",
  "¿Qué son los axiomas de Kolmogorov y por qué son importantes para la probabilidad?",
  "¿Qué garantiza la ley de los grandes números en relación con la probabilidad frecuentista?",
  "¿Cómo se usa el complemento de un evento y por qué es útil?",
];

export const INSTRUCCIONES: string[] = [
  "En «Probabilidad clásica», elige un experimento y un evento. El laboratorio cuenta los casos favorables sobre el espacio muestral que estás viendo y arma la fracción P(A) = favorables / posibles.",
  "Fíjate en el complemento: los objetos que se apagan son exactamente los que NO pertenecen al evento, y su proporción es P(A') = 1 − P(A).",
  "Pasa al «Tablero de Galton» y suelta bolas. Cada clavo manda la bola a un lado; el cajón donde cae es el número de veces que se fue a la derecha.",
  "Compara la barra (lo que pasó) con la curva (lo que la teoría predice). Con pocas bolas hay mucho ruido; con cientos, la barra se pega a la curva.",
  "Carga el tablero: con p ≠ 0.5 la equiprobabilidad se rompe y el montón se corre. Es el límite de la regla de Laplace que advierte la lectura.",
  "En «Ley de los grandes números», repite miles de veces el experimento del primer modo y observa cómo la frecuencia relativa se acerca a la probabilidad teórica.",
  "Antes de simular, escribe tu predicción en la tarjeta de estrellas: mientras más cerca quede de la probabilidad teórica, más estrellas.",
  "Cierra con el reto evaluable: el quiz de la actividad A2, verbatim.",
];

export const IDEAS: string[] = [
  "La probabilidad clásica se calcula ANTES de experimentar, contando casos; la frecuentista se mide DESPUÉS, contando resultados.",
  "La regla de Laplace exige equiprobabilidad. Si el dado está cargado o el tablero desviado, contar casos favorables ya no da la probabilidad correcta.",
  "La ley de los grandes números no promete que un resultado «se empareje»: promete que la frecuencia relativa converge. Cada repetición es independiente.",
  "Una diferencia grande entre lo observado y lo teórico con pocas repeticiones es normal; con muchas repeticiones es señal de que el modelo teórico está mal.",
  "El complemento casi siempre es el atajo: cuando contar A es difícil, contar lo que no es A suele ser fácil, y P(A) = 1 − P(A').",
  "En el tablero de Galton la campana no se dibuja: aparece sola al sumar muchas decisiones pequeñas e independientes.",
];

/** Hechos de los quizzes A2 y A4 — verbatim. */
export const HECHOS: string[] = [
  "La ley de los grandes números establece que la frecuencia relativa converge a la probabilidad verdadera conforme el número de repeticiones tiende a infinito. Ojo: esto no significa que «te toca» un evento si no ha salido; cada repetición es independiente.",
  "La probabilidad clásica de obtener un número par al lanzar un dado estándar de 6 caras es P = 3/6 = 1/2, porque hay 3 resultados favorables (2, 4, 6) de 6 posibles igualmente probables.",
  "La probabilidad frecuentista se determina empíricamente repitiendo el experimento muchas veces y calculando la frecuencia relativa de éxito, no antes del experimento.",
  "La probabilidad subjetiva es una estimación personal o experta basada en experiencia o creencias, y puede ser diferente para distintas personas ante el mismo evento.",
  "La probabilidad de cualquier evento A debe estar entre 0 y 1, es decir, 0 ≤ P(A) ≤ 1.",
];

export interface DatoClave {
  valor: string;
  texto: string;
  icono: string;
}

export const DATOS: DatoClave[] = [
  { valor: "1933", texto: "Kolmogorov publica los tres axiomas que fundamentan toda la probabilidad.", icono: "fa-landmark" },
  { valor: "0 ≤ P(A) ≤ 1", texto: "Primer axioma: ninguna probabilidad es negativa ni pasa de 1.", icono: "fa-ruler-horizontal" },
  { valor: "P(Ω) = 1", texto: "Segundo axioma: algo del espacio muestral tiene que ocurrir.", icono: "fa-circle-check" },
  { valor: "248/500", texto: "Una moneda lanzada 500 veces cayó cara 248: frecuencia relativa 0.496 ≈ 0.5.", icono: "fa-coins" },
];

/** Contexto mexicano — verbatim de la retroalimentación del quiz A2. */
export const CONTEXTO =
  "La SSA (Secretaria de Salud) usa modelos probabilisticos de transmision de enfermedades (tasas de reproduccion R0, probabilidades de contagio por contacto) para estimar cuantas personas pueden infectarse en una temporada de influenza o un brote de dengue, y decide con base en eso cuantas dosis de vacuna producir y distribuir en cada region del pais. Esta es estadistica inferencial y modelado probabilistico aplicados directamente a politica publica de salud.";

export const FUENTE = "Material CEN Bachillerato — PM-VI. Ref.: Kolmogorov, 1933; ley de los grandes numeros.";

/** Glosario A5 — los 6 términos verbatim. */
export interface GlosarioItem {
  termino: string;
  definicion: string;
  ejemplo: string;
}

export const GLOSARIO: GlosarioItem[] = [
  {
    termino: "Experimento aleatorio y espacio muestral",
    definicion:
      "Un experimento aleatorio es aquel cuyo resultado no puede predecirse con certeza. El espacio muestral (Ω o S) es el conjunto de todos los resultados posibles del experimento.",
    ejemplo: "Lanzar dos monedas: Ω = {CC, CS, SC, SS}. Lanzar un dado: Ω = {1, 2, 3, 4, 5, 6}.",
  },
  {
    termino: "Probabilidad clásica (regla de Laplace)",
    definicion:
      "P(A) = número de casos favorables a A / número total de casos igualmente posibles. Aplica cuando todos los resultados del espacio muestral son equiprobables.",
    ejemplo: "Extraer una carta roja de una baraja de 52: P = 26/52 = 1/2. Sacar un número mayor que 4 en un dado: P = 2/6 = 1/3.",
  },
  {
    termino: "Probabilidad frecuentista (empírica)",
    definicion:
      "P(A) ≈ número de veces que ocurrió A / número total de experimentos realizados (frecuencia relativa). Se aproxima al valor teórico conforme n → ∞ (Ley de los Grandes Números).",
    ejemplo: "Una moneda se lanza 500 veces y cae cara 248 veces. Probabilidad frecuentista de cara = 248/500 = 0.496 ≈ 0.5.",
  },
  {
    termino: "Probabilidad subjetiva",
    definicion:
      "Estimación de la probabilidad basada en el juicio personal, experiencia o información experta, sin un espacio muestral simétrico ni experimentos repetidos. Puede variar entre personas.",
    ejemplo: "Un médico estima: 'hay un 80% de probabilidad de que el paciente se recupere'. Un meteorólogo: 'probabilidad de 65% de lluvia mañana'.",
  },
  {
    termino: "Axiomas de Kolmogorov",
    definicion:
      "1) P(A) ≥ 0 para todo evento A. 2) P(Ω) = 1 (el espacio muestral tiene probabilidad 1). 3) Si A y B son mutuamente excluyentes: P(A∪B) = P(A) + P(B). Toda la teoría de probabilidad se construye sobre estos tres axiomas.",
    ejemplo: "P(cara) = 0.5 ≥ 0 ✓. P({1,2,3,4,5,6}) = 1 ✓. P(1 o 2) = P(1)+P(2) = 1/6+1/6 = 1/3 ✓.",
  },
  {
    termino: "Evento complementario",
    definicion:
      "El complemento de A (Aᶜ o Ā) es el evento que ocurre cuando A no ocurre. P(Aᶜ) = 1 − P(A). La suma de las probabilidades de un evento y su complemento siempre es 1.",
    ejemplo: "P(lluvia) = 0.35, entonces P(no lluvia) = 1 − 0.35 = 0.65. P(sacar 6 en dado) = 1/6, P(no sacar 6) = 5/6.",
  },
];

/* ── Reto evaluable: el quiz A2 completo, verbatim ────────────────────── */

export const QUIZ_A2: QuizEvaluable = {
  titulo: "¿Cuánto sabes sobre probabilidad clásica, frecuentista y axiomas de Kolmogorov?",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Cuál es la definición de probabilidad clásica (de Laplace) y qué supuesto fundamental requiere?",
      opciones: [
        "P(A) = frecuencia de A en muchas repeticiones; requiere un numero grande de experimentos",
        "P(A) = numero de casos favorables a A / numero total de casos posibles; requiere que todos los resultados sean igualmente posibles (equiprobabilidad)",
        "P(A) = grado de creencia subjetiva en A; no requiere ningun supuesto matematico",
        "P(A) = 1 - P(A'); requiere conocer la probabilidad del complemento de A",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "La probabilidad clasica de Laplace calcula P(A) = casos favorables / casos posibles, pero SOLO funciona bajo el supuesto de equiprobabilidad: todos los resultados del espacio muestral deben ser igualmente posibles. Funciona perfectamente para dados no cargados, monedas equilibradas, cartas bien mezcladas. No aplica a situaciones reales donde los resultados no son equiprobables (por ejemplo, la probabilidad de ganar una loteria no es 1/numero de participantes si los boletos no estan distribuidos uniformemente).",
    },
    {
      enunciado: "¿Qué garantiza la ley de los grandes números en el contexto de la probabilidad frecuentista?",
      opciones: [
        "Que con mas datos la media siempre aumenta",
        "Que conforme aumenta el numero de repeticiones del experimento, la frecuencia relativa del evento converge al valor verdadero de la probabilidad",
        "Que en un juego de azar siempre recuperas lo perdido si juegas suficientes veces",
        "Que la muestra siempre tiene exactamente las mismas proporciones que la poblacion",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "La ley de los grandes numeros establece que la frecuencia relativa de un evento en un experimento aleatorio converge al valor de la probabilidad verdadera conforme el numero de repeticiones tiende a infinito. Con pocas repeticiones hay mucha variabilidad por azar (puedo obtener 7 caras de 10 lanzamientos de una moneda justa). Con miles de repeticiones, la frecuencia relativa se acerca al 50% para una moneda equilibrada. Ojo: esto no significa que 'te toca' un evento si no ha salido; cada repeticion es independiente.",
    },
    {
      enunciado: "¿Cuáles son los axiomas de Kolmogorov que fundamentan matemáticamente la probabilidad?",
      opciones: [
        "P(A) esta entre -1 y 1; P(vacio) = 0; P(A union B) = P(A) x P(B)",
        "P(A) es mayor o igual a 0; P(espacio muestral) = 1; si A y B son mutuamente excluyentes, P(A union B) = P(A) + P(B)",
        "P(A) esta entre 0 y 100; P(espacio muestral) = 100; P(A interseccion B) = P(A) + P(B)",
        "P(A) = P(A'); P(espacio muestral) = 0.5; P(A union B) = P(A) - P(B)",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "Los tres axiomas de Kolmogorov (1933) son: (1) la probabilidad de cualquier evento es no negativa, P(A) >= 0; (2) la probabilidad del espacio muestral completo es 1, P(omega) = 1; (3) si dos eventos son mutuamente excluyentes (no pueden ocurrir al mismo tiempo), la probabilidad de que ocurra al menos uno es la suma de sus probabilidades, P(A union B) = P(A) + P(B). De estos tres principios se pueden deducir todas las demas propiedades y formulas de la probabilidad.",
    },
    {
      enunciado: "Si la probabilidad de que llueva mañana es P(lluvia) = 0.35, ¿cuál es la probabilidad de que NO llueva?",
      opciones: ["0.35", "0.65", "0.135", "1.35"],
      respuestaCorrecta: 1,
      retroalimentacion:
        "Por la propiedad del complemento: P(A') = 1 - P(A). P(no lluvia) = 1 - P(lluvia) = 1 - 0.35 = 0.65. Esto se deriva directamente del axioma de Kolmogorov que establece P(espacio muestral) = 1: como lluvia y no lluvia son mutuamente excluyentes y exhaustivos (uno de los dos debe ocurrir), sus probabilidades deben sumar 1.",
    },
    {
      enunciado: "¿Cuál de los siguientes es un ejemplo de probabilidad subjetiva?",
      opciones: [
        "La probabilidad de sacar un 6 al lanzar un dado justo es 1/6",
        "La probabilidad de que un recien nacido sea nino es 0.51 segun los registros del INEGI",
        "El medico dice: 'Dados tus sintomas y tu historial, yo diria que hay un 70% de probabilidad de que sea una infeccion viral'",
        "El pronostico del tiempo dice que hay 40% de probabilidad de lluvia basado en modelos de los ultimos 30 anos",
      ],
      respuestaCorrecta: 2,
      retroalimentacion:
        "La probabilidad subjetiva es el grado de creencia personal de un experto basada en experiencia e informacion disponible, no en un calculo formal de casos equiprobables ni en frecuencias historicas de millones de repeticiones. La estimacion del medico es tipicamente subjetiva: combina experiencia clinica, intuicion y la informacion del paciente particular. La opcion a es clasica (equiprobabilidad), la b es frecuentista (datos del INEGI), la d es frecuentista (modelos historicos de lluvia).",
    },
    {
      enunciado: "¿En cuál de las siguientes situaciones mexicanas se usa la probabilidad para tomar decisiones de política pública?",
      opciones: [
        "El INEGI decide cuantos empleados contratar para el proximo censo",
        "La SSA estima probabilidades de contagio de enfermedades infecciosas para decidir cuantas vacunas producir y distribuir antes de una temporada de influenza",
        "Un estudiante decide en que universidad estudiar segun su promedio de preparatoria",
        "Un maestro decide cuantas preguntas poner en un examen",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "La SSA (Secretaria de Salud) usa modelos probabilisticos de transmision de enfermedades (tasas de reproduccion R0, probabilidades de contagio por contacto) para estimar cuantas personas pueden infectarse en una temporada de influenza o un brote de dengue, y decide con base en eso cuantas dosis de vacuna producir y distribuir en cada region del pais. Esta es estadistica inferencial y modelado probabilistico aplicados directamente a politica publica de salud.",
    },
  ],
};

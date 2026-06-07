/**
 * Datos y matemáticas del laboratorio "Teorema Fundamental del Cálculo".
 *
 * Módulo PURO: NO importa three ni @react-three (límite de 3 MiB del Worker).
 * Aquí viven el catálogo de funciones (cada una con su ANTIDERIVADA exacta F),
 * las sumas de Riemann que aproximan el área bajo la curva, la integral exacta
 * F(b) − F(a) y el muestreo de la función de acumulación F(x) = ∫ₐˣ f.
 *
 * Pensamiento Matemático V — «Cálculo diferencial», propósito formativo O8:
 * "Comprende intuitivamente el Teorema Fundamental del Cálculo como conexión
 *  entre derivadas e integrales y su utilidad para analizar fenómenos de
 *  acumulación de cambios continuos."
 */

export type Modo = "area" | "acumulacion" | "conexion";

/** Dominio visible: x ∈ [0, XMAX]; el eje Y se dibuja hasta ≈ YMAX. */
export const A_FIJO = 0;
export const XMAX = 4;
export const YMAX = 8;
export const B_DEFAULT = 3;
export const N_DEFAULT = 6;
export const N_MIN = 1;
export const N_MAX = 40;

export interface Funcion {
  id: string;
  nombre: string;
  /** f(x) — la función que se integra (el "ritmo de cambio"). */
  f: (x: number) => number;
  /** F(x) — una antiderivada exacta, con F(0) = 0 para que F(x) = ∫₀ˣ f. */
  F: (x: number) => number;
  /** Fórmula de f para mostrar. */
  formula: string;
  /** Fórmula de su antiderivada F. */
  antiderivada: string;
  /** Lectura física del área bajo f (acumulación). */
  significado: string;
}

export const FUNCIONES: Funcion[] = [
  {
    id: "const3",
    nombre: "Velocidad constante",
    f: () => 3,
    F: (x) => 3 * x,
    formula: "f(x) = 3",
    antiderivada: "F(x) = 3x",
    significado: "Si f es una velocidad constante de 3 m/s, el área bajo la recta es la distancia recorrida: un rectángulo.",
  },
  {
    id: "lin",
    nombre: "Recta",
    f: (x) => x,
    F: (x) => (x * x) / 2,
    formula: "f(x) = x",
    antiderivada: "F(x) = x²⁄2",
    significado: "El área bajo la recta y = x es un triángulo: ∫₀ˣ t dt = x²⁄2.",
  },
  {
    id: "vel2t",
    nombre: "Recta v = 2t",
    f: (x) => 2 * x,
    F: (x) => x * x,
    formula: "f(x) = 2x",
    antiderivada: "F(x) = x²",
    significado: "Velocidad v(t) = 2t: el área bajo la gráfica v–t es la distancia d(t) = t², y d′(t) = 2t = v(t).",
  },
  {
    id: "cuad",
    nombre: "Parábola",
    f: (x) => 0.5 * x * x,
    F: (x) => (x * x * x) / 6,
    formula: "f(x) = ½x²",
    antiderivada: "F(x) = x³⁄6",
    significado: "Un cambio que se acelera: el área crece como x³⁄6, cada vez más rápido.",
  },
  {
    id: "raiz",
    nombre: "Raíz cuadrada",
    f: (x) => 2 * Math.sqrt(Math.max(0, x)),
    F: (x) => (4 / 3) * Math.pow(Math.max(0, x), 1.5),
    formula: "f(x) = 2√x",
    antiderivada: "F(x) = (4⁄3)x^{3⁄2}",
    significado: "Un cambio que se frena: el área sigue creciendo, pero cada vez más despacio.",
  },
  {
    id: "onda",
    nombre: "Onda (seno desplazado)",
    f: (x) => 1.5 * Math.sin(x) + 2,
    F: (x) => -1.5 * Math.cos(x) + 2 * x + 1.5, // F(0)=0
    formula: "f(x) = 1.5·sen x + 2",
    antiderivada: "F(x) = −1.5·cos x + 2x + 1.5",
    significado: "Un ritmo que sube y baja: el área acumulada avanza a tirones, más rápido en las crestas.",
  },
];

export const FUNCION_DEFAULT = "vel2t";

export const funcionPorId = (id: string): Funcion =>
  FUNCIONES.find((f) => f.id === id) ?? FUNCIONES[0]!;

/* ──────────────────────────────────────────────────────────────────────────
 * Curvas muestreadas (listas de puntos [x, y]).
 * ────────────────────────────────────────────────────────────────────────── */

/** Polilínea de y = f(x) en [a, b] con `pasos` segmentos. */
export function curvaF(fn: Funcion, a = A_FIJO, b = XMAX, pasos = 120): Array<[number, number]> {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= pasos; i++) {
    const x = a + ((b - a) * i) / pasos;
    pts.push([x, fn.f(x)]);
  }
  return pts;
}

/** Polilínea de la función de acumulación y = F(x) − F(a) en [a, b]. */
export function curvaAcumulada(fn: Funcion, a = A_FIJO, b = XMAX, pasos = 120): Array<[number, number]> {
  const base = fn.F(a);
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= pasos; i++) {
    const x = a + ((b - a) * i) / pasos;
    pts.push([x, fn.F(x) - base]);
  }
  return pts;
}

/** Borde superior del área sombreada [a, b] (para construir el polígono relleno). */
export function bordeArea(fn: Funcion, a: number, b: number, pasos = 80): Array<[number, number]> {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= pasos; i++) {
    const x = a + ((b - a) * i) / pasos;
    pts.push([x, fn.f(x)]);
  }
  return pts;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Sumas de Riemann e integral exacta.
 * ────────────────────────────────────────────────────────────────────────── */

export interface Rect {
  x0: number; // borde izquierdo
  w: number; // ancho
  h: number; // altura f(x0)  (regla del extremo izquierdo)
}

/** n rectángulos por el extremo IZQUIERDO que aproximan ∫ₐᵇ f. */
export function rectangulos(fn: Funcion, a: number, b: number, n: number): Rect[] {
  const w = (b - a) / n;
  const rects: Rect[] = [];
  for (let i = 0; i < n; i++) {
    const x0 = a + i * w;
    rects.push({ x0, w, h: fn.f(x0) });
  }
  return rects;
}

/** Suma de Riemann (área aproximada) con n rectángulos por el extremo izquierdo. */
export function sumaRiemann(fn: Funcion, a: number, b: number, n: number): number {
  const w = (b - a) / n;
  let s = 0;
  for (let i = 0; i < n; i++) s += fn.f(a + i * w) * w;
  return s;
}

/** Integral exacta ∫ₐᵇ f = F(b) − F(a), por el Teorema Fundamental del Cálculo. */
export const integralExacta = (fn: Funcion, a: number, b: number): number => fn.F(b) - fn.F(a);

/** Error relativo (%) entre la suma de Riemann y la integral exacta. */
export function errorRelativo(fn: Funcion, a: number, b: number, n: number): number {
  const exacta = integralExacta(fn, a, b);
  if (Math.abs(exacta) < 1e-9) return 0;
  return Math.abs((sumaRiemann(fn, a, b, n) - exacta) / exacta) * 100;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Formato.
 * ────────────────────────────────────────────────────────────────────────── */

export function fmtNum(n: number, dec = 2): string {
  if (Object.is(n, -0) || (n < 0 && n > -5e-3)) n = 0;
  const s = n.toLocaleString("es-MX", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  return s.replace("-", "−");
}

/* ──────────────────────────────────────────────────────────────────────────
 * Contenido didáctico (verbatim para A2 y paneles).
 * ────────────────────────────────────────────────────────────────────────── */

export const MODOS: Array<{ id: Modo; nombre: string; icon: string; desc: string }> = [
  { id: "area", nombre: "Área bajo la curva", icon: "fa-chart-area", desc: "Aproxima el área con rectángulos (suma de Riemann) y compárala con la integral exacta." },
  { id: "acumulacion", nombre: "Función de acumulación", icon: "fa-layer-group", desc: "Mira cómo F(x) = ∫₀ˣ f va acumulando el área a medida que avanza el límite." },
  { id: "conexion", nombre: "Conexión derivada↔integral", icon: "fa-link", desc: "El TFC: la pendiente de la función de acumulación F en x es justo la altura f(x)." },
];

export const PROBLEMA = {
  titulo: "Distancia como área bajo la velocidad",
  enunciado:
    "Un objeto parte del reposo y se mueve con velocidad v(t) = 2t (en m/s, t en s).\n\n" +
    "a) ¿Qué representa el ÁREA bajo la gráfica de v(t) entre t = 0 y t = 4 s?\n\n" +
    "b) Calcula esa área como la integral ∫₀⁴ 2t dt.\n\n" +
    "c) Verifica el Teorema Fundamental del Cálculo: comprueba que la función de acumulación (la distancia) d(t) = t² cumple d′(t) = v(t).",
  solucion: [
    "a) El área bajo la gráfica velocidad–tiempo es la DISTANCIA recorrida: el área acumula la velocidad a lo largo del tiempo (acumulación de un cambio continuo).",
    "b) ∫₀⁴ 2t dt = [t²]₀⁴ = 4² − 0² = 16 m. Geométricamente es el triángulo de base 4 y altura v(4) = 8: área = ½·4·8 = 16 m. Coinciden.",
    "c) La función de acumulación es d(t) = t²; su derivada es d′(t) = 2t = v(t). La derivada deshace la integral: eso es el Teorema Fundamental del Cálculo.",
  ],
  respuesta: "a) la distancia recorrida; b) ∫₀⁴ 2t dt = 16 m; c) d(t) = t² ⇒ d′(t) = 2t = v(t) ✓ (TFC).",
};

export const IDEAS = [
  { icon: "fa-chart-area", titulo: "La integral es un área", txt: "∫ₐᵇ f(x) dx es el área (con signo) encerrada entre la curva y el eje X en el intervalo [a, b]." },
  { icon: "fa-grip-lines-vertical", titulo: "Sumas de Riemann", txt: "Partimos [a, b] en n rectángulos: a más rectángulos, su suma se acerca cada vez más al área exacta." },
  { icon: "fa-layer-group", titulo: "Función de acumulación", txt: "F(x) = ∫ₐˣ f acumula el área desde a hasta x: dice cuánto cambio se ha sumado hasta ese punto." },
  { icon: "fa-link", titulo: "El Teorema Fundamental", txt: "Derivar la acumulación devuelve la función original: F′(x) = f(x). Y ∫ₐᵇ f = F(b) − F(a)." },
];

export const GLOSARIO = [
  { termino: "Integral definida", definicion: "El área con signo bajo y = f(x) entre x = a y x = b; se escribe ∫ₐᵇ f(x) dx." },
  { termino: "Suma de Riemann", definicion: "Aproximación del área con n rectángulos de ancho (b−a)/n; converge al área exacta cuando n crece." },
  { termino: "Antiderivada (primitiva)", definicion: "Una función F cuya derivada es f, es decir F′(x) = f(x); la integral es la operación inversa de derivar." },
  { termino: "Función de acumulación", definicion: "F(x) = ∫ₐˣ f(t) dt: el área acumulada desde a hasta x; mide cuánto se ha sumado el cambio." },
  { termino: "Teorema Fundamental del Cálculo", definicion: "Conecta derivada e integral: F′(x) = f(x) y ∫ₐᵇ f = F(b) − F(a)." },
  { termino: "Acumulación de cambios continuos", definicion: "Sumar un ritmo que varía a cada instante (p. ej. velocidad→distancia, caudal→volumen) usando la integral." },
];

export const CONTEXTO =
  "El área bajo una curva no es una abstracción: bajo una gráfica velocidad–tiempo es la distancia recorrida; bajo un caudal es el volumen que pasa por una tubería del Cutzamala; bajo la potencia eléctrica es la energía (kWh) que cobra la CFE; bajo la tasa de lluvia es el agua caída sobre una presa. En todos estos casos acumulamos un cambio que varía a cada instante: eso es integrar, y el Teorema Fundamental del Cálculo garantiza que derivar esa acumulación devuelve el ritmo original.";

export const FUENTE =
  "MCCEMS 2025 — Pensamiento Matemático V «Cálculo diferencial», propósito formativo O8 y contenido formativo: Integral como función inversa de la derivada · Área bajo la curva de una función dentro de un intervalo · Representación gráfica.";

/**
 * Datos para el laboratorio de Sistemas de ecuaciones lineales 2×2 (PM-II-P05).
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabSistemas.tsx) y la escena 3D (SistemasScene.tsx) sin arrastrar three.js
 * al bundle del shell.
 *
 * Idea pedagógica (MCCEMS 2025 — PM-II): un sistema 2×2
 *     a₁x + b₁y = c₁
 *     a₂x + b₂y = c₂
 * son DOS RECTAS en el plano cartesiano. Resolverlo es hallar el punto donde
 * se cruzan. Según cómo se acomoden las rectas hay TRES casos:
 *   · SOLUCIÓN ÚNICA   → las rectas se cruzan en un punto (pendientes distintas).
 *   · SIN SOLUCIÓN     → rectas PARALELAS (misma pendiente, distinta ordenada);
 *                        nunca se tocan.
 *   · INFINITAS        → rectas COINCIDENTES (la misma recta escrita de dos
 *                        formas); se tocan en todos sus puntos.
 * El criterio algebraico es el determinante D = a₁b₂ − a₂b₁: si D ≠ 0 hay una
 * sola solución; si D = 0 las rectas son paralelas o coincidentes.
 */

export type Caso = "unica" | "paralelas" | "coincidentes";
export type Grupo = "real" | "caso";

/** Una recta como ecuación estándar a·x + b·y = c (con b ≠ 0 en este lab). */
export interface Recta {
  a: number;
  b: number;
  c: number;
}

/** Ventana visible del plano cartesiano (en unidades de datos). */
export interface Ventana {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface Escenario {
  key: string;
  grupo: Grupo;
  titulo: string;
  icono: string; // Font Awesome 6
  contexto: string; // historia real o descripción del caso
  porque: string; // qué representa cada recta / por qué ese caso
  r1: Recta; // ecuación 1 (fija)
  r2: Recta; // ecuación 2 base (su pendiente se puede inclinar con el deslizador)
  xNombre: string; // significado de x
  yNombre: string; // significado de y
  casoBase: Caso; // caso con la pendiente base
  ventana: Ventana;
}

// Rango del deslizador que inclina la 2ª recta (pendiente m₂).
export const PEND_MIN = -3;
export const PEND_MAX = 3;
export const PEND_STEP = 0.25;

export const ESCENARIOS: Escenario[] = [
  // ── Situaciones reales (solución única) ─────────────────────────────
  {
    key: "granja",
    grupo: "real",
    titulo: "Gallinas y conejos",
    icono: "fa-kiwi-bird",
    contexto:
      "En un corral hay gallinas y conejos: en total se cuentan 8 cabezas y 22 patas. ¿Cuántas gallinas (x) y cuántos conejos (y) hay?",
    porque:
      "Una ecuación cuenta las cabezas (cada animal aporta 1) y la otra las patas (la gallina 2, el conejo 4). La solución debe cumplir las DOS a la vez.",
    r1: { a: 1, b: 1, c: 8 }, // cabezas:  x + y = 8
    r2: { a: 2, b: 4, c: 22 }, // patas:   2x + 4y = 22
    xNombre: "Gallinas",
    yNombre: "Conejos",
    casoBase: "unica",
    ventana: { xMin: -1, xMax: 12, yMin: -1, yMax: 9 },
  },
  {
    key: "dulces",
    grupo: "real",
    titulo: "Paletas y chocolates",
    icono: "fa-candy-cane",
    contexto:
      "En la tienda, 2 paletas y 1 chocolate cuestan $13; y 1 paleta con 1 chocolate cuestan $9. ¿Cuánto cuesta cada paleta (x) y cada chocolate (y)?",
    porque:
      "Cada compra es una ecuación que relaciona los mismos dos precios. El precio que satisface ambas compras es el punto de cruce.",
    r1: { a: 2, b: 1, c: 13 }, // 2x + y = 13
    r2: { a: 1, b: 1, c: 9 }, //  x + y = 9
    xNombre: "Paleta $",
    yNombre: "Chocolate $",
    casoBase: "unica",
    ventana: { xMin: -1, xMax: 10, yMin: -1, yMax: 14 },
  },
  {
    key: "monedas",
    grupo: "real",
    titulo: "Monedas de $5 y $10",
    icono: "fa-coins",
    contexto:
      "Tengo 12 monedas, unas de $5 y otras de $10, que juntas suman $95. ¿Cuántas monedas de $5 (x) y de $10 (y) tengo?",
    porque:
      "Una ecuación cuenta cuántas monedas son y la otra cuánto dinero suman. Solo un par de valores cumple las dos condiciones.",
    r1: { a: 1, b: 1, c: 12 }, // cantidad: x + y = 12
    r2: { a: 5, b: 10, c: 95 }, // dinero:  5x + 10y = 95
    xNombre: "Monedas $5",
    yNombre: "Monedas $10",
    casoBase: "unica",
    ventana: { xMin: -1, xMax: 20, yMin: -1, yMax: 13 },
  },
  // ── Los tres casos (rectas abstractas) ──────────────────────────────
  {
    key: "caso-unica",
    grupo: "caso",
    titulo: "Se cruzan · 1 solución",
    icono: "fa-xmark",
    contexto:
      "Dos rectas con pendientes distintas: y = x + 1 y y = −x + 3. Se cruzan en un punto, así que el sistema tiene UNA solución.",
    porque:
      "Pendientes diferentes ⇒ las rectas se inclinan distinto y forzosamente se cortan en un solo punto: el determinante D ≠ 0.",
    r1: { a: -1, b: 1, c: 1 }, // y = x + 1   (−x + y = 1)
    r2: { a: 1, b: 1, c: 3 }, //  y = −x + 3  ( x + y = 3)
    xNombre: "x",
    yNombre: "y",
    casoBase: "unica",
    ventana: { xMin: -6, xMax: 6, yMin: -6, yMax: 6 },
  },
  {
    key: "caso-paralelas",
    grupo: "caso",
    titulo: "Paralelas · sin solución",
    icono: "fa-equals",
    contexto:
      "Dos rectas con la MISMA pendiente pero distinta altura: y = ½x + 1 y y = ½x − 2. Nunca se tocan, así que NO hay solución.",
    porque:
      "Misma pendiente y distinta ordenada al origen ⇒ rectas paralelas. D = 0 y el sistema es incompatible (sin solución).",
    r1: { a: -1, b: 2, c: 2 }, // y = ½x + 1   (−x + 2y = 2)
    r2: { a: -1, b: 2, c: -4 }, // y = ½x − 2   (−x + 2y = −4)
    xNombre: "x",
    yNombre: "y",
    casoBase: "paralelas",
    ventana: { xMin: -6, xMax: 6, yMin: -6, yMax: 6 },
  },
  {
    key: "caso-coincidentes",
    grupo: "caso",
    titulo: "Coincidentes · infinitas",
    icono: "fa-clone",
    contexto:
      "La MISMA recta escrita de dos formas: x − 2y = −2 y su doble 2x − 4y = −4. Se tocan en todos sus puntos: INFINITAS soluciones.",
    porque:
      "La segunda ecuación es la primera multiplicada por 2: representan la misma recta. D = 0 y el sistema es compatible indeterminado.",
    r1: { a: 1, b: -2, c: -2 }, //  x − 2y = −2   (y = ½x + 1)
    r2: { a: 2, b: -4, c: -4 }, // 2x − 4y = −4   (y = ½x + 1)
    xNombre: "x",
    yNombre: "y",
    casoBase: "coincidentes",
    ventana: { xMin: -6, xMax: 6, yMin: -6, yMax: 6 },
  },
];

/** Pendiente de una recta a·x + b·y = c (b ≠ 0):  m = −a/b. */
export const pendiente = (r: Recta) => -r.a / r.b;

/** Ordenada al origen (valor de y cuando x = 0):  i = c/b. */
export const ordenada = (r: Recta) => r.c / r.b;

/** y de una recta en forma pendiente-ordenada para un x dado. */
export const yEn = (m: number, i: number, x: number) => m * x + i;

export interface Solucion {
  caso: Caso;
  x?: number;
  y?: number;
}

/**
 * Clasifica y resuelve un sistema dado por dos rectas en forma y = m·x + i.
 * (Usamos pendiente-ordenada porque el deslizador inclina la 2ª recta girándola
 *  sobre su ordenada al origen.)
 */
export function resolver(m1: number, i1: number, m2: number, i2: number): Solucion {
  const EPS = 1e-9;
  if (Math.abs(m1 - m2) < EPS) {
    return Math.abs(i1 - i2) < EPS ? { caso: "coincidentes" } : { caso: "paralelas" };
  }
  const x = (i2 - i1) / (m1 - m2);
  const y = m1 * x + i1;
  return { caso: "unica", x, y };
}

/**
 * Segmento VISIBLE de la recta y = m·x + i dentro de la ventana, recortado al
 * rectángulo. Devuelve [xInicio, xFin] o null si la recta no cruza la ventana.
 */
export function segmentoVisible(m: number, i: number, v: Ventana): [number, number] | null {
  let lo = v.xMin;
  let hi = v.xMax;
  if (m !== 0) {
    const xa = (v.yMin - i) / m;
    const xb = (v.yMax - i) / m;
    lo = Math.max(lo, Math.min(xa, xb));
    hi = Math.min(hi, Math.max(xa, xb));
  } else if (i < v.yMin || i > v.yMax) {
    return null; // recta horizontal fuera de la ventana
  }
  if (lo > hi) return null;
  return [lo, hi];
}

/** ¿El punto (x, y) cae dentro de la ventana visible? */
export const dentro = (x: number, y: number, v: Ventana) =>
  x >= v.xMin && x <= v.xMax && y >= v.yMin && y <= v.yMax;

/** Formatea un número con signo "−" tipográfico y sin ceros sobrantes. */
export const fmtNum = (n: number) => {
  const s = Number.isInteger(n)
    ? n.toLocaleString("es-MX")
    : n.toLocaleString("es-MX", { maximumFractionDigits: 2 });
  return s.replace("-", "−");
};

/** Ecuación estándar a·x + b·y = c en texto legible (omite coeficientes 1 y términos 0). */
export function eqStr(r: Recta): string {
  const parts: string[] = [];
  const push = (coef: number, varName: string) => {
    if (coef === 0) return;
    const mag = Math.abs(coef) === 1 ? varName : `${fmtNum(Math.abs(coef))}${varName}`;
    if (parts.length === 0) parts.push(coef < 0 ? `−${mag}` : mag);
    else parts.push(coef < 0 ? `− ${mag}` : `+ ${mag}`);
  };
  push(r.a, "x");
  push(r.b, "y");
  if (parts.length === 0) parts.push("0");
  return `${parts.join(" ")} = ${fmtNum(r.c)}`;
}

/** Etiqueta corta de cada caso. */
export const CASO_LABEL: Record<Caso, string> = {
  unica: "Solución única",
  paralelas: "Sin solución",
  coincidentes: "Infinitas soluciones",
};

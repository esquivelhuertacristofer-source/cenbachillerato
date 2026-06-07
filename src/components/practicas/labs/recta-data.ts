/**
 * Datos para el laboratorio de Recta numérica (PM-I-P02).
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabRectaNumerica.tsx) y la escena 3D (RectaScene.tsx) sin arrastrar three.js
 * al bundle del shell.
 *
 * Idea pedagógica: la RECTA NUMÉRICA ordena los números (enteros y racionales)
 * y da sentido a tres ideas que cuestan en abstracto:
 *   · El SIGNO ubica a cada lado del cero (positivos a la derecha, negativos a
 *     la izquierda); el cero es el origen.
 *   · El OPUESTO de a es −a: está a la misma distancia del cero, del otro lado.
 *   · El VALOR ABSOLUTO |a| es esa distancia al cero (siempre ≥ 0).
 *   · SUMAR es avanzar a la derecha; RESTAR es avanzar a la izquierda. Por eso
 *     restar un número equivale a sumar su opuesto.
 * Un contexto real (termómetro, altitud, dinero) hace tangible el signo.
 */

export type Modo = "ubicar" | "operar";
export type Operacion = "suma" | "resta";

export interface Contexto {
  key: string;
  titulo: string;
  icono: string; // Font Awesome 6
  unidad: string; // "°C", "m", "$" o "" (número puro)
  positivo: string; // qué significa estar a la derecha del cero
  negativo: string; // qué significa estar a la izquierda del cero
  cero: string; // qué representa el origen
}

export const CONTEXTOS: Contexto[] = [
  {
    key: "abstracto",
    titulo: "Número puro",
    icono: "fa-hashtag",
    unidad: "",
    positivo: "positivo",
    negativo: "negativo",
    cero: "el cero",
  },
  {
    key: "termometro",
    titulo: "Termómetro",
    icono: "fa-temperature-half",
    unidad: "°C",
    positivo: "sobre cero",
    negativo: "bajo cero",
    cero: "punto de congelación",
  },
  {
    key: "altitud",
    titulo: "Altitud",
    icono: "fa-mountain",
    unidad: "m",
    positivo: "sobre el nivel del mar",
    negativo: "bajo el nivel del mar",
    cero: "nivel del mar",
  },
  {
    key: "dinero",
    titulo: "Dinero",
    icono: "fa-wallet",
    unidad: "$",
    positivo: "a favor (ahorro)",
    negativo: "en contra (deuda)",
    cero: "sin saldo",
  },
];

/** La recta se dibuja de −RANGO a +RANGO. */
export const RANGO = 10;
/** En modo operar, a y b se limitan para que el resultado quepa en la recta. */
export const RANGO_OP = 5;

/** Opuesto (simétrico respecto al cero): −a. */
export const opuesto = (a: number) => -a;

/** Valor absoluto: distancia al cero (siempre ≥ 0). */
export const absoluto = (a: number) => Math.abs(a);

/** Resultado de la operación: sumar avanza a la derecha; restar, a la izquierda. */
export const operar = (a: number, b: number, op: Operacion) =>
  op === "suma" ? a + b : a - b;

/**
 * Formatea un número racional para lectura escolar: los enteros tal cual y los
 * medios como fracción (½). Otros decimales con 2 cifras.
 */
export const fmtNum = (n: number): string => {
  if (Object.is(n, -0)) return "0";
  if (Number.isInteger(n)) return `${n}`;
  const sign = n < 0 ? "−" : "";
  const abs = Math.abs(n);
  const whole = Math.floor(abs);
  const frac = abs - whole;
  if (Math.abs(frac - 0.5) < 1e-9) return `${sign}${whole === 0 ? "" : `${whole} `}½`;
  return n.toLocaleString("es-MX", { maximumFractionDigits: 2 });
};

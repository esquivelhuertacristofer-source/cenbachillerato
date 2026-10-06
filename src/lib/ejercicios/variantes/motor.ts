/**
 * MOTOR DEL BANCO DE EJERCICIOS CON VARIANTES.
 *
 * Un ejercicio numérico (`ejercicio_matematico`) trae siempre los mismos datos:
 * quien ya lo resolvió —o lo copió— no vuelve a practicar. Cada generador
 * conserva la MISMA situación y el MISMO procedimiento del ejercicio original y
 * solo cambia los números, dentro de rangos realistas y «bonitos».
 *
 * Todo es determinista a partir de una semilla (PRNG mulberry32), para que las
 * pruebas sean reproducibles y una variante se pueda volver a mostrar igual.
 */

/** Generador pseudoaleatorio: devuelve un número en [0, 1). */
export type RNG = () => number;

export interface Variante {
  /** Enunciado completo con los números de esta variante. */
  problema: string;
  /** Resultado numérico esperado (ya redondeado a lo que pide el enunciado). */
  respuesta: number;
  /** Unidades de la respuesta, para la etiqueta de la casilla. */
  unidades?: string;
  /** Margen absoluto aceptado al calificar con `coincideNumero`. */
  tolerancia: number;
  /** Procedimiento con los valores sustituidos; el último paso trae el resultado. */
  pasos: string[];
  /** Resultado legible para la solución («450 g»). */
  respuestaTexto: string;
}

export type Generador = (rng: RNG) => Variante;

/**
 * Definición de un generador: los datos del ejercicio original, cómo elegir
 * datos nuevos y cómo resolverlos. Separar «elegir» de «resolver» permite que
 * las pruebas resuelvan el caso original (números fijos) y lo comparen con la
 * respuesta publicada del ejercicio.
 */
export interface Definicion {
  generar: Generador;
  /** Resuelve el ejercicio con los datos ORIGINALES. */
  original: () => Variante;
}

export function definir<P>(d: { original: P; elegir: (rng: RNG) => P; resolver: (p: P) => Variante }): Definicion {
  return {
    generar: (rng) => d.resolver(d.elegir(rng)),
    original: () => d.resolver(d.original),
  };
}

// ── Azar con semilla ─────────────────────────────────────────────────────────

/** mulberry32: PRNG de 32 bits, rápido y suficiente para elegir números. */
export function mulberry32(semilla: number): RNG {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Semilla nueva no determinista (para «Otro ejercicio»). */
export function nuevaSemilla(): number {
  return Math.floor(Math.random() * 4294967296) >>> 0;
}

/** Entero uniforme en [min, max], ambos incluidos. */
export function entero(rng: RNG, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

/** Múltiplo de `paso` en [min, max] (min y max deben ser múltiplos de `paso`). */
export function multiplo(rng: RNG, min: number, max: number, paso: number): number {
  const n = entero(rng, Math.round(min / paso), Math.round(max / paso));
  return redondear(n * paso, decimalesDe(paso));
}

export function elegir<T>(rng: RNG, opciones: readonly T[]): T {
  return opciones[Math.floor(rng() * opciones.length)]!;
}

/** Elige `k` elementos distintos (orden aleatorio). */
export function elegirVarios<T>(rng: RNG, opciones: readonly T[], k: number): T[] {
  const copia = [...opciones];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copia[i], copia[j]] = [copia[j]!, copia[i]!];
  }
  return copia.slice(0, k);
}

// ── Números ──────────────────────────────────────────────────────────────────

export function redondear(x: number, decimales = 2): number {
  const f = 10 ** decimales;
  const r = Math.round((x + Number.EPSILON * Math.sign(x)) * f) / f;
  return Object.is(r, -0) ? 0 : r;
}

function decimalesDe(x: number): number {
  const s = String(x);
  const i = s.indexOf('.');
  return i < 0 ? 0 : s.length - i - 1;
}

/**
 * Formato de número para México: punto decimal, coma de miles y signo «−».
 * Muestra hasta `maxDecimales` (sin ceros sobrantes) salvo que se pida un
 * número fijo con `fijos`. `leerNumero` lee de vuelta todo lo que produce.
 */
export function fmt(n: number, maxDecimales = 4, fijos?: number): string {
  if (!Number.isFinite(n)) return String(n);
  const dec = fijos ?? maxDecimales;
  let s = Math.abs(redondear(n, dec)).toFixed(dec);
  if (fijos === undefined && s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  const [ent, frac] = s.split('.');
  const conMiles = ent!.length > 3 ? ent!.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ent!;
  const signo = redondear(n, dec) < 0 ? '−' : '';
  return `${signo}${conMiles}${frac ? `.${frac}` : ''}`;
}

/** Número entre paréntesis si es negativo, para sustituir en fórmulas: «(−3)». */
export function par(n: number, maxDecimales = 4): string {
  return n < 0 ? `(${fmt(n, maxDecimales)})` : fmt(n, maxDecimales);
}

/** Pesos: «$1,250.50» (siempre dos decimales si no es entero). */
export function pesos(n: number): string {
  return Number.isInteger(redondear(n, 2)) ? `$${fmt(n, 0)}` : `$${fmt(n, 2, 2)}`;
}

export function mcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

export function factorial(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

export function combinaciones(n: number, k: number): number {
  return Math.round(factorial(n) / (factorial(k) * factorial(n - k)));
}

const SUPERINDICES: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻',
};

/** Exponente como superíndice: sup(-2) → «⁻²». */
export function sup(n: number): string {
  return [...String(n)].map((c) => SUPERINDICES[c] ?? c).join('');
}

/**
 * Polinomio en `x` a partir de sus coeficientes (del grado mayor al término
 * independiente): poli([1, -3, -9, 5]) → «x³ − 3x² − 9x + 5».
 */
export function poli(coefs: number[], variable = 'x'): string {
  const grado = coefs.length - 1;
  const terminos: string[] = [];
  coefs.forEach((c, i) => {
    if (c === 0) return;
    const g = grado - i;
    const abs = Math.abs(c);
    const num = abs === 1 && g > 0 ? '' : fmt(abs);
    const lit = g === 0 ? '' : g === 1 ? variable : `${variable}${sup(g)}`;
    const signo = c < 0 ? '−' : '+';
    terminos.push(terminos.length === 0 ? `${c < 0 ? '−' : ''}${num}${lit}` : `${signo} ${num}${lit}`);
  });
  return terminos.length ? terminos.join(' ') : '0';
}

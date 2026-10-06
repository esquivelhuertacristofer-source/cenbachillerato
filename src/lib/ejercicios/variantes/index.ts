/**
 * BANCO DE EJERCICIOS CON VARIANTES — registro.
 *
 * `GENERADORES[codigo](rng)` produce una variante del ejercicio con ese código
 * de actividad (p. ej. 'PM-I-P05-A6'). `generarVariante(codigo, semilla?)` es la
 * entrada cómoda: con semilla es reproducible; sin ella, aleatoria.
 *
 * Es código del cliente: no lee ni escribe la base de datos, y la práctica con
 * variantes no cuenta para la calificación.
 */
import { mulberry32, nuevaSemilla, type Definicion, type Generador, type Variante } from './motor';
import { DEFINICIONES_CNEYT } from './generadores-cneyt';
import { DEFINICIONES_PM_1A3 } from './generadores-pm-1a3';
import { DEFINICIONES_PM_4A6 } from './generadores-pm-4a6';

export type { Variante, Generador, RNG } from './motor';
export { mulberry32, nuevaSemilla, fmt } from './motor';

export const DEFINICIONES: Readonly<Record<string, Definicion>> = {
  ...DEFINICIONES_CNEYT,
  ...DEFINICIONES_PM_1A3,
  ...DEFINICIONES_PM_4A6,
};

export const GENERADORES: Readonly<Record<string, Generador>> = Object.fromEntries(
  Object.entries(DEFINICIONES).map(([codigo, d]) => [codigo, d.generar]),
);

/**
 * Ejercicios numéricos que NO tienen generador, con la razón. Se documentan
 * aquí para que nadie los dé por olvidados.
 */
export const EJERCICIOS_SIN_VARIANTE: Readonly<Record<string, string>> = {
  'PM-I-P03-A2': 'Pide construir una tabla de verdad y clasificar la proposición (tautología): no hay un resultado numérico.',
  'PM-I-P07-A2': 'Pide juzgar si un resultado es razonable (sí/no) por estimación: la respuesta es un juicio, no un número.',
  'PM-II-P02-A2': 'La respuesta es un polinomio (expresión algebraica), no un número.',
  'PM-II-P03-A2': 'Pide factorizar: la respuesta es una expresión algebraica.',
  'PM-II-P07-A8': 'Operaciones con monomios y binomios: la respuesta es una expresión algebraica.',
  'PM-II-P08-A8': 'Productos notables: la respuesta es una expresión algebraica.',
  'PM-IV-P04-A2': 'Pide valores EXACTOS del círculo unitario (con radicales, como −√3/2): un decimal no evalúa lo que se enseña.',
};

export function tieneVariantes(codigo: string | null | undefined): boolean {
  return !!codigo && Object.prototype.hasOwnProperty.call(GENERADORES, codigo);
}

/** Variante del ejercicio `codigo`; `null` si no tiene generador. */
export function generarVariante(codigo: string, semilla: number = nuevaSemilla()): Variante | null {
  const generar = tieneVariantes(codigo) ? GENERADORES[codigo] : undefined;
  return generar ? generar(mulberry32(semilla)) : null;
}

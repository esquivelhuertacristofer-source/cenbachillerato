/**
 * Datos para el laboratorio de Fracciones, decimales y porcentajes (PM-I-P04).
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabFracciones.tsx) y la escena 3D (FraccionesScene.tsx) sin arrastrar three.js
 * al bundle del shell.
 *
 * Idea pedagógica: una misma cantidad puede expresarse de TRES formas
 * equivalentes —fracción, decimal y porcentaje— y aplicarse a cantidades reales
 * (descuentos, propinas, impuestos). Fracciones equivalentes (1/2 = 2/4 = 50%)
 * representan exactamente la misma parte del todo.
 */

/** Denominadores disponibles para construir la fracción. */
export const DENOMINADORES = [2, 3, 4, 5, 6, 8, 10] as const;

/** Cantidades de dinero (MXN) para aplicar el porcentaje. */
export const CANTIDADES = [100, 250, 400, 750] as const;

export const decimalDe = (n: number, d: number) => (d === 0 ? 0 : n / d);
export const porcentajeDe = (n: number, d: number) => decimalDe(n, d) * 100;

/** Máximo común divisor (para simplificar fracciones). */
export function mcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

/** Devuelve la fracción simplificada [n, d]. */
export function simplifica(n: number, d: number): [number, number] {
  if (n === 0) return [0, 1];
  const g = mcd(n, d);
  return [n / g, d / g];
}

export type ContextoKey = "descuento" | "propina" | "impuesto";

export interface Contexto {
  key: ContextoKey;
  nombre: string;
  icono: string; // Font Awesome 6
  op: "resta" | "suma";
  etiqueta: string; // cómo se llama el resultado
}

/** Contextos cotidianos donde se aplica un porcentaje a una cantidad. */
export const CONTEXTOS: Contexto[] = [
  { key: "descuento", nombre: "Descuento", icono: "fa-tag", op: "resta", etiqueta: "Pagas" },
  { key: "propina", nombre: "Propina", icono: "fa-utensils", op: "suma", etiqueta: "Pagas en total" },
  { key: "impuesto", nombre: "Impuesto", icono: "fa-receipt", op: "suma", etiqueta: "Pagas con impuesto" },
];

/**
 * Datos para el laboratorio de Potencias y raíces (PM-I-P09).
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabPotencias.tsx) y la escena 3D (PotenciasScene.tsx) sin arrastrar three.js
 * al bundle del shell.
 *
 * Idea pedagógica: una POTENCIA es una multiplicación repetida. Elevar al
 * CUADRADO (n²) construye un área (un cuadrado de lado n); elevar al CUBO (n³)
 * construye un volumen (un cubo de arista n). La RAÍZ es la operación inversa:
 * dado el área o el volumen, devuelve el lado n (√ para el cuadrado, ∛ para el
 * cubo). Por eso √(n²) = n y ∛(n³) = n.
 */

/** Bases disponibles (cap 6 → como mucho 6³ = 216 cubitos en la escena). */
export const BASES = [1, 2, 3, 4, 5, 6] as const;

/** Solo los exponentes con forma geométrica directa. */
export type Exponente = 2 | 3;

export interface ExponenteInfo {
  e: Exponente;
  nombre: string;
  simbolo: string; // ² o ³
  forma: string; // área / volumen
  figura: string; // cuadrado / cubo
  icono: string; // Font Awesome 6
  raiz: string; // √ o ∛
}

export const EXPONENTES: ExponenteInfo[] = [
  { e: 2, nombre: "Al cuadrado", simbolo: "²", forma: "área", figura: "cuadrado", icono: "fa-square", raiz: "√" },
  { e: 3, nombre: "Al cubo", simbolo: "³", forma: "volumen", figura: "cubo", icono: "fa-cube", raiz: "∛" },
];

/** n elevado a e (e ∈ {2,3}). */
export const potencia = (n: number, e: Exponente) => (e === 2 ? n * n : n * n * n);

/** Expansión legible: "n × n" o "n × n × n". */
export const expansion = (n: number, e: Exponente) =>
  e === 2 ? `${n} × ${n}` : `${n} × ${n} × ${n}`;

/**
 * Datos para el laboratorio de Notación científica (PM-I-P06).
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabNotacionCientifica.tsx) y la escena 3D (NotacionScene.tsx) sin arrastrar
 * three.js al bundle del shell.
 *
 * Idea pedagógica: la NOTACIÓN CIENTÍFICA escribe cualquier número como
 *   a × 10ⁿ      con   1 ≤ a < 10   (la "mantisa")   y   n entero (el exponente).
 *   · El EXPONENTE dice cuántos lugares se mueve el punto decimal: positivo lo
 *     corre a la derecha (número grande), negativo a la izquierda (pequeño).
 *   · Cada unidad de n multiplica o divide por 10 → es una ESCALA LOGARÍTMICA:
 *     del átomo (10⁻¹⁰ m) al Sol (10⁹ m) hay 19 saltos de ×10.
 *   · CONVERTIR de unidad solo cambia el exponente: 1 m = 10⁻³ km = 10³ mm.
 */

export interface Referencia {
  key: string;
  nombre: string;
  icono: string; // Font Awesome 6
  a: number; // mantisa real (1 ≤ a < 10)
  n: number; // exponente real (tamaño en metros)
}

/** Tamaños reales en metros, del átomo al Sol — la "torre de escalas". */
export const REFERENCIAS: Referencia[] = [
  { key: "atomo", nombre: "Átomo", icono: "fa-atom", a: 1.0, n: -10 },
  { key: "adn", nombre: "Molécula de ADN", icono: "fa-dna", a: 2.0, n: -9 },
  { key: "virus", nombre: "Virus", icono: "fa-virus", a: 1.0, n: -7 },
  { key: "bacteria", nombre: "Bacteria", icono: "fa-bacterium", a: 2.0, n: -6 },
  { key: "hormiga", nombre: "Hormiga", icono: "fa-bug", a: 5.0, n: -3 },
  { key: "mano", nombre: "Una mano", icono: "fa-hand", a: 2.0, n: -1 },
  { key: "persona", nombre: "Una persona", icono: "fa-person", a: 1.7, n: 0 },
  { key: "ballena", nombre: "Ballena azul", icono: "fa-fish", a: 3.0, n: 1 },
  { key: "montana", nombre: "Monte Everest", icono: "fa-mountain", a: 8.8, n: 3 },
  { key: "luna", nombre: "La Luna (diám.)", icono: "fa-moon", a: 3.5, n: 6 },
  { key: "tierra", nombre: "La Tierra (diám.)", icono: "fa-earth-americas", a: 1.3, n: 7 },
  { key: "sol", nombre: "El Sol (diám.)", icono: "fa-sun", a: 1.4, n: 9 },
];

export const N_MIN = -10;
export const N_MAX = 9;
export const A_MIN = 1;
export const A_MAX = 9.9;

/** Posición en la escala logarítmica: log₁₀(a × 10ⁿ) = n + log₁₀(a). */
export const logPos = (a: number, n: number) => n + Math.log10(a);

/**
 * Escribe a × 10ⁿ en su forma decimal desarrollada, corriendo el punto n
 * lugares. Devuelve solo dígitos y punto (sin separadores), p. ej.
 *   (3.2, 4)  → "32000"      (3.2, -3) → "0.0032"     (1.7, 0) → "1.7"
 */
export function expandir(a: number, n: number): string {
  const aStr = a.toFixed(1).replace(/\.0$/, ""); // "3.2" o "5"
  const partes = aStr.split(".");
  const intPart = partes[0] ?? "0";
  const fracPart = partes[1] ?? "";
  const digits = intPart + fracPart;
  const pointIndex = intPart.length + n; // nueva posición del punto
  if (pointIndex <= 0) return `0.${"0".repeat(-pointIndex)}${digits}`;
  if (pointIndex >= digits.length) return `${digits}${"0".repeat(pointIndex - digits.length)}`;
  return `${digits.slice(0, pointIndex)}.${digits.slice(pointIndex)}`;
}

/** Agrupa la parte entera de a en miles con espacios finos para leerla mejor. */
export function agrupar(decimal: string): string {
  const partes = decimal.split(".");
  const ent = partes[0] ?? "0";
  const fr = partes[1];
  const entGrp = ent.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return fr ? `${entGrp}.${fr}` : entGrp;
}

/** Mantisa formateada (una cifra decimal salvo enteros). */
export const fmtA = (a: number): string => a.toFixed(1).replace(/\.0$/, "");

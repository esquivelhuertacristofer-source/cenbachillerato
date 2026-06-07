/**
 * Datos para el laboratorio de Ecuación lineal de una variable — la balanza
 * (PM-II-P09).
 *
 * Módulo de DATOS PUROS (sin three, sin react): lo comparten el shell de UI
 * (LabBalanza.tsx) y la escena 3D (BalanzaScene.tsx) sin arrastrar three.js al
 * bundle del shell.
 *
 * Idea pedagógica (MCCEMS 2025 — PM-II "Ecuación, igualdad y sus propiedades"):
 * una ecuación a·x + b = c es una BALANZA en equilibrio. Los dos platos pesan
 * lo mismo. Para despejar x se aplica la PROPIEDAD DE UNIFORMIDAD: lo que se
 * hace de un lado debe hacerse del otro, así la igualdad (el equilibrio) se
 * conserva. Quitar las b unidades de ambos lados y luego repartir en a partes
 * iguales deja a x sola; el otro plato muestra su valor.
 *   · Operar en AMBOS lados  →  la balanza sigue nivelada (igualdad válida).
 *   · Operar en UN solo lado →  la balanza se inclina (se rompe la igualdad).
 */

export interface Escenario {
  key: string;
  titulo: string;
  icono: string; // Font Awesome 6
  contexto: string; // historia real
  porque: string; // qué representan x y las unidades
  a: number; // coeficiente de x  (cuántas "x" en el plato izquierdo)
  b: number; // unidades sueltas en el plato izquierdo
  c: number; // unidades en el plato derecho  (a·x + b = c)
  xNombre: string; // qué es la incógnita
  unidad: string; // nombre de la unidad suelta (kg, $, canicas…)
}

export const ESCENARIOS: Escenario[] = [
  {
    key: "mochila",
    titulo: "La mochila misteriosa",
    icono: "fa-bag-shopping",
    contexto:
      "Una mochila (x) junto con 3 kg de libros pesa 8 kg en total. ¿Cuánto pesa la mochila sola?",
    porque:
      "La incógnita x es el peso de la mochila; cada unidad es 1 kg. La balanza muestra que mochila + 3 kg pesa lo mismo que 8 kg.",
    a: 1,
    b: 3,
    c: 8, // x + 3 = 8  →  x = 5
    xNombre: "Peso de la mochila",
    unidad: "kg",
  },
  {
    key: "canicas",
    titulo: "Dos bolsas de canicas",
    icono: "fa-circle",
    contexto:
      "Dos bolsas iguales (x cada una) más 4 canicas sueltas equilibran 10 canicas. ¿Cuántas canicas tiene cada bolsa?",
    porque:
      "Cada bolsa es una x con las mismas canicas dentro; cada unidad es 1 canica. Hay dos x porque son dos bolsas iguales.",
    a: 2,
    b: 4,
    c: 10, // 2x + 4 = 10  →  x = 3
    xNombre: "Canicas por bolsa",
    unidad: "canicas",
  },
  {
    key: "cajas",
    titulo: "Tres cajas iguales",
    icono: "fa-box",
    contexto:
      "Tres cajas iguales (x cada una) más 2 kg equilibran 11 kg. ¿Cuánto pesa cada caja?",
    porque:
      "Las tres cajas pesan lo mismo (tres x). Para descubrir una hay que repartir en partes iguales tras quitar el peso suelto.",
    a: 3,
    b: 2,
    c: 11, // 3x + 2 = 11  →  x = 3
    xNombre: "Peso de cada caja",
    unidad: "kg",
  },
  {
    key: "ahorro",
    titulo: "El doble de mi ahorro",
    icono: "fa-piggy-bank",
    contexto:
      "El doble de lo que ahorré (x) más $5 da $13. ¿Cuánto ahorré?",
    porque:
      "x es lo que ahorré; el doble son dos x. Cada unidad vale $1. Quito los $5 de ambos lados y reparto entre 2.",
    a: 2,
    b: 5,
    c: 13, // 2x + 5 = 13  →  x = 4
    xNombre: "Ahorro",
    unidad: "$",
  },
];

/** Solución de a·x + b = c. */
export const solucion = (e: Escenario) => (e.c - e.b) / e.a;

/** Texto del lado izquierdo según el estado (aCount·x + leftUnits). */
export function ladoIzq(aCount: number, leftUnits: number): string {
  const xTerm = aCount === 0 ? "" : aCount === 1 ? "x" : `${aCount}x`;
  if (aCount === 0) return leftUnits === 0 ? "0" : `${leftUnits}`;
  if (leftUnits === 0) return xTerm;
  return `${xTerm} + ${leftUnits}`;
}

/** Estado inicial del problema. */
export interface Estado {
  aCount: number; // cuántas "x" quedan en el plato izquierdo
  leftUnits: number; // unidades sueltas a la izquierda
  rightUnits: number; // unidades a la derecha
}

export const estadoInicial = (e: Escenario): Estado => ({
  aCount: e.a,
  leftUnits: e.b,
  rightUnits: e.c,
});

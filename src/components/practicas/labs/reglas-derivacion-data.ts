/**
 * Datos puros del reto evaluable del laboratorio de Reglas de derivación (PM-V-P04).
 *
 * Reproduce VERBATIM el ejercicio ancla A2 «Ejercicios de derivación con todas
 * las reglas» (ejercicio_matematico, practica_slug=reglas-derivacion).
 *
 * El ejercicio original pide derivadas simbólicas (tipo_respuesta "desarrollo").
 * Para hacer el reto evaluable numéricamente se pide al alumno evaluar cada
 * derivada en un punto concreto indicado en la etiqueta, siguiendo los mismos
 * pasos verbatim del ejercicio.
 *
 * Verificación aritmética (comprobada manualmente):
 *  (a) f'(x) = 15x⁴ − 6x² + 7  →  f'(1) = 15(1) − 6(1) + 7 = 16
 *  (b) g'(x) = 9x² − 4x + 3    →  g'(1) = 9 − 4 + 3 = 8
 *  (c) h'(x) = (x²−2x−1)/(x−1)²  →  h'(0) = (0−0−1)/(0−1)² = −1/1 = −1
 *  (d) k'(x) = 24x²(2x³+1)³    →  k'(1) = 24(1)(3)³ = 24·27 = 648
 *
 * Sin three: seguro de importar desde el shell del lab.
 *
 * Fuente: PM-V-P04-A2 (_sem5_dump.txt líneas 4025–4037).
 */

import type { RetoNumericoData } from "./_reto-numerico";

// VERBATIM de PM-V-P04-A2 (ejercicio_matematico, tipo_respuesta "desarrollo").
export const RETO_A2: RetoNumericoData = {
  titulo: "Ejercicios de derivación con todas las reglas",
  contexto:
    "Deriva las siguientes funciones aplicando las reglas correspondientes. Indica cuál regla usas en cada caso. Para verificar numéricamente, evalúa cada derivada en el punto indicado.",
  problema:
    "(a) f(x) = 3x⁵ − 2x³ + 7x − 1  [regla de la potencia]  →  calcula f'(1)\n" +
    "(b) g(x) = (x² + 1)(3x − 2)  [regla del producto]  →  calcula g'(1)\n" +
    "(c) h(x) = (x² + 1)/(x − 1)  [regla del cociente]  →  calcula h'(0)\n" +
    "(d) k(x) = (2x³ + 1)⁴  [regla de la cadena]  →  calcula k'(1)",
  campos: [
    {
      etiqueta: "(a) f(x) = 3x⁵ − 2x³ + 7x − 1  →  f'(1)  [potencia]",
      objetivo: 16,
      tolerancia: 0,
      placeholder: "16",
    },
    {
      etiqueta: "(b) g(x) = (x²+1)(3x−2)  →  g'(1)  [producto]",
      objetivo: 8,
      tolerancia: 0,
      placeholder: "8",
    },
    {
      etiqueta: "(c) h(x) = (x²+1)/(x−1)  →  h'(0)  [cociente]",
      objetivo: -1,
      tolerancia: 0,
      placeholder: "−1",
    },
    {
      etiqueta: "(d) k(x) = (2x³+1)⁴  →  k'(1)  [cadena]",
      objetivo: 648,
      tolerancia: 0,
      placeholder: "648",
    },
  ],
  pasosGuia: [
    "(a) Regla de la potencia término a término: f'(x) = 3·5x⁴ − 2·3x² + 7·1 − 0 = 15x⁴ − 6x² + 7. f'(1) = 15 − 6 + 7 = 16.",
    "(b) Regla del producto: (fg)' = f'g + fg'. Con f=x²+1 (f'=2x) y g=3x−2 (g'=3): g'(x) = 2x(3x−2) + (x²+1)(3) = 6x²−4x + 3x²+3 = 9x²−4x+3. g'(1) = 9 − 4 + 3 = 8.",
    "(c) Regla del cociente: (f/g)' = (f'g − fg')/g². f=x²+1 (f'=2x), g=x−1 (g'=1): h'(x) = [2x(x−1) − (x²+1)(1)] / (x−1)² = [2x²−2x−x²−1] / (x−1)² = (x²−2x−1)/(x−1)². h'(0) = (0−0−1)/(0−1)² = −1/1 = −1.",
    "(d) Regla de la cadena: función exterior u⁴ (derivada 4u³), función interior u=2x³+1 (derivada 6x²): k'(x) = 4(2x³+1)³ · 6x² = 24x²(2x³+1)³. k'(1) = 24·1·(2+1)³ = 24·27 = 648.",
  ],
  respuestaFinal:
    "(a) f'(x) = 15x⁴ − 6x² + 7; f'(1) = 16. (b) g'(x) = 9x² − 4x + 3; g'(1) = 8. (c) h'(x) = (x²−2x−1)/(x−1)²; h'(0) = −1. (d) k'(x) = 24x²(2x³+1)³; k'(1) = 648.",
};

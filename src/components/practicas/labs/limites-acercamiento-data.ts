/**
 * Datos puros del reto evaluable del laboratorio de Límites (PM-V-P01).
 *
 * Reproduce VERBATIM el ejercicio ancla A2 «Calculando límites: del límite
 * básico al 0/0 indeterminado» (ejercicio_matematico, PM-V-P01-A2,
 * practica_slug=limites-acercamiento).
 *
 * Aritmética verificada:
 *   (a) s(t) = 3t²+5t → s(2) = 3(4)+5(2) = 12+10 = 22; 22/2 = 11 ✓
 *   (b) (x²−9)/(x−3) = (x+3)(x−3)/(x−3) → lim(x→3)(x+3) = 6 ✓
 *   (c) sen(2x)/x = 2·[sen(2x)/(2x)] → 2·1 = 2 ✓
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { RetoNumericoData } from "./_reto-numerico";

// VERBATIM de PM-V-P01-A2 (ejercicio_matematico, tipo_respuesta "desarrollo").
export const RETO_A2: RetoNumericoData = {
  titulo: "Calculando límites: del límite básico al 0/0 indeterminado",
  contexto:
    "Un automóvil en la autopista México-Querétaro tiene como función de posición s(t) = 3t² + 5t (en km, con t en horas).",
  problema:
    "(a) Calcula lim(t→2) s(t)/t. Interpreta el resultado.\n" +
    "(b) Resuelve la indeterminación: lim(x→3) (x² - 9)/(x - 3).\n" +
    "(c) Estima lim(x→0) sen(2x)/x usando el límite notable lim(x→0) sen(x)/x = 1.",
  campos: [
    {
      etiqueta: "a) lim(t→2) s(t)/t — velocidad promedio en km/h",
      objetivo: 11,
      tolerancia: 0,
      unidad: "km/h",
      placeholder: "11",
    },
    {
      etiqueta: "b) lim(x→3) (x² − 9)/(x − 3)",
      objetivo: 6,
      tolerancia: 0,
      placeholder: "6",
    },
    {
      etiqueta: "c) lim(x→0) sen(2x)/x",
      objetivo: 2,
      tolerancia: 0,
      placeholder: "2",
    },
  ],
  pasosGuia: [
    "(a) Calcula s(2) = 3(4) + 5(2) = 12 + 10 = 22 km. Entonces s(2)/2 = 22/2 = 11 km/h. Interpretación: es la velocidad promedio del auto desde t=0 hasta t=2 horas.",
    "(b) Sustituye x=3: (9-9)/(3-3) = 0/0 — forma indeterminada. Factoriza el numerador: x²-9 = (x+3)(x-3). Cancela (x-3): lim(x→3) (x+3) = 3+3 = 6.",
    "(c) Reescribe: sen(2x)/x = 2 · [sen(2x)/(2x)]. Cuando x→0, también 2x→0, entonces lim(2x→0)[sen(2x)/(2x)] = 1. Por lo tanto lim(x→0) sen(2x)/x = 2·1 = 2.",
    "Verificación (c): sen(0.01)/0.01 ≈ 0.009999833/0.01 ≈ 0.9999833 → 2·0.9999833 ≈ 1.9999 ≈ 2 ✓",
  ],
  respuestaFinal:
    "a) 11 km/h (velocidad promedio del auto de t=0 a t=2 h). b) 6 (factorización: x²−9 = (x+3)(x−3)). c) 2 (límite notable: sen(2x)/x = 2·[sen(2x)/(2x)] → 2·1 = 2).",
};

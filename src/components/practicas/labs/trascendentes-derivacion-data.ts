/**
 * Datos puros del reto evaluable del laboratorio de derivadas trascendentes
 * (PM-V-P05).
 *
 * Fuente: PM-V-P05-A2 «Calculando derivadas de funciones trigonométricas y
 * exponenciales» (ejercicio_matematico, tipo_respuesta="desarrollo").
 *
 * El ejercicio original pide derivadas simbólicas («desarrollo»). Para hacerlo
 * evaluable numéricamente, el enunciado se reproduce VERBATIM y se pide al
 * alumno que EVALÚE cada derivada en x = 1, punto que se declara explícitamente.
 *
 * Verificación aritmética (x = 1; cos 1 ≈ 0.5403, sen 1 ≈ 0.8415, e² ≈ 7.3891):
 *   (a) f'(1) = 3cos1 + 2sen1 + sec²1
 *             = 3(0.5403) + 2(0.8415) + 1/(0.5403²)
 *             = 1.6209 + 1.6830 + 3.4255
 *             = 6.7294  → redondeado a 6.73
 *   (b) g'(1) = e^(2·1)·(2cos1 − sen1)
 *             = 7.3891·(1.0806 − 0.8415)
 *             = 7.3891·0.2391
 *             = 1.7668  → redondeado a 1.77
 *   (c) h'(1) = 2(1)/(1²+1) = 2/2 = 1.00
 *   (d) k'(1) = 3(1²)·cos(1³) = 3·cos(1) = 3(0.5403) = 1.6209 → redondeado a 1.62
 *
 * Tolerancia: ±0.02 para absorber redondeo de dos decimales.
 *
 * Sin importaciones de three: seguro de importar desde el shell del lab.
 */

import type { RetoNumericoData } from "./_reto-numerico";

// VERBATIM de PM-V-P05-A2 (pasos_guia y problema), con evaluación en x=1.
export const RETO_A2: RetoNumericoData = {
  titulo: "Calculando derivadas de funciones trigonométricas y exponenciales",
  contexto:
    "Ejercicio verbatim de PM-V-P05-A2. Las derivadas son simbólicas; evalúa cada resultado en x = 1 (en radianes) y escribe el valor numérico con dos decimales.",
  problema:
    "Calcula las siguientes derivadas. Indica en cada caso si usas cadena u otra regla combinada. Luego evalúa cada derivada en x = 1 (rad).\n\n" +
    "(a) d/dx [3 sen x − 2 cos x + tan x] evaluada en x = 1\n" +
    "(b) d/dx [e^(2x) · cos x] evaluada en x = 1\n" +
    "(c) d/dx [ln(x² + 1)] evaluada en x = 1\n" +
    "(d) d/dx [sen(x³)] evaluada en x = 1",
  campos: [
    {
      etiqueta: "(a) 3 cos x + 2 sen x + sec²x  en x = 1",
      objetivo: 6.73,
      tolerancia: 0.02,
      placeholder: "6.73",
    },
    {
      etiqueta: "(b) e^(2x)(2 cos x − sen x)  en x = 1",
      objetivo: 1.77,
      tolerancia: 0.02,
      placeholder: "1.77",
    },
    {
      etiqueta: "(c) 2x/(x² + 1)  en x = 1",
      objetivo: 1.00,
      tolerancia: 0.02,
      placeholder: "1.00",
    },
    {
      etiqueta: "(d) 3x² cos(x³)  en x = 1",
      objetivo: 1.62,
      tolerancia: 0.02,
      placeholder: "1.62",
    },
  ],
  pasosGuia: [
    "(a) Linealidad + derivadas básicas: d/dx[3 sen x] = 3 cos x; d/dx[−2 cos x] = 2 sen x; d/dx[tan x] = sec²x. Resultado simbólico: 3 cos x + 2 sen x + sec²x. En x=1: 3(0.5403)+2(0.8415)+1/(0.5403²) ≈ 1.62+1.68+3.43 ≈ 6.73.",
    "(b) Regla del producto: f=e^(2x) (f'=2e^(2x) por cadena), g=cos x (g'=−sen x). Resultado simbólico: e^(2x)(2 cos x − sen x). En x=1: e²(2·0.5403−0.8415)≈7.3891·0.2391≈1.77.",
    "(c) Regla de la cadena: función exterior ln(u) (derivada 1/u), función interior u=x²+1 (derivada 2x). Resultado simbólico: 2x/(x²+1). En x=1: 2(1)/(1+1) = 2/2 = 1.00.",
    "(d) Regla de la cadena: función exterior sen(u) (derivada cos(u)), función interior u=x³ (derivada 3x²). Resultado simbólico: 3x² cos(x³). En x=1: 3(1)·cos(1)≈3·0.5403≈1.62.",
  ],
  respuestaFinal:
    "(a) 3 cos x + 2 sen x + sec²x → 6.73. (b) e^(2x)(2 cos x − sen x) → 1.77. (c) 2x/(x²+1) → 1.00. (d) 3x² cos(x³) → 1.62.",
};

/**
 * Datos puros del reto evaluable del laboratorio Diferencial y linealización
 * (PM-V-P08).
 *
 * Reproduce VERBATIM el ejercicio ancla A2 «Aplicando diferenciales para
 * estimar errores y valores» (ejercicio_matematico, practica_slug=diferencial-
 * linealizacion). El alumno captura los tres resultados y comprueba con
 * tolerancia; la retroalimentación (pasos guía + respuesta final) es verbatim
 * del ejercicio.
 *
 * Aritmética verificada:
 *   (a) √9.04 ≈ L(9.04) = 3 + (1/6)(0.04) = 3 + 0.00667 ≈ 3.0067
 *       tolerancia 0.001 (acepta 3.006–3.008)
 *   (b) e^0.1 ≈ L(0.1) = 1 + 0.1 = 1.1  → exacto para la linealización
 *       tolerancia 0 (valor entero expresado como 1.1 → objetivo 1.1, tol 0.001)
 *   (c) dV = 4π(5.0)²(0.05) = 4π(25)(0.05) = 4π(1.25) = 5π ≈ 15.708 cm³
 *       tolerancia 0.5 (acepta 15.2–16.2)
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { RetoNumericoData } from "./_reto-numerico";

// VERBATIM de PM-V-P08-A2 (ejercicio_matematico, tipo_respuesta "numerica").
export const RETO_A2: RetoNumericoData = {
  titulo: "Aplicando diferenciales para estimar errores y valores",
  contexto:
    "Usa la linealización (aproximación lineal) L(x) = f(a) + f'(a)(x − a) y el diferencial dV = 4πr²dr para estimar valores y errores. Da tres cifras decimales donde corresponda.",
  problema:
    "(a) √(9.04) sin calculadora. (Usa f(x) = √x con punto base a = 9.)\n" +
    "(b) e^(0.1) usando la linealización de eˣ en x = 0.\n" +
    "(c) Un ingeniero mide el radio de una esfera como r = 5.0 ± 0.05 cm. Usa el diferencial dV = 4πr²dr para estimar el error máximo en el volumen calculado (en cm³, redondea a 2 decimales).",
  campos: [
    {
      etiqueta: "(a) √(9.04) ≈ L(9.04)",
      objetivo: 3.0067,
      tolerancia: 0.001,
      placeholder: "3.0067",
    },
    {
      etiqueta: "(b) e^(0.1) ≈ L(0.1)",
      objetivo: 1.1,
      tolerancia: 0.001,
      placeholder: "1.1",
    },
    {
      etiqueta: "(c) Error máximo dV (cm³)",
      objetivo: 15.71,
      tolerancia: 0.5,
      unidad: "cm³",
      placeholder: "15.71",
    },
  ],
  pasosGuia: [
    "(a) f(x)=√x, f'(x)=1/(2√x). En a=9: f(9)=3, f'(9)=1/6. Linealización: L(x)=3+(1/6)(x-9). Para x=9.04: L(9.04)=3+(1/6)(0.04)=3+0.00667≈3.0067.",
    "(b) f(x)=eˣ, f'(x)=eˣ. En a=0: f(0)=1, f'(0)=1. Linealización: L(x)=1+1·(x-0)=1+x. Para x=0.1: L(0.1)=1+0.1=1.1. (Valor real: e^0.1≈1.1052, error<0.5%.)",
    "(c) V=(4/3)πr³. dV=4πr²dr. Con r=5.0 cm y dr=0.05 cm: dV=4π(25)(0.05)=4π(1.25)=5π≈15.71 cm³. El error máximo en el volumen es aproximadamente ±15.7 cm³.",
    "Porcentaje de error en volumen: (dV/V)·100 = (4πr²dr)/[(4/3)πr³]·100 = (3dr/r)·100 = (3·0.05/5)·100 = 3%. Un error de 1% en el radio produce 3% de error en el volumen.",
  ],
  respuestaFinal:
    "(a) √9.04 ≈ 3.0067. (b) e^0.1 ≈ 1.1. (c) dV = 5π ≈ 15.71 cm³ (error máximo en volumen); el error relativo es 3%.",
};

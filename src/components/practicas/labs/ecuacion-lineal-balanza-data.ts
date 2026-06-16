/**
 * Datos puros del reto evaluable del laboratorio de Ecuación lineal — la
 * balanza (PM-II-P09).
 *
 * Reproduce VERBATIM el ejercicio ancla A8 «Ejercicio — Propiedades de la
 * igualdad: identidad y ecuación» (ejercicio_matematico). El alumno captura los
 * resultados numéricos que se calculan en el problema y comprueba con
 * tolerancia; la retroalimentación (pasos guía + respuesta final) es verbatim
 * del ejercicio.
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { RetoNumericoData } from "./_reto-numerico";

// El const se llama RETO_A2 por convención del shell; la fuente es PM-II-P09-A8
// (ejercicio_matematico, tipo_respuesta "desarrollo", tolerancia 0).
export const RETO_A2: RetoNumericoData = {
  titulo: "Propiedades de la igualdad: identidad y ecuación",
  contexto:
    "Una igualdad se conserva si se aplica la misma operación en ambos lados (propiedad de uniformidad). Una identidad es verdadera para cualquier valor de la variable; una ecuación solo es verdadera para valores específicos (sus soluciones).",
  problema:
    "Imagina una balanza en equilibrio: lo que se hace de un lado debe hacerse del otro para mantener la igualdad. Resuelve:\n" +
    "(a) Usa la propiedad de uniformidad para hallar x en x + 7 = 12 (¿qué operación aplicas en ambos lados?).\n" +
    "(b) Comprueba tu resultado sustituyendo el valor de x en la igualdad original.\n" +
    "(c) Indica cuál de estas igualdades es una IDENTIDAD (se cumple para cualquier valor) y cuál es una ECUACIÓN (se cumple solo para ciertos valores): 2(x + 3) = 2x + 6  y  x + 4 = 9.",
  campos: [
    { etiqueta: "(a) Valor de x en x + 7 = 12", objetivo: 5, tolerancia: 0, placeholder: "5" },
    { etiqueta: "(b) Comprueba: 5 + 7 = ? (debe dar 12)", objetivo: 12, tolerancia: 0, placeholder: "12" },
    { etiqueta: "(c) Valor de x que hace verdadera la ECUACIÓN x + 4 = 9", objetivo: 5, tolerancia: 0, placeholder: "5" },
  ],
  pasosGuia: [
    "(a) Resta 7 en ambos lados (propiedad de uniformidad): x + 7 − 7 = 12 − 7, entonces x = 5.",
    "(b) Sustituye x = 5 en x + 7 = 12: 5 + 7 = 12, que es verdadero, así que la solución es correcta.",
    "(c) Desarrolla 2(x + 3) = 2x + 6: ambos lados son iguales para cualquier x, es una IDENTIDAD. En cambio x + 4 = 9 solo se cumple si x = 5, es una ECUACIÓN.",
  ],
  respuestaFinal:
    "(a) x = 5 (restando 7 a ambos lados, propiedad de uniformidad); (b) 5 + 7 = 12, verdadero; (c) 2(x + 3) = 2x + 6 es IDENTIDAD y x + 4 = 9 es ECUACIÓN",
};

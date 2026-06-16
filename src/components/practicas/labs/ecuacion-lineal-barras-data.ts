/**
 * Datos puros del reto evaluable del laboratorio Ecuación lineal: el modelo de barras
 * (PM-III-P07).
 *
 * Reproduce VERBATIM el ejercicio ancla A2 «Planteo y resuelvo ecuaciones lineales»
 * (ejercicio_matematico, tipo_respuesta "desarrollo"). El alumno captura los cuatro
 * resultados (a) x, (b) h, (c) edad_menor, (c) edad_mayor y comprueba con tolerancia 0.
 * La retroalimentación (pasos guía + respuesta final) es verbatim de A2.
 *
 * Aritmética verificada:
 *   (a) 2x + 7 = 23 → 2x = 16 → x = 8  ✓
 *   (b) 150h + 200 = 950 → 150h = 750 → h = 5  ✓
 *   (c) x + (x+9) = 45 → 2x = 36 → x = 18 (menor), 18+9 = 27 (mayor)  ✓
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { RetoNumericoData } from "./_reto-numerico";

// VERBATIM de PM-III-P07-A2 (ejercicio_matematico).
export const RETO_A2: RetoNumericoData = {
  titulo: "Planteo y resuelvo ecuaciones lineales",
  contexto:
    "Plantear ecuaciones lineales es una herramienta fundamental para resolver problemas cotidianos de manera sistemática.",
  problema:
    "Resuelve los siguientes problemas planteando y resolviendo una ecuación lineal:\n" +
    "(a) El doble de un número aumentado en 7 es igual a 23. ¿Cuál es el número?\n" +
    "(b) Un artesano cobra $150 por hora de trabajo más $200 de materiales fijos. Si cobró $950 en total, ¿cuántas horas trabajó?\n" +
    "(c) Dos hermanos tienen en total 45 años. El mayor tiene 9 años más que el menor. ¿Cuántos años tiene cada uno?",
  campos: [
    {
      etiqueta: "(a) El número desconocido (2x + 7 = 23)",
      objetivo: 8,
      tolerancia: 0,
      placeholder: "8",
    },
    {
      etiqueta: "(b) Horas que trabajó el artesano (150h + 200 = 950)",
      objetivo: 5,
      tolerancia: 0,
      unidad: "h",
      placeholder: "5",
    },
    {
      etiqueta: "(c) Edad del hermano menor",
      objetivo: 18,
      tolerancia: 0,
      unidad: "años",
      placeholder: "18",
    },
    {
      etiqueta: "(c) Edad del hermano mayor",
      objetivo: 27,
      tolerancia: 0,
      unidad: "años",
      placeholder: "27",
    },
  ],
  pasosGuia: [
    "(a) Sea x el número: 2x + 7 = 23 → despeja x.",
    "(b) Sea h las horas: 150h + 200 = 950 → despeja h.",
    "(c) Sea x la edad del menor: x + (x+9) = 45 → despeja x y calcula ambas edades.",
  ],
  respuestaFinal: "(a) x=8; (b) h=5 horas; (c) menor=18 años, mayor=27 años",
};

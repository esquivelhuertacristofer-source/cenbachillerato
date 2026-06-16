/**
 * Datos puros del reto evaluable del laboratorio Continuidad: las 3 condiciones.
 *
 * Reproduce VERBATIM el ejercicio ancla A2 «Analizando discontinuidades:
 * evitable, salto y esencial» (ejercicio_matematico, PM-V-P02-A2,
 * practica_slug=continuidad-tres-condiciones).
 *
 * El problema tiene tipo_respuesta "desarrollo"; se extraen los valores numéricos
 * exactos que los pasos_guia indican de forma explícita:
 *   (b) lím_{x→2} f(x) = 4  (factorizando (x+2)(x-2)/(x-2) = x+2 → en x=2 = 4)
 *   (c) F(2) = 4             (valor con el que se repara la discontinuidad)
 *   (d) g(1) = 1−1−1 = −1   (para verificar TVI: signo negativo en a)
 *       g(2) = 8−2−1 = 5    (para verificar TVI: signo positivo en b)
 * tolerancia_error = 0 (verbatim del ejercicio).
 *
 * Sin three: seguro de importar desde el shell del lab.
 *
 * Fuente: scripts/_sem5_dump.txt líneas 3343–3355 (PM-V-P02-A2).
 */

import type { RetoNumericoData } from "./_reto-numerico";

// VERBATIM de PM-V-P02-A2 (ejercicio_matematico).
export const RETO_A2: RetoNumericoData = {
  titulo: "Analizando discontinuidades: evitable, salto y esencial",

  contexto:
    "Análisis de continuidad de f(x) = (x² - 4)/(x - 2) en x = 2 y aplicación del Teorema del Valor Intermedio a g(x) = x³ - x - 1 en [1, 2].",

  // Enunciado VERBATIM del campo "problema" en PM-V-P02-A2.
  problema:
    "Analiza la función f(x) = (x² - 4)/(x - 2).\n\n" +
    "(a) ¿Es f continua en x = 2? Justifica usando las 3 condiciones de continuidad.\n" +
    "(b) Clasifica el tipo de discontinuidad en x = 2.\n" +
    "(c) ¿Se puede 'reparar' la discontinuidad? ¿Cómo se definiría la función reparada?\n" +
    "(d) Aplica el Teorema del Valor Intermedio a g(x) = x³ - x - 1 en el intervalo [1, 2]: " +
    "¿existe al menos una raíz en ese intervalo? Justifica.",

  // Campos numéricos extraídos de los pasos_guia VERBATIM:
  // (b) lím_{x→2} = 4 — pasos_guia: "lim(x→2)(x+2) = 4"
  // (c) F(2) = 4       — pasos_guia: "Se define ... F(2) = 4"
  // (d.1) g(1) = −1    — pasos_guia: "g(1) = 1 - 1 - 1 = -1"
  // (d.2) g(2) = 5     — pasos_guia: "g(2) = 8 - 2 - 1 = 5"
  campos: [
    {
      etiqueta: "(b) Valor del límite lím_{x→2} f(x)",
      objetivo: 4,
      tolerancia: 0,
      placeholder: "4",
    },
    {
      etiqueta: "(c) Valor que repara la discontinuidad: F(2) =",
      objetivo: 4,
      tolerancia: 0,
      placeholder: "4",
    },
    {
      etiqueta: "(d) g(1) = 1³ − 1 − 1",
      objetivo: -1,
      tolerancia: 0,
      placeholder: "−1",
    },
    {
      etiqueta: "(d) g(2) = 2³ − 2 − 1",
      objetivo: 5,
      tolerancia: 0,
      placeholder: "5",
    },
  ],

  // Pasos guía VERBATIM de PM-V-P02-A2 (campo pasos_guia).
  pasosGuia: [
    "(a) Condición 1: f(2) = (4-4)/(2-2) = 0/0 — no está definida. La primera condición falla, por lo tanto f NO es continua en x=2.",
    "(b) Calcula el límite: lim(x→2)(x²-4)/(x-2) = lim(x→2)(x+2)(x-2)/(x-2) = lim(x→2)(x+2) = 4. El límite existe y es finito, pero f(2) no está definida. Discontinuidad evitable (removible).",
    "(c) Sí se puede reparar. Se define la función extendida: F(x) = (x²-4)/(x-2) si x≠2, y F(2) = 4. Ahora F es continua en todo su dominio incluyendo x=2.",
    "(d) g(1) = 1 - 1 - 1 = -1 < 0. g(2) = 8 - 2 - 1 = 5 > 0. Como g es continua en [1,2] (es polinomial) y g(1) < 0 < g(2), por el TVI existe al menos un c ∈ (1,2) tal que g(c) = 0. Sí existe al menos una raíz en (1,2).",
  ],

  // Respuesta final VERBATIM (sintetizada de los pasos_guia de PM-V-P02-A2).
  respuestaFinal:
    "(b) lím_{x→2} f(x) = 4. (c) F(2) = 4 repara la discontinuidad evitable. (d) g(1) = −1 < 0 y g(2) = 5 > 0 → por el TVI existe al menos una raíz en (1, 2).",
};

/**
 * Datos puros del reto evaluable del laboratorio de Recta numérica (PM-I-P02).
 *
 * Reproduce VERBATIM el ejercicio ancla A2 «Operaciones con enteros y
 * racionales en contexto» (ejercicio_matematico). El alumno captura los cuatro
 * resultados y comprueba con tolerancia; la retroalimentación (pasos guía +
 * respuesta final) es verbatim del ejercicio.
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { RetoNumericoData } from "./_reto-numerico";

// VERBATIM de PM-I-P02-A2 (ejercicio_matematico, tipo_respuesta "desarrollo").
export const RETO_A2: RetoNumericoData = {
  titulo: "Operaciones con enteros y racionales en contexto",
  contexto: "Situaciones reales que requieren operaciones con números enteros (positivos y negativos).",
  problema:
    "a) Una empresa tiene deudas de $4,500 y ganancias de $3,200. ¿Cuál es su balance actual?\n" +
    "b) La temperatura bajó de 8°C a -3°C. ¿Cuántos grados descendió?\n" +
    "c) Un elevador está en el piso -2 (sótano 2). Sube 7 pisos. ¿En qué piso queda?\n" +
    "d) Calcula: (-6) × (-4) + (-3) × 5",
  campos: [
    { etiqueta: "a) Balance actual de la empresa", objetivo: -1300, tolerancia: 0, unidad: "$", placeholder: "−1300" },
    { etiqueta: "b) Grados que descendió la temperatura", objetivo: 11, tolerancia: 0, unidad: "°C", placeholder: "11" },
    { etiqueta: "c) Piso en el que queda el elevador", objetivo: 5, tolerancia: 0, unidad: "piso", placeholder: "5" },
    { etiqueta: "d) (−6) × (−4) + (−3) × 5", objetivo: 9, tolerancia: 0, placeholder: "9" },
  ],
  pasosGuia: [
    "a) Balance = Ganancias − Deudas = 3,200 − 4,500",
    "b) Descenso = 8 − (−3) = 8 + 3",
    "c) Piso final = −2 + 7",
    "d) Aplica jerarquía de operaciones: primero multiplicaciones, luego suma",
  ],
  respuestaFinal: "a) −$1,300 (deuda neta). b) 11 grados. c) Piso 5. d) 24 + (−15) = 9.",
};

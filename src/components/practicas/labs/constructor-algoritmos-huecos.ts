/**
 * «Completa el texto» — constructor-algoritmos
 *
 * VERBATIM de CD-I-P11-A6 (Completa: elementos del algoritmo), progresión CD-I-P11.
 * El párrafo, las pistas, las respuestas y las alternativas aceptadas son las
 * de esa actividad; aquí sólo se parte el texto por sus huecos. Generado por
 * scripts/generar-huecos-labs.ts — no editar a mano.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const CONSTRUCTOR_ALGORITMOS_HUECOS: TextoHuecosData = {
  ancla: "CD-I-P11-A6 · Completa: elementos del algoritmo",
  instrucciones: "Completa con la palabra correcta.",
  partes: [
    "Los datos se guardan en ",
    ", cuyo valor puede cambiar, y en constantes, que son fijas. Los operadores ",
    " (+, −, ×, ÷) hacen cálculos y los ",
    " (>, <, =) comparan. La estructura 'si… entonces…' es ",
    ", y la que repite acciones es repetitiva.",
  ],
  huecos: [
    { respuesta: "variables", alternativas: [], pista: "Pueden cambiar de valor." },
    { respuesta: "aritméticos", alternativas: ["aritmeticos"], pista: "Para calcular." },
    { respuesta: "relacionales", alternativas: [], pista: "Para comparar." },
    { respuesta: "condicional", alternativas: ["selectiva"], pista: "Toma un camino según una condición." },
  ],
};

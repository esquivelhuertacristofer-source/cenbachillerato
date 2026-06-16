/**
 * Datos puros del reto evaluable del laboratorio de Fracciones, decimales y
 * porcentajes (PM-I-P04).
 *
 * Reproduce VERBATIM el ejercicio ancla A2 «Calculando porcentajes en economía
 * cotidiana» (ejercicio_matematico). El alumno captura los cinco resultados y
 * comprueba con tolerancia; la retroalimentación (pasos guía + respuesta final)
 * es verbatim del ejercicio.
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { RetoNumericoData } from "./_reto-numerico";

// VERBATIM de PM-I-P04-A2 (ejercicio_matematico, tipo_respuesta "desarrollo").
export const RETO_A2: RetoNumericoData = {
  titulo: "Calculando porcentajes en economía cotidiana",
  contexto: "Aplicación de porcentajes en descuentos sucesivos, situación económica cotidiana.",
  problema:
    "Una tienda tiene una chamarra con precio original de $850. Ofrece un descuento del 30%. Además, si pagas en efectivo, te dan un 10% adicional sobre el precio con descuento. ¿Cuánto pagas finalmente? ¿Cuánto ahorraste en total respecto al precio original?",
  campos: [
    { etiqueta: "Primer descuento (30% de $850)", objetivo: 255, tolerancia: 0, unidad: "$", placeholder: "255" },
    { etiqueta: "Precio intermedio tras primer descuento", objetivo: 595, tolerancia: 0, unidad: "$", placeholder: "595" },
    { etiqueta: "Segundo descuento (10% del precio intermedio)", objetivo: 59.5, tolerancia: 0.01, unidad: "$", placeholder: "59.50" },
    { etiqueta: "Precio final a pagar", objetivo: 535.5, tolerancia: 0.01, unidad: "$", placeholder: "535.50" },
    { etiqueta: "Ahorro total respecto al precio original", objetivo: 314.5, tolerancia: 0.01, unidad: "$", placeholder: "314.50" },
  ],
  pasosGuia: [
    "1. Calcula el 30% de $850 para obtener el primer descuento.",
    "2. Resta ese descuento al precio original para obtener el precio intermedio.",
    "3. Calcula el 10% del precio intermedio para el segundo descuento.",
    "4. Resta el segundo descuento al precio intermedio.",
    "5. Calcula el ahorro total: precio original − precio final.",
  ],
  respuestaFinal:
    "Primer descuento: $255. Precio intermedio: $595. Segundo descuento: $59.50. Precio final: $535.50. Ahorro total: $314.50 (37% del precio original).",
};

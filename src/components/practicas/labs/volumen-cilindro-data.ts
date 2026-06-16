/**
 * Datos puros del reto evaluable del laboratorio de Volumen del cilindro (PM-III-P04).
 *
 * Reproduce VERBATIM el ejercicio ancla A2 «Calculo el volumen de un tanque
 * cilíndrico real» (ejercicio_matematico, tipo_respuesta "numerica").
 * El alumno captura los tres resultados y comprueba con tolerancia; la
 * retroalimentación (pasos guía + respuesta final) es verbatim del ejercicio.
 *
 * Sin three: seguro de importar desde el shell del lab.
 *
 * Verificación aritmética:
 *   r = 1.5 m, h = 3.2 m, π ≈ 3.14159265
 *   (a) V = π·(1.5)²·3.2 = π·2.25·3.2 = π·7.2 ≈ 22.619 m³  → 22 619 L
 *   (b) A_lat = 2π·1.5·3.2 = 2π·4.8 = 9.6π ≈ 30.159 m²
 *       A_bases = 2·π·(1.5)² = 4.5π ≈ 14.137 m²
 *       A_total = 30.159 + 14.137 ≈ 44.296 m²  (fuente: 44.30 m²)
 *   (c) Costo = 44.30 × 280 = 12 404  (fuente: $12 404)
 *   tolerancia ±1 cubre la diferencia por redondeo de π.
 */

import type { RetoNumericoData } from "./_reto-numerico";

// VERBATIM de PM-III-P04-A2 (ejercicio_matematico, practica_slug=volumen-cilindro).
export const RETO_A2: RetoNumericoData = {
  titulo: "Calculo el volumen de un tanque cilíndrico real",
  contexto:
    "El cálculo de volúmenes y áreas es fundamental en ingeniería civil, arquitectura y planificación comunitaria. Diseñar sistemas de almacenamiento requiere dominar estas fórmulas con precisión.",
  problema:
    "Una comunidad rural construirá un tanque de almacenamiento de agua con forma cilíndrica. El radio de la base es 1.5 m y la altura es 3.2 m. El tanque tiene tapa superior e inferior.\n" +
    "(a) Calcula el volumen de agua que puede almacenar el tanque (en m³ y en litros; 1 m³ = 1 000 litros).\n" +
    "(b) Calcula el área total de la lámina de metal necesaria para construirlo (base, tapa y cuerpo lateral).\n" +
    "(c) Si el metal cuesta $280 por m², ¿cuánto costará la lámina? Da el resultado redondeado al peso más cercano.",
  campos: [
    {
      etiqueta: "(a) Volumen del tanque en m³",
      objetivo: 22.62,
      tolerancia: 1,
      unidad: "m³",
      placeholder: "22.62",
    },
    {
      etiqueta: "(a) Capacidad en litros",
      objetivo: 22619,
      tolerancia: 1000,
      unidad: "L",
      placeholder: "22619",
    },
    {
      etiqueta: "(b) Área total de lámina metálica",
      objetivo: 44.30,
      tolerancia: 1,
      unidad: "m²",
      placeholder: "44.30",
    },
    {
      etiqueta: "(c) Costo total de la lámina",
      objetivo: 12404,
      tolerancia: 50,
      unidad: "$",
      placeholder: "12404",
    },
  ],
  pasosGuia: [
    "(a) Volumen del cilindro: V = πr²h. Sustituye r = 1.5 m y h = 3.2 m.",
    "(a) Convierte m³ a litros multiplicando por 1 000.",
    "(b) Área lateral: A_lat = 2πrh. Dos bases circulares: A_bases = 2πr². Área total = A_lat + A_bases.",
    "(c) Costo = Área total × $280 por m².",
  ],
  respuestaFinal:
    "(a) V = π(1.5)²(3.2) ≈ 22.62 m³ ≈ 22 619 litros. (b) A_lat = 2π(1.5)(3.2) ≈ 30.16 m²; A_bases = 2π(1.5)² ≈ 14.14 m²; A_total ≈ 44.30 m². (c) Costo ≈ $12 404.",
};

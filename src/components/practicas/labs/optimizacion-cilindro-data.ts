/**
 * Datos puros del reto evaluable del laboratorio de Optimización con la
 * derivada (PM-V-P07).
 *
 * Reproduce VERBATIM el ejercicio ancla A2 «Resolviendo problemas de
 * optimización en contextos reales» (ejercicio_matematico,
 * practica_slug=optimizacion-cilindro). El alumno calcula el radio r y la
 * altura h óptimos de la lata y los introduce con 2 decimales.
 *
 * Aritmética verificada:
 *   r = (1000/π)^(1/3) = (318.3098...)^(1/3) ≈ 6.83 cm
 *   h = 1000 / (π · r²) = 1000 / (π · 46.6489) ≈ 6.83 cm   [h = r]
 *   A = π·r² + 2000/r = π·46.6489 + 292.83 ≈ 146.55 + 292.83 ≈ 439.38 cm²
 *   Con fórmula exacta: A = 3πr² = 3π·(1000/π)^(2/3) ≈ 439.3 cm²
 *   tolerancia = 0.01 para cubrir el redondeo a 2 decimales pedido en el enunciado.
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { RetoNumericoData } from "./_reto-numerico";

// VERBATIM de PM-V-P07-A2 (ejercicio_matematico, tipo_respuesta "numerica").
export const RETO_A2: RetoNumericoData = {
  titulo: "Resolviendo problemas de optimización en contextos reales",
  contexto:
    "Una empresa fabricante de envases (como los que produce Vitro en Monterrey) quiere construir una caja cilíndrica sin tapa con un volumen de 1000 cm³. ¿Cuál debe ser el radio r y la altura h para minimizar el material usado (área de la base circular + área lateral)? Expresa r y h con 2 decimales.",
  problema:
    "Una empresa fabricante de envases (como los que produce Vitro en Monterrey) quiere construir una caja cilíndrica sin tapa con un volumen de 1000 cm³.\n" +
    "¿Cuál debe ser el radio r y la altura h para minimizar el material usado (área de la base circular + área lateral)?\n" +
    "Expresa r y h con 2 decimales.",
  campos: [
    {
      etiqueta: "Radio óptimo r (cm)",
      objetivo: 6.83,
      tolerancia: 0.01,
      unidad: "cm",
      placeholder: "6.83",
    },
    {
      etiqueta: "Altura óptima h (cm)",
      objetivo: 6.83,
      tolerancia: 0.01,
      unidad: "cm",
      placeholder: "6.83",
    },
  ],
  pasosGuia: [
    "Planteamiento: Área total A = πr² (base) + 2πrh (área lateral). Restricción: V = πr²h = 1000, entonces h = 1000/(πr²).",
    "Función objetivo en una variable: A(r) = πr² + 2πr · [1000/(πr²)] = πr² + 2000/r.",
    "Derivar e igualar a cero: A'(r) = 2πr − 2000/r² = 0 → 2πr = 2000/r² → r³ = 1000/π → r = (1000/π)^(1/3).",
    "Calcular r: r = (1000/π)^(1/3) = (318.31...)^(1/3) ≈ 6.83 cm.",
    "Calcular h: h = 1000/(π · (6.83)²) = 1000/(π · 46.65) ≈ 1000/146.55 ≈ 6.83 cm. Nota: en el cilindro SIN tapa el óptimo cumple h = r (a diferencia del cilindro cerrado, donde h = 2r). Área mínima: A(6.83) = π(46.65) + 2000/6.83 ≈ 146.55 + 292.83 ≈ 439.4 cm². [Con la fórmula exacta: A = 3πr² = 3π(1000/π)^(2/3) ≈ 439.3 cm²].",
  ],
  respuestaFinal:
    "r ≈ 6.83 cm, h ≈ 6.83 cm (h = r en el cilindro sin tapa). Material mínimo A ≈ 439.4 cm².",
};

/**
 * Datos puros del reto evaluable del laboratorio de Potencias y raíces (PM-I-P09).
 *
 * Reproduce VERBATIM el ejercicio ancla A2 «Calcula potencias y raíces»
 * (ejercicio_matematico, tipo_respuesta "numerica"). El alumno captura los tres
 * resultados y comprueba con tolerancia; la retroalimentación (pasos guía +
 * respuesta final) es verbatim del ejercicio.
 *
 * Sin three: seguro de importar desde el shell del lab.
 *
 * FUENTE: PM-I-P09-A2 (ejercicio_matematico). Se prefirió A2 sobre A6 porque
 * A2 tiene tres casos bien definidos (potencia entera, raíz cuadrada y exponente
 * negativo) que cubren todo el propósito del lab.
 */

import type { RetoNumericoData } from "./_reto-numerico";

// VERBATIM de PM-I-P09-A2 (ejercicio_matematico, tipo_respuesta "numerica").
export const RETO_A2: RetoNumericoData = {
  titulo: "Calcula potencias y raíces",
  contexto:
    "Potencia = multiplicación repetida; raíz cuadrada = operación inversa; exponente negativo = inverso multiplicativo.",
  problema: "Calcula: (a) 2⁵   (b) la raíz cuadrada de 81   (c) 3⁻²",
  campos: [
    {
      etiqueta: "(a) 2⁵",
      objetivo: 32,
      tolerancia: 0,
      placeholder: "32",
    },
    {
      etiqueta: "(b) Raíz cuadrada de 81",
      objetivo: 9,
      tolerancia: 0,
      placeholder: "9",
    },
    {
      etiqueta: "(c) 3⁻² (escribe el decimal, p. ej. 0.111)",
      objetivo: 1 / 9,
      tolerancia: 0.01,
      placeholder: "0.111",
    },
  ],
  pasosGuia: [
    "(a) 2⁵ = 2×2×2×2×2 = 32.",
    "(b) √81 = 9 porque 9² = 81.",
    "(c) 3⁻² = 1/3² = 1/9 ≈ 0.111.",
  ],
  respuestaFinal: "(a) 32, (b) 9, (c) 1/9",
};

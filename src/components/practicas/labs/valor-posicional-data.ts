/**
 * Datos puros del reto evaluable del laboratorio de Valor posicional (PM-I-P08).
 *
 * Reproduce VERBATIM el ejercicio ancla A2 «Valor posicional»
 * (ejercicio_matematico, tipo_respuesta "numerica"). El alumno captura el
 * resultado numérico y comprueba con tolerancia 0; la retroalimentación
 * (pasos guía + respuesta final) es verbatim del ejercicio.
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { RetoNumericoData } from "./_reto-numerico";

// VERBATIM de PM-I-P08-A2 (ejercicio_matematico, tipo_respuesta "numerica").
export const RETO_A2: RetoNumericoData = {
  titulo: "Valor posicional",
  contexto:
    "En un sistema posicional, cada lugar vale 10 veces más que el de su derecha: unidades, decenas, centenas, unidades de millar...",
  problema:
    "El sistema indoarábigo es posicional y de base 10. En el número 4 700, ¿qué valor representa el dígito 7?",
  campos: [
    {
      etiqueta: "Valor que representa el dígito 7 en 4 700",
      objetivo: 700,
      tolerancia: 0,
      placeholder: "700",
    },
  ],
  pasosGuia: [
    "El 7 está en la posición de las centenas.",
    "Una centena vale 100, y hay 7: 7 × 100 = 700.",
  ],
  respuestaFinal: "700",
};

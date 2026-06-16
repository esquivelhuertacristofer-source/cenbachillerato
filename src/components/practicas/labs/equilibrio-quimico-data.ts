/**
 * Datos puros del reto evaluable del laboratorio de Equilibrio Químico
 * (CNEYT-IV-P10).
 *
 * Reproduce VERBATIM el ejercicio ancla A2
 * «¿Está en equilibrio? Calcula Q y compáralo con Kc (H₂ + I₂ ⇌ 2 HI)»
 * (ejercicio_matematico, practica_slug=equilibrio-quimico).
 *
 * Aritmética verificada:
 *   a) Q = [HI]² / ([H₂]·[I₂]) = (0.50)² / (0.20 × 0.20) = 0.25 / 0.04 = 6.25  ✓
 *   b) Q (6.25) < Kc (50.5) ⇒ NO en equilibrio; se desplaza a la derecha  ✓
 *
 * Los incisos b) y c) son cualitativos (de dirección); solo el inciso a)
 * tiene un campo numérico con tolerancia 0.01 (suficiente para decimales
 * calculados a mano: 6.25 exacto, pero se acepta hasta ±0.01).
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { RetoNumericoData } from "./_reto-numerico";

// VERBATIM de CNEYT-IV-P10-A2 (ejercicio_matematico, practica_slug=equilibrio-quimico).
export const RETO_A2: RetoNumericoData = {
  titulo: "¿Está en equilibrio? Calcula Q y compáralo con Kc (H₂ + I₂ ⇌ 2 HI)",

  // Contexto VERBATIM del campo "contexto" de A2.
  contexto:
    "Los tres incisos recorren el contenido formativo de la progresión: la constante y ecuación de equilibrio (Kc), el cociente Q que predice el sentido de una reacción reversible, y el principio de Le Châtelier sobre un proceso industrial real (Haber-Bosch). En el laboratorio 3D el modo «Constante Kc» muestra a Q acercándose a Kc, la calculadora computa Q y lo compara con Kc, y el modo «Le Châtelier» visualiza el desplazamiento por presión.",

  // Problema VERBATIM del campo "problema" de A2 (solo inciso a) es numérico evaluable;
  // los incisos b) y c) se presentan para contexto y aparecen en pasosGuia y respuestaFinal).
  problema:
    "En un recipiente cerrado a 448 °C se estudia el equilibrio H₂ + I₂ ⇌ 2 HI, cuya constante es Kc = 50.5.\n\n" +
    "a) COCIENTE Q. En cierto instante se miden [H₂] = 0.20 M, [I₂] = 0.20 M y [HI] = 0.50 M. Calcula el cociente de reacción Q.\n\n" +
    "b) SENTIDO. Compara Q con Kc: ¿está el sistema en equilibrio? Si no, ¿hacia qué lado se desplaza?\n\n" +
    "c) LE CHÂTELIER. Para el proceso Haber N₂ + 3 H₂ ⇌ 2 NH₃ (exotérmico, ΔH = −92 kJ; pasa de 4 a 2 moles de gas), predice hacia dónde se desplaza el equilibrio si (i) se aumenta la presión y (ii) se aumenta la temperatura.",

  // Campo numérico evaluable: solo el inciso a) da un valor exacto calculable.
  // Arithmetic: Q = (0.50)² / (0.20 × 0.20) = 0.25 / 0.04 = 6.25
  campos: [
    {
      etiqueta: "a) Cociente de reacción Q = [HI]² / ([H₂]·[I₂])",
      objetivo: 6.25,
      tolerancia: 0.01,
      placeholder: "6.25",
    },
  ],

  // Pasos guía VERBATIM del campo "pasos_guia" de A2.
  pasosGuia: [
    "a) Q = [HI]² / ([H₂]·[I₂]) = (0.50)² / (0.20 × 0.20) = 0.25 / 0.04 = 6.25.",
    "b) Q = 6.25 es MENOR que Kc = 50.5 ⇒ el sistema NO está en equilibrio: faltan productos, así que se desplaza hacia la DERECHA (forma más HI) hasta que Q llegue a 50.5.",
    "c.i) Aumentar la presión favorece el lado con MENOS moles de gas. Haber pasa de 4 moles (N₂ + 3 H₂) a 2 moles (2 NH₃), así que el equilibrio se desplaza a la DERECHA (más amoniaco).",
    "c.ii) La reacción directa es exotérmica (ΔH < 0). Subir la temperatura favorece el sentido que absorbe calor, es decir la reacción INVERSA: el equilibrio se desplaza a la IZQUIERDA (menos amoniaco). Por eso la industria usa presión alta pero temperatura moderada.",
  ],

  // Respuesta final VERBATIM del campo "respuesta_final" de A2.
  respuestaFinal:
    "a) Q = 6.25. b) Q (6.25) < Kc (50.5) ⇒ no está en equilibrio; se desplaza a la derecha (forma HI). c) En el Haber: (i) más presión ⇒ derecha (4→2 mol de gas, más NH₃); (ii) más temperatura ⇒ izquierda (la directa es exotérmica).",
};

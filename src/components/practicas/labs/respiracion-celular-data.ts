/**
 * Datos puros del reto evaluable del laboratorio de Respiración celular (CNEYT-IV-P11).
 *
 * Reproduce VERBATIM el ejercicio ancla A2 «Balance de ATP: respiración aerobia
 * vs fermentación (C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O)» (ejercicio_matematico,
 * practica_slug=respiracion-celular).
 *
 * Aritmética verificada:
 *   a) Fermentación: glucólisis gasta 2 ATP, produce 4 → saldo neto = 2 ATP ✓
 *   b) Aerobia: 2 (glucólisis) + 2 (Krebs, GTP) + ~34 (cadena) = 38 ATP ✓
 *   c) Ventaja: 38 ÷ 2 = 19 ✓
 *   d) Estequiometría: 1 glucosa : 6 O₂ : 6 CO₂ → 5 × 6 = 30 mol O₂ y 30 mol CO₂ ✓
 *
 * Sin three: seguro de importar desde el shell del lab.
 *
 * Fuente: CNEYT-IV-P11-A2 (ejercicio_matematico).
 */

import type { RetoNumericoData } from "./_reto-numerico";

// VERBATIM de CNEYT-IV-P11-A2 (ejercicio_matematico, tipo_respuesta "desarrollo").
export const RETO_A2: RetoNumericoData = {
  titulo: "Balance de ATP: respiración aerobia vs fermentación (C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O)",
  contexto:
    "Los incisos recorren el contenido formativo: los aspectos químicos de la glucólisis (a), de Krebs y la cadena transportadora que completan la aerobia (b), el contraste con la fermentación (c) y la estequiometría de la ecuación global (d). En el laboratorio 3D el modo «Aerobia» anima las tres etapas hasta el agua, el modo «Fermentación» muestra la vía láctica/alcohólica, y la calculadora computa ATP, O₂, CO₂ y eficiencia para los moles que elijas.",
  problema:
    "La degradación de la glucosa rinde distinta energía según haya o no oxígeno.\n\n" +
    "a) FERMENTACIÓN. La fermentación (anaerobia) aprovecha solo la glucólisis. ¿Cuántos ATP netos se obtienen por molécula de glucosa?\n\n" +
    "b) RESPIRACIÓN AEROBIA. Con oxígeno, la oxidación completa rinde el máximo teórico clásico. ¿Cuántos ATP por glucosa?\n\n" +
    "c) VENTAJA. ¿Cuántas veces más ATP rinde la respiración aerobia que la fermentación?\n\n" +
    "d) GASES. Según la ecuación global C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O, si una célula oxida por completo 5 mol de glucosa, ¿cuántos moles de O₂ consume y cuántos de CO₂ produce?",
  campos: [
    {
      etiqueta: "a) ATP netos por glucosa en la fermentación",
      objetivo: 2,
      tolerancia: 0,
      unidad: "ATP",
      placeholder: "2",
    },
    {
      etiqueta: "b) ATP por glucosa en la respiración aerobia (máximo teórico)",
      objetivo: 38,
      tolerancia: 0,
      unidad: "ATP",
      placeholder: "38",
    },
    {
      etiqueta: "c) ¿Cuántas veces más ATP rinde la aerobia vs fermentación?",
      objetivo: 19,
      tolerancia: 0,
      unidad: "veces",
      placeholder: "19",
    },
    {
      etiqueta: "d) Moles de O₂ consumidos (5 mol glucosa)",
      objetivo: 30,
      tolerancia: 0,
      unidad: "mol",
      placeholder: "30",
    },
  ],
  pasosGuia: [
    "a) La glucólisis gasta 2 ATP y produce 4 ⇒ saldo NETO = 2 ATP por glucosa. La fermentación no añade más ATP (solo regenera NAD⁺), así que rinde 2 ATP.",
    "b) Respiración aerobia (teórico clásico): 2 (glucólisis) + 2 (Krebs, GTP) + ~34 de la cadena transportadora a partir de NADH y FADH₂ ≈ 38 ATP por glucosa. (En células reales suele ser ~30–32 por los costos de transporte.)",
    "c) Ventaja = 38 / 2 = 19 ⇒ la respiración aerobia rinde unas 19 veces más ATP que la fermentación.",
    "d) La ecuación es 1:6 entre glucosa y O₂, y 1:6 entre glucosa y CO₂. Para 5 mol de glucosa: O₂ = 5 × 6 = 30 mol; CO₂ = 5 × 6 = 30 mol (y H₂O = 30 mol).",
  ],
  respuestaFinal:
    "a) 2 ATP (solo la glucólisis). b) ~38 ATP teóricos (aerobia completa; ~30–32 reales). c) 19 veces más (38 ÷ 2). d) 30 mol de O₂ y 30 mol de CO₂ (y 30 mol de H₂O).",
};

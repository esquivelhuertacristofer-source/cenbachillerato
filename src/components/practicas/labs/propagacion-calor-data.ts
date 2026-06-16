/**
 * Datos puros del reto evaluable del laboratorio de Propagación del calor
 * (CNEYT-II-P11).
 *
 * Reproduce VERBATIM el ejercicio ancla A2 «Calculando el flujo de calor»
 * (ejercicio_matematico). El alumno captura los tres resultados y comprueba con
 * tolerancia; la retroalimentación (pasos guía + respuesta final) es verbatim
 * del ejercicio.
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { RetoNumericoData } from "./_reto-numerico";

// VERBATIM de CNEYT-II-P11-A2 (ejercicio_matematico, tipo_respuesta "desarrollo").
export const RETO_A2: RetoNumericoData = {
  titulo: "Calculando el flujo de calor",
  contexto:
    "Los tres incisos recorren el contenido formativo de la progresión: conducción (a) con la ley de Fourier y la conductividad k, capacidad térmica específica (b) con Q = m·c·ΔT, y radiación (c) con Stefan-Boltzmann. En el laboratorio 3D cada mecanismo es un modo y la calculadora da estos números para cualquier material.",
  problema:
    "Trabaja con una ventana y con una olla de cocina.\n\n" +
    "a) CONDUCCIÓN. Una ventana de vidrio de A = 1.5 m² y L = 6 mm (0.006 m) separa un interior a 22 °C de un exterior a 4 °C. Si la conductividad térmica del vidrio es k = 0.8 W/m·K, ¿cuánto calor por segundo (Q/t, en watts) se pierde por conducción?\n\n" +
    "b) CAPACIDAD TÉRMICA. ¿Cuánta energía Q (en joules) se necesita para calentar 2 kg de agua (c = 4186 J/kg·K) de 20 °C a 100 °C?\n\n" +
    "c) RADIACIÓN. Si la temperatura absoluta de un cuerpo que irradia se DUPLICA, ¿por qué factor se multiplica la potencia que emite, según la ley de Stefan-Boltzmann (Q/t = ε·σ·A·T⁴)?",
  campos: [
    { etiqueta: "a) Q/t perdido por conducción (Fourier)", objetivo: 3600, tolerancia: 1, unidad: "W", placeholder: "3600" },
    { etiqueta: "b) Energía Q para calentar el agua", objetivo: 669760, tolerancia: 1, unidad: "J", placeholder: "669760" },
    { etiqueta: "c) Factor por el que crece la potencia radiada", objetivo: 16, tolerancia: 0, placeholder: "16" },
  ],
  pasosGuia: [
    "a) Fourier: Q/t = k·A·ΔT/L. ΔT = 22 − 4 = 18 °C. Q/t = (0.8 × 1.5 × 18) / 0.006 = 21.6 / 0.006 = 3 600 W.",
    "b) Calor sensible: Q = m·c·ΔT. ΔT = 100 − 20 = 80 °C. Q = 2 × 4186 × 80 = 669 760 J ≈ 6.7 × 10⁵ J.",
    "c) Stefan-Boltzmann: Q/t ∝ T⁴. Si T se duplica, la potencia se multiplica por 2⁴ = 16.",
  ],
  respuestaFinal: "a) Q/t = 3 600 W (3.6 kW). b) Q = 669 760 J ≈ 6.7 × 10⁵ J. c) Se multiplica por 16 (2⁴).",
};

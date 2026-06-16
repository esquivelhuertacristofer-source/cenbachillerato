/**
 * Datos puros del reto evaluable del laboratorio de Gravitación universal
 * (CNEYT-V-P03).
 *
 * Reproduce VERBATIM el ejercicio ancla A2 «Cálculos de gravitación: fuerza,
 * peso y órbitas» (ejercicio_matematico, practica_slug=gravitacion-universal).
 *
 * El alumno captura los resultados numéricos y comprueba con tolerancia;
 * la retroalimentación (pasos guía + respuesta final) es verbatim del ejercicio.
 *
 * Aritmética verificada:
 *   (a) F = G·M_T·m_L/r²
 *       Numerador: 6.674×10⁻¹¹ × 5.97×10²⁴ = 3.982×10¹⁴;
 *                 3.982×10¹⁴ × 7.34×10²² = 2.922×10³⁷
 *       Denominador: (3.84×10⁸)² = 1.47456×10¹⁷
 *       F = 2.922×10³⁷ / 1.47456×10¹⁷ ≈ 1.981×10²⁰ N ≈ 1.98×10²⁰ N ✓
 *       → campo: el alumno escribe 1.98 (en unidades de ×10²⁰ N)
 *
 *   (b) W = 70 × 1.62 = 113.4 N ✓
 *       kg-fuerza = 113.4 / 9.8 ≈ 11.571 → 11.6 kgf ✓
 *
 *   (c) Conceptual: período = 24 h (igual a la rotación terrestre) ✓
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { RetoNumericoData } from "./_reto-numerico";

// VERBATIM de CNEYT-V-P03-A2 (ejercicio_matematico, tipo_respuesta "desarrollo").
export const RETO_A2: RetoNumericoData = {
  titulo: "Cálculos de gravitación: fuerza, peso y órbitas",
  contexto:
    "Aplica la Ley de Gravitación Universal a situaciones reales del sistema Tierra-Luna y los satélites mexicanos.",
  problema:
    "(a) Calcula la fuerza gravitacional entre la Tierra (M_T = 5.97×10²⁴ kg) y la Luna (m_L = 7.34×10²² kg), " +
    "sabiendo que la distancia promedio entre sus centros es r = 3.84×10⁸ m. Usa G = 6.674×10⁻¹¹ N·m²/kg².\n\n" +
    "(b) Una persona de 70 kg viaja en una misión espacial y llega a la Luna (g_Luna = 1.62 m/s²). " +
    "¿Cuánto pesa ahí en newtons? ¿Y en 'kilogramos-fuerza' (dividiendo entre 9.8)?\n\n" +
    "(c) Los satélites Mexsat orbitan en órbita geoestacionaria a 35,786 km de altura. " +
    "¿Qué período orbital (en horas) debe tener el satélite para parecer fijo desde la Tierra?",
  campos: [
    {
      etiqueta: "a) Fuerza gravitacional Tierra–Luna (en ×10²⁰ N)",
      objetivo: 1.98,
      tolerancia: 0.05,
      unidad: "×10²⁰ N",
      placeholder: "1.98",
    },
    {
      etiqueta: "b) Peso de la persona en la Luna",
      objetivo: 113.4,
      tolerancia: 0.5,
      unidad: "N",
      placeholder: "113.4",
    },
    {
      etiqueta: "b) Peso en kg-fuerza (÷ 9.8)",
      objetivo: 11.6,
      tolerancia: 0.2,
      unidad: "kgf",
      placeholder: "11.6",
    },
    {
      etiqueta: "c) Período orbital de la órbita geoestacionaria",
      objetivo: 24,
      tolerancia: 0,
      unidad: "h",
      placeholder: "24",
    },
  ],
  pasosGuia: [
    "Inciso (a): F = G·M_T·m_L/r². Sustituir: F = (6.674×10⁻¹¹)(5.97×10²⁴)(7.34×10²²) / (3.84×10⁸)². Numerador: 6.674×10⁻¹¹ × 5.97×10²⁴ = 3.982×10¹⁴; luego × 7.34×10²² = 2.922×10³⁷. Denominador: (3.84×10⁸)² = 14.75×10¹⁶ = 1.475×10¹⁷. F = 2.922×10³⁷ / 1.475×10¹⁷ ≈ 1.98×10²⁰ N.",
    "Interpretación: F ≈ 1.98×10²⁰ N es una fuerza enorme (casi 200 quintillones de newtons) que mantiene a la Luna en órbita alrededor de la Tierra y produce las mareas oceánicas en México (Golfo de México y Pacífico).",
    "Inciso (b): Peso en Luna = m × g_Luna = 70 × 1.62 = 113.4 N. En kg-fuerza: 113.4 / 9.8 ≈ 11.6 kg-fuerza. La persona 'pesa' apenas el 16.5% de su peso en la Tierra (70 kg × 9.8 = 686 N en la Tierra). La masa sigue siendo 70 kg.",
    "Inciso (c): La órbita geoestacionaria a 35,786 km tiene el período orbital T = 24 h (exactamente igual al período de rotación de la Tierra sobre su propio eje). Como el satélite da exactamente la misma vuelta angular que la Tierra en el mismo tiempo, desde cualquier punto de la superficie parece inmóvil. Las antenas parabólicas (Dish, SKY México) pueden apuntar siempre al mismo punto del cielo sin mecanismo de seguimiento.",
    "Verificación conceptual: si el período fuera diferente al de rotación terrestre (como en una órbita baja LEO a 400 km, T ≈ 92 minutos), el satélite se movería rápidamente por el cielo y solo sería visible durante minutos desde cada punto de la Tierra.",
  ],
  respuestaFinal:
    "(a) F ≈ 1.98×10²⁰ N; (b) 113.4 N ≈ 11.6 kg-fuerza (≈1/6 del peso terrestre); (c) período orbital = 24 h, igual al período de rotación terrestre.",
};

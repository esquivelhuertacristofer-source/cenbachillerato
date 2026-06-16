/**
 * Datos puros del reto evaluable del laboratorio de Cinemática MRUA (CNEYT-V-P02).
 *
 * Reproduce VERBATIM el ejercicio ancla A2 «Calculando cinemática: posición,
 * velocidad y aceleración» (ejercicio_matematico, practica_slug=mrua-acelerar-frenar).
 * El alumno captura los cuatro resultados y comprueba con tolerancia.
 *
 * Fuente: CNEYT-V-P02-A2 (verbatim).
 *
 * Verificación aritmética:
 *   (a) v = v₀ + a₁·t₁ = 0 + 3 × 10 = 30 m/s  (= 108 km/h ✓)
 *   (b) x = v₀·t₁ + ½·a₁·t₁² = 0 + ½ × 3 × 100 = 150 m ✓
 *   (c) t₂: 0 = 30 − 5·t₂ → t₂ = 6 s ✓
 *   (c) x₂: 30×6 + ½×(−5)×36 = 180 − 90 = 90 m ✓
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { RetoNumericoData } from "./_reto-numerico";

// VERBATIM de CNEYT-V-P02-A2 (ejercicio_matematico, tipo_respuesta "desarrollo").
export const RETO_A2: RetoNumericoData = {
  titulo: "Calculando cinemática: posición, velocidad y aceleración",
  contexto: "Autopista Puebla-CDMX. Unidades: m/s, metros, segundos.",
  problema:
    "Un automóvil en la autopista Puebla-CDMX parte del reposo y acelera uniformemente a 3 m/s² durante 10 segundos.\n" +
    "(a) ¿Qué velocidad alcanza al final de los 10 segundos?\n" +
    "(b) ¿Qué distancia recorrió durante esos 10 segundos de aceleración?\n" +
    "(c) Si después frena con una desaceleración uniforme de 5 m/s² hasta detenerse completamente, ¿cuánto tiempo tarda en detenerse?\n" +
    "(d) ¿Qué distancia adicional recorre durante el frenado?\n\n" +
    "Muestra el procedimiento completo con las ecuaciones cinemáticas del MRUA.",
  campos: [
    {
      etiqueta: "(a) Velocidad al final de los 10 s de aceleración",
      objetivo: 30,
      tolerancia: 0.5,
      unidad: "m/s",
      placeholder: "30",
    },
    {
      etiqueta: "(b) Distancia durante la aceleración",
      objetivo: 150,
      tolerancia: 0.5,
      unidad: "m",
      placeholder: "150",
    },
    {
      etiqueta: "(c) Tiempo de frenado hasta detenerse",
      objetivo: 6,
      tolerancia: 0.5,
      unidad: "s",
      placeholder: "6",
    },
    {
      etiqueta: "(d) Distancia adicional durante el frenado",
      objetivo: 90,
      tolerancia: 0.5,
      unidad: "m",
      placeholder: "90",
    },
  ],
  pasosGuia: [
    "Datos del problema: v₀ = 0 (parte del reposo), a₁ = +3 m/s², t₁ = 10 s (fase de aceleración). Fase de frenado: v₀' = resultado del inciso (a), a₂ = −5 m/s² (desaceleración), v_f = 0.",
    "Inciso (a) — velocidad al final de la aceleración: v = v₀ + a₁·t₁ = 0 + 3 × 10 = 30 m/s. Convertir a km/h: 30 × 3.6 = 108 km/h. Esto es una velocidad típica de autopista en México.",
    "Inciso (b) — distancia durante la aceleración: x = v₀·t₁ + ½·a₁·t₁² = 0 + ½ × 3 × 10² = ½ × 3 × 100 = 150 m. Verificación alternativa: x = (v² − v₀²)/(2a) = (30² − 0)/(2×3) = 900/6 = 150 m ✓.",
    "Inciso (c) — tiempo de frenado: 0 = v₀' + a₂·t₂ → 0 = 30 + (−5)·t₂ → t₂ = 30/5 = 6 s.",
    "Inciso (d) — distancia de frenado: x₂ = v₀'·t₂ + ½·a₂·t₂² = 30×6 + ½×(−5)×36 = 180 − 90 = 90 m. Verificación: x₂ = (v_f² − v₀'²)/(2a₂) = (0 − 900)/(2×−5) = −900/−10 = 90 m ✓.",
    "Resumen: (a) v = 30 m/s ≈ 108 km/h; (b) d₁ = 150 m; (c) t_freno = 6 s, (d) d₂ = 90 m. Distancia total recorrida: 150 + 90 = 240 m.",
  ],
  respuestaFinal: "(a) 30 m/s ≈ 108 km/h; (b) 150 m; (c) 6 s; (d) 90 m adicionales.",
};

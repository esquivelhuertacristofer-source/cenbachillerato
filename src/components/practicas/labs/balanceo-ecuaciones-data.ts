/**
 * Datos puros del reto evaluable del laboratorio de Balanceo de ecuaciones
 * (CNEYT-IV-P01).
 *
 * Reproduce VERBATIM el ejercicio ancla A2 «Balancea: ejercicio paso a paso
 * con ecuaciones reales» (ejercicio_matematico).
 *
 * El alumno introduce los seis coeficientes estequiométricos (uno por campo)
 * y los comprueba con tolerancia 0 (valores enteros exactos).
 *
 * Verificación aritmética:
 *   Ec.1 — 2 H₂ + O₂ → 2 H₂O
 *     H: izq 2×2=4, der 2×2=4 ✓ | O: izq 1×2=2, der 2×1=2 ✓
 *   Ec.2 — CH₄ + 2 O₂ → CO₂ + 2 H₂O
 *     C: 1=1 ✓ | H: 4=2×2=4 ✓ | O: 2×2=4 der (1×2)+(2×1)=4 ✓
 *   Ec.3 — 4 Fe + 3 O₂ → 2 Fe₂O₃
 *     Fe: 4=2×2=4 ✓ | O: 3×2=6=2×3=6 ✓
 *
 * Fuente: CNEYT-IV-P01-A2 (ejercicio_matematico, practica_slug=balanceo-ecuaciones)
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { RetoNumericoData } from "./_reto-numerico";

// VERBATIM de CNEYT-IV-P01-A2 (ejercicio_matematico).
export const RETO_A2: RetoNumericoData = {
  titulo: "Balancea: ejercicio paso a paso con ecuaciones reales",

  contexto:
    "Balancea las siguientes ecuaciones químicas aplicando el método de inspección (tanteo). " +
    "Para cada una, escribe los coeficientes estequiométricos que hacen que el número de átomos " +
    "de cada elemento sea igual en reactivos y productos. " +
    "Recuerda: SOLO puedes cambiar los coeficientes (los números delante de cada fórmula). " +
    "NO puedes cambiar los subíndices dentro de las fórmulas.",

  problema:
    "Ecuación 1: H₂ + O₂ → H₂O\n" +
    "Encuentra los coeficientes para: __ H₂ + __ O₂ → __ H₂O\n\n" +
    "Ecuación 2: CH₄ + O₂ → CO₂ + H₂O\n" +
    "Encuentra los coeficientes para: __ CH₄ + __ O₂ → __ CO₂ + __ H₂O\n\n" +
    "Ecuación 3: Fe + O₂ → Fe₂O₃\n" +
    "Encuentra los coeficientes para: __ Fe + __ O₂ → __ Fe₂O₃",

  campos: [
    // Ecuación 1 — 2 H₂ + O₂ → 2 H₂O
    {
      etiqueta: "Ec.1 — coeficiente de H₂ (reactivo)",
      objetivo: 2,
      tolerancia: 0,
      placeholder: "?",
    },
    {
      etiqueta: "Ec.1 — coeficiente de H₂O (producto)",
      objetivo: 2,
      tolerancia: 0,
      placeholder: "?",
    },
    // Ecuación 2 — CH₄ + 2 O₂ → CO₂ + 2 H₂O
    {
      etiqueta: "Ec.2 — coeficiente de O₂ (reactivo)",
      objetivo: 2,
      tolerancia: 0,
      placeholder: "?",
    },
    {
      etiqueta: "Ec.2 — coeficiente de H₂O (producto)",
      objetivo: 2,
      tolerancia: 0,
      placeholder: "?",
    },
    // Ecuación 3 — 4 Fe + 3 O₂ → 2 Fe₂O₃
    {
      etiqueta: "Ec.3 — coeficiente de Fe (reactivo)",
      objetivo: 4,
      tolerancia: 0,
      placeholder: "?",
    },
    {
      etiqueta: "Ec.3 — coeficiente de O₂ (reactivo)",
      objetivo: 3,
      tolerancia: 0,
      placeholder: "?",
    },
  ],

  // Pasos guía — VERBATIM de pasos_guia de A2.
  pasosGuia: [
    "Ecuación 1 — H₂ + O₂ → H₂O: Cuenta átomos: izquierda H=2, O=2; derecha H=2, O=1. El oxígeno no está balanceado. Coloca coeficiente 2 delante de H₂O: H₂ + O₂ → 2 H₂O. Ahora O está par (O=2 y O=2), pero H no: izquierda H=2, derecha H=4. Coloca 2 delante de H₂: 2 H₂ + O₂ → 2 H₂O. Verificación: H izq=4, H der=4 ✓; O izq=2, O der=2 ✓.",
    "Ecuación 2 — CH₄ + O₂ → CO₂ + H₂O: Cuenta átomos iniciales: C=1/1 ✓, H=4/2 ✗, O=2/3 ✗. Balancea H primero: coloca 2 delante de H₂O → CH₄ + O₂ → CO₂ + 2 H₂O. Ahora O derecho = 2+2 = 4; O izquierdo = 2 (falta). Coloca 2 delante de O₂: CH₄ + 2 O₂ → CO₂ + 2 H₂O. Verifica: C=1/1 ✓, H=4/4 ✓, O=4/4 ✓.",
    "Ecuación 3 — Fe + O₂ → Fe₂O₃: Átomos iniciales: Fe=1, O=2 izq; Fe=2, O=3 der. Fe y O están desbalanceados. El mínimo común múltiplo de O es 6 (2×3). Coloca 3 delante de O₂ y 2 delante de Fe₂O₃: Fe + 3 O₂ → 2 Fe₂O₃. Ahora O=6/6 ✓, pero Fe=1 izq vs 4 der. Coloca 4 delante de Fe: 4 Fe + 3 O₂ → 2 Fe₂O₃. Verifica: Fe=4/4 ✓, O=6/6 ✓.",
    "Verificación general para las tres ecuaciones: suma el número de átomos de cada elemento en cada lado de la flecha y confirma que son iguales. Un solo átomo desbalanceado invalida la ecuación.",
    "Interpretación estequiométrica: en 2 H₂ + O₂ → 2 H₂O, los coeficientes significan que 2 moléculas de H₂ reaccionan con 1 molécula de O₂ para producir 2 moléculas de H₂O; o bien, 2 moles de H₂ reaccionan con 1 mol de O₂ para producir 2 moles de H₂O.",
    "Respuestas finales: (1) 2 H₂ + O₂ → 2 H₂O; (2) CH₄ + 2 O₂ → CO₂ + 2 H₂O; (3) 4 Fe + 3 O₂ → 2 Fe₂O₃.",
  ],

  // Respuesta final — VERBATIM de respuesta_final de A2.
  respuestaFinal:
    "2 H₂ + O₂ → 2 H₂O | CH₄ + 2 O₂ → CO₂ + 2 H₂O | 4 Fe + 3 O₂ → 2 Fe₂O₃",
};

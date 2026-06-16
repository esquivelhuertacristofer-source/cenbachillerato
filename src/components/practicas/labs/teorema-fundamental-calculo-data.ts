/**
 * Datos puros del reto evaluable del laboratorio del Teorema Fundamental del
 * Cálculo (PM-V-P10).
 *
 * Reproduce VERBATIM el ejercicio ancla A2 «Distancia como área: ∫₀⁴ 2t dt
 * y el TFC» (ejercicio_matematico, practica_slug=teorema-fundamental-calculo).
 *
 * Aritmética verificada:
 *   a) Área = distancia = ½·4·8 = 16 m  ✓  (también [t²]₀⁴ = 16 − 0 = 16)
 *   b) ∫₀⁴ 2t dt con antiderivada = [t²]₀⁴ = 16 − 0 = 16 m  ✓
 *   c) d(t) = t² ⇒ d′(t) = 2t; en t = 4: d′(4) = 2·4 = 8 m/s = v(4)  ✓
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { RetoNumericoData } from "./_reto-numerico";

// VERBATIM de PM-V-P10-A2 (ejercicio_matematico, practica_slug=teorema-fundamental-calculo).
export const RETO_A2: RetoNumericoData = {
  titulo: "Distancia como área: ∫₀⁴ 2t dt y el TFC",
  contexto:
    "Los tres incisos recorren el contenido formativo de la progresión: el área bajo la curva en un intervalo (a), la integral como cálculo de esa área usando una antiderivada (b), y la integral como función inversa de la derivada (c). En el laboratorio 3D la función v = 2t está en el catálogo y los tres modos —rectángulos de Riemann, función de acumulación y la recta tangente cuya pendiente es f(b)— hacen visible cada inciso sobre el plano cartesiano.",
  problema:
    "Un objeto parte del reposo y se mueve con velocidad v(t) = 2t (en m/s, con t en segundos).\n\n" +
    "a) ÁREA = TOTAL. ¿Qué representa el área bajo la gráfica de v(t) entre t = 0 y t = 4 s?\n" +
    "   Calcula el área del triángulo: base = 4 s, altura = v(4) = 2·4 = ? m/s → área = ½·4·? = ? m\n\n" +
    "b) CÁLCULO. Calcula la integral ∫₀⁴ 2t dt con la antiderivada F(t) = t²:\n" +
    "   ∫₀⁴ 2t dt = [t²]₀⁴ = 4² − 0² = ? m\n\n" +
    "c) EL TEOREMA. La función de acumulación es d(t) = t². Verifica el TFC:\n" +
    "   d′(t) = ? · t (indica el coeficiente). ¿Coincide con v(t) = 2t?",
  campos: [
    {
      etiqueta: "a) Distancia recorrida (área del triángulo bajo v = 2t entre t = 0 y t = 4 s)",
      objetivo: 16,
      tolerancia: 0.01,
      unidad: "m",
      placeholder: "16",
    },
    {
      etiqueta: "b) ∫₀⁴ 2t dt = [t²]₀⁴ = 4² − 0²",
      objetivo: 16,
      tolerancia: 0.01,
      unidad: "m",
      placeholder: "16",
    },
    {
      etiqueta: "c) Coeficiente de t en d′(t): si d(t) = t² entonces d′(t) = ? · t",
      objetivo: 2,
      tolerancia: 0,
      placeholder: "2",
    },
  ],
  pasosGuia: [
    "a) El área bajo la gráfica velocidad–tiempo es la DISTANCIA recorrida: el área acumula la velocidad a lo largo del tiempo. Es un fenómeno de acumulación de un cambio continuo.",
    "b) Como triángulo: base = 4 s, altura = v(4) = 2·4 = 8 m/s, área = ½·4·8 = 16 m. Con antiderivada: ∫₀⁴ 2t dt = [t²]₀⁴ = 4² − 0² = 16 m. Ambas formas dan 16 m.",
    "c) La función de acumulación es d(t) = t²; su derivada es d′(t) = 2t = v(t). Derivar la acumulación devuelve la velocidad: ese es el Teorema Fundamental del Cálculo (integrar y derivar son inversas).",
  ],
  respuestaFinal:
    "a) La distancia recorrida. b) ∫₀⁴ 2t dt = [t²]₀⁴ = 16 m (igual que el triángulo ½·4·8 = 16 m). c) d(t) = t² ⇒ d′(t) = 2t = v(t) ✓: derivar la acumulación devuelve la función original (TFC).",
};

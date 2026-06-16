/**
 * Datos de la Ficha Teórica del laboratorio de Cinemática MRUA (CNEYT-V-P02).
 *
 * Contenido VERBATIM de la actividad ancla A1 «MRU y MRUA: del movimiento
 * uniforme a la aceleración constante» (lectura).
 * Glosario VERBATIM de A5 «Glosario — Cinemática: MRU y MRUA».
 * El reto evaluable vive en mrua-acelerar-frenar-data.ts (A2).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const MRUA_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-V-P02-A2",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "La cinemática es la rama de la física que describe el movimiento de los cuerpos sin analizar las causas que lo producen. Sus dos modelos fundamentales en una dimensión son el Movimiento Rectilíneo Uniforme (MRU) y el Movimiento Rectilíneo Uniformemente Acelerado (MRUA).",
    "El Movimiento Rectilíneo Uniforme (MRU) describe un cuerpo que se desplaza en línea recta a velocidad constante. Si la velocidad no cambia, la aceleración es cero. La ecuación cinemática del MRU es: x = x₀ + vt, donde x es la posición final, x₀ es la posición inicial, v es la velocidad (constante) y t es el tiempo. Ejemplo mexicano: el Tren Suburbano de la CDMX que conecta Buenavista con Cuautitlán circula en sus tramos de vía libre a 80 km/h (≈ 22.2 m/s) de manera aproximadamente uniforme. En 3 minutos (180 s) recorre: x = 0 + 22.2 × 180 = 3,996 m ≈ 4 km. En la gráfica posición-tiempo del MRU, la curva es una línea recta con pendiente igual a v. En la gráfica velocidad-tiempo, es una línea horizontal (velocidad constante).",
    "El Movimiento Rectilíneo Uniformemente Acelerado (MRUA) describe un cuerpo que experimenta una aceleración constante. Sus ecuaciones cinemáticas son: • Velocidad: v = v₀ + at • Posición: x = x₀ + v₀t + ½at² • Relación sin tiempo: v² = v₀² + 2a(x - x₀). Donde v₀ es la velocidad inicial, a es la aceleración (constante), t es el tiempo y x - x₀ es el desplazamiento. En la gráfica posición-tiempo del MRUA, la curva es una parábola (el desplazamiento varía cuadráticamente con t). En la gráfica velocidad-tiempo, es una línea recta con pendiente igual a a.",
    "La caída libre es el ejemplo más importante de MRUA: todos los cuerpos (sin considerar la resistencia del aire) caen con la misma aceleración gravitacional a = g = 9.8 m/s². Ejemplo mexicano: el Ángel de la Independencia en Paseo de la Reforma tiene una altura aproximada de 23 m desde la base hasta la cúspide. Si un objeto cae desde la punta del Ángel, el tiempo de caída se calcula con: h = ½gt² → t = √(2h/g) = √(2 × 23 / 9.8) = √(4.69) ≈ 2.17 s. Al llegar al suelo, su velocidad es: v = gt = 9.8 × 2.17 ≈ 21.3 m/s ≈ 76.6 km/h. Esto ilustra por qué los andamios de construcción deben estar asegurados: un objeto pequeño cayendo desde esa altura puede causar graves daños.",
    "Diferencias clave entre MRU y MRUA: en el MRU, v = constante y a = 0; la distancia recorrida en intervalos iguales de tiempo es siempre la misma. En el MRUA, a = constante y v aumenta o disminuye uniformemente; la distancia recorrida en intervalos iguales de tiempo aumenta (si acelera) o disminuye (si desacelera). Al frenar un automóvil, la distancia de frenado es proporcional al cuadrado de la velocidad inicial (d = v₀²/2a), razón por la cual a 100 km/h la distancia de frenado es cuatro veces mayor que a 50 km/h —un dato crítico para la seguridad vial en las carreteras mexicanas.",
  ],

  objetivos: [
    "Distinguir el MRU del MRUA e identificar sus características en gráficas x-t y v-t.",
    "Aplicar las ecuaciones cinemáticas (v = v₀ + at; x = x₀ + v₀t + ½at²) para resolver problemas.",
    "Calcular e interpretar la velocidad media y la aceleración a partir de datos numéricos o gráficas.",
    "Resolver problemas de caída libre usando g ≈ 9.8 m/s² y las ecuaciones del MRUA vertical.",
    "Resolver el reto evaluable de la actividad A2 (autopista Puebla-CDMX).",
  ],

  materiales: [
    { nombre: "Escena 3D autopista", detalle: "Automóvil con aceleración y frenado visualizados en tiempo real", icono: "fa-car-side" },
    { nombre: "Gráficas x-t, v-t, a-t", detalle: "Las tres representaciones del MRUA con sonda en el instante actual", icono: "fa-chart-line" },
    { nombre: "Deslizadores de variables", detalle: "Ajusta a₁, t₁ y a₂ para explorar cómo cambian las distancias", icono: "fa-sliders" },
    { nombre: "Línea de tiempo", detalle: "Scrubbing frame a frame del recorrido completo", icono: "fa-stopwatch" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1 y el glosario A5.
  conceptos: [
    { termino: "Cinemática", definicion: "Rama de la física que describe el movimiento de los cuerpos sin analizar las causas que lo producen." },
    { termino: "MRU (Movimiento Rectilíneo Uniforme)", definicion: "Movimiento en línea recta con velocidad constante y aceleración cero. La posición varía linealmente con el tiempo: x = x₀ + vt." },
    { termino: "MRUA (Movimiento Rectilíneo Uniformemente Acelerado)", definicion: "Movimiento en línea recta con aceleración constante. Ecuaciones: v = v₀ + at; x = x₀ + v₀t + ½at²; v² = v₀² + 2a(x − x₀)." },
    { termino: "Aceleración constante (a)", definicion: "Razón de cambio constante de la velocidad. Unidad: m/s². En el MRUA, la pendiente de la recta v-t es la aceleración." },
    { termino: "Distancia de frenado", definicion: "Proporcional al cuadrado de la velocidad inicial: d = v₀²/2a. Al duplicar la velocidad, la distancia de frenado se cuadruplica." },
    { termino: "Caída libre", definicion: "Caso especial de MRUA en dirección vertical con aceleración g ≈ 9.8 m/s² (hacia abajo), sin resistencia del aire." },
  ],

  // Glosario VERBATIM de CNEYT-V-P02-A5 «Glosario — Cinemática: MRU y MRUA».
  glosario: [
    {
      termino: "Movimiento rectilíneo uniforme (MRU)",
      definicion: "Movimiento en línea recta con velocidad constante y aceleración cero. La posición varía linealmente con el tiempo: x = x₀ + vt. Ejemplo: Un automóvil en autopista a velocidad constante de 90 km/h sin acelerar ni frenar: recorre d = v × t = 90 × 2 = 180 km en 2 horas.",
    },
    {
      termino: "Movimiento rectilíneo uniformemente acelerado (MRUA)",
      definicion: "Movimiento en línea recta con aceleración constante. Ecuaciones: v = v₀ + at; x = x₀ + v₀t + ½at²; v² = v₀² + 2a(x − x₀). Ejemplo: Un auto parte del reposo (v₀ = 0) con a = 3 m/s². A los 5 s: v = 3 × 5 = 15 m/s; x = ½ × 3 × 25 = 37.5 m.",
    },
    {
      termino: "Velocidad media",
      definicion: "Razón entre el desplazamiento total y el tiempo transcurrido: v_med = Δx/Δt. No indica cómo varía la velocidad instante a instante. Ejemplo: Un corredor va de A a B (200 m) en 40 s: v_med = 200/40 = 5 m/s.",
    },
    {
      termino: "Gráfica posición-tiempo (x-t)",
      definicion: "En MRU: línea recta con pendiente = velocidad. En MRUA: parábola. La pendiente de la tangente en un punto indica la velocidad instantánea. Ejemplo: Si la gráfica x-t es una recta con pendiente positiva, el objeto se aleja del origen con velocidad constante positiva.",
    },
    {
      termino: "Gráfica velocidad-tiempo (v-t)",
      definicion: "En MRU: línea horizontal (v constante, a = 0). En MRUA: línea recta con pendiente = aceleración. El área bajo la curva v-t = desplazamiento. Ejemplo: Si la gráfica v-t es una recta con pendiente a = 2 m/s², el área entre t = 0 y t = 4 s corresponde al desplazamiento.",
    },
    {
      termino: "Caída libre",
      definicion: "Caso especial de MRUA en dirección vertical con aceleración g ≈ 9.8 m/s² (hacia abajo), sin resistencia del aire. Ecuaciones: v = v₀ + gt; h = v₀t + ½gt². Ejemplo: Objeto en caída libre desde reposo: después de t = 3 s, v = 9.8 × 3 = 29.4 m/s y h = ½ × 9.8 × 9 = 44.1 m.",
    },
  ],

  aplicaciones: [
    "Calcular la distancia de frenado en carreteras mexicanas (d = v₀²/2a): a 100 km/h la distancia es cuatro veces mayor que a 50 km/h.",
    "Analizar el tiempo de caída de objetos desde estructuras de construcción para evaluar riesgos de seguridad.",
    "Planificar tiempos de recorrido del Tren Suburbano CDMX–Cuautitlán aplicando la ecuación del MRU.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1 y Glosario A5, CNEYT-V-P02.",
};

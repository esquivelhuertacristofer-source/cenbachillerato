/**
 * Datos de la Ficha Teórica del laboratorio del Discriminante (PM-III-P03).
 *
 * Contenido VERBATIM de la actividad ancla A1 «El discriminante: ¿cuántas
 * soluciones tiene una ecuación?» (video_con_preguntas). Los conceptos y el
 * glosario provienen de A5 «Glosario — Discriminante y naturaleza de raíces»
 * (glosario_interactivo), también VERBATIM.
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const DISCRIMINANTE_FICHA: FichaTeoricaData = {
  ancla: "PM-III · P03 · A1 — El discriminante: ¿cuántas soluciones tiene una ecuación?",

  // Marco teórico — VERBATIM de la lectura/video A1 (campo "texto").
  marcoTeorico: [
    "Para resolver cualquier ecuación cuadrática de la forma ax² + bx + c = 0, existe una fórmula que siempre funciona, independientemente de los valores de los coeficientes. Se llama fórmula general o fórmula cuadrática: x = (-b ± √(b² - 4ac)) / (2a). Esta fórmula produce hasta dos soluciones porque el símbolo ± genera dos cálculos distintos: uno con suma y otro con resta.",
    "El discriminante es la expresión que aparece bajo el radical: Δ = b² - 4ac. Antes de calcular toda la fórmula, podemos calcular solo el discriminante para saber cuántas soluciones reales tiene la ecuación, e incluso cuál será su naturaleza.",
    "Si Δ > 0, la ecuación tiene dos raíces reales distintas. La raíz cuadrada de un número positivo existe en los números reales, y el signo ± da dos valores diferentes. Geométricamente, esto significa que la parábola correspondiente cruza el eje horizontal en dos puntos.",
    "Si Δ = 0, la ecuación tiene exactamente una raíz real (o una raíz doble, porque los dos valores de la fórmula coinciden: (-b + 0) / 2a = (-b - 0) / 2a = -b/2a). Geométricamente, la parábola es tangente al eje horizontal en un único punto, el vértice.",
    "Si Δ < 0, la ecuación no tiene raíces reales. La raíz cuadrada de un número negativo no existe en el conjunto de los números reales (es un número imaginario). Geométricamente, la parábola no toca en ningún punto el eje horizontal: está completamente por encima o por debajo de él.",
    "Esta información es poderosa porque nos permite conocer el tipo de solución sin hacer el cálculo completo. Por ejemplo, para saber si una empresa familiar mexicana tiene un punto de equilibrio económico (el momento en que los ingresos igualan los costos), podemos modelar la situación con una ecuación cuadrática y calcular el discriminante. Si Δ > 0, hay dos puntos de equilibrio. Si Δ = 0, hay exactamente un punto de equilibrio. Si Δ < 0, los costos nunca igualan a los ingresos en el rango analizado, lo que indica que el modelo necesita revisarse.",
    "Calcular el discriminante es rápido y evita el trabajo de resolver toda la ecuación cuando solo necesitamos saber cuántas soluciones existen.",
  ],

  objetivos: [
    "Identificar los coeficientes a, b y c en una ecuación cuadrática ax² + bx + c = 0.",
    "Calcular el discriminante Δ = b² − 4ac correctamente.",
    "Determinar el número y tipo de raíces reales a partir del signo de Δ.",
    "Interpretar geométricamente los tres casos del discriminante en la gráfica de la parábola.",
    "Aplicar el discriminante al modelo de altura de un cohete h(t) = −5t² + 30t + 10 (A2).",
  ],

  materiales: [
    { nombre: "Parábola 3D interactiva", detalle: "Mueve a, b, c y observa en vivo cómo cambia Δ y la curva", icono: "fa-square-root-variable" },
    { nombre: "Tres casos del discriminante", detalle: "Δ > 0 dos raíces · Δ = 0 raíz doble · Δ < 0 ninguna real", icono: "fa-code-branch" },
    { nombre: "Eje imaginario (Δ < 0)", detalle: "Visualiza cómo las raíces se despegan al plano complejo a ± bi", icono: "fa-infinity" },
    { nombre: "Escenarios guiados", detalle: "Cohete h(t) = −5t² + 30t + 10 y otros ejemplos verbatim de la actividad", icono: "fa-rocket" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1 y el glosario A5.
  conceptos: [
    { termino: "Fórmula general (cuadrática)", definicion: "x = (−b ± √(b² − 4ac)) / (2a). Sirve para resolver cualquier ecuación ax² + bx + c = 0, independientemente de los valores de a, b y c." },
    { termino: "Discriminante (Δ)", definicion: "La expresión Δ = b² − 4ac que aparece bajo el radical de la fórmula general. Su signo determina el número y tipo de raíces sin resolver la ecuación completa." },
    { termino: "Δ > 0: dos raíces reales distintas", definicion: "Cuando el discriminante es positivo, la ecuación tiene exactamente dos soluciones reales y diferentes. La parábola cruza el eje x en dos puntos." },
    { termino: "Δ = 0: raíz doble (real repetida)", definicion: "Cuando el discriminante es cero, la ecuación tiene una única raíz real (repetida): x = −b/(2a). La parábola es tangente al eje x en el vértice." },
    { termino: "Δ < 0: sin raíces reales", definicion: "Cuando el discriminante es negativo, la ecuación no tiene soluciones en los números reales. Las raíces son números complejos de la forma a ± bi. La parábola no toca el eje x." },
    { termino: "Números complejos (cuando Δ < 0)", definicion: "Las soluciones son de la forma a ± bi, donde i es la unidad imaginaria (√−1). Tienen aplicaciones fundamentales en ingeniería eléctrica, física cuántica y procesamiento de señales digitales." },
  ],

  // Glosario — VERBATIM de A5 «Glosario — Discriminante y naturaleza de raíces»
  // (glosario_interactivo, campo "terminos"). Seis términos presentes en la actividad.
  glosario: [
    {
      termino: "Discriminante (Δ)",
      definicion: "Expresión Δ = b²−4ac que determina la naturaleza de las raíces de ax²+bx+c=0 sin necesidad de resolverla.",
    },
    {
      termino: "Δ > 0: dos raíces reales distintas",
      definicion: "Cuando el discriminante es positivo, la ecuación tiene exactamente dos soluciones reales y diferentes.",
    },
    {
      termino: "Δ = 0: raíz doble (real repetida)",
      definicion: "Cuando el discriminante es cero, la ecuación tiene una única raíz real (repetida): x = −b/(2a).",
    },
    {
      termino: "Δ < 0: sin raíces reales",
      definicion: "Cuando el discriminante es negativo, la ecuación no tiene soluciones en los números reales.",
    },
    {
      termino: "Raíz doble",
      definicion: "Cuando Δ=0, la única raíz es x=−b/(2a). La parábola correspondiente es tangente al eje x.",
    },
    {
      termino: "Uso práctico del discriminante",
      definicion: "Permite clasificar las raíces antes de resolver y anticipar la cantidad de intersecciones de la parábola con el eje x.",
    },
  ],

  aplicaciones: [
    "Determinar si una empresa tiene cero, uno o dos puntos de equilibrio económico sin resolver la ecuación completa.",
    "Modelar la altura de un cohete de pirotecnia h(t) = −5t² + 30t + 10 y saber cuántas veces alcanza una altura objetivo.",
    "Diseño en ingeniería: el audio digital de los celulares, la ingeniería eléctrica y la física cuántica usan números complejos (caso Δ < 0).",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Video con preguntas A1 y Glosario A5, PM-III-P03.",
};

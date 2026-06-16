/**
 * Datos de la Ficha Teórica del laboratorio de La derivada: secante → tangente
 * (PM-V-P03).
 *
 * Marco teórico y preguntas de comprensión — VERBATIM de la actividad ancla A1
 * «La derivada: pendiente instantánea y tasa de cambio» (lectura).
 * Glosario — VERBATIM de A5 «Glosario — Derivada: definición e interpretación
 * geométrica» (glosario_interactivo).
 * El reto evaluable vive en derivada-secante-tangente-data.ts (A2).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const DERIVADA_FICHA: FichaTeoricaData = {
  ancla: "PM-V · P03 · A1 — La derivada: pendiente instantánea y tasa de cambio",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "¿Cómo describe la matemática algo que cambia en un instante? Esta pregunta, que obsesionó a Newton y Leibniz en el siglo XVII, tiene una respuesta precisa: la derivada. Comprender la derivada es comprender el cambio.",
    "El problema motivador: velocidad instantánea. Imagina un proyectil lanzado verticalmente. Su altura en metros sobre el suelo, en función del tiempo t (en segundos), es h(t) = -5t² + 30t. La velocidad promedio entre t = 1 y t = 2 es: [h(2) - h(1)] / (2 - 1) = [(-5·4 + 60) - (-5 + 30)] / 1 = [40 - 25] / 1 = 15 m/s. Pero ¿cuál es la velocidad exacta en el instante t = 1? Para saberlo, calculamos la velocidad promedio en el intervalo [1, 1+h] y luego tomamos el límite cuando h→0.",
    "El cociente de Newton (cociente diferencial). Para una función f(x), el cociente diferencial es: [f(x+h) - f(x)] / h. Este cociente representa la pendiente de la recta secante que pasa por los puntos (x, f(x)) y (x+h, f(x+h)) de la curva. Cuando h→0, la recta secante se convierte en la recta tangente a la curva en el punto (x, f(x)), y su pendiente es la derivada: f'(x) = lim(h→0) [f(x+h) - f(x)] / h.",
    "Interpretación geométrica. La derivada f'(a) es la pendiente de la recta tangente a la gráfica de f en el punto (a, f(a)). Una pendiente positiva significa que la función crece en ese punto; una pendiente negativa, que decrece; una pendiente cero señala un posible máximo, mínimo o punto de inflexión.",
    "Ejemplo concreto: derivada de f(x) = x² desde la definición. f'(x) = lim(h→0) [(x+h)² - x²] / h = lim(h→0) [x² + 2xh + h² - x²] / h = lim(h→0) [2xh + h²] / h = lim(h→0) [2x + h] = 2x. Así, la pendiente de la parábola y = x² en cualquier punto x es 2x. En x = 1, la tangente tiene pendiente 2; en x = 3, tiene pendiente 6.",
    "Notaciones. Existen varias notaciones equivalentes para la derivada, cada una con su utilidad: f'(x): notación de Lagrange, práctica para funciones nombradas; dy/dx: notación de Leibniz, enfatiza la relación entre variables y es útil en cálculo integral; D[f]: notación de operador.",
    "Interpretación física: posición, velocidad y aceleración. Si s(t) es la función de posición de un objeto, entonces: s'(t) = v(t) es la velocidad (primera derivada de posición); v'(t) = s''(t) = a(t) es la aceleración (segunda derivada de posición). Esta cadena de derivadas es fundamental en mecánica clásica. Las Leyes de Newton (F = ma) están escritas en lenguaje de derivadas: la fuerza es masa por la segunda derivada de la posición respecto al tiempo.",
    "Derivabilidad y continuidad. Si f es derivable en x = a, entonces f también es continua en x = a. El recíproco no es verdadero: f(x) = |x| es continua en x = 0 pero no derivable allí (la gráfica tiene un 'pico' angular con dos tangentes distintas por la izquierda y la derecha). Comprender la derivada como un límite del cociente diferencial es el fundamento sobre el cual se construyen todas las reglas de derivación.",
  ],

  objetivos: [
    "Enunciar la definición de derivada como lim(h→0) [f(a+h)−f(a)]/h e interpretarla como tasa de cambio instantánea.",
    "Calcular la derivada de funciones polinomiales sencillas usando la definición (límite del cociente diferencial).",
    "Determinar la ecuación de la recta tangente a una curva en un punto dado usando f'(a) como pendiente.",
    "Identificar casos de no derivabilidad (cúspides, discontinuidades) y justificarlos con los límites laterales.",
    "Resolver el ejercicio evaluable de derivación por definición (A2).",
  ],

  materiales: [
    { nombre: "Escena 3D secante → tangente", detalle: "La secante (cociente de Newton) se cierra sobre la tangente cuando h→0", icono: "fa-ruler-combined" },
    { nombre: "Tabla de acercamiento", detalle: "Pendientes secantes por la derecha e izquierda que convergen a f'(a)", icono: "fa-table-list" },
    { nombre: "Resolución paso a paso", detalle: "Pasos verbatim del ejercicio A2 (casos a, b y c) en la columna lateral", icono: "fa-list-ol" },
    { nombre: "Modo animación", detalle: "h oscila entre H_MAX y H_MIN para ilustrar el límite h→0 visualmente", icono: "fa-play" },
  ],

  // Conceptos centrales — formulados desde la lectura A1 y el glosario A5.
  conceptos: [
    { termino: "Cociente diferencial (incremental)", definicion: "La expresión [f(a+h) − f(a)]/h, donde h ≠ 0. Representa la pendiente de la recta secante que une (a, f(a)) y (a+h, f(a+h)). El numerador es el incremento de y; el denominador es el incremento de x." },
    { termino: "Derivada en un punto", definicion: "f'(a) = lim(h→0) [f(a+h) − f(a)]/h. Es el límite del cociente incremental cuando el incremento h tiende a cero. Representa la tasa de cambio instantánea de f en x = a." },
    { termino: "Función derivada f'(x)", definicion: "Cuando se calcula f'(a) para todos los a en el dominio donde el límite existe, se obtiene la función derivada f'(x). Notaciones: f'(x), dy/dx, Df(x)." },
    { termino: "Recta tangente", definicion: "La recta tangente a la gráfica de f en (a, f(a)) tiene pendiente m = f'(a). Su ecuación es y − f(a) = f'(a)(x − a)." },
    { termino: "Recta secante vs. recta tangente", definicion: "La secante cruza la curva en dos puntos (a, f(a)) y (a+h, f(a+h)). Cuando h→0, la secante gira hasta coincidir con la tangente. La derivada es el límite de las pendientes secantes." },
    { termino: "No derivabilidad", definicion: "Una función no es derivable en x = a si el límite del cociente diferencial no existe. Causas: cúspide (pico angular como en |x|), discontinuidad, o tangente vertical." },
  ],

  // Glosario — VERBATIM de PM-V-P03-A5 (glosario_interactivo).
  glosario: [
    {
      termino: "Cociente diferencial (incremental)",
      definicion: "La expresión [f(a+h) − f(a)]/h, donde h ≠ 0. Representa la pendiente de la recta secante que une (a, f(a)) y (a+h, f(a+h)). El numerador es el incremento de y; el denominador es el incremento de x. Ejemplo: Para f(x)=x², en a=2, h=1: [f(3)−f(2)]/1 = (9−4)/1 = 5 (pendiente de la secante).",
    },
    {
      termino: "Derivada en un punto",
      definicion: "f'(a) = lim(h→0) [f(a+h) − f(a)]/h. Es el límite del cociente incremental cuando el incremento h tiende a cero. Representa la tasa de cambio instantánea de f en x = a. Ejemplo: f(x)=x²: f'(a) = lim(h→0) [(a+h)²−a²]/h = lim(h→0) (2a+h) = 2a. Así f'(3) = 6.",
    },
    {
      termino: "Función derivada f'(x)",
      definicion: "Cuando se calcula f'(a) para todos los a en el dominio donde el límite existe, se obtiene la función derivada f'(x). Notaciones: f'(x), dy/dx, Df(x). Ejemplo: f(x) = x³: f'(x) = lim(h→0) [(x+h)³−x³]/h = lim(h→0) (3x²+3xh+h²) = 3x².",
    },
    {
      termino: "Recta tangente",
      definicion: "La recta tangente a la gráfica de f en (a, f(a)) tiene pendiente m = f'(a). Su ecuación es y − f(a) = f'(a)(x − a). Ejemplo: f(x)=x², tangente en (2,4): m=f'(2)=4. Ecuación: y−4=4(x−2) → y=4x−4.",
    },
    {
      termino: "Recta secante vs. recta tangente",
      definicion: "La secante cruza la curva en dos puntos (a, f(a)) y (a+h, f(a+h)). Cuando h→0, la secante gira hasta coincidir con la tangente. La derivada es el límite de las pendientes secantes. Ejemplo: En f(x)=x² en x=1: pendiente secante con h=0.1 es (1.21−1)/0.1=2.1. Con h→0 → pendiente tangente = 2.",
    },
    {
      termino: "No derivabilidad",
      definicion: "Una función no es derivable en x = a si el límite del cociente diferencial no existe. Causas: cúspide (pico angular como en |x|), discontinuidad, o tangente vertical. Ejemplo: f(x)=|x|: en x=0, límite izq. de [f(h)−f(0)]/h = −1 y límite der. = 1. Son distintos: f no es derivable en 0.",
    },
  ],

  aplicaciones: [
    "Si s(t) es la posición de un objeto, s'(t) = v(t) es la velocidad instantánea y s''(t) = a(t) es la aceleración.",
    "La derivada como pendiente instantánea permite hallar máximos y mínimos de funciones (donde f'(a) = 0).",
    "La velocidad de un proyectil h(t) = −5t² + 30t es h'(t) = −10t + 30; en t = 3 s la velocidad es 0 m/s (altura máxima).",
    "Las Leyes de Newton (F = ma) están escritas en lenguaje de derivadas: la fuerza es masa por la segunda derivada de la posición respecto al tiempo.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1 y Glosario A5, PM-V-P03. Referencias: MCCEMS 2025, Apostol Calculus Vol. I.",
};

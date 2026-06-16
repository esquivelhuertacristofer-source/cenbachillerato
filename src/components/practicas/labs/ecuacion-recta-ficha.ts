/**
 * Datos de la Ficha Teórica del laboratorio de la Ecuación de la recta
 * (PM-III-P10).
 *
 * Contenido VERBATIM de la actividad ancla A1 «Una ecuación, dos incógnitas:
 * la recta en el plano» (lectura). El glosario proviene de la actividad A5
 * «Glosario: la recta y el plano cartesiano» (glosario_interactivo).
 * El reto evaluable vive en ecuacion-recta-data.ts (A2).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const ECUACION_RECTA_FICHA: FichaTeoricaData = {
  ancla: "PM-III · P10 · A1 — Una ecuación, dos incógnitas: la recta en el plano",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "Hasta ahora resolviste ecuaciones lineales con UNA incógnita, como 2x + 3 = 11, que tienen una sola respuesta (x = 4). Pero muchas situaciones de la vida relacionan DOS cantidades que cambian juntas: el costo de un viaje en taxi según los kilómetros, el recibo de luz de CFE según el consumo, o el saldo de un ahorro según las semanas. Estas se modelan con una ECUACIÓN LINEAL CON DOS INCÓGNITAS, que suele escribirse en la forma pendiente–ordenada y = m·x + b.",
    "En esta forma, x e y son las dos incógnitas, y cada número tiene un significado:\n• La PENDIENTE (m) es la inclinación: dice cuánto cambia y por cada unidad que aumenta x. Si m > 0 la relación crece, si m < 0 decrece y si m = 0 se mantiene constante.\n• La ORDENADA AL ORIGEN (b) es el valor de y cuando x = 0: el punto de partida.",
    "Lo nuevo —y lo importante— es que una ecuación con dos incógnitas NO tiene una sola solución, sino INFINITAS: cada pareja de valores (x, y) que cumple la ecuación es una solución. Por ejemplo, en y = 2x + 1, las parejas (0, 1), (1, 3) y (2, 5) son todas soluciones.",
    "Para verlas todas a la vez usamos el PLANO CARTESIANO: dos rectas numéricas perpendiculares que se cruzan en el origen (0, 0). La horizontal es el eje X y la vertical el eje Y; dividen el plano en cuatro cuadrantes. Cada punto se nombra con un par ordenado (x, y): primero cuánto a la derecha o izquierda, luego cuánto arriba o abajo. Si dibujamos TODAS las soluciones de la ecuación, los puntos se alinean formando una RECTA. Por eso decimos que la gráfica de y = m·x + b es una recta: representarla es, simplemente, dibujar todas sus soluciones a la vez.",
  ],

  objetivos: [
    "Identificar la pendiente m y la ordenada al origen b en una ecuación y = m·x + b.",
    "Ubicar puntos (x, y) en el plano cartesiano y reconocer sus cuadrantes.",
    "Explicar por qué una ecuación con dos incógnitas tiene infinitas soluciones.",
    "Modelar una situación real (tarifa de taxi) con una ecuación de la recta.",
    "Resolver el ejercicio de la tarifa del taxi de la CDMX (A2).",
  ],

  materiales: [
    { nombre: "Recta 3D en el plano cartesiano", detalle: "Mueve la pendiente m y la ordenada b; observa cómo gira y se desplaza la recta", icono: "fa-chart-line" },
    { nombre: "Triángulo de pendiente", detalle: "Visualiza subida ÷ avance con el triángulo rise/run", icono: "fa-ruler-combined" },
    { nombre: "Puntos de solución", detalle: "Cada punto sobre la recta es una pareja (x, y) solución de la ecuación", icono: "fa-braille" },
    { nombre: "Escenario real: taxi CDMX", detalle: "Tarifa y = 1.07·x + 8.74; banderazo b = $8.74 y pendiente m = $1.07/100 m", icono: "fa-taxi" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Ecuación lineal con dos incógnitas", definicion: "Igualdad que relaciona dos variables (x, y) elevadas a la potencia 1, escrita en la forma y = m·x + b. Su gráfica es una recta en el plano cartesiano." },
    { termino: "Pendiente (m)", definicion: "La inclinación de la recta: dice cuánto cambia y por cada unidad que aumenta x (m = subida ÷ avance). Si m > 0 la relación crece, si m < 0 decrece y si m = 0 se mantiene constante." },
    { termino: "Ordenada al origen (b)", definicion: "El valor de y cuando x = 0: el punto (0, b) donde la recta cruza el eje Y. Es el punto de partida de la relación." },
    { termino: "Plano cartesiano", definicion: "Sistema de dos ejes numéricos perpendiculares —el eje horizontal X y el eje vertical Y— que se cruzan en el origen (0, 0) y dividen el plano en cuatro cuadrantes." },
    { termino: "Solución de la ecuación", definicion: "Cualquier pareja (x, y) que cumple la ecuación. Una ecuación con dos incógnitas tiene infinitas soluciones: todos los puntos de su recta." },
    { termino: "Par ordenado (x, y)", definicion: "Forma de nombrar un punto: primero la coordenada horizontal (eje X) y luego la vertical (eje Y). El orden importa: (3, −2) no es lo mismo que (−2, 3)." },
  ],

  // Glosario — VERBATIM de PM-III-P10-A5 (glosario_interactivo).
  glosario: [
    {
      termino: "Ecuación lineal con dos incógnitas",
      definicion: "Igualdad que relaciona dos variables (x, y) elevadas a la potencia 1, por ejemplo y = m·x + b. Su gráfica es una recta.",
    },
    {
      termino: "Plano cartesiano",
      definicion: "Sistema de dos ejes numéricos perpendiculares (X horizontal, Y vertical) que se cruzan en el origen y permiten ubicar puntos con pares ordenados (x, y).",
    },
    {
      termino: "Pendiente (m)",
      definicion: "Inclinación de la recta: cuánto cambia y por cada unidad que aumenta x (m = subida ÷ avance). Positiva sube, negativa baja, cero es horizontal.",
    },
    {
      termino: "Ordenada al origen (b)",
      definicion: "Valor de y cuando x = 0; el punto (0, b) donde la recta cruza el eje Y.",
    },
    {
      termino: "Raíz (cero) de la recta",
      definicion: "Valor de x donde y = 0, es decir, el punto donde la recta cruza el eje X: x = −b/m.",
    },
    {
      termino: "Solución de la ecuación",
      definicion: "Cualquier pareja (x, y) que cumple la ecuación. Una ecuación con dos incógnitas tiene infinitas: todos los puntos de su recta.",
    },
  ],

  aplicaciones: [
    "Modelar la tarifa de un taxi de la CDMX: el banderazo es la ordenada b y el costo por distancia es la pendiente m.",
    "Calcular el recibo de luz de CFE: cargo fijo (ordenada) + costo por kWh consumido (pendiente).",
    "Estimar el saldo de un ahorro semanal: saldo inicial (ordenada) + cantidad ahorrada por semana (pendiente).",
    "Proyectar la distancia recorrida por un autobús a velocidad constante.",
  ],

  fuente: "MCCEMS 2025 — Pensamiento Matemático III, contenido formativo: Ecuaciones lineales con dos incógnitas · Ecuación de la recta · Plano cartesiano. Lectura A1 y Glosario A5, PM-III-P10.",
};

/**
 * Datos de la Ficha Teórica del laboratorio de Geometría analítica (PM-IV-P06).
 *
 * Contenido VERBATIM de la actividad ancla A1 «Geometría analítica: el GPS y
 * las coordenadas» (lectura). El glosario proviene de A5 «Glosario — Geometría
 * analítica básica» (glosario_interactivo), también VERBATIM. El reto evaluable
 * vive en geometria-analitica-data.ts (RETO_A2).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const GEOMETRIA_FICHA: FichaTeoricaData = {
  ancla: "PM-IV · P06 · A1 — Geometría analítica: el GPS y las coordenadas",

  // Marco teórico — VERBATIM del texto de la lectura A1 (PM-IV-P06-A1).
  marcoTeorico: [
    "Cada vez que usas Google Maps para navegar por las calles de tu ciudad, o cuando el servicio de entrega ubica tu dirección, estás usando geometría analítica. El GPS (Sistema de Posicionamiento Global) funciona midiendo distancias entre tu dispositivo y satélites en órbita, y luego calculando tu posición exacta con las mismas fórmulas que estudiaremos en este propósito.",
    "La geometría analítica, fundada por René Descartes en el siglo XVII, es el puente entre el álgebra y la geometría. Consiste en representar figuras geométricas con ecuaciones y coordenadas en el plano cartesiano. Esta unión revolucionó las matemáticas y es la base del cálculo, la física moderna y la computación gráfica.",
    "Las tres herramientas fundamentales de la geometría analítica plana son:\n\nFórmula de distancia. La distancia entre dos puntos A(x₁, y₁) y B(x₂, y₂) es:\nd = √((x₂ - x₁)² + (y₂ - y₁)²)\nEsta fórmula es simplemente el Teorema de Pitágoras aplicado en el plano cartesiano.\n\nFórmula del punto medio. El punto M que está exactamente a la mitad entre A y B es:\nM = ((x₁ + x₂)/2, (y₁ + y₂)/2)\nEsto es el promedio de las coordenadas. Se usa para encontrar centros de segmentos, centros de gravedad y midpoints en diseño.\n\nPendiente de una recta. La pendiente m entre A y B mide qué tan inclinada está la recta:\nm = (y₂ - y₁) / (x₂ - x₁)\nUna pendiente positiva indica que la recta sube; negativa, que baja; cero, que es horizontal; indefinida, que es vertical. Dos rectas son paralelas si tienen la misma pendiente; perpendiculares si sus pendientes son recíprocas negativas (m₁ × m₂ = -1).",
    "En la Ciudad de México, la Avenida Insurgentes y Paseo de la Reforma se cruzan formando ángulos que los ingenieros urbanos calcularon con geometría analítica. El diseño de la Línea 12 del Metro, con sus curvas y estaciones, requirió coordenadas precisas y fórmulas de distancia para garantizar trayectorias seguras y eficientes.",
  ],

  objetivos: [
    "Aplicar la fórmula de distancia d = √((x₂−x₁)² + (y₂−y₁)²) para calcular distancias entre dos puntos.",
    "Calcular el punto medio de un segmento usando M = ((x₁+x₂)/2, (y₁+y₂)/2).",
    "Determinar la pendiente de una recta y la interpretar en contexto (inclinación, dirección, rectas paralelas y perpendiculares).",
    "Escribir la ecuación de una recta en la forma pendiente-intercepto y = mx + b.",
    "Resolver el ejercicio evaluable de telecomunicaciones de la actividad A2 (PM-IV-P06).",
  ],

  materiales: [
    { nombre: "Plano cartesiano 3D", detalle: "Mueve P₁ y P₂ y observa distancia, punto medio y pendiente en tiempo real", icono: "fa-chart-line" },
    { nombre: "Triángulo Δx / Δy", detalle: "Visualiza los catetos que comparten la distancia y la pendiente (Pitágoras)", icono: "fa-draw-polygon" },
    { nombre: "Escenarios guiados", detalle: "Diagonal, pendiente 45°, horizontal, vertical, pendiente negativa, empinada", icono: "fa-map-location-dot" },
    { nombre: "Cálculo paso a paso", detalle: "Δx, Δy, distancia, punto medio y pendiente calculados exactamente", icono: "fa-calculator" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Geometría analítica", definicion: "Rama fundada por Descartes en el siglo XVII; es el puente entre el álgebra y la geometría. Consiste en representar figuras geométricas con ecuaciones y coordenadas en el plano cartesiano." },
    { termino: "Fórmula de distancia", definicion: "La distancia entre A(x₁, y₁) y B(x₂, y₂) es d = √((x₂−x₁)² + (y₂−y₁)²). Es el Teorema de Pitágoras aplicado en el plano cartesiano." },
    { termino: "Punto medio", definicion: "El punto M que está exactamente a la mitad entre A y B: M = ((x₁+x₂)/2, (y₁+y₂)/2). Es el promedio de las coordenadas." },
    { termino: "Pendiente (m)", definicion: "m = (y₂−y₁)/(x₂−x₁). Mide qué tan inclinada está la recta: positiva → sube; negativa → baja; cero → horizontal; indefinida → vertical." },
    { termino: "Rectas paralelas", definicion: "Tienen la misma pendiente (m₁ = m₂) pero diferente intercepto." },
    { termino: "Rectas perpendiculares", definicion: "Sus pendientes son recíprocas negativas: m₁ × m₂ = −1." },
  ],

  // Glosario A5 — VERBATIM de PM-IV-P06-A5 (glosario_interactivo).
  glosario: [
    {
      termino: "Fórmula de la distancia",
      definicion: "La distancia entre P₁(x₁, y₁) y P₂(x₂, y₂) es d = √((x₂−x₁)² + (y₂−y₁)²). Se deriva del Teorema de Pitágoras. Ejemplo: d entre (0, 0) y (5, 12): d = √(25 + 144) = √169 = 13.",
    },
    {
      termino: "Punto medio",
      definicion: "El punto medio M entre P₁(x₁, y₁) y P₂(x₂, y₂) es M = ((x₁+x₂)/2, (y₁+y₂)/2). Ejemplo: Punto medio entre (1, 3) y (7, 9): M = ((1+7)/2, (3+9)/2) = (4, 6).",
    },
    {
      termino: "Pendiente de la recta",
      definicion: "m = (y₂−y₁)/(x₂−x₁). Mide la inclinación de la recta. Rectas horizontales tienen m = 0; rectas verticales tienen pendiente indefinida. Ejemplo: Entre (2, 1) y (6, 9): m = (9−1)/(6−2) = 8/4 = 2.",
    },
    {
      termino: "Forma pendiente-intercepto",
      definicion: "y = mx + b, donde m es la pendiente y b es el intercepto en y. Es la forma más usada para graficar una recta. Ejemplo: y = −3x + 5: pendiente −3 (decrece) e intercepto 5 (pasa por (0, 5)).",
    },
    {
      termino: "Forma punto-pendiente",
      definicion: "y − y₁ = m(x − x₁), donde (x₁, y₁) es un punto conocido y m es la pendiente. Útil cuando se conoce un punto y la pendiente. Ejemplo: Recta con m = 3 que pasa por (2, −1): y − (−1) = 3(x − 2) → y = 3x − 7.",
    },
    {
      termino: "Rectas paralelas y perpendiculares",
      definicion: "Paralelas: misma pendiente (m₁ = m₂) pero diferente intercepto. Perpendiculares: pendientes son recíprocas negativas (m₁ · m₂ = −1). Ejemplo: y = 2x + 3 y y = 2x − 5 son paralelas. y = 2x + 1 y y = −(1/2)x + 4 son perpendiculares.",
    },
  ],

  aplicaciones: [
    "El GPS usa la fórmula de distancia (en su versión 3D) para calcular la posición del dispositivo a partir de las distancias a varios satélites.",
    "El diseño de la Línea 12 del Metro de la Ciudad de México requirió coordenadas precisas y fórmulas de distancia para garantizar trayectorias seguras y eficientes.",
    "La computación gráfica (videojuegos, animación, diseño arquitectónico) usa el plano cartesiano y la pendiente para dibujar líneas y superficies.",
    "En telecomunicaciones, la ubicación de repetidoras de señal y amplificadores se optimiza con distancia y punto medio entre puntos del mapa.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1 y Glosario A5, PM-IV-P06.",
};

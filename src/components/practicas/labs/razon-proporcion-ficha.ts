/**
 * Datos de la Ficha Teórica del laboratorio de Razón y proporción (PM-I-P05).
 *
 * Contenido VERBATIM de la actividad ancla A1 «Razones, proporciones y
 * proporcionalidad» (lectura). La progresión P05 no tiene actividad de
 * glosario; los conceptos centrales se formulan a partir de la lectura A1
 * (sin inventar datos), y el reto evaluable vive en razon-proporcion-data.ts (A2).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const RAZON_PROPORCION_FICHA: FichaTeoricaData = {
  ancla: "PM-I · P05 · A1 — Razones, proporciones y proporcionalidad",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "Una razón es una comparación entre dos cantidades. Si en un grupo hay 3 mujeres por cada 2 hombres, la razón es 3:2 o 3/2. Una proporción es una igualdad entre dos razones: 3/2 = 6/4, lo que significa que si duplicamos ambos grupos, la relación se mantiene.",
    "La proporcionalidad directa ocurre cuando al aumentar una cantidad, la otra también aumenta en la misma proporción. Si un trabajador produce 5 piezas por hora, en 3 horas producirá 15 piezas: la relación es constante (5 piezas/hora). La fórmula es y = kx, donde k es la constante de proporcionalidad.",
    "La proporcionalidad inversa ocurre cuando al aumentar una cantidad, la otra disminuye en la misma proporción. Si 4 trabajadores terminan una tarea en 6 días, 8 trabajadores la terminarán en 3 días: más trabajadores, menos tiempo. La fórmula es y = k/x.",
    "Reconocer cuándo una situación es de proporcionalidad directa o inversa es crucial para resolver problemas correctamente. Un error frecuente es asumir que toda relación entre dos cantidades es directamente proporcional cuando en realidad puede ser inversa.",
  ],

  objetivos: [
    "Distinguir una razón de una proporción y expresarlas correctamente.",
    "Identificar si una situación es de proporcionalidad directa o inversa.",
    "Calcular la constante de proporcionalidad k de un escenario real.",
    "Resolver problemas de proporcionalidad inversa usando la fórmula y = k/x.",
    "Resolver el reto de proporcionalidad directa e inversa en contexto (A2).",
  ],

  materiales: [
    { nombre: "Gráfica 3D directa", detalle: "Recta que pasa por el origen: si X sube, Y sube", icono: "fa-chart-line" },
    { nombre: "Gráfica 3D inversa", detalle: "Hipérbola: si X sube, Y baja; el producto permanece constante", icono: "fa-chart-area" },
    { nombre: "Deslizador de X", detalle: "Mueve la cantidad conocida y observa cómo responde Y", icono: "fa-sliders" },
    { nombre: "Lector del invariante", detalle: "Muestra la razón (directa) o el producto (inversa) que no cambia", icono: "fa-equals" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Razón", definicion: "Comparación entre dos cantidades por medio de un cociente: a:b = a/b." },
    { termino: "Proporción", definicion: "Igualdad entre dos razones: a/b = c/d. Si duplicamos ambos grupos, la relación se mantiene." },
    { termino: "Proporcionalidad directa", definicion: "Al aumentar una cantidad, la otra también aumenta en la misma proporción. Fórmula: y = kx." },
    { termino: "Proporcionalidad inversa", definicion: "Al aumentar una cantidad, la otra disminuye en la misma proporción. Fórmula: y = k/x." },
    { termino: "Constante de proporcionalidad (k)", definicion: "El valor que permanece fijo: la razón Y/X en la directa, o el producto X·Y en la inversa." },
    { termino: "Regla de tres", definicion: "Método para encontrar un cuarto valor desconocido a partir de una proporción conocida." },
  ],

  // La progresión P05 no tiene actividad de glosario; los términos clave
  // viven en "conceptos" (formulados desde la lectura A1).
  glosario: [],

  aplicaciones: [
    "Calcular tiempos de trabajo al cambiar el número de obreros o máquinas (proporcionalidad inversa).",
    "Ajustar recetas de cocina al cambiar el número de porciones (proporcionalidad directa).",
    "Determinar tiempos de viaje al cambiar la velocidad en una distancia fija (proporcionalidad inversa).",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1, PM-I-P05.",
};

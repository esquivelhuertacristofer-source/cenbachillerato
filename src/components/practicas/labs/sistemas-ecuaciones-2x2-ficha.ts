/**
 * Datos de la Ficha Teórica del laboratorio de Sistemas de ecuaciones 2x2
 * (PM-III-P08).
 *
 * Marco teórico VERBATIM de A1 «Sistemas de ecuaciones: cuando dos son
 * necesarias» (lectura). Glosario VERBATIM de A5 «Glosario: sistemas de
 * ecuaciones» (glosario_interactivo). El reto evaluable vive en
 * sistemas-ecuaciones-2x2-data.ts (A2).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const SISTEMAS_FICHA: FichaTeoricaData = {
  ancla: "PM-III · P08 · A1 — Sistemas de ecuaciones: cuando dos son necesarias",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "Un sistema de ecuaciones lineales es un conjunto de dos o más ecuaciones que comparten las mismas incógnitas. La solución de un sistema es el par (o conjunto) de valores que satisface simultáneamente todas las ecuaciones.",
    "Geométricamente, cada ecuación lineal en dos variables representa una recta. La solución del sistema es el punto donde esas rectas se intersectan. Si las rectas son paralelas, el sistema no tiene solución (es inconsistente). Si las rectas son la misma (coincidentes), el sistema tiene infinitas soluciones.",
    "Los métodos algebraicos para resolver un sistema 2×2 son: (1) sustitución (despejar una variable en una ecuación y sustituir en la otra), (2) igualación (despejar la misma variable en ambas ecuaciones e igualarlas), y (3) eliminación o Gauss (sumar o restar las ecuaciones para eliminar una variable). Cada método tiene ventajas según la estructura del sistema.",
  ],

  objetivos: [
    "Identificar la solución de un sistema como el par (x, y) que satisface simultáneamente ambas ecuaciones.",
    "Aplicar el método de sustitución para resolver sistemas lineales 2×2.",
    "Aplicar el método de eliminación (Gauss) para resolver sistemas lineales 2×2.",
    "Resolver problemas contextualizados planteando un sistema de dos ecuaciones.",
    "Resolver el ejercicio evaluable de sistemas de ecuaciones (A2).",
  ],

  materiales: [
    { nombre: "Plano cartesiano 3D", detalle: "Cada ecuación lineal es una recta; la solución es su cruce", icono: "fa-diagram-project" },
    { nombre: "Deslizador de pendiente", detalle: "Inclina la segunda recta para descubrir los tres casos", icono: "fa-sliders" },
    { nombre: "Tres casos visuales", detalle: "Rectas que se cruzan, paralelas y coincidentes", icono: "fa-circle-dot" },
    { nombre: "Escenarios reales", detalle: "Situaciones cotidianas modeladas con sistemas", icono: "fa-store" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Sistema de ecuaciones lineal 2×2", definicion: "Conjunto de dos ecuaciones lineales con dos incógnitas cuya solución es el par (x, y) que satisface ambas a la vez." },
    { termino: "Solución única", definicion: "Se da cuando las rectas tienen pendientes distintas y se cruzan en exactamente un punto." },
    { termino: "Sin solución (inconsistente)", definicion: "Las rectas son paralelas (misma pendiente, diferente ordenada): nunca se tocan." },
    { termino: "Infinitas soluciones", definicion: "Las rectas son coincidentes (una es múltiplo de la otra): cualquier punto de la recta es solución." },
    { termino: "Método de sustitución", definicion: "Despejar una variable en una ecuación y sustituirla en la otra para obtener una ecuación con una sola incógnita." },
    { termino: "Método de eliminación (Gauss)", definicion: "Sumar o restar las ecuaciones del sistema para eliminar una variable y resolver la restante." },
  ],

  // Glosario VERBATIM de A5 «Glosario: sistemas de ecuaciones»
  // (glosario_interactivo, PM-III-P08-A5).
  glosario: [
    { termino: "Sistema de ecuaciones", definicion: "Conjunto de dos o más ecuaciones que comparten las mismas incógnitas. Ejemplo: x + y = 5 y x − y = 1." },
    { termino: "Método de sustitución", definicion: "Despejar una incógnita en una ecuación y sustituirla en la otra. Ejemplo: despejar x y reemplazarla en la segunda ecuación." },
    { termino: "Método de igualación", definicion: "Despejar la misma incógnita en ambas ecuaciones e igualar los resultados. Ejemplo: igualar las dos expresiones de x." },
    { termino: "Método de eliminación", definicion: "Sumar o restar las ecuaciones para eliminar una incógnita. Ejemplo: sumar para cancelar la y." },
    { termino: "Solución del sistema", definicion: "Par de valores que satisface todas las ecuaciones a la vez. Ejemplo: (x, y) = (3, 2)." },
  ],

  aplicaciones: [
    "Modelar situaciones donde dos condiciones deben cumplirse al mismo tiempo: mezclas, precios, velocidades.",
    "Resolver problemas de monedas, billetes o artículos de dos tipos conociendo el total y el valor total.",
    "El INEGI publica datos estadísticos abiertos en datos.gob.mx que permiten aplicar el Pensamiento Matemático a fenómenos reales: distribución del ingreso, crecimiento demográfico, mortalidad por enfermedades y tendencias educativas.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1 y Glosario A5, PM-III-P08.",
};

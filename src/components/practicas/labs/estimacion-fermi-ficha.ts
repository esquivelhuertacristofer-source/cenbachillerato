/**
 * Datos de la Ficha Teórica del laboratorio "Estimación y órdenes de magnitud"
 * (PM-I, progresión 10; actividades PM-I-P07).
 *
 * Contenido VERBATIM de la actividad ancla:
 *   - Marco teórico: lectura A1 «Estimar: el arte de calcular sin exactitud»
 *     (4 párrafos).
 * La progresión no tiene glosario interactivo: el glosario son definiciones
 * propias del laboratorio.
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, LECTURA_A1, FUENTE } from "./estimacion-fermi-data";

export const ESTIMACION_FERMI_FICHA: FichaTeoricaData = {
  ancla: "PM-I · P07 · A1 — Estimar: el arte de calcular sin exactitud",

  marcoTeorico: LECTURA_A1,

  objetivos: [
    "Estimar cantidades muy grandes descomponiéndolas en factores que se pueden estimar (problemas de Fermi).",
    "Expresar la incertidumbre de una estimación con un rango y medir el error en órdenes de magnitud.",
    "Redondear a una unidad dada (decena, unidad, décima, cifras significativas) y distinguirlo del truncamiento.",
    "Estimar productos con números redondos y reconocer cuándo los errores se compensan.",
    "Verificar la razonabilidad de un resultado comparándolo con una estimación mental.",
    "Diagnosticar los errores típicos: punto decimal corrido, unidades confundidas y operación equivocada.",
  ],

  materiales: [
    { nombre: "Salón y un litro ampliado", detalle: "Metros cúbicos que se llenan y canicas de 16 mm empacadas al 64 %.", icono: "fa-cube" },
    { nombre: "Costal de 50 kg y báscula de cocina", detalle: "100 granos de maíz y un grano ampliado junto a una regla.", icono: "fa-wheat-awn" },
    { nombre: "Cubo de agua y Torre Latinoamericana", detalle: "El agua de un día de la CDMX junto a un edificio de 182 m.", icono: "fa-droplet" },
    { nombre: "Regla logarítmica", detalle: "Cada tramo es una potencia de 10: estimación, rango y dato real.", icono: "fa-ruler-horizontal" },
    { nombre: "Pista de valles y canica", detalle: "Redondear rueda al múltiplo más cercano; truncar baja hacia el cero.", icono: "fa-circle-dot" },
    { nombre: "Medidor de razonabilidad", detalle: "Cuántas veces difiere un resultado de tu estimación, de ÷1000 a ×1000.", icono: "fa-gauge" },
  ],

  conceptos: [
    { termino: "Descomponer en factores", definicion: "Una cantidad desconocida se escribe como producto de cantidades que sí se pueden estimar: habitantes × litros por persona × pérdidas." },
    { termino: "Error en órdenes de magnitud", definicion: "log₁₀(estimación ÷ valor real). Menos de 1 significa que la estimación está a menos de un factor de 10: el mismo orden de magnitud." },
    { termino: "Rango de incertidumbre", definicion: "Los valores más bajo y más alto que podría tener la estimación si cada factor varía dentro de lo que dudas de él." },
    { termino: "Regla del 5", definicion: "Al redondear, si la cifra siguiente es 5 o más se sube; si es menor que 5 se deja igual. 6.8 → 7; 2.5 → 3." },
    { termino: "Compensación de errores", definicion: "Si un factor se redondea hacia arriba y el otro hacia abajo, los errores se cancelan en parte: 49 × 51 ≈ 50 × 50." },
    { termino: "Tres errores típicos", definicion: "Un resultado 10, 100 o 1000 veces mayor delata un punto decimal corrido; una unidad equivocada cambia el tamaño sin cambiar el número; una operación invertida da algo absurdo." },
  ],

  glosario: GLOSARIO,

  aplicaciones: [
    "Revisar el ticket del súper: 347 productos a unos $30 no pueden sumar más de $100,000.",
    "Planear un viaje escolar: cuántos autobuses, cuánta gasolina y cuánto dinero por persona.",
    "Comprobar una dosis de medicamento antes de darla: un error de coma multiplica la dosis por 10.",
    "Estimar el consumo de agua de una ciudad para planear pipas, tanques o campañas de ahorro (datos abiertos de SACMEX e INEGI).",
  ],

  fuente: FUENTE,
};

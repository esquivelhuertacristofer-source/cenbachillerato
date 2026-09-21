/**
 * Datos de la Ficha Teórica del laboratorio "Estadística: variables,
 * población y muestra" (PM-VI-P01, progresión 1 de Pensamiento Matemático VI).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: lectura A1 «Estadística: la ciencia de los datos al
 *     servicio de la toma de decisiones» (6 párrafos).
 *   - Glosario: glosario interactivo A5 (6 términos, reutilizados del archivo
 *     de datos).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, LECTURA_A1, FUENTE } from "./variables-estadistica-data";

export const VARIABLES_ESTADISTICA_FICHA: FichaTeoricaData = {
  ancla: "PM-VI · P01 · A1 — Estadística: la ciencia de los datos al servicio de la toma de decisiones",

  marcoTeorico: LECTURA_A1,

  objetivos: [
    "Clasificar variables en cualitativas nominales u ordinales y cuantitativas discretas o continuas.",
    "Distinguir población y muestra, y parámetro y estadístico.",
    "Explicar por qué el estadístico cambia de una muestra a otra y cómo influye el tamaño de la muestra.",
    "Construir una tabla de frecuencias absolutas y relativas.",
    "Distinguir la estadística descriptiva de la inferencial en situaciones concretas.",
    "Aprobar el quiz evaluable A2.",
  ],

  materiales: [
    { nombre: "Máquina clasificadora", detalle: "Tubos que se bifurcan en dos preguntas y cuatro contenedores, uno por tipo de variable.", icono: "fa-shapes" },
    { nombre: "18 tarjetas de variables", detalle: "Tomadas de la lectura A1, el quiz A2 y el glosario A5.", icono: "fa-id-card" },
    { nombre: "Una escuela de 1 500 estudiantes", detalle: "Cada uno con su número de hermanos, como en el ejemplo del quiz A4.", icono: "fa-people-group" },
    { nombre: "Censo y encuestas", detalle: "El censo recorre a todos; la encuesta elige al azar de 20 a 500.", icono: "fa-clipboard-list" },
    { nombre: "Barras de frecuencia", detalle: "La frecuencia relativa de la muestra con su intervalo al 95 % y el valor real de la escuela.", icono: "fa-chart-simple" },
  ],

  conceptos: [
    {
      termino: "Cualitativa o cuantitativa",
      definicion: "La primera pregunta: si la variable describe categorías o atributos es cualitativa; si expresa cantidades numéricas, cuantitativa.",
    },
    {
      termino: "Nominal u ordinal",
      definicion: "Las cualitativas nominales no tienen orden natural; las ordinales sí. Una escala del 1 al 5 es ordinal: sus números solo marcan lugares.",
    },
    {
      termino: "Discreta o continua",
      definicion: "Las cuantitativas discretas se cuentan en enteros; las continuas se miden y pueden tomar cualquier valor real dentro de un intervalo.",
    },
    {
      termino: "Parámetro y estadístico",
      definicion: "El parámetro (μ, p) describe a la población y es fijo. El estadístico (x̄, p̂) se calcula con la muestra y cambia de una muestra a otra.",
    },
    {
      termino: "Frecuencia absoluta y relativa",
      definicion: "La absoluta cuenta cuántas veces aparece un valor; la relativa la divide entre el total: fᵣ = f ÷ n. Las relativas suman 1 (100 %).",
    },
    {
      termino: "Intervalo al 95 %",
      definicion: "p̂ ± 1.96·√(p̂(1 − p̂)/n) estima la proporción de la población. Pasar de la muestra a la población es estadística inferencial.",
    },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: g.definicion })),

  aplicaciones: [
    "El INEGI mide a toda la población con el Censo de Población y Vivienda cada diez años.",
    "La ENIGH usa muestras de miles de hogares para estimar las condiciones de vida de millones.",
    "El CONEVAL mide la pobreza multidimensional con datos del INEGI.",
    "Un hospital decide qué tratamiento adoptar con base en ensayos clínicos; una tienda identifica sus productos más vendidos con sus propios datos.",
  ],

  fuente: FUENTE,
};

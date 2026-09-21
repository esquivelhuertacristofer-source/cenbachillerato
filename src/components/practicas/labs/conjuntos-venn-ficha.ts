/**
 * Datos de la Ficha Teórica del laboratorio "Conjuntos y diagramas de Venn"
 * (PM-VI-P10, progresión 3 de Pensamiento Matemático VI).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: lectura A1 «Conjuntos: el lenguaje para organizar y
 *     razonar con colecciones» (5 párrafos verbatim).
 *   - Glosario: glosario interactivo A5 «Glosario: conjuntos, operaciones y
 *     Venn» (10 términos verbatim, reutilizados del archivo de datos).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, LECTURA_A1, FUENTE } from "./conjuntos-venn-data";

export const CONJUNTOS_VENN_FICHA: FichaTeoricaData = {
  ancla: "PM-VI · P10 · A1 — Conjuntos: el lenguaje para organizar y razonar con colecciones",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: LECTURA_A1,

  objetivos: [
    "Describir un conjunto por extensión y reconocer la pertenencia (∈, ∉) de sus elementos.",
    "Identificar el conjunto universal, el vacío y los subconjuntos en un problema.",
    "Calcular la unión, la intersección, el complemento y la diferencia de dos conjuntos.",
    "Representar conjuntos y operaciones en un diagrama de Venn, reconociendo sus cuatro zonas.",
    "Comprobar las dos leyes de De Morgan construyendo por separado cada lado de la igualdad.",
    "Resolver un problema de encuesta llenando el diagrama desde la intersección.",
    "Resolver el reto evaluable del ejercicio A2.",
  ],

  materiales: [
    { nombre: "Tablero de Venn", detalle: "Rectángulo del universal U con dos óvalos, A y B, que se traslapan.", icono: "fa-circle-nodes" },
    { nombre: "Fichas numeradas", detalle: "Cada ficha es un elemento de U; se mueven de zona con un toque.", icono: "fa-hashtag" },
    { nombre: "Selector de operaciones", detalle: "∪, ∩, Aᶜ, Bᶜ, A − B y B − A, con la zona del resultado iluminada.", icono: "fa-sliders" },
    { nombre: "Dos tableros gemelos", detalle: "Uno para cada lado de las leyes de De Morgan, avanzando paso a paso.", icono: "fa-code-compare" },
    { nombre: "Grupo de hasta 40 estudiantes", detalle: "Para acomodar los datos de una encuesta en el diagrama.", icono: "fa-people-group" },
  ],

  conceptos: [
    {
      termino: "Las cuatro zonas de un Venn",
      definicion: "Con dos conjuntos, todo elemento de U cae en exactamente una zona: solo A, A y B, solo B, o fuera de ambos. Cualquier operación es una elección de zonas.",
    },
    {
      termino: "«o» frente a «y»",
      definicion: "La unión pide estar en al menos uno de los conjuntos («o»); la intersección pide estar en los dos a la vez («y»).",
    },
    {
      termino: "Complemento relativo al universal",
      definicion: "Aᶜ son los elementos de U que no están en A. Si cambia el universal, cambia el complemento.",
    },
    {
      termino: "Principio de inclusión-exclusión",
      definicion: "|A ∪ B| = |A| + |B| − |A ∩ B|. Al sumar los dos conjuntos, la intersección se contó dos veces y se resta una.",
    },
    {
      termino: "Conjuntos disjuntos",
      definicion: "No comparten elementos: A ∩ B = ∅, y entonces |A ∪ B| = |A| + |B|.",
    },
    {
      termino: "Leyes de De Morgan",
      definicion: "Negar una unión da la intersección de las negaciones, y negar una intersección da la unión de las negaciones.",
    },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: g.definicion })),

  aplicaciones: [
    "Las encuestas escolares y los censos se resumen en diagramas de Venn para saber cuántas personas cumplen una, otra, ambas o ninguna característica.",
    "Los buscadores y las bases de datos filtran con «y», «o» y «no»: las leyes de De Morgan permiten reescribir esas consultas sin cambiar el resultado.",
    "En probabilidad, los eventos son conjuntos: P(A ∪ B) = P(A) + P(B) − P(A ∩ B) es la inclusión-exclusión aplicada a probabilidades.",
    "Los circuitos lógicos de una computadora implementan unión, intersección y complemento como compuertas OR, AND y NOT.",
  ],

  fuente: FUENTE,
};

/**
 * Datos de la Ficha Teórica del laboratorio "Bayes: actualizar creencias con
 * nueva información" (PM-VI-P06, progresión 11 de Pensamiento Matemático VI).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: lectura A1 «Probabilidad condicional y el teorema de
 *     Bayes: actualizar creencias con nueva información» (6 párrafos).
 *   - Glosario: glosario interactivo A5 «Eventos compuestos, condicionales e
 *     independientes» (6 términos, reutilizados del archivo de datos).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, LECTURA_A1, FUENTE } from "./bayes-condicional-data";

export const BAYES_CONDICIONAL_FICHA: FichaTeoricaData = {
  ancla: "PM-VI · P06 · A1 — Probabilidad condicional y el teorema de Bayes: actualizar creencias con nueva información",

  marcoTeorico: LECTURA_A1,

  objetivos: [
    "Interpretar P(A|B) como una probabilidad calculada dentro del espacio muestral reducido a B.",
    "Distinguir P(A|B) de P(B|A) y explicar por qué casi nunca valen lo mismo.",
    "Reconocer eventos independientes comparando P(A|B) con P(A|Bᶜ).",
    "Calcular probabilidades conjuntas con la regla del producto y probabilidades totales sumando caminos de un árbol.",
    "Aplicar el teorema de Bayes para invertir una probabilidad condicional.",
    "Calcular e interpretar el Valor Predictivo Positivo a partir de la prevalencia, la sensibilidad y la especificidad.",
    "Resolver el reto evaluable del ejercicio A2.",
  ],

  materiales: [
    { nombre: "Población de 100 personas", detalle: "Los ejemplos de la lectura A1 y del glosario A5, agrupados por la condición.", icono: "fa-people-group" },
    { nombre: "Tabla de doble entrada", detalle: "Los cuatro cruces de A y B, resaltados según la condición elegida.", icono: "fa-table-cells" },
    { nombre: "Árbol de dos etapas", detalle: "Ramas con grosor proporcional a su probabilidad y partículas que las recorren.", icono: "fa-code-branch" },
    { nombre: "Simulador de repeticiones", detalle: "Repite el experimento miles de veces y compara frecuencias con la teoría.", icono: "fa-shuffle" },
    { nombre: "Población de 1 000 o 10 000 personas", detalle: "Cada persona recibe una prueba diagnóstica con la sensibilidad y especificidad elegidas.", icono: "fa-vial-virus" },
  ],

  conceptos: [
    {
      termino: "Espacio muestral reducido",
      definicion: "Saber que ocurrió B descarta todos los resultados fuera de B. P(A|B) cuenta los casos de A dentro de B y divide entre el tamaño de B.",
    },
    {
      termino: "P(A|B) frente a P(B|A)",
      definicion: "Las dos tienen el mismo numerador, P(A∩B), pero la primera divide entre P(B) y la segunda entre P(A). Solo coinciden si P(A) = P(B).",
    },
    {
      termino: "Probabilidad total",
      definicion: "Si B y Bᶜ cubren todos los casos, P(A) = P(B)·P(A|B) + P(Bᶜ)·P(A|Bᶜ): se suman los caminos del árbol que terminan en A.",
    },
    {
      termino: "Teorema de Bayes",
      definicion: "P(B|A) = P(A|B)·P(B) / P(A). Invierte la condición: de lo que la prueba hace con los enfermos a lo que un positivo dice de quien lo recibe.",
    },
    {
      termino: "Sensibilidad y especificidad",
      definicion: "Sensibilidad = P(positivo | enfermo); especificidad = P(negativo | sano). Describen la prueba, no a la población.",
    },
    {
      termino: "Valor Predictivo Positivo",
      definicion: "VPP = P(enfermo | positivo). Depende de la prevalencia: cuando la enfermedad es rara, los falsos positivos de un grupo sano muy grande pesan más que los verdaderos positivos.",
    },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: g.definicion })),

  aplicaciones: [
    "Los programas de detección temprana del IMSS y el ISSSTE interpretan un resultado positivo con la prevalencia de la población estudiada y lo confirman con una segunda prueba.",
    "Los filtros de correo no deseado actualizan la probabilidad de que un mensaje sea spam con cada palabra que encuentran, aplicando Bayes una y otra vez.",
    "En control de calidad, la probabilidad de que una pieza provenga de una máquina defectuosa, dado que falló, se calcula invirtiendo un árbol de probabilidades.",
    "Los peritajes forenses evalúan cuánto cambia la probabilidad de una hipótesis con una evidencia nueva, sin confundir P(evidencia | inocente) con P(inocente | evidencia).",
  ],

  fuente: FUENTE,
};

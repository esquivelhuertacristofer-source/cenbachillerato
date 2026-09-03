/**
 * Ficha teórica — constructor-algoritmos
 *
 * Contenido VERBATIM de la progresión CD-I-P11 (Cultura Digital I).
 * El marco teórico sale de CD-I-P11-A1 (lectura); el glosario y los
 * conceptos, de las actividades de glosario de la misma progresión. Generado
 * por scripts/generar-fichas-labs.ts: si el contenido de la base cambia, se
 * regenera; no editar a mano sin avisar al script.
 */
import type { FichaTeoricaData } from "./_ficha";

export const CONSTRUCTOR_ALGORITMOS_FICHA: FichaTeoricaData = {
  ancla: "CD-I-P11-A1 · Lenguaje algorítmico: datos, variables y operadores",
  marcoTeorico: [
    "Para que una computadora resuelva un problema necesitamos expresarlo en un lenguaje algorítmico, un conjunto ordenado de elementos que describen la solución paso a paso. La materia prima son los datos (valores como un número o un texto) que, al organizarse y darles sentido, se convierten en información.",
    "Los datos se guardan en variables, espacios con un nombre cuyo contenido puede cambiar durante el proceso (por ejemplo, edad = 15), y en constantes, cuyo valor se mantiene fijo (por ejemplo, PI = 3.1416). Con ellos formamos expresiones, combinaciones de valores y operadores que producen un resultado. Existen tres tipos de operadores: los aritméticos (+, −, ×, ÷) para hacer cálculos; los relacionales (>, <, =, ≠) para comparar valores; y los lógicos (Y, O, NO) para combinar condiciones.",
    "Los algoritmos se construyen con tres estructuras de control: las secuenciales (instrucciones que se ejecutan una tras otra), las condicionales o selectivas (toman un camino según se cumpla o no una condición, como 'si… entonces…') y las repetitivas o cíclicas (repiten acciones mientras se cumpla una condición). Combinando datos, variables, operadores y estructuras se puede describir la solución de casi cualquier problema antes de programarlo.",
  ],
  objetivos: [
    "Completa el modo «Construye el algoritmo».",
    "Completa el modo «Clasifica operadores».",
    "Completa el modo «Estructuras de control».",
    "Aprueba el cuestionario de comprensión de la ficha.",
  ],
  materiales: [],
  conceptos: [],
  glosario: [
    { termino: "Dato", definicion: "Valor sin procesar, como un número o un texto." },
    { termino: "Variable", definicion: "Espacio con nombre cuyo valor puede cambiar durante el proceso." },
    { termino: "Constante", definicion: "Valor con nombre que se mantiene fijo." },
    { termino: "Operador", definicion: "Símbolo que opera sobre valores: aritmético, relacional o lógico." },
    { termino: "Estructura de control", definicion: "Forma de organizar las instrucciones: secuencial, condicional o repetitiva." },
  ],
};

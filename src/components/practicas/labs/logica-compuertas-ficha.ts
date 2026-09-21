/**
 * Datos de la Ficha Teórica del laboratorio "Lógica matemática y compuertas"
 * (PM-I, progresión 1 de Pensamiento Matemático I; códigos PM-I-P03).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: lectura A1 «Proposiciones, conectivos y lógica cotidiana»
 *     (4 párrafos).
 *   - Glosario: definiciones verbatim de A5, A1, A2 y A9 (la progresión no
 *     tiene glosario interactivo).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, LECTURA_A1, FUENTE } from "./logica-compuertas-data";

export const LOGICA_COMPUERTAS_FICHA: FichaTeoricaData = {
  ancla: "PM-I · P03 · A1 — Proposiciones, conectivos y lógica cotidiana",

  marcoTeorico: LECTURA_A1,

  objetivos: [
    "Distinguir una proposición (simple o compuesta) de un enunciado que no tiene valor de verdad.",
    "Predecir el valor de verdad de la negación, la conjunción, la disyunción, la implicación y la bicondicional en cada combinación de valores.",
    "Construir la tabla de verdad de una proposición compuesta columna por columna.",
    "Clasificar una proposición compuesta como tautología, contradicción o contingencia.",
    "Reconocer que la contrapositiva equivale al condicional original y que la recíproca y la inversa no.",
    "Distinguir razonamientos válidos (modus ponens, modus tollens) de falacias (afirmar el consecuente, negar el antecedente) buscando un contraejemplo.",
  ],

  materiales: [
    { nombre: "Interruptores p y q", detalle: "Cada uno lleva corriente (V) o no (F).", icono: "fa-toggle-on" },
    { nombre: "Compuertas lógicas", detalle: "NOT, AND, OR, XNOR y la del condicional (¬p ∨ q).", icono: "fa-microchip" },
    { nombre: "Foco de salida", detalle: "Se enciende solo si la proposición compuesta es verdadera.", icono: "fa-lightbulb" },
    { nombre: "Tablero de circuito", detalle: "Arma el árbol de compuertas de una expresión y la evalúa fila por fila.", icono: "fa-table-cells" },
    { nombre: "Cuatro mundos posibles", detalle: "VV, VF, FV y FF: cada combinación de valores como un escenario.", icono: "fa-earth-americas" },
  ],

  conceptos: [
    {
      termino: "Tabla de verdad",
      definicion: "Con n proposiciones simples hay 2ⁿ combinaciones: 2 filas con una, 4 con dos (VV, VF, FV, FF). Se calcula primero cada parte y al final la proposición completa.",
    },
    {
      termino: "El condicional como compuerta",
      definicion: "p → q solo es falsa en la fila VF, igual que ¬p ∨ q. Por eso en el circuito se arma con una OR cuya entrada p pasa por un inversor.",
    },
    {
      termino: "Formas del condicional",
      definicion: "Recíproca q → p, inversa ¬p → ¬q y contrapositiva ¬q → ¬p. Solo la contrapositiva tiene la misma tabla que p → q; la recíproca y la inversa son equivalentes entre sí.",
    },
    {
      termino: "Leyes de De Morgan",
      definicion: "¬(p ∧ q) ≡ ¬p ∨ ¬q y ¬(p ∨ q) ≡ ¬p ∧ ¬q. Negar una conjunción da una disyunción de negaciones, y al revés.",
    },
    {
      termino: "Razonamiento válido",
      definicion: "Es válido si no existe ningún caso con premisas verdaderas y conclusión falsa. Modus ponens (p → q; p; ∴ q) y modus tollens (p → q; ¬q; ∴ ¬p) son válidos.",
    },
    {
      termino: "Falacias formales",
      definicion: "Afirmar el consecuente (p → q; q; ∴ p) y negar el antecedente (p → q; ¬p; ∴ ¬q) parecen válidos, pero el caso FV es un contraejemplo.",
    },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: g.definicion })),

  aplicaciones: [
    "Toda computadora está hecha de compuertas lógicas: Claude Shannon mostró en 1937 (tesis de maestría en el MIT) que el álgebra de George Boole (1854) describe los circuitos de interruptores.",
    "Los buscadores y bases de datos usan Y, O y NO para filtrar resultados.",
    "Detectar en publicidad o redes sociales la falacia de afirmar el consecuente: «si es bueno, lo usan los famosos; lo usan los famosos, entonces es bueno».",
    "Tomar decisiones con condiciones múltiples, como «si tengo dinero Y hay descuento, entonces compro».",
  ],

  fuente: FUENTE,
};

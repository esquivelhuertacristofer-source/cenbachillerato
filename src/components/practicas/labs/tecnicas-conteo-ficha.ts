/**
 * Datos de la Ficha Teórica del laboratorio "Técnicas de conteo: contar para
 * decidir" (PM-VI-P11, progresión 4 de Pensamiento Matemático VI).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: lectura A1 «Contar para decidir: permutaciones,
 *     combinaciones y probabilidad» (6 párrafos verbatim).
 *   - Glosario: glosario interactivo A5 «Glosario: técnicas de conteo y
 *     probabilidad» (9 términos verbatim, reutilizados del archivo de datos).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, LECTURA_A1, FUENTE } from "./tecnicas-conteo-data";

export const TECNICAS_CONTEO_FICHA: FichaTeoricaData = {
  ancla: "PM-VI · P11 · A1 — Contar para decidir: permutaciones, combinaciones y probabilidad",

  marcoTeorico: LECTURA_A1,

  objetivos: [
    "Aplicar el principio multiplicativo a decisiones que se toman en etapas.",
    "Decidir si una situación es una permutación o una combinación preguntando si importa el orden.",
    "Calcular P(n,r) = n!/(n−r)! y C(n,r) = n!/[r!(n−r)!] y explicar por qué C(n,r) = P(n,r)/r!.",
    "Calcular una probabilidad clásica contando casos favorables y posibles.",
    "Distinguir extracciones con y sin reemplazo, y eventos independientes de dependientes.",
    "Interpretar la probabilidad condicionada P(B|A) en un árbol de dos extracciones.",
    "Resolver el reto evaluable del ejercicio A2.",
  ],

  materiales: [
    { nombre: "Árbol de decisiones", detalle: "Hasta tres etapas y cuatro opciones por etapa; cada hoja es un resultado.", icono: "fa-sitemap" },
    { nombre: "Cinco estudiantes", detalle: "Ana, Beto, Carla, Diego y Eva, el grupo del ejercicio A2.", icono: "fa-people-group" },
    { nombre: "Podio y mesa de comité", detalle: "El podio distingue lugares; en la mesa, los asientos son equivalentes.", icono: "fa-ranking-star" },
    { nombre: "Urna transparente", detalle: "Un dado, una baraja con sus 4 reyes o una urna con bolas doradas.", icono: "fa-flask-vial" },
    { nombre: "Simulador de extracciones", detalle: "Repite miles de pares de extracciones y compara con la teoría.", icono: "fa-shuffle" },
  ],

  conceptos: [
    {
      termino: "¿Importa el orden?",
      definicion: "Es la pregunta que decide la técnica: si reordenar produce un resultado distinto (lugares, cargos, claves) es permutación; si no (equipos, manos, comités) es combinación.",
    },
    {
      termino: "P(n,r) como producto de etapas",
      definicion: "El primer lugar tiene n opciones, el segundo n−1 y así hasta r lugares. Es el principio multiplicativo aplicado a quienes van quedando.",
    },
    {
      termino: "C(n,r) = P(n,r) / r!",
      definicion: "Cada selección de r objetos se puede ordenar de r! formas; al dividir entre r! se quita el orden que la permutación contaba de más.",
    },
    {
      termino: "Regla del producto",
      definicion: "Para eventos independientes, P(A y B) = P(A) × P(B). Dos tiros de dado cumplen la condición.",
    },
    {
      termino: "Dependencia sin reemplazo",
      definicion: "Si el primer objeto no se devuelve, el total baja a N−1 y la segunda probabilidad cambia según lo que salió primero.",
    },
    {
      termino: "Árbol de probabilidades",
      definicion: "Cada rama lleva la probabilidad de su paso, condicionada a lo que pasó antes; la probabilidad de un camino completo es el producto de sus ramas.",
    },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: g.definicion })),

  aplicaciones: [
    "Los sorteos y las loterías se evalúan contando combinaciones: acertar 6 de 49 números tiene probabilidad 1 / C(49,6).",
    "La seguridad de una contraseña se mide contando cuántos arreglos posibles tiene que probar quien la quiera adivinar.",
    "En control de calidad, la probabilidad de encontrar piezas defectuosas al revisar sin reemplazo usa el conteo de combinaciones.",
    "Los torneos deportivos cuentan cuántos partidos hacen falta para que todos jueguen contra todos: C(n,2).",
  ],

  fuente: FUENTE,
};

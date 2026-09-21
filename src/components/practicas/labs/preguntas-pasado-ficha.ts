/**
 * Datos de la Ficha Teórica del laboratorio "Preguntas al pasado" (CH-I-P01,
 * progresión 1 de Conciencia Histórica I; integra CH-I-P04).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: lectura CH-I-P01-A1 «¿Dónde y cuándo ocurrió?
 *     Coordenadas espacio-temporales en la historia» (5 párrafos).
 *   - Glosario: CH-I-P01-A5 y términos de CH-I-P04 (A1 y A5).
 * Los conceptos centrales son explicación didáctica del laboratorio.
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, LECTURA_A1, FUENTE } from "./preguntas-pasado-data";

export const PREGUNTAS_PASADO_FICHA: FichaTeoricaData = {
  ancla: "CH-I · P01 · A1 — ¿Dónde y cuándo ocurrió? Coordenadas espacio-temporales en la historia",

  marcoTeorico: LECTURA_A1,

  objetivos: [
    "Plantear preguntas históricas a partir de problemáticas actuales de México (agua, lenguas indígenas, migración).",
    "Distinguir una pregunta histórica fértil de una cerrada o anacrónica, y reformularla.",
    "Usar las categorías históricas: tiempo y duración, espacio, sujeto histórico, cambio y permanencia, causalidad y multicausalidad.",
    "Ubicar evidencias en su siglo y reconocer relaciones de causa, cambio, permanencia, larga duración y simultaneidad.",
    "Reconocer qué aporta y qué omite cada discurso (oficial, técnico, de trabajadores, pueblos originarios, mujeres, prensa y memoria oral).",
    "Construir una explicación histórica que integre y contraste varias voces.",
  ],

  materiales: [
    { nombre: "Corte arqueológico de una calle", detalle: "Cinco estratos: hoy, siglo XX, siglo XIX, virreinato y Mesoamérica, con una evidencia fechada en cada uno.", icono: "fa-person-digging" },
    { nombre: "Fichas de preguntas", detalle: "Seis preguntas por problemática para clasificar como fértiles, cerradas o anacrónicas.", icono: "fa-note-sticky" },
    { nombre: "Espiral del tiempo", detalle: "De 1300 a hoy, con los periodos mesoamericano, virreinal e independiente.", icono: "fa-hurricane" },
    { nombre: "Diez evidencias fechadas", detalle: "Del agua, las lenguas y la migración, de 1325 a 2003.", icono: "fa-gem" },
    { nombre: "Fogata de las voces", detalle: "Seis voces ilustrativas para el Gran Canal del Desagüe (1900) y seis para el sismo de 1985.", icono: "fa-fire" },
  ],

  conceptos: [
    {
      termino: "Pregunta histórica fértil",
      definicion: "Parte de un problema del presente, se ubica en un tiempo y un espacio y abre el análisis: pregunta por qué, cómo cambió, quiénes participaron o a quién benefició.",
    },
    {
      termino: "Pregunta cerrada",
      definicion: "Se responde con un dato o con sí/no. Sirve para ubicar un hecho, pero por sí sola no explica el pasado.",
    },
    {
      termino: "Anacronismo",
      definicion: "Atribuir a una época ideas, leyes, instituciones o tecnologías que no existían entonces, o juzgarla con ellas.",
    },
    {
      termino: "Cambio y permanencia",
      definicion: "Al comparar dos momentos se distingue lo que se transformó de lo que continúa. Una misma evidencia puede leerse de ambas formas según la pregunta.",
    },
    {
      termino: "Siglo",
      definicion: "El siglo N va del año (N−1)01 al año N00, porque no hubo año 0: 1900 es el último año del siglo XIX y 1607 pertenece al siglo XVII.",
    },
    {
      termino: "Diversidad de discursos",
      definicion: "Cada voz (oficial, técnica, de trabajadores, de pueblos originarios, de mujeres, de la prensa o de la memoria oral) ilumina una parte del proceso y deja otras fuera; la explicación se enriquece al contrastarlas.",
    },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: g.definicion })),

  aplicaciones: [
    "Investigar la historia de tu colonia o pueblo a partir de un problema actual: el agua, el transporte, la lengua o la migración.",
    "Leer una noticia preguntando desde cuándo ocurre el problema y quiénes lo viven.",
    "Entrevistar a personas mayores de tu familia como fuente oral y contrastar su relato con documentos.",
    "Reconocer en un discurso oficial qué voces faltan y buscarlas.",
  ],

  fuente: FUENTE,
};

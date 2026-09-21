/**
 * Datos de la Ficha Teórica del laboratorio "Objects and spaces" (IN-I-P03,
 * progresión 3 de Inglés I).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: lectura A1 «What's around us? — Objetos y espacios
 *     cotidianos» (4 párrafos), seguida de la nota del laboratorio sobre el
 *     orden de los adjetivos (no verbatim, señalada como tal).
 *   - Glosario: glosario interactivo A6 (6 términos).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, LECTURA_A1, NOTA_ORDEN, FUENTE } from "./casa-objetos-ingles-data";

export const CASA_OBJETOS_INGLES_FICHA: FichaTeoricaData = {
  ancla: "IN-I · P03 · A1 — What's around us? — Objetos y espacios cotidianos",

  marcoTeorico: [...LECTURA_A1, NOTA_ORDEN],

  objetivos: [
    "Identificar objetos del aula y del hogar a partir de una descripción en inglés.",
    "Reconocer si un adjetivo indica tamaño (big, small, long, short), forma (round, square, rectangular, triangular) o color.",
    "Describir un objeto con la estructura «It's a + tamaño + forma + color + objeto», con los adjetivos antes del sustantivo.",
    "Elegir el artículo correcto: «a» antes de sonido consonante y «an» antes de sonido vocal.",
    "Seguir instrucciones con preposiciones de lugar: in, on, under, next to, between, in front of.",
    "Decir qué hay en un lugar con «There is» (singular) y «There are» (plural).",
  ],

  materiales: [
    { nombre: "Aula en 3D", detalle: "Veinte objetos: relojes, cajas, mochilas, cuadernos y lápices que se distinguen por un rasgo.", icono: "fa-school" },
    { nombre: "Ventanilla de objetos perdidos", detalle: "Un estante de 4 × 4 y un encargado que busca lo que describes.", icono: "fa-box-open" },
    { nombre: "Recámara en 3D", detalle: "Cama, escritorio, estante, caja y puerta; nueve lugares numerados.", icono: "fa-bed" },
    { nombre: "Fichas de palabras", detalle: "There is / There are, cantidades, rasgos, objetos y preposiciones.", icono: "fa-puzzle-piece" },
    { nombre: "Botón «Escuchar»", detalle: "Lee en voz alta en inglés la instrucción o la oración (si tu navegador lo permite).", icono: "fa-volume-high" },
  ],

  conceptos: [
    { termino: "Adjetivo antes del sustantivo", definicion: "En inglés el adjetivo va antes del objeto y no cambia con el género ni con el número: «a red book», «two red books»." },
    { termino: "Orden de los adjetivos", definicion: "Cuando hay varios, lo más común es tamaño → forma → color → objeto: «a small round blue clock». Decir primero el color («a red big ball») suena mal." },
    { termino: "a / an", definicion: "«a» va antes de una palabra que empieza con sonido consonante («a big box»); «an», antes de sonido vocal («an orange box»). Depende de la palabra que sigue, no del objeto." },
    { termino: "There is / There are", definicion: "Sirven para decir que algo existe en un lugar. «There is» + singular («There is a lamp on the desk»); «There are» + plural («There are two books on the shelf»)." },
    { termino: "Preposiciones de lugar", definicion: "on = sobre una superficie · in = dentro · under = debajo · next to = junto a · between = entre dos cosas · in front of = enfrente." },
    { termino: "Sustantivo o adjetivo de forma", definicion: "«circle», «triangle» y «rectangle» son sustantivos (la figura). Para describir un objeto se usan los adjetivos «round», «triangular» y «rectangular»; «square» sirve para las dos cosas." },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: `${g.definicion} Ejemplo: «${g.ejemplo}»` })),

  aplicaciones: [
    "Reportar una mochila perdida en la escuela o en el transporte: «It's a big black backpack».",
    "Pedir algo en una tienda cuando no sabes su nombre: «I want the small round red one».",
    "Entender instrucciones de un profesor o de un manual: «Put your notebook on the desk».",
    "Describir tu cuarto o tu salón a alguien de otro país en una videollamada.",
  ],

  fuente: FUENTE,
};

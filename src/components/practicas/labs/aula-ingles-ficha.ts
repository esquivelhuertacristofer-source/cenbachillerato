/**
 * Ficha teórica del laboratorio «In the classroom» — IN-I-P02 (Inglés I).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   · Marco teórico: lectura IN-I-P02-A1.
 *   · Glosario: glosario interactivo IN-I-P02-A6 (6 términos).
 * Los «conceptos centrales» son los ejes del laboratorio, escritos para esta
 * práctica: términos cortos, porque cada uno recibe una viñeta ilustrada en la
 * expedición.
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { LECTURA_A1, GLOSARIO_A6, TITULO_A1, FUENTE_A1 } from "./aula-ingles-data";

export const AULA_INGLES_FICHA: FichaTeoricaData = {
  ancla: `IN-I · P02 · A1 — ${TITULO_A1}`,

  marcoTeorico: LECTURA_A1,

  objetivos: [
    "Elegir, en una situación concreta del aula, la expresión en inglés que cumple la función que necesitas (pedir permiso, aclarar una duda, preguntar por una palabra).",
    "Distinguir What does ... mean? (te falta el significado) de How do you say ... in English? (te falta la palabra en inglés).",
    "Abrir el turno con Excuse me y disculparte con Sorry, sabiendo cuál va antes de qué.",
    "Ordenar un intercambio profesor↔alumno respetando que la pregunta va antes de la respuesta y la disculpa antes de la petición.",
    "Reconocer el registro: la misma intención dicha a un compañero y dicha a la maestra (please, could you, may I).",
    "Entender las instrucciones más frecuentes del maestro: Open your book, Work in pairs, Listen and repeat, Hand in your homework.",
  ],

  materiales: [
    { nombre: "Ocho situaciones del aula", detalle: "No entiendes, necesitas que repitan, llegas tarde, quieres salir, te falta una palabra, quieres opinar.", icono: "fa-chalkboard-user" },
    { nombre: "Tres expresiones por situación", detalle: "Las tres son inglés correcto; sólo una encaja por función y por registro.", icono: "fa-comments" },
    { nombre: "Tres intercambios desordenados", detalle: "Diálogos de cinco turnos entre la maestra y un alumno, para volver a armarlos.", icono: "fa-arrow-down-up-across-line" },
    { nombre: "Doce fichas de registro", detalle: "Seis intenciones dichas de dos maneras: a un compañero y a la maestra.", icono: "fa-user-group" },
    { nombre: "Botón «Escuchar»", detalle: "Pronuncia la expresión en inglés (en-US) si el navegador tiene síntesis de voz.", icono: "fa-volume-high" },
    { nombre: "El diálogo con huecos de A2", detalle: "El intercambio de clase completo, para escribir las ocho palabras que faltan.", icono: "fa-keyboard" },
  ],

  conceptos: [
    {
      termino: "Classroom language",
      definicion: "El inglés que hace funcionar la clase: pedir permiso, avisar que no entendiste, preguntar por una palabra y seguir instrucciones. No es vocabulario de examen, es lo que dices en voz alta para poder seguir aprendiendo.",
    },
    {
      termino: "Pedir permiso",
      definicion: "Pedir autorización antes de hacer algo: May I go to the bathroom? / Can I open the window? Es una PREGUNTA; una afirmación (I go to the bathroom) no pide permiso, lo da por hecho.",
    },
    {
      termino: "Aclarar una duda",
      definicion: "Avisar que la comunicación falló y pedir arreglo: I don't understand. / Can you repeat that, please? / Could you speak more slowly? Quedarse callado no arregla nada.",
    },
    {
      termino: "Seguir instrucciones",
      definicion: "Entender lo que el maestro manda hacer: Open your book to page..., Work in pairs, Listen and repeat, Write in your notebook, Hand in your homework.",
    },
    {
      termino: "Registro formal",
      definicion: "Cómo le hablas a la maestra: pregunta en lugar de orden, con please, con may o could. Excuse me, could you repeat that, please?",
    },
    {
      termino: "Registro informal",
      definicion: "Cómo le hablas a un compañero: más corto y directo. Hey! / Say that again. / I don't get it. No es incorrecto: es para un igual.",
    },
    {
      termino: "Turno de habla",
      definicion: "El orden de una conversación. Excuse me abre el turno antes de interrumpir; Sorry se disculpa por algo ya hecho; la pregunta va antes de la respuesta.",
    },
  ],

  glosario: GLOSARIO_A6.map((g) => ({
    termino: g.termino,
    definicion: `${g.definicion} Ejemplo: ${g.ejemplo}`,
  })),

  aplicaciones: [
    "Las frases de clase son las primeras que un hablante de inglés real necesita fuera del aula: Excuse me, Could you repeat that, please? y What does ... mean? funcionan igual en una ventanilla, en un aeropuerto o en una entrevista.",
    "Equivocarse forma parte del proceso: la propia lectura de la progresión lo dice con «Practice makes perfect». Aquí fallar una opción no descuenta nada; lo que hace es explicarte qué comunicaba esa frase.",
  ],

  fuente: FUENTE_A1,
};

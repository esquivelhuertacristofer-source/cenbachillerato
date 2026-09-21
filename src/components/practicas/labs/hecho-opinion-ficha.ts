/**
 * Ficha teórica del laboratorio «Hecho, idea y opinión» (LC-I-P03).
 *
 * El marco teórico es VERBATIM de la lectura LC-I-P03-A1 y las definiciones de
 * información, idea y opinión son las de LC-I-P03-A9. Alimenta además los
 * capítulos «Prepárate» (conceptos) y «Comprueba» (glosario) de la Expedición.
 */
import type { FichaTeoricaData } from "./_ficha";
import { MARCO, FUENTE } from "./hecho-opinion-data";

export const HECHO_OPINION_FICHA: FichaTeoricaData = {
  ancla: "LC-I-P03-A1 · Ideas, información y opiniones en un texto",

  marcoTeorico: MARCO,

  objetivos: [
    "Distinguir, dentro de un mismo texto, qué es información verificable, qué es una idea del autor y qué es una opinión.",
    "Explicar por qué un enunciado se puede contrastar con la realidad y otro no.",
    "Reconocer las marcas de lengua que delatan una valoración: superlativos, adjetivos de valor y verbos de deber.",
    "Juzgar si un texto busca informar, convencer o las dos cosas a la vez.",
    "Leer críticamente: preguntarse quién escribió el texto, con qué propósito y qué evidencia presenta.",
  ],

  materiales: [
    { nombre: "Tres textos para marcar", detalle: "Una nota informativa, una columna de opinión y un anuncio.", icono: "fa-file-lines" },
    { nombre: "Tres marcadores", detalle: "Información (azul), idea (violeta) y opinión (ámbar).", icono: "fa-highlighter" },
    { nombre: "Banco de enunciados", detalle: "Los nueve enunciados de la actividad de clasificación.", icono: "fa-layer-group" },
    { nombre: "Lupa de marcas", detalle: "Para cazar la palabra exacta que valora dentro de una oración.", icono: "fa-magnifying-glass" },
    { nombre: "Cuaderno de reescritura", detalle: "Cómo se diría la misma frase sin valorar.", icono: "fa-pen-to-square" },
  ],

  conceptos: [
    {
      termino: "Información verificable",
      definicion: "Enunciado que se puede contrastar con la realidad: una fecha, una cifra, el nombre de un lugar.",
    },
    {
      termino: "Idea",
      definicion: "Interpretación o valoración que el autor construye a partir de información; otro autor podría interpretar los mismos datos distinto.",
    },
    {
      termino: "Opinión",
      definicion: "Postura personal de quien escribe, que a menudo no es posible verificar objetivamente.",
    },
    {
      termino: "Lectura crítica",
      definicion: "Forma de leer que no acepta el texto como verdad absoluta: pregunta quién lo escribió, con qué propósito y qué evidencia presenta.",
    },
    {
      termino: "Propósito del texto",
      definicion: "La intención que guía a quien escribe: informar, convencer o las dos cosas a la vez.",
    },
    {
      termino: "Marca de valoración",
      definicion: "Palabra que delata un juicio dentro de la frase: «mejor», «insoportable», «deberíamos», «sin duda».",
    },
    {
      termino: "Evidencia",
      definicion: "Dato, cifra o fuente con la que un texto sostiene lo que afirma; sin ella, la afirmación queda en promesa.",
    },
    {
      termino: "Persuasión",
      definicion: "Uso del lenguaje para que el lector adopte una postura o tome una decisión.",
    },
  ],

  glosario: [
    { termino: "Verificar", definicion: "Contrastar un enunciado con una fuente o con la realidad para saber si es cierto." },
    { termino: "Interpretación", definicion: "Explicación que el autor da a unos hechos y que otro autor podría dar distinta." },
    { termino: "Juicio de valor", definicion: "Afirmación que califica algo como bueno, mejor o peor sin una medida comprobable." },
    { termino: "Nota informativa", definicion: "Texto que relata un hecho con datos y fuentes, sin tomar partido." },
    { termino: "Columna de opinión", definicion: "Texto firmado en el que el autor defiende abiertamente su postura." },
    { termino: "Sesgo", definicion: "Inclinación del texto que selecciona sólo lo que favorece a una postura." },
  ],

  aplicaciones: [
    "Leer una noticia y separar el dato del comentario antes de compartirla.",
    "Detectar en un anuncio qué es característica del producto y qué es promesa.",
    "Revisar tu propio escrito y decidir qué afirmaciones necesitan una fuente.",
    "Defender una postura en un debate distinguiendo tus datos de tus juicios.",
  ],

  fuente: FUENTE,
};

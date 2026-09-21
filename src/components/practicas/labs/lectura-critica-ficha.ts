/**
 * Ficha teórica del laboratorio «Leer más allá de lo literal» (LC-III-P01).
 *
 * El marco teórico es VERBATIM de la lectura LC-III-P01-A1 y el glosario es el
 * de LC-III-P01-A5. Alimenta además los capítulos «Prepárate» (conceptos) y
 * «Comprueba» (glosario) de la Expedición.
 */
import type { FichaTeoricaData } from "./_ficha";
import { MARCO, FUENTE } from "./lectura-critica-data";

export const LECTURA_CRITICA_FICHA: FichaTeoricaData = {
  ancla: "LC-III-P01-A1 · Leer críticamente: más allá de la comprensión literal",

  marcoTeorico: MARCO,

  objetivos: [
    "Distinguir, ante un mismo texto, qué pregunta se responde copiando, cuál exige inferir y cuál exige evaluar al texto.",
    "Responder cada nivel como corresponde: localizar la línea, sostener una deducción o juzgar el argumento.",
    "Encontrar el supuesto que un texto no argumenta pero necesita que el lector acepte.",
    "Reconocer quién firma un texto y a quién le conviene que su conclusión se acepte.",
    "Separar la crítica del argumento de la descalificación de quien lo escribe.",
    "Tomar una postura propia frente a un texto y sostenerla con líneas concretas de ese texto.",
  ],

  materiales: [
    { nombre: "Tres textos con líneas numeradas", detalle: "Un boletín escolar, una carta vecinal y una entrada de blog.", icono: "fa-file-lines" },
    { nombre: "La escalera de los tres niveles", detalle: "Literal, inferencial y crítico, con su forma propia de responder.", icono: "fa-stairs" },
    { nombre: "Cinco argumentos con una pieza escondida", detalle: "Premisa, conclusión y el supuesto que falta entre las dos.", icono: "fa-puzzle-piece" },
    { nombre: "Cuatro textos firmados", detalle: "Con su emisor a la vista y dos reacciones para clasificar.", icono: "fa-user-tie" },
    { nombre: "Mesa de postura", detalle: "Tres posturas defendibles y las líneas del texto que las respaldan.", icono: "fa-scale-balanced" },
  ],

  conceptos: [
    {
      termino: "Lectura literal",
      definicion: "Nivel en el que la respuesta está escrita en el texto: basta localizarla y reproducirla.",
    },
    {
      termino: "Lectura inferencial",
      definicion: "Nivel en el que el lector deduce lo que el texto no dice pero permite concluir con sus pistas.",
    },
    {
      termino: "Lectura crítica",
      definicion: "Nivel en el que el lector evalúa el texto: si lo que afirma queda sostenido por lo que muestra.",
    },
    {
      termino: "Supuesto implícito",
      definicion: "Idea que el autor no argumenta pero necesita que aceptes para que su conclusión se sostenga.",
    },
    {
      termino: "Interés del emisor",
      definicion: "A quién le conviene que el lector acepte la conclusión del texto.",
    },
    {
      termino: "Ataque a la persona",
      definicion: "Rechazar lo dicho por quién lo dice, en vez de responder a las razones que da.",
    },
    {
      termino: "Postura con evidencia",
      definicion: "Juicio propio frente al texto sostenido con líneas concretas de ese mismo texto.",
    },
    {
      termino: "Opinión sin sustento",
      definicion: "Postura que nada del texto respalda; no es un error de gusto, es una falta de evidencia.",
    },
  ],

  glosario: [
    {
      termino: "sentido global",
      definicion: "Significado general que se construye al interpretar tema, estructura e intención del texto en conjunto.",
    },
    {
      termino: "intención del autor",
      definicion: "Propósito que guía la escritura: informar, persuadir, entretener, reflexionar o criticar.",
    },
    {
      termino: "paráfrasis",
      definicion: "Reformulación de las ideas de un texto con las propias palabras, manteniendo el sentido original.",
    },
    {
      termino: "postura crítica",
      definicion: "Juicio argumentado que el lector emite ante las ideas del autor, a favor o en contra, con razones.",
    },
    {
      termino: "conocimientos previos",
      definicion: "Saberes que el lector ya posee y que activa para interpretar un texto nuevo.",
    },
    {
      termino: "inferencia",
      definicion: "Conclusión que el lector deduce a partir de pistas en el texto, sin que se diga explícitamente.",
    },
  ],

  aplicaciones: [
    "Revisar una publicación antes de compartirla: qué dice, qué deduzco y qué queda probado.",
    "Responder a un argumento con el que no estás de acuerdo sin descalificar a quien lo hizo.",
    "Detectar en una promoción el supuesto que te pide aceptar sin discutirlo.",
    "Escribir una reseña crítica sosteniendo tu postura con citas del texto reseñado.",
  ],

  fuente: FUENTE,
};

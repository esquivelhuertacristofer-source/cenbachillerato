/**
 * Ficha teórica — anatomia-exposicion-oral
 *
 * Contenido VERBATIM de la progresión LC-I-P08 (Lengua y Comunicación I):
 * el marco teórico son los cuatro párrafos de la lectura A1 («Características
 * de una exposición oral efectiva»); el glosario sale de A5 (los mismos pares
 * que A9 pide relacionar) más «contacto visual», que la propia lectura A1
 * define; las aplicaciones citan A3 y el Producto Integrador de la materia.
 *
 * Los `conceptos` son los términos centrales de ESTE laboratorio —las piezas
 * de la anatomía que el alumno monta— y se usan además para armar el capítulo
 * «Prepárate» de la Expedición.
 */
import type { FichaTeoricaData } from "./_ficha";

export const ANATOMIA_EXPOSICION_FICHA: FichaTeoricaData = {
  ancla: "LC-I-P08-A1 · Características de una exposición oral efectiva",
  marcoTeorico: [
    "La exposición oral es una de las prácticas comunicativas más importantes en la vida académica y profesional. Exponer es organizar un conjunto de ideas sobre un tema y comunicarlas de manera clara, ordenada y adaptada a la audiencia.",
    "Una exposición oral efectiva tiene varias fases: la planificación (definir el tema, investigar, seleccionar la información relevante), la organización (introducción, desarrollo y conclusión), la preparación de apoyos visuales si se usan (diapositivas, carteles, objetos), y la práctica (ensayar antes de presentar).",
    "Durante la exposición, el contacto visual con el público, la voz segura y la postura corporal son tan importantes como el contenido mismo. La audiencia no solo escucha lo que decimos: también observa cómo lo decimos.",
    "Preparar bien una exposición oral no solo permite comunicar ideas con claridad, sino también desarrollar confianza en uno mismo y habilidades de comunicación que serán útiles toda la vida.",
  ],
  objetivos: [
    "Montar el guion de una exposición pieza por pieza y reconocer qué se rompe cuando falta cada una.",
    "Repartir el tiempo entre introducción, desarrollo, conclusión y preguntas sin que el desarrollo se coma el cierre.",
    "Decidir qué apoyo visual sirve en cada momento de la exposición y explicar por qué los demás no.",
    "Diagnosticar exposiciones ajenas a partir de lo que la progresión define como exposición efectiva.",
    "Escribir de memoria los cinco términos del glosario de la progresión y completar el texto de sus etapas.",
  ],
  materiales: [
    { nombre: "El guion en tarjetas", detalle: "Una tarjeta por pieza: apertura, tema y propósito, tres puntos, cierre y preguntas.", icono: "fa-clone" },
    { nombre: "Un reloj o cronómetro", detalle: "Para medir el ensayo: el tiempo real es el que decide si el cierre cabe.", icono: "fa-stopwatch" },
    { nombre: "Un apoyo visual", detalle: "Diapositiva, mapa mental, cartel u objeto: lo que refuerce el mensaje sin sustituirlo.", icono: "fa-image" },
    { nombre: "Un público de prueba", detalle: "Alguien que escuche el ensayo y pregunte algo que no esté en el guion.", icono: "fa-users" },
  ],
  conceptos: [
    { termino: "Gancho de apertura", definicion: "Pregunta o dato con el que empieza la exposición para que la audiencia decida escuchar." },
    { termino: "Tema y propósito", definicion: "Enunciado que dice de qué se va a hablar y qué idea debe llevarse el público al salir." },
    { termino: "Punto de desarrollo", definicion: "Cada una de las ideas principales que se explican, con su evidencia y su apoyo visual." },
    { termino: "Reparto del tiempo", definicion: "Decisión de cuántos minutos ocupa cada parte para que la conclusión no se quede fuera." },
    { termino: "Turno de preguntas", definicion: "Momento final en que el público pregunta y quien expone responde con lo que domina del tema." },
    { termino: "Ensayo", definicion: "Repetir la exposición en voz alta antes de presentarla para ganar fluidez y medir el tiempo." },
  ],
  glosario: [
    { termino: "planeación", definicion: "Etapa de definir el tema, investigar y seleccionar la información relevante." },
    { termino: "introducción", definicion: "Parte inicial que presenta el tema y capta la atención del público." },
    { termino: "desarrollo", definicion: "Parte central donde se explican los puntos principales del tema." },
    { termino: "conclusión", definicion: "Parte final que retoma lo más importante y cierra la exposición." },
    { termino: "apoyo visual", definicion: "Recurso como diapositivas o mapas mentales que refuerza el mensaje oral." },
    { termino: "contacto visual", definicion: "Mirar a la audiencia mientras se habla; genera conexión con el público y transmite seguridad." },
  ],
  aplicaciones: [
    "A3 (verbatim): «Planifica una mini-exposición oral de 3 minutos sobre un tema que domines. Escribe: el título, la introducción (3-4 oraciones), los 3 puntos principales del desarrollo y la conclusión (2-3 oraciones). Explica qué apoyos visuales usarías.»",
    "Producto Integrador de Lengua y Comunicación I (verbatim): el texto para la comunidad termina con un apartado «Para mi exposición oral» donde se anota «qué apoyo visual usarías (diapositiva, mapa mental, cartel) y dos cuidados de tu voz al leerlo en voz alta (por ejemplo, dicción y pausas)».",
  ],
  fuente: "CEN Bachillerato — Lengua y Comunicación I, progresión 8 (LC-I-P08)",
};

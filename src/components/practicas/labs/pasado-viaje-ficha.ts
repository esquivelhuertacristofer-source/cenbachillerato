/**
 * Ficha teórica del laboratorio «A trip to remember» (IN-IV-P01).
 *
 * El marco teórico se apoya en la lectura IN-IV-P01-A1 (la nota gramatical va
 * verbatim) y el glosario es el de IN-IV-P01-A5, con los términos acortados
 * para que cada uno reciba su viñeta. Alimenta además los capítulos
 * «Prepárate» (conceptos) y «Comprueba» (glosario) de la Expedición.
 */
import type { FichaTeoricaData } from "./_ficha";
import { MARCO, FUENTE } from "./pasado-viaje-data";

export const PASADO_VIAJE_FICHA: FichaTeoricaData = {
  ancla: "IN-IV-P01-A1 · A Trip to Remember: Past Simple in Context",

  marcoTeorico: MARCO,

  objetivos: [
    "Escribir el pasado de un verbo regular aplicando la regla de ortografía que le toca: -ed, -d, -ied o consonante doble.",
    "Reconocer que los verbos irregulares no siguen regla y que hay que aprenderse su forma: go → went, see → saw, take → took, buy → bought.",
    "Distinguir la acción de fondo (past continuous) de la que la interrumpe (past simple) dentro de una misma escena.",
    "Usar while y when en su lugar: while abre el fondo, when introduce lo que lo corta.",
    "Ordenar los momentos de un relato con conectores de secuencia: First, Then, After that, Later, Finally.",
    "Situar una experiencia en el tiempo con expresiones pasadas: last summer, two years ago, in 2023, when I was twelve.",
    "Detectar la oración que rompe el tiempo verbal de una narración y reescribirla en pasado.",
  ],

  materiales: [
    { nombre: "Taller de ortografía", detalle: "Dieciséis verbos y las cinco maneras de formar su pasado.", icono: "fa-spell-check" },
    { nombre: "Línea del tiempo", detalle: "Cinco escenas con su banda de fondo y su punto de interrupción.", icono: "fa-timeline" },
    { nombre: "Itinerario del viaje", detalle: "Seis momentos de una excursión y sus conectores.", icono: "fa-route" },
    { nombre: "Caza al intruso", detalle: "Tres rondas de cuatro oraciones: una rompe el tiempo verbal.", icono: "fa-magnifying-glass" },
    { nombre: "Cuaderno de escritura", detalle: "Ocho oraciones donde se teclea la forma verbal.", icono: "fa-pen-to-square" },
  ],

  conceptos: [
    { termino: "Past simple", definicion: "Tiempo del hecho terminado en el pasado: We arrived in Oaxaca City. Es el tiempo base de cualquier narración." },
    { termino: "Verbo regular", definicion: "El que forma su pasado añadiendo -ed: visit → visited, walk → walked." },
    { termino: "Verbo irregular", definicion: "El que tiene una forma de pasado propia y hay que memorizar: go → went, see → saw, take → took, buy → bought." },
    { termino: "Regla -ied", definicion: "Si el verbo acaba en consonante + y, la y se vuelve i y se añade -ed: study → studied, try → tried." },
    { termino: "Consonante doble", definicion: "En verbos de una sílaba que acaban en vocal + consonante, esa consonante se dobla antes de -ed: stop → stopped." },
    { termino: "Past continuous", definicion: "was / were + verbo-ing. Lo que ya estaba pasando en un momento del pasado: I was walking." },
    { termino: "Acción de fondo", definicion: "La actividad larga sobre la que ocurre otra cosa. Va en past continuous y suele ir detrás de while." },
    { termino: "Interrupción", definicion: "El hecho puntual que corta el fondo. Va en past simple y suele ir detrás de when: ...when it started to rain." },
    { termino: "Conector de secuencia", definicion: "Palabra que ordena los hechos del relato: First, Then, After that, Later, Finally, In the end." },
    { termino: "Expresión de tiempo", definicion: "Marcador que ancla la historia a un momento pasado: last summer, two years ago, in 2023, when I was twelve." },
  ],

  glosario: [
    { termino: "past continuous", definicion: "Background action ongoing at a moment in the past. Se arma con was / were + verbo-ing: I was studying." },
    { termino: "past simple", definicion: "A completed action that interrupts a background activity: While I was reading, the power went out." },
    { termino: "It was the first time", definicion: "Expresión para hablar de una experiencia completamente nueva, seguida de past simple: It was the first time I cooked." },
    { termino: "time expressions", definicion: "Marcadores temporales del pasado: last year, ago, in 2022, when I was ten." },
    { termino: "while / when", definicion: "Conectores de simultaneidad: mientras / cuando. Tras while suele ir el continuous; tras when, el simple." },
    { termino: "detail expressions", definicion: "Frases que añaden detalle a la narración: with my family, at the time, right there." },
  ],

  aplicaciones: [
    "Contarle a un visitante, en inglés, cómo se vive el Día de Muertos: qué se puso en la ofrenda, a qué panteón fueron y qué estaba pasando cuando llegaron.",
    "Escribir el reporte de una excursión escolar o de servicio social en inglés, con los hechos en orden y sus conectores.",
    "Redactar la reseña de un viaje o de un hospedaje: lo que ocurrió, dónde y cómo estuvo.",
    "Narrar un incidente en un formato de reporte —lo que estabas haciendo cuando ocurrió—, que es exactamente la estructura fondo + interrupción.",
    "Escribir el pie de una foto o una publicación sobre un viaje sin mezclar presente y pasado.",
  ],

  fuente: FUENTE,
};

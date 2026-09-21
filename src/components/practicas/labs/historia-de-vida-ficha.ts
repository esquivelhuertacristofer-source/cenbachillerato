/**
 * Ficha teórica — historia-de-vida-relato
 *
 * Contenido de la progresión LC-II-P01 (Lengua y Comunicación II). El marco
 * teórico es VERBATIM de LC-II-P01-A1 (lectura «Narrativas de vida: contar
 * para construirse»); el glosario, VERBATIM de LC-II-P01-A5, más el término
 * «Huella», que la propia lectura define («un cambio en cómo pensamos,
 * sentimos o actuamos»).
 *
 * Los «conceptos centrales» son el vocabulario de taller con el que trabaja
 * este laboratorio: las piezas de un relato de experiencia y las tres
 * decisiones de voz. Son herramientas de oficio, no datos sobre la vida de
 * nadie.
 */
import type { FichaTeoricaData } from "./_ficha";

export const HISTORIA_DE_VIDA_FICHA: FichaTeoricaData = {
  ancla: "LC-II-P01-A1 · Narrativas de vida: contar para construirse",
  marcoTeorico: [
    "Las narrativas de vida son textos en los que una persona cuenta episodios de su propia historia: un momento decisivo, una pérdida importante, un aprendizaje profundo, una primera vez. Al narrar, no solo recordamos: construimos significado sobre lo que nos ha pasado y lo compartimos con otros.",
    "Escribir sobre la propia vida requiere valentía y reflexión. No se trata de contar todo lo que ocurrió, sino de seleccionar aquellas situaciones que dejaron una huella —un cambio en cómo pensamos, sentimos o actuamos— y darles forma con palabras.",
    "En muchas culturas, contar la historia propia es un acto comunitario. Las personas mayores transmiten su sabiduría a través de relatos; las familias construyen su identidad compartiendo anécdotas; los escritores influyen en sus lectores al mostrar cómo sus experiencias los transformaron. En LC-II, narrarás situaciones de tu historia de vida para explorar cómo el lenguaje nos ayuda a entendernos y a comunicar nuestra experiencia a los demás.",
    "En este laboratorio no se te pide contar nada tuyo. Se trabaja sobre dos anécdotas ajenas —escritas para la práctica, con personajes ficticios— para aprender el oficio: ordenar los hechos, separar lo que pasó de lo que significó, elegir desde dónde se cuenta y localizar el giro y la huella. Lo tuyo, si decides escribirlo, se queda en tu cuaderno: no se envía a nadie ni se califica.",
  ],
  objetivos: [
    "Ordena en la línea del tiempo los seis momentos de un relato de experiencia.",
    "Localiza el giro y la huella de una anécdota ajena.",
    "Distingue el suceso del detalle descriptivo y del significado.",
    "Elige narrador, tiempo verbal y distancia según lo que te pide un encargo.",
    "Escribe de memoria los términos del glosario de la progresión.",
    "Aprueba el reto evaluable con 70% o más.",
  ],
  materiales: [
    { nombre: "Dos anécdotas de taller", detalle: "Relatos ficticios en seis tarjetas, para ordenar y analizar.", icono: "fa-layer-group" },
    { nombre: "Mesa de fragmentos", detalle: "Doce frases que separar en suceso, detalle y huella.", icono: "fa-table-columns" },
    { nombre: "Consola de voz narrativa", detalle: "Tres controles que reescriben la misma escena de ocho maneras.", icono: "fa-sliders" },
    { nombre: "Cuaderno opcional", detalle: "Espacio privado para escribir lo propio. No se guarda ni se califica.", icono: "fa-book" },
  ],
  conceptos: [
    { termino: "Detonante", definicion: "El hecho que rompe la rutina y echa a andar el relato." },
    { termino: "Giro", definicion: "El momento en que la historia toma otra dirección y ya no se puede volver atrás." },
    { termino: "Huella", definicion: "El cambio que la experiencia dejó en cómo quien narra piensa, siente o actúa." },
    { termino: "Suceso", definicion: "Lo que ocurrió: un hecho que avanza en el tiempo y podría filmarse." },
    { termino: "Voz narrativa", definicion: "Quién cuenta la historia: la misma escena cambia si narra el protagonista o alguien de fuera." },
    { termino: "Tiempo verbal", definicion: "Si los hechos se cuentan en pretérito (pasó) o en presente histórico (pasa), lo que acerca o aleja la escena." },
  ],
  glosario: [
    { termino: "Narración", definicion: "Relato de hechos o situaciones que suceden a lo largo del tiempo, con un orden." },
    { termino: "Descripción", definicion: "Explicación de cómo son las personas, lugares, objetos o emociones." },
    { termino: "Idea prioritaria", definicion: "Idea principal de un texto, la más importante que sostiene el mensaje." },
    { termino: "Idea secundaria", definicion: "Idea que complementa o apoya a la idea principal con detalles." },
    { termino: "Ficción y realidad", definicion: "La ficción es lo inventado o imaginado; la realidad es lo que ocurrió de verdad." },
    { termino: "Huella personal", definicion: "La situación que dejó un cambio en cómo pensamos, sentimos o actuamos." },
  ],
  aplicaciones: [
    "México reconoce 68 lenguas nacionales además del español, según el catálogo del INALI (Instituto Nacional de Lenguas Indígenas). Cada una tiene variantes dialectales propias: el náhuatl, por ejemplo, tiene más de 30 variantes distribuidas desde Guerrero hasta Veracruz.",
    "Contar la historia propia es un acto comunitario: las personas mayores transmiten su sabiduría a través de relatos y las familias construyen su identidad compartiendo anécdotas.",
  ],
  fuente: "Material elaborado para CEN Bachillerato — LC-II",
};

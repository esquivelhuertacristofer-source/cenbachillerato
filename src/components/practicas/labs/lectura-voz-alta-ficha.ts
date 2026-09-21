/**
 * Ficha teórica del laboratorio «Leer en voz alta» (LC-I-P07).
 *
 * El marco teórico es VERBATIM de la lectura LC-I-P07-A1 y los conceptos
 * técnicos son los del glosario LC-I-P07-A5. Alimenta además los capítulos
 * «Prepárate» (conceptos) y «Comprueba» (glosario) de la Expedición.
 */
import type { FichaTeoricaData } from "./_ficha";
import { MARCO, FUENTE } from "./lectura-voz-alta-data";

export const LECTURA_VOZ_ALTA_FICHA: FichaTeoricaData = {
  ancla: "LC-I-P07-A1 · ¿Por qué leer en voz alta?",

  marcoTeorico: MARCO,

  objetivos: [
    "Decidir, sobre un texto real, dónde va cada pausa, qué palabra lleva el énfasis y dónde cambia la entonación, y saber explicar por qué ahí.",
    "Reconocer que la puntuación no es adorno: es la partitura que indica al lector dónde detenerse y dónde cambiar el tono.",
    "Ajustar la velocidad y la duración de las pausas al tipo de texto y al oyente que lo va a escuchar.",
    "Distinguir la entonación de las preguntas que se responden con sí o no —que sube— de la de las que empiezan con «qué» o «cuántas», que baja.",
    "Escuchar la lectura de otra persona y diagnosticar qué elemento falló: dicción, entonación, ritmo, pausa o énfasis.",
    "Emitir una opinión fundamentada sobre una lectura: nombrar el elemento, describir el hecho y explicar su efecto, en lugar de decir si gustó o no.",
  ],

  materiales: [
    { nombre: "Tres textos para marcar", detalle: "Una nota informativa, un texto literario y un relato con diálogo.", icono: "fa-file-lines" },
    { nombre: "Cuatro marcadores de voz", detalle: "Pausa breve, pausa larga, énfasis y cambio de entonación.", icono: "fa-highlighter" },
    { nombre: "Control de ritmo", detalle: "Palabras por minuto y duración de la pausa, con la duración estimada del fragmento.", icono: "fa-gauge-high" },
    { nombre: "Apoyo de voz", detalle: "El sintetizador del navegador lee el fragmento para comparar; no evalúa tu voz.", icono: "fa-volume-high" },
    { nombre: "Seis lecturas ajenas", detalle: "Descritas por escrito, para diagnosticar y opinar con criterios.", icono: "fa-users-viewfinder" },
  ],

  conceptos: [
    { termino: "Dicción", definicion: "Pronunciación clara y correcta de los sonidos y sílabas." },
    { termino: "Entonación", definicion: "Variación del tono de la voz para expresar preguntas, exclamaciones o afirmaciones." },
    { termino: "Ritmo", definicion: "Velocidad adecuada de la lectura, ni demasiado rápida ni demasiado lenta." },
    { termino: "Pausa", definicion: "Silencio breve que permite al oyente procesar lo escuchado." },
    { termino: "Énfasis", definicion: "Fuerza y tiempo extra sobre la palabra que carga el sentido de la frase." },
    { termino: "Elemento paralingüístico", definicion: "Recurso de la voz que acompaña a las palabras: tono, volumen, ritmo, pausas, énfasis." },
    { termino: "Escucha activa", definicion: "Forma de escuchar que sigue el hilo del texto, detecta inconsistencias y prepara una opinión." },
    { termino: "Opinión fundamentada", definicion: "Juicio sobre una lectura que explica el porqué con argumentos basados en el texto." },
  ],

  glosario: [
    { termino: "Fraseo", definicion: "Grupo de palabras que se dicen de un tirón, entre dos pausas; es la unidad real de la lectura en voz alta." },
    { termino: "Volumen", definicion: "Intensidad con la que se emite la voz, que se ajusta al tamaño del lugar y al número de oyentes." },
    { termino: "Tono", definicion: "Altura de la voz: qué tan aguda o grave suena en cada momento de la frase." },
    { termino: "Proyección", definicion: "Hacer que la voz llegue al fondo del salón sin gritar, apoyándola en la respiración." },
    { termino: "Inflexión", definicion: "Cambio de tono dentro de una frase que señala pregunta, duda, sorpresa o cierre." },
    { termino: "Muletilla", definicion: "Palabra o sonido que se repite sin aportar nada y que distrae a quien escucha." },
  ],

  aplicaciones: [
    "Preparar la lectura de un texto marcando primero la puntuación antes de leerlo frente al grupo.",
    "Leer en voz alta un instructivo para que alguien lo siga con las manos ocupadas.",
    "Dar retroalimentación a un compañero nombrando el elemento que falló y no solo si gustó o no.",
    "Grabar una lectura propia y escucharla como oyente para detectar el ritmo y las pausas.",
  ],

  fuente: FUENTE,
};

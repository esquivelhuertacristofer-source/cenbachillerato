/**
 * Ficha teórica del laboratorio «Describing people, clothes and weather»
 * (IN-II-P04).
 *
 * El marco teórico es VERBATIM de la infografía IN-II-P04-A1 y el glosario es
 * el de IN-II-P04-A5, con los términos acortados para que cada uno reciba su
 * viñeta. Alimenta además los capítulos «Prepárate» (conceptos) y «Comprueba»
 * (glosario) de la Expedición.
 */
import type { FichaTeoricaData } from "./_ficha";
import { MARCO, FUENTE } from "./describir-personas-clima-data";

export const DESCRIBIR_PERSONAS_CLIMA_FICHA: FichaTeoricaData = {
  ancla: "IN-II-P04-A1 · Describing People, Clothes and Weather",

  marcoTeorico: MARCO,

  objetivos: [
    "Colocar los adjetivos en el orden fijo del inglés: opinión → tamaño → edad → color → material → sustantivo.",
    "Reconocer por qué «a red big jacket» le suena imposible a un hablante de inglés, aunque en español el orden sea libre.",
    "Elegir be (is / are) para las cualidades y have (has / have) para lo que la persona tiene, sin cruzarlos.",
    "Distinguir lo que alguien trae puesto ahora (present continuous) de lo que usa normalmente (present simple).",
    "Vestir a una persona según el pronóstico y justificar la decisión con una oración correcta en inglés.",
    "Describir a una persona con respeto: estatura, cabello, lentes y ropa, sin juzgar su cuerpo.",
  ],

  materiales: [
    { nombre: "Mesa de armado de frases", detalle: "Seis frases con sus adjetivos sueltos y las casillas en orden.", icono: "fa-arrow-down-1-9" },
    { nombre: "Detector de frases imposibles", detalle: "Seis frases: tres que se dicen y tres que ningún hablante diría.", icono: "fa-ear-listen" },
    { nombre: "Tablero be / have", detalle: "Ocho descripciones y las cuatro formas is, are, has, have.", icono: "fa-code-compare" },
    { nombre: "Clóset y parte meteorológico", detalle: "Catorce prendas y cuatro pronósticos de lugares de México.", icono: "fa-shirt" },
    { nombre: "Cuaderno de escritura", detalle: "Ocho oraciones donde se teclea wearing o wears.", icono: "fa-pen-to-square" },
  ],

  conceptos: [
    { termino: "Orden del adjetivo", definicion: "En inglés los adjetivos van antes del sustantivo y en un orden fijo: opinión → tamaño → edad → color → material." },
    { termino: "Adjetivo de opinión", definicion: "Lo que opinas de algo (nice, beautiful, comfortable). Abre la fila de adjetivos." },
    { termino: "Adjetivo de material", definicion: "De qué está hecho algo (leather, cotton, wool). Es el último antes del sustantivo." },
    { termino: "Verbo be", definicion: "Ser o estar. Describe cómo ES alguien con un adjetivo: She is tall." },
    { termino: "Verbo have", definicion: "Tener. Describe lo que alguien TIENE con un sustantivo: She has long hair. Con he/she se usa has." },
    { termino: "Present continuous", definicion: "am / is / are + verbo-ing. Lo que pasa ahora mismo: He is wearing a jacket." },
    { termino: "Present simple", definicion: "Forma del hábito. Lo que alguien hace normalmente: She wears a uniform every day. Con he/she lleva -s." },
    { termino: "Adjetivos de clima", definicion: "Sunny, cloudy, rainy, windy, hot, cold, warm. Se usan con it: It's raining." },
    { termino: "Descripción respetuosa", definicion: "Describir a alguien por rasgos neutros —estatura, cabello, lentes, ropa— sin juzgar su cuerpo ni usar estereotipos." },
  ],

  glosario: [
    { termino: "have / has", definicion: "Tener; describe rasgos físicos. Con he y she se usa has: She has long hair." },
    { termino: "is wearing", definicion: "Present continuous para la ropa que alguien lleva puesta en este momento: He is wearing a jacket." },
    { termino: "his / her / their", definicion: "Adjetivos posesivos: de él, de ella, de ellos. Her dress is red." },
    { termino: "weather", definicion: "Estado de la atmósfera en un lugar y un momento: sunny, rainy, cold. No es lo mismo que climate." },
    { termino: "seasons", definicion: "Las estaciones del año: spring, summer, autumn/fall, winter." },
    { termino: "raincoat", definicion: "Impermeable; la prenda que se usa cuando it's raining." },
  ],

  aplicaciones: [
    "Describir a un turista o a un huésped en inglés sin juzgar su apariencia, como lo hace a diario el personal de hoteles y guías en Cancún, Oaxaca o Puerto Vallarta.",
    "Leer un parte meteorológico en inglés y decidir qué ropa llevar a un viaje.",
    "Escribir el pie de una foto en inglés: quién aparece, qué trae puesto y cómo estaba el día.",
    "Reportar un objeto o una prenda perdida describiéndola con los adjetivos en el orden correcto.",
  ],

  fuente: FUENTE,
};

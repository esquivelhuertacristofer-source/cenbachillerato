/**
 * Ficha teórica — narrativas-populares-lengua (LC-II-P03).
 *
 * El marco teórico es VERBATIM de la lectura LC-II-P03-A1 («Las narrativas
 * populares: entre tradición e imaginación») y la primera aplicación es su
 * callout «¿Sabías?», también verbatim. El glosario es el de LC-II-P03-A5 más
 * «Registro oral», que es lo que el laboratorio pone a trabajar.
 *
 * Los `conceptos` son los rasgos lingüísticos que el alumno MARCA dentro de los
 * relatos: van aparte del glosario a propósito, porque la Expedición usa una
 * lista para el capítulo de «Prepárate» y la otra para el de «Comprueba», y
 * repetirlas dejaría los dos capítulos diciendo lo mismo.
 */
import type { FichaTeoricaData } from "./_ficha";

export const NARRATIVAS_POPULARES_FICHA: FichaTeoricaData = {
  ancla: "LC-II-P03-A1 · Las narrativas populares: entre tradición e imaginación",
  marcoTeorico: [
    "Las narrativas populares son relatos que circulan en la cultura cotidiana de comunidades y pueblos: leyendas sobre lugares misteriosos, mitos de origen, cuentos transmitidos oralmente de generación en generación, creepypastas contemporáneas en internet. Todas comparten algo en común: nacen de la imaginación colectiva y dan sentido a lo que no se puede explicar fácilmente.",
    "Desde el punto de vista lingüístico, estas narrativas tienen características propias. Usan un vocabulario accesible y, a menudo, regional o coloquial. Sus estructuras sintácticas son simples pero efectivas. El tiempo verbal predominante suele ser el pasado, pero puede mezclarse con el presente para crear tensión. Abundan las fórmulas de inicio (\"Cuentan que…\", \"Se dice que…\") y los recursos expresivos como la hipérbole, la personificación y el suspenso.",
    "Estudiar las narrativas populares nos permite entender cómo una comunidad construye su identidad, sus miedos y sus valores a través del lenguaje. También nos proporciona recursos que podemos integrar en nuestros propios textos creativos.",
    "Una advertencia que este laboratorio sostiene en todos sus modos: el habla de las narrativas populares —sus voces regionales, sus diminutivos, sus palabras de lenguas originarias— no es «español mal hablado». Es variación legítima de la lengua, con reglas propias y con una historia detrás. Pasar un relato al registro escrito no lo corrige: lo traslada a otra situación de comunicación, y en el traslado siempre se gana precisión y se pierde cercanía.",
  ],
  objetivos: [
    "Marca dentro de tres relatos los rasgos lingüísticos que delatan que vienen de la tradición oral.",
    "Distingue la fórmula de apertura de la de cierre y explica qué hace cada una.",
    "Reescribe cinco frases del registro oral al registro escrito y decide qué se pierde en cada traslado.",
    "Clasifica once voces del español de México según la lengua de la que provienen.",
    "Escribe de memoria los seis términos del glosario de la progresión.",
    "Completa el texto sobre las características lingüísticas de la narrativa popular (A2).",
    "Aprueba el reto evaluable con 70 % o más.",
  ],
  materiales: [
    { nombre: "Tres relatos marcables", detalle: "Textos ilustrativos con 16 fragmentos por identificar", icono: "fa-book-open" },
    { nombre: "Paleta de rasgos", detalle: "Los nueve rasgos de la lengua oral, con su definición", icono: "fa-palette" },
    { nombre: "Mesa de registro", detalle: "Cinco frases orales y tres reescrituras posibles cada una", icono: "fa-right-left" },
    { nombre: "Archivo de voces", detalle: "Once palabras con su lengua y su forma original", icono: "fa-language" },
    { nombre: "Glosario de la progresión", detalle: "Los seis términos, para escribirlos de memoria", icono: "fa-spell-check" },
  ],
  conceptos: [
    {
      termino: "Fórmula de apertura",
      definicion:
        "Frase hecha que abre el relato y avisa que lo que sigue es de oídas: «Cuentan que…», «Se dice que…», «Dicen los que saben…».",
    },
    {
      termino: "Fórmula de cierre",
      definicion:
        "Frase hecha que cierra el relato y devuelve la palabra a quien escucha: «Y desde entonces…», «Eso dicen; yo nomás lo cuento».",
    },
    {
      termino: "Repetición y paralelismo",
      definicion:
        "Repetir una palabra o una estructura para medir el tiempo o el esfuerzo sin decirlo: «camina y camina», «ni de día ni de noche».",
    },
    {
      termino: "Diminutivo afectivo",
      definicion:
        "En el español de México el sufijo -ito/-ita casi nunca achica: acerca, suaviza o da respeto. «Viejita» no significa «vieja pequeña».",
    },
    {
      termino: "Nahuatlismo",
      definicion:
        "Palabra que el español de México tomó del náhuatl: milpa, tianguis, tecolote, elote. Forma parte del idioma, no es un error.",
    },
    {
      termino: "Presente histórico",
      definicion:
        "Verbo en presente dentro de un relato en pasado («y de repente aparece…») para poner la escena delante de quien escucha.",
    },
    {
      termino: "Dicho o refrán",
      definicion:
        "Frase fija que la comunidad reconoce y que resume la enseñanza sin explicarla. No admite sinónimos: cambiarla es borrarla.",
    },
    {
      termino: "Discurso directo",
      definicion:
        "La voz del personaje dentro del relato. En la oralidad la marca la entonación; en el papel hacen falta comillas o guion.",
    },
    {
      termino: "Registro",
      definicion:
        "Manera de usar la lengua según la situación: no es lo mismo contar algo a alguien presente que escribirlo para un lector ausente.",
    },
  ],
  glosario: [
    {
      termino: "Narrativa popular",
      definicion: "Relato que nace de la cultura y la tradición de un pueblo o comunidad.",
    },
    {
      termino: "Oralidad",
      definicion: "Transmisión de relatos de boca en boca, sin estar escritos.",
    },
    {
      termino: "Mito",
      definicion: "Relato tradicional que explica el origen del mundo, dioses o fenómenos.",
    },
    {
      termino: "Leyenda",
      definicion: "Relato tradicional que mezcla hechos reales con elementos fantásticos.",
    },
    {
      termino: "Creepypasta",
      definicion: "Relato breve de terror que circula y se reescribe en internet.",
    },
    {
      termino: "Registro oral",
      definicion:
        "Manera de usar la lengua cuando se habla a alguien que está presente: fórmulas, repeticiones, diminutivos y la voz de los personajes sin comillas.",
    },
  ],
  aplicaciones: [
    "Juan Rulfo escribió toda su obra con sólo dos libros: El Llano en llamas (1953) y Pedro Páramo (1955). A pesar de su brevedad, su influencia en la narrativa latinoamericana es comparable a la de Borges. Gabriel García Márquez afirmó que Pedro Páramo le enseñó cómo se podía escribir.",
    "México reconoce 68 lenguas indígenas nacionales, con 364 variantes, según el Catálogo de las Lenguas Indígenas Nacionales del INALI (2008). Muchas de las palabras que usamos todos los días al contar una historia —milpa, tianguis, tecolote, elote— vienen de esas lenguas y están registradas en el diccionario del español.",
  ],
  fuente: "CEN Bachillerato — UAC Lengua y Comunicación II · progresión LC-II-P03",
};

/**
 * Ficha teórica — taller-descripcion-narracion (LC-II-P02).
 *
 * El marco teórico es VERBATIM de la lectura LC-II-P02-A1 («¿Cómo se construye
 * un texto narrativo?») y la aplicación es su callout «¿Sabías?», también
 * verbatim. El glosario es el de LC-II-P02-A5, más «Plan narrativo», que la
 * propia lectura A1 nombra y que el laboratorio pone a trabajar.
 *
 * Los `conceptos` son los que el alumno MANIPULA en los cuatro modos: el
 * detalle contra el adjetivo genérico, la ruta de la mirada, el suceso que
 * rompe la quietud, el conector temporal y el verbo comodín. Van aparte del
 * glosario a propósito: la Expedición usa una lista para el capítulo de
 * «Prepárate» y la otra para el de «Comprueba», y repetirlas dejaría los dos
 * capítulos diciendo lo mismo.
 */
import type { FichaTeoricaData } from "./_ficha";

export const DESCRIPCION_NARRACION_FICHA: FichaTeoricaData = {
  ancla: "LC-II-P02-A1 · ¿Cómo se construye un texto narrativo?",
  marcoTeorico: [
    "El texto narrativo es una de las formas más antiguas y universales de comunicación humana. Desde los relatos orales de comunidades indígenas hasta las novelas contemporáneas, narrar es organizar experiencias en el tiempo para que otro pueda comprenderlas y sentirlas.",
    "Toda narración se sostiene sobre una estructura básica compuesta por tres momentos: la situación inicial, el nudo y el desenlace. En la situación inicial se presentan los personajes, el tiempo y el espacio donde ocurrirá la historia. El nudo es el corazón de la narración: el conflicto o problema que pone en movimiento a los personajes y que genera tensión. El desenlace es la resolución de ese conflicto, ya sea de manera feliz, trágica o abierta, dejando al lector con una sensación de cierre o de reflexión.",
    "El narrador es la voz que cuenta la historia y su elección cambia radicalmente la forma en que el lector percibe los hechos. El narrador omnisciente lo sabe todo: conoce los pensamientos y sentimientos de todos los personajes y puede moverse libremente entre distintos momentos y lugares. El narrador en primera persona es un personaje dentro de la historia que cuenta desde su propia experiencia, lo que genera cercanía e intimidad pero limita la perspectiva. El narrador testigo observa los hechos desde fuera sin participar en ellos y sin acceso a los pensamientos ajenos, solo describe lo que ve.",
    "Para construir personajes creíbles es necesario combinar descripción física con rasgos psicológicos y motivaciones claras. Un personaje que quiere algo, que enfrenta obstáculos y que actúa de acuerdo con su historia personal resulta verosímil aunque viva en un mundo fantástico.",
    "Los conectores temporales son las bisagras del texto narrativo: organizan la secuencia de eventos y marcan la relación entre ellos. Expresiones como 'después', 'mientras tanto', 'al cabo de', 'en ese momento' y 'al día siguiente' guían al lector a través del tiempo de la historia y evitan que la narración se vuelva confusa o fragmentada.",
    "Escribir un texto narrativo propio implica tomar decisiones sobre todos estos elementos antes de empezar: ¿Quién narra? ¿Dónde y cuándo ocurre? ¿Cuál es el conflicto central? ¿Cómo se resolverá? Esas decisiones forman el plan narrativo, una brújula que guía la escritura y evita que el texto se pierda.",
  ],
  objetivos: [
    "Cambia seis adjetivos genéricos por un detalle concreto y observa cómo cambia la imagen que se forma el lector.",
    "Elige la ruta de la mirada de tres escenas y ordena sus fragmentos en coherencia con la ruta que elegiste.",
    "Convierte cinco descripciones quietas en sucesos y coloca cada uno con su conector temporal.",
    "Señala el verbo comodín que hunde cinco frases y sustitúyelo por uno preciso.",
    "Escribe de memoria los cinco términos del glosario de la progresión.",
    "Completa el texto sobre organizar las ideas y revisar el borrador.",
    "Aprueba el reto evaluable de la actividad LC-II-P02-A2.",
  ],
  materiales: [
    { nombre: "Banco de rellenos", detalle: "Seis frases con tres rellenos posibles cada una", icono: "fa-eye" },
    { nombre: "Mesa de montaje", detalle: "Tres escenas en fragmentos y dos rutas para ordenarlas", icono: "fa-arrow-down-wide-short" },
    { nombre: "Caja de conectores", detalle: "Los cinco conectores temporales de la lectura A1", icono: "fa-link" },
    { nombre: "Taller de verbos", detalle: "Cinco frases hundidas por un verbo comodín", icono: "fa-hammer" },
    { nombre: "Cuaderno del taller", detalle: "Espacio de escritura propia, opcional y sin calificación", icono: "fa-pen-nib" },
  ],
  conceptos: [
    {
      termino: "Detalle concreto",
      definicion:
        "Dato verificable por los sentidos —un material, un número, un olor— que permite al lector construir la imagen por su cuenta.",
    },
    {
      termino: "Adjetivo genérico",
      definicion:
        "Calificativo que cabe en cualquier cosa («bonito», «grande», «rico»): sube el volumen de la frase sin añadir información.",
    },
    {
      termino: "Juicio abstracto",
      definicion:
        "Conclusión del autor entregada como si fuera descripción; le quita al lector el trabajo de descubrirla y por eso no convence.",
    },
    {
      termino: "Ruta de la mirada",
      definicion:
        "Orden en que se revela una escena descrita: de lo general al detalle o al revés. Lo que se lee al final es lo que queda.",
    },
    {
      termino: "Suceso",
      definicion:
        "Cambio de estado que pone en movimiento lo descrito; es lo que distingue narrar de describir, porque introduce el tiempo.",
    },
    {
      termino: "Conector temporal",
      definicion:
        "Bisagra que sitúa un suceso respecto de otro: después, mientras tanto, al cabo de, en ese momento, al día siguiente.",
    },
    {
      termino: "Verbo comodín",
      definicion:
        "Verbo que sirve para todo —hacer, haber, estar, poner, tener— y que por eso no muestra la acción concreta que ocurre.",
    },
    {
      termino: "Narrador omnisciente",
      definicion:
        "Voz que conoce los pensamientos de todos los personajes y se mueve libremente entre momentos y lugares.",
    },
  ],
  glosario: [
    {
      termino: "Organización de ideas",
      definicion: "Ordenar lo que se va a escribir antes y durante la redacción.",
    },
    {
      termino: "Sentido comunicativo",
      definicion: "Propósito o intención con la que se escribe un texto.",
    },
    {
      termino: "Borrador",
      definicion: "Primera versión de un texto que luego se revisa y corrige.",
    },
    {
      termino: "Texto descriptivo",
      definicion: "Texto cuyo propósito es mostrar cómo son personas, lugares u objetos.",
    },
    {
      termino: "Texto narrativo",
      definicion: "Texto que relata hechos o sucesos en una secuencia temporal.",
    },
    {
      termino: "Plan narrativo",
      definicion:
        "Conjunto de decisiones tomadas antes de escribir —quién narra, dónde y cuándo ocurre, cuál es el conflicto y cómo se resuelve— que guía el texto y evita que se pierda.",
    },
  ],
  aplicaciones: [
    "Juan Rulfo escribió su cuento con un narrador en tercera persona; el padre que carga a su hijo nunca recibe un nombre propio. Esa ausencia de nombre refuerza la universalidad del dolor que describe: podría ser cualquier padre en cualquier lugar de México.",
  ],
  fuente: "CEN Bachillerato — UAC Lengua y Comunicación II · progresión LC-II-P02",
};

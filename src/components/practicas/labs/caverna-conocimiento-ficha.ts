/**
 * Datos de la Ficha Teórica del laboratorio "La caverna y el conocimiento"
 * (PFH-I-P06, progresión 6 de Pensamiento Filosófico y Humanidades I).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: lectura A1 «Conocimiento, Ciencia y Verdad» (3 párrafos).
 *   - Glosario: glosario interactivo A5 (5 términos).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, LECTURA_A1, FUENTE } from "./caverna-conocimiento-data";

export const CAVERNA_CONOCIMIENTO_FICHA: FichaTeoricaData = {
  ancla: "PFH-I · P06 · A1 — Conocimiento, Ciencia y Verdad",

  marcoTeorico: LECTURA_A1,

  objetivos: [
    "Explicar con la alegoría de la caverna por qué las apariencias no bastan para conocer.",
    "Comprobar que objetos distintos pueden proyectar la misma sombra y que su tamaño depende de la distancia a la luz.",
    "Distinguir las cuatro formas de conocimiento de Platón: eikasía, pístis, diánoia y nóesis.",
    "Reconocer cómo la percepción se engaña cuando parte de un supuesto falso, y cómo la razón y otro punto de vista la corrigen.",
    "Distinguir creencia, verdad y justificación, y clasificar las fuentes del conocimiento: percepción, razón, testimonio y autoridad.",
    "Diferenciar el conocimiento de un acierto por suerte (el reloj parado).",
  ],

  materiales: [
    { nombre: "Caverna con fuego, tabique y prisioneros", detalle: "La sombra es la proyección desde el fuego de cada punto de la figura sobre la pared.", icono: "fa-fire" },
    { nombre: "Cinco figuras de madera", detalle: "Cubo, cilindro, cono, esfera y pirámide de 60 cm, que se giran, inclinan y acercan al fuego.", icono: "fa-cubes" },
    { nombre: "Camino de salida", detalle: "Túnel empinado, estanque con reflejos y el Sol.", icono: "fa-sun" },
    { nombre: "Habitación de Ames", detalle: "Cuarto deformado que desde la mirilla parece rectangular; dos personas de 1.60 m y dos reglas.", icono: "fa-eye" },
    { nombre: "Escalera de la certeza", detalle: "Cuatro escalones de justificación, el portal del conocimiento y tres casos: censo, volado y reloj.", icono: "fa-stairs" },
  ],

  conceptos: [
    {
      termino: "Opinión (dóxa) y conocimiento (epistéme)",
      definicion: "Para Platón, la opinión se ocupa de lo que aparece y cambia; el conocimiento, de lo que se comprende con razones. Una opinión puede ser verdadera, pero sin razones no es conocimiento.",
    },
    {
      termino: "La alegoría de la caverna",
      definicion: "Prisioneros que solo ven sombras en una pared las toman por la realidad. Liberarse y subir hacia el Sol representa el paso de las apariencias al conocimiento (República VII, 514a–517c).",
    },
    {
      termino: "La línea dividida",
      definicion: "Cuatro grados de conocimiento: eikasía (imágenes), pístis (cosas visibles), diánoia (pensamiento con supuestos, como en geometría) y nóesis (comprensión de los principios). Los dos primeros son opinión (República VI, 509d–511e).",
    },
    {
      termino: "Una apariencia, muchas causas",
      definicion: "La sombra cuadrada puede venir de un cubo, de un cilindro visto de lado o de una pirámide vista por su base. Lo que se ve no determina por sí solo lo que hay.",
    },
    {
      termino: "Percepción y supuestos",
      definicion: "En la habitación de Ames el cerebro supone que el cuarto es rectangular; con ese supuesto, la persona más lejana parece más pequeña. Medir y mirar desde otro lugar corrige el error.",
    },
    {
      termino: "Creencia verdadera justificada",
      definicion: "Definición clásica de conocimiento: creer algo, que sea verdadero y tener buenas razones. El reloj parado (Russell, 1948) y los casos de Gettier (1963) muestran que quizá no basta si se acierta por suerte.",
    },
    {
      termino: "Fuentes del conocimiento",
      definicion: "Percepción (sentidos), razón (deducir y calcular), testimonio (lo que otros cuentan) y autoridad (expertos o instituciones en ESE tema, con métodos revisables). La emoción o el deseo no son fuentes de conocimiento.",
    },
    {
      termino: "Teorías de la verdad",
      definicion: "La lectura A1 plantea tres respuestas: verdad como correspondencia con los hechos, como coherencia con lo que ya sabemos y como utilidad.",
    },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: g.definicion })),

  aplicaciones: [
    "Antes de compartir un video viral, preguntar quién lo dice, con qué pruebas y con qué intención.",
    "Distinguir una autoridad real (INEGI para la población, Servicio Sismológico Nacional para los sismos) de alguien famoso que opina fuera de su tema.",
    "Desconfiar de una conclusión que coincide con lo que queremos creer: la posverdad aprovecha las emociones.",
    "En el arte y el cine, las perspectivas forzadas usan el mismo principio que la habitación de Ames.",
  ],

  fuente: FUENTE,
};

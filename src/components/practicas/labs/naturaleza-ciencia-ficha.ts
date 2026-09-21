/**
 * Datos de la Ficha Teórica del laboratorio "La ciencia como práctica
 * humana" (CNEYT-I-P01, progresión 1 de Ciencias Naturales, Experimentales y
 * Tecnología I).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: lectura A1 «Las ciencias: una práctica humana, no un
 *     conjunto de verdades absolutas» (4 párrafos).
 *   - Glosario: glosario interactivo A5 (5 términos).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, LECTURA_A1, FUENTE } from "./naturaleza-ciencia-data";

export const NATURALEZA_CIENCIA_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-I · P01 · A1 — Las ciencias: una práctica humana, no un conjunto de verdades absolutas",

  marcoTeorico: LECTURA_A1,

  objetivos: [
    "Explicar por qué el conocimiento científico es provisional y autocorrectivo.",
    "Evaluar un estudio como lo haría un revisor: tamaño de muestra, grupo de control, conflictos de interés y datos abiertos.",
    "Reconocer que la replicación independiente detecta errores que la revisión por pares dejó pasar.",
    "Distinguir una afirmación falsable de una que ningún dato podría refutar.",
    "Entender que superar una prueba no demuestra una hipótesis para siempre.",
    "Describir cómo cambió el consenso en dos casos reales: H. pylori y la deriva continental.",
  ],

  materiales: [
    { nombre: "Cuatro manuscritos de ejemplo", detalle: "Estudios didácticos con distintos defectos de diseño.", icono: "fa-file-lines" },
    { nombre: "Cinco laboratorios independientes", detalle: "Repiten cada estudio y reportan el efecto que miden.", icono: "fa-flask" },
    { nombre: "Barra de metal y comparador", detalle: "Aluminio, cobre o acero de 1 m calentados hasta 320 °C.", icono: "fa-gauge" },
    { nombre: "Olla y termómetro", detalle: "Agua hirviendo al nivel del mar, en la Ciudad de México, Toluca y el Pico de Orizaba.", icono: "fa-temperature-half" },
    { nombre: "Balanza de la evidencia", detalle: "Cada hito histórico pesa en el platillo de la idea que apoya.", icono: "fa-scale-balanced" },
  ],

  conceptos: [
    {
      termino: "Conocimiento provisional",
      definicion: "Las conclusiones científicas son las mejores disponibles con la evidencia actual y pueden corregirse si aparece evidencia nueva.",
    },
    {
      termino: "Criterios de un buen estudio",
      definicion: "Una muestra suficiente, un grupo de control, conflictos de interés declarados y datos y métodos disponibles para que otros puedan replicarlo.",
    },
    {
      termino: "Replicación independiente",
      definicion: "Otros equipos repiten el estudio. Si el efecto no aparece o es menor, el resultado se corrige o se retracta.",
    },
    {
      termino: "Asimetría de la falsación",
      definicion: "Ninguna cantidad de cisnes blancos demuestra que todos lo sean, pero un solo cisne negro basta para refutarlo.",
    },
    {
      termino: "Hipótesis ad hoc",
      definicion: "Una excusa añadida para salvar una idea de cada prueba (el dragón que flota, no da calor y no pesa); la vuelve irrefutable y, por eso, no científica.",
    },
    {
      termino: "Punto de ebullición y presión",
      definicion: "El agua hierve cuando su presión de vapor iguala la del aire. Con la altitud baja la presión y el agua hierve antes: unos 92 °C en la Ciudad de México.",
    },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: g.definicion })),

  aplicaciones: [
    "Las revistas científicas usan la revisión por pares antes de publicar un artículo.",
    "Las agencias sanitarias exigen varios ensayos clínicos independientes antes de aprobar un medicamento.",
    "Leer una noticia de salud preguntando cuántas personas participaron, si hubo grupo de control y quién pagó el estudio.",
    "En la cocina de la Ciudad de México los alimentos tardan más en cocerse porque el agua hierve a menos de 100 °C.",
  ],

  fuente: FUENTE,
};

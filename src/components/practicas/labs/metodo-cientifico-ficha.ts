/**
 * Datos de la Ficha Teórica del laboratorio "Método científico: el
 * experimento controlado y la medición" (CNEYT-I-P06, progresión 9 de Ciencias
 * Naturales, Experimentales y Tecnología I).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: lectura A1 «El método científico: cómo conocemos la
 *     naturaleza» (3 párrafos).
 *   - Glosario: glosario interactivo A5 (6 términos, reutilizados del archivo
 *     de datos).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, LECTURA_A1, FUENTE } from "./metodo-cientifico-data";

export const METODO_CIENTIFICO_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-I · P06 · A1 — El método científico: cómo conocemos la naturaleza",

  marcoTeorico: LECTURA_A1,

  objetivos: [
    "Recorrer los siete componentes del método científico en un experimento.",
    "Distinguir una hipótesis falsable de una que no puede ponerse a prueba.",
    "Identificar la variable independiente, la dependiente y las de control.",
    "Reconocer que un experimento sin controles no permite atribuir la causa.",
    "Explicar por qué las réplicas y la replicación hacen confiable un resultado.",
    "Leer un instrumento de medición con su incertidumbre y sus cifras significativas.",
    "Convertir unidades del SI multiplicando o dividiendo por potencias de 10.",
  ],

  materiales: [
    { nombre: "Tres grupos de plantas", detalle: "En macetas iguales, cada grupo bajo su propia lámpara.", icono: "fa-seedling" },
    { nombre: "Lámparas con temporizador", detalle: "De 0 a 16 horas de luz al día: la variable independiente.", icono: "fa-lightbulb" },
    { nombre: "Riego y termómetro", detalle: "El agua y la temperatura, las variables de control.", icono: "fa-droplet" },
    { nombre: "25 plantas de réplica", detalle: "Cinco por cada nivel de luz para ver la variación natural.", icono: "fa-table-cells" },
    { nombre: "Cinta, regla y vernier", detalle: "Tres instrumentos con resolución de 1 cm, 1 mm y 0.1 mm.", icono: "fa-ruler-combined" },
  ],

  conceptos: [
    {
      termino: "Experimento controlado",
      definicion: "Se cambia a propósito una sola variable (la independiente) y se mantienen iguales las demás (las de control), para que cualquier cambio en la dependiente se deba a ella.",
    },
    {
      termino: "Variable confusora",
      definicion: "Una variable que cambia junto con la independiente sin que el investigador lo controle. Si existe, no se sabe cuál de las dos causó el resultado.",
    },
    {
      termino: "Réplicas y variación",
      definicion: "Repetir la medición con varias muestras permite calcular el promedio x̄ y la desviación s; una diferencia menor que la variación puede deberse al azar.",
    },
    {
      termino: "Replicación",
      definicion: "Otro equipo repite el experimento completo con materiales nuevos. Si obtiene la misma conclusión, el resultado es más confiable.",
    },
    {
      termino: "Resolución e incertidumbre",
      definicion: "La marca más pequeña que distingue un instrumento fija su incertidumbre: una regla con marcas de milímetro mide ±1 mm.",
    },
    {
      termino: "Conversión en el SI",
      definicion: "1 m = 100 cm = 1000 mm: para pasar de metros a centímetros se multiplica por 100 y a milímetros por 1000.",
    },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: g.definicion })),

  aplicaciones: [
    "Los ensayos agrícolas prueban fertilizantes o variedades de semilla en parcelas con las mismas condiciones de riego y suelo.",
    "Los ensayos clínicos comparan un medicamento con un placebo en grupos iguales para aislar su efecto.",
    "Los laboratorios de metrología calibran instrumentos para conocer su incertidumbre.",
    "En la cocina o en un taller, medir con el instrumento adecuado evita errores de corte, dosis o ajuste.",
  ],

  fuente: FUENTE,
};

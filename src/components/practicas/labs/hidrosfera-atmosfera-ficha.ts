/**
 * Datos de la Ficha Teórica del laboratorio "Hidrósfera y atmósfera: capas,
 * composición e intercambio" (CNEYT-III, progresión 2; actividades
 * CNEYT-III-P10).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: lectura A1 «Aire y agua: las capas y la química de la
 *     atmósfera y la hidrósfera» (6 párrafos).
 *   - Glosario: glosario interactivo A5 (10 términos).
 *
 * Los conceptos centrales, materiales y aplicaciones describen los modelos del
 * laboratorio (no son verbatim).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, LECTURA_A1, FUENTE, Z_RUPTURA, num } from "./hidrosfera-atmosfera-data";

export const HIDROSFERA_ATMOSFERA_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-III · P10 · A1 — Aire y agua: las capas y la química de la atmósfera y la hidrósfera",

  marcoTeorico: LECTURA_A1,

  objetivos: [
    "Describir las capas de la atmósfera por la forma en que cambia la temperatura con la altura.",
    "Explicar con la presión atmosférica por qué el agua hierve a menos de 100 °C en lugares altos.",
    "Relacionar la composición del aire con la cantidad de moléculas de oxígeno disponibles a cada altura.",
    "Explicar la estratificación del océano por densidad: termoclina, haloclina y picnoclina.",
    "Aplicar la densidad para predecir si el hielo o una masa de agua flota, se hunde o se estaciona en una capa.",
    "Seguir el ciclo del agua como cambios de estado: evaporación, condensación y precipitación, con el calor latente que implican.",
    "Distinguir el tiempo atmosférico del clima.",
  ],

  materiales: [
    { nombre: "Columna de atmósfera de 120 km", detalle: "Temperatura, presión y densidad de la Atmósfera Estándar de EUA (1976).", icono: "fa-cloud-arrow-up" },
    { nombre: "Globo sonda con radiosonda", detalle: `Globo de látex de 1.8 m que sube a 5 m/s y revienta a unos ${num(Z_RUPTURA, 0)} km al llegar a 8 m de diámetro.`, icono: "fa-temperature-arrow-down" },
    { nombre: "Buque oceanográfico y sensor CTD", detalle: "Mide conductividad (salinidad), temperatura y profundidad hasta 4 000 m.", icono: "fa-ship" },
    { nombre: "Masas de agua y bloque de hielo", detalle: "Agua de río, superficial tropical, intermedia antártica, helada y salada, o la que tú ajustes.", icono: "fa-cubes-stacked" },
    { nombre: "Parcela de aire del Golfo de México", detalle: "Sube la Sierra Madre Oriental de Veracruz a Perote, pasando por Xalapa.", icono: "fa-wind" },
  ],

  conceptos: [
    {
      termino: "Presión y altura",
      definicion: "La presión es el peso de la columna de aire que queda encima. Baja a la mitad cada 5.5 km, aproximadamente: 101 kPa al nivel del mar, 77 kPa en la Ciudad de México y 50 kPa en el Pico de Orizaba.",
    },
    {
      termino: "Punto de ebullición",
      definicion: "El agua hierve cuando su presión de vapor iguala la presión del aire. Con menos presión hierve a menor temperatura: unos 92 °C en la Ciudad de México y 37 °C a 19 km (límite de Armstrong).",
    },
    {
      termino: "Inversión térmica de la estratósfera",
      definicion: "El ozono absorbe la radiación ultravioleta del Sol y calienta el aire: la temperatura sube de unos −56 °C en la tropopausa a unos −2.5 °C cerca de 47 km.",
    },
    {
      termino: "Termoclina, haloclina y picnoclina",
      definicion: "Zonas del océano donde la temperatura (termoclina) o la salinidad (haloclina) cambian rápido con la profundidad. Ambas producen un cambio brusco de densidad: la picnoclina, que separa el agua superficial del agua profunda.",
    },
    {
      termino: "Densidad del agua de mar",
      definicion: "Aumenta al bajar la temperatura y al subir la salinidad: el agua de mar tropical a 29 °C tiene unos 1 023 kg/m³ y el agua helada y salada del fondo unos 1 028 kg/m³. El hielo (917 kg/m³) flota con cerca del 90 % de su volumen sumergido.",
    },
    {
      termino: "Nivel de condensación",
      definicion: "Al subir, el aire se expande y se enfría unos 9.8 °C por kilómetro. Donde alcanza su punto de rocío, el vapor se condensa y nace la base de la nube.",
    },
    {
      termino: "Calor latente",
      definicion: "Evaporar 1 kg de agua requiere unos 2.45 MJ; al condensarse en la nube, esa energía se devuelve al aire. Por eso el aire saturado se enfría más despacio (≈ 4–7 °C por km) y baja más cálido del otro lado de la sierra.",
    },
    {
      termino: "Sombra orográfica",
      definicion: "La ladera que recibe el viento húmedo (barlovento) se nubla y recibe lluvia; la del otro lado (sotavento) recibe aire que ya perdió su vapor y es más seca.",
    },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: g.definicion })),

  aplicaciones: [
    "Los servicios meteorológicos del mundo, entre ellos el Servicio Meteorológico Nacional de México, lanzan globos sonda a diario para medir la atmósfera y alimentar los pronósticos.",
    "Las ollas de presión cuecen más rápido en la Ciudad de México porque suben la presión y con ella el punto de ebullición.",
    "Los buques oceanográficos, como el B/O Justo Sierra y el B/O El Puma de la UNAM, bajan sensores CTD para estudiar las capas del Golfo de México y del Pacífico.",
    "La Sierra Madre Oriental explica por qué Xalapa es húmeda y Perote semiárida, a unos 50 km de distancia.",
  ],

  fuente: FUENTE,
};

/**
 * Datos de la Ficha Teórica del laboratorio "El origen de la vida"
 * (CNEYT-VI-P01).
 *
 * Contenido VERBATIM de las actividades ancla de la progresión:
 *   - Marco teórico: lectura A1 «El origen de la vida: hipótesis científicas»
 *     (párrafos verbatim, slug=origen-vida-3d).
 *   - Glosario: glosario interactivo A5 «Glosario — Origen de la vida e
 *     hipótesis abióticas».
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const ORIGEN_VIDA_FICHA: FichaTeoricaData = {
  ancla: "Anclado a la actividad A1: El origen de la vida — hipótesis científicas",

  // Marco teórico — VERBATIM de la lectura A1 (dividido en párrafos).
  marcoTeorico: [
    "Las hipótesis abióticas sobre el origen de la vida proponen que moléculas orgánicas complejas surgieron de compuestos inorgánicos en condiciones primitivas de la Tierra.",
    "La hipótesis del caldo primordial de Oparin y Haldane (1920s) sugiere que la atmósfera primitiva (CH4, NH3, H2O, H2) y la energía de rayos y volcanes permitieron la síntesis de moléculas orgánicas en los océanos. En 1953, Stanley Miller y Harold Urey simularon estas condiciones en laboratorio y obtuvieron aminoácidos, validando experimentalmente que los bloques de la vida pueden formarse abioticamente.",
    "La hipótesis de los ventiladeros hidrotermales propone que las chimeneas submarinas, ricas en minerales y con gradientes de temperatura y pH, fueron el ambiente donde surgieron las primeras biomoléculas y membranas. Esta hipótesis es hoy muy respaldada porque no requiere una atmósfera reductora.",
    "La hipótesis del Mundo ARN plantea que el ARN fue la primera molécula de la vida, capaz tanto de almacenar información genética como de catalizar reacciones (ribozimas). Esto resuelve el dilema del huevo y la gallina entre ADN y proteínas.",
    "Finalmente, la panspermia sugiere que moléculas orgánicas o incluso microorganismos llegaron a la Tierra desde el espacio, en meteoritos. El meteorito de Murchison (1969) contenía aminoácidos extraterrestres. Esta hipótesis traslada el problema pero no lo elimina: ¿cómo surgió la vida en ese origen externo?",
  ],

  // Derivados del propósito de CNEYT-VI-P01.
  objetivos: [
    "Analizar las interacciones entre materia y energía de la Tierra primitiva que hicieron posible la síntesis abiótica de moléculas orgánicas.",
    "Comprender la teoría quimiosintética del origen de la vida y reconstruir el experimento de Miller-Urey (1953).",
    "Distinguir las principales hipótesis abióticas: caldo primordial, ventiladeros hidrotermales, mundo de ARN y panspermia.",
    "Resolver el quiz «Origen de la vida» de la actividad A2.",
  ],

  materiales: [
    { nombre: "Escena 3D interactiva", detalle: "Aparato de Miller-Urey, ambientes candidatos y mundo de ARN", icono: "fa-flask-vial" },
    { nombre: "Control de descarga eléctrica", detalle: "Enciende o apaga la chispa para comprobar que sin energía no hay síntesis", icono: "fa-bolt" },
    { nombre: "Línea de tiempo del experimento", detalle: "Avance por días: la acumulación de aminoácidos en la trampa", icono: "fa-stopwatch" },
    { nombre: "Glosario e hipótesis", detalle: "Términos y evidencias verbatim de la lectura A1 y el glosario A5", icono: "fa-book" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1 (verbatim).
  conceptos: [
    { termino: "Hipótesis abióticas", definicion: "Proponen que moléculas orgánicas complejas surgieron de compuestos inorgánicos en condiciones primitivas de la Tierra." },
    { termino: "Caldo primordial (Oparin-Haldane)", definicion: "La atmósfera primitiva (CH4, NH3, H2O, H2) y la energía de rayos y volcanes permitieron la síntesis de moléculas orgánicas en los océanos." },
    { termino: "Experimento de Miller-Urey (1953)", definicion: "Stanley Miller y Harold Urey simularon estas condiciones en laboratorio y obtuvieron aminoácidos, validando experimentalmente que los bloques de la vida pueden formarse abioticamente." },
    { termino: "Ventiladeros hidrotermales", definicion: "Las chimeneas submarinas, ricas en minerales y con gradientes de temperatura y pH, fueron el ambiente donde surgieron las primeras biomoléculas y membranas; no requieren una atmósfera reductora." },
    { termino: "Mundo ARN", definicion: "El ARN fue la primera molécula de la vida, capaz tanto de almacenar información genética como de catalizar reacciones (ribozimas), resolviendo el dilema entre ADN y proteínas." },
    { termino: "Panspermia", definicion: "Moléculas orgánicas o incluso microorganismos llegaron a la Tierra desde el espacio, en meteoritos. El meteorito de Murchison (1969) contenía aminoácidos extraterrestres." },
  ],

  // Glosario — VERBATIM del glosario interactivo A5 de P01.
  glosario: [
    { termino: "Generación espontánea (refutada)", definicion: "Teoría antigua que afirmaba que los seres vivos podían surgir directamente de materia inerte sin progenitores. Refutada definitivamente por Louis Pasteur en 1859 con sus matraces de cuello de cisne." },
    { termino: "Hipótesis de Oparin-Haldane (sopa primordial)", definicion: "Propone que en la Tierra primitiva (hace ~4000 millones de años), la atmósfera sin oxígeno libre y con H₂, CH₄, NH₃ y H₂O permitió la síntesis abiótica de moléculas orgánicas que se acumularon en los océanos formando una 'sopa primordial'." },
    { termino: "Experimento de Miller-Urey (1953)", definicion: "Stanley Miller y Harold Urey simularon la atmósfera primitiva (CH₄, NH₃, H₂, H₂O) y aplicaron descargas eléctricas. Tras una semana obtuvieron más de 20 aminoácidos distintos, confirmando la síntesis abiótica de moléculas orgánicas." },
    { termino: "Coacervados y protocélulas", definicion: "Los coacervados son agregados esféricos de polímeros en solución acuosa que pueden concentrar moléculas y llevar a cabo reacciones sencillas. Representan un modelo de protocélula: estructura precelular que precedió a las células verdaderas." },
    { termino: "Hipótesis del mundo de ARN", definicion: "Postula que en el origen de la vida el ARN actuó tanto como molécula de almacenamiento de información (como el ADN hoy) y como catalizador (como las proteínas). Las ribozimas (ARN catalítico) son evidencia de esa capacidad dual." },
    { termino: "Panspermia", definicion: "Hipótesis que propone que la vida o sus precursores orgánicos llegaron a la Tierra desde el espacio exterior a través de meteoritos, cometas o polvo cósmico. No explica el origen último de la vida, solo su llegada." },
  ],

  aplicaciones: [
    "México es uno de los 17 países megadiversos del planeta según la CONABIO (Comisión Nacional para el Conocimiento y Uso de la Biodiversidad). Alberga el 10% de las especies conocidas en la Tierra, con más de 200,000 especies registradas en su territorio: el mayor número en el mundo en relación a su extensión.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — CNEYT-VI. Ref: Campbell, Biología (12a ed.); Miller & Urey, Science 1953.",
};

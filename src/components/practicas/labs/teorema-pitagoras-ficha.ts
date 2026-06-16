/**
 * Datos de la Ficha Teórica del laboratorio del Teorema de Pitágoras (PM-III-P01).
 *
 * Contenido VERBATIM de la actividad ancla A1 «El Teorema de Pitágoras:
 * demostración y aplicaciones» (lectura). El glosario proviene de la actividad
 * A5 «Glosario — Teorema de Pitágoras» (glosario_interactivo), también verbatim.
 * El reto evaluable vive en teorema-pitagoras-data.ts (A2).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const PITAGORAS_FICHA: FichaTeoricaData = {
  ancla: "PM-III · P01 · A1 — El Teorema de Pitágoras: demostración y aplicaciones",

  // Marco teórico — VERBATIM de la lectura A1 (PM-III-P01-A1).
  marcoTeorico: [
    "El Teorema de Pitágoras es uno de los resultados más importantes y bellos de la geometría. Establece que en todo triángulo rectángulo la suma de los cuadrados de los catetos es igual al cuadrado de la hipotenusa: a² + b² = c², donde c es la hipotenusa (el lado opuesto al ángulo recto).",
    "La demostración más sencilla utiliza cuatro triángulos rectángulos iguales. Si los organizamos dentro de un cuadrado de lado (a+b), notamos que el área total del cuadrado grande puede calcularse de dos formas: como (a+b)² o como c² más el área de los cuatro triángulos (4 × ab/2 = 2ab). Al igualar: a² + 2ab + b² = c² + 2ab, lo que nos da directamente a² + b² = c².",
    "Los triples pitagóricos son conjuntos de tres enteros positivos que satisfacen la relación: 3-4-5 (9+16=25), 5-12-13 (25+144=169) y 8-15-17 son los más conocidos. Cualquier múltiplo de un triple pitagórico también lo es: 6-8-10, 9-12-15, etc.",
    "Las aplicaciones del teorema son enormes. En construcción, se usa para verificar que los ángulos sean rectos (los albañiles estiran una cuerda con nudos en las proporciones 3-4-5). En navegación y GPS, se calcula la distancia entre dos puntos. En topografía, se mide la altura de montañas o edificios sin llegar hasta ellos. En arquitectura e ingeniería, está en cada diseño que involucre ángulos rectos y diagonales.",
  ],

  objetivos: [
    "Enunciar y comprender el Teorema de Pitágoras (a² + b² = c²).",
    "Calcular la hipotenusa o un cateto desconocido aplicando el teorema.",
    "Identificar y verificar triples pitagóricos como (3,4,5) y (5,12,13).",
    "Aplicar el Teorema de Pitágoras para calcular distancias en problemas reales.",
    "Resolver el reto evaluable de la actividad A2 (rampa y sombra diagonal).",
  ],

  materiales: [
    { nombre: "Triángulo rectángulo 3D", detalle: "Construye cuadrados sobre cada lado y visualiza a² + b² = c²", icono: "fa-ruler-combined" },
    { nombre: "Deslizadores de catetos", detalle: "Ajusta a y b para explorar ternas pitagóricas y casos con decimales", icono: "fa-sliders" },
    { nombre: "Situaciones reales", detalle: "Rampa, escalera, diagonal, papalote y más", icono: "fa-person-walking" },
    { nombre: "Marcador en vivo", detalle: "Muestra a², b² y c² actualizados en tiempo real", icono: "fa-calculator" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Teorema de Pitágoras", definicion: "En todo triángulo rectángulo, la suma de los cuadrados de los catetos es igual al cuadrado de la hipotenusa: a² + b² = c²." },
    { termino: "Hipotenusa (c)", definicion: "El lado más largo del triángulo rectángulo; el lado opuesto al ángulo de 90°." },
    { termino: "Cateto (a, b)", definicion: "Cada uno de los dos lados que forman el ángulo recto en un triángulo rectángulo." },
    { termino: "Triple pitagórico", definicion: "Conjunto de tres enteros positivos (a, b, c) que satisfacen a² + b² = c². Ejemplos: 3-4-5, 5-12-13, 8-15-17." },
    { termino: "Recíproco del Teorema de Pitágoras", definicion: "Si los lados a, b, c de un triángulo cumplen a² + b² = c², entonces el triángulo es rectángulo." },
    { termino: "Aplicación: distancia entre puntos", definicion: "La distancia entre dos puntos (x₁, y₁) y (x₂, y₂) en el plano se obtiene con el Teorema de Pitágoras: d = √((x₂−x₁)² + (y₂−y₁)²)." },
  ],

  // Glosario — VERBATIM de A5 «Glosario — Teorema de Pitágoras» (glosario_interactivo).
  glosario: [
    { termino: "Teorema de Pitágoras", definicion: "En todo triángulo rectángulo, la suma de los cuadrados de los catetos es igual al cuadrado de la hipotenusa: a² + b² = c²." },
    { termino: "Hipotenusa", definicion: "El lado más largo del triángulo rectángulo; el lado opuesto al ángulo de 90°." },
    { termino: "Cateto", definicion: "Cada uno de los dos lados que forman el ángulo recto en un triángulo rectángulo." },
    { termino: "Triple pitagórico", definicion: "Conjunto de tres enteros positivos (a, b, c) que satisfacen a² + b² = c²." },
    { termino: "Recíproco del Teorema de Pitágoras", definicion: "Si los lados a, b, c de un triángulo cumplen a² + b² = c², entonces el triángulo es rectángulo." },
    { termino: "Aplicación: distancia entre puntos", definicion: "La distancia entre dos puntos (x₁, y₁) y (x₂, y₂) en el plano se obtiene con el Teorema de Pitágoras: d = √((x₂−x₁)² + (y₂−y₁)²)." },
  ],

  aplicaciones: [
    "En construcción, para verificar que los ángulos sean rectos (los albañiles estiran una cuerda con nudos en las proporciones 3-4-5).",
    "En navegación y GPS, para calcular la distancia entre dos puntos.",
    "En topografía, para medir la altura de montañas o edificios sin llegar hasta ellos.",
    "En arquitectura e ingeniería, en cada diseño que involucre ángulos rectos y diagonales.",
    "En ingeniería civil, para verificar rampas de acceso y calcular longitudes inclinadas.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1 y Glosario A5, PM-III-P01.",
};

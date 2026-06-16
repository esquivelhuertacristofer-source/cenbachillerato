/**
 * Datos de la Ficha Teórica del laboratorio de Entropía y leyes de la
 * termodinámica.
 *
 * Contenido VERBATIM de las actividades ancla de CNEYT-II-P10:
 *   - Marco teórico: lectura A1 «Entropía, entalpía y leyes de la
 *     termodinámica» (4 párrafos verbatim).
 *   - Glosario: glosario interactivo A5 «Glosario: entalpía, entropía y leyes».
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const ENTROPIA_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-II · P10 · A1 — Entropía, entalpía y leyes de la termodinámica",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "La primera ley de la termodinámica nos dice que la energía se conserva, y tiene muchas aplicaciones: explica el funcionamiento de las máquinas térmicas y los motores, que transforman calor en trabajo. Pero la primera ley no lo explica todo; por ejemplo, no dice por qué el calor fluye siempre de lo caliente a lo frío y nunca al revés por sí solo. Para eso necesitamos otros conceptos y leyes.",
    "La entalpía (H = U + PV) es una magnitud útil para medir el calor intercambiado por un sistema a presión constante, como ocurre en muchas reacciones químicas al aire libre. Cuando un proceso libera calor al entorno se llama exotérmico (por ejemplo, una combustión); cuando un proceso absorbe calor del entorno se llama endotérmico (por ejemplo, disolver ciertas sales que enfrían el agua).",
    "La entropía (S) es una medida del desorden de un sistema o, dicho con más precisión, de la dispersión de la energía. En la naturaleza, los sistemas tienden a evolucionar hacia estados de mayor entropía. La segunda ley de la termodinámica establece que, en todo proceso espontáneo, la entropía total del universo aumenta. De ahí se deducen hechos cotidianos: el calor fluye espontáneamente de los cuerpos calientes a los fríos, y ninguna máquina térmica puede ser 100% eficiente, porque siempre se 'pierde' algo de energía en forma de calor disperso.",
    "La tercera ley de la termodinámica afirma que la entropía de un cristal perfecto en el cero absoluto es cero. El cero absoluto es la temperatura más baja posible: 0 K, equivalente a −273.15 °C. Además, la tercera ley implica que el cero absoluto es inalcanzable: podemos acercarnos mucho, pero nunca llegar exactamente a él. Juntas, estas leyes explican por qué la energía, aunque se conserve, se vuelve cada vez menos aprovechable.",
  ],

  objetivos: [
    "Distinguir un proceso exotérmico (libera calor) de uno endotérmico (absorbe calor) y comprender la entalpía.",
    "Explicar la entropía (S) como medida del desorden o dispersión de la energía.",
    "Enunciar la segunda ley: en todo proceso espontáneo la entropía total del universo aumenta.",
    "Reconocer la tercera ley y el cero absoluto (0 K = −273.15 °C) como inalcanzable.",
    "Resolver el reto evaluable de opción múltiple de la práctica.",
  ],

  materiales: [
    { nombre: "Visor 3D de procesos", detalle: "Muestra la mezcla de gases, el flujo de calor y el cristal cerca de 0 K", icono: "fa-shuffle" },
    { nombre: "Barra de entropía", detalle: "Indica si la entropía del sistema sube o baja en cada proceso", icono: "fa-chart-simple" },
    { nombre: "Deslizador de temperatura", detalle: "Enfría el cristal hacia el cero absoluto en kelvin y grados Celsius", icono: "fa-temperature-half" },
    { nombre: "Tablero de leyes", detalle: "Las tres leyes de la termodinámica y la entalpía exo/endotérmica", icono: "fa-scroll" },
  ],

  // Conceptos centrales del lab — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Primera ley", definicion: "La energía se conserva. Explica las máquinas térmicas, pero no dice por qué los procesos ocurren en un solo sentido." },
    { termino: "Entalpía (H = U + PV)", definicion: "Magnitud que mide el calor intercambiado a presión constante. Exotérmico libera calor; endotérmico lo absorbe." },
    { termino: "Entropía (S)", definicion: "Medida del desorden o dispersión de la energía. Los sistemas tienden a evolucionar hacia estados de mayor entropía." },
    { termino: "Segunda ley", definicion: "En todo proceso espontáneo la entropía total del universo aumenta: el calor fluye de lo caliente a lo frío y ninguna máquina térmica es 100% eficiente." },
    { termino: "Tercera ley y cero absoluto", definicion: "La entropía de un cristal perfecto en el cero absoluto es cero. El cero absoluto (0 K = −273.15 °C) es la temperatura más baja posible e inalcanzable." },
  ],

  // Glosario — VERBATIM del glosario interactivo A5 de P10.
  glosario: [
    { termino: "Entalpía (H)", definicion: "Magnitud que mide el calor intercambiado a presión constante; H = U + PV." },
    { termino: "Proceso exotérmico", definicion: "Proceso que libera calor al entorno." },
    { termino: "Proceso endotérmico", definicion: "Proceso que absorbe calor del entorno." },
    { termino: "Entropía (S)", definicion: "Medida del desorden de un sistema o de la dispersión de la energía; tiende a aumentar." },
    { termino: "Segunda ley", definicion: "En todo proceso espontáneo la entropía total del universo aumenta; el calor fluye de lo caliente a lo frío." },
    { termino: "Cero absoluto", definicion: "Temperatura más baja posible: 0 K = −273.15 °C; es inalcanzable." },
  ],

  aplicaciones: [
    "El calor fluye espontáneamente de los cuerpos calientes a los fríos: por eso un café caliente se enfría y nunca se calienta solo.",
    "Ninguna máquina térmica ni motor puede ser 100% eficiente, porque siempre se dispersa algo de energía como calor.",
    "Los laboratorios de bajas temperaturas pueden acercarse mucho al cero absoluto, pero nunca alcanzarlo exactamente.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1, CNEYT-II-P10.",
};

/**
 * Datos de la Ficha Teórica del laboratorio de Gas ideal y primera ley.
 *
 * Contenido VERBATIM de las actividades ancla de CNEYT-II-P09:
 *   - Marco teórico: lectura A1 «Gas ideal y primera ley de la termodinámica»
 *     (4 párrafos verbatim).
 *   - Glosario: glosario interactivo A5 «Glosario: termodinámica básica».
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const GAS_IDEAL_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-II · P09 · A1 — Gas ideal y primera ley de la termodinámica",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "La termodinámica estudia cómo se transfiere y transforma la energía en forma de calor y trabajo. Para estudiarla, primero delimitamos un sistema termodinámico: la porción del universo que nos interesa, separada del entorno por fronteras. Según lo que puede atravesar esas fronteras, el sistema es abierto (intercambia materia y energía con el entorno, como una olla destapada), cerrado (intercambia solo energía, no materia, como una olla con tapa) o aislado (no intercambia ni materia ni energía, como un termo ideal).",
    "El estado de un sistema gaseoso se describe con sus variables de estado: la presión P, el volumen V, la temperatura T y la cantidad de sustancia n (en moles). El principio cero de la termodinámica afirma que, si dos sistemas están en equilibrio térmico con un tercero, entonces están en equilibrio térmico entre sí; este principio es el que da sentido al concepto de temperatura y al uso del termómetro.",
    "Un gas ideal es un modelo en el que se supone que las partículas no interactúan entre sí (salvo en choques) y que su volumen propio es despreciable. Su comportamiento se resume en la ecuación de estado PV = nRT, donde R es la constante universal de los gases (R = 8.314 J/mol·K). Este modelo describe muy bien a los gases reales a baja presión y alta temperatura.",
    "El calor y el trabajo son formas de transferir energía. Gracias al experimento de Joule sabemos que el trabajo mecánico puede producir calor (por ejemplo, la fricción), y que existe una equivalencia entre ambas medidas de energía: 1 caloría = 4.184 J. La primera ley de la termodinámica es la conservación de la energía aplicada a estos sistemas: ΔU = Q − W. Significa que el cambio en la energía interna del sistema (ΔU) es igual al calor que entra al sistema (Q) menos el trabajo que el sistema realiza sobre el entorno (W). La energía no se crea ni se destruye: solo cambia de forma o se transfiere.",
  ],

  objetivos: [
    "Distinguir los sistemas termodinámicos abierto, cerrado y aislado según lo que atraviesa sus fronteras.",
    "Identificar las variables de estado de un gas: presión P, volumen V, temperatura T y cantidad de sustancia n.",
    "Usar la ecuación de estado del gas ideal PV = nRT y reconocer la constante R = 8.314 J/mol·K.",
    "Explicar la primera ley de la termodinámica (ΔU = Q − W) como la conservación de la energía.",
    "Resolver el reto evaluable de opción múltiple de la actividad A2.",
  ],

  materiales: [
    { nombre: "Cilindro con pistón 3D", detalle: "Un gas encerrado como sistema cerrado, con partículas que chocan contra las paredes", icono: "fa-wind" },
    { nombre: "Controles de estado", detalle: "Temperatura (T), volumen (V) y cantidad de sustancia (n) ajustables", icono: "fa-sliders" },
    { nombre: "Lectura de presión", detalle: "La presión P calculada en vivo con PV = nRT (kPa y atm)", icono: "fa-gauge-high" },
    { nombre: "Lectura de energía interna", detalle: "La energía interna U del gas y la primera ley ΔU = Q − W", icono: "fa-fire-flame-curved" },
  ],

  // Conceptos centrales del lab — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Sistema termodinámico", definicion: "La porción del universo que se estudia, separada del entorno por fronteras. Es abierto (intercambia materia y energía), cerrado (solo energía) o aislado (ni materia ni energía)." },
    { termino: "Variables de estado", definicion: "Las magnitudes que describen el estado de un gas: presión P, volumen V, temperatura T y cantidad de sustancia n (en moles)." },
    { termino: "Gas ideal", definicion: "Modelo en el que las partículas no interactúan entre sí (salvo en choques) y su volumen propio es despreciable. Cumple PV = nRT y describe bien a los gases reales a baja presión y alta temperatura." },
    { termino: "Equivalencia calor-trabajo", definicion: "Gracias al experimento de Joule sabemos que el trabajo mecánico puede producir calor y que 1 caloría = 4.184 J." },
    { termino: "Primera ley de la termodinámica", definicion: "Conservación de la energía aplicada a estos sistemas: ΔU = Q − W. El cambio de energía interna es el calor que entra menos el trabajo que el sistema realiza." },
  ],

  // Glosario — VERBATIM del glosario interactivo A5 de P09.
  glosario: [
    { termino: "Sistema termodinámico", definicion: "Porción del universo que se estudia, delimitada del entorno por fronteras." },
    { termino: "Variables de estado", definicion: "Magnitudes que describen el estado de un sistema: presión, volumen, temperatura y cantidad de sustancia." },
    { termino: "Principio cero", definicion: "Si dos sistemas están en equilibrio térmico con un tercero, lo están entre sí; fundamenta la temperatura." },
    { termino: "Gas ideal", definicion: "Modelo de gas cuyas partículas no interactúan y cumple la ecuación PV = nRT." },
    { termino: "Energía interna (U)", definicion: "Energía total contenida en un sistema, asociada al movimiento y a las interacciones de sus partículas." },
    { termino: "Primera ley", definicion: "Conservación de la energía en termodinámica: ΔU = Q − W." },
  ],

  aplicaciones: [
    "El motor de un coche transforma el calor de la combustión en trabajo mecánico: es la primera ley en acción.",
    "Una olla a presión es un sistema cerrado donde el calor que entra eleva la temperatura y la presión del vapor.",
    "El termo mantiene la bebida caliente porque se aproxima a un sistema aislado: casi no intercambia energía con el entorno.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1, CNEYT-II-P09.",
};

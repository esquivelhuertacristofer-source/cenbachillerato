/**
 * Datos de la Ficha Teórica del laboratorio de Energía y electricidad.
 *
 * Contenido VERBATIM de las actividades ancla de CNEYT-I-P11:
 *   - Marco teórico: lectura A1 «Energía, partículas y electricidad» (5 párrafos verbatim).
 *   - Glosario: glosario interactivo A5 «Glosario — Energía, partículas y electricidad».
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const ENERGIA_ELECTRICIDAD_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-I · P11 · A1 — Energía, partículas y electricidad",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "La materia tiene una doble naturaleza: es CORPUSCULAR (está hecha de partículas: átomos, iones, electrones) y a la vez está ligada a la ENERGÍA. De hecho, materia y energía están profundamente relacionadas: las partículas se mueven, vibran e interactúan, y en esas interacciones hay energía.",
    "Una de las manifestaciones más importantes de esta relación es la ACTIVIDAD ELÉCTRICA. Los electrones tienen CARGA ELÉCTRICA negativa y los protones positiva. Cargas iguales se repelen y cargas opuestas se atraen. Cuando los electrones se mueven de forma ordenada a través de un material, hay una CORRIENTE ELÉCTRICA.",
    "No todos los materiales dejan pasar la corriente igual:\n• CONDUCTORES: permiten el paso de la corriente porque tienen electrones libres. Los metales (cobre, aluminio) son buenos conductores; por eso los cables son de metal.\n• AISLANTES: casi no dejan pasar la corriente (plástico, vidrio, madera seca). Por eso los cables se forran de plástico.\n• SEMICONDUCTORES: conducen en condiciones controladas (como el silicio). Son la base de los chips, las computadoras y los celulares.",
    "Esta relación entre partículas y energía explica TECNOLOGÍAS que usas a diario: las pilas y baterías guardan energía química y la convierten en eléctrica; los focos convierten energía eléctrica en luz y calor; los paneles solares convierten la energía de la luz en electricidad. Entender la materia como partículas con energía te permite comprender —y cuidar— el uso de la energía en tu vida.",
  ],

  objetivos: [
    "Explicar la doble naturaleza corpuscular y energética de la materia.",
    "Relacionar el movimiento ordenado de electrones con la corriente eléctrica.",
    "Distinguir conductores, aislantes y semiconductores con ejemplos reales.",
    "Identificar transformaciones de energía en tecnologías cotidianas (pila, foco, panel solar).",
    "Resolver el quiz de energía y electricidad de la práctica.",
  ],

  materiales: [
    { nombre: "Circuito 3D interactivo", detalle: "Pila, interruptor, conductor intercambiable y foco", icono: "fa-bolt" },
    { nombre: "Selector de voltaje", detalle: "4 niveles (1.5 V, 4.5 V, 9 V, 12 V) para explorar P = V·I", icono: "fa-car-battery" },
    { nombre: "Materiales del circuito", detalle: "Cobre, aluminio, plástico, vidrio y madera seca", icono: "fa-cubes-stacked" },
    { nombre: "Panel de mediciones", detalle: "Corriente (A), potencia (W) y estado del foco en tiempo real", icono: "fa-gauge-high" },
  ],

  // Conceptos centrales del lab — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Naturaleza corpuscular", definicion: "La materia está formada por partículas (átomos, iones, electrones). Un trozo de metal es un conjunto de átomos." },
    { termino: "Corriente eléctrica", definicion: "Movimiento ordenado de cargas (electrones) a través de un material conductor. Es la forma en que la energía eléctrica se transporta." },
    { termino: "Conductor vs aislante", definicion: "Los conductores (cobre, aluminio) tienen electrones libres y dejan pasar la corriente. Los aislantes (plástico, vidrio, madera seca) casi no la dejan pasar." },
    { termino: "Semiconductor", definicion: "Material que conduce en condiciones controladas (como el silicio). Es la base de chips, computadoras y celulares." },
    { termino: "Transformación de energía", definicion: "Cambio de un tipo de energía a otro. Ejemplos: pila (química→eléctrica), foco (eléctrica→luz+calor), panel solar (luminosa→eléctrica)." },
  ],

  // Glosario — VERBATIM del glosario interactivo A5 de P11.
  glosario: [
    { termino: "Naturaleza corpuscular", definicion: "La materia está formada por partículas (átomos, iones, electrones)." },
    { termino: "Carga eléctrica", definicion: "Propiedad de las partículas: positiva (protón) o negativa (electrón)." },
    { termino: "Corriente eléctrica", definicion: "Movimiento ordenado de cargas (electrones) por un material." },
    { termino: "Conductor", definicion: "Material que deja pasar la corriente por tener electrones libres." },
    { termino: "Aislante", definicion: "Material que casi no deja pasar la corriente." },
    { termino: "Semiconductor", definicion: "Material que conduce en condiciones controladas." },
    { termino: "Transformación de energía", definicion: "Cambio de un tipo de energía a otro." },
  ],

  aplicaciones: [
    "Los cables eléctricos usan cobre (conductor) forrado en plástico (aislante) para transportar corriente con seguridad.",
    "Los paneles solares de los hogares mexicanos convierten la luz del Sol en electricidad mediante semiconductores.",
    "Los chips de los celulares y computadoras funcionan gracias al silicio, un semiconductor controlado con precisión.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1 y glosario A5, CNEYT-I-P11.",
};

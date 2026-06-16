/**
 * Datos de la Ficha Teórica del laboratorio de Fotosíntesis.
 *
 * Contenido VERBATIM de las actividades ancla de CNEYT-III-P03:
 *   - Marco teórico: lectura A1 «Fotosíntesis: la fábrica de vida del planeta».
 *   - Glosario: glosario interactivo A5 «Fotosíntesis: reactivos, productos y tipos».
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const FOTOSINTESIS_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-III-P03-A1",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "La fotosíntesis es el proceso mediante el cual las plantas, las algas y algunas bacterias convierten la energía luminosa del sol en energía química almacenada en moléculas de glucosa. Es el fundamento de casi toda la vida en la Tierra: los seres que realizan fotosíntesis son los productores primarios de los que dependen directa o indirectamente todos los demás organismos.",
    "La ecuación general de la fotosíntesis resume el proceso de manera simplificada: 6CO2 + 6H2O + energía lumínica → C6H12O6 + 6O2. Es decir, seis moléculas de dióxido de carbono y seis de agua, en presencia de luz, producen una molécula de glucosa y seis de oxígeno. El oxígeno que respiramos es un subproducto de la fotosíntesis.",
    "El proceso ocurre en los cloroplastos, organelos presentes en las células vegetales. Se divide en dos grandes fases. Las reacciones de luz o reacciones luminosas ocurren en los tilacoides, membranas internas del cloroplasto, y requieren luz solar directa: capturan la energía lumínica para producir ATP y NADPH (moléculas energéticas) y liberan oxígeno al descomponer el agua. El ciclo de Calvin o reacciones oscuras ocurre en el estroma, el fluido del cloroplasto: usa el ATP y el NADPH producidos en la fase anterior para fijar el CO2 del aire y sintetizar glucosa.",
    "La clorofila es el pigmento responsable de capturar la luz. Absorbe principalmente la luz roja y la azul-violeta, y refleja la luz verde, razón por la que las plantas se ven verdes. Existen varios tipos de clorofila (a, b, c) y otros pigmentos accesorios como los carotenoides que capturan otras longitudes de onda y transfieren la energía a la clorofila.",
    "La tasa fotosintética —la velocidad a la que ocurre la fotosíntesis— depende de varios factores: la intensidad luminosa (mayor luz, mayor tasa hasta cierto límite), la concentración de CO2 en el aire, la temperatura (hay temperaturas óptimas para las enzimas del ciclo de Calvin) y la disponibilidad de agua.",
    "La milpa es el sistema agrícola tradicional mexicano que combina maíz, frijol y calabaza en el mismo espacio. Investigaciones de la UNAM (2022) han mostrado que la milpa maximiza el aprovechamiento de la luz solar por unidad de área: el maíz es alto y capta la luz del sol directa, el frijol trepador ocupa niveles intermedios, y la calabaza cubre el suelo y aprovecha la luz difusa. Es biodiversidad agrícola al servicio de la fotosíntesis eficiente.",
  ],

  objetivos: [
    "Identificar los reactivos y productos de la fotosíntesis a partir de la ecuación general: 6CO₂ + 6H₂O + luz → C₆H₁₂O₆ + 6O₂.",
    "Describir las dos fases de la fotosíntesis (reacciones de luz en los tilacoides y ciclo de Calvin en el estroma) y lo que ocurre en cada una.",
    "Explicar el papel de la clorofila como pigmento captor de luz y por qué las plantas se ven verdes.",
    "Analizar cómo la intensidad luminosa, la concentración de CO₂ y la temperatura afectan la tasa fotosintética.",
    "Distinguir las estrategias fotosintéticas de plantas C3, C4 y CAM con ejemplos mexicanos.",
    "Resolver el quiz de fotosíntesis de la actividad A2.",
  ],

  materiales: [
    { nombre: "Cloroplasto 3D", detalle: "Muestra las dos fases y el flujo de reactivos/productos en tiempo real", icono: "fa-leaf" },
    { nombre: "Deslizadores de control", detalle: "Ajusta luz, CO₂ y temperatura para ver cómo cambia la tasa fotosintética", icono: "fa-sliders" },
    { nombre: "Panel de factores", detalle: "Lectura en vivo de cada factor (luz, CO₂, temperatura) y la tasa total", icono: "fa-gauge-high" },
    { nombre: "Panel de tipos de planta", detalle: "Estrategias C3, C4 y CAM con ejemplos reales", icono: "fa-seedling" },
  ],

  // Conceptos centrales — elaborados a partir de la lectura A1.
  conceptos: [
    { termino: "Fotosíntesis", definicion: "Proceso mediante el cual las plantas, las algas y algunas bacterias convierten la energía luminosa del sol en energía química almacenada en moléculas de glucosa. Ecuación general: 6CO₂ + 6H₂O + luz → C₆H₁₂O₆ + 6O₂." },
    { termino: "Cloroplasto", definicion: "Organelo de las células vegetales donde ocurre la fotosíntesis. Contiene los tilacoides (donde se realizan las reacciones de luz) y el estroma (donde ocurre el ciclo de Calvin)." },
    { termino: "Reacciones de luz", definicion: "Primera fase de la fotosíntesis, en los tilacoides. Capturan la energía lumínica, producen ATP y NADPH, y liberan oxígeno al descomponer el agua (fotólisis)." },
    { termino: "Ciclo de Calvin", definicion: "Segunda fase de la fotosíntesis, en el estroma. Usa el ATP y NADPH producidos en la fase de luz para fijar el CO₂ del aire y sintetizar glucosa." },
    { termino: "Clorofila", definicion: "Pigmento responsable de capturar la luz en la fotosíntesis. Absorbe la luz roja y azul-violeta, y refleja la luz verde; por eso las plantas se ven verdes." },
    { termino: "Factor limitante", definicion: "El factor (luz, CO₂ o temperatura) que está en menor proporción y que frena la tasa fotosintética, aunque los demás estén en exceso." },
  ],

  // Glosario — VERBATIM del glosario interactivo A5 de P03.
  glosario: [
    { termino: "Fotosíntesis", definicion: "Proceso mediante el cual los organismos autótrofos convierten energía luminosa en energía química almacenada en glucosa." },
    { termino: "Clorofila", definicion: "Pigmento verde localizado en los cloroplastos que absorbe principalmente luz roja y azul para la fotosíntesis." },
    { termino: "Plantas C3", definicion: "Plantas que fijan el CO₂ directamente en el ciclo de Calvin formando un compuesto de 3 carbonos (3-PGA). Son las más comunes." },
    { termino: "Plantas C4", definicion: "Plantas con mecanismo de pre-fijación del CO₂ en células del mesófilo; más eficientes en climas cálidos y luminosos." },
    { termino: "Plantas CAM", definicion: "Plantas que fijan el CO₂ de noche (estomas cerrados de día) para minimizar la pérdida de agua en ambientes áridos." },
    { termino: "Fotólisis del agua", definicion: "Separación de la molécula de agua mediante la energía luminosa en la fase luminosa de la fotosíntesis; libera O₂." },
  ],

  aplicaciones: [
    "La deforestación en México reduce la capacidad de absorción de CO₂: el país pierde aproximadamente 92,000 hectáreas de bosque al año (CONAFOR 2023), lo que afecta el ciclo del carbono global.",
    "La milpa (maíz, frijol y calabaza) es biodiversidad agrícola al servicio de la fotosíntesis eficiente: cada planta ocupa un nivel de luz diferente, maximizando el aprovechamiento solar (UNAM, 2022).",
    "Las plantas C4 como el maíz son más eficientes que las C3 en climas cálidos, lo que las hace clave en la agricultura de regiones tropicales y subtropicales de México.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1 y glosario A5, CNEYT-III-P03.",
};

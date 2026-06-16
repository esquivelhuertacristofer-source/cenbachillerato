/**
 * Datos de la Ficha Teórica del laboratorio de Metabolismo celular
 * (CNEYT-VI-P03).
 *
 * Contenido VERBATIM de las actividades ancla de la progresión:
 *   · marcoTeorico — lectura A1 «Metabolismo celular: fotosíntesis y respiración».
 *   · glosario     — A5 «Glosario — Metabolismo celular: respiración y fotosíntesis».
 * El reto evaluable numérico vive en metabolismo-data.ts (A2 «ATP total en
 * respiración aerobia»).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const METABOLISMO_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-VI · P03 · A1 — Metabolismo celular: fotosíntesis y respiración",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "El metabolismo celular comprende todas las reacciones químicas que ocurren en la célula para obtener y usar energía.",
    "La fotosíntesis ocurre en los cloroplastos y tiene dos etapas. Las reacciones luminosas (tilacoides) capturan luz solar y la convierten en ATP y NADPH, liberando O2 a partir del agua. Las reacciones oscuras (ciclo de Calvin, estroma) usan el ATP y NADPH para fijar CO2 y sintetizar glucosa. Ecuación general: 6CO2 + 6H2O + luz -> C6H12O6 + 6O2.",
    "La respiración celular aerobia ocurre en tres etapas. Glucólisis (citoplasma): una molécula de glucosa se divide en 2 piruvatos, produciendo 2 ATP netos y 2 NADH. Ciclo de Krebs (matriz mitocondrial): los piruvatos se oxidan completamente, produciendo 2 ATP, 8 NADH y 2 FADH2 por glucosa. Cadena transportadora de electrones (membrana interna mitocondrial): el NADH y FADH2 ceden electrones; el gradiente de protones impulsa la ATP sintasa produciendo aprox. 32 ATP. Total: ~36 ATP por glucosa.",
    "La fermentación es un proceso anaerobio (sin oxígeno). La fermentación láctica (músculos en ejercicio intenso) convierte piruvato en lactato, produciendo solo 2 ATP. La fermentación alcohólica (levaduras) convierte piruvato en etanol y CO2. Ambas regeneran NAD+ para que la glucólisis pueda continuar, pero son mucho menos eficientes que la respiración aerobia.",
  ],

  objetivos: [
    "Describir las tres etapas de la respiración aerobia (glucólisis, Krebs y cadena de electrones), su localización y sus productos.",
    "Calcular el ATP total que rinde la respiración aerobia de 1 molécula de glucosa.",
    "Diferenciar la fase lumínica (tilacoides) del ciclo de Calvin (estroma) en la fotosíntesis.",
    "Comparar la eficiencia energética de la respiración aerobia (~36 ATP) frente a la fermentación (2 ATP).",
    "Resolver el ejercicio de ATP total en respiración aerobia (A2).",
  ],

  materiales: [
    { nombre: "Mitocondria 3D", detalle: "Glucólisis (citosol) → Krebs (matriz) → cadena de electrones (membrana interna)", icono: "fa-bolt" },
    { nombre: "Cloroplasto 3D", detalle: "Fase lumínica (tilacoides) y ciclo de Calvin (estroma)", icono: "fa-leaf" },
    { nombre: "Citosol sin O₂", detalle: "Glucólisis + fermentación láctica o alcohólica", icono: "fa-wine-bottle" },
    { nombre: "Contador de ATP", detalle: "Acumula etapa por etapa: 2 + 2 + 32 = 36 ATP", icono: "fa-battery-full" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Metabolismo celular", definicion: "Todas las reacciones químicas que ocurren en la célula para obtener y usar energía." },
    { termino: "Respiración aerobia", definicion: "Oxida por completo la glucosa usando O₂ en tres etapas (glucólisis, Krebs y cadena de electrones); rinde ~36 ATP por glucosa." },
    { termino: "Fotosíntesis", definicion: "En el cloroplasto convierte luz, H₂O y CO₂ en glucosa y O₂: fase lumínica (tilacoides) + ciclo de Calvin (estroma). 6CO2 + 6H2O + luz -> C6H12O6 + 6O2." },
    { termino: "Fermentación", definicion: "Proceso anaerobio (sin oxígeno) que regenera NAD+ para que la glucólisis continúe; solo produce 2 ATP por glucosa." },
    { termino: "ATP", definicion: "Moneda energética de la célula; la respiración aerobia rinde ~36 ATP por glucosa (2 + 2 + 32), 18 veces más que la fermentación." },
  ],

  // Glosario — VERBATIM de A5.
  glosario: [
    { termino: "Glucólisis", definicion: "Primera etapa de la respiración celular. Ocurre en el citosol. Convierte 1 glucosa (6C) en 2 piruvatos (3C) con ganancia neta de 2 ATP y 2 NADH. No requiere oxígeno; es la única vía energética en anaerobios estrictos." },
    { termino: "Ciclo de Krebs (ciclo del ácido cítrico)", definicion: "Segunda etapa de la respiración aerobia. Ocurre en la matriz mitocondrial. El piruvato se convierte en acetil-CoA (2C) que ingresa al ciclo, produciendo por cada vuelta: 3 NADH, 1 FADH₂, 1 GTP (≈1 ATP) y 2 CO₂. Por glucosa: 2 vueltas = 6 NADH, 2 FADH₂, 2 ATP y 4 CO₂." },
    { termino: "Cadena de transporte de electrones y fosforilación oxidativa", definicion: "Tercera etapa. Ocurre en la membrana interna mitocondrial. Los electrones de NADH y FADH₂ pasan por proteínas (complejos I-IV) que bombean H⁺ al espacio intermembranoso. El flujo de H⁺ de regreso a través de la ATP sintasa genera ~32-34 ATP. El O₂ es el aceptor final de electrones, formando H₂O." },
    { termino: "Fase lumínica de la fotosíntesis", definicion: "Ocurre en las membranas de los tilacoides del cloroplasto. La luz solar excita la clorofila; los fotosistemas II y I captan fotones. El agua se fotoliza (H₂O → O₂ + H⁺ + e⁻) y los electrones energizados generan ATP (fotofosforilación) y NADPH. El O₂ se libera." },
    { termino: "Ciclo de Calvin (fase oscura / fase de fijación de CO₂)", definicion: "Ocurre en el estroma del cloroplasto. Usa el ATP y NADPH de la fase lumínica. La enzima RuBisCO fija CO₂ en la ribulosa 1,5-bisfosfato (RuBP) (5C). Por cada 3 CO₂ fijados se produce 1 gliceraldehído-3-fosfato (G3P), precursor de glucosa y otros azúcares." },
    { termino: "Fermentación", definicion: "Proceso anaeróbico que regenera el NAD⁺ a partir del NADH para que la glucólisis continúe. Fermentación láctica: piruvato → lactato (músculo, bacterias lácticas). Fermentación alcohólica: piruvato → etanol + CO₂ (levaduras). Solo produce 2 ATP por glucosa." },
  ],

  aplicaciones: [
    "El Sistema Nacional de Áreas Naturales Protegidas (SINAP) de México protege más de 90 millones de hectáreas — el 19% del territorio nacional — donde el equilibrio fotosíntesis–respiración sostiene los ecosistemas.",
    "El pan y la cerveza utilizan la fermentación alcohólica de levaduras (Saccharomyces cerevisiae); el yogur aprovecha la fermentación láctica de bacterias.",
    "Los eritrocitos (glóbulos rojos) carecen de mitocondrias y obtienen toda su energía solo de la glucólisis.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — CNEYT-VI. Ref: Campbell, Biología (12a ed.); Lehninger, Bioquímica.",
};

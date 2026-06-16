/**
 * Datos de la Ficha Teórica del laboratorio "Genética mendeliana: cuadro de
 * Punnett" (CNEYT-VI-P05).
 *
 * Contenido VERBATIM:
 *  · marcoTeorico → lectura ancla A1 «Herencia mendeliana y ligada al sexo».
 *  · glosario     → glosario A5 «Glosario — Herencia genética: Mendel y
 *                   herencia no mendeliana».
 * Los conceptos centrales se formulan a partir de esos mismos contenidos (sin
 * inventar datos); el reto evaluable vive en genetica-mendel-data.ts (A2).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const GENETICA_MENDEL_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-VI · P05 · A1 — Herencia mendeliana y ligada al sexo",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "Gregor Mendel (1865) enunció las leyes de la herencia a partir de experimentos con guisantes. La Ley de Segregación establece que cada organismo tiene dos alelos para cada gen y los separa durante la formación de gametos, transmitiendo uno solo a la descendencia. La Ley de la Distribución Independiente indica que los genes en cromosomas distintos se heredan de forma independiente.",
    "En un cruce monohíbrido (Aa × Aa), el cuadro de Punnett da una proporción genotípica 1 AA : 2 Aa : 1 aa y una proporción fenotípica 3 dominante : 1 recesivo. La probabilidad de obtener un homocigoto recesivo (aa) es del 25%.",
    "La herencia no mendeliana incluye la dominancia incompleta (el heterocigoto tiene un fenotipo intermedio), la codominancia (ambos alelos se expresan, como en el grupo sanguíneo ABO) y los genes ligados al sexo.",
    "Los grupos sanguíneos ABO están controlados por tres alelos (IA, IB, i). IA e IB son codominantes entre sí y dominantes sobre i. Así, el grupo AB (genotipo IAIB) expresa ambos antígenos.",
    "La herencia ligada al sexo implica genes en el cromosoma X. El daltonismo (gen recesivo ligado a X) afecta más a hombres (XY) porque tienen un solo cromosoma X: si este lleva el alelo recesivo, expresan el fenotipo. Las mujeres (XX) necesitan dos copias del alelo recesivo para expresarlo, pero pueden ser portadoras.",
  ],

  objetivos: [
    "Enunciar las dos leyes de Mendel (segregación y distribución independiente).",
    "Usar el cuadro de Punnett para predecir la descendencia de un cruce monohíbrido (Aa × Aa).",
    "Reconocer las proporciones genotípica 1:2:1 y fenotípica 3:1, y que P(aa) = 25%.",
    "Distinguir la herencia no mendeliana: dominancia incompleta y codominancia.",
    "Explicar por qué el daltonismo (gen ligado al X) afecta más a los hombres.",
    "Resolver el ejercicio del cruce monohíbrido Aa × Aa (A2).",
  ],

  materiales: [
    { nombre: "Cuadro de Punnett 3D", detalle: "Mesa de cruzamientos para combinar gametos y leer cada casilla", icono: "fa-table-cells" },
    { nombre: "Modo monohíbrido", detalle: "Un gen (Aa × Aa): genotípica 1:2:1, fenotípica 3:1, P(aa) = 25%", icono: "fa-seedling" },
    { nombre: "Herencia no mendeliana", detalle: "Dominancia incompleta (boca de dragón) y codominancia (grupo ABO)", icono: "fa-shuffle" },
    { nombre: "Modo dihíbrido", detalle: "Dos genes (AaBb × AaBb): proporción 9:3:3:1", icono: "fa-table-cells-large" },
    { nombre: "Modo ligado al sexo", detalle: "Daltonismo en el cromosoma X (XᴰXᵈ × XᴰY)", icono: "fa-venus-mars" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1 y el glosario A5.
  conceptos: [
    { termino: "Alelos, locus, homocigoto y heterocigoto", definicion: "Un gen ocupa una posición (locus) en el cromosoma; los alelos son sus formas alternativas. Un diploide tiene dos alelos por locus: homocigoto (AA o aa) o heterocigoto (Aa)." },
    { termino: "Primera ley de Mendel (segregación)", definicion: "Cada organismo tiene dos alelos para cada gen y los separa durante la formación de gametos, transmitiendo uno solo a la descendencia." },
    { termino: "Segunda ley de Mendel (distribución independiente)", definicion: "Los genes en cromosomas distintos se heredan de forma independiente; en un dihíbrido AaBb × AaBb la F2 es 9:3:3:1." },
    { termino: "Cruce monohíbrido Aa × Aa", definicion: "El cuadro de Punnett da proporción genotípica 1 AA : 2 Aa : 1 aa y fenotípica 3 dominante : 1 recesivo. La probabilidad de homocigoto recesivo (aa) es del 25%." },
    { termino: "Dominancia incompleta y codominancia", definicion: "Dominancia incompleta: el heterocigoto tiene un fenotipo intermedio. Codominancia: ambos alelos se expresan, como en el grupo sanguíneo ABO." },
    { termino: "Herencia ligada al sexo", definicion: "Genes en el cromosoma X. El daltonismo afecta más a los hombres (XY) porque con un solo X que lleve el alelo recesivo ya lo expresan; las mujeres (XX) necesitan dos copias." },
  ],

  // Glosario — VERBATIM del glosario A5.
  glosario: [
    { termino: "Alelos y locus génico", definicion: "Un gen ocupa una posición específica en el cromosoma llamada locus. Los alelos son formas alternativas del mismo gen. Un individuo diploide tiene dos alelos por locus (uno de cada progenitor): puede ser homocigoto (AA o aa) o heterocigoto (Aa)." },
    { termino: "Primera ley de Mendel: segregación", definicion: "Los dos alelos de un gen se separan (segregan) durante la meiosis y cada gameto recibe solo uno. Al fecundarse, el cigoto recibve un alelo de cada progenitor. Esto explica las proporciones fenotípicas 3:1 en F2 de cruzamientos monohíbridos." },
    { termino: "Segunda ley de Mendel: surtido independiente", definicion: "Para genes en cromosomas distintos, los alelos de un gen se distribuyen en los gametos independientemente de los alelos de otro gen. Esto produce proporciones 9:3:3:1 en cruzamientos dihíbridos (F2)." },
    { termino: "Dominancia incompleta y codominancia", definicion: "Dominancia incompleta: el heterocigoto presenta fenotipo intermedio (ej: rojo × blanco → rosa). Codominancia: ambos alelos se expresan simultáneamente sin mezcla (ej: grupo sanguíneo AB: se expresan antígenos A y B)." },
    { termino: "Herencia ligada al sexo", definicion: "Herencia de genes ubicados en el cromosoma X. Los hombres (XY) expresan cualquier alelo recesivo ligado al X porque solo tienen una copia. Las mujeres (XX) necesitan dos copias recesivas para expresar el rasgo. Ejemplos: hemofilia A, daltonismo." },
    { termino: "Herencia poligénica", definicion: "Rasgos determinados por la interacción de múltiples genes (cada uno con efecto pequeño y aditivo). Producen variación continua con distribución normal en la población. También influye el ambiente (herencia multifactorial)." },
  ],

  aplicaciones: [
    "Predecir la probabilidad de rasgos en la descendencia (color, forma) con el cuadro de Punnett.",
    "Entender los grupos sanguíneos ABO (codominancia de IA e IB) en transfusiones.",
    "Explicar por qué enfermedades ligadas al X, como el daltonismo y la hemofilia A, afectan más a los hombres.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — CNEYT-VI. Ref: Campbell, Biología (12a ed.); Lewin, Genes XII.",
};

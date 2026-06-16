/**
 * Datos de la Ficha Teórica del laboratorio de Concentración de una disolución.
 *
 * Contenido VERBATIM de las actividades ancla de CNEYT-I-P04:
 *   - Marco teórico: lectura A1 «Sustancias puras, mezclas y métodos de
 *     separación» (párrafos sobre sustancias puras, mezclas homogéneas /
 *     disoluciones y heterogéneas) + contexto del ejercicio A6 (fórmula
 *     del % en masa).
 *   - Glosario: glosario interactivo A5 «Sustancias, mezclas y tabla periódica».
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const CONCENTRACION_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-I · P04 · A6 — Concentración de una disolución",

  // Marco teórico — VERBATIM de la lectura A1 y del contexto del ejercicio A6.
  marcoTeorico: [
    "La materia que nos rodea puede clasificarse en sustancias puras y mezclas. Una sustancia pura tiene composición definida y constante: el agua pura (H₂O) siempre tiene la misma proporción de hidrógeno y oxígeno; el hierro puro siempre es Fe. Las sustancias puras pueden ser elementos (solo un tipo de átomo: hierro, oxígeno, oro) o compuestos (dos o más elementos unidos químicamente: agua, sal de mesa, glucosa).",
    "Las mezclas, en cambio, tienen composición variable: el agua de mar puede tener más o menos sal dependiendo de dónde se tome. Existen dos tipos de mezclas. Las mezclas homogéneas (o soluciones) tienen composición uniforme en toda su extensión: no se pueden ver los componentes por separado. Ejemplos: agua con sal, aire, vinagre. Las mezclas heterogéneas tienen composición no uniforme y los componentes son visibles o separables: ensalada, granito, arena con agua.",
    "% en masa = (masa de soluto / masa de disolución) × 100. La masa de la disolución es soluto + disolvente.",
  ],

  objetivos: [
    "Preparar una disolución agregando soluto a un disolvente (agua).",
    "Calcular la concentración en porcentaje de masa: % m/m = (masa de soluto / masa de disolución) × 100.",
    "Distinguir entre una disolución diluida, concentrada y saturada.",
    "Reconocer que cada soluto tiene un límite de solubilidad: el exceso no se disuelve.",
    "Resolver el ejercicio de concentración de la práctica.",
  ],

  materiales: [
    { nombre: "Vaso de precipitados", detalle: "Para preparar la disolución", icono: "fa-prescription-bottle" },
    { nombre: "Disolvente: agua", detalle: "El que disuelve al soluto", icono: "fa-droplet" },
    { nombre: "Solutos", detalle: "Sal (NaCl), azúcar (C₁₂H₂₂O₁₁), sulfato de cobre (CuSO₄)", icono: "fa-cubes-stacked" },
    { nombre: "Balanza", detalle: "Mide la masa de soluto y disolvente (g)", icono: "fa-scale-balanced" },
    { nombre: "Varilla de agitación", detalle: "Ayuda a disolver el soluto", icono: "fa-ruler-vertical" },
  ],

  // Conceptos centrales del lab — formulados a partir del contexto verbatim del A6.
  conceptos: [
    { termino: "Disolución", definicion: "Mezcla homogénea de un soluto disuelto en un disolvente. Su composición es uniforme en toda su extensión: no se ven los componentes por separado (agua con sal, agua con azúcar)." },
    { termino: "Concentración (% en masa)", definicion: "Cantidad de soluto respecto a la masa total de la disolución: % en masa = (masa de soluto / masa de disolución) × 100. La masa de la disolución es soluto + disolvente." },
    { termino: "Diluida, concentrada, saturada", definicion: "Una disolución es diluida si tiene poco soluto, concentrada si tiene mucho, y saturada cuando el disolvente ya no admite más soluto: el exceso queda sin disolver." },
    { termino: "Solubilidad", definicion: "La cantidad máxima de soluto que un disolvente puede disolver a una temperatura dada. Cada soluto tiene la suya (la sal y el azúcar se disuelven en cantidades muy distintas en la misma agua)." },
  ],

  // Glosario — VERBATIM del glosario interactivo A5 de P04.
  glosario: [
    { termino: "Elemento", definicion: "Sustancia pura de un solo tipo de átomo." },
    { termino: "Compuesto", definicion: "Sustancia pura de dos o más elementos unidos químicamente." },
    { termino: "Disolución", definicion: "Mezcla homogénea de soluto disuelto en un disolvente." },
    { termino: "Soluto / disolvente", definicion: "El que se disuelve / el que disuelve." },
    { termino: "Concentración", definicion: "Cantidad de soluto respecto a la disolución (diluida, concentrada, saturada)." },
    { termino: "Grupo y periodo", definicion: "Columna y fila de la tabla periódica." },
  ],

  aplicaciones: [
    "Preparar sueros y medicamentos: la concentración correcta de soluto es vital en medicina.",
    "Ajustar la salinidad del agua de mar o el azúcar de un jarabe en la industria de alimentos.",
    "Controlar la concentración de reactivos en el laboratorio para que una reacción ocurra como se espera.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1, glosario A5 y ejercicio A6, CNEYT-I-P04.",
};

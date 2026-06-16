/**
 * Datos de la Ficha Teórica del laboratorio de Enlaces químicos.
 *
 * Contenido VERBATIM de las actividades ancla de CNEYT-I-P10:
 *   - Marco teórico: lectura A1 «Por qué los átomos se unen» (verbatim).
 *   - Glosario: glosario interactivo A5 «Iones, moléculas y enlaces».
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const ENLACES_QUIMICOS_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-I · P10 · A1 — Por qué los átomos se unen",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "Casi nada en la naturaleza está hecho de átomos sueltos: los átomos se unen entre sí formando todo lo que existe. ¿Por qué se unen? Por sus ELECTRONES DE VALENCIA, los electrones de la última capa, que son los que participan en los enlaces.",
    "Muchos átomos son más estables cuando completan ocho electrones en su última capa (la 'regla del octeto', como los gases nobles). Para lograrlo, pueden ganar, perder o compartir electrones.",
    "Cuando un átomo gana o pierde electrones queda cargado: se convierte en un ION. Si pierde electrones queda positivo (CATIÓN); si los gana queda negativo (ANIÓN). Recuerda también que los ISÓTOPOS son átomos del mismo elemento con distinto número de neutrones; no cambian la carga, cambian la masa.",
    "Los TIPOS DE ENLACE dependen de cómo los átomos resuelven sus electrones:\n• ENLACE IÓNICO: un átomo cede electrones a otro; se forman iones de carga opuesta que se atraen. Típico entre un metal y un no metal. Ejemplo: la sal, NaCl.\n• ENLACE COVALENTE: dos no metales COMPARTEN electrones. Forman MOLÉCULAS. Ejemplo: el agua, H₂O.\n• ENLACE METÁLICO: los átomos de un metal comparten un 'mar' de electrones libres, lo que explica por qué los metales conducen la electricidad.",
    "Una pista útil es la ELECTRONEGATIVIDAD: la tendencia de un átomo a atraer electrones. Si la diferencia entre dos átomos es muy grande, el enlace tiende a ser iónico; si es pequeña, covalente.",
  ],

  objetivos: [
    "Identificar los electrones de valencia como los responsables de los enlaces químicos.",
    "Distinguir entre ión, catión, anión, molécula e isótopo.",
    "Explicar los tres tipos de enlace: iónico, covalente y metálico con ejemplos cotidianos.",
    "Relacionar la electronegatividad (ΔEN) con el tipo de enlace que se forma.",
    "Resolver el quiz de enlaces químicos de la práctica.",
  ],

  materiales: [
    { nombre: "Visor 3D de moléculas", detalle: "Modelos de barras y esferas para cada tipo de enlace", icono: "fa-flask-vial" },
    { nombre: "Escala de electronegatividad", detalle: "Muestra dónde cae el ΔEN de cada molécula (no polar/polar/iónico)", icono: "fa-ruler-horizontal" },
    { nombre: "Selector de moléculas", detalle: "H₂O, NaCl, O₂, CO₂, HCl, Fe y más ejemplos reales", icono: "fa-atom" },
    { nombre: "Lectura de datos del enlace", detalle: "Átomos, ΔEN y geometría molecular", icono: "fa-magnifying-glass-chart" },
  ],

  // Conceptos centrales del lab — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Electrón de valencia", definicion: "Los electrones de la última capa del átomo; son los que participan en los enlaces químicos. Los átomos se unen para completar ocho electrones en esta capa (regla del octeto)." },
    { termino: "Ión / Catión / Anión", definicion: "Un ión es un átomo con carga por haber ganado o perdido electrones. Catión: carga positiva (perdió e⁻). Anión: carga negativa (ganó e⁻). Ejemplo: Na⁺ y Cl⁻ en la sal." },
    { termino: "Enlace iónico", definicion: "Un átomo cede electrones a otro; se forman iones de carga opuesta que se atraen. Típico entre un metal y un no metal. Ejemplo: NaCl (sal de mesa)." },
    { termino: "Enlace covalente", definicion: "Dos no metales comparten electrones y forman moléculas. Puede ser polar (ΔEN entre 0.4 y 1.7) o no polar (ΔEN < 0.4). Ejemplo: H₂O, O₂, CO₂." },
    { termino: "Electronegatividad (ΔEN)", definicion: "La tendencia de un átomo a atraer los electrones del enlace. Si la diferencia entre dos átomos es muy grande (ΔEN ≥ 1.7), el enlace tiende a ser iónico; si es pequeña, covalente." },
  ],

  // Glosario — VERBATIM del glosario interactivo A5 de P10.
  glosario: [
    { termino: "Electrón de valencia", definicion: "Electrón de la última capa; participa en los enlaces." },
    { termino: "Ion", definicion: "Átomo con carga por ganar o perder electrones." },
    { termino: "Catión / Anión", definicion: "Ion positivo (pierde e⁻) / ion negativo (gana e⁻)." },
    { termino: "Molécula", definicion: "Grupo de átomos unidos por enlaces covalentes." },
    { termino: "Isótopo", definicion: "Átomos del mismo elemento con distinto número de neutrones." },
    { termino: "Electronegatividad", definicion: "Tendencia de un átomo a atraer electrones del enlace." },
    { termino: "Enlace iónico / covalente / metálico", definicion: "Ceder electrones / compartirlos / mar de electrones libres." },
  ],

  aplicaciones: [
    "La sal de mesa (NaCl) es un ejemplo cotidiano de enlace iónico: el sodio cede un electrón al cloro.",
    "El agua (H₂O) y el CO₂ son moléculas covalentes polares; su polaridad explica propiedades como la solubilidad.",
    "Los cables de cobre y los utensilios de cocina de metal funcionan gracias al enlace metálico y su 'mar' de electrones libres.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1 y glosario A5, CNEYT-I-P10.",
};

/**
 * Datos de la Ficha Teórica del laboratorio de Densidad y Flotación.
 *
 * Contenido VERBATIM de las actividades ancla de CNEYT-I-P02:
 *   - Marco teórico: lectura A1 «La materia y sus propiedades» (párrafos sobre
 *     materia, propiedades físicas y densidad) + contexto del ejercicio A6.
 *   - Glosario: glosario interactivo A5 «Materia, masa y densidad».
 *
 * Honestidad de fuentes (regla anti-fabricación): el estudio FORMAL del empuje y
 * del principio de Arquímedes NO está sembrado en P02 (corresponde a CNEYT-V,
 * 5.º semestre). Aquí la flotación se introduce de forma cualitativa, apoyada en
 * el contenido verbatim que SÍ existe en P02 ("la densidad determina si un objeto
 * flota o se hunde"). Esos conceptos se marcan como introducción del laboratorio,
 * no como texto verbatim de la progresión.
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const DENSIDAD_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-I · P02 · A6 — Cálculo de densidad",

  // Marco teórico — VERBATIM de la lectura A1 y del contexto del ejercicio A6 de P02.
  marcoTeorico: [
    "La materia es todo lo que tiene masa y ocupa un espacio. Desde el aire que respiramos hasta el agua, las rocas, los metales y nuestros propios cuerpos: todo está hecho de materia. Para estudiarla, los científicos la describen a través de sus propiedades, que se clasifican en físicas y químicas.",
    "Las propiedades físicas son aquellas que pueden medirse u observarse sin cambiar la composición química de la materia: la masa (cantidad de materia), el volumen (espacio que ocupa), la densidad (masa por unidad de volumen), el color, el punto de fusión, el punto de ebullición, la conductividad eléctrica y térmica, la dureza y la maleabilidad. Estas propiedades nos sirven para identificar sustancias: el oro se reconoce por su densidad y color, el cobre por su conductividad.",
    "Densidad = masa / volumen (ρ = m/V). La densidad es característica de cada sustancia.",
    "Como la densidad es propia de cada material, sirve para identificarlo y también determina si un objeto flota o se hunde en un líquido: flota cuando su densidad es menor que la del líquido y se hunde cuando es mayor.",
  ],

  objetivos: [
    "Calcular la densidad de un objeto aplicando ρ = m / V.",
    "Comparar la densidad del objeto con la del líquido para predecir si flota o se hunde.",
    "Identificar una sustancia a partir de su densidad característica.",
    "Reconocer cualitativamente el papel del peso y el empuje en la flotación.",
    "Resolver el ejercicio de cálculo de densidad de la práctica.",
  ],

  materiales: [
    { nombre: "Recipiente transparente", detalle: "Para observar la flotación", icono: "fa-prescription-bottle" },
    { nombre: "Líquidos de distinta densidad", detalle: "Aceite, agua, agua salada, glicerina, miel, mercurio", icono: "fa-droplet" },
    { nombre: "Objetos de distinta densidad", detalle: "Corcho, madera, hielo, plástico, aluminio, hierro, plomo, oro", icono: "fa-cube" },
    { nombre: "Balanza", detalle: "Mide la masa (g)", icono: "fa-scale-balanced" },
    { nombre: "Probeta graduada", detalle: "Mide el volumen (cm³ o mL)", icono: "fa-flask-vial" },
  ],

  // Conceptos centrales del lab. La densidad es verbatim de P02; la flotación se
  // introduce aquí de forma cualitativa (el empuje/Arquímedes se formaliza en CNEYT-V).
  conceptos: [
    { termino: "Densidad (ρ)", definicion: "Masa por unidad de volumen: ρ = m/V. Es una propiedad característica de cada sustancia, por lo que permite identificar materiales (el aluminio: 2.7 g/cm³; el oro: 19.3 g/cm³)." },
    { termino: "Masa y volumen", definicion: "La masa (g) es la cantidad de materia de un cuerpo; el volumen (cm³ o mL) es el espacio que ocupa. Su cociente, masa entre volumen, da la densidad." },
    { termino: "Flotación", definicion: "Un objeto flota cuando su densidad es menor que la del líquido, se hunde cuando es mayor y queda suspendido cuando son casi iguales. Por eso un mismo metal puede hundirse en agua y flotar en mercurio." },
    { termino: "Peso y empuje", definicion: "Al sumergir un objeto compiten dos fuerzas: el peso (hacia abajo) y el empuje del líquido (hacia arriba). Aquí se introducen de forma cualitativa para explicar la flotación; su estudio formal y el principio de Arquímedes corresponden a CNEYT-V (5.º semestre)." },
  ],

  // Glosario — VERBATIM del glosario interactivo A5 de P02.
  glosario: [
    { termino: "Materia", definicion: "Todo lo que tiene masa y ocupa un espacio." },
    { termino: "Cuerpo", definicion: "Porción limitada de materia con forma propia." },
    { termino: "Masa", definicion: "Cantidad de materia de un cuerpo; se mide en kg." },
    { termino: "Peso", definicion: "Fuerza con que la gravedad atrae a un cuerpo." },
    { termino: "Volumen", definicion: "Espacio que ocupa un cuerpo; se mide en m³ o L." },
    { termino: "Densidad", definicion: "Masa por unidad de volumen (ρ = m/V)." },
  ],

  aplicaciones: [
    "Identificar metales y materiales por su densidad característica: control de calidad, joyería y reciclaje.",
    "Diseñar embarcaciones: un barco de acero flota porque su forma hace que su densidad media (casco hueco con aire) sea menor que la del agua.",
    "Separar materiales por flotación según su densidad, técnica común en la industria y el laboratorio.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1, glosario A5 y ejercicio A6, CNEYT-I-P02.",
};

/**
 * Datos de la Ficha Teórica del laboratorio "División celular: mitosis y
 * meiosis" (CNEYT-VI-P09).
 *
 * Contenido VERBATIM de la actividad ancla A1 «Mitosis y meiosis: cómo una
 * célula se convierte en dos (o en cuatro)» (lectura) y del glosario A5
 * «Glosario: división celular y herencia». El reto evaluable vive en
 * division-celular-data.ts (A2, ejercicio_matematico).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const DIVISION_CELULAR_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-VI · P09 · A1 — Mitosis y meiosis: cómo una célula se convierte en dos (o en cuatro)",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "Toda célula proviene de otra célula. Para crecer, sanar una herida o producir descendencia, los seres vivos necesitan que sus células se dividan; pero NO todas las divisiones son iguales. Existen dos grandes mecanismos: la MITOSIS y la MEIOSIS. Ambos comienzan igual —con una célula que primero DUPLICA su ADN en la interfase—, pero terminan de manera muy distinta.",
    "RECORDATORIO: PLOIDÍA. Las células de tu cuerpo son DIPLOIDES (2n): tienen dos juegos completos de cromosomas, uno heredado de tu madre y otro de tu padre. En el ser humano, 2n = 46 (23 pares de homólogos). Los gametos —óvulos y espermatozoides— son HAPLOIDES (n): tienen un solo juego, n = 23.",
    "MITOSIS (una división → 2 células idénticas). Tras duplicar el ADN, la célula pasa por Profase (los cromosomas se condensan en forma de X, cada uno con dos cromátidas hermanas), Metafase (los cromosomas se alinean en UNA fila en el ecuador), Anafase (las cromátidas hermanas se separan hacia polos opuestos), Telofase y Citocinesis (el citoplasma se divide). Resultado: 2 células hijas genéticamente IDÉNTICAS entre sí y a la madre (2n → 2n). La mitosis sirve para crecer, reparar tejidos y regenerar; es también la base de la reproducción asexual.",
    "MEIOSIS (dos divisiones → 4 células distintas). La meiosis hace DOS divisiones seguidas sin volver a duplicar el ADN. En la Profase I los cromosomas homólogos se aparean y ocurre el CROSSING OVER: intercambian fragmentos de ADN. En la Anafase I se separan los homólogos COMPLETOS (división reduccional): de aquí salen dos células haploides. En la segunda división (Anafase II) se separan las cromátidas hermanas, como en una mitosis. Resultado: 4 células haploides (2n → n), todas genéticamente DISTINTAS. La meiosis produce los gametos de la reproducción sexual.",
    "POR QUÉ IMPORTA LA RECOMBINACIÓN. El crossing over y la distribución INDEPENDIENTE de los homólogos (que se acomodan al azar en la Metafase I) hacen que cada gameto sea único. Por eso ningún hermano es idéntico a otro (salvo gemelos idénticos) y por eso las poblaciones tienen VARIABILIDAD genética, la materia prima de la evolución y el sustento de la biodiversidad. Cuando dos gametos se unen en la fecundación (n + n), se restaura el número diploide 2n de la especie: la meiosis evita que el número de cromosomas se duplique en cada generación.",
    "SITUACIONES DE INTERÉS. El control de la mitosis es vital: cuando falla y las células se dividen sin parar, surge el CÁNCER. Un error al repartir cromosomas en la meiosis (no disyunción) produce gametos con cromosomas de más o de menos, origen de condiciones como la trisomía 21. Entender estas divisiones es clave en medicina, agricultura y conservación.",
  ],

  objetivos: [
    "Identificar las fases de la mitosis y explicar por qué produce dos células idénticas (2n → 2n).",
    "Identificar las fases de la meiosis y explicar por qué produce cuatro células haploides (2n → n).",
    "Reconocer la separación reduccional de homólogos (Anafase I) y la de cromátidas hermanas (Anafase II).",
    "Relacionar el crossing over y la distribución independiente con la variabilidad genética y la biodiversidad.",
    "Resuelve el reto evaluable de la actividad A2: calcular células hijas, cromosomas y combinaciones.",
  ],

  materiales: [
    { nombre: "Visor de la división celular 3D", detalle: "Recorre fase por fase la mitosis y la meiosis", icono: "fa-dna" },
    { nombre: "Modos mitosis / meiosis / comparar", detalle: "1 célula → 2 idénticas (2n) o → 4 diversas (n)", icono: "fa-clone" },
    { nombre: "Calculadora de ploidía", detalle: "Escribe el 2n de la célula madre y compara mitosis vs. meiosis", icono: "fa-calculator" },
    { nombre: "Crossing over y recombinación", detalle: "Visualiza el intercambio de tramos de ADN en la Profase I", icono: "fa-shuffle" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Mitosis", definicion: "Una división → 2 células idénticas. Tras duplicar el ADN, la célula reparte cromátidas hermanas y produce 2 células genéticamente IDÉNTICAS a la madre (2n → 2n)." },
    { termino: "Meiosis", definicion: "Dos divisiones seguidas sin volver a duplicar el ADN → 4 células haploides (2n → n), todas genéticamente DISTINTAS; produce los gametos de la reproducción sexual." },
    { termino: "Ploidía (2n y n)", definicion: "Las células del cuerpo son DIPLOIDES (2n = 46, 23 pares); los gametos son HAPLOIDES (n = 23, un solo juego)." },
    { termino: "Crossing over", definicion: "En la Profase I los cromosomas homólogos se aparean e intercambian fragmentos de ADN; es fuente de variabilidad genética." },
    { termino: "División reduccional vs. ecuacional", definicion: "En la Anafase I se separan los homólogos COMPLETOS (reduccional); en la Anafase II se separan las cromátidas hermanas, como en la mitosis (ecuacional)." },
    { termino: "Recombinación y biodiversidad", definicion: "El crossing over y la distribución independiente hacen único a cada gameto; sostienen la variabilidad genética y la biodiversidad." },
  ],

  // Glosario — VERBATIM del glosario interactivo A5 «Glosario: división celular y herencia».
  glosario: [
    { termino: "Cromosoma", definicion: "Estructura de ADN muy compactado que porta los genes; en humanos hay 46 (23 pares)." },
    { termino: "Cromátida hermana", definicion: "Cada una de las dos copias idénticas de un cromosoma duplicado, unidas por el centrómero." },
    { termino: "Cromosomas homólogos", definicion: "El par de cromosomas con los mismos genes, uno de origen materno y otro paterno." },
    { termino: "Diploide (2n)", definicion: "Célula con dos juegos completos de cromosomas, uno de cada progenitor." },
    { termino: "Haploide (n)", definicion: "Célula con un solo juego de cromosomas; es el estado de los gametos." },
    { termino: "Mitosis", definicion: "División celular que produce dos células hijas idénticas a la madre (2n → 2n)." },
    { termino: "Meiosis", definicion: "Dos divisiones sucesivas que producen cuatro células haploides distintas (2n → n)." },
    { termino: "Crossing over", definicion: "Intercambio de fragmentos de ADN entre cromátidas de homólogos durante la Profase I." },
    { termino: "Recombinación genética", definicion: "Nuevas combinaciones de genes que surgen por crossing over y distribución independiente." },
    { termino: "Gameto", definicion: "Célula sexual haploide (óvulo o espermatozoide) que se une en la fecundación." },
  ],

  aplicaciones: [
    "Cicatrizar una herida, crecer o regenerar tejidos: mitosis que repone células idénticas (2n → 2n).",
    "Entender el cáncer como una mitosis sin control: células que se dividen sin detenerse.",
    "Explicar por qué los hijos no son idénticos a sus padres y por qué dos hermanos son distintos: meiosis y recombinación.",
    "Comprender errores de reparto en la meiosis (no disyunción), origen de condiciones como la trisomía 21.",
  ],

  fuente:
    "MCCEMS 2025 — Ciencias Naturales, Experimentales y Tecnología VI, propósito formativo O5; lectura A1 y glosario A5, CNEYT-VI-P09.",
};

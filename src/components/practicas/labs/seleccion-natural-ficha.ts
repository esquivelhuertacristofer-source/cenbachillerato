/**
 * Datos de la Ficha Teórica del laboratorio de Selección natural (CNEYT-VI-P07).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: lectura A1 «Evolución por selección natural: Darwin y
 *     evidencias» (párrafos verbatim).
 *   - Glosario: glosario interactivo A5 «Glosario — Evolución y selección
 *     natural» (términos y definiciones verbatim).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const SELECCION_NATURAL_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-VI · P07 · A1 — Evolución por selección natural: Darwin y evidencias",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "Charles Darwin y Alfred Russell Wallace propusieron en 1858 la teoría de la evolución por selección natural, publicada por Darwin en 'El origen de las especies' (1859). Los cuatro postulados son: (1) existe variación heredable en las poblaciones; (2) los individuos producen más descendencia de la que puede sobrevivir; (3) algunos rasgos aumentan la probabilidad de sobrevivir y reproducirse; (4) los rasgos favorables se hacen más frecuentes en la población con el tiempo.",
    "La selección natural no es aleatoria: opera sobre la variación existente, favoreciendo los fenotipos mejor adaptados al ambiente actual. El resultado acumulado a lo largo del tiempo es la evolución: cambio en las frecuencias alélicas de una población.",
    "La especiación ocurre cuando poblaciones de una misma especie quedan aisladas reproductivamente. El aislamiento geográfico (especiación alopátrica) acumula diferencias genéticas hasta que las poblaciones ya no pueden reproducirse entre sí, formando nuevas especies.",
    "Las evidencias de la evolución son múltiples y convergentes. El registro fósil muestra formas de transición (ej. Tiktaalik, entre peces y tetrápodos). La anatomía comparada revela estructuras homólogas (mismo origen, distinta función: el hueso humero en humano, ballena, murciélago) y vestigiales (estructuras que perdieron su función, como el cóccix humano). La biogeografía explica la distribución de especies. La genómica comparada demuestra que especies más emparentadas comparten mayor porcentaje de su ADN; los humanos compartimos ~98.7% del genoma con los chimpancés.",
  ],

  objetivos: [
    "Comprender la evolución por selección natural y los cuatro postulados de Darwin-Wallace.",
    "Observar cómo la presión depredadora y el ambiente cambian las frecuencias alélicas de una población generación a generación.",
    "Distinguir los tres tipos de selección natural: estabilizadora, direccional y disruptiva.",
    "Reconocer las evidencias de la evolución: registro fósil, estructuras homólogas y genómica comparada.",
    "Resolver el reto evaluable de la actividad A4 (Verdadero o Falso).",
  ],

  materiales: [
    { nombre: "Visor 3D de la evolución", detalle: "Población de conejos, distribuciones del rasgo y huesos homólogos en 3D", icono: "fa-dna" },
    { nombre: "Ambientes y depredadores", detalle: "Pradera, campo nevado y malpaís con presión depredadora baja, media o alta", icono: "fa-globe" },
    { nombre: "Control de generaciones", detalle: "Avanza el tiempo y observa cambiar las frecuencias alélicas", icono: "fa-clock-rotate-left" },
    { nombre: "Tabla de evidencias", detalle: "Homología en humano, ballena y murciélago; ~98.7% de ADN compartido con el chimpancé", icono: "fa-bone" },
  ],

  // Conceptos centrales del lab — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Selección natural", definicion: "Mecanismo que opera sobre la variación heredable existente, favoreciendo los fenotipos mejor adaptados al ambiente actual. No es aleatoria y no crea variación nueva: solo actúa sobre la que ya existe." },
    { termino: "Los cuatro postulados de Darwin", definicion: "(1) existe variación heredable en las poblaciones; (2) los individuos producen más descendencia de la que puede sobrevivir; (3) algunos rasgos aumentan la probabilidad de sobrevivir y reproducirse; (4) los rasgos favorables se hacen más frecuentes en la población con el tiempo." },
    { termino: "Evolución", definicion: "El cambio en las frecuencias alélicas de una población a lo largo del tiempo; es el resultado acumulado de la selección natural." },
    { termino: "Especiación alopátrica", definicion: "El aislamiento geográfico acumula diferencias genéticas hasta que las poblaciones ya no pueden reproducirse entre sí, formando nuevas especies." },
    { termino: "Estructuras homólogas", definicion: "Estructuras de mismo origen y distinta función (ej. el húmero en humano, ballena y murciélago); evidencia de ancestro común." },
    { termino: "Genómica comparada", definicion: "Las especies más emparentadas comparten mayor porcentaje de su ADN; los humanos compartimos ~98.7% del genoma con los chimpancés." },
  ],

  // Glosario — VERBATIM del glosario interactivo A5 de P07.
  glosario: [
    { termino: "Selección natural (Darwin-Wallace)", definicion: "Mecanismo evolutivo que actúa sobre la variación heredable en una población. Los individuos con variaciones que aumentan su supervivencia y reproducción en el ambiente actual dejan más descendencia, por lo que esas variaciones se vuelven más frecuentes en la siguiente generación." },
    { termino: "Tipos de selección natural", definicion: "Selección estabilizadora: favorece fenotipos intermedios, reduce la varianza (ej: peso al nacer en humanos). Selección direccional: favorece un extremo del rango fenotípico (ej: resistencia a antibióticos). Selección disruptiva: favorece ambos extremos, puede llevar a especiación." },
    { termino: "Deriva génica", definicion: "Cambio aleatorio en la frecuencia de alelos en una población, especialmente pronunciado en poblaciones pequeñas. No es adaptativo; puede fijar alelos neutros o perjudiciales. Incluye el efecto fundador (nueva población a partir de pocos individuos) y el cuello de botella (reducción drástica del tamaño poblacional)." },
    { termino: "Evidencia fósil de la evolución", definicion: "El registro fósil muestra la cronología de aparición de grupos biológicos, formas de transición y extinciones. Las dataciones radiométricas permiten establecer la edad de los fósiles. Las series de fósiles de equinos, cetáceos (de ungulados a ballenas) y homínidos son secuencias evolutivas documentadas." },
    { termino: "Estructuras homólogas y analogías", definicion: "Homólogas: misma estructura anatómica derivada del mismo ancestro, adaptada a funciones distintas (ej: extremidad anterior de humano, ballena, murciélago). Son evidencia de ancestro común. Análogas: funciones similares pero origen evolutivo independiente (convergencia); ej: ala de ave vs ala de insecto." },
    { termino: "Especiación", definicion: "Proceso por el cual surgen nuevas especies. Especiación alopátrica: separación geográfica impide el flujo génico entre poblaciones que divergen hasta no poder reproducirse. Especiación simpátrica: aislamiento reproductivo dentro del mismo territorio (poliploidía, selección disruptiva)." },
  ],

  aplicaciones: [
    "México es uno de los 17 países megadiversos del planeta según la CONABIO: alberga el 10% de las especies conocidas en la Tierra, el mayor número en el mundo en relación a su extensión.",
    "La resistencia a antibióticos en bacterias es selección natural direccional ocurriendo en tiempo real: las bacterias resistentes sobreviven y se propagan.",
    "Los pinzones de Darwin en las Galápagos ilustran la especiación alopátrica: un ancestro colonizador se diferenció en ~14 especies con picos adaptados a distintos alimentos.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — CNEYT-VI. Ref: Campbell, Biología (12a ed.); Darwin, El origen de las especies. Lectura A1 y glosario A5, CNEYT-VI-P07.",
};

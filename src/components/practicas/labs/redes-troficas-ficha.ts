/**
 * Datos de la Ficha Teórica del laboratorio de Redes tróficas.
 *
 * Contenido VERBATIM de las actividades ancla de CNEYT-III-P02:
 *   - Marco teórico: lectura A1 «Redes tróficas y flujo de energía» (4 párrafos verbatim).
 *   - Glosario: glosario interactivo A5 «Redes tróficas y flujo de energía» (6 términos verbatim).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const REDES_TROFICAS_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-III-P02-A1 — Redes tróficas y flujo de energía",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "La energía que sustenta toda la vida en la Tierra proviene originalmente del Sol. Las plantas, algas y algunas bacterias capturan esa energía mediante la fotosíntesis y la convierten en materia orgánica (glucosa). Por eso se llaman productores o autótrofos: fabrican su propio alimento.",
    "A partir de los productores se construye la red trófica: la trama de relaciones de quién come a quién en un ecosistema. Los herbívoros (consumidores primarios) comen plantas; los carnívoros de primer orden (consumidores secundarios) comen herbívoros; los depredadores de alto nivel (consumidores terciarios o cuaternarios) comen otros carnívoros. Los descomponedores (hongos, bacterias) cierran el ciclo degradando la materia orgánica muerta y devolviendo nutrientes al suelo.",
    "Un concepto clave es la eficiencia ecológica: solo entre el 5% y el 20% de la energía de un nivel trófico se transfiere al siguiente. La regla del 10% es una simplificación didáctica útil: si los productores fijan 10,000 kcal, los consumidores primarios disponen de ~1,000 kcal, los secundarios de ~100 kcal y los terciarios de apenas ~10 kcal. El 90% restante se pierde como calor en la respiración celular, movimiento, calor corporal y heces.",
    "Esto tiene consecuencias enormes. Las pirámides de energía y biomasa muestran esta disminución en cada nivel: los ecosistemas pueden sustentar muchos más herbívoros que carnívoros. También explica por qué las dietas basadas en plantas son más eficientes energéticamente para el planeta: comer directamente del primer nivel trófico reduce las pérdidas de energía.",
  ],

  objetivos: [
    "Identificar los niveles tróficos: productores, consumidores primarios, secundarios y terciarios, y descomponedores.",
    "Explicar el flujo unidireccional de la energía en una red trófica.",
    "Aplicar la regla del 10% para calcular la energía disponible en cada nivel trófico.",
    "Distinguir entre una cadena trófica y una red trófica.",
    "Resolver el reto evaluable de verdadero o falso sobre flujo de energía y redes tróficas.",
  ],

  materiales: [
    { nombre: "Pirámide trófica 3D", detalle: "Partículas de energía ascendiendo por 4 niveles tróficos", icono: "fa-seedling" },
    { nombre: "Deslizadores interactivos", detalle: "Energía inicial (kcal) y eficiencia ecológica (%)", icono: "fa-sliders" },
    { nombre: "Selector de ecosistemas", detalle: "Mar de Cortés, bosque templado, selva húmeda mexicana", icono: "fa-earth-americas" },
    { nombre: "Pirámide de energía por nivel", detalle: "Barras proporcionales con kcal disponibles en cada nivel", icono: "fa-chart-simple" },
  ],

  // Conceptos centrales formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Red trófica", definicion: "La trama de relaciones de quién come a quién en un ecosistema; conjunto de cadenas alimentarias interconectadas." },
    { termino: "Productores (autótrofos)", definicion: "Plantas, algas y algunas bacterias que capturan energía solar mediante la fotosíntesis y la convierten en materia orgánica. Son la base de toda red trófica." },
    { termino: "Eficiencia ecológica", definicion: "Porcentaje de energía de un nivel trófico que se transfiere al siguiente. Solo entre el 5% y el 20% pasa al nivel superior; el resto se pierde como calor." },
    { termino: "Regla del 10%", definicion: "Simplificación didáctica: solo el 10% de la energía de un nivel trófico se transfiere al siguiente. De 10,000 kcal en productores, llegan ~10 kcal a los consumidores terciarios." },
    { termino: "Descomponedores", definicion: "Hongos y bacterias que degradan la materia orgánica muerta y devuelven nutrientes al suelo, cerrando el ciclo de la materia." },
  ],

  // Glosario — VERBATIM del glosario interactivo A5 de P02.
  glosario: [
    { termino: "Productor (autótrofo)", definicion: "Organismo que sintetiza materia orgánica a partir de fuentes inorgánicas mediante fotosíntesis o quimiosíntesis." },
    { termino: "Consumidor primario", definicion: "Herbívoro que se alimenta directamente de los productores." },
    { termino: "Consumidor secundario", definicion: "Organismo que se alimenta de consumidores primarios." },
    { termino: "Descomponedor", definicion: "Organismo (hongo, bacteria) que degrada materia orgánica muerta liberando nutrientes inorgánicos." },
    { termino: "Regla del 10 %", definicion: "Solo el 10 % de la energía de un nivel trófico se transfiere al siguiente; el 90 % se pierde como calor." },
    { termino: "Red trófica", definicion: "Conjunto de cadenas alimentarias interconectadas que muestra las relaciones de alimentación en un ecosistema." },
  ],

  aplicaciones: [
    "México es megadiverso en biota marina: alberga el 14% de todas las especies marinas conocidas en el planeta. El Mar de Cortés concentra más de 900 especies de peces, 32 de cetáceos y millones de aves marinas migratorias.",
    "Las pirámides tróficas explican por qué los ecosistemas pueden sustentar muchos más herbívoros que carnívoros.",
    "La regla del 10% tiene consecuencias para la producción de alimentos: las dietas basadas en plantas son más eficientes energéticamente porque evitan las pérdidas de los niveles intermedios.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1 y glosario A5, CNEYT-III-P02.",
};

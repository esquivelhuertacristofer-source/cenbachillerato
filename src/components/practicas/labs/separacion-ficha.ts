/**
 * Datos de la Ficha Teórica del laboratorio de Separación de mezclas / Destilación.
 *
 * Contenido VERBATIM de la actividad ancla CNEYT-I-P04-A1
 * («Sustancias puras, mezclas y métodos de separación»), complementado con los
 * términos de propiedades físicas de CNEYT-I-P02-A1. No se inventa nada: cada
 * párrafo del marco teórico proviene de la lectura sembrada en la plataforma.
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const SEPARACION_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-I · P04 · A1 — Sustancias puras, mezclas y métodos de separación",

  // Marco teórico — VERBATIM de la lectura A1 de P04.
  marcoTeorico: [
    "La materia que nos rodea puede clasificarse en sustancias puras y mezclas. Una sustancia pura tiene composición definida y constante: el agua pura (H₂O) siempre tiene la misma proporción de hidrógeno y oxígeno; el hierro puro siempre es Fe. Las sustancias puras pueden ser elementos (solo un tipo de átomo: hierro, oxígeno, oro) o compuestos (dos o más elementos unidos químicamente: agua, sal de mesa, glucosa).",
    "Las mezclas, en cambio, tienen composición variable: el agua de mar puede tener más o menos sal dependiendo de dónde se tome. Existen dos tipos de mezclas. Las mezclas homogéneas (o soluciones) tienen composición uniforme en toda su extensión: no se pueden ver los componentes por separado. Ejemplos: agua con sal, aire, vinagre. Las mezclas heterogéneas tienen composición no uniforme y los componentes son visibles o separables: ensalada, granito, arena con agua.",
    "Separar los componentes de una mezcla es posible mediante métodos físicos que aprovechan las diferencias en propiedades físicas de sus componentes. Los principales son: filtración (separar sólido de líquido usando un filtro), decantación (separar líquidos de diferente densidad o sólidos pesados), destilación (separar líquidos con diferente punto de ebullición), evaporación (eliminar el líquido para obtener el sólido disuelto), cristalización (obtener sólidos puros a partir de soluciones), y tamizado (separar sólidos de diferente tamaño con una malla).",
    "Estos procesos tienen aplicaciones fundamentales en la industria, la medicina y la vida cotidiana.",
  ],

  objetivos: [
    "Distinguir entre sustancias puras y mezclas, y entre mezclas homogéneas y heterogéneas.",
    "Identificar la propiedad física en que difieren los componentes de una mezcla (tamaño, densidad, punto de ebullición o magnetismo).",
    "Elegir y aplicar el método de separación adecuado a cada mezcla.",
    "Armar correctamente un equipo de destilación simple y operarlo con seguridad para separar una mezcla homogénea.",
    "Comprobar que la destilación separa líquidos y disoluciones aprovechando la diferencia de puntos de ebullición.",
  ],

  materiales: [
    { nombre: "Soporte universal con pinzas", detalle: "Sostiene el equipo", icono: "fa-grip-lines-vertical" },
    { nombre: "Matraz de destilación", detalle: "Con salida lateral", icono: "fa-flask" },
    { nombre: "Mechero Bunsen", detalle: "Fuente de calor", icono: "fa-fire" },
    { nombre: "Termómetro", detalle: "Mide el punto de ebullición", icono: "fa-temperature-half" },
    { nombre: "Refrigerante (condensador)", detalle: "Enfría y condensa el vapor", icono: "fa-wind" },
    { nombre: "Matraz colector", detalle: "Recoge el destilado", icono: "fa-flask-vial" },
    { nombre: "Mezcla a separar", detalle: "Agua con sal o agua con alcohol", icono: "fa-droplet" },
  ],

  // Conceptos centrales del lab.
  conceptos: [
    { termino: "Mezcla homogénea (solución)", definicion: "Mezcla de composición uniforme en toda su extensión, en la que no se pueden ver los componentes por separado. Ejemplos: agua con sal, aire, vinagre." },
    { termino: "Mezcla heterogénea", definicion: "Mezcla de composición no uniforme cuyos componentes son visibles o separables. Ejemplos: ensalada, granito, arena con agua." },
    { termino: "Método físico de separación", definicion: "Procedimiento que separa los componentes de una mezcla aprovechando las diferencias en sus propiedades físicas, sin cambiar la naturaleza química de las sustancias." },
    { termino: "Destilación", definicion: "Método que separa líquidos (o un sólido disuelto de un líquido) aprovechando que tienen diferente punto de ebullición: el componente más volátil hierve primero, su vapor se condensa y se recoge aparte." },
    { termino: "Punto de ebullición", definicion: "Temperatura a la que un líquido pasa al estado gaseoso. Es una propiedad específica de cada sustancia pura: el del agua es 100 °C a nivel del mar; el del etanol, 78 °C." },
  ],

  glosario: [
    { termino: "Sustancia pura", definicion: "Materia con composición definida y constante; puede ser un elemento o un compuesto." },
    { termino: "Elemento", definicion: "Sustancia pura formada por un solo tipo de átomo (hierro, oxígeno, oro)." },
    { termino: "Compuesto", definicion: "Sustancia pura formada por dos o más elementos unidos químicamente (agua, sal de mesa, glucosa)." },
    { termino: "Filtración", definicion: "Separar un sólido de un líquido usando un filtro que retiene el sólido y deja pasar el líquido." },
    { termino: "Decantación", definicion: "Separar líquidos de diferente densidad, o sólidos pesados, dejándolos asentar." },
    { termino: "Evaporación", definicion: "Eliminar el líquido de una solución para obtener el sólido que estaba disuelto." },
    { termino: "Destilado", definicion: "Líquido puro que se obtiene al condensar el vapor durante una destilación." },
    { termino: "Residuo", definicion: "Lo que permanece en el matraz de destilación tras evaporarse el componente volátil (por ejemplo, la sal)." },
    { termino: "Volátil", definicion: "Sustancia que se evapora con facilidad, es decir, que tiene un punto de ebullición bajo." },
    { termino: "Condensación", definicion: "Cambio del estado gaseoso al líquido; ocurre en el refrigerante cuando el vapor se enfría." },
  ],

  aplicaciones: [
    "Obtención de agua potable a partir de agua de mar (desalación por destilación).",
    "Producción de bebidas alcohólicas y de alcohol para uso médico e industrial.",
    "Refinación del petróleo en fracciones (gasolina, diésel, queroseno) por destilación.",
    "Purificación de disolventes y obtención de aceites esenciales.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1, CNEYT-I-P04.",
};

/**
 * Datos de la Ficha Teórica del laboratorio de Pirámide de energía (CNEYT-III-P02).
 *
 * Contenido VERBATIM de la actividad ancla A1 «Redes tróficas y flujo de energía»
 * (lectura) y del glosario A5 «Glosario — Redes tróficas y flujo de energía».
 * El reto evaluable vive en piramide-energia-data.ts (A2, RETO_A2).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const PIRAMIDE_ENERGIA_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-III-P02-A2",

  // Marco teórico — VERBATIM de la lectura A1 (CNEYT-III-P02-A1).
  marcoTeorico: [
    "La energía que sustenta toda la vida en la Tierra proviene originalmente del Sol. Las plantas, algas y algunas bacterias capturan esa energía mediante la fotosíntesis y la convierten en materia orgánica (glucosa). Por eso se llaman productores o autótrofos: fabrican su propio alimento.",
    "A partir de los productores se construye la red trófica: la trama de relaciones de quién come a quién en un ecosistema. Los herbívoros (consumidores primarios) comen plantas; los carnívoros de primer orden (consumidores secundarios) comen herbívoros; los depredadores de alto nivel (consumidores terciarios o cuaternarios) comen otros carnívoros. Los descomponedores (hongos, bacterias) cierran el ciclo degradando la materia orgánica muerta y devolviendo nutrientes al suelo.",
    "Un concepto clave es la eficiencia ecológica: solo entre el 5% y el 20% de la energía de un nivel trófico se transfiere al siguiente. La regla del 10% es una simplificación didáctica útil: si los productores fijan 10,000 kcal, los consumidores primarios disponen de ~1,000 kcal, los secundarios de ~100 kcal y los terciarios de apenas ~10 kcal. El 90% restante se pierde como calor en la respiración celular, movimiento, calor corporal y heces.",
    "Esto tiene consecuencias enormes. Las pirámides de energía y biomasa muestran esta disminución en cada nivel: los ecosistemas pueden sustentar muchos más herbívoros que carnívoros. También explica por qué las dietas basadas en plantas son más eficientes energéticamente para el planeta: comer directamente del primer nivel trófico reduce las pérdidas de energía.",
  ],

  objetivos: [
    "Identificar los niveles tróficos de una cadena alimentaria (productores, consumidores primarios, secundarios y terciarios).",
    "Aplicar la regla del 10% para calcular la energía disponible en cada nivel trófico.",
    "Explicar por qué la energía disponible disminuye en cada nivel y qué forma adopta esa disminución (pirámide).",
    "Distinguir entre una cadena trófica y una red trófica.",
    "Resolver el ejercicio evaluable de la actividad A2 aplicando la regla del 10%.",
  ],

  materiales: [
    { nombre: "Pirámide de energía 3D", detalle: "Visualiza los niveles tróficos y el flujo de energía interactivo", icono: "fa-layer-group" },
    { nombre: "Deslizador de energía", detalle: "Ajusta la energía inicial de los productores (1,000–50,000 kcal)", icono: "fa-seedling" },
    { nombre: "Deslizador de eficiencia", detalle: "Mueve la eficiencia ecológica (5–20%); la actividad usa 10%", icono: "fa-percent" },
    { nombre: "Lectura A1", detalle: "Redes tróficas y flujo de energía — CNEYT-III-P02", icono: "fa-book-open" },
  ],

  // Conceptos centrales — formulados desde A1 y complementados con el glosario A5.
  conceptos: [
    { termino: "Productores (autótrofos)", definicion: "Organismos que sintetizan materia orgánica a partir de fuentes inorgánicas mediante fotosíntesis o quimiosíntesis. Base de toda red trófica." },
    { termino: "Eficiencia ecológica", definicion: "Porcentaje de energía que se transfiere de un nivel trófico al siguiente; en la naturaleza oscila entre el 5% y el 20%." },
    { termino: "Regla del 10%", definicion: "Simplificación didáctica: solo el 10% de la energía de un nivel trófico se transfiere al siguiente; el 90% se pierde como calor." },
    { termino: "Pirámide de energía", definicion: "Representación gráfica de la disminución de energía disponible en cada nivel trófico; la base (productores) es siempre la más amplia." },
    { termino: "Red trófica", definicion: "Conjunto de cadenas alimentarias interconectadas que muestra las relaciones de alimentación en un ecosistema." },
    { termino: "Descomponedores", definicion: "Organismos (hongos, bacterias) que degradan la materia orgánica muerta liberando nutrientes inorgánicos y cerrando los ciclos de materia." },
  ],

  // Glosario — VERBATIM de A5 (CNEYT-III-P02-A5, glosario_interactivo).
  glosario: [
    { termino: "Productor (autótrofo)", definicion: "Organismo que sintetiza materia orgánica a partir de fuentes inorgánicas mediante fotosíntesis o quimiosíntesis. (Ejemplo: Las plantas, algas y cianobacterias son productores.)" },
    { termino: "Consumidor primario", definicion: "Herbívoro que se alimenta directamente de los productores. (Ejemplo: El conejo que come pasto es un consumidor primario.)" },
    { termino: "Consumidor secundario", definicion: "Organismo que se alimenta de consumidores primarios. (Ejemplo: La víbora que come al ratón (herbívoro) es un consumidor secundario.)" },
    { termino: "Descomponedor", definicion: "Organismo (hongo, bacteria) que degrada materia orgánica muerta liberando nutrientes inorgánicos. (Ejemplo: Los hongos del suelo descomponen hojas caídas.)" },
    { termino: "Regla del 10 %", definicion: "Solo el 10 % de la energía de un nivel trófico se transfiere al siguiente; el 90 % se pierde como calor. (Ejemplo: De 10 000 kcal en plantas, solo 1 000 llegan al herbívoro y 100 al carnívoro.)" },
    { termino: "Red trófica", definicion: "Conjunto de cadenas alimentarias interconectadas que muestra las relaciones de alimentación en un ecosistema. (Ejemplo: En un bosque, la red trófica incluye decenas de especies en múltiples niveles.)" },
  ],

  aplicaciones: [
    "Entender por qué las dietas basadas en plantas son más eficientes energéticamente para el planeta: comer del primer nivel trófico reduce las pérdidas de los niveles intermedios.",
    "Explicar la rareza de los depredadores tope (como el jaguar o el águila real): la pirámide de energía impone que haya pocos individuos en la cúspide.",
    "El Mar de Cortés —«el acuario del mundo»— sostiene cadenas enormes: el fitoplancton (productor) alimenta peces pequeños, que alimentan atunes y, en la cúspide, tiburones y orcas.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1 y Glosario A5, CNEYT-III-P02.",
};

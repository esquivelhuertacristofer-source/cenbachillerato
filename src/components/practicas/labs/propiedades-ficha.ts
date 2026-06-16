/**
 * Datos de la Ficha Teórica del laboratorio de Propiedades y cambios de la materia.
 *
 * Contenido VERBATIM de las actividades ancla de CNEYT-I-P02:
 *   - Marco teórico: lectura A1 «La materia y sus propiedades: lo que todo lo compone».
 *   - Glosario: glosario interactivo A5 «Materia, masa y densidad».
 *   - Aplicaciones: callout (CINVESTAV) y cierre de la lectura A1.
 * No se inventa nada: cada párrafo proviene del contenido sembrado en la plataforma.
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const PROPIEDADES_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-I · P02 · A1 — La materia y sus propiedades",

  // Marco teórico — VERBATIM de la lectura A1 de P02.
  marcoTeorico: [
    "La materia es todo lo que tiene masa y ocupa un espacio. Desde el aire que respiramos hasta el agua, las rocas, los metales y nuestros propios cuerpos: todo está hecho de materia. Para estudiarla, los científicos la describen a través de sus propiedades, que se clasifican en físicas y químicas.",
    "Las propiedades físicas son aquellas que pueden medirse u observarse sin cambiar la composición química de la materia: la masa (cantidad de materia), el volumen (espacio que ocupa), la densidad (masa por unidad de volumen), el color, el punto de fusión, el punto de ebullición, la conductividad eléctrica y térmica, la dureza y la maleabilidad. Estas propiedades nos sirven para identificar sustancias: el oro se reconoce por su densidad y color, el cobre por su conductividad.",
    "Las propiedades químicas describen cómo una sustancia reacciona con otras o se transforma en una sustancia diferente: la inflamabilidad (facilidad para arder), la oxidación (reacción con el oxígeno, como el óxido del hierro), la acidez o basicidad, y la reactividad. Las propiedades químicas solo se observan cuando se produce un cambio químico.",
    "La distinción entre propiedades físicas y químicas es fundamental en química porque nos ayuda a predecir cómo se comportará la materia en distintas condiciones y aplicaciones industriales, médicas y tecnológicas.",
  ],

  objetivos: [
    "Distinguir entre propiedades físicas y propiedades químicas de la materia.",
    "Aplicar transformaciones a distintas sustancias y observar la evidencia que producen.",
    "Clasificar cada transformación como cambio físico (la sustancia sigue siendo la misma) o cambio químico (se forma una sustancia nueva).",
    "Reconocer las pistas de un cambio químico: gas, cambio de color permanente, calor o ceniza, y la dificultad para revertirlo.",
    "Comprobar la comprensión respondiendo el cuestionario de la práctica.",
  ],

  materiales: [
    { nombre: "Hielo (agua sólida)", detalle: "Cambio de estado al calentarse", icono: "fa-icicles" },
    { nombre: "Vidrio", detalle: "Cambia de forma al romperse", icono: "fa-hammer" },
    { nombre: "Agua líquida", detalle: "Se evapora con calor", icono: "fa-droplet" },
    { nombre: "Papel", detalle: "Arde y deja ceniza", icono: "fa-fire" },
    { nombre: "Clavo de hierro", detalle: "Se oxida (herrumbre)", icono: "fa-wrench" },
    { nombre: "Vinagre y bicarbonato", detalle: "Reaccionan y liberan gas", icono: "fa-flask" },
  ],

  // Conceptos centrales del lab (faithful a la lectura A1 y a la pedagogía de la práctica).
  conceptos: [
    { termino: "Propiedad física", definicion: "Característica que puede medirse u observarse sin cambiar la composición química de la materia: masa, volumen, densidad, color, punto de fusión y de ebullición, conductividad, dureza y maleabilidad." },
    { termino: "Propiedad química", definicion: "Característica que describe cómo una sustancia reacciona o se transforma en otra distinta: inflamabilidad, oxidación, acidez o basicidad y reactividad. Solo se observa cuando ocurre un cambio químico." },
    { termino: "Cambio físico", definicion: "Transformación en la que la sustancia sigue siendo la misma: solo cambia su forma, tamaño o estado. Suele poder revertirse (fundir hielo, evaporar agua, romper un vidrio)." },
    { termino: "Cambio químico", definicion: "Transformación en la que se forman sustancias nuevas. Hay evidencia como gas, cambio de color permanente, calor o ceniza, y no se revierte fácilmente (quemar papel, oxidar hierro, vinagre con bicarbonato)." },
    { termino: "Evidencia de reacción", definicion: "Señales que delatan un cambio químico: aparición de burbujas o gas, cambio de color que no se revierte, liberación de calor o luz, y formación de un sólido o ceniza." },
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
    "Identificar sustancias por sus propiedades físicas: el oro por su densidad y color, el cobre por su conductividad.",
    "Predecir cómo se comportará un material en aplicaciones industriales, médicas y tecnológicas.",
    "En México, el CINVESTAV (Centro de Investigación y de Estudios Avanzados del IPN) es el principal centro de ciencia experimental, con laboratorios en Biología, Química, Física, Ingeniería y Biotecnología.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1, CNEYT-I-P02.",
};

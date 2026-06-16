/**
 * Datos de la Ficha Teórica del laboratorio de Escala de pH.
 *
 * Contenido VERBATIM de las actividades ancla de CNEYT-IV-P03:
 *   - Marco teórico: lectura A1 «El pH: ácidos, bases y la química de lo cotidiano»
 *     (párrafos verbatim).
 *   - Glosario: glosario interactivo A5 «pH, ácidos y bases» (6 términos verbatim).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const PH_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-IV · P03 · A1 — El pH: ácidos, bases y la química de lo cotidiano",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "Cada vez que exprimimos un limón, tomamos agua o aplicamos jabón en las manos, estamos interactuando con sustancias que tienen un grado de acidez o basicidad diferente. La escala que mide esta propiedad se llama pH, y va de 0 a 14: un número que sintetiza la concentración de iones hidrógeno en una solución.",
    "Los ácidos tienen un pH menor a 7. Cuanto más bajo el número, más ácida y potencialmente corrosiva es la sustancia. El jugo de limón tiene un pH de aproximadamente 2, el vinagre de 3 y el café negro de 5. El ácido clorhídrico que produce el estómago humano tiene un pH entre 1.5 y 2, lo que lo hace suficientemente ácido para descomponer las proteínas de los alimentos. Cuando hay demasiado ácido gástrico se produce la acidez o gastritis.",
    "Las bases, también llamadas álcalis, tienen un pH mayor a 7. El bicarbonato de sodio tiene un pH de 8.4, razón por la que se usa como antiácido: neutraliza el exceso de ácido en el estómago. El jabón de barra tiene un pH entre 9 y 10. La lejía (hipoclorito de sodio), usada para limpiar y desinfectar, tiene un pH de 12 a 13 y puede irritar la piel.",
    "El pH neutro es exactamente 7 y corresponde al agua pura a 25°C. El agua potable puede tener un pH ligeramente diferente dependiendo de los minerales disueltos y el tratamiento al que fue sometida.",
    "Para medir el pH sin instrumentos electrónicos podemos usar indicadores naturales. La col morada contiene antocianinas, pigmentos que cambian de color según el pH del medio: en soluciones ácidas se vuelven rojas o rosas, en neutras permanecen moradas y en básicas se tornan azules o verdes. Este es un experimento clásico y de bajo costo que se puede realizar en el laboratorio escolar o incluso en casa.",
    "El control del pH es vital para la salud humana. La sangre debe mantenerse en un rango de pH muy estrecho: entre 7.35 y 7.45. Si el pH sanguíneo sale de ese rango, se producen condiciones médicas graves como acidosis o alcalosis. Los riñones y los pulmones trabajan constantemente para mantener ese equilibrio.",
    "En México, la norma NOM-127-SSA1-2021 establece que el agua potable debe tener un pH entre 6.5 y 8.5 para ser segura para el consumo humano. La CONAGUA monitorea el pH de los cuerpos de agua del país para garantizar la calidad del recurso.",
  ],

  objetivos: [
    "Interpretar la escala de pH (0–14) y clasificar soluciones como ácidas, neutras o básicas.",
    "Identificar ácidos y bases de uso cotidiano con sus valores de pH correspondientes.",
    "Describir la reacción de neutralización: ácido + base → sal + agua.",
    "Explicar la función de los buffers (soluciones amortiguadoras) en sistemas biológicos como la sangre.",
    "Reconocer la importancia del rango de pH sanguíneo (7.35–7.45) para la salud humana.",
    "Aprobar el cuestionario de verdadero/falso de la actividad A4.",
  ],

  materiales: [
    { nombre: "Escala de pH (visor 3D)", detalle: "Muestra el indicador de col morada y el pH 0–14 en tiempo real", icono: "fa-flask" },
    { nombre: "Panel de sustancias", detalle: "6 sustancias del laboratorio + sustancias cotidianas de la lectura", icono: "fa-vials" },
    { nombre: "Titulador ácido-base", detalle: "Ácido fuerte (HCl) o débil (vinagre) + NaOH gota a gota", icono: "fa-droplet" },
    { nombre: "Curva de titulación", detalle: "Gráfica pH vs. gotas con punto de equivalencia y región buffer", icono: "fa-chart-line" },
    { nombre: "Panel de buffers", detalle: "Compara ΔpH entre agua pura y sistema bicarbonato (sangre)", icono: "fa-shield-halved" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1 y el glosario A5.
  conceptos: [
    { termino: "pH", definicion: "Medida de la concentración de iones hidrógeno (H⁺) en solución, en escala de 0 a 14. pH < 7 ácido, pH = 7 neutro, pH > 7 básico. La escala es logarítmica: bajar 1 en pH significa 10 veces más H⁺." },
    { termino: "Ácido", definicion: "Sustancia con pH menor a 7 que libera iones H⁺ en solución. Ejemplos: jugo de limón (pH ≈ 2), vinagre (pH ≈ 3), café negro (pH ≈ 5), ácido clorhídrico estomacal (pH 1.5–2)." },
    { termino: "Base (álcali)", definicion: "Sustancia con pH mayor a 7 que libera iones OH⁻. Ejemplos: bicarbonato de sodio (pH 8.4), jabón de barra (pH 9–10), lejía (pH 12–13)." },
    { termino: "Neutralización", definicion: "Reacción entre un ácido y una base que produce sal y agua, aproximando el pH a 7. Ejemplo: HCl + NaOH → NaCl + H₂O." },
    { termino: "Buffer (solución tampón)", definicion: "Solución que resiste cambios bruscos de pH al añadir pequeñas cantidades de ácido o base. La sangre usa el sistema bicarbonato (HCO₃⁻/H₂CO₃) para mantenerse entre 7.35 y 7.45." },
    { termino: "Indicador natural de pH", definicion: "Sustancia que cambia de color según el pH. La col morada (antocianinas): rojo/rosa en ácido, morado en neutro, azul/verde en básico." },
  ],

  // Glosario — VERBATIM del glosario interactivo A5 de P03 (6 términos presentes).
  glosario: [
    { termino: "pH", definicion: "Medida de la concentración de iones hidrógeno (H⁺) en solución, en escala de 0 a 14. pH < 7 ácido, pH = 7 neutro, pH > 7 básico." },
    { termino: "Ácido de Arrhenius", definicion: "Sustancia que en solución acuosa libera iones hidrógeno (H⁺). Según Brønsted-Lowry, es un donador de protones." },
    { termino: "Base de Arrhenius", definicion: "Sustancia que en solución acuosa libera iones hidróxido (OH⁻). Según Brønsted-Lowry, es un aceptor de protones." },
    { termino: "Neutralización", definicion: "Reacción entre un ácido y una base que produce sal y agua, aproximando el pH al valor neutro 7." },
    { termino: "Indicador de pH", definicion: "Sustancia (natural o sintética) que cambia de color en función del pH de la solución, permitiendo estimar su acidez o basicidad." },
    { termino: "Buffer (solución tampón)", definicion: "Solución que resiste cambios bruscos de pH al añadir pequeñas cantidades de ácido o base." },
  ],

  aplicaciones: [
    "La norma NOM-127-SSA1-2021 exige que el agua potable en México tenga un pH entre 6.5 y 8.5.",
    "Los antiácidos (bicarbonato, hidróxido de magnesio) neutralizan el exceso de HCl gástrico y alivian la acidez estomacal.",
    "Los suelos agrícolas con pH extremo (muy ácido o muy básico) impiden la absorción de nutrientes por las plantas.",
    "La lluvia ácida (pH < 5.6) daña bosques, suelos y monumentos de piedra caliza en zonas como la Ciudad de México.",
    "La sangre humana usa el sistema buffer bicarbonato (HCO₃⁻/H₂CO₃) para mantenerse en el rango vital 7.35–7.45.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1 y glosario A5, CNEYT-IV-P03.",
};

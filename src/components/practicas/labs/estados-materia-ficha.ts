/**
 * Datos de la Ficha Teórica del laboratorio de Estados de la materia.
 *
 * Contenido VERBATIM de las actividades ancla de CNEYT-I-P05:
 *   - Marco teórico: lectura A1 «Los estados de la materia y sus cambios»
 *     (4 párrafos verbatim).
 *   - Glosario: glosario interactivo A5 «Estados de la materia y energía»
 *     [marcado borrador en el dump; se incluyen los términos verbatim].
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const ESTADOS_MATERIA_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-I · P05 · A1 — Los estados de la materia y sus cambios",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "La materia puede existir en diferentes estados de agregación: sólido, líquido, gas y plasma (este último menos común en la vida cotidiana). El estado en que se encuentra la materia depende principalmente de la temperatura y la presión, que determinan la energía cinética de las partículas y las fuerzas de atracción entre ellas.",
    "En el estado sólido, las partículas están muy juntas y vibran en posiciones fijas. Los sólidos tienen forma y volumen definidos, y son muy poco compresibles. En el estado líquido, las partículas están unidas pero pueden moverse entre sí: los líquidos tienen volumen definido pero adoptan la forma del recipiente que los contiene. En el estado gaseoso, las partículas están muy separadas y se mueven libremente: los gases no tienen ni forma ni volumen definidos y se comprimen fácilmente.",
    "Los cambios de estado ocurren cuando se agrega o se extrae energía (calor). Los nombres de esos cambios son: fusión (sólido → líquido), solidificación (líquido → sólido), vaporización o evaporación (líquido → gas), condensación (gas → líquido), sublimación (sólido → gas directamente) y deposición (gas → sólido directamente). La temperatura a la que ocurren estos cambios es específica para cada sustancia pura: el punto de fusión del agua es 0°C y su punto de ebullición es 100°C a nivel del mar.",
    "Estos cambios de estado son reversibles: la materia no cambia su naturaleza química, solo su forma de organizarse.",
  ],

  objetivos: [
    "Identificar los estados de agregación de la materia (sólido, líquido, gas) y sus propiedades.",
    "Explicar cómo la temperatura y la presión determinan el estado de una sustancia.",
    "Nombrar y describir los seis cambios de estado: fusión, solidificación, vaporización, condensación, sublimación y deposición.",
    "Relacionar los cambios de estado con la energía cinética, potencial e interna de las partículas.",
    "Resolver el reto de estados de la materia.",
  ],

  materiales: [
    { nombre: "Visor 3D de partículas", detalle: "Muestra el movimiento de las partículas en cada estado (sólido, líquido, gas)", icono: "fa-atom" },
    { nombre: "Termómetro de fases", detalle: "Visualiza los puntos de fusión y ebullición de cada sustancia", icono: "fa-temperature-half" },
    { nombre: "Selector de sustancias", detalle: "Agua, etanol, oxígeno, nitrógeno, mercurio, hierro — con datos reales", icono: "fa-flask" },
    { nombre: "Gráfica de energía", detalle: "Energía cinética relativa de las partículas en función de la temperatura", icono: "fa-chart-line" },
  ],

  // Conceptos centrales del lab — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Estado de agregación", definicion: "Forma en que se organiza la materia según la temperatura y la presión. Los tres estados principales son sólido, líquido y gas; difieren en la separación y el movimiento de sus partículas." },
    { termino: "Energía cinética de las partículas", definicion: "Energía asociada al movimiento de las partículas. A mayor temperatura, mayor energía cinética: las partículas se mueven más rápido. La temperatura es una medida de la energía cinética promedio." },
    { termino: "Cambio de estado", definicion: "Transformación de la materia de un estado a otro al agregar o extraer energía (calor). Son físicos: la composición química no cambia." },
    { termino: "Fusión y vaporización", definicion: "Fusión: paso de sólido a líquido. Vaporización: paso de líquido a gas. Ambos requieren absorber energía. Sus procesos inversos son solidificación y condensación." },
    { termino: "Sublimación", definicion: "Cambio directo de sólido a gas sin pasar por el estado líquido. Ejemplo clásico: el hielo seco (CO₂ sólido). El proceso inverso se llama deposición." },
    { termino: "Punto de fusión y ebullición", definicion: "Temperaturas específicas (a presión dada) en que ocurren los cambios de estado. Son propiedades características de cada sustancia pura: el agua funde a 0 °C y hierve a 100 °C a nivel del mar." },
  ],

  // Glosario — VERBATIM del glosario interactivo A5 de P05 [borrador].
  glosario: [
    { termino: "Teoría cinética molecular", definicion: "Modelo que explica la materia como partículas en movimiento constante." },
    { termino: "Energía cinética", definicion: "Energía asociada al movimiento de las partículas." },
    { termino: "Energía potencial", definicion: "Energía asociada a las fuerzas de atracción entre partículas." },
    { termino: "Energía interna", definicion: "Suma de la energía cinética y potencial de todas las partículas." },
    { termino: "Temperatura", definicion: "Medida de la energía cinética promedio de las partículas." },
    { termino: "Sublimación", definicion: "Cambio directo de sólido a gas." },
  ],

  aplicaciones: [
    "La refrigeración industrial usa cambios de estado (evaporación del refrigerante) para transferir calor.",
    "El CINVESTAV (Centro de Investigación y de Estudios Avanzados del IPN) estudia estados exóticos de la materia como plasmas y condensados de Bose-Einstein.",
    "La meteorología explica la lluvia, la nieve y el granizo como cambios de estado del agua en la atmósfera.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1 y glosario A5 [borrador], CNEYT-I-P05.",
};

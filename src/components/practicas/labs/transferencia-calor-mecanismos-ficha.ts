/**
 * Datos de la Ficha Teórica del laboratorio de Transferencia de calor.
 *
 * Contenido VERBATIM de las actividades ancla de CNEYT-II-P04:
 *   - Marco teórico: infografía A1 «Calor, temperatura y mecanismos de
 *     transferencia» (puntos clave verbatim).
 *   - Glosario: glosario interactivo A5 «Calor, temperatura y propagación».
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const TRANSFERENCIA_CALOR_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-II · P04 · A1 — Calor, temperatura y mecanismos de transferencia",

  // Marco teórico — VERBATIM de los puntos clave de la infografía A1.
  marcoTeorico: [
    "Temperatura: medida del movimiento promedio (energía cinética) de las partículas de un cuerpo. A mayor temperatura, mayor velocidad de movimiento de las partículas. Unidades: Kelvin (K), Celsius (°C), Fahrenheit (°F).",
    "Conversión de escalas: K = °C + 273.15. El cero absoluto (0 K = −273.15°C) es la temperatura teórica en que las partículas dejan de moverse. La escala Fahrenheit: °F = (°C × 9/5) + 32.",
    "Calor: energía en tránsito que fluye espontáneamente de un cuerpo a mayor temperatura hacia uno de menor temperatura. Unidad: Joule (J) en el Sistema Internacional. 1 caloría = 4.184 J.",
    "Conducción: transferencia de calor por contacto directo entre partículas adyacentes sin movimiento de materia. Más eficiente en sólidos, especialmente metales. Ejemplo: el mango de una sartén caliente. Materiales aislantes (madera, lana, adobe) tienen baja conductividad.",
    "Convección: transferencia de calor por movimiento masivo de fluidos (líquidos o gases). El fluido caliente, menos denso, asciende; el frío, más denso, desciende, creando corrientes. Ejemplo: calentador de agua, viento marino, corrientes oceánicas.",
    "Radiación: transferencia de calor por ondas electromagnéticas, sin necesidad de medio material. Es el único mecanismo que funciona en el vacío. El Sol transfiere energía a la Tierra (150 millones de km) por radiación. Longitud de onda del infrarrojo: 700 nm a 1 mm.",
    "Equilibrio térmico: cuando dos cuerpos en contacto alcanzan la misma temperatura, el flujo de calor entre ellos se detiene. La temperatura final es un promedio ponderado por sus masas y calores específicos.",
    "Aplicaciones prácticas: aislamiento térmico (paredes de poliestireno, ropa de invierno) reduce la conducción; el efecto invernadero es radiación atrapada; las corrientes de convección generan los vientos y las corrientes marinas que regulan el clima.",
    "El calor específico: cantidad de calor necesaria para elevar 1°C la temperatura de 1 gramo de una sustancia. El agua tiene calor específico muy alto (4.18 J/g°C), lo que la hace ideal para almacenar y transportar calor.",
  ],

  objetivos: [
    "Distinguir conceptualmente el calor (energía en tránsito) de la temperatura (movimiento promedio de las partículas).",
    "Identificar y explicar los tres mecanismos de transferencia de calor: conducción, convección y radiación.",
    "Reconocer el equilibrio térmico como el estado en que dos cuerpos en contacto igualan su temperatura.",
    "Manejar las escalas de temperatura (°C, K, °F) y la conversión K = °C + 273.15.",
    "Resolver el reto de verdadero o falso sobre calor y temperatura de la práctica.",
  ],

  materiales: [
    { nombre: "Visor 3D de transferencia", detalle: "Hace visibles los tres mecanismos uno por uno", icono: "fa-fire" },
    { nombre: "Barra de conducción", detalle: "Conductores y aislantes (cobre, madera) con su conductividad", icono: "fa-cubes-stacked" },
    { nombre: "Celda de convección", detalle: "El fluido caliente sube y el frío baja, creando corrientes", icono: "fa-water" },
    { nombre: "Fuente de radiación", detalle: "Ondas que cruzan el vacío del Sol a la Tierra", icono: "fa-sun" },
  ],

  // Conceptos centrales del lab — formulados a partir de la infografía A1.
  conceptos: [
    { termino: "Temperatura", definicion: "Medida del movimiento promedio (energía cinética) de las partículas de un cuerpo. A mayor temperatura, mayor velocidad de movimiento de las partículas. Se mide en K, °C o °F." },
    { termino: "Calor", definicion: "Energía en tránsito que fluye espontáneamente de un cuerpo a mayor temperatura hacia uno de menor temperatura. Unidad: Joule (J); 1 caloría = 4.184 J." },
    { termino: "Conducción", definicion: "Transferencia de calor por contacto directo entre partículas adyacentes sin movimiento de materia. Más eficiente en sólidos, especialmente metales." },
    { termino: "Convección", definicion: "Transferencia de calor por movimiento masivo de fluidos: el fluido caliente, menos denso, asciende; el frío, más denso, desciende, creando corrientes." },
    { termino: "Radiación", definicion: "Transferencia de calor por ondas electromagnéticas, sin necesidad de medio material. Es el único mecanismo que funciona en el vacío." },
  ],

  // Glosario — VERBATIM del glosario interactivo A5 de P04.
  glosario: [
    { termino: "Temperatura", definicion: "Medida de la agitación o energía cinética promedio de las partículas de un cuerpo." },
    { termino: "Calor", definicion: "Energía que se transfiere entre cuerpos por una diferencia de temperatura." },
    { termino: "Equilibrio térmico", definicion: "Estado en que dos cuerpos en contacto alcanzan la misma temperatura." },
    { termino: "Conducción", definicion: "Propagación del calor por contacto directo entre partículas, sin que la materia se desplace." },
    { termino: "Convección", definicion: "Propagación del calor por el movimiento de un fluido (líquido o gas)." },
    { termino: "Radiación", definicion: "Propagación del calor mediante ondas, sin necesidad de un medio material." },
  ],

  aplicaciones: [
    "El aislamiento térmico (paredes de poliestireno, ropa de invierno) reduce la conducción para mantener el calor.",
    "El efecto invernadero es radiación infrarroja atrapada por ciertos gases de la atmósfera.",
    "Las corrientes de convección generan los vientos y las corrientes marinas que regulan el clima.",
    "Las técnicas de construcción tradicional mexicana (adobe, tierra apisonada, teja) explotan la baja conductividad térmica para mantener los espacios frescos de día y templados de noche.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Infografía A1, CNEYT-II-P04.",
};

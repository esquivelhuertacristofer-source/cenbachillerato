/**
 * Datos de la Ficha Teórica del laboratorio "La oxigenación de la atmósfera"
 * (CNEYT-III, progresión 5; actividades CNEYT-III-P11).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: lectura A1 «El oxígeno que respiramos: de la atmósfera
 *     primitiva a la actual» (5 párrafos).
 *   - Glosario: glosario interactivo A5 (10 términos).
 * Conceptos centrales y aplicaciones: redactados para el laboratorio con datos
 * verificables (ver la nota al pie del laboratorio).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, LECTURA_A1, FUENTE } from "./oxigenacion-atmosfera-data";

export const OXIGENACION_ATMOSFERA_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-III · P11 · A1 — El oxígeno que respiramos: de la atmósfera primitiva a la actual",

  marcoTeorico: LECTURA_A1,

  objetivos: [
    "Explicar por qué la atmósfera primitiva no tenía oxígeno libre y en qué se diferencia de la actual.",
    "Reconocer a los organismos fotosintéticos, sobre todo las cianobacterias, como la fuente del O₂ atmosférico.",
    "Explicar por qué el O₂ tardó cientos de millones de años en acumularse: primero oxidó el hierro disuelto y los gases volcánicos.",
    "Leer una reconstrucción del O₂ atmosférico con su incertidumbre y ubicar el Gran Evento de Oxidación.",
    "Relacionar la formación de la capa de ozono con la protección contra la radiación ultravioleta.",
    "Balancear reacciones de combustión y clasificar sus óxidos en básicos (metal) y ácidos (no metal).",
  ],

  materiales: [
    { nombre: "Mar primitivo en corte", detalle: "Estromatolitos con cianobacterias, fuente hidrotermal con Fe²⁺ y fondo marino.", icono: "fa-water" },
    { nombre: "Balance de oxígeno", detalle: "Producción de O₂ frente a los sumideros: hierro y gases volcánicos.", icono: "fa-scale-balanced" },
    { nombre: "Planeta y línea del tiempo", detalle: "La Tierra de hace 4,000 millones de años hasta hoy, con su capa de ozono.", icono: "fa-earth-americas" },
    { nombre: "Gráfica de O₂ con incertidumbre", detalle: "Banda de valores posibles en escala logarítmica.", icono: "fa-chart-area" },
    { nombre: "Mechero y cucharilla de combustión", detalle: "Magnesio, calcio, azufre y carbono; un clavo de hierro que se oxida.", icono: "fa-fire-burner" },
    { nombre: "Frasco con indicador universal", detalle: "Muestra el pH del óxido disuelto en agua.", icono: "fa-flask" },
  ],

  conceptos: [
    {
      termino: "Sumideros de oxígeno",
      definicion: "Sustancias que consumen O₂ al oxidarse: el hierro ferroso (Fe²⁺) disuelto en el mar y los gases volcánicos reductores (H₂, CH₄, H₂S). Mientras abundan, el O₂ no se acumula en el aire.",
    },
    {
      termino: "Formaciones de hierro bandeado",
      definicion: "Rocas con capas alternas ricas en óxidos de hierro y en sílice. Se formaron cuando el O₂ oxidó el hierro disuelto: 4 Fe²⁺ + O₂ + 10 H₂O → 4 Fe(OH)₃ + 8 H⁺, que precipitó al fondo. Abundan entre ~2,500 y 1,850 millones de años.",
    },
    {
      termino: "Gran Evento de Oxidación",
      definicion: "Periodo, entre unos 2,400 y 2,100 millones de años atrás, en que el O₂ se acumuló por primera vez en la atmósfera. Aun así, quedó muy por debajo del nivel actual durante más de mil millones de años.",
    },
    {
      termino: "Estromatolitos",
      definicion: "Estructuras en capas que forman comunidades de microbios, entre ellos cianobacterias, al atrapar sedimentos. Los más antiguos tienen unos 3,450 millones de años; en México aún crecen en Cuatro Ciénegas y Bacalar.",
    },
    {
      termino: "Escudo de ozono",
      definicion: "La radiación UV rompe moléculas de O₂ y los átomos libres forman O₃ en la estratósfera. Esa capa absorbe la mayor parte del UV dañino, lo que hizo posible la vida en tierra firme.",
    },
    {
      termino: "Respiración aerobia",
      definicion: "Usa O₂ para oxidar la glucosa por completo: obtiene hasta unos 30–32 ATP por glucosa, frente a 2 ATP de la fermentación. Esa energía extra sostiene a los organismos grandes y activos.",
    },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: g.definicion })),

  aplicaciones: [
    "Las formaciones de hierro bandeado son la principal fuente del mineral de hierro que se extrae en el mundo.",
    "El fitoplancton de los océanos aporta cerca de la mitad de la fotosíntesis del planeta: cuidar los mares también es cuidar el oxígeno.",
    "En Cuatro Ciénegas (Coahuila) y Bacalar (Quintana Roo) se protegen estromatolitos vivos, testigos de cómo se oxigenó la Tierra.",
    "La cal (hidróxido de calcio) que se usa para nixtamalizar el maíz viene de un óxido básico: el óxido de calcio.",
    "Reducir las emisiones de óxidos de azufre y nitrógeno de autos e industrias disminuye la lluvia ácida.",
  ],

  fuente: FUENTE,
};

/**
 * Datos de la Ficha Teórica del laboratorio "Energías renovables y no
 * renovables en México" (CNEYT-II, progresión 11; actividades CNEYT-II-P07-A*).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: infografía A1 «Matriz energética de México: renovables,
 *     no renovables y la transición pendiente» (contexto mexicano y puntos
 *     clave).
 *   - Glosario: glosario de la infografía A1 y glosario interactivo A5.
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { CONTEXTO_A1, PUNTOS_A1, GLOSARIO_A1, GLOSARIO, FUENTE } from "./renovables-mexico-data";

export const RENOVABLES_MEXICO_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-II · P07 · A1 — Matriz energética de México: renovables, no renovables y la transición pendiente",

  marcoTeorico: [...CONTEXTO_A1, ...PUNTOS_A1],

  objetivos: [
    "Clasificar las fuentes de energía de México en renovables y no renovables con el criterio de reposición, no el de contaminación.",
    "Distinguir la capacidad instalada (MW) de la energía que una central genera en un año (MWh) mediante el factor de planta.",
    "Explicar por qué el sol y el viento son variables y qué papel tienen el almacenamiento y el respaldo para cubrir la demanda.",
    "Estimar las emisiones de ciclo de vida de una mezcla eléctrica y comparar el efecto de retirar carbón o gas.",
    "Relacionar el agotamiento de los yacimientos con la caída de la producción petrolera de México.",
  ],

  materiales: [
    { nombre: "Mapa en relieve de México", detalle: "Doce centrales reales: geotérmicas, eólicas, solar, hidroeléctricas, nuclear y térmicas.", icono: "fa-map-location-dot" },
    { nombre: "Red regional de ejemplo", detalle: "Campo solar, aerogeneradores, geotermia, baterías, central de gas y una ciudad, hora por hora.", icono: "fa-tower-broadcast" },
    { nombre: "Torres de la mezcla nacional", detalle: "Nueve tecnologías con su participación y sus emisiones de ciclo de vida.", icono: "fa-chart-column" },
    { nombre: "Columnas de barriles", detalle: "Producción de petróleo de México de 2004 a 2023.", icono: "fa-oil-well" },
  ],

  conceptos: [
    {
      termino: "Renovable no es lo mismo que limpia",
      definicion: "Renovable describe si la fuente se repone en una escala de tiempo humana; limpia, si casi no emite. La nuclear es limpia y no renovable; la biomasa es renovable y sí emite al quemarse.",
    },
    {
      termino: "Factor de planta",
      definicion: "Fracción del año que una central equivaldría a estar a plena potencia: energía anual = capacidad (MW) × factor de planta × 8760 h. Una nuclear ronda 90 %, un parque solar 25–30 %.",
    },
    {
      termino: "Intermitencia",
      definicion: "El sol solo genera de día y el viento cambia con la hora y la estación. La red debe igualar generación y demanda en cada instante.",
    },
    {
      termino: "Almacenamiento y respaldo",
      definicion: "Las baterías guardan el excedente del mediodía para la noche (con pérdidas); las centrales despachables, como gas, hidro o geotermia, cubren lo que falte.",
    },
    {
      termino: "Emisiones de ciclo de vida",
      definicion: "CO₂ equivalente por kWh sumando fabricación, construcción, operación y desmantelamiento. Medianas del IPCC: carbón 820 g, gas 490 g, solar 48 g, geotermia 38 g, hidro 24 g, nuclear 12 g, eólica 11 g.",
    },
    {
      termino: "Declive de un yacimiento",
      definicion: "Al extraer petróleo baja la presión del yacimiento y cada pozo rinde menos; mantener la producción exige perforar campos nuevos, más profundos y caros.",
    },
  ],

  glosario: [...GLOSARIO_A1, ...GLOSARIO.filter((g) => !GLOSARIO_A1.some((a) => a.termino === g.termino)).map((g) => ({ termino: g.termino, definicion: g.definicion }))],

  aplicaciones: [
    "Los operadores de la red (en México, el CENACE) programan cada día qué centrales encender para seguir la curva de demanda.",
    "Las empresas que llegan por nearshoring piden contratos de energía limpia para cumplir sus metas ESG.",
    "Un techo con paneles solares en Sonora produce más energía al año que el mismo techo en un lugar nublado del centro del país.",
    "Comparar recibos: el consumo en kWh es energía; la potencia de un aparato en watts es lo que exige en cada momento.",
  ],

  fuente: FUENTE,
};

/**
 * Datos de la Ficha Teórica del laboratorio "Contaminantes químicos y
 * plásticos" (CNEYT-IV, progresión 10; actividades CNEYT-IV-P07).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: lectura A1 «Contaminantes químicos y plásticos: la crisis
 *     silenciosa» (7 párrafos).
 *   - Glosario: glosario interactivo A5 (6 términos).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, LECTURA_A1, FUENTE } from "./contaminantes-plasticos-data";

export const CONTAMINANTES_PLASTICOS_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-IV · P07 · A1 — Contaminantes químicos y plásticos: la crisis silenciosa",

  marcoTeorico: LECTURA_A1,

  objetivos: [
    "Predecir si un plástico flota o se hunde en el mar comparando su densidad con la del agua de mar (1.025 g/cm³).",
    "Explicar que el plástico se fragmenta en micro y nanoplásticos, pero no desaparece, y que se fragmenta más rápido al sol que en el fondo marino.",
    "Reconocer por qué una red de superficie no puede limpiar el océano.",
    "Distinguir la bioacumulación (dentro de un organismo, con el tiempo) de la biomagnificación (de presa a depredador).",
    "Calcular la ingesta semanal de metilmercurio de una persona y compararla con el límite tolerable.",
    "Evaluar el destino de un residuo (reciclaje, composta, relleno o río) desde la economía circular.",
  ],

  materiales: [
    { nombre: "Siete plásticos con su código de resina", detalle: "PET, PEAD, PVC, PEBD, PP, PS y nailon (código 7), con su densidad real.", icono: "fa-recycle" },
    { nombre: "Playa y columna de agua", detalle: "Sol y oleaje en la arena, superficie del mar y fondo oscuro.", icono: "fa-water" },
    { nombre: "Red de manta", detalle: "Red de superficie con malla de 0.333 mm, la que se usa para muestrear microplásticos.", icono: "fa-border-all" },
    { nombre: "Dos cadenas alimenticias acuáticas", detalle: "DDT en un estuario (datos del quiz A2) y metilmercurio en el mar.", icono: "fa-fish" },
    { nombre: "Calculadora de ingesta", detalle: "Mercurio promedio en pescado comercial (FDA) y límite de 1.6 µg/kg por semana (FAO/OMS).", icono: "fa-calculator" },
    { nombre: "Cuatro destinos de residuos", detalle: "Planta de reciclaje, composta con termómetro, relleno sanitario y río.", icono: "fa-trash-arrow-up" },
  ],

  conceptos: [
    {
      termino: "Densidad y flotación",
      definicion: "Un material flota si es menos denso que el líquido. El agua de mar tiene unos 1.025 g/cm³: el polietileno (0.91–0.97) y el polipropileno (0.90) flotan; el PET (1.38), el PVC (1.30–1.45) y el nailon (1.14) se hunden.",
    },
    {
      termino: "Fragmentarse no es degradarse",
      definicion: "La luz UV, el calor y el oleaje rompen el plástico en pedazos cada vez más pequeños, pero esos pedazos siguen siendo plástico. Convertirlo por completo en CO₂ y agua es muchísimo más lento; por eso las cifras de «años en degradarse» son sólo estimaciones.",
    },
    {
      termino: "Clases de tamaño",
      definicion: "Macroplástico: más de 25 mm. Mesoplástico: de 5 a 25 mm. Microplástico: menos de 5 mm. Nanoplástico: menos de 1 micrómetro (una milésima de milímetro).",
    },
    {
      termino: "Bioacumulación frente a biomagnificación",
      definicion: "La bioacumulación ocurre dentro de un organismo: con los años absorbe más de lo que elimina, por eso un atún viejo tiene más mercurio que uno joven. La biomagnificación ocurre entre niveles: cada depredador concentra lo que traían todas sus presas.",
    },
    {
      termino: "Ingesta semanal tolerable",
      definicion: "La cantidad de una sustancia que puede ingerirse cada semana durante toda la vida sin riesgo apreciable. Para el metilmercurio, el comité de expertos de la FAO y la OMS (JECFA) fijó 1.6 µg por kilogramo de peso corporal.",
    },
    {
      termino: "Compostaje industrial",
      definicion: "Proceso controlado con temperaturas cercanas a 58 °C, humedad y oxígeno. La norma europea EN 13432 pide que un envase «compostable» se desintegre al menos 90 % en 12 semanas en esas condiciones; en una composta casera, un río o el mar no las hay.",
    },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: g.definicion })),

  aplicaciones: [
    "Separar los residuos en casa: el PET limpio y seco es el plástico con más mercado de reciclaje en México.",
    "Elegir pescados pequeños como la sardina más seguido que peces grandes y longevos como el pez espada, sobre todo durante el embarazo.",
    "El Convenio de Estocolmo (2001) prohíbe o restringe los COP como el DDT y los PCB; el Convenio de Minamata (2013) controla el mercurio. México forma parte de ambos.",
    "Para medir microplásticos en el mar se arrastran redes de manta por la superficie y se cuentan al microscopio las partículas menores a 5 mm; lo que se hundió o es más fino que la malla no aparece en la cuenta.",
  ],

  fuente: FUENTE,
};

/**
 * Datos de la Ficha Teórica del laboratorio de Subsistemas terrestres.
 *
 * Contenido VERBATIM de las actividades ancla de CNEYT-III-P05:
 *   - Marco teórico: lectura A1 «Los subsistemas terrestres: atmósfera,
 *     hidrosfera, litosfera y biosfera» (4 párrafos verbatim).
 *   - Glosario: glosario interactivo A5 «Subsistemas terrestres» (6 términos).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const SUBSISTEMAS_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-III · P05 · A1 — Los subsistemas terrestres",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "La Tierra funciona como un sistema complejo formado por cuatro grandes subsistemas que interactúan constantemente. Comprenderlos es esencial para entender cómo funciona nuestro planeta y por qué los cambios en uno afectan a todos los demás.",
    "La atmósfera es la capa gaseosa que envuelve la Tierra. Está formada principalmente por nitrógeno (78%), oxígeno (21%) y gases traza como CO₂, argón y vapor de agua. Protege la vida al absorber la radiación UV del Sol (capa de ozono) y regula la temperatura mediante el efecto invernadero natural. Sin él, la temperatura media sería de -18°C en lugar de los 15°C actuales.",
    "La hidrosfera comprende toda el agua de la Tierra: océanos (97% del agua total), glaciares y casquetes polares (~2%), aguas subterráneas (~0.7%) y agua superficial dulce (<0.3%). Los océanos regulan el clima absorbiendo calor y CO₂, y las corrientes oceánicas distribuyen energía térmica por el planeta.",
    "La litosfera es la capa sólida exterior: la corteza terrestre y la parte superior del manto. Está fragmentada en placas tectónicas que se mueven ~2-10 cm por año, causando sismos, volcanes y la formación de montañas. El vulcanismo libera CO₂, vapor de agua y SO₂ a la atmósfera, conectando la litosfera con los demás subsistemas.",
    "La biosfera incluye todos los organismos vivos y los ecosistemas que habitan. Interactúa con los tres subsistemas anteriores: las plantas fijan CO₂ (atmósfera-biosfera), los corales construyen arrecifes de carbonato de calcio (hidrosfera-litosfera-biosfera), y las raíces desintegran la roca (litosfera-biosfera). La vida no solo habita el planeta: lo transforma.",
  ],

  objetivos: [
    "Identificar los cuatro subsistemas terrestres y sus características principales: atmósfera, hidrosfera, litosfera y biosfera.",
    "Explicar cómo el efecto invernadero natural regula la temperatura media de la Tierra (~15 °C).",
    "Describir al menos dos ejemplos de interacción entre subsistemas distintos.",
    "Analizar cómo la alteración de una variable (CO₂, cobertura vegetal, volcanes) afecta a los demás subsistemas.",
    "Resolver el quiz de cierre de la actividad A3.",
  ],

  materiales: [
    { nombre: "Simulación 3D de la Tierra", detalle: "Visor interactivo con los cuatro subsistemas y sus variables", icono: "fa-earth-americas" },
    { nombre: "Deslizadores de CO₂ y vegetación", detalle: "Control de CO₂ (280–560 ppm) y cobertura vegetal (10–100%)", icono: "fa-sliders" },
    { nombre: "Toggle de permafrost y volcanes", detalle: "Activa retroalimentaciones de metano y actividad volcánica", icono: "fa-volcano" },
    { nombre: "Escenarios guiados", detalle: "Referencia 1850, hoy, deforestación, erupción, permafrost y restauración", icono: "fa-list-check" },
    { nombre: "Panel de respuesta del sistema", detalle: "Temperatura, nivel del mar, pH del océano, metano y precipitación en tiempo real", icono: "fa-gauge-high" },
  ],

  // Conceptos centrales — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Atmósfera", definicion: "Capa gaseosa que envuelve la Tierra, compuesta por ~78% N₂, ~21% O₂ y gases traza (CO₂, Ar, vapor de agua). Protege la vida mediante la capa de ozono y regula la temperatura por el efecto invernadero natural." },
    { termino: "Hidrosfera", definicion: "Toda el agua de la Tierra: océanos (97%), glaciares (~2%), aguas subterráneas (~0.7%) y agua dulce superficial (<0.3%). Los océanos absorben calor y CO₂ y distribuyen energía mediante corrientes." },
    { termino: "Litosfera", definicion: "Capa sólida exterior formada por la corteza terrestre y la parte superior del manto; fragmentada en placas tectónicas que se mueven ~2-10 cm/año. El vulcanismo conecta la litosfera con la atmósfera al liberar CO₂, SO₂ y vapor de agua." },
    { termino: "Biosfera", definicion: "Todos los organismos vivos y los ecosistemas que habitan. Interactúa con los tres subsistemas: las plantas fijan CO₂, los corales forman estructuras calcáreas y las raíces desintegran la roca. La vida transforma el planeta." },
    { termino: "Efecto invernadero natural", definicion: "Proceso por el que la atmósfera retiene calor solar gracias a gases como CO₂, CH₄ y H₂O, manteniendo la temperatura media en ~15 °C. Sin este efecto, la Tierra promediaría -18 °C." },
  ],

  // Glosario — VERBATIM del glosario interactivo A5 de P05.
  glosario: [
    { termino: "Atmósfera", definicion: "Envoltura gaseosa de la Tierra compuesta principalmente por N₂ (78 %) y O₂ (21 %); regula el clima y protege de la radiación UV." },
    { termino: "Hidrosfera", definicion: "Toda el agua de la Tierra en sus tres estados: océanos, ríos, glaciares, agua subterránea y vapor de agua." },
    { termino: "Litosfera", definicion: "Capa sólida externa de la Tierra que incluye la corteza y el manto litosférico superior; dividida en placas tectónicas." },
    { termino: "Biosfera", definicion: "Zona de la Tierra donde existe vida; integra partes de la atmósfera, hidrosfera y litosfera." },
    { termino: "Interacción entre subsistemas", definicion: "Proceso mediante el cual los cuatro subsistemas terrestres se influyen mutuamente de manera continua." },
    { termino: "Efecto invernadero natural", definicion: "Fenómeno en que la atmósfera retiene calor solar gracias a gases como CO₂, CH₄ y H₂O, manteniendo la temperatura media en ~15 °C." },
  ],

  aplicaciones: [
    "El CONAHCYT (ex CONACYT) coordina la investigación científica sobre cambio climático en México; el SNII agrupa a más de 35,000 investigadores activos en todo el país.",
    "Comprender las interacciones entre subsistemas es la base del modelado climático que usan el IPCC y los meteorólogos para proyectar el futuro del planeta.",
    "La reforestación y la restauración de ecosistemas son estrategias concretas que usan el conocimiento de la biosfera para reducir el CO₂ atmosférico.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1 y glosario A5, CNEYT-III-P05.",
};

/**
 * Datos de la Ficha Teórica del laboratorio "Consumo energético e impacto
 * ambiental" (CNEYT-II, progresión 10; actividades CNEYT-II-P06).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: lectura A1 «Consumo energético e impacto ambiental»
 *     (6 párrafos).
 *   - Glosario: glosario interactivo A5 (4 términos).
 *
 * Los conceptos centrales explican el modelo del laboratorio (no verbatim) con
 * cifras oficiales citadas.
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, LECTURA_A1, FUENTE } from "./consumo-energetico-data";

export const CONSUMO_ENERGETICO_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-II · P06 · A1 — Consumo energético e impacto ambiental",

  marcoTeorico: LECTURA_A1,

  objetivos: [
    "Distinguir potencia (W) de energía (kWh) y calcular el consumo bimestral de una casa.",
    "Explicar cómo la tarifa doméstica escalonada encarece cada kWh al pasar de 280 kWh al bimestre.",
    "Reconocer el consumo fantasma de los aparatos enchufados en modo espera.",
    "Convertir kWh en emisiones de CO₂e con el factor de emisión del Sistema Eléctrico Nacional.",
    "Seguir la cadena de eficiencias de la planta al foco e identificar dónde se pierde la energía.",
    "Estimar la huella de carbono personal por categorías y elegir los cambios de mayor impacto.",
  ],

  materiales: [
    { nombre: "Casa con 12 aparatos", detalle: "Refrigerador, focos, televisión, decodificador, consola, módem, microondas, lavadora, plancha, bomba, ventilador y laptop.", icono: "fa-house-chimney" },
    { nombre: "Recibo bimestral de tarifa 1", detalle: "Bloques básico, intermedio y excedente con precios de referencia de 2025.", icono: "fa-file-invoice-dollar" },
    { nombre: "Regleta con interruptor", detalle: "Desconecta de golpe todo lo que queda en modo espera.", icono: "fa-plug-circle-xmark" },
    { nombre: "Cuatro centrales eléctricas", detalle: "Carboeléctrica, combustóleo, ciclo combinado y parque solar.", icono: "fa-industry" },
    { nombre: "Tres focos de 800 lúmenes", detalle: "Incandescente de 60 W, fluorescente compacto de 14 W y LED de 9 W.", icono: "fa-lightbulb" },
    { nombre: "Globos de CO₂ a escala", detalle: "Cada tonelada de CO₂ a 15 °C y 1 atm llena una esfera de unos 10 m de diámetro.", icono: "fa-circle" },
  ],

  conceptos: [
    {
      termino: "Potencia y energía",
      definicion: "La potencia (W) es la rapidez con que un aparato usa energía; la energía es potencia por tiempo. Un microondas de 1200 W durante 15 min usa 0.3 kWh; un refrigerador de 38 W todo el día, 0.9 kWh.",
    },
    {
      termino: "Kilowatt-hora (kWh)",
      definicion: "Energía que usa un aparato de 1000 W durante una hora (3.6 MJ). Es la unidad en la que la CFE mide y cobra la electricidad.",
    },
    {
      termino: "Tarifa doméstica escalonada",
      definicion: "En la tarifa 1 los primeros 150 kWh del bimestre son básicos, los 130 siguientes intermedios y el resto excedente, que cuesta cerca del triple. Si el promedio anual supera 250 kWh al mes, el servicio pasa a la tarifa DAC, sin subsidio.",
    },
    {
      termino: "Consumo fantasma (modo espera)",
      definicion: "Energía que usan los aparatos apagados pero enchufados: relojes, luces piloto, receptores del control remoto y equipos de «encendido rápido». Se elimina desconectándolos o con una regleta con interruptor.",
    },
    {
      termino: "Factor de emisión del SEN",
      definicion: "Toneladas de CO₂e que en promedio se emiten por cada MWh que entrega la red. La CRE lo publica cada año: 0.438 tCO₂e/MWh para 2023 y 0.444 tCO₂e/MWh para 2024, es decir, unos 444 g por kWh.",
    },
    {
      termino: "Pérdidas de la red",
      definicion: "Parte de la electricidad generada que no llega a los usuarios: pérdidas técnicas (calor en cables y transformadores, P = I²R) y no técnicas (robo y errores de medición). En México sumaron 12.2 % en 2023 (PRODESEN 2024-2038).",
    },
    {
      termino: "Eficiencia en cadena",
      definicion: "La eficiencia total es el producto de cada etapa: planta × red × aparato. Carbón (36 %) × red (87.8 %) × foco incandescente (≈ 5 % de luz) ≈ 1.7 %; ciclo combinado (55 %) × red × LED (≈ 36 %) ≈ 17 %.",
    },
    {
      termino: "CO₂ equivalente",
      definicion: "Unidad común para sumar gases de efecto invernadero: cada gas se multiplica por su potencial de calentamiento respecto al CO₂ (el metano y el óxido nitroso calientan mucho más por kilogramo).",
    },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: g.definicion })),

  aplicaciones: [
    "Revisar el recibo de luz: comparar el consumo del bimestre con los 280 kWh donde empieza el consumo excedente.",
    "Conectar televisión, decodificador y consola a una regleta y apagarla por la noche.",
    "Buscar la etiqueta amarilla de eficiencia energética (NOM de la CONUEE) al comprar un refrigerador o una lavadora.",
    "Las empresas reportan sus emisiones indirectas por electricidad al Registro Nacional de Emisiones multiplicando sus MWh por el factor del SEN.",
  ],

  fuente: `${FUENTE} Factor de emisión: aviso CRE–SENER del SEN 2024. Pérdidas de la red: PRODESEN 2024-2038. Tarifa 1: precios de referencia de la CFE en 2025 (aproximados).`,
};

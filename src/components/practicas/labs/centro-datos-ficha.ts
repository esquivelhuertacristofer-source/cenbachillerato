/**
 * Ficha Teórica del laboratorio "Centros de datos y la huella de la nube"
 * (CD-I-P03, progresión 3 de Cultura Digital I).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: lectura A1 «¿Quién controla la información en internet?» (3 párrafos).
 *   - Glosario: glosario interactivo A5 (4 términos).
 * Conceptos, materiales y aplicaciones: elaborados para el laboratorio, con
 * cifras de fuentes públicas citadas (INEGI, Uptime Institute, AIE, CRE/SEMARNAT).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, LECTURA_A1, FUENTE } from "./centro-datos-data";

export const CENTRO_DATOS_FICHA: FichaTeoricaData = {
  ancla: "CD-I · P03 · A1 — ¿Quién controla la información en internet?",

  marcoTeorico: LECTURA_A1,

  objetivos: [
    "Explicar que la nube es infraestructura física que consume electricidad y agua en comunidades concretas.",
    "Interpretar el PUE y el consumo de agua de un centro de datos y el intercambio entre ambos.",
    "Reconocer qué datos genera un día de uso del celular, quién los recibe y qué puede inferirse de ellos.",
    "Aplicar el principio de mínimo privilegio al conceder permisos a las apps.",
    "Analizar con datos de la ENDUTIH cómo un servicio solo en línea afecta a distintos grupos de población.",
    "Proponer políticas públicas que reduzcan la brecha digital y valorar su efecto.",
  ],

  materiales: [
    { nombre: "Campus de centros de datos", detalle: "Salas de racks con pasillo frío y caliente, y tres sistemas de enfriamiento.", icono: "fa-server" },
    { nombre: "Clima tipo Querétaro", detalle: "Horas del año por temperatura exterior (distribución ilustrativa, promedio ≈ 17 °C).", icono: "fa-temperature-half" },
    { nombre: "Un celular con cinco apps", detalle: "Mapas, videos, mensajería, tienda y un juego, cada una con los permisos que pide.", icono: "fa-mobile-screen" },
    { nombre: "Tres destinos de datos", detalle: "Servidores de la empresa, red de anunciantes y corredor de datos.", icono: "fa-database" },
    { nombre: "Cuatro grupos de población", detalle: "Acceso a internet real de la ENDUTIH 2025 (INEGI).", icono: "fa-people-group" },
    { nombre: "Cinco medidas de política pública", detalle: "Formulario para celular, wifi público, promotores, ventanilla y plazo largo.", icono: "fa-landmark" },
  ],

  conceptos: [
    {
      termino: "PUE (eficacia en el uso de la energía)",
      definicion:
        "Energía total del centro de datos entre la energía que usan los servidores. Un PUE de 1.5 significa que por cada kWh de cómputo se gasta medio kWh más en enfriar y convertir electricidad. El promedio mundial fue 1.56 en 2024 (Uptime Institute); Google reportó 1.09 para su flota en 2024.",
    },
    {
      termino: "Consumo de agua (WUE)",
      definicion:
        "Litros de agua por kWh de cómputo. Evaporar 1 kg de agua absorbe unos 2.4 MJ, por eso una torre evaporativa gasta cerca de 2 L por kWh, mientras un sistema enfriado por aire casi no usa agua en el sitio pero consume más electricidad.",
    },
    {
      termino: "Intercambio agua–energía",
      definicion:
        "Ahorrar agua suele costar electricidad y viceversa. Subir la temperatura de entrada a los servidores dentro del rango recomendado (18–27 °C, ASHRAE) reduce ambos. La electricidad también tiene huella: en México cada MWh emitió 0.444 t de CO₂e en 2024 (CRE/SEMARNAT).",
    },
    {
      termino: "Mínimo privilegio",
      definicion:
        "Conceder a una app solo los permisos que necesita para su función y solo mientras la usas. La atención (qué miras y cuánto) se registra aunque apagues todos los permisos.",
    },
    {
      termino: "Reidentificación por ubicación",
      definicion:
        "Los datos «anónimos» de ubicación identifican a las personas: con 4 puntos de lugar y hora se distinguió al 95 % de 1.5 millones de usuarios de telefonía (de Montjoye y colaboradores, 2013).",
    },
    {
      termino: "Aviso de privacidad y derechos ARCO",
      definicion:
        "En México, la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (nueva ley publicada el 20 de marzo de 2025) obliga a informar para qué se usan tus datos y te da derecho a Acceder, Rectificar, Cancelar u Oponerte a su uso.",
    },
    {
      termino: "Brecha de acceso y de uso",
      definicion:
        "En 2025, 86.1 % de la población de 6 años y más usó internet: 88.9 % en zonas urbanas, 75.2 % en rurales, 57.8 % entre 65 y 74 años y 30.3 % a partir de 75 (ENDUTIH 2025). Tener conexión no garantiza tener el equipo o las habilidades para un trámite.",
    },
    {
      termino: "Servicio solo en línea",
      definicion:
        "Cuando un derecho o apoyo solo se tramita por internet, la brecha digital se vuelve exclusión. Las alternativas presenciales y el acompañamiento son parte de la política de disponibilidad de la información.",
    },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: g.definicion })),

  aplicaciones: [
    "Querétaro concentra las regiones de nube de Microsoft (mayo de 2024), Google Cloud (2024) y AWS (enero de 2025) en un estado que tuvo más del 90 % de su territorio en sequía en 2024 y 2025 (Oxfam México, 2026).",
    "Los centros de datos del mundo consumieron unos 415 TWh en 2024, cerca del 1.5 % de la electricidad mundial (Agencia Internacional de Energía, 2025).",
    "Revisar cada mes los permisos de ubicación, contactos y rastreo de las apps del celular.",
    "Exigir que un trámite escolar o municipal tenga una alternativa presencial y que funcione en celular.",
  ],

  fuente: FUENTE,
};

/**
 * Datos de la Ficha Teórica del laboratorio "Software libre y alternativas"
 * (CD-I-P09, progresión 4 de Cultura Digital I).
 *
 * Contenido VERBATIM de las actividades ancla:
 *   - Marco teórico: lectura A1 «Las cuatro libertades del software libre».
 *   - Glosario: glosario interactivo A5 (5 términos).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";
import { GLOSARIO, LECTURA_A1, FUENTE } from "./software-libre-data";

export const SOFTWARE_LIBRE_FICHA: FichaTeoricaData = {
  ancla: "CD-I · P09 · A1 — Las cuatro libertades del software libre",

  marcoTeorico: LECTURA_A1,

  objetivos: [
    "Explicar las cuatro libertades del software libre y reconocer cuáles concede una licencia real.",
    "Distinguir software libre de software gratuito, de código visible y de software como servicio.",
    "Comparar una licencia con copyleft (GPL) con una permisiva (MIT).",
    "Valorar por qué un formato abierto protege tus archivos a largo plazo.",
    "Estimar el costo de licencias y suscripciones frente a alternativas libres para una escuela.",
    "Reconocer la dependencia que crea una suscripción: qué pasa con tus archivos al dejar de pagar.",
  ],

  materiales: [
    { nombre: "Seis licencias reales", detalle: "GNU GPL v3, MIT, Business Source License, freeware, EULA privativa y términos de servicio.", icono: "fa-scroll" },
    { nombre: "Caja de las cuatro libertades", detalle: "Una puerta por libertad: usar, estudiar, distribuir y mejorar.", icono: "fa-box-open" },
    { nombre: "Cápsula del tiempo", detalle: "Nueve formatos de archivo guardados en 2007 y abiertos en 2026.", icono: "fa-hourglass-half" },
    { nombre: "Sala de cómputo de 10 a 40 equipos", detalle: "Precios de lista de Microsoft y Adobe frente a Linux Mint, LibreOffice y GIMP.", icono: "fa-school" },
  ],

  conceptos: [
    {
      termino: "Gratis no es libre",
      definicion: "El precio y la libertad son independientes: hay programas gratuitos privativos (freeware) y software libre que se vende. «Free software» en inglés se refiere a libertad, no a precio.",
    },
    {
      termino: "Código fuente y binario",
      definicion: "El código fuente es el texto legible que escriben las personas; el binario es la versión compilada que ejecuta la máquina. Sin fuente no se puede estudiar ni adaptar un programa.",
    },
    {
      termino: "Copyleft y licencias permisivas",
      definicion: "La GPL obliga a que las versiones modificadas que se distribuyan sigan siendo libres (copyleft). La MIT solo pide conservar el aviso de derechos de autor y permite crear versiones privativas.",
    },
    {
      termino: "Código visible no es libre",
      definicion: "Licencias como la Business Source License dejan leer el código pero restringen su uso: al fallar la libertad 0, no son software libre ni código abierto.",
    },
    {
      termino: "Formato abierto",
      definicion: "Formato con especificación pública que cualquiera puede implementar, como ODF (ISO/IEC 26300), PNG o SVG. Tus archivos no dependen de que exista el programa con que los creaste.",
    },
    {
      termino: "Software como servicio (SaaS)",
      definicion: "Programa que corre en los servidores del proveedor y se usa por internet. No tienes una copia: las libertades no aplican y el acceso depende de la cuenta, los términos y, a veces, del pago.",
    },
  ],

  glosario: GLOSARIO.map((g) => ({ termino: g.termino, definicion: g.definicion })),

  aplicaciones: [
    "Instalar LibreOffice, GIMP o Inkscape en la computadora de casa sin pagar licencias y guardar las tareas en formato abierto.",
    "Revisar la licencia antes de usar un programa en un proyecto escolar o en un negocio.",
    "Exportar a PDF, ODT o PNG los trabajos que viven en una plataforma en línea, para no perderlos si la cuenta se cierra.",
    "Proponer a la escuela una sala de cómputo con GNU/Linux y software libre, considerando también capacitación y soporte.",
  ],

  fuente: FUENTE,
};

/**
 * Datos de la Ficha Teórica del laboratorio "La célula en 3D: organelos y
 * funciones".
 *
 * Contenido VERBATIM de las actividades ancla de CNEYT-VI-P02:
 *   - Marco teórico: infografía A1 «Células procariota y eucariota: organelos y
 *     funciones» (puntos clave verbatim).
 *   - Glosario: glosario interactivo A5 «Glosario — Organelos celulares y sus
 *     funciones».
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const CELULA_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-VI · P02 · A1 — Células procariota y eucariota: organelos y funciones",

  // Marco teórico — VERBATIM de los puntos clave de la infografía A1.
  marcoTeorico: [
    "Todos los seres vivos están formados por células. Las células procariotas (sin núcleo definido) son las más antiguas —aparecen en el registro fósil hace ~3,500 millones de años. Las eucariotas (con núcleo rodeado por membrana) surgieron hace ~2,000 millones de años.",
    "Procariotas: sin núcleo, sin organelos membranosos, ADN circular flotante en el citoplasma, reproducción por fisión binaria, diámetro de 0.5–5 μm. Incluyen Bacteria y Archaea. Las bacterias del microbioma intestinal humano (~38 billones de células) superan en número a las propias células humanas.",
    "Eucariotas animales: núcleo con envoltura nuclear doble, mitocondrias, retículo endoplasmático rugoso y liso, aparato de Golgi, lisosomas y centrosoma. Sin pared celular.",
    "Eucariotas vegetales: además de los organelos animales, tienen pared celular de celulosa, cloroplastos (fotosíntesis) y una vacuola central que puede ocupar el 90% del volumen. Los cloroplastos tienen su propio ADN circular —evidencia de que alguna vez fueron bacterias fotosintéticas (teoría endosimbiótica de Lynn Margulis).",
    "La mitocondria produce ATP mediante respiración celular aeróbica y tiene su propio ADN, heredado exclusivamente por vía materna. El CINVESTAV estudia disfunciones mitocondriales en enfermedades metabólicas prevalentes en México: diabetes tipo 2 y enfermedades cardiovasculares.",
    "La teoría endosimbiótica de Lynn Margulis (1967) propone que mitocondrias y cloroplastos fueron bacterias engullidas pero no digeridas por células ancestrales. Evidencias: tienen ADN circular propio, se reproducen independientemente y son similares en tamaño a las bacterias actuales.",
  ],

  objetivos: [
    "Distinguir las células procariota y eucariota por la presencia o ausencia de núcleo rodeado por membrana.",
    "Identificar los organelos principales de la célula eucariota animal y vegetal y describir su función.",
    "Reconocer las estructuras exclusivas de la célula vegetal: pared celular, cloroplastos y vacuola central.",
    "Explicar la teoría endosimbiótica y las evidencias que la sustentan (ADN propio, ribosomas 70S, fisión binaria).",
    "Resuelve el reto evaluable de la actividad A2",
  ],

  materiales: [
    { nombre: "Visor 3D de la célula", detalle: "Muestra los organelos de cada tipo de célula; clic para ver su función", icono: "fa-microscope" },
    { nombre: "Selector de tipo de célula", detalle: "Eucariota animal, eucariota vegetal y procariota", icono: "fa-bacterium" },
    { nombre: "Tabla comparativa", detalle: "Procariota vs eucariota: núcleo, ADN, ribosomas, organelos y tamaño", icono: "fa-code-compare" },
    { nombre: "Barra de tamaño", detalle: "Procariota (0.5–5 μm) frente a eucariota (10–100 μm)", icono: "fa-ruler-horizontal" },
  ],

  // Conceptos centrales del lab — formulados a partir de la infografía A1.
  conceptos: [
    { termino: "Organelo", definicion: "Estructura interna especializada de una célula eucariota, análoga a un órgano en el cuerpo. Realiza una función específica: mitocondria (energía), núcleo (genoma), ribosoma (síntesis de proteínas), aparato de Golgi (empaque y envío de proteínas)." },
    { termino: "Núcleo celular", definicion: "Organelo rodeado por una doble membrana (envoltura nuclear) que contiene el ADN lineal empaquetado en cromosomas. Es el centro de control de la célula eucariota. Las células procariotas no tienen núcleo: su ADN circular flota en el citoplasma." },
    { termino: "Mitocondria", definicion: "Organelo de la célula eucariota que produce ATP mediante respiración celular aeróbica. Posee ADN circular propio, evidencia de su origen bacteriano. Las células con mayor demanda energética (músculo cardiaco, neuronas) contienen cientos o miles de mitocondrias." },
    { termino: "Endosimbiosis", definicion: "Relación en la que una célula vive dentro de otra de forma mutuamente beneficiosa. La teoría endosimbiótica propone que mitocondrias y cloroplastos fueron bacterias que establecieron endosimbiosis con células eucariotas ancestrales hace más de 2,000 millones de años." },
    { termino: "Fisión binaria", definicion: "Forma de reproducción asexual de las células procariotas: la célula duplica su ADN y se divide en dos células hijas genéticamente idénticas. Bajo condiciones ideales, algunas bacterias se dividen cada 20 minutos." },
  ],

  // Glosario — VERBATIM del glosario interactivo A5 de P02.
  glosario: [
    { termino: "Núcleo celular", definicion: "Organelo rodeado por la envoltura nuclear (doble membrana con poros). Contiene el ADN genómico organizado en cromosomas y es el sitio de la replicación del ADN y la transcripción del ARN." },
    { termino: "Mitocondria", definicion: "Organelo con doble membrana (externa lisa e interna plegada en crestas) donde se lleva a cabo la respiración celular aerobia. Produce la mayor parte del ATP celular mediante la cadena de transporte de electrones." },
    { termino: "Cloroplasto", definicion: "Organelo exclusivo de células vegetales y algas con doble membrana y un sistema interno de tilacoides apilados (grana) en el estroma. Es el sitio de la fotosíntesis: convierte luz solar, CO₂ y H₂O en glucosa y O₂." },
    { termino: "Retículo endoplasmático (RE)", definicion: "Red de membranas continua con el núcleo. El RE rugoso (con ribosomas) sintetiza y procesa proteínas de secreción o de membrana. El RE liso (sin ribosomas) sintetiza lípidos y desintoxica compuestos." },
    { termino: "Aparato de Golgi", definicion: "Sistema de sacos membranosos apilados (cisternas) que recibe proteínas del RE, las modifica (glucosilación, corte), clasifica y empaqueta en vesículas para enviarlas a su destino: membrana plasmática, lisosomas o secreción." },
    { termino: "Diferencias clave procariota vs eucariota", definicion: "Procariota: sin núcleo membranoso, ADN circular en nucleoide, ribosomas 70S, sin organelos membranosos, tamaño ~1-10 µm. Eucariota: núcleo con envoltura nuclear, ADN lineal en cromosomas, ribosomas 80S, organelos especializados, tamaño ~10-100 µm." },
  ],

  aplicaciones: [
    "El ajolote (Ambystoma mexicanum), endémico de Xochimilco (CDMX), es un modelo científico global de regeneración celular; la UNAM secuenció su genoma —el más grande conocido, con 32,000 millones de pares de bases, 10 veces más que el humano.",
    "El CINVESTAV estudia disfunciones mitocondriales en enfermedades metabólicas prevalentes en México: diabetes tipo 2 y enfermedades cardiovasculares.",
    "Las bacterias del microbioma intestinal humano (~38 billones de células) superan en número a las propias células humanas.",
  ],

  fuente: "Instituto de Biología UNAM — Genoma del Ajolote y Biología de la Regeneración 2023; CINVESTAV — Líneas de Investigación en Biología Celular y Molecular 2023. Infografía A1 y glosario A5, CNEYT-VI-P02.",
};

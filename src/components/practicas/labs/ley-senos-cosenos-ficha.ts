/**
 * Datos de la Ficha Teórica del laboratorio Ley de Senos y Ley de Cosenos
 * (PM-IV-P05).
 *
 * Marco teórico y preguntas de comprensión VERBATIM de la actividad ancla A1
 * «Ley de Senos y Ley de Cosenos» (lectura, PM-IV-P05-A1, estado=publicada).
 *
 * Glosario VERBATIM de PM-IV-P05-A5 (glosario_interactivo).
 * NOTA: A5 tiene estado=BORRADOR en la base de datos, pero el contenido está
 * completo y se incluye aquí tal cual. Se identifica con el comentario
 * "BORRADOR" para trazabilidad futura.
 *
 * El reto evaluable vive en ley-senos-cosenos-data.ts (A2, ejercicio_matematico).
 *
 * Sin three: seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const LEY_SENOS_FICHA: FichaTeoricaData = {
  ancla: "PM-IV · P05 · A1 — Ley de Senos y Ley de Cosenos",

  // Marco teórico — VERBATIM de PM-IV-P05-A1 (campo "texto").
  marcoTeorico: [
    "La trigonometría en triángulo rectángulo —con seno, coseno y tangente de los ángulos agudos— solo funciona cuando uno de los ángulos del triángulo es exactamente 90°. Pero en la mayoría de situaciones reales, los triángulos no tienen un ángulo recto. Para estos casos, existen dos herramientas fundamentales: la Ley de Senos y la Ley de Cosenos.",
    "Un triángulo oblicuángulo es aquel en el que ningún ángulo es de 90°. Puede ser acutángulo (todos sus ángulos son agudos, menores de 90°) u obtusángulo (uno de sus ángulos es obtuso, mayor de 90°). Para resolver estos triángulos necesitamos al menos tres elementos conocidos, incluyendo al menos un lado.",
    "La Ley de Senos establece que en todo triángulo, el cociente entre la longitud de cada lado y el seno del ángulo opuesto a ese lado es constante: a / sen(A) = b / sen(B) = c / sen(C). Esta ley se usa en dos casos principales. El caso ALA (Ángulo-Lado-Ángulo): se conocen dos ángulos y el lado comprendido entre ellos. El caso LAA (Lado-Ángulo-Ángulo): se conoce un lado y dos ángulos. En ambos casos, la Ley de Senos permite calcular los elementos desconocidos.",
    "La Ley de Cosenos generaliza el teorema de Pitágoras para triángulos oblicuángulos: c² = a² + b² - 2ab·cos(C). Se usa en dos casos. El caso LLL (Lado-Lado-Lado): se conocen los tres lados y se busca algún ángulo. El caso LAL (Lado-Ángulo-Lado): se conocen dos lados y el ángulo comprendido entre ellos y se busca el tercer lado. Nótese que cuando el ángulo C es de 90°, cos(90°) = 0 y la fórmula se reduce al teorema de Pitágoras: c² = a² + b².",
    "La topografía es una aplicación directa y cotidiana de estas leyes. El INEGI (Instituto Nacional de Estadística y Geografía) utiliza redes de triangulación para elaborar los mapas del territorio mexicano. Cuando dos puntos son inaccesibles directamente —porque hay un barranco, un lago o una zona privada de por medio— se mide la distancia a dos puntos accesibles y los ángulos entre ellos, y la Ley de Senos permite calcular la distancia al punto inaccesible. Este método fue la base de la cartografía antes de la era GPS y sigue siendo importante para verificar mediciones satelitales.",
  ],

  objetivos: [
    "Identificar qué es un triángulo oblicuángulo y diferenciarlo del triángulo rectángulo.",
    "Enunciar la Ley de Senos (a/sen A = b/sen B = c/sen C) y los casos en que se aplica (ALA y LAA).",
    "Enunciar la Ley de Cosenos (c² = a² + b² − 2ab·cos C) y los casos en que se aplica (LAL y LLL).",
    "Relacionar la Ley de Cosenos con el Teorema de Pitágoras como caso particular (C = 90°).",
    "Aplicar la Ley de Cosenos para resolver el reto evaluable A2 (terreno triangular en Oaxaca).",
  ],

  materiales: [
    { nombre: "Terreno triangular 3D", detalle: "Ajusta dos lados y el ángulo incluido; la Ley de Cosenos calcula el lado opuesto", icono: "fa-draw-polygon" },
    { nombre: "Deslizadores a, b, C", detalle: "Controles de los dos lados conocidos (m) y el ángulo C entre ellos (°)", icono: "fa-sliders" },
    { nombre: "Panel paso a paso", detalle: "Muestra la sustitución numérica de c² = a² + b² − 2ab·cos C en tiempo real", icono: "fa-calculator" },
    { nombre: "Escenarios guiados", detalle: "Terreno, lago, equilátero, casi recto, ángulo obtuso y ángulo agudo", icono: "fa-map-location-dot" },
  ],

  // Conceptos — formulados a partir del texto verbatim de A1.
  conceptos: [
    { termino: "Triángulo oblicuángulo", definicion: "Triángulo en el que ningún ángulo es de 90°. Puede ser acutángulo (todos los ángulos < 90°) u obtusángulo (uno de los ángulos > 90°). Ni Pitágoras ni SOH-CAH-TOA son suficientes para resolverlo." },
    { termino: "Ley de Senos", definicion: "En todo triángulo: a / sen(A) = b / sen(B) = c / sen(C). Aplica en los casos ALA (dos ángulos y el lado comprendido) y LAA (un lado y dos ángulos)." },
    { termino: "Ley de Cosenos", definicion: "c² = a² + b² − 2ab·cos(C). Generaliza el Teorema de Pitágoras para cualquier triángulo. Aplica en los casos LAL (dos lados y el ángulo comprendido) y LLL (tres lados conocidos)." },
    { termino: "Caso LAL", definicion: "Se conocen dos lados y el ángulo comprendido entre ellos. Se usa la Ley de Cosenos para hallar el tercer lado." },
    { termino: "Caso LLL", definicion: "Se conocen los tres lados del triángulo. Se despeja el coseno de cualquier ángulo: cos(C) = (a² + b² − c²) / (2ab)." },
    { termino: "Triangulación (topografía)", definicion: "Método del INEGI para medir distancias inaccesibles: se mide la distancia entre dos puntos accesibles y los ángulos hacia el punto inalcanzable; la Ley de Senos permite calcular esa distancia sin llegar a él." },
  ],

  // Glosario — VERBATIM de PM-IV-P05-A5 (glosario_interactivo).
  // BORRADOR: A5 tiene estado=BORRADOR en BD (2026-06-13); contenido completo,
  // incluido tal cual. Actualizar si A5 pasa a publicada.
  glosario: [
    {
      termino: "Triángulo oblicuángulo",
      definicion: "Triángulo que no tiene ningún ángulo recto. Puede ser acutángulo (todos los ángulos < 90°) u obtusángulo (un ángulo > 90°). Se resuelve con Ley de Senos o Cosenos.",
    },
    {
      termino: "Ley de Senos",
      definicion: "En cualquier triángulo △ABC: a/sen(A) = b/sen(B) = c/sen(C). Aplica en casos: AAL (dos ángulos y un lado) y LLA (caso ambiguo).",
    },
    {
      termino: "Ley de Cosenos",
      definicion: "c² = a² + b² − 2ab·cos(C). Generaliza el Teorema de Pitágoras. Aplica en casos: LAL (dos lados y el ángulo comprendido) y LLL (tres lados conocidos).",
    },
    {
      termino: "Caso LAL (Ley de Cosenos)",
      definicion: "Se conocen dos lados y el ángulo comprendido. Se usa la Ley de Cosenos para hallar el tercer lado y luego la Ley de Senos para los demás ángulos.",
    },
    {
      termino: "Caso LLL (Ley de Cosenos)",
      definicion: "Se conocen los tres lados. Se despeja el coseno de cualquier ángulo: cos(C) = (a² + b² − c²)/(2ab).",
    },
    {
      termino: "Caso ambiguo (Ley de Senos)",
      definicion: "En el caso LLA con el lado dado opuesto al ángulo dado, puede haber 0, 1 o 2 triángulos solución. Se verifica comparando el lado dado con la altura h = b·sen(A).",
    },
  ],

  aplicaciones: [
    "Topografía e INEGI: medir distancias inaccesibles (barrancos, lagos, terrenos privados) con redes de triangulación.",
    "Cartografía: base del mapeo del territorio mexicano antes de la era GPS; sigue usándose para verificar mediciones satelitales.",
    "Ingeniería civil: cálculo de distancias y ángulos en terrenos irregulares para construcción de puentes y carreteras.",
    "Navegación: determinar posiciones cuando no hay línea de visión directa mediante triangulación.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1, PM-IV-P05. Ancla: PM-IV-P05-A2.",
};

/**
 * Datos de la Ficha Teórica del laboratorio "El dogma central de la biología
 * molecular".
 *
 * Contenido VERBATIM de las actividades ancla de CNEYT-VI-P04:
 *   - Marco teórico: lectura A1 «El dogma central de la biología molecular»
 *     (slug = adn-dogma-central-3d; 6 párrafos verbatim).
 *   - Glosario: glosario interactivo A5 «Glosario — ADN, replicación,
 *     transcripción y traducción» (6 términos verbatim).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const ADN_DOGMA_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-VI · P04 · A1 — El dogma central de la biología molecular",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "En 1958, el biólogo Francis Crick propuso lo que llamó el dogma central de la biología molecular: la información genética fluye en una dirección, del ADN al ARN a la proteína. Este principio describe cómo la información almacenada en el ADN se usa para construir las proteínas que realizan prácticamente todas las funciones de la célula.",
    "El primer proceso es la replicación: el ADN produce una copia exacta de sí mismo antes de que la célula se divida. La enzima helicasa separa las dos hebras de la doble hélice como si abriera un cierre. La ADN polimerasa lee cada hebra molde y sintetiza una hebra nueva complementaria, siguiendo las reglas de apareamiento de bases: A con T, C con G. La ligasa une los fragmentos del ADN recién sintetizado. El resultado son dos moléculas de ADN idénticas a la original.",
    "El segundo proceso es la transcripción: el ADN sirve como molde para producir ARN mensajero (ARNm) en el núcleo de la célula. La ARN polimerasa lee la hebra molde del ADN y sintetiza una cadena de ARN complementaria. En los organismos eucariontes (como las células humanas), el ARN recién producido (pre-ARNm) contiene secuencias no codificantes llamadas intrones, que son eliminadas en un proceso llamado splicing. El ARN mensajero maduro resultante sale del núcleo hacia el citoplasma.",
    "El tercer proceso es la traducción: el ARNm se lee en el ribosoma para construir una proteína. El ARNm está escrito en codones, tripletes de tres nucleótidos que corresponden a un aminoácido específico. El codón AUG (metionina) es universalmente el codon de inicio. Los codones UAA, UAG y UGA son señales de parada que indican al ribosoma que la cadena polipeptídica está completa. El ARN de transferencia (ARNt) actúa como adaptador: cada molécula de ARNt reconoce un codón específico en el ARNm con su anticodón y transporta el aminoácido correspondiente al ribosoma.",
    "Las proteínas resultantes son de dos grandes tipos: estructurales (como el colágeno, que da resistencia a la piel y los tendones) y funcionales o enzimáticas (como la amilasa salival, que digiere el almidón). La variedad de proteínas que una célula puede producir es inmensa: el genoma humano contiene aproximadamente 20,000 genes que codifican proteínas.",
    "El INMEGEN (Instituto Nacional de Medicina Genómica) en México investiga las variantes genéticas específicas de la población mexicana para desarrollar medicamentos y diagnósticos más precisos, aplicando directamente el conocimiento del dogma central.",
  ],

  objetivos: [
    "Comprender el dogma central de Crick (1958): la información genética fluye del ADN al ARN a la proteína.",
    "Distinguir los tres procesos: replicación (ADN → ADN), transcripción (ADN → ARNm) y traducción (ARNm → proteína).",
    "Aplicar las reglas de apareamiento de bases (A-T, G-C) y la sustitución de timina por uracilo (T → U) en el ARN.",
    "Leer el código genético en codones, desde el AUG de inicio hasta un codón de parada (UAA, UAG, UGA).",
    "Resolver el reto evaluable de la actividad A2.",
  ],

  materiales: [
    { nombre: "Visor 3D del dogma central", detalle: "Muestra la doble hélice y el flujo ADN → ARN → proteína paso a paso", icono: "fa-dna" },
    { nombre: "Editor de secuencia", detalle: "Escribe tu propio ADN (A, T, G, C) o usa un ejemplo del glosario", icono: "fa-pen-to-square" },
    { nombre: "Maquinaria molecular", detalle: "Helicasa, ADN/ARN polimerasa, ligasa, ribosoma y ARNt según el proceso", icono: "fa-gears" },
    { nombre: "Código genético", detalle: "Tabla de codones: 64 codones codifican 20 aminoácidos más 3 de parada", icono: "fa-table-cells" },
  ],

  // Conceptos centrales del lab — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Dogma central", definicion: "Principio propuesto por Francis Crick en 1958: la información genética fluye en una dirección, del ADN al ARN a la proteína." },
    { termino: "Replicación", definicion: "El ADN produce una copia exacta de sí mismo antes de la división celular. La helicasa abre la doble hélice, la ADN polimerasa sintetiza la hebra complementaria (A con T, C con G) y la ligasa une los fragmentos." },
    { termino: "Transcripción", definicion: "El ADN sirve de molde para producir ARN mensajero en el núcleo. La ARN polimerasa lee la hebra molde y sintetiza una cadena de ARN complementaria; el pre-ARNm pierde los intrones por splicing." },
    { termino: "Traducción", definicion: "El ARNm se lee en el ribosoma para construir una proteína. Cada codón (triplete de nucleótidos) corresponde a un aminoácido; el ARNt actúa como adaptador con su anticodón." },
    { termino: "Codón de inicio y de parada", definicion: "El codón AUG (metionina) es universalmente el codón de inicio. Los codones UAA, UAG y UGA son señales de parada que indican que la cadena polipeptídica está completa." },
    { termino: "Proteínas", definicion: "Son estructurales (como el colágeno) o funcionales/enzimáticas (como la amilasa salival). El genoma humano contiene aproximadamente 20,000 genes que codifican proteínas." },
  ],

  // Glosario — VERBATIM del glosario interactivo A5 de P04.
  glosario: [
    { termino: "Estructura de la doble hélice del ADN", definicion: "El ADN es un polímero de desoxirribonucleótidos formado por dos cadenas antiparalelas enrolladas en hélice. Las bases nitrogenadas (A, T, G, C) se complementan: A-T (2 H) y G-C (3 H). El esqueleto exterior es de fosfato-desoxirribosa." },
    { termino: "Replicación del ADN (semiconservativa)", definicion: "Proceso por el cual el ADN se duplica antes de la división celular. La ADN helicasa separa las cadenas; la ADN polimerasa III sintetiza la nueva cadena en dirección 5'→3' usando cada cadena como molde. Resultado: dos moléculas hijas idénticas, cada una con una cadena parental." },
    { termino: "Transcripción", definicion: "Síntesis de ARNm a partir del ADN. La ARN polimerasa se une al promotor, separa el ADN y sintetiza el ARNm complementario en dirección 5'→3'. En eucariotas ocurre en el núcleo; el ARNm se procesa (capuchón 5', cola poli-A, eliminación de intrones) antes de salir al citoplasma." },
    { termino: "Código genético y codones", definicion: "Lenguaje de tripletes de bases del ARNm que codifican aminoácidos. 64 codones posibles (4³) codifican 20 aminoácidos más 3 codones de parada. Es universal (mismo en casi todos los seres vivos), degenerado (varios codones por aminoácido) y sin solapamiento." },
    { termino: "Traducción", definicion: "Síntesis de proteínas en el ribosoma usando el ARNm como molde. Los ARNt (con anticodón complementario al codón) llevan aminoácidos específicos. El ribosoma cataliza la formación de enlaces peptídicos. Termina al encontrar un codón de parada." },
    { termino: "Dogma central de la biología molecular", definicion: "Flujo de información genética propuesto por Francis Crick (1958): ADN → ARN → Proteína. La replicación reproduce el ADN; la transcripción produce ARN; la traducción produce proteínas. Las retrovirus (VIH) añaden transcripción inversa: ARN → ADN." },
  ],

  aplicaciones: [
    "El INMEGEN (Instituto Nacional de Medicina Genómica) en México investiga las variantes genéticas específicas de la población mexicana para desarrollar medicamentos y diagnósticos más precisos.",
    "El descubrimiento de los virus ARN, como el VIH y el SARS-CoV-2, demostró que el dogma central tiene excepciones: usan la transcriptasa inversa para copiar su ARN en ADN.",
    "Las vacunas de ARNm contra la COVID-19 aplican directamente la traducción: el ARNm dirige al ribosoma para producir una proteína viral que entrena al sistema inmune.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1 y glosario A5, CNEYT-VI-P04.",
};

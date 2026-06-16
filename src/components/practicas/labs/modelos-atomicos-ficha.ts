/**
 * Datos de la Ficha Teórica del laboratorio de Modelos atómicos.
 *
 * Contenido VERBATIM de las actividades ancla de CNEYT-I-P03:
 *   - Marco teórico: lectura A1 «El átomo: la unidad fundamental de la materia»
 *     (4 párrafos verbatim).
 *   - Glosario: glosario interactivo A5 «Átomo y modelos atómicos».
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const MODELOS_ATOMICOS_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-I · P03 · A1 — El átomo y los modelos atómicos",

  // Marco teórico — VERBATIM de la lectura A1.
  marcoTeorico: [
    "Todo lo que existe en el universo está hecho de átomos. El átomo es la partícula más pequeña de un elemento que conserva sus propiedades químicas. Durante siglos se creyó que el átomo era indivisible (su nombre viene del griego \"átomon\": sin división). Hoy sabemos que está compuesto por partículas subatómicas.",
    "El modelo atómico más usado en química básica es el de Bohr-Rutherford (aunque no es el más preciso desde la física cuántica). Según este modelo, el átomo tiene un núcleo central compuesto por protones (carga positiva) y neutrones (sin carga). Alrededor del núcleo, los electrones (carga negativa) orbitan en niveles de energía o capas.",
    "Las propiedades de un átomo dependen de su número atómico (Z): la cantidad de protones en el núcleo. Es lo que define el elemento: el hidrógeno tiene 1 protón, el carbono 6, el oxígeno 8, el hierro 26, el oro 79. Todos los átomos del mismo elemento tienen el mismo número de protones, aunque pueden diferir en el número de neutrones (isótopos).",
    "Los electrones son responsables de los enlaces químicos: la forma en que los átomos se unen para formar moléculas y compuestos. La cantidad de electrones en la capa exterior (electrones de valencia) determina cómo reacciona químicamente un elemento. Por eso la tabla periódica organiza los elementos según su número atómico y sus propiedades químicas.",
  ],

  objetivos: [
    "Describir la estructura del átomo: núcleo (protones y neutrones) y electrones en capas.",
    "Reconocer el número atómico (Z) como la cantidad de protones que define el elemento.",
    "Recorrer la evolución de los modelos atómicos: Dalton, Thomson, Rutherford, Bohr y Schrödinger.",
    "Identificar qué aportó y qué limitación tuvo cada modelo histórico.",
    "Resolver el quiz de estructura atómica de la práctica.",
  ],

  materiales: [
    { nombre: "Visor 3D del átomo", detalle: "Muestra el núcleo y las capas de electrones del elemento", icono: "fa-atom" },
    { nombre: "Tabla de elementos", detalle: "Z = 1 a 20 (del hidrógeno al calcio) con masa y capas reales", icono: "fa-table-cells" },
    { nombre: "Línea del tiempo", detalle: "Los 5 modelos históricos de 1808 a 1926", icono: "fa-timeline" },
    { nombre: "Lectura de composición", detalle: "Protones, neutrones, electrones y número de masa (A)", icono: "fa-magnifying-glass-chart" },
  ],

  // Conceptos centrales del lab — formulados a partir de la lectura A1.
  conceptos: [
    { termino: "Átomo", definicion: "La partícula más pequeña de un elemento que conserva sus propiedades químicas. Está compuesto por partículas subatómicas: protones, neutrones y electrones." },
    { termino: "Núcleo", definicion: "Parte central y densa del átomo, compuesta por protones (carga positiva) y neutrones (sin carga). Alrededor del núcleo orbitan los electrones." },
    { termino: "Número atómico (Z)", definicion: "La cantidad de protones en el núcleo. Es lo que define el elemento: el hidrógeno tiene 1 protón, el carbono 6, el oxígeno 8." },
    { termino: "Electrones de valencia", definicion: "Los electrones de la capa exterior. Son responsables de los enlaces químicos y determinan cómo reacciona químicamente un elemento." },
    { termino: "Evolución de los modelos", definicion: "Cada modelo corrige y amplía al anterior: Dalton (esfera maciza) → Thomson (budín de pasas) → Rutherford (núcleo) → Bohr (capas de energía) → Schrödinger (orbitales de probabilidad)." },
  ],

  // Glosario — VERBATIM del glosario interactivo A5 de P03.
  glosario: [
    { termino: "Número atómico (Z)", definicion: "Número de protones del núcleo; define el elemento." },
    { termino: "Número de masa (A)", definicion: "Suma de protones y neutrones del núcleo." },
    { termino: "Isótopo", definicion: "Átomos del mismo elemento con distinto número de neutrones." },
    { termino: "Modelo de Dalton", definicion: "El átomo como esfera maciza e indivisible." },
    { termino: "Modelo de Bohr", definicion: "Electrones en niveles de energía definidos alrededor del núcleo." },
    { termino: "Modelo de Schrödinger", definicion: "Modelo cuántico: orbitales como zonas de probabilidad del electrón." },
  ],

  aplicaciones: [
    "Las medicinas, los semiconductores y la energía nuclear dependen del conocimiento de la estructura atómica.",
    "Una radiografía es física atómica aplicada al diagnóstico médico.",
    "La tabla periódica organiza los elementos por su número atómico para predecir su comportamiento químico.",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Lectura A1 y glosario A5, CNEYT-I-P03.",
};

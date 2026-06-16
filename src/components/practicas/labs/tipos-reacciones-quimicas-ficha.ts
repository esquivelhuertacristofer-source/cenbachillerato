/**
 * Datos de la Ficha Teórica del laboratorio de Tipos de Reacciones Químicas.
 *
 * Contenido VERBATIM de las actividades ancla de CNEYT-IV-P02:
 *   - Marco teórico: infografía A1 «Tipos de reacciones químicas: de la síntesis a
 *     la combustión» (puntos_clave + contexto_mexicano verbatim).
 *   - Glosario: glosario interactivo A5 «Tipos de reacciones químicas» (verbatim).
 *
 * Datos puros (sin three): seguro de importar desde el shell del lab.
 */

import type { FichaTeoricaData } from "./_ficha";

export const REACCIONES_TIPOS_FICHA: FichaTeoricaData = {
  ancla: "CNEYT-IV · P02 · A1 — Tipos de reacciones químicas (infografía)",

  // Marco teórico — VERBATIM de los puntos_clave y contexto_mexicano de A1.
  marcoTeorico: [
    "Síntesis (combinación): dos o más sustancias se unen para formar una nueva (A + B → AB). Ejemplo industrial: síntesis de amoniaco (NH₃) en plantas de fertilizantes de Fertinal en Lázaro Cárdenas, Michoacán, que abastecen la agricultura nacional.",
    "Descomposición: una sustancia se divide en dos o más componentes (AB → A + B). Ejemplo: descomposición electrolítica del agua en plantas de hidrógeno verde que la CFE pilotea en Sonora y Baja California para almacenar energía renovable.",
    "Desplazamiento simple: un elemento reemplaza a otro en un compuesto (A + BC → AC + B). Ejemplo: en la metalurgia de cobre en Cananea, Sonora, el hierro desplaza al cobre en solución ácida para recuperarlo de los relaves mineros.",
    "Doble desplazamiento: los iones de dos compuestos intercambian lugares. El derrame del Río Sonora (agosto 2014) liberó 40,000 m³ de solución ácida de sulfato de cobre de la mina Buenavista del Cobre —reacción no controlada que contaminó 260 km del río y afectó a 22,000 personas.",
    "Combustión: reacción con oxígeno que libera energía, CO₂ y H₂O. Las termoeléctricas de la CFE —que generaban el 62% de la electricidad de México— dependen de la combustión de gas natural, carbón y combustóleo.",
    "Óxido-reducción (redox): transferencia de electrones entre sustancias. La refinería de Salamanca (Gto.), la más grande de México con capacidad para 245,000 barriles/día, opera múltiples procesos redox en el hidrotratamiento del petróleo crudo.",
    "Salamanca como caso de estudio: décadas de operaciones de refinación y fundición de plomo contaminaron suelos y acuíferos. El INECC detectó niveles de plomo en sangre en niños de Salamanca cinco veces por encima del límite de la OPS.",
    "Química verde — 12 principios: diseñar procesos químicos que prevengan la contaminación en el origen. El Instituto de Química de la UNAM es líder latinoamericano en catalizadores más eficientes, disolventes verdes y síntesis de medicamentos sin subproductos tóxicos.",
    "La velocidad de las reacciones depende de: temperatura (a mayor temperatura, mayor velocidad), concentración de reactantes, superficie de contacto (sólidos en polvo reaccionan más rápido) y presencia de catalizadores (reducen la energía de activación sin consumirse).",
    "Las reacciones químicas tienen consecuencias directas en la calidad de vida de los mexicanos. El caso de Buenavista del Cobre en Sonora (2014) —derrame de 40,000 m³ de solución ácida de sulfato de cobre en el Río Sonora— contaminó el principal río del estado, afectó a 22,000 personas en 7 municipios y generó una crisis que años después sigue sin resolverse completamente. La empresa minera es filial del Grupo México. México fue hogar del único Premio Nobel de Química de América Latina: Mario Molina (CDMX, 1943–2020), galardonado en 1995 por descubrir el mecanismo de destrucción de la capa de ozono por clorofluorocarbonos (CFC). Su trabajo desencadenó el Protocolo de Montreal (1987), que prohibió los CFC y permitió la recuperación gradual de la capa de ozono. El Centro Mario Molina en CDMX continúa su legado investigando contaminación atmosférica en megalópolis.",
  ],

  objetivos: [
    "Identificar y clasificar los cinco tipos principales de reacciones (síntesis, descomposición, desplazamiento simple, doble desplazamiento y combustión) con sus patrones.",
    "Predecir los productos de una reacción de combustión completa dado un hidrocarburo como reactivo.",
    "Aplicar la Ley de Conservación de la Masa (Lavoisier) para verificar que el número de átomos es igual en reactivos y productos.",
    "Relacionar el tipo de reacción con aplicaciones cotidianas o industriales concretas en México.",
    "Aprobar el cuestionario de la actividad A2 de la progresión.",
  ],

  materiales: [
    { nombre: "Visor 3D de reacciones", detalle: "Anima el movimiento de átomos de reactivos a productos (bolas y barras didácticas)", icono: "fa-atom" },
    { nombre: "Selector de tipo", detalle: "5 tipos de reacción con su patrón A+B→AB, AB→A+B, etc.", icono: "fa-shapes" },
    { nombre: "Panel de conservación", detalle: "Conteo de átomos por elemento idéntico en reactivos y productos (Lavoisier)", icono: "fa-scale-balanced" },
    { nombre: "Ecuaciones balanceadas", detalle: "Reacciones reales tomadas de la industria y contexto mexicano", icono: "fa-flask-vial" },
  ],

  // Conceptos centrales del lab — formulados a partir de la infografía A1.
  conceptos: [
    { termino: "Reacción de síntesis", definicion: "Dos o más sustancias se combinan para formar un único producto nuevo. Patrón: A + B → AB. Ejemplo: síntesis de amoniaco N₂ + 3H₂ → 2NH₃ (Proceso Haber-Bosch)." },
    { termino: "Reacción de descomposición", definicion: "Una sola sustancia se divide en dos o más productos más simples. Patrón: AB → A + B. Ejemplo: electrólisis del agua 2H₂O → 2H₂ + O₂." },
    { termino: "Desplazamiento simple", definicion: "Un elemento desplaza a otro en un compuesto. Patrón: A + BC → AC + B. La reactividad relativa determina si el desplazamiento procede espontáneamente." },
    { termino: "Doble desplazamiento", definicion: "Dos compuestos iónicos intercambian sus cationes formando dos nuevos compuestos. Patrón: AB + CD → AD + CB. Incluye reacciones de neutralización y precipitación." },
    { termino: "Combustión", definicion: "Un combustible reacciona con oxígeno liberando energía en forma de calor y luz. La combustión completa de hidrocarburos produce CO₂ y H₂O. La incompleta produce CO tóxico." },
    { termino: "Ley de Conservación de la Masa", definicion: "Principio de Lavoisier (1789): en una reacción química, la masa total de los reactantes es igual a la masa total de los productos. Los átomos se reorganizan pero no desaparecen." },
  ],

  // Glosario — VERBATIM del glosario interactivo A5 de P02.
  glosario: [
    { termino: "Reacción de síntesis", definicion: "Tipo de reacción en que dos o más sustancias se combinan para formar un único compuesto. Patrón: A + B → AB." },
    { termino: "Reacción de descomposición", definicion: "Tipo de reacción en que una sola sustancia se divide en dos o más productos más simples. Patrón: AB → A + B." },
    { termino: "Reacción de desplazamiento simple", definicion: "Un elemento desplaza a otro en un compuesto. Patrón: A + BC → AC + B." },
    { termino: "Reacción de doble desplazamiento", definicion: "Dos compuestos iónicos intercambian sus cationes formando dos nuevos compuestos. Patrón: AB + CD → AD + CB." },
    { termino: "Reacción de combustión", definicion: "Un combustible reacciona con oxígeno liberando energía en forma de calor y luz. La combustión completa de hidrocarburos produce CO₂ y H₂O." },
    { termino: "Precipitado", definicion: "Sólido insoluble que se forma dentro de una solución como resultado de una reacción de doble desplazamiento." },
  ],

  aplicaciones: [
    "Las plantas de fertilizantes de Fertinal (Lázaro Cárdenas, Michoacán) producen amoniaco NH₃ mediante síntesis Haber-Bosch para abastecer la agricultura nacional.",
    "La CFE pilotea plantas de hidrógeno verde (electrólisis del agua) en Sonora y Baja California para almacenar energía renovable.",
    "La refinería de Salamanca (Guanajuato), con capacidad para 245,000 barriles/día, realiza procesos redox en el hidrotratamiento del petróleo crudo.",
    "Mario Molina (CDMX, 1943–2020), Premio Nobel de Química 1995, descubrió que los CFC destruyen la capa de ozono a través de reacciones en cadena, desencadenando el Protocolo de Montreal (1987).",
  ],

  fuente: "Material elaborado para CEN Bachillerato — Infografía A1 y glosario A5, CNEYT-IV-P02. Fuentes: IMP 2023; UNAM Instituto de Química 2023; INECC 2021.",
};

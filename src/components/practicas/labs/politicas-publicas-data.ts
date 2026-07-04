/**
 * Datos del Laboratorio — Políticas públicas: el ciclo de la política pública
 * (CS-III-P02, Ciencias Sociales III).
 *
 * Contenido VERBATIM de CS-III·P02 ("Políticas públicas: el ciclo de la política
 * pública —del problema a la solución—; desigualdades, contradicciones y
 * omisiones"). Las etapas del ciclo, los conceptos y las definiciones del
 * glosario, así como las afirmaciones del cuestionario, se toman literalmente de
 * las actividades A1 (infografía), A2 (V/F), A4 (V/F) y A5 (glosario interactivo).
 *
 * Nota de fidelidad: el ancla recomendada para publicar es A4 (V/F publicada),
 * ya que A1 (infografía) está en estado «borrador».
 */

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 1 — Ordena el ciclo de la política pública (secuencia, A1 verbatim)
 *
 * Las cinco etapas y su descripción provienen del primer punto clave de A1:
 * «(1) identificación del problema, (2) diseño de alternativas, (3) adopción de
 * la política, (4) implementación y (5) evaluación», ampliadas con los puntos
 * clave individuales de cada etapa.
 * ───────────────────────────────────────────────────────────────────────── */
export const CICLO: { id: string; orden: number; texto: string; etapa: string; detalle: string }[] = [
  {
    id: "cic-1",
    orden: 0,
    texto: "Identificación del problema",
    etapa: "Etapa 1",
    detalle: "Solo cuando un problema entra en la «agenda gubernamental» —por presión social, crisis, datos estadísticos o voluntad política— se convierte en objeto de política pública.",
  },
  {
    id: "cic-2",
    orden: 1,
    texto: "Diseño de alternativas",
    etapa: "Etapa 2",
    detalle: "La Secretaría de Hacienda y Crédito Público y el CONEVAL analizan la viabilidad técnica y fiscal de las opciones de política.",
  },
  {
    id: "cic-3",
    orden: 2,
    texto: "Adopción de la política",
    etapa: "Etapa 3",
    detalle: "Implica autorización legal (leyes, decretos, reglas de operación), asignación presupuestaria y asignación de responsabilidades. El Congreso aprueba el PEF cada diciembre.",
  },
  {
    id: "cic-4",
    orden: 3,
    texto: "Implementación",
    etapa: "Etapa 4",
    detalle: "La etapa donde más frecuentemente fallan las políticas en México, por burocracia lenta, corrupción, falta de coordinación intergubernamental o resistencia de grupos de interés.",
  },
  {
    id: "cic-5",
    orden: 4,
    texto: "Evaluación",
    etapa: "Etapa 5",
    detalle: "El CONEVAL evalúa cada año más de 150 programas sociales federales usando metodologías rigurosas, y retroalimenta el ciclo.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 2 — Empareja concepto y definición (glosario A5, verbatim)
 *
 * Cada fila muestra la definición; el alumno suelta el término que corresponde.
 * ───────────────────────────────────────────────────────────────────────── */
export const PARES: { id: string; termino: string; definicion: string; ejemplo: string }[] = [
  {
    id: "pp-politica",
    termino: "Política pública",
    definicion: "Conjunto de decisiones, acciones y omisiones del Estado orientadas a dar respuesta a un problema social reconocido como de interés colectivo.",
    ejemplo: "El Programa de Becas para el Bienestar Benito Juárez es una política pública educativa que busca reducir la deserción escolar por razones económicas.",
  },
  {
    id: "pp-ciclo",
    termino: "Ciclo de política pública",
    definicion: "Proceso iterativo que comprende las fases de identificación del problema, diseño, implementación, evaluación y retroalimentación de una política.",
    ejemplo: "Ante la contaminación del aire, el ciclo inicia con el diagnóstico técnico, continúa con la norma ambiental, su aplicación por inspectores, la medición de resultados y la actualización de la norma.",
  },
  {
    id: "pp-participacion",
    termino: "Participación ciudadana",
    definicion: "Involucramiento activo de la población en los asuntos públicos: desde informarse y votar hasta cogestionar programas o ejercer contraloría social.",
    ejemplo: "Los presupuestos participativos municipales permiten a vecinos decidir directamente en qué se invierte una parte del presupuesto local.",
  },
  {
    id: "pp-contraloria",
    termino: "Contraloría social",
    definicion: "Mecanismo mediante el cual la ciudadanía organizada vigila, evalúa y denuncia irregularidades en la ejecución de programas y obras públicas.",
    ejemplo: "Un comité vecinal que verifica que la obra de pavimentación cumpla con las especificaciones contratadas ejerce contraloría social.",
  },
  {
    id: "pp-evaluacion",
    termino: "Evaluación de impacto",
    definicion: "Análisis sistemático que mide los efectos causales de una política pública sobre la población objetivo, distinguiendo qué cambios son atribuibles a la intervención.",
    ejemplo: "Comparar los logros académicos de estudiantes becados versus no becados permite evaluar el impacto real de un programa de becas.",
  },
  {
    id: "pp-equidad",
    termino: "Equidad en políticas públicas",
    definicion: "Principio que orienta las políticas a distribuir recursos y oportunidades según las necesidades de cada grupo, priorizando a quienes enfrentan mayores desventajas.",
    ejemplo: "Una política de salud equitativa no ofrece los mismos servicios a todos, sino que concentra mayor inversión en comunidades con menor cobertura médica.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 3 — Glosario: empareja término y definición (mismos pares A5).
 * Reutiliza PARES; aquí se exponen las etiquetas verbatim de A5 como pista
 * adicional del glosario.
 * ───────────────────────────────────────────────────────────────────────── */
export const GLOSARIO: { id: string; termino: string; definicion: string; etiquetas: string[] }[] = [
  {
    id: "gl-politica",
    termino: "Política pública",
    definicion: "Conjunto de decisiones, acciones y omisiones del Estado orientadas a dar respuesta a un problema social reconocido como de interés colectivo.",
    etiquetas: ["Estado", "gobierno", "problema social"],
  },
  {
    id: "gl-ciclo",
    termino: "Ciclo de política pública",
    definicion: "Proceso iterativo que comprende las fases de identificación del problema, diseño, implementación, evaluación y retroalimentación de una política.",
    etiquetas: ["proceso", "gestión pública", "fases"],
  },
  {
    id: "gl-participacion",
    termino: "Participación ciudadana",
    definicion: "Involucramiento activo de la población en los asuntos públicos: desde informarse y votar hasta cogestionar programas o ejercer contraloría social.",
    etiquetas: ["ciudadanía", "democracia", "incidencia"],
  },
  {
    id: "gl-contraloria",
    termino: "Contraloría social",
    definicion: "Mecanismo mediante el cual la ciudadanía organizada vigila, evalúa y denuncia irregularidades en la ejecución de programas y obras públicas.",
    etiquetas: ["rendición de cuentas", "transparencia", "ciudadanía"],
  },
  {
    id: "gl-evaluacion",
    termino: "Evaluación de impacto",
    definicion: "Análisis sistemático que mide los efectos causales de una política pública sobre la población objetivo, distinguiendo qué cambios son atribuibles a la intervención.",
    etiquetas: ["evaluación", "evidencia", "eficacia"],
  },
  {
    id: "gl-equidad",
    termino: "Equidad en políticas públicas",
    definicion: "Principio que orienta las políticas a distribuir recursos y oportunidades según las necesidades de cada grupo, priorizando a quienes enfrentan mayores desventajas.",
    etiquetas: ["justicia social", "distribución", "vulnerabilidad"],
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * Cuestionario de comprensión — V/F verbatim de A4 (publicada) y A2 (publicada).
 * Renderizado como opción doble Verdadero / Falso.
 * ───────────────────────────────────────────────────────────────────────── */
export const QUIZ: {
  pregunta: string;
  opciones: [string, string];
  correcta: 0 | 1;
  retro: string;
}[] = [
  {
    pregunta: "Una política pública es cualquier acción o decisión de un gobierno que busca dar respuesta a un problema social reconocido como tal.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto. Las políticas públicas son cursos de acción deliberados del Estado —leyes, programas, presupuestos, reglamentos— orientados a atender problemas colectivos. No toda acción gubernamental es una política pública: debe responder a un problema identificado.",
  },
  {
    pregunta: "La fase de evaluación de una política pública busca determinar si los recursos se gastaron correctamente, pero no si se lograron los objetivos sociales planteados.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "Falso. La evaluación de políticas públicas comprende tanto la eficiencia en el uso de recursos como la eficacia (¿se lograron los objetivos?) y la equidad (¿quiénes se beneficiaron o quedaron excluidos?).",
  },
  {
    pregunta: "La participación ciudadana en el ciclo de las políticas públicas puede ocurrir en todas sus fases: diagnóstico, diseño, implementación y evaluación.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto. La participación ciudadana puede ir desde la consulta en el diagnóstico del problema hasta la cogestión en la implementación y la contraloría social en la evaluación. Cada nivel de participación tiene distinto poder de incidencia.",
  },
  {
    pregunta: "Una política pública es efectiva únicamente si beneficia por igual a todos los grupos de la sociedad, sin distinguir sus condiciones de vulnerabilidad.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "Falso. La equidad, no la igualdad mecánica, es el principio rector de muchas políticas sociales: se requiere tratar de manera diferenciada a grupos en situación de desventaja para reducir brechas. La igualdad formal puede reproducir desigualdad real.",
  },
  {
    pregunta: "La contraloría social es un mecanismo de participación ciudadana que permite a la comunidad vigilar que los recursos públicos se usen conforme a los objetivos de un programa.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto. La contraloría social empodera a las comunidades para monitorear la ejecución de obras y programas, denunciar irregularidades y exigir rendición de cuentas a las autoridades.",
  },
  {
    pregunta: "CONEVAL es la institución encargada de medir la pobreza en México y evaluar la efectividad de los programas sociales del gobierno federal.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto. El Consejo Nacional de Evaluación de la Política de Desarrollo Social (CONEVAL) mide la pobreza multidimensional en México con una metodología que combina indicadores de bienestar económico y derechos sociales (salud, educación, vivienda, alimentación, seguridad social y servicios básicos).",
  },
];

/** Dato verbatim del contexto mexicano de A1. */
export const DATO_POLITICAS =
  "México tiene uno de los sistemas de evaluación de políticas públicas más desarrollados de América Latina, gracias al CONEVAL, creado en 2004 como organismo autónomo. Pero contar con instrumentos rigurosos no garantiza que sus resultados se traduzcan en cambios de política: menos del 30% de las recomendaciones del CONEVAL se implementan.";

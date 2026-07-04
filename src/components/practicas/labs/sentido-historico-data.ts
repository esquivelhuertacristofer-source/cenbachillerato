/**
 * Datos del Laboratorio — El sentido histórico: por qué el pasado importa en el
 * presente (CH-II-P03, Ciencias / Conciencia Histórica II).
 *
 * Contenido VERBATIM de CH-II·P03 ("El sentido histórico: por qué el pasado
 * importa en el presente; memoria colectiva y conciencia histórica; relación
 * pasado-presente"). Las definiciones del glosario, los ejemplos y las
 * afirmaciones del cuestionario se toman literalmente de las actividades A1
 * (lectura), A2 (quiz), A4 (V/F) y A5 (glosario). Los casos a clasificar y a
 * emparejar son ejemplos que las propias actividades explican.
 */

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 1 — ¿Qué forma de mirar el pasado? (clasifica casos en tres actitudes)
 *
 * El texto A1 contrasta tres maneras de relacionarse con el pasado:
 *  · sentido histórico crítico → contextualiza y conecta pasado-presente,
 *  · presentismo → juzga el pasado con los valores del presente,
 *  · memoria acrítica → recuerda sin cuestionar las narrativas oficiales.
 * ───────────────────────────────────────────────────────────────────────── */
export type TipoMirada = "sentido" | "presentismo" | "acritica";

export const TIPO_MIRADA_INFO: Record<
  TipoMirada,
  { titulo: string; subtitulo: string; icono: string }
> = {
  sentido: {
    titulo: "Sentido histórico",
    subtitulo:
      "Sitúa el presente en un proceso temporal más amplio: se pregunta cómo llegó a ser lo que es y contextualiza antes de juzgar.",
    icono: "fa-eye",
  },
  presentismo: {
    titulo: "Presentismo",
    subtitulo:
      "Interpreta el pasado con los valores y criterios del presente, sin considerar el contexto en que vivieron los actores históricos.",
    icono: "fa-clock-rotate-left",
  },
  acritica: {
    titulo: "Memoria acrítica",
    subtitulo:
      "Recuerda el pasado sin cuestionar las narrativas oficiales: memoriza fechas o repite la versión recibida sin analizarla.",
    icono: "fa-volume-low",
  },
};

export const CASOS: { id: string; texto: string; tipo: TipoMirada }[] = [
  {
    id: "ca-s1",
    texto:
      "Para entender la desigualdad en México hoy, rastrear la herencia colonial, el Porfiriato y las crisis económicas recientes.",
    tipo: "sentido",
  },
  {
    id: "ca-s2",
    texto:
      "Ver que la marginación de muchos municipios indígenas no es accidente ni destino, sino el resultado de siglos de exclusión sistemática.",
    tipo: "sentido",
  },
  {
    id: "ca-s3",
    texto:
      "Comprender primero el contexto de una época antes de emitir un juicio sobre las decisiones de sus actores.",
    tipo: "sentido",
  },
  {
    id: "ca-p1",
    texto:
      "Juzgar a los conquistadores del siglo XVI con los estándares de los derechos humanos del siglo XXI.",
    tipo: "presentismo",
  },
  {
    id: "ca-p2",
    texto:
      "Atribuir al pasado ideas o prácticas que no existían en esa época (anacronismo, error opuesto pero emparentado).",
    tipo: "presentismo",
  },
  {
    id: "ca-p3",
    texto:
      "Evaluar las decisiones de actores históricos como si hubieran tenido acceso a los conocimientos y valores de hoy.",
    tipo: "presentismo",
  },
  {
    id: "ca-a1",
    texto:
      "Aceptar la historia oficial sin notar que toda selección enfatiza ciertos eventos y silencia otros.",
    tipo: "acritica",
  },
  {
    id: "ca-a2",
    texto:
      "Memorizar fechas y datos sin preguntarse, ante cada fenómeno, cómo llegó a ser lo que es.",
    tipo: "acritica",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 2 — Del pasado al presente (empareja un fenómeno actual con su raíz
 * histórica). Pares tomados de A1 (lectura) y A4 (V/F): el sentido histórico
 * muestra que la realidad presente es consecuencia de procesos del pasado.
 * ───────────────────────────────────────────────────────────────────────── */
export const RAICES: { id: string; presente: string; raiz: string; ejemplo: string }[] = [
  {
    id: "ra-tierra",
    presente: "La distribución de la tierra en México",
    raiz: "El reparto agrario posrevolucionario",
    ejemplo: "Sigue marcada por el reparto agrario que siguió a la Revolución Mexicana.",
  },
  {
    id: "ra-castas",
    presente: "La desigualdad étnica y el sistema de castas",
    raiz: "La Conquista de México (1519-1521)",
    ejemplo: "El mestizaje, las castas, la evangelización y el despojo territorial configuran estructuras que aún persisten.",
  },
  {
    id: "ra-constitucion",
    presente: "La Constitución Política de 1917 vigente",
    raiz: "La Revolución y el liberalismo del siglo XIX",
    ejemplo: "No surgió de la nada: es resultado de la Revolución y de las ideas liberales del siglo XIX.",
  },
  {
    id: "ra-norte-sur",
    presente: "La brecha de desarrollo entre el norte y el sur",
    raiz: "Presidios y minería frente a encomiendas y haciendas",
    ejemplo: "El norte fue zona de presidios y minería colonial; el sur, de encomiendas y haciendas; la estructura persiste.",
  },
  {
    id: "ra-lenguas",
    presente: "La diversidad lingüística (68 agrupaciones indígenas)",
    raiz: "La herencia del período prehispánico",
    ejemplo: "México hereda del período prehispánico una diversidad lingüística extraordinaria.",
  },
  {
    id: "ra-12oct",
    presente: "La disputa por el significado del 12 de octubre",
    raiz: "La memoria colectiva del mismo evento de 1492",
    ejemplo: "«Día de la Raza» que celebra el mestizaje frente al inicio de un genocidio y despojo no resuelto: dos memorias opuestas.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 3 — Empareja término y definición (glosario A5, verbatim)
 * ───────────────────────────────────────────────────────────────────────── */
export const PARES: { id: string; termino: string; definicion: string; ejemplo: string }[] = [
  {
    id: "gl-sentido",
    termino: "Sentido histórico",
    definicion:
      "Capacidad humana de comprender el presente como resultado del pasado; implica reconocer que las estructuras sociales, instituciones y culturas actuales tienen origen en procesos históricos específicos y no son naturales ni eternas.",
    ejemplo:
      "Permite entender que la Constitución de 1917 no surgió de la nada: es resultado de la Revolución y de las ideas liberales del siglo XIX.",
  },
  {
    id: "gl-memoria",
    termino: "Memoria colectiva",
    definicion:
      "Conjunto de recuerdos, narrativas y representaciones que un grupo social comparte sobre su pasado, y que contribuye a construir y mantener su identidad. Es selectiva: algunas memorias se preservan y otras se silencian.",
    ejemplo:
      "La celebración del 16 de septiembre renueva el vínculo de la sociedad con la emancipación de 1810 y sus protagonistas (Hidalgo, Morelos, Allende).",
  },
  {
    id: "gl-larga",
    termino: "Larga duración (Braudel)",
    definicion:
      "Concepto de Fernand Braudel (Escuela de los Annales) que distingue procesos históricos de muy larga duración (geografía, clima, estructuras sociales profundas) de los eventos coyunturales. Permite comprender continuidades estructurales.",
    ejemplo:
      "La desigualdad norte-sur tiene raíces de larga duración: el norte fue de presidios y minería; el sur, de encomiendas y haciendas.",
  },
  {
    id: "gl-presentismo",
    termino: "Presentismo histórico",
    definicion:
      "Error metodológico que consiste en interpretar el pasado con los valores, categorías y expectativas del presente, sin respetar el contexto histórico de la época estudiada.",
    ejemplo:
      "Juzgar a los conquistadores del siglo XVI con los valores de derechos humanos del siglo XXI es un ejemplo de presentismo.",
  },
  {
    id: "gl-continuidad",
    termino: "Continuidad y ruptura histórica",
    definicion:
      "Toda época combina elementos que persisten del pasado (continuidades) con transformaciones o quiebres profundos (rupturas). El análisis histórico identifica ambos para comprender el cambio social.",
    ejemplo:
      "La Reforma Liberal de Juárez (1855-1867) rompió con el poder de la Iglesia, pero el latifundismo y la marginación indígena persistieron.",
  },
  {
    id: "gl-herencia",
    termino: "Herencia histórica",
    definicion:
      "Conjunto de estructuras, instituciones, prácticas culturales, desigualdades y logros que el pasado lega al presente. La herencia histórica puede ser positiva (arte, ciencia, democracia) o negativa (desigualdad, discriminación).",
    ejemplo:
      "México hereda del período prehispánico su diversidad lingüística, y del colonial, la arquitectura virreinal y un sistema jurídico de raíces romanistas.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * Cuestionario de comprensión (V/F de A4, verbatim).
 * Renderizado como opción doble Verdadero / Falso.
 * ───────────────────────────────────────────────────────────────────────── */
export const QUIZ: {
  pregunta: string;
  opciones: [string, string];
  correcta: 0 | 1;
  retro: string;
}[] = [
  {
    pregunta:
      "El sentido histórico es la capacidad exclusiva de los historiadores profesionales para interpretar documentos del pasado; los ciudadanos comunes no la pueden desarrollar.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro:
      "Falso. El sentido histórico es una capacidad humana que cualquier persona puede desarrollar. Implica reconocer que el presente es resultado del pasado y que las estructuras sociales actuales tienen origen histórico.",
  },
  {
    pregunta:
      "La memoria colectiva de una sociedad incluye las narrativas, tradiciones y experiencias compartidas que permiten a un grupo identificarse con su pasado común.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro:
      "Correcto. La memoria colectiva (concepto desarrollado por Maurice Halbwachs) es el conjunto de recuerdos y narrativas que un grupo social construye y transmite sobre su pasado, configurando su identidad.",
  },
  {
    pregunta:
      "Comprender el presente desde el pasado significa que las condiciones actuales de México (desigualdad, instituciones, cultura) son resultado de procesos históricos como la Colonia, la Reforma y la Revolución, no de factores aleatorios.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro:
      "Correcto. El sentido histórico permite ver que la realidad presente es consecuencia de decisiones, conflictos y transformaciones del pasado. Por ejemplo, la distribución de la tierra en México sigue marcada por el reparto agrario posrevolucionario.",
  },
  {
    pregunta:
      "Recordar el pasado de manera acrítica, sin cuestionar las narrativas oficiales, equivale a ejercer plenamente el sentido histórico.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro:
      "Falso. El sentido histórico exige una actitud crítica y reflexiva. Memorizar fechas o narrativas oficiales sin análisis no es lo mismo que comprender históricamente el presente. Requiere cuestionar, contextualizar e interpretar.",
  },
  {
    pregunta:
      "La Conquista de México (1519-1521) sigue siendo relevante para el presente porque sus consecuencias (mestizaje, sistema de castas, evangelización, despojo territorial) configuran estructuras sociales y culturales que aún persisten.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro:
      "Correcto. El sentido histórico reconoce que procesos del siglo XVI como la Conquista tienen consecuencias de larga duración que se expresan en la realidad contemporánea (desigualdad étnica, patrimonio cultural, identidad lingüística, etc.).",
  },
];

/** Dato verbatim de la lectura A1 (uso político de la historia / presentismo). */
export const DATO_SENTIDO =
  "Desarrollar el sentido histórico es una forma de ciudadanía crítica: permite cuestionar los relatos oficiales, identificar para qué sirve cierta versión del pasado y comprender que el presente no es inevitable, fue construido y puede ser transformado.";

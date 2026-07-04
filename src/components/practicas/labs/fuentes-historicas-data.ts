/**
 * Datos del Laboratorio — Fuentes históricas: selección, evaluación y contraste
 * (CH-III-P01, Conciencia Histórica III).
 *
 * Contenido VERBATIM de CH-III·P01 ("¿Cómo evaluar una fuente histórica?
 * Criterios y procedimientos para el análisis crítico"). Las definiciones del
 * glosario, los ejemplos y las afirmaciones del cuestionario se toman
 * literalmente de las actividades A1 (lectura), A2 (quiz), A4 (V/F), A5
 * (glosario) y A6 (fill_blanks). Los ejemplos a clasificar son casos que las
 * propias actividades clasifican explícitamente.
 */

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 1 — ¿Primaria, secundaria o terciaria? (clasifica por tipo de fuente)
 * ───────────────────────────────────────────────────────────────────────── */
export type TipoFuente = "primaria" | "secundaria" | "terciaria";

export const TIPO_FUENTE_INFO: Record<
  TipoFuente,
  { titulo: string; subtitulo: string; icono: string }
> = {
  primaria: {
    titulo: "Fuente primaria",
    subtitulo: "Producida durante el período estudiado o por participantes directos de los hechos. Evidencia de primera mano.",
    icono: "fa-file-lines",
  },
  secundaria: {
    titulo: "Fuente secundaria",
    subtitulo: "Análisis o interpretación elaborada por historiadores con base en fuentes primarias: libros, artículos, enciclopedias.",
    icono: "fa-book",
  },
  terciaria: {
    titulo: "Fuente terciaria",
    subtitulo: "Recopila y organiza fuentes secundarias: bibliografías y bases de datos.",
    icono: "fa-database",
  },
};

export const FUENTES: { id: string; texto: string; tipo: TipoFuente }[] = [
  { id: "fu-p1", texto: "Una fotografía de la Revolución Mexicana del archivo Casasola (1910-1920)", tipo: "primaria" },
  { id: "fu-p2", texto: "El Diario de Cristóbal Colón (1492)", tipo: "primaria" },
  { id: "fu-p3", texto: "Una carta escrita por un soldado durante la Revolución Mexicana", tipo: "primaria" },
  { id: "fu-s1", texto: "El libro «México a través de los siglos» de Vicente Riva Palacio", tipo: "secundaria" },
  { id: "fu-s2", texto: "Un artículo académico sobre la Revolución Francesa publicado en 2010", tipo: "secundaria" },
  { id: "fu-s3", texto: "Un libro publicado en 2020 que analiza documentos coloniales", tipo: "secundaria" },
  { id: "fu-t1", texto: "Una bibliografía que recopila libros sobre la Independencia", tipo: "terciaria" },
  { id: "fu-t2", texto: "Una base de datos que reúne artículos de historia", tipo: "terciaria" },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 2 — Los cinco criterios (empareja cada criterio con su pregunta clave)
 * ───────────────────────────────────────────────────────────────────────── */
export const CRITERIOS: { id: string; criterio: string; pregunta: string; ejemplo: string }[] = [
  {
    id: "cr-autoria",
    criterio: "Autoría",
    pregunta: "¿Quién produjo la fuente?",
    ejemplo: "Identificar al autor permite valorar su posición, conocimientos y posibles intereses.",
  },
  {
    id: "cr-fecha",
    criterio: "Fecha",
    pregunta: "¿Cuándo se produjo?",
    ejemplo: "La proximidad temporal con los hechos influye en el tipo de testimonio que ofrece.",
  },
  {
    id: "cr-intencion",
    criterio: "Intención",
    pregunta: "¿Para qué se produjo?",
    ejemplo: "Conocer el propósito de la fuente revela qué buscaba comunicar o lograr su autor.",
  },
  {
    id: "cr-audiencia",
    criterio: "Audiencia",
    pregunta: "¿Para quién estaba destinada?",
    ejemplo: "El público al que se dirige condiciona el tono, el contenido y los énfasis de la fuente.",
  },
  {
    id: "cr-contexto",
    criterio: "Contexto",
    pregunta: "¿En qué circunstancias se produjo?",
    ejemplo: "El marco histórico, político y social en que se creó la fuente explica buena parte de su contenido.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 3 — Empareja término y definición (glosario A5, verbatim)
 * ───────────────────────────────────────────────────────────────────────── */
export const PARES: { id: string; termino: string; definicion: string; ejemplo: string }[] = [
  {
    id: "gl-primaria",
    termino: "Fuente primaria",
    definicion: "Documento, objeto o testimonio producido durante el período histórico estudiado o por participantes directos de los hechos. Proporciona evidencia de primera mano.",
    ejemplo: "El Diario de Cristóbal Colón (1492), fotografías de la Revolución Mexicana (1910-1920), documentos del Archivo General de la Nación.",
  },
  {
    id: "gl-secundaria",
    termino: "Fuente secundaria",
    definicion: "Análisis, interpretación o síntesis elaborada por historiadores u otros autores sobre el pasado, generalmente con base en fuentes primarias. Incluye libros de historia, artículos académicos y enciclopedias.",
    ejemplo: "El libro 'México a través de los siglos' de Vicente Riva Palacio, un artículo académico sobre la Revolución Francesa publicado en 2010.",
  },
  {
    id: "gl-sesgo",
    termino: "Sesgo histórico",
    definicion: "Tendencia parcial de una fuente que refleja los intereses, valores, ideología o perspectiva de quien la produjo. Identificar el sesgo es parte esencial del análisis crítico de fuentes.",
    ejemplo: "Un diario escrito por un funcionario colonial puede omitir perspectivas indígenas; una crónica oficial de guerra puede exaltar la victoria y minimizar las bajas propias.",
  },
  {
    id: "gl-fiabilidad",
    termino: "Fiabilidad de una fuente",
    definicion: "Grado en que una fuente refleja de manera precisa y honesta los hechos que describe. Se evalúa considerando la proximidad temporal, la posición del autor, su intención y la consistencia con otras fuentes.",
    ejemplo: "Un acta notarial del siglo XIX tiene alta fiabilidad como registro legal, aunque su perspectiva puede ser limitada a una sola parte de la transacción.",
  },
  {
    id: "gl-contraste",
    termino: "Contraste de fuentes",
    definicion: "Técnica del método histórico que consiste en comparar múltiples fuentes sobre el mismo hecho para identificar coincidencias, contradicciones y perspectivas diversas, construyendo una interpretación más completa.",
    ejemplo: "Comparar el relato de un conquistador español con el códice de un tlacuilo mexica sobre la Conquista de Tenochtitlan revela perspectivas radicalmente distintas.",
  },
  {
    id: "gl-iconografica",
    termino: "Fuente iconográfica",
    definicion: "Fuente histórica de carácter visual: pinturas, grabados, fotografías, mapas, carteles, caricaturas políticas. Requiere análisis específico: contexto de producción, intención del autor y circulación.",
    ejemplo: "El mural 'Sueño de una tarde dominical en la Alameda Central' de Diego Rivera como fuente iconográfica sobre la identidad nacional mexicana.",
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
    pregunta: "Una fuente primaria es aquella que fue producida durante el período histórico que se estudia o por participantes directos de los hechos.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto. Las fuentes primarias son testimonios directos o registros del período: documentos oficiales, cartas, fotografías de época, objetos arqueológicos, relatos de testigos presenciales.",
  },
  {
    pregunta: "Una fuente secundaria siempre es más confiable que una fuente primaria porque fue escrita con mayor distancia temporal y análisis reflexivo.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "Falso. La distancia temporal no garantiza mayor fiabilidad. Las fuentes secundarias pueden contener interpretaciones sesgadas, errores de análisis o perspectivas ideológicas. Ambos tipos requieren evaluación crítica.",
  },
  {
    pregunta: "Contrastar fuentes consiste en comparar versiones de distintos testimonios o documentos para identificar coincidencias, contradicciones y perspectivas diversas sobre un mismo hecho histórico.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto. El contraste de fuentes es una técnica fundamental del método histórico: permite detectar sesgos, completar la imagen del pasado y construir interpretaciones más robustas.",
  },
  {
    pregunta: "El sesgo en una fuente histórica la invalida automáticamente y debe ser descartada del análisis.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "Falso. El sesgo no invalida una fuente; al contrario, identificarlo es parte del análisis histórico. Una fuente sesgada puede revelar las intenciones, valores e intereses de quien la produjo, lo que tiene valor historiográfico.",
  },
  {
    pregunta: "La iconografía histórica (pinturas, fotografías, grabados) puede constituir una fuente primaria válida para el estudio del pasado.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto. Las imágenes históricas son fuentes primarias de tipo iconográfico. Requieren análisis específico: contexto de producción, intención del autor, usos y circulación de la imagen.",
  },
];

/** Dato verbatim del glosario A5 (definición de «Sesgo histórico»). */
export const DATO_FUENTES =
  "Toda fuente histórica refleja los intereses, valores, ideología o perspectiva de quien la produjo. Identificar el sesgo no la invalida: es parte esencial del análisis crítico de fuentes.";

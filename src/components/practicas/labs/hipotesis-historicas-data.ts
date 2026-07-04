/**
 * Datos del Laboratorio — Formular hipótesis históricas y clasificar fuentes
 * (CH-II-P02, Ciencias Históricas II).
 *
 * Tema: «Construye hipótesis para cuestionar las interpretaciones del pasado»
 * (análisis de fuentes del siglo XIX mexicano). Contenido VERBATIM de CH-II·P02:
 *  · A1 (lectura "¿Cómo formular hipótesis históricas?") aporta los CUATRO PASOS
 *    del método de formulación de hipótesis (observar, contextualizar, formular,
 *    contrastar), transcritos literalmente.
 *  · A2 / A4 (quiz V/F) aportan los ejemplos clasificados de fuentes primarias y
 *    secundarias y las afirmaciones del cuestionario.
 *  · A5 (glosario interactivo) aporta los seis términos verbatim del método
 *    histórico (hipótesis, fuente primaria, fuente secundaria, crítica de
 *    fuentes, evidencia histórica, corroboración/triangulación).
 *
 * Los ejemplos a clasificar (Modo 1) son casos que las propias actividades
 * A2 / A4 / A5 clasifican EXPLÍCITAMENTE como primaria o secundaria; no se
 * inventan fuentes nuevas.
 */

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 1 — ¿Fuente primaria o secundaria? (clasifica cada fuente)
 * Ejemplos verbatim de A2 / A4 / A5.
 * ───────────────────────────────────────────────────────────────────────── */
export type TipoFuente = "primaria" | "secundaria";

export const TIPO_FUENTE_INFO: Record<
  TipoFuente,
  { titulo: string; subtitulo: string; icono: string }
> = {
  primaria: {
    titulo: "Fuente primaria",
    subtitulo: "Documento, objeto o testimonio producido durante el período histórico que se estudia o por participantes directos en los hechos. Evidencia de primera mano.",
    icono: "fa-file-lines",
  },
  secundaria: {
    titulo: "Fuente secundaria",
    subtitulo: "Análisis o interpretación elaborada por investigadores con base en fuentes primarias, después de los hechos. Ofrece perspectivas analíticas.",
    icono: "fa-book",
  },
};

export const FUENTES: { id: string; texto: string; tipo: TipoFuente }[] = [
  { id: "fu-p1", texto: "El Plan de Ayala (1911), proclamado por Emiliano Zapata", tipo: "primaria" },
  { id: "fu-p2", texto: "El Códice Mendoza (c. 1541), fuente iconográfica con los registros tributarios del Imperio Azteca", tipo: "primaria" },
  { id: "fu-p3", texto: "Un documento del Archivo General de la Nación producido durante la Independencia", tipo: "primaria" },
  { id: "fu-p4", texto: "El testimonio oral de un anciano que vivió el Movimiento Estudiantil de 1968", tipo: "primaria" },
  { id: "fu-p5", texto: "Una fotografía del Archivo Casasola de la Revolución Mexicana (1910-1920)", tipo: "primaria" },
  { id: "fu-s1", texto: "La obra «La Revolución Mexicana» del historiador Friedrich Katz", tipo: "secundaria" },
  { id: "fu-s2", texto: "Un libro de texto de historia publicado en 2010 que analiza la Revolución Mexicana", tipo: "secundaria" },
  { id: "fu-s3", texto: "Un libro publicado en 2020 sobre la Revolución Mexicana basado en investigación de archivos", tipo: "secundaria" },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 2 — Los cuatro pasos del método (ordena/empareja paso → qué hacer)
 * Descripciones verbatim de la lectura A1.
 * ───────────────────────────────────────────────────────────────────────── */
export const PASOS: { id: string; paso: string; orden: number; descripcion: string; ejemplo: string }[] = [
  {
    id: "pa-observar",
    paso: "1. Observar la fuente",
    orden: 1,
    descripcion: "Observar la fuente con atención: identificar qué tipo de documento es, quién lo produjo, cuándo y en qué contexto.",
    ejemplo: "Reconocer que un periódico como El Monitor Republicano (1844) es prensa liberal de la época.",
  },
  {
    id: "pa-contextualizar",
    paso: "2. Contextualizar",
    orden: 2,
    descripcion: "Situar la fuente en el marco histórico más amplio para entender qué significaba ese documento en su época.",
    ejemplo: "Ubicar el Plan de Ayutla (1854) dentro del conflicto entre liberales y conservadores.",
  },
  {
    id: "pa-formular",
    paso: "3. Formular la hipótesis",
    orden: 3,
    descripcion: "Formular la hipótesis a partir de lo observado: dado que existen las condiciones X, se propone que ocurrió Y por las razones Z.",
    ejemplo: "Proponer que la Guerra de Reforma se debió a la disputa por el poder de la Iglesia.",
  },
  {
    id: "pa-contrastar",
    paso: "4. Buscar otras fuentes",
    orden: 4,
    descripcion: "Buscar otras fuentes que confirmen, maticen o contradigan la hipótesis, para fortalecer o revisar la interpretación.",
    ejemplo: "Comparar documentos insurgentes, fuentes realistas y registros eclesiásticos.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 3 — Empareja término y definición (glosario A5, verbatim)
 * ───────────────────────────────────────────────────────────────────────── */
export const PARES: { id: string; termino: string; definicion: string; ejemplo: string }[] = [
  {
    id: "gl-hipotesis",
    termino: "Hipótesis histórica",
    definicion: "Proposición provisional que busca explicar un proceso, evento o fenómeno del pasado. Se formula a partir de preguntas históricas y se verifica mediante el análisis sistemático de fuentes y evidencias.",
    ejemplo: "«La Revolución Mexicana estalló en 1910 principalmente por la acumulación de tierras en manos de unos pocos terratenientes durante el porfiriato.»",
  },
  {
    id: "gl-primaria",
    termino: "Fuente primaria",
    definicion: "Documento, objeto o testimonio producido durante el período histórico que se estudia o por participantes directos en los hechos. Proporciona evidencia de primera mano.",
    ejemplo: "El Plan de Ayala (1911), proclamado por Emiliano Zapata, para estudiar el zapatismo y las demandas agrarias.",
  },
  {
    id: "gl-secundaria",
    termino: "Fuente secundaria",
    definicion: "Análisis, interpretación o síntesis elaborada por investigadores o historiadores con base en fuentes primarias. Ofrece perspectivas analíticas sobre los hechos del pasado.",
    ejemplo: "La obra «La Revolución Mexicana» del historiador Friedrich Katz, que interpreta el movimiento a partir de múltiples fuentes primarias.",
  },
  {
    id: "gl-critica",
    termino: "Crítica de fuentes (heurística)",
    definicion: "Proceso metodológico para evaluar la autenticidad, confiabilidad y perspectiva de una fuente histórica. Incluye crítica externa (¿es auténtica?) e interna (¿qué dice realmente y con qué sesgo?).",
    ejemplo: "Al analizar las crónicas de Bernal Díaz del Castillo, evaluar su punto de vista de conquistador español y sus motivaciones al narrar la Conquista.",
  },
  {
    id: "gl-evidencia",
    termino: "Evidencia histórica",
    definicion: "Conjunto de datos, fuentes y vestigios que sirven para sustentar o refutar una hipótesis histórica. No toda evidencia es igualmente confiable: debe evaluarse su origen, contexto y posibles sesgos.",
    ejemplo: "Los códices prehispánicos, como el Códice Mendoza, que revelan la organización política y económica del Imperio Mexica.",
  },
  {
    id: "gl-triangulacion",
    termino: "Corroboración y triangulación de fuentes",
    definicion: "Práctica historiográfica de contrastar varias fuentes independientes entre sí para aumentar la confiabilidad de las conclusiones. Evita depender de una sola perspectiva o documento.",
    ejemplo: "Para estudiar la masacre de Tlatelolco de 1968, contrastar documentos oficiales, testimonios de sobrevivientes, fotografías y archivos desclasificados.",
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
    pregunta: "Una fuente primaria es aquella producida directamente durante el período histórico que se estudia, como una carta, un diario, una fotografía o un documento oficial de la época.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto. Las fuentes primarias son testimonios directos del período: diarios personales, actas, crónicas contemporáneas, artefactos arqueológicos, fotografías históricas, entre otros.",
  },
  {
    pregunta: "Una hipótesis histórica es una afirmación definitiva y comprobada sobre el pasado que no requiere ser verificada con fuentes.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "Falso. Una hipótesis histórica es una proposición provisional que busca explicar un hecho o proceso del pasado; debe ser sustentada, contrastada y revisada mediante el análisis de fuentes y evidencias.",
  },
  {
    pregunta: "Un libro de texto de historia publicado en 2010 que analiza la Revolución Mexicana es un ejemplo de fuente secundaria.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto. Las fuentes secundarias son interpretaciones o análisis elaborados por historiadores después de los hechos, basándose en fuentes primarias y en investigación historiográfica.",
  },
  {
    pregunta: "El testimonio oral de un anciano que vivió el Movimiento Estudiantil de 1968 en México constituye una fuente primaria válida para el estudio de ese evento.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto. Los testimonios orales de testigos directos son fuentes primarias valiosas. La historia oral es una metodología reconocida que recoge experiencias de actores que no dejaron registros escritos.",
  },
  {
    pregunta: "En historia, una sola fuente primaria es suficiente para establecer una hipótesis histórica como verdad definitiva.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "Falso. El método histórico exige contrastar múltiples fuentes para evitar sesgos, errores o manipulaciones. Una sola fuente puede ser incompleta, parcial o interesada.",
  },
];

/** Dato verbatim de la lectura A1. */
export const DATO_HIPOTESIS =
  "El historiador no observa el pasado directamente: lo reconstruye a partir de rastros. La historia es siempre una conversación abierta con el pasado, no un relato cerrado y terminado.";

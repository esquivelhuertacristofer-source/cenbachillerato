/**
 * Datos del Laboratorio — Tipos de gráficas y cuándo usarlas
 * (CD-II-P04, Cultura Digital II).
 *
 * Contenido VERBATIM de CD-II·P04 «Tipos de gráficas y cuándo usarlas». Los
 * tipos de gráfica, sus propósitos, los escenarios y las trampas visuales se
 * toman literalmente de A1 (infografía «Tipos de gráficas estadísticas: cuándo
 * y cómo usarlas», fuente INEGI ENDUTIH 2023 / CEPAL 2022). El cuestionario
 * V/F es verbatim de A4 (quiz_verdadero_falso). El glosario es verbatim de A5
 * (glosario_interactivo «estadística y software libre»).
 *
 * Los SVG de cada tipo de gráfica son dibujados a mano (inline, sin
 * dependencias) como apoyo visual; no aportan datos nuevos.
 */

export type Glyph = "barras" | "linea" | "circular" | "dispersion" | "area";

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 1 — Empareja cada tipo de gráfica con su propósito (cuándo usarla).
 * Cinco tipos verbatim de los puntos clave de A1.
 * ───────────────────────────────────────────────────────────────────────── */
export const GRAFICAS: {
  id: string;
  glyph: Glyph;
  nombre: string;
  proposito: string;
  detalle: string;
}[] = [
  {
    id: "g-barras",
    glyph: "barras",
    nombre: "Gráfica de barras",
    proposito: "Comparar cantidades entre categorías discretas",
    detalle: "Ideal para 3 a 15 categorías. Es el formato más usado por el INEGI para comparar indicadores entre entidades federativas.",
  },
  {
    id: "g-linea",
    glyph: "linea",
    nombre: "Gráfica de línea",
    proposito: "Mostrar tendencias a lo largo del tiempo",
    detalle: "Requiere al menos 6 puntos temporales para ser informativa. Formato estándar para series históricas del PIB, inflación o empleo.",
  },
  {
    id: "g-circular",
    glyph: "circular",
    nombre: "Gráfica circular (pastel)",
    proposito: "Representar proporciones de un todo",
    detalle: "Solo útil con 6 o menos categorías. Muy abusada: los cerebros humanos comparan áreas con menos precisión que alturas.",
  },
  {
    id: "g-dispersion",
    glyph: "dispersion",
    nombre: "Gráfica de dispersión (scatter plot)",
    proposito: "Mostrar la relación entre dos variables numéricas continuas",
    detalle: "Alta densidad de puntos puede revelar correlaciones no evidentes. No implica causalidad.",
  },
  {
    id: "g-area",
    glyph: "area",
    nombre: "Gráfica de área",
    proposito: "Enfatizar el volumen acumulado a lo largo del tiempo",
    detalle: "Variante de la línea. Útil para comparar múltiples series a lo largo del tiempo (ej: mix de generación eléctrica por fuente).",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 2 — Clasifica cada escenario de datos por la gráfica apropiada.
 * Escenarios derivados literalmente de la descripción accesible y las
 * preguntas de reflexión de A1 (cada caso ya está asignado a un tipo en A1),
 * más los datos de redes sociales de A2.
 * ───────────────────────────────────────────────────────────────────────── */
export const ESCENARIOS: { id: string; texto: string; tipo: Glyph }[] = [
  { id: "e-1", texto: "Comparar el porcentaje de hogares con acceso a internet por entidad federativa (INEGI ENDUTIH 2023)", tipo: "barras" },
  { id: "e-2", texto: "Comparar el porcentaje de jóvenes con acceso a internet en los 32 estados de México", tipo: "barras" },
  { id: "e-3", texto: "Mostrar la evolución del PIB de México entre 2000 y 2023", tipo: "linea" },
  { id: "e-4", texto: "Mostrar la tendencia del tiempo en redes sociales a lo largo de las semanas del año", tipo: "linea" },
  { id: "e-5", texto: "Mostrar la distribución del uso de plataformas digitales por jóvenes de 15 a 29 años", tipo: "circular" },
  { id: "e-6", texto: "Relacionar los años de escolaridad con el salario promedio mensual en México", tipo: "dispersion" },
  { id: "e-7", texto: "Comparar el mix de generación eléctrica por fuente a lo largo del tiempo", tipo: "area" },
];

/* ─────────────────────────────────────────────────────────────────────────
 * Trampas visuales verbatim de A1 (panel de advertencia). Se muestran como
 * «dato» rotatorio / pista lateral; conocerlas es competencia ciudadana.
 * ───────────────────────────────────────────────────────────────────────── */
export const TRAMPAS: { id: string; titulo: string; texto: string; icono: string }[] = [
  {
    id: "t-eje",
    titulo: "Trampa del eje truncado",
    texto: "Si el eje Y no comienza en cero, una diferencia del 2% puede verse como si fuera del 200%. Técnica frecuente en medios para exagerar diferencias en encuestas electorales.",
    icono: "fa-chart-column",
  },
  {
    id: "t-escalas",
    titulo: "Trampa de escalas distintas",
    texto: "Dos variables con ejes independientes en la misma gráfica pueden crear una correlación visual que no existe en los datos reales.",
    icono: "fa-arrow-down-up-across-line",
  },
  {
    id: "t-3d",
    titulo: "Trampa 3D",
    texto: "Las representaciones tridimensionales de datos bidimensionales distorsionan la percepción relativa de las porciones. Evitarlas en visualización seria.",
    icono: "fa-cube",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 3 — Empareja término y definición (glosario A5, verbatim).
 * ───────────────────────────────────────────────────────────────────────── */
export const PARES: { id: string; termino: string; definicion: string; ejemplo: string }[] = [
  {
    id: "gl-tendencia",
    termino: "Medida de tendencia central",
    definicion: "Valor que resume un conjunto de datos: media, mediana o moda.",
    ejemplo: "La media de las calificaciones de un grupo.",
  },
  {
    id: "gl-media",
    termino: "Media (promedio)",
    definicion: "Suma de todos los valores dividida entre la cantidad de datos.",
    ejemplo: "Promedio de las edades de tus compañeros.",
  },
  {
    id: "gl-dispersion",
    termino: "Medida de dispersión",
    definicion: "Valor que indica qué tan separados están los datos entre sí.",
    ejemplo: "El rango o la desviación estándar.",
  },
  {
    id: "gl-grafica",
    termino: "Representación gráfica",
    definicion: "Forma visual de mostrar datos para entenderlos y comunicarlos.",
    ejemplo: "Un gráfico de barras o un histograma.",
  },
  {
    id: "gl-software",
    termino: "Software estadístico libre",
    definicion: "Programas gratuitos y abiertos para analizar datos.",
    ejemplo: "Jamovi, JASP o XLSTAT Free.",
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
    pregunta: "La media, la mediana y la moda son medidas de tendencia central.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: resumen un conjunto de datos en un valor representativo.",
  },
  {
    pregunta: "La desviación estándar y el rango son medidas de dispersión.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: indican qué tan dispersos están los datos.",
  },
  {
    pregunta: "Jamovi y JASP son ejemplos de software estadístico libre.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: permiten procesar datos sin pagar licencia.",
  },
  {
    pregunta: "Las gráficas no sirven para representar ni comunicar datos.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "Al contrario: las representaciones gráficas ayudan a visualizar y comunicar la información.",
  },
];

/** Dato verbatim del contexto mexicano de A1. */
export const DATO_GRAFICAS =
  "El INEGI produce más de 300 conjuntos de datos estadísticos públicos, todos accesibles en datos.gob.mx. Sus gráficas son el estándar de referencia para periodistas, investigadores y funcionarios en México.";

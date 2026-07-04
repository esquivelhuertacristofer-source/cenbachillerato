/**
 * Datos del Laboratorio — Los algoritmos deciden por nosotros
 * (CD-I-P04, Cultura Digital I).
 *
 * Contenido VERBATIM de CD-I·P04 ("Los algoritmos deciden por nosotros"). Las
 * frases, ejemplos y afirmaciones se toman literalmente de las actividades A1
 * (lectura), A2 (quiz de opción múltiple) y A5 (glosario interactivo).
 *
 * IMPORTANTE — fidelidad: A4 (V/F) y la mayor parte de A5 tratan de «resolución
 * de problemas / diagrama de flujo / identidad digital / credenciales», que es
 * OTRO tema (pensamiento algorítmico de programación), NO los algoritmos de
 * recomendación que decide el contenido que vemos. Por eso este laboratorio se
 * construye sobre el contenido EN TEMA: la lectura A1 (algoritmos de
 * recomendación, sesgo, burbuja de filtro), el quiz A2 (que sí pregunta por la
 * burbuja de filtro y el objetivo de los algoritmos) y el único término en tema
 * del glosario A5 («Algoritmo»). Se excluye lo fuera de tema para no contaminar.
 */

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 1 — ¿Qué hace este algoritmo? (clasifica cada plataforma por la
 * decisión que su algoritmo toma — verbatim de la lectura A1).
 * ───────────────────────────────────────────────────────────────────────── */
export type Plataforma = "youtube" | "instagram" | "tiktok" | "google";

export const PLATAFORMA_INFO: Record<
  Plataforma,
  { titulo: string; subtitulo: string; icono: string }
> = {
  youtube: {
    titulo: "YouTube",
    subtitulo: "Su algoritmo decide qué video te recomienda a continuación.",
    icono: "fa-play",
  },
  instagram: {
    titulo: "Instagram",
    subtitulo: "Su algoritmo decide qué publicaciones aparecen primero en tu feed.",
    icono: "fa-camera",
  },
  tiktok: {
    titulo: "TikTok",
    subtitulo: "Analiza cuánto tiempo pasas en cada video y aprende tus preferencias con rapidez asombrosa.",
    icono: "fa-music",
  },
  google: {
    titulo: "Google",
    subtitulo: "Su algoritmo decide en qué orden aparecen los resultados de búsqueda.",
    icono: "fa-magnifying-glass",
  },
};

/** Cada decisión es VERBATIM de la lectura A1; se clasifica en su plataforma. */
export const DECISIONES: { id: string; texto: string; plataforma: Plataforma }[] = [
  { id: "de-yt", texto: "Decide qué video te recomienda a continuación.", plataforma: "youtube" },
  { id: "de-ig", texto: "Decide qué publicaciones aparecen primero en tu feed.", plataforma: "instagram" },
  { id: "de-tk", texto: "Analiza cuánto tiempo pasas en cada video y aprende tus preferencias con rapidez asombrosa.", plataforma: "tiktok" },
  { id: "de-go", texto: "Decide en qué orden aparecen los resultados de búsqueda.", plataforma: "google" },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 2 — Causa y efecto (empareja cada idea de la lectura A1 con lo que
 * provoca o significa). Texto verbatim de A1 / A2.
 * ───────────────────────────────────────────────────────────────────────── */
export const PARES_CAUSA: { id: string; concepto: string; efecto: string; ejemplo: string }[] = [
  {
    id: "ca-objetivo",
    concepto: "Maximizar el tiempo que pasas en la plataforma",
    efecto: "Es el objetivo principal con el que se diseñan los algoritmos de redes sociales.",
    ejemplo: "Para mostrarte más anuncios.",
  },
  {
    id: "ca-emocion",
    concepto: "Contenido que genera reacciones emocionales fuertes",
    efecto: "Es lo que los algoritmos tienden a promover, porque genera más interacciones y tiempo en la plataforma.",
    ejemplo: "Indignación, miedo, sorpresa.",
  },
  {
    id: "ca-amplifica",
    concepto: "Amplificar la desinformación y la polarización",
    efecto: "Es lo que puede ocurrir al promover ese tipo de contenido emocional.",
    ejemplo: "Estudios han mostrado esta tendencia en las redes sociales.",
  },
  {
    id: "ca-burbuja",
    concepto: "Burbuja de filtro",
    efecto: "Es el fenómeno donde el algoritmo te muestra solo contenido que confirma tus ideas previas.",
    ejemplo: "Reduce tu exposición a ideas diversas.",
  },
  {
    id: "ca-consciente",
    concepto: "Buscar información de fuentes diversas",
    efecto: "Es lo que te ayuda a ser un usuario más consciente y evitar la burbuja de filtro.",
    ejemplo: "No dejar que el algoritmo decida solo tu visión del mundo.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 3 — ¿Cómo decide el algoritmo? (ordena los pasos con que un algoritmo
 * de recomendación arma tu feed a partir de tus datos — síntesis del proceso
 * descrito en la lectura A1).
 * ───────────────────────────────────────────────────────────────────────── */
export const PASOS_FEED: { id: string; orden: number; texto: string; detalle: string }[] = [
  {
    id: "pa-1",
    orden: 1,
    texto: "Mides lo que el usuario hace",
    detalle: "El algoritmo analiza cuánto tiempo pasas en cada video y qué contenido te detiene.",
  },
  {
    id: "pa-2",
    orden: 2,
    texto: "Aprende sus preferencias",
    detalle: "Con esos datos aprende tus preferencias con rapidez asombrosa.",
  },
  {
    id: "pa-3",
    orden: 3,
    texto: "Persigue su objetivo",
    detalle: "Selecciona contenido para maximizar el tiempo que pasas en la plataforma.",
  },
  {
    id: "pa-4",
    orden: 4,
    texto: "Prioriza lo más emocional",
    detalle: "Promueve contenido que genera reacciones emocionales fuertes porque genera más interacciones.",
  },
  {
    id: "pa-5",
    orden: 5,
    texto: "Arma tu feed",
    detalle: "Decide qué ves y en qué orden, encerrándote en una burbuja de filtro.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * Glosario (A5, único término EN TEMA: «Algoritmo», verbatim).
 * ───────────────────────────────────────────────────────────────────────── */
export const GLOSARIO = {
  termino: "Algoritmo",
  definicion: "Secuencia ordenada y finita de pasos para resolver un problema o realizar una tarea.",
  ejemplo: "Una receta de cocina o los pasos para sacar dinero de un cajero.",
};

/* ─────────────────────────────────────────────────────────────────────────
 * Cuestionario de comprensión — A2 (quiz de opción múltiple, verbatim).
 * Se incluyen las 5 preguntas en tema; opciones y respuesta correcta literales.
 * ───────────────────────────────────────────────────────────────────────── */
export const QUIZ: {
  pregunta: string;
  opciones: string[];
  correcta: number;
  retro: string;
}[] = [
  {
    pregunta: "¿Qué es un algoritmo?",
    opciones: [
      "Un virus informático",
      "Un conjunto de instrucciones ordenadas para resolver un problema",
      "Una red social",
      "Un tipo de contraseña segura",
    ],
    correcta: 1,
    retro: "Un algoritmo es una secuencia ordenada de instrucciones para completar una tarea o resolver un problema.",
  },
  {
    pregunta: "¿Con qué objetivo principal están diseñados los algoritmos de redes sociales?",
    opciones: [
      "Mostrarte la información más verídica",
      "Conectarte con tus amigos más cercanos",
      "Maximizar el tiempo que pasas en la plataforma",
      "Educarte sobre temas importantes",
    ],
    correcta: 2,
    retro: "Los algoritmos de redes sociales están optimizados para que pases más tiempo en la plataforma y ver más anuncios.",
  },
  {
    pregunta: "¿Por qué los algoritmos tienden a promover contenido que genera emociones fuertes?",
    opciones: [
      "Porque ese contenido es el más verídico",
      "Porque genera más interacciones y tiempo en la plataforma",
      "Porque es lo que los usuarios piden explícitamente",
      "Porque ayuda a la salud mental",
    ],
    correcta: 1,
    retro: "El contenido que genera reacciones emocionales fuertes produce más comentarios, likes y shares, lo que aumenta el tiempo en la app.",
  },
  {
    pregunta: "¿Cuál de estas acciones te ayuda a ser más consciente del algoritmo?",
    opciones: [
      "Ver todo lo que el algoritmo recomienda sin cuestionarlo",
      "Buscar activamente información de fuentes diversas fuera del feed",
      "Seguir solo cuentas similares a las que ya sigues",
      "Desactivar las notificaciones de amigos",
    ],
    correcta: 1,
    retro: "Buscar fuentes diversas activamente evita que el algoritmo cree una «burbuja de filtro» que limita tu perspectiva.",
  },
  {
    pregunta: "¿Qué es una «burbuja de filtro»?",
    opciones: [
      "Un sistema de protección de datos personales",
      "El fenómeno donde el algoritmo te muestra solo contenido que confirma tus ideas previas",
      "Una lista de contactos bloqueados",
      "Una función de privacidad en redes sociales",
    ],
    correcta: 1,
    retro: "La burbuja de filtro es cuando los algoritmos te encierran en contenido que confirma tus creencias, reduciendo tu exposición a ideas diversas.",
  },
];

/** Dato verbatim de la lectura A1 (callout «importante», ENDUTIH/INEGI 2023). */
export const DATO_ALGORITMOS =
  "Según la ENDUTIH (INEGI, 2023), el 78.6% de los mexicanos de 6 años y más usa internet. La brecha digital entre zonas urbanas (86.7%) y rurales (50.8%) muestra que la Cultura Digital no puede pensarse sin abordar desigualdades estructurales de acceso.";

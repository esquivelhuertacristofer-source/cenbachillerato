/**
 * Datos del Laboratorio — Detección de fake news y verificación de información
 * (CD-II-P03, Cultura Digital II).
 *
 * Contenido VERBATIM de CD-II·P03 ("Fake news y desinformación: cómo verificar
 * antes de compartir"). La progresión abarca dos facetas complementarias:
 *  · la detección y verificación de noticias falsas (A1 lectura, A2 quiz), y
 *  · los métodos de investigación digital y las licencias (A4 quiz, A5 glosario).
 * El laboratorio integra ambas de forma fiel:
 *  - Modo 1 (señales) y Modo 2 (técnicas) provienen de la lectura A1: las
 *    descripciones de las técnicas de verificación se transcriben literalmente.
 *  - Modo 3 (glosario) usa los cinco términos verbatim del glosario A5.
 *  - El cuestionario usa las seis afirmaciones V/F verbatim de A2.
 * Las tarjetas a clasificar del Modo 1 son glosas fieles de las señales y buenas
 * prácticas que la lectura A1 describe explícitamente (no se inventan noticias).
 */

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 1 — ¿Señal de alerta o práctica confiable? (clasifica cada indicio)
 * ───────────────────────────────────────────────────────────────────────── */
export type Categoria = "alerta" | "fiable";

export const CATEGORIA_INFO: Record<
  Categoria,
  { titulo: string; subtitulo: string; icono: string }
> = {
  alerta: {
    titulo: "Señal de alerta",
    subtitulo: "Indicios de que la información podría ser falsa o engañosa: conviene verificar antes de creer o compartir.",
    icono: "fa-triangle-exclamation",
  },
  fiable: {
    titulo: "Práctica de verificación",
    subtitulo: "Acciones e indicios que aumentan la confianza en una información porque la someten a comprobación.",
    icono: "fa-shield-halved",
  },
};

export const SENALES: { id: string; texto: string; categoria: Categoria }[] = [
  { id: "se-a1", texto: "Un titular impactante y sensacionalista que no aparece en ningún medio serio", categoria: "alerta" },
  { id: "se-a2", texto: "Una fotografía que, al hacer búsqueda inversa, fue usada antes en otro contexto", categoria: "alerta" },
  { id: "se-a3", texto: "Una nota que no cita ninguna fuente verificable ni comunicado oficial", categoria: "alerta" },
  { id: "se-a4", texto: "Un contenido difundido masivamente que nadie se ha detenido a verificar", categoria: "alerta" },
  { id: "se-a5", texto: "Un artículo creado solo para generar clics y publicidad", categoria: "alerta" },
  { id: "se-f1", texto: "Una corrección publicada por fact-checkers como Verificado o AFP Factual", categoria: "fiable" },
  { id: "se-f2", texto: "Una nota que cita una fuente verificable y un comunicado oficial", categoria: "fiable" },
  { id: "se-f3", texto: "Hacer búsqueda inversa de una imagen antes de compartirla", categoria: "fiable" },
  { id: "se-f4", texto: "Contrastar la noticia con varios medios serios antes de difundirla", categoria: "fiable" },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 2 — Las técnicas de verificación (empareja técnica → qué hace)
 * Descripciones verbatim de la lectura A1.
 * ───────────────────────────────────────────────────────────────────────── */
export const TECNICAS: { id: string; tecnica: string; funcion: string; ejemplo: string }[] = [
  {
    id: "te-fact",
    tecnica: "Fact-checking",
    funcion: "Organizaciones especializadas (Verificado, Animal Político, AFP Factual) revisan y publican correcciones de noticias falsas.",
    ejemplo: "Buscas la nota dudosa en un sitio de verificación para ver si ya fue desmentida.",
  },
  {
    id: "te-inversa",
    tecnica: "Búsqueda inversa de imágenes",
    funcion: "En Google Imágenes o TinEye puedes verificar si una fotografía fue usada en otro contexto.",
    ejemplo: "Subes la foto al buscador y descubres que es de hace años y de otro país.",
  },
  {
    id: "te-fuente",
    tecnica: "Buscar la fuente original",
    funcion: "¿Hay un comunicado oficial? ¿La nota cita una fuente verificable?",
    ejemplo: "Rastreas de dónde salió la información hasta llegar a quien la publicó primero.",
  },
  {
    id: "te-titular",
    tecnica: "Desconfiar de los titulares sensacionalistas",
    funcion: "Si el titular es impactante y no aparece en ningún medio serio, probablemente es falso.",
    ejemplo: "Un encabezado alarmante que solo circula en cadenas y no en la prensa formal.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 3 — Empareja término y definición (glosario A5, verbatim)
 * ───────────────────────────────────────────────────────────────────────── */
export const PARES: { id: string; termino: string; definicion: string; ejemplo: string }[] = [
  {
    id: "gl-ciber",
    termino: "Ciberetnografía",
    definicion: "Método que estudia culturas, prácticas y comunidades de las personas en entornos digitales.",
    ejemplo: "Observar cómo interactúa un grupo en un foro en línea.",
  },
  {
    id: "gl-contenido",
    termino: "Análisis de contenido en línea",
    definicion: "Técnica para examinar de forma sistemática textos, imágenes o videos digitales.",
    ejemplo: "Analizar publicaciones sobre un tema en redes.",
  },
  {
    id: "gl-focal",
    termino: "Grupo focal",
    definicion: "Reunión de un grupo pequeño para conversar y recoger opiniones sobre un tema.",
    ejemplo: "Pedir a varios compañeros que opinen sobre una app educativa.",
  },
  {
    id: "gl-entrevista",
    termino: "Entrevista",
    definicion: "Conversación dirigida con preguntas para obtener información de una persona.",
    ejemplo: "Entrevistar a un docente sobre el uso de tecnología.",
  },
  {
    id: "gl-licencia",
    termino: "Licencia permisiva",
    definicion: "Licencia que autoriza usar, compartir y a veces modificar una obra o programa.",
    ejemplo: "LibreOffice y otras herramientas de software libre.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * Cuestionario de comprensión (V/F de A2, verbatim).
 * Renderizado como opción doble Verdadero / Falso.
 * ───────────────────────────────────────────────────────────────────────── */
export const QUIZ: {
  pregunta: string;
  opciones: [string, string];
  correcta: 0 | 1;
  retro: string;
}[] = [
  {
    pregunta: "Las fake news son un fenómeno exclusivo de internet y las redes sociales.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "Las noticias falsas existen desde antes de internet; las redes sociales solo las amplifican más rápido.",
  },
  {
    pregunta: "Una forma de verificar si una imagen fue manipulada o usada fuera de contexto es la búsqueda inversa.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto. La búsqueda inversa de imágenes permite ver dónde y cómo se ha usado una foto antes.",
  },
  {
    pregunta: "Si una noticia aparece en muchos sitios web, necesariamente es verdadera.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "Las noticias falsas también se comparten masivamente. La cantidad de sitios no garantiza la veracidad.",
  },
  {
    pregunta: "Organizaciones de fact-checking como Verificado o AFP Factual verifican y publican correcciones de noticias.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto. Los fact-checkers son una herramienta valiosa para contrastar información.",
  },
  {
    pregunta: "Compartir una noticia falsa sin saber que lo era no tiene consecuencias éticas.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "Compartir sin verificar contribuye a la difusión de desinformación, incluso si no fue intencional.",
  },
  {
    pregunta: "Un titular sensacionalista es siempre señal de que la noticia es falsa.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "No siempre, pero sí es una señal de alerta que debe motivar verificación antes de compartir.",
  },
];

/** Dato verbatim de la lectura A1. */
export const DATO_FAKE =
  "El problema no es solo la malicia del creador, sino también la velocidad con que los usuarios las comparten sin verificar.";

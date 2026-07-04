/**
 * Datos del Laboratorio — Comunicación digital multimodal: texto, imagen, audio
 * y video; identidad digital y algoritmos (CD-III-P01, Cultura Digital III).
 *
 * Contenido VERBATIM de CD-III·P01 ("Comunicación digital multimodal: texto,
 * imagen, audio y video en la era digital"). El laboratorio integra las tres
 * facetas de la progresión:
 *  - Modo 1 (modalidad) clasifica elementos por su MODO SEMIÓTICO (texto,
 *    imagen, audio, video). Los modos semióticos y sus ejemplos provienen de la
 *    lectura A1, del quiz A2 y del glosario A5 (definición de «Modo semiótico»
 *    y de «Comunicación multimodal»), que enumeran literalmente esos modos.
 *  - Modo 2 (conceptos de identidad digital y algoritmos) empareja cada
 *    concepto con su definición verbatim del glosario A5 / quiz A2.
 *  - Modo 3 (glosario) usa los seis términos verbatim del glosario A5.
 *  - El cuestionario usa las cinco afirmaciones V/F verbatim de A4.
 * Las tarjetas a clasificar del Modo 1 son ejemplos que las propias actividades
 * nombran (un meme = imagen + texto; música y narración de un video = audio;
 * etc.); no se inventa contenido ajeno a la progresión.
 */

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 1 — ¿Texto, imagen, audio o video? (clasifica por modo semiótico)
 * ───────────────────────────────────────────────────────────────────────── */
export type Modalidad = "texto" | "imagen" | "audio" | "video";

export const MODALIDAD_INFO: Record<
  Modalidad,
  { titulo: string; subtitulo: string; icono: string }
> = {
  texto: {
    titulo: "Texto",
    subtitulo: "El modo escrito: palabras, titulares, etiquetas y texto superpuesto que aportan capas de significado verbal.",
    icono: "fa-font",
  },
  imagen: {
    titulo: "Imagen",
    subtitulo: "El modo visual fijo: fotografías, íconos, infografías y gráficos que comunican mediante la mirada.",
    icono: "fa-image",
  },
  audio: {
    titulo: "Audio",
    subtitulo: "El modo sonoro: música, narración verbal, mensajes de voz y efectos que se perciben al escuchar.",
    icono: "fa-volume-high",
  },
  video: {
    titulo: "Video",
    subtitulo: "El modo de imagen en movimiento: imagen animada que suele integrar a la vez audio, texto y efectos.",
    icono: "fa-clapperboard",
  },
};

export const ELEMENTOS: { id: string; texto: string; modalidad: Modalidad }[] = [
  { id: "el-t1", texto: "El texto superpuesto que aparece sobre un video de TikTok", modalidad: "texto" },
  { id: "el-t2", texto: "Las etiquetas y estadísticas escritas de una infografía", modalidad: "texto" },
  { id: "el-i1", texto: "Una fotografía editada que se difunde sobre un grupo social", modalidad: "imagen" },
  { id: "el-i2", texto: "Los íconos y colores de una infografía", modalidad: "imagen" },
  { id: "el-a1", texto: "La música de fondo de un video de TikTok", modalidad: "audio" },
  { id: "el-a2", texto: "Un mensaje de voz de WhatsApp reenviado sin verificar", modalidad: "audio" },
  { id: "el-v1", texto: "Un Reel de Instagram con imagen en movimiento", modalidad: "video" },
  { id: "el-v2", texto: "Un deepfake: imagen en movimiento manipulada con IA", modalidad: "video" },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 2 — Conceptos de identidad digital y algoritmos (empareja → definición)
 * Definiciones verbatim del glosario A5 y del quiz A2.
 * ───────────────────────────────────────────────────────────────────────── */
export const CONCEPTOS: { id: string; concepto: string; definicion: string; ejemplo: string }[] = [
  {
    id: "co-identidad",
    concepto: "Identidad digital",
    definicion: "Conjunto de rasgos, representaciones y datos que caracterizan a una persona en entornos digitales. Se construye a partir de publicaciones propias, datos recopilados por plataformas, interacciones y la narrativa que los algoritmos elaboran sobre el usuario.",
    ejemplo: "El perfil de Instagram refleja la identidad gestionada, pero los datos de comportamiento forman una identidad calculada que las plataformas explotan comercialmente.",
  },
  {
    id: "co-burbuja",
    concepto: "Burbuja de filtro",
    definicion: "Fenómeno por el cual los algoritmos personalizan el contenido que recibe un usuario basándose en sus interacciones previas, limitando su exposición a perspectivas diversas y reforzando sus creencias existentes.",
    ejemplo: "Si una persona solo interactúa con contenido de un partido político, el algoritmo le mostrará cada vez más contenido de ese espectro.",
  },
  {
    id: "co-deepfake",
    concepto: "Deepfake",
    definicion: "Contenido de video o audio manipulado con inteligencia artificial que hace parecer que una persona dijo o hizo algo que nunca ocurrió.",
    ejemplo: "En México se han usado para difundir falsas declaraciones de políticos y figuras públicas, y son cada vez más difíciles de detectar.",
  },
  {
    id: "co-algoritmo",
    concepto: "Algoritmo de recomendación",
    definicion: "Sistema diseñado para maximizar el tiempo que los usuarios pasan en la plataforma, mostrando contenido que genera reacciones emocionales fuertes y refuerza las creencias previas del usuario.",
    ejemplo: "Aprenden qué contenido genera más interacción (likes, comentarios, tiempo de visualización) y muestran más de ese contenido.",
  },
  {
    id: "co-analisis",
    concepto: "Análisis crítico de medios digitales",
    definicion: "Práctica de examinar mensajes digitales preguntando: ¿quién lo produce?, ¿con qué intención?, ¿qué voces incluye y cuáles excluye?, ¿qué valores implica?, ¿qué efectos puede tener? Es una competencia de ciudadanía digital.",
    ejemplo: "Ante un video viral, verificar la fuente, buscar el contexto original e identificar qué información omite.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 3 — Empareja término y definición (glosario A5, verbatim)
 * ───────────────────────────────────────────────────────────────────────── */
export const PARES: { id: string; termino: string; definicion: string; ejemplo: string }[] = [
  {
    id: "gl-multimodal",
    termino: "Comunicación multimodal",
    definicion: "Forma de comunicar que combina de manera simultánea e integrada diferentes modos semióticos: texto escrito, imagen, audio, video, color, gesto y diseño espacial. El significado emerge de la interacción entre todos los modos.",
    ejemplo: "Un video de TikTok que combina música, texto superpuesto, efectos visuales y gestos del creador es un mensaje multimodal donde cada elemento aporta capas de significado.",
  },
  {
    id: "gl-modo",
    termino: "Modo semiótico",
    definicion: "Sistema de recursos culturales y sociales para crear significado. Los modos digitales incluyen: texto, imagen estática, imagen en movimiento, audio, color, tipografía y diseño de interfaz.",
    ejemplo: "En una infografía, el modo visual (íconos y colores) y el modo textual (etiquetas y estadísticas) trabajan juntos para comunicar datos de forma accesible.",
  },
  {
    id: "gl-identidad",
    termino: "Identidad digital",
    definicion: "Conjunto de rasgos, representaciones y datos que caracterizan a una persona en entornos digitales. Se construye a partir de publicaciones propias, datos recopilados por plataformas, interacciones y la narrativa que los algoritmos elaboran sobre el usuario.",
    ejemplo: "El perfil de Instagram de una persona refleja su identidad gestionada, pero los datos de comportamiento forman una identidad calculada que las plataformas explotan comercialmente.",
  },
  {
    id: "gl-burbuja",
    termino: "Burbuja de filtro (filter bubble)",
    definicion: "Fenómeno por el cual los algoritmos personalizan el contenido que recibe un usuario basándose en sus interacciones previas, limitando su exposición a perspectivas diversas y reforzando sus creencias existentes.",
    ejemplo: "Si una persona solo interactúa con contenido de un partido político, el algoritmo le mostrará cada vez más contenido de ese espectro, reduciendo su exposición a otras posturas.",
  },
  {
    id: "gl-narrativa",
    termino: "Narrativa digital y construcción de realidad",
    definicion: "Las narrativas que circulan en entornos digitales configuran percepciones colectivas sobre grupos sociales, eventos y valores. A través de la repetición y viralización, ciertos relatos se naturalizan como 'realidad'.",
    ejemplo: "La difusión masiva de imágenes editadas o noticias falsas sobre migrantes puede construir una percepción social negativa que influye en políticas públicas y actitudes cotidianas.",
  },
  {
    id: "gl-analisis",
    termino: "Análisis crítico de medios digitales",
    definicion: "Práctica de examinar mensajes digitales preguntando: ¿quién lo produce?, ¿con qué intención?, ¿qué voces incluye y cuáles excluye?, ¿qué valores implica?, ¿qué efectos puede tener? Es una competencia de ciudadanía digital.",
    ejemplo: "Ante un video viral, el análisis crítico implica verificar la fuente, buscar el contexto original, identificar el encuadre elegido y preguntarse qué información omite.",
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
    pregunta: "La comunicación multimodal integra simultáneamente distintos modos semióticos (texto, imagen, audio, video, gesto) para construir significado.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto. La multimodalidad reconoce que el significado se construye combinando múltiples modos de representación, no solo el texto escrito.",
  },
  {
    pregunta: "Los algoritmos de las redes sociales distribuyen los contenidos de manera completamente neutral, sin favorecer ningún tipo de mensaje o perfil de usuario.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "Falso. Los algoritmos priorizan contenidos según criterios de engagement, tiempo de visualización y datos del usuario, lo que genera burbujas de filtro y puede amplificar ciertos mensajes mientras silencia otros.",
  },
  {
    pregunta: "La identidad digital de una persona está determinada exclusivamente por lo que ella misma publica en redes sociales.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "Falso. La identidad digital se construye también por los datos recopilados por plataformas, los perfiles que crean los algoritmos, las etiquetas de terceros y la huella digital acumulada.",
  },
  {
    pregunta: "Un meme puede ser analizado como un texto multimodal porque combina imagen fija y texto escrito para producir un significado que ninguno de los dos elementos transmitiría por separado.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto. El meme es un formato multimodal donde la imagen y el texto se complementan e interactúan para crear un mensaje específico, a menudo con intención irónica o humorística.",
  },
  {
    pregunta: "La realidad social construida en entornos digitales no tiene efectos en la vida offline de las personas.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "Falso. Las narrativas digitales influyen en percepciones, actitudes, relaciones y decisiones que se manifiestan en la vida cotidiana fuera de la pantalla, como demuestran fenómenos como el cyberbullying o los movimientos sociales en línea.",
  },
];

/** Dato verbatim de la lectura A1 (sobre la velocidad de la desinformación). */
export const DATO_MULTIMODAL =
  "Los deepfakes —videos o audios manipulados con inteligencia artificial— se han vuelto cada vez más accesibles y difíciles de detectar; en México la desinformación se viraliza por WhatsApp en mensajes reenviados sin verificación.";

/**
 * Datos del Laboratorio — Creatividad y ética en la producción digital
 * (CD-II-P05, Ciudadanía Digital II / Cultura Digital II).
 *
 * Contenido VERBATIM de CD-II·P05 ("Creatividad y ética en la producción
 * digital"). Las prácticas a clasificar provienen de los principios éticos y
 * casos enunciados en la lectura A1; las definiciones del glosario son verbatim
 * de A5; las afirmaciones del cuestionario combinan los reactivos V/F de A4 con
 * casos de A2 reescritos a opción doble. Para NO solapar con el laboratorio de
 * «Licencias digitales» (CD-I-P02), aquí el marco es la ÉTICA DE LA CREACIÓN
 * (autoría, plagio, atribución, veracidad, privacidad, IA y deepfakes), no la
 * taxonomía de licencias Creative Commons.
 */

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 1 — ¿Ética o falta de ética? (clasifica prácticas de producción digital)
 * Casos derivados de los cuatro principios de A1 (veracidad, privacidad, no
 * discriminación, transparencia) y de los casos de A2 (plagio, derechos de autor).
 * ───────────────────────────────────────────────────────────────────────── */
export type Juicio = "etica" | "noetica";

export const JUICIO_INFO: Record<
  Juicio,
  { titulo: string; subtitulo: string; icono: string }
> = {
  etica: {
    titulo: "Práctica responsable",
    subtitulo: "Respeta la veracidad, la privacidad, la no discriminación y la transparencia, y reconoce la autoría ajena.",
    icono: "fa-circle-check",
  },
  noetica: {
    titulo: "Práctica cuestionable",
    subtitulo: "Vulnera la privacidad, omite la autoría, desinforma, discrimina o usa contenido protegido sin permiso.",
    icono: "fa-triangle-exclamation",
  },
};

export const PRACTICAS: { id: string; texto: string; juicio: Juicio }[] = [
  {
    id: "pr-cita",
    texto: "Citar la fuente de cada imagen, texto o video que usas en tus producciones.",
    juicio: "etica",
  },
  {
    id: "pr-verificar",
    texto: "Verificar que la información sea verdadera antes de compartirla.",
    juicio: "etica",
  },
  {
    id: "pr-consentimiento",
    texto: "Pedir consentimiento antes de publicar imágenes o datos de otra persona.",
    juicio: "etica",
  },
  {
    id: "pr-transparencia",
    texto: "Declarar quién eres, qué intereses tienes y de dónde proviene la información.",
    juicio: "etica",
  },
  {
    id: "pr-cclibre",
    texto: "Usar imágenes con licencia libre de Unsplash, Pixabay o Wikimedia Commons.",
    juicio: "etica",
  },
  {
    id: "pr-googleimg",
    texto: "Usar una imagen de Google Images en tu presentación escolar sin citar la fuente.",
    juicio: "noetica",
  },
  {
    id: "pr-musica",
    texto: "Producir un video con música protegida sin permiso del artista.",
    juicio: "noetica",
  },
  {
    id: "pr-deepfake",
    texto: "Manipular un video con IA para hacer parecer que alguien dijo algo que nunca dijo.",
    juicio: "noetica",
  },
  {
    id: "pr-intimo",
    texto: "Difundir contenido sexual íntimo de una persona sin su consentimiento.",
    juicio: "noetica",
  },
  {
    id: "pr-discriminar",
    texto: "Publicar contenido que estereotipe o denigre a un grupo por su género o etnia.",
    juicio: "noetica",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 2 — Empareja concepto y definición (ética de la creación, verbatim A1)
 * Los conceptos son los cuatro principios éticos y las nociones clave de la
 * lectura A1, redactados con su descripción verbatim.
 * ───────────────────────────────────────────────────────────────────────── */
export const CONCEPTOS: { id: string; concepto: string; definicion: string; ejemplo: string }[] = [
  {
    id: "co-veracidad",
    concepto: "Veracidad",
    definicion: "La información que compartimos es verificada y verdadera, o que si es opinión, se presenta claramente como tal.",
    ejemplo: "Comprobar un dato en su fuente original antes de publicarlo.",
  },
  {
    id: "co-privacidad",
    concepto: "Respeto a la privacidad",
    definicion: "No publicar datos personales, imágenes o información de otras personas sin su consentimiento.",
    ejemplo: "Pedir permiso antes de subir una foto en la que aparecen tus compañeros.",
  },
  {
    id: "co-nodiscrim",
    concepto: "No discriminación",
    definicion: "El contenido no ataca, estereotipa o denigra a personas o grupos por su género, etnia, orientación sexual, discapacidad o cualquier otra condición.",
    ejemplo: "Evitar bromas que ridiculicen a un grupo por su forma de hablar.",
  },
  {
    id: "co-transparencia",
    concepto: "Transparencia",
    definicion: "Declarar quiénes somos, qué intereses tenemos y de dónde proviene la información que presentamos.",
    ejemplo: "Aclarar que un video patrocinado fue pagado por una marca.",
  },
  {
    id: "co-plagio",
    concepto: "Plagio",
    definicion: "Usar el trabajo de otra persona sin reconocer su autoría; no citar la fuente de una imagen es plagio, aunque sea para un trabajo escolar.",
    ejemplo: "Copiar un texto de internet en tu tarea y presentarlo como propio.",
  },
  {
    id: "co-deepfake",
    concepto: "Deepfake",
    definicion: "Video o audio manipulado con inteligencia artificial para hacer parecer que una persona dijo o hizo algo que nunca ocurrió.",
    ejemplo: "Un clip falso de un político con parpadeos irregulares e iluminación inconsistente.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 3 — Empareja término y definición (glosario A5, verbatim)
 * ───────────────────────────────────────────────────────────────────────── */
export const PARES: { id: string; termino: string; definicion: string; ejemplo: string }[] = [
  {
    id: "gl-paginaweb",
    termino: "Página web",
    definicion: "Documento en internet que combina texto, imágenes y enlaces para compartir información.",
    ejemplo: "El blog donde publicas tu proyecto.",
  },
  {
    id: "gl-wordpress",
    termino: "WordPress",
    definicion: "Plataforma para crear sitios web y blogs con plantillas, sin necesidad de programar.",
    ejemplo: "Publicar un sitio sobre cuidado del agua.",
  },
  {
    id: "gl-blogspot",
    termino: "Blogspot (Blogger)",
    definicion: "Servicio gratuito de Google para crear y publicar blogs de forma sencilla.",
    ejemplo: "Un blog de tu equipo sobre un tema social.",
  },
  {
    id: "gl-difusion",
    termino: "Difusión",
    definicion: "Acción de dar a conocer información a un público amplio.",
    ejemplo: "Compartir tu investigación en una página web.",
  },
  {
    id: "gl-perspectiva",
    termino: "Perspectiva ética y crítica",
    definicion: "Forma de publicar que verifica la información, cita fuentes y respeta a las personas.",
    ejemplo: "Comprobar los datos y dar crédito a los autores antes de difundir.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * Cuestionario de comprensión.
 * Reactivos V/F de A4 (verbatim) + dos casos de A2 reescritos a opción doble.
 * Renderizado como opción doble.
 * ───────────────────────────────────────────────────────────────────────── */
export const QUIZ: {
  pregunta: string;
  opciones: [string, string];
  correcta: 0 | 1;
  retro: string;
}[] = [
  {
    pregunta: "WordPress y Blogspot permiten crear páginas web de diseño simple sin saber programar.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: ofrecen plantillas para publicar fácilmente.",
  },
  {
    pregunta: "Al publicar en internet no importa citar las fuentes ni respetar los derechos de autor.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "Sí importa: hay que difundir con perspectiva ética y crítica, citando y respetando autorías.",
  },
  {
    pregunta: "Una perspectiva ética y crítica implica verificar la información antes de difundirla.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "Correcto: difundir con responsabilidad evita la desinformación.",
  },
  {
    pregunta: "Si usas una imagen de Google Images en tu presentación escolar sin citar la fuente, estás cometiendo plagio.",
    opciones: ["Verdadero", "Falso"],
    correcta: 0,
    retro: "No citar la fuente de una imagen es plagio, aunque sea para un trabajo escolar.",
  },
  {
    pregunta: "Producir un video con música de fondo sin permiso del artista es legal mientras no lo monetices.",
    opciones: ["Verdadero", "Falso"],
    correcta: 1,
    retro: "Usar música protegida sin permiso viola derechos de autor, incluso en videos educativos no comerciales.",
  },
];

/** Dato verbatim del callout «importante» de la lectura A1 (Ley Olimpia). */
export const DATO_EPD =
  "La Ley Olimpia protege específicamente a las personas de la violencia digital de género, pero la responsabilidad ética va más allá de lo que la ley prohíbe. Antes de compartir cualquier contenido que involucre a otras personas, pregúntate: ¿lo compartiría si ellas pudieran verlo?";

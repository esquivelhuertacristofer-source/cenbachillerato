/**
 * Datos del Laboratorio — Estrategias para buscar información confiable en internet
 * (CD-II-P01, Cultura Digital II).
 *
 * Contenido VERBATIM de CD-II·P01. Se toma de las actividades ON-TOPIC:
 *  - A1 (lectura, «Estrategias para buscar información confiable en internet»):
 *    las cinco estrategias para evaluar la confiabilidad de una fuente, el
 *    lateral reading, el callout de UNESCO y las preguntas de comprensión.
 *  - A2 (quiz_multiple_opcion, «¿Qué tan confiable es esta fuente?»): cinco
 *    preguntas verbatim de opción múltiple usadas como cuestionario.
 *
 * NOTA DE FIDELIDAD: las actividades A4 (quiz V/F) y A5 (glosario) de CD-II-P01
 * tratan de «trabajo colaborativo digital y herramientas libres» (Cryptpad,
 * Riseup pad, transversalidad), tema DISTINTO al de esta práctica. Por eso NO se
 * usan: el glosario y el cuestionario se construyen únicamente con A1 y A2 (ambas
 * publicadas y on-topic). El glosario reúne términos definidos literalmente en
 * A1/A2 (lateral reading, búsqueda inversa de imágenes, fact-checking, dominio
 * institucional, autoría verificable).
 */

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 1 — ¿Estrategia confiable o señal de alerta? (clasifica)
 * Las cinco estrategias provienen de A1; las señales de alerta provienen del
 * texto de A1 («lenguaje alarmista o extremo», «titulares sensacionalistas»,
 * «blogs personales sin verificación») y del quiz A2.
 * ───────────────────────────────────────────────────────────────────────── */
export type Categoria = "confiable" | "alerta";

export const CATEGORIA_INFO: Record<
  Categoria,
  { titulo: string; subtitulo: string; icono: string }
> = {
  confiable: {
    titulo: "Estrategia de búsqueda confiable",
    subtitulo: "Práctica que ayuda a evaluar la confiabilidad de una fuente antes de aceptar o compartir la información.",
    icono: "fa-shield-halved",
  },
  alerta: {
    titulo: "Señal de alerta",
    subtitulo: "Indicio de baja calidad, sesgo o desinformación que invita a desconfiar y verificar.",
    icono: "fa-triangle-exclamation",
  },
};

export const SENALES: { id: string; texto: string; categoria: Categoria }[] = [
  { id: "se-c1", texto: "Verificar el dominio y la autoría: quién publicó el contenido y si hay un autor con credenciales verificables", categoria: "confiable" },
  { id: "se-c2", texto: "Revisar la fecha para saber si la información es actual o puede estar desactualizada", categoria: "confiable" },
  { id: "se-c3", texto: "Buscar las citas y referencias que el texto usa y poder verificarlas", categoria: "confiable" },
  { id: "se-c4", texto: "Hacer lateral reading: buscar qué dicen otras fuentes sobre el sitio antes de leerlo en profundidad", categoria: "confiable" },
  { id: "se-c5", texto: "Buscar en varios lugares y comparar fuentes antes de aceptar una información como verdadera", categoria: "confiable" },
  { id: "se-a1", texto: "El texto usa lenguaje alarmista o extremo", categoria: "alerta" },
  { id: "se-a2", texto: "Un titular sensacionalista del tipo «¡INCREÍBLE! El gobierno oculta que...»", categoria: "alerta" },
  { id: "se-a3", texto: "Un blog personal sin verificación ni autor identificado", categoria: "alerta" },
  { id: "se-a4", texto: "Contenido generado expresamente para desinformar", categoria: "alerta" },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 2 — Las cinco estrategias (empareja cada estrategia con su pregunta clave)
 * Estrategias y preguntas verbatim de A1.
 * ───────────────────────────────────────────────────────────────────────── */
export const CRITERIOS: { id: string; criterio: string; pregunta: string; ejemplo: string }[] = [
  {
    id: "cr-dominio",
    criterio: "Verifica el dominio y la autoría",
    pregunta: "¿Quién publicó el contenido? ¿Hay un autor identificado con credenciales verificables?",
    ejemplo: "Los dominios .edu (educativos) y .gob (gubernamentales) suelen indicar fuentes institucionales más confiables.",
  },
  {
    id: "cr-fecha",
    criterio: "Revisa la fecha",
    pregunta: "¿La información es actual o puede estar desactualizada?",
    ejemplo: "Una fuente desactualizada puede haber sido superada por información más reciente.",
  },
  {
    id: "cr-citas",
    criterio: "Busca citas y referencias",
    pregunta: "¿El texto cita otras fuentes que puedes verificar?",
    ejemplo: "Las citas de otras fuentes verificables son señal de una fuente confiable.",
  },
  {
    id: "cr-lateral",
    criterio: "Lateral reading",
    pregunta: "¿Qué dicen otras fuentes sobre el sitio que publica el texto, antes de leerlo en profundidad?",
    ejemplo: "Consiste en investigar la reputación del sitio antes de leer el contenido.",
  },
  {
    id: "cr-tono",
    criterio: "Evalúa el tono",
    pregunta: "¿El texto usa lenguaje alarmista o extremo?",
    ejemplo: "El lenguaje alarmista puede ser señal de baja calidad o sesgo.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 3 — Empareja término y definición (glosario)
 * Términos definidos verbatim en A1 (texto y preguntas de comprensión) y en A2
 * (enunciados y retroalimentación). No se usa A5 por ser de otro tema.
 * ───────────────────────────────────────────────────────────────────────── */
export const PARES: { id: string; termino: string; definicion: string; ejemplo: string }[] = [
  {
    id: "gl-lateral",
    termino: "Lateral reading",
    definicion: "Buscar qué dicen otras fuentes sobre el sitio que publica la información, antes de leerlo en profundidad; consiste en investigar la reputación del sitio antes de leer el contenido.",
    ejemplo: "Antes de leer un artículo, abrir otras pestañas para averiguar qué reputación tiene el medio que lo publica.",
  },
  {
    id: "gl-inversa",
    termino: "Búsqueda inversa de imágenes",
    definicion: "Método de buscar la misma imagen en Google para verificar su origen; permite comprobar si una foto fue usada en otro contexto diferente.",
    ejemplo: "Subir una foto «de última hora» al buscador y descubrir que en realidad es de hace años y de otro lugar.",
  },
  {
    id: "gl-factchecking",
    termino: "Fact-checking",
    definicion: "Técnica de verificación que comprueba la veracidad de una afirmación o noticia antes de aceptarla o compartirla.",
    ejemplo: "Verificar en fuentes confiables antes de compartir, especialmente si el titular es alarmista.",
  },
  {
    id: "gl-dominio",
    termino: "Dominio institucional",
    definicion: "Terminación de la dirección de un sitio (.edu educativos, .gob gubernamentales) que suele indicar fuentes institucionales más confiables.",
    ejemplo: "Un sitio terminado en .edu o .gob sugiere mayor confiabilidad académica que uno terminado en .com.",
  },
  {
    id: "gl-autoria",
    termino: "Autoría verificable",
    definicion: "Existencia de un autor identificado con credenciales verificables que respaldan el contenido; es una característica de una fuente confiable.",
    ejemplo: "Un artículo firmado por una especialista cuyos estudios y trayectoria se pueden comprobar.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * Cuestionario de comprensión (opción múltiple, verbatim de A2).
 * ───────────────────────────────────────────────────────────────────────── */
export const QUIZ: {
  pregunta: string;
  opciones: string[];
  correcta: number;
  retro: string;
}[] = [
  {
    pregunta: "¿Qué es el «lateral reading» como estrategia de verificación?",
    opciones: [
      "Leer el artículo de izquierda a derecha",
      "Buscar información sobre la fuente antes de leer el contenido",
      "Leer solo los encabezados del artículo",
      "Compartir el artículo en redes para recibir opiniones",
    ],
    correcta: 1,
    retro: "El lateral reading consiste en investigar la reputación del sitio antes de leer el contenido.",
  },
  {
    pregunta: "¿Cuál de estas características NO es señal de una fuente confiable?",
    opciones: [
      "Autor identificado con credenciales",
      "Citas de otras fuentes verificables",
      "Titulares sensacionalistas",
      "Fecha de publicación reciente",
    ],
    correcta: 2,
    retro: "Los titulares sensacionalistas son una señal de alarma, no de confiabilidad.",
  },
  {
    pregunta: "Si encuentras una noticia con un titular que dice «¡INCREÍBLE! El gobierno oculta que...», deberías:",
    opciones: [
      "Compartirla inmediatamente",
      "Ignorarla por completo sin leerla",
      "Verificar en fuentes confiables antes de compartir",
      "Creerla porque es muy específica",
    ],
    correcta: 2,
    retro: "Siempre verifica en fuentes confiables antes de compartir, especialmente si el titular es alarmista.",
  },
  {
    pregunta: "¿Qué dominio sugiere mayor confiabilidad académica?",
    opciones: [".com", ".edu o .gob", ".net", ".org siempre"],
    correcta: 1,
    retro: "Los dominios .edu (educativos) y .gob (gubernamentales) suelen indicar fuentes institucionales más confiables.",
  },
  {
    pregunta: "El método de buscar la misma imagen en Google para verificar su origen se llama:",
    opciones: [
      "Fact-checking",
      "Lateral reading",
      "Búsqueda inversa de imágenes",
      "SEO",
    ],
    correcta: 2,
    retro: "La búsqueda inversa de imágenes permite verificar si una foto fue usada en otro contexto diferente.",
  },
];

/** Dato verbatim del callout de A1 (marco de Competencias Digitales de la UNESCO). */
export const DATO_BUSQUEDA =
  "El marco de Competencias Digitales definido por la UNESCO organiza las habilidades digitales en cinco áreas: alfabetización en información y datos, comunicación y colaboración, creación de contenidos digitales, seguridad y resolución de problemas. México las integra en el currículo del NEM desde 2023.";

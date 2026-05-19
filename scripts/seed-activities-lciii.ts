/**
 * Seed de actividades pedagógicas para LC-III (Lengua y Comunicación III).
 * 7 progresiones × 3 actividades = 21 actividades. estado='publicada'.
 * Tipos: lectura, video_con_preguntas, infografia, fill_blanks,
 *        quiz_multiple_opcion, quiz_verdadero_falso, reflexion_escrita,
 *        autoevaluacion, glosario_interactivo (9 tipos)
 * Uso: npx tsx scripts/seed-activities-lciii.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🌱 Seed actividades LC-III — Lengua y Comunicación III\n");

  const progs = await getProgresionesDeUAC(sb, "LC-III");
  let ok = 0; let fail = 0;

  for (const p of progs) {
    const base = p.codigo;
    const n = p.numero;

    const a1ok = await upsertActividad(sb, {
      codigo: `${base}-A1`,
      titulo: titulos[n - 1].a1,
      descripcion: descsA1[n - 1],
      tipo: tiposA1[n - 1],
      progresion_id: p.id,
      xp: 10,
      estado: "publicada",
      contenido: contenidosA1[n - 1],
    });
    a1ok ? ok++ : fail++;

    const a2ok = await upsertActividad(sb, {
      codigo: `${base}-A2`,
      titulo: titulos[n - 1].a2,
      descripcion: descsA2[n - 1],
      tipo: tiposA2[n - 1],
      progresion_id: p.id,
      xp: 15,
      estado: "publicada",
      contenido: contenidosA2[n - 1],
    });
    a2ok ? ok++ : fail++;

    const a3ok = await upsertActividad(sb, {
      codigo: `${base}-A3`,
      titulo: titulos[n - 1].a3,
      descripcion: descsA3[n - 1],
      tipo: tiposA3[n - 1],
      progresion_id: p.id,
      xp: 20,
      estado: "publicada",
      contenido: contenidosA3[n - 1],
    });
    a3ok ? ok++ : fail++;
  }

  log(`\n✅ LC-III: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── TÍTULOS ──────────────────────────────────────────────────────────────────

const titulos = [
  { a1: "Leer críticamente: más allá de la comprensión literal", a2: "¿Qué tan bien comprendo lo que leo? Evaluación crítica", a3: "Mi postura frente al texto: reflexión crítica lectora" },
  { a1: "Movimientos literarios: del Barroco a las Vanguardias", a2: "Identifico movimientos literarios y sus características", a3: "El movimiento literario que más me interpela" },
  { a1: "Géneros literarios: formas de contar y decir", a2: "¿Verdadero o falso? Los géneros literarios y sus fronteras", a3: "Leo desde múltiples perspectivas: análisis de un texto literario" },
  { a1: "Subgéneros narrativos: del suspenso al Antropoceno", a2: "Completa el universo de los subgéneros narrativos", a3: "¿Qué tan bien identifico y valoro los subgéneros narrativos?" },
  { a1: "El género lírico: figuras retóricas y musicalidad del verso", a2: "Figuras retóricas en acción: quiz de reconocimiento", a3: "Analizo un poema: forma, figura y sentido" },
  { a1: "La reseña crítica: leer para evaluar y comunicar", a2: "Completa la estructura de una reseña crítica", a3: "Escribo mi primera reseña crítica" },
  { a1: "La exposición oral formal: coloquio, simposio y foro", a2: "Estrategias de argumentación oral: quiz de comprensión", a3: "¿Qué tan preparado/a estoy para exponer formalmente?" },
];

const tiposA1 = ["lectura", "infografia", "lectura", "lectura", "video_con_preguntas", "lectura", "video_con_preguntas"] as const;
const tiposA2 = ["quiz_multiple_opcion", "quiz_multiple_opcion", "quiz_verdadero_falso", "fill_blanks", "quiz_multiple_opcion", "fill_blanks", "quiz_multiple_opcion"] as const;
const tiposA3 = ["reflexion_escrita", "glosario_interactivo", "reflexion_escrita", "autoevaluacion", "reflexion_escrita", "reflexion_escrita", "autoevaluacion"] as const;

const descsA1 = [
  "Lectura sobre pensamiento crítico lector: paráfrasis, postura frente al autor y sentido global del texto.",
  "Infografía sobre los principales movimientos literarios: Barroco, Neoclasicismo, Romanticismo, Realismo, Modernismo, Vanguardias y Realismo mágico.",
  "Lectura sobre los géneros literarios (novela, cuento, poesía, drama, ensayo) y sus perspectivas de análisis.",
  "Lectura sobre los subgéneros narrativos contemporáneos: suspenso, terror, ciencia ficción, autoficción, neorrealismo urbano y literaturas del Antropoceno.",
  "Video sobre el género lírico: figuras retóricas (metáfora, hipérbaton, hipérbole, ironía, prosopopeya), rima y métrica.",
  "Lectura sobre la reseña crítica: características, estructura y proceso de escritura.",
  "Video sobre la exposición oral formal: coloquio, simposio y foro; planeación logística y argumentación oral.",
];
const descsA2 = [
  "Quiz de opción múltiple sobre pensamiento crítico lector y estrategias de comprensión.",
  "Quiz de opción múltiple sobre los rasgos definitorios de cada movimiento literario.",
  "Quiz verdadero/falso sobre géneros literarios, sus características y fronteras.",
  "Actividad de completar espacios sobre los subgéneros narrativos y sus rasgos distintivos.",
  "Quiz de opción múltiple sobre figuras retóricas, rima y métrica del género lírico.",
  "Actividad de completar espacios sobre la estructura y el proceso de escritura de la reseña crítica.",
  "Quiz de opción múltiple sobre estrategias de argumentación y formatos de exposición oral formal.",
];
const descsA3 = [
  "Reflexión escrita sobre la postura crítica frente a un texto de su elección.",
  "Glosario interactivo de movimientos literarios con definición, ejemplo y etiquetas de época.",
  "Reflexión escrita: análisis de un texto literario desde perspectivas diversas.",
  "Autoevaluación de comprensión y valoración de los subgéneros narrativos.",
  "Reflexión escrita: análisis de un poema atendiendo a forma, figuras y sentido.",
  "Reflexión escrita: primera reseña crítica sobre un texto literario leído.",
  "Autoevaluación de habilidades para la exposición oral formal.",
];

// ── CONTENIDOS A1 ─────────────────────────────────────────────────────────────

const contenidosA1 = [
  { // P01 — lectura: Pensamiento crítico lector
    titulo: "Leer críticamente: más allá de la comprensión literal",
    texto: `Leer de forma crítica no significa desconfiar del texto ni buscarle defectos: significa comprometerse con él de manera activa, cuestionando, interpretando y evaluando lo que el autor dice y cómo lo dice.\n\nEl primer nivel de la lectura crítica es la paráfrasis: reformular con nuestras propias palabras lo que el texto dice, sin agregar ni quitar información. Parafrasear nos obliga a verificar si realmente entendemos; si no podemos parafrasear, probablemente no hemos comprendido.\n\nEl segundo nivel es identificar la postura del autor: ¿qué punto de vista defiende?, ¿qué valores o supuestos están detrás de sus argumentos?, ¿qué voces o perspectivas no aparecen en el texto? No todo lo que se escribe es neutral: el autor selecciona, enfatiza y omite desde una posición determinada.\n\nEl tercer nivel es captar el sentido global del texto: ¿cuál es el propósito comunicativo del texto?, ¿a qué lector está dirigido?, ¿qué efecto busca producir en quien lo lee? Distinguir este propósito nos permite evaluar si el texto cumple o no su intención.\n\nLeer críticamente es una competencia que se desarrolla con práctica. Cada texto que analizamos a profundidad amplía nuestra capacidad de leer el siguiente con mayor perspicacia.`,
    preguntas: [
      { pregunta: "¿Qué significa leer de forma crítica según el texto?", respuesta_guia: "Comprometerse activamente con el texto cuestionando, interpretando y evaluando lo que el autor dice y cómo lo dice." },
      { pregunta: "¿Para qué sirve la paráfrasis en la lectura crítica?", respuesta_guia: "Para verificar la comprensión real del texto; si no podemos parafrasear, no hemos entendido." },
      { pregunta: "¿Qué implica identificar la postura del autor?", respuesta_guia: "Reconocer su punto de vista, valores y supuestos, y detectar qué perspectivas omite." },
      { pregunta: "¿Qué es el sentido global del texto?", respuesta_guia: "El propósito comunicativo, el lector al que va dirigido y el efecto que busca producir." },
    ],
  },
  { // P02 — infografia: Movimientos literarios
    titulo: "Movimientos literarios: del Barroco al Realismo mágico",
    descripcion: "Panorama de los principales movimientos literarios desde el siglo XVII hasta el siglo XX, con sus rasgos definitorios, contexto histórico y autores representativos de habla hispana.",
    url_imagen: "/placeholder/infografia.svg",
    puntos_clave: [
      "Barroco (s. XVII): lenguaje ornamental, contrastes extremos, desengaño del mundo. Sor Juana Inés de la Cruz, Quevedo, Góngora.",
      "Neoclasicismo (s. XVIII): razón, orden, claridad y moral ilustrada. Prioriza la función didáctica de la literatura.",
      "Romanticismo (s. XIX, 1ª mitad): emoción, individualismo, naturaleza sublime, rebeldía. Bécquer, Espronceda.",
      "Realismo (s. XIX, 2ª mitad): representación objetiva de la sociedad, crítica social, personajes ordinarios. Galdós, Pardo Bazán.",
      "Modernismo (fin s. XIX — inicio s. XX): musicalidad, lenguaje preciosista, cosmopolitismo, renovación formal. Darío, Martí.",
      "Vanguardias (1910–1940): ruptura radical con tradición, experimentación formal: creacionismo, ultraísmo, surrealismo, futurismo.",
      "Realismo mágico (s. XX): lo maravilloso integrado a lo cotidiano, raíces latinoamericanas. García Márquez, Rulfo, Carpentier.",
    ],
    fuente: "Material elaborado para CEN Bachillerato — LC-III, basado en historia literaria hispanoamericana",
  },
  { // P03 — lectura: Géneros literarios
    titulo: "Géneros literarios: formas de contar y decir",
    texto: `La literatura no es un bloque uniforme: se organiza en géneros que comparten convenciones de forma, contenido y propósito. Conocer los géneros nos ayuda a leer cada texto desde sus propias reglas y a escribir con intención.\n\nLa narrativa agrupa los textos que cuentan historias: la novela (extensa, con múltiples personajes y tramas), el cuento (breve, concentrado en un efecto), la crónica (entre lo real y lo literario). La narrativa construye mundos habitados por personajes que actúan en el tiempo.\n\nLa lírica o poesía expresa estados interiores, sensaciones y percepciones a través del lenguaje cargado de figuras retóricas, ritmo y musicalidad. No siempre rima, pero siempre tiene una conciencia especial del sonido y la imagen.\n\nEl drama o teatro está escrito para ser representado. Los textos dramáticos se organizan en actos y escenas; el diálogo entre personajes lleva la acción. Incluye la tragedia (conflictos que terminan en pérdida), la comedia (conflictos que terminan en armonía) y el drama moderno (ambiguo, realista).\n\nEl ensayo es un género de no ficción en que el autor reflexiona, argumenta o interpreta sobre un tema con voz propia. A diferencia del artículo científico, el ensayo acepta la subjetividad y la belleza del estilo.\n\nLos géneros se mezclan: un poema puede ser narrativo, una novela puede tener ensayos dentro, un drama puede ser poético. Reconocer estas mezclas es parte de la lectura literaria sofisticada.`,
    preguntas: [
      { pregunta: "¿Cuáles son los cuatro géneros literarios mencionados en el texto?", respuesta_guia: "Narrativa, lírica (poesía), drama (teatro) y ensayo." },
      { pregunta: "¿En qué se diferencia el cuento de la novela dentro de la narrativa?", respuesta_guia: "El cuento es breve y concentrado en un efecto; la novela es extensa con múltiples personajes y tramas." },
      { pregunta: "¿Qué caracteriza al género lírico?", respuesta_guia: "Expresa estados interiores con lenguaje cargado de figuras retóricas, ritmo y musicalidad; tiene conciencia especial del sonido y la imagen." },
      { pregunta: "¿Por qué el ensayo acepta la subjetividad?", respuesta_guia: "Porque es un género donde el autor reflexiona o argumenta con voz propia, a diferencia del artículo científico." },
    ],
  },
  { // P04 — lectura: Subgéneros narrativos
    titulo: "Subgéneros narrativos: del suspenso al Antropoceno",
    texto: `Dentro de la narrativa, los subgéneros son especializaciones que desarrollan convenciones propias de trama, personajes, atmósfera y lectores esperados. Conocerlos amplía nuestra comprensión de lo que la literatura puede hacer.\n\nEl suspenso mantiene al lector en tensión mediante la incertidumbre: no saber qué ocurrirá o temer que ocurra algo terrible. Sus recursos incluyen el cliffhanger, la información incompleta y el tiempo en cuenta regresiva.\n\nEl terror busca producir miedo, incomodidad o repulsión. Puede ser sobrenatural (monstruos, fantasmas) o psicológico (la amenaza viene de una mente perturbada o de la propia realidad). Los mejores textos de terror nos dicen algo sobre miedos reales.\n\nLa ciencia ficción explora futuros posibles, tecnologías imaginadas y sociedades alternativas. No es solo especulación tecnológica: es una forma de reflexionar sobre el presente proyectándolo hacia adelante o hacia mundos paralelos.\n\nLa autoficción mezcla la autobiografía con la invención: el autor escribe sobre sí mismo pero alterando, exagerando o inventando eventos. La frontera entre lo vivido y lo imaginado es deliberadamente borrosa.\n\nEl neorrealismo urbano retrata la vida en las ciudades contemporáneas con sus tensiones sociales, violencia, marginalidad y diversidad cultural. Es crudo y directo, sin romantizar la realidad.\n\nLas literaturas del Antropoceno son una tendencia reciente que sitúa la crisis ecológica y el cambio climático en el centro de la narración. Nos preguntan: ¿cómo vivir y narrar en un planeta en colapso?`,
    preguntas: [
      { pregunta: "¿Qué recurso usa el suspenso para mantener la tensión del lector?", respuesta_guia: "El cliffhanger, la información incompleta y el tiempo en cuenta regresiva." },
      { pregunta: "¿Cuál es la diferencia entre terror sobrenatural y terror psicológico?", respuesta_guia: "El sobrenatural usa monstruos o fantasmas; el psicológico amenaza desde una mente perturbada o la realidad misma." },
      { pregunta: "¿Qué es la autoficción?", respuesta_guia: "Un subgénero que mezcla autobiografía con invención, donde la frontera entre lo vivido y lo imaginado es deliberadamente borrosa." },
      { pregunta: "¿De qué se ocupa la literatura del Antropoceno?", respuesta_guia: "De situar la crisis ecológica y el cambio climático en el centro de la narración, preguntando cómo vivir y narrar en un planeta en colapso." },
    ],
  },
  { // P05 — video_con_preguntas: El género lírico
    url: "https://example.com/video-pendiente-cen",
    duracion_segundos: 510,
    preguntas: [
      { timestamp_segundos: 80, pregunta: "¿Cuál es la diferencia entre metáfora e hipérbole como figuras retóricas?", respuesta_guia: "La metáfora establece una identidad entre dos realidades distintas; la hipérbole exagera una cualidad para producir efecto expresivo." },
      { timestamp_segundos: 210, pregunta: "¿Qué es el hipérbaton y qué efecto produce en el verso?", respuesta_guia: "Es la alteración del orden sintáctico habitual; produce extrañamiento, ritmo especial y énfasis en ciertas palabras." },
      { timestamp_segundos: 370, pregunta: "¿En qué se diferencia la rima consonante de la rima asonante?", respuesta_guia: "La consonante repite todos los sonidos (vocales y consonantes) desde la última vocal tónica; la asonante solo repite las vocales." },
    ],
  },
  { // P06 — lectura: La reseña crítica
    titulo: "La reseña crítica: leer para evaluar y comunicar",
    texto: `La reseña crítica es un texto de opinión fundamentada sobre una obra: puede ser un libro, una película, un disco, una exposición. No es un resumen ni un comentario superficial: es una evaluación razonada que combina descripción, análisis y juicio.\n\nLas características de la reseña crítica son: (1) identifica claramente la obra reseñada y su autor; (2) ofrece una síntesis del contenido sin spoilers innecesarios; (3) analiza los elementos formales relevantes (estilo, estructura, recursos); (4) emite un juicio crítico fundamentado en argumentos; (5) va dirigida a un lector que no ha leído/visto la obra pero podría hacerlo.\n\nLa estructura de una reseña incluye: introducción (presentación de la obra y su contexto), desarrollo (síntesis + análisis de elementos destacados) y conclusión (valoración final y recomendación).\n\nEl proceso de escritura de una reseña tiene etapas: (a) lectura o visionado atento y toma de notas; (b) identificación de los aspectos más significativos; (c) formulación de una opinión argumentada; (d) redacción con un tono que combine precisión y accesibilidad; (e) revisión para que el texto sea coherente, fluido y útil para el lector.\n\nUna buena reseña no convence al lector de que su opinión es la correcta: le da elementos para que forme su propia opinión de manera informada.`,
    preguntas: [
      { pregunta: "¿Qué diferencia a una reseña crítica de un resumen?", respuesta_guia: "La reseña combina descripción, análisis y juicio fundamentado; el resumen solo informa el contenido sin evaluar." },
      { pregunta: "¿Cuáles son los tres elementos de la estructura de una reseña?", respuesta_guia: "Introducción (presentación y contexto), desarrollo (síntesis y análisis) y conclusión (valoración y recomendación)." },
      { pregunta: "¿Cuál es el propósito final de una buena reseña crítica?", respuesta_guia: "Dar al lector elementos para que forme su propia opinión de manera informada, no imponerle una opinión." },
      { pregunta: "¿Qué tono debe tener una reseña según el texto?", respuesta_guia: "Un tono que combine precisión y accesibilidad para el lector potencial de la obra." },
    ],
  },
  { // P07 — video_con_preguntas: La exposición oral formal
    url: "https://example.com/video-pendiente-cen",
    duracion_segundos: 480,
    preguntas: [
      { timestamp_segundos: 90, pregunta: "¿En qué se diferencia un coloquio de un simposio y de un foro?", respuesta_guia: "El coloquio es una conversación entre expertos; el simposio presenta ponencias especializadas sucesivas; el foro abre la participación al público." },
      { timestamp_segundos: 250, pregunta: "¿Qué elementos logísticos deben planearse antes de una exposición oral formal?", respuesta_guia: "Tiempo asignado, materiales de apoyo, distribución del espacio, turnos de participación y protocolo de preguntas." },
      { timestamp_segundos: 410, pregunta: "¿Cuál es la diferencia entre un argumento y una opinión en la exposición oral?", respuesta_guia: "El argumento se sostiene con evidencias, datos o razonamiento lógico; la opinión es una afirmación personal sin respaldo." },
    ],
  },
];

// ── CONTENIDOS A2 ─────────────────────────────────────────────────────────────

const contenidosA2 = [
  { // P01 — quiz_multiple_opcion: Pensamiento crítico lector
    preguntas: [
      {
        pregunta: "¿Cuál es el propósito principal de la paráfrasis en la lectura crítica?",
        opciones: ["Copiar el texto con otras palabras para recordarlo", "Verificar la comprensión real del texto reformulándolo sin agregar ni quitar información", "Resumir el texto eliminando los detalles", "Traducir el texto a un lenguaje más sencillo"],
        respuesta_correcta: 1,
        retroalimentacion: "La paráfrasis es una prueba de comprensión: si no podemos reformular el texto fielmente, no lo hemos entendido."
      },
      {
        pregunta: "Identificar la postura del autor implica:",
        opciones: ["Buscar errores ortográficos o gramaticales", "Reconocer su punto de vista, valores y qué perspectivas omite deliberadamente", "Contar cuántas veces repite una idea", "Traducir sus metáforas a lenguaje literal"],
        respuesta_correcta: 1,
        retroalimentacion: "La postura del autor incluye sus supuestos ideológicos y las voces que excluye, no solo lo que dice explícitamente."
      },
      {
        pregunta: "¿Qué distingue a un lector crítico de uno literal?",
        opciones: ["El lector crítico solo lee textos académicos", "El lector crítico cuestiona, interpreta y evalúa; el literal solo extrae lo que el texto dice explícitamente", "El lector crítico desconfía de todo lo escrito", "No hay diferencia real entre ambos tipos de lectura"],
        respuesta_correcta: 1,
        retroalimentacion: "La lectura crítica añade interpretación y evaluación a la comprensión literal: va más allá de lo explícito."
      },
      {
        pregunta: "El 'sentido global del texto' se refiere a:",
        opciones: ["La extensión total del texto", "El propósito comunicativo, el lector al que va dirigido y el efecto que busca producir", "El número de ideas que contiene", "El vocabulario más difícil del texto"],
        respuesta_correcta: 1,
        retroalimentacion: "El sentido global integra propósito, destinatario y efecto buscado: es la intención comunicativa completa."
      },
      {
        pregunta: "¿Por qué no todo texto es neutral según la lectura crítica?",
        opciones: ["Porque todos los textos tienen errores", "Porque el autor selecciona, enfatiza y omite desde una posición determinada", "Porque el lenguaje es siempre subjetivo", "Porque los textos son escritos por personas con emociones"],
        respuesta_correcta: 1,
        retroalimentacion: "La selección, el énfasis y la omisión son actos del autor que revelan su postura frente al tema."
      },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P02 — quiz_multiple_opcion: Movimientos literarios
    preguntas: [
      {
        pregunta: "¿Qué caracteriza principalmente al Barroco literario?",
        opciones: ["Lenguaje simple y directo con propósito moral", "Lenguaje ornamental, contrastes extremos y el tema del desengaño del mundo", "Representación objetiva de la sociedad contemporánea", "Ruptura radical con todas las convenciones literarias anteriores"],
        respuesta_correcta: 1,
        retroalimentacion: "El Barroco se distingue por su lenguaje recargado y el contraste entre apariencia y realidad, reflejando el desengaño de su época."
      },
      {
        pregunta: "El Romanticismo literario se caracteriza por:",
        opciones: ["Valorar la razón por encima de la emoción", "El individualismo, la emoción, la naturaleza sublime y la rebeldía frente al orden establecido", "Representar la vida cotidiana de la clase trabajadora", "Experimentar con la forma y rechazar la sintaxis convencional"],
        respuesta_correcta: 1,
        retroalimentacion: "El Romanticismo reacciona contra el racionalismo ilustrado exaltando el yo, la emoción y la naturaleza."
      },
      {
        pregunta: "¿Qué distingue al Realismo literario del Romanticismo?",
        opciones: ["El Realismo usa más metáforas y recursos poéticos", "El Realismo busca representar objetivamente la sociedad, con crítica social y personajes ordinarios", "El Realismo se centra en mundos imaginarios", "No hay diferencias significativas entre ambos movimientos"],
        respuesta_correcta: 1,
        retroalimentacion: "El Realismo reacciona contra el idealismo romántico: prefiere lo cotidiano, lo social y lo verosímil."
      },
      {
        pregunta: "¿Cuál es el rasgo más representativo del Modernismo hispanoamericano?",
        opciones: ["La representación cruda de la marginalidad urbana", "La musicalidad, el lenguaje preciosista, el cosmopolitismo y la renovación formal", "La integración de lo maravilloso en lo cotidiano", "La ruptura total con el lenguaje literario tradicional"],
        respuesta_correcta: 1,
        retroalimentacion: "El Modernismo, liderado por Rubén Darío, renueva el castellano literario con musicalidad, exotismo y cuidado formal extremo."
      },
      {
        pregunta: "El Realismo mágico se caracteriza por:",
        opciones: ["Narrar solo hechos históricos comprobables", "Integrar elementos maravillosos o sobrenaturales en la realidad cotidiana de manera natural", "Ambientar sus historias en mundos completamente fantásticos", "Rechazar los elementos culturales latinoamericanos"],
        respuesta_correcta: 1,
        retroalimentacion: "En el Realismo mágico, lo extraordinario coexiste con lo cotidiano sin asombrar a los personajes: es parte de su mundo."
      },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P03 — quiz_verdadero_falso: Géneros literarios
    afirmaciones: [
      {
        afirmacion: "La novela y el cuento pertenecen al mismo género literario: la narrativa.",
        es_verdadero: true,
        retroalimentacion: "Correcto. Ambos son subgéneros narrativos; se diferencian en extensión y forma de construir el efecto."
      },
      {
        afirmacion: "El ensayo literario es siempre objetivo y no admite la voz personal del autor.",
        es_verdadero: false,
        retroalimentacion: "Falso. El ensayo acepta y valora la subjetividad: el autor reflexiona con voz propia, a diferencia del artículo científico."
      },
      {
        afirmacion: "El teatro o drama está escrito para ser representado, no solo leído.",
        es_verdadero: true,
        retroalimentacion: "Correcto. El texto dramático presupone una puesta en escena con actores, espacio y público."
      },
      {
        afirmacion: "La lírica siempre tiene rima y métrica fija: no existe la poesía en verso libre.",
        es_verdadero: false,
        retroalimentacion: "Falso. La poesía moderna incluye el verso libre, que prescinde de rima y métrica regular pero mantiene conciencia del ritmo y la imagen."
      },
      {
        afirmacion: "Los géneros literarios pueden mezclarse: una novela puede contener poemas o ensayos dentro.",
        es_verdadero: true,
        retroalimentacion: "Correcto. La hibridación de géneros es frecuente en la literatura contemporánea: muchas novelas integran poesía, cartas o ensayos."
      },
      {
        afirmacion: "La tragedia termina siempre con la muerte o la derrota del protagonista.",
        es_verdadero: true,
        retroalimentacion: "Correcto. La tragedia clásica concluye con una pérdida irreparable que genera catarsis en el espectador."
      },
    ],
    intentos_maximos: 2,
    puntaje_minimo_aprobacion: 70,
  },
  { // P04 — fill_blanks: Subgéneros narrativos
    texto_con_huecos: "El ___ mantiene al lector en tensión mediante la incertidumbre sobre lo que ocurrirá. El terror ___ usa monstruos y fantasmas, mientras que el terror ___ amenaza desde la mente del personaje. La ___ mezcla autobiografía con invención, haciendo borrosa la frontera entre lo real y lo imaginado. Las literaturas del ___ sitúan la crisis ecológica en el centro de la narración.",
    huecos: [
      { respuesta_correcta: "suspenso", alternativas_aceptadas: ["thriller", "género de suspenso"], pista: "Subgénero que genera expectativa sobre el desenlace" },
      { respuesta_correcta: "sobrenatural", alternativas_aceptadas: ["fantástico", "de lo sobrenatural"], pista: "Terror que usa elementos fantásticos como monstruos o fantasmas" },
      { respuesta_correcta: "psicológico", alternativas_aceptadas: ["interior", "mental"], pista: "Terror que viene de la mente, no de criaturas externas" },
      { respuesta_correcta: "autoficción", alternativas_aceptadas: ["auto-ficción", "ficción autobiográfica"], pista: "Subgénero que combina lo autobiográfico con lo inventado" },
      { respuesta_correcta: "Antropoceno", alternativas_aceptadas: ["antropoceno", "Anthropocene"], pista: "Época geológica caracterizada por el impacto humano en el planeta" },
    ],
  },
  { // P05 — quiz_multiple_opcion: Figuras retóricas y género lírico
    preguntas: [
      {
        pregunta: "¿Cuál de los siguientes versos contiene una metáfora?",
        opciones: ["El sol brillaba con fuerza ayer", "Tus ojos son dos luceros que iluminan la noche", "Caminé lentamente por la orilla del río", "El viento sopló durante toda la tarde"],
        respuesta_correcta: 1,
        retroalimentacion: "«Tus ojos son dos luceros» establece una identidad entre dos realidades distintas: la metáfora identifica ojos con astros luminosos."
      },
      {
        pregunta: "La hipérbole es una figura retórica que:",
        opciones: ["Compara dos realidades con 'como' o 'cual'", "Atribuye cualidades humanas a objetos inanimados", "Exagera una cualidad o situación para producir efecto expresivo", "Invierte el orden normal de las palabras en la frase"],
        respuesta_correcta: 2,
        retroalimentacion: "La hipérbole amplifica: «te lo he dicho un millón de veces» es hiperbólico porque exagera con intención expresiva."
      },
      {
        pregunta: "¿Qué figura retórica hay en el verso «el mar llora su soledad de espuma»?",
        opciones: ["Hipérbaton", "Ironía", "Prosopopeya o personificación", "Hipérbole"],
        respuesta_correcta: 2,
        retroalimentacion: "Atribuir al mar la capacidad de llorar es una prosopopeya: se asigna una cualidad humana (llorar) a algo no humano (el mar)."
      },
      {
        pregunta: "La ironía en el lenguaje literario consiste en:",
        opciones: ["Exagerar una cualidad hasta el absurdo", "Decir lo contrario de lo que se quiere significar, esperando que el receptor lo comprenda", "Atribuir vida a objetos inanimados", "Invertir el orden de los elementos de la oración"],
        respuesta_correcta: 1,
        retroalimentacion: "La ironía juega con la distancia entre lo dicho y lo querido decir; requiere que el lector reconozca esa distancia."
      },
      {
        pregunta: "¿Qué diferencia a la rima consonante de la rima asonante?",
        opciones: ["La consonante rima solo en las vocales; la asonante repite todos los sonidos", "La consonante repite todos los sonidos desde la última vocal tónica; la asonante solo repite las vocales", "La asonante es más culta que la consonante", "No hay diferencia real entre ambas en la poesía moderna"],
        respuesta_correcta: 1,
        retroalimentacion: "«amor/calor» es asonante (solo vocales -o-); «amor/dolor» no rima; «amor/temblor» es consonante (todos los sonidos desde la o tónica)."
      },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P06 — fill_blanks: Estructura de la reseña crítica
    texto_con_huecos: "La reseña crítica combina ___, análisis y ___ fundamentado sobre una obra. La ___ presenta la obra reseñada y su contexto. El ___ incluye la síntesis del contenido y el análisis de elementos formales. La conclusión ofrece la ___ final y una recomendación al lector potencial.",
    huecos: [
      { respuesta_correcta: "descripción", alternativas_aceptadas: ["síntesis", "presentación", "descripcion"], pista: "Primer componente: presentar qué hay en la obra" },
      { respuesta_correcta: "juicio", alternativas_aceptadas: ["valoración", "opinión argumentada", "evaluación"], pista: "Componente que evalúa con argumentos" },
      { respuesta_correcta: "introducción", alternativas_aceptadas: ["introduccion", "apertura", "inicio"], pista: "Primera sección estructural de la reseña" },
      { respuesta_correcta: "desarrollo", alternativas_aceptadas: ["cuerpo", "cuerpo del texto"], pista: "Sección central donde se analiza la obra" },
      { respuesta_correcta: "valoración", alternativas_aceptadas: ["evaluación", "juicio", "opinion", "opinión"], pista: "Lo que expresa el reseñador al final sobre la obra" },
    ],
  },
  { // P07 — quiz_multiple_opcion: Estrategias de argumentación oral
    preguntas: [
      {
        pregunta: "¿Cuál es la diferencia principal entre un coloquio y un foro?",
        opciones: ["El coloquio es más informal que el foro", "El coloquio es una conversación entre expertos; el foro abre la participación al público general", "El foro es solo para especialistas; el coloquio es para estudiantes", "No hay diferencia: son sinónimos"],
        respuesta_correcta: 1,
        retroalimentacion: "El coloquio convoca a expertos en diálogo; el foro amplía la voz al público, que puede preguntar o participar."
      },
      {
        pregunta: "¿Qué diferencia a un argumento de una opinión en la exposición oral?",
        opciones: ["El argumento es más largo que la opinión", "El argumento se sostiene con evidencias, datos o razonamiento lógico; la opinión es una afirmación personal sin respaldo", "La opinión siempre es más convincente que el argumento", "No hay diferencia: toda opinión es un argumento"],
        respuesta_correcta: 1,
        retroalimentacion: "Argumentar implica fundamentar: datos, ejemplos, citas o razonamientos lógicos que sostienen la afirmación."
      },
      {
        pregunta: "En una exposición oral formal, ¿qué función tiene el tiempo asignado?",
        opciones: ["Es solo una referencia: el expositor puede ignorarlo", "Estructura la intervención y obliga a priorizar los puntos más importantes", "Solo importa en competencias académicas, no en foros reales", "Indica cuántas diapositivas puede usar el expositor"],
        respuesta_correcta: 1,
        retroalimentacion: "Respetar el tiempo es parte de la cortesía comunicativa y obliga a seleccionar lo más relevante para decir."
      },
      {
        pregunta: "¿Cuál es el propósito del protocolo de preguntas en un simposio?",
        opciones: ["Evitar que el público haga preguntas difíciles", "Organizar los turnos de participación para que el intercambio sea ordenado y respetuoso", "Limitar la exposición a solo las preguntas preaprobadas", "Sustituir la exposición oral por un turno de preguntas"],
        respuesta_correcta: 1,
        retroalimentacion: "El protocolo de preguntas regula la participación: garantiza orden, respeto y que todos puedan intervenir."
      },
      {
        pregunta: "Usar evidencias en la argumentación oral significa:",
        opciones: ["Hablar con mucha confianza y volumen de voz alto", "Apoyar las afirmaciones con datos, ejemplos, citas o referencias verificables", "Repetir varias veces la misma idea para que quede clara", "Hablar más tiempo que los demás participantes"],
        respuesta_correcta: 1,
        retroalimentacion: "La evidencia da credibilidad al argumento: datos estadísticos, ejemplos reales, citas de expertos o referencias comprobables."
      },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
];

// ── CONTENIDOS A3 ─────────────────────────────────────────────────────────────

const contenidosA3 = [
  { // P01 — reflexion_escrita: Postura crítica lectora
    prompt: "Elige un texto que hayas leído recientemente (puede ser una noticia, un artículo, un fragmento literario o una publicación en redes sociales). Escribe: (1) una paráfrasis del texto en tus propias palabras, (2) la postura o punto de vista del autor que puedes identificar, y (3) tu propia postura frente a lo que el texto dice, con al menos dos argumentos que la sostengan.",
    pistas: [
      "La paráfrasis no es resumir: es reformular fielmente sin agregar tu opinión.",
      "Para identificar la postura del autor pregúntate: ¿qué quiere que piense quien lee esto?",
      "Tu postura debe diferenciarse de la del autor: ¿estás de acuerdo, en desacuerdo o tienes matices?",
      "Usa conectores de contraste y de argumentación: 'sin embargo', 'aunque', 'por el contrario', 'porque'.",
    ],
    criterios_evaluacion: [
      "La paráfrasis reformula el texto sin agregar ni omitir ideas principales",
      "Identifica la postura del autor con argumentos textuales",
      "Formula su propia postura con al menos dos argumentos",
      "Usa vocabulario de lectura crítica (postura, argumento, perspectiva, implícito)",
    ],
    longitud_minima: 120,
  },
  { // P02 — glosario_interactivo: Movimientos literarios
    terminos: [
      {
        termino: "Barroco",
        definicion: "Movimiento literario del siglo XVII caracterizado por el lenguaje ornamental, los contrastes extremos (luz/sombra, vida/muerte) y el tema del desengaño del mundo.",
        ejemplo: "Los sonetos de Quevedo y la poesía de Sor Juana Inés de la Cruz son ejemplos representativos del Barroco hispanoamericano.",
        etiquetas: ["siglo XVII", "ornamental", "desengaño", "contrastes", "Hispanoamérica"],
      },
      {
        termino: "Neoclasicismo",
        definicion: "Movimiento del siglo XVIII que priorizó la razón, el orden y la claridad sobre la emoción; valoró la función didáctica y moral de la literatura como vehículo ilustrado.",
        ejemplo: "Los fábulas de Samaniego y Tomás de Iriarte son textos neoclásicos que enseñan valores morales a través de animales y situaciones cotidianizadas.",
        etiquetas: ["siglo XVIII", "Ilustración", "razón", "moral", "didáctico"],
      },
      {
        termino: "Romanticismo",
        definicion: "Movimiento del siglo XIX (primera mitad) que exaltó el individualismo, la emoción, la naturaleza sublime y la rebeldía frente al orden racional establecido por la Ilustración.",
        ejemplo: "Las Rimas de Bécquer y los poemas de Espronceda representan el Romanticismo español con su lenguaje apasionado y sus temas del amor imposible y la muerte.",
        etiquetas: ["siglo XIX", "individualismo", "emoción", "naturaleza", "rebeldía"],
      },
      {
        termino: "Realismo",
        definicion: "Movimiento de la segunda mitad del siglo XIX que buscó representar objetivamente la realidad social, con crítica a las instituciones y personajes ordinarios como protagonistas.",
        ejemplo: "Fortunata y Jacinta de Galdós retrata la sociedad española con sus contradicciones de clase, sus hipocresías y sus personajes complejos sacados de la vida cotidiana.",
        etiquetas: ["siglo XIX", "objetividad", "crítica social", "personajes ordinarios", "verosimilitud"],
      },
      {
        termino: "Modernismo",
        definicion: "Movimiento hispanoamericano de fines del siglo XIX e inicios del XX que renovó el lenguaje literario con musicalidad, preciosismo, cosmopolitismo y una búsqueda de la belleza como valor supremo.",
        ejemplo: "Azul... de Rubén Darío inauguró el Modernismo hispanoamericano con sus versos musicales, sus cisnes y sus referencias a la mitología griega y la cultura francesa.",
        etiquetas: ["fin de siglo", "musicalidad", "cosmopolitismo", "Rubén Darío", "renovación formal"],
      },
      {
        termino: "Vanguardias",
        definicion: "Conjunto de movimientos artísticos y literarios de 1910-1940 (creacionismo, ultraísmo, surrealismo, futurismo) que rompieron radicalmente con las convenciones formales y temáticas anteriores.",
        ejemplo: "Los caligramas de Apollinaire y los poemas visuales de Vicente Huidobro son ejemplos de la ruptura vanguardista con la forma poética tradicional.",
        etiquetas: ["siglo XX", "ruptura", "experimentación", "surrealismo", "ultraísmo", "creacionismo"],
      },
      {
        termino: "Realismo mágico",
        definicion: "Corriente narrativa latinoamericana del siglo XX que integra elementos maravillosos o sobrenaturales en la realidad cotidiana de manera natural, sin asombro por parte de los personajes.",
        ejemplo: "En Cien años de soledad de García Márquez, Remedios la Bella asciende al cielo mientras tiende sábanas, y los habitantes de Macondo lo aceptan con total naturalidad.",
        etiquetas: ["América Latina", "maravilloso", "cotidiano", "García Márquez", "Rulfo", "Carpentier"],
      },
      {
        termino: "Naturalismo",
        definicion: "Variante extrema del Realismo que aplicó métodos científicos (determinismo biológico y social) a la literatura, mostrando cómo el ambiente y la herencia condicionan el comportamiento humano.",
        ejemplo: "Las obras de Émile Zola y, en español, de Emilia Pardo Bazán muestran personajes cuyas vidas están determinadas por su clase social, su biología y su entorno.",
        etiquetas: ["siglo XIX", "determinismo", "ciencia", "ambiente social", "herencia"],
      },
    ],
  },
  { // P03 — reflexion_escrita: Perspectivas múltiples sobre un texto literario
    prompt: "Elige un texto literario breve (un poema, un cuento corto o un fragmento de novela) que hayas leído o que tu profesor/a te haya proporcionado. Analízalo desde DOS perspectivas diferentes: (a) una perspectiva que se enfoque en la forma (¿cómo está escrito?: lenguaje, estructura, recursos); y (b) una perspectiva que se enfoque en el contenido social o cultural (¿qué dice sobre la sociedad, el género, la historia o la identidad?). Explica qué reveló cada perspectiva que la otra no puede ver.",
    pistas: [
      "La perspectiva formal analiza: ¿qué tipo de texto es?, ¿qué recursos literarios usa?, ¿cómo está organizado?",
      "La perspectiva sociocultural pregunta: ¿qué valores defiende el texto?, ¿a quién representa o excluye?, ¿en qué época se inscribe?",
      "Al final compara: ¿qué ganas viendo el texto desde cada perspectiva? ¿Se contradicen o se complementan?",
      "Usa términos del tema: género literario, movimiento, recurso expresivo, perspectiva, contexto.",
    ],
    criterios_evaluacion: [
      "Analiza el texto desde una perspectiva formal con términos específicos",
      "Analiza el texto desde una perspectiva sociocultural con argumentos concretos",
      "Explica qué aporta cada perspectiva que la otra no puede ver",
      "El análisis demuestra comprensión del texto y no solo paráfrasis",
    ],
    longitud_minima: 100,
  },
  { // P04 — autoevaluacion: Subgéneros narrativos
    criterios: [
      {
        nombre: "Reconocimiento de subgéneros narrativos",
        descripcion: "Soy capaz de identificar el subgénero de un texto narrativo (suspenso, terror, ciencia ficción, autoficción, neorrealismo urbano, literaturas del Antropoceno)",
        escala: ["No reconozco los subgéneros aún", "Reconozco 1-2 subgéneros en textos sencillos", "Reconozco la mayoría de los subgéneros con sus rasgos principales", "Identifico el subgénero y explico qué rasgos lo confirman"],
        prompt_reflexion_final: "¿Cuál subgénero narrativo te resultó más difícil de identificar? ¿Qué rasgo lo hace más complejo de reconocer?",
      },
      {
        nombre: "Distinción entre subgéneros cercanos",
        descripcion: "Puedo distinguir entre subgéneros que se parecen (por ejemplo, terror sobrenatural vs. terror psicológico, o autoficción vs. autobiografía)",
        escala: ["Confundo frecuentemente los subgéneros entre sí", "Distingo algunos con ayuda de ejemplos", "Distingo la mayoría con razonamientos claros", "Distingo y explico con ejemplos propios o textuales"],
        prompt_reflexion_final: "¿Qué par de subgéneros te parece más difícil de distinguir? ¿Qué criterio podrías usar para diferenciarlos?",
      },
      {
        nombre: "Valoración de la diversidad narrativa contemporánea",
        descripcion: "Comprendo por qué existen múltiples subgéneros narrativos y valoro la diversidad de formas de contar historias",
        escala: ["No entiendo para qué sirve distinguir subgéneros", "Entiendo la distinción pero no le veo utilidad práctica", "Valoro la distinción para leer mejor y con más contexto", "Valoro la diversidad y la relaciono con distintas necesidades culturales y lectoras"],
        prompt_reflexion_final: "¿Qué subgénero narrativo te parece más relevante para entender la literatura de tu tiempo? ¿Por qué?",
      },
      {
        nombre: "Aplicación del conocimiento a mis lecturas propias",
        descripcion: "Puedo aplicar el conocimiento de subgéneros a textos que leo fuera de la escuela (series, libros, noticias literarias)",
        escala: ["No logro aplicar el conocimiento fuera del aula", "Lo intento pero me cuesta sin guía", "Lo aplico con éxito en textos sencillos o conocidos", "Lo aplico con confianza en textos nuevos y variados"],
        prompt_reflexion_final: "Menciona un texto (libro, serie, película) que hayas consumido recientemente y clasifícalo en un subgénero narrativo. Justifica tu elección.",
      },
    ],
  },
  { // P05 — reflexion_escrita: Análisis de un poema
    prompt: "Elige un poema (puede ser uno que te haya dado tu profesor/a o uno que tú conozcas). Analízalo respondiendo: (1) ¿Qué figuras retóricas encuentras? Identifica al menos dos con su nombre y explica su efecto. (2) ¿Cómo es la rima: consonante, asonante o libre? ¿Cómo contribuye al sentido del poema? (3) ¿Cuál es el sentido o mensaje central del poema? ¿Qué te transmite a ti como lector/a?",
    pistas: [
      "Nombra la figura retórica (metáfora, hipérbole, prosopopeya, ironía, hipérbaton) y cita el verso donde aparece.",
      "Para analizar la rima: lee los finales de verso en voz alta y compara sus sonidos.",
      "El sentido no es solo 'de qué trata': es qué emoción o idea profunda propone el poema.",
      "Puedes usar frases como: 'El poema sugiere que...', 'A través de la metáfora, el poeta logra...'",
    ],
    criterios_evaluacion: [
      "Identifica al menos dos figuras retóricas con su nombre y un verso de ejemplo",
      "Describe el tipo de rima y explica su relación con el efecto del poema",
      "Articula el sentido central del poema más allá de la paráfrasis literal",
      "Usa vocabulario específico del género lírico",
    ],
    longitud_minima: 100,
  },
  { // P06 — reflexion_escrita: Primera reseña crítica
    prompt: "Escribe tu primera reseña crítica sobre un texto literario que hayas leído en este semestre (o uno que elijas con el apoyo de tu profesor/a). La reseña debe incluir: (a) introducción con los datos de la obra y su contexto, (b) síntesis breve del contenido sin revelar el desenlace completo, (c) análisis de al menos dos elementos formales (estilo, estructura, uso de recursos literarios), y (d) valoración final con tu juicio fundamentado y una recomendación al lector potencial.",
    pistas: [
      "La introducción: nombre de la obra, autor/a, género, año aproximado y en qué movimiento literario se inscribe.",
      "La síntesis: cuenta de qué trata sin spoilers; enfócate en el conflicto o la propuesta central.",
      "El análisis formal: elige los dos elementos que más te llamaron la atención (el narrador, el lenguaje, la estructura temporal, las figuras retóricas).",
      "La valoración: di qué funciona, qué podría ser diferente y a qué lector le recomendarías el texto.",
    ],
    criterios_evaluacion: [
      "Presenta la obra con datos precisos e información de contexto",
      "Ofrece una síntesis que informa sin revelar lo esencial del desenlace",
      "Analiza al menos dos elementos formales con argumentos específicos",
      "La valoración final incluye un juicio argumentado y una recomendación",
    ],
    longitud_minima: 150,
  },
  { // P07 — autoevaluacion: Exposición oral formal
    criterios: [
      {
        nombre: "Dominio del contenido",
        descripcion: "Conozco el tema de mi exposición con suficiente profundidad para responder preguntas y desarrollar argumentos sin depender únicamente de notas",
        escala: ["Dependo completamente de mis notas y no puedo responder preguntas", "Conozco el tema básicamente pero me cuesta argumentar sin apoyo", "Domino el tema y puedo desarrollar argumentos con fluidez", "Domino el tema profundamente y puedo relacionarlo con otras ideas o preguntas inesperadas"],
        prompt_reflexion_final: "¿Qué aspectos del tema de tu exposición necesitas reforzar antes de presentar? ¿Cómo lo harás?",
      },
      {
        nombre: "Argumentación oral",
        descripcion: "Soy capaz de sostener mis afirmaciones con evidencias, datos o ejemplos durante la exposición oral",
        escala: ["Hago afirmaciones sin ningún respaldo", "Intento dar ejemplos pero no siempre son pertinentes", "Argumento con ejemplos o datos relevantes en la mayoría de mis afirmaciones", "Argumento con evidencias precisas, pertinentes y variadas en toda mi exposición"],
        prompt_reflexion_final: "¿Qué tipo de evidencia (datos estadísticos, citas, ejemplos literarios) es más adecuada para tu exposición? ¿Ya la tienes preparada?",
      },
      {
        nombre: "Adecuación al formato (coloquio/simposio/foro)",
        descripcion: "Adapto mi exposición al formato asignado: respeto el protocolo, el tiempo y el rol que me corresponde (expositor, moderador, participante)",
        escala: ["No conozco bien el formato ni el rol que me toca", "Conozco el formato pero me cuesta respetarlo en la práctica", "Respeto el formato y el tiempo asignado con algunos ajustes", "Me desenvuelvo con naturalidad en el formato, respetando protocolo y adaptándome a lo que ocurre"],
        prompt_reflexion_final: "¿Cuál aspecto del protocolo del formato te resulta más difícil de seguir? ¿Qué puedes hacer para prepararte mejor?",
      },
      {
        nombre: "Comunicación no verbal y presencia",
        descripcion: "Uso el cuerpo, la voz y la mirada de manera efectiva para comunicar con claridad y mantener la atención del público",
        escala: ["Me cuesta mantener contacto visual y controlar los nervios", "Intento usar el contacto visual pero mi postura o voz no acompañan", "Comunico con claridad usando voz, mirada y postura de manera coordinada", "Mi presencia refuerza el mensaje: voz modulada, contacto visual fluido y lenguaje corporal abierto"],
        prompt_reflexion_final: "¿Qué aspecto de tu comunicación no verbal quieres mejorar para tu exposición? ¿Cómo practicarás?",
      },
    ],
  },
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });

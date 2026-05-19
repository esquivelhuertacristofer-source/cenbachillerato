/**
 * Seed de actividades pedagógicas para LC-II (Lengua y Comunicación II).
 * 8 progresiones × 3 actividades = 24 actividades. estado='publicada'.
 * Tipos: lectura, video_con_preguntas, infografia, fill_blanks,
 *        quiz_multiple_opcion, quiz_verdadero_falso, reflexion_escrita, autoevaluacion (8 tipos)
 * Uso: npx tsx scripts/seed-activities-lcii.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🌱 Seed actividades LC-II — Lengua y Comunicación II\n");

  const progs = await getProgresionesDeUAC(sb, "LC-II");
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

  log(`\n✅ LC-II: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── TÍTULOS ──────────────────────────────────────────────────────────────────

const titulos = [
  { a1: "Narrativas de vida: contar para construirse", a2: "Completa la narrativa autobiográfica", a3: "Mi historia que dejó huella" },
  { a1: "¿Cómo se construye un texto narrativo?", a2: "Características del texto narrativo y descriptivo", a3: "Escribo mi primer texto narrativo" },
  { a1: "Las narrativas populares: entre tradición e imaginación", a2: "Características lingüísticas de la narrativa popular", a3: "¿Qué tan bien reconozco las narrativas populares?" },
  { a1: "Personajes y escenarios que dan vida a las historias", a2: "Identifico personajes y escenarios en narrativas", a3: "Creo mi propio personaje narrativo" },
  { a1: "El tema y las ideas en la narrativa popular", a2: "¿Verdadero o falso? Temas y jerarquía narrativa", a3: "Analizo el tema central de una narrativa" },
  { a1: "El arte de reescribir: transformar un texto", a2: "Reescribe completando los elementos narrativos", a3: "Reescribo un texto integrando mis aprendizajes" },
  { a1: "Análisis colaborativo: leer y mejorar entre varios", a2: "Procedimientos narrativos: identificando técnicas", a3: "¿Qué tan bien analizo textos narrativos?" },
  { a1: "Proyectos creativos multimodales: las posibilidades del texto", a2: "¿Qué sé sobre producción creativa multimodal?", a3: "Mi proyecto creativo: narrativa, oralidad y escritura" },
];

const tiposA1 = ["lectura", "video_con_preguntas", "lectura", "infografia", "lectura", "video_con_preguntas", "lectura", "infografia"] as const;
const tiposA2 = ["fill_blanks", "quiz_multiple_opcion", "fill_blanks", "quiz_multiple_opcion", "quiz_verdadero_falso", "fill_blanks", "quiz_multiple_opcion", "quiz_multiple_opcion"] as const;
const tiposA3 = ["reflexion_escrita", "reflexion_escrita", "autoevaluacion", "reflexion_escrita", "reflexion_escrita", "reflexion_escrita", "autoevaluacion", "reflexion_escrita"] as const;

const descsA1 = [
  "Lectura sobre la narración autobiográfica y su función social.",
  "Video sobre la construcción de textos narrativos y descriptivos.",
  "Lectura sobre las narrativas populares y sus características lingüísticas.",
  "Infografía sobre los tipos de personajes y escenarios en la narrativa popular.",
  "Lectura sobre el tema y las ideas en la narrativa popular.",
  "Video sobre técnicas de reescritura y transformación de textos.",
  "Lectura sobre el análisis colaborativo como práctica de mejora textual.",
  "Infografía sobre los proyectos creativos multimodales en LC-II.",
];
const descsA2 = [
  "Actividad de completar espacios sobre la narrativa autobiográfica.",
  "Quiz de comprensión sobre características del texto narrativo.",
  "Actividad de completar espacios sobre el léxico de las narrativas populares.",
  "Quiz de opción múltiple sobre personajes y escenarios narrativos.",
  "Quiz verdadero/falso sobre el tema y la jerarquía de ideas narrativas.",
  "Actividad de completar espacios en un texto narrativo reescrito.",
  "Quiz de opción múltiple sobre procedimientos narrativos.",
  "Quiz de opción múltiple sobre producción creativa multimodal.",
];
const descsA3 = [
  "Reflexión escrita sobre una experiencia personal significativa.",
  "Reflexión escrita: primer texto narrativo de autoría propia.",
  "Autoevaluación de comprensión sobre narrativas populares.",
  "Reflexión escrita: diseño de un personaje narrativo original.",
  "Reflexión escrita: análisis de una narrativa popular elegida.",
  "Reflexión escrita: reescritura creativa con integración de aprendizajes.",
  "Autoevaluación de habilidades de análisis textual colaborativo.",
  "Reflexión escrita: planificación de un proyecto creativo multimodal.",
];

// ── CONTENIDOS A1 ─────────────────────────────────────────────────────────────

const contenidosA1 = [
  { // P01 — lectura: Narrativas de vida
    texto: `Las narrativas de vida son textos en los que una persona cuenta episodios de su propia historia: un momento decisivo, una pérdida importante, un aprendizaje profundo, una primera vez. Al narrar, no solo recordamos: construimos significado sobre lo que nos ha pasado y lo compartimos con otros.\n\nEscribir sobre la propia vida requiere valentía y reflexión. No se trata de contar todo lo que ocurrió, sino de seleccionar aquellas situaciones que dejaron una huella —un cambio en cómo pensamos, sentimos o actuamos— y darles forma con palabras.\n\nEn muchas culturas, contar la historia propia es un acto comunitario. Las personas mayores transmiten su sabiduría a través de relatos; las familias construyen su identidad compartiendo anécdotas; los escritores influyen en sus lectores al mostrar cómo sus experiencias los transformaron. En LC-II, narrarás situaciones de tu historia de vida para explorar cómo el lenguaje nos ayuda a entendernos y a comunicar nuestra experiencia a los demás.`,
    fuente: "Material elaborado para CEN Bachillerato — LC-II",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 8,
    preguntas_comprension: [
      { pregunta: "¿Qué son las narrativas de vida según el texto?", respuesta_guia: "Textos en los que una persona cuenta episodios de su historia que dejaron huella." },
      { pregunta: "¿Por qué el texto dice que narrar requiere 'valentía y reflexión'?", respuesta_guia: "Porque implica seleccionar experiencias significativas y darles forma pública con palabras." },
      { pregunta: "¿Cómo usan las narrativas las comunidades, según el texto?", respuesta_guia: "Las personas mayores transmiten sabiduría, las familias construyen identidad y los escritores influyen en lectores." },
    ],
  },
  { // P02 — video_con_preguntas: Cómo se construye un texto narrativo
    url_video: "https://example.com/video-pendiente-cen",
    titulo_video: "¿Cómo se construye un texto narrativo o descriptivo?",
    descripcion_video: "Explicación sobre los elementos estructurales del texto narrativo: trama, personajes, escenario, narrador y tonos. Incluye ejemplos de textos descriptivos y narrativos de autores latinoamericanos.",
    duracion_segundos: 480,
    subtitulos_disponibles: true,
    preguntas: [
      { tiempo_segundos: 60, pregunta: "¿Cuál es la diferencia principal entre un texto narrativo y uno descriptivo?", tipo: "abierta" as const },
      { tiempo_segundos: 180, pregunta: "¿Cuáles son los elementos estructurales del texto narrativo?", tipo: "abierta" as const },
      { tiempo_segundos: 360, pregunta: "¿Qué tono narrativo (humorístico, dramático, irónico) prefiere el/la narrador/a en los ejemplos del video?", tipo: "abierta" as const },
    ],
  },
  { // P03 — lectura: Narrativas populares
    texto: `Las narrativas populares son relatos que circulan en la cultura cotidiana de comunidades y pueblos: leyendas sobre lugares misteriosos, mitos de origen, cuentos transmitidos oralmente de generación en generación, creepypastas contemporáneas en internet. Todas comparten algo en común: nacen de la imaginación colectiva y dan sentido a lo que no se puede explicar fácilmente.\n\nDesde el punto de vista lingüístico, estas narrativas tienen características propias. Usan un vocabulario accesible y, a menudo, regional o coloquial. Sus estructuras sintácticas son simples pero efectivas. El tiempo verbal predominante suele ser el pasado, pero puede mezclarse con el presente para crear tensión. Abundan las fórmulas de inicio ("Cuentan que…", "Se dice que…") y los recursos expresivos como la hipérbole, la personificación y el suspenso.\n\nEstudiar las narrativas populares nos permite entender cómo una comunidad construye su identidad, sus miedos y sus valores a través del lenguaje. También nos proporciona recursos que podemos integrar en nuestros propios textos creativos.`,
    fuente: "Material elaborado para CEN Bachillerato — LC-II",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 9,
    preguntas_comprension: [
      { pregunta: "¿Qué tienen en común las narrativas populares según el texto?", respuesta_guia: "Nacen de la imaginación colectiva y dan sentido a lo que no se explica fácilmente." },
      { pregunta: "Menciona tres características lingüísticas de las narrativas populares.", respuesta_guia: "Vocabulario accesible/coloquial, estructuras sintácticas simples, tiempo pasado, fórmulas de inicio, hipérbole, personificación, suspenso." },
      { pregunta: "¿Para qué nos sirve estudiar narrativas populares?", respuesta_guia: "Para entender cómo una comunidad construye su identidad y para obtener recursos para nuestros textos creativos." },
    ],
  },
  { // P04 — infografia: Personajes y escenarios
    titulo: "Personajes y escenarios en la narrativa popular",
    url_imagen: "/placeholder/infografia.svg",
    descripcion_accesible: "Infografía sobre los tipos de personajes (protagonista, antagonista, secundario, arquetipo) y los tipos de escenarios (realista, fantástico, histórico) en la narrativa popular, con ejemplos de narrativas latinoamericanas.",
    puntos_clave: [
      "Protagonista: el personaje central cuya historia seguimos.",
      "Antagonista: quien se opone al protagonista, creando conflicto.",
      "Personaje secundario: apoya o complica la trama sin ser el centro.",
      "Arquetipo: personaje universal (el héroe, el sabio, el trickster).",
      "Escenario realista: lugares reconocibles de la vida cotidiana.",
      "Escenario fantástico: mundos imaginarios o con elementos mágicos.",
      "Escenario histórico: ambientado en épocas pasadas con contexto real.",
    ],
    fuente: "Material CEN Bachillerato — LC-II, basado en teoría narrativa",
    actividad_post: "Identifica en una narrativa popular de tu elección: el protagonista, el antagonista (si lo hay) y el tipo de escenario. Explica por qué los clasificas así.",
  },
  { // P05 — lectura: Tema e ideas
    texto: `Todo texto narrativo trata sobre algo: ese "algo" es el tema. El tema es la idea central que el autor quiere explorar o comunicar a través de su historia. Puede ser explícito (mencionado directamente) o implícito (deducible del desarrollo de la historia). Ejemplos de temas comunes en narrativas populares: la lucha entre el bien y el mal, la importancia de la comunidad, el peligro de la ambición desmedida, la fuerza del amor.\n\nAl mismo tiempo, dentro de un texto hay ideas centrales (las más importantes, sin las cuales el texto perdería su sentido principal) e ideas secundarias (que enriquecen, contextualizan o apoyan las ideas centrales, pero que podrían eliminarse sin destruir el sentido del texto).\n\nSaber distinguir el tema de las ideas centrales y secundarias es fundamental para comprender profundamente cualquier texto narrativo. Esta habilidad también te ayudará a organizar tus propios textos: al definir con claridad el tema de lo que quieres escribir, podrás seleccionar qué información es central y qué es secundaria.`,
    fuente: "Material elaborado para CEN Bachillerato — LC-II",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 8,
    preguntas_comprension: [
      { pregunta: "¿Qué es el tema de un texto narrativo?", respuesta_guia: "La idea central que el autor quiere explorar, puede ser explícita o implícita." },
      { pregunta: "¿Cuál es la diferencia entre ideas centrales e ideas secundarias?", respuesta_guia: "Las centrales son indispensables para el sentido del texto; las secundarias enriquecen pero no son esenciales." },
      { pregunta: "¿Por qué es útil identificar el tema al escribir?", respuesta_guia: "Porque permite seleccionar qué información es central y organizar el texto con claridad." },
    ],
  },
  { // P06 — video_con_preguntas: El arte de reescribir
    url_video: "https://example.com/video-pendiente-cen",
    titulo_video: "El arte de reescribir: transformar y mejorar un texto",
    descripcion_video: "Explicación de técnicas de reescritura literaria: cambio de perspectiva narrativa, actualización de contexto, expansión o condensación de escenas, cambio de tono. Incluye ejercicios prácticos con leyendas y cuentos tradicionales.",
    duracion_segundos: 420,
    subtitulos_disponibles: true,
    preguntas: [
      { tiempo_segundos: 90, pregunta: "¿Qué significa reescribir un texto y en qué se diferencia de copiarlo?", tipo: "abierta" as const },
      { tiempo_segundos: 240, pregunta: "Menciona dos técnicas de reescritura que explica el video.", tipo: "abierta" as const },
      { tiempo_segundos: 390, pregunta: "¿Por qué reescribir textos es una práctica útil para mejorar la escritura?", tipo: "abierta" as const },
    ],
  },
  { // P07 — lectura: Análisis colaborativo
    texto: `Leer en compañía transforma la experiencia del texto. Cuando analizamos un texto de manera colaborativa, cada persona aporta una perspectiva diferente: lo que una persona pasó por alto, otra lo nota; lo que a una le parece confuso, a otra le resulta claro. El resultado es una comprensión más rica y profunda que la que cualquiera lograría leyendo solo.\n\nEl análisis colaborativo de textos tiene varios pasos: (1) lectura individual inicial, (2) identificación personal de elementos narrativos (trama, personajes, tema, tono), (3) puesta en común y discusión de interpretaciones, (4) retroalimentación constructiva entre pares, (5) revisión y mejora colectiva del texto analizado.\n\nDurante el proceso, es importante mantener una actitud de respeto y apertura: el objetivo no es "ganar" la discusión sino aprender del texto y de los demás. La retroalimentación constructiva señala con claridad tanto los aciertos como los aspectos a mejorar, y siempre se enfoca en el texto, no en la persona que lo escribió.`,
    fuente: "Material elaborado para CEN Bachillerato — LC-II",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 8,
    preguntas_comprension: [
      { pregunta: "¿Por qué el análisis colaborativo produce una comprensión más rica?", respuesta_guia: "Porque cada persona aporta una perspectiva diferente, complementando lo que otras no notaron." },
      { pregunta: "¿Cuáles son los pasos del análisis colaborativo mencionados en el texto?", respuesta_guia: "Lectura individual, identificación personal, puesta en común, retroalimentación, revisión colectiva." },
      { pregunta: "¿En qué debe enfocarse la retroalimentación constructiva?", respuesta_guia: "En el texto (aciertos y aspectos a mejorar), no en la persona que lo escribió." },
    ],
  },
  { // P08 — infografia: Proyectos creativos multimodales
    titulo: "Proyectos creativos multimodales en LC-II",
    url_imagen: "/placeholder/infografia.svg",
    descripcion_accesible: "Infografía sobre los tipos de proyectos creativos multimodales que integran lectura, escritura y oralidad: podcast, obra de teatro leída, fotonovela, videopoema, blog narrativo.",
    puntos_clave: [
      "Podcast: grabación de audio con guion, edición y producción sonora.",
      "Obra de teatro leída: texto dramático con reparto y lectura expresiva.",
      "Fotonovela: narrativa visual con fotografías y texto integrado.",
      "Videopoema: combinación de imagen, voz y música para un poema.",
      "Blog narrativo: publicación digital de relatos con recursos multimediales.",
      "Integración de habilidades: todo proyecto combina oralidad, escritura y lectura.",
      "Audiencia real: producir para ser escuchado/leído/visto por otros.",
    ],
    fuente: "Material CEN Bachillerato — LC-II",
    actividad_post: "Elige uno de los formatos de la infografía y escribe un breve plan: ¿qué historia contarías?, ¿a qué audiencia?, ¿qué recursos necesitarías?",
  },
];

// ── CONTENIDOS A2 ─────────────────────────────────────────────────────────────

const contenidosA2 = [
  { // P01 — fill_blanks: Narrativa autobiográfica
    instrucciones: "Completa el texto con las palabras del banco: huella, experiencia, reflexión, narrar, significado.",
    texto_con_huecos: "Las narrativas de vida nos permiten ___ episodios significativos de nuestra historia personal. Al escribir, no solo recordamos: construimos ___ sobre lo que vivimos. Elegir una situación que dejó una ___ en nosotros requiere ___ honesta. Compartir esa ___ con otros es un acto de comunicación profunda.",
    huecos: [
      { posicion: 0, respuesta_correcta: "narrar", alternativas_aceptadas: ["contar", "relatar"] },
      { posicion: 1, respuesta_correcta: "significado", alternativas_aceptadas: ["sentido"] },
      { posicion: 2, respuesta_correcta: "huella", alternativas_aceptadas: ["marca", "impresión"] },
      { posicion: 3, respuesta_correcta: "reflexión", alternativas_aceptadas: ["reflexionar"] },
      { posicion: 4, respuesta_correcta: "experiencia", alternativas_aceptadas: ["vivencia"] },
    ],
    distingue_mayusculas: false,
  },
  { // P02 — quiz_multiple_opcion: Características del texto narrativo
    preguntas: [
      { enunciado: "¿Cuál es el elemento que genera el movimiento de la trama en un texto narrativo?", opciones: ["El escenario", "El narrador", "El conflicto", "El tiempo verbal"], respuesta_correcta: 2, retroalimentacion: "El conflicto es la fuerza que impulsa la trama y crea tensión narrativa." },
      { enunciado: "¿Qué tono narrativo predomina en los textos irónicos?", opciones: ["Dramático y solemne", "Distanciado, señalando contradicciones entre lo dicho y lo real", "Humorístico y festivo", "Misterioso y suspensivo"], respuesta_correcta: 1, retroalimentacion: "La ironía presenta lo contrario de lo que se quiere decir, creando distancia reflexiva." },
      { enunciado: "¿Qué diferencia a un texto narrativo de uno descriptivo?", opciones: ["El narrativo cuenta eventos en el tiempo; el descriptivo presenta características sin acción", "El narrativo usa más adjetivos que el descriptivo", "El descriptivo tiene personajes y el narrativo no", "No hay diferencia real entre ambos"], respuesta_correcta: 0, retroalimentacion: "El texto narrativo relata eventos con inicio, desarrollo y desenlace; el descriptivo retrata características estáticas." },
      { enunciado: "¿Cuál de estos es un ejemplo de texto narrativo?", opciones: ["Una descripción del paisaje de una ciudad", "Un cuento sobre una aventura en el bosque", "Un manual de instrucciones", "Un artículo de opinión"], respuesta_correcta: 1, retroalimentacion: "El cuento relata eventos con personajes y trama: es el ejemplo clásico de texto narrativo." },
      { enunciado: "¿Qué función tiene el escenario en un texto narrativo?", opciones: ["Solo decorativa: no afecta la trama", "Sitúa la acción en tiempo y espacio y puede influir en los personajes y la trama", "Es el personaje principal de la historia", "Reemplaza al narrador"], respuesta_correcta: 1, retroalimentacion: "El escenario contextualiza la acción y puede reflejar o influir en el estado de los personajes." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P03 — fill_blanks: Características lingüísticas de narrativas populares
    instrucciones: "Completa las afirmaciones sobre las características lingüísticas de las narrativas populares.",
    texto_con_huecos: "Las narrativas populares suelen usar un vocabulario ___ y regional. Sus estructuras sintácticas son ___. El tiempo verbal predominante es el ___. Abundan fórmulas de inicio como '___ que…'. Un recurso expresivo muy común es la ___ (exageración de algo para producir efecto).",
    huecos: [
      { posicion: 0, respuesta_correcta: "coloquial", alternativas_aceptadas: ["accesible", "cotidiano", "sencillo"] },
      { posicion: 1, respuesta_correcta: "simples", alternativas_aceptadas: ["sencillas", "directas"] },
      { posicion: 2, respuesta_correcta: "pasado", alternativas_aceptadas: ["pretérito", "pasado/presente"] },
      { posicion: 3, respuesta_correcta: "Cuentan", alternativas_aceptadas: ["Se dice", "Dicen"] },
      { posicion: 4, respuesta_correcta: "hipérbole", alternativas_aceptadas: ["exageración"] },
    ],
    distingue_mayusculas: false,
  },
  { // P04 — quiz_multiple_opcion: Personajes y escenarios
    preguntas: [
      { enunciado: "¿Cómo se llama el personaje que se opone al protagonista?", opciones: ["Secundario", "Arquetipo", "Antagonista", "Narrador"], respuesta_correcta: 2, retroalimentacion: "El antagonista crea el conflicto oponiéndose al protagonista." },
      { enunciado: "¿Qué es un arquetipo narrativo?", opciones: ["Un tipo de escenario fantástico", "Un personaje universal que representa un rol simbólico (el héroe, el sabio, el trickster)", "El personaje más complejo de la historia", "El narrador en primera persona"], respuesta_correcta: 1, retroalimentacion: "Los arquetipos son personajes universales que aparecen en culturas y épocas distintas." },
      { enunciado: "¿Cómo se clasifica un escenario ambientado en el México prehispánico con eventos reales?", opciones: ["Fantástico", "Realista", "Histórico", "Autobiográfico"], respuesta_correcta: 2, retroalimentacion: "El escenario histórico se ubica en épocas pasadas con contexto histórico real." },
      { enunciado: "En una leyenda sobre una mujer que llora por las noches en un río, ¿qué tipo de escenario predomina?", opciones: ["Realista", "Fantástico", "Histórico", "Solo es descriptivo"], respuesta_correcta: 1, retroalimentacion: "La leyenda de La Llorona usa un escenario fantástico con elementos sobrenaturales." },
      { enunciado: "Un personaje secundario sirve principalmente para:", opciones: ["Reemplazar al protagonista cuando falta", "Ser el enemigo del protagonista", "Apoyar, complicar o enriquecer la trama sin ser el centro", "Narrar la historia en tercera persona"], respuesta_correcta: 2, retroalimentacion: "Los personajes secundarios enriquecen la trama sin ser el foco principal de la historia." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P05 — quiz_verdadero_falso: Tema e ideas
    preguntas: [
      { enunciado: "El tema de un texto narrativo siempre está escrito de forma explícita en el texto.", respuesta: false, retroalimentacion: "El tema puede ser implícito: el lector lo deduce del desarrollo de la historia." },
      { enunciado: "Las ideas centrales son indispensables para el sentido principal del texto.", respuesta: true, retroalimentacion: "Correcto. Sin las ideas centrales, el texto perdería su sentido principal." },
      { enunciado: "Las ideas secundarias son irrelevantes y pueden eliminarse sin afectar el texto.", respuesta: false, retroalimentacion: "Las ideas secundarias enriquecen y contextualizan, aunque el texto mantiene sentido sin ellas." },
      { enunciado: "Identificar el tema ayuda al escritor a seleccionar qué información incluir en su texto.", respuesta: true, retroalimentacion: "Correcto. Tener claro el tema permite decidir qué es central y qué es secundario." },
      { enunciado: "Un texto narrativo puede tener varios temas secundarios además del tema principal.", respuesta: true, retroalimentacion: "Correcto. Los temas secundarios desarrollan aspectos relacionados con el tema central." },
      { enunciado: "El tema y la trama son lo mismo en un texto narrativo.", respuesta: false, retroalimentacion: "El tema es la idea que explora el texto; la trama es la secuencia de eventos que lo conforman." },
    ],
    intentos_maximos: 2,
    puntaje_minimo_aprobacion: 70,
  },
  { // P06 — fill_blanks: Reescritura narrativa
    instrucciones: "Completa este texto narrativo reescrito con las palabras que faltan: perspectiva, tono, conflicto, humorístico, protagonista.",
    texto_con_huecos: "La reescritura puede cambiar la ___ desde la que se cuenta la historia: de primera a tercera persona. También puede modificar el ___ narrativo: un texto dramático puede reescribirse en clave ___. El ___ de la historia puede transformarse: lo que era una pérdida puede convertirse en una ganancia. Incluso el ___ puede cambiar de rol: el villano puede convertirse en el héroe de su propia versión.",
    huecos: [
      { posicion: 0, respuesta_correcta: "perspectiva", alternativas_aceptadas: ["punto de vista", "voz"] },
      { posicion: 1, respuesta_correcta: "tono", alternativas_aceptadas: ["registro", "estilo"] },
      { posicion: 2, respuesta_correcta: "humorístico", alternativas_aceptadas: ["cómico", "irónico"] },
      { posicion: 3, respuesta_correcta: "conflicto", alternativas_aceptadas: ["problema", "nudo"] },
      { posicion: 4, respuesta_correcta: "protagonista", alternativas_aceptadas: ["personaje principal", "héroe"] },
    ],
    distingue_mayusculas: false,
  },
  { // P07 — quiz_multiple_opcion: Procedimientos narrativos
    preguntas: [
      { enunciado: "¿Qué es la analepsis (o flashback) en un texto narrativo?", opciones: ["Un salto hacia el futuro", "Un retroceso hacia el pasado dentro de la narración", "Un cambio de personaje narrador", "Una descripción detallada del escenario"], respuesta_correcta: 1, retroalimentacion: "La analepsis interrumpe el orden cronológico para narrar eventos pasados." },
      { enunciado: "¿Qué efecto produce el uso del presente narrativo en una historia que ocurrió en el pasado?", opciones: ["Confusión temporal", "Mayor inmediatez y tensión", "Distanciamiento del lector", "Nada especial"], respuesta_correcta: 1, retroalimentacion: "El presente narrativo acerca al lector a la acción, creando sensación de inmediatez." },
      { enunciado: "La focalización interna en un texto narrativo significa que:", opciones: ["El narrador sabe todo sobre todos los personajes", "El narrador percibe la historia desde la perspectiva limitada de un personaje", "El texto tiene muchos personajes", "La historia se cuenta en tercera persona"], respuesta_correcta: 1, retroalimentacion: "La focalización interna limita la información al punto de vista de un personaje específico." },
      { enunciado: "¿Qué es el suspenso narrativo?", opciones: ["Un error gramatical común en narrativas populares", "La técnica de mantener al lector en incertidumbre sobre lo que ocurrirá", "Una figura retórica de comparación", "El final de la historia"], respuesta_correcta: 1, retroalimentacion: "El suspenso mantiene la expectativa del lector sobre el desenlace, generando tensión." },
      { enunciado: "Un texto que termina de forma abierta (sin resolver el conflicto explícitamente) usa:", opciones: ["Un desenlace cerrado", "Un desenlace abierto o final abierto", "Un epílogo", "Una analepsis"], respuesta_correcta: 1, retroalimentacion: "El final abierto deja la resolución a la interpretación del lector." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P08 — quiz_multiple_opcion: Producción creativa multimodal
    preguntas: [
      { enunciado: "¿Qué significa que un proyecto sea 'multimodal'?", opciones: ["Que usa solo texto escrito", "Que integra diferentes modos de comunicación: texto, audio, imagen, video", "Que lo hacen varios autores al mismo tiempo", "Que está publicado en múltiples plataformas"], respuesta_correcta: 1, retroalimentacion: "Multimodal significa que combina distintos recursos: texto, audio, imagen u otros." },
      { enunciado: "¿Qué elemento es esencial en la producción de un podcast narrativo?", opciones: ["Solo la voz, sin necesidad de guion", "Un guion previo que organice el contenido y los tiempos", "Imágenes de alta calidad", "Un escenario teatral real"], respuesta_correcta: 1, retroalimentacion: "El guion da estructura al podcast: define contenido, duración y participantes." },
      { enunciado: "¿Cuál es la diferencia entre una fotonovela y un cómic?", opciones: ["No hay diferencia", "La fotonovela usa fotografías reales; el cómic usa ilustraciones dibujadas", "El cómic usa fotografías; la fotonovela usa dibujos", "La fotonovela no tiene texto"], respuesta_correcta: 1, retroalimentacion: "La fotonovela combina fotografías con texto narrativo; el cómic usa ilustraciones." },
      { enunciado: "Integrar 'oralidad, escritura y lectura' en un proyecto creativo significa:", opciones: ["Hacer tres proyectos separados", "Combinar estas tres prácticas de lenguaje en un solo producto", "Solo leer y escribir, la oralidad es opcional", "Memorizar el texto para decirlo sin leer"], respuesta_correcta: 1, retroalimentacion: "La integración de las tres prácticas enriquece el proyecto y desarrolla competencias comunicativas completas." },
      { enunciado: "¿Por qué producir para una audiencia real mejora el proceso creativo?", opciones: ["Porque la audiencia califica al autor", "Porque dar sentido comunicativo real exige mayor cuidado en la forma y el contenido", "Porque así el texto no necesita correcciones", "No mejora el proceso, es solo una formalidad"], respuesta_correcta: 1, retroalimentacion: "La audiencia real obliga a pensar en la claridad, el impacto y la pertinencia del mensaje." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
];

// ── CONTENIDOS A3 ─────────────────────────────────────────────────────────────

const contenidosA3 = [
  { // P01 — reflexion_escrita
    prompt: "Elige un momento de tu vida que haya dejado una huella importante en ti —una experiencia que cambió cómo piensas, sientes o actúas. Narra ese momento con detalle: ¿cuándo y dónde ocurrió?, ¿quiénes estuvieron presentes?, ¿qué pasó exactamente?, ¿cómo te sentiste?, ¿qué aprendiste o cómo cambiaste a partir de esa experiencia?",
    pistas: ["Puedes escribir en primera persona: 'Yo estaba...', 'Recuerdo que...'", "Incluye detalles sensoriales: sonidos, colores, sensaciones físicas.", "Explica concretamente en qué cambió tu manera de ver las cosas."],
    longitud_minima_palabras: 120,
    longitud_maxima_palabras: 350,
    criterios_evaluacion: ["Narra una experiencia personal concreta y específica", "Describe los hechos con detalles que hacen vivir la escena", "Reflexiona explícitamente sobre la huella que dejó la experiencia", "Usa conectores narrativos (luego, entonces, de pronto, al mismo tiempo)"],
    formato_esperado: "libre" as const,
  },
  { // P02 — reflexion_escrita
    prompt: "Escribe un texto narrativo o descriptivo de tu propia autoría. Puede ser: (a) una narración breve sobre algo que viviste o imaginaste, (b) una descripción detallada de un lugar, persona o momento. Asegúrate de incluir: un inicio que capte la atención, un desarrollo con detalles y un cierre que genere una reflexión o imagen final.",
    pistas: ["Elige un tono: ¿quieres que sea humorístico, dramático, misterioso?", "Si es narrativo: incluye un conflicto, aunque sea pequeño.", "Si es descriptivo: usa comparaciones (metáforas, símiles) para que el lector visualice."],
    longitud_minima_palabras: 120,
    longitud_maxima_palabras: 400,
    criterios_evaluacion: ["El texto tiene un inicio, desarrollo y cierre diferenciados", "Incluye detalles específicos (no genéricos)", "El tono elegido es coherente a lo largo del texto", "Hay al menos un recurso expresivo (comparación, pregunta retórica, enumeración)"],
    formato_esperado: "libre" as const,
  },
  { // P03 — autoevaluacion
    instrucciones: "Reflexiona sobre tu comprensión de las narrativas populares tras las actividades de esta progresión.",
    criterios: [
      {
        descripcion: "Identifico características lingüísticas de las narrativas populares",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Apenas reconozco que existen características propias." },
          { valor: 2, etiqueta: "En proceso", descripcion: "Identifico algunas características pero me confundo con otras." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Identifico correctamente las principales características lingüísticas." },
          { valor: 4, etiqueta: "Destacado", descripcion: "Identifico y explico las características con ejemplos propios." },
        ],
      },
      {
        descripcion: "Distingo los tipos de narrativas populares (leyenda, mito, creepypasta, cuento)",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Confundo los tipos entre sí." },
          { valor: 2, etiqueta: "En proceso", descripcion: "Distingo algunos pero no todos." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Distingo correctamente los principales tipos." },
          { valor: 4, etiqueta: "Destacado", descripcion: "Distingo y puedo dar un ejemplo de cada tipo." },
        ],
      },
      {
        descripcion: "Puedo usar recursos de las narrativas populares en mis propios textos",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Aún no sé cómo incorporarlos." },
          { valor: 2, etiqueta: "En proceso", descripcion: "Intento usarlos pero el resultado no siempre funciona." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Uso al menos un recurso de manera efectiva." },
          { valor: 4, etiqueta: "Destacado", descripcion: "Uso varios recursos con intención creativa clara." },
        ],
      },
    ],
    reflexion_final_prompt: "¿Qué fue lo que más te sorprendió de las narrativas populares? ¿Qué recurso o característica quieres explorar en tu propio texto creativo?",
    visible_para_docente: true,
  },
  { // P04 — reflexion_escrita
    prompt: "Diseña un personaje original para una narrativa que quieras escribir. Describe: (1) su nombre y tipo (protagonista, antagonista, secundario o arquetipo), (2) sus características físicas, (3) su personalidad con al menos tres rasgos, (4) su motivación principal (¿qué quiere o necesita?), y (5) el tipo de escenario en el que vive. Explica por qué elegiste ese personaje.",
    pistas: ["El personaje debe ser interesante: evita el personaje 'perfecto' o el 'malísimo' sin matices.", "Su motivación debe ser comprensible, aunque sea un antagonista.", "El escenario debe influir en la personalidad o vida del personaje."],
    longitud_minima_palabras: 120,
    longitud_maxima_palabras: 350,
    criterios_evaluacion: ["El personaje tiene nombre, tipo y características físicas claras", "La personalidad tiene al menos tres rasgos coherentes entre sí", "La motivación del personaje está explicada y es comprensible", "La relación entre personaje y escenario es coherente"],
    formato_esperado: "descripcion" as const,
  },
  { // P05 — reflexion_escrita
    prompt: "Elige una narrativa popular que conozcas (una leyenda, un mito, un cuento tradicional o una historia que te contaron). Escribe: (a) el tema central de esa narrativa, (b) dos ideas centrales y dos ideas secundarias, y (c) tu interpretación: ¿qué mensaje o valor comunica esa narrativa a la comunidad que la cuenta?",
    pistas: ["El tema se expresa en una frase corta: 'esta historia trata sobre...'", "Las ideas centrales son aquellas sin las cuales la historia pierde sentido.", "Piensa en qué miedos, valores o creencias comunica la historia a su comunidad."],
    longitud_minima_palabras: 120,
    longitud_maxima_palabras: 350,
    criterios_evaluacion: ["Identifica con claridad el tema central de la narrativa", "Distingue correctamente ideas centrales e ideas secundarias", "Ofrece una interpretación del mensaje o valor comunitario", "Usa vocabulario del tema (tema, ideas centrales/secundarias, narrativa popular)"],
    formato_esperado: "libre" as const,
  },
  { // P06 — reflexion_escrita
    prompt: "Elige una narrativa popular breve (una leyenda, un cuento corto o una creepypasta) y reescríbela cambiando al menos DOS de los siguientes elementos: (a) la perspectiva narrativa (de primera a tercera persona o viceversa), (b) el tono (de dramático a humorístico, de misterioso a cotidiano), (c) el contexto temporal o espacial. Explica al final qué cambiaste y por qué.",
    pistas: ["Elige una narrativa que conozcas bien para concentrarte en la reescritura.", "Cambiar el tono es el desafío más creativo: ¿cómo suena La Llorona en versión humorística?", "Al final explica: ¿qué efecto produce tu versión diferente a la original?"],
    longitud_minima_palabras: 150,
    longitud_maxima_palabras: 500,
    criterios_evaluacion: ["Reescribe claramente cambiando al menos dos elementos", "La reescritura mantiene la esencia de la historia original", "Explica con claridad qué cambió y el efecto que produce", "El texto resultante tiene coherencia y fluidez"],
    formato_esperado: "libre" as const,
  },
  { // P07 — autoevaluacion
    instrucciones: "Evalúa tu capacidad de analizar textos narrativos de manera colaborativa.",
    criterios: [
      {
        descripcion: "Identifico procedimientos narrativos (analepsis, focalización, suspenso, final abierto)",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Apenas conozco los términos." },
          { valor: 2, etiqueta: "En proceso", descripcion: "Identifico algunos en textos sencillos." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Identifico y explico los procedimientos principales." },
          { valor: 4, etiqueta: "Destacado", descripcion: "Identifico, explico y evalúo su efecto en el texto." },
        ],
      },
      {
        descripcion: "Doy retroalimentación constructiva sobre textos de mis compañeros/as",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Solo digo si me gustó o no." },
          { valor: 2, etiqueta: "En proceso", descripcion: "Menciono algunos aspectos concretos pero no todos." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Identifico aciertos y áreas de mejora con argumentos." },
          { valor: 4, etiqueta: "Destacado", descripcion: "Ofrezco retroalimentación específica, respetuosa y con sugerencias concretas." },
        ],
      },
      {
        descripcion: "Mejoro mis textos a partir de la retroalimentación recibida",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "No suelo incorporar los comentarios recibidos." },
          { valor: 2, etiqueta: "En proceso", descripcion: "Incorporo algunos comentarios pero no todos." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Incorporo la mayoría de los comentarios relevantes." },
          { valor: 4, etiqueta: "Destacado", descripcion: "Incorporo comentarios y explico qué mejoré y por qué." },
        ],
      },
    ],
    reflexion_final_prompt: "¿En qué aspecto del análisis colaborativo te sientes más seguro/a y en cuál necesitas seguir creciendo? ¿Qué harás diferente en el próximo análisis colaborativo?",
    visible_para_docente: true,
  },
  { // P08 — reflexion_escrita
    prompt: "Planifica un proyecto creativo multimodal que integre las tres prácticas de LC-II (lectura, escritura y oralidad). Elige el formato (podcast, fotonovela, videopoema, teatro leído u otro) y escribe: (a) el tema o historia que contarás, (b) la audiencia a la que va dirigido, (c) cómo integrarás texto, audio o imagen, (d) los recursos que necesitas y (e) cómo presentarás el resultado final.",
    pistas: ["El formato debe ser realizable con los recursos que tienes disponibles.", "La audiencia define el tono y el nivel de lenguaje: no es lo mismo para niños de primaria que para adultos.", "Piensa en cómo cada elemento (texto, voz, imagen) suma algo que los demás no pueden dar solos."],
    longitud_minima_palabras: 150,
    longitud_maxima_palabras: 400,
    criterios_evaluacion: ["Define claramente el formato y justifica la elección", "El tema o historia está presentado con suficiente detalle", "Explica la integración de al menos dos modos (texto + audio o imagen)", "La planificación es realizable y tiene sentido comunicativo real"],
    formato_esperado: "libre" as const,
  },
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });

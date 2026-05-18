/**
 * Seed de actividades pedagógicas para LC-I (Lengua y Comunicación I).
 * 8 progresiones × 3 actividades = 24 actividades. estado='borrador'.
 * Uso: npx tsx scripts/seed-activities-lci.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🌱 Seed actividades LC-I — Lengua y Comunicación I\n");

  const progs = await getProgresionesDeUAC(sb, "LC-I");
  let ok = 0; let fail = 0;

  for (const p of progs) {
    const n = String(p.numero).padStart(2, "0");
    const base = p.codigo; // LC-I-P01, etc.

    // ── A1: Contextualización (lectura) ──────────────────────────────────────
    const a1ok = await upsertActividad(sb, {
      codigo: `${base}-A1`,
      titulo: titulos[p.numero - 1].a1,
      descripcion: "Lectura de activación para explorar el propósito formativo.",
      tipo: "lectura",
      progresion_id: p.id,
      xp: 10,
      contenido: lecturas[p.numero - 1],
    });
    a1ok ? ok++ : fail++;

    // ── A2: Práctica (quiz) ──────────────────────────────────────────────────
    const a2ok = await upsertActividad(sb, {
      codigo: `${base}-A2`,
      titulo: titulos[p.numero - 1].a2,
      descripcion: "Quiz de comprensión y verificación de aprendizajes.",
      tipo: "quiz_multiple_opcion",
      progresion_id: p.id,
      xp: 15,
      contenido: quizzes[p.numero - 1],
    });
    a2ok ? ok++ : fail++;

    // ── A3: Cierre (reflexión) ───────────────────────────────────────────────
    const a3ok = await upsertActividad(sb, {
      codigo: `${base}-A3`,
      titulo: titulos[p.numero - 1].a3,
      descripcion: "Reflexión escrita de cierre y transferencia.",
      tipo: "reflexion_escrita",
      progresion_id: p.id,
      xp: 20,
      contenido: reflexiones[p.numero - 1],
    });
    a3ok ? ok++ : fail++;

    void n;
  }

  log(`\n✅ LC-I: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── TÍTULOS ───────────────────────────────────────────────────────────────────

const titulos = [
  { // P01 — escritura y lectura
    a1: "Lectura y escritura: un diálogo permanente",
    a2: "¿Cuánto sé sobre escritura y lectura?",
    a3: "Mi relación personal con leer y escribir",
  },
  { // P02 — gustos e inclinaciones en la comunidad
    a1: "¿Qué leen las personas de mi comunidad?",
    a2: "Comunidad lectora: ¿qué sabemos?",
    a3: "Entrevista sobre hábitos de lectura en mi entorno",
  },
  { // P03 — información, ideas y opiniones en textos
    a1: "Ideas, información y opiniones en un texto",
    a2: "Identificando el tipo de contenido textual",
    a3: "Analizando un texto de mi elección",
  },
  { // P04 — tipos de párrafos y conectores
    a1: "Los párrafos y su función en el texto",
    a2: "¿Qué tipo de párrafo es este?",
    a3: "Escribo un párrafo con conectores",
  },
  { // P05 — elementos significativos del texto
    a1: "Subrayar e identificar lo esencial de un texto",
    a2: "¿Qué es lo más importante en este texto?",
    a3: "Elaboro un resumen con las ideas clave",
  },
  { // P06 — concordancia y conectores
    a1: "Concordancia y conectores: el hilo del texto",
    a2: "Conecto ideas correctamente",
    a3: "Reviso y mejoro un texto con errores de concordancia",
  },
  { // P07 — lectura en voz alta y opinión
    a1: "¿Por qué leer en voz alta?",
    a2: "Lectura en voz alta: elementos y técnica",
    a3: "Mi opinión sobre una lectura en voz alta",
  },
  { // P08 — exposición oral
    a1: "Características de una exposición oral efectiva",
    a2: "Elementos de la exposición oral",
    a3: "Planifico mi primera exposición oral",
  },
];

// ── LECTURAS (A1) ─────────────────────────────────────────────────────────────

const lecturas = [
  { // P01
    texto: `Leer y escribir son dos caras de la misma moneda. Cuando leemos, construimos significado a partir de las palabras de otras personas; cuando escribimos, creamos significado para que otras personas lo lean. Esta relación no es unidireccional: la lectura alimenta a la escritura y la escritura transforma nuestra manera de leer.\n\nDesde muy pequeños aprendemos que las letras representan sonidos y que los sonidos forman palabras. Pero leer y escribir van mucho más allá de ese código. Leer un texto literario nos invita a imaginar mundos posibles; leer un artículo informativo nos pide activar nuestra capacidad crítica; escribir un diario personal nos ayuda a procesar emociones y experiencias.\n\nEn el Modelo Educativo 2025, la Lengua y Comunicación propone que desarrolles estas habilidades no de forma aislada sino en situaciones reales y significativas: investigando tu comunidad, analizando textos que te interesan, practicando la lectura en voz alta y preparando exposiciones orales. Todo esto porque la lengua es, antes que nada, una práctica social: la usamos para relacionarnos, para aprender, para expresarnos y para transformar nuestra realidad.`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 8,
    preguntas_comprension: [
      { pregunta: "¿Cuál es la relación que el texto establece entre leer y escribir?", respuesta_guia: "Son dos caras de la misma moneda: se retroalimentan mutuamente." },
      { pregunta: "Menciona dos funciones de la lectura que se nombran en el texto.", respuesta_guia: "Construir significado, imaginar mundos posibles, activar la capacidad crítica." },
      { pregunta: "¿Por qué el texto dice que la lengua es una práctica social?", respuesta_guia: "Porque la usamos para relacionarnos, aprender, expresarnos y transformar la realidad." },
    ],
  },
  { // P02
    texto: `Cuando pensamos en quiénes leen en nuestra comunidad, la respuesta puede sorprendernos. La lectura no ocurre solo en la escuela: ocurre en el trabajo, en el hogar, en el transporte público, en las redes sociales y en los mercados. Una persona puede leer las instrucciones de un medicamento, las etiquetas de los productos que compra, los mensajes de WhatsApp de su familia, o los subtítulos de una película.\n\nInvestigar los gustos e inclinaciones lectoras de las personas que nos rodean es una forma de reconocer que existen múltiples formas de relacionarse con los textos. Algunas personas prefieren los textos informativos (noticias, artículos, manuales); otras disfrutan los textos narrativos (cuentos, novelas, historias de vida); y otras se inclinan por los textos digitales (publicaciones en redes sociales, blogs, foros).\n\nEsta diversidad no tiene jerarquías: ningún tipo de lectura es más válido que otro. Lo que importa es comprender para qué leemos y cómo la lectura se integra a nuestra vida cotidiana. Al investigar los hábitos lectores de tu comunidad, también aprenderás a formular preguntas, a escuchar activamente y a sistematizar información.`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 8,
    preguntas_comprension: [
      { pregunta: "¿En qué espacios ocurre la lectura según el texto?", respuesta_guia: "En la escuela, el trabajo, el hogar, el transporte, las redes sociales y los mercados." },
      { pregunta: "¿Qué tres tipos de textos se mencionan en el texto?", respuesta_guia: "Informativos, narrativos y digitales." },
      { pregunta: "¿Por qué investigar los hábitos lectores de la comunidad es valioso?", respuesta_guia: "Porque permite reconocer diversas formas de leer y también practicar habilidades como formular preguntas y escuchar activamente." },
    ],
  },
  { // P03
    texto: `Cuando leemos un texto, no todos los elementos que encontramos son del mismo tipo. Algunos textos buscan informarnos sobre hechos y datos verificables; otros nos comparten la opinión de su autor; y otros mezclan información, ideas personales e incluso argumentos para persuadirnos.\n\nLa información es aquello que puede contrastarse con la realidad: una fecha, una cifra, el nombre de un lugar. Las ideas son interpretaciones o valoraciones que hace el autor a partir de información. Las opiniones van un paso más allá: expresan la postura personal de quien escribe, a menudo sin que sea posible verificarlas objetivamente.\n\nAprender a distinguir estos tres elementos es fundamental para leer de forma crítica. Un lector crítico no acepta todo lo que lee como verdad absoluta: se pregunta quién escribió el texto, con qué propósito, qué evidencia presenta y qué no dice. Esta habilidad es especialmente importante en la era digital, donde textos de todo tipo circulan mezclados en redes sociales y plataformas de información.`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 8,
    preguntas_comprension: [
      { pregunta: "¿Cuál es la diferencia entre información e ideas según el texto?", respuesta_guia: "La información es verificable con la realidad; las ideas son interpretaciones del autor." },
      { pregunta: "¿Qué preguntas debe hacerse un lector crítico?", respuesta_guia: "Quién escribió, con qué propósito, qué evidencia presenta y qué omite." },
      { pregunta: "¿Por qué esta habilidad es importante en la era digital?", respuesta_guia: "Porque en redes sociales y plataformas se mezclan textos de todo tipo, algunos falsos o sesgados." },
    ],
  },
  { // P04
    texto: `El párrafo es la unidad básica de organización del texto escrito. Cada párrafo desarrolla una idea principal que se expresa generalmente en la oración temática —que puede estar al inicio, al final o en medio del párrafo— y que las demás oraciones apoyan, ejemplifican o amplían.\n\nExisten diferentes tipos de párrafos según su función. El párrafo introductorio presenta el tema del texto y anuncia lo que se desarrollará. El párrafo de desarrollo amplía, explica o argumenta una idea. El párrafo de conclusión cierra el texto retomando las ideas principales. Existen también párrafos descriptivos, narrativos, explicativos y argumentativos, según el tipo de texto al que pertenezcan.\n\nLos conectores son palabras o frases que unen las oraciones y los párrafos de forma coherente. Algunos conectores indican adición (además, también, igualmente), otros indican contraste (sin embargo, aunque, no obstante), y otros indican causa o consecuencia (porque, por lo tanto, en consecuencia). Usarlos correctamente hace que un texto sea más claro y fluido.`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 8,
    preguntas_comprension: [
      { pregunta: "¿Qué es la oración temática de un párrafo?", respuesta_guia: "La oración que expresa la idea principal del párrafo." },
      { pregunta: "Menciona tres tipos de párrafos y su función.", respuesta_guia: "Introductorio (presenta el tema), de desarrollo (amplía ideas), de conclusión (cierra el texto)." },
      { pregunta: "¿Para qué sirven los conectores en un texto?", respuesta_guia: "Para unir oraciones y párrafos de forma coherente, indicando relaciones de adición, contraste o causa-consecuencia." },
    ],
  },
  { // P05
    texto: `Leer un texto implica mucho más que entender las palabras que lo componen. Implica identificar cuáles son las ideas más importantes, cuáles son los detalles de apoyo y cuáles son los ejemplos o datos secundarios. Esta habilidad —conocida como selección de información relevante— es fundamental para el estudio, para la investigación y para la vida cotidiana.\n\nAlgunas estrategias útiles para identificar la información más relevante son: subrayar las palabras o frases clave, hacer anotaciones al margen, identificar la oración temática de cada párrafo y formularse preguntas sobre el texto (¿Quién? ¿Qué? ¿Cómo? ¿Por qué? ¿Para qué?).\n\nUna vez identificada la información relevante, podemos elaborar resúmenes, esquemas o mapas conceptuales que nos ayuden a organizar y retener lo aprendido. El resumen no es copiar fragmentos del texto original: es reescribir las ideas principales con nuestras propias palabras, demostrando que realmente comprendimos el contenido.`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 7,
    preguntas_comprension: [
      { pregunta: "¿Qué significa 'selección de información relevante'?", respuesta_guia: "Identificar las ideas más importantes, los detalles de apoyo y distinguirlos de los secundarios." },
      { pregunta: "¿Qué estrategias se mencionan para identificar información relevante?", respuesta_guia: "Subrayar, anotar al margen, identificar oraciones temáticas, formularse preguntas." },
      { pregunta: "¿Qué es un resumen y en qué se diferencia de copiar?", respuesta_guia: "Reescribir las ideas principales con palabras propias, demostrando comprensión real." },
    ],
  },
  { // P06
    texto: `La concordancia gramatical es el acuerdo entre los elementos de una oración: el sustantivo y el adjetivo concuerdan en género y número; el sujeto y el verbo concuerdan en número y persona. Cuando esta concordancia se rompe, la oración resulta incorrecta o confusa: "Los niños fue al parque" (incorrecto) vs. "Los niños fueron al parque" (correcto).\n\nLos conectores, por su parte, son los puentes que unen ideas dentro de una oración o entre oraciones y párrafos. Sin conectores adecuados, el texto parece una lista de ideas desconectadas; con ellos, el texto fluye de manera lógica y coherente.\n\nEl uso correcto de conectores y concordancia no es solo una cuestión de gramática formal: es una herramienta de claridad comunicativa. Cuando escribimos de forma coherente y con concordancia, el lector puede seguir nuestro razonamiento sin esfuerzo adicional. Analizar textos que admiramos es una excelente manera de internalizar estos recursos: observamos cómo otros escritores logran textos claros y los imitamos creativamente.`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 8,
    preguntas_comprension: [
      { pregunta: "¿En qué consiste la concordancia gramatical?", respuesta_guia: "El acuerdo entre sustantivo-adjetivo (género/número) y sujeto-verbo (número/persona)." },
      { pregunta: "¿Qué función tienen los conectores en el texto?", respuesta_guia: "Unen ideas dentro de oraciones y entre párrafos, haciendo el texto coherente y fluido." },
      { pregunta: "¿Por qué el texto dice que analizar textos que admiramos es útil?", respuesta_guia: "Porque observamos cómo los escritores logran textos claros y lo internalizamos imitándolos." },
    ],
  },
  { // P07
    texto: `La lectura en voz alta es mucho más que pronunciar palabras. Es una práctica que requiere preparación, técnica y presencia. Cuando leemos en voz alta para otros, nos convertimos en intermediarios entre el texto y el público: nuestra voz, nuestro ritmo y nuestras pausas dan vida a las palabras escritas.\n\nLos elementos técnicos de la lectura en voz alta incluyen la dicción (pronunciación clara de cada sílaba), la entonación (variaciones de tono que expresan preguntas, exclamaciones, afirmaciones), el ritmo (velocidad adecuada, ni demasiado rápida ni demasiado lenta) y las pausas (que permiten al oyente procesar lo que escuchó).\n\nLeer en voz alta también desarrolla nuestra capacidad de escucha activa. Cuando somos oyentes, nos entrenamos para seguir el hilo de un texto, para detectar inconsistencias y para emitir opiniones fundamentadas. Emitir una opinión sobre una lectura no es simplemente decir si nos gustó o no: es explicar por qué, con argumentos basados en el texto.`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 7,
    preguntas_comprension: [
      { pregunta: "¿Qué elementos técnicos de la lectura en voz alta se mencionan?", respuesta_guia: "Dicción, entonación, ritmo y pausas." },
      { pregunta: "¿Qué significa emitir una opinión fundamentada sobre una lectura?", respuesta_guia: "Explicar el porqué con argumentos basados en el texto, no solo decir si gustó o no." },
      { pregunta: "¿Qué capacidad desarrolla ser oyente de una lectura en voz alta?", respuesta_guia: "La escucha activa: seguir el hilo del texto, detectar inconsistencias y opinar con argumentos." },
    ],
  },
  { // P08
    texto: `La exposición oral es una de las prácticas comunicativas más importantes en la vida académica y profesional. Exponer es organizar un conjunto de ideas sobre un tema y comunicarlas de manera clara, ordenada y adaptada a la audiencia.\n\nUna exposición oral efectiva tiene varias fases: la planificación (definir el tema, investigar, seleccionar la información relevante), la organización (introducción, desarrollo y conclusión), la preparación de apoyos visuales si se usan (diapositivas, carteles, objetos), y la práctica (ensayar antes de presentar).\n\nDurante la exposición, el contacto visual con el público, la voz segura y la postura corporal son tan importantes como el contenido mismo. La audiencia no solo escucha lo que decimos: también observa cómo lo decimos. Preparar bien una exposición oral no solo permite comunicar ideas con claridad, sino también desarrollar confianza en uno mismo y habilidades de comunicación que serán útiles toda la vida.`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 7,
    preguntas_comprension: [
      { pregunta: "¿Cuáles son las fases de una exposición oral según el texto?", respuesta_guia: "Planificación, organización, preparación de apoyos y práctica." },
      { pregunta: "¿Qué elementos no verbales importan durante la exposición?", respuesta_guia: "Contacto visual, voz segura y postura corporal." },
      { pregunta: "¿Por qué el texto dice que preparar exposiciones desarrolla confianza?", respuesta_guia: "Porque al dominar el tema y practicar, uno gana seguridad para comunicarse frente a otros." },
    ],
  },
];

// ── QUIZZES (A2) ──────────────────────────────────────────────────────────────

const quizzes = [
  { // P01
    preguntas: [
      { enunciado: "¿Cómo se relacionan la lectura y la escritura según la lectura anterior?", opciones: ["Son prácticas completamente independientes", "Se retroalimentan mutuamente", "La escritura es más importante que la lectura", "Solo se relacionan en la escuela"], respuesta_correcta: 1, retroalimentacion: "Leer y escribir se retroalimentan: la lectura alimenta a la escritura y viceversa." },
      { enunciado: "¿Cuál de estos es un ejemplo de texto que activa la imaginación?", opciones: ["Un artículo de noticias", "Un manual de instrucciones", "Una novela", "Una factura de servicios"], respuesta_correcta: 2, retroalimentacion: "Los textos literarios como las novelas invitan a imaginar mundos posibles." },
      { enunciado: "¿Qué propone el Modelo Educativo 2025 respecto a la lengua?", opciones: ["Aprenderla de forma aislada", "Practicarla solo en la escuela", "Desarrollarla en situaciones reales y significativas", "Memorizarla mediante reglas gramaticales"], respuesta_correcta: 2, retroalimentacion: "El modelo propone desarrollar la lengua en situaciones reales: investigando, analizando textos, exponiendo." },
      { enunciado: "¿Qué significa que la lengua es una práctica social?", opciones: ["Que solo se usa en grupos grandes", "Que la usamos para relacionarnos, aprender y expresarnos", "Que está regulada por el gobierno", "Que se aprende imitando a los demás sin reflexión"], respuesta_correcta: 1, retroalimentacion: "La lengua es práctica social porque la usamos para relacionarnos, aprender, expresarnos y transformar la realidad." },
      { enunciado: "Leer un artículo informativo requiere principalmente:", opciones: ["Imaginación desbordada", "Capacidad crítica", "Habilidades de escritura creativa", "Memorizar datos exactos"], respuesta_correcta: 1, retroalimentacion: "Los textos informativos demandan activar la capacidad crítica para evaluar la información." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P02
    preguntas: [
      { enunciado: "¿En cuáles de los siguientes espacios ocurre la lectura según el texto?", opciones: ["Solo en la escuela y la biblioteca", "En el trabajo, hogar, transporte y redes sociales", "Solo en espacios formales", "Exclusivamente en textos académicos"], respuesta_correcta: 1, retroalimentacion: "La lectura ocurre en múltiples contextos: trabajo, hogar, transporte, redes y más." },
      { enunciado: "¿Qué tipo de texto es una noticia de periódico?", opciones: ["Narrativo", "Digital", "Informativo", "Poético"], respuesta_correcta: 2, retroalimentacion: "Las noticias son textos informativos que reportan hechos verificables." },
      { enunciado: "Al investigar hábitos lectores de la comunidad, ¿qué habilidades se desarrollan?", opciones: ["Solo ortografía", "Formular preguntas, escuchar y sistematizar información", "Memorización de textos", "Escritura creativa únicamente"], respuesta_correcta: 1, retroalimentacion: "La investigación comunitaria desarrolla habilidades de indagación, escucha activa y organización de datos." },
      { enunciado: "¿Cuál es la postura del texto respecto a los distintos tipos de lectura?", opciones: ["Los textos académicos son más valiosos", "La lectura en papel es superior a la digital", "Ningún tipo de lectura es más válido que otro", "Los textos narrativos son los más importantes"], respuesta_correcta: 2, retroalimentacion: "El texto afirma que no existen jerarquías entre tipos de lectura: todos son válidos." },
      { enunciado: "¿Qué es un texto narrativo?", opciones: ["Un artículo con datos estadísticos", "Una publicación en redes sociales", "Una novela, cuento o historia de vida", "Un manual de instrucciones"], respuesta_correcta: 2, retroalimentacion: "Los textos narrativos son cuentos, novelas e historias de vida que relatan eventos." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P03
    preguntas: [
      { enunciado: "¿Cuál de estos enunciados es una información verificable?", opciones: ["La película fue entretenida", "El volcán Popocatépetl tiene 5,452 metros de altitud", "Creo que debería llover menos", "Las matemáticas son más difíciles que la biología"], respuesta_correcta: 1, retroalimentacion: "Una cifra geográfica es información verificable con fuentes confiables." },
      { enunciado: "¿Cuál de estos enunciados es una opinión?", opciones: ["El partido terminó 2-1", "La novela fue publicada en 1967", "Ese político es el mejor gobernante del país", "La temperatura bajó 5 grados ayer"], respuesta_correcta: 2, retroalimentacion: "Afirmar que alguien es 'el mejor' es una valoración personal, no un hecho verificable." },
      { enunciado: "Un lector crítico ante una noticia debe preguntarse:", opciones: ["Si el texto está bien redactado", "Solo si le gusta el tema", "Quién lo escribió, con qué propósito y qué evidencia presenta", "Si la letra es legible"], respuesta_correcta: 2, retroalimentacion: "La lectura crítica implica cuestionar la autoría, el propósito y la evidencia del texto." },
      { enunciado: "¿Por qué es importante distinguir información de opiniones?", opciones: ["Para aprobar exámenes", "Para no aceptar todo como verdad absoluta y leer críticamente", "Porque las opiniones son siempre falsas", "Solo es importante en contextos académicos"], respuesta_correcta: 1, retroalimentacion: "Distinguir información de opiniones permite leer críticamente y no dejarse manipular." },
      { enunciado: "¿Cuál de estos es un ejemplo de idea (interpretación)?", opciones: ["La ciudad tiene 3 millones de habitantes", "El texto fue escrito en 2020", "La pobreza es resultado de malas decisiones personales", "La temperatura promedio es 18°C"], respuesta_correcta: 2, retroalimentacion: "Atribuir la pobreza a decisiones personales es una interpretación ideológica, no un hecho." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P04
    preguntas: [
      { enunciado: "¿Qué es la oración temática de un párrafo?", opciones: ["La oración más larga del párrafo", "La que expresa la idea principal", "La primera oración siempre", "La oración con más adjetivos"], respuesta_correcta: 1, retroalimentacion: "La oración temática expresa la idea principal; puede estar al inicio, al final o en medio." },
      { enunciado: "¿Qué tipo de párrafo presenta el tema del texto?", opciones: ["Párrafo de desarrollo", "Párrafo de conclusión", "Párrafo introductorio", "Párrafo descriptivo"], respuesta_correcta: 2, retroalimentacion: "El párrafo introductorio presenta el tema y anticipa lo que se desarrollará." },
      { enunciado: "¿Qué conector indica contraste?", opciones: ["Además", "Por lo tanto", "Sin embargo", "También"], respuesta_correcta: 2, retroalimentacion: "'Sin embargo' es un conector de contraste que introduce una idea opuesta a la anterior." },
      { enunciado: "¿Cuál es la función del párrafo de conclusión?", opciones: ["Presentar el tema", "Ampliar las ideas principales", "Cerrar el texto retomando las ideas centrales", "Agregar información nueva"], respuesta_correcta: 2, retroalimentacion: "El párrafo de conclusión cierra el texto sintetizando las ideas más importantes." },
      { enunciado: "El conector 'por lo tanto' indica:", opciones: ["Adición de ideas", "Contraste", "Consecuencia", "Tiempo"], respuesta_correcta: 2, retroalimentacion: "'Por lo tanto' indica que lo que sigue es una consecuencia de lo anterior." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P05
    preguntas: [
      { enunciado: "¿Qué es subrayar en un texto?", opciones: ["Decorar el texto con colores", "Marcar las ideas más importantes para identificarlas", "Copiar todo el texto en otro cuaderno", "Leer el texto varias veces sin marcar nada"], respuesta_correcta: 1, retroalimentacion: "Subrayar es una estrategia de lectura activa para identificar las ideas clave." },
      { enunciado: "¿Cuál de estas preguntas ayuda a identificar la idea central de un párrafo?", opciones: ["¿Cuántas palabras tiene?", "¿De qué trata principalmente este párrafo?", "¿Tiene conectores?", "¿Cuántos adjetivos usa?"], respuesta_correcta: 1, retroalimentacion: "Preguntarnos de qué trata el párrafo nos dirige hacia su idea central." },
      { enunciado: "Un resumen correcto:", opciones: ["Copia fragmentos literales del texto", "Reescribe las ideas principales con palabras propias", "Resume solo la introducción del texto", "Incluye todas las ideas del texto sin selección"], respuesta_correcta: 1, retroalimentacion: "Resumir implica reescribir lo esencial con nuestras propias palabras, demostrando comprensión." },
      { enunciado: "¿Cuál de los siguientes es un 'detalle de apoyo' en un texto?", opciones: ["La idea principal del párrafo", "Un ejemplo que ilustra la idea central", "La oración temática", "El título del texto"], respuesta_correcta: 1, retroalimentacion: "Los detalles de apoyo son ejemplos, datos o explicaciones que respaldan la idea principal." },
      { enunciado: "¿Para qué sirve un mapa conceptual después de leer?", opciones: ["Para memorizar sin entender", "Para organizar y retener las ideas aprendidas visualmente", "Para sustituir la lectura completa", "Para decorar el cuaderno"], respuesta_correcta: 1, retroalimentacion: "Los mapas conceptuales ayudan a organizar visualmente las relaciones entre ideas." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P06
    preguntas: [
      { enunciado: "¿Cuál de estas oraciones tiene un error de concordancia?", opciones: ["Las alumnas fueron al laboratorio", "El maestro explicó la lección", "Los niño corrió en el patio", "Ella preparó su tarea"], respuesta_correcta: 2, retroalimentacion: "'Los niño' tiene un error: el artículo plural no concuerda con el sustantivo sin pluralizar." },
      { enunciado: "¿Qué conector expresa adición?", opciones: ["Sin embargo", "Aunque", "Además", "Por lo tanto"], respuesta_correcta: 2, retroalimentacion: "'Además' añade información a lo ya dicho, expresando adición." },
      { enunciado: "¿Cuál es la función de los conectores en el texto?", opciones: ["Decorar el texto", "Unir ideas de forma lógica y coherente", "Indicar el tema principal", "Reemplazar los sustantivos"], respuesta_correcta: 1, retroalimentacion: "Los conectores unen ideas dentro de oraciones y entre párrafos, dando coherencia al texto." },
      { enunciado: "En la oración 'Ella y él fue al cine', el error es:", opciones: ["En el uso del artículo", "En la concordancia sujeto-verbo", "En el tiempo verbal", "No hay error"], respuesta_correcta: 1, retroalimentacion: "Sujeto plural (ella y él) requiere verbo plural: 'fueron', no 'fue'." },
      { enunciado: "¿Por qué analizar textos que admiramos ayuda a mejorar la escritura?", opciones: ["Porque los memorizamos", "Porque observamos recursos que luego podemos imitar creativamente", "Porque aprendemos de memoria las reglas gramaticales", "No ayuda en realidad"], respuesta_correcta: 1, retroalimentacion: "Observar cómo escritores logran textos claros y coherentes nos permite aprender por imitación reflexiva." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P07
    preguntas: [
      { enunciado: "¿Qué elemento de la lectura en voz alta se refiere a la pronunciación clara de cada sílaba?", opciones: ["Entonación", "Ritmo", "Dicción", "Pausa"], respuesta_correcta: 2, retroalimentacion: "La dicción es la pronunciación clara y correcta de los sonidos y sílabas." },
      { enunciado: "¿Cuál es la función de las pausas en la lectura en voz alta?", opciones: ["Descansar al lector", "Permitir al oyente procesar lo que escuchó", "Indicar el final del texto", "Mostrar que el lector no recuerda el texto"], respuesta_correcta: 1, retroalimentacion: "Las pausas dan tiempo al oyente para asimilar lo que acaba de escuchar." },
      { enunciado: "Emitir una opinión fundamentada sobre una lectura implica:", opciones: ["Decir si te gustó o no sin más", "Dar argumentos basados en el texto", "Memorizar fragmentos", "Repetir lo que dijo el docente"], respuesta_correcta: 1, retroalimentacion: "Una opinión fundamentada requiere argumentos específicos extraídos del texto leído." },
      { enunciado: "¿Qué actitud caracteriza a un buen oyente de lectura en voz alta?", opciones: ["Distraerse en otras cosas", "Seguir el hilo del texto y detectar inconsistencias", "Solo escuchar sin pensar", "Leer otro texto al mismo tiempo"], respuesta_correcta: 1, retroalimentacion: "La escucha activa implica seguir el hilo y estar atento a posibles inconsistencias o ideas interesantes." },
      { enunciado: "La entonación en la lectura en voz alta sirve para:", opciones: ["Leer más rápido", "Expresar preguntas, exclamaciones y afirmaciones con variación de tono", "Pronunciar sílabas claramente", "Hacer pausas en los puntos"], respuesta_correcta: 1, retroalimentacion: "La entonación varía el tono según el tipo de oración, dando expresividad a la lectura." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P08
    preguntas: [
      { enunciado: "¿Cuál es la primera fase en la preparación de una exposición oral?", opciones: ["Practicar frente al espejo", "Planificación: definir el tema e investigar", "Diseñar las diapositivas", "Hablar improvisadamente"], respuesta_correcta: 1, retroalimentacion: "La planificación es el primer paso: definir el tema, investigar y seleccionar información." },
      { enunciado: "¿Qué estructura básica debe tener una exposición oral?", opciones: ["Introducción y conclusión únicamente", "Solo el desarrollo del tema", "Introducción, desarrollo y conclusión", "Un listado de puntos sin estructura"], respuesta_correcta: 2, retroalimentacion: "Toda exposición formal tiene introducción (presenta el tema), desarrollo (lo explica) y conclusión (lo cierra)." },
      { enunciado: "¿Por qué el contacto visual con el público es importante durante una exposición?", opciones: ["Para ver si el público está dormido", "Para conectar con la audiencia y transmitir seguridad", "Para leer las diapositivas proyectadas", "No es importante"], respuesta_correcta: 1, retroalimentacion: "El contacto visual genera conexión con el público y transmite confianza en lo que se dice." },
      { enunciado: "¿Qué significa 'practicar' una exposición antes de presentarla?", opciones: ["Memorizarla palabra por palabra", "Ensayarla varias veces para familiarizarse con el contenido y el tiempo", "Solo leer las diapositivas", "Pedirle a alguien más que la presente"], respuesta_correcta: 1, retroalimentacion: "Practicar significa ensayar para ganar fluidez, controlar el tiempo y reducir nervios." },
      { enunciado: "¿Qué transmite una postura corporal segura durante la exposición?", opciones: ["Que el expositor sabe todo", "Confianza y dominio del tema al público", "Que el texto está memorizado", "Que no hay nervios"], respuesta_correcta: 1, retroalimentacion: "Una postura erguida y abierta comunica confianza y refuerza el mensaje verbal." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
];

// ── REFLEXIONES (A3) ──────────────────────────────────────────────────────────

const reflexiones = [
  { // P01
    prompt: "Piensa en tu propia relación con leer y escribir: ¿cuándo lees? ¿qué tipo de textos prefieres? ¿cuándo escribís? ¿cómo se relacionan esas dos actividades en tu vida diaria? Describe al menos una experiencia concreta donde leer algo te llevó a querer escribir, o donde escribir algo te llevó a querer leer más.",
    pistas: ["¿Hubo algún libro, artículo o mensaje que te haya inspirado a escribir algo?", "¿Escribes mensajes, diarios personales, publicaciones? ¿Qué lees antes de escribir?", "¿Cómo crees que mejorarías tu escritura leyendo más?"],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 250,
    criterios_evaluacion: ["Describe una experiencia personal concreta", "Establece una conexión explícita entre leer y escribir", "Usa vocabulario del tema estudiado", "Redacción coherente y organizada"],
    formato_esperado: "libre" as const,
  },
  { // P02
    prompt: "Entrevista (real o imaginaria) a una persona de tu comunidad sobre sus hábitos de lectura: ¿qué lee?, ¿cuándo?, ¿para qué? Escribe un breve reporte de lo que encontraste. Si no puedes entrevistar a alguien, imagina cómo sería esa conversación con alguien que conoces bien.",
    pistas: ["¿Lee noticias, mensajes, libros, instrucciones? ¿En qué momento del día?", "¿Lee por placer, por trabajo, por necesidad? ¿Cómo aprendió a leer?", "¿Qué te sorprendió de sus hábitos de lectura?"],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 300,
    criterios_evaluacion: ["Describe claramente los hábitos lectores de la persona", "Menciona al menos dos tipos de textos que lee", "Reflexiona sobre lo que aprendiste de la entrevista", "Redacción clara con oraciones completas"],
    formato_esperado: "libre" as const,
  },
  { // P03
    prompt: "Elige un texto breve que hayas leído recientemente (una noticia, un post en redes, un mensaje, una publicidad) y analízalo: ¿qué es información verificable?, ¿qué son ideas del autor?, ¿qué son opiniones? ¿Crees que el texto es objetivo o tiene una intención persuasiva? Justifica tu respuesta.",
    pistas: ["¿Hay datos con números, fechas o nombres que puedas verificar?", "¿El autor interpreta o valora algo? ¿Expresa una postura personal?", "¿Te parece que quiere informarte, convencerte o ambas cosas?"],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 250,
    criterios_evaluacion: ["Identifica al menos un elemento de cada tipo (información, idea, opinión)", "Emite un juicio sobre la objetividad del texto con argumento", "Usa vocabulario del tema (información, opinión, idea)", "Cita o describe el texto analizado"],
    formato_esperado: "libre" as const,
  },
  { // P04
    prompt: "Escribe un párrafo de desarrollo (entre 80 y 150 palabras) sobre un tema que te interese. Debe tener oración temática clara, al menos tres oraciones de apoyo y un conector de adición y uno de contraste. Al final, indica cuál es tu oración temática y qué conectores usaste.",
    pistas: ["Elige un tema que conozcas bien para enfocarte en la estructura", "La oración temática puede ser la primera: 'El tema de este párrafo es...'", "Recuerda: 'además' para agregar, 'sin embargo' para contrastar"],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 200,
    criterios_evaluacion: ["El párrafo tiene oración temática identificable", "Incluye al menos un conector de adición y uno de contraste", "Las oraciones de apoyo desarrollan la idea principal", "Redacción con concordancia correcta"],
    formato_esperado: "libre" as const,
  },
  { // P05
    prompt: "Lee un párrafo de cualquier texto (puedes usar uno de las lecturas anteriores de esta UAC) y escribe: (a) cuál es la idea principal, (b) cuáles son los detalles de apoyo, y (c) un resumen de ese párrafo en tus propias palabras (máximo 50 palabras). Explica cómo identificaste la idea principal.",
    pistas: ["Busca la oración que engloba el resto del párrafo", "Los detalles de apoyo suelen ser ejemplos, datos o explicaciones", "Para resumir: ¿qué diría alguien que no leyó el párrafo pero necesita saber lo esencial?"],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 250,
    criterios_evaluacion: ["Identifica correctamente la idea principal", "Lista al menos dos detalles de apoyo", "El resumen está en palabras propias", "Explica el proceso de identificación"],
    formato_esperado: "libre" as const,
  },
  { // P06
    prompt: "Reescribe el siguiente texto corrigiendo todos los errores de concordancia y mejorando el uso de conectores: 'Las joven fueron a la tienda. Compro muchas cosa. Además no tenían dinero suficiente. Sin embargo igual compraron.' Explica qué errores encontraste y cómo los corregiste.",
    pistas: ["Revisa que cada sustantivo concuerde con su artículo y adjetivo en género y número", "Verifica que el sujeto y el verbo concuerden en número y persona", "¿Los conectores 'además' y 'sin embargo' están bien usados en el texto original?"],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 200,
    criterios_evaluacion: ["Identifica y corrige todos los errores de concordancia", "Mejora o justifica el uso de conectores", "Explica el tipo de error de cada corrección", "El texto reescrito es fluido y coherente"],
    formato_esperado: "libre" as const,
  },
  { // P07
    prompt: "Elige un texto breve (una poesía, un párrafo de cuento, una noticia) y practica leerlo en voz alta. Luego escribe: ¿cómo modulas tu voz (tono, ritmo, pausas) para ese tipo de texto? ¿Qué partes son más difíciles de leer en voz alta y por qué? ¿Qué opinión tienes del texto después de haberlo leído así?",
    pistas: ["¿Es un texto que pide emoción, información o argumentación? ¿Cómo cambia eso tu voz?", "¿Hay signos de puntuación que te indiquen dónde hacer pausas?", "¿Cambió tu comprensión del texto al escucharlo en voz alta?"],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 250,
    criterios_evaluacion: ["Describe con detalle cómo modula la voz para ese texto", "Identifica partes difíciles con una razón concreta", "Emite una opinión fundamentada sobre el texto", "Usa vocabulario técnico de la lectura en voz alta"],
    formato_esperado: "libre" as const,
  },
  { // P08
    prompt: "Planifica una mini-exposición oral de 3 minutos sobre un tema que domines (puede ser una afición, un lugar que conoces, algo que aprendiste). Escribe: el título, la introducción (3-4 oraciones), los 3 puntos principales del desarrollo y la conclusión (2-3 oraciones). Explica qué apoyos visuales usarías.",
    pistas: ["La introducción debe presentar el tema y captar la atención del oyente", "Cada punto del desarrollo debe desarrollar una idea diferente", "La conclusión retoma lo más importante y cierra el tema"],
    longitud_minima_palabras: 100,
    longitud_maxima_palabras: 300,
    criterios_evaluacion: ["Tiene estructura clara: introducción, desarrollo (3 puntos) y conclusión", "La introducción presenta el tema con claridad", "Los apoyos visuales propuestos son coherentes con el tema", "Redacción coherente y organizada"],
    formato_esperado: "libre" as const,
  },
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });

/**
 * Seed de actividades pedagógicas para IN-V (Inglés V — A2+/B1, Semestre 5).
 * Título de la UAC: "We are the champions"
 * 8 propósitos × 3 actividades = 24 actividades. estado='publicada'.
 * Tipos: lectura, video_con_preguntas, fill_blanks, glosario_interactivo,
 *        quiz_multiple_opcion, quiz_verdadero_falso, reflexion_escrita, autoevaluacion
 * Uso: npx tsx scripts/seed-activities-inv.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🌱 Seed actividades IN-V — Inglés B1 académico\n");

  const progs = await getProgresionesDeUAC(sb, "IN-V");
  let ok = 0; let fail = 0;

  for (const p of progs) {
    const base = p.codigo;
    const n = p.numero;

    const a1ok = await upsertActividad(sb, {
      codigo: `${base}-A1`,
      titulo: titulos[n - 1].a1,
      descripcion: "Actividad de contextualización y activación de conocimientos previos.",
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
      descripcion: "Actividad de práctica y comprensión lingüística.",
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
      descripcion: "Actividad de producción y cierre del propósito.",
      tipo: tiposA3[n - 1],
      progresion_id: p.id,
      xp: 20,
      estado: "publicada",
      contenido: contenidosA3[n - 1],
    });
    a3ok ? ok++ : fail++;
  }

  log(`\n✅ IN-V: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── TÍTULOS ──────────────────────────────────────────────────────────────────

const titulos = [
  {
    a1: "Describing your field of interest in English",
    a2: "Fill in the blanks: describing academic and professional fields",
    a3: "Reflexión: ¿qué campo de estudio o carrera me interesa y por qué?",
  },
  {
    a1: "Sharing experiences: present perfect for life events",
    a2: "Fill in the blanks: present perfect and personal experiences",
    a3: "Autoevaluación: ¿puedo narrar mis experiencias académicas en inglés?",
  },
  {
    a1: "Asking and answering about processes in English",
    a2: "¿Cuánto sabes sobre cómo formular preguntas en inglés?",
    a3: "Reflexión: una entrevista imaginaria sobre mi campo de interés",
  },
  {
    a1: "Expressing opinions and concerns at B1 level",
    a2: "Fill in the blanks: giving opinions with evidence",
    a3: "¿Verdadero o falso? Expresar opiniones y argumentos en inglés",
  },
  {
    a1: "Reading strategies for B1: skimming, scanning y lectura detallada",
    a2: "¿Cuánto sabes sobre estrategias de comprensión lectora?",
    a3: "Reflexión: ¿qué aprendí de un texto auténtico en inglés?",
  },
  {
    a1: "Writing functional texts: emails and proposals in English",
    a2: "Fill in the blanks: estructura del correo formal en inglés",
    a3: "Autoevaluación: ¿puedo escribir textos funcionales en inglés?",
  },
  {
    a1: "Participating in structured conversations: debates y paneles",
    a2: "¿Verdadero o falso? Estrategias para interacciones orales en inglés",
    a3: "Reflexión: mi experiencia en una presentación o debate en inglés",
  },
  {
    a1: "Integrating language skills: el proyecto final de Inglés V",
    a2: "¿Cuánto sabes sobre cómo integrar habilidades lingüísticas en B1?",
    a3: "Reflexión final: mi trayectoria en Inglés este semestre",
  },
];

const tiposA1 = ["lectura", "glosario_interactivo", "lectura", "lectura", "lectura", "lectura", "video_con_preguntas", "lectura"] as const;
const tiposA2 = ["fill_blanks", "fill_blanks", "quiz_multiple_opcion", "fill_blanks", "quiz_multiple_opcion", "fill_blanks", "quiz_verdadero_falso", "quiz_multiple_opcion"] as const;
const tiposA3 = ["reflexion_escrita", "autoevaluacion", "reflexion_escrita", "quiz_verdadero_falso", "reflexion_escrita", "autoevaluacion", "reflexion_escrita", "reflexion_escrita"] as const;

// ── CONTENIDOS A1 ─────────────────────────────────────────────────────────────

const contenidosA1 = [
  { // P01 — lectura: Describir áreas de estudio y ocupaciones (bilingüe)
    titulo: "Describing Your Field of Study or Career Interest in English",
    texto: `En Inglés V trabajamos con el inglés académico y profesional de nivel B1. Una de las primeras habilidades que desarrollarás es describir tu área de estudio o carrera de interés en inglés. Esto es fundamental para entrevistas, presentaciones escolares y proyectos colaborativos.\n\n¿CÓMO DESCRIBIR TU CAMPO DE INTERÉS?\n\nEstructura básica:\n• "I'm interested in [field] because..." (Me interesa [campo] porque...)\n• "My field of study is [area]." (Mi campo de estudio es [área].)\n• "In this area, we [work on / study / develop / investigate]..." (En esta área, [trabajamos en / estudiamos / desarrollamos / investigamos]...)\n\nVocabulario temático (campos de estudio frecuentes en México):\n• technology / tecnología — "I'm interested in technology because it solves real-world problems."\n• health / salud — "My field is health science. We study how the body functions."\n• environment / medio ambiente — "In environmental science, we investigate how human activities affect ecosystems."\n• education / educación — "I'm passionate about education because every child deserves to learn."\n• arts / artes — "In the arts, we explore creativity and cultural expression."\n• sports / deporte — "I'm interested in sports medicine because I want to help athletes recover."\n• business / negocios — "My field is business administration. We develop strategies for organizations."\n\nConectores esenciales para estructurar una descripción:\n• First (primero) — "First, I want to explain what my field is about."\n• Also (también) — "I also enjoy working with data and statistics."\n• Moreover / In addition (además) — "Moreover, this field is growing rapidly in Mexico."\n• Finally (finalmente) — "Finally, I hope to specialize in biotechnology."\n\nEJEMPLO COMPLETO — Un alumno describe su interés:\n\nMy name is Rodrigo and I study at the Centro de Bachillerato Tecnológico in Puebla. I am very interested in biotechnology because I believe it can solve some of Mexico's most important health and food challenges.\n\nIn my field of study, we investigate how living organisms — like bacteria and plants — can be used to develop medicines, improve crops, and clean contaminated water. I am also interested in how institutions like the UNAM and the CINVESTAV (Centro de Investigación y de Estudios Avanzados del IPN) in Mexico City conduct cutting-edge research in this area.\n\nFirst, I want to complete my bachillerato with strong grades in biology and chemistry. In addition, I plan to participate in a science fair this semester with a project about natural water filtration using local plants. Moreover, I have started watching videos from Mexican scientists on YouTube to understand current research. Finally, my goal is to study biochemical engineering at the Universidad Autónoma Metropolitana.\n\nI am still learning English, but I know that most scientific articles are published in English — so improving my language skills is also part of my plan.\n\nPREGUNTAS DE COMPRENSIÓN:\n1. ¿Qué campo de interés describe Rodrigo y qué razones da para elegirlo?\n2. ¿Qué conectores usa Rodrigo para organizar su descripción? Identifica al menos 3 y explica qué función cumple cada uno.\n3. ¿Qué menciona Rodrigo sobre el CINVESTAV y la UNAM? ¿Por qué crees que los menciona en su descripción?\n4. ¿Qué similitudes y diferencias hay entre el campo de interés de Rodrigo y el tuyo propio?`,
    fuente: "Material CEN Bachillerato — IN-V (A2+/B1)",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 12,
    preguntas_comprension: [
      { pregunta: "¿Qué campo de interés describe Rodrigo y qué razones da para elegirlo?", respuesta_guia: "Rodrigo describe su interés en biotecnología. Sus razones son: (1) cree que puede resolver desafíos importantes de salud y alimentación en México, (2) le interesa cómo los organismos vivos pueden usarse para desarrollar medicamentos, mejorar cultivos y limpiar agua contaminada, y (3) ha visto el trabajo de instituciones como el CINVESTAV y la UNAM en este campo." },
      { pregunta: "¿Qué conectores usa Rodrigo para organizar su descripción? Identifica al menos 3 y explica qué función cumple cada uno.", respuesta_guia: "Conectores: 'First' (señala el primer paso o idea principal), 'In addition' (añade información complementaria), 'Moreover' (enfatiza y añade más evidencia), 'Finally' (introduce la meta o conclusión). Juntos crean una descripción organizada y lógica, típica del inglés académico B1." },
      { pregunta: "¿Qué menciona Rodrigo sobre el CINVESTAV y la UNAM? ¿Por qué crees que los menciona en su descripción?", respuesta_guia: "Los menciona como instituciones mexicanas que realizan investigación de punta en biotecnología. Los incluye para dar contexto local y credibilidad a su descripción — muestra que conoce el campo en México, no solo en términos abstractos. También conecta su interés académico con la realidad científica del país." },
      { pregunta: "¿Qué similitudes y diferencias hay entre el campo de interés de Rodrigo y el tuyo propio?", respuesta_guia: "Respuesta abierta del estudiante. La clave es que practique la estructura aprendida: 'I am interested in [field] because...' y use al menos un conector. Se evalúa la coherencia y el uso del vocabulario temático, no la similitud con Rodrigo." },
    ],
  },
  { // P02 — glosario_interactivo: Vocabulario de experiencias y campo de estudio
    terminos: [
      { termino: "career", definicion: "Carrera profesional: la trayectoria laboral o el camino profesional de una persona a largo plazo. ¡Ojo! No confundir con 'carrera universitaria' = degree o major. 'Career' se refiere a la vida profesional en general.", ejemplo: "She wants to build a career in environmental engineering. (Quiere construir una carrera en ingeniería ambiental.) / I am just starting my career in medicine.", etiquetas: ["IN-V", "P02", "academic vocabulary", "false friends"] },
      { termino: "field of study", definicion: "Campo de estudio: el área académica o disciplina en la que una persona se especializa o que le interesa.", ejemplo: "His field of study is computer science. (Su campo de estudio es la informática.) / What field of study are you interested in?", etiquetas: ["IN-V", "P02", "academic vocabulary", "key phrase"] },
      { termino: "experience", definicion: "Experiencia: conocimiento o habilidad adquirida mediante la práctica o vivencias. También puede referirse a un evento específico que se vivió.", ejemplo: "Working as a tutor gave me valuable teaching experience. (Trabajar como tutor me dio experiencia valiosa en enseñanza.) / My experience at the science fair was unforgettable.", etiquetas: ["IN-V", "P02", "academic vocabulary", "key noun"] },
      { termino: "achievement", definicion: "Logro: algo que se consiguió mediante esfuerzo y dedicación. En un contexto académico o profesional, se refiere a éxitos concretos.", ejemplo: "Winning the regional science competition was a great achievement. (Ganar el concurso regional de ciencias fue un gran logro.) / List your academic achievements on your CV.", etiquetas: ["IN-V", "P02", "academic vocabulary", "key noun"] },
      { termino: "volunteer work", definicion: "Servicio social / trabajo voluntario: actividades realizadas sin recibir pago, generalmente para ayudar a una comunidad u organización. En México, el servicio social universitario es un requisito.", ejemplo: "I did volunteer work at a local food bank last summer. (Hice servicio social en un banco de alimentos el verano pasado.) / Volunteer work demonstrates commitment to your community.", etiquetas: ["IN-V", "P02", "academic vocabulary", "cultural context"] },
      { termino: "internship", definicion: "Pasantía / práctica profesional: período de trabajo en una empresa u organización, generalmente parte de los estudios, para ganar experiencia práctica. Puede ser pagada o no pagada.", ejemplo: "She completed a summer internship at a pharmaceutical company in Monterrey. (Completó una pasantía de verano en una empresa farmacéutica en Monterrey.) / An internship is a great way to apply classroom knowledge.", etiquetas: ["IN-V", "P02", "academic vocabulary", "professional context"] },
      { termino: "skill", definicion: "Habilidad: capacidad o destreza para hacer algo bien, ya sea técnica (programar, diseñar) o interpersonal (comunicarse, liderar). Puede ser natural o aprendida.", ejemplo: "Critical thinking is an essential skill for university studies. (El pensamiento crítico es una habilidad esencial para los estudios universitarios.) / I want to develop my public speaking skills this semester.", etiquetas: ["IN-V", "P02", "academic vocabulary", "key noun"] },
      { termino: "opportunity", definicion: "Oportunidad: circunstancia o momento favorable para hacer algo o alcanzar un objetivo. Muy usado en contextos académicos y profesionales.", ejemplo: "Studying abroad is a wonderful opportunity to grow personally and professionally. (Estudiar en el extranjero es una oportunidad maravillosa para crecer personal y profesionalmente.) / This program gives students the opportunity to work with real scientists.", etiquetas: ["IN-V", "P02", "academic vocabulary", "key noun"] },
    ],
    actividad_final: "Elige 4 términos del glosario. Para cada uno, escribe una oración en inglés sobre TI MISMO(A): tu propia experiencia, habilidades, logros o campo de interés. Usa al menos un conector de los estudiados (first, also, in addition, finally) para conectar tus 4 oraciones en un pequeño párrafo.",
  },
  { // P03 — lectura: Formular preguntas sobre procesos en inglés (B1)
    titulo: "Asking and Answering Questions About Processes in English",
    texto: `En el nivel B1, una habilidad clave es formular preguntas sobre procesos, procedimientos y conceptos. Esto es esencial para entrevistas, discusiones académicas y proyectos de investigación.\n\n¿CÓMO FORMULAR PREGUNTAS SOBRE PROCESOS?\n\nPreguntas con HOW:\n• How does [process] work? (¿Cómo funciona [proceso]?)\n• How do you [do something]? (¿Cómo se hace [algo]?)\n• How is [product] made? (¿Cómo se fabrica [producto]?)\n\nPreguntas con WHAT:\n• What are the steps to [procedure]? (¿Cuáles son los pasos para [procedimiento]?)\n• What is the purpose of [element]? (¿Cuál es el propósito de [elemento]?)\n• What happens when [condition]? (¿Qué ocurre cuando [condición]?)\n\nPreguntas con WHY:\n• Why is [concept] important in your field? (¿Por qué es importante [concepto] en tu campo?)\n• Why do we need to [action]? (¿Por qué necesitamos [acción]?)\n\nPreguntas con CAN YOU EXPLAIN:\n• Can you explain the process of [procedure]? (¿Puedes explicar el proceso de [procedimiento]?)\n• Can you explain why [concept] is used? (¿Puedes explicar por qué se usa [concepto]?)\n\nVOZ PASIVA BÁSICA en descripciones de procesos:\n• "It is used to..." (Se usa para...) — propósito\n• "It is made by..." (Es hecho/fabricado por...) — proceso de fabricación\n• "It was discovered when..." (Fue descubierto cuando...) — historia\n• "Water is purified by filtering out bacteria." (El agua se purifica filtrando las bacterias.)\n\nCONECTORES DE PROCEDIMIENTO:\n• First, the water is collected from the river. (Primero, el agua se recoge del río.)\n• Then, large particles are removed with a screen. (Luego, las partículas grandes se eliminan con una malla.)\n• After that, the water passes through a sand filter. (Después, el agua pasa por un filtro de arena.)\n• Finally, chlorine is added to kill any remaining bacteria. (Finalmente, se añade cloro para eliminar las bacterias restantes.)\n• As a result, the water is safe for drinking. (Como resultado, el agua es segura para beber.)\n\nEJEMPLO — ENTREVISTA SIMULADA: El sistema de purificación de agua\n\nContexto: En muchas comunidades rurales de México, el acceso a agua potable es un desafío. Una estudiante de ingeniería ambiental entrevista a un experto sobre cómo funciona un sistema sencillo de purificación de agua.\n\nEstudiante: How does a simple water purification system work?\nExperto: First, water is collected from a natural source, such as a river or a well. Then, large particles — like sand and leaves — are removed using a basic filter. After that, the water passes through a layer of activated charcoal, which absorbs chemical impurities. Finally, a small amount of chlorine is added to kill bacteria and viruses. As a result, the water is safe for drinking.\n\nEstudiante: Why is it important to use activated charcoal?\nExperto: Activated charcoal is used because it has a very large surface area. It absorbs (absorbe) a wide range of chemicals, including pesticides and heavy metals. Without it, the water might look clean but still contain harmful substances.\n\nEstudiante: Can you explain what happens if people drink unpurified water?\nExperto: Yes. Unpurified water can contain bacteria like E. coli and parasites like Giardia. These are responsible for gastrointestinal diseases, which are one of the leading causes of illness in rural communities in Mexico. That is why water purification is not just a technical process — it is a public health priority.\n\nEstudiante: What are the main challenges for providing clean water in rural Mexico?\nExperto: The main challenges are the high cost of filtration equipment, the lack of technical training in communities, and the distance from urban water systems. However, low-cost solutions using natural materials like sand, gravel, and local plants are being developed by researchers at universities across Mexico.\n\nPREGUNTAS DE COMPRENSIÓN:\n1. ¿Cuáles son los cuatro pasos del sistema de purificación de agua descrito en la entrevista? Usa conectores de procedimiento.\n2. ¿Por qué es importante el carbón activado en el proceso? ¿Qué hace exactamente?\n3. Identifica dos ejemplos de voz pasiva en el texto. ¿Qué sujeto recibe la acción en cada caso?`,
    fuente: "Material CEN Bachillerato — IN-V (A2+/B1)",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 13,
    preguntas_comprension: [
      { pregunta: "¿Cuáles son los cuatro pasos del sistema de purificación de agua descrito en la entrevista? Usa conectores de procedimiento.", respuesta_guia: "First, water is collected from a natural source. Then, large particles are removed with a basic filter. After that, the water passes through activated charcoal. Finally, chlorine is added to kill bacteria. As a result, the water is safe to drink." },
      { pregunta: "¿Por qué es importante el carbón activado en el proceso? ¿Qué hace exactamente?", respuesta_guia: "El carbón activado es importante porque tiene una superficie muy grande que absorbe impurezas químicas, incluyendo pesticidas y metales pesados. Sin él, el agua puede verse limpia pero todavía contener sustancias dañinas que no son visibles." },
      { pregunta: "Identifica dos ejemplos de voz pasiva en el texto. ¿Qué sujeto recibe la acción en cada caso?", respuesta_guia: "Ejemplos: 'water is collected' (el agua recibe la acción de recoger), 'large particles are removed' (las partículas reciben la acción de eliminar), 'chlorine is added' (el cloro recibe la acción de añadir), 'the water is purified' (el agua recibe la acción de purificar). La voz pasiva enfatiza el proceso, no el agente que lo realiza." },
    ],
  },
  { // P04 — lectura: Expresar opiniones y preocupaciones en inglés (B1)
    titulo: "Expressing Opinions and Concerns at B1 Level: Structure and Language",
    texto: `Una competencia central en el nivel B1 es expresar opiniones de forma organizada y con evidencia. Esto es útil en debates escolares, ensayos, presentaciones y conversaciones sobre temas de interés.\n\nESTRUCTURA: OPINIÓN + EVIDENCIA + CONCLUSIÓN\n\nEsta estructura te ayuda a expresar ideas de forma clara y convincente:\n1. Opinión: lo que piensas o crees\n2. Evidencia: datos, ejemplos o razones que apoyan tu opinión\n3. Conclusión: tu postura final o llamado a la acción\n\nFRASES PARA EXPRESAR OPINIONES:\n• "In my opinion, [idea]..." (En mi opinión, [idea]...)\n• "I believe that [idea]..." (Creo que [idea]...)\n• "I think it is important to [action] because..." (Creo que es importante [acción] porque...)\n• "From my point of view, [idea]..." (Desde mi punto de vista, [idea]...)\n\nFRASES PARA PRESENTAR EVIDENCIA:\n• "The evidence suggests that..." (La evidencia sugiere que...)\n• "According to [source], [fact]..." (Según [fuente], [hecho]...)\n• "For example, [specific case]..." (Por ejemplo, [caso específico]...)\n• "Studies show that..." (Los estudios muestran que...)\n\nMODALES PARA EXPRESAR POSIBILIDAD Y RECOMENDACIÓN:\n• should — recomendación: "Governments should invest in renewable energy."\n• could — posibilidad: "Young people could make a difference by changing their habits."\n• might — posibilidad menos segura: "This might be one of the biggest challenges of our century."\n• would — condición: "If everyone recycled, pollution would decrease significantly."\n\nCONECTORES DE CONTRASTE:\n• however (sin embargo): "Fossil fuels are cheap. However, they are extremely polluting."\n• although (aunque): "Although renewable energy is expensive at first, it saves money long-term."\n• despite (a pesar de): "Despite the challenges, many young people are taking action."\n• on the other hand (por otro lado): "On the other hand, some people argue that economic growth must come first."\n\nEJEMPLO DE TEXTO DE OPINIÓN — Cambio climático y acción juvenil en México:\n\nIn my opinion, climate change is the most pressing challenge of our generation. I believe that young people in Mexico and around the world have a crucial role to play in addressing this crisis.\n\nThe evidence suggests that Mexico is already experiencing the serious effects of climate change. According to SEMARNAT (Mexico's Ministry of Environment), the frequency of extreme weather events — such as droughts in Sonora and floods in Tabasco — has increased significantly in recent decades. For example, the 2020 drought affected millions of people in northern Mexico, threatening agriculture and water supply.\n\nHowever, there are also reasons to be optimistic. Young Mexicans are increasingly involved in environmental activism. Movements like Fridays for Future, inspired by Swedish activist Greta Thunberg, have reached cities like Guadalajara, Monterrey, and Mexico City. Although some critics argue that student protests do not produce immediate results, I believe they raise awareness and put pressure on policymakers.\n\nOn the other hand, individual action alone is not enough. Governments and corporations should take responsibility for the largest share of carbon emissions. Despite the importance of personal choices — like recycling or using public transport — systemic change is also necessary.\n\nIn conclusion, climate change requires collective action at all levels: individual, community, national, and international. Young people might not have the power to change policies overnight, but our voices, our creativity, and our commitment could make all the difference.\n\nPREGUNTAS DE COMPRENSIÓN:\n1. ¿Cuál es la opinión principal del texto? ¿Cómo la apoya el autor con evidencia?\n2. Identifica dos conectores de contraste en el texto y explica el contraste que cada uno establece.\n3. ¿Estás de acuerdo con la conclusión del texto? Formula tu propia opinión usando al menos una frase de opinión y un modal aprendido.`,
    fuente: "Material CEN Bachillerato — IN-V (A2+/B1)",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 13,
    preguntas_comprension: [
      { pregunta: "¿Cuál es la opinión principal del texto? ¿Cómo la apoya el autor con evidencia?", respuesta_guia: "La opinión principal es que el cambio climático es el desafío más urgente de la generación actual y que los jóvenes tienen un papel crucial. El autor la apoya con: datos de SEMARNAT sobre eventos climáticos extremos, el ejemplo concreto de la sequía de 2020 en el norte de México, y la mención del movimiento Fridays for Future en ciudades mexicanas." },
      { pregunta: "Identifica dos conectores de contraste en el texto y explica el contraste que cada uno establece.", respuesta_guia: "Ejemplos: 'However' (párrafo 3) establece contraste entre los efectos negativos del cambio climático y las razones para ser optimista. 'Although' (párrafo 3) contrasta la crítica a las protestas estudiantiles con la creencia de que sensibilizan y presionan a los legisladores. 'On the other hand' (párrafo 4) contrasta la acción individual con la necesidad de cambio sistémico." },
      { pregunta: "¿Estás de acuerdo con la conclusión del texto? Formula tu propia opinión usando al menos una frase de opinión y un modal aprendido.", respuesta_guia: "Respuesta abierta del estudiante. Se evalúa el uso correcto de una frase de opinión (In my opinion / I believe that) y al menos un modal (should / could / might / would) en contexto apropiado. Ejemplo: 'In my opinion, young people should focus on both individual actions and political engagement, because both could contribute to real change.'" },
    ],
  },
  { // P05 — lectura: Estrategias de comprensión lectora B1
    titulo: "Reading Strategies for B1: Skimming, Scanning and Close Reading",
    texto: `Leer en inglés a nivel B1 no significa entender cada palabra — significa usar estrategias inteligentes para extraer la información que necesitas. Las tres estrategias principales son: skimming, scanning y lectura detallada.\n\nESTRATEGIA 1: SKIMMING — Lectura rápida para la idea general\n\nSkimming significa leer rápidamente un texto para identificar su tema principal y estructura, sin leer cada palabra. Es útil cuando tienes poco tiempo o cuando necesitas decidir si un texto es relevante antes de leerlo con detalle.\n\nCómo hacer skimming:\n• Lee el título y los subtítulos (headings)\n• Lee el primer y último párrafo completos\n• Lee la primera oración de cada párrafo intermedio (topic sentence)\n• Mira imágenes, gráficos y palabras en negrita o cursiva\n\nEjemplo práctico: Tienes 30 segundos para decidir si este artículo es útil para tu proyecto. ¿De qué trata? Haz skimming y encuentra la respuesta.\n\nESTRATEGIA 2: SCANNING — Búsqueda de información específica\n\nScanning significa mover los ojos rápidamente por el texto buscando información específica: un nombre, una fecha, un número, una cifra o un término clave. No lees todo — solo buscas lo que necesitas.\n\nCuándo usar scanning:\n• Buscar la fecha de un evento histórico en un artículo\n• Encontrar el nombre de una organización o persona\n• Localizar estadísticas o porcentajes\n• Responder preguntas de opción múltiple sobre un texto largo\n\nTrucos para scanning eficaz:\n• Sabe exactamente qué estás buscando ANTES de empezar\n• Mueve los ojos en zigzag o en "S" por el texto\n• Para cuando encuentres lo que buscas — no sigas leyendo\n\nESTRATEGIA 3: LECTURA DETALLADA — Párrafo por párrafo\n\nLa lectura detallada (close reading) implica leer con atención para entender argumentos, matices e ideas complejas. Se usa para textos académicos, instrucciones importantes o pasajes que necesitas analizar.\n\nCómo identificar HECHOS vs. OPINIONES:\n• HECHO (fact): puede verificarse con datos o evidencia objetiva. Ejemplo: "Mexico has over 130 million inhabitants." (Esto se puede comprobar con el censo.)\n• OPINIÓN (opinion): refleja el punto de vista de alguien. Ejemplo: "Mexico City is the best place to study in Latin America." (Esto varía según la persona.)\n• Palabras que señalan opinión: believe, think, argue, suggest, in my view, according to [person]\n• Palabras que señalan hechos: show, prove, demonstrate, according to [official data/study]\n\nVOCABULARIO ACADÉMICO TIER 2 (frecuente en textos de bachillerato y universidad):\n• analyze (analizar): "We will analyze the causes of deforestation in the Yucatán Peninsula."\n• identify (identificar): "Can you identify the main argument in this paragraph?"\n• compare (comparar): "Compare the biodiversity of the rainforest and the desert."\n• evaluate (evaluar): "Evaluate whether the government's measures are sufficient."\n• summarize (resumir): "Summarize the main ideas of the text in 3 sentences."\n\nPRÁCTICA — Texto corto sobre biodiversidad en México:\n\nMexico is considered a megadiverse country — one of only 17 nations in the world that together host approximately 70% of all plant and animal species on Earth. This remarkable biodiversity is distributed across Mexico's diverse ecosystems: tropical rainforests in Chiapas and the Yucatán, deserts in Sonora and Baja California, high-altitude forests around Popocatépetl, and coral reefs in the Caribbean.\n\nHowever, scientists argue that this biodiversity is under serious threat. According to CONABIO (National Commission for the Knowledge and Use of Biodiversity), Mexico has lost approximately 35% of its original forest cover due to agricultural expansion, urbanization, and illegal logging. The jaguar, the axolotl, and the vaquita marina are among the most endangered species in Mexico.\n\nDespite these challenges, Mexico has made progress. The government has established over 180 natural protected areas (áreas naturales protegidas), covering more than 25% of the national territory. NGOs and local communities also play an important role in conservation efforts.\n\nPREGUNTAS:\n1. Usa SKIMMING: ¿Cuál es el tema principal del texto? (máx. 10 segundos)\n2. Usa SCANNING: ¿Qué porcentaje de la cobertura forestal original ha perdido México?\n3. LECTURA DETALLADA: Identifica una afirmación de hecho y una de opinión en el texto. ¿Cómo lo sabes?`,
    fuente: "Material CEN Bachillerato — IN-V (A2+/B1)",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 14,
    preguntas_comprension: [
      { pregunta: "Usa SKIMMING: ¿Cuál es el tema principal del texto? (máx. 10 segundos)", respuesta_guia: "El tema principal es la biodiversidad de México: su riqueza natural, las amenazas que enfrenta (deforestación, especies en peligro) y las medidas de conservación. El skimming permite identificar esto leyendo el título, el primer párrafo y las primeras oraciones de cada sección." },
      { pregunta: "Usa SCANNING: ¿Qué porcentaje de la cobertura forestal original ha perdido México?", respuesta_guia: "México ha perdido aproximadamente el 35% de su cobertura forestal original, según CONABIO. Para encontrar este dato con scanning, se buscan números y porcentajes en el texto (el símbolo % o palabras como 'percent', 'approximately')." },
      { pregunta: "LECTURA DETALLADA: Identifica una afirmación de hecho y una de opinión en el texto. ¿Cómo lo sabes?", respuesta_guia: "Hecho: 'Mexico has lost approximately 35% of its original forest cover' — verificable con datos de CONABIO (fuente oficial). Opinión: 'scientists argue that this biodiversity is under serious threat' — usa 'argue', señal de punto de vista, aunque sea una opinión muy respaldada por evidencia. También 'Mexico is considered a megadiverse country' es un hecho reconocido internacionalmente." },
    ],
  },
  { // P06 — lectura: Escribir textos funcionales en inglés
    titulo: "Writing Functional Texts in English: Emails, Requests and Short Proposals",
    texto: `Los textos funcionales (functional texts) son textos escritos para lograr un propósito concreto: informar, solicitar, proponer, agradecer o confirmar. En el nivel B1, aprenderás a escribir correos formales y propuestas breves en inglés.\n\nESTRUCTURA DEL CORREO FORMAL EN INGLÉS\n\n1. Subject (Asunto): breve y claro. Indica el propósito del correo.\n   Ejemplo: "Inquiry About Environmental Science Program"\n\n2. Salutation (Saludo formal):\n   • Dear Mr. [Apellido], — para hombre\n   • Dear Ms. [Apellido], — para mujer (formal, sin especificar estado civil)\n   • Dear Dr. [Apellido], — para doctor(a)\n   • Dear Sir/Madam, — cuando no sabes el nombre\n\n3. Purpose (Propósito — primer párrafo):\n   Explica por qué escribes. Sé directo y claro.\n   Ejemplo: "I am writing to request information about your master's program in environmental science."\n\n4. Body (Desarrollo):\n   Amplía el propósito con detalles relevantes. Organiza con conectores.\n   Ejemplo: "I am currently a high school student in my fifth semester at COBACH Oaxaca. I have a strong interest in environmental issues, particularly water management and biodiversity conservation."\n\n5. Closing (Cierre cortés):\n   Agradece y expresa expectativa de respuesta.\n   Ejemplo: "Thank you very much for your time. I look forward to hearing from you."\n\n6. Sign-off (Despedida formal):\n   • Sincerely, — formal, para cuando conoces el nombre del destinatario\n   • Best regards, — semi-formal, muy usado en contextos académicos y profesionales\n   • Yours faithfully, — muy formal, para Dear Sir/Madam\n\n7. Signature (Firma): Nombre completo + datos de contacto si es necesario.\n\nDIFERENCIAS REGISTRO FORMAL vs. INFORMAL:\n| Formal | Informal |\n|--------|----------|\n| I am writing to request... | Hey, I wanted to ask... |\n| Could you please... | Can you...? |\n| I would appreciate... | I'd love it if... |\n| I look forward to... | Can't wait to... |\n| Sincerely, | Best, / See you, |\n\nEJEMPLO 1 — Correo formal real: solicitar información sobre una carrera universitaria\n\nSubject: Inquiry About Admission Requirements — Biology Program\n\nDear Dr. Fuentes,\n\nI am writing to request information about the admission requirements for the Biology program at the Universidad Autónoma de Baja California. My name is Andrea Salinas, and I am currently completing my fifth semester of bachillerato at CBTis 58 in Mexicali.\n\nI am particularly interested in your program because I would like to specialize in marine biology and contribute to the conservation of species in the Gulf of California. Could you please send me information about the required entrance exam (examen de admisión) and any scholarship opportunities available for incoming students?\n\nI would also appreciate any advice about how to best prepare for the application process.\n\nThank you very much for your time and assistance.\n\nSincerely,\nAndrea Salinas\nandrea.salinas@email.com\n\nEJEMPLO 2 — Propuesta breve: proponer un proyecto ambiental para la escuela\n\nProposal: School Recycling Program — "Green COBACH"\n\nPurpose: We propose creating a school-wide recycling program to reduce waste and raise environmental awareness among students and teachers.\n\nObjective: To install three recycling stations (paper, plastic, and organic waste) in the main areas of the school by the end of the semester.\n\nActions:\n1. We would like to organize a presentation for students and teachers to explain the importance of recycling.\n2. We could design the recycling stations ourselves using recycled materials.\n3. Each month, we would monitor the amount of waste collected and share results with the school community.\n\nExpected results: We believe this project could reduce the school's waste by at least 30% and inspire students to continue recycling at home.\n\nVOCABULARIO DE CORTESÍA PARA TEXTOS FUNCIONALES:\n• "I would like to..." (Me gustaría...) — expresar un deseo o intención de forma educada\n• "Could you please..." (¿Podría por favor...?) — hacer una solicitud formal\n• "I would appreciate..." (Agradecería...) — expresar gratitud anticipada\n• "I look forward to hearing from you." (Quedo en espera de su respuesta.) — cierre estándar de correo formal\n• "Please do not hesitate to contact me if you have any questions." (No dude en contactarme si tiene preguntas.)\n\nPREGUNTAS DE COMPRENSIÓN:\n1. ¿Cuáles son las 6 partes de un correo formal en inglés? Menciónalas en orden.\n2. ¿Qué diferencia hay entre usar "Sincerely" y "Best regards"? ¿Cuándo usarías cada uno?\n3. ¿Qué características tiene la propuesta del ejemplo que la hacen clara y profesional?`,
    fuente: "Material CEN Bachillerato — IN-V (A2+/B1)",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 14,
    preguntas_comprension: [
      { pregunta: "¿Cuáles son las 6 partes de un correo formal en inglés? Menciónalas en orden.", respuesta_guia: "1. Subject (Asunto), 2. Salutation (Saludo formal: Dear Mr./Ms./Dr.), 3. Purpose (Propósito: por qué escribes), 4. Body (Desarrollo: detalles relevantes), 5. Closing (Cierre cortés: agradecimiento + expectativa de respuesta), 6. Sign-off + Signature (Sincerely / Best regards + nombre)." },
      { pregunta: "¿Qué diferencia hay entre usar 'Sincerely' y 'Best regards'? ¿Cuándo usarías cada uno?", respuesta_guia: "'Sincerely' es más formal y se usa cuando conoces el nombre del destinatario (Dear Dr. Fuentes). 'Best regards' es semi-formal y se usa en contextos académicos y profesionales donde hay cierta familiaridad o relación establecida. 'Yours faithfully' se usa cuando no conoces el nombre (Dear Sir/Madam)." },
      { pregunta: "¿Qué características tiene la propuesta del ejemplo que la hacen clara y profesional?", respuesta_guia: "La propuesta es clara y profesional porque: (1) tiene secciones bien definidas (Purpose, Objective, Actions, Expected results), (2) usa lenguaje de cortesía y condicional ('we would like', 'we could'), (3) incluye datos específicos (tres estaciones de reciclaje, reducción del 30%), (4) propone acciones concretas con verbos de acción (organize, design, monitor), y (5) conecta el proyecto con la comunidad escolar." },
    ],
  },
  { // P07 — video_con_preguntas: Presentaciones orales y debates en inglés
    url_video: "https://www.youtube.com/watch?v=placeholder-inv-oral",
    titulo_video: "How to give an effective presentation and participate in debates in English",
    descripcion: "Video con estrategias para presentaciones orales y debates en inglés: cómo estructurar una presentación de 3-5 minutos, cómo tomar y ceder la palabra (turn-taking), frases de acuerdo/desacuerdo respetuosas, y cómo superar el nerviosismo al hablar en público.",
    duracion_segundos: 780,
    preguntas: [
      { tiempo_segundos: 180, pregunta: "According to the video, what are the three key parts of an effective short presentation (3-5 minutes) in English? Describe what each part should include.", respuesta_guia: "1) Introduction: presentarte, anunciar el tema y captar la atención ('Today I want to talk about...' / 'Did you know that...?'). 2) Body: 2-3 puntos principales con evidencia y ejemplos. Usar conectores: first, then, in addition. 3) Conclusion: resumir los puntos clave y cerrar con un mensaje memorable o llamado a la acción ('In conclusion...' / 'I encourage you to...')." },
      { tiempo_segundos: 450, pregunta: "What is 'turn-taking' in English conversations and debates? What phrases does the video suggest for (a) taking the floor and (b) giving the floor to someone else?", respuesta_guia: "Turn-taking es el sistema de tomar y ceder el turno para hablar en una conversación o debate. Para TOMAR EL TURNO: 'Can I add something here?', 'I'd like to make a point about that.', 'Actually, I disagree because...'. Para CEDER EL TURNO: 'What do you think about this, [name]?', 'I'd like to hear your opinion on...', 'Does anyone want to respond to that?'." },
      { tiempo_segundos: 680, pregunta: "The video mentions three strategies for managing nervousness when speaking English in public. What are they and which one do you think would be most useful for YOU personally? Explain why.", respuesta_guia: "Estrategias mencionadas típicamente: (1) Practice out loud before — practicar en voz alta, no solo mentalmente. (2) Focus on the message, not the mistakes — pensar en lo que quieres comunicar, no en el miedo a cometer errores. (3) Use short sentences — usar oraciones cortas y claras cuando te pones nervioso(a). Respuesta personal del estudiante: se evalúa la reflexión y el uso de vocabulario B1." },
    ],
  },
  { // P08 — lectura: Integrar habilidades para el proyecto final de Inglés V
    titulo: "Integrating Language Skills: Your Final Project for Inglés V",
    texto: `El proyecto final de Inglés V es la oportunidad de demostrar todo lo que aprendiste durante el semestre: leer, escribir, hablar y escuchar en inglés. En esta lectura explorarás los tipos de proyectos posibles, las etapas del proceso y cómo dar y recibir retroalimentación en inglés.\n\nTIPOS DE PROYECTOS PARA INGLÉS V (B1)\n\n1. Cartel / Póster académico (Academic Poster)\n   Un póster que presenta información sobre un tema de tu campo de interés. Incluye: título, introducción, desarrollo visual (imágenes, gráficos), conclusiones y referencias.\n\n2. Mini-artículo académico (Short Academic Article)\n   Un texto de 300-500 palabras en inglés sobre un tema de tu elección. Debe tener: introducción con tesis, 2-3 párrafos de desarrollo con evidencia, conclusión.\n\n3. Podcast (guión + grabación)\n   Un episodio de audio de 3-5 minutos donde explicas un tema, entrevistas a alguien o compartes tu opinión. Requiere un guión (script) escrito y la grabación del audio.\n\n4. Video breve (Short Video)\n   Un video de 2-4 minutos en inglés: presentación, mini-documental, tutorial o debate grabado. Puede incluir subtítulos en español.\n\n5. Propuesta de acción (Action Proposal)\n   Un documento escrito que propone una solución a un problema real en tu comunidad o escuela. Incluye: problema, solución propuesta, acciones concretas, resultados esperados.\n\nETAPAS DEL PROCESO DE PRODUCCIÓN\n\n• Brainstorming (lluvia de ideas): escribe todas las ideas sin juzgarlas. ¿Qué temas te interesan? ¿Qué problemas ves en tu comunidad? ¿Qué aprendiste este semestre?\n\n• Selección de tema (Topic selection): elige el tema más relevante, interesante y factible. Considera: ¿puedo encontrar información confiable? ¿Puedo explicarlo en inglés con mis habilidades actuales?\n\n• Investigación (Research): busca fuentes confiables. En inglés, evalúa si la fuente es: reciente (publicada en los últimos 5-10 años), confiable (universidad, gobierno, organización reconocida), relevante (directamente relacionada con tu tema).\n\n• Borrador (Draft): produce la primera versión. No te preocupes por la perfección — enfócate en comunicar tus ideas.\n\n• Revisión (Revision): revisa el contenido (¿es claro el argumento?), la estructura (¿tiene introducción, desarrollo, conclusión?) y el lenguaje (¿la gramática y el vocabulario son apropiados para B1?).\n\n• Versión final (Final version): incorpora la retroalimentación y entrega tu trabajo.\n\nCÓMO DAR Y RECIBIR RETROALIMENTACIÓN CONSTRUCTIVA EN INGLÉS\n\nDar retroalimentación positiva y específica:\n• "That's a great point. I especially like the way you explained [specific element]." (Ese es un gran punto. Me gusta especialmente la manera en que explicaste [elemento específico].)\n• "Your introduction is very clear and engaging." (Tu introducción es muy clara y atractiva.)\n\nSugerir mejoras de forma respetuosa:\n• "Have you considered adding [element]? It might strengthen your argument." (¿Has considerado añadir [elemento]? Podría fortalecer tu argumento.)\n• "One suggestion would be to [specific action], because it would help the reader understand [specific point]." (Una sugerencia sería [acción específica], porque ayudaría al lector a entender [punto específico].)\n• "I think the conclusion could be a bit more specific about [aspect]." (Creo que la conclusión podría ser un poco más específica sobre [aspecto].)\n\nRecibir retroalimentación con apertura:\n• "Thank you for your feedback. I will consider that suggestion." (Gracias por tu retroalimentación. Consideraré esa sugerencia.)\n• "That's a good point. I hadn't thought about that." (Ese es un buen punto. No había pensado en eso.)\n\nCONEXIÓN CON LAS HABILIDADES DEL SEMESTRE:\n• Reading: investigar fuentes y analizar textos para el proyecto\n• Writing: producir el borrador, el texto final o el guión\n• Speaking: presentar el proyecto, participar en sesiones de retroalimentación oral\n• Listening: comprender los comentarios de tu maestro y compañeros, y escuchar o ver recursos en inglés\n\nPREGUNTAS DE COMPRENSIÓN:\n1. ¿Cuáles son las 6 etapas del proceso de producción de un proyecto? ¿Por qué crees que la etapa de revisión es importante?\n2. ¿Qué tipo de proyecto (de los 5 descritos) te parece más interesante o adecuado para ti y por qué?\n3. ¿Cuál es la diferencia entre dar retroalimentación positiva y dar retroalimentación constructiva? Da un ejemplo de cada una.`,
    fuente: "Material CEN Bachillerato — IN-V (A2+/B1)",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 13,
    preguntas_comprension: [
      { pregunta: "¿Cuáles son las 6 etapas del proceso de producción de un proyecto? ¿Por qué crees que la etapa de revisión es importante?", respuesta_guia: "Las 6 etapas son: 1) Brainstorming, 2) Selección de tema, 3) Investigación, 4) Borrador, 5) Revisión, 6) Versión final. La etapa de revisión es importante porque permite mejorar el contenido (¿es claro el argumento?), la estructura y el lenguaje antes de entregar el trabajo final, incorporando retroalimentación de maestros y compañeros." },
      { pregunta: "¿Qué tipo de proyecto (de los 5 descritos) te parece más interesante o adecuado para ti y por qué?", respuesta_guia: "Respuesta abierta del estudiante. Se evalúa que justifique su elección con razones concretas relacionadas con sus habilidades, intereses o campo de estudio. Ejemplo: 'I would choose the podcast because I prefer speaking to writing, and I can explain my ideas about [topic] more naturally in a conversation format.'" },
      { pregunta: "¿Cuál es la diferencia entre dar retroalimentación positiva y dar retroalimentación constructiva? Da un ejemplo de cada una.", respuesta_guia: "Retroalimentación positiva: señala lo que funciona bien y es específica ('Your introduction is very clear and engaging'). Retroalimentación constructiva: sugiere mejoras de forma respetuosa y justificada ('Have you considered adding more evidence? It might strengthen your argument'). La diferencia no es que una sea 'buena' y la otra 'mala' — ambas son útiles; la constructiva propone cambios concretos." },
    ],
  },
];

// ── CONTENIDOS A2 ─────────────────────────────────────────────────────────────

const contenidosA2 = [
  { // P01 — fill_blanks: 6 huecos — describir campos académicos/profesionales
    instrucciones: "Complete the sentences by filling in the blanks with the correct word or phrase.",
    texto_con_huecos: "My name is Sofia and I am ___ in environmental science. I study at the Universidad Nacional Autónoma de México, also known as ___. In my field, we ___ how climate change affects biodiversity in Mexico. I am also interested in renewable energy because I believe it is ___ for our future. Last semester, I ___ a research project about solar energy in Oaxaca. In the future, I hope to ___ as an environmental consultant.",
    huecos: [
      { posicion: 0, respuesta_correcta: "interested", alternativas_aceptadas: ["very interested", "really interested"], pista: "In my opinion, I am ___ in..." },
      { posicion: 1, respuesta_correcta: "UNAM", alternativas_aceptadas: ["the UNAM", "unam"], pista: "It is the largest university in Mexico" },
      { posicion: 2, respuesta_correcta: "study", alternativas_aceptadas: ["analyze", "research", "investigate"], pista: "What do scientists do with problems?" },
      { posicion: 3, respuesta_correcta: "essential", alternativas_aceptadas: ["important", "crucial", "necessary", "vital"], pista: "Not just important, but absolutely necessary" },
      { posicion: 4, respuesta_correcta: "completed", alternativas_aceptadas: ["did", "finished", "carried out"], pista: "Past simple of 'complete'" },
      { posicion: 5, respuesta_correcta: "work", alternativas_aceptadas: ["practice", "work professionally", "develop my career"], pista: "What do you do in a job?" },
    ],
    distingue_mayusculas: false,
  },
  { // P02 — fill_blanks: 6 huecos — present perfect y past simple (experiencias)
    instrucciones: "Complete the paragraph with the correct verb form. Use the present perfect (have/has + past participle) or past simple as appropriate.",
    texto_con_huecos: "I ___ always been passionate about science. When I was in secondary school, I ___ my first chemistry experiment, and it was amazing. Since then, I ___ taken many science classes and I enjoy every one of them. Last year, I ___ in a science fair at my school and won second place. I have also ___ some online courses about programming. This semester, I am going to ___ a science project for the school community.",
    huecos: [
      { posicion: 0, respuesta_correcta: "have", alternativas_aceptadas: ["'ve"], pista: "Present perfect: have/has + past participle. 'I ___ always been...' — usa la forma correcta de 'have' para 'I'" },
      { posicion: 1, respuesta_correcta: "did", alternativas_aceptadas: ["completed", "performed", "carried out"], pista: "Past simple — evento específico en el pasado ('When I was...')" },
      { posicion: 2, respuesta_correcta: "have", alternativas_aceptadas: ["'ve"], pista: "'Since then' → present perfect. 'I ___ taken' — ¿cuál es el auxiliar?" },
      { posicion: 3, respuesta_correcta: "participated", alternativas_aceptadas: ["took part"], pista: "'Last year' → pasado simple. 'I ___ in a science fair'" },
      { posicion: 4, respuesta_correcta: "taken", alternativas_aceptadas: ["completed", "done"], pista: "'I have also ___' → participo pasado de 'take'" },
      { posicion: 5, respuesta_correcta: "develop", alternativas_aceptadas: ["create", "produce", "make"], pista: "'Going to ___' → verbo base (infinitivo sin 'to')" },
    ],
    distingue_mayusculas: false,
  },
  { // P03 — quiz_multiple_opcion: 5 preguntas sobre formular preguntas en inglés
    preguntas: [
      { enunciado: "Which question is correctly formed to ask about a process?", opciones: ["How the water is purified?", "How does the water purification process work?", "How is work the water purification?", "How does works the purification?"], respuesta_correcta: 1, retroalimentacion: "'How does [noun/subject] work?' es la estructura correcta para preguntar cómo funciona un proceso. En preguntas con 'does', el verbo principal va en forma base (work, not works). 'How the water is purified?' omite el auxiliar, que es obligatorio en inglés." },
      { enunciado: "A classmate asks: 'Can you explain ___?' Choose the most natural completion.", opciones: ["why is important biodiversity?", "why is biodiversity important?", "why biodiversity is important?", "why biodiversity important is?"], respuesta_correcta: 2, retroalimentacion: "Después de 'Can you explain', se usa una cláusula sustantiva (embedded question) con ORDEN NORMAL: sujeto + verbo. 'Can you explain why biodiversity IS important?' — sin inversión. Las preguntas directas invierten el orden (Is biodiversity important?), pero las indirectas no." },
      { enunciado: "Which sentence uses the passive voice correctly to describe a process step?", opciones: ["The water purified by filters.", "The water is purified by filters.", "The water are purified by filters.", "The water purifies by filters."], respuesta_correcta: 1, retroalimentacion: "La voz pasiva en presente simple se forma con: sujeto + is/are + participio pasado (+ by + agente). 'The water IS purified BY filters.' El sujeto 'water' es singular → 'is'. El participio de 'purify' es 'purified'." },
      { enunciado: "You want to ask about the reason behind a scientific concept. Which question word is MOST appropriate?", opciones: ["How", "What", "When", "Why"], respuesta_correcta: 3, retroalimentacion: "'Why' pregunta por razones, causas o justificaciones — es el más apropiado para preguntar sobre la importancia o el propósito de un concepto. 'How' pregunta por el proceso o método. 'What' pregunta por definiciones o elementos." },
      { enunciado: "Which sequence of connectors correctly orders a procedure?", opciones: ["Finally... then... first... after that", "First... then... after that... finally", "After that... finally... first... then", "Then... first... finally... after that"], respuesta_correcta: 1, retroalimentacion: "El orden lógico de los conectores de procedimiento es: FIRST (primer paso) → THEN (siguiente paso) → AFTER THAT (paso posterior) → FINALLY (último paso / resultado). Este orden cronológico ayuda al lector a seguir el proceso claramente." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P04 — fill_blanks: 6 huecos — expresar opiniones con evidencia (medio ambiente)
    instrucciones: "Complete the opinion paragraph about the environment in Mexico with the correct word or phrase.",
    texto_con_huecos: "In my opinion, climate change is the ___ challenge of our generation. I believe that young people ___ take action now because we are the most affected generation. The evidence ___ that Mexico has experienced more droughts and floods in recent years. However, there are also reasons to be ___. For example, Mexico has increased its solar energy production. ___, I think that governments and citizens must work together. We could ___ by reducing our energy consumption and supporting renewable projects.",
    huecos: [
      { posicion: 0, respuesta_correcta: "biggest", alternativas_aceptadas: ["greatest", "most important", "most serious"], pista: "Superlativo de 'big' — el más grande" },
      { posicion: 1, respuesta_correcta: "should", alternativas_aceptadas: ["must", "need to"], pista: "Modal de recomendación fuerte — los jóvenes ___ actuar" },
      { posicion: 2, respuesta_correcta: "suggests", alternativas_aceptadas: ["shows", "indicates", "proves"], pista: "'The evidence ___' — qué hace la evidencia con los datos" },
      { posicion: 3, respuesta_correcta: "optimistic", alternativas_aceptadas: ["hopeful", "positive"], pista: "Sinónimo de 'hopeful' — ¿cómo podemos sentirnos ante las buenas noticias?" },
      { posicion: 4, respuesta_correcta: "Overall", alternativas_aceptadas: ["In conclusion", "In summary", "To sum up"], pista: "Conector de conclusión — introduce la idea final del párrafo" },
      { posicion: 5, respuesta_correcta: "start", alternativas_aceptadas: ["begin", "help", "contribute"], pista: "'We could ___' — verbo base (qué podemos hacer para empezar a cambiar)" },
    ],
    distingue_mayusculas: false,
  },
  { // P05 — quiz_multiple_opcion: 5 preguntas sobre estrategias de lectura
    preguntas: [
      { enunciado: "You have 20 seconds to decide if an article is useful for your project. Which reading strategy should you use?", opciones: ["Close reading — read every word carefully", "Scanning — search for specific data", "Skimming — read quickly for the general idea", "Translation — translate the whole text to Spanish"], respuesta_correcta: 2, retroalimentacion: "SKIMMING es la estrategia correcta cuando necesitas obtener la idea general rápidamente — lees el título, los subtítulos, el primer y último párrafo. SCANNING es para buscar información específica (un nombre, un número). Close reading es para entender en profundidad — requiere más tiempo." },
      { enunciado: "Which of these is a FACT (not an opinion)?", opciones: ["Mexico is the best country in the world for ecotourism.", "Mexico is home to approximately 10% of all plant species on Earth.", "The Mexican government should invest more in environmental education.", "In my view, Mexico's biodiversity is more impressive than Brazil's."], respuesta_correcta: 1, retroalimentacion: "Un HECHO es verificable con datos objetivos. 'Mexico is home to approximately 10% of all plant species' es un dato de organismos internacionales (CONABIO, IUCN) que puede comprobarse. Las otras opciones contienen: 'best' (juicio subjetivo), 'should' (recomendación/opinión), 'In my view' (señal explícita de opinión)." },
      { enunciado: "What does the academic verb 'analyze' mean?", opciones: ["To summarize a text in one sentence", "To examine something carefully to understand its parts and how they relate", "To find specific information in a text quickly", "To translate academic vocabulary into Spanish"], respuesta_correcta: 1, retroalimentacion: "'Analyze' significa examinar algo con cuidado para entender sus partes y cómo se relacionan entre sí — implica un proceso intelectual profundo. 'Summarize' = resumir. 'Scan' = buscar datos específicos. La traducción no es una estrategia académica equivalente." },
      { enunciado: "You need to find the date when a law was passed in a long government report. Which strategy is MOST efficient?", opciones: ["Skim the whole document", "Translate the document", "Scan for numbers and dates", "Do a close reading of every paragraph"], respuesta_correcta: 2, retroalimentacion: "SCANNING es la estrategia más eficiente para encontrar información específica como fechas, nombres o cifras. Mueves los ojos rápidamente buscando el patrón de una fecha (números, palabras como 'in 2020', 'on March 15'). Skimming y close reading serían innecesariamente lentos para esta tarea." },
      { enunciado: "Which sentence correctly uses the academic verb 'evaluate'?", opciones: ["Evaluate whether the proposed solution is effective and explain your reasoning.", "Evaluate the text quickly without reading all of it.", "Evaluate means to translate into simpler language.", "You should evaluate by writing more than five pages."], respuesta_correcta: 0, retroalimentacion: "'Evaluate' = valorar, emitir un juicio crítico sobre algo con razones. 'Evaluate whether the solution is effective and explain your reasoning' usa el término correctamente — implica análisis y justificación. Las otras opciones confunden 'evaluate' con skimming, simplificación o extensión." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P06 — fill_blanks: 6 huecos — partes del correo formal en inglés
    instrucciones: "Complete the formal email by filling in the missing parts. Each blank corresponds to a key element of formal email writing.",
    texto_con_huecos: "Subject: ___ about Environmental Science Program\n\nDear Dr. Ramírez,\n\nI am writing to ___ information about the environmental science program at your university. My name is Carlos Mendoza and I am currently a ___ student at COBACH in Oaxaca.\n\nI am very interested in your program because I have always been passionate about ___. Could you please send me the admission requirements? I would also appreciate information about ___.\n\nThank you ___ for your time.\n\nSincerely,\nCarlos Mendoza",
    huecos: [
      { posicion: 0, respuesta_correcta: "Inquiry", alternativas_aceptadas: ["Information", "Question", "Request"], pista: "Un sustantivo que resume el propósito del correo — se pone en el Subject / Asunto" },
      { posicion: 1, respuesta_correcta: "request", alternativas_aceptadas: ["ask for", "obtain", "get"], pista: "'I am writing to ___ information' — verbo formal para pedir/solicitar" },
      { posicion: 2, respuesta_correcta: "high school", alternativas_aceptadas: ["bachillerato", "preparatoria", "secondary school"], pista: "¿Qué tipo de estudiante es Carlos actualmente?" },
      { posicion: 3, respuesta_correcta: "the environment", alternativas_aceptadas: ["environmental issues", "environmental science", "nature", "ecology"], pista: "¿De qué es apasionado Carlos? (clue: el programa que le interesa)" },
      { posicion: 4, respuesta_correcta: "scholarships", alternativas_aceptadas: ["financial aid", "grants", "bursaries", "financial support"], pista: "¿Qué tipo de apoyo económico podría solicitar un estudiante a una universidad?" },
      { posicion: 5, respuesta_correcta: "very much", alternativas_aceptadas: ["so much", "a lot"], pista: "'Thank you ___ for your time' — expresión de agradecimiento formal intensificada" },
    ],
    distingue_mayusculas: false,
  },
  { // P07 — quiz_verdadero_falso: 6 afirmaciones sobre estrategias para interacciones orales
    preguntas: [
      { enunciado: "In English debates and panels, it is polite to interrupt someone in the middle of their sentence to make your point quickly.", respuesta: false, retroalimentacion: "FALSO. En debates y paneles en inglés, interrumpir abruptamente se considera descortés. La norma es esperar una pausa natural o usar frases de turn-taking: 'Can I add something here?', 'I'd like to respond to that point.' Interrumpir abruptamente puede interpretarse como falta de respeto al interlocutor." },
      { enunciado: "The phrase 'That's a great point, but I think...' is an example of respectful disagreement in English.", respuesta: true, retroalimentacion: "VERDADERO. Esta frase es un ejemplo clásico de desacuerdo respetuoso: primero reconoce el argumento del otro ('That's a great point'), luego introduce la diferencia de opinión ('but I think...'). Esta estructura valida al interlocutor antes de presentar una perspectiva diferente." },
      { enunciado: "'Backchanneling' means taking over the conversation completely when the other person is speaking.", respuesta: false, retroalimentacion: "FALSO. El backchannel (o backchanneling) son las señales que damos para indicar que estamos escuchando sin interrumpir: 'mm-hmm', 'I see', 'right', 'exactly'. No implica tomar el control de la conversación — al contrario, facilita que el hablante continúe sintiéndose escuchado." },
      { enunciado: "Using phrases like 'In my opinion' or 'I believe' before stating your view helps signal to the audience that what follows is your personal perspective.", respuesta: true, retroalimentacion: "VERDADERO. Las frases de opinión ('In my opinion', 'I believe', 'From my point of view') son señales discursivas que indican al interlocutor que la información que sigue es una perspectiva personal, no un hecho verificado. Esto es especialmente importante en debates académicos para distinguir hechos de opiniones." },
      { enunciado: "If you don't know a word in English during a presentation, the best strategy is to stop talking and say nothing until you remember it.", respuesta: false, retroalimentacion: "FALSO. La mejor estrategia es usar circunlocución (circumlocution): describir la palabra que no recuerdas. Por ejemplo: 'It's a kind of machine that...', 'It's the process of...', 'I don't remember the exact word, but it means...'. También puedes usar un sinónimo aproximado. Silenciarte completamente interrumpe el flujo de la presentación." },
      { enunciado: "The phrase 'Could you repeat that, please?' is an appropriate way to ask for clarification during an oral interaction in English.", respuesta: true, retroalimentacion: "VERDADERO. 'Could you repeat that, please?' es una frase de clarificación perfectamente apropiada en inglés — educada, directa y universalmente comprendida. Otras frases similares: 'I'm sorry, I didn't catch that.', 'Could you say that again more slowly?', 'What do you mean by [word]?'" },
    ],
    intentos_maximos: 2,
    puntaje_minimo_aprobacion: 70,
  },
  { // P08 — quiz_multiple_opcion: 5 preguntas sobre el proyecto final e integración de habilidades
    preguntas: [
      { enunciado: "Which of the following is NOT one of the five project formats mentioned for the Inglés V final project?", opciones: ["Academic poster (cartel académico)", "Short academic article (mini-artículo)", "Podcast (guión + grabación)", "Grammar workbook (cuaderno de gramática)"], respuesta_correcta: 3, retroalimentacion: "Los 5 formatos para el proyecto final de Inglés V son: cartel/póster académico, mini-artículo, podcast, video breve, y propuesta de acción. Un 'grammar workbook' no es un proyecto de producción integrado — sería solo práctica de gramática, no una demostración de habilidades comunicativas integradas." },
      { enunciado: "During which stage of the project process do you produce a first version without worrying about perfection?", opciones: ["Brainstorming", "Research", "Drafting (borrador)", "Topic selection"], respuesta_correcta: 2, retroalimentacion: "El BORRADOR (draft) es la etapa donde produces la primera versión enfocándote en comunicar tus ideas, sin preocuparte por la perfección. La revisión viene después. Esta mentalidad reduce el bloqueo del escritor y permite avanzar — después puedes mejorar la gramática, el vocabulario y la estructura." },
      { enunciado: "Which phrase is the most appropriate way to give constructive feedback in English?", opciones: ["This is completely wrong. Start over.", "Have you considered adding more evidence? It might strengthen your argument.", "Your work is perfect, don't change anything.", "I don't understand what you wrote at all."], respuesta_correcta: 1, retroalimentacion: "'Have you considered adding more evidence? It might strengthen your argument.' es retroalimentación constructiva porque: (1) usa una pregunta (no una orden), (2) propone una mejora específica, (3) explica el beneficio de esa mejora. Las otras opciones son demasiado negativas, demasiado vagas, o no proponen ninguna mejora." },
      { enunciado: "An 'action proposal' (propuesta de acción) should primarily include:", opciones: ["A personal story and opinion paragraphs", "A problem, a proposed solution, concrete actions, and expected results", "A grammar explanation and vocabulary list", "A summary of all vocabulary learned during the semester"], respuesta_correcta: 1, retroalimentacion: "Una propuesta de acción tiene estructura funcional: describe un PROBLEMA real, propone una SOLUCIÓN, detalla ACCIONES concretas y explica los RESULTADOS esperados. Es un género textual orientado a cambiar una situación real — diferente de un ensayo de opinión o un resumen de vocabulario." },
      { enunciado: "Which of the following best describes how the four language skills (reading, writing, speaking, listening) connect in the final project?", opciones: ["Each skill is practiced separately and independently", "Reading and writing are used for research; speaking and listening are for the presentation and feedback", "Only writing matters because the project is a written text", "Listening is not relevant for a final project"], respuesta_correcta: 1, retroalimentacion: "En el proyecto final, READING se usa para investigar fuentes; WRITING para producir el borrador y el texto final; SPEAKING para presentar y participar en sesiones de retroalimentación oral; LISTENING para comprender comentarios del maestro y compañeros, y para consultar recursos en inglés. Las 4 habilidades se integran de forma natural." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
];

// ── CONTENIDOS A3 ─────────────────────────────────────────────────────────────

const contenidosA3 = [
  { // P01 — reflexion_escrita: Describir campo de interés en inglés
    prompt: "Escribe un párrafo en inglés de al menos 80 palabras describiendo tu campo de interés o la carrera que te gustaría estudiar. Incluye: (1) qué área es, (2) por qué te interesa, (3) qué haces actualmente relacionado con ese campo, y (4) qué esperas lograr en el futuro. Usa al menos 3 conectores de los que aprendiste (first, also, in addition, however, finally, because).",
    pistas: [
      "Start with: 'I am interested in... because...'",
      "Menciona una actividad concreta que ya hagas o hayas hecho",
      "Usa el presente simple para describir tu campo y el futuro (I want to / I hope to) para tus metas",
      "Revisa tu ortografía: el inglés y el español tienen palabras muy parecidas pero con diferencias (career ≠ carrera, college ≠ colegio)",
    ],
    criterios_evaluacion: [
      "Describe claramente un campo de interés con razones específicas (no solo 'me gusta')",
      "Usa vocabulario temático apropiado para el campo elegido",
      "Incorpora al menos 3 conectores de forma correcta",
      "La extensión es de al menos 80 palabras en inglés",
    ],
    longitud_minima_palabras: 80,
  },
  { // P02 — autoevaluacion: Narrar experiencias académicas en inglés
    reflexion_final_prompt: "¿Qué aspecto de hablar de tus experiencias en inglés te resulta más difícil? ¿Tienes dificultad con los tiempos verbales, el vocabulario, o la confianza para hablar? ¿Qué estrategia vas a usar para mejorar?",
    criterios: [
      {
        id: "present_perfect",
        descripcion: "Uso el present perfect correctamente para hablar de experiencias pasadas (I have + past participle)",
        escala: [
          { valor: 1, etiqueta: "Nunca", descripcion: "Nunca logro aplicar esto en mis producciones orales o escritas en inglés." },
          { valor: 2, etiqueta: "A veces", descripcion: "Lo aplico ocasionalmente pero cometo errores frecuentes." },
          { valor: 3, etiqueta: "Casi siempre", descripcion: "Lo aplico correctamente en la mayoría de los casos con pocas equivocaciones." },
          { valor: 4, etiqueta: "Siempre", descripcion: "Lo aplico de manera consistente y puedo explicar cuándo y por qué usarlo." },
        ],
      },
      {
        id: "past_simple",
        descripcion: "Distingo cuándo usar past simple (evento específico) vs. present perfect (experiencia general)",
        escala: [
          { valor: 1, etiqueta: "Nunca", descripcion: "Nunca logro aplicar esto en mis producciones orales o escritas en inglés." },
          { valor: 2, etiqueta: "A veces", descripcion: "Lo aplico ocasionalmente pero cometo errores frecuentes." },
          { valor: 3, etiqueta: "Casi siempre", descripcion: "Lo aplico correctamente en la mayoría de los casos con pocas equivocaciones." },
          { valor: 4, etiqueta: "Siempre", descripcion: "Lo aplico de manera consistente y puedo explicar cuándo y por qué usarlo." },
        ],
      },
      {
        id: "vocabulario_experiencias",
        descripcion: "Uso vocabulario de experiencias: achievement, internship, volunteer work, skill, opportunity",
        escala: [
          { valor: 1, etiqueta: "Nunca", descripcion: "Nunca logro aplicar esto en mis producciones orales o escritas en inglés." },
          { valor: 2, etiqueta: "A veces", descripcion: "Lo aplico ocasionalmente pero cometo errores frecuentes." },
          { valor: 3, etiqueta: "Casi siempre", descripcion: "Lo aplico correctamente en la mayoría de los casos con pocas equivocaciones." },
          { valor: 4, etiqueta: "Siempre", descripcion: "Lo aplico de manera consistente y puedo explicar cuándo y por qué usarlo." },
        ],
      },
      {
        id: "conectores_narrativos",
        descripcion: "Uso conectores para organizar mi narrativa: first, then, since then, as a result, finally",
        escala: [
          { valor: 1, etiqueta: "Nunca", descripcion: "Nunca logro aplicar esto en mis producciones orales o escritas en inglés." },
          { valor: 2, etiqueta: "A veces", descripcion: "Lo aplico ocasionalmente pero cometo errores frecuentes." },
          { valor: 3, etiqueta: "Casi siempre", descripcion: "Lo aplico correctamente en la mayoría de los casos con pocas equivocaciones." },
          { valor: 4, etiqueta: "Siempre", descripcion: "Lo aplico de manera consistente y puedo explicar cuándo y por qué usarlo." },
        ],
      },
      {
        id: "confianza_oral",
        descripcion: "Me siento capaz de hablar sobre mis experiencias en inglés sin traducir mentalmente del español",
        escala: [
          { valor: 1, etiqueta: "Nunca", descripcion: "Nunca logro aplicar esto en mis producciones orales o escritas en inglés." },
          { valor: 2, etiqueta: "A veces", descripcion: "Lo aplico ocasionalmente pero cometo errores frecuentes." },
          { valor: 3, etiqueta: "Casi siempre", descripcion: "Lo aplico correctamente en la mayoría de los casos con pocas equivocaciones." },
          { valor: 4, etiqueta: "Siempre", descripcion: "Lo aplico de manera consistente y puedo explicar cuándo y por qué usarlo." },
        ],
      },
    ],
  },
  { // P03 — reflexion_escrita: Entrevista imaginaria sobre mi campo de interés
    prompt: "Imagina que tienes una entrevista en inglés con un científico o profesional del campo que más te interesa. Escribe el guión de esa entrevista: formula al menos 4 preguntas interesantes usando How, Why, What, y Can you explain... y escribe la respuesta que imaginas que daría esa persona. Las preguntas deben referirse a procesos, procedimientos o conceptos de ese campo.",
    pistas: [
      "How does [process] work?",
      "Why is [concept] important in your field?",
      "What are the main challenges you face?",
      "Can you explain the steps to [procedure]?",
      "What would you recommend to a student interested in this field?",
    ],
    criterios_evaluacion: [
      "Formula al menos 4 preguntas usando diferentes palabras interrogativas (How, Why, What, Can you explain)",
      "Las preguntas se refieren a procesos, procedimientos o conceptos específicos del campo elegido",
      "Las respuestas imaginarias son plausibles, detalladas y usan conectores de procedimiento",
      "El texto tiene al menos 100 palabras en total (preguntas + respuestas)",
    ],
    longitud_minima_palabras: 100,
  },
  { // P04 — quiz_verdadero_falso: Expresar opiniones en inglés (B1)
    preguntas: [
      { enunciado: "The sentence 'I think that young people should take action' is an example of an opinion supported by a modal verb.", respuesta: true, retroalimentacion: "VERDADERO. 'I think' señala que es una opinión personal, y 'should' es un modal que expresa recomendación. La estructura 'I think/believe/feel that + [modal] + [action]' es una forma muy común de expresar opiniones con peso argumentativo en inglés B1." },
      { enunciado: "'However' is used to introduce an idea that AGREES with the previous sentence.", respuesta: false, retroalimentacion: "FALSO. 'However' es un conector de CONTRASTE — introduce una idea que contrasta o contradice lo que se dijo antes. Ejemplo: 'Renewable energy is expensive. However, it saves money in the long term.' Para introducir una idea que COINCIDE, se usan: 'Moreover', 'In addition', 'Furthermore', 'Also'." },
      { enunciado: "The structure 'opinion + evidence + conclusion' is a recommended way to organize an argument at B1 level.", respuesta: true, retroalimentacion: "VERDADERO. La estructura opinión → evidencia → conclusión es una forma clara y efectiva de argumentar en inglés académico. Primero declaras lo que crees, luego lo apoyas con datos o ejemplos, y finalmente refuerzas tu postura con una conclusión. Esta estructura es valorada en ensayos, debates y presentaciones." },
      { enunciado: "The modal 'might' expresses the same degree of certainty as 'will'.", respuesta: false, retroalimentacion: "FALSO. 'Will' expresa certeza o decisión firme sobre el futuro. 'Might' expresa posibilidad o incertidumbre — algo que PODRÍA ocurrir pero no es seguro. Escala aproximada: will (certeza alta) > should (expectativa) > could (posibilidad) > might (posibilidad baja o incierta). Ejemplo: 'It will rain' vs. 'It might rain — I'm not sure.''" },
      { enunciado: "The phrase 'According to the evidence...' helps to signal that what follows is based on data, not just personal opinion.", respuesta: true, retroalimentacion: "VERDADERO. 'According to [source/evidence]...' es una señal discursiva que indica que la información proviene de una fuente externa o datos verificables, no de una opinión personal. Esta frase es clave en el inglés académico para distinguir entre lo que uno piensa y lo que la evidencia muestra." },
      { enunciado: "'On the other hand' can be used to present both sides of an argument in an opinion text.", respuesta: true, retroalimentacion: "VERDADERO. 'On the other hand' se usa para introducir la perspectiva opuesta o una consideración alternativa en un argumento — es esencial en textos de opinión que presentan dos lados de un tema. Ejemplo: 'Renewable energy is beneficial for the environment. On the other hand, the initial cost is very high for many countries.'" },
    ],
    intentos_maximos: 2,
    puntaje_minimo_aprobacion: 70,
  },
  { // P05 — reflexion_escrita: Leer y responder un texto sobre biodiversidad
    prompt: "Lee el siguiente texto corto en inglés sobre biodiversidad en México y respóndelo en inglés (puedes mezclar español si es necesario):\n\n'Mexico is one of the world's most biodiverse countries, home to about 10% of all plant and animal species on Earth. However, deforestation, pollution, and climate change are threatening this biodiversity. The Mexican government, through SEMARNAT, has created natural protected areas, but scientists say more action is needed.'\n\nResponde: (1) What is the main idea of the text? (2) Is it a fact or an opinion that 'more action is needed'? Explain why. (3) Do you agree with the text's message? Give at least two reasons.",
    pistas: [
      "Use skimming to find the main idea first",
      "A fact can be verified; an opinion reflects a point of view",
      "You can start with: 'In my opinion...' / 'I agree because...' / 'According to the text...'",
    ],
    criterios_evaluacion: [
      "Identifica correctamente la idea principal del texto en sus propias palabras",
      "Distingue entre hecho y opinión y explica cómo lo sabe (qué palabras o claves le indican que es opinión)",
      "Expresa su propia opinión sobre el mensaje del texto con al menos dos razones específicas",
    ],
    longitud_minima_palabras: 80,
  },
  { // P06 — autoevaluacion: Escribir textos funcionales en inglés
    reflexion_final_prompt: "¿Cuál tipo de texto funcional (correo, propuesta, solicitud) te resulta más difícil de escribir en inglés y por qué? ¿Qué estrategia vas a usar para mejorar esa habilidad específica?",
    criterios: [
      {
        id: "estructura_correo",
        descripcion: "Escribo correos formales con la estructura correcta (asunto, saludo, propósito, desarrollo, cierre, firma)",
        escala: [
          { valor: 1, etiqueta: "Nunca", descripcion: "Nunca logro aplicar esto en mis producciones orales o escritas en inglés." },
          { valor: 2, etiqueta: "A veces", descripcion: "Lo aplico ocasionalmente pero cometo errores frecuentes." },
          { valor: 3, etiqueta: "Casi siempre", descripcion: "Lo aplico correctamente en la mayoría de los casos con pocas equivocaciones." },
          { valor: 4, etiqueta: "Siempre", descripcion: "Lo aplico de manera consistente y puedo explicar cuándo y por qué usarlo." },
        ],
      },
      {
        id: "registro_formal",
        descripcion: "Uso registro formal apropiado (evito contracciones, uso vocabulario de cortesía)",
        escala: [
          { valor: 1, etiqueta: "Nunca", descripcion: "Nunca logro aplicar esto en mis producciones orales o escritas en inglés." },
          { valor: 2, etiqueta: "A veces", descripcion: "Lo aplico ocasionalmente pero cometo errores frecuentes." },
          { valor: 3, etiqueta: "Casi siempre", descripcion: "Lo aplico correctamente en la mayoría de los casos con pocas equivocaciones." },
          { valor: 4, etiqueta: "Siempre", descripcion: "Lo aplico de manera consistente y puedo explicar cuándo y por qué usarlo." },
        ],
      },
      {
        id: "cohesion",
        descripcion: "Mis textos tienen cohesión: uso pronombres de referencia, sinónimos y conectores para evitar repeticiones",
        escala: [
          { valor: 1, etiqueta: "Nunca", descripcion: "Nunca logro aplicar esto en mis producciones orales o escritas en inglés." },
          { valor: 2, etiqueta: "A veces", descripcion: "Lo aplico ocasionalmente pero cometo errores frecuentes." },
          { valor: 3, etiqueta: "Casi siempre", descripcion: "Lo aplico correctamente en la mayoría de los casos con pocas equivocaciones." },
          { valor: 4, etiqueta: "Siempre", descripcion: "Lo aplico de manera consistente y puedo explicar cuándo y por qué usarlo." },
        ],
      },
      {
        id: "proposito_claro",
        descripcion: "El propósito de mi texto queda claro desde el primer párrafo",
        escala: [
          { valor: 1, etiqueta: "Nunca", descripcion: "Nunca logro aplicar esto en mis producciones orales o escritas en inglés." },
          { valor: 2, etiqueta: "A veces", descripcion: "Lo aplico ocasionalmente pero cometo errores frecuentes." },
          { valor: 3, etiqueta: "Casi siempre", descripcion: "Lo aplico correctamente en la mayoría de los casos con pocas equivocaciones." },
          { valor: 4, etiqueta: "Siempre", descripcion: "Lo aplico de manera consistente y puedo explicar cuándo y por qué usarlo." },
        ],
      },
    ],
  },
  { // P07 — reflexion_escrita: Experiencia en conversaciones y debates en inglés
    prompt: "Reflexiona sobre tu experiencia participando en conversaciones, presentaciones o debates en inglés durante este semestre. Responde: (1) ¿Qué estrategia de turn-taking (tomar y ceder la palabra) te resultó más útil? (2) ¿Cómo manejaste los momentos en que no conocías una palabra en inglés? (3) ¿Qué es lo que más mejoró en tu producción oral comparado con el semestre anterior? Puedes responder parte en español si necesitas.",
    pistas: [
      "Frases útiles que usaste: 'In my opinion...', 'I agree because...', 'That's a good point, but...'",
      "¿Cómo pediste aclaraciones: 'Could you repeat that?' / 'What do you mean by...?'",
      "¿Usaste sinónimos o explicaciones cuando no sabías una palabra exacta?",
    ],
    criterios_evaluacion: [
      "Identifica y describe al menos una estrategia concreta de turn-taking con un ejemplo de cómo la usó",
      "Explica cómo manejó la falta de vocabulario (circunlocución, sinónimos, solicitar aclaración)",
      "Reflexiona sobre su progreso real en producción oral con evidencia específica (antes vs. ahora)",
    ],
    longitud_minima_palabras: 80,
  },
  { // P08 — reflexion_escrita: Reflexión final del semestre
    prompt: "Reflexión final del semestre: escribe en inglés o en español-inglés (puedes mezclar) una reflexión sobre tu proceso de aprendizaje en Inglés V. Incluye: (1) ¿Cuáles son las 3 cosas más importantes que aprendiste este semestre? (2) ¿Qué tipo de actividad (lectura, escritura, conversación, proyecto) te ayudó más a aprender? (3) ¿En qué nivel del MCER crees que estás ahora y qué evidencia tienes de eso? (4) ¿Qué vas a hacer para seguir mejorando tu inglés fuera del aula?",
    pistas: [
      "Think about: grammar, vocabulary, reading, writing, speaking, listening",
      "¿Puedes ahora hacer algo en inglés que no podías hacer al inicio del semestre?",
      "A2 = puede comunicarse en situaciones básicas | B1 = puede expresar opiniones y hablar de su campo de interés con cierta fluidez",
    ],
    criterios_evaluacion: [
      "Identifica 3 aprendizajes específicos y concretos del semestre (no generalidades como 'aprendí inglés')",
      "Explica qué tipo de actividad le ayudó más a aprender y por qué — con reflexión genuina",
      "Autoevalúa su nivel del MCER (A2/B1) con al menos una evidencia concreta de lo que puede hacer en inglés",
      "Propone al menos dos acciones específicas y factibles para seguir mejorando fuera del aula",
    ],
    longitud_minima_palabras: 100,
  },
];

main().catch((err) => { console.error("❌ Error fatal:", err.message); process.exit(1); });

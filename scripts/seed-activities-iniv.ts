/**
 * Seed de actividades pedagógicas para IN-IV (Inglés IV — A2+).
 * Título de la UAC: "Should I stay or should I go?"
 * 8 progresiones × 3 actividades = 24 actividades. estado='publicada'.
 * Tipos: lectura, video_con_preguntas, glosario_interactivo, fill_blanks,
 *        quiz_multiple_opcion, quiz_verdadero_falso, reflexion_escrita, autoevaluacion
 * Uso: npx tsx scripts/seed-activities-iniv.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🌱 Seed actividades IN-IV — Inglés IV (A2+) — Should I stay or should I go?\n");

  const progs = await getProgresionesDeUAC(sb, "IN-IV");
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

  log(`\n✅ IN-IV: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── TÍTULOS ──────────────────────────────────────────────────────────────────

const titulos = [
  { a1: "A Trip to Remember: Past Simple in Context", a2: "Fill in the Past: Irregular Verbs and Sequence", a3: "Write About a Past Experience" },
  { a1: "Better, Best, or Different? Comparatives and Superlatives", a2: "Quiz: Comparatives and Superlatives", a3: "Compare and Justify: My Preferences" },
  { a1: "Daily Routines and Habits: Key Vocabulary", a2: "Routine Fill-in: Present Simple, Adverbs and Because", a3: "Self-Assessment: Describing My Routines" },
  { a1: "Advice in English: Should, Shouldn't and Imperatives", a2: "True or False? Should and Shouldn't in Context", a3: "Advice for a New Student" },
  { a1: "Plans and Goals: Be Going To and Will", a2: "Fill in the Future: Be Going To and Will", a3: "My Plans for Next Year" },
  { a1: "Social English: Small Talk Vocabulary", a2: "Quiz: Polite Expressions and Conversation", a3: "Self-Assessment: Social Conversations" },
  { a1: "Tell Me a Story: Past Simple and Past Continuous", a2: "Fill in the Anecdote: Past Tenses in Action", a3: "My Anecdote: A Memorable Moment" },
  { a1: "A2+ Review: Tenses, Topics and Strategies", a2: "Mixed Tenses Quiz: Choose the Right Form", a3: "Self-Assessment: My Progress in English IV" },
];

const tiposA1 = ["lectura", "video_con_preguntas", "glosario_interactivo", "lectura", "video_con_preguntas", "glosario_interactivo", "lectura", "video_con_preguntas"] as const;
const tiposA2 = ["fill_blanks", "quiz_multiple_opcion", "fill_blanks", "quiz_verdadero_falso", "fill_blanks", "quiz_multiple_opcion", "fill_blanks", "quiz_multiple_opcion"] as const;
const tiposA3 = ["reflexion_escrita", "reflexion_escrita", "autoevaluacion", "reflexion_escrita", "reflexion_escrita", "autoevaluacion", "reflexion_escrita", "autoevaluacion"] as const;

// ── CONTENIDOS A1 ─────────────────────────────────────────────────────────────

const contenidosA1 = [
  { // P01 — lectura: Pasado simple (narración personal — contexto mexicano)
    titulo: "A Trip to Oaxaca: My Día de Muertos Experience",
    texto: `Last year, my family and I traveled (viajamos) to Oaxaca for Día de Muertos. It was an unforgettable experience that I will never forget.\n\nWe left (salimos) Mexico City early in the morning. My mother packed (empacó) tamales and pan dulce for the road. After four hours on the bus, we arrived (llegamos) in Oaxaca City. First, we checked into (nos registramos en) a small hotel near the zócalo.\n\nOn the evening of November 1st, we walked (caminamos) to the Panteón General cemetery. The atmosphere was (era) incredible. Families decorated (decoraron) the graves with cempasúchil flowers, candles, and photographs. Children and grandparents sat together (se sentaron juntos), talked, and shared food. I saw (vi) colors and lights everywhere.\n\nThe next day, we visited (visitamos) the local market. We bought (compramos) colorful alebrijes and tasted (probamos) traditional Oaxacan mole. My little brother tried (probó) chapulines — that is, fried grasshoppers — for the first time. He said (dijo) they were surprisingly delicious!\n\nIn the end, we returned (regresamos) home tired but happy. That trip taught (enseñó) me that Día de Muertos is not a sad celebration — it is a beautiful way to remember and honor the people we love.\n\nGrammar note: Notice the verbs in bold. They are all in the PASADO SIMPLE (Past Simple). Regular verbs add -ed (traveled, packed, arrived, decorated, visited). Irregular verbs have special forms (left → left, was → was, saw → saw, bought → bought, said → said, taught → taught). Sequence connectors like First, then, after, and In the end organize the story.`,
    fuente: "Material CEN Bachillerato — IN-IV (A2+)",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 10,
    preguntas_comprension: [
      { pregunta: "¿Cuándo y a dónde viajó la familia del narrador? ¿Por qué eligieron ese lugar?", respuesta_guia: "Viajaron a Oaxaca durante el Día de Muertos (1 y 2 de noviembre). Eligieron ese lugar para celebrar esta festividad, que es especialmente famosa en Oaxaca por sus tradiciones y decoraciones en los cementerios." },
      { pregunta: "Identifica tres verbos irregulares en el texto y escribe su forma base e infinitivo en español.", respuesta_guia: "Ejemplos: left (base: leave — salir), saw (base: see — ver), bought (base: buy — comprar), said (base: say — decir), taught (base: teach — enseñar). Los verbos irregulares tienen formas especiales en pasado que no siguen la regla de añadir -ed." },
      { pregunta: "¿Qué conectores de secuencia usa el texto para organizar la historia? ¿Para qué sirven?", respuesta_guia: "El texto usa: First (primero), The next day (al día siguiente), In the end (al final). Estos conectores organizan los eventos en orden cronológico y ayudan al lector a seguir la narración con claridad." },
    ],
  },
  { // P02 — video_con_preguntas: Comparativos y superlativos
    url_video: "https://example.com/video-pendiente-cen",
    titulo_video: "Comparatives and Superlatives: Better, Best and More!",
    duracion_segundos: 420,
    preguntas: [
      { tiempo_segundos: 90, pregunta: "What are the two ways to form comparatives in English? Give one example of each with a word from the video.", respuesta_guia: "1) Short adjectives (1-2 syllables): add -er + than. Example: fast → faster than, big → bigger than. 2) Long adjectives (3+ syllables): use more + adjective + than. Example: interesting → more interesting than. Irregular: good → better, bad → worse." },
      { tiempo_segundos: 240, pregunta: "How do we form superlatives? What is the difference between 'the tallest' and 'the most intelligent'?", respuesta_guia: "'The tallest' uses -est for short adjectives (tall = 1 syllable). 'The most intelligent' uses 'the most' for long adjectives (intelligent = 4 syllables). Both express the extreme form — the one that is more than all others in a group." },
      { tiempo_segundos: 370, pregunta: "The video compares two Mexican cities. Which city did they say is bigger and which is the most visited? Do you agree? Why or why not?", respuesta_guia: "Respuesta abierta del estudiante. La clave es usar la estructura correcta: 'Ciudad de México is bigger than Guadalajara' o 'Cancún is the most visited city for foreign tourists.' El objetivo es que el estudiante aplique comparativos y superlativos en contexto." },
    ],
  },
  { // P03 — glosario_interactivo: Rutinas y hábitos
    terminos: [
      { termino: "wake up", definicion: "Dejar de dormir y abrir los ojos por la mañana (despertarse). Verbo irregular: wake → woke → woken.", ejemplo: "I usually wake up at 6:30 am. (Normalmente me despierto a las 6:30.) / She woke up late on Saturday.", etiquetas: ["IN-IV", "P03", "daily routine", "verbs"] },
      { termino: "go to bed", definicion: "Ir a dormir, acostarse por la noche (irse a la cama).", ejemplo: "He goes to bed at 10 pm on school nights. (Se va a dormir a las 10 pm los días de escuela.)", etiquetas: ["IN-IV", "P03", "daily routine", "verbs"] },
      { termino: "have breakfast / lunch / dinner", definicion: "Tomar el desayuno / almuerzo / cena. En inglés no usamos artículo (no se dice 'have a breakfast').", ejemplo: "We have dinner together as a family every evening. (Cenamos juntos en familia cada tarde.)", etiquetas: ["IN-IV", "P03", "meals", "daily routine"] },
      { termino: "commute", definicion: "Viajar diariamente entre el hogar y el trabajo o escuela (trasladarse). Se usa como verbo y como sustantivo.", ejemplo: "My commute to school takes 45 minutes by bus. (Mi trayecto a la escuela tarda 45 minutos en camión.)", etiquetas: ["IN-IV", "P03", "transport", "daily routine"] },
      { termino: "get used to", definicion: "Acostumbrarse a algo (adaptarse a una nueva situación o hábito). Se usa con verbo en -ing o sustantivo.", ejemplo: "It takes time to get used to waking up early. (Lleva tiempo acostumbrarse a despertarse temprano.)", etiquetas: ["IN-IV", "P03", "habits", "adaptation"] },
      { termino: "tend to", definicion: "Tener la tendencia a hacer algo (soler hacer). Expresa un hábito o patrón general de comportamiento.", ejemplo: "Teenagers tend to stay up late on weekends. (Los adolescentes tienden a quedarse despiertos hasta tarde los fines de semana.)", etiquetas: ["IN-IV", "P03", "habits", "frequency"] },
      { termino: "usually", definicion: "Normalmente, generalmente. Adverbio de frecuencia (~80% del tiempo). Va antes del verbo principal pero después de 'be'.", ejemplo: "She usually studies for two hours after school. (Ella normalmente estudia dos horas después de la escuela.)", etiquetas: ["IN-IV", "P03", "frequency adverbs"] },
      { termino: "rarely", definicion: "Rara vez, casi nunca. Adverbio de frecuencia (~10-20% del tiempo). Indica poca frecuencia.", ejemplo: "He rarely eats fast food because he prefers home-cooked meals. (Él rara vez come comida rápida porque prefiere la comida casera.)", etiquetas: ["IN-IV", "P03", "frequency adverbs"] },
      { termino: "because", definicion: "Porque. Conjunción causal que introduce la razón o causa de una acción. Conecta dos cláusulas.", ejemplo: "I exercise every day because it helps me concentrate in class. (Hago ejercicio todos los días porque me ayuda a concentrarme en clase.)", etiquetas: ["IN-IV", "P03", "connectors", "causality"] },
      { termino: "due to", definicion: "Debido a, a causa de. Conector causal más formal que 'because'. Se usa antes de un sustantivo o frase nominal.", ejemplo: "Due to traffic, many students arrive late. (Debido al tráfico, muchos estudiantes llegan tarde.)", etiquetas: ["IN-IV", "P03", "connectors", "causality", "formal"] },
    ],
    actividad_final: "Elige 5 términos del glosario. Para cada uno, escribe una oración en inglés sobre tu propia rutina. Usa adverbios de frecuencia (usually, rarely, always, sometimes) y el conector 'because' en al menos dos oraciones.",
  },
  { // P04 — lectura: Should / shouldn't — dar consejos
    titulo: "Giving Advice in English: Should, Shouldn't and Imperatives",
    texto: `Giving advice (dar consejos) is a very useful communication skill at A2+ level. In English, we use SHOULD and SHOULDN'T to make recommendations. They are gentler (más amables) than MUST and more common in everyday advice.\n\nSHOULD + base verb — use this to recommend an action:\n• You should drink more water. (Deberías beber más agua.) — health advice\n• She should study a little every day. (Ella debería estudiar un poco cada día.) — study advice\n• You should talk to your teacher if you have a problem. — social advice\n\nSHOULDN'T + base verb — use this to advise AGAINST an action:\n• You shouldn't eat too much junk food. (No deberías comer mucha comida chatarra.) — health\n• He shouldn't use his phone during class. (No debería usar el celular en clase.) — school rules\n• You shouldn't stay up all night before an exam. — study advice\n\nIMPERATIVES — direct instructions or commands:\n• Eat more fruit and vegetables. / Don't skip breakfast.\n• Study for at least 30 minutes every day. / Don't leave everything to the last minute.\n\nAsking for advice — useful phrases:\n• What should I do? (¿Qué debería hacer?)\n• Do you have any advice for me? (¿Tienes algún consejo para mí?)\n• What do you think I should do about...? (¿Qué crees que debería hacer con...?)\n\nEmpathetic responses before advice (respuestas empáticas):\n• "That sounds difficult. I think you should..." (Eso suena difícil. Creo que deberías...)\n• "I understand. Maybe you shouldn't..." (Entiendo. Quizás no deberías...)\n• "Don't worry. Here's what I suggest..." (No te preocupes. Esto es lo que sugiero...)\n\nContext matters (el contexto importa). The same advice changes depending on who you are talking to. Advice for a friend is informal; advice for a younger student is encouraging; advice for a community context is more responsible.`,
    fuente: "Material CEN Bachillerato — IN-IV (A2+)",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 10,
    preguntas_comprension: [
      { pregunta: "¿Cuál es la diferencia entre 'should' y 'must' para dar consejos? ¿Cuándo usamos cada uno?", respuesta_guia: "'Should' es más suave y amable — expresa una recomendación o sugerencia (debería). 'Must' es más fuerte — expresa una obligación o necesidad fuerte (debes/tienes que). Para dar consejos cotidianos en inglés se prefiere 'should' porque suena más respetuoso y menos impositivo." },
      { pregunta: "Escribe dos consejos usando should/shouldn't para alguien que quiere mejorar su inglés.", respuesta_guia: "Ejemplos: 'You should practice English every day, even for 15 minutes.' / 'You shouldn't be afraid to make mistakes — mistakes help you learn.' Otras respuestas válidas que usen should/shouldn't + verbo base correctamente." },
      { pregunta: "¿Para qué sirven las 'empathetic responses' antes de dar un consejo? Da un ejemplo del texto.", respuesta_guia: "Sirven para mostrar que entiendes cómo se siente la persona antes de dar el consejo — hacen que el consejo sea más amable y menos directo. Ejemplo del texto: 'That sounds difficult. I think you should...' muestra empatía antes de la recomendación." },
    ],
  },
  { // P05 — video_con_preguntas: Be going to / Will
    url_video: "https://example.com/video-pendiente-cen",
    titulo_video: "Future Plans in English: Be Going To vs. Will",
    duracion_segundos: 450,
    preguntas: [
      { tiempo_segundos: 100, pregunta: "According to the video, when do we use 'be going to' and when do we use 'will'? Give one example of each.", respuesta_guia: "'Be going to' = planes decididos antes de hablar, o predicciones basadas en evidencia visible. Ejemplo: 'I am going to study medicine.' 'Will' = decisiones espontáneas en el momento o predicciones generales. Ejemplo: 'I think it will rain tomorrow.'" },
      { tiempo_segundos: 270, pregunta: "In the video, a student talks about her plans for next year. What is she going to do and why is it important to her?", respuesta_guia: "Respuesta abierta basada en el video. El objetivo es que el estudiante practique reportar información usando 'be going to'. Ejemplo esperado: 'She is going to apply to university because she wants to become a doctor.' / El alumno debe identificar el plan y la razón." },
      { tiempo_segundos: 400, pregunta: "Think about ONE plan you have for the next 6 months. Write a sentence using 'be going to' and explain why it matters to you using 'because'.", respuesta_guia: "Respuesta abierta del estudiante. Ejemplo correcto: 'I am going to study harder this semester because I want to improve my grades.' Verificar: estructura be going to correcta + because + razón personal." },
    ],
  },
  { // P06 — glosario_interactivo: Small talk y conversación social
    terminos: [
      { termino: "How are you?", definicion: "Saludo informal: ¿Cómo estás? / ¿Cómo te encuentras? Es una expresión de cortesía, no siempre una pregunta literal sobre la salud.", ejemplo: "'How are you?' — 'I'm fine, thanks! And you?' (Informal greeting exchange between classmates.)", etiquetas: ["IN-IV", "P06", "greetings", "small talk"] },
      { termino: "What have you been up to?", definicion: "¿Qué has estado haciendo últimamente? Pregunta informal para iniciar conversación y ponerse al día con alguien.", ejemplo: "'Hey! What have you been up to?' — 'Not much, just studying for finals. What about you?'", etiquetas: ["IN-IV", "P06", "small talk", "conversation starters"] },
      { termino: "By the way", definicion: "Por cierto, a propósito. Se usa para introducir un tema nuevo o información adicional en la conversación.", ejemplo: "'By the way, did you see the fútbol game last night? América won again!' (A propósito, ¿viste el partido de fútbol anoche?)", etiquetas: ["IN-IV", "P06", "conversation connectors", "small talk"] },
      { termino: "Anyway", definicion: "De todas formas, de todos modos, bueno. Se usa para cambiar de tema, volver al tema principal, o cerrar educadamente una conversación.", ejemplo: "'Anyway, I should get going — see you tomorrow!' (De todas formas, debo irme — ¡hasta mañana!)", etiquetas: ["IN-IV", "P06", "conversation connectors", "closing"] },
      { termino: "Nice to meet you", definicion: "Mucho gusto / Encantado(a) de conocerte. Expresión formal o informal al conocer a alguien por primera vez.", ejemplo: "'Hi, I'm Sofía.' — 'Nice to meet you, Sofía! I'm Diego.' ('Mucho gusto, Sofía. Soy Diego.')", etiquetas: ["IN-IV", "P06", "introductions", "polite expressions"] },
      { termino: "See you around", definicion: "Nos vemos por ahí, hasta luego. Expresión informal para despedirse sin una fecha concreta de volverte a ver.", ejemplo: "'I have to go to class now. See you around!' (Tengo que ir a clase. ¡Nos vemos!)", etiquetas: ["IN-IV", "P06", "farewells", "informal"] },
      { termino: "Small talk", definicion: "Conversación informal y ligera sobre temas poco importantes (clima, fin de semana, fútbol) para romper el hielo o ser sociable. No busca profundidad.", ejemplo: "Talking about the weather or weekend plans at the start of a class is typical small talk: 'Did you have a good weekend?' — 'Yes, I went to a quinceañera!' (¿Tuviste un buen fin de semana?)", etiquetas: ["IN-IV", "P06", "communication", "social English"] },
      { termino: "Turn-taking", definicion: "El turno para hablar en una conversación. En inglés, las señales de turn-taking indican cuándo ceder o tomar la palabra de forma educada.", ejemplo: "Phrases like 'That's interesting, but...' or 'Can I add something?' are turn-taking signals. (Frases que señalan que quieres tomar el turno de hablar.)", etiquetas: ["IN-IV", "P06", "conversation skills", "turn-taking"] },
      { termino: "Polite expressions", definicion: "Expresiones de cortesía en inglés: please, thank you, excuse me, I'm sorry, you're welcome. Son esenciales en conversaciones formales e informales.", ejemplo: "'Excuse me, could you help me find this classroom?' — 'Of course! It's on the second floor.' ('Con permiso, ¿podrías ayudarme a encontrar este salón?')", etiquetas: ["IN-IV", "P06", "politeness", "social English"] },
      { termino: "Ice-breaker", definicion: "Una actividad o pregunta para romper el hielo — para hacer que personas que no se conocen se sientan más cómodas al inicio de una conversación o reunión.", ejemplo: "A typical ice-breaker question: 'If you could visit any place in Mexico, where would you go and why?' (Una pregunta típica para romper el hielo al inicio de clase.)", etiquetas: ["IN-IV", "P06", "conversation starters", "classroom English"] },
    ],
    actividad_final: "Practica con un compañero: elige 3 expresiones del glosario y crea un diálogo breve de 6-8 líneas. El diálogo debe incluir: un saludo, un tema de small talk (fútbol mexicano, fin de semana, una película), y una despedida.",
  },
  { // P07 — lectura: Pasado simple + pasado continuo (anécdota)
    titulo: "Something Unexpected Happened: Past Simple and Past Continuous",
    texto: `One of the most common ways to tell a story in English is to combine two past tenses: the PAST SIMPLE and the PAST CONTINUOUS. Together, they create interesting and dramatic narratives.\n\nPAST CONTINUOUS — was/were + verb-ing\nUse this to describe an action IN PROGRESS at a past moment (una acción en progreso en el pasado):\n• I was walking home. (Estaba caminando a casa.)\n• She was studying in the library. (Ella estaba estudiando en la biblioteca.)\n• We were playing fútbol in the park. (Estábamos jugando fútbol en el parque.)\n\nThe key pattern:\n"I WAS [doing something] WHEN [something happened]"\n• I was eating tacos when I saw my favorite singer. (Estaba comiendo tacos cuando vi a mi cantante favorito.)\n• She was walking to school when it started to rain heavily. (Ella estaba caminando a la escuela cuando empezó a llover fuerte.)\n\n"WHILE I WAS [doing something], [something happened]"\n• While we were watching the Chivas game, the lights went out. (Mientras veíamos el partido de Chivas, se fue la luz.)\n• While my brother was studying, our cat knocked over a glass of water. (Mientras mi hermano estudiaba, nuestro gato tiró un vaso de agua.)\n\nAnecdote from Mexico City:\nLast Thursday, I was standing at the metro station when a woman suddenly ran past me and dropped her bag. I picked it up. Inside, there was a letter in English addressed to someone named Elena. While I was reading the letter, the woman came back, out of breath. "That's mine!" she said. We started talking. It turned out she was a literature teacher and the letter was a note from her pen pal in Canada. In the end, we exchanged numbers and she invited me to her book club. You never know what can happen at the metro!\n\nGrammar: The story uses was standing, was reading (past continuous = actions in progress) and ran, dropped, picked up, came back, said, started, turned out, exchanged, invited (past simple = completed actions and events).`,
    fuente: "Material CEN Bachillerato — IN-IV (A2+)",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 12,
    preguntas_comprension: [
      { pregunta: "¿Cuándo usamos el pasado continuo (past continuous) en inglés? Da un ejemplo del texto.", respuesta_guia: "Usamos el pasado continuo para describir una acción que estaba en progreso en un momento del pasado. Se forma con was/were + verbo -ing. Ejemplo del texto: 'I was standing at the metro station' — estaba parado en la estación del metro (acción en progreso que fue interrumpida)." },
      { pregunta: "Explica el patrón 'was/were doing... when... happened'. ¿Para qué sirve en una anécdota?", respuesta_guia: "Este patrón se usa para mostrar una acción en progreso (past continuous) que es interrumpida por un evento inesperado (past simple). Crea tensión dramática en la historia: 'I was standing... when a woman suddenly ran past me.' La acción en progreso marca el contexto; el evento inesperado avanza la historia." },
      { pregunta: "¿Cuál es el evento inesperado en la anécdota de la Ciudad de México? ¿Cómo cambia el curso de la historia?", respuesta_guia: "El evento inesperado es que una mujer corre junto al narrador y suelta su bolsa. Esto hace que el narrador recoja la bolsa, encuentre una carta en inglés, y finalmente conozca a una profesora de literatura que lo invita a su club de lectura. Un evento pequeño e inesperado tiene consecuencias importantes — típico de la estructura de una buena anécdota." },
    ],
  },
  { // P08 — video_con_preguntas: Consolidación A2+ (estrategias, tiempos, párrafos)
    url_video: "https://example.com/video-pendiente-cen",
    titulo_video: "A2+ English: Putting It All Together — Tenses, Texts and Strategies",
    duracion_segundos: 480,
    preguntas: [
      { tiempo_segundos: 110, pregunta: "The video reviews three verb tenses. Name them, and give one key context for using each one.", respuesta_guia: "1) Present Simple: rutinas, hábitos, hechos generales. Ejemplo: 'I study at UNAM.' 2) Past Simple: eventos completados en el pasado. Ejemplo: 'I went to Guadalajara last summer.' 3) Future (be going to / will): planes decididos o predicciones. Ejemplo: 'I am going to apply to university next year.'" },
      { tiempo_segundos: 290, pregunta: "What is the structure of an English paragraph according to the video? Why is it different from how we write in Spanish?", respuesta_guia: "Un párrafo en inglés típicamente tiene: (1) topic sentence — la idea principal al inicio, (2) supporting ideas — ejemplos o detalles que desarrollan la idea, (3) concluding sentence — cierre o resumen. En español, a menudo ponemos la idea principal al final o la desarrollamos de forma más implícita. En inglés se espera claridad desde la primera oración." },
      { tiempo_segundos: 420, pregunta: "The video mentions two reading strategies: skimming and scanning. Explain the difference and give a real-life example of when you would use each.", respuesta_guia: "Skimming = leer rápidamente para entender la idea general (main idea). Ejemplo: leer los títulos y el primer párrafo de un artículo para saber de qué trata. Scanning = buscar información específica rápidamente. Ejemplo: buscar un nombre, una fecha o un número en un texto sin leer todo." },
    ],
  },
];

// ── CONTENIDOS A2 ─────────────────────────────────────────────────────────────

const contenidosA2 = [
  { // P01 — fill_blanks: Pasado simple (verbos regulares e irregulares + conectores de secuencia)
    // texto_con_huecos has exactly 6 ___
    instrucciones: "Complete the story with the correct past simple form of the verb in parentheses. Pay attention to regular and irregular verbs.",
    texto_con_huecos: "Last December, my school ___ (organize) a trip to Teotihuacán. We ___ (wake up) very early and ___ (take) the bus at 5:30 am. When we arrived, our guide ___ (tell) us about the history of the pyramids. First, we ___ (climb) the Pyramid of the Sun — it ___ (be) exhausting but worth it!",
    huecos: [
      { posicion: 0, respuesta_correcta: "organized", alternativas_aceptadas: ["organised"], pista: "Regular: organize + d" },
      { posicion: 1, respuesta_correcta: "woke up", alternativas_aceptadas: ["woke"], pista: "Irregular: wake up → woke up" },
      { posicion: 2, respuesta_correcta: "took", alternativas_aceptadas: [], pista: "Irregular: take → took" },
      { posicion: 3, respuesta_correcta: "told", alternativas_aceptadas: [], pista: "Irregular: tell → told" },
      { posicion: 4, respuesta_correcta: "climbed", alternativas_aceptadas: [], pista: "Regular: climb + ed" },
      { posicion: 5, respuesta_correcta: "was", alternativas_aceptadas: [], pista: "Irregular: be → was (singular subject)" },
    ],
    distingue_mayusculas: false,
  },
  { // P02 — quiz_multiple_opcion: Comparativos y superlativos
    preguntas: [
      { enunciado: "Choose the correct comparative: 'Guadalajara is ___ Mexico City, but it is also ___ city I have visited.'", opciones: ["smaller than / the most relaxed", "more small than / the relaxeder", "smallest than / more relaxed", "smaller than / most relaxed"], respuesta_correcta: 0, retroalimentacion: "'Smaller than' — adjetivo corto (small = 1 sílaba), comparativo con -er. 'The most relaxed' — adjetivo de 2+ sílabas, superlativo con 'the most'. Nunca se usa 'more' con adjetivos cortos ni 'most' sin 'the'." },
      { enunciado: "What is the superlative of 'bad'?", opciones: ["the most bad", "the baddest", "the worst", "the more bad"], respuesta_correcta: 2, retroalimentacion: "'Bad' es irregular: bad → worse (comparativo) → the worst (superlativo). No se usa 'most bad' ni 'baddest'." },
      { enunciado: "Which sentence uses a conjunction CORRECTLY?", opciones: ["I like tacos, so they are spicy.", "I like tacos, but I don't eat them every day.", "I like tacos, and I not like pizza.", "I like tacos so I don't eat pizza."], respuesta_correcta: 1, retroalimentacion: "'But' conecta dos ideas contrastantes (me gustan los tacos, PERO no los como todos los días). 'And' suma ideas; 'so' indica consecuencia. Opción A: 'so' no es correcto aquí (la especia no es consecuencia de gustarle). Opción C: estructura incorrecta." },
      { enunciado: "Complete: 'In my opinion, the metro is ___ the bus for getting around Mexico City.'", opciones: ["more fast than", "faster than", "the fastest than", "more faster than"], respuesta_correcta: 1, retroalimentacion: "'Fast' es un adjetivo corto (1 sílaba). El comparativo correcto es 'faster than'. 'More fast' es incorrecto para adjetivos cortos. 'More faster' es una doble comparación incorrecta." },
      { enunciado: "Which is the CORRECT superlative sentence?", opciones: ["The Zócalo is the more beautiful plaza in Mexico.", "The Zócalo is the beautifulest plaza in Mexico.", "The Zócalo is the most beautiful plaza in Mexico.", "The Zócalo is most beautiful plaza in Mexico."], respuesta_correcta: 2, retroalimentacion: "'Beautiful' tiene 3 sílabas — superlativo: 'the most beautiful'. Nunca añadimos -est a adjetivos largos. Y no olvidamos 'the' antes del superlativo." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P03 — fill_blanks: Presente simple, adverbios de frecuencia y because
    // texto_con_huecos has exactly 6 ___
    instrucciones: "Complete the paragraph. Choose the correct verb in present simple, frequency adverb (always, usually, rarely, never), or connector (because).",
    texto_con_huecos: "My cousin Valentina ___ in Monterrey and has a very healthy lifestyle. She ___ goes for a run in the morning ___ it helps her feel more energetic. She never skips breakfast — she says that skipping meals makes her tired. She ___ eats junk food; maybe once a month is the maximum. Her brother, on the other hand, ___ exercises, but he ___ takes the stairs instead of the elevator.",
    huecos: [
      { posicion: 0, respuesta_correcta: "lives", alternativas_aceptadas: [], pista: "Presente simple 3ª persona singular de 'live'" },
      { posicion: 1, respuesta_correcta: "always", alternativas_aceptadas: [], pista: "100% del tiempo — ella corre todas las mañanas sin excepción" },
      { posicion: 2, respuesta_correcta: "because", alternativas_aceptadas: [], pista: "Conector causal: introduce la razón por la que corre" },
      { posicion: 3, respuesta_correcta: "rarely", alternativas_aceptadas: ["never"], pista: "Rara vez — casi nunca come comida chatarra (máximo una vez al mes)" },
      { posicion: 4, respuesta_correcta: "never", alternativas_aceptadas: ["rarely"], pista: "El hermano no hace ejercicio — adverbio de frecuencia cercano a 0%" },
      { posicion: 5, respuesta_correcta: "always", alternativas_aceptadas: ["usually"], pista: "El hermano siempre/normalmente toma las escaleras" },
    ],
    distingue_mayusculas: false,
  },
  { // P04 — quiz_verdadero_falso: Should / shouldn't en contexto
    preguntas: [
      { enunciado: "'You should to eat more vegetables' is grammatically correct.", respuesta: false, retroalimentacion: "Incorrecto. 'Should' es un verbo modal y siempre va seguido del verbo base SIN 'to'. La forma correcta es: 'You should eat more vegetables.' Comparar: should + base verb (never 'should to')." },
      { enunciado: "'You shouldn't stay up all night before an exam' is good advice in English.", respuesta: true, retroalimentacion: "Correcto. 'Shouldn't' + base verb expresa un consejo en contra de una acción. 'You shouldn't stay up all night' = No deberías quedarte despierto toda la noche. Es gramaticalmente correcto y es un buen consejo contextualizado." },
      { enunciado: "'Should' has the same meaning as 'must' — they are always interchangeable.", respuesta: false, retroalimentacion: "Falso. 'Should' es más suave — expresa una recomendación o sugerencia. 'Must' es más fuerte — expresa una obligación. 'You should exercise' (es una buena idea) ≠ 'You must exercise' (es obligatorio / necesario)." },
      { enunciado: "'What should I do?' is a correct way to ask for advice in English.", respuesta: true, retroalimentacion: "Correcto. 'What should I do?' = ¿Qué debería hacer? Es una pregunta estándar para pedir consejo. También se usan: 'Do you have any advice?' o 'What do you think I should do?'" },
      { enunciado: "'Don't eat too much sugar' is an imperative giving advice about health.", respuesta: true, retroalimentacion: "Correcto. Los imperativos negativos (Don't + base verb) se usan para dar instrucciones o consejos directos. 'Don't eat too much sugar' = No comas demasiada azúcar — es un consejo de salud directo y gramaticalmente correcto." },
      { enunciado: "'She should to study harder' is the correct third-person form of should.", respuesta: false, retroalimentacion: "Incorrecto. Los verbos modales (should, must, can, will) NO cambian en tercera persona y NO llevan 'to'. La forma correcta es: 'She should study harder.' No existe 'should to study' ni 'shoulds'." },
    ],
    intentos_maximos: 2,
    puntaje_minimo_aprobacion: 70,
  },
  { // P05 — fill_blanks: Be going to / will (futuro)
    // texto_con_huecos has exactly 6 ___
    instrucciones: "Complete each sentence with the correct future form. Use 'be going to' (am/is/are going to + base verb) for decided plans, or 'will' for spontaneous decisions and general predictions.",
    texto_con_huecos: "Look at those dark clouds — it ___ rain soon. I think I ___ bring an umbrella, just in case. My sister already has a plan: she ___ study in Querétaro next semester. She applied last month and got accepted. As for me, I haven't decided yet, but maybe I ___ take an English course online. Oh wait — your phone is ringing. ___ you answer it? Don't worry, I ___ wait for you.",
    huecos: [
      { posicion: 0, respuesta_correcta: "is going to", alternativas_aceptadas: ["'s going to"], pista: "Predicción basada en evidencia visible (nubes oscuras) → be going to" },
      { posicion: 1, respuesta_correcta: "will", alternativas_aceptadas: ["'ll"], pista: "Decisión espontánea tomada en el momento de hablar → will" },
      { posicion: 2, respuesta_correcta: "is going to", alternativas_aceptadas: ["'s going to"], pista: "Plan decidido antes de este momento (ya aplicó) → be going to" },
      { posicion: 3, respuesta_correcta: "will", alternativas_aceptadas: ["'ll"], pista: "Decisión no tomada aún, espontánea o tentativa → will" },
      { posicion: 4, respuesta_correcta: "Will", alternativas_aceptadas: ["will"], pista: "Ofrecimiento espontáneo o decisión inmediata → will" },
      { posicion: 5, respuesta_correcta: "will", alternativas_aceptadas: ["'ll"], pista: "Promesa o decisión espontánea en el momento → will" },
    ],
    distingue_mayusculas: false,
  },
  { // P06 — quiz_multiple_opcion: Expresiones de cortesía y conversación social
    preguntas: [
      { enunciado: "You meet someone for the first time. What is the most appropriate expression?", opciones: ["See you around!", "What have you been up to?", "Nice to meet you!", "Anyway, I have to go."], respuesta_correcta: 2, retroalimentacion: "'Nice to meet you' es la expresión estándar al conocer a alguien por primera vez. 'See you around' es una despedida; 'What have you been up to?' asume que ya se conocen; 'Anyway' se usa para cambiar de tema o despedirse." },
      { enunciado: "Your friend is talking a lot. You want to add your opinion politely. What do you say?", opciones: ["Stop! Let me talk now.", "Anyway, you are wrong.", "That's interesting, but can I add something?", "By the way, nobody asked you."], respuesta_correcta: 2, retroalimentacion: "'That's interesting, but can I add something?' es una señal de turn-taking educada: reconoces lo que dijo tu amigo y pides permiso para hablar. 'Stop!' y las otras opciones son agresivas o descorteses." },
      { enunciado: "You want to change the topic in a friendly conversation. Which connector works best?", opciones: ["Nice to meet you, but...", "By the way, did you see the fútbol game last night?", "See you around, also...", "How are you, however..."], respuesta_correcta: 1, retroalimentacion: "'By the way' se usa para introducir un tema nuevo o cambiar la dirección de la conversación de forma natural y amigable. Es el conector ideal para small talk." },
      { enunciado: "A classmate says: 'I'm a bit tired today.' What is a good empathetic response?", opciones: ["Anyway, let's start the activity.", "Oh, that happens to me too sometimes. Did you sleep well?", "By the way, what did you eat for dinner?", "Nice to meet you — are you always tired?"], respuesta_correcta: 1, retroalimentacion: "'Oh, that happens to me too sometimes. Did you sleep well?' es empático: valida el sentimiento del compañero y hace una pregunta de seguimiento. Las otras opciones ignoran el comentario o son inapropiadas." },
      { enunciado: "You are leaving after a casual conversation. Which farewell is the most informal and friendly?", opciones: ["I must go now. Goodbye.", "See you around!", "It was a pleasure to meet you. Farewell.", "I need to leave immediately."], respuesta_correcta: 1, retroalimentacion: "'See you around!' es una despedida informal y amigable, perfecta para conversaciones casuales entre jóvenes. 'Farewell' y 'It was a pleasure to meet you' son demasiado formales. 'I need to leave immediately' suena brusco." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P07 — fill_blanks: Pasado simple + pasado continuo (anécdota)
    // texto_con_huecos has exactly 6 ___
    instrucciones: "Complete the anecdote. Use the past continuous (was/were + verb-ing) or the past simple of the verb in parentheses.",
    texto_con_huecos: "Last Saturday, I ___ (walk) through the Mercado de Artesanías in San Cristóbal de las Casas when I suddenly heard music. A group of musicians ___ (play) traditional Chiapaneca music near the entrance. While I ___ (watch) them, a child tugged at my sleeve. She ___ (sell) handmade bracelets and smiled at me. I ___ (buy) three bracelets. While I ___ (pay), the musicians started playing louder — it was a magical moment.",
    huecos: [
      { posicion: 0, respuesta_correcta: "was walking", alternativas_aceptadas: [], pista: "Acción en progreso cuando ocurrió algo → past continuous (was + verb-ing)" },
      { posicion: 1, respuesta_correcta: "were playing", alternativas_aceptadas: [], pista: "Acción en progreso (grupo de músicos) → past continuous (were + verb-ing)" },
      { posicion: 2, respuesta_correcta: "was watching", alternativas_aceptadas: [], pista: "Acción en progreso (mientras miraba) → past continuous (was + verb-ing)" },
      { posicion: 3, respuesta_correcta: "was selling", alternativas_aceptadas: [], pista: "Acción en progreso (estaba vendiendo) → past continuous (was + verb-ing)" },
      { posicion: 4, respuesta_correcta: "bought", alternativas_aceptadas: [], pista: "Evento completado en el pasado → past simple irregular: buy → bought" },
      { posicion: 5, respuesta_correcta: "was paying", alternativas_aceptadas: [], pista: "Acción en progreso (mientras pagaba) → past continuous (was + verb-ing)" },
    ],
    distingue_mayusculas: false,
  },
  { // P08 — quiz_multiple_opcion: Repaso de tiempos verbales A2+
    preguntas: [
      { enunciado: "My friends and I ___ at the UNAM library every Tuesday. It's our weekly habit.", opciones: ["studied", "are going to study", "study", "were studying"], respuesta_correcta: 2, retroalimentacion: "Las rutinas y hábitos regulares usan el PRESENTE SIMPLE. 'Every Tuesday' es un marcador de frecuencia que confirma que se trata de un hábito, no de un evento pasado o un plan futuro." },
      { enunciado: "Last night, I ___ my homework when the electricity went out.", opciones: ["did", "do", "was doing", "am going to do"], respuesta_correcta: 2, retroalimentacion: "Patrón clásico: PASADO CONTINUO para la acción en progreso + PASADO SIMPLE para el evento que interrumpe. 'I was doing my homework (acción en progreso) when the electricity went out (evento).'"},
      { enunciado: "Look at those suitcases! They ___ on a trip.", opciones: ["will go", "go", "are going to go", "went"], respuesta_correcta: 2, retroalimentacion: "'Be going to' se usa para predicciones basadas en evidencia visible (las maletas = evidencia de un viaje). 'Will' se usaría para predicciones generales sin evidencia específica." },
      { enunciado: "I can't find my keys. Don't worry — I ___ help you look for them.", opciones: ["am going to", "will", "was", "should"], respuesta_correcta: 1, retroalimentacion: "'Will' expresa una decisión espontánea tomada en el momento de hablar (acaba de ofrecerse a ayudar ahora mismo). 'Am going to' implica un plan decidido con anticipación, no una decisión espontánea." },
      { enunciado: "Last year, my cousin ___ to Oaxaca for Día de Muertos and ___ the most beautiful altars she had ever seen.", opciones: ["travels / sees", "was travelling / was seeing", "travelled / saw", "is going to travel / will see"], respuesta_correcta: 2, retroalimentacion: "Dos acciones completadas en el pasado con marcador temporal 'last year' → ambas en PASADO SIMPLE. 'Travelled' (regular) y 'saw' (irregular: see → saw) son las formas correctas." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
];

// ── CONTENIDOS A3 ─────────────────────────────────────────────────────────────

const contenidosA3 = [
  { // P01 — reflexion_escrita: Describe una experiencia pasada
    prompt: "Describe un viaje, visita o experiencia que hayas tenido en el pasado. Puede ser una celebración (Día de Muertos, quinceañera, graduación), una excursión escolar, un viaje a otra ciudad o un evento especial.\n\nEscribe en inglés o en español (o los dos). Tu texto debe incluir al menos 5 verbos en pasado (past simple) y al menos 2 conectores de secuencia (first, then, after that, later, finally, in the end). Describe dónde fuiste, qué hiciste, y cómo te sentiste al final.",
    pistas: [
      "Empieza con un tiempo y lugar: 'Last year, I went to...' / 'When I was 12, my family visited...'",
      "Usa verbos irregulares comunes: went (go), saw (see), ate (eat), bought (buy), felt (feel), met (meet), took (take).",
      "Conectores de secuencia: First, we... / Then, we... / After that, ... / Finally, ...",
      "Cierra con una reflexión: 'In the end, it was... because...' / 'That experience taught me that...'",
    ],
    longitud_minima_palabras: 80,
    criterios_evaluacion: [
      "Usa al menos 5 verbos en pasado simple (regulares o irregulares) correctamente",
      "Incluye al menos 2 conectores de secuencia en su posición correcta",
      "Describe un lugar, evento o experiencia con detalles específicos",
      "Cierra con una reflexión o evaluación personal de la experiencia",
    ],
  },
  { // P02 — reflexion_escrita: Compara dos cosas y justifica tu preferencia
    prompt: "Compara dos cosas que conozcas bien: dos ciudades, dos platillos, dos actividades, dos lugares o dos opciones de vida. Justifica por qué prefieres una sobre la otra.\n\nEscribe en inglés o en español. Tu texto debe incluir al menos 3 comparativos o superlativos y al menos 2 conjunciones (and, so, but) para conectar tus ideas.",
    pistas: [
      "Comparativos: bigger than, more interesting than, better than, worse than, cheaper than.",
      "Superlativos: the best, the most delicious, the most popular, the closest, the cheapest.",
      "Conjunciones: 'I prefer X and it is also...' / 'X is bigger, but Y is more...' / 'Y is cheaper, so I...'",
      "Ideas para comparar: tacos de canasta vs. tortas ahogadas, CDMX vs. Oaxaca, estudiar en casa vs. en la biblioteca, caminar vs. el camión.",
    ],
    longitud_minima_palabras: 80,
    criterios_evaluacion: [
      "Usa al menos 3 formas comparativas o superlativas correctas",
      "Usa las conjunciones and, so, y/o but para conectar ideas",
      "Compara dos cosas concretas con detalles específicos",
      "Justifica su preferencia con al menos una razón clara",
    ],
  },
  { // P03 — autoevaluacion: Rutinas y presente simple
    reflexion_final_prompt: "Describe en inglés tu rutina ideal de un día entre semana. Usa presente simple, al menos dos adverbios de frecuencia y la conjunción 'because' para explicar al menos una de tus rutinas.",
    criterios: [
      {
        descripcion: "Puedo describir mis rutinas y hábitos diarios usando el presente simple en afirmativo, negativo e interrogativo.",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Solo puedo escribir oraciones afirmativas básicas en presente simple con muchos errores." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Formo oraciones afirmativas y negativas en presente simple, pero cometo errores con la tercera persona (he/she/it + -s)." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Uso el presente simple correctamente en afirmativo, negativo e interrogativo, incluyendo la -s de tercera persona y los verbos irregulares (have, go, do)." },
        ],
      },
      {
        descripcion: "Puedo usar adverbios de frecuencia (always, usually, often, sometimes, rarely, never) en la posición correcta dentro de la oración.",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Conozco 1-2 adverbios de frecuencia pero no sé dónde colocarlos." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Uso los adverbios de frecuencia principales pero a veces los coloco en posición incorrecta (ej. al final en lugar de antes del verbo principal)." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Coloco los adverbios de frecuencia correctamente: antes del verbo principal y después de 'be'. Uso variedad de adverbios para expresar distintos grados de frecuencia." },
        ],
      },
      {
        descripcion: "Puedo usar 'because' para explicar la razón o causa de un hábito o rutina.",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Describo rutinas pero no puedo conectar la causa con la acción usando 'because'." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Uso 'because' en algunas oraciones pero a veces confundo su posición o lo uso con 'so' incorrectamente." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Uso 'because' correctamente para explicar causas: 'I exercise because it helps me feel better.' Distingo entre 'because' (causa) y 'so' (consecuencia)." },
        ],
      },
      {
        descripcion: "Puedo usar vocabulario específico de hábitos y rutinas (wake up, commute, tend to, get used to) en contexto.",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Solo conozco vocabulario muy básico de rutinas (eat, sleep, go to school)." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Conozco más vocabulario pero me cuesta usarlo en oraciones propias sin ayuda." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Uso con confianza expresiones como wake up, go to bed, commute, tend to, get used to, rarely, due to en oraciones propias y significativas." },
        ],
      },
    ],
  },
  { // P04 — reflexion_escrita: Consejos para un estudiante nuevo
    prompt: "Imagina que un estudiante más joven está a punto de empezar el bachillerato y te pide consejo. Escribe al menos 3 consejos usando should o shouldn't, y al menos 1 imperativo (afirmativo o negativo).\n\nEscribe en inglés o en español. Los consejos pueden ser sobre: estudiar, hacer amigos, organizar el tiempo, cuidar la salud o usar las redes sociales.",
    pistas: [
      "Estructura: 'You should + base verb...' / 'You shouldn't + base verb...'",
      "Empieza con empatía: 'Starting bachillerato can be challenging, but...'",
      "Usa contexto mexicano: el transporte, los maestros, la cafetería, las materias del NEM.",
      "Añade una razón con 'because': 'You should sleep 8 hours because it improves your memory.'",
    ],
    longitud_minima_palabras: 80,
    criterios_evaluacion: [
      "Usa al menos 3 oraciones con should o shouldn't correctamente (sin 'to' después)",
      "Incluye al menos 1 imperativo (afirmativo o negativo: Do this / Don't do that)",
      "Los consejos son específicos y útiles para un contexto de bachillerato mexicano",
      "Usa 'because' o una razón para justificar al menos uno de los consejos",
    ],
  },
  { // P05 — reflexion_escrita: Planes para el próximo año
    prompt: "Escribe sobre tus planes para el próximo año o para cuando termines el bachillerato. ¿Qué vas a hacer? ¿Por qué es importante para ti?\n\nEscribe en inglés o en español. Usa 'be going to' para al menos 3 planes y explica por qué cada plan importa usando 'because'.",
    pistas: [
      "Estructura be going to: 'I am going to + base verb...' (para planes decididos).",
      "Estructura will: 'I think I will...' o 'Maybe I will...' (para decisiones no tan firmes).",
      "Razones con because: 'I am going to study English because I want to work in tourism.'",
      "Ideas: estudiar en una universidad, aprender un idioma, trabajar, viajar, ayudar a mi familia, participar en un proyecto comunitario.",
    ],
    longitud_minima_palabras: 80,
    criterios_evaluacion: [
      "Usa 'be going to' correctamente para al menos 3 planes (am/is/are going to + base verb)",
      "Explica al menos 2 planes con 'because' + razón personal",
      "Los planes son concretos y específicos, no solo ideas vagas",
      "El texto tiene coherencia y muestra reflexión personal genuina",
    ],
  },
  { // P06 — autoevaluacion: Conversaciones sociales
    reflexion_final_prompt: "Write a short social dialogue in English (6-8 lines) between two classmates who haven't seen each other for two weeks. Include: a greeting, at least one small talk topic (weekend, fútbol mexicano, a recent event), and a friendly farewell. Use at least 3 expressions from the vocabulary studied.",
    criterios: [
      {
        descripcion: "Puedo iniciar y responder a un saludo en inglés de forma natural y apropiada para el contexto.",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Solo sé decir 'Hello' y 'Fine, thanks'. Me cuesta responder de forma natural o ampliar el saludo." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Uso saludos básicos y respondo, pero me cuesta variar las expresiones o adaptar el tono al contexto (formal vs. informal)." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Inicio y respondo saludos con variedad (How are you? / What have you been up to? / Nice to see you!) y adapto el tono al contexto de manera natural." },
        ],
      },
      {
        descripcion: "Puedo mantener una conversación breve usando small talk y expresiones de cortesía.",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Me quedo sin palabras después del saludo inicial — no sé cómo continuar la conversación." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Puedo hacer una pregunta de small talk (el clima, el fin de semana) pero me cuesta mantener el flujo de la conversación más de 2-3 intercambios." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Mantengo una conversación breve usando small talk (clima, fin de semana, fútbol, estudios), expresiones de cortesía y señales de turn-taking (By the way..., That's interesting..., Can I ask...)." },
        ],
      },
      {
        descripcion: "Puedo cerrar una conversación de forma educada y natural usando expresiones de despedida.",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Solo sé decir 'Goodbye'. Me cuesta cerrar la conversación de forma educada." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Uso 'Goodbye' o 'Bye', pero no domino las variantes más informales o las frases de transición para cerrar (Anyway, I have to go...)." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Cierro conversaciones de forma natural usando expresiones como 'Anyway, I should get going', 'See you around!', 'Nice talking to you!', 'Take care!' según el nivel de formalidad." },
        ],
      },
      {
        descripcion: "Reconozco y uso señales de turn-taking para participar respetuosamente en una conversación en inglés.",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "No conozco señales de turn-taking y tiendo a interrumpir o quedarme en silencio sin saber cuándo hablar." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Conozco algunas señales (By the way..., Can I add something?) pero me cuesta usarlas de forma espontánea." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Uso señales de turn-taking de forma natural: 'That's interesting, but...', 'Can I add something?', 'By the way...', 'Anyway...' para tomar y ceder el turno educadamente." },
        ],
      },
    ],
  },
  { // P07 — reflexion_escrita: Cuenta una anécdota
    prompt: "Cuenta una anécdota real o inventada usando el pasado simple y el pasado continuo. La anécdota debe incluir un momento inesperado o sorprendente.\n\nEscribe en inglés o en español. Tu texto debe incluir al menos 2 verbos en pasado continuo (was/were + -ing) y al menos 4 verbos en pasado simple. Usa el patrón 'I was doing... when something happened' o 'While I was doing..., something happened'.",
    pistas: [
      "Establece el contexto con pasado continuo: 'I was walking to school when...' / 'We were eating tacos when suddenly...'",
      "El evento inesperado en pasado simple: 'a dog ran past me', 'the teacher walked in', 'it started to rain'.",
      "Verbos irregulares útiles: ran (run), fell (fall), dropped (drop), saw (see), heard (hear), found (find), met (meet).",
      "Adverbios para el momento inesperado: suddenly (de repente), at that moment (en ese momento), all of a sudden (de repente).",
    ],
    longitud_minima_palabras: 80,
    criterios_evaluacion: [
      "Usa al menos 2 verbos en pasado continuo (was/were + verb-ing) para el contexto o la acción en progreso",
      "Usa al menos 4 verbos en pasado simple para los eventos de la historia",
      "Incluye un momento inesperado o sorprendente claramente identificable",
      "La anécdota tiene estructura clara: contexto → evento inesperado → desenlace",
    ],
  },
  { // P08 — autoevaluacion: Consolidación A2+
    reflexion_final_prompt: "What was the most challenging grammar topic for you in English IV? Write 3 sentences in English: one in present simple, one in past simple, and one using 'be going to'. This shows your ability to use all three tenses you have studied.",
    criterios: [
      {
        descripcion: "Puedo usar el presente simple para describir hábitos y rutinas, el pasado simple para narrar eventos pasados, y 'be going to' / 'will' para expresar planes y predicciones.",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Confundo los tres tiempos con frecuencia y me cuesta elegir el correcto según el contexto." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Identifico correctamente el tiempo verbal en la mayoría de los casos, pero cometo errores al producirlo, especialmente con verbos irregulares o la diferencia entre will y be going to." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Uso los tres tiempos verbales (presente simple, pasado simple, be going to/will) correctamente en producción escrita y oral con pocos errores." },
        ],
      },
      {
        descripcion: "Puedo combinar pasado simple y pasado continuo para narrar anécdotas con un momento inesperado.",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "No distingo entre pasado simple y pasado continuo — los confundo o uso solo uno." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Entiendo la diferencia entre ambos tiempos pero cometo errores al formarlos (ej. was + base verb en lugar de was + verb-ing)." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Combino pasado simple y pasado continuo correctamente usando los patrones 'was doing... when...' y 'while I was doing...' para narrar anécdotas con estructura clara." },
        ],
      },
      {
        descripcion: "Puedo expresar consejos con should/shouldn't y planes con be going to en contextos relevantes para mi vida.",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Cometo errores frecuentes con should (ej. 'should to go') y confundo be going to con will en casi todos los contextos." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Uso should y be going to en oraciones simples, pero me cuesta aplicarlos en textos más largos o en contextos no practicados directamente." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Uso should/shouldn't para dar y pedir consejos, y be going to para expresar planes decididos, de forma correcta y con confianza en situaciones variadas." },
        ],
      },
      {
        descripcion: "Puedo participar en una conversación social breve en inglés usando expresiones de cortesía, small talk y señales de turn-taking.",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Me bloqueo en conversaciones en inglés después del saludo inicial — no tengo vocabulario para continuar." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Puedo mantener 2-3 intercambios en inglés usando frases memorizadas, pero me cuesta reaccionar espontáneamente o adaptar las expresiones." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Inicio, mantengo y cierro conversaciones breves en inglés usando saludos, small talk, turn-taking y despedidas de forma natural y apropiada al contexto." },
        ],
      },
    ],
  },
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });

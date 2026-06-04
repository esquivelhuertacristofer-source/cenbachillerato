/**
 * Refuerzo de actividades para IN-V (Inglés V — nivel A2+/B1, unidad "We are the champions",
 * semestre 5, MCCEMS 2025). Agrega A4-A7 a cada una de las 8 progresiones (ya tienen A1-A3):
 *   A4 = quiz_verdadero_falso · A5 = glosario_interactivo · A6 = fill_blanks · A7 = autoevaluacion
 * 8 progresiones × 4 = 32 actividades nuevas. estado='borrador'.
 * Contenido en inglés (A2+/B1) vinculado al campo de estudio o área de interés del grupo.
 * Uso: npx tsx scripts/seed-activities-inv-refuerzo.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad, type ActividadInput } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

type Refuerzo = Pick<ActividadInput, "titulo" | "descripcion" | "tipo" | "xp" | "contenido">;

const letras = ["A4", "A5", "A6", "A7"];

// Escala estándar de autoevaluación (1-4) reutilizada en todas las progresiones.
const escala4 = [
  { valor: 1, etiqueta: "En inicio", descripcion: "Todavía necesito apoyo y consultar el material." },
  { valor: 2, etiqueta: "En proceso", descripcion: "Lo logro con algunos errores o dudas." },
  { valor: 3, etiqueta: "Logrado", descripcion: "Lo hago bien de forma autónoma." },
  { valor: 4, etiqueta: "Destacado", descripcion: "Lo hago con seguridad y puedo ayudar a otra persona." },
];

async function main() {
  const sb = createSB();
  log("\n🌱 Refuerzo IN-V — Inglés V: A4-A7 por progresión\n");

  const progs = await getProgresionesDeUAC(sb, "IN-V");
  let ok = 0; let fail = 0;

  for (const p of progs) {
    const set = refuerzos[p.numero - 1];
    if (!set) { log(`⚠️  Sin refuerzos definidos para P${p.numero}`); continue; }
    for (let i = 0; i < set.length; i++) {
      const r = set[i];
      const res = await upsertActividad(sb, {
        codigo: `${p.codigo}-${letras[i]}`,
        titulo: r.titulo,
        descripcion: r.descripcion,
        tipo: r.tipo,
        progresion_id: p.id,
        xp: r.xp,
        contenido: r.contenido,
      });
      res ? ok++ : fail++;
    }
  }

  log(`\n✅ IN-V refuerzo: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── REFUERZOS POR PROGRESIÓN ───────────────────────────────────────────────────

const refuerzos: Refuerzo[][] = [
  // ════════════ P01 — Explora y describe el área de estudio, ocupación o interés del grupo ════════════
  [
    {
      titulo: "True or False — Describing Your Field of Study",
      descripcion: "Decide si cada afirmación sobre cómo describir en inglés un campo de estudio, ocupaciones e intereses es verdadera o falsa. Practicarás el uso correcto del vocabulario y las estructuras gramaticales para presentar tu área de interés.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "The sentence 'I am interested in engineering' correctly uses the preposition 'in' after 'interested'.",
            respuesta: true,
            retroalimentacion: "Correct! 'Interested in' is the fixed collocation in English. Examples: 'I am interested in medicine / technology / design.' Always use 'in', never 'of' or 'about'.",
          },
          {
            enunciado: "To describe your field of study, you can say: 'My area of study are biology.' This sentence is grammatically correct.",
            respuesta: false,
            retroalimentacion: "False. 'My area of study' is singular, so the verb must be singular too: 'My area of study IS biology.' Subject-verb agreement is essential in English.",
          },
          {
            enunciado: "The phrase 'I'm currently studying graphic design at a high school level' is an appropriate way to introduce your field of study in English.",
            respuesta: true,
            retroalimentacion: "Correct! 'I'm currently studying + subject' (present continuous) is a natural and accurate way to describe what you are studying right now. 'Currently' makes it clear it is happening at this moment.",
          },
          {
            enunciado: "In English, 'career' and 'major' always mean exactly the same thing and are completely interchangeable.",
            respuesta: false,
            retroalimentacion: "False. 'Major' refers specifically to the main subject or area of study at a university level. 'Career' refers to a person's professional life or occupation over time. They overlap but are not interchangeable in all contexts.",
          },
          {
            enunciado: "The sentence 'This field involves working with technology, people, and data' correctly uses the verb 'involve' followed by a gerund (-ing form).",
            respuesta: true,
            retroalimentacion: "Correct! 'Involve' is followed by a gerund (verb + -ing). Example: 'This job involves analyzing data / helping patients / designing structures.' This is a fixed grammar rule.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Describing Your Field of Study in English",
      descripcion: "Glosario interactivo con frases y estructuras clave en inglés para explorar y describir tu área de estudio, ocupación o interés. Nivel A2+/B1.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "I'm currently studying...",
            definicion: "A phrase using the present continuous to describe your current field or course of study. It indicates an ongoing activity happening now.",
            ejemplo: "'I'm currently studying health sciences at the bachillerato level.' / 'I'm currently studying programming and digital design.'",
            etiquetas: ["present continuous", "introduction", "field of study"],
          },
          {
            termino: "My field of study is...",
            definicion: "A simple and direct phrase to introduce the area or discipline you are studying. 'Field' means a domain of knowledge or professional activity.",
            ejemplo: "'My field of study is engineering.' / 'My field of study is social communication and media.'",
            etiquetas: ["vocabulary", "introduction"],
          },
          {
            termino: "This area involves...",
            definicion: "Used to explain what activities, skills, or tasks are part of a particular field. 'Involve' is followed by a gerund (verb + -ing).",
            ejemplo: "'This area involves designing, testing, and improving systems.' / 'This field involves caring for patients and applying medical knowledge.'",
            etiquetas: ["gerund", "description", "functions"],
          },
          {
            termino: "It is related to...",
            definicion: "A phrase to show connections between your field and other topics, subjects, or real-world applications. Preposition 'to' is always used after 'related'.",
            ejemplo: "'Biotechnology is related to biology, chemistry, and medicine.' / 'Architecture is related to art, mathematics, and engineering.'",
            etiquetas: ["collocations", "connections"],
          },
          {
            termino: "One of the main goals of this field is to...",
            definicion: "A structure to describe the purpose or objective of a field of study. 'Goal' = objective or aim. Use 'to + infinitive' after 'goal is'.",
            ejemplo: "'One of the main goals of this field is to solve environmental problems.' / 'One of the main goals of nursing is to provide quality care.'",
            etiquetas: ["purpose", "infinitive"],
          },
          {
            termino: "Professionals in this field...",
            definicion: "A phrase to describe what experts or workers in your area of study typically do. It introduces typical tasks, roles, or responsibilities.",
            ejemplo: "'Professionals in this field design and build safe structures.' / 'Professionals in this field analyze data to make decisions.'",
            etiquetas: ["professions", "description", "simple present"],
          },
        ],
        actividad_final: "Write 3-5 sentences in English describing your group's field of study or area of interest. Use at least three phrases from this glossary: introduce the field ('My field of study is...'), explain what it involves ('This area involves...'), and describe one goal ('One of the main goals is to...').",
      },
    },
    {
      titulo: "Fill in the Blanks — Exploring Your Field of Study",
      descripcion: "Completa las oraciones en inglés con la palabra o frase correcta para describir un área de estudio o interés. Practica vocabulario y gramática A2+/B1.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Complete each blank with the correct word or phrase. Pay attention to grammar and vocabulary.",
        texto_con_huecos: "My ___ of study is health sciences. This field ___ working with patients and analyzing medical data. Professionals in this area are ___ in biology, chemistry, and human anatomy. One of the main ___ of this field is to improve people's quality of life.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "field",
            alternativas_aceptadas: ["area"],
            pista: "We say 'My ___ of study is...' to introduce our subject. It can be 'field' or 'area'.",
          },
          {
            posicion: 1,
            respuesta_correcta: "involves",
            alternativas_aceptadas: ["includes"],
            pista: "The verb '___ + gerund' is used to describe what activities a field includes. Think: 'This field ___ working...'",
          },
          {
            posicion: 2,
            respuesta_correcta: "interested",
            alternativas_aceptadas: [],
            pista: "They are ___ in biology... Use the adjective that goes with the preposition 'in' to express interest.",
          },
          {
            posicion: 3,
            respuesta_correcta: "goals",
            alternativas_aceptadas: ["objectives", "aims"],
            pista: "'One of the main ___ of this field is to...' — think of words that mean 'objectives' or 'purposes'.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Exploro y describo mi área de estudio en inglés",
      descripcion: "Reflexiona sobre tu capacidad para explorar y describir en inglés tu campo de estudio, ocupación o interés (P01 de IN-V).",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio. Esto te ayudará a identificar qué reforzar.",
        criterios: [
          { descripcion: "Puedo presentar mi campo de estudio en inglés usando frases como 'My field of study is...' o 'I'm currently studying...' con pronunciación y gramática aceptables.", escala: escala4 },
          { descripcion: "Puedo describir qué actividades o tareas implica mi área usando 'involves + gerund' y vocabulario relacionado.", escala: escala4 },
          { descripcion: "Puedo mencionar por qué es relevante mi área de estudio usando 'One of the main goals is to...' u otras estructuras de propósito.", escala: escala4 },
          { descripcion: "Comprendo y uso correctamente las preposiciones clave: 'interested IN', 'related TO', 'involved IN'.", escala: escala4 },
        ],
        reflexion_final_prompt: "En inglés, escribe 2-3 oraciones describiendo tu campo de estudio. Luego, en español, reflexiona: ¿Qué parte te costó más trabajo expresar en inglés? ¿Qué vocabulario nuevo aprendiste en esta progresión?",
      },
    },
  ],

  // ════════════ P02 — Comparte experiencias personales o escolares relacionadas con el campo de estudio ════════════
  [
    {
      titulo: "True or False — Sharing Personal Experiences in English",
      descripcion: "Decide si cada afirmación sobre el uso del pasado simple y del presente perfecto para compartir experiencias personales o escolares relacionadas con el área de estudio es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "The sentence 'I have visited a hospital last year' is grammatically correct in English.",
            respuesta: false,
            retroalimentacion: "False. When a specific past time is mentioned ('last year'), you must use the simple past: 'I visited a hospital last year.' The present perfect ('have visited') is used for experiences without a specific time, e.g., 'I have visited a hospital before.'",
          },
          {
            enunciado: "To narrate a personal experience in sequence, connecting words like 'first', 'then', 'after that', and 'finally' are commonly used in English.",
            respuesta: true,
            retroalimentacion: "Correct! Sequencing words (discourse markers) help organize a narrative clearly. Example: 'First, I observed the experiment. Then, I recorded the results. Finally, I wrote my conclusion.'",
          },
          {
            enunciado: "The sentence 'When I was in middle school, I discovered my passion for technology' uses the past simple correctly.",
            respuesta: true,
            retroalimentacion: "Correct! 'Was' (past of 'be') and 'discovered' (past simple of 'discover') are both correct. This sentence describes a completed event in the past at a specific time ('when I was in middle school').",
          },
          {
            enunciado: "In English, 'I enjoyed working with computers since I was a child' is a correct sentence.",
            respuesta: false,
            retroalimentacion: "False. 'Since' requires the present perfect: 'I have enjoyed working with computers since I was a child.' Using simple past 'enjoyed' with 'since' is incorrect because 'since' connects a past starting point to the present.",
          },
          {
            enunciado: "The phrase 'This experience made me realize that...' is a useful structure to explain how a past experience influenced your interest in a field.",
            respuesta: true,
            retroalimentacion: "Correct! 'This experience made me realize that...' is a natural and effective structure to express the impact of a past event. 'Made me + base verb' (made me realize / made me understand / made me want) is a common English pattern.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Sharing Experiences Related to Your Field of Study",
      descripcion: "Glosario interactivo con frases y estructuras clave en inglés para narrar experiencias personales o escolares relacionadas con el área de estudio. Nivel A2+/B1.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "When I was..., I...",
            definicion: "A structure using the past simple to set a time context and narrate what happened. 'When I was [age/place], I [past simple verb]...'",
            ejemplo: "'When I was in secondary school, I joined a science club.' / 'When I was twelve, I built my first computer program.'",
            etiquetas: ["past simple", "narrative", "experience"],
          },
          {
            termino: "I have always been interested in...",
            definicion: "Uses the present perfect with 'always' to describe a long-standing interest that started in the past and continues now.",
            ejemplo: "'I have always been interested in medicine.' / 'I have always been interested in how machines work.'",
            etiquetas: ["present perfect", "interest", "narration"],
          },
          {
            termino: "This experience taught me...",
            definicion: "A past simple structure to explain what you learned from a specific experience. 'Teach' (past: taught) is used with a person as the indirect object.",
            ejemplo: "'This experience taught me the importance of teamwork.' / 'This experience taught me that perseverance leads to success.'",
            etiquetas: ["past simple", "reflection", "learning"],
          },
          {
            termino: "First... Then... After that... Finally...",
            definicion: "Sequencing connectors used to organize a narrative in chronological order. Essential for telling a story or describing a sequence of events clearly.",
            ejemplo: "'First, I read about biotechnology. Then, I attended a workshop. After that, I did a lab experiment. Finally, I decided this was my field.'",
            etiquetas: ["discourse markers", "narrative", "sequencing"],
          },
          {
            termino: "That is why I decided to...",
            definicion: "A cause-and-effect connector in the past tense, used to explain the reason for a decision. Links an experience to a conclusion or action.",
            ejemplo: "'I saw how engineers helped my community. That is why I decided to study civil engineering.' ",
            etiquetas: ["cause and effect", "decision", "narration"],
          },
          {
            termino: "It was a challenging / rewarding / eye-opening experience.",
            definicion: "Adjective phrases used to evaluate a past experience. 'Challenging' = difficult but worthy. 'Rewarding' = satisfying. 'Eye-opening' = it changed how you see something.",
            ejemplo: "'Working in the health center was a rewarding experience.' / 'The internship was challenging, but I learned a lot.'",
            etiquetas: ["adjectives", "evaluation", "experience"],
          },
        ],
        actividad_final: "In 4-6 sentences, write about a personal or school experience related to your field of study. Use: (1) a time connector to start ('When I was...'), (2) at least two sequencing words ('first', 'then', 'after that', 'finally'), and (3) a reflection phrase ('This experience taught me...' or 'That is why I decided to...').",
      },
    },
    {
      titulo: "Fill in the Blanks — Narrating a Personal Experience in English",
      descripcion: "Completa la narración en inglés sobre una experiencia escolar relacionada con el campo de estudio. Practica pasado simple, conectores y vocabulario A2+/B1.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Complete the blanks with the correct word or phrase to narrate a personal experience.",
        texto_con_huecos: "When I ___ in secondary school, I participated in a science fair. First, I chose a topic related to my field. ___, I conducted experiments and collected data. This experience ___ me that research requires patience and creativity. That is ___ I decided to pursue this area of study.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "was",
            alternativas_aceptadas: [],
            pista: "Use the past simple of 'be' for the first person singular: 'When I ___ in secondary school...'",
          },
          {
            posicion: 1,
            respuesta_correcta: "Then",
            alternativas_aceptadas: ["After that", "Next"],
            pista: "Use a sequencing connector to show the next step after 'First'. Try 'Then', 'After that', or 'Next'.",
          },
          {
            posicion: 2,
            respuesta_correcta: "taught",
            alternativas_aceptadas: ["showed"],
            pista: "Past simple of 'teach': 'This experience ___ me that...' (irregular verb: teach → taught).",
          },
          {
            posicion: 3,
            respuesta_correcta: "why",
            alternativas_aceptadas: [],
            pista: "'That is ___ I decided...' is a cause-and-effect connector. Which question word completes it?",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Comparto mis experiencias en inglés",
      descripcion: "Reflexiona sobre tu capacidad para narrar en inglés experiencias personales o escolares relacionadas con tu campo de estudio (P02 de IN-V).",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Puedo narrar una experiencia personal o escolar en inglés usando el pasado simple de verbos regulares e irregulares comunes.", escala: escala4 },
          { descripcion: "Uso conectores de secuencia ('first', 'then', 'after that', 'finally') para organizar mi narración de forma coherente.", escala: escala4 },
          { descripcion: "Distingo cuándo usar el pasado simple y el presente perfecto para hablar de experiencias pasadas.", escala: escala4 },
          { descripcion: "Puedo expresar el impacto de una experiencia usando frases como 'This experience taught me...' o 'That is why I decided to...'.", escala: escala4 },
        ],
        reflexion_final_prompt: "En inglés, escribe 2-3 oraciones sobre una experiencia que despertó tu interés en tu área de estudio. Luego, en español: ¿Qué dificultad encontraste al usar los tiempos verbales del pasado en inglés? ¿Cómo lo resolviste?",
      },
    },
  ],

  // ════════════ P03 — Formula y responde preguntas sobre procesos, conceptos o procedimientos básicos ════════════
  [
    {
      titulo: "True or False — Asking and Answering Questions in English",
      descripcion: "Decide si cada afirmación sobre cómo formular y responder preguntas en inglés sobre procesos, conceptos y procedimientos relacionados con el campo de estudio es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "The question 'What is the process for applying to a university program?' is grammatically correct in English.",
            respuesta: true,
            retroalimentacion: "Correct! 'What is the process for + gerund/noun?' is a well-formed question. It uses 'for' + gerund ('applying') correctly. You can also say 'What is the procedure for...' or 'How do you apply to...?'",
          },
          {
            enunciado: "To ask about how something works, it is correct to say: 'How does this process work?' using the auxiliary 'does' with a third-person singular subject.",
            respuesta: true,
            retroalimentacion: "Correct! In the present simple, questions with third-person singular subjects require 'does': 'How does it work?' / 'How does the system operate?' This is a fundamental grammar rule for forming information questions.",
          },
          {
            enunciado: "The sentence 'Could you explain me the steps?' is the most grammatically correct way to politely ask for an explanation in English.",
            respuesta: false,
            retroalimentacion: "False. The correct structure is 'Could you explain the steps TO me?' or simply 'Could you explain the steps?' The verb 'explain' does not take a direct indirect object before the thing explained; use 'to me' at the end: 'explain [something] to [someone]'.",
          },
          {
            enunciado: "When answering a question about a process, using the passive voice ('The sample is collected and then analyzed') is appropriate in formal or technical contexts.",
            respuesta: true,
            retroalimentacion: "Correct! The passive voice is common in technical and scientific explanations in English because the focus is on the action, not the person doing it. Example: 'The data is recorded, processed, and then reported.'",
          },
          {
            enunciado: "In English, 'What does DNA stand for?' is a correct way to ask about an abbreviation or acronym.",
            respuesta: true,
            retroalimentacion: "Correct! 'What does [abbreviation] stand for?' is the standard English question to ask what letters in an acronym represent. Example: 'What does IT stand for?' — 'It stands for Information Technology.'",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Asking and Answering Questions About Processes",
      descripcion: "Glosario interactivo con estructuras y frases clave en inglés para formular y responder preguntas sobre procesos, conceptos y procedimientos básicos del campo de estudio. Nivel A2+/B1.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "What's the process for...?",
            definicion: "A question structure to ask about the steps or procedure involved in doing something. 'Process' refers to a series of actions or steps.",
            ejemplo: "'What's the process for analyzing a blood sample?' / 'What's the process for registering for a university course?'",
            etiquetas: ["question forms", "process", "procedure"],
          },
          {
            termino: "How does... work?",
            definicion: "A question used to ask for an explanation of how a system, machine, concept, or process functions. Uses auxiliary 'does' for third person singular.",
            ejemplo: "'How does photosynthesis work?' / 'How does a circuit breaker work?' / 'How does this software work?'",
            etiquetas: ["how questions", "explanation", "present simple"],
          },
          {
            termino: "Could you explain...?",
            definicion: "A polite request for an explanation. 'Could you explain + noun/phrase?' is more formal and indirect than 'Can you explain...?' Structure: explain [something] to [someone].",
            ejemplo: "'Could you explain the difference between hardware and software?' / 'Could you explain this concept to me?'",
            etiquetas: ["polite requests", "modal verbs", "explanation"],
          },
          {
            termino: "First... Second... Finally... / The first step is to...",
            definicion: "Structures for describing a process in order. These discourse markers help explain procedures step by step clearly.",
            ejemplo: "'The first step is to collect the data. Second, you organize it. Finally, you analyze and present your findings.'",
            etiquetas: ["sequencing", "process description", "discourse markers"],
          },
          {
            termino: "It is used to... / It is designed to...",
            definicion: "Passive voice structures to explain the purpose or function of a tool, concept, or procedure. 'Used to' = purpose; 'designed to' = intended function.",
            ejemplo: "'A microscope is used to observe cells that are invisible to the naked eye.' / 'This software is designed to process large amounts of data quickly.'",
            etiquetas: ["passive voice", "purpose", "function"],
          },
          {
            termino: "As far as I know... / In my understanding...",
            definicion: "Phrases to introduce an answer when you are not 100% certain. They show intellectual honesty and are common in academic and professional conversations.",
            ejemplo: "'As far as I know, the process takes about two weeks.' / 'In my understanding, the main function is to regulate temperature.'",
            etiquetas: ["hedging language", "uncertainty", "academic English"],
          },
        ],
        actividad_final: "Write a simulated interview in English (5-6 exchanges). Person A asks questions about a process or concept from your field of study. Person B answers using at least three structures from this glossary. Include: one 'How does...?' question, one polite request ('Could you explain...?'), and one sequenced answer ('The first step is to...').",
      },
    },
    {
      titulo: "Fill in the Blanks — Explaining a Process in English",
      descripcion: "Completa el diálogo en inglés sobre cómo funciona un proceso relacionado con el campo de estudio. Practica preguntas, respuestas y secuencia de pasos. Nivel A2+/B1.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Complete the blanks with the correct word or structure to complete this interview about a field-related process.",
        texto_con_huecos: "A: Could you ___ the steps for conducting a basic experiment? B: Of course. The ___ step is to define your question or hypothesis. Then, you design the method. ___, you collect and analyze your data. A: How ___ you record the results? B: The data is usually recorded in a table and then analyzed using statistics.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "explain",
            alternativas_aceptadas: ["describe"],
            pista: "'Could you ___ the steps...?' — use the base form of the verb that means 'make something clear'.",
          },
          {
            posicion: 1,
            respuesta_correcta: "first",
            alternativas_aceptadas: [],
            pista: "'The ___ step is to...' — what ordinal word begins a sequence?",
          },
          {
            posicion: 2,
            respuesta_correcta: "Finally",
            alternativas_aceptadas: ["After that", "Then"],
            pista: "Use a sequencing connector to indicate the last step in the process.",
          },
          {
            posicion: 3,
            respuesta_correcta: "do",
            alternativas_aceptadas: [],
            pista: "'How ___ you record...?' — present simple question with 'you' requires the auxiliary ___.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Formulo y respondo preguntas en inglés",
      descripcion: "Reflexiona sobre tu capacidad para formular y responder en inglés preguntas sobre procesos, conceptos y procedimientos básicos de tu campo de estudio (P03 de IN-V).",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Puedo formular preguntas correctas en inglés sobre procesos usando estructuras como 'How does...?', 'What's the process for...?', y 'Could you explain...?'.", escala: escala4 },
          { descripcion: "Puedo responder preguntas describiendo los pasos de un proceso en secuencia usando conectores ('first', 'then', 'finally') con coherencia.", escala: escala4 },
          { descripcion: "Comprendo y uso correctamente el auxiliar 'does' en preguntas de tercera persona singular en presente simple.", escala: escala4 },
          { descripcion: "Reconozco cuándo es apropiado usar la voz pasiva en inglés para describir procesos técnicos o científicos.", escala: escala4 },
        ],
        reflexion_final_prompt: "Piensa en un proceso importante de tu campo de estudio. En inglés, escribe tres preguntas que harías en una entrevista simulada sobre ese proceso. Luego, en español: ¿Qué fue lo más difícil al formular preguntas correctas en inglés?",
      },
    },
  ],

  // ════════════ P04 — Expresa opiniones, preferencias y preocupaciones sobre temas relacionados ════════════
  [
    {
      titulo: "True or False — Expressing Opinions and Preferences in English",
      descripcion: "Decide si cada afirmación sobre cómo expresar correctamente en inglés opiniones, preferencias y preocupaciones relacionadas con el campo de estudio o la comunidad es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "The sentence 'In my opinion, technology has a positive impact on education' is a correct and formal way to express an opinion in English.",
            respuesta: true,
            retroalimentacion: "Correct! 'In my opinion, + subject + verb...' is a standard structure for expressing opinions formally. Other options: 'I believe that...', 'I think that...', 'From my point of view...'",
          },
          {
            enunciado: "'I prefer study in groups than study alone' is a grammatically correct sentence for expressing preference in English.",
            respuesta: false,
            retroalimentacion: "False. After 'prefer', use gerunds (-ing forms): 'I prefer studying in groups to studying alone.' The structure is: prefer [gerund] to [gerund]. NOT 'than'.",
          },
          {
            enunciado: "To express a concern about the environment in your field, you can correctly say: 'I am worried about the impact of industrial waste on water quality.'",
            respuesta: true,
            retroalimentacion: "Correct! 'I am worried about + noun/gerund' is the standard structure for expressing concern. Other patterns: 'I am concerned about...', 'One of my concerns is...'",
          },
          {
            enunciado: "The phrase 'I would rather work outdoors than in an office' correctly uses the structure 'would rather + base verb + than + base verb'.",
            respuesta: true,
            retroalimentacion: "Correct! 'Would rather + base verb + than + base verb' expresses preference between two options. Example: 'I would rather collaborate with a team than work alone.'",
          },
          {
            enunciado: "When disagreeing politely in English, you can say: 'I see your point, but I think...' to acknowledge the other person's view before presenting your own.",
            respuesta: true,
            retroalimentacion: "Correct! 'I see your point, but...' is a polite disagreement strategy. It shows respect for the other person's view before introducing your own perspective. Other options: 'That's a good point, however...' / 'I understand what you mean, but...'",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Expressing Opinions, Preferences, and Concerns",
      descripcion: "Glosario interactivo con frases y estructuras clave en inglés para expresar opiniones, preferencias y preocupaciones sobre temas del campo de estudio o la comunidad. Nivel A2+/B1.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "In my opinion, / I believe that...",
            definicion: "Phrases used to introduce a personal opinion. 'In my opinion' is placed at the start of the sentence. 'I believe that' is followed by a full clause.",
            ejemplo: "'In my opinion, every student should learn basic coding skills.' / 'I believe that technology improves healthcare outcomes.'",
            etiquetas: ["opinions", "phrases", "formal English"],
          },
          {
            termino: "I prefer... to... / I would rather... than...",
            definicion: "'I prefer [gerund] to [gerund]' and 'I would rather [base verb] than [base verb]' are both used to express preference between two options.",
            ejemplo: "'I prefer working in a lab to working in an office.' / 'I would rather study medicine than law.'",
            etiquetas: ["preferences", "gerund", "would rather"],
          },
          {
            termino: "I am worried about / I am concerned about...",
            definicion: "Structures to express concern or anxiety about a situation or problem. Both are followed by a noun or gerund (-ing form).",
            ejemplo: "'I am worried about the lack of access to quality education in rural areas.' / 'I am concerned about climate change and its effect on agriculture.'",
            etiquetas: ["concerns", "prepositions", "social issues"],
          },
          {
            termino: "I see your point, but... / That's a good point, however...",
            definicion: "Polite disagreement phrases. They acknowledge the other person's idea before introducing a contrasting view. Essential for respectful discussion.",
            ejemplo: "'I see your point, but I think renewable energy is more cost-effective in the long run.' / 'That's a good point, however, we also need to consider the social impact.'",
            etiquetas: ["disagreement", "discussion", "polite language"],
          },
          {
            termino: "From my point of view... / As I see it...",
            definicion: "Phrases to introduce a personal perspective or interpretation, slightly more emphatic than 'in my opinion'. Common in discussions and debates.",
            ejemplo: "'From my point of view, healthcare should be accessible to everyone.' / 'As I see it, the biggest challenge in this field is funding.'",
            etiquetas: ["point of view", "opinion phrases"],
          },
          {
            termino: "I strongly believe that... / I am not sure, but...",
            definicion: "Adverbs like 'strongly' intensify an opinion. 'I am not sure, but...' introduces a tentative opinion with less certainty — useful for hedging.",
            ejemplo: "'I strongly believe that mental health should be part of the school curriculum.' / 'I am not sure, but I think the experiment needs more repetitions.'",
            etiquetas: ["hedging", "intensifiers", "certainty"],
          },
        ],
        actividad_final: "Write a short paragraph (4-6 sentences) in English expressing your opinion, a preference, and a concern about a topic related to your field of study. Use at least one phrase from each category: opinion ('In my opinion...' / 'I believe that...'), preference ('I prefer... to...' or 'I would rather...'), and concern ('I am worried about...' / 'I am concerned about...').",
      },
    },
    {
      titulo: "Fill in the Blanks — Expressing Opinions and Concerns",
      descripcion: "Completa el texto en inglés expresando opiniones, preferencias y preocupaciones relacionadas con un campo de estudio. Practica estructuras gramaticales clave del nivel A2+/B1.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Complete each blank with the correct word or phrase to express opinions, preferences, and concerns.",
        texto_con_huecos: "In my ___, access to technology is essential for students today. I prefer learning ___ hands-on activities to reading textbooks. I am ___ about the lack of resources in rural schools. I strongly ___ that education should be a right, not a privilege.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "opinion",
            alternativas_aceptadas: ["view"],
            pista: "'In my ___, access to technology is essential...' — which noun completes this opinion phrase?",
          },
          {
            posicion: 1,
            respuesta_correcta: "through",
            alternativas_aceptadas: ["with", "using"],
            pista: "'I prefer learning ___ hands-on activities...' — which preposition shows the method or means of learning?",
          },
          {
            posicion: 2,
            respuesta_correcta: "worried",
            alternativas_aceptadas: ["concerned"],
            pista: "'I am ___ about the lack of resources...' — use the adjective that expresses concern or anxiety.",
          },
          {
            posicion: 3,
            respuesta_correcta: "believe",
            alternativas_aceptadas: ["think"],
            pista: "'I strongly ___ that education should be a right...' — what verb follows 'I strongly' to express a firm opinion?",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Expreso opiniones y preferencias en inglés",
      descripcion: "Reflexiona sobre tu capacidad para expresar en inglés opiniones, preferencias y preocupaciones sobre temas relacionados con tu campo de estudio o la comunidad (P04 de IN-V).",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Puedo expresar mi opinión en inglés usando frases como 'In my opinion...', 'I believe that...' o 'From my point of view...' de forma fluida.", escala: escala4 },
          { descripcion: "Puedo expresar preferencias entre dos opciones usando 'I prefer [gerund] to [gerund]' o 'I would rather... than...' correctamente.", escala: escala4 },
          { descripcion: "Puedo expresar preocupaciones relacionadas con mi campo o comunidad usando 'I am worried/concerned about + noun/gerund'.", escala: escala4 },
          { descripcion: "Puedo mantener una discusión respetuosa en inglés, reconociendo la opinión del otro ('I see your point, but...') antes de dar la mía.", escala: escala4 },
        ],
        reflexion_final_prompt: "Elige un tema relevante para tu campo de estudio (por ejemplo: el uso de la inteligencia artificial, la escasez de agua, el acceso a servicios de salud). En inglés, escribe: (1) tu opinión, (2) tu preferencia, y (3) una preocupación al respecto. Luego reflexiona en español: ¿Qué estructuras gramaticales te resultaron más difíciles de usar?",
      },
    },
  ],

  // ════════════ P05 — Lee y analiza textos breves vinculados con el campo temático ════════════
  [
    {
      titulo: "True or False — Reading Comprehension Strategies in English",
      descripcion: "Decide si cada afirmación sobre estrategias de comprensión lectora, análisis y resumen de textos breves en inglés relacionados con el campo de estudio es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "Skimming a text means reading it very carefully, word by word, to understand every detail.",
            respuesta: false,
            retroalimentacion: "False. Skimming means reading quickly to get the general idea or main topic of a text — not for details. For details, you use 'scanning'. Skimming is useful to preview what a text is about before reading in depth.",
          },
          {
            enunciado: "The main idea of a paragraph is usually expressed in the topic sentence, which is most commonly found at the beginning of the paragraph.",
            respuesta: true,
            retroalimentacion: "Correct! In English academic texts, the topic sentence introduces the main idea of a paragraph and is typically the first sentence. The rest of the paragraph supports or develops that idea.",
          },
          {
            enunciado: "When summarizing a text in English, it is acceptable to copy entire sentences from the original text without quotation marks.",
            respuesta: false,
            retroalimentacion: "False. Copying text without quotation marks is plagiarism. A summary must paraphrase the original ideas in your own words. If you quote directly, use quotation marks and credit the source.",
          },
          {
            enunciado: "Linking words such as 'however', 'therefore', and 'in addition' help the reader understand the logical relationship between ideas in a text.",
            respuesta: true,
            retroalimentacion: "Correct! These are discourse connectors. 'However' signals contrast; 'therefore' signals consequence; 'in addition' adds information. Recognizing them improves reading comprehension significantly.",
          },
          {
            enunciado: "To express an opinion about a text you have read, you can use the phrase: 'According to the text, the author argues that...' followed by your own reaction.",
            respuesta: true,
            retroalimentacion: "Correct! 'According to the text/author...' is the standard phrase to introduce information from a source. After citing the text, you can add your reaction: '...which I find convincing / questionable / interesting because...'",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Reading and Analyzing Short Texts in English",
      descripcion: "Glosario interactivo con estrategias de comprensión lectora, frases para resumir y vocabulario clave para analizar textos breves en inglés relacionados con el campo de estudio. Nivel A2+/B1.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "The main idea of the text is...",
            definicion: "A phrase used to introduce the central message or topic of a text when summarizing or analyzing it. Equivalent to 'the text is mainly about...'",
            ejemplo: "'The main idea of the text is that early diagnosis improves cancer survival rates.' / 'The main idea of the article is the importance of renewable energy.'",
            etiquetas: ["reading comprehension", "main idea", "summarizing"],
          },
          {
            termino: "According to the author / According to the text...",
            definicion: "A citation phrase used to attribute an idea to the source text without copying it verbatim. Essential for academic writing and reading responses.",
            ejemplo: "'According to the author, climate change is the most urgent challenge of our generation.' / 'According to the text, regular exercise reduces the risk of chronic diseases.'",
            etiquetas: ["citation", "attribution", "reading response"],
          },
          {
            termino: "However / Nevertheless / On the other hand...",
            definicion: "Contrast connectors used in texts to introduce opposing ideas, counterarguments, or contrasting information. Recognizing them helps comprehension of complex texts.",
            ejemplo: "'Renewable energy is growing rapidly. However, it still represents a small percentage of global energy production.'",
            etiquetas: ["connectors", "contrast", "discourse markers"],
          },
          {
            termino: "In other words, / That is to say...",
            definicion: "Paraphrasing markers used in texts to restate a complex idea in simpler terms. Useful for both comprehension and for writing summaries.",
            ejemplo: "'The procedure is non-invasive. In other words, it does not require surgery or any incision.'",
            etiquetas: ["paraphrasing", "clarification", "reading strategies"],
          },
          {
            termino: "I find this text / argument... because...",
            definicion: "An opinion structure for evaluating a text. 'I find [noun/adjective] because [reason]' expresses a personal evaluation supported by reasoning.",
            ejemplo: "'I find this argument convincing because the author supports it with scientific data.' / 'I find this text difficult to understand because of the technical vocabulary.'",
            etiquetas: ["critical reading", "opinion", "evaluation"],
          },
          {
            termino: "To sum up / In conclusion / To summarize...",
            definicion: "Summary markers used at the end of a text or paragraph to restate the most important points. They signal that the writer is closing or concluding.",
            ejemplo: "'To sum up, the article argues that access to clean water is a fundamental human right.' / 'In conclusion, further research is needed in this field.'",
            etiquetas: ["summarizing", "conclusion", "discourse markers"],
          },
        ],
        actividad_final: "Read a short text (at least one paragraph) from your field of study — you can find one in a textbook, magazine, or online. Then write a 4-5 sentence response in English: (1) state the main idea, (2) use 'According to the text...' to cite one specific idea, (3) identify one connector ('however', 'therefore', etc.) and explain its function, and (4) give your opinion using 'I find this text...'.",
      },
    },
    {
      titulo: "Fill in the Blanks — Analyzing a Text in English",
      descripcion: "Completa el análisis de un texto en inglés sobre un tema del campo de estudio. Practica frases de comprensión lectora, conectores y vocabulario académico. Nivel A2+/B1.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Complete the blanks with the correct word or phrase to complete this reading analysis.",
        texto_con_huecos: "The ___ idea of the article is that renewable energy can reduce carbon emissions significantly. ___ to the author, solar power is the most accessible option for developing countries. The text is well-organized; ___, some technical terms are not explained clearly. To ___ up, the article makes a strong case for investing in clean energy technologies.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "main",
            alternativas_aceptadas: ["central"],
            pista: "'The ___ idea of the article is...' — what adjective describes the most important or central idea?",
          },
          {
            posicion: 1,
            respuesta_correcta: "According",
            alternativas_aceptadas: [],
            pista: "'___ to the author, solar power is...' — which word introduces a reference to what the author says?",
          },
          {
            posicion: 2,
            respuesta_correcta: "however",
            alternativas_aceptadas: ["nevertheless"],
            pista: "This connector introduces a contrasting idea. The text is well-organized; ___, some terms are unclear.",
          },
          {
            posicion: 3,
            respuesta_correcta: "sum",
            alternativas_aceptadas: [],
            pista: "'To ___ up' is a phrase used to introduce a summary or conclusion. What word completes it?",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Leo y analizo textos en inglés",
      descripcion: "Reflexiona sobre tu capacidad para leer, analizar, resumir y opinar sobre textos breves en inglés relacionados con tu campo de estudio (P05 de IN-V).",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Puedo identificar la idea principal de un texto corto en inglés y expresarla en mis propias palabras.", escala: escala4 },
          { descripcion: "Uso frases como 'According to the text/author...' para citar y referirme a fuentes en inglés sin copiar textualmente.", escala: escala4 },
          { descripcion: "Reconozco y comprendo conectores de contraste ('however', 'nevertheless'), consecuencia ('therefore') y adición ('in addition') al leer textos en inglés.", escala: escala4 },
          { descripcion: "Puedo escribir una opinión sobre un texto leído en inglés usando 'I find this text... because...' u otras estructuras de evaluación crítica.", escala: escala4 },
        ],
        reflexion_final_prompt: "Busca un texto corto (un párrafo o un artículo breve) sobre tu campo de estudio en inglés. Lee el título y el primer párrafo usando skimming. Luego, en inglés, escribe: (1) la idea principal y (2) una oración con tu opinión. En español, reflexiona: ¿Qué estrategia de lectura te ayudó más a comprender el texto?",
      },
    },
  ],

  // ════════════ P06 — Redacta textos funcionales para informar, solicitar o proponer acciones ════════════
  [
    {
      titulo: "True or False — Writing Functional Texts in English",
      descripcion: "Decide si cada afirmación sobre la redacción en inglés de textos funcionales (correos, solicitudes y propuestas breves) es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "A formal email in English typically begins with a greeting such as 'Dear Mr./Ms. [Last Name],' followed by a comma or colon.",
            respuesta: true,
            retroalimentacion: "Correct! Formal emails begin with 'Dear + title + last name' (e.g., 'Dear Dr. García,'). A comma or colon follows in English. Informal emails may use 'Hi [first name],' instead.",
          },
          {
            enunciado: "In a formal email, it is appropriate to use contractions like 'I'm', 'don't', and 'we're' throughout the message.",
            respuesta: false,
            retroalimentacion: "False. Contractions are informal and should be avoided in formal written communication in English. Write 'I am', 'do not', 'we are' instead. Contractions are fine in informal or conversational emails.",
          },
          {
            enunciado: "The phrase 'I am writing to request information about...' is a standard opening for a formal request letter or email in English.",
            respuesta: true,
            retroalimentacion: "Correct! 'I am writing to + infinitive...' is the standard formal opening for stating the purpose of a letter or email. Examples: 'I am writing to inform you...', 'I am writing to propose...', 'I am writing to request...'",
          },
          {
            enunciado: "To close a formal email in English, 'Yours sincerely' is appropriate when you know the recipient's name, while 'Yours faithfully' is used when you don't know the name.",
            respuesta: true,
            retroalimentacion: "Correct! This is a standard British English convention: 'Yours sincerely' when the name is known; 'Yours faithfully' when writing to 'Dear Sir/Madam'. Other closings: 'Best regards', 'Kind regards' (semi-formal).",
          },
          {
            enunciado: "The subject line of a professional email should be long and detailed, describing every point that will be discussed in the email.",
            respuesta: false,
            retroalimentacion: "False. Subject lines should be short, clear, and specific — typically 5-10 words. Example: 'Request for Information: Internship Opportunities' or 'Proposal: Community Health Project'. A long subject line is hard to read and unprofessional.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Writing Functional Texts: Emails, Requests, and Proposals",
      descripcion: "Glosario interactivo con frases y estructuras clave para redactar en inglés textos funcionales como correos, solicitudes y propuestas breves relacionadas con el campo de estudio. Nivel A2+/B1.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "I am writing to... (inform / request / propose / inquire)",
            definicion: "The standard opening for a formal email or letter in English. It states the purpose directly. 'I am writing to' is always followed by a base verb (infinitive without 'to' removed — actually 'to + verb').",
            ejemplo: "'I am writing to inform you of a change in our schedule.' / 'I am writing to request your assistance with our project.' / 'I am writing to propose a collaboration.'",
            etiquetas: ["formal writing", "purpose statement", "email opening"],
          },
          {
            termino: "I would like to... / I would appreciate it if...",
            definicion: "Polite request structures used in formal writing. 'Would like to' is more direct; 'would appreciate it if + past subjunctive' is more indirect and very formal.",
            ejemplo: "'I would like to schedule a meeting at your earliest convenience.' / 'I would appreciate it if you could send me the report by Friday.'",
            etiquetas: ["polite requests", "formal writing", "modal verbs"],
          },
          {
            termino: "Please find attached / I am enclosing...",
            definicion: "Phrases used to refer to documents or files attached to an email or letter. 'Please find attached' is common in emails; 'I am enclosing' is used in paper letters.",
            ejemplo: "'Please find attached my CV and a cover letter.' / 'I am enclosing the completed application form for your review.'",
            etiquetas: ["email conventions", "attachments", "formal English"],
          },
          {
            termino: "We propose that... / I would like to suggest...",
            definicion: "Structures for making a formal proposal or suggestion. 'We propose that + subject + base verb' is for formal proposals; 'I would like to suggest + gerund or that-clause' is common in emails.",
            ejemplo: "'We propose that the school implement a mentorship program for new students.' / 'I would like to suggest organizing a community health fair.'",
            etiquetas: ["proposals", "suggestions", "formal writing"],
          },
          {
            termino: "I look forward to hearing from you.",
            definicion: "A standard closing phrase in formal English correspondence. It expresses expectation of a reply. 'Look forward to' is followed by a gerund (-ing form).",
            ejemplo: "'I look forward to hearing from you at your earliest convenience.' / 'We look forward to your response and hope to work with you soon.'",
            etiquetas: ["email closing", "formal phrases", "gerund after preposition"],
          },
          {
            termino: "Dear Mr./Ms. [Last Name], / Best regards, / Yours sincerely,",
            definicion: "Formal salutations and closings. 'Dear + title + last name' opens formal emails. 'Best regards' or 'Kind regards' are semi-formal closings. 'Yours sincerely' is used when the recipient's name is known.",
            ejemplo: "'Dear Ms. Torres, / ... / Yours sincerely, / Juan Pérez' — complete structure of a formal email.",
            etiquetas: ["salutation", "closing", "email format"],
          },
        ],
        actividad_final: "Write a short formal email in English (5-7 sentences) using the structure: (1) greeting ('Dear...'), (2) purpose statement ('I am writing to...'), (3) a polite request ('I would like to...' or 'I would appreciate it if...'), (4) a reference to an attachment if appropriate ('Please find attached...'), (5) closing phrase ('I look forward to hearing from you.'), and (6) formal sign-off ('Best regards, / Yours sincerely,'). Topic: request for information, an internship, or a proposal related to your field of study.",
      },
    },
    {
      titulo: "Fill in the Blanks — Writing a Formal Email in English",
      descripcion: "Completa el correo formal en inglés para solicitar información o proponer una acción relacionada con el campo de estudio. Practica estructura, vocabulario y frases funcionales. Nivel A2+/B1.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Complete the formal email with the correct word or phrase in each blank.",
        texto_con_huecos: "Dear Dr. Ramos, I am ___ to request information about the internship program at your health center. I am currently ___ health sciences and I am interested in gaining practical experience. I would ___ to schedule a brief meeting at your convenience. Please ___ attached my CV for your review. I look forward to ___ from you. Best regards, Ana López",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "writing",
            alternativas_aceptadas: [],
            pista: "'I am ___ to request information...' — 'I am writing to' is the standard email opening. What is the -ing form of 'write'?",
          },
          {
            posicion: 1,
            respuesta_correcta: "studying",
            alternativas_aceptadas: [],
            pista: "'I am currently ___ health sciences' — use the present continuous (-ing form) to describe what you are studying now.",
          },
          {
            posicion: 2,
            respuesta_correcta: "like",
            alternativas_aceptadas: [],
            pista: "'I would ___ to schedule a meeting...' — 'I would ___ to + verb' is a polite request structure.",
          },
          {
            posicion: 3,
            respuesta_correcta: "find",
            alternativas_aceptadas: [],
            pista: "'Please ___ attached my CV...' — this is a standard phrase to mention an attached file in an email.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Redacto textos funcionales en inglés",
      descripcion: "Reflexiona sobre tu capacidad para redactar en inglés textos funcionales (correos, solicitudes o propuestas breves) relacionados con tu campo de estudio (P06 de IN-V).",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Puedo estructurar un correo formal en inglés con saludo, propósito, cuerpo, cierre y despedida de manera correcta.", escala: escala4 },
          { descripcion: "Uso frases de apertura formal ('I am writing to...') y cierre ('I look forward to hearing from you') de forma natural y correcta.", escala: escala4 },
          { descripcion: "Redacto solicitudes respetuosas usando 'I would like to...' o 'I would appreciate it if...' en lugar de formas demasiado directas o informales.", escala: escala4 },
          { descripcion: "Evito contracciones y registro informal en mi escritura formal en inglés, manteniendo un tono profesional.", escala: escala4 },
        ],
        reflexion_final_prompt: "Redacta en inglés el borrador de un correo breve (5-6 oraciones) dirigido a un profesional de tu área de estudio, solicitando una entrevista o información. Incluye: saludo formal, propósito ('I am writing to...'), solicitud educada, y cierre. Luego, en español: ¿Qué diferencias encontraste entre un correo formal en inglés y en español?",
      },
    },
  ],

  // ════════════ P07 — Participa en una interacción oral semiestructurada ════════════
  [
    {
      titulo: "True or False — Semi-Structured Speaking Interactions in English",
      descripcion: "Decide si cada afirmación sobre cómo participar de manera efectiva en interacciones orales semiestructuradas en inglés (entrevistas, presentaciones y paneles) es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "In a formal presentation in English, it is appropriate to begin by saying: 'Good morning, everyone. Today I am going to talk about...'",
            respuesta: true,
            retroalimentacion: "Correct! This is a standard and effective opening for a formal presentation. It greets the audience, establishes the time frame, and states the topic clearly. Other options: 'I'd like to begin by...', 'My presentation today focuses on...'",
          },
          {
            enunciado: "When you do not understand a question during a presentation or interview, the best strategy in English is to stay silent and wait for the next question.",
            respuesta: false,
            retroalimentacion: "False! The best strategy is to use clarification language: 'Could you repeat that, please?', 'Could you clarify what you mean by...?', or 'If I understand correctly, you are asking about...' Staying silent is not appropriate in professional contexts.",
          },
          {
            enunciado: "The phrase 'As I mentioned earlier...' is useful for referring back to a point already made during a presentation.",
            respuesta: true,
            retroalimentacion: "Correct! 'As I mentioned earlier...' (or 'As I said before...') is a cohesive device that helps the speaker connect ideas and remind the audience of previously stated information. It improves coherence in oral presentations.",
          },
          {
            enunciado: "In an interview in English, it is considered rude and inappropriate to ask for clarification using the phrase 'I beg your pardon?'",
            respuesta: false,
            retroalimentacion: "False. 'I beg your pardon?' (or simply 'Pardon?') is a perfectly polite way to ask someone to repeat or clarify what they said in English. It is neither rude nor inappropriate — it is standard polite usage.",
          },
          {
            enunciado: "To transition between topics in a presentation, speakers can use phrases like 'Moving on to...' or 'Now let's look at...'",
            respuesta: true,
            retroalimentacion: "Correct! Signposting language helps the audience follow the structure of a presentation. Examples: 'Moving on to my second point...', 'Now let's look at the results...', 'Turning to the next section...'",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Phrases for Speaking Interactions: Presentations, Interviews, and Panels",
      descripcion: "Glosario interactivo con frases y estrategias clave en inglés para participar en interacciones orales semiestructuradas: entrevistas, presentaciones breves y paneles. Nivel A2+/B1.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Today I am going to talk about... / My presentation focuses on...",
            definicion: "Standard opening statements for a formal presentation in English. They signal the topic clearly and orient the audience from the beginning.",
            ejemplo: "'Good afternoon. Today I am going to talk about the role of nutrition in athletic performance.' / 'My presentation focuses on sustainable energy solutions for urban areas.'",
            etiquetas: ["presentation openings", "signposting", "speaking"],
          },
          {
            termino: "Moving on to... / Now let's look at... / Turning to...",
            definicion: "Transition phrases (signposting language) used to move from one section or point to the next in a presentation. They help the audience follow the structure.",
            ejemplo: "'Moving on to the second point, I would like to address the economic impact.' / 'Now let's look at some real-world examples of this technology.'",
            etiquetas: ["transitions", "signposting", "presentation structure"],
          },
          {
            termino: "Could you repeat that, please? / Could you clarify what you mean by...?",
            definicion: "Clarification requests used when you do not understand a question or comment. Essential communication strategies for professional and academic interactions.",
            ejemplo: "'Could you repeat that, please? I didn't quite catch it.' / 'Could you clarify what you mean by 'sustainable'? There are different definitions.'",
            etiquetas: ["clarification", "listening strategies", "interview skills"],
          },
          {
            termino: "That's a great question. / Let me think about that for a moment.",
            definicion: "Phrases used to buy time and acknowledge a question before answering. They are polite, professional, and natural in English conversations and interviews.",
            ejemplo: "'That's a great question. In my experience, the main challenge is communication between departments.' / 'Let me think about that for a moment... I believe the key factor is funding.'",
            etiquetas: ["interview strategies", "fluency", "time fillers"],
          },
          {
            termino: "In conclusion, / To wrap up, / To summarize...",
            definicion: "Closing phrases that signal the end of a presentation. They introduce the final summary or main takeaway for the audience.",
            ejemplo: "'In conclusion, the data shows that early intervention leads to significantly better outcomes.' / 'To wrap up, I would like to highlight three key points from today's presentation.'",
            etiquetas: ["presentation closing", "conclusion", "signposting"],
          },
          {
            termino: "From my experience... / Based on what I have learned...",
            definicion: "Phrases to introduce personal experience or knowledge as support for an argument or response in an interview or discussion.",
            ejemplo: "'From my experience volunteering in a hospital, teamwork is essential in healthcare.' / 'Based on what I have learned, renewable energy is more viable now than ever before.'",
            etiquetas: ["personal evidence", "interview language", "opinion support"],
          },
        ],
        actividad_final: "Prepare a 2-minute oral presentation in English about a topic from your field of study. Include: (1) a formal opening ('Today I am going to talk about...'), (2) at least two transition phrases ('Moving on to...'), (3) one closing phrase ('In conclusion,...'), and (4) be ready to respond to one clarification question using 'Could you repeat that?' or 'That's a great question.'",
      },
    },
    {
      titulo: "Fill in the Blanks — Participating in an Oral Presentation",
      descripcion: "Completa el guion de una presentación oral en inglés relacionada con el campo de estudio. Practica lenguaje de señalización, transiciones y cierres. Nivel A2+/B1.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Complete the presentation script with the correct word or phrase.",
        texto_con_huecos: "Good morning. ___ I am going to present my research on the impact of technology in healthcare. ___ on to the first point: technology has improved diagnostic accuracy significantly. As I ___ earlier, early diagnosis saves lives. ___ conclusion, investing in medical technology is essential for a healthier future.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "Today",
            alternativas_aceptadas: [],
            pista: "'Good morning. ___ I am going to present...' — which time word introduces what you are doing now or at this moment?",
          },
          {
            posicion: 1,
            respuesta_correcta: "Moving",
            alternativas_aceptadas: ["Turning"],
            pista: "'___ on to the first point...' — this is a transition phrase. What verb starts it?",
          },
          {
            posicion: 2,
            respuesta_correcta: "mentioned",
            alternativas_aceptadas: ["said"],
            pista: "'As I ___ earlier, early diagnosis saves lives.' — what past tense verb refers back to something already said?",
          },
          {
            posicion: 3,
            respuesta_correcta: "In",
            alternativas_aceptadas: [],
            pista: "'___ conclusion, investing in medical technology is essential...' — which preposition completes this closing phrase?",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Participo en interacciones orales en inglés",
      descripcion: "Reflexiona sobre tu capacidad para participar de manera efectiva en interacciones orales semiestructuradas en inglés: entrevistas, presentaciones breves y paneles (P07 de IN-V).",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Puedo iniciar y cerrar una presentación oral en inglés usando frases apropiadas ('Today I am going to...', 'In conclusion...').", escala: escala4 },
          { descripcion: "Uso lenguaje de señalización (signposting) para organizar mi presentación y guiar a la audiencia ('Moving on to...', 'As I mentioned...').", escala: escala4 },
          { descripcion: "Puedo pedir aclaraciones de manera educada en inglés ('Could you repeat that?', 'Could you clarify...?') en lugar de quedarme callado o responder sin entender.", escala: escala4 },
          { descripcion: "Puedo responder a preguntas en inglés durante una entrevista o panel usando estrategias como 'That's a great question' o 'From my experience...'.", escala: escala4 },
        ],
        reflexion_final_prompt: "Graba (o ensaya en voz alta) una presentación de 60-90 segundos en inglés sobre tu campo de estudio. Usa al menos: una frase de apertura, una transición, y una frase de cierre. Luego reflexiona en español: ¿Qué aspectos de la presentación oral en inglés te generan más inseguridad y por qué? ¿Qué estrategia específica vas a practicar más?",
      },
    },
  ],

  // ════════════ P08 — Integra habilidades lingüísticas y produce un proyecto final ════════════
  [
    {
      titulo: "True or False — Integrating Language Skills for a Final Project",
      descripcion: "Decide si cada afirmación sobre cómo integrar las habilidades lingüísticas del inglés (lectura, escritura, habla y escucha) en un proyecto final vinculado al campo de estudio es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "A well-written English project should have a clear introduction, a developed body, and a conclusion that summarizes the main points.",
            respuesta: true,
            retroalimentacion: "Correct! This is the standard structure for an essay or written project in English: Introduction (what you will discuss), Body (developed points with evidence), Conclusion (summary and final thoughts). This structure makes the text clear and coherent.",
          },
          {
            enunciado: "In a final integrated project, using only one type of evidence (only opinions, for example) is sufficient to demonstrate mastery of all four language skills.",
            respuesta: false,
            retroalimentacion: "False. An integrated project should demonstrate all four skills: reading (analyzing a source text), writing (producing a document), speaking (presenting or explaining orally), and listening (responding to feedback or questions). Using only opinions does not demonstrate reading or research skills.",
          },
          {
            enunciado: "Paraphrasing means expressing someone else's idea in your own words while keeping the original meaning. It is an important academic writing skill.",
            respuesta: true,
            retroalimentacion: "Correct! Paraphrasing is a fundamental academic skill. It involves restating an idea from a source using different words and sentence structure while preserving the meaning — and always crediting the original source.",
          },
          {
            enunciado: "The phrase 'This project demonstrates that...' is an appropriate structure for the conclusion of a final integrated project in English.",
            respuesta: true,
            retroalimentacion: "Correct! 'This project demonstrates that...' clearly introduces a conclusion or final finding. Other good structures: 'Through this project, I have shown that...', 'The evidence presented in this project supports the idea that...'",
          },
          {
            enunciado: "Using a variety of sentence types (simple, compound, and complex) in a written project makes the text less clear and should be avoided.",
            respuesta: false,
            retroalimentacion: "False. Variety in sentence structure actually improves the quality and readability of a written text. Using only simple sentences makes text sound mechanical. Combining simple, compound, and complex sentences creates a more natural, sophisticated, and engaging style.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Language Skills Integration for the Final Project",
      descripcion: "Glosario interactivo con frases, estructuras y estrategias clave en inglés para integrar habilidades lingüísticas y producir un proyecto final sobre el campo de estudio. Nivel A2+/B1.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "This project aims to... / The purpose of this project is to...",
            definicion: "Phrases to state the objective or goal of a final project in the introduction. Clear purpose statements orient the reader and demonstrate planning.",
            ejemplo: "'This project aims to explore the impact of technology on healthcare in rural Mexico.' / 'The purpose of this project is to demonstrate how English is used in the field of environmental science.'",
            etiquetas: ["introduction", "purpose", "project writing"],
          },
          {
            termino: "As demonstrated in this project... / The evidence shows that...",
            definicion: "Phrases used in conclusions to refer back to the content of the project. They introduce a summary of findings or a final argument supported by the work done.",
            ejemplo: "'As demonstrated in this project, bilingual communication is essential in international business.' / 'The evidence shows that access to clean water reduces disease rates significantly.'",
            etiquetas: ["conclusion", "summary", "evidence"],
          },
          {
            termino: "Furthermore, / Moreover, / In addition to this...",
            definicion: "Additive connectors used to introduce additional supporting points or evidence. They make the argument richer and show that the writer has multiple supporting ideas.",
            ejemplo: "'The project covers the history of the field. Furthermore, it analyzes current trends and future challenges.' / 'Moreover, the data from three separate studies confirms this finding.'",
            etiquetas: ["addition connectors", "cohesion", "academic writing"],
          },
          {
            termino: "Based on my research... / According to [source]...",
            definicion: "Phrases to introduce evidence or findings from reading and research. They show that the project is based on information, not just personal opinion.",
            ejemplo: "'Based on my research, climate change affects agricultural productivity in three main ways.' / 'According to the WHO, mental health disorders affect one in four people globally.'",
            etiquetas: ["evidence", "citation", "research language"],
          },
          {
            termino: "Throughout this project, I have... / This experience helped me...",
            definicion: "Reflective phrases used in conclusions to comment on the learning process. They show metacognitive awareness — the student reflects on what they learned and how.",
            ejemplo: "'Throughout this project, I have improved my ability to read technical texts in English.' / 'This experience helped me understand the importance of clear communication in my field.'",
            etiquetas: ["reflection", "metacognition", "conclusion"],
          },
          {
            termino: "To improve... I would recommend... / For future work, it would be useful to...",
            definicion: "Recommendation structures for the conclusion of a project. They show critical thinking by identifying limitations and proposing next steps.",
            ejemplo: "'To improve this project, I would recommend conducting interviews with professionals in the field.' / 'For future work, it would be useful to analyze data from a larger sample.'",
            etiquetas: ["recommendations", "critical thinking", "conclusion"],
          },
        ],
        actividad_final: "Write the introduction and conclusion of your final integrated project in English (4-5 sentences each). Introduction: state the purpose ('This project aims to...') and briefly mention all the skills/progresiones you will address. Conclusion: summarize your findings ('As demonstrated in this project...'), reflect on your learning ('Throughout this project, I have...'), and make one recommendation ('For future work, it would be useful to...').",
      },
    },
    {
      titulo: "Fill in the Blanks — Writing the Final Integrated Project",
      descripcion: "Completa el texto de introducción y conclusión de un proyecto final integrador en inglés. Practica frases académicas, conectores y vocabulario de nivel A2+/B1.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Complete the blanks to write a well-structured introduction and conclusion for a final English project.",
        texto_con_huecos: "This project ___ to explore how English is used in the field of environmental engineering. ___ on my research, communication in this field requires both technical accuracy and clarity. The evidence ___ that professionals who master English have more career opportunities. Throughout this project, I ___ developed my reading, writing, speaking, and listening skills in English.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "aims",
            alternativas_aceptadas: ["seeks"],
            pista: "'This project ___ to explore...' — which third-person singular verb means 'has the objective of'?",
          },
          {
            posicion: 1,
            respuesta_correcta: "Based",
            alternativas_aceptadas: [],
            pista: "'___ on my research, communication requires...' — which phrase introduces a finding from research?",
          },
          {
            posicion: 2,
            respuesta_correcta: "shows",
            alternativas_aceptadas: ["suggests", "indicates"],
            pista: "'The evidence ___ that professionals who master English...' — what verb introduces a finding or conclusion drawn from evidence?",
          },
          {
            posicion: 3,
            respuesta_correcta: "have",
            alternativas_aceptadas: [],
            pista: "'Throughout this project, I ___ developed my skills...' — use the present perfect: 'I ___ developed'.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Integro mis habilidades en inglés en el proyecto final",
      descripcion: "Reflexiona sobre tu capacidad para integrar las cuatro habilidades lingüísticas del inglés (lectura, escritura, habla y escucha) en un proyecto final vinculado a tu campo de estudio (P08 de IN-V).",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Puedo escribir un texto en inglés con una introducción clara, un cuerpo desarrollado con evidencia y una conclusión que resume los puntos principales.", escala: escala4 },
          { descripcion: "Integro información de fuentes leídas en mi proyecto usando paráfrasis y frases de citación ('According to...', 'Based on my research...').", escala: escala4 },
          { descripcion: "Uso conectores de adición ('furthermore', 'moreover', 'in addition') para enriquecer mi argumentación y mostrar múltiples ideas de apoyo.", escala: escala4 },
          { descripcion: "Puedo reflexionar sobre mi aprendizaje en inglés usando frases como 'Throughout this project, I have...' y hacer recomendaciones constructivas ('For future work...').", escala: escala4 },
        ],
        reflexion_final_prompt: "Revisa el borrador de tu proyecto final. En inglés, escribe 2-3 oraciones de conclusión que incluyan: (1) una referencia a la evidencia presentada ('As demonstrated in this project...'), (2) una reflexión sobre tu aprendizaje ('Throughout this project, I have...'), y (3) una recomendación ('For future work...'). Luego, en español: ¿Cómo ha cambiado tu confianza para usar el inglés desde el inicio de la unidad 'We are the champions'?",
      },
    },
  ],
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });

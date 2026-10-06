/**
 * Contenido VERBATIM de la progresión IN-V-P01 (Inglés V) — «Explora y describe
 * el área de estudio, ocupación o interés del grupo (introduce el campo o
 * tema, y su relevancia)».
 *
 * Todo lo de este archivo sale tal cual de las actividades publicadas (volcado
 * con `scripts/dump-actividades.ts --progresion IN-V-P01`). Lo único derivado
 * son los `PARES_CAMPOS` del modo «Escribe el término»: el término y su
 * traducción son los de la lista de vocabulario de A1, y el ejemplo es la
 * misma oración de A1 con el término tapado (si se viera, se regalaría).
 */
import type { QuizEvaluable } from "./_reto-quiz";
import type { ParTermino } from "./_mecanica-termino";

/* ── A1 · lectura ────────────────────────────────────────────────────────── */

export const LECTURA_A1 = {
  titulo: "Describing your field of interest in English",
  fuente: "Material CEN Bachillerato — IN-V (A2+/B1)",
  texto: `En Inglés V trabajamos con el inglés académico y profesional de nivel B1. Una de las primeras habilidades que desarrollarás es describir tu área de estudio o carrera de interés en inglés. Esto es fundamental para entrevistas, presentaciones escolares y proyectos colaborativos.

¿CÓMO DESCRIBIR TU CAMPO DE INTERÉS?

Estructura básica:
• "I'm interested in [field] because..." (Me interesa [campo] porque...)
• "My field of study is [area]." (Mi campo de estudio es [área].)
• "In this area, we [work on / study / develop / investigate]..." (En esta área, [trabajamos en / estudiamos / desarrollamos / investigamos]...)

Vocabulario temático (campos de estudio frecuentes en México):
• technology / tecnología — "I'm interested in technology because it solves real-world problems."
• health / salud — "My field is health science. We study how the body functions."
• environment / medio ambiente — "In environmental science, we investigate how human activities affect ecosystems."
• education / educación — "I'm passionate about education because every child deserves to learn."
• arts / artes — "In the arts, we explore creativity and cultural expression."
• sports / deporte — "I'm interested in sports medicine because I want to help athletes recover."
• business / negocios — "My field is business administration. We develop strategies for organizations."

Conectores esenciales para estructurar una descripción:
• First (primero) — "First, I want to explain what my field is about."
• Also (también) — "I also enjoy working with data and statistics."
• Moreover / In addition (además) — "Moreover, this field is growing rapidly in Mexico."
• Finally (finalmente) — "Finally, I hope to specialize in biotechnology."

EJEMPLO COMPLETO — Un alumno describe su interés:

My name is Rodrigo and I study at the Centro de Bachillerato Tecnológico in Puebla. I am very interested in biotechnology because I believe it can solve some of Mexico's most important health and food challenges.

In my field of study, we investigate how living organisms — like bacteria and plants — can be used to develop medicines, improve crops, and clean contaminated water. I am also interested in how institutions like the UNAM and the CINVESTAV (Centro de Investigación y de Estudios Avanzados del IPN) in Mexico City conduct cutting-edge research in this area.

First, I want to complete my bachillerato with strong grades in biology and chemistry. In addition, I plan to participate in a science fair this semester with a project about natural water filtration using local plants. Moreover, I have started watching videos from Mexican scientists on YouTube to understand current research. Finally, my goal is to study biochemical engineering at the Universidad Autónoma Metropolitana.

I am still learning English, but I know that most scientific articles are published in English — so improving my language skills is also part of my plan.

PREGUNTAS DE COMPRENSIÓN:
1. ¿Qué campo de interés describe Rodrigo y qué razones da para elegirlo?
2. ¿Qué conectores usa Rodrigo para organizar su descripción? Identifica al menos 3 y explica qué función cumple cada uno.
3. ¿Qué menciona Rodrigo sobre el CINVESTAV y la UNAM? ¿Por qué crees que los menciona en su descripción?
4. ¿Qué similitudes y diferencias hay entre el campo de interés de Rodrigo y el tuyo propio?`,
  callout:
    "En inglés las profesiones llevan artículo: «I want to be an engineer», «She is a nurse». En español decimos «quiero ser ingeniero», sin artículo.",
};

export const COMPRENSION_A1: { pregunta: string; guia: string }[] = [
  {
    pregunta: "¿Qué campo de interés describe Rodrigo y qué razones da para elegirlo?",
    guia: "Rodrigo describe su interés en biotecnología. Sus razones son: (1) cree que puede resolver desafíos importantes de salud y alimentación en México, (2) le interesa cómo los organismos vivos pueden usarse para desarrollar medicamentos, mejorar cultivos y limpiar agua contaminada, y (3) ha visto el trabajo de instituciones como el CINVESTAV y la UNAM en este campo.",
  },
  {
    pregunta: "¿Qué conectores usa Rodrigo para organizar su descripción? Identifica al menos 3 y explica qué función cumple cada uno.",
    guia: "Conectores: 'First' (señala el primer paso o idea principal), 'In addition' (añade información complementaria), 'Moreover' (enfatiza y añade más evidencia), 'Finally' (introduce la meta o conclusión). Juntos crean una descripción organizada y lógica, típica del inglés académico B1.",
  },
  {
    pregunta: "¿Qué menciona Rodrigo sobre el CINVESTAV y la UNAM? ¿Por qué crees que los menciona en su descripción?",
    guia: "Los menciona como instituciones mexicanas que realizan investigación de punta en biotecnología. Los incluye para dar contexto local y credibilidad a su descripción — muestra que conoce el campo en México, no solo en términos abstractos. También conecta su interés académico con la realidad científica del país.",
  },
  {
    pregunta: "¿Qué similitudes y diferencias hay entre el campo de interés de Rodrigo y el tuyo propio?",
    guia: "Respuesta abierta del estudiante. La clave es que practique la estructura aprendida: 'I am interested in [field] because...' y use al menos un conector. Se evalúa la coherencia y el uso del vocabulario temático, no la similitud con Rodrigo.",
  },
];

/** Los cuatro conectores de A1, con su traducción y su ejemplo (verbatim). */
export const CONECTORES_A1: { conector: string; es: string; ejemplo: string }[] = [
  { conector: "First", es: "primero", ejemplo: "First, I want to explain what my field is about." },
  { conector: "Also", es: "también", ejemplo: "I also enjoy working with data and statistics." },
  { conector: "Moreover / In addition", es: "además", ejemplo: "Moreover, this field is growing rapidly in Mexico." },
  { conector: "Finally", es: "finalmente", ejemplo: "Finally, I hope to specialize in biotechnology." },
];

/* ── Vocabulario temático de A1 → «Escribe el término» ─────────────────── */

/**
 * Los siete campos de A1. `definicion` es la traducción que da la propia
 * lectura; `ejemplo` es su oración de A1 con el término tapado.
 */
export const PARES_CAMPOS: ParTermino[] = [
  { id: "technology", termino: "technology", definicion: "En español: tecnología.", ejemplo: "\"I'm interested in ______ because it solves real-world problems.\"" },
  { id: "health", termino: "health", definicion: "En español: salud.", ejemplo: "\"My field is ______ science. We study how the body functions.\"" },
  { id: "environment", termino: "environment", definicion: "En español: medio ambiente.", ejemplo: "\"In ______al science, we investigate how human activities affect ecosystems.\"" },
  { id: "education", termino: "education", definicion: "En español: educación.", ejemplo: "\"I'm passionate about ______ because every child deserves to learn.\"" },
  { id: "arts", termino: "arts", definicion: "En español: artes.", ejemplo: "\"In the ______, we explore creativity and cultural expression.\"" },
  { id: "sports", termino: "sports", definicion: "En español: deporte.", ejemplo: "\"I'm interested in ______ medicine because I want to help athletes recover.\"" },
  { id: "business", termino: "business", definicion: "En español: negocios.", ejemplo: "\"My field is ______ administration. We develop strategies for organizations.\"" },
];

/* ── A3 · reflexión escrita ─────────────────────────────────────────────── */

export const CONSIGNA_A3 = {
  titulo: "Reflexión: ¿qué campo de estudio o carrera me interesa y por qué?",
  prompt:
    "Escribe un párrafo en inglés de al menos 80 palabras describiendo tu campo de interés o la carrera que te gustaría estudiar. Incluye: (1) qué área es, (2) por qué te interesa, (3) qué haces actualmente relacionado con ese campo, y (4) qué esperas lograr en el futuro. Usa al menos 3 conectores de los que aprendiste (first, also, in addition, however, finally, because).",
  pistas: [
    "Start with: 'I am interested in... because...'",
    "Menciona una actividad concreta que ya hagas o hayas hecho",
    "Usa el presente simple para describir tu campo y el futuro (I want to / I hope to) para tus metas",
    "Revisa tu ortografía: el inglés y el español tienen palabras muy parecidas pero con diferencias (career ≠ carrera, college ≠ colegio)",
  ],
  criterios: [
    "Describe claramente un campo de interés con razones específicas (no solo 'me gusta')",
    "Usa vocabulario temático apropiado para el campo elegido",
    "Incorpora al menos 3 conectores de forma correcta",
    "La extensión es de al menos 80 palabras en inglés",
  ],
};

/* ── A4 · verdadero o falso (el reto) ───────────────────────────────────── */

export const RETO_QUIZ: QuizEvaluable = {
  titulo: "True or False — Describing Your Field of Study",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "The sentence 'I am interested in engineering' correctly uses the preposition 'in' after 'interested'.",
      opciones: ["True", "False"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correct! 'Interested in' is the fixed collocation in English. Examples: 'I am interested in medicine / technology / design.' Always use 'in', never 'of' or 'about'.",
    },
    {
      enunciado: "To describe your field of study, you can say: 'My area of study are biology.' This sentence is grammatically correct.",
      opciones: ["True", "False"],
      respuestaCorrecta: 1,
      retroalimentacion: "False. 'My area of study' is singular, so the verb must be singular too: 'My area of study IS biology.' Subject-verb agreement is essential in English.",
    },
    {
      enunciado: "The phrase 'I'm currently studying graphic design at a high school level' is an appropriate way to introduce your field of study in English.",
      opciones: ["True", "False"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correct! 'I'm currently studying + subject' (present continuous) is a natural and accurate way to describe what you are studying right now. 'Currently' makes it clear it is happening at this moment.",
    },
    {
      enunciado: "In English, 'career' and 'major' always mean exactly the same thing and are completely interchangeable.",
      opciones: ["True", "False"],
      respuestaCorrecta: 1,
      retroalimentacion: "False. 'Major' refers specifically to the main subject or area of study at a university level. 'Career' refers to a person's professional life or occupation over time. They overlap but are not interchangeable in all contexts.",
    },
    {
      enunciado: "The sentence 'This field involves working with technology, people, and data' correctly uses the verb 'involve' followed by a gerund (-ing form).",
      opciones: ["True", "False"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correct! 'Involve' is followed by a gerund (verb + -ing). Example: 'This job involves analyzing data / helping patients / designing structures.' This is a fixed grammar rule.",
    },
  ],
};

/* ── A5 · glosario interactivo (y A9, que reconstruye los mismos pares) ── */

export interface TerminoGlosario {
  termino: string;
  definicion: string;
  ejemplo: string;
}

export const GLOSARIO_A5: TerminoGlosario[] = [
  {
    termino: "I'm currently studying...",
    definicion: "A phrase using the present continuous to describe your current field or course of study. It indicates an ongoing activity happening now.",
    ejemplo: "'I'm currently studying health sciences at the bachillerato level.' / 'I'm currently studying programming and digital design.'",
  },
  {
    termino: "My field of study is...",
    definicion: "A simple and direct phrase to introduce the area or discipline you are studying. 'Field' means a domain of knowledge or professional activity.",
    ejemplo: "'My field of study is engineering.' / 'My field of study is social communication and media.'",
  },
  {
    termino: "This area involves...",
    definicion: "Used to explain what activities, skills, or tasks are part of a particular field. 'Involve' is followed by a gerund (verb + -ing).",
    ejemplo: "'This area involves designing, testing, and improving systems.' / 'This field involves caring for patients and applying medical knowledge.'",
  },
  {
    termino: "It is related to...",
    definicion: "A phrase to show connections between your field and other topics, subjects, or real-world applications. Preposition 'to' is always used after 'related'.",
    ejemplo: "'Biotechnology is related to biology, chemistry, and medicine.' / 'Architecture is related to art, mathematics, and engineering.'",
  },
  {
    termino: "One of the main goals of this field is to...",
    definicion: "A structure to describe the purpose or objective of a field of study. 'Goal' = objective or aim. Use 'to + infinitive' after 'goal is'.",
    ejemplo: "'One of the main goals of this field is to solve environmental problems.' / 'One of the main goals of nursing is to provide quality care.'",
  },
  {
    termino: "Professionals in this field...",
    definicion: "A phrase to describe what experts or workers in your area of study typically do. It introduces typical tasks, roles, or responsibilities.",
    ejemplo: "'Professionals in this field design and build safe structures.' / 'Professionals in this field analyze data to make decisions.'",
  },
];

export const ACTIVIDAD_FINAL_A5 =
  "Write 3-5 sentences in English describing your group's field of study or area of interest. Use at least three phrases from this glossary: introduce the field ('My field of study is...'), explain what it involves ('This area involves...'), and describe one goal ('One of the main goals is to...').";

/* ── A7 · autoevaluación ────────────────────────────────────────────────── */

export const AUTOEVALUACION_A7 = {
  instrucciones: "Marca tu nivel honesto en cada criterio. Esto te ayudará a identificar qué reforzar.",
  escala: ["En inicio", "En proceso", "Logrado", "Destacado"],
  criterios: [
    "Puedo presentar mi campo de estudio en inglés usando frases como 'My field of study is...' o 'I'm currently studying...' con pronunciación y gramática aceptables.",
    "Puedo describir qué actividades o tareas implica mi área usando 'involves + gerund' y vocabulario relacionado.",
    "Puedo mencionar por qué es relevante mi área de estudio usando 'One of the main goals is to...' u otras estructuras de propósito.",
    "Comprendo y uso correctamente las preposiciones clave: 'interested IN', 'related TO', 'involved IN'.",
  ],
  reflexion:
    "En inglés, escribe 2-3 oraciones describiendo tu campo de estudio. Luego, en español, reflexiona: ¿Qué parte te costó más trabajo expresar en inglés? ¿Qué vocabulario nuevo aprendiste en esta progresión?",
};

/* ── A8 · video de bienvenida ───────────────────────────────────────────── */

export const VIDEO_A8 = {
  titulo: "Bienvenida a Inglés V / Welcome to English V",
  descripcion:
    "Presentación general: propósito y temas (área de estudio o interés, experiencias personales o escolares, opiniones, proyecto final) vinculados a tu campo de interés.",
  preguntas: [
    "¿Qué campo de estudio o interés explorarás en inglés durante esta UAC?",
    "Escribe una frase sencilla en inglés sobre por qué te interesa ese campo.",
  ],
  verdaderoFalso: {
    enunciado: "Esta UAC vincula el aprendizaje del inglés con un campo de estudio o interés del grupo.",
    respuesta: true,
  },
};

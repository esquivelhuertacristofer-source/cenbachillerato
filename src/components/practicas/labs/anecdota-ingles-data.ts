/**
 * Contenido VERBATIM de la progresión IN-IV-P07 (Inglés IV) — «Cuenta una
 * anécdota o experiencia significativa».
 *
 * Sale tal cual de las actividades publicadas (scripts/dump-actividades.ts
 * --progresion IN-IV-P07). Nada se reescribe: el laboratorio lo enseña en la
 * pestaña «Teoría», lo usa en el reto y en el glosario.
 *  · A1 lectura «Tell Me a Story: Past Simple and Past Continuous».
 *  · A3 reflexión escrita «My Anecdote: A Memorable Moment».
 *  · A4 verdadero/falso «True or False — Telling an anecdote» (el reto).
 *  · A5 glosario «Glossary — Anecdote structure & storytelling expressions».
 *  · A7 autoevaluación «Self-check — Telling a clear anecdote».
 *  · A8 video «Contar una anécdota en inglés» (sus preguntas).
 *  · A9 relacionar columnas (los pares que se escriben en «Escribe el término»).
 * A2 y A6 (textos con huecos) viven en `anecdota-ingles-huecos.ts`.
 */

/* ── A1 · lectura ─────────────────────────────────────────────────────── */
export const LECTURA = {
  ancla: "IN-IV-P07-A1",
  titulo: "Tell Me a Story: Past Simple and Past Continuous",
  intro:
    "One of the most common ways to tell a story in English is to combine two past tenses: the PAST SIMPLE and the PAST CONTINUOUS. Together, they create interesting and dramatic narratives.",
  continuo: {
    titulo: "PAST CONTINUOUS — was/were + verb-ing",
    uso: "Use this to describe an action IN PROGRESS at a past moment (una acción en progreso en el pasado):",
    ejemplos: [
      "I was walking home. (Estaba caminando a casa.)",
      "She was studying in the library. (Ella estaba estudiando en la biblioteca.)",
      "We were playing soccer in the park. (Estábamos jugando fútbol en el parque.)",
    ],
  },
  patrones: [
    {
      patron: "\"I WAS [doing something] WHEN [something happened]\"",
      ejemplos: [
        "I was eating tacos when I saw my favorite singer. (Estaba comiendo tacos cuando vi a mi cantante favorito.)",
        "She was walking to school when it started to rain heavily. (Ella estaba caminando a la escuela cuando empezó a llover fuerte.)",
      ],
    },
    {
      patron: "\"WHILE I WAS [doing something], [something happened]\"",
      ejemplos: [
        "While we were watching the Chivas game, the lights went out. (Mientras veíamos el partido de Chivas, se fue la luz.)",
        "While my brother was studying, our cat knocked over a glass of water. (Mientras mi hermano estudiaba, nuestro gato tiró un vaso de agua.)",
      ],
    },
  ],
  anecdotaTitulo: "Anecdote from Mexico City:",
  anecdota:
    "Last Thursday, I was standing at the metro station when a woman suddenly ran past me and dropped her bag. I picked it up. Inside, there was a letter in English addressed to someone named Elena. While I was reading the letter, the woman came back, out of breath. \"That's mine!\" she said. We started talking. It turned out she was a literature teacher and the letter was a note from her pen pal in Canada. In the end, we exchanged numbers and she invited me to her book club. You never know what can happen at the metro!",
  gramatica:
    "Grammar: The story uses was standing, was reading (past continuous = actions in progress) and ran, dropped, picked up, came back, said, started, turned out, exchanged, invited (past simple = completed actions and events).",
  fuente: "Material CEN Bachillerato — IN-IV (A2+)",
  callout:
    "El pasado continuo y el pasado simple juntos cuentan una acción interrumpida: «I was walking home when it started to rain».",
  preguntas: [
    {
      pregunta: "¿Cuándo usamos el pasado continuo (past continuous) en inglés? Da un ejemplo del texto.",
      respuesta:
        "Usamos el pasado continuo para describir una acción que estaba en progreso en un momento del pasado. Se forma con was/were + verbo -ing. Ejemplo del texto: 'I was standing at the metro station' — estaba parado en la estación del metro (acción en progreso que fue interrumpida).",
    },
    {
      pregunta: "Explica el patrón 'was/were doing... when... happened'. ¿Para qué sirve en una anécdota?",
      respuesta:
        "Este patrón se usa para mostrar una acción en progreso (past continuous) que es interrumpida por un evento inesperado (past simple). Crea tensión dramática en la historia: 'I was standing... when a woman suddenly ran past me.' La acción en progreso marca el contexto; el evento inesperado avanza la historia.",
    },
    {
      pregunta: "¿Cuál es el evento inesperado en la anécdota de la Ciudad de México? ¿Cómo cambia el curso de la historia?",
      respuesta:
        "El evento inesperado es que una mujer corre junto al narrador y suelta su bolsa. Esto hace que el narrador recoja la bolsa, encuentre una carta en inglés, y finalmente conozca a una profesora de literatura que lo invita a su club de lectura. Un evento pequeño e inesperado tiene consecuencias importantes — típico de la estructura de una buena anécdota.",
    },
  ],
};

/* ── A3 · reflexión escrita ───────────────────────────────────────────── */
export const ESCRITURA = {
  ancla: "IN-IV-P07-A3 · My Anecdote: A Memorable Moment",
  prompt:
    "Cuenta una anécdota real o inventada usando el pasado simple y el pasado continuo. La anécdota debe incluir un momento inesperado o sorprendente.\n\nEscribe en inglés o en español. Tu texto debe incluir al menos 2 verbos en pasado continuo (was/were + -ing) y al menos 4 verbos en pasado simple. Usa el patrón 'I was doing... when something happened' o 'While I was doing..., something happened'.",
  pistas: [
    "Establece el contexto con pasado continuo: 'I was walking to school when...' / 'We were eating tacos when suddenly...'",
    "El evento inesperado en pasado simple: 'a dog ran past me', 'the teacher walked in', 'it started to rain'.",
    "Verbos irregulares útiles: ran (run), fell (fall), dropped (drop), saw (see), heard (hear), found (find), met (meet).",
    "Adverbios para el momento inesperado: suddenly (de repente), at that moment (en ese momento), all of a sudden (de repente).",
  ],
  criterios: [
    "Usa al menos 2 verbos en pasado continuo (was/were + verb-ing) para el contexto o la acción en progreso",
    "Usa al menos 4 verbos en pasado simple para los eventos de la historia",
    "Incluye un momento inesperado o sorprendente claramente identificable",
    "La anécdota tiene estructura clara: contexto → evento inesperado → desenlace",
  ],
  longitudMinima: 80,
};

/* ── A4 · verdadero / falso (el reto) ─────────────────────────────────── */
export const QUIZ_VF = {
  ancla: "IN-IV-P07-A4 · True or False — Telling an anecdote",
  descripcion:
    "Decide si cada afirmación sobre cómo narrar una anécdota de forma clara y organizada en inglés es verdadera o falsa.",
  puntajeMinimo: 70,
  preguntas: [
    {
      enunciado: "A good anecdote typically has a setting, a complication, and a resolution or reaction.",
      respuesta: true,
      retro: "Correct: setting (when/where/who), complication (what happened), resolution/reaction (how it ended or how you felt).",
    },
    {
      enunciado: "'You won't believe this, but...' and 'The funniest thing happened...' are common ways to open an anecdote.",
      respuesta: true,
      retro: "Correct: these expressions create interest and signal that a story is coming.",
    },
    {
      enunciado: "In an anecdote, you should use only the past simple and never the past continuous.",
      respuesta: false,
      retro: "No: past continuous sets the scene ('I was waiting for the bus') and past simple tells what happened ('when I saw my teacher').",
    },
    {
      enunciado: "'In the end' signals the conclusion or result of an anecdote.",
      respuesta: true,
      retro: "Correct: 'In the end, we all laughed about it' = final resolution of the story.",
    },
    {
      enunciado: "Exaggeration and humour are inappropriate in informal anecdote-telling.",
      respuesta: false,
      retro: "No: light exaggeration and humour are common and expected features of informal storytelling in English.",
    },
  ],
};

/* ── A5 · glosario ────────────────────────────────────────────────────── */
export const GLOSARIO_A5 = {
  ancla: "IN-IV-P07-A5 · Glossary — Anecdote structure & storytelling expressions",
  terminos: [
    { termino: "anecdote opener", definicion: "Expresión para captar la atención al iniciar una historia.", ejemplo: "You won't believe what happened to me last Friday!", etiqueta: "apertura" },
    { termino: "setting the scene", definicion: "Presentar el contexto: cuándo, dónde y quién estaba.", ejemplo: "It was a rainy Monday morning and I was running late for school.", etiqueta: "escena" },
    { termino: "complication", definicion: "El evento inesperado o problema central de la anécdota.", ejemplo: "Suddenly, I realised I had left my backpack on the bus.", etiqueta: "complicación" },
    { termino: "narrative connectors", definicion: "Conectores narrativos: then, after that, suddenly, all of a sudden, eventually.", ejemplo: "Eventually, a kind passenger found my bag and called the school.", etiqueta: "conector" },
    { termino: "in the end / luckily / unfortunately", definicion: "Expresiones para la resolución o reacción final.", ejemplo: "Luckily, the driver kept my bag and I got it back that afternoon.", etiqueta: "resolución" },
    { termino: "reaction phrases", definicion: "Expresar cómo te sentiste al final: I couldn't believe it, It was hilarious, I was so relieved.", ejemplo: "I couldn't believe how lucky I was — I was so relieved!", etiqueta: "reacción" },
  ],
  actividadFinal:
    "Escribe una anécdota real o inventada de 8-10 oraciones. Incluye: apertura, escena, complicación, al menos 3 conectores narrativos, resolución y tu reacción.",
};

/* ── A7 · autoevaluación ──────────────────────────────────────────────── */
export const AUTOEVALUACION = {
  ancla: "IN-IV-P07-A7 · Self-check — Telling a clear anecdote",
  instrucciones: "Marca tu nivel honesto en cada criterio.",
  criterios: [
    "Abro mi anécdota con una expresión que capta la atención ('You won't believe...', 'The funniest thing happened...').",
    "Presento la escena (cuándo, dónde, quién) antes de contar lo que pasó.",
    "Uso conectores narrativos (then, suddenly, eventually, in the end) para organizar los eventos.",
    "Termino con la resolución y expreso mi reacción ('I couldn't believe it', 'Luckily...', 'It was hilarious').",
  ],
  escala: [
    { valor: 1, etiqueta: "En inicio", descripcion: "Todavía necesito apoyo y consultar el material." },
    { valor: 2, etiqueta: "En proceso", descripcion: "Lo logro con algunos errores o dudas." },
    { valor: 3, etiqueta: "Logrado", descripcion: "Lo hago bien de forma autónoma." },
    { valor: 4, etiqueta: "Destacado", descripcion: "Lo hago con seguridad y puedo ayudar a otra persona." },
  ],
  reflexion:
    "¿Qué anécdota divertida o sorprendente de tu vida ya puedes contar en inglés usando los conectores y estructuras de esta progresión?",
};

/* ── A8 · video ───────────────────────────────────────────────────────── */
export const VIDEO = {
  ancla: "IN-IV-P07-A8 · Video básico: Contar una anécdota en inglés",
  descripcion:
    "Video que explica cómo narrar de forma clara y organizada, en inglés, una anécdota o experiencia significativa que se haya vivido o aprendido.",
  preguntas: [
    "¿Qué anécdota o experiencia significativa podrías narrar en inglés y cómo la ordenarías cronológicamente?",
    "¿Qué tiempo verbal se usa principalmente para narrar una anécdota en inglés? — El pasado simple (Simple Past).",
    "Usar palabras de secuencia como 'first', 'then' y 'finally' ayuda a organizar una anécdota en inglés. — Verdadero.",
  ],
  /** Opciones verbatim de la pregunta de opción múltiple (la correcta es la 2.ª). */
  opcionesTiempo: ["El presente simple (Simple Present)", "El pasado simple (Simple Past)", "El futuro simple (Simple Future)"],
};

/* ── A9 · pares concepto–definición (se escriben en «Escribe el término») ── */
export const PARES_A9 = [
  { id: "complication", termino: "complication", definicion: "El evento inesperado o problema central de la anécdota.", ejemplo: "Suddenly, I realised I had left my backpack on the bus." },
  { id: "connectors", termino: "narrative connectors", definicion: "Conectores narrativos: then, after that, suddenly, all of a sudden, eventually.", ejemplo: "Eventually, a kind passenger found my bag and called the school." },
  { id: "reaction", termino: "reaction phrases", definicion: "Expresar cómo te sentiste al final: I couldn't believe it, It was hilarious, I was so relieved.", ejemplo: "I couldn't believe how lucky I was — I was so relieved!" },
  { id: "opener", termino: "anecdote opener", definicion: "Expresión para captar la atención al iniciar una historia.", ejemplo: "You won't believe what happened to me last Friday!" },
  { id: "scene", termino: "setting the scene", definicion: "Presentar el contexto: cuándo, dónde y quién estaba.", ejemplo: "It was a rainy Monday morning and I was running late for school." },
];

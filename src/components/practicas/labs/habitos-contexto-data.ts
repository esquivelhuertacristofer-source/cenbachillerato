/**
 * Contenido curricular VERBATIM de la progresión IN-IV-P03 (Inglés IV):
 * «Describe rutinas y hábitos con conciencia del contexto (explica lo que se
 * hace y por qué, en la escuela, la casa o la comunidad).»
 *
 * Sale de `npx tsx scripts/dump-actividades.ts --progresion IN-IV-P03`:
 *  · A1 glosario «Daily Routines and Habits: Key Vocabulary»
 *  · A3 autoevaluación «Self-Assessment: Describing My Routines»
 *  · A4 verdadero/falso «True or False — Routines & habits in context»
 *  · A5 glosario «Glossary — Habits, routines & purpose expressions»
 *  · A7 autoevaluación «Self-check — Describing routines with context»
 *  · A8 video «Describir rutinas y hábitos en inglés» (preguntas cerradas)
 * Los huecos de A2 y A6 viven en `habitos-contexto-huecos.ts`.
 *
 * No se edita el texto: si cambia la base, se vuelve a volcar.
 */
import type { QuizEvaluable } from "./_reto-quiz";

export const PROGRESION_TITULO =
  "Describe rutinas y hábitos con conciencia del contexto (explica lo que se hace y por qué, en la escuela, la casa o la comunidad).";

export interface TerminoGlosario {
  id: string;
  termino: string;
  definicion: string;
  ejemplo: string;
}

/** A1 — Daily Routines and Habits: Key Vocabulary (10 términos). */
export const GLOSARIO_A1: TerminoGlosario[] = [
  {
    id: "wake-up",
    termino: "wake up",
    definicion: "Dejar de dormir y abrir los ojos por la mañana (despertarse). Verbo irregular: wake → woke → woken.",
    ejemplo: "I usually wake up at 6:30 am. (Normalmente me despierto a las 6:30.) / She woke up late on Saturday.",
  },
  {
    id: "go-to-bed",
    termino: "go to bed",
    definicion: "Ir a dormir, acostarse por la noche (irse a la cama).",
    ejemplo: "He goes to bed at 10 pm on school nights. (Se va a dormir a las 10 pm los días de escuela.)",
  },
  {
    id: "have-meals",
    termino: "have breakfast / lunch / dinner",
    definicion: "Tomar el desayuno / almuerzo / cena. En inglés no usamos artículo (no se dice 'have a breakfast').",
    ejemplo: "We have dinner together as a family every evening. (Cenamos juntos en familia cada tarde.)",
  },
  {
    id: "commute",
    termino: "commute",
    definicion: "Viajar diariamente entre el hogar y el trabajo o escuela (trasladarse). Se usa como verbo y como sustantivo.",
    ejemplo: "My commute to school takes 45 minutes by bus. (Mi trayecto a la escuela tarda 45 minutos en camión.)",
  },
  {
    id: "get-used-to",
    termino: "get used to",
    definicion: "Acostumbrarse a algo (adaptarse a una nueva situación o hábito). Se usa con verbo en -ing o sustantivo.",
    ejemplo: "It takes time to get used to waking up early. (Lleva tiempo acostumbrarse a despertarse temprano.)",
  },
  {
    id: "tend-to",
    termino: "tend to",
    definicion: "Tener la tendencia a hacer algo (soler hacer). Expresa un hábito o patrón general de comportamiento.",
    ejemplo: "Teenagers tend to stay up late on weekends. (Los adolescentes tienden a quedarse despiertos hasta tarde los fines de semana.)",
  },
  {
    id: "usually",
    termino: "usually",
    definicion: "Normalmente, generalmente. Adverbio de frecuencia (~80% del tiempo). Va antes del verbo principal pero después de 'be'.",
    ejemplo: "She usually studies for two hours after school. (Ella normalmente estudia dos horas después de la escuela.)",
  },
  {
    id: "rarely",
    termino: "rarely",
    definicion: "Rara vez, casi nunca. Adverbio de frecuencia (~10-20% del tiempo). Indica poca frecuencia.",
    ejemplo: "He rarely eats fast food because he prefers home-cooked meals. (Él rara vez come comida rápida porque prefiere la comida casera.)",
  },
  {
    id: "because",
    termino: "because",
    definicion: "Porque. Conjunción causal que introduce la razón o causa de una acción. Conecta dos cláusulas.",
    ejemplo: "I exercise every day because it helps me concentrate in class. (Hago ejercicio todos los días porque me ayuda a concentrarme en clase.)",
  },
  {
    id: "due-to",
    termino: "due to",
    definicion: "Debido a, a causa de. Conector causal más formal que 'because'. Se usa antes de un sustantivo o frase nominal.",
    ejemplo: "Due to traffic, many students arrive late. (Debido al tráfico, muchos estudiantes llegan tarde.)",
  },
];

export const ACTIVIDAD_FINAL_A1 =
  "Elige 5 términos del glosario. Para cada uno, escribe una oración en inglés sobre tu propia rutina. Usa adverbios de frecuencia (usually, rarely, always, sometimes) y el conector 'because' en al menos dos oraciones.";

/** A5 — Glossary — Habits, routines & purpose expressions (6 términos). */
export const GLOSARIO_A5: TerminoGlosario[] = [
  { id: "present-simple", termino: "present simple (habits)", definicion: "Tiempo para acciones habituales o rutinas: I walk, she studies, we eat.", ejemplo: "I usually take a walk after dinner." },
  { id: "so-that", termino: "so that / in order to", definicion: "Conectores de propósito: para que / con el fin de.", ejemplo: "I revise my notes every evening in order to remember the content." },
  { id: "be-used-to", termino: "be used to + verb-ing", definicion: "Estar acostumbrado/a a algo (ya no es difícil).", ejemplo: "I'm used to commuting by bus — I've done it for years." },
  { id: "i-tend-to", termino: "I tend to + infinitive", definicion: "Tener tendencia a hacer algo habitualmente.", ejemplo: "I tend to procrastinate when I'm stressed." },
  { id: "context-phrases", termino: "context phrases", definicion: "Frases contextuales: on school days, at weekends, during the week.", ejemplo: "On school days, I have lunch at the canteen." },
  { id: "reason-connectors", termino: "reason connectors", definicion: "Conectores causales para explicar hábitos: because, since, as.", ejemplo: "I drink plenty of water because it helps me concentrate." },
];

export const ACTIVIDAD_FINAL_A5 =
  "Describe tu rutina de un día de escuela. Incluye al menos 4 hábitos, explica el propósito de 2 de ellos con 'so that' o 'in order to', y menciona el contexto (on school days, in the morning, etc.).";

/** A3 — Self-Assessment: Describing My Routines (criterio + nivel «Logrado»). */
export const AUTOEVALUACION_A3: { criterio: string; logrado: string }[] = [
  {
    criterio: "Puedo describir mis rutinas y hábitos diarios usando el presente simple en afirmativo, negativo e interrogativo.",
    logrado: "Uso el presente simple correctamente en afirmativo, negativo e interrogativo, incluyendo la -s de tercera persona y los verbos irregulares (have, go, do).",
  },
  {
    criterio: "Puedo usar adverbios de frecuencia (always, usually, often, sometimes, rarely, never) en la posición correcta dentro de la oración.",
    logrado: "Coloco los adverbios de frecuencia correctamente: antes del verbo principal y después de 'be'. Uso variedad de adverbios para expresar distintos grados de frecuencia.",
  },
  {
    criterio: "Puedo usar 'because' para explicar la razón o causa de un hábito o rutina.",
    logrado: "Uso 'because' correctamente para explicar causas: 'I exercise because it helps me feel better.' Distingo entre 'because' (causa) y 'so' (consecuencia).",
  },
  {
    criterio: "Puedo usar vocabulario específico de hábitos y rutinas (wake up, commute, tend to, get used to) en contexto.",
    logrado: "Uso con confianza expresiones como wake up, go to bed, commute, tend to, get used to, rarely, due to en oraciones propias y significativas.",
  },
];

export const REFLEXION_A3 =
  "Describe en inglés tu rutina ideal de un día entre semana. Usa presente simple, al menos dos adverbios de frecuencia y la conjunción 'because' para explicar al menos una de tus rutinas.";

/** A7 — Self-check — Describing routines with context (criterios). */
export const AUTOEVALUACION_A7: string[] = [
  "Uso el presente simple correctamente para describir hábitos y rutinas.",
  "Explico el propósito de mis rutinas con 'so that' o 'in order to'.",
  "Uso 'be used to + -ing' y 'tend to' para describir tendencias y costumbres.",
  "Sitúo mis rutinas en contexto (on school days, at weekends, in the morning).",
];

export const REFLEXION_A7 = "¿Qué hábito de tu vida cotidiana puedes describir en inglés explicando también por qué lo haces?";

/** A8 — video (título, descripción y la pregunta abierta). */
export const VIDEO_A8 = {
  titulo: "Describir rutinas y hábitos en inglés",
  descripcion:
    "Video que explica cómo describir en inglés lo que se hace habitualmente en la escuela, la casa o la comunidad, y por qué se hace.",
  preguntaAbierta: "¿Qué rutina diaria tuya podrías describir en inglés y por qué la realizas?",
};

/**
 * Reto: los cinco verdadero/falso de A4 (enunciado y retroalimentación
 * verbatim) y las dos preguntas cerradas del video A8 (enunciado y opciones
 * verbatim; A8 no trae retroalimentación, la que se muestra es del laboratorio).
 * Mínimo aprobatorio 70 %, el de A4.
 */
export const QUIZ_HABITOS: QuizEvaluable = {
  titulo: "True or False — Routines & habits in context",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "The present simple is used to describe routines and regular habits ('I wake up at 6 every day').",
      opciones: ["True", "False"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correct: the present simple expresses habitual or repeated actions.",
    },
    {
      enunciado: "Adding 'so that' or 'in order to' after a routine explains its purpose ('I exercise so that I can stay healthy').",
      opciones: ["True", "False"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correct: 'so that' and 'in order to' express purpose and make routines more meaningful.",
    },
    {
      enunciado: "'I'm used to waking up early' means you find it difficult to wake up early.",
      opciones: ["True", "False"],
      respuestaCorrecta: 1,
      retroalimentacion: "'Be used to + verb-ing' means the action is familiar and no longer difficult.",
    },
    {
      enunciado: "Frequency adverbs (always, usually, rarely) come after the main verb in most sentences.",
      opciones: ["True", "False"],
      respuestaCorrecta: 1,
      retroalimentacion: "No: frequency adverbs usually come before the main verb ('I always have breakfast') but after 'be' ('She is always on time').",
    },
    {
      enunciado: "'I tend to + infinitive' is a natural way to describe a regular personal habit.",
      opciones: ["True", "False"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correct: 'I tend to check my phone first thing in the morning' = it's a regular tendency.",
    },
    {
      enunciado: "¿Qué tiempo verbal en inglés se usa comúnmente para describir rutinas y hábitos?",
      opciones: ["El pasado perfecto (Past Perfect)", "El presente simple (Simple Present)", "El futuro continuo (Future Continuous)"],
      respuestaCorrecta: 1,
      retroalimentacion: "El presente simple expresa lo que se hace de manera habitual: «I take the school bus every day».",
    },
    {
      enunciado: "Describir una rutina con conciencia del contexto implica explicar no solo qué se hace, sino también por qué.",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: 0,
      retroalimentacion: "Verdadero: además de qué haces y con qué frecuencia, dices por qué, cuándo y dónde lo haces.",
    },
  ],
};

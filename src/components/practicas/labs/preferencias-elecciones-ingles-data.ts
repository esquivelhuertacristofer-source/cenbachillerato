/**
 * Contenido VERBATIM de la progresión IN-IV-P02 (Inglés IV):
 * «Expresa y justifica preferencias de forma respetuosa (compara elecciones
 * personales en contextos cotidianos)».
 *
 * Sale tal cual de las actividades A1 (lectura), A2 (quiz), A3 (reflexión),
 * A4 (verdadero/falso), A5 (glosario), A7 (autoevaluación) y A9 (video). El
 * texto de A6 (fill_blanks) vive en `preferencias-elecciones-ingles-huecos.ts`.
 * No se reescribe: el laboratorio lo cita y lo pone en la pestaña «Teoría».
 */

export const LECTURA_TITULO = "Better, Best, or Different? Comparatives and Superlatives";
export const LECTURA_FUENTE = "CEN Bachillerato — UAC Inglés IV";

/** IN-IV-P02-A1 · texto, partido por sus párrafos. */
export const LECTURA_PARRAFOS: string[] = [
  "Comparatives and superlatives are two of the most useful grammatical tools in English for expressing preferences, making choices, and evaluating options. Once you understand how they work, you can use them in almost every conversation.",
  "Comparative adjectives are used to compare two things. For short adjectives (one syllable), we add -er and then the word 'than': fast becomes faster than, big becomes bigger than, old becomes older than. For longer adjectives (two or more syllables), we use 'more' before the adjective: interesting becomes more interesting than, expensive becomes more expensive than, comfortable becomes more comfortable than.",
  "Superlative adjectives are used to compare one thing with all others in a group. For short adjectives, we add 'the' + '-est': the fastest, the biggest, the oldest. For longer adjectives, we use 'the most': the most interesting, the most expensive, the most comfortable.",
  "Some adjectives are irregular and must be memorized. 'Good' becomes 'better' in the comparative and 'the best' in the superlative. 'Bad' becomes 'worse' and 'the worst'. 'Far' becomes 'further' (or 'farther') and 'the furthest'. These three are the most common irregular forms and they appear in everyday English constantly.",
  "There are two common mistakes to avoid. The first is the double comparative: saying 'more faster' or 'more bigger'. Since 'faster' already is the comparative of 'fast', adding 'more' creates a redundant double comparison. The second is the double superlative: saying 'the most best'. Since 'best' is already the superlative of 'good', 'the most' is unnecessary.",
  "In a Mexican context, we can practice comparatives with things we know: Mexico City is bigger than Guadalajara, but Monterrey is more industrial than Oaxaca. Tacos are more popular than tortas in many parts of the country, but tamales are the most traditional food for Christmas and Dia de Reyes. The Metro in Mexico City is cheaper than the Metrobus, but the Metrobus is faster than the pesero on many routes.",
  "To express preferences politely with comparatives, use structures like: I think tacos are more practical than tamales because you can eat them on the go. I prefer the metro because it is faster than the pesero and more affordable than a taxi. In my opinion, Oaxaca is more beautiful than any other city I have visited because of its architecture and food.",
  "Practice: write three sentences comparing two Mexican cities, foods, or means of transport using comparatives and superlatives.",
];

/** IN-IV-P02-A1 · callout «sabías». */
export const LECTURA_SABIAS =
  "In everyday English, comparatives are used not just to compare things but also to describe changes over time: English is getting easier every day. The city is becoming more polluted. Prices are higher than last year. This use of comparatives with verbs like get, become, and grow is very common in conversation.";

/** IN-IV-P02-A1 · preguntas de comprensión. */
export const LECTURA_PREGUNTAS: { pregunta: string; guia: string }[] = [
  {
    pregunta: "What is the difference between a comparative and a superlative adjective? Give one example of each.",
    guia: "A comparative compares two things (faster than, more interesting than); a superlative compares one thing with all others in a group (the fastest, the most interesting).",
  },
  {
    pregunta: "What are the two common mistakes with comparatives and superlatives? How can you avoid them?",
    guia: "Double comparative (more faster) and double superlative (the most best). Avoid them by never adding more/most to an already comparative or superlative form.",
  },
  {
    pregunta: "What are the irregular comparative and superlative forms of good, bad, and far?",
    guia: "Good: better, the best. Bad: worse, the worst. Far: further/farther, the furthest/farthest.",
  },
];

/** IN-IV-P02-A5 · glosario (Preferences, justifications & polite disagreement). */
export interface TerminoGlosario {
  id: EstructuraId;
  termino: string;
  definicion: string;
  ejemplo: string;
  etiqueta: string;
}

export type EstructuraId = "prefer-to" | "rather" | "porque" | "sounds-but" | "what-prefer" | "opinion";

export const GLOSARIO: TerminoGlosario[] = [
  { id: "prefer-to", termino: "prefer X to Y", definicion: "Estructura para preferir X sobre Y (sustantivos o verbos -ing).", ejemplo: "I prefer cooking at home to eating out.", etiqueta: "preferencia" },
  { id: "rather", termino: "I'd rather + bare infinitive", definicion: "Preferir hacer algo en este momento o en general.", ejemplo: "I'd rather watch a film than go to a party tonight.", etiqueta: "preferencia" },
  { id: "porque", termino: "because / since / as", definicion: "Conectores causales para justificar una preferencia.", ejemplo: "I prefer cycling since it's healthier and cheaper.", etiqueta: "conector" },
  { id: "sounds-but", termino: "That sounds good, but...", definicion: "Expresión de discrepancia respetuosa al dar la propia opinión.", ejemplo: "That sounds fun, but personally I'd rather stay in tonight.", etiqueta: "cortesía" },
  { id: "what-prefer", termino: "What do you prefer, X or Y?", definicion: "Pregunta estándar para conocer las preferencias de alguien.", ejemplo: "What do you prefer, the mountains or the beach?", etiqueta: "pregunta" },
  { id: "opinion", termino: "in my opinion / personally", definicion: "Expresiones para introducir una opinión o preferencia personal.", ejemplo: "Personally, I think working in the morning is more productive.", etiqueta: "opinión" },
];

/** IN-IV-P02-A5 · actividad final. */
export const GLOSARIO_ACTIVIDAD_FINAL =
  "Escribe un mini-diálogo de 6 intercambios con un amigo/a donde ambos expresen y justifiquen una preferencia diferente (viaje, comida, deporte) usando las estructuras del glosario.";

/** Pregunta del reto: opción múltiple (A2, A9) o verdadero/falso (A4). */
export interface PreguntaReto {
  ancla: string;
  enunciado: string;
  opciones: string[];
  correcta: number;
  retro: string;
}

const VF = ["True", "False"];

/** IN-IV-P02-A4 (V/F) + IN-IV-P02-A2 (opción múltiple), verbatim. */
export const QUIZ: PreguntaReto[] = [
  { ancla: "A4", enunciado: "'I prefer X to Y' and 'I'd rather do X than Y' both express a preference between two options.", opciones: VF, correcta: 0, retro: "Correct: both structures compare two choices and express which you prefer." },
  { ancla: "A4", enunciado: "'I'd rather' is followed by the infinitive with 'to' ('I'd rather to stay home').", opciones: VF, correcta: 1, retro: "No: 'I'd rather' is followed by the bare infinitive (no 'to'): 'I'd rather stay home'." },
  { ancla: "A4", enunciado: "Adding 'because' or 'since' to a preference statement makes it more justified and respectful.", opciones: VF, correcta: 0, retro: "Correct: giving a reason shows respect for the listener ('I prefer tea to coffee because it's calmer')." },
  { ancla: "A4", enunciado: "The phrase 'That sounds great, but personally I prefer...' is a polite way to disagree on preferences.", opciones: VF, correcta: 0, retro: "Correct: acknowledging the other view before expressing yours keeps the exchange respectful." },
  { ancla: "A4", enunciado: "'What do you prefer, X or Y?' is a common way to ask someone about their preference.", opciones: VF, correcta: 0, retro: "Correct: this is a standard preference question in everyday English conversation." },
  {
    ancla: "A2",
    enunciado: "Choose the correct comparative: 'Guadalajara is ___ Mexico City, but it is also ___ city I have visited.'",
    opciones: ["smaller than / the most relaxed", "smallest than / more relaxed", "more small than / the relaxeder", "smaller than / most relaxed"],
    correcta: 0,
    retro: "'Smaller than' — adjetivo corto (small = 1 sílaba), comparativo con -er. 'The most relaxed' — adjetivo de 2+ sílabas, superlativo con 'the most'. Nunca se usa 'more' con adjetivos cortos ni 'most' sin 'the'.",
  },
  {
    ancla: "A2",
    enunciado: "What is the superlative of 'bad'?",
    opciones: ["the worst", "the most bad", "the more bad", "the baddest"],
    correcta: 0,
    retro: "'Bad' es irregular: bad → worse (comparativo) → the worst (superlativo). No se usa 'most bad' ni 'baddest'.",
  },
  {
    ancla: "A2",
    enunciado: "Which sentence uses a conjunction CORRECTLY?",
    opciones: ["I like tacos, so they are spicy.", "I like tacos, but I don't eat them every day.", "I like tacos, and I not like pizza.", "I like tacos, or I eat them every day."],
    correcta: 1,
    retro: "'But' conecta dos ideas contrastantes (me gustan los tacos, PERO no los como todos los días). 'And' suma ideas; 'so' indica consecuencia. Opción A: 'so' no es correcto aquí (la especia no es consecuencia de gustarle). Opción C: estructura incorrecta.",
  },
  {
    ancla: "A2",
    enunciado: "Complete: 'In my opinion, the metro is ___ the bus for getting around Mexico City.'",
    opciones: ["more faster than", "faster than", "more fast than", "the fastest than"],
    correcta: 1,
    retro: "'Fast' es un adjetivo corto (1 sílaba). El comparativo correcto es 'faster than'. 'More fast' es incorrecto para adjetivos cortos. 'More faster' es una doble comparación incorrecta.",
  },
  {
    ancla: "A2",
    enunciado: "Which is the CORRECT superlative sentence?",
    opciones: ["The Zócalo is the more beautiful plaza in Mexico.", "The Zócalo is the beautifulest plaza in Mexico.", "The Zócalo is the most beautiful plaza in Mexico.", "The Zócalo is most beautiful plaza in Mexico."],
    correcta: 2,
    retro: "'Beautiful' tiene 3 sílabas — superlativo: 'the most beautiful'. Nunca añadimos -est a adjetivos largos. Y no olvidamos 'the' antes del superlativo.",
  },
];

/** A4 y A2 piden 70 % para aprobar. */
export const QUIZ_MINIMO = 0.7;

/** IN-IV-P02-A3 · reflexión escrita (Compare and Justify: My Preferences). */
export const REFLEXION = {
  titulo: "Compare and Justify: My Preferences",
  prompt:
    "Compara dos cosas que conozcas bien: dos ciudades, dos platillos, dos actividades, dos lugares o dos opciones de vida. Justifica por qué prefieres una sobre la otra.\n\nEscribe en inglés o en español. Tu texto debe incluir al menos 3 comparativos o superlativos y al menos 2 conjunciones (and, so, but) para conectar tus ideas.",
  pistas: [
    "Comparativos: bigger than, more interesting than, better than, worse than, cheaper than.",
    "Superlativos: the best, the most delicious, the most popular, the closest, the cheapest.",
    "Conjunciones: 'I prefer X and it is also...' / 'X is bigger, but Y is more...' / 'Y is cheaper, so I...'",
    "Ideas para comparar: tacos de canasta vs. tortas ahogadas, CDMX vs. Oaxaca, estudiar en casa vs. en la biblioteca, caminar vs. el camión.",
  ],
  criterios: [
    "Usa al menos 3 formas comparativas o superlativas correctas",
    "Usa las conjunciones and, so, y/o but para conectar ideas",
    "Compara dos cosas concretas con detalles específicos",
    "Justifica su preferencia con al menos una razón clara",
  ],
};

/** IN-IV-P02-A7 · autoevaluación (Self-check — Justifying preferences respectfully). */
export const AUTOEVALUACION: string[] = [
  "Expreso preferencias usando 'prefer X to Y' y 'I'd rather + verbo'.",
  "Justifico mis preferencias con 'because', 'since' o 'as' y una razón concreta.",
  "Discrepo de forma respetuosa usando expresiones como 'That sounds good, but...'.",
  "Pregunto sobre las preferencias de otros con 'What do you prefer...?'.",
];
export const AUTOEVALUACION_REFLEXION = "¿Qué preferencia tuya (comida, actividad, destino) ya puedes expresar y justificar en inglés?";

/** IN-IV-P02-A9 · video «Comparativos y superlativos en inglés», preguntas. */
export const VIDEO_TITULO = "Comparativos y superlativos en inglés";
export const VIDEO_DESCRIPCION = "Los comparativos y superlativos son de las herramientas más útiles del inglés para expresar preferencias y evaluar opciones.";
export const VIDEO_PREGUNTAS: { pregunta: string; respuesta?: string }[] = [
  { pregunta: "Escribe tres comparaciones en inglés entre lugares o comidas de México, y una oración con superlativo que justifique tu preferencia." },
  { pregunta: "¿Cuál es el superlativo correcto de 'good'?", respuesta: "the best" },
  { pregunta: "Decir 'more faster' es incorrecto porque 'faster' ya es el comparativo de 'fast'.", respuesta: "Verdadero" },
];

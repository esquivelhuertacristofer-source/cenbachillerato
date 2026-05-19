/**
 * Seed de actividades pedagógicas para IN-II (Inglés II — A1+).
 * 8 progresiones × 3 actividades = 24 actividades. estado='publicada'.
 * Tipos: lectura, video_con_preguntas, infografia, glosario_interactivo,
 *        fill_blanks, quiz_multiple_opcion, quiz_verdadero_falso,
 *        reflexion_escrita, autoevaluacion (9 tipos)
 * Uso: npx tsx scripts/seed-activities-inii.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🌱 Seed actividades IN-II — Inglés II (A1+)\n");

  const progs = await getProgresionesDeUAC(sb, "IN-II");
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
      descripcion: "Reflexión o autoevaluación de cierre.",
      tipo: tiposA3[n - 1],
      progresion_id: p.id,
      xp: 20,
      estado: "publicada",
      contenido: contenidosA3[n - 1],
    });
    a3ok ? ok++ : fail++;
  }

  log(`\n✅ IN-II: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── TÍTULOS ──────────────────────────────────────────────────────────────────

const titulos = [
  { a1: "Daily Routines Around the World", a2: "My Daily Routine: Fill in the Blanks", a3: "Writing About My Daily Routine" },
  { a1: "What Do They Do in Their Free Time?", a2: "Third Person Present Simple: Gaps", a3: "Describing a Friend's Free Time" },
  { a1: "Can and Can't: Abilities and Permissions", a2: "Using Can and Can't Correctly", a3: "Things I Can and Cannot Do" },
  { a1: "Describing People, Clothes and Weather", a2: "Appearance and Weather: Fill in the Blanks", a3: "Describing Someone I Know" },
  { a1: "Making Comparisons in English", a2: "Comparatives: True or False?", a3: "Comparing Two Places in My Community" },
  { a1: "How to Ask for and Give Directions", a2: "Following Directions: Fill in the Gaps", a3: "Giving Directions to My School" },
  { a1: "Expressing Needs and Desires in English", a2: "Would Like, How Much and How Many", a3: "What My Community Needs" },
  { a1: "Key Vocabulary: English Level A1+", a2: "Review: All Structures from Inglés II", a3: "Self-Assessment: My Progress in English II" },
];

const tiposA1 = ["lectura", "video_con_preguntas", "lectura", "infografia", "lectura", "video_con_preguntas", "lectura", "glosario_interactivo"] as const;
const tiposA2 = ["fill_blanks", "fill_blanks", "quiz_multiple_opcion", "fill_blanks", "quiz_verdadero_falso", "fill_blanks", "quiz_multiple_opcion", "quiz_multiple_opcion"] as const;
const tiposA3 = ["reflexion_escrita", "reflexion_escrita", "reflexion_escrita", "reflexion_escrita", "reflexion_escrita", "reflexion_escrita", "reflexion_escrita", "autoevaluacion"] as const;

// ── CONTENIDOS A1 ─────────────────────────────────────────────────────────────

const contenidosA1 = [
  { // P01 — lectura
    texto: `Daily routines are the activities we do regularly, day after day. In many countries, routines are similar but the timing is different. In Mexico, many families have lunch (comida) as the main meal of the day, usually around 2:00 or 3:00 pm. In Spain, dinner is often after 9:00 pm. In Japan, many people take the train to work or school every morning.\n\nHere is a typical routine for a high school student in Mexico:\nShe wakes up at 6:30 am. She showers and gets dressed. She eats breakfast with her family. She takes the bus to school at 7:15 am. She has classes from 8:00 am to 2:00 pm. She eats lunch at home. In the afternoon, she does her homework. She watches a show with her family at night. She goes to bed at 10:00 pm.\n\nIn English, we describe routines with the Present Simple tense. For I/you/we/they: I wake up, you eat, they go. For he/she/it: she wakes up, he eats, it starts. Notice the -s ending for third person singular.`,
    fuente: "Material elaborado para CEN Bachillerato — IN-II",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 8,
    preguntas_comprension: [
      { pregunta: "What time does the student in the text wake up?", respuesta_guia: "She wakes up at 6:30 am." },
      { pregunta: "How does Present Simple change for he/she/it?", respuesta_guia: "We add -s to the verb: she wakes, he eats, it starts." },
      { pregunta: "What is different about mealtimes in Mexico and Spain?", respuesta_guia: "In Mexico, comida is the main meal around 2-3 pm. In Spain, dinner is after 9 pm." },
    ],
  },
  { // P02 — video_con_preguntas
    url_video: "https://example.com/video-pendiente-cen",
    titulo_video: "What Do They Do in Their Free Time?",
    descripcion_video: "Video sobre actividades de tiempo libre en inglés con foco en el uso de la tercera persona singular del Present Simple. Incluye vocabulario de pasatiempos (reading, playing soccer, painting, cooking) y expresiones de frecuencia (every day, on weekends, once a week).",
    duracion_segundos: 360,
    subtitulos_disponibles: true,
    preguntas: [
      { tiempo_segundos: 80, pregunta: "What hobbies are mentioned in the video? Name at least three.", tipo: "abierta" as const },
      { tiempo_segundos: 200, pregunta: "How do you say 'ella juega fútbol todos los sábados' in English?", tipo: "abierta" as const },
      { tiempo_segundos: 320, pregunta: "What is your favorite free time activity? Write one sentence using he/she/it or I.", tipo: "abierta" as const },
    ],
  },
  { // P03 — lectura
    texto: `Can and can't are two very useful words in English. We use 'can' to talk about ability (something we know how to do) and permission (something we are allowed to do).\n\nAbility examples:\n• I can swim. (I know how to do it.)\n• She can speak three languages. (She has that skill.)\n• They can't cook. (They don't know how.)\n\nPermission examples:\n• Can I use your phone? (May I? Is it allowed?)\n• You can leave class early today. (Permission granted.)\n• You can't park here. (It is not allowed.)\n\nImportant: 'Can' does NOT change for any subject. We say: I can, you can, he can, she can, we can, they can. There is no -s for third person.\n\nTo make a question: Can + subject + verb? Can you help me? Can she drive?\nNegative: cannot or can't. She can't come to the party.`,
    fuente: "Material elaborado para CEN Bachillerato — IN-II",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 7,
    preguntas_comprension: [
      { pregunta: "What are the two uses of 'can'?", respuesta_guia: "Ability (knowing how to do something) and permission (being allowed to do something)." },
      { pregunta: "Does 'can' change for third person singular (he/she/it)?", respuesta_guia: "No, 'can' stays the same for all subjects. No -s for he/she/it." },
      { pregunta: "How do you form a question with 'can'?", respuesta_guia: "Can + subject + verb (base form): Can she drive?" },
    ],
  },
  { // P04 — infografia
    titulo: "Describing People, Clothes and Weather in English",
    url_imagen: "/placeholder/infografia.svg",
    descripcion_accesible: "Infografía con vocabulario en inglés para describir personas (apariencia física), ropa (clothing items) y clima (weather), con ejemplos de oraciones usando have/has, adjectives, and present continuous.",
    puntos_clave: [
      "Physical appearance: tall/short, long/short hair, dark/light eyes, young/old.",
      "Use have/has: She has long brown hair. He has blue eyes.",
      "Clothing: jacket, dress, jeans, sneakers, scarf, boots.",
      "Use present continuous for what someone is wearing NOW: She is wearing a red dress.",
      "Weather vocabulary: sunny, cloudy, rainy, windy, hot, cold, warm.",
      "Weather sentences: It is raining. It is very hot today. It was cold yesterday.",
      "Respecting diversity: avoid stereotypes when describing people from different cultures.",
    ],
    fuente: "Material CEN Bachillerato — IN-II",
    actividad_post: "Describe a person you know using at least 3 sentences about appearance and 2 sentences about the weather in your city today.",
  },
  { // P05 — lectura
    texto: `When we compare two things in English, we use comparative adjectives. The rules depend on the number of syllables in the adjective.\n\nOne-syllable adjectives: Add -er + than.\n• tall → taller than\n• fast → faster than\n• big → bigger than (double the final consonant)\n\nTwo or more syllable adjectives: Use more + adjective + than.\n• interesting → more interesting than\n• expensive → more expensive than\n• beautiful → more beautiful than\n\nIrregular comparatives (no rules — memorize these):\n• good → better than\n• bad → worse than\n• far → farther/further than\n\nExamples:\n• Mexico City is bigger than Querétaro.\n• My sister is more intelligent than me. (But she is also taller!)\n• The mountains are farther than the beach.\n\nComparatives help us express differences between people, places, objects, and situations in our daily life.`,
    fuente: "Material elaborado para CEN Bachillerato — IN-II",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 8,
    preguntas_comprension: [
      { pregunta: "What is the comparative form of 'fast'?", respuesta_guia: "faster than" },
      { pregunta: "When do we use 'more + adjective + than'?", respuesta_guia: "With adjectives of two or more syllables." },
      { pregunta: "What is the irregular comparative of 'good'?", respuesta_guia: "better than" },
    ],
  },
  { // P06 — video_con_preguntas
    url_video: "https://example.com/video-pendiente-cen",
    titulo_video: "How to Ask for and Give Directions in English",
    descripcion_video: "Video sobre cómo pedir y dar indicaciones de camino en inglés. Incluye vocabulario de preposiciones de movimiento (turn left, go straight, cross the street) y frases clave (Excuse me, how do I get to...? Take the first right.).",
    duracion_segundos: 400,
    subtitulos_disponibles: true,
    preguntas: [
      { tiempo_segundos: 90, pregunta: "What is the polite way to start asking for directions in English?", tipo: "abierta" as const },
      { tiempo_segundos: 220, pregunta: "What do 'turn left', 'go straight', and 'cross the street' mean in Spanish?", tipo: "abierta" as const },
      { tiempo_segundos: 360, pregunta: "Can you give directions from your home to the nearest store in English?", tipo: "abierta" as const },
    ],
  },
  { // P07 — lectura
    texto: `When we want something or prefer something, we use 'would like'. It is more polite than 'want'. Would like + noun or would like + to + verb.\n\n• I would like a glass of water, please. (noun)\n• She would like to study medicine. (infinitive)\n• Would you like some coffee? (question form)\n\nTo ask about quantities:\n• How much + uncountable noun (water, money, rice): How much water do you need?\n• How many + countable noun (apples, people, days): How many students are in your class?\n\nCountable nouns can be counted: one apple, two apples, three oranges.\nUncountable nouns cannot be counted directly: water, love, money, information.\n\nThese structures help us express desires and needs in everyday situations — at a store, at a restaurant, in conversations with neighbors, or when talking about community projects.`,
    fuente: "Material elaborado para CEN Bachillerato — IN-II",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 7,
    preguntas_comprension: [
      { pregunta: "What structure follows 'would like' when we want a thing (noun)?", respuesta_guia: "Would like + noun: I would like a glass of water." },
      { pregunta: "When do we use 'how much' vs 'how many'?", respuesta_guia: "How much with uncountable nouns; how many with countable nouns." },
      { pregunta: "Is 'money' countable or uncountable?", respuesta_guia: "Uncountable. We say 'how much money', not 'how many money'." },
    ],
  },
  { // P08 — glosario_interactivo
    terminos: [
      { termino: "routine", definicion: "A set of activities done regularly and in the same order.", ejemplo: "My morning routine: wake up, shower, eat breakfast, go to school.", etiquetas: ["IN-II", "P01", "daily life"] },
      { termino: "frequency adverb", definicion: "A word that says how often something happens (always, usually, sometimes, never).", ejemplo: "She always drinks coffee in the morning.", etiquetas: ["IN-II", "P01", "grammar"] },
      { termino: "ability", definicion: "Something you know how to do.", ejemplo: "I can play the guitar. He can't swim.", etiquetas: ["IN-II", "P03", "can"] },
      { termino: "permission", definicion: "Being allowed or not allowed to do something.", ejemplo: "Can I leave early? You can't park here.", etiquetas: ["IN-II", "P03", "can"] },
      { termino: "comparative adjective", definicion: "An adjective used to compare two things.", ejemplo: "She is taller than her brother. This book is more interesting.", etiquetas: ["IN-II", "P05", "grammar"] },
      { termino: "countable noun", definicion: "A noun you can count with numbers (apple, book, friend).", ejemplo: "How many apples do you have? I have three.", etiquetas: ["IN-II", "P07", "nouns"] },
      { termino: "uncountable noun", definicion: "A noun you cannot count directly (water, information, money).", ejemplo: "How much water do you drink? I drink a lot.", etiquetas: ["IN-II", "P07", "nouns"] },
      { termino: "would like", definicion: "A polite way to express a wish or preference.", ejemplo: "I would like some tea. She would like to travel.", etiquetas: ["IN-II", "P07", "expressing desires"] },
      { termino: "preposition of movement", definicion: "A word showing direction or movement (into, across, past, along).", ejemplo: "Walk across the street and turn left.", etiquetas: ["IN-II", "P06", "directions"] },
      { termino: "present continuous", definicion: "A tense used for actions happening right now (subject + is/are + verb-ing).", ejemplo: "She is wearing a blue jacket. They are studying.", etiquetas: ["IN-II", "P04", "grammar"] },
    ],
    actividad_final: "Review the 10 terms. Choose 5 and write one original sentence for each, using the English structures from Inglés II.",
  },
];

// ── CONTENIDOS A2 ─────────────────────────────────────────────────────────────

const contenidosA2 = [
  { // P01 — fill_blanks
    instrucciones: "Complete the sentences about Ana's daily routine. Use the correct form of the verbs: wake up, have, take, go, finish, do.",
    texto_con_huecos: "Ana ___ at 6:00 am every day. She ___ a shower and gets dressed. She ___ breakfast with her family at 6:30. She ___ the bus at 7:10 am. She ___ school at 2:00 pm. Then she ___ her homework before dinner.",
    huecos: [
      { posicion: 0, respuesta_correcta: "wakes up", alternativas_aceptadas: ["wakes"] },
      { posicion: 1, respuesta_correcta: "takes", alternativas_aceptadas: ["has"] },
      { posicion: 2, respuesta_correcta: "has", alternativas_aceptadas: ["eats"] },
      { posicion: 3, respuesta_correcta: "takes", alternativas_aceptadas: ["catches"] },
      { posicion: 4, respuesta_correcta: "finishes", alternativas_aceptadas: ["leaves"] },
      { posicion: 5, respuesta_correcta: "does", alternativas_aceptadas: ["finishes"] },
    ],
    distingue_mayusculas: false,
  },
  { // P02 — fill_blanks
    instrucciones: "Complete with the correct third person form of the verbs in parentheses.",
    texto_con_huecos: "My brother ___ (play) soccer every Saturday. He also ___ (read) graphic novels in his free time. He ___ (not watch) TV much. On Sundays, he ___ (go) to the park with his friends. He ___ (love) photography and ___ (take) pictures everywhere.",
    huecos: [
      { posicion: 0, respuesta_correcta: "plays", alternativas_aceptadas: [] },
      { posicion: 1, respuesta_correcta: "reads", alternativas_aceptadas: [] },
      { posicion: 2, respuesta_correcta: "doesn't watch", alternativas_aceptadas: ["does not watch"] },
      { posicion: 3, respuesta_correcta: "goes", alternativas_aceptadas: [] },
      { posicion: 4, respuesta_correcta: "loves", alternativas_aceptadas: [] },
      { posicion: 5, respuesta_correcta: "takes", alternativas_aceptadas: [] },
    ],
    distingue_mayusculas: false,
  },
  { // P03 — quiz_multiple_opcion
    preguntas: [
      { enunciado: "Choose the correct sentence:", opciones: ["She can sings very well.", "She can sing very well.", "She cans sing very well.", "She can to sing very well."], respuesta_correcta: 1, retroalimentacion: "After 'can', use the base form of the verb (no -s, no to)." },
      { enunciado: "'You ___ use your phone in the exam' (not allowed):", opciones: ["can", "can't", "cans", "cannot to"], respuesta_correcta: 1, retroalimentacion: "'Can't' expresses that something is not permitted." },
      { enunciado: "What does 'Can I open the window?' express?", opciones: ["Ability", "Permission", "A comparison", "A routine"], respuesta_correcta: 1, retroalimentacion: "Asking 'Can I...?' is a polite way to request permission." },
      { enunciado: "'My dog ___ swim, but it ___ climb trees.' Choose:", opciones: ["can / can't", "can / cans", "can't / can", "cans / can't"], respuesta_correcta: 0, retroalimentacion: "Dogs can swim (ability), but they can't climb trees (lack of ability)." },
      { enunciado: "Which sentence uses 'can' INCORRECTLY?", opciones: ["He can drive a truck.", "They can't speak French.", "She cans play basketball.", "Can you help me?"], respuesta_correcta: 2, retroalimentacion: "'Cans' is wrong — 'can' never changes form. The correct form is 'She can play'." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P04 — fill_blanks
    instrucciones: "Complete the description of the photo using: is wearing, has, are, looks, is.",
    texto_con_huecos: "In the photo, there ___ a young woman. She ___ long dark hair and brown eyes. She ___ a colorful jacket and blue jeans. The weather ___ cold, so she also ___ a scarf around her neck. She ___ happy and comfortable.",
    huecos: [
      { posicion: 0, respuesta_correcta: "is", alternativas_aceptadas: [] },
      { posicion: 1, respuesta_correcta: "has", alternativas_aceptadas: [] },
      { posicion: 2, respuesta_correcta: "is wearing", alternativas_aceptadas: ["wears"] },
      { posicion: 3, respuesta_correcta: "is", alternativas_aceptadas: [] },
      { posicion: 4, respuesta_correcta: "is wearing", alternativas_aceptadas: ["wears", "has"] },
      { posicion: 5, respuesta_correcta: "looks", alternativas_aceptadas: ["seems"] },
    ],
    distingue_mayusculas: false,
  },
  { // P05 — quiz_verdadero_falso
    preguntas: [
      { enunciado: "The comparative of 'hot' is 'more hot'.", respuesta: false, retroalimentacion: "One-syllable adjectives use -er: hotter than. We double the final consonant." },
      { enunciado: "The comparative of 'expensive' is 'more expensive than'.", respuesta: true, retroalimentacion: "Correct! Multi-syllable adjectives use 'more + adjective + than'." },
      { enunciado: "The comparative of 'good' is 'gooder'.", respuesta: false, retroalimentacion: "'Good' is irregular. Its comparative is 'better than'." },
      { enunciado: "We can use comparatives to describe differences between people or places.", respuesta: true, retroalimentacion: "Correct! Comparatives are perfect for describing contrasts and differences." },
      { enunciado: "'She is more tall than her sister' is grammatically correct.", respuesta: false, retroalimentacion: "'Tall' has one syllable, so we say 'taller than', not 'more tall than'." },
      { enunciado: "The comparative of 'bad' is 'worse than'.", respuesta: true, retroalimentacion: "Correct! 'Bad' is irregular: bad → worse than → the worst." },
    ],
    intentos_maximos: 2,
    puntaje_minimo_aprobacion: 70,
  },
  { // P06 — fill_blanks
    instrucciones: "Complete the directions with: turn left, go straight, cross, take, on the corner, next to.",
    texto_con_huecos: "To get to the market from the school: ___ out of the main door and ___ for two blocks. Then ___ at the traffic light. ___ the street carefully. The market is ___ with the pharmacy. It is ___ the big supermarket.",
    huecos: [
      { posicion: 0, respuesta_correcta: "Go", alternativas_aceptadas: ["Walk", "Come"] },
      { posicion: 1, respuesta_correcta: "go straight", alternativas_aceptadas: ["walk straight"] },
      { posicion: 2, respuesta_correcta: "turn left", alternativas_aceptadas: ["go left"] },
      { posicion: 3, respuesta_correcta: "Cross", alternativas_aceptadas: ["Cross over"] },
      { posicion: 4, respuesta_correcta: "on the corner", alternativas_aceptadas: ["at the corner"] },
      { posicion: 5, respuesta_correcta: "next to", alternativas_aceptadas: ["beside", "near"] },
    ],
    distingue_mayusculas: false,
  },
  { // P07 — quiz_multiple_opcion
    preguntas: [
      { enunciado: "Choose the correct sentence:", opciones: ["I would like a coffee, please.", "I would like to a coffee.", "I would likes a coffee.", "I like would a coffee."], respuesta_correcta: 0, retroalimentacion: "'Would like + noun' is the correct structure for polite requests." },
      { enunciado: "'How ___ milk do you need?' (milk is uncountable):", opciones: ["many", "much", "any", "some"], respuesta_correcta: 1, retroalimentacion: "'How much' is used with uncountable nouns like milk, water, money." },
      { enunciado: "'How ___ eggs do we need for the cake?' (eggs are countable):", opciones: ["much", "many", "little", "few"], respuesta_correcta: 1, retroalimentacion: "'How many' is used with countable nouns like eggs, students, chairs." },
      { enunciado: "Which noun is UNCOUNTABLE?", opciones: ["apple", "chair", "information", "friend"], respuesta_correcta: 2, retroalimentacion: "'Information' is uncountable. We say 'a piece of information', not 'an information'." },
      { enunciado: "'She would like ___ visit Paris someday.'", opciones: ["to", "a", "for", "at"], respuesta_correcta: 0, retroalimentacion: "'Would like + to + verb (infinitive)': She would like to visit Paris." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P08 — quiz_multiple_opcion (review)
    preguntas: [
      { enunciado: "She ___ (cook) for her family every Sunday.", opciones: ["cook", "cooks", "is cook", "does cook"], respuesta_correcta: 1, retroalimentacion: "Third person singular Present Simple: add -s → cooks." },
      { enunciado: "___ you ___ a bicycle? (ability)", opciones: ["Do / ride", "Can / ride", "Are / riding", "Would / ride"], respuesta_correcta: 1, retroalimentacion: "'Can + subject + verb' for ability questions." },
      { enunciado: "The hospital is ___ the school and the park.", opciones: ["next to", "between", "across", "along"], respuesta_correcta: 1, retroalimentacion: "'Between' indicates position in the middle of two reference points." },
      { enunciado: "Oaxaca is ___ interesting ___ Cancún for cultural tourism.", opciones: ["more / than", "most / of", "much / than", "more / that"], respuesta_correcta: 0, retroalimentacion: "'More + adjective + than' for multi-syllable comparatives." },
      { enunciado: "I ___ a glass of orange juice, please.", opciones: ["want like", "would like", "would likes", "like would"], respuesta_correcta: 1, retroalimentacion: "'Would like' is the polite form to express a wish." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
];

// ── CONTENIDOS A3 ─────────────────────────────────────────────────────────────

const contenidosA3 = [
  { // P01 — reflexion_escrita
    prompt: "Write about YOUR daily routine in English. Describe at least 6 activities from when you wake up to when you go to bed. Include the time for each activity. Use frequency adverbs (always, usually, sometimes, never) for at least 2 activities.",
    pistas: ["Start with: 'I wake up at...'", "Use Present Simple: I eat, I go, I study.", "Add frequency: I usually have breakfast with my family. I sometimes walk to school."],
    longitud_minima_palabras: 60,
    longitud_maxima_palabras: 200,
    criterios_evaluacion: ["Describes at least 6 daily activities", "Uses correct Present Simple forms", "Includes time expressions or frequency adverbs", "Writing is clear and understandable"],
    formato_esperado: "libre" as const,
  },
  { // P02 — reflexion_escrita
    prompt: "Write about the free time activities of someone you know well (a friend, family member, or neighbor). Describe at least 4 activities they do. Use third person singular (he/she/it + verb-s). Include WHEN they do these activities.",
    pistas: ["Remember: she plays, he reads, it starts (add -s for he/she/it).", "Use time expressions: on weekends, every evening, once a week.", "Start with: 'My [friend/brother/neighbor] is [name]. He/She...'" ],
    longitud_minima_palabras: 60,
    longitud_maxima_palabras: 180,
    criterios_evaluacion: ["Describes 4+ free time activities in third person", "Verb forms are correct for he/she", "Includes time expressions", "Text is organized and readable"],
    formato_esperado: "libre" as const,
  },
  { // P03 — reflexion_escrita
    prompt: "Write a short text in English about YOUR abilities and permissions. Include: (a) 3 things you CAN do, (b) 2 things you CAN'T do, (c) 2 things you are permitted to do at school or home, and (d) 1 thing you are NOT permitted to do.",
    pistas: ["Can + base verb: I can dance salsa. I can't play piano.", "For permission: I can use my phone at home. I can't use it in class.", "Be honest and specific about real abilities!"],
    longitud_minima_palabras: 60,
    longitud_maxima_palabras: 180,
    criterios_evaluacion: ["Correctly uses can and can't for ability", "Correctly uses can and can't for permission", "Includes the required number of examples", "Grammar is clear and correct"],
    formato_esperado: "libre" as const,
  },
  { // P04 — reflexion_escrita
    prompt: "Describe a real person you know (friend, family member, or teacher). Write about: (a) their physical appearance (at least 3 features), (b) what they are wearing TODAY (present continuous), and (c) what the weather is like today where you are. Write in English.",
    pistas: ["Appearance: He/She has [hair color and length] hair. He/She is [tall/short].", "Clothing today: He/She is wearing [clothes].", "Weather: Today it is [sunny/cloudy/cold...]."],
    longitud_minima_palabras: 60,
    longitud_maxima_palabras: 180,
    criterios_evaluacion: ["Describes physical appearance with 3+ features", "Uses present continuous for current clothing", "Describes the weather correctly", "Text is clear and respectful (avoids stereotypes)"],
    formato_esperado: "descripcion" as const,
  },
  { // P05 — reflexion_escrita
    prompt: "Write a short paragraph comparing TWO places in or near your community (two neighborhoods, two markets, two schools, two parks, etc.). Use at least 4 comparative adjectives. Include one sentence about why you prefer one over the other.",
    pistas: ["Comparatives: bigger, smaller, more crowded, cleaner, noisier, farther.", "Example: 'The central market is noisier than the local market, but it is cheaper.'", "End with your preference: 'I prefer... because...'"],
    longitud_minima_palabras: 60,
    longitud_maxima_palabras: 180,
    criterios_evaluacion: ["Compares two real places in the community", "Uses at least 4 correct comparative adjectives", "States a personal preference with a reason", "Text is clear and uses correct grammar"],
    formato_esperado: "libre" as const,
  },
  { // P06 — reflexion_escrita
    prompt: "Write directions in English from your school (or home) to a place in your community (a store, a park, a market, a bus stop). Use at least 6 direction phrases (turn left, go straight, cross the street, etc.) and prepositions of location (next to, between, on the corner of).",
    pistas: ["Start with: 'To get to [place], start at [starting point]...'", "Be specific: 'Walk two blocks', 'Turn right at the traffic light.'", "End with: 'You will see [landmark]. [Place] is next to it.'"],
    longitud_minima_palabras: 60,
    longitud_maxima_palabras: 200,
    criterios_evaluacion: ["Uses at least 6 direction phrases correctly", "Includes prepositions of location", "Directions are logical and could be followed by a real person", "Text is clear and organized step by step"],
    formato_esperado: "libre" as const,
  },
  { // P07 — reflexion_escrita
    prompt: "Think about a need or desire of YOUR community (a park, better public transport, a library, a sports center, clean water, etc.). Write in English: (a) what your community would like to have, (b) how much or how many of this thing is needed, and (c) why this is important for your community.",
    pistas: ["Use 'would like': 'My community would like to have...'", "Use 'how much' or 'how many': 'We need more water / We need 3 more buses.'", "Include a reason: 'This is important because...'"],
    longitud_minima_palabras: 60,
    longitud_maxima_palabras: 180,
    criterios_evaluacion: ["Clearly identifies a community need", "Uses 'would like' correctly", "Uses 'how much' or 'how many' appropriately", "Explains the importance with a reason"],
    formato_esperado: "libre" as const,
  },
  { // P08 — autoevaluacion
    instrucciones: "Self-assessment: evaluate your progress in Inglés II (A1+ level).",
    criterios: [
      {
        descripcion: "I can describe my daily routine in English using Present Simple",
        escala: [
          { valor: 1, etiqueta: "Beginning", descripcion: "I can only write 1-2 sentences with many errors." },
          { valor: 2, etiqueta: "Developing", descripcion: "I can write a basic routine with some grammar errors." },
          { valor: 3, etiqueta: "Achieved", descripcion: "I can write a complete routine with mostly correct grammar." },
          { valor: 4, etiqueta: "Excelling", descripcion: "I write a detailed routine with frequency adverbs and time expressions, few or no errors." },
        ],
      },
      {
        descripcion: "I can use 'can' and 'can't' to express abilities and ask for permission",
        escala: [
          { valor: 1, etiqueta: "Beginning", descripcion: "I confuse can with other structures." },
          { valor: 2, etiqueta: "Developing", descripcion: "I use can correctly in simple sentences." },
          { valor: 3, etiqueta: "Achieved", descripcion: "I use can/can't correctly for ability and permission." },
          { valor: 4, etiqueta: "Excelling", descripcion: "I use can/can't fluently in questions, statements, and both meanings." },
        ],
      },
      {
        descripcion: "I can compare things using comparative adjectives",
        escala: [
          { valor: 1, etiqueta: "Beginning", descripcion: "I know only one or two comparatives." },
          { valor: 2, etiqueta: "Developing", descripcion: "I use some comparatives but confuse the rules." },
          { valor: 3, etiqueta: "Achieved", descripcion: "I correctly use comparatives for 1-syllable and multi-syllable adjectives." },
          { valor: 4, etiqueta: "Excelling", descripcion: "I use comparatives correctly including irregular forms (better, worse)." },
        ],
      },
      {
        descripcion: "I can give and follow directions in English",
        escala: [
          { valor: 1, etiqueta: "Beginning", descripcion: "I only know 1-2 direction phrases." },
          { valor: 2, etiqueta: "Developing", descripcion: "I can give basic directions but forget prepositions." },
          { valor: 3, etiqueta: "Achieved", descripcion: "I give clear directions using 5+ phrases and prepositions." },
          { valor: 4, etiqueta: "Excelling", descripcion: "I give precise directions and can understand them when someone tells me." },
        ],
      },
    ],
    reflexion_final_prompt: "What aspect of Inglés II did you find most useful for real life? What do you still want to improve? Write 2-3 sentences in English.",
    visible_para_docente: true,
  },
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });

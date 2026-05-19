/**
 * Seed de actividades pedagógicas para IN-III (Inglés III — A2).
 * Título de la UAC: "What we were, we share"
 * 8 progresiones × 3 actividades = 24 actividades. estado='publicada'.
 * Tipos: lectura, video_con_preguntas, infografia, glosario_interactivo,
 *        fill_blanks, quiz_multiple_opcion, quiz_verdadero_falso,
 *        reflexion_escrita, autoevaluacion (9 tipos)
 * Uso: npx tsx scripts/seed-activities-iniii.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🌱 Seed actividades IN-III — Inglés III (A2) — What we were, we share\n");

  const progs = await getProgresionesDeUAC(sb, "IN-III");
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

  log(`\n✅ IN-III: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── TÍTULOS ──────────────────────────────────────────────────────────────────

const titulos = [
  { a1: "What Did You Do Yesterday?", a2: "Past Simple: Fill in the Blanks", a3: "Quiz: Past Simple Tense" },
  { a1: "Have You Ever…? Recent Experiences", a2: "Present Perfect: Fill in the Gaps", a3: "Reflecting on My Experiences" },
  { a1: "Describing Places with Prepositions", a2: "Where Is It? Fill in the Blanks", a3: "True or False: Prepositions of Place" },
  { a1: "Habits and Comparisons in English", a2: "Comparatives and Frequency: Fill in the Blanks", a3: "Quiz: Comparatives and Habits" },
  { a1: "Rules: Must, Mustn't and Have To", a2: "Obligation and Permission: True or False?", a3: "Self-Assessment: Rules and Obligations" },
  { a1: "How to Give Instructions in English", a2: "Sequencing Instructions: Fill in the Blanks", a3: "Quiz: Imperatives and Connectors" },
  { a1: "Telling a Story in the Past", a2: "Narrative Connectors: Fill in the Blanks", a3: "My Story: Written Reflection" },
  { a1: "A2 English: Key Vocabulary and Structures", a2: "A2 Review Quiz: Multiple Choice", a3: "Self-Assessment: My Progress in English III" },
];

const tiposA1 = ["lectura", "video_con_preguntas", "glosario_interactivo", "lectura", "lectura", "video_con_preguntas", "lectura", "infografia"] as const;
const tiposA2 = ["fill_blanks", "fill_blanks", "fill_blanks", "fill_blanks", "quiz_verdadero_falso", "fill_blanks", "fill_blanks", "quiz_multiple_opcion"] as const;
const tiposA3 = ["quiz_multiple_opcion", "reflexion_escrita", "quiz_verdadero_falso", "quiz_multiple_opcion", "autoevaluacion", "quiz_multiple_opcion", "reflexion_escrita", "autoevaluacion"] as const;

// ── CONTENIDOS A1 ─────────────────────────────────────────────────────────────

const contenidosA1 = [
  { // P01 — lectura: Rutinas pasadas / Past Simple
    titulo: "What Did You Do Yesterday?",
    texto: `In English, we use the Past Simple tense (pasado simple) to talk about completed (completadas) actions in the past. Most verbs are regular (regulares) — we just add -ed. But many common verbs are irregular (irregulares) — they have a special past form.\n\nRegular verbs:\n• walk → walked (caminé/caminaste)\n• watch → watched (vi/viste)\n• clean → cleaned (limpié/limpiaste)\n• play → played (jugué/jugaste)\n• study → studied (estudié — the y changes to i)\n\nIrregular verbs (you need to memorize these — ¡hay que memorizarlos!):\n• go → went (fui/fue)\n• eat → ate (comí/comió)\n• see → saw (vi/vio)\n• have → had (tuve/tuvo)\n• make → made (hice/hizo)\n• buy → bought (compré/compró)\n• come → came (vine/vino)\n• sleep → slept (dormí/durmió)\n\nTime expressions (expresiones de tiempo) with Past Simple:\n• yesterday (ayer) — Yesterday I went to the market.\n• last week (la semana pasada) — Last week she studied a lot.\n• last night (anoche) — He ate pizza last night.\n• two days ago (hace dos días) — We saw a great movie two days ago.\n• in 2020 — They came back in 2020.\n\nNegative form: subject + didn't + base verb\n• I didn't go to school yesterday. (didn't = did not)\n• She didn't eat breakfast this morning.\n\nQuestion form: Did + subject + base verb?\n• Did you go to the park? — Yes, I did. / No, I didn't.\n• What did you eat for dinner last night?`,
    preguntas: [
      { pregunta: "What is the past simple form of 'go'?", respuesta_guia: "The past simple of 'go' is 'went'. It is an irregular verb." },
      { pregunta: "How do we form the negative in past simple?", respuesta_guia: "We use: subject + didn't + base verb. Example: She didn't eat breakfast." },
      { pregunta: "Which time expressions are used with past simple?", respuesta_guia: "Yesterday, last week, last night, two days ago, in [year]." },
      { pregunta: "What is the rule for regular verbs in past simple?", respuesta_guia: "Add -ed to the base verb. For verbs ending in y (like study), change y to i and add -ed: studied." },
    ],
  },
  { // P02 — video_con_preguntas: Presente perfecto introductorio
    url: "https://example.com/video-pendiente-cen",
    duracion_segundos: 380,
    preguntas: [
      { timestamp_segundos: 70, pregunta: "What is the difference between 'I ate pizza' and 'I have eaten pizza'? Explain in your own words.", respuesta_guia: "'I ate pizza' refers to a specific moment in the past. 'I have eaten pizza' refers to a life experience at some unspecified time." },
      { timestamp_segundos: 200, pregunta: "What are the auxiliary verbs used in present perfect? Give one example sentence.", respuesta_guia: "Have (for I/you/we/they) and has (for he/she/it). Example: She has visited Oaxaca. I have read that book." },
      { timestamp_segundos: 330, pregunta: "Have you ever eaten something from another country? Write one sentence using present perfect.", respuesta_guia: "Example: 'I have eaten sushi' or 'I have never tried Thai food.'" },
    ],
  },
  { // P03 — glosario_interactivo: Preposiciones de lugar
    terminos: [
      { termino: "next to", definicion: "Immediately beside something or someone (al lado de).", ejemplo: "The pharmacy is next to the bakery.", etiquetas: ["IN-III", "P03", "prepositions"] },
      { termino: "in front of", definicion: "Facing something, on the opposite side (enfrente de).", ejemplo: "There is a fountain in front of the school.", etiquetas: ["IN-III", "P03", "prepositions"] },
      { termino: "between", definicion: "In the space that separates two things (entre — dos cosas).", ejemplo: "The bank is between the hotel and the restaurant.", etiquetas: ["IN-III", "P03", "prepositions"] },
      { termino: "behind", definicion: "At the back of something (detrás de).", ejemplo: "The parking lot is behind the shopping center.", etiquetas: ["IN-III", "P03", "prepositions"] },
      { termino: "there is", definicion: "Used to say that something exists or can be found in a place (singular).", ejemplo: "There is a library on the second floor.", etiquetas: ["IN-III", "P03", "there is/are"] },
      { termino: "there are", definicion: "Used to say that multiple things exist or can be found in a place (plural).", ejemplo: "There are three parks in this neighborhood.", etiquetas: ["IN-III", "P03", "there is/are"] },
      { termino: "can (posibilidad)", definicion: "'Can' is also used to express possibility — something that is possible to find or do in a place.", ejemplo: "You can find fresh fruit at the market next to the church.", etiquetas: ["IN-III", "P03", "can", "possibility"] },
      { termino: "opposite", definicion: "On the other side of a street or space (frente a, en el lado contrario).", ejemplo: "The school is opposite the park.", etiquetas: ["IN-III", "P03", "prepositions"] },
      { termino: "above / below", definicion: "Higher than (above) or lower than (below) something (encima de / debajo de).", ejemplo: "The apartment is above the store. The basement is below the lobby.", etiquetas: ["IN-III", "P03", "prepositions"] },
      { termino: "on the corner of", definicion: "Located at the intersection of two streets (en la esquina de).", ejemplo: "There is a pharmacy on the corner of Juárez and Hidalgo.", etiquetas: ["IN-III", "P03", "prepositions", "location"] },
    ],
    actividad_final: "Elige 5 preposiciones del glosario. Escribe una oración en inglés para cada una describiendo un lugar real de tu comunidad. Ejemplo: 'The market is next to the church on Morelos street.'",
  },
  { // P04 — lectura: Comparativos/superlativos y hábitos
    titulo: "Habits, Comparisons and Frequency in English",
    texto: `At A2 level, we combine (combinamos) comparatives, frequency adverbs (adverbios de frecuencia), and the expression "like + verb-ing" to talk about habits and preferences.\n\nComparatives and superlatives (recordatorio):\n• One syllable: big → bigger → the biggest\n• Two+ syllables: interesting → more interesting → the most interesting\n• Irregular: good → better → the best / bad → worse → the worst\n\nExample sentences:\n• Oaxaca is more colorful than Monterrey, but Mexico City is the most visited city in the country.\n• Walking is healthier than driving, and cycling is the healthiest option.\n\nLike + verb-ing — expressing what we enjoy:\n• I like reading (me gusta leer) historical novels.\n• She doesn't like getting up (no le gusta levantarse) early.\n• Do you like cooking (te gusta cocinar)? — Yes, I love it!\n\nFrequency adverbs — how often we do things:\n• always (siempre) — 100%\n• usually/normally (normalmente) — 80%\n• often/frequently (frecuentemente) — 70%\n• sometimes (a veces) — 50%\n• rarely/seldom (rara vez) — 20%\n• never (nunca) — 0%\n\nPosition: frequency adverbs go BEFORE the main verb but AFTER 'be':\n• She always drinks tea in the morning. (before main verb)\n• He is usually late for class. (after 'be')\n\nCombining structures:\n• I usually like cooking at home because it is cheaper than eating out.\n• My brother never likes doing exercise, but he is always the fastest runner in his group — it's a paradox!`,
    preguntas: [
      { pregunta: "What is the superlative of 'good'?", respuesta_guia: "The superlative of 'good' is 'the best'. It is irregular." },
      { pregunta: "What structure do we use to express things we enjoy in English?", respuesta_guia: "Like + verb-ing. Example: I like swimming. She likes reading." },
      { pregunta: "Where do frequency adverbs go in a sentence?", respuesta_guia: "Before the main verb, but after the verb 'be'. Example: She always studies. He is usually tired." },
      { pregunta: "What is the difference between 'often' and 'rarely'?", respuesta_guia: "'Often' means about 70% of the time (frecuentemente). 'Rarely' means about 20% of the time (rara vez)." },
    ],
  },
  { // P05 — lectura: Obligación y prohibición
    titulo: "Rules: Must, Mustn't, Have To and Don't Have To",
    texto: `In English, we use different modal verbs (verbos modales) to talk about rules, obligations (obligaciones), and prohibitions (prohibiciones).\n\nMUST — strong obligation or rule (usually from the speaker's opinion or authority):\n• You must study for the exam. (Es necesario — strong personal or institutional obligation)\n• Students must wear their uniform. (School rule)\n• I must call my grandmother today. (Personal obligation I feel strongly)\n\nMUST NOT / MUSTN'T — prohibition — something is NOT allowed:\n• You mustn't use your phone during the exam. (Está prohibido — not permitted)\n• We mustn't throw trash in the river. (Prohibition — ecological rule)\n• You mustn't run inside the building. (Safety rule)\n\nHAVE TO — obligation that comes from an external rule or necessity:\n• I have to wear glasses. (Medical necessity — external reason)\n• She has to finish her project by Friday. (Deadline — external)\n• Do you have to work on Saturdays? (Question about external obligation)\n\nDON'T HAVE TO / DOESN'T HAVE TO — NO obligation (it is optional):\n• You don't have to come if you don't want to. (Not necessary — es opcional)\n• He doesn't have to wear a tie on Fridays. (No rule about it — no es obligatorio)\n\nKey difference (diferencia clave):\n• Mustn't = forbidden — you are NOT ALLOWED to do it ≠\n• Don't have to = not necessary — you CAN do it if you WANT TO ✓\n• "You mustn't eat in the library" ≠ "You don't have to eat in the library"\n\nContext: school and home rules (reglas escolares y domésticas) are excellent situations to practice these structures.`,
    preguntas: [
      { pregunta: "What is the difference between 'must' and 'have to'?", respuesta_guia: "'Must' expresses personal/internal obligation or a strong rule. 'Have to' expresses external obligation or necessity." },
      { pregunta: "What does 'mustn't' mean? Give an example.", respuesta_guia: "'Mustn't' means it is forbidden or not allowed. Example: You mustn't use your phone during the exam." },
      { pregunta: "What does 'don't have to' mean? How is it different from 'mustn't'?", respuesta_guia: "'Don't have to' means it is not necessary — it is optional. 'Mustn't' means it is prohibited. Example: You don't have to wear a tie (optional). You mustn't run (forbidden)." },
      { pregunta: "How does 'have to' change in third person singular?", respuesta_guia: "It changes to 'has to'. Example: She has to finish her homework. He has to wake up early." },
    ],
  },
  { // P06 — video_con_preguntas: Instrucciones / Imperativos
    url: "https://example.com/video-pendiente-cen",
    duracion_segundos: 360,
    preguntas: [
      { timestamp_segundos: 75, pregunta: "What is the imperative form? How is it formed in English? Give two examples from the video.", respuesta_guia: "The imperative uses the base verb without a subject. Examples: Open your book. Don't talk during the exam." },
      { timestamp_segundos: 210, pregunta: "What are the sequential connectors (conectores secuenciales) mentioned in the video? List at least four.", respuesta_guia: "First, then, after that, next, finally. These connectors organize a sequence of steps." },
      { timestamp_segundos: 310, pregunta: "Think of something you know how to make (a recipe, a craft, a game). Write the first three steps using imperatives and connectors.", respuesta_guia: "Example: 'First, wash your hands. Then, chop the vegetables. After that, heat the pan.' (Student's own answer will vary.)" },
    ],
  },
  { // P07 — lectura: Narración en pasado / Verbos irregulares
    titulo: "Telling a Story in the Past",
    texto: `Good storytelling in English uses irregular past verbs and narrative connectors to make the events flow naturally.\n\nThe most common irregular past verbs at A2 level (you should know these!):\n• go → went (ir → fue/fui)\n• eat → ate (comer → comió/comí)\n• see → saw (ver → vio/vi)\n• make → made (hacer → hizo/hice)\n• tell → told (contar/decir → contó/conté)\n• come → came (venir → vino/vine)\n• take → took (tomar/llevar → tomó/tomé)\n• give → gave (dar → dio/di)\n• write → wrote (escribir → escribió/escribí)\n• buy → bought (comprar → compró/compré)\n• think → thought (pensar → pensó/pensé)\n• find → found (encontrar → encontró/encontré)\n• say → said (decir → dijo/dije)\n• know → knew (saber/conocer → supo/supe)\n\nNarrative connectors (conectores narrativos) to sequence a story:\n• First / First of all — for the beginning (primero)\n• Then / After that — for the next event (luego / después)\n• Later — after some time (más tarde)\n• Suddenly — for an unexpected event (de repente)\n• In the end / Finally — for the conclusion (al final / finalmente)\n\nExample story:\nLast Saturday, I went (fui) to visit my grandmother. First, we ate (comimos) tamales and drank (bebimos) atole. Then she told (contó) me old stories about our town. Suddenly, we saw (vimos) our neighbors arriving (llegar) with a guitar. In the end, we all made (hicimos) music together until midnight. It was (fue) a wonderful evening.`,
    preguntas: [
      { pregunta: "What is the past form of 'see'? Use it in a sentence.", respuesta_guia: "The past form of 'see' is 'saw'. Example: We saw a beautiful sunset yesterday." },
      { pregunta: "What connector would you use to introduce an unexpected event in a story?", respuesta_guia: "'Suddenly' is used for unexpected events. Example: Suddenly, the lights went out." },
      { pregunta: "What is the past form of 'tell'? What does it mean?", respuesta_guia: "The past form of 'tell' is 'told'. It means 'contó' or 'dije/dijo'." },
      { pregunta: "Identify two narrative connectors from the example story and explain their function.", respuesta_guia: "'Then' connects events in sequence (luego). 'Suddenly' introduces an unexpected event (de repente). 'In the end' signals the conclusion (al final)." },
    ],
  },
  { // P08 — infografia: Consolidación A2
    titulo: "English A2 — Key Structures at a Glance",
    descripcion: "Infografía de consolidación del nivel A2: resumen visual de las estructuras gramaticales clave de Inglés III, con ejemplos bilingües y conectores para usar en producción oral y escrita.",
    url_imagen: "/placeholder/infografia.svg",
    puntos_clave: [
      "Past Simple: regular (-ed) and irregular verbs. Time markers: yesterday, last week, ago. Negative: didn't + base verb.",
      "Present Perfect (introductory): have/has + past participle. Used for experiences. Key words: ever, never, already, yet.",
      "Modals: must/mustn't (strong obligation/prohibition). Have to/don't have to (external obligation/no obligation).",
      "Comparatives and superlatives: -er/-est (short) vs. more/most (long). Irregular: good→better→best, bad→worse→worst.",
      "Prepositions of place: next to, in front of, between, behind, opposite, on the corner of. Used with there is/are.",
      "Imperatives + connectors: base verb for instructions. First, then, after that, next, finally for sequences.",
      "Narrative connectors: then, after, later, suddenly, in the end — to tell stories in past tense.",
    ],
    fuente: "Material CEN Bachillerato — IN-III (A2)",
  },
];

// ── CONTENIDOS A2 ─────────────────────────────────────────────────────────────

const contenidosA2 = [
  { // P01 — fill_blanks: Past Simple (verbos regulares e irregulares)
    instrucciones: "Complete the text with the correct past simple form of the verbs in parentheses. Some are regular, some are irregular.",
    texto_con_huecos: "Last Sunday, my family ___ (go) to the countryside. We ___ (wake up) early and ___ (eat) a big breakfast. My mother ___ (make) tamales the night before. We ___ (travel) by bus for two hours. When we arrived, the children ___ (play) by the river while the adults ___ (talk) and ___ (rest). In the evening, we ___ (buy) fresh fruit from a local farmer. It ___ (be) a perfect day.",
    huecos: [
      { respuesta_correcta: "went", alternativas_aceptadas: [], pista: "Irregular: go → ?" },
      { respuesta_correcta: "woke up", alternativas_aceptadas: ["woke"], pista: "Irregular: wake up → ?" },
      { respuesta_correcta: "ate", alternativas_aceptadas: [], pista: "Irregular: eat → ?" },
      { respuesta_correcta: "made", alternativas_aceptadas: [], pista: "Irregular: make → ?" },
      { respuesta_correcta: "travelled", alternativas_aceptadas: ["traveled"], pista: "Regular: travel + ed" },
      { respuesta_correcta: "played", alternativas_aceptadas: [], pista: "Regular: play + ed" },
      { respuesta_correcta: "talked", alternativas_aceptadas: ["chatted"], pista: "Regular: talk + ed" },
      { respuesta_correcta: "rested", alternativas_aceptadas: [], pista: "Regular: rest + ed" },
      { respuesta_correcta: "bought", alternativas_aceptadas: [], pista: "Irregular: buy → ?" },
      { respuesta_correcta: "was", alternativas_aceptadas: [], pista: "Irregular: be → was/were" },
    ],
  },
  { // P02 — fill_blanks: Presente perfecto introductorio
    instrucciones: "Complete the sentences using the present perfect (have/has + past participle). The base verb is given in parentheses.",
    texto_con_huecos: "Maria ___ never ___ (visit) another country, but she ___ (travel) to many states in Mexico. Her brother ___ (live) in Canada for two years. They ___ (not see) each other since last Christmas. Maria ___ (read) many books about English-speaking cultures. She ___ (study) English for three years now and she ___ (make) great progress.",
    huecos: [
      { respuesta_correcta: "has", alternativas_aceptadas: [], pista: "Use 'has' for she/he/it" },
      { respuesta_correcta: "visited", alternativas_aceptadas: [], pista: "Past participle of 'visit'" },
      { respuesta_correcta: "has travelled", alternativas_aceptadas: ["has traveled"], pista: "has + past participle of travel" },
      { respuesta_correcta: "has lived", alternativas_aceptadas: [], pista: "has + past participle of live" },
      { respuesta_correcta: "haven't seen", alternativas_aceptadas: ["have not seen"], pista: "Negative: haven't + past participle of see" },
      { respuesta_correcta: "has read", alternativas_aceptadas: [], pista: "has + past participle of read (irregular: read→read)" },
      { respuesta_correcta: "has studied", alternativas_aceptadas: [], pista: "has + past participle of study" },
      { respuesta_correcta: "has made", alternativas_aceptadas: [], pista: "has + past participle of make (irregular)" },
    ],
  },
  { // P03 — fill_blanks: Preposiciones de lugar
    instrucciones: "Complete the description of the town center using: next to, in front of, between, behind, there is, there are, can, on the corner of.",
    texto_con_huecos: "___ a large plaza in the center of town. The church is ___ the plaza, so you can see it as soon as you arrive. ___ the church and the city hall, ___ a small garden with benches. The market is ___ the church — you have to walk past it to reach the entrance. You ___ find handmade crafts and fresh food inside. ___ many food stalls ___ Hidalgo and Morelos streets. The bus stop is ___ the pharmacy.",
    huecos: [
      { respuesta_correcta: "There is", alternativas_aceptadas: ["There's"], pista: "Singular existence" },
      { respuesta_correcta: "in front of", alternativas_aceptadas: [], pista: "Facing something, on the opposite side" },
      { respuesta_correcta: "Between", alternativas_aceptadas: [], pista: "In the space separating two things" },
      { respuesta_correcta: "there is", alternativas_aceptadas: ["there's"], pista: "Singular — one garden" },
      { respuesta_correcta: "behind", alternativas_aceptadas: [], pista: "At the back of something" },
      { respuesta_correcta: "can", alternativas_aceptadas: [], pista: "Possibility: you ___ find..." },
      { respuesta_correcta: "There are", alternativas_aceptadas: [], pista: "Plural existence — many stalls" },
      { respuesta_correcta: "on the corner of", alternativas_aceptadas: ["at the corner of"], pista: "At the intersection of two streets" },
      { respuesta_correcta: "next to", alternativas_aceptadas: ["beside"], pista: "Immediately beside something" },
    ],
  },
  { // P04 — fill_blanks: Comparativos, superlativos y hábitos
    instrucciones: "Complete the sentences with the correct comparative or superlative form, the correct frequency adverb, or 'like + verb-ing'. Choose from: more interesting, the healthiest, better, usually, always, like cooking, like running.",
    texto_con_huecos: "My sister ___ at home — she says it is cheaper and more fun than eating out. She ___ wakes up at 6:00 am, even on weekends. According to nutritionists, walking is ___ exercise you can do every day. My father thinks history is ___ than mathematics, but I disagree. I ___ prefer science subjects. My brother doesn't ___, but he goes to the gym three times a week. He says the gym is ___ than jogging outside.",
    huecos: [
      { respuesta_correcta: "likes cooking", alternativas_aceptadas: ["like cooking"], pista: "like + verb-ing (she → likes)" },
      { respuesta_correcta: "always", alternativas_aceptadas: [], pista: "100% of the time" },
      { respuesta_correcta: "the healthiest", alternativas_aceptadas: [], pista: "Superlative of healthy" },
      { respuesta_correcta: "more interesting", alternativas_aceptadas: [], pista: "Comparative of interesting (2 syllables+)" },
      { respuesta_correcta: "usually", alternativas_aceptadas: ["normally"], pista: "About 80% of the time" },
      { respuesta_correcta: "like running", alternativas_aceptadas: ["likes running"], pista: "like + verb-ing" },
      { respuesta_correcta: "better", alternativas_aceptadas: [], pista: "Irregular comparative of good" },
    ],
  },
  { // P05 — quiz_verdadero_falso: Obligación y prohibición
    afirmaciones: [
      { afirmacion: "'Must' and 'have to' always mean exactly the same thing and can be interchanged in every context.", es_verdadero: false, retroalimentacion: "False. 'Must' often expresses a personal or internal obligation, while 'have to' refers to external rules or necessities. The meaning can overlap but is not always identical." },
      { afirmacion: "'You mustn't speak during the exam' means it is forbidden to speak during the exam.", es_verdadero: true, retroalimentacion: "True! 'Mustn't' expresses prohibition — the action is not allowed." },
      { afirmacion: "'You don't have to wear a uniform on Saturdays' means it is forbidden to wear a uniform on Saturdays.", es_verdadero: false, retroalimentacion: "False. 'Don't have to' means it is not necessary — optional. You CAN wear a uniform if you want to; it is just not required." },
      { afirmacion: "'She has to finish the report by Monday' tells us there is an external deadline.", es_verdadero: true, retroalimentacion: "True! 'Has to' (third person singular of have to) indicates an external obligation or necessity, like a deadline." },
      { afirmacion: "The negative of 'must' for prohibition is 'mustn't', which means 'it is not allowed'.", es_verdadero: true, retroalimentacion: "True! 'Mustn't' = must not = not permitted/forbidden." },
      { afirmacion: "'I must exercise more' is a rule imposed by someone else, like a teacher or doctor.", es_verdadero: false, retroalimentacion: "False. When 'must' expresses personal obligation, it reflects the speaker's own sense of necessity or moral duty — not necessarily imposed by another person." },
      { afirmacion: "'Do you have to work on Sundays?' is the correct question form of 'have to'.", es_verdadero: true, retroalimentacion: "True! Questions with 'have to' use: Do/Does + subject + have to + base verb." },
    ],
  },
  { // P06 — fill_blanks: Instrucciones / Imperativos y conectores secuenciales
    instrucciones: "Complete the recipe instructions using the correct imperative form of the verbs and sequence connectors. Verbs: add, stir, heat, boil, serve, remove. Connectors: First, Then, After that, Next, Finally.",
    texto_con_huecos: "___, ___ a pot of water on the stove until it boils. ___, ___ a pinch of salt and the pasta. ___ the pasta for ten minutes, stirring occasionally. ___, ___ the pasta from the stove and drain it. ___, ___ your favorite sauce and mix well. ___, ___ hot with grated cheese on top.",
    huecos: [
      { respuesta_correcta: "First", alternativas_aceptadas: ["First of all"], pista: "Connector: beginning of a sequence" },
      { respuesta_correcta: "heat", alternativas_aceptadas: [], pista: "Imperative: heat the pot" },
      { respuesta_correcta: "Then", alternativas_aceptadas: ["Next"], pista: "Connector: next step" },
      { respuesta_correcta: "add", alternativas_aceptadas: [], pista: "Imperative: add salt and pasta" },
      { respuesta_correcta: "Boil", alternativas_aceptadas: ["Cook"], pista: "Imperative: boil/cook for 10 minutes" },
      { respuesta_correcta: "After that", alternativas_aceptadas: ["Then", "Next"], pista: "Connector: next action after boiling" },
      { respuesta_correcta: "remove", alternativas_aceptadas: ["take"], pista: "Imperative: remove/take from stove" },
      { respuesta_correcta: "Next", alternativas_aceptadas: ["Then", "After that"], pista: "Connector: following step" },
      { respuesta_correcta: "add", alternativas_aceptadas: ["pour"], pista: "Imperative: add the sauce" },
      { respuesta_correcta: "Finally", alternativas_aceptadas: ["Lastly"], pista: "Connector: last step" },
      { respuesta_correcta: "serve", alternativas_aceptadas: [], pista: "Imperative: serve it" },
    ],
  },
  { // P07 — fill_blanks: Narración en pasado — conectores y verbos irregulares
    instrucciones: "Complete the story with the correct past simple form of the verbs in parentheses. Then choose the correct narrative connector from the options in brackets.",
    texto_con_huecos: "Last Friday, Carlos ___ (wake up) very early. [First / Suddenly], he ___ (make) breakfast for his whole family. [Then / In the end], he ___ (go) to the bus station and ___ (buy) a ticket to Puebla. The journey ___ (take) three hours. [Later / First], he ___ (find) his old friend Miguel near the cathedral. [Suddenly / After], it ___ (start) to rain heavily, so they ___ (go) into a café. They ___ (talk) and ___ (eat) for two hours. [In the end / Suddenly], they ___ (say) goodbye and Carlos ___ (take) the last bus home.",
    huecos: [
      { respuesta_correcta: "woke up", alternativas_aceptadas: ["woke"], pista: "Irregular: wake up → ?" },
      { respuesta_correcta: "First", alternativas_aceptadas: [], pista: "Connector: beginning of the story" },
      { respuesta_correcta: "made", alternativas_aceptadas: [], pista: "Irregular: make → ?" },
      { respuesta_correcta: "Then", alternativas_aceptadas: ["After that"], pista: "Connector: next event" },
      { respuesta_correcta: "went", alternativas_aceptadas: [], pista: "Irregular: go → ?" },
      { respuesta_correcta: "bought", alternativas_aceptadas: [], pista: "Irregular: buy → ?" },
      { respuesta_correcta: "took", alternativas_aceptadas: [], pista: "Irregular: take → ?" },
      { respuesta_correcta: "Later", alternativas_aceptadas: [], pista: "Connector: after some time had passed" },
      { respuesta_correcta: "found", alternativas_aceptadas: [], pista: "Irregular: find → ?" },
      { respuesta_correcta: "Suddenly", alternativas_aceptadas: [], pista: "Connector: unexpected event" },
      { respuesta_correcta: "started", alternativas_aceptadas: [], pista: "Regular: start + ed" },
      { respuesta_correcta: "went", alternativas_aceptadas: [], pista: "Irregular: go → ?" },
      { respuesta_correcta: "talked", alternativas_aceptadas: ["chatted"], pista: "Regular: talk + ed" },
      { respuesta_correcta: "ate", alternativas_aceptadas: [], pista: "Irregular: eat → ?" },
      { respuesta_correcta: "In the end", alternativas_aceptadas: ["Finally"], pista: "Connector: conclusion of the story" },
      { respuesta_correcta: "said", alternativas_aceptadas: [], pista: "Irregular: say → ?" },
      { respuesta_correcta: "took", alternativas_aceptadas: [], pista: "Irregular: take → ?" },
    ],
  },
  { // P08 — quiz_multiple_opcion: Repaso integral A2
    preguntas: [
      { pregunta: "Choose the correct sentence in Past Simple:", opciones: ["She goed to the market yesterday.", "She went to the market yesterday.", "She go to the market yesterday.", "She has go to the market yesterday."], respuesta_correcta: 1, retroalimentacion: "'Go' is irregular. Its past simple form is 'went'. We don't add -ed or -d to 'go'." },
      { pregunta: "'I ___ never ___ sushi before' — choose the correct present perfect form:", opciones: ["did / eat", "have / eaten", "has / eat", "was / eating"], respuesta_correcta: 1, retroalimentacion: "Present perfect: have/has + past participle. 'I have never eaten' — personal experience." },
      { pregunta: "Which sentence expresses PROHIBITION correctly?", opciones: ["You don't have to park here.", "You mustn't park here.", "You haven't parked here.", "You didn't park here."], respuesta_correcta: 1, retroalimentacion: "'Mustn't' expresses prohibition — it is not allowed. 'Don't have to' means it is not necessary, not that it is forbidden." },
      { pregunta: "'The library is ___ the school and the post office' — which preposition is correct?", opciones: ["behind", "in front of", "between", "next to"], respuesta_correcta: 2, retroalimentacion: "'Between' indicates a position in the middle of exactly two reference points (the school and the post office)." },
      { pregunta: "Choose the sentence with the correct use of a sequential connector for instructions:", opciones: ["Suddenly, add the salt and stir.", "First, wash the vegetables. Then, chop them.", "In the end, open the oven.", "Later, turn on the stove first."], respuesta_correcta: 1, retroalimentacion: "'First... Then...' correctly sequences two steps. 'Suddenly' is for unexpected events, not instructions." },
      { pregunta: "Which sentence uses the superlative correctly?", opciones: ["She is the most tallest student.", "He is the goodest player.", "This is the most beautiful city I have visited.", "They are the most fast runners."], respuesta_correcta: 2, retroalimentacion: "'Beautiful' (3 syllables) uses 'the most beautiful'. 'Most tallest', 'goodest', and 'most fast' are all incorrect forms." },
      { pregunta: "'She ___ three countries so far' — choose the correct form:", opciones: ["visited", "visits", "has visited", "was visiting"], respuesta_correcta: 2, retroalimentacion: "'So far' signals present perfect. She has visited three countries so far." },
    ],
  },
];

// ── CONTENIDOS A3 ─────────────────────────────────────────────────────────────

const contenidosA3 = [
  { // P01 — quiz_multiple_opcion: Past Simple
    preguntas: [
      { pregunta: "What is the past simple of 'eat'?", opciones: ["eated", "ate", "eaten", "eats"], respuesta_correcta: 1, retroalimentacion: "'Eat' is irregular. Its past simple is 'ate'. 'Eaten' is the past participle, used in present perfect." },
      { pregunta: "Choose the correct negative sentence in past simple:", opciones: ["She didn't went to school.", "She didn't go to school.", "She not went to school.", "She wasn't go to school."], respuesta_correcta: 1, retroalimentacion: "Past simple negative: subject + didn't + BASE verb. 'Go' stays as 'go', not 'went'." },
      { pregunta: "Which time expression is MOST typical with past simple?", opciones: ["already", "yet", "last week", "recently"], respuesta_correcta: 2, retroalimentacion: "'Last week' is a specific past time marker, typical of past simple. 'Already', 'yet', and 'recently' are more commonly used with present perfect." },
      { pregunta: "What is the past simple of 'buy'?", opciones: ["buyed", "buied", "bought", "buought"], respuesta_correcta: 2, retroalimentacion: "'Buy' is irregular. The past simple is 'bought'. There is no version with -ed or -ied." },
      { pregunta: "Choose the correct question in past simple:", opciones: ["Did she went to the party?", "Did she go to the party?", "Was she go to the party?", "Has she went to the party?"], respuesta_correcta: 1, retroalimentacion: "Past simple question: Did + subject + BASE verb? 'Go' does not change to 'went' after 'did'." },
      { pregunta: "'They ___ a great time at the festival last summer.'", opciones: ["have", "had", "have had", "were having"], respuesta_correcta: 1, retroalimentacion: "'Had' is the past simple of 'have'. 'Last summer' indicates a specific past time, so we use past simple." },
    ],
  },
  { // P02 — reflexion_escrita: Presente perfecto / experiencias
    prompt: "Write about THREE experiences you have had in your life (or experiences you have never had but would like to have). Use present perfect (have/has + past participle) for each one. For the experiences you HAVE had, add ONE sentence in past simple explaining when or where it happened.",
    pistas: [
      "Start with: 'I have [verb-ed/irregular]...' or 'I have never [verb-ed/irregular]...'",
      "For experiences you have had, add detail: 'I visited Oaxaca two years ago.' or 'I ate sushi for the first time last year.'",
      "Use 'ever' in questions (have you ever...?) and 'never' for things you haven't done.",
      "Contrast present perfect and past simple: 'I have eaten tacos al pastor. The last time I ate them was at a market in Mexico City.'",
    ],
    criterios_evaluacion: [
      "Uses present perfect correctly (have/has + past participle) for all three experiences",
      "At least one sentence in past simple with a specific time or place",
      "Clear contrast between present perfect and past simple where applicable",
      "Text is understandable and at least 80 words",
    ],
    longitud_minima: 80,
  },
  { // P03 — quiz_verdadero_falso: Preposiciones de lugar y there is/are
    afirmaciones: [
      { afirmacion: "'Between' is used to describe the position of something surrounded by more than two objects.", es_verdadero: false, retroalimentacion: "False. 'Between' is used with exactly two reference points. For more than two, we use 'among'. Example: The statue is between the fountain and the gate." },
      { afirmacion: "'There are a pharmacy on the corner' is a grammatically correct sentence.", es_verdadero: false, retroalimentacion: "False. 'Pharmacy' is singular, so the correct form is 'There IS a pharmacy on the corner.' 'There are' is used with plural nouns." },
      { afirmacion: "'Next to' means immediately beside something, at the same level.", es_verdadero: true, retroalimentacion: "True! 'Next to' means al lado de — right beside something. Example: The bookstore is next to the café." },
      { afirmacion: "'In front of the school there is a large garden' — this sentence is grammatically correct.", es_verdadero: true, retroalimentacion: "True! The preposition 'in front of' is used correctly, and 'there is' matches the singular noun 'garden'." },
      { afirmacion: "'Behind' and 'in front of' describe the same position in relation to a reference point.", es_verdadero: false, retroalimentacion: "False. 'Behind' means detrás de (at the back), while 'in front of' means enfrente de (facing). They are opposites." },
      { afirmacion: "'Can' can be used to describe what is possible to find or do in a specific place.", es_verdadero: true, retroalimentacion: "True! 'Can' expresses possibility. Example: 'You can find fresh fish at the coastal market.'" },
      { afirmacion: "'There is many students in the classroom' is correct English.", es_verdadero: false, retroalimentacion: "False. 'Students' is plural, so we use 'there ARE'. Correct: 'There are many students in the classroom.'" },
    ],
  },
  { // P04 — quiz_multiple_opcion: Comparativos, superlativos y hábitos
    preguntas: [
      { pregunta: "Choose the correct comparative form:", opciones: ["She is more tall than her sister.", "She is taller than her sister.", "She is tallest than her sister.", "She is the most tall than her sister."], respuesta_correcta: 1, retroalimentacion: "'Tall' is a one-syllable adjective, so we add -er: 'taller than'. 'More tall' is incorrect for single-syllable adjectives." },
      { pregunta: "Which sentence uses 'like + verb-ing' correctly?", opciones: ["He likes to swimming in the morning.", "He like swimming in the morning.", "He likes swimming in the morning.", "He likes swim in the morning."], respuesta_correcta: 2, retroalimentacion: "'Like' (with third person -s) + verb-ing: 'He likes swimming'. Not 'to swimming' or 'swim' after like." },
      { pregunta: "Where does the frequency adverb go in: 'She ___ is ___ late for class'?", opciones: ["always / ---", "--- / always", "never / never", "--- / never"], respuesta_correcta: 1, retroalimentacion: "Frequency adverbs go AFTER the verb 'be'. Correct: 'She is always late for class.'" },
      { pregunta: "Choose the correct superlative:", opciones: ["This is the most good pizza I've eaten.", "This is the better pizza I've eaten.", "This is the best pizza I've eaten.", "This is the goodest pizza I've eaten."], respuesta_correcta: 2, retroalimentacion: "'Good' is irregular. Comparative: better. Superlative: the best." },
      { pregunta: "Complete: 'Cycling is ___ walking for long distances.'", opciones: ["more fast than", "faster than", "fastest than", "the fastest"], respuesta_correcta: 1, retroalimentacion: "'Fast' is one syllable: faster than. 'More fast' is incorrect for one-syllable adjectives." },
    ],
  },
  { // P05 — autoevaluacion: Obligación y prohibición
    criterios: [
      {
        nombre: "Uso de must y mustn't",
        descripcion: "Puedo usar must para expresar obligación fuerte y mustn't para prohibición en contextos escolares y domésticos.",
        escala: ["1 - No entiendo la diferencia entre must y have to", "2 - Entiendo el concepto pero cometo errores al usarlo", "3 - Uso must y mustn't correctamente en la mayoría de los casos", "4 - Uso must y mustn't con fluidez y puedo explicar la diferencia a alguien más"],
        prompt_reflexion_final: "Give one example of a rule at your school using 'must' and one using 'mustn't'. Write them in English.",
      },
      {
        nombre: "Uso de have to y don't have to",
        descripcion: "Puedo distinguir entre una obligación externa (have to) y la ausencia de obligación (don't have to).",
        escala: ["1 - Confundo don't have to con mustn't", "2 - Entiendo la diferencia pero me cuesta aplicarla", "3 - Distingo correctamente entre don't have to y mustn't en la mayoría de los casos", "4 - Aplico ambas estructuras correctamente y con confianza en situaciones reales"],
        prompt_reflexion_final: "Write two sentences: one with 'don't have to' and one with 'mustn't'. Make sure they mean different things.",
      },
      {
        nombre: "Comprensión de contexto de reglas",
        descripcion: "Puedo identificar el tipo de regla (obligación, prohibición, ausencia de obligación) en textos y situaciones reales.",
        escala: ["1 - Me cuesta identificar el tipo de regla en un texto", "2 - Identifico el tipo de regla en oraciones simples", "3 - Identifico y produzco reglas correctamente en diferentes contextos", "4 - Analizo reglas complejas y puedo comparar sistemas de reglas en distintos contextos"],
        prompt_reflexion_final: "Think of THREE rules from your home or school. Write them in English using must, mustn't, have to, or don't have to.",
      },
      {
        nombre: "Producción escrita con modales",
        descripcion: "Puedo escribir oraciones correctas usando must, mustn't, have to y don't have to sin errores gramaticales frecuentes.",
        escala: ["1 - Cometo muchos errores al escribir con modales", "2 - Escribo oraciones básicas con algunos errores", "3 - Escribo la mayoría de las oraciones correctamente", "4 - Escribo oraciones variadas y complejas con modales sin errores"],
        prompt_reflexion_final: "What was the most surprising or interesting rule you learned to express in English? Why?",
      },
    ],
  },
  { // P06 — quiz_multiple_opcion: Imperativos y conectores secuenciales
    preguntas: [
      { pregunta: "Which is a correct imperative sentence?", opciones: ["You open the window, please.", "Open the window, please.", "Opening the window, please.", "You must open the window, please."], respuesta_correcta: 1, retroalimentacion: "Imperatives use the base verb without a subject: 'Open the window.' Adding 'please' makes it more polite." },
      { pregunta: "Which connector introduces the LAST step in a sequence?", opciones: ["First", "Then", "After that", "Finally"], respuesta_correcta: 3, retroalimentacion: "'Finally' (or 'In the end') signals the last step in a sequence of instructions or events." },
      { pregunta: "Choose the correct negative imperative:", opciones: ["Don't to touch the screen.", "Not touch the screen.", "Don't touch the screen.", "You not touch the screen."], respuesta_correcta: 2, retroalimentacion: "Negative imperatives: Don't + base verb. 'Don't touch the screen' = está prohibido tocar la pantalla." },
      { pregunta: "Which sentence uses a connector INCORRECTLY for instructions?", opciones: ["First, wash your hands.", "Then, add the ingredients.", "Suddenly, stir the mixture for two minutes.", "Finally, let it cool before serving."], respuesta_correcta: 2, retroalimentacion: "'Suddenly' is used for unexpected events in stories, not for planned steps in instructions. Use 'After that' or 'Next' instead." },
      { pregunta: "'___ that, let the dough rest for 30 minutes.' Which connector fits best?", opciones: ["First", "Suddenly", "After", "In the end"], respuesta_correcta: 2, retroalimentacion: "'After that' (often shortened to 'after') connects sequential steps in instructions." },
    ],
  },
  { // P07 — reflexion_escrita: Narración en pasado
    prompt: "Write a short story (a real or invented one) about something that happened to you or someone you know. Use at least 6 irregular past verbs from the list studied in this unit (went, ate, saw, made, told, came, took, gave, found, bought, said, thought). Use at least 4 narrative connectors (first, then, after that, later, suddenly, in the end, finally) to organize the events.",
    pistas: [
      "Set the scene: 'Last [day/month/year], I went to...' or 'One afternoon, my friend and I decided to...'",
      "Use irregular past verbs: went, ate, saw, made, told, came, took, gave, found, bought, said, thought.",
      "Connect events with: first, then, after that, later, suddenly, in the end, finally.",
      "Add a surprising or emotional moment using 'suddenly' — it makes stories more interesting!",
      "End with a reflection: 'In the end, I felt... / I learned that... / It was the best/worst...'",
    ],
    criterios_evaluacion: [
      "Uses at least 6 irregular past verbs correctly",
      "Uses at least 4 narrative connectors in the appropriate positions",
      "The story has a clear beginning, middle, and end",
      "Text is at least 100 words and easy to follow",
    ],
    longitud_minima: 100,
  },
  { // P08 — autoevaluacion: Consolidación A2
    criterios: [
      {
        nombre: "Past Simple",
        descripcion: "Puedo hablar y escribir sobre eventos pasados usando verbos regulares e irregulares en pasado simple con sus marcadores de tiempo.",
        escala: ["1 - Solo conozco 1-3 verbos irregulares y cometo errores frecuentes", "2 - Conozco varios verbos irregulares y formo oraciones básicas", "3 - Uso el pasado simple correctamente en afirmativas, negativas y preguntas", "4 - Narro eventos pasados con fluidez, vocabulario variado y pocos errores"],
        prompt_reflexion_final: "Write 3 sentences about what you did last weekend using past simple. Include one negative and one question.",
      },
      {
        nombre: "Present Perfect (introductorio)",
        descripcion: "Entiendo la diferencia entre el presente perfecto y el pasado simple, y puedo usar el presente perfecto para hablar de experiencias de vida.",
        escala: ["1 - Confundo present perfect con past simple constantemente", "2 - Entiendo el concepto pero cometo errores al elegir entre los dos tiempos", "3 - Uso el presente perfecto correctamente para experiencias y lo contrasto con pasado simple", "4 - Uso present perfect con confianza incluyendo ever, never, already y yet"],
        prompt_reflexion_final: "Write one sentence using present perfect and one in past simple about the same topic. Explain the difference in Spanish.",
      },
      {
        nombre: "Modales y obligación",
        descripcion: "Puedo expresar obligación, prohibición y ausencia de obligación usando must, mustn't, have to y don't have to.",
        escala: ["1 - Confundo mustn't con don't have to y no uso must con confianza", "2 - Uso los modales en oraciones simples con algunos errores", "3 - Distingo y uso correctamente must, mustn't, have to y don't have to", "4 - Uso los cuatro modales con fluidez en contextos variados (escuela, hogar, sociedad)"],
        prompt_reflexion_final: "Write two rules for a new student in your school: one with must/mustn't and one with have to/don't have to.",
      },
      {
        nombre: "Descripción de lugares y preposiciones",
        descripcion: "Puedo describir la ubicación de lugares usando preposiciones (next to, in front of, between, behind, opposite) y there is/are.",
        escala: ["1 - Solo conozco 1-2 preposiciones de lugar y me confundo fácilmente", "2 - Uso las preposiciones principales con ayuda o con errores ocasionales", "3 - Describo ubicaciones con las preposiciones estudiadas correctamente", "4 - Describo lugares complejos con preposiciones variadas y there is/are sin errores"],
        prompt_reflexion_final: "Describe where three important places in your neighborhood are, using different prepositions for each.",
      },
      {
        nombre: "Producción de textos en inglés A2",
        descripcion: "Puedo escribir textos cortos en inglés A2: narraciones en pasado, instrucciones con imperativos y conectores, y reflexiones sobre experiencias.",
        escala: ["1 - Me cuesta escribir más de 2-3 oraciones en inglés sin errores graves", "2 - Escribo textos cortos con errores frecuentes pero comprensibles", "3 - Escribo textos organizados con pocos errores y vocabulario A2", "4 - Escribo textos variados, bien conectados y con vocabulario y gramática A2 sólidos"],
        prompt_reflexion_final: "What aspect of English A2 do you feel most confident about? What do you still need to practice? Write 3 sentences in English.",
      },
    ],
  },
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });

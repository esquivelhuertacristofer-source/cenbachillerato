/**
 * Refuerzo de actividades para IN-IV (Inglés IV — A2+ MCER "Should I stay or should I go?").
 * Agrega A4-A7 a cada una de las 8 progresiones (ya tienen A1-A3):
 *   A4 = quiz_verdadero_falso · A5 = glosario_interactivo · A6 = fill_blanks · A7 = autoevaluacion
 * 8 progresiones × 4 = 32 actividades nuevas. estado='borrador'.
 * Alineado al programa oficial de Inglés IV (A2+ MCER; pasado con detalle, preferencias,
 * rutinas contextualizadas, consejos empáticos, planes futuros, cortesía social,
 * narración de anécdotas y consolidación de estrategias).
 * Contenido bilingüe (andamiaje en español, lengua meta en inglés).
 * Uso: npx tsx scripts/seed-activities-iniv-refuerzo.ts
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
  log("\n🌱 Refuerzo IN-IV — Inglés IV (A2+): A4-A7 por progresión\n");

  const progs = await getProgresionesDeUAC(sb, "IN-IV");
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

  log(`\n✅ IN-IV refuerzo: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── REFUERZOS POR PROGRESIÓN ───────────────────────────────────────────────────

const refuerzos: Refuerzo[][] = [
  // ════════════ P01 — Describir experiencias pasadas con mayor detalle ════════════
  [
    {
      titulo: "True or False — Describing past experiences",
      descripcion: "Decide si cada afirmación sobre cómo narrar experiencias pasadas con detalle (lugar, acompañantes, circunstancias) es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "To add detail to a past experience you can mention where it happened, who you were with, and how you felt.", respuesta: true, retroalimentacion: "Correct: providing context (place, people, feelings) makes past narratives richer and clearer." },
          { enunciado: "The expression 'It was the first time I...' is followed by the past simple ('It was the first time I tried sushi').", respuesta: true, retroalimentacion: "Correct: 'It was the first time I + past simple' describes a new experience." },
          { enunciado: "To say you were in the middle of doing something when another event happened, you use the past simple for both verbs ('I walked when it rained').", respuesta: false, retroalimentacion: "No: use past continuous + past simple: 'I was walking when it started to rain'." },
          { enunciado: "'While' introduces a background action in the past continuous ('While I was cooking, the phone rang').", respuesta: true, retroalimentacion: "Correct: while + past continuous sets the scene for an interruption." },
          { enunciado: "'Last', 'ago', 'in [year]' and 'when I was [age]' are useful time expressions for past narratives.", respuesta: true, retroalimentacion: "Correct: these markers anchor the experience in a specific past time." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glossary — Narrating past experiences in detail",
      descripcion: "Glosario interactivo de expresiones para narrar experiencias pasadas con mayor contexto y detalle.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "past continuous (was/were + -ing)", definicion: "Background action ongoing at a moment in the past.", ejemplo: "I was studying when my friend knocked on the door.", etiquetas: ["gramática"] },
          { termino: "past simple (interruption)", definicion: "A completed action that interrupts a background activity.", ejemplo: "While I was reading, the power went out.", etiquetas: ["gramática"] },
          { termino: "It was the first time I...", definicion: "Expresión para hablar de una experiencia completamente nueva.", ejemplo: "It was the first time I cooked for the whole family.", etiquetas: ["expresión"] },
          { termino: "time expressions (past)", definicion: "Marcadores temporales: last year, ago, in 2022, when I was ten.", ejemplo: "When I was twelve, I visited the coast for the first time.", etiquetas: ["tiempo"] },
          { termino: "while / when", definicion: "Conectores de simultaneidad: mientras / cuando.", ejemplo: "While we were eating, it suddenly started to snow.", etiquetas: ["conector"] },
          { termino: "detail expressions", definicion: "Frases para añadir detalle: with my family, at the time, right there.", ejemplo: "At the time, I was living with my grandparents.", etiquetas: ["expresión"] },
        ],
        actividad_final: "Escribe un párrafo de 5-7 oraciones sobre una experiencia pasada memorable. Incluye past continuous, al menos una expresión de tiempo y el conector 'while' o 'when'.",
      },
    },
    {
      titulo: "Fill in the blanks — A memorable experience",
      descripcion: "Completa la narración de una experiencia pasada con past continuous, past simple y conectores de tiempo.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos usando past continuous (was/were + -ing), past simple o la expresión de tiempo correcta.",
        texto_con_huecos: "Last summer, I ___ with my cousins at a small beach town. While we ___ along the shore, we found an old fishing boat. It ___ the first time I had ever seen one up close. We ___ photos and talked about the adventure all evening.",
        huecos: [
          { posicion: 0, respuesta_correcta: "stayed", alternativas_aceptadas: ["was staying"], pista: "Situación en el pasado: I ___ with my cousins (vivía / me quedé)." },
          { posicion: 1, respuesta_correcta: "were walking", alternativas_aceptadas: ["walked"], pista: "Acción en progreso interrumpida: While we ___ (past continuous)." },
          { posicion: 2, respuesta_correcta: "was", alternativas_aceptadas: [], pista: "It ___ the first time — pasado simple de 'be'." },
          { posicion: 3, respuesta_correcta: "took", alternativas_aceptadas: ["took some"], pista: "Pasado irregular de 'take': take → ___." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Self-check — Describing past experiences in detail",
      descripcion: "Autoevaluación de tu habilidad para narrar experiencias pasadas con contexto y detalle en inglés.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio. No es una calificación: es para saber qué reforzar.",
        criterios: [
          { descripcion: "Uso past continuous (was/were + -ing) para describir una acción en progreso en el pasado.", escala: escala4 },
          { descripcion: "Combino past continuous y past simple para narrar una interrupción ('While I was..., ... happened').", escala: escala4 },
          { descripcion: "Añado detalle a mis narraciones: lugar, compañía, circunstancias y sentimientos.", escala: escala4 },
          { descripcion: "Uso marcadores de tiempo (last year, ago, when I was young) para situar la experiencia.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué experiencia pasada recuerdas bien y ya podrías contar en inglés con detalle?",
      },
    },
  ],

  // ════════════ P02 — Expresar y justificar preferencias de forma respetuosa ════════════
  [
    {
      titulo: "True or False — Expressing & justifying preferences",
      descripcion: "Decide si cada afirmación sobre cómo expresar y justificar preferencias personales de forma respetuosa es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "'I prefer X to Y' and 'I'd rather do X than Y' both express a preference between two options.", respuesta: true, retroalimentacion: "Correct: both structures compare two choices and express which you prefer." },
          { enunciado: "'I'd rather' is followed by the infinitive with 'to' ('I'd rather to stay home').", respuesta: false, retroalimentacion: "No: 'I'd rather' is followed by the bare infinitive (no 'to'): 'I'd rather stay home'." },
          { enunciado: "Adding 'because' or 'since' to a preference statement makes it more justified and respectful.", respuesta: true, retroalimentacion: "Correct: giving a reason shows respect for the listener ('I prefer tea to coffee because it's calmer')." },
          { enunciado: "The phrase 'That sounds great, but personally I prefer...' is a polite way to disagree on preferences.", respuesta: true, retroalimentacion: "Correct: acknowledging the other view before expressing yours keeps the exchange respectful." },
          { enunciado: "'What do you prefer, X or Y?' is a common way to ask someone about their preference.", respuesta: true, retroalimentacion: "Correct: this is a standard preference question in everyday English conversation." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glossary — Preferences, justifications & polite disagreement",
      descripcion: "Glosario interactivo de estructuras para expresar preferencias, dar razones y discrepar con respeto.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "prefer X to Y", definicion: "Estructura para preferir X sobre Y (sustantivos o verbos -ing).", ejemplo: "I prefer cooking at home to eating out.", etiquetas: ["preferencia"] },
          { termino: "I'd rather + bare infinitive", definicion: "Preferir hacer algo en este momento o en general.", ejemplo: "I'd rather watch a film than go to a party tonight.", etiquetas: ["preferencia"] },
          { termino: "because / since / as", definicion: "Conectores causales para justificar una preferencia.", ejemplo: "I prefer cycling since it's healthier and cheaper.", etiquetas: ["conector"] },
          { termino: "That sounds good, but...", definicion: "Expresión de discrepancia respetuosa al dar la propia opinión.", ejemplo: "That sounds fun, but personally I'd rather stay in tonight.", etiquetas: ["cortesía"] },
          { termino: "What do you prefer, X or Y?", definicion: "Pregunta estándar para conocer las preferencias de alguien.", ejemplo: "What do you prefer, the mountains or the beach?", etiquetas: ["pregunta"] },
          { termino: "in my opinion / personally", definicion: "Expresiones para introducir una opinión o preferencia personal.", ejemplo: "Personally, I think working in the morning is more productive.", etiquetas: ["opinión"] },
        ],
        actividad_final: "Escribe un mini-diálogo de 6 intercambios con un amigo/a donde ambos expresen y justifiquen una preferencia diferente (viaje, comida, deporte) usando las estructuras del glosario.",
      },
    },
    {
      titulo: "Fill in the blanks — Comparing personal choices",
      descripcion: "Completa el diálogo usando estructuras para expresar y justificar preferencias de forma respetuosa.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con la expresión o estructura de preferencia correcta.",
        texto_con_huecos: "— What do you ___, hiking or swimming? — Personally, I ___ hiking to swimming because it's more relaxing. — That sounds great, but I'd ___ swim since the weather is so hot. — Fair enough! In my ___, both are great ways to stay active.",
        huecos: [
          { posicion: 0, respuesta_correcta: "prefer", alternativas_aceptadas: ["like"], pista: "Pregunta estándar: What do you ___, X or Y?" },
          { posicion: 1, respuesta_correcta: "prefer", alternativas_aceptadas: [], pista: "I ___ X to Y — estructura de preferencia formal." },
          { posicion: 2, respuesta_correcta: "rather", alternativas_aceptadas: [], pista: "I'd ___ + verbo base (sin 'to')." },
          { posicion: 3, respuesta_correcta: "opinion", alternativas_aceptadas: [], pista: "In my ___ = en mi opinión." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Self-check — Justifying preferences respectfully",
      descripcion: "Autoevaluación de tu habilidad para expresar y justificar preferencias personales en inglés.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Expreso preferencias usando 'prefer X to Y' y 'I'd rather + verbo'.", escala: escala4 },
          { descripcion: "Justifico mis preferencias con 'because', 'since' o 'as' y una razón concreta.", escala: escala4 },
          { descripcion: "Discrepo de forma respetuosa usando expresiones como 'That sounds good, but...'.", escala: escala4 },
          { descripcion: "Pregunto sobre las preferencias de otros con 'What do you prefer...?'.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué preferencia tuya (comida, actividad, destino) ya puedes expresar y justificar en inglés?",
      },
    },
  ],

  // ════════════ P03 — Describir rutinas y hábitos con conciencia del contexto ════════════
  [
    {
      titulo: "True or False — Routines & habits in context",
      descripcion: "Decide si cada afirmación sobre cómo describir rutinas y hábitos explicando el porqué es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "The present simple is used to describe routines and regular habits ('I wake up at 6 every day').", respuesta: true, retroalimentacion: "Correct: the present simple expresses habitual or repeated actions." },
          { enunciado: "Adding 'so that' or 'in order to' after a routine explains its purpose ('I exercise so that I can stay healthy').", respuesta: true, retroalimentacion: "Correct: 'so that' and 'in order to' express purpose and make routines more meaningful." },
          { enunciado: "'I'm used to waking up early' means you find it difficult to wake up early.", respuesta: false, retroalimentacion: "'Be used to + verb-ing' means the action is familiar and no longer difficult." },
          { enunciado: "Frequency adverbs (always, usually, rarely) come after the main verb in most sentences.", respuesta: false, retroalimentacion: "No: frequency adverbs usually come before the main verb ('I always have breakfast') but after 'be' ('She is always on time')." },
          { enunciado: "'I tend to + infinitive' is a natural way to describe a regular personal habit.", respuesta: true, retroalimentacion: "Correct: 'I tend to check my phone first thing in the morning' = it's a regular tendency." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glossary — Habits, routines & purpose expressions",
      descripcion: "Glosario interactivo de expresiones para describir rutinas, hábitos y su justificación contextual.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "present simple (habits)", definicion: "Tiempo para acciones habituales o rutinas: I walk, she studies, we eat.", ejemplo: "I usually take a walk after dinner.", etiquetas: ["gramática"] },
          { termino: "so that / in order to", definicion: "Conectores de propósito: para que / con el fin de.", ejemplo: "I revise my notes every evening in order to remember the content.", etiquetas: ["propósito"] },
          { termino: "be used to + verb-ing", definicion: "Estar acostumbrado/a a algo (ya no es difícil).", ejemplo: "I'm used to commuting by bus — I've done it for years.", etiquetas: ["hábito"] },
          { termino: "I tend to + infinitive", definicion: "Tener tendencia a hacer algo habitualmente.", ejemplo: "I tend to procrastinate when I'm stressed.", etiquetas: ["hábito"] },
          { termino: "context phrases", definicion: "Frases contextuales: on school days, at weekends, during the week.", ejemplo: "On school days, I have lunch at the canteen.", etiquetas: ["contexto"] },
          { termino: "reason connectors", definicion: "Conectores causales para explicar hábitos: because, since, as a result.", ejemplo: "I drink plenty of water because it helps me concentrate.", etiquetas: ["conector"] },
        ],
        actividad_final: "Describe tu rutina de un día de escuela. Incluye al menos 4 hábitos, explica el propósito de 2 de ellos con 'so that' o 'in order to', y menciona el contexto (on school days, in the morning, etc.).",
      },
    },
    {
      titulo: "Fill in the blanks — My daily routine explained",
      descripcion: "Completa el texto sobre rutinas usando presente simple, conectores de propósito y expresiones de contexto.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el presente simple, el conector de propósito o la expresión de contexto correcta.",
        texto_con_huecos: "On school days, I ___ up at 6:30 in order to have enough time for breakfast. I usually ___ my notes the night before so that I feel prepared. I'm used to ___ by public transport, which takes about 30 minutes. In the evening, I tend to ___ for at least half an hour to relax.",
        huecos: [
          { posicion: 0, respuesta_correcta: "wake", alternativas_aceptadas: ["get"], pista: "Presente simple 1ª persona: I ___ up at 6:30." },
          { posicion: 1, respuesta_correcta: "review", alternativas_aceptadas: ["read", "check", "revise"], pista: "Hábito de estudiar: I usually ___ my notes." },
          { posicion: 2, respuesta_correcta: "travelling", alternativas_aceptadas: ["commuting", "going"], pista: "Be used to + verbo-ing: I'm used to ___ (viajar / ir)." },
          { posicion: 3, respuesta_correcta: "read", alternativas_aceptadas: ["exercise", "walk", "draw"], pista: "I tend to + verbo base: I tend to ___ to relax." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Self-check — Describing routines with context",
      descripcion: "Autoevaluación de tu habilidad para describir rutinas y hábitos con conciencia del porqué y el contexto.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Uso el presente simple correctamente para describir hábitos y rutinas.", escala: escala4 },
          { descripcion: "Explico el propósito de mis rutinas con 'so that' o 'in order to'.", escala: escala4 },
          { descripcion: "Uso 'be used to + -ing' y 'tend to' para describir tendencias y costumbres.", escala: escala4 },
          { descripcion: "Sitúo mis rutinas en contexto (on school days, at weekends, in the morning).", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué hábito de tu vida cotidiana puedes describir en inglés explicando también por qué lo haces?",
      },
    },
  ],

  // ════════════ P04 — Solicitar y dar consejos de forma empática y contextualizada ════════════
  [
    {
      titulo: "True or False — Giving & asking for advice",
      descripcion: "Decide si cada afirmación sobre cómo pedir y dar consejos de forma empática en inglés es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "'You should + bare infinitive' is one of the most common ways to give advice in English.", respuesta: true, retroalimentacion: "Correct: 'You should rest more' = te recomiendo que descanses más." },
          { enunciado: "'If I were you, I would...' is a conditional structure used to give advice empathetically.", respuesta: true, retroalimentacion: "Correct: this structure invites the listener to imagine the advisor's perspective." },
          { enunciado: "'What do you think I should do?' is an incorrect way to ask for advice.", respuesta: false, retroalimentacion: "No, it's a perfectly correct and natural way to ask for advice in English." },
          { enunciado: "'You must exercise' sounds softer and more empathetic than 'You should exercise'.", respuesta: false, retroalimentacion: "'Must' is stronger and more imposing. 'Should' or 'Why don't you...?' sound more empathetic." },
          { enunciado: "'Have you thought about + verb-ing?' is a gentle, suggestion-style way to give advice.", respuesta: true, retroalimentacion: "Correct: it invites reflection without imposing, which is especially empathetic." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glossary — Advice structures & empathetic language",
      descripcion: "Glosario interactivo de estructuras para dar y pedir consejos con empatía en contextos de salud, estudio y convivencia.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "You should / shouldn't + infinitive", definicion: "Consejo directo: deberías / no deberías hacer algo.", ejemplo: "You should drink more water and you shouldn't skip breakfast.", etiquetas: ["consejo"] },
          { termino: "If I were you, I would...", definicion: "Consejo empático usando el condicional II.", ejemplo: "If I were you, I would talk to the teacher about it.", etiquetas: ["condicional"] },
          { termino: "Have you thought about + verb-ing?", definicion: "Sugerencia amable que invita a reflexionar.", ejemplo: "Have you thought about joining the study group?", etiquetas: ["sugerencia"] },
          { termino: "Why don't you + verb?", definicion: "Sugerencia informal y amistosa.", ejemplo: "Why don't you take a short break and then continue?", etiquetas: ["sugerencia"] },
          { termino: "What do you think I should do?", definicion: "Pregunta estándar para pedir consejo en inglés.", ejemplo: "I feel overwhelmed. What do you think I should do?", etiquetas: ["pedir consejo"] },
          { termino: "That must be tough / I understand", definicion: "Expresiones de empatía antes de dar un consejo.", ejemplo: "That must be tough. If I were you, I would ask for help.", etiquetas: ["empatía"] },
        ],
        actividad_final: "Escribe un mini-diálogo de 6 intercambios: una persona tiene un problema (salud, estudio, convivencia) y la otra ofrece al menos 3 consejos usando diferentes estructuras del glosario.",
      },
    },
    {
      titulo: "Fill in the blanks — Giving empathetic advice",
      descripcion: "Completa el diálogo con estructuras para dar consejos de forma empática y contextualizada.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con la estructura de consejo o empatía más adecuada según el contexto.",
        texto_con_huecos: "— I'm really stressed about my exams. What do you think I ___ do? — That ___ be tough. You should make a study plan. Have you ___ about studying with a group? — If I ___ you, I'd also try to sleep at least 8 hours.",
        huecos: [
          { posicion: 0, respuesta_correcta: "should", alternativas_aceptadas: [], pista: "Pedir consejo: What do you think I ___ do?" },
          { posicion: 1, respuesta_correcta: "must", alternativas_aceptadas: [], pista: "Expresión de empatía: That ___ be tough (debe ser difícil)." },
          { posicion: 2, respuesta_correcta: "thought", alternativas_aceptadas: [], pista: "Have you ___ about + verb-ing? (pensado en...)" },
          { posicion: 3, respuesta_correcta: "were", alternativas_aceptadas: [], pista: "If I ___ you, I would... (condicional II: were, no was)." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Self-check — Asking and giving empathetic advice",
      descripcion: "Autoevaluación de tu habilidad para solicitar y dar consejos de forma empática en inglés.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Doy consejos directos con 'You should/shouldn't + infinitive'.", escala: escala4 },
          { descripcion: "Ofrezco consejos empáticos con 'If I were you, I would...' y 'Have you thought about...?'.", escala: escala4 },
          { descripcion: "Expreso empatía antes de dar un consejo ('That must be tough / I understand').", escala: escala4 },
          { descripcion: "Pido consejos con 'What do you think I should do?' y situaciones reales de mi vida.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué consejo le darías en inglés a un amigo/a que está estresado por los exámenes? Escribe 2-3 oraciones.",
      },
    },
  ],

  // ════════════ P05 — Hablar sobre planes y propósitos personales o comunitarios ════════════
  [
    {
      titulo: "True or False — Plans & future intentions",
      descripcion: "Decide si cada afirmación sobre cómo hablar de planes y propósitos futuros en inglés es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "'Be going to + infinitive' is used to talk about plans and intentions already decided.", respuesta: true, retroalimentacion: "Correct: 'I'm going to study medicine' = a decided plan or intention." },
          { enunciado: "'Will + infinitive' is the only way to talk about the future in English.", respuesta: false, retroalimentacion: "No: 'be going to', present continuous for arrangements, and 'will' are all used for the future with different nuances." },
          { enunciado: "'I'm planning to + infinitive' expresses a thought-out intention.", respuesta: true, retroalimentacion: "Correct: 'I'm planning to join the school team next year' = a deliberate plan." },
          { enunciado: "'I hope to + infinitive' is used to express a wish or desired outcome for the future.", respuesta: true, retroalimentacion: "Correct: 'I hope to travel abroad after graduation' = a future wish." },
          { enunciado: "'We could + infinitive' is a good way to propose a plan to a group.", respuesta: true, retroalimentacion: "Correct: 'We could organise a community event' = a polite proposal." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glossary — Future plans, intentions & community goals",
      descripcion: "Glosario interactivo de estructuras para hablar de planes, intenciones y propósitos personales o comunitarios.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "be going to + infinitive", definicion: "Plan o intención ya decidida para el futuro.", ejemplo: "I'm going to volunteer at the community garden next month.", etiquetas: ["futuro"] },
          { termino: "I'm planning to + infinitive", definicion: "Intención planificada o bien pensada.", ejemplo: "We're planning to organise a book drive for the school.", etiquetas: ["futuro"] },
          { termino: "I hope to + infinitive", definicion: "Deseo o aspiración para el futuro.", ejemplo: "I hope to study abroad when I finish school.", etiquetas: ["deseo"] },
          { termino: "We could + infinitive", definicion: "Propuesta amable de plan grupal o comunitario.", ejemplo: "We could start a recycling programme at school.", etiquetas: ["propuesta"] },
          { termino: "so that / because it matters", definicion: "Explicar por qué el plan es importante.", ejemplo: "I'm going to join the clean-up day because it matters for our neighbourhood.", etiquetas: ["propósito"] },
          { termino: "future time expressions", definicion: "Marcadores temporales: next year, soon, by the end of, in the future.", ejemplo: "By the end of the year, we plan to have planted 50 trees.", etiquetas: ["tiempo"] },
        ],
        actividad_final: "Escribe 5 oraciones sobre tus planes y propósitos para el próximo semestre o año. Incluye al menos 2 estructuras diferentes del glosario y explica la importancia de un plan con 'because' o 'so that'.",
      },
    },
    {
      titulo: "Fill in the blanks — Talking about plans",
      descripcion: "Completa el texto con estructuras para hablar de planes futuros y su importancia.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con la estructura de futuro o conector de propósito correcta.",
        texto_con_huecos: "Next semester, our class ___ going to launch a recycling project. We ___ planning to collect plastic bottles every Friday. I ___ to involve the whole school because it matters for our environment. We could ___ community events to raise awareness too.",
        huecos: [
          { posicion: 0, respuesta_correcta: "is", alternativas_aceptadas: ["'s"], pista: "Our class ___ going to (3ª persona singular del presente de 'be')." },
          { posicion: 1, respuesta_correcta: "are", alternativas_aceptadas: ["'re"], pista: "We ___ planning to (1ª persona plural del presente de 'be')." },
          { posicion: 2, respuesta_correcta: "hope", alternativas_aceptadas: [], pista: "I ___ to involve = espero involucrar (deseo futuro)." },
          { posicion: 3, respuesta_correcta: "organise", alternativas_aceptadas: ["organize", "hold", "plan"], pista: "We could ___ events (verbo base después de 'could')." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Self-check — Expressing plans & future intentions",
      descripcion: "Autoevaluación de tu habilidad para hablar de planes y propósitos personales o comunitarios en inglés.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Uso 'be going to + infinitive' para hablar de planes ya decididos.", escala: escala4 },
          { descripcion: "Uso 'I'm planning to' e 'I hope to' para expresar intenciones y deseos.", escala: escala4 },
          { descripcion: "Explico la importancia de mis planes con 'because' o 'so that'.", escala: escala4 },
          { descripcion: "Propongo planes comunitarios o grupales con 'we could + infinitive'.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué plan o propósito tienes para el próximo semestre que ya puedes expresar en inglés?",
      },
    },
  ],

  // ════════════ P06 — Participar en conversaciones sociales breves con expresiones de cortesía ════════════
  [
    {
      titulo: "True or False — Social conversations & polite expressions",
      descripcion: "Decide si cada afirmación sobre cómo iniciar, mantener y cerrar conversaciones sociales breves con cortesía es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "'How have you been?' is a polite way to continue a conversation after greeting someone you haven't seen for a while.", respuesta: true, retroalimentacion: "Correct: it's a natural follow-up after 'Hello!' when you haven't met recently." },
          { enunciado: "'That's interesting!' and 'Really?' are examples of conversation fillers that show you are listening.", respuesta: true, retroalimentacion: "Correct: these are called 'backchannels' — small responses that keep the conversation flowing." },
          { enunciado: "To close a conversation politely you can say 'It was great talking to you. Take care!'", respuesta: true, retroalimentacion: "Correct: this is a natural and friendly way to end a short social exchange." },
          { enunciado: "Starting a conversation with 'Excuse me, could I ask you something?' is too formal and should be avoided.", respuesta: false, retroalimentacion: "No: it is polite and appropriate in many contexts, especially with people you don't know well." },
          { enunciado: "'By the way' is used to introduce a new, often unrelated topic in a conversation.", respuesta: true, retroalimentacion: "Correct: 'By the way, did you hear about the school trip?' introduces a side topic." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glossary — Opening, maintaining & closing social exchanges",
      descripcion: "Glosario interactivo de expresiones de cortesía para iniciar, mantener y cerrar conversaciones sociales breves.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "How have you been?", definicion: "Saludo de continuación para alguien que no ves hace tiempo.", ejemplo: "— Hi! How have you been? — Pretty good, thanks! Busy with school.", etiquetas: ["inicio"] },
          { termino: "Excuse me, could I...?", definicion: "Forma educada de iniciar una conversación o pedir algo.", ejemplo: "Excuse me, could I ask you about the homework?", etiquetas: ["cortesía"] },
          { termino: "backchannels (Really? / That's great!)", definicion: "Respuestas breves que muestran atención e interés.", ejemplo: "— I got the highest mark! — Really? That's amazing!", etiquetas: ["mantenimiento"] },
          { termino: "By the way", definicion: "Expresión para introducir un tema nuevo o lateral.", ejemplo: "By the way, are you coming to the event on Friday?", etiquetas: ["cambio de tema"] },
          { termino: "Anyway, I should get going.", definicion: "Expresión para empezar a cerrar la conversación.", ejemplo: "Anyway, I should get going. It was great talking to you!", etiquetas: ["cierre"] },
          { termino: "It was nice/great talking to you!", definicion: "Frase de despedida cordial y natural.", ejemplo: "It was really nice talking to you. Take care!", etiquetas: ["cierre"] },
        ],
        actividad_final: "Escribe un diálogo completo de 8-10 intercambios entre dos compañeros que se encuentran en el pasillo. Incluye: inicio, al menos 2 backchannels, un cambio de tema con 'by the way' y un cierre educado.",
      },
    },
    {
      titulo: "Fill in the blanks — A brief social exchange",
      descripcion: "Completa el diálogo social con expresiones de cortesía para iniciar, mantener y cerrar una conversación.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con la expresión de cortesía o el backchannel correcto.",
        texto_con_huecos: "— Hi, Carlos! How ___ you been? — Pretty good, thanks! I just finished my biology project. — ___ ? That's great! — By the ___, did you see the announcement about the school trip? — Yes! I'm so excited. Anyway, I should ___ going. It was nice talking to you!",
        huecos: [
          { posicion: 0, respuesta_correcta: "have", alternativas_aceptadas: [], pista: "How ___ you been? — present perfect de 'be'." },
          { posicion: 1, respuesta_correcta: "Really", alternativas_aceptadas: ["really"], pista: "Backchannel de sorpresa positiva: ___? That's great!" },
          { posicion: 2, respuesta_correcta: "way", alternativas_aceptadas: [], pista: "By the ___ = a propósito / por cierto." },
          { posicion: 3, respuesta_correcta: "get", alternativas_aceptadas: [], pista: "I should ___ going = tengo que irme (phrasal verb)." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Self-check — Participating in social conversations",
      descripcion: "Autoevaluación de tu habilidad para iniciar, mantener y cerrar conversaciones sociales breves en inglés.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Inicio conversaciones con saludos y preguntas corteses ('How have you been?', 'Excuse me, could I...?').", escala: escala4 },
          { descripcion: "Uso backchannels ('Really?', 'That's great!') para mostrar interés y mantener la conversación.", escala: escala4 },
          { descripcion: "Introduzco nuevos temas con 'By the way' o cambio de tema de forma natural.", escala: escala4 },
          { descripcion: "Cierro conversaciones con frases educadas ('Anyway, I should get going / It was nice talking to you').", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Con quién tendrías una conversación breve en inglés esta semana? ¿Cómo la empezarías y la terminarías?",
      },
    },
  ],

  // ════════════ P07 — Contar una anécdota o experiencia significativa ════════════
  [
    {
      titulo: "True or False — Telling an anecdote",
      descripcion: "Decide si cada afirmación sobre cómo narrar una anécdota de forma clara y organizada en inglés es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "A good anecdote typically has a setting, a complication, and a resolution or reaction.", respuesta: true, retroalimentacion: "Correct: setting (when/where/who), complication (what happened), resolution/reaction (how it ended or how you felt)." },
          { enunciado: "'You won't believe this, but...' and 'The funniest thing happened...' are common ways to open an anecdote.", respuesta: true, retroalimentacion: "Correct: these expressions create interest and signal that a story is coming." },
          { enunciado: "In an anecdote, you should use only the past simple and never the past continuous.", respuesta: false, retroalimentacion: "No: past continuous sets the scene ('I was waiting for the bus') and past simple tells what happened ('when I saw my teacher')." },
          { enunciado: "'In the end' signals the conclusion or result of an anecdote.", respuesta: true, retroalimentacion: "Correct: 'In the end, we all laughed about it' = final resolution of the story." },
          { enunciado: "Exaggeration and humour are inappropriate in informal anecdote-telling.", respuesta: false, retroalimentacion: "No: light exaggeration and humour are common and expected features of informal storytelling in English." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glossary — Anecdote structure & storytelling expressions",
      descripcion: "Glosario interactivo de expresiones y estructuras para narrar una anécdota de forma clara y atractiva.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "anecdote opener", definicion: "Expresión para captar la atención al iniciar una historia.", ejemplo: "You won't believe what happened to me last Friday!", etiquetas: ["apertura"] },
          { termino: "setting the scene", definicion: "Presentar el contexto: cuándo, dónde y quién estaba.", ejemplo: "It was a rainy Monday morning and I was running late for school.", etiquetas: ["escena"] },
          { termino: "complication", definicion: "El evento inesperado o problema central de la anécdota.", ejemplo: "Suddenly, I realised I had left my backpack on the bus.", etiquetas: ["complicación"] },
          { termino: "narrative connectors", definicion: "Conectores narrativos: then, after that, suddenly, all of a sudden, eventually.", ejemplo: "Eventually, a kind passenger found my bag and called the school.", etiquetas: ["conector"] },
          { termino: "in the end / luckily / unfortunately", definicion: "Expresiones para la resolución o reacción final.", ejemplo: "Luckily, the driver kept my bag and I got it back that afternoon.", etiquetas: ["resolución"] },
          { termino: "reaction phrases", definicion: "Expresar cómo te sentiste al final: I couldn't believe it, It was hilarious, I was so relieved.", ejemplo: "I couldn't believe how lucky I was — I was so relieved!", etiquetas: ["reacción"] },
        ],
        actividad_final: "Escribe una anécdota real o inventada de 8-10 oraciones. Incluye: apertura, escena, complicación, al menos 3 conectores narrativos, resolución y tu reacción.",
      },
    },
    {
      titulo: "Fill in the blanks — Narrating an anecdote",
      descripcion: "Completa la anécdota con conectores narrativos, verbos en pasado y expresiones de reacción.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el conector narrativo, verbo en pasado o expresión de reacción correctos.",
        texto_con_huecos: "You won't believe what ___ to me last week! I was walking to school when I ___ my neighbour's dog running loose down the street. Suddenly, it ___ chasing a cat into someone's garden. In the end, the owner ___ up and everything was fine. I ___ believe how chaotic it was!",
        huecos: [
          { posicion: 0, respuesta_correcta: "happened", alternativas_aceptadas: [], pista: "What ___ to me = qué me pasó (pasado de 'happen')." },
          { posicion: 1, respuesta_correcta: "saw", alternativas_aceptadas: ["noticed", "spotted"], pista: "Pasado irregular de 'see': see → ___." },
          { posicion: 2, respuesta_correcta: "started", alternativas_aceptadas: ["began"], pista: "Pasado de 'start' (empezar a perseguir): ___ chasing." },
          { posicion: 3, respuesta_correcta: "showed", alternativas_aceptadas: ["came"], pista: "Pasado de 'show up' (aparecer): the owner ___ up." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Self-check — Telling a clear anecdote",
      descripcion: "Autoevaluación de tu habilidad para narrar una anécdota o experiencia significativa de forma clara y organizada.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Abro mi anécdota con una expresión que capta la atención ('You won't believe...', 'The funniest thing happened...').", escala: escala4 },
          { descripcion: "Presento la escena (cuándo, dónde, quién) antes de contar lo que pasó.", escala: escala4 },
          { descripcion: "Uso conectores narrativos (then, suddenly, eventually, in the end) para organizar los eventos.", escala: escala4 },
          { descripcion: "Termino con la resolución y expreso mi reacción ('I couldn't believe it', 'Luckily...', 'It was hilarious').", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué anécdota divertida o sorprendente de tu vida ya puedes contar en inglés usando los conectores y estructuras de esta progresión?",
      },
    },
  ],

  // ════════════ P08 — Consolidación de estrategias de comprensión y expresión ════════════
  [
    {
      titulo: "True or False — Review IN-IV",
      descripcion: "Decide si cada afirmación integra los temas clave de Inglés IV: narración, preferencias, rutinas, consejos, planes, cortesía y anécdotas.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "'I prefer X to Y', 'I'd rather X than Y' and 'If I were you, I would...' all express preferences or empathetic advice.", respuesta: true, retroalimentacion: "Correct: the first two express preferences; the third is an empathetic advice structure." },
          { enunciado: "'Be going to' and 'I'm planning to' both refer to decided future plans or intentions.", respuesta: true, retroalimentacion: "Correct: both describe plans or intentions the speaker has already thought about." },
          { enunciado: "When telling an anecdote, the past continuous is only used for the main event, not for setting the scene.", respuesta: false, retroalimentacion: "No: past continuous sets the background scene ('I was studying'); past simple tells the main events ('when the power went out')." },
          { enunciado: "'By the way' and 'Anyway, I should get going' are both useful for managing conversation flow.", respuesta: true, retroalimentacion: "Correct: 'by the way' introduces a new topic; 'anyway' signals the conversation is ending." },
          { enunciado: "'I tend to + infinitive' and 'I'm used to + verb-ing' describe habitual actions or established customs.", respuesta: true, retroalimentacion: "Correct: both describe regular behaviour, but 'be used to' emphasises that the habit is familiar and comfortable." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glossary — Consolidation IN-IV",
      descripcion: "Glosario integrador de los temas clave de Inglés IV: narración, preferencias, rutinas, consejos, planes y conversación social.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "Past continuous + past simple", definicion: "Combinación para narrar: fondo (past continuous) + evento (past simple).", ejemplo: "I was reading when my phone rang suddenly.", etiquetas: ["gramática"] },
          { termino: "prefer / I'd rather / If I were you", definicion: "Estructuras para preferencias y consejos empáticos.", ejemplo: "I'd rather stay home. If I were you, I'd rest.", etiquetas: ["preferencia / consejo"] },
          { termino: "be going to / I'm planning to / I hope to", definicion: "Estructuras para planes, intenciones y deseos futuros.", ejemplo: "I'm planning to finish this project by Friday.", etiquetas: ["futuro"] },
          { termino: "social conversation toolkit", definicion: "Herramientas de conversación: How have you been? / Really? / By the way / Anyway...", ejemplo: "By the way, are you free this weekend? — Really? That sounds fun!", etiquetas: ["conversación"] },
          { termino: "anecdote structure", definicion: "Estructura de la anécdota: apertura, escena, complicación, resolución, reacción.", ejemplo: "You won't believe it... I was waiting... suddenly... in the end... I was so relieved!", etiquetas: ["narración"] },
          { termino: "so that / because / in order to", definicion: "Conectores de propósito y causa para explicar hábitos, planes o consejos.", ejemplo: "I study every day so that I can improve my English.", etiquetas: ["conector"] },
        ],
        actividad_final: "Elige 3 temas de IN-IV y escribe 2 oraciones de ejemplo para cada uno que demuestren que los entiendes y los puedes usar con confianza.",
      },
    },
    {
      titulo: "Fill in the blanks — Putting IN-IV together",
      descripcion: "Repaso integrado: completa con el tiempo verbal, estructura o conector correcto según el contexto.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos eligiendo la estructura, tiempo verbal o expresión más adecuada según el contexto.",
        texto_con_huecos: "I ___ going to join the debate club next semester because I want to improve my speaking skills. Yesterday, while I ___ for the bus, I ran into my old teacher. If I ___ you, I'd also sign up — it's a great opportunity. By the ___, did you know the club meets on Thursdays?",
        huecos: [
          { posicion: 0, respuesta_correcta: "am", alternativas_aceptadas: ["'m"], pista: "I ___ going to (presente de 'be' para planes futuros)." },
          { posicion: 1, respuesta_correcta: "was waiting", alternativas_aceptadas: ["waited"], pista: "Acción en progreso en el pasado: While I ___ (past continuous)." },
          { posicion: 2, respuesta_correcta: "were", alternativas_aceptadas: [], pista: "If I ___ you (condicional II: siempre 'were', no 'was')." },
          { posicion: 3, respuesta_correcta: "way", alternativas_aceptadas: [], pista: "By the ___ = a propósito / por cierto (cambio de tema)." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Self-check — Consolidating my English IV",
      descripcion: "Autoevaluación de tu dominio general de los aprendizajes clave de Inglés IV.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio. Es un repaso general del semestre.",
        criterios: [
          { descripcion: "Narro experiencias pasadas con detalle usando past continuous + past simple y conectores narrativos.", escala: escala4 },
          { descripcion: "Expreso y justifico preferencias, y doy consejos empáticos con las estructuras correctas.", escala: escala4 },
          { descripcion: "Hablo de planes y propósitos futuros usando 'be going to', 'planning to' y 'I hope to'.", escala: escala4 },
          { descripcion: "Participo en conversaciones sociales breves con cortesía: inicio, mantengo y cierro intercambios naturalmente.", escala: escala4 },
        ],
        reflexion_final_prompt: "De todo lo que aprendiste en Inglés IV, ¿qué habilidad comunicativa dominas mejor y cuál seguirás practicando para alcanzar el nivel A2+?",
      },
    },
  ],
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });

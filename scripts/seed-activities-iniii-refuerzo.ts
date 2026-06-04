/**
 * Refuerzo de actividades para IN-III (Inglés III — A2 MCER "What we were, we share").
 * Agrega A4-A7 a cada una de las 8 progresiones (ya tienen A1-A3):
 *   A4 = quiz_verdadero_falso · A5 = glosario_interactivo · A6 = fill_blanks · A7 = autoevaluacion
 * 8 progresiones × 4 = 32 actividades nuevas. estado='borrador'.
 * Alineado al programa oficial de Inglés III (A2 MCER; pasado simple, presente perfecto,
 * describir lugares, hábitos/comparativos, modales de obligación, instrucciones y narración).
 * Contenido bilingüe (andamiaje en español, lengua meta en inglés).
 * Uso: npx tsx scripts/seed-activities-iniii-refuerzo.ts
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
  log("\n🌱 Refuerzo IN-III — Inglés III (A2): A4-A7 por progresión\n");

  const progs = await getProgresionesDeUAC(sb, "IN-III");
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

  log(`\n✅ IN-III refuerzo: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── REFUERZOS POR PROGRESIÓN ───────────────────────────────────────────────────

const refuerzos: Refuerzo[][] = [
  // ════════════ P01 — Pasado simple (verbos regulares e irregulares básicos) ════════════
  [
    {
      titulo: "True or False — Simple Past",
      descripcion: "Decide si cada afirmación sobre el pasado simple (verbos regulares e irregulares) es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "Los verbos regulares en pasado simple agregan -ed ('I worked', 'She played').", respuesta: true, retroalimentacion: "Correcto: work → worked, play → played." },
          { enunciado: "'Go' tiene la forma irregular 'went' en pasado simple.", respuesta: true, retroalimentacion: "Sí: go → went. Los irregulares cambian completamente." },
          { enunciado: "Para negar en pasado simple se usa 'didn't' + verbo base ('I didn't go').", respuesta: true, retroalimentacion: "Correcto: didn't + verbo base para todos los sujetos." },
          { enunciado: "La forma interrogativa del pasado es 'Did you went...?'.", respuesta: false, retroalimentacion: "No: tras 'did' el verbo va en forma base: 'Did you go...?'" },
          { enunciado: "'Yesterday', 'last week' y 'ago' son marcadores de tiempo del pasado.", respuesta: true, retroalimentacion: "Sí: indican cuándo ocurrió la acción en el pasado." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glossary — Simple Past & time markers",
      descripcion: "Glosario interactivo de verbos regulares e irregulares básicos y marcadores de tiempo del pasado.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "regular verbs (-ed)", definicion: "Verbos que forman el pasado agregando -ed.", ejemplo: "I walked to school yesterday.", etiquetas: ["gramática"] },
          { termino: "irregular verbs", definicion: "Verbos con forma de pasado única (go→went, eat→ate, see→saw).", ejemplo: "We went to the market last Saturday.", etiquetas: ["gramática"] },
          { termino: "didn't + verb base", definicion: "Forma negativa del pasado simple para todos los sujetos.", ejemplo: "She didn't watch TV last night.", etiquetas: ["negación"] },
          { termino: "Did...?", definicion: "Auxiliar para formar preguntas en pasado simple.", ejemplo: "Did you eat breakfast this morning?", etiquetas: ["pregunta"] },
          { termino: "yesterday / last week / ago", definicion: "Marcadores de tiempo del pasado (ayer / la semana pasada / hace).", ejemplo: "I called her two days ago.", etiquetas: ["tiempo"] },
          { termino: "this week / recently", definicion: "Esta semana / recientemente — para rutinas pasadas recientes.", ejemplo: "I studied a lot this week.", etiquetas: ["tiempo"] },
        ],
        actividad_final: "Escribe 5 oraciones sobre lo que hiciste esta semana. Usa 3 verbos irregulares y 2 regulares en pasado.",
      },
    },
    {
      titulo: "Fill in the blanks — What I did this week",
      descripcion: "Completa el texto con el pasado simple (regulares e irregulares) correcto.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el pasado simple del verbo indicado. Recuerda que tras 'didn't' el verbo va en forma base.",
        texto_con_huecos: "Last Monday, I ___ up early and ___ breakfast with my family. My sister ___ her homework in the afternoon, but she ___ watch TV. We ___ to the park together in the evening.",
        huecos: [
          { posicion: 0, respuesta_correcta: "got", alternativas_aceptadas: ["woke"], pista: "Pasado irregular de 'get up' (levantarse)." },
          { posicion: 1, respuesta_correcta: "had", alternativas_aceptadas: [], pista: "Pasado irregular de 'have' (desayunar / tener)." },
          { posicion: 2, respuesta_correcta: "did", alternativas_aceptadas: ["finished"], pista: "Pasado de 'do' (hacer la tarea) — forma irregular." },
          { posicion: 3, respuesta_correcta: "didn't", alternativas_aceptadas: ["did not"], pista: "Negativo en pasado: ___ + verbo base." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Self-check — Talking about the recent past",
      descripcion: "Autoevaluación de tu habilidad para hablar del pasado simple en inglés.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio. No es una calificación: es para saber qué reforzar.",
        criterios: [
          { descripcion: "Formo el pasado simple de verbos regulares (add -ed).", escala: escala4 },
          { descripcion: "Reconozco y uso formas irregulares básicas (go→went, eat→ate, see→saw).", escala: escala4 },
          { descripcion: "Niego con 'didn't' + verbo base.", escala: escala4 },
          { descripcion: "Uso marcadores de tiempo (yesterday, last week, ago) correctamente.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué hiciste la semana pasada que ya puedes describir en inglés?",
      },
    },
  ],

  // ════════════ P02 — Presente perfecto (have/has + past participle) ════════════
  [
    {
      titulo: "True or False — Present Perfect",
      descripcion: "Decide si cada afirmación sobre el presente perfecto (have/has + participio pasado) es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "El presente perfecto se forma con have/has + participio pasado.", respuesta: true, retroalimentacion: "Correcto: I have visited / She has eaten." },
          { enunciado: "Con 'he' y 'she' se usa 'have' ('She have visited Paris').", respuesta: false, retroalimentacion: "No: con he/she/it se usa 'has': 'She has visited Paris'." },
          { enunciado: "'Ever' y 'never' se usan con el presente perfecto para hablar de experiencias.", respuesta: true, retroalimentacion: "Sí: Have you ever tried sushi? / I have never been to Europe." },
          { enunciado: "'Already' y 'yet' son marcadores del presente perfecto.", respuesta: true, retroalimentacion: "Correcto: I have already eaten. / I haven't finished yet." },
          { enunciado: "El presente perfecto describe una acción completada en el pasado en un tiempo específico.", respuesta: false, retroalimentacion: "No: cuando el tiempo es específico (yesterday, last year) usamos pasado simple, no perfecto." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glossary — Present Perfect & experiences",
      descripcion: "Glosario interactivo del presente perfecto, participios y marcadores de experiencia.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "have / has + past participle", definicion: "Estructura del presente perfecto (experiencias, logros recientes).", ejemplo: "I have visited Teotihuacan twice.", etiquetas: ["gramática"] },
          { termino: "past participle", definicion: "3ª forma del verbo: visited, eaten, seen, been, done.", ejemplo: "Have you seen this movie?", etiquetas: ["gramática"] },
          { termino: "ever / never", definicion: "Alguna vez / nunca — marcadores de experiencia.", ejemplo: "Have you ever tried Thai food? — I have never tried it.", etiquetas: ["experiencia"] },
          { termino: "already / yet", definicion: "Ya (afirmativo) / todavía no (negativo/pregunta).", ejemplo: "I have already done my homework. / She hasn't called yet.", etiquetas: ["marcador"] },
          { termino: "with whom / with my family", definicion: "Con quién — para describir experiencias compartidas.", ejemplo: "I have travelled to Oaxaca with my family.", etiquetas: ["vocabulario"] },
          { termino: "Have you...? / I have...", definicion: "Estructura de pregunta y respuesta en presente perfecto.", ejemplo: "Have you ever cooked a big meal? — Yes, I have!", etiquetas: ["diálogo"] },
        ],
        actividad_final: "Escribe 4 oraciones sobre experiencias personales recientes usando el presente perfecto. Incluye 'ever', 'never', 'already' y 'yet' en distintas oraciones.",
      },
    },
    {
      titulo: "Fill in the blanks — Personal experiences",
      descripcion: "Completa con have/has, el participio pasado correcto y marcadores del presente perfecto.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos. Cuida el uso de have/has y recuerda que los participios de verbos irregulares no siguen la regla -ed.",
        texto_con_huecos: "___ you ever tried pozole? My cousin ___ visited Guadalajara twice. We have ___ eaten together at a new restaurant. She hasn't called me ___.",
        huecos: [
          { posicion: 0, respuesta_correcta: "Have", alternativas_aceptadas: ["have"], pista: "Auxiliar para hacer pregunta con 'you': ___ you ever...?" },
          { posicion: 1, respuesta_correcta: "has", alternativas_aceptadas: [], pista: "Auxiliar para 3ª persona singular ('my cousin')." },
          { posicion: 2, respuesta_correcta: "already", alternativas_aceptadas: [], pista: "Marcador de presente perfecto afirmativo: 'ya' (= already)." },
          { posicion: 3, respuesta_correcta: "yet", alternativas_aceptadas: [], pista: "Marcador negativo: 'todavía no' → hasn't ... ___." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Self-check — Describing recent personal experiences",
      descripcion: "Autoevaluación de tu habilidad para hablar de experiencias personales en presente perfecto.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Formo el presente perfecto con have/has + participio pasado.", escala: escala4 },
          { descripcion: "Distingo cuándo usar have y cuándo usar has.", escala: escala4 },
          { descripcion: "Uso ever, never, already y yet en el contexto correcto.", escala: escala4 },
          { descripcion: "Describo experiencias personales recientes (con quién, cuántas veces).", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué experiencia reciente ya puedes contar en inglés usando 'I have...'?",
      },
    },
  ],

  // ════════════ P03 — Describir lugares conocidos y actividades ════════════
  [
    {
      titulo: "True or False — Describing places",
      descripcion: "Decide si cada afirmación sobre there is/are, can y preposiciones de lugar es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "'There is' se usa para un solo lugar o cosa y 'there are' para más de uno.", respuesta: true, retroalimentacion: "Correcto: There is a library. / There are two parks near my school." },
          { enunciado: "'Can' puede expresar posibilidad ('You can visit the market on Sundays').", respuesta: true, retroalimentacion: "Sí: can también indica posibilidad/recomendación." },
          { enunciado: "'Between' significa 'al lado de' (next to).", respuesta: false, retroalimentacion: "'Between' significa 'entre' dos cosas; 'next to' significa 'al lado de'." },
          { enunciado: "'In front of' significa 'detrás de'.", respuesta: false, retroalimentacion: "'In front of' = enfrente de; 'behind' = detrás de." },
          { enunciado: "'You should visit the cathedral' es una recomendación básica en inglés.", respuesta: true, retroalimentacion: "Correcto: should + verbo base para dar recomendaciones." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glossary — Places, prepositions & recommendations",
      descripcion: "Glosario interactivo de there is/are, preposiciones de lugar y expresiones para recomendar.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "There is / There are", definicion: "Hay (singular / plural) para describir lo que existe en un lugar.", ejemplo: "There are three coffee shops near my school.", etiquetas: ["gramática"] },
          { termino: "can (possibility)", definicion: "'Can' para indicar lo que es posible hacer en un lugar.", ejemplo: "You can rent bikes in the park.", etiquetas: ["posibilidad"] },
          { termino: "next to / between / in front of", definicion: "Preposiciones de lugar: al lado de / entre / enfrente de.", ejemplo: "The museum is between the park and the library.", etiquetas: ["lugar"] },
          { termino: "behind / opposite", definicion: "Preposiciones de lugar: detrás de / frente a (al otro lado).", ejemplo: "The pharmacy is behind the supermarket.", etiquetas: ["lugar"] },
          { termino: "you should / you can", definicion: "Recomendaciones básicas: deberías / puedes.", ejemplo: "You should try the local food there!", etiquetas: ["recomendación"] },
          { termino: "places of interest", definicion: "Lugares de interés: market, cathedral, museum, park, beach.", ejemplo: "There is a beautiful cathedral in the city centre.", etiquetas: ["vocabulario"] },
        ],
        actividad_final: "Describe un lugar conocido de tu ciudad usando there is/are, al menos 3 preposiciones de lugar y una recomendación con 'you should'.",
      },
    },
    {
      titulo: "Fill in the blanks — Describing my town",
      descripcion: "Completa con there is/are, can y preposiciones de lugar para describir un lugar.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos para describir el centro de una ciudad. Elige la preposición o expresión correcta.",
        texto_con_huecos: "In the city centre, ___ a big market next to the cathedral. You ___ buy fresh food there every day. The park is ___ the market and the library. You should ___ the cathedral — it is beautiful!",
        huecos: [
          { posicion: 0, respuesta_correcta: "there is", alternativas_aceptadas: ["there's"], pista: "Hay un solo mercado (singular): ___ a big market." },
          { posicion: 1, respuesta_correcta: "can", alternativas_aceptadas: [], pista: "Expresar posibilidad: you ___ buy = puedes comprar." },
          { posicion: 2, respuesta_correcta: "between", alternativas_aceptadas: [], pista: "Preposición: está entre dos cosas (market y library)." },
          { posicion: 3, respuesta_correcta: "visit", alternativas_aceptadas: ["see"], pista: "Recomendación: you should ___ (verbo base)." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Self-check — Describing known places",
      descripcion: "Autoevaluación de tu habilidad para describir lugares y dar recomendaciones en inglés.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Uso there is / there are para describir lo que hay en un lugar.", escala: escala4 },
          { descripcion: "Uso preposiciones de lugar (next to, between, in front of, behind).", escala: escala4 },
          { descripcion: "Uso can para expresar posibilidad en un lugar ('You can rent bikes').", escala: escala4 },
          { descripcion: "Hago recomendaciones básicas con 'you should' + verbo.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué lugar de tu comunidad puedes describir en inglés y qué recomendarías visitar?",
      },
    },
  ],

  // ════════════ P04 — Hábitos, frecuencia y preferencias ════════════
  [
    {
      titulo: "True or False — Habits, frequency & preferences",
      descripcion: "Decide si cada afirmación sobre adverbios de frecuencia, comparativos, superlativos y like + ing es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "El superlativo de adjetivos cortos se forma con 'the + adjetivo + -est' ('the tallest').", respuesta: true, retroalimentacion: "Correcto: tall → the tallest." },
          { enunciado: "El superlativo de adjetivos largos usa 'the most' ('the most interesting').", respuesta: true, retroalimentacion: "Sí: con adjetivos de 2+ sílabas se usa 'the most'." },
          { enunciado: "Después de 'like' se puede usar un sustantivo o un verbo con -ing ('I like music / I like dancing').", respuesta: true, retroalimentacion: "Correcto: like + noun o like + verb-ing." },
          { enunciado: "El adverbio 'rarely' significa 'siempre'.", respuesta: false, retroalimentacion: "'Rarely' significa 'raramente/casi nunca'. 'Always' significa 'siempre'." },
          { enunciado: "'Good' tiene el superlativo irregular 'the best'.", respuesta: true, retroalimentacion: "Sí: good → better (comparativo) → the best (superlativo)." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glossary — Comparatives, superlatives & preferences",
      descripcion: "Glosario interactivo de adverbios de frecuencia, comparativos, superlativos y like + ing.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "frequency adverbs", definicion: "Adverbios de frecuencia: always, usually, often, sometimes, rarely, never.", ejemplo: "I rarely eat fast food.", etiquetas: ["frecuencia"] },
          { termino: "comparative (-er than / more...than)", definicion: "Para comparar dos cosas (revisión): taller than / more comfortable than.", ejemplo: "Running is faster than walking.", etiquetas: ["gramática"] },
          { termino: "superlative (the -est / the most)", definicion: "Para el extremo de una serie: the fastest / the most popular.", ejemplo: "Summer is the hottest season.", etiquetas: ["gramática"] },
          { termino: "like + noun / like + verb-ing", definicion: "Expresar gustos: I like coffee / I like swimming.", ejemplo: "She likes reading fantasy novels.", etiquetas: ["preferencia"] },
          { termino: "prefer...to", definicion: "Preferir una cosa sobre otra.", ejemplo: "I prefer cycling to running.", etiquetas: ["preferencia"] },
          { termino: "the best / the worst", definicion: "Superlativos irregulares de good/bad.", ejemplo: "That was the best trip of my life!", etiquetas: ["irregular"] },
        ],
        actividad_final: "Escribe 5 oraciones sobre tus hábitos y preferencias. Usa al menos 1 superlativo, 1 comparativo y 2 adverbios de frecuencia.",
      },
    },
    {
      titulo: "Fill in the blanks — My habits & preferences",
      descripcion: "Completa con la forma correcta del superlativo, comparativo o like + ing.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el superlativo, el comparativo o la expresión de preferencia adecuada.",
        texto_con_huecos: "Football is ___ sport in my school (popular — superlative). I think cycling is ___ running (healthy — comparative). My sister likes ___ on weekends. She rarely ___ fast food.",
        huecos: [
          { posicion: 0, respuesta_correcta: "the most popular", alternativas_aceptadas: [], pista: "Superlativo de adjetivo largo: the most ___." },
          { posicion: 1, respuesta_correcta: "healthier than", alternativas_aceptadas: ["more healthy than"], pista: "Comparativo de 'healthy' (2 sílabas, termina en -y): ___ than." },
          { posicion: 2, respuesta_correcta: "reading", alternativas_aceptadas: ["cooking", "dancing", "swimming"], pista: "like + verbo-ing (cualquier actividad razonable)." },
          { posicion: 3, respuesta_correcta: "eats", alternativas_aceptadas: ["buys"], pista: "3ª persona singular del presente simple (she ___ fast food)." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Self-check — Talking about habits & preferences",
      descripcion: "Autoevaluación de tu habilidad para describir hábitos, frecuencia y preferencias en inglés.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Uso adverbios de frecuencia (always, often, rarely, never) correctamente.", escala: escala4 },
          { descripcion: "Formo comparativos correctos (-er than / more...than).", escala: escala4 },
          { descripcion: "Formo superlativos correctos (the -est / the most).", escala: escala4 },
          { descripcion: "Expreso preferencias con 'like + noun/verb-ing' y 'prefer...to'.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué hábito o preferencia tuya ya puedes expresar en inglés usando un superlativo o 'like + -ing'?",
      },
    },
  ],

  // ════════════ P05 — Responsabilidades y normas (must/mustn't, have to/don't have to) ════════════
  [
    {
      titulo: "True or False — Must & have to",
      descripcion: "Decide si cada afirmación sobre must/mustn't y have to/don't have to es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "'Must' expresa obligación fuerte o una regla personal ('You must wear a helmet').", respuesta: true, retroalimentacion: "Correcto: must = obligación o regla importante." },
          { enunciado: "'Mustn't' y 'don't have to' significan lo mismo.", respuesta: false, retroalimentacion: "'Mustn't' = está prohibido; 'don't have to' = no es necesario (pero puedes si quieres)." },
          { enunciado: "'Have to' expresa obligación externa (reglas, leyes, normas de la escuela).", respuesta: true, retroalimentacion: "Sí: have to/has to viene de una norma externa, no personal." },
          { enunciado: "Con 'he' y 'she' la forma es 'has to' ('She has to arrive on time').", respuesta: true, retroalimentacion: "Correcto: have → has en 3ª persona singular." },
          { enunciado: "Después de 'must' el verbo lleva -s ('You musts study').", respuesta: false, retroalimentacion: "No: must es modal y va seguido de verbo base: 'You must study'." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glossary — Obligations & rules",
      descripcion: "Glosario interactivo de must/mustn't y have to/don't have to con contextos de casa, escuela y comunidad.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "must / mustn't", definicion: "Obligación fuerte o prohibición: deber / no deber (está prohibido).", ejemplo: "You must turn off your phone in class. You mustn't run in the hallways.", etiquetas: ["gramática"] },
          { termino: "have to / has to", definicion: "Obligación externa: tener que (he/she usa 'has to').", ejemplo: "Students have to wear a uniform. She has to be home by 9.", etiquetas: ["gramática"] },
          { termino: "don't have to / doesn't have to", definicion: "No es necesario (pero es opcional).", ejemplo: "You don't have to bring a dictionary — I have one.", etiquetas: ["gramática"] },
          { termino: "rules at school", definicion: "Normas del colegio: be on time, respect others, keep quiet.", ejemplo: "We have to be respectful to our teachers.", etiquetas: ["escuela"] },
          { termino: "chores at home", definicion: "Quehaceres del hogar: do the dishes, take out the rubbish, tidy your room.", ejemplo: "I have to do the dishes every evening.", etiquetas: ["hogar"] },
          { termino: "community responsibilities", definicion: "Responsabilidades en la comunidad: recycle, keep the streets clean.", ejemplo: "We must recycle to protect the environment.", etiquetas: ["comunidad"] },
        ],
        actividad_final: "Escribe 6 oraciones sobre responsabilidades: 2 con must/mustn't, 2 con have to/has to y 2 con don't/doesn't have to.",
      },
    },
    {
      titulo: "Fill in the blanks — Rules and responsibilities",
      descripcion: "Completa con must, mustn't, have to o don't have to según el contexto.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con must, mustn't, have to o don't have to. Piensa si es obligatorio, prohibido o simplemente no necesario.",
        texto_con_huecos: "At school, students ___ wear their uniform every day. You ___ use your phone during the exam — it is not allowed. My brother ___ finish his project tonight; the deadline is tomorrow. You ___ bring food; I already cooked.",
        huecos: [
          { posicion: 0, respuesta_correcta: "have to", alternativas_aceptadas: ["must"], pista: "Obligación externa (norma del colegio): ___ wear uniform." },
          { posicion: 1, respuesta_correcta: "mustn't", alternativas_aceptadas: ["must not"], pista: "Está prohibido usar el celular: you ___ use it." },
          { posicion: 2, respuesta_correcta: "has to", alternativas_aceptadas: ["must"], pista: "Obligación para 'my brother' (3ª persona): he ___ finish." },
          { posicion: 3, respuesta_correcta: "don't have to", alternativas_aceptadas: ["do not have to"], pista: "No es necesario traer comida (pero si quieres puedes): you ___ bring." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Self-check — Expressing obligations & rules",
      descripcion: "Autoevaluación de tu habilidad para expresar obligaciones, prohibiciones y ausencia de obligación.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Uso 'must' y 'mustn't' para expresar obligación fuerte y prohibición.", escala: escala4 },
          { descripcion: "Uso 'have to / has to' para hablar de obligaciones externas.", escala: escala4 },
          { descripcion: "Distingo 'mustn't' (prohibición) de 'don't have to' (no es necesario).", escala: escala4 },
          { descripcion: "Hablo de responsabilidades en casa, escuela y comunidad en inglés.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué responsabilidad en tu escuela o casa ya puedes explicar en inglés usando must/have to?",
      },
    },
  ],

  // ════════════ P06 — Pedir, dar y entender instrucciones ════════════
  [
    {
      titulo: "True or False — Instructions & connectors",
      descripcion: "Decide si cada afirmación sobre imperativos y conectores secuenciales es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "El imperativo en inglés usa el verbo base sin sujeto ('Open your book').", respuesta: true, retroalimentacion: "Correcto: el imperativo no lleva sujeto: Open / Close / Read." },
          { enunciado: "'First', 'then', 'after that' y 'finally' son conectores secuenciales.", respuesta: true, retroalimentacion: "Sí: organizan los pasos de una instrucción en orden." },
          { enunciado: "'Don't touch that' es la forma negativa del imperativo.", respuesta: true, retroalimentacion: "Correcto: Don't + verbo base para prohibir o advertir." },
          { enunciado: "'Finally' se usa al principio de las instrucciones.", respuesta: false, retroalimentacion: "'Finally' se usa al final, para el último paso. 'First' va al principio." },
          { enunciado: "'After that' significa 'después de eso' y conecta dos pasos consecutivos.", respuesta: true, retroalimentacion: "Correcto: es un conector de secuencia entre pasos." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glossary — Imperatives & sequential connectors",
      descripcion: "Glosario interactivo de imperativos para instrucciones y conectores secuenciales.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "imperative (affirmative)", definicion: "Verbo base sin sujeto para dar instrucciones: Open, Close, Write, Read.", ejemplo: "Open the window, please.", etiquetas: ["gramática"] },
          { termino: "imperative (negative)", definicion: "Don't + verbo base para prohibir o advertir.", ejemplo: "Don't forget your password.", etiquetas: ["gramática"] },
          { termino: "First / Then", definicion: "Conectores: primero / después — para el 1er y 2do paso.", ejemplo: "First, turn on the computer. Then, enter your username.", etiquetas: ["conector"] },
          { termino: "After that / Next", definicion: "Conectores: después de eso / a continuación — pasos intermedios.", ejemplo: "After that, open the application.", etiquetas: ["conector"] },
          { termino: "Finally", definicion: "Conector: finalmente — para el último paso.", ejemplo: "Finally, save your work.", etiquetas: ["conector"] },
          { termino: "instructions vocabulary", definicion: "Verbos comunes en instrucciones: click, press, add, mix, cut, turn on/off.", ejemplo: "Press the button and then add your name.", etiquetas: ["vocabulario"] },
        ],
        actividad_final: "Escribe las instrucciones para preparar tu bebida favorita (5 pasos) usando First, Then, After that y Finally.",
      },
    },
    {
      titulo: "Fill in the blanks — Step-by-step instructions",
      descripcion: "Completa con el imperativo correcto y los conectores secuenciales.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con imperativos (verbo base) o conectores secuenciales (First, Then, After that, Finally).",
        texto_con_huecos: "How to make hot chocolate: ___, heat the milk in a pot. ___ add two spoons of chocolate powder. ___ that, ___ well with a spoon. Finally, pour it into a cup.",
        huecos: [
          { posicion: 0, respuesta_correcta: "First", alternativas_aceptadas: ["first"], pista: "Conector para el primer paso: ___." },
          { posicion: 1, respuesta_correcta: "Then", alternativas_aceptadas: ["then", "Next", "next"], pista: "Conector para el siguiente paso: ___." },
          { posicion: 2, respuesta_correcta: "After", alternativas_aceptadas: ["after"], pista: "___ that = después de eso." },
          { posicion: 3, respuesta_correcta: "mix", alternativas_aceptadas: ["stir"], pista: "Imperativo: ___ well (revolver / mezclar bien)." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Self-check — Giving & following instructions",
      descripcion: "Autoevaluación de tu habilidad para dar y entender instrucciones en inglés.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Uso imperativos afirmativos para dar instrucciones (Open, Press, Add).", escala: escala4 },
          { descripcion: "Uso el imperativo negativo (Don't + verbo) para advertir o prohibir.", escala: escala4 },
          { descripcion: "Organizo los pasos con First, Then, After that y Finally.", escala: escala4 },
          { descripcion: "Entiendo instrucciones escritas o habladas con estos conectores.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué instrucciones (receta, proceso escolar, juego) ya podrías explicar paso a paso en inglés?",
      },
    },
  ],

  // ════════════ P07 — Relatar eventos cotidianos y su secuencia ════════════
  [
    {
      titulo: "True or False — Narrating events",
      descripcion: "Decide si cada afirmación sobre el pasado simple irregular y los conectores narrativos es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "'Then', 'after', 'later' y 'suddenly' son conectores narrativos en inglés.", respuesta: true, retroalimentacion: "Sí: conectan y ordenan eventos en una narración." },
          { enunciado: "'Suddenly' indica que algo ocurrió gradualmente.", respuesta: false, retroalimentacion: "'Suddenly' significa 'de repente' — algo inesperado o rápido." },
          { enunciado: "'Went', 'saw', 'ate' y 'woke up' son formas irregulares del pasado simple.", respuesta: true, retroalimentacion: "Correcto: go→went, see→saw, eat→ate, wake up→woke up." },
          { enunciado: "Para narrar una secuencia de eventos pasados se usa el presente simple.", respuesta: false, retroalimentacion: "Para narrar eventos pasados se usa el pasado simple, no el presente." },
          { enunciado: "'Later' puede usarse para indicar que algo ocurrió después de un tiempo.", respuesta: true, retroalimentacion: "Correcto: 'Later, we went home' = más tarde, fuimos a casa." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glossary — Irregular past & narrative connectors",
      descripcion: "Glosario interactivo de verbos irregulares frecuentes y conectores narrativos.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "then / after", definicion: "Conectores: luego / después — para el siguiente evento en la historia.", ejemplo: "I finished school. Then I went to the park.", etiquetas: ["conector"] },
          { termino: "later / afterwards", definicion: "Conectores: más tarde / después — para un evento posterior.", ejemplo: "Later, we had dinner at home.", etiquetas: ["conector"] },
          { termino: "suddenly / all of a sudden", definicion: "De repente — para eventos inesperados.", ejemplo: "Suddenly, it started to rain.", etiquetas: ["conector"] },
          { termino: "irregular verbs (list)", definicion: "Irregulares frecuentes: go→went, see→saw, eat→ate, buy→bought, meet→met, take→took.", ejemplo: "We met our friends and took a bus.", etiquetas: ["gramática"] },
          { termino: "while / when", definicion: "Mientras / cuando — para situar dos eventos simultáneos o relacionados.", ejemplo: "I was reading when the phone rang.", etiquetas: ["conector"] },
          { termino: "at the end / in the end", definicion: "Al final (de un evento o historia).", ejemplo: "In the end, we decided to stay home.", etiquetas: ["conector"] },
        ],
        actividad_final: "Narra en 6 oraciones lo que hiciste el fin de semana pasado. Usa al menos 4 verbos irregulares y 3 conectores narrativos.",
      },
    },
    {
      titulo: "Fill in the blanks — My weekend story",
      descripcion: "Completa la narración con verbos irregulares en pasado y conectores narrativos.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el pasado simple del verbo entre paréntesis o con el conector narrativo correcto.",
        texto_con_huecos: "Last Saturday I ___ up late. Then I ___ breakfast and met my friends at the market. We ___ some fruit and juice. Suddenly, it ___ to rain, so we ran inside a café.",
        huecos: [
          { posicion: 0, respuesta_correcta: "woke", alternativas_aceptadas: ["got"], pista: "Pasado irregular de 'wake up' (despertar): wake → ___." },
          { posicion: 1, respuesta_correcta: "had", alternativas_aceptadas: ["ate"], pista: "Pasado irregular de 'have' (desayunar): have → ___." },
          { posicion: 2, respuesta_correcta: "bought", alternativas_aceptadas: ["ate"], pista: "Pasado irregular de 'buy' (comprar): buy → ___." },
          { posicion: 3, respuesta_correcta: "started", alternativas_aceptadas: ["began"], pista: "Pasado de 'start' (empezar): regular → start + ___." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Self-check — Narrating everyday events",
      descripcion: "Autoevaluación de tu habilidad para narrar eventos cotidianos en inglés.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Uso verbos irregulares en pasado correctamente (went, saw, bought, woke).", escala: escala4 },
          { descripcion: "Conecto eventos con then, after, later y suddenly.", escala: escala4 },
          { descripcion: "Puedo narrar una secuencia de eventos del pasado en orden lógico.", escala: escala4 },
          { descripcion: "Uso 'when' y 'while' para relacionar dos eventos simultáneos.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué evento o anécdota de tu vida ya puedes narrar en inglés usando verbos irregulares y conectores?",
      },
    },
  ],

  // ════════════ P08 — Consolidación ════════════
  [
    {
      titulo: "True or False — Review IN-III",
      descripcion: "Decide si cada afirmación de repaso integra los temas de Inglés III: presente perfecto, pasado simple, conectores y modales.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "El presente perfecto (have/has + past participle) describe experiencias sin tiempo específico.", respuesta: true, retroalimentacion: "Correcto: I have visited Oaxaca (sin decir cuándo exactamente)." },
          { enunciado: "Cuando digo 'I visited Oaxaca last year', debo usar presente perfecto.", respuesta: false, retroalimentacion: "No: 'last year' es tiempo específico → pasado simple: 'I visited Oaxaca last year'." },
          { enunciado: "'Must' y 'have to' expresan obligación; 'mustn't' expresa prohibición.", respuesta: true, retroalimentacion: "Correcto: distínguelos de 'don't have to' (no obligatorio)." },
          { enunciado: "Los conectores 'first, then, after that, finally' solo se usan en el pasado.", respuesta: false, retroalimentacion: "No: también se usan para instrucciones en presente (recetas, procesos)." },
          { enunciado: "'Suddenly' y 'later' son conectores narrativos útiles para relatar eventos.", respuesta: true, retroalimentacion: "Sí: organizan y enriquecen la narración de eventos pasados." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glossary — Consolidation IN-III",
      descripcion: "Glosario integrador de los temas clave de Inglés III: perfecto, pasado, modales y conectores.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "Present Perfect vs. Past Simple", definicion: "Perfecto = experiencia sin tiempo fijo. Pasado simple = tiempo específico.", ejemplo: "I have been to Cancún. / I went to Cancún in 2023.", etiquetas: ["gramática"] },
          { termino: "must / have to / mustn't / don't have to", definicion: "Modales: obligación, prohibición y ausencia de obligación.", ejemplo: "You must wear a seatbelt. You don't have to come early.", etiquetas: ["modales"] },
          { termino: "Narrative connectors", definicion: "Conectores de narración: then, after, later, suddenly, in the end.", ejemplo: "Then I saw him. Suddenly, the lights went out.", etiquetas: ["conector"] },
          { termino: "Sequential connectors", definicion: "Conectores de instrucción: first, then, after that, finally.", ejemplo: "First, open the file. Finally, save and close.", etiquetas: ["conector"] },
          { termino: "Comparatives & superlatives", definicion: "Revisar: -er than / more...than y the -est / the most.", ejemplo: "This route is shorter and the most efficient.", etiquetas: ["gramática"] },
          { termino: "should / can (recommendations & possibility)", definicion: "Should para recomendar; can para posibilidad o habilidad.", ejemplo: "You should visit the market. You can rent a bike there.", etiquetas: ["modales"] },
        ],
        actividad_final: "Elige 3 temas de IN-III y escribe 2 oraciones de ejemplo para cada uno que muestren que los entiendes.",
      },
    },
    {
      titulo: "Fill in the blanks — Putting it all together",
      descripcion: "Repaso integrado: completa con el tiempo, modal o conector correcto.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos eligiendo el tiempo verbal, modal o conector más adecuado según el contexto.",
        texto_con_huecos: "I ___ visited Guadalajara twice — it is a beautiful city. When I went last summer, I ___ the cathedral and the market. At school, students ___ use their phones during class. ___, we can review everything we learned this semester.",
        huecos: [
          { posicion: 0, respuesta_correcta: "have", alternativas_aceptadas: [], pista: "Presente perfecto: I ___ visited (experiencia, sin tiempo fijo)." },
          { posicion: 1, respuesta_correcta: "visited", alternativas_aceptadas: ["saw"], pista: "Tiempo específico ('last summer') → pasado simple: I ___ the cathedral." },
          { posicion: 2, respuesta_correcta: "mustn't", alternativas_aceptadas: ["must not", "cannot", "can't"], pista: "Prohibición en la escuela: students ___ use phones." },
          { posicion: 3, respuesta_correcta: "Finally", alternativas_aceptadas: ["finally", "Now", "now"], pista: "Conector para el último paso o conclusión: ___." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Self-check — Consolidating my English III",
      descripcion: "Autoevaluación de tu dominio general de los aprendizajes clave de Inglés III.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio. Es un repaso general del semestre.",
        criterios: [
          { descripcion: "Distingo y uso el presente perfecto y el pasado simple correctamente.", escala: escala4 },
          { descripcion: "Expreso obligación, prohibición y ausencia de obligación (must/have to/don't have to).", escala: escala4 },
          { descripcion: "Narro eventos con conectores (then, after, later, suddenly) y doy instrucciones con first/finally.", escala: escala4 },
          { descripcion: "Describo lugares, hábitos y preferencias usando comparativos y superlativos.", escala: escala4 },
        ],
        reflexion_final_prompt: "De todo lo que aprendiste en Inglés III, ¿qué tema dominas mejor y cuál seguirás practicando?",
      },
    },
  ],
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });

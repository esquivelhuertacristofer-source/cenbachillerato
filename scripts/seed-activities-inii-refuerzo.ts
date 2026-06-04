/**
 * Refuerzo de actividades para IN-II (Inglés II — A1+) según la "Plantilla CEN por UAC".
 * Agrega A4-A7 a cada una de las 8 progresiones (ya tienen A1-A3):
 *   A4 = quiz_verdadero_falso · A5 = glosario_interactivo · A6 = fill_blanks · A7 = autoevaluacion
 * 8 progresiones × 4 = 32 actividades nuevas. estado='borrador'.
 * Alineado al programa oficial de Inglés II (A1+ MCER; intercambiar información básica
 * sobre la vida cotidiana). Contenido bilingüe (andamiaje en español, lengua meta en inglés).
 * Uso: npx tsx scripts/seed-activities-inii-refuerzo.ts
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
  log("\n🌱 Refuerzo IN-II — Inglés II (A1+): A4-A7 por progresión\n");

  const progs = await getProgresionesDeUAC(sb, "IN-II");
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

  log(`\n✅ IN-II refuerzo: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── REFUERZOS POR PROGRESIÓN ───────────────────────────────────────────────────

const refuerzos: Refuerzo[][] = [
  // ════════════ P01 — Daily routines (presente simple afirmativo) ════════════
  [
    {
      titulo: "True or False — Daily routines",
      descripcion: "Decide si cada afirmación sobre el presente simple y los adverbios de frecuencia es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "Con 'he' y 'she' el verbo en presente simple lleva -s ('She gets up at 7').", respuesta: true, retroalimentacion: "Correcto: 3ª persona singular agrega -s: works, plays, gets up." },
          { enunciado: "'Always', 'usually', 'sometimes' y 'never' son adverbios de frecuencia.", respuesta: true, retroalimentacion: "Sí: indican qué tan seguido haces algo." },
          { enunciado: "El adverbio de frecuencia va después del verbo principal ('I get up always').", respuesta: false, retroalimentacion: "Va ANTES del verbo principal: 'I always get up early'." },
          { enunciado: "'I go to school every day' está en presente simple afirmativo.", respuesta: true, retroalimentacion: "Correcto: describe una rutina habitual." },
          { enunciado: "Con 'I' y 'you' el verbo agrega -s ('I works').", respuesta: false, retroalimentacion: "No: solo he/she/it agregan -s. Es 'I work'." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glossary — Daily routines & frequency",
      descripcion: "Glosario interactivo de rutinas diarias, adverbios de frecuencia y expresiones de tiempo.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "to get up", definicion: "Levantarse de la cama.", ejemplo: "I get up at 6:30.", etiquetas: ["rutina"] },
          { termino: "always / usually / sometimes / never", definicion: "Adverbios de frecuencia (siempre / usualmente / a veces / nunca).", ejemplo: "She always has breakfast.", etiquetas: ["frecuencia"] },
          { termino: "to have breakfast", definicion: "Desayunar.", ejemplo: "We have breakfast at 7.", etiquetas: ["rutina"] },
          { termino: "to do homework", definicion: "Hacer la tarea.", ejemplo: "He does his homework after school.", etiquetas: ["escuela"] },
          { termino: "every day / on weekends", definicion: "Expresiones de tiempo: todos los días / los fines de semana.", ejemplo: "I study English every day.", etiquetas: ["tiempo"] },
          { termino: "3rd person -s", definicion: "Con he/she/it el verbo agrega -s en presente simple.", ejemplo: "She gets up early.", etiquetas: ["gramática"] },
        ],
        actividad_final: "Escribe 4 oraciones sobre tu rutina diaria usando un adverbio de frecuencia en cada una.",
      },
    },
    {
      titulo: "Fill in the blanks — My daily routine",
      descripcion: "Completa el texto con el presente simple y los adverbios de frecuencia correctos.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos. Cuida la -s de la 3ª persona y la posición del adverbio de frecuencia.",
        texto_con_huecos: "Every day Ana ___ up at six. She ___ has breakfast with her family. After school, she ___ her homework. She ___ goes to bed late because she likes to sleep.",
        huecos: [
          { posicion: 0, respuesta_correcta: "gets", alternativas_aceptadas: ["wakes"], pista: "3ª persona de 'get up' (levantarse): get + ___" },
          { posicion: 1, respuesta_correcta: "always", alternativas_aceptadas: ["usually"], pista: "Adverbio de frecuencia: lo hace el 100% de las veces." },
          { posicion: 2, respuesta_correcta: "does", alternativas_aceptadas: [], pista: "3ª persona de 'do' (hacer la tarea)." },
          { posicion: 3, respuesta_correcta: "never", alternativas_aceptadas: [], pista: "Adverbio de frecuencia: el 0% de las veces (no se acuesta tarde)." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Self-check — Describing daily routines",
      descripcion: "Autoevaluación de tu habilidad para describir rutinas diarias en inglés.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio. No es una calificación: es para saber qué reforzar.",
        criterios: [
          { descripcion: "Puedo describir mi rutina diaria en presente simple.", escala: escala4 },
          { descripcion: "Uso correctamente la -s de la 3ª persona (he/she gets up).", escala: escala4 },
          { descripcion: "Coloco bien los adverbios de frecuencia (always, usually, never).", escala: escala4 },
          { descripcion: "Uso expresiones de tiempo y horarios (at 7, every day).", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué parte de tu rutina ya puedes describir en inglés y cuál te falta?",
      },
    },
  ],

  // ════════════ P02 — What others do in free time (negativo, do/does) ════════════
  [
    {
      titulo: "True or False — Free time & negatives",
      descripcion: "Decide si cada afirmación sobre el presente simple negativo y las preguntas con do/does es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "Con he/she la negación se forma con 'doesn't' + verbo base ('He doesn't play').", respuesta: true, retroalimentacion: "Correcto: doesn't + verbo SIN -s." },
          { enunciado: "'Does she like soccer?' es una pregunta correcta en presente simple.", respuesta: true, retroalimentacion: "Sí: Does + sujeto + verbo base." },
          { enunciado: "La respuesta corta a 'Do you read?' es 'Yes, I read'.", respuesta: false, retroalimentacion: "La respuesta corta es 'Yes, I do' / 'No, I don't'." },
          { enunciado: "Después de 'doesn't' el verbo lleva -s ('She doesn't plays').", respuesta: false, retroalimentacion: "No: tras don't/doesn't el verbo va en forma base: 'She doesn't play'." },
          { enunciado: "'They don't watch TV' es presente simple negativo.", respuesta: true, retroalimentacion: "Correcto: don't para I/you/we/they." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glossary — Free time & hobbies",
      descripcion: "Glosario interactivo de pasatiempos y de las preguntas con do/does.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "don't / doesn't", definicion: "Formas negativas del presente simple (do not / does not).", ejemplo: "He doesn't dance.", etiquetas: ["gramática"] },
          { termino: "Do / Does ...?", definicion: "Auxiliares para hacer preguntas en presente simple.", ejemplo: "Does she play tennis?", etiquetas: ["pregunta"] },
          { termino: "short answers", definicion: "Respuestas cortas: Yes, I do / No, he doesn't.", ejemplo: "Do you read? — Yes, I do.", etiquetas: ["respuesta"] },
          { termino: "hobby", definicion: "Pasatiempo, actividad de ocio.", ejemplo: "My hobby is drawing.", etiquetas: ["ocio"] },
          { termino: "to hang out", definicion: "Pasar el rato con amigos.", ejemplo: "They hang out on weekends.", etiquetas: ["ocio"] },
          { termino: "to play video games", definicion: "Jugar videojuegos.", ejemplo: "He plays video games after school.", etiquetas: ["ocio"] },
        ],
        actividad_final: "Escribe 3 preguntas con Do/Does sobre los pasatiempos de un compañero, con sus respuestas cortas.",
      },
    },
    {
      titulo: "Fill in the blanks — Negatives & questions",
      descripcion: "Completa con do/does, don't/doesn't y la forma correcta del verbo.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con do, does, don't o doesn't. Recuerda: tras estos auxiliares el verbo va en forma base.",
        texto_con_huecos: "___ your brother play soccer? No, he ___ . He likes basketball. My sisters ___ watch TV; they read books. ___ you like reading too?",
        huecos: [
          { posicion: 0, respuesta_correcta: "Does", alternativas_aceptadas: ["does"], pista: "Pregunta con 'your brother' (3ª persona singular)." },
          { posicion: 1, respuesta_correcta: "doesn't", alternativas_aceptadas: ["does not"], pista: "Respuesta corta negativa para 'he'." },
          { posicion: 2, respuesta_correcta: "don't", alternativas_aceptadas: ["do not"], pista: "Negativo para 'my sisters' (plural)." },
          { posicion: 3, respuesta_correcta: "Do", alternativas_aceptadas: ["do"], pista: "Pregunta con 'you'." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Self-check — Talking about free time",
      descripcion: "Autoevaluación de tu habilidad para hablar de lo que otros hacen en su tiempo libre.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Formo oraciones negativas con don't / doesn't.", escala: escala4 },
          { descripcion: "Hago preguntas con Do / Does correctamente.", escala: escala4 },
          { descripcion: "Doy respuestas cortas (Yes, I do / No, he doesn't).", escala: escala4 },
          { descripcion: "Conozco vocabulario de pasatiempos y actividades de ocio.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué pasatiempo de un familiar o amigo ya puedes describir en inglés?",
      },
    },
  ],

  // ════════════ P03 — Abilities & permission (can/can't) ════════════
  [
    {
      titulo: "True or False — Can & can't",
      descripcion: "Decide si cada afirmación sobre 'can/can't' (habilidad y permiso) es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "Después de 'can' el verbo va en forma base ('She can swim').", respuesta: true, retroalimentacion: "Correcto: can + verbo base, sin -s ni 'to'." },
          { enunciado: "'Can' sirve para hablar de habilidad y también para pedir permiso.", respuesta: true, retroalimentacion: "Sí: 'I can cook' (habilidad) / 'Can I go out?' (permiso)." },
          { enunciado: "'Can't' es la forma negativa de 'can' (cannot).", respuesta: true, retroalimentacion: "Correcto: can't = cannot." },
          { enunciado: "'In the morning' significa 'en la noche'.", respuesta: false, retroalimentacion: "'In the morning' = en la mañana; 'at night' = en la noche." },
          { enunciado: "Para preguntar usamos 'Do you can...?'.", respuesta: false, retroalimentacion: "No: es 'Can you...?' (can va al inicio, sin do)." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glossary — Abilities, permission & time of day",
      descripcion: "Glosario interactivo de can/can't, habilidades comunes y momentos del día.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "can / can't", definicion: "Verbo modal para habilidad y permiso (poder / no poder).", ejemplo: "I can swim. I can't drive.", etiquetas: ["gramática"] },
          { termino: "to play the guitar", definicion: "Tocar la guitarra.", ejemplo: "She can play the guitar.", etiquetas: ["habilidad"] },
          { termino: "to cook / to swim", definicion: "Cocinar / nadar (habilidades comunes).", ejemplo: "Can you cook? — Yes, I can.", etiquetas: ["habilidad"] },
          { termino: "in the morning / at night", definicion: "Momentos del día: en la mañana / en la noche.", ejemplo: "I study at night.", etiquetas: ["tiempo"] },
          { termino: "days of the week", definicion: "Días de la semana: Monday, Tuesday, Wednesday...", ejemplo: "We have English on Monday.", etiquetas: ["tiempo"] },
          { termino: "Can I...?", definicion: "Forma de pedir permiso de manera cortés.", ejemplo: "Can I open the window?", etiquetas: ["permiso"] },
        ],
        actividad_final: "Escribe 3 cosas que puedes hacer (can) y 2 que no puedes (can't).",
      },
    },
    {
      titulo: "Fill in the blanks — What can you do?",
      descripcion: "Completa con can / can't y expresiones de momentos del día.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con can o can't, y con las expresiones de tiempo correctas.",
        texto_con_huecos: "Leo ___ play the guitar very well, but he ___ swim. He practices music ___ the morning. ___ I borrow your pen, please?",
        huecos: [
          { posicion: 0, respuesta_correcta: "can", alternativas_aceptadas: [], pista: "Habilidad afirmativa: sí puede tocar la guitarra." },
          { posicion: 1, respuesta_correcta: "can't", alternativas_aceptadas: ["cannot", "can not"], pista: "Habilidad negativa: no puede nadar." },
          { posicion: 2, respuesta_correcta: "in", alternativas_aceptadas: [], pista: "Preposición para 'the morning': ___ the morning." },
          { posicion: 3, respuesta_correcta: "Can", alternativas_aceptadas: ["can"], pista: "Pedir permiso de forma cortés." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Self-check — Abilities & permission",
      descripcion: "Autoevaluación de tu habilidad para expresar habilidades y pedir permiso en inglés.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Uso 'can' y 'can't' para hablar de habilidades.", escala: escala4 },
          { descripcion: "Pido permiso de forma cortés con 'Can I...?'.", escala: escala4 },
          { descripcion: "Hago preguntas y doy respuestas cortas con can (Yes, I can / No, I can't).", escala: escala4 },
          { descripcion: "Uso los momentos del día (in the morning, at night).", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué habilidad tuya ya puedes expresar en inglés con 'I can...'?",
      },
    },
  ],

  // ════════════ P04 — Describing people, clothing, weather ════════════
  [
    {
      titulo: "True or False — People, clothes & weather",
      descripcion: "Decide si cada afirmación sobre describir personas, ropa y clima es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "El present continuous se usa para describir lo que alguien lleva puesto ahora ('She is wearing a coat').", respuesta: true, retroalimentacion: "Correcto: is/are + verbo-ing para acciones en curso." },
          { enunciado: "'His', 'her' y 'their' son adjetivos posesivos.", respuesta: true, retroalimentacion: "Sí: his (de él), her (de ella), their (de ellos)." },
          { enunciado: "Con 'he' y 'she' se usa 'have' ('She have brown eyes').", respuesta: false, retroalimentacion: "No: con he/she se usa 'has': 'She has brown eyes'." },
          { enunciado: "'It is sunny' describe el clima soleado.", respuesta: true, retroalimentacion: "Correcto: sunny = soleado." },
          { enunciado: "'Winter', 'spring', 'summer' y 'autumn/fall' son las estaciones del año.", respuesta: true, retroalimentacion: "Sí: invierno, primavera, verano y otoño." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glossary — Appearance, clothes & weather",
      descripcion: "Glosario interactivo de características físicas, vestimenta, clima y estaciones.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "to have / has", definicion: "Tener; describe rasgos físicos (he/she usa 'has').", ejemplo: "She has long hair.", etiquetas: ["apariencia"] },
          { termino: "his / her / their", definicion: "Adjetivos posesivos (de él / de ella / de ellos).", ejemplo: "Her dress is red.", etiquetas: ["posesivo"] },
          { termino: "is wearing", definicion: "Present continuous para la ropa que lleva alguien.", ejemplo: "He is wearing a jacket.", etiquetas: ["ropa"] },
          { termino: "T-shirt / jeans / jacket", definicion: "Prendas de vestir: playera / jeans / chamarra.", ejemplo: "I like your jacket.", etiquetas: ["ropa"] },
          { termino: "sunny / cloudy / rainy / windy", definicion: "Adjetivos de clima: soleado / nublado / lluvioso / ventoso.", ejemplo: "Today it is windy.", etiquetas: ["clima"] },
          { termino: "seasons", definicion: "Estaciones: spring, summer, autumn/fall, winter.", ejemplo: "In summer it is hot.", etiquetas: ["clima"] },
        ],
        actividad_final: "Describe a una persona (apariencia + ropa) y el clima de hoy en inglés.",
      },
    },
    {
      titulo: "Fill in the blanks — Describing a friend",
      descripcion: "Completa con have/has, adjetivos posesivos y present continuous.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con la forma correcta del verbo o el posesivo adecuado.",
        texto_con_huecos: "This is my friend Mia. She ___ short black hair. Today she ___ wearing a blue jacket because it is ___ outside. I like ___ jacket a lot.",
        huecos: [
          { posicion: 0, respuesta_correcta: "has", alternativas_aceptadas: [], pista: "Con 'she' el verbo 'have' cambia a ___." },
          { posicion: 1, respuesta_correcta: "is", alternativas_aceptadas: [], pista: "Present continuous: she ___ wearing." },
          { posicion: 2, respuesta_correcta: "cold", alternativas_aceptadas: ["windy", "cloudy", "rainy"], pista: "Adjetivo de clima frío (razón para usar chamarra)." },
          { posicion: 3, respuesta_correcta: "her", alternativas_aceptadas: [], pista: "Adjetivo posesivo de ella (la chamarra es de Mia)." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Self-check — Describing people & weather",
      descripcion: "Autoevaluación de tu habilidad para describir personas, ropa y clima en inglés.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Describo características físicas usando have/has.", escala: escala4 },
          { descripcion: "Uso adjetivos posesivos (his, her, their) correctamente.", escala: escala4 },
          { descripcion: "Uso 'is/are wearing' para describir la vestimenta.", escala: escala4 },
          { descripcion: "Describo el clima y las estaciones con adjetivos en inglés.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Cómo describirías a un compañero de forma respetuosa en inglés?",
      },
    },
  ],

  // ════════════ P05 — Comparatives ════════════
  [
    {
      titulo: "True or False — Comparatives",
      descripcion: "Decide si cada afirmación sobre los comparativos es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "Los adjetivos cortos forman el comparativo con -er + than ('bigger than').", respuesta: true, retroalimentacion: "Correcto: big → bigger than." },
          { enunciado: "Los adjetivos largos usan 'more ... than' ('more interesting than').", respuesta: true, retroalimentacion: "Sí: con adjetivos de 2+ sílabas se usa 'more'." },
          { enunciado: "'Bigger more than' es la forma correcta del comparativo.", respuesta: false, retroalimentacion: "No: o usas -er (bigger than) o 'more' (more interesting), nunca ambos." },
          { enunciado: "En el comparativo se usa la palabra 'than' para comparar dos cosas.", respuesta: true, retroalimentacion: "Correcto: A is taller THAN B." },
          { enunciado: "'Good' tiene un comparativo irregular: 'better'.", respuesta: true, retroalimentacion: "Sí: good → better than (no 'gooder')." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glossary — Comparatives",
      descripcion: "Glosario interactivo de comparativos de adjetivos de una y dos sílabas.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "-er + than", definicion: "Comparativo de adjetivos cortos (1 sílaba).", ejemplo: "An elephant is bigger than a dog.", etiquetas: ["gramática"] },
          { termino: "more + adjective + than", definicion: "Comparativo de adjetivos largos (2+ sílabas).", ejemplo: "This book is more interesting than that one.", etiquetas: ["gramática"] },
          { termino: "than", definicion: "Palabra que conecta los dos elementos comparados (que).", ejemplo: "She is taller than me.", etiquetas: ["gramática"] },
          { termino: "better / worse", definicion: "Comparativos irregulares de good / bad.", ejemplo: "Today is better than yesterday.", etiquetas: ["irregular"] },
          { termino: "cheaper / more expensive", definicion: "Más barato / más caro (para comparar precios).", ejemplo: "The blue shirt is cheaper than the red one.", etiquetas: ["preferencia"] },
          { termino: "I prefer", definicion: "Prefiero (para expresar elecciones).", ejemplo: "I prefer tea to coffee.", etiquetas: ["preferencia"] },
        ],
        actividad_final: "Escribe 4 oraciones comparando personas, lugares u objetos (2 con -er y 2 con 'more').",
      },
    },
    {
      titulo: "Fill in the blanks — Comparing things",
      descripcion: "Completa con el comparativo correcto (-er than o more ... than).",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el comparativo correcto del adjetivo entre paréntesis.",
        texto_con_huecos: "A train is ___ than a bus (fast). My city is ___ than your town (big). This movie is ___ than that one (interesting). For me, summer is ___ than winter (good).",
        huecos: [
          { posicion: 0, respuesta_correcta: "faster", alternativas_aceptadas: [], pista: "Adjetivo corto: fast + -er." },
          { posicion: 1, respuesta_correcta: "bigger", alternativas_aceptadas: [], pista: "Adjetivo corto que duplica la consonante: big → ___." },
          { posicion: 2, respuesta_correcta: "more interesting", alternativas_aceptadas: [], pista: "Adjetivo largo (4 sílabas): usa 'more'." },
          { posicion: 3, respuesta_correcta: "better", alternativas_aceptadas: [], pista: "Comparativo irregular de 'good'." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Self-check — Comparing people & things",
      descripcion: "Autoevaluación de tu habilidad para comparar personas, lugares y objetos en inglés.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Formo comparativos de adjetivos cortos con -er + than.", escala: escala4 },
          { descripcion: "Formo comparativos de adjetivos largos con 'more ... than'.", escala: escala4 },
          { descripcion: "Conozco comparativos irregulares (better, worse).", escala: escala4 },
          { descripcion: "Expreso preferencias y elecciones (I prefer, I like ... more).", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué dos cosas de tu vida diaria puedes comparar ya en inglés?",
      },
    },
  ],

  // ════════════ P06 — Directions ════════════
  [
    {
      titulo: "True or False — Directions",
      descripcion: "Decide si cada afirmación sobre dar indicaciones es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "'Go straight' y 'turn left' son imperativos para dar indicaciones.", respuesta: true, retroalimentacion: "Correcto: el imperativo usa el verbo base sin sujeto." },
          { enunciado: "'Turn right' significa 'da vuelta a la izquierda'.", respuesta: false, retroalimentacion: "'Turn right' = da vuelta a la derecha; 'turn left' = a la izquierda." },
          { enunciado: "'There is' se usa para singular y 'There are' para plural.", respuesta: true, retroalimentacion: "Sí: There is a park / There are two banks." },
          { enunciado: "'Next to' significa 'al lado de'.", respuesta: true, retroalimentacion: "Correcto: next to = junto a / al lado de." },
          { enunciado: "'Across from' significa 'detrás de'.", respuesta: false, retroalimentacion: "'Across from' = enfrente de / cruzando; 'behind' = detrás de." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glossary — Directions & places",
      descripcion: "Glosario interactivo de imperativos, preposiciones de movimiento y lugares en la ciudad.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "go straight", definicion: "Imperativo: sigue derecho/recto.", ejemplo: "Go straight for two blocks.", etiquetas: ["indicación"] },
          { termino: "turn left / turn right", definicion: "Imperativos: da vuelta a la izquierda / derecha.", ejemplo: "Turn left at the corner.", etiquetas: ["indicación"] },
          { termino: "next to / across from", definicion: "Preposiciones de lugar: al lado de / enfrente de.", ejemplo: "The bank is next to the school.", etiquetas: ["lugar"] },
          { termino: "into / across", definicion: "Preposiciones de movimiento: hacia dentro de / a través de.", ejemplo: "Walk across the street.", etiquetas: ["movimiento"] },
          { termino: "places in town", definicion: "Lugares en la ciudad: park, hospital, market, bus station.", ejemplo: "There is a market near my house.", etiquetas: ["lugar"] },
          { termino: "by bus / on foot", definicion: "Medios de transporte: en autobús / a pie.", ejemplo: "I go to school by bus.", etiquetas: ["transporte"] },
        ],
        actividad_final: "Escribe indicaciones de tu casa a la escuela usando 3 imperativos y 2 preposiciones de lugar.",
      },
    },
    {
      titulo: "Fill in the blanks — Giving directions",
      descripcion: "Completa con imperativos, there is/are y preposiciones de lugar.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos para dar indicaciones claras hacia el hospital.",
        texto_con_huecos: "Excuse me, where is the hospital? Go ___ for two blocks, then turn ___ at the bank. ___ a big park next to it. The hospital is across ___ the park.",
        huecos: [
          { posicion: 0, respuesta_correcta: "straight", alternativas_aceptadas: ["ahead"], pista: "Imperativo: seguir derecho." },
          { posicion: 1, respuesta_correcta: "left", alternativas_aceptadas: ["right"], pista: "Dirección al dar vuelta (izquierda o derecha)." },
          { posicion: 2, respuesta_correcta: "There is", alternativas_aceptadas: ["there is", "There's"], pista: "Para indicar que hay UN parque (singular)." },
          { posicion: 3, respuesta_correcta: "from", alternativas_aceptadas: [], pista: "'across ___' = enfrente de, cruzando." },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Self-check — Asking & giving directions",
      descripcion: "Autoevaluación de tu habilidad para pedir y dar indicaciones en inglés.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Doy indicaciones usando imperativos (go straight, turn left).", escala: escala4 },
          { descripcion: "Uso 'There is / There are' para describir lo que hay en un lugar.", escala: escala4 },
          { descripcion: "Uso preposiciones de lugar y movimiento (next to, across, into).", escala: escala4 },
          { descripcion: "Conozco vocabulario de lugares en la ciudad y de transporte.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿A qué lugar de tu comunidad podrías dar indicaciones en inglés?",
      },
    },
  ],

  // ════════════ P07 — Everyday exchanges about needs (would like, how much/many) ════════════
  [
    {
      titulo: "True or False — Would like & quantities",
      descripcion: "Decide si cada afirmación sobre 'would like' y cantidades es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "'I'd like a coffee' es una forma cortés de pedir algo.", respuesta: true, retroalimentacion: "Correcto: would like = querría/me gustaría (más cortés que 'I want')." },
          { enunciado: "Después de 'would like' un verbo va en infinitivo con 'to' ('I'd like to go').", respuesta: true, retroalimentacion: "Sí: would like + to + verbo." },
          { enunciado: "'How many' se usa con sustantivos incontables como water.", respuesta: false, retroalimentacion: "'How many' es para contables; 'how much' para incontables (how much water)." },
          { enunciado: "'How much' se usa para preguntar precios.", respuesta: true, retroalimentacion: "Sí: 'How much is it?' = ¿cuánto cuesta?" },
          { enunciado: "'Apples' y 'eggs' son sustantivos contables.", respuesta: true, retroalimentacion: "Correcto: se pueden contar (two apples, three eggs)." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glossary — Needs, food & quantities",
      descripcion: "Glosario interactivo de 'would like', contables/incontables, alimentos, precios y cantidades.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "I'd like (would like)", definicion: "Forma cortés de pedir algo o expresar un deseo.", ejemplo: "I'd like a sandwich, please.", etiquetas: ["cortesía"] },
          { termino: "would like + to + verb", definicion: "Para expresar un deseo de hacer algo.", ejemplo: "I'd like to go to the park.", etiquetas: ["gramática"] },
          { termino: "How much / How many", definicion: "Cantidad: how much (incontable) / how many (contable).", ejemplo: "How many apples? How much milk?", etiquetas: ["cantidad"] },
          { termino: "countable / uncountable", definicion: "Sustantivos contables (apples) e incontables (water, rice).", ejemplo: "Water is uncountable.", etiquetas: ["gramática"] },
          { termino: "food & drinks", definicion: "Alimentos y bebidas: bread, milk, coffee, juice.", ejemplo: "I'd like a glass of juice.", etiquetas: ["comida"] },
          { termino: "How much is it?", definicion: "¿Cuánto cuesta? (para preguntar precios).", ejemplo: "How much is it? — It's 20 pesos.", etiquetas: ["precio"] },
        ],
        actividad_final: "Escribe un mini-diálogo en una tienda usando 'I'd like', 'how much' y 'how many'.",
      },
    },
    {
      titulo: "Fill in the blanks — At the café",
      descripcion: "Completa con would like, how much / how many y contables/incontables.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos para este diálogo en un café.",
        texto_con_huecos: "Waiter: Hello! What would you ___ ? Customer: I'd ___ a coffee and a sandwich, please. Waiter: How ___ sandwiches? Customer: Two, please. How ___ is it?",
        huecos: [
          { posicion: 0, respuesta_correcta: "like", alternativas_aceptadas: [], pista: "What would you ___ ? (forma cortés de '¿qué desea?')." },
          { posicion: 1, respuesta_correcta: "like", alternativas_aceptadas: [], pista: "I'd ___ = me gustaría." },
          { posicion: 2, respuesta_correcta: "many", alternativas_aceptadas: [], pista: "Sandwiches es CONTABLE: how ___ ." },
          { posicion: 3, respuesta_correcta: "much", alternativas_aceptadas: [], pista: "Preguntar el precio total: how ___ is it?" },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Self-check — Everyday needs",
      descripcion: "Autoevaluación de tu habilidad para resolver intercambios cotidianos sobre necesidades en inglés.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Pido cosas cortésmente con 'I'd like a/an...'.", escala: escala4 },
          { descripcion: "Expreso deseos con 'I'd like to + verbo'.", escala: escala4 },
          { descripcion: "Uso 'how much' y 'how many' según contable o incontable.", escala: escala4 },
          { descripcion: "Pregunto y entiendo precios y cantidades.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿En qué situación real (tienda, café) podrías usar 'I'd like...' en inglés?",
      },
    },
  ],

  // ════════════ P08 — Consolidation (presente simple, números) ════════════
  [
    {
      titulo: "True or False — Review & numbers",
      descripcion: "Decide si cada afirmación de repaso (presente simple y números) es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "Con he/she/it el presente simple agrega -s al verbo.", respuesta: true, retroalimentacion: "Correcto: él/ella/eso → verbo + -s." },
          { enunciado: "Los números ordinales se escriben 1st, 2nd, 3rd, 4th...", respuesta: true, retroalimentacion: "Sí: first (1st), second (2nd), third (3rd)." },
          { enunciado: "'Third' es un número cardinal.", respuesta: false, retroalimentacion: "'Third' (3rd) es ordinal; el cardinal es 'three' (3)." },
          { enunciado: "Para deletrear se usa 'How do you spell...?'.", respuesta: true, retroalimentacion: "Correcto: así se pide deletrear una palabra." },
          { enunciado: "'One hundred' significa 'mil'.", respuesta: false, retroalimentacion: "'One hundred' = cien (100); 'one thousand' = mil (1000)." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glossary — Review: present simple & numbers",
      descripcion: "Glosario interactivo de repaso: presente simple, números cardinales, ordinales y deletreo.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "present simple", definicion: "Tiempo para hábitos y hechos (con -s en 3ª persona singular).", ejemplo: "I play / She plays.", etiquetas: ["gramática"] },
          { termino: "cardinal numbers", definicion: "Números para contar: one, two... hundred, thousand.", ejemplo: "There are two hundred students.", etiquetas: ["números"] },
          { termino: "ordinal numbers", definicion: "Números de orden: first (1st), second (2nd), third (3rd).", ejemplo: "Today is the first of June.", etiquetas: ["números"] },
          { termino: "How do you spell...?", definicion: "Pregunta para pedir el deletreo de una palabra.", ejemplo: "How do you spell your name?", etiquetas: ["deletreo"] },
          { termino: "the alphabet", definicion: "El abecedario en inglés, usado para deletrear.", ejemplo: "A-N-A, that's Ana.", etiquetas: ["deletreo"] },
          { termino: "hundred / thousand", definicion: "Cien / mil (números grandes).", ejemplo: "one hundred, one thousand.", etiquetas: ["números"] },
        ],
        actividad_final: "Escribe 3 oraciones en presente simple y deletrea tu nombre y dos palabras en inglés.",
      },
    },
    {
      titulo: "Fill in the blanks — Putting it together",
      descripcion: "Completa con el presente simple y los números cardinales u ordinales correctos.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos repasando el presente simple y los números.",
        texto_con_huecos: "My sister ___ at a school with two ___ students (200). Her birthday is on the ___ of May (1st). How do you ___ your last name?",
        huecos: [
          { posicion: 0, respuesta_correcta: "studies", alternativas_aceptadas: ["works"], pista: "3ª persona de 'study': study → ___ (y termina en -y)." },
          { posicion: 1, respuesta_correcta: "hundred", alternativas_aceptadas: [], pista: "Número cardinal para 100: two ___ = 200." },
          { posicion: 2, respuesta_correcta: "first", alternativas_aceptadas: ["1st"], pista: "Número ordinal para 1st." },
          { posicion: 3, respuesta_correcta: "spell", alternativas_aceptadas: [], pista: "Verbo para pedir el deletreo: How do you ___ ?" },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Self-check — Consolidating my English II",
      descripcion: "Autoevaluación de tu dominio general de los aprendizajes clave de Inglés II.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio. Es un repaso general del semestre.",
        criterios: [
          { descripcion: "Uso el presente simple (1ª y 3ª persona, singular y plural).", escala: escala4 },
          { descripcion: "Uso los números cardinales hasta centenas y millares.", escala: escala4 },
          { descripcion: "Uso los números ordinales (1st, 2nd, 3rd).", escala: escala4 },
          { descripcion: "Puedo deletrear nombres y palabras comunes en inglés.", escala: escala4 },
        ],
        reflexion_final_prompt: "De todo lo que aprendiste en Inglés II, ¿qué tema dominas mejor y cuál vas a seguir practicando?",
      },
    },
  ],
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });

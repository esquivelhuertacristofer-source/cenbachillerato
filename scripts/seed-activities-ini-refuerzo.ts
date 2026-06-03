/**
 * Refuerzo de actividades para IN-I (Inglés I — A1) según la "Plantilla CEN por UAC".
 * Agrega A4-A7 a cada una de las 8 progresiones (ya tienen A1-A3):
 *   A4 = quiz_multiple_opcion · A5 = quiz_verdadero_falso · A6 = glosario_interactivo · A7 = autoevaluacion
 * 8 progresiones × 4 = 32 actividades nuevas. estado='borrador'.
 * Alineado a los propósitos formativos oficiales MCCEMS 2025 (Inglés I — "To be, or not to be").
 * Uso: npx tsx scripts/seed-activities-ini-refuerzo.ts
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
  log("\n🌱 Refuerzo IN-I — Inglés I (A1): A4-A7 por progresión\n");

  const progs = await getProgresionesDeUAC(sb, "IN-I");
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

  log(`\n✅ IN-I refuerzo: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── REFUERZOS POR PROGRESIÓN ───────────────────────────────────────────────────

const refuerzos: Refuerzo[][] = [
  // ════════════ P01 — Presentaciones ════════════
  [
    {
      titulo: "Greetings & introductions — Quiz",
      descripcion: "Quiz de opción múltiple sobre saludos, el verbo to be y presentaciones.",
      tipo: "quiz_multiple_opcion",
      xp: 15,
      contenido: {
        preguntas: [
          { enunciado: "¿Cuál es la forma correcta de presentarte?", opciones: ["I are Ana.", "I am Ana.", "I is Ana.", "Me Ana."], respuesta_correcta: 1, retroalimentacion: "Con 'I' siempre se usa 'am': I am Ana / I'm Ana." },
          { enunciado: "Conoces a alguien por primera vez. ¿Qué dices?", opciones: ["Goodbye!", "See you later!", "Nice to meet you!", "How old are you?"], respuesta_correcta: 2, retroalimentacion: "'Nice to meet you' = mucho gusto, al conocer a alguien." },
          { enunciado: "¿Cuál saludo es FORMAL?", opciones: ["Hi!", "Hey!", "Good morning.", "What's up?"], respuesta_correcta: 2, retroalimentacion: "'Good morning/afternoon/evening' son formales; 'Hi/Hey' son informales." },
          { enunciado: "Para presentar a tu amiga Sofía dices:", opciones: ["This is Sofía.", "She are Sofía.", "This Sofía.", "Her Sofía."], respuesta_correcta: 0, retroalimentacion: "Para presentar a alguien: 'This is + nombre'." },
          { enunciado: "¿Cómo se contrae 'I am'?", opciones: ["Im", "I'm", "Iam", "I's"], respuesta_correcta: 1, retroalimentacion: "La contracción correcta es I'm (con apóstrofo)." },
        ],
        intentos_maximos: 3,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "True or False — Greetings rules",
      descripcion: "Decide si cada afirmación sobre saludos y presentaciones es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "El pronombre 'I' siempre se escribe con mayúscula en inglés.", respuesta: true, retroalimentacion: "Correcto: 'I' va con mayúscula en cualquier posición de la oración." },
          { enunciado: "'Nice to meet you' significa 'adiós'.", respuesta: false, retroalimentacion: "Significa 'mucho gusto'. 'Adiós' es 'Goodbye'." },
          { enunciado: "'Good evening' es un saludo de la mañana.", respuesta: false, retroalimentacion: "'Good evening' es para la tarde/noche; la mañana es 'Good morning'." },
          { enunciado: "Para presentar a otra persona se usa 'This is...'.", respuesta: true, retroalimentacion: "Correcto: 'This is Carlos'." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glossary — Greetings & introductions",
      descripcion: "Glosario interactivo del vocabulario clave para saludar y presentarse.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "Hello / Hi", definicion: "Saludo. 'Hello' es neutro y 'Hi' es informal.", ejemplo: "Hi! How are you?", etiquetas: ["saludo"] },
          { termino: "Nice to meet you", definicion: "Frase que se dice al conocer a alguien por primera vez (mucho gusto).", ejemplo: "I'm Ana. Nice to meet you!", etiquetas: ["presentación"] },
          { termino: "This is...", definicion: "Estructura para presentar a otra persona.", ejemplo: "This is my friend Diego.", etiquetas: ["presentación"] },
          { termino: "Good morning", definicion: "Saludo formal usado por la mañana.", ejemplo: "Good morning, teacher.", etiquetas: ["saludo", "formal"] },
          { termino: "Goodbye / Bye", definicion: "Despedida. 'Bye' es la forma informal.", ejemplo: "Goodbye! See you tomorrow.", etiquetas: ["despedida"] },
          { termino: "to be (am/is/are)", definicion: "Verbo ser/estar. I am, you are, he/she is.", ejemplo: "I am from Mexico.", etiquetas: ["gramática"] },
        ],
        actividad_final: "Escribe 3 oraciones presentándote usando al menos 3 términos del glosario.",
      },
    },
    {
      titulo: "Self-check — Can I introduce myself?",
      descripcion: "Autoevaluación de tu habilidad para presentarte y presentar a otros en inglés.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio. No es una calificación: es para saber qué reforzar.",
        criterios: [
          { descripcion: "Puedo saludar de forma formal e informal en inglés.", escala: escala4 },
          { descripcion: "Puedo presentarme diciendo mi nombre, edad y de dónde soy.", escala: escala4 },
          { descripcion: "Puedo presentar a otra persona usando 'This is...'.", escala: escala4 },
          { descripcion: "Uso correctamente el verbo 'to be' (am/is/are).", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué parte de presentarte en inglés te cuesta más y cómo la vas a practicar?",
      },
    },
  ],

  // ════════════ P02 — Interacciones en el aula ════════════
  [
    {
      titulo: "Classroom language — Quiz",
      descripcion: "Quiz de opción múltiple sobre frases para pedir permiso, aclarar dudas e instrucciones.",
      tipo: "quiz_multiple_opcion",
      xp: 15,
      contenido: {
        preguntas: [
          { enunciado: "¿Cómo pides permiso para ir al baño?", opciones: ["I go to the bathroom.", "May I go to the bathroom?", "Bathroom please.", "I want bathroom."], respuesta_correcta: 1, retroalimentacion: "'May I...?' es la forma cortés de pedir permiso." },
          { enunciado: "No entendiste algo. ¿Qué frase usas?", opciones: ["I don't understand.", "I don't like.", "I am fine.", "I agree."], respuesta_correcta: 0, retroalimentacion: "'I don't understand' = no entiendo." },
          { enunciado: "El maestro dice 'Work in pairs'. Significa:", opciones: ["Trabajen solos", "Trabajen en parejas", "Cierren el libro", "Entreguen la tarea"], respuesta_correcta: 1, retroalimentacion: "'In pairs' = en parejas." },
          { enunciado: "¿Cómo pides que repitan algo?", opciones: ["Repeat please me.", "Can you repeat that, please?", "Again you say.", "What you said?"], respuesta_correcta: 1, retroalimentacion: "'Can you repeat that, please?' es la forma correcta y cortés." },
          { enunciado: "'Hand in your homework' significa:", opciones: ["Abran el cuaderno", "Levanten la mano", "Entreguen su tarea", "Escuchen y repitan"], respuesta_correcta: 2, retroalimentacion: "'Hand in' = entregar." },
        ],
        intentos_maximos: 3,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "True or False — In the classroom",
      descripcion: "Decide si cada afirmación sobre el lenguaje del aula es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "'May I...?' se usa para pedir permiso de forma cortés.", respuesta: true, retroalimentacion: "Correcto, es más cortés que 'Can I...?'." },
          { enunciado: "'I agree' significa 'no estoy de acuerdo'.", respuesta: false, retroalimentacion: "'I agree' = estoy de acuerdo. 'I disagree' = no estoy de acuerdo." },
          { enunciado: "'Listen and repeat' es una instrucción del maestro.", respuesta: true, retroalimentacion: "Sí: escuchen y repitan." },
          { enunciado: "'What does it mean?' sirve para preguntar el significado de una palabra.", respuesta: true, retroalimentacion: "Correcto: ¿qué significa?" },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glossary — Classroom phrases",
      descripcion: "Glosario interactivo de frases esenciales para participar en clase.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "May I...?", definicion: "Forma cortés de pedir permiso.", ejemplo: "May I go to the bathroom?", etiquetas: ["permiso"] },
          { termino: "I don't understand", definicion: "Frase para indicar que no comprendiste.", ejemplo: "Sorry, I don't understand.", etiquetas: ["duda"] },
          { termino: "Can you repeat that, please?", definicion: "Pedir que repitan algo de forma cortés.", ejemplo: "Can you repeat that, please?", etiquetas: ["duda"] },
          { termino: "Work in pairs", definicion: "Instrucción: trabajar en parejas.", ejemplo: "Now, work in pairs.", etiquetas: ["instrucción"] },
          { termino: "Hand in your homework", definicion: "Instrucción: entregar la tarea.", ejemplo: "Hand in your homework, please.", etiquetas: ["instrucción"] },
          { termino: "I agree / I disagree", definicion: "Expresar acuerdo o desacuerdo.", ejemplo: "I agree with you.", etiquetas: ["participación"] },
        ],
        actividad_final: "Escribe un mini-diálogo de 4 líneas usando al menos 3 frases del glosario.",
      },
    },
    {
      titulo: "Self-check — Classroom interaction",
      descripcion: "Autoevaluación de tu participación en inglés dentro del aula.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Puedo pedir permiso en inglés de forma cortés.", escala: escala4 },
          { descripcion: "Puedo decir que no entiendo y pedir que repitan.", escala: escala4 },
          { descripcion: "Entiendo las instrucciones comunes del maestro.", escala: escala4 },
          { descripcion: "Me animo a participar aunque cometa errores.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué frase de clase vas a empezar a usar más seguido en inglés?",
      },
    },
  ],

  // ════════════ P03 — Objetos y espacios ════════════
  [
    {
      titulo: "Describing objects — Quiz",
      descripcion: "Quiz de opción múltiple sobre adjetivos de forma, color, tamaño y orden de palabras.",
      tipo: "quiz_multiple_opcion",
      xp: 15,
      contenido: {
        preguntas: [
          { enunciado: "¿Cuál es el orden correcto en inglés?", opciones: ["a book red", "a red book", "red a book", "book a red"], respuesta_correcta: 1, retroalimentacion: "En inglés el adjetivo va ANTES del sustantivo: 'a red book'." },
          { enunciado: "'Backpack' significa:", opciones: ["pizarrón", "mochila", "escritorio", "ventana"], respuesta_correcta: 1, retroalimentacion: "'Backpack' = mochila." },
          { enunciado: "¿Cómo dices 'una mesa cuadrada pequeña'?", opciones: ["a square small table", "a small square table", "a table small square", "small a square table"], respuesta_correcta: 1, retroalimentacion: "Orden: tamaño + forma + sustantivo → 'a small square table'." },
          { enunciado: "¿Cuál es un color?", opciones: ["round", "big", "purple", "short"], respuesta_correcta: 2, retroalimentacion: "'Purple' (morado) es color; los otros son forma o tamaño." },
          { enunciado: "'The clock is round.' La palabra 'round' indica:", opciones: ["color", "tamaño", "forma", "material"], respuesta_correcta: 2, retroalimentacion: "'Round' (redondo) es una forma." },
        ],
        intentos_maximos: 3,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "True or False — Objects & spaces",
      descripcion: "Decide si cada afirmación sobre describir objetos es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "En inglés el adjetivo va después del sustantivo, como en español.", respuesta: false, retroalimentacion: "Falso: en inglés va ANTES ('a red book')." },
          { enunciado: "'Desk' significa escritorio.", respuesta: true, retroalimentacion: "Correcto." },
          { enunciado: "'There is' se usa para un objeto en singular.", respuesta: true, retroalimentacion: "Sí: 'There is a chair' (singular); 'There are' para plural." },
          { enunciado: "'Big' y 'small' son colores.", respuesta: false, retroalimentacion: "Son tamaños, no colores." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glossary — Objects, shapes & colors",
      descripcion: "Glosario interactivo de objetos del aula/hogar, formas, colores y tamaños.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "desk", definicion: "Escritorio o pupitre.", ejemplo: "The teacher's desk is big.", etiquetas: ["objeto"] },
          { termino: "backpack", definicion: "Mochila.", ejemplo: "My backpack is blue.", etiquetas: ["objeto"] },
          { termino: "round / square", definicion: "Formas: redondo / cuadrado.", ejemplo: "The clock is round.", etiquetas: ["forma"] },
          { termino: "big / small", definicion: "Tamaños: grande / pequeño.", ejemplo: "It is a small table.", etiquetas: ["tamaño"] },
          { termino: "There is / There are", definicion: "Para indicar que hay algo (singular / plural).", ejemplo: "There are 30 chairs.", etiquetas: ["gramática"] },
          { termino: "board", definicion: "Pizarrón.", ejemplo: "The board is on the wall.", etiquetas: ["objeto"] },
        ],
        actividad_final: "Describe 4 objetos a tu alrededor en inglés (color, tamaño o forma).",
      },
    },
    {
      titulo: "Self-check — Describing objects",
      descripcion: "Autoevaluación de tu habilidad para describir objetos y espacios en inglés.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Conozco vocabulario de objetos del aula y del hogar.", escala: escala4 },
          { descripcion: "Uso colores, tamaños y formas para describir.", escala: escala4 },
          { descripcion: "Coloco el adjetivo antes del sustantivo correctamente.", escala: escala4 },
          { descripcion: "Uso 'There is/There are' para decir qué hay en un lugar.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué objeto de tu día a día ya sabes nombrar y describir en inglés?",
      },
    },
  ],

  // ════════════ P04 — Información personal ════════════
  [
    {
      titulo: "Personal information — Quiz",
      descripcion: "Quiz de opción múltiple sobre dar y pedir información personal.",
      tipo: "quiz_multiple_opcion",
      xp: 15,
      contenido: {
        preguntas: [
          { enunciado: "¿Cómo preguntas la edad de alguien?", opciones: ["How old are you?", "What's your age old?", "How many years you?", "When are you?"], respuesta_correcta: 0, retroalimentacion: "'How old are you?' = ¿cuántos años tienes?" },
          { enunciado: "En un formulario, 'Last name' significa:", opciones: ["nombre", "apellido", "edad", "dirección"], respuesta_correcta: 1, retroalimentacion: "'Last name / Surname' = apellido." },
          { enunciado: "¿Cuál es correcto?", opciones: ["I have 17 years.", "I am 17 years old.", "I am 17 years.", "My age 17."], respuesta_correcta: 1, retroalimentacion: "La edad se da con 'to be': 'I am 17 years old'." },
          { enunciado: "'I'm Mexican.' La palabra 'Mexican' se escribe:", opciones: ["con minúscula", "con mayúscula", "en plural", "con guion"], respuesta_correcta: 1, retroalimentacion: "En inglés las nacionalidades llevan mayúscula: Mexican, American." },
          { enunciado: "¿Cómo preguntas de dónde es alguien?", opciones: ["Where you from?", "Where are you from?", "From where you?", "What are you from?"], respuesta_correcta: 1, retroalimentacion: "'Where are you from?'" },
        ],
        intentos_maximos: 3,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "True or False — About me",
      descripcion: "Decide si cada afirmación sobre información personal es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "En inglés las nacionalidades se escriben con mayúscula.", respuesta: true, retroalimentacion: "Correcto: Mexican, Canadian, French." },
          { enunciado: "La edad se expresa con 'have' (I have 17 years).", respuesta: false, retroalimentacion: "Se usa 'to be': 'I am 17 years old'." },
          { enunciado: "'Surname' es sinónimo de 'Last name'.", respuesta: true, retroalimentacion: "Ambos significan apellido." },
          { enunciado: "Los números de teléfono se dicen dígito por dígito en inglés.", respuesta: true, retroalimentacion: "Correcto: 'five five, one two...'." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glossary — Personal information",
      descripcion: "Glosario interactivo de campos y preguntas de información personal.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "First name / Last name", definicion: "Nombre de pila / apellido.", ejemplo: "First name: Ana. Last name: García.", etiquetas: ["formulario"] },
          { termino: "How old are you?", definicion: "Pregunta de edad. Se responde 'I am ... years old'.", ejemplo: "How old are you? — I'm 16 years old.", etiquetas: ["pregunta"] },
          { termino: "Where are you from?", definicion: "Pregunta de origen. Se responde 'I'm from ...'.", ejemplo: "Where are you from? — I'm from Oaxaca.", etiquetas: ["pregunta"] },
          { termino: "Nationality", definicion: "Nacionalidad (con mayúscula en inglés).", ejemplo: "My nationality is Mexican.", etiquetas: ["dato"] },
          { termino: "Address", definicion: "Dirección o domicilio.", ejemplo: "My address is Calle Hidalgo 45.", etiquetas: ["dato"] },
          { termino: "Email address", definicion: "Correo electrónico.", ejemplo: "My email is ana@correo.com.", etiquetas: ["dato"] },
        ],
        actividad_final: "Llena una mini-ficha personal en inglés con 5 datos.",
      },
    },
    {
      titulo: "Self-check — Personal information",
      descripcion: "Autoevaluación de tu habilidad para dar y pedir información personal en inglés.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Puedo dar mi nombre, edad y nacionalidad en inglés.", escala: escala4 },
          { descripcion: "Puedo preguntar información personal a otra persona.", escala: escala4 },
          { descripcion: "Entiendo los campos de un formulario en inglés.", escala: escala4 },
          { descripcion: "Sé qué datos personales debo proteger al compartirlos.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿En qué situación real podrías necesitar dar tus datos en inglés?",
      },
    },
  ],

  // ════════════ P05 — Preguntas sencillas (ubicación y horarios) ════════════
  [
    {
      titulo: "Where & when? — Quiz",
      descripcion: "Quiz de opción múltiple sobre preguntas de ubicación, horarios y preposiciones.",
      tipo: "quiz_multiple_opcion",
      xp: 15,
      contenido: {
        preguntas: [
          { enunciado: "¿Cómo preguntas dónde está la biblioteca?", opciones: ["When is the library?", "Where is the library?", "What is the library?", "Who is the library?"], respuesta_correcta: 1, retroalimentacion: "'Where' = dónde." },
          { enunciado: "¿Qué preposición usas para una hora específica?", opciones: ["in", "on", "at", "to"], respuesta_correcta: 2, retroalimentacion: "'at' para horas: 'at 9 o'clock'." },
          { enunciado: "'The exam is ___ Monday.'", opciones: ["in", "on", "at", "of"], respuesta_correcta: 1, retroalimentacion: "'on' para días de la semana: 'on Monday'." },
          { enunciado: "¿Cómo dices 'nueve y media'?", opciones: ["nine and half", "half nine", "nine thirty", "thirty nine"], respuesta_correcta: 2, retroalimentacion: "'Nine thirty' o 'half past nine'." },
          { enunciado: "'It is next to the gym.' 'Next to' significa:", opciones: ["enfrente de", "al lado de", "detrás de", "entre"], respuesta_correcta: 1, retroalimentacion: "'Next to' = al lado de." },
        ],
        intentos_maximos: 3,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "True or False — Questions & prepositions",
      descripcion: "Decide si cada afirmación sobre preguntas y preposiciones es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "'at' se usa para horas específicas (at 8 am).", respuesta: true, retroalimentacion: "Correcto." },
          { enunciado: "'When' pregunta por un lugar.", respuesta: false, retroalimentacion: "'When' pregunta por tiempo; 'Where' por lugar." },
          { enunciado: "'on' se usa para días de la semana.", respuesta: true, retroalimentacion: "Sí: on Monday, on Friday." },
          { enunciado: "'in front of' significa 'detrás de'.", respuesta: false, retroalimentacion: "'in front of' = enfrente de; 'behind' = detrás de." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glossary — Questions, places & time",
      descripcion: "Glosario interactivo de palabras interrogativas, preposiciones de tiempo y lugar.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "Where", definicion: "Palabra interrogativa para lugar (dónde).", ejemplo: "Where is the bathroom?", etiquetas: ["pregunta"] },
          { termino: "When / What time", definicion: "Palabras para preguntar tiempo (cuándo / a qué hora).", ejemplo: "What time is it?", etiquetas: ["pregunta"] },
          { termino: "at / on / in", definicion: "Preposiciones de tiempo: at (hora), on (día), in (mes/año).", ejemplo: "at 8 am, on Monday, in December.", etiquetas: ["gramática"] },
          { termino: "next to / near", definicion: "Preposiciones de lugar: al lado de / cerca de.", ejemplo: "It is next to the gym.", etiquetas: ["lugar"] },
          { termino: "in front of / behind", definicion: "Enfrente de / detrás de.", ejemplo: "The car is in front of the house.", etiquetas: ["lugar"] },
          { termino: "Excuse me", definicion: "Frase cortés para iniciar una pregunta a un desconocido.", ejemplo: "Excuse me, where is the library?", etiquetas: ["cortesía"] },
        ],
        actividad_final: "Escribe 3 preguntas con Where, When y What time, con sus respuestas.",
      },
    },
    {
      titulo: "Self-check — Asking questions",
      descripcion: "Autoevaluación de tu habilidad para hacer preguntas sencillas en inglés.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Puedo preguntar dónde está un lugar.", escala: escala4 },
          { descripcion: "Puedo preguntar la hora y los horarios.", escala: escala4 },
          { descripcion: "Uso correctamente at / on / in con el tiempo.", escala: escala4 },
          { descripcion: "Uso preposiciones de lugar (next to, near, in front of).", escala: escala4 },
        ],
        reflexion_final_prompt: "¿En qué lugar de tu comunidad te serviría preguntar ubicaciones en inglés?",
      },
    },
  ],

  // ════════════ P06 — Describir personas, vestimenta y clima ════════════
  [
    {
      titulo: "People, clothes & weather — Quiz",
      descripcion: "Quiz de opción múltiple sobre describir personas, ropa y clima.",
      tipo: "quiz_multiple_opcion",
      xp: 15,
      contenido: {
        preguntas: [
          { enunciado: "¿Qué verbo usas para la ropa que lleva alguien?", opciones: ["to have", "to wear", "to be", "to do"], respuesta_correcta: 1, retroalimentacion: "'to wear' = llevar puesto: 'She is wearing a dress'." },
          { enunciado: "¿Cómo describes el clima lluvioso?", opciones: ["It is sunny.", "It is windy.", "It is rainy.", "It is hot."], respuesta_correcta: 2, retroalimentacion: "'rainy' / 'It is raining' = lluvioso." },
          { enunciado: "'Curly hair' significa:", opciones: ["cabello lacio", "cabello rizado", "cabello corto", "cabello largo"], respuesta_correcta: 1, retroalimentacion: "'Curly' = rizado." },
          { enunciado: "¿Cuál describe la estatura?", opciones: ["tall", "blonde", "rainy", "wearing"], respuesta_correcta: 0, retroalimentacion: "'Tall' (alto) describe estatura." },
          { enunciado: "'She has blue eyes.' El verbo 'has' indica:", opciones: ["posesión/característica", "acción futura", "ubicación", "gusto"], respuesta_correcta: 0, retroalimentacion: "'has' (tener) describe una característica física." },
        ],
        intentos_maximos: 3,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "True or False — Descriptions & weather",
      descripcion: "Decide si cada afirmación sobre descripciones y clima es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "'to wear' se usa para la ropa que lleva una persona.", respuesta: true, retroalimentacion: "Correcto: 'He is wearing jeans'." },
          { enunciado: "'It is snowing' describe un clima caluroso.", respuesta: false, retroalimentacion: "'Snowing' = nevando (frío)." },
          { enunciado: "'Straight hair' significa cabello lacio.", respuesta: true, retroalimentacion: "Correcto: straight = lacio." },
          { enunciado: "Describir a las personas con respeto es importante en cualquier idioma.", respuesta: true, retroalimentacion: "Sí: usa vocabulario neutro y respetuoso." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glossary — Appearance, clothes & weather",
      descripcion: "Glosario interactivo de apariencia física, vestimenta y clima.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "tall / short", definicion: "Estatura: alto / bajo.", ejemplo: "He is tall.", etiquetas: ["apariencia"] },
          { termino: "curly / straight / wavy", definicion: "Tipo de cabello: rizado / lacio / ondulado.", ejemplo: "She has curly hair.", etiquetas: ["apariencia"] },
          { termino: "to wear", definicion: "Llevar puesta una prenda.", ejemplo: "I am wearing a blue shirt.", etiquetas: ["ropa"] },
          { termino: "sunny / cloudy / rainy", definicion: "Clima: soleado / nublado / lluvioso.", ejemplo: "Today it is cloudy.", etiquetas: ["clima"] },
          { termino: "It is raining / snowing", definicion: "Está lloviendo / nevando (acción en curso).", ejemplo: "Look! It is raining.", etiquetas: ["clima"] },
          { termino: "to have (has)", definicion: "Tener; describe rasgos físicos.", ejemplo: "She has green eyes.", etiquetas: ["apariencia"] },
        ],
        actividad_final: "Describe a una persona (apariencia + ropa) y el clima de hoy en inglés.",
      },
    },
    {
      titulo: "Self-check — Describing people & weather",
      descripcion: "Autoevaluación de tu habilidad para describir personas y el clima en inglés.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Puedo describir la apariencia física de una persona.", escala: escala4 },
          { descripcion: "Uso 'is wearing' para describir la vestimenta.", escala: escala4 },
          { descripcion: "Puedo describir el clima con adjetivos en inglés.", escala: escala4 },
          { descripcion: "Describo a las personas con respeto y sin etiquetas negativas.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Cómo se describe a alguien de forma respetuosa, en inglés y en español?",
      },
    },
  ],

  // ════════════ P07 — Gustos y opiniones ════════════
  [
    {
      titulo: "Likes & opinions — Quiz",
      descripcion: "Quiz de opción múltiple sobre expresar gustos, preferencias y razones.",
      tipo: "quiz_multiple_opcion",
      xp: 15,
      contenido: {
        preguntas: [
          { enunciado: "¿Cómo preguntas si a alguien le gusta la pizza?", opciones: ["You like pizza?", "Do you like pizza?", "Are you like pizza?", "Like you pizza?"], respuesta_correcta: 1, retroalimentacion: "'Do you like...?' es la forma correcta." },
          { enunciado: "¿Cuál expresa el gusto MÁS intenso?", opciones: ["I like it.", "I don't mind it.", "I love it.", "I don't like it."], respuesta_correcta: 2, retroalimentacion: "'I love it' es el gusto más intenso." },
          { enunciado: "Después de 'I like' un verbo va en forma:", opciones: ["infinitivo (to play)", "-ing (playing)", "pasado (played)", "futuro (will play)"], respuesta_correcta: 1, retroalimentacion: "Tras 'like' se usa el verbo en -ing: 'I like playing soccer'." },
          { enunciado: "¿Qué palabra introduce una razón?", opciones: ["but", "because", "and", "or"], respuesta_correcta: 1, retroalimentacion: "'because' = porque, introduce la razón." },
          { enunciado: "Respuesta corta a 'Do you like English?' (afirmativa):", opciones: ["Yes, I like.", "Yes, I do.", "Yes, I am.", "Yes, I like it do."], respuesta_correcta: 1, retroalimentacion: "La respuesta corta correcta es 'Yes, I do'." },
        ],
        intentos_maximos: 3,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "True or False — Likes & opinions",
      descripcion: "Decide si cada afirmación sobre gustos y opiniones es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "'I love it' expresa un gusto más fuerte que 'I like it'.", respuesta: true, retroalimentacion: "Correcto." },
          { enunciado: "Después de 'like', el verbo va en infinitivo con 'to' solamente.", respuesta: false, retroalimentacion: "Lo más común en A1 es 'like + verbo-ing': 'I like playing'." },
          { enunciado: "'because' sirve para dar una razón.", respuesta: true, retroalimentacion: "Sí: 'I like it because it is fun'." },
          { enunciado: "Respetar gustos distintos a los míos es parte de la empatía.", respuesta: true, retroalimentacion: "Correcto: 'Everyone is different'." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glossary — Expressing likes",
      descripcion: "Glosario interactivo para expresar gustos, grados y razones.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "I like / I don't like", definicion: "Me gusta / no me gusta.", ejemplo: "I like music. I don't like coffee.", etiquetas: ["gusto"] },
          { termino: "I love / I hate", definicion: "Me encanta / odio (grados extremos).", ejemplo: "I love pizza. I hate spiders.", etiquetas: ["gusto"] },
          { termino: "Do you like...?", definicion: "Pregunta de gusto. Respuesta: Yes, I do / No, I don't.", ejemplo: "Do you like soccer? — Yes, I do.", etiquetas: ["pregunta"] },
          { termino: "because", definicion: "Conector para dar una razón.", ejemplo: "I like it because it is fun.", etiquetas: ["conector"] },
          { termino: "verb + -ing", definicion: "Forma del verbo tras 'like' (gerundio).", ejemplo: "I like reading.", etiquetas: ["gramática"] },
          { termino: "I don't mind", definicion: "No me molesta (gusto neutro).", ejemplo: "I don't mind math.", etiquetas: ["gusto"] },
        ],
        actividad_final: "Escribe 4 oraciones de gustos con razones usando 'because'.",
      },
    },
    {
      titulo: "Self-check — Talking about likes",
      descripcion: "Autoevaluación de tu habilidad para expresar gustos y opiniones en inglés.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Puedo decir qué me gusta y qué no me gusta.", escala: escala4 },
          { descripcion: "Uso distintos grados (love, like, don't like, hate).", escala: escala4 },
          { descripcion: "Doy razones de mis gustos usando 'because'.", escala: escala4 },
          { descripcion: "Pregunto y respondo sobre gustos (Do you like...? Yes, I do).", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué gusto tuyo ya puedes explicar en inglés con una razón?",
      },
    },
  ],

  // ════════════ P08 — Posesión y pertenencia ════════════
  [
    {
      titulo: "Possession — Quiz",
      descripcion: "Quiz de opción múltiple sobre genitivo sajón y pronombres posesivos.",
      tipo: "quiz_multiple_opcion",
      xp: 15,
      contenido: {
        preguntas: [
          { enunciado: "¿Cómo dices 'el libro de Ana'?", opciones: ["the book of Ana", "Ana's book", "Ana book", "book Ana's"], respuesta_correcta: 1, retroalimentacion: "Genitivo sajón: 'Ana's book'." },
          { enunciado: "¿Cómo preguntas de quién es algo?", opciones: ["Who is this?", "Whose is this?", "Where is this?", "What is this?"], respuesta_correcta: 1, retroalimentacion: "'Whose...?' = ¿de quién...?" },
          { enunciado: "'It is ___ (de ella).' Completa:", opciones: ["his", "hers", "their", "our"], respuesta_correcta: 1, retroalimentacion: "'hers' = de ella (pronombre posesivo solo)." },
          { enunciado: "Para un plural que termina en s (the students), el genitivo es:", opciones: ["students's", "students'", "student's", "students"], respuesta_correcta: 1, retroalimentacion: "Solo se agrega apóstrofo: 'the students' notebooks'." },
          { enunciado: "'This pen is mine.' 'Mine' significa:", opciones: ["mi", "mío", "tuyo", "suyo"], respuesta_correcta: 1, retroalimentacion: "'Mine' = mío (pronombre posesivo)." },
        ],
        intentos_maximos: 3,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "True or False — Possession",
      descripcion: "Decide si cada afirmación sobre posesión es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          { enunciado: "El genitivo sajón se forma con apóstrofo + s ('María's book').", respuesta: true, retroalimentacion: "Correcto." },
          { enunciado: "'Whose' se usa para preguntar de quién es algo.", respuesta: true, retroalimentacion: "Sí: 'Whose pencil is this?'." },
          { enunciado: "'Her' y 'hers' significan lo mismo y se usan igual.", respuesta: false, retroalimentacion: "'Her' va antes de un sustantivo (her book); 'hers' va solo (It's hers)." },
          { enunciado: "Para plurales terminados en s, solo se agrega apóstrofo.", respuesta: true, retroalimentacion: "Correcto: 'the students' notebooks'." },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glossary — Possessives",
      descripcion: "Glosario interactivo de pronombres posesivos y genitivo sajón.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          { termino: "Saxon genitive ('s)", definicion: "Apóstrofo + s para indicar posesión.", ejemplo: "Carlos's phone.", etiquetas: ["gramática"] },
          { termino: "my / your / his / her", definicion: "Adjetivos posesivos (van antes del sustantivo).", ejemplo: "My backpack, her book.", etiquetas: ["posesivo"] },
          { termino: "our / their", definicion: "Nuestro / su (de ellos).", ejemplo: "Our classroom, their homework.", etiquetas: ["posesivo"] },
          { termino: "mine / yours / hers", definicion: "Pronombres posesivos (van solos, sin sustantivo).", ejemplo: "This pen is mine.", etiquetas: ["posesivo"] },
          { termino: "Whose...?", definicion: "Pregunta de posesión: ¿de quién es...?", ejemplo: "Whose notebook is this?", etiquetas: ["pregunta"] },
          { termino: "to belong to", definicion: "Pertenecer a.", ejemplo: "This book belongs to me.", etiquetas: ["posesión"] },
        ],
        actividad_final: "Escribe 4 oraciones de posesión: 2 con genitivo y 2 con pronombres posesivos.",
      },
    },
    {
      titulo: "Self-check — Expressing possession",
      descripcion: "Autoevaluación de tu habilidad para expresar posesión y pertenencia en inglés.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Formo el genitivo sajón correctamente ('Ana's book').", escala: escala4 },
          { descripcion: "Uso adjetivos posesivos (my, your, his, her, our, their).", escala: escala4 },
          { descripcion: "Uso pronombres posesivos solos (mine, yours, hers).", escala: escala4 },
          { descripcion: "Pregunto y respondo de quién es algo (Whose...?).", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué diferencia hay entre 'her' y 'hers'? Explícalo con tus palabras.",
      },
    },
  ],
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });

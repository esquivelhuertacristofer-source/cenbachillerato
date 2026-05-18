/**
 * Seed de actividades pedagógicas para IN-I (Inglés I — nivel A1).
 * 8 progresiones × 3 actividades = 24 actividades. estado='borrador'.
 * A1=lectura bilingüe, A2=fill_blanks (inglés), A3=reflexión escrita.
 * Uso: npx tsx scripts/seed-activities-ini.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🌱 Seed actividades IN-I — Inglés I (A1)\n");

  const progs = await getProgresionesDeUAC(sb, "IN-I");
  let ok = 0; let fail = 0;

  for (const p of progs) {
    const base = p.codigo;

    const a1ok = await upsertActividad(sb, {
      codigo: `${base}-A1`,
      titulo: titulos[p.numero - 1].a1,
      descripcion: "Lectura bilingüe de contextualización para explorar vocabulario y estructuras.",
      tipo: "lectura",
      progresion_id: p.id,
      xp: 10,
      contenido: lecturas[p.numero - 1],
    });
    a1ok ? ok++ : fail++;

    const a2ok = await upsertActividad(sb, {
      codigo: `${base}-A2`,
      titulo: titulos[p.numero - 1].a2,
      descripcion: "Actividad de completar oraciones en inglés para practicar estructuras clave.",
      tipo: "fill_blanks",
      progresion_id: p.id,
      xp: 15,
      contenido: fillBlanks[p.numero - 1],
    });
    a2ok ? ok++ : fail++;

    const a3ok = await upsertActividad(sb, {
      codigo: `${base}-A3`,
      titulo: titulos[p.numero - 1].a3,
      descripcion: "Reflexión escrita de cierre: producción mínima en inglés y reflexión en español.",
      tipo: "reflexion_escrita",
      progresion_id: p.id,
      xp: 20,
      contenido: reflexiones[p.numero - 1],
    });
    a3ok ? ok++ : fail++;
  }

  log(`\n✅ IN-I: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── TÍTULOS ───────────────────────────────────────────────────────────────────

const titulos = [
  { a1: "Hello! Nice to meet you — Presentaciones en inglés", a2: "Complete my introduction", a3: "Me presento en inglés" },
  { a1: "In the classroom — Interacciones básicas en el aula", a2: "What do we say in class?", a3: "Mi vocabulario de aula" },
  { a1: "What's around us? — Objetos y espacios cotidianos", a2: "Describe it!", a3: "Describo mi espacio en inglés" },
  { a1: "About me — Información personal en inglés", a2: "Fill in the form", a3: "Mi tarjeta de presentación en inglés" },
  { a1: "Where and when? — Preguntas sencillas en inglés", a2: "Ask the right question", a3: "Pregunto y respondo en inglés" },
  { a1: "People, clothes and weather — Describir en inglés", a2: "What does she look like?", a3: "Describo a alguien en inglés" },
  { a1: "What do you like? — Gustos y opiniones en inglés", a2: "Do you like...?", a3: "Mis gustos en inglés" },
  { a1: "Mine or yours? — Posesión y pertenencia en inglés", a2: "Whose is it?", a3: "Expreso posesión en inglés" },
];

// ── LECTURAS (A1) ─────────────────────────────────────────────────────────────

const lecturas = [
  { // P01 — presentaciones
    texto: `En inglés, presentarse es una de las primeras habilidades que necesitas dominar. Los saludos varían según el contexto: "Hello" y "Hi" son informales, mientras que "Good morning", "Good afternoon" y "Good evening" son más formales. Al conocer a alguien nuevo, decimos "Nice to meet you" (mucho gusto) y la respuesta es "Nice to meet you too".\n\nPara presentarte, usas el verbo "to be" (ser/estar): "I am [nombre]" o la forma contraída "I'm [nombre]". Puedes agregar información: "I'm [nombre]. I'm [edad] years old. I'm from [ciudad/país]." ("Soy [nombre]. Tengo [edad] años. Soy de [ciudad/país].")\n\nPara presentar a otra persona dices: "This is [nombre]" (Este/Esta es [nombre]) o "His name is / Her name is [nombre]" (Su nombre es [nombre]). Al despedirte, puedes decir "Goodbye", "Bye", "See you later" o "See you tomorrow".\n\nRecuerda que en inglés los nombres propios y el pronombre "I" (yo) siempre se escriben con mayúscula. La primera palabra de cada oración también lleva mayúscula, igual que en español.`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 7,
    preguntas_comprension: [
      { pregunta: "¿Cómo se dice 'mucho gusto' en inglés?", respuesta_guia: "Nice to meet you." },
      { pregunta: "¿Cómo presentarías a tu amigo Carlos usando 'This is'?", respuesta_guia: "This is Carlos." },
      { pregunta: "¿Cuál es la diferencia entre 'Hi' y 'Good morning'?", respuesta_guia: "'Hi' es informal; 'Good morning' es más formal y específica para la mañana." },
    ],
  },
  { // P02 — interacciones en el aula
    texto: `En el salón de clase en inglés, hay frases esenciales que necesitas conocer. Para pedir permiso: "May I go to the bathroom?" (¿Puedo ir al baño?), "Can I open the window?" (¿Puedo abrir la ventana?). Para aclarar dudas: "I don't understand" (No entiendo), "Can you repeat that, please?" (¿Puede repetir eso, por favor?), "What does [palabra] mean?" (¿Qué significa [palabra]?).\n\nCuando el maestro da instrucciones, escucharás frases como: "Open your book to page..." (Abran su libro en la página...), "Work in pairs" (Trabajen en parejas), "Listen and repeat" (Escuchen y repitan), "Write in your notebook" (Escriban en su cuaderno), "Hand in your homework" (Entreguen su tarea).\n\nPara participar activamente: "I have a question" (Tengo una pregunta), "I think the answer is..." (Creo que la respuesta es...), "I agree" (Estoy de acuerdo), "I disagree" (No estoy de acuerdo).\n\nEstar dispuesto a participar y no tener miedo a equivocarse es fundamental para aprender un idioma. Los errores son parte del proceso: "Practice makes perfect" (La práctica hace al maestro).`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 7,
    preguntas_comprension: [
      { pregunta: "¿Cómo pides ir al baño en inglés?", respuesta_guia: "May I go to the bathroom?" },
      { pregunta: "¿Qué significa 'Work in pairs'?", respuesta_guia: "Trabajen en parejas." },
      { pregunta: "¿Cómo dices que no entendiste algo?", respuesta_guia: "I don't understand. / Can you repeat that, please?" },
    ],
  },
  { // P03 — objetos y espacios
    texto: `Describir objetos en inglés requiere conocer vocabulario de forma, color y tamaño. En inglés, los adjetivos van ANTES del sustantivo, al revés que en español: decimos "a red book" (un libro rojo), no "a book red".\n\nPalabras de tamaño: big/large (grande), small/little (pequeño), medium (mediano), long (largo), short (corto), tall (alto — personas y edificios). Colores básicos: red (rojo), blue (azul), green (verde), yellow (amarillo), white (blanco), black (negro), orange (naranja), purple (morado). Formas: circle/round (círculo/redondo), square (cuadrado), triangle (triángulo), rectangular (rectangular).\n\nPara describir un objeto: "It is a [tamaño] [color] [forma] [objeto]." Por ejemplo: "It is a big blue rectangular table" (Es una mesa rectangular azul grande).\n\nEn el hogar y la escuela, los objetos comunes en inglés son: desk (escritorio), chair (silla), board (pizarrón), window (ventana), door (puerta), pencil (lápiz), notebook (cuaderno), backpack (mochila), table (mesa), shelf (estante), lamp (lámpara).`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 8,
    preguntas_comprension: [
      { pregunta: "¿Dónde va el adjetivo en inglés respecto al sustantivo?", respuesta_guia: "Antes del sustantivo: 'a red book', no 'a book red'." },
      { pregunta: "¿Cómo se dice 'una mesa cuadrada pequeña' en inglés?", respuesta_guia: "A small square table." },
      { pregunta: "¿Qué significa 'backpack'?", respuesta_guia: "Mochila." },
    ],
  },
  { // P04 — información personal
    texto: `Dar y solicitar información personal es una de las interacciones más comunes en inglés. Las preguntas clave son:\n\n• "What's your name?" → "My name is..." / "I'm..."\n• "How old are you?" → "I'm [edad] years old."\n• "Where are you from?" → "I'm from [ciudad/país]."\n• "What's your nationality?" → "I'm Mexican / American / French..." (adjetivo de nacionalidad)\n• "What's your phone number?" → "It's [número]."\n• "What's your address?" → "My address is [calle y número]."\n• "What's your email?" → "My email is [dirección]."\n\nNota importante: en inglés las nacionalidades se escriben con mayúscula (Mexican, American, Canadian). Los números telefónicos se dicen dígito por dígito en inglés: el número 55-1234-5678 se dice "five five, one two three four, five six seven eight".\n\nAl llenar formularios en inglés, las etiquetas comunes son: First name (nombre), Last name/Surname (apellido), Date of birth (fecha de nacimiento), Address (dirección), Zip code (código postal), Email address (correo electrónico).`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 8,
    preguntas_comprension: [
      { pregunta: "¿Cómo preguntas la edad de alguien en inglés?", respuesta_guia: "How old are you?" },
      { pregunta: "¿Por qué 'Mexican' se escribe con mayúscula en inglés?", respuesta_guia: "Porque en inglés las nacionalidades y gentilicios siempre llevan mayúscula." },
      { pregunta: "¿Qué significa 'Last name' en un formulario?", respuesta_guia: "Apellido." },
    ],
  },
  { // P05 — preguntas sencillas (ubicación y horarios)
    texto: `Hacer preguntas en inglés requiere conocer las palabras interrogativas (question words) y la estructura correcta. Las principales son:\n\n• Where (dónde): "Where is the library?" (¿Dónde está la biblioteca?)\n• When (cuándo): "When does the class start?" (¿Cuándo empieza la clase?)\n• What time (a qué hora): "What time is it?" (¿Qué hora es?)\n\nPara preguntar la ubicación, usamos el verbo "to be": "Where is [lugar]?" y respondemos con preposiciones: "It is next to / near / in front of / behind / between / on the corner of..." (Está al lado de / cerca de / enfrente de / detrás de / entre / en la esquina de...).\n\nPara hablar de horarios, usamos "at" para horas específicas ("The class is at 9 o'clock"), "on" para días ("The exam is on Monday") y "in" para meses y años ("The holiday is in December"). Las horas se pueden decir como "nine o'clock", "nine fifteen", "nine thirty" o "half past nine".\n\nEjemplos de preguntas cotidianas: "Excuse me, where is the bathroom?" (Disculpe, ¿dónde está el baño?), "What time does the store close?" (¿A qué hora cierra la tienda?), "Is there a pharmacy near here?" (¿Hay una farmacia cerca de aquí?).`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 8,
    preguntas_comprension: [
      { pregunta: "¿Qué preposición usas para decir una hora específica en inglés?", respuesta_guia: "'at': The class is at 9 o'clock." },
      { pregunta: "¿Cómo preguntas dónde está la biblioteca?", respuesta_guia: "Where is the library?" },
      { pregunta: "¿Cómo dices 'nueve y media' en inglés?", respuesta_guia: "Nine thirty / Half past nine." },
    ],
  },
  { // P06 — describir personas, vestimenta y clima
    texto: `Describir personas en inglés involucra hablar de características físicas y de vestimenta con respeto hacia la diversidad. Para la apariencia física:\n\n• Altura: tall (alto), short (bajo), medium height (estatura mediana)\n• Complexión: slim/thin (delgado), heavy-set (robusto)\n• Cabello: long/short hair (cabello largo/corto), straight/curly/wavy hair (liso/rizado/ondulado), blonde/brown/black/gray hair (rubio/castaño/negro/gris)\n• Ojos: blue/green/brown/black eyes\n\nPara la vestimenta, el verbo es "to wear" (usar/llevar puesto): "She is wearing a red dress and black shoes." (Ella lleva un vestido rojo y zapatos negros.)\n\nPara describir el clima, usamos "It is..." + adjetivo: It is sunny (soleado), cloudy (nublado), rainy (lluvioso), windy (ventoso), cold (frío), hot (caliente), warm (templado), foggy (con niebla). También: "It is raining / It is snowing" (Está lloviendo / nevando).\n\nRecuerda que al describir personas debemos hacerlo con respeto. El inglés tiene vocabulario neutro y respetuoso para referirse a diferentes apariencias: usamos términos descriptivos sin connotaciones negativas.`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 8,
    preguntas_comprension: [
      { pregunta: "¿Qué verbo se usa para decir qué ropa lleva alguien?", respuesta_guia: "To wear: 'She is wearing a red dress'." },
      { pregunta: "¿Cómo describes el clima lluvioso en inglés?", respuesta_guia: "It is rainy. / It is raining." },
      { pregunta: "¿Cómo dices 'cabello rubio ondulado' en inglés?", respuesta_guia: "Wavy blonde hair." },
    ],
  },
  { // P07 — gustos y opiniones
    texto: `Expresar gustos y preferencias en inglés es más fácil de lo que parece. Usamos el verbo "to like" (gustar) de la siguiente manera:\n\n• "I like [sustantivo/verbo-ing]" (Me gusta...): "I like music." / "I like playing soccer."\n• "I don't like [sustantivo/verbo-ing]" (No me gusta...): "I don't like coffee."\n• "Do you like [sustantivo/verbo-ing]?" (¿Te gusta...?): "Do you like pizza?"\n• Respuestas: "Yes, I do." / "No, I don't."\n\nPara expresar diferentes grados: "I love..." (Me encanta), "I really like..." (Me gusta mucho), "I like..." (Me gusta), "I don't mind..." (No me molesta), "I don't like..." (No me gusta), "I hate..." (Odio).\n\nPara dar razones: "I like it because it is fun/interesting/delicious/easy" (Me gusta porque es divertido/interesante/delicioso/fácil). "I don't like it because it is boring/difficult/expensive" (No me gusta porque es aburrido/difícil/caro).\n\nSer empático al hablar de gustos significa respetar que los demás pueden tener preferencias diferentes: "That's fine, everyone is different" (Está bien, todos somos diferentes).`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 7,
    preguntas_comprension: [
      { pregunta: "¿Cómo preguntas si a alguien le gusta la música?", respuesta_guia: "Do you like music?" },
      { pregunta: "¿Cuál es la diferencia entre 'I like' y 'I love'?", respuesta_guia: "'I love' expresa un gusto más intenso o apasionado que 'I like'." },
      { pregunta: "¿Cómo dices 'No me gusta porque es aburrido'?", respuesta_guia: "I don't like it because it is boring." },
    ],
  },
  { // P08 — posesión y pertenencia
    texto: `En inglés, expresar posesión y pertenencia puede hacerse de varias maneras. La primera es con el genitivo sajón ('s): se agrega apóstrofo + s al poseedor: "María's book" (el libro de María), "the teacher's desk" (el escritorio del maestro). Para sustantivos plurales que ya terminan en s, solo se agrega el apóstrofo: "the students' notebooks" (los cuadernos de los estudiantes).\n\nLa segunda manera es con pronombres posesivos:\n• My (mi/mis): "My backpack is green."\n• Your (tu/tus): "Is this your pencil?"\n• His (su — de él): "His name is Carlos."\n• Her (su — de ella): "Her book is on the desk."\n• Our (nuestro/a/os/as): "Our classroom is big."\n• Their (su/sus — de ellos/as): "Their homework is ready."\n\nPara preguntar a quién pertenece algo: "Whose [objeto] is this?" (¿De quién es este/esta [objeto]?). Respuesta: "It is [pronombre posesivo]." → "It is mine." (Es mío/mía.)\n\nLos pronombres posesivos que van solos (sin sustantivo después) son: mine (mío), yours (tuyo), his (suyo — de él), hers (suyo — de ella), ours (nuestro), theirs (suyo — de ellos).`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "basico" as const,
    tiempo_estimado_minutos: 8,
    preguntas_comprension: [
      { pregunta: "¿Cómo se forma el genitivo sajón? Da un ejemplo.", respuesta_guia: "Apóstrofo + s al poseedor: 'María's book'." },
      { pregunta: "¿Qué pronombre posesivo usas para referirte a algo de ella?", respuesta_guia: "Her: 'Her book is on the desk'." },
      { pregunta: "¿Cómo preguntas de quién es algo en inglés?", respuesta_guia: "Whose [objeto] is this?" },
    ],
  },
];

// ── FILL BLANKS (A2) ──────────────────────────────────────────────────────────

const fillBlanks = [
  { // P01 — presentaciones
    instrucciones: "Completa las oraciones con la palabra correcta del cuadro: am / is / are / Hi / Nice / name / from / years",
    texto_con_huecos: "___ ! My ___ is Valeria. I ___ 16 ___ old. I ___ from Guadalajara, Mexico. This ___ my friend Diego. He ___ from Monterrey. ___ to meet you!",
    huecos: [
      { posicion: 0, respuesta_correcta: "Hi", alternativas_aceptadas: ["Hello", "hey"], pista: "Saludo informal" },
      { posicion: 1, respuesta_correcta: "name", pista: "My ___ is Valeria" },
      { posicion: 2, respuesta_correcta: "am", alternativas_aceptadas: ["'m"], pista: "I ___ (verbo to be, primera persona)" },
      { posicion: 3, respuesta_correcta: "years", pista: "___ old = años de edad" },
      { posicion: 4, respuesta_correcta: "am", alternativas_aceptadas: ["'m"], pista: "I ___ from (verbo to be)" },
      { posicion: 5, respuesta_correcta: "is", pista: "This ___ my friend" },
      { posicion: 6, respuesta_correcta: "is", alternativas_aceptadas: ["'s"], pista: "He ___ from (verbo to be, tercera persona)" },
      { posicion: 7, respuesta_correcta: "Nice", pista: "___ to meet you!" },
    ],
    distingue_mayusculas: false,
  },
  { // P02 — interacciones en el aula
    instrucciones: "Completa los diálogos de salón de clase con las palabras correctas: understand / repeat / open / page / question / mean / pairs / homework",
    texto_con_huecos: "Teacher: ___ your books to ___ 45. Work in ___ please.\nStudent: I have a ___. What does 'assignment' ___?\nTeacher: It means ___. Can you ___ that?\nStudent: Sorry, I don't ___. Could you speak more slowly?",
    huecos: [
      { posicion: 0, respuesta_correcta: "Open", pista: "___ your books" },
      { posicion: 1, respuesta_correcta: "page", pista: "to ___ 45" },
      { posicion: 2, respuesta_correcta: "pairs", pista: "Work in ___" },
      { posicion: 3, respuesta_correcta: "question", pista: "I have a ___" },
      { posicion: 4, respuesta_correcta: "mean", pista: "What does it ___?" },
      { posicion: 5, respuesta_correcta: "homework", pista: "It means ___ (tarea)" },
      { posicion: 6, respuesta_correcta: "repeat", pista: "Can you ___ that?" },
      { posicion: 7, respuesta_correcta: "understand", pista: "I don't ___" },
    ],
    distingue_mayusculas: false,
  },
  { // P03 — objetos y espacios
    instrucciones: "Describe los objetos completando las oraciones con las palabras del cuadro: big / small / red / blue / round / square / on / near",
    texto_con_huecos: "In my classroom there is a ___ green board ___ the wall. The teacher has a ___ brown desk. There are 30 ___ yellow chairs. The clock is ___ and white. It is ___ the board. The library is ___ the school — it is a ___ yellow building.",
    huecos: [
      { posicion: 0, respuesta_correcta: "big", alternativas_aceptadas: ["large"], pista: "Tamaño grande" },
      { posicion: 1, respuesta_correcta: "on", pista: "___ the wall (sobre/en)" },
      { posicion: 2, respuesta_correcta: "big", alternativas_aceptadas: ["large"], pista: "El escritorio es grande" },
      { posicion: 3, respuesta_correcta: "small", alternativas_aceptadas: ["little"], pista: "Sillas pequeñas" },
      { posicion: 4, respuesta_correcta: "round", pista: "El reloj es _____ (forma)" },
      { posicion: 5, respuesta_correcta: "near", alternativas_aceptadas: ["next to"], pista: "Cerca del pizarrón" },
      { posicion: 6, respuesta_correcta: "near", alternativas_aceptadas: ["next to"], pista: "La biblioteca está ___ la escuela" },
      { posicion: 7, respuesta_correcta: "big", alternativas_aceptadas: ["large"], pista: "Un edificio grande" },
    ],
    distingue_mayusculas: false,
  },
  { // P04 — información personal
    instrucciones: "Completa el formulario y el diálogo con las palabras correctas: name / old / from / nationality / email / address / phone / last",
    texto_con_huecos: "First ___: Ana. ___ name: García. Age: I am 17 years ___. I am ___ Oaxaca, Mexico. My ___ is Mexican. My ___ number is 951-234-5678. My home ___ is Calle Hidalgo 45. My ___ is ana.garcia@correo.com.",
    huecos: [
      { posicion: 0, respuesta_correcta: "name", pista: "First ___ = nombre de pila" },
      { posicion: 1, respuesta_correcta: "Last", alternativas_aceptadas: ["last"], pista: "___ name = apellido" },
      { posicion: 2, respuesta_correcta: "old", pista: "years ___" },
      { posicion: 3, respuesta_correcta: "from", pista: "I am ___ Oaxaca" },
      { posicion: 4, respuesta_correcta: "nationality", pista: "My ___ is Mexican" },
      { posicion: 5, respuesta_correcta: "phone", pista: "___ number = número de teléfono" },
      { posicion: 6, respuesta_correcta: "address", pista: "home ___ = domicilio" },
      { posicion: 7, respuesta_correcta: "email", pista: "Mi correo electrónico" },
    ],
    distingue_mayusculas: false,
  },
  { // P05 — preguntas sencillas
    instrucciones: "Completa las preguntas y respuestas con las palabras correctas: where / when / what / is / at / on / time / there",
    texto_con_huecos: "___ is the cafeteria? — It ___ next to the gym.\n___ time is it? — It is ___ 2:30 pm.\n___ does the class start? — It starts ___ Monday ___ 8 am.\nIs ___ a pharmacy near here? — Yes, ___ is one on the corner.",
    huecos: [
      { posicion: 0, respuesta_correcta: "Where", pista: "Pregunta de lugar" },
      { posicion: 1, respuesta_correcta: "is", pista: "It ___ next to..." },
      { posicion: 2, respuesta_correcta: "What", pista: "___ time is it?" },
      { posicion: 3, respuesta_correcta: "at", pista: "It is ___ 2:30 (hora específica)" },
      { posicion: 4, respuesta_correcta: "When", pista: "Pregunta de tiempo/día" },
      { posicion: 5, respuesta_correcta: "on", pista: "___ Monday (día de la semana)" },
      { posicion: 6, respuesta_correcta: "at", pista: "___ 8 am (hora)" },
      { posicion: 7, respuesta_correcta: "there", pista: "Is ___ a pharmacy..." },
    ],
    distingue_mayusculas: false,
  },
  { // P06 — describir personas, vestimenta y clima
    instrucciones: "Completa la descripción con las palabras correctas: wearing / tall / curly / sunny / has / black / cloudy / short",
    texto_con_huecos: "My friend Pablo is ___ and slim. He ___ short ___ hair and brown eyes. Today he is ___ a ___ jacket and jeans. Outside, the weather is ___. It is warm but a little ___. My sister is ___ with long straight hair.",
    huecos: [
      { posicion: 0, respuesta_correcta: "tall", pista: "Alto/a" },
      { posicion: 1, respuesta_correcta: "has", pista: "He ___ hair (tener)" },
      { posicion: 2, respuesta_correcta: "curly", alternativas_aceptadas: ["black"], pista: "Cabello rizado (o negro, según contexto)" },
      { posicion: 3, respuesta_correcta: "wearing", pista: "He is ___ (llevar puesto)" },
      { posicion: 4, respuesta_correcta: "black", alternativas_aceptadas: ["blue", "dark"], pista: "Color de la chamarra" },
      { posicion: 5, respuesta_correcta: "sunny", pista: "El clima es ___ (soleado)" },
      { posicion: 6, respuesta_correcta: "cloudy", pista: "Pero un poco ___ (nublado)" },
      { posicion: 7, respuesta_correcta: "short", pista: "Mi hermana es ___ (baja)" },
    ],
    distingue_mayusculas: false,
  },
  { // P07 — gustos y opiniones
    instrucciones: "Completa el diálogo sobre gustos con: like / love / don't / do / because / hate / really / boring",
    texto_con_huecos: "A: Do you ___ soccer? B: Yes, I ___ like it! I ___ it because it is exciting.\nA: And math? B: I ___ like math. It is ___.\nC: I ___ math! I think it is interesting ___ it helps me in real life.\nA: ___ you like English? B: Yes, I ___!",
    huecos: [
      { posicion: 0, respuesta_correcta: "like", pista: "Do you ___ soccer?" },
      { posicion: 1, respuesta_correcta: "really", pista: "I ___ like it = Me gusta mucho" },
      { posicion: 2, respuesta_correcta: "love", pista: "I ___ it = Me encanta" },
      { posicion: 3, respuesta_correcta: "don't", pista: "I ___ like math = No me gusta" },
      { posicion: 4, respuesta_correcta: "boring", pista: "It is ___ = Es aburrido" },
      { posicion: 5, respuesta_correcta: "love", pista: "I ___ math = Me encanta" },
      { posicion: 6, respuesta_correcta: "because", pista: "interesting ___ it helps..." },
      { posicion: 7, respuesta_correcta: "do", pista: "Yes, I ___! (respuesta afirmativa)" },
    ],
    distingue_mayusculas: false,
  },
  { // P08 — posesión y pertenencia
    instrucciones: "Completa las oraciones con el pronombre posesivo o genitivo correcto: my / her / his / their / whose / mine / 's / our",
    texto_con_huecos: "This is ___ book — it belongs to me. That is Ana___  pencil. It is ___. Carlos left ___ backpack in class. The students forgot ___ homework. ___ notebook is this? ___ teacher is very funny. This pen is not yours, it is ___.",
    huecos: [
      { posicion: 0, respuesta_correcta: "my", pista: "___ book = mi libro" },
      { posicion: 1, respuesta_correcta: "'s", pista: "Ana___ pencil (genitivo)" },
      { posicion: 2, respuesta_correcta: "hers", pista: "It is ___ = Es de ella (posesivo solo)" },
      { posicion: 3, respuesta_correcta: "his", pista: "Carlos left ___ backpack = su (de él)" },
      { posicion: 4, respuesta_correcta: "their", pista: "The students forgot ___ homework" },
      { posicion: 5, respuesta_correcta: "Whose", alternativas_aceptadas: ["whose"], pista: "___ notebook is this? = ¿De quién...?" },
      { posicion: 6, respuesta_correcta: "Our", alternativas_aceptadas: ["our"], pista: "___ teacher = nuestro/a maestro/a" },
      { posicion: 7, respuesta_correcta: "mine", pista: "it is ___ = es mío/mía" },
    ],
    distingue_mayusculas: false,
  },
];

// ── REFLEXIONES (A3) ──────────────────────────────────────────────────────────

const reflexiones = [
  { // P01 — presentaciones
    prompt: "Escribe en inglés una breve presentación tuya (5-8 oraciones) usando las estructuras aprendidas: nombre, edad, de dónde eres, algo que te gusta. Luego escribe en español: ¿qué fue lo más difícil de escribir en inglés? ¿Qué estructura nueva aprendiste en esta actividad?",
    pistas: ["Usa: My name is... / I am... years old. / I am from... / I like...", "Recuerda: el pronombre 'I' siempre va con mayúscula", "¿Puedes agregar una oración sobre tu amigo usando 'This is...'?"],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 250,
    criterios_evaluacion: ["Escribe al menos 5 oraciones en inglés con las estructuras aprendidas", "Usa correctamente el verbo to be", "Reflexiona en español sobre dificultades y aprendizajes", "Redacción clara en ambas lenguas"],
    formato_esperado: "libre" as const,
  },
  { // P02 — interacciones en el aula
    prompt: "Escribe un diálogo corto (6-8 intercambios) entre un estudiante y un maestro en clase de inglés. El estudiante debe pedir permiso para algo, aclarar una duda y responder a una instrucción. Luego reflexiona en español: ¿por qué crees que aprender estas frases de clase es importante aunque todavía no hables inglés perfectamente?",
    pistas: ["Incluye: May I...? / I don't understand. / Can you repeat that?", "¿Qué instrucciones da el maestro? (Open your book, Work in pairs...)", "¿Cómo responde el estudiante a las instrucciones?"],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 300,
    criterios_evaluacion: ["El diálogo incluye petición de permiso, aclaración de duda y respuesta a instrucción", "Usa vocabulario y frases del tema", "La reflexión en español es sustancial y personal", "Redacción coherente"],
    formato_esperado: "libre" as const,
  },
  { // P03 — objetos y espacios
    prompt: "Describe en inglés el lugar donde estudias o donde estás en este momento (puede ser tu cuarto, aula, biblioteca, etc.). Menciona al menos 6 objetos con sus características (color, tamaño, forma). Luego escribe en español: ¿qué diferencia notaste entre cómo se describe un objeto en inglés vs en español?",
    pistas: ["Recuerda: en inglés el adjetivo va antes del sustantivo (big blue table)", "Usa: There is a... / There are... para describir lo que hay", "¿Qué preposiciones de lugar puedes usar? (on, near, next to, in front of)"],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 250,
    criterios_evaluacion: ["Describe al menos 6 objetos con características (color, tamaño o forma)", "Usa correctamente el orden adjetivo-sustantivo en inglés", "Reflexiona sobre la diferencia estructural entre inglés y español", "Ortografía y vocabulario del tema"],
    formato_esperado: "libre" as const,
  },
  { // P04 — información personal
    prompt: "Imagina que llenas una solicitud de inscripción a un curso de verano en inglés. Escribe los datos que pedirían (nombre, apellido, edad, nacionalidad, dirección, teléfono, correo). Usa el formato de formulario. Luego reflexiona en español: ¿en qué situaciones reales de tu vida podrías necesitar dar información personal en inglés?",
    pistas: ["First name: / Last name: / Age: / Nationality: / Address: / Phone: / Email:", "¿Has visto formularios en inglés en aplicaciones, redes sociales o videojuegos?", "¿Qué datos son públicos y cuáles deberías proteger?"],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 250,
    criterios_evaluacion: ["Llena correctamente todos los campos del formulario en inglés", "Usa las estructuras y vocabulario del tema", "La reflexión identifica situaciones reales concretas", "Datos coherentes y bien formateados"],
    formato_esperado: "libre" as const,
  },
  { // P05 — preguntas sencillas
    prompt: "Escribe un mini-diálogo en inglés donde preguntas cómo llegar a un lugar y qué horario tiene. Usa al menos 3 preguntas con Where, When y What time. Luego reflexiona en español: ¿qué tan útil te parece saber hacer estas preguntas en inglés? ¿En qué situaciones reales de tu vida o de tu comunidad te serviría?",
    pistas: ["Usa: Excuse me, where is...? / What time does...open/close? / When is...?", "Responde con preposiciones: next to / near / in front of / on the corner", "Piensa en situaciones de turismo, trabajo, trámites"],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 250,
    criterios_evaluacion: ["El diálogo incluye al menos 3 preguntas con Where, When y What time", "Usa correctamente las preposiciones de tiempo y lugar", "Reflexión sobre utilidad práctica real y personal", "Diálogo fluido y coherente"],
    formato_esperado: "libre" as const,
  },
  { // P06 — describir personas, vestimenta y clima
    prompt: "Describe en inglés a una persona que conozcas (puede ser un familiar, amigo o personaje público). Menciona al menos: altura, complexión, color y tipo de cabello, color de ojos, y qué ropa lleva hoy o suele llevar. Luego agrega dos oraciones sobre el clima de hoy en tu ciudad en inglés. Reflexiona en español: ¿cómo describes a las personas de forma respetuosa en cualquier idioma?",
    pistas: ["She/He is tall/short/medium height and slim/heavy-set", "She/He has [tipo] [color] hair and [color] eyes", "She/He is wearing a [color] [prenda]", "Today the weather is [adjetivo] in [ciudad]"],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 300,
    criterios_evaluacion: ["Describe correctamente la apariencia física con vocabulario del tema", "Describe la vestimenta usando 'is wearing'", "Incluye dos oraciones sobre el clima", "Reflexión sobre el respeto en la descripción de personas"],
    formato_esperado: "libre" as const,
  },
  { // P07 — gustos y opiniones
    prompt: "Escribe en inglés 8-10 oraciones sobre tus gustos: qué te gusta, qué no te gusta, qué amas y qué odias (en diferentes áreas: comida, música, deportes, materias, actividades). Para cada gusto, da una razón usando 'because'. Luego reflexiona en español: ¿en qué se parecen y en qué se diferencian las formas de expresar gustos en inglés y en español?",
    pistas: ["I love / I like / I don't like / I hate + sustantivo o verbo-ing", "I like it because it is fun/interesting/delicious/exciting/easy", "I don't like it because it is boring/difficult/expensive/scary"],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 300,
    criterios_evaluacion: ["Escribe al menos 8 oraciones de gustos con razones", "Usa correctamente la estructura 'like + sustantivo/verbo-ing'", "Incluye variedad de intensidad (love, like, don't like, hate)", "Reflexión comparativa entre inglés y español"],
    formato_esperado: "libre" as const,
  },
  { // P08 — posesión y pertenencia
    prompt: "Escribe un párrafo corto en inglés describiendo los objetos de tu mochila o escritorio usando pronombres posesivos y el genitivo sajón. Por ejemplo: menciona qué es tuyo, qué es de algún familiar o amigo. Luego reflexiona en español: ¿por qué crees que el inglés usa el genitivo ('s) en vez de 'el libro de Ana' como en español? ¿Qué ventaja tiene esa estructura?",
    pistas: ["My backpack has... / In my bag there is my... and my friend's...", "Usa: my, your, his, her, our, their para objetos de distintas personas", "Usa el genitivo: 'Ana's pencil', 'Carlos's phone'"],
    longitud_minima_palabras: 80,
    longitud_maxima_palabras: 250,
    criterios_evaluacion: ["Usa al menos 4 pronombres posesivos diferentes correctamente", "Incluye al menos 2 ejemplos de genitivo sajón", "La reflexión compara las estructuras de inglés y español", "Redacción en inglés correcta y coherente"],
    formato_esperado: "libre" as const,
  },
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });

/**
 * Datos del laboratorio «In the classroom» — IN-I-P02 (Inglés I, semestre 1).
 *
 * Lo que este laboratorio NO quiere ser: una lista de frases sueltas para
 * memorizar. El aula no se resuelve recordando vocabulario, se resuelve
 * eligiendo el TURNO adecuado en una situación concreta. Por eso todo lo que
 * hay aquí es una situación con sus candidatos, un intercambio con su orden, o
 * la misma intención dicha a dos personas distintas.
 *
 * Contenido VERBATIM de la progresión IN-I-P02:
 *   · LECTURA_A1  ← IN-I-P02-A1 (lectura bilingüe)
 *   · QUIZ_A4     ← IN-I-P02-A4 (quiz de opción múltiple, 5 reactivos, 70%)
 *   · HECHOS_A5   ← IN-I-P02-A5 (verdadero/falso, 4 afirmaciones)
 *   · GLOSARIO_A6 ← IN-I-P02-A6 (glosario interactivo, 6 términos)
 *   · PREGUNTAS_A1← IN-I-P02-A1 (preguntas de comprensión)
 * El resto (situaciones, diálogos, pares de registro) es material nuevo escrito
 * para esta práctica: inglés estadounidense estándar de nivel A1, construido
 * con las MISMAS funciones y frases que la lectura A1 enseña. Ningún dato se
 * presenta como cita de una fuente real.
 *
 * Datos puros: ni React ni three. Seguro de importar desde el shell.
 */

import type { QuizEvaluable } from "./_reto-quiz";

export const TITULO_A1 = "In the classroom — Interacciones básicas en el aula";
export const FUENTE_A1 = "Material elaborado para CEN Bachillerato";

/** Lectura A1, verbatim, partida en párrafos. */
export const LECTURA_A1: string[] = [
  'En el salón de clase en inglés, hay frases esenciales que necesitas conocer. Para pedir permiso: "May I go to the bathroom?" (¿Puedo ir al baño?), "Can I open the window?" (¿Puedo abrir la ventana?). Para aclarar dudas: "I don\'t understand" (No entiendo), "Can you repeat that, please?" (¿Puede repetir eso, por favor?), "What does [palabra] mean?" (¿Qué significa [palabra]?).',
  'Cuando el maestro da instrucciones, escucharás frases como: "Open your book to page..." (Abran su libro en la página...), "Work in pairs" (Trabajen en parejas), "Listen and repeat" (Escuchen y repitan), "Write in your notebook" (Escriban en su cuaderno), "Hand in your homework" (Entreguen su tarea).',
  'Para participar activamente: "I have a question" (Tengo una pregunta), "I think the answer is..." (Creo que la respuesta es...), "I agree" (Estoy de acuerdo), "I disagree" (No estoy de acuerdo).',
  'Estar dispuesto a participar y no tener miedo a equivocarse es fundamental para aprender un idioma. Los errores son parte del proceso: "Practice makes perfect" (La práctica hace al maestro).',
];

/** Preguntas de comprensión de A1, verbatim. */
export const PREGUNTAS_A1: { pregunta: string; respuesta: string }[] = [
  { pregunta: "¿Cómo pides ir al baño en inglés?", respuesta: "May I go to the bathroom?" },
  { pregunta: "¿Qué significa 'Work in pairs'?", respuesta: "Trabajen en parejas." },
  { pregunta: "¿Cómo dices que no entendiste algo?", respuesta: "I don't understand. / Can you repeat that, please?" },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 1 — «Elige el turno adecuado»
 *
 * Una situación del aula y tres expresiones posibles. Las tres son inglés
 * correcto: ninguna tiene faltas. Lo que falla en las dos descartadas es la
 * FUNCIÓN (dicen otra cosa) o el REGISTRO (se lo dirías a un amigo, no a la
 * maestra). Por eso cada opción trae qué comunica de más o de menos: el alumno
 * no tiene que adivinar cuál «suena bien», tiene que leer qué está diciendo.
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Foco = "permiso" | "duda" | "significado" | "cortesia" | "participacion";

export const FOCO_INFO: Record<Foco, { titulo: string; icono: string; tono: number }> = {
  permiso: { titulo: "Pedir permiso", icono: "fa-hand", tono: 188 },
  duda: { titulo: "Aclarar una duda", icono: "fa-circle-question", tono: 262 },
  significado: { titulo: "Preguntar por una palabra", icono: "fa-language", tono: 44 },
  cortesia: { titulo: "Abrir el turno con cortesía", icono: "fa-door-open", tono: 152 },
  participacion: { titulo: "Participar y opinar", icono: "fa-comments", tono: 330 },
};

export interface OpcionTurno {
  /** La expresión en inglés (inglés estadounidense estándar). */
  texto: string;
  correcta: boolean;
  /** Qué comunica DE VERDAD esa frase: lo que dice de más o de menos. */
  comunica: string;
}

export interface Situacion {
  id: string;
  foco: Foco;
  /** La situación del aula, en español: el alumno sabe qué quiere lograr. */
  situacion: string;
  /** Lo que el alumno quiere conseguir con su turno. */
  intencion: string;
  opciones: OpcionTurno[];
  /** La regla que deja la situación, en español, con su ejemplo en inglés. */
  regla: string;
}

export const SITUACIONES: Situacion[] = [
  {
    id: "s1",
    foco: "duda",
    situacion: "La maestra acaba de explicar el tema y tú no comprendiste nada de la explicación.",
    intencion: "Avisarle que no comprendiste.",
    opciones: [
      { texto: "I don't understand.", correcta: true, comunica: "Dice exactamente lo que pasa: no comprendiste. Es la frase que la maestra necesita oír para volver a explicar." },
      { texto: "I don't like it.", correcta: false, comunica: "Comunica DE MÁS: dice que el tema no te gusta. Eso es una opinión sobre la clase, no un aviso de que te perdiste." },
      { texto: "I don't know.", correcta: false, comunica: "Comunica DE MENOS: dice que no sabes la respuesta a algo. No avisa que el problema fue la explicación." },
    ],
    regla: "understand = comprender; like = gustar; know = saber. Para avisar que te perdiste: I don't understand.",
  },
  {
    id: "s2",
    foco: "duda",
    situacion: "Sí entendiste el tema, pero la maestra habló rápido y te perdiste la última instrucción.",
    intencion: "Pedirle que lo diga otra vez.",
    opciones: [
      { texto: "Can you repeat that, please?", correcta: true, comunica: "Pide, no ordena: la pregunta (Can you...?) y el please dejan la decisión del otro lado. Es lo que se le dice a la maestra." },
      { texto: "Repeat.", correcta: false, comunica: "Comunica DE MÁS: en imperativo y sin please es una orden. Se la das a un perro o a una app, no a tu maestra." },
      { texto: "What?", correcta: false, comunica: "Comunica DE MENOS: solo avisa que algo no llegó. No pide nada y en inglés suena brusco; usa Sorry? o Excuse me? si te sale sin pensar." },
    ],
    regla: "Una petición cortés en inglés es una PREGUNTA: Can you...? / Could you...? + please. El imperativo pelado (Repeat.) es una orden.",
  },
  {
    id: "s3",
    foco: "permiso",
    situacion: "Necesitas ir al baño a la mitad de la clase.",
    intencion: "Pedir permiso para salir.",
    opciones: [
      { texto: "May I go to the bathroom?", correcta: true, comunica: "Pide permiso de la forma más cortés: May I...? es la fórmula que se usa con un adulto en la escuela." },
      { texto: "I go to the bathroom.", correcta: false, comunica: "Comunica DE MÁS: es una afirmación, avisa que te vas. No pide permiso, lo da por hecho." },
      { texto: "I want the bathroom.", correcta: false, comunica: "Comunica DE MENOS: expresa un deseo (I want = quiero). Un deseo no es una petición, y en inglés suena exigente." },
    ],
    regla: "May I...? > Can I...? en cortesía. Las dos piden permiso; May I...? es la que se usa con la maestra.",
  },
  {
    id: "s4",
    foco: "cortesia",
    situacion: "Llegas diez minutos tarde y la clase ya empezó. Estás en la puerta.",
    intencion: "Disculparte y pedir entrar.",
    opciones: [
      { texto: "Sorry I'm late. May I come in?", correcta: true, comunica: "Trae las dos partes en el orden correcto: primero la disculpa por lo que ya hiciste (llegar tarde), después la petición (entrar)." },
      { texto: "Hello, teacher! How are you?", correcta: false, comunica: "Comunica DE MENOS: saluda como si nada hubiera pasado. Falta la disculpa y falta pedir entrar." },
      { texto: "I'm late.", correcta: false, comunica: "Comunica DE MENOS: informa un hecho que todos ven. No se disculpa (Sorry) ni pide entrar." },
    ],
    regla: "Sorry se usa para disculparte por algo que YA hiciste. La disculpa va ANTES de la petición: Sorry I'm late. May I come in?",
  },
  {
    id: "s5",
    foco: "significado",
    situacion: "La maestra dijo la palabra 'assignment' y no sabes qué quiere decir.",
    intencion: "Preguntar el significado de esa palabra.",
    opciones: [
      { texto: "What does 'assignment' mean?", correcta: true, comunica: "Pregunta justo lo que no sabes: el significado. mean = significar." },
      { texto: "How do you say 'assignment'?", correcta: false, comunica: "Comunica OTRA COSA: pregunta cómo se dice algo EN inglés. Tú ya tienes la palabra en inglés; lo que te falta es qué significa." },
      { texto: "Can you spell 'assignment'?", correcta: false, comunica: "Comunica DE MENOS: pide que te la deletree letra por letra. Te dará A-S-S-I-G-N-M-E-N-T y seguirás sin saber qué es." },
    ],
    regla: "Tienes la palabra en inglés y te falta el significado → What does ... mean?",
  },
  {
    id: "s6",
    foco: "significado",
    situacion: "Quieres decir 'tarea' en inglés durante la clase, pero no recuerdas la palabra.",
    intencion: "Preguntar cómo se dice esa palabra en inglés.",
    opciones: [
      { texto: "How do you say 'tarea' in English?", correcta: true, comunica: "Pregunta justo lo que te falta: la palabra en inglés. Es la pregunta gemela de What does ... mean?" },
      { texto: "What does 'tarea' mean?", correcta: false, comunica: "Comunica OTRA COSA: pide el significado de una palabra que tú ya entiendes. Estarías preguntando qué es una tarea." },
      { texto: "Say 'tarea' in English.", correcta: false, comunica: "Comunica DE MÁS: es una orden en imperativo. Además no pregunta nada, manda." },
    ],
    regla: "Tienes la palabra en español y te falta la inglesa → How do you say ... in English?",
  },
  {
    id: "s7",
    foco: "cortesia",
    situacion: "La maestra está hablando y tú tienes una duda sobre el ejercicio.",
    intencion: "Pedir la palabra antes de preguntar.",
    opciones: [
      { texto: "Excuse me, I have a question.", correcta: true, comunica: "Excuse me abre el turno: pide la atención del otro antes de interrumpir. Después viene la pregunta." },
      { texto: "Sorry, I have a question.", correcta: false, comunica: "Comunica OTRA COSA: Sorry se disculpa por algo ya ocurrido. Aquí todavía no has hecho nada; solo estás pidiendo el turno." },
      { texto: "I have a doubt.", correcta: false, comunica: "Comunica DE MENOS: es un calco de «tengo una duda». En inglés doubt es dudar de algo (I doubt it = lo dudo). Una pregunta de clase es a question." },
    ],
    regla: "Excuse me abre el turno (antes). Sorry se disculpa (después). «Tengo una duda» = I have a question, no I have a doubt.",
  },
  {
    id: "s8",
    foco: "participacion",
    situacion: "Un compañero dio una respuesta que tú crees equivocada y la maestra pide opiniones.",
    intencion: "Decir que no estás de acuerdo sin ofender a nadie.",
    opciones: [
      { texto: "I disagree, because...", correcta: true, comunica: "Marca la postura (disagree = no estoy de acuerdo) y abre el porqué. Discute la idea, no a la persona." },
      { texto: "I agree.", correcta: false, comunica: "Comunica LO CONTRARIO: agree = estoy de acuerdo. Estarías apoyando justo lo que quieres discutir." },
      { texto: "You are wrong.", correcta: false, comunica: "Comunica DE MÁS: señala a la persona («tú estás mal»). En clase se discute la idea, no a quien la dijo." },
    ],
    regla: "I agree / I disagree marcan tu postura. Añade because... para dar la razón y discutir la idea, no a la persona.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 2 — «Arma el intercambio»
 *
 * Tres intercambios breves profesor↔alumno. El orden no es decorativo: la
 * pregunta va antes de la respuesta, la disculpa antes de la petición y el
 * permiso antes de hablar. Cada turno trae la PISTA de por qué le toca, para
 * que el error enseñe en vez de castigar.
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Quien = "teacher" | "student";

export interface Turno {
  id: string;
  quien: Quien;
  /** El turno en inglés. */
  texto: string;
  /** Su sentido en español (se revela al colocarlo). */
  es: string;
  /** Por qué le toca AHORA. Es lo que se muestra cuando alguien falla. */
  pista: string;
}

export interface Intercambio {
  id: string;
  titulo: string;
  /** La escena, en español. */
  contexto: string;
  turnos: Turno[];
}

export const INTERCAMBIOS: Intercambio[] = [
  {
    id: "d1",
    titulo: "Arriving late",
    contexto: "Llegas tarde a la clase de inglés. La puerta está cerrada y adentro ya están trabajando.",
    turnos: [
      { id: "d1-1", quien: "student", texto: "Sorry I'm late. May I come in?", es: "Perdón por llegar tarde. ¿Puedo pasar?", pista: "Primero la disculpa por llegar tarde, y en el mismo turno la petición de entrar. Nada puede ocurrir antes de esto." },
      { id: "d1-2", quien: "teacher", texto: "Yes, come in. Please sit down.", es: "Sí, pasa. Siéntate, por favor.", pista: "La maestra concede el permiso que le acaban de pedir. Una respuesta no puede ir antes de su petición." },
      { id: "d1-3", quien: "student", texto: "Thank you. What page are we on?", es: "Gracias. ¿En qué página vamos?", pista: "Ya entraste: agradeces y preguntas dónde va el grupo. La pregunta tiene que ir antes de la respuesta." },
      { id: "d1-4", quien: "teacher", texto: "We're on page 45. Work in pairs with Ana.", es: "Vamos en la página 45. Trabaja en parejas con Ana.", pista: "Contesta la pregunta de la página y da la instrucción del momento (Work in pairs)." },
      { id: "d1-5", quien: "student", texto: "OK. Thank you, Miss.", es: "De acuerdo. Gracias, maestra.", pista: "Cierre del intercambio: aceptas la instrucción y agradeces. Es el último turno." },
    ],
  },
  {
    id: "d2",
    titulo: "I don't understand",
    contexto: "La maestra da una instrucción para la actividad y tú no alcanzas a seguirla.",
    turnos: [
      { id: "d2-1", quien: "teacher", texto: "Open your books and write the answers in your notebook.", es: "Abran sus libros y escriban las respuestas en su cuaderno.", pista: "El intercambio empieza con la instrucción de la maestra: sin ella no habría nada que aclarar." },
      { id: "d2-2", quien: "student", texto: "Excuse me, I have a question.", es: "Disculpe, tengo una pregunta.", pista: "Excuse me abre el turno. Se pide la palabra ANTES de hacer la pregunta." },
      { id: "d2-3", quien: "teacher", texto: "Yes, go ahead.", es: "Sí, adelante.", pista: "La maestra concede la palabra. Hasta aquí todavía nadie ha dicho cuál es la duda." },
      { id: "d2-4", quien: "student", texto: "I don't understand the instructions. Can you repeat that, please?", es: "No entiendo las instrucciones. ¿Puede repetirlas, por favor?", pista: "Ya tienes la palabra: ahora sí dices cuál es el problema y pides que lo repitan." },
      { id: "d2-5", quien: "teacher", texto: "Of course. Open your books to page 45 and write the answers.", es: "Claro. Abran su libro en la página 45 y escriban las respuestas.", pista: "La maestra repite lo que le pidieron. Repetir sólo tiene sentido después de que se lo pidan." },
    ],
  },
  {
    id: "d3",
    titulo: "A new word",
    contexto: "Es el inicio de la clase. Hay que entregar la tarea y a ti te falta una palabra en inglés.",
    turnos: [
      { id: "d3-1", quien: "teacher", texto: "Good morning, everyone. Hand in your homework, please.", es: "Buenos días a todos. Entreguen su tarea, por favor.", pista: "El saludo y la instrucción de entregar la tarea abren la clase." },
      { id: "d3-2", quien: "student", texto: "Here it is. Excuse me, I have a question.", es: "Aquí está. Disculpe, tengo una pregunta.", pista: "Primero cumples la instrucción (entregar) y luego pides el turno con Excuse me." },
      { id: "d3-3", quien: "teacher", texto: "Sure. What is it?", es: "Claro. ¿Cuál es?", pista: "La maestra concede el turno y pregunta cuál es la duda." },
      { id: "d3-4", quien: "student", texto: "How do you say 'apuntes' in English?", es: "¿Cómo se dice 'apuntes' en inglés?", pista: "Ahora sí formulas la pregunta: tienes la palabra en español y te falta la inglesa." },
      { id: "d3-5", quien: "teacher", texto: "We say 'notes'. Listen and repeat: notes.", es: "Decimos 'notes'. Escuchen y repitan: notes.", pista: "La respuesta llega después de la pregunta, y la maestra añade su instrucción: Listen and repeat." },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * MODO 3 — «Formal o informal»
 *
 * La misma intención dicha a un compañero y dicha a la maestra. Informal NO es
 * incorrecto: es para un igual. Lo que cambia son marcas concretas —please,
 * could/may, la pregunta en lugar del imperativo, excuse me en lugar de hey— y
 * eso es lo que el alumno tiene que aprender a ver.
 * ═══════════════════════════════════════════════════════════════════════════ */

export type Registro = "informal" | "formal";

export const REGISTRO_INFO: Record<Registro, { titulo: string; subtitulo: string; icono: string }> = {
  informal: {
    titulo: "A un compañero",
    subtitulo: "Informal: directo, corto, entre iguales. No es incorrecto.",
    icono: "fa-user-group",
  },
  formal: {
    titulo: "A la maestra",
    subtitulo: "Formal: pregunta en vez de orden, con please y con distancia.",
    icono: "fa-chalkboard-user",
  },
};

export interface ParRegistro {
  id: string;
  /** La intención compartida, en español. */
  intencion: string;
  informal: string;
  formal: string;
  /** Qué marca exactamente la diferencia. */
  cambio: string;
}

export const PARES_REGISTRO: ParRegistro[] = [
  {
    id: "r1",
    intencion: "Llamar la atención de alguien antes de hablarle",
    informal: "Hey!",
    formal: "Excuse me.",
    cambio: "Hey! llama a gritos a un igual. Excuse me pide la atención con respeto y es lo que se usa con un adulto.",
  },
  {
    id: "r2",
    intencion: "Pedir que repitan algo",
    informal: "Say that again.",
    formal: "Could you repeat that, please?",
    cambio: "El imperativo (Say...) manda. La pregunta con Could you...? + please pide y deja al otro la decisión.",
  },
  {
    id: "r3",
    intencion: "Avisar que no entendiste",
    informal: "I don't get it.",
    formal: "I'm sorry, I don't understand.",
    cambio: "get it es coloquial (entre amigos). understand es la forma neutra, y I'm sorry suaviza la interrupción.",
  },
  {
    id: "r4",
    intencion: "Pedir permiso para entrar al salón",
    informal: "Can I come in?",
    formal: "May I come in?",
    cambio: "Las dos piden permiso. May I...? es la más cortés y la que se dirige a la maestra; Can I...? queda para un compañero.",
  },
  {
    id: "r5",
    intencion: "Pedir ayuda con un ejercicio",
    informal: "Help me with this.",
    formal: "Could you help me with this, please?",
    cambio: "Otra vez: imperativo (orden) frente a pregunta con could + please (petición).",
  },
  {
    id: "r6",
    intencion: "Mostrar desacuerdo con lo que se dijo",
    informal: "No way!",
    formal: "I'm afraid I disagree.",
    cambio: "No way! es una reacción fuerte entre amigos. I'm afraid... anuncia con suavidad que viene un desacuerdo.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * Contenido evaluable y de consulta, VERBATIM
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Quiz A4 verbatim (5 reactivos, mínimo 70%). */
export const QUIZ_A4: QuizEvaluable = {
  titulo: "Classroom language — Quiz",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "¿Cómo pides permiso para ir al baño?",
      opciones: ["I go to the bathroom.", "May I go to the bathroom?", "Bathroom please.", "I want bathroom."],
      respuestaCorrecta: 1,
      retroalimentacion: "'May I...?' es la forma cortés de pedir permiso.",
    },
    {
      enunciado: "No entendiste algo. ¿Qué frase usas?",
      opciones: ["I don't understand.", "I don't like.", "I am fine.", "I agree."],
      respuestaCorrecta: 0,
      retroalimentacion: "'I don't understand' = no entiendo.",
    },
    {
      enunciado: "El maestro dice 'Work in pairs'. Significa:",
      opciones: ["Trabajen solos", "Trabajen en parejas", "Cierren el libro", "Entreguen la tarea"],
      respuestaCorrecta: 1,
      retroalimentacion: "'In pairs' = en parejas.",
    },
    {
      enunciado: "¿Cómo pides que repitan algo?",
      opciones: ["Repeat please me.", "Can you repeat that, please?", "Again you say.", "What you said?"],
      respuestaCorrecta: 1,
      retroalimentacion: "'Can you repeat that, please?' es la forma correcta y cortés.",
    },
    {
      enunciado: "'Hand in your homework' significa:",
      opciones: ["Abran el cuaderno", "Levanten la mano", "Entreguen su tarea", "Escuchen y repitan"],
      respuestaCorrecta: 2,
      retroalimentacion: "'Hand in' = entregar.",
    },
  ],
};

/** Verdadero/falso A5, verbatim. */
export const HECHOS_A5: { enunciado: string; respuesta: boolean; retro: string }[] = [
  { enunciado: "'May I...?' se usa para pedir permiso de forma cortés.", respuesta: true, retro: "Correcto, es más cortés que 'Can I...?'." },
  { enunciado: "'I agree' significa 'no estoy de acuerdo'.", respuesta: false, retro: "'I agree' = estoy de acuerdo. 'I disagree' = no estoy de acuerdo." },
  { enunciado: "'Listen and repeat' es una instrucción del maestro.", respuesta: true, retro: "Sí: escuchen y repitan." },
  { enunciado: "'What does it mean?' sirve para preguntar el significado de una palabra.", respuesta: true, retro: "Correcto: ¿qué significa?" },
];

/** Glosario A6, verbatim (término · definición · ejemplo · etiqueta). */
export const GLOSARIO_A6: { termino: string; definicion: string; ejemplo: string; etiqueta: string }[] = [
  { termino: "May I...?", definicion: "Forma cortés de pedir permiso.", ejemplo: "May I go to the bathroom?", etiqueta: "permiso" },
  { termino: "I don't understand", definicion: "Frase para indicar que no comprendiste.", ejemplo: "Sorry, I don't understand.", etiqueta: "duda" },
  { termino: "Can you repeat that, please?", definicion: "Pedir que repitan algo de forma cortés.", ejemplo: "Can you repeat that, please?", etiqueta: "duda" },
  { termino: "Work in pairs", definicion: "Instrucción: trabajar en parejas.", ejemplo: "Now, work in pairs.", etiqueta: "instrucción" },
  { termino: "Hand in your homework", definicion: "Instrucción: entregar la tarea.", ejemplo: "Hand in your homework, please.", etiqueta: "instrucción" },
  { termino: "I agree / I disagree", definicion: "Expresar acuerdo o desacuerdo.", ejemplo: "I agree with you.", etiqueta: "participación" },
];

/** Las instrucciones del maestro que la lectura A1 enumera, verbatim. */
export const INSTRUCCIONES_A1: { en: string; es: string }[] = [
  { en: "Open your book to page...", es: "Abran su libro en la página..." },
  { en: "Work in pairs", es: "Trabajen en parejas" },
  { en: "Listen and repeat", es: "Escuchen y repitan" },
  { en: "Write in your notebook", es: "Escriban en su cuaderno" },
  { en: "Hand in your homework", es: "Entreguen su tarea" },
];

/** Cierre de la lectura A1, verbatim: por qué equivocarse está permitido. */
export const NOTA_PRACTICA =
  'Estar dispuesto a participar y no tener miedo a equivocarse es fundamental para aprender un idioma. Los errores son parte del proceso: "Practice makes perfect" (La práctica hace al maestro).';

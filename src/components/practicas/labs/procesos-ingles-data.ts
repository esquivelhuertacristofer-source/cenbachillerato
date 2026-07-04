/**
 * Datos del Laboratorio — Asking and answering about processes in English
 * (IN-V-P03, Inglés V · nivel A2+/B1).
 *
 * Contenido VERBATIM de IN-V·P03 ("Asking and answering about processes in
 * English"). La secuencia del proceso, las estructuras de pregunta, la voz
 * pasiva, el glosario y las afirmaciones del cuestionario se toman literalmente
 * de las actividades A1 (lectura), A2 (quiz), A4 (V/F) y A5 (glosario).
 *
 *  - MODO 1 (ordenar): los cuatro pasos + resultado del sistema de purificación
 *    de agua descrito en la entrevista de A1, usando conectores de
 *    procedimiento (First → Then → After that → Finally → As a result).
 *  - MODO 2 (clasificar): clasifica cada estructura en inglés según su función
 *    comunicativa (preguntar por un proceso / por una razón / pedir una
 *    explicación / describir con voz pasiva), a partir de A1 y A5.
 *  - MODO 3 (emparejar): glosario A5 verbatim — estructura ↔ definición.
 *  + Cuestionario de comprensión (V/F verbatim de A4).
 */

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 1 — Order the process (conectores de procedimiento, A1 verbatim)
 *
 * Pasos del sistema de purificación de agua tal como los enumera el experto en
 * la entrevista simulada de A1. Cada eslabón conserva su conector verbatim.
 * ───────────────────────────────────────────────────────────────────────── */
export const PASOS: { id: string; orden: number; conector: string; texto: string; traduccion: string }[] = [
  {
    id: "step-first",
    orden: 0,
    conector: "First",
    texto: "First, water is collected from a natural source, such as a river or a well.",
    traduccion: "Primero, el agua se recoge de una fuente natural, como un río o un pozo.",
  },
  {
    id: "step-then",
    orden: 1,
    conector: "Then",
    texto: "Then, large particles — like sand and leaves — are removed using a basic filter.",
    traduccion: "Luego, las partículas grandes — como arena y hojas — se eliminan con un filtro básico.",
  },
  {
    id: "step-after",
    orden: 2,
    conector: "After that",
    texto: "After that, the water passes through a layer of activated charcoal, which absorbs chemical impurities.",
    traduccion: "Después, el agua pasa por una capa de carbón activado, que absorbe las impurezas químicas.",
  },
  {
    id: "step-finally",
    orden: 3,
    conector: "Finally",
    texto: "Finally, a small amount of chlorine is added to kill bacteria and viruses.",
    traduccion: "Finalmente, se añade una pequeña cantidad de cloro para eliminar bacterias y virus.",
  },
  {
    id: "step-result",
    orden: 4,
    conector: "As a result",
    texto: "As a result, the water is safe for drinking.",
    traduccion: "Como resultado, el agua es segura para beber.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 2 — Classify the structure (función comunicativa, A1 + A5 verbatim)
 *
 * Clasifica cada estructura en inglés en la función que cumple. Las categorías
 * y los ejemplos provienen de A1 (preguntas con HOW/WHAT/WHY/CAN YOU EXPLAIN y
 * voz pasiva) y de A5 (glosario).
 * ───────────────────────────────────────────────────────────────────────── */
export type Funcion = "proceso" | "razon" | "explicacion" | "pasiva";

export const FUNCION_INFO: Record<
  Funcion,
  { titulo: string; subtitulo: string; icono: string }
> = {
  proceso: {
    titulo: "Ask about a process",
    subtitulo: "Preguntas con HOW y WHAT para saber cómo funciona algo o cuáles son sus pasos.",
    icono: "fa-gears",
  },
  razon: {
    titulo: "Ask for a reason",
    subtitulo: "Preguntas con WHY: piden la razón, la causa o la importancia de un concepto.",
    icono: "fa-circle-question",
  },
  explicacion: {
    titulo: "Politely ask to explain",
    subtitulo: "Peticiones corteses con CAN/COULD YOU EXPLAIN para pedir una aclaración.",
    icono: "fa-comments",
  },
  pasiva: {
    titulo: "Describe with passive voice",
    subtitulo: "Voz pasiva (is/are + participio) para describir el proceso, no al agente.",
    icono: "fa-arrow-right-arrow-left",
  },
};

export const ESTRUCTURAS: { id: string; texto: string; funcion: Funcion }[] = [
  { id: "es-how-work", texto: "How does a simple water purification system work?", funcion: "proceso" },
  { id: "es-what-steps", texto: "What are the steps to apply to a university program?", funcion: "proceso" },
  { id: "es-what-happens", texto: "What happens when people drink unpurified water?", funcion: "proceso" },
  { id: "es-why-important", texto: "Why is it important to use activated charcoal?", funcion: "razon" },
  { id: "es-why-need", texto: "Why do we need to add chlorine to the water?", funcion: "razon" },
  { id: "es-can-explain", texto: "Can you explain the process of water purification?", funcion: "explicacion" },
  { id: "es-could-explain", texto: "Could you explain the difference between hardware and software?", funcion: "explicacion" },
  { id: "es-is-used", texto: "Activated charcoal is used because it has a very large surface area.", funcion: "pasiva" },
  { id: "es-is-added", texto: "A small amount of chlorine is added to kill bacteria.", funcion: "pasiva" },
  { id: "es-are-removed", texto: "Large particles are removed using a basic filter.", funcion: "pasiva" },
];

/* ─────────────────────────────────────────────────────────────────────────
 * MODO 3 — Match structure and meaning (glosario A5, verbatim)
 * ───────────────────────────────────────────────────────────────────────── */
export const PARES: { id: string; termino: string; definicion: string; ejemplo: string }[] = [
  {
    id: "gl-process",
    termino: "What's the process for...?",
    definicion: "A question structure to ask about the steps or procedure involved in doing something. 'Process' refers to a series of actions or steps.",
    ejemplo: "'What's the process for analyzing a blood sample?' / 'What's the process for registering for a university course?'",
  },
  {
    id: "gl-how-work",
    termino: "How does... work?",
    definicion: "A question used to ask for an explanation of how a system, machine, concept, or process functions. Uses auxiliary 'does' for third person singular.",
    ejemplo: "'How does photosynthesis work?' / 'How does a circuit breaker work?' / 'How does this software work?'",
  },
  {
    id: "gl-could-explain",
    termino: "Could you explain...?",
    definicion: "A polite request for an explanation. 'Could you explain + noun/phrase?' is more formal and indirect than 'Can you explain...?' Structure: explain [something] to [someone].",
    ejemplo: "'Could you explain the difference between hardware and software?' / 'Could you explain this concept to me?'",
  },
  {
    id: "gl-first-second",
    termino: "First... Second... Finally...",
    definicion: "Structures for describing a process in order. These discourse markers help explain procedures step by step clearly.",
    ejemplo: "'The first step is to collect the data. Second, you organize it. Finally, you analyze and present your findings.'",
  },
  {
    id: "gl-used-designed",
    termino: "It is used to... / It is designed to...",
    definicion: "Passive voice structures to explain the purpose or function of a tool, concept, or procedure. 'Used to' = purpose; 'designed to' = intended function.",
    ejemplo: "'A microscope is used to observe cells that are invisible to the naked eye.' / 'This software is designed to process large amounts of data quickly.'",
  },
  {
    id: "gl-as-far",
    termino: "As far as I know... / In my understanding...",
    definicion: "Phrases to introduce an answer when you are not 100% certain. They show intellectual honesty and are common in academic and professional conversations.",
    ejemplo: "'As far as I know, the process takes about two weeks.' / 'In my understanding, the main function is to regulate temperature.'",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * Cuestionario de comprensión (V/F de A4, verbatim).
 * Renderizado como opción doble True / False.
 * ───────────────────────────────────────────────────────────────────────── */
export const QUIZ: {
  pregunta: string;
  opciones: [string, string];
  correcta: 0 | 1;
  retro: string;
}[] = [
  {
    pregunta: "The question 'What is the process for applying to a university program?' is grammatically correct in English.",
    opciones: ["True", "False"],
    correcta: 0,
    retro: "Correct! 'What is the process for + gerund/noun?' is a well-formed question. It uses 'for' + gerund ('applying') correctly. You can also say 'What is the procedure for...' or 'How do you apply to...?'",
  },
  {
    pregunta: "To ask about how something works, it is correct to say: 'How does this process work?' using the auxiliary 'does' with a third-person singular subject.",
    opciones: ["True", "False"],
    correcta: 0,
    retro: "Correct! In the present simple, questions with third-person singular subjects require 'does': 'How does it work?' / 'How does the system operate?' This is a fundamental grammar rule for forming information questions.",
  },
  {
    pregunta: "The sentence 'Could you explain me the steps?' is the most grammatically correct way to politely ask for an explanation in English.",
    opciones: ["True", "False"],
    correcta: 1,
    retro: "False. The correct structure is 'Could you explain the steps TO me?' or simply 'Could you explain the steps?' The verb 'explain' does not take a direct indirect object before the thing explained; use 'to me' at the end: 'explain [something] to [someone]'.",
  },
  {
    pregunta: "When answering a question about a process, using the passive voice ('The sample is collected and then analyzed') is appropriate in formal or technical contexts.",
    opciones: ["True", "False"],
    correcta: 0,
    retro: "Correct! The passive voice is common in technical and scientific explanations in English because the focus is on the action, not the person doing it. Example: 'The data is recorded, processed, and then reported.'",
  },
  {
    pregunta: "In English, 'What does DNA stand for?' is a correct way to ask about an abbreviation or acronym.",
    opciones: ["True", "False"],
    correcta: 0,
    retro: "Correct! 'What does [abbreviation] stand for?' is the standard English question to ask what letters in an acronym represent. Example: 'What does IT stand for?' — 'It stands for Information Technology.'",
  },
];

/** Dato verbatim de A1 (descripción de procesos en voz pasiva). */
export const DATO_PROCESOS =
  "La voz pasiva enfatiza el proceso, no el agente que lo realiza: en 'water is collected' o 'chlorine is added', el sujeto recibe la acción. Por eso es tan común al describir procedimientos técnicos en inglés.";

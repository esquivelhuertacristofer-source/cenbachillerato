/**
 * «Complete the text» — anecdota-ingles (IN-IV-P07).
 *
 * Son DOS textos, los dos VERBATIM de la progresión:
 *  · A2 «Fill in the Anecdote: Past Tenses in Action» — el mercado de
 *    artesanías de San Cristóbal de las Casas; seis huecos de past continuous
 *    y past simple.
 *  · A6 «Fill in the blanks — Narrating an anecdote» — el perro del vecino;
 *    cinco huecos de verbos en pasado y frase de reacción.
 *
 * El párrafo, las pistas, las respuestas y las alternativas aceptadas son las
 * de esas actividades; aquí sólo se parte cada texto por sus huecos.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const ANECDOTA_INGLES_HUECOS_A2: TextoHuecosData = {
  ancla: "IN-IV-P07-A2 · Fill in the Anecdote: Past Tenses in Action",
  instrucciones: "Complete the anecdote. Use the past continuous (was/were + verb-ing) or the past simple of the verb in parentheses.",
  partes: [
    "Last Saturday, I ",
    " (walk) through the Mercado de Artesanías in San Cristóbal de las Casas when I suddenly heard music. A group of musicians ",
    " (play) traditional Chiapaneca music near the entrance. While I ",
    " (watch) them, a child tugged at my sleeve. She ",
    " (sell) handmade bracelets and smiled at me. I ",
    " (buy) three bracelets. While I ",
    " (pay), the musicians started playing louder — it was a magical moment.",
  ],
  huecos: [
    { respuesta: "was walking", alternativas: [], pista: "Acción en progreso cuando ocurrió algo → past continuous (was + verb-ing)" },
    { respuesta: "were playing", alternativas: [], pista: "Acción en progreso (grupo de músicos) → past continuous (were + verb-ing)" },
    { respuesta: "was watching", alternativas: [], pista: "Acción en progreso (mientras miraba) → past continuous (was + verb-ing)" },
    { respuesta: "was selling", alternativas: [], pista: "Acción en progreso (estaba vendiendo) → past continuous (was + verb-ing)" },
    { respuesta: "bought", alternativas: [], pista: "Evento completado en el pasado → past simple (verbo irregular)" },
    { respuesta: "was paying", alternativas: [], pista: "Acción en progreso (mientras pagaba) → past continuous (was + verb-ing)" },
  ],
};

export const ANECDOTA_INGLES_HUECOS_A6: TextoHuecosData = {
  ancla: "IN-IV-P07-A6 · Fill in the blanks — Narrating an anecdote",
  instrucciones: "Completa los huecos con el conector narrativo, verbo en pasado o expresión de reacción correctos.",
  partes: [
    "You won't believe what ",
    " to me last week! I was walking to school when I ",
    " my neighbour's dog running loose down the street. Suddenly, it ",
    " chasing a cat into someone's garden. In the end, the owner ",
    " up and everything was fine. I ",
    " believe how chaotic it was!",
  ],
  huecos: [
    { respuesta: "happened", alternativas: [], pista: "What ___ to me = qué me pasó (pasado de 'happen')." },
    { respuesta: "saw", alternativas: ["noticed", "spotted"], pista: "Pasado irregular de 'see': see → ___." },
    { respuesta: "started", alternativas: ["began"], pista: "Pasado de 'start' (empezar a perseguir): ___ chasing." },
    { respuesta: "showed", alternativas: ["came"], pista: "Pasado de 'show up' (aparecer): the owner ___ up." },
    { respuesta: "couldn't", alternativas: ["could not", "couldnt"], pista: "Reaction phrase: 'I ___ believe how chaotic it was!'" },
  ],
};

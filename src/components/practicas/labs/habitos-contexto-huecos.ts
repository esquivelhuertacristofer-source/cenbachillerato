/**
 * «Complete the text» — habitos-contexto-ingles
 *
 * VERBATIM de las dos actividades fill_blanks de la progresión IN-IV-P03:
 *  · A2 «Routine Fill-in: Present Simple, Adverbs and Because»
 *  · A6 «Fill in the blanks — My daily routine explained»
 * El párrafo, las pistas, las respuestas y las alternativas aceptadas son las
 * de cada actividad; aquí sólo se parte el texto por sus huecos («___»).
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const HABITOS_CONTEXTO_HUECOS_A2: TextoHuecosData = {
  ancla: "IN-IV-P03-A2 · Routine Fill-in: Present Simple, Adverbs and Because",
  instrucciones:
    "Complete the paragraph. Choose the correct verb in present simple, frequency adverb (always, usually, rarely, never), or connector (because).",
  partes: [
    "My cousin Valentina ",
    " in Monterrey and has a very healthy lifestyle. She ",
    " goes for a run in the morning ",
    " it helps her feel more energetic. She never skips breakfast — she says that skipping meals makes her tired. She ",
    " eats junk food; maybe once a month is the maximum. Her brother, on the other hand, ",
    " exercises, but he ",
    " takes the stairs instead of the elevator.",
  ],
  huecos: [
    { respuesta: "lives", alternativas: [], pista: "Presente simple 3ª persona singular de 'live'" },
    { respuesta: "always", alternativas: [], pista: "100% del tiempo — ella corre todas las mañanas sin excepción" },
    { respuesta: "because", alternativas: [], pista: "Conector causal: introduce la razón por la que corre" },
    { respuesta: "rarely", alternativas: ["seldom", "hardly ever"], pista: "Rara vez — casi nunca come comida chatarra (máximo una vez al mes)" },
    { respuesta: "never", alternativas: ["rarely"], pista: "El hermano no hace ejercicio — adverbio de frecuencia cercano a 0%" },
    { respuesta: "always", alternativas: ["usually"], pista: "El hermano siempre/normalmente toma las escaleras" },
  ],
};

export const HABITOS_CONTEXTO_HUECOS_A6: TextoHuecosData = {
  ancla: "IN-IV-P03-A6 · Fill in the blanks — My daily routine explained",
  instrucciones: "Completa los huecos con el presente simple, el conector de propósito o la expresión de contexto correcta.",
  partes: [
    "On school days, I ",
    " up at 6:30 in order to have enough time for breakfast. I usually ",
    " my notes the night before so that I feel prepared. I'm used to ",
    " by public transport, which takes about 30 minutes. In the evening, I tend to ",
    " for at least half an hour to relax.",
  ],
  huecos: [
    { respuesta: "wake", alternativas: ["get"], pista: "Presente simple 1ª persona: I ___ up at 6:30." },
    { respuesta: "review", alternativas: ["read", "check", "revise", "study", "go over"], pista: "Hábito de estudiar: I usually ___ my notes." },
    { respuesta: "travelling", alternativas: ["commuting", "going", "traveling"], pista: "Be used to + verbo-ing: I'm used to ___ (viajar / ir)." },
    {
      respuesta: "read",
      alternativas: ["exercise", "walk", "draw", "run", "meditate", "rest", "paint", "dance", "swim", "play"],
      pista: "I tend to + verbo base: I tend to ___ to relax.",
    },
  ],
};

export const HABITOS_CONTEXTO_TEXTOS = [
  { id: "a2", etiqueta: "Text 1 · Valentina", data: HABITOS_CONTEXTO_HUECOS_A2 },
  { id: "a6", etiqueta: "Text 2 · My school day", data: HABITOS_CONTEXTO_HUECOS_A6 },
] as const;

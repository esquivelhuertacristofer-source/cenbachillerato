/**
 * «Completa el texto» — opiniones-preocupaciones-ingles
 *
 * VERBATIM de los dos `fill_blanks` de la progresión IN-V-P04:
 *  · A2 «Fill in the blanks: giving opinions with evidence» (el párrafo sobre
 *    el cambio climático en México).
 *  · A6 «Fill in the Blanks — Expressing Opinions and Concerns» (tecnología y
 *    escuelas rurales).
 * El párrafo, las pistas, las respuestas y las alternativas aceptadas son las
 * de cada actividad; aquí sólo se parte el texto por sus huecos («___»).
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

const TEXTO_A2 =
  "In my opinion, climate change is the ___ challenge of our generation. I believe that young people ___ take action now because we are the most affected generation. The evidence ___ that Mexico has experienced more droughts and floods in recent years. However, there are also reasons to be ___. For example, Mexico has increased its solar energy production. ___, I think that governments and citizens must work together. We could ___ by reducing our energy consumption and supporting renewable projects.";

const TEXTO_A6 =
  "In my ___, access to technology is essential for students today. I prefer learning ___ hands-on activities to reading textbooks. I am ___ about the lack of resources in rural schools. I strongly ___ that education should be a right, not a privilege.";

export const OPINIONES_HUECOS_A2: TextoHuecosData = {
  ancla: "IN-V-P04-A2 · Fill in the blanks: giving opinions with evidence",
  instrucciones: "Complete the opinion paragraph about the environment in Mexico with the correct word or phrase.",
  partes: TEXTO_A2.split("___"),
  huecos: [
    { respuesta: "biggest", alternativas: ["greatest", "most important", "most serious"], pista: "Superlativo de 'big' — el más grande" },
    { respuesta: "should", alternativas: ["must", "need to"], pista: "Modal de recomendación o deber — los jóvenes ___ actuar" },
    { respuesta: "suggests", alternativas: ["shows", "indicates", "proves"], pista: "'The evidence ___' — qué hace la evidencia con los datos" },
    { respuesta: "optimistic", alternativas: ["hopeful", "positive"], pista: "Adjetivo: cómo nos sentimos cuando creemos que el futuro será mejor" },
    { respuesta: "Overall", alternativas: ["In conclusion", "In summary", "To sum up"], pista: "Conector de conclusión — introduce la idea final del párrafo" },
    { respuesta: "start", alternativas: ["begin", "help", "contribute"], pista: "'We could ___' — verbo base (qué podemos hacer para empezar a cambiar)" },
  ],
};

export const OPINIONES_HUECOS_A6: TextoHuecosData = {
  ancla: "IN-V-P04-A6 · Fill in the Blanks — Expressing Opinions and Concerns",
  instrucciones: "Complete each blank with the correct word or phrase to express opinions, preferences, and concerns.",
  partes: TEXTO_A6.split("___"),
  huecos: [
    { respuesta: "opinion", alternativas: ["view"], pista: "'In my ___, access to technology is essential...' — which noun completes this phrase used to say what you personally think?" },
    { respuesta: "through", alternativas: ["with", "using"], pista: "'I prefer learning ___ hands-on activities...' — which preposition shows the method or means of learning?" },
    { respuesta: "worried", alternativas: ["concerned"], pista: "'I am ___ about the lack of resources...' — use the adjective that expresses concern or anxiety." },
    { respuesta: "believe", alternativas: ["think", "feel"], pista: "'I strongly ___ that education should be a right...' — what verb follows 'I strongly' to express a firm opinion?" },
  ],
};

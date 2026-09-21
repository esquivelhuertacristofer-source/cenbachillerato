/**
 * «Completa el texto» — instrucciones-ingles
 *
 * VERBATIM de IN-III-P06-A2 (Sequencing Instructions: Fill in the Blanks).
 * El párrafo, las pistas, las respuestas y las alternativas aceptadas son las
 * de esa actividad; aquí solo se parte el texto por sus once huecos.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const INSTRUCCIONES_INGLES_HUECOS: TextoHuecosData = {
  ancla: "IN-III-P06-A2 · Sequencing Instructions: Fill in the Blanks",
  instrucciones:
    "Complete the recipe instructions using the correct imperative form of the verbs and sequence connectors. Verbs: add, stir, heat, boil, serve, remove. Connectors: First, Then, After that, Next, Finally.",
  partes: [
    "",
    ", ",
    " a pot of water on the stove until it boils. ",
    ", ",
    " a pinch of salt and the pasta. ",
    " the pasta for ten minutes, stirring occasionally. ",
    ", ",
    " the pasta from the stove and drain it. ",
    ", ",
    " your favorite sauce and mix well. ",
    ", ",
    " hot with grated cheese on top.",
  ],
  huecos: [
    { respuesta: "First", alternativas: ["First of all"], pista: "Connector: beginning of a sequence" },
    { respuesta: "heat", alternativas: [], pista: "Imperative: heat the pot" },
    { respuesta: "Then", alternativas: ["Next"], pista: "Connector: next step" },
    { respuesta: "add", alternativas: [], pista: "Imperative: add salt and pasta" },
    { respuesta: "Boil", alternativas: ["Cook"], pista: "Imperative: boil/cook for 10 minutes" },
    { respuesta: "After that", alternativas: ["Then", "Next"], pista: "Connector: next action after boiling" },
    { respuesta: "remove", alternativas: ["take"], pista: "Imperative: remove/take from stove" },
    { respuesta: "Next", alternativas: ["Then", "After that"], pista: "Connector: following step" },
    { respuesta: "add", alternativas: ["pour"], pista: "Imperative: add the sauce" },
    { respuesta: "Finally", alternativas: ["Lastly"], pista: "Connector: last step" },
    { respuesta: "serve", alternativas: [], pista: "Imperative: serve it" },
  ],
};

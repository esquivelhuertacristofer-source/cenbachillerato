/**
 * «Completa el texto» — campo-estudio-ingles
 *
 * VERBATIM de los dos `fill_blanks` de la progresión IN-V-P01:
 *  · A2 «Fill in the blanks: describing academic and professional fields»
 *    (el párrafo de Sofia, ciencias ambientales).
 *  · A6 «Fill in the Blanks — Exploring Your Field of Study» (ciencias de la
 *    salud, con las frases del glosario).
 * El párrafo, las pistas, las respuestas y las alternativas aceptadas son las
 * de cada actividad; aquí sólo se parte el texto por sus huecos («___»).
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

const TEXTO_A2 =
  "My name is Sofia and I am ___ in environmental science. I study at the Universidad Nacional Autónoma de México, also known as ___. In my field, we ___ how climate change affects biodiversity in Mexico. I am also interested in renewable energy because I believe it is ___ for our future. Last semester, I ___ a research project about solar energy in Oaxaca. In the future, I hope to ___ as an environmental consultant.";

const TEXTO_A6 =
  "My ___ of study is health sciences. This field ___ working with patients and analyzing medical data. Professionals in this area are ___ in biology, chemistry, and human anatomy. One of the main ___ of this field is to improve people's quality of life.";

export const CAMPO_ESTUDIO_HUECOS_A2: TextoHuecosData = {
  ancla: "IN-V-P01-A2 · Fill in the blanks: describing academic and professional fields",
  instrucciones: "Complete the sentences by filling in the blanks with the correct word or phrase.",
  partes: TEXTO_A2.split("___"),
  huecos: [
    { respuesta: "interested", alternativas: ["very interested", "really interested"], pista: "Adjetivo que expresa interés: I am ___ in..." },
    { respuesta: "UNAM", alternativas: ["the UNAM", "unam"], pista: "It is the largest university in Mexico" },
    { respuesta: "study", alternativas: ["analyze", "research", "investigate"], pista: "What do scientists do with problems?" },
    { respuesta: "essential", alternativas: ["important", "crucial", "necessary", "vital"], pista: "Not just important, but absolutely necessary" },
    { respuesta: "completed", alternativas: ["did", "finished", "carried out"], pista: "Past simple of 'complete'" },
    { respuesta: "work", alternativas: ["practice", "work professionally", "develop my career"], pista: "What do you do in a job?" },
  ],
};

export const CAMPO_ESTUDIO_HUECOS_A6: TextoHuecosData = {
  ancla: "IN-V-P01-A6 · Fill in the Blanks — Exploring Your Field of Study",
  instrucciones: "Complete each blank with the correct word or phrase. Pay attention to grammar and vocabulary.",
  partes: TEXTO_A6.split("___"),
  huecos: [
    { respuesta: "field", alternativas: ["area"], pista: "We say 'My ___ of study is...' to introduce our subject. Use a noun that means 'domain of knowledge'." },
    { respuesta: "involves", alternativas: ["includes"], pista: "The verb '___ + gerund' is used to describe what activities a field includes. Think: 'This field ___ working...'" },
    { respuesta: "interested", alternativas: ["trained", "skilled", "specialized", "specialised", "experienced"], pista: "They are ___ in biology... Use the adjective that goes with the preposition 'in' to express interest." },
    { respuesta: "goals", alternativas: ["objectives", "aims"], pista: "'One of the main ___ of this field is to...' — think of words that mean 'objectives' or 'purposes'." },
  ],
};

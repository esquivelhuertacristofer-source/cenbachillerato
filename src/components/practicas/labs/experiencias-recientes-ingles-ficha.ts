/**
 * Ficha teórica — experiencias-recientes-ingles (progresión IN-III-P02).
 *
 * El marco teórico es la lectura IN-III-P02-A1 palabra por palabra. El glosario
 * son los seis términos de IN-III-P02-A5, también verbatim. Los conceptos
 * centrales son los ocho términos que el laboratorio hace manipular, escritos
 * cortos a propósito: cada uno recibe su viñeta ilustrada en la expedición.
 *
 * Escrito a mano para esta práctica; NO lo regeneres con
 * scripts/generar-fichas-labs.ts sin revisar los conceptos.
 */
import type { FichaTeoricaData } from "./_ficha";

export const EXPERIENCIAS_RECIENTES_INGLES_FICHA: FichaTeoricaData = {
  ancla: "IN-III-P02-A1 · Have You Ever...? Sharing Recent Experiences",
  marcoTeorico: [
    "The present perfect tense in English is one of the most useful and, at first, one of the most confusing. Once you understand what it does, you will use it constantly. Its main function is to talk about life experiences without saying when exactly they happened.",
    "The structure of the present perfect is: subject + have/has + past participle. With I, you, we, and they: I have visited Mexico City. We have eaten tamales. With he, she, and it: She has traveled to Oaxaca. He has never tried mole negro.",
    "To form the past participle, regular verbs add -ed (visit → visited, travel → traveled, live → lived). Irregular verbs must be memorized because they change in unpredictable ways: go → gone, eat → eaten, see → seen, be → been, have → had, do → done, write → written, speak → spoken, take → taken, give → given.",
    "The word 'ever' is used in questions to ask about any point in a person's life up to now: Have you ever visited a cenote? Have you ever tried chapulines (grasshoppers)? Have you ever seen a volcano up close? The answer is: Yes, I have. or No, I have not. (or No, I never have.)",
    "The word 'never' is used in negative statements to emphasize that an experience has never happened at any point in life: I have never eaten huitlacoche. She has never been to Chiapas. We have never seen the monarch butterflies in Michoacan.",
    "We use 'for' and 'since' with the present perfect to describe situations that started in the past and continue now. 'For' is followed by a duration: I have lived in Guadalajara for three years. 'Since' is followed by a starting point: I have studied English since 2021. We have been classmates since primary school.",
    "It is important to contrast the present perfect with the simple past. Use the present perfect for experiences with no specific time given: I have eaten tacos at a taqueria. Use the simple past when you mention a specific time: I ate tacos last Friday at the taqueria on the corner of Insurgentes. The same experience can be talked about with both tenses, but for different communicative purposes.",
  ],
  objetivos: [
    "Arma las cuatro charlas eligiendo, turno por turno, la línea que sí encaja.",
    "Reconoce el salto: la pregunta abre en present perfect y el seguimiento cambia a past simple.",
    "Coloca ever, never, already, yet y just en su posición, y decide entre for y since.",
    "Cuenta la misma vivencia de dos maneras: con fecha y sin fecha.",
    "Completa el párrafo de A2 escribiendo las ocho formas verbales.",
    "Aprueba el reto evaluable (quiz A4).",
  ],
  materiales: [],
  conceptos: [
    {
      termino: "Have you ever...?",
      definicion:
        "La pregunta de experiencia: have/has + sujeto + ever + participio. Pregunta por toda la vida hasta hoy y no fija ningún momento. Ejemplo: Have you ever tried chapulines?",
    },
    {
      termino: "Yes, I have.",
      definicion:
        "La respuesta corta: repite el auxiliar de la pregunta y nunca el verbo principal. Have you...? → Yes, I have. / No, I haven't. Contestar «Yes, I did» es el error más frecuente.",
    },
    {
      termino: "El salto al pasado",
      definicion:
        "En cuanto alguien pregunta cuándo, dónde o con quién, la conversación cambia a past simple: «Have you ever been to Yucatán?» → «When did you go?» → «I went in 2023.»",
    },
    {
      termino: "Experiencia sin fecha",
      definicion: "Lo que vale es haberlo vivido, no el momento. Va en present perfect: I have visited Oaxaca.",
    },
    {
      termino: "Hecho con fecha",
      definicion:
        "Cuando la frase dice cuándo (last year, in 2024, two summers ago, when I was twelve), el verbo va en past simple: I visited Oaxaca in 2024.",
    },
    {
      termino: "just",
      definicion: "Acabar de: algo que pasó hace un momento. Va entre el auxiliar y el participio, igual que already y always: The bus has just arrived.",
    },
    {
      termino: "for / since",
      definicion: "For + duración (for three years). Since + punto de inicio (since 2021, since primary school). Los dos, con present perfect.",
    },
    {
      termino: "Participio irregular",
      definicion: "La tercera forma del verbo, que hay que memorizar: go → gone, eat → eaten, see → seen, be → been, write → written, take → taken.",
    },
  ],
  glosario: [
    { termino: "have / has + past participle", definicion: "Estructura del presente perfecto (experiencias, logros recientes). Ejemplo: I have visited Teotihuacan twice." },
    { termino: "past participle", definicion: "3ª forma del verbo: visited, eaten, seen, been, done. Ejemplo: Have you seen this movie?" },
    { termino: "ever / never", definicion: "Alguna vez / nunca — marcadores de experiencia. Ejemplo: Have you ever tried Thai food? — I have never tried it." },
    { termino: "already / yet", definicion: "Ya (afirmativo) / todavía no (negativo/pregunta). Ejemplo: I have already done my homework. / She hasn't called yet." },
    { termino: "with whom / with my family", definicion: "Con quién — para describir experiencias compartidas. Ejemplo: I have travelled to Oaxaca with my family." },
    { termino: "Have you...? / I have...", definicion: "Estructura de pregunta y respuesta en presente perfecto. Ejemplo: Have you ever cooked a big meal? — Yes, I have!" },
  ],
  aplicaciones: [
    "La encuesta que pide la lectura A1: pregunta a cinco compañeros tres cosas con «Have you ever…?» sobre comida, viajes y experiencias culturales, y reporta lo que contestaron.",
    "La tarea escrita A3: tres experiencias en present perfect y, para las que sí viviste, una oración en past simple diciendo cuándo o dónde fue.",
    "Presentarte en una entrevista o en un intercambio escolar: «I have studied English for three years and I have lived in Guadalajara since 2021.»",
  ],
  fuente: "CEN Bachillerato — UAC Inglés III · progresión IN-III-P02",
};

/**
 * «Complete the text» — textos-funcionales-ingles (IN-V-P06).
 *
 * Son DOS correos, los dos VERBATIM de la progresión:
 *  · A2 «Fill in the blanks: estructura del correo formal en inglés» — Carlos Mendoza pide información a Dr. Ramírez.
 *  · A6 «Fill in the Blanks — Writing a Formal Email in English» — Ana López pide unas prácticas a Dr. Ramos.
 *
 * El texto, las pistas, las respuestas y las alternativas aceptadas son las de
 * esas actividades; aquí sólo se parte cada texto por sus huecos.
 */
import type { TextoHuecosData } from "./_mecanica-huecos";

export const TEXTOS_FUNCIONALES_HUECOS_A2: TextoHuecosData = {
  ancla: "IN-V-P06-A2 · Fill in the blanks: estructura del correo formal en inglés",
  instrucciones: "Complete the formal email by filling in the missing parts. Each blank corresponds to a key element of formal email writing.",
  partes: [
    "Subject: ",
    " about Environmental Science Program\n\nDear Dr. Ramírez,\n\nI am writing to ",
    " information about the environmental science program at your university. My name is Carlos Mendoza and I am currently a ",
    " student at COBACH in Oaxaca.\n\nI am very interested in your program because I have always been passionate about ",
    ". Could you please send me the admission requirements? I would also appreciate information about ",
    ".\n\nThank you ",
    " for your time.\n\nSincerely,\nCarlos Mendoza"
  ],
  huecos: [
    {
      respuesta: "Inquiry",
      alternativas: [
        "Information",
        "Question",
        "Request"
      ],
      pista: "Un sustantivo que resume el propósito del correo — se pone en el Subject / Asunto"
    },
    {
      respuesta: "request",
      alternativas: [
        "ask for",
        "obtain",
        "get"
      ],
      pista: "'I am writing to ___ information' — verbo formal para pedir/solicitar"
    },
    {
      respuesta: "high school",
      alternativas: [
        "bachillerato",
        "preparatoria",
        "secondary school"
      ],
      pista: "¿Qué tipo de estudiante es Carlos actualmente?"
    },
    {
      respuesta: "the environment",
      alternativas: [
        "environmental issues",
        "environmental science",
        "nature",
        "ecology"
      ],
      pista: "¿De qué es apasionado Carlos? (clue: el programa que le interesa)"
    },
    {
      respuesta: "scholarships",
      alternativas: [
        "financial aid",
        "grants",
        "bursaries",
        "financial support"
      ],
      pista: "¿Qué tipo de apoyo económico podría solicitar un estudiante a una universidad?"
    },
    {
      respuesta: "very much",
      alternativas: [
        "so much"
      ],
      pista: "'Thank you ___ for your time' — expresión de agradecimiento formal intensificada"
    }
  ],
};

export const TEXTOS_FUNCIONALES_HUECOS_A6: TextoHuecosData = {
  ancla: "IN-V-P06-A6 · Fill in the Blanks — Writing a Formal Email in English",
  instrucciones: "Complete the formal email with the correct word or phrase in each blank.",
  partes: [
    "Dear Dr. Ramos, I am ",
    " to request information about the internship program at your health center. I am currently ",
    " health sciences and I am interested in gaining practical experience. I would ",
    " to schedule a brief meeting at your convenience. Please ",
    " attached my CV for your review. I look forward to ",
    " from you. Best regards, Ana López"
  ],
  huecos: [
    {
      respuesta: "writing",
      alternativas: [],
      pista: "'I am ___ to request information...' — Think of the standard opening of a formal email: what are you doing right now with this message?"
    },
    {
      respuesta: "studying",
      alternativas: [],
      pista: "'I am currently ___ health sciences' — use the present continuous of the verb that means 'to be a student of a subject'."
    },
    {
      respuesta: "like",
      alternativas: [],
      pista: "'I would ___ to schedule a meeting...' — 'I would ___ to + verb' is a polite request structure."
    },
    {
      respuesta: "find",
      alternativas: [],
      pista: "'Please ___ attached my CV...' — this is a standard phrase to mention an attached file in an email."
    },
    {
      respuesta: "hearing",
      alternativas: [],
      pista: "'I look forward to ___ from you' — gerund after 'look forward to'."
    }
  ],
};

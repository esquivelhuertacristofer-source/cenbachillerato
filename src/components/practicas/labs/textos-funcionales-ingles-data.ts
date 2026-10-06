/**
 * Contenido VERBATIM de la progresión IN-V-P06 (Inglés V) — «Redacta textos
 * funcionales para informar, solicitar o proponer acciones».
 *
 * Sale tal cual de las actividades publicadas (scripts/dump-actividades.ts
 * --progresion IN-V-P06). Nada se reescribe: el laboratorio lo enseña en la
 * pestaña «Teoría», lo cita en la bandeja y lo usa en el reto y el glosario.
 *  · A1 lectura «Writing functional texts: emails and proposals in English».
 *  · A3 y A7 autoevaluaciones.
 *  · A4 verdadero/falso (el reto).
 *  · A5 glosario.
 *  · A8 video (sus preguntas).
 *  · A9 ordenar el correo formal (el correo modelo de la misión de Ms. Rivera).
 * A2 y A6 (textos con huecos) viven en `textos-funcionales-ingles-huecos.ts`.
 */

/* ── A1 · lectura ─────────────────────────────────────────────────────── */
export const LECTURA = {
  ancla: "IN-V-P06-A1",
  titulo: "Writing functional texts: emails and proposals in English",
  intro: "Los textos funcionales (functional texts) son textos escritos para lograr un propósito concreto: informar, solicitar, proponer, agradecer o confirmar. En el nivel B1, aprenderás a escribir correos formales y propuestas breves en inglés.",
  estructuraTitulo: "ESTRUCTURA DEL CORREO FORMAL EN INGLÉS",
  estructura: [
    {
      titulo: "1. Subject (Asunto): breve y claro. Indica el propósito del correo.",
      detalle: "Ejemplo: \"Inquiry About Environmental Science Program\""
    },
    {
      titulo: "2. Salutation (Saludo formal):",
      detalle: "• Dear Mr. [Apellido], — para hombre\n• Dear Ms. [Apellido], — para mujer (formal, sin especificar estado civil)\n• Dear Dr. [Apellido], — para doctor(a)\n• Dear Sir/Madam, — cuando no sabes el nombre"
    },
    {
      titulo: "3. Purpose (Propósito — primer párrafo):",
      detalle: "Explica por qué escribes. Sé directo y claro.\nEjemplo: \"I am writing to request information about your summer program in environmental science.\""
    },
    {
      titulo: "4. Body (Desarrollo):",
      detalle: "Amplía el propósito con detalles relevantes. Organiza con conectores.\nEjemplo: \"I am currently a high school student in my fifth semester at COBACH Oaxaca. I have a strong interest in environmental issues, particularly water management and biodiversity conservation.\""
    },
    {
      titulo: "5. Closing (Cierre cortés):",
      detalle: "Agradece y expresa expectativa de respuesta.\nEjemplo: \"Thank you very much for your time. I look forward to hearing from you.\""
    },
    {
      titulo: "6. Sign-off (Despedida formal):",
      detalle: "• Sincerely, — formal, para cuando conoces el nombre del destinatario\n• Best regards, — semi-formal, muy usado en contextos académicos y profesionales\n• Yours faithfully, — muy formal, para Dear Sir/Madam"
    },
    {
      titulo: "7. Signature (Firma): Nombre completo + datos de contacto si es necesario.",
      detalle: ""
    }
  ],
  registroTitulo: "DIFERENCIAS REGISTRO FORMAL vs. INFORMAL:",
  registroCabecera: ["Formal","Informal"],
  registro: [
    [
      "I am writing to request...",
      "Hey, I wanted to ask..."
    ],
    [
      "Could you please...",
      "Can you...?"
    ],
    [
      "I would appreciate...",
      "I'd love it if..."
    ],
    [
      "I look forward to...",
      "Can't wait to..."
    ],
    [
      "Sincerely,",
      "Best, / See you,"
    ]
  ],
  ejemplo1Titulo: "EJEMPLO 1 — Correo formal real: solicitar información sobre una carrera universitaria",
  ejemplo1: "Subject: Inquiry About Admission Requirements — Biology Program\n\nDear Dr. Fuentes,\n\nI am writing to request information about the admission requirements for the Biology program at the Universidad Autónoma de Baja California. My name is Andrea Salinas, and I am currently completing my fifth semester of bachillerato at CBTis 58 in Mexicali.\n\nI am particularly interested in your program because I would like to specialize in marine biology and contribute to the conservation of species in the Gulf of California. Could you please send me information about the required entrance exam (examen de admisión) and any scholarship opportunities available for incoming students?\n\nI would also appreciate any advice about how to best prepare for the application process.\n\nThank you very much for your time and assistance.\n\nSincerely,\nAndrea Salinas\nandrea.salinas@email.com",
  ejemplo2Titulo: "EJEMPLO 2 — Propuesta breve: proponer un proyecto ambiental para la escuela",
  ejemplo2: "Proposal: School Recycling Program — \"Green COBACH\"\n\nPurpose: We propose creating a school-wide recycling program to reduce waste and raise environmental awareness among students and teachers.\n\nObjective: To install three recycling stations (paper, plastic, and organic waste) in the main areas of the school by the end of the semester.\n\nActions:\n1. We would like to organize a presentation for students and teachers to explain the importance of recycling.\n2. We could design the recycling stations ourselves using recycled materials.\n3. Each month, we would monitor the amount of waste collected and share results with the school community.\n\nExpected results: We believe this project could reduce the school's waste by at least 30% and inspire students to continue recycling at home.",
  vocabularioTitulo: "VOCABULARIO DE CORTESÍA PARA TEXTOS FUNCIONALES:",
  vocabulario: [
    "\"I would like to...\" (Me gustaría...) — expresar un deseo o intención de forma educada",
    "\"Could you please...\" (¿Podría por favor...?) — hacer una solicitud formal",
    "\"I would appreciate...\" (Agradecería...) — expresar gratitud anticipada",
    "\"I look forward to hearing from you.\" (Quedo en espera de su respuesta.) — cierre estándar de correo formal",
    "\"Please do not hesitate to contact me if you have any questions.\" (No dude en contactarme si tiene preguntas.)"
  ],
  callout: "En un correo formal en inglés se evitan las contracciones: se escribe «I am writing» y «I would like», no «I'm writing» ni «I'd like».",
  fuente: "Material CEN Bachillerato — IN-V (A2+/B1)",
  preguntas: [
    {
      pregunta: "¿Cuáles son las 6 partes de un correo formal en inglés? Menciónalas en orden.",
      respuesta: "1. Subject (Asunto), 2. Salutation (Saludo formal: Dear Mr./Ms./Dr.), 3. Purpose (Propósito: por qué escribes), 4. Body (Desarrollo: detalles relevantes), 5. Closing (Cierre cortés: agradecimiento + expectativa de respuesta), 6. Sign-off + Signature (Sincerely / Best regards + nombre)."
    },
    {
      pregunta: "¿Qué diferencia hay entre usar 'Sincerely' y 'Best regards'? ¿Cuándo usarías cada uno?",
      respuesta: "'Sincerely' es más formal y se usa cuando conoces el nombre del destinatario (Dear Dr. Fuentes). 'Best regards' es semi-formal y se usa en contextos académicos y profesionales donde hay cierta familiaridad o relación establecida. 'Yours faithfully' se usa cuando no conoces el nombre (Dear Sir/Madam)."
    },
    {
      pregunta: "¿Qué características tiene la propuesta del ejemplo que la hacen clara y profesional?",
      respuesta: "La propuesta es clara y profesional porque: (1) tiene secciones bien definidas (Purpose, Objective, Actions, Expected results), (2) usa lenguaje de cortesía y condicional ('we would like', 'we could'), (3) incluye datos específicos (tres estaciones de reciclaje, reducción del 30%), (4) propone acciones concretas con verbos de acción (organize, design, monitor), y (5) conecta el proyecto con la comunidad escolar."
    }
  ],
};

/* ── A3 y A7 · autoevaluaciones ───────────────────────────────────────── */
export const AUTOEVALUACIONES = [
  {
    ancla: "IN-V-P06-A3 · Autoevaluación: ¿puedo escribir textos funcionales en inglés?",
    criterios: [
      "Escribo correos formales con la estructura correcta (asunto, saludo, propósito, desarrollo, cierre, firma)",
      "Uso registro formal apropiado (evito contracciones, uso vocabulario de cortesía)",
      "Mis textos tienen cohesión: uso pronombres de referencia, sinónimos y conectores para evitar repeticiones",
      "El propósito de mi texto queda claro desde el primer párrafo"
    ],
    escala: [
      {
        valor: 1,
        etiqueta: "Nunca",
        descripcion: "Nunca logro aplicar esto en mis producciones orales o escritas en inglés."
      },
      {
        valor: 2,
        etiqueta: "A veces",
        descripcion: "Lo aplico ocasionalmente pero cometo errores frecuentes."
      },
      {
        valor: 3,
        etiqueta: "Casi siempre",
        descripcion: "Lo aplico correctamente en la mayoría de los casos con pocas equivocaciones."
      },
      {
        valor: 4,
        etiqueta: "Siempre",
        descripcion: "Lo aplico de manera consistente y puedo explicar cuándo y por qué usarlo."
      }
    ],
    reflexion: "¿Cuál tipo de texto funcional (correo, propuesta, solicitud) te resulta más difícil de escribir en inglés y por qué? ¿Qué estrategia vas a usar para mejorar esa habilidad específica?",
  },
  {
    ancla: "IN-V-P06-A7 · Autoevaluación — Redacto textos funcionales en inglés",
    instrucciones: "Marca tu nivel honesto en cada criterio.",
    criterios: [
      "Puedo estructurar un correo formal en inglés con saludo, propósito, cuerpo, cierre y despedida de manera correcta.",
      "Uso frases de apertura formal ('I am writing to...') y cierre ('I look forward to hearing from you') de forma natural y correcta.",
      "Redacto solicitudes respetuosas usando 'I would like to...' o 'I would appreciate it if...' en lugar de formas demasiado directas o informales.",
      "Evito contracciones y registro informal en mi escritura formal en inglés, manteniendo un tono profesional."
    ],
    escala: [
      {
        valor: 1,
        etiqueta: "En inicio",
        descripcion: "Todavía necesito apoyo y consultar el material."
      },
      {
        valor: 2,
        etiqueta: "En proceso",
        descripcion: "Lo logro con algunos errores o dudas."
      },
      {
        valor: 3,
        etiqueta: "Logrado",
        descripcion: "Lo hago bien de forma autónoma."
      },
      {
        valor: 4,
        etiqueta: "Destacado",
        descripcion: "Lo hago con seguridad y puedo ayudar a otra persona."
      }
    ],
    reflexion: "Redacta en inglés el borrador de un correo breve (5-6 oraciones) dirigido a un profesional de tu área de estudio, solicitando una entrevista o información. Incluye: saludo formal, propósito ('I am writing to...'), solicitud educada, y cierre. Luego, en español: ¿Qué diferencias encontraste entre un correo formal en inglés y en español?",
  },
];

/* ── A4 · verdadero/falso (el reto) ───────────────────────────────────── */
export const QUIZ_VF = {
  ancla: "IN-V-P06-A4 · True or False — Writing Functional Texts in English",
  descripcion: "Decide si cada afirmación sobre la redacción en inglés de textos funcionales (correos, solicitudes y propuestas breves) es verdadera o falsa.",
  puntajeMinimo: 70,
  intentosMaximos: 2,
  preguntas: [
    {
      enunciado: "A formal email in English typically begins with a greeting such as 'Dear Mr./Ms. [Last Name],' followed by a comma or colon.",
      respuesta: true,
      retro: "Correct! Formal emails begin with 'Dear + title + last name' (e.g., 'Dear Dr. García,'). A comma or colon follows in English. Informal emails may use 'Hi [first name],' instead."
    },
    {
      enunciado: "In a formal email, it is appropriate to use contractions like 'I'm', 'don't', and 'we're' throughout the message.",
      respuesta: false,
      retro: "False. Contractions are informal and should be avoided in formal written communication in English. Write 'I am', 'do not', 'we are' instead. Contractions are fine in informal or conversational emails."
    },
    {
      enunciado: "The phrase 'I am writing to request information about...' is a standard opening for a formal request letter or email in English.",
      respuesta: true,
      retro: "Correct! 'I am writing to + infinitive...' is the standard formal opening for stating the purpose of a letter or email. Examples: 'I am writing to inform you...', 'I am writing to propose...', 'I am writing to request...'"
    },
    {
      enunciado: "To close a formal email in English, 'Yours sincerely' is appropriate when you know the recipient's name, while 'Yours faithfully' is used when you don't know the name.",
      respuesta: true,
      retro: "Correct! This is a standard British English convention: 'Yours sincerely' when the name is known; 'Yours faithfully' when writing to 'Dear Sir/Madam'. Other closings: 'Best regards', 'Kind regards' (semi-formal)."
    },
    {
      enunciado: "The subject line of a professional email should be long and detailed, describing every point that will be discussed in the email.",
      respuesta: false,
      retro: "False. Subject lines should be short, clear, and specific — typically 5-10 words. Example: 'Request for Information: Internship Opportunities' or 'Proposal: Community Health Project'. A long subject line is hard to read and unprofessional."
    }
  ],
};

/* ── A5 · glosario ────────────────────────────────────────────────────── */
export const GLOSARIO_A5 = {
  ancla: "IN-V-P06-A5 · Glosario — Writing Functional Texts: Emails, Requests, and Proposals",
  descripcion: "Glosario interactivo con frases y estructuras clave para redactar en inglés textos funcionales como correos, solicitudes y propuestas breves relacionadas con el campo de estudio. Nivel A2+/B1.",
  terminos: [
    {
      termino: "I am writing to... (inform / request / propose / inquire)",
      definicion: "The standard opening for a formal email or letter in English. It states the purpose directly. 'I am writing to' is always followed by the base form of a verb (the to-infinitive): 'I am writing to inform you…', 'I am writing to request…'.",
      ejemplo: "'I am writing to inform you of a change in our schedule.' / 'I am writing to request your assistance with our project.' / 'I am writing to propose a collaboration.'",
      etiquetas: [
        "formal writing",
        "purpose statement",
        "email opening"
      ]
    },
    {
      termino: "I would like to... / I would appreciate it if...",
      definicion: "Polite request structures used in formal writing. 'Would like to' is more direct; 'would appreciate it if + could/would + base verb' is more indirect and very formal.",
      ejemplo: "'I would like to schedule a meeting at your earliest convenience.' / 'I would appreciate it if you could send me the report by Friday.'",
      etiquetas: [
        "polite requests",
        "formal writing",
        "modal verbs"
      ]
    },
    {
      termino: "Please find attached / I am enclosing...",
      definicion: "Phrases used to refer to documents or files attached to an email or letter. 'Please find attached' is common in emails; 'I am enclosing' is used in paper letters.",
      ejemplo: "'Please find attached my CV and a cover letter.' / 'I am enclosing the completed application form for your review.'",
      etiquetas: [
        "email conventions",
        "attachments",
        "formal English"
      ]
    },
    {
      termino: "We propose that... / I would like to suggest...",
      definicion: "Structures for making a formal proposal or suggestion. 'We propose that + subject + base verb' is for formal proposals; 'I would like to suggest + gerund or that-clause' is common in emails.",
      ejemplo: "'We propose that the school implement a mentorship program for new students.' / 'I would like to suggest organizing a community health fair.'",
      etiquetas: [
        "proposals",
        "suggestions",
        "formal writing"
      ]
    },
    {
      termino: "I look forward to hearing from you.",
      definicion: "A standard closing phrase in formal English correspondence. It expresses expectation of a reply. 'Look forward to' is followed by a gerund (-ing form).",
      ejemplo: "'I look forward to hearing from you at your earliest convenience.' / 'We look forward to your response and hope to work with you soon.'",
      etiquetas: [
        "email closing",
        "formal phrases",
        "gerund after preposition"
      ]
    },
    {
      termino: "Dear Mr./Ms. [Last Name], / Best regards, / Yours sincerely,",
      definicion: "Formal salutations and closings. 'Dear + title + last name' opens formal emails. 'Best regards' or 'Kind regards' are semi-formal closings. 'Yours sincerely' is used when the recipient's name is known.",
      ejemplo: "'Dear Ms. Torres, / ... / Yours sincerely, / Juan Pérez' — complete structure of a formal email.",
      etiquetas: [
        "salutation",
        "closing",
        "email format"
      ]
    }
  ],
  actividadFinal: "Write a short formal email in English (5-7 sentences) using the structure: (1) greeting ('Dear...'), (2) purpose statement ('I am writing to...'), (3) a polite request ('I would like to...' or 'I would appreciate it if...'), (4) a reference to an attachment if appropriate ('Please find attached...'), (5) closing phrase ('I look forward to hearing from you.'), and (6) formal sign-off ('Best regards, / Yours sincerely,'). Topic: request for information, an internship, or a proposal related to your field of study.",
};

/* ── A8 · video ───────────────────────────────────────────────────────── */
export const VIDEO = {
  ancla: "IN-V-P06-A8 · Video básico: Redacción de textos funcionales en inglés",
  descripcion: "Video que muestra cómo redactar en inglés textos funcionales breves, como correos, solicitudes o propuestas, para informar o proponer acciones.",
  preguntas: [
    "¿Qué partes debe tener un correo formal en inglés para solicitar algo?",
    "¿Cuál es una frase adecuada para iniciar un correo formal en inglés? ('Hey what's up' · 'Dear Sir or Madam' · 'Yo bro')",
    "Un texto funcional en inglés, como un correo o una solicitud, debe ser claro y tener un propósito específico."
  ],
};

/* ── A9 · ordenar el correo formal ────────────────────────────────────── */
export const ORDEN_A9 = {
  ancla: "IN-V-P06-A9 · Order the formal email",
  instrucciones: "Vas a escribir a la coordinadora de un programa de intercambio para pedir información. Ordena las partes del correo: en inglés formal el orden es tan convencional como en español, y saltárselo se nota.",
  pasos: [
    {
      marca: "Subject",
      texto: "Subject: Information request – Summer Exchange Program 2027",
      explicacion: "El asunto va primero y dice de qué trata en una línea. Un correo sin asunto claro se abre tarde o no se abre."
    },
    {
      marca: "Greeting",
      texto: "Dear Ms. Rivera,",
      explicacion: "Saludo formal con apellido. 'Hi' o el nombre de pila no corresponden a un primer contacto institucional."
    },
    {
      marca: "Opening",
      texto: "I am a third-year student at CEN Bachillerato and I am writing to ask about the summer exchange program.",
      explicacion: "Quién eres y por qué escribes, en una sola oración. 'I am writing to' es la fórmula estándar."
    },
    {
      marca: "Body",
      texto: "I would like to know the application deadline, the language requirements, and whether scholarships are available.",
      explicacion: "Las preguntas concretas, enumeradas. Un correo con una pregunta vaga recibe una respuesta vaga."
    },
    {
      marca: "Request",
      texto: "I would be grateful if you could send me any additional information about the process.",
      explicacion: "'I would be grateful if you could' es la petición cortés formal; más suave que 'please send me'."
    },
    {
      marca: "Closing",
      texto: "Thank you for your time and attention.",
      explicacion: "El agradecimiento cierra el cuerpo antes de la despedida."
    },
    {
      marca: "Sign-off",
      texto: "Sincerely,\nDaniela Ramírez",
      explicacion: "'Sincerely' es la despedida formal estándar cuando se conoce el nombre del destinatario, seguida del nombre completo."
    }
  ],
};

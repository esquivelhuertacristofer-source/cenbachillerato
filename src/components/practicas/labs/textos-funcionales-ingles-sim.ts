/**
 * Simulador «Outbox» (IN-V-P06): lógica pura, sin React.
 *
 * El alumno tiene cuatro misiones en su bandeja de salida. En cada una arma un
 * correo con las siete piezas de la progresión (las marcas de IN-V-P06-A9:
 * Subject · Greeting · Opening · Body · Request · Closing · Sign-off) y lo
 * envía. Cada pieza mueve tres medidores:
 *   · CLARIDAD   — asunto, apertura con propósito y detalle concreto;
 *   · CORTESÍA Y REGISTRO — saludo, forma de pedir y despedida, según quién lee;
 *   · COMPLETITUD — detalle, acción esperada (con fecha cuando urge) y cierre.
 * Al enviar, el destinatario FICTICIO responde según el correo:
 *   · lo ignora (sin asunto: no se abre),
 *   · se molesta (una orden, un «Hey!» a una coordinadora…),
 *   · pide aclaraciones (falta algo: pregunta justo eso),
 *   · o concede lo que pides (los tres medidores en 80 o más).
 * El registro depende del destinatario: con Tomás, un amigo, lo formal NO
 * suma: le suena frío y pregunta si estás molesto.
 *
 * Las contracciones (I'm, that's…) restan cortesía SÓLO en las misiones
 * formales (A1, callout; A4, enunciado 2). Personas, escuela y empresa son
 * ficticias; puntajes y tiempos de respuesta son una simulación.
 *
 * También vive aquí el analizador del modo «Write your own» (actividad final de
 * A5): lee el correo que escribe el alumno y busca las mismas piezas.
 */

/* ── Piezas y medidores ─────────────────────────────────────────────────── */

export type PiezaId = "subject" | "greeting" | "opening" | "body" | "request" | "closing" | "signoff";
export type Medidor = "cla" | "cor" | "com";

export interface PiezaInfo {
  id: PiezaId;
  /** La marca verbatim de A9. */
  marca: string;
  es: string;
  icono: string;
  /** Puntos máximos que la pieza aporta a cada medidor. */
  max: Partial<Record<Medidor, number>>;
}

export const PIEZAS: PiezaInfo[] = [
  { id: "subject", marca: "Subject", es: "Asunto", icono: "fa-heading", max: { cla: 35 } },
  { id: "greeting", marca: "Greeting", es: "Saludo", icono: "fa-hand", max: { cor: 30 } },
  { id: "opening", marca: "Opening", es: "Propósito", icono: "fa-bullseye", max: { cla: 35 } },
  { id: "body", marca: "Body", es: "Detalle", icono: "fa-align-left", max: { cla: 30, com: 30 } },
  { id: "request", marca: "Request", es: "Petición y acción", icono: "fa-hand-holding-hand", max: { cor: 40, com: 40 } },
  { id: "closing", marca: "Closing", es: "Cierre", icono: "fa-handshake", max: { com: 30 } },
  { id: "signoff", marca: "Sign-off", es: "Despedida y firma", icono: "fa-signature", max: { cor: 30 } },
];

export const PIEZA: Record<PiezaId, PiezaInfo> = Object.fromEntries(PIEZAS.map((p) => [p.id, p])) as Record<PiezaId, PiezaInfo>;

export const MEDIDORES: { id: Medidor; nombre: string; icono: string }[] = [
  { id: "cla", nombre: "Claridad", icono: "fa-eye" },
  { id: "cor", nombre: "Cortesía y registro", icono: "fa-handshake-angle" },
  { id: "com", nombre: "Completitud", icono: "fa-list-check" },
];

/** Los tres medidores en este valor o más = el destinatario concede. */
export const UMBRAL_CONCEDE = 80;
/** Cortesía por debajo de esto, en una misión formal = el destinatario se molesta. */
export const UMBRAL_MOLESTA = 50;
/** Lo que resta cada pieza con contracción en una misión formal. */
export const CASTIGO_CONTRACCION = 8;

export const RUTA_FOTOS = "/media/labs-sim/textos-funcionales-ingles";

/* ── Opciones y misiones ────────────────────────────────────────────────── */

export interface OpcionPieza {
  id: string;
  /** Lo que se escribe en el correo. «» = la pieza se omite. */
  texto: string;
  /** Puntos que aporta (pueden ser negativos: registro equivocado). */
  pts: Partial<Record<Medidor, number>>;
  /** Por qué funciona o no (español, con el inglés citado). */
  porque: string;
  /** Lo que el destinatario pregunta de vuelta si esta pieza es la floja. */
  replica?: string;
  /** Rompe el correo sin importar lo demás. */
  falla?: "sin-asunto" | "ofensa";
  /** Demasiado formal para un amigo: Tomás pregunta si estás molesto. */
  tieso?: boolean;
}

export type MisionId = "rivera" | "verdemar" | "comite" | "tomas";
export type Proposito = "Solicitar" | "Informar" | "Proponer";

export interface Mision {
  id: MisionId;
  proposito: Proposito;
  registro: "formal" | "informal";
  para: string;
  cargo: string;
  foto: string;
  icono: string;
  /** La situación, en español. */
  situacion: string;
  /** Qué tiene que conseguir el correo. */
  meta: string;
  opciones: Record<PiezaId, OpcionPieza[]>;
  /** El borrador con el que arranca la misión (ids de opción por pieza). */
  borrador: Record<PiezaId, string>;
  respuestas: {
    concede: string;
    aclaraIntro: string;
    aclaraTiesoIntro?: string;
    /** Lo que pregunta si sólo sobra formalidad (al correo no le falta nada). */
    tiesoPregunta?: string;
    aclaraFin: string;
    molesta: string;
  };
}

const SIN = "";

export const MISIONES: Mision[] = [
  /* ── 1 · Solicitar (formal, conoces el nombre) — el correo de A9 ─────── */
  {
    id: "rivera",
    proposito: "Solicitar",
    registro: "formal",
    para: "Ms. Laura Rivera",
    cargo: "Coordinadora del programa de intercambio",
    foto: "rivera",
    icono: "fa-plane-departure",
    situacion:
      "Quieres pedir información sobre el programa de intercambio de verano a la coordinadora, Ms. Rivera. Nunca has hablado con ella: es un primer contacto institucional.",
    meta: "Que te mande la fecha límite, los requisitos de idioma y las becas.",
    opciones: {
      subject: [
        { id: "a", texto: "Subject: Information request – Summer Exchange Program 2027", pts: { cla: 35 }, porque: "El asunto va primero y dice de qué trata en una línea. Un correo sin asunto claro se abre tarde o no se abre. (A9)" },
        { id: "b", texto: "Subject: Question", pts: { cla: 10 }, porque: "«Question» es demasiado vago: Ms. Rivera recibe decenas de correos y no sabe de qué programa ni qué necesitas." },
        { id: "c", texto: "Subject: Hello, I am a student and I have many questions about the summer exchange program, the deadlines, the language test and the scholarships", pts: { cla: 15 }, porque: "Un asunto debe ser corto, claro y específico (5 a 10 palabras, A4). Uno larguísimo es difícil de leer y poco profesional." },
        { id: "d", texto: SIN, pts: {}, falla: "sin-asunto", porque: "Sin asunto, el correo parece spam o se queda al fondo de la bandeja: nadie lo abre." },
      ],
      greeting: [
        { id: "a", texto: "Dear Ms. Rivera,", pts: { cor: 30 }, porque: "Saludo formal con apellido. «Hi» o el nombre de pila no corresponden a un primer contacto institucional. (A9)" },
        { id: "b", texto: "Dear Sir/Madam,", pts: { cor: 15 }, porque: "Es formal, pero «Dear Sir/Madam» se usa cuando NO sabes el nombre (A1). Tú sí lo sabes: suena a correo masivo." },
        { id: "c", texto: "Hi Laura,", pts: { cor: 5 }, porque: "«Hi» con su nombre de pila es demasiada confianza para una coordinadora que no te conoce." },
        { id: "d", texto: "Hey!", pts: {}, falla: "ofensa", porque: "«Hey!» es para amigos. A una coordinadora que no te conoce le suena irrespetuoso." },
      ],
      opening: [
        { id: "a", texto: "I am a third-year student at CEN Bachillerato and I am writing to ask about the summer exchange program.", pts: { cla: 35 }, porque: "Quién eres y por qué escribes, en una sola oración. «I am writing to» es la fórmula estándar. (A9)" },
        { id: "b", texto: "I'm writing because I want to know some stuff about the program.", pts: { cla: 15 }, porque: "Dice que quieres «saber cosas» (stuff), pero no qué cosas ni quién eres.", replica: "Could you tell me who you are and what you would like to know?" },
        { id: "c", texto: "My name is Daniela.", pts: { cla: 8 }, porque: "Te presentas, pero no dices por qué escribes. El propósito debe quedar claro desde el primer párrafo.", replica: "Nice to meet you, Daniela. How can I help you?" },
      ],
      body: [
        { id: "a", texto: "I would like to know the application deadline, the language requirements, and whether scholarships are available.", pts: { cla: 30, com: 30 }, porque: "Las preguntas concretas, enumeradas. Un correo con una pregunta vaga recibe una respuesta vaga. (A9)" },
        { id: "b", texto: "I would like to know more about everything.", pts: { cla: 5, com: 5 }, porque: "«Everything» no es una pregunta: Ms. Rivera no sabe qué contestarte.", replica: "Which information do you need exactly: dates, requirements or costs?" },
        { id: "c", texto: "I want to travel because it would be really cool and my friends are going too.", pts: { cla: 10, com: 5, cor: -10 }, porque: "Cuenta tus ganas, pero no hace ninguna pregunta. Además, «really cool» es registro informal.", replica: "What exactly would you like to know about the program?" },
      ],
      request: [
        { id: "a", texto: "I would be grateful if you could send me any additional information about the process.", pts: { cor: 40, com: 40 }, porque: "«I would be grateful if you could» es la petición cortés formal; más suave que «please send me». (A9)" },
        { id: "b", texto: "Please send me the information.", pts: { cor: 20, com: 30 }, porque: "Es correcta pero seca: «please» + imperativo suena a orden. «Could you please…» o «I would be grateful if you could…» suenan más corteses." },
        { id: "c", texto: "Send me everything ASAP.", pts: { com: 10 }, falla: "ofensa", porque: "Imperativo y «ASAP» a alguien que no te debe nada: suena a exigencia. Es la forma más rápida de no recibir ayuda." },
      ],
      closing: [
        { id: "a", texto: "Thank you for your time and attention.", pts: { com: 30 }, porque: "El agradecimiento cierra el cuerpo antes de la despedida. (A9)" },
        { id: "b", texto: "Thank you very much for your time. I look forward to hearing from you.", pts: { com: 30 }, porque: "Agradece y expresa expectativa de respuesta: el cierre cortés de A1." },
        { id: "c", texto: "That's all.", pts: { com: 5 }, porque: "Cierra de golpe: no agradece ni dice que esperas respuesta." },
        { id: "d", texto: SIN, pts: {}, porque: "Sin agradecimiento ni expectativa de respuesta, el correo termina en seco.", replica: "Is there anything else you need?" },
      ],
      signoff: [
        { id: "a", texto: "Sincerely,\nDaniela Ramírez", pts: { cor: 30 }, porque: "«Sincerely» es la despedida formal estándar cuando se conoce el nombre del destinatario, seguida del nombre completo. (A9)" },
        { id: "b", texto: "Best regards,\nDaniela Ramírez", pts: { cor: 25 }, porque: "Funciona: es semi-formal y muy usada en contextos académicos (A1). En un primer contacto formal, «Sincerely» es la opción estándar." },
        { id: "c", texto: "Yours faithfully,\nDaniela Ramírez", pts: { cor: 12 }, porque: "«Yours faithfully» va con «Dear Sir/Madam», cuando NO sabes el nombre (A1). Aquí sí lo sabes." },
        { id: "d", texto: "See you!\nDani", pts: {}, porque: "«See you!» y un apodo son registro informal: así no se despide uno de una coordinadora." },
      ],
    },
    borrador: { subject: "b", greeting: "d", opening: "b", body: "a", request: "c", closing: "c", signoff: "d" },
    respuestas: {
      concede:
        "Dear Daniela,\n\nThank you for your clear message. The application deadline is May 15, the language requirement is a B1 certificate, and yes, we offer two partial scholarships. I have attached the program guide.\n\nBest regards,\nLaura Rivera",
      aclaraIntro: "Dear Daniela,\n\nThank you for your email. Before I can help you, I need to know a little more:",
      aclaraFin: "Best regards,\nLaura Rivera",
      molesta: "Daniela,\n\nPlease use a more respectful tone when you write to program staff. General information is available on our website.\n\nL. Rivera",
    },
  },

  /* ── 2 · Informar (formal, NO conoces el nombre, con adjuntos) ────────── */
  {
    id: "verdemar",
    proposito: "Informar",
    registro: "formal",
    para: "Human Resources",
    cargo: "Recursos Humanos · Verdemar Labs (ficticio)",
    foto: "verdemar",
    icono: "fa-flask-vial",
    situacion:
      "Verdemar Labs, un laboratorio ambiental, te pidió tu solicitud para sus prácticas de verano. Les informas que ya la mandas completa y necesitas que confirmen que la recibieron antes de que cierre el plazo, el viernes 8 de mayo. No sabes el nombre de quien la recibe.",
    meta: "Que confirmen que recibieron tu CV y tu carta antes del viernes.",
    opciones: {
      subject: [
        { id: "a", texto: "Subject: Internship Application – Daniela Ramírez", pts: { cla: 35 }, porque: "Corto y específico: qué es (una solicitud de prácticas) y de quién. Recursos Humanos lo encuentra al instante." },
        { id: "b", texto: "Subject: Documents", pts: { cla: 12 }, porque: "«Documents» no dice qué documentos ni para qué: en una bandeja con cientos de solicitudes se pierde." },
        { id: "c", texto: "Subject: Application for the internship program that I saw on your website last month with all my documents", pts: { cla: 15 }, porque: "Demasiado largo (A4: 5 a 10 palabras). Se corta en la bandeja y se ve poco profesional." },
        { id: "d", texto: SIN, pts: {}, falla: "sin-asunto", porque: "Sin asunto, el correo parece spam o se queda al fondo de la bandeja: nadie lo abre." },
      ],
      greeting: [
        { id: "a", texto: "Dear Sir/Madam,", pts: { cor: 30 }, porque: "No sabes el nombre: «Dear Sir/Madam,» es el saludo formal correcto (A1)." },
        { id: "b", texto: "Dear Ms. Verdemar,", pts: { cor: 5 }, porque: "Verdemar es el nombre de la empresa, no de una persona. Inventar un nombre queda peor que «Dear Sir/Madam»." },
        { id: "c", texto: "Hi guys,", pts: {}, porque: "«Hi guys» es de chat entre amigos: en una solicitud formal le resta toda la seriedad." },
      ],
      opening: [
        { id: "a", texto: "I am writing to inform you that I have completed my application for the summer internship program.", pts: { cla: 35 }, porque: "«I am writing to inform you…» dice el propósito en la primera línea: informar que la solicitud ya está completa (A5)." },
        { id: "b", texto: "I'm Daniela and I'm a student.", pts: { cla: 10 }, porque: "Te presentas pero no dices para qué escribes.", replica: "Could you tell us the reason for your message?" },
        { id: "c", texto: "As you know, the thing is ready.", pts: { cla: 5 }, porque: "«The thing» no informa nada: ¿qué cosa? El lector no tiene contexto.", replica: "We are not sure what you are referring to. Could you explain?" },
      ],
      body: [
        { id: "a", texto: "Please find attached my CV and a cover letter.", pts: { cla: 30, com: 30 }, porque: "Menciona los adjuntos con la frase estándar de correo (A5): Recursos Humanos sabe exactamente qué revisar." },
        { id: "b", texto: "I am sending some files.", pts: { cla: 12, com: 10 }, porque: "¿Cuáles archivos? Sin decir qué adjuntas, tienen que adivinar si falta algo.", replica: "Which documents did you attach? We only see one file." },
        { id: "c", texto: SIN, pts: {}, porque: "Si no mencionas los adjuntos, pueden pasarlos por alto.", replica: "We did not find any documents. Could you send your CV again?" },
      ],
      request: [
        { id: "a", texto: "Could you please confirm that you have received my documents by Friday, May 8?", pts: { cor: 40, com: 40 }, porque: "Petición cortés («Could you please…») con acción concreta (confirmar) y fecha límite: saben qué hacer y para cuándo." },
        { id: "b", texto: "Could you please confirm that you have received my documents?", pts: { cor: 40, com: 18 }, porque: "Muy cortés, pero sin fecha: el plazo cierra el viernes y nadie sabe que hay prisa.", replica: "By when do you need our confirmation?" },
        { id: "c", texto: "Confirm you got it.", pts: { com: 15 }, falla: "ofensa", porque: "Una orden seca a quien decide tus prácticas: imperativo sin cortesía es una mala primera impresión." },
      ],
      closing: [
        { id: "a", texto: "Please do not hesitate to contact me if you have any questions. I look forward to hearing from you.", pts: { com: 30 }, porque: "Ofrece ayuda y expresa expectativa de respuesta: dos frases de cortesía de A1." },
        { id: "b", texto: "Thanks!", pts: { com: 10, cor: -5 }, porque: "Agradece, pero en registro informal y sin decir que esperas respuesta." },
        { id: "c", texto: SIN, pts: {}, porque: "Sin cierre, el correo termina en seco." },
      ],
      signoff: [
        { id: "a", texto: "Yours faithfully,\nDaniela Ramírez", pts: { cor: 30 }, porque: "Con «Dear Sir/Madam» la despedida que corresponde es «Yours faithfully» (A1)." },
        { id: "b", texto: "Sincerely,\nDaniela Ramírez", pts: { cor: 22 }, porque: "Es formal, pero A1 la reserva para cuando conoces el nombre. Con «Dear Sir/Madam» va «Yours faithfully»." },
        { id: "c", texto: "Bye!\nDani", pts: {}, porque: "«Bye!» y un apodo son de chat: a Recursos Humanos no se le despide así." },
      ],
    },
    borrador: { subject: "d", greeting: "c", opening: "b", body: "b", request: "b", closing: "b", signoff: "b" },
    respuestas: {
      concede:
        "Dear Daniela,\n\nThank you for your application. We confirm that we have received your CV and cover letter. Our team will contact you next week to schedule an interview.\n\nKind regards,\nHuman Resources\nVerdemar Labs",
      aclaraIntro: "Dear Daniela,\n\nThank you for your message. We need some clarification:",
      aclaraFin: "Kind regards,\nHuman Resources\nVerdemar Labs",
      molesta: "Hello,\n\nWe received your message. Please note that we expect all applicants to communicate in a professional manner.\n\nHuman Resources",
    },
  },

  /* ── 3 · Proponer (formal, conoces el nombre) — la propuesta de A1 ───── */
  {
    id: "comite",
    proposito: "Proponer",
    registro: "formal",
    para: "Mr. Julián Prieto",
    cargo: "Presidente del comité escolar",
    foto: "comite",
    icono: "fa-recycle",
    situacion:
      "Quieres proponer al comité escolar un programa de reciclaje con tres estaciones. La próxima junta es el jueves 12 de marzo y necesitas que Mr. Prieto incluya tu propuesta en la agenda.",
    meta: "Que tu propuesta entre en la agenda de la junta del jueves 12 de marzo.",
    opciones: {
      subject: [
        { id: "a", texto: "Subject: Proposal: School Recycling Program", pts: { cla: 35 }, porque: "Dice que es una propuesta y de qué trata, en pocas palabras (A4: «Proposal: Community Health Project»)." },
        { id: "b", texto: "Subject: Idea", pts: { cla: 10 }, porque: "«Idea» no dice de qué ni que es una propuesta formal: se confunde con cualquier otro correo." },
        { id: "c", texto: SIN, pts: {}, falla: "sin-asunto", porque: "Sin asunto, el correo parece spam o se queda al fondo de la bandeja: nadie lo abre." },
      ],
      greeting: [
        { id: "a", texto: "Dear Mr. Prieto,", pts: { cor: 30 }, porque: "«Dear + título + apellido»: el saludo formal cuando conoces el nombre (A1, A4)." },
        { id: "b", texto: "Hey Mr. Prieto!", pts: { cor: 10 }, porque: "Usas su apellido, pero «Hey» y el signo de admiración bajan el registro: con el comité se espera «Dear»." },
        { id: "c", texto: "Dear Sir/Madam,", pts: { cor: 15 }, porque: "Es formal, pero sabes su nombre: «Dear Sir/Madam» es para cuando no lo sabes (A1)." },
      ],
      opening: [
        { id: "a", texto: "I am writing to propose a school-wide recycling program to reduce waste and raise environmental awareness.", pts: { cla: 35 }, porque: "«I am writing to propose…» dice desde la primera línea qué propones y para qué (A4, A5)." },
        { id: "b", texto: "We propose that the school implement a recycling program.", pts: { cla: 28 }, porque: "Estructura de propuesta formal correcta (A5: «We propose that + sujeto + verbo base»), pero no dice para qué sirve." },
        { id: "c", texto: "I've got an idea about trash.", pts: { cla: 5 }, porque: "No dice qué idea ni qué quieres que pase.", replica: "What is your idea, exactly?" },
      ],
      body: [
        { id: "a", texto: "We would like to install three recycling stations (paper, plastic, and organic waste) in the main areas of the school by the end of the semester.", pts: { cla: 30, com: 30 }, porque: "Qué, cuántas, dónde y para cuándo: los datos específicos hacen clara una propuesta (A1, ejemplo 2)." },
        { id: "b", texto: "Recycling is very important for the planet.", pts: { cla: 8, com: 5 }, porque: "Es verdad, pero no dice QUÉ propones hacer, dónde ni cuántas estaciones.", replica: "What exactly are you proposing, and where would it be?" },
        { id: "c", texto: "We could do many things.", pts: { cla: 3 }, porque: "«Many things» no es una propuesta: el comité no puede votar algo que no está definido.", replica: "Which actions do you have in mind?" },
      ],
      request: [
        { id: "a", texto: "Could you please include our proposal on the agenda for the committee meeting on Thursday, March 12?", pts: { cor: 40, com: 40 }, porque: "Petición cortés con acción concreta (incluirla en la agenda) y fecha (la junta del jueves 12 de marzo)." },
        { id: "b", texto: "I would appreciate it if you could consider our proposal.", pts: { cor: 40, com: 15 }, porque: "Muy cortés (A5: «I would appreciate it if you could…»), pero no dice qué acción esperas ni para cuándo: «considerar» puede ser nunca.", replica: "When and how would you like to present it?" },
        { id: "c", texto: "You have to approve this.", pts: { com: 15 }, falla: "ofensa", porque: "Le das una orden a quien preside el comité. Una propuesta pide, no exige." },
      ],
      closing: [
        { id: "a", texto: "Thank you very much for your time. I look forward to hearing from you.", pts: { com: 30 }, porque: "Agradece y expresa expectativa de respuesta: el cierre cortés de A1." },
        { id: "b", texto: "Thanks a lot!!", pts: { com: 10, cor: -5 }, porque: "Agradece, pero dos signos de admiración y «thanks a lot» son de registro informal." },
        { id: "c", texto: SIN, pts: {}, porque: "Sin cierre, el correo termina en seco." },
      ],
      signoff: [
        { id: "a", texto: "Best regards,\nDaniela Ramírez\nStudent Council", pts: { cor: 30 }, porque: "Semi-formal y muy usada en contextos académicos (A1); con nombre completo y cargo, el comité sabe quién propone." },
        { id: "b", texto: "Sincerely,\nDaniela Ramírez", pts: { cor: 30 }, porque: "Formal, para cuando conoces el nombre del destinatario (A1). También funciona." },
        { id: "c", texto: "Cheers,\nDani", pts: { cor: 5 }, porque: "«Cheers» y un apodo son registro informal: no es la firma de una propuesta al comité." },
      ],
    },
    borrador: { subject: "a", greeting: "a", opening: "a", body: "b", request: "b", closing: "a", signoff: "a" },
    respuestas: {
      concede:
        "Dear Daniela,\n\nThank you for your proposal. It is clear and well organized. I have included it on the agenda for Thursday, March 12. Please prepare a five-minute presentation.\n\nBest regards,\nJulián Prieto\nSchool Committee Chair",
      aclaraIntro: "Dear Daniela,\n\nThank you for your email. Your idea sounds interesting, but I have a few questions:",
      aclaraFin: "Best regards,\nJulián Prieto",
      molesta: "Daniela,\n\nThe committee does not accept demands. If you would like to submit a proposal, please follow the usual process.\n\nJ. Prieto",
    },
  },

  /* ── 4 · Solicitar (INFORMAL: un compañero) ───────────────────────────── */
  {
    id: "tomas",
    proposito: "Solicitar",
    registro: "informal",
    para: "Tomás",
    cargo: "Tu compañero de equipo y amigo",
    foto: "tomas",
    icono: "fa-user-group",
    situacion:
      "Tomás es tu amigo y compañero de equipo. Necesitas que te mande sus diapositivas del proyecto de historia antes del miércoles en la noche para unir la presentación.",
    meta: "Que Tomás te mande sus diapositivas antes del miércoles en la noche.",
    opciones: {
      subject: [
        { id: "a", texto: "Subject: Your slides for the project", pts: { cla: 35 }, porque: "Aun entre amigos, un asunto claro ayuda: Tomás sabe de qué va antes de abrirlo." },
        { id: "b", texto: "Subject: Hiii", pts: { cla: 12 }, porque: "Amistoso, pero no dice de qué se trata: Tomás no sabe que es urgente." },
        { id: "c", texto: SIN, pts: { cla: 8 }, porque: "Tomás lo abre porque te conoce, pero en su bandeja no se distingue de otros correos." },
      ],
      greeting: [
        { id: "a", texto: "Hi Tomás,", pts: { cor: 30 }, porque: "Saludo informal con nombre de pila: el registro adecuado para un compañero (A4: «Hi [first name],»)." },
        { id: "b", texto: "Dear Mr. Gómez,", pts: { cor: 12 }, tieso: true, porque: "Correcto para un desconocido, pero a tu amigo le suena frío, como si estuvieras molesto con él." },
        { id: "c", texto: "Yo bro", pts: { cor: 18 }, porque: "Muy de chat. Entre amigos no ofende, pero «Hi Tomás,» es más claro en un correo de equipo." },
      ],
      opening: [
        { id: "a", texto: "I wanted to ask you about your slides for our history project.", pts: { cla: 35 }, porque: "Directo y natural: es el «Hey, I wanted to ask…» de la columna informal de A1." },
        { id: "b", texto: "I am writing to request your slides.", pts: { cla: 28, cor: -8 }, tieso: true, porque: "Es claro, pero «I am writing to request» con un amigo suena a oficio: muy distante." },
        { id: "c", texto: "So… yeah.", pts: {}, porque: "No dice nada: Tomás no sabe para qué le escribes.", replica: "Hey, what's up? What do you need?" },
      ],
      body: [
        { id: "a", texto: "I need to put all the parts together before Thursday's class.", pts: { cla: 30, com: 30 }, porque: "Explica para qué las necesitas y por qué hay prisa: Tomás entiende la urgencia." },
        { id: "b", texto: "I need stuff.", pts: { cla: 5, com: 5 }, porque: "«Stuff» no dice qué necesitas ni para qué.", replica: "What stuff? Which slides do you mean?" },
        { id: "c", texto: "I would like to request the aforementioned documents for our collaborative endeavor.", pts: { cla: 15, com: 15, cor: -8 }, tieso: true, porque: "Vocabulario rebuscado de oficina: con un amigo complica en vez de aclarar." },
      ],
      request: [
        { id: "a", texto: "Can you send them to me by Wednesday night?", pts: { cor: 40, com: 40 }, porque: "Entre amigos, «Can you…?» es cortés y natural (A1, columna informal), y dice la fecha." },
        { id: "b", texto: "Send them now.", pts: { com: 20 }, falla: "ofensa", porque: "Ni entre amigos: una orden seca, sin «Can you…?», molesta." },
        { id: "c", texto: "I would appreciate it if you could kindly forward the files at your earliest convenience.", pts: { cor: 22, com: 15 }, tieso: true, porque: "Cortesía de oficina con tu amigo: suena rara, y «at your earliest convenience» no es una fecha.", replica: "Sure… but when do you need them?" },
      ],
      closing: [
        { id: "a", texto: "Thanks a lot!", pts: { com: 30 }, porque: "Un agradecimiento breve e informal: perfecto para un compañero." },
        { id: "b", texto: "Thank you very much for your time and attention. I look forward to hearing from you.", pts: { com: 20, cor: -6 }, tieso: true, porque: "Es el cierre de un correo formal: con un amigo suena distante." },
        { id: "c", texto: SIN, pts: { com: 5 }, porque: "Sin un «thanks», la petición se siente brusca." },
      ],
      signoff: [
        { id: "a", texto: "See you,\nDani", pts: { cor: 30 }, porque: "«See you,» es la despedida informal de A1: perfecta para un compañero." },
        { id: "b", texto: "Yours faithfully,\nDaniela Ramírez", pts: { cor: 5 }, tieso: true, porque: "«Yours faithfully» es la despedida más formal (para «Dear Sir/Madam»): a Tomás le suena a broma o a enojo." },
        { id: "c", texto: "Best,\nDani", pts: { cor: 30 }, porque: "«Best,» también es informal (A1): funciona con un amigo." },
      ],
    },
    borrador: { subject: "a", greeting: "b", opening: "b", body: "c", request: "c", closing: "b", signoff: "b" },
    respuestas: {
      concede: "Hi Dani,\n\nSure! I'll send you my slides tonight. Good luck putting it all together.\n\nSee you,\nTomás",
      aclaraIntro: "Hey Dani,\n\nSure, but I have a question:",
      aclaraTiesoIntro: "Hey Dani,\n\nWhy so formal? Are you mad at me? Anyway:",
      tiesoPregunta: "Sure, I can send you my slides. Is everything OK between us?",
      aclaraFin: "See you,\nTomás",
      molesta: "Wow, okay… no need to be rude. I'll send them when I can.\n\nTomás",
    },
  },
];

export const MISION: Record<MisionId, Mision> = Object.fromEntries(MISIONES.map((m) => [m.id, m])) as Record<MisionId, Mision>;

/* ── Contracciones ──────────────────────────────────────────────────────── */

/**
 * Contracciones de pronombre (I'm, that's, we're…) y de negación (don't,
 * can't…). Se buscan por lista y no con «cualquier 's» para no confundir un
 * posesivo («Thursday's class», «the school's waste») con una contracción.
 */
const RE_CONTRACCION = /\b(?:I|you|we|they|he|she|it|that|there|what|who|let)['’](?:m|re|s|ve|d|ll)\b|\b\w+n['’]t\b/gi;

export function contracciones(texto: string): string[] {
  return texto.match(RE_CONTRACCION) ?? [];
}

/* ── El modelo ──────────────────────────────────────────────────────────── */

export type Eleccion = Record<PiezaId, string>;

export function opcionDe(m: Mision, pieza: PiezaId, eleccion: Eleccion): OpcionPieza {
  const lista = m.opciones[pieza];
  return lista.find((o) => o.id === eleccion[pieza]) ?? lista[0]!;
}

export interface PiezaEval {
  pieza: PiezaId;
  op: OpcionPieza;
  /** 0–1: qué tanto de lo posible aporta (con castigos). */
  calidad: number;
  /** Puntos netos por medidor (con castigo de contracción). */
  netos: Partial<Record<Medidor, number>>;
  contracciones: string[];
}

export type Resultado = "concede" | "aclara" | "molesta" | "ignora";

export interface Evaluacion {
  piezas: PiezaEval[];
  medidores: Record<Medidor, number>;
  resultado: Resultado;
  /** Las piezas más flojas, de peor a mejor (para explicar el porqué). */
  flojas: PiezaEval[];
  /** La pieza que rompió el correo, si alguna. */
  rompe: PiezaEval | null;
  contracciones: string[];
  tieso: boolean;
}

const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

export function evaluar(m: Mision, eleccion: Eleccion): Evaluacion {
  const formal = m.registro === "formal";
  const piezas: PiezaEval[] = PIEZAS.map((p) => {
    const op = opcionDe(m, p.id, eleccion);
    const cs = formal ? contracciones(op.texto) : [];
    const netos: Partial<Record<Medidor, number>> = { ...op.pts };
    if (cs.length > 0) netos.cor = (netos.cor ?? 0) - CASTIGO_CONTRACCION * cs.length;
    const maximo = Object.values(p.max).reduce((a, b) => a + (b ?? 0), 0);
    const logrado = Object.values(netos).reduce((a, b) => a + (b ?? 0), 0);
    const calidad = op.falla ? 0 : Math.max(0, Math.min(1, logrado / maximo));
    return { pieza: p.id, op, calidad, netos, contracciones: cs };
  });

  const suma = (med: Medidor) => clamp(piezas.reduce((a, pe) => a + (pe.netos[med] ?? 0), 0));
  const medidores: Record<Medidor, number> = { cla: suma("cla"), cor: suma("cor"), com: suma("com") };
  const tieso = piezas.some((pe) => pe.op.tieso);
  const todas = piezas.flatMap((pe) => pe.contracciones);

  const sinAsunto = piezas.find((pe) => pe.op.falla === "sin-asunto") ?? null;
  const ofensa = piezas.find((pe) => pe.op.falla === "ofensa") ?? null;
  const flojas = piezas.filter((pe) => pe.calidad < 0.99).sort((a, b) => a.calidad - b.calidad);

  let resultado: Resultado;
  let rompe: PiezaEval | null = null;
  if (sinAsunto) {
    resultado = "ignora";
    rompe = sinAsunto;
  } else if (ofensa) {
    resultado = "molesta";
    rompe = ofensa;
  } else if (formal && medidores.cor < UMBRAL_MOLESTA) {
    resultado = "molesta";
  } else if (medidores.cla >= UMBRAL_CONCEDE && medidores.cor >= UMBRAL_CONCEDE && medidores.com >= UMBRAL_CONCEDE) {
    resultado = "concede";
  } else {
    resultado = "aclara";
  }
  return { piezas, medidores, resultado, flojas, rompe, contracciones: todas, tieso };
}

/** El correo armado, tal como lo leería el destinatario (sin la línea de asunto). */
export function cuerpoCorreo(m: Mision, eleccion: Eleccion): string {
  const t = (p: PiezaId) => opcionDe(m, p, eleccion).texto;
  const parrafos = [t("greeting"), [t("opening"), t("body")].filter(Boolean).join(" "), t("request"), t("closing"), t("signoff")];
  return parrafos.filter((x) => x.trim() !== "").join("\n\n");
}

/** La respuesta del destinatario (inglés) o null si nunca contesta. */
export function respuestaDe(m: Mision, ev: Evaluacion): string | null {
  const r = m.respuestas;
  if (ev.resultado === "ignora") return null;
  if (ev.resultado === "molesta") return r.molesta;
  if (ev.resultado === "concede") return r.concede;
  const preguntas = ev.flojas
    .map((pe) => pe.op.replica)
    .filter((x): x is string => !!x)
    .slice(0, 2);
  const vacia = ev.tieso && r.tiesoPregunta ? r.tiesoPregunta : "Could you tell me exactly what you need and when?";
  const cuerpo = (preguntas.length > 0 ? preguntas : [vacia]).map((q) => `• ${q}`).join("\n");
  const intro = ev.tieso && r.aclaraTiesoIntro ? r.aclaraTiesoIntro : r.aclaraIntro;
  return `${intro}\n\n${cuerpo}\n\n${r.aclaraFin}`;
}

export interface Veredicto {
  titulo: string;
  tiempo: string;
  icono: string;
  tono: "ok" | "medio" | "mal";
}

export const VEREDICTO: Record<Resultado, Veredicto> = {
  concede: { titulo: "Concede lo que pides", tiempo: "Respondió en 2 horas", icono: "fa-circle-check", tono: "ok" },
  aclara: { titulo: "Pide aclaraciones", tiempo: "Respondió al día siguiente", icono: "fa-circle-question", tono: "medio" },
  molesta: { titulo: "Se molesta", tiempo: "Respuesta seca", icono: "fa-face-angry", tono: "mal" },
  ignora: { titulo: "No lo abre", tiempo: "Sin respuesta en 7 días", icono: "fa-envelope-circle-check", tono: "mal" },
};

/** El porqué del resultado, en español, citando el inglés. */
export function explicacion(m: Mision, ev: Evaluacion): string {
  const cita = (pe: PiezaEval) => (pe.op.texto ? `«${pe.op.texto.split("\n")[0]}»` : `(sin ${PIEZA[pe.pieza].es.toLowerCase()})`);
  if (ev.resultado === "ignora" && ev.rompe) return `${PIEZA[ev.rompe.pieza].marca}: ${ev.rompe.op.porque}`;
  if (ev.resultado === "molesta") {
    if (ev.rompe) return `${PIEZA[ev.rompe.pieza].marca} ${cita(ev.rompe)}: ${ev.rompe.op.porque}`;
    const extra = ev.contracciones.length > 0 ? ` Además usaste contracciones (${ev.contracciones.join(", ")}): en un correo formal se escriben completas.` : "";
    return `La cortesía quedó en ${ev.medidores.cor} (menos de ${UMBRAL_MOLESTA}): el saludo, la petición y la despedida suenan demasiado informales para ${m.para}.${extra}`;
  }
  if (ev.resultado === "concede") {
    return m.registro === "formal"
      ? "Asunto claro, saludo y despedida que corresponden, propósito en la primera línea, detalles concretos y una petición cortés con la acción que esperas. Así es fácil decir que sí."
      : "Claro, amistoso y con fecha: el registro informal es el correcto con un amigo, y la petición dice qué necesitas y para cuándo.";
  }
  const peor = ev.flojas[0];
  if (!peor) return "Casi: sube los tres medidores a 80 o más.";
  const tieso = ev.tieso && m.registro === "informal" ? " Y ojo: con un amigo, lo muy formal suena frío." : "";
  return `Lo más flojo es ${PIEZA[peor.pieza].marca} ${cita(peor)}: ${peor.op.porque}${tieso}`;
}

/* ── Analizador del modo «Write your own» (A5, actividad final) ─────────── */

export interface AnalisisCorreo {
  palabras: number;
  oraciones: number;
  asunto: "vacio" | "vago" | "largo" | "bien";
  saludo: "formal" | "informal" | "falta";
  proposito: boolean;
  peticion: boolean;
  adjunto: boolean;
  cierre: boolean;
  despedida: boolean;
  fecha: boolean;
  contracciones: string[];
  informales: string[];
  orden: boolean;
  medidores: Record<Medidor, number>;
  resultado: Resultado;
  /** Los 6 pasos de la actividad final de A5 (el 4.º, adjunto, es opcional). */
  pasos: boolean[];
  completo: boolean;
}

const RE_SALUDO_FORMAL = /^\s*dear\s+(?:mr|ms|mrs|dr|prof(?:essor)?)\.?\s+\p{Lu}|^\s*dear\s+sir\s*(?:\/|or)\s*madam/imu;
const RE_SALUDO_INFORMAL = /^\s*(?:hi|hello|hey|dear)\b/im;
const RE_PROPOSITO = /\bI\s+am\s+writing\s+to\s+\w+/i;
const RE_PROPOSITO_CONTRAIDO = /\bI['’]m\s+writing\s+to\s+\w+/i;
const RE_PETICION = /\b(?:I\s+would\s+like\s+to|I\s+would\s+appreciate|could\s+you(?:\s+please)?|I\s+would\s+be\s+grateful\s+if|would\s+you\s+(?:please\s+)?be\s+able\s+to|we\s+propose\s+that|I\s+would\s+like\s+to\s+suggest)\b/i;
const RE_ADJUNTO = /\bplease\s+find\s+attached\b|\bI\s+am\s+enclosing\b/i;
const RE_CIERRE = /\bI\s+look\s+forward\s+to\s+hearing\s+from\s+you\b|\bwe\s+look\s+forward\s+to\b/i;
const RE_DESPEDIDA = /^\s*(?:best\s+regards|kind\s+regards|yours\s+sincerely|sincerely|yours\s+faithfully)\s*,?\s*$/im;
const RE_FECHA = /\b(?:by|before|on|until)\s+(?:(?:next\s+)?(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|(?:january|february|march|april|may|june|july|august|september|october|november|december)\b|\d{1,2}(?:st|nd|rd|th)?\b|the\s+end\s+of|tomorrow)/i;
const INFORMALES = ["hey", "gonna", "wanna", "asap", "stuff", "cool", "yo", "bro", "lol", "thx", "can't wait", "see ya", "guys"];

export function analizarCorreo(asuntoTxt: string, texto: string): AnalisisCorreo {
  const palabras = texto.trim() === "" ? 0 : texto.trim().split(/\s+/).length;
  const oraciones = texto
    .split(/[.!?]+(?:\s|$)/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).length >= 3).length;
  const pa = asuntoTxt.replace(/^\s*subject\s*:\s*/i, "").trim();
  const nAsunto = pa === "" ? 0 : pa.split(/\s+/).length;
  const asunto: AnalisisCorreo["asunto"] = nAsunto === 0 ? "vacio" : nAsunto < 2 ? "vago" : nAsunto > 10 ? "largo" : "bien";

  const saludo: AnalisisCorreo["saludo"] = RE_SALUDO_FORMAL.test(texto) ? "formal" : RE_SALUDO_INFORMAL.test(texto) ? "informal" : "falta";
  const proposito = RE_PROPOSITO.test(texto) || RE_PROPOSITO_CONTRAIDO.test(texto);
  const peticion = RE_PETICION.test(texto);
  const adjunto = RE_ADJUNTO.test(texto);
  const cierre = RE_CIERRE.test(texto);
  const despedida = RE_DESPEDIDA.test(texto);
  const fecha = RE_FECHA.test(texto);
  const cs = contracciones(texto);
  const bajo = ` ${texto.toLowerCase().replace(/[^\p{L}\s']/gu, " ")} `;
  const informales = INFORMALES.filter((w) => bajo.includes(` ${w} `));
  const imperativo = /(?:^|[.!?]\s+|\n)\s*(?:send|give|tell|answer|reply|confirm)\s+me\b/i.test(texto);

  // ¿Va en orden? saludo antes del propósito, propósito antes del cierre.
  const iSal = texto.search(RE_SALUDO_INFORMAL);
  const iPro = texto.search(RE_PROPOSITO);
  const iCie = texto.search(RE_CIERRE);
  const orden = iSal >= 0 && iPro > iSal && (iCie < 0 || iCie > iPro);

  const cla = (asunto === "bien" ? 35 : asunto === "vacio" ? 0 : 15) + (proposito ? 35 : 0) + (oraciones >= 5 ? 30 : oraciones >= 3 ? 15 : 0);
  const cor =
    (saludo === "formal" ? 30 : saludo === "informal" ? 10 : 0) +
    (peticion && !imperativo ? 40 : peticion ? 20 : 0) +
    (despedida ? 30 : 0) -
    CASTIGO_CONTRACCION * cs.length -
    8 * informales.length;
  const com = (oraciones >= 5 ? 30 : oraciones >= 3 ? 15 : 0) + (peticion ? (fecha ? 40 : 25) : 0) + (cierre ? 30 : /\bthank you\b/i.test(texto) ? 15 : 0);
  const medidores = { cla: clamp(cla), cor: clamp(cor), com: clamp(com) };

  let resultado: Resultado;
  if (asunto === "vacio") resultado = "ignora";
  else if (imperativo || medidores.cor < UMBRAL_MOLESTA) resultado = "molesta";
  else if (medidores.cla >= UMBRAL_CONCEDE && medidores.cor >= UMBRAL_CONCEDE && medidores.com >= UMBRAL_CONCEDE) resultado = "concede";
  else resultado = "aclara";

  const pasos = [saludo === "formal", proposito, peticion, adjunto, cierre, despedida];
  const completo =
    asunto !== "vacio" && pasos[0]! && pasos[1]! && pasos[2]! && pasos[4]! && pasos[5]! && cs.length === 0 && informales.length === 0 && oraciones >= 5 && !imperativo;

  return { palabras, oraciones, asunto, saludo, proposito, peticion, adjunto, cierre, despedida, fecha, contracciones: cs, informales, orden, medidores, resultado, pasos, completo };
}

/** Frases para tocar y agregar (todas del glosario A5 y la lectura A1). */
export const ARRANQUES = [
  "Dear Dr. Ortega,",
  "I am writing to request information about",
  "I would like to",
  "Could you please",
  "I would appreciate it if you could",
  "Please find attached my CV.",
  "Thank you very much for your time.",
  "I look forward to hearing from you.",
  "Best regards,",
  "Yours sincerely,",
];

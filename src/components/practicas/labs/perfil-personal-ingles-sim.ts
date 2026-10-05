/**
 * Simulador «En el mostrador» — IN-I-P04 (About me).
 *
 * Sofía (personaje ficticio) se inscribe a un curso de verano. El registrador,
 * Mr. Hale (ficticio), teclea en la ficha LO QUE ENTIENDE, no lo que ella
 * quiso decir: una respuesta que contesta otra pregunta o que rompe la
 * gramática deja un dato equivocado en la ficha, visible al instante.
 *
 * Módulo de datos puro. Inglés estadounidense estándar; explicaciones en
 * español de México. Todo es simulación con datos inventados.
 */

export type AnimoRegistrador = "feliz" | "duda" | "confuso";

export interface OpcionMostrador {
  texto: string;
  ok: boolean;
  /** Lo que el registrador teclea en el campo con esta respuesta. */
  escrito: string;
  /** Qué dice y cómo reacciona el registrador (en inglés, corto). */
  reaccion: string;
  animo: AnimoRegistrador;
  /** Por qué, en español. */
  porque: string;
}

export interface TurnoMostrador {
  id: string;
  /** Campo de la ficha que este turno llena. */
  campo: string;
  pregunta: string;
  traduccion: string;
  /** Clave de imagen en /media/labs-sim/perfil-personal-ingles/. */
  imagen: "mostrador-inscripcion" | "registrador-teclado" | "pantalla-formulario";
  opciones: OpcionMostrador[];
}

export const CAMPOS_MOSTRADOR = ["First name", "Last name", "Age", "Nationality", "Occupation", "Email address"] as const;

export const TURNOS_MOSTRADOR: TurnoMostrador[] = [
  {
    id: "t-first",
    campo: "First name",
    pregunta: "Hi! Let's start. What's your first name?",
    traduccion: "¡Hola! Empecemos. ¿Cuál es tu nombre de pila?",
    imagen: "mostrador-inscripcion",
    opciones: [
      {
        texto: "Ramírez Torres.",
        ok: false,
        escrito: "Ramírez Torres",
        reaccion: "Ramírez Torres... first name? Okay, I'll type it.",
        animo: "duda",
        porque: "Contestaste con los apellidos. El registrador los tecleó en «First name», que pide el nombre de pila: Sofía.",
      },
      {
        texto: "My name is Sofía.",
        ok: true,
        escrito: "Sofía",
        reaccion: "Nice to meet you, Sofía!",
        animo: "feliz",
        porque: "«My name is + nombre» da justo el dato que pedía «first name».",
      },
      {
        texto: "Me name is Sofía.",
        ok: false,
        escrito: "Me?",
        reaccion: "Me... name? Sorry, could you repeat that?",
        animo: "confuso",
        porque: "«Me» es pronombre de objeto. Para decir «mi nombre» se usa el posesivo «My»: My name is Sofía.",
      },
    ],
  },
  {
    id: "t-last",
    campo: "Last name",
    pregunta: "And what's your last name?",
    traduccion: "¿Y cuál es tu apellido?",
    imagen: "mostrador-inscripcion",
    opciones: [
      {
        texto: "My last name is Sofía.",
        ok: false,
        escrito: "Sofía",
        reaccion: "Sofía again? That's the same as the first name.",
        animo: "duda",
        porque: "«Sofía» ya es el nombre de pila. El apellido es lo que sigue: Ramírez Torres.",
      },
      {
        texto: "Ramírez Torres my last name is.",
        ok: false,
        escrito: "—",
        reaccion: "Sorry? I didn't understand the order.",
        animo: "confuso",
        porque: "En inglés el orden es sujeto + verbo + dato: My last name is Ramírez Torres. Al revés suena a otra cosa.",
      },
      {
        texto: "My last name is Ramírez Torres.",
        ok: true,
        escrito: "Ramírez Torres",
        reaccion: "Ramírez Torres. Got it.",
        animo: "feliz",
        porque: "Orden correcto y el dato que correspondía al campo «Last name».",
      },
    ],
  },
  {
    id: "t-age",
    campo: "Age",
    pregunta: "How old are you?",
    traduccion: "¿Cuántos años tienes?",
    imagen: "registrador-teclado",
    opciones: [
      {
        texto: "I am Mexican.",
        ok: false,
        escrito: "Mexican",
        reaccion: "Mexican... but I asked about your age.",
        animo: "confuso",
        porque: "Es inglés correcto, pero contesta otra pregunta (nacionalidad). La ficha de edad queda con «Mexican».",
      },
      {
        texto: "I have 17 years.",
        ok: false,
        escrito: "17 years?",
        reaccion: "You have 17 years... of what?",
        animo: "duda",
        porque: "En inglés la edad se dice con to be, no con «tener»: I am 17 (years old).",
      },
      {
        texto: "I am 17 years old.",
        ok: true,
        escrito: "17",
        reaccion: "Seventeen. Perfect.",
        animo: "feliz",
        porque: "«I am + número (+ years old)» es la forma natural de decir la edad.",
      },
    ],
  },
  {
    id: "t-nat",
    campo: "Nationality",
    pregunta: "What's your nationality?",
    traduccion: "¿Cuál es tu nacionalidad?",
    imagen: "registrador-teclado",
    opciones: [
      {
        texto: "I am Mexico.",
        ok: false,
        escrito: "Mexico",
        reaccion: "Mexico is a country. I need your nationality.",
        animo: "duda",
        porque: "«Mexico» es el país (sustantivo); la nacionalidad es el adjetivo: Mexican. El campo quedó con el dato equivocado.",
      },
      {
        texto: "I am from Mexican.",
        ok: false,
        escrito: "from Mexican",
        reaccion: "From Mexican? Hmm, that sounds odd.",
        animo: "confuso",
        porque: "«from» va con el país (I am from Mexico); con el adjetivo se dice solo I am Mexican.",
      },
      {
        texto: "I am Mexican.",
        ok: true,
        escrito: "Mexican",
        reaccion: "Mexican. Thank you!",
        animo: "feliz",
        porque: "La nacionalidad es un adjetivo y va después de «I am».",
      },
    ],
  },
  {
    id: "t-occ",
    campo: "Occupation",
    pregunta: "What do you do? I mean, what's your occupation?",
    traduccion: "¿A qué te dedicas? Es decir, ¿cuál es tu ocupación?",
    imagen: "pantalla-formulario",
    opciones: [
      {
        texto: "I am a student.",
        ok: true,
        escrito: "Student",
        reaccion: "A student. Great!",
        animo: "feliz",
        porque: "Con una ocupación se usa el artículo «a»: I am a student.",
      },
      {
        texto: "I am seventeen.",
        ok: false,
        escrito: "seventeen",
        reaccion: "Seventeen is your age. What's your occupation?",
        animo: "confuso",
        porque: "Contestaste otra vez la pregunta de la edad. La ocupación quedó como «seventeen».",
      },
      {
        texto: "I am student.",
        ok: false,
        escrito: "student?",
        reaccion: "I think you mean «a student», right?",
        animo: "duda",
        porque: "Falta el artículo: con ocupaciones se dice I am a student, no I am student.",
      },
    ],
  },
  {
    id: "t-email",
    campo: "Email address",
    pregunta: "Last one. What's your email address?",
    traduccion: "La última. ¿Cuál es tu correo electrónico?",
    imagen: "pantalla-formulario",
    opciones: [
      {
        texto: "My phone number is 951-204-9316.",
        ok: false,
        escrito: "951-204-9316",
        reaccion: "That's a phone number, not an email.",
        animo: "duda",
        porque: "El teléfono y el correo son campos distintos. En «Email address» quedó un número.",
      },
      {
        texto: "It's Sofia Ramirez.",
        ok: false,
        escrito: "Sofia Ramirez",
        reaccion: "That's your name. Where is the @ ?",
        animo: "confuso",
        porque: "Un correo lleva arroba y dominio; tu nombre no es una dirección.",
      },
      {
        texto: "It's sofia.ramirez at correo dot mx.",
        ok: true,
        escrito: "sofia.ramirez@correo.mx",
        reaccion: "sofia.ramirez@correo.mx. All set!",
        animo: "feliz",
        porque: "«at» es @ y «dot» es el punto: así se deletrea un correo en voz alta.",
      },
    ],
  },
];

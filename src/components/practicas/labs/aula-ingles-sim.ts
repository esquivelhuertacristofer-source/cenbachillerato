/**
 * Simulador «Vive la clase» — IN-I-P02 (In the classroom).
 *
 * Una clase de inglés de 20 minutos, cinco momentos. Lo que el alumno DICE
 * cambia lo que pasa: la maestra (ficticia) reacciona, el pizarrón muestra lo
 * que quedó y cada malentendido le cuesta 2 minutos de clase.
 *
 * Módulo de datos puro. Inglés estadounidense estándar; explicaciones en
 * español de México. Todo es simulación.
 */

export type ImagenClase = "salon-puerta" | "pizarron-pagina" | "pasillo-bano" | "mano-levantada";

export interface OpcionClase {
  texto: string;
  ok: boolean;
  /** Lo que responde la maestra. */
  maestra: string;
  /** Lo que queda escrito en el pizarrón después. */
  pizarron: string;
  porque: string;
}

export interface MomentoClase {
  id: string;
  titulo: string;
  icono: string;
  imagen: ImagenClase;
  /** La situación, en español. */
  situacion: string;
  /** Lo que dice la maestra al empezar el momento. */
  maestraInicia: string;
  maestraEs: string;
  /** Lo que muestra el pizarrón antes de que respondas. */
  pizarronInicial: string;
  opciones: OpcionClase[];
}

export const MINUTOS_CLASE = 20;
export const MINUTOS_POR_ERROR = 2;

export const MOMENTOS_CLASE: MomentoClase[] = [
  {
    id: "m-tarde",
    titulo: "Llegas tarde",
    icono: "fa-door-open",
    imagen: "salon-puerta",
    situacion: "Llegas cinco minutos tarde y la clase ya empezó. Estás en la puerta.",
    maestraInicia: "Good morning. We already started.",
    maestraEs: "Buenos días. Ya empezamos.",
    pizarronInicial: "Class started",
    opciones: [
      {
        texto: "I come in.",
        ok: false,
        maestra: "Are you asking or telling me? Wait at the door.",
        pizarron: "Wait at the door",
        porque: "«I come in» afirma que ya entraste; no pide permiso. La maestra te hace esperar.",
      },
      {
        texto: "Excuse me, sorry I'm late. May I come in?",
        ok: true,
        maestra: "Yes, please come in and sit down.",
        pizarron: "Welcome! Page 12 · Exercise 3",
        porque: "Excuse me abre el turno, sorry se disculpa y May I... ? pide permiso con cortesía.",
      },
      {
        texto: "Late I am.",
        ok: false,
        maestra: "Sorry? I didn't understand. Say it again, please.",
        pizarron: "Say it again, please",
        porque: "El orden importa: en inglés va sujeto + verbo (I am late). Al revés no se entiende.",
      },
    ],
  },
  {
    id: "m-repetir",
    titulo: "No oíste la página",
    icono: "fa-ear-listen",
    imagen: "pizarron-pagina",
    situacion: "La maestra da una instrucción y no alcanzaste a oír la página.",
    maestraInicia: "Open your books to page twelve and read exercise three.",
    maestraEs: "Abran sus libros en la página doce y lean el ejercicio tres.",
    pizarronInicial: "Page ??",
    opciones: [
      {
        texto: "Excuse me, could you repeat that, please?",
        ok: true,
        maestra: "Of course. Page twelve, exercise three.",
        pizarron: "Page 12 · Exercise 3",
        porque: "Could you repeat that, please? pide repetir con cortesía y la maestra lo hace despacio.",
      },
      {
        texto: "I don't like it.",
        ok: false,
        maestra: "You don't like the book? OK, we will skip it.",
        pizarron: "Book skipped. You are lost.",
        porque: "«I don't like it» habla de gusto, no de comprensión: la maestra entendió otra cosa.",
      },
      {
        texto: "Repeat!",
        ok: false,
        maestra: "Please use a polite question.",
        pizarron: "Could you...? May I...?",
        porque: "Una orden seca no es adecuada para la maestra. Se pide con could you... + please.",
      },
    ],
  },
  {
    id: "m-palabra",
    titulo: "Una palabra nueva",
    icono: "fa-spell-check",
    imagen: "pizarron-pagina",
    situacion: "La maestra pide algo con una palabra que no conoces.",
    maestraInicia: "Now underline the adjectives.",
    maestraEs: "Ahora subrayen los adjetivos.",
    pizarronInicial: "Underline the adjectives",
    opciones: [
      {
        texto: "Can I go to the bathroom?",
        ok: false,
        maestra: "Now? We are working. Please ask later.",
        pizarron: "Stay at your desk",
        porque: "Es una petición válida, pero contesta otra necesidad. Tu duda era una palabra.",
      },
      {
        texto: "I don't understand the class.",
        ok: false,
        maestra: "Which part? Tell me the word.",
        pizarron: "Which word?",
        porque: "Es demasiado vago. Conviene señalar la palabra que no entiendes.",
      },
      {
        texto: "What does \"underline\" mean?",
        ok: true,
        maestra: "It means to draw a line under a word.",
        pizarron: "underline = draw a line under a word",
        porque: "What does ... mean? pregunta el significado de una palabra concreta.",
      },
    ],
  },
  {
    id: "m-bano",
    titulo: "Necesitas salir",
    icono: "fa-person-walking",
    imagen: "pasillo-bano",
    situacion: "Mientras trabajan, necesitas ir al baño.",
    maestraInicia: "Continue working, everyone.",
    maestraEs: "Sigan trabajando, todos.",
    pizarronInicial: "Exercise 3 · 10 minutes",
    opciones: [
      {
        texto: "Go to the bathroom.",
        ok: false,
        maestra: "Are you giving me an order?",
        pizarron: "Stay in your seat",
        porque: "Es un imperativo: suena a que le das una orden a la maestra.",
      },
      {
        texto: "May I go to the bathroom, please?",
        ok: true,
        maestra: "Yes, you may. Come back soon.",
        pizarron: "Back in 2 minutes",
        porque: "May I...? es la forma formal de pedir permiso, y please la suaviza.",
      },
      {
        texto: "I go bathroom.",
        ok: false,
        maestra: "I don't understand. Please make a question.",
        pizarron: "Ask: May I...?",
        porque: "Falta el artículo y no es una pregunta; para pedir permiso se arma con May I.",
      },
    ],
  },
  {
    id: "m-participar",
    titulo: "Sabes la respuesta",
    icono: "fa-hand",
    imagen: "mano-levantada",
    situacion: "La maestra pregunta y tú sí sabes la respuesta.",
    maestraInicia: "Who can answer number five?",
    maestraEs: "¿Quién puede contestar el número cinco?",
    pizarronInicial: "Number 5: ____",
    opciones: [
      {
        texto: "I can, Teacher. I think the answer is \"went\".",
        ok: true,
        maestra: "Very good! Yes, \"went\".",
        pizarron: "5. went ✓",
        porque: "I can ofrece participar y I think... da la respuesta con respeto.",
      },
      {
        texto: "Me, me, me!",
        ok: false,
        maestra: "Please raise your hand and say your answer.",
        pizarron: "Raise your hand",
        porque: "Llama la atención pero no dice nada: falta ofrecer la respuesta.",
      },
      {
        texto: "Number five is easy.",
        ok: false,
        maestra: "Then what is the answer?",
        pizarron: "No answer yet",
        porque: "Opina sobre la dificultad, no contesta la pregunta que se hizo.",
      },
    ],
  },
];

/**
 * Contenido VERBATIM de la progresión IN-V-P07 (Inglés V) — «Participa en una
 * interacción oral semiestructurada (entrevista, presentación breve, panel)».
 *
 * Todo lo de este archivo sale tal cual de las actividades publicadas (volcado
 * con `scripts/dump-actividades.ts --progresion IN-V-P07`): lectura A1 con su
 * nota y sus preguntas, V/F A2 y A4 (el reto), reflexión A3, glosario A5 (que
 * A9 reconstruye en parejas), autoevaluación A7 y video A8. El fill_blanks A6
 * vive en `entrevista-ingles-huecos.ts`.
 */
import type { QuizEvaluable } from "./_reto-quiz";

/* ── A1 · lectura ────────────────────────────────────────────────────────── */

export const LECTURA_A1 = {
  titulo: "Participating in Academic Debates and Panels",
  fuente: "CEN Bachillerato — UAC Inglés V",
  parrafos: [
    "Academic debates and panel discussions are structured conversations where participants express, defend, and challenge ideas using evidence and reasoning. In English, these formats are used in universities, international conferences, and organizations like the United Nations. Developing the language and strategies for these conversations is a key B1-level skill.",
    "In a formal academic debate, participants are divided into two sides: the proposition (which argues in favor of a statement) and the opposition (which argues against it). Each side presents its arguments, then rebuttals — responses to the other side's points — and finally summaries. The moderator manages the time, gives the floor to each speaker, and ensures the debate stays on topic.",
    "In a panel discussion, several speakers each present their perspective on a topic, and a moderator coordinates the conversation and invites questions from the audience. Unlike a debate, a panel does not require participants to take opposing positions; it encourages multiple viewpoints on the same issue.",
    "Knowing the right language for different moments in these conversations is essential. To ask for the floor politely, say: May I add something? If I could just finish my point... Could I respond to that? To agree with a point, say: I agree with what [name] said because... That is a valid point, and I would add that... To disagree respectfully, use: I see your point; however, I would argue that... On the contrary, the evidence shows... I understand that perspective, but there is another way to look at it. To elaborate on your own idea: In other words... To be more specific... As an example of what I mean... This shows that...",
    "Active listening is just as important as speaking. When you paraphrase, you show you understood: So what you are saying is that... What I hear is that you believe... Clarifying questions show engagement: Could you clarify what you mean by...? Are you saying that...?",
    "At a B1 level, you should be comfortable discussing topics like the environment, technology, education, and social equality. Practice expanding your vocabulary in these areas: sustainability, inequality, access to education, digital rights, renewable energy, social justice. In Mexico, UNAM student forums and Model United Nations (MUN) conferences provide real opportunities to practice these skills in a formal English environment.",
  ],
  importante:
    "In academic English, the strength of your argument depends not just on what you say but on how you support it. Saying I think social media is bad is an opinion. Saying Studies from the Oxford Internet Institute show that heavy social media use correlates with lower wellbeing in teenagers is an argument supported by evidence. Always link your opinions to data, examples, or expert sources.",
};

export const COMPRENSION_A1: { pregunta: string; guia: string }[] = [
  {
    pregunta: "What is the difference between a formal debate and a panel discussion?",
    guia: "In a debate, participants take opposing sides (proposition vs. opposition) and rebut each other. In a panel, multiple speakers share different perspectives on the same topic without necessarily opposing each other, and a moderator coordinates.",
  },
  {
    pregunta: "How do you disagree respectfully in English? Give two phrases and explain why tone matters.",
    guia: "I see your point; however, I would argue that... / On the contrary, the evidence shows... Tone matters because respectful disagreement maintains the collaborative spirit of academic conversation and ensures others will continue to listen to your arguments.",
  },
  {
    pregunta: "What is the purpose of paraphrasing in a debate or panel and how do you do it?",
    guia: "Paraphrasing shows you listened and understood. Use: So what you are saying is... / What I hear is that you believe... It also gives the other person a chance to correct any misunderstanding before you respond.",
  },
];

/* ── A4 + A2 · verdadero o falso (el reto) ──────────────────────────────── */

const VF = ["True", "False"];

export const RETO_QUIZ: QuizEvaluable = {
  titulo: "True or False — Semi-Structured Speaking Interactions in English",
  puntajeMinimo: 70,
  reactivos: [
    // A4
    {
      enunciado: "In a formal presentation in English, it is appropriate to begin by saying: 'Good morning, everyone. Today I am going to talk about...'",
      opciones: VF,
      respuestaCorrecta: 0,
      retroalimentacion: "Correct! This is a standard and effective opening for a formal presentation. It greets the audience, establishes the time frame, and states the topic clearly. Other options: 'I'd like to begin by...', 'My presentation today focuses on...'",
    },
    {
      enunciado: "When you do not understand a question during a presentation or interview, the best strategy in English is to stay silent and wait for the next question.",
      opciones: VF,
      respuestaCorrecta: 1,
      retroalimentacion: "False! The best strategy is to use clarification language: 'Could you repeat that, please?', 'Could you clarify what you mean by...?', or 'If I understand correctly, you are asking about...' Staying silent is not appropriate in professional contexts.",
    },
    {
      enunciado: "The phrase 'As I mentioned earlier...' is useful for referring back to a point already made during a presentation.",
      opciones: VF,
      respuestaCorrecta: 0,
      retroalimentacion: "Correct! 'As I mentioned earlier...' (or 'As I said before...') is a cohesive device that helps the speaker connect ideas and remind the audience of previously stated information. It improves coherence in oral presentations.",
    },
    {
      enunciado: "In an interview in English, it is considered rude and inappropriate to ask for clarification using the phrase 'I beg your pardon?'",
      opciones: VF,
      respuestaCorrecta: 1,
      retroalimentacion: "False. 'I beg your pardon?' (or simply 'Pardon?') is a perfectly polite way to ask someone to repeat or clarify what they said in English. It is neither rude nor inappropriate — it is standard polite usage.",
    },
    {
      enunciado: "To transition between topics in a presentation, speakers can use phrases like 'Moving on to...' or 'Now let's look at...'",
      opciones: VF,
      respuestaCorrecta: 0,
      retroalimentacion: "Correct! Signposting language helps the audience follow the structure of a presentation. Examples: 'Moving on to my second point...', 'Now let's look at the results...', 'Turning to the next section...'",
    },
    // A2
    {
      enunciado: "In English debates and panels, it is polite to interrupt someone in the middle of their sentence to make your point quickly.",
      opciones: VF,
      respuestaCorrecta: 1,
      retroalimentacion: "FALSO. En debates y paneles en inglés, interrumpir abruptamente se considera descortés. La norma es esperar una pausa natural o usar frases de turn-taking: 'Can I add something here?', 'I'd like to respond to that point.' Interrumpir abruptamente puede interpretarse como falta de respeto al interlocutor.",
    },
    {
      enunciado: "The phrase 'That's a great point, but I think...' is an example of respectful disagreement in English.",
      opciones: VF,
      respuestaCorrecta: 0,
      retroalimentacion: "VERDADERO. Esta frase es un ejemplo clásico de desacuerdo respetuoso: primero reconoce el argumento del otro ('That's a great point'), luego introduce la diferencia de opinión ('but I think...'). Esta estructura valida al interlocutor antes de presentar una perspectiva diferente.",
    },
    {
      enunciado: "'Backchanneling' means taking over the conversation completely when the other person is speaking.",
      opciones: VF,
      respuestaCorrecta: 1,
      retroalimentacion: "FALSO. El backchannel (o backchanneling) son las señales que damos para indicar que estamos escuchando sin interrumpir: 'mm-hmm', 'I see', 'right', 'exactly'. No implica tomar el control de la conversación — al contrario, facilita que el hablante continúe sintiéndose escuchado.",
    },
    {
      enunciado: "Using phrases like 'In my opinion' or 'I believe' before stating your view helps signal to the audience that what follows is your personal perspective.",
      opciones: VF,
      respuestaCorrecta: 0,
      retroalimentacion: "VERDADERO. Las frases de opinión ('In my opinion', 'I believe', 'From my point of view') son señales discursivas que indican al interlocutor que la información que sigue es una perspectiva personal, no un hecho verificado. Esto es especialmente importante en debates académicos para distinguir hechos de opiniones.",
    },
    {
      enunciado: "If you don't know a word in English during a presentation, the best strategy is to stop talking and say nothing until you remember it.",
      opciones: VF,
      respuestaCorrecta: 1,
      retroalimentacion: "FALSO. La mejor estrategia es usar circunlocución (circumlocution): describir la palabra que no recuerdas. Por ejemplo: 'It's a kind of machine that...', 'It's the process of...', 'I don't remember the exact word, but it means...'. También puedes usar un sinónimo aproximado. Silenciarte completamente interrumpe el flujo de la presentación.",
    },
    {
      enunciado: "The phrase 'Could you repeat that, please?' is an appropriate way to ask for clarification during an oral interaction in English.",
      opciones: VF,
      respuestaCorrecta: 0,
      retroalimentacion: "VERDADERO. 'Could you repeat that, please?' es una frase de clarificación perfectamente apropiada en inglés — educada, directa y universalmente comprendida. Otras frases similares: 'I'm sorry, I didn't catch that.', 'Could you say that again more slowly?', 'What do you mean by [word]?'",
    },
  ],
};

/* ── A3 · reflexión escrita ─────────────────────────────────────────────── */

export const REFLEXION_A3 = {
  titulo: "Reflexión: mi experiencia en una presentación o debate en inglés",
  prompt:
    "Reflexiona sobre tu experiencia participando en conversaciones, presentaciones o debates en inglés durante este semestre. Responde: (1) ¿Qué estrategia de turn-taking (tomar y ceder la palabra) te resultó más útil? (2) ¿Cómo manejaste los momentos en que no conocías una palabra en inglés? (3) ¿Qué es lo que más mejoró en tu producción oral comparado con el semestre anterior? Puedes responder parte en español si necesitas.",
  pistas: [
    "Frases útiles que usaste: 'In my opinion...', 'I agree because...', 'That's a good point, but...'",
    "¿Cómo pediste aclaraciones: 'Could you repeat that?' / 'What do you mean by...?'",
    "¿Usaste sinónimos o explicaciones cuando no sabías una palabra exacta?",
  ],
  criterios: [
    "Identifica y describe al menos una estrategia concreta de turn-taking con un ejemplo de cómo la usó",
    "Explica cómo manejó la falta de vocabulario (circunlocución, sinónimos, solicitar aclaración)",
    "Reflexiona sobre su progreso real en producción oral con evidencia específica (antes vs. ahora)",
  ],
  minimoPalabras: 80,
};

/* ── A5 · glosario interactivo (A9 lo reconstruye en parejas) ───────────── */

export type FraseId = "apertura" | "transicion" | "aclaracion" | "tiempo" | "cierre" | "experiencia";

export interface TerminoGlosario {
  id: FraseId;
  termino: string;
  definicion: string;
  ejemplo: string;
}

export const GLOSARIO_A5: TerminoGlosario[] = [
  {
    id: "apertura",
    termino: "Today I am going to talk about... / My presentation focuses on...",
    definicion: "Standard opening statements for a formal presentation in English. They signal the topic clearly and orient the audience from the beginning.",
    ejemplo: "'Good afternoon. Today I am going to talk about the role of nutrition in athletic performance.' / 'My presentation focuses on sustainable energy solutions for urban areas.'",
  },
  {
    id: "transicion",
    termino: "Moving on to... / Now let's look at... / Turning to...",
    definicion: "Transition phrases (signposting language) used to move from one section or point to the next in a presentation. They help the audience follow the structure.",
    ejemplo: "'Moving on to the second point, I would like to address the economic impact.' / 'Now let's look at some real-world examples of this technology.'",
  },
  {
    id: "aclaracion",
    termino: "Could you repeat that, please? / Could you clarify what you mean by...?",
    definicion: "Clarification requests used when you do not understand a question or comment. Essential communication strategies for professional and academic interactions.",
    ejemplo: "'Could you repeat that, please? I didn't quite catch it.' / 'Could you clarify what you mean by 'sustainable'? There are different definitions.'",
  },
  {
    id: "tiempo",
    termino: "That's a great question. / Let me think about that for a moment.",
    definicion: "Phrases used to buy time and acknowledge a question before answering. They are polite, professional, and natural in English conversations and interviews.",
    ejemplo: "'That's a great question. In my experience, the main challenge is communication between departments.' / 'Let me think about that for a moment... I believe the key factor is funding.'",
  },
  {
    id: "cierre",
    termino: "In conclusion, / To wrap up, / To summarize...",
    definicion: "Closing phrases that signal the end of a presentation. They introduce the final summary or main takeaway for the audience.",
    ejemplo: "'In conclusion, the data shows that early intervention leads to significantly better outcomes.' / 'To wrap up, I would like to highlight three key points from today's presentation.'",
  },
  {
    id: "experiencia",
    termino: "From my experience... / Based on what I have learned...",
    definicion: "Phrases to introduce personal experience or knowledge as support for an argument or response in an interview or discussion.",
    ejemplo: "'From my experience volunteering in a hospital, teamwork is essential in healthcare.' / 'Based on what I have learned, renewable energy is more viable now than ever before.'",
  },
];

export const ACTIVIDAD_FINAL_A5 =
  "Prepare a 2-minute oral presentation in English about a topic from your field of study. Include: (1) a formal opening ('Today I am going to talk about...'), (2) at least two transition phrases ('Moving on to...'), (3) one closing phrase ('In conclusion,...'), and (4) be ready to respond to one clarification question using 'Could you repeat that?' or 'That's a great question.'";

/** A9 — el distractor que no tiene pareja (la apertura de A5). */
export const DISTRACTOR_A9 =
  "Standard opening statements for a formal presentation in English. They signal the topic clearly and orient the audience from the beginning.";

/* ── A7 · autoevaluación ────────────────────────────────────────────────── */

export const AUTOEVALUACION_A7 = {
  instrucciones: "Marca tu nivel honesto en cada criterio.",
  escala: ["En inicio", "En proceso", "Logrado", "Destacado"],
  criterios: [
    "Puedo iniciar y cerrar una presentación oral en inglés usando frases apropiadas ('Today I am going to...', 'In conclusion...').",
    "Uso lenguaje de señalización (signposting) para organizar mi presentación y guiar a la audiencia ('Moving on to...', 'As I mentioned...').",
    "Puedo pedir aclaraciones de manera educada en inglés ('Could you repeat that?', 'Could you clarify...?') en lugar de quedarme callado o responder sin entender.",
    "Puedo responder a preguntas en inglés durante una entrevista o panel usando estrategias como 'That's a great question' o 'From my experience...'.",
  ],
  reflexion:
    "Graba (o ensaya en voz alta) una presentación de 60-90 segundos en inglés sobre tu campo de estudio. Usa al menos: una frase de apertura, una transición, y una frase de cierre. Luego reflexiona en español: ¿Qué aspectos de la presentación oral en inglés te generan más inseguridad y por qué? ¿Qué estrategia específica vas a practicar más?",
};

/* ── A8 · video ─────────────────────────────────────────────────────────── */

export const VIDEO_A8 = {
  titulo: "Participar en debates y paneles en inglés",
  descripcion: "Los debates académicos y los paneles son conversaciones estructuradas donde se defiende y se cuestiona una idea con evidencia.",
  abierta: "Escribe en inglés cómo pedirías la palabra, cómo mostrarías desacuerdo con respeto y cómo parafrasearías lo que dijo otra persona.",
  opcionMultiple: {
    pregunta: "¿Qué caracteriza a un panel frente a un debate formal?",
    opciones: ["Los participantes deben tomar posiciones opuestas", "No requiere posiciones opuestas: fomenta múltiples perspectivas", "No participa un moderador"],
    correcta: 1,
  },
  verdaderoFalso: {
    enunciado: "Parafrasear lo que dijo otra persona es una forma de escucha activa y demuestra que se entendió su punto.",
    respuesta: true,
  },
};

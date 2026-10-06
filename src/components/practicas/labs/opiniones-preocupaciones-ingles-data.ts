/**
 * Contenido VERBATIM de la progresión IN-V-P04 (Inglés V) — «Expresa
 * opiniones, preferencias y preocupaciones sobre temas relacionados con el
 * campo de estudio o la comunidad».
 *
 * Todo lo de este archivo sale tal cual de las actividades publicadas (volcado
 * con `scripts/dump-actividades.ts --progresion IN-V-P04`). Lo único derivado
 * son los `PARES_MODALES` del modo «Escribe el término»: el término y su
 * traducción son los de la lectura A1, y el ejemplo es la misma oración de A1
 * con el término tapado (si se viera, se regalaría).
 */
import type { QuizEvaluable } from "./_reto-quiz";
import type { ParTermino } from "./_mecanica-termino";

/* ── A1 · lectura ────────────────────────────────────────────────────────── */

export const LECTURA_A1 = {
  titulo: "Expressing opinions and concerns at B1 level",
  fuente: "Material CEN Bachillerato — IN-V (A2+/B1)",
  texto: `Una competencia central en el nivel B1 es expresar opiniones de forma organizada y con evidencia. Esto es útil en debates escolares, ensayos, presentaciones y conversaciones sobre temas de interés.

ESTRUCTURA: OPINIÓN + EVIDENCIA + CONCLUSIÓN

Esta estructura te ayuda a expresar ideas de forma clara y convincente:
1. Opinión: lo que piensas o crees
2. Evidencia: datos, ejemplos o razones que apoyan tu opinión
3. Conclusión: tu postura final o llamado a la acción

FRASES PARA EXPRESAR OPINIONES:
• "In my opinion, [idea]..." (En mi opinión, [idea]...)
• "I believe that [idea]..." (Creo que [idea]...)
• "I think it is important to [action] because..." (Creo que es importante [acción] porque...)
• "From my point of view, [idea]..." (Desde mi punto de vista, [idea]...)

FRASES PARA PRESENTAR EVIDENCIA:
• "The evidence suggests that..." (La evidencia sugiere que...)
• "According to [source], [fact]..." (Según [fuente], [hecho]...)
• "For example, [specific case]..." (Por ejemplo, [caso específico]...)
• "Studies show that..." (Los estudios muestran que...)

MODALES PARA EXPRESAR POSIBILIDAD Y RECOMENDACIÓN:
• should — recomendación: "Governments should invest in renewable energy."
• could — posibilidad: "Young people could make a difference by changing their habits."
• might — posibilidad menos segura: "This might be one of the biggest challenges of our century."
• would — condición: "If everyone recycled, pollution would decrease significantly."

CONECTORES DE CONTRASTE:
• however (sin embargo): "Fossil fuels are cheap. However, they are extremely polluting."
• although (aunque): "Although renewable energy is expensive at first, it saves money long-term."
• despite (a pesar de): "Despite the challenges, many young people are taking action."
• on the other hand (por otro lado): "On the other hand, some people argue that economic growth must come first."

EJEMPLO DE TEXTO DE OPINIÓN — Cambio climático y acción juvenil en México:

In my opinion, climate change is the most pressing challenge of our generation. I believe that young people in Mexico and around the world have a crucial role to play in addressing this crisis.

The evidence suggests that Mexico is already experiencing the serious effects of climate change. According to SEMARNAT (Mexico's Ministry of Environment), the frequency of extreme weather events — such as droughts in Sonora and floods in Tabasco — has increased significantly in recent decades. For example, the 2020 drought affected millions of people in northern Mexico, threatening agriculture and water supply.

However, there are also reasons to be optimistic. Young Mexicans are increasingly involved in environmental activism. Movements like Fridays for Future, inspired by Swedish activist Greta Thunberg, have reached cities like Guadalajara, Monterrey, and Mexico City. Although some critics argue that student protests do not produce immediate results, I believe they raise awareness and put pressure on policymakers.

On the other hand, individual action alone is not enough. Governments and corporations should take responsibility for the largest share of carbon emissions. Despite the importance of personal choices — like recycling or using public transport — systemic change is also necessary.

In conclusion, climate change requires collective action at all levels: individual, community, national, and international. Young people might not have the power to change policies overnight, but our voices, our creativity, and our commitment could make all the difference.

PREGUNTAS DE COMPRENSIÓN:
1. ¿Cuál es la opinión principal del texto? ¿Cómo la apoya el autor con evidencia?
2. Identifica dos conectores de contraste en el texto y explica el contraste que cada uno establece.
3. ¿Estás de acuerdo con la conclusión del texto? Formula tu propia opinión usando al menos una frase de opinión y un modal aprendido.`,
  callout:
    "Para opinar con cortesía sirven frases como «In my opinion…», «I think that…» o «I'm worried about…»; y para no sonar tajante: «I'm not sure, but…».",
};

export const COMPRENSION_A1: { pregunta: string; guia: string }[] = [
  {
    pregunta: "¿Cuál es la opinión principal del texto? ¿Cómo la apoya el autor con evidencia?",
    guia: "La opinión principal es que el cambio climático es el desafío más urgente de la generación actual y que los jóvenes tienen un papel crucial. El autor la apoya con: datos de SEMARNAT sobre eventos climáticos extremos, el ejemplo concreto de la sequía de 2020 en el norte de México, y la mención del movimiento Fridays for Future en ciudades mexicanas.",
  },
  {
    pregunta: "Identifica dos conectores de contraste en el texto y explica el contraste que cada uno establece.",
    guia: "Ejemplos: 'However' (párrafo 3) establece contraste entre los efectos negativos del cambio climático y las razones para ser optimista. 'Although' (párrafo 3) contrasta la crítica a las protestas estudiantiles con la creencia de que sensibilizan y presionan a los legisladores. 'On the other hand' (párrafo 4) contrasta la acción individual con la necesidad de cambio sistémico.",
  },
  {
    pregunta: "¿Estás de acuerdo con la conclusión del texto? Formula tu propia opinión usando al menos una frase de opinión y un modal aprendido.",
    guia: "Respuesta abierta del estudiante. Se evalúa el uso correcto de una frase de opinión (In my opinion / I believe that) y al menos un modal (should / could / might / would) en contexto apropiado. Ejemplo: 'In my opinion, young people should focus on both individual actions and political engagement, because both could contribute to real change.'",
  },
];

/** Las frases de A1 para presentar evidencia (verbatim). */
export const FRASES_EVIDENCIA_A1: { en: string; es: string }[] = [
  { en: "The evidence suggests that...", es: "La evidencia sugiere que..." },
  { en: "According to [source], [fact]...", es: "Según [fuente], [hecho]..." },
  { en: "For example, [specific case]...", es: "Por ejemplo, [caso específico]..." },
  { en: "Studies show that...", es: "Los estudios muestran que..." },
];

/* ── Modales y conectores de A1 → «Escribe el término» ─────────────────── */

/**
 * Los cuatro modales y los cuatro conectores de contraste de A1. `definicion`
 * es la traducción o la función que da la propia lectura; `ejemplo` es su
 * oración de A1 con el término tapado.
 */
export const PARES_MODALES: ParTermino[] = [
  { id: "should", termino: "should", definicion: "Modal de recomendación.", ejemplo: "\"Governments ______ invest in renewable energy.\"" },
  { id: "could", termino: "could", definicion: "Modal de posibilidad.", ejemplo: "\"Young people ______ make a difference by changing their habits.\"" },
  { id: "might", termino: "might", definicion: "Modal de posibilidad menos segura.", ejemplo: "\"This ______ be one of the biggest challenges of our century.\"" },
  { id: "would", termino: "would", definicion: "Modal de condición.", ejemplo: "\"If everyone recycled, pollution ______ decrease significantly.\"" },
  { id: "however", termino: "however", definicion: "Conector de contraste: sin embargo.", ejemplo: "\"Fossil fuels are cheap. ______, they are extremely polluting.\"" },
  { id: "although", termino: "although", definicion: "Conector de contraste: aunque.", ejemplo: "\"______ renewable energy is expensive at first, it saves money long-term.\"" },
  { id: "despite", termino: "despite", definicion: "Conector de contraste: a pesar de.", ejemplo: "\"______ the challenges, many young people are taking action.\"" },
  { id: "on-the-other-hand", termino: "on the other hand", definicion: "Conector de contraste: por otro lado.", ejemplo: "\"______, some people argue that economic growth must come first.\"" },
];

/* ── A3 + A4 · verdadero o falso (el reto) ─────────────────────────────── */

/**
 * Los dos verdadero/falso publicados, uno detrás de otro y sin cambios:
 * A3 «¿Verdadero o falso? Expresar opiniones y argumentos en inglés» (6) y
 * A4 «True or False — Expressing Opinions and Preferences in English» (5).
 * Los dos piden 70 % para aprobar.
 */
export const RETO_QUIZ: QuizEvaluable = {
  titulo: "¿Verdadero o falso? Opiniones, preferencias y preocupaciones (A3 + A4)",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "The sentence 'I think that young people should take action' is an example of an opinion supported by a modal verb.",
      opciones: ["True", "False"],
      respuestaCorrecta: 0,
      retroalimentacion: "VERDADERO. 'I think' señala que es una opinión personal, y 'should' es un modal que expresa recomendación. La estructura 'I think/believe/feel that + [modal] + [action]' es una forma muy común de expresar opiniones con peso argumentativo en inglés B1.",
    },
    {
      enunciado: "'However' is used to introduce an idea that AGREES with the previous sentence.",
      opciones: ["True", "False"],
      respuestaCorrecta: 1,
      retroalimentacion: "FALSO. 'However' es un conector de CONTRASTE — introduce una idea que contrasta o contradice lo que se dijo antes. Ejemplo: 'Renewable energy is expensive. However, it saves money in the long term.' Para introducir una idea que COINCIDE, se usan: 'Moreover', 'In addition', 'Furthermore', 'Also'.",
    },
    {
      enunciado: "The structure 'opinion + evidence + conclusion' is a recommended way to organize an argument at B1 level.",
      opciones: ["True", "False"],
      respuestaCorrecta: 0,
      retroalimentacion: "VERDADERO. La estructura opinión → evidencia → conclusión es una forma clara y efectiva de argumentar en inglés académico. Primero declaras lo que crees, luego lo apoyas con datos o ejemplos, y finalmente refuerzas tu postura con una conclusión. Esta estructura es valorada en ensayos, debates y presentaciones.",
    },
    {
      enunciado: "The modal 'might' expresses the same degree of certainty as 'will'.",
      opciones: ["True", "False"],
      respuestaCorrecta: 1,
      retroalimentacion: "FALSO. 'Will' expresa certeza o decisión firme sobre el futuro. 'Might' expresa posibilidad o incertidumbre — algo que PODRÍA ocurrir pero no es seguro. Escala aproximada: will (certeza alta) > should (expectativa) > could (posibilidad) > might (posibilidad baja o incierta). Ejemplo: 'It will rain' vs. 'It might rain — I'm not sure.'",
    },
    {
      enunciado: "The phrase 'According to the evidence...' helps to signal that what follows is based on data, not just personal opinion.",
      opciones: ["True", "False"],
      respuestaCorrecta: 0,
      retroalimentacion: "VERDADERO. 'According to [source/evidence]...' es una señal discursiva que indica que la información proviene de una fuente externa o datos verificables, no de una opinión personal. Esta frase es clave en el inglés académico para distinguir entre lo que uno piensa y lo que la evidencia muestra.",
    },
    {
      enunciado: "'On the other hand' can be used to present both sides of an argument in an opinion text.",
      opciones: ["True", "False"],
      respuestaCorrecta: 0,
      retroalimentacion: "VERDADERO. 'On the other hand' se usa para introducir la perspectiva opuesta o una consideración alternativa en un argumento — es esencial en textos de opinión que presentan dos lados de un tema. Ejemplo: 'Renewable energy is beneficial for the environment. On the other hand, the initial cost is very high for many countries.'",
    },
    {
      enunciado: "The sentence 'In my opinion, technology has a positive impact on education' is a correct and formal way to express an opinion in English.",
      opciones: ["True", "False"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correct! 'In my opinion, + subject + verb...' is a standard structure for expressing opinions formally. Other options: 'I believe that...', 'I think that...', 'From my point of view...'",
    },
    {
      enunciado: "'I prefer study in groups than study alone' is a grammatically correct sentence for expressing preference in English.",
      opciones: ["True", "False"],
      respuestaCorrecta: 1,
      retroalimentacion: "False. After 'prefer', use a gerund ('I prefer studying in groups to studying alone') or 'to' + infinitive ('I prefer to study in groups rather than study alone'). With gerunds, the structure is prefer [gerund] to [gerund], NOT 'than'.",
    },
    {
      enunciado: "To express a concern about the environment in your field, you can correctly say: 'I am worried about the impact of industrial waste on water quality.'",
      opciones: ["True", "False"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correct! 'I am worried about + noun/gerund' is the standard structure for expressing concern. Other patterns: 'I am concerned about...', 'One of my concerns is...'",
    },
    {
      enunciado: "The phrase 'I would rather work outdoors than in an office' correctly uses the structure 'would rather + base verb + than + base verb'.",
      opciones: ["True", "False"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correct! 'Would rather + base verb + than + base verb' expresses preference between two options. Example: 'I would rather collaborate with a team than work alone.'",
    },
    {
      enunciado: "When disagreeing politely in English, you can say: 'I see your point, but I think...' to acknowledge the other person's view before presenting your own.",
      opciones: ["True", "False"],
      respuestaCorrecta: 0,
      retroalimentacion: "Correct! 'I see your point, but...' is a polite disagreement strategy. It shows respect for the other person's view before introducing your own perspective. Other options: 'That's a good point, however...' / 'I understand what you mean, but...'",
    },
  ],
};

/* ── A5 · glosario interactivo (y A9, que reconstruye los mismos pares) ── */

export interface TerminoGlosario {
  termino: string;
  definicion: string;
  ejemplo: string;
}

export const GLOSARIO_A5: TerminoGlosario[] = [
  {
    termino: "In my opinion, / I believe that...",
    definicion: "Phrases used to introduce a personal opinion. 'In my opinion' is placed at the start of the sentence. 'I believe that' is followed by a full clause.",
    ejemplo: "'In my opinion, every student should learn basic coding skills.' / 'I believe that technology improves healthcare outcomes.'",
  },
  {
    termino: "I prefer... to... / I would rather... than...",
    definicion: "'I prefer [gerund] to [gerund]' and 'I would rather [base verb] than [base verb]' are both used to express preference between two options.",
    ejemplo: "'I prefer working in a lab to working in an office.' / 'I would rather study medicine than law.'",
  },
  {
    termino: "I am worried about / I am concerned about...",
    definicion: "Structures to express concern or anxiety about a situation or problem. Both are followed by a noun or gerund (-ing form).",
    ejemplo: "'I am worried about the lack of access to quality education in rural areas.' / 'I am concerned about climate change and its effect on agriculture.'",
  },
  {
    termino: "I see your point, but... / That's a good point, however...",
    definicion: "Polite disagreement phrases. They acknowledge the other person's idea before introducing a contrasting view. Essential for respectful discussion.",
    ejemplo: "'I see your point, but I think renewable energy is more cost-effective in the long run.' / 'That's a good point, however, we also need to consider the social impact.'",
  },
  {
    termino: "From my point of view... / As I see it...",
    definicion: "Phrases to introduce a personal perspective or interpretation, slightly more emphatic than 'in my opinion'. Common in discussions and debates.",
    ejemplo: "'From my point of view, healthcare should be accessible to everyone.' / 'As I see it, the biggest challenge in this field is funding.'",
  },
  {
    termino: "I strongly believe that... / I am not sure, but...",
    definicion: "Adverbs like 'strongly' intensify an opinion. 'I am not sure, but...' introduces a tentative opinion with less certainty — useful for hedging.",
    ejemplo: "'I strongly believe that mental health should be part of the school curriculum.' / 'I am not sure, but I think the experiment needs more repetitions.'",
  },
];

export const ACTIVIDAD_FINAL_A5 =
  "Write a short paragraph (4-6 sentences) in English expressing your opinion, a preference, and a concern about a topic related to your field of study. Use at least one phrase from each category: opinion ('In my opinion...' / 'I believe that...'), preference ('I prefer... to...' or 'I would rather...'), and concern ('I am worried about...' / 'I am concerned about...').";

/** A9 · el distractor del relacionar columnas (las parejas son las de A5). */
export const A9 = {
  titulo: "Relaciona los conceptos clave de la progresión 4",
  instrucciones:
    "Toca un concepto de la izquierda y después la definición que le corresponde. Son los términos del glosario de esta progresión: la idea es reconstruirlos de memoria, no buscarlos.",
  distractor:
    "Phrases to introduce a personal perspective or interpretation, slightly more emphatic than 'in my opinion'. Common in discussions and debates.",
};

/* ── A7 · autoevaluación ────────────────────────────────────────────────── */

export const AUTOEVALUACION_A7 = {
  instrucciones: "Marca tu nivel honesto en cada criterio.",
  escala: ["En inicio", "En proceso", "Logrado", "Destacado"],
  criterios: [
    "Puedo expresar mi opinión en inglés usando frases como 'In my opinion...', 'I believe that...' o 'From my point of view...' de forma fluida.",
    "Puedo expresar preferencias entre dos opciones usando 'I prefer [gerund] to [gerund]' o 'I would rather... than...' correctamente.",
    "Puedo expresar preocupaciones relacionadas con mi campo o comunidad usando 'I am worried/concerned about + noun/gerund'.",
    "Puedo mantener una discusión respetuosa en inglés, reconociendo la opinión del otro ('I see your point, but...') antes de dar la mía.",
  ],
  reflexion:
    "Elige un tema relevante para tu campo de estudio (por ejemplo: el uso de la inteligencia artificial, la escasez de agua, el acceso a servicios de salud). En inglés, escribe: (1) tu opinión, (2) tu preferencia, y (3) una preocupación al respecto. Luego reflexiona en español: ¿Qué estructuras gramaticales te resultaron más difíciles de usar?",
};

/* ── A8 · video ─────────────────────────────────────────────────────────── */

export const VIDEO_A8 = {
  titulo: "Expresar opiniones y preferencias en inglés",
  descripcion:
    "Video que muestra frases en inglés para expresar opiniones, preferencias y preocupaciones sobre temas del campo de estudio o de la comunidad.",
  abierta: "¿Qué expresiones en inglés puedes usar para dar tu opinión sobre un tema, además de 'I think'?",
  opcionMultiple: {
    pregunta: "¿Cuál de las siguientes frases expresa una preferencia en inglés?",
    opciones: ["'I was born in...'", "'I prefer... to...'", "'It is raining today.'"],
    correcta: 1,
  },
  verdaderoFalso: {
    enunciado: "Expresar opiniones y preocupaciones en inglés permite participar en discusiones sobre temas de interés de la comunidad.",
    respuesta: true,
  },
};

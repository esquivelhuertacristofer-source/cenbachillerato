/**
 * Contenido VERBATIM de la progresión IN-V-P05 (Inglés V) — «Lee y analiza
 * textos breves vinculados con el campo temático o el campo de estudio
 * (comprensión…)».
 *
 * Todo lo de este archivo sale tal cual de las actividades publicadas (volcado
 * con `scripts/dump-actividades.ts --progresion IN-V-P05`). Lo único derivado
 * son los `PARES_ESTRATEGIAS` del modo «Escribe el término»: el término, su
 * traducción y su oración son los de la lista de vocabulario Tier 2 y del
 * recuadro de la lectura A1, con el término tapado en la oración (si se viera,
 * se regalaría), y `ORACIONES_BIO`, que es el texto de práctica de A1 partido
 * en oraciones (sin tocar una letra).
 */
import type { QuizEvaluable } from "./_reto-quiz";
import type { ParTermino } from "./_mecanica-termino";

/* ── A1 · lectura ────────────────────────────────────────────────────────── */

export const LECTURA_A1 = {
  titulo: "Reading strategies for B1: skimming, scanning y lectura detallada",
  fuente: "Material CEN Bachillerato — IN-V (A2+/B1)",
  texto: `Leer en inglés a nivel B1 no significa entender cada palabra — significa usar estrategias inteligentes para extraer la información que necesitas. Las tres estrategias principales son: skimming, scanning y lectura detallada.

ESTRATEGIA 1: SKIMMING — Lectura rápida para la idea general

Skimming significa leer rápidamente un texto para identificar su tema principal y estructura, sin leer cada palabra. Es útil cuando tienes poco tiempo o cuando necesitas decidir si un texto es relevante antes de leerlo con detalle.

Cómo hacer skimming:
• Lee el título y los subtítulos (headings)
• Lee el primer y último párrafo completos
• Lee la primera oración de cada párrafo intermedio (topic sentence)
• Mira imágenes, gráficos y palabras en negrita o cursiva

Ejemplo práctico: Tienes 30 segundos para decidir si este artículo es útil para tu proyecto. ¿De qué trata? Haz skimming y encuentra la respuesta.

ESTRATEGIA 2: SCANNING — Búsqueda de información específica

Scanning significa mover los ojos rápidamente por el texto buscando información específica: un nombre, una fecha, un número, una cifra o un término clave. No lees todo — solo buscas lo que necesitas.

Cuándo usar scanning:
• Buscar la fecha de un evento histórico en un artículo
• Encontrar el nombre de una organización o persona
• Localizar estadísticas o porcentajes
• Responder preguntas de opción múltiple sobre un texto largo

Trucos para scanning eficaz:
• Sabe exactamente qué estás buscando ANTES de empezar
• Mueve los ojos en zigzag o en "S" por el texto
• Para cuando encuentres lo que buscas — no sigas leyendo

ESTRATEGIA 3: LECTURA DETALLADA — Párrafo por párrafo

La lectura detallada (close reading) implica leer con atención para entender argumentos, matices e ideas complejas. Se usa para textos académicos, instrucciones importantes o pasajes que necesitas analizar.

Cómo identificar HECHOS vs. OPINIONES:
• HECHO (fact): puede verificarse con datos o evidencia objetiva. Ejemplo: "Mexico has over 130 million inhabitants." (Esto se puede comprobar con el censo.)
• OPINIÓN (opinion): refleja el punto de vista de alguien. Ejemplo: "Mexico City is the best place to study in Latin America." (Esto varía según la persona.)
• Palabras que señalan opinión: believe, think, argue, suggest, in my view, according to [person]
• Palabras que señalan hechos: show, prove, demonstrate, according to [official data/study]

VOCABULARIO ACADÉMICO TIER 2 (frecuente en textos de bachillerato y universidad):
• analyze (analizar): "We will analyze the causes of deforestation in the Yucatán Peninsula."
• identify (identificar): "Can you identify the main argument in this paragraph?"
• compare (comparar): "Compare the biodiversity of the rainforest and the desert."
• evaluate (evaluar): "Evaluate whether the government's measures are sufficient."
• summarize (resumir): "Summarize the main ideas of the text in 3 sentences."

PRÁCTICA — Texto corto sobre biodiversidad en México:

Mexico is considered a megadiverse country — one of only 17 nations in the world that together host approximately 70% of all plant and animal species on Earth. This remarkable biodiversity is distributed across Mexico's diverse ecosystems: tropical rainforests in Chiapas and the Yucatán, deserts in Sonora and Baja California, high-altitude forests around Popocatépetl, and coral reefs in the Caribbean.

However, scientists argue that this biodiversity is under serious threat. According to CONABIO (National Commission for the Knowledge and Use of Biodiversity), Mexico has lost approximately 35% of its original forest cover due to agricultural expansion, urbanization, and illegal logging. The jaguar, the axolotl, and the vaquita marina are among the most endangered species in Mexico.

Despite these challenges, Mexico has made progress. The government has established over 180 natural protected areas (áreas naturales protegidas); together with large marine reserves they cover a significant share of the country, although the strictly land-based protected area is around 12% of the national territory. NGOs and local communities also play an important role in conservation efforts.

PREGUNTAS:
1. Usa SKIMMING: ¿Cuál es el tema principal del texto? (máx. 10 segundos)
2. Usa SCANNING: ¿Qué porcentaje de la cobertura forestal original ha perdido México?
3. LECTURA DETALLADA: Identifica una afirmación de hecho y una de opinión en el texto. ¿Cómo lo sabes?`,
  callout:
    "Skimming es leer rápido para captar la idea general; scanning es buscar un dato concreto (una fecha, un nombre o una cifra) sin leer todo el texto.",
};

export const COMPRENSION_A1: { pregunta: string; guia: string }[] = [
  {
    pregunta: "Usa SKIMMING: ¿Cuál es el tema principal del texto? (máx. 10 segundos)",
    guia: "El tema principal es la biodiversidad de México: su riqueza natural, las amenazas que enfrenta (deforestación, especies en peligro) y las medidas de conservación. El skimming permite identificar esto leyendo el título, el primer párrafo y las primeras oraciones de cada sección.",
  },
  {
    pregunta: "Usa SCANNING: ¿Qué porcentaje de la cobertura forestal original ha perdido México?",
    guia: "México ha perdido aproximadamente el 35% de su cobertura forestal original, según CONABIO. Para encontrar este dato con scanning, se buscan números y porcentajes en el texto (el símbolo % o palabras como 'percent', 'approximately').",
  },
  {
    pregunta: "LECTURA DETALLADA: Identifica una afirmación de hecho y una de opinión en el texto. ¿Cómo lo sabes?",
    guia: "Hecho: 'Mexico has lost approximately 35% of its original forest cover' — verificable con datos de CONABIO (fuente oficial). Opinión: 'scientists argue that this biodiversity is under serious threat' — usa 'argue', señal de punto de vista, aunque sea una opinión muy respaldada por evidencia. También 'Mexico is considered a megadiverse country' es un hecho reconocido internacionalmente.",
  },
];

/**
 * El texto de práctica de A1, oración por oración (verbatim). `parrafo` es el
 * párrafo de la lectura (0–2); la primera oración de cada párrafo es su topic
 * sentence.
 */
export const ORACIONES_BIO: { id: string; parrafo: number; texto: string }[] = [
  { id: "s1", parrafo: 0, texto: "Mexico is considered a megadiverse country — one of only 17 nations in the world that together host approximately 70% of all plant and animal species on Earth." },
  { id: "s2", parrafo: 0, texto: "This remarkable biodiversity is distributed across Mexico's diverse ecosystems: tropical rainforests in Chiapas and the Yucatán, deserts in Sonora and Baja California, high-altitude forests around Popocatépetl, and coral reefs in the Caribbean." },
  { id: "s3", parrafo: 1, texto: "However, scientists argue that this biodiversity is under serious threat." },
  { id: "s4", parrafo: 1, texto: "According to CONABIO (National Commission for the Knowledge and Use of Biodiversity), Mexico has lost approximately 35% of its original forest cover due to agricultural expansion, urbanization, and illegal logging." },
  { id: "s5", parrafo: 1, texto: "The jaguar, the axolotl, and the vaquita marina are among the most endangered species in Mexico." },
  { id: "s6", parrafo: 2, texto: "Despite these challenges, Mexico has made progress." },
  { id: "s7", parrafo: 2, texto: "The government has established over 180 natural protected areas (áreas naturales protegidas); together with large marine reserves they cover a significant share of the country, although the strictly land-based protected area is around 12% of the national territory." },
  { id: "s8", parrafo: 2, texto: "NGOs and local communities also play an important role in conservation efforts." },
];

/** Palabras que la lectura A1 da como señales de opinión y de hecho. */
export const SENALES_A1 = {
  opinion: ["believe", "think", "argue", "suggest", "in my view", "according to [person]"],
  hecho: ["show", "prove", "demonstrate", "according to [official data/study]"],
};

/* ── «Escribe el término» (A1: recuadro y vocabulario Tier 2) ─────────────── */

export const PARES_ESTRATEGIAS: ParTermino[] = [
  {
    id: "skimming",
    termino: "skimming",
    definicion: "Es leer rápido para captar la idea general (recuadro de A1).",
    ejemplo: "Lee el título y los subtítulos (headings) · Lee la primera oración de cada párrafo intermedio (topic sentence).",
  },
  {
    id: "scanning",
    termino: "scanning",
    definicion: "Es buscar un dato concreto (una fecha, un nombre o una cifra) sin leer todo el texto (recuadro de A1).",
    ejemplo: "Mueve los ojos en zigzag o en \"S\" por el texto · Para cuando encuentres lo que buscas.",
  },
  {
    id: "close-reading",
    termino: "close reading",
    definicion: "La lectura detallada: implica leer con atención para entender argumentos, matices e ideas complejas.",
    ejemplo: "Se usa para textos académicos, instrucciones importantes o pasajes que necesitas analizar.",
  },
  { id: "analyze", termino: "analyze", definicion: "En español: analizar.", ejemplo: "\"We will ______ the causes of deforestation in the Yucatán Peninsula.\"" },
  { id: "identify", termino: "identify", definicion: "En español: identificar.", ejemplo: "\"Can you ______ the main argument in this paragraph?\"" },
  { id: "compare", termino: "compare", definicion: "En español: comparar.", ejemplo: "\"______ the biodiversity of the rainforest and the desert.\"" },
  { id: "evaluate", termino: "evaluate", definicion: "En español: evaluar.", ejemplo: "\"______ whether the government's measures are sufficient.\"" },
  { id: "summarize", termino: "summarize", definicion: "En español: resumir.", ejemplo: "\"______ the main ideas of the text in 3 sentences.\"" },
];

/* ── A3 · reflexión escrita ─────────────────────────────────────────────── */

export const CONSIGNA_A3 = {
  titulo: "Reflexión: ¿qué aprendí de un texto auténtico en inglés?",
  prompt:
    "Lee el siguiente texto corto en inglés sobre biodiversidad en México y respóndelo en inglés (puedes mezclar español si es necesario):\n\n'Mexico is one of the world's most biodiverse countries, home to about 10% of all plant and animal species on Earth. However, deforestation, pollution, and climate change are threatening this biodiversity. The Mexican government, through SEMARNAT, has created natural protected areas, but scientists say more action is needed.'\n\nResponde: (1) What is the main idea of the text? (2) Is it a fact or an opinion that 'more action is needed'? Explain why. (3) Do you agree with the text's message? Give at least two reasons.",
  pistas: [
    "Use skimming to find the main idea first",
    "A fact can be verified; an opinion reflects a point of view",
    "You can start with: 'In my opinion...' / 'I agree because...' / 'According to the text...'",
  ],
  criterios: [
    "Identifica correctamente la idea principal del texto en sus propias palabras",
    "Distingue entre hecho y opinión y explica cómo lo sabe (qué palabras o claves le indican que es opinión)",
    "Expresa su propia opinión sobre el mensaje del texto con al menos dos razones específicas",
  ],
  longitudMinima: 80,
};

/* ── A2 (opción múltiple) + A4 (verdadero o falso) · el reto ───────────── */

export const RETO_QUIZ: QuizEvaluable = {
  titulo: "Reading strategies — A2 + A4",
  puntajeMinimo: 70,
  reactivos: [
    {
      enunciado: "You have 20 seconds to decide if an article is useful for your project. Which reading strategy should you use?",
      opciones: [
        "Scanning — search for specific data",
        "Close reading — read every word carefully",
        "Skimming — read quickly for the general idea",
        "Translation — translate the whole text to Spanish",
      ],
      respuestaCorrecta: 2,
      retroalimentacion:
        "SKIMMING es la estrategia correcta cuando necesitas obtener la idea general rápidamente — lees el título, los subtítulos, el primer y último párrafo. SCANNING es para buscar información específica (un nombre, un número). Close reading es para entender en profundidad — requiere más tiempo.",
    },
    {
      enunciado: "Which of these is a FACT (not an opinion)?",
      opciones: [
        "Mexico is home to approximately 10% of all plant species on Earth.",
        "Mexico is the best country in the world for ecotourism.",
        "In my view, Mexico's biodiversity is more impressive than Brazil's.",
        "The Mexican government should invest more in environmental education.",
      ],
      respuestaCorrecta: 0,
      retroalimentacion:
        "Un HECHO es verificable con datos objetivos. 'Mexico is home to approximately 10% of all plant species' es un dato de organismos internacionales (CONABIO, IUCN) que puede comprobarse. Las otras opciones contienen: 'best' (juicio subjetivo), 'should' (recomendación/opinión), 'In my view' (señal explícita de opinión).",
    },
    {
      enunciado: "What does the academic verb 'analyze' mean?",
      opciones: [
        "To find specific information in a text quickly",
        "To summarize a text in one sentence",
        "To translate academic vocabulary into Spanish",
        "To examine something carefully to understand its parts and how they relate",
      ],
      respuestaCorrecta: 3,
      retroalimentacion:
        "'Analyze' significa examinar algo con cuidado para entender sus partes y cómo se relacionan entre sí — implica un proceso intelectual profundo. 'Summarize' = resumir. 'Scan' = buscar datos específicos. La traducción no es una estrategia académica equivalente.",
    },
    {
      enunciado: "You need to find the date when a law was passed in a long government report. Which strategy is MOST efficient?",
      opciones: ["Scan for numbers and dates", "Translate the document", "Do a close reading of every paragraph", "Skim the whole document"],
      respuestaCorrecta: 0,
      retroalimentacion:
        "SCANNING es la estrategia más eficiente para encontrar información específica como fechas, nombres o cifras. Mueves los ojos rápidamente buscando el patrón de una fecha (números, palabras como 'in 2020', 'on March 15'). Skimming y close reading serían innecesariamente lentos para esta tarea.",
    },
    {
      enunciado: "Which sentence correctly uses the academic verb 'evaluate'?",
      opciones: [
        "Evaluate means to translate into simpler language.",
        "Evaluate whether the proposed solution is effective and explain your reasoning.",
        "Evaluate the text quickly without reading all of it.",
        "You should evaluate by writing more than five pages.",
      ],
      respuestaCorrecta: 1,
      retroalimentacion:
        "'Evaluate' = valorar, emitir un juicio crítico sobre algo con razones. 'Evaluate whether the solution is effective and explain your reasoning' usa el término correctamente — implica análisis y justificación. Las otras opciones confunden 'evaluate' con skimming, simplificación o extensión.",
    },
    {
      enunciado: "Skimming a text means reading it very carefully, word by word, to understand every detail.",
      opciones: ["True", "False"],
      respuestaCorrecta: 1,
      retroalimentacion:
        "False. Skimming means reading quickly to get the general idea or main topic of a text — not for details. For details, you use 'scanning'. Skimming is useful to preview what a text is about before reading in depth.",
    },
    {
      enunciado: "The main idea of a paragraph is usually expressed in the topic sentence, which is most commonly found at the beginning of the paragraph.",
      opciones: ["True", "False"],
      respuestaCorrecta: 0,
      retroalimentacion:
        "Correct! In English academic texts, the topic sentence introduces the main idea of a paragraph and is typically the first sentence. The rest of the paragraph supports or develops that idea.",
    },
    {
      enunciado: "When summarizing a text in English, it is acceptable to copy entire sentences from the original text without quotation marks.",
      opciones: ["True", "False"],
      respuestaCorrecta: 1,
      retroalimentacion:
        "False. Copying text without quotation marks is plagiarism. A summary must paraphrase the original ideas in your own words. If you quote directly, use quotation marks and credit the source.",
    },
    {
      enunciado: "Linking words such as 'however', 'therefore', and 'in addition' help the reader understand the logical relationship between ideas in a text.",
      opciones: ["True", "False"],
      respuestaCorrecta: 0,
      retroalimentacion:
        "Correct! These are discourse connectors. 'However' signals contrast; 'therefore' signals consequence; 'in addition' adds information. Recognizing them improves reading comprehension significantly.",
    },
    {
      enunciado: "To express an opinion about a text you have read, you can use the phrase: 'According to the text, the author argues that...' followed by your own reaction.",
      opciones: ["True", "False"],
      respuestaCorrecta: 0,
      retroalimentacion:
        "Correct! 'According to the text/author...' is the standard phrase to introduce information from a source. After citing the text, you can add your reaction: '...which I find convincing / questionable / interesting because...'",
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
    termino: "The main idea of the text is...",
    definicion: "A phrase used to introduce the central message or topic of a text when summarizing or analyzing it. Equivalent to 'the text is mainly about...'",
    ejemplo: "'The main idea of the text is that early diagnosis improves cancer survival rates.' / 'The main idea of the article is the importance of renewable energy.'",
  },
  {
    termino: "According to the author / According to the text...",
    definicion: "A citation phrase used to attribute an idea to the source text without copying it verbatim. Essential for academic writing and reading responses.",
    ejemplo: "'According to the author, climate change is the most urgent challenge of our generation.' / 'According to the text, regular exercise reduces the risk of chronic diseases.'",
  },
  {
    termino: "However / Nevertheless / On the other hand...",
    definicion: "Contrast connectors used in texts to introduce opposing ideas, counterarguments, or contrasting information. Recognizing them helps comprehension of complex texts.",
    ejemplo: "'Renewable energy is growing rapidly. However, it still represents a small percentage of global energy production.'",
  },
  {
    termino: "In other words, / That is to say...",
    definicion: "Paraphrasing markers used in texts to restate a complex idea in simpler terms. Useful for both comprehension and for writing summaries.",
    ejemplo: "'The procedure is non-invasive. In other words, it does not require surgery or any incision.'",
  },
  {
    termino: "I find this text / argument... because...",
    definicion: "An opinion structure for evaluating a text. 'I find [noun] [adjective] because [reason]' expresses a personal evaluation supported by reasoning.",
    ejemplo: "'I find this argument convincing because the author supports it with scientific data.' / 'I find this text difficult to understand because of the technical vocabulary.'",
  },
  {
    termino: "To sum up / In conclusion / To summarize...",
    definicion: "Summary markers used at the end of a text or paragraph to restate the most important points. They signal that the writer is closing or concluding.",
    ejemplo: "'To sum up, the article argues that access to clean water is a fundamental human right.' / 'In conclusion, further research is needed in this field.'",
  },
];

export const ACTIVIDAD_FINAL_A5 =
  "Read a short text (at least one paragraph) from your field of study — you can find one in a textbook, magazine, or online. Then write a 4-5 sentence response in English: (1) state the main idea, (2) use 'According to the text...' to cite one specific idea, (3) identify one connector ('however', 'therefore', etc.) and explain its function, and (4) give your opinion using 'I find this text...'.";

export const RELACIONAR_A9 = {
  instrucciones:
    "Toca un concepto de la izquierda y después la definición que le corresponde. Son los términos del glosario de esta progresión: la idea es reconstruirlos de memoria, no buscarlos.",
};

/* ── A7 · autoevaluación ────────────────────────────────────────────────── */

export const AUTOEVALUACION_A7 = {
  instrucciones: "Marca tu nivel honesto en cada criterio.",
  escala: ["En inicio", "En proceso", "Logrado", "Destacado"],
  criterios: [
    "Puedo identificar la idea principal de un texto corto en inglés y expresarla en mis propias palabras.",
    "Uso frases como 'According to the text/author...' para citar y referirme a fuentes en inglés sin copiar textualmente.",
    "Reconozco y comprendo conectores de contraste ('however', 'nevertheless'), consecuencia ('therefore') y adición ('in addition') al leer textos en inglés.",
    "Puedo escribir una opinión sobre un texto leído en inglés usando 'I find this text... because...' u otras estructuras de evaluación crítica.",
  ],
  reflexion:
    "Busca un texto corto (un párrafo o un artículo breve) sobre tu campo de estudio en inglés. Lee el título y el primer párrafo usando skimming. Luego, en inglés, escribe: (1) la idea principal y (2) una oración con tu opinión. En español, reflexiona: ¿Qué estrategia de lectura te ayudó más a comprender el texto?",
};

/* ── A8 · video ─────────────────────────────────────────────────────────── */

export const VIDEO_A8 = {
  titulo: "Comprensión de lectura en inglés",
  descripcion:
    "Video que explica estrategias para leer, resumir y opinar sobre textos breves en inglés vinculados con un campo temático o de estudio.",
  abierta: "¿Qué estrategias te ayudan a entender un texto en inglés aunque no conozcas todas las palabras?",
  multiple: {
    pregunta: "¿Qué se recomienda hacer primero al leer un texto breve en inglés para comprenderlo mejor?",
    opciones: ["Traducir palabra por palabra desde el inicio", "Identificar el tema general y las ideas principales", "Memorizar el texto completo"],
    correcta: 1,
  },
  verdaderoFalso: {
    enunciado: "Leer y resumir textos breves en inglés ayuda a desarrollar la comprensión lectora en ese idioma.",
    respuesta: true,
  },
};

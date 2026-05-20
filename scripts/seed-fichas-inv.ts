/**
 * Seed de fichas de biblioteca para IN-V (Inglés V — A2+/B1 "We are the champions").
 * 21 fichas temáticas alineadas al MCCEMS 2025, Semestre 5.
 *
 * Uso: npx tsx scripts/seed-fichas-inv.ts
 * Idempotente: upsert por campo "slug".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

// ---------------------------------------------------------------------------
// FICHAS
// ---------------------------------------------------------------------------

const FICHAS_INV = [
  // ── 1 ── Gramática B1 ─────────────────────────────────────────────────────
  {
    slug: "in-v-present-perfect-uso-y-formacion",
    titulo: "Present Perfect: formación y usos principales",
    categoria: "Gramática B1",
    conceptos_clave: ["present perfect", "have/has + participio", "experiencias", "resultados presentes", "for/since"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El Present Perfect es uno de los tiempos verbales que más diferencia el nivel A2+ del B1. Se forma con have o has seguido del participio pasado del verbo (la tercera columna de los verbos irregulares, o verbo + -ed para los regulares). Se usa para conectar el pasado con el presente: experiencias de vida, acciones que acaban de ocurrir, situaciones que comenzaron en el pasado y continúan hasta hoy, y logros o resultados que tienen relevancia en el momento actual.",
        },
        {
          tipo: "subtitulo",
          contenido: "Formación del Present Perfect",
        },
        {
          tipo: "lista",
          items: [
            "Afirmativa: sujeto + have/has + participio. I have visited Oaxaca. / She has finished her homework.",
            "Negativa: sujeto + have/has + not + participio. They haven't arrived yet. / He hasn't eaten breakfast.",
            "Interrogativa: Have/Has + sujeto + participio? Have you ever tried sushi? / Has she called you?",
            "have con I, you, we, they: We have lived here for ten years. / Have they seen the movie?",
            "has con he, she, it: She has never been to the United States. / Has it rained today?",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Los cuatro usos principales",
        },
        {
          tipo: "lista",
          items: [
            "Experiencias de vida (ever/never): Have you ever eaten a grasshopper taco? / I have never tried bungee jumping. Se refiere a si algo ocurrió en algún momento de la vida, sin especificar cuándo.",
            "Acciones recientes con resultado presente (just/already/yet): I have just finished my exam. (Acabo de terminar mi examen.) / She has already left. (Ya se fue.) / Have you packed your bag yet? (Ya empacaste tu maleta?)",
            "Duración hasta el presente (for/since): I have studied English for three years. / She has lived in Toluca since 2018. For + duración; since + punto de inicio.",
            "Logros y cambios (cambio de estado): The city has changed a lot. / My English has improved this semester. / Technology has transformed our lives.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La diferencia clave entre el Present Perfect y el Past Simple es la conexión con el presente. Present Perfect: I have lost my keys (no sé dónde están AHORA). Past Simple: I lost my keys yesterday (narración de un evento pasado completo, el momento es conocido). Si mencionas un tiempo específico del pasado (yesterday, last week, in 2020), DEBES usar Past Simple, no Present Perfect.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Línea de tiempo que muestra la diferencia entre Present Perfect (pasado conectado al presente) y Past Simple (evento pasado cerrado), con ejemplos en inglés y traducción",
          caption: "El Present Perfect conecta el pasado con el presente; el Past Simple cierra el evento en el pasado.",
        },
      ],
    },
  },

  // ── 2 ── Gramática B1 ─────────────────────────────────────────────────────
  {
    slug: "in-v-past-simple-vs-present-perfect",
    titulo: "Past Simple vs. Present Perfect: cómo elegir",
    categoria: "Gramática B1",
    conceptos_clave: ["past simple", "present perfect", "diferencia de tiempos", "marcadores temporales", "nivel B1"],
    tiempo_lectura_minutos: 8,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La distinción entre el Past Simple y el Present Perfect es uno de los errores más comunes de los hablantes hispanohablantes de inglés. En español, a veces las dos formas son intercambiables ('Comí' y 'He comido'), pero en inglés la diferencia es clara y sistemática. Dominar esta distinción es una de las metas centrales del nivel B1.",
        },
        {
          tipo: "subtitulo",
          contenido: "Regla práctica: ¿el tiempo importa?",
        },
        {
          tipo: "parrafo",
          contenido:
            "La pregunta clave es: ¿estoy señalando CUÁNDO ocurrió la acción? Si sí, usa Past Simple. Si no importa cuándo, sino que simplemente ocurrió (o no) en algún momento de la vida, o si el resultado importa ahora, usa Present Perfect. Marcadores que exigen Past Simple: yesterday, last week/month/year, in 2019, two days ago, on Monday, when I was young. Marcadores que van con Present Perfect: ever, never, already, yet, just, recently, lately, for, since, so far, up to now.",
        },
        {
          tipo: "subtitulo",
          contenido: "Comparación directa: misma idea, distinto tiempo",
        },
        {
          tipo: "lista",
          items: [
            "Past Simple: I saw that movie last Friday. (Vi esa película el viernes pasado — evento cerrado, tiempo específico.)",
            "Present Perfect: I have seen that movie. (He visto esa película — experiencia de vida, no importa cuándo.)",
            "Past Simple: She visited Guadalajara in 2022. (Visitó Guadalajara en 2022 — momento específico.)",
            "Present Perfect: She has visited Guadalajara three times. (Ha visitado Guadalajara tres veces — número de experiencias.)",
            "Past Simple: Did you eat breakfast? (¿Desayunaste? — pregunta sobre la mañana, tiempo implícito ya pasado.)",
            "Present Perfect: Have you eaten yet? (¿Ya comiste? — resultado relevante ahora, no importa cuándo.)",
            "Past Simple: I lost my phone two days ago. (Perdí mi teléfono hace dos días — con marcador temporal.)",
            "Present Perfect: I have lost my phone. (Perdí mi teléfono — resultado: no lo tengo ahora.)",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "En inglés británico se prefiere el Present Perfect en situaciones donde el inglés americano admite el Past Simple. Por ejemplo, un británico diría 'I've just eaten' mientras que un americano podría decir 'I just ate'. Ambas formas son correctas; depende de la variedad de inglés. Para el MCCEMS, cualquier variedad es aceptable siempre que seas consistente.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tabla comparativa de Past Simple vs. Present Perfect con marcadores temporales, ejemplos y contextos de uso para cada tiempo verbal",
          caption: "Elige el tiempo verbal según si el momento del pasado es relevante o no para el mensaje.",
        },
      ],
    },
  },

  // ── 3 ── Gramática B1 ─────────────────────────────────────────────────────
  {
    slug: "in-v-modal-verbs-posibilidad",
    titulo: "Modal verbs: might, could, should, would",
    categoria: "Gramática B1",
    conceptos_clave: ["modal verbs", "verbos modales", "posibilidad", "consejo", "condicional"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Los verbos modales (modal verbs) son auxiliares que expresan actitud, posibilidad, probabilidad, consejo u obligación. A nivel B1, dominarás cuatro de los más versátiles: might (posibilidad baja o incierta), could (posibilidad o sugerencia), should (recomendación o expectativa) y would (condicional o cortesía). Los cuatro se forman de la misma manera: modal + verbo en forma base (infinitivo sin to), y no cambian con el sujeto — no llevan -s en tercera persona.",
        },
        {
          tipo: "subtitulo",
          contenido: "Might: posibilidad incierta",
        },
        {
          tipo: "lista",
          items: [
            "Posibilidad (50% o menos): It might rain this afternoon. (Puede que llueva esta tarde — no estoy seguro.)",
            "Planes tentativas: I might go to the party, but I'm not sure yet. (Quizás vaya a la fiesta, pero no estoy seguro todavía.)",
            "Suposición: She might be at the library. (Puede que esté en la biblioteca.)",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Could: posibilidad o sugerencia",
        },
        {
          tipo: "lista",
          items: [
            "Posibilidad en el pasado: When I was young, I could run very fast. (Cuando era joven, podía correr muy rápido.)",
            "Posibilidad presente o futura: We could take the metro or the bus. (Podríamos tomar el metro o el autobús.)",
            "Sugerencia amable: You could try studying with flashcards. (Podrías intentar estudiar con tarjetas.)",
            "Solicitud cortés: Could you help me with this? (¿Podrías ayudarme con esto?)",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Should: recomendación y expectativa",
        },
        {
          tipo: "lista",
          items: [
            "Recomendación o consejo: You should get more sleep. (Deberías dormir más.)",
            "Expectativa (algo que se espera que ocurra): The bus should arrive at 3 pm. (El autobús debería llegar a las 3 pm.)",
            "Obligación moral leve: We should recycle more. (Deberíamos reciclar más.)",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Would: condicional y cortesía",
        },
        {
          tipo: "lista",
          items: [
            "Condicional (resultado de condición): If I had more time, I would travel to Japan. (Si tuviera más tiempo, viajaría a Japón.)",
            "Solicitud muy cortés: Would you mind opening the window? (¿Le importaría abrir la ventana?)",
            "Preferencia: I would prefer the chicken, please. (Preferiría el pollo, por favor.)",
            "Hábito en el pasado: When I was a child, I would eat tacos every Sunday. (Cuando era niño, comía tacos cada domingo.)",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Recuerda: los verbos modales NUNCA llevan -s en tercera persona singular. INCORRECTO: She mights be there. CORRECTO: She might be there. Tampoco se combina con to antes del infinitivo. INCORRECTO: You should to study. CORRECTO: You should study. Estos dos errores son los más frecuentes a nivel B1.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de los cuatro verbos modales (might, could, should, would) con su nivel de certeza o fuerza, desde posibilidad incierta hasta condicional, con ejemplos en inglés",
          caption: "Cada verbo modal expresa un grado distinto de posibilidad, consejo o cortesía.",
        },
      ],
    },
  },

  // ── 4 ── Gramática B1 ─────────────────────────────────────────────────────
  {
    slug: "in-v-voz-pasiva-formacion-y-uso",
    titulo: "Voz pasiva: It is used to... / It was built in...",
    categoria: "Gramática B1",
    conceptos_clave: ["voz pasiva", "passive voice", "be + participio", "by-agent", "nivel B1"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La voz pasiva (passive voice) cambia el enfoque de la oración: en vez de señalar quién hace la acción (voz activa), destaca quién o qué recibe la acción. Se usa cuando el agente (quien hace la acción) es desconocido, irrelevante o cuando queremos enfatizar el resultado. Es muy frecuente en textos académicos, noticias, descripciones de procesos y datos históricos, todos contextos importantes a nivel B1.",
        },
        {
          tipo: "subtitulo",
          contenido: "Formación de la voz pasiva",
        },
        {
          tipo: "lista",
          items: [
            "Estructura básica: sujeto + verbo to be (conjugado) + participio pasado. The book was written in 1995. (El libro fue escrito en 1995.)",
            "Presente simple pasivo: is/are + participio. English is spoken in many countries. (El inglés se habla en muchos países.) / Tacos are eaten all over Mexico. (Los tacos se comen en todo México.)",
            "Pasado simple pasivo: was/were + participio. The pyramids were built thousands of years ago. (Las pirámides fueron construidas hace miles de años.) / The agreement was signed in 1994. (El acuerdo fue firmado en 1994.)",
            "Presente perfecto pasivo: has/have been + participio. Many species have been discovered in the rainforest. (Muchas especies han sido descubiertas en la selva tropical.) / The app has been downloaded millions of times. (La aplicación ha sido descargada millones de veces.)",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "El agente: cuándo usar by",
        },
        {
          tipo: "parrafo",
          contenido:
            "Puedes mencionar quién realizó la acción usando by + agente al final. Solo se incluye si la información es importante o interesante: The Aztec Calendar was carved by expert craftsmen. (El Calendario Azteca fue tallado por artesanos expertos.) / Cien años de soledad was written by Gabriel García Márquez. Si el agente es obvio o irrelevante, se omite: The suspect was arrested. (Se arrestó al sospechoso — sabemos que fue la policía.) / The windows were broken during the storm.",
        },
        {
          tipo: "callout",
          variante: "ejemplo",
          contenido:
            "Activa vs. Pasiva con mismo significado: ACTIVA: Scientists discovered a new species in 2024. (Los científicos descubrieron una nueva especie en 2024 — énfasis en los científicos.) PASIVA: A new species was discovered in 2024. (Una nueva especie fue descubierta en 2024 — énfasis en la especie.) La elección depende de en qué quieres enfocar la atención del lector.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Usos típicos de la voz pasiva en contextos académicos y B1: descripciones de procesos (The water is filtered and then purified), datos históricos (The treaty was signed in 1848), reglas y normas (Phones are not allowed during exams), noticias (Three people were injured in the accident), ciencia (The results were recorded and analyzed). Reconocer la voz pasiva en lectura es clave para el nivel B1.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Esquema comparativo de voz activa y pasiva con flechas mostrando el cambio de énfasis, ejemplos en presente y pasado simple, y uso del agente con by",
          caption: "La voz pasiva desplaza el énfasis del agente al receptor de la acción.",
        },
      ],
    },
  },

  // ── 5 ── Gramática B1 ─────────────────────────────────────────────────────
  {
    slug: "in-v-condicionales-tipo-1-y-2",
    titulo: "Oraciones condicionales tipo 1 y tipo 2",
    categoria: "Gramática B1",
    conceptos_clave: ["conditional sentences", "oraciones condicionales", "if clauses", "tipo 1", "tipo 2"],
    tiempo_lectura_minutos: 8,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Las oraciones condicionales (conditional sentences) expresan situaciones hipotéticas y sus consecuencias. En inglés B1, dominarás dos tipos: el Tipo 1 (situaciones reales y posibles en el presente o futuro) y el Tipo 2 (situaciones imaginarias o poco probables). La diferencia entre ambas es fundamental: cambia la actitud del hablante frente a la posibilidad de que la condición ocurra.",
        },
        {
          tipo: "subtitulo",
          contenido: "Tipo 1: condición real o posible (presente/futuro)",
        },
        {
          tipo: "parrafo",
          contenido:
            "El Tipo 1 expresa algo que el hablante considera posible o probable. Estructura: If + presente simple + will + infinitivo. Ejemplos: If you study every day, you will pass the exam. (Si estudias todos los días, pasarás el examen.) / If it rains tomorrow, we will stay home. (Si llueve mañana, nos quedaremos en casa.) / If you eat breakfast, you will have more energy. (Si desayunas, tendrás más energía.) El orden puede invertirse sin coma cuando la cláusula principal va primero: You will pass the exam if you study every day.",
        },
        {
          tipo: "subtitulo",
          contenido: "Tipo 2: condición imaginaria o poco probable (presente/futuro)",
        },
        {
          tipo: "parrafo",
          contenido:
            "El Tipo 2 expresa situaciones hipotéticas que el hablante no considera probables, o que son contrarias a la realidad actual. Estructura: If + pasado simple + would + infinitivo. Nota importante: con el verbo to be en el Tipo 2, se usa were para todos los sujetos en inglés formal (aunque were/was son aceptables en informal). Ejemplos: If I had a million pesos, I would travel the world. (Si tuviera un millón de pesos, viajaría por el mundo — no tengo un millón.) / If she were the president, she would change the education system. (Si ella fuera presidenta, cambiaría el sistema educativo — no es presidenta.) / If we lived near the beach, we would swim every day. (Si viviéramos cerca de la playa, nadaríamos todos los días.)",
        },
        {
          tipo: "lista",
          items: [
            "Tipo 1 — Posible: If I have time this weekend, I will help you study. (Es posible que tenga tiempo.)",
            "Tipo 2 — Imaginario: If I had more time, I would help you study. (Implica: no tengo tiempo suficiente ahora.)",
            "Tipo 1: If you don't hurry, you will miss the bus. (Es una advertencia realista.)",
            "Tipo 2: If I were you, I would apologize. (Consejo hipotético — no soy tú.)",
            "Tipo 1: If we recycle more, we will protect the environment. (Acción posible con resultado real.)",
            "Tipo 2: If animals could talk, what would they say? (Situación imaginaria, imposible en la realidad.)",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Error frecuente: NO uses will en la cláusula con if. INCORRECTO: If you will study, you will pass. CORRECTO: If you study, you will pass. Tampoco uses would en la cláusula con if en el Tipo 2. INCORRECTO: If I would have money, I would travel. CORRECTO: If I had money, I would travel. La cláusula con if siempre expresa la condición, nunca la consecuencia.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de dos columnas comparando el Tipo 1 (posible, If + presente + will) y el Tipo 2 (hipotético, If + pasado + would) con ejemplos paralelos y traducción al español",
          caption: "El Tipo 1 es posible; el Tipo 2 es imaginario o contrario a la realidad.",
        },
      ],
    },
  },

  // ── 6 ── Vocabulario académico B1 ─────────────────────────────────────────
  {
    slug: "in-v-vocabulary-fields-of-study",
    titulo: "Vocabulary for describing fields of study",
    categoria: "Vocabulario académico B1",
    conceptos_clave: ["fields of study", "áreas de conocimiento", "vocabulary B1", "academic English", "disciplinas"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "En el nivel B1, necesitas hablar sobre tus intereses académicos y campos de estudio en inglés. Ya sea para una entrevista, una presentación oral o un texto descriptivo, contar con vocabulario específico para describir áreas del conocimiento te permite expresarte con mayor precisión y credibilidad académica. Esta ficha presenta el vocabulario esencial para hablar sobre campos de estudio, sus características y su relevancia.",
        },
        {
          tipo: "subtitulo",
          contenido: "Campos de estudio: vocabulario esencial",
        },
        {
          tipo: "lista",
          items: [
            "Natural Sciences (ciencias naturales): biology (biología), chemistry (química), physics (física), ecology (ecología), geology (geología), astronomy (astronomía).",
            "Social Sciences (ciencias sociales): sociology (sociología), psychology (psicología), economics (economía), political science (ciencias políticas), anthropology (antropología).",
            "Humanities (humanidades): history (historia), philosophy (filosofía), literature (literatura), linguistics (lingüística), art history (historia del arte).",
            "Applied Sciences and Technology (ciencias aplicadas y tecnología): engineering (ingeniería), computer science (ciencias computacionales), medicine (medicina), architecture (arquitectura), biotechnology (biotecnología).",
            "Arts and Communication (artes y comunicación): graphic design (diseño gráfico), journalism (periodismo), film studies (estudios cinematográficos), music (música), theater (teatro).",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Cómo describir un campo de estudio",
        },
        {
          tipo: "lista",
          items: [
            "Biology is the scientific study of living organisms. (La biología es el estudio científico de los organismos vivos.)",
            "Economics deals with the production, distribution, and consumption of goods and services. (La economía trata sobre la producción, distribución y consumo de bienes y servicios.)",
            "Computer science focuses on algorithms, programming, and the design of software. (Las ciencias computacionales se enfocan en algoritmos, programación y diseño de software.)",
            "Linguistics examines the structure, history, and variation of human language. (La lingüística examina la estructura, historia y variación del lenguaje humano.)",
            "Architecture combines art and engineering to design buildings and spaces. (La arquitectura combina el arte y la ingeniería para diseñar edificios y espacios.)",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "En inglés académico, es común usar frases como 'This field explores...', 'The discipline focuses on...', 'Researchers in this area study...' para introducir una descripción. Evita empezar siempre con 'This subject is about...' — es correcto pero demasiado básico para el nivel B1. Variar las estructuras de apertura mejora la calidad de tus textos y presentaciones.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mapa conceptual con los principales campos de estudio organizados en cuatro categorías: ciencias naturales, ciencias sociales, humanidades y artes, con sus nombres en inglés y español",
          caption: "El vocabulario académico en inglés te permite hablar de tu campo de interés con precisión.",
        },
      ],
    },
  },

  // ── 7 ── Vocabulario académico B1 ─────────────────────────────────────────
  {
    slug: "in-v-academic-verbs-b1",
    titulo: "Academic verbs: analyze, evaluate, compare, identify, describe",
    categoria: "Vocabulario académico B1",
    conceptos_clave: ["academic verbs", "verbos académicos", "analyze", "evaluate", "B1 writing"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Los verbos académicos (academic verbs) son la columna vertebral de la escritura y el discurso formal en inglés. A nivel B1, se espera que uses estos verbos correctamente en instrucciones de examen, textos descriptivos, exposiciones orales y escritos argumentativos. Dominar estos verbos no solo mejora tu inglés: también te prepara para el tipo de tareas que encontrarás en la educación superior.",
        },
        {
          tipo: "subtitulo",
          contenido: "Los cinco verbos académicos esenciales",
        },
        {
          tipo: "lista",
          items: [
            "Analyze (analizar): examinar algo en detalle para entender su estructura o significado. 'In your essay, analyze the causes of the Mexican Revolution.' / 'The scientist analyzed the water samples from the river.'",
            "Evaluate (evaluar): juzgar el valor, la calidad o la importancia de algo con criterios claros. 'Evaluate the advantages and disadvantages of social media for teenagers.' / 'The committee will evaluate your project next week.'",
            "Compare (comparar): examinar dos o más cosas para identificar semejanzas y diferencias. 'Compare the education systems of Mexico and Finland.' / 'The report compares the results of both experiments.'",
            "Identify (identificar): reconocer o señalar algo de manera específica. 'Identify the main idea in each paragraph.' / 'Can you identify the grammatical error in this sentence?'",
            "Describe (describir): presentar las características o detalles de algo de forma clara y ordenada. 'Describe the process of photosynthesis in your own words.' / 'She described her experience studying abroad.'",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Verbos adicionales de nivel B1",
        },
        {
          tipo: "lista",
          items: [
            "Summarize (resumir): reducir información a sus puntos más importantes. 'Summarize the article in three sentences.'",
            "Explain (explicar): dar razones o detalles para hacer algo comprensible. 'Explain why renewable energy is important.'",
            "Justify (justificar): dar razones para apoyar una posición o decisión. 'Justify your choice of topic with two reasons.'",
            "Classify (clasificar): organizar en categorías o grupos. 'Classify the following animals by their diet.'",
            "Predict (predecir): decir qué ocurrirá en el futuro basándose en evidencia. 'Predict what will happen if we continue using fossil fuels.'",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Cuando veas estas palabras en instrucciones de examen, son señales de qué tipo de respuesta se espera. 'Analyze' pide más profundidad que 'describe'. 'Evaluate' pide tu juicio con argumentos. 'Compare' exige que menciones tanto semejanzas como diferencias. Leer con cuidado el verbo de la instrucción es el primer paso para responder correctamente.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tabla de verbos académicos con su significado en español, un ejemplo de instrucción de examen en inglés y el tipo de respuesta esperada para cada uno",
          caption: "Reconocer los verbos académicos en instrucciones te ayuda a responder con precisión.",
        },
      ],
    },
  },

  // ── 8 ── Vocabulario académico B1 ─────────────────────────────────────────
  {
    slug: "in-v-linking-words-discourse-markers",
    titulo: "Linking words y discourse markers: however, although, in addition, as a result",
    categoria: "Vocabulario académico B1",
    conceptos_clave: ["linking words", "conectores", "discourse markers", "cohesión textual", "B1 writing"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Los conectores (linking words) y marcadores discursivos (discourse markers) son las palabras que dan cohesión y coherencia a un texto o discurso oral. Sin ellos, las oraciones parecen desconectadas; con ellos, el texto fluye con lógica y claridad. A nivel B1, se espera que uses una variedad de conectores apropiados al tipo de relación que quieres establecer: contraste, adición, causa, consecuencia, concesión o secuencia.",
        },
        {
          tipo: "subtitulo",
          contenido: "Clasificación de los conectores principales",
        },
        {
          tipo: "lista",
          items: [
            "CONTRASTE (para ideas que se oponen): However (sin embargo), Nevertheless (no obstante), On the other hand (por otro lado), In contrast (en contraste), Although/Even though (aunque). 'Smartphones are useful. However, they can be very distracting.' / 'Although it was raining, we decided to go out.'",
            "ADICION (para agregar información): In addition (además), Furthermore (asimismo), Moreover (es más), Also / As well (también), Not only... but also... 'Social media connects people. In addition, it provides access to information.' / 'She speaks English and also knows some French.'",
            "CAUSA (para indicar la razón): Because (porque), Since (dado que/ya que), As (como/ya que), Due to (debido a), As a result of (como resultado de). 'I studied hard because I wanted to pass. / Since it was late, we decided to leave.'",
            "CONSECUENCIA (para indicar el resultado): Therefore (por lo tanto), As a result (como resultado), Consequently (en consecuencia), So (así que). 'She practiced every day. As a result, her English improved significantly. / It was very cold, so we wore jackets.'",
            "CONCESION (para reconocer un punto contrario): Although (aunque), Even though (aunque), Despite (a pesar de), In spite of (a pesar de). 'Despite the rain, the event was a success.' / 'Even though I was tired, I finished my homework.'",
            "SECUENCIA (para ordenar ideas): First, second, then, next, after that, finally. 'First, read the text carefully. Then, identify the main ideas. Finally, write your summary.'",
          ],
        },
        {
          tipo: "callout",
          variante: "advertencia",
          contenido:
            "Cuidado con el uso de 'but' y 'because' al inicio de oración. En inglés formal, se prefiere 'However' en lugar de 'But' al inicio de oración, y 'Since' o 'As' en lugar de 'Because' en oraciones subordinadas independientes. Sin embargo, en escritura informal o creativa, comenzar con 'But' o 'Because' es aceptable y cada vez más común. Conoce el contexto antes de elegir.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mapa visual de conectores agrupados por función: contraste, adición, causa, consecuencia, concesión y secuencia, con ejemplos cortos en inglés",
          caption: "Usar una variedad de conectores es una señal de competencia lingüística en el nivel B1.",
        },
      ],
    },
  },

  // ── 9 ── Vocabulario académico B1 ─────────────────────────────────────────
  {
    slug: "in-v-vocabulary-opinions-agreement",
    titulo: "Expressing opinions, agreeing and disagreeing in English",
    categoria: "Vocabulario académico B1",
    conceptos_clave: ["expressing opinions", "agreeing", "disagreeing", "debate B1", "frases de opinión"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Expresar opiniones, estar de acuerdo o en desacuerdo son habilidades comunicativas fundamentales en inglés B1. Tanto en contextos académicos (debate, presentación oral, ensayo) como en conversaciones cotidianas, necesitas un repertorio de expresiones que te permitan compartir tu punto de vista de forma clara y respetuosa. El nivel B1 exige ir más allá de 'I think' y mostrar una gama más amplia de recursos lingüísticos.",
        },
        {
          tipo: "subtitulo",
          contenido: "Expresar una opinión",
        },
        {
          tipo: "lista",
          items: [
            "Básico: I think... / I believe... / I feel that... 'I think social media is both useful and dangerous.'",
            "Intermedio: In my opinion, ... / From my point of view, ... / As I see it, ... 'In my opinion, schools should teach more practical skills.'",
            "Más seguro o hedged: I tend to think that... / It seems to me that... / I would say that... 'It seems to me that technology has changed education more than anything else.'",
            "Expresar certeza: I am convinced that... / I strongly believe that... / There is no doubt that... 'I am convinced that learning English opens more opportunities.'",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Estar de acuerdo",
        },
        {
          tipo: "lista",
          items: [
            "Total: I completely agree. / You are absolutely right. / That is exactly what I think.",
            "Parcial: I agree to some extent. / You have a point, but... / That is true in some cases.",
            "Agregar información al acuerdo: I agree, and I would add that... / Exactly, and another thing is that...",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Estar en desacuerdo (de forma respetuosa)",
        },
        {
          tipo: "lista",
          items: [
            "Suave: I am not sure I agree. / I see your point, but I think... / I understand what you mean, however...",
            "Directo pero cortés: I disagree with that. / I do not think that is entirely accurate. / Actually, I would argue that...",
            "Con evidencia: Research shows that... / According to the data, ... / Studies suggest that... followed by your counter-argument.",
          ],
        },
        {
          tipo: "callout",
          variante: "ejemplo",
          contenido:
            "Ejemplo de intercambio de opiniones en debate estudiantil: Estudiante A: 'In my opinion, all students should wear uniforms. It reduces inequality and improves focus.' Estudiante B: 'I see your point, but I would argue that uniforms limit students' self-expression. Furthermore, research suggests that dress codes do not necessarily improve academic performance.' Estudiante A: 'That is true to some extent. However, I still believe the social benefits outweigh the drawbacks.'",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tabla de frases para expresar opinión, acuerdo y desacuerdo en inglés, organizadas por nivel de formalidad y fuerza, con traducción al español",
          caption: "Un repertorio amplio de expresiones te permite participar en debates con seguridad y respeto.",
        },
      ],
    },
  },

  // ── 10 ── Habilidades comunicativas B1 ────────────────────────────────────
  {
    slug: "in-v-skimming-y-scanning",
    titulo: "Skimming y scanning: estrategias para leer en inglés",
    categoria: "Habilidades comunicativas B1",
    conceptos_clave: ["skimming", "scanning", "lectura en inglés", "comprensión lectora", "reading strategies"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El skimming y el scanning son dos estrategias de lectura rápida que usamos constantemente sin darnos cuenta. En inglés B1, dominar estas técnicas es esencial para enfrentar textos académicos, noticias y materiales auténticos sin pánico ni dependencia del diccionario. La clave es que no necesitas entender cada palabra: necesitas extraer la información relevante de manera eficiente.",
        },
        {
          tipo: "subtitulo",
          contenido: "Skimming: leer para obtener la idea general",
        },
        {
          tipo: "parrafo",
          contenido:
            "El skimming consiste en pasar los ojos rápidamente por un texto para obtener una idea general de su contenido sin leer cada palabra. Se usa para decidir si un artículo es relevante, para recordar brevemente el contenido de algo que ya leíste, o para orientarte antes de una lectura más detallada. Técnica: lee el título y el primer párrafo completo, luego solo la primera oración de cada párrafo (topic sentence), y finalmente el último párrafo. En 60-90 segundos puedes captar la esencia de un texto de una página.",
        },
        {
          tipo: "subtitulo",
          contenido: "Scanning: buscar información específica",
        },
        {
          tipo: "parrafo",
          contenido:
            "El scanning consiste en buscar una información específica en un texto (una fecha, un nombre, un número, una palabra clave) sin leer todo el contenido. Es lo que haces cuando buscas tu nombre en una lista o cuando revisas los resultados de un partido. Técnica: decide primero exactamente qué buscas. Mueve los ojos en Z o en columnas verticales sobre el texto. Cuando encuentres la palabra clave o algo relacionado, detente y lee esa parte con cuidado. No sigas leyendo lo que no te interesa.",
        },
        {
          tipo: "lista",
          items: [
            "Skimming: 'What is this article about?' — lees el 20% del texto para obtener el 80% del mensaje general.",
            "Scanning: 'When was this law passed?' — buscas el año o la fecha sin leer el contexto completo.",
            "Skimming primero, luego scanning: ideal para exámenes de comprensión lectora. Primero haz skimming del texto completo, luego haz scanning para responder preguntas específicas.",
            "Predicción de vocabulario: antes de leer, usa el título, las imágenes y los subtítulos para predecir de qué trata el texto. Esto activa tu vocabulario previo y facilita la comprensión.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "En el examen CENEVAL o en pruebas de inglés B1, los textos de comprensión lectora NUNCA requieren que entiendas cada palabra. La mayoría de las preguntas pueden responderse con skimming y scanning eficientes. Practica estas estrategias con artículos cortos de BBC Learning English o Newsela antes del examen.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama que compara el patrón de movimiento ocular durante skimming (horizontal, primera línea de cada párrafo) y scanning (vertical en Z buscando palabra clave)",
          caption: "Skimming y scanning son complementarios: uno da el panorama, el otro localiza el detalle.",
        },
      ],
    },
  },

  // ── 11 ── Habilidades comunicativas B1 ────────────────────────────────────
  {
    slug: "in-v-correo-formal-en-ingles",
    titulo: "Cómo escribir un correo formal en inglés",
    categoria: "Habilidades comunicativas B1",
    conceptos_clave: ["formal email", "correo formal", "escritura B1", "saludo formal", "despedida formal"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Escribir un correo formal en inglés es una competencia esencial para el siglo XXI. Ya sea para contactar a una universidad extranjera, solicitar una beca, comunicarte con un empleador o escribir a una institución, el correo formal en inglés sigue estructuras y convenciones claras que debes dominar en el nivel B1. Un correo bien escrito refleja profesionalismo y competencia lingüística.",
        },
        {
          tipo: "subtitulo",
          contenido: "Estructura de un correo formal",
        },
        {
          tipo: "lista",
          items: [
            "1. Subject line (asunto): breve y descriptivo. 'Request for information about the summer program' / 'Application for scholarship — Cristofer Esquivel'.",
            "2. Saludo formal: Dear + título + apellido + coma o dos puntos (en inglés americano). 'Dear Dr. Ramírez,' / 'Dear Professor Smith,' / 'Dear Ms. Johnson,' Si no conoces el nombre: 'Dear Sir or Madam,' o 'To whom it may concern,'.",
            "3. Párrafo de apertura: indica el propósito del correo. 'I am writing to inquire about...' / 'I am writing with regard to...' / 'I would like to request information about...'",
            "4. Cuerpo del correo: desarrolla tu mensaje en 1-2 párrafos. Sé claro, conciso y organizado. Usa conectores formales (furthermore, in addition, however).",
            "5. Párrafo de cierre: indica qué esperas como respuesta. 'I would appreciate a reply at your earliest convenience.' / 'Please do not hesitate to contact me if you need further information.' / 'I look forward to hearing from you.'",
            "6. Despedida formal: 'Yours sincerely,' (si conoces el nombre del destinatario) / 'Yours faithfully,' (si no conoces el nombre). En inglés americano, 'Sincerely,' o 'Best regards,' son las más comunes.",
            "7. Firma: nombre completo + cargo o contexto. 'Cristofer Esquivel Huerta / Student, Semestre 5, Centro de Bachillerato'.",
          ],
        },
        {
          tipo: "callout",
          variante: "ejemplo",
          contenido:
            "Ejemplo de correo formal completo: Subject: Request for Information — Summer English Course. Dear Ms. Thompson, I am writing to inquire about the summer English language program offered by your institution. I am a fifth-semester student at a Mexican preparatory school and I am very interested in improving my English skills during July. Could you please send me information about the course fees, accommodation options, and application deadlines? I would greatly appreciate any materials you could provide. I look forward to your reply. Yours sincerely, Cristofer Esquivel.",
        },
        {
          tipo: "callout",
          variante: "advertencia",
          contenido:
            "Errores comunes en correos formales en inglés: usar Dear + nombre de pila (Dear John en lugar de Dear Mr. Smith — suena informal), terminar con 'Best' o 'Thanks' (demasiado informal para correos formales), usar contracciones como don't o I'm (escribe do not, I am), escribir párrafos muy largos sin estructura clara, olvidar el subject line o escribirlo vago ('Question', 'Hi').",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Plantilla visual de un correo formal en inglés con cada sección etiquetada: subject line, saludo, apertura, cuerpo, cierre, despedida y firma",
          caption: "Un correo formal bien estructurado comunica profesionalismo antes de que el lector lea el contenido.",
        },
      ],
    },
  },

  // ── 12 ── Habilidades comunicativas B1 ────────────────────────────────────
  {
    slug: "in-v-estructura-presentacion-oral",
    titulo: "Cómo estructurar una presentación oral: introduction, body, conclusion",
    categoria: "Habilidades comunicativas B1",
    conceptos_clave: ["oral presentation", "presentación oral", "introduction", "conclusion", "public speaking B1"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una presentación oral bien estructurada en inglés sigue el mismo principio que en español: dile a tu audiencia qué les vas a decir (introducción), díselos (desarrollo) y diles qué les dijiste (conclusión). Sin embargo, el inglés tiene frases y recursos específicos para cada parte que hacen que tu presentación suene más fluida, segura y profesional. Dominar estas frases es tan importante como conocer el contenido.",
        },
        {
          tipo: "subtitulo",
          contenido: "Introduction: cómo comenzar",
        },
        {
          tipo: "lista",
          items: [
            "Captar la atención: 'Have you ever wondered why...?' / 'Did you know that...?' / 'Imagine a world where...' / 'I would like to start with a question:'",
            "Presentarte y presentar el tema: 'Good morning everyone. My name is... and today I am going to talk about...' / 'Today's presentation is about...'",
            "Indicar la estructura: 'I will begin with..., then I will move on to..., and finally I will...' / 'This presentation has three parts: first..., second..., and third...'",
            "Indicar duración y preguntas: 'My presentation will last about ten minutes.' / 'Please feel free to ask questions at the end.'",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Body: cómo desarrollar y transicionar",
        },
        {
          tipo: "lista",
          items: [
            "Señalar el inicio de un punto: 'Let me start with...' / 'The first point I would like to make is...' / 'First of all,...'",
            "Transitar entre puntos: 'Moving on to my second point...' / 'Now let us turn to...' / 'This brings me to my next point...'",
            "Enfatizar algo importante: 'What I really want to highlight here is...' / 'The most important thing to remember is...' / 'I would like to draw your attention to...'",
            "Dar un ejemplo: 'For example,...' / 'To illustrate this,...' / 'A good example of this is...'",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Conclusion: cómo cerrar",
        },
        {
          tipo: "lista",
          items: [
            "Señalar el cierre: 'In conclusion,...' / 'To summarize,...' / 'Let me end by saying...' / 'To wrap up,...'",
            "Resumir los puntos principales: 'We have seen that... first..., second..., and finally...'",
            "Mensaje final o llamada a la acción: 'I hope this presentation has shown you that...' / 'I encourage you to...' / 'The next time you..., I hope you will think about...'",
            "Agradecer y abrir preguntas: 'Thank you for your attention. I am happy to answer any questions.' / 'That concludes my presentation. Are there any questions?'",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El secreto de una buena presentación oral en inglés no es la perfección gramatical — es la claridad y la confianza. Habla despacio, haz contacto visual, usa las frases de transición para guiar a tu audiencia y no leas directamente de tus notas. La audiencia siempre prefiere a alguien que comunica con naturalidad a alguien que recita un texto memorizado.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Esquema visual de una presentación oral con tres bloques (introduction, body, conclusion) y frases clave en inglés para cada etapa de la presentación",
          caption: "Las frases de transición son el pegamento que conecta las partes de tu presentación.",
        },
      ],
    },
  },

  // ── 13 ── Habilidades comunicativas B1 ────────────────────────────────────
  {
    slug: "in-v-debate-y-argumentacion",
    titulo: "Técnicas de debate y argumentación en inglés",
    categoria: "Habilidades comunicativas B1",
    conceptos_clave: ["debate", "argumentación", "claim", "evidence", "counter-argument"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El debate en inglés sigue una estructura lógica que puedes aprender y aplicar aunque tu nivel no sea avanzado. Lo importante no es la velocidad ni el acento, sino la claridad de tu argumento y tu capacidad de responder a las ideas del otro. En el nivel B1, aprenderás el esquema básico de un argumento efectivo: claim (afirmación), evidence (evidencia) y counter-argument (contra-argumento).",
        },
        {
          tipo: "subtitulo",
          contenido: "Estructura de un argumento: C-E-C",
        },
        {
          tipo: "lista",
          items: [
            "Claim (afirmación): tu posición o punto de vista sobre el tema. 'I believe that all schools should ban the use of mobile phones during class time.'",
            "Evidence (evidencia): datos, ejemplos, estadísticas o experiencias que apoyan tu afirmación. 'Studies show that students who use phones during class perform 20% worse on tests. For example, a recent report from the OECD found that...'",
            "Counter-argument y refutación: reconoces el argumento del otro lado y lo rebates. 'Some people argue that phones can be useful for educational purposes. However, the distraction they cause outweighs the potential benefits, especially for adolescents who are still developing self-control.'",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Frases útiles para el debate",
        },
        {
          tipo: "lista",
          items: [
            "Para presentar tu posición: 'I would like to argue that...' / 'My position is that...' / 'I strongly believe that...'",
            "Para presentar evidencia: 'According to...' / 'Research shows that...' / 'Statistics indicate that...' / 'For example,...' / 'A clear example of this is...'",
            "Para reconocer el argumento contrario: 'I understand your point, but...' / 'While it is true that..., I still think that...' / 'Some people argue that..., however...'",
            "Para rebatir: 'This argument is not convincing because...' / 'The evidence suggests otherwise.' / 'That may be the case, but it does not mean that...'",
            "Para concluir tu turno: 'In conclusion, the evidence clearly shows...' / 'For these reasons, I maintain that...' / 'Therefore, I believe my position is well-supported.'",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "En los debates académicos en inglés, la forma en que criticas las ideas es tan importante como el contenido. Siempre ataca las IDEAS, no a la persona. Nunca digas algo como 'you are wrong' directamente — di 'I respectfully disagree because...' o 'I see this differently...' Este principio se llama attacking the argument, not the person y es fundamental en el pensamiento crítico anglosajón.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama del esquema C-E-C (Claim, Evidence, Counter-argument) con flechas que muestran cómo construir un argumento completo en inglés para un debate",
          caption: "Un argumento sólido siempre incluye afirmación, evidencia y respuesta al punto de vista contrario.",
        },
      ],
    },
  },

  // ── 14 ── Habilidades comunicativas B1 ────────────────────────────────────
  {
    slug: "in-v-turn-taking-backchanneling",
    titulo: "Turn-taking y backchanneling en conversaciones en inglés",
    categoria: "Habilidades comunicativas B1",
    conceptos_clave: ["turn-taking", "backchanneling", "conversación fluida", "interacción oral", "B1 speaking"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una de las habilidades menos enseñadas pero más importantes para sonar natural en inglés es saber cuándo y cómo tomar el turno en una conversación (turn-taking) y cómo mostrar que estás escuchando activamente sin interrumpir (backchanneling). Estas microhabilidades son lo que diferencia una conversación fluida de una serie de monólogos alternados. Son especialmente relevantes en el examen oral del nivel B1.",
        },
        {
          tipo: "subtitulo",
          contenido: "Turn-taking: cómo tomar el turno",
        },
        {
          tipo: "lista",
          items: [
            "Tomar el turno con una señal: 'Actually,...' / 'Well,...' / 'I think...' — estas palabras señalan que vas a hablar.",
            "Pedir el turno amablemente: 'Can I add something?' / 'If I may...' / 'Sorry to interrupt, but...' / 'I would like to make a point here.'",
            "Ceder el turno a alguien: 'What do you think, [nombre]?' / 'I would be interested to hear your view on this.' / 'Would you like to add anything?'",
            "Mantener el turno cuando alguien intenta interrumpir: 'If you could just let me finish...' / 'Just one more point...' / 'Bear with me for a moment...'",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Backchanneling: mostrar que escuchas",
        },
        {
          tipo: "parrafo",
          contenido:
            "El backchanneling son las pequeñas señales verbales y no verbales que le damos a quien habla para indicar que estamos escuchando y entendiendo, sin tomar el turno. En inglés, estas señales son diferentes de las del español y es importante conocerlas para no sonar indiferente o grosero en una conversación.",
        },
        {
          tipo: "lista",
          items: [
            "Señales de atención básicas: 'Mhm.' / 'Right.' / 'I see.' / 'Yes.' / 'Sure.' — indican que sigues la conversación.",
            "Señales de interés o sorpresa: 'Really?' / 'No way!' / 'Oh, wow.' / 'Is that so?' / 'That is interesting.'",
            "Señales de comprensión o acuerdo: 'Exactly.' / 'Of course.' / 'That makes sense.' / 'I know what you mean.'",
            "Señales de empatía: 'I understand.' / 'That must have been difficult.' / 'I can imagine.' / 'That sounds tough.'",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "En inglés, el silencio excesivo mientras alguien habla puede interpretarse como falta de interés o incomodidad. Por eso, el backchanneling es muy activo en conversaciones en inglés, especialmente en inglés americano. Sin embargo, en el inglés más formal (reuniones de trabajo, entrevistas), el backchanneling es más moderado. Observa el contexto para calibrar cuánto usas estas señales.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de flujo de una conversación mostrando turn-taking (quién habla) y backchanneling (señales de escucha activa) con frases en inglés y sus funciones",
          caption: "El turn-taking y el backchanneling hacen que la conversación fluya de forma natural y respetuosa.",
        },
      ],
    },
  },

  // ── 15 ── Cultura angloparlante contemporánea ──────────────────────────────
  {
    slug: "in-v-uk-usa-australia-diferencias",
    titulo: "Diferencias culturales: UK, USA y Australia",
    categoria: "Cultura angloparlante contemporánea",
    conceptos_clave: ["cultura angloparlante", "UK", "USA", "Australia", "diferencias culturales"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El inglés no es una sola cultura: es la lengua de países tan diferentes como el Reino Unido, los Estados Unidos y Australia, cada uno con sus propias costumbres, valores, sistemas educativos, variantes lingüísticas y formas de ver el mundo. Conocer estas diferencias culturales no solo enriquece tu comprensión del inglés, sino que te prepara para interactuar con personas de estas culturas con mayor sensibilidad y efectividad.",
        },
        {
          tipo: "subtitulo",
          contenido: "Diferencias en el idioma",
        },
        {
          tipo: "lista",
          items: [
            "Ortografía: color (USA) vs. colour (UK/Australia). Center (USA) vs. centre (UK). Analyze (USA) vs. analyse (UK/Australia).",
            "Vocabulario cotidiano: apartment (USA) vs. flat (UK). Elevator (USA) vs. lift (UK). Pants (USA: pantalones) vs. pants (UK: ropa interior — cuidado). Truck (USA) vs. lorry (UK). Cookie (USA) vs. biscuit (UK).",
            "Pronunciación: la /r/ al final de sílaba es fuerte en el inglés americano (car, water) y suave o muda en el británico estándar y en algunos acentos australianos.",
            "Expresiones: 'How are you?' (universal) vs. 'How ya going?' (Australia informal) vs. 'You alright?' (UK informal — es un saludo, no una pregunta real sobre tu estado de salud).",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Diferencias culturales generales",
        },
        {
          tipo: "lista",
          items: [
            "Educación: UK tiene el sistema de GCSEs y A-Levels antes de la universidad. USA tiene High School con SAT/ACT. Australia tiene el sistema HSC o ATAR según el estado.",
            "Puntualidad: en la cultura anglosajona en general, llegar tarde a una cita formal o reunión se considera una falta de respeto. Llegar 5-10 minutos tarde a una reunión de trabajo en México puede ser normal; en UK o USA puede causar una impresión negativa.",
            "Comunicación directa: USA tiende a ser más directo y expresivo. UK tiene un estilo más indirecto y usa el humor irónico como forma de comunicarse. Australia combina franqueza con mucho humor y es culturalmente igualitaria.",
            "Multiculturalismo: los tres países son altamente diversos e inmigrantes. Aproximadamente el 15% de la población de UK es no blanca, el 40% de USA es de grupos minoritarios, y Australia es uno de los países con mayor proporción de inmigrantes del mundo.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Australia es el único país que ocupa un continente entero, tiene fauna única en el mundo (canguros, koalas, ornitorrincos) y una de las culturas indígenas más antiguas del planeta, con más de 60,000 años de historia. El inglés australiano también tiene un vocabulario muy propio: arvo (afternoon), barbie (barbecue), brekkie (breakfast), mate (amigo), no worries (sin problema).",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mapa del mundo con UK, USA y Australia destacados, con globos de texto que muestran ejemplos de diferencias de vocabulario entre las tres variedades de inglés",
          caption: "El inglés tiene muchas caras: conocer sus variantes culturales hace de ti un comunicador más completo.",
        },
      ],
    },
  },

  // ── 16 ── Cultura angloparlante contemporánea ──────────────────────────────
  {
    slug: "in-v-ingles-como-lengua-franca",
    titulo: "El inglés como lengua franca global (ELF)",
    categoria: "Cultura angloparlante contemporánea",
    conceptos_clave: ["English as Lingua Franca", "ELF", "inglés global", "comunicación internacional", "diversidad lingüística"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Hoy, el inglés es la lengua franca del mundo: se usa como medio de comunicación entre personas que no comparten ninguna lengua nativa. De los aproximadamente 1,500 millones de personas que hablan inglés en el mundo, menos de 400 millones son hablantes nativos. Esto significa que la mayoría de las conversaciones en inglés ocurren entre no nativos. Esta realidad cambia radicalmente cómo debemos entender el aprendizaje del inglés.",
        },
        {
          tipo: "subtitulo",
          contenido: "Qué significa que el inglés sea una lengua franca",
        },
        {
          tipo: "lista",
          items: [
            "Un investigador mexicano y una científica japonesa colaboran en inglés. Un empresario alemán y una ingeniera india negocian en inglés. Un turista brasileño y un guía tailandés se comunican en inglés. En todos estos casos, el inglés no es la lengua nativa de ninguno.",
            "El inglés como lengua franca no tiene dueño: pertenece a todos los que lo usan. El objetivo no es imitar a un nativo británico o americano, sino comunicarse con claridad y eficacia.",
            "Los errores de pronunciación o gramática son tolerados si no afectan la comprensión. Lo que importa es la inteligibilidad: ¿te entienden? ¿Entiendes a los demás?",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Implicaciones para el aprendizaje",
        },
        {
          tipo: "lista",
          items: [
            "No necesitas un acento 'perfecto': necesitas una pronunciación que sea comprensible para hablantes de diferentes orígenes.",
            "La gramática importa para la claridad, no para la pureza: algunos errores gramaticales no impiden la comunicación (They was very happy), otros sí la dificultan.",
            "El vocabulario de contexto específico es más importante que el vocabulario avanzado general.",
            "La competencia intercultural (entender otras culturas y perspectivas) es tan importante como la competencia lingüística.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El inglés tiene más hablantes no nativos que nativos. Países como India (600 millones de hablantes de inglés), Nigeria (200 millones) y Filipinas tienen más hablantes de inglés que muchos países de habla inglesa nativa. El inglés de estos países tiene sus propias variedades reconocidas: Indian English, Nigerian English, Philippine English. Estas no son inglés 'incorrecto' — son variedades legítimas de la lengua.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mapa mundial mostrando la distribución de hablantes de inglés como lengua nativa, segunda lengua y lengua extranjera, con datos de países clave",
          caption: "El inglés pertenece al mundo: aprenderlo es unirte a la comunidad global más grande de comunicación.",
        },
      ],
    },
  },

  // ── 17 ── Cultura angloparlante contemporánea ──────────────────────────────
  {
    slug: "in-v-cultura-pop-angloparlante",
    titulo: "La cultura pop angloparlante: música, cine y su impacto global",
    categoria: "Cultura angloparlante contemporánea",
    conceptos_clave: ["cultura pop", "música en inglés", "cine angloparlante", "influencia cultural", "soft power"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La cultura pop angloparlante —música, cine, series de televisión, videojuegos, literatura— es una de las fuerzas más influyentes del mundo contemporáneo. No solo entretiene: exporta valores, estilos de vida, perspectivas y vocabulario. Para los estudiantes de inglés, la cultura pop es una herramienta de aprendizaje poderosa y una ventana al mundo anglosajón. Esta ficha explora su alcance e impacto.",
        },
        {
          tipo: "subtitulo",
          contenido: "La música en inglés: aprender con lo que escuchas",
        },
        {
          tipo: "parrafo",
          contenido:
            "La música en inglés es una de las herramientas de aprendizaje más subestimadas. Artistas como Taylor Swift, Beyoncé, Adele, The Beatles, Coldplay, Bad Bunny (con colaboraciones en inglés) o Billie Eilish comunican emociones y experiencias usando lenguaje auténtico. Para aprender inglés con música: primero escucha sin leer la letra y trata de entender el tema general. Luego lee la letra en inglés y busca el vocabulario desconocido. Finalmente, canta o repite en voz alta para practicar pronunciación. Las letras de música introducen expresiones idiomáticas, slang y estructuras del inglés coloquial que rara vez aparecen en libros de texto.",
        },
        {
          tipo: "subtitulo",
          contenido: "El cine y las series: inglés en contexto real",
        },
        {
          tipo: "lista",
          items: [
            "Ver películas y series en inglés con subtítulos en inglés (no en español) es una de las estrategias más efectivas para mejorar la comprensión auditiva.",
            "Los géneros tienen su propio vocabulario: ciencia ficción (spaceship, galaxy, civilization), drama legal (attorney, verdict, lawsuit), comedy (punchline, wit, sarcasm).",
            "Plataformas como Netflix, Disney+ y YouTube tienen contenido con subtítulos ajustables. El canal BBC Learning English en YouTube ofrece contenido diseñado específicamente para aprendices de inglés.",
            "El slang cambia rápidamente: lo que era cool en los 90 puede sonar anticuado hoy. Las series contemporáneas son una mejor fuente de inglés coloquial actual que los libros de texto viejos.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La cultura pop angloparlante también tiene aspectos críticos. Exporta un modelo de vida centrado en el consumo y en ciertos valores culturales específicos. Como consumidores y aprendices de inglés, es importante desarrollar un consumo crítico: disfrutar la cultura pop mientras somos conscientes de sus mensajes, estereotipos y perspectivas. Esto es parte de la competencia intercultural que desarrollas en el nivel B1.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Collage conceptual de elementos de la cultura pop angloparlante: notas musicales, claqueta de cine, pantalla de series, con el mapa del mundo de fondo",
          caption: "La cultura pop angloparlante es a la vez entretenimiento, herramienta de aprendizaje y fenómeno global.",
        },
      ],
    },
  },

  // ── 18 ── Cultura angloparlante contemporánea ──────────────────────────────
  {
    slug: "in-v-mexico-y-mundo-angloparlante",
    titulo: "México y el mundo angloparlante: USMCA/T-MEC y turismo",
    categoria: "Cultura angloparlante contemporánea",
    conceptos_clave: ["USMCA", "T-MEC", "turismo", "México-Estados Unidos", "relaciones bilaterales"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "México tiene una relación única e intensa con el mundo angloparlante, especialmente con los Estados Unidos y Canadá. Esta relación define gran parte de la economía, la cultura y la vida cotidiana de México. Comprender el contexto de esta relación te ayuda a entender por qué el inglés es una competencia tan valiosa en México, y cómo los estudiantes mexicanos como tú se ubican en un panorama geopolítico y económico específico.",
        },
        {
          tipo: "subtitulo",
          contenido: "El USMCA/T-MEC: el acuerdo comercial más grande del mundo",
        },
        {
          tipo: "parrafo",
          contenido:
            "El USMCA (United States-Mexico-Canada Agreement), conocido en México como T-MEC (Tratado entre México, Estados Unidos y Canadá), es el acuerdo de libre comercio que entró en vigor en julio de 2020 y reemplazó al TLCAN/NAFTA. Regula el comercio de bienes y servicios entre tres países con una población combinada de más de 500 millones de personas y un PIB combinado de más de 25 billones de dólares. México exporta principalmente autos, electrónicos, petróleo, frutas y verduras a EE.UU. El inglés es el idioma de negocios de este tratado: los contratos, las negociaciones y los acuerdos se redactan en inglés y español.",
        },
        {
          tipo: "subtitulo",
          contenido: "El turismo angloparlante en México",
        },
        {
          tipo: "lista",
          items: [
            "México recibe más de 30 millones de turistas internacionales al año, la mayoría provenientes de Estados Unidos y Canadá.",
            "Destinos como Cancún, Los Cabos, Puerto Vallarta, Ciudad de México y Oaxaca atraen a millones de turistas angloparlantes cada año.",
            "El inglés es la lingua franca del turismo: recepcionistas de hotel, guías de turistas, vendedores en mercados artesanales y personal de restaurantes que hablan inglés tienen una ventaja laboral significativa.",
            "El nearshoring (instalación de empresas extranjeras, especialmente de EE.UU., en México para producir cerca del mercado americano) está creando miles de empleos que requieren inglés en ciudades como Monterrey, Querétaro, Guanajuato y el Bajío.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El inglés como competencia laboral en México: según datos del IMSS, los empleos que requieren inglés pagan en promedio entre 30% y 50% más que empleos equivalentes sin ese requisito. El nearshoring está acelerando esta tendencia: empresas de semiconductores, automotrices, aeroespaciales y tecnológicas de EE.UU. y Canadá están invirtiendo en México y necesitan personal bilingüe. Tu inglés B1 es una inversión directa en tu futuro laboral.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mapa de Norteamérica mostrando las principales rutas comerciales del T-MEC entre México, Estados Unidos y Canadá, con íconos de exportaciones principales",
          caption: "El inglés es el idioma del T-MEC: una de las razones más concretas para dominarlo en México.",
        },
      ],
    },
  },

  // ── 19 ── Estrategias para aprendices B1 ──────────────────────────────────
  {
    slug: "in-v-inferir-vocabulario-del-contexto",
    titulo: "Cómo usar el contexto para inferir vocabulario desconocido",
    categoria: "Estrategias para aprendices B1",
    conceptos_clave: ["inferencia de vocabulario", "contexto", "vocabulary strategies", "lectura B1", "diccionario"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una de las habilidades más valiosas del nivel B1 es la capacidad de inferir el significado de palabras desconocidas usando el contexto del texto, sin necesitar un diccionario. Esta habilidad, llamada contextual inference o vocabulary in context, es fundamental porque en la comunicación real (lectura, conversación, exámenes) no siempre tendrás acceso a un diccionario, y detenerte a buscar cada palabra desconocida interrumpe el flujo de comprensión.",
        },
        {
          tipo: "subtitulo",
          contenido: "Estrategias de inferencia contextual",
        },
        {
          tipo: "lista",
          items: [
            "1. Usa las palabras alrededor (co-text): La oración completa y las oraciones vecinas dan pistas. 'The patient was given analgesics to help with the pain after the surgery.' No sabes qué es 'analgesics', pero el contexto (dolor, cirugía) indica que son medicamentos para el dolor.",
            "2. Busca cognados y falsos cognados: Muchas palabras en inglés tienen raíces latinas o griegas comunes con el español. 'democracy' (democracia), 'biology' (biología), 'photograph' (fotografía). Cuidado con los falsos cognados: 'embarrassed' no significa 'embarazada' — significa avergonzado/a.",
            "3. Identifica la función gramatical: Saber si una palabra desconocida es sustantivo, verbo, adjetivo o adverbio reduce enormemente las posibilidades de significado. 'The scientist made an astounding discovery.' Astounding es adjetivo que modifica a discovery — debe tener valor positivo (asombroso).",
            "4. Usa pistas de estructura de la palabra (prefijos y sufijos): un- = negativo (unhappy, unfair). re- = de nuevo (rewrite, rebuild). -less = sin (homeless, careless). -ful = con (careful, hopeful). -tion = sustantivo de acción (education, organization).",
            "5. Acepta la ambigüedad y sigue leyendo: A veces no necesitas entender cada palabra para comprender el texto. Si entiendes el 90%, sigue leyendo. El significado global de la oración o el párrafo puede aclararse más adelante.",
          ],
        },
        {
          tipo: "callout",
          variante: "ejemplo",
          contenido:
            "Ejemplo de inferencia contextual: 'Despite the inclement weather, the athletes completed the marathon and were welcomed by thousands of jubilant spectators.' Si no conoces 'inclement' o 'jubilant': inclement describe el weather (clima) — en contexto de un maratón difícil, es clima malo, adverso. jubilant describe a los espectadores que dieron la bienvenida a los atletas — es un adjetivo positivo (alegres, jubilosos). No necesitaste el diccionario.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La inferencia contextual NO reemplaza al diccionario para aprender vocabulario nuevo que necesitarás usar activamente. Es una estrategia de LECTURA Y COMPRENSIÓN, no de adquisición de vocabulario productivo. Para ampliar tu vocabulario de forma efectiva, usa flashcards, listas temáticas y el método de repetición espaciada (apps como Anki o Quizlet son excelentes herramientas gratuitas).",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama que muestra una oración con una palabra desconocida destacada y flechas señalando las pistas contextuales (palabras alrededor, estructura gramatical, morfología) que ayudan a inferir su significado",
          caption: "El contexto es tu primer diccionario: aprende a leer las pistas que el texto te ofrece.",
        },
      ],
    },
  },

  // ── 20 ── Estrategias para aprendices B1 ──────────────────────────────────
  {
    slug: "in-v-estrategias-escritura-borrador",
    titulo: "Estrategias de escritura: borrador, revisión y edición",
    categoria: "Estrategias para aprendices B1",
    conceptos_clave: ["proceso de escritura", "borrador", "writing process", "revisión", "editing"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Muchos estudiantes creen que escribir bien en inglés significa producir un texto perfecto al primer intento. En realidad, los buenos escritores —en cualquier idioma— siguen un proceso de múltiples etapas: planificación, borrador (draft), revisión (revision) y edición (editing). Entender y aplicar este proceso te ayudará a producir textos más claros, cohesivos y correctos en inglés B1.",
        },
        {
          tipo: "subtitulo",
          contenido: "Las cuatro etapas del proceso de escritura",
        },
        {
          tipo: "lista",
          items: [
            "1. Planificación (pre-writing): antes de escribir, piensa. ¿Cuál es el propósito? ¿Quién es la audiencia? ¿Cuáles son las ideas principales? Usa técnicas como el mapa mental (mind map), la lluvia de ideas (brainstorming), o el esquema (outline) para organizar tus ideas antes de empezar a escribir.",
            "2. Borrador (first draft): escribe sin preocuparte por los errores. El objetivo del borrador es capturar tus ideas en papel. No te detengas a corregir gramática o vocabulario — eso viene después. Si no sabes una palabra en inglés, escríbela en español y sigue. Lo importante es que el contenido exista.",
            "3. Revisión (revision): en esta etapa, revisas el CONTENIDO y la ESTRUCTURA. ¿Está clara la idea principal? ¿Hay lógica en la secuencia? ¿Los párrafos tienen topic sentence y oraciones de apoyo? ¿Usas conectores? Puedes reordenar, agregar o eliminar secciones enteras en esta etapa.",
            "4. Edición (editing): en la última etapa, revisas la FORMA: gramática, ortografía, puntuación, vocabulario. Lee en voz alta para detectar errores que la vista pasa por alto. Usa el diccionario para verificar palabras de las que no estás seguro/a.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La diferencia entre revision y editing es crucial: revision es sobre el contenido y la organización (¿qué dices y cómo lo organizas?); editing es sobre la corrección lingüística (¿lo dices correctamente?). Mezclar ambas etapas es el error más común: si te corriges la gramática antes de tener claro el contenido, el texto puede estar bien escrito pero vacío de ideas.",
        },
        {
          tipo: "lista",
          items: [
            "Checklist de revisión (contenido): Does the text have a clear main idea? Does each paragraph support the main idea? Are the ideas presented in a logical order? Are there enough examples or evidence?",
            "Checklist de edición (forma): Are all verbs in the correct tense? Is subject-verb agreement correct? Are spelling and punctuation correct? Are the linking words used correctly?",
          ],
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Ciclo de cuatro etapas del proceso de escritura: planificación, borrador, revisión y edición, con flechas circulares que muestran que el proceso es iterativo, no lineal",
          caption: "Escribir bien es un proceso iterativo: los mejores textos pasan por varias versiones antes de la versión final.",
        },
      ],
    },
  },

  // ── 21 ── Estrategias para aprendices B1 ──────────────────────────────────
  {
    slug: "in-v-preparar-presentacion-breve",
    titulo: "Cómo preparar y dar una presentación breve en inglés",
    categoria: "Estrategias para aprendices B1",
    conceptos_clave: ["presentación oral", "preparación", "speaking B1", "nervios", "práctica"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Dar una presentación en inglés es una de las tareas más desafiantes para los estudiantes de nivel B1, no solo por el idioma, sino también por el nerviosismo de hablar en público. La buena noticia es que prepararse de forma sistemática reduce enormemente el estrés y mejora el resultado. Esta ficha te da un plan paso a paso para preparar y dar una presentación breve (3-5 minutos) en inglés con confianza.",
        },
        {
          tipo: "subtitulo",
          contenido: "Paso 1: Planifica antes de escribir",
        },
        {
          tipo: "lista",
          items: [
            "Define tu tema y tu audiencia: ¿De qué hablarás? ¿Quién te escuchará? ¿Qué nivel de conocimiento tienen sobre el tema?",
            "Determina tu objetivo: ¿Quieres informar, persuadir, entretener o describir? Tu objetivo determina el tono y la estructura.",
            "Selecciona 2-3 puntos principales: en 3-5 minutos no puedes cubrir todo un tema. Elige los puntos más importantes y desarrolla cada uno brevemente.",
            "Haz un esquema (outline): introduction — main point 1 — main point 2 — (main point 3) — conclusion. Escribe solo palabras clave en el esquema, no el texto completo.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Paso 2: Prepara tus materiales",
        },
        {
          tipo: "lista",
          items: [
            "Tarjetas de notas (cue cards): escribe solo palabras clave, no oraciones completas. Las tarjetas te guían sin convertirte en un lector de texto.",
            "Diapositivas (si usas PowerPoint o similar): máximo 5-6 diapositivas para 5 minutos. Cada diapositiva debe tener pocas palabras y una imagen o dato clave.",
            "Aprende las frases de transición de memoria: 'Moving on to my next point...' / 'As I mentioned...' / 'In conclusion,...' Estas frases te dan tiempo para pensar y guían a tu audiencia.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Paso 3: Practica en voz alta",
        },
        {
          tipo: "lista",
          items: [
            "Practica en voz alta, no solo en tu cabeza. Grábate con el teléfono y escucha la grabación: notarás aspectos que no percibías al practicar mentalmente.",
            "Practica en voz alta al menos 3-4 veces completas. Cada repetición te hace sentir más seguro/a.",
            "Practica con un compañero o frente a un espejo para trabajar el contacto visual y la postura.",
            "Mide el tiempo: si tu presentación dura menos de 2 minutos al practicar, necesitas desarrollar más el contenido. Si dura más de 6, necesitas recortar.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El día de la presentación: llega al aula un poco antes para familiarizarte con el espacio. Respira profundo antes de comenzar. Habla despacio — los nervios nos hacen hablar más rápido de lo necesario. Si olvidas algo, no digas 'I forgot' — di 'Let me move on to...' y continúa. Tu audiencia no sabe lo que planeabas decir, solo lo que dices. Un error gestionado con calma pasa desapercibido.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La ansiedad al hablar en público (speaking anxiety) es uno de los temores más comunes en el mundo — no solo en inglés. En inglés, se llama glossophobia y afecta aproximadamente al 75% de las personas en algún grado. La práctica repetida es el único remedio efectivo: cada vez que hablas en público, aunque sea brevemente, reduces tu nivel de ansiedad para la próxima ocasión.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Línea de tiempo de preparación para una presentación oral con las tres etapas: planificación (varios días antes), preparación de materiales (1-2 días antes) y práctica en voz alta (el día anterior y el mismo día)",
          caption: "La preparación sistemática convierte la ansiedad en confianza: cada práctica cuenta.",
        },
      ],
    },
  },
] as const;

// ---------------------------------------------------------------------------
// SEED FUNCTION
// ---------------------------------------------------------------------------

export async function seedBibliotecaINV(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed Biblioteca IN-V (21 fichas)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", "IN-V")
    .single();

  if (uacErr || !uacRow) {
    throw new Error(
      `UAC IN-V no encontrada. Ejecuta primero seed-mccems.ts y seed-inv.ts. Error: ${uacErr?.message}`
    );
  }

  const rows = FICHAS_INV.map((f, i) => ({
    uac_id: uacRow.id,
    slug: f.slug,
    titulo: f.titulo,
    categoria: f.categoria,
    conceptos_clave: f.conceptos_clave as unknown as string[],
    tiempo_lectura_minutos: f.tiempo_lectura_minutos,
    es_placeholder: f.es_placeholder,
    contenido: f.contenido,
    orden: i + 1,
  }));

  const { error } = await sb
    .from("fichas_biblioteca")
    .upsert(rows, { onConflict: "slug" });

  if (error) throw new Error(`Error seeding fichas IN-V: ${error.message}`);

  console.log(`  ✓ ${rows.length} fichas de biblioteca de IN-V insertadas/actualizadas.`);
  console.log("\n✅ Seed Biblioteca IN-V completado.\n");
}

// ---------------------------------------------------------------------------
// STANDALONE RUNNER
// ---------------------------------------------------------------------------

if (
  process.env.NODE_ENV !== "test" &&
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  config({ path: resolve(process.cwd(), ".env.local") });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "❌ Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY"
    );
    process.exit(1);
  }
  const sb = createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  seedBibliotecaINV(sb).catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
}

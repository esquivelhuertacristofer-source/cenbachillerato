/**
 * Seed de fichas de biblioteca para IN-III (Inglés III).
 * 21 fichas temáticas alineadas al MCCEMS 2025, Semestre 3, nivel CEFR A2.
 *
 * Uso: npx tsx scripts/seed-fichas-iniii.ts
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

const FICHAS_INIII = [
  // ── 1 ── Gramática avanzada ────────────────────────────────────────────────
  {
    slug: "in-iii-past-simple-verbos-regulares",
    titulo: "Past Simple: regular verbs and -ed endings",
    categoria: "Gramática avanzada",
    conceptos_clave: ["past simple", "verbos regulares", "terminación -ed", "pronunciación"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El Past Simple (pasado simple) es el tiempo verbal que usamos en inglés para hablar de acciones que ocurrieron y terminaron en el pasado. Para los verbos regulares, la regla general es agregar la terminación -ed al infinitivo del verbo. Aunque parece sencillo, existen variaciones ortográficas importantes que debes conocer para escribir y pronunciar correctamente. En este semestre dominarás los verbos regulares como base para después aprender los irregulares.",
        },
        {
          tipo: "subtitulo",
          contenido: "Reglas para agregar -ed",
        },
        {
          tipo: "lista",
          items: [
            "Regla general: verbo + -ed. Ejemplos: walk → walked (caminé), talk → talked (hablé), watch → watched (vi).",
            "Verbos que terminan en -e: solo se agrega -d. Ejemplos: like → liked (me gustó), live → lived (viví), dance → danced (bailé).",
            "Verbos que terminan en consonante + -y: la -y cambia a -i antes de agregar -ed. Ejemplos: study → studied (estudié), try → tried (intenté), carry → carried (cargué). Nota: si termina en vocal + -y, solo se agrega -ed: play → played.",
            "Verbos cortos CVC (consonante-vocal-consonante): se duplica la consonante final. Ejemplos: stop → stopped (paré), plan → planned (planeé), drop → dropped (dejé caer). Excepción: no se duplica si la última consonante es w, x o y.",
            "Verbos de dos sílabas con acento en la última: también duplican la consonante final. Ejemplos: prefer → preferred, occur → occurred.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Pronunciación de -ed: tres formas",
        },
        {
          tipo: "parrafo",
          contenido:
            "La terminación -ed no siempre se pronuncia igual. Hay tres pronunciaciones distintas según el sonido final del verbo: /t/ después de sonidos sordos como /k/, /p/, /s/, /f/, /ʃ/ (por ejemplo: walked se pronuncia /wɔːkt/, liked se pronuncia /laɪkt/). Se pronuncia /d/ después de sonidos sonoros y vocales (por ejemplo: lived se pronuncia /lɪvd/, played se pronuncia /pleɪd/). Se pronuncia /ɪd/ después de los sonidos /t/ y /d/ (por ejemplo: visited se pronuncia /ˈvɪzɪtɪd/, wanted se pronuncia /ˈwɒntɪd/). Practicar esta distinción mejora mucho la comprensión oral.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "¿Sabías que en México muchos estudiantes pronuncian todos los verbos con -ed como /ɛd/? Decir 'walkED' con la -ed muy marcada suena extraño para los hablantes nativos. La pronunciación correcta de /t/ o /d/ hace que tu inglés suene mucho más natural. Practica en voz alta: 'I walked to school, I played soccer, I visited Guadalajara.'",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tabla con las tres pronunciaciones de -ed: /t/, /d/ e /ɪd/, con ejemplos de verbos en cada columna",
          caption: "La pronunciación de -ed depende del sonido final del verbo base.",
        },
      ],
    },
  },

  // ── 2 ── Gramática avanzada ────────────────────────────────────────────────
  {
    slug: "in-iii-past-simple-verbos-irregulares",
    titulo: "Past Simple: the most common irregular verbs",
    categoria: "Gramática avanzada",
    conceptos_clave: ["past simple", "verbos irregulares", "memorización", "patrones"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Los verbos irregulares son aquellos que NO forman el Past Simple con la terminación -ed, sino que cambian de forma propia. No existe una sola regla para todos: cada uno debe aprenderse. Sin embargo, hay patrones que ayudan a memorizarlos en grupos. Los 20 verbos irregulares más frecuentes en inglés aparecen en casi cualquier conversación o texto, por eso es esencial dominarlos. La buena noticia: en oraciones negativas e interrogativas, los verbos irregulares vuelven a su forma base.",
        },
        {
          tipo: "subtitulo",
          contenido: "Los 20 verbos irregulares más comunes",
        },
        {
          tipo: "lista",
          items: [
            "be → was/were (ser/estar): I was tired. We were at school. / Estaba cansado. Estábamos en la escuela.",
            "have → had (tener): She had a problem. / Ella tuvo un problema.",
            "do → did (hacer): He did his homework. / Él hizo su tarea.",
            "go → went (ir): We went to Oaxaca. / Fuimos a Oaxaca.",
            "see → saw (ver): I saw a great movie. / Vi una buena película.",
            "say → said (decir): She said goodbye. / Ella dijo adiós.",
            "get → got (obtener/llegar): They got home late. / Llegaron a casa tarde.",
            "come → came (venir): He came to class. / Él vino a clase.",
            "know → knew (saber/conocer): I knew the answer. / Yo sabía la respuesta.",
            "think → thought (pensar): We thought it was difficult. / Pensamos que era difícil.",
            "take → took (tomar): She took the bus. / Ella tomó el autobús.",
            "make → made (hacer/preparar): I made tacos. / Yo hice tacos.",
            "give → gave (dar): He gave me a book. / Él me dio un libro.",
            "find → found (encontrar): They found the keys. / Encontraron las llaves.",
            "tell → told (decir/contar): She told a story. / Ella contó una historia.",
            "leave → left (salir/dejar): I left at 7 am. / Salí a las 7 am.",
            "put → put (poner — igual en pasado): She put it on the table. / Ella lo puso en la mesa.",
            "feel → felt (sentir): I felt nervous. / Me sentí nervioso.",
            "buy → bought (comprar): We bought food at the market. / Compramos comida en el mercado.",
            "eat → ate (comer): He ate tamales. / Él comió tamales.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Truco para memorizarlos: agrúpalos por patrones de cambio. Grupo i → a → u: sing/sang/sung, swim/swam/swum, drink/drank/drunk. Grupo que no cambia: put/put/put, cut/cut/cut, let/let/let. Grupo con -ought/-aught: buy/bought, think/thought, teach/taught, catch/caught. Estudiar los grupos es mucho más eficiente que memorizar cada verbo por separado.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tabla de tres columnas con verbos irregulares agrupados por patrones de cambio: base, past simple y past participle",
          caption: "Los verbos irregulares tienen patrones que ayudan a memorizarlos en grupos.",
        },
      ],
    },
  },

  // ── 3 ── Gramática avanzada ────────────────────────────────────────────────
  {
    slug: "in-iii-past-simple-negativo-interrogativo",
    titulo: "Past Simple: negatives and questions with did",
    categoria: "Gramática avanzada",
    conceptos_clave: ["past simple", "did not", "didn't", "Wh-questions", "preguntas en pasado"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una vez que conoces las formas afirmativas del Past Simple (walked, went, ate...), necesitas aprender cómo hacer oraciones negativas y preguntas. La clave es el auxiliar did: este auxiliar toma la marca de pasado, y el verbo principal vuelve a su forma base (infinitivo). Esto es válido tanto para verbos regulares como para irregulares. Dominar esta estructura te permite hablar sobre lo que no sucedió y hacer preguntas sobre el pasado.",
        },
        {
          tipo: "subtitulo",
          contenido: "Estructura de las oraciones negativas",
        },
        {
          tipo: "parrafo",
          contenido:
            "Estructura: sujeto + did not (didn't) + verbo base. Ejemplos: I didn't go to school yesterday. (No fui a la escuela ayer.) / She didn't eat breakfast. (Ella no desayunó.) / We didn't understand the lesson. (No entendimos la lección.) / They didn't buy anything at the market. (No compraron nada en el mercado.) Nota importante: el verbo principal NUNCA lleva -ed ni forma irregular cuando va con did/didn't: INCORRECTO: She didn't went. CORRECTO: She didn't go.",
        },
        {
          tipo: "subtitulo",
          contenido: "Estructura de las preguntas",
        },
        {
          tipo: "lista",
          items: [
            "Preguntas de sí/no (Yes/No questions): Did + sujeto + verbo base + ...? — Did you eat lunch? (¿Comiste el almuerzo?) — Did she go to Puebla? (¿Ella fue a Puebla?) — Did they understand? (¿Entendieron?)",
            "Respuestas cortas: Yes, I did. / No, I didn't. (nunca: Yes, I went. — eso es incorrecto)",
            "Preguntas Wh- (información específica): Wh-word + did + sujeto + verbo base? — Where did you go? (¿A dónde fuiste?) — What did she say? (¿Qué dijo ella?) — When did they arrive? (¿Cuándo llegaron?) — Why did he leave? (¿Por qué se fue?)",
            "Preguntas con who como sujeto: cuando who pregunta por el sujeto, NO se usa did. — Who went to the market? (¿Quién fue al mercado?) — Who called you? (¿Quién te llamó?)",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El error más común entre estudiantes mexicanos es usar el verbo en pasado después de did/didn't: 'Did you went?' o 'She didn't ate'. Esto es incorrecto. Recuerda: did ya tiene el pasado; el verbo principal va en su forma base. Practica con estas oraciones: Did you study English last night? I didn't watch TV yesterday. What did you do on Sunday?",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Esquema comparativo de estructura afirmativa, negativa e interrogativa en Past Simple con código de colores para sujeto, auxiliar y verbo",
          caption: "El auxiliar 'did' es la clave para formar negaciones y preguntas en Past Simple.",
        },
      ],
    },
  },

  // ── 4 ── Gramática avanzada ────────────────────────────────────────────────
  {
    slug: "in-iii-present-perfect-intro",
    titulo: "Present Perfect: have you ever...?",
    categoria: "Gramática avanzada",
    conceptos_clave: ["present perfect", "have/has", "past participle", "ever/never", "experiencias"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El Present Perfect es uno de los tiempos verbales más importantes del inglés y también uno de los que más confusión genera. En español no existe un tiempo exactamente equivalente: se podría traducir como el pretérito perfecto compuesto ('he comido', 'has viajado') aunque con diferencias importantes de uso. El Present Perfect se forma con have o has + el participio pasado del verbo. Se usa, entre otras cosas, para hablar de experiencias de vida: cosas que has hecho o que nunca has hecho hasta ahora.",
        },
        {
          tipo: "subtitulo",
          contenido: "Formación del Present Perfect",
        },
        {
          tipo: "lista",
          items: [
            "Afirmativa: sujeto + have/has + participio pasado. I have visited Mexico City. (He visitado la Ciudad de México.) / She has eaten sushi. (Ella ha comido sushi.) / They have studied English for three years. (Han estudiado inglés por tres años.)",
            "Negativa: sujeto + have not (haven't) / has not (hasn't) + participio pasado. I haven't been to the beach this year. / He hasn't finished his homework.",
            "Interrogativa: Have/Has + sujeto + participio pasado? Have you ever tried mole negro? (¿Alguna vez has probado el mole negro?) / Has she visited Teotihuacan? (¿Ella ha visitado Teotihuacán?)",
            "Participios regulares: son iguales a las formas -ed del Past Simple. walk → walked, study → studied.",
            "Participios irregulares: son la tercera columna de los verbos irregulares. go → gone, see → seen, eat → eaten, be → been, have → had, do → done.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Adverbios frecuentes con Present Perfect",
        },
        {
          tipo: "parrafo",
          contenido:
            "Ever (alguna vez) se usa en preguntas: Have you ever eaten a chapulín? (¿Alguna vez has comido un chapulín?) Never (nunca) se usa en respuestas negativas: I have never eaten insects. (Nunca he comido insectos.) Already (ya) indica que algo sucedió antes de lo esperado: I have already done my homework. (Ya hice mi tarea.) Yet (todavía/aún) se usa en negativas e interrogativas: Have you finished yet? / I haven't finished yet. Just (acabar de) indica que algo ocurrió muy recientemente: She has just arrived. (Ella acaba de llegar.)",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "¿Sabías que la pregunta 'Have you ever...?' es una de las más usadas en conversaciones en inglés para conocer a alguien? Practica respondiendo sobre tus propias experiencias: Have you ever tried food from another country? Have you ever spoken English with a native speaker? Have you ever been to a concert? Usar el Present Perfect para hablar de tus experiencias es clave para el nivel A2.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de formación del Present Perfect con have/has, participio pasado y ejemplos de adverbios ever, never, already, yet y just",
          caption: "El Present Perfect conecta experiencias del pasado con el momento presente.",
        },
      ],
    },
  },

  // ── 5 ── Gramática avanzada ────────────────────────────────────────────────
  {
    slug: "in-iii-past-vs-present-perfect",
    titulo: "Past Simple vs Present Perfect: when to use each",
    categoria: "Gramática avanzada",
    conceptos_clave: ["past simple vs present perfect", "marcadores de tiempo", "finished past", "connected to now"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una de las confusiones más frecuentes en el aprendizaje del inglés es saber cuándo usar el Past Simple y cuándo usar el Present Perfect. Ambos hablan del pasado, pero desde perspectivas diferentes. La distinción fundamental es esta: el Past Simple habla de acciones en un momento específico y terminado del pasado; el Present Perfect conecta el pasado con el presente, hablando de experiencias o situaciones que tienen relevancia ahora.",
        },
        {
          tipo: "subtitulo",
          contenido: "La diferencia clave: ¿cuándo terminó?",
        },
        {
          tipo: "parrafo",
          contenido:
            "Past Simple: acción terminada en un momento específico del pasado. El momento es conocido o se menciona explícitamente. Ejemplos: I visited Chichén Itzá last summer. (Visité Chichén Itzá el verano pasado — momento específico: last summer.) / She ate tamales on Christmas Day. (Ella comió tamales el día de Navidad — momento específico: on Christmas Day.) Present Perfect: experiencia o situación que conecta pasado con presente. No se menciona cuándo exactamente. Ejemplos: I have visited Chichén Itzá. (He visitado Chichén Itzá — experiencia de vida, sin especificar cuándo.) / She has eaten tamales. (Ella ha comido tamales — experiencia, no momento específico.)",
        },
        {
          tipo: "subtitulo",
          contenido: "Marcadores de tiempo que te dan pistas",
        },
        {
          tipo: "lista",
          items: [
            "Marcadores de Past Simple (momento específico terminado): yesterday (ayer), last week/month/year (la semana/mes/año pasado), in 2023 (en 2023), ago (hace: two days ago), when I was young (cuando era joven), at 3 pm (a las 3 pm).",
            "Marcadores de Present Perfect (relación con el presente): ever (alguna vez), never (nunca), already (ya), yet (todavía/aún), just (acabar de), recently (recientemente), so far (hasta ahora), this week/month/year (esta semana/mes/año — si aún no ha terminado).",
            "Regla práctica: si la pregunta '¿cuándo?' tiene una respuesta específica → Past Simple. Si no importa cuándo, solo si ocurrió → Present Perfect.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "En inglés británico, se prefiere el Present Perfect en situaciones donde el inglés americano usa el Past Simple. Por ejemplo: British: 'I've just eaten.' / American: 'I just ate.' En los exámenes y en el MCCEMS se sigue el uso estándar internacional. Lo más importante es evitar el error más común: usar Past Simple sin marcador de tiempo cuando se habla de experiencias generales. INCORRECTO: Did you ever try tacos de canasta? CORRECTO: Have you ever tried tacos de canasta?",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Línea de tiempo que muestra Past Simple (flecha que termina en el pasado) y Present Perfect (flecha que va del pasado hasta el presente) con ejemplos",
          caption: "Past Simple: el pasado está cerrado. Present Perfect: el pasado todavía importa ahora.",
        },
      ],
    },
  },

  // ── 6 ── Gramática avanzada ────────────────────────────────────────────────
  {
    slug: "in-iii-modales-must-have-to",
    titulo: "Modal verbs: must, have to, mustn't, don't have to",
    categoria: "Gramática avanzada",
    conceptos_clave: ["verbos modales", "must", "have to", "mustn't", "don't have to", "obligación"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Los verbos modales must y have to expresan obligación y necesidad en inglés. En español se traducen generalmente como 'deber' o 'tener que'. Aunque en muchos contextos son intercambiables, hay una diferencia sutil importante: must expresa una obligación que viene del hablante (opinión personal, regla interna), mientras que have to expresa una obligación que viene de una autoridad externa (ley, regla de la escuela, petición de otra persona). Sus formas negativas, mustn't y don't have to, tienen significados completamente distintos.",
        },
        {
          tipo: "subtitulo",
          contenido: "Obligación: must y have to",
        },
        {
          tipo: "lista",
          items: [
            "must + verbo base (obligación interna/personal): You must study for the exam. (Debes estudiar para el examen — yo te lo digo, es importante.) / I must call my mom. (Debo llamar a mi mamá — yo lo decido.)",
            "have to / has to + verbo base (obligación externa): Students have to wear a uniform at school. (Los estudiantes tienen que usar uniforme en la escuela — es una regla.) / She has to work on Saturdays. (Ella tiene que trabajar los sábados — su jefe lo requiere.)",
            "En pasado, solo have to tiene forma pasada: had to. Ejemplo: I had to wake up at 5 am yesterday. (Tuve que levantarme a las 5 am ayer.) Must no tiene forma de pasado.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "La diferencia crucial: mustn't vs don't have to",
        },
        {
          tipo: "parrafo",
          contenido:
            "Esta distinción es fundamental y confunde mucho a los estudiantes. Mustn't (must not) = prohibición, está prohibido hacer algo. Don't/doesn't have to = no hay obligación, es opcional. Ejemplos con contexto escolar mexicano: You mustn't use your phone during the exam. (No debes usar tu celular durante el examen — está prohibido.) / You don't have to wear a tie. (No tienes que usar corbata — no es obligatorio, es tu elección.) / Students mustn't copy in tests. (Los estudiantes no deben copiar en los exámenes.) / You don't have to bring your own pencils. (No tienes que traer tus propios lápices — nosotros los tenemos.)",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Errores frecuentes: No digas 'You don't must' — no existe esa forma. El negativo de must es mustn't o must not. No confundas 'You mustn't do it' (está prohibido) con 'You don't have to do it' (es opcional). Son significados opuestos. En inglés formal y en carteles de reglas públicas (biblioteca, museo, clínica), mustn't es muy común: Visitors mustn't touch the exhibits.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tabla de dos columnas con must/have to para obligación y mustn't/don't have to para prohibición y falta de obligación, con ejemplos en contexto escolar",
          caption: "Must, have to, mustn't y don't have to expresan distintos grados de obligación.",
        },
      ],
    },
  },

  // ── 7 ── Gramática avanzada ────────────────────────────────────────────────
  {
    slug: "in-iii-comparativos-superlativos",
    titulo: "Comparatives and superlatives: making comparisons",
    categoria: "Gramática avanzada",
    conceptos_clave: ["comparativos", "superlativos", "adjetivos cortos", "adjetivos largos", "irregular"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Los comparativos y superlativos nos permiten comparar personas, lugares y cosas. En español decimos 'más alto que', 'el más alto', 'mejor', 'el mejor'. En inglés las formas varían según la longitud del adjetivo: los adjetivos cortos (de una o dos sílabas) usan terminaciones (-er, -est), mientras que los adjetivos largos (de dos o más sílabas) usan more y most. Además, algunos adjetivos tienen formas irregulares que no siguen ninguna regla y debes memorizar.",
        },
        {
          tipo: "subtitulo",
          contenido: "Reglas para adjetivos cortos (-er / -est)",
        },
        {
          tipo: "lista",
          items: [
            "Comparativo: adjetivo + -er + than. Superlativo: the + adjetivo + -est. Ejemplos: tall → taller than / the tallest. (alto → más alto que / el más alto) / fast → faster than / the fastest. (rápido → más rápido que / el más rápido) / old → older than / the oldest.",
            "Adjetivos que terminan en -e: solo se agrega -r / -st. nice → nicer / the nicest. large → larger / the largest.",
            "Adjetivos que terminan en consonante + vocal + consonante: se duplica la consonante. big → bigger / the biggest. hot → hotter / the hottest. thin → thinner / the thinnest.",
            "Adjetivos de dos sílabas terminados en -y: la -y cambia a -i. happy → happier / the happiest. easy → easier / the easiest. busy → busier / the busiest.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Adjetivos largos (more / most) e irregulares",
        },
        {
          tipo: "parrafo",
          contenido:
            "Para adjetivos de dos o más sílabas (que no terminan en -y): Comparativo: more + adjetivo + than. Superlativo: the most + adjetivo. Ejemplos: beautiful → more beautiful than / the most beautiful. (hermoso → más hermoso que / el más hermoso) / interesting → more interesting than / the most interesting. / expensive → more expensive than / the most expensive. Irregulares que debes memorizar: good → better than / the best (bueno/mejor/el mejor). bad → worse than / the worst (malo/peor/el peor). far → farther/further than / the farthest/furthest (lejos). Ejemplos con geografía mexicana: The Pico de Orizaba is higher than the Popocatépetl. (El Pico de Orizaba es más alto que el Popocatépetl.) / Mexico City is the most populated city in Mexico. (La Ciudad de México es la ciudad más poblada de México.)",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Práctica con contexto mexicano: The Pacific Ocean is deeper than the Gulf of Mexico. (El Océano Pacífico es más profundo que el Golfo de México.) / Oaxaca has more indigenous languages than any other Mexican state. (Oaxaca tiene más lenguas indígenas que cualquier otro estado mexicano.) / The Yucatán Peninsula is hotter than the north of Mexico in winter. (La Península de Yucatán es más calurosa que el norte de México en invierno.)",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tabla comparativa de adjetivos cortos con -er/-est y adjetivos largos con more/most, más los tres irregulares: good/better/best, bad/worse/worst, far/farther/farthest",
          caption: "Los comparativos y superlativos cambian de forma según la longitud del adjetivo.",
        },
      ],
    },
  },

  // ── 8 ── Habilidades comunicativas ────────────────────────────────────────
  {
    slug: "in-iii-contar-experiencias-personales",
    titulo: "Sharing personal experiences: storytelling in A2",
    categoria: "Habilidades comunicativas",
    conceptos_clave: ["experiencias personales", "narración oral", "anécdota", "storytelling A2"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una de las habilidades comunicativas más importantes en inglés A2 es poder contar una experiencia personal: algo que te pasó, un recuerdo, un viaje, un momento difícil o emocionante. Compartir experiencias es la base de la conversación en cualquier idioma. A nivel A2, puedes hacer esto de manera sencilla pero efectiva si sigues una estructura clara y usas frases de apoyo. No necesitas un vocabulario sofisticado: lo que necesitas es organización y claridad.",
        },
        {
          tipo: "subtitulo",
          contenido: "Estructura de una anécdota personal",
        },
        {
          tipo: "lista",
          items: [
            "1. SETTING — Contexto (¿cuándo y dónde?): 'Last summer, I was in Veracruz with my family.' / 'When I was twelve, I lived in a small town in Michoacán.' / 'Two years ago, during the summer holidays...'",
            "2. EVENT — Qué pasó (¿qué ocurrió?): 'Suddenly, we saw something strange in the water.' / 'One day, I had a big problem at school.' / 'I decided to try something new.'",
            "3. DEVELOPMENT — Desarrollo (detalles): 'First, we were confused. Then we got closer and realized...' / 'I didn't know what to do, so I asked for help.'",
            "4. REACTION — Reacción emocional (¿cómo te sentiste?): 'I felt really scared.' / 'We were so surprised!' / 'I couldn't believe it.' / 'It was amazing!'",
            "5. CONCLUSION — Cierre o reflexión: 'In the end, everything was okay.' / 'It was one of the best experiences of my life.' / 'I learned that...'",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Frases útiles para contar experiencias",
        },
        {
          tipo: "parrafo",
          contenido:
            "Para empezar: 'Let me tell you about...', 'Something interesting happened to me...', 'I'll never forget the time when...', 'One of my best/worst memories is...'. Para reaccionar: 'I was so happy/scared/surprised/embarrassed!' / 'I couldn't believe it!' / 'It was unbelievable!' / 'I felt proud/nervous/excited.' Para cerrar: 'In the end...', 'Finally...', 'That's why I always...', 'It was a great/terrible/unforgettable experience.' Ejemplo completo: 'Last year, I went to a lucha libre event in Mexico City with my cousin. We had seats near the ring. Suddenly, a wrestler jumped from the ropes and landed very close to us! We were terrified at first, but then we laughed a lot. In the end, it was one of the most exciting nights of my life.'",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Recuerda: a nivel A2 no necesitas vocabulario complejo. Usa oraciones cortas y claras. El Past Simple es tu mejor herramienta para narrar eventos pasados. Añade adjetivos y adverbios sencillos para hacer la historia más interesante: very, really, so, quite, a bit. Lo más importante es que la historia tenga inicio, medio y fin.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de flujo con las cinco partes de una anécdota personal: Setting, Event, Development, Reaction y Conclusion, con ejemplos en inglés",
          caption: "Una buena anécdota personal en inglés tiene cinco partes: contexto, evento, desarrollo, reacción y conclusión.",
        },
      ],
    },
  },

  // ── 9 ── Habilidades comunicativas ────────────────────────────────────────
  {
    slug: "in-iii-conectores-secuenciales",
    titulo: "Sequencing events: first, then, after that, finally",
    categoria: "Habilidades comunicativas",
    conceptos_clave: ["conectores secuenciales", "narración", "orden cronológico", "cohesión textual"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Los conectores secuenciales son palabras y expresiones que ordenan los eventos en el tiempo y dan cohesión a un texto o discurso oral. Sin ellos, una narración es una lista confusa de hechos; con ellos, la historia fluye de manera natural y el oyente o lector puede seguir el orden de los eventos fácilmente. Son esenciales para contar historias, dar instrucciones, describir procesos y narrar experiencias en inglés.",
        },
        {
          tipo: "subtitulo",
          contenido: "Conectores de secuencia básicos",
        },
        {
          tipo: "lista",
          items: [
            "First / First of all (Primero / En primer lugar): se usa al inicio de la narración. 'First, I woke up at 6 am.' / 'First of all, we bought the ingredients.'",
            "Then / Next (Luego / Después / A continuación): para el siguiente evento. 'Then, I had breakfast.' / 'Next, we went to the market.'",
            "After that (Después de eso): para marcar un evento que sigue a otro. 'After that, we took a taxi to the museum.'",
            "Later / Later on (Más tarde): para un evento que ocurre después, sin necesariamente ser inmediato. 'Later, we realized we forgot something.'",
            "Finally / In the end / At last (Finalmente / Al final / Por fin): para el último evento o el desenlace. 'Finally, we arrived home.' / 'In the end, everything was fine.' / 'At last, the concert started!'",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Conectores narrativos adicionales",
        },
        {
          tipo: "parrafo",
          contenido:
            "Para hacer la narración más dinámica, puedes añadir conectores que expresan cambios inesperados o relaciones causales. Suddenly / All of a sudden (De repente): 'Suddenly, it started to rain.' / 'All of a sudden, the lights went out.' Meanwhile (Mientras tanto): 'I was cooking. Meanwhile, my sister was setting the table.' As soon as (En cuanto / Tan pronto como): 'As soon as we arrived, it started to snow.' Eventually (Finalmente / Con el tiempo): 'Eventually, we found the restaurant.' Ejemplo de narración completa con conectores: 'Last Saturday, I decided to make enchiladas for my family. First, I bought the ingredients at the local market. Then, I prepared the sauce. After that, I filled the tortillas and put them in the pan. Suddenly, I realized I forgot the cheese! Later, my mom arrived and helped me. Finally, we ate together and everyone loved the food. In the end, it was a great experience.'",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "¿Sabías que usar conectores es una de las cosas que más mejora la fluidez en inglés? Los evaluadores de inglés (como en el examen de Cambridge) prestan mucha atención a si el estudiante organiza sus ideas con cohesión. Practica conectando oraciones simples con first, then, after that y finally. Esto hace que tu inglés suene mucho más natural y organizado.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Línea de tiempo horizontal con los conectores secuenciales posicionados en orden: first, then, after that, later, finally, con ejemplos debajo de cada uno",
          caption: "Los conectores secuenciales ordenan los eventos en el tiempo y dan fluidez a la narración.",
        },
      ],
    },
  },

  // ── 10 ── Habilidades comunicativas ───────────────────────────────────────
  {
    slug: "in-iii-describir-lugares",
    titulo: "Describing places and giving recommendations",
    categoria: "Habilidades comunicativas",
    conceptos_clave: ["describir lugares", "there is/there are", "preposiciones de lugar", "recomendaciones"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Describir lugares y dar recomendaciones son habilidades muy útiles en inglés A2. Puedes describir tu ciudad, pueblo, barrio o un lugar que visitaste, y también puedes sugerir a alguien qué visitar o qué hacer. Estas habilidades combinan vocabulario de lugares, preposiciones de lugar y estructuras para dar recomendaciones. Son esenciales para la interacción cotidiana: turistas, amigos, compañeros de intercambio, todos preguntan '¿qué hay que ver aquí?'",
        },
        {
          tipo: "subtitulo",
          contenido: "Estructuras para describir lugares",
        },
        {
          tipo: "lista",
          items: [
            "There is / There are: para existencia. 'There is a beautiful cathedral in the center.' (Hay una hermosa catedral en el centro.) / 'There are many traditional markets in Oaxaca.' (Hay muchos mercados tradicionales en Oaxaca.)",
            "It has / It doesn't have: para características. 'My town has a big park.' / 'It doesn't have a metro system.'",
            "Adjetivos descriptivos: beautiful, historic, busy, quiet, modern, traditional, colorful, crowded, peaceful, amazing.",
            "Preposiciones de lugar: next to (junto a), near (cerca de), in front of (frente a), behind (detrás de), between (entre), on the corner of (en la esquina de), in the center of (en el centro de).",
            "Ejemplo: 'My neighborhood in Guadalajara is very lively. There are many taco stands next to the park. The market is near the main street. Behind the church, there is a beautiful garden.'",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Frases para dar recomendaciones",
        },
        {
          tipo: "parrafo",
          contenido:
            "Para recomendar lugares o actividades: You should visit... (Deberías visitar...) / I recommend... (Recomiendo...) / Don't miss... (No te pierdas...) / Make sure you try... (Asegúrate de probar...) / It's worth visiting... (Vale la pena visitar...) / If you have time, go to... (Si tienes tiempo, ve a...) Ejemplo de recomendación completa: 'You should visit Guanajuato if you come to Mexico. It's a very colorful and historic city. There are amazing mummies in the museum — don't miss them! Make sure you try the enchiladas mineras. I also recommend walking through the Callejón del Beso. It's worth every minute!' Para pedir recomendaciones: What do you recommend? / What should I visit? / Is there anything interesting near here? / What's the best thing to do in...?",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Practica describiendo tu propia ciudad o comunidad en inglés. Intenta escribir un párrafo de 5-7 oraciones usando: there is/there are, adjetivos descriptivos, preposiciones de lugar y al menos una recomendación. Por ejemplo: 'My town is in the state of Veracruz. There is a central square with a beautiful kiosk. Near the square, there are many seafood restaurants. I recommend trying the chilpachole. You should also visit the local market on Sundays. It is a peaceful and friendly place.'",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Ilustración de una ciudad mexicana con etiquetas en inglés indicando lugares: market, church, park, school, museum, con preposiciones de lugar",
          caption: "Describir una ciudad en inglés combina vocabulario de lugares, adjetivos y preposiciones.",
        },
      ],
    },
  },

  // ── 11 ── Habilidades comunicativas ───────────────────────────────────────
  {
    slug: "in-iii-dar-instrucciones",
    titulo: "Giving and following instructions in English",
    categoria: "Habilidades comunicativas",
    conceptos_clave: ["imperativo", "instrucciones", "dar indicaciones", "how to"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Dar y seguir instrucciones es una habilidad comunicativa fundamental que usamos todos los días: en la cocina, en el trabajo, en la escuela, al dar indicaciones en la calle, al explicar cómo usar un aparato. En inglés, las instrucciones usan principalmente el modo imperativo (el verbo en su forma base, sin sujeto), combinado con conectores secuenciales y frases de cortesía. A nivel A2, dominar esta habilidad te permite comunicarte de manera efectiva en situaciones cotidianas reales.",
        },
        {
          tipo: "subtitulo",
          contenido: "El imperativo en inglés",
        },
        {
          tipo: "lista",
          items: [
            "Afirmativo: verbo base (sin sujeto). 'Open the book.' / 'Turn left.' / 'Add the tomatoes.' / 'Click on the icon.' / 'Listen carefully.'",
            "Negativo: Don't + verbo base. 'Don't touch that.' / 'Don't turn off the computer.' / 'Don't add salt.' / 'Don't cross the street here.'",
            "Con cortesía: Please + imperativo. 'Please sit down.' / 'Please don't be late.' La cortesía también se añade al final: 'Turn right, please.'",
            "Para pedir que alguien explique algo: 'How do I...?' / 'Can you show me how to...?' / 'What do I do first?' / 'What does this button do?'",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Instrucciones en contextos reales",
        },
        {
          tipo: "parrafo",
          contenido:
            "Receta sencilla (How to make guacamole): First, take two ripe avocados. Then, cut them in half and remove the seed. Next, scoop out the flesh and put it in a bowl. After that, mash the avocado with a fork. Add lime juice, salt, and chopped cilantro. Finally, mix everything together and serve with tortilla chips! Indicaciones en la calle: 'Go straight ahead for two blocks. Then turn left at the pharmacy. The market is on the right, next to the school. You can't miss it.' Instrucciones para usar el sistema de la escuela: 'First, open your browser. Then go to the school website. Click on 'Student Portal'. Enter your username and password. After that, you can see your grades and homework.'",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "¿Sabías que los tutoriales de YouTube en inglés son una excelente práctica de instrucciones reales? Busca videos de 'how to cook...' o 'how to draw...' en inglés. Escucha los conectores (first, then, next, after that, finally) y los imperativos (add, mix, put, stir, click, press). Ver instrucciones reales en contexto es una de las formas más efectivas de aprender este tipo de lenguaje.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Receta visual paso a paso de guacamole con instrucciones en inglés: first, then, next, after that, finally, con ilustraciones de cada paso",
          caption: "Las instrucciones en inglés combinan el imperativo con conectores secuenciales.",
        },
      ],
    },
  },

  // ── 12 ── Habilidades comunicativas ───────────────────────────────────────
  {
    slug: "in-iii-habitos-preferencias",
    titulo: "Talking about habits, frequency and preferences",
    categoria: "Habilidades comunicativas",
    conceptos_clave: ["adverbios de frecuencia", "hábitos", "preferencias", "like + gerundio"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Hablar sobre hábitos diarios, con qué frecuencia hacemos cosas y qué preferimos es una parte central de la conversación cotidiana en inglés. ¿Con qué frecuencia estudias? ¿Qué te gusta hacer los fines de semana? ¿Prefieres el fútbol o el básquetbol? Estas son preguntas comunes que aparecen en conversaciones, entrevistas y exámenes de nivel A2. Dominar los adverbios de frecuencia y las estructuras de preferencia te permite hablar sobre tu vida de manera natural.",
        },
        {
          tipo: "subtitulo",
          contenido: "Adverbios de frecuencia",
        },
        {
          tipo: "lista",
          items: [
            "Always (siempre — 100%): I always eat breakfast. / She always arrives on time.",
            "Usually / Generally (generalmente — 80%): I usually take the bus to school. / He usually studies after dinner.",
            "Often / Frequently (frecuentemente — 60%): We often play soccer on Sundays.",
            "Sometimes (a veces — 50%): I sometimes watch series in English.",
            "Occasionally (ocasionalmente — 30%): She occasionally cooks traditional food.",
            "Rarely / Seldom (raramente — 10%): He rarely eats fast food.",
            "Never (nunca — 0%): I never skip breakfast.",
            "Posición en la oración: los adverbios de frecuencia van DESPUÉS del verbo 'to be' (I am always tired) y ANTES de los demás verbos (I always eat breakfast, NOT I eat always breakfast).",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Expresar preferencias y gustos",
        },
        {
          tipo: "parrafo",
          contenido:
            "Like + noun/verb-ing (gustar algo): I like tacos. / She likes reading. / Do you like dancing? Prefer (preferir): I prefer coffee to tea. / She prefers walking to taking the bus. / I prefer to stay home. Love / Hate / Enjoy / Don't mind: I love spending time with my family. / He hates getting up early. / I enjoy cooking. / I don't mind waiting. Would rather (preferir — en este momento): I'd rather watch a movie than study tonight. (Preferiría ver una película que estudiar esta noche.) Pregunta para comparar preferencias: Do you prefer...or...? / Would you rather...or...? Ejemplo de conversación: 'Do you prefer soccer or basketball?' 'I prefer soccer. I usually play on Saturdays with my friends. Sometimes we go to the park and play for two hours. I love it!'",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Recuerda: después de like, love, hate y enjoy, el verbo siempre va en -ing (gerundio). CORRECTO: I like playing video games. INCORRECTO: I like play video games. Después de prefer y would rather, el verbo puede ir en infinitivo: I prefer to eat tacos. / I'd rather eat tacos. No confundas I like (me gusta regularmente) con I would like (me gustaría — deseo específico en este momento): 'I would like a glass of water, please' (como en un restaurante).",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Escala visual de frecuencia del 0% al 100% con los adverbios de frecuencia posicionados: never, rarely, sometimes, often, usually, always",
          caption: "Los adverbios de frecuencia expresan con qué regularidad hacemos algo.",
        },
      ],
    },
  },

  // ── 13 ── Vocabulario A2 ──────────────────────────────────────────────────
  {
    slug: "in-iii-vocabulario-actividades-cotidianas",
    titulo: "Everyday vocabulary: daily activities and routines",
    categoria: "Vocabulario A2",
    conceptos_clave: ["actividades cotidianas", "rutinas", "colocaciones", "vocabulario A2"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El vocabulario de actividades cotidianas es la base para hablar sobre tu vida en inglés. A nivel A2, necesitas poder describir tu rutina diaria con fluidez: qué haces por la mañana, en la escuela y por la tarde. Este vocabulario también incluye colocaciones importantes (combinaciones de palabras que van juntas en inglés y que no siempre se traducen literalmente). Por ejemplo, en inglés se dice 'do homework' y no 'make homework', o 'take a shower' y no 'have a shower' (aunque en inglés británico sí se dice 'have a shower').",
        },
        {
          tipo: "subtitulo",
          contenido: "Actividades de la mañana (Morning routine)",
        },
        {
          tipo: "lista",
          items: [
            "wake up (despertarse) / get up (levantarse — son diferentes: wake up es abrir los ojos, get up es salir de la cama)",
            "take a shower / have a shower (ducharse) / wash your face (lavarse la cara) / brush your teeth (cepillarse los dientes)",
            "get dressed (vestirse) / put on your uniform (ponerse el uniforme) / comb/brush your hair (peinarse)",
            "have breakfast / eat breakfast (desayunar) — colocación: 'have' o 'eat' con meals (meals = comidas)",
            "pack your bag (empacar tu mochila) / leave home (salir de casa) / take the bus (tomar el autobús) / walk to school (caminar a la escuela)",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Actividades escolares y de la tarde",
        },
        {
          tipo: "lista",
          items: [
            "attend classes (asistir a clases) / take notes (tomar apuntes) / do homework (hacer tarea) / study for a test (estudiar para un examen)",
            "have lunch (almorzar) / eat with friends (comer con amigos) / buy food at the cafeteria (comprar comida en la cafetería)",
            "play sports (practicar deportes) / go to practice (ir al entrenamiento) / hang out with friends (pasar tiempo con amigos)",
            "get home (llegar a casa) / have a snack (comer algo ligero) / help with chores (ayudar con los quehaceres) / do the dishes (lavar los platos) / take out the trash (sacar la basura)",
            "watch TV / watch a series (ver una serie) / use social media (usar redes sociales) / listen to music (escuchar música) / read (leer) / go to bed (ir a dormir) / fall asleep (quedarse dormido)",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Las colocaciones son combinaciones fijas de palabras. En inglés no se puede 'hacer' cualquier cosa con 'do' o 'make' — hay que aprender cuál va con cada sustantivo. Con 'do': do homework, do the dishes, do exercise, do your hair, do a favor. Con 'make': make breakfast, make a phone call, make a mistake, make a decision, make friends. ¡No se pueden intercambiar! Aprende las colocaciones como unidades completas.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Infografía de un día típico de un estudiante mexicano de bachillerato con actividades en inglés y español, organizada en mañana, tarde y noche",
          caption: "Las colocaciones de actividades cotidianas deben aprenderse como unidades completas.",
        },
      ],
    },
  },

  // ── 14 ── Vocabulario A2 ──────────────────────────────────────────────────
  {
    slug: "in-iii-vocabulario-emociones",
    titulo: "Feelings and emotions in English",
    categoria: "Vocabulario A2",
    conceptos_clave: ["emociones", "sentimientos", "vocabulario emocional A2", "I feel / I am"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Expresar emociones y sentimientos es fundamental en cualquier idioma. En inglés A2, ampliar tu vocabulario emocional más allá de 'happy' y 'sad' te permite comunicarte con más precisión y profundidad. Hay matices importantes: no es lo mismo estar 'nervous' que 'terrified', o 'satisfied' que 'thrilled'. Además, en inglés se pueden usar tanto 'I feel...' como 'I am...' para expresar emociones, pero hay diferencias sutiles de uso.",
        },
        {
          tipo: "subtitulo",
          contenido: "Vocabulario emocional A2: emociones positivas y negativas",
        },
        {
          tipo: "lista",
          items: [
            "Emociones positivas: happy (feliz) / excited (emocionado/a) / proud (orgulloso/a) / relieved (aliviado/a) / satisfied (satisfecho/a) / grateful (agradecido/a) / confident (seguro/a de sí mismo) / hopeful (esperanzado/a) / calm (tranquilo/a) / thrilled (muy emocionado/a)",
            "Emociones negativas: sad (triste) / worried (preocupado/a) / nervous (nervioso/a) / scared (asustado/a) / disappointed (decepcionado/a) / frustrated (frustrado/a) / angry (enojado/a) / bored (aburrido/a) / confused (confundido/a) / embarrassed (avergonzado/a)",
            "Emociones neutras o mixtas: surprised (sorprendido/a) / shocked (impactado/a) / tired (cansado/a) / stressed (estresado/a) / nostalgic (nostálgico/a) / lonely (solo/a — sentimiento, no estado físico)",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "I feel vs I am: ¿cuál usar?",
        },
        {
          tipo: "parrafo",
          contenido:
            "Ambas estructuras son correctas, pero 'I feel' suena más personal y temporal, mientras que 'I am' es más directo y puede sonar más permanente. En la práctica, para emociones, ambas se usan indistintamente: 'I feel nervous' = 'I am nervous'. Sin embargo, 'I feel' se usa más con adverbios y con frases complejas: 'I feel a little nervous today.' / 'I feel like I can't do this.' Para preguntar: 'How do you feel?' / 'How are you feeling?' Ejemplos en contexto mexicano: 'I feel proud when I speak English in class.' (Me siento orgulloso/a cuando hablo inglés en clase.) / 'I was excited when we visited Teotihuacán last year.' (Estaba emocionado/a cuando visitamos Teotihuacán el año pasado.) / 'My little sister feels embarrassed when she makes mistakes.' (Mi hermanita se siente avergonzada cuando comete errores.)",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "¿Sabías que 'embarrassed' es un falso amigo con el español 'embarazada'? 'Embarrassed' significa avergonzado/a, no embarazada. Si quieres decir que una mujer está embarazada en inglés, la palabra correcta es 'pregnant'. Este es uno de los errores de traducción más cómicos y frecuentes entre estudiantes hispanohablantes. ¡No los confundas!",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Rueda de emociones en inglés con caras expresivas y los nombres de las emociones organizadas de positivas a negativas, con traducción al español",
          caption: "El vocabulario emocional en inglés permite expresar matices y precisión en los sentimientos.",
        },
      ],
    },
  },

  // ── 15 ── Vocabulario A2 ──────────────────────────────────────────────────
  {
    slug: "in-iii-vocabulario-lugares-comunidad",
    titulo: "Community vocabulary: places and services",
    categoria: "Vocabulario A2",
    conceptos_clave: ["lugares de la comunidad", "servicios", "pedir direcciones", "preposiciones de lugar"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El vocabulario de lugares y servicios en la comunidad es esencial para la vida cotidiana en inglés. Te permite hablar sobre tu barrio, dar o pedir indicaciones, y describir los servicios disponibles en tu ciudad. En México, los lugares de la comunidad tienen características propias (el tianguis, el zócalo, la tortillería) que se pueden describir en inglés para que personas de otros países las comprendan. Este vocabulario es también fundamental para textos de lectura y escucha a nivel A2.",
        },
        {
          tipo: "subtitulo",
          contenido: "Lugares principales en una comunidad",
        },
        {
          tipo: "lista",
          items: [
            "Salud y emergencias: hospital (hospital) / clinic / health center (clínica / centro de salud) / pharmacy / drugstore (farmacia) / fire station (estación de bomberos) / police station (estación de policía)",
            "Educación y cultura: school (escuela) / high school (bachillerato) / university (universidad) / library (biblioteca) / museum (museo) / theater (teatro)",
            "Comercio y servicios: market (mercado) / supermarket (supermercado) / bank (banco) / post office (oficina de correos) / gas station (gasolinera) / restaurant (restaurante) / bakery (panadería) / butcher's (carnicería)",
            "Espacio público y religión: park (parque) / square / plaza (plaza / zócalo) / church (iglesia) / cathedral (catedral) / sports center (centro deportivo) / swimming pool (alberca / piscina)",
            "Transporte: bus stop (parada de autobús) / taxi stand (sitio de taxis) / train station (estación de tren) / airport (aeropuerto) / parking lot (estacionamiento)",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Pedir y dar indicaciones",
        },
        {
          tipo: "parrafo",
          contenido:
            "Para pedir indicaciones: 'Excuse me, where is the nearest pharmacy?' / 'How do I get to the bus station?' / 'Is there a bank near here?' Para dar indicaciones: 'Go straight ahead.' (Siga derecho.) / 'Turn left/right.' (Gire a la izquierda/derecha.) / 'Take the first/second street on the left/right.' / 'It's on the corner of...and...' / 'It's next to the park.' / 'You can't miss it.' (No puede perderse.) Ejemplo: 'Excuse me, is there a library near here?' 'Yes! Go straight ahead for two blocks. Then turn left at the church. The library is on the right, between the school and the park. It's about five minutes on foot.'",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Vocabulario específico de México que puedes explicar en inglés: tianguis = open-air market, usually weekly (mercado al aire libre, generalmente semanal). zócalo = main square / central plaza of a Mexican city or town. tortillería = shop or stand where tortillas are made and sold fresh. These are great words to teach to English-speaking visitors to Mexico! Saber describir la cultura propia en inglés es parte del objetivo del curso.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mapa ilustrado de una comunidad mexicana con etiquetas en inglés de los lugares: market, church, park, clinic, school, library, police station",
          caption: "Conocer el vocabulario de lugares permite dar y pedir indicaciones en inglés.",
        },
      ],
    },
  },

  // ── 16 ── Vocabulario A2 ──────────────────────────────────────────────────
  {
    slug: "in-iii-conectores-adversativos",
    titulo: "Connectors: but, although, however, so",
    categoria: "Vocabulario A2",
    conceptos_clave: ["conectores", "contraste", "causa-efecto", "cohesión", "although", "however"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Los conectores son las palabras que unen ideas y oraciones, dando cohesión y lógica al texto. En inglés A2, es importante ir más allá del simple 'and' y 'but' y aprender a usar una variedad de conectores que expresan contraste, causa, consecuencia y condición. El uso de conectores variados es uno de los indicadores más claros del nivel lingüístico de un hablante o escritor. En este nivel aprenderás los conectores de contraste y causa-efecto más comunes.",
        },
        {
          tipo: "subtitulo",
          contenido: "Conectores de contraste",
        },
        {
          tipo: "lista",
          items: [
            "But (pero): el más común. Une dos cláusulas en la misma oración. 'I wanted to go to the beach, but it was raining.' / 'The food was delicious, but very expensive.'",
            "Although / Even though (aunque): introduce una idea que contrasta con la oración principal. Va al inicio o en medio de la oración. 'Although it was cold, we went swimming.' / 'We went swimming, although it was cold.' / 'Even though I was tired, I finished my homework.'",
            "However (sin embargo): se usa al inicio de una oración nueva para contrastar con la anterior. Va seguido de coma. 'The exam was very difficult. However, most students passed.' Nota: However es más formal que 'but'.",
            "On the other hand (por otro lado): para contrastar dos perspectivas distintas. 'Living in a city has many advantages. On the other hand, it can be stressful.'",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Conectores de causa y consecuencia",
        },
        {
          tipo: "lista",
          items: [
            "So (así que / por eso): consecuencia. 'It was raining, so we stayed at home.' / 'I forgot my homework, so the teacher was upset.'",
            "Because (porque): causa. 'I stayed at home because it was raining.' / 'She was tired because she studied all night.'",
            "Therefore (por lo tanto): más formal, para consecuencias lógicas. 'I didn't study. Therefore, I failed the exam.'",
            "As a result (como resultado): consecuencia. 'There was a big storm. As a result, the school was closed.'",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Diferencia importante: But conecta dos cláusulas dentro de una misma oración (I wanted to go, but I was tired). However generalmente inicia una nueva oración (I wanted to go. However, I was tired.). En escritura formal o académica, se prefiere However sobre but al inicio de oración. Although introduce la idea de contraste directamente (Although I was tired, I went). Practica usando los cuatro conectores para que puedas elegir el más apropiado según el contexto.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Esquema con cuatro conectores (but, although, however, so) y flechas que muestran cómo conectan ideas de contraste y causa-efecto, con ejemplos",
          caption: "Los conectores dan cohesión y lógica a los textos en inglés.",
        },
      ],
    },
  },

  // ── 17 ── Vocabulario A2 ──────────────────────────────────────────────────
  {
    slug: "in-iii-phrasal-verbs-basicos",
    titulo: "Basic phrasal verbs for everyday communication",
    categoria: "Vocabulario A2",
    conceptos_clave: ["phrasal verbs", "verbos frasales", "comunicación cotidiana", "inglés informal"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Los phrasal verbs (verbos frasales) son combinaciones de un verbo y una partícula (preposición o adverbio) cuyo significado conjunto es diferente al significado de las palabras por separado. Por ejemplo, 'give up' no significa 'dar hacia arriba' sino 'rendirse'. Los phrasal verbs son extremadamente comunes en el inglés cotidiano e informal, y son fundamentales para la comprensión de series, películas, canciones y conversaciones reales. Aprender los más frecuentes te ayuda enormemente a nivel A2.",
        },
        {
          tipo: "subtitulo",
          contenido: "Los 15 phrasal verbs más comunes",
        },
        {
          tipo: "lista",
          items: [
            "get up (levantarse): I get up at 6 am every day. (Me levanto a las 6 am todos los días.)",
            "wake up (despertarse): She woke up late this morning. (Ella se despertó tarde esta mañana.)",
            "put on (ponerse — ropa, música): Put on your jacket, it's cold. / He put on some music.",
            "take off (quitarse — ropa; despegar — avión): Take off your shoes at the door. / The plane took off at 10 am.",
            "look for (buscar): I'm looking for my keys. (Estoy buscando mis llaves.)",
            "find out (descubrir / enterarse): I found out the test results. (Me enteré de los resultados del examen.)",
            "give up (rendirse / dejar de hacer algo): Don't give up! Keep trying. (¡No te rindas! Sigue intentando.)",
            "turn off (apagar): Turn off the lights before you leave. (Apaga las luces antes de salir.)",
            "turn on (encender): Can you turn on the TV? (¿Puedes encender la tele?)",
            "pick up (recoger / levantar): Please pick up your things. / I'll pick you up at 5. (Te recojo a las 5.)",
            "come back (regresar / volver): She came back from Cancún yesterday. (Ella regresó de Cancún ayer.)",
            "go on (continuar / seguir): Go on, I'm listening. (Continúa, te escucho.)",
            "look up (buscar información en diccionario/internet): Look up the word in the dictionary. (Busca la palabra en el diccionario.)",
            "run out of (quedarse sin algo): We ran out of milk. (Se nos acabó la leche.)",
            "take care of (cuidar de alguien o algo): She takes care of her little brother. (Ella cuida a su hermanito.)",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "¿Sabías que en inglés existen más de 5,000 phrasal verbs? No te preocupes: no necesitas aprenderlos todos. Con los 50 más frecuentes puedes manejar la mayoría de las situaciones cotidianas. Un truco para aprenderlos: no los estudies como listas de vocabulario aislado, sino en contexto. Cada vez que ves un phrasal verb en una serie, canción o lectura, anótalo con su oración completa.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Cuadrícula con 15 phrasal verbs comunes, cada uno con su significado en español y un ejemplo de oración en contexto cotidiano",
          caption: "Los phrasal verbs son esenciales para el inglés cotidiano e informal.",
        },
      ],
    },
  },

  // ── 18 ── Cultura angloparlante ───────────────────────────────────────────
  {
    slug: "in-iii-cultura-paises-anglohablantes",
    titulo: "English-speaking countries: diversity and culture",
    categoria: "Cultura angloparlante",
    conceptos_clave: ["países angloparlantes", "diversidad cultural", "variedades del inglés", "plurilingüismo"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El inglés no es solo el idioma de Estados Unidos o el Reino Unido. Es una lengua global que tiene hablantes nativos en al menos seis continentes y que funciona como lengua franca en decenas de países más. Cada país y región donde se habla inglés tiene su propia cultura, acento, vocabulario y variantes. Conocer esta diversidad te ayuda a comprender que no existe un solo inglés 'correcto' y que el objetivo del aprendizaje no es imitar a los estadounidenses, sino comunicarte efectivamente en un mundo plurilingüe.",
        },
        {
          tipo: "subtitulo",
          contenido: "Principales países de habla inglesa",
        },
        {
          tipo: "lista",
          items: [
            "Reino Unido (UK): cuna del inglés moderno. Incluye England, Scotland, Wales e Northern Ireland. Vocabulario diferente al americano: lorry (truck), lift (elevator), biscuit (cookie), queue (line), flat (apartment).",
            "Estados Unidos (USA): el país con más hablantes de inglés en el mundo. También el mayor productor de contenidos en inglés (películas, series, música). Muchas variedades regionales dentro del propio país.",
            "Australia: inglés con acento y vocabulario propios. G'day (hello), arvo (afternoon), barbie (barbecue), mate (friend). Gran diversidad de lenguas indígenas aboriginales.",
            "Canadá: similar al inglés americano pero con influencias del inglés británico y del francés (Quebec es francófono). About se pronuncia diferente: /aboot/.",
            "Caribe anglófono: Jamaica, Barbados, Trinidad y Tobago, Bahamas. El inglés caribeño tiene influencia de lenguas africanas. Patois jamaicano es una variante criolla distinta.",
            "Sudáfrica e India: países con inglés como lengua oficial junto a otras lenguas nacionales. El inglés de India tiene características propias y es hablado por cientos de millones de personas.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "México y el inglés: México tiene una relación especial con el inglés por su frontera con Estados Unidos. Hay comunidades de mexicoamericanos que hablan Spanglish — una mezcla fluida de español e inglés — y hay millones de mexicanos que trabajan o estudian con hablantes de inglés. El inglés que estudias en el MCCEMS es una herramienta para comunicarte en este mundo diverso, no para abandonar tu identidad cultural.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "No existe un inglés 'puro' o 'correcto'. Todas las variedades del inglés son válidas. El inglés americano que predomina en los medios de comunicación globales no es superior al inglés australiano, caribeño o indio. Al aprender inglés, exponte a distintas variedades: escucha podcasts en inglés británico, series en inglés australiano, música en inglés caribeño. Esto mejora enormemente tu comprensión oral.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mapa mundial con los países de habla inglesa marcados en diferentes tonos, mostrando la distribución global del inglés como lengua nativa y oficial",
          caption: "El inglés es una lengua global con múltiples variedades culturales y regionales.",
        },
      ],
    },
  },

  // ── 19 ── Cultura angloparlante ───────────────────────────────────────────
  {
    slug: "in-iii-ingles-y-lenguas-indigenas",
    titulo: "English, Spanish and indigenous languages: linguistic diversity",
    categoria: "Cultura angloparlante",
    conceptos_clave: ["diversidad lingüística", "nahuatl en inglés", "justicia lingüística", "lenguas indígenas"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El inglés, el español y las lenguas indígenas de México no son mundos separados: se han influenciado mutuamente a lo largo de siglos. El náhuatl, por ejemplo, ha dejado su huella en el español (tomate, chocolate, aguacate, chile) y a través del español muchas de esas palabras llegaron también al inglés. Esta historia de intercambio lingüístico es fascinante y nos recuerda que todos los idiomas son redes vivas de contacto, préstamo y transformación. Ninguna lengua existe en aislamiento.",
        },
        {
          tipo: "subtitulo",
          contenido: "Palabras del náhuatl que viajaron al inglés",
        },
        {
          tipo: "lista",
          items: [
            "chocolate (de xocolātl en náhuatl): una de las palabras más reconocidas en todo el mundo. Llegó al inglés a través del español.",
            "tomato (de tomatl): el tomate, fruto originario de México, lleva un nombre náhuatl en casi todas las lenguas del mundo.",
            "avocado (de āhuacatl): el aguacate, hoy en las ensaladas y guacamoles de todo el planeta.",
            "chile / chili (de chīlli): el chile mexicano condimenta la cocina mundial.",
            "coyote (de coyōtl): el animal del desierto que aparece en caricaturas y noticias fronterizas.",
            "ocelot (de ōcēlōtl): el felino mexicano.",
            "axolotl (de āxōlōtl): el ajolote, símbolo de México y de la biología mundial por su capacidad de regeneración.",
            "cocoa (de cacahuatl, relacionado con cacao): la base del chocolate.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "La justicia lingüística es el principio de que todas las lenguas merecen reconocimiento, protección y respeto igual. México tiene más de 68 lenguas indígenas vivas, cada una con una historia, literatura y sistema de conocimiento propios. Aprender inglés no significa abandonar el español ni mucho menos las lenguas indígenas: significa añadir una herramienta más a tu repertorio lingüístico. El ideal del MCCEMS 2025 es el plurilingüismo: personas que pueden comunicarse en más de un idioma y que valoran la diversidad lingüística como riqueza cultural.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "¿Sabías que el náhuatl sigue siendo hablado por aproximadamente 1.7 millones de personas en México hoy en día? Es la lengua indígena más hablada del país. En años recientes, organizaciones como la INALI (Instituto Nacional de Lenguas Indígenas) trabajan para documentar, enseñar y promover las lenguas indígenas mexicanas. Hay nahuatlatos (hablantes de náhuatl) que también hablan español e inglés. El multilingüismo es parte de la identidad mexicana.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Árbol con raíces en lenguas indígenas (náhuatl, maya, zapoteca) y ramas en español e inglés, mostrando palabras compartidas como chocolate, tomato, avocado",
          caption: "Las lenguas se influencian mutuamente: el náhuatl vive en el español y en el inglés.",
        },
      ],
    },
  },

  // ── 20 ── Estrategias narrativas ──────────────────────────────────────────
  {
    slug: "in-iii-estrategias-lectura-ingles",
    titulo: "Reading strategies for A2 English texts",
    categoria: "Estrategias narrativas",
    conceptos_clave: ["estrategias de lectura", "skimming", "scanning", "cognados", "inferencia"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Leer en inglés a nivel A2 no significa entender cada palabra: significa extraer la información que necesitas usando estrategias inteligentes. Los lectores competentes en inglés usan sistemáticamente diferentes técnicas según su objetivo: ¿quiero saber de qué trata el texto en general? ¿Busco una información específica? ¿Quiero entender el significado de una palabra desconocida? Cada objetivo requiere una estrategia diferente. Estas estrategias también funcionan en español y son transferibles entre idiomas.",
        },
        {
          tipo: "subtitulo",
          contenido: "Las tres estrategias básicas de lectura",
        },
        {
          tipo: "lista",
          items: [
            "Skimming (lectura rápida para idea general): lee el título, subtítulos, primera y última oración de cada párrafo, y las palabras en negrita o cursiva. El objetivo es comprender de qué trata el texto sin leer todo. Útil para: decidir si un texto es relevante, preparar la lectura detallada, responder preguntas de idea general.",
            "Scanning (búsqueda de información específica): busca visualmente una palabra, fecha, nombre o dato concreto sin leer todo el texto. Los ojos se mueven rápido buscando ese elemento específico. Útil para: encontrar el horario de apertura, el precio, el nombre de una persona, una fecha histórica.",
            "Intensive reading (lectura intensiva y detallada): lee todo el texto con atención para comprensión profunda. Se detiene en las palabras desconocidas, usa el contexto para inferir significados. Útil para: estudiar un tema, responder preguntas de detalle, analizar un texto.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Cognados y estrategias de inferencia",
        },
        {
          tipo: "parrafo",
          contenido:
            "Los cognados son palabras que suenan y se escriben de manera similar en inglés y en español porque comparten origen. Para hablantes de español, los cognados son una ventaja enorme: hospital, natural, modern, culture, education, music, information, important, official, traditional, communication, technology. Cuando encuentras una palabra desconocida, usa el contexto para inferir su significado: lee las oraciones antes y después, identifica la función gramatical (¿es un sustantivo, verbo o adjetivo?), y busca pistas en el tema general del texto. No busques en el diccionario cada palabra desconocida: desarrolla la tolerancia a la ambigüedad.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Cuidado con los falsos cognados (false friends): palabras que parecen iguales en inglés y español pero tienen significados diferentes. Algunos ejemplos: embarrassed (avergonzado, NO embarazada) / library (biblioteca, NO librería) / actually (en realidad, NO actualmente) / sensible (sensato/razonable, NO sensible) / fabric (tela, NO fábrica) / assist (ayudar, NO asistir en el sentido de 'ir a'). Aprende los falsos cognados más comunes para evitar errores de comprensión.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama con tres estrategias de lectura (skimming, scanning, intensive reading) representadas por diferentes formas de movimiento del ojo sobre el texto",
          caption: "Elegir la estrategia de lectura correcta depende del objetivo y el tipo de texto.",
        },
      ],
    },
  },

  // ── 21 ── Estrategias narrativas ──────────────────────────────────────────
  {
    slug: "in-iii-escribir-narrativa-personal",
    titulo: "Writing a short personal narrative in English",
    categoria: "Estrategias narrativas",
    conceptos_clave: ["narrativa personal", "escritura A2", "estructura narrativa", "párrafo en inglés"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Escribir una narrativa personal breve en inglés es una de las tareas más importantes del nivel A2. Significa contar algo que te ocurrió a ti, usando el Past Simple, conectores secuenciales, vocabulario de emociones y descripciones básicas. No necesitas un texto perfecto: necesitas uno claro, organizado y auténtico. En este semestre aprenderás a escribir un párrafo narrativo de 80-120 palabras que tenga estructura, cohesión y expresión personal.",
        },
        {
          tipo: "subtitulo",
          contenido: "Estructura de una narrativa personal breve",
        },
        {
          tipo: "lista",
          items: [
            "1. WHEN AND WHERE (¿cuándo y dónde?): empieza situando la historia en el tiempo y el espacio. 'Last summer, I was in my grandmother's village in Guerrero.' / 'Two years ago, during a school trip to Teotihuacán...'",
            "2. WHO (¿quién?): menciona a las personas involucradas brevemente. 'I was with my family and some cousins.' / 'My friend Daniela and I were walking when...'",
            "3. WHAT HAPPENED (¿qué pasó?): narra los eventos en orden, usando Past Simple y conectores (first, then, after that). 'First, we climbed the Pyramid of the Sun. Then, suddenly, it started to rain heavily.'",
            "4. HOW YOU FELT (¿cómo te sentiste?): incluye al menos una emoción. 'I felt excited and a little scared.' / 'We were really surprised!' / 'It was amazing!'",
            "5. CONCLUSION (¿cómo terminó o qué aprendiste?): cierra con una reflexión breve. 'In the end, we laughed a lot.' / 'It was one of the best days of my life.' / 'I learned that...'",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Ejemplo de párrafo narrativo completo",
        },
        {
          tipo: "parrafo",
          contenido:
            "Lee este ejemplo de narrativa personal escrita por un estudiante de bachillerato mexicano a nivel A2: 'Last year, I went on a school trip to Oaxaca with my class. We visited the Monte Albán ruins in the morning. First, we walked up a big hill to reach the pyramids. Then, our teacher explained the history of the Zapotec people. After that, we had lunch at a traditional restaurant. I tried tlayudas for the first time — they were delicious! In the afternoon, we visited the textile market. I bought a small blanket for my mother. I felt proud because I paid in Spanish and in a few words of Zapotec that our guide taught us. In the end, I realized that Mexico has an incredible history. It was an unforgettable trip.' Cuenta: aproximadamente 100 palabras. Usa: Past Simple (went, visited, walked, tried, bought, felt, realized), conectores (first, then, after that, in the afternoon, in the end), emoción (I felt proud), conclusión personal.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Checklist para revisar tu narrativa personal: ¿Usé Past Simple para todos los eventos? ¿Incluí al menos tres conectores secuenciales? ¿Mencioné cómo me sentí? ¿El texto tiene inicio, desarrollo y conclusión? ¿Tiene entre 80 y 120 palabras? ¿Revisé la ortografía y la puntuación? ¿El lector puede entender claramente qué pasó, dónde, cuándo y cómo me sentí? Si respondiste sí a todas, ¡tu narrativa está lista!",
        },
        {
          tipo: "cita",
          contenido:
            "Every story I tell comes from a part of me. I use writing to help myself understand life.",
          fuente: "Sandra Cisneros, escritora chicana, autora de The House on Mango Street",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Borrador manuscrito de una narrativa personal en inglés con anotaciones que señalan las cinco partes: when/where, who, what happened, how I felt, conclusion",
          caption: "Una narrativa personal en inglés A2 tiene cinco partes claras y usa Past Simple con conectores.",
        },
      ],
    },
  },
] as const;

// ---------------------------------------------------------------------------
// FUNCIÓN PRINCIPAL
// ---------------------------------------------------------------------------

export async function seedBibliotecaINIII(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed Biblioteca IN-III (21 fichas)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", "IN-III")
    .single();

  if (uacErr || !uacRow) {
    throw new Error(
      `UAC IN-III no encontrada. Ejecuta primero seed-mccems.ts y seed-iniii.ts. Error: ${uacErr?.message}`
    );
  }

  const rows = FICHAS_INIII.map((f, i) => ({
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

  if (error) throw new Error(`Error seeding fichas IN-III: ${error.message}`);

  console.log(`  ✓ ${rows.length} fichas de biblioteca de IN-III insertadas/actualizadas.`);
  console.log("\n✅ Seed Biblioteca IN-III completado.\n");
}

// ---------------------------------------------------------------------------
// ENTRYPOINT
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
    console.error("❌ Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }
  const sb = createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  seedBibliotecaINIII(sb).catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
}

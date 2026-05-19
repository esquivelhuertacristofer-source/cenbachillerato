/**
 * Seed de fichas de biblioteca para IN-II (Inglés II).
 * 20 fichas temáticas alineadas al MCCEMS 2025, Semestre 2.
 *
 * Meta educativa: Intercambie información sobre actividades cotidianas,
 * tiempo libre y descripciones en inglés nivel A1+.
 *
 * Uso: npx tsx scripts/seed-fichas-inii.ts
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

const FICHAS_INII = [
  // ── 1 ──────────────────────────────────────────────────────────────────────
  {
    slug: "in-ii-present-simple-affirmative",
    titulo: "Present Simple: oraciones afirmativas",
    categoria: "Gramática inglesa",
    conceptos_clave: ["present simple", "afirmativo", "rutinas", "verbo principal"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El Present Simple (presente simple) es el tiempo verbal más fundamental del inglés y el primero que todo estudiante de nivel A1 debe dominar. Se usa para hablar de rutinas diarias, hechos permanentes, verdades generales y horarios fijos. A diferencia del español, en inglés el verbo no cambia según la persona, excepto en la tercera persona del singular (he, she, it).",
        },
        {
          tipo: "subtitulo",
          contenido: "Estructura afirmativa",
        },
        {
          tipo: "parrafo",
          contenido:
            "La estructura básica es: Sujeto + verbo base + complemento. Con I, you, we y they el verbo no cambia. Con he, she e it se añade -s o -es al verbo (este punto se estudia en detalle en la ficha de tercera persona singular).",
        },
        {
          tipo: "lista",
          items: [
            "I work every day. (Yo trabajo todos los días.)",
            "You eat breakfast at 7 a.m. (Tú desayunas a las 7 a.m.)",
            "We study English on Mondays. (Nosotros estudiamos inglés los lunes.)",
            "They live in Mexico City. (Ellos viven en la Ciudad de México.)",
            "She reads before bed. (Ella lee antes de dormir.) ← tercera persona: +s",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Usos principales",
        },
        {
          tipo: "lista",
          items: [
            "Rutinas y hábitos: I go to school at 7:30. / She exercises every morning.",
            "Hechos permanentes: Water boils at 100°C. / The sun rises in the east.",
            "Verdades generales: Dogs are loyal animals.",
            "Horarios y programas fijos: The bus leaves at 8:00.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Error frecuente de hispanohablantes: añadir el pronombre sujeto en todas las frases aunque sea redundante es correcto en inglés (a diferencia del español, donde puede omitirse). En inglés el pronombre sujeto es obligatorio: NUNCA digas solo 'Works every day'; debes decir 'He works every day'.",
        },
        {
          tipo: "subtitulo",
          contenido: "Adverbios de frecuencia con Present Simple",
        },
        {
          tipo: "parrafo",
          contenido:
            "Los adverbios de frecuencia (always, usually, often, sometimes, rarely, never) se colocan entre el sujeto y el verbo principal: I always drink coffee. / She never eats meat. Nunca van al final de la oración cuando acompañan al verbo principal.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tabla con la conjugación del Present Simple en forma afirmativa para los seis pronombres personales, señalando la -s de tercera persona",
          caption: "Estructura del Present Simple afirmativo: todos los pronombres.",
        },
      ],
    },
  },

  // ── 2 ──────────────────────────────────────────────────────────────────────
  {
    slug: "in-ii-present-simple-negative",
    titulo: "Present Simple: oraciones negativas",
    categoria: "Gramática inglesa",
    conceptos_clave: ["present simple", "negativo", "don't", "doesn't"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Para negar en Present Simple necesitamos el auxiliar do/does más not. El verbo principal vuelve a su forma base; la -s de tercera persona se 'mueve' al auxiliar (does). Esta es una de las estructuras más importantes del inglés básico y una fuente habitual de errores para hablantes de español.",
        },
        {
          tipo: "subtitulo",
          contenido: "Estructura negativa",
        },
        {
          tipo: "parrafo",
          contenido:
            "Con I, you, we, they → do not (don't) + verbo base. Con he, she, it → does not (doesn't) + verbo base. La forma contraída (don't / doesn't) es la más común en conversación.",
        },
        {
          tipo: "lista",
          items: [
            "I don't drink coffee. (No bebo café.)",
            "You don't work on Sundays. (No trabajas los domingos.)",
            "He doesn't eat meat. (Él no come carne.) ← doesn't, NO 'don't'",
            "She doesn't watch TV at night. (Ella no ve la televisión por la noche.)",
            "They don't understand the question. (Ellos no entienden la pregunta.)",
          ],
        },
        {
          tipo: "callout",
          variante: "advertencia",
          contenido:
            "Error muy común: 'She don't like coffee.' Esta forma es INCORRECTA. Con he, she, it siempre se usa DOESN'T. Otro error frecuente: añadir -s al verbo principal cuando ya se usa doesn't. 'He doesn't works' es incorrecto; la forma correcta es 'He doesn't work'.",
        },
        {
          tipo: "subtitulo",
          contenido: "Comparación afirmativo / negativo",
        },
        {
          tipo: "lista",
          items: [
            "I eat fish. → I don't eat fish.",
            "She plays guitar. → She doesn't play guitar.",
            "They live near here. → They don't live near here.",
            "He speaks French. → He doesn't speak French.",
          ],
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tabla comparativa de oraciones afirmativas y negativas en Present Simple, resaltando en rojo el uso incorrecto de don't con tercera persona y en verde el uso correcto de doesn't",
          caption: "Afirmativo vs. negativo en Present Simple: errores comunes.",
        },
      ],
    },
  },

  // ── 3 ──────────────────────────────────────────────────────────────────────
  {
    slug: "in-ii-third-person-singular",
    titulo: "La tercera persona singular: reglas de la -s",
    categoria: "Gramática inglesa",
    conceptos_clave: ["tercera persona", "-s", "-es", "-ies", "he she it"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "En Present Simple, cuando el sujeto es he, she o it (o cualquier nombre en singular: 'my brother', 'the dog', 'Maria') el verbo necesita una -s al final. Aunque parece sencillo, hay reglas ortográficas específicas para añadir esa -s que es necesario conocer.",
        },
        {
          tipo: "subtitulo",
          contenido: "Reglas para formar la tercera persona",
        },
        {
          tipo: "lista",
          items: [
            "Regla general → añadir -s: work → works, eat → eats, read → reads, play → plays.",
            "Verbos terminados en -s, -ss, -sh, -ch, -x, -o → añadir -es: go → goes, do → does, watch → watches, wash → washes, fix → fixes, miss → misses.",
            "Verbos terminados en consonante + y → cambiar y por -ies: study → studies, fly → flies, try → tries, carry → carries.",
            "Verbos terminados en vocal + y → solo añadir -s: play → plays, enjoy → enjoys, say → says.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Los dos verbos más irregulares de todos son have → has y be → is. 'She has a car.' / 'He is a teacher.' Estos no siguen ninguna de las reglas anteriores y deben memorizarse directamente.",
        },
        {
          tipo: "subtitulo",
          contenido: "Pronunciación de la -s",
        },
        {
          tipo: "parrafo",
          contenido:
            "La -s final no siempre suena igual. Se pronuncia /s/ después de consonantes sordas (works, eats, stops). Se pronuncia /z/ después de consonantes sonoras y vocales (lives, reads, plays). Se pronuncia /ɪz/ después de -s, -ss, -sh, -ch, -x (watches, washes, misses). No es necesario memorizar los símbolos fonéticos, pero sí escuchar y practicar la diferencia.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tabla con cuatro columnas: verbos base, regla aplicada, forma de tercera persona y pronunciación de la -s final",
          caption: "Reglas para la tercera persona singular en Present Simple.",
        },
      ],
    },
  },

  // ── 4 ──────────────────────────────────────────────────────────────────────
  {
    slug: "in-ii-adverbs-of-frequency",
    titulo: "Adverbios de frecuencia",
    categoria: "Gramática inglesa",
    conceptos_clave: ["always", "usually", "sometimes", "never", "frecuencia"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Los adverbios de frecuencia expresan con qué regularidad ocurre una acción. Son compañeros inseparables del Present Simple y resultan esenciales para hablar de rutinas y hábitos. En inglés existe una escala de frecuencia que va del 100% al 0%, con un adverbio para cada grado.",
        },
        {
          tipo: "subtitulo",
          contenido: "Escala de frecuencia",
        },
        {
          tipo: "lista",
          items: [
            "always (siempre) — 100%: I always wake up at 6.",
            "usually / normally (normalmente) — 80%: She usually has tea for breakfast.",
            "often / frequently (a menudo) — 60%: We often go to the park.",
            "sometimes (a veces) — 40%: He sometimes forgets his keys.",
            "rarely / seldom (raramente) — 20%: They rarely eat fast food.",
            "never (nunca) — 0%: I never smoke.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Posición en la oración",
        },
        {
          tipo: "parrafo",
          contenido:
            "Los adverbios de frecuencia van ANTES del verbo principal: I always drink water. / She usually studies at night. Pero van DESPUÉS del verbo to be: He is always late. / They are never tired. Expresiones de tiempo como every day, on Mondays, once a week van al principio o al final de la oración: Every Monday I go to the gym. / I go to the gym every Monday.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Error de hispanohablantes: colocar el adverbio al final de la oración principal. 'I drink always water' es INCORRECTO. La forma correcta es 'I always drink water'. Recuerda: siempre ANTES del verbo principal y DESPUÉS del verbo be.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Línea de tiempo del 0% al 100% con los adverbios de frecuencia colocados en su posición aproximada, con ejemplos de oraciones debajo de cada uno",
          caption: "Escala de frecuencia con los adverbios principales del inglés A1+.",
        },
      ],
    },
  },

  // ── 5 ──────────────────────────────────────────────────────────────────────
  {
    slug: "in-ii-can-and-cant",
    titulo: "Can y can't: habilidades y posibilidades",
    categoria: "Gramática inglesa",
    conceptos_clave: ["can", "can't", "modal verb", "habilidad", "permiso"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Can es un verbo modal que expresa habilidad (saber hacer algo), posibilidad y permiso. Es uno de los verbos más usados en inglés A1 y su estructura es sorprendentemente simple: no cambia con ningún pronombre y siempre va seguido de un verbo en forma base, sin to.",
        },
        {
          tipo: "subtitulo",
          contenido: "Estructura de can / can't",
        },
        {
          tipo: "lista",
          items: [
            "Afirmativo: Sujeto + can + verbo base. I can swim. / She can speak English.",
            "Negativo: Sujeto + can't (cannot) + verbo base. He can't drive. / They can't come today.",
            "Pregunta: Can + sujeto + verbo base? Can you cook? / Can she play the piano?",
            "Respuesta corta: Yes, I can. / No, I can't.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Usos de can",
        },
        {
          tipo: "lista",
          items: [
            "Habilidad aprendida: I can ride a bike. / She can sing very well.",
            "Posibilidad general: It can be cold in December here.",
            "Permiso informal: Can I open the window? / You can use my dictionary.",
            "Petición: Can you help me, please?",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Can NUNCA lleva to después: 'I can to swim' es INCORRECTO. La forma correcta es 'I can swim'. Tampoco se conjuga: nunca digas 'She cans speak'. Can no cambia con ningún sujeto. Cannot (una sola palabra) es la forma formal de can't y se usa en escritura académica o formal.",
        },
        {
          tipo: "subtitulo",
          contenido: "Can vs. can't: tabla de habilidades",
        },
        {
          tipo: "parrafo",
          contenido:
            "Practica describiendo habilidades reales: I can cook basic meals, but I can't make sushi. / My friend can speak three languages, but she can't drive. Esta estructura te permite construir frases naturales sobre ti mismo y sobre otras personas de forma inmediata.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tabla de habilidades con columnas Can y Can't, filas con diferentes actividades (swim, cook, drive, sing, play guitar, speak French), con marcas de paloma y cruz",
          caption: "Ejemplo de tabla de habilidades usando can y can't.",
        },
      ],
    },
  },

  // ── 6 ──────────────────────────────────────────────────────────────────────
  {
    slug: "in-ii-comparative-adjectives",
    titulo: "Adjetivos comparativos",
    categoria: "Gramática inglesa",
    conceptos_clave: ["comparativo", "than", "más que", "adjetivo corto", "adjetivo largo"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Los adjetivos comparativos permiten comparar dos personas, cosas o situaciones. En español decimos 'más... que' o 'menos... que', pero en inglés la forma varía según la longitud del adjetivo: los adjetivos cortos añaden -er, mientras que los largos usan more delante.",
        },
        {
          tipo: "subtitulo",
          contenido: "Reglas para formar el comparativo",
        },
        {
          tipo: "lista",
          items: [
            "Adjetivos de una sílaba → añadir -er + than: tall → taller than, fast → faster than, old → older than.",
            "Adjetivos de una sílaba terminados en consonante-vocal-consonante → doblar la consonante final + -er: big → bigger, hot → hotter, thin → thinner.",
            "Adjetivos de dos sílabas terminados en -y → cambiar y por -ier: happy → happier, busy → busier, easy → easier.",
            "Adjetivos de dos o más sílabas → more + adjetivo + than: interesting → more interesting than, beautiful → more beautiful than, expensive → more expensive than.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Comparativos irregulares",
        },
        {
          tipo: "lista",
          items: [
            "good → better than: English is better than I thought.",
            "bad → worse than: Today's weather is worse than yesterday.",
            "far → farther / further than: The school is farther than the park.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Para comparar igualdad usa as + adjetivo + as: My sister is as tall as my mother. Para decir 'no tan... como' usa not as + adjetivo + as: This exercise is not as difficult as the last one.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tabla de tres columnas: adjetivo base, forma comparativa y ejemplo de oración, cubriendo adjetivos cortos, con -y final y largos",
          caption: "Reglas de formación de comparativos con ejemplos.",
        },
      ],
    },
  },

  // ── 7 ──────────────────────────────────────────────────────────────────────
  {
    slug: "in-ii-superlative-adjectives",
    titulo: "Adjetivos superlativos",
    categoria: "Gramática inglesa",
    conceptos_clave: ["superlativo", "the most", "el más", "irregulares"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Los adjetivos superlativos expresan el grado máximo de una cualidad dentro de un grupo. En español decimos 'el más... de' o 'el/la mejor de'. En inglés, la regla es similar a los comparativos: adjetivos cortos añaden -est y adjetivos largos usan the most. Siempre va acompañado del artículo the.",
        },
        {
          tipo: "subtitulo",
          contenido: "Reglas para formar el superlativo",
        },
        {
          tipo: "lista",
          items: [
            "Adjetivos de una sílaba → the + adjetivo + -est: tall → the tallest, fast → the fastest, old → the oldest.",
            "Consonante-vocal-consonante → doblar la consonante + -est: big → the biggest, hot → the hottest.",
            "Adjetivos terminados en -y → the + adjetivo con -iest: happy → the happiest, easy → the easiest.",
            "Adjetivos largos → the most + adjetivo: beautiful → the most beautiful, comfortable → the most comfortable.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Superlativos irregulares",
        },
        {
          tipo: "lista",
          items: [
            "good → the best: She is the best student in the class.",
            "bad → the worst: That was the worst film I've ever seen.",
            "far → the farthest / the furthest: This is the farthest point from the city.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El superlativo siempre lleva THE delante. Nunca digas 'She is most beautiful girl'; la forma correcta es 'She is THE most beautiful girl'. En la comparación de superlativos se usa 'in' con lugares y grupos: the tallest building IN the world / the best student IN the class.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de podio con tres posiciones, mostrando comparativo y superlativo en paralelo: tall — taller — the tallest; intelligent — more intelligent — the most intelligent",
          caption: "Del adjetivo base al comparativo y al superlativo.",
        },
      ],
    },
  },

  // ── 8 ──────────────────────────────────────────────────────────────────────
  {
    slug: "in-ii-countable-uncountable",
    titulo: "Sustantivos contables e incontables",
    categoria: "Gramática inglesa",
    conceptos_clave: ["countable", "uncountable", "a/an", "some/any", "sustantivos"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "En inglés, los sustantivos se dividen en contables (countable nouns) e incontables (uncountable nouns). Esta distinción afecta qué artículos y cuantificadores podemos usar con ellos, por eso es fundamental comprenderla bien desde nivel A1+.",
        },
        {
          tipo: "subtitulo",
          contenido: "Sustantivos contables",
        },
        {
          tipo: "parrafo",
          contenido:
            "Los sustantivos contables son objetos o seres que se pueden contar de forma individual. Tienen forma singular y plural. En singular van con a/an: a book, an apple, a chair. En plural van con some (afirmativo) o any (negativo/interrogativo): some books, any chairs. Ejemplos: apple/apples, car/cars, student/students, idea/ideas.",
        },
        {
          tipo: "subtitulo",
          contenido: "Sustantivos incontables",
        },
        {
          tipo: "parrafo",
          contenido:
            "Los sustantivos incontables no se pueden contar directamente porque son materias, líquidos, conceptos o masas. No tienen plural y nunca van con a/an. Usamos some (afirmativo) o any (negativo/interrogativo). Ejemplos: water, milk, rice, bread, music, information, money, advice, furniture, luggage.",
        },
        {
          tipo: "lista",
          items: [
            "I have some money. (No: 'a money' o 'moneys')",
            "We don't have any water. (No: 'a water')",
            "Can I have some rice, please?",
            "Is there any information about this?",
          ],
        },
        {
          tipo: "callout",
          variante: "advertencia",
          contenido:
            "Palabras problemáticas para hispanohablantes: 'information' es incontable en inglés (a diferencia de 'información' en español). Nunca digas 'an information' o 'informations'. Lo mismo pasa con 'advice' (nunca 'an advice' o 'advices') y 'furniture' (nunca 'a furniture'). Para contar estas cosas usamos frases partitivas: a piece of advice, a piece of information, a piece of furniture.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Dos columnas comparando sustantivos contables e incontables con imágenes representativas, artículos permitidos y ejemplos de oraciones con some y any",
          caption: "Sustantivos contables e incontables: diferencias clave.",
        },
      ],
    },
  },

  // ── 9 ──────────────────────────────────────────────────────────────────────
  {
    slug: "in-ii-how-much-how-many",
    titulo: "How much y how many",
    categoria: "Gramática inglesa",
    conceptos_clave: ["how much", "how many", "cantidad", "contable", "incontable"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "How much y how many son expresiones interrogativas para preguntar por cantidades. La diferencia entre ellas depende directamente del tipo de sustantivo: how many se usa con sustantivos contables y how much con sustantivos incontables. Dominar esta distinción es esencial para hacer preguntas sobre compras, recetas, dinero y cantidades en general.",
        },
        {
          tipo: "subtitulo",
          contenido: "How many — con sustantivos contables",
        },
        {
          tipo: "lista",
          items: [
            "How many students are in your class? — There are 30 students.",
            "How many books do you have? — I have five books.",
            "How many languages can you speak? — I can speak two.",
            "How many apples do we need? — We need six apples.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "How much — con sustantivos incontables",
        },
        {
          tipo: "lista",
          items: [
            "How much water do you drink? — I drink two litres a day.",
            "How much money do you have? — I have 200 pesos.",
            "How much time do we have? — We have 30 minutes.",
            "How much milk is in the fridge? — There is very little milk.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "How much también se usa para preguntar precios en tiendas o mercados: How much is this shirt? / How much are these shoes? Es una frase indispensable para el inglés cotidiano y de viaje. La respuesta típica es: It's 250 pesos. / They're 1,500 pesos.",
        },
        {
          tipo: "subtitulo",
          contenido: "Cuantificadores de cantidad",
        },
        {
          tipo: "parrafo",
          contenido:
            "Para responder a estas preguntas puedes usar: a lot of / lots of (mucho, con ambos tipos), a little (poco, incontable), a few (pocos, contable), not much (no mucho, incontable), not many (no muchos, contable). Ejemplos: I have a lot of friends. / I have a little time. / She has a few dollars.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de flujo: ¿es contable o incontable? → How many / How much, con ejemplos de preguntas y respuestas en cada rama",
          caption: "Flujo de decisión para elegir entre how many y how much.",
        },
      ],
    },
  },

  // ── 10 ─────────────────────────────────────────────────────────────────────
  {
    slug: "in-ii-would-like",
    titulo: "Would like: hacer pedidos y expresar deseos",
    categoria: "Gramática inglesa",
    conceptos_clave: ["would like", "pedidos", "cortesía", "menú", "deseos"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Would like es una expresión de deseo y cortesía equivalente a 'quisiera' o 'me gustaría' en español. Es mucho más educada que want ('querer') y se usa en situaciones formales como restaurantes, tiendas, hoteles y peticiones educadas. Al igual que can, no cambia con ningún pronombre.",
        },
        {
          tipo: "subtitulo",
          contenido: "Estructura de would like",
        },
        {
          tipo: "lista",
          items: [
            "Sujeto + would like + sustantivo: I would like a coffee, please.",
            "Forma contraída: I'd like a coffee, please. (La más común en conversación.)",
            "Sujeto + would like + to + verbo base: I'd like to order now. / She'd like to try the soup.",
            "Pregunta: Would you like + sustantivo/to + verbo? Would you like some water? / Would you like to sit here?",
            "Respuesta: Yes, please. / No, thank you.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Would like vs. like",
        },
        {
          tipo: "parrafo",
          contenido:
            "Like expresa gusto general y permanente: I like pizza (me gusta la pizza en general). Would like expresa un deseo específico en el momento: I'd like a pizza, please (quisiera una pizza ahora). Esta distinción es fundamental: 'I like to travel' (me gusta viajar, en general) vs. 'I'd like to travel to Japan' (me gustaría viajar a Japón, como deseo).",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Would es un verbo modal: nunca añade -s con tercera persona. Nunca digas 'She woulds like' o 'He wills like'. La forma correcta es siempre 'She would like' o 'She'd like'. Tampoco va seguido directamente de un verbo sin to: 'I'd like eat' es INCORRECTO; la forma correcta es 'I'd like to eat'.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diálogo en un restaurante con cliente y mesero, resaltando las frases con would like en azul y las respuestas con Yes, please / No, thank you en verde",
          caption: "Would like en contexto: pedido en un restaurante.",
        },
      ],
    },
  },

  // ── 11 ─────────────────────────────────────────────────────────────────────
  {
    slug: "in-ii-daily-routine-vocabulary",
    titulo: "Vocabulario: rutinas diarias",
    categoria: "Vocabulario",
    conceptos_clave: ["rutina diaria", "verbos de acción", "horarios", "actividades"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Hablar de tu rutina diaria es una de las primeras habilidades comunicativas que se desarrollan en inglés. Para describirla con fluidez necesitas conocer los verbos de acción más comunes, las expresiones de tiempo y las frases para conectar las actividades a lo largo del día.",
        },
        {
          tipo: "subtitulo",
          contenido: "Verbos de rutina esenciales",
        },
        {
          tipo: "lista",
          items: [
            "wake up / get up — despertar / levantarse: I wake up at 6:30.",
            "have breakfast / lunch / dinner — desayunar / comer / cenar: She has breakfast at 7.",
            "get dressed — vestirse: He gets dressed quickly.",
            "brush teeth — cepillarse los dientes: I brush my teeth twice a day.",
            "take a shower / bath — ducharse / bañarse: She takes a shower every morning.",
            "go to school / work — ir a la escuela / al trabajo: They go to school at 7:45.",
            "study / do homework — estudiar / hacer tarea: I study for two hours every evening.",
            "have lunch — tomar el almuerzo: We have lunch at 2 p.m.",
            "watch TV / use the phone — ver la tele / usar el celular: He watches TV after dinner.",
            "go to bed / fall asleep — irse a la cama / quedarse dormido: I go to bed at 10:30.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Expresiones de tiempo para la rutina",
        },
        {
          tipo: "lista",
          items: [
            "in the morning / afternoon / evening / at night",
            "at 7 o'clock / at half past eight / at quarter to nine",
            "before / after + sustantivo: before breakfast, after school",
            "first, then, next, after that, finally (conectores de secuencia)",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "En inglés se usa wake up para 'despertar' (dejar de dormir) y get up para 'levantarse' (salir de la cama). Pueden ocurrir al mismo tiempo o con minutos de diferencia: I wake up at 6 but I don't get up until 6:30. Este matiz es muy natural en conversación.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Línea de tiempo de un día típico desde las 6 a.m. hasta las 11 p.m. con iconos de cada actividad de la rutina y su expresión en inglés",
          caption: "Rutina diaria: vocabulario clave de la mañana a la noche.",
        },
      ],
    },
  },

  // ── 12 ─────────────────────────────────────────────────────────────────────
  {
    slug: "in-ii-free-time-activities",
    titulo: "Vocabulario: actividades de tiempo libre",
    categoria: "Vocabulario",
    conceptos_clave: ["tiempo libre", "hobbies", "deportes", "actividades de ocio"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Hablar de hobbies y actividades de tiempo libre es fundamental para las conversaciones informales en inglés. Este vocabulario te permitirá responder preguntas como 'What do you do in your free time?' o 'What do you like doing on weekends?' de forma natural y variada.",
        },
        {
          tipo: "subtitulo",
          contenido: "Actividades de interior",
        },
        {
          tipo: "lista",
          items: [
            "watch TV / films / series — ver televisión / películas / series",
            "play video games — jugar videojuegos",
            "read books / comics — leer libros / cómics",
            "listen to music / podcasts — escuchar música / podcasts",
            "cook / bake — cocinar / hornear",
            "draw / paint — dibujar / pintar",
            "play an instrument — tocar un instrumento",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Actividades de exterior",
        },
        {
          tipo: "lista",
          items: [
            "play football / basketball / tennis — jugar futbol / basquetbol / tenis",
            "go swimming / cycling / running — ir a nadar / andar en bici / correr",
            "go to the gym — ir al gimnasio",
            "hang out with friends — pasar el tiempo con amigos",
            "go shopping — ir de compras",
            "go to the cinema / concerts — ir al cine / a conciertos",
            "travel — viajar",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "En inglés hay una diferencia importante: usamos PLAY con deportes de equipo y juegos (play football, play chess), GO con actividades que terminan en -ing (go swimming, go shopping, go running) y DO con actividades individuales o de artes marciales (do yoga, do karate, do homework). Mezclarlas es un error muy común.",
        },
        {
          tipo: "subtitulo",
          contenido: "Frases útiles para hablar de hobbies",
        },
        {
          tipo: "lista",
          items: [
            "I love / really like / enjoy + verbo-ing: I love reading. / I enjoy cooking.",
            "I'm interested in + verbo-ing / sustantivo: I'm interested in photography.",
            "I'm not really into + verbo-ing: I'm not really into sports.",
            "I spend my free time + verbo-ing: I spend my free time drawing.",
          ],
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Cuadrícula de iconos de actividades de tiempo libre con su nombre en inglés, agrupadas en interior, exterior y deportes",
          caption: "Vocabulario de actividades de tiempo libre: play, go y do.",
        },
      ],
    },
  },

  // ── 13 ─────────────────────────────────────────────────────────────────────
  {
    slug: "in-ii-clothes-and-appearance",
    titulo: "Vocabulario: ropa y apariencia física",
    categoria: "Vocabulario",
    conceptos_clave: ["ropa", "apariencia", "descripción", "colores", "tallas"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Describir la ropa y la apariencia física de las personas es una habilidad comunicativa clave en inglés A1+. Este vocabulario es útil para describir a alguien que buscas, hablar de estilo personal, hacer compras o simplemente participar en conversaciones cotidianas.",
        },
        {
          tipo: "subtitulo",
          contenido: "Prendas de ropa básicas",
        },
        {
          tipo: "lista",
          items: [
            "shirt (camisa), t-shirt (camiseta), blouse (blusa)",
            "trousers / pants (pantalones), jeans (mezclilla), shorts (shorts)",
            "dress (vestido), skirt (falda), suit (traje)",
            "jacket (chamarra/saco), coat (abrigo), hoodie (sudadera con capucha)",
            "shoes (zapatos), boots (botas), trainers / sneakers (tenis)",
            "socks (calcetines), hat (sombrero/gorra), scarf (bufanda), gloves (guantes)",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Descripción física: cabello y altura",
        },
        {
          tipo: "lista",
          items: [
            "Altura: tall (alto), short (bajo), medium height (estatura media)",
            "Peso: slim / thin (delgado), well-built (fornido), overweight (con sobrepeso)",
            "Cabello: long / short / medium-length hair; straight / wavy / curly hair; blonde / brown / black / red / grey hair; bald (calvo)",
            "Ojos: blue / green / brown / dark eyes",
            "Rasgos: beard (barba), moustache (bigote), freckles (pecas), glasses (lentes)",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "En inglés, el orden de los adjetivos al describir ropa es: opinión → tamaño → color → material → tipo. Ejemplo: 'a beautiful long red silk dress'. En la práctica cotidiana rara vez usamos más de dos o tres adjetivos juntos, pero conocer el orden evita construir frases que suenen extrañas.",
        },
        {
          tipo: "subtitulo",
          contenido: "Frases para describir ropa",
        },
        {
          tipo: "lista",
          items: [
            "She's wearing a blue dress and black boots.",
            "He has short dark hair and he's wearing glasses.",
            "They're dressed in school uniforms.",
            "I usually wear casual clothes: jeans and a t-shirt.",
          ],
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Figura humana con flechas apuntando a cada prenda de ropa con su nombre en inglés; a su lado, una tabla de vocabulario de descripción física",
          caption: "Vocabulario de ropa y descripción física en inglés.",
        },
      ],
    },
  },

  // ── 14 ─────────────────────────────────────────────────────────────────────
  {
    slug: "in-ii-weather-and-climate",
    titulo: "Vocabulario: el tiempo atmosférico y el clima",
    categoria: "Vocabulario",
    conceptos_clave: ["weather", "climate", "temperatura", "estaciones", "condiciones"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Hablar del tiempo es uno de los temas de conversación más comunes en los países angloparlantes, especialmente en el Reino Unido. Conocer el vocabulario del tiempo atmosférico te permitirá entender pronósticos, describir el clima de tu ciudad y participar en conversaciones informales de manera natural.",
        },
        {
          tipo: "subtitulo",
          contenido: "Condiciones atmosféricas",
        },
        {
          tipo: "lista",
          items: [
            "sunny (soleado): It's sunny today. / The sun is shining.",
            "cloudy (nublado): It's cloudy this morning.",
            "rainy / it's raining (lluvioso / está lloviendo): Take an umbrella, it's raining.",
            "windy (ventoso): It's very windy outside.",
            "foggy (con niebla): Be careful, it's foggy on the road.",
            "snowy / it's snowing (nevado / está nevando): It's snowing in the mountains.",
            "stormy (tormentoso): There's a storm tonight.",
            "humid (húmedo): Mexico City can be very humid in the summer.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Temperatura",
        },
        {
          tipo: "lista",
          items: [
            "hot (caliente/caluroso): It's very hot in summer — over 35°C.",
            "warm (templado/cálido): It's warm in spring — around 22°C.",
            "cool / mild (fresco/moderado): October is cool and pleasant.",
            "cold (frío): It's cold in December — below 10°C.",
            "freezing (helado): It's freezing! — below 0°C.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "En inglés usamos el verbo BE para describir el tiempo, no el verbo HAVE como en algunos dialectos del español. Di siempre 'It's hot' (Hace calor), nunca 'It has hot'. La estructura correcta es: It + be + adjetivo: It's cold. / It's sunny. / It's windy. También puedes decir: There's + sustantivo: There's a storm. / There's a lot of rain.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Iconos de condiciones climáticas (sol, nube, lluvia, nieve, viento, tormenta) con su nombre en inglés y una oración de ejemplo debajo de cada uno",
          caption: "Vocabulario del tiempo atmosférico con ejemplos.",
        },
      ],
    },
  },

  // ── 15 ─────────────────────────────────────────────────────────────────────
  {
    slug: "in-ii-places-in-town",
    titulo: "Vocabulario: lugares en la ciudad",
    categoria: "Vocabulario",
    conceptos_clave: ["lugares", "ciudad", "preposiciones de lugar", "edificios", "servicios"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Conocer el vocabulario de los lugares en la ciudad te permite preguntar y dar instrucciones, describir tu vecindario y entender indicaciones. Este vocabulario se usa constantemente en situaciones cotidianas reales: ir al médico, al banco, a la tienda o al parque.",
        },
        {
          tipo: "subtitulo",
          contenido: "Lugares esenciales",
        },
        {
          tipo: "lista",
          items: [
            "school / university — escuela / universidad",
            "hospital / clinic / pharmacy — hospital / clínica / farmacia",
            "supermarket / grocery store — supermercado / tienda de abarrotes",
            "bank / ATM — banco / cajero automático",
            "post office — oficina de correos",
            "restaurant / café / bakery — restaurante / cafetería / panadería",
            "cinema / theatre / museum — cine / teatro / museo",
            "park / sports centre — parque / centro deportivo",
            "bus stop / train station / airport — parada de autobús / estación de tren / aeropuerto",
            "church / market / town hall — iglesia / mercado / palacio municipal",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Preposiciones de lugar",
        },
        {
          tipo: "lista",
          items: [
            "next to (al lado de): The pharmacy is next to the bank.",
            "opposite / across from (enfrente de): The park is opposite the school.",
            "between (entre): The café is between the cinema and the library.",
            "on the corner of (en la esquina de): The bank is on the corner of Main Street.",
            "near / close to (cerca de): Is there a pharmacy near here?",
            "far from (lejos de): The airport is far from the city centre.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Cuando preguntas por un lugar en inglés puedes decir: Excuse me, where is the nearest bank? / Is there a supermarket near here? / How do I get to the train station? Estas frases son muy útiles al viajar a países angloparlantes y forman la base de la ficha sobre dar direcciones.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mapa sencillo de una ciudad con los principales edificios etiquetados en inglés y flechas de preposiciones de lugar",
          caption: "Mapa de vocabulario: lugares en la ciudad y preposiciones de lugar.",
        },
      ],
    },
  },

  // ── 16 ─────────────────────────────────────────────────────────────────────
  {
    slug: "in-ii-asking-questions-do-does",
    titulo: "Hacer y responder preguntas con do / does",
    categoria: "Habilidades comunicativas",
    conceptos_clave: ["preguntas", "do", "does", "respuestas cortas", "Yes/No"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Hacer preguntas de sí/no (Yes/No questions) y preguntas con partícula interrogativa (Wh- questions) en Present Simple requiere usar el auxiliar do o does. Esta estructura es diferente al español, donde simplemente se cambia la entonación. En inglés, el auxiliar es obligatorio y el orden de las palabras cambia.",
        },
        {
          tipo: "subtitulo",
          contenido: "Yes/No questions",
        },
        {
          tipo: "lista",
          items: [
            "Do / Does + sujeto + verbo base?",
            "Do you like English? — Yes, I do. / No, I don't.",
            "Does she work here? — Yes, she does. / No, she doesn't.",
            "Do they have a car? — Yes, they do. / No, they don't.",
            "Does he speak French? — Yes, he does. / No, he doesn't.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Wh- questions (preguntas con partícula)",
        },
        {
          tipo: "lista",
          items: [
            "What do you do? (¿A qué te dedicas? / ¿Qué haces?)",
            "Where does she live? (¿Dónde vive ella?)",
            "When do they eat lunch? (¿Cuándo almuerzan?)",
            "How often do you exercise? (¿Con qué frecuencia ejercitas?)",
            "Why does he study so late? (¿Por qué estudia tan tarde él?)",
            "Who do you live with? (¿Con quién vives?)",
          ],
        },
        {
          tipo: "callout",
          variante: "advertencia",
          contenido:
            "Error gravísimo y muy común: NO uses do/does cuando el sujeto de la pregunta ES el verbo mismo. 'Who lives here?' (no 'Who does live here?'). Cuando el pronombre interrogativo (who, what) es el sujeto de la oración, no se usa auxiliar: 'Who speaks English in your family?' Sin embargo, cuando el pronombre interrogativo es el objeto, sí se usa auxiliar: 'Who do you speak to?'.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de estructura de dos tipos de preguntas: Yes/No questions y Wh-questions, con el orden de palabras indicado con flechas de color",
          caption: "Estructura de preguntas con do/does en Present Simple.",
        },
      ],
    },
  },

  // ── 17 ─────────────────────────────────────────────────────────────────────
  {
    slug: "in-ii-giving-directions",
    titulo: "Dar y seguir instrucciones: cómo llegar a un lugar",
    categoria: "Habilidades comunicativas",
    conceptos_clave: ["direcciones", "imperativo", "turn left", "go straight", "preposiciones"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Dar y seguir direcciones es una habilidad comunicativa práctica que necesitarás tanto en países angloparlantes como al interactuar con turistas. Para dar instrucciones en inglés se usa el modo imperativo del verbo, que equivale a la forma base sin sujeto.",
        },
        {
          tipo: "subtitulo",
          contenido: "Frases clave para dar direcciones",
        },
        {
          tipo: "lista",
          items: [
            "Go straight ahead / straight on. — Sigue recto.",
            "Turn left / right. — Dobla a la izquierda / derecha.",
            "Take the first / second street on the left / right. — Toma la primera / segunda calle a la izquierda / derecha.",
            "Go past the... — Pasa el/la...: Go past the pharmacy.",
            "Cross the street / bridge. — Cruza la calle / el puente.",
            "It's on your left / right. — Está a tu izquierda / derecha.",
            "It's on the corner of... — Está en la esquina de...",
            "It's next to / opposite the... — Está al lado de / enfrente del...",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Pedir direcciones",
        },
        {
          tipo: "lista",
          items: [
            "Excuse me, how do I get to the train station?",
            "Excuse me, where is the nearest bank?",
            "Is there a pharmacy near here?",
            "Could you tell me the way to the hospital?",
            "How far is it? — Is it far? / It's about five minutes on foot.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Siempre empieza con 'Excuse me' al pedirle indicaciones a un desconocido. Es la forma educada de llamar la atención de alguien en inglés. También es muy útil preguntar '¿Can you show me on the map?' si llevas un mapa o teléfono. Y si no entendiste, no dudes en decir: 'I'm sorry, could you repeat that more slowly, please?'",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mapa de cuadrícula simple de calles con flechas de dirección y etiquetas con las frases: go straight, turn left, turn right, take the second street on the right",
          caption: "Vocabulario para dar y seguir direcciones en inglés.",
        },
      ],
    },
  },

  // ── 18 ─────────────────────────────────────────────────────────────────────
  {
    slug: "in-ii-describing-people",
    titulo: "Describir personas: físico y personalidad",
    categoria: "Habilidades comunicativas",
    conceptos_clave: ["descripción", "personalidad", "adjetivos", "aspecto físico"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Describir personas es una de las habilidades comunicativas más frecuentes en inglés: para presentar a un amigo, buscar a alguien en un lugar público, escribir sobre un personaje o hablar de personas famosas. La descripción incluye dos dimensiones: la apariencia física y la personalidad.",
        },
        {
          tipo: "subtitulo",
          contenido: "Apariencia física: estructura",
        },
        {
          tipo: "parrafo",
          contenido:
            "Para describir la apariencia usamos el verbo be (para características permanentes) y have got / have (para rasgos físicos). She is tall and slim. / He has short dark hair and brown eyes. También se usa look + adjetivo para impresión visual: He looks young for his age.",
        },
        {
          tipo: "lista",
          items: [
            "She is medium height with long curly red hair.",
            "He has dark skin, black hair and is well-built.",
            "She looks about 30 years old.",
            "He is wearing a grey jacket and blue jeans.",
            "She has a friendly smile and brown eyes.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Vocabulario de personalidad",
        },
        {
          tipo: "lista",
          items: [
            "friendly / sociable (amigable / sociable) ↔ shy (tímido)",
            "hardworking (trabajador) ↔ lazy (flojo)",
            "generous (generoso) ↔ selfish (egoísta)",
            "funny / humorous (gracioso) ↔ serious (serio)",
            "patient (paciente) ↔ impatient (impaciente)",
            "honest (honesto) ↔ dishonest (deshonesto)",
            "confident (seguro de sí mismo) ↔ insecure (inseguro)",
            "creative (creativo), intelligent (inteligente), reliable (confiable)",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Cuando describas la personalidad de alguien, usa frases con exemplos para sonar más natural: 'She is very generous — she always helps her friends.' / 'He's a bit shy at first, but he's really funny when you get to know him.' Las afirmaciones absolutas como 'He is always lazy' suenan duras; añadir matices (a bit, quite, very, sometimes) hace la descripción más realista.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Dos figuras con descripción de apariencia física a la izquierda y adjetivos de personalidad a la derecha, organizados en pares de opuestos",
          caption: "Vocabulario para describir apariencia física y personalidad.",
        },
      ],
    },
  },

  // ── 19 ─────────────────────────────────────────────────────────────────────
  {
    slug: "in-ii-english-speaking-cultures",
    titulo: "Los países angloparlantes: una visión general",
    categoria: "Cultura angloparlante",
    conceptos_clave: ["países angloparlantes", "Commonwealth", "variantes del inglés", "cultura"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El inglés es el idioma oficial o co-oficial de más de 50 países y lo hablan como primera o segunda lengua más de 1,500 millones de personas en el mundo. No existe un solo 'inglés': hay variantes nacionales con diferencias en vocabulario, pronunciación y, en menor medida, gramática. Conocer estas variantes es parte fundamental de la competencia cultural en inglés.",
        },
        {
          tipo: "subtitulo",
          contenido: "Los cinco grandes países angloparlantes nativos",
        },
        {
          tipo: "lista",
          items: [
            "Reino Unido (UK): Inglaterra, Escocia, Gales e Irlanda del Norte. Origen histórico del inglés moderno. British English es el estándar de referencia para muchos diccionarios.",
            "Estados Unidos (USA): El país con más hablantes nativos de inglés. American English tiene diferencias notables de ortografía (colour → color), vocabulario (lift → elevator) y pronunciación.",
            "Canadá: Mezcla de influencias británica y estadounidense, con una fuerte comunidad francófona en Québec.",
            "Australia: El inglés australiano tiene slang propio muy colorido y una entonación característica.",
            "Nueva Zelanda: Similar al inglés australiano pero con influencias del maorí en el vocabulario.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Inglés como lingua franca",
        },
        {
          tipo: "parrafo",
          contenido:
            "Hoy en día, la mayoría de las interacciones en inglés ocurren entre hablantes no nativos: en negocios internacionales, conferencias académicas, turismo y diplomacia. El inglés es la lingua franca del mundo globalizado. Esto significa que la meta no es sonar exactamente como un hablante de Londres o Nueva York, sino comunicarse con claridad y confianza.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Diferencias léxicas entre inglés británico y americano que debes conocer: lift (UK) / elevator (US); flat (UK) / apartment (US); biscuit (UK) / cookie (US); queue (UK) / line (US); rubbish (UK) / garbage/trash (US); holiday (UK) / vacation (US). Ninguna variante es 'mejor': ambas son igualmente válidas.",
        },
        {
          tipo: "cita",
          contenido:
            "England and America are two countries separated by the same language.",
          fuente: "Atribuida a George Bernard Shaw, dramaturgo irlandés",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mapa mundial con los países angloparlantes resaltados en azul: UK, USA, Canadá, Australia, Nueva Zelanda, Irlanda, Sudáfrica y otros, con el número de hablantes nativos de cada uno",
          caption: "Los países angloparlantes en el mundo.",
        },
      ],
    },
  },

  // ── 20 ─────────────────────────────────────────────────────────────────────
  {
    slug: "in-ii-language-learning-strategies",
    titulo: "Estrategias para aprender inglés en nivel A1+",
    categoria: "Estrategias de aprendizaje",
    conceptos_clave: ["estrategias", "input comprensible", "repetición espaciada", "A1+", "autonomía"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Aprender un idioma es un proceso que requiere tiempo, consistencia y estrategia. Los estudiantes de nivel A1+ ya tienen una base del idioma y el reto ahora es consolidarla y expandirla hacia el nivel A2. La buena noticia es que la investigación en adquisición de lenguas ha identificado estrategias específicas que aceleran el aprendizaje de manera significativa.",
        },
        {
          tipo: "subtitulo",
          contenido: "Input comprensible: la clave del avance",
        },
        {
          tipo: "parrafo",
          contenido:
            "El lingüista Stephen Krashen propuso que aprendemos idiomas cuando recibimos 'input comprensible': material en inglés que entendemos casi todo, pero que contiene algo nuevo. En A1+, esto significa escuchar y leer cosas que están un poco por encima de tu nivel actual. Canales de YouTube para principiantes, cuentos ilustrados en inglés, podcasts lentos y series con subtítulos en inglés son fuentes excelentes.",
        },
        {
          tipo: "subtitulo",
          contenido: "Estrategias probadas para nivel A1+",
        },
        {
          tipo: "lista",
          items: [
            "Repetición espaciada (spaced repetition): en lugar de estudiar mucho un día y olvidarlo, repasa el vocabulario en intervalos crecientes. Aplicaciones como Anki o Duolingo usan este principio.",
            "Rutina de práctica diaria: 20 minutos diarios es más efectivo que 3 horas el fin de semana. La consistencia supera a la intensidad.",
            "Llevar un cuaderno de vocabulario: organiza las palabras nuevas por tema, no por orden alfabético. Incluye la pronunciación, un ejemplo y un dibujo si ayuda.",
            "Hablar en voz alta: practica en solitario. Describe tu rutina, tu habitación, tus hobbies. No importa si no hay nadie escuchando: el acto de producir el idioma activa la memoria de manera diferente a solo leer.",
            "Ver series y películas: empieza con subtítulos en español, luego en inglés, luego sin subtítulos. El objetivo final es escuchar sin apoyo visual.",
            "Usar el error como información: cuando te equivocas, pregunta '¿por qué es incorrecto?' y anótalo. Los errores son datos valiosos, no fracasos.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El mayor obstáculo para muchos estudiantes de idiomas no es la gramática ni el vocabulario: es el miedo a cometer errores. Los estudios muestran que las personas que aceptan el error y siguen hablando progresan hasta cuatro veces más rápido que quienes esperan dominar las reglas antes de hablar. La fluidez llega USANDO el idioma, no memorizando reglas.",
        },
        {
          tipo: "subtitulo",
          contenido: "Usar un diccionario bilingüe de manera efectiva",
        },
        {
          tipo: "parrafo",
          contenido:
            "El diccionario es una herramienta, no un sustituto del aprendizaje. Cuando busques una palabra: 1) Lee TODOS los significados, no solo el primero. 2) Presta atención a si es verbo, sustantivo o adjetivo. 3) Lee los ejemplos de uso. 4) Busca si tiene formas irregulares. 5) Anótala en contexto, no aislada. Diccionarios recomendados para A1+: WordReference (en línea, gratuito), Cambridge Learner's Dictionary, Merriam-Webster Learner's Dictionary.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Infografía con los seis pasos de una rutina de estudio efectiva para inglés A1+: input, vocabulario, escritura, habla, escucha y revisión, organizados en un ciclo",
          caption: "Rutina de estudio efectiva para consolidar el nivel A1+.",
        },
      ],
    },
  },
] as const;

// ---------------------------------------------------------------------------
// FUNCIÓN PRINCIPAL
// ---------------------------------------------------------------------------

export async function seedBibliotecaINII(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed Biblioteca IN-II (20 fichas)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", "IN-II")
    .single();

  if (uacErr || !uacRow) {
    throw new Error(
      `UAC IN-II no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`
    );
  }

  const rows = FICHAS_INII.map((f, i) => ({
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

  if (error) throw new Error(`Error seeding fichas IN-II: ${error.message}`);

  console.log(`  ✓ ${rows.length} fichas de biblioteca de IN-II insertadas/actualizadas.`);
  console.log("\n✅ Seed Biblioteca IN-II completado.\n");
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
  seedBibliotecaINII(sb).catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
}

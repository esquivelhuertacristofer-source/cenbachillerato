/**
 * Seed script — Biblioteca LC Inglés I (IN-I)
 * Ejecutar: npx ts-node scripts/seed-biblioteca-ini.ts
 * Requiere: 05_biblioteca.sql ejecutada en Supabase
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const UAC_CODIGO = "IN-I";

const FICHAS = [
  {
    slug: "in-i-greetings-and-introductions",
    titulo: "Greetings and Introductions",
    categoria: "Speaking & Listening",
    tiempo_lectura_minutos: 5,
    conceptos_clave: ["greetings", "introductions", "formal vs informal"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "Los saludos son la puerta de entrada a cualquier conversación en inglés. Dominarlos correctamente te permitirá comunicarte con confianza en contextos formales e informales. En inglés, existen dos grandes registros: el formal (usado en entornos profesionales y académicos) y el informal (usado con amigos y personas de tu edad)." },
        { tipo: "subtitulo", contenido: "Formal Greetings" },
        { tipo: "lista", items: ["Good morning / Good afternoon / Good evening", "How do you do? (very formal, rarely used today)", "It's a pleasure to meet you.", "Allow me to introduce myself, my name is..."] },
        { tipo: "subtitulo", contenido: "Informal Greetings" },
        { tipo: "lista", items: ["Hi! / Hey!", "What's up?", "How are you doing?", "Nice to meet you!"] },
        { tipo: "callout", variante: "importante", contenido: "En inglés, 'How are you?' es una pregunta de saludo, no una pregunta real sobre tu salud. La respuesta estándar es 'Fine, thanks. And you?' o simplemente 'Good, thanks!'" },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Dos personas saludándose, una en contexto formal (oficina) y otra informal (parque)", caption: "El contexto determina el tipo de saludo apropiado." },
        { tipo: "parrafo", contenido: "Cuando te presentas, es importante decir tu nombre claramente. Puedes usar: 'My name is [nombre]' (formal) o 'I'm [nombre]' (informal). Después de presentarte, es común preguntar por el nombre de la otra persona: 'What's your name?' o 'And you are...?'" },
        { tipo: "callout", variante: "sabias", contenido: "En países angloparlantes, es común usar solo el primer nombre incluso en contextos semi-formales. Sin embargo, con personas mayores o en reuniones de negocios, usa Mr./Ms. + apellido hasta que te indiquen lo contrario." },
      ],
    },
  },
  {
    slug: "in-i-verb-to-be",
    titulo: "The Verb 'To Be': Affirmative, Negative and Questions",
    categoria: "Grammar",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["verb to be", "am/is/are", "contractions", "questions"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "El verbo 'to be' (ser/estar) es el verbo más importante del inglés. A diferencia del español, en inglés SIEMPRE se debe incluir el sujeto con el verbo. No se puede omitir como en 'Soy estudiante' — en inglés debes decir 'I am a student'." },
        { tipo: "subtitulo", contenido: "Formas afirmativas" },
        { tipo: "lista", items: ["I am (I'm) — yo soy/estoy", "You are (You're) — tú eres/estás", "He/She/It is (He's/She's/It's) — él/ella es/está", "We/You/They are (We're/You're/They're) — somos/son/están"] },
        { tipo: "subtitulo", contenido: "Formas negativas" },
        { tipo: "lista", items: ["I am not (I'm not)", "You are not (You aren't / You're not)", "He/She is not (He/She isn't / He's/She's not)", "We/They are not (aren't / We're/They're not)"] },
        { tipo: "callout", variante: "importante", contenido: "En inglés siempre usamos contracciones en el habla cotidiana. Decir 'I am not a teacher' suena muy formal. Lo natural es 'I'm not a teacher'." },
        { tipo: "subtitulo", contenido: "Preguntas con To Be" },
        { tipo: "parrafo", contenido: "Para hacer preguntas, el verbo 'to be' va al inicio de la oración: 'Are you a student?' — 'Is she from Mexico?' — 'Am I right?' Las respuestas cortas son: 'Yes, I am.' / 'No, I'm not.' / 'Yes, she is.' / 'No, she isn't.'" },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Tabla visual con las conjugaciones del verbo to be en afirmativo, negativo e interrogativo, con ejemplos en español y en inglés", caption: "Tabla de conjugación del verbo 'to be'." },
        { tipo: "callout", variante: "sabias", contenido: "El verbo 'to be' en inglés equivale a AMBOS verbos 'ser' y 'estar' del español. El contexto determina cuál se usa en la traducción: 'I am happy' = Estoy feliz (estado). 'I am Mexican' = Soy mexicano (característica)." },
      ],
    },
  },
  {
    slug: "in-i-numbers-and-dates",
    titulo: "Numbers, Dates and Time",
    categoria: "Vocabulary",
    tiempo_lectura_minutos: 5,
    conceptos_clave: ["cardinal numbers", "ordinal numbers", "dates", "time expressions"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "Los números son fundamentales en cualquier idioma. En inglés, los números del 1 al 12 son únicos (one, two, three... twelve). Del 13 al 19 terminan en '-teen' (thirteen, fourteen...), y los múltiplos de 10 terminan en '-ty' (twenty, thirty, forty...)." },
        { tipo: "callout", variante: "importante", contenido: "Atención: 'fifteen' (15), 'eighteen' (18) y 'forty' (40) son irregulares. No digas 'fiveteen', 'eighteeen' o 'fourty'." },
        { tipo: "subtitulo", contenido: "Ordinal Numbers (para fechas)" },
        { tipo: "lista", items: ["1st — first", "2nd — second", "3rd — third", "4th — fourth", "5th — fifth (irregular)", "8th — eighth (irregular)", "9th — ninth (irregular)", "12th — twelfth (irregular)"] },
        { tipo: "subtitulo", contenido: "Cómo decir la fecha en inglés" },
        { tipo: "parrafo", contenido: "En inglés americano el orden es mes-día-año: 'May 18th, 2026' o '05/18/2026'. En inglés británico el orden es día-mes-año: '18th May 2026' o '18/05/2026'. Cuando hables de fechas, siempre usa los números ordinales: 'Today is the eighteenth of May'." },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Calendario con fechas marcadas y su pronunciación en inglés, comparando el formato americano y el británico", caption: "Diferencias entre el inglés americano y el británico al expresar fechas." },
      ],
    },
  },
  {
    slug: "in-i-present-simple",
    titulo: "Present Simple: Daily Routines",
    categoria: "Grammar",
    tiempo_lectura_minutos: 7,
    conceptos_clave: ["present simple", "third person -s", "adverbs of frequency", "daily routines"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "El presente simple (Present Simple) se usa para hablar de hábitos, rutinas diarias, verdades generales y situaciones permanentes. Es el tiempo verbal más usado en inglés y dominar su estructura te dará una base sólida para comunicarte." },
        { tipo: "subtitulo", contenido: "Estructura del Present Simple" },
        { tipo: "lista", items: ["Afirmativo: Subject + verb (base form)", "Negativo: Subject + don't/doesn't + verb", "Interrogativo: Do/Does + subject + verb?"] },
        { tipo: "callout", variante: "importante", contenido: "En tercera persona singular (he, she, it), el verbo lleva '-s' o '-es' al final: 'She works every day'. En negativo e interrogativo, 'does' ya lleva el -s, así que el verbo vuelve a su forma base: 'She doesn't work on Sundays'." },
        { tipo: "subtitulo", contenido: "Adverbios de frecuencia" },
        { tipo: "lista", items: ["Always (100%) — siempre", "Usually/Normally (80%) — normalmente", "Often (60%) — frecuentemente", "Sometimes (40%) — a veces", "Rarely/Seldom (20%) — raramente", "Never (0%) — nunca"] },
        { tipo: "parrafo", contenido: "Los adverbios de frecuencia van ANTES del verbo principal, pero DESPUÉS del verbo 'to be': 'I always eat breakfast' / 'She is never late'. Usarlos correctamente hará que tu inglés suene más natural." },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Infografía de una rutina diaria típica de un estudiante mexicano con los verbos en inglés: wake up, have breakfast, go to school, study, sleep", caption: "Vocabulario de rutinas diarias en inglés." },
      ],
    },
  },
  {
    slug: "in-i-question-words",
    titulo: "Question Words: Who, What, Where, When, Why, How",
    categoria: "Grammar",
    tiempo_lectura_minutos: 5,
    conceptos_clave: ["wh-questions", "question words", "interrogative sentences"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "Las palabras interrogativas (question words o Wh-words) son esenciales para hacer preguntas concretas en inglés. A diferencia del español, en inglés no se invierten los signos de interrogación — solo hay un signo al final (?)." },
        { tipo: "subtitulo", contenido: "Las seis palabras clave" },
        { tipo: "lista", items: ["WHO — ¿Quién? / ¿A quién? (personas)", "WHAT — ¿Qué? (cosas, acciones)", "WHERE — ¿Dónde? / ¿A dónde? (lugar)", "WHEN — ¿Cuándo? (tiempo)", "WHY — ¿Por qué? (razón) → Respuesta con 'Because...'", "HOW — ¿Cómo? (manera, estado)"] },
        { tipo: "callout", variante: "sabias", contenido: "HOW se combina con adjetivos para hacer más preguntas: 'How old are you?' (¿Cuántos años tienes?), 'How much does it cost?' (¿Cuánto cuesta?), 'How many people are there?' (¿Cuántas personas hay?)" },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Mapa mental con las seis palabras interrogativas en inglés, su significado en español y un ejemplo de pregunta para cada una", caption: "Las seis Wh-questions del inglés." },
        { tipo: "callout", variante: "importante", contenido: "La estructura es: Question Word + Auxiliary (do/does/is/are) + Subject + Main Verb. Ejemplo: 'Where do you live?' / 'What is your name?'" },
      ],
    },
  },
  {
    slug: "in-i-adjectives-describing",
    titulo: "Adjectives: Describing People and Things",
    categoria: "Vocabulary",
    tiempo_lectura_minutos: 5,
    conceptos_clave: ["adjectives", "physical description", "personality", "word order"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "Los adjetivos en inglés siempre van ANTES del sustantivo (al contrario del español). Decimos 'a beautiful city' (una ciudad hermosa), no 'a city beautiful'. Esta es una diferencia estructural importante entre ambos idiomas." },
        { tipo: "subtitulo", contenido: "Descripción física" },
        { tipo: "lista", items: ["Tall / Short — alto / bajo", "Thin / Heavy — delgado / pesado", "Young / Old — joven / viejo", "Beautiful / Handsome / Pretty — hermosa / guapo / bonita", "Blonde / Brunette / Redhead — rubio/a / moreno/a / pelirrojo/a", "Long hair / Short hair / Curly hair — pelo largo / corto / rizado"] },
        { tipo: "subtitulo", contenido: "Descripción de personalidad" },
        { tipo: "lista", items: ["Friendly / Unfriendly — amable / antipático/a", "Funny / Serious — gracioso/a / serio/a", "Hardworking / Lazy — trabajador/a / flojo/a", "Smart / Intelligent — listo/a / inteligente", "Shy / Outgoing — tímido/a / extrovertido/a"] },
        { tipo: "callout", variante: "sabias", contenido: "Los adjetivos en inglés NO cambian según el género o el número. 'A tall boy' y 'two tall girls' — 'tall' siempre es igual. Esto es mucho más simple que el español." },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Ilustraciones de diferentes personas con adjetivos descriptivos en inglés señalando características físicas y de personalidad", caption: "Adjetivos para describir personas en inglés." },
      ],
    },
  },
  {
    slug: "in-i-there-is-there-are",
    titulo: "There Is / There Are: Describing Places",
    categoria: "Grammar",
    tiempo_lectura_minutos: 4,
    conceptos_clave: ["there is", "there are", "prepositions of place", "describing places"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "'There is' y 'There are' se usan para indicar la existencia o presencia de algo en un lugar. En español equivalen a 'hay'. La diferencia es que 'there is' se usa con sustantivos singulares o incontables, y 'there are' con plurales." },
        { tipo: "lista", items: ["There is a book on the table. (Hay un libro en la mesa.)", "There are three students in the classroom. (Hay tres estudiantes en el aula.)", "There is some water in the bottle. (Hay agua en la botella.)"] },
        { tipo: "callout", variante: "importante", contenido: "Para hacer preguntas: 'Is there a...?' / 'Are there any...?' Para negativo: 'There isn't a...' / 'There aren't any...'" },
        { tipo: "subtitulo", contenido: "Preposiciones de lugar" },
        { tipo: "lista", items: ["In — dentro de (in the box)", "On — sobre/encima de (on the table)", "Under — debajo de (under the chair)", "Next to / Beside — al lado de", "Between — entre (dos cosas)", "In front of — frente a", "Behind — detrás de"] },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Ilustración de una habitación con objetos y flechas señalando las preposiciones de lugar in, on, under, next to, between, in front of, behind", caption: "Preposiciones de lugar en inglés." },
      ],
    },
  },
  {
    slug: "in-i-can-cant-ability",
    titulo: "Can / Can't: Talking About Ability",
    categoria: "Grammar",
    tiempo_lectura_minutos: 4,
    conceptos_clave: ["modal verb can", "ability", "permission", "can/can't"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "'Can' es un verbo modal que expresa habilidad (poder hacer algo), posibilidad o permiso. Es uno de los verbos más frecuentes en el inglés cotidiano. La buena noticia: 'can' es igual para todas las personas (no lleva -s en tercera persona)." },
        { tipo: "lista", items: ["I can swim. (Sé nadar.)", "She can speak French. (Ella sabe hablar francés.)", "We can't drive. (No sabemos manejar.)", "Can you help me? (¿Puedes ayudarme?)"] },
        { tipo: "callout", variante: "importante", contenido: "Después de 'can' siempre va el verbo en su forma base (infinitivo sin 'to'). NUNCA se dice 'She can to swim' — lo correcto es 'She can swim'." },
        { tipo: "subtitulo", contenido: "Preguntas y respuestas cortas" },
        { tipo: "lista", items: ["Can you cook? — Yes, I can. / No, I can't.", "Can she dance? — Yes, she can. / No, she can't.", "Can they speak English? — Yes, they can. / No, they can't."] },
        { tipo: "callout", variante: "sabias", contenido: "'Can' también se usa para pedir permiso de manera informal: 'Can I go to the bathroom?' En contextos más formales, se prefiere 'May I...?' o 'Could I...?'" },
      ],
    },
  },
  {
    slug: "in-i-family-members",
    titulo: "Family Members and Relationships",
    categoria: "Vocabulary",
    tiempo_lectura_minutos: 4,
    conceptos_clave: ["family vocabulary", "relatives", "possessive adjectives"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "El vocabulario de la familia es uno de los primeros temas que se aprenden en cualquier idioma. En inglés, muchos términos de parentesco son distintos para el género masculino y femenino, aunque algunos son neutros." },
        { tipo: "lista", items: ["Parents (padres): Father/Dad — Mother/Mom", "Siblings (hermanos): Brother — Sister", "Grandparents (abuelos): Grandfather/Grandpa — Grandmother/Grandma", "Uncles and Aunts: Uncle — Aunt", "Cousins (primos — neutro en inglés)", "Nephews and Nieces: Nephew — Niece", "In-laws: Father-in-law — Mother-in-law"] },
        { tipo: "callout", variante: "sabias", contenido: "En inglés, 'cousin' es neutro — puede ser primo o prima. También 'sibling' (hermano/a) y 'child/children' (hijo/a o hijo/s) no tienen género gramatical." },
        { tipo: "subtitulo", contenido: "Adjetivos posesivos" },
        { tipo: "lista", items: ["My (mi/mis)", "Your (tu/tus, su/sus — usted)", "His (su — de él)", "Her (su — de ella)", "Our (nuestro/a/s)", "Their (su/sus — de ellos)"] },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Árbol genealógico familiar con los términos en inglés para cada miembro de la familia, desde abuelos hasta nietos", caption: "Árbol familiar con vocabulario en inglés." },
      ],
    },
  },
  {
    slug: "in-i-likes-dislikes",
    titulo: "Likes, Dislikes and Preferences",
    categoria: "Speaking & Listening",
    tiempo_lectura_minutos: 5,
    conceptos_clave: ["like/don't like", "love/hate", "gerunds after verbs", "expressing preferences"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "Expresar gustos y preferencias es esencial para conectar con otras personas. En inglés, usamos una variedad de verbos y expresiones para esto, y un aspecto gramatical clave es que después de 'like', 'love', 'hate' y 'enjoy', el verbo generalmente va en gerundio (-ing)." },
        { tipo: "lista", items: ["I love reading. (Me encanta leer.)", "She likes watching movies. (Le gusta ver películas.)", "He doesn't like waking up early. (No le gusta levantarse temprano.)", "They hate doing homework. (Odian hacer tarea.)", "We enjoy cooking together. (Disfrutamos cocinar juntos.)"] },
        { tipo: "callout", variante: "importante", contenido: "Después de 'like', 'love', 'hate', 'enjoy', 'prefer' y 'don't mind', el verbo que sigue va en gerundio (-ing): 'I enjoy playing guitar', no 'I enjoy play guitar'." },
        { tipo: "subtitulo", contenido: "Expresando preferencias" },
        { tipo: "lista", items: ["I prefer... to... (Prefiero... a...)", "I'd rather... than... (Preferiría... que...)", "My favourite [noun] is... (Mi [cosa] favorita es...)", "I'm into... (Estoy muy metido en...)", "I'm not a fan of... (No soy fan de...)"] },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Escala de gustos de 'love' a 'hate' con íconos expresivos, mostrando diferentes actividades y cómo expresar preferencias en inglés", caption: "Escala de expresiones para hablar de gustos en inglés." },
      ],
    },
  },
  {
    slug: "in-i-jobs-occupations",
    titulo: "Jobs and Occupations",
    categoria: "Vocabulary",
    tiempo_lectura_minutos: 4,
    conceptos_clave: ["jobs vocabulary", "work", "professions", "indefinite articles"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "El vocabulario de profesiones y trabajos es muy útil para presentaciones, conversaciones cotidianas y para hablar de aspiraciones. En inglés, cuando dices tu ocupación, generalmente usas el artículo indefinido 'a' o 'an': 'I am a teacher', 'She is an engineer'." },
        { tipo: "subtitulo", contenido: "Profesiones comunes" },
        { tipo: "lista", items: ["Teacher — maestro/a", "Doctor / Nurse — médico/a / enfermero/a", "Engineer — ingeniero/a", "Lawyer — abogado/a", "Programmer / Developer — programador/a", "Chef — chef / cocinero/a", "Architect — arquitecto/a", "Firefighter — bombero/a", "Police officer — policía", "Artist — artista"] },
        { tipo: "callout", variante: "sabias", contenido: "Las profesiones en inglés generalmente no cambian según el género. 'Doctor' es igual para hombre o mujer. Sin embargo, se están usando más términos neutros: 'firefighter' en lugar de 'fireman', 'flight attendant' en lugar de 'stewardess'." },
        { tipo: "lista", items: ["What do you do? — ¿A qué te dedicas?", "I work as a.../ I'm a... — Trabajo como... / Soy...", "What does she do? — ¿A qué se dedica ella?", "She works for... — Ella trabaja para..."] },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Ilustraciones de diferentes profesionales en sus lugares de trabajo con sus nombres en inglés", caption: "Vocabulario de profesiones en inglés." },
      ],
    },
  },
  {
    slug: "in-i-classroom-vocabulary",
    titulo: "Classroom Vocabulary and Instructions",
    categoria: "Vocabulary",
    tiempo_lectura_minutos: 4,
    conceptos_clave: ["classroom objects", "school instructions", "imperative", "classroom language"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "El salón de clases es el primer ambiente donde usas el inglés. Conocer el vocabulario del aula y las instrucciones comunes te ayudará a entender mejor a tu maestro/a y a participar activamente en clase." },
        { tipo: "subtitulo", contenido: "Objetos del salón" },
        { tipo: "lista", items: ["Blackboard / Whiteboard — pizarrón", "Chalk / Marker — tiza / marcador", "Desk — escritorio", "Chair — silla", "Notebook — cuaderno", "Textbook — libro de texto", "Pencil / Pen / Eraser — lápiz / pluma / borrador", "Ruler — regla", "Dictionary — diccionario"] },
        { tipo: "subtitulo", contenido: "Instrucciones del maestro" },
        { tipo: "lista", items: ["Open your book to page... — Abran su libro en la página...", "Close your notebooks. — Cierren sus cuadernos.", "Listen carefully. — Escuchen con atención.", "Repeat after me. — Repitan después de mí.", "Work in pairs/groups. — Trabajen en pares/grupos.", "Hand in your homework. — Entreguen su tarea."] },
        { tipo: "callout", variante: "importante", contenido: "Las instrucciones en clase usan el imperativo en inglés: el verbo va en su forma base sin sujeto. 'Open', 'Close', 'Write', 'Listen'. Para hacerlas más suaves, se añade 'please': 'Please, open your books'." },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Ilustración de un salón de clases con todos los objetos escolares etiquetados en inglés", caption: "Vocabulario del aula en inglés." },
      ],
    },
  },
  {
    slug: "in-i-countries-nationalities",
    titulo: "Countries, Nationalities and Languages",
    categoria: "Vocabulary",
    tiempo_lectura_minutos: 5,
    conceptos_clave: ["countries", "nationalities", "languages", "capital letters in English"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "En inglés, los nombres de países, nacionalidades y lenguas siempre se escriben con MAYÚSCULA inicial, a diferencia del español donde solo los países llevan mayúscula. Esto es una regla ortográfica importante que debes recordar." },
        { tipo: "lista", items: ["Mexico — Mexican — Spanish", "United States — American — English", "Brazil — Brazilian — Portuguese", "France — French — French", "Germany — German — German", "Japan — Japanese — Japanese", "China — Chinese — Chinese", "Argentina — Argentine / Argentinian — Spanish"] },
        { tipo: "callout", variante: "importante", contenido: "En inglés, siempre escribe con mayúscula: nombres de países (Mexico, France), nacionalidades (Mexican, French) e idiomas (Spanish, English). En español solo los países llevan mayúscula: México, Francia — pero mexicano, francés, español van en minúscula." },
        { tipo: "subtitulo", contenido: "Frases útiles" },
        { tipo: "lista", items: ["Where are you from? — ¿De dónde eres?", "I'm from Mexico. — Soy de México.", "What's your nationality? — ¿Cuál es tu nacionalidad?", "I'm Mexican. — Soy mexicano/a.", "What language do you speak? — ¿Qué idioma hablas?", "I speak Spanish. — Hablo español."] },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Mapa del mundo con países destacados y sus banderas, junto con el gentilicio en inglés para cada uno", caption: "Países y nacionalidades en inglés." },
      ],
    },
  },
  {
    slug: "in-i-prepositions-of-place",
    titulo: "Colors, Shapes and Basic Descriptors",
    categoria: "Vocabulary",
    tiempo_lectura_minutos: 4,
    conceptos_clave: ["colors", "shapes", "size", "descriptive adjectives"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "Los colores y las formas son vocabulario básico pero muy útil para describir el mundo que nos rodea. En inglés, los colores y formas funcionan como adjetivos y siguen las mismas reglas: van antes del sustantivo y no cambian por género o número." },
        { tipo: "subtitulo", contenido: "Colores" },
        { tipo: "lista", items: ["Red — rojo", "Blue — azul", "Yellow — amarillo", "Green — verde", "Orange — naranja", "Purple / Violet — morado / violeta", "Pink — rosa", "Brown — café / marrón", "Black — negro", "White — blanco", "Grey — gris"] },
        { tipo: "subtitulo", contenido: "Formas" },
        { tipo: "lista", items: ["Circle — círculo", "Square — cuadrado", "Triangle — triángulo", "Rectangle — rectángulo", "Oval — óvalo", "Star — estrella", "Heart — corazón"] },
        { tipo: "callout", variante: "sabias", contenido: "El inglés americano escribe 'gray' (gris), mientras que el inglés británico escribe 'grey'. Los dos son correctos, pero es mejor ser consistente." },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Paleta de colores con sus nombres en inglés y formas geométricas básicas con sus nombres", caption: "Colores y formas en inglés." },
      ],
    },
  },
  {
    slug: "in-i-days-months-seasons",
    titulo: "Days, Months and Seasons",
    categoria: "Vocabulary",
    tiempo_lectura_minutos: 4,
    conceptos_clave: ["days of week", "months", "seasons", "capital letters"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "Igual que los países y nacionalidades, los días de la semana, los meses y las estaciones del año se escriben con MAYÚSCULA en inglés. Este es un error muy común entre hispanohablantes." },
        { tipo: "lista", items: ["Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday", "January, February, March, April, May, June, July, August, September, October, November, December"] },
        { tipo: "callout", variante: "importante", contenido: "En inglés, la semana comienza el domingo (Sunday), no el lunes. Esto se refleja en calendarios angloparlantes. También, el inglés dice 'on Monday' (el lunes) usando la preposición 'on' para días específicos." },
        { tipo: "subtitulo", contenido: "Las estaciones del año" },
        { tipo: "lista", items: ["Spring — primavera (March-May)", "Summer — verano (June-August)", "Autumn / Fall — otoño (September-November)", "Winter — invierno (December-February)"] },
        { tipo: "callout", variante: "sabias", contenido: "El inglés americano prefiere 'Fall' para otoño, mientras que el inglés británico usa 'Autumn'. Ambos son aceptados en cualquier contexto." },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Calendario visual con los días de la semana y los meses del año en inglés, con íconos de estaciones del año", caption: "Días, meses y estaciones en inglés." },
      ],
    },
  },
  {
    slug: "in-i-formal-emails",
    titulo: "Writing Formal and Informal Messages",
    categoria: "Writing",
    tiempo_lectura_minutos: 6,
    conceptos_clave: ["formal writing", "email structure", "greetings and closings", "register"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "Escribir en inglés requiere adaptar el registro (formal o informal) al contexto y al destinatario. Un mensaje para un amigo es completamente diferente a un correo para un profesor o jefe. Conocer la diferencia es una habilidad comunicativa clave." },
        { tipo: "subtitulo", contenido: "Correo formal (Formal Email)" },
        { tipo: "lista", items: ["Greeting: Dear Mr./Ms. [apellido], / To whom it may concern,", "Introduction: I am writing to inform you that... / I am contacting you regarding...", "Body: estado, solicitud o información principal", "Closing: I look forward to hearing from you. / Thank you for your time.", "Sign-off: Yours sincerely, / Best regards, / Respectfully,"] },
        { tipo: "subtitulo", contenido: "Mensaje informal (Informal Message/Chat)" },
        { tipo: "lista", items: ["Greeting: Hi [nombre]! / Hey! / What's up?", "Contractions and slang: I'm, it's, don't, gonna, wanna", "Closing: See you! / Take care! / Bye! / Talk soon!"] },
        { tipo: "callout", variante: "importante", contenido: "En un correo formal, NUNCA uses contracciones (I'm → I am), lenguaje coloquial ni emojis. La claridad y la cortesía son prioritarias." },
        { tipo: "callout", variante: "sabias", contenido: "En inglés, 'Dear Sir or Madam' es adecuado cuando no conoces el nombre del destinatario. Sin embargo, 'To whom it may concern' es más neutral y profesional para cartas y correos formales." },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Comparación visual de un correo formal y un mensaje de chat informal, con las partes estructurales señaladas y ejemplos de frases para cada sección", caption: "Estructura de un correo formal vs. un mensaje informal en inglés." },
      ],
    },
  },
  {
    slug: "in-i-possessive-pronouns",
    titulo: "Possessives: Adjectives, Pronouns and Apostrophe-S",
    categoria: "Grammar",
    tiempo_lectura_minutos: 5,
    conceptos_clave: ["possessive adjectives", "possessive pronouns", "apostrophe s", "genitive"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "En inglés hay tres formas de expresar posesión: los adjetivos posesivos (my, your, his...), los pronombres posesivos (mine, yours, his...) y el genitivo sajón (apostrophe -'s). Cada uno tiene un uso específico." },
        { tipo: "subtitulo", contenido: "Adjetivos posesivos (van antes del sustantivo)" },
        { tipo: "lista", items: ["My book (mi libro)", "Your pencil (tu lápiz)", "His car / Her bag (su coche de él / su bolsa de ella)", "Its tail (su cola — de un animal o cosa)", "Our house (nuestra casa)", "Their children (sus hijos de ellos)"] },
        { tipo: "subtitulo", contenido: "Pronombres posesivos (reemplazan al sustantivo)" },
        { tipo: "lista", items: ["This book is mine. (Este libro es mío.)", "Is this pencil yours? (¿Es tuyo este lápiz?)", "That car is his/hers. (Ese coche es de él/ella.)", "The decision is ours. (La decisión es nuestra.)", "The mistake was theirs. (El error fue de ellos.)"] },
        { tipo: "callout", variante: "importante", contenido: "El genitivo sajón ('s) indica que algo pertenece a alguien: 'Maria's book' = el libro de María. Para nombres que ya terminan en -s: 'Carlos' house' o 'Carlos's house' (ambos son aceptados)." },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Tabla comparativa de adjetivos posesivos vs. pronombres posesivos en inglés con ejemplos de oraciones en cada caso", caption: "Los tres sistemas posesivos del inglés." },
      ],
    },
  },
  {
    slug: "in-i-food-and-drinks",
    titulo: "Food, Drinks and Ordering in a Restaurant",
    categoria: "Vocabulary",
    tiempo_lectura_minutos: 5,
    conceptos_clave: ["food vocabulary", "countable/uncountable nouns", "ordering food", "restaurant phrases"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "El vocabulario de comida y bebida es uno de los temas más prácticos del inglés. Además del vocabulario específico, en este contexto se introduce una distinción gramatical importante: sustantivos contables vs. incontables." },
        { tipo: "lista", items: ["Countable (contables): apple, sandwich, egg, cookie, burger (pueden pluralizarse)", "Uncountable (incontables): water, milk, rice, bread, sugar (no se pluralizan)"] },
        { tipo: "callout", variante: "importante", contenido: "'Much' se usa con incontables: 'How much water?'. 'Many' se usa con contables: 'How many apples?'. 'Some' y 'any' sirven para ambos: 'some water', 'some apples', 'any milk', 'any cookies'." },
        { tipo: "subtitulo", contenido: "Frases para pedir en un restaurante" },
        { tipo: "lista", items: ["I'd like... (Quisiera...)", "Can I have..., please? (¿Me puede traer...?)", "I'll have the... (Voy a pedir el/la...)", "Could we see the menu? (¿Nos puede traer el menú?)", "The bill/check, please. (La cuenta, por favor.)", "Is there a vegetarian option? (¿Hay alguna opción vegetariana?)"] },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Menú de restaurante en inglés con categorías: entradas, plato principal, postres y bebidas, con los nombres de platillos comunes", caption: "Vocabulario de restaurante en inglés." },
      ],
    },
  },
  {
    slug: "in-i-telling-time",
    titulo: "Telling the Time and Talking About Schedules",
    categoria: "Vocabulary",
    tiempo_lectura_minutos: 5,
    conceptos_clave: ["telling time", "o'clock", "half past", "quarter to/past", "schedules"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "Decir la hora en inglés tiene sus particularidades. A diferencia del español donde simplemente decimos 'las tres y cuarto', en inglés hay varias formas de expresar la hora dependiendo del contexto y la formalidad." },
        { tipo: "lista", items: ["3:00 — It's three o'clock.", "3:15 — It's (a) quarter past three. / It's three fifteen.", "3:30 — It's half past three. / It's three thirty.", "3:45 — It's (a) quarter to four. / It's three forty-five.", "3:05 — It's five past three. / It's three oh five.", "3:55 — It's five to four. / It's three fifty-five."] },
        { tipo: "callout", variante: "sabias", contenido: "En inglés americano, se usa el formato de 12 horas con AM (de medianoche a mediodía) y PM (de mediodía a medianoche). El inglés formal y europeo prefiere el formato de 24 horas: '15:00' en lugar de '3:00 PM'." },
        { tipo: "subtitulo", contenido: "Preguntando la hora" },
        { tipo: "lista", items: ["What time is it? — ¿Qué hora es?", "Do you have the time? — ¿Tienes la hora? (informal)", "Could you tell me the time, please? — ¿Me podría decir la hora?"] },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Varios relojes analógicos mostrando diferentes horas con su pronunciación en inglés escrita debajo de cada uno", caption: "Cómo leer la hora en inglés." },
      ],
    },
  },
  {
    slug: "in-i-weather-expressions",
    titulo: "Weather: Describing Climate and Conditions",
    categoria: "Vocabulary",
    tiempo_lectura_minutos: 4,
    conceptos_clave: ["weather vocabulary", "It is/It's", "present continuous for weather", "seasons"],
    contenido: {
      secciones: [
        { tipo: "parrafo", contenido: "El clima es uno de los temas de conversación más comunes en países angloparlantes, especialmente en el Reino Unido. Saber describir el tiempo te permite participar en conversaciones cotidianas de forma natural." },
        { tipo: "lista", items: ["It's sunny. — Está soleado.", "It's cloudy. — Está nublado.", "It's raining. — Está lloviendo.", "It's snowing. — Está nevando.", "It's windy. — Hace viento.", "It's foggy. — Hay niebla.", "It's hot/cold/warm/cool. — Hace calor/frío/está cálido/fresco."] },
        { tipo: "callout", variante: "importante", contenido: "En inglés, para hablar del tiempo siempre se usa 'It is' / 'It's'. No existe el equivalente directo de 'Hace calor' — en inglés es 'It's hot', no 'It makes hot'." },
        { tipo: "subtitulo", contenido: "Preguntas sobre el clima" },
        { tipo: "lista", items: ["What's the weather like today? — ¿Cómo está el clima hoy?", "How's the weather? — ¿Qué tiempo hace?", "Is it going to rain? — ¿Va a llover?", "What's the temperature? — ¿Cuántos grados hay?"] },
        { tipo: "imagen", url: "/biblioteca/placeholder-ficha.svg", alt: "Mapa meteorológico estilizado con íconos del clima (sol, nubes, lluvia, nieve, tormenta) y sus nombres en inglés", caption: "Vocabulario del clima en inglés." },
      ],
    },
  },
];

async function main() {
  console.log("🔍 Buscando UAC:", UAC_CODIGO);
  const { data: uac, error: uacError } = await supabase
    .from("uac")
    .select("id")
    .eq("codigo", UAC_CODIGO)
    .single();

  if (uacError || !uac) {
    console.error("❌ UAC no encontrada:", uacError?.message);
    process.exit(1);
  }

  console.log("✅ UAC encontrada:", uac.id);
  console.log(`📚 Insertando ${FICHAS.length} fichas...`);

  let ok = 0;
  let fail = 0;

  for (const ficha of FICHAS) {
    const { error } = await supabase
      .from("fichas_biblioteca" as string)
      .upsert(
        {
          uac_id: uac.id,
          slug: ficha.slug,
          titulo: ficha.titulo,
          categoria: ficha.categoria,
          imagen_destacada: "/biblioteca/placeholder-ficha.svg",
          contenido: ficha.contenido,
          conceptos_clave: ficha.conceptos_clave,
          fichas_relacionadas: [],
          tiempo_lectura_minutos: ficha.tiempo_lectura_minutos,
          es_placeholder: true,
          orden: FICHAS.indexOf(ficha) + 1,
        },
        { onConflict: "slug" }
      );

    if (error) {
      console.error(`  ❌ ${ficha.slug}:`, error.message);
      fail++;
    } else {
      console.log(`  ✅ ${ficha.slug}`);
      ok++;
    }
  }

  console.log(`\n🎉 Listo: ${ok} insertadas, ${fail} fallidas`);
}

if (require.main === module) {
  main().catch(console.error);
}

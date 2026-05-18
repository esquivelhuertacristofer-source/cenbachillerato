/**
 * Seed de fichas de biblioteca para LC-I (Lengua y Comunicación I).
 * 22 fichas temáticas alineadas al MCCEMS 2025, Semestre 1.
 *
 * Uso: npx tsx scripts/seed-biblioteca-lci.ts
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

const FICHAS_LCI = [
  // ── 1 ──────────────────────────────────────────────────────────────────────
  {
    slug: "lc-i-que-es-la-comunicacion",
    titulo: "¿Qué es la comunicación?",
    descripcion:
      "Explora los elementos del proceso comunicativo y los distintos tipos de comunicación humana.",
    categoria: "Comunicación",
    conceptos_clave: ["emisor", "receptor", "mensaje", "canal"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La comunicación es el proceso mediante el cual los seres humanos intercambian información, ideas, emociones y significados. Es una de las capacidades más fundamentales de nuestra especie: sin ella, sería imposible construir la cultura, el conocimiento o las relaciones sociales. Desde una conversación entre amigos hasta un discurso presidencial, toda forma de comunicación comparte una estructura básica que los lingüistas han estudiado durante décadas.",
        },
        {
          tipo: "subtitulo",
          contenido: "Los elementos del proceso comunicativo",
        },
        {
          tipo: "parrafo",
          contenido:
            "El modelo más conocido fue propuesto por Roman Jakobson en 1960 y distingue seis componentes esenciales. El emisor es quien produce y envía el mensaje; el receptor es quien lo recibe e interpreta. El mensaje es el contenido que se transmite, mientras que el canal es el medio físico por el que viaja (el aire en la conversación oral, el papel en la escritura, las ondas electromagnéticas en la radio). El código es el sistema de signos compartido —el idioma, los gestos, los iconos— y el contexto es la situación real en que ocurre el intercambio, que determina cómo se interpreta el mensaje.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama circular con flechas que muestran los seis elementos del modelo de Jakobson: emisor, mensaje, receptor, canal, código y contexto",
          caption: "Modelo de comunicación de Roman Jakobson (1960).",
        },
        {
          tipo: "subtitulo",
          contenido: "Tipos de comunicación",
        },
        {
          tipo: "lista",
          items: [
            "Verbal oral: se realiza a través de la voz y el lenguaje hablado (conversaciones, discursos, llamadas telefónicas).",
            "Verbal escrita: usa signos gráficos para representar el lenguaje (cartas, libros, mensajes de texto).",
            "No verbal: incluye gestos, expresiones faciales, postura corporal y distancia física entre los interlocutores.",
            "Paraverbal: elementos que acompañan a la voz, como el tono, el volumen, la velocidad y las pausas.",
            "Icónica: basada en imágenes y símbolos (señales de tránsito, emojis, logotipos).",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Para que la comunicación sea efectiva, emisor y receptor deben compartir el mismo código. Si uno habla en español y el otro solo entiende inglés, el canal funciona pero el mensaje no se decodifica correctamente. A este fallo se le llama ruido semántico.",
        },
        {
          tipo: "subtitulo",
          contenido: "Funciones del lenguaje",
        },
        {
          tipo: "parrafo",
          contenido:
            "Jakobson también identificó seis funciones del lenguaje vinculadas a cada elemento del modelo. La función referencial (ligada al contexto) informa sobre la realidad; la expresiva (ligada al emisor) transmite emociones; la conativa (ligada al receptor) busca influir en él; la fática (ligada al canal) mantiene el contacto; la metalingüística (ligada al código) habla sobre el propio lenguaje; y la poética (ligada al mensaje) pone énfasis en la forma estética del mensaje. Reconocer estas funciones nos ayuda a entender por qué un mismo texto puede informar, emocionar o persuadir dependiendo de cómo esté construido.",
        },
        {
          tipo: "cita",
          contenido:
            "El lenguaje sirve no sólo para comunicar sino para crear el mundo en el que vivimos.",
          fuente: "Humberto Maturana, biólogo y filósofo chileno",
        },
      ],
    },
  },

  // ── 2 ──────────────────────────────────────────────────────────────────────
  {
    slug: "lc-i-el-texto-y-sus-propiedades",
    titulo: "El texto y sus propiedades",
    descripcion:
      "Comprende las tres propiedades esenciales que hacen que un conjunto de oraciones forme un verdadero texto: coherencia, cohesión y adecuación.",
    categoria: "Comunicación",
    conceptos_clave: ["coherencia", "cohesión", "adecuación", "texto"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "No cualquier conjunto de oraciones constituye un texto. Para que exista un texto —y no solo una serie de frases inconexas— es necesario que el escrito cumpla tres propiedades fundamentales: coherencia, cohesión y adecuación. Estas propiedades garantizan que el mensaje sea comprensible, esté bien articulado internamente y resulte apropiado para la situación comunicativa.",
        },
        {
          tipo: "subtitulo",
          contenido: "Coherencia: unidad de sentido",
        },
        {
          tipo: "parrafo",
          contenido:
            "La coherencia es la propiedad que da unidad temática al texto. Un texto es coherente cuando todas sus partes giran en torno a un mismo tema central y las ideas se presentan de manera lógica y ordenada. Si en un párrafo sobre el calentamiento global introdujéramos de pronto información sobre una receta de cocina sin ninguna conexión, el texto perdería coherencia. La coherencia se construye con una estructura clara: introducción, desarrollo y cierre; ideas principales que se sostienen con argumentos o ejemplos; y progresión lógica de la información.",
        },
        {
          tipo: "subtitulo",
          contenido: "Cohesión: los hilos que unen el texto",
        },
        {
          tipo: "parrafo",
          contenido:
            "La cohesión opera en el nivel de la forma lingüística: son los mecanismos gramaticales y léxicos que conectan unas oraciones con otras. Entre los recursos de cohesión más importantes se encuentran los pronombres (que sustituyen a un sustantivo ya mencionado), los conectores discursivos (sin embargo, por lo tanto, además), la sinonimia y la elipsis (omisión de elementos que ya se entienden por el contexto). Un texto con buena cohesión fluye con naturalidad; uno sin ella se siente fragmentado y difícil de seguir.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Lingüistas como Michael Halliday y Ruqaiya Hasan, en su obra Cohesion in English (1976), fueron los primeros en sistematizar los recursos cohesivos del inglés. Sus categorías —referencia, sustitución, elipsis, conjunción y cohesión léxica— son igualmente aplicables al español.",
        },
        {
          tipo: "subtitulo",
          contenido: "Adecuación: el texto en su contexto",
        },
        {
          tipo: "parrafo",
          contenido:
            "La adecuación es la propiedad que relaciona el texto con la situación comunicativa en que se produce. Un texto adecuado utiliza el registro apropiado (formal o informal), el léxico pertinente para la audiencia y el canal elegido. No es lo mismo escribir un correo a un profesor que un mensaje a un amigo: el tema puede ser el mismo, pero el vocabulario, el tono y la extensión deben adaptarse al destinatario y al propósito. La adecuación también incluye respetar las convenciones del tipo de texto: una carta formal tiene una estructura distinta a la de un poema.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Triángulo con las tres propiedades del texto en cada vértice: coherencia (unidad de sentido), cohesión (conexión formal) y adecuación (contexto y registro)",
          caption: "Las tres propiedades del texto forman un sistema interdependiente.",
        },
      ],
    },
  },

  // ── 3 ──────────────────────────────────────────────────────────────────────
  {
    slug: "lc-i-tipos-de-texto",
    titulo: "Tipos de texto: narrativo, descriptivo, expositivo, argumentativo",
    descripcion:
      "Identifica las características y propósitos de los cuatro grandes tipos textuales que se trabajan en la educación media superior.",
    categoria: "Géneros textuales",
    conceptos_clave: ["texto narrativo", "texto descriptivo", "texto expositivo", "texto argumentativo"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Los textos se producen con distintos propósitos: contar una historia, describir un objeto, explicar un fenómeno o convencer de una idea. Según su intención comunicativa predominante, los textos se clasifican en cuatro grandes tipos: narrativo, descriptivo, expositivo y argumentativo. En la práctica, muchos textos combinan varios tipos, pero siempre existe uno que domina.",
        },
        {
          tipo: "subtitulo",
          contenido: "El texto narrativo",
        },
        {
          tipo: "parrafo",
          contenido:
            "El texto narrativo cuenta hechos reales o ficticios que ocurren en una secuencia temporal. Sus elementos fundamentales son: narrador (quien cuenta), personajes (quienes actúan), ambiente (espacio y tiempo), trama (sucesión de eventos) y desenlace. Los cuentos, novelas, fábulas, leyendas y noticias son ejemplos de textos narrativos. Se reconocen por el uso del pretérito y por conectores temporales como primero, después, finalmente.",
        },
        {
          tipo: "subtitulo",
          contenido: "El texto descriptivo",
        },
        {
          tipo: "parrafo",
          contenido:
            "El texto descriptivo representa con palabras las características de personas, lugares, objetos o fenómenos. Puede ser objetivo (preciso y científico, como en un manual técnico) o subjetivo (cargado de valoraciones personales, como en la literatura). Los textos descriptivos abundan en adjetivos, comparaciones y verbos en presente o imperfecto. Una guía turística, un perfil de personaje literario o la descripción de un experimento son textos descriptivos.",
        },
        {
          tipo: "subtitulo",
          contenido: "El texto expositivo",
        },
        {
          tipo: "parrafo",
          contenido:
            "El texto expositivo tiene como objetivo informar y explicar un tema de manera clara y organizada, sin tomar partido ni intentar persuadir. Las enciclopedias, los artículos de divulgación científica y los apuntes de clase son textos expositivos. Su estructura habitual es: presentación del tema, desarrollo con ejemplos y datos, y conclusión. El vocabulario es preciso y el tono, neutral.",
        },
        {
          tipo: "subtitulo",
          contenido: "El texto argumentativo",
        },
        {
          tipo: "parrafo",
          contenido:
            "El texto argumentativo busca convencer al lector de una postura o tesis mediante el uso de razones, evidencias y ejemplos. Los editoriales periodísticos, los ensayos académicos y los debates son sus formatos más comunes. Estructura típica: presentación de la tesis, cuerpo argumentativo con evidencias y contraargumentos, y conclusión que refuerza la postura inicial.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Muchos textos son híbridos. Un artículo científico expone datos (expositivo) y defiende una hipótesis (argumentativo). Una novela narra hechos (narrativo) e incluye descripciones detalladas (descriptivo). Identificar el tipo predominante te ayuda a leer con mayor precisión.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tabla comparativa de los cuatro tipos textuales con sus propósitos, ejemplos y conectores característicos",
          caption: "Comparativa de los cuatro tipos textuales fundamentales.",
        },
      ],
    },
  },

  // ── 4 ──────────────────────────────────────────────────────────────────────
  {
    slug: "lc-i-comprension-lectora-niveles",
    titulo: "La comprensión lectora: niveles literal, inferencial y crítico",
    descripcion:
      "Aprende a distinguir y desarrollar los tres niveles de lectura para comprender textos con mayor profundidad.",
    categoria: "Comprensión lectora",
    conceptos_clave: ["nivel literal", "nivel inferencial", "nivel crítico", "lectura activa"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Leer no es solo reconocer palabras en una página. La comprensión lectora es un proceso activo en el que el lector construye significado a partir del texto, combinando lo que lee con sus conocimientos previos. Los especialistas en didáctica identifican tres niveles de comprensión que van de lo más superficial a lo más profundo: el nivel literal, el inferencial y el crítico.",
        },
        {
          tipo: "subtitulo",
          contenido: "Nivel literal: ¿qué dice el texto?",
        },
        {
          tipo: "parrafo",
          contenido:
            "En el nivel literal el lector recupera la información que aparece explícitamente en el texto: nombres, fechas, lugares, acciones descritas. No requiere interpretación; basta con localizar y reproducir lo que el autor dice. Preguntas típicas: ¿Quién realizó la acción? ¿Cuándo sucedió? ¿Qué elementos se mencionan? Este nivel es necesario pero insuficiente: quedarse solo aquí significa no aprovechar plenamente lo que un texto tiene para ofrecer.",
        },
        {
          tipo: "subtitulo",
          contenido: "Nivel inferencial: ¿qué quiere decir el texto?",
        },
        {
          tipo: "parrafo",
          contenido:
            "El nivel inferencial exige que el lector vaya más allá de las palabras para deducir información implícita: las causas de un evento, las intenciones del autor, el significado de una metáfora, la relación entre ideas. Las inferencias se construyen combinando las pistas del texto con el conocimiento del mundo que posee el lector. Preguntas típicas: ¿Por qué ocurrió esto? ¿Qué quiso decir el autor con esta expresión? ¿Qué se puede deducir?",
        },
        {
          tipo: "subtitulo",
          contenido: "Nivel crítico: ¿cómo evalúo el texto?",
        },
        {
          tipo: "parrafo",
          contenido:
            "El nivel crítico implica tomar una postura frente al texto: evaluar la validez de los argumentos, identificar sesgos, comparar con otras fuentes, reflexionar sobre el impacto social o ético del mensaje. Este nivel convierte al lector en un interlocutor activo y no en un receptor pasivo. Preguntas típicas: ¿Están bien fundamentadas las afirmaciones? ¿Qué intereses podría tener el autor? ¿Estoy de acuerdo con esta postura? ¿Por qué?",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La OCDE, a través de las pruebas PISA, evalúa la comprensión lectora de estudiantes de 15 años en todo el mundo. México ha mostrado áreas de mejora especialmente en los niveles inferencial y crítico. Practicar la lectura activa, hacerse preguntas mientras se lee y discutir los textos con otros son estrategias clave para avanzar.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Pirámide de tres niveles: en la base el nivel literal, en el centro el inferencial y en la cima el crítico, con preguntas guía en cada nivel",
          caption: "Los tres niveles de comprensión lectora, de menor a mayor profundidad.",
        },
        {
          tipo: "cita",
          contenido:
            "Un lector vive mil vidas antes de morir. El hombre que nunca lee vive solo una.",
          fuente: "George R. R. Martin, escritor estadounidense",
        },
      ],
    },
  },

  // ── 5 ──────────────────────────────────────────────────────────────────────
  {
    slug: "lc-i-el-parrafo-estructura-y-tipos",
    titulo: "El párrafo: estructura y tipos",
    descripcion:
      "Conoce la estructura interna del párrafo y los tipos más frecuentes en la escritura académica y literaria.",
    categoria: "Producción escrita",
    conceptos_clave: ["oración temática", "párrafo deductivo", "párrafo inductivo", "idea principal"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El párrafo es la unidad básica de construcción textual. Está formado por un conjunto de oraciones que desarrollan una sola idea central, conocida como idea principal o tópico. Un buen párrafo tiene unidad (todas las oraciones giran en torno a una idea), coherencia (la secuencia lógica es clara) y cohesión (los mecanismos lingüísticos conectan las oraciones entre sí).",
        },
        {
          tipo: "subtitulo",
          contenido: "Estructura del párrafo",
        },
        {
          tipo: "lista",
          items: [
            "Oración temática: enuncia la idea principal del párrafo. Generalmente va al inicio, aunque puede aparecer al final o en el centro.",
            "Oraciones de desarrollo: amplían, explican, ejemplifican o argumentan la idea principal con datos, citas, comparaciones o anécdotas.",
            "Oración de cierre: sintetiza lo dicho o sirve de transición hacia el párrafo siguiente.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Tipos de párrafo según su estructura",
        },
        {
          tipo: "parrafo",
          contenido:
            "En el párrafo deductivo la idea principal va al inicio y las oraciones siguientes la desarrollan. Es el más frecuente en la escritura académica porque comunica con rapidez el punto central. En el párrafo inductivo la idea principal aparece al final, tras una serie de ejemplos o evidencias que la preparan; es común en textos persuasivos o narrativos. El párrafo encuadrado coloca la idea principal tanto al inicio como al final, reforzando el mensaje. Existe también el párrafo de desarrollo que solo presenta ideas secundarias cuando la idea principal ya fue establecida en otro párrafo.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La extensión ideal de un párrafo en la escritura académica suele ser de 6 a 12 oraciones. Párrafos más cortos pueden parecer incompletos; párrafos demasiado largos cansan al lector y dificultan la comprensión. Si un párrafo ocupa más de media página, evalúa si puedes dividirlo en dos ideas distintas.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama comparativo de párrafo deductivo (idea principal al inicio), inductivo (idea principal al final) y encuadrado (idea principal al inicio y al final), con bloques de colores que representan cada oración",
          caption: "Estructuras del párrafo deductivo, inductivo y encuadrado.",
        },
      ],
    },
  },

  // ── 6 ──────────────────────────────────────────────────────────────────────
  {
    slug: "lc-i-conectores-discursivos",
    titulo: "Conectores discursivos y marcadores textuales",
    descripcion:
      "Aprende a usar los conectores que dan fluidez y coherencia a los textos, clasificados según su función.",
    categoria: "Producción escrita",
    conceptos_clave: ["conector", "marcador textual", "cohesión", "relación lógica"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Los conectores discursivos, también llamados marcadores textuales, son palabras o expresiones que establecen relaciones lógicas entre ideas, oraciones y párrafos. Son los 'puentes' del texto: sin ellos, las ideas quedan aisladas y el lector no puede seguir la línea de pensamiento del autor. Usarlos correctamente es una de las habilidades más importantes de la escritura académica.",
        },
        {
          tipo: "subtitulo",
          contenido: "Clasificación según su función",
        },
        {
          tipo: "lista",
          items: [
            "Adición: agregan información. Ejemplos: además, también, asimismo, igualmente, por otro lado.",
            "Causa-efecto: expresan razones y consecuencias. Ejemplos: porque, ya que, por eso, en consecuencia, por lo tanto.",
            "Contraste u oposición: introducen ideas que contradicen o matizan. Ejemplos: sin embargo, aunque, no obstante, a pesar de, por el contrario.",
            "Orden o secuencia: organizan la información temporalmente. Ejemplos: primero, luego, después, finalmente, a continuación.",
            "Conclusión o resumen: cierran o sintetizan. Ejemplos: en conclusión, en resumen, para terminar, en definitiva.",
            "Ejemplificación: ilustran una idea. Ejemplos: por ejemplo, es decir, como muestra, tal es el caso de.",
          ],
        },
        {
          tipo: "callout",
          variante: "advertencia",
          contenido:
            "Un error frecuente es abusar siempre del mismo conector. Escribir 'además' en cada párrafo empobrece el texto y lo hace repetitivo. Varía los marcadores y asegúrate de que la relación lógica que expresas sea la correcta: usar 'por lo tanto' cuando en realidad hay una relación de contraste puede confundir gravemente al lector.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tabla organizada por categoría (adición, causa, contraste, secuencia, conclusión, ejemplificación) con tres conectores de ejemplo en cada casilla",
          caption: "Clasificación de conectores discursivos por función lógica.",
        },
        {
          tipo: "cita",
          contenido:
            "La claridad es la cortesía del que escribe.",
          fuente: "Jules Renard, escritor francés",
        },
      ],
    },
  },

  // ── 7 ──────────────────────────────────────────────────────────────────────
  {
    slug: "lc-i-tesis-y-argumento",
    titulo: "La tesis y el argumento en textos académicos",
    descripcion:
      "Entiende qué es una tesis, cómo formularla con precisión y qué tipos de argumentos se usan para sustentarla.",
    categoria: "Producción escrita",
    conceptos_clave: ["tesis", "argumento", "evidencia", "contraargumento"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "En todo texto argumentativo existe una tesis: una postura clara, debatible y defendible sobre un tema. No es un hecho que nadie pueda negar ('el agua hierve a 100 °C al nivel del mar') sino una afirmación que requiere demostración y que otros podrían cuestionar ('el uso del teléfono celular en el salón de clases perjudica el aprendizaje'). Formular una buena tesis es el primer paso de cualquier ensayo académico.",
        },
        {
          tipo: "subtitulo",
          contenido: "Características de una buena tesis",
        },
        {
          tipo: "lista",
          items: [
            "Es concreta y específica: no 'la contaminación es mala' sino 'la quema de combustibles fósiles en las ciudades incrementa las enfermedades respiratorias en menores de 12 años'.",
            "Es debatible: alguien razonable podría disentir de ella.",
            "Es demostrable: puede respaldarse con evidencias, datos y razones.",
            "Aparece con claridad, generalmente al inicio del texto.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Tipos de argumentos",
        },
        {
          tipo: "parrafo",
          contenido:
            "Una vez establecida la tesis, se la sustenta con argumentos. El argumento de autoridad cita a expertos o fuentes reconocidas. El argumento empírico aporta datos, estadísticas y ejemplos verificables. El argumento lógico-deductivo parte de premisas generales aceptadas para llegar a una conclusión particular. El argumento de analogía compara la situación debatida con otra similar para iluminarla. El argumento de consecuencias muestra las implicaciones positivas o negativas de adoptar una postura.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Un texto académico sólido no ignora los contraargumentos: los presenta y los refuta. Reconocer las objeciones más fuertes a tu tesis y responderlas con evidencias demuestra que has pensado el tema con profundidad y aumenta la credibilidad de tu escrito.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Esquema de pirámide argumentativa: en la base los argumentos y evidencias, en el centro la refutación de contraargumentos y en la cima la tesis reforzada",
          caption: "Estructura de un texto argumentativo académico.",
        },
      ],
    },
  },

  // ── 8 ──────────────────────────────────────────────────────────────────────
  {
    slug: "lc-i-resumen-y-sintesis",
    titulo: "El resumen y la síntesis: técnicas",
    descripcion:
      "Aprende a reducir textos mediante el resumen y la síntesis, dos habilidades esenciales del trabajo académico.",
    categoria: "Comprensión lectora",
    conceptos_clave: ["resumen", "síntesis", "paráfrasis", "ideas principales"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El resumen y la síntesis son técnicas de reducción textual que todo estudiante debe dominar. Aunque se confunden con frecuencia, tienen propósitos distintos. El resumen reproduce las ideas principales de un texto respetando el orden y la perspectiva del autor; la síntesis va más lejos: integra información de varias fuentes y la reorganiza con la propia voz del estudiante para construir una visión nueva y cohesionada.",
        },
        {
          tipo: "subtitulo",
          contenido: "Cómo elaborar un resumen",
        },
        {
          tipo: "lista",
          items: [
            "Lee el texto completo sin interrupciones para tener una visión global.",
            "Identifica el tema central y las ideas principales de cada párrafo.",
            "Subraya o anota las ideas más importantes.",
            "Escribe el resumen con tus propias palabras pero sin añadir opiniones o información externa.",
            "Verifica que no hayas omitido ideas esenciales ni incluido detalles innecesarios.",
            "El resumen no debe exceder el 25-30% de la extensión del texto original.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Cómo elaborar una síntesis",
        },
        {
          tipo: "parrafo",
          contenido:
            "Para sintetizar, primero debes tener claros los textos de partida y su relación temática. Identifica las ideas que comparten o que se complementan. Luego construye un texto nuevo que integre esas ideas con fluidez, haciendo explícitas las relaciones entre ellas (causa, contraste, complemento). La síntesis exige un mayor dominio del tema porque requiere reorganizar la información con criterio propio.",
        },
        {
          tipo: "callout",
          variante: "advertencia",
          contenido:
            "Copiar frases del texto original sin comillas ni referencia es plagio. Aunque hagas un resumen, debes usar tus propias palabras o, si citas textualmente, indicarlo con comillas y la fuente. El plagio en contextos académicos tiene consecuencias serias.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de flujo que muestra el proceso: leer, subrayar ideas principales, parafrasear, verificar extensión, y resultado final como resumen o síntesis",
          caption: "Proceso para elaborar un resumen o una síntesis académica.",
        },
      ],
    },
  },

  // ── 9 ──────────────────────────────────────────────────────────────────────
  {
    slug: "lc-i-lectura-critica-fuentes",
    titulo: "Lectura crítica: evaluar fuentes de información",
    descripcion:
      "Desarrolla la habilidad de valorar la confiabilidad, pertinencia y propósito de las fuentes que consultas.",
    categoria: "Comprensión lectora",
    conceptos_clave: ["fuente confiable", "sesgo", "credibilidad", "verificación"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "En la era digital tenemos acceso a más información que nunca, pero esa abundancia trae un problema: no toda la información es verdadera, precisa o imparcial. La lectura crítica incluye la habilidad de evaluar las fuentes antes de confiar en ellas. Saber distinguir una fuente confiable de una que no lo es es tan importante como saber leer.",
        },
        {
          tipo: "subtitulo",
          contenido: "Criterios para evaluar una fuente",
        },
        {
          tipo: "lista",
          items: [
            "Autoría: ¿quién escribe? ¿Tiene formación o experiencia en el tema? ¿Aparece su nombre y afiliación?",
            "Credibilidad de la publicación: ¿es una revista arbitrada, un periódico reconocido, una institución académica o un blog sin respaldo?",
            "Fecha: ¿cuándo fue publicado? En temas científicos o de actualidad, la fecha importa mucho.",
            "Propósito: ¿informa, opina, vende, entretiene o busca persuadir con un fin particular?",
            "Respaldo con evidencias: ¿cita datos, estudios o fuentes verificables, o solo hace afirmaciones sin sustento?",
            "Contraste: ¿la información coincide con lo que dicen otras fuentes confiables sobre el mismo tema?",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Las noticias falsas (fake news) suelen diseñarse para parecerse a noticias reales. Antes de compartir cualquier información en redes sociales, verifica en sitios de fact-checking como Animal Político, Verificado o AFP Factual. Un par de minutos de verificación puede evitar que difundas desinformación.",
        },
        {
          tipo: "subtitulo",
          contenido: "Tipos de fuentes académicas",
        },
        {
          tipo: "parrafo",
          contenido:
            "Las fuentes primarias son originales: el texto mismo de una novela, los datos de un experimento, un discurso grabado. Las fuentes secundarias interpretan o analizan las primarias: un ensayo crítico sobre esa novela, un artículo que revisa varios estudios. Las fuentes terciarias compilan información de secundarias: enciclopedias, diccionarios, bases de datos. Wikipedia puede ser un buen punto de partida, pero nunca debe ser la única fuente en un trabajo académico.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Embudo de filtrado de fuentes con los criterios autoría, publicación, fecha, propósito y respaldo, que termina en una fuente confiable",
          caption: "Criterios para filtrar y evaluar la confiabilidad de una fuente.",
        },
      ],
    },
  },

  // ── 10 ─────────────────────────────────────────────────────────────────────
  {
    slug: "lc-i-el-cuento-elementos-narrativos",
    titulo: "El cuento: elementos narrativos",
    descripcion:
      "Descubre los componentes esenciales del cuento literario y cómo se articulan para crear una historia.",
    categoria: "Géneros textuales",
    conceptos_clave: ["narrador", "personaje", "trama", "espacio narrativo"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El cuento es una narración breve, de estructura cerrada, que presenta personajes en conflicto dentro de un espacio y tiempo determinados, y que termina con un desenlace que resuelve (o deja abierto) ese conflicto. A diferencia de la novela, el cuento concentra su efecto en un único acontecimiento central. Como dijo el escritor argentino Julio Cortázar: 'El cuento gana por nocaut; la novela, por puntos'.",
        },
        {
          tipo: "subtitulo",
          contenido: "El narrador",
        },
        {
          tipo: "parrafo",
          contenido:
            "El narrador es la voz que cuenta la historia. No debe confundirse con el autor. El narrador en primera persona ('yo') da una perspectiva íntima y subjetiva; el narrador en tercera persona omnisciente conoce los pensamientos de todos los personajes; el narrador en tercera persona limitada solo accede a la mente de un personaje; y el narrador testigo narra en primera persona pero es un personaje secundario que observa la acción principal.",
        },
        {
          tipo: "subtitulo",
          contenido: "Personajes, espacio y tiempo",
        },
        {
          tipo: "parrafo",
          contenido:
            "Los personajes son los agentes de la historia. El protagonista es el centro de la acción; el antagonista se le opone. Los personajes pueden ser redondos (complejos, con vida interior) o planos (simples, con una sola función). El espacio narrativo es el lugar donde ocurren los hechos; puede ser físico (una ciudad, una habitación) o psicológico (el mundo interior del personaje). El tiempo narrativo puede ser cronológico o alterado mediante retrospecciones (flashbacks) o anticipaciones.",
        },
        {
          tipo: "subtitulo",
          contenido: "La trama: inicio, nudo y desenlace",
        },
        {
          tipo: "lista",
          items: [
            "Inicio (presentación): se introduce el mundo narrativo, los personajes principales y el tono de la historia.",
            "Nudo (conflicto): surge un conflicto que altera el equilibrio inicial y genera tensión narrativa.",
            "Desenlace: el conflicto se resuelve —o no— y la historia llega a su punto final.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El escritor mexicano Juan Rulfo, autor de El Llano en llamas (1953) y Pedro Páramo (1955), es considerado uno de los maestros del cuento en lengua española. Sus historias, ambientadas en el campo jalisciense, mezclan lo real y lo fantástico con una economía de lenguaje extraordinaria.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Curva de tensión narrativa en forma de montaña rusa, mostrando el inicio, el punto de quiebre, el clímax y el desenlace de un cuento",
          caption: "Curva dramática de la trama en un cuento.",
        },
      ],
    },
  },

  // ── 11 ─────────────────────────────────────────────────────────────────────
  {
    slug: "lc-i-la-poesia-recursos-literarios",
    titulo: "La poesía: verso, estrofa, rima y recursos literarios",
    descripcion:
      "Explora los elementos formales y los recursos del lenguaje poético para leer y apreciar la poesía.",
    categoria: "Géneros textuales",
    conceptos_clave: ["verso", "estrofa", "rima", "figura retórica"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La poesía es el género literario que explota al máximo las posibilidades sonoras, rítmicas y semánticas del lenguaje. A diferencia de la prosa, la poesía organiza el discurso en versos —unidades rítmicas— agrupados en estrofas. Su objetivo no es solo comunicar un contenido sino también producir una experiencia estética en el lector a través de la musicalidad y la imagen.",
        },
        {
          tipo: "subtitulo",
          contenido: "Elementos formales: verso, estrofa y rima",
        },
        {
          tipo: "parrafo",
          contenido:
            "El verso es cada línea de un poema; su longitud se mide en sílabas (métrica). Las estrofas más comunes en español son el pareado (2 versos), el terceto (3), la cuarteta y el cuarteto (4) y la décima (10). La rima es la repetición de sonidos al final de los versos: la rima consonante repite vocales y consonantes desde la última vocal acentuada ('camino' / 'destino'); la rima asonante solo repite las vocales ('tarde' / 'mare'). La poesía moderna también puede prescindir de la rima: se llama verso libre.",
        },
        {
          tipo: "subtitulo",
          contenido: "Recursos literarios esenciales",
        },
        {
          tipo: "lista",
          items: [
            "Metáfora: identifica dos elementos por semejanza sin usar 'como'. Ej.: 'tus ojos son dos soles'.",
            "Símil o comparación: establece semejanza usando 'como' o 'cual'. Ej.: 'eres como el viento'.",
            "Hipérbole: exageración expresiva. Ej.: 'te lo he dicho mil veces'.",
            "Personificación: atribuye cualidades humanas a seres inanimados o abstractos. Ej.: 'el viento susurra secretos'.",
            "Anáfora: repetición de palabras al inicio de versos consecutivos para crear ritmo.",
            "Aliteración: repetición de sonidos similares dentro de un verso. Ej.: 'en el silencio solo se escuchaba un susurro de abejas'.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Sor Juana Inés de la Cruz (1651-1695) es considerada la primera poeta importante de México y América Latina. Sus sonetos y redondillas siguen siendo estudiados por su maestría técnica y la agudeza de su pensamiento, que desafió las normas de género de su época.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Poema breve con sus elementos señalados: versos numerados, estrofas delimitadas con llaves, sílabas contadas y rimas marcadas con letras (ABBA)",
          caption: "Análisis formal de un cuarteto: verso, sílabas y esquema de rima.",
        },
      ],
    },
  },

  // ── 12 ─────────────────────────────────────────────────────────────────────
  {
    slug: "lc-i-texto-periodistico",
    titulo: "El texto periodístico: noticia, crónica y reportaje",
    descripcion:
      "Distingue las características de los géneros periodísticos informativos para leerlos y producirlos con criterio.",
    categoria: "Géneros textuales",
    conceptos_clave: ["noticia", "crónica", "reportaje", "pirámide invertida"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El periodismo es una de las formas de comunicación más influyentes de la sociedad contemporánea. Informa, interpreta y analiza la realidad para el gran público. Sus géneros principales —la noticia, la crónica y el reportaje— tienen propósitos, estructuras y estilos distintos, aunque todos comparten el principio básico de apegarse a los hechos verificables.",
        },
        {
          tipo: "subtitulo",
          contenido: "La noticia",
        },
        {
          tipo: "parrafo",
          contenido:
            "La noticia informa sobre un hecho reciente, de interés público, de manera objetiva y directa. Su estructura clásica es la pirámide invertida: los datos más importantes (qué, quién, cuándo, dónde, por qué y cómo) van en el primer párrafo, y la información de menor relevancia se va agregando hacia el final. Esto permite al lector captar lo esencial aunque no lea completa la noticia, y al editor recortar desde abajo sin perder lo más importante.",
        },
        {
          tipo: "subtitulo",
          contenido: "La crónica",
        },
        {
          tipo: "parrafo",
          contenido:
            "La crónica narra hechos reales en orden cronológico, pero con mayor libertad estilística que la noticia. El cronista puede incluir descripciones, impresiones personales y un tono literario. La crónica es común en coberturas de eventos (un partido de futbol, una manifestación, un concierto). En México, escritores como Carlos Monsiváis y Elena Poniatowska elevaron la crónica a la categoría de arte literario.",
        },
        {
          tipo: "subtitulo",
          contenido: "El reportaje",
        },
        {
          tipo: "parrafo",
          contenido:
            "El reportaje es el género periodístico más extenso y complejo. Investiga un tema en profundidad, cruza múltiples fuentes, entrevistas y documentos, y ofrece un panorama completo de un problema o fenómeno social. Puede durar semanas o meses en prepararse. El reportaje de investigación, cuando destapa irregularidades o injusticias, es una herramienta fundamental del periodismo como contrapeso del poder.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Aprender a distinguir la noticia del editorial y de la publicidad es una competencia ciudadana básica. La noticia informa; el editorial opina; el artículo de opinión argumenta; la publicidad vende. Confundirlos puede llevarnos a tomar decisiones basadas en información sesgada.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Triángulo invertido (pirámide invertida) con etiquetas: en la parte más ancha, los datos más importantes (6W); en el cuerpo, los detalles; en la punta, la información de contexto",
          caption: "La pirámide invertida: estructura clásica de la noticia periodística.",
        },
      ],
    },
  },

  // ── 13 ─────────────────────────────────────────────────────────────────────
  {
    slug: "lc-i-ortografia-mayusculas-minusculas",
    titulo: "Ortografía: uso de mayúsculas y minúsculas",
    descripcion:
      "Conoce las normas del español para el uso correcto de letras mayúsculas y minúsculas según la RAE.",
    categoria: "Gramática y ortografía",
    conceptos_clave: ["mayúscula", "minúscula", "nombre propio", "norma ortográfica"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El uso correcto de mayúsculas y minúsculas es una norma ortográfica fundamental del español. La Real Academia Española (RAE) y la Asociación de Academias de la Lengua Española (ASALE) establecen en la Ortografía de la lengua española (2010) reglas claras que todo hablante culto debe conocer. Un error en el uso de las mayúsculas puede cambiar el significado o mostrar descuido en la escritura.",
        },
        {
          tipo: "subtitulo",
          contenido: "Se escribe con mayúscula inicial",
        },
        {
          tipo: "lista",
          items: [
            "La primera palabra de un texto y después de punto.",
            "Los nombres propios de personas, animales y lugares: Ana, Júpiter, Guadalajara.",
            "Los títulos de obras artísticas (solo la primera palabra): Cien años de soledad, El quijote.",
            "Los nombres de instituciones, organismos y empresas: Universidad Nacional Autónoma de México.",
            "Los apodos y sobrenombres: El Pípila, La Malinche.",
            "Los nombres de festividades y eventos históricos: Día de la Independencia, Revolución Mexicana.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Se escribe con minúscula",
        },
        {
          tipo: "lista",
          items: [
            "Los días de la semana, meses y estaciones: lunes, marzo, primavera.",
            "Los gentilicios (nombres de nacionalidad): mexicano, español, japonesa.",
            "Los cargos y títulos cuando no preceden al nombre propio: el presidente, la doctora, el director.",
            "Los nombres de los idiomas: español, inglés, náhuatl.",
          ],
        },
        {
          tipo: "callout",
          variante: "advertencia",
          contenido:
            "En las redes sociales es muy común escribir TODO EN MAYÚSCULAS para enfatizar, pero en la escritura formal esto equivale a gritar y está mal visto. También hay quien escribe 'dios' con minúscula por ideología; la RAE indica que el nombre de la divinidad monoteísta lleva mayúscula: Dios. Conocer las normas te permite decidir con plena consciencia cuándo seguirlas y cuándo transgredir las con intención.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tabla de dos columnas con ejemplos correctos e incorrectos del uso de mayúsculas, resaltando en rojo los errores comunes y en verde las formas correctas",
          caption: "Errores frecuentes en el uso de mayúsculas y su corrección.",
        },
      ],
    },
  },

  // ── 14 ─────────────────────────────────────────────────────────────────────
  {
    slug: "lc-i-signos-de-puntuacion",
    titulo: "Signos de puntuación: punto, coma y punto y coma",
    descripcion:
      "Domina los tres signos de puntuación más frecuentes del español y sus principales usos normativos.",
    categoria: "Gramática y ortografía",
    conceptos_clave: ["punto", "coma", "punto y coma", "puntuación"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Los signos de puntuación son marcas gráficas que organizan el texto escrito y ayudan al lector a interpretar correctamente el sentido de las oraciones. Una coma mal colocada puede cambiar completamente el significado de una frase: 'Comamos, niños' no dice lo mismo que 'Comamos niños'. El punto, la coma y el punto y coma son los más usados y los que más errores generan.",
        },
        {
          tipo: "subtitulo",
          contenido: "El punto",
        },
        {
          tipo: "lista",
          items: [
            "Punto y seguido: separa oraciones dentro de un mismo párrafo.",
            "Punto y aparte: cierra un párrafo y da paso al siguiente.",
            "Punto final: cierra el texto completo.",
            "También se usa en abreviaturas: Dr., Mtro., etc.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "La coma",
        },
        {
          tipo: "lista",
          items: [
            "Enumerar elementos de una serie: traje manzanas, peras, naranjas y uvas.",
            "Aislar el vocativo (a quien se habla): 'María, ven aquí' / 'Ven aquí, María'.",
            "Separar incisos explicativos: 'Juárez, el presidente más respetado, reformó las leyes.'",
            "Introducir conectores: sin embargo, por lo tanto, es decir.",
            "Indicar una omisión del verbo en oraciones yuxtapuestas: 'Él estudia biología; ella, química.'",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "El punto y coma",
        },
        {
          tipo: "parrafo",
          contenido:
            "El punto y coma indica una pausa mayor que la coma pero menor que el punto. Se usa para separar proposiciones estrechamente relacionadas ('Llegó tarde; sin embargo, nadie lo notó'), para separar elementos de una enumeración cuando algunos ya contienen comas ('Los participantes eran: Ana, de Jalisco; Carlos, de Oaxaca; y Sofía, de Chihuahua'), y antes de conectores adversativos en oraciones largas.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La coma serial —colocada antes de la última conjunción 'y' en una enumeración— es obligatoria en inglés (se llama Oxford comma) pero opcional en español. La RAE recomienda no usarla en listas simples, pero sí cuando puede haber ambigüedad de sentido.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tres tarjetas con el símbolo de cada signo (punto, coma, punto y coma), sus nombres y sus usos principales en ejemplos de oraciones",
          caption: "Usos principales del punto, la coma y el punto y coma.",
        },
      ],
    },
  },

  // ── 15 ─────────────────────────────────────────────────────────────────────
  {
    slug: "lc-i-sujeto-y-predicado",
    titulo: "El sujeto y el predicado: análisis oracional básico",
    descripcion:
      "Aprende a identificar y analizar las dos partes fundamentales de la oración en español.",
    categoria: "Gramática y ortografía",
    conceptos_clave: ["sujeto", "predicado", "núcleo", "sintagma nominal"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La oración es la unidad lingüística mínima que expresa un sentido completo. En español, la oración bimembre —la más frecuente— está formada por dos partes: el sujeto y el predicado. El sujeto indica de quién o de qué se habla; el predicado dice algo sobre el sujeto. Reconocer estas partes es el primer paso del análisis sintáctico.",
        },
        {
          tipo: "subtitulo",
          contenido: "El sujeto",
        },
        {
          tipo: "parrafo",
          contenido:
            "El sujeto es el sintagma nominal que realiza la acción del verbo o del que se habla. Su núcleo es siempre un sustantivo o un pronombre. Puede ir acompañado de determinantes (el, la, los), adjetivos (inteligente, nuevo) y otras expansiones. En español el sujeto puede omitirse cuando la desinencia verbal lo indica claramente: 'Comió tarde' tiene sujeto tácito (él/ella). Para identificar el sujeto, pregunta al verbo: ¿quién o qué + verbo?",
        },
        {
          tipo: "subtitulo",
          contenido: "El predicado",
        },
        {
          tipo: "parrafo",
          contenido:
            "El predicado es el sintagma verbal que contiene el verbo —núcleo del predicado— y todo lo que depende de él: complementos directo, indirecto, circunstancial y de régimen. El predicado verbal expresa una acción realizada por el sujeto ('La estudiante resolvió el problema'); el predicado nominal describe al sujeto a través de un verbo copulativo (ser, estar, parecer) más un atributo ('El examen es difícil').",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El verbo siempre concuerda en número y persona con el núcleo del sujeto, no con las palabras que lo rodean. Error común: 'La mayoría de los estudiantes llegaron tarde' (correcto: 'llegó', porque el núcleo es 'mayoría', singular). Analizar el sujeto con cuidado evita este tipo de falta de concordancia.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Oración 'Los alumnos del bachillerato estudian con dedicación' dividida en dos bloques de colores: sujeto (Los alumnos del bachillerato) y predicado (estudian con dedicación), con el núcleo de cada parte subrayado",
          caption: "Análisis de sujeto y predicado en una oración simple.",
        },
      ],
    },
  },

  // ── 16 ─────────────────────────────────────────────────────────────────────
  {
    slug: "lc-i-el-verbo-tiempos-y-modos",
    titulo: "El verbo: tiempos y modos de conjugación",
    descripcion:
      "Conoce los principales tiempos y modos verbales del español y aprende a conjugar verbos con corrección.",
    categoria: "Gramática y ortografía",
    conceptos_clave: ["modo indicativo", "modo subjuntivo", "tiempo verbal", "conjugación"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El verbo es la categoría gramatical más compleja del español. Expresa acciones, estados o procesos e informa sobre quién los realiza (persona), cuántos los realizan (número), cuándo ocurren (tiempo) y desde qué perspectiva del hablante (modo). Conjugar correctamente los verbos es esencial para producir textos que sean claros y gramaticalmente correctos.",
        },
        {
          tipo: "subtitulo",
          contenido: "Los modos verbales",
        },
        {
          tipo: "lista",
          items: [
            "Modo indicativo: presenta los hechos como reales o ciertos. Es el modo de los enunciados afirmativos y negativos cotidianos. Ej.: 'Ella estudia todas las noches'.",
            "Modo subjuntivo: expresa deseos, dudas, hipótesis o emociones. Ej.: 'Espero que estudies'.",
            "Modo imperativo: expresa órdenes o ruegos. Solo tiene formas propias para tú y vosotros; las demás se toman del subjuntivo. Ej.: 'Estudia más'.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Los tiempos del modo indicativo",
        },
        {
          tipo: "parrafo",
          contenido:
            "En el indicativo existen diez tiempos: presente (como/como), pretérito indefinido o perfecto simple (comí), pretérito imperfecto (comía), pretérito perfecto compuesto (he comido), pretérito pluscuamperfecto (había comido), pretérito anterior (hube comido), futuro simple (comeré), futuro compuesto (habré comido), condicional simple (comería) y condicional compuesto (habría comido). En México se usa más el indefinido ('ayer comí') que el perfecto compuesto ('hoy he comido'), a diferencia del español peninsular.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Un error muy frecuente en la escritura académica es el 'dequeísmo' (añadir 'de que' donde no corresponde: 'Pienso de que tienes razón') y el 'queísmo' (suprimir 'de que' donde sí corresponde: 'Me alegro que hayas venido'). La prueba de sustitución por 'eso' ayuda: 'Pienso eso' funciona, pero 'Me alegro eso' no, lo cual confirma que la preposición 'de' es necesaria.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tabla de conjugación del verbo 'hablar' en presente, pretérito indefinido y futuro del modo indicativo, con las seis personas gramaticales en filas y los tres tiempos en columnas",
          caption: "Conjugación de 'hablar' en tres tiempos del modo indicativo.",
        },
      ],
    },
  },

  // ── 17 ─────────────────────────────────────────────────────────────────────
  {
    slug: "lc-i-exposicion-oral",
    titulo: "La exposición oral: estructura y técnicas",
    descripcion:
      "Aprende a planear, preparar y ejecutar una exposición oral efectiva ante un público.",
    categoria: "Oralidad",
    conceptos_clave: ["exposición oral", "lenguaje no verbal", "apoyos visuales", "audiencia"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La exposición oral es una de las formas más frecuentes de comunicación en el ámbito académico y profesional. Presentar un proyecto, defender una tesis o explicar un tema ante la clase son situaciones que exigen planificación, dominio del contenido y habilidades comunicativas. Hablar bien en público es una competencia que se aprende y se perfecciona con la práctica.",
        },
        {
          tipo: "subtitulo",
          contenido: "Estructura de la exposición",
        },
        {
          tipo: "lista",
          items: [
            "Introducción: capta la atención del auditorio, presenta el tema y enuncia el propósito. Puedes comenzar con una pregunta, una anécdota, una estadística impactante o una cita.",
            "Desarrollo: presenta las ideas principales en orden lógico, con ejemplos, datos y apoyos visuales. No intentes decir todo; selecciona lo más relevante.",
            "Conclusión: sintetiza los puntos clave, retoma el propósito inicial y cierra con una idea memorable o un llamado a la reflexión.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Técnicas para hablar en público",
        },
        {
          tipo: "lista",
          items: [
            "Conoce tu tema: cuanto más domines el contenido, menos dependerás de notas y más natural será tu discurso.",
            "Practica en voz alta: de preferencia frente a un espejo o grabándote para detectar muletillas y gestos involuntarios.",
            "Controla el ritmo y el volumen: habla despacio en los puntos importantes, usa pausas estratégicas y asegúrate de que toda la sala te escuche.",
            "Mantén contacto visual: mira a diferentes partes del auditorio para crear conexión con el público.",
            "Usa apoyos visuales con moderación: las diapositivas deben complementar tu discurso, no reproducirlo textualmente.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El miedo a hablar en público (glosofobia) es uno de los temores más comunes del ser humano. Estudios muestran que más del 70% de las personas lo experimenta. Sin embargo, la investigación también demuestra que la exposición gradual y la práctica son los métodos más efectivos para superarlo.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Persona de pie frente a un auditorio con diapositivas detrás, con flechas señalando elementos de lenguaje no verbal: postura, contacto visual, gestos de manos y distancia con el público",
          caption: "Elementos del lenguaje no verbal en una exposición oral.",
        },
      ],
    },
  },

  // ── 18 ─────────────────────────────────────────────────────────────────────
  {
    slug: "lc-i-el-debate",
    titulo: "El debate: roles, argumentación y escucha activa",
    descripcion:
      "Conoce la dinámica del debate académico y desarrolla habilidades para argumentar y escuchar con respeto.",
    categoria: "Oralidad",
    conceptos_clave: ["debate", "escucha activa", "refutación", "moderador"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El debate es una práctica comunicativa oral en la que dos o más participantes defienden posturas opuestas sobre un tema, con el objetivo de persuadir a un auditorio o llegar a una posición más informada. A diferencia de la discusión informal, el debate sigue reglas precisas de tiempo, turno y argumentación. Es una herramienta fundamental del pensamiento democrático.",
        },
        {
          tipo: "subtitulo",
          contenido: "Roles en el debate",
        },
        {
          tipo: "lista",
          items: [
            "Moderador: dirige el debate, da y retira la palabra, controla los tiempos y garantiza el orden. Debe ser imparcial.",
            "Debatientes: defienden una postura con argumentos, responden preguntas y refutan los argumentos contrarios.",
            "Auditorio: escucha, evalúa los argumentos y, en algunos formatos, emite un veredicto final.",
            "Jurado (en debates formales): califica la solidez de los argumentos, no la simpatía de los participantes.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Claves para argumentar en el debate",
        },
        {
          tipo: "parrafo",
          contenido:
            "Un buen debatiente no solo tiene razones a favor de su postura: conoce también los argumentos del equipo contrario y los refuta con evidencia. La refutación efectiva no insulta ni ridiculiza al oponente; señala la debilidad lógica o la falta de evidencia en su argumento. Además, quien debate bien escucha con atención: la escucha activa le permite captar exactamente lo que el oponente dice y responderle con precisión.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Las falacias son argumentos que parecen válidos pero que tienen un error lógico. Algunas frecuentes en debates son: el ad hominem (atacar a la persona en lugar de su argumento), la falsa dicotomía (presentar solo dos opciones cuando hay más) y el hombre de paja (distorsionar el argumento del oponente para rebatirlo más fácilmente). Aprender a identificarlas te protege de ser manipulado.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mesa de debate vista desde arriba con dos equipos enfrentados, el moderador al centro, y el auditorio en semicírculo, con flechas de flujo de argumentación",
          caption: "Disposición y dinámica de un debate académico formal.",
        },
      ],
    },
  },

  // ── 19 ─────────────────────────────────────────────────────────────────────
  {
    slug: "lc-i-publicidad-y-propaganda",
    titulo: "Publicidad y propaganda: análisis de mensajes",
    descripcion:
      "Analiza críticamente los mensajes publicitarios y propagandísticos para reconocer sus estrategias persuasivas.",
    categoria: "Comprensión lectora",
    conceptos_clave: ["publicidad", "propaganda", "persuasión", "mensaje implícito"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Vivimos rodeados de mensajes que buscan influir en nuestras decisiones, creencias y comportamientos. La publicidad y la propaganda son dos de las formas más poderosas de comunicación persuasiva. Aprender a analizarlas críticamente es una habilidad de supervivencia en la sociedad contemporánea.",
        },
        {
          tipo: "subtitulo",
          contenido: "Publicidad vs. propaganda",
        },
        {
          tipo: "parrafo",
          contenido:
            "La publicidad busca promover el consumo de productos o servicios con fines comerciales. La propaganda, en cambio, busca difundir ideas o doctrinas —especialmente políticas o ideológicas— para influir en la opinión pública. Ambas usan técnicas similares, pero sus propósitos son distintos. La publicidad nos dice 'compra esto'; la propaganda nos dice 'cree esto' o 'apoya a este partido'.",
        },
        {
          tipo: "subtitulo",
          contenido: "Estrategias persuasivas más comunes",
        },
        {
          tipo: "lista",
          items: [
            "Apelación a la emoción: genera miedo, alegría, nostalgia o amor para nublar el razonamiento crítico.",
            "Testimonial: usa a una persona famosa o un 'experto' para recomendar el producto o la idea.",
            "Repetición: el mensaje se repite tantas veces que se vuelve familiar y por lo tanto creíble.",
            "Bandwagon (efecto de arrastre): 'todo el mundo lo hace/usa/piensa', así que tú también deberías.",
            "Imagen aspiracional: muestra un estilo de vida deseado que supuestamente el producto puede proporcionar.",
            "Lenguaje hiperbólico: 'el mejor', 'el único', 'incomparable', sin ofrecer evidencia que lo sustente.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Analizar un anuncio publicitario implica preguntarse: ¿quién lo produce?, ¿a quién va dirigido?, ¿qué mensaje explícito transmite?, ¿qué mensaje implícito o ideología subyace?, ¿qué emociones activa?, ¿qué técnicas visuales usa (colores, composición, música)? Estas preguntas te convierten en un lector activo de la cultura visual.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Anuncio publicitario genérico analizado con flechas y etiquetas que señalan sus componentes: eslogan, imagen aspiracional, tipografía, colores y mensaje implícito",
          caption: "Análisis de los elementos de un mensaje publicitario.",
        },
      ],
    },
  },

  // ── 20 ─────────────────────────────────────────────────────────────────────
  {
    slug: "lc-i-la-carta-formal",
    titulo: "La carta formal: estructura y registro",
    descripcion:
      "Aprende a redactar una carta formal siguiendo las convenciones del registro escrito oficial.",
    categoria: "Producción escrita",
    conceptos_clave: ["carta formal", "registro formal", "destinatario", "saludo protocolario"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La carta formal es un documento escrito que se dirige a una persona o institución en un contexto oficial o profesional. A diferencia de los mensajes informales, la carta formal tiene una estructura fija y usa un registro elevado y respetuoso. Se emplea para solicitar información, hacer trámites, presentar quejas, agradecer formalmente o establecer acuerdos.",
        },
        {
          tipo: "subtitulo",
          contenido: "Partes de la carta formal",
        },
        {
          tipo: "lista",
          items: [
            "Lugar y fecha: en la parte superior derecha o izquierda. Ej.: 'Ciudad de México, 18 de mayo de 2026'.",
            "Datos del destinatario: nombre, cargo e institución. Ej.: 'Lic. Roberto García, Director del Plantel 12'.",
            "Saludo o encabezado: fórmula de cortesía. Ej.: 'Estimado(a) señor(a):', 'Distinguido director:'.",
            "Cuerpo: desarrollo del mensaje, dividido en párrafos claros y concisos.",
            "Despedida: fórmula de cierre. Ej.: 'Sin más por el momento, quedo a sus órdenes.', 'Atentamente,'.",
            "Firma: nombre completo, cargo (si aplica) y datos de contacto.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Características del registro formal",
        },
        {
          tipo: "parrafo",
          contenido:
            "El registro formal evita contracciones, coloquialismos y expresiones informales. Las oraciones son completas y bien construidas; el vocabulario es preciso y culto. Se usan fórmulas de tratamiento apropiadas (usted, estimado, atentamente). Se evita el uso de emojis, abreviaturas informales (pq, xq, etc.) y signos de exclamación o interrogación múltiples.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "En la era del correo electrónico, la carta formal ha migrado al formato digital. Un correo electrónico formal sigue exactamente las mismas convenciones que una carta en papel: asunto claro, saludo, cuerpo bien organizado y despedida con firma. La informalidad del medio no justifica la informalidad del mensaje cuando el contexto es profesional o académico.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Plantilla de carta formal con sus partes etiquetadas mediante flechas: membrete, fecha, destinatario, saludo, cuerpo dividido en tres párrafos, despedida y firma",
          caption: "Estructura completa de una carta formal.",
        },
      ],
    },
  },

  // ── 21 ─────────────────────────────────────────────────────────────────────
  {
    slug: "lc-i-acento-ortografico-reglas",
    titulo: "El acento ortográfico: reglas de acentuación",
    descripcion:
      "Comprende y aplica las reglas de acentuación gráfica del español: palabras agudas, graves, esdrújulas y sobreesdrújulas.",
    categoria: "Gramática y ortografía",
    conceptos_clave: ["acento ortográfico", "tilde", "palabra aguda", "palabra esdrújula"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El acento es la mayor intensidad de voz con que se pronuncia una sílaba dentro de una palabra. Ese acento es prosódico (de pronunciación) y existe en todas las palabras. El acento ortográfico o tilde (´) es la representación gráfica de ese acento en algunos casos específicos que determinan las reglas de acentuación del español. Saber cuándo poner tilde es una de las competencias ortográficas más evaluadas.",
        },
        {
          tipo: "subtitulo",
          contenido: "Clasificación de palabras por posición del acento",
        },
        {
          tipo: "lista",
          items: [
            "Agudas: el acento cae en la última sílaba. Llevan tilde cuando terminan en vocal, en 'n' o en 's'. Ejemplos: café, canción, compás. No llevan tilde: reloj, ciudad.",
            "Graves o llanas: el acento cae en la penúltima sílaba. Llevan tilde cuando NO terminan en vocal, 'n' o 's'. Ejemplos: árbol, cárcel, fácil. No llevan tilde: casa, examen.",
            "Esdrújulas: el acento cae en la antepenúltima sílaba. Siempre llevan tilde. Ejemplos: médico, sílaba, técnica.",
            "Sobreesdrújulas: el acento cae antes de la antepenúltima. Siempre llevan tilde. Ejemplos: dígamelo, cómetelo.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Acentos especiales",
        },
        {
          tipo: "parrafo",
          contenido:
            "El acento diacrítico distingue palabras que se escriben igual pero tienen significado diferente: 'tú' (pronombre) vs 'tu' (posesivo); 'él' (pronombre) vs 'el' (artículo); 'sé' (verbo) vs 'se' (pronombre). Los interrogativos y exclamativos llevan tilde: ¿qué?, ¿cómo?, ¿dónde?, a diferencia de sus equivalentes relativos o conjunciones: que, como, donde.",
        },
        {
          tipo: "callout",
          variante: "advertencia",
          contenido:
            "Desde 2010, la RAE eliminó la tilde en 'solo' (adverbio) y en los demostrativos 'este', 'ese', 'aquel' y sus plurales, incluso cuando funcionan como pronombres. Estas formas ya no llevan tilde en ningún caso. Si usas un corrector ortográfico antiguo o estudias con libros anteriores a 2010, verifica que tus fuentes estén actualizadas.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Cuatro columnas con ejemplos de palabras agudas, graves, esdrújulas y sobreesdrújulas, con la sílaba tónica resaltada en negrita y la tilde marcada en rojo cuando corresponde",
          caption: "Clasificación de palabras según la posición del acento y reglas de tildación.",
        },
      ],
    },
  },

  // ── 22 ─────────────────────────────────────────────────────────────────────
  {
    slug: "lc-i-redaccion-digital",
    titulo: "Redacción digital: escritura en redes sociales",
    descripcion:
      "Reflexiona sobre las características del lenguaje en entornos digitales y cómo adaptar la escritura a distintos contextos en línea.",
    categoria: "Comunicación",
    conceptos_clave: ["escritura digital", "netiqueta", "hipertexto", "lenguaje en redes"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La irrupción de internet y las redes sociales ha transformado radicalmente las formas de escritura. Hoy escribimos más que nunca —mensajes, publicaciones, comentarios, correos, foros— pero en contextos, formatos y con propósitos muy distintos a los de la escritura tradicional. La escritura digital no es inferior a la escritura en papel, pero sí tiene sus propias reglas, convenciones y desafíos.",
        },
        {
          tipo: "subtitulo",
          contenido: "Características del lenguaje digital",
        },
        {
          tipo: "lista",
          items: [
            "Brevedad: los formatos digitales favorecen los textos cortos y directos. Un tweet tiene 280 caracteres; una historia de Instagram dura segundos.",
            "Hipertextualidad: los textos digitales incluyen enlaces que llevan a otros textos, creando redes de significado.",
            "Multimodalidad: el texto se combina con imágenes, videos, emojis y audios para enriquecer el mensaje.",
            "Inmediatez: la escritura digital se produce rápido y llega al instante, lo que aumenta el riesgo de errores.",
            "Interactividad: los lectores pueden responder, compartir y reaccionar, convirtiendo la comunicación en un diálogo colectivo.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Netiqueta: la etiqueta en internet",
        },
        {
          tipo: "parrafo",
          contenido:
            "La netiqueta es el conjunto de normas de comportamiento y comunicación en los espacios digitales. Incluye: no escribir en mayúsculas (equivale a gritar); respetar la privacidad de los demás; verificar la información antes de compartirla; no insultar ni acosar en los comentarios; citar las fuentes de imágenes o textos que reutilizamos. En contextos académicos o profesionales, aunque el medio sea digital, el registro debe mantenerse formal.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Lo que publicas en internet puede permanecer para siempre, incluso si lo borras. Las capturas de pantalla, el caché de buscadores y los servidores de archivo guardan copias de casi todo. Antes de publicar, reflexiona: ¿estarías cómodo si tu familia, tu escuela o un futuro empleador viera este contenido? Esa pregunta puede ahorrarte muchos problemas.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Collage de interfaces de diferentes redes sociales (mensajería, microblog, correo electrónico) con globos de texto que muestran la adaptación del registro según la plataforma",
          caption: "El registro escrito se adapta según la plataforma y el contexto digital.",
        },
        {
          tipo: "cita",
          contenido:
            "La escritura es la pintura de la voz.",
          fuente: "Voltaire, filósofo ilustrado francés",
        },
      ],
    },
  },
] as const;

// ---------------------------------------------------------------------------
// FUNCIÓN PRINCIPAL
// ---------------------------------------------------------------------------

export async function seedBibliotecaLCI(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed Biblioteca LC-I (22 fichas)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", "LC-I")
    .single();

  if (uacErr || !uacRow) {
    throw new Error(
      `UAC LC-I no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`
    );
  }

  const rows = FICHAS_LCI.map((f) => ({
    uac_id: uacRow.id,
    slug: f.slug,
    titulo: f.titulo,
    categoria: f.categoria,
    conceptos_clave: f.conceptos_clave as unknown as string[],
    tiempo_lectura_minutos: f.tiempo_lectura_minutos,
    es_placeholder: f.es_placeholder,
    contenido: f.contenido,
  }));

  const { error } = await sb
    .from("fichas_biblioteca")
    .upsert(rows, { onConflict: "slug" });

  if (error) throw new Error(`Error seeding fichas LC-I: ${error.message}`);

  console.log(`  ✓ ${rows.length} fichas de biblioteca de LC-I insertadas/actualizadas.`);
  console.log("\n✅ Seed Biblioteca LC-I completado.\n");
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
  seedBibliotecaLCI(sb).catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
}

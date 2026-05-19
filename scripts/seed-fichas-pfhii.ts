/**
 * Seed de fichas de biblioteca para PFH-II (Pensamiento Filosófico y Humanidades II).
 * 16 fichas temáticas alineadas al MCCEMS 2025, Semestre 2.
 *
 * Uso: npx tsx scripts/seed-fichas-pfhii.ts
 * Idempotente: upsert por campo "slug".
 *
 * Meta educativa: Desarrolle la capacidad de problematizar el conocimiento y la
 * realidad desde categorías filosóficas —ontológicas, éticas y epistemológicas—
 * con perspectiva de género y humanismo mexicano.
 *
 * Propósitos:
 *   1. Ontología y categorías del ser
 *   2. Fundamentos éticos (deontología, utilitarismo, virtud, cuidado)
 *   3. Bioética y ética ambiental
 *   4. Filosofía feminista y perspectiva de género
 *   5. Humanismo mexicano y Filosofía de la Liberación
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

const FICHAS_PFHII = [
  // ── 1 ──────────────────────────────────────────────────────────────────────
  {
    slug: "pfh-ii-que-es-la-filosofia",
    titulo: "¿Qué es la filosofía y para qué sirve en el siglo XXI?",
    categoria: "Filosofía",
    conceptos_clave: ["filosofía", "asombro", "reflexión crítica", "pregunta filosófica", "saber"],
    tiempo_lectura_minutos: 6,
    es_placeholder: false,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La palabra filosofía proviene del griego philos (amor) y sophia (sabiduría): amor a la sabiduría. No se trata, sin embargo, de acumular datos o memorizar respuestas, sino de desarrollar la capacidad de preguntar con radicalidad. La filosofía se pregunta por lo que los demás saberes dan por sentado: ¿qué es el conocimiento?, ¿qué es lo real?, ¿qué debemos hacer?, ¿qué es lo justo? Estas preguntas no tienen respuestas fáciles ni definitivas, y precisamente por eso son filosóficas.",
        },
        {
          tipo: "subtitulo",
          contenido: "Las ramas principales de la filosofía",
        },
        {
          tipo: "lista",
          items: [
            "Ontología o Metafísica: estudia la naturaleza del ser y la realidad. ¿Qué existe? ¿Qué es real?",
            "Epistemología o Teoría del conocimiento: estudia cómo conocemos. ¿Qué es el conocimiento? ¿Cuáles son sus límites?",
            "Ética: estudia la conducta moral. ¿Qué está bien y qué está mal? ¿Cómo debemos vivir?",
            "Estética: estudia la experiencia de lo bello y el arte. ¿Qué es la belleza? ¿Qué es el arte?",
            "Filosofía política: estudia el poder, la justicia y la organización social.",
            "Lógica: estudia las formas correctas del razonamiento y la argumentación.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "En el siglo XXI, la filosofía tiene una relevancia que rara vez se discute pero que es evidente: vivimos en un mundo saturado de información, desinformación y tecnología. La inteligencia artificial plantea preguntas sobre la conciencia y la dignidad humana. Las redes sociales generan burbujas ideológicas que erosionan el debate público. La crisis climática exige repensar nuestra relación con la naturaleza. Todas estas son, en el fondo, preguntas filosóficas que necesitan herramientas filosóficas para responderse.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Aristóteles escribió: 'El asombro (thaumazein) es el principio de la filosofía.' Cuando algo nos sorprende, cuando algo que creíamos saber de repente se nos vuelve extraño y problemático, estamos en el umbral del filosofar. La filosofía no es un lujo académico: es la práctica de no aceptar el mundo tal como nos lo presentan sin haberlo examinado críticamente.",
        },
        {
          tipo: "parrafo",
          contenido:
            "Una distinción importante para este semestre es la que existe entre filosofía como actividad (el acto de filosofar, de cuestionar, de argumentar) y filosofía como corpus de ideas (el conjunto de textos y corrientes que componen la historia del pensamiento filosófico). Ambas dimensiones son necesarias: sin la historia de la filosofía, reinventamos la rueda; sin la actividad filosófica, la historia se convierte en un museo.",
        },
        {
          tipo: "cita",
          contenido:
            "La filosofía es una batalla contra el embrujo de nuestra inteligencia por medio del lenguaje.",
          fuente: "Ludwig Wittgenstein, filósofo austríaco-británico, Investigaciones filosóficas (1953)",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Según datos del Programa para la Evaluación Internacional de Estudiantes (PISA), los países donde se enseña filosofía en la educación media —como Francia, que la tiene como asignatura obligatoria en el bachillerato desde el siglo XIX— muestran mejores resultados en razonamiento crítico y argumentación escrita. La filosofía no es decorativa: es un entrenamiento cognitivo fundamental.",
        },
      ],
    },
  },

  // ── 2 ──────────────────────────────────────────────────────────────────────
  {
    slug: "pfh-ii-ontologia-el-ser",
    titulo: "Ontología: la pregunta por el ser",
    categoria: "Filosofía",
    conceptos_clave: ["ontología", "ser", "existencia", "Heidegger", "diferencia ontológica"],
    tiempo_lectura_minutos: 7,
    es_placeholder: false,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La ontología (del griego ontos, ser, y logos, estudio) es la rama de la filosofía que pregunta por el ser en cuanto ser: ¿qué significa que algo exista? ¿Qué hay en el mundo? ¿Qué tipos de cosas son reales? No se limita a preguntar por los objetos particulares —eso lo hacen las ciencias— sino por las condiciones más generales y fundamentales de todo lo que existe. Es, literalmente, la pregunta más profunda que puede hacerse.",
        },
        {
          tipo: "subtitulo",
          contenido: "La diferencia entre ser y ente",
        },
        {
          tipo: "parrafo",
          contenido:
            "El filósofo alemán Martin Heidegger (1889–1976) propuso en su obra capital Ser y Tiempo (1927) una distinción fundamental: la diferencia entre el Ser (Sein) y los entes (Seiendes). Los entes son todas las cosas que existen: una piedra, un árbol, un ser humano, Dios, los números. El Ser, en cambio, no es una cosa más entre las cosas, sino el hecho mismo de que algo existe, la condición de posibilidad de todo lo que hay. Heidegger llamó a esto la 'diferencia ontológica'.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Heidegger escribió: 'El ser del ente no es, él mismo, un ente.' Esto quiere decir que el Ser no puede estudiarse como si fuera un objeto más. La ciencia estudia entes; la ontología estudia el Ser. Este giro, según Heidegger, es lo que la filosofía occidental había olvidado desde Platón, y recuperarlo era la tarea más urgente del pensamiento.",
        },
        {
          tipo: "subtitulo",
          contenido: "El Dasein: el ser-en-el-mundo",
        },
        {
          tipo: "parrafo",
          contenido:
            "Heidegger introduce el concepto de Dasein (literalmente: 'ser-ahí') para referirse al ser humano, pero de una manera muy específica: el Dasein es el único ente para quien su propio ser es una pregunta. Una piedra no se pregunta qué es ser una piedra; el ser humano sí se pregunta qué es existir. Además, el Dasein siempre existe en situación: siempre está arrojado en un mundo concreto, en una época, en una cultura, en un cuerpo, con otros. No hay un yo abstracto y atemporal: existimos siempre en el mundo.",
        },
        {
          tipo: "parrafo",
          contenido:
            "La pregunta ontológica por el ser tiene consecuencias prácticas profundas. Si preguntamos qué tipo de ser tiene una persona —en relación con su origen, su género, su condición social— estamos haciendo una pregunta ontológica que afecta directamente los derechos y el reconocimiento que esa persona recibe. Las categorías ontológicas no son neutrales: producen efectos políticos y sociales concretos.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama que muestra la diferencia entre el Ser (nivel ontológico) y los entes particulares (nivel óntico), con el Dasein como el ente que pregunta por el ser",
          caption: "La diferencia ontológica de Heidegger: Ser y entes.",
        },
        {
          tipo: "cita",
          contenido:
            "La pregunta por el ser —la pregunta de las preguntas— es también la pregunta más olvidada.",
          fuente: "Martin Heidegger, Ser y Tiempo (1927)",
        },
      ],
    },
  },

  // ── 3 ──────────────────────────────────────────────────────────────────────
  {
    slug: "pfh-ii-realismo-idealismo-materialismo",
    titulo: "Realismo, idealismo y materialismo: ¿qué es la realidad?",
    categoria: "Filosofía",
    conceptos_clave: ["realismo", "idealismo", "materialismo", "ontología", "Descartes", "Marx"],
    tiempo_lectura_minutos: 7,
    es_placeholder: false,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una de las preguntas más fundamentales de la ontología es: ¿qué tipo de cosas son reales? ¿Existe el mundo material independientemente de que lo pensemos, o la realidad es de algún modo dependiente de la mente? ¿Son reales únicamente los objetos físicos, o también existen entidades inmateriales como los números, los valores morales o los dioses? Las tres grandes respuestas a estas preguntas son el realismo, el idealismo y el materialismo.",
        },
        {
          tipo: "subtitulo",
          contenido: "El realismo",
        },
        {
          tipo: "parrafo",
          contenido:
            "El realismo sostiene que existe una realidad independiente de la mente y del conocimiento que tengamos de ella. El mundo está ahí afuera: los árboles, las piedras y las estrellas existían antes de que hubiera seres humanos para pensarlos. El realismo puede ser ingenuo (el mundo es exactamente como lo percibimos) o crítico (el mundo existe independientemente, pero nuestras percepciones pueden distorsionarlo). El sentido común cotidiano es generalmente realista.",
        },
        {
          tipo: "subtitulo",
          contenido: "El idealismo",
        },
        {
          tipo: "parrafo",
          contenido:
            "El idealismo afirma que la realidad es, en algún sentido fundamental, mental o espiritual. El idealismo de Platón sostiene que las Ideas o Formas son más reales que los objetos físicos. El idealismo subjetivo de George Berkeley (siglo XVIII) va más lejos: esse est percipi, ser es ser percibido; los objetos solo existen en la medida en que son percibidos por una mente. El idealismo alemán de Hegel propone que la realidad es el despliegue del Espíritu Absoluto en la historia.",
        },
        {
          tipo: "subtitulo",
          contenido: "El materialismo",
        },
        {
          tipo: "parrafo",
          contenido:
            "El materialismo sostiene que la única realidad existente es la materia y sus transformaciones. La mente, la conciencia, las ideas, los valores: todo es resultado de procesos materiales. El materialismo antiguo (Demócrito, Epicuro) postulaba que todo está hecho de átomos. El materialismo dialéctico de Marx y Engels propone que la realidad social es determinada por las condiciones materiales de producción: 'No es la conciencia de los hombres la que determina su ser, sino, por el contrario, el ser social es lo que determina su conciencia.'",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La disputa entre idealismo y materialismo no es solo académica: tiene consecuencias políticas directas. El idealismo tiende a explicar los problemas sociales como problemas de ideas o de conciencia; el materialismo los explica como problemas de condiciones materiales. ¿El racismo es un problema de mentalidades que hay que cambiar mediante educación, o es un problema de estructuras económicas y políticas que hay que transformar? La respuesta depende, en parte, de qué ontología social adoptemos.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Triángulo ontológico con realismo, idealismo y materialismo en cada vértice, con sus representantes y tesis principales",
          caption: "Las tres grandes posiciones ontológicas sobre la naturaleza de la realidad.",
        },
        {
          tipo: "cita",
          contenido:
            "No es la conciencia de los hombres la que determina su ser, sino, por el contrario, el ser social es lo que determina su conciencia.",
          fuente: "Karl Marx, Prólogo a la Contribución a la crítica de la Economía Política (1859)",
        },
      ],
    },
  },

  // ── 4 ──────────────────────────────────────────────────────────────────────
  {
    slug: "pfh-ii-epistemologia-como-conocemos",
    titulo: "Epistemología: ¿cómo conocemos la realidad?",
    categoria: "Filosofía",
    conceptos_clave: ["epistemología", "conocimiento", "racionalismo", "empirismo", "verdad", "Descartes"],
    tiempo_lectura_minutos: 7,
    es_placeholder: false,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La epistemología (del griego episteme, conocimiento, y logos, estudio) es la disciplina filosófica que investiga la naturaleza, el origen y los límites del conocimiento humano. Sus preguntas no parecen urgentes a primera vista —¿cómo no vamos a saber cómo sabemos?— pero se vuelven indispensables cuando nos preguntamos cuándo estamos justificados en creer algo, qué diferencia hay entre opinión y conocimiento, por qué los humanos nos equivocamos tan sistemáticamente, y cómo la cultura y el poder moldean lo que consideramos verdadero.",
        },
        {
          tipo: "subtitulo",
          contenido: "Racionalismo y empirismo",
        },
        {
          tipo: "lista",
          items: [
            "Racionalismo (Descartes, Leibniz, Spinoza): el conocimiento genuino proviene de la razón, no de los sentidos, que son engañosos. Hay verdades innatas grabadas en nuestra mente.",
            "Empirismo (Locke, Hume, Berkeley): la mente al nacer es una tabula rasa; todo conocimiento tiene su origen en la experiencia sensorial.",
            "Criticismo kantiano: Kant propuso una síntesis: el conocimiento resulta de la combinación de datos sensoriales (que nos llegan del mundo) y estructuras racionales a priori (que nuestra mente aporta para organizar esos datos).",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "René Descartes, en sus Meditaciones metafísicas (1641), emprendió el proyecto de dudar de todo para encontrar un fundamento absolutamente cierto del conocimiento. Dudó de los sentidos (que a veces engañan), de la realidad del mundo externo (podría ser un sueño), incluso de las verdades matemáticas (podría haber un 'genio maligno' que lo engañara). Pero había algo de lo que no podía dudar: el hecho mismo de que estaba dudando. Y dudar es pensar. 'Cogito ergo sum': pienso, luego existo. El pensamiento es el único punto arquimédico indudable.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La epistemología tiene dimensiones políticas fundamentales que a menudo se ignoran. ¿Quién tiene autoridad para producir conocimiento? ¿Por qué el conocimiento científico occidental ha sido históricamente considerado superior a otros sistemas de conocimiento? La epistemología feminista y la epistemología del sur (Boaventura de Sousa Santos) cuestionan estas jerarquías y proponen formas de conocimiento más plurales e inclusivas.",
        },
        {
          tipo: "parrafo",
          contenido:
            "El problema de la verdad es central en epistemología. Las principales teorías son: la teoría de la correspondencia (una afirmación es verdadera si corresponde a los hechos del mundo), la teoría de la coherencia (una afirmación es verdadera si es coherente con el sistema de creencias del que forma parte), y el pragmatismo (una afirmación es verdadera si funciona, si nos permite actuar exitosamente en el mundo). En la era de la posverdad y las noticias falsas, entender qué es la verdad y cómo justificarla es más urgente que nunca.",
        },
        {
          tipo: "cita",
          contenido:
            "Pienso, luego existo. Esta verdad es tan firme y segura que todas las extravagantes suposiciones de los escépticos no son capaces de hacerla tambalear.",
          fuente: "René Descartes, El discurso del método (1637)",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama comparativo de racionalismo, empirismo y criticismo kantiano, con sus fuentes del conocimiento, filósofos representativos y ejemplos",
          caption: "Las tres grandes tradiciones epistemológicas occidentales.",
        },
      ],
    },
  },

  // ── 6 ──────────────────────────────────────────────────────────────────────
  {
    slug: "pfh-ii-etica-que-es",
    titulo: "Ética: la filosofía de la vida buena y lo correcto",
    categoria: "Ética",
    conceptos_clave: ["ética", "moral", "bien", "corrección moral", "dilema ético", "autonomía moral"],
    tiempo_lectura_minutos: 6,
    es_placeholder: false,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La ética es la disciplina filosófica que reflexiona sobre la moral: estudia los principios, valores y normas que guían el comportamiento humano y trata de fundamentarlos racionalmente. La pregunta central de la ética es doble: ¿qué es bueno? (la pregunta por la vida buena o la felicidad) y ¿qué está bien hacer? (la pregunta por la corrección moral de las acciones). No todas las culturas dan la misma respuesta, pero todas tienen respuestas.",
        },
        {
          tipo: "subtitulo",
          contenido: "La distinción entre ética y moral",
        },
        {
          tipo: "parrafo",
          contenido:
            "Aunque en el uso cotidiano 'ética' y 'moral' se emplean como sinónimos, en filosofía se establece una distinción útil. La moral es el conjunto de normas, valores y prácticas concretas que una persona o comunidad reconoce como obligatorias: 'no mentirás', 'honra a tus padres', 'no robarás'. La ética, en cambio, es la reflexión filosófica sobre esa moral: analiza sus fundamentos, examina si sus principios son coherentes, busca justificarlos (o cuestionarlos) racionalmente. La ética es la filosofía de la moral.",
        },
        {
          tipo: "subtitulo",
          contenido: "Los niveles de reflexión ética",
        },
        {
          tipo: "lista",
          items: [
            "Ética normativa: busca establecer principios que guíen la conducta. ¿Qué debemos hacer? (deontología, utilitarismo, ética de la virtud).",
            "Metaética: reflexiona sobre la naturaleza de los conceptos morales. ¿Qué significa 'bueno'? ¿Son los juicios morales objetivos o subjetivos?",
            "Ética aplicada: aplica principios éticos a dominios específicos: bioética, ética empresarial, ética del medio ambiente, ética de la inteligencia artificial.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La autonomía moral es la capacidad de darse a uno mismo las propias reglas de conducta mediante la razón, sin depender de una autoridad externa (Dios, el Estado, las costumbres). Kant consideraba la autonomía el fundamento de la dignidad humana: somos dignos de respeto porque somos capaces de actuar por principios racionales que nosotros mismos nos imponemos. La heteronomía moral, en cambio, es actuar por obediencia, miedo o hábito.",
        },
        {
          tipo: "parrafo",
          contenido:
            "Los dilemas éticos son situaciones en las que no hay una respuesta clara y correcta, o en las que los principios morales entran en conflicto entre sí. El famoso dilema del tranvía: un tranvía sin frenos va a atropellar a cinco personas; puedes desviar el tranvía hacia una vía donde hay una sola persona. ¿Lo haces? ¿Cambiaría tu respuesta si en lugar de desviar el tranvía tuvieras que empujar físicamente a alguien a las vías para detenerlo? Los dilemas no tienen respuestas correctas únicas, pero pensar en ellos nos ayuda a clarificar qué valores tenemos y cómo los jerarquizamos.",
        },
        {
          tipo: "cita",
          contenido:
            "Actúa de tal manera que trates a la humanidad, tanto en tu persona como en la persona de cualquier otro, siempre como un fin y nunca solo como un medio.",
          fuente: "Immanuel Kant, Fundamentación de la metafísica de las costumbres (1785)",
        },
      ],
    },
  },

  // ── 7 ──────────────────────────────────────────────────────────────────────
  {
    slug: "pfh-ii-etica-kantiana-deber",
    titulo: "Ética deontológica: el deber y el imperativo categórico de Kant",
    categoria: "Ética",
    conceptos_clave: ["deontología", "imperativo categórico", "deber", "Kant", "universalidad", "dignidad"],
    tiempo_lectura_minutos: 8,
    es_placeholder: false,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La ética deontológica (del griego deon, deber) es la teoría moral que sostiene que la corrección de una acción no depende de sus consecuencias sino de la naturaleza de la acción misma: de si sigue o viola un principio moral. Su representante más influyente es Immanuel Kant (1724–1804), quien propuso que la moralidad no puede basarse en inclinaciones, emociones o consecuencias, sino únicamente en la razón pura. Una acción es moralmente buena solo si se realiza por deber y de acuerdo con un principio racional universal.",
        },
        {
          tipo: "subtitulo",
          contenido: "El imperativo categórico",
        },
        {
          tipo: "parrafo",
          contenido:
            "El concepto central de la ética kantiana es el imperativo categórico: un mandato incondicional que la razón se da a sí misma y que se aplica a todos los seres racionales sin excepción. A diferencia de los imperativos hipotéticos ('si quieres X, haz Y'), el imperativo categórico manda incondicionalmente: 'haz X' sin importar tus deseos o las consecuencias. Kant formuló este imperativo de varias maneras, siendo las dos más importantes:",
        },
        {
          tipo: "lista",
          items: [
            "Fórmula de la universalidad: 'Obra solo según una máxima tal que puedas querer al mismo tiempo que se torne ley universal.' Antes de actuar, pregúntate: ¿qué pasaría si todos hicieran lo mismo que yo estoy a punto de hacer?",
            "Fórmula de la humanidad: 'Actúa de tal manera que trates a la humanidad, tanto en tu persona como en la de cualquier otro, siempre como un fin y nunca solo como un medio.'",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La prueba de la universalidad de Kant revela las contradicciones de ciertas acciones. Por ejemplo: ¿es correcto mentir para salir de un apuro? Si todos mintieran cuando fuera conveniente, la institución de la promesa y la confianza desaparecerían, y entonces la propia mentira perdería su sentido (no podría engañar a nadie porque nadie creería nada). La mentira no puede universalizarse sin contradicción, por lo tanto es moralmente incorrecta.",
        },
        {
          tipo: "parrafo",
          contenido:
            "La segunda formulación —tratar a las personas siempre como fines y nunca solo como medios— tiene implicaciones enormes. Significa que explotar a otra persona para nuestro beneficio, usarla instrumentalmente sin considerar sus propios fines y dignidad, viola un principio moral fundamental. Kant fundamentó así la noción de dignidad humana: todo ser racional tiene un valor absoluto (dignidad) que no puede ser intercambiado por ningún precio.",
        },
        {
          tipo: "parrafo",
          contenido:
            "Las críticas a la ética kantiana son también poderosas. ¿Qué pasa cuando dos deberes entran en conflicto? ¿Es correcto decir la verdad a un asesino sobre el paradero de su víctima? ¿Las consecuencias no importan absolutamente nada? La ética deontológica ha sido criticada por su rigidez, pero también ha sido enormemente influyente en el pensamiento sobre los derechos humanos, que también son incondicionales: no pueden suspenderse por razones de utilidad.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama del imperativo categórico con sus dos formulaciones principales, ejemplos de aplicación y contraste con el imperativo hipotético",
          caption: "El imperativo categórico de Kant: las dos formulaciones principales.",
        },
        {
          tipo: "cita",
          contenido:
            "Dos cosas colman el ánimo con admiración y veneración siempre nuevas y crecientes: el cielo estrellado sobre mí y la ley moral en mí.",
          fuente: "Immanuel Kant, Crítica de la razón práctica (1788)",
        },
      ],
    },
  },

  // ── 8 ──────────────────────────────────────────────────────────────────────
  {
    slug: "pfh-ii-utilitarismo-mill",
    titulo: "Utilitarismo: el mayor bien para el mayor número",
    categoria: "Ética",
    conceptos_clave: ["utilitarismo", "Mill", "Bentham", "consecuencialismo", "bienestar", "placer"],
    tiempo_lectura_minutos: 7,
    es_placeholder: false,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El utilitarismo es la teoría moral más influyente de la tradición anglosajona. Pertenece a la familia del consecuencialismo: sostiene que la corrección o incorrección de una acción depende exclusivamente de sus consecuencias. La formulación clásica fue hecha por Jeremy Bentham (1748–1832): la acción correcta es la que produce la mayor cantidad de felicidad (placer y ausencia de dolor) para el mayor número de personas. El bienestar agregado es el criterio moral supremo.",
        },
        {
          tipo: "subtitulo",
          contenido: "John Stuart Mill y el utilitarismo refinado",
        },
        {
          tipo: "parrafo",
          contenido:
            "John Stuart Mill (1806–1873) refinó el utilitarismo de Bentham introduciendo una distinción cualitativa entre placeres. No todos los placeres son iguales: los placeres intelectuales y morales son superiores a los puramente físicos. 'Es mejor ser Sócrates insatisfecho que un tonto satisfecho', escribió Mill. Esta distinción respondía a la objeción de que el utilitarismo reducía la moralidad a una 'filosofía de cerdos'.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El utilitarismo tiene aplicaciones directas en política pública: justifica acciones que beneficien al mayor número aunque perjudiquen a unos pocos. El impuesto progresivo, las cuarentenas sanitarias o los programas de salud pública se justifican frecuentemente con argumentos utilitaristas. Sin embargo, también puede justificar violaciones de derechos individuales: si torturar a un inocente salvara a mil personas, ¿sería correcto? El utilitarismo dice que sí si las consecuencias son suficientemente buenas.",
        },
        {
          tipo: "subtitulo",
          contenido: "Utilitarismo del acto y utilitarismo de la regla",
        },
        {
          tipo: "lista",
          items: [
            "Utilitarismo del acto: cada acción individual debe evaluarse por sus propias consecuencias. En cada situación, pregunta: ¿qué acción produce más bienestar?",
            "Utilitarismo de la regla: debemos seguir aquellas reglas que, si se siguieran universalmente, producirían el mayor bienestar. No calcules caso por caso; sigue la regla 'no mentir' porque la honestidad generalizada produce más bienestar que la mentira generalizada.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "Mill también fue un precursor del feminismo filosófico. En La sujeción de la mujer (1869), argumentó desde premisas utilitaristas que la exclusión de las mujeres de la vida pública, el voto y la educación era doblemente injusta: primero, porque privaba a las mujeres de su desarrollo pleno; segundo, porque privaba a la sociedad del talento y la inteligencia de la mitad de su población. Si el objetivo es el mayor bienestar para el mayor número, excluir a las mujeres reduce el bienestar total.",
        },
        {
          tipo: "cita",
          contenido:
            "El credo que acepta como fundamento de la moral la utilidad, o el principio de la mayor felicidad, sostiene que las acciones son correctas en la proporción en que tienden a promover la felicidad, e incorrectas en la proporción en que tienden a producir lo contrario de la felicidad.",
          fuente: "John Stuart Mill, Utilitarismo (1863)",
        },
      ],
    },
  },

  // ── 9 ──────────────────────────────────────────────────────────────────────
  {
    slug: "pfh-ii-etica-virtud-aristoteles",
    titulo: "Ética de la virtud: la excelencia humana según Aristóteles",
    categoria: "Ética",
    conceptos_clave: ["ética de la virtud", "Aristóteles", "eudaimonía", "virtud", "término medio", "phronesis"],
    tiempo_lectura_minutos: 7,
    es_placeholder: false,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La ética de la virtud es una de las tradiciones morales más antiguas y, paradójicamente, una de las más vivas en el debate filosófico contemporáneo. Tiene su origen en la filosofía de Aristóteles (384–322 a.C.), especialmente en su Ética a Nicómaco, una de las obras más influyentes de la historia del pensamiento moral. A diferencia de la ética kantiana (que pregunta por el deber) y del utilitarismo (que pregunta por las consecuencias), la ética de la virtud pregunta: ¿qué tipo de persona debo ser? ¿Qué es el ser humano en su pleno florecimiento?",
        },
        {
          tipo: "subtitulo",
          contenido: "La eudaimonía: felicidad como florecimiento",
        },
        {
          tipo: "parrafo",
          contenido:
            "La palabra griega eudaimonía se traduce habitualmente como 'felicidad', pero esa traducción es engañosa: no se trata de un estado subjetivo de placer o satisfacción, sino del florecimiento pleno de la naturaleza humana. La eudaimonía es el bien supremo al que todo ser humano aspira, no como medio para otra cosa sino como fin en sí mismo. Para Aristóteles, la eudaimonía consiste en ejercitar las capacidades más propias del ser humano —especialmente la razón— de manera excelente, en el contexto de una comunidad política justa.",
        },
        {
          tipo: "subtitulo",
          contenido: "Las virtudes como términos medios",
        },
        {
          tipo: "parrafo",
          contenido:
            "Las virtudes son excelencias del carácter: disposiciones estables para actuar, sentir y elegir de manera adecuada. Aristóteles las define como términos medios entre dos extremos viciosos: la valentía es el término medio entre la cobardía (defecto) y la temeridad (exceso); la generosidad es el término medio entre la mezquindad y la prodigalidad; la honestidad es el término medio entre el engaño y la franqueza brutal. El término medio no es una media aritmética fija sino el punto correcto para cada persona y situación.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La virtud más importante para Aristóteles es la phronesis, que se traduce como prudencia o sabiduría práctica. La phronesis es la capacidad de discernir qué es lo correcto en cada situación concreta, sin aplicar mecánicamente reglas universales. El ser humano virtuoso no es el que conoce la regla moral sino el que ha desarrollado un sentido práctico para actuar bien en las circunstancias particulares, siempre cambiantes, de la vida.",
        },
        {
          tipo: "parrafo",
          contenido:
            "La ética de la virtud fue revivida en el siglo XX por filósofa como Alasdair MacIntyre (Tras la virtud, 1981) y Martha Nussbaum (quien desarrolló el enfoque de las capacidades). Nussbaum, en particular, ha enriquecido la ética aristotélica desde una perspectiva feminista y global: propone una lista de capacidades humanas fundamentales que toda sociedad justa debe proteger, independientemente de la cultura o el género.",
        },
        {
          tipo: "cita",
          contenido:
            "La virtud es un hábito selectivo que consiste en un término medio relativo a nosotros, determinado por la razón y por aquello por lo que decidiría el hombre prudente.",
          fuente: "Aristóteles, Ética a Nicómaco (siglo IV a.C.)",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Escala de virtudes aristotélicas con el defecto, el término medio (virtud) y el exceso para valentía, generosidad y honestidad",
          caption: "El esquema aristotélico de la virtud como término medio entre dos vicios.",
        },
      ],
    },
  },

  // ── 10 ─────────────────────────────────────────────────────────────────────
  {
    slug: "pfh-ii-etica-del-cuidado",
    titulo: "Ética del cuidado: moral, relaciones y género",
    categoria: "Ética",
    conceptos_clave: ["ética del cuidado", "Gilligan", "Noddings", "relaciones", "vulnerabilidad", "género"],
    tiempo_lectura_minutos: 7,
    es_placeholder: false,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La ética del cuidado surgió en las décadas de 1970 y 1980 como una crítica a las teorías éticas dominantes —kantianas y utilitaristas— y como una contribución original de la filosofía feminista. Su punto de partida fue empírico: la psicóloga Carol Gilligan observó que las teorías del desarrollo moral de Lawrence Kohlberg describían como inferior el razonamiento moral de las mujeres. Gilligan argumentó que no era inferior sino diferente: basado en relaciones, responsabilidades y cuidado concretos, no en principios abstractos y universales.",
        },
        {
          tipo: "subtitulo",
          contenido: "Los principios de la ética del cuidado",
        },
        {
          tipo: "lista",
          items: [
            "La relacionalidad como condición humana: los seres humanos no somos individuos atomizados y autosuficientes; somos fundamentalmente seres en relación, dependientes unos de otros en distintas etapas de la vida.",
            "El cuidado como valor central: atender las necesidades concretas de personas concretas, especialmente las más vulnerables, es una práctica moral fundamental.",
            "La responsabilidad particular: tenemos obligaciones especiales hacia quienes están en relación con nosotros (familia, amigos, comunidad) que no podemos reducir a principios universales abstractos.",
            "La vulnerabilidad como realidad universal: todos somos vulnerables en algún momento. Una ética justa debe tomar en serio esta condición compartida.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Una crítica frecuente a la ética del cuidado es que puede reforzar los roles de género tradicionales: si las mujeres históricamente han sido las 'cuidadoras', construir una ética del cuidado podría perpetuar esa división sexual del trabajo. La respuesta de las teóricas del cuidado —como Joan Tronto y Virginia Held— es que precisamente hay que politizar el cuidado: reconocer que el trabajo de cuidar es trabajo real, valioso y colectivamente compartido, no solo una responsabilidad privada de las mujeres.",
        },
        {
          tipo: "parrafo",
          contenido:
            "En el contexto mexicano, la ética del cuidado tiene una resonancia especial. El sistema de cuidados —el trabajo no remunerado de crianza, cuidado de ancianos y enfermos, mantenimiento del hogar— recae de manera desproporcionada sobre las mujeres. Según datos del INEGI, las mujeres dedican en promedio más del doble de horas al trabajo no remunerado doméstico y de cuidados que los hombres. Poner este trabajo en el centro de la reflexión ética y política es una de las contribuciones más importantes de la ética del cuidado.",
        },
        {
          tipo: "parrafo",
          contenido:
            "La pandemia de COVID-19 visibilizó brutalmente la importancia del cuidado: de repente, los trabajadores esenciales —enfermeras, médicos, cuidadores, trabajadores del hogar— se revelaron como los pilares sobre los que descansa toda la vida social. La crisis reveló la paradoja de que las actividades más necesarias para la vida son también las menos valoradas económica y socialmente. La ética del cuidado ofrece herramientas para cuestionar esta paradoja.",
        },
        {
          tipo: "cita",
          contenido:
            "Las mujeres no son moralmente inferiores a los hombres; hablan con una voz diferente.",
          fuente: "Carol Gilligan, In a Different Voice (1982)",
        },
      ],
    },
  },

  // ── 11 ─────────────────────────────────────────────────────────────────────
  {
    slug: "pfh-ii-bioetica-origenes",
    titulo: "Bioética: orígenes, principios y dilemas de la vida",
    categoria: "Bioética",
    conceptos_clave: ["bioética", "principios bioéticos", "Beauchamp", "Childress", "autonomía", "beneficencia"],
    tiempo_lectura_minutos: 7,
    es_placeholder: false,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La bioética es la disciplina que aplica el razonamiento filosófico y ético a los dilemas que plantean las ciencias de la vida —la medicina, la biología, la genética— y a las decisiones sobre la vida, la muerte, el cuerpo y la salud. Su nombre fue acuñado por el oncólogo e investigador Van Rensselaer Potter en 1970, quien la concibió como un 'puente entre las ciencias y las humanidades', necesario para garantizar la supervivencia de la humanidad ante los peligros del poder tecnológico sin guía ética.",
        },
        {
          tipo: "subtitulo",
          contenido: "El origen histórico: los errores que fundaron la bioética",
        },
        {
          tipo: "parrafo",
          contenido:
            "La bioética moderna surgió, en parte, como reacción a atrocidades históricas. Los experimentos médicos en prisioneros de los campos de concentración nazis (documentados en los juicios de Núremberg, 1946–1947) llevaron a la formulación del Código de Núremberg (1947), que estableció el principio del consentimiento voluntario como requisito absoluto de toda experimentación humana. Décadas después, el escándalo del Estudio Tuskegee en Estados Unidos (1932–1972), en el que médicos dejaron sin tratamiento a hombres afroamericanos con sífilis sin su conocimiento, fue otro detonante de la institucionalización de la bioética.",
        },
        {
          tipo: "subtitulo",
          contenido: "Los cuatro principios de Beauchamp y Childress",
        },
        {
          tipo: "lista",
          items: [
            "Autonomía: respetar el derecho del paciente a tomar decisiones informadas sobre su propio cuerpo y tratamiento, sin coerción.",
            "Beneficencia: actuar siempre en beneficio del paciente; promover activamente su bienestar.",
            "No maleficencia: ante todo, no causar daño (primum non nocere). Evitar tratamientos que causen más daño que beneficio.",
            "Justicia: distribuir equitativamente los recursos, beneficios y cargas de la atención médica; tratar a personas similares de manera similar.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El consentimiento informado es la aplicación práctica del principio de autonomía: antes de cualquier procedimiento médico o participación en investigación, la persona debe recibir información completa, comprensible y veraz sobre diagnóstico, opciones, riesgos y beneficios, y debe poder decidir libremente sin presión. Este principio tiene dimensiones de género: históricamente, las mujeres han tenido menos autonomía en las decisiones médicas sobre sus propios cuerpos.",
        },
        {
          tipo: "parrafo",
          contenido:
            "En México, la bioética tiene un marco jurídico que incluye la Ley General de Salud y la Comisión Nacional de Bioética (CONBIOÉTICA), creada en 2005. Sin embargo, existen brechas enormes entre los principios y la práctica: el acceso desigual a la salud, la discriminación en los servicios médicos hacia poblaciones indígenas, mujeres y personas pobres, y la falta de información real en la toma de decisiones clínicas son problemas bioéticos urgentes en el contexto mexicano.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Los cuatro principios de la bioética en un cuadrado con autonomía, beneficencia, no maleficencia y justicia, con ejemplos clínicos para cada uno",
          caption: "Los cuatro principios de la bioética según Beauchamp y Childress.",
        },
      ],
    },
  },

  // ── 12 ─────────────────────────────────────────────────────────────────────
  {
    slug: "pfh-ii-dilemas-bioeticos-siglo-xxi",
    titulo: "Dilemas bioéticos contemporáneos: genética, IA y eutanasia",
    categoria: "Bioética",
    conceptos_clave: ["eutanasia", "CRISPR", "edición genética", "inteligencia artificial", "muerte digna", "derechos"],
    tiempo_lectura_minutos: 8,
    es_placeholder: false,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El siglo XXI ha traído consigo avances biotecnológicos que generan dilemas éticos sin precedente. La edición genética con CRISPR-Cas9 permite modificar el genoma humano con una precisión nunca vista. La inteligencia artificial toma decisiones médicas diagnósticas que afectan la vida de millones. La prolongación artificial de la vida ha creado nuevas categorías de sufrimiento. Estos no son problemas del futuro: ya están ocurriendo, y la sociedad tiene que decidir cómo regularlos, desde marcos filosóficos y éticos rigurosos.",
        },
        {
          tipo: "subtitulo",
          contenido: "La eutanasia y el derecho a la muerte digna",
        },
        {
          tipo: "parrafo",
          contenido:
            "La eutanasia (del griego: 'buena muerte') es la acción o la omisión que acelera la muerte de una persona que padece una enfermedad incurable o un sufrimiento insoportable, con su consentimiento. Se distingue entre eutanasia activa (administrar una sustancia que causa la muerte), eutanasia pasiva (retirar tratamientos que prolongan la vida sin curar), y suicidio asistido (proporcionar los medios para que la persona se cause la muerte ella misma). En México, la ortotanasia —permitir la muerte natural sin tratamientos fútiles— fue reconocida en la Ley de Voluntad Anticipada del Distrito Federal (2008) y en legislaciones similares de varios estados.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Los argumentos a favor de la eutanasia incluyen el respeto a la autonomía individual, la eliminación del sufrimiento innecesario y la dignidad en la muerte. Los argumentos en contra incluyen la posibilidad de presión sobre los más vulnerables, la incertidumbre médica sobre el pronóstico, y el riesgo de que el sistema de salud utilice la eutanasia como medio de reducir costos en lugar de mejorar los cuidados paliativos. No existe una respuesta filosófica única; el debate requiere precisión conceptual y sensibilidad hacia los casos concretos.",
        },
        {
          tipo: "subtitulo",
          contenido: "Edición genética: CRISPR y sus dilemas",
        },
        {
          tipo: "parrafo",
          contenido:
            "En 2018, el científico chino He Jiankui anunció el nacimiento de las primeras bebés con genoma editado con CRISPR para hacerlas resistentes al VIH. Fue condenado internacionalmente: modificar embriones humanos sin consenso ético ni regulación fue considerado una violación grave de los principios bioéticos. Sin embargo, el caso abrió debates urgentes: ¿es correcto usar CRISPR para eliminar enfermedades genéticas hereditarias? ¿Dónde está la línea entre tratar enfermedades y diseñar bebés? ¿Quién controla el acceso a estas tecnologías y sus beneficios?",
        },
        {
          tipo: "parrafo",
          contenido:
            "La inteligencia artificial en medicina presenta dilemas propios: algoritmos que diagnostican enfermedades con mayor precisión que muchos médicos, pero que pueden reproducir los sesgos raciales y de género de los datos con que fueron entrenados. En Estados Unidos, se documentó que ciertos algoritmos de diagnóstico privilegiaban a pacientes blancos sobre afroamericanos porque los datos históricos reflejaban décadas de desigualdad en el acceso a la salud. La IA no es éticamente neutral.",
        },
        {
          tipo: "cita",
          contenido:
            "La bioética no es una disciplina que resuelve los problemas; es la disciplina que nos enseña a vivir con ellos sin ignorarlos.",
          fuente: "Diego Gracia, filósofo y médico español, referente de la bioética latinoamericana",
        },
      ],
    },
  },

  // ── 13 ─────────────────────────────────────────────────────────────────────
  {
    slug: "pfh-ii-filosofia-ambiental",
    titulo: "Filosofía ambiental y ética ecológica: la crisis del planeta",
    categoria: "Bioética",
    conceptos_clave: [
      "filosofía ambiental",
      "ética ecológica",
      "especismo",
      "derechos de la naturaleza",
      "Singer",
      "Naess",
    ],
    tiempo_lectura_minutos: 7,
    es_placeholder: false,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La crisis ecológica del siglo XXI no es solo un problema científico o tecnológico: es también un problema filosófico. Las causas más profundas de la destrucción ambiental tienen raíces en cosmovisiones —formas de entender la relación entre el ser humano y la naturaleza— que la filosofía puede examinar y criticar. ¿Tiene la naturaleza valor intrínseco, o solo valor instrumental (en tanto sirva a los seres humanos)? ¿Tienen derechos los animales? ¿Y los árboles? ¿Y los ríos? Estas son preguntas filosóficas con consecuencias jurídicas, políticas y ecológicas enormes.",
        },
        {
          tipo: "subtitulo",
          contenido: "El antropocentrismo y sus alternativas",
        },
        {
          tipo: "lista",
          items: [
            "Antropocentrismo: solo los seres humanos tienen valor moral intrínseco; la naturaleza tiene valor instrumental (en tanto sirva a las personas). Es la posición dominante en la tradición occidental.",
            "Zoocentrismo: los animales sintientes también tienen valor moral intrínseco y derechos. Peter Singer: el 'especismo' (discriminar por especie) es tan injustificable como el racismo.",
            "Biocentrismo: todo ser vivo tiene valor intrínseco. Albert Schweitzer: 'Soy vida que quiere vivir, en medio de vida que quiere vivir.'",
            "Ecocentrismo: los ecosistemas, las especies y la biosfera en su conjunto tienen valor intrínseco. Aldo Leopold: 'Una cosa es correcta cuando tiende a preservar la integridad, estabilidad y belleza de la comunidad biótica.'",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El filósofo noruego Arne Naess propuso en 1973 la distinción entre ecología superficial (luchar contra la contaminación y el agotamiento de recursos por interés humano) y ecología profunda (deep ecology): una perspectiva que rechaza la imagen de los humanos como el centro y valor supremo de la naturaleza y propone una identificación más amplia con toda la biosfera. La crisis climática requiere un cambio filosófico profundo, no solo tecnológico.",
        },
        {
          tipo: "parrafo",
          contenido:
            "En América Latina, las cosmovisiones indígenas ofrecen alternativas filosóficas al modelo extractivista occidental. El concepto quechua de Sumak Kawsay (Buen Vivir), incorporado en las constituciones de Ecuador (2008) y Bolivia (2009), propone un modelo de vida en armonía con la naturaleza que rechaza la idea del 'desarrollo' como crecimiento económico ilimitado. La naturaleza —la Pachamama— tiene derechos propios que el Estado debe proteger. Esto no es folclore: es una posición filosófica coherente con los hallazgos más recientes de la ecología.",
        },
        {
          tipo: "parrafo",
          contenido:
            "En México, los pueblos indígenas han sido históricamente los guardianes más eficaces de la biodiversidad. Las comunidades nahuas, zapotecas, mayas y de otros pueblos originarios poseen sistemas de conocimiento ecológico acumulado durante siglos que la ciencia occidental apenas está comenzando a reconocer. Una filosofía ambiental para México no puede ignorar estas tradiciones.",
        },
        {
          tipo: "cita",
          contenido:
            "La Tierra no nos pertenece: somos nosotros quienes pertenecemos a la Tierra.",
          fuente: "Proverbio atribuido al jefe Seattle, líder indígena norteamericano, siglo XIX",
        },
      ],
    },
  },

  // ── 14 ─────────────────────────────────────────────────────────────────────
  {
    slug: "pfh-ii-simone-de-beauvoir",
    titulo: "Simone de Beauvoir y el existencialismo feminista",
    categoria: "Historia de la filosofía",
    conceptos_clave: [
      "Simone de Beauvoir",
      "El segundo sexo",
      "feminismo filosófico",
      "existencialismo",
      "alteridad",
      "construcción social del género",
    ],
    tiempo_lectura_minutos: 8,
    es_placeholder: false,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Simone de Beauvoir (1908–1986) es una de las filósofas más importantes del siglo XX y la fundadora del feminismo filosófico moderno. Su obra El segundo sexo (1949) es uno de los textos más influyentes de la historia del pensamiento occidental. En él, de Beauvoir aplica las herramientas del existencialismo sartreano al análisis de la condición femenina, produciendo un análisis devastador de cómo las sociedades patriarcales construyen a la mujer como el Otro —el opuesto subordinado del sujeto masculino considerado universal.",
        },
        {
          tipo: "subtitulo",
          contenido: "'No se nace mujer, se llega a serlo'",
        },
        {
          tipo: "parrafo",
          contenido:
            "La frase más famosa de El segundo sexo es también su tesis central: 'No se nace mujer: se llega a serlo.' Con esta afirmación, de Beauvoir distingue entre el sexo (determinación biológica) y el género (construcción social y cultural). La feminidad no es una esencia natural o biológica inevitable; es un conjunto de roles, comportamientos, actitudes y limitaciones que la sociedad impone a los cuerpos femeninos desde el nacimiento. Esta distinción se convirtió en el fundamento conceptual de toda la teoría feminista posterior.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "De Beauvoir toma de Hegel y Sartre el concepto de 'Otro' (Autre). Para el sujeto (el yo), el Otro es lo diferente, lo opuesto. De Beauvoir muestra que en la cultura occidental, el hombre ha sido construido como el sujeto universal y la mujer como su Otro: el ser definido en relación con el hombre, no en relación consigo misma. 'La mujer no es definida como ser humano sino en relación con el hombre.' Este análisis es la base del concepto de 'alteridad de género'.",
        },
        {
          tipo: "parrafo",
          contenido:
            "El análisis de de Beauvoir abarca no solo la biología y la psicología, sino también la historia, la literatura, los mitos y la vida cotidiana. Examina cómo la maternidad, la sexualidad, el matrimonio, el trabajo doméstico y la educación han sido históricamente utilizados para mantener a las mujeres en situación de dependencia y subordinación. No naturaliza ninguna de estas situaciones: todas son construidas históricamente y, por lo tanto, pueden transformarse.",
        },
        {
          tipo: "parrafo",
          contenido:
            "La influencia de de Beauvoir en el pensamiento filosófico y político ha sido inmensa. El feminismo de segunda ola de los años 60 y 70, la teoría de género, los estudios de la mujer y, posteriormente, la teoría queer deben todos algo fundamental a su análisis. En México, intelectuales como Rosario Castellanos (1925–1974), poeta y novelista chiapaneca, dialogó con las ideas de de Beauvoir en textos como Sobre cultura femenina (1950) y en su ensayística posterior.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Retrato de Simone de Beauvoir con fragmentos clave de El segundo sexo y una línea de tiempo de su influencia en el feminismo filosófico global",
          caption: "Simone de Beauvoir: fundadora del feminismo filosófico contemporáneo.",
        },
        {
          tipo: "cita",
          contenido:
            "No se nace mujer: se llega a serlo. Ningún destino biológico, psíquico, económico define la figura que reviste en el seno de la sociedad la hembra humana.",
          fuente: "Simone de Beauvoir, El segundo sexo (1949)",
        },
      ],
    },
  },

  // ── 15 ─────────────────────────────────────────────────────────────────────
  {
    slug: "pfh-ii-feminismo-filosofico-latinoamerica",
    titulo: "Filosofía feminista en América Latina: voces propias",
    categoria: "Historia de la filosofía",
    conceptos_clave: [
      "feminismo latinoamericano",
      "interseccionalidad",
      "colonialismo",
      "Lugones",
      "epistemología feminista",
      "cuerpo",
    ],
    tiempo_lectura_minutos: 8,
    es_placeholder: false,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El feminismo filosófico latinoamericano no es una simple aplicación del feminismo europeo o anglosajón a contextos locales: es una tradición de pensamiento con problemas, categorías y perspectivas propias, forjadas en el cruce de la colonialidad, el racismo, la pobreza y el patriarcado. Las filósofas latinoamericanas han cuestionado que el feminismo occidental del 'primer mundo' hable en nombre de 'las mujeres' en general, ignorando las condiciones específicas de las mujeres indígenas, afrodescendientes, pobres y mestizas de América Latina.",
        },
        {
          tipo: "subtitulo",
          contenido: "La interseccionalidad",
        },
        {
          tipo: "parrafo",
          contenido:
            "El concepto de interseccionalidad, desarrollado por la jurista afroestadounidense Kimberlé Crenshaw (1989) y enriquecido filosóficamente por figuras como María Lugones, señala que las opresiones de género, raza y clase no son separadas ni aditivas sino que se entrelazan y se constituyen mutuamente. Una mujer indígena en México no experimenta el sexismo más el racismo más la pobreza como tres opresiones separadas: experimenta una forma específica de opresión que resulta de su intersección. No puede analizarse con categorías que tomen solo uno de estos ejes.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "María Lugones, filósofa argentina radicada en Estados Unidos, propuso el concepto de 'colonialidad del género': el colonialismo europeo no solo impuso estructuras económicas y políticas sobre los pueblos colonizados, sino que también impuso el sistema de género binario, heterosexual y patriarcal europeo, destruyendo formas de organización social de género más fluidas y complejas que existían en muchos pueblos indígenas americanos antes de la conquista.",
        },
        {
          tipo: "parrafo",
          contenido:
            "La filósofa mexicana Graciela Hierro (1928–2003), fundadora de los estudios de género en la UNAM, desarrolló una 'ética del placer' desde una perspectiva feminista que recuperaba la experiencia corporal y afectiva de las mujeres como fuente legítima de conocimiento moral. Hierro argumentó que la ética filosófica occidental había privilegiado la razón abstracta sobre el cuerpo y las emociones, y que esa jerarquía tenía una dimensión de género: lo racional se identificaba con lo masculino, lo corporal-emocional con lo femenino y lo inferior.",
        },
        {
          tipo: "parrafo",
          contenido:
            "Sor Juana Inés de la Cruz (1648–1695), poeta y filósofa novohispana, representa un antecedente fundamental del pensamiento filosófico feminista en México. En su Respuesta a Sor Filotea de la Cruz (1691), defiende con rigor filosófico el derecho de las mujeres al conocimiento y al uso de la razón, en un contexto en el que la Iglesia y la sociedad colonial lo negaban. Su argumento es filosófico: la razón no tiene sexo; negarla a las mujeres es negar su humanidad.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mapa de América Latina con retratos y frases de filósofas feministas latinoamericanas: Sor Juana, Graciela Hierro, Lugones y otras",
          caption: "La filosofía feminista latinoamericana: voces diversas desde el sur.",
        },
        {
          tipo: "cita",
          contenido:
            "Yo, ¿en qué género puedo subsistir sino en el mío? ¿Si no tengo un pie en la tierra, en qué me he de sustentar?",
          fuente: "Sor Juana Inés de la Cruz, Respuesta a Sor Filotea de la Cruz (1691)",
        },
      ],
    },
  },

  // ── 16 ─────────────────────────────────────────────────────────────────────
  {
    slug: "pfh-ii-humanismo-mexicano",
    titulo: "Humanismo mexicano: Vasconcelos, Zea y Reyes",
    categoria: "Historia de la filosofía",
    conceptos_clave: [
      "humanismo mexicano",
      "José Vasconcelos",
      "Leopoldo Zea",
      "Alfonso Reyes",
      "identidad mexicana",
      "filosofía de lo mexicano",
    ],
    tiempo_lectura_minutos: 8,
    es_placeholder: false,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El humanismo mexicano es una tradición filosófica que surge con fuerza en el siglo XX, sobre todo tras la Revolución Mexicana, cuando intelectuales y filósofos se preguntaron: ¿qué es México? ¿Qué somos los mexicanos? ¿Existe una forma específicamente mexicana de ser humano, de pensar, de valorar? Estas preguntas no son narcisistas ni localistas: son la forma en que México ingresa al debate filosófico universal sobre la identidad humana, la historia y el valor de las culturas no europeas.",
        },
        {
          tipo: "subtitulo",
          contenido: "José Vasconcelos: la raza cósmica y el humanismo mestizo",
        },
        {
          tipo: "parrafo",
          contenido:
            "José Vasconcelos (1882–1959) fue uno de los intelectuales más influyentes del México posrevolucionario. Como rector de la Universidad Nacional (1920–1921) y secretario de Educación Pública (1921–1924), impulsó un proyecto educativo y cultural de alcance nacional: el muralismo, las misiones culturales, las bibliotecas ambulantes. Filosóficamente, desarrolló en La raza cósmica (1925) la tesis de que América Latina, producto de la mezcla de todas las razas humanas, estaba destinada a crear una nueva síntesis cultural superior: la 'quinta raza', que integraría lo mejor de todas las civilizaciones.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El pensamiento vasconcelista ha sido objeto de críticas importantes. Su concepto de 'raza cósmica' usa el término 'raza' de manera acrítica y puede reproducir jerarquías étnicas al definir la mezcla como 'superación'. Sin embargo, también contiene un núcleo valioso: la afirmación de que la cultura mestiza latinoamericana tiene valor propio y no debe avergonzarse de sus raíces indígenas y africanas. 'Por mi raza hablará el espíritu', el lema que dio a la UNAM, puede leerse hoy como reivindicación de la diversidad cultural.",
        },
        {
          tipo: "subtitulo",
          contenido: "Leopoldo Zea: la filosofía como autoconciencia histórica",
        },
        {
          tipo: "parrafo",
          contenido:
            "Leopoldo Zea (1912–2004) es quizá el filósofo mexicano más sistemático y de mayor proyección latinoamericana. Su proyecto filosófico central fue demostrar que México y América Latina tienen una historia filosófica propia y que pensar desde América Latina es filosóficamente legítimo y necesario. En El positivismo en México (1943) y Conciencia y posibilidad del mexicano (1952), Zea analizó cómo la adopción acrítica del positivismo europeo durante el siglo XIX había servido para justificar las desigualdades del régimen porfirista. La filosofía, para Zea, no puede ser neutral: siempre sirve a intereses históricos concretos.",
        },
        {
          tipo: "parrafo",
          contenido:
            "Alfonso Reyes (1889–1959), ensayista, poeta y diplomático regiomontano, representó otra dimensión del humanismo mexicano: la afirmación de que México y América Latina tienen derecho pleno a participar en la cultura universal. En Notas sobre la inteligencia americana (1936), Reyes argumentó que los americanos no son aprendices tardíos de la cultura europea sino participantes plenos con aportes originales. Su humanismo era a la vez cosmopolita (abierto a todas las tradiciones) y enraizado (consciente de su especificidad americana).",
        },
        {
          tipo: "parrafo",
          contenido:
            "Este humanismo mexicano tiene consecuencias directas para la educación filosófica en el bachillerato: no tiene sentido estudiar filosofía como si esta fuera exclusivamente un asunto europeo, cuando México cuenta con una riquísima tradición de pensamiento que incluye las cosmovisiones mesoamericanas, la filosofía novohispana, el pensamiento liberal y positivista del siglo XIX, y las corrientes filosóficas del XX. Filosofar en México significa también filosofar sobre México.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Retratos de Vasconcelos, Zea y Reyes con sus obras principales y aportaciones al humanismo mexicano",
          caption: "Los tres pilares del humanismo filosófico mexicano del siglo XX.",
        },
        {
          tipo: "cita",
          contenido:
            "América no tiene que pedir prestada su filosofía: tiene que crearla a partir de su propia realidad y de sus propias necesidades.",
          fuente: "Leopoldo Zea, La filosofía como compromiso (1952)",
        },
      ],
    },
  },

  // ── 16 ─────────────────────────────────────────────────────────────────────
  {
    slug: "pfh-ii-filosofia-liberacion-dussel",
    titulo: "Filosofía de la Liberación: Enrique Dussel y el pensamiento desde el sur",
    categoria: "Historia de la filosofía",
    conceptos_clave: [
      "Filosofía de la Liberación",
      "Dussel",
      "Otro",
      "eurocentrismo",
      "colonialidad",
      "transmodernidad",
    ],
    tiempo_lectura_minutos: 9,
    es_placeholder: false,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La Filosofía de la Liberación es una corriente filosófica latinoamericana que surge en Argentina en los años 1970 y que propone repensar la filosofía desde la perspectiva de los excluidos, los oprimidos y los marginados de la historia. Su representante más influyente es Enrique Dussel (1934–2023), filósofo argentino-mexicano que vivió en México desde 1975 hasta su muerte, y cuya obra es una de las más ambiciosas y provocadoras del pensamiento filosófico contemporáneo en español.",
        },
        {
          tipo: "subtitulo",
          contenido: "La crítica al eurocentrismo filosófico",
        },
        {
          tipo: "parrafo",
          contenido:
            "Dussel parte de una constatación histórica: la filosofía occidental se presenta a sí misma como universal, pero en realidad es la filosofía de una región particular —Europa— que se volvió hegemónica gracias a la conquista y la colonización de América, África y Asia. La modernidad no empieza con la Ilustración del siglo XVIII (como suele enseñarse) sino con 1492, con la conquista de América, que fue el proceso mediante el cual Europa pudo afirmarse como 'centro' del mundo y definir al resto como 'periferia' atrasada que debía modernizarse según el modelo europeo.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Dussel propone el concepto de 'transmodernidad' como alternativa al mito del progreso lineal europeo: no se trata de rechazar la modernidad (sus aportes de democracia, ciencia y derechos) ni de retroceder a un pasado idealizado, sino de ir 'más allá' de la modernidad incorporando las aportaciones de las culturas no europeas que la modernidad colonial destruyó o marginó. La transmodernidad es un proyecto filosófico de diálogo intercultural genuino entre iguales.",
        },
        {
          tipo: "subtitulo",
          contenido: "La categoría del Otro",
        },
        {
          tipo: "parrafo",
          contenido:
            "La categoría central de la filosofía dusseliana es el Otro (con mayúscula): el pobre, el indígena, el migrante, la mujer oprimida, el niño, el excluido del sistema. El Otro no es simplemente lo diferente (el alter-ego de la dialéctica hegeliana) sino la exterioridad radical: quien está fuera del sistema, quien no puede ejercer sus derechos porque el sistema no lo reconoce como sujeto pleno. El punto de partida de la ética de Dussel no es el yo abstracto de Kant ni el individuo racional de Mill, sino el rostro del Otro en su vulnerabilidad concreta —en clara deuda con el filósofo Emmanuel Lévinas.",
        },
        {
          tipo: "parrafo",
          contenido:
            "La Filosofía de la Liberación tiene consecuencias directas para pensar la educación en México. Si la filosofía siempre parte de una perspectiva histórica concreta, ¿desde dónde filosofamos en las aulas mexicanas? ¿Desde los textos de Platón y Kant solamente, o también desde el pensamiento maya, náhuatl, zapoteca? ¿Desde las categorías de la modernidad europea, o también desde las experiencias de colonización, mestizaje, migración y desigualdad que configuran la realidad latinoamericana? Dussel nos invita a reconocer que no hay filosofía sin lugar de enunciación.",
        },
        {
          tipo: "parrafo",
          contenido:
            "Dussel también desarrolló una ética de la liberación de alcance global. En su Ética de la liberación en la edad de la globalización y de la exclusión (1998), propone un principio material de la ética: el deber de producir, reproducir y desarrollar la vida humana como criterio supremo de la razón práctica. Frente al sistema capitalista que sacrifica vidas reales en nombre de la eficiencia o la acumulación, la ética de la liberación dice: ningún principio formal puede justificar la muerte evitable de seres humanos.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Esquema del pensamiento de Dussel con los conceptos de Otro, exterioridad, liberación y transmodernidad, y sus críticas al eurocentrismo filosófico",
          caption: "La Filosofía de la Liberación de Dussel: pensar desde los excluidos.",
        },
        {
          tipo: "cita",
          contenido:
            "El filósofo que filosofa desde América Latina, desde el no-ser, desde la nada en que el sistema lo ha confinado, tiene que empezar por tomar conciencia de su situación y hacer de esa situación el punto de partida de su reflexión.",
          fuente: "Enrique Dussel, Filosofía de la liberación (1977)",
        },
      ],
    },
  },
] as const;

// ---------------------------------------------------------------------------
// FUNCIÓN PRINCIPAL
// ---------------------------------------------------------------------------

export async function seedBibliotecaPFHII(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed Biblioteca PFH-II (16 fichas)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", "PFH-II")
    .single();

  if (uacErr || !uacRow) {
    throw new Error(
      `UAC PFH-II no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`
    );
  }

  const rows = FICHAS_PFHII.map((f, i) => ({
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

  if (error) throw new Error(`Error seeding fichas PFH-II: ${error.message}`);

  console.log(`  ✓ ${rows.length} fichas de biblioteca de PFH-II insertadas/actualizadas.`);
  console.log("\n✅ Seed Biblioteca PFH-II completado.\n");
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
    console.error(
      "❌ Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY"
    );
    process.exit(1);
  }
  const sb = createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  seedBibliotecaPFHII(sb).catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
}

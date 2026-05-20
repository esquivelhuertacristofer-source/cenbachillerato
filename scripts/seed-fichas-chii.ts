/**
 * Seed de fichas de biblioteca para CH-II (Conciencia Histórica II).
 * 15 fichas temáticas alineadas al MCCEMS 2025, Semestre 5.
 *
 * Uso: npx tsx scripts/seed-fichas-chii.ts
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

const FICHAS_CHII = [
  // ── 1 ── Historicidad y sujeto histórico ────────────────────────────────────
  {
    slug: "ch-ii-historicidad-ser-historico",
    titulo: "Historicidad: el ser humano como ser histórico",
    categoria: "Historicidad y sujeto histórico",
    conceptos_clave: ["historicidad", "ser histórico", "condición temporal", "existencia situada", "Wilhelm Dilthey"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La historicidad es uno de los conceptos filosóficos más profundos para comprender qué significa ser humano. A diferencia de los objetos físicos o los animales, los seres humanos no simplemente existen en el tiempo: son tiempo. Estamos constituidos por nuestro pasado —las experiencias, las tradiciones y las decisiones que nos formaron— y al mismo tiempo proyectamos nuestro futuro mediante decisiones y proyectos. Esta condición de 'ser en el tiempo' es lo que el filósofo alemán Wilhelm Dilthey (1833-1911) llamó historicidad: la propiedad fundamental de la existencia humana de estar radicalmente situada en un contexto histórico específico que la condiciona sin determinarla completamente.",
        },
        {
          tipo: "subtitulo",
          contenido: "Tres dimensiones de la historicidad",
        },
        {
          tipo: "parrafo",
          contenido:
            "Para entender la historicidad como concepto operativo en historia, conviene distinguir tres dimensiones. Primera, la historicidad ontológica: el hecho de que toda persona existe en un tiempo, un lugar, una cultura y una clase social concretos, y que esa situación condiciona su manera de ver el mundo. Segunda, la historicidad epistemológica: el conocimiento humano también es histórico, es decir, las teorías, los métodos y las preguntas que los historiadores hacen cambian de época en época. Tercera, la historicidad práctica: las comunidades humanas definen su identidad y orientan su acción presente y futura en relación con su comprensión del pasado compartido. Esta tercera dimensión es la que hace de la historia una necesidad social, no solo una actividad académica.",
        },
        {
          tipo: "subtitulo",
          contenido: "Implicaciones para el estudio de la historia",
        },
        {
          tipo: "lista",
          items: [
            "Todo actor histórico fue un ser situado: sus decisiones dependieron de las condiciones materiales, culturales e ideológicas de su época.",
            "El historiador también es un ser histórico: sus preguntas, métodos y valores están condicionados por su propio tiempo.",
            "La objetividad histórica no significa neutralidad absoluta: implica reconocer la propia situación y controlarla metodológicamente.",
            "La historicidad explica por qué el pasado se reinterpreta constantemente: cada generación hace preguntas nuevas con base en sus propias experiencias.",
            "Reconocer la historicidad del conocimiento no conduce al relativismo: es posible evaluar argumentos históricos con criterios de evidencia y coherencia.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El concepto de historicidad no implica que la historia sea un relato subjetivo e incontrolable. Implica, al contrario, que el rigor histórico requiere que el investigador sea consciente de su propia situación temporal y cultural. Esta autoconciencia metodológica —saber desde dónde y para qué se pregunta— es la base de la honestidad intelectual en ciencias sociales y humanidades.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama que muestra a un ser humano situado en el cruce entre pasado, presente y futuro, con flechas que indican cómo el contexto histórico condiciona la percepción y la acción del sujeto",
          caption: "La historicidad expresa que los seres humanos no solo viven en la historia: son constituidos por ella y la constituyen al mismo tiempo.",
        },
      ],
    },
  },

  // ── 2 ── Historicidad y sujeto histórico ────────────────────────────────────
  {
    slug: "ch-ii-sujeto-historico-colectivo",
    titulo: "El sujeto histórico: individuos, grupos y pueblos que hacen la historia",
    categoria: "Historicidad y sujeto histórico",
    conceptos_clave: ["sujeto histórico", "actores colectivos", "agencia histórica", "clases sociales", "movimientos sociales"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "¿Quién hace la historia? Durante siglos, la respuesta dominante fue: los grandes hombres —reyes, generales, caudillos. Esta visión fue radicalmente cuestionada a partir del siglo XX por corrientes historiográficas como la historia social, la historia de género y la microhistoria. Hoy, la noción de sujeto histórico abarca tanto a individuos como a colectividades: movimientos sociales, comunidades campesinas, grupos étnicos, organizaciones obreras, mujeres, jóvenes, niños. Un sujeto histórico es cualquier actor —individual o colectivo— que tiene agencia: la capacidad de actuar sobre el mundo, de modificar condiciones sociales y de dejar huella en el tiempo.",
        },
        {
          tipo: "subtitulo",
          contenido: "Sujetos históricos en la historia de Mexico",
        },
        {
          tipo: "lista",
          items: [
            "Las comunidades indígenas: resistieron y negociaron la dominación colonial durante tres siglos, conservando lenguas, tierras y formas de autogobierno.",
            "El movimiento campesino zapatista: Emiliano Zapata encabezó a los campesinos de Morelos que lucharon por 'Tierra y Libertad' durante la Revolución (1910-1919).",
            "El movimiento obrero: las huelgas de Cananea (1906) y Río Blanco (1907) mostraron que los trabajadores industriales eran un nuevo sujeto histórico bajo el Porfiriato.",
            "El movimiento estudiantil de 1968: estudiantes universitarios y del IPN se convirtieron en sujetos políticos que desafiaron al régimen del PRI.",
            "Las mujeres: de las soldaderas de la Revolución a las feministas del siglo XXI, las mujeres han sido sujetos históricos cuya agencia fue frecuentemente invisibilizada.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "La tension entre estructura y agencia",
        },
        {
          tipo: "parrafo",
          contenido:
            "Reconocer la agencia de los sujetos históricos no significa ignorar las estructuras que condicionan su acción. Los campesinos de Morelos que siguieron a Zapata actuaron dentro de condiciones estructurales específicas: el despojo de tierras por las haciendas azucareras, la exclusión política porfiriana, la tradición comunal de los pueblos del sur. Su agencia consistió en convertir esas condiciones de opresión en un movimiento político organizado con un programa concreto: el Plan de Ayala (1911). Este ejercicio de reconocer tanto las estructuras como la agencia de los sujetos históricos es uno de los objetivos centrales de CH-II.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El historiador italiano Giovanni Levi y el mexicano Luis González y González desarrollaron la microhistoria: el estudio de sujetos históricos comunes —un aldeano, una familia, una comunidad rural— para revelar la lógica cotidiana de la historia. La obra de González, 'Pueblo en vilo' (1968), reconstruyó la historia del municipio de San José de Gracia, Michoacán, mostrando que la historia local de personas ordinarias es tan reveladora como la historia de los grandes eventos nacionales.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mosaico de sujetos históricos mexicanos: soldaderas de la Revolución, obreros en huelga de Cananea, estudiantes del 68 con carteles, y comunidades indígenas en asamblea",
          caption: "Los sujetos históricos son individuos y colectividades que actúan, negocian y transforman las condiciones históricas en que viven.",
        },
      ],
    },
  },

  // ── 3 ── Historicidad y sujeto histórico ────────────────────────────────────
  {
    slug: "ch-ii-identidad-colectiva-autobiografia",
    titulo: "Identidad colectiva y autobiografia historica: quien somos y de donde venimos",
    categoria: "Historicidad y sujeto histórico",
    conceptos_clave: ["identidad colectiva", "autobiografía histórica", "narrativa identitaria", "memoria cultural", "nación"],
    tiempo_lectura_minutos: 4,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Las comunidades humanas —familias, barrios, pueblos, naciones— se definen a sí mismas contando historias sobre su pasado. Esta 'autobiografía colectiva' es la narrativa que una comunidad construye sobre sus orígenes, sus logros, sus traumas y su destino. En México, la identidad nacional se ha construido históricamente alrededor de ciertos eventos fundadores: la civilización mesoamericana, la Conquista, la Independencia, la Reforma y la Revolución. Cada uno de estos hitos funciona como un elemento de la autobiografía histórica de la nación: momentos a los que los mexicanos pueden referirse para definir quiénes son y qué los une.",
        },
        {
          tipo: "subtitulo",
          contenido: "Como se construye una identidad colectiva",
        },
        {
          tipo: "lista",
          items: [
            "Narrativa de origen: toda identidad colectiva tiene un relato de dónde viene la comunidad. Para México, el mito fundacional oficial combina el pasado prehispánico con la nación mestiza posrevolucionaria.",
            "Héroes y traidores: las identidades colectivas definen quiénes son sus héroes (Cuauhtémoc, Hidalgo, Juárez, Zapata) y sus traidores (Malinche, Santa Anna, Porfirio Díaz en cierta narrativa).",
            "Conmemoraciones: el calendario cívico —16 de septiembre, 20 de noviembre, 5 de mayo— es el ritual que refuerza la identidad colectiva periódicamente.",
            "Educación histórica: los libros de texto gratuitos de la SEP han sido el principal instrumento de transmisión de la autobiografía histórica nacional.",
            "Arte y cultura: el muralismo mexicano de Diego Rivera, José Clemente Orozco y David Alfaro Siqueiros construyó visualmente la narrativa identitaria nacional.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "La autobiografía histórica colectiva es siempre selectiva: incluye algunos eventos y excluye otros. El historiador debe preguntarse qué silencios produce esa selección. La narrativa oficial mexicana celebró la Revolución como gesta popular, pero tardó décadas en reconocer la masacre de Tlatelolco (1968) como parte de la historia nacional. Las comunidades indígenas tienen sus propias autobiografías históricas, frecuentemente en tensión con la narrativa mestiza del Estado. Reconocer esa pluralidad de narrativas identitarias es un paso hacia una comprensión más compleja y justa del pasado.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La identidad colectiva no es falsa por ser construida: toda identidad lo es. Pero es importante distinguir entre la memoria identitaria —que selecciona el pasado según las necesidades del presente— y la investigación histórica —que busca comprender el pasado en sus propios términos. Ambas tienen valor, pero cumplen funciones distintas y no deben confundirse.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mural de Diego Rivera en el Palacio Nacional que representa la historia de Mexico desde Tenochtitlan hasta el siglo XX, como autobiografia visual de la nacion mexicana",
          caption: "El mural historico mexicano es una autobiografia colectiva que construye una narrativa visual de los origenes y el destino de la nacion.",
        },
      ],
    },
  },

  // ── 4 ── Hipótesis históricas ────────────────────────────────────────────────
  {
    slug: "ch-ii-hipotesis-historica-formulacion",
    titulo: "Como formular una hipotesis historica: del problema a la explicacion",
    categoria: "Hipótesis históricas",
    conceptos_clave: ["hipótesis histórica", "pregunta de investigación", "método histórico", "argumentación", "evidencia"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una hipótesis histórica es una explicación provisional y verificable que propone una respuesta a una pregunta sobre el pasado. No es una opinión ni una certeza: es una proposición fundamentada que el historiador somete a la prueba de la evidencia documental, arqueológica o testimonial. Formular buenas hipótesis es el corazón del trabajo histórico: sin una pregunta clara y una respuesta provisional que orientar la búsqueda de evidencia, la investigación histórica se convierte en una acumulación de datos sin sentido. Aprender a formular hipótesis históricas es una habilidad intelectual fundamental que trasciende el estudio de la historia.",
        },
        {
          tipo: "subtitulo",
          contenido: "Del tema a la pregunta: el primer paso",
        },
        {
          tipo: "parrafo",
          contenido:
            "El primer paso para formular una hipótesis es transformar un tema amplio en una pregunta específica y verificable. 'La Revolución Mexicana' no es una pregunta: es un tema. 'Por que la Revolución Mexicana no resolvio la desigualdad agraria que la habia motivado' es una pregunta que puede generar hipótesis. Una buena pregunta histórica es específica (delimita un problema concreto), verificable (puede responderse con evidencia), relevante (importa para comprender el pasado o el presente) y no trivial (no tiene una respuesta obvia). Formular esta pregunta es ya en sí mismo un avance interpretativo: implica decidir qué aspecto del pasado merece ser explicado.",
        },
        {
          tipo: "subtitulo",
          contenido: "Pasos para formular y evaluar una hipotesis historica",
        },
        {
          tipo: "lista",
          items: [
            "Identificar el problema: ¿qué evento, proceso o fenómeno histórico requiere explicación? ¿Qué hay en él que no sea obvio?",
            "Formular la pregunta: convertir el problema en una pregunta específica, delimitada temporalmente y espacialmente.",
            "Proponer la hipótesis: ofrecer una respuesta provisional en forma de afirmación que pueda ser verdadera o falsa. Debe ser falsable.",
            "Identificar la evidencia necesaria: ¿qué tipo de fuentes (documentos, datos estadísticos, testimonios, arqueología) permitirían confirmar o refutar la hipótesis?",
            "Contrastar con la historiografía existente: ¿qué han dicho otros historiadores? ¿La hipótesis aporta algo nuevo o contradice interpretaciones consolidadas?",
          ],
        },
        {
          tipo: "callout",
          variante: "ejemplo",
          contenido:
            "Ejemplo de hipótesis histórica válida: 'La reforma agraria cardenista (1934-1940) no resolvió la pobreza rural mexicana porque priorizó la distribución de tierras sobre la provisión de crédito, tecnología e infraestructura, lo que condenó a los ejidatarios a la subsistencia sin posibilidades de acumulación productiva.' Esta hipótesis es específica, verificable con datos del Banco de México y los censos agrícolas, y genera una interpretación sobre las limitaciones estructurales del cardenismo.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama del ciclo de la investigación histórica: problema, pregunta, hipótesis, búsqueda de evidencia, análisis y conclusión, con flechas que muestran el proceso iterativo",
          caption: "La formulación de hipótesis es el núcleo metodológico de la investigación histórica: orienta la búsqueda de evidencia y estructura la argumentación.",
        },
      ],
    },
  },

  // ── 5 ── Hipótesis históricas ────────────────────────────────────────────────
  {
    slug: "ch-ii-presentismo-anacronismo-historia",
    titulo: "Presentismo y anacronismo: los peligros de juzgar el pasado con ojos del presente",
    categoria: "Hipótesis históricas",
    conceptos_clave: ["presentismo", "anacronismo", "empatía histórica", "contextualización", "juicio moral en historia"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Uno de los errores metodológicos más frecuentes en el estudio de la historia es el presentismo: la tendencia a juzgar el pasado con los valores, las categorías y las expectativas del presente. El presentismo lleva al anacronismo: atribuir a los actores del pasado intenciones, conocimientos o valores que no podían tener en su contexto histórico. Cuando decimos que Hernán Cortés fue un 'genocida' o que los aztecas eran 'bárbaros' sin contextualizar esas afirmaciones en el siglo XVI, estamos cometiendo anacronismo. Esto no significa que el historiador no pueda emitir juicios morales sobre el pasado, sino que esos juicios deben estar fundamentados en la comprensión del contexto histórico.",
        },
        {
          tipo: "subtitulo",
          contenido: "Ejemplos de presentismo en la historia de Mexico",
        },
        {
          tipo: "lista",
          items: [
            "Juzgar a Moctezuma II por 'no resistir' a Cortés, ignorando que en 1519 Cortés era para el tlahtoani mexica un problema político manejable, no la amenaza existencial que resultó ser.",
            "Criticar a Benito Juárez por no haber abolido la marginación indígena, ignorando que el liberalismo del siglo XIX tenía una lógica diferente a los actuales derechos colectivos indígenas.",
            "Celebrar a los zapatistas de 1910 como precursores del EZLN de 1994, proyectando hacia atrás categorías políticas del siglo XX que Zapata no conoció.",
            "Reprochar a los criollos independentistas de 1810 por no haber instaurado una democracia representativa según los estándares del siglo XXI.",
            "Calificar de 'racistas' a todos los actores del Porfiriato sin analizar cómo el darwinismo social era la ideología dominante en la ciencia europea de fines del siglo XIX.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Empatia historica: comprender sin necesariamente aprobar",
        },
        {
          tipo: "parrafo",
          contenido:
            "La alternativa al presentismo no es la neutralidad moral, sino la empatía histórica: el esfuerzo por comprender las decisiones de los actores del pasado desde dentro de su propio horizonte de posibilidades, valores y conocimientos. La empatía histórica no significa aprobar lo que hicieron: podemos concluir que la Conquista implicó actos de brutalidad injustificables incluso en el contexto del siglo XVI, y al mismo tiempo reconocer que sus protagonistas operaban con categorías culturales y marcos morales distintos a los nuestros. Esta doble operación —contextualizar para comprender y juzgar con fundamento— es la que exige el pensamiento histórico maduro.",
        },
        {
          tipo: "callout",
          variante: "advertencia",
          contenido:
            "Evitar el presentismo no significa caer en el relativismo moral extremo: no todas las acciones del pasado son igualmente justificables porque 'eran de su época'. El trabajo del historiador es contextualizar para comprender, pero también para identificar cuándo actores históricos violaban principios morales reconocibles incluso en su propio tiempo. Bartolomé de las Casas denunció la brutalidad de la Conquista en el siglo XVI: la injusticia no era invisible para los contemporáneos.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Dos columnas comparativas: a la izquierda, juicios presentistas sobre el pasado; a la derecha, la misma situación contextualizada históricamente, mostrando la diferencia metodológica entre presentismo y empatia historica",
          caption: "La empatía histórica busca comprender las acciones del pasado desde el horizonte de posibilidades de sus propios actores, sin renunciar al juicio crítico.",
        },
      ],
    },
  },

  // ── 6 ── Hipótesis históricas ────────────────────────────────────────────────
  {
    slug: "ch-ii-triangulacion-fuentes-evidencia",
    titulo: "Triangulación de fuentes: cómo construir evidencia histórica sólida",
    categoria: "Hipótesis históricas",
    conceptos_clave: ["triangulación", "fuentes históricas", "evidencia", "crítica de fuentes", "corroboración"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La triangulación de fuentes es el procedimiento metodológico mediante el cual el historiador confirma o refuta una interpretación contrastando tres o más fuentes independientes que apuntan al mismo hecho o proceso. Así como un topógrafo necesita al menos tres puntos de referencia para determinar una posición con precisión, el historiador necesita múltiples fuentes que se validen mutuamente para construir afirmaciones sólidas sobre el pasado. Ninguna fuente histórica, por rica que sea, es suficiente por sí sola: toda fuente fue producida en un contexto, con un propósito y desde una perspectiva particulares que condicionan lo que incluye y lo que silencia.",
        },
        {
          tipo: "subtitulo",
          contenido: "La triangulación en la historia de Tlatelolco 1968",
        },
        {
          tipo: "parrafo",
          contenido:
            "El caso de la masacre de Tlatelolco del 2 de octubre de 1968 ilustra brillantemente por qué la triangulación es indispensable. Durante décadas, el gobierno mexicano sostuvo que los estudiantes habían disparado primero y que el ejército respondió en defensa propia. La historiadora Elena Poniatowska, en 'La noche de Tlatelolco' (1971), sistematizó testimonios orales de sobrevivientes y testigos que contradecían esa versión. La apertura del AGN en la década de 2000 reveló documentos de la Dirección Federal de Seguridad (DFS) que mostraban la planificación militar del operativo. Las investigaciones de Kate Doyle para el National Security Archive, basadas en cables desclasificados de la CIA, confirmaron la coordinación. La triangulación de testimonios, documentos del Estado y fuentes internacionales construyó una evidencia que el discurso oficial no pudo sostener.",
        },
        {
          tipo: "subtitulo",
          contenido: "Principios de la triangulacion metodologica",
        },
        {
          tipo: "lista",
          items: [
            "Independencia de las fuentes: las fuentes trianguladas deben ser independientes entre sí, es decir, no derivar unas de otras.",
            "Diversidad de tipos: combinar fuentes primarias de distintos tipos (documentos escritos, fotografías, testimonios orales, datos estadísticos) fortalece la evidencia.",
            "Convergencia: cuando fuentes independientes y de tipos distintos apuntan a la misma conclusión, la hipótesis gana solidez.",
            "Divergencia significativa: cuando fuentes trianguladas se contradicen, el historiador debe explicar por qué difieren (intereses distintos, acceso diferente a la información, perspectivas distintas).",
            "Registro de las fuentes: toda afirmación histórica debe citarse con las fuentes que la sustentan, de modo que otros investigadores puedan verificarla.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El AGN (Archivo General de la Nación) es el principal repositorio para triangular fuentes sobre la historia de México. Sus fondos contienen documentos de la DFS, la Secretaría de Gobernación, la Presidencia de la República y otros organismos del Estado que, combinados con fuentes periodísticas, testimoniales y extranjeras, permiten construir evidencia robusta sobre los grandes eventos del siglo XX mexicano, incluyendo el movimiento estudiantil de 1968, la guerra sucia de los años 70 y la crisis de 1994.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de triangulación con tres vértices: documentos de archivo, testimonios orales y fotografías o datos estadísticos, convergiendo en el centro hacia una interpretación histórica fundamentada",
          caption: "La triangulación combina fuentes independientes de tipos distintos para construir interpretaciones históricas sólidas y verificables.",
        },
      ],
    },
  },

  // ── 7 ── Memoria colectiva y sentido histórico ───────────────────────────────
  {
    slug: "ch-ii-memoria-colectiva-halbwachs",
    titulo: "Memoria colectiva: Maurice Halbwachs y el recuerdo social",
    categoria: "Memoria colectiva y sentido histórico",
    conceptos_clave: ["memoria colectiva", "Maurice Halbwachs", "marcos sociales", "memoria individual", "grupos sociales"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "En 1925, el sociólogo francés Maurice Halbwachs (1877-1945) publicó 'Los marcos sociales de la memoria', una obra que transformó la comprensión del recuerdo humano. Halbwachs argumentó que la memoria no es un fenómeno puramente individual: siempre es social. Recordamos gracias a los marcos que nos proporcionan los grupos a los que pertenecemos —familia, comunidad, nación, clase social. Estos marcos nos dan el lenguaje, las categorías y los puntos de referencia que hacen posible el recuerdo. La memoria colectiva es el conjunto de recuerdos compartidos que un grupo social construye y transmite sobre su pasado común, y que sirve para definir su identidad en el presente.",
        },
        {
          tipo: "subtitulo",
          contenido: "Diferencias entre memoria colectiva e historia académica",
        },
        {
          tipo: "lista",
          items: [
            "La memoria colectiva es viva y cambiante: se transforma con cada generación según las necesidades del presente.",
            "La memoria colectiva es selectiva: enfatiza ciertos eventos y figuras heroicas, y silencia otros que no encajan en la narrativa identitaria.",
            "La memoria colectiva es afectiva: está cargada de emociones, orgullo, vergüenza o dolor colectivos.",
            "La historia académica busca la distancia crítica: intenta comprender el pasado en sus propios términos, más allá de las necesidades identitarias del presente.",
            "Ambas son necesarias: la memoria colectiva da cohesión social; la historia académica da perspectiva crítica.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Memoria colectiva en Mexico: ejemplos",
        },
        {
          tipo: "parrafo",
          contenido:
            "En México, la memoria colectiva del 2 de octubre de 1968 es paradigmática. El Estado mexicano durante décadas construyó una memoria oficial que minimizó o negó la masacre. Las familias de las víctimas, los sobrevivientes y los movimientos estudiantiles construyeron una contra-memoria que exigía verdad y justicia. La frase '2 de octubre no se olvida', coreada año tras año en la Plaza de las Tres Culturas, es un acto de resistencia de la memoria colectiva frente a la amnesia oficial. Esta tensión entre memoria oficial y contra-memoria es uno de los motores de la historia política de México en el siglo XX.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Halbwachs murió en el campo de concentración de Buchenwald en 1945, deportado por los nazis. Su concepto de memoria colectiva adquiere así una dimensión trágica: él mismo vivió la destrucción deliberada de una comunidad y su memoria. La historia del siglo XX está llena de ejemplos de grupos que buscaron destruir la memoria colectiva de otros —los nazis con los judíos, el PRI con los estudiantes de 1968— como instrumento de dominación y olvido.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "La Plaza de las Tres Culturas en Tlatelolco con la estela conmemorativa del 2 de octubre de 1968, símbolo de la memoria colectiva que resistió décadas de olvido oficial",
          caption: "La memoria colectiva del 2 de octubre de 1968 en México es un ejemplo de cómo los grupos sociales construyen y mantienen el recuerdo como acto de identidad y resistencia.",
        },
      ],
    },
  },

  // ── 8 ── Memoria colectiva y sentido histórico ───────────────────────────────
  {
    slug: "ch-ii-olvido-usos-politica-memoria",
    titulo: "Los usos del olvido: política, silencio y memoria en México",
    categoria: "Memoria colectiva y sentido histórico",
    conceptos_clave: ["política de la memoria", "usos del olvido", "amnesia histórica", "guerra sucia", "derechos humanos"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El olvido no es simplemente la ausencia de recuerdo: puede ser una política deliberada. Los Estados, los grupos de poder y las instituciones manipulan activamente la memoria colectiva al suprimir, censurar o distorsionar el recuerdo de eventos que los comprometen. El historiador Paul Ricoeur (1913-2005) distinguió entre el 'olvido de reserva' —el recuerdo que duerme pero puede ser reactivado— y el 'olvido de evasión' o amnesia ideológica, producido activamente para impedir el reconocimiento de culpas, crímenes o fracasos. En México, la historia del siglo XX está marcada por episodios de olvido deliberado que la investigación histórica ha ido recuperando.",
        },
        {
          tipo: "subtitulo",
          contenido: "Casos de olvido politico en la historia de Mexico",
        },
        {
          tipo: "lista",
          items: [
            "Tlatelolco 1968: durante décadas, los libros de texto, los medios y el discurso oficial minimizaron o negaron la masacre del 2 de octubre. La Comisión Nacional de Derechos Humanos no la investigó formalmente hasta 2001.",
            "La guerra sucia (1970s): la represión de guerrillas urbanas y rurales en los estados de Guerrero, Jalisco y la Ciudad de México, con desapariciones forzadas, fue ocultada sistemáticamente hasta los años 2000.",
            "La masacre de Acteal (1997): el asesinato de 45 indígenas tzotziles en Chiapas fue investigado tardíamente y sus responsabilidades políticas superiores nunca fueron completamente esclarecidas.",
            "Las masacres de la Revolución: los actos de violencia de los propios caudillos revolucionarios —incluyendo a Zapata y Villa— fueron silenciados en la memoria oficial que los convirtió en héroes.",
            "La crisis de 1994: el error de diciembre y el rescate bancario, cuyo costo recayó en los contribuyentes, fue eufemizado durante años como 'crisis de ajuste'.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "La recuperacion de la memoria como acto historico",
        },
        {
          tipo: "parrafo",
          contenido:
            "La recuperación de memorias silenciadas no es solo un ejercicio académico: tiene dimensiones políticas, éticas y jurídicas. En México, la creación de la Fiscalía Especial para Movimientos Sociales y Políticos del Pasado (FEMOSPP) en 2001 fue el primer intento formal del Estado de investigar la guerra sucia. La apertura de los archivos de la DFS en el AGN a partir de 2002 permitió a los historiadores documentar lo que durante décadas fue negado. Estas recuperaciones tienen consecuencias concretas: ayudan a las familias de las víctimas a conocer la verdad, permiten la reparación del daño y generan la posibilidad de que esos crímenes no se repitan.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El derecho a la memoria es hoy reconocido como un derecho humano fundamental por organismos internacionales como la ONU. Recordar los crímenes de Estado no es 'reabrir heridas': es garantizar que las víctimas sean reconocidas, que los responsables rindan cuentas y que la sociedad aprenda de su pasado. La frase 'Para que no se repita', usada en los contextos de justicia transicional en México y América Latina, resume esta dimensión ética de la memoria histórica.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Archivo fotográfico de familiares de desaparecidos de la guerra sucia mexicana portando carteles con retratos de sus seres queridos, en una manifestación frente al AGN",
          caption: "La lucha por la memoria frente al olvido político es también una lucha por la justicia: el derecho a saber es un derecho humano.",
        },
      ],
    },
  },

  // ── 9 ── Memoria colectiva y sentido histórico ───────────────────────────────
  {
    slug: "ch-ii-sentido-historico-presente",
    titulo: "El sentido histórico: por qué el pasado importa en el presente",
    categoria: "Memoria colectiva y sentido histórico",
    conceptos_clave: ["sentido histórico", "conciencia histórica", "relevancia del pasado", "ciudadanía crítica", "pensamiento histórico"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "¿Por qué estudiar historia? No para acumular fechas y datos, sino para desarrollar el sentido histórico: la capacidad de comprender el presente como resultado de procesos históricos y de orientar la acción futura con base en ese conocimiento. El sentido histórico es la conciencia de que las instituciones, las desigualdades, las culturas y los conflictos que vivimos no surgieron de la nada: son el producto de decisiones, estructuras y procesos que se desarrollaron a lo largo del tiempo. Comprender esos procesos no garantiza soluciones mágicas, pero proporciona la perspectiva necesaria para actuar con más sabiduría como ciudadanos.",
        },
        {
          tipo: "subtitulo",
          contenido: "El sentido historico en la vida cotidiana",
        },
        {
          tipo: "parrafo",
          contenido:
            "El sentido histórico no se limita al salón de clases. Se activa cuando un ciudadano pregunta por qué el sistema de salud en México es como es (y reconoce el papel del IMSS fundado en 1943, las políticas del cardenismo y las reformas neoliberales de los 90). Se activa cuando alguien pregunta por qué hay tantas comunidades indígenas en pobreza (y comprende la historia del despojo colonial, liberal y posrevolucionario de sus tierras). Se activa cuando un trabajador pregunta por qué sus derechos laborales son los que son (y conoce la Constitución de 1917, el artículo 123 y las reformas laborales del siglo XXI). El sentido histórico transforma al ciudadano pasivo en uno crítico y capaz de participar en la transformación de su sociedad.",
        },
        {
          tipo: "subtitulo",
          contenido: "Competencias del pensamiento historico",
        },
        {
          tipo: "lista",
          items: [
            "Causalidad: identificar las causas múltiples y los efectos de los procesos históricos.",
            "Continuidad y cambio: reconocer qué permanece y qué se transforma a lo largo del tiempo.",
            "Perspectiva histórica: comprender que los actores del pasado tenían puntos de vista distintos al nuestro.",
            "Dimensión ética: evaluar las decisiones históricas con criterios morales, evitando el presentismo.",
            "Uso de fuentes: construir argumentos históricos con base en evidencia verificable.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El sentido histórico es la meta final del estudio de la historia en el bachillerato. No se trata de memorizar qué pasó, sino de desarrollar la capacidad de preguntar por qué pasó, cómo llegamos aquí y qué podemos aprender de eso para construir un futuro más justo. Esta es la distinción fundamental entre historia como memorización de datos y la Conciencia Histórica como formación intelectual y ciudadana.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama circular que muestra la relación entre pasado, presente y futuro en el pensamiento histórico: el pasado informa el presente y orienta la acción futura, dentro de un ciclo de conciencia histórica",
          caption: "El sentido histórico conecta la comprensión crítica del pasado con la acción reflexiva en el presente y la proyección hacia el futuro.",
        },
      ],
    },
  },

  // ── 10 ── Procesos históricos México siglo XIX-XX ────────────────────────────
  {
    slug: "ch-ii-reforma-juarista-leyes-iglesia",
    titulo: "La Reforma juarista (1855-1867): Leyes de Reforma y separacion Iglesia-Estado",
    categoria: "Procesos históricos México siglo XIX-XX",
    conceptos_clave: ["Reforma juarista", "Leyes de Reforma", "Benito Juárez", "separación Iglesia-Estado", "liberalismo mexicano"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La Reforma (1855-1867) es el proceso histórico que transformó más profundamente las estructuras jurídicas, económicas y políticas del México del siglo XIX. Encabezada por Benito Juárez (1806-1872), el primer presidente indígena de México, la Reforma tuvo como objetivos centrales secularizar el Estado, limitar el poder económico y político de la Iglesia Católica, y construir un orden jurídico liberal basado en los derechos individuales. Las Leyes de Reforma, promulgadas entre 1855 y 1863, cambiaron radicalmente la relación entre la Iglesia, el Estado y la sociedad mexicana, y sus consecuencias se extienden hasta el presente.",
        },
        {
          tipo: "subtitulo",
          contenido: "Las principales Leyes de Reforma",
        },
        {
          tipo: "lista",
          items: [
            "Ley Juárez (1855): suprimió los fueros eclesiásticos y militares, sometiendo a sacerdotes y militares a la jurisdicción de los tribunales civiles.",
            "Ley Lerdo (1856): desamortizó los bienes raíces de las corporaciones civiles y eclesiásticas, obligando a la Iglesia a vender sus propiedades. Afectó también a los ejidos comunales indígenas.",
            "Constitución de 1857: estableció los derechos individuales, la libertad de expresión, el juicio de amparo y la soberanía popular.",
            "Ley de Nacionalización de Bienes Eclesiásticos (1859): el Estado se adjudicó todos los bienes de la Iglesia sin compensación, financiando así la guerra contra los conservadores.",
            "Ley del Matrimonio Civil (1859): el matrimonio pasó a ser un contrato civil, sustrayéndolo de la jurisdicción eclesiástica.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "La Guerra de Reforma y la Intervención Francesa",
        },
        {
          tipo: "parrafo",
          contenido:
            "Las Leyes de Reforma desencadenaron una guerra civil (1858-1860) entre liberales y conservadores. Los conservadores, apoyados por la jerarquía eclesiástica, se negaron a aceptar la Constitución de 1857 y proclamaron el Plan de Tacubaya. Juárez y los liberales triunfaron en 1860, pero la crisis económica que siguió llevó a México a suspender el pago de la deuda externa, provocando la Intervención Francesa (1862-1867) y la imposición del Segundo Imperio de Maximiliano de Habsburgo. La resistencia republicana de Juárez, que nunca reconoció al Imperio y mantuvo el gobierno constitucional en el norte del país, es considerada uno de los episodios más importantes de la historia de la soberanía mexicana.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La Ley Lerdo (1856) es uno de los ejemplos más complejos de las consecuencias no intencionales en la historia. Diseñada para crear una clase de pequeños propietarios rurales al obligar a la Iglesia a vender sus tierras, terminó favoreciendo a los grandes hacendados que pudieron comprar esas propiedades. Al extenderse a los ejidos comunales indígenas, que también eran 'corporaciones', la ley provocó el despojo de tierras de comunidades indígenas que el liberalismo había pretendido proteger. Esta paradoja ilustra la complejidad del análisis histórico.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mapa de Mexico durante la Guerra de Reforma (1858-1860) mostrando los territorios liberales y conservadores, junto a un retrato de Benito Juárez y la primera página de la Constitución de 1857",
          caption: "Las Leyes de Reforma de Juárez transformaron México en un Estado laico moderno, aunque a un costo social y político muy alto para las comunidades indígenas.",
        },
      ],
    },
  },

  // ── 11 ── Procesos históricos México siglo XIX-XX ────────────────────────────
  {
    slug: "ch-ii-porfiriato-modernizacion-desigualdad",
    titulo: "El Porfiriato (1876-1910): modernización, haciendas y exclusion",
    categoria: "Procesos históricos México siglo XIX-XX",
    conceptos_clave: ["Porfiriato", "Porfirio Díaz", "modernización", "haciendas", "científicos"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El Porfiriato —el período de gobierno de Porfirio Díaz entre 1876 y 1910, con una breve interrupción— es uno de los períodos más debatidos de la historia mexicana. Por un lado, fue una época de modernización acelerada: México construyó más de 19,000 kilómetros de vías ferroviarias, atrajo capital extranjero masivo, desarrolló la minería y la industria textil, y construyó edificios públicos, escuelas y hospitales que transformaron el paisaje urbano. Por otro lado, fue un régimen autoritario que reprimió la oposición política, concentró la tierra en pocas manos y excluyó a la mayoría de la población —campesinos, indígenas y obreros— de los beneficios del crecimiento económico.",
        },
        {
          tipo: "subtitulo",
          contenido: "Las paradojas del Porfiriato",
        },
        {
          tipo: "lista",
          items: [
            "Crecimiento con desigualdad: el PIB creció a tasas de entre 2% y 4% anual, pero en 1910 el 1% de la población controlaba el 97% de las tierras agrícolas.",
            "Modernización con dependencia: el capital extranjero (estadounidense, inglés, francés) dominaba los ferrocarriles, la minería y el petróleo, generando una economía estructuralmente dependiente.",
            "Orden con represión: la paz porfiriana se mantuvo con el ejército federal y los cuerpos de rurales, que aplastaron rebeliones indígenas como la yaqui en Sonora y la maya en Yucatán.",
            "Progreso con exclusión política: Díaz suprimió las elecciones libres, la prensa independiente y los partidos de oposición durante más de 30 años.",
            "Los científicos: el grupo de tecnócratas positivistas que asesoraba a Díaz promovía la idea de que solo la elite educada era apta para gobernar, justificando la exclusión política de las masas.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "El Porfiriato como antecedente de la Revolucion",
        },
        {
          tipo: "parrafo",
          contenido:
            "Comprender el Porfiriato es indispensable para comprender la Revolución Mexicana. Las causas estructurales del movimiento armado de 1910 —concentración de la tierra, exclusión política, desigualdad social, dependencia económica— se gestaron durante los treinta años del régimen de Díaz. La entrevista de Díaz con el periodista estadounidense James Creelman en 1908, en la que declaró que México estaba listo para la democracia, abrió el espacio para que Francisco I. Madero lanzara su candidatura presidencial. La respuesta represiva de Díaz, que encarceló a Madero y fraudulentamente se reeligió por octava vez, fue el detonante inmediato de la Revolución.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El lema del Porfiriato fue 'Orden y Progreso', tomado del positivismo del filósofo francés Auguste Comte. Los intelectuales positivistas mexicanos —los llamados 'científicos'— creían que el progreso social seguía leyes naturales que solo la elite racional y educada podía comprender y aplicar. Esta ideología justificaba el autoritarismo político como condición necesaria para el desarrollo económico. La tensión entre orden y democracia, entre tecnocracia y participación popular, ha sido un eje recurrente de la política mexicana desde entonces.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mapa ferroviario de Mexico en 1910 que muestra la red porfiriana, junto a una fotografía de peones en una hacienda henequenera de Yucatán, ilustrando la paradoja de modernización y explotación del Porfiriato",
          caption: "El Porfiriato modernizó la infraestructura de Mexico mientras mantenía a millones de campesinos e indígenas en condiciones de servidumbre y exclusión.",
        },
      ],
    },
  },

  // ── 12 ── Procesos históricos México siglo XIX-XX ────────────────────────────
  {
    slug: "ch-ii-revolucion-mexicana-zapata-villa",
    titulo: "La Revolución Mexicana: Zapata, Villa, Carranza y el mosaico revolucionario",
    categoria: "Procesos históricos México siglo XIX-XX",
    conceptos_clave: ["Revolución Mexicana", "Emiliano Zapata", "Francisco Villa", "Venustiano Carranza", "Plan de Ayala"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La Revolución Mexicana (1910-1920) no fue un movimiento unificado con un solo liderazgo y un programa coherente: fue un mosaico de fuerzas sociales, regionales e ideológicas que compartían el rechazo al Porfiriato pero divergían profundamente en sus objetivos y sus métodos. Emiliano Zapata en el sur, Francisco Villa en el norte y Venustiano Carranza en el noreste encabezaron fuerzas con bases sociales, demandas y proyectos políticos distintos. Comprender esas diferencias es fundamental para entender tanto la riqueza como las contradicciones y los límites de la Revolución.",
        },
        {
          tipo: "subtitulo",
          contenido: "Los grandes actores y sus proyectos",
        },
        {
          tipo: "lista",
          items: [
            "Emiliano Zapata y el zapatismo: representó a los campesinos de Morelos que exigían la restitución de las tierras comunales. El Plan de Ayala (1911) fue su programa: 'La tierra es de quien la trabaja.' Fue el sector con mayor contenido social agrario.",
            "Francisco Villa y la División del Norte: lideró un ejército popular masivo en Chihuahua con una base de rancheros, mineros y ex peones. Su programa era más difuso pero su fuerza militar fue decisiva en 1913-1914.",
            "Venustiano Carranza y el constitucionalismo: representó a los sectores medios y hacendados del norte que querían restaurar el orden constitucional sin transformar radicalmente la propiedad. Él convocó el Congreso Constituyente de 1916-1917.",
            "Francisco I. Madero y el maderismo: inició la Revolución con demandas políticas (sufragio efectivo, no reelección) pero no con demandas agrarias, lo que lo distanció de Zapata.",
            "Álvaro Obregón: general sonorense que derrotó militarmente a Villa en 1915 y luego al propio Carranza, consolidando el Estado posrevolucionario.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "La Constitución de 1917: los compromisos y sus limites",
        },
        {
          tipo: "parrafo",
          contenido:
            "La Constitución promulgada en Querétaro el 5 de febrero de 1917 fue el resultado de las presiones de los distintos sectores revolucionarios sobre Carranza, quien hubiera preferido una constitución más conservadora. Los delegados obreros y agraristas lograron incluir el artículo 27 (propiedad originaria de la nación sobre tierras y aguas, base jurídica de la reforma agraria) y el artículo 123 (derechos laborales: jornada de 8 horas, salario mínimo, descanso semanal, derecho de huelga). Estos artículos representan el programa de los sectores populares de la Revolución. Sin embargo, su aplicación fue lenta, desigual y frecuentemente traicionada por los propios gobiernos posrevolucionarios hasta el cardenismo (1934-1940).",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Emiliano Zapata fue asesinado en una emboscada el 10 de abril de 1919, tendida por el general Pablo González bajo órdenes de Carranza. Francisco Villa fue asesinado en Parral, Chihuahua, el 20 de julio de 1923. La eliminación física de los líderes más radicales de la Revolución fue el método del Estado posrevolucionario para controlar el proceso de cambio. Esta represión de los propios revolucionarios es una de las paradojas centrales de la historia mexicana del siglo XX.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Fotografía histórica del encuentro de Zapata y Villa en el Palacio Nacional de la Ciudad de México en diciembre de 1914, símbolo del máximo poder militar de las fuerzas populares de la Revolución",
          caption: "El encuentro de Zapata y Villa en el Palacio Nacional (1914) representó el cenit del poder de las fuerzas más radicales de la Revolución, que no tardaron en ser derrotadas por el constitucionalismo carrancista.",
        },
      ],
    },
  },

  // ── 13 ── Procesos históricos México siglo XIX-XX ────────────────────────────
  {
    slug: "ch-ii-tlatelolco-1968-crisis-1994",
    titulo: "Tlatelolco 1968 y la crisis de 1994: dos fracturas del sistema politico mexicano",
    categoria: "Procesos históricos México siglo XIX-XX",
    conceptos_clave: ["Tlatelolco 1968", "movimiento estudiantil", "EZLN 1994", "crisis económica 1994", "Efecto Tequila"],
    tiempo_lectura_minutos: 8,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El 2 de octubre de 1968 y el 1 de enero de 1994 son dos fechas que marcaron fracturas profundas en el sistema político mexicano. La primera, la masacre de la Plaza de las Tres Culturas en Tlatelolco, representó el límite de la tolerancia del régimen priísta ante la disidencia política. La segunda, el levantamiento del Ejército Zapatista de Liberación Nacional (EZLN) en Chiapas, coincidió con la entrada en vigor del Tratado de Libre Comercio de América del Norte (TLCAN) y cuestionó radicalmente el modelo de modernización neoliberal. Ambas fechas, separadas por 26 años, son pilares de la historia reciente de Mexico y puntos de referencia ineludibles para comprender el México contemporáneo.",
        },
        {
          tipo: "subtitulo",
          contenido: "El movimiento estudiantil de 1968 y Tlatelolco",
        },
        {
          tipo: "parrafo",
          contenido:
            "El movimiento estudiantil de 1968 fue la primera movilización masiva que desafió públicamente al régimen del Partido Revolucionario Institucional (PRI), que llevaba cuatro décadas en el poder. Estudiantes del IPN, la UNAM y otras instituciones exigían libertad de presos políticos, diálogo público con el gobierno y el fin de la represión del ejército. El 2 de octubre, diez días antes de la inauguración de los Juegos Olímpicos de México, el ejército y el Batallón Olimpia rodearon la Plaza de las Tres Culturas donde se realizaba un mitin y abrieron fuego. El número de muertos nunca fue oficialmente reconocido: las estimaciones van de 30 a más de 300. La escritora Elena Poniatowska sistematizó los testimonios en 'La noche de Tlatelolco' (1971), un documento histórico fundamental.",
        },
        {
          tipo: "subtitulo",
          contenido: "1994: el EZLN y la crisis economica",
        },
        {
          tipo: "lista",
          items: [
            "1 de enero de 1994: el EZLN, integrado por comunidades indígenas mayas de Chiapas, tomó las ciudades de San Cristóbal de las Casas, Ocosingo y Las Margaritas.",
            "El Subcomandante Marcos y el discurso zapatista: el EZLN articuló demandas de democracia, justicia y derechos indígenas en un lenguaje político que resonó en todo el mundo.",
            "El TLCAN como detonante: la entrada en vigor del TLC con EUA y Canadá fue el detonante simbólico del levantamiento, que denunciaba el abandono de las comunidades indígenas por el modelo neoliberal.",
            "El Efecto Tequila (diciembre 1994): la devaluación del peso en diciembre de 1994, causada por la salida masiva de capitales especulativos, provocó la peor crisis económica desde la Gran Depresión.",
            "El rescate bancario (Fobaproa): el gobierno de Zedillo rescató a los bancos quebrados por la crisis con fondos públicos, transfiriendo la deuda privada al Estado y a los contribuyentes.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Tlatelolco 1968 y el EZLN 1994 son ejemplos de cómo los movimientos sociales pueden romper con la narrativa oficial del progreso. En ambos casos, el Estado respondió con fuerza militar antes de abrir espacios de negociación. En ambos casos, la represión no silenció a los movimientos sino que generó nuevas formas de organización política y social. El impacto de ambas fechas en la cultura política, la literatura y el periodismo mexicano es inconmensurable.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Dos imágenes históricas: la Plaza de las Tres Culturas en 1968 con soldados en posición, y comandantes zapatistas con pasamontañas y banderas en San Cristóbal de las Casas en enero de 1994",
          caption: "Tlatelolco 1968 y el levantamiento zapatista de 1994 representan dos momentos en que los movimientos sociales fracturaron la narrativa de estabilidad y progreso del sistema político mexicano.",
        },
      ],
    },
  },

  // ── 14 ── Historiografía mexicana ────────────────────────────────────────────
  {
    slug: "ch-ii-historiadores-mexicanos-grandes",
    titulo: "Grandes historiadores mexicanos: O'Gorman, Florescano, Luis Gonzalez y Matute",
    categoria: "Historiografía mexicana",
    conceptos_clave: ["Edmundo O'Gorman", "Enrique Florescano", "Luis González y González", "Álvaro Matute", "historiografía mexicana"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La historiografía mexicana del siglo XX produjo historiadores de talla internacional que transformaron no solo el conocimiento del pasado de Mexico sino la metodología y la teoría de la historia en América Latina. Cuatro figuras son fundamentales para comprender la historia de cómo se ha escrito la historia de Mexico: Edmundo O'Gorman, el filósofo de la historia; Enrique Florescano, el historiador de la memoria y el maíz; Luis González y González, el padre de la microhistoria mexicana; y Álvaro Matute, el biógrafo crítico de la historiografía. Conocerlos es indispensable para entender el estado actual del conocimiento histórico sobre Mexico.",
        },
        {
          tipo: "subtitulo",
          contenido: "Perfiles de cuatro grandes historiadores",
        },
        {
          tipo: "lista",
          items: [
            "Edmundo O'Gorman (1906-1995): Propuso que América no fue 'descubierta' sino 'inventada' como categoría intelectual europea ('La invención de América', 1958). Introdujo la filosofía de la historia en la academia mexicana y cuestionó el eurocentrismo de la historiografía latinoamericana.",
            "Enrique Florescano (1937-2023): Estudió la memoria histórica, el mito fundacional del maíz, la construcción de la identidad nacional y los usos políticos del pasado. Obras clave: 'Memoria mexicana' (1987), 'Etnia, Estado y nación' (1996). Fue director del INAH y promotor del patrimonio cultural.",
            "Luis González y González (1925-2003): Creó la microhistoria mexicana con 'Pueblo en vilo' (1968), reconstrucción de la historia del municipio de San José de Gracia, Michoacán. Argumentó que la historia local de los pueblos olvidados era tan legítima como la gran historia nacional.",
            "Álvaro Matute (1943-2022): Historiador de la historiografía y biógrafo intelectual de los historiadores mexicanos. Estudió la historia del pensamiento histórico en Mexico del siglo XIX al XX, haciendo visible la dimensión reflexiva de la disciplina.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Contribuciones metodologicas de estos historiadores",
        },
        {
          tipo: "parrafo",
          contenido:
            "Estos cuatro historiadores representan distintas formas de hacer historia. O'Gorman practicó la historia de las ideas y la filosofía de la historia. Florescano combinó la historia económica, la antropología y la historia cultural. González y González desarrolló la microhistoria como alternativa a las grandes narrativas nacionales. Matute practicó la historiografía reflexiva: el estudio de cómo los historiadores han escrito la historia. Juntos, definieron el perfil de la historia académica mexicana de la segunda mitad del siglo XX y formaron a generaciones de investigadores en El Colegio de Mexico, la UNAM y el INAH.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El Colegio de Mexico, fundado en 1940 como refugio para los intelectuales exiliados de la Guerra Civil española, se convirtió en el principal centro de formación de historiadores profesionales en el país. Allí convergieron las tradiciones historiográficas española, francesa (la Escuela de los Annales) y mexicana. O'Gorman, Florescano, González y González y Matute estuvieron todos vinculados en distintos momentos a esta institución, que sigue siendo el centro más influyente de la historiografía mexicana.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Portadas de obras fundamentales de la historiografía mexicana: 'La invencion de America' de O'Gorman, 'Pueblo en vilo' de González, 'Memoria mexicana' de Florescano, junto al edificio de El Colegio de Mexico",
          caption: "Los grandes historiadores mexicanos del siglo XX transformaron tanto el conocimiento del pasado como la metodología y la teoría de la disciplina histórica en América Latina.",
        },
      ],
    },
  },

  // ── 15 ── Historiografía mexicana ────────────────────────────────────────────
  {
    slug: "ch-ii-nueva-historia-mexico-cardenismo",
    titulo: "La Nueva Historia de Mexico y el cardenismo como objeto historico",
    categoria: "Historiografía mexicana",
    conceptos_clave: ["Nueva Historia de Mexico", "cardenismo", "Lázaro Cárdenas", "expropiación petrolera 1938", "reforma agraria"],
    tiempo_lectura_minutos: 8,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La 'Nueva Historia de Mexico' no es un libro ni un autor: es una corriente historiográfica que surgió en las décadas de 1960 y 1970 como alternativa a la historia oficial posrevolucionaria. Influenciada por la Escuela de los Annales francesa, la historia social inglesa y la sociología histórica latinoamericana, esta corriente propuso ampliar los sujetos de la historia (de los caudillos a las clases populares), las fuentes (de los documentos oficiales a los testimonios, la demografía y la arqueología) y los problemas (de la política a la economía, la cultura y las mentalidades). Uno de sus objetos de estudio predilectos fue el cardenismo (1934-1940), el período presidencial de Lázaro Cárdenas que marcó el punto de mayor radicalismo del Estado posrevolucionario.",
        },
        {
          tipo: "subtitulo",
          contenido: "El cardenismo como proceso historico",
        },
        {
          tipo: "parrafo",
          contenido:
            "El gobierno de Lázaro Cárdenas del Río (1934-1940) es considerado el punto culminante de las promesas sociales de la Revolución Mexicana. Cárdenas distribuyó cerca de 18 millones de hectáreas de tierra a ejidos y comunidades agrarias —más que todos sus predecesores juntos—, convirtiendo la reforma agraria en una realidad masiva. El 18 de marzo de 1938, expropio la industria petrolera extranjera (inglesa y estadounidense), creando Petróleos Mexicanos (PEMEX) y convirtiendo el petróleo en patrimonio de la nación. Esta decisión fue apoyada por una movilización popular masiva —mujeres donaron sus joyas para ayudar al gobierno a pagar la indemnización— que la historiografía posterior analizó como un momento de construcción de la identidad nacional.",
        },
        {
          tipo: "subtitulo",
          contenido: "La expropiacion petrolera de 1938 en la historiografia",
        },
        {
          tipo: "lista",
          items: [
            "La expropiación fue el resultado de un conflicto laboral entre los sindicatos petroleros y las compañías extranjeras, fallado a favor de los trabajadores por la Suprema Corte y desacatado por las empresas.",
            "Cárdenas tuvo que negociar con el presidente Roosevelt (Política del Buen Vecino) para evitar represalias económicas y militares de EUA.",
            "PEMEX se convirtió en el símbolo del nacionalismo económico mexicano y el principal instrumento fiscal del Estado durante décadas.",
            "Historiadores como Lorenzo Meyer y Sergio de la Peña analizaron la expropiación como parte de la Nueva Historia desde perspectivas de historia económica y política.",
            "El cardenismo es también objeto de revisiones críticas: ¿su corporativismo (CTM, CNC, CNOP) creó las estructuras del autoritarismo priísta posterior?",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El cardenismo ilustra un problema central de la historiografía: cómo evaluar un proceso histórico que al mismo tiempo amplió derechos sociales (reforma agraria, expropiación petrolera, educación socialista) y consolidó estructuras de control corporativo (integración del movimiento obrero y campesino al Estado a través del PRM, antecesor del PRI). Esta dualidad —transformación social y autoritarismo— es la clave para comprender el México del siglo XX y no puede reducirse a una valoración unidimensional.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Fotografia historica de Lazaro Cardenas entregando titulos agrarios a ejidatarios de La Laguna en 1936, junto a la imagen de mujeres haciendo cola para donar sus joyas como contribucion a la deuda petrolera en 1938",
          caption: "El cardenismo representó el momento de mayor cumplimiento de las promesas sociales de la Revolución, y al mismo tiempo el origen de las estructuras corporativas del autoritarismo priísta del siglo XX.",
        },
      ],
    },
  },
] as const;

// ---------------------------------------------------------------------------
// FUNCIÓN PRINCIPAL
// ---------------------------------------------------------------------------

export async function seedBibliotecaCHII(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed Biblioteca CH-II (15 fichas)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", "CH-II")
    .single();

  if (uacErr || !uacRow) {
    throw new Error(
      `UAC CH-II no encontrada. Ejecuta primero seed-mccems.ts y seed-chii.ts. Error: ${uacErr?.message}`
    );
  }

  const rows = FICHAS_CHII.map((f, i) => ({
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

  if (error) throw new Error(`Error seeding fichas CH-II: ${error.message}`);

  console.log(`  ✓ ${rows.length} fichas de biblioteca de CH-II insertadas/actualizadas.`);
  console.log("\n✅ Seed Biblioteca CH-II completado.\n");
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
  seedBibliotecaCHII(sb).catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
}

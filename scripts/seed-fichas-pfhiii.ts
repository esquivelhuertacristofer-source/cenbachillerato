/**
 * seed-fichas-pfhiii.ts
 * ---------------------
 * Seed de fichas de biblioteca para PFH-III
 * (Pensamiento Filosófico y Humanidades III — Semestre 3, MCCEMS 2025)
 *
 * 15 fichas placeholder con contenido filosófico rico:
 *   - Lógica y argumentación (5 fichas)
 *   - Filosofía política (4 fichas)
 *   - Filosofía del arte (3 fichas)
 *   - Praxis filosófica (2 fichas)
 *   - Pensadores latinoamericanos (1 ficha)
 *
 * Patrón idéntico a seed-fichas-lcii.ts.
 * Uso: npx tsx scripts/seed-fichas-pfhiii.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

const FICHAS_PFHIII = [
  // ─────────────────────────────────────────────────────────────
  // LÓGICA Y ARGUMENTACIÓN — 5 fichas
  // ─────────────────────────────────────────────────────────────
  {
    slug: "pfh-iii-proposiciones-logicas",
    titulo: "Proposiciones lógicas: el lenguaje formal del pensamiento",
    categoria: "Lógica y argumentación",
    conceptos_clave: [
      "proposición",
      "valor de verdad",
      "negación",
      "conjunción",
      "disyunción",
      "condicional",
      "tabla de verdad",
      "lógica formal",
    ],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La lógica formal es el estudio de las reglas del pensamiento correcto. Aristóteles fue el primero en sistematizarla, pero fue en el siglo XIX cuando Gottlob Frege y George Boole la convirtieron en un lenguaje matemático preciso. Hoy, la lógica proposicional es la base de la informática, la filosofía analítica y el razonamiento riguroso en cualquier disciplina.",
        },
        {
          tipo: "subtitulo",
          contenido: "¿Qué es una proposición?",
        },
        {
          tipo: "parrafo",
          contenido:
            "Una proposición es un enunciado declarativo que puede ser verdadero o falso, pero nunca ambos a la vez. 'La Luna orbita la Tierra' es una proposición verdadera. 'México tiene 20 estados' es una proposición falsa. '¿Qué hora es?' no es una proposición porque es una pregunta. 'Cierra la puerta' no es una proposición porque es un imperativo. La lógica trabaja exclusivamente con proposiciones.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Todo enunciado que pueda clasificarse como verdadero o falso es una proposición. Las preguntas, órdenes y exclamaciones NO son proposiciones desde el punto de vista lógico.",
        },
        {
          tipo: "subtitulo",
          contenido: "Conectivos lógicos fundamentales",
        },
        {
          tipo: "lista",
          items: [
            "Negación (¬p / NO p): invierte el valor de verdad. Si p es verdadera, ¬p es falsa.",
            "Conjunción (p ∧ q / p Y q): verdadera solo cuando ambas proposiciones son verdaderas.",
            "Disyunción (p ∨ q / p O q): falsa solo cuando ambas proposiciones son falsas.",
            "Condicional (p → q / SI p ENTONCES q): falsa solo cuando p es verdadera y q es falsa.",
            "Bicondicional (p ↔ q / p SI Y SOLO SI q): verdadera cuando p y q tienen el mismo valor.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Las tablas de verdad",
        },
        {
          tipo: "parrafo",
          contenido:
            "Una tabla de verdad es una herramienta que muestra todos los valores posibles de una proposición compleja en función de los valores de sus componentes. Para una proposición con dos variables (p y q), hay cuatro combinaciones posibles: VV, VF, FV, FF. Para tres variables, ocho combinaciones. Las tablas de verdad permiten verificar mecánicamente si un argumento es válido, sin depender de la intuición.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "¿Sabías que los circuitos electrónicos de tu computadora o teléfono funcionan exactamente con la lógica booleana? Las compuertas AND, OR y NOT son los conectivos lógicos implementados en hardware. La conexión entre lógica y tecnología fue establecida por Claude Shannon en 1937.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tabla de verdad de los conectivos lógicos principales",
          caption:
            "Tabla de verdad completa para negación, conjunción, disyunción y condicional. Herramienta fundamental de la lógica proposicional.",
        },
        {
          tipo: "cita",
          contenido:
            "La lógica es la anatomía del pensamiento.",
          fuente: "John Locke, Ensayo sobre el entendimiento humano (1689)",
        },
      ],
    },
  },
  {
    slug: "pfh-iii-silogismo-aristotelico",
    titulo: "El silogismo: razonar con estructura y validez",
    categoria: "Lógica y argumentación",
    conceptos_clave: [
      "silogismo",
      "premisa mayor",
      "premisa menor",
      "conclusión",
      "argumento válido",
      "argumento sólido",
      "término medio",
      "Aristóteles",
    ],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Hace más de 2,300 años, Aristóteles sistematizó en sus Analíticos Previos la forma más influyente de razonamiento deductivo de la historia occidental: el silogismo. Un silogismo es un argumento de tres enunciados: dos premisas y una conclusión que se sigue necesariamente de ellas. Esta estructura ha sido la columna vertebral de la lógica, la teología medieval, la ciencia y el derecho durante más de dos milenios.",
        },
        {
          tipo: "subtitulo",
          contenido: "Estructura del silogismo",
        },
        {
          tipo: "lista",
          items: [
            "Premisa mayor: enunciado general que establece una relación entre dos términos. Ejemplo: 'Todos los seres humanos son mortales.'",
            "Premisa menor: enunciado particular que vincula el sujeto con el término medio. Ejemplo: 'Sócrates es un ser humano.'",
            "Conclusión: enunciado que se sigue necesariamente de las premisas. Ejemplo: 'Por lo tanto, Sócrates es mortal.'",
            "Término medio: el concepto que aparece en ambas premisas pero no en la conclusión. Aquí: 'ser humano'.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Un argumento VÁLIDO es aquel donde la conclusión se sigue necesariamente de las premisas. Un argumento SÓLIDO (o cogente) es aquel que además tiene premisas verdaderas. Un argumento puede ser válido aunque sus premisas sean falsas.",
        },
        {
          tipo: "subtitulo",
          contenido: "Validez vs. solidez: una distinción crucial",
        },
        {
          tipo: "parrafo",
          contenido:
            "Considera este silogismo: 'Todos los gatos son reptiles. Mi perro es un gato. Por lo tanto, mi perro es un reptil.' Este argumento es VÁLIDO porque la conclusión se sigue de las premisas, pero no es SÓLIDO porque las premisas son falsas. La validez es una propiedad formal (de estructura); la solidez es una propiedad material (de contenido). En filosofía, derecho y ciencia nos interesa alcanzar argumentos que sean ambas cosas: válidos y sólidos.",
        },
        {
          tipo: "subtitulo",
          contenido: "Silogismos en la vida cotidiana",
        },
        {
          tipo: "parrafo",
          contenido:
            "Los silogismos no son solo ejercicios académicos. Están presentes en el derecho: 'El robo con violencia se castiga con prisión [mayor]. Juan cometió robo con violencia [menor]. Juan debe ir a prisión [conclusión].' También en la medicina: 'Los pacientes con fiebre alta y rigidez de nuca pueden tener meningitis. Este paciente tiene fiebre alta y rigidez de nuca. Este paciente puede tener meningitis.' Identificar la estructura silogística nos ayuda a evaluar críticamente cualquier razonamiento.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "¿Sabías que los escolásticos medievales identificaron 256 formas posibles de silogismo y determinaron que solo 24 son válidas? Le dieron nombres mnemotécnicos como Barbara, Celarent y Darii para memorizarlas. El más famoso es Barbara: 'Todo A es B; todo C es A; luego todo C es B.'",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama de la estructura del silogismo aristotélico con ejemplo",
          caption:
            "Estructura formal del silogismo: premisa mayor, premisa menor y conclusión, con el término medio como puente lógico entre ambas premisas.",
        },
        {
          tipo: "cita",
          contenido:
            "El silogismo es el instrumento que garantiza que si las premisas son verdaderas, la conclusión no puede ser falsa.",
          fuente: "Aristóteles, Analíticos Previos, Libro I",
        },
      ],
    },
  },
  {
    slug: "pfh-iii-falacias-argumentativas",
    titulo: "Falacias: los errores del razonamiento",
    categoria: "Lógica y argumentación",
    conceptos_clave: [
      "falacia",
      "falacia formal",
      "falacia informal",
      "ad hominem",
      "pendiente resbaladiza",
      "hombre de paja",
      "falsa dicotomía",
      "apelación a la autoridad",
      "afirmación del consecuente",
    ],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una falacia es un argumento que parece válido pero que contiene un error lógico. Las falacias son peligrosas precisamente porque resultan convincentes a primera vista. El filósofo Francis Bacon las llamaba 'ídolos de la tribu': ilusiones que distorsionan el razonamiento humano. Aprender a identificarlas es una de las habilidades más valiosas del pensamiento crítico, especialmente en un mundo saturado de discursos políticos, publicidad y desinformación.",
        },
        {
          tipo: "subtitulo",
          contenido: "Falacias formales: errores en la estructura",
        },
        {
          tipo: "lista",
          items: [
            "Afirmación del consecuente: 'Si llueve, el piso se moja. El piso está mojado. Por lo tanto, llovió.' Error: el piso pudo mojarse por otra causa.",
            "Negación del antecedente: 'Si estudias, aprobarás. No estudiaste. Por lo tanto, no aprobarás.' Error: podrías aprobar sin estudiar.",
            "Silogismo disyuntivo incompleto: asumir que si no es A, debe ser B, cuando pueden existir más opciones.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Falacias informales: errores en el contenido",
        },
        {
          tipo: "lista",
          items: [
            "Ad hominem: atacar a la persona en lugar de su argumento. 'No le crean a ese economista, es corrupto.' Aunque fuera corrupto, su argumento económico podría ser correcto.",
            "Pendiente resbaladiza: asumir que un evento llevará inevitablemente a una cadena de consecuencias negativas sin justificarlo. 'Si permitimos eso, pronto tendremos anarquía total.'",
            "Hombre de paja: distorsionar el argumento del oponente para refutar una versión más débil. 'Los ambientalistas quieren que regresemos a vivir en cuevas.'",
            "Falsa dicotomía: presentar solo dos opciones cuando existen más. 'O estás con nosotros o estás contra nosotros.'",
            "Apelación a la autoridad: citar a una autoridad en un área ajena a su expertise. 'Este actor famoso dice que esta medicina cura el cáncer.'",
            "Ad populum: algo es correcto porque 'todo el mundo lo hace o lo cree'. 'Millones de personas creen en esto, no puede estar mal.'",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Identificar una falacia no refuta automáticamente la posición del oponente; solo muestra que SU argumento específico es defectuoso. El oponente podría tener razón por otras razones. Señalar la falacia abre el debate, no lo cierra.",
        },
        {
          tipo: "parrafo",
          contenido:
            "En el contexto político mexicano, las falacias abundan. Durante el debate sobre el aeropuerto de Texcoco se usó frecuentemente la falsa dicotomía ('o el aeropuerto nuevo o quedarnos sin aeropuerto'). En debates sobre seguridad se recurre al ad hominem ('el que critica la estrategia es cómplice del narco'). Reconocer estas trampas retóricas permite participar más conscientemente en la vida democrática.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mapa visual de los principales tipos de falacias lógicas",
          caption:
            "Clasificación de las falacias más comunes divididas en formales (errores de estructura) e informales (errores de contenido o relevancia).",
        },
        {
          tipo: "cita",
          contenido:
            "La trampa más peligrosa del razonamiento no es el error evidente, sino el error que luce como verdad.",
          fuente: "Arthur Schopenhauer, El arte de tener razón (1831)",
        },
      ],
    },
  },
  {
    slug: "pfh-iii-deduccion-e-induccion",
    titulo: "Deducción e inducción: dos formas de razonar",
    categoria: "Lógica y argumentación",
    conceptos_clave: [
      "deducción",
      "inducción",
      "abducción",
      "razonamiento",
      "generalización",
      "certeza",
      "probabilidad",
      "inferencia",
      "método científico",
    ],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "¿Cómo llegamos a nuevos conocimientos? La epistemología distingue tres grandes formas de razonamiento inferencial: la deducción, la inducción y la abducción. Cada una tiene su dominio de aplicación, sus fortalezas y sus limitaciones. Comprender estas diferencias nos ayuda a evaluar qué tipo de conocimiento produce la filosofía, la ciencia, el derecho y el sentido común.",
        },
        {
          tipo: "subtitulo",
          contenido: "Razonamiento deductivo: de lo general a lo particular",
        },
        {
          tipo: "parrafo",
          contenido:
            "En la deducción, la conclusión está contenida implícitamente en las premisas. Si las premisas son verdaderas y el argumento es válido, la conclusión es necesariamente verdadera. No puede ser de otro modo. Ejemplo: 'Todos los mamíferos tienen sangre caliente. La ballena es un mamífero. Por lo tanto, la ballena tiene sangre caliente.' La deducción no amplía nuestro conocimiento del mundo; lo hace explícito. Es el método de las matemáticas y la lógica.",
        },
        {
          tipo: "subtitulo",
          contenido: "Razonamiento inductivo: de lo particular a lo general",
        },
        {
          tipo: "parrafo",
          contenido:
            "En la inducción, observamos casos particulares y generalizamos hacia una regla. 'He observado 1,000 cuervos y todos son negros, por lo tanto todos los cuervos son negros.' La conclusión va más allá de las premisas y por eso es solo probable, no garantizada. El filósofo David Hume señaló el 'problema de la inducción': nunca podemos estar seguros de que el próximo caso no será la excepción. En 1697, los europeos descubrieron cisnes negros en Australia, refutando la generalización de que 'todos los cisnes son blancos'.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La deducción garantiza la conclusión pero no amplía el conocimiento. La inducción amplía el conocimiento pero no lo garantiza. El método científico combina ambas: induce hipótesis a partir de observaciones y luego deduces predicciones para probarlas experimentalmente.",
        },
        {
          tipo: "subtitulo",
          contenido: "Abducción: la inferencia hacia la mejor explicación",
        },
        {
          tipo: "lista",
          items: [
            "La abducción fue formulada por el filósofo estadounidense Charles Sanders Peirce en el siglo XIX.",
            "Consiste en inferir la hipótesis más probable para explicar un hecho observado.",
            "Ejemplo clásico: el suelo está mojado → la mejor explicación es que llovió (aunque hay otras posibilidades).",
            "Es el razonamiento del detective: Sherlock Holmes no deduce ni induce; abuce (infiere la mejor explicación).",
            "Es también el razonamiento médico diagnóstico: el médico observa síntomas e infiere la enfermedad más probable.",
          ],
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama comparativo de deducción, inducción y abducción",
          caption:
            "Los tres tipos de razonamiento inferencial: deducción (general → particular), inducción (particular → general), abducción (efecto → causa más probable).",
        },
        {
          tipo: "cita",
          contenido:
            "El problema de la inducción es que nunca podemos estar seguros de que el sol saldrá mañana; solo sabemos que siempre ha salido hasta ahora.",
          fuente: "David Hume, Investigación sobre el entendimiento humano (1748)",
        },
      ],
    },
  },
  {
    slug: "pfh-iii-argumentacion-critica",
    titulo: "Argumentación crítica: analizar y evaluar razones",
    categoria: "Lógica y argumentación",
    conceptos_clave: [
      "argumentación",
      "modelo de Toulmin",
      "afirmación",
      "garantía",
      "evidencia",
      "refutación",
      "pensamiento crítico",
      "retórica",
      "dialéctica",
    ],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Argumentar no es simplemente hablar fuerte ni repetir una posición muchas veces. La argumentación es el arte de ofrecer razones para sostener una afirmación y de evaluar críticamente las razones que otros ofrecen. El filósofo británico Stephen Toulmin desarrolló en 1958 un modelo de análisis argumentativo que va más allá de la lógica formal para capturar cómo argumentamos realmente en el derecho, la ciencia y la vida cotidiana.",
        },
        {
          tipo: "subtitulo",
          contenido: "El modelo de Toulmin simplificado",
        },
        {
          tipo: "lista",
          items: [
            "Afirmación (Claim): lo que queremos demostrar. 'Esta política pública es injusta.'",
            "Datos o evidencia (Data/Grounds): los hechos que apoyan la afirmación. 'Beneficia al 5% más rico y perjudica al 40% más pobre.'",
            "Garantía (Warrant): el principio que conecta los datos con la afirmación. 'Una política que incrementa la desigualdad es injusta.'",
            "Respaldo (Backing): justificación de la garantía. 'Según la teoría de justicia de Rawls, las desigualdades solo son justas si benefician a los menos aventajados.'",
            "Cualificador modal (Qualifier): el grado de certeza de la afirmación. 'Probablemente', 'en la mayoría de los casos'.",
            "Refutación (Rebuttal): condiciones bajo las cuales la afirmación fallaría. 'A menos que existan beneficios indirectos para los pobres que superen el daño directo.'",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Cómo evaluar la fortaleza de un argumento",
        },
        {
          tipo: "parrafo",
          contenido:
            "Un buen argumento debe superar cuatro pruebas básicas: (1) Verdad de las premisas: ¿son los datos presentados verificables y exactos? (2) Relevancia: ¿los datos realmente apoyan la afirmación o son irrelevantes? (3) Suficiencia: ¿hay evidencia suficiente o solo casos aislados? (4) Aceptabilidad: ¿las garantías utilizadas son principios que las partes aceptarían como válidos? Un argumento puede fallar en cualquiera de estas dimensiones aunque su estructura formal sea correcta.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La retórica (persuasión por medios emocionales y estilísticos) no es lo mismo que la argumentación (persuasión por razones). Aristóteles ya distinguía logos (razón), ethos (credibilidad) y pathos (emoción) como modos de persuasión. Una argumentación crítica privilegia el logos, pero reconoce que ethos y pathos también juegan roles legítimos en la comunicación humana.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama del modelo argumentativo de Toulmin con sus seis elementos",
          caption:
            "El modelo de Toulmin descompone cualquier argumento en: afirmación, datos, garantía, respaldo, cualificador modal y refutación.",
        },
        {
          tipo: "cita",
          contenido:
            "El propósito de la argumentación no es vencer al adversario sino descubrir la verdad juntos.",
          fuente: "Stephen Toulmin, Los usos de la argumentación (1958)",
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────
  // FILOSOFÍA POLÍTICA — 4 fichas
  // ─────────────────────────────────────────────────────────────
  {
    slug: "pfh-iii-estado-poder-legitimidad",
    titulo: "El Estado y su legitimidad filosófica",
    categoria: "Filosofía política",
    conceptos_clave: [
      "Estado",
      "contrato social",
      "legitimidad",
      "autoridad",
      "poder",
      "Hobbes",
      "Locke",
      "Rousseau",
      "Dussel",
      "soberanía",
    ],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "¿Por qué debemos obedecer al Estado? ¿Qué hace que su autoridad sea legítima y no simplemente una imposición de los más poderosos? Estas preguntas han ocupado a los filósofos políticos desde la antigüedad. La teoría del contrato social, desarrollada entre los siglos XVII y XVIII, ofrece la respuesta más influyente en la tradición occidental: el Estado es legítimo porque los ciudadanos han acordado (implícita o explícitamente) ceder parte de su libertad natural a cambio de protección y orden.",
        },
        {
          tipo: "subtitulo",
          contenido: "Tres versiones del contrato social",
        },
        {
          tipo: "lista",
          items: [
            "Thomas Hobbes (Leviatán, 1651): en el estado de naturaleza la vida es 'solitaria, pobre, desagradable, brutal y breve'. Los humanos ceden todos sus derechos a un soberano absoluto para escapar de la guerra de todos contra todos. El Estado requiere obediencia total a cambio de seguridad.",
            "John Locke (Segundo Tratado, 1689): los humanos ya tienen derechos naturales (vida, libertad, propiedad) en el estado de naturaleza. El gobierno existe para protegerlos. Si viola esos derechos, los ciudadanos tienen el derecho de rebelarse. Base filosófica del liberalismo.",
            "Jean-Jacques Rousseau (El contrato social, 1762): el estado de naturaleza era bueno; la sociedad nos corrompió. El contrato social legítimo es aquel en que cada individuo se entrega a la voluntad general, que no puede atentar contra el bien común. Base filosófica de la democracia participativa.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Poder y legitimidad: más allá de Europa",
        },
        {
          tipo: "parrafo",
          contenido:
            "Enrique Dussel, filósofo argentino-mexicano, critica estas teorías por ignorar la perspectiva de los pueblos colonizados. Mientras Locke teorizaba el contrato social, los pueblos indígenas americanos eran despojados de sus tierras 'legítimamente' por ese mismo marco conceptual. Dussel propone partir del 'pueblo como sujeto político': la legitimidad no viene de un contrato abstracto sino del reconocimiento concreto de la dignidad de los excluidos. Para el zapatismo, por ejemplo, la autonomía comunitaria indígena es la forma más legítima de autogobierno, anterior y superior al Estado nación.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Distinción clave: PODER es la capacidad de hacer que otros obedezcan (puede ser por fuerza, costumbre o convencimiento). AUTORIDAD es el poder que se reconoce como legítimo. Un Estado puede tener poder sin autoridad (dictadura) o autoridad sin mucho poder coercitivo (democracias deliberativas fuertes). La filosofía política se pregunta qué hace que el poder sea autoridad legítima.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Diagrama comparativo de las tres teorías del contrato social",
          caption:
            "Hobbes, Locke y Rousseau parten del mismo concepto de 'estado de naturaleza' pero llegan a conclusiones radicalmente distintas sobre la legitimidad del Estado.",
        },
        {
          tipo: "cita",
          contenido:
            "El hombre nació libre, y en todas partes está encadenado.",
          fuente: "Jean-Jacques Rousseau, El contrato social (1762)",
        },
      ],
    },
  },
  {
    slug: "pfh-iii-democracia-deliberativa",
    titulo: "Democracia deliberativa: más allá de votar",
    categoria: "Filosofía política",
    conceptos_clave: [
      "democracia deliberativa",
      "acción comunicativa",
      "Habermas",
      "esfera pública",
      "razón pública",
      "asambleas ciudadanas",
      "EZLN",
      "participación",
      "deliberación",
    ],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La democracia representativa reduce la participación ciudadana a votar cada tres o seis años. ¿Puede llamarse verdaderamente democrática una sociedad donde los ciudadanos solo eligen entre opciones predefinidas por las élites? El filósofo alemán Jürgen Habermas propone una alternativa: la democracia deliberativa, donde la legitimidad de las decisiones políticas depende de la calidad del debate público que las precede.",
        },
        {
          tipo: "subtitulo",
          contenido: "Habermas y la acción comunicativa",
        },
        {
          tipo: "parrafo",
          contenido:
            "Habermas distingue dos tipos de racionalidad: la racionalidad instrumental (medios para fines, lógica del mercado y la burocracia) y la racionalidad comunicativa (orientada al entendimiento mutuo mediante el diálogo). La democracia deliberativa se basa en esta segunda racionalidad: las decisiones son legítimas cuando son el resultado de una deliberación pública libre, inclusiva e informada, donde los participantes están dispuestos a cambiar de posición ante mejores argumentos.",
        },
        {
          tipo: "lista",
          items: [
            "Condiciones ideales del discurso (Habermas): todos los afectados pueden participar, todos tienen el mismo derecho a hablar, no hay coerción, solo el 'mejor argumento' tiene fuerza.",
            "Esfera pública: el espacio (físico o virtual) donde los ciudadanos debaten asuntos de interés común, mediando entre el Estado y la sociedad civil.",
            "Democracia deliberativa vs. representativa: la representativa privilegia la agregación de preferencias (votos); la deliberativa privilegia la transformación de preferencias mediante el debate racional.",
            "Democracia deliberativa vs. participativa: la participativa enfatiza la acción directa; la deliberativa enfatiza la calidad argumentativa del debate.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Ejemplos mexicanos de deliberación democrática",
        },
        {
          tipo: "parrafo",
          contenido:
            "El Ejército Zapatista de Liberación Nacional (EZLN) practica la democracia por 'consulta y acuerdo': ninguna decisión importante se toma sin consultar a las comunidades de base. Las Juntas de Buen Gobierno en Chiapas son asambleas deliberativas donde los cargos se ejercen por rotación y revocación. En otro extremo, las consultas ciudadanas del gobierno federal (2018-2024) han sido criticadas como democracia plebiscitaria (sí/no) más que deliberativa, por carecer de debate informado previo y representatividad suficiente.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Las asambleas ciudadanas por sorteo son la propuesta más radical de la democracia deliberativa contemporánea. En lugar de elegir representantes por voto, se seleccionan ciudadanos al azar (como en un jurado) para deliberar sobre temas complejos. Irlanda usó este método para debatir el matrimonio igualitario y el aborto, con resultados considerados más representativos y mejor informados que los referéndums tradicionales.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Esquema de la esfera pública habermasiana y los modelos de democracia",
          caption:
            "La esfera pública como espacio de mediación entre el Estado y la sociedad civil, donde la deliberación racional produce legitimidad política según Habermas.",
        },
        {
          tipo: "cita",
          contenido:
            "Solo son válidas las normas de acción con las que podrían estar de acuerdo todos los posibles afectados como participantes en discursos racionales.",
          fuente: "Jürgen Habermas, Facticidad y validez (1992)",
        },
      ],
    },
  },
  {
    slug: "pfh-iii-justicia-social-rawls-dussel",
    titulo: "Justicia social: Rawls, Nussbaum y Dussel",
    categoria: "Filosofía política",
    conceptos_clave: [
      "justicia social",
      "velo de la ignorancia",
      "Rawls",
      "enfoque de capacidades",
      "Nussbaum",
      "ética de la liberación",
      "Dussel",
      "el Otro",
      "desigualdad",
      "México",
    ],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "¿Qué hace que una sociedad sea justa? ¿Basta con que cada quien reciba lo que merece, o la justicia exige corregir las desigualdades estructurales? En el siglo XX y XXI, tres grandes corrientes filosóficas han ofrecido respuestas que siguen siendo urgentemente relevantes para sociedades como México, donde el 10% más rico concentra el 37% del ingreso nacional.",
        },
        {
          tipo: "subtitulo",
          contenido: "John Rawls: el velo de la ignorancia",
        },
        {
          tipo: "parrafo",
          contenido:
            "En su obra Una teoría de la justicia (1971), John Rawls propone un experimento mental: imagina que debes diseñar las reglas de tu sociedad sin saber en qué posición nacerás (rico o pobre, hombre o mujer, de qué etnia). Este 'velo de la ignorancia' elimina el sesgo personal. Rawls argumenta que bajo estas condiciones, cualquier persona racional elegiría: (1) máxima libertad igual para todos, y (2) que las desigualdades económicas solo sean permitidas si benefician a los menos aventajados (principio de diferencia). La justicia es equidad (fairness), no igualdad absoluta.",
        },
        {
          tipo: "subtitulo",
          contenido: "Martha Nussbaum: el enfoque de las capacidades",
        },
        {
          tipo: "parrafo",
          contenido:
            "La filósofa estadounidense Martha Nussbaum (junto con Amartya Sen) propone medir la justicia no por ingreso sino por capacidades: ¿puede la persona realmente hacer y ser lo que tiene razones para valorar? Su lista de diez capacidades centrales incluye: vida con duración normal, salud corporal, integridad corporal, sentidos e imaginación, emociones, razón práctica, afiliación social, relación con otras especies, juego y control sobre el entorno político y material. Una sociedad justa garantiza el umbral mínimo de cada capacidad para todos.",
        },
        {
          tipo: "subtitulo",
          contenido: "Enrique Dussel: ética desde el Otro",
        },
        {
          tipo: "parrafo",
          contenido:
            "El filósofo argentino-mexicano Enrique Dussel critica tanto a Rawls como a Nussbaum por teorizar desde el centro: su 'persona racional' es implícitamente europea, masculina y de clase media. La ética de la liberación de Dussel parte del 'Otro': el pobre, el indígena, el excluido, la mujer oprimida. La justicia no es un principio abstracto sino la respuesta concreta al 'rostro' del que sufre. México, como nación periférica del sistema-mundo capitalista, debe desarrollar su propia filosofía política desde la experiencia de la colonialidad.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Aplicación a México: según el CONEVAL 2022, el 36.3% de la población mexicana vive en pobreza. Desde Rawls, esto es injusto porque no beneficia a los menos aventajados. Desde Nussbaum, porque millones carecen de capacidades básicas (salud, educación, seguridad). Desde Dussel, porque es resultado de un sistema colonial que sigue operando bajo nuevas formas.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Comparación de las tres teorías de justicia social: Rawls, Nussbaum y Dussel",
          caption:
            "Tres respuestas filosóficas a la pregunta '¿qué hace justa a una sociedad?': equidad como imparcialidad (Rawls), capacidades humanas (Nussbaum), liberación del Otro (Dussel).",
        },
        {
          tipo: "cita",
          contenido:
            "La injusticia no es algo abstracto. Tiene rostro, cuerpo, historia. El Otro que sufre exige una respuesta ética antes que una teoría.",
          fuente: "Enrique Dussel, Ética de la liberación en la era de la globalización y la exclusión (1998)",
        },
      ],
    },
  },
  {
    slug: "pfh-iii-desobediencia-civil",
    titulo: "Desobediencia civil: la filosofía de la protesta legítima",
    categoria: "Filosofía política",
    conceptos_clave: [
      "desobediencia civil",
      "Thoreau",
      "Gandhi",
      "Martin Luther King",
      "resistencia no violenta",
      "obligación política",
      "injusticia",
      "protesta",
      "México",
    ],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "¿Existe el deber de obedecer leyes injustas? ¿Puede la desobediencia a la ley ser un acto moral y políticamente legítimo? Henry David Thoreau, en su ensayo La desobediencia civil (1849), respondió con una afirmación rotunda: no solo tenemos el derecho de desobedecer leyes injustas, sino la obligación. Su ensayo, escrito mientras estaba en prisión por negarse a pagar impuestos que financiaban la esclavitud y la guerra contra México, inspiró a Gandhi y a Martin Luther King.",
        },
        {
          tipo: "subtitulo",
          contenido: "Condiciones filosóficas para la desobediencia civil legítima",
        },
        {
          tipo: "lista",
          items: [
            "Injusticia grave y clara: la ley o política violada debe ser manifiestamente injusta, no solo inconveniente o con la que se esté en desacuerdo.",
            "Agotamiento de vías legales: deben haberse intentado los medios legítimos de cambio (votar, peticiones, litigio) sin éxito.",
            "Carácter público: la acción se realiza abiertamente, sin ocultamiento, anunciando públicamente la razón.",
            "No violencia: la desobediencia se dirige a la ley o política injusta, no a personas. Gandhi la llamó satyagraha (fuerza de la verdad).",
            "Disposición a aceptar las consecuencias legales: aceptar el castigo demuestra respeto por el estado de derecho en general y refuerza el mensaje moral.",
            "Carácter político: va dirigida a la opinión pública para cambiar la conciencia social, no al beneficio personal.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Ejemplos mexicanos de desobediencia civil",
        },
        {
          tipo: "parrafo",
          contenido:
            "México tiene una rica historia de desobediencia civil filosóficamente justificable: el movimiento estudiantil del 68 (aunque terminó en masacre); el #YoSoy132 (2012) que denunció la parcialidad mediática y el fraude electoral; la CNTE que ocupa simbólicamente espacios públicos para denunciar reformas educativas que consideran injustas; el movimiento feminista que ha pintado monumentos y bloqueado avenidas como acto de protesta ante el feminicidio sistemático. En cada caso, el debate filosófico gira en torno a si se cumplen las condiciones de legitimidad.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Martin Luther King, en su Carta desde la cárcel de Birmingham (1963), respondió directamente a quienes le pedían esperar más para la igualdad racial: 'Uno tiene no solo la responsabilidad legal sino la moral de obedecer leyes justas. Inversamente, uno tiene la responsabilidad moral de desobedecer leyes injustas.' King citaba a Aquino y a Agustín: una ley injusta no es ley en absoluto.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Línea histórica de la desobediencia civil desde Thoreau hasta el feminismo mexicano",
          caption:
            "La tradición de la desobediencia civil como herramienta filosófica y política: de Thoreau (1849) a Gandhi, King y los movimientos sociales contemporáneos de México.",
        },
        {
          tipo: "cita",
          contenido:
            "Bajo un gobierno que encarcela a alguien injustamente, el lugar del hombre justo es también la prisión.",
          fuente: "Henry David Thoreau, La desobediencia civil (1849)",
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────
  // FILOSOFÍA DEL ARTE — 3 fichas
  // ─────────────────────────────────────────────────────────────
  {
    slug: "pfh-iii-estetica-bello-sublime",
    titulo: "Lo bello y lo sublime: fundamentos de la estética filosófica",
    categoria: "Filosofía del arte",
    conceptos_clave: [
      "estética",
      "lo bello",
      "lo sublime",
      "Kant",
      "Burke",
      "universalidad subjetiva",
      "juicio de gusto",
      "naturaleza",
      "arte mexicano",
    ],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La estética es la rama de la filosofía que estudia la experiencia de lo bello, el arte y el juicio del gusto. La palabra viene del griego aisthesis (percepción sensible). Aunque los humanos siempre han valorado la belleza, fue Immanuel Kant quien en la Crítica del juicio (1790) ofreció el análisis más influyente: la experiencia estética es única porque no es ni puramente subjetiva ni puramente objetiva, sino que tiene pretensión de universalidad sin concepto.",
        },
        {
          tipo: "subtitulo",
          contenido: "Kant: lo bello y sus características",
        },
        {
          tipo: "lista",
          items: [
            "Sin interés: la experiencia de lo bello es desinteresada; no nos importa si el objeto existe, solo su apariencia. Diferente al placer sensible (quiero comerme el fruto) o al bien moral (quiero que existan personas justas).",
            "Universalidad subjetiva: cuando decimos 'esto es bello' no decimos 'a mí me gusta'; reclamamos que cualquier persona debería estar de acuerdo, aunque no podamos demostrarlo con un concepto.",
            "Finalidad sin fin: lo bello parece diseñado para agradarnos, aunque no haya un propósito definido. La forma del objeto parece 'hecha a la medida' de nuestra facultad de conocimiento.",
            "Necesidad: el gusto por lo bello tiene una especie de necesidad: esperamos el asentimiento de todos, a diferencia del mero agrado personal.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Lo sublime: belleza desbordante",
        },
        {
          tipo: "parrafo",
          contenido:
            "Edmund Burke (1757) distinguió lo bello (suave, pequeño, delicado) de lo sublime (vasto, poderoso, oscuro). Para Kant, lo sublime es la experiencia de algo que supera nuestra capacidad sensible de comprenderlo: una montaña inmensa, una tormenta eléctrica, el abismo. En ese momento de desbordamiento, descubrimos nuestra dignidad moral: aunque la naturaleza puede destruirnos físicamente, nuestra razón y libertad la superan. En México, el Popocatépetl, los barrancos del Cobre o los cenotes de Yucatán son experiencias de lo sublime que han marcado profundamente el arte y la espiritualidad mesoamericana.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El muralismo mexicano usa deliberadamente la escala sublime. Los murales de Diego Rivera en el Palacio Nacional son intencionalmente abrumadores: 4,500 metros cuadrados de historia que desbordan la capacidad de abarcarlos de un vistazo. Esta estrategia estética busca producir en el espectador la misma sensación de lo sublime que Kant describía: pequeñez física, grandeza intelectual.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Comparación entre experiencias estéticas de lo bello y lo sublime con ejemplos del arte mexicano",
          caption:
            "Lo bello (armonioso, proporcionado, accesible) vs. lo sublime (vasto, abrumador, que supera la comprensión sensible). Dos modos fundamentales de la experiencia estética.",
        },
        {
          tipo: "cita",
          contenido:
            "Lo sublime es lo que place inmediatamente por su resistencia contra el interés de los sentidos.",
          fuente: "Immanuel Kant, Crítica del juicio (1790), §29",
        },
      ],
    },
  },
  {
    slug: "pfh-iii-arte-como-conocimiento",
    titulo: "El arte como forma de conocimiento",
    categoria: "Filosofía del arte",
    conceptos_clave: [
      "arte y conocimiento",
      "Hegel",
      "Heidegger",
      "Dewey",
      "experiencia estética",
      "muralismo mexicano",
      "Rivera",
      "Orozco",
      "Siqueiros",
      "verdad",
    ],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La tradición filosófica occidental desconfió durante siglos del arte como fuente de conocimiento. Para Platón, el arte era imitación de imitaciones, alejado de la verdad. Para Descartes, solo la razón matemática garantizaba conocimiento seguro. Sin embargo, a partir del Romanticismo, los filósofos comenzaron a rehabilitar el arte: no solo como expresión de emociones, sino como una forma única e irreemplazable de acceder a verdades que el concepto lógico no puede capturar.",
        },
        {
          tipo: "subtitulo",
          contenido: "Hegel: el arte como espíritu objetivado",
        },
        {
          tipo: "parrafo",
          contenido:
            "Para Hegel, el arte es la primera forma en que el Espíritu (Geist) se hace consciente de sí mismo en la historia. La escultura griega, la arquitectura gótica, la pintura flamenca: cada época histórica produce el arte que le corresponde, que revela su visión del mundo. Hegel creía que el arte 'clásico' griego había alcanzado la perfecta armonía entre forma sensible e idea espiritual; el arte moderno tendría que superarlo por vías más conceptuales. Por eso habló de 'la muerte del arte': no su desaparición, sino su transformación en filosofía.",
        },
        {
          tipo: "subtitulo",
          contenido: "Heidegger: la obra de arte como apertura de mundo",
        },
        {
          tipo: "parrafo",
          contenido:
            "En El origen de la obra de arte (1935), Martin Heidegger argumenta que una verdadera obra de arte no representa la realidad sino que la abre: nos hace ver el mundo de otra manera. El ejemplo de Heidegger es un par de zapatos de Van Gogh: no son solo zapatos pintados; revelan el mundo del campesino, su fatiga, su relación con la tierra. El arte 'pone en obra la verdad' (ins Werk setzt die Wahrheit). Esta idea sugiere que las grandes obras de arte mexicano no ilustran la historia; la revelan de maneras que ningún libro de texto puede.",
        },
        {
          tipo: "subtitulo",
          contenido: "El muralismo mexicano como conocimiento social",
        },
        {
          tipo: "lista",
          items: [
            "Diego Rivera: los murales del Palacio Nacional narran la historia de México desde los aztecas hasta el capitalismo industrial. Son enciclopedias visuales accesibles para una población mayoritariamente analfabeta en los años 20.",
            "José Clemente Orozco: sus murales en la Preparatoria Nacional muestran la violencia y la tragedia de la Revolución sin idealización. Conocimiento crítico, no propagandístico.",
            "David Alfaro Siqueiros: experimentó con materiales industriales (piroxilina, acrílico) y perspectivas dinámicas para crear obras que se perciben diferente al moverse el espectador. Forma y contenido como conocimiento integrado.",
            "John Dewey (Arte como experiencia, 1934): el arte no es un objeto en un museo sino una cualidad de la experiencia vivida. El muralismo, accesible en edificios públicos, democratiza la experiencia estética.",
          ],
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Mural del Palacio Nacional de Diego Rivera como ejemplo de arte como conocimiento histórico",
          caption:
            "El muralismo mexicano como epistemología visual: narración histórica, crítica social y afirmación de identidad cultural en espacios públicos accesibles a todos.",
        },
        {
          tipo: "cita",
          contenido:
            "La obra de arte abre a su modo el ser del ente. En la obra acontece esta apertura, es decir, el desocultamiento, es decir, la verdad del ente.",
          fuente: "Martin Heidegger, El origen de la obra de arte (1935)",
        },
      ],
    },
  },
  {
    slug: "pfh-iii-estetica-latinoamericana",
    titulo: "Estética latinoamericana: belleza desde el sur",
    categoria: "Filosofía del arte",
    conceptos_clave: [
      "estética latinoamericana",
      "Rodolfo Kusch",
      "América profunda",
      "estética indígena",
      "barroco mestizo",
      "Rufino Tamayo",
      "Remedios Varo",
      "colonialidad",
      "interculturalidad",
    ],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La estética filosófica dominante ha sido históricamente europea: griega, alemana, francesa. Sin embargo, América Latina tiene tradiciones estéticas milenarias que ofrecen categorías propias de belleza, arte y experiencia sensible, irreductibles a los conceptos occidentales. Reconocer y desarrollar una estética latinoamericana es parte del proyecto filosófico de descolonización del pensamiento.",
        },
        {
          tipo: "subtitulo",
          contenido: "Rodolfo Kusch y América profunda",
        },
        {
          tipo: "parrafo",
          contenido:
            "El filósofo argentino Rodolfo Kusch (1922-1979) viajó por las comunidades andinas y desarrolló una filosofía basada en el 'estar' indígena, en contraste con el 'ser' europeo. Para Kusch, la experiencia estética latinoamericana no separa al sujeto del objeto como la estética kantiana: en la cosmovisión andina, uno no contempla la montaña desde afuera sino que 'está' en la montaña, es parte de ella. La Pachamama no es un objeto estético; es un sujeto con el que se tiene una relación de reciprocidad (ayni). Esta es una estética radicalmente diferente.",
        },
        {
          tipo: "lista",
          items: [
            "Estética mesoamericana: el arte prehispánico integra belleza, poder cosmológico y función ritual. El Calendario Azteca no es solo un objeto decorativo; es un instrumento de conocimiento astronómico y teológico.",
            "Barroco mestizo: la arquitectura y pintura barrocas en Nueva España (siglos XVII-XVIII) mezcló formas europeas con iconografía indígena. El convento de Tonantzintla (Puebla) es un ejemplo: santos católicos rodeados de flores, frutos y ángeles con rasgos indígenas.",
            "Rufino Tamayo (1899-1991): pintor oaxaqueño que sintetizó la tradición prehispánica con el expresionismo moderno. Su paleta de colores terrosos y sus figuras arquetípicas construyen una estética que no es ni puramente indígena ni puramente europea.",
            "Remedios Varo (1908-1963): pintora surrealista catalana-mexicana que integró el esoterismo europeo con la magia cotidiana latinoamericana. Su obra crea un universo estético propio donde ciencia, espiritualidad y feminismo se entrelazan.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El filósofo peruano Aníbal Quijano acuñó el concepto de 'colonialidad del poder' para describir cómo el dominio colonial no terminó con la independencia política; continúa en el ámbito epistémico y estético: se sigue considerando que el arte 'universal' es el europeo y que el arte latinoamericano es 'folclore' o 'artesanía'. La estética decolonial desafía esta jerarquía.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Collage de expresiones estéticas latinoamericanas: arte prehispánico, barroco mestizo, muralismo y surrealismo latinoamericano",
          caption:
            "La diversidad estética latinoamericana: del calendario azteca al barroco mestizo, del muralismo social al surrealismo de Remedios Varo, construyendo belleza desde el sur.",
        },
        {
          tipo: "cita",
          contenido:
            "América no piensa; América está. Y en ese estar radica la profundidad de su pensamiento más auténtico.",
          fuente: "Rodolfo Kusch, América profunda (1962)",
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────
  // PENSADORES LATINOAMERICANOS — 1 ficha
  // ─────────────────────────────────────────────────────────────
  {
    slug: "pfh-iii-leopoldo-zea-mexicanidad",
    titulo: "Leopoldo Zea y la filosofía de lo mexicano",
    categoria: "Pensadores latinoamericanos",
    conceptos_clave: [
      "Leopoldo Zea",
      "filosofía latinoamericana",
      "lo mexicano",
      "complejo de inferioridad",
      "filosofía de la liberación",
      "Mauricio Beuchot",
      "hermenéutica analógica",
      "identidad",
      "periferia filosófica",
    ],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "¿Puede haber una filosofía genuinamente mexicana, o toda filosofía es universal por definición? Leopoldo Zea (1912-2004) dedicó su vida a responder esta pregunta. Discípulo de José Gaos (filósofo español exiliado en México), Zea argumentó que América Latina no solo puede tener su propia filosofía, sino que necesita hacerlo para superar la condición colonial que la ha tenido siempre mirando hacia Europa como el centro de la cultura y el pensamiento.",
        },
        {
          tipo: "subtitulo",
          contenido: "El proyecto de Zea: filosofía desde la circunstancia",
        },
        {
          tipo: "parrafo",
          contenido:
            "Inspirado en la famosa frase de Ortega y Gasset 'yo soy yo y mi circunstancia', Zea propuso que la filosofía latinoamericana debe partir de la circunstancia concreta de América Latina: su historia colonial, su mestizaje, su dependencia económica y cultural, su diversidad étnica. No se trata de rechazar la filosofía europea sino de asimilarla críticamente, reinterpretarla desde nuestra experiencia histórica específica. En El positivismo en México (1943) y La filosofía americana como filosofía sin más (1969), Zea mostró cómo las ideas filosóficas europeas (positivismo, liberalismo, marxismo) fueron transformadas al ser apropiadas por el pensamiento latinoamericano.",
        },
        {
          tipo: "subtitulo",
          contenido: "El complejo de inferioridad y la autenticidad",
        },
        {
          tipo: "lista",
          items: [
            "El 'complejo de inferioridad' latinoamericano: la tendencia a considerar que lo propio es inferior a lo europeo o norteamericano, y que la auténtica cultura debe importarse.",
            "Crítica al mestizaje como problema: mientras José Vasconcelos lo celebraba ('la raza cósmica'), Zea lo analizaba como herida histórica que debe ser reconocida para superarse.",
            "La liberación filosófica: superar el complejo de inferioridad no implica rechazar el pensamiento universal, sino participar en él como sujetos activos, no como receptores pasivos.",
            "Filosofía como praxis: para Zea, filosofar no es solo reflexionar sobre el mundo sino transformarlo. La filosofía latinoamericana tiene una vocación política intrínseca.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Mauricio Beuchot y la hermenéutica analógica",
        },
        {
          tipo: "parrafo",
          contenido:
            "El filósofo mexicano Mauricio Beuchot (1950) desarrolla el proyecto de Zea en clave hermenéutica. Su propuesta de 'hermenéutica analógica' busca un camino medio entre la interpretación unívoca (un solo significado correcto) y la equívoca (todos los significados son igualmente válidos). La analogía permite reconocer la pluralidad de perspectivas filosóficas (indígena, colonial, moderna, posmoderna) sin caer en el relativismo absoluto. Esta propuesta tiene especial relevancia para México, sociedad marcada por la diversidad cultural y la necesidad de diálogo intercultural.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Retrato intelectual de Leopoldo Zea y el árbol genealógico de la filosofía latinoamericana",
          caption:
            "Leopoldo Zea (1912-2004) como fundador de la filosofía latinoamericana como disciplina académica, maestro de generaciones de pensadores que continúan el proyecto de pensar desde y para América Latina.",
        },
        {
          tipo: "cita",
          contenido:
            "América Latina necesita una filosofía que parta de su propia circunstancia, que haga de sus problemas el punto de arranque de una reflexión auténticamente filosófica.",
          fuente: "Leopoldo Zea, La filosofía americana como filosofía sin más (1969)",
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────
  // PRAXIS FILOSÓFICA — 2 fichas
  // ─────────────────────────────────────────────────────────────
  {
    slug: "pfh-iii-filosofia-con-ninos",
    titulo: "Filosofía con niños: pensar juntos desde la infancia",
    categoria: "Praxis filosófica",
    conceptos_clave: [
      "Filosofía para Niños",
      "Matthew Lipman",
      "comunidad de indagación",
      "pensamiento crítico",
      "diálogo filosófico",
      "infancia",
      "SEP",
      "México",
      "educación filosófica",
    ],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "¿Pueden los niños hacer filosofía? El filósofo y educador estadounidense Matthew Lipman respondió afirmativamente en los años 70 con su programa Philosophy for Children (P4C). Lipman observó que los niños hacen preguntas genuinamente filosóficas desde temprana edad: '¿Por qué tengo que hacer lo que me dicen?', '¿Qué es lo justo?', '¿Existen los sueños de verdad?'. El problema no es la capacidad filosófica de los niños, sino que la educación tradicional la suprime en lugar de cultivarla.",
        },
        {
          tipo: "subtitulo",
          contenido: "La comunidad de indagación",
        },
        {
          tipo: "parrafo",
          contenido:
            "El método central de P4C es la 'comunidad de indagación': el grupo de estudiantes lee juntos un texto filosófico narrativo (Lipman escribió novelas especialmente diseñadas), identifica las preguntas que les genera, vota para elegir la pregunta más interesante y dialoga filosóficamente sobre ella. El maestro no da respuestas sino que facilita el diálogo mediante preguntas socráticas. El objetivo no es llegar a una conclusión correcta sino desarrollar el hábito del pensamiento riguroso, cuidadoso y creativo.",
        },
        {
          tipo: "lista",
          items: [
            "Pensamiento crítico: evaluar razones, identificar supuestos, reconocer inconsistencias.",
            "Pensamiento creativo: generar nuevas ideas, explorar posibilidades no convencionales, pensar por analogía.",
            "Pensamiento cuidadoso: escuchar con atención, respetar las perspectivas diferentes, reconocer la complejidad.",
            "Pensamiento colaborativo: construir ideas juntos, perfeccionar las ideas de los demás, llegar a comprensiones compartidas.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Implementaciones en México",
        },
        {
          tipo: "parrafo",
          contenido:
            "La SEP ha implementado elementos del diálogo filosófico en algunos programas curriculares, especialmente en el área de 'Formación Cívica y Ética'. La Nueva Escuela Mexicana (NEM) del MCCEMS incorpora el enfoque comunitario e indagatorio que coincide con la pedagogía de la P4C. Varias universidades mexicanas (UNAM, UPN, Iberoamericana) tienen programas de formación docente en filosofía con niños y jóvenes. La CEFPSVLT (Centro de Estudios de Filosofía Política y Social del Estado de Veracruz) ha desarrollado adaptaciones de P4C para contextos indígenas y rurales.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La filosofía con niños no es simplificar la filosofía adulta: es reconocer que los niños son ya sujetos filosóficos, capaces de asombro, cuestionamiento y argumentación. Lo que necesitan es un ambiente que valide y cultive esas capacidades, no que las sustituya por respuestas prefabricadas.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Estudiantes en círculo de indagación filosófica en una escuela mexicana",
          caption:
            "La comunidad de indagación filosófica: estudiantes dispuestos en círculo, diálogo socrático facilitado por el docente, construcción colaborativa del pensamiento.",
        },
        {
          tipo: "cita",
          contenido:
            "Si queremos una sociedad más razonable y justa, debemos educar niños para que piensen por sí mismos con rigor, cuidado y creatividad desde el principio.",
          fuente: "Matthew Lipman, Thinking in Education (1991)",
        },
      ],
    },
  },
  {
    slug: "pfh-iii-praxis-filosofica-comunitaria",
    titulo: "La praxis filosófica: del aula a la comunidad",
    categoria: "Praxis filosófica",
    conceptos_clave: [
      "praxis filosófica",
      "café filosófico",
      "círculo socrático",
      "filosofía en la calle",
      "intervención filosófica",
      "comunidad",
      "Marx",
      "filosofía aplicada",
      "transformación social",
    ],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "En su undécima tesis sobre Feuerbach (1845), Karl Marx escribió la frase que inaugura la filosofía como praxis: 'Los filósofos no han hecho más que interpretar el mundo de distintas maneras; de lo que se trata es de transformarlo.' La praxis filosófica toma este imperativo en serio: la filosofía no debe permanecer encerrada en las universidades o en los libros, sino salir a los espacios públicos, las comunidades, las calles, para contribuir a la reflexión colectiva y a la transformación social.",
        },
        {
          tipo: "subtitulo",
          contenido: "¿Qué es la praxis filosófica?",
        },
        {
          tipo: "parrafo",
          contenido:
            "La praxis filosófica (término acuñado por Gerd Achenbach en Alemania en los años 80) es la aplicación de métodos y actitudes filosóficas fuera del ámbito académico: en la orientación personal, la consultoría organizacional, la mediación comunitaria, la educación informal y los espacios públicos. No se trata de aplicar teorías filosóficas como recetas, sino de usar la actitud filosófica (pregunta, duda, análisis conceptual, diálogo) en contextos no académicos.",
        },
        {
          tipo: "subtitulo",
          contenido: "Formas de praxis filosófica comunitaria",
        },
        {
          tipo: "lista",
          items: [
            "Café filosófico: reunión informal en un espacio público (café, biblioteca, plaza) donde se debate un tema filosófico. Originado por Marc Sautet en París (1992). No requiere formación filosófica previa; solo disposición al diálogo.",
            "Círculo socrático: adaptación del método socrático de pregunta y respuesta para grupos comunitarios. Parte de las experiencias y preguntas de los propios participantes.",
            "Filosofía en la calle: el filósofo sale a espacios públicos (plazas, mercados, parques) y ofrece conversaciones filosóficas a cualquier transeúnte. Democratiza el acceso a la filosofía.",
            "Filosofía con poblaciones vulnerables: talleres filosóficos en centros penitenciarios, hospitales, asilos, centros comunitarios. La filosofía como herramienta de dignificación y reflexión.",
            "Intervención filosófica escolar: diseño de actividades filosóficas integradas al currículo de cualquier materia (no solo Filosofía): debatir dilemas éticos en Biología, analizar argumentos en Historia, explorar estética en Educación Artística.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Diseñando una intervención filosófica escolar",
        },
        {
          tipo: "parrafo",
          contenido:
            "Una intervención filosófica en tu escuela o comunidad puede seguir estos pasos: (1) Identificar un problema o pregunta genuina que afecte a la comunidad (inseguridad, desigualdad, discriminación). (2) Investigar las perspectivas filosóficas relevantes (ética, filosofía política, epistemología). (3) Diseñar un espacio de diálogo que sea inclusivo, seguro y respetuoso de la diversidad. (4) Facilitar la sesión usando preguntas socráticas, no dando respuestas. (5) Documentar y sistematizar las reflexiones producidas. (6) Vincular las reflexiones con acciones concretas en la comunidad.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La diferencia entre teoría y praxis: la teoría busca comprender el mundo; la praxis busca transformarlo mediante la acción informada por la reflexión. La praxis filosófica auténtica no es 'filosofía aplicada' (aplicar teorías existentes) sino filosofía que emerge de y regresa a la experiencia vivida de la comunidad.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Café filosófico comunitario en una plaza pública con participantes de diversas edades",
          caption:
            "La filosofía fuera del aula: cafés filosóficos, círculos socráticos y filosofía en la calle como formas de democratizar el pensamiento crítico y contribuir a la transformación comunitaria.",
        },
        {
          tipo: "cita",
          contenido:
            "Los filósofos no han hecho más que interpretar el mundo de distintas maneras; de lo que se trata es de transformarlo.",
          fuente: "Karl Marx, Tesis sobre Feuerbach (1845), Tesis XI",
        },
      ],
    },
  },
] as const;

export async function seedBibliotecaPFHIII(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed Biblioteca PFH-III (15 fichas)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", "PFH-III")
    .single();

  if (uacErr || !uacRow) {
    throw new Error(
      `UAC PFH-III no encontrada. Ejecuta primero seed-mccems.ts y seed-pfhiii.ts. Error: ${uacErr?.message}`
    );
  }

  const rows = FICHAS_PFHIII.map((f, i) => ({
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

  if (error) throw new Error(`Error seeding fichas PFH-III: ${error.message}`);

  console.log(`  ✓ ${rows.length} fichas de biblioteca de PFH-III insertadas/actualizadas.`);
  console.log("\n✅ Seed Biblioteca PFH-III completado.\n");
}

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
  seedBibliotecaPFHIII(sb).catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
}

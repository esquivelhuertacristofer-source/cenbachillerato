"""Generate src/data/planteamiento/pfh-iii.json — PFH Semestre 3 (4 progresiones)."""
import json, pathlib

OUT = pathlib.Path(__file__).parent.parent / "src" / "data" / "planteamiento" / "pfh-iii.json"

data = {
  "PFH-III-P01": {
    "code": "PFH-III-P01",
    "title": "Aplica herramientas de logica y argumentacion para evaluar discursos y textos",
    "level": "Pensamiento Filosofico y Humanistico III",
    "duration": "~4h (3 sesiones de 50 min)",
    "difficulty": "Intermedio",
    "category": "Logica y argumentacion",
    "metadata": {
      "objective": "Identificar y aplicar las estructuras de la logica formal e informal (deduccion, induccion, argumento, premisa, conclusion) para evaluar la validez y solidez de discursos publicos, identificar falacias y construir argumentos bien estructurados.",
      "competencies": [
        "Distingue argumento de opinion: un argumento ofrece razones; una opinion es una creencia sin fundamento explicito",
        "Identifica la estructura del argumento: premisas + conclusion; evalua validez (forma) y solidez (verdad de premisas)",
        "Distingue razonamiento deductivo (de lo general a lo particular) del inductivo (de lo particular a lo general)",
        "Identifica 8 falacias logicas comunes en discursos politicos y publicidad mexicana: ad hominem, hombre de paja, pendiente resbaladiza, apelacion a la autoridad, generalizacion apresurada, falsa dicotomia, apelacion a la emocion, circularidad",
        "Construye un argumento solido de tres premisas sobre un problema etico o social actual en Mexico"
      ],
      "materials": [
        "Fragmentos de discursos politicos mexicanos (ultimas campanas electorales) para analisis de falacias",
        "Ficha: 8 falacias logicas con definicion y ejemplo en contexto mexicano",
        "Ejercicios de silogismo aristotelico (Todos los A son B; X es A; por lo tanto X es B)",
        "Anuncio publicitario mexicano con falacias para analizar en equipo",
        "Guia de construccion de argumento: premisa 1 + premisa 2 + conclusion valida"
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "S1", "duration": "50 min", "label": "Estructura del argumento: premisas, conclusion, validez y solidez"},
        {"phase": "S2", "duration": "50 min", "label": "Falacias logicas en discursos publicos y publicidad"},
        {"phase": "S3", "duration": "50 min", "label": "Construccion de argumentos solidos sobre problemas sociales de Mexico"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "10 min",
          "description": "Activar la diferencia entre decir algo y argumentarlo.",
          "activity": "El docente dice: La educacion en Mexico es mala. Pausa. Es eso un argumento? No, es una opinion. Para que sea un argumento necesitamos razones. Los estudiantes proponen razones posibles. El docente estructura: Premisa 1 + Premisa 2 + Conclusion. Introduccion a la logica como herramienta de claridad y honestidad intelectual."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "30 min",
          "description": "S1: estructura logica del argumento. S2: falacias en discursos reales. S3: construccion de argumentos.",
          "activity": "S1: El silogismo aristotelico: Todos los humanos son mortales; Socrates es humano; por lo tanto Socrates es mortal. Valido (forma correcta) y solido (premisas verdaderas). Ejercicios: los estudiantes evaluan si 5 argumentos son validos, invalidos, solidos o no solidos. Distincion deductivo vs inductivo: ejemplo de induccion inductiva erronea: todos los cuervos que he visto son negros, por lo tanto todos los cuervos son negros (generalizacion apresurada). S2: Analisis de discurso politico real (campafia electoral reciente): identificar falacias. El docente presenta la ficha de 8 falacias con ejemplo mexicano: ad hominem (atacar a la persona en lugar del argumento); hombre de paja (distorsionar el argumento del oponente); pendiente resbaladiza (si pasa X inevitablemente pasara Y sin fundamento); apelacion a la autoridad (lo dijo el experto, sin evaluar la evidencia). S3: Cada estudiante construye un argumento de 3 premisas sobre un problema social de Mexico (desigualdad, acceso al agua, violencia de genero). Intercambian y evaluan la validez y solidez del argumento del companero."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "10 min",
          "description": "Reflexion sobre la logica como herramienta ciudadana.",
          "activity": "El docente pregunta: si todos los ciudadanos identificaran falacias en los discursos politicos, como cambiaria la democracia en Mexico? Conexion con el IIF-UNAM (Instituto de Investigaciones Filosoficas): la logica y la filosofia analitica son areas de investigacion activa en Mexico."
        }
      ]
    },
    "theory": {
      "introduction": "La logica es la disciplina que estudia las formas del pensamiento valido: los principios que distinguen un razonamiento correcto de uno incorrecto, independientemente del contenido. Es una herramienta fundamental para la vida democratica: los ciudadanos que identifican falacias y evaluan argumentos son mas resistentes a la manipulacion politica y publicitaria. En Mexico, el IIF-UNAM (Instituto de Investigaciones Filosoficas) es uno de los centros de logica y filosofia analitica mas importantes del mundo hispanohablante.",
      "sections": [
        {
          "subtitle": "Estructura del argumento",
          "content": "Un argumento es un conjunto de proposiciones donde algunas (las premisas) ofrecen razones para creer en otra (la conclusion). Argumento valido: la conclusion se sigue necesariamente de las premisas, sin importar si estas son verdaderas o falsas. Argumento solido: valido + premisas verdaderas. Ejemplo invalido pero con premisas verdaderas: Todos los gatos son animales (V); Todos los perros son animales (V); por lo tanto todos los perros son gatos (C) = invalido porque la conclusion no se sigue de las premisas. Ejemplo valido pero no solido: Todos los mexicanos comen chile (falsa); Juan es mexicano (V); por lo tanto Juan come chile (C) = valido (forma correcta) pero no solido (premisa 1 es falsa)."
        },
        {
          "subtitle": "Razonamiento deductivo vs inductivo",
          "content": "Deductivo: va de lo general a lo particular; si las premisas son verdaderas y el argumento es valido, la conclusion es necesariamente verdadera. El silogismo aristotelico es la forma mas clasica. Inductivo: va de lo particular a lo general; no garantiza la conclusion, solo la hace probable. Ejemplo: en las ultimas 100 encuestas en Mexico, el 68% prefiere el tacos de canasta; probablemente la mayoria de los mexicanos prefiere los tacos de canasta. La induccion bien realizada requiere muestra representativa, suficiente y aleatoria (principio estadistico del INEGI en sus encuestas). El problema de la induccion (Hume): ningun numero de observaciones particulares puede garantizar con certeza una conclusion universal."
        },
        {
          "subtitle": "Las 8 falacias logicas mas frecuentes en Mexico",
          "content": "1. Ad hominem: atacar a la persona en lugar de su argumento. 2. Hombre de paja: distorsionar la posicion del oponente para atacarla mas facilmente. 3. Pendiente resbaladiza: afirmar que X inevitablemente llevara a consecuencias terribles sin evidencia. 4. Apelacion a la autoridad: usar la opinion de un experto como evidencia sin evaluar si es pertinente. 5. Generalizacion apresurada: concluir sobre toda una clase a partir de pocos casos. 6. Falsa dicotomia: presentar solo dos opciones cuando hay mas. 7. Apelacion a la emocion: sustituir el argumento por llamadas al miedo, el orgullo o la lastima. 8. Circularidad (peticion de principio): usar la conclusion como premisa."
        },
        {
          "subtitle": "Logica y democracia en Mexico",
          "content": "La capacidad de evaluar argumentos y detectar falacias es una competencia ciudadana critica en la era de las redes sociales y la infodemia. En Mexico, donde las campanas electorales recurren frecuentemente a falacias de apelacion a la emocion, ad hominem y pendiente resbaladiza, un electorado critico es la mejor defensa contra la manipulacion. El IIF-UNAM ha publicado el diccionario de falacias en linea y organiza talleres de logica informal para ciudadanos. La revista Nexos y el sitio Animal Politico realizan fact-checking de discursos publicos usando criterios logicos."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "Un argumento es VALIDO cuando:",
          "options": ["La conclusion se sigue necesariamente de las premisas (independientemente de si son verdaderas)", "Todas las premisas son verdaderas", "La conclusion es verdadera", "El argumento convence a la mayoria de las personas"],
          "correct": "La conclusion se sigue necesariamente de las premisas (independientemente de si son verdaderas)"
        },
        {
          "question": "El razonamiento inductivo va de:",
          "options": ["Lo particular a lo general; no garantiza la conclusion, solo la hace probable", "Lo general a lo particular; garantiza la conclusion si las premisas son verdaderas", "Lo absurdo a lo concreto", "Lo emocional a lo racional"],
          "correct": "Lo particular a lo general; no garantiza la conclusion, solo la hace probable"
        },
        {
          "question": "El politico dice: si aprobamos esa ley, en 10 anios Mexico sera una dictadura. Esta falacia se llama:",
          "options": ["Pendiente resbaladiza", "Ad hominem", "Apelacion a la autoridad", "Hombre de paja"],
          "correct": "Pendiente resbaladiza"
        },
        {
          "question": "Un argumento SOLIDO es:",
          "options": ["Valido (forma correcta) y sus premisas son todas verdaderas", "Solo tiene premisas verdaderas sin importar la forma", "Convence al mayor numero de personas", "Usa lenguaje tecnico y academico"],
          "correct": "Valido (forma correcta) y sus premisas son todas verdaderas"
        }
      ],
      "rubric": "Nivel 4: Distingue con precision argumento/opinion, validez/solidez, deduccion/induccion; identifica correctamente las 8 falacias con ejemplos mexicanos reales; construye un argumento solido de 3 premisas sobre un tema social; Nivel 3: Distingue los conceptos principales y nombra correctamente al menos 5 falacias con ejemplos; el argumento construido es valido aunque puede tener una premisa debil; Nivel 2: Distingue argumento de opinion y nombra algunas falacias pero confunde validez con solidez; el argumento construido tiene errores de estructura; Nivel 1: No puede distinguir argumento de opinion o no identifica falacias en los textos proporcionados."
    },
    "teacher_tips": [
      "Usar discursos politicos reales (recientes, de personalidades conocidas por los estudiantes) hace el ejercicio de identificacion de falacias inmediatamente relevante y motivador; no usar ejemplos inventados.",
      "El IIF-UNAM tiene materiales de logica informal disponibles en linea; el diccionario de falacias es excelente como referencia rapida para el salon.",
      "Para el ejercicio de construccion de argumentos, pedir que los estudiantes intercambien y evaluen el argumento del companero antes de la revision docente; la evaluacion entre pares desarrolla habilidades de analisis critico en ambos roles.",
      "Conexion con LC-III: la resena critica requiere juicios argumentados; la progresion de logica de PFH-III deberia retroalimentar directamente la calidad argumentativa de las resenas escritas en LC-III."
    ]
  },

  "PFH-III-P02": {
    "code": "PFH-III-P02",
    "title": "Analiza conceptos de la filosofia politica: poder, Estado y derechos en el Mexico contemporaneo",
    "level": "Pensamiento Filosofico y Humanistico III",
    "duration": "~4h (3 sesiones de 50 min)",
    "difficulty": "Intermedio",
    "category": "Filosofia politica",
    "metadata": {
      "objective": "Analizar los conceptos fundamentales de la filosofia politica (poder, Estado, soberania, contrato social, derechos) a traves de los principales autores de la tradicion (Platon, Hobbes, Locke, Rousseau, Marx) y su relevancia para entender la estructura politica y los derechos constitucionales en Mexico.",
      "competencies": [
        "Describe la concepcion del Estado y el poder en Platon (Republica: el filosofo-rey), Hobbes (Leviatan: contrato por miedo), Locke (estado natural benigno, derechos naturales), Rousseau (voluntad general, soberania popular)",
        "Contrasta la legitimidad politica en diferentes concepciones: por virtud, por fuerza, por consentimiento, por justicia social",
        "Relaciona el contrato social de Rousseau con la Constitucion de 1917 como pacto social mexicano fundacional",
        "Analiza el concepto marxista de Estado como instrumento de clase y relaciona con las criticas a la desigualdad en Mexico",
        "Identifica los derechos constitucionales fundamentales de los mexicanos (Art. 1, 3, 4, 27, 123 CPEUM) y los mecanismos de defensa (CNDH, SCJN)"
      ],
      "materials": [
        "Fragmentos: Republica de Platon (el mito de la caverna); Leviatan de Hobbes (cap. 13-14); Segundo Tratado de Gobierno de Locke (cap. 2); El Contrato Social de Rousseau (Libro I, cap. 6)",
        "Articulos 1, 3, 4, 27 y 123 de la Constitucion Politica de los Estados Unidos Mexicanos (CPEUM 1917)",
        "Ficha comparativa: 4 concepciones del contrato social y su relacion con Mexico",
        "Infografia: Derechos humanos y mecanismos de defensa en Mexico (CNDH, SCJN, CIDH)",
        "Caso de estudio: una queja ante la CNDH y como se tramita"
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "S1", "duration": "50 min", "label": "Platon y Hobbes: poder, miedo y la naturaleza del Estado"},
        {"phase": "S2", "duration": "50 min", "label": "Locke y Rousseau: derechos naturales, contrato y soberania popular"},
        {"phase": "S3", "duration": "50 min", "label": "Marx, la CPEUM 1917 y los derechos de los mexicanos hoy"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "10 min",
          "description": "Activar la pregunta fundamental de la filosofia politica: por que debo obedecer al Estado?",
          "activity": "El docente pregunta: por que pagan impuestos sus familias? Por que respetan los semaforos cuando no hay policia? Por que el gobierno tiene el derecho de dictar leyes? La respuesta a estas preguntas es el tema de la filosofia politica. Introduccion: los cuatro autores que estudiaremos dieron respuestas muy diferentes."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "30 min",
          "description": "Tres sesiones: S1 Platon/Hobbes, S2 Locke/Rousseau, S3 Marx/Constitucion mexicana.",
          "activity": "S1: Platon (Republica): el Estado ideal es gobernado por filosofos-reyes que conocen el Bien; la democracia es peligrosa porque los ignorantes votan. El mito de la caverna como metafora de la iluminacion politica. Hobbes (Leviatan, 1651): sin Estado, la vida humana es solitaria, pobre, sucia, brutal y corta; los humanos ceden su libertad al soberano a cambio de seguridad; el poder del Estado es absoluto. S2: Locke (Segundo Tratado, 1689): el estado natural es pacifico; los humanos tienen derechos naturales inalienables (vida, libertad, propiedad); el gobierno existe para protegerlos y puede ser derrocado si los viola. Rousseau (Contrato Social, 1762): la voluntad general (bien comun) es soberana; la sociedad puede organizarse democraticamente si todos ceden su voluntad particular a la general. S3: Marx: el Estado no es neutral; es el instrumento de la clase dominante para perpetuar su poder economico. Conexion con Mexico: la Constitucion de 1917 (producto de la Revolucion Mexicana) es uno de los primeros documentos constitucionales del mundo en incluir derechos sociales (art. 3 educacion gratuita, art. 27 reforma agraria, art. 123 derechos laborales). Los mecanismos de defensa: CNDH (quejas por violacion a derechos humanos), SCJN (amparo constitucional), CIDH (sistema interamericano)."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "10 min",
          "description": "Sintesis: cual concepcion del Estado se acerca mas a la realidad de Mexico?",
          "activity": "Debate corto: en equipos, cada uno defiende la concepcion de un autor: cual explica mejor el Estado mexicano actual? La clase vota por la mas convincente y justifica. El docente introduce la idea de que las concepciones no son mutuamente excluyentes: Mexico tiene elementos hobbesianos (monopolio de la fuerza), lockeanos (derechos individuales), rousseaunianos (soberania popular en la Constitucion) y marxianos (desigualdad y critica al poder economico)."
        }
      ]
    },
    "theory": {
      "introduction": "La filosofia politica pregunta por la naturaleza, los fundamentos y los limites del poder politico: por que existe el Estado, quien tiene autoridad legitima para gobernary en que condiciones es justo obedecer o resistir al gobierno. Estas preguntas no son solo academicas: Mexico es una republica representativa, democratica, federal y laica segun el articulo 40 de su Constitucion. Entender las tradiciones del pensamiento politico que nutren esa Constitucion es entender los cimientos filosoficos de la vida politica mexicana.",
      "sections": [
        {
          "subtitle": "Platon y el Estado ideal",
          "content": "En la Republica (aprox 380 a.C.), Platon propone que el Estado ideal tiene tres clases: gobernantes (filosofos, que conocen el Bien), guardianes (soldados, que obedecen) y productores (artesanos y campesinos). La justicia es que cada clase haga lo que le corresponde segun su naturaleza. El filosofo-rey, que ha salido de la caverna de la ignorancia y contemplado las Ideas (especialmente la del Bien), tiene el derecho y la obligacion de gobernar. Platon critica la democracia como gobierno de la ignorancia: los votantes sin educacion son manipulables. Su vision es aristocratica e intelectualista."
        },
        {
          "subtitle": "Hobbes y el Leviatan",
          "content": "Thomas Hobbes (1588-1679) escribe el Leviatan (1651) en el contexto de la guerra civil inglesa. Su punto de partida: en el estado de naturaleza (sin gobierno), hay una guerra de todos contra todos (bellum omnium contra omnes). La vida en ese estado es solitaria, pobre, sucia, brutal y corta. Para escapar de esta situacion, los individuos celebran un contrato social: ceden todos sus derechos y libertades al soberano (el Leviatan), quien a cambio garantiza la paz y la seguridad. El poder del soberano es absoluto e irrevocable. Critica: no hay limite al poder del Estado; la obediencia es total."
        },
        {
          "subtitle": "Locke: derechos naturales y gobierno limitado",
          "content": "John Locke (1632-1704) en su Segundo Tratado del Gobierno Civil (1689) plantea una vision radicalmente diferente: el estado de naturaleza es pacífico; los humanos tienen derechos naturales inalienables: la vida, la libertad y la propiedad. El gobierno surge del consentimiento de los gobernados para proteger estos derechos. Si el gobierno los viola, el pueblo tiene derecho a la resistencia y a la revolucion. Locke es el padre del liberalismo politico y tuvo influencia directa en la Declaracion de Independencia de EUA (1776). En Mexico, el art. 1 de la CPEUM (que reconoce los derechos humanos como inalienables) tiene resonancias lockeanas."
        },
        {
          "subtitle": "Rousseau, Marx y la Constitucion de 1917",
          "content": "Rousseau (1712-1778): la voluntad general (lo que todos queremos en tanto ciudadanos, no lo que cada uno quiere en tanto individuo) es la base del pacto social legitimo. El contrato social consiste en que cada individuo se somete a la voluntad general, que el contribuye a crear. La soberania reside en el pueblo. Marx (1818-1883): el Estado no es neutral; es el instrumento de la clase dominante para perpetuar las relaciones de produccion capitalistas. El Estado burgues protege la propiedad privada y la explotacion del trabajo. La emancipacion requiere la abolicion del Estado de clase. La Constitucion de 1917 (producto de la Revolucion Mexicana) incorporo elementos rousseaunianos (soberania popular, sufragio universal) y elementos marxianos avant la lettre: art. 27 (propiedad de la nacion sobre tierra y recursos naturales, reforma agraria), art. 123 (derechos laborales, jornada de 8 horas, salario minimo, huelga). Fue la primera Constitucion del mundo en incluir derechos sociales."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "Segun Hobbes, el contrato social existe porque sin Estado:",
          "options": ["La vida humana es solitaria, pobre, brutal y corta (guerra de todos contra todos)", "Los humanos son naturalmente buenos y cooperativos pero necesitan organizacion", "Los filosofos-reyes deben gobernar para garantizar la justicia", "La voluntad general no puede expresarse sin una institucion formal"],
          "correct": "La vida humana es solitaria, pobre, brutal y corta (guerra de todos contra todos)"
        },
        {
          "question": "John Locke planteo que si el gobierno viola los derechos naturales de los ciudadanos:",
          "options": ["El pueblo tiene derecho a la resistencia y a la revolucion", "El pueblo debe obedecer absolutamente al soberano", "Solo el filosofo-rey puede juzgar si los derechos fueron violados", "El contrato social es irrevocable y el pueblo debe aceptar al gobierno"],
          "correct": "El pueblo tiene derecho a la resistencia y a la revolucion"
        },
        {
          "question": "La Constitucion Politica de Mexico de 1917 fue pionera porque:",
          "options": ["Fue la primera Constitucion del mundo en incluir derechos sociales (educacion, trabajo, tierra)", "Fue la primera Constitucion del mundo en reconocer el sufragio universal", "Fue la primera Constitucion del mundo en separar Iglesia y Estado", "Fue la primera Constitucion del mundo en abolir la pena de muerte"],
          "correct": "Fue la primera Constitucion del mundo en incluir derechos sociales (educacion, trabajo, tierra)"
        },
        {
          "question": "Para Marx, el Estado es:",
          "options": ["El instrumento de la clase dominante para perpetuar las relaciones de produccion capitalistas", "Una instancia neutral que arbitra entre los intereses de las distintas clases sociales", "La expresion de la voluntad general de todos los ciudadanos sin distincion de clase", "Una necesidad biologica basada en el instinto gregario humano"],
          "correct": "El instrumento de la clase dominante para perpetuar las relaciones de produccion capitalistas"
        }
      ],
      "rubric": "Nivel 4: Describe con precision las cuatro concepciones del contrato social, contrasta sus concepciones de legitimidad politica, conecta la CPEUM 1917 con las tradiciones filosoficas que la nutren e identifica los derechos constitucionales y sus mecanismos de defensa; Nivel 3: Describe correctamente las cuatro concepciones y conecta al menos dos con la realidad politica de Mexico; Nivel 2: Conoce las concepciones principales (Hobbes, Rousseau) pero tiene dificultad con las mas sutiles (Platon, Marx) o no conecta con Mexico; Nivel 1: No puede distinguir las cuatro concepciones o confunde los autores entre si."
    },
    "teacher_tips": [
      "El mito de la caverna de Platon puede presentarse con la version animada que existe en YouTube (varios canales de filosofia en espanol la tienen en 5 minutos); es mucho mas efectivo que solo leerlo.",
      "Para la conexion con Mexico, traer al salon la CPEUM impresa o acceder a ella en linea (ordenjuridico.gob.mx); leer en voz alta los articulos 1, 3, 27 y 123 e identificar que filosofo politico podria haber escrito cada uno.",
      "El debate final sobre cual concepcion explica mejor el Estado mexicano actual es altamente motivador y genera pensamiento politico critico; mantener el debate en el plano filosofico, no en el de la coyuntura electoral.",
      "Conexion con CS-III: el ciclo de politicas publicas analizado en Ciencias Sociales supone una teoria del Estado (quien decide, con que legitimidad, para quien); conectar explicitamente ambas asignaturas enriquece la comprension de ambas."
    ]
  },

  "PFH-III-P03": {
    "code": "PFH-III-P03",
    "title": "Reflexiona sobre la estetica como disciplina filosofica al analizar el arte mexicano",
    "level": "Pensamiento Filosofico y Humanistico III",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Intermedio",
    "category": "Estetica",
    "metadata": {
      "objective": "Analizar las preguntas fundamentales de la estetica filosofica (que es la belleza, que es el arte, que es el juicio estetico) a traves de las posiciones de Platon, Kant y Benjamin, aplicando estos marcos al analisis del muralismo mexicano y el arte contemporaneo mexicano.",
      "competencies": [
        "Define estetica como disciplina filosofica y la distingue de la historia del arte y la critica de arte",
        "Describe la concepcion de la belleza en Platon (imitacion del mundo de las ideas), Kant (juicio de gusto universal sin concepto) y Benjamin (aura y reproduccion tecnica)",
        "Aplica los marcos esteticos al muralismo mexicano: Diego Rivera, Jose Clemente Orozco, David Alfaro Siqueiros como arte politico",
        "Reflexiona sobre si el arte tiene una funcion social o si es autonomo (arte por el arte vs arte comprometido)",
        "Analiza una obra de arte mexicano contemporaneo usando al menos dos criterios esteticos"
      ],
      "materials": [
        "Reproducciones de murales: La historia de Mexico de Diego Rivera (Palacio Nacional); El hombre en llamas de Orozco (Hospicio Cabanas, Patrimonio UNESCO); Siqueiros en el Palacio de Bellas Artes",
        "Fragmentos: Ion de Platon (el artista como poseido por la Musa); Critica del Juicio de Kant (seccion 1, el juicio de gusto); La obra de arte en la epoca de su reproductibilidad tecnica de Walter Benjamin (1936)",
        "Fotografias de arte contemporaneo mexicano (Gabriel Orozco, Francis Alys, Teresa Margolles)",
        "Ficha comparativa: Platon vs Kant vs Benjamin sobre la belleza y el arte",
        "Cronologia del muralismo mexicano (1921-1955) y su contexto politico (SEP, FONCA, Secretaria de Cultura)"
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "S1", "duration": "50 min", "label": "Estetica filosofica: Platon, Kant y Benjamin sobre el arte"},
        {"phase": "S2", "duration": "50 min", "label": "El muralismo mexicano y el arte contemporaneo: analisis estetico"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "10 min",
          "description": "Activar el debate sobre la naturaleza del arte y la belleza con preguntas provocadoras.",
          "activity": "El docente muestra tres imagenes sin decir nada: un mural de Rivera (Palacio Nacional), una obra de Francis Alys, un graffiti anonimo de CDMX. Pregunta: cual de estos tres es arte? quien decide? la belleza es objetiva o subjetiva? Estas preguntas son el corazon de la estetica filosofica."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "30 min",
          "description": "S1: tres posiciones filosoficas sobre la belleza y el arte. S2: aplicacion al muralismo y arte contemporaneo.",
          "activity": "S1: Platon (Ion, Republica): el artista imita el mundo sensible, que a su vez imita las Ideas; el arte es una imitacion de imitacion, alejada de la verdad. Por eso expulsa a los poetas de la Republica ideal: el arte apela a las emociones, no a la razon. Kant (Critica del Juicio, 1790): el juicio estetico (esto es bello) no es objetivo (como un juicio de conocimiento) ni subjetivo (como un juicio de gusto personal); es un juicio de gusto que reclama validez universal sin concepto. La belleza produce un placer desinteresado. Benjamin (1936): el aura de la obra de arte (su unicidad, su presencia en un lugar y tiempo) desaparece con la reproduccion tecnica (fotografia, cine). El arte pierde autenticidad pero gana alcance politico. S2: El muralismo mexicano (1921-1955) fue un proyecto artistico-politico patrocinado por la SEP bajo Jose Vasconcelos: Rivera, Orozco y Siqueiros pintaron la historia y los conflictos de Mexico en edificios publicos. Es arte comprometido socialmente. Analisis estetico: segun Platon, son estas obras buenas arte? segun Kant, pueden ser bellas? segun Benjamin, el mural en el edificio publico tiene aura que una fotografia no tiene?"
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "10 min",
          "description": "Debate final: puede el arte ser politico y artisticamente valioso a la vez?",
          "activity": "El docente presenta la tension: arte autonomo (Kant: el arte no tiene funcion sino la de producir placer estetico desinteresado) vs arte comprometido (Benjamin, Rivera: el arte tiene funcion social y politica). Los estudiantes toman posicion y la justifican filosoficamente. Conexion con el FONCA (Fondo Nacional para la Cultura y las Artes) y la Secretaria de Cultura: el Estado mexicano financia el arte, lo que implica una posicion sobre la relacion entre arte y sociedad."
        }
      ]
    },
    "theory": {
      "introduction": "La estetica es la rama de la filosofia que estudia la experiencia estetica: que es la belleza, que es el arte, como funciona el juicio estetico y cual es la relacion entre el arte y la sociedad. No debe confundirse con la historia del arte (que estudia las obras y sus contextos historicos) ni con la critica de arte (que evalua obras especificas). La estetica filosofica pregunta por las condiciones de posibilidad del fenomeno artistico en general. En Mexico, el muralismo de la primera mitad del siglo XX es uno de los fenomenos artisticos mas filosoficamente ricos: vincula arte, historia, politica e identidad nacional.",
      "sections": [
        {
          "subtitle": "Platon y la desconfianza al arte",
          "content": "En la Republica, Platon argumenta que el arte es una imitacion (mimesis) del mundo sensible, que a su vez es solo una sombra del mundo de las Ideas. La pintura de una cama es una imitacion de la cama real, que a su vez imita la Idea de cama: el artista esta dos niveles alejado de la verdad. Ademas, el arte apela a las emociones del alma inferior y puede corromper la parte racional del alma. Por eso Platon propone que los poetas deben ser expulsados del Estado ideal (excepto los que produzcan himnos a los dioses). Su estetica es radicalmente intelectualista y desconfia de la emocion estetica."
        },
        {
          "subtitle": "Kant y el juicio estetico",
          "content": "Kant en la Critica del Juicio (1790) distingue tres tipos de juicio: cognitivo (el cielo es azul -- objetivo), de gusto personal (el chocolate me gusta -- subjetivo) y estetico (esta rosa es bella -- que reclama universalidad sin concepto). El juicio estetico es desinteresado (no tiene funcion ni busca satisfacer un deseo), libre (no sigue reglas), singular (juzgo esta obra) y sin embargo reclama acuerdo de todos. La belleza produce un placer libre que Kant llama libre juego de la imaginacion y el entendimiento. Para Kant, la belleza natural es mas autentica que la belleza artistica (que puede engañar); pero el arte del genio puede crear una segunda naturaleza."
        },
        {
          "subtitle": "Benjamin y el aura del arte",
          "content": "Walter Benjamin en La obra de arte en la epoca de su reproductibilidad tecnica (1936) introduce el concepto de aura: la unicidad y la presencia de la obra de arte en un lugar y tiempo determinados; el hic et nunc (aqui y ahora) que hace que el original sea diferente de cualquier reproduccion. La fotografia y el cine destruyen el aura porque la obra puede reproducirse infinitamente. Pero para Benjamin esto no es necesariamente negativo: el arte reproducible pierde autenticidad pero gana funcion politica. El cine puede ser la base de un arte verdaderamente politico y democratico. Esta tension entre autenticidad y alcance es fundamental en la era de internet."
        },
        {
          "subtitle": "El muralismo mexicano: arte politico y estetica",
          "content": "El muralismo mexicano (1921-1955) fue encargado por el Estado mexicano (SEP bajo Vasconcelos) y ejecutado principalmente por Diego Rivera, Jose Clemente Orozco y David Alfaro Siqueiros. Rivera (Guanajuato, 1886-1957): sus murales en el Palacio Nacional narran la historia de Mexico desde las civilizaciones prehispanicas hasta el presente; es arte marxista y didactico. Orozco (Jalisco, 1883-1949): su Hombre en llamas en el Hospicio Cabanas (Guadalajara, Patrimonio UNESCO) es una vision apocaliptica y critica, menos optimista que Rivera. Siqueiros (Chihuahua, 1896-1974): el mas militante politicamente; experimento con materiales industriales (piroxilina) y perspectivas dinamicas. El muralismo plantea la pregunta filosofica: puede el arte comprometido ser esteticamene valioso? o el compromiso politico limita la libertad artistica?"
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "Para Platon, el arte es filosoficamente problematico porque:",
          "options": ["Es una imitacion de imitacion que aleja al espectador de la verdad y apela a las emociones en lugar de la razon", "No tiene ninguna funcion en la sociedad ideal", "Es demasiado subjetivo para ser comprendido por todos", "Solo produce placer desinteresado sin ningun contenido de verdad"],
          "correct": "Es una imitacion de imitacion que aleja al espectador de la verdad y apela a las emociones en lugar de la razon"
        },
        {
          "question": "El juicio estetico de Kant es diferente al juicio de gusto personal porque:",
          "options": ["El juicio estetico reclama validez universal aunque no tenga concepto; el de gusto es solo subjetivo", "El juicio estetico es mas subjetivo que el de gusto personal", "El juicio estetico solo aplica a la naturaleza y no al arte", "Son practicamente identicos pero el estetico usa lenguaje tecnico"],
          "correct": "El juicio estetico reclama validez universal aunque no tenga concepto; el de gusto es solo subjetivo"
        },
        {
          "question": "El concepto de AURA en Walter Benjamin se refiere a:",
          "options": ["La unicidad y presencia irrepetible de la obra de arte en un lugar y tiempo determinados", "La influencia politica que el artista ejerce sobre el espectador", "La calidad tecnica superior de las obras originales frente a las copias", "El efecto emocional que produce el arte en el espectador"],
          "correct": "La unicidad y presencia irrepetible de la obra de arte en un lugar y tiempo determinados"
        },
        {
          "question": "El muralismo mexicano de Rivera, Orozco y Siqueiros fue financiado originalmente por:",
          "options": ["La SEP bajo Jose Vasconcelos como proyecto cultural-politico nacional", "El Banco de Mexico como inversion en patrimonio cultural", "La UNAM como proyecto de arte universitario autonomo", "El FONCA como programa de becas artisticas independientes"],
          "correct": "La SEP bajo Jose Vasconcelos como proyecto cultural-politico nacional"
        }
      ],
      "rubric": "Nivel 4: Describe con precision las tres concepciones filosoficas de la belleza y el arte, las aplica con coherencia al analisis del muralismo mexicano y el arte contemporaneo, y toma una posicion fundamentada sobre la relacion entre arte y funcion social; Nivel 3: Describe correctamente las tres concepciones y aplica al menos dos al muralismo; Nivel 2: Conoce las concepciones pero tiene dificultad para aplicarlas al analisis de obras concretas; Nivel 1: Confunde estetica filosofica con historia o critica del arte, o no puede describir las posiciones de los autores."
    },
    "teacher_tips": [
      "Las reproducciones de los murales de Rivera, Orozco y Siqueiros en alta resolucion estan disponibles en el sitio del INBA (inba.gob.mx) y en Google Arts and Culture; usar el proyector para una visita virtual al Hospicio Cabanas o al Palacio Nacional.",
      "El concepto de aura de Benjamin se ilustra perfectamente con la pregunta: es lo mismo ver el Mural de Diego Rivera en el Palacio Nacional en persona que verlo en una pantalla? Por que si o por que no? La discusion suele ser muy rica.",
      "Para el arte contemporaneo, Teresa Margolles es una artista mexicana internacionalmente reconocida cuya obra cuestiona la violencia y la muerte en Mexico: sus piezas estan en museos internacionales y generan debate sobre los limites del arte, su funcion social y su etica.",
      "Conexion con LC-III: la lectura de poemas (P05 de LC-III) es tambien una experiencia estetica; los criterios de analisis estetico de PFH-III pueden aplicarse retrospectivamente a los poemas estudiados, enriqueciendo ambas asignaturas."
    ]
  },

  "PFH-III-P04": {
    "code": "PFH-III-P04",
    "title": "Disena y ejecuta una propuesta de praxis filosofica transformadora en el entorno local",
    "level": "Pensamiento Filosofico y Humanistico III",
    "duration": "~4h (3 sesiones de 50 min)",
    "difficulty": "Intermedio-Alto",
    "category": "Proyecto integrador de filosofia practica",
    "metadata": {
      "objective": "Integrar los conceptos y metodos estudiados en el semestre (logica, filosofia politica, estetica) en un proyecto de praxis filosofica que analice un problema real de la comunidad, lo conceptualice con herramientas filosoficas y proponga una accion transformadora fundamentada.",
      "competencies": [
        "Aplica el concepto marxista-freiriano de praxis: la unidad entre la teoria (reflexion critica) y la practica (accion transformadora)",
        "Usa herramientas de logica (argumento solido), filosofia politica (derechos, legitimidad) y estetica (funcion del arte) para analizar un problema comunitario",
        "Investiga una experiencia de filosofia comunitaria en Mexico: la comunalidad oaxaquena (Floriberto Diaz), la filosofia de la liberacion (Enrique Dussel), o los cafes filosoficos urbanos",
        "Disena una propuesta de intervencion filosofica: dialogo filosofico en la comunidad, muralito escolar, exposicion de argumentos sobre un problema local",
        "Presenta y defiende la propuesta ante la comunidad escolar con argumentacion fundamentada y apertura al debate"
      ],
      "materials": [
        "Fragmento: Pedagogia del oprimido de Paulo Freire (cap. 2): la conciencia critica como primer paso de la transformacion",
        "Ficha: La comunalidad oaxaquena de Floriberto Diaz: filosofia indigena como praxis comunitaria",
        "Ejemplo de cafe filosofico: el Cafe Filosofico de la UNAM como modelo de filosofia fuera del aula",
        "Formato de proyecto de praxis filosofica: problema + marco conceptual + propuesta de accion + evaluacion",
        "Rubrica de proyecto integrador de filosofia"
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "S1", "duration": "50 min", "label": "Praxis filosofica: de la teoria a la accion transformadora"},
        {"phase": "S2", "duration": "50 min", "label": "Diseno del proyecto de intervencion filosofica"},
        {"phase": "S3", "duration": "50 min", "label": "Presentacion y defensa de proyectos"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "10 min",
          "description": "Motivar la pregunta: para que sirve la filosofia si no cambia nada?",
          "activity": "El docente presenta la critica de Marx a Hegel: los filosofos solo han interpretado el mundo de diferentes maneras; de lo que se trata es de transformarlo (Tesis sobre Feuerbach, 11a tesis, 1845). Pregunta: puede la filosofia transformar la realidad? Como? Los estudiantes dan ejemplos de ideas que cambiaron el mundo: los Derechos del Hombre (Ilustracion), el marxismo, el feminismo. Introduccion: el proyecto final es disenar una praxis filosofica propia."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "30 min",
          "description": "S1: concepto de praxis y experiencias de filosofia comunitaria. S2: diseno del proyecto. S3: presentaciones.",
          "activity": "S1: Praxis (Marx/Freire): la unidad inseparable de la reflexion critica y la accion transformadora. Paulo Freire (1921-1997): en la Pedagogia del oprimido propone que la educacion liberadora parte de la realidad del educando, no de contenidos impuestos. La conciencia critica (conscientizacao) es el primer paso de la transformacion. Filosofia de la liberacion (Enrique Dussel, IIF-UNAM): filosofia que parte de los excluidos y las victimas del sistema; critica al colonialismo filosofico. Comunalidad oaxaquena (Floriberto Diaz, zapoteco, 1947-1995): la comunalidad como modo de ser indigena: la tierra como madre, el trabajo comunal, la fiesta como expresion colectiva; es una filosofia practica que se vive, no solo se piensa. S2: En equipos, los estudiantes eligen un problema de su comunidad (violencia, falta de espacios publicos, contaminacion, discriminacion) y disenan una intervencion filosofica: que herramientas conceptuales usaran? que accion proponen? (dialogo filosofico con vecinos, mural argumentativo, exposicion de derechos, cafe filosofico escolar). S3: Cada equipo presenta su proyecto en 5 minutos + 3 minutos de preguntas."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "10 min",
          "description": "Reflexion final sobre el semestre y la utilidad de la filosofia.",
          "activity": "El docente pide a los estudiantes que completen: la filosofia me ha servido para... / Una pregunta filosofica que seguire pensando es... / Un concepto que voy a usar en mi vida es... Cierre: la filosofia no da respuestas definitivas, pero hace mejores las preguntas."
        }
      ]
    },
    "theory": {
      "introduction": "La praxis es un concepto central en la tradicion filosofica que va de Aristoteles a Marx y Freire: la unidad entre el pensamiento (theoria) y la accion (praxis), donde la reflexion guia la accion y la accion transforma y enriquece la reflexion. En la tradicion mexicana, este concepto ha sido desarrollado de formas diversas: la filosofia de la liberacion (Dussel, Zea), la pedagogia critica freiriana en educacion popular, y las filosofias indigenas como la comunalidad oaxaquena. El proyecto final de este semestre invita a los estudiantes a disenar su propia praxis filosofica.",
      "sections": [
        {
          "subtitle": "Marx y la 11a Tesis sobre Feuerbach",
          "content": "La famosa 11a tesis de Marx sobre Feuerbach (1845) dice: los filosofos solo han interpretado el mundo de diferentes maneras; de lo que se trata es de transformarlo. Esta frase sintetiza el giro de la filosofia especulativa (contemplativa) a la filosofia practica (transformadora). La praxis marxista implica que la teoria sin practica es ideologia (justificacion del statu quo) y que la practica sin teoria es voluntarismo ciego (actuar sin comprender). Solo la praxis -- teoria y practica en unidad dialectica -- puede transformar el mundo."
        },
        {
          "subtitle": "Paulo Freire y la pedagogia critica",
          "content": "Paulo Freire (Pernambuco, Brasil, 1921-1997) es el pedagogo latinoamericano mas influyente del siglo XX. En la Pedagogia del oprimido (1968) critica la educacion bancaria (el docente deposita informacion en el estudiante pasivo) y propone la educacion liberadora (el dialogo entre docente y estudiante sobre la realidad comun como punto de partida). El concepto central es la conscientizacao (concientizacion): el proceso por el cual las personas toman conciencia critica de su situacion y de las estructuras de poder que la producen; esta conciencia es el primer paso hacia la transformacion. Freire fue exiliado, perseguido y posteriormente reconocido como uno de los grandes educadores del mundo."
        },
        {
          "subtitle": "Filosofia de la liberacion: Enrique Dussel y Leopoldo Zea",
          "content": "La filosofia de la liberacion es una corriente latinoamericana que surge en los anios 1970 como respuesta critica al colonialismo intelectual: la filosofia occidental (europea y norteamericana) ha pretendido ser universal pero en realidad habla desde la perspectiva del centro hegemonico. Enrique Dussel (Mendoza, Argentina, 1934; residente en Mexico, IIF-UNAM desde 1975): propone una filosofia que parte de las victimas, los excluidos, los pobres: la exterioridad como punto de partida etico-politico. Leopoldo Zea (CDMX, 1912-2004): filosofo de la historia latinoamericana; propuso que America Latina debe pensar desde su propia historia, no desde la imposicion de categorias europeas."
        },
        {
          "subtitle": "Comunalidad oaxaquena: filosofia indigena como praxis",
          "content": "Floriberto Diaz (Tlahuitoltepec, Oaxaca, 1947-1995) fue un intelectual zapoteco que conceptualizo la comunalidad como el modo de ser de los pueblos indigenas de la Sierra Norte de Oaxaca: la tierra como madre y no como propiedad; el trabajo comunal (tequio) como obligacion y gozo colectivo; la fiesta como forma de reproduccion de la comunidad; el poder como servicio (cargo) y no como dominio. La comunalidad no es solo una forma de organizacion social sino una filosofia completa: una ontologia (modo de ser), una etica (modo de actuar) y una politica (modo de gobernar) que emerge de la practica comunitaria, no de libros ni universidades. Es filosofia como praxis en su forma mas radical."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "La 11a tesis de Marx sobre Feuerbach plantea que:",
          "options": ["Los filosofos solo han interpretado el mundo; de lo que se trata es de transformarlo (praxis)", "La filosofia debe mantenerse neutral y no involucrarse en la politica", "La teoria es mas importante que la practica en el pensamiento critico", "El conocimiento filosofico es siempre superior al conocimiento empirico"],
          "correct": "Los filosofos solo han interpretado el mundo; de lo que se trata es de transformarlo (praxis)"
        },
        {
          "question": "El concepto de conscientizacao de Paulo Freire se refiere a:",
          "options": ["El proceso de tomar conciencia critica de la propia situacion y de las estructuras de poder que la producen", "La memorizacion de contenidos filosoficos como primer paso del aprendizaje", "La conciencia individual separada de cualquier contexto social", "La obediencia critica a las autoridades educativas"],
          "correct": "El proceso de tomar conciencia critica de la propia situacion y de las estructuras de poder que la producen"
        },
        {
          "question": "La comunalidad oaxaquena de Floriberto Diaz es una filosofia que:",
          "options": ["Parte de la practica comunitaria indigena (tierra, tequio, fiesta, cargo) como modo de ser y saber", "Adapta la filosofia occidental al contexto oaxaqueno", "Propone la separacion de la filosofia de la vida cotidiana", "Critica las tradiciones indigenas desde perspectivas ilustradas"],
          "correct": "Parte de la practica comunitaria indigena (tierra, tequio, fiesta, cargo) como modo de ser y saber"
        },
        {
          "question": "La filosofia de la liberacion de Enrique Dussel parte de:",
          "options": ["Las victimas, los excluidos y los pobres como punto de partida etico-politico (exterioridad)", "La tradicion filosofica griega como fundamento universal del pensamiento", "La critica interna a la filosofia europea desde sus propias categorias", "La neutralidad academica como condicion del pensamiento riguroso"],
          "correct": "Las victimas, los excluidos y los pobres como punto de partida etico-politico (exterioridad)"
        }
      ],
      "rubric": "Nivel 4: Articula con precision el concepto de praxis filosofica, conecta a Freire, Dussel y la comunalidad con el proyecto de intervencion disenado, y presenta una propuesta de accion comunitaria bien fundamentada filosoficamente y viable localmente; Nivel 3: Describe el concepto de praxis y presenta un proyecto coherente aunque la fundamentacion filosofica puede ser mas superficial; Nivel 2: Conoce los autores pero el proyecto de intervencion no conecta claramente con los marcos conceptuales; Nivel 1: No puede articular el concepto de praxis o el proyecto carece de fundamentacion filosofica."
    },
    "teacher_tips": [
      "El proyecto de praxis filosofica es el momento mas autenticament transformador de todo el semestre: dejarlo abierto en cuanto al formato (dialogo, mural, exposicion, cafe filosofico) garantiza que los equipos encuentren la forma de accion que mas les es propia.",
      "El cafe filosofico es una modalidad muy accesible: pueden organizarlo en el patio de la escuela durante el recreo, con una pregunta en una cartulina grande. No requiere recursos y puede tener impacto real en la comunidad escolar.",
      "La comunalidad oaxaquena conecta directamente con las tradiciones culturales de los estudiantes indigenas del grupo: invitar a que compartan practicas de su comunidad que podrian ser conceptualizadas como praxis filosofica.",
      "Compartir el proyecto final con la direccion del plantel o en el mural escolar como un ejercicio de rendicion de cuentas filosofica: la filosofia practica produce efectos en el mundo, no solo en el aula."
    ]
  }
}

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Written {len(data)} progressions to {OUT}")

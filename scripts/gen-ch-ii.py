"""gen-ch-ii.py — Ciencias Históricas II (Sem 5) — 4 progresiones completas."""
import json, pathlib

OUT = pathlib.Path(__file__).parent.parent / "src/data/planteamiento/ch-ii.json"

data = {
  "CH-II-P01": {
    "code": "CH-II-P01",
    "title": "Reflexiona sobre su propia historicidad como sujeto inscrito en procesos sociales e históricos.",
    "level": "Ciencias Históricas II",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Intermedio",
    "category": "Conciencia histórica",
    "metadata": {
      "objective": "Desarrollar la conciencia histórica como capacidad de reconocerse como sujeto situado en un tiempo, espacio y contexto sociocultural específicos; analizar cómo los procesos históricos macrosociales (migración, industrialización, democratización) han configurado la propia biografía y la de la comunidad.",
      "competencies": [
        "Identifica al menos 3 procesos históricos que han influido en su propia vida o la de su familia.",
        "Distingue entre historia personal y procesos históricos colectivos, mostrando sus conexiones.",
        "Narra su propia historicidad usando conceptos del pensamiento histórico (contexto, proceso, sujeto).",
        "Reflexiona sobre la responsabilidad del sujeto histórico en la construcción del futuro."
      ],
      "materials": [
        "Árbol genealógico familiar — tres generaciones mínimo.",
        "Línea de vida biográfica con eventos personales y eventos históricos paralelos.",
        "Mapas de flujos migratorios en México (CONAPO, INEGI): migración campo-ciudad 1940-1980, migración a EE.UU. 1980-2020.",
        "Testimonios de vida de abuelos/padres (entrevista de tarea previa).",
        "Datos: 38.3 millones de mexicanos en EE.UU. (CONAPO, 2023)."
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "10 min", "label": "Mi historia en la historia"},
        {"phase": "Desarrollo", "duration": "30 min", "label": "Historicidad: procesos macro en biografías micro"},
        {"phase": "Cierre", "duration": "10 min", "label": "Sujeto histórico: agente y no solo receptor"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "10 min",
          "description": "Los estudiantes comparten brevemente (2 min en parejas): ¿De qué estado o región vienen tus abuelos? ¿Por qué llegaron a donde viven hoy? El docente señala que detrás de cada respuesta hay un proceso histórico: el 'milagro mexicano' (industrialización 1940-1970 → migración campo-ciudad), la crisis de 1982, el TLCAN, la violencia del narco. Las biografías personales están insertas en la historia.",
          "activity": "Actividad de la 'Línea doble': en una hoja, en paralelo, los estudiantes escriben 5 eventos de su historia personal (o de su familia) y los alinean con 5 eventos históricos que pudo haber influido en esa decisión/cambio."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "30 min",
          "description": "HISTORICIDAD: condición del ser humano de existir en el tiempo y ser configurado por su contexto histórico. No nacemos 'ahistóricos' — nacemos en una clase social, una región, una generación, una cultura que han sido modeladas por siglos de historia. PROCESOS HISTÓRICOS Y BIOGRAFÍAS: La industrialización sustitutiva (1940-1970) atrajo millones de campesinos a CDMX, Monterrey, Guadalajara → los abuelos de muchos estudiantes son parte de esa migración. La crisis de 1982 y el TLCAN (1994) rediseñaron las economías familiares. La migración a EE.UU.: 38.3 millones de mexicanos (CONAPO, 2023) — el mayor contingente de mexicanos fuera del país. La violencia del narco desde 2006 desplazó 400,000 personas (UNHCR). SUJETO HISTÓRICO: personas individuales y colectivos que actúan en la historia — no solo reciben sus efectos sino que la producen. Distinción entre: sujetos históricos individuales (Lázaro Cárdenas, Emiliano Zapata), colectivos (movimiento obrero, comunidades indígenas, estudiantes del 68), anónimos (las familias migrantes).",
          "activity": "Construcción del árbol biográfico-histórico: cada estudiante conecta su árbol genealógico con procesos históricos en un mapa visual. Identifica: ¿cuáles procesos históricos 'movieron' a tu familia? ¿Qué decisiones tomaron sus miembros como sujetos activos?"
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "10 min",
          "description": "Reflexión sobre la responsabilidad: si nosotros somos sujetos históricos, ¿qué procesos estamos construyendo hoy que afectarán a las generaciones futuras? Clima, democracia, igualdad de género, tecnología — la generación actual está produciendo historia.",
          "activity": "Escritura reflexiva (breve): 'Un proceso histórico que mi familia vivió y que yo continúo/transformo hoy es...' Compartir voluntariamente."
        }
      ]
    },
    "theory": {
      "introduction": "La conciencia histórica, concepto desarrollado por el filósofo alemán Hans-Georg Gadamer y sistematizado por el historiador alemán Jörn Rüsen, es la capacidad de comprenderse a uno mismo como ser temporal, situado en el pasado, presente y futuro. Para el pensamiento histórico, esta conciencia es el punto de partida: antes de estudiar el pasado de otros, reconocer la historicidad propia.",
      "sections": [
        {
          "subtitle": "Historicidad: el ser humano como ser histórico",
          "content": "A diferencia de otros seres vivos, los humanos tienen historicidad: conciencia de su temporalidad, capacidad de narrar el pasado y proyectar el futuro. Marx argumentó que 'los hombres hacen su propia historia, pero no la hacen arbitrariamente' — están condicionados por las circunstancias históricas en que nacen. Esta tensión entre agencia (capacidad de actuar) y estructura (condicionamiento histórico) es el corazón de la reflexión histórica."
        },
        {
          "subtitle": "Sujeto histórico: individual, colectivo, anónimo",
          "content": "Historiografía clásica: se centró en 'grandes hombres' (reyes, caudillos, intelectuales). Historiografía social (Annales, historia desde abajo): recupera a los actores anónimos — campesinos, obreros, mujeres, niños, comunidades indígenas. México: el INAH y el Archivo General de la Nación custodian fuentes sobre sujetos colectivos (comunidades de Oaxaca, obreros de Puebla, migrantes de Guanajuato) que la historiografía tradicional ignoró. La Historia Oral (Programa de Historia Oral del INAH) recupera testimonios de sujetos anónimos."
        },
        {
          "subtitle": "Generación histórica: el concepto de Ortega y Gasset",
          "content": "Ortega y Gasset propuso el concepto de 'generación' como grupo de personas que comparten un contexto histórico formativo similar. México tiene generaciones históricamente marcadas: la generación del 68 (masacre de Tlatelolco), la del 85 (terremotos y sociedad civil), la del TLC (globalización), la de 2020 (pandemia COVID-19). Cada generación hereda problemas, desarrolla sus propias soluciones y lega nuevos problemas. Los estudiantes de bachillerato actuales son la 'Generación COVID' — marcados por la pandemia y la digitalización acelerada."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "La 'historicidad' se refiere a:",
          "options": [
            "La condición del ser humano de existir en un tiempo y contexto histórico que lo configura",
            "La capacidad de memorizar fechas históricas",
            "El estudio de la historia de las civilizaciones antiguas",
            "La objetividad del historiador al escribir sobre el pasado"
          ],
          "correct": "La condición del ser humano de existir en un tiempo y contexto histórico que lo configura"
        },
        {
          "question": "¿Cuál de los siguientes es un ejemplo de 'sujeto histórico colectivo anónimo'?",
          "options": [
            "Las familias migrantes del Bajío que se establecieron en CDMX en los años 50",
            "El presidente Lázaro Cárdenas",
            "La firma del TLCAN en 1994",
            "La Constitución de 1917"
          ],
          "correct": "Las familias migrantes del Bajío que se establecieron en CDMX en los años 50"
        },
        {
          "question": "Según Marx, los seres humanos hacen su historia pero:",
          "options": [
            "Condicionados por las circunstancias históricas en que nacen",
            "Con total libertad y sin ninguna restricción",
            "Solo a través de la voluntad de los grandes líderes",
            "De forma idéntica en todas las épocas y culturas"
          ],
          "correct": "Condicionados por las circunstancias históricas en que nacen"
        }
      ],
      "rubric": "4: Identifica 3+ procesos históricos en su biografía familiar, distingue agencia de estructura histórica y reflexiona sobre su responsabilidad como sujeto histórico. 3: Identifica 2 procesos, conexión básica con biografía, reflexión inicial. 2: Identifica procesos históricos generales pero no los relaciona con su propia historia. 1: No distingue historia personal de historia colectiva."
    },
    "teacher_tips": [
      "La entrevista a abuelos/padres como tarea previa enriquece enormemente la discusión — anticiparla en la clase anterior.",
      "Ser sensible a estudiantes que vienen de contextos de desplazamiento forzado o migración dolorosa — dar opción de no compartir públicamente.",
      "El mapa de flujos migratorios del CONAPO visualmente impacta: muchos estudiantes ven sus estados de origen de sus abuelos.",
      "El dato de 38.3 millones de mexicanos en EE.UU. (CONAPO) es con frecuencia sorprendente para los estudiantes."
    ]
  },

  "CH-II-P02": {
    "code": "CH-II-P02",
    "title": "Formula hipótesis históricas a partir de la interpretación de fuentes y evidencias.",
    "level": "Ciencias Históricas II",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Intermedio-Avanzado",
    "category": "Metodología histórica",
    "metadata": {
      "objective": "Desarrollar la capacidad de formular hipótesis históricas verificables a partir del análisis de fuentes; aprender a construir argumentos históricos con evidencia y a contrastar interpretaciones diferentes del mismo evento o proceso histórico.",
      "competencies": [
        "Formula una hipótesis histórica como respuesta tentativa a una pregunta de investigación.",
        "Selecciona fuentes relevantes para contrastar o apoyar una hipótesis histórica.",
        "Construye un argumento histórico con estructura: tesis + evidencia + razonamiento.",
        "Reconoce que la historia es una construcción interpretativa, no solo un relato de 'hechos'."
      ],
      "materials": [
        "Pregunta problema: '¿Por qué fracasó el Porfiriato?' (para formular hipótesis contrastantes).",
        "Tres fuentes sobre el Porfiriato: diario El Imparcial (pro-Díaz, 1902), Ricardo Flores Magón Regeneración (1910), John Turner 'México bárbaro' (1909).",
        "Rúbrica de evaluación de hipótesis históricas.",
        "Estructura del argumento histórico (plantilla: tesis → evidencia → análisis → conclusión).",
        "Datos estadísticos del Porfiriato: INEGI datos históricos, producción minera, extensión de vías férreas, distribución de la tierra."
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "10 min", "label": "¿Progreso o dictadura? El Porfiriato a debate"},
        {"phase": "Desarrollo", "duration": "30 min", "label": "Hipótesis histórica + argumento con evidencia"},
        {"phase": "Cierre", "duration": "10 min", "label": "Contraste de interpretaciones históricas"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "10 min",
          "description": "Se presentan dos afirmaciones contrastantes sobre el Porfiriato (1876-1910): (A) 'Fue una época de modernización y progreso que transformó a México.' (B) 'Fue una dictadura que benefició a unos pocos y hundió en la miseria a las mayorías.' Pregunta: ¿cuál es correcta? ¿Se pueden reconciliar? ¿Cómo lo sabemos?",
          "activity": "Votación rápida: ¿quién apoya A? ¿quién B? ¿quién dice ambas son parcialmente correctas? Los estudiantes justifican brevemente su posición. El docente señala que ambas son hipótesis que necesitan evidencia."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "30 min",
          "description": "LA HIPÓTESIS HISTÓRICA: respuesta tentativa a una pregunta de investigación. Características: verificable con evidencia, argumentable (puede ser cuestionada), específica (no vaga), no tautológica. Estructura del argumento histórico: TESIS (hipótesis específica) → EVIDENCIA (fuentes primarias o datos) → ANÁLISIS (por qué la evidencia apoya la tesis) → CONCLUSIÓN. FUENTES PARA EL PORFIRIATO: El Imparcial (periódico financiado por el gobierno de Díaz): 'México es admirado en el mundo por su estabilidad y progreso'. Flores Magón, Regeneración (1910): 'El pueblo muere de hambre mientras los terratenientes acaparan 97% de la tierra'. Datos estadísticos (INEGI histórico): PIB creció 140% entre 1884-1910; pero 97% de la población rural no poseía tierra (CONEVAL datos históricos); salario real del obrero bajó 60% entre 1900-1910. DIFERENTES INTERPRETACIONES: REVISIONISMO PRO-PORFIRIATO (Daniel Cosío Villegas: 'La dictadura era necesaria para la modernización'). HISTORIOGRAFÍA CRÍTICA (Friedrich Katz, Enrique Krauze: 'Modernización sin democracia ni justicia social').",
          "activity": "Equipos de 4: cada uno recibe una hipótesis para defender ('El Porfiriato fue fundamentalmente positivo' vs 'fundamentalmente negativo' vs 'contradictorio'). Tienen 15 minutos para seleccionar 3 piezas de evidencia y construir el argumento. Debaten 10 minutos en formato estructurado."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "10 min",
          "description": "Reflexión epistemológica: ¿la historia tiene una sola 'verdad'? Las diferentes interpretaciones del Porfiriato coexisten en la historiografía. Lo que distingue una buena interpretación histórica no es que sea 'la única verdad' sino que está bien fundamentada en evidencia y argumentada coherentemente.",
          "activity": "Metacognición: '¿Cambié mi hipótesis inicial después de ver las evidencias? ¿Qué evidencia me resultó más convincente y por qué?' Escritura breve en cuaderno."
        }
      ]
    },
    "theory": {
      "introduction": "La historia no es un relato de 'hechos' sino una construcción interpretativa basada en evidencias. El historiador formula preguntas, propone hipótesis, busca evidencias y construye argumentos. Este método, llamado hermenéutico-crítico, distingue la historia como disciplina científica de la simple memorización de fechas y datos.",
      "sections": [
        {
          "subtitle": "La hipótesis en la investigación histórica",
          "content": "Una hipótesis histórica es una proposición que pretende explicar por qué ocurrió un fenómeno, cómo se relacionan dos procesos, o cuáles fueron las consecuencias principales de un evento. A diferencia de la hipótesis en ciencias naturales, NO se puede 'probar' definitivamente (el pasado no es experimentable), pero SÍ puede ser más o menos bien fundamentada en evidencias. Características: específica ('El fracaso del Porfiriato se debió principalmente a su incapacidad para gestionar la contradicción entre modernización económica y exclusión política') más que vaga ('El Porfiriato fue malo')."
        },
        {
          "subtitle": "Argumento histórico: estructura y evaluación",
          "content": "TESIS: la hipótesis específica que se defiende. EVIDENCIA: hechos, datos, citas de fuentes primarias o secundarias confiables. RAZONAMIENTO (WARRANT): la conexión lógica entre la evidencia y la tesis — explica POR QUÉ esa evidencia apoya la tesis. CONCESIÓN (opcional en B1): reconocer la evidencia que contradice la tesis y explicar por qué no la invalida. Este modelo (Toulmin, 1958) es el estándar en la escritura académica histórica desde el nivel bachillerato hasta el doctorado."
        },
        {
          "subtitle": "Historiografía: la historia de cómo se escribe la historia",
          "content": "La historiografía analiza cómo las interpretaciones históricas cambian según la época, la perspectiva y los valores del historiador. Sobre la Revolución Mexicana, existen al menos 4 historiografías: (1) Oficial (glorificación de la Revolución, SEP-libros de texto). (2) Revisionista (cuestionamiento del mito revolucionario: Luis González y González, COLMEX). (3) Social (historia de abajo: campesinos, mujeres: John Womack, Engracia Loyo). (4) Posmoderna/microhistoria (Giovanni Levi, Carlo Ginzburg aplicados a México). Comprender la historiografía ayuda a ser consumidor crítico de 'la historia'."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "Una hipótesis histórica se distingue de una opinión personal en que:",
          "options": [
            "Está fundamentada en evidencias específicas y es verificable",
            "Es aceptada por todos los historiadores",
            "No puede ser cuestionada ni modificada",
            "Proviene exclusivamente de fuentes primarias oficiales"
          ],
          "correct": "Está fundamentada en evidencias específicas y es verificable"
        },
        {
          "question": "¿Qué hace que dos interpretaciones históricas del mismo evento sean igualmente válidas?",
          "options": [
            "Que ambas estén bien fundamentadas en evidencias y argumentadas coherentemente",
            "Que ambas sean escritas por historiadores del mismo país",
            "Que lleguen a la misma conclusión",
            "Que usen las mismas fuentes primarias"
          ],
          "correct": "Que ambas estén bien fundamentadas en evidencias y argumentadas coherentemente"
        },
        {
          "question": "En un argumento histórico, el 'razonamiento' o warrant es:",
          "options": [
            "La explicación de por qué la evidencia apoya la tesis",
            "La lista de fuentes consultadas",
            "La conclusión del argumento",
            "La cita textual de la fuente primaria"
          ],
          "correct": "La explicación de por qué la evidencia apoya la tesis"
        }
      ],
      "rubric": "4: Formula hipótesis específica, selecciona 3+ evidencias relevantes, construye argumento completo con razonamiento y reconoce interpretaciones alternativas. 3: Hipótesis específica, 2 evidencias con análisis básico, conclusión. 2: Hipótesis vaga, evidencias listadas sin razonamiento. 1: No distingue hipótesis de opinión o no usa evidencias."
    },
    "teacher_tips": [
      "El caso del Porfiriato es idóneo porque hay fuentes primarias accesibles y la historiografía es rica y contrastante.",
      "El debate estructurado con posiciones asignadas (incluso contra la opinión del estudiante) desarrolla pensamiento crítico y empatía histórica.",
      "La obra de Daniel Cosío Villegas (Historia Moderna de México, COLMEX) y la de Friedrich Katz (Pancho Villa, COLMEX) son los referentes clásicos.",
      "El INEGI tiene datos históricos de producción y demografía del Porfiriato disponibles en línea — útiles como evidencia cuantitativa."
    ]
  },

  "CH-II-P03": {
    "code": "CH-II-P03",
    "title": "Reconoce el sentido histórico como capacidad humana para comprender el presente a partir del pasado.",
    "level": "Ciencias Históricas II",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Avanzado",
    "category": "Conciencia histórica",
    "metadata": {
      "objective": "Desarrollar el 'sentido histórico' como herramienta para comprender el presente a partir de sus raíces históricas; analizar cómo problemas actuales de México (desigualdad, corrupción, movimientos sociales, identidad nacional) tienen raíces históricas profundas; evitar el 'presentismo' (juzgar el pasado con criterios del presente).",
      "competencies": [
        "Identifica las raíces históricas de al menos 2 problemas actuales de México.",
        "Distingue entre el 'presentismo' y el análisis histórico contextualizado.",
        "Aplica el concepto de 'larga duración' para entender estructuras persistentes en la sociedad mexicana.",
        "Argumenta por qué el conocimiento histórico es relevante para la ciudadanía activa hoy."
      ],
      "materials": [
        "Artículo periodístico actual sobre un problema de México (desigualdad, corrupción, feminismo, migración).",
        "Diagrama 'líneas de continuidad': trazar una línea del pasado al presente para un problema dado.",
        "Datos CONEVAL 2022: 46.8 millones de pobres en México vs datos históricos de pobreza en 1910, 1950, 1980.",
        "Fragmento de 'El laberinto de la soledad' de Octavio Paz (FCE, 1950) sobre la identidad mexicana.",
        "Caricatura política actual de El Financiero, Proceso o La Jornada sobre un problema social."
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "10 min", "label": "¿Por qué México es como es hoy?"},
        {"phase": "Desarrollo", "duration": "30 min", "label": "Raíces históricas de los problemas actuales"},
        {"phase": "Cierre", "duration": "10 min", "label": "Presentismo vs análisis histórico"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "10 min",
          "description": "Se proyectan datos actuales de México: desigualdad (GINI 0.45, CONEVAL 2022), corrupción (Índice de Percepción de Corrupción: México en lugar 126 de 180, Transparencia Internacional), violencia de género (10 feminicidios diarios, SNSP). Pregunta: '¿De dónde vienen estos problemas? ¿Empezaron hoy?' Los estudiantes intuyen que tienen raíces históricas.",
          "activity": "Lluvia de ideas rápida: ¿cuándo creen que comenzó la desigualdad en México? ¿La corrupción? Respuestas sin evaluación. El docente los anota para retomar al final."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "30 min",
          "description": "DESIGUALDAD: raíces coloniales (sistema de castas, haciendas, mita minera) → siglo XIX (concentración de tierra, latifundismo) → Porfiriato (modernización excluyente) → posrevolución (reforma agraria incompleta: 46.8 millones de pobres en 2022, CONEVAL). CORRUPCIÓN INSTITUCIONAL: raíces en la administración colonial (venal de cargos) → patrimonialismo priísta (1929-2000: el partido-Estado) → transición democrática incompleta. FEMINISMO Y VIOLENCIA DE GÉNERO: subordinación de la mujer en la Colonia (código patriarcal ibérico + jerarquía indígena) → Revolución Mexicana: soldaderas ignoradas en la historia oficial → Ley de 1953 (voto femenino, muy tardío) → movimiento feminista 2020 (marea verde) con raíces en décadas de violencia estructural. IDENTIDAD MEXICANA: Paz ('El laberinto de la soledad'): el mexicano como producto de la Conquista — la 'chingada' y el macho, la herida colonial, la máscara social. PRESENTISMO: juzgar el pasado con valores del presente ('Hernán Cortés fue un genocida') sin contextualizar en su época. Análisis histórico: comprender las acciones en su contexto, sin relativizar la violencia, pero sin anacronismo.",
          "activity": "Diagrama de 'líneas de continuidad': en equipos, cada uno elige un problema actual (desigualdad / corrupción / violencia de género / identidad / migración). Trazan una línea cronológica que muestra cómo ese problema tiene raíces desde la Colonia hasta hoy. Presentan en 3 minutos."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "10 min",
          "description": "Debate sobre el presentismo: '¿Debemos juzgar a personajes históricos como Cortés, Juárez o Díaz con los valores de hoy?' Posiciones: (A) Sí: la violación de derechos humanos es universalmente condenable. (B) No: hay que entender el contexto. (C) Ambas: comprender el contexto pero no relativizar la violencia.",
          "activity": "Síntesis: el sentido histórico no es una colección de datos del pasado sino la capacidad de leer el presente como resultado de procesos históricos — y así poder actuar más conscientemente para transformarlo."
        }
      ]
    },
    "theory": {
      "introduction": "El filósofo alemán Johann Gustav Droysen (siglo XIX) introdujo el concepto de 'sentido histórico' (historisches Sinn) como la capacidad de comprender el presente a la luz del pasado. Para Gadamer, la 'conciencia histórico-efectual' significa que el pasado no está muerto — opera en nosotros como 'horizonte' desde el que comprendemos el mundo. En México, Octavio Paz, Carlos Fuentes y el Colegio de México han desarrollado esta reflexión sobre la identidad nacional como construcción histórica.",
      "sections": [
        {
          "subtitle": "Larga duración y estructuras persistentes",
          "content": "Braudel identificó estructuras de 'larga duración' en la historia que persisten durante siglos: mentalidades, geografías económicas, sistemas de parentesco. México tiene estructuras persistentes identificables: la concentración del poder en el centro (Valle de México como eje desde Teotihuacán); la exclusión sistemática de los grupos subordinados (indígenas, mujeres, pobres rurales); el 'presidencialismo' como forma de autoridad (del tlatoani al virrey al presidente); la corrupción como sistema de lealtades (desde la venta de cargos coloniales). Conocer estas estructuras de larga duración ayuda a entender por qué el cambio social en México es lento y difícil."
        },
        {
          "subtitle": "Presentismo: el anacronismo evaluativo",
          "content": "El presentismo consiste en juzgar el pasado con los valores, criterios y sensibilidades del presente, ignorando el contexto histórico. Puede llevar a conclusiones simplistas ('todos los conquistadores eran malvados', 'los indígenas eran víctimas pasivas'). El análisis histórico exige: contextualizar las acciones en el marco de valores y posibilidades de la época; comprender los motivos de los actores desde su propio horizonte cultural; pero SIN relativizar el dolor y la violencia sufridos por las víctimas. La 'empatía histórica' (Historical Empathy) no es justificación — es comprensión: entender sin necesariamente absolver."
        },
        {
          "subtitle": "El uso público de la historia",
          "content": "La historia no solo sirve para el conocimiento académico — tiene usos públicos y políticos. El uso legítimo: informar decisiones ciudadanas, construir identidad colectiva crítica. El uso manipulador: el 'mito nacional' (la historia oficial de la SEP que glorifica la Revolución sin matices); la 'historia de bronce' que solo habla de héroes. En México, la reforma de libros de texto 2023 (SEP/MEJOREDU) fue polémica precisamente por la disputa sobre 'qué historia enseñar'. El historiador Enrique Krauze y el filósofo Roger Bartra han criticado el uso político de la historia en México."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "El 'presentismo' en historia consiste en:",
          "options": [
            "Juzgar el pasado con los valores y criterios del presente sin contextualizar",
            "Estudiar solo la historia más reciente",
            "Usar fuentes digitales del presente para estudiar el pasado",
            "Escribir la historia en tiempo presente"
          ],
          "correct": "Juzgar el pasado con los valores y criterios del presente sin contextualizar"
        },
        {
          "question": "¿Cuál de las siguientes es una 'estructura de larga duración' en México?",
          "options": [
            "La concentración del poder político en el Valle de México desde Teotihuacán hasta CDMX",
            "La presidencia de AMLO",
            "La firma del TLCAN en 1994",
            "El movimiento estudiantil de 1968"
          ],
          "correct": "La concentración del poder político en el Valle de México desde Teotihuacán hasta CDMX"
        },
        {
          "question": "El 'sentido histórico' según Droysen y Gadamer consiste en:",
          "options": [
            "La capacidad de comprender el presente a la luz del pasado",
            "La habilidad de memorizar fechas y datos históricos",
            "El estudio exclusivo de la historia más antigua",
            "La objetividad del historiador al escribir"
          ],
          "correct": "La capacidad de comprender el presente a la luz del pasado"
        }
      ],
      "rubric": "4: Identifica raíces históricas de 2+ problemas actuales con argumentación de larga duración, distingue presentismo de análisis contextualizado y reflexiona sobre el uso público de la historia. 3: Identifica raíces con argumentación básica, noción de presentismo. 2: Identifica problemas pero no los conecta históricamente. 1: No relaciona presente con pasado."
    },
    "teacher_tips": [
      "El fragmento de 'El laberinto de la soledad' de Octavio Paz es excelente pero difícil — usar un pasaje corto y bien seleccionado.",
      "El debate sobre el presentismo es uno de los más ricos en bachillerato — dar estructura clara para evitar que derive en debate político sin contenido histórico.",
      "Los datos de CONEVAL sobre pobreza actual comparados con datos históricos (INEGI series largas) son muy impactantes.",
      "Conectar con LC: el análisis crítico de discurso periodístico actual sobre 'problemas históricos' es una actividad interdisciplinar."
    ]
  },

  "CH-II-P04": {
    "code": "CH-II-P04",
    "title": "Analiza procesos históricos de México y el mundo en su contexto multicausal e interdependiente.",
    "level": "Ciencias Históricas II",
    "duration": "~4h (proyecto integrador, 2-3 sesiones)",
    "difficulty": "Avanzado",
    "category": "Análisis histórico integrador",
    "metadata": {
      "objective": "Analizar un proceso histórico significativo de México en el siglo XX en su contexto local, nacional e internacional; aplicar los conceptos y herramientas del pensamiento histórico (multicausalidad, fuentes, hipótesis, sentido histórico) en un proyecto de investigación histórica breve.",
      "competencies": [
        "Selecciona y delimita un proceso histórico del siglo XX para investigar.",
        "Formula una pregunta de investigación e hipótesis verificable.",
        "Analiza al menos 3 fuentes (primarias y secundarias) aplicando el método crítico.",
        "Presenta los resultados en formato académico (ensayo breve, presentación o video histórico)."
      ],
      "materials": [
        "Repositorios digitales: AGN (gob.mx/agn), Mediateca INAH, BNM-UNAM, HNDM.",
        "Guía de investigación histórica breve (4 pasos: pregunta → hipótesis → fuentes → argumento).",
        "Rúbrica de evaluación del proyecto integrador.",
        "Temas sugeridos: Movimiento del 68 / Terremoto de 1985 y sociedad civil / TLCAN y campo mexicano / Movimiento zapatista 1994 / Crisis económicas (82, 94, 2009, 2020) / Migración masiva siglo XX-XXI / Feminismo en México / Pandemia COVID-19."
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Selección y pregunta", "duration": "20 min", "label": "Elegir tema y formular pregunta de investigación"},
        {"phase": "Investigación", "duration": "60 min", "label": "Buscar fuentes y construir el argumento"},
        {"phase": "Presentación", "duration": "30 min", "label": "Socializar y recibir retroalimentación"},
        {"phase": "Metacognición", "duration": "10 min", "label": "Reflexión sobre el proceso de investigación"}
      ],
      "phases": [
        {
          "title": "FASE I: SELECCIÓN Y PREGUNTA",
          "duration": "20 min",
          "description": "Cada estudiante (o equipo de 2) elige un proceso histórico del siglo XX de México. Formula UNA pregunta de investigación específica ('¿Cuáles fueron las causas principales del movimiento estudiantil de 1968 en México?' en lugar de '¿Qué pasó en 1968?'). Formula una hipótesis tentativa como respuesta parcial a la pregunta.",
          "activity": "Validación cruzada: intercambiar la pregunta e hipótesis con otro equipo para verificar que son específicas, verificables y no tautológicas. Retroalimentación de 5 minutos."
        },
        {
          "title": "FASE II: INVESTIGACIÓN Y ARGUMENTO",
          "duration": "60 min",
          "description": "Búsqueda de fuentes en repositorios digitales (AGN, Mediateca INAH, HNDM) y bibliografía básica. Cada proyecto debe usar al menos: 1 fuente primaria, 1 fuente secundaria académica (libro, artículo de revista del COLMEX o UNAM), 1 dato estadístico (INEGI, CONEVAL, CONAPO). Construcción del argumento: tesis → evidencia → razonamiento → conclusión. El contexto internacional es obligatorio: ¿cómo el proceso se relaciona con dinámicas globales (Guerra Fría, globalización neoliberal, movimientos sociales internacionales)?",
          "activity": "El docente circula y da retroalimentación individual. Énfasis en: ¿la evidencia realmente apoya la hipótesis? ¿Se consideran causas estructurales Y coyunturales? ¿Se incluye el contexto internacional?"
        },
        {
          "title": "FASE III: PRESENTACIÓN Y METACOGNICIÓN",
          "duration": "40 min",
          "description": "Presentación de resultados (5 min por proyecto): la pregunta, la hipótesis, las fuentes usadas, el argumento principal, la conclusión. Formato flexible: presentación oral, ensayo breve (1-2 páginas), infografía histórica, video de 3 minutos, línea de tiempo comentada. El grupo hace preguntas y da retroalimentación constructiva.",
          "activity": "Metacognición del semestre: ¿qué habilidades de pensamiento histórico desarrollé? ¿Cómo cambió mi forma de leer las noticias? ¿Qué proceso histórico me resulta más relevante para entender México hoy? Escritura reflexiva breve."
        }
      ]
    },
    "theory": {
      "introduction": "El proyecto integrador de Ciencias Históricas II condensa todas las habilidades desarrolladas en el semestre: conciencia de la propia historicidad, formulación de hipótesis, análisis crítico de fuentes, multicausalidad y sentido histórico. La investigación histórica breve prepara a los estudiantes para la investigación académica universitaria y para el pensamiento ciudadano crítico.",
      "sections": [
        {
          "subtitle": "México en el sistema-mundo: la interdependencia histórica",
          "content": "Ningún proceso histórico mexicano del siglo XX puede entenderse sin su contexto internacional: el Cardenismo (1934-1940) y la expropiación petrolera se enmarcan en el New Deal de Roosevelt, el fascismo europeo y el giro a la izquierda latinoamericano. El 68 mexicano es parte del movimiento estudiantil global (París, Praga, Berkeley). El neoliberalismo del 82-94 es parte de la revolución conservadora Reagan-Thatcher. El zapatismo de 1994 es una respuesta al TLCAN y precursor del altermundismo. Esta 'historia conectada' (connected history, Subrahmanyam) evita el ensimismamiento y el excepcionalismo nacionalista."
        },
        {
          "subtitle": "La investigación histórica como proceso iterativo",
          "content": "La investigación histórica no es lineal: (1) se formula la pregunta; (2) se buscan fuentes iniciales; (3) las fuentes revelan nuevas preguntas o modifican la hipótesis; (4) se buscan más fuentes; (5) el argumento se refina. Este proceso iterativo puede repetirse muchas veces antes de llegar a una conclusión. En proyectos universitarios, puede durar años. En el bachillerato, comprender la naturaleza iterativa del proceso es más importante que llegar a conclusiones 'definitivas'."
        },
        {
          "subtitle": "Procesos históricos del siglo XX en México: orientación temática",
          "content": "Movimiento del 68: represión del 2 de octubre en Tlatelolco (FSTSE, UNAM, IPN). Terremotos de 1985: surgimiento de la sociedad civil organizada (Cruz Roja, brigadas vecinales, CDMX autónoma por primera vez). TLCAN 1994: liberalización del maíz → crisis de pequeños agricultores (CONASIPO). Zapatismo: autonomía indígena, derechos de los Pueblos (Convenio 169 OIT). Crisis 2008-2009: impacto de la crisis financiera de EE.UU. en México: caída del PIB 6%. COVID-19: 350,000 muertes oficiales (INEGI), colapso de economía informal, digitalización forzada."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "¿Por qué el contexto internacional es importante para analizar el movimiento del 68 en México?",
          "options": [
            "Porque el 68 formó parte de un movimiento estudiantil global que cuestionó el statu quo en varios países",
            "Porque fue organizado desde el extranjero",
            "Porque México dependía económicamente de EE.UU. para financiar a los estudiantes",
            "Porque la ONU ordenó la represión de Tlatelolco"
          ],
          "correct": "Porque el 68 formó parte de un movimiento estudiantil global que cuestionó el statu quo en varios países"
        },
        {
          "question": "En la investigación histórica, el proceso es mejor descrito como:",
          "options": [
            "Iterativo: la hipótesis se puede modificar a medida que se encuentran nuevas fuentes",
            "Lineal: primero se buscan todas las fuentes y luego se escribe",
            "Definitivo: la primera hipótesis es siempre la correcta",
            "Aleatorio: no hay estructura metodológica"
          ],
          "correct": "Iterativo: la hipótesis se puede modificar a medida que se encuentran nuevas fuentes"
        },
        {
          "question": "¿Qué distingue a una investigación histórica académica de una búsqueda en Wikipedia?",
          "options": [
            "El uso de fuentes primarias y secundarias académicas con análisis crítico argumentado",
            "La longitud del texto producido",
            "Que el historiador sea mexicano",
            "Que uses más de 5 fuentes de internet"
          ],
          "correct": "El uso de fuentes primarias y secundarias académicas con análisis crítico argumentado"
        }
      ],
      "rubric": "4: Pregunta específica y verificable, hipótesis argumentada, 3+ fuentes (primaria+secundaria+dato), argumento completo con contexto internacional, presentación clara. 3: Pregunta y hipótesis razonables, 2 fuentes analizadas, argumento básico. 2: Pregunta vaga, 1 fuente, argumento descriptivo sin análisis causal. 1: No distingue investigación histórica de reporte enciclopédico."
    },
    "teacher_tips": [
      "El AGN en línea (gob.mx/agn) puede abrumar a los estudiantes — guiar con búsquedas concretas: 'Busca en el AGN documentos sobre el 68 usando el término Tlatelolco'.",
      "La Hemeroteca Nacional Digital de México (HNDM) tiene periódicos desde 1722 — pueden encontrar noticias del 68 publicadas en El Excélsior o Unomásuno.",
      "Para el format del proyecto: ser flexible pero exigir siempre la tríada: hipótesis → evidencia → argumento.",
      "La metacognición del semestre es un cierre poderoso — dar tiempo suficiente y compartir en círculo."
    ]
  }
}

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Written {len(data)} progressions to {OUT}")

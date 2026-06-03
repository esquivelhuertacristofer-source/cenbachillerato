import json, os

data = {
  "LC-II-P01": {
    "code": "LC-II-P01",
    "title": "Narra situaciones de su historia de vida para compartir como han dejado una huella en su persona.",
    "level": "Lengua y Comunicacion II",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Intermedio",
    "category": "Oralidad y escritura",
    "metadata": {
      "objective": "El estudiante narra oralmente y por escrito situaciones significativas de su historia de vida usando recursos narrativos basicos (secuencia temporal, voz narrativa, detalle sensorial), reconociendo la autobiografia como practica social y literaria.",
      "competencies": [
        "Identifica y narra eventos significativos de su historia personal con coherencia y secuencia logica",
        "Usa recursos narrativos: conectores temporales, descripcion sensorial, voz en primera persona",
        "Distingue entre narrar (contar eventos) y describir (caracterizar personas, lugares, sensaciones)",
        "Valora su historia de vida como materia prima de la expresion literaria"
      ],
      "materials": [
        "Fragmentos autobiograficos: Elena Poniatowska (Hasta no verte Jesus mio), Rosario Castellanos (Balun-Canan)",
        "Linea del tiempo personal en blanco (formato horizontal)",
        "Lista de conectores temporales y de secuencia",
        "Cuaderno de escritura o portafolio de autor",
        "Grabadora (celular) para la narracion oral"
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "15 min", "label": "Lectura de fragmento autobiografico + pregunta detonadora"},
        {"phase": "Desarrollo", "duration": "60 min", "label": "Linea del tiempo + borrador narrativo + revision en parejas"},
        {"phase": "Cierre", "duration": "25 min", "label": "Circulo de narracion + palabras resonantes"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "15 min",
          "description": "El docente lee en voz alta un fragmento de Hasta no verte Jesus mio (Poniatowska) o Balun-Canan (Castellanos). Preguntas: quien narra, desde que momento, que evento dejo huella. Pregunta generadora: que momento de tu historia de vida te hizo quien eres hoy.",
          "activity": "Escritura libre de 5 minutos sin correccion ni tachones: el alumno escribe lo primero que le viene a la mente en respuesta a la pregunta generadora. Es material de trabajo inicial, no se comparte aun."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "60 min",
          "description": "Construccion de linea del tiempo personal con 5-7 momentos significativos. El alumno elige uno para desarrollar como narracion. Presentacion de conectores temporales (primero, entonces, de repente, al final) y recursos narrativos (detalle sensorial, dialogo recordado, voz en 1a persona). Borrador: 150-200 palabras, estructura inicio-nudo-desenlace.",
          "activity": "Tarea 1: Linea del tiempo personal con 5 eventos marcando cual se desarrollara. Tarea 2: Borrador narrativo 150-200 palabras con 3+ conectores temporales y 2+ detalles sensoriales. Tarea 3: Revision en parejas con lista de cotejo: secuencia, conectores, sensorialidad, voz."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "25 min",
          "description": "Circulo de narracion: cada alumno comparte su historia oralmente en 1-2 minutos. El grupo escucha y cada oyente anota una palabra que le resuene del relato. Al terminar, ronda de palabras resonantes. Reflexion: narrar es un acto de identidad y resistencia.",
          "activity": "Cada alumno recibe la palabra resonante elegida por un companero. La pega en su portafolio de autor como punto de partida para la siguiente escritura."
        }
      ]
    },
    "theory": {
      "introduction": "La narracion autobiografica es una de las practicas discursivas mas antiguas: el ser humano se constituye narrando su propia historia. En la tradicion literaria mexicana, la autobiografia ha dado obras fundamentales: Hasta no verte Jesus mio (Poniatowska, 1969), Balun-Canan (Castellanos, 1957), El laberinto de la soledad (Paz, 1950). El Marco Curricular MCCEMS reconoce la oralidad y la escritura autobiografica como practicas sociales que fortalecen la identidad y el pensamiento critico. Narrar la propia historia es tambien un acto pedagogico: visibiliza experiencias de comunidades mexicanas diversas que raramente aparecen en los libros de texto.",
      "sections": [
        {
          "subtitle": "La Narracion Autobiografica: Caracteristicas",
          "content": "La narracion autobiografica se caracteriza por: (1) Pacto autobiografico (Philippe Lejeune): el autor, narrador y personaje son la misma persona. (2) Voz en primera persona: Yo vi, Yo senti, Yo recuerde. (3) Seleccion y reconstruccion: la memoria no es fotografia, es interpretacion. (4) Secuencia temporal: cronologica o con analepsis (flashback) y prolepsis (adelanto). (5) Detalle sensorial: lo que distingue el relato literario del informe es la presencia de los sentidos. Conectores temporales: primero, luego, despues, entonces, de repente, al mismo tiempo, mientras tanto, finalmente, anos despues, en ese momento, a partir de ese dia."
        },
        {
          "subtitle": "La Autobiografia en la Literatura Mexicana",
          "content": "Mexico tiene una rica tradicion autobiografica. Elena Poniatowska reconstruye en primera persona la voz de Josefina Borquez (Jesusa Palancares): soldadera, obrera, espiritualista. Rosario Castellanos narra desde los ojos de una nina chiapaneca de 7 anos la caida del mundo hacendado ante el cardenismo. Octavio Paz en El laberinto de la soledad analiza la identidad mexicana desde su experiencia existencial. Juan Rulfo describe en entrevistas Apulco, Jalisco, y la guerra cristera que marco su infancia. El INBAL (Instituto Nacional de Bellas Artes y Literatura) y la FIL de Guadalajara (la mayor feria del libro en espanol del mundo) promueven estas tradiciones narrativas."
        },
        {
          "subtitle": "Narrar como Acto de Identidad",
          "content": "Desde la perspectiva de Paul Ricoeur, la identidad narrativa sostiene que somos quienes somos porque nos contamos una historia sobre nosotros mismos. Esta idea tiene implicaciones pedagogicas: cuando el alumno narra su historia en el aula, afirma su existencia como sujeto de experiencia y conocimiento. En comunidades mexicanas diversas (indigenas, rurales, urbanas, migrantes), la narracion autobiografica visibiliza experiencias ausentes de los libros de texto. El docente tiene la responsabilidad de crear un espacio seguro donde todas las historias sean validas y dignas de ser contadas."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "El pacto autobiografico, segun Philippe Lejeune, implica que en la autobiografia:",
          "options": [
            "A) El autor, el narrador y el personaje son personas distintas.",
            "B) El autor, el narrador y el personaje son la misma persona.",
            "C) El narrador es omnisciente y no participa en los hechos."
          ],
          "correct": "B) El autor, el narrador y el personaje son la misma persona."
        },
        {
          "question": "Cual obra de Elena Poniatowska reconstruye en primera persona la voz de una mujer del pueblo mexicano?",
          "options": [
            "A) Pedro Paramo",
            "B) Hasta no verte Jesus mio",
            "C) El laberinto de la soledad"
          ],
          "correct": "B) Hasta no verte Jesus mio"
        },
        {
          "question": "Cual conector temporal indica que algo ocurrio de manera inesperada?",
          "options": [
            "A) Finalmente",
            "B) De repente",
            "C) Mientras tanto"
          ],
          "correct": "B) De repente"
        },
        {
          "question": "El detalle sensorial en la narracion autobiografica sirve para:",
          "options": [
            "A) Resumir los hechos de manera objetiva e imparcial.",
            "B) Hacer que el lector viva la experiencia narrada a traves de los sentidos.",
            "C) Eliminar la subjetividad del texto para mayor claridad."
          ],
          "correct": "B) Hacer que el lector viva la experiencia narrada a traves de los sentidos."
        },
        {
          "question": "La identidad narrativa, concepto de Paul Ricoeur, sostiene que:",
          "options": [
            "A) La identidad es fija e innata desde el nacimiento.",
            "B) Somos quienes somos porque nos contamos una historia sobre nosotros mismos.",
            "C) La identidad solo se construye a traves de las relaciones sociales, no del lenguaje."
          ],
          "correct": "B) Somos quienes somos porque nos contamos una historia sobre nosotros mismos."
        }
      ],
      "rubric": "RUBRICA — Narracion autobiografica (20 pts)\n\nSECUENCIA Y COHERENCIA (6 pts): 6=Secuencia temporal clara con inicio-nudo-desenlace y conectores variados | 4=Secuencia reconocible con algunos saltos logicos | 2=Eventos sin orden claro | 0=Sin estructura narrativa\n\nDETALLE SENSORIAL Y RECURSOS (5 pts): 5=3+ detalles sensoriales y recursos literarios | 4=2 recursos identificables | 2=1 recurso con descripcion escasa | 0=Sin recursos literarios\n\nVOZ NARRATIVA (5 pts): 5=1a persona consistente, perspectiva personal autentica y reflexiva | 4=Voz consistente con alguna perdida de perspectiva | 2=Voz confusa o cambiante | 0=Sin voz narrativa personal\n\nHUELLA E IMPACTO (4 pts): 4=El texto comunica claramente como el evento marco al narrador | 3=La huella es implicita pero reconocible | 2=Narracion de hechos sin reflexion sobre el impacto | 0=Sin conexion entre evento e identidad"
    },
    "teacher_tips": [
      "Crea un contrato de confidencialidad antes: lo que se comparte en el circulo de narracion queda en el salon. Coordina previamente con el orientador escolar si un alumno puede compartir experiencias de trauma.",
      "Ofrece alternativa: quien no quiera narrar experiencias propias puede narrar la historia de un familiar o un personaje imaginado con rasgos propios. Lo importante es la practica del genero.",
      "La escritura libre inicial (5 min sin correccion) es esencial: activa la memoria y supera el bloqueo de la hoja en blanco. Insiste: no se puede corregir ni tachar durante esos 5 minutos.",
      "Modela la escucha literaria: lee los fragmentos con emocion autentica, deja que el texto respire. Tu manera de leer ensenara a los alumnos mas que cualquier instruccion explicita.",
      "La palabra resonante al final del circulo crea vinculo comunitario: el narrador siente que fue escuchado verdaderamente. Este gesto simple tiene gran valor socioemocional."
    ]
  },
  "LC-II-P02": {
    "code": "LC-II-P02",
    "title": "Escribe un texto descriptivo o narrativo de su autoria.",
    "level": "Lengua y Comunicacion II",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Intermedio",
    "category": "Escritura",
    "metadata": {
      "objective": "El estudiante produce un texto descriptivo o narrativo de su autoria aplicando el proceso de escritura (planificacion, borrador, revision, edicion), seleccionando recursos literarios adecuados y reconociendo la escritura como proceso iterativo.",
      "competencies": [
        "Aplica las etapas del proceso de escritura: planificar, borradorear, revisar, editar, publicar",
        "Selecciona y usa recursos descriptivos y narrativos de manera intencional",
        "Distingue las caracteristicas del texto descriptivo vs el texto narrativo",
        "Recibe y da retroalimentacion constructiva en talleres de escritura"
      ],
      "materials": [
        "Guia del proceso de escritura (planificacion: mapa mental; borrador: sin autocensura; revision: checklist; edicion: ortografia y puntuacion)",
        "Textos modelo: un cuento breve de Juan Rulfo (Nos han dado la tierra) y una descripcion de lugar de Jose Emilio Pacheco",
        "Checklist de revision en parejas",
        "Portafolio de escritura del alumno",
        "Diccionario de sinonimos (papel o digital)"
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "10 min", "label": "Contraste texto narrativo vs descriptivo con ejemplos de Rulfo y Pacheco"},
        {"phase": "Desarrollo", "duration": "70 min", "label": "Proceso de escritura guiado: plan, borrador, revision entre pares"},
        {"phase": "Cierre", "duration": "20 min", "label": "Edicion final + reflexion sobre el proceso"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "10 min",
          "description": "El docente presenta dos fragmentos: uno narrativo (Nos han dado la tierra, Rulfo) y uno descriptivo (descripcion de un lugar por Jose Emilio Pacheco). El grupo identifica caracteristicas de cada uno: el narrativo cuenta, el descriptivo pinta. Pregunta: que quieres escribir tu: contar o pintar?",
          "activity": "Votacion rapida: cada alumno decide si escribira un texto descriptivo (retrato de lugar/persona) o narrativo (cuento o anecdota). El docente registra la distribucion y forma grupos de apoyo por tipo de texto."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "70 min",
          "description": "Proceso de escritura en 4 etapas guiadas: (1) Planificacion: mapa mental o esquema de 5 min. (2) Borrador: 20 min de escritura continua sin autocensura, el docente circula sin corregir. (3) Revision de contenido en parejas: checklist de estructura, coherencia, recursos literarios. (4) Edicion: cada autor revisa ortografia y puntuacion de su propio texto con diccionario disponible.",
          "activity": "Cada etapa tiene tiempo asignado y una senial del docente para avanzar. En la revision en parejas, el lector anota: 3 fortalezas del texto y 1 sugerencia de mejora. Solo sugerencias, no correcciones directas. El autor decide si incorpora o no la sugerencia."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "20 min",
          "description": "Lectura en voz alta de 3-4 textos voluntarios. El grupo comparte una observacion positiva por texto. Reflexion metacognitiva: cual etapa del proceso fue mas dificil, cual mas util. El docente explica que los escritores profesionales tambien escriben muchos borradores antes de publicar.",
          "activity": "Reflexion escrita en el portafolio: responder en 3 oraciones: que aprendi de mi proceso de escritura hoy, que cambiaria en mi proximo borrador. Esta reflexion metacognitiva es tan importante como el texto producido."
        }
      ]
    },
    "theory": {
      "introduction": "La escritura no es un don innato sino un proceso que se aprende y se practica. El enfoque de proceso (Donald Graves, 1983; Lucy Calkins, 1986) transformo la ensenanza de la escritura: en lugar de pedir un producto terminado desde el primer intento, el proceso de escritura reconoce que escribir bien implica planificar, borradorear, revisar y editar. Este enfoque es el que propone el MCCEMS para Lengua y Comunicacion, y es el que practican los grandes escritores mexicanos. Juan Rulfo reescribio Pedro Paramo durante anos. Elena Poniatowska revisaba sus textos multiples veces antes de publicarlos. La escritura creativa no es inspiracion repentina, es trabajo paciente y revision honesta.",
      "sections": [
        {
          "subtitle": "Texto Descriptivo vs Texto Narrativo",
          "content": "Texto descriptivo: presenta las caracteristicas de una persona, lugar, objeto o situacion de manera estatica o detallada. Responde a la pregunta: como es. Recursos: adjetivos precisos, comparaciones (simil, metafora), enumeracion, orden espacial (de lo general a lo particular o viceversa). Ejemplo: La descripcion de Comala en Pedro Paramo antes de que el narrador llegue. Texto narrativo: cuenta una sucesion de eventos con personajes, tiempo, lugar y conflicto. Responde a la pregunta: que paso. Estructura basica: situacion inicial — conflicto — desenlace. Recursos: verbos de accion, conectores temporales, dialogo, cambio de ritmo (aceleracion/desaceleracion narrativa). Muchos textos literarios combinan ambos modos: describir para ambientar, narrar para avanzar la historia."
        },
        {
          "subtitle": "El Proceso de Escritura",
          "content": "El proceso de escritura tiene cinco etapas que no son siempre lineales: (1) Preescritura/Planificacion: generar ideas (lluvia de ideas, mapa mental, preguntas de reportero: quien, que, cuando, donde, por que, como), definir audiencia y proposito, hacer un esquema basico. (2) Borrador: escribir sin autocensura, dejando fluir las ideas aunque no esten perfectas. El objetivo del borrador es tener material para trabajar. (3) Revision de contenido: releer con distancia critica, verificar si el texto dice lo que se queria decir, si hay coherencia, si faltan o sobran ideas. (4) Edicion: correccion de ortografia, puntuacion, gramatica, vocabulario. Esta etapa viene DESPUES de la revision de contenido, no antes. (5) Publicacion/Difusion: compartir el texto con una audiencia real (el grupo, la escuela, un blog, una antologia)."
        },
        {
          "subtitle": "Recursos Literarios Basicos",
          "content": "Los recursos literarios son estrategias del lenguaje que amplifican el efecto del texto. Para nivel bachillerato, son fundamentales: Simil: comparacion explicita con como o tal como. El cielo era rojo como brasa. Metafora: comparacion implicita, sin como. Sus manos eran ramas secas. Personificacion: atribuir caracteristicas humanas a cosas o animales. El viento se quejaba entre los arboles. Hiperbole: exageracion expresiva. Camine mil anos por ese llano. Sinestesia: mezcla de sensaciones de diferentes sentidos. Sus palabras tenian sabor a tierra. Aliteracion: repeticion de sonidos similares para crear ritmo o efecto. El susurro del sauce sobre el sucio suelo. Estos recursos estan presentes en Rulfo, Paz, Castellanos, y en la literatura oral mexicana (corridos, leyendas, coplas)."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "El proceso de escritura propone que la edicion (correccion ortografica y gramatical) debe hacerse:",
          "options": [
            "A) Antes de escribir el borrador, para no cometer errores.",
            "B) Despues de la revision de contenido, cuando el texto ya tiene su forma definitiva.",
            "C) Al mismo tiempo que se escribe el borrador, para no perder tiempo."
          ],
          "correct": "B) Despues de la revision de contenido, cuando el texto ya tiene su forma definitiva."
        },
        {
          "question": "El texto narrativo se distingue del descriptivo principalmente porque:",
          "options": [
            "A) Usa adjetivos y comparaciones para pintar una imagen estatica.",
            "B) Cuenta una sucesion de eventos con personajes, tiempo y conflicto.",
            "C) Argumenta y defiende una postura ante el lector."
          ],
          "correct": "B) Cuenta una sucesion de eventos con personajes, tiempo y conflicto."
        },
        {
          "question": "En el enunciado Sus manos eran ramas secas, que recurso literario se usa?",
          "options": [
            "A) Simil, porque compara con la palabra como.",
            "B) Metafora, porque compara de manera implicita sin usar como.",
            "C) Hiperbole, porque exagera las caracteristicas de las manos."
          ],
          "correct": "B) Metafora, porque compara de manera implicita sin usar como."
        },
        {
          "question": "La etapa de preescritura en el proceso de escritura incluye:",
          "options": [
            "A) Corregir la ortografia y puntuacion del borrador.",
            "B) Generar ideas, definir audiencia y elaborar un esquema basico.",
            "C) Compartir el texto terminado con una audiencia real."
          ],
          "correct": "B) Generar ideas, definir audiencia y elaborar un esquema basico."
        },
        {
          "question": "Cual es un ejemplo de sinestesia en literatura?",
          "options": [
            "A) El viento se quejaba entre los arboles.",
            "B) Sus palabras tenian sabor a tierra.",
            "C) Camine mil anos por ese llano."
          ],
          "correct": "B) Sus palabras tenian sabor a tierra."
        }
      ],
      "rubric": "RUBRICA — Texto descriptivo o narrativo de autoria propia (20 pts)\n\nAPLICACION DEL PROCESO (5 pts): 5=Evidencia de planificacion, borrador y revision claramente identificables | 4=Proceso parcialmente visible | 2=Solo producto final sin evidencia de proceso | 0=Sin proceso identificable\n\nUSO DE RECURSOS LITERARIOS (5 pts): 5=3+ recursos literarios usados de manera intencional y efectiva | 4=2 recursos identificables | 2=1 recurso con efecto limitado | 0=Sin recursos literarios\n\nCOHERENCIA Y ESTRUCTURA (5 pts): 5=Texto coherente con estructura clara (inicio-desarrollo-cierre) y conectores adecuados | 4=Estructura reconocible con algunos saltos | 2=Ideas presentes sin estructura clara | 0=Texto incoherente\n\nVOZ Y ESTILO PROPIOS (5 pts): 5=Voz personal reconocible, elecciones esteticas propias, no copia del texto modelo | 4=Voz presente con influencia del modelo | 2=Texto muy similar al modelo sin voz propia | 0=Sin voz ni estilo identificables"
    },
    "teacher_tips": [
      "La etapa de borrador es donde mas resistencia encuentras: los alumnos quieren escribir perfecto desde el primer momento. Normaliza la imperfeccion: muestra el primer borrador de un texto tuyo (o de un escritor famoso) para demostrar que nadie escribe bien a la primera.",
      "En la revision en parejas, el rol del lector es importante: debe reportar su experiencia como lector, no corregir como maestro. Ensenales a decir: como lector, me confundi aqui o me gusto este detalle, no: aqui esta mal.",
      "El simil vs la metafora es una confusion clasica. Usa una regla practica: si tiene como o parece, es simil. Si no tiene como pero dice que algo ES otra cosa, es metafora.",
      "Para alumnos con dificultad para elegir tema: proporciona una lista de detonadores creativos: un color que evoca un recuerdo, un olor de tu infancia, un lugar que ya no existe, una persona que ya no esta. Los detonadores sensoriales son los mas efectivos.",
      "Publicacion: aunque sea informal, crear una antologia del grupo (fotocopiada o digital) transforma la escritura escolar en escritura real. El saber que alguien leera el texto cambia la actitud del escritor hacia su propio trabajo."
    ]
  },
  "LC-II-P03": {
    "code": "LC-II-P03",
    "title": "Identifica caracteristicas linguisticas a partir de la lectura de narrativas populares.",
    "level": "Lengua y Comunicacion II",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Intermedio",
    "category": "Lectura",
    "metadata": {
      "objective": "El estudiante identifica caracteristicas linguisticas y literarias (voz narrativa, tiempo verbal, registro, recursos orales) en narrativas populares mexicanas, comprendiendo como el lenguaje construye el mundo del texto.",
      "competencies": [
        "Identifica la voz narrativa (1a, 2a, 3a persona) y sus efectos en la narracion",
        "Distingue el registro linguistico (formal, coloquial, regional) en textos narrativos populares",
        "Reconoce recursos propios de la oralidad en textos escritos: repeticion, exclamacion, refranes, variantes regionales",
        "Valora la riqueza lingustica de la narrativa popular mexicana como parte del patrimonio cultural"
      ],
      "materials": [
        "Leyendas populares mexicanas: La Llorona (version del centro), El Charro Negro, La Malinche (version popular), una leyenda regional de la comunidad",
        "Cuento corto de tradicion oral: El corrido del Rosillo (version narrativa)",
        "Tabla de analisis: voz narrativa, tiempo verbal, registro, recursos orales",
        "Mapa de Mexico con regiones y sus leyendas caracteristicas",
        "Grabacion de narracion oral en voz de narrador tradicional (YouTube o radio)"
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "15 min", "label": "Escucha de narracion oral de leyenda mexicana + identificacion de caracteristicas"},
        {"phase": "Desarrollo", "duration": "60 min", "label": "Lectura analitica de 2 narrativas populares con tabla comparativa"},
        {"phase": "Cierre", "duration": "25 min", "label": "Mapa de leyendas de Mexico + valoracion del patrimonio narrativo"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "15 min",
          "description": "El docente pone una grabacion o narra en voz alta una version de La Llorona o una leyenda local. Luego pregunta: quien habla en este relato, en que tiempo esta narrado, que palabras llaman la atencion por su forma o registro. Se introduce la idea de que las narrativas populares tienen caracteristicas linguisticas propias que las distinguen de la escritura formal.",
          "activity": "Lluvia de ideas rapida: los alumnos dicen todas las leyendas, cuentos o historias de miedo que conocen de su comunidad o familia. El docente lista en el pizarron. Pregunta: son estas historias iguales en todas partes de Mexico? Por que varian?"
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "60 min",
          "description": "Lectura analitica en equipos de 3 de dos narrativas populares distintas (una del centro, una del sur o norte). Cada equipo completa una tabla: voz narrativa (quien cuenta), tiempo verbal predominante (pasado/presente), registro (coloquial/formal/regional), recursos orales identificados (repeticiones, exclamaciones, refranes, invocaciones). Comparacion entre ambas narrativas: semejanzas y diferencias linguisticas.",
          "activity": "Tarea 1: Completar tabla de analisis linguistico de las dos narrativas asignadas. Tarea 2: Subrayar 5 expresiones que indiquen oralidad (por ejemplo: dicen que, cuentan los viejos, y es que, segun dicen). Tarea 3: Identificar una variante regional del espanol en el texto (una palabra o expresion caracteristica de la region de origen de la leyenda)."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "25 min",
          "description": "Presentacion de hallazgos por equipo: que caracteristicas linguisticas encontraron, que las hace diferentes de la narracion formal. Construccion colectiva de un mapa de leyendas de Mexico en el pizarron: cada equipo aporta una leyenda y la ubica geograficamente. Reflexion sobre el valor del patrimonio narrativo oral.",
          "activity": "Investigacion breve asignada para casa: preguntar a un familiar una historia, leyenda o cuento que recuerden de su comunidad o infancia. La siguiente clase se compartira como material de trabajo."
        }
      ]
    },
    "theory": {
      "introduction": "La narrativa popular es una de las expresiones culturales mas ricas y diversas de Mexico. Leyendas, corridos, cuentos de miedo, relatos de aparecidos, historias de santos y diablos forman un corpus narrativo vivo que se transmite oralmente de generacion en generacion. Este corpus tiene caracteristicas linguisticas propias que lo distinguen de la narracion literaria culta: presencia de oralidad, variantes regionales del espanol, formulas narrativas tradicionales, tiempos verbales mixtos, y referencias a la cosmogosia local. El INALI documenta que en Mexico existen 68 lenguas indigenas nacionales, muchas de las cuales tienen tradiciones narrativas orales igualmente ricas. El MCCEMS propone que el estudio de la narrativa popular sea un puente entre la lengua literaria formal y las expresiones culturales autenticas de los estudiantes.",
      "sections": [
        {
          "subtitle": "Voz Narrativa y Tiempo Verbal en la Narrativa Popular",
          "content": "La voz narrativa en las narraciones populares suele ser impersonal o en tercera persona (cuentan que, dicen que, se dice que). Esta voz colectiva e indefinida es caracteristica de la tradicion oral: no importa quien cuenta, la historia pertenece a todos. A veces se usa la segunda persona para involucrar al oyente: y tu ibas caminando cuando de repente... El tiempo verbal predominante en las leyendas es el imperfecto (habia, caminaba, venia) para establecer el marco, con irrupciones del preterito indefinido (aparecio, grito, desaparecio) en los momentos de accion. Este uso diferenciado de los tiempos crea el ritmo de la leyenda: fondo temporal imperfecto + evento abrupto en preterito. En algunos relatos del norte de Mexico, el presente historico aparece para dar vivacidad: y de repente la mujer se da vuelta y mira directo a los ojos del jinete."
        },
        {
          "subtitle": "Registro y Oralidad en la Narrativa Popular",
          "content": "El registro linguistico de la narrativa popular es predominantemente coloquial y regional. Las marcas de oralidad incluyen: Formulas de apertura: Dicen que, Cuentan los viejos que, Habia una vez que... Formulas de cierre: Y desde entonces, Y aqui termina el cuento, Si no lo creen, vayan y vean. Exclamaciones e interjecciones: Ay!, Mira tu!, Pos que paso, Andale. Repeticion con variacion (amplificacion narrativa): lloraba, lloraba y lloraba sin parar. Refranes y dichos populares integrados en la narracion. Variantes regionales: en Oaxaca se dice xicarilla por jicarilla, en el norte se usa ora por ahora, en Yucatan se dice merito por mismo. Diminutivos afectivos: lloroncita, pobrecita. El analisis de estas marcas permite al alumno comprender como el espanol mexicano es pluricentrico y diverso, no monolitico."
        },
        {
          "subtitle": "Las Grandes Leyendas Mexicanas: Contexto Cultural",
          "content": "Las leyendas mexicanas combinan elementos prehispanicos, coloniales y mestizos en narrativas complejas. La Llorona es quiza la mas extendida: aparece en toda Latinoamerica pero en Mexico tiene raices en Cihuacoatl, diosa azteca que lloraba de noche presagiando la conquista (segun el Codice Florentino, recopilado por Fray Bernardino de Sahagun). El Charro Negro es la representacion del diablo en forma de charro ricamente vestido, figura presente en los estados del Bajio. La leyenda de La Malinche (Doña Marina, Ce Malinalli) combina historia y mito: fue interprete de Hernan Cortes y figura controversial entre los mexicas. El Nahual, el Alux maya, el Pukuj chiapaneco, el Ahuizotl nahuatl: la diversidad de seres miticos mexicanos refleja la pluralidad cultural del pais. El INAH (Instituto Nacional de Antropologia e Historia) documenta estas tradiciones narrativas como patrimonio cultural inmaterial."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "La voz narrativa en expresiones como Dicen que o Cuentan los viejos que corresponde a:",
          "options": [
            "A) Primera persona del singular: el narrador es un personaje de la historia.",
            "B) Voz colectiva impersonal: caracteristica de la tradicion oral donde la historia pertenece a todos.",
            "C) Segunda persona: el narrador se dirige directamente al lector."
          ],
          "correct": "B) Voz colectiva impersonal: caracteristica de la tradicion oral donde la historia pertenece a todos."
        },
        {
          "question": "En las leyendas mexicanas, el uso del imperfecto (habia, caminaba) seguido del preterito indefinido (aparecio, grito) sirve para:",
          "options": [
            "A) Indicar que la historia ocurrio en el futuro.",
            "B) Establecer el fondo temporal y luego introducir el evento abrupto central.",
            "C) Demostrar que la historia es ficticia y no historica."
          ],
          "correct": "B) Establecer el fondo temporal y luego introducir el evento abrupto central."
        },
        {
          "question": "Que institucion mexicana documenta las tradiciones narrativas orales como patrimonio cultural inmaterial?",
          "options": [
            "A) INEGI",
            "B) INAH (Instituto Nacional de Antropologia e Historia)",
            "C) STPS"
          ],
          "correct": "B) INAH (Instituto Nacional de Antropologia e Historia)"
        },
        {
          "question": "Cual de las siguientes es una formula de cierre tipica en la narrativa popular mexicana?",
          "options": [
            "A) Habia una vez que...",
            "B) Y desde entonces...",
            "C) Cuentan los viejos que..."
          ],
          "correct": "B) Y desde entonces..."
        },
        {
          "question": "La figura de La Llorona en Mexico tiene raices prehispanicas vinculadas a:",
          "options": [
            "A) Quetzalcoatl, dios de la sabiduria y la creacion",
            "B) Cihuacoatl, diosa que lloraba de noche presagiando la conquista segun el Codice Florentino",
            "C) Tlaloc, dios de la lluvia y el agua"
          ],
          "correct": "B) Cihuacoatl, diosa que lloraba de noche presagiando la conquista segun el Codice Florentino"
        }
      ],
      "rubric": "RUBRICA — Analisis linguistico de narrativa popular (20 pts)\n\nIDENTIFICACION DE VOZ Y TIEMPO VERBAL (6 pts): 6=Identifica correctamente la voz narrativa y el uso de los tiempos verbales con ejemplos del texto | 4=Identificacion correcta con algun error en la justificacion | 2=Identificacion parcial sin ejemplos | 0=No identifica voz ni tiempo verbal\n\nANALISIS DE REGISTRO Y ORALIDAD (6 pts): 6=Identifica 4+ marcas de oralidad con ejemplos textuales y explica su efecto | 4=2-3 marcas identificadas | 2=1 marca con justificacion insuficiente | 0=No identifica marcas de oralidad\n\nCOMPARACION ENTRE NARRATIVAS (5 pts): 5=Establece semejanzas y diferencias linguisticas entre ambas narrativas con argumentacion clara | 4=Comparacion presente con argumentacion parcial | 2=Solo describe una narrativa sin comparar | 0=Sin comparacion\n\nVALORACION DEL PATRIMONIO (3 pts): 3=Reflexion critica sobre el valor cultural de las narrativas populares y su relacion con la identidad | 2=Mencion del valor cultural sin desarrollo | 0=Sin valoracion"
    },
    "teacher_tips": [
      "Pide a los alumnos que traigan la leyenda investigada en casa (la de un familiar) y usalas como material de analisis. Las leyendas reales de la comunidad son mas relevantes y motivadoras que las de libro de texto.",
      "El mapa de leyendas al final de la clase puede quedarse expuesto en el salon durante todo el semestre y ampliarse progresivamente. Es un artefacto cultural colectivo que pertenece al grupo.",
      "Para la variante regional: si tienes alumnos de distintos estados o de comunidades indigenas, sus expresiones linguisticas propias son material valiosisimo. Celebra la diversidad linguistica como riqueza, no como incorrecto.",
      "La diferencia imperfecto/preterito es uno de los errores mas persistentes en la escritura de los alumnos. Esta progresion es una oportunidad para trabajarla en contexto real (la leyenda) en lugar de ejercicios gramaticales aislados.",
      "Conexion con el INALI: puedes mostrar a los alumnos que el Instituto Nacional de Lenguas Indigenas tiene grabaciones de narrativas en lenguas nacionales en su portal. Escuchar una leyenda en nahuatl o zapoteco y compararla con la version en espanol es una experiencia de aprendizaje poderosa."
    ]
  },
  "LC-II-P04": {
    "code": "LC-II-P04",
    "title": "Comprende la relevancia de personajes y escenarios en la narrativa popular para integrarlos en sus propios escritos.",
    "level": "Lengua y Comunicacion II",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Intermedio",
    "category": "Lectura",
    "metadata": {
      "objective": "El estudiante analiza el papel de los personajes y los escenarios en las narrativas populares mexicanas, comprendiendo como estos elementos construyen el mundo del texto y aplicando ese analisis en la creacion de sus propios personajes y espacios narrativos.",
      "competencies": [
        "Distingue tipos de personajes en la narrativa: protagonista, antagonista, personaje secundario, personaje arquetipico",
        "Analiza la funcion del escenario en la narrativa: ambientacion, simbolismo, reflejo del conflicto",
        "Crea personajes y escenarios propios con caracteristicas coherentes y motivaciones claras",
        "Reconoce arquetipos de personajes en la literatura popular mexicana e hispanoamericana"
      ],
      "materials": [
        "Fragmentos de Juan Rulfo: Pedro Paramo (personaje de Juan Preciado y escenario de Comala), El Llano en llamas (El llano como escenario-personaje)",
        "Guia de creacion de personajes: nombre, edad, motivacion, miedo, contradiccion interna",
        "Imagenes de paisajes mexicanos representativos (llano jalisciense, sierra oaxaquena, costa veracruzana, volcanica)",
        "Ficha de personaje y ficha de escenario en blanco para completar",
        "Cartas de arquetipo (el heroe, el mentor, el embaucador, el guardian del umbral)"
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "15 min", "label": "Comala como escenario-personaje en Rulfo: el espacio que habla"},
        {"phase": "Desarrollo", "duration": "60 min", "label": "Analisis de personajes y escenarios + creacion de ficha propia"},
        {"phase": "Cierre", "duration": "25 min", "label": "Galeria de personajes del grupo: presentacion y retroalimentacion"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "15 min",
          "description": "El docente lee el inicio de Pedro Paramo: la descripcion de Comala y la llegada de Juan Preciado. Pregunta: Comala es solo el lugar donde ocurre la historia, o es algo mas? Los alumnos responden. Se introduce el concepto de escenario-personaje: un espacio con caracter propio que influye en los personajes y en el conflicto. Luego: quien es Juan Preciado como personaje?",
          "activity": "Collage rapido: cada alumno dibuja (o describe en palabras) como imagina Comala basandose solo en el texto de Rulfo. Se comparan las versiones: todas son validas porque el texto las permite. Esto ilustra que el escenario bien construido activa la imaginacion del lector."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "60 min",
          "description": "Presentacion de tipos de personajes: protagonista (quien enfrenta el conflicto principal), antagonista (quien se opone, puede ser persona, fuerza, sociedad o naturaleza), personajes secundarios (apoyan o complican la historia), arquetipos (el heroe, el mentor, el embaucador, la figura de la madre/padre). Analisis en equipos: identificar tipos de personajes en una leyenda o cuento asignado. Luego: creacion individual de un personaje y un escenario propios usando las fichas.",
          "activity": "Tarea 1: Analizar personajes de la narrativa asignada: clasificar y justificar con citas del texto. Tarea 2: Crear ficha de personaje propio: nombre, edad, motivacion (que quiere), miedo (que le impide lograrlo), contradiccion (en que se contradice). Tarea 3: Crear ficha de escenario: lugar real o imaginado, clima, objetos significativos, como refleja el conflicto del personaje."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "25 min",
          "description": "Galeria de personajes: cada alumno pega su ficha en la pared y el grupo circula leyendo. Se usan notas adhesivas para dejar comentarios positivos y preguntas (no criticas negativas). Al terminar, los autores leen las notas y deciden si ampliaran su ficha. El docente pregunta: que personaje del grupo te gustaria leer en una historia?",
          "activity": "Reflexion final: el alumno escribe en 3 oraciones por que eligio esos rasgos para su personaje y su escenario. Esta reflexion revela las referencias culturales y experiencias personales que informan la creacion literaria."
        }
      ]
    },
    "theory": {
      "introduction": "El personaje y el escenario son dos de los elementos constructivos fundamentales de la narrativa. En la tradicion literaria mexicana, Juan Rulfo elevo ambos a una dimension casi mitica: Comala en Pedro Paramo no es simplemente el lugar donde transcurre la novela, es un pueblo de muertos, un espacio liminal entre la vida y la muerte, una alegoria de Mexico mismo. El llano en El Llano en llamas es un personaje colectivo que oprime y define a sus habitantes. Este uso simbolico del escenario es una ensenanza central de la literatura mexicana que el alumno puede incorporar en su propia escritura.",
      "sections": [
        {
          "subtitle": "Tipos de Personajes en la Narrativa",
          "content": "Los personajes narrativos pueden clasificarse segun su funcion: Protagonista: el personaje central que enfrenta el conflicto principal y cuya transformacion (o fracaso de transformacion) es el eje de la historia. En Pedro Paramo, Juan Preciado es el protagonista inicial. Antagonista: la fuerza que se opone al protagonista. Puede ser otro personaje, la sociedad, la naturaleza, o incluso el mismo protagonista consigo mismo. En muchas leyendas mexicanas, el antagonista es lo sobrenatural. Personajes secundarios: ayudan u obstaculizan al protagonista, aportan informacion, crean subtramas. Arquetipos junguianos en la literatura: El Heroe (emprende un viaje de transformacion), El Mentor (guia al heroe: la abuela que sabe, el curandero), El Embaucador (el Coyote en las tradiciones mesoamericanas, el diablo en las leyendas coloniales), La Sombra (el doble oscuro del protagonista). Los personajes mas interesantes tienen contradicciones internas: quieren algo pero hacen algo distinto, o tienen un miedo que los paraliza justo cuando mas necesitan actuar."
        },
        {
          "subtitle": "El Escenario como Elemento Narrativo",
          "content": "El escenario no es solo el decorado donde ocurre la accion: es un elemento activo de la narrativa que: (1) Ubica temporal y espacialmente la historia (verosimilitud). (2) Crea la atmosfera emocional del texto (ambientacion). (3) Refleja o contrasta con el estado interno de los personajes (espejo psicologico). (4) Funciona como personaje cuando tiene caracter propio y agencia en la historia. En la narrativa mexicana, los escenarios tienen especial peso cultural: el llano jalisciense de Rulfo, la selva lacandona de Bruno Traven, el barrio de Tepito en la narrativa urbana de los 70, el Oaxaca de Rosario Castellanos, los pueblos magicos en la literatura contemporanea. El escenario bien construido responde a preguntas como: que objetos hay y que significan, como es la luz y el sonido, que recuerda al personaje ese lugar, que dice el lugar sobre la epoca y la clase social."
        },
        {
          "subtitle": "Arquetipos en la Narrativa Popular Mexicana",
          "content": "Los arquetipos son patrones de personajes universales que aparecen en todas las culturas. En la narrativa popular mexicana tienen versiones propias: El Heroe: el hijo del campesino que sale a buscar fortuna o justicia (Juan sin Miedo, Juan el Oso en cuentos populares); la soldadera de la Revolucion Mexicana. El Mentor: el abuelo que sabe, el curandero del pueblo, el maestro rural (figura idealizada en el muralismo de Diego Rivera y en los Maestros Misioneros del cardenismo). El Embaucador (Trickster): el Conejo en las fabulas nahuas, el Coyote en tradiciones del norte, la Muerte burlada en los corridos. La Madre Terrible/Protectora: La Llorona (terrible), La Virgen de Guadalupe (protectora): dos caras del arquetipo materno en el imaginario mexicano. Reconocer estos arquetipos en los textos que leen y en los que escriben desarrolla la competencia intertextual y la conciencia cultural del alumno."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "En la narrativa de Juan Rulfo, Comala funciona como:",
          "options": [
            "A) Un simple escenario geografico donde transcurre la historia sin mayor relevancia.",
            "B) Un escenario-personaje con caracter propio: pueblo de muertos que simboliza Mexico y el pasado que no termina.",
            "C) Un escenario historico basado en un pueblo real de Jalisco documentado por el INAH."
          ],
          "correct": "B) Un escenario-personaje con caracter propio: pueblo de muertos que simboliza Mexico y el pasado que no termina."
        },
        {
          "question": "El arquetipo del Embaucador (Trickster) en las tradiciones narrativas del norte de Mexico es representado por:",
          "options": [
            "A) La Virgen de Guadalupe",
            "B) El Coyote",
            "C) El Quetzal"
          ],
          "correct": "B) El Coyote"
        },
        {
          "question": "Que distingue a un antagonista de un personaje secundario en la narrativa?",
          "options": [
            "A) El antagonista siempre es un ser sobrenatural o malvado.",
            "B) El antagonista es la fuerza que se opone al protagonista; el secundario apoya u obstaculiza sin ser el oponente principal.",
            "C) El antagonista es el personaje mas importante de la historia despues del protagonista."
          ],
          "correct": "B) El antagonista es la fuerza que se opone al protagonista; el secundario apoya u obstaculiza sin ser el oponente principal."
        },
        {
          "question": "Un personaje con contradiccion interna es aquel que:",
          "options": [
            "A) Tiene dos nombres distintos en la misma historia.",
            "B) Quiere algo pero hace algo distinto, o tiene un miedo que lo paraliza justo cuando mas necesita actuar.",
            "C) Aparece en dos o mas historias diferentes del mismo autor."
          ],
          "correct": "B) Quiere algo pero hace algo distinto, o tiene un miedo que lo paraliza justo cuando mas necesita actuar."
        },
        {
          "question": "En el imaginario mexicano, La Llorona y La Virgen de Guadalupe representan:",
          "options": [
            "A) Las dos fundadoras del Imperio Azteca.",
            "B) Las dos caras del arquetipo materno: la madre terrible y la madre protectora.",
            "C) Personajes historicos documentados en el Codice Mendoza."
          ],
          "correct": "B) Las dos caras del arquetipo materno: la madre terrible y la madre protectora."
        }
      ],
      "rubric": "RUBRICA — Ficha de personaje y escenario + analisis (20 pts)\n\nANALISIS DE PERSONAJES DEL TEXTO (6 pts): 6=Clasifica correctamente protagonista, antagonista, arquetipos con citas textuales y justificacion | 4=Clasificacion correcta con justificacion parcial | 2=Clasificacion sin justificacion textual | 0=Sin analisis de personajes\n\nFICHA DE PERSONAJE PROPIO (7 pts): 7=Personaje con nombre, motivacion clara, miedo y contradiccion interna coherentes y originales | 5=Personaje con motivacion y miedo sin contradiccion | 3=Personaje basico sin profundidad psicologica | 0=Sin ficha de personaje\n\nFICHA DE ESCENARIO (4 pts): 4=Escenario con objetos significativos, atmosfera y conexion con el conflicto del personaje | 3=Escenario descrito con algunos elementos simbolicos | 2=Descripcion de lugar sin funcion narrativa | 0=Sin ficha de escenario\n\nCONEXION CULTURAL (3 pts): 3=El personaje y escenario propios tienen referentes culturales mexicanos identificables | 2=Referentes culturales presentes pero superficiales | 0=Sin referentes culturales"
    },
    "teacher_tips": [
      "La ficha de personaje es una herramienta que los escritores profesionales usan. Puedes mostrar a los alumnos que autores como Gabriel Garcia Marquez o Carlos Fuentes mantenian notas de sus personajes antes de escribir las novelas. Esto desmitifica el proceso creativo.",
      "Para la galeria de personajes, el formato de Post-it de comentarios funciona mejor que la evaluacion verbal publica: los alumnos leen los comentarios en su propio ritmo y deciden si los incorporan. Reduce la ansiedad de la critica frente al grupo.",
      "La contradiccion interna es el elemento mas dificil de desarrollar pero el que hace a los personajes memorables. Da ejemplos de la vida real: conocemos personas que dicen que quieren cambiar pero siguen en los mismos patrones. Esa tension es narrativamente rica.",
      "Conexion con el muralismo: los murales de Rivera, Orozco y Siqueiros en la SEP y Palacio Nacional son narrativas visuales llenas de personajes arquetipicos mexicanos. Si puedes proyectar imagenes de los murales, usaralos para identificar arquetipos visualmente.",
      "Atencion a la apropiacion cultural: si un alumno de comunidad indigena crea personajes o escenarios de su tradicion propia, eso es valioso y debe celebrarse. Si un alumno externo a esa tradicion quiere usarla, es momento de hablar de diferencia entre influencia y apropiacion irrespetuosa."
    ]
  },
  "LC-II-P05": {
    "code": "LC-II-P05",
    "title": "Distingue los temas y las ideas centrales y secundarias en las narrativas populares.",
    "level": "Lengua y Comunicacion II",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Intermedio",
    "category": "Lectura",
    "metadata": {
      "objective": "El estudiante distingue el tema central y las ideas secundarias en narrativas populares mexicanas usando estrategias de comprension lectora (subrayado, mapa de ideas, jerarquizacion), desarrollando su capacidad critica para interpretar textos literarios.",
      "competencies": [
        "Identifica el tema central de una narracion y lo distingue del asunto superficial",
        "Jerarquiza ideas: distingue lo central de lo secundario, lo explicito de lo implicito",
        "Usa estrategias de comprension lectora: subrayado, mapa de ideas, pregunta al texto",
        "Interpreta temas en clave cultural: que dice la leyenda sobre los valores de la comunidad que la genero"
      ],
      "materials": [
        "Leyenda completa de mediana extension: El Sombrero del Diablo, La Serpiente Emplumada (version popular), o una leyenda local significativa",
        "Cuento corto de Juan Rulfo: Nos han dado la tierra",
        "Guia de comprension lectora: antes, durante y despues de la lectura",
        "Mapa de ideas en blanco: tema central + 3-4 ideas secundarias",
        "Tabla: tema explicito vs tema implicito"
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "15 min", "label": "Activacion de conocimientos + diferencia asunto/tema con ejemplo comun"},
        {"phase": "Desarrollo", "duration": "60 min", "label": "Lectura analitica guiada + mapa de ideas + interpretacion critica"},
        {"phase": "Cierre", "duration": "25 min", "label": "Debate: que critica social hace Nos han dado la tierra?"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "15 min",
          "description": "El docente presenta la diferencia entre asunto y tema con un ejemplo cotidiano: asunto (de que trata): un muchacho busca a su padre muerto; tema (de que habla realmente): la herencia de la violencia, el peso del pasado, la busqueda de identidad. Se trabaja con Pedro Paramo para ilustrar: el asunto es la llegada a Comala, el tema es la muerte que permea todo lo vivo.",
          "activity": "Ejercicio de calentamiento: el docente presenta 3 asuntos de cuentos conocidos y los alumnos proponen el tema en cada uno. Por ejemplo: asunto: una mujer llora buscando a sus hijos; tema posible: el dolor maternal, el castigo por la ambicion, el abandono de los hijos. No hay una sola respuesta correcta: la literatura admite multiples interpretaciones validas."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "60 min",
          "description": "Lectura guiada de Nos han dado la tierra (Rulfo) usando la estrategia antes-durante-despues. Antes: activar conocimientos sobre la Reforma Agraria en Mexico (Cardenas, reparto de tierras, ejidos). Durante: subrayar en tres colores: rojo (personajes y acciones), azul (descripciones del ambiente), verde (dialogo o reflexion de los personajes). Despues: construir el mapa de ideas con tema central + ideas secundarias.",
          "activity": "Tarea 1: Subrayado con tres colores durante la lectura. Tarea 2: Mapa de ideas: tema central del cuento y 3-4 ideas secundarias con citas textuales. Tarea 3: Responder en un parrafo: que critica social hace Rulfo en este cuento? A quien critica? Que dice sobre la justicia en Mexico?"
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "25 min",
          "description": "Debate estructurado: el docente presenta la tesis de que Nos han dado la tierra es una critica a la Reforma Agraria que prometio tierras fertiles pero entrego llanos esteriles. Los alumnos buscan evidencia en el texto para argumentar a favor o en contra. Se conecta con la historia de Mexico: el ejido cardenista, la contrarreforma de 1992, la situacion actual del campo mexicano.",
          "activity": "Reflexion escrita: en 3 oraciones, el alumno responde: este cuento sigue siendo relevante hoy en Mexico? Por que? Esta reflexion conecta la literatura con la realidad historica y social contemporanea."
        }
      ]
    },
    "theory": {
      "introduction": "La comprension lectora de textos literarios va mas alla de identificar que pasa en una historia: implica distinguir el tema profundo del asunto superficial, jerarquizar ideas, reconocer lo que el texto dice y lo que implica. Esta competencia es fundamental en el nivel bachillerato y es evaluada en la prueba PLANEA de la SEP. La narrativa popular mexicana ofrece textos ricos para desarrollar estas habilidades: las leyendas tienen temas implicitos sobre valores culturales, miedos colectivos y formas de explicar el mundo. Los cuentos de Rulfo, aparentemente simples en su argumento, ocultan capas de critica social y simbolismo.",
      "sections": [
        {
          "subtitle": "Asunto vs Tema: Una Distincion Fundamental",
          "content": "El asunto es el contenido literal, superficial, de que trata el texto: los personajes, las acciones, el escenario. El tema es el concepto abstracto que el texto explora a traves de ese asunto: la injusticia, la memoria, el amor prohibido, la identidad. Un mismo asunto puede tener multiples temas posibles segun la interpretacion. Ejemplos mexicanos: Asunto de No oyes ladrar los perros (Rulfo): un hombre carga a su hijo herido de bala en busca de un medico. Tema: la ruptura del vinculo padre-hijo, el amor que se acaba pero no termina, la violencia como herencia. Asunto de La Llorona: una mujer llora por sus hijos muertos. Temas posibles: el castigo del abandono, el dolor del duelo materno, el miedo a la madre castrante, la colonizacion (si se interpreta en clave de la conquista). El tema implicito es el que el autor no dice directamente pero que el texto construye a traves del lenguaje, los simbolos y la estructura."
        },
        {
          "subtitle": "Estrategias de Comprension Lectora",
          "content": "La lectura analitica de textos literarios requiere estrategias especificas: Antes de leer: activar conocimientos previos (que se sobre el autor, la epoca, el contexto cultural), establecer un proposito de lectura (que voy a buscar en el texto), hacer predicciones basadas en el titulo y el primer parrafo. Durante la lectura: subrayar elementos relevantes segun la tarea (personajes, descripciones, dialogos), hacer anotaciones marginales (preguntas al texto, conexiones con experiencias propias, palabras clave), identificar el momento de giro o climax narrativo. Despues de la lectura: construir mapa de ideas (jerarquizar lo central y lo secundario), responder preguntas literales (lo que el texto dice) e inferenciales (lo que el texto implica), conectar el texto con su contexto historico y cultural. La estrategia de pregunta al texto es especialmente poderosa: no es buscar respuestas en el texto, sino formular preguntas que el texto suscita. Un buen texto literario no cierra preguntas, las abre."
        },
        {
          "subtitle": "Nos han dado la tierra: Contexto Historico y Critica Social",
          "content": "Nos han dado la tierra es el tercer cuento de El Llano en llamas (Juan Rulfo, 1953). Narra en primera persona el regreso de cuatro campesinos que recibieron tierras como parte de la Reforma Agraria cardenista (1934-1940). Pero las tierras son el llano: una planicie esteril, sin agua, sin posibilidad de cultivo. La ironia es brutal: les dieron tierra, pero no la tierra que necesitaban. El cuento es una critica velada a la implementacion de la Reforma Agraria: las promesas del Estado posrevolucionario chocaban con la realidad de tierras improductivas entregadas a campesinos sin recursos. Cardenas repartio 18 millones de hectareas entre 1934 y 1940 (mas que ningún gobierno anterior), pero la calidad y los servicios de apoyo fueron inconsistentes. La frase final del cuento, uno de los personajes lleva una gallina: es el unico ser vivo en ese desierto, ironia tragica de lo que la Reforma Agraria les dio realmente."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "En el cuento Nos han dado la tierra de Juan Rulfo, cual es el tema central implicito?",
          "options": [
            "A) La descripcion geografica del llano jalisciense en epoca de sequia.",
            "B) La critica a la implementacion de la Reforma Agraria: las promesas del Estado vs la realidad esteril entregada a los campesinos.",
            "C) La historia de cuatro amigos que hacen un viaje por el campo mexicano."
          ],
          "correct": "B) La critica a la implementacion de la Reforma Agraria: las promesas del Estado vs la realidad esteril entregada a los campesinos."
        },
        {
          "question": "Cual es la diferencia entre el asunto y el tema de un texto literario?",
          "options": [
            "A) El asunto es lo que el texto dice explicitamente; el tema es el concepto abstracto que explora a traves del asunto.",
            "B) El asunto es mas importante que el tema para entender la literatura.",
            "C) El asunto y el tema son sinonimos en el analisis literario."
          ],
          "correct": "A) El asunto es lo que el texto dice explicitamente; el tema es el concepto abstracto que explora a traves del asunto."
        },
        {
          "question": "La estrategia de antes-durante-despues de la lectura sirve para:",
          "options": [
            "A) Dividir el texto en tres partes iguales para facilitar su resumen.",
            "B) Activar conocimientos previos, hacer anotaciones analiticas durante la lectura y construir interpretaciones despues.",
            "C) Identificar el principio, el climax y el final del texto narrativo."
          ],
          "correct": "B) Activar conocimientos previos, hacer anotaciones analiticas durante la lectura y construir interpretaciones despues."
        },
        {
          "question": "Durante la presidencia de Lazaro Cardenas (1934-1940), aproximadamente cuantas hectareas se repartieron en la Reforma Agraria?",
          "options": [
            "A) 2 millones de hectareas",
            "B) 18 millones de hectareas",
            "C) 50 millones de hectareas"
          ],
          "correct": "B) 18 millones de hectareas"
        },
        {
          "question": "Una interpretacion implicita de La Llorona en clave de la conquista de Mexico seria:",
          "options": [
            "A) La Llorona es una mujer real del siglo XVI documentada en archivos coloniales.",
            "B) La Llorona representa el llanto de Mexico ante la perdida de su civilizacion por la conquista espanola.",
            "C) La Llorona es solo un cuento de miedo sin contenido cultural relevante."
          ],
          "correct": "B) La Llorona representa el llanto de Mexico ante la perdida de su civilizacion por la conquista espanola."
        }
      ],
      "rubric": "RUBRICA — Mapa de ideas + analisis critico (20 pts)\n\nIDENTIFICACION DE ASUNTO Y TEMA (6 pts): 6=Distingue claramente asunto y tema con argumentacion textual y critica | 4=Identifica ambos con argumentacion parcial | 2=Identifica uno de los dos con confusion entre ellos | 0=No distingue asunto de tema\n\nJERARQUIZACION DE IDEAS (5 pts): 5=Mapa de ideas con tema central y 3+ ideas secundarias jerarquizadas con citas del texto | 4=Mapa correcto con jerarquizacion parcial | 2=Ideas presentes sin jerarquizacion clara | 0=Sin mapa de ideas\n\nINTERPRETACION CRITICA (6 pts): 6=Interpreta el tema en clave cultural e historica con argumentos solidos y ejemplos del texto | 4=Interpretacion presente con argumentacion limitada | 2=Descripcion del texto sin interpretacion critica | 0=Sin interpretacion\n\nCONEXION HISTORICO-CULTURAL (3 pts): 3=Conecta el texto con su contexto historico mexicano de manera pertinente y precisa | 2=Mencion del contexto sin desarrollo | 0=Sin conexion historica"
    },
    "teacher_tips": [
      "La diferencia asunto/tema es una de las mas dificiles de consolidar. Un ejercicio util: pregunta que paso y lo que el alumno responde es el asunto. Luego pregunta de que HABLA REALMENTE este cuento y lo que responde es el camino al tema. Entrena esa segunda pregunta.",
      "Para Nos han dado la tierra, la activacion del contexto historico (Reforma Agraria cardenista) es imprescindible. Sin ese contexto, el cuento pierde mitad de su poder critico. Dedica 5 minutos a contextualizar antes de la lectura.",
      "El subrayado en tres colores no solo es una tecnica de estudio: entrena al alumno a leer con proposito y a distinguir tipos de informacion. Puede usarse en cualquier texto del semestre y transferirse a otras materias.",
      "Para el debate sobre si el cuento sigue siendo relevante: conecta con la situacion del campo mexicano hoy. El INEGI y la SAGARPA tienen datos sobre la produccion agricola en los estados donde Rulfo situa sus historias (Jalisco, Nayarit). La realidad del llano no ha cambiado tanto.",
      "Atencion al espoiler: si algunos alumnos ya conocen el final del cuento, pedirles que focalicen en el tema en lugar del argumento los mantiene comprometidos con la lectura analitica."
    ]
  },
  "LC-II-P06": {
    "code": "LC-II-P06",
    "title": "Reescribe un texto para integrar los elementos linguisticos y narrativos que considere pertinentes.",
    "level": "Lengua y Comunicacion II",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Intermedio",
    "category": "Escritura",
    "metadata": {
      "objective": "El estudiante reescribe una narrativa popular mexicana integrando elementos linguisticos y narrativos aprendidos (cambio de voz narrativa, actualizacion del escenario, incorporacion de recursos literarios), desarrollando la intertextualidad como herramienta creativa.",
      "competencies": [
        "Reescribe un texto modificando la voz narrativa, el escenario o el tiempo sin perder la esencia del original",
        "Integra recursos literarios (metafora, simil, personificacion) de manera intencional en la reescritura",
        "Usa la intertextualidad como estrategia creativa: dialogar con textos previos para crear textos nuevos",
        "Reconoce que la reescritura es una practica literaria legitima y valorada en la tradicion mexicana"
      ],
      "materials": [
        "Version impresa de una leyenda o cuento corto para reescribir (La Llorona, un corrido narrativo, Nos han dado la tierra)",
        "Lista de posibilidades de transformacion: cambio de voz, cambio de epoca, cambio de perspectiva de personaje, cambio de escenario, actualizacion del lenguaje",
        "Ejemplos de reescrituras en la literatura: las versiones de Elena Poniatowska sobre textos coloniales, los corridos contemporaneos basados en leyendas",
        "Guia de revision: checklist de elementos narrativos integrados",
        "Diccionario de sinonimos y recursos estilisiticos"
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "15 min", "label": "La reescritura como practica literaria: ejemplos de intertextualidad"},
        {"phase": "Desarrollo", "duration": "70 min", "label": "Seleccion de estrategia de reescritura + borrador + revision con checklist"},
        {"phase": "Cierre", "duration": "15 min", "label": "Comparacion texto original vs reescritura: que cambio y por que"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "15 min",
          "description": "El docente presenta el concepto de intertextualidad: todo texto dialoga con textos anteriores. Ejemplos: los corridos modernos reescriben tradiciones del siglo XIX, las novelas de Carlos Fuentes reescriben episodios de la Conquista, los poemas de Paz reinterpretan mitos aztecas. Nadie escribe desde cero: escribimos desde lo que hemos leido y vivido.",
          "activity": "El docente lee dos versiones de La Llorona: una traditional y una contemporanea feminista que la reinterpreta como victima del abandono masculino. El grupo debate: cual version les parece mas poderosa y por que. Ambas son validas: la reescritura no destruye el original, lo enriquece."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "70 min",
          "description": "Cada alumno selecciona una estrategia de transformacion del texto original: (1) Cambio de voz narrativa: contar la historia desde la perspectiva del antagonista o de un personaje secundario. (2) Cambio de escenario: la misma historia en un contexto urbano contemporaneo. (3) Cambio de epoca: la historia en el presente (La Llorona en las calles de CDMX). (4) Actualizacion del lenguaje: traducir la leyenda al registro coloquial juvenil. (5) Combinacion: mezcla de dos o mas estrategias. Borrador: 200-250 palabras. Revision con checklist: voz coherente, recursos literarios integrados, esencia del original preservada.",
          "activity": "Tarea 1: Anotar la estrategia elegida y justificar por que la eligieron (2 oraciones). Tarea 2: Borrador de reescritura 200-250 palabras. Tarea 3: Autochecklist: verificar que la voz es coherente, que hay al menos 2 recursos literarios, que la esencia del texto original se preserva aunque la forma cambie."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "15 min",
          "description": "Comparacion en parejas: cada alumno lee el original y la reescritura de su companero. Identifica: que cambio, que se preservo, que recurso literario aparece en la reescritura que no estaba en el original. El docente pregunta: puede una reescritura ser mejor que el original? Se discute brevemente con ejemplos literarios.",
          "activity": "Reflexion final: cada alumno escribe en 2 oraciones que aprendio sobre su propio estilo al reescribir el texto de otro. La reescritura como espejo del propio proceso creativo."
        }
      ]
    },
    "theory": {
      "introduction": "La reescritura es una practica literaria con larga tradicion. Desde los poetas latinoamericanos que reinterpretan a los clasicos griegos hasta los corridos que actualizan leyendas coloniales, la intertextualidad es el tejido del que esta hecha la literatura. Julia Kristeva (1969) definio la intertextualidad como la relacion de un texto con otros textos anteriores: todo texto es una absorcion y transformacion de otro. En Mexico, esta practica es especialmente rica: Carlos Fuentes reescribe la historia de la Conquista en La muerte de Artemio Cruz; Elena Poniatowska reescribe el 68 en La noche de Tlatelolco; los poetas del grupo Infrrealista (entre ellos Roberto Bolano) reescriben el surrealismo latinoamericano con ironia posmoderna. La reescritura no es plagio: es dialogo creativo.",
      "sections": [
        {
          "subtitle": "Estrategias de Reescritura",
          "content": "Existen multiples estrategias de reescritura creativa que el alumno puede aplicar: (1) Cambio de punto de vista/voz narrativa: contar la historia desde la perspectiva de un personaje diferente. La Llorona narrada por el hombre que la abandono cambia radicalmente el sentido moral de la historia. (2) Actualizacion del escenario: transportar la historia a un contexto contemporaneo. Nos han dado la tierra ambientado en el conflicto por la tierra en comunidades indigenas actuales (zapatismo, EZLN). (3) Expansion de escenas secundarias: tomar un momento brevemente mencionado en el original y desarrollarlo como historia central. (4) Continuacion o prequel: narrar lo que paso antes o despues del texto original. (5) Cambio de genero o registro: convertir una leyenda solemne en un corrido humoriistico, o un cuento coloquial en texto literario formal. (6) Fusion de textos: combinar elementos de dos narrativas distintas en una nueva."
        },
        {
          "subtitle": "Intertextualidad en la Literatura Mexicana",
          "content": "La literatura mexicana esta construida sobre capas de intertextualidad. Octavio Paz en Piedra de sol (1957) usa el calendario azteca (Venus, 584 dias) como estructura del poema: cada vez que se termina de leer el poema, se vuelve al principio, igual que el ciclo de Venus. Carlos Fuentes en La region mas transparente (1958) reescribe el mito de Quetzalcoatl en clave del Mexico moderno. Juan Rulfo fue a su vez reescrito: Pedro Paramo influyo profundamente en Gabriel Garcia Marquez (Cien anos de soledad), en Carlos Fuentes, en toda la narrativa latinoamericana del Boom. Elena Poniatowska en La noche de Tlatelolco (1971) toma testimonios reales y los transforma en texto literario colectivo. La FIL de Guadalajara (Feria Internacional del Libro, la mayor feria del libro en espanol) celebra esta tradicion intertextual cada noviembre con debates sobre traduccion, reescritura y tradicion literaria."
        },
        {
          "subtitle": "La Reescritura como Herramienta Pedagogica",
          "content": "Desde la perspectiva de la ensenanza de la escritura, la reescritura tiene ventajas importantes: reduce la ansiedad de la hoja en blanco (no hay que inventar todo desde cero), permite focalizar en elementos especificos (voz, recursos, estructura) sin preocuparse por el argumento, y desarrolla la lectura activa (para reescribir bien hay que haber leido muy bien el original). Para el alumno de bachillerato, la reescritura tambien es un ejercicio de pensamiento critico: al cambiar la voz narrativa de La Llorona o al actualizar el escenario de Nos han dado la tierra, el alumno no solo practica tecnicas literarias sino que interroga los supuestos del texto original: desde quien se cuenta, a quien, con que proposito. La reescritura literaria es, en este sentido, una forma de lectura critica que produce texto."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "La intertextualidad, segun Julia Kristeva, es:",
          "options": [
            "A) El plagio de un texto por parte de otro autor.",
            "B) La relacion de un texto con otros textos anteriores: todo texto es absorcion y transformacion de otro.",
            "C) La traduccion de un texto literario de un idioma a otro."
          ],
          "correct": "B) La relacion de un texto con otros textos anteriores: todo texto es absorcion y transformacion de otro."
        },
        {
          "question": "En Piedra de sol, Octavio Paz usa como estructura intertextual:",
          "options": [
            "A) El corrido revolucionario mexicano del siglo XIX",
            "B) El calendario azteca de Venus (584 dias), cuyo ciclo estructura el poema",
            "C) La estructura de la novela picaresca espanola del Siglo de Oro"
          ],
          "correct": "B) El calendario azteca de Venus (584 dias), cuyo ciclo estructura el poema"
        },
        {
          "question": "Reescribir La Llorona desde la perspectiva del hombre que la abandono es un ejemplo de:",
          "options": [
            "A) Cambio de escenario al contexto contemporaneo",
            "B) Cambio de punto de vista o voz narrativa",
            "C) Fusion de dos textos distintos en uno nuevo"
          ],
          "correct": "B) Cambio de punto de vista o voz narrativa"
        },
        {
          "question": "Que ventaja pedagogica tiene la reescritura sobre la escritura totalmente libre?",
          "options": [
            "A) Es mas facil porque no requiere creatividad ni pensamiento critico.",
            "B) Reduce la ansiedad de la hoja en blanco y permite focalizar en elementos especificos sin preocuparse por el argumento.",
            "C) Es superior porque los textos reescritos son siempre mejores que los originales."
          ],
          "correct": "B) Reduce la ansiedad de la hoja en blanco y permite focalizar en elementos especificos sin preocuparse por el argumento."
        },
        {
          "question": "Cual autor mexicano fue a su vez reescrito e influyo profundamente en Gabriel Garcia Marquez y el Boom latinoamericano?",
          "options": [
            "A) Carlos Fuentes",
            "B) Juan Rulfo",
            "C) Octavio Paz"
          ],
          "correct": "B) Juan Rulfo"
        }
      ],
      "rubric": "RUBRICA — Reescritura narrativa (20 pts)\n\nESTRATEGIA DE TRANSFORMACION (5 pts): 5=La estrategia elegida es clara, coherente y se mantiene a lo largo del texto | 4=Estrategia identificable con algunas inconsistencias | 2=Estrategia apenas perceptible | 0=Sin transformacion identificable respecto al original\n\nINTEGRACION DE RECURSOS LITERARIOS (5 pts): 5=3+ recursos literarios integrados de manera intencional y efectiva | 4=2 recursos integrados | 2=1 recurso con efecto limitado | 0=Sin recursos literarios\n\nPRESERVACION DE LA ESENCIA (5 pts): 5=La reescritura dialoga claramente con el original sin ser una copia | 4=Dialogo reconocible con el original | 2=La conexion con el original es tenue | 0=Sin relacion reconocible con el texto original\n\nVOZ Y COHERENCIA (5 pts): 5=Voz narrativa coherente a lo largo del texto, sin cambios injustificados | 4=Voz coherente con algun desvio | 2=Voz inconsistente que dificulta la lectura | 0=Sin voz narrativa clara"
    },
    "teacher_tips": [
      "Antes de pedir la reescritura, asegurate de que todos los alumnos conocen bien el texto original. Una reescritura pobre suele indicar una lectura superficial del original, no falta de creatividad.",
      "La estrategia de cambio de voz narrativa (contar desde el antagonista) es la mas popular y tambien la que produce los textos mas interesantes. Es una forma natural de empatia literaria: entender al que uno temia o desaprobaba.",
      "Para evitar el plagio encubierto: pide que la reescritura sea claramente diferente (nuevo punto de vista, nuevo escenario o nueva epoca). Si un alumno solo cambia algunos adjetivos, no es reescritura sino copia. Define esto con claridad antes de la actividad.",
      "La comparacion final entre original y reescritura puede hacerse en formato teatral: un alumno lee el original en voz alta mientras otro lee su reescritura en voz alta simultaneamente o alternando fragmentos. El contraste es poderoso y revela las elecciones creativas.",
      "Conexion con la musica: los corridos son reescrituras constantes. Muchos corridos modernos retoman leyendas o historias previas. Puedes pedir a los alumnos que identifiquen un corrido actual que sea una reescritura de una historia popular mas antigua."
    ]
  },
  "LC-II-P07": {
    "code": "LC-II-P07",
    "title": "Colabora en el analisis de textos para conocer, aprovechar o corregir los procedimientos narrativos.",
    "level": "Lengua y Comunicacion II",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Intermedio",
    "category": "Lectura y escritura",
    "metadata": {
      "objective": "El estudiante participa en talleres de escritura colaborativa analizando textos propios y ajenos, identificando procedimientos narrativos efectivos e inefectivos, y aplicando retroalimentacion constructiva para mejorar los textos del grupo.",
      "competencies": [
        "Analiza procedimientos narrativos en textos propios y de companeros: ritmo, tension, transiciones, cierre",
        "Ofrece y recibe retroalimentacion constructiva basada en criterios literarios especificos",
        "Identifica y corrige problemas narrativos comunes: falta de tension, finales abruptos, incoherencias de voz",
        "Valora la escritura como practica colaborativa y social, no solo individual"
      ],
      "materials": [
        "Textos producidos por los alumnos en progresiones anteriores (P01 a P06)",
        "Protocolo de retroalimentacion en taller: reglas de escucha, estructura de comentario (fortaleza + pregunta + sugerencia)",
        "Lista de procedimientos narrativos para revisar: ritmo, tension, transiciones, coherencia de voz, cierre",
        "Ejemplos de finales efectivos en la narrativa mexicana: el cierre de Nos han dado la tierra, el final de Talpa (Rulfo)",
        "Formato de registro de taller: comentarios recibidos y decisiones del autor"
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "15 min", "label": "Que es un taller de escritura: reglas y protocolo de retroalimentacion"},
        {"phase": "Desarrollo", "duration": "65 min", "label": "Taller de textos en grupos de 4: lectura, analisis y retroalimentacion estructurada"},
        {"phase": "Cierre", "duration": "20 min", "label": "Revision del texto propio incorporando retroalimentacion + reflexion del taller"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "15 min",
          "description": "El docente explica el concepto de taller literario y su diferencia con la clase magistral: en el taller todos son autores y lectores, el docente es un participante mas (aunque con mas experiencia). Presenta el protocolo de retroalimentacion en tres pasos: (1) Fortaleza: que funciona bien en el texto y por que. (2) Pregunta: que no te queda claro o que te genera curiosidad como lector. (3) Sugerencia: algo concreto que el autor podria explorar para mejorar el texto.",
          "activity": "Modelado con un texto del docente (puede ser uno con errores deliberados): el grupo practica el protocolo en voz alta. El docente muestra como recibir la retroalimentacion: tomando notas, sin defenderse, sin explicar el texto (el texto debe hablar solo)."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "65 min",
          "description": "Taller en grupos de 4. Cada alumno comparte uno de sus textos del semestre (el que elija). El protocolo por texto: 3 min lectura en voz alta por el autor, 5 min de escritura silenciosa de comentarios por los companeros, 10 min de retroalimentacion oral estructurada. El autor toma notas sin defender ni explicar. Al final, el grupo identifica los procedimientos narrativos que mas aparecieron como debilidades comunes.",
          "activity": "Cada grupo completa: (1) Tabla de fortalezas y debilidades narrativas del grupo. (2) Los 3 procedimientos que mas necesitan trabajar. (3) Un texto del grupo que fue especialmente efectivo y por que. Esta informacion se comparte con toda la clase al final."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "20 min",
          "description": "Cada autor revisa su texto en 10 minutos incorporando (o rechazando conscientemente) la retroalimentacion recibida. Plenaria: cada grupo comparte los 3 procedimientos narrativos que identificaron como debilidades. El docente sintetiza los patrones comunes y propone ejercicios especificos para la siguiente sesion.",
          "activity": "Reflexion escrita: que fue mas dificil, dar retroalimentacion o recibirla? Por que? Esta metacognicion sobre el proceso colaborativo es tan importante como el analisis literario."
        }
      ]
    },
    "theory": {
      "introduction": "El taller literario es una forma de aprendizaje colaborativo que tiene su origen en las escuelas de escritura creativa del siglo XX, pero en Mexico ha tenido expresiones propias: el Taller de los Martes de Juan Jose Arreola (1950s-1960s), donde se formaron escritores como Carlos Fuentes y Tomas Segovia; el Centro Mexicano de Escritores, donde Juan Rulfo escribio Pedro Paramo con apoyo de una beca y la retroalimentacion de sus contemporaneos; los talleres del FONCA (Fondo Nacional para la Cultura y las Artes) que siguen formando escritores hoy. El taller literario parte del principio de que la escritura mejora con la lectura critica de otros: nadie ve sus propios puntos ciegos, pero un lector atento si los ve.",
      "sections": [
        {
          "subtitle": "Procedimientos Narrativos y sus Problemas Comunes",
          "content": "Los procedimientos narrativos son las tecnicas que el escritor usa para construir el efecto del texto. Los mas relevantes en este nivel y sus problemas tipicos: Ritmo: el ritmo narrativo es la velocidad con que se cuenta la historia. Problema comun: ritmo uniforme, sin variacion. Solucion: alternar frases cortas y largas, escenas extensas con resumen rapido. Tension: la tension narrativa es lo que hace que el lector quiera saber que pasa despues. Problema comun: revelar demasiado pronto o no construir expectativa. Solucion: posponer la resolucion, dar informacion parcial, usar el dialogo para crear incertidumbre. Transiciones: los cambios de escena, tiempo o perspectiva. Problema comun: saltos abruptos sin preparacion al lector. Solucion: usar parrafo en blanco, cambio de tiempo verbal, frase de transicion. Coherencia de voz: mantener el mismo punto de vista y registro a lo largo del texto. Problema comun: cambios involuntarios de 1a a 3a persona. Cierre: el final del texto. Problema comun: finales abruptos (cortaron el texto sin cerrarlo) o explicativos (el autor explica el significado en lugar de dejarlo en el texto). Los mejores cierres son sugerentes, no explicativos: como el de Nos han dado la tierra, donde la gallina es la unica vida en el llano."
        },
        {
          "subtitle": "El Taller Literario en Mexico",
          "content": "El taller literario como institucion educativa tiene en Mexico una historia rica. El Taller de los Martes de Juan Jose Arreola (1950s): un espacio semanal informal donde jovenes escritores leian sus textos y recibiam critica. Carlos Fuentes, Tomas Segovia y otros grandes de la literatura mexicana pasaron por ese taller. El Centro Mexicano de Escritores (1951-1997): instituyó las primeras becas de escritura en Mexico; Juan Rulfo estuvo ahi en 1953-1954, periodo en que termino Pedro Paramo. El FONCA (Fondo Nacional para la Cultura y las Artes, creado en 1989): otorga becas y apoya talleres de escritura en todo Mexico. El Sistema Nacional de Creadores de Arte. La FIL Guadalajara tiene talleres de escritura creativos cada ano. Estos espacios demuestran que la escritura es una practica social que se desarrolla en comunidad, no en soledad absoluta."
        },
        {
          "subtitle": "El Arte de la Retroalimentacion Constructiva",
          "content": "La retroalimentacion constructiva en un taller literario es un arte que requiere: Especificidad: no Es muy bueno sino La imagen de la gallina al final crea una ironia tragica muy efectiva. Fundamento textual: citar el texto, no hablar de manera abstracta. Enfoque en el texto, no en el autor: No entiendo a tu personaje es mas util que Me parece mal que el personaje haga eso. Equilibrio: identificar tanto fortalezas como areas de mejora. Respeto por la intencion del autor: hacer preguntas antes que prescribir soluciones. La retroalimentacion destructiva (critica sin fundamento, burla, indiferencia) daña no solo el texto sino la confianza del escritor. La retroalimentacion constructiva, en cambio, es un regalo: ofrece al autor una perspectiva que no puede tener sobre su propio texto. El protocolo de Fortaleza + Pregunta + Sugerencia es un andamio que garantiza una retroalimentacion equilibrada y respetuosa."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "En un taller literario, cuando el autor escucha la retroalimentacion de sus companeros, cual es la actitud mas productiva?",
          "options": [
            "A) Explicar y defender sus decisiones para que los lectores entiendan la intencion del texto.",
            "B) Tomar notas sin defender ni explicar: el texto debe hablar solo y la retroalimentacion es informacion valiosa.",
            "C) Rechazar todo comentario que no sea positivo para proteger la vision artistica original."
          ],
          "correct": "B) Tomar notas sin defender ni explicar: el texto debe hablar solo y la retroalimentacion es informacion valiosa."
        },
        {
          "question": "El problema narrativo de revelar demasiado pronto o no construir expectativa en el lector se relaciona con:",
          "options": [
            "A) La coherencia de voz narrativa",
            "B) La falta de tension narrativa",
            "C) Los errores ortograficos del texto"
          ],
          "correct": "B) La falta de tension narrativa"
        },
        {
          "question": "El Taller de los Martes de Juan Jose Arreola (1950s) es relevante para la literatura mexicana porque:",
          "options": [
            "A) Fue el primer taller donde se publico Pedro Paramo de Juan Rulfo.",
            "B) Fue un espacio formativo donde escritores como Carlos Fuentes y Tomas Segovia desarrollaron su obra.",
            "C) Fue financiado directamente por la SEP como parte del plan de estudios de bachillerato."
          ],
          "correct": "B) Fue un espacio formativo donde escritores como Carlos Fuentes y Tomas Segovia desarrollaron su obra."
        },
        {
          "question": "El cierre de Nos han dado la tierra con la imagen de la gallina es efectivo porque:",
          "options": [
            "A) Explica detalladamente el significado de la historia para que el lector no tenga dudas.",
            "B) Es sugerente: la gallina como unica vida en el llano esteril sintetiza la ironia tragica sin explicarla.",
            "C) Indica que la historia continua en otro cuento del mismo libro."
          ],
          "correct": "B) Es sugerente: la gallina como unica vida en el llano esteril sintetiza la ironia tragica sin explicarla."
        },
        {
          "question": "El FONCA (Fondo Nacional para la Cultura y las Artes) en Mexico tiene como funcion principal:",
          "options": [
            "A) Regular el comercio de libros y derechos de autor en Mexico.",
            "B) Otorgar becas y apoyar talleres de escritura para promover la creacion literaria.",
            "C) Administrar las librerias del INBAL en todo el pais."
          ],
          "correct": "B) Otorgar becas y apoyar talleres de escritura para promover la creacion literaria."
        }
      ],
      "rubric": "RUBRICA — Participacion en taller literario (20 pts)\n\nCALIDAD DE LA RETROALIMENTACION DADA (8 pts): 8=Retroalimentacion especifica, fundamentada en el texto, equilibrada (fortaleza+pregunta+sugerencia) en los 3+ textos revisados | 6=Retroalimentacion fundamentada en 2 textos con protocolo parcial | 4=Comentarios generales sin fundamentacion textual | 0=Sin retroalimentacion o retroalimentacion destructiva\n\nELABORACION DE LA TABLA DE PROCEDIMIENTOS (5 pts): 5=Tabla completa con 3 procedimientos identificados, ejemplos y plan de mejora | 4=Tabla parcial con 1-2 procedimientos | 2=Procedimientos mencionados sin ejemplos ni plan | 0=Sin tabla\n\nREVISION DEL TEXTO PROPIO (4 pts): 4=El autor incorpora o rechaza conscientemente la retroalimentacion y puede justificar sus decisiones | 3=Incorpora retroalimentacion sin reflexion critica | 2=Texto apenas modificado | 0=Sin revision\n\nREFLEXION SOBRE EL PROCESO (3 pts): 3=Reflexion profunda sobre la dificultad de dar/recibir retroalimentacion con argumentos especificos | 2=Reflexion presente pero superficial | 0=Sin reflexion"
    },
    "teacher_tips": [
      "El protocolo de retroalimentacion (Fortaleza + Pregunta + Sugerencia) debe practicarse antes del taller con ejemplos. Sin protocolo, los talleres degeneran en criticas vagas o en elogios vacios que no ayudan al autor.",
      "Tu rol en el taller es de facilitador, no de juez. Si participas con tu propia retroalimentacion, hazlo con el mismo formato que los alumnos. Que vean que tu texto tambien puede mejorarse.",
      "El momento en que el autor no puede hablar mientras recibe retroalimentacion es el mas dificil y el mas formativo. La resistencia a callar y escuchar es natural: trabajala explicitamente.",
      "Para alumnos que no quieren compartir su texto: ofrece la opcion de compartir un texto de autor externo (una leyenda, un cuento corto) y analizar sus procedimientos. La distancia del texto ajeno reduce la ansiedad.",
      "Al final del taller, el docente debe sintetizar los patrones de fortalezas y debilidades del grupo. Esta informacion orienta la siguiente progresion: si todos tienen problemas con el cierre, la proxima sesion debe trabajar especificamente los finales narrativos."
    ]
  },
  "LC-II-P08": {
    "code": "LC-II-P08",
    "title": "Integra practicas de lectura, escritura y oralidad en proyectos creativos para presentar el texto elaborado.",
    "level": "Lengua y Comunicacion II",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Intermedio",
    "category": "Proyecto integrador",
    "metadata": {
      "objective": "El estudiante integra las practicas de lectura, escritura y oralidad del semestre en un proyecto creativo final que presenta su texto ante una audiencia real, desarrollando la competencia comunicativa en su dimension publica y comunitaria.",
      "competencies": [
        "Integra lectura (analisis literario), escritura (proceso, recursos, reescritura) y oralidad (narracion, presentacion) en un proyecto coherente",
        "Presenta su texto ante una audiencia con claridad, expresividad y seguridad",
        "Selecciona el formato de presentacion mas adecuado para su texto y audiencia",
        "Reflexiona sobre su trayectoria como lector y escritor durante el semestre"
      ],
      "materials": [
        "Portafolio de escritura del semestre (todos los textos producidos en P01-P07)",
        "Opciones de formato de presentacion: lectura dramatizada, podcast narrado, libro-album, mural de texto, video-narracion",
        "Rubrica de autoevaluacion del semestre",
        "Espacio de presentacion: salon, patio, aula multimedia, plataforma digital",
        "Grabadora o camara para registro del proyecto final"
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "10 min", "label": "Revision del portafolio + seleccion del texto a presentar"},
        {"phase": "Desarrollo", "duration": "70 min", "label": "Preparacion del proyecto final: formato, ensayo, ajuste del texto"},
        {"phase": "Cierre", "duration": "20 min", "label": "Presentacion publica + autoevaluacion semestral"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "10 min",
          "description": "El docente invita a los alumnos a revisar su portafolio del semestre y elegir el texto del que esten mas orgullosos, el que sientan mas como suyo. Pregunta: si pudieras leerle un solo texto a alguien importante para ti (un familiar, un amigo, alguien que admiras), cual elegirías y por que?",
          "activity": "Decision individual: el alumno elige su texto y el formato de presentacion: lectura dramatizada en voz alta, narracion de memoria, podcast grabado, video-narracion, o presentacion con imagenes. No todos los formatos son iguales: el texto y la audiencia determinan el formato mas adecuado."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "70 min",
          "description": "Preparacion del proyecto final en tres momentos: (1) Revision final del texto: el alumno incorpora los comentarios del taller y realiza una ultima edicion. (2) Ensayo del formato de presentacion: practicar la lectura en voz alta (proyeccion de voz, pausas, emocion), grabar el podcast o preparar el material visual. (3) Ajuste del texto a partir del ensayo: hay partes que suenan bien escritas pero no funcionan en voz alta, y viceversa.",
          "activity": "Trabajo individual o en pareja de apoyo. El docente circula y apoya en: diccion y proyeccion de voz para la lectura dramatizada, edicion final del texto escrito, seleccion de imagenes o musica de fondo para el video-narracion. Ensayo general: cada alumno presenta ante un companero y recibe una ultima retroalimentacion breve."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "20 min",
          "description": "Presentacion publica: cada alumno presenta su texto en el formato elegido. El grupo escucha con atencion. Despues de cada presentacion, 30 segundos de silencio (para dejar que el texto resuene) antes de aplaudir. Autoevaluacion semestral y carta al siguiente grupo.",
          "activity": "Carta al siguiente grupo: el alumno escribe en 3-4 oraciones un consejo para los alumnos que tomaran LC-II el siguiente semestre: que aprendieron, que les fue dificil, que recomiendan. Estas cartas se guardan para el inicio del siguiente semestre como bienvenida de los alumni."
        }
      ]
    },
    "theory": {
      "introduction": "La integracion de lectura, escritura y oralidad es el nucleo del enfoque comunicativo del MCCEMS para Lengua y Comunicacion. No se trata de tres habilidades separadas sino de tres dimensiones de un mismo proceso: leemos para escribir mejor, escribimos para comunicar oralmente, y la oralidad alimenta y transforma la escritura. En la tradicion literaria mexicana, esta integracion es natural: Juan Rulfo nacio de la tradicion oral de Jalisco y la transformo en texto escrito de alta literatura. Los corridos son poesia oral que se escribe y luego se canta. La FIL Guadalajara es un evento que celebra exactamente esta trifecta: libros (escritura), lecturas en voz alta (oralidad), y la experiencia de leer juntos (comunidad lectora).",
      "sections": [
        {
          "subtitle": "La Trifecta: Lectura, Escritura, Oralidad",
          "content": "Lectura: no es un proceso pasivo sino activo y transformador. Leer literatura bien (con atencion, con preguntas, con analisis) cambia la manera de escribir. Los mejores escritores son, invariablemente, lectores voraces. Para el alumno de bachillerato, desarrollar habitos de lectura literaria es una inversion a largo plazo en su competencia comunicativa. Escritura: es un proceso iterativo, social y reflexivo. No se escribe para el maestro sino para un lector real, con un proposito real. El portafolio del semestre es evidencia de esa trayectoria. Oralidad: la voz humana tiene dimensiones que la escritura no puede capturar: tono, pausas, ritmo, presencia. La lectura en voz alta de literatura es una practica de altisimo valor que se ha perdido en muchas escuelas. Recuperarla es recuperar la dimension comunitaria de la literatura: los textos existen plenamente cuando son escuchados, no solo leidos en silencio."
        },
        {
          "subtitle": "Formatos de Presentacion: Adecuacion al Texto y la Audiencia",
          "content": "La eleccion del formato de presentacion es una decision retorica: depende del texto, del publico y del proposito. Lectura dramatizada en voz alta: adecuada para textos con ritmo y musicalidad propios (poesia, narracion con muchos dialogos). Requiere preparacion: marcar pausas, subrayar palabras de enfasis, practicar proyeccion de voz. Podcast narrado: adecuado para textos que funcionan como monolgo interior o narracion intima. Permite reeditar, anadir musica de fondo, corregir errores. Es un formato autentico del siglo XXI: hay podcasts literarios en Mexico como Letteratura, Leer es resistir, y los audiopodcasts de la UNAM. Video-narracion: combina texto, voz e imagen. Adecuado para textos descriptivos o con fuerte componente visual. Exige edicion basica pero produce artefactos que pueden compartirse mas alla del salon. Mural de texto: presentacion visual del texto con tipografia, imagenes y diagramacion. Adecuado para textos experimentales o poemas visuales."
        },
        {
          "subtitle": "El Portafolio como Memoria del Aprendizaje",
          "content": "El portafolio de escritura del semestre es mucho mas que una coleccion de tareas: es la memoria del proceso de aprendizaje, la evidencia de una trayectoria. Ver el texto de la primera semana junto al texto del proyecto final muestra al alumno (y al docente) el crecimiento real. El portafolio es tambien una herramienta de autoevaluacion: el alumno puede identificar que ha mejorado (el uso de conectores, la coherencia de voz, la riqueza de vocabulario) y que aun le cuesta (el cierre de los textos, la construccion de tension). En el ambito profesional, el portafolio literario es la tarjeta de presentacion del escritor: para solicitar una beca del FONCA, para ingresar a un taller de la Casa del Escritor, o para publicar en una revista literaria, se presenta una muestra del trabajo propio. El alumno de LC-II ya tiene la semilla de ese portafolio profesional."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "En el enfoque de Lengua y Comunicacion del MCCEMS, la lectura, la escritura y la oralidad se conciben como:",
          "options": [
            "A) Tres habilidades separadas que se ensenana de manera independiente.",
            "B) Tres dimensiones integradas de un mismo proceso comunicativo que se alimentan mutuamente.",
            "C) Tres niveles de dificultad que se trabajan en orden: primero oralidad, luego lectura, luego escritura."
          ],
          "correct": "B) Tres dimensiones integradas de un mismo proceso comunicativo que se alimentan mutuamente."
        },
        {
          "question": "El portafolio de escritura es valioso porque:",
          "options": [
            "A) Reemplaza los examenes escritos del semestre como unica forma de evaluacion.",
            "B) Es la memoria del proceso de aprendizaje y muestra la trayectoria del alumno como escritor.",
            "C) Contiene solo los mejores textos del alumno, no los borradores ni los trabajos con errores."
          ],
          "correct": "B) Es la memoria del proceso de aprendizaje y muestra la trayectoria del alumno como escritor."
        },
        {
          "question": "El formato de podcast narrado es especialmente adecuado para textos que:",
          "options": [
            "A) Tienen muchas imagenes y necesitan ser vistos, no solo escuchados.",
            "B) Funcionan como monologo interior o narracion intima, y se benefician del sonido y la edicion.",
            "C) Tienen estructura argumentativa y requieren datos estadisticos visibles."
          ],
          "correct": "B) Funcionan como monologo interior o narracion intima, y se benefician del sonido y la edicion."
        },
        {
          "question": "El FONCA (Fondo Nacional para la Cultura y las Artes) y la Casa del Escritor son relevantes para los egresados de bachillerato porque:",
          "options": [
            "A) Son los unicos espacios donde se puede publicar literatura en Mexico.",
            "B) Ofrecen becas y talleres a los que puede aspirar quien desarrolla un portafolio literario desde temprano.",
            "C) Son instituciones exclusivas para escritores con posgrado universitario."
          ],
          "correct": "B) Ofrecen becas y talleres a los que puede aspirar quien desarrolla un portafolio literario desde temprano."
        },
        {
          "question": "El silencio de 30 segundos despues de cada presentacion en el proyecto final sirve para:",
          "options": [
            "A) Dar tiempo al docente de anotar la calificacion antes de pasar al siguiente alumno.",
            "B) Dejar que el texto resuene: respetar la experiencia estetica antes de interrumpirla con aplausos.",
            "C) Verificar que todos los alumnos prestaron atencion antes de hacer preguntas."
          ],
          "correct": "B) Dejar que el texto resuene: respetar la experiencia estetica antes de interrumpirla con aplausos."
        }
      ],
      "rubric": "RUBRICA — Proyecto integrador final LC-II (30 pts)\n\nCALIDAD DEL TEXTO ESCRITO (10 pts): 10=Texto con voz propia, recursos literarios, coherencia y proceso de revision evidente | 8=Texto solido con voz y recursos identificables | 5=Texto con elementos narrativos basicos | 2=Texto sin recursos ni proceso de revision | 0=Sin texto\n\nINTEGRACION DE APRENDIZAJES DEL SEMESTRE (8 pts): 8=El texto integra elementos de al menos 4 progresiones (autobiografia, recursos literarios, personaje, reescritura, etc.) | 6=Integracion de 2-3 progresiones | 4=Presencia de 1 progresion identificable | 0=Sin integracion de aprendizajes\n\nPRESENTACION ORAL/FORMATO (8 pts): 8=Presentacion clara, expresiva, con diccion y ritmo adecuados al texto; formato bien elegido | 6=Presentacion comprensible con algunos problemas de diccion o ritmo | 4=Presentacion basica pero comunicativa | 0=Sin presentacion\n\nREFLEXION METACOGNITIVA (4 pts): 4=La carta al siguiente grupo revela conciencia profunda del propio proceso de aprendizaje | 3=Reflexion presente con algunas generalizaciones | 2=Reflexion superficial o muy breve | 0=Sin reflexion"
    },
    "teacher_tips": [
      "El proyecto final debe ser una celebracion, no un examen. Invita a otros grupos, a directivos o a familias a escuchar las presentaciones si el contexto lo permite. La audiencia real transforma la experiencia.",
      "Para la lectura en voz alta, dedica al menos 15 minutos a trabajar diccion y proyeccion de voz: que el alumno lea el texto de pie, en voz mas alta de lo comodo, con pausas marcadas. La tecnica mejora mucho con solo una practica guiada.",
      "La carta al siguiente grupo es un recurso poderoso de metacognicion y comunidad: los alumnos del siguiente semestre recibiran consejos reales de sus pares, no del maestro. Guarda las cartas y entregalas al inicio del siguiente curso.",
      "No todos los alumnos llegaran al proyecto final con el mismo nivel de desarrollo. No penalices la trayectoria sino valora el progreso: un alumno que al inicio del semestre no podia escribir un parrafo coherente y ahora tiene una narracion de 200 palabras con recursos literarios ha tenido un exito enorme.",
      "Para el portafolio: si es posible, pide a los alumnos que lo organicen con una portada creativa y un indice. Este gesto formal transforma una coleccion de hojas en un libro personal. El saber que tienen un libro propio tiene un efecto motivador profundo."
    ]
  }
}

out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src', 'data', 'planteamiento', 'lc-ii.json')
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f'Written {len(data)} progressions to {out_path}')

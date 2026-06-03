import json, os

data = {
  "PFH-II-P01": {
    "code": "PFH-II-P01",
    "title": "Examina preguntas ontologicas sobre el ser, la existencia y la realidad desde diversas tradiciones filosoficas.",
    "level": "Pensamiento Filosofico y Humanidades II",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Intermedio",
    "category": "Ontologia",
    "metadata": {
      "objective": "El estudiante examina las preguntas fundamentales de la ontologia (que es el ser, que existe, cual es la naturaleza de la realidad) desde tradiciones filosoficas occidentales, mesoamericanas e indigenas mexicanas, desarrollando pensamiento filosofico critico y situado.",
      "competencies": [
        "Distingue la ontologia de otras ramas de la filosofia (epistemologia, etica, estetica)",
        "Analiza preguntas ontologicas en al menos tres tradiciones: griega, moderna occidental y mesoamericana",
        "Identifica la cosmovision nahuatl (teotl, tlaltecuhtli, tonalpohualli) como sistema ontologico propio",
        "Desarrolla una posicion personal ante la pregunta por el ser argumentada con referentes filosoficos"
      ],
      "materials": [
        "Fragmentos: Aristoteles (Metafisica, libro IV), Descartes (Meditaciones metafisicas, meditacion segunda), Leon-Portilla (La filosofia nahuatl)",
        "Ilustraciones del Tonalpohualli (calendario ritual nahuatl) y el concepto de teotl",
        "Video corto: Filosofia nahuatl (UNAM-FFyL, canal YouTube)",
        "Cuadro comparativo de visiones ontologicas en blanco",
        "Textos del IIF-UNAM sobre filosofia mesoamericana contemporanea"
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "15 min", "label": "Pregunta filosofica detonadora: que significa existir?"},
        {"phase": "Desarrollo", "duration": "60 min", "label": "Analisis comparativo de ontologias: griega, cartesiana y nahuatl"},
        {"phase": "Cierre", "duration": "25 min", "label": "Posicion personal argumentada: como entiendes tu la realidad?"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "15 min",
          "description": "El docente formula la pregunta generadora: cuando dices que algo existe, que quieres decir exactamente? Existe igual tu mochila, tu amor por alguien, el numero 7 y el dios de tu comunidad? Los alumnos responden libremente. Se introduce la ontologia como la rama de la filosofia que estudia el ser y la existencia: que tipos de cosas existen y que significa existir.",
          "activity": "Clasificacion ontologica rapida: el docente lista en el pizarron 10 entidades (una piedra, el amor, el numero pi, la justicia, Quetzalcoatl, el dolor, el oxigeno, la democracia, el tiempo, tu propio yo). Los alumnos votan: realmente existe? En que sentido? El desacuerdo genera el debate filosofico."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "60 min",
          "description": "Analisis comparativo de tres tradiciones ontologicas con fragmentos de texto: (1) Aristoteles: el ser se dice de muchas maneras (sustancias, accidentes, potencia, acto). La realidad tiene estructura y jerarquia. (2) Descartes: el ser pensante (cogito ergo sum) como fundamento de la certeza. La distincion res cogitans (sustancia pensante) vs res extensa (sustancia material). (3) Cosmovision nahuatl (segun Miguel Leon-Portilla): el concepto de teotl como fuerza dinamica dual (omeyocan, lugar de la dualidad), la realidad como proceso dinamico, no como sustancia estatica.",
          "activity": "Cuadro comparativo en equipos: caracterizar cada ontologia en: que existe?, que tipo de ser es mas real?, como se conoce el ser?, que es el ser humano en esta ontologia? Presentacion y discusion de diferencias y complementariedades."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "25 min",
          "description": "Dialogo filosofico: el docente facilita un dialogo socratico sobre la pregunta: puede la cosmovision nahuatl enriquecer o cuestionar la ontologia occidental? Esta pregunta conecta con el proyecto de filosofia latinoamericana que busca pensar desde tradiciones propias sin negar el dialogo universal.",
          "activity": "Posicion personal escrita (1 parrafo): cada alumno desarrolla su propia respuesta a la pregunta que es el ser, citando al menos una de las tradiciones analizadas y argumentando desde su propia experiencia cultural. Este texto se guarda en el portafolio filosofico."
        }
      ]
    },
    "theory": {
      "introduction": "La ontologia es la rama de la filosofia que estudia el ser en cuanto ser: que existe, que tipos de cosas existen, en que consiste la existencia. Es la pregunta mas fundamental de la filosofia occidental desde los presocraticos griegos (Tales, Heraclito, Parmenides) hasta el existencialismo del siglo XX (Heidegger, Sartre). En Mexico, la ontologia tiene una dimension especial: las culturas mesoamericanas desarrollaron sistemas de comprension de la realidad sofisticados y radicalmente distintos al pensamiento occidental. El filosofo mexicano Miguel Leon-Portilla (1926-2019), investigador del IIF-UNAM, dedico su vida a rescatar y sistematizar la filosofia nahuatl, demostrando que el pensamiento indigena mesoamericano es filosofia en sentido pleno.",
      "sections": [
        {
          "subtitle": "Ontologia Griega: Aristoteles y el Ser en Cuanto Ser",
          "content": "Aristoteles (384-322 a.C.) es el fundador de la ontologia como disciplina sistematica en Occidente. En su Metafisica (libro IV), establece que el ser se dice de muchas maneras: hay sustancias (lo que existe en si mismo: una piedra, una persona, un dios), accidentes (propiedades que existen en otro: el color de la piedra, la altura de la persona), potencia (lo que puede llegar a ser) y acto (lo que ya es). La pregunta central de la ontologia aristotelica es: que son las cosas en su esencia mas profunda? Aristotelesresponde que la esencia es la forma (eidos) que hace a cada cosa ser lo que es. Para Aristoteles, la realidad mas real es la sustancia (ousia), especialmente el Primer Motor Inmovil: un ser que mueve sin ser movido, puro acto sin potencia."
        },
        {
          "subtitle": "Ontologia Moderna: Descartes y el Cogito",
          "content": "Rene Descartes (1596-1650) inauguró la ontologia moderna con su proyecto de fundar el conocimiento en una certeza indudable. En las Meditaciones Metafisicas (1641), Descartes duda metodicamente de todo hasta encontrar algo que no puede dudarse: que esta dudando, es decir, pensando. Cogito ergo sum: pienso, luego existo. Esta es su primera certeza ontologica. A partir de ella, Descartes distingue dos tipos de sustancias: res cogitans (sustancia pensante: la mente, el yo), que es indivisible e inmaterial, y res extensa (sustancia material: el cuerpo, la materia), que ocupa espacio y es divisible. Esta distincion cartesiana entre mente y cuerpo (dualismo cartesiano) ha sido enormemente influyente en la ciencia y la filosofia occidental, pero tambien ha sido criticada por separar artificialmente lo que en la experiencia humana es una unidad."
        },
        {
          "subtitle": "Cosmovision Nahuatl: El Ser como Proceso Dinamico",
          "content": "Miguel Leon-Portilla, en La filosofia nahuatl (1956, UNAM-IIF), sistematizo el pensamiento ontologico de los nahuas prehispanicos a partir de los textos del Codice Florentino y otras fuentes. La ontologia nahuatl se organiza en torno al concepto de teotl: una fuerza dinamica dual y universal que da origen y sustento a todo lo que existe. Teotl no es un dios personal o una sustancia fija: es una energia en proceso perpetuo, que se manifiesta en pares de opuestos complementarios (ometeotl: dualidad fundamental). El ser, en la cosmovision nahuatl, no es estatico sino procesual: todo cambia, todo se transforma, todo es parte del ciclo cosmico representado en el Tonalpohualli (calendario ritual de 260 dias) y el Xiuhpohualli (calendario solar de 365 dias). Esta vision ontologica tiene afinidades con el pensamiento de Heraclito (todo fluye) y con algunas corrientes de la fisica contemporanea (el universo como proceso, no como sustancia). El IIF-UNAM (Instituto de Investigaciones Filosoficas) sigue produciendo investigacion sobre filosofia mesoamericana y su relevancia contemporanea."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "La ontologia, como rama de la filosofia, estudia principalmente:",
          "options": [
            "A) El conocimiento humano y sus limites (que podemos saber y como).",
            "B) El ser en cuanto ser: que existe, que tipos de cosas existen y que significa existir.",
            "C) Los principios del razonamiento valido y los argumentos logicos."
          ],
          "correct": "B) El ser en cuanto ser: que existe, que tipos de cosas existen y que significa existir."
        },
        {
          "question": "El cogito ergo sum de Descartes es una conclusion ontologica que afirma:",
          "options": [
            "A) El cuerpo es la unica realidad cierta porque lo podemos percibir con los sentidos.",
            "B) El yo pensante (res cogitans) es la primera certeza ontologica: existo porque pienso.",
            "C) Dios es la sustancia mas real y el fundamento de todo conocimiento."
          ],
          "correct": "B) El yo pensante (res cogitans) es la primera certeza ontologica: existo porque pienso."
        },
        {
          "question": "Segun Miguel Leon-Portilla, el concepto nahuatl de teotl se refiere a:",
          "options": [
            "A) Un dios personal y creador similar al de las religiones abrahamicas.",
            "B) Una fuerza dinamica dual y universal que da origen a todo lo que existe, representada en el Ometeotl.",
            "C) El alma individual inmortal de cada ser humano en la cosmovision nahuatl."
          ],
          "correct": "B) Una fuerza dinamica dual y universal que da origen a todo lo que existe, representada en el Ometeotl."
        },
        {
          "question": "La distincion cartesiana entre res cogitans y res extensa ha sido criticada principalmente porque:",
          "options": [
            "A) Niega la existencia de Dios como sustancia suprema.",
            "B) Separa artificialmente mente y cuerpo, ignorando que en la experiencia humana son una unidad.",
            "C) No explica como los objetos materiales pueden moverse sin una causa primera."
          ],
          "correct": "B) Separa artificialmente mente y cuerpo, ignorando que en la experiencia humana son una unidad."
        },
        {
          "question": "El IIF-UNAM (Instituto de Investigaciones Filosoficas) es relevante para la filosofia mexicana porque:",
          "options": [
            "A) Es la unica institucion en Mexico autorizada para ensenar filosofia.",
            "B) Produce investigacion sobre filosofia mesoamericana y latinoamericana, incluyendo la obra de Leon-Portilla.",
            "C) Administra el sistema de bachillerato filosofico de la UNAM."
          ],
          "correct": "B) Produce investigacion sobre filosofia mesoamericana y latinoamericana, incluyendo la obra de Leon-Portilla."
        }
      ],
      "rubric": "RUBRICA — Cuadro comparativo + posicion personal (20 pts)\n\nCUADRO COMPARATIVO (8 pts): 8=Las tres ontologias (griega, cartesiana, nahuatl) caracterizadas correctamente en los 4 criterios con citas de los textos | 6=2 ontologias bien caracterizadas | 4=1 ontologia con caracterizacion parcial de las otras | 0=Sin cuadro o cuadro incorrecto\n\nANALISIS DE DIFERENCIAS Y COMPLEMENTARIEDADES (6 pts): 6=Identifica diferencias sustanciales y posibles complementariedades con argumentacion filosofica | 4=Diferencias identificadas con argumentacion parcial | 2=Diferencias superficiales sin analisis | 0=Sin analisis comparativo\n\nPOSICION PERSONAL ARGUMENTADA (6 pts): 6=Posicion clara, argumentada filosoficamente, que cita al menos una tradicion y conecta con la experiencia cultural del alumno | 4=Posicion presente con argumentacion limitada | 2=Opinion sin argumentacion filosofica | 0=Sin posicion personal"
    },
    "teacher_tips": [
      "La pregunta que es el ser puede parecer abstracta al alumno. Ancla inmediatamente con la clasificacion de 10 entidades: el ejercicio practico de distinguir si el numero pi, el dolor o la democracia existen, y en que sentido, hace la ontologia inmediatamente relevante.",
      "Presentar a Leon-Portilla como filosofo mexicano que trabajo en la UNAM es importante: demuestra que la filosofia no es solo una actividad europea. La filosofia nahuatl es filosofia en sentido pleno, no solo mitologia o religion.",
      "La comparacion entre teotl (proceso dinamico dual) y Heraclito (todo fluye) y la fisica cuantica (el universo como campo de interacciones) puede ser deslumbrante para alumnos con inclinacion cientifica. No es anacronismo: es filosofia comparada.",
      "El dialogo socratico requiere practica. No todas las respuestas de los alumnos son igualmente validas: ensenales a argumentar, a citar el texto, a responder a los argumentos del otro (no solo a opiniones). Esto es la diferencia entre discusion y dialogo filosofico.",
      "Para el portafolio filosofico: explica que los mejores filosofos no tenian respuestas definitivas sino buenas preguntas. La posicion personal del alumno puede ser tentativa, hipotetica, llena de dudas. Eso es filosofia honesta."
    ]
  },
  "PFH-II-P02": {
    "code": "PFH-II-P02",
    "title": "Analiza los fundamentos eticos de la accion humana, reconociendo la diversidad de enfoques: deontologico, consecuencialista, de la virtud y del cuidado.",
    "level": "Pensamiento Filosofico y Humanidades II",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Intermedio",
    "category": "Etica",
    "metadata": {
      "objective": "El estudiante analiza cuatro enfoques eticos fundamentales (deontologico, consecuencialista, de la virtud y del cuidado) aplicandolos a dilemas morales reales del contexto mexicano, desarrollando la capacidad de argumentacion etica y el reconocimiento de la complejidad moral.",
      "competencies": [
        "Describe y diferencia los cuatro enfoques eticos: Kant (deber), Mill (consecuencias), Aristoteles (virtud), Gilligan/Noddings (cuidado)",
        "Aplica cada enfoque etico a un dilema moral del contexto mexicano para obtener respuestas distintas",
        "Argumenta una posicion etica propia reconociendo la complejidad y los limites de cada enfoque",
        "Reconoce la etica del cuidado como enfoque que visibiliza dimensiones morales ignoradas por la etica tradicional"
      ],
      "materials": [
        "Fragmentos: Kant (Fundamentacion de la metafisica de las costumbres — el imperativo categorico), Mill (Utilitarismo — el principio de la mayor felicidad), Aristoteles (Etica a Nicomaco — la virtud como habito), Carol Gilligan (In a Different Voice — la etica del cuidado)",
        "Dilemas morales en contexto mexicano: el medico rural y el aborto, el juez y la corrupcion endemica, el estudiante y el plagio en situacion economica precaria",
        "Tabla de analisis etico por enfoque",
        "Fragmento de Leopoldo Zea sobre etica latinoamericana",
        "Casos de etica publica: IMSS, SAT, policia municipal"
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "15 min", "label": "El dilema del tranvia (trolley problem) en version mexicana: el dilema del medico rural"},
        {"phase": "Desarrollo", "duration": "65 min", "label": "Los cuatro enfoques eticos aplicados al mismo dilema"},
        {"phase": "Cierre", "duration": "20 min", "label": "Debate: que enfoque etico es mas adecuado para la realidad mexicana?"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "15 min",
          "description": "Dilema detonador (adaptado al contexto): Un medico rural en una comunidad indigena de Chiapas tiene 10 dosis de vacuna y hay 15 pacientes que la necesitan. Cinco de ellos son ninos pequenos, tres son adultos jovenes trabajadores, dos son ancianos con enfermedades previas, cinco son adultos de mediana edad. Tiene que decidir en 24 horas. Pregunta: como decides a quien vacunas? Los alumnos responden intuitivamente.",
          "activity": "Primera reaccion etica: los alumnos escriben individualmente su decision y su razon en 3 oraciones. Luego se comparten 3-4 respuestas. El docente identifica sin nombrarlas las logicas de cada enfoque: algunos respondieron segun el deber, otros segun las consecuencias, otros segun el caracter del medico."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "65 min",
          "description": "Presentacion de los cuatro enfoques eticos con sus principios fundamentales y su respuesta al dilema del medico: (1) Enfoque deontologico (Kant): actua solo segun la maxima que puedas querer que sea ley universal. El imperativo categorico. (2) Enfoque consecuencialista/utilitarista (Mill): la accion correcta es la que produce la mayor felicidad para el mayor numero. (3) Etica de la virtud (Aristoteles): que haria una persona virtuosa (prudente, justa, valiente) en esta situacion? (4) Etica del cuidado (Gilligan, Noddings): la moralidad parte de las relaciones y el cuidado concreto del otro, no de principios abstractos.",
          "activity": "Equipos: cada uno aplica su enfoque asignado al dilema del medico, respondiendo: como decidiria quien vacunar desde este enfoque, que principio guia la decision, que quedan sin respuesta con este enfoque solo. Presentacion ante el grupo: la misma situacion produce respuestas distintas."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "20 min",
          "description": "Debate: en el contexto de Mexico (con sus condiciones de desigualdad, informalidad, corrupcion estructural y diversidad cultural), que enfoque etico te parece mas adecuado para guiar la accion publica y privada? Se conecta con el pensamiento de Leopoldo Zea (filosofo mexicano, 1912-2004) sobre la necesidad de una etica latinoamericana que parta de sus propias circunstancias historicas.",
          "activity": "Carta etica personal: cada alumno escribe en su portafolio 3 principios eticos que guian o quiere que guien su vida, identificando a cual de los cuatro enfoques corresponde cada uno. Esta no tiene respuesta correcta: es la construccion de una etica personal reflexiva."
        }
      ]
    },
    "theory": {
      "introduction": "La etica es la rama de la filosofia que estudia la accion humana en su dimension moral: que debemos hacer, por que, y bajo que principios. Desde Socrates hasta la etica feminista contemporanea, la filosofia ha desarrollado multiples respuestas a estas preguntas que reflejan distintas visiones del ser humano, la sociedad y el bien. En el contexto mexicano, la etica tiene dimensiones especificas: una tradicion de etica comunitaria en las culturas indigenas (el bien comun, el bien vivir o buen vivir, el tequio como acto etico), una historia de etica cristiana colonial, un pensamiento liberal republicano (Juarez: el respeto al derecho ajeno es la paz) y debates contemporaneos sobre etica publica en un pais marcado por la corrupcion sistemica.",
      "sections": [
        {
          "subtitle": "Los Cuatro Enfoques Eticos Fundamentales",
          "content": "Enfoque deontologico (Immanuel Kant, 1724-1804): la accion moral se juzga por la intencion y el principio que la guia, no por sus consecuencias. El imperativo categorico: actua solo segun la maxima que puedas querer que se convierta en ley universal. Lo que hace buena a una accion es que se realice por deber, no por interes o inclinacion. Fortaleza: independencia de las consecuencias (no puedo mentir aunque la mentira produjera un bien). Limitacion: rigidez ante situaciones donde el deber produce mas dano que bien. Enfoque consecuencialista/utilitarismo (John Stuart Mill, 1806-1873): la accion correcta es la que produce la mayor felicidad para el mayor numero. La moralidad se mide por los resultados. Fortaleza: sensible al bienestar real de las personas. Limitacion: puede justificar sacrificar a una minoria por el bien de la mayoria. Etica de la virtud (Aristoteles, 384-322 a.C.): en lugar de preguntar que debo hacer, pregunta que tipo de persona debo ser. Las virtudes (valentia, justicia, prudencia, templanza) son habitos que se desarrollan con la practica. La eudaimonia (florece humano) es el fin de la vida etica. Fortaleza: atiende al caracter y la formacion moral. Limitacion: vaga en situaciones de decision urgente. Etica del cuidado (Carol Gilligan, Nel Noddings, siglo XX): surge como critica feminista a las eticas abstractas y universalistas. La moralidad parte de las relaciones concretas y el cuidado del otro vulnerable. La empatia, la responsabilidad y la respuesta al sufrimiento especifico son centrales. Fortaleza: visibiliza dimensiones morales ignoradas (el cuidado del enfermo, del nio, del anciano). Limitacion: riesgo de perpetuar roles de genero al asociar el cuidado con las mujeres."
        },
        {
          "subtitle": "Etica Publica en Mexico: El Dilema de la Corrupcion",
          "content": "La etica tiene implicaciones concretas para la vida publica mexicana. La corrupcion es uno de los mayores desafios eticos del pais: segun Transparencia Internacional, Mexico ocupa el lugar 126 de 180 en el Indice de Percepcion de la Corrupcion (2022). La corrupcion no es solo un problema legal: es fundamentalmente un problema etico. Cada enfoque la analiza diferente: Desde la deontologia kantiana, el funcionario corrupto viola el imperativo categorico: no puede querer que todos los funcionarios sean corruptos porque el sistema colapsa. Desde el utilitarismo, la corrupcion produce mas dano que beneficio para la sociedad, aunque produzca beneficio para el individuo. Desde la etica de la virtud, el funcionario corrupto carece de la virtud de la justicia y la honradez, por eso actua mal. Desde la etica del cuidado, la corrupcion es una traicion a las relaciones de confianza y al cuidado que los ciudadanos necesitan de sus instituciones. La Constitucion mexicana establece en el Art. 109 las responsabilidades de los servidores publicos; la SFP (Secretaria de la Funcion Publica) tiene atribuciones para sancionar la corrupcion."
        },
        {
          "subtitle": "Etica Latinoamericana: Leopoldo Zea y la Filosofia de la Liberacion",
          "content": "El filosofo mexicano Leopoldo Zea (1912-2004) argumento que America Latina necesita una filosofia y una etica propias, que partan de su historia de dominacion colonial y su proyecto de liberacion. En Filosofia de la Historia Americana (1978), Zea sostiene que la etica latinoamericana no puede ser una simple copia de la etica occidental: debe incorporar la experiencia de la marginacion, la busqueda de la dignidad y el reconocimiento de la diversidad cultural como valores eticos fundamentales. Esta propuesta dialoga con la filosofia de la liberacion de Enrique Dussel (1934), que coloca al pobre y al oprimido como punto de partida de la reflexion etica. En el contexto mexicano, la etica comunitaria de los pueblos indigenas (el bien vivir o buen vivir, el tequio, el sistema de cargos) ofrece una alternativa al individualismo liberal occidental que merece atencion filosofica seria."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "El imperativo categorico de Kant establece que debemos actuar:",
          "options": [
            "A) Buscando las consecuencias mas beneficiosas para el mayor numero de personas.",
            "B) Solo segun la maxima que puedamos querer que se convierta en ley universal.",
            "C) Siguiendo el modelo de la persona mas virtuosa de nuestra comunidad."
          ],
          "correct": "B) Solo segun la maxima que puedamos querer que se convierta en ley universal."
        },
        {
          "question": "La etica del cuidado (Gilligan, Noddings) surge principalmente como:",
          "options": [
            "A) Una variante del utilitarismo que incluye el bienestar emocional en el calculo moral.",
            "B) Una critica feminista a las eticas abstractas y universalistas, que coloca las relaciones concretas y el cuidado del otro vulnerable en el centro de la moral.",
            "C) Una actualizacion de la etica kantiana para incluir a las mujeres en el universo moral."
          ],
          "correct": "B) Una critica feminista a las eticas abstractas y universalistas, que coloca las relaciones concretas y el cuidado del otro vulnerable en el centro de la moral."
        },
        {
          "question": "Desde la etica de la virtud aristotelica, la pregunta etica fundamental es:",
          "options": [
            "A) Que consecuencias produce esta accion para el mayor numero?",
            "B) Esta accion es universalizable como ley moral?",
            "C) Que tipo de persona debo ser y que haria una persona virtuosa en esta situacion?"
          ],
          "correct": "C) Que tipo de persona debo ser y que haria una persona virtuosa en esta situacion?"
        },
        {
          "question": "Segun Transparencia Internacional (2022), que lugar ocupa Mexico en el Indice de Percepcion de la Corrupcion?",
          "options": [
            "A) Lugar 10 (muy poco corrupto)",
            "B) Lugar 126 de 180 (corrupcion significativa)",
            "C) Lugar 180 (el pais mas corrupto del mundo)"
          ],
          "correct": "B) Lugar 126 de 180 (corrupcion significativa)"
        },
        {
          "question": "El filosofo mexicano Leopoldo Zea argumento que la etica latinoamericana debe:",
          "options": [
            "A) Adoptar completamente la etica kantiana por ser la mas rigurosa y universal.",
            "B) Partir de la historia de dominacion colonial y el proyecto de liberacion propios de America Latina.",
            "C) Rechazar toda influencia de la filosofia occidental por considerarla colonial."
          ],
          "correct": "B) Partir de la historia de dominacion colonial y el proyecto de liberacion propios de America Latina."
        }
      ],
      "rubric": "RUBRICA — Aplicacion de enfoques eticos al dilema + carta etica (20 pts)\n\nAPLICACION DE LOS CUATRO ENFOQUES (8 pts): 8=Los cuatro enfoques aplicados correctamente al dilema con principio, respuesta y limitacion identificadas | 6=3 enfoques correctamente aplicados | 4=2 enfoques | 2=1 enfoque | 0=Sin aplicacion\n\nARGUMENTACION ETICA (6 pts): 6=Argumentacion filosofica rigurosa que va mas alla de la opinion: cita principios, identifica tensiones, reconoce limites de cada enfoque | 4=Argumentacion presente con algunas generalizaciones | 2=Opinion sin argumentacion filosofica | 0=Sin argumentacion\n\nCARTA ETICA PERSONAL (6 pts): 6=3 principios propios claramente enunciados, identificados con su enfoque etico de referencia y justificados con argumentacion personal | 4=2-3 principios con identificacion parcial | 2=Principios enunciados sin conexion con los enfoques | 0=Sin carta etica"
    },
    "teacher_tips": [
      "El dilema del medico rural (o cualquier dilema con escasez de recursos) es mas poderoso que el abstracto dilema del tranvia: conecta directamente con la realidad de la salud publica en Mexico, especialmente en comunidades alejadas donde los medicos del IMSS-Bienestar toman decisiones dificiles.",
      "La etica del cuidado es la mas desconocida y la que mas resiste en aulas donde la filosofia se ha ensenado siempre en version occidental canonizada. Presentala con fuerza: Gilligan cambio la psicologia y la etica al demostrar que el desarrollo moral no sigue la ruta universal kantiana sino que difiere segun el genero y la cultura.",
      "No presentes los cuatro enfoques como igualmente validos en todas las situaciones: hay situaciones donde el utilitarismo es mas adecuado y otras donde la deontologia lo es. La sabiduria etica es saber cual enfoque es mas pertinente en cada contexto.",
      "El tema de la corrupcion es de alta relevancia y alta sensibilidad: puede haber alumnos cuyas familias sobreviven gracias a practicas informales o incluso corruptas. Trata el tema con rigor filosofico y sin moralismos: el objetivo es comprender la corrupcion sistemica, no juzgar a individuos en situaciones de vulnerabilidad.",
      "Leopoldo Zea fue el filosofo mexicano mas influyente del siglo XX. Si los alumnos no lo conocen, vale la pena dedicar 5 minutos a su perfil: nacio en CDMX, fue alumno de Jose Gaos, estudio con Ortega y Gasset en Madrid, trabajo en la UNAM toda su vida. Es un modelo de intelectual mexicano que pensaba desde Mexico para el mundo."
    ]
  },
  "PFH-II-P03": {
    "code": "PFH-II-P03",
    "title": "Reflexiona sobre dilemas bioeticos contemporaneos (uso de tecnologias, medio ambiente, salud, derechos del cuerpo) desde marcos filosoficos criticos.",
    "level": "Pensamiento Filosofico y Humanidades II",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Intermedio",
    "category": "Bioetica",
    "metadata": {
      "objective": "El estudiante reflexiona sobre dilemas bioeticos contemporaneos relevantes para el contexto mexicano (acceso a la salud, derechos sobre el cuerpo propio, uso de inteligencia artificial en medicina, cambio climatico) usando marcos filosoficos eticos para argumentar posiciones fundamentadas.",
      "competencies": [
        "Define biotica y la distingue de la etica general: su objeto, sus principios y sus metodos",
        "Analiza dilemas bioeticos desde al menos dos marcos filosoficos distintos",
        "Aplica los cuatro principios de la bioetica (autonomia, beneficencia, no maleficencia, justicia) a casos concretos mexicanos",
        "Argumenta una posicion fundamentada ante un dilema bioetico reconociendo la pluralidad de perspectivas legitimas"
      ],
      "materials": [
        "Los cuatro principios de la bioetica (Beauchamp y Childress): autonomia, beneficencia, no maleficencia, justicia",
        "Casos bioeticos mexicanos: la despenalizacion del aborto en Mexico (SCJN 2021), el acceso equitativo a vacunas COVID-19 en Mexico (2021), el uso de datos clinicos por algoritmos de IA, el cobro de servicios de salud en comunidades indigenas",
        "Carta de los Derechos de los Pacientes (CONAMED-SSA Mexico)",
        "Informe de la CNDH sobre derecho a la salud en Mexico",
        "Fragmentos del informe de bioetica de la UNESCO (Declaracion Universal sobre Bioetica y Derechos Humanos)"
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "15 min", "label": "Que es bioetica? Casos que cambiaron la etica medica en Mexico"},
        {"phase": "Desarrollo", "duration": "65 min", "label": "Aplicacion de los 4 principios bioeticos a 2 casos mexicanos contemporaneos"},
        {"phase": "Cierre", "duration": "20 min", "label": "Debate: la despenalizacion del aborto en Mexico — cuatro principios en tension"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "15 min",
          "description": "El docente presenta brevemente como la bioetica nace en los 70 tras escandalo etico en la investigacion medica (experimento Tuskegee en EEUU: 400 hombres afroamericanos con sifilis observados sin tratamiento durante 40 anos para estudiar el avance de la enfermedad). Pregunta: cuando un medico puede o debe actuar sobre el cuerpo de una persona? Quien decide? Esto introduce la bioetica como etica aplicada al campo de la vida y la salud.",
          "activity": "Casos rapidos de respuesta intuitiva: el docente presenta 4 situaciones (1 minuto cada una): un medico niega atencion por falta de dinero, una mujer pide abortar en estado donde es ilegal, un hospital vende datos de pacientes a empresa farmaceutica, un medico aplica tratamiento experimental sin consentimiento informado. Los alumnos votan en cada caso: esto esta bien? Activa el conflicto moral antes de la teoria."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "65 min",
          "description": "Presentacion de los cuatro principios de la bioetica (Beauchamp y Childress, Principios de etica biomedica, 1979): Autonomia (respetar la capacidad del paciente de tomar sus propias decisiones), Beneficencia (actuar en beneficio del paciente), No maleficencia (no causar dano), Justicia (distribuir equitativamente los beneficios y cargas de la atencion medica). Aplicacion en equipos a dos casos mexicanos: (1) el acceso diferenciado a vacunas COVID-19 (prioridad a adultos mayores vs trabajadores esenciales vs personas con comorbilidades), (2) el debate sobre la despenalizacion del aborto (SCJN, septiembre 2021).",
          "activity": "Cada equipo analiza su caso: que principios bioeticos estan en tension, que argumento favorece a cada posicion, como deberia resolverse desde la bioetica. Presentacion con tabla de principios aplicados."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "20 min",
          "description": "Debate sobre el caso del aborto: la SCJN (Suprema Corte de Justicia de la Nacion) resolvio en septiembre de 2021 que criminalizar el aborto es inconstitucional. Pero el debate bioetico no termina con una sentencia legal: sigue habiendo tension entre el principio de autonomia (la mujer decide sobre su cuerpo) y diversas concepciones del principio de no maleficencia (no dañar al feto como ser en desarrollo). Los alumnos argumentan desde los principios bioeticos, no desde posiciones religiosas o politicas.",
          "activity": "Reflexion escrita final: el alumno escribe 1 parrafo sobre un dilema bioetico que le afecta o le podria afectar en su vida (acceso a medicamentos, derechos sobre su propio cuerpo, uso de sus datos medicos por tecnologias digitales) y como lo analizaria desde los principios bioeticos. Se guarda en el portafolio filosofico."
        }
      ]
    },
    "theory": {
      "introduction": "La bioetica es la rama de la filosofia que estudia los dilemas morales en el campo de las ciencias de la vida y la salud: la medicina, la biologia, la biotecnologia, el medio ambiente. Nace como disciplina en los anos 70 del siglo XX tras una serie de escandales en la investigacion medica (experimento Tuskegee, experimentos nazis revelados en los juicios de Nuremberg) que evidenciaron la necesidad de principios eticos para guiar la practica medica y la investigacion cientifica. En Mexico, la bioetica tiene instituciones propias: la CONAMED (Comision Nacional de Arbitraje Medico), la Comision Nacional de Bioetica (CONBIOET) de la Secretaria de Salud, y el Comite de Bioetica del IMSS. La Declaracion Universal sobre Bioetica y Derechos Humanos de la UNESCO (2005) establece principios internacionales de bioetica que Mexico ha suscrito.",
      "sections": [
        {
          "subtitle": "Los Cuatro Principios de la Bioetica",
          "content": "Tom Beauchamp y James Childress, en Principios de etica biomedica (1979), propusieron cuatro principios que se han convertido en el marco de referencia mas ampliamente usado en bioetica: Autonomia: el principio de respeto a la capacidad de autodeterminacion del paciente. El consentimiento informado es su expresion practica: el paciente debe recibir informacion suficiente y decidir libremente sobre su tratamiento. En Mexico, la Carta de los Derechos de los Pacientes (CONAMED/SSA) reconoce 9 derechos, incluyendo el de decidir libremente sobre su atencion medica. Beneficencia: actuar siempre en beneficio del paciente. El medico debe buscar el bien del paciente, no el propio (evitar conflictos de interes, no realizar tratamientos innecesarios por lucro). No maleficencia: primum non nocere (lo primero, no dañar). Antes de buscar el beneficio, evitar el dano. Principio que guia la prudencia en tratamientos experimentales o de alto riesgo. Justicia: distribuir equitativamente los beneficios y cargas de la atencion medica. En Mexico, esto es especialmente critico dada la desigualdad en el acceso a la salud: en 2020, 28.2 millones de mexicanos no tenian acceso a servicios de salud (CONEVAL). La justicia distributiva en salud demanda que los mas vulnerables tengan acceso prioritario a los recursos escasos."
        },
        {
          "subtitle": "Dilemas Bioeticos en Mexico Contemporaneo",
          "content": "Mexico enfrenta dilemas bioeticos especificos vinculados a su contexto: (1) Aborto y derechos reproductivos: en septiembre de 2021, la SCJN resolvio que criminalizar el aborto es inconstitucional. Para 2023, 12 estados habian despenalizado el aborto. El debate bioetico involucra: autonomia de la mujer vs no maleficencia hacia el embrion/feto, justicia en el acceso a servicios de aborto seguro (las mujeres pobres mueren por abortos clandestinos), beneficencia (la maternidad forzada puede causar dano grave). (2) Acceso equitativo a la salud: la brecha entre el IMSS/ISSSTE (trabajadores formales) y el IMSS-Bienestar (poblacion sin seguridad social) es un problema de justicia bioetica. (3) Inteligencia artificial en medicina: los algoritmos de diagnostico medico pueden reproducir sesgos de datos historicos (diagnosticos menos precisos para mujeres y personas indigenas si los datos de entrenamiento eran predominantemente de hombres blancos). (4) Cambio climatico y salud: el INSP (Instituto Nacional de Salud Publica) documenta el impacto del cambio climatico en la salud en Mexico: mayor incidencia de enfermedades vectoriales (dengue, zika) en zonas afectadas por el calentamiento."
        },
        {
          "subtitle": "Bioetica y Diversidad Cultural en Mexico",
          "content": "Un desafio especifico de la bioetica en Mexico es la diversidad cultural: las comunidades indigenas tienen concepciones de la salud, el cuerpo, la enfermedad y la muerte que no siempre coinciden con el modelo biomedico occidental. La medicina tradicional mexicana (herbolaria, parteria, curanderismo) es practicada por millones de mexicanos y es reconocida por la Ley General de Salud (Art. 93) como parte del sistema de salud. Los principios bioeticos, especialmente la autonomia, deben interpretarse en contextos culturales distintos: una decision medica tomada en el marco de la familia extensa o la comunidad no viola la autonomia si esa es la forma de decision que el paciente reconoce como propia. El Instituto Nacional de Medicina Tradicional (INMT) y el Instituto Nacional Indigenista (INI, hoy INPI) han promovido la interculturalidad en la atencion a la salud: reconocer y articular la medicina tradicional con la medicina convencional sin imponer un modelo sobre otro."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "El principio de autonomia en bioetica implica que:",
          "options": [
            "A) El medico decide siempre lo mejor para el paciente porque tiene mas conocimiento.",
            "B) El paciente tiene derecho a recibir informacion suficiente y decidir libremente sobre su tratamiento (consentimiento informado).",
            "C) El Estado puede intervenir en la salud de las personas cuando esto beneficia a la sociedad."
          ],
          "correct": "B) El paciente tiene derecho a recibir informacion suficiente y decidir libremente sobre su tratamiento (consentimiento informado)."
        },
        {
          "question": "En septiembre de 2021, la SCJN resolvio que criminalizar el aborto en Mexico es:",
          "options": [
            "A) Constitucional, porque el Estado tiene el deber de proteger la vida desde la concepcion.",
            "B) Inconstitucional, vulnerando los derechos reproductivos de las mujeres.",
            "C) Un tema exclusivamente religioso que la Corte no puede decidir."
          ],
          "correct": "B) Inconstitucional, vulnerando los derechos reproductivos de las mujeres."
        },
        {
          "question": "El principio de justicia en bioetica se relaciona principalmente con:",
          "options": [
            "A) El deber del medico de no causar dano al paciente durante el tratamiento.",
            "B) La distribucion equitativa de los beneficios y cargas de la atencion medica entre la poblacion.",
            "C) El derecho del medico de negarse a realizar procedimientos que violen su conciencia."
          ],
          "correct": "B) La distribucion equitativa de los beneficios y cargas de la atencion medica entre la poblacion."
        },
        {
          "question": "El reconocimiento de la medicina tradicional mexicana en la Ley General de Salud implica, desde la perspectiva bioetica:",
          "options": [
            "A) Que la medicina tradicional es mas efectiva que la biomedica y debe sustituirla.",
            "B) Un enfoque de interculturalidad en salud que articula medicina tradicional y convencional respetando la autonomia cultural del paciente.",
            "C) Que solo los medicos bilingues pueden ejercer en comunidades indigenas."
          ],
          "correct": "B) Un enfoque de interculturalidad en salud que articula medicina tradicional y convencional respetando la autonomia cultural del paciente."
        },
        {
          "question": "La bioetica nace como disciplina en los anos 70 principalmente a partir de:",
          "options": [
            "A) Los avances en genetica que permitieron clonar seres vivos por primera vez.",
            "B) Escandales en la investigacion medica (experimento Tuskegee, experimentos nazis) que evidenciaron la necesidad de principios eticos.",
            "C) La demanda de los medicos de tener un codigo de conducta propio diferente al de otras profesiones."
          ],
          "correct": "B) Escandales en la investigacion medica (experimento Tuskegee, experimentos nazis) que evidenciaron la necesidad de principios eticos."
        }
      ],
      "rubric": "RUBRICA — Analisis bioetico de caso mexicano (20 pts)\n\nAPLICACION DE LOS 4 PRINCIPIOS (8 pts): 8=Los 4 principios aplicados correctamente al caso, identificando cuales estan en tension y como | 6=3 principios aplicados | 4=2 principios | 2=1 principio | 0=Sin aplicacion\n\nARGUMENTACION FILOSOFICA (6 pts): 6=Argumentacion que va mas alla de la opinion: cita principios, enfrenta tensiones, reconoce perspectivas legitimas distintas | 4=Argumentacion presente con algunas generalizaciones | 2=Opinion sin argumentacion bioetica | 0=Sin argumentacion\n\nCONTEXTUALIZACION MEXICANA (4 pts): 4=El analisis conecta el dilema con el contexto especifico de Mexico (instituciones, leyes, datos de salud) | 3=Mencion del contexto mexicano con algun dato especifico | 2=Contexto mexicano mencionado sin datos | 0=Sin contextualizacion\n\nREFLEXION PERSONAL (2 pts): 2=El parrafo de reflexion personal es autentico, especifico y filosoficamente fundamentado | 1=Reflexion presente pero superficial | 0=Sin reflexion"
    },
    "teacher_tips": [
      "El tema del aborto es altamente sensible en Mexico y puede generar reacciones fuertes. El objetivo no es que los alumnos cambien su posicion moral sino que aprendan a argumentar filosoficamente desde los principios bioeticos, distinguiendo argumentos filosoficos de dogmas religiosos o politicos.",
      "Contextualiza el experimento Tuskegee con detalle antes de usarlo como detonador: 1932-1972, EEUU, hombres afroamericanos con sifilis a quienes se nego penicilina disponible para estudiar la evolucion de la enfermedad. Fue denunciado por un periodista, no por los medicos. Este escandalo genero el Informe Belmont (1979) que inspiro los cuatro principios.",
      "La CONAMED (Comision Nacional de Arbitraje Medico) es un organismo real que los alumnos pueden consultar si tienen problemas con servicios medicos. Que sepan que existe es un dato civico valioso.",
      "Para el tema de IA en medicina: usa ejemplos cercanos. Algoritmos de deteccion de cancer de piel que funcionan mejor para piel clara. Sistemas de diagnostico que muestran sesgo de genero. Esto hace que la bioetica digital sea concreta y urgente.",
      "El tema de la medicina tradicional puede conectar con las experiencias de los alumnos: probablemente muchos conocen curanderos, parteras, yerbateros o han recibido tratamientos de medicina tradicional. Validar esas experiencias como material de reflexion bioetica autentica."
    ]
  },
  "PFH-II-P04": {
    "code": "PFH-II-P04",
    "title": "Incorpora la perspectiva de genero al analisis filosofico, cuestionando sesgos historicos en la produccion del conocimiento y la etica.",
    "level": "Pensamiento Filosofico y Humanidades II",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Intermedio",
    "category": "Filosofia y genero",
    "metadata": {
      "objective": "El estudiante incorpora la perspectiva de genero al analisis filosofico, identificando los sesgos androcentricos en la historia de la filosofia occidental y reconociendo las aportaciones de filosofas mexicanas y latinoamericanas al pensamiento feminista y a la etica del cuidado.",
      "competencies": [
        "Identifica el androcentrismo como sesgo epistemologico en la filosofia occidental canonizada",
        "Analiza las aportaciones de filosofas (Beauvoir, Wollstonecraft, Gilligan, Lugones, Hierro) al pensamiento filosofico",
        "Aplica la perspectiva de genero al analisis de problemas filosoficos clasicos (la razon, la etica, la identidad)",
        "Reflexiona sobre como el genero estructura el acceso al conocimiento y al reconocimiento intelectual en Mexico"
      ],
      "materials": [
        "Fragmentos: Simone de Beauvoir (El segundo sexo: no se nace mujer, se llega a serlo), Graciela Hierro (Etica y feminismo, UNAM), Maria Lugones (Colonialidad y genero)",
        "Linea del tiempo: filosofas invisibilizadas en la historia de la filosofia",
        "Datos ANUIES sobre acceso de mujeres a estudios de filosofia en Mexico",
        "Casos de invisibilizacion: Hipatia de Alejandria, Christine de Pisan, Sor Juana Ines de la Cruz como filosofa",
        "Materiales sobre el pensamiento de Sor Juana como pionera del feminismo en America"
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "15 min", "label": "Cuantas filosofas conoces? La invisibilizacion de las mujeres en la historia de la filosofia"},
        {"phase": "Desarrollo", "duration": "65 min", "label": "Androcentrismo en la filosofia + aportaciones de filosofas mexicanas y latinoamericanas"},
        {"phase": "Cierre", "duration": "20 min", "label": "Sor Juana como filosofa feminista avant la lettre: su Respuesta a Sor Filotea"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "15 min",
          "description": "El docente pregunta: puedes nombrar 5 filosofos varones? La mayoria puede. Puedes nombrar 5 filosofas mujeres? La mayoria no puede. Esto no es accidente: es el resultado de un proceso historico sistematico de invisibilizacion. Se introduce el concepto de canon filosofico como construccion historica y social, no como seleccion neutral de los mejores pensadores.",
          "activity": "Investigacion relampago: en 3 minutos, cada alumno busca en su celular el nombre de una filosofa de cualquier pais y epoca, y una idea central de su pensamiento. Se socializan en 2 minutos: los alumnos descubren que hay muchas filosofas que no conocian. El docente anota los nombres en el pizarron: el canon es mas amplio de lo que nos ensenaron."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "65 min",
          "description": "Presentacion del androcentrismo filosofico: como la razon, la autonomia y la objetividad (valores supremos de la filosofia occidental) han sido asociados historicamente con lo masculino, mientras la emocion, la dependencia y la subjetividad han sido asociadas con lo femenino e infravaloradas. Ejemplos en Aristoteles (las mujeres son seres incompletos), Kant (las mujeres no pueden razonar moralmente de manera autonoma), Rousseau (la mujer debe educarse para agradar al hombre). Luego: las respuestas filosoficas de Wollstonecraft, Beauvoir, Gilligan, y las filosofas mexicanas Graciela Hierro y la figura de Sor Juana.",
          "activity": "Analisis de fragmentos en parejas: (1) Beauvoir: no se nace mujer, se llega a serlo — que quiere decir? Cuales son sus implicaciones para la etica y la ontologia? (2) Graciela Hierro (UNAM): la etica femenina como etica de la responsabilidad y el cuidado. (3) Sor Juana (Respuesta a Sor Filotea, 1691): la defensa del derecho de las mujeres al conocimiento como argumento filosofico-teologico. Discusion: que aporta cada una al pensamiento filosofico?"
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "20 min",
          "description": "Sor Juana Ines de la Cruz (1651-1695) como filosofa y proto-feminista. La Respuesta a Sor Filotea (1691) es un texto filosofico-autobiografico donde Sor Juana defiende el derecho de las mujeres al conocimiento usando argumentos racionales y teologicos. Es considerada por muchos especialistas del IIFL-UNAM y del Colegio de Mexico como la primera feminista de America. Discusion: es justo llamar a Sor Juana feminista avant la lettre? Sus argumentos siguen siendo relevantes?",
          "activity": "Ensayo breve (10 min): el alumno responde en 1 parrafo: como cambia tu vision de la filosofia al incorporar la perspectiva de genero? Que perdemos cuando el canon filosofico excluye a las mujeres? Este texto se guarda en el portafolio filosofico."
        }
      ]
    },
    "theory": {
      "introduction": "La historia canonizada de la filosofia occidental es predominantemente masculina: de los 100 filosofos mas citados en los libros de texto de bachillerato y universidad, menos del 5% son mujeres. Esta no es una realidad natural sino el resultado de una exclusion historica sistematica: las mujeres fueron excluidas durante siglos de las instituciones educativas, las academias filosoficas y los espacios de produccion del conocimiento. En Mexico, esta exclusion tiene una figura emblematica: Sor Juana Ines de la Cruz (1651-1695), considerada la primera gran intelectual del Continente Americano y una de las primeras voces en defender el derecho de las mujeres al conocimiento. La filosofia con perspectiva de genero no es una adicion marginal al pensamiento filosofico: es una correccion necesaria que enriquece la comprension de la razon, la etica, la identidad y la politica.",
      "sections": [
        {
          "subtitle": "Androcentrismo en la Filosofia: La Razon como Privilegio Masculino",
          "content": "El androcentrismo es la tendencia a tomar al hombre como medida y referente universal de lo humano, invisibilizando o infravalorar las experiencias y perspectivas de las mujeres. En la filosofia occidental, el androcentrismo se manifiesta en: Aristoteles (384-322 a.C.): las mujeres son seres incompletos, con menos razon que los hombres. Su lugar natural es el oikos (la casa), no la polis (el espacio publico y politico). Kant (1724-1804): las mujeres son incapaces de razonamiento moral autonomo porque se guian por sentimientos, no por la razon pura. Jean-Jacques Rousseau (1712-1778): Sophie, la mujer ideal en Emilio, debe educarse para servir a Emilio, el ciudadano racional. Esta exclusion no es solo historica: se reproduce en la contemporaneidad cuando los departamentos de filosofia tienen menos mujeres que los de ciencias exactas, y cuando las filosofas reciben menos citas que sus colegas varones con igual produccion."
        },
        {
          "subtitle": "Filosofas que Transformaron el Pensamiento",
          "content": "Mary Wollstonecraft (1759-1797): en Vindicacion de los derechos de la mujer (1792), argumento que las mujeres son racionales y que su aparente irracionalidad es el resultado de una educacion deficiente, no de su naturaleza. Es considerada la fundadora del feminismo moderno. Simone de Beauvoir (1908-1986): en El segundo sexo (1949), desarrollo la tesis de que la feminidad no es un dato biologico sino una construccion social. No se nace mujer, se llega a serlo. Esta idea anticipo la distincion contemporanea entre sexo (biologico) y genero (social). Carol Gilligan (1936): En In a Different Voice (1982), critico la teoria del desarrollo moral de Kohlberg (basada en datos de hombres) y propuso que las mujeres desarrollan una etica del cuidado distinta a la etica de la justicia abstracta. En Mexico: Graciela Hierro (1928-2003), filosofa de la UNAM, fue pionera del feminismo filosofico en Mexico. En Etica y feminismo (1985), analizo como la etica tradicional habia invisibilizado la experiencia moral de las mujeres. Maria Lugones (1944-2020), filosofa argentina-estadounidense, desarrollo el concepto de colonialidad del genero: la colonizacion no solo impuso relaciones de raza y clase sino tambien un sistema de genero binario que destruyo las formas de genero indigenas."
        },
        {
          "subtitle": "Sor Juana Ines de la Cruz: La Primera Filosofa de America",
          "content": "Sor Juana Ines de la Cruz (1651-1695) es considerada por muchos especialistas la primera gran intelectual y filosfa de la America colonial. Monja jeronima en la Ciudad de Mexico, produjo obra literaria, cientifica y filosofica de primer nivel en un siglo donde las mujeres estaban excluidas de las universidades y de la vida intelectual publica. Su texto mas filosofico es la Respuesta a Sor Filotea de la Cruz (1691): una carta-ensayo donde responde a las criticas del Obispo de Puebla (que se habia firmado con el pseudonimo Sor Filotea) por publicar sus reflexiones teologicas y filosoficas. Sor Juana defiende en este texto el derecho de las mujeres al conocimiento usando argumentos racionales, teologicos y autobiograficos. Sus argumentos: la razon y el deseo de conocer son capacidades humanas universales, no privilegio de los hombres. Si Dios me dio un intelecto agudo, usarlo es cumplir mi obligacion con Dios, no violarlo. La ignorancia no es virtud cristiana sino deshonra. Este texto es considerado por el IIFL-UNAM como uno de los documentos fundacionales del pensamiento feminista en America Latina."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "El androcentrismo en la filosofia occidental se refiere a:",
          "options": [
            "A) La preferencia por filosofos de origen europeo sobre los de otras regiones del mundo.",
            "B) La tendencia a tomar al hombre como medida universal de lo humano, invisibilizando las perspectivas de las mujeres.",
            "C) El estudio de las relaciones entre hombres y mujeres desde una perspectiva biologica."
          ],
          "correct": "B) La tendencia a tomar al hombre como medida universal de lo humano, invisibilizando las perspectivas de las mujeres."
        },
        {
          "question": "La tesis central de Simone de Beauvoir en El segundo sexo es:",
          "options": [
            "A) La biologia determina el destino de las mujeres: ser mujer es un hecho natural e inmutable.",
            "B) No se nace mujer, se llega a serlo: la feminidad es una construccion social, no un dato biologico.",
            "C) Las mujeres y los hombres son fundamentalmente iguales en biologia y en cultura."
          ],
          "correct": "B) No se nace mujer, se llega a serlo: la feminidad es una construccion social, no un dato biologico."
        },
        {
          "question": "Sor Juana Ines de la Cruz es importante en la historia del pensamiento filosofico porque:",
          "options": [
            "A) Fue la primera mujer en ser admitida en la Real y Pontificia Universidad de Mexico.",
            "B) En su Respuesta a Sor Filotea (1691) defendio el derecho de las mujeres al conocimiento usando argumentos racionales y teologicos.",
            "C) Descubrio las leyes de la fisica clasica antes que Newton, pero su obra fue atribuida a otros."
          ],
          "correct": "B) En su Respuesta a Sor Filotea (1691) defendio el derecho de las mujeres al conocimiento usando argumentos racionales y teologicos."
        },
        {
          "question": "El concepto de colonialidad del genero, desarrollado por Maria Lugones, sostiene que:",
          "options": [
            "A) El colonialismo europeo solo afecto las relaciones economicas y politicas de America, no las de genero.",
            "B) La colonizacion impuso un sistema de genero binario que destruyo las formas de genero propias de los pueblos indigenas.",
            "C) Las mujeres indigenas fueron las principales beneficiadas del proceso colonial por la proteccion que les ofrecia."
          ],
          "correct": "B) La colonizacion impuso un sistema de genero binario que destruyo las formas de genero propias de los pueblos indigenas."
        },
        {
          "question": "Graciela Hierro fue pionera del feminismo filosofico en Mexico trabajando en:",
          "options": [
            "A) El ITESM (Tecnologico de Monterrey)",
            "B) La UNAM, donde publico Etica y feminismo en 1985",
            "C) El Colegio de Mexico, donde estudio con Octavio Paz"
          ],
          "correct": "B) La UNAM, donde publico Etica y feminismo en 1985"
        }
      ],
      "rubric": "RUBRICA — Analisis de sesgo androcentrista + ensayo de perspectiva de genero (20 pts)\n\nIDENTIFICACION DEL ANDROCENTRISMO (6 pts): 6=Identifica correctamente el androcentrismo en al menos 2 filosofos del canon con citas y analisis | 4=Identificacion con argumentacion parcial | 2=Mencion sin analisis | 0=Sin identificacion\n\nANALISIS DE FILOSOFAS (7 pts): 7=Analiza las aportaciones de al menos 2 filosofas (incluyendo al menos una mexicana o latinoamericana) con referencias textuales | 5=1 filosofa analizada con profundidad | 3=Menciones sin analisis | 0=Sin analisis de filosofas\n\nENSAYO DE PERSPECTIVA DE GENERO (7 pts): 7=Ensayo que aplica la perspectiva de genero al problema filosofico elegido con argumentacion solida y referentes filosoficos especificos | 5=Aplicacion parcial con argumentacion | 3=Perspectiva de genero mencionada sin aplicacion filosofica | 0=Sin ensayo"
    },
    "teacher_tips": [
      "La actividad de nombrar filosofas al inicio es reveladora y a veces vergonzante para el grupo: muy pocos pueden nombrar mas de 1 o 2. Convierte ese momento en curiosidad, no en culpa: lo que no sabemos es la oportunidad de aprender.",
      "Sor Juana es el recurso pedagógico mas poderoso en este tema: es mexicana, colonial, brillante, y su defensa del derecho al conocimiento sigue siendo emocionalmente resonante hoy. Su Respuesta a Sor Filotea puede leerse en fragmentos accesibles para bachillerato. El IIFL-UNAM tiene ediciones comentadas.",
      "Para el androcentrismo en Aristoteles y Kant: no presentes a estos filosofos como malos. Son grandes pensadores que compartian los supuestos de su epoca. Lo que cambia es que hoy tenemos herramientas para ver lo que ellos no podian ver. La filosofia progresa.",
      "La distincion sexo/genero (Beauvoir) es probablemente la idea mas importante y mas contestada de esta clase. Algunos alumnos la resistiran desde posiciones religiosas o culturales. Trabajala con respeto pero con claridad: es una distincion filosofica, no politica.",
      "Conecta con la actualidad: el movimiento feminista en Mexico (marcha del 8M, el paro, el tendedero) es una expresion contemporanea de las ideas que estas filosofas desarrollaron. Los alumnos pueden ver la filosofia en la calle."
    ]
  },
  "PFH-II-P05": {
    "code": "PFH-II-P05",
    "title": "Reconoce el humanismo mexicano (en sus vertientes indigena, novohispana y moderna) como tradicion filosofica propia y vigente.",
    "level": "Pensamiento Filosofico y Humanidades II",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Intermedio",
    "category": "Humanismo mexicano",
    "metadata": {
      "objective": "El estudiante reconoce el humanismo mexicano en sus tres grandes vertientes historicas (pensamiento mesoamericano, humanismo novohispano y humanismo moderno) como tradicion filosofica propia y vigente, identificando la continuidad y la transformacion de sus preguntas centrales a lo largo de la historia de Mexico.",
      "competencies": [
        "Identifica las caracteristicas del humanismo mesoamericano: el concepto de tlaltipac, la etica del buen vivir nahuatl, la concepcion de la persona",
        "Analiza el humanismo novohispano: Vasco de Quiroga, Bartolome de las Casas, Sor Juana como defensores de la dignidad humana",
        "Distingue el humanismo moderno mexicano: Jose Vasconcelos, Samuel Ramos, Leopoldo Zea, la busqueda de una identidad mexicana",
        "Reflexiona sobre la vigencia del humanismo mexicano para los desafios del siglo XXI"
      ],
      "materials": [
        "Fragmentos: Leon-Portilla (La filosofia nahuatl — el ideal educativo nahuatl), Vasco de Quiroga (De debellandis Indis — en contra de la esclavitud), Vasconcelos (La raza cosmica), Leopoldo Zea (El positivismo en Mexico)",
        "Linea del tiempo del humanismo mexicano: desde los Tlamatinime hasta hoy",
        "Mapa de las utopias de Vasco de Quiroga en Michoacan (hospitales-pueblo)",
        "Fragmentos del Discurso por la inauguracion de la SEP (Vasconcelos, 1921)",
        "Datos de la filosofia mexicana en instituciones: IIF-UNAM, El Colegio de Mexico"
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "15 min", "label": "Linea del tiempo del humanismo mexicano: de los Tlamatinime a Leopoldo Zea"},
        {"phase": "Desarrollo", "duration": "65 min", "label": "Analisis de las tres vertientes del humanismo mexicano"},
        {"phase": "Cierre", "duration": "20 min", "label": "El humanismo mexicano hoy: sigue siendo relevante? Debate"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "15 min",
          "description": "El docente presenta la linea del tiempo del humanismo mexicano en el pizarron: Tlamatinime nahuas (siglos X-XVI), Vasco de Quiroga y los humanistas novohispanos (XVI), Sor Juana (XVII), Independencia y humanismo liberal (XIX), Vasconcelos y el humanismo cultural (1920s), Ramos y Zea: el ser del mexicano (1940s-1970s), filosofia contemporanea (IIF-UNAM). Pregunta: hay una continuidad en estas tradiciones? Que preguntas comparten?",
          "activity": "Tres preguntas comunes: el docente propone que las tres vertientes del humanismo mexicano comparten tres preguntas: quien es el ser humano?, como debe vivir bien en comunidad?, que significa ser mexicano? Los alumnos votan: cual les parece la mas importante y por que."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "65 min",
          "description": "Analisis de las tres vertientes con textos: (1) Humanismo mesoamericano: los Tlamatinime (sabios nahuas) elaboraron una vision del ser humano como ser en busca del rostro y del corazon (ixtli, yollotl). La educacion en el Calmecac y el Telpochcalli: el ideal del ser humano. Leon-Portilla documenta el ideal nahuatl: vivir con sabiduria, fortalecer el corazon. (2) Humanismo novohispano: Vasco de Quiroga (1470-1565) critica la conquista violenta e implementa los hospitales-pueblo en Michoacan inspirado en la Utopia de Tomas Moro. Bartolome de las Casas: la primera defensa juridica de los derechos de los pueblos indigenos. (3) Humanismo moderno: Vasconcelos y La raza cosmica (1925): la vision de una nueva humanidad mestiza; Leopoldo Zea y el mexicano como ser filosofico con preguntas propias.",
          "activity": "Analisis en equipos con texto: cada equipo lee el fragmento de su vertiente y responde: que concepcion del ser humano propone, que valores humanistas defiende, como se relaciona con el contexto historico de su epoca, que puede aportar al humanismo del siglo XXI."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "20 min",
          "description": "El humanismo mexicano hoy: debate sobre su relevancia. La filosofia de los pueblos indigenas (buen vivir, autonomia comunitaria, relacion con la naturaleza) está siendo reivindicada como alternativa al modelo de desarrollo capitalista. El concepto nahuatl de tlamatiliztli (sabiduria) o el zapatista de mandar obedeciendo son aportes del humanismo mesoamericano a los debates politicos contemporaneos.",
          "activity": "Proyecto de portafolio: cada alumno escribe en su portafolio filosofico una reflexion personal: cual de las tres vertientes del humanismo mexicano resuena mas con su propia experiencia y valores, y por que. No hay respuesta correcta: la filosofia es tambien autobiografia."
        }
      ]
    },
    "theory": {
      "introduction": "Mexico tiene una tradicion filosofica propia y multisecular que suele ser ignorada en favor del canon occidental. Esta tradicion tiene tres grandes vertientes historicas: el pensamiento mesoamericano prehispanico (los Tlamatinime nahuas, los sabios mayas del Popol Vuh, la cosmologia zapoteca), el humanismo novohispano del siglo XVI (Vasco de Quiroga, Bartolome de las Casas, la defensa de la dignidad indigena) y el humanismo moderno del siglo XX (Jose Vasconcelos, Samuel Ramos, Leopoldo Zea). Reconocer esta tradicion propia no es nacionalismo: es el reconocimiento de que la filosofia es una actividad humana universal que se practica en todas las culturas y que America Latina, y Mexico en particular, ha producido pensadores de primer nivel que merecen ser conocidos junto a los canonicos europeos.",
      "sections": [
        {
          "subtitle": "Humanismo Mesoamericano: Los Tlamatinime y el Ideal del Ser Humano",
          "content": "Los Tlamatinime (literalmente: los que saben algo, los sabios) eran los filosofos de la cultura nahuatl. Segun Miguel Leon-Portilla (La filosofia nahuatl, 1956), desarrollaron preguntas filosoficas sobre el ser humano, la vida, la muerte y el cosmos. Su concepto de persona: el ser humano debe buscar su rostro (ixtli) y su corazon (yollotl), es decir, su identidad y su caracter moral. Esta busqueda es el objetivo de la educacion nahuatl en el Calmecac (escuela para nobles y sacerdotes) y el Telpochcalli (escuela para jovenes del pueblo). El ideal nahuatl del ser humano: in ixtli in yollotl — rostro y corazon — es una vision integral que une razon y emocion, intelecto y moral. El Popol Vuh (libro sagrado de los quiches mayas) tiene una vision paralela: los seres humanos son creados para trabajar, alabar a los dioses y cuidar la tierra. Estas visiones de la persona humana tienen afinidades con el humanismo griego clasico (la paideia, la formacion integral del ciudadano) y con el humanismo renacentista europeo, pero se desarrollaron de manera independiente."
        },
        {
          "subtitle": "Humanismo Novohispano: La Defensa de la Dignidad",
          "content": "El humanismo novohispano del siglo XVI es el primer gran debate filosofico en suelo americano: la discusion sobre si los pueblos indigenas son seres humanos con plena dignidad y derechos, o si pueden ser esclavizados y sometidos por los europeos. Bartolome de las Casas (1484-1566): dominico espanol, ex-encomendero convertido en defensor de los indigenas. En Brevisima relacion de la destruicion de las Indias (1542) documenta la violencia de la conquista y argumenta que los pueblos indigenas son seres racionales con plena dignidad humana. Logro que Carlos I promulgara las Leyes Nuevas (1542) que limitaban la esclavitud de los indigenas. Vasco de Quiroga (1470-1565): primer obispo de Michoacan. Inspirado en la Utopia de Tomas Moro, fundo los hospitales-pueblo de Santa Fe (CDMX) y Patzcuaro (Michoacan): comunidades autosuficientes donde los indigenas vivian, se gobernaban y trabajaban colectivamente. Estos experimentos son considerados las primeras utopias realizadas del Nuevo Mundo. Son un antecedente del pensamiento comunitario que sigue vivo en Michoacan: la artesania de Patzcuaro, las comunidades purepechas de Paracho y Nurío, tienen raices directas en la vision humanista de Quiroga."
        },
        {
          "subtitle": "Humanismo Moderno Mexicano: Vasconcelos, Ramos, Zea",
          "content": "Jose Vasconcelos (1882-1959): primer secretario de Educacion Publica de Mexico (1921-1924). En La raza cosmica (1925) propone que America Latina es el laboratorio donde se gestara una nueva humanidad que integra las razas y culturas del mundo. El lema de la UNAM que el acuno, Por mi raza hablara el espiritu, refleja esta vision. Aunque su concepto de raza cosmica ha sido criticado por su mestizofilia (que puede invisibilizar a los pueblos indigenas), su proyecto educativo (la campana de alfabetizacion, las escuelas rurales, el muralismo como arte publico) fue un hito humanista. Samuel Ramos (1897-1959): en El perfil del hombre y la cultura en Mexico (1934), analiza el caracter del mexicano usando el psicoanalisis de Adler: el complejo de inferioridad como mecanismo de defensa ante la experiencia historica de la conquista. Aunque cuestionada metodologicamente, abrió el debate sobre la identidad mexicana como objeto de reflexion filosofica. Leopoldo Zea (1912-2004): la figura cumbre de la filosofia mexicana del siglo XX. Argumento que los latinoamericanos deben hacer filosofia desde su propia circunstancia historica, no como epigonos de Europa. Sus obras fundamentales: El positivismo en Mexico (1943), La filosofia como compromiso (1952), Filosofia de la Historia Americana (1978)."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "En la filosofia nahuatl, el concepto de in ixtli in yollotl (rostro y corazon) se refiere al:",
          "options": [
            "A) Sistema de escritura jeroglifica de los aztecas para registrar la historia.",
            "B) Ideal del ser humano que busca su identidad y su caracter moral a traves de la educacion.",
            "C) Calendario ritual de 260 dias que guiaba las actividades agricolas."
          ],
          "correct": "B) Ideal del ser humano que busca su identidad y su caracter moral a traves de la educacion."
        },
        {
          "question": "Vasco de Quiroga fundo los hospitales-pueblo en Michoacan inspirado en:",
          "options": [
            "A) La Republica de Platon, como modelo de ciudad ideal gobernada por filosofos.",
            "B) La Utopia de Tomas Moro, como comunidades autosuficientes y colectivas.",
            "C) El modelo de las misiones franciscanas de California."
          ],
          "correct": "B) La Utopia de Tomas Moro, como comunidades autosuficientes y colectivas."
        },
        {
          "question": "La raza cosmica de Vasconcelos propone que:",
          "options": [
            "A) La raza indigena es superior a las europeas por su mayor resistencia historica.",
            "B) America Latina es el laboratorio donde se gestara una nueva humanidad que integra las razas y culturas del mundo.",
            "C) Mexico debe mantener su pureza racial indigena contra la influencia europea."
          ],
          "correct": "B) America Latina es el laboratorio donde se gestara una nueva humanidad que integra las razas y culturas del mundo."
        },
        {
          "question": "El argumento central de Leopoldo Zea para la filosofia latinoamericana es:",
          "options": [
            "A) Los latinoamericanos deben dominar primero toda la filosofia europea antes de poder pensar por cuenta propia.",
            "B) Los latinoamericanos deben hacer filosofia desde su propia circunstancia historica, no como epigonos de Europa.",
            "C) La filosofia es una actividad universal sin contexto geografico o cultural especifico."
          ],
          "correct": "B) Los latinoamericanos deben hacer filosofia desde su propia circunstancia historica, no como epigonos de Europa."
        },
        {
          "question": "Bartolome de las Casas es relevante para el humanismo mexicano porque:",
          "options": [
            "A) Fundó la primera universidad de America en la Ciudad de Mexico en 1533.",
            "B) Documento la violencia de la conquista y argumento que los pueblos indigenas son seres racionales con plena dignidad humana.",
            "C) Tradujio al nahuatl los principales textos de la filosofia aristotelica."
          ],
          "correct": "B) Documento la violencia de la conquista y argumento que los pueblos indigenas son seres racionales con plena dignidad humana."
        }
      ],
      "rubric": "RUBRICA — Analisis de vertiente humanista + reflexion personal (20 pts)\n\nANALISIS DE LA VERTIENTE ASIGNADA (8 pts): 8=Caracteriza correctamente la concepcion del ser humano, los valores humanistas y el contexto historico de la vertiente con citas textuales | 6=Caracterizacion con argumentacion parcial | 4=Descripcion sin analisis filosofico | 0=Sin analisis\n\nCOMPARACION CON OTRAS VERTIENTES (5 pts): 5=Identifica 2+ continuidades y 2+ diferencias entre las tres vertientes con argumentacion | 4=1 continuidad y 1 diferencia argumentadas | 2=Continuidades o diferencias mencionadas sin argumentacion | 0=Sin comparacion\n\nVIGENCIA Y ACTUALIDAD (4 pts): 4=Argumenta de manera concreta como la vertiente analizada puede aportar a los desafios del siglo XXI en Mexico | 3=Mencion de vigencia con argumentacion limitada | 2=Vigencia afirmada sin argumentos | 0=Sin reflexion sobre vigencia\n\nREFLEXION PERSONAL (3 pts): 3=Reflexion personal autentica que conecta la vertiente elegida con la propia experiencia y valores del alumno | 2=Reflexion superficial | 0=Sin reflexion personal"
    },
    "teacher_tips": [
      "La linea del tiempo del humanismo mexicano es el mejor ancla visual para esta progresion: que los alumnos vean que hay 3,000 anos de pensamiento filosofico en su pais cambia su autopercepcion como sujetos con historia intelectual propia.",
      "Vasco de Quiroga es especialmente interesante porque realizo una utopia: no se quedo en el papel. Los hospitales-pueblo de Patzcuaro siguen teniendo descendencia cultural en la organizacion comunitaria purepecha. Si hay alumnos de Michoacan, pueden aportar datos de primera mano.",
      "Vasconcelos es una figura compleja: genio humanista y organizador educativo en los 20s, pero con posiciones antisemitas y pro-fascistas en los 40s. Presentalo en toda su complejidad: la grandeza y la contradiccion de un intelectual de su tiempo.",
      "El concepto nahuatl in ixtli in yollotl (rostro y corazon) puede usarse como marco para el proyecto educativo de la escuela: la educacion no solo forma razones sino tambien caracteres y corazones. Conectalo con el eje de bienestar del MCCEMS.",
      "Cierre del semestre de PFH: si esta es la ultima progresion, usa el portafolio filosofico como lugar de sintesis. El alumno que llego sin poder nombrar una filosofa, sin conocer la filosofia nahuatl ni a Leopoldo Zea, ahora tiene un vocabulario y un horizonte filosofico ampliado. Celebra ese crecimiento."
    ]
  }
}

out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src', 'data', 'planteamiento', 'pfh-ii.json')
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f'Written {len(data)} progressions to {out_path}')

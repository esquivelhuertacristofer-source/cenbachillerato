"""
gen-in-v.py — Inglés V (CEFR B1) — 8 progresiones vocacional/profesional
Referencias: PRONI-SEP, CENNI, CEFR 2020 Companion Volume,
IMJUVE-ENAJUV 2022, STPS Jóvenes Construyendo Futuro, CONALEP, SEMS-SEP
"""
import json, os

OUT = os.path.join(os.path.dirname(__file__),
                   '..', 'src', 'data', 'planteamiento', 'in-v.json')

data = {
  "IN-V-P01": {
    "code": "IN-V-P01",
    "title": "Explora y describe el area de estudio, ocupacion o interes del grupo (introduce el campo o tema y su relevancia).",
    "level": "Ingles V",
    "duration": "~4h (2 sesiones de 50 min + tarea)",
    "difficulty": "Intermedio",
    "category": "Produccion oral y escrita - Vocabulario vocacional",
    "metadata": {
      "objective": "Describir con precision un campo vocacional usando vocabulario especializado B1, conectores de cohesion (furthermore, however, as a result) y estructuras de presente simple/continuo para hechos y tendencias; organizar la descripcion con la estructura definicion-funcion-relevancia-ejemplo.",
      "competencies": [
        "Selecciona y usa vocabulario especializado del campo vocacional (minimo 15 terminos en contexto).",
        "Usa Present Simple para hechos y definiciones; Present Continuous para tendencias actuales.",
        "Organiza un parrafo descriptivo: definicion, funcion, relevancia social y ejemplo local mexicano.",
        "Presenta oralmente con soporte visual usando volumen, contacto visual y pronunciacion inteligible."
      ],
      "materials": [
        "Mapa de rutas vocacionales SEMS-SEP 2024 (sems.sep.gob.mx).",
        "Infografia de ocupaciones juveniles IMJUVE 2022 (imjuve.gob.mx).",
        "Glosarios sectoriales STPS — salud, tecnologia, ambiente, gastronomia.",
        "Merriam-Webster Learner's Dictionary para verificacion de terminos.",
        "CEFR 2020 Companion Volume — B1 descriptors for written and spoken production."
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "15 min", "label": "Field mapping y seleccion vocacional"},
        {"phase": "Desarrollo", "duration": "60 min", "label": "Vocabulario, sentence patterns y borrador"},
        {"phase": "Cierre", "duration": "25 min", "label": "Presentacion oral y coevaluacion"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA — Field mapping",
          "duration": "15 min",
          "description": "Los estudiantes ven el mapa de rutas vocacionales SEMS-SEP 2024 y la infografia IMJUVE sobre ocupaciones juveniles en Mexico. El docente pregunta: 'Which career field will our class explore this semester and why does it matter to our community?' Cada equipo elige un campo: salud, tecnologia, medio ambiente, gastronomia u otro relevante localmente.",
          "activity": "Lluvia de terminos bilingue: cada equipo escribe en 5 minutos el mayor numero de palabras relacionadas con su campo (primero en espanol, luego buscan el equivalente en ingles con diccionario o telefono). Se comparte con el grupo y el docente clarifica pronunciacion de las 5 palabras mas complejas."
        },
        {
          "title": "FASE II: DESARROLLO — Sentence patterns y redaccion",
          "duration": "60 min",
          "description": "Docente modela 5 estructuras clave en el pizarron con ejemplos del campo de salud: (1) 'X is a field that focuses on...'; (2) 'Professionals in X are responsible for...'; (3) 'Currently, the sector is growing because...'; (4) 'In Mexico, X employs/affects approximately... people'; (5) 'A concrete example in our state is...' Estudiantes producen sus propias oraciones por equipo.",
          "activity": "Redaccion guiada: cada equipo escribe un parrafo de 100-120 palabras siguiendo la estructura definicion-funcion-relevancia-ejemplo. Intercambian con otro equipo para peer review usando checklist: (1) vocabulario tecnico identificado y subrayado, (2) conectores presentes, (3) ejemplo local mexicano incluido, (4) Present Simple/Continuous usados correctamente."
        },
        {
          "title": "FASE III: CIERRE — Presentacion oral",
          "duration": "25 min",
          "description": "Cada equipo presenta su campo vocacional en 2-3 minutos con una infografia o diapositiva de soporte. La audiencia toma notas en un organizador grafico (nombre del campo, 3 actividades principales, 1 dato de Mexico) y formula al menos una pregunta de aclaracion en ingles.",
          "activity": "Coevaluacion con rubrica de tres criterios: vocabulario (5 terminos tecnicos usados correctamente), organizacion (estructura definicion-funcion-relevancia-ejemplo) y presentacion oral (volumen, contacto visual, pronunciacion). Retroalimentacion positiva + una sugerencia de mejora por equipo."
        }
      ]
    },
    "theory": {
      "introduction": "El ingles vocacional (English for Specific Purposes, ESP) conecta el aprendizaje de la lengua con campos profesionales reales. En Mexico, el PRONI-SEP y el CENNI establecen que al finalizar el bachillerato los estudiantes deben alcanzar nivel B1 del MCER, con capacidad de comunicarse en contextos laborales y academicos. El vocabulario especializado es el primer recurso que diferencia a un comunicador B1 de uno A2: no se trata de memorizar listas, sino de usar terminos en contexto para describir, explicar y argumentar.",
      "sections": [
        {
          "subtitle": "Organizacion retorica descriptiva",
          "content": "Un parrafo descriptivo efectivo en ingles sigue la estructura: (1) Definicion — qué es el campo y a qué se dedica; (2) Funcion — qué hace un profesional en ese campo dia a dia; (3) Relevancia — por qué importa socialmente, con datos cuantitativos si es posible; (4) Ejemplo local — un caso concreto de Mexico o del estado. Esta estructura es reconocida en examenes internacionales como IELTS Task 1 y en contextos academicos universitarios."
        },
        {
          "subtitle": "Presente Simple vs Presente Continuo en descripcion de campos",
          "content": "El Present Simple describe hechos permanentes, definiciones y rutinas del campo: 'A nurse administers medications and monitors patients.' El Present Continuous describe tendencias actuales en curso: 'The health sector is currently integrating AI diagnostics.' En textos de divulgacion (BBC, National Geographic) ambas estructuras coexisten: los hechos en Simple y las tendencias en Continuous. Identificar este patron en textos autenticos desarrolla la conciencia linguistica B1."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "Which sentence uses Present Simple CORRECTLY to describe a fact about the health field?",
          "options": [
            "Nurses are administering vaccines every day as a permanent duty.",
            "A nurse administers medications and monitors patients' vital signs.",
            "The health sector is employing thousands of workers as a permanent fact.",
            "Doctors are diagnose diseases and prescribe treatments."
          ],
          "correct": "A nurse administers medications and monitors patients' vital signs."
        },
        {
          "question": "Which connector BEST introduces a contrast in a descriptive paragraph?",
          "options": [
            "Furthermore",
            "As a result",
            "However",
            "In addition"
          ],
          "correct": "However"
        },
        {
          "question": "In the descriptive paragraph structure (definition-function-relevance-example), what does the 'example' section add?",
          "options": [
            "It defines technical vocabulary for the reader.",
            "It shows a concrete, local case that makes the description credible and relatable.",
            "It summarizes the main ideas of the paragraph.",
            "It argues against opposing viewpoints."
          ],
          "correct": "It shows a concrete, local case that makes the description credible and relatable."
        }
      ],
      "rubric": "4: Parrafo de 100-120 palabras con 15+ terminos tecnicos en contexto, conectores B1, estructura completa y ejemplo mexicano especifico; presentacion oral fluida con soporte visual. 3: Parrafo completo con 10+ terminos y estructura reconocible; presentacion con algunos errores no bloqueantes. 2: Parrafo incompleto o sin estructura; vocabulario limitado (<8 terminos); presentacion oral dependiente de notas. 1: Produccion minima; vocabulario insuficiente; sin estructura descriptiva."
    },
    "teacher_tips": [
      "Permitir que los equipos usen el telefono para buscar vocabulario tecnico en la primera sesion — la busqueda activa fija mejor que una lista dada.",
      "El campo vocacional elegido en P01 sera el hilo conductor de todo el semestre (P01-P08), por lo que vale la pena dedicar tiempo a una eleccion motivadora.",
      "Si el grupo es heterogeneo, asignar campos con diferente densidad de vocabulario tecnico: gastronomia y turismo son mas accesibles que biotecnologia o derecho.",
      "El peer review funciona mejor con una lista de verificacion concreta (checklist) que con preguntas abiertas como 'is it good?'."
    ]
  },

  "IN-V-P02": {
    "code": "IN-V-P02",
    "title": "Comparte experiencias personales o escolares relacionadas con el campo de estudio elegido (narra por que le interesa).",
    "level": "Ingles V",
    "duration": "~4h (2 sesiones de 50 min + tarea)",
    "difficulty": "Intermedio",
    "category": "Produccion oral - Narrativa personal",
    "metadata": {
      "objective": "Narrar experiencias personales relevantes usando Simple Past, Past Continuous y marcadores temporales de secuencia (first, then, after that, eventually); aplicar la estructura narrativa de Labov (orientacion-complicacion-resolucion-coda) para conectar la experiencia con el campo vocacional.",
      "competencies": [
        "Usa Simple Past de verbos regulares e irregulares de alta frecuencia sin errores que bloqueen la comprension.",
        "Incorpora Past Continuous para establecer el escenario de fondo de la narracion.",
        "Aplica marcadores temporales de secuencia para organizar cronologicamente el relato.",
        "Estructura la narracion oral siguiendo las cuatro etapas de Labov: orientacion, complicacion, resolucion, coda."
      ],
      "materials": [
        "Podcast 'Jovenes Construyendo Futuro' STPS — fragmento de entrevista vocacional (2-3 min).",
        "Story spine template: 'Once there was... / Every day... / Until one day... / Because of that... / Finally...'",
        "Lista de verbos irregulares de alta frecuencia por campo vocacional (elaborada en clase).",
        "Timer visual (Classroomscreen.com) para practica cronometrada de 90 segundos.",
        "Labov & Waletzky (1967) — resumen didactico en espanol e ingles."
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "15 min", "label": "Modelo narrativo y story spine"},
        {"phase": "Desarrollo", "duration": "55 min", "label": "Grammar focus e ensayo oral en triadas"},
        {"phase": "Cierre", "duration": "30 min", "label": "Storytelling circle y votacion"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA — Modelo narrativo",
          "duration": "15 min",
          "description": "El docente muestra un fragmento (2-3 min) de un joven profesionista mexicano del podcast 'Jovenes Construyendo Futuro' (STPS) narrando como llego a su vocacion. Pregunta: 'What structure does this story follow? When does it start, what goes wrong, and how does it end?' Se introduce el modelo de Labov: Orientation (who/when/where) > Complication (problem/challenge) > Resolution (what happened) > Coda (so what/lesson learned).",
          "activity": "Story spine individual: cada estudiante completa el organizador 'Once there was me, interested in [field]... / Every day I... / Until one day... / Because of that... / Finally...' con su propia experiencia en 8 minutos. No se corrige la gramatica en esta etapa; el objetivo es generar contenido narrativo."
        },
        {
          "title": "FASE II: DESARROLLO — Grammar focus y ensayo oral",
          "duration": "55 min",
          "description": "Docente presenta 10 verbos irregulares clave del campo vocacional elegido con sus formas de Simple Past (ej. campo salud: treat/treated, see/saw, give/gave, take/took, know/knew; campo tecnologia: build/built, write/wrote, find/found, make/made, teach/taught). Luego modela el uso de Past Continuous para escenario: 'I was studying for my biology exam when I realized I wanted to work in public health.'",
          "activity": "Ensayo oral en triadas: un narrador (90 seg con story spine como guia), un cronometrador que anota cuando el narrador usa correctamente Simple Past y Past Continuous, y un observador que cuenta marcadores temporales. Rotacion de roles tres veces. Debriefing: ¿cuantos marcadores usaste? ¿Usaste Past Continuous para el escenario?"
        },
        {
          "title": "FASE III: CIERRE — Storytelling circle",
          "duration": "30 min",
          "description": "Cada estudiante comparte su historia al grupo completo en exactamente 90 segundos (timer visible). La audiencia no interrumpe; al finalizar, vota en una tarjeta la historia mas evocadora y escribe en ingles por que: 'I chose this story because it showed...' El docente destaca instancias de Past Continuous y marcadores temporales bien usados.",
          "activity": "Votacion y reflexion: el grupo identifica la historia ganadora y el docente lidera una discusion breve: 'What made this story effective? Which part was the complication? What was the coda?' Retroalimentacion formativa: docente senala 2 ejemplos de buen uso de Simple Past irregular y 1 patron de error comun para que el grupo lo corrija colectivamente."
        }
      ]
    },
    "theory": {
      "introduction": "La narracion de experiencias personales es una habilidad comunicativa central del nivel B1 del MCER: 'Can narrate a story or describe an experience in detail' (CEFR 2020). La estructura narrativa de Labov y Waletzky (1967) — con sus seis componentes (abstract, orientation, complication, evaluation, resolution, coda) — es el marco descriptivo mas citado en la linguistica del discurso oral. Para fines pedagogicos de B1, se simplifica a cuatro etapas que resultan naturales e intuitivas para los estudiantes.",
      "sections": [
        {
          "subtitle": "Simple Past vs Past Continuous en narracion",
          "content": "El Simple Past narra los eventos principales de la historia en secuencia: 'I decided to study nursing because I saw my grandmother recover from surgery.' El Past Continuous establece el escenario de fondo o una accion en progreso interrumpida: 'I was struggling with math when my teacher showed me how programming could solve real problems.' La combinacion de ambos tiempos produce narraciones con profundidad temporal: el Continuous crea tension, el Simple Past la resuelve. Este patron es caracteristico del habla nativa fluida en ingles."
        },
        {
          "subtitle": "Marcadores temporales de secuencia en narracion B1",
          "content": "Los marcadores temporales organizan el relato cronologicamente y aumentan la cohesion del discurso: 'first' (inicio), 'then / after that / next' (secuencia), 'suddenly / all of a sudden' (giro inesperado), 'eventually / finally' (resolucion), 'by the time / before that' (anterioridad relativa). Su uso apropiado es un indicador de nivel B1 en evaluaciones de produccion oral como el CENNI y el IELTS Speaking Band 5."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "Which sentence uses the CORRECT combination of Simple Past and Past Continuous for a narrative?",
          "options": [
            "I was deciding to study medicine when I was seeing my uncle in the hospital.",
            "I was studying for my exam when my teacher told me about the medical internship program.",
            "I decided to study medicine and I was choosing the university at the same time.",
            "When I study medicine, I was learning about public health."
          ],
          "correct": "I was studying for my exam when my teacher told me about the medical internship program."
        },
        {
          "question": "In Labov's narrative structure, what is the function of the CODA?",
          "options": [
            "It describes the setting and characters at the beginning of the story.",
            "It presents the main conflict or challenge the narrator faced.",
            "It reflects on the significance of the experience and connects it to the present.",
            "It lists the sequence of events in chronological order."
          ],
          "correct": "It reflects on the significance of the experience and connects it to the present."
        },
        {
          "question": "Which sequence of temporal markers BEST organizes a 90-second narrative?",
          "options": [
            "However... on the other hand... in contrast... although...",
            "First... then... suddenly... eventually... and that is why...",
            "Furthermore... in addition... also... moreover...",
            "In my opinion... I believe... it seems to me... I think..."
          ],
          "correct": "First... then... suddenly... eventually... and that is why..."
        }
      ],
      "rubric": "4: Narrativa oral de 90 seg con estructura Labov completa, Past Continuous para escenario, 4+ marcadores temporales y conexion explicita con el campo vocacional. 3: Estructura reconocible con Simple Past consistente y 2-3 marcadores; alguna confusion Past Simple/Continuous. 2: Narracion lineal sin estructura Labov; marcadores escasos; dependencia de notas escritas. 1: Enunciados aislados sin hilo narrativo; menos de 60 segundos de produccion."
    },
    "teacher_tips": [
      "El story spine elimina la pagina en blanco: los estudiantes solo tienen que 'rellenar' la estructura, lo cual reduce la ansiedad ante la produccion libre.",
      "No corregir la gramatica durante el primer ensayo — el objetivo es que fluya el contenido. La correccion enfocada viene despues del storytelling circle.",
      "Si un estudiante no tiene una experiencia directa con el campo, permitirle narrar por que eligio el campo aunque sea por eliminacion — es igualmente valido narrativamente.",
      "El Past Continuous para 'escenario de fondo' es intuitivo si se ejemplifica con telenovelas o peliculas: 'It was raining when the detective arrived.'"
    ]
  },

  "IN-V-P03": {
    "code": "IN-V-P03",
    "title": "Formula y responde preguntas sobre procesos, conceptos o procedimientos basicos (entrevistas simuladas, demostraciones, explicaciones).",
    "level": "Ingles V",
    "duration": "~4h (2 sesiones de 50 min + preparacion en casa)",
    "difficulty": "Intermedio",
    "category": "Interaccion oral - Ingles de propositos especificos (ESP)",
    "metadata": {
      "objective": "Formular preguntas WH y de respuesta si/no en contextos tecnicos; responder con claridad usando lenguaje de proceso (first, then, you need to, make sure to) y voz pasiva (is heated, is stored, is checked) para enfatizar el procedimiento; manejar preguntas inesperadas con expresiones de reformulacion.",
      "competencies": [
        "Construye preguntas WH correctas en presente y pasado para indagar sobre procesos tecnicos.",
        "Explica un proceso paso a paso usando lenguaje de secuencia y voz pasiva donde corresponda.",
        "Reformula o aclara cuando el interlocutor no comprende: 'What I mean is...; Let me give you an example...'",
        "Maneja preguntas inesperadas con estrategias de ganancia de tiempo: 'That's a great question; As far as I know...'"
      ],
      "materials": [
        "Diagrama de flujo del proceso vocacional (elaborado por cada equipo en esta progresion).",
        "Clips de entrevistas tecnicas en ingles: Science Friday NPR, TED-Ed 'How Things Work' (2-3 min).",
        "Glosarios de CONALEP — modulos tecnicos bilingue (conalep.edu.mx).",
        "Tarjetas de lenguaje de proceso y reformulacion (elaboradas por docente).",
        "CEFR 2020 — B1 interaction descriptors: 'Can give or seek personal views and opinions.'"
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "15 min", "label": "Process mapping en ingles"},
        {"phase": "Desarrollo", "duration": "60 min", "label": "Question bank y entrevista en parejas"},
        {"phase": "Cierre", "duration": "25 min", "label": "Entrevista en vivo y retroalimentacion"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA — Process mapping",
          "duration": "15 min",
          "description": "Cada equipo dibuja en papel un diagrama de flujo de un proceso clave de su campo vocacional en ingles, con minimo 6 pasos. Ejemplos: campo salud — 'How a patient is registered and treated in a clinic'; campo tecnologia — 'How a mobile app is designed and deployed'; campo gastronomia — 'How a traditional mole is prepared for a restaurant.' Los verbos se conjugan en voz pasiva: 'The patient is registered... The data is entered... The treatment is prescribed...'",
          "activity": "Gallery walk: los diagramas se pegan en la pared. Los estudiantes circulan (5 min) y leen el proceso de otro equipo. Identifican dos pasos que no entienden y los anotan como preguntas que van a hacer en la entrevista. Docente senal errores criticos de vocabulario antes de continuar."
        },
        {
          "title": "FASE II: DESARROLLO — Question bank y entrevista",
          "duration": "60 min",
          "description": "Cada equipo genera un banco de 10 preguntas tecnicas sobre su proceso usando estructuras WH: 'How does X work? / What happens when...? / Why is it important to...? / How long does it take to...? / Who is responsible for...? / What materials/tools are needed to...?' Se intercambian bancos entre equipos para que respondan las preguntas del otro.",
          "activity": "Entrevista en parejas: roles de periodista de divulgacion (hace preguntas del banco) y experto junior del campo (responde usando lenguaje de proceso). 3 minutos por entrevista. Un observador registra: (1) numero de preguntas WH correctas, (2) instancias de lenguaje de proceso y pasiva, (3) uso de reformulacion. Rotacion de roles."
        },
        {
          "title": "FASE III: CIERRE — Entrevista en vivo",
          "duration": "25 min",
          "description": "Tres pares seleccionados presentan su entrevista al grupo completo (3 min cada par). Al terminar, la audiencia formula una pregunta adicional NO incluida en el banco original — el entrevistado debe responder en vivo sin preparacion. Esta fase entrena el manejo de imprevistos.",
          "activity": "Retroalimentacion colectiva: docente proyecta las tarjetas de lenguaje de proceso y senala instancias especificas que observo en las entrevistas ('En el grupo de tecnologia, Ivan uso 'make sure to test the code before deployment' — perfecto!') y un patron de error comun para correccion grupal."
        }
      ]
    },
    "theory": {
      "introduction": "El Ingles para Propositos Especificos (ESP, English for Specific Purposes) es una rama de la pedagogia de lenguas extranjeras que centra el aprendizaje en los contextos comunicativos reales de campos profesionales o academicos especificos. En Mexico, el CONALEP y la SEMS han desarrollado materiales bilingues por sector que sirven de referencia lexica. En el MCER 2020, el nivel B1 incluye explicitamente la capacidad de participar en interacciones sobre temas familiares y de interes personal, lo que en el contexto vocacional se traduce en poder explicar y preguntar sobre procesos del campo elegido.",
      "sections": [
        {
          "subtitle": "Voz pasiva para describir procesos",
          "content": "En ingles tecnico y cientifico, la voz pasiva es la construccion mas frecuente para describir procesos porque enfatiza la accion y el resultado, no quien la ejecuta: 'The sample IS collected... IS analyzed... IS stored at 4°C...' Se forma con el verbo 'to be' + participio pasado. En nivel B1, las estructuras mas utiles son: presente simple pasiva (is/are + pp), pasado simple pasiva (was/were + pp) y con modal (must be, should be, is going to be). Identificar la pasiva en textos tecnicos es un indicador de comprension lectora B1."
        },
        {
          "subtitle": "Lenguaje de proceso y reformulacion en interaccion oral",
          "content": "El lenguaje de proceso marca la secuencia de pasos: 'First you need to... / Then you should... / After that, make sure to... / Be careful not to... / The final step is to...' La reformulacion permite reparar la comunicacion cuando hay incomprension: 'What I mean is... / In other words... / Let me rephrase that... / Let me give you an example...' Ambos recursos son caracteristicos de hablantes B1 competentes y son evaluados explicitamente en el CENNI y en examenes de interaccion oral MCER."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "Which sentence uses the PASSIVE VOICE correctly to describe a step in a process?",
          "options": [
            "The nurse is giving the patient a vaccine.",
            "The patient is administering the medication.",
            "The blood sample is collected and stored at 4 degrees Celsius.",
            "The doctor prescribed the treatment and the pharmacy is preparing."
          ],
          "correct": "The blood sample is collected and stored at 4 degrees Celsius."
        },
        {
          "question": "Which expression is BEST for handling an unexpected question in a technical interview?",
          "options": [
            "I don't understand your question at all.",
            "That's a great question; as far as I know, the process involves three main stages.",
            "No, I can't answer that.",
            "Please ask me an easier question."
          ],
          "correct": "That's a great question; as far as I know, the process involves three main stages."
        },
        {
          "question": "Which WH question is CORRECTLY formed to ask about a technical process?",
          "options": [
            "How the vaccine is stored in the clinic?",
            "What does the engineer does to test the system?",
            "How long does it take to process a patient's registration?",
            "Why the code is wrote in Python?"
          ],
          "correct": "How long does it take to process a patient's registration?"
        }
      ],
      "rubric": "4: Entrevista de 3 min con 5+ preguntas WH correctas, lenguaje de proceso (6+ marcadores), voz pasiva apropiada y manejo fluido de al menos 1 pregunta imprevista. 3: Preguntas correctas pero respuestas con escaso lenguaje de proceso; manejo de imprevistos con expresion de ganancia de tiempo. 2: Preguntas simples yes/no; respuestas sin estructura de proceso; sin voz pasiva. 1: Intercambio minimo; dificultad para formular preguntas en ingles."
    },
    "teacher_tips": [
      "El diagrama de flujo como pre-tarea visual reduce la demanda cognitiva durante la entrevista oral: el estudiante puede referirse a el sin bloquear la memoria de trabajo.",
      "La pregunta imprevista es la parte mas ansiogena — modelarla primero con humor ('I'm going to ask you something impossible') desactiva la ansiedad y convierte el error en aprendizaje.",
      "Campos con procesos muy tecnicos (medicina, ingenieria) pueden ser mas desafiantes que gastronomia o turismo; equilibrar los grupos si hay diferencias grandes de nivel.",
      "El lenguaje de pasiva en procesos es un atajo muy eficaz para sonar mas profesional en ingles tecnico — vale la pena enfatizarlo como 'hack de registro formal'."
    ]
  },

  "IN-V-P04": {
    "code": "IN-V-P04",
    "title": "Expresa opiniones, preferencias y preocupaciones sobre temas relacionados con el campo de estudio o la comunidad.",
    "level": "Ingles V",
    "duration": "~4h (2 sesiones de 50 min + reflexion individual)",
    "difficulty": "Intermedio",
    "category": "Interaccion oral - Argumentacion y opinion B1",
    "metadata": {
      "objective": "Expresar opiniones fundamentadas, preferencias matizadas y preocupaciones sobre problemas reales usando recursos epistemicos B1: hedging (I think, perhaps, it might be), marcadores de opinion (In my opinion, I strongly believe, From my perspective), lenguaje de contraste (although, however, on the other hand) y desacuerdo educado (I see your point, but; I'm not entirely convinced because).",
      "competencies": [
        "Usa expresiones de opinion propias del nivel B1 para posicionarse ante un tema del campo vocacional.",
        "Matiza afirmaciones con hedging para indicar grado de certeza sin perder claridad.",
        "Responde a la opinion del interlocutor antes de exponer la propia (desacuerdo educado).",
        "Sustenta su postura con al menos un dato de fuente real mexicana (CONEVAL, INEGI, ENSANUT, etc.)."
      ],
      "materials": [
        "Datos CONEVAL 2024: 36.3% de mexicanos en pobreza multidimensional.",
        "Articulo breve de The Guardian o BBC sobre un problema vinculado al campo vocacional del grupo.",
        "Tarjetas de lenguaje de opinion, hedging y contraste (toolkit B1).",
        "Timer Classroomscreen.com (45 seg por turno en debate de mesa redonda).",
        "CEFR 2020 — B1: 'Can express opinions on topics of personal interest with simple reasoning.'"
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "15 min", "label": "Opinion spectrum y posicionamiento"},
        {"phase": "Desarrollo", "duration": "55 min", "label": "Toolkit B1 y mesa redonda estructurada"},
        {"phase": "Cierre", "duration": "30 min", "label": "Position paper oral y coevaluacion"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA — Opinion spectrum",
          "duration": "15 min",
          "description": "El docente presenta 5 afirmaciones polemicas relacionadas con el campo vocacional del grupo. Ejemplos: 'Technology will eventually replace doctors in diagnosis'; 'Climate change is the main threat to food security in Mexico'; 'Young people should prioritize stable jobs over passion projects.' Los estudiantes se posicionan en una linea imaginaria de acuerdo-desacuerdo en el salon y justifican con una oracion en ingles.",
          "activity": "Justificacion escrita: cada estudiante escribe su posicion ante 2 de las 5 afirmaciones usando al menos una expresion de opinion del toolkit (In my opinion...; I strongly believe...; From my perspective...; It seems to me that...). Comparte con la persona mas cercana en la linea de opinion."
        },
        {
          "title": "FASE II: DESARROLLO — Toolkit y mesa redonda",
          "duration": "55 min",
          "description": "Docente presenta el toolkit de 15 expresiones organizadas en tres categorias: (A) Opinion y certeza: 'In my opinion...; I strongly believe...; I'm fairly sure that...; Perhaps...; It might be the case that...' (B) Contraste y concesion: 'Although I understand...; On the other hand...; That's a valid point, however...' (C) Desacuerdo educado: 'I see your point, but...; I'm not entirely convinced because...; Have you considered...? / What about...?' Los estudiantes practican cada categoria en parejas con tarjetas de situacion.",
          "activity": "Debate de mesa redonda: grupos de 4-5 estudiantes discuten un dilema del campo vocacional. Reglas: cada turno maximo 45 segundos (timer visible); OBLIGATORIO responder a la opinion anterior antes de agregar la propia; usar al menos una expresion del toolkit por turno. Docente cronometra y senala con una tarjeta verde cuando el estudiante usa una expresion del toolkit correctamente."
        },
        {
          "title": "FASE III: CIERRE — Position paper oral",
          "duration": "30 min",
          "description": "Cada estudiante prepara y presenta su postura final (60 segundos exactos) sobre el problema del campo discutido, incorporando: (1) expresion de opinion, (2) un dato real de fuente mexicana, (3) al menos una concesion al punto de vista contrario. El resto del grupo registra en una tarjeta si la postura fue clara, si incluy o datos y si concedio algo.",
          "activity": "Coevaluacion con rubrica de tres items: (1) Opinion clara con expresion B1 apropiada (2 pts), (2) Dato de fuente mexicana real (1 pt), (3) Concesion o contraste presente (1 pt). Retroalimentacion: el docente lee dos ejemplos de postura excelente y uno con oportunidades de mejora, sin identificar al autor."
        }
      ]
    },
    "theory": {
      "introduction": "La expresion de opinion es una de las macrofunciones comunicativas centrales del nivel B1 del MCER. En el contexto del NEM (Nuevo Modelo Educativo Mexicano), la capacidad de argumentar sobre problemas comunitarios reales — usando datos de instituciones como el CONEVAL, el INEGI o la ENSANUT — es tambien una competencia ciudadana. El hedging (atenuacion epistemica) es un rasgo linguistico de hablantes avanzados: los hablantes B1 aprenden a distinguir entre 'I know' (certeza alta), 'I think' (posibilidad), 'I'm not sure, but' (incertidumbre) y 'Apparently' (fuente indirecta).",
      "sections": [
        {
          "subtitle": "Hedging: la precision epistemica en B1",
          "content": "El hedging es el conjunto de recursos linguisticos que un hablante usa para indicar su grado de certeza o compromiso con una afirmacion. En ingles B1, los hedges mas comunes son: verbos modales (might, could, may: 'Automation might replace some jobs'); adverbios (perhaps, possibly, probably: 'This is probably the most urgent challenge'); frases de distancia ('It seems that...; Research suggests...; There is evidence that...'). El uso de hedges en discusion academica y profesional senala sofisticacion comunicativa y reduce el riesgo de afirmaciones demasiado absolutas que puedan ser rebatidas facilmente."
        },
        {
          "subtitle": "Desacuerdo educado en contextos interculturales",
          "content": "En comunicacion intercultural B1, el desacuerdo directo ('You're wrong') puede generar conflicto innecesario. Las estrategias de desacuerdo educado siguen tipicamente un patron de tres partes: (1) Reconocer la validez parcial de la opinion contraria ('I see your point / That's a valid concern'); (2) Introducir el contraste ('However / But / On the other hand'); (3) Ofrecer la posicion propia con sustento ('I think / I believe / The evidence suggests'). Este patron — central en debates academicos, reuniones profesionales y negociaciones — es evaluado en el CENNI como indicador de fluidez pragmatica B1."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "Which sentence uses HEDGING to express an opinion with appropriate uncertainty?",
          "options": [
            "Technology will definitely and completely eliminate all medical jobs in 10 years.",
            "I strongly know that climate change is the only cause of food insecurity in Mexico.",
            "It might be the case that automation affects some routine tasks in the health sector.",
            "In my opinion, this is absolutely the worst idea anyone has ever proposed."
          ],
          "correct": "It might be the case that automation affects some routine tasks in the health sector."
        },
        {
          "question": "Which response uses POLITE DISAGREEMENT correctly?",
          "options": [
            "No, you are completely wrong about that.",
            "I see your point about the cost, however, I think the long-term benefits outweigh the investment.",
            "I disagree. My opinion is better than yours.",
            "That's a valid point, so I completely agree with everything you said."
          ],
          "correct": "I see your point about the cost, however, I think the long-term benefits outweigh the investment."
        },
        {
          "question": "According to CONEVAL 2024, approximately what percentage of Mexicans live in multidimensional poverty?",
          "options": [
            "12.4%",
            "50.8%",
            "36.3%",
            "22.1%"
          ],
          "correct": "36.3%"
        }
      ],
      "rubric": "4: Position paper de 60 seg con expresion B1 apropiada, dato de fuente mexicana real, concesion al punto contrario y registro formal consistente. 3: Postura clara con expresion B1 pero sin dato o sin concesion; registro apropiado. 2: Opinion expresada pero sin recursos de hedging o contraste; registro informal. 1: Postura no identificable o en espanol predominante."
    },
    "teacher_tips": [
      "El opinion spectrum fisico (moverse por el salon) activa la participacion de estudiantes timidos que no hablan voluntariamente en discusiones tradicionales.",
      "Validar explicitamente que en ingles academico 'I strongly believe' es tan valido como 'According to CONEVAL' — la opinion bien expresada tiene valor argumentativo propio.",
      "Las tarjetas verdes durante el debate crean un refuerzo positivo inmediato que es mucho mas efectivo que la correccion posterior.",
      "Si el grupo no conoce el dato de CONEVAL u otra fuente, el docente puede distribuir una hoja de 'datos clave de Mexico 2024' al inicio de la sesion de debate."
    ]
  },

  "IN-V-P05": {
    "code": "IN-V-P05",
    "title": "Lee y analiza textos breves vinculados con el campo tematico (comprension, resumen, opinion).",
    "level": "Ingles V",
    "duration": "~4h (2 sesiones de 50 min)",
    "difficulty": "Intermedio",
    "category": "Comprension lectora - Textos de divulgacion especializada",
    "metadata": {
      "objective": "Aplicar estrategias de lectura B1 (skimming, scanning, inferencia contextual) para comprender textos de divulgacion especializada de 300-400 palabras; sintetizar informacion usando reporting verbs (states, argues, suggests, concludes, warns) sin copiar textualmente; formular una respuesta critica evaluando la evidencia del autor.",
      "competencies": [
        "Aplica skimming (lectura de titulo, subtitulos y primera/ultima oracion de cada parrafo) para captar la idea general en 2 minutos.",
        "Usa scanning para localizar datos especificos (cifras, fechas, nombres, conclusiones) en tiempo limitado.",
        "Infiere el significado de vocabulario desconocido por contexto, prefijos, sufijos y cognados.",
        "Parafrasea usando reporting verbs sin copiar textualmente el original."
      ],
      "materials": [
        "Articulo de divulgacion en ingles 300-400 palabras: BBC Learning English Science & Technology, National Geographic o Wired.com.",
        "Estrategia SCAN adaptada de Nation (2001): Structure / Context / Association / Nearest meaning.",
        "Organizador grafico de skimming: titulo, idea de cada parrafo (una palabra), idea general.",
        "Tarjetas de reporting verbs con ejemplos en contexto.",
        "PRONI-SEP — secuencias de comprension lectora B1 con textos de divulgacion."
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "20 min", "label": "Skimming y scanning cronometrados"},
        {"phase": "Desarrollo", "duration": "50 min", "label": "Vocabulario en contexto y resumen"},
        {"phase": "Cierre", "duration": "30 min", "label": "Respuesta critica y glosario vocacional"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA — Estrategias de lectura",
          "duration": "20 min",
          "description": "Docente distribuye el articulo boca abajo. Antes de leer, activacion de conocimiento previo: estudiantes escriben en 3 minutos todo lo que saben sobre el tema del articulo en ingles (aunque sean palabras sueltas). Luego el docente modela skimming en vivo: lee en voz alta SOLO titulo, subtitulos y primera oracion de cada parrafo (2 min cronometrados). Pregunta: 'What is the main topic? What is the author's main claim?' Los estudiantes responden sin haber leido el articulo completo.",
          "activity": "Scanning individual: con el articulo visible, los estudiantes buscan 5 datos especificos dictados por el docente (una cifra, una fecha, el nombre de una institucion, una consecuencia, una solucion propuesta). Tiempo limite: 3 minutos. Comparan respuestas con la persona de al lado. Discusion: ¿cómo sabias donde mirar? ¿Que senales visuales usaste (numeros, mayusculas, palabras clave)?"
        },
        {
          "title": "FASE II: DESARROLLO — Vocabulario en contexto y resumen",
          "duration": "50 min",
          "description": "Los estudiantes leen el articulo completo e identifican 8-10 palabras desconocidas. Aplican la estrategia SCAN: (S) analizar la Structure de la palabra (prefijo/sufijo: un-, re-, -tion, -ity, -ous); (C) buscar el Context de la oracion; (A) buscar una Association con el espanol (cognado: contamination/contaminacion, diagnosis/diagnostico); (N) proponer el Nearest meaning. Verifican con diccionario SOLO al final. Registran en glosario personal.",
          "activity": "Resumen de 5 oraciones: usando reporting verbs del toolkit, cada estudiante redacta un resumen de maximo 100 palabras parafraseando (no copiando) el articulo. Ejemplos de reporting verbs en contexto: 'The article STATES that... / The author ARGUES that... / The text SUGGESTS that... / According to the article... / The writer WARNS that...' Peer check: intercambian con un companero que subraya cualquier frase copiada textualmente del original."
        },
        {
          "title": "FASE III: CIERRE — Respuesta critica y glosario",
          "duration": "30 min",
          "description": "Respuesta critica escrita (60-80 palabras): cada estudiante responde a la siguiente guia: (1) ¿Es convincente la evidencia del autor? ¿Por que? (2) ¿Que informacion falta en el articulo? (3) ¿Como se relaciona con la realidad mexicana de tu campo vocacional? Comparten en parejas y discuten 5 minutos. El glosario personal se integra al portafolio linguistico del semestre.",
          "activity": "Revision de glosario: cada estudiante presenta 3 palabras de su glosario al grupo con la siguiente estructura: 'The word [X] means... because the text says... and the prefix/suffix [Y] indicates... A similar word in Spanish is...' El docente refuerza las estrategias de inferencia mas efectivas usadas por el grupo."
        }
      ]
    },
    "theory": {
      "introduction": "La comprension lectora en lengua extranjera a nivel B1 del MCER implica poder leer 'textos fatuales directos sobre temas de su campo y de interes general con un nivel satisfactorio de comprension' (CEFR 2020). Las estrategias de lectura (skimming, scanning, inferencia de vocabulario) no son exclusivas de L2: los lectores expertos las usan automaticamente en su lengua materna. El objetivo pedagogico es transferirlas conscientemente al ingles. La estrategia SCAN de Nation (2001) es especialmente efectiva porque aprovecha el conocimiento del espanol como lengua de referencia.",
      "sections": [
        {
          "subtitle": "Reporting verbs: sintesis sin plagio",
          "content": "Los reporting verbs permiten integrar informacion de una fuente sin copiarla textualmente, lo que es una habilidad academica esencial tanto en ingles como en espanol. En nivel B1, los mas utiles son: STATES (afirma algo como hecho), ARGUES (defiende una posicion con razonamiento), SUGGESTS (propone algo con menor certeza), CONCLUDES (llega a una conclusion al final), WARNS (advierte de un riesgo), CLAIMS (afirma algo que puede ser controversial), REPORTS (transmite datos o hechos). El uso de estos verbos — en lugar de 'says' para todo — es un indicador de nivel B1+ en produccion escrita academica."
        },
        {
          "subtitle": "Inferencia de vocabulario: la estrategia SCAN",
          "content": "La estrategia SCAN (Nation, 2001 adaptada) para inferir vocabulario desconocido: (S) Structure — analizar la estructura morfologica de la palabra: prefijos (un-, dis-, in-, re-), sufijos (-tion/-sion indica sustantivo abstracto, -ous/-ful indica adjetivo, -ize/-ify indica verbo), raices latinas o griegas; (C) Context — leer las dos oraciones antes y despues de la palabra para identificar el marco semantico; (A) Association — buscar una palabra similar en espanol o en otro idioma conocido (cognados: approximately/aproximadamente, generate/generar, eliminate/eliminar); (N) Nearest meaning — proponer el significado mas probable antes de verificar. Esta estrategia reduce la dependencia del diccionario y desarrolla autonomia lectora."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "Which sentence PARAPHRASES a source correctly using a reporting verb?",
          "options": [
            "The article says 'climate change is the main threat to biodiversity in Mexico.'",
            "The article argues that climate change poses a significant threat to Mexico's biodiversity.",
            "According to the article: 'climate change is the main threat to biodiversity in Mexico.'",
            "Climate change is the main threat to biodiversity in Mexico (the article)."
          ],
          "correct": "The article argues that climate change poses a significant threat to Mexico's biodiversity."
        },
        {
          "question": "When using the SCAN strategy, which step involves looking for similar words in Spanish?",
          "options": [
            "Structure — analyzing prefixes and suffixes",
            "Context — reading surrounding sentences",
            "Association — connecting to a known language",
            "Nearest meaning — proposing the probable meaning"
          ],
          "correct": "Association — connecting to a known language"
        },
        {
          "question": "What is the PRIMARY purpose of SKIMMING a text?",
          "options": [
            "To find specific data like dates or statistics quickly.",
            "To understand every word and sentence in the text.",
            "To get the general topic and main idea without reading every word.",
            "To identify the grammatical structures used by the author."
          ],
          "correct": "To get the general topic and main idea without reading every word."
        }
      ],
      "rubric": "4: Resumen de 5 oraciones con reporting verbs, sin copia textual, informacion correcta; respuesta critica con evaluacion de evidencia y conexion con Mexico; glosario de 8-10 terminos con definicion en ingles. 3: Resumen correcto con 2-3 reporting verbs; respuesta critica sin evaluacion de evidencia. 2: Resumen con copia textual o sin reporting verbs; glosario con traducciones directas (no definiciones). 1: Sin resumen o con menos de 3 oraciones; sin respuesta critica."
    },
    "teacher_tips": [
      "El skimming cronometrado (2 min visibles en pantalla) crea la presion productiva que obliga a los estudiantes a NO leer todo — este es el habito mas dificil de construir.",
      "Seleccionar articulos de 300-400 palabras con imagenes: las imagenes activan el conocimiento previo y facilitan la inferencia de vocabulario.",
      "El peer check de plagio funciona mejor si primero el docente modela como se ve una copia textual vs una parafrasis real, con dos ejemplos concretos del mismo parrafo.",
      "El glosario personal acumulado (una entrada por progresion, P01 a P08) se convierte en un recurso de vocabulario genuinamente util para el portafolio final."
    ]
  },

  "IN-V-P06": {
    "code": "IN-V-P06",
    "title": "Redacta textos funcionales para informar, solicitar o proponer acciones (correos, solicitudes, propuestas breves).",
    "level": "Ingles V",
    "duration": "~4h (2 sesiones de 50 min + tarea de revision)",
    "difficulty": "Intermedio",
    "category": "Produccion escrita - Escritura funcional formal",
    "metadata": {
      "objective": "Producir textos funcionales formales en ingles (correo electronico y propuesta breve) siguiendo la estructura convencional de cada genero, usando registro formal (sin contracciones, vocabulario formal, formulas de cortesia) y un proposito comunicativo explicito (informar, solicitar o proponer).",
      "competencies": [
        "Escribe un correo formal en ingles con todas las partes en orden: Subject, Salutation, Opening, Body, Closing, Sign-off.",
        "Usa registro formal en escritura: evita contracciones, usa 'I am writing to...' en lugar de 'I'm writing to...'",
        "Redacta una propuesta breve siguiendo la estructura Problema-Solucion-Beneficios-Accion requerida.",
        "Mantiene coherencia y concision: un parrafo por idea, 2-3 oraciones por parrafo."
      ],
      "materials": [
        "Tres correos autenticos de nivel B1 anonimizados (bueno, con problemas de registro, inadecuado).",
        "Checklist de correo formal B1 con 10 items verificables (estructura, registro, proposito, cortesia, concision).",
        "Oxford Guide to Effective Writing — adaptacion de ejemplos B1.",
        "British Council LearnEnglish — plantillas de correo formal (learnenglish.britishcouncil.org).",
        "STPS — formatos de comunicacion institucional bilingue (referencia para lenguaje formal mexicano)."
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "20 min", "label": "Anatomia del correo formal: analisis de 3 ejemplos"},
        {"phase": "Desarrollo", "duration": "55 min", "label": "Redaccion guiada de correo y propuesta breve"},
        {"phase": "Cierre", "duration": "25 min", "label": "Revision de portafolio y version final"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA — Anatomia del correo formal",
          "duration": "20 min",
          "description": "El docente presenta el escenario real: el grupo ha identificado una necesidad comunitaria relacionada con su campo vocacional (falta de equipo de primeros auxilios en la escuela, necesidad de un huerto escolar para el campo de gastronomia, propuesta de reciclaje de residuos electronicos). El reto: comunicarse por escrito en ingles con una institucion o empresa para solicitar apoyo.",
          "activity": "Analisis de 3 correos: en grupos de 3, los estudiantes analizan tres correos anonimizados (bueno, con errores de registro, inadecuado) usando la checklist de 10 items. Clasifican cada correo y justifican con ejemplos del texto: '¿Por qué el correo B tiene problemas? Hay contracciones (I'm) y lenguaje informal (Hey there, Thanks a bunch).' Discusion grupal: ¿qué hace que un correo sea profesional?"
        },
        {
          "title": "FASE II: DESARROLLO — Redaccion guiada",
          "duration": "55 min",
          "description": "Docente modela la redaccion de un correo de solicitud en vivo usando el pizarron (think-aloud: 'I'm choosing I am instead of I'm because this is formal; I need to state my purpose in the first sentence of the body'). Estructura explicitada: Subject (conciso y especifico), Salutation (Dear Mr./Ms./Dr. + apellido, o Dear [Title] si no se conoce el nombre), Opening (purpose statement), Body (2-3 parrafos de 2-3 oraciones cada uno), Closing (call to action + agradecimiento), Sign-off (Yours sincerely / Kind regards + nombre completo).",
          "activity": "Redaccion individual: cada estudiante escribe su correo de solicitud (100-120 palabras). Luego lo convierte en propuesta breve (120-150 palabras) siguiendo la estructura Problema (2-3 oraciones) > Solucion propuesta (2-3 oraciones) > Beneficios esperados (2-3 oraciones) > Accion requerida (1-2 oraciones). Peer review con checklist: el companero verifica cada item y escribe una sugerencia de mejora especifica."
        },
        {
          "title": "FASE III: CIERRE — Portafolio y version final",
          "duration": "25 min",
          "description": "Los estudiantes revisan y mejoran ambos textos (correo + propuesta) incorporando la retroalimentacion del peer review y los comentarios del docente. Ambos textos pasan al portafolio linguistico del semestre como evidencia de produccion escrita formal.",
          "activity": "Reflexion metacognitiva escrita (50 palabras en ingles): '¿Qué fue lo mas dificil de escribir en registro formal? ¿Qué estrategia me fue mas util?' Esta reflexion se guarda junto con el borrador y la version final en el portafolio para mostrar el proceso de mejora (draft > feedback > final version)."
        }
      ]
    },
    "theory": {
      "introduction": "El genero del correo electronico formal es quiza el texto funcional mas importante en contextos profesionales y academicos contemporaneos. A diferencia de la conversacion oral, la escritura formal en ingles tiene convenciones de genero muy establecidas (estructura, registro, formulas) que deben aprenderse explicitamente. En el MCER 2020, el nivel B1 incluye: 'Can write simple connected text on topics which are familiar or of personal interest' y 'Can write personal letters describing experiences, feelings and events in detail.' La propuesta breve extiende esta competencia al contexto profesional-institucional.",
      "sections": [
        {
          "subtitle": "Registro formal en ingles escrito: contrastes clave",
          "content": "El registro formal en ingles escrito se distingue por: (1) Ausencia de contracciones: 'I am' (no I'm), 'I would' (no I'd), 'do not' (no don't); (2) Vocabulario formal: 'I am writing to inform you' (no 'I want to tell you'), 'I would appreciate' (no 'I want'), 'Please do not hesitate to contact me' (no 'Feel free to message me'); (3) Evitar coloquialismos: no 'Hey', 'Thanks a lot', 'Get back to me'; (4) Oraciones completas y correctamente puntuadas; (5) Parrafos cortos y enfocados (2-3 oraciones por parrafo). Estos contrastes son evaluados explicitamente en el CENNI como marcadores de competencia escrita B1."
        },
        {
          "subtitle": "Estructura de la propuesta breve B1",
          "content": "Una propuesta breve (short proposal, 120-150 palabras) en ingles sigue tipicamente cuatro secciones: (1) Problema: describir la situacion actual con evidencia ('Currently, our school lacks... According to IMJUVE, 63% of young people...'); (2) Solucion propuesta: describir que se quiere hacer ('We propose to... / Our suggestion is to...'); (3) Beneficios esperados: cuantificar si es posible ('This would benefit approximately 300 students... / As a result, we expect...'); (4) Accion requerida: solicitud concreta y accionable ('We kindly request your support in the form of... / We would be grateful if you could...'). Esta estructura es basicamente la misma que se usa en propuestas academicas universitarias y en solicitudes de beca — transferencia directa de alta utilidad."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "Which opening line is CORRECT for a formal email requesting support?",
          "options": [
            "Hey, I'm a student and I want to ask you something about your program.",
            "Dear Ms. Rodriguez, I am writing to request information about your community support program.",
            "Hi there! We need your help with a school project, thanks!",
            "To who it may concern, I'm writing because I want to know about your company."
          ],
          "correct": "Dear Ms. Rodriguez, I am writing to request information about your community support program."
        },
        {
          "question": "In a short proposal, what is the purpose of the BENEFITS section?",
          "options": [
            "To describe the current problem that needs to be solved.",
            "To explain in detail what action you are requesting from the reader.",
            "To show the positive outcomes of the proposed solution, ideally with data.",
            "To introduce yourself and explain why you are writing."
          ],
          "correct": "To show the positive outcomes of the proposed solution, ideally with data."
        },
        {
          "question": "Which sign-off is APPROPRIATE for a formal email in English?",
          "options": [
            "Bye for now, see you!",
            "Cheers and thanks a bunch!",
            "Yours sincerely, [Full Name]",
            "Later, [First name]"
          ],
          "correct": "Yours sincerely, [Full Name]"
        }
      ],
      "rubric": "4: Correo de 100-120 palabras con todas las partes en orden, registro formal sin contracciones, proposito explicito en la primera oracion del cuerpo; propuesta de 120-150 palabras con estructura Problema-Solucion-Beneficios-Accion y datos concretos. 3: Correo completo con registro mayormente formal y proposito claro; propuesta con 3 de 4 secciones. 2: Correo con partes pero registro informal o proposito difuso; propuesta incompleta. 1: Texto que no sigue la estructura del genero o de menos de 80 palabras."
    },
    "teacher_tips": [
      "El analisis de correos malos antes de escribir el propio es mas efectivo que presentar solo ejemplos correctos — los estudiantes aprenden a identificar los errores antes de cometerlos.",
      "La estructura de la propuesta breve (Problema-Solucion-Beneficios-Accion) es identica a la que se usa en proyectos universitarios de primer ingreso — vale la pena senalarlo como habilidad transferible.",
      "Guardar el borrador junto con la version final en el portafolio es pedagogicamente valioso: muestra proceso, no solo producto.",
      "Si hay tiempo, enviar realmente el correo (o la propuesta) a una institucion real — aunque sea IMJUVE, la presidencia municipal o una ONG — eleva dramaticamente la motivacion y autenticidad."
    ]
  },

  "IN-V-P07": {
    "code": "IN-V-P07",
    "title": "Participa en una interaccion oral semiestructurada (entrevista, presentacion breve, panel).",
    "level": "Ingles V",
    "duration": "~4h (2 sesiones de 50 min)",
    "difficulty": "Intermedio-Avanzado",
    "category": "Interaccion oral - Estrategias de comunicacion B1",
    "metadata": {
      "objective": "Participar con fluidez y estrategia comunicativa en interacciones orales semiestructuradas (panel vocacional simulado), usando recursos de manejo de turno, reparacion comunicativa y estrategias de compensacion (aproximacion, circumlocucion), adaptando el registro al interlocutor.",
      "competencies": [
        "Usa formulas de toma y cesion de turno para mantener el flujo conversacional en un panel.",
        "Repara la comunicacion cuando comete un error o no comprende: 'What I meant to say was...; Let me rephrase...'",
        "Aplica estrategias de compensacion cuando no recuerda una palabra tecnica: circumlocucion y aproximacion.",
        "Adapta el nivel de tecnicismo segun si el interlocutor es 'experto' o 'publico general' no especializado."
      ],
      "materials": [
        "CENNI — descriptores de interaccion oral B1 (cenni.sep.gob.mx).",
        "CEFR 2020 Companion Volume — Interaction strategies: turntaking, repair, cooperating.",
        "Tarjetas de circumlocucion con 10 palabras tecnicas del campo a describir sin decirlas directamente.",
        "Checklist de interaccion oral B1 basada en PRONI-SEP (10 indicadores observables).",
        "Timer visual (8 minutos por mesa en la feria vocacional final)."
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "15 min", "label": "Formulas de turno y reparacion comunicativa"},
        {"phase": "Desarrollo", "duration": "60 min", "label": "Circumlocucion y ensayo completo de panel"},
        {"phase": "Cierre", "duration": "25 min", "label": "Feria vocacional simulada y autoevaluacion"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA — Formulas de turno y reparacion",
          "duration": "15 min",
          "description": "El docente presenta el escenario: 'Feria vocacional escolar' donde cada equipo representa a profesionales de su campo recibiendo visitantes (otros estudiantes, docentes invitados). El reto: mantener una conversacion fluida en ingles durante 8 minutos sin preparacion total. El docente presenta 10 formulas de turno y reparacion en tarjetas: (toma de turno) 'Well... / Let me add to that... / Building on what [name] said...' (cesion) 'What do you think, [name]? / I'd like to hear your opinion on...' (reparacion) 'What I meant to say was... / Let me rephrase that... / Sorry, I'll say that again...'",
          "activity": "Drill de formulas: triadas de 5 minutos donde cada participante debe usar al menos 2 formulas de turno y 1 de reparacion. El observador cuenta y anota con marcas de paloteo. Retroalimentacion inmediata: ¿cuantas formulas usaste? ¿Se sintio natural o forzado? El docente modela como usar las formulas de manera natural (no mecanica)."
        },
        {
          "title": "FASE II: DESARROLLO — Circumlocucion y ensayo de panel",
          "duration": "60 min",
          "description": "Circumlocucion race: cada equipo recibe 10 tarjetas con palabras tecnicas de su campo que deben describir en ingles sin decir la palabra. 30 segundos por tarjeta. Ejemplos: campo salud — 'stethoscope' (the thing doctors use to listen to your heart); campo tecnologia — 'firewall' (a system that protects your computer from unwanted access from outside). El equipo que mas palabras describe en 5 minutos gana. Discusion: ¿qué estrategias usaron? (definicion, funcion, analogia, ejemplo).",
          "activity": "Simulacro completo de panel: 15 minutos por equipo (3 min presentacion inicial + 12 min Q&A de 'visitantes'). Los visitantes (estudiantes de otro equipo) tienen una lista de preguntas de complejidad creciente. Los panelistas deben manejar al menos una pregunta imprevista (que el docente introduce sin previo aviso). Observadores usan la checklist de 10 indicadores."
        },
        {
          "title": "FASE III: CIERRE — Feria vocacional y autoevaluacion",
          "duration": "25 min",
          "description": "Evento simulado: los equipos se distribuyen en mesas alrededor del salon. Los 'visitantes' rotan cada 8 minutos segun una senal del docente. Durante 8 minutos, el equipo en la mesa recibe visitantes y mantiene conversacion sobre su campo. El docente circula, observa y toma notas de instancias de estrategia comunicativa para retroalimentacion colectiva al final.",
          "activity": "Autoevaluacion: cada estudiante completa la lista de verificacion CEFR B1 de interaccion oral (CENNI) marcando: (1) ¿Mantuve el intercambio sin silencios excesivos? (2) ¿Use al menos 3 estrategias de turno o reparacion? (3) ¿Adapte mi nivel tecnico segun el interlocutor? (4) ¿Fue mi pronunciacion inteligible para el interlocutor? Reflexion breve: 2 fortalezas y 1 area de mejora para el portafolio."
        }
      ]
    },
    "theory": {
      "introduction": "Las estrategias de interaccion oral son un componente explicito del MCER desde su edicion original (2001) y amplificadas en el Companion Volume (2020). Para el nivel B1, el CENNI y el PRONI-SEP especifican que el estudiante debe poder 'hacer uso de una variedad de estrategias para lograr la comprension en la conversacion, incluyendo preguntar para aclarar, pedir reformulacion, pedir repeticion y participar en la construccion colaborativa del significado.' La circumlocucion — describir algo sin usar la palabra exacta — es una estrategia de compensacion especialmente util para hablantes en proceso de adquisicion que aun no tienen acceso fluido a todo su vocabulario receptivo.",
      "sections": [
        {
          "subtitle": "Estrategias de compensacion en habla B1",
          "content": "Cuando un hablante B1 no recuerda una palabra, tiene tres opciones principales: (1) Circumlocucion: describir el concepto con palabras mas simples ('the thing you use to take your temperature' = thermometer); (2) Aproximacion: usar una palabra semanticamente cercana aunque no sea exacta ('a kind of medicine that you take to reduce swelling' = anti-inflammatory); (3) Prestamo y adaptacion: tomar la palabra del espanol y adaptarla al ingles con pronunciacion anglizada (arriesgar 'diagnose' si no recuerda 'assess'). Las estrategias 1 y 2 son preferibles en contextos formales; la estrategia 3 es un recurso de emergencia. Los evaluadores del CENNI y del IELTS reconocen el uso estrategico de estas compensaciones como indicador positivo, no como fallo."
        },
        {
          "subtitle": "Adaptacion del registro segun el interlocutor",
          "content": "Un profesional competente ajusta el nivel de tecnicismo de su explicacion segun quien le escucha: con otro experto usa terminologia especializada sin definirla; con un publico general, la simplifica y usa analogias. En ingles B1, este ajuste se manifiesta en: (1) Nivel de vocabulario — 'myocardial infarction' con expertos vs 'heart attack' con el publico; (2) Velocidad de habla — mas lenta con interlocutores no especializados; (3) Preguntas de verificacion — 'Does that make sense?' / 'Are you familiar with...?' / 'Should I explain that term?' Esta competencia sociolinguistica es evaluada en el CENNI como parte de la escala de 'rango linguistico' y 'adecuacion sociolinguistica' a nivel B1."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "Which phrase is an example of CIRCUMLOCUTION in English?",
          "options": [
            "The word I'm looking for is 'stethoscope'.",
            "It's the device doctors use to listen to your heart and lungs.",
            "I don't know the English word for that medical instrument.",
            "In Spanish it's called 'estetoscopio', I think it's similar in English."
          ],
          "correct": "It's the device doctors use to listen to your heart and lungs."
        },
        {
          "question": "Which expression CORRECTLY cedes a turn to another speaker in a panel discussion?",
          "options": [
            "Stop talking, it's my turn now.",
            "Be quiet, I want to say something.",
            "Building on what Maria said, I'd like to add... and Maria, what do you think about that?",
            "I have nothing to say, so you can talk."
          ],
          "correct": "Building on what Maria said, I'd like to add... and Maria, what do you think about that?"
        },
        {
          "question": "When is it appropriate to use REPAIR in conversation?",
          "options": [
            "Only when the listener explicitly says they did not understand.",
            "Never — repair makes you sound less confident.",
            "When you realize mid-sentence that you used the wrong word or structure.",
            "Only at the end of a long turn to summarize what you said."
          ],
          "correct": "When you realize mid-sentence that you used the wrong word or structure."
        }
      ],
      "rubric": "4: Participacion fluida con 3+ estrategias de turno/reparacion usadas naturalmente, circumlocucion efectiva en al menos 1 instancia, adaptacion del registro al interlocutor documentada; autoevaluacion especifica y honesta. 3: Participacion sostenida con algunas estrategias de turno; circumlocucion intentada aunque no siempre exitosa. 2: Participacion breve con silencios excesivos; estrategias de turno ausentes o mecanicas. 1: Participacion minima; dificultad para mantener un intercambio de mas de 2 turnos."
    },
    "teacher_tips": [
      "La circumlocucion race es la actividad mas energizante de la progresion — realizarla de pie y con tiempo cronometrado visible aumenta la participacion de estudiantes habitualmente timidos.",
      "El docente que circula durante la feria vocacional tomando notas positivas (no solo de errores) y leyendolas al final genera un ambiente psicologicamente seguro para el riesgo comunicativo.",
      "Si un estudiante tiene ansiedad alta ante la interaccion oral, asignarle el rol de 'experto' (en la mesa) en lugar de 'visitante' (en rotacion) reduce la presion de iniciar conversacion.",
      "Las formulas de reparacion son mas dificiles de interiorizar que las de turno — practicalas con juegos donde 'equivocarse' es parte del objetivo ('di algo incorrecto y corrígelo usando una formula de reparacion')."
    ]
  },

  "IN-V-P08": {
    "code": "IN-V-P08",
    "title": "Integra habilidades linguisticas y produce un proyecto final vinculado al campo tematico del grupo.",
    "level": "Ingles V",
    "duration": "~6h (3 sesiones de 50 min + trabajo autonomo)",
    "difficulty": "Intermedio-Avanzado",
    "category": "Proyecto integrador - Portafolio linguistico B1",
    "metadata": {
      "objective": "Integrar las cuatro habilidades linguisticas (comprension auditiva, lectora, produccion escrita y oral) en un portafolio linguistico B1 sobre el campo vocacional; demostrar el aprendizaje del semestre mediante seleccion reflexiva de evidencias, autoreflexion metacognitiva con lenguaje CEFR y presentacion oral de 3 minutos sin dependencia de guion.",
      "competencies": [
        "Selecciona y justifica en ingles tres evidencias representativas de las habilidades desarrolladas en el semestre.",
        "Redacta una autoreflexion de aprendizaje (120-150 palabras) usando descriptores CEFR B1: 'I can now... / I still need to work on...'",
        "Presenta el portafolio oralmente en 4 minutos con fluidez B1 sin leer el guion.",
        "Recibe y da retroalimentacion constructiva usando la rubrica holistica B1 del CENNI."
      ],
      "materials": [
        "European Language Portfolio (ELP) — modelo de portafolio MCER (coe.int/elp).",
        "CENNI — descriptores de autoevaluacion nivel B1 (cenni.sep.gob.mx).",
        "PRONI-SEP — guia de portafolio linguistico Sem 5.",
        "Rubrica holistica B1 integrada (elaborada por docente con base en CEFR 2020).",
        "Plataforma de exhibicion digital: Padlet, Google Slides o Canva (segun acceso del grupo)."
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "Apertura", "duration": "20 min", "label": "Estructura del portafolio y seleccion de evidencias"},
        {"phase": "Desarrollo", "duration": "80 min", "label": "Reflexion escrita y grabacion de video/podcast"},
        {"phase": "Cierre", "duration": "50 min", "label": "Exhibicion del portafolio y evaluacion holistica"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA — Estructura y seleccion de evidencias",
          "duration": "20 min",
          "description": "El docente presenta el formato del portafolio linguistico B1 con sus secciones: (1) Cover page (nombre, campo vocacional, semestre, fecha); (2) Field description essay (150 palabras — evolucion de P01); (3) Three evidence samples con justificacion (una por habilidad: escrita, oral, lectora); (4) Learning journey reflection (120-150 palabras); (5) Goals statement (50 palabras: metas para el siguiente semestre o para el CENNI). Los estudiantes revisan sus producciones del semestre (P01-P07) y seleccionan las tres que mejor demuestran su nivel B1.",
          "activity": "Justificacion de evidencias: cada estudiante escribe en ingles una oracion de justificacion por cada evidencia seleccionada: 'I chose this [email/story/summary] because it shows my ability to... / It demonstrates that I can... / I am proud of this piece because...' Esta justificacion reflexiva es el corazon del portafolio — no es compilacion sino seleccion argumentada."
        },
        {
          "title": "FASE II: DESARROLLO — Reflexion escrita y video",
          "duration": "80 min",
          "description": "Sesion de escritura de learning journey (120-150 palabras): los estudiantes narran su trayectoria del semestre en ingles usando los descriptores CEFR B1 como andamiaje. El docente proporciona sentence starters: 'At the beginning of the semester, I found it difficult to... / Now I can... / The biggest challenge was... / What helped me most was... / I still need to work on... / My goal for next semester is...' Luego: sesion de grabacion de video o podcast de 3 minutos (practicar con un companero antes de grabar la version final).",
          "activity": "Grabacion en parejas: el companero escucha y da retroalimentacion antes de la grabacion final: 'Tu presentacion fue clara / no leiste el guion / usaste vocabulary de tu campo / un area de mejora: la parte donde explicas tu reflexion fue muy rapida.' Grabacion final: 3 minutos exactos, presentando el campo vocacional, las evidencias seleccionadas y la reflexion personal. Sin leer guion — se permiten notas breves en una tarjeta (5 palabras clave maximo)."
        },
        {
          "title": "FASE III: CIERRE — Exhibicion y evaluacion holistica",
          "duration": "50 min",
          "description": "Mini-exposicion del portafolio: cada estudiante presenta en 4 minutos a un 'evaluador' (docente o par capacitado con rubrica). El evaluador da retroalimentacion usando la rubrica holistica B1: (1) Rango linguistico — variedad de vocabulario y estructuras B1; (2) Precision — errores que no impiden la comprension; (3) Fluidez — velocidad natural, sin paradas excesivas; (4) Interaccion — responde preguntas del evaluador; (5) Coherencia — el portafolio tiene un hilo narrativo del campo vocacional.",
          "activity": "Celebracion del semestre: el docente lee tres extractos anonimos de learning journeys especialmente reflexivos y el grupo vota el mas inspirador. Se toma foto grupal con los portafolios. El docente entrega a cada estudiante una tarjeta personal con un reconocimiento especifico de su progreso en ingles (no notas — lenguaje de descripcion de nivel: 'Your storytelling in P02 showed real B1 narrative skills')."
        }
      ]
    },
    "theory": {
      "introduction": "El portafolio linguistico europeo (ELP, European Language Portfolio) es un instrumento del Consejo de Europa disenado para que los aprendices documenten y reflexionen sobre su aprendizaje de lenguas usando los niveles del MCER como marco de referencia comun. En Mexico, el CENNI (Centro Nacional de Evaluacion para la Educacion Superior) usa los descriptores B1 del MCER para la certificacion de nivel linguistico de egresados del bachillerato. El portafolio es, por tanto, un documento de aprendizaje Y de evaluacion que conecta la experiencia escolar con las certificaciones internacionales — una herramienta de alto valor academico y profesional para el estudiante.",
      "sections": [
        {
          "subtitle": "Autoreflexion metacognitiva con lenguaje CEFR",
          "content": "La autoreflexion metacognitiva en lengua extranjera tiene dos beneficios documentados: (1) Consolida el aprendizaje al obligar al estudiante a articular lo que sabe y lo que todavia le cuesta; (2) Desarrolla autonomia del aprendiz — la capacidad de dirigir el propio aprendizaje fuera del aula, que es central para el nivel B1 y superiores. Los descriptores CEFR B1 formulados en primera persona ('I can...') sirven de andamiaje linguistico: el estudiante no necesita inventar el lenguaje de la reflexion, sino completar los descriptores con sus propias experiencias especificas del semestre."
        },
        {
          "subtitle": "El portafolio como instrumento de certificacion CENNI",
          "content": "El CENNI evalua el nivel de ingles de egresados del bachillerato mexicano con referencia al MCER. El nivel minimo esperado al termino del bachillerato NEM es B1. El portafolio linguistico prepara al estudiante para esta certificacion de tres maneras: (1) Lo habitua a los descriptores de nivel como lenguaje de autoevaluacion; (2) Le da evidencia concreta de sus capacidades para presentar en una entrevista de certificacion; (3) Le permite identificar sus areas de mejora para un estudio autonomo dirigido antes del examen. La conexion portafolio-CENNI es un argumento motivacional poderoso para estudiantes que ven la certificacion como una meta concreta post-bachillerato."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "Which sentence is an example of METACOGNITIVE REFLECTION using CEFR language?",
          "options": [
            "I did all the assignments in this course and I think I learned a lot.",
            "English is very difficult but I tried my best every class.",
            "I can now write a formal email in English, but I still need to work on fluency in spontaneous oral interaction.",
            "My favorite activity was the storytelling because it was fun and I liked it."
          ],
          "correct": "I can now write a formal email in English, but I still need to work on fluency in spontaneous oral interaction."
        },
        {
          "question": "What is the PRIMARY purpose of SELECTING evidence for a language portfolio?",
          "options": [
            "To include every piece of work produced during the semester.",
            "To show only perfect, error-free work to demonstrate high competence.",
            "To choose and justify pieces that best demonstrate specific language abilities developed.",
            "To compare your work with other students' work and show you are better."
          ],
          "correct": "To choose and justify pieces that best demonstrate specific language abilities developed."
        },
        {
          "question": "According to the CEFR 2020, what can a B1 user do in English?",
          "options": [
            "Understand and produce complex professional documents without difficulty.",
            "Communicate in simple, direct exchanges on familiar topics and of personal interest.",
            "Express ideas fluently and spontaneously without much obvious searching for expressions.",
            "Understand virtually everything heard or read in any variety of English."
          ],
          "correct": "Communicate in simple, direct exchanges on familiar topics and of personal interest."
        }
      ],
      "rubric": "4: Portafolio completo con todas las secciones, 3 evidencias justificadas en ingles, reflexion de 120-150 palabras con descriptores CEFR especificos y metas concretas, video de 3 min sin leer guion con fluidez B1. 3: Portafolio completo con reflexion pero sin descriptores CEFR especificos; video con lectura parcial de notas. 2: Portafolio con secciones incompletas; reflexion en espanol o menos de 80 palabras; video de menos de 90 seg. 1: Portafolio sin reflexion o sin evidencias; video ausente o de menos de 60 seg."
    },
    "teacher_tips": [
      "La tarjeta personal de reconocimiento del docente — no una nota, sino una descripcion de nivel ('your narrative skills showed real B1 progression') — es el cierre emocional mas poderoso del semestre.",
      "Guardar los portafolios digitales en una carpeta compartida de grupo (Google Drive) permite que los estudiantes los accedan para el CENNI un año despues.",
      "El video de 3 min sin guion es angustiante para muchos estudiantes — el ensayo con companero antes de grabar reduce el miedo y mejora la calidad del producto final.",
      "Si el CENNI no esta disponible localmente, el portafolio puede usarse como evidencia en entrevistas de beca universitaria o en solicitudes de empleo que pidan nivel de ingles — comunicarselo a los estudiantes aumenta la motivacion."
    ]
  }
}

os.makedirs(os.path.dirname(os.path.abspath(OUT)), exist_ok=True)
with open(OUT, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Written {len(data)} progressions to {os.path.abspath(OUT)}")

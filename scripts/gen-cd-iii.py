"""Generate src/data/planteamiento/cd-iii.json — Cultura Digital III (4 progresiones)."""
import json, pathlib

OUT = pathlib.Path(__file__).parent.parent / "src" / "data" / "planteamiento" / "cd-iii.json"

data = {
  "CD-III-P01": {
    "code": "CD-III-P01",
    "title": "Analiza criticamente la comunicacion digital multimodal y sus efectos en la sociedad mexicana",
    "level": "Cultura Digital III",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Intermedio",
    "category": "Analisis critico digital",
    "metadata": {
      "objective": "Analizar de forma critica la comunicacion digital multimodal (texto, imagen, audio, video) identificando sus efectos sociales en Mexico: desinformacion, deepfakes, burbujas de filtro, discurso de odio y vigilancia digital, y aplicar estrategias de defensa de los derechos digitales.",
      "competencies": [
        "Identifica las caracteristicas de la comunicacion multimodal y como cada canal (imagen, texto, audio, video) refuerza o contradice el mensaje",
        "Analiza el fenomeno de la desinformacion en Mexico: noticias falsas, deepfakes, astroturfing (ENDUTIH, INEGI: 78.6% usuarios internet)",
        "Explica el concepto de burbuja de filtro y camara de eco en redes sociales y su efecto en la polarizacion politica",
        "Identifica el discurso de odio en plataformas digitales: caracteristicas, ejemplos y herramientas de denuncia (CONAPRED, plataformas)",
        "Conoce los derechos digitales en Mexico: privacidad (LFPDPPP), libertad de expresion y sus limites, habeas data (R3D)"
      ],
      "materials": [
        "Datos ENDUTIH 2022 (INEGI): 78.6% de mexicanos son usuarios de internet; 91.9% acceden via smartphone",
        "Caso de desinformacion documentado en Mexico (Animal Politico o Verificado MX: alguna noticia falsa viralizada en Mexico)",
        "Video: como detectar un deepfake (5 min, MIT o equivalente en espanol)",
        "Infografia: tus derechos digitales en Mexico (R3D: Red en Defensa de los Derechos Digitales)",
        "Ficha: algoritmos de recomendacion y burbujas de filtro (Eli Pariser, The Filter Bubble)"
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "S1", "duration": "50 min", "label": "Desinformacion, deepfakes y burbujas de filtro en Mexico"},
        {"phase": "S2", "duration": "50 min", "label": "Discurso de odio, derechos digitales y estrategias de defensa"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "10 min",
          "description": "Activar la conciencia sobre la exposicion diaria a contenido digital sin filtro critico.",
          "activity": "El docente pregunta: cuanto tiempo pasaron en redes sociales ayer? que tipo de contenido vieron? alguien comparte informacion sin verificarla? Dato motivador: el 91.9% de los usuarios de internet en Mexico acceden via smartphone (ENDUTIH 2022), lo que significa que la mayoria del consumo de informacion es movil, fragmentado y rapido -- condiciones ideales para la desinformacion."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "30 min",
          "description": "S1: desinformacion, deepfakes y burbujas. S2: discurso de odio y derechos digitales.",
          "activity": "S1: El docente presenta un caso real de noticia falsa verificado por Animal Politico o Verificado MX (plataformas mexicanas de fact-checking). Proceso de verificacion: buscar la fuente original, buscar imagen inversa (TinEye o Google), contrastar con fuentes institucionales. Deepfakes: video corto de como se detectan (movimientos oculares, sombras, pixelacion en bordes). Burbujas de filtro: los algoritmos de Facebook, TikTok, YouTube muestran contenido que refuerza las creencias previas del usuario; genera polarizacion. Experimento: dos personas buscan el mismo tema en distintas cuentas y comparan resultados. S2: Discurso de odio: definicion, ejemplos en redes sociales mexicanas, mecanismos de denuncia en plataformas (Twitter/X, Meta, TikTok) y ante el CONAPRED. Derechos digitales en Mexico: derecho a la privacidad (LFPDPPP, ley de proteccion de datos); derecho al olvido digital; derecho a la libertad de expresion con limites (no al discurso de odio, la amenaza o la difamacion). R3D (Red en Defensa de los Derechos Digitales): OSC que documenta violaciones a derechos digitales en Mexico."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "10 min",
          "description": "Reflexion: la alfabetizacion digital critica como derecho y responsabilidad ciudadana.",
          "activity": "Cada estudiante escribe tres compromisos personales de higiene digital: que haran diferente en su uso de redes sociales. El docente recoge y los convierte en un cartel del salon para el resto del semestre."
        }
      ]
    },
    "theory": {
      "introduction": "La comunicacion digital multimodal combina texto, imagen, audio y video en mensajes que circulan a velocidad sin precedentes en redes sociales y plataformas de mensajeria. Mexico es uno de los paises con mayor penetracion de redes sociales en el mundo hispanohablante: segun la ENDUTIH 2022 del INEGI, el 78.6% de los mexicanos son usuarios de internet y el 91.9% acceden via smartphone. Este ecosistema digital presenta riesgos especificos: la desinformacion (noticias falsas), los deepfakes, las burbujas de filtro y el discurso de odio son fenomenos con efectos sociales y politicos reales en Mexico.",
      "sections": [
        {
          "subtitle": "Desinformacion y fact-checking en Mexico",
          "content": "La desinformacion es informacion falsa o engañosa difundida deliberadamente para confundir, manipular o perjudicar. Se distingue de la mala informacion (que puede ser error involuntario) y de la propaganda (que tiene objetivo politico explicito). En Mexico existen plataformas especializadas en fact-checking: Animal Politico (animalpolitico.com) con su seccion Detector de mentiras; Verificado MX (verificado.com.mx); el IFAI (INAI) para datos gubernamentales. Las noticias falsas sobre salud fueron especialmente peligrosas durante el COVID-19: el termino infodemia fue acunado por la OMS para describir el exceso de informacion (verdadera y falsa) que dificultaba la toma de decisiones."
        },
        {
          "subtitle": "Deepfakes y manipulacion audiovisual",
          "content": "Un deepfake es un video, audio o imagen manipulado con inteligencia artificial para que una persona parezca decir o hacer algo que nunca hizo. La tecnologia usa redes generativas adversariales (GANs). Sus usos maliciosos incluyen: difamacion de figuras publicas, pornografia no consensuada, propaganda politica. Senales para detectar deepfakes: parpadeo innatural o ausente; bordes difusos en pelo y orejass; inconsistencias en iluminacion y sombras; movimientos de boca que no sincronizan perfectamente con el audio; artefactos visuales en el cuello. En Mexico, la Ley Federal de Telecomunicaciones y Radiodifusion y el Codigo Penal Federal tienen disposiciones sobre falsificacion de contenido digital, aunque su aplicacion es aun incipiente."
        },
        {
          "subtitle": "Burbujas de filtro y polarizacion",
          "content": "El termino burbuja de filtro fue acunado por Eli Pariser en 2011 para describir como los algoritmos de personalizacion de plataformas (Google, Facebook, TikTok) seleccionan el contenido que el usuario ve basandose en sus interacciones previas, creando una camara de eco donde solo circulan ideas que refuerzan sus creencias previas. En Mexico, las investigaciones del CIDE y el Data Civica han documentado que los algoritmos de Twitter/X y Facebook contribuyeron a la polarizacion politica durante las elecciones de 2018 y 2021. La estrategia de diversificacion de fuentes (buscar informacion en medios con diversas perspectivas editoriales) es la principal herramienta contra las burbujas."
        },
        {
          "subtitle": "Derechos digitales en Mexico: marco legal y organizaciones",
          "content": "Ley Federal de Proteccion de Datos Personales en Posesion de los Particulares (LFPDPPP, 2010): regula el uso de datos personales por empresas privadas. Los ciudadanos tienen derechos ARCO: Acceso, Rectificacion, Cancelacion y Oposicion al uso de sus datos. INAI (Instituto Nacional de Transparencia, Acceso a la Informacion y Proteccion de Datos Personales): organismo autonomo que tutela el derecho de acceso a la informacion publica y la proteccion de datos. R3D (Red en Defensa de los Derechos Digitales): OSC que documenta el uso de spyware (Pegasus) contra periodistas y activistas mexicanos, la censura en internet y las violaciones a la privacidad digital. Mexico fue uno de los paises con mayor uso documentado del spyware Pegasus contra periodistas (NYT/Citizen Lab 2017)."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "Segun la ENDUTIH 2022 del INEGI, que porcentaje de mexicanos son usuarios de internet?",
          "options": ["78.6%", "50%", "95%", "40%"],
          "correct": "78.6%"
        },
        {
          "question": "Una burbuja de filtro en redes sociales es:",
          "options": ["Un entorno digital donde el algoritmo solo muestra contenido que refuerza las creencias previas del usuario", "Un filtro de contenido inapropiado instalado por los padres", "Una herramienta de privacidad para proteger los datos del usuario", "Un programa que bloquea las noticias falsas automaticamente"],
          "correct": "Un entorno digital donde el algoritmo solo muestra contenido que refuerza las creencias previas del usuario"
        },
        {
          "question": "Los derechos ARCO en la LFPDPPP se refieren a:",
          "options": ["Acceso, Rectificacion, Cancelacion y Oposicion al uso de datos personales", "Autenticidad, Relevancia, Confiabilidad y Oportunidad de la informacion", "Acceso, Registro, Control y Operacion de plataformas digitales", "Anonimato, Rendicion de cuentas, Cifrado y Openness de la red"],
          "correct": "Acceso, Rectificacion, Cancelacion y Oposicion al uso de datos personales"
        },
        {
          "question": "Cual de las siguientes es una senal para detectar un deepfake?",
          "options": ["Parpadeo innatural o ausente y bordes difusos en el pelo y las orejas", "El video tiene mas de 10 millones de reproducciones", "El video fue publicado por una cuenta verificada", "El audio esta en un idioma diferente al espanol"],
          "correct": "Parpadeo innatural o ausente y bordes difusos en el pelo y las orejas"
        }
      ],
      "rubric": "Nivel 4: Analiza con precision los fenomenos de desinformacion, deepfakes y burbujas de filtro con ejemplos mexicanos, identifica los derechos digitales y los mecanismos de defensa (LFPDPPP, INAI, R3D) y propone estrategias personales de higiene digital fundamentadas; Nivel 3: Identifica los fenomenos y describe los derechos digitales; puede carecer de ejemplos mexicanos especificos; Nivel 2: Conoce algunos conceptos (noticias falsas, burbuja de filtro) pero no los conecta con el marco legal mexicano; Nivel 1: No puede distinguir desinformacion de informacion correcta o no conoce ningun derecho digital."
    },
    "teacher_tips": [
      "El ejercicio del deepfake en tiempo real es muy impactante: mostrar en clase un video deepfake y pedir a los estudiantes que identifiquen las senales antes de revelar que es falso.",
      "La plataforma Animal Politico tiene una seccion de Detector de Mentiras con casos verificados y el proceso de verificacion documentado; es excelente como modelo de pensamiento critico aplicado.",
      "Para la burbuja de filtro, el experimento de buscar el mismo termino en diferentes dispositivos o cuentas puede hacerse en clase si hay internet: los resultados suelen ser sorprendentes y generan conversacion.",
      "Conexion con LC-III P01 (lectura critica, evaluacion de fuentes CRAAP) y CD-II P01 (modelo CRAAP, protocolo SIFT): recordar explicitamente esas herramientas y mostrar como se aplican en el contexto digital actual."
    ]
  },

  "CD-III-P02": {
    "code": "CD-III-P02",
    "title": "Produce contenidos digitales de calidad orientados a la divulgacion y la transformacion social",
    "level": "Cultura Digital III",
    "duration": "~4h (3 sesiones de 50 min)",
    "difficulty": "Intermedio",
    "category": "Produccion digital",
    "metadata": {
      "objective": "Disenar y producir contenidos digitales de calidad (infografias, podcasts, videos cortos, newsletters) orientados a comunicar un problema social de Mexico a una audiencia especifica, aplicando criterios de comunicacion efectiva, propiedad intelectual y responsabilidad editorial.",
      "competencies": [
        "Planifica un contenido digital: audiencia, objetivo, formato, canal, tono, mensaje clave",
        "Usa herramientas de produccion digital: Canva (infografias), CapCut/iMovie (video), Anchor/Spotify (podcast), Substack (newsletter)",
        "Aplica criterios de accesibilidad: texto alternativo en imagenes, subtitulos en videos, contraste de colores",
        "Respeta la propiedad intelectual: Creative Commons (BY, BY-SA, BY-NC, CC0), uso justo, citar fuentes correctamente",
        "Publica responsablemente: verificar datos antes de publicar, transparentar fuentes, incluir mecanismo de correccion"
      ],
      "materials": [
        "Cuenta de Canva educativo (canva.com/education, gratuito)",
        "Guia de formatos digitales por objetivo: infografia (datos), podcast (entrevista/narracion), video corto (demostracion), newsletter (analisis)",
        "Lista de fuentes de imagenes libres de derechos: Unsplash, Pixabay, Wikimedia Commons, CONABIO (fotos de fauna mexicana CC)",
        "Checklist de publicacion responsable (basado en R3D y criterios periodisticos)",
        "Ejemplos de divulgacion cientifica mexicana: ¿Como Ves? UNAM, CONAHCYT Canal de Divulgacion, La Ciencia es tuya"
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "S1", "duration": "50 min", "label": "Planificacion del contenido: audiencia, formato, mensaje"},
        {"phase": "S2", "duration": "50 min", "label": "Produccion del contenido con herramientas digitales"},
        {"phase": "S3", "duration": "50 min", "label": "Publicacion responsable, retroalimentacion y mejora"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "10 min",
          "description": "Motivar con ejemplos de divulgacion digital mexicana de calidad.",
          "activity": "El docente muestra: la infografia de CONABIO sobre la Mariposa Monarca, un episodio de ¿Como Ves? UNAM, y un hilo de Twitter/X del INEGI sobre el Censo 2020. Pregunta: que tienen en comun? Todos son contenidos digitales de calidad, con datos confiables, diseño accesible y fuentes transparentes. Estos son los modelos que seguiran en su proyecto."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "30 min",
          "description": "S1: planificacion. S2: produccion. S3: publicacion y retroalimentacion.",
          "activity": "S1: Cada equipo completa la ficha de planificacion: problema que comunicaran (puede ser el mismo del proyecto de CNEYT-III P08 o CS-III), audiencia objetivo (adolescentes de su plantel? madres y padres? autoridades municipales?), formato elegido, tono (informativo, divulgativo, de denuncia, de propuesta), mensaje clave en una oracion. S2: Produccion en clase con herramientas: Canva para infografias (plantillas de datos, mapas de Mexico con datos INEGI), CapCut para video de 60-90 segundos, Anchor/Spotify Podcasters para episodio de 5 minutos. El docente circula apoyando el uso tecnico. Revision de licencias: toda imagen, musica o dato usado debe tener atribucion. S3: Los equipos comparten sus contenidos con otro equipo que evalua usando el checklist de publicacion responsable. Se realizan ajustes. Discusion: donde podrian publicar este contenido para que tenga mayor impacto?"
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "10 min",
          "description": "Presentacion de contenidos y reflexion sobre el rol del productor digital responsable.",
          "activity": "Cada equipo presenta su contenido en 2 minutos. La clase vota por el contenido mas claro, el mas creativo y el mas util. El docente pregunta: si publicaran este contenido en sus propias redes sociales, cuantas personas podrian verlo? cuantas personas en Mexico tienen acceso a internet? (ENDUTIH: 91.8 millones). Reflexion final sobre el poder y la responsabilidad del productor de contenido digital."
        }
      ]
    },
    "theory": {
      "introduction": "La produccion de contenidos digitales de calidad requiere habilidades que van mas alla del manejo de herramientas tecnicas: exige planificacion estrategica (para quien, para que, en que formato), pensamiento critico (verificacion de datos, citacion de fuentes), sensibilidad estetica (diseño accesible y atractivo) y responsabilidad etica (privacidad, propiedad intelectual, impacto potencial). En Mexico, la divulgacion cientifica y la comunicacion social a traves de plataformas digitales es un campo en expansion: el CONAHCYT, la UNAM y organizaciones como Data Civica producen contenidos de alta calidad que pueden servir de modelo.",
      "sections": [
        {
          "subtitle": "Planificacion estrategica de contenido digital",
          "content": "Antes de producir cualquier contenido digital, responder: 1. Objetivo: informar, concientizar, movilizar, entretener, vender? 2. Audiencia: quien lo vera o escuchara? que sabe ya del tema? que necesita saber? 3. Formato: infografia (ideal para datos y procesos), video corto (demostraciones, testimonios), podcast (analisis en profundidad, entrevistas), newsletter (analisis semanal para audiencia comprometida). 4. Canal: Instagram/TikTok (audiencia joven), Twitter/X (debate politico), YouTube (contenido largo), WhatsApp (comunidades cerradas), Facebook (adultos mayores). 5. Tono: formal, coloquial, divulgativo, de denuncia. 6. Mensaje clave: que debe recordar la audiencia despues de consumir el contenido (una sola oracion)."
        },
        {
          "subtitle": "Herramientas de produccion: panorama actual",
          "content": "Infografias: Canva (canva.com/education, gratuito para estudiantes): plantillas profesionales, iconos, mapas, graficas. Alternativas: Piktochart, Infogram. Video: CapCut (app movil, gratuita, muy popular entre jovenes mexicanos): edicion sencilla, subtitulos automaticos, efectos. iMovie (iOS, gratuito). Adobe Premiere Rush (gratuito basico). Podcast: Anchor/Spotify for Podcasters (gratuito, permite publicar directamente en Spotify). Newsletter: Substack (gratuito hasta cierto numero de suscriptores). Transmision en vivo: Instagram Live, YouTube Live, Facebook Live. Datos y visualizacion: Datawrapper, Flourish (graficas interactivas gratuitas, usadas por periodismo de datos en Mexico: Animal Politico, MXCJ)."
        },
        {
          "subtitle": "Propiedad intelectual y Creative Commons",
          "content": "Al producir contenido digital se usan elementos de otros creadores: imagenes, musica, datos, fragmentos de texto. Los derechos de autor protegen estas creaciones automaticamente. Para usar el trabajo de otros de forma legal: Creative Commons (CC): licencias que permiten ciertos usos sin pedir permiso. CC-BY: puedes usar y modificar si das credito. CC-BY-SA: ademas debes compartir con la misma licencia. CC-BY-NC: puedes usar pero no comercialmente. CC0: dominio publico, sin restricciones. Fuentes de imagenes libres de derechos: Unsplash, Pixabay (CC0); Wikimedia Commons (varias licencias CC); CONABIO (fotografias de biodiversidad mexicana con licencia CC). Musica libre de derechos: YouTube Audio Library, Free Music Archive, Incompetech."
        },
        {
          "subtitle": "Divulgacion digital de calidad: modelos mexicanos",
          "content": "¿Como Ves? es la revista de divulgacion cientifica de la UNAM, publicada desde 1998 y disponible en linea en comoves.unam.mx; es un referente de contenido accesible sobre ciencia en espanol. CONAHCYT (antes CONACYT): ha producido series de video divulgativo, podcasts y reportajes sobre ciencia e innovacion en Mexico. Data Civica (datacivica.org): organizacion que produce visualizaciones de datos sobre derechos humanos, genero y gobierno en Mexico. INEGI en redes sociales: el INEGI ha desarrollado una estrategia de comunicacion digital notable, publicando datos del Censo y de sus encuestas en formato accesible con infografias y videos cortos; su cuenta de Twitter/X (@INEGI_INFORMA) es un modelo de comunicacion institucional de datos."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "Al planificar un contenido digital, el mensaje clave es:",
          "options": ["La idea central que la audiencia debe recordar despues de consumir el contenido (una sola oracion)", "El titulo del contenido digital", "La lista completa de datos que se incluiran", "El formato tecnico del archivo final"],
          "correct": "La idea central que la audiencia debe recordar despues de consumir el contenido (una sola oracion)"
        },
        {
          "question": "La licencia Creative Commons CC-BY-NC permite:",
          "options": ["Usar y modificar el contenido dando credito, pero no para fines comerciales", "Usar el contenido sin ninguna restriccion (dominio publico)", "Usar el contenido solo si se comparte con la misma licencia", "Usar el contenido sin necesidad de dar credito al autor"],
          "correct": "Usar y modificar el contenido dando credito, pero no para fines comerciales"
        },
        {
          "question": "Cual herramienta es mas adecuada para producir una infografia con datos del INEGI para redes sociales?",
          "options": ["Canva (plantillas profesionales, graficas y iconos)", "Google Docs (procesador de texto)", "Excel (hoja de calculo)", "PowerPoint en modo presentacion"],
          "correct": "Canva (plantillas profesionales, graficas y iconos)"
        },
        {
          "question": "¿Como Ves? es relevante para la produccion digital de calidad porque:",
          "options": ["Es la revista de divulgacion cientifica de la UNAM, modelo de contenido accesible sobre ciencia en espanol", "Es la plataforma del gobierno mexicano para publicar datos estadisticos oficiales", "Es el podcast oficial de la SEP sobre educacion basica", "Es la herramienta de fact-checking de Animal Politico"],
          "correct": "Es la revista de divulgacion cientifica de la UNAM, modelo de contenido accesible sobre ciencia en espanol"
        }
      ],
      "rubric": "Nivel 4: El contenido producido tiene planificacion clara (objetivo, audiencia, mensaje clave), diseño accesible y atractivo, datos verificados con fuentes citadas, licencias respetadas y pasa el checklist de publicacion responsable; la presentacion oral es convincente; Nivel 3: El contenido cumple la mayoria de los criterios; puede faltar una licencia o una fuente; el diseño es funcional; Nivel 2: El contenido tiene datos correctos pero le falta planificacion o diseño; puede tener imagenes sin atribucion o datos sin fuente; Nivel 1: El contenido no tiene objetivo claro, usa datos sin verificar o no cita ninguna fuente."
    },
    "teacher_tips": [
      "Canva tiene un programa especial para educacion (Canva for Education) que otorga acceso gratuito a la version premium a docentes y estudiantes verificados; gestionar el registro con anticipacion.",
      "Mostrar la cuenta de Twitter/X del INEGI como ejemplo de comunicacion institucional de datos accesible: las infografias que publican sobre los resultados del Censo, la ENOE y otras encuestas son modelos de simplificacion sin distorsion.",
      "Para el podcast, no es necesario tener microfono de estudio: el microfono del smartphone es suficiente si se graba en un cuarto con poca reverberacion (un closet es ideal). CapCut permite mejorar el audio.",
      "Conectar con CNEYT-III P08 (proyecto de investigacion-accion ambiental): muchos de los proyectos de esa progresion pueden comunicarse exactamente con los formatos digitales que se trabajan aqui; la transversalidad ahorra tiempo y profundiza la comprension."
    ]
  },

  "CD-III-P03": {
    "code": "CD-III-P03",
    "title": "Explora vocaciones y trayectorias profesionales vinculadas a las tecnologias digitales en Mexico",
    "level": "Cultura Digital III",
    "duration": "~3h (2 sesiones de 50 min)",
    "difficulty": "Basico",
    "category": "Orientacion vocacional digital",
    "metadata": {
      "objective": "Explorar el panorama de profesiones y trayectorias vinculadas a las tecnologias digitales en Mexico, conocer las condiciones del mercado laboral digital, identificar rutas de formacion accesibles (universidades, bootcamps, MOOCs) y reflexionar sobre el propio perfil de intereses y habilidades.",
      "competencies": [
        "Identifica al menos 10 profesiones vinculadas a las tecnologias digitales y sus funciones: desarrollador web, analista de datos, diseñador UX, gestor de redes, especialista en ciberseguridad, cientifico de datos, product manager",
        "Conoce el mercado laboral digital en Mexico: escasez de talento STEM, salarios comparativos, sectores demandantes (STPS/IMCO)",
        "Distingue rutas de formacion: licenciatura (UNAM, IPN, ITESM), ingenieria, bootcamp (BEDU, Platzi, Kodemia), certificaciones (Google, AWS, Microsoft, Meta en espanol)",
        "Explora plataformas de aprendizaje gratuitas: Coursera (con beca), edX, Google Career Certificates, LinkedIn Learning",
        "Reflexiona sobre sus propios intereses y habilidades en relacion con las profesiones digitales exploradas"
      ],
      "materials": [
        "Mapa de profesiones digitales (rueda de carreras tecnologicas: frontend, backend, datos, diseño, seguridad, marketing digital, IA)",
        "Datos STPS e IMCO: escasez de 700,000 profesionales tech en Mexico para 2025 (AMITI 2022)",
        "Ficha de rutas de formacion: desde el bachillerato hasta el trabajo (IPN, UNAM, bootcamps, certificaciones gratuitas)",
        "Test de intereses vocacionales digital (RIASEC adaptado a carreras tech)",
        "Perfil de 5 profesionales tech mexicanos: su trayectoria desde el bachillerato hasta el trabajo actual"
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "S1", "duration": "50 min", "label": "Panorama de profesiones digitales y mercado laboral en Mexico"},
        {"phase": "S2", "duration": "50 min", "label": "Rutas de formacion, plataformas de aprendizaje y perfil vocacional propio"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "10 min",
          "description": "Motivar con datos sobre el mercado laboral tech en Mexico y desmitificar la idea de que solo los genios de las matematicas pueden trabajar en tecnologia.",
          "activity": "El docente dice: la AMITI (Asociacion Mexicana de la Industria de Tecnologias de la Informacion) estima que Mexico tendra un deficit de 700,000 profesionales tech para 2025. Eso significa que hay trabajo, pero faltan personas capacitadas. Pregunta: que profesiones digitales conocen? cuales creen que pagan mejor? cuales creen que estan mas al alcance de alguien que empieza?"
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "30 min",
          "description": "S1: panorama de profesiones y mercado laboral. S2: rutas de formacion y perfil vocacional.",
          "activity": "S1: El docente presenta el mapa de profesiones digitales y describe brevemente cada area: desarrollo web (frontend: lo que el usuario ve; backend: la logica del servidor; full stack: ambos); datos (analista de datos, cientifico de datos, ingeniero de datos); diseño (UX/UI: experiencia e interfaz de usuario); seguridad (pentester, analista de ciberseguridad); marketing digital (SEO, SEM, social media manager); inteligencia artificial (ML engineer, NLP specialist). Salarios promedio en Mexico (STPS/Glassdoor 2023): desarrollador web junior MX$15,000-25,000/mes; analista de datos MX$20,000-35,000/mes; especialista en ciberseguridad MX$25,000-50,000/mes. S2: Rutas de formacion: licenciatura en CS o sistemas en UNAM, IPN, ITESM (4-5 anios); ingenieria en software (IPN, UAM, universidades estatales); bootcamp intensivo (6-12 meses: BEDU, Platzi, Kodemia, Hack Reactor); certificaciones internacionales en espanol (Google: Fundamentos de Marketing Digital, Soporte de TI; AWS: Cloud Practitioner; Meta: Analista de Marketing). Plataformas gratuitas o de bajo costo: Google Career Certificates (coursera.org/google, beca disponible), freeCodeCamp (gratuito), Platzi (espanol, bajo costo), CS50 Harvard en espanol (YouTube, gratuito). Actividad: test RIASEC adaptado + exploracion de 2 profesiones en LinkedIn Mexico."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "10 min",
          "description": "Reflexion sobre el propio perfil vocacional y proximos pasos.",
          "activity": "Cada estudiante completa: las 2 profesiones digitales que mas me interesan son... porque... Una accion que puedo hacer en los proximos 30 dias para explorar esa area es... (ej: completar el modulo 1 de un curso gratuito en Coursera). El docente recoge las respuestas para monitorear el seguimiento."
        }
      ]
    },
    "theory": {
      "introduction": "El mercado laboral digital es uno de los sectores de mayor crecimiento en Mexico: la Asociacion Mexicana de Internet (AMIPCI) reporta que el e-commerce en Mexico crecio un 23% en 2022, y la AMITI estima un deficit de 700,000 profesionales en tecnologias de la informacion para 2025. Sin embargo, acceder a una carrera digital no requiere necesariamente de una licenciatura tradicional de 4-5 anios: los bootcamps, las certificaciones internacionales y las plataformas de aprendizaje en linea han democratizado el acceso a la formacion tech en espanol.",
      "sections": [
        {
          "subtitle": "Ecosistema de profesiones digitales",
          "content": "Desarrollo de software: frontend (HTML/CSS/JavaScript/React), backend (Python, Node.js, Java, bases de datos), full stack, mobile (Android/iOS). Ciencia e ingenieria de datos: analisis de datos (Excel avanzado, SQL, Tableau), ciencia de datos (Python, R, Machine Learning), ingenieria de datos (pipelines, Big Data). Diseño digital: UX (User Experience, investigacion con usuarios), UI (User Interface, diseño visual), diseño de producto. Ciberseguridad: ethical hacking, analisis de vulnerabilidades, forense digital, SOC analyst. Marketing digital y comunicacion: SEO/SEM, redes sociales, analitica web, email marketing, content strategy. Inteligencia Artificial: Machine Learning engineering, NLP (procesamiento de lenguaje natural), Computer Vision, chatbots."
        },
        {
          "subtitle": "Mercado laboral tech en Mexico",
          "content": "Segun la AMITI (Asociacion Mexicana de la Industria de Tecnologias de la Informacion), Mexico genera alrededor de 100,000 egresados en areas de TI por anio, pero la demanda del sector es significativamente mayor; el deficit proyectado es de 700,000 profesionales para 2025. Los principales empleadores de talento tech en Mexico son: empresas de software y servicios IT (Softtek, Wizeline, Nearsoft), bancos y fintech (BBVA Mexico, Kueski, Clip), e-commerce (Mercado Libre, Amazon, Rappi), gobierno digital (IMSS Digital, SAT, INEGI), startups tecnologicas (unicornios mexicanos: Kavak, Bitso, Clip). Salarios: en comparacion con EUA, los salarios tech mexicanos son entre 3 y 5 veces menores, lo que hace a Mexico muy atractivo para el nearshoring (empresas de EUA que contratan talento mexicano remotamente a menor costo)."
        },
        {
          "subtitle": "Rutas de formacion accesibles desde el bachillerato",
          "content": "Licenciatura universitaria (4-5 anios): Ingenieria en Ciencias de la Computacion (UNAM, IPN-ESCOM, UAM-Iztapalapa); Licenciatura en Sistemas Computacionales; Ingenieria en Telecomunicaciones. Las universidades publicas ofrecen estas carreras con costo muy bajo. Bootcamps (3-12 meses, intensivos): BEDU (bedu.org, certificados en alianza con universidades mexicanas); Platzi (platzi.com, en espanol, modelo de suscripcion mensual de bajo costo); Kodemia (coding bootcamp mexicano); Henry (bootcamp latinoamericano con modelo ISA: se paga cuando se consigue empleo). Certificaciones internacionales en espanol (1-6 meses): Google Career Certificates: Fundamentos de Soporte de TI, Analisis de Datos, Marketing Digital (disponibles en Coursera con beca para paises de ingresos medios). AWS Certified Cloud Practitioner. Meta Social Media Marketing. Microsoft Azure Fundamentals."
        },
        {
          "subtitle": "Plataformas de aprendizaje gratuitas o de bajo costo",
          "content": "freeCodeCamp (freecodecamp.org): plataforma gratuita de desarrollo web con proyectos certificados; tiene version en espanol. CS50x de Harvard (cs50.harvard.edu): el curso de introduccion a la programacion mas famoso del mundo; gratuito en edX; tiene subtitulos en espanol. Khan Academy (khanacademy.org): matematicas y programacion basica, completamente gratuito y en espanol. Coursera (coursera.org): mas de 5,000 cursos; muchos gratuitos en modo de auditoría; becas Google Career Certificates para Mexico. YouTube: canales de programacion en espanol: Fazt Code, HolaMundo, MiduDev, S4vitar (ciberseguridad). LinkedIn Learning: acceso gratuito de 30 dias; muchos cursos en espanol."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "Segun la AMITI, el deficit proyectado de profesionales en TI en Mexico para 2025 es de:",
          "options": ["700,000 profesionales", "100,000 profesionales", "50,000 profesionales", "5,000,000 profesionales"],
          "correct": "700,000 profesionales"
        },
        {
          "question": "La diferencia entre un desarrollador frontend y uno backend es:",
          "options": ["El frontend desarrolla lo que el usuario ve (interfaz); el backend la logica del servidor y la base de datos", "El frontend trabaja en empresas grandes; el backend en startups", "El frontend usa Python; el backend usa HTML", "No hay diferencia, son sinonimos en el mercado laboral"],
          "correct": "El frontend desarrolla lo que el usuario ve (interfaz); el backend la logica del servidor y la base de datos"
        },
        {
          "question": "Los Google Career Certificates son relevantes para estudiantes de bachillerato porque:",
          "options": ["Son certificaciones internacionales en espanol de bajo costo o gratuitas con beca, accesibles sin licenciatura previa", "Son exclusivos para graduados universitarios con posgrado", "Solo se pueden obtener despues de trabajar 5 anios en tecnologia", "Son necesarios para ingresar a cualquier universidad en Mexico"],
          "correct": "Son certificaciones internacionales en espanol de bajo costo o gratuitas con beca, accesibles sin licenciatura previa"
        },
        {
          "question": "Que es el nearshoring en el contexto del mercado tech mexicano?",
          "options": ["Empresas de EUA que contratan talento tecnico mexicano remotamente aprovechando la diferencia de costos y la proximidad geografica", "La migracion de trabajadores tech mexicanos hacia Silicon Valley", "La exportacion de software mexicano a mercados europeos", "El proceso de subcontratacion de servidores en la nube para empresas mexicanas"],
          "correct": "Empresas de EUA que contratan talento tecnico mexicano remotamente aprovechando la diferencia de costos y la proximidad geografica"
        }
      ],
      "rubric": "Nivel 4: Describe con precision el panorama de profesiones digitales, conoce el mercado laboral tech en Mexico con datos (AMITI, STPS), identifica rutas de formacion concretas desde el bachillerato e identifica dos areas de interes personal con un plan de accion de 30 dias especifico y viable; Nivel 3: Identifica al menos 6 profesiones, conoce las rutas principales y expresa intereses personales concretos; Nivel 2: Conoce algunas profesiones y rutas pero no puede conectarlas con un plan de accion personal; Nivel 1: No puede distinguir las principales areas de profesiones digitales o no conoce ninguna ruta de formacion accesible."
    },
    "teacher_tips": [
      "Invitar a un egresado del plantel o de la comunidad que trabaje en tecnologia para dar un testimonio de 15 minutos: nada motiva mas que ver a alguien cercano en una carrera digital exitosa.",
      "Hacer el test RIASEC digital al inicio de la S2: hay versiones gratuitas en linea (incluyendo una de la UNAM) que clasifican los intereses en Realista, Investigador, Artistico, Social, Emprendedor y Convencional y los cruzan con carreras.",
      "Enfatizar que las matematicas avanzadas NO son requisito indispensable para todas las carreras digitales: el diseño UX, el marketing digital, la comunicacion y la gestion de proyectos requieren mas habilidades blandas que matematicas avanzadas.",
      "Para el modulo de plataformas gratuitas, llevar al salon los dispositivos y dejar que los estudiantes se registren en freeCodeCamp o Khan Academy en tiempo real: la primera interaccion en vivo con la plataforma rompe la inercia y aumenta significativamente la probabilidad de que la usen fuera de clase."
    ]
  },

  "CD-III-P04": {
    "code": "CD-III-P04",
    "title": "Disena un proyecto de participacion comunitaria mediado por tecnologias digitales",
    "level": "Cultura Digital III",
    "duration": "~4h (3 sesiones de 50 min)",
    "difficulty": "Intermedio",
    "category": "Proyecto integrador digital-comunitario",
    "metadata": {
      "objective": "Disenar e implementar un proyecto de participacion ciudadana o comunitaria que use herramientas digitales para resolver un problema local, articulando las competencias digitales del semestre (produccion de contenido, analisis critico, busqueda de informacion) con la agencia ciudadana.",
      "competencies": [
        "Identifica un problema local concreto y formula una estrategia de intervencion digital (mapa de actores, objetivo, acciones, recursos)",
        "Usa datos abiertos del gobierno de Mexico (datos.gob.mx, INEGI API, INAI) para fundamentar el diagnostico del problema",
        "Produce al menos un contenido digital de calidad como parte del proyecto (infografia, video, encuesta digital, newsletter)",
        "Conoce los mecanismos de participacion ciudadana digital en Mexico: consultas publicas, plataformas de peticiones (Change.org), e-gobierno (tramites.gob.mx), solicitudes INAI",
        "Presenta el proyecto con argumentacion solida (herramientas de logica de PFH-III) ante la comunidad escolar"
      ],
      "materials": [
        "Portal datos.gob.mx: catalogo de datos abiertos del gobierno federal de Mexico",
        "Plataforma INAI: como hacer una solicitud de informacion publica (solicitud SAIMEX en 5 pasos)",
        "Guia de diseno de proyecto comunitario digital: problema + actores + objetivo + acciones + indicadores",
        "Herramientas de encuesta: Google Forms, Mentimeter (feedback en tiempo real)",
        "Ejemplos de iniciativas ciudadanas digitales en Mexico: Data Civica, Candidatos.mx, MX Congreso"
      ]
    },
    "strategy": {
      "timeline": [
        {"phase": "S1", "duration": "50 min", "label": "Identificacion del problema y uso de datos abiertos para el diagnostico"},
        {"phase": "S2", "duration": "50 min", "label": "Diseno del proyecto: actores, objetivo, acciones y contenido digital"},
        {"phase": "S3", "duration": "50 min", "label": "Presentacion, retroalimentacion y evaluacion integrada del semestre"}
      ],
      "phases": [
        {
          "title": "FASE I: APERTURA",
          "duration": "10 min",
          "description": "Motivar con ejemplos de participacion ciudadana digital efectiva en Mexico.",
          "activity": "El docente presenta tres casos: (1) Candidatos.mx: plataforma que compila promesas de campana y votaciones de diputados para que los ciudadanos den seguimiento. (2) Data Civica: mapa de feminicidios en Mexico basado en datos abiertos del SESNSP. (3) Un ciudadano que hizo una solicitud de informacion via INAI y descubrio irregularidades en el presupuesto municipal. Pregunta: podrian hacer algo parecido en su plantel o comunidad? Introduccion al proyecto final del semestre."
        },
        {
          "title": "FASE II: DESARROLLO",
          "duration": "30 min",
          "description": "S1: diagnostico con datos abiertos. S2: diseno del proyecto. S3: presentaciones.",
          "activity": "S1: Exploracion del portal datos.gob.mx: que conjuntos de datos estan disponibles sobre su municipio? Los equipos buscan datos relevantes para su problema (seguridad, salud, educacion, agua, transporte). Tambien: como hacer una solicitud de informacion al gobierno municipal via INAI (el proceso toma maximo 20 dias habiles y es gratuito). S2: Cada equipo completa la guia de diseno de proyecto: (1) Problema identificado y cuantificado con datos; (2) Actores involucrados (quien sufre el problema, quien podria solucionarlo, quien se opone); (3) Objetivo SMART del proyecto (Especifico, Medible, Alcanzable, Relevante, Temporal); (4) Acciones concretas (encuesta digital, infografia de denuncia, video de concientizacion, carta digital a autoridades); (5) Indicadores de exito. Cada equipo produce al menos un contenido digital del proyecto. S3: Presentacion de proyectos en formato feria: cada equipo monta una estacion y los visitantes (otros estudiantes, docente, eventualmente directivos) reciben el pitch de 3 minutos."
        },
        {
          "title": "FASE III: CIERRE",
          "duration": "10 min",
          "description": "Evaluacion integrada del semestre y reflexion sobre la ciudadania digital.",
          "activity": "Autoevaluacion final del semestre: que competencias digitales desarrollaste? en que mejoraraste? que aprendiste sobre la participacion ciudadana digital en Mexico? El docente cierra con la idea central: las tecnologias digitales son herramientas neutras; lo que las vuelve democratizadoras o concentradoras de poder es quien las usa, para que y con que valores."
        }
      ]
    },
    "theory": {
      "introduction": "La participacion ciudadana digital usa las herramientas y plataformas digitales para que los ciudadanos se involucren en los asuntos publicos: desde informarse y opinar hasta fiscalizar al gobierno, organizarse colectivamente y proponer soluciones. En Mexico, el marco legal incluye la Ley Federal de Transparencia y Acceso a la Informacion Publica (que permite solicitar cualquier documento publico al gobierno via INAI), el portal datos.gob.mx (que publica conjuntos de datos abiertos del gobierno federal) y el sistema de tramites electronicos del gobierno (tramites.gob.mx). La ciudad de Mexico y algunos municipios tienen plataformas de presupuesto participativo digital donde los ciudadanos votan proyectos.",
      "sections": [
        {
          "subtitle": "Datos abiertos en Mexico: datos.gob.mx",
          "content": "El portal datos.gob.mx es el catalogo nacional de datos abiertos del gobierno federal de Mexico. Publica conjuntos de datos en formato abierto (CSV, JSON, XLS) sobre: seguridad publica (SESNSP: tasas de delitos por municipio), salud (IMSS, SSA: estadisticas de hospitales y enfermedades), educacion (SEP: matricula, infraestructura escolar por municipio), economia (INEGI: PIB estatal, empleo formal por sector), medio ambiente (SEMARNAT: calidad del aire, reservas naturales), gobierno (SHCP: presupuesto publico, ejercicio del gasto). Estos datos son de acceso libre y pueden usarse para crear visualizaciones, diagnosticar problemas y fundamentar propuestas ciudadanas."
        },
        {
          "subtitle": "Solicitudes de informacion publica: el INAI",
          "content": "El Instituto Nacional de Transparencia, Acceso a la Informacion y Proteccion de Datos Personales (INAI) garantiza el derecho de acceso a la informacion de cualquier persona (mexicana o extranjera, sin necesidad de justificacion). Como solicitar: entrar a infomex.org.mx o al portal del sujeto obligado (municipio, dependencia federal); describir la informacion solicitada con precision; el sujeto tiene 20 dias habiles para responder; si no responde o responde de forma insatisfactoria, se puede interponer recurso de revision ante el INAI. Este derecho es una herramienta poderosa de participacion ciudadana: periodistas, OSC y ciudadanos lo usan para investigar irregularidades, monitorear el gasto publico y exigir rendicion de cuentas."
        },
        {
          "subtitle": "Diseno de proyectos ciudadanos digitales",
          "content": "Un proyecto ciudadano digital efectivo tiene: Diagnostico: identificar y cuantificar el problema con datos (locales o nacionales). Actores: mapa de quien esta afectado, quien tiene poder de decision, quien son los aliados y los opositores. Objetivo SMART: por ejemplo, lograr que el municipio de X instale 3 bebederos de agua en escuelas publicas antes del 30 de junio (especifico, medible, alcanzable, relevante, temporal). Acciones digitales: encuesta de percepcion ciudadana (Google Forms), infografia de denuncia (Canva), video testimonial (CapCut), carta abierta al alcalde (publicada en redes), solicitud INAI. Indicadores: cuantas firmas, cuantos visualizaciones, cuantas respuestas de autoridad, cuantos medios cubrieron. Ejemplos mexicanos: Colectivo Educacion para la Paz (campanas en redes contra el bullying), Pide mas agua (campana para bebederos en escuelas del DF 2018)."
        },
        {
          "subtitle": "Iniciativas ciudadanas digitales en Mexico: referentes",
          "content": "Data Civica (datacivica.org): OSC que usa datos abiertos y periodismo de datos para documentar violaciones a derechos humanos, feminicidios, violencia electoral y transparencia presupuestal en Mexico. Sus herramientas son de acceso publico. Candidatos.mx: durante elecciones, esta plataforma compila y hace seguimiento de las promesas de campana de los candidatos; usa datos abiertos del INE. MX Congreso: plataforma de transparencia legislativa que registra como vota cada diputado y senador en el Congreso de la Union. Verificado MX: red de verificacion de noticias activada durante eventos de alta desinformacion (elecciones, desastres). Estas iniciativas muestran que ciudadanos con competencias digitales pueden producir herramientas de transparencia que el gobierno no provee por si mismo."
        }
      ]
    },
    "evaluation": {
      "exam_questions": [
        {
          "question": "El portal datos.gob.mx en Mexico permite:",
          "options": ["Acceder a conjuntos de datos abiertos del gobierno federal en formato abierto para uso ciudadano", "Realizar tramites fiscales y pagar impuestos en linea", "Solicitar informacion confidencial sobre ciudadanos", "Publicar datos privados de empresas mexicanas"],
          "correct": "Acceder a conjuntos de datos abiertos del gobierno federal en formato abierto para uso ciudadano"
        },
        {
          "question": "Una solicitud de informacion publica ante el INAI tiene como plazo maximo de respuesta:",
          "options": ["20 dias habiles", "1 anio", "5 dias", "Solo puede solicitarla un periodista con credencial"],
          "correct": "20 dias habiles"
        },
        {
          "question": "Un objetivo SMART en el diseno de un proyecto ciudadano digital debe ser:",
          "options": ["Especifico, Medible, Alcanzable, Relevante y Temporal", "Simple, Motivador, Atractivo, Radical y Transformador", "Estrategico, Masivo, Atrevido, Rapido y Tecnologico", "No tiene una definicion estandar; es subjetivo segun el equipo"],
          "correct": "Especifico, Medible, Alcanzable, Relevante y Temporal"
        },
        {
          "question": "Data Civica en Mexico es relevante para la ciudadania digital porque:",
          "options": ["Usa datos abiertos y periodismo de datos para documentar violaciones a derechos humanos, feminicidios y transparencia presupuestal", "Es el portal oficial del gobierno federal para peticiones ciudadanas", "Es una plataforma de e-commerce para empresas mexicanas", "Es el sistema de votacion electronica del INE para elecciones federales"],
          "correct": "Usa datos abiertos y periodismo de datos para documentar violaciones a derechos humanos, feminicidios y transparencia presupuestal"
        }
      ],
      "rubric": "Nivel 4: El proyecto identifica un problema real con datos abiertos cuantificados, tiene un objetivo SMART, propone acciones digitales concretas con al menos un contenido producido, y la presentacion integra argumentacion de PFH-III y produccion digital de CD-III P02; Nivel 3: El proyecto tiene problema identificado, objetivo claro y al menos una accion digital, aunque la cuantificacion del problema puede ser menos precisa; Nivel 2: El proyecto identifica el problema pero el objetivo no es SMART o no hay contenido digital producido; Nivel 1: El proyecto no tiene diagnostico con datos o no propone ninguna accion concreta."
    },
    "teacher_tips": [
      "Coordinar con los docentes de CNEYT-III y CS-III: si los estudiantes ya identificaron un problema ambiental o social en esas materias, este proyecto puede ser la version digital de ese mismo proyecto; la transversalidad reduce la carga y aumenta la profundidad.",
      "La solicitud INAI puede hacerse como actividad real de clase: identificar algo que no saben sobre su municipio (cuantos maestros tiene la escuela?, cuanto cuesta la remodelacion del parque?), redactar la solicitud en clase y enviarla. La respuesta llega en 20 dias habiles -- probablemente durante el siguiente semestre, lo que da seguimiento real.",
      "El formato de feria (en lugar de presentacion frontal) es mas dinamico, permite que todos presenten simultaneamente y genera mas interaccion entre equipos; preparar el espacio con anticipacion.",
      "Conectar con PFH-III P04 (praxis filosofica): la participacion ciudadana digital es exactamente la praxis que Freire y Dussel propugnan -- la teoria (diagnostico con datos) al servicio de la transformacion (accion comunitaria). Nombrar esta conexion explicitamente cierra el circulo del semestre."
    ]
  }
}

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Written {len(data)} progressions to {OUT}")

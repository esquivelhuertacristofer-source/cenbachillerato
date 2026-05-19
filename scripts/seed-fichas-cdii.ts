/**
 * Seed de fichas de biblioteca para CD-II (Cultura Digital II).
 * 20 fichas temáticas alineadas al MCCEMS 2025, Semestre 2.
 *
 * Meta educativa: Utilice herramientas digitales de manera colaborativa,
 * crítica y ética para buscar, evaluar, crear y compartir información
 * en entornos digitales seguros.
 *
 * Uso: npx tsx scripts/seed-fichas-cdii.ts
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

const FICHAS_CDII = [
  // ── 1 ── Herramientas digitales ──────────────────────────────────────────
  {
    slug: "cd-ii-buscadores-avanzados",
    titulo: "Más allá de Google: buscadores avanzados y especializados",
    categoria: "Herramientas digitales",
    conceptos_clave: ["operadores de búsqueda", "buscador académico", "metabuscador", "búsqueda avanzada"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Google es el buscador más usado del mundo, pero su dominio puede hacernos olvidar que existen decenas de herramientas de búsqueda especializadas que ofrecen resultados de mayor calidad para fines académicos, científicos y periodísticos. Conocer estas opciones y saber usar los operadores avanzados de cualquier buscador multiplica la eficacia de tu investigación.",
        },
        {
          tipo: "subtitulo",
          contenido: "Operadores avanzados en Google",
        },
        {
          tipo: "lista",
          items: [
            "\"comillas\": busca la frase exacta. Ejemplo: \"cambio climático en México 2024\".",
            "site: limita la búsqueda a un dominio. Ejemplo: site:gob.mx estadísticas educación.",
            "filetype: filtra por tipo de archivo. Ejemplo: filetype:pdf informe INEGI pobreza.",
            "- (guion): excluye un término. Ejemplo: receta pozole -picante.",
            "OR: busca uno u otro término. Ejemplo: UNAM OR IPN convocatoria.",
            "related: encuentra sitios similares. Ejemplo: related:conacyt.mx.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Buscadores académicos y especializados",
        },
        {
          tipo: "parrafo",
          contenido:
            "Google Scholar (scholar.google.com) indexa artículos científicos, tesis y libros académicos de todo el mundo. Es el punto de partida para cualquier investigación formal. BASE (Bielefeld Academic Search Engine) reúne más de 300 millones de documentos académicos de acceso abierto. Semantic Scholar usa inteligencia artificial para encontrar papers relevantes y visualizar relaciones entre investigaciones. Para datos sobre México específicamente, el Repositorio Nacional de CONACYT (repositorionacionalcti.mx) ofrece acceso a tesis y publicaciones financiadas con recursos públicos mexicanos.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Wikipedia no es una fuente académica citable, pero sí es un excelente punto de partida: revisa las referencias al pie de cada artículo. Esos sí pueden ser fuentes primarias válidas. El artículo de Wikipedia te orienta; las fuentes que cita te informan.",
        },
        {
          tipo: "subtitulo",
          contenido: "Buscadores alternativos a Google",
        },
        {
          tipo: "lista",
          items: [
            "DuckDuckGo: no rastrea tu historial ni personaliza resultados, más privacidad.",
            "Brave Search: índice propio, sin filtros de burbuja algorítmica.",
            "Wolfram Alpha: responde preguntas matemáticas, científicas y factuales con cálculos precisos.",
            "Startpage: usa resultados de Google pero sin el rastreo.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Google recibe más de 8,500 millones de búsquedas por día. Sin embargo, el 95% de los usuarios nunca pasa de la primera página de resultados, y el 75% hace clic solo en los tres primeros enlaces. Aprender operadores avanzados te pone en el 5% que realmente sabe buscar.",
        },
      ],
    },
  },

  // ── 2 ── Pensamiento crítico digital ─────────────────────────────────────
  {
    slug: "cd-ii-evaluar-fuentes-digitales",
    titulo: "Evaluar la confiabilidad de fuentes digitales",
    categoria: "Pensamiento crítico digital",
    conceptos_clave: ["confiabilidad", "CRAAP test", "autoridad epistémica", "verificación cruzada"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "En la era de la sobrecarga informativa, saber distinguir una fuente confiable de una que no lo es se ha convertido en una competencia ciudadana fundamental. No toda información que aparece en internet —ni siquiera la que comparte tu familia o tus amigos— está verificada o es precisa. Evaluar fuentes es un proceso sistemático que puede aprenderse.",
        },
        {
          tipo: "subtitulo",
          contenido: "El método SIFT (cuatro movimientos para verificar)",
        },
        {
          tipo: "lista",
          items: [
            "Stop (Para): antes de leer o compartir, detente y pregúntate si conoces esta fuente.",
            "Investigate the source (Investiga la fuente): busca quién está detrás del sitio o autor antes de leer el contenido.",
            "Find better coverage (Busca mejor cobertura): si la noticia es importante, busca cómo la cubre una fuente reconocida.",
            "Trace claims (Rastrea las afirmaciones): sigue los links y citas hasta llegar a la fuente original.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Criterios clave para evaluar una fuente",
        },
        {
          tipo: "parrafo",
          contenido:
            "Autoría: ¿quién escribió esto? ¿Tiene formación en el tema? ¿Aparece su nombre e institución? Publicación: ¿es una revista arbitrada por pares, un medio de comunicación con trayectoria, o un blog sin respaldo? Actualidad: en ciencia y política la fecha importa; un estudio de 2010 puede haber sido superado. Propósito: ¿informa, opina, vende o busca adoctrinar? Respaldo: ¿cita datos y estudios verificables o solo hace afirmaciones? Contraste: ¿otras fuentes independientes corroboran la información?",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Los sitios de fact-checking te ayudan a verificar información: Animal Político Verifica (animalpolitico.com/verifica), AFP Factual (factual.afp.com) y Verificado (verificado.mx) son los más reconocidos en México. Úsalos antes de compartir una noticia que te haya sorprendido o indignado.",
        },
        {
          tipo: "subtitulo",
          contenido: "Señales de alarma en una fuente",
        },
        {
          tipo: "lista",
          items: [
            "Titulares exagerados o en mayúsculas que apelan al miedo o la indignación.",
            "Ausencia de autor o autor con seudónimo sin trayectoria verificable.",
            "Dominio web que imita a medios reales (ejemplo: noticias-mexicanas.net en lugar de noticiasmexicanas.com.mx).",
            "Sin fecha de publicación o con fechas inconsistentes.",
            "Falta de referencias o links rotos que supuestamente llevan a la fuente original.",
          ],
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Embudo con cinco filtros etiquetados: autor, publicación, fecha, propósito y respaldo, que depura información no confiable antes de llegar al lector",
          caption: "Proceso de filtrado para evaluar la confiabilidad de una fuente digital.",
        },
      ],
    },
  },

  // ── 3 ── Ética digital ────────────────────────────────────────────────────
  {
    slug: "cd-ii-creative-commons-derechos",
    titulo: "Derechos de autor y licencias Creative Commons",
    categoria: "Ética digital",
    conceptos_clave: ["derechos de autor", "Creative Commons", "licencia CC", "dominio público"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Cada vez que creas algo original —un texto, una fotografía, un video, una canción— ese contenido queda protegido automáticamente por los derechos de autor desde el momento de su creación, sin necesidad de registrarlo ni poner ningún símbolo. En México, la Ley Federal del Derecho de Autor protege la obra durante la vida del autor más 100 años adicionales. Entender este marco legal es esencial para crear y compartir contenido de manera ética y legal.",
        },
        {
          tipo: "subtitulo",
          contenido: "¿Qué son las licencias Creative Commons?",
        },
        {
          tipo: "parrafo",
          contenido:
            "Creative Commons (CC) es un sistema de licencias que permite a los creadores ceder voluntariamente algunos derechos sobre sus obras, manteniendo otros. Fue creado en 2001 como alternativa flexible al copyright tradicional y hoy protege más de 2,000 millones de obras en internet. Las licencias CC combinan cuatro condiciones base: BY (dar crédito al autor), SA (compartir igual), NC (no comercial) y ND (sin obras derivadas).",
        },
        {
          tipo: "lista",
          items: [
            "CC BY: la más abierta; solo exige dar crédito. Usada por muchas revistas científicas de acceso abierto.",
            "CC BY-SA: dar crédito y compartir con la misma licencia. Base de Wikipedia.",
            "CC BY-NC: dar crédito, solo uso no comercial.",
            "CC BY-NC-SA: crédito, no comercial y misma licencia.",
            "CC BY-ND: crédito pero no se permiten obras derivadas.",
            "CC BY-NC-ND: la más restrictiva; crédito, no comercial, sin modificar.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Para encontrar imágenes de uso libre, ve a search.creativecommons.org: buscará en Flickr, Wikimedia, Openverse y otras fuentes que ya filtraron por licencia. También puedes usar Unsplash y Pexels para fotografías libres de derechos, o Google Imágenes con el filtro 'Licencias de Creative Commons'.",
        },
        {
          tipo: "subtitulo",
          contenido: "Dominio público y cultura libre",
        },
        {
          tipo: "parrafo",
          contenido:
            "Una obra pasa al dominio público cuando expira su período de protección y puede usarse libremente. Las obras de autores mexicanos fallecidos hace más de 100 años —como José Guadalupe Posada o Manuel Acuña— están en dominio público. El movimiento copyleft va más allá y promueve activamente que las obras puedan usarse, modificarse y distribuirse sin restricciones, como hace el software de código abierto.",
        },
        {
          tipo: "cita",
          contenido:
            "La cultura es algo que se comparte. Si no se comparte, no es cultura.",
          fuente: "Lawrence Lessig, fundador de Creative Commons",
        },
      ],
    },
  },

  // ── 4 ── Ética digital ────────────────────────────────────────────────────
  {
    slug: "cd-ii-brecha-digital-mexico",
    titulo: "La brecha digital en México: datos y desafíos",
    categoria: "Ética digital",
    conceptos_clave: ["brecha digital", "acceso a internet", "INEGI", "desigualdad tecnológica"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La brecha digital es la desigualdad en el acceso, uso y aprovechamiento de las tecnologías de la información entre personas, comunidades o regiones. En México esta brecha tiene múltiples dimensiones y refleja desigualdades estructurales más amplias: económicas, geográficas, de género y de edad. Comprender su magnitud es el primer paso para trabajar por una sociedad digital más equitativa.",
        },
        {
          tipo: "subtitulo",
          contenido: "El panorama según el INEGI",
        },
        {
          tipo: "parrafo",
          contenido:
            "De acuerdo con la Encuesta Nacional sobre Disponibilidad y Uso de Tecnologías de la Información en los Hogares (ENDUTIH) del INEGI, en 2023 el 78.6% de la población mexicana de seis años o más era usuaria de internet, lo que representa aproximadamente 96.8 millones de personas. Sin embargo, este promedio nacional oculta profundas desigualdades: en zonas urbanas el acceso llega al 86%, mientras que en zonas rurales apenas alcanza el 50%. Estados como Chiapas, Oaxaca y Guerrero presentan las tasas más bajas de conectividad del país.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La brecha digital de género también es significativa: en México existe una diferencia de aproximadamente 7 puntos porcentuales entre hombres y mujeres en el acceso a internet, brecha que se amplía en comunidades rurales e indígenas. Esto limita las oportunidades educativas, laborales y de participación ciudadana de millones de mujeres.",
        },
        {
          tipo: "subtitulo",
          contenido: "Tres dimensiones de la brecha digital",
        },
        {
          tipo: "lista",
          items: [
            "Brecha de acceso: no tener dispositivos ni conexión a internet (la más visible).",
            "Brecha de uso: tener acceso pero usarlo solo para entretenimiento, sin aprovechar su potencial educativo o productivo.",
            "Brecha de calidad: conexiones lentas o intermitentes que impiden participar plenamente en la educación o el trabajo digitales.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Iniciativas para cerrar la brecha en México",
        },
        {
          tipo: "parrafo",
          contenido:
            "El gobierno federal ha impulsado programas como Internet para Todos, que busca llevar conectividad a comunidades sin acceso. La red troncal de la CFE Telecomunicaciones e Internet para Todos extiende la fibra óptica a municipios alejados. Organizaciones de la sociedad civil como Fundar y Redes por la Diversidad, Equidad y Sustentabilidad trabajan en alfabetización digital comunitaria. Sin embargo, los especialistas señalan que la infraestructura sola no es suficiente: hace falta también formación, dispositivos accesibles y contenidos en lenguas indígenas.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "México tiene 68 lenguas nacionales reconocidas además del español. La mayor parte del contenido digital de calidad está en español o inglés, lo que representa una barrera adicional para los hablantes de lenguas indígenas. Proyectos como Wikidata en náhuatl o los esfuerzos del INALI para digitalizar lenguas originarias buscan reducir esta brecha cultural.",
        },
      ],
    },
  },

  // ── 5 ── Herramientas digitales ──────────────────────────────────────────
  {
    slug: "cd-ii-documentos-colaborativos",
    titulo: "Documentos colaborativos en la nube: trabajar juntos en tiempo real",
    categoria: "Herramientas digitales",
    conceptos_clave: ["Google Docs", "colaboración en tiempo real", "control de versiones", "comentarios en línea"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Los documentos colaborativos en la nube han transformado la forma de trabajar en equipo. Herramientas como Google Docs, Microsoft Word Online o Notion permiten que varias personas editen el mismo documento simultáneamente, vean los cambios en tiempo real y se comuniquen a través de comentarios sin salir del documento. Esta capacidad es hoy una competencia laboral y académica básica.",
        },
        {
          tipo: "subtitulo",
          contenido: "Google Workspace: el estándar educativo",
        },
        {
          tipo: "parrafo",
          contenido:
            "Google Docs, Sheets y Slides son gratuitos con cualquier cuenta de Google y funcionan en el navegador sin necesidad de instalar nada. Permiten edición simultánea de hasta 100 personas, historial de versiones ilimitado (puedes restaurar cualquier versión anterior del documento), comentarios y sugerencias, y conexión directa con Google Drive, Forms y Meet. La mayoría de las instituciones educativas en México han adoptado Google Workspace for Education.",
        },
        {
          tipo: "lista",
          items: [
            "Historial de versiones: Ve a Archivo > Historial de versiones > Ver historial. Puedes restaurar cualquier estado anterior del documento.",
            "Modo sugerencias: en lugar de editar directamente, propones cambios que el propietario puede aceptar o rechazar.",
            "Comentarios: selecciona texto y presiona Ctrl+Alt+M para añadir un comentario sin modificar el contenido.",
            "Compartir con permisos: decide si cada persona puede ver, comentar o editar.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Al trabajar en documentos colaborativos, establece desde el inicio quién tiene permiso de editar y quién solo de comentar. Dar acceso de edición a todos puede generar conflictos y pérdida de información. Para trabajos escolares, usa el modo sugerencias para que cada aportación quede registrada con el nombre de quien la hizo.",
        },
        {
          tipo: "subtitulo",
          contenido: "Otras herramientas de colaboración documental",
        },
        {
          tipo: "lista",
          items: [
            "Notion: combina documentos, bases de datos y wikis en un solo espacio; ideal para documentación de proyectos.",
            "Coda: similar a Notion, con capacidades de automatización más avanzadas.",
            "HackMD: documentos en formato Markdown, muy usado en proyectos de programación.",
            "Overleaf: editor LaTeX colaborativo, estándar para publicaciones científicas.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El historial de versiones de Google Docs guarda automáticamente cada cambio. Si eliminas accidentalmente una sección importante, puedes recuperarla. Esta función también permite a los profesores ver quién contribuyó qué parte de un trabajo grupal, lo que promueve la responsabilidad individual dentro del equipo.",
        },
      ],
    },
  },

  // ── 6 ── Herramientas digitales ──────────────────────────────────────────
  {
    slug: "cd-ii-gestion-proyectos-digitales",
    titulo: "Gestión de proyectos en equipo con herramientas digitales",
    categoria: "Herramientas digitales",
    conceptos_clave: ["kanban", "Trello", "gestión ágil", "tablero de tareas"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Gestionar un proyecto en equipo implica coordinar personas, tareas, plazos y recursos. Sin una estructura clara, los proyectos se retrasan, las tareas se duplican o se olvidan, y la comunicación falla. Las herramientas digitales de gestión de proyectos ofrecen un espacio visual compartido donde todo el equipo puede ver el estado de cada tarea en tiempo real.",
        },
        {
          tipo: "subtitulo",
          contenido: "El método Kanban: visualizar el trabajo",
        },
        {
          tipo: "parrafo",
          contenido:
            "Kanban es una metodología de gestión de trabajo que organiza las tareas en columnas que representan su estado: Por hacer, En progreso y Completado. Originado en Toyota en los años 50 para la producción industrial, hoy es usado por equipos de todo tipo. Trello es la herramienta kanban digital más popular: gratuita, visual e intuitiva. Cada tarea es una 'tarjeta' que se mueve entre columnas conforme avanza.",
        },
        {
          tipo: "lista",
          items: [
            "Crea un tablero en Trello por proyecto: uno para cada materia o trabajo.",
            "Define columnas claras: Backlog (ideas), Por hacer, En progreso, Revisión, Completado.",
            "Cada tarjeta debe tener: descripción clara, responsable asignado y fecha límite.",
            "Usa etiquetas de color para categorizar por tipo de tarea o prioridad.",
            "Revisa el tablero en cada reunión de equipo para mantenerlo actualizado.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El trabajo en equipo digital requiere acuerdos explícitos que en presencia se dan por sentados: ¿cada cuánto revisamos el tablero? ¿Cuál es el plazo real para marcar una tarea como completada? ¿Quién resuelve los bloqueos? Documenta estos acuerdos en el mismo espacio de trabajo.",
        },
        {
          tipo: "subtitulo",
          contenido: "Herramientas para distintas necesidades",
        },
        {
          tipo: "lista",
          items: [
            "Trello: kanban visual simple, ideal para equipos pequeños y proyectos escolares.",
            "Asana: más robusto, permite proyectos con dependencias entre tareas.",
            "Notion: combina gestión de proyectos con documentación en el mismo espacio.",
            "GitHub Projects: integrado con el código, ideal para proyectos de desarrollo de software.",
            "Jira: estándar en empresas tecnológicas, más complejo, para equipos grandes.",
          ],
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Tablero kanban con cuatro columnas: Por hacer, En progreso, Revisión y Completado, con tarjetas de colores representando tareas en distintos estados",
          caption: "Un tablero kanban digital organiza el flujo de trabajo del equipo.",
        },
      ],
    },
  },

  // ── 7 ── Herramientas digitales ──────────────────────────────────────────
  {
    slug: "cd-ii-comunicacion-asincrona-sincrona",
    titulo: "Comunicación asíncrona y síncrona en entornos digitales",
    categoria: "Herramientas digitales",
    conceptos_clave: ["comunicación asíncrona", "videoconferencia", "Slack", "netiqueta digital"],
    tiempo_lectura_minutos: 5,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "En el trabajo y el estudio digital, la comunicación se divide en dos grandes modalidades: síncrona (en tiempo real, todos presentes al mismo tiempo) y asíncrona (en diferido, cada persona responde cuando puede). Saber cuándo usar cada una y cómo comunicarse efectivamente en ambos formatos es una habilidad profesional imprescindible del siglo XXI.",
        },
        {
          tipo: "subtitulo",
          contenido: "Comunicación síncrona: todos al mismo tiempo",
        },
        {
          tipo: "lista",
          items: [
            "Videoconferencia (Google Meet, Zoom, Teams): reúne al equipo en tiempo real. Ideal para decisiones importantes, lluvias de ideas y presentaciones.",
            "Chat en vivo (WhatsApp, Telegram, Discord): conversación instantánea. Útil para dudas rápidas.",
            "Llamadas telefónicas: efectivas para asuntos urgentes que requieren tono de voz.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Comunicación asíncrona: cada quien a su ritmo",
        },
        {
          tipo: "lista",
          items: [
            "Correo electrónico: para comunicaciones formales, documentadas y no urgentes.",
            "Comentarios en documentos: feedback específico sobre secciones de un texto.",
            "Foros y tablones: discusiones estructuradas donde se puede responder con reflexión.",
            "Videos pregrabados (Loom): explicaciones visuales que se comparten para ver cuando sea posible.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "No todo requiere una reunión en Zoom. Antes de convocar una videoconferencia, pregúntate: ¿puede resolverse esto con un mensaje bien redactado? Las reuniones innecesarias son uno de los principales destructores de productividad en equipos digitales. Reserva la comunicación síncrona para lo que realmente la requiere.",
        },
        {
          tipo: "parrafo",
          contenido:
            "La netiqueta en comunicación digital incluye: responder correos en un plazo razonable (máximo 24-48 horas en contextos laborales); indicar disponibilidad horaria; escribir mensajes completos que no requieran diez intercambios para resolverse; y respetar los límites de tiempo libre de los compañeros sin esperar respuesta inmediata fuera del horario acordado.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Estudios de Microsoft Research muestran que el trabajador promedio interrumpe lo que está haciendo cada 40 segundos cuando tiene notificaciones activas, y tarda en promedio 23 minutos en recuperar el nivel de concentración anterior. Gestionar tus notificaciones es gestionar tu atención.",
        },
      ],
    },
  },

  // ── 8 ── Ciudadanía digital ───────────────────────────────────────────────
  {
    slug: "cd-ii-desinformacion-posverdad",
    titulo: "Desinformación y posverdad en la era digital",
    categoria: "Ciudadanía digital",
    conceptos_clave: ["desinformación", "posverdad", "sesgo de confirmación", "infodemia"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Vivimos en la era de la posverdad: un contexto en que los hechos objetivos tienen menos influencia en la opinión pública que las apelaciones emocionales y las creencias personales. El término fue elegido Palabra del Año por el diccionario Oxford en 2016, aunque el fenómeno que describe es tan antiguo como la política. Lo que ha cambiado es la velocidad y escala con que la desinformación puede propagarse gracias a las redes sociales.",
        },
        {
          tipo: "subtitulo",
          contenido: "Tipos de desinformación",
        },
        {
          tipo: "lista",
          items: [
            "Misinformation (desinformación): información falsa compartida sin intención de engañar.",
            "Disinformation (información maliciosa): información falsa creada deliberadamente para engañar.",
            "Malinformation (información dañina): información verdadera usada para causar daño (como filtrar datos privados de alguien).",
            "Fake news: noticias falsas construidas para imitar el formato periodístico.",
            "Deepfakes: videos o audios manipulados con inteligencia artificial para hacer parecer que alguien dijo o hizo algo que no ocurrió.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El sesgo de confirmación es nuestra tendencia natural a buscar, interpretar y recordar información que confirma lo que ya creemos. Los algoritmos de redes sociales amplifican este sesgo mostrándote contenido similar al que ya consumiste. El resultado es una cámara de eco donde solo escuchas voces que coinciden con las tuyas.",
        },
        {
          tipo: "subtitulo",
          contenido: "La infodemia de COVID-19 como caso de estudio",
        },
        {
          tipo: "parrafo",
          contenido:
            "La Organización Mundial de la Salud acuñó el término 'infodemia' durante la pandemia de COVID-19 para describir la sobreabundancia de información —mucha de ella falsa— sobre el virus. Circularon rumores sobre curas milagrosas, teorías de conspiración sobre el origen del virus y desinformación sobre las vacunas. Esta infodemia tuvo consecuencias sanitarias reales: personas que rechazaron vacunas efectivas o que tomaron remedios peligrosos basándose en información falsa.",
        },
        {
          tipo: "lista",
          items: [
            "Antes de compartir: verifica en una fuente oficial (OMS, Secretaría de Salud, UNAM).",
            "Identifica el propósito: ¿qué gana quien comparte esta información?",
            "Busca la fuente original: muchos mensajes virales no tienen autor ni fuente citable.",
            "Consulta verificadores: Verificado.mx nació precisamente para combatir la infodemia en México.",
          ],
        },
        {
          tipo: "cita",
          contenido:
            "Una mentira puede dar la vuelta al mundo antes de que la verdad tenga tiempo de ponerse los zapatos.",
          fuente: "Atribuida a Mark Twain, escritor estadounidense",
        },
      ],
    },
  },

  // ── 9 ── Ciudadanía digital ───────────────────────────────────────────────
  {
    slug: "cd-ii-fact-checking-paso-a-paso",
    titulo: "Fact-checking paso a paso: cómo verificar información",
    categoria: "Ciudadanía digital",
    conceptos_clave: ["fact-checking", "verificación de datos", "búsqueda inversa", "fuente primaria"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El fact-checking (verificación de datos o checado de datos) es el proceso sistemático de comprobar si una afirmación, noticia o dato es verdadero, falso o necesita contexto. Los periodistas de datos lo practican profesionalmente, pero cualquier ciudadano puede aprender las técnicas básicas para verificar información antes de creerla o compartirla.",
        },
        {
          tipo: "subtitulo",
          contenido: "Protocolo básico de verificación",
        },
        {
          tipo: "lista",
          items: [
            "1. Lee completo antes de compartir: muchos titulares son engañosos pero el cuerpo de la nota aclara el contexto.",
            "2. Identifica la fuente original: ¿de dónde viene esta información? ¿Hay un estudio, un documento oficial, una declaración atribuida a alguien?",
            "3. Busca en Google la afirmación exacta entre comillas para ver si aparece en medios confiables.",
            "4. Consulta verificadores especializados: Animal Político Verifica, AFP Factual, Verificado.mx.",
            "5. Si hay una imagen o video, verifica su autenticidad.",
          ],
        },
        {
          tipo: "subtitulo",
          contenido: "Verificación de imágenes y videos",
        },
        {
          tipo: "parrafo",
          contenido:
            "Una imagen viral puede ser real pero tomada en un contexto diferente al que se afirma. La búsqueda inversa de imágenes te permite encontrar cuándo y dónde se publicó originalmente. En Google Imágenes, haz clic en el ícono de cámara para subir una imagen o pegar su URL. InVID (extensión gratuita del navegador) hace lo mismo con videos de YouTube y Facebook. TinEye es otro servicio especializado en rastreo de imágenes.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El 59% de los links que se comparten en redes sociales nunca son leídos por quien los comparte, según un estudio de la Universidad de Columbia. Muchas personas comparten contenido basándose solo en el titular. Leer antes de compartir es el primer y más importante paso del fact-checking.",
        },
        {
          tipo: "subtitulo",
          contenido: "Organizaciones de fact-checking en México",
        },
        {
          tipo: "lista",
          items: [
            "Animal Político — Verifica: parte del equipo de Animal Político, con cobertura de declaraciones de funcionarios.",
            "Verificado.mx: coalición de medios para verificar información en épocas electorales.",
            "AFP Factual: servicio de la agencia AFP para América Latina.",
            "BOOM México: especializados en desinformación en redes sociales.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La Red Internacional de Verificación de Datos (IFCN) certifica a organizaciones de fact-checking que cumplen estándares éticos de imparcialidad, transparencia y metodología. Cuando consultes un verificador, busca si tiene el sello IFCN para saber que sigue estándares profesionales reconocidos internacionalmente.",
        },
      ],
    },
  },

  // ── 10 ── Ciudadanía digital ──────────────────────────────────────────────
  {
    slug: "cd-ii-burbujas-de-filtro",
    titulo: "Burbujas de filtro: cuando el algoritmo decide lo que ves",
    categoria: "Ciudadanía digital",
    conceptos_clave: ["burbuja de filtro", "cámara de eco", "algoritmo", "personalización"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El concepto de 'burbuja de filtro' fue acuñado por el activista de internet Eli Pariser en 2011 para describir el fenómeno en que los algoritmos de redes sociales, buscadores y plataformas de streaming nos muestran únicamente contenido similar al que ya consumimos, creando una burbuja personalizada que nos aísla de perspectivas diferentes a las nuestras.",
        },
        {
          tipo: "subtitulo",
          contenido: "¿Cómo funcionan los algoritmos de recomendación?",
        },
        {
          tipo: "parrafo",
          contenido:
            "Plataformas como YouTube, TikTok, Facebook e Instagram monitorean cada acción tuya: qué videos completas, en qué pausas, qué comentas, qué buscas, cuánto tiempo miras una publicación antes de hacer scroll. Con esos datos entrenan modelos de recomendación que predicen qué contenido te mantendrá más tiempo en la plataforma. El objetivo no es informarte bien sino maximizar tu tiempo de atención, que es lo que venden a los anunciantes.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Las burbujas de filtro tienen consecuencias políticas reales. Estudios muestran que personas con distintas ideologías políticas pueden estar expuestas a versiones casi completamente diferentes de la realidad si consumen información solo en redes sociales. Esto dificulta el diálogo democrático y puede radicalizar posiciones.",
        },
        {
          tipo: "subtitulo",
          contenido: "Cómo salir de tu burbuja de filtro",
        },
        {
          tipo: "lista",
          items: [
            "Usa buscadores que no personalicen resultados (DuckDuckGo o Brave Search) para comparar.",
            "Sigue activamente a personas con perspectivas diferentes a las tuyas en redes.",
            "Consulta medios de distintas líneas editoriales sobre el mismo tema.",
            "Abre ventanas de incógnito o borra el historial de búsqueda ocasionalmente.",
            "Usa la configuración de la plataforma para indicar que no quieres ver cierto tipo de contenido.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "La cámara de eco va un paso más allá de la burbuja de filtro: no solo el algoritmo nos aísla, sino que nosotros mismos elegimos rodearnos solo de personas que piensan igual. Las redes sociales facilitan esta autoselección porque nos permiten seguir, bloquear y silenciar con un clic. El resultado es un entorno donde nuestras creencias son constantemente reforzadas y rara vez cuestionadas.",
        },
        {
          tipo: "cita",
          contenido:
            "Si el algoritmo siempre te da lo que quieres, nunca te da lo que necesitas.",
          fuente: "Eli Pariser, activista e investigador digital",
        },
      ],
    },
  },

  // ── 11 ── Ética digital ───────────────────────────────────────────────────
  {
    slug: "cd-ii-inteligencia-artificial-riesgos",
    titulo: "Inteligencia artificial: oportunidades y riesgos éticos",
    categoria: "Ética digital",
    conceptos_clave: ["inteligencia artificial", "sesgo algorítmico", "deepfake", "uso ético de IA"],
    tiempo_lectura_minutos: 8,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La inteligencia artificial (IA) está transformando prácticamente todos los sectores de la sociedad a una velocidad sin precedentes. Herramientas como ChatGPT, Gemini, Copilot, DALL-E y Midjourney ya forman parte del entorno digital de millones de estudiantes y trabajadores. Entender sus capacidades, pero también sus riesgos y limitaciones éticas, es esencial para usarlas de manera responsable.",
        },
        {
          tipo: "subtitulo",
          contenido: "Oportunidades de la IA en educación",
        },
        {
          tipo: "lista",
          items: [
            "Tutoría personalizada: herramientas de IA pueden adaptar el ritmo y nivel de explicación a cada estudiante.",
            "Accesibilidad: transcripción automática, traducción y descripción de imágenes para personas con discapacidad.",
            "Investigación: analizar grandes volúmenes de datos o bibliografía que sería imposible procesar manualmente.",
            "Creatividad asistida: generar borradores, ideas o prototipos que el humano refina y mejora.",
            "Automatización de tareas repetitivas: liberar tiempo para actividades de mayor valor cognitivo.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Los modelos de lenguaje como ChatGPT 'alucinan': generan información falsa con total confianza. Nunca uses una respuesta de IA sin verificarla en fuentes primarias, especialmente en temas de salud, derecho, historia o ciencia. La IA es un asistente, no una autoridad.",
        },
        {
          tipo: "subtitulo",
          contenido: "Riesgos éticos que debemos conocer",
        },
        {
          tipo: "parrafo",
          contenido:
            "El sesgo algorítmico ocurre cuando los datos de entrenamiento de una IA reflejan prejuicios humanos y el sistema los amplifica. Sistemas de reconocimiento facial han mostrado tasas de error significativamente mayores con rostros de mujeres y personas de tez oscura. Los deepfakes —videos generados por IA que hacen parecer que alguien dijo o hizo algo que no ocurrió— representan una amenaza creciente para la privacidad, la política y la reputación de las personas. El plagio asistido por IA plantea dilemas éticos en contextos educativos que las instituciones aún están resolviendo.",
        },
        {
          tipo: "lista",
          items: [
            "Uso académico ético de IA: úsala para aprender y estructurar ideas, no para sustituir tu pensamiento.",
            "Siempre declara cuando usas IA en trabajos académicos si tu institución lo requiere.",
            "Verifica toda información generada por IA antes de usarla.",
            "Reporta contenido deepfake cuando lo encuentres en plataformas.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "México comenzó a desarrollar en 2023 su Política de Inteligencia Artificial, coordinada por la Secretaría de Innovación, Ciencia y Tecnología. A nivel latinoamericano, la UNESCO publicó su Recomendación sobre la Ética de la IA en 2021, firmada por México, que establece principios de transparencia, no discriminación y protección de datos para el desarrollo responsable de IA.",
        },
      ],
    },
  },

  // ── 12 ── Herramientas digitales ─────────────────────────────────────────
  {
    slug: "cd-ii-hojas-de-calculo-datos",
    titulo: "Hojas de cálculo para análisis de datos: más allá de las tablas",
    categoria: "Herramientas digitales",
    conceptos_clave: ["hoja de cálculo", "fórmula", "función estadística", "Google Sheets"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Las hojas de cálculo son una de las herramientas más poderosas y subutilizadas del mundo digital. Más allá de hacer tablas bonitas, Google Sheets o Microsoft Excel permiten analizar datos, encontrar patrones, realizar cálculos estadísticos y crear visualizaciones. Saber usarlas es una habilidad valorada en prácticamente cualquier campo: desde biología hasta ciencias sociales, pasando por negocios y periodismo.",
        },
        {
          tipo: "subtitulo",
          contenido: "Fórmulas esenciales para análisis de datos",
        },
        {
          tipo: "lista",
          items: [
            "=SUMA(A1:A10): suma todos los valores en el rango indicado.",
            "=PROMEDIO(B1:B20): calcula la media aritmética del rango.",
            "=MEDIANA(C1:C30): encuentra el valor central del conjunto de datos.",
            "=MAX(D1:D50) y =MIN(D1:D50): valor máximo y mínimo.",
            "=CONTAR.SI(A1:A100,\"criterio\"): cuenta celdas que cumplen una condición.",
            "=SI(condición, valor_si_verdadero, valor_si_falso): toma decisiones automatizadas.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La diferencia entre media y mediana es crucial para interpretar datos correctamente. Si un grupo de 10 estudiantes gana en promedio 15,000 pesos al mes, pero 9 ganan 5,000 y uno gana 95,000, la media es engañosa. La mediana (5,000) refleja mejor la realidad de la mayoría. Siempre pregúntate qué estadístico es más apropiado para el tipo de datos que analizas.",
        },
        {
          tipo: "subtitulo",
          contenido: "Tablas dinámicas: el superpoder de las hojas de cálculo",
        },
        {
          tipo: "parrafo",
          contenido:
            "Las tablas dinámicas (pivot tables) permiten resumir, agrupar y analizar grandes conjuntos de datos con pocos clics, sin escribir una sola fórmula. Si tienes un registro de 1,000 calificaciones de estudiantes, una tabla dinámica puede mostrarte en segundos el promedio por grupo, la distribución de calificaciones por materia, o cuántos estudiantes aprobaron por semestre. Son la herramienta de análisis de datos más poderosa disponible sin necesidad de programar.",
        },
        {
          tipo: "lista",
          items: [
            "En Google Sheets: Datos > Tabla dinámica.",
            "En Excel: Insertar > Tabla dinámica.",
            "Arrastra variables a filas, columnas y valores para explorar diferentes perspectivas de tus datos.",
            "Combínalas con gráficas dinámicas para visualizar los resultados al instante.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El INEGI publica miles de conjuntos de datos abiertos en datos.gob.mx y en su propio portal (www.inegi.org.mx/datos). Puedes descargar datos sobre población, economía, educación, salud y más en formato CSV y abrirlos directamente en Google Sheets para analizarlos. Es una excelente fuente para proyectos escolares con datos reales de México.",
        },
      ],
    },
  },

  // ── 13 ── Herramientas digitales ─────────────────────────────────────────
  {
    slug: "cd-ii-visualizacion-datos",
    titulo: "Visualización de datos: contar historias con gráficas",
    categoria: "Herramientas digitales",
    conceptos_clave: ["visualización de datos", "infografía", "gráfica", "dataviz"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Una buena visualización de datos puede comunicar en segundos lo que tardaríamos páginas en explicar con texto. El periodismo de datos, la ciencia, la política pública y los negocios usan cada vez más gráficas, mapas e infografías para hacer comprensibles conjuntos de datos complejos. Pero no toda visualización es honesta o efectiva: elegir mal el tipo de gráfica puede distorsionar la realidad.",
        },
        {
          tipo: "subtitulo",
          contenido: "¿Qué gráfica usar según los datos?",
        },
        {
          tipo: "lista",
          items: [
            "Barras/columnas: comparar categorías distintas (¿qué estado tiene más habitantes?).",
            "Líneas: mostrar tendencias en el tiempo (¿cómo evolucionó la matrícula escolar?).",
            "Circular (pie): mostrar proporciones de un todo (¿qué porcentaje de usuarios usa cada red social?).",
            "Dispersión (scatter plot): mostrar la relación entre dos variables numéricas.",
            "Mapa de calor: mostrar valores en una cuadrícula o mapa geográfico.",
            "Histograma: mostrar la distribución de frecuencias de una variable.",
          ],
        },
        {
          tipo: "callout",
          variante: "advertencia",
          contenido:
            "Las gráficas pueden mentir sin mentir. Un eje Y que no empieza en cero puede hacer parecer que una diferencia pequeña es enorme. Una gráfica circular con demasiadas categorías es imposible de leer. Un mapa sin escala puede distorsionar las proporciones. Aprende a leer y crear visualizaciones honestas.",
        },
        {
          tipo: "subtitulo",
          contenido: "Herramientas gratuitas para crear visualizaciones",
        },
        {
          tipo: "lista",
          items: [
            "Google Charts / Google Sheets: integradas, sin instalación, ideales para empezar.",
            "Canva: plantillas de infografías y gráficas listas para personalizar.",
            "Flourish (flourish.studio): visualizaciones interactivas avanzadas sin código.",
            "Datawrapper: estándar en medios de comunicación, especialmente para mapas y gráficas de tiempo.",
            "Tableau Public: versión gratuita del software de análisis visual más usado en la industria.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "Los datos del INEGI, de la Secretaría de Educación Pública y de datos.gob.mx están disponibles en formatos descargables y son una fuente excelente para practicar visualización con información real de México. Proyectos de periodismo de datos como el del New York Times, La Jornada Datos o PODER son ejemplos de cómo visualizar datos para informar a la ciudadanía.",
        },
        {
          tipo: "imagen",
          url: "/biblioteca/placeholder-ficha.svg",
          alt: "Galería de seis tipos de gráficas (barras, líneas, circular, dispersión, mapa de calor e histograma) con el tipo de dato más adecuado para cada una",
          caption: "Guía rápida: qué tipo de gráfica usar según el tipo de datos.",
        },
      ],
    },
  },

  // ── 14 ── Pensamiento crítico digital ─────────────────────────────────────
  {
    slug: "cd-ii-open-data-gobierno",
    titulo: "Open data: los datos abiertos del gobierno como herramienta ciudadana",
    categoria: "Pensamiento crítico digital",
    conceptos_clave: ["datos abiertos", "open data", "transparencia", "datos.gob.mx"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Los datos abiertos (open data) son conjuntos de información que los gobiernos y organizaciones publican en formatos reutilizables y accesibles para cualquier persona, sin restricciones de uso. La premisa es que los datos generados con recursos públicos deben ser públicos: los ciudadanos que pagan impuestos tienen derecho a acceder a la información que produce el Estado.",
        },
        {
          tipo: "subtitulo",
          contenido: "El portal datos.gob.mx",
        },
        {
          tipo: "parrafo",
          contenido:
            "México tiene uno de los portales de datos abiertos más desarrollados de América Latina. El portal datos.gob.mx reúne miles de conjuntos de datos de dependencias federales: estadísticas de educación de la SEP, datos de salud de la Secretaría de Salud, información económica del INEGI, registros del IMSS y mucho más. Todos los datos son descargables en formatos CSV, JSON o Excel, listos para analizar.",
        },
        {
          tipo: "lista",
          items: [
            "INEGI (inegi.org.mx/datos): censos, encuestas, estadísticas de población y economía.",
            "datos.gob.mx: portal central del gobierno federal con miles de datasets.",
            "CONEVAL: datos sobre pobreza, medición multidimensional, evaluación de programas sociales.",
            "IMCO: índices de competitividad y transparencia a nivel estatal y municipal.",
            "Transparencia Presupuestaria: cómo se ejerce el presupuesto federal (transparenciapresupuestaria.gob.mx).",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El INAI (Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales) es el organismo que garantiza tu derecho a solicitar información al gobierno. Si los datos que necesitas no están publicados, puedes hacer una solicitud de acceso a la información en la Plataforma Nacional de Transparencia (infomex.org.mx). Es gratuito y es un derecho constitucional.",
        },
        {
          tipo: "subtitulo",
          contenido: "Cómo usar datos abiertos para proyectos escolares",
        },
        {
          tipo: "parrafo",
          contenido:
            "Los datos abiertos permiten hacer proyectos de investigación con información real y actual. Puedes analizar la distribución del presupuesto educativo por estado, comparar tasas de abandono escolar según nivel socioeconómico, mapear la cobertura de internet en municipios mexicanos, o estudiar la evolución del salario mínimo frente a la inflación. Estos proyectos desarrollan pensamiento crítico, habilidades de análisis de datos y comprensión ciudadana.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La organización internacional Open Knowledge Foundation publica anualmente el Índice Global de Datos Abiertos, que evalúa la calidad y disponibilidad de datos gubernamentales en el mundo. México ha mejorado su posición en este índice en la última década, aunque aún existen áreas de mejora especialmente en datos de seguridad pública y procuración de justicia.",
        },
      ],
    },
  },

  // ── 15 ── Ciudadanía digital ──────────────────────────────────────────────
  {
    slug: "cd-ii-produccion-contenido-etico",
    titulo: "Producción de contenido digital ético y responsable",
    categoria: "Ciudadanía digital",
    conceptos_clave: ["creación de contenido", "responsabilidad editorial", "huella digital", "contenido ético"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Ser creador de contenido digital no es solo subir videos o publicar en redes: implica asumir una responsabilidad editorial. Lo que publicamos tiene alcance, puede influir en otros y deja una huella permanente. Producir contenido ético significa pensar no solo en si podemos publicar algo, sino en si deberíamos hacerlo y cómo hacerlo de manera responsable.",
        },
        {
          tipo: "subtitulo",
          contenido: "Principios del contenido digital responsable",
        },
        {
          tipo: "lista",
          items: [
            "Veracidad: publica solo lo que puedes verificar. Si no estás seguro, di que es tu opinión o que no lo has comprobado.",
            "Atribución: da crédito siempre que uses imágenes, música, textos o ideas de otros.",
            "Contexto: una imagen o cita fuera de contexto puede distorsionar completamente el significado.",
            "Privacidad: no publiques información personal de otras personas sin su consentimiento.",
            "Impacto: considera cómo podría afectar tu contenido a las personas que aparecen en él o a quienes lo leen.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "En México, publicar información falsa que dañe la reputación de alguien puede constituir el delito de difamación. Difundir imágenes íntimas sin consentimiento es delito tipificado en el Código Penal Federal. El incitar a la violencia o el odio contra grupos de personas puede acarrear consecuencias legales. La libertad de expresión tiene límites legales y éticos.",
        },
        {
          tipo: "subtitulo",
          contenido: "Tu huella digital como creador",
        },
        {
          tipo: "parrafo",
          contenido:
            "Todo lo que publicas en internet contribuye a construir tu identidad digital: la imagen pública que proyectas en el mundo en línea. Esta huella puede ser un activo valioso (un portafolio de trabajos creativos, proyectos o investigaciones que demuestren tus capacidades) o un pasivo (contenido inapropiado que puede afectar oportunidades futuras). Mucha gente no dimensiona que universidades, empleadores y colaboradores potenciales buscan en línea a las personas antes de tomar decisiones sobre ellas.",
        },
        {
          tipo: "lista",
          items: [
            "Googlea tu nombre regularmente para ver qué aparece sobre ti.",
            "Revisa la configuración de privacidad de tus redes sociales.",
            "Considera crear un portafolio digital con tus mejores trabajos.",
            "Piensa a largo plazo: ¿estarías orgulloso de este contenido en 10 años?",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El derecho al olvido, reconocido en Europa y en proceso de discusión en México, permite solicitar a los buscadores que retiren resultados de búsqueda que contienen información personal desactualizada o dañina. En México, el INAI tiene competencia para proteger datos personales y puede ordenar la eliminación de información en ciertos casos.",
        },
      ],
    },
  },

  // ── 16 ── Ciudadanía digital ──────────────────────────────────────────────
  {
    slug: "cd-ii-identidad-digital-privacidad",
    titulo: "Identidad digital y privacidad: gestiona tu presencia en línea",
    categoria: "Ciudadanía digital",
    conceptos_clave: ["identidad digital", "privacidad", "datos personales", "INAI"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Tu identidad digital es el conjunto de información que existe sobre ti en internet: lo que tú publicas, lo que otros publican sobre ti, los datos que recopilan las plataformas y los registros que generan tus actividades en línea. Gestionar esta identidad de manera consciente y proteger tu privacidad son competencias ciudadanas fundamentales en el siglo XXI.",
        },
        {
          tipo: "subtitulo",
          contenido: "¿Qué información hay sobre ti en internet?",
        },
        {
          tipo: "lista",
          items: [
            "Información que tú publicas: publicaciones, fotos, comentarios, biografías en redes.",
            "Información que otros publican sobre ti: etiquetas, menciones, fotos compartidas.",
            "Datos que recopilan las plataformas: historial de navegación, búsquedas, ubicación, hábitos de consumo.",
            "Registros públicos digitalizados: padrones electorales, datos del SAT, trámites gubernamentales.",
            "Metadatos: información sobre tus archivos (cuándo y dónde tomaste una foto, desde qué dispositivo).",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) garantiza tus derechos ARCO: Acceso a tus datos, Rectificación de datos incorrectos, Cancelación de datos que ya no son necesarios y Oposición al uso de tus datos. El INAI (inai.org.mx) es el organismo que vela por estos derechos y ante quien puedes presentar quejas si alguna empresa los viola.",
        },
        {
          tipo: "subtitulo",
          contenido: "Gestionar tu privacidad en redes sociales",
        },
        {
          tipo: "lista",
          items: [
            "Revisa y ajusta la configuración de privacidad de cada red social al menos una vez al año: las plataformas cambian sus políticas frecuentemente.",
            "Elige con cuidado quién puede ver tus publicaciones: amigos, conocidos o público general.",
            "Desactiva la geolocalización en publicaciones si no quieres revelar tu ubicación.",
            "Revisa qué aplicaciones de terceros tienen acceso a tu cuenta y revoca las que no uses.",
            "Usa contraseñas diferentes para cada plataforma y activa la autenticación de dos factores.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "La privacidad no es secretismo: es el derecho a controlar qué información compartes, con quién y en qué contexto. Una persona que no comparte su dirección de casa en redes no tiene nada que ocultar; simplemente ejerce su derecho a la privacidad. Del mismo modo, usar una VPN, navegar en incógnito o preferir aplicaciones que no rastrean son decisiones legítimas de gestión de privacidad.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "En 2023, la Plataforma Nacional de Transparencia recibió más de 250,000 solicitudes de acceso a la información en México. El 70% fueron respondidas en tiempo y forma. Este mecanismo es una de las herramientas más poderosas de la ciudadanía para ejercer control sobre la información que el Estado tiene sobre los asuntos públicos.",
        },
      ],
    },
  },

  // ── 17 ── Ciudadanía digital ──────────────────────────────────────────────
  {
    slug: "cd-ii-ciberacoso-prevencion",
    titulo: "Ciberacoso y violencia digital: reconocer, prevenir y actuar",
    categoria: "Ciudadanía digital",
    conceptos_clave: ["ciberacoso", "violencia digital", "denuncia", "prevención"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El ciberacoso es el uso de tecnologías digitales para acosar, amenazar, humillar, intimidar o dañar a una persona. A diferencia del acoso cara a cara, el ciberacoso puede ocurrir las 24 horas del día desde cualquier lugar, puede involucrar a una audiencia masiva y el contenido dañino puede permanecer disponible indefinidamente. En México, el 20% de las y los adolescentes han experimentado alguna forma de violencia digital, según datos de UNICEF.",
        },
        {
          tipo: "subtitulo",
          contenido: "Formas de violencia digital",
        },
        {
          tipo: "lista",
          items: [
            "Hostigamiento: mensajes repetidos, agresivos e intimidantes.",
            "Doxing: publicar información personal (dirección, teléfono, datos familiares) sin consentimiento.",
            "Sexting no consensual: difundir imágenes íntimas de otra persona sin su permiso.",
            "Suplantación de identidad: crear perfiles falsos usando la identidad de alguien.",
            "Exclusión deliberada: excluir a alguien de grupos digitales de manera intencional y perjudicial.",
            "Ciberpersecución (stalking digital): monitorear y rastrear a alguien en línea de forma obsesiva.",
          ],
        },
        {
          tipo: "callout",
          variante: "advertencia",
          contenido:
            "Difundir imágenes íntimas de otra persona sin su consentimiento está tipificado como delito en el Código Penal Federal de México (Artículo 199 bis) con penas de 3 a 6 años de prisión. Este delito se conoce como 'pornografía no consensuada' o 'revenge porn'. No importa quién tomó las imágenes originalmente: difundirlas sin consentimiento es ilegal.",
        },
        {
          tipo: "subtitulo",
          contenido: "Si eres víctima de ciberacoso: pasos a seguir",
        },
        {
          tipo: "lista",
          items: [
            "No respondas ni te enfrentes: responder puede escalar la situación.",
            "Documenta todo: toma capturas de pantalla con fecha y hora visible.",
            "Bloquea al agresor en todas las plataformas donde ocurre.",
            "Reporta a la plataforma usando los mecanismos de denuncia disponibles.",
            "Cuéntalo a un adulto de confianza: maestro, tutor, familiar.",
            "Denuncia ante la Policía Cibernética (SSP) o la Fiscalía de tu estado.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La Policía Cibernética de la Secretaría de Seguridad Ciudadana recibe reportes en el 088 o en su portal web. El INMUJERES y organizaciones como La Liga MX contra el Ciberacoso ofrecen apoyo específico para casos de violencia digital de género. No estás solo: buscar ayuda es lo correcto y lo valiente.",
        },
        {
          tipo: "parrafo",
          contenido:
            "Como testigo también tienes un papel importante. No compartas ni reacciones positivamente al contenido de ciberacoso. Apoya a la víctima en privado. Reporta el contenido en la plataforma. Los testigos que actúan pueden interrumpir el ciclo de violencia: la indiferencia pasiva es una forma de complicidad.",
        },
      ],
    },
  },

  // ── 18 ── Seguridad informática ───────────────────────────────────────────
  {
    slug: "cd-ii-contrasenas-seguras",
    titulo: "Contraseñas seguras y autenticación: protege tus cuentas",
    categoria: "Seguridad informática",
    conceptos_clave: ["contraseña segura", "autenticación de dos factores", "gestor de contraseñas", "passphrase"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Las contraseñas son la primera línea de defensa de tu vida digital. Sin embargo, la mayoría de las personas las usa de manera insegura: contraseñas cortas, fáciles de adivinar, reutilizadas en múltiples sitios o compartidas con otros. Un hacker que compromete una de tus cuentas puede acceder a todas si usas la misma contraseña. Mejorar tus hábitos de contraseñas es la medida de ciberseguridad con mejor relación esfuerzo/impacto.",
        },
        {
          tipo: "subtitulo",
          contenido: "Características de una contraseña segura",
        },
        {
          tipo: "lista",
          items: [
            "Longitud: mínimo 12 caracteres; a mayor longitud, mayor seguridad exponencial.",
            "Diversidad: combina mayúsculas, minúsculas, números y símbolos especiales (!@#$%).",
            "Unicidad: cada cuenta debe tener una contraseña diferente.",
            "Impredecibilidad: evita nombres propios, fechas de cumpleaños, palabras del diccionario.",
            "Passphrase: una frase de 4-5 palabras aleatorias es más segura y más fácil de recordar que una contraseña corta y compleja. Ejemplo: 'cielo-mango-reloj-camisa'.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Usar '123456', 'contraseña', 'qwerty' o tu fecha de nacimiento como contraseña es equivalente a dejar tu casa sin llave. Las diez contraseñas más usadas del mundo pueden ser descifradas por un atacante en menos de un segundo. Si alguna de tus cuentas usa alguna de estas, cámbiala ahora.",
        },
        {
          tipo: "subtitulo",
          contenido: "Gestores de contraseñas: la solución práctica",
        },
        {
          tipo: "parrafo",
          contenido:
            "Un gestor de contraseñas es una aplicación que genera, almacena y completa automáticamente contraseñas únicas y seguras para cada cuenta. Solo necesitas recordar una contraseña maestra. Los más recomendados son Bitwarden (gratuito y de código abierto), 1Password y Dashlane. También los navegadores Chrome, Firefox y Safari tienen gestores integrados, aunque los especializados ofrecen más seguridad.",
        },
        {
          tipo: "subtitulo",
          contenido: "Autenticación de dos factores (2FA)",
        },
        {
          tipo: "lista",
          items: [
            "Activa 2FA en todas tus cuentas importantes: correo, redes sociales, banca en línea.",
            "Preferible usar una app autenticadora (Google Authenticator, Authy) sobre SMS, que es vulnerable.",
            "Con 2FA activo, aunque roben tu contraseña no pueden acceder a tu cuenta sin el segundo factor.",
            "Microsoft estima que el 99.9% de los ataques a cuentas fracasan cuando hay 2FA activo.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "Have I Been Pwned (haveibeenpwned.com) es un servicio gratuito donde puedes verificar si tu correo electrónico apareció en alguna filtración masiva de datos. Si tu correo está comprometido, cambia inmediatamente la contraseña de todas las cuentas que usen ese correo y activa 2FA. Las filtraciones de datos son más comunes de lo que parece.",
        },
      ],
    },
  },

  // ── 19 ── Seguridad informática ───────────────────────────────────────────
  {
    slug: "cd-ii-proteccion-datos-personales",
    titulo: "Protección de datos personales en México: tus derechos ARCO",
    categoria: "Seguridad informática",
    conceptos_clave: ["datos personales", "derechos ARCO", "INAI", "LFPDPPP"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "En la economía digital, los datos personales son un recurso de enorme valor. Las empresas los recopilan, procesan, venden y usan para personalizar publicidad, tomar decisiones sobre crédito, acceso a servicios e incluso empleabilidad. México cuenta con un marco legal de protección de datos personales que te otorga derechos concretos sobre tu información, aunque muchas personas no los conocen.",
        },
        {
          tipo: "subtitulo",
          contenido: "¿Qué son los datos personales?",
        },
        {
          tipo: "parrafo",
          contenido:
            "Son datos personales cualquier información que identifique o haga identificable a una persona: nombre, dirección, CURP, RFC, número de teléfono, correo electrónico, imagen fotográfica, voz, datos biométricos (huella digital, iris), historial médico, información financiera y también datos sensibles como origen étnico, salud, vida sexual, opiniones políticas o creencias religiosas.",
        },
        {
          tipo: "subtitulo",
          contenido: "La Ley Federal de Protección de Datos Personales (LFPDPPP)",
        },
        {
          tipo: "parrafo",
          contenido:
            "La LFPDPPP, vigente desde 2010, protege los datos personales en posesión de empresas privadas. La Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados (2017) extiende esta protección a los datos en poder del gobierno. El INAI (Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales) es el organismo autónomo encargado de hacer cumplir ambas leyes.",
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "Tus derechos ARCO son: Acceso (conocer qué datos tiene una empresa sobre ti), Rectificación (corregir datos incorrectos), Cancelación (solicitar que eliminen tus datos) y Oposición (oponerte a ciertos usos de tus datos). Puedes ejercerlos enviando una solicitud directamente a cualquier empresa o institución que tenga tus datos. Si te la niegan injustificadamente, puedes quejarte ante el INAI.",
        },
        {
          tipo: "lista",
          items: [
            "El aviso de privacidad es el documento donde la empresa debe explicarte qué datos recopila y para qué.",
            "Leer el aviso de privacidad antes de registrarte es un derecho y una buena práctica.",
            "Las empresas deben proteger tus datos con medidas de seguridad adecuadas.",
            "Si tus datos son comprometidos en una filtración, la empresa debe notificarte.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "México fue el primer país de América Latina en tener una ley federal de protección de datos personales (2010). El INAI ha impuesto sanciones a empresas como bancos, operadoras de telefonía y plataformas digitales por incumplir la ley. En 2022, el INAI multó a varias empresas por no responder solicitudes ARCO en tiempo y forma.",
        },
      ],
    },
  },

  // ── 20 ── Ética digital ───────────────────────────────────────────────────
  {
    slug: "cd-ii-futuro-trabajo-digital",
    titulo: "El futuro del trabajo en la era digital",
    categoria: "Ética digital",
    conceptos_clave: ["automatización", "trabajo del futuro", "habilidades digitales", "economía gig"],
    tiempo_lectura_minutos: 7,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "La digitalización y la inteligencia artificial están transformando el mercado laboral a una velocidad sin precedentes. Algunos empleos desaparecerán, otros se transformarán y surgirán nuevas profesiones que hoy apenas podemos imaginar. Comprender estas tendencias no es causa de pánico sino de preparación: los jóvenes que desarrollen habilidades digitales sólidas tendrán una ventaja significativa en el mercado laboral del futuro.",
        },
        {
          tipo: "subtitulo",
          contenido: "¿Qué empleos están en riesgo de automatización?",
        },
        {
          tipo: "parrafo",
          contenido:
            "Según el Foro Económico Mundial, para 2027 la automatización habrá desplazado aproximadamente 85 millones de empleos a nivel global, pero también creará 97 millones de nuevos roles. Los empleos más vulnerables son aquellos con tareas repetitivas, predecibles y basadas en reglas: cajeros, operadores de call center, revisores de documentos, conductores de vehículos, contadores de tareas rutinarias. Los empleos más resilientes son los que requieren creatividad, empatía, razonamiento complejo, liderazgo y habilidades interpersonales.",
        },
        {
          tipo: "lista",
          items: [
            "Empleos en crecimiento: especialistas en IA y datos, diseñadores de experiencia digital, especialistas en ciberseguridad, ingenieros de energías renovables, educadores y entrenadores.",
            "Habilidades más valoradas: pensamiento analítico, creatividad, resiliencia, alfabetización tecnológica, trabajo en equipo.",
            "La capacidad de aprender continuamente (lifelong learning) es la meta-habilidad más importante.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El Foro Económico Mundial estima que el 65% de los niños que entran hoy a la primaria trabajarán en empleos que todavía no existen. Esto significa que los contenidos específicos que aprendes ahora son menos importantes que desarrollar la capacidad de aprender, adaptarte y resolver problemas nuevos.",
        },
        {
          tipo: "subtitulo",
          contenido: "La economía gig y el freelancing en México",
        },
        {
          tipo: "parrafo",
          contenido:
            "La economía gig (trabajo por proyecto o encargo) crece aceleradamente. Plataformas como Workana, Fiverr, Upwork y 99designs permiten a freelancers mexicanos trabajar para clientes de todo el mundo. Las áreas más demandadas incluyen programación, diseño gráfico, marketing digital, redacción de contenidos y traducción. Esta modalidad ofrece flexibilidad pero también exige autodisciplina, gestión financiera propia (no hay seguridad social automática) y capacidad de conseguir clientes continuamente.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "México es el tercer país de América Latina con mayor número de freelancers digitales, detrás de Brasil y Argentina, según datos de Workana. Ciudad de México, Guadalajara y Monterrey concentran la mayor parte del ecosistema de trabajo digital. Guadalajara es conocida como el 'Silicon Valley mexicano' por su alta concentración de empresas tecnológicas y talento digital.",
        },
        {
          tipo: "parrafo",
          contenido:
            "Más allá del empleo, la digitalización también plantea preguntas éticas colectivas: ¿quién se beneficia de la automatización? ¿Cómo proteger a los trabajadores desplazados? ¿Debe gravarse la automatización para financiar la transición laboral? ¿Cómo asegurar que el progreso tecnológico reduzca y no aumente las desigualdades? Estas son preguntas de ciudadanía digital que las generaciones jóvenes de hoy deberán responder como sociedad.",
        },
      ],
    },
  },

  // ── 21 ── Pensamiento crítico digital ─────────────────────────────────────
  {
    slug: "cd-ii-algoritmos-como-nos-afectan",
    titulo: "Algoritmos: cómo nos afectan sin que lo notemos",
    categoria: "Pensamiento crítico digital",
    conceptos_clave: ["algoritmo", "recomendación algorítmica", "sesgo", "opacidad algorítmica"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "Un algoritmo es una secuencia de instrucciones que una computadora ejecuta para resolver un problema o tomar una decisión. Los algoritmos son matemáticamente neutros, pero los datos con los que se entrenan y los objetivos que se les asignan pueden producir resultados profundamente desiguales. Hoy los algoritmos deciden qué noticias ves, qué crédito puedes obtener, si tu CV llega a una entrevista o si eres objeto de vigilancia policial.",
        },
        {
          tipo: "subtitulo",
          contenido: "Algoritmos que afectan tu vida cotidiana",
        },
        {
          tipo: "lista",
          items: [
            "Redes sociales: decide qué publicaciones ves y en qué orden; puede influir en tus opiniones políticas.",
            "Streaming: decide qué series o canciones te recomienda; moldea tus gustos culturales.",
            "Buscadores: decide qué fuentes de información son más relevantes para ti.",
            "Banca y crédito: evalúa tu perfil de riesgo para otorgar o negar créditos.",
            "Selección de personal: algunos sistemas de IA filtran CVs antes de que un humano los vea.",
            "Justicia: en algunos países, algoritmos sugieren sentencias penales o liberaciones condicionales.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "La opacidad algorítmica es el problema de que los algoritmos más influyentes son cajas negras: sus criterios de decisión no son públicos ni transparentes. No puedes saber exactamente por qué el algoritmo de un banco te negó un crédito, por qué tu CV no fue seleccionado, o por qué ves ciertos anuncios. Esta opacidad dificulta detectar y corregir sesgos discriminatorios.",
        },
        {
          tipo: "subtitulo",
          contenido: "Sesgos algorítmicos: cuando la matemática discrimina",
        },
        {
          tipo: "parrafo",
          contenido:
            "Si los datos históricos con los que se entrena un algoritmo reflejan desigualdades pasadas, el algoritmo aprende y perpetúa esas desigualdades. Por ejemplo: si históricamente las empresas contrataban menos mujeres para puestos directivos, un algoritmo de selección de personal entrenado con esos datos aprenderá a penalizar los CVs de mujeres. El caso de Amazon, que tuvo que eliminar su sistema de IA para reclutamiento por este motivo, es el ejemplo más citado.",
        },
        {
          tipo: "lista",
          items: [
            "Pregunta siempre: ¿con qué datos fue entrenado este sistema? ¿Quién decidió esos criterios?",
            "Si eres afectado por una decisión algorítmica importante, tienes derecho a pedir explicación.",
            "Apoya políticas de transparencia y auditoría de algoritmos de uso público.",
            "La diversidad en los equipos que diseñan algoritmos reduce (no elimina) el sesgo.",
          ],
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "La Unión Europea aprobó en 2024 el Acta de Inteligencia Artificial (AI Act), la primera ley del mundo que regula el uso de IA según su nivel de riesgo. Los sistemas de IA de alto riesgo (como los usados en justicia, crédito o empleo) deben ser auditables y transparentes. México aún no tiene una ley equivalente, aunque el INAI ha publicado recomendaciones sobre el uso ético de IA en el sector público.",
        },
      ],
    },
  },

  // ── 22 ── Seguridad informática ───────────────────────────────────────────
  {
    slug: "cd-ii-phishing-estafas-digitales",
    titulo: "Phishing y estafas digitales: cómo reconocerlas y evitarlas",
    categoria: "Seguridad informática",
    conceptos_clave: ["phishing", "smishing", "ingeniería social", "estafa digital"],
    tiempo_lectura_minutos: 6,
    es_placeholder: true,
    contenido: {
      secciones: [
        {
          tipo: "parrafo",
          contenido:
            "El phishing es una técnica de engaño en la que los cibercriminales se hacen pasar por entidades confiables —bancos, servicios de gobierno, tiendas en línea, redes sociales— para obtener información confidencial como contraseñas, datos de tarjetas de crédito o números de seguridad. Es la forma más común de ciberataque y México figura entre los países de América Latina con más incidentes reportados.",
        },
        {
          tipo: "subtitulo",
          contenido: "Variantes del phishing",
        },
        {
          tipo: "lista",
          items: [
            "Phishing por correo electrónico: el más clásico; correos que imitan la apariencia de bancos, PayPal o el SAT con links falsos.",
            "Smishing: phishing por SMS. Mensajes que dicen 'Tu paquete está retenido, haz clic aquí'.",
            "Vishing: phishing por llamada telefónica. Una voz (o IA) que se hace pasar por un banco.",
            "Spear phishing: ataque dirigido a una persona específica con información personalizada para parecer más creíble.",
            "Pharming: redirige una URL legítima a un sitio falso sin que la víctima lo note.",
          ],
        },
        {
          tipo: "callout",
          variante: "importante",
          contenido:
            "El SAT, tu banco y cualquier institución seria NUNCA te pedirán tu contraseña, número de tarjeta completo o código de seguridad por correo, WhatsApp o llamada telefónica. Si recibes este tipo de solicitud, es una estafa. Cuelga, no respondas, y verifica directamente en el sitio oficial escribiendo la URL en el navegador (no haciendo clic en el link del mensaje).",
        },
        {
          tipo: "subtitulo",
          contenido: "Cómo identificar un intento de phishing",
        },
        {
          tipo: "lista",
          items: [
            "Urgencia artificial: 'Tu cuenta será bloqueada en 24 horas si no actúas YA'.",
            "Dirección de correo sospechosa: el nombre puede parecer legítimo pero el dominio es extraño (soporte@banco-mx-seguridad.net en lugar de soporte@banco.com.mx).",
            "Link que no coincide: pasa el cursor sobre el link sin hacer clic; verifica que la URL real coincide con el destino esperado.",
            "Errores ortográficos o de diseño: logos mal resueltos, fuentes incorrectas, texto mal traducido.",
            "Solicitud de información sensible: ninguna empresa legítima la pide por correo.",
          ],
        },
        {
          tipo: "parrafo",
          contenido:
            "Si caíste en una estafa de phishing: cambia inmediatamente las contraseñas de todas las cuentas afectadas, activa 2FA, notifica a tu banco si diste datos financieros, y reporta el incidente a la Policía Cibernética de la SSP (088) y al CONDUSEF (800 999 8080) si involucra servicios financieros. Actuar rápido puede limitar el daño.",
        },
        {
          tipo: "callout",
          variante: "sabias",
          contenido:
            "El 'pretexting' o ingeniería social es la base de la mayoría de los ataques exitosos: el atacante crea una historia convincente (es del banco, es de soporte técnico, es de recursos humanos) para ganar tu confianza y que entregues información voluntariamente. La tecnología es solo el vehículo; el objetivo real es manipular la psicología humana. La mejor defensa es el escepticismo informado.",
        },
      ],
    },
  },
] as const;

// ---------------------------------------------------------------------------
// FUNCIÓN PRINCIPAL
// ---------------------------------------------------------------------------

export async function seedBibliotecaCDII(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed Biblioteca CD-II (20 fichas)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", "CD-II")
    .single();

  if (uacErr || !uacRow) {
    throw new Error(
      `UAC CD-II no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`
    );
  }

  const rows = FICHAS_CDII.map((f, i) => ({
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

  if (error) throw new Error(`Error seeding fichas CD-II: ${error.message}`);

  console.log(`  ✓ ${rows.length} fichas de biblioteca de CD-II insertadas/actualizadas.`);
  console.log("\n✅ Seed Biblioteca CD-II completado.\n");
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
  seedBibliotecaCDII(sb).catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
}

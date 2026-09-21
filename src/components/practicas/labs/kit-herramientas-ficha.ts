/**
 * Ficha teórica — kit-herramientas-digitales
 *
 * Contenido VERBATIM de la progresión CD-I-P08 (Cultura Digital I): el marco
 * teórico son los cinco párrafos de la lectura A1 («Herramientas digitales
 * para estudiar»); el glosario recoge los cuatro términos de A5 más dos que la
 * propia lectura A1 define y el quiz A2 vuelve a preguntar; las aplicaciones
 * citan A3, A5 y el Producto Integrador de la materia.
 *
 * Los `conceptos` son los términos centrales de ESTE laboratorio —las ocho
 * categorías con las que se decide y las dos ideas que sostienen el modo del
 * escritorio— y se usan además para armar el capítulo «Prepárate» de la
 * Expedición.
 */
import type { FichaTeoricaData } from "./_ficha";

export const KIT_HERRAMIENTAS_FICHA: FichaTeoricaData = {
  ancla: "CD-I-P08-A1 · Herramientas digitales para estudiar",
  marcoTeorico: [
    "Las herramientas digitales para el estudio y la organización han transformado la forma en que aprendemos, colaboramos y comunicamos. Conocerlas y usarlas estratégicamente puede marcar una gran diferencia en tu rendimiento académico.",
    "Para la organización de información, herramientas como Google Keep, Notion o Evernote permiten guardar notas, listas de tareas y recordatorios. Las apps de calendarios (Google Calendar) ayudan a planificar tareas y exámenes. Los procesadores de texto como Google Docs o LibreOffice Writer permiten crear documentos y colaborar en tiempo real.",
    "Para la comunicación escolar, el correo electrónico sigue siendo fundamental para comunicaciones formales. Plataformas como Google Classroom, Moodle o Microsoft Teams concentran las actividades escolares. Los chats grupales (WhatsApp, Telegram) son útiles para coordinación informal, aunque conviene mantener un tono respetuoso incluso en espacios informales.",
    "Para la búsqueda y verificación de información, Google Scholar es útil para artículos académicos. Wikipedia es un buen punto de partida pero no una fuente primaria. Las bibliotecas digitales (UNAM, CONACULTA) ofrecen acceso a libros y revistas verificados.",
    "Usarlas responsablemente implica citar correctamente las fuentes, no plagiar, proteger la privacidad de los compañeros y mantener separados los espacios de ocio y estudio.",
  ],
  objetivos: [
    "Elegir la categoría de herramienta que resuelve un encargo escolar concreto y explicar por qué las otras no.",
    "Decidir entre dos herramientas de la misma categoría a partir de la necesidad declarada, y comprobar que al cambiar la necesidad cambia la respuesta.",
    "Nombrar y archivar los trabajos con un criterio que permita encontrarlos tres semanas después.",
    "Ordenar los pasos de un trabajo escolar real y asignar la herramienta de cada paso.",
    "Escribir de memoria los términos del glosario de la progresión y completar el texto de las herramientas escolares.",
  ],
  materiales: [
    { nombre: "Un encargo escolar real", detalle: "La tarea concreta que hay que resolver: es ella la que decide la herramienta, no al revés.", icono: "fa-clipboard-list" },
    { nombre: "La necesidad declarada", detalle: "Sin internet, en equipo, recuperable, que se vea igual en cualquier pantalla: el criterio que desempata.", icono: "fa-scale-balanced" },
    { nombre: "Una convención de nombres", detalle: "Materia, tema, fecha AAAA-MM-DD y versión con número.", icono: "fa-tag" },
    { nombre: "Carpetas por materia", detalle: "La estructura que pide A5: una carpeta por cada materia del semestre.", icono: "fa-folder-tree" },
    { nombre: "Una copia fuera de tu computadora", detalle: "En la nube o en una memoria: el respaldo de A5.", icono: "fa-cloud-arrow-up" },
  ],
  conceptos: [
    { termino: "Categoría de herramienta", definicion: "Para qué sirve una herramienta, más allá de su marca: tomar notas, planificar, escribir, calcular, buscar, citar, presentar o respaldar." },
    { termino: "Necesidad declarada", definicion: "La condición concreta que desempata entre dos herramientas parecidas: sin internet, en equipo, recuperable, que se vea igual en cualquier pantalla." },
    { termino: "Buscador académico", definicion: "Buscador especializado en artículos y publicaciones revisadas por especialistas, distinto de un buscador general." },
    { termino: "Fuente primaria", definicion: "Fuente original de la información. Wikipedia no lo es: es un punto de partida, porque cualquiera puede editarla." },
    { termino: "Convención de nombres", definicion: "Acuerdo para nombrar archivos —materia, tema, fecha AAAA-MM-DD, versión— que hace que la lista se ordene sola." },
    { termino: "Versión", definicion: "Número que distingue un estado del archivo de los anteriores: v1, v2, v3, en lugar de «final definitiva»." },
    { termino: "Respaldo", definicion: "Copia del trabajo fuera de tu computadora, para no perderlo y para poder volver a una versión anterior." },
    { termino: "Flujo de trabajo", definicion: "Orden en que ocurren los pasos de un trabajo escolar, con la herramienta que le toca a cada paso." },
  ],
  glosario: [
    { termino: "Procesador de texto", definicion: "Programa para escribir y dar formato a documentos." },
    { termino: "Hoja de cálculo", definicion: "Programa para organizar datos en filas y columnas y hacer cálculos." },
    { termino: "Presentación electrónica", definicion: "Programa para crear diapositivas para exponer un tema." },
    { termino: "Respaldo (backup)", definicion: "Copia de seguridad de tus archivos para no perderlos." },
    { termino: "Plagio", definicion: "Usar el trabajo o ideas de otros sin dar crédito, presentándolo como propio." },
    { termino: "Buscador académico", definicion: "Buscador especializado en literatura académica y científica, útil para encontrar artículos revisados." },
  ],
  aplicaciones: [
    "A5 (verbatim), actividad final del glosario: «Crea una estructura de carpetas para organizar tus materias de este semestre.» Es la consigna que da pie al modo «Arregla el escritorio».",
    "A3 (verbatim): «Diseña tu 'kit de herramientas digitales para estudiar' basado en lo aprendido. Menciona al menos 4 herramientas (para organizar, comunicar, buscar información y crear). Explica para qué usarías cada una y por qué la elegiste.»",
    "Producto Integrador de Cultura Digital I (verbatim): el manifiesto de ciudadanía digital pide explicar «qué prácticas vas a cuidar (seguridad, ética, sostenibilidad, respeto) y por qué el acceso crítico al ciberespacio importa para ti y tu comunidad».",
  ],
  fuente: "CEN Bachillerato — Cultura Digital I, progresión 8 (CD-I-P08)",
};

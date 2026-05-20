/**
 * Seed de actividades pedagógicas para CH-I (Conciencia Histórica I).
 * 4 progresiones × 3 actividades = 12 actividades. estado='publicada'.
 * Tipos: lectura, quiz_multiple_opcion, reflexion_escrita,
 *        infografia, quiz_verdadero_falso,
 *        video_con_preguntas, debate_estructurado, glosario_interactivo
 * Uso: npx tsx scripts/seed-activities-chi.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🌱 Seed actividades CH-I — Coordenadas espacio-temporales, tiempo histórico, causalidad y fuentes\n");

  const progs = await getProgresionesDeUAC(sb, "CH-I");
  let ok = 0; let fail = 0;

  // 4 propósitos × 3 actividades = 12 total
  for (const p of progs) {
    const base = p.codigo;
    const n = p.numero;

    const a1ok = await upsertActividad(sb, {
      codigo: `${base}-A1`,
      titulo: titulos[n - 1].a1,
      descripcion: descripcionesA1[n - 1],
      tipo: tiposA1[n - 1],
      progresion_id: p.id,
      xp: 10,
      estado: "publicada",
      contenido: contenidosA1[n - 1],
    });
    a1ok ? ok++ : fail++;

    const a2ok = await upsertActividad(sb, {
      codigo: `${base}-A2`,
      titulo: titulos[n - 1].a2,
      descripcion: descripcionesA2[n - 1],
      tipo: tiposA2[n - 1],
      progresion_id: p.id,
      xp: 15,
      estado: "publicada",
      contenido: contenidosA2[n - 1],
    });
    a2ok ? ok++ : fail++;

    const a3ok = await upsertActividad(sb, {
      codigo: `${base}-A3`,
      titulo: titulos[n - 1].a3,
      descripcion: descripcionesA3[n - 1],
      tipo: tiposA3[n - 1],
      progresion_id: p.id,
      xp: 20,
      estado: "publicada",
      contenido: contenidosA3[n - 1],
    });
    a3ok ? ok++ : fail++;
  }

  log(`\n✅ CH-I: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── TÍTULOS ─────────────────────────────────────────────────────────────────────
const titulos = [
  {
    a1: "¿Dónde y cuándo ocurrió? Coordenadas espacio-temporales en la historia",
    a2: "Quiz: líneas del tiempo y periodización histórica",
    a3: "Reflexión: un evento de mi historia en el mapa del tiempo",
  },
  {
    a1: "El tiempo que medimos y el tiempo que sentimos: tipos de tiempo histórico",
    a2: "¿Verdadero o falso? Formas de medir el tiempo en la historia",
    a3: "Reflexión: ¿cómo mide el tiempo mi familia y mi comunidad?",
  },
  {
    a1: "Nada ocurre por una sola razón: multicausalidad en la historia",
    a2: "Quiz: causas estructurales, coyunturales y contingentes",
    a3: "Debate: ¿decisiones individuales o procesos estructurales mueven la historia?",
  },
  {
    a1: "Glosario: fuentes históricas y metodología",
    a2: "¿Verdadero o falso? Fuentes primarias, secundarias y su confiabilidad",
    a3: "Reflexión: analizo una fuente histórica de mi entorno",
  },
];

// ── DESCRIPCIONES ────────────────────────────────────────────────────────────────
const descripcionesA1 = [
  "Lectura introductoria sobre las coordenadas espacio-temporales como herramienta fundamental del pensamiento histórico.",
  "Infografía sobre los tres grandes tipos de tiempo histórico: cronológico, cíclico y subjetivo.",
  "Video analítico sobre la multicausalidad como método de comprensión de los procesos históricos.",
  "Glosario interactivo de los conceptos clave para identificar, clasificar y criticar fuentes históricas.",
];

const descripcionesA2 = [
  "Quiz de opción múltiple sobre líneas del tiempo, periodización y coordenadas históricas.",
  "Quiz de verdadero o falso sobre las distintas formas de conceptualizar y medir el tiempo histórico.",
  "Quiz de opción múltiple sobre tipos de causas históricas con ejemplos de la historia de México.",
  "Quiz de verdadero o falso sobre las características y el uso de fuentes primarias y secundarias.",
];

const descripcionesA3 = [
  "El estudiante ubica un evento significativo de su historia personal o familiar en coordenadas espacio-temporales.",
  "El estudiante compara cómo su familia y comunidad marcan el tiempo frente a los calendarios oficiales.",
  "Debate estructurado sobre si las grandes transformaciones históricas se deben a individuos o a procesos estructurales.",
  "El estudiante aplica criterios de confiabilidad a una fuente histórica concreta de su entorno cotidiano.",
];

// ── TIPOS ────────────────────────────────────────────────────────────────────────
const tiposA1 = ["lectura", "infografia", "video_con_preguntas", "glosario_interactivo"] as const;
const tiposA2 = ["quiz_multiple_opcion", "quiz_verdadero_falso", "quiz_multiple_opcion", "quiz_verdadero_falso"] as const;
const tiposA3 = ["reflexion_escrita", "reflexion_escrita", "debate_estructurado", "reflexion_escrita"] as const;

// ── A1 ──────────────────────────────────────────────────────────────────────────
const contenidosA1 = [
  { // P01 — lectura (Coordenadas espacio-temporales)
    titulo: "¿Dónde y cuándo? Las coordenadas espacio-temporales en la historia",
    texto: `La historia no ocurre en el vacío. Todo evento histórico sucede en algún lugar y en algún momento: tiene coordenadas espacio-temporales. Aprender a ubicar los hechos del pasado con precisión en el espacio y en el tiempo es una de las habilidades más básicas —y más poderosas— del pensamiento histórico.\n\nLa dimensión temporal nos pregunta cuándo ocurrió algo. Para responderla, los historiadores usan sistemas de datación: el calendario gregoriano, que es el más extendido hoy en el mundo occidental, organiza el tiempo en años antes y después de Cristo (a.C. y d.C.) y divide la historia en grandes períodos o eras. Así, la caída del Imperio Romano de Occidente (476 d.C.) marca convencionalmente el fin de la Antigüedad y el inicio de la Edad Media. En México, aprendemos que la Independencia se consumó en 1821, la Revolución inició en 1910 y que las civilizaciones mesoamericanas como Teotihuacán florecieron entre el 100 a.C. y el 650 d.C. Sin estas fechas, los hechos flotan sin ancla.\n\nLas líneas del tiempo son la herramienta visual clásica para organizar esa información. Una línea del tiempo puede ser general (toda la historia de la humanidad) o específica (solo la historia de México, o solo la historia de tu ciudad). Lo importante es que muestre relaciones: qué pasó antes, qué pasó después y, sobre todo, qué ocurrió al mismo tiempo en distintos lugares. Por ejemplo, mientras en México se construía Teotihuacán (siglos II-VII), en Europa el Imperio Romano alcanzaba su cenit y declinaba.\n\nLa dimensión espacial nos pregunta dónde ocurrió algo. Los mapas históricos son indispensables porque los territorios cambian: las fronteras se trazan y se borran, los nombres de las ciudades se modifican, los imperios se expanden y se contraen. El México de hoy no tiene las mismas fronteras que la Nueva España del siglo XVII ni que el Imperio Azteca del siglo XV. Un mapa histórico del valle de México en 1519 muestra el lago de Texcoco, Tenochtitlán y sus ciudades aliadas: un paisaje completamente diferente al de la Ciudad de México actual.\n\nCombinar ambas dimensiones —espacio y tiempo— es lo que permite construir una comprensión genuina del pasado. Los historiadores usan matrices espacio-temporales, mapas con líneas del tiempo integradas y sistemas de información geográfica histórica (SIG histórico) para analizar cómo los eventos se relacionan no solo en secuencia, sino también en distancia y contexto geográfico.`,
    fuente: "Material elaborado para CEN Bachillerato — CH-I. Ejemplos: INAH, SEP Historia de México.",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 12,
    preguntas_comprension: [
      {
        pregunta: "¿Qué son las coordenadas espacio-temporales de un evento histórico y por qué son importantes?",
        respuesta_guia: "Son el lugar (dónde) y el momento (cuándo) en que ocurrió un evento histórico. Son importantes porque sin ellas los hechos del pasado quedan descontextualizados: no podemos entender sus causas, consecuencias ni relación con otros eventos.",
      },
      {
        pregunta: "¿Qué información adicional aporta un mapa histórico comparado con un mapa geográfico actual?",
        respuesta_guia: "Un mapa histórico muestra cómo eran los territorios, fronteras, ciudades y paisajes en un momento pasado, que pueden ser muy diferentes al presente. Por ejemplo, el mapa del valle de México en 1519 muestra el lago de Texcoco y Tenochtitlán, un paisaje inexistente hoy.",
      },
      {
        pregunta: "¿Por qué es útil comparar lo que ocurría simultáneamente en distintos lugares del mundo?",
        respuesta_guia: "Porque permite descubrir conexiones, influencias mutuas y contextos globales: entender que Teotihuacán floreció mientras Roma decaía ayuda a relativizar la historia eurocéntrica y a comprender procesos civilizatorios paralelos.",
      },
      {
        pregunta: "Menciona un ejemplo concreto del texto donde cambiar la escala espacial o temporal cambia la comprensión de un evento.",
        respuesta_guia: "El texto señala que las fronteras de México han cambiado radicalmente: el Imperio Azteca, la Nueva España y el México actual tienen territorios distintos. Si solo miramos el mapa actual, malinterpretamos la geografía de los procesos históricos mesoamericanos o coloniales.",
      },
    ],
  },

  { // P02 — infografia (Tipos de tiempo histórico)
    titulo: "El tiempo en la historia: cronológico, cíclico y subjetivo",
    url_imagen: "/placeholder/infografia.svg",
    descripcion_accesible: "Infografía sobre los tres grandes tipos de tiempo histórico. El tiempo cronológico organiza eventos en secuencia lineal mediante calendarios y datación (gregoriano, maya, azteca). El tiempo cíclico concibe la historia como ciclos que se repiten, presente en cosmologías mesoamericanas y griegas. El tiempo subjetivo es el tiempo vivido y recordado: la memoria colectiva, la historia oral y la experiencia comunitaria del pasado.",
    puntos_clave: [
      "Tiempo cronológico: sistema lineal que organiza eventos en secuencia, del pasado al futuro. Herramientas: calendarios, datación (a.C./d.C.), eras geológicas e históricas, líneas del tiempo. El calendario gregoriano (base del sistema internacional actual) fue establecido en 1582 por el papa Gregorio XIII.",
      "Calendarios mesoamericanos: los pueblos mayas y aztecas desarrollaron sistemas calendáricos sofisticados. El Calendario Maya combina el Tzolk'in (260 días, ciclo ritual) y el Haab' (365 días, solar); su sincronización produce la Rueda Calendárica de 52 años. El Tonalpohualli azteca (260 días) y el Xiuhpohualli (365 días) funcionaban de modo similar.",
      "Tiempo cíclico: concepción del tiempo como ciclos que se repiten. En la cosmología nahuatl, la historia se organiza en 'Soles' (eras cósmicas): el mundo actual es el Quinto Sol, creado en Teotihuacán. Esta visión del tiempo implica que los grandes eventos —destrucción y creación— se repiten. Los griegos (con Platón y Polibio) también concibieron la historia como ciclos de regímenes políticos.",
      "Tiempo subjetivo: el tiempo tal como lo viven y recuerdan las personas y comunidades. No sigue la misma escala ni los mismos hitos que el tiempo cronológico oficial. Para una familia de migrantes, el año de su llegada a la ciudad es más significativo que cualquier fecha oficial; para una comunidad indígena, el ciclo de las fiestas patronales estructura el tiempo más que el calendario gregoriano.",
      "Memoria colectiva: concepto del sociólogo Maurice Halbwachs. Es el conjunto de recuerdos compartidos por un grupo social. La memoria colectiva selecciona, transforma y carga de significado el pasado desde las necesidades del presente. No es lo mismo que la historia académica, aunque se retroalimentan.",
      "Historia oral: metodología que recupera el tiempo subjetivo mediante testimonios directos. En México, ha sido fundamental para documentar la historia de comunidades indígenas, movimientos sociales y pueblos cuya historia no quedó registrada por escrito. Instituciones como el CIESAS y el INAH la practican sistemáticamente.",
      "¿Por qué importa reconocer los tres tipos? Porque la historia no es solo la secuencia de fechas del calendario gregoriano. Comprender que hay otras formas de medir y vivir el tiempo enriquece el análisis histórico y evita el sesgo de imponer una sola visión del tiempo sobre culturas y comunidades diversas.",
    ],
    fuente: "Material CEN Bachillerato — CH-I. Ref.: León-Portilla (1968), Florescano (2002), Halbwachs (1950).",
  },

  { // P03 — video_con_preguntas (Multicausalidad en historia)
    url_video: "https://example.com/video-pendiente-cen",
    titulo_video: "Nada ocurre por una sola razón: la multicausalidad en la historia de México",
    duracion_segundos: 480,
    preguntas: [
      {
        tiempo_segundos: 110,
        pregunta: "¿Qué diferencia hay entre una causa estructural, una causa coyuntural y una causa contingente? Da un ejemplo de cada una tomado de la Revolución Mexicana (1910).",
        respuesta_guia: "Causa estructural: condición de largo plazo que crea las condiciones del evento (ej. la concentración de tierras en haciendas y el empobrecimiento del campesinado durante el porfiriato). Causa coyuntural: situación de mediano plazo que detona la crisis (ej. la crisis económica de 1907-1908 y el descontento generalizado con Díaz). Causa contingente: elemento inmediato y no necesario que desencadena el evento (ej. la declaración de Díaz de que México estaba listo para la democracia en la entrevista Creelman de 1908, que animó a Madero a lanzar su candidatura).",
      },
      {
        tiempo_segundos: 290,
        pregunta: "¿Por qué los historiadores critican las explicaciones 'de un solo factor' en la historia? ¿Qué problema generan?",
        respuesta_guia: "Las explicaciones monocausales simplifican la realidad histórica y suelen servir a intereses ideológicos: culpar a un solo personaje, grupo o factor permite exonerar a otros y dificulta comprender los mecanismos reales del cambio social. Además, impiden aprender las lecciones estructurales de la historia porque hacen parecer que basta con 'eliminar al malo' para que todo mejore.",
      },
      {
        tiempo_segundos: 420,
        pregunta: "¿Cómo se aplica el análisis multicausal a la Conquista de México (1519-1521)? Identifica al menos una causa de cada tipo.",
        respuesta_guia: "Estructural: la fragmentación política del mundo mesoamericano y la existencia de pueblos sometidos por la Triple Alianza (como los tlaxcaltecas) que buscaban aliados contra los mexicas. Coyuntural: la llegada de los españoles coincidió con el fin de un ciclo calendárico y con el contexto de expansión europea impulsado por la Reconquista. Contingente: la coincidencia de la llegada de Cortés con el año Ce Ácatl (vinculado al regreso de Quetzalcóatl en algunas interpretaciones), que pudo haber influido en la recepción inicial de Moctezuma.",
      },
    ],
  },

  { // P04 — glosario_interactivo (Fuentes históricas y metodología)
    terminos: [
      {
        termino: "Fuente primaria",
        definicion: "Documento, objeto o testimonio producido en el momento o por actores directos del evento histórico que se estudia. Es evidencia de primera mano.",
        ejemplo: "La carta de relación que Hernán Cortés escribió al rey Carlos I en 1520 describiendo la conquista de México es una fuente primaria: fue producida por un protagonista en el momento del evento.",
        etiquetas: ["metodología histórica", "evidencia", "fuentes"],
      },
      {
        termino: "Fuente secundaria",
        definicion: "Texto o análisis producido por alguien que no vivió el evento directamente, generalmente un historiador que interpreta y analiza fuentes primarias para construir una explicación histórica.",
        ejemplo: "El libro 'Historia Verdadera de la Conquista de la Nueva España' de Bernal Díaz del Castillo, aunque escrito por un testigo, fue redactado décadas después; muchos libros de texto de historia son fuentes secundarias.",
        etiquetas: ["metodología histórica", "interpretación", "historiografía"],
      },
      {
        termino: "Fuente iconográfica",
        definicion: "Fuente histórica en forma de imagen: pinturas, esculturas, murales, fotografías, mapas ilustrados, códices o grabados que representan eventos, personas o condiciones del pasado.",
        ejemplo: "Los murales de Diego Rivera en el Palacio Nacional de México representan la historia prehispánica y la conquista; los códices como el Códice Mendoza son fuentes iconográficas mesoamericanas de primer orden.",
        etiquetas: ["fuentes", "imagen", "arte histórico"],
      },
      {
        termino: "Fuente oral",
        definicion: "Testimonio transmitido de forma hablada, ya sea mediante entrevistas a testigos o participantes, o a través de tradiciones orales, leyendas y mitos que guardan memoria histórica.",
        ejemplo: "Los corridos sobre la Revolución Mexicana son fuentes orales que preservaron la memoria de batallas, líderes y sufrimientos populares; las entrevistas a sobrevivientes del movimiento estudiantil de 1968 son fuentes orales directas.",
        etiquetas: ["historia oral", "memoria", "testimonio"],
      },
      {
        termino: "Fuente material",
        definicion: "Objeto físico fabricado o utilizado por personas del pasado: herramientas, armas, cerámica, edificios, textiles, monedas. La arqueología se basa principalmente en fuentes materiales.",
        ejemplo: "Las pirámides de Teotihuacán, las vasijas de obsidiana encontradas en Tula y las monedas coloniales españolas halladas en excavaciones del centro histórico de la Ciudad de México son fuentes materiales.",
        etiquetas: ["arqueología", "artefactos", "cultura material"],
      },
      {
        termino: "Testimonio",
        definicion: "Relato en primera persona de alguien que vivió o presenció un evento histórico. Puede ser oral (entrevista) o escrito (memorias, diarios, declaraciones judiciales).",
        ejemplo: "Los testimonios de sobrevivientes del Halconazo del 10 de junio de 1971 o de los campos de concentración del nazismo son ejemplos de testimonios históricos de alto valor pero que requieren análisis crítico por su subjetividad.",
        etiquetas: ["fuentes", "primera persona", "memoria colectiva"],
      },
      {
        termino: "Documento",
        definicion: "Registro escrito que contiene información sobre hechos, acuerdos, normas o eventos del pasado. Incluye leyes, actas, contratos, cartas, crónicas y cualquier texto producido con intención de registrar algo.",
        ejemplo: "El Acta de Independencia de México (1821), los registros del Archivo General de la Nación (AGN) o las actas parroquiales de bautismo del siglo XVII son documentos históricos.",
        etiquetas: ["registro escrito", "archivo", "fuentes primarias"],
      },
      {
        termino: "Archivo",
        definicion: "Institución o conjunto organizado de documentos históricos conservados sistemáticamente para su consulta y preservación. Los archivos son la base del trabajo de los historiadores.",
        ejemplo: "El Archivo General de la Nación (AGN) en México conserva más de 50 kilómetros lineales de documentos desde la época virreinal hasta el siglo XX; el Archivo General de Indias en Sevilla guarda documentos sobre la colonización española de América.",
        etiquetas: ["institución", "patrimonio documental", "preservación"],
      },
      {
        termino: "Confiabilidad de la fuente",
        definicion: "Grado en que una fuente histórica puede considerarse fidedigna, precisa e imparcial. Se evalúa considerando: quién la produjo, cuándo, con qué propósito, si el autor tenía acceso directo a los hechos y si hay contradicciones con otras fuentes.",
        ejemplo: "Una carta de Cortés al rey tiene alta confiabilidad para saber qué decía Cortés, pero baja confiabilidad como descripción objetiva de los hechos: su propósito era justificar sus acciones ante la Corona, lo que introduce sesgo evidente.",
        etiquetas: ["crítica histórica", "sesgo", "evaluación de fuentes"],
      },
      {
        termino: "Crítica histórica",
        definicion: "Método sistemático para evaluar y verificar las fuentes históricas. Se divide en crítica externa (autenticidad del documento: ¿es original? ¿fue modificado?) y crítica interna (credibilidad del contenido: ¿es verosímil? ¿es coherente con otras fuentes?).",
        ejemplo: "Cuando historiadores detectaron que el 'Testamento de Colón' era una falsificación del siglo XIX, aplicaron crítica externa (análisis del papel, la tinta y la escritura). Cuando comparan relatos contradictorios de la Noche Triste (1520) entre Cortés y Bernal Díaz, aplican crítica interna.",
        etiquetas: ["metodología", "verificación", "autenticidad"],
      },
    ],
  },
];

// ── A2 ──────────────────────────────────────────────────────────────────────────
const contenidosA2 = [
  { // P01 — quiz_multiple_opcion (Coordenadas históricas, líneas del tiempo, periodización)
    preguntas: [
      {
        enunciado: "¿Cuál es la función principal de una línea del tiempo en el estudio de la historia?",
        opciones: [
          "Decorar los libros de texto con ilustraciones cronológicas",
          "Organizar eventos en secuencia temporal para visualizar relaciones de anterioridad, posterioridad y simultaneidad",
          "Demostrar que la historia avanza siempre hacia el progreso",
          "Reemplazar los mapas geográficos en el análisis histórico",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "La línea del tiempo es una herramienta de organización visual que permite ver qué ocurrió antes y después de cada evento, y especialmente qué sucedía al mismo tiempo en distintos lugares, revelando conexiones y contextos que el texto lineal no muestra.",
      },
      {
        enunciado: "¿Qué significa que un evento ocurrió en el siglo XVI según el calendario gregoriano?",
        opciones: [
          "Que ocurrió entre los años 1500 y 1600",
          "Que ocurrió entre los años 1501 y 1600",
          "Que ocurrió hace exactamente 1600 años",
          "Que ocurrió entre los años 1600 y 1700",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "El siglo XVI comprende los años 1501 a 1600 (no 1500-1600, porque no existió el año 0 en el calendario gregoriano). La conquista de México (1519-1521) ocurrió en el siglo XVI.",
      },
      {
        enunciado: "Un historiador analiza simultáneamente lo que ocurría en el Imperio Azteca y en Europa en el año 1500. ¿Qué dimensión del análisis histórico está aplicando?",
        opciones: [
          "Solo la dimensión temporal",
          "Solo la dimensión espacial",
          "La dimensión espacio-temporal combinada: eventos paralelos en distintos lugares",
          "La dimensión causal: busca quién causó los eventos europeos en América",
        ],
        respuesta_correcta: 2,
        retroalimentacion: "Comparar lo que ocurría simultáneamente en distintos lugares del mundo es la aplicación de la dimensión espacio-temporal combinada. Permite contextualizar eventos locales en un marco global y descubrir conexiones o influencias recíprocas.",
      },
      {
        enunciado: "¿Por qué los mapas históricos son diferentes de los mapas geográficos actuales?",
        opciones: [
          "Porque los mapas históricos son siempre menos precisos debido a la tecnología antigua",
          "Porque muestran cómo eran los territorios, fronteras y paisajes en un momento pasado, que pueden diferir radicalmente del presente",
          "Porque solo muestran batallas y guerras, no geografía",
          "Porque los mapas históricos siempre están dibujados a mano y son decorativos",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "Los mapas históricos reflejan la configuración territorial de una época específica. Las fronteras de México han cambiado enormemente desde el Imperio Azteca, la Nueva España y el México independiente. Un mapa del siglo XV muestra el lago de Texcoco y Tenochtitlán donde hoy está la Ciudad de México.",
      },
      {
        enunciado: "La periodización histórica (dividir el pasado en períodos como Antigüedad, Edad Media, Modernidad, etc.) es:",
        opciones: [
          "Una descripción objetiva y neutral de cómo el tiempo se divide naturalmente",
          "Una convención interpretativa que los historiadores construyen; otras culturas pueden tener periodizaciones distintas",
          "Una clasificación biológica de las civilizaciones humanas",
          "Un sistema universal que todas las culturas del mundo reconocen por igual",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "La periodización es una construcción interpretativa, no una división 'natural' del tiempo. La clásica periodización eurocéntrica (Antigüedad-Medievo-Modernidad) no aplica igual para la historia de México o de Asia. Los historiadores debaten constantemente qué eventos marcan el inicio o fin de un período.",
      },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },

  { // P02 — quiz_verdadero_falso (Tipos de tiempo histórico)
    preguntas: [
      {
        enunciado: "El calendario gregoriano es el único sistema de datación que ha existido en la historia de la humanidad.",
        respuesta: false,
        retroalimentacion: "Falso. Han existido y coexisten múltiples sistemas calendáricos: el calendario maya (con el Tzolk'in de 260 días y el Haab' de 365 días), el Tonalpohualli y Xiuhpohualli aztecas, el calendario hebreo, el islámico (Hégira), el chino, el juliano (precedente del gregoriano), entre otros.",
      },
      {
        enunciado: "El tiempo cíclico, presente en la cosmología nahuatl, concibe la historia organizada en 'Soles' o eras cósmicas que se destruyen y renacen.",
        respuesta: true,
        retroalimentacion: "Correcto. Según la cosmología nahuatl, el mundo ha pasado por cuatro Soles (eras cósmicas destruidas) y el actual es el Quinto Sol, creado en Teotihuacán. Esta visión cíclica del tiempo es fundamentalmente diferente a la concepción lineal del tiempo occidental moderno.",
      },
      {
        enunciado: "La memoria colectiva, según Maurice Halbwachs, es idéntica a la historia académica porque ambas registran el mismo pasado.",
        respuesta: false,
        retroalimentacion: "Falso. La memoria colectiva es la reconstrucción del pasado desde las necesidades e identidades del presente de un grupo social; selecciona, enfatiza y transforma los recuerdos. La historia académica busca distancia crítica y contraste de fuentes. Son distintas formas de relacionarse con el pasado, aunque se influyen mutuamente.",
      },
      {
        enunciado: "El tiempo subjetivo puede variar entre comunidades: para una familia, el año de su migración a la ciudad puede ser más significativo como referencia temporal que cualquier fecha oficial.",
        respuesta: true,
        retroalimentacion: "Correcto. El tiempo subjetivo es el tiempo vivido y recordado desde la experiencia personal y comunitaria. Los hitos que marcan 'antes' y 'después' en la memoria de una familia o comunidad no coinciden necesariamente con las fechas de la historia oficial.",
      },
      {
        enunciado: "La historia oral es una metodología irrelevante para el estudio de la historia porque los testimonios son subjetivos y poco confiables.",
        respuesta: false,
        retroalimentacion: "Falso. La historia oral es una metodología valiosa, especialmente para recuperar la historia de comunidades que no dejaron registros escritos. En México ha sido fundamental para documentar historias indígenas, movimientos sociales y experiencias cotidianas. Su subjetividad no la invalida; requiere análisis crítico como cualquier otra fuente.",
      },
      {
        enunciado: "El Calendario Maya es relevante solo como curiosidad arqueológica; no tiene relación con la forma en que algunas comunidades indígenas actuales organizan su vida ritual y social.",
        respuesta: false,
        retroalimentacion: "Falso. En comunidades mayas de México y Guatemala, el calendario Tzolk'in de 260 días sigue siendo utilizado para rituales, curaciones y la definición del destino de las personas según su día de nacimiento. El tiempo calendárico mesoamericano es una tradición viva, no solo un artefacto del pasado.",
      },
    ],
    intentos_maximos: 2,
    puntaje_minimo_aprobacion: 70,
  },

  { // P03 — quiz_multiple_opcion (Multicausalidad: causas estructurales, coyunturales, contingentes)
    preguntas: [
      {
        enunciado: "¿Cuál de las siguientes es un ejemplo de causa ESTRUCTURAL de la Revolución Mexicana (1910)?",
        opciones: [
          "La declaración de Díaz en la entrevista Creelman de 1908 de que México estaba listo para la democracia",
          "La crisis económica internacional de 1907-1908 que empeoró las condiciones de vida en México",
          "La concentración de tierras en grandes haciendas y el despojo sistemático de tierras comunales indígenas durante décadas de porfiriato",
          "El asesinato de Francisco I. Madero en 1913 por Victoriano Huerta",
        ],
        respuesta_correcta: 2,
        retroalimentacion: "Las causas estructurales son condiciones de largo plazo que crean las tensiones que eventualmente desembocan en un evento histórico. La concentración de tierras y el despojo campesino durante todo el porfiriato (1876-1910) son causas estructurales: crearon condiciones de desigualdad extrema que hacían probable alguna forma de conflicto.",
      },
      {
        enunciado: "Una causa CONTINGENTE de un evento histórico es:",
        opciones: [
          "La condición más importante y que explica mejor el evento",
          "Un elemento inmediato y no necesariamente inevitable que desencadena el evento en ese momento específico, aunque las condiciones estructurales ya existieran",
          "La causa económica de cualquier evento histórico",
          "Una causa que los historiadores no pueden investigar porque es demasiado reciente",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "Las causas contingentes son elementos inmediatos, a menudo azarosos, que activan un proceso que ya tenía condiciones previas (estructurales y coyunturales). Sin ellas, el evento podría haber ocurrido más tarde, de forma distinta, o quizás no haber ocurrido así. No son 'la causa principal', sino el detonador específico.",
      },
      {
        enunciado: "¿Por qué la multicausalidad es un principio metodológico importante en la historia?",
        opciones: [
          "Porque demuestra que todos los factores tienen exactamente el mismo peso en cualquier evento",
          "Porque complica innecesariamente el análisis; es mejor buscar siempre la causa única más importante",
          "Porque la realidad histórica es compleja y los eventos suelen resultar de la combinación de múltiples factores de distinto tipo y alcance temporal",
          "Porque es obligatorio mencionar al menos diez causas para que un análisis histórico sea válido",
        ],
        respuesta_correcta: 2,
        retroalimentacion: "La multicausalidad reconoce que los grandes eventos históricos no tienen una sola causa sino varias, de distinto tipo (estructurales, coyunturales, contingentes) y con diferente peso relativo. Este principio previene explicaciones simplistas que sirven a intereses ideológicos o que impiden aprender las lecciones reales del pasado.",
      },
      {
        enunciado: "¿Cuál de las siguientes afirmaciones sobre la Independencia de México (1810-1821) ejemplifica mejor el pensamiento multicausal?",
        opciones: [
          "La Independencia de México se debió exclusivamente a que Miguel Hidalgo tocó la campana el 16 de septiembre de 1810",
          "La Independencia fue resultado del heroísmo de unos pocos líderes patriotas que decidieron liberarse de España",
          "La Independencia combinó causas estructurales (desigualdad colonial, Ilustración), coyunturales (invasión napoleónica a España, crisis de la monarquía) y contingentes (la conspiración descubierta en Querétaro que obligó a Hidalgo a adelantar el levantamiento)",
          "La Independencia fue causada únicamente por la influencia de la Revolución Francesa en las ideas de las élites criollas",
        ],
        respuesta_correcta: 2,
        retroalimentacion: "El análisis multicausal identifica causas de distintos tipos y alcances: la Ilustración y la desigualdad colonial (estructurales, de largo plazo); la crisis de la monarquía española por Napoleón (coyuntural, de mediano plazo); y la conspiración descubierta que obligó a actuar antes de lo planeado (contingente, inmediata). Ninguna por sí sola explica el proceso.",
      },
      {
        enunciado: "Según el análisis multicausal, ¿qué diferencia hay entre la causa que 'creó las condiciones' para la Conquista de México y la causa que 'desencadenó' el proceso en 1519?",
        opciones: [
          "No hay diferencia; todas las causas son igualmente inmediatas",
          "La causa que 'creó las condiciones' es estructural (ej. la fragmentación política mesoamericana y pueblos sometidos como los tlaxcaltecas); la que 'desencadenó' es contingente (ej. la llegada de Cortés con aliados estratégicos en el momento preciso)",
          "La única causa real de la Conquista fue la superioridad tecnológica española (armas, caballos)",
          "Las causas estructurales siempre son más importantes que las contingentes y siempre deben mencionarse primero",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "Las causas estructurales (la división política mesoamericana, el resentimiento de pueblos bajo dominio mexica) crearon condiciones que hacían posible —pero no inevitable— una conquista. Las causas contingentes (la llegada de Cortés, sus decisiones estratégicas, las alianzas forjadas con tlaxcaltecas y otros pueblos) determinaron que ocurriera así y en ese momento.",
      },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },

  { // P04 — quiz_verdadero_falso (Fuentes primarias, secundarias, confiabilidad)
    preguntas: [
      {
        enunciado: "Una fotografía tomada durante la Revolución Mexicana en 1914 es siempre una fuente primaria objetiva que muestra la realidad tal como fue.",
        respuesta: false,
        retroalimentacion: "Falso en dos aspectos. Primero, sí es una fuente primaria (producida en el momento del evento), pero no es necesariamente objetiva: el fotógrafo elige el encuadre, el momento y el sujeto, introduciendo perspectiva e intención. Muchas fotografías revolucionarias fueron posadas o seleccionadas para crear una imagen específica del conflicto.",
      },
      {
        enunciado: "El Archivo General de la Nación (AGN) de México conserva documentos históricos desde la época virreinal que los investigadores pueden consultar.",
        respuesta: true,
        retroalimentacion: "Correcto. El AGN es el principal repositorio documental de México, con más de 50 kilómetros lineales de documentos que abarcan desde los siglos XVI al XX. Es una fuente primaria institucional fundamental para la investigación histórica sobre México.",
      },
      {
        enunciado: "Un libro de texto de historia de bachillerato es una fuente primaria porque fue escrito por historiadores especializados.",
        respuesta: false,
        retroalimentacion: "Falso. Un libro de texto es una fuente secundaria: es una obra de interpretación y síntesis producida por alguien que no vivió los eventos que describe, basada en fuentes primarias y otras fuentes secundarias. Que sea escrito por especialistas no lo convierte en primario.",
      },
      {
        enunciado: "Al evaluar la confiabilidad de una fuente histórica, es importante considerar quién la produjo, con qué propósito y si tenía acceso directo a los hechos.",
        respuesta: true,
        retroalimentacion: "Correcto. La crítica histórica siempre analiza el origen y el contexto de producción de una fuente: el autor, su posición social y política, su propósito al producirla y su acceso a la información. Una carta de un virrey al rey de España tiene diferente confiabilidad para entender la vida de los indígenas que el testimonio de un fraile que convivió con ellos.",
      },
      {
        enunciado: "Los códices mesoamericanos como el Códice Mendoza son fuentes iconográficas que contienen información histórica, tributaria y calendárica de las culturas prehispánicas.",
        respuesta: true,
        retroalimentacion: "Correcto. El Códice Mendoza, elaborado hacia 1541 por encargo del virrey Antonio de Mendoza, contiene registros tributarios del Imperio Azteca, listas de conquistas y escenas de vida cotidiana. Es una fuente iconográfica de gran valor histórico, aunque fue producida después de la Conquista bajo supervisión española.",
      },
      {
        enunciado: "La crítica externa de una fuente histórica consiste en analizar si el contenido del documento es verosímil y coherente con otras fuentes.",
        respuesta: false,
        retroalimentacion: "Falso. La crítica EXTERNA analiza la autenticidad material del documento: ¿es original o es una copia tardía? ¿El papel, la tinta y la escritura corresponden a la época declarada? ¿Fue alterado o falsificado? La crítica INTERNA es la que evalúa la verosimilitud y coherencia del contenido.",
      },
    ],
    intentos_maximos: 2,
    puntaje_minimo_aprobacion: 70,
  },
];

// ── A3 ──────────────────────────────────────────────────────────────────────────
const contenidosA3 = [
  { // P01 — reflexion_escrita (Evento personal en el mapa del tiempo)
    prompt: "Piensa en un evento significativo de tu historia personal o familiar: puede ser una mudanza, el nacimiento de un hermano, la muerte de un abuelo, el momento en que tus padres o abuelos emigraron a otra ciudad o región, una crisis económica que afectó a tu familia, o cualquier otro acontecimiento que haya dividido tu historia en 'antes' y 'después'.\n\nUbica ese evento en coordenadas espacio-temporales: ¿cuándo ocurrió (año, período de tu vida, época histórica general)? ¿dónde ocurrió (ciudad, región, estado)? ¿Qué estaba pasando en México y en el mundo en ese mismo momento? Conecta ese evento personal con al menos un proceso histórico más amplio que ocurría al mismo tiempo (puede ser una crisis económica, un cambio de gobierno, una pandemia, una migración masiva, etc.).",
    pistas: [
      "Si el evento fue reciente (últimos 10 años), piensa qué pasaba en México: ¿hubo crisis económica, pandemia de COVID, sismo, elecciones importantes?",
      "Si el evento fue hace más tiempo (30-50 años), investiga qué ocurría entonces: ¿el terremoto de 1985? ¿la crisis de 1994? ¿el movimiento estudiantil de 1968?",
      "La ubicación espacial también importa: ¿ocurrió en una zona rural o urbana? ¿en una ciudad fronteriza, costera, del centro? El lugar condiciona la experiencia.",
      "No tienes que revelar algo muy íntimo si no quieres; puedes usar el evento de un familiar sin identificarlo directamente.",
    ],
    longitud_minima_palabras: 80,
    criterios_evaluacion: [
      "Identifica un evento personal o familiar concreto y lo ubica con precisión temporal (año o período aproximado)",
      "Lo ubica en un espacio geográfico específico",
      "Lo conecta con al menos un proceso histórico más amplio (local, nacional o global) que ocurría al mismo tiempo",
      "Reflexiona sobre cómo el contexto histórico más amplio influyó o se relacionó con el evento personal",
    ],
  },

  { // P02 — reflexion_escrita (Tiempo de la familia vs. calendarios oficiales)
    prompt: "Aprendiste que existen distintas formas de medir y vivir el tiempo: el tiempo cronológico oficial (con sus fechas y calendarios), el tiempo cíclico (con sus rituales y repeticiones) y el tiempo subjetivo (el tiempo vivido y recordado por personas y comunidades).\n\nReflexiona sobre cómo mide y organiza el tiempo tu familia o comunidad: ¿hay fechas o momentos que se repiten cada año y que todos esperan o recuerdan (fiestas familiares, aniversarios, festividades religiosas o comunitarias, la fecha de siembra o cosecha si son de zona rural)? ¿Algún miembro de tu familia o comunidad conoce o practica algún calendario indígena, como el Tonalpohualli azteca o el Tzolk'in maya? ¿Hay alguna fecha del calendario oficial que en tu familia tenga un significado completamente distinto al que marca la historia oficial? Argumenta: ¿cuál de los tres tipos de tiempo (cronológico, cíclico, subjetivo) domina más la vida cotidiana de tu familia o comunidad?",
    pistas: [
      "Piensa en el Día de Muertos: es un buen ejemplo de tiempo cíclico que combina tradición mesoamericana con el calendario cristiano.",
      "¿Hay alguna fecha que en tu familia marque 'antes' y 'después' que NO es una fecha histórica oficial (como el año en que alguien emigró, o cuando nació el primer hijo)?",
      "Si eres de origen indígena o conoces comunidades indígenas, piensa si las fiestas del pueblo siguen un calendario ritual propio.",
      "No hay respuesta incorrecta: lo importante es que conectes tu experiencia personal con los conceptos que estudiaste.",
    ],
    longitud_minima_palabras: 80,
    criterios_evaluacion: [
      "Identifica al menos una práctica concreta de su familia o comunidad que refleje una forma de medir o vivir el tiempo",
      "Conecta esa práctica con al menos uno de los tres tipos de tiempo histórico estudiados (cronológico, cíclico, subjetivo)",
      "Reflexiona sobre si hay tensión o diferencia entre el tiempo de su comunidad y el calendario oficial",
      "Argumenta de forma razonada cuál tipo de tiempo predomina en su vida cotidiana",
    ],
  },

  { // P03 — debate_estructurado (Causalidad histórica: individuos vs. estructuras)
    tema: "¿Las grandes transformaciones históricas son resultado de decisiones individuales o de procesos estructurales?",
    posturas: [
      "Las grandes transformaciones históricas son principalmente resultado de procesos estructurales que ningún individuo controla ni genera por sí solo",
      "Los individuos excepcionales y sus decisiones son el motor principal de las grandes transformaciones históricas",
    ],
    argumentos_guia: {
      "Las grandes transformaciones históricas son principalmente resultado de procesos estructurales que ningún individuo controla ni genera por sí solo": [
        "La Revolución Mexicana de 1910 ya tenía condiciones estructurales maduras (desigualdad, despojo de tierras, concentración del poder) antes de que Madero o Zapata tomaran cualquier decisión: si no hubieran existido ellos, el conflicto habría surgido de otra forma y con otros líderes.",
        "La Conquista de México (1519-1521) no puede explicarse solo por el 'genio militar' de Cortés: sin la fragmentación política mesoamericana, los pueblos aliados que se sumaron contra los mexicas y las enfermedades europeas (causas estructurales), el resultado habría sido completamente diferente.",
        "Fenómenos como la Independencia, la Reforma o la globalización económica obedecen a procesos de largo plazo que ningún individuo inicia solo: son resultado de cambios en la economía, la demografía, la tecnología y las ideas que trascienden a cualquier persona.",
        "Cuando un líder muere o fracasa, la estructura produce nuevos líderes que continúan el proceso: Zapata fue asesinado en 1919 pero el agrarismo continuó porque respondía a una demanda estructural profunda de millones de campesinos.",
        "La historia contrafactual muestra que si quitamos a los individuos 'clave', los procesos estructurales habrían producido resultados similares, aunque diferentes en detalle o timing.",
      ],
      "Los individuos excepcionales y sus decisiones son el motor principal de las grandes transformaciones históricas": [
        "Sin Hidalgo tocando la campana el 16 de septiembre de 1810 en ese momento específico, la conspiración habría sido descubierta y aplastada; las condiciones estructurales existían pero la Independencia podría haberse postergado décadas.",
        "Las decisiones de Lázaro Cárdenas de expropiar el petróleo en 1938 no eran estructuralmente inevitables: otros presidentes habían evitado el conflicto con las empresas extranjeras; fue la voluntad política individual de Cárdenas la que determinó ese momento histórico.",
        "Figuras como Nelson Mandela, Gandhi o Emiliano Zapata transformaron no solo la política sino la conciencia colectiva de sus pueblos: su liderazgo, ejemplo moral y capacidad de articular demandas populares fue irreductible a condiciones estructurales.",
        "La historia está llena de condiciones estructurales que NO produjeron transformaciones porque faltaron individuos que las articularan y las convirtieran en acción política: las condiciones para la Reforma (1855-1861) existían antes, pero fue Juárez quien las convirtió en programa de gobierno.",
      ],
    },
    reglas: [
      "Cada participante debe defender una postura con argumentos basados en ejemplos históricos concretos, no solo en opiniones abstractas.",
      "Se deben usar al menos dos ejemplos de la historia de México en la argumentación.",
      "Está prohibido descalificar al oponente; solo se pueden refutar sus argumentos con contraargumentos históricos.",
      "Al finalizar, cada participante debe reconocer al menos un punto válido de la postura contraria (síntesis dialéctica).",
    ],
    criterios_evaluacion: [
      "Usa al menos dos ejemplos históricos concretos y correctos para sostener su postura",
      "Demuestra comprensión de la diferencia entre causas estructurales, coyunturales y contingentes",
      "Reconoce la complejidad del debate y formula al menos un matiz o limitación de su propia postura",
    ],
    modalidad: "escrito",
  },

  { // P04 — reflexion_escrita (Analizo una fuente histórica de mi entorno)
    prompt: "Elige una fuente histórica de tu entorno cotidiano. Puede ser:\n- Una fotografía familiar antigua\n- Un artículo de periódico o noticia de los últimos años\n- Una publicación en redes sociales sobre un evento histórico o reciente\n- Un corrido, una canción popular o un mural en tu comunidad\n- Un objeto antiguo que perteneció a alguien de tu familia\n\nAplica los criterios de confiabilidad y crítica histórica que aprendiste en el glosario. Responde: ¿quién produjo esa fuente? ¿cuándo y dónde? ¿con qué propósito? ¿a qué tipo de fuente pertenece (primaria/secundaria, iconográfica, oral, material, documental)? ¿Qué información nos da? ¿Qué información nos oculta o sesga? ¿En qué grado la considerarías confiable y por qué?",
    pistas: [
      "Una fotografía familiar es una fuente primaria iconográfica: muestra un momento real, pero solo muestra lo que el fotógrafo decidió fotografiar.",
      "Una publicación en redes sociales puede ser primaria (si es el testimonio directo de alguien que vivió el evento) o secundaria (si alguien comparte información que leyó en otro lado).",
      "El propósito de una fuente siempre importa: una noticia de periódico tiene diferentes sesgos según si es un periódico independiente, oficial o de partido.",
      "No hay fuente completamente neutral: todas tienen perspectiva. Eso no las invalida; las hace más interesantes para analizar.",
    ],
    longitud_minima_palabras: 80,
    criterios_evaluacion: [
      "Identifica y describe una fuente histórica concreta de su entorno con suficiente detalle",
      "La clasifica correctamente (tipo de fuente: primaria/secundaria, iconográfica, oral, material, documental)",
      "Aplica al menos dos criterios de confiabilidad histórica (autor, propósito, acceso a los hechos, coherencia con otras fuentes)",
      "Reflexiona sobre qué oculta o sesga la fuente, no solo qué muestra",
    ],
  },
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });

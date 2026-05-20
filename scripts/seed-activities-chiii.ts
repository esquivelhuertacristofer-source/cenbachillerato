/**
 * Seed de actividades pedagógicas para CH-III (Conciencia Histórica III, Semestre 6).
 * 4 propósitos × 3 actividades = 12 actividades. estado='publicada'.
 * Tipos: lectura, video_con_preguntas, lectura, infografia,
 *        quiz_multiple_opcion, quiz_verdadero_falso, quiz_multiple_opcion, quiz_verdadero_falso,
 *        reflexion_escrita, debate_estructurado, reflexion_escrita, autoevaluacion
 * Uso: npx tsx scripts/seed-activities-chiii.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🌱 Seed actividades CH-III — Narrativa histórica argumentada y comunicación histórica\n");

  const progs = await getProgresionesDeUAC(sb, "CH-III");
  let ok = 0; let fail = 0;

  for (const p of progs) {
    const base = p.codigo;
    const n = p.numero;

    const a1ok = await upsertActividad(sb, {
      codigo: `${base}-A1`,
      titulo: titulos[n - 1].a1,
      descripcion: "Introducción conceptual al propósito formativo.",
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
      descripcion: "Práctica de verificación y consolidación conceptual.",
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
      descripcion: "Aplicación crítica y cierre del propósito formativo.",
      tipo: tiposA3[n - 1],
      progresion_id: p.id,
      xp: 20,
      estado: "publicada",
      contenido: contenidosA3[n - 1],
    });
    a3ok ? ok++ : fail++;
  }

  log(`\n✅ CH-III: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── TÍTULOS ─────────────────────────────────────────────────────────────────────
const titulos = [
  {
    a1: "¿Cómo evaluar una fuente histórica? Criterios y procedimientos para el análisis crítico",
    a2: "¿Cuánto sabes sobre tipos de fuentes históricas y criterios de evaluación?",
    a3: "Reflexión: análisis crítico de una fuente histórica sobre la Revolución Mexicana",
  },
  {
    a1: "Corroboración de fuentes: cómo los historiadores verifican la evidencia",
    a2: "¿Verdadero o falso? Triangulación, análisis documental e iconográfico",
    a3: "Debate: ¿Los testimonios orales tienen la misma validez que los documentos escritos?",
  },
  {
    a1: "La narrativa histórica argumentada: tesis, evidencias y perspectivas múltiples",
    a2: "¿Cuánto sabes sobre estructura narrativa histórica y perspectivas históricas?",
    a3: "Reflexión: elaborar una narrativa argumentada sobre un evento histórico mexicano del siglo XX",
  },
  {
    a1: "Comunicar la historia: del ensayo académico a la divulgación pública",
    a2: "¿Verdadero o falso? Historiografía, escuelas históricas y divulgación histórica",
    a3: "Autoevaluación: ¿qué tan efectivo soy comunicando mis interpretaciones históricas?",
  },
];

// ── TIPOS ────────────────────────────────────────────────────────────────────────
const tiposA1 = ["lectura", "video_con_preguntas", "lectura", "infografia"] as const;
const tiposA2 = ["quiz_multiple_opcion", "quiz_verdadero_falso", "quiz_multiple_opcion", "quiz_verdadero_falso"] as const;
const tiposA3 = ["reflexion_escrita", "debate_estructurado", "reflexion_escrita", "autoevaluacion"] as const;

// ── A1 ──────────────────────────────────────────────────────────────────────────
const contenidosA1 = [
  { // P01 — lectura (evaluación de fuentes históricas: criterios y procedimientos)
    titulo: "¿Cómo evaluar una fuente histórica? Criterios y procedimientos para el análisis crítico",
    texto: "Cada vez que un historiador trabaja con una fuente —ya sea un documento escrito, una fotografía, un mapa, un objeto material o un testimonio oral— se enfrenta a una pregunta fundamental: ¿puedo confiar en esta evidencia y qué me dice realmente sobre el pasado?\n\nLas fuentes históricas se clasifican clásicamente en primarias y secundarias. Las fuentes primarias son las producidas en el momento del evento o por actores directos del período estudiado: documentos originales (decretos, cartas, actas), objetos materiales (herramientas, edificios, monedas), testimonios orales de protagonistas y fuentes iconográficas (fotografías, pinturas, mapas). Las fuentes secundarias son interpretaciones elaboradas posteriormente: libros de historia, artículos académicos, enciclopedias. Las fuentes terciarias recopilan fuentes secundarias: bibliografías, bases de datos.\n\nLas fuentes iconográficas merecen atención especial. Una fotografía no es un registro neutro de la realidad: es una selección del fotógrafo, condicionada por su posición, sus intenciones y la tecnología disponible. El archivo Casasola, que documentó la Revolución Mexicana en miles de fotografías, es una fuente primaria invaluable, pero al analizarlo debemos preguntarnos: ¿quién fue fotografiado y quién fue omitido? ¿Qué imágenes circularon y cuáles se archivaron? Los mapas históricos también son fuentes iconográficas: un mapa colonial del siglo XVI refleja la visión europea del territorio americano y sus intereses de dominación, no solo la geografía objetiva.\n\nPara evaluar cualquier fuente histórica, los historiadores aplican cinco criterios fundamentales. El primero es la autoría: ¿quién la produjo? ¿Era testigo directo o se basó en otros testimonios? ¿Tiene credenciales para saber lo que afirma? El segundo es la fecha: ¿cuándo fue producida? ¿Es contemporánea al evento o fue elaborada mucho después? La distancia temporal puede amplificar sesgos o fallas de memoria. El tercero es la intención: ¿para qué fue producida? Una carta personal tiene una intención diferente a un decreto oficial o un panfleto de propaganda. El cuarto es la audiencia: ¿para quién fue hecha? Un documento producido para el público masivo es diferente a uno producido para uso interno del Estado. El quinto es el contexto: ¿en qué circunstancias históricas, políticas y sociales fue producida?\n\nNinguna fuente histórica es neutral. Todas reflejan la perspectiva, los intereses y los límites del conocimiento de quien las produjo. Este es el concepto de sesgo: no significa que la fuente sea falsa, sino que representa un punto de vista particular sobre los eventos. Identificar el sesgo no invalida la fuente; al contrario, permite usarla críticamente, extrayendo información sobre tanto los eventos narrados como sobre quien los narra y desde qué posición.\n\nEn México, los principales repositorios de fuentes históricas primarias son el AGN (Archivo General de la Nación), que conserva documentos desde la época virreinal hasta el siglo XX; el INAH (Instituto Nacional de Antropología e Historia), que custodia patrimonio arqueológico y documentos coloniales; y la Hemeroteca Nacional Digital de México (HNDM), que ofrece acceso en línea a periódicos históricos desde el siglo XIX.\n\nEs fundamental distinguir entre dos operaciones diferentes del análisis histórico: evaluar una fuente y interpretar una fuente. Evaluar una fuente es preguntarse si es confiable, auténtica y representativa del período que estudia. Interpretar una fuente es preguntarse qué nos dice sobre el pasado: qué información aporta, qué silencia y qué nos revela sobre las mentalidades, relaciones de poder y prácticas sociales de la época. Un historiador riguroso siempre evalúa antes de interpretar.",
    fuente: "Material CEN Bachillerato — CH-III. Ref.: AGN, INAH, HNDM; Topolsky, 1998; Cardoso y Brignoli, 1984.",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 13,
    preguntas_comprension: [
      {
        pregunta: "¿Cuáles son los cinco criterios para evaluar una fuente histórica y qué pregunta responde cada uno?",
        respuesta_guia: "Los cinco criterios son: (1) Autoría — ¿quién la produjo y era testigo directo?; (2) Fecha — ¿cuándo fue producida y qué tan cercana es al evento?; (3) Intención — ¿para qué fue producida (propaganda, documento oficial, uso personal)?; (4) Audiencia — ¿para quién fue hecha (uso interno del Estado, público masivo, uso privado)?; (5) Contexto — ¿en qué circunstancias históricas, políticas y sociales se produjo? Cada criterio ayuda a calibrar la confiabilidad y los límites de la fuente.",
      },
      {
        pregunta: "¿Por qué el archivo Casasola es una fuente primaria valiosa sobre la Revolución Mexicana pero debe analizarse críticamente como fuente iconográfica?",
        respuesta_guia: "El archivo Casasola es valioso porque contiene miles de fotografías tomadas durante la Revolución, constituyendo documentación visual directa del período. Pero debe analizarse críticamente porque ninguna fotografía es neutral: el fotógrafo selecciona qué encuadra y qué excluye, está condicionado por su posición física y social, y las imágenes que circularon fueron elegidas por editores con sus propios criterios. Es necesario preguntarse quién fue fotografiado, quién fue omitido y qué imagen de la Revolución construyó ese archivo.",
      },
      {
        pregunta: "¿Qué significa que una fuente tenga sesgo y por qué identificarlo no invalida la fuente sino que la hace más útil para el historiador?",
        respuesta_guia: "El sesgo significa que la fuente refleja el punto de vista particular de quien la produjo: sus intereses, valores, posición social y límites del conocimiento. No significa que la fuente sea falsa. Identificarlo es útil porque permite usarla críticamente en dos niveles: como testimonio de los eventos que narra (con las debidas precauciones) y como evidencia sobre la perspectiva del productor y las relaciones de poder de la época. Una fuente con sesgo identificado es más útil que una fuente usada ingenuamente como verdad objetiva.",
      },
      {
        pregunta: "¿Cuál es la diferencia entre evaluar una fuente histórica e interpretarla, y por qué el orden importa?",
        respuesta_guia: "Evaluar una fuente es preguntarse si es confiable, auténtica y representativa del período: aplicar los criterios de autoría, fecha, intención, audiencia y contexto para determinar sus alcances y limitaciones. Interpretar una fuente es preguntarse qué nos dice sobre el pasado: qué información aporta, qué silencia y qué revela sobre las mentalidades y relaciones de poder de la época. El orden importa porque si interpretamos sin evaluar primero, podemos tomar por evidencia objetiva algo que en realidad es propaganda, falsificación o una perspectiva extremadamente parcial.",
      },
    ],
  },

  { // P02 — video_con_preguntas (corroboración de fuentes: triangulación y análisis iconográfico)
    url_video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    titulo_video: "Corroboración de fuentes: cómo los historiadores verifican la evidencia histórica",
    tiempo_segundos: 780,
    preguntas: [
      {
        pregunta: "¿Qué es la corroboración de fuentes en la investigación histórica y por qué es indispensable para construir argumentos sólidos?",
        opciones: [
          "Copiar una fuente para confirmar que existe en otro archivo",
          "Contrastar múltiples fuentes independientes para verificar si una información se sostiene o debe revisarse",
          "Citar a otros historiadores que usaron la misma fuente",
          "Digitalizar documentos para preservarlos",
        ],
        respuesta_correcta: "Contrastar múltiples fuentes independientes para verificar si una información se sostiene o debe revisarse",
        explicacion: "La corroboración consiste en verificar si los datos o interpretaciones que ofrece una fuente son confirmados por otras fuentes independientes. Si varias fuentes de distintos actores y tipos convergen en el mismo dato o interpretación, la evidencia es más sólida. Si se contradicen, el historiador debe analizar qué fuente es más confiable y por qué, o revisar su hipótesis.",
      },
      {
        pregunta: "¿Cómo funciona la triangulación de fuentes y qué tipos de fuentes combina el historiador para aplicarla en el estudio de la historia de México?",
        opciones: [
          "Solo usa tres fuentes del mismo tipo para confirmar una fecha",
          "Combina fuentes de distintos tipos (documentos escritos, fuentes iconográficas, testimonios orales) y de distintos actores para obtener una imagen más completa y contrastada de un evento",
          "Traza triángulos en mapas históricos para ubicar eventos",
          "Usa solo fuentes primarias y descarta las secundarias",
        ],
        respuesta_correcta: "Combina fuentes de distintos tipos (documentos escritos, fuentes iconográficas, testimonios orales) y de distintos actores para obtener una imagen más completa y contrastada de un evento",
        explicacion: "La triangulación combina al menos tres tipos o perspectivas de fuentes. Por ejemplo, para estudiar la masacre de Tlatelolco (1968) se pueden triangular: documentos oficiales del gobierno, testimonios orales de sobrevivientes recopilados por el INAH, fotografías de prensa de la época y expedientes desclasificados de la CIA. Cada tipo de fuente aporta información que las otras no tienen, y la convergencia o divergencia entre ellas enriquece el análisis.",
      },
      {
        pregunta: "¿Cómo se lee críticamente una imagen histórica —como una fotografía de la Revolución Mexicana o una pintura del muralismo— para extraer evidencia histórica rigurosa?",
        opciones: [
          "Se describe lo que se ve sin hacer ninguna interpretación",
          "Se analiza el contexto de producción (quién la hizo, cuándo, para quién), se identifican los elementos representados y sus connotaciones, y se contrasta con otras fuentes para verificar su información",
          "Se busca si es bonita o fea y se decide si es importante",
          "Se compara solo con otras imágenes del mismo autor",
        ],
        respuesta_correcta: "Se analiza el contexto de producción (quién la hizo, cuándo, para quién), se identifican los elementos representados y sus connotaciones, y se contrasta con otras fuentes para verificar su información",
        explicacion: "Leer una imagen históricamente implica: (1) identificar quién la produjo y en qué contexto; (2) describir sistemáticamente lo que representa; (3) analizar las decisiones de encuadre, color, composición o símbolo y su significado; (4) identificar qué incluye y qué excluye; (5) contrastar con fuentes escritas y testimoniales. Los murales de Diego Rivera, por ejemplo, son fuentes iconográficas que revelan tanto la historia que narran como la visión política del muralismo pos-revolucionario.",
      },
      {
        pregunta: "¿Qué es el sesgo de supervivencia en las fuentes históricas y cómo distorsiona la imagen del pasado si no se toma en cuenta?",
        opciones: [
          "El hecho de que solo sobreviven los historiadores que escriben sobre el pasado",
          "La tendencia a conocer el pasado solo a través de las fuentes que sobrevivieron al tiempo, ignorando que la mayoría de la evidencia histórica se ha perdido y que lo que sobrevivió no es representativo de todo lo que existió",
          "El sesgo de los historiadores que sobrevivieron a una guerra y escribieron sobre ella",
          "El privilegio de las fuentes más antiguas sobre las más recientes",
        ],
        respuesta_correcta: "La tendencia a conocer el pasado solo a través de las fuentes que sobrevivieron al tiempo, ignorando que la mayoría de la evidencia histórica se ha perdido y que lo que sobrevivió no es representativo de todo lo que existió",
        explicacion: "El sesgo de supervivencia afecta profundamente la historia: sobreviven principalmente los documentos de élites y del Estado (que tenían recursos para preservarlos), mientras que las voces de grupos populares, indígenas y mujeres están subrepresentadas. En México, la quema de códices durante la Conquista destruyó una proporción enorme de la historia mesoamericana. El INAH trabaja en recuperar fuentes de grupos históricamente marginados para compensar este sesgo.",
      },
    ],
  },

  { // P03 — lectura (narrativa histórica argumentada: tesis, evidencias, multiperspectividad)
    titulo: "La narrativa histórica argumentada: tesis, evidencias y perspectivas múltiples",
    texto: "La historia no es una simple lista de fechas y eventos ordenados cronológicamente. La narrativa histórica argumentada es una forma de escritura y pensamiento que construye una interpretación del pasado a partir de evidencias, organizando los hechos en torno a una tesis central y sosteniéndola con argumentos.\n\nLa estructura básica de una narrativa histórica argumentada tiene cuatro componentes. El primero es la tesis: una afirmación interpretativa sobre el pasado que puede ser debatida y respaldada con evidencias. No es un simple dato ('La Revolución Mexicana comenzó en 1910') sino una interpretación ('La Reforma Agraria cardenista de 1934-1940 fue el cumplimiento más genuino de los principios agraristas de la Revolución, aunque sus límites estructurales impidieron una transformación profunda del campo mexicano'). El segundo son los argumentos: las razones que sostienen la tesis, cada una acompañada de evidencias concretas: documentos, cifras, testimonios, fotografías. El tercero son las evidencias: los datos, fuentes y ejemplos específicos que respaldan cada argumento. El cuarto es la conclusión: un cierre que retoma la tesis, evalúa el peso de los argumentos y señala implicaciones o preguntas abiertas.\n\nLa narrativa histórica argumentada se diferencia del relato cronológico simple en que no se limita a describir lo que ocurrió, sino que responde al por qué y al con qué consecuencias. Un relato cronológico dice: 'En 1934 Cárdenas llegó a la presidencia. En 1936 inició el reparto masivo de tierras. En 1938 expropió el petróleo.' Una narrativa argumentada explica por qué esas acciones ocurrieron (contexto del cardenismo, presión de las organizaciones campesinas, tensiones con las élites agrarias), qué actores resistieron y por qué, y qué transformaciones reales produjeron y cuáles quedaron incompletas.\n\nUn principio central de la narrativa histórica contemporánea es la multiperspectividad: incorporar las voces y visiones de distintos grupos sociales que vivieron el mismo proceso. La Reforma Agraria cardenista se vio de forma muy diferente desde la perspectiva de un campesino ejidatario de Morelos, un hacendado del Bajío, una trabajadora agrícola de Sinaloa, un dirigente de la CTM o un empresario extranjero con propiedades en México. La narrativa que solo incluye la perspectiva del Estado y las élites es incompleta e ideológicamente sesgada. Incorporar la multiperspectividad no significa que todas las perspectivas sean igualmente válidas como evidencia histórica, sino que el proceso solo se comprende en su complejidad real si se consideran múltiples actores.\n\nLas causas y consecuencias en la narrativa histórica argumentada no se presentan como listas aisladas, sino como encadenamientos argumentales: causas que se conectan unas con otras, consecuencias que a su vez se convierten en causas de procesos posteriores. El concepto de historia del presente señala que los procesos históricos del pasado no terminan: continúan operando en el presente bajo nuevas formas. La desigualdad rural que el cardenismo intentó corregir se reconstituyó con nuevas formas en las siguientes décadas; el debate sobre la propiedad de la tierra y los derechos de los pueblos indígenas reapareció con el EZLN en 1994 y sigue activo hoy.\n\nTres errores frecuentes que debilitan la narrativa histórica argumentada son el anacronismo (atribuir a actores del pasado ideas o intenciones que no podían tener en su época), el presentismo (juzgar el pasado con los valores del presente sin considerar el contexto) y el determinismo (presentar los eventos históricos como inevitables, como si no hubieran podido ocurrir de otra manera). Una narrativa histórica rigurosa evita estos errores manteniendo la tensión entre lo que realmente ocurrió y lo que podría haber ocurrido bajo otras condiciones.",
    fuente: "Material CEN Bachillerato — CH-III. Ref.: White, 1973; Collingwood, 1946; Semo, 1978; Córdova, 1974.",
    nivel_lectura: "avanzado" as const,
    tiempo_estimado_minutos: 14,
    preguntas_comprension: [
      {
        pregunta: "¿Qué diferencia a una tesis histórica de un dato histórico y por qué esa diferencia importa para construir una narrativa argumentada?",
        respuesta_guia: "Un dato histórico es una afirmación factual verificable: 'La Revolución Mexicana comenzó en 1910.' Una tesis histórica es una interpretación debatible que va más allá del dato: propone una explicación, una valoración o una relación causal que puede ser respaldada o cuestionada con evidencias. La diferencia importa porque la narrativa argumentada no busca solo informar sobre qué ocurrió, sino construir una interpretación fundamentada del pasado que responda al por qué, con qué consecuencias y qué significa para nuestra comprensión del presente.",
      },
      {
        pregunta: "¿Qué es la multiperspectividad en la narrativa histórica y por qué incorporar la perspectiva de campesinos, mujeres o indígenas enriquece el análisis de la Reforma Agraria cardenista?",
        respuesta_guia: "La multiperspectividad es el principio de incorporar las voces y visiones de distintos grupos sociales que vivieron el mismo proceso histórico. Incorporar la perspectiva de campesinos ejidatarios enriquece el análisis porque permite ver cómo fue recibida y vivida concretamente la Reforma Agraria, más allá de los decretos oficiales. La perspectiva de trabajadoras agrícolas o comunidades indígenas revela dimensiones de género y etnia que la narrativa oficial suele omitir. Solo considerando múltiples actores se comprende la complejidad real del proceso: sus alcances, sus límites y sus contradicciones.",
      },
      {
        pregunta: "¿Cómo se relaciona el concepto de 'historia del presente' con la Reforma Agraria cardenista y el surgimiento del EZLN en 1994?",
        respuesta_guia: "La historia del presente señala que los procesos históricos del pasado no terminan: continúan operando bajo nuevas formas. La desigualdad rural que la Reforma Agraria cardenista intentó corregir no desapareció: con la modernización agrícola de los años cincuenta y sesenta, la apertura comercial del TLCAN y el crecimiento de las agroindustrias, la situación de los campesinos e indígenas en muchas regiones volvió a deteriorarse. El EZLN (1994) retomó explícitamente la memoria de Zapata y las demandas de autonomía indígena y reforma agraria, mostrando que las causas profundas del conflicto del siglo XX no se habían resuelto.",
      },
      {
        pregunta: "¿Qué es el determinismo como error en la narrativa histórica y cómo afecta a la comprensión de un proceso como la Revolución Mexicana?",
        respuesta_guia: "El determinismo presenta los eventos históricos como inevitables: como si no hubieran podido ocurrir de otra manera. Aplicado a la Revolución Mexicana, el determinismo llevaría a afirmar que era 'inevitable' que estallara en 1910, que Díaz cayera, que Zapata fuera asesinado o que el PRI dominara por setenta años. Esto es un error porque borra la contingencia histórica: las decisiones de actores concretos, los accidentes, las coincidencias y las coyunturas específicas que determinaron que las cosas ocurrieran como ocurrieron y no de otra manera. La narrativa rigurosa mantiene la tensión entre las condiciones estructurales y la contingencia.",
      },
    ],
  },

  { // P04 — infografia (formatos de comunicación histórica: del ensayo a la divulgación)
    titulo: "¿Cómo comunicar la historia? Del ensayo académico a la divulgación pública",
    descripcion_accesible: "Infografía que presenta los principales formatos de comunicación histórica, desde el ensayo académico especializado hasta las redes sociales, describiendo las características, audiencias y retos de cada formato. Incluye ejemplos de divulgación histórica mexicana en distintos soportes.",
    url_imagen: "/placeholder/infografia.svg",
    puntos_clave: [
      "Ensayo académico: el formato más riguroso, dirigido a audiencias especializadas (historiadores, académicos). Incluye aparato crítico (notas al pie, bibliografía), cita fuentes primarias y secundarias, y desarrolla un argumento central sostenido con evidencias. Se publica en revistas como Historia Mexicana (El Colegio de México) o Mexican Studies.",
      "Artículo de divulgación: destinado a audiencias cultas no especializadas. Usa lenguaje accesible sin sacrificar rigor, reduce el aparato crítico y privilegia la narrativa sobre la argumentación técnica. Publicaciones como Nexos, Letras Libres o Relatos e Historias en México son ejemplos de divulgación histórica de calidad en México.",
      "Exposición oral y presentación: comunicar historia de forma hablada exige estructura clara en tres partes (introducción con tesis, desarrollo con argumentos y evidencias, conclusión), uso estratégico de evidencias visuales (mapas, fotografías, gráficas) y adaptación del lenguaje a la audiencia. La oralidad permite interacción y retroalimentación inmediata.",
      "Documental histórico: combina imagen de archivo, narración, entrevistas a expertos y testimonios de protagonistas o descendientes. Permite llegar a audiencias masivas, pero exige síntesis y selección rigurosa: no todo cabe en 90 minutos. Documentales mexicanos como 'De panzazo' o series del Canal 22 muestran el potencial y los retos del género.",
      "Podcast de historia: formato conversacional y accesible, de creciente popularidad en México. Permite profundidad sin imagen, ideal para audiencias que consumen contenido en movilidad. Ejemplos como 'El Podcast de Historia de México' o 'Chilango History' muestran el auge de la historia en audio. El reto es mantener rigor sin perder accesibilidad.",
      "Infografía y visualización de datos: permite comunicar información histórica compleja —líneas de tiempo, relaciones causales, datos estadísticos— en formato visual accesible. Herramientas como TimelineJS o Canva democratizan la creación de infografías históricas. El reto es no simplificar en exceso ni perder los matices.",
      "Historia en redes sociales: formatos cortos (hilo de Twitter/X, carrusel de Instagram, video de TikTok) permiten llegar a audiencias masivas, especialmente jóvenes. El riesgo es la simplificación excesiva, la descontextualización y la viralización de errores históricos. La historia responsable en redes combina alcance masivo con rigor verificable.",
    ],
    fuente: "MCCEMS 2025 — CH-III. Comunicación histórica y divulgación. Ref.: El Colegio de México, Canal 22, Nexos, INAH.",
  },
];

// ── A2 ──────────────────────────────────────────────────────────────────────────
const contenidosA2 = [
  { // P01 — quiz_multiple_opcion (tipos de fuentes, criterios de evaluación, sesgos, repositorios)
    preguntas: [
      {
        enunciado: "¿Cuál de los siguientes ejemplos es una fuente primaria para estudiar la Revolución Mexicana (1910-1920)?",
        opciones: [
          "Un libro de historia publicado en 2015 sobre el zapatismo",
          "Una fotografía del archivo Casasola tomada en 1914 durante la ocupación de la Ciudad de México",
          "Un documental sobre la Revolución emitido por el Canal 22 en 2010",
          "Un artículo académico sobre el Plan de Ayala publicado en Historia Mexicana",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "Una fuente primaria es producida durante el período histórico estudiado o por actores directos del evento. La fotografía del archivo Casasola fue tomada durante la Revolución, por lo que es una fuente primaria de primera importancia. El libro de 2015, el documental de 2010 y el artículo académico son fuentes secundarias: son interpretaciones elaboradas posteriormente a los eventos.",
      },
      {
        enunciado: "¿Qué criterio de evaluación de fuentes pregunta '¿para qué fue producida esta fuente?' y qué revela su aplicación?",
        opciones: [
          "Autoría — revela quién produjo la fuente y sus credenciales",
          "Fecha — revela la distancia temporal entre producción y evento",
          "Intención — revela si la fuente es propaganda, documento oficial, uso personal u otro propósito que condiciona su contenido",
          "Audiencia — revela para quién fue pensada la fuente",
        ],
        respuesta_correcta: 2,
        retroalimentacion: "La intención es el criterio que pregunta para qué fue producida la fuente. Una carta personal tiene una intención diferente a un decreto oficial, un panfleto de propaganda o un artículo periodístico. Conocer la intención permite calibrar qué tipo de información contiene la fuente, cuáles son sus sesgos previsibles y qué tan representativa puede ser de la realidad que describe.",
      },
      {
        enunciado: "¿Por qué ninguna fuente histórica es completamente neutral y qué implica el concepto de sesgo para el historiador?",
        opciones: [
          "Porque los historiadores siempre distorsionan sus fuentes por error o ignorancia",
          "Porque toda fuente refleja la perspectiva, los intereses y los límites del conocimiento de quien la produjo; identificar el sesgo no invalida la fuente sino que permite usarla críticamente",
          "Porque las fuentes escritas son siempre más confiables que las orales y visuales",
          "Porque solo las fuentes del gobierno son sesgadas; los testimonios personales son siempre objetivos",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "El sesgo es inherente a toda fuente: refleja el punto de vista de quien la produjo (su posición social, sus intereses, sus valores, lo que podía o quería ver). No significa que la fuente sea inútil o falsa. Identificar el sesgo es precisamente lo que permite al historiador usarla críticamente: saber qué tipo de información puede extraerse de ella, qué debe tomarse con precaución y qué nos dice tanto sobre los eventos narrados como sobre quien los narra.",
      },
      {
        enunciado: "¿Qué es el AGN (Archivo General de la Nación) y qué tipo de fuentes históricas conserva?",
        opciones: [
          "Un museo de arte colonial que exhibe pinturas del siglo XVI",
          "Un repositorio que conserva documentos primarios desde la época virreinal hasta el siglo XX: actas, expedientes judiciales, registros de la Reforma, documentos de la Revolución Mexicana y más",
          "Una biblioteca universitaria con colecciones de libros de historia académica",
          "Un archivo de noticias periodísticas digitalizadas del siglo XXI",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "El AGN (Archivo General de la Nación, ubicado en la Ciudad de México) es el principal repositorio de fuentes históricas primarias del Estado mexicano. Conserva documentos desde la época virreinal: actas de la Inquisición, registros de propiedad colonial, expedientes de la Reforma Liberal, documentos de la Revolución Mexicana y del siglo XX. Es una fuente indispensable para la investigación histórica sobre México.",
      },
      {
        enunciado: "¿Cuál es la diferencia fundamental entre evaluar una fuente histórica e interpretarla?",
        opciones: [
          "Evaluar es más importante que interpretar; la interpretación es opcional",
          "Evaluar pregunta si la fuente es confiable y auténtica (aplicando criterios de autoría, fecha, intención, audiencia, contexto); interpretar pregunta qué nos dice sobre el pasado, qué información aporta y qué silencia",
          "Son sinónimos que describen la misma operación con palabras distintas",
          "Interpretar es un proceso previo a la evaluación: primero se lee la fuente y luego se decide si es confiable",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "Son dos operaciones distintas que deben realizarse en orden. Evaluar es preguntarse por la confiabilidad y los límites de la fuente: ¿quién la produjo, cuándo, para qué, para quién y en qué contexto? Interpretar es extraer de ella información sobre el pasado: ¿qué nos dice sobre los eventos, las mentalidades y las relaciones de poder de la época? Un historiador riguroso evalúa antes de interpretar, porque la evaluación define qué peso darle a la información que contiene.",
      },
      {
        enunciado: "¿Qué es el INAH y qué papel juega en la preservación y acceso a fuentes históricas de México?",
        opciones: [
          "El Instituto Nacional de Artes Históricas, dedicado exclusivamente a pintura colonial",
          "El Instituto Nacional de Antropología e Historia, que custodia patrimonio arqueológico y documentos coloniales, investiga la historia de México y regula la preservación del patrimonio cultural",
          "Una institución privada que vende reproducciones de documentos históricos",
          "Un organismo internacional de la UNESCO para la preservación de sitios históricos en América Latina",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "El INAH (Instituto Nacional de Antropología e Historia, fundado en 1939) es la institución pública mexicana responsable de investigar, preservar y difundir el patrimonio arqueológico, histórico y cultural de México. Custodia documentos coloniales, zonas arqueológicas, museos y archivos históricos. También desarrolla proyectos de historia oral para recuperar testimonios de comunidades y grupos históricamente marginados.",
      },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },

  { // P02 — quiz_verdadero_falso (triangulación, análisis iconográfico, sesgo de supervivencia, fuentes orales, repositorios)
    preguntas: [
      {
        enunciado: "La triangulación de fuentes consiste en usar solo tres fuentes del mismo tipo para confirmar una fecha o un dato histórico.",
        respuesta: false,
        retroalimentacion: "Falso. La triangulación no se refiere a un número fijo de fuentes ni a fuentes del mismo tipo. Consiste en contrastar fuentes de distintos tipos (documentos escritos, fuentes iconográficas, testimonios orales) y de distintos actores o perspectivas para obtener una imagen más completa y confiable de un evento. El objetivo es identificar convergencias (datos que múltiples fuentes independientes confirman) y divergencias (contradicciones que requieren análisis crítico adicional).",
      },
      {
        enunciado: "Las fotografías del archivo Casasola son fuentes iconográficas primarias que deben analizarse críticamente preguntando quién fue fotografiado, con qué intención y qué fue excluido del encuadre.",
        respuesta: true,
        retroalimentacion: "Correcto. El archivo Casasola (producido durante y después de la Revolución Mexicana por la familia fotográfica Casasola) es una fuente iconográfica primaria de enorme valor. Sin embargo, toda fotografía es una selección: el fotógrafo decide qué encuadrar y qué excluir, desde qué ángulo, para qué audiencia. Analizar críticamente estas fotografías implica preguntarse también qué imagen de la Revolución construyó ese archivo y qué perspectivas o grupos quedaron fuera.",
      },
      {
        enunciado: "El sesgo de supervivencia en las fuentes históricas implica que las fuentes que sobrevivieron al tiempo son representativas de todo lo que existió en el pasado.",
        respuesta: false,
        retroalimentacion: "Falso. El sesgo de supervivencia señala precisamente lo contrario: las fuentes que llegaron hasta nosotros no son representativas de todo lo que existió. Sobreviven preferentemente los documentos de élites, del Estado y de instituciones que tenían recursos para preservarlos. Las voces de grupos populares, mujeres, indígenas y comunidades sin escritura están subrepresentadas. La quema de códices mesoamericanos durante la Conquista es un ejemplo extremo de este sesgo: una parte enorme de la historia prehispánica fue destruida.",
      },
      {
        enunciado: "Los testimonios orales recopilados por el INAH y otras instituciones son fuentes históricas válidas que pueden someterse a análisis crítico igual que las fuentes escritas.",
        respuesta: true,
        retroalimentacion: "Correcto. Los testimonios orales son fuentes históricas legítimas, especialmente valiosas para recuperar experiencias de grupos que no dejaron registros escritos o cuyos documentos no sobrevivieron. Se analizan aplicando criterios similares: ¿quién testifica, cuándo lo hace (distancia temporal del evento), cuál es su posición y perspectiva, qué puede recordar con precisión? El INAH y el Proyecto de Historia Oral de diversas universidades mexicanas han recogido miles de testimonios de relevancia histórica.",
      },
      {
        enunciado: "Para estudiar la masacre de Tlatelolco del 2 de octubre de 1968, bastaría con usar los comunicados oficiales del gobierno de Díaz Ordaz sin necesidad de contrastarlos con otras fuentes.",
        respuesta: false,
        retroalimentacion: "Falso. Los comunicados oficiales del gobierno de 1968 son una fuente primaria útil, pero tienen un sesgo evidente: el gobierno negó la masacre y minimizó los hechos para proteger su imagen. Corroborar con otros tipos de fuentes es indispensable: testimonios orales de sobrevivientes (recopilados por Elena Poniatowska en 'La noche de Tlatelolco'), fotografías de prensa, expedientes desclasificados de la CIA y el FBI, y documentos del Movimiento Estudiantil. La convergencia de estas fuentes independientes permite reconstruir lo que realmente ocurrió.",
      },
      {
        enunciado: "La Hemeroteca Nacional Digital de México (HNDM) permite acceder en línea a periódicos históricos del siglo XIX y XX, que constituyen fuentes primarias para investigar la historia de México.",
        respuesta: true,
        retroalimentacion: "Correcto. La HNDM (administrada por la UNAM) digitaliza y pone a disposición pública periódicos mexicanos desde el siglo XIX. Publicaciones como El Monitor Republicano, El Imparcial o Excélsior de distintas épocas son fuentes primarias que registran la opinión pública, los debates políticos y los eventos de su tiempo. Son especialmente útiles para corroborar datos, contrastar perspectivas y estudiar cómo fue percibido un evento contemporáneamente.",
      },
      {
        enunciado: "La corroboración de fuentes solo es necesaria cuando el historiador sospecha que una fuente es falsa o está manipulada.",
        respuesta: false,
        retroalimentacion: "Falso. La corroboración es un principio metodológico general, no una medida de emergencia solo para fuentes sospechosas. Toda interpretación histórica sólida se apoya en evidencias corroboradas por múltiples fuentes independientes, independientemente de que parezcan confiables. Incluso las fuentes más creíbles pueden contener errores, perspectivas parciales o información incompleta que otras fuentes ayudan a completar o corregir.",
      },
    ],
    intentos_maximos: 2,
    puntaje_minimo_aprobacion: 70,
  },

  { // P03 — quiz_multiple_opcion (estructura narrativa histórica, multiperspectividad, errores narrativos)
    preguntas: [
      {
        enunciado: "¿Cuál es la diferencia entre una narrativa histórica argumentada y un relato cronológico simple?",
        opciones: [
          "La narrativa argumentada es más corta que el relato cronológico",
          "La narrativa argumentada construye una interpretación del pasado en torno a una tesis central, responde al por qué y al con qué consecuencias, y sostiene sus afirmaciones con evidencias; el relato cronológico solo describe lo que ocurrió en orden temporal",
          "El relato cronológico incluye tesis e interpretaciones; la narrativa argumentada solo usa fechas",
          "No hay ninguna diferencia: son formas equivalentes de hacer historia",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "La narrativa argumentada va más allá de ordenar eventos en el tiempo: construye una interpretación —una tesis— sobre por qué ocurrieron las cosas, qué factores los explican y qué consecuencias tuvieron. Cada afirmación se sustenta en evidencias. El relato cronológico puede ser útil para orientarse, pero no explica ni interpreta: solo enumera. La habilidad historiográfica consiste en construir narrativas argumentadas, no simples cronologías.",
      },
      {
        enunciado: "¿Qué es el anacronismo como error en la narrativa histórica?",
        opciones: [
          "Usar demasiadas fechas en la narrativa histórica",
          "Atribuir a actores del pasado ideas, valores o prácticas que no podían existir en su época",
          "Narrar eventos históricos en orden inverso al cronológico",
          "Comparar dos períodos históricos sin señalar sus diferencias",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "El anacronismo es atribuir al pasado lo que pertenece a otra época. Por ejemplo, decir que los aztecas 'violaban los derechos humanos' usa un concepto jurídico del siglo XX que no existía en el siglo XV. O afirmar que Morelos tenía una 'visión socialista' de la independencia es anacrónico: el socialismo como corriente política surgió varias décadas después. La narrativa histórica rigurosa sitúa a los actores en su propio horizonte conceptual y cultural.",
      },
      {
        enunciado: "¿Por qué la multiperspectividad es un principio fundamental de la narrativa histórica contemporánea?",
        opciones: [
          "Porque todas las perspectivas históricas tienen el mismo valor como evidencia y deben incluirse por igual",
          "Porque un proceso histórico solo se comprende en su complejidad real si se considera cómo fue vivido y percibido por distintos grupos sociales (mujeres, indígenas, trabajadores, élites), sin reducirlo a la perspectiva del Estado o las élites",
          "Porque incluir más perspectivas hace que la narrativa sea más larga y académicamente rigurosa",
          "Porque los grupos subalternos siempre tienen la perspectiva más verdadera sobre los eventos históricos",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "La multiperspectividad no implica que todas las perspectivas sean igualmente válidas como evidencia (algunas fuentes son más confiables que otras), sino que el proceso histórico tiene dimensiones que solo son visibles desde distintas posiciones sociales. La Revolución Mexicana vista desde un hacendado porfiriano es diferente a la vista desde un campesino zapatista o una mujer soldadera. Incluir múltiples perspectivas produce una comprensión más completa y menos ideológica del pasado.",
      },
      {
        enunciado: "¿Cómo se presentan las causas y consecuencias en una narrativa histórica argumentada de calidad?",
        opciones: [
          "Como listas numeradas aisladas: primero todas las causas, luego todas las consecuencias, sin conexión entre ellas",
          "Como encadenamientos argumentales: causas que se conectan unas con otras y consecuencias que a su vez se convierten en causas de procesos posteriores, mostrando la complejidad causal del proceso",
          "Omitiendo las causas y enfocándose solo en las consecuencias para simplificar el relato",
          "Identificando una sola causa principal y una sola consecuencia principal para mantener la narrativa clara",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "La causalidad histórica es compleja: los eventos tienen múltiples causas interconectadas (estructurales y contingentes) y sus consecuencias a su vez se convierten en condiciones para procesos posteriores. Una narrativa argumentada de calidad muestra este encadenamiento: por ejemplo, la Reforma Agraria cardenista (causa: demanda campesina + proyecto político de Cárdenas) produjo consecuencias (ejidos, organización campesina) que a su vez condicionaron la política agraria de las siguientes décadas y reaparecieron en el EZLN de 1994.",
      },
      {
        enunciado: "¿Qué significa la 'historia del presente' como concepto historiográfico aplicado a la Reforma Agraria cardenista y el EZLN?",
        opciones: [
          "Que solo importa estudiar la historia reciente (los últimos 30 años) y no procesos del pasado lejano",
          "Que los procesos históricos del pasado no terminan: continúan operando en el presente bajo nuevas formas, como la desigualdad rural que el cardenismo intentó resolver y que reapareció con el levantamiento zapatista de 1994",
          "Que la historia del presente es más objetiva que la historia del pasado porque hay más fuentes disponibles",
          "Que los historiadores deben enfocarse solo en conectar eventos del presente con los más recientes, ignorando los procesos de largo plazo",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "La 'historia del presente' es un concepto que señala la continuidad entre el pasado y el presente: los procesos históricos no se 'cierran' en una fecha, sino que producen estructuras, conflictos y memorias que siguen operando. La desigualdad agraria que la Reforma cardenista intentó resolver se reconstituyó con el modelo neoliberal y el TLCAN. El EZLN (1994) retomó explícitamente la memoria de Zapata para articular demandas que conectaban con el conflicto no resuelto del siglo XX, mostrando que el pasado sigue presente.",
      },
      {
        enunciado: "¿Cuáles son los cuatro componentes de la estructura de una narrativa histórica argumentada?",
        opciones: [
          "Introducción, desarrollo, conclusión y bibliografía",
          "Título, índice, cuerpo del texto y notas al pie",
          "Tesis (interpretación central debatible), argumentos (razones que la sostienen), evidencias (fuentes y datos que respaldan cada argumento) y conclusión (retoma la tesis y evalúa el peso de los argumentos)",
          "Contexto histórico, descripción de eventos, lista de actores y fecha",
        ],
        respuesta_correcta: 2,
        retroalimentacion: "La estructura de la narrativa histórica argumentada tiene cuatro componentes: (1) Tesis: una afirmación interpretativa debatible sobre el pasado; (2) Argumentos: las razones que sostienen la tesis; (3) Evidencias: datos, fuentes y ejemplos concretos que respaldan cada argumento; (4) Conclusión: retoma la tesis, evalúa el peso de los argumentos y señala implicaciones o preguntas abiertas. Esta estructura distingue la narrativa argumentada del simple relato cronológico o la descripción.",
      },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },

  { // P04 — quiz_verdadero_falso (historiografía, escuelas históricas, divulgación, comunicación)
    preguntas: [
      {
        enunciado: "La escuela de los Annales, fundada en Francia en 1929, amplió el concepto de fuente histórica para incluir no solo documentos escritos sino también datos climáticos, económicos, demográficos y culturales.",
        respuesta: true,
        retroalimentacion: "Correcto. La revista Annales d'histoire économique et sociale (1929), fundada por Marc Bloch y Lucien Febvre, revolucionó la historiografía al proponer el estudio de la 'historia total': no solo los grandes eventos políticos y militares, sino las estructuras económicas, las mentalidades colectivas, el clima, la demografía y la vida cotidiana. Esta ampliación del concepto de fuente histórica transformó permanentemente la práctica historiográfica mundial.",
      },
      {
        enunciado: "La historia de género es una corriente historiográfica que solo estudia la historia de las mujeres y no tiene relación con las relaciones de poder entre géneros.",
        respuesta: false,
        retroalimentacion: "Falso. La historia de género —desarrollada desde los años 1970 por historiadoras como Joan Scott— estudia cómo los géneros (masculino, femenino, y otros) son construcciones históricas y sociales que organizan relaciones de poder. No es solo la historia de las mujeres: analiza cómo el género ha estructurado el acceso al poder, la propiedad, el trabajo, la educación y la ciudadanía a lo largo de la historia. En México, historiadores como Ana Lau Jaiven y Carmen Ramos Escandón han desarrollado esta perspectiva para la historia nacional.",
      },
      {
        enunciado: "La microhistoria, corriente asociada a historiadores como Carlo Ginzburg (Italia) y Luis González y González (México), estudia procesos históricos a escala local o individual para revelar dinámicas estructurales que no son visibles desde la historia nacional o global.",
        respuesta: true,
        retroalimentacion: "Correcto. La microhistoria reduce la escala de observación para ganar profundidad analítica. Carlo Ginzburg en 'El queso y los gusanos' reconstruyó el universo mental de un molinero del siglo XVI a través de su juicio inquisitorial. Luis González y González en 'San José de Gracia' mostró cómo un pueblo michoacano reflejaba todos los grandes procesos de la historia nacional. Ambos demuestran que reducir la escala no empobrece el análisis sino que revela dimensiones invisibles desde arriba.",
      },
      {
        enunciado: "La divulgación histórica de calidad, como la que hacen publicaciones como Nexos o Relatos e Historias en México, sacrifica necesariamente el rigor histórico para ser accesible al público general.",
        respuesta: false,
        retroalimentacion: "Falso. La divulgación histórica de calidad busca hacer accesible el conocimiento histórico riguroso a audiencias no especializadas, pero sin sacrificar la exactitud, la complejidad ni la honestidad intelectual. Publicaciones como Nexos, Letras Libres o Relatos e Historias en México son escritas por historiadores profesionales que adaptan su lenguaje sin falsificar ni simplificar en exceso. El reto de la divulgación es precisamente ese equilibrio: accesibilidad con rigor.",
      },
      {
        enunciado: "La historia pública ('public history') es una práctica que busca hacer la historia relevante y accesible para comunidades específicas fuera del ámbito académico, incluyendo museos, parques históricos, archivos comunitarios y plataformas digitales.",
        respuesta: true,
        retroalimentacion: "Correcto. La historia pública es una subdisciplina y práctica que aplica métodos históricos fuera del ámbito académico, con el objetivo de servir a comunidades específicas. Incluye trabajo en museos, parques históricos, documentales, archivos comunitarios, exposiciones y plataformas digitales. En México, el INAH tiene un papel clave en historia pública a través de sus museos, zonas arqueológicas y publicaciones de divulgación. Las comunidades indígenas que rescatan su historia oral también practican historia pública.",
      },
      {
        enunciado: "El ensayo histórico académico y el podcast de historia son formatos de comunicación incompatibles que no pueden coexistir en la divulgación del conocimiento histórico.",
        respuesta: false,
        retroalimentacion: "Falso. El ensayo académico y el podcast son formatos complementarios que sirven a audiencias y propósitos distintos. El ensayo académico está dirigido a especialistas, incluye aparato crítico riguroso y desarrolla argumentos complejos. El podcast llega a audiencias masivas, usa lenguaje conversacional y permite escuchar en movilidad. Muchos historiadores profesionales publican tanto en revistas académicas como producen podcasts o colaboran en divulgación, utilizando distintos formatos para distintas audiencias. Lo importante es mantener el rigor en ambos contextos.",
      },
      {
        enunciado: "La historia social, como corriente historiográfica, pone el énfasis en el estudio de grupos, clases y movimientos sociales como sujetos de la historia, en lugar de centrar el análisis solo en líderes, élites o Estados.",
        respuesta: true,
        retroalimentacion: "Correcto. La historia social, que se desarrolló con fuerza desde los años 1960 (con historiadores como E.P. Thompson en Inglaterra o Enrique Semo en México), desplazó el foco de los grandes personajes y los Estados hacia los trabajadores, campesinos, mujeres, migrantes y movimientos sociales como sujetos históricos activos. En México, esta corriente produjo una enorme renovación historiográfica sobre la Revolución Mexicana, el movimiento obrero y las comunidades indígenas.",
      },
    ],
    intentos_maximos: 2,
    puntaje_minimo_aprobacion: 70,
  },
];

// ── A3 ──────────────────────────────────────────────────────────────────────────
const contenidosA3 = [
  { // P01 — reflexion_escrita (análisis crítico de fuente histórica sobre la Revolución Mexicana)
    prompt: "Elige una fuente histórica sobre algún evento de la Revolución Mexicana (puede ser una fotografía de Casasola, un discurso de Zapata, un corrido revolucionario o un artículo periodístico de la época). Evalúala aplicando los 5 criterios estudiados: autoría, fecha, intención, audiencia y contexto. ¿Qué te dice sobre el pasado y qué limitaciones tiene como evidencia histórica?",
    longitud_minima_palabras: 130,
    pistas: [
      "¿Quién produjo esta fuente y desde qué posición social o política la elaboró?",
      "¿Cuándo fue producida? ¿Es contemporánea al evento o fue elaborada después?",
      "¿Para qué fue producida (propaganda, documento oficial, registro personal, entretenimiento)?",
      "¿Qué nos dice sobre la Revolución y qué aspectos del evento no podría mostrarnos?",
    ],
    criterios_evaluacion: [
      "Identifica una fuente histórica concreta y la describe con suficiente detalle",
      "Aplica al menos cuatro de los cinco criterios de evaluación (autoría, fecha, intención, audiencia, contexto) con argumentos específicos",
      "Distingue entre lo que la fuente sí puede revelar sobre el pasado y sus limitaciones como evidencia",
      "Escribe con claridad, orden y vocabulario histórico apropiado",
    ],
  },

  { // P02 — debate_estructurado (testimonios orales vs. documentos escritos como fuentes históricas)
    tema: "¿Los testimonios orales de testigos directos tienen la misma validez histórica que los documentos escritos de la época?",
    posturas: [
      "Los testimonios orales son fuentes históricas igualmente válidas que los documentos escritos",
      "Los documentos escritos son fuentes más confiables que los testimonios orales",
    ],
    argumentos_guia: {
      "postura_a_testimonios_orales": [
        "Los testimonios orales recuperan experiencias de grupos que no dejaron registros escritos: comunidades indígenas, mujeres, campesinos y trabajadores cuyas voces no aparecen en los documentos oficiales del AGN o los periódicos de la época. El Proyecto de Historia Oral del INAH ha recogido miles de testimonios que son fuentes históricas únicas.",
        "Los documentos escritos también son parciales y sesgados: los decretos del gobierno de Díaz Ordaz sobre el 2 de octubre de 1968 describieron los eventos de forma que protegía al Estado. Los testimonios de sobrevivientes que Elena Poniatowska recopiló en 'La noche de Tlatelolco' ofrecen una perspectiva que ningún documento oficial podía proporcionar.",
        "La historia oral tiene metodologías propias de verificación: los historiadores que trabajan con testimonios orales aplican criterios de análisis crítico (consistencia interna, corroboración con otras fuentes, distancia temporal) que permiten evaluar su confiabilidad igual que se haría con un documento escrito.",
        "Las comunidades sin tradición de escritura tienen su historia preservada en testimonios orales: ignorar estas fuentes por no ser 'escritas' reproduce el sesgo colonial que privilegia los registros del poder sobre los de las comunidades subordinadas.",
      ],
      "postura_b_documentos_escritos": [
        "Los documentos escritos contemporáneos a los eventos tienen la ventaja de haber sido producidos en el momento mismo, sin la distorsión que introduce la memoria a largo plazo. Un testimonio oral sobre la Revolución Mexicana recopilado en los años 1970 está mediado por décadas de recuerdos modificados, narrativas familiares y memorias colectivas que se superponen al recuerdo original.",
        "La memoria humana es reconstructiva y selectiva: estudios de psicología cognitiva demuestran que los recuerdos se modifican con el tiempo, incorporan información posterior y están influenciados por las memorias colectivas del grupo. Un testigo puede recordar con convicción algo que en realidad no ocurrió exactamente así o que fue influenciado por lo que otros relataron después.",
        "Los documentos escritos pueden ser verificados materialmente: la autenticidad de un documento puede comprobarse mediante análisis del soporte físico, la tinta, la grafía y el contexto de archivo. Los expedientes del AGN o las fotografías del archivo Casasola tienen una trazabilidad material que los testimonios orales no tienen de la misma forma.",
        "Los documentos escritos permiten establecer cronologías más precisas: saber exactamente cuándo se produjo un documento (por fecha, lugar y firma) ayuda a reconstruir la secuencia de los eventos con mayor precisión que un testimonio cuya fecha exacta es difícil de verificar.",
      ],
    },
    reglas: [
      "Argumentar con evidencias históricas concretas y ejemplos de la historia de México, no solo con opiniones abstractas",
      "Escuchar los argumentos del lado contrario y responderlos directamente antes de presentar nuevos argumentos propios",
      "No descalificar al interlocutor ni a los grupos a los que representan sus fuentes; debatir las ideas, no las personas",
      "Reconocer los méritos del argumento contrario si los tiene, antes de señalar sus limitaciones",
      "Cerrar con una reflexión propia sobre qué aprendiste del debate independientemente de qué postura defendiste",
    ],
    tiempo_argumentacion_minutos: 15,
  },

  { // P03 — reflexion_escrita (narrativa argumentada sobre un evento histórico mexicano del siglo XX)
    prompt: "Elige un evento del siglo XX mexicano (Tlatelolco 1968, la expropiación petrolera de 1938, el surgimiento del EZLN en 1994, o cualquier otro que te interese). Elabora una narrativa histórica argumentada de al menos 150 palabras que incluya: una tesis interpretativa, tres argumentos con evidencias, y la perspectiva de al menos dos grupos sociales distintos que vivieron ese evento.",
    longitud_minima_palabras: 150,
    pistas: [
      "Formula primero tu tesis: una afirmación interpretativa sobre el evento que pueda ser debatida, no solo un dato ('La expropiación petrolera de 1938 fue...porque...')",
      "Para cada argumento, busca una evidencia concreta: un dato, una ley, una cita, una cifra, una fuente histórica",
      "¿Cómo vivieron ese evento distintos grupos? (trabajadores y empresarios, gobierno y opositores, hombres y mujeres, capital y provincias)",
      "¿Qué consecuencias tuvo el evento a corto y largo plazo? ¿Sigue presente en México hoy?",
      "Evita el anacronismo: sitúa a los actores en su propio contexto histórico",
    ],
    criterios_evaluacion: [
      "Formula una tesis histórica interpretativa clara y debatible (no solo un dato o descripción)",
      "Desarrolla al menos tres argumentos, cada uno respaldado por al menos una evidencia concreta o referencia a fuentes",
      "Incorpora la perspectiva de al menos dos grupos sociales distintos que vivieron el evento",
      "Mantiene coherencia argumentativa y evita errores como anacronismo o determinismo",
    ],
  },

  { // P04 — autoevaluacion (comunicación e interpretación histórica)
    criterios: [
      {
        descripcion: "Cuando elaboro una narrativa histórica, incluyo una tesis interpretativa clara",
        escala: [
          { valor: 1, etiqueta: "Nunca o muy poco", descripcion: "Mis escritos históricos solo describen eventos cronológicamente sin proponer una interpretación central." },
          { valor: 2, etiqueta: "Algunas veces", descripcion: "A veces incluyo una tesis, pero no siempre la formulo con claridad o la sostengo a lo largo del texto." },
          { valor: 3, etiqueta: "Con frecuencia", descripcion: "Generalmente formulo una tesis clara al inicio y la desarrollo con argumentos, aunque a veces pierdo el hilo." },
          { valor: 4, etiqueta: "Siempre o casi siempre", descripcion: "Sistemáticamente formulo una tesis interpretativa clara y la sostengo con argumentos y evidencias a lo largo de toda mi narrativa." },
        ],
      },
      {
        descripcion: "Utilizo evidencias de fuentes diversas para sustentar mis argumentos históricos",
        escala: [
          { valor: 1, etiqueta: "Nunca o muy poco", descripcion: "Mis argumentos históricos rara vez se apoyan en fuentes concretas; confío en lo que recuerdo sin verificar." },
          { valor: 2, etiqueta: "Algunas veces", descripcion: "A veces cito fuentes, pero generalmente uso solo un tipo (el libro de texto) sin contrastar con otras evidencias." },
          { valor: 3, etiqueta: "Con frecuencia", descripcion: "Suelo apoyar mis argumentos en fuentes diversas (documentos, fotografías, datos estadísticos, testimonios), aunque no siempre las evalúo críticamente." },
          { valor: 4, etiqueta: "Siempre o casi siempre", descripcion: "Consistentemente uso fuentes diversas, las evalúo aplicando criterios de autoría, fecha e intención, y las contrasto para construir argumentos sólidos." },
        ],
      },
      {
        descripcion: "Incorporo perspectivas de distintos grupos sociales en mis narraciones (mujeres, indígenas, clases populares)",
        escala: [
          { valor: 1, etiqueta: "Nunca o muy poco", descripcion: "Mis narraciones históricas se centran en líderes, gobiernos o élites; los grupos subalternos no aparecen." },
          { valor: 2, etiqueta: "Algunas veces", descripcion: "Ocasionalmente menciono otros grupos, pero los trato como secundarios o como víctimas pasivas, sin agencia propia." },
          { valor: 3, etiqueta: "Con frecuencia", descripcion: "Generalmente incluyo múltiples perspectivas y reconozco la agencia de distintos grupos, aunque me cuesta encontrar fuentes que representen voces marginadas." },
          { valor: 4, etiqueta: "Siempre o casi siempre", descripcion: "Busco activamente fuentes de distintos grupos sociales y construyo narrativas multiperspectivas que muestran cómo el mismo evento fue vivido de formas muy distintas." },
        ],
      },
      {
        descripcion: "Comunico mis interpretaciones históricas con lenguaje accesible y argumentación ordenada",
        escala: [
          { valor: 1, etiqueta: "Nunca o muy poco", descripcion: "Me cuesta ordenar mis ideas al escribir sobre historia; mi texto resulta confuso o difícil de seguir para quien lo lee." },
          { valor: 2, etiqueta: "Algunas veces", descripcion: "Tengo las ideas pero me cuesta estructurarlas con claridad; a veces salto entre temas sin conectarlos bien." },
          { valor: 3, etiqueta: "Con frecuencia", descripcion: "Generalmente escribo con claridad y orden, aunque a veces uso lenguaje excesivamente técnico o pierdo la hilo argumentativo." },
          { valor: 4, etiqueta: "Siempre o casi siempre", descripcion: "Comunico mis interpretaciones con lenguaje claro y preciso, estructura argumentativa coherente, y adapto mi expresión a la audiencia (académica o de divulgación)." },
        ],
      },
    ],
    reflexion_final_prompt: "¿En qué aspecto de la comunicación y narración histórica necesitas seguir desarrollándote? ¿Qué estrategia concreta usarás para mejorarlo?",
  },
];

main().catch((err) => { console.error("❌ Error fatal:", err.message); process.exit(1); });

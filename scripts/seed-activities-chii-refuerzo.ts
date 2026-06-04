/**
 * Refuerzo de actividades para CH-II (Conciencia Histórica II — historicidad,
 * hipótesis históricas, sentido histórico y procesos históricos de México y el mundo)
 * según la "Plantilla CEN por UAC". Agrega A4-A7 a cada una de las 4 progresiones
 * (ya tienen A1-A3):
 *   A4 = quiz_verdadero_falso · A5 = glosario_interactivo · A6 = fill_blanks · A7 = autoevaluacion
 * 4 progresiones × 4 = 16 actividades nuevas. estado='borrador'.
 * Alineado al programa oficial CH-II (MCCEMS 2025).
 * Uso: npx tsx scripts/seed-activities-chii-refuerzo.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad, type ActividadInput } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

type Refuerzo = Pick<ActividadInput, "titulo" | "descripcion" | "tipo" | "xp" | "contenido">;

const letras = ["A4", "A5", "A6", "A7"];

// Escala estándar de autoevaluación (1-4) reutilizada en todas las progresiones.
const escala4 = [
  { valor: 1, etiqueta: "En inicio", descripcion: "Todavía necesito apoyo y consultar el material." },
  { valor: 2, etiqueta: "En proceso", descripcion: "Lo logro con algunos errores o dudas." },
  { valor: 3, etiqueta: "Logrado", descripcion: "Lo hago bien de forma autónoma." },
  { valor: 4, etiqueta: "Destacado", descripcion: "Lo hago con seguridad y puedo ayudar a otra persona." },
];

async function main() {
  const sb = createSB();
  log("\n🌱 Refuerzo CH-II — Conciencia Histórica II: A4-A7 por progresión\n");

  const progs = await getProgresionesDeUAC(sb, "CH-II");
  let ok = 0; let fail = 0;

  for (const p of progs) {
    const set = refuerzos[p.numero - 1];
    if (!set) { log(`⚠️  Sin refuerzos definidos para P${p.numero}`); continue; }
    for (let i = 0; i < set.length; i++) {
      const r = set[i];
      const res = await upsertActividad(sb, {
        codigo: `${p.codigo}-${letras[i]}`,
        titulo: r.titulo,
        descripcion: r.descripcion,
        tipo: r.tipo,
        progresion_id: p.id,
        xp: r.xp,
        contenido: r.contenido,
      });
      res ? ok++ : fail++;
    }
  }

  log(`\n✅ CH-II refuerzo: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── REFUERZOS POR PROGRESIÓN ───────────────────────────────────────────────────

const refuerzos: Refuerzo[][] = [
  // ════════════ P01 — Historicidad: el sujeto inscrito en procesos históricos ════════════
  [
    {
      titulo: "Verdadero o Falso — Historicidad y el sujeto histórico",
      descripcion: "Decide si cada afirmación sobre el concepto de historicidad, el sujeto histórico y la inscripción del individuo en procesos sociales, culturales e históricos es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "La historicidad es la condición por la cual los seres humanos están situados en un tiempo y espacio concretos, lo que condiciona su identidad, pensamiento y acción.",
            respuesta: true,
            retroalimentacion: "Correcto. La historicidad implica que todo sujeto es producto de su época: sus ideas, valores y posibilidades están moldeados por el contexto histórico en que vive.",
          },
          {
            enunciado: "Los individuos son meros espectadores pasivos de la historia; los únicos agentes históricos reales son los grandes líderes políticos y militares.",
            respuesta: false,
            retroalimentacion: "Falso. La historia es construida por múltiples actores: pueblos, comunidades, mujeres, trabajadores, grupos indígenas, etc. Los sujetos son agentes activos, no sólo testigos.",
          },
          {
            enunciado: "Reconocer la propia historicidad implica identificar cómo los procesos históricos previos (como la Conquista, la Independencia o la Revolución Mexicana) han influido en la identidad y la cultura actual de la sociedad.",
            respuesta: true,
            retroalimentacion: "Correcto. Reconocer la historicidad propia significa comprender que somos resultado de procesos históricos acumulados que modelan nuestra lengua, valores, instituciones y cosmovisión.",
          },
          {
            enunciado: "El concepto de sujeto histórico excluye a los grupos subalternos como pueblos indígenas, mujeres y clases populares, ya que estos no dejaron registros escritos.",
            respuesta: false,
            retroalimentacion: "Falso. La historiografía contemporánea reconoce a todos los actores sociales como sujetos históricos, incluyendo a grupos que tradicionalmente no fueron reconocidos en la historia oficial.",
          },
          {
            enunciado: "La historicidad supone que el presente siempre está condicionado por el pasado, pero también que las acciones del presente influirán en el futuro.",
            respuesta: true,
            retroalimentacion: "Correcto. La historicidad es dinámica: el pasado condiciona el presente y las decisiones actuales construyen el futuro, en una cadena continua de procesos históricos.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Historicidad y sujeto histórico",
      descripcion: "Glosario interactivo de los conceptos fundamentales sobre historicidad, sujeto histórico y la inscripción del individuo en procesos sociales, culturales e históricos.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Historicidad",
            definicion: "Condición esencial del ser humano que lo sitúa en un tiempo y espacio concretos. Implica que toda persona, institución o cultura es producto de su historia y no puede comprenderse fuera de su contexto histórico.",
            ejemplo: "Un estudiante mexicano del siglo XXI es históricamente situado: habla español, estudia en un sistema educativo surgido de la Reforma y la Revolución, y vive en un Estado-nación con raíces históricas específicas.",
            etiquetas: ["historicidad", "tiempo histórico", "contexto"],
          },
          {
            termino: "Sujeto histórico",
            definicion: "Actor individual o colectivo que participa activamente en la construcción de la historia. Puede ser un individuo, un pueblo, un movimiento social o una institución. La historia se construye por la acción de múltiples sujetos.",
            ejemplo: "En la Revolución Mexicana (1910-1920) participaron como sujetos históricos: el campesinado zapatista, el ejército constitucionalista, las soldaderas, los obreros y los caudillos regionales.",
            etiquetas: ["sujeto histórico", "agencia", "actor social"],
          },
          {
            termino: "Proceso histórico",
            definicion: "Secuencia de cambios y continuidades que se desarrollan en el tiempo, con causas múltiples y consecuencias que se extienden más allá del momento en que ocurren. Los procesos históricos no son lineales ni inevitables.",
            ejemplo: "La Independencia de México (1810-1821) fue un proceso de once años con múltiples causas (Ilustración, crisis de la Corona española, desigualdad social) y consecuencias que aún hoy moldean la nación.",
            etiquetas: ["proceso histórico", "cambio", "continuidad"],
          },
          {
            termino: "Identidad histórico-cultural",
            definicion: "Conjunto de características, valores, tradiciones y memoria compartida que definen a un grupo social a lo largo del tiempo. Es resultado de los procesos históricos vividos colectivamente.",
            ejemplo: "La identidad mexicana actual es resultado de la fusión histórica entre culturas prehispánicas (náhuatl, maya, zapoteca), la Colonia española y los procesos modernos de mestizaje cultural.",
            etiquetas: ["identidad", "cultura", "memoria histórica"],
          },
          {
            termino: "Condicionamiento histórico",
            definicion: "Influencia que el pasado ejerce sobre las posibilidades, ideas y acciones del presente. No es determinismo absoluto: los sujetos pueden transformar sus condiciones históricas.",
            ejemplo: "El sistema educativo mexicano está condicionado históricamente: la SEP fue creada en 1921 por José Vasconcelos después de la Revolución para alfabetizar y unificar a la nación.",
            etiquetas: ["condicionamiento", "pasado", "determinismo"],
          },
          {
            termino: "Conciencia histórica",
            definicion: "Capacidad de reconocerse como sujeto inscrito en el tiempo histórico, entender cómo el pasado condiciona el presente y asumir responsabilidad en la construcción del futuro.",
            ejemplo: "Tener conciencia histórica implica comprender que las desigualdades sociales actuales en México tienen raíces en procesos históricos como la Colonia y el porfiriato, y no son simplemente 'naturales'.",
            etiquetas: ["conciencia histórica", "reflexión", "responsabilidad"],
          },
        ],
        actividad_final: "Reflexiona y responde: ¿Cuáles son tres procesos históricos que han influido directamente en tu identidad actual (familia, comunidad, país)? Para cada uno, describe qué cambió, quiénes fueron los sujetos históricos principales y cómo ese proceso sigue presente hoy en tu vida cotidiana.",
      },
    },
    {
      titulo: "Completa los espacios — Historicidad y sujeto histórico",
      descripcion: "Completa los conceptos clave sobre historicidad, sujeto histórico y la inscripción del individuo en procesos históricos.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término o concepto correcto.",
        texto_con_huecos: "La ___ es la condición humana que nos sitúa en un tiempo y espacio concretos, haciendo que nuestras ideas y acciones estén moldeadas por la historia. Los individuos, pueblos y movimientos sociales que participan activamente en la construcción de la historia son llamados ___ históricos. La SEP fue fundada en 1921 por José ___ para alfabetizar y unificar a la nación después de la Revolución. Reconocer nuestra historicidad implica entender que el ___ condiciona el presente y que nuestras acciones actuales influirán en el futuro.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "historicidad",
            alternativas_aceptadas: [],
            pista: "Condición que hace que los seres humanos estén situados en un tiempo y espacio específicos.",
          },
          {
            posicion: 1,
            respuesta_correcta: "sujetos",
            alternativas_aceptadas: ["actores"],
            pista: "Los participantes activos en la construcción de la historia son llamados ___ históricos.",
          },
          {
            posicion: 2,
            respuesta_correcta: "Vasconcelos",
            alternativas_aceptadas: ["vasconcelos"],
            pista: "El filósofo y político que fundó la SEP en 1921 se llamaba José ___.",
          },
          {
            posicion: 3,
            respuesta_correcta: "pasado",
            alternativas_aceptadas: [],
            pista: "La historicidad implica que el ___ condiciona el presente.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Historicidad y sujeto histórico",
      descripcion: "Reflexiona sobre tu comprensión de la historicidad, el sujeto histórico y tu propia inscripción en procesos sociales, culturales e históricos.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio. Esto te ayudará a identificar qué aspectos necesitas reforzar.",
        criterios: [
          { descripcion: "Explico el concepto de historicidad y por qué todo ser humano es un sujeto históricamente situado.", escala: escala4 },
          { descripcion: "Identifico quiénes pueden ser considerados sujetos históricos (individuos, grupos, pueblos) y doy ejemplos concretos.", escala: escala4 },
          { descripcion: "Analizo cómo procesos históricos específicos (Conquista, Independencia, Revolución Mexicana) han influido en la identidad cultural actual de México.", escala: escala4 },
          { descripcion: "Reflexiono sobre mi propia historicidad: identifico al menos dos procesos históricos que condicionan mi vida, identidad o posibilidades actuales.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué significa para ti ser un sujeto histórico? Identifica un proceso histórico que haya ocurrido antes de tu nacimiento pero que siga influyendo en tu vida cotidiana hoy. Explica cómo lo notas y qué responsabilidad sientes hacia el futuro.",
      },
    },
  ],

  // ════════════ P02 — Hipótesis históricas, fuentes y evidencias ════════════
  [
    {
      titulo: "Verdadero o Falso — Hipótesis históricas y fuentes del pasado",
      descripcion: "Decide si cada afirmación sobre la formulación de hipótesis históricas, las fuentes primarias y secundarias, y la interpretación de evidencias es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "Una fuente primaria es aquella producida directamente durante el período histórico que se estudia, como una carta, un diario, una fotografía o un documento oficial de la época.",
            respuesta: true,
            retroalimentacion: "Correcto. Las fuentes primarias son testimonios directos del período: diarios personales, actas, crónicas contemporáneas, artefactos arqueológicos, fotografías históricas, entre otros.",
          },
          {
            enunciado: "Una hipótesis histórica es una afirmación definitiva y comprobada sobre el pasado que no requiere ser verificada con fuentes.",
            respuesta: false,
            retroalimentacion: "Falso. Una hipótesis histórica es una proposición provisional que busca explicar un hecho o proceso del pasado; debe ser sustentada, contrastada y revisada mediante el análisis de fuentes y evidencias.",
          },
          {
            enunciado: "Un libro de texto de historia publicado en 2010 que analiza la Revolución Mexicana es un ejemplo de fuente secundaria.",
            respuesta: true,
            retroalimentacion: "Correcto. Las fuentes secundarias son interpretaciones o análisis elaborados por historiadores después de los hechos, basándose en fuentes primarias y en investigación historiográfica.",
          },
          {
            enunciado: "El testimonio oral de un anciano que vivió el Movimiento Estudiantil de 1968 en México constituye una fuente primaria válida para el estudio de ese evento.",
            respuesta: true,
            retroalimentacion: "Correcto. Los testimonios orales de testigos directos son fuentes primarias valiosas. La historia oral es una metodología reconocida que recoge experiencias de actores que no dejaron registros escritos.",
          },
          {
            enunciado: "En historia, una sola fuente primaria es suficiente para establecer una hipótesis histórica como verdad definitiva.",
            respuesta: false,
            retroalimentacion: "Falso. El método histórico exige contrastar múltiples fuentes para evitar sesgos, errores o manipulaciones. Una sola fuente puede ser incompleta, parcial o interesada.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Hipótesis históricas y fuentes del pasado",
      descripcion: "Glosario interactivo sobre los conceptos clave del método histórico: hipótesis, fuentes primarias y secundarias, evidencia y crítica de fuentes.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Hipótesis histórica",
            definicion: "Proposición provisional que busca explicar un proceso, evento o fenómeno del pasado. Se formula a partir de preguntas históricas y se verifica mediante el análisis sistemático de fuentes y evidencias.",
            ejemplo: "Hipótesis: 'La Revolución Mexicana estalló en 1910 principalmente por la acumulación de tierras en manos de unos pocos terratenientes durante el porfiriato, lo que generó una crisis agraria insostenible.' Esta hipótesis puede contrastarse con datos sobre distribución de la tierra en 1910.",
            etiquetas: ["hipótesis", "método histórico", "explicación"],
          },
          {
            termino: "Fuente primaria",
            definicion: "Documento, objeto o testimonio producido durante el período histórico que se estudia o por participantes directos en los hechos. Proporciona evidencia de primera mano.",
            ejemplo: "El Plan de Ayala (1911), proclamado por Emiliano Zapata, es una fuente primaria fundamental para estudiar el zapatismo y las demandas agrarias de la Revolución Mexicana.",
            etiquetas: ["fuente primaria", "documento", "evidencia"],
          },
          {
            termino: "Fuente secundaria",
            definicion: "Análisis, interpretación o síntesis elaborada por investigadores o historiadores con base en fuentes primarias. Ofrece perspectivas analíticas sobre los hechos del pasado.",
            ejemplo: "La obra 'La Revolución Mexicana' del historiador Friedrich Katz es una fuente secundaria que interpreta el movimiento a partir de múltiples fuentes primarias nacionales e internacionales.",
            etiquetas: ["fuente secundaria", "historiografía", "interpretación"],
          },
          {
            termino: "Crítica de fuentes (heurística)",
            definicion: "Proceso metodológico para evaluar la autenticidad, confiabilidad y perspectiva de una fuente histórica. Incluye crítica externa (¿es auténtica?) e interna (¿qué dice realmente y con qué sesgo?).",
            ejemplo: "Al analizar crónicas coloniales como las de Bernal Díaz del Castillo, el historiador evalúa el punto de vista del autor (conquistador español), su acceso directo a los hechos y posibles motivaciones al narrar la Conquista.",
            etiquetas: ["crítica de fuentes", "método", "sesgo"],
          },
          {
            termino: "Evidencia histórica",
            definicion: "Conjunto de datos, fuentes y vestigios que sirven para sustentar o refutar una hipótesis histórica. No toda evidencia es igualmente confiable: debe evaluarse su origen, contexto y posibles sesgos.",
            ejemplo: "Los códices prehispánicos (como el Códice Mendoza) son evidencias visuales y textuales que permiten conocer la organización política, económica y cultural del Imperio Mexica antes de la Conquista.",
            etiquetas: ["evidencia", "datos históricos", "sustento"],
          },
          {
            termino: "Corroboración y triangulación de fuentes",
            definicion: "Práctica historiográfica de contrastar varias fuentes independientes entre sí para aumentar la confiabilidad de las conclusiones. Evita depender de una sola perspectiva o documento.",
            ejemplo: "Para estudiar la masacre de Tlatelolco de 1968, los historiadores contrastan documentos oficiales, testimonios de sobrevivientes, fotografías, archivos desclasificados de la CIA y reportes periodísticos de la época.",
            etiquetas: ["corroboración", "triangulación", "confiabilidad"],
          },
        ],
        actividad_final: "Elige un evento histórico de México (por ejemplo: la Conquista de Tenochtitlan en 1521, la Guerra de Independencia, la Reforma Liberal de Juárez o el Movimiento del 68). Formula UNA hipótesis histórica sobre sus causas o consecuencias. Luego, identifica al menos dos tipos de fuentes (primaria y secundaria) que podrías usar para sustentarla o refutarla, explicando por qué cada fuente es útil y cuáles son sus posibles limitaciones.",
      },
    },
    {
      titulo: "Completa los espacios — Hipótesis históricas y fuentes",
      descripcion: "Completa los conceptos del método histórico: hipótesis, tipos de fuentes, evidencias y crítica de fuentes.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término o concepto correcto.",
        texto_con_huecos: "Una ___ histórica es una proposición provisional que busca explicar un fenómeno del pasado y debe verificarse con fuentes y evidencias. El Plan de Ayala, proclamado por Zapata en 1911, es un ejemplo de fuente ___ porque fue producida durante el período estudiado. Una interpretación académica elaborada por un historiador décadas después de los hechos es una fuente ___. El proceso de evaluar la autenticidad y confiabilidad de un documento histórico se llama ___ de fuentes.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "hipótesis",
            alternativas_aceptadas: [],
            pista: "Proposición provisional que busca explicar un hecho histórico y que debe contrastarse con evidencias.",
          },
          {
            posicion: 1,
            respuesta_correcta: "primaria",
            alternativas_aceptadas: [],
            pista: "Las fuentes producidas durante el período histórico estudiado, por testigos o participantes directos, son fuentes ___.",
          },
          {
            posicion: 2,
            respuesta_correcta: "secundaria",
            alternativas_aceptadas: [],
            pista: "Los análisis e interpretaciones de historiadores elaborados después de los hechos son fuentes ___.",
          },
          {
            posicion: 3,
            respuesta_correcta: "crítica",
            alternativas_aceptadas: ["heurística"],
            pista: "El método para evaluar la autenticidad, sesgo y confiabilidad de una fuente se llama ___ de fuentes.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Hipótesis históricas y fuentes del pasado",
      descripcion: "Reflexiona sobre tu capacidad para formular hipótesis históricas y analizar críticamente fuentes y evidencias del pasado.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Distingo con claridad entre una fuente primaria y una fuente secundaria, y puedo dar ejemplos concretos de cada tipo para un evento histórico de México.", escala: escala4 },
          { descripcion: "Formulo hipótesis históricas como proposiciones provisionales y verificables, evitando afirmar sin evidencia.", escala: escala4 },
          { descripcion: "Aplico la crítica de fuentes para evaluar la perspectiva, el sesgo y la confiabilidad de documentos históricos.", escala: escala4 },
          { descripcion: "Corroboro hipótesis contrastando al menos dos fuentes independientes antes de extraer conclusiones sobre el pasado.", escala: escala4 },
        ],
        reflexion_final_prompt: "Piensa en una afirmación que hayas escuchado sobre la historia de México (puede ser sobre la Conquista, la Revolución, la Independencia u otro evento). ¿Cómo transformarías esa afirmación en una hipótesis histórica? ¿Qué tipos de fuentes buscarías para verificarla? ¿Qué dificultades podrías encontrar para acceder a ellas?",
      },
    },
  ],

  // ════════════ P03 — Sentido histórico: comprender el presente desde el pasado ════════════
  [
    {
      titulo: "Verdadero o Falso — Sentido histórico y relación pasado-presente",
      descripcion: "Decide si cada afirmación sobre el sentido histórico como capacidad humana, la memoria colectiva y la relación entre el pasado y el presente es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "El sentido histórico es la capacidad exclusiva de los historiadores profesionales para interpretar documentos del pasado; los ciudadanos comunes no la pueden desarrollar.",
            respuesta: false,
            retroalimentacion: "Falso. El sentido histórico es una capacidad humana que cualquier persona puede desarrollar. Implica reconocer que el presente es resultado del pasado y que las estructuras sociales actuales tienen origen histórico.",
          },
          {
            enunciado: "La memoria colectiva de una sociedad incluye las narrativas, tradiciones y experiencias compartidas que permiten a un grupo identificarse con su pasado común.",
            respuesta: true,
            retroalimentacion: "Correcto. La memoria colectiva (concepto desarrollado por Maurice Halbwachs) es el conjunto de recuerdos y narrativas que un grupo social construye y transmite sobre su pasado, configurando su identidad.",
          },
          {
            enunciado: "Comprender el presente desde el pasado significa que las condiciones actuales de México (desigualdad, instituciones, cultura) son resultado de procesos históricos como la Colonia, la Reforma y la Revolución, no de factores aleatorios.",
            respuesta: true,
            retroalimentacion: "Correcto. El sentido histórico permite ver que la realidad presente es consecuencia de decisiones, conflictos y transformaciones del pasado. Por ejemplo, la distribución de la tierra en México sigue marcada por el reparto agrario posrevolucionario.",
          },
          {
            enunciado: "Recordar el pasado de manera acrítica, sin cuestionar las narrativas oficiales, equivale a ejercer plenamente el sentido histórico.",
            respuesta: false,
            retroalimentacion: "Falso. El sentido histórico exige una actitud crítica y reflexiva. Memorizar fechas o narrativas oficiales sin análisis no es lo mismo que comprender históricamente el presente. Requiere cuestionar, contextualizar e interpretar.",
          },
          {
            enunciado: "La Conquista de México (1519-1521) sigue siendo relevante para el presente porque sus consecuencias (mestizaje, sistema de castas, evangelización, despojo territorial) configuran estructuras sociales y culturales que aún persisten.",
            respuesta: true,
            retroalimentacion: "Correcto. El sentido histórico reconoce que procesos del siglo XVI como la Conquista tienen consecuencias de larga duración que se expresan en la realidad contemporánea (desigualdad étnica, patrimonio cultural, identidad lingüística, etc.).",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Sentido histórico y conciencia histórica",
      descripcion: "Glosario interactivo sobre el sentido histórico, la memoria colectiva, la conciencia histórica y la relación entre el pasado y el presente.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Sentido histórico",
            definicion: "Capacidad humana de comprender el presente como resultado del pasado; implica reconocer que las estructuras sociales, instituciones y culturas actuales tienen origen en procesos históricos específicos y no son naturales ni eternas.",
            ejemplo: "El sentido histórico permite entender que la Constitución Política de México de 1917 no surgió de la nada: es resultado de la Revolución y de las ideas liberales del siglo XIX, y sigue siendo el marco jurídico que organiza la vida política actual.",
            etiquetas: ["sentido histórico", "presente", "capacidad humana"],
          },
          {
            termino: "Memoria colectiva",
            definicion: "Conjunto de recuerdos, narrativas y representaciones que un grupo social comparte sobre su pasado, y que contribuye a construir y mantener su identidad. Es selectiva: algunas memorias se preservan y otras se silencian.",
            ejemplo: "La celebración del 16 de septiembre (Día de la Independencia) forma parte de la memoria colectiva mexicana: renueva el vínculo de la sociedad con el proceso de emancipación de 1810 y sus protagonistas (Hidalgo, Morelos, Allende).",
            etiquetas: ["memoria colectiva", "identidad", "narrativa"],
          },
          {
            termino: "Larga duración (Braudel)",
            definicion: "Concepto de Fernand Braudel (Escuela de los Annales) que distingue procesos históricos de muy larga duración (geografía, clima, estructuras sociales profundas) de los eventos coyunturales. Permite comprender continuidades estructurales.",
            ejemplo: "La desigualdad entre el norte y el sur de México tiene raíces de larga duración: el norte fue zona de presidios y minería colonial; el sur, zona de encomiendas y haciendas con mano de obra indígena. Esta estructura persiste en indicadores de desarrollo actuales.",
            etiquetas: ["larga duración", "Braudel", "estructura"],
          },
          {
            termino: "Presentismo histórico",
            definicion: "Error metodológico que consiste en interpretar el pasado con los valores, categorías y expectativas del presente, sin respetar el contexto histórico de la época estudiada.",
            ejemplo: "Juzgar a los conquistadores del siglo XVI con los valores de derechos humanos del siglo XXI es un ejemplo de presentismo. El historiador debe entender las acciones desde el contexto de su época, sin dejar de hacer juicios éticos fundamentados.",
            etiquetas: ["presentismo", "error historiográfico", "contexto"],
          },
          {
            termino: "Continuidad y ruptura histórica",
            definicion: "Toda época combina elementos que persisten del pasado (continuidades) con transformaciones o quiebres profundos (rupturas). El análisis histórico identifica ambos para comprender el cambio social.",
            ejemplo: "La Reforma Liberal de Juárez (1855-1867) representó una ruptura con el poder de la Iglesia y el orden colonial, pero también continuidades: el latifundismo persistió y los pueblos indígenas siguieron marginados.",
            etiquetas: ["continuidad", "ruptura", "cambio histórico"],
          },
          {
            termino: "Herencia histórica",
            definicion: "Conjunto de estructuras, instituciones, prácticas culturales, desigualdades y logros que el pasado lega al presente. La herencia histórica puede ser positiva (arte, ciencia, democracia) o negativa (desigualdad, discriminación).",
            ejemplo: "México hereda del período prehispánico una diversidad lingüística extraordinaria (68 agrupaciones lingüísticas indígenas), y del período colonial, la arquitectura virreinal y el sistema jurídico de raíces romanistas.",
            etiquetas: ["herencia histórica", "legado", "presente"],
          },
        ],
        actividad_final: "Selecciona UN fenómeno social, político o cultural del México actual (por ejemplo: la desigualdad de género, el presidencialismo, el día de muertos, el sistema de ejidos o la migración hacia Estados Unidos). Utilizando el sentido histórico, traza sus raíces históricas identificando al menos dos procesos del pasado que lo expliquen. Distingue qué es continuidad y qué ha cambiado. Concluye explicando por qué entender ese fenómeno históricamente cambia la forma en que lo ves.",
      },
    },
    {
      titulo: "Completa los espacios — Sentido histórico y pasado-presente",
      descripcion: "Completa los conceptos sobre el sentido histórico, la memoria colectiva y la relación entre pasado y presente.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término o concepto correcto.",
        texto_con_huecos: "El ___ histórico es la capacidad humana de comprender el presente como resultado de procesos ocurridos en el pasado. El historiador francés Fernand Braudel desarrolló el concepto de larga ___ para analizar procesos históricos de muy extensa duración que moldean estructuras sociales profundas. Interpretar el pasado con los valores del presente, sin respetar el contexto de la época, es un error llamado ___. La memoria ___ son los recuerdos y narrativas compartidos por un grupo social sobre su historia común.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "sentido",
            alternativas_aceptadas: [],
            pista: "La capacidad de comprender el presente desde el pasado se llama ___ histórico.",
          },
          {
            posicion: 1,
            respuesta_correcta: "duración",
            alternativas_aceptadas: [],
            pista: "Fernand Braudel habló de procesos de larga ___ para referirse a estructuras que cambian muy lentamente.",
          },
          {
            posicion: 2,
            respuesta_correcta: "presentismo",
            alternativas_aceptadas: [],
            pista: "El error de juzgar el pasado con criterios del presente se llama ___.",
          },
          {
            posicion: 3,
            respuesta_correcta: "colectiva",
            alternativas_aceptadas: [],
            pista: "La memoria ___ es el conjunto de recuerdos e identidades compartidas por una sociedad sobre su pasado.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Sentido histórico y relación pasado-presente",
      descripcion: "Reflexiona sobre tu capacidad para aplicar el sentido histórico y comprender el presente a partir del análisis del pasado.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Explico qué es el sentido histórico y por qué es una capacidad humana valiosa para comprender la realidad presente.", escala: escala4 },
          { descripcion: "Identifico continuidades y rupturas históricas en procesos de la historia de México (por ejemplo, entre la Colonia y el México independiente, o entre el Porfiriato y el México posrevolucionario).", escala: escala4 },
          { descripcion: "Distingo entre memoria colectiva (lo que una sociedad recuerda y celebra) e historia crítica (el análisis riguroso del pasado con fuentes), y reconozco que pueden diferir.", escala: escala4 },
          { descripcion: "Aplico el sentido histórico para explicar al menos un fenómeno del presente (social, político o cultural) a partir de sus raíces históricas, evitando el presentismo.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Por qué crees que es importante para un ciudadano mexicano del siglo XXI tener sentido histórico? Describe una situación concreta en la que entender el pasado te ayude a comprender mejor tu realidad actual o a tomar decisiones más informadas.",
      },
    },
  ],

  // ════════════ P04 — Procesos históricos de México y el mundo: multicausalidad e interconexión ════════════
  [
    {
      titulo: "Verdadero o Falso — Procesos históricos: multicausalidad e interconexión",
      descripcion: "Decide si cada afirmación sobre el análisis multicausal de procesos históricos de México y el mundo, y su interconexión en perspectiva global, es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "La multicausalidad histórica implica que los grandes procesos (guerras, revoluciones, crisis) tienen siempre una sola causa principal que los explica completamente.",
            respuesta: false,
            retroalimentacion: "Falso. La multicausalidad reconoce que los procesos históricos complejos son resultado de múltiples causas simultáneas: económicas, políticas, sociales, culturales e ideológicas, que se interrelacionan de manera compleja.",
          },
          {
            enunciado: "La Revolución Mexicana de 1910 puede analizarse en conexión con el contexto internacional de la época: el auge del imperialismo, la Belle Époque europea y las inversiones de capital extranjero en México durante el Porfiriato.",
            respuesta: true,
            retroalimentacion: "Correcto. La Revolución no fue un fenómeno aislado: el capital estadunidense e inglés en ferrocarriles, minería y petróleo mexicanos, así como las ideas anarquistas y socialistas en boga, influyeron en su desarrollo.",
          },
          {
            enunciado: "La Guerra Fría (1947-1991) fue un conflicto exclusivamente militar entre Estados Unidos y la URSS, sin impacto en México ni en América Latina.",
            respuesta: false,
            retroalimentacion: "Falso. La Guerra Fría impactó profundamente a México y América Latina: el gobierno mexicano reprimió movimientos de izquierda (como en 1968) por presión de EE.UU., y la Revolución Cubana (1959) generó tensiones regionales que afectaron las políticas internas de toda la región.",
          },
          {
            enunciado: "El análisis de procesos históricos en perspectiva global permite identificar cómo fenómenos locales (como la Independencia de México) se conectan con procesos más amplios (como las Revoluciones Atlánticas del siglo XVIII-XIX).",
            respuesta: true,
            retroalimentacion: "Correcto. La Independencia de México (1810-1821) se conecta con las Revoluciones Atlánticas: la Revolución Francesa, la Independencia de Estados Unidos (1776) y la Revolución Haitiana (1804) influyeron en las ideas y el contexto político que hicieron posible la emancipación novohispana.",
          },
          {
            enunciado: "La Ilustración del siglo XVIII fue un movimiento filosófico y científico europeo que no tuvo influencia en los procesos de independencia de América Latina.",
            respuesta: false,
            retroalimentacion: "Falso. Las ideas ilustradas (soberanía popular, derechos naturales, separación de poderes, razón como guía del gobierno) difundidas por Locke, Rousseau, Montesquieu y Voltaire influyeron directamente en los líderes e ideólogos de las independencias latinoamericanas, incluidos los insurgentes mexicanos.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Procesos históricos, multicausalidad e interconexión",
      descripcion: "Glosario interactivo sobre el análisis de procesos históricos de México y el mundo con perspectiva multicausal e interconectada.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Multicausalidad histórica",
            definicion: "Principio metodológico que reconoce que los procesos históricos complejos son resultado de múltiples causas simultáneas e interrelacionadas: factores económicos, políticos, sociales, culturales, ambientales e ideológicos. Ningún gran proceso tiene una sola causa.",
            ejemplo: "La Revolución Mexicana tuvo causas múltiples: la concentración de tierras en el porfiriato (económica), el fraude electoral de 1910 (política), las condiciones laborales en haciendas y minas (social), la influencia del liberalismo y el anarquismo (ideológica) y la sequía de 1909-1910 (ambiental).",
            etiquetas: ["multicausalidad", "causas", "método histórico"],
          },
          {
            termino: "Historia global e interconexión",
            definicion: "Enfoque historiográfico que analiza los procesos históricos reconociendo sus vínculos con contextos más amplios: regionales, continentales y mundiales. Ningún proceso es completamente local ni completamente global.",
            ejemplo: "El Porfiriato (1876-1910) no puede entenderse sin la conexión global: las inversiones de capital inglés y estadunidense en ferrocarriles, minería, petróleo y comunicaciones transformaron la economía y la sociedad mexicanas articulando a México con el mercado mundial.",
            etiquetas: ["historia global", "interconexión", "contexto mundial"],
          },
          {
            termino: "Revoluciones Atlánticas",
            definicion: "Concepto historiográfico que agrupa las revoluciones del siglo XVIII y principios del XIX (Revolución Americana 1776, Revolución Francesa 1789, Revolución Haitiana 1804, independencias latinoamericanas) como un fenómeno interconectado de transformación política en el Atlántico.",
            ejemplo: "La Constitución de Cádiz (1812) y la Declaración de Independencia de EE.UU. (1776) influyeron en el pensamiento de los insurgentes mexicanos como Morelos, que en los Sentimientos de la Nación (1813) recogió ideas ilustradas y republicanas.",
            etiquetas: ["Revoluciones Atlánticas", "independencias", "Ilustración"],
          },
          {
            termino: "Imperialismo y dependencia",
            definicion: "El imperialismo del siglo XIX-XX fue la expansión de las potencias europeas y de EE.UU. sobre territorios y economías de Asia, África y América Latina, generando relaciones de dependencia económica y política. México fue un caso típico de semicolonialismo económico.",
            ejemplo: "Durante el Porfiriato, empresas extranjeras controlaban el 70% de los ferrocarriles, la mayoría de las minas y los pozos petroleros de México. Esta dependencia generó reacciones nacionalistas que alimentaron la Revolución.",
            etiquetas: ["imperialismo", "dependencia", "economía"],
          },
          {
            termino: "Guerra Fría y América Latina",
            definicion: "Período (1947-1991) de tensión ideológica entre EE.UU. y la URSS que impactó profundamente a América Latina: golpes de Estado patrocinados, movimientos guerrilleros, Revolución Cubana (1959), y represión de movimientos sociales de izquierda bajo el pretexto anticomunista.",
            ejemplo: "En México, el gobierno del PRI utilizó el contexto de Guerra Fría para reprimir el Movimiento Estudiantil de 1968 (Tlatelolco) argumentando una amenaza comunista, cuando en realidad buscaba callar la crítica política interna.",
            etiquetas: ["Guerra Fría", "América Latina", "ideología"],
          },
          {
            termino: "Periodización histórica",
            definicion: "División convencional del tiempo histórico en períodos con características comunes, definidos por rupturas o transformaciones significativas. La periodización facilita el análisis pero es una construcción del historiador, no una división natural del tiempo.",
            ejemplo: "La historia de México se periodiza convencionalmente en: período prehispánico, Colonia (1521-1810), Independencia y siglo XIX (1810-1910), Revolución y siglo XX (1910-2000), México contemporáneo (2000-presente). Cada corte corresponde a una transformación política mayor.",
            etiquetas: ["periodización", "tiempo histórico", "metodología"],
          },
        ],
        actividad_final: "Elige UN proceso histórico de México o del mundo (sugerencias: la Conquista de México, la Revolución Industrial, la Segunda Guerra Mundial, la Revolución Cubana, el Tratado de Libre Comercio de América del Norte). Elabora un esquema de multicausalidad: identifica al menos 4 causas de diferente tipo (política, económica, social, ideológica/cultural). Luego, explica cómo ese proceso se conectó con fenómenos históricos de otras regiones del mundo.",
      },
    },
    {
      titulo: "Completa los espacios — Multicausalidad e interconexión histórica",
      descripcion: "Completa los conceptos sobre la multicausalidad y la interconexión de los procesos históricos de México y el mundo.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Completa los huecos con el término, nombre o año correcto.",
        texto_con_huecos: "El principio de ___ histórica reconoce que los grandes procesos no tienen una sola causa sino múltiples factores económicos, políticos, sociales e ideológicos. La Revolución Haitiana de 1804, la Revolución Francesa de 1789 y la Independencia de EE.UU. de 1776 forman parte de las Revoluciones ___ del siglo XVIII-XIX. Durante el Porfiriato, empresas extranjeras controlaban gran parte de los ___ (vías), minas y pozos de petróleo en México, generando dependencia económica. El período de tensión ideológica entre EE.UU. y la URSS (1947-1991) se conoce como Guerra ___.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "multicausalidad",
            alternativas_aceptadas: [],
            pista: "El principio que reconoce múltiples causas en los procesos históricos se llama ___.",
          },
          {
            posicion: 1,
            respuesta_correcta: "Atlánticas",
            alternativas_aceptadas: ["atlánticas"],
            pista: "Las revoluciones del Atlántico (Francia, EE.UU., Haití, latinoamerica) se conocen como Revoluciones ___.",
          },
          {
            posicion: 2,
            respuesta_correcta: "ferrocarriles",
            alternativas_aceptadas: ["ferrocarril"],
            pista: "Durante el Porfiriato, el capital extranjero dominaba los ___ como medio de transporte e inversión.",
          },
          {
            posicion: 3,
            respuesta_correcta: "Fría",
            alternativas_aceptadas: ["fría"],
            pista: "El período de tensión entre EE.UU. y la URSS sin confrontación militar directa se llama Guerra ___.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Procesos históricos: multicausalidad e interconexión",
      descripcion: "Reflexiona sobre tu capacidad para analizar procesos históricos de México y el mundo en perspectiva multicausal e interconectada.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio.",
        criterios: [
          { descripcion: "Aplico el principio de multicausalidad para analizar procesos históricos complejos, identificando causas de al menos tres tipos distintos (política, económica, social, ideológica, ambiental).", escala: escala4 },
          { descripcion: "Establezco conexiones entre procesos históricos locales (de México) y contextos históricos más amplios (latinoamericanos, mundiales), reconociendo su interconexión.", escala: escala4 },
          { descripcion: "Analizo el impacto de procesos históricos globales (Ilustración, imperialismo, Guerra Fría) en la historia de México, con ejemplos concretos y sustentados.", escala: escala4 },
          { descripcion: "Periodizo correctamente la historia de México en sus grandes etapas y puedo explicar qué ruptura histórica define el paso de un período al siguiente.", escala: escala4 },
        ],
        reflexion_final_prompt: "Elige un problema o conflicto del México o del mundo actual (puede ser la desigualdad, el cambio climático, la migración, el narcotráfico o la tensión geopolítica). ¿Qué procesos históricos lo explican? Identifica al menos tres causas históricas de diferente tipo (política, económica, cultural) y explica cómo ese problema actual es, en parte, resultado de decisiones y procesos del pasado.",
      },
    },
  ],
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });

/**
 * Seed de actividades pedagógicas para PFH-I (Pensamiento Filosófico y Humanidades I).
 * 5 progresiones × 3 actividades = 15 actividades. estado='borrador'.
 * A1=lectura, A2=quiz_multiple_opcion, A3=reflexion_escrita.
 * Uso: npx tsx scripts/seed-activities-pfhi.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🌱 Seed actividades PFH-I — Pensamiento Filosófico y Humanidades I\n");

  const progs = await getProgresionesDeUAC(sb, "PFH-I");
  let ok = 0; let fail = 0;

  for (const p of progs) {
    const base = p.codigo;

    const a1ok = await upsertActividad(sb, {
      codigo: `${base}-A1`,
      titulo: titulos[p.numero - 1].a1,
      descripcion: "Lectura de contextualización filosófica.",
      tipo: "lectura",
      progresion_id: p.id,
      xp: 10,
      contenido: lecturas[p.numero - 1],
    });
    a1ok ? ok++ : fail++;

    const a2ok = await upsertActividad(sb, {
      codigo: `${base}-A2`,
      titulo: titulos[p.numero - 1].a2,
      descripcion: "Quiz de comprensión conceptual filosófica.",
      tipo: "quiz_multiple_opcion",
      progresion_id: p.id,
      xp: 15,
      contenido: quizzes[p.numero - 1],
    });
    a2ok ? ok++ : fail++;

    const a3ok = await upsertActividad(sb, {
      codigo: `${base}-A3`,
      titulo: titulos[p.numero - 1].a3,
      descripcion: "Reflexión filosófica escrita de cierre.",
      tipo: "reflexion_escrita",
      progresion_id: p.id,
      xp: 20,
      contenido: reflexiones[p.numero - 1],
    });
    a3ok ? ok++ : fail++;
  }

  log(`\n✅ PFH-I: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── TÍTULOS ───────────────────────────────────────────────────────────────────

const titulos = [
  { a1: "¿Qué significa filosofar?", a2: "Filosofar vs. saber filosofía", a3: "Mi primera pregunta filosófica" },
  { a1: "Tipos de preguntas: científicas, cotidianas y filosóficas", a2: "¿Qué tipo de pregunta es esta?", a3: "Una pregunta que no puedo dejar de hacerme" },
  { a1: "Problemas filosóficos que nos tocan", a2: "Identidad, libertad y justicia: conceptos clave", a3: "El problema filosófico que me inquieta" },
  { a1: "El diálogo como método filosófico", a2: "¿Cómo dialogar filosóficamente?", a3: "Diálogo filosófico sobre un problema real" },
  { a1: "La filosofía no es solo occidental", a2: "Tradiciones filosóficas del mundo", a3: "Filosofía desde mi propio lugar" },
];

// ── LECTURAS (A1) ─────────────────────────────────────────────────────────────

const lecturas = [
  { // P01 — filosofar como práctica
    texto: `Filosofar no es lo mismo que saber filosofía. Una persona puede memorizar las ideas de Platón, Descartes o Kant sin haber filosofado nunca. Filosofar es el acto de preguntarse, de no dar por sentado lo que parece obvio, de detenerse ante algo y preguntarse: "¿Por qué? ¿Qué es realmente esto? ¿Podría ser de otra manera?"\n\nEstos actos de extrañamiento ante la realidad —lo que los griegos llamaban thaumazein (asombro)— son el punto de partida de la filosofía. Aristóteles decía que "los hombres comenzaron a filosofar movidos por la admiración". No por la comodidad, sino por el desconcierto: por el momento en que algo que parecía simple se vuelve misterioso.\n\nFilosofar es una práctica que no requiere libros especializados ni vocabulario técnico. Ocurre cuando un niño pregunta "¿por qué tenemos que morir?" y nadie tiene una respuesta satisfactoria. Ocurre cuando alguien se pregunta "¿es justo lo que le está pasando a esa persona?". Ocurre cuando alguien duda de algo que todos a su alrededor dan por hecho.\n\nLa diferencia entre filosofar y simplemente opinar es la disposición a sostener la pregunta, a no conformarse con respuestas fáciles, a considerar múltiples posibilidades y a revisar constantemente las propias ideas. El filósofo no es quien tiene las respuestas: es quien sabe habitar las preguntas.`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 8,
    preguntas_comprension: [
      { pregunta: "¿Cuál es la diferencia entre filosofar y saber filosofía?", respuesta_guia: "Saber filosofía es conocer las ideas de otros; filosofar es el acto propio de preguntarse, dudar y reflexionar." },
      { pregunta: "¿Qué es el thaumazein y por qué importa en filosofía?", respuesta_guia: "Es el asombro o extrañamiento ante la realidad; es el punto de partida de la actitud filosófica." },
      { pregunta: "¿Qué diferencia al filosófico del que simplemente opina?", respuesta_guia: "El filósofo sostiene la pregunta, no se conforma con respuestas fáciles y revisa constantemente sus ideas." },
    ],
  },
  { // P02 — tipos de preguntas
    texto: `No todas las preguntas son iguales. La filosofía se distingue por el tipo de preguntas que hace, no solo por las respuestas que busca. Podemos distinguir al menos tres tipos de preguntas:\n\nLas preguntas cotidianas tienen respuestas inmediatas y prácticas: "¿Qué hora es?", "¿Cuánto cuesta este producto?", "¿Dónde está el baño?". Son importantes para la vida diaria, pero no requieren reflexión profunda.\n\nLas preguntas científicas buscan explicaciones de fenómenos a través de la observación, la experimentación y la evidencia empírica: "¿Por qué se propagan los virus?", "¿Cómo se forman las estrellas?". Las respuestas pueden ser provisionales pero son verificables.\n\nLas preguntas filosóficas son aquellas que no pueden responderse solo con datos o experimentos, y cuya respuesta requiere reflexión conceptual y análisis de supuestos. Se dividen en varias áreas: la ontología pregunta por el ser ("¿Qué existe realmente?"), la epistemología por el conocimiento ("¿Cómo sabemos lo que sabemos?"), la ética por el bien y lo correcto ("¿Qué debemos hacer?"), la estética por la belleza y el arte ("¿Qué es lo bello?"), y la filosofía política por el poder y la justicia ("¿Qué hace legítimo a un gobierno?").\n\nMuchas preguntas cotidianas se vuelven filosóficas cuando profundizamos en ellas. "¿Qué hora es?" puede volverse "¿Qué es el tiempo?"`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 9,
    preguntas_comprension: [
      { pregunta: "¿Cuál es la característica de las preguntas científicas?", respuesta_guia: "Se responden mediante observación, experimentación y evidencia empírica verificable." },
      { pregunta: "¿Qué estudia la epistemología?", respuesta_guia: "El conocimiento: cómo sabemos lo que sabemos." },
      { pregunta: "¿Cómo puede una pregunta cotidiana volverse filosófica?", respuesta_guia: "Cuando profundizamos en ella, como '¿Qué hora es?' se vuelve '¿Qué es el tiempo?'" },
    ],
  },
  { // P03 — problemas filosóficos contemporáneos
    texto: `La filosofía no es solo historia de ideas antiguas: aborda problemas que nos tocan en la vida real. Tres de los más fundamentales son la identidad, la libertad y la justicia.\n\nLa identidad es el problema de quiénes somos. ¿Somos el mismo "yo" que éramos de niños, si nuestro cuerpo y nuestros pensamientos han cambiado tanto? ¿La identidad es algo fijo (una esencia) o algo que construimos constantemente a través de nuestras elecciones y relaciones? ¿Podemos ser parte de varios grupos (una comunidad, una nación, una familia, un género) sin que eso nos contradiga?\n\nLa libertad plantea preguntas sobre si realmente podemos elegir o si estamos determinados por nuestros genes, nuestra historia, nuestra cultura, el algoritmo de nuestro celular o las condiciones económicas en que vivimos. ¿Es posible ser libre en una sociedad que impone normas y expectativas? ¿La libertad sin condiciones materiales es real?\n\nLa justicia pregunta por los criterios correctos para distribuir los beneficios y las cargas de la vida en común. ¿Qué hace que algo sea justo o injusto? ¿Es justo que algunos nazcan en la riqueza y otros en la pobreza sin haberlo elegido? ¿Qué le debemos a quienes más necesitan?\n\nEstos no son problemas abstractos: están en las noticias, en las conversaciones de familia, en las decisiones cotidianas y en las políticas públicas. Filosofarlos significa pensarlos más profundamente, con más rigor y apertura.`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 9,
    preguntas_comprension: [
      { pregunta: "¿Cuál es el problema filosófico de la identidad?", respuesta_guia: "Quiénes somos: si la identidad es fija o se construye, y si podemos pertenecer a múltiples grupos." },
      { pregunta: "¿Qué cuestiona el problema filosófico de la libertad?", respuesta_guia: "Si realmente podemos elegir o si estamos determinados por genes, historia, cultura y condiciones económicas." },
      { pregunta: "¿Qué pregunta la filosofía sobre la justicia?", respuesta_guia: "Los criterios correctos para distribuir beneficios y cargas en la vida social: qué hace justo o injusto algo." },
    ],
  },
  { // P04 — diálogo filosófico
    texto: `El diálogo filosófico tiene una larga historia que comienza con Sócrates, quien no escribió ningún libro, pero pasó su vida conversando en las plazas de Atenas. Para Sócrates, el conocimiento no se transmite de un experto a un ignorante: emerge del encuentro entre personas que piensan juntas, se preguntan juntas y se cuestionan mutuamente.\n\nEl diálogo filosófico tiene características que lo distinguen de una discusión ordinaria o de un debate. En un debate, el objetivo es ganar: convencer al otro de que uno tiene razón. En el diálogo filosófico, el objetivo es pensar mejor juntos: llegar a comprensiones más profundas que ninguno de los participantes habría alcanzado solo. Esto requiere escuchar con apertura real, no solo esperar turno para hablar.\n\nAlgunas reglas del diálogo filosófico incluyen: formular preguntas en lugar de afirmaciones cuando sea posible, reconocer cuando el otro tiene un buen punto aunque contradiga nuestra posición, distinguir entre atacar una idea y atacar a la persona, y estar dispuesto a cambiar de opinión ante buenos argumentos.\n\nEl diálogo filosófico también permite reformular las propias ideas: al intentar explicarlas a otros, a veces descubrimos que no las teníamos tan claras como creíamos. Al escuchar objeciones, encontramos los límites y las inconsistencias de nuestros propios argumentos. El diálogo es, en ese sentido, una herramienta de autoconocimiento.`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 8,
    preguntas_comprension: [
      { pregunta: "¿Por qué el texto dice que Sócrates es importante aunque no escribió libros?", respuesta_guia: "Porque inventó el método del diálogo filosófico: pensar juntos a través de la conversación." },
      { pregunta: "¿Cuál es la diferencia entre un debate y el diálogo filosófico?", respuesta_guia: "En el debate se busca ganar; en el diálogo filosófico se busca pensar mejor juntos." },
      { pregunta: "¿Por qué el diálogo es también una herramienta de autoconocimiento?", respuesta_guia: "Porque al explicar nuestras ideas a otros y recibir objeciones, descubrimos sus límites e inconsistencias." },
    ],
  },
  { // P05 — diversidad de tradiciones filosóficas
    texto: `Durante mucho tiempo, la filosofía que se enseñó en las escuelas del mundo hispanohablante fue principalmente filosofía occidental: griega, romana, medieval europea, moderna y contemporánea europea y norteamericana. Esta visión ignoró siglos de reflexión filosófica de otras culturas y continentes.\n\nLa filosofía oriental tiene tradiciones milenarias igualmente rigurosas y profundas. El confucianismo chino exploró la ética de las relaciones humanas, la virtud y el orden social. El budismo analizó la naturaleza del sufrimiento, la mente y el camino hacia la liberación. El taoísmo reflexionó sobre la armonía con el cosmos y el fluir de la existencia. El vedanta hindú exploró las preguntas del ser, la conciencia y la identidad del yo.\n\nLas filosofías indígenas de América, África y Oceanía también tienen respuestas sofisticadas a preguntas fundamentales sobre la vida, la muerte, la naturaleza, la comunidad y la justicia. En México, las cosmovisiones nahua, maya, zapoteca y de otros pueblos ofrecen formas de pensar el mundo que no son inferiores a las tradiciones occidentales, sino diferentes y complementarias.\n\nReconocer esta diversidad no significa relativismo (que todas las ideas son igualmente válidas sin importar su contenido). Significa ampliar el horizonte filosófico: tener más herramientas para pensar, más preguntas, más perspectivas desde las cuales comprender el mundo y nuestra propia experiencia.`,
    fuente: "Material elaborado para CEN Bachillerato",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 9,
    preguntas_comprension: [
      { pregunta: "¿Qué exploró el confucianismo chino?", respuesta_guia: "La ética de las relaciones humanas, la virtud y el orden social." },
      { pregunta: "¿Por qué el texto dice que las filosofías indígenas no son inferiores a las occidentales?", respuesta_guia: "Porque son diferentes y complementarias; ofrecen respuestas sofisticadas a preguntas fundamentales sobre la existencia." },
      { pregunta: "¿Qué significa 'ampliar el horizonte filosófico'?", respuesta_guia: "Tener más herramientas para pensar: más preguntas y perspectivas desde distintas tradiciones para comprender el mundo." },
    ],
  },
];

// ── QUIZZES (A2) ──────────────────────────────────────────────────────────────

const quizzes = [
  { // P01 — filosofar
    preguntas: [
      { enunciado: "¿Cuál de estas actividades es un ejemplo de 'filosofar'?", opciones: ["Memorizar las fechas de nacimiento de filósofos famosos", "Detenerse ante la pregunta '¿por qué existe algo en lugar de nada?' y explorarla sin conformarse con respuestas fáciles", "Resumir las ideas de Platón en una ficha", "Aprobar un examen de historia de la filosofía"], respuesta_correcta: 1, retroalimentacion: "Filosofar es el acto de preguntarse y reflexionar, no acumular información sobre filósofos." },
      { enunciado: "¿Qué es el thaumazein según el texto?", opciones: ["Un filósofo griego", "El asombro o extrañamiento ante la realidad que da inicio a la actitud filosófica", "Un método de argumentación formal", "Un tipo de pregunta científica"], respuesta_correcta: 1, retroalimentacion: "El thaumazein es el asombro ante lo aparentemente obvio; Aristóteles lo identificó como origen de la filosofía." },
      { enunciado: "¿Por qué el filósofo 'habita las preguntas' en lugar de buscar respuestas definitivas?", opciones: ["Porque es incapaz de encontrar respuestas", "Porque las preguntas filosóficas no admiten respuestas simples y requieren reflexión continua", "Porque las respuestas filosóficas están prohibidas", "Porque los filósofos prefieren la ignorancia"], respuesta_correcta: 1, retroalimentacion: "Las preguntas filosóficas son tan profundas que habitarlas con rigor ya es un acto de pensamiento valioso." },
      { enunciado: "¿En qué se diferencia filosofar de simplemente opinar?", opciones: ["En que los filósofos tienen títulos universitarios", "En la disposición a sostener la pregunta, revisar las ideas y no conformarse con respuestas fáciles", "En que se usa un lenguaje muy técnico", "En que se hace en silencio"], respuesta_correcta: 1, retroalimentacion: "Opinar es expresar una postura; filosofar implica someter esa postura a análisis riguroso y revisión constante." },
      { enunciado: "¿Cuál de estos actos es filosofar aunque ocurra fuera de la escuela?", opciones: ["Leer una noticia sin cuestionarla", "Preguntarse '¿es justo lo que está pasando?' y no aceptar la primera respuesta que viene a la mente", "Ver una película de acción", "Memorizar un poema"], respuesta_correcta: 1, retroalimentacion: "Cuestionar la justicia de una situación y no conformarse con respuestas rápidas es una forma cotidiana de filosofar." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P02 — tipos de preguntas
    preguntas: [
      { enunciado: "¿A qué tipo de pregunta pertenece '¿Cómo se forman los terremotos?'?", opciones: ["Pregunta filosófica (ontológica)", "Pregunta cotidiana", "Pregunta científica", "Pregunta ética"], respuesta_correcta: 2, retroalimentacion: "Esta pregunta se responde mediante observación y evidencia empírica: es una pregunta científica." },
      { enunciado: "¿Cuál de estas es una pregunta filosófica?", opciones: ["¿Cuántos habitantes tiene México?", "¿A qué temperatura hierve el agua?", "¿Podemos conocer realmente la realidad o solo nuestras percepciones de ella?", "¿Cuándo nació Napoleón?"], respuesta_correcta: 2, retroalimentacion: "La pregunta sobre si podemos conocer la realidad es epistemológica (filosófica): no se responde solo con datos." },
      { enunciado: "¿Qué estudia la ética como rama filosófica?", opciones: ["La belleza y el arte", "El ser y la existencia", "El bien, lo correcto y lo que debemos hacer", "El poder y la legitimidad política"], respuesta_correcta: 2, retroalimentacion: "La ética es la rama de la filosofía que estudia el bien, la moral y qué debemos hacer." },
      { enunciado: "¿Por qué las preguntas filosóficas no pueden responderse solo con datos o experimentos?", opciones: ["Porque los filósofos no saben hacer experimentos", "Porque requieren reflexión conceptual y análisis de supuestos, no solo evidencia empírica", "Porque las respuestas filosóficas son secretas", "Porque son preguntas sin respuesta"], respuesta_correcta: 1, retroalimentacion: "Preguntas como '¿qué es la justicia?' no se responden midiendo ni experimentando, sino analizando conceptos y supuestos." },
      { enunciado: "¿Qué pregunta es ejemplo de ontología?", opciones: ["¿Qué debemos hacer ante la injusticia?", "¿Qué existe realmente?", "¿Cómo sabemos lo que sabemos?", "¿Qué hace legítimo a un gobierno?"], respuesta_correcta: 1, retroalimentacion: "La ontología es la rama filosófica que pregunta por el ser: qué existe realmente y cuál es su naturaleza." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P03 — problemas filosóficos
    preguntas: [
      { enunciado: "¿Cuál de estos es un problema filosófico de identidad?", opciones: ["¿Cuál es la capital de Francia?", "¿Soy el mismo 'yo' que era hace 10 años si mi cuerpo y pensamientos han cambiado?", "¿Cuánto cuesta el transporte público?", "¿Qué temperatura hace afuera?"], respuesta_correcta: 1, retroalimentacion: "La pregunta por la continuidad de la identidad a lo largo del tiempo es un problema clásico de filosofía de la identidad." },
      { enunciado: "¿Qué cuestiona el problema filosófico de la libertad?", opciones: ["Si tenemos permiso legal para hacer ciertas cosas", "Si realmente podemos elegir o si estamos determinados por genes, cultura y condiciones económicas", "Si existe Dios o no", "Si la democracia es mejor que la dictadura"], respuesta_correcta: 1, retroalimentacion: "El problema filosófico de la libertad pregunta si el libre albedrío es real o si estamos determinados por factores externos." },
      { enunciado: "¿Qué hace filosófica a la pregunta '¿Es justo que algunos nazcan ricos y otros pobres?'?", opciones: ["Que es una pregunta sobre economía", "Que se puede responder con estadísticas", "Que requiere reflexión sobre los criterios de justicia, no solo datos", "Que tiene una respuesta obvia y conocida"], respuesta_correcta: 2, retroalimentacion: "Esta pregunta requiere reflexionar sobre qué es la justicia, qué merecemos por nacimiento, y cuáles son nuestras obligaciones: es filosófica." },
      { enunciado: "¿Por qué los problemas filosóficos no son abstractos según el texto?", opciones: ["Porque están en los libros de texto", "Porque están en las noticias, las conversaciones cotidianas y las decisiones políticas", "Porque los filósofos los aplican en experimentos", "Porque tienen respuestas concretas verificables"], respuesta_correcta: 1, retroalimentacion: "El texto muestra que la identidad, libertad y justicia se manifiestan en situaciones reales y cotidianas." },
      { enunciado: "Una persona pregunta: '¿Soy libre si vivo en una sociedad que determina mis opciones por mi clase social?' ¿De qué tipo de problema filosófico se trata?", opciones: ["Estética", "Ontología", "Libertad y determinismo", "Lógica"], respuesta_correcta: 2, retroalimentacion: "Esta pregunta combina el problema de la libertad con el del determinismo social: ¿qué tanto nos determinan las condiciones externas?" },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P04 — diálogo filosófico
    preguntas: [
      { enunciado: "¿Cuál es el objetivo del diálogo filosófico según el texto?", opciones: ["Ganar el debate convenciendo al otro", "Pensar mejor juntos y llegar a comprensiones más profundas", "Imponer las ideas del más elocuente", "Memorizar los argumentos de cada filósofo"], respuesta_correcta: 1, retroalimentacion: "A diferencia del debate, el diálogo filosófico busca pensar mejor juntos, no vencer al oponente." },
      { enunciado: "¿Qué significa 'escuchar con apertura real' en un diálogo filosófico?", opciones: ["Escuchar en silencio mientras esperas tu turno", "Estar genuinamente dispuesto a que los argumentos del otro modifiquen tu propia postura", "Grabar lo que dice el otro para usarlo en su contra", "Asentir a todo lo que dice el otro"], respuesta_correcta: 1, retroalimentacion: "La escucha activa implica estar abierto a que los argumentos del otro realmente cambien tu forma de pensar." },
      { enunciado: "¿Por qué el método socrático usa más preguntas que afirmaciones?", opciones: ["Porque Sócrates no sabía las respuestas", "Porque las preguntas invitan al otro a pensar por sí mismo en lugar de recibir respuestas pasivamente", "Porque era más fácil que argumentar directamente", "Porque estaba prohibido hacer afirmaciones en Atenas"], respuesta_correcta: 1, retroalimentacion: "Las preguntas invitan a pensar; las afirmaciones imponen. El método socrático invita al interlocutor a descubrir por sí mismo." },
      { enunciado: "¿Cómo puede el diálogo ser una herramienta de autoconocimiento?", opciones: ["Porque los otros nos dicen quiénes somos", "Porque al explicar ideas a otros y recibir objeciones, descubrimos los límites de nuestros propios argumentos", "Porque el diálogo siempre nos hace cambiar de opinión", "Porque las ideas que no podemos defender no valen"], respuesta_correcta: 1, retroalimentacion: "Al intentar articular nuestras ideas y enfrentar objeciones, descubrimos sus inconsistencias y las clarificamos." },
      { enunciado: "¿Cuál de estas actitudes es contraria al diálogo filosófico?", opciones: ["Reformular la propia postura cuando el otro presenta un buen argumento", "Distinguir entre atacar una idea y atacar a la persona", "Insistir en la postura inicial sin importar los argumentos del otro", "Reconocer los puntos válidos de la postura contraria"], respuesta_correcta: 2, retroalimentacion: "La rigidez — no cambiar de postura ante buenos argumentos — es opuesta al espíritu filosófico de apertura y revisión." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
  { // P05 — diversidad filosófica
    preguntas: [
      { enunciado: "¿Qué estudia el confucianismo chino?", opciones: ["La naturaleza del universo físico", "La ética de las relaciones humanas, la virtud y el orden social", "La existencia de Dios", "El número y la geometría"], respuesta_correcta: 1, retroalimentacion: "El confucianismo es una tradición filosófica centrada en las relaciones humanas, la virtud y el orden social." },
      { enunciado: "¿Qué significa que las filosofías indígenas son 'complementarias' a las occidentales?", opciones: ["Que son secundarias e inferiores", "Que ofrecen perspectivas diferentes que enriquecen el horizonte filosófico", "Que deben combinarse con la filosofía occidental para ser válidas", "Que son solo tradiciones culturales, no filosofía"], respuesta_correcta: 1, retroalimentacion: "Complementarias significa que cada una aporta perspectivas distintas que enriquecen la comprensión del mundo." },
      { enunciado: "¿Qué reconoce la filosofía taoísta según el texto?", opciones: ["La naturaleza del sufrimiento y la liberación", "La armonía con el cosmos y el fluir de la existencia", "Los principios de la ética de las relaciones humanas", "Las preguntas sobre el ser y la conciencia"], respuesta_correcta: 1, retroalimentacion: "El taoísmo reflexiona sobre la armonía con el cosmos y el fluir natural de la existencia." },
      { enunciado: "¿Por qué reconocer la diversidad filosófica no es relativismo?", opciones: ["Porque el relativismo es una postura filosófica válida", "Porque significa ampliar el horizonte filosófico con más herramientas, no afirmar que todas las ideas son igualmente válidas", "Porque los filósofos están de acuerdo en que el relativismo es verdadero", "Porque la diversidad filosófica es una ilusión"], respuesta_correcta: 1, retroalimentacion: "Diversidad filosófica es tener más perspectivas para pensar, no afirmar que cualquier idea vale lo mismo sin análisis." },
      { enunciado: "¿Cuál es una cosmovisión filosófica de un pueblo indígena mexicano?", opciones: ["El budismo", "El confucianismo", "La cosmovisión nahua o maya", "El vedanta hindú"], respuesta_correcta: 2, retroalimentacion: "Las cosmovisiones nahua, maya, zapoteca y otras son tradiciones filosóficas de pueblos originarios de México." },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },
];

// ── REFLEXIONES (A3) ──────────────────────────────────────────────────────────

const reflexiones = [
  { // P01 — filosofar
    prompt: "Describe una situación concreta en tu vida donde hayas 'filosofado' sin saberlo: un momento en que te preguntaste algo que no tenía respuesta fácil y no te conformaste con la primera respuesta. ¿Cuál fue esa pregunta? ¿A qué conclusiones llegaste (si es que llegaste a alguna)? ¿Qué significó para ti no tener una respuesta definitiva?",
    pistas: ["¿Alguna vez te preguntaste por qué existe el mal o el sufrimiento?", "¿Has cuestionado una regla o norma que todo el mundo acepta sin cuestionar?", "¿Hubo un momento donde algo 'obvio' dejó de parecerte obvio?"],
    longitud_minima_palabras: 100,
    longitud_maxima_palabras: 300,
    criterios_evaluacion: ["Describe una experiencia concreta de asombro o cuestionamiento filosófico", "Articula la pregunta con claridad", "Reflexiona sobre el proceso de pensar sin respuesta definitiva", "Muestra disposición a habitar la pregunta sin aferrarse a una sola respuesta"],
    formato_esperado: "libre" as const,
  },
  { // P02 — tipos de preguntas
    prompt: "Elige una pregunta que tengas actualmente sobre la vida, la sociedad o el mundo y clasifícala: ¿es cotidiana, científica o filosófica? Luego explora esa pregunta: ¿qué rama filosófica le correspondería (ética, ontología, epistemología, estética, filosofía política)? ¿Qué respuestas tentativas tienes? ¿Por qué no te satisfacen del todo?",
    pistas: ["¿Tienes alguna pregunta sobre si lo que haces es lo correcto?", "¿Te preguntas si el mundo es como lo percibes o si tu percepción lo distorsiona?", "¿Tienes dudas sobre si la sociedad en que vives es justa?"],
    longitud_minima_palabras: 100,
    longitud_maxima_palabras: 300,
    criterios_evaluacion: ["Identifica y clasifica correctamente el tipo de pregunta", "Asigna la rama filosófica correspondiente con justificación", "Explora respuestas tentativas con honestidad intelectual", "Articula por qué esas respuestas no lo/la satisfacen plenamente"],
    formato_esperado: "libre" as const,
  },
  { // P03 — problemas filosóficos
    prompt: "Elige uno de los tres problemas filosóficos estudiados (identidad, libertad o justicia) y explora cómo se manifiesta en tu propia vida. ¿Hay algo en tu experiencia personal que te haga dudar, que te genere incomodidad o que te parezca injusto cuando piensas en ese problema? ¿Cómo afecta ese problema filosófico tus decisiones cotidianas?",
    pistas: ["¿Tienes claridad sobre quién eres y qué te define (identidad)?", "¿Sientes que tus elecciones son realmente libres o están muy condicionadas (libertad)?", "¿Hay algo en tu vida o entorno que te parece profundamente injusto (justicia)?"],
    longitud_minima_palabras: 100,
    longitud_maxima_palabras: 350,
    criterios_evaluacion: ["Elige claramente uno de los tres problemas y lo vincula con su experiencia", "Describe una situación concreta donde ese problema aparece", "Reflexiona sobre cómo ese problema afecta sus decisiones", "Muestra pensamiento genuinamente filosófico, no solo opinión"],
    formato_esperado: "libre" as const,
  },
  { // P04 — diálogo filosófico
    prompt: "Elige un tema filosófico que te interese (puede ser uno de los estudiados u otro) y escribe un breve diálogo filosófico ficticio entre dos personas con posturas diferentes. Muestra cómo se escuchan, se cuestionan y, si es posible, cómo alguno reformula su postura. Luego reflexiona: ¿qué aprendiste al escribir ese diálogo?",
    pistas: ["El diálogo no necesita llegar a una conclusión: puede terminar con más preguntas que respuestas", "Cada persona debe tener al menos 3 intervenciones", "Intenta que los argumentos de ambos sean fuertes, no que uno sea claramente 'el malo'"],
    longitud_minima_palabras: 100,
    longitud_maxima_palabras: 400,
    criterios_evaluacion: ["El diálogo muestra escucha real entre los personajes", "Al menos uno de los personajes reformula o matiza su postura", "Los argumentos de ambos personajes son coherentes y fuertes", "La reflexión final muestra aprendizaje del proceso de escritura"],
    formato_esperado: "libre" as const,
  },
  { // P05 — diversidad filosófica
    prompt: "Investiga brevemente una tradición filosófica que no sea occidental (puede ser una cosmovisión indígena mexicana, una tradición oriental o africana). ¿Qué pregunta filosófica aborda? ¿Qué respuesta o perspectiva ofrece? ¿En qué se parece y en qué se diferencia de alguna idea filosófica occidental que conozcas? ¿Qué te aporta esa perspectiva para pensar tu propio mundo?",
    pistas: ["Puedes investigar el concepto nahua de 'In Lak'ech' (en el otro me encuentro yo)", "Puedes explorar el ubuntu africano ('soy porque somos')", "Puedes buscar cómo el budismo entiende el sufrimiento y compararlo con el estoicismo griego"],
    longitud_minima_palabras: 100,
    longitud_maxima_palabras: 350,
    criterios_evaluacion: ["Identifica y describe con precisión una tradición filosófica no occidental", "Compara al menos un concepto con una idea filosófica occidental", "Reflexiona sobre lo que esa perspectiva le aporta para pensar su propio mundo", "Muestra apertura e interés genuino por la diversidad filosófica"],
    formato_esperado: "libre" as const,
  },
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });

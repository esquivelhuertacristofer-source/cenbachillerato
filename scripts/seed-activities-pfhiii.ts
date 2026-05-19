/**
 * Seed de actividades pedagógicas para PFH-III (Pensamiento Filosófico y Humanidades III).
 * 4 propósitos × 3 actividades = 12 actividades. estado='publicada'.
 * Tipos: glosario_interactivo, lectura, video_con_preguntas,
 *        quiz_multiple_opcion, debate_estructurado, reflexion_escrita, autoevaluacion
 * Uso: npx tsx scripts/seed-activities-pfhiii.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🌱 Seed actividades PFH-III — Pensamiento Filosófico y Humanidades III\n");

  const progs = await getProgresionesDeUAC(sb, "PFH-III");
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
      descripcion: "Práctica de verificación y análisis filosófico.",
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
      descripcion: "Aplicación crítica: debate o reflexión filosófica de cierre.",
      tipo: tiposA3[n - 1],
      progresion_id: p.id,
      xp: 20,
      estado: "publicada",
      contenido: contenidosA3[n - 1],
    });
    a3ok ? ok++ : fail++;
  }

  log(`\n✅ PFH-III: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

const titulos = [
  { a1: "Glosario lógico: del silogismo a las falacias", a2: "Falacias y argumentos válidos: ¿qué tan bueno es el razonamiento?", a3: "Debate: ¿La desobediencia civil está justificada en una democracia?" },
  { a1: "Filosofía política: poder, Estado y justicia social", a2: "Rawls, Nussbaum y Dussel: ¿qué tipo de Estado queremos?", a3: "Debate: ¿El Estado debe garantizar la justicia social o solo las libertades individuales?" },
  { a1: "Estética filosófica: lo bello, lo sublime y lo grotesco", a2: "Arte y conocimiento: preguntas filosóficas sobre la experiencia estética", a3: "Reflexión: Mi experiencia estética cotidiana como conocimiento filosófico" },
  { a1: "Praxis filosófica: pensar para transformar", a2: "Autoevaluación: avance en mi proyecto filosófico comunitario", a3: "Reflexión: ¿Qué problema de mi comunidad puede abordarse filosóficamente?" },
];

const tiposA1 = ["glosario_interactivo", "lectura", "video_con_preguntas", "lectura"] as const;
const tiposA2 = ["quiz_multiple_opcion", "quiz_multiple_opcion", "quiz_multiple_opcion", "autoevaluacion"] as const;
const tiposA3 = ["debate_estructurado", "debate_estructurado", "reflexion_escrita", "reflexion_escrita"] as const;

// ── A1 ──────────────────────────────────────────────────────────────────────────
const contenidosA1 = [
  { // P01 — glosario_interactivo (Lógica y argumentación)
    terminos: [
      {
        termino: "Falacia",
        definicion: "Error en el razonamiento que hace que un argumento parezca válido o convincente sin serlo realmente. Puede ser formal (violar las reglas lógicas) o informal (usar recursos retóricos engañosos).",
        ejemplo: "Decir 'si permites el matrimonio igualitario, después querrán casarse con animales' es una falacia de pendiente resbaladiza: supone consecuencias extremas sin justificación.",
        etiquetas: ["lógica", "argumentación", "error de razonamiento"],
      },
      {
        termino: "Silogismo",
        definicion: "Forma de razonamiento deductivo compuesto por dos premisas y una conclusión que se deriva de ellas necesariamente. Fue formalizado por Aristóteles.",
        ejemplo: "P1: Todos los humanos son mortales. P2: Sócrates es humano. Conclusión: Sócrates es mortal. Este es el silogismo más famoso de la filosofía.",
        etiquetas: ["lógica", "deducción", "Aristóteles"],
      },
      {
        termino: "Deducción",
        definicion: "Tipo de razonamiento en el que la conclusión se sigue necesariamente de las premisas: si las premisas son verdaderas, la conclusión no puede ser falsa.",
        ejemplo: "Si sabemos que todos los mamíferos tienen sangre caliente y que la ballena es un mamífero, deducimos necesariamente que la ballena tiene sangre caliente.",
        etiquetas: ["lógica", "razonamiento", "certeza"],
      },
      {
        termino: "Inducción",
        definicion: "Tipo de razonamiento que va de casos particulares a una conclusión general. A diferencia de la deducción, la conclusión es probable pero no necesariamente verdadera.",
        ejemplo: "He observado miles de cisnes y todos son blancos; por inducción concluyo que todos los cisnes son blancos. Pero un solo cisne negro refuta la conclusión.",
        etiquetas: ["lógica", "razonamiento", "generalización", "ciencia"],
      },
      {
        termino: "Abducción",
        definicion: "Tipo de razonamiento que infiere la explicación más plausible para un hecho observado. Es el razonamiento del diagnóstico y la investigación científica.",
        ejemplo: "El piso está mojado. La mejor explicación es que llovió (abducción). No es seguro, pero es la hipótesis más razonable dado lo que observo.",
        etiquetas: ["lógica", "inferencia", "hipótesis", "Peirce"],
      },
      {
        termino: "Premisa",
        definicion: "Afirmación o proposición que sirve como punto de partida de un argumento y que se usa para apoyar la conclusión.",
        ejemplo: "En el argumento 'el tabaco causa cáncer, luego fumar es peligroso', la premisa es que el tabaco causa cáncer.",
        etiquetas: ["lógica", "argumento", "estructura"],
      },
      {
        termino: "Conclusión",
        definicion: "Afirmación que se deriva de las premisas de un argumento y que el argumento pretende demostrar o apoyar.",
        ejemplo: "En un buen argumento, la conclusión no puede ser verdadera si las premisas son falsas (deducción válida) o tiene alta probabilidad de serlo (inducción fuerte).",
        etiquetas: ["lógica", "argumento", "estructura"],
      },
      {
        termino: "Argumento válido",
        definicion: "Argumento cuya estructura lógica garantiza que si las premisas son verdaderas, la conclusión también lo es. La validez es una propiedad formal, independiente del contenido.",
        ejemplo: "Un argumento puede ser válido pero tener premisas falsas: 'Todos los pájaros son azules. El águila es un pájaro. Luego el águila es azul.' Es válido (la forma es correcta) pero las premisas son falsas.",
        etiquetas: ["lógica", "validez", "estructura formal"],
      },
      {
        termino: "Ad hominem",
        definicion: "Falacia que consiste en atacar a la persona que presenta el argumento en lugar de refutar el argumento mismo. Descalifica al emisor en vez de evaluar las razones.",
        ejemplo: "Decir 'no le hagas caso a sus propuestas ecológicas porque es hipócrita y llega en coche' es ad hominem: la validez del argumento ecológico no depende de la conducta personal del emisor.",
        etiquetas: ["falacia", "argumentación", "ataque personal"],
      },
      {
        termino: "Hombre de paja",
        definicion: "Falacia que consiste en distorsionar o exagerar la postura del oponente para atacar más fácilmente esa versión deformada, en lugar de enfrentar el argumento real.",
        ejemplo: "Si alguien propone más regulación financiera y su oponente responde 'quiere destruir el capitalismo y el libre mercado', está usando un hombre de paja: ataca una postura más extrema que la que realmente se defendió.",
        etiquetas: ["falacia", "debate", "distorsión"],
      },
      {
        termino: "Pendiente resbaladiza",
        definicion: "Falacia que sostiene que una acción o política llevará inevitablemente a consecuencias extremas negativas, sin justificar por qué cada paso de la cadena ocurrirá.",
        ejemplo: "Decir 'si legalizamos el cannabis, en diez años todas las drogas serán legales y la sociedad colapsará' supone una cadena de eventos inevitables que no se argumenta.",
        etiquetas: ["falacia", "consecuencias", "argumentación"],
      },
      {
        termino: "Apelación a la autoridad",
        definicion: "Falacia que usa el prestigio o la autoridad de una persona para validar un argumento, en lugar de ofrecer evidencia o razones. Es especialmente problemática cuando la autoridad citada no es experta en el tema.",
        ejemplo: "Usar la opinión de un futbolista famoso para defender una dieta específica apela a su autoridad como celebridad, no a evidencia nutricional.",
        etiquetas: ["falacia", "autoridad", "retórica"],
      },
      {
        termino: "Falsa dicotomía",
        definicion: "Falacia que presenta solo dos opciones como si fueran las únicas posibles, ocultando otras alternativas intermedias o distintas.",
        ejemplo: "Decir 'o estás con nosotros o estás contra nosotros' es una falsa dicotomía: ignora la posibilidad de estar en desacuerdo en algunos puntos y de acuerdo en otros.",
        etiquetas: ["falacia", "opciones", "pensamiento binario"],
      },
    ],
    actividad_final: "Busca en los medios de comunicación (redes sociales, noticias, discursos políticos) un ejemplo real de alguna de las falacias del glosario. Copia el fragmento, identifica la falacia y explica en tres oraciones por qué es un error de razonamiento.",
  },

  { // P02 — lectura (Filosofía política)
    titulo: "Poder, Estado y justicia: tres preguntas filosóficas que no se pueden ignorar",
    texto: `¿Qué es el poder? ¿Para qué existe el Estado? ¿Qué significa que una sociedad sea justa? Estas preguntas no son abstractas: determinan cómo se organizan las leyes, quién puede votar, cómo se distribuyen la riqueza y los derechos, y por qué algunos obedecen a otros.

La filosofía política ha dado respuestas muy distintas. Para Thomas Hobbes (siglo XVII), el Estado nació de un pacto entre personas que, en el estado de naturaleza, vivían en una "guerra de todos contra todos". Sin un soberano poderoso que imponga el orden, la vida sería "solitaria, pobre, brutal y breve". El poder del Estado, por tanto, está justificado porque garantiza la supervivencia.

John Locke y Jean-Jacques Rousseau modificaron esta visión: el Estado existe para proteger los derechos naturales de las personas (libertad, propiedad, vida) y su legitimidad depende del consentimiento de los gobernados. Si el Estado viola esos derechos, el pueblo tiene derecho a rebelarse.

En el siglo XX, John Rawls reformuló la pregunta por la justicia. En su obra Teoría de la justicia (1971), propone un experimento mental: ¿qué reglas elegiríamos para organizar la sociedad si no supiéramos qué lugar ocuparíamos en ella? Rawls llama a esto el "velo de ignorancia": detrás de ese velo, ninguno sabe si será rico o pobre, hombre o mujer, de qué etnia, con o sin discapacidades. Rawls concluye que elegiríamos principios que garanticen libertades básicas para todos y que las desigualdades solo sean aceptables si benefician a los más desfavorecidos.

Martha Nussbaum va más lejos: propone el enfoque de las capacidades. No basta con que el Estado garantice libertades formales; debe asegurar que cada persona pueda desarrollar capacidades humanas fundamentales como la salud, la participación política, el control sobre el propio cuerpo, la vida emocional y la afiliación con otros. Una sociedad justa no es solo "no injusta": es aquella que permite florecer a todas las personas.

Desde América Latina, Enrique Dussel ofrece una perspectiva crítica: la modernidad occidental construyó su noción de justicia y Estado ignorando la perspectiva de los pueblos colonizados, esclavizados y dominados. La filosofía de la liberación de Dussel parte de la experiencia del oprimido, del "otro" excluido por el sistema, para construir una filosofía política que realmente incluya a todos.`,
    fuente: "Material elaborado para CEN Bachillerato — PFH-III",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 12,
    preguntas_comprension: [
      {
        pregunta: "¿Por qué Hobbes considera necesario y legítimo el poder del Estado?",
        respuesta_guia: "Porque sin un soberano poderoso, el estado de naturaleza sería una guerra de todos contra todos, haciendo la vida imposible. El Estado garantiza orden y supervivencia.",
      },
      {
        pregunta: "¿Qué es el 'velo de ignorancia' de Rawls y para qué sirve como herramienta filosófica?",
        respuesta_guia: "Es un experimento mental en el que diseñamos las reglas de la sociedad sin saber qué posición social ocuparemos. Sirve para identificar principios de justicia verdaderamente imparciales, no sesgados por el interés propio.",
      },
      {
        pregunta: "¿En qué se diferencia el enfoque de las capacidades de Nussbaum de la visión de Rawls?",
        respuesta_guia: "Rawls se centra en principios de libertad e igualdad; Nussbaum va más allá y exige que el Estado garantice que cada persona pueda desarrollar capacidades humanas concretas (salud, participación, afiliación, etc.), no solo tener derechos formales.",
      },
      {
        pregunta: "¿Qué critica Dussel a la filosofía política occidental?",
        respuesta_guia: "Que construyó sus nociones de justicia y Estado desde la perspectiva de los dominadores, ignorando a los pueblos colonizados y oprimidos. Propone partir de la experiencia del oprimido para construir una filosofía política verdaderamente inclusiva.",
      },
    ],
  },

  { // P03 — video_con_preguntas (Estética filosófica)
    url: "https://example.com/video-pendiente-cen",
    duracion_segundos: 540,
    preguntas: [
      {
        timestamp_segundos: 90,
        pregunta: "¿Qué diferencia hace la filosofía entre la experiencia de 'lo bello' y la experiencia de 'lo sublime'? Da un ejemplo de cada una.",
        respuesta_guia: "Lo bello produce placer armonioso y seguro; lo sublime combina fascinación y cierto terror ante algo que supera la escala humana (una tormenta, una montaña enorme). Kant analizó esta distinción en la Crítica del juicio.",
      },
      {
        timestamp_segundos: 270,
        pregunta: "¿En qué sentido puede el arte ser una forma de conocimiento filosófico y no solo entretenimiento?",
        respuesta_guia: "El arte puede revelar verdades sobre la condición humana, la sociedad o la experiencia que el pensamiento conceptual no captura igual. Hegel y Gadamer argumentaron que el arte es una forma de desvelamiento de la verdad.",
      },
      {
        timestamp_segundos: 420,
        pregunta: "¿Qué aporta la estética latinoamericana —el arte indígena, el muralismo mexicano, el arte popular— a los debates filosóficos sobre lo bello?",
        respuesta_guia: "Desafía los cánones estéticos europeos y muestra que hay otros criterios de belleza, significado y función del arte. El muralismo de Rivera, Orozco y Siqueiros, por ejemplo, hizo del arte un instrumento de crítica social y memoria histórica.",
      },
      {
        timestamp_segundos: 510,
        pregunta: "¿Cómo puede la experiencia estética cotidiana (escuchar música, ver una película, observar un paisaje) ser un punto de partida para la reflexión filosófica?",
        respuesta_guia: "Porque toda experiencia estética implica juicios de valor, emociones y formas de atención que pueden analizarse filosóficamente: ¿qué me mueve y por qué? ¿Hay criterios universales de belleza o solo preferencias subjetivas?",
      },
    ],
  },

  { // P04 — lectura (Praxis filosófica transformadora)
    titulo: "Filosofía no solo para leer: pensar junto a otros para transformar la realidad",
    texto: `Hay una imagen extendida del filósofo: un hombre solitario, encerrado en su biblioteca, pensando problemas abstractos sin conexión con el mundo. Esa imagen es, en gran medida, un mito. Desde Sócrates —que filosofaba en la plaza pública, dialogando con cualquiera que encontrara— hasta las corrientes contemporáneas de filosofía comunitaria, la filosofía ha tenido vocación transformadora.

La praxis filosófica es el conjunto de prácticas que buscan llevar el pensamiento filosófico al encuentro con la vida real: comunidades, escuelas, barrios, grupos vulnerables. No se trata de "bajar" la filosofía al pueblo como si fuera un bien de élite, sino de reconocer que toda comunidad humana tiene preguntas filosóficas propias: sobre la justicia, el sentido, el bien, la convivencia, el cuidado.

La filosofía con jóvenes (Philosophy for Children, adaptada en muchos contextos latinoamericanos) parte de la certeza de que los niños y jóvenes son ya sujetos filosóficos: hacen preguntas radicales sobre la muerte, la injusticia, el tiempo, la identidad. El rol del facilitador no es dar respuestas, sino crear la comunidad de indagación donde esas preguntas puedan desplegarse con rigor.

El diagnóstico comunitario filosófico es una metodología que une el pensamiento crítico con el conocimiento situado de una comunidad. Comienza por escuchar: ¿qué problemas nombra la gente? ¿Qué valores están en tensión? ¿Qué tipo de vida se considera buena en ese contexto? A partir de ahí, el filósofo no impone marcos teóricos sino que ayuda a la comunidad a articular, cuestionar y transformar sus propias concepciones.

Esta perspectiva conecta con la pedagogía del oprimido de Paulo Freire, que rechaza la "educación bancaria" (donde el maestro deposita conocimiento en el alumno pasivo) y propone el diálogo como método: nadie educa a nadie, todos se educan en comunión con el mundo. Filosofar, en este sentido, no es acumular saber: es pensar críticamente con otros para entender y transformar la realidad compartida.`,
    fuente: "Material elaborado para CEN Bachillerato — PFH-III",
    nivel_lectura: "intermedio" as const,
    tiempo_estimado_minutos: 11,
    preguntas_comprension: [
      {
        pregunta: "¿Qué es la praxis filosófica y en qué se diferencia de la filosofía académica tradicional?",
        respuesta_guia: "La praxis filosófica aplica el pensamiento filosófico a problemas reales de comunidades concretas, en diálogo con sus miembros. La filosofía académica tradicional suele limitarse al ámbito universitario o intelectual.",
      },
      {
        pregunta: "¿Qué supuesto central guía la filosofía con jóvenes?",
        respuesta_guia: "Que los jóvenes son ya sujetos filosóficos con preguntas radicales propias, no receptores pasivos. El rol del adulto es crear condiciones para el diálogo, no entregar respuestas.",
      },
      {
        pregunta: "¿Cómo conecta la praxis filosófica con la pedagogía de Paulo Freire?",
        respuesta_guia: "Ambas rechazan el modelo en que alguien con saber lo 'deposita' en quien no sabe. Freire y la filosofía comunitaria coinciden en que el diálogo y la reflexión crítica son procesos colectivos de liberación.",
      },
    ],
  },
];

// ── A2 ──────────────────────────────────────────────────────────────────────────
const contenidosA2 = [
  { // P01 — quiz_multiple_opcion (Lógica y falacias)
    preguntas: [
      {
        pregunta: "¿Cuál de los siguientes ejemplos es una falacia ad hominem?",
        opciones: [
          "Si permites que los estudiantes usen celular, pronto querrán hacer lo que quieran.",
          "No vale la pena escuchar sus propuestas ambientales porque ni él separa su basura.",
          "El científico dice que el cambio climático es real, por eso debemos creerlo.",
          "O apoyas esta política o estás en contra del progreso.",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "El ad hominem ataca al emisor del argumento (su conducta personal) en lugar de refutar el argumento mismo. Que el proponente no separe basura no invalida lógicamente sus argumentos ambientales.",
      },
      {
        pregunta: "¿Qué tipo de razonamiento garantiza que, si las premisas son verdaderas, la conclusión también lo es necesariamente?",
        opciones: ["Inducción", "Abducción", "Analogía", "Deducción"],
        respuesta_correcta: 3,
        retroalimentacion: "La deducción es el único razonamiento que garantiza la verdad de la conclusión a partir de premisas verdaderas. La inducción y la abducción son probables, no necesarias.",
      },
      {
        pregunta: "¿Cuál es el error central de la falacia de pendiente resbaladiza?",
        opciones: [
          "Atacar a la persona en lugar de al argumento",
          "Presentar solo dos opciones cuando hay más posibilidades",
          "Suponer que una acción llevará inevitablemente a consecuencias extremas sin justificar cada paso",
          "Distorsionar el argumento del oponente para atacarlo más fácilmente",
        ],
        respuesta_correcta: 2,
        retroalimentacion: "La pendiente resbaladiza asume una cadena de consecuencias inevitables sin argumentar por qué cada paso ocurrirá. Es un error porque las consecuencias extremas no son automáticas.",
      },
      {
        pregunta: "Un silogismo válido es aquel en el que:",
        opciones: [
          "Todas las premisas son verdaderas y comprobadas científicamente",
          "La conclusión se sigue necesariamente de las premisas por su forma lógica",
          "La conclusión es probable a partir de muchos casos observados",
          "Se apoya en la autoridad de un experto reconocido",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "La validez de un silogismo es una propiedad formal: la conclusión se deriva necesariamente de la estructura lógica de las premisas, independientemente de si el contenido es verdadero o falso.",
      },
      {
        pregunta: "Un analista político dice: 'O apoyan esta reforma o quieren que el país siga en el caos.' ¿Qué falacia está usando?",
        opciones: ["Ad hominem", "Apelación a la autoridad", "Falsa dicotomía", "Hombre de paja"],
        respuesta_correcta: 2,
        retroalimentacion: "La falsa dicotomía reduce la discusión a solo dos opciones (apoyo total o caos) ignorando alternativas como reformas distintas, ajustes parciales o diagnósticos diferentes.",
      },
      {
        pregunta: "¿En qué se diferencia un argumento inductivo de uno deductivo?",
        opciones: [
          "El inductivo parte de principios generales para llegar a casos particulares; el deductivo va de lo particular a lo general",
          "El inductivo parte de casos particulares y generaliza con probabilidad; el deductivo garantiza la conclusión a partir de las premisas",
          "Solo la inducción es usada en filosofía; la deducción es exclusiva de la matemática",
          "No hay diferencia relevante entre inducción y deducción para el análisis de falacias",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "La inducción va de lo particular a lo general con probabilidad; la deducción va de premisas generales a conclusiones particulares con necesidad lógica. Son los dos grandes tipos de razonamiento.",
      },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },

  { // P02 — quiz_multiple_opcion (Filosofía política)
    preguntas: [
      {
        pregunta: "¿En qué consiste el 'velo de ignorancia' de John Rawls?",
        opciones: [
          "Un velo que cubre la vista del juez para que no vea el rostro del acusado",
          "Un experimento mental en el que diseñamos las reglas de la sociedad sin saber qué posición social tendremos",
          "El principio de que los jueces no deben conocer la identidad de las partes en un juicio",
          "La idea de que los políticos deben gobernar sin información sobre los ciudadanos",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "El velo de ignorancia es una herramienta filosófica para diseñar principios de justicia imparciales: si no sé qué posición ocuparé, elegiré reglas que sean justas para todos, incluidos los más desfavorecidos.",
      },
      {
        pregunta: "¿Cuál es la crítica principal de Dussel a la filosofía política occidental?",
        opciones: [
          "Que es demasiado abstracta y debería ser más práctica",
          "Que fue construida ignorando la perspectiva de los pueblos colonizados y oprimidos",
          "Que no incluye suficientes mujeres entre sus autores",
          "Que se enfoca demasiado en el Estado y descuida al individuo",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "Dussel argumenta que la filosofía política moderna construyó sus categorías (libertad, Estado, justicia) desde la perspectiva del dominador europeo, invisibilizando la experiencia colonial y la voz del oprimido.",
      },
      {
        pregunta: "El enfoque de las capacidades de Martha Nussbaum sostiene que una sociedad justa debe:",
        opciones: [
          "Garantizar únicamente la libertad de expresión y el voto igualitario",
          "Asegurar que cada persona pueda desarrollar capacidades humanas fundamentales como la salud, la afiliación y la participación política",
          "Maximizar la riqueza nacional para que el mercado distribuya los beneficios",
          "Aplicar el principio utilitario de la mayor felicidad para el mayor número",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "Nussbaum va más allá de los derechos formales: exige que el Estado garantice capacidades reales y concretas para que cada persona pueda vivir una vida verdaderamente humana.",
      },
      {
        pregunta: "¿Qué significa que la democracia sea 'deliberativa' en la teoría filosófica contemporánea?",
        opciones: [
          "Que las decisiones se toman por votación secreta sin debate previo",
          "Que la legitimidad política se funda en el diálogo razonado y el debate público entre ciudadanos",
          "Que solo los expertos y académicos participan en las decisiones políticas importantes",
          "Que el gobierno delibera internamente antes de anunciar sus decisiones",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "La democracia deliberativa (Habermas, Cohen) sostiene que las decisiones colectivas son legítimas cuando resultan de un proceso de argumentación pública en el que todos pueden participar y las razones deben poder ser evaluadas.",
      },
      {
        pregunta: "¿Cuál es el principio de diferencia de Rawls?",
        opciones: [
          "Que todas las personas deben ser idénticas en riqueza y poder",
          "Que las desigualdades sociales y económicas solo son justas si benefician a los miembros menos favorecidos de la sociedad",
          "Que el Estado no debe intervenir en la distribución de la riqueza",
          "Que la diferencia entre ricos y pobres es inevitable e irrelevante para la justicia",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "El principio de diferencia de Rawls permite desigualdades solo si mejoran la situación de los más desfavorecidos. No exige igualdad absoluta, sino justicia redistributiva.",
      },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },

  { // P03 — quiz_multiple_opcion (Estética filosófica)
    preguntas: [
      {
        pregunta: "¿Cómo distingue la filosofía entre lo 'bello' y lo 'sublime'?",
        opciones: [
          "Lo bello es caro y exclusivo; lo sublime es accesible a todos",
          "Lo bello produce placer armonioso; lo sublime combina fascinación con una sensación de desbordamiento o terror ante algo que supera la escala humana",
          "Lo bello es subjetivo; lo sublime es una propiedad objetiva de los objetos",
          "Lo bello pertenece al arte; lo sublime pertenece a la naturaleza",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "Kant analizó esta distinción: lo bello agrada sin interés, produce armonía; lo sublime (una montaña, una tormenta) desborda nuestras facultades y genera una mezcla de admiración y temor que nos hace conscientes de nuestra pequeñez.",
      },
      {
        pregunta: "¿Qué quiere decir que el arte puede ser una forma de 'conocimiento' filosófico?",
        opciones: [
          "Que el arte sustituye a la ciencia como método de investigación",
          "Que el arte puede revelar verdades sobre la experiencia humana que el pensamiento conceptual no captura de igual manera",
          "Que todo artista es automáticamente un filósofo",
          "Que solo el arte abstracto tiene valor filosófico",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "Hegel y Gadamer argumentaron que el arte no es mero entretenimiento sino una forma de desvelamiento de la verdad: muestra cómo es el mundo y la condición humana desde ángulos que el concepto puro no puede alcanzar.",
      },
      {
        pregunta: "¿Qué aporte filosófico tiene el muralismo mexicano (Rivera, Orozco, Siqueiros)?",
        opciones: [
          "Demostró que el arte solo tiene valor estético cuando sigue los cánones europeos",
          "Separó definitivamente el arte de la política y la historia",
          "Mostró que el arte puede ser un instrumento de crítica social, memoria histórica y construcción de identidad colectiva",
          "Probó que la belleza es universal e independiente del contexto cultural",
        ],
        respuesta_correcta: 2,
        retroalimentacion: "El muralismo mexicano integró estética y política: usó el arte público para narrar la historia desde los oprimidos, celebrar la identidad indígena y mestiza, y criticar la desigualdad. Esto desafía la idea de arte como objeto de élite.",
      },
      {
        pregunta: "Según la estética filosófica, ¿puede haber belleza en lo grotesco o en lo feo?",
        opciones: [
          "No, lo feo y lo grotesco son simplemente ausencia de belleza sin valor estético",
          "Sí, lo grotesco puede producir experiencias estéticas significativas al subvertir lo convencional y revelar lo que lo bello oculta",
          "Solo si el artista tiene intenciones irracionales o perturbadas",
          "Solo en contextos culturales no occidentales",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "La estética filosófica reconoce que lo grotesco, lo feo o lo perturbador pueden producir experiencias estéticas poderosas y conocimiento filosófico: revelan lo que la idealización de lo bello oculta sobre la realidad.",
      },
      {
        pregunta: "¿Por qué la experiencia estética cotidiana (escuchar música, ver una película) puede ser un punto de partida para la reflexión filosófica?",
        opciones: [
          "Porque el entretenimiento es la base de toda filosofía seria",
          "Porque toda experiencia estética implica juicios de valor, emociones y formas de atención que pueden analizarse filosóficamente",
          "Porque la filosofía solo puede surgir de experiencias placenteras",
          "Porque la experiencia cotidiana reemplaza la necesidad de leer filosofía formal",
        ],
        respuesta_correcta: 1,
        retroalimentacion: "Preguntas como '¿qué me conmueve y por qué?', '¿hay criterios universales de belleza o solo preferencias culturales?' o '¿por qué este arte me hace sentir algo verdadero?' son preguntas filosóficas legítimas que surgen de la experiencia cotidiana.",
      },
    ],
    intentos_maximos: 3,
    puntaje_minimo_aprobacion: 70,
    mezclar_preguntas: false,
  },

  { // P04 — autoevaluacion (Praxis filosófica — avance en propuesta comunitaria)
    nombre: "Autoevaluación: avance en mi proyecto filosófico comunitario",
    descripcion: "Reflexiona sobre el estado actual de tu proyecto filosófico comunitario. Esta evaluación no busca medir si ya tienes todo resuelto, sino ayudarte a identificar en qué punto del proceso estás y qué necesitas fortalecer para avanzar.",
    criterios: [
      {
        nombre: "Identificación del problema o pregunta filosófica",
        descripcion: "He identificado un problema real de mi comunidad (barrio, escuela, familia) que tiene dimensiones filosóficas genuinas (de justicia, sentido, convivencia, identidad, bien común).",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Aún no tengo claro cuál es el problema filosófico que quiero abordar; tengo ideas generales pero no una pregunta concreta." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Tengo identificado un problema, pero no he terminado de articular su dimensión filosófica ni la pregunta central que lo guiará." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Tengo una pregunta filosófica clara, fundamentada en un problema real de mi comunidad, y puedo explicar por qué es una pregunta filosófica y no solo empírica o técnica." },
        ],
      },
      {
        nombre: "Diagnóstico comunitario",
        descripcion: "He realizado algún tipo de indagación (conversaciones, observación, cuestionario) para entender cómo vive mi comunidad el problema que identificé.",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "No he hablado aún con nadie de mi comunidad sobre el problema; mi diagnóstico es solo desde mi propia perspectiva." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "He tenido algunas conversaciones informales pero no de manera sistemática; tengo impresiones pero no datos o perspectivas suficientemente variadas." },
          { valor: 3, etiqueta: "Logrado", descripcion: "He realizado un diagnóstico básico con al menos 3-5 personas o fuentes distintas y puedo describir cómo diferentes miembros de la comunidad viven o entienden el problema." },
        ],
      },
      {
        nombre: "Conexión teoría-práctica",
        descripcion: "Puedo relacionar mi problema comunitario con conceptos o autores filosóficos estudiados (Rawls, Nussbaum, Dussel, Freire u otros).",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "No encuentro aún cómo conectar lo que estudié en filosofía con el problema de mi comunidad; me parecen mundos separados." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Puedo identificar algún concepto filosófico relevante para mi problema, pero la conexión me resulta forzada o superficial." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Puedo mostrar cómo al menos uno o dos conceptos o autores filosóficos estudiados iluminan o enriquecen el análisis del problema comunitario que elegí." },
        ],
      },
      {
        nombre: "Propuesta de acción filosófica",
        descripcion: "He diseñado o estoy diseñando una intervención o propuesta concreta (taller, diálogo, texto, investigación participativa) que ponga la filosofía al servicio de la comunidad.",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Aún no tengo ninguna propuesta de acción; estoy en fase de diagnóstico o simplemente no he llegado a este paso." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Tengo una idea general de lo que podría hacerse, pero no está diseñada en detalle ni he evaluado su viabilidad." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Tengo una propuesta concreta (con objetivos, participantes, metodología y tiempos aproximados) que soy capaz de presentar y defender." },
        ],
      },
      {
        nombre: "Reflexión crítica sobre el proceso",
        descripcion: "Soy capaz de mirar críticamente mi propio proceso: qué supuestos tengo sobre la comunidad, qué sesgos puedo estar proyectando, qué no sé todavía.",
        escala: [
          { valor: 1, etiqueta: "Inicio", descripcion: "Aún no he reflexionado sobre mis propios supuestos o sesgos en relación con el problema o la comunidad." },
          { valor: 2, etiqueta: "En desarrollo", descripcion: "Empiezo a notar que tengo supuestos que pueden no ser compartidos por la comunidad, pero me cuesta identificarlos con precisión." },
          { valor: 3, etiqueta: "Logrado", descripcion: "Puedo identificar al menos dos supuestos o sesgos propios que podrían afectar mi diagnóstico o propuesta, y he pensado cómo manejarlos." },
        ],
      },
    ],
    prompt_reflexion_final: "Basándote en tu autoevaluación, ¿cuál es el paso más importante que necesitas dar en las próximas dos semanas para avanzar en tu proyecto filosófico comunitario? Sé específico: describe la acción, con quién la realizarás (si aplica) y cómo sabrás que la completaste.",
  },
];

// ── A3 ──────────────────────────────────────────────────────────────────────────
const contenidosA3 = [
  { // P01 — debate_estructurado (Lógica — desobediencia civil)
    tema: "¿La desobediencia civil está justificada en una democracia?",
    postura_a: "La desobediencia civil SÍ está justificada en una democracia cuando las leyes son profundamente injustas",
    postura_b: "La desobediencia civil NO está justificada en una democracia: hay canales legales para el cambio",
    argumentos_a: [
      "Henry Thoreau argumentó que la conciencia moral individual tiene una obligación que supera a la obediencia legal: si la ley es injusta, el deber es desobedecerla.",
      "La historia confirma la eficacia ética de la desobediencia civil: el movimiento de derechos civiles de MLK Jr., la resistencia de Gandhi y el sufragio femenino se lograron desafiando leyes injustas, no solo usando canales institucionales.",
      "En una democracia real, los grupos minoritarios pueden ser sistemáticamente ignorados por la mayoría; la desobediencia civil es su mecanismo para hacerse escuchar cuando las vías normales fallan.",
      "Rawls reconoció la desobediencia civil como apelación pública a los principios de justicia de la sociedad: no destruye la democracia, sino que la interpela desde sus propios valores.",
      "Si una ley viola derechos fundamentales (discriminación racial, supresión del voto, tortura), no obedecerla no es anti-democrático: es defender la democracia real frente a su forma legal corrupta.",
    ],
    argumentos_b: [
      "En una democracia, las leyes son producto de procesos legítimos de deliberación colectiva; rechazarlas unilateralmente socava el fundamento del contrato social.",
      "Si cada ciudadano pudiera desobedecer las leyes que considera injustas, el resultado sería el caos: todos tenemos criterios morales distintos y ninguno puede erigirse en árbitro universal.",
      "La democracia ofrece mecanismos legítimos para el cambio: el voto, las reformas legislativas, los recursos judiciales, las iniciativas ciudadanas. Usarlos es la vía democrática.",
      "La desobediencia civil puede ser manipulada por grupos con intereses antidemocráticos para bloquear políticas legítimamente aprobadas por la mayoría.",
    ],
  },

  { // P02 — debate_estructurado (Filosofía política — Estado y justicia social)
    tema: "¿El Estado debe garantizar la justicia social o solo las libertades individuales?",
    postura_a: "El Estado debe garantizar la justicia social activamente, redistribuyendo recursos y asegurando capacidades para todos",
    postura_b: "El Estado debe limitarse a proteger las libertades individuales y no intervenir en la distribución de la riqueza",
    argumentos_a: [
      "Rawls demostró que, bajo el velo de ignorancia, elegiríamos un Estado que garantice condiciones básicas para los más desfavorecidos: el principio de diferencia exige redistribución.",
      "Nussbaum mostró que las libertades formales son insuficientes si una persona no tiene las capacidades reales para ejercerlas: la libertad de expresión no vale nada si no sabes leer.",
      "Dussel señala que la 'libertad individual' proclamada por el liberalismo se construyó sobre la exclusión de los colonizados: sin redistribución, se perpetúan injusticias históricas.",
      "Las desigualdades extremas de riqueza destruyen la igualdad política real: quien tiene más dinero tiene más poder sobre los medios de comunicación, los políticos y las leyes.",
      "Garantizar salud, educación y vivienda no restringe la libertad: crea las condiciones para que la libertad sea real y no solo nominal.",
    ],
    argumentos_b: [
      "Robert Nozick argumentó que el Estado redistributivo viola los derechos de propiedad: si obtuve mis recursos legítimamente, nadie puede arrebatármelos, ni siquiera el Estado.",
      "La economía de mercado es más eficiente que el Estado para asignar recursos; la intervención estatal genera burocracia, corrupción e ineficiencia.",
      "Las libertades individuales (expresión, propiedad, contrato) son el fundamento de toda sociedad libre; ampliar el Estado amenaza estas libertades.",
      "Las personas tienen derecho a los frutos de su trabajo y su talento; redistribuirlos coercitivamente trata a las personas como medios para los fines ajenos.",
    ],
  },

  { // P03 — reflexion_escrita (Estética — experiencia estética cotidiana)
    prompt: "La filosofía estética sostiene que la experiencia de lo bello, lo sublime o lo perturbador no es un lujo ni una trivialidad: es una forma de conocer el mundo y la condición humana.\n\nElige una experiencia estética que hayas tenido recientemente: una canción que te impactó, una imagen que no pudiste olvidar, una película, un paisaje, una obra visual, una actuación. No tiene que ser 'alta cultura': puede ser cualquier experiencia que haya producido en ti algo más que un 'me gustó'.\n\nDescribe la experiencia con detalle. Luego analízala filosóficamente: ¿fue bello, sublime, grotesco, perturbador? ¿Por qué te afectó? ¿Dice algo sobre la condición humana, la justicia, la identidad, la memoria? ¿Hay algo que solo esa experiencia estética puedo comunicarte y que palabras o conceptos abstractos no alcanzan?\n\nPuedes apoyarte en alguna idea del propósito: la distinción entre lo bello y lo sublime, el arte como conocimiento, la estética latinoamericana.",
    pistas: [
      "Elige una experiencia real, concreta, que de verdad te haya afectado: la autenticidad enriquece el análisis filosófico.",
      "La pregunta no es si esa experiencia fue 'bonita', sino qué te hizo pensar o sentir y por qué eso tiene relevancia filosófica.",
      "Puedes mencionar si la experiencia fue con arte latinoamericano, popular o indígena: ¿cambia la categoría de 'belleza' con la que analizas?",
      "No tienes que resolver si hay belleza universal o solo subjetiva: puedes plantear la pregunta y dejar la tensión abierta.",
    ],
    criterios_evaluacion: [
      "Describe la experiencia estética elegida con suficiente detalle para que se entienda por qué fue significativa",
      "Aplica al menos una categoría filosófica (bello, sublime, grotesco, experiencia estética como conocimiento) de manera precisa",
      "Argumenta por qué esa experiencia tiene relevancia filosófica más allá del gusto personal",
      "Muestra reflexión genuina sobre los límites del lenguaje conceptual frente a la experiencia estética",
    ],
    longitud_minima: 120,
  },

  { // P04 — reflexion_escrita (Praxis filosófica — problema comunitario)
    prompt: "Paulo Freire escribió que 'nadie educa a nadie, nadie se educa a sí mismo: los seres humanos se educan entre sí, mediatizados por el mundo'. La praxis filosófica propone algo parecido: no hay filósofo que 'le da' filosofía a la comunidad, sino un proceso de pensar juntos los problemas que importan.\n\nIdentifica un problema real de tu comunidad más cercana (tu familia, tu colonia, tu escuela, tu grupo de amigos) que tenga dimensiones filosóficas: algo que involucre preguntas de justicia, convivencia, identidad, sentido, bien o daño.\n\nDescribe el problema con honestidad. Luego responde: ¿Qué pregunta filosófica central articula ese problema? ¿Qué pensador o concepto de los que estudiaste (Rawls, Nussbaum, Dussel, Freire, la lógica del bien común, la democracia deliberativa) te ayuda a entenderlo mejor? ¿Qué tipo de acción filosófica concreta podrías proponer para abordarlo con tu comunidad?\n\nNo es necesario que tengas todas las respuestas: lo importante es que el pensamiento sea riguroso y honesto.",
    pistas: [
      "Un problema filosófico comunitario no tiene que ser 'grande': la falta de escucha en una familia, la exclusión de alguien en un grupo, la inequidad en la distribución de tareas son problemas reales con dimensiones filosóficas.",
      "La pregunta filosófica no es '¿cómo resolverlo técnicamente?' sino '¿qué valores o principios están en tensión?, ¿qué concepción del bien o la justicia se aplica aquí?'",
      "Una acción filosófica concreta puede ser muy sencilla: organizar una conversación estructurada, proponer que el grupo discuta una pregunta juntos, crear un espacio de diálogo donde normalmente no lo hay.",
    ],
    criterios_evaluacion: [
      "Identifica un problema comunitario real y concreto con claridad y honestidad",
      "Formula una pregunta filosófica genuina que articule las dimensiones de valor o justicia del problema",
      "Conecta el problema con al menos un concepto o pensador filosófico estudiado de manera sustantiva (no solo nominal)",
      "Propone una acción filosófica concreta, aunque sea pequeña, que pueda realizarse de verdad",
    ],
    longitud_minima: 130,
  },
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });

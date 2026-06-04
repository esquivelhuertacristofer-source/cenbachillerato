/**
 * Refuerzo de actividades para PFH-III (Pensamiento Filosófico y Humanidades III) según la "Plantilla CEN por UAC".
 * Agrega A4-A7 a cada una de las 4 progresiones (ya tienen A1-A3):
 *   A4 = quiz_verdadero_falso · A5 = glosario_interactivo · A6 = fill_blanks · A7 = autoevaluacion
 * 4 progresiones × 4 = 16 actividades nuevas. estado='borrador'.
 * Alineado al programa oficial de Pensamiento Filosófico y Humanidades III (MCCEMS 2025):
 *   P01: Lógica y argumentación · P02: Filosofía política · P03: Estética · P04: Praxis filosófica transformadora
 * Uso: npx tsx scripts/seed-activities-pfhiii-refuerzo.ts
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
  log("\n🌱 Refuerzo PFH-III — Pensamiento Filosófico y Humanidades III: A4-A7 por progresión\n");

  const progs = await getProgresionesDeUAC(sb, "PFH-III");
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

  log(`\n✅ PFH-III refuerzo: ${ok} actividades insertadas, ${fail} fallidas.\n`);
}

// ── REFUERZOS POR PROGRESIÓN ───────────────────────────────────────────────────

const refuerzos: Refuerzo[][] = [
  // ════════════ P01 — Lógica y argumentación ════════════
  [
    {
      titulo: "Verdadero o Falso — Lógica y argumentación",
      descripcion: "Decide si cada afirmación sobre deducción, inducción, proposiciones, silogismos y falacias es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "Un argumento deductivo válido garantiza que si las premisas son verdaderas, la conclusión también lo será.",
            respuesta: true,
            retroalimentacion: "Correcto. La deducción preserva la verdad: la conclusión se sigue necesariamente de las premisas. Ej.: todos los humanos son mortales; Sócrates es humano; luego, Sócrates es mortal.",
          },
          {
            enunciado: "El razonamiento inductivo permite derivar conclusiones universales con certeza absoluta a partir de casos particulares.",
            respuesta: false,
            retroalimentacion: "Falso. La inducción ofrece conclusiones probables, no ciertas: por más cisnes blancos que observemos, no podemos garantizar que no exista un cisne negro.",
          },
          {
            enunciado: "Una falacia ad hominem ataca la persona que presenta el argumento en lugar de refutar el argumento mismo.",
            respuesta: true,
            retroalimentacion: "Correcto. La falacia ad hominem descalifica al interlocutor ('tú mientes porque eres interesado') sin analizar la validez lógica de lo que afirma.",
          },
          {
            enunciado: "En una tabla de verdad, la conjunción (P ∧ Q) es verdadera solo cuando ambas proposiciones son verdaderas.",
            respuesta: true,
            retroalimentacion: "Correcto. La conjunción lógica exige que P y Q sean ambas verdaderas; basta con que una sea falsa para que P ∧ Q resulte falsa.",
          },
          {
            enunciado: "Un silogismo categórico se compone de dos premisas y una conclusión, siendo la premisa mayor la que contiene el término medio.",
            respuesta: false,
            retroalimentacion: "Falso. El término medio aparece en AMBAS premisas pero no en la conclusión. La premisa mayor contiene el predicado de la conclusión; la menor contiene el sujeto.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Lógica y argumentación",
      descripcion: "Glosario interactivo de conceptos clave de lógica formal e informal: proposición, silogismo, falacia, deducción e inducción.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Proposición",
            definicion: "Enunciado declarativo que puede ser verdadero o falso. Es la unidad mínima del razonamiento lógico.",
            ejemplo: "'La Tierra orbita alrededor del Sol' es una proposición verdadera.",
            etiquetas: ["lógica formal", "lenguaje"],
          },
          {
            termino: "Silogismo",
            definicion: "Forma de razonamiento deductivo compuesta por una premisa mayor, una premisa menor y una conclusión que se sigue necesariamente.",
            ejemplo: "Todo mamífero respira → el delfín es mamífero → el delfín respira.",
            etiquetas: ["deducción", "Aristóteles"],
          },
          {
            termino: "Deducción",
            definicion: "Razonamiento que parte de principios o premisas generales para obtener una conclusión particular necesaria.",
            ejemplo: "Si todos los cuerpos graves caen, y esta piedra es un cuerpo grave, entonces cae.",
            etiquetas: ["lógica formal", "argumento válido"],
          },
          {
            termino: "Inducción",
            definicion: "Razonamiento que a partir de casos particulares observados infiere una generalización probable.",
            ejemplo: "He observado que el sol sale cada mañana; por inducción concluyo que saldrá mañana también.",
            etiquetas: ["empirismo", "probabilidad"],
          },
          {
            termino: "Falacia",
            definicion: "Argumento que parece válido pero contiene un error lógico o una trampa retórica. Puede ser formal (estructural) o informal (contextual).",
            ejemplo: "Falacia de pendiente resbaladiza: 'Si permites eso, pronto todo estará permitido'.",
            etiquetas: ["argumento inválido", "retórica"],
          },
          {
            termino: "Tabla de verdad",
            definicion: "Herramienta que lista todos los valores posibles de proposiciones simples y calcula el valor de verdad de proposiciones compuestas (∧, ∨, →, ↔).",
            ejemplo: "P=V, Q=F → P ∧ Q = F; P ∨ Q = V.",
            etiquetas: ["lógica formal", "conectivos lógicos"],
          },
        ],
        actividad_final: "Elige un discurso político o publicitario de tu entorno e identifica: (a) al menos un argumento inductivo o deductivo, (b) una posible falacia. Justifica tu análisis en 5 oraciones.",
      },
    },
    {
      titulo: "Completa los huecos — Razonamiento lógico",
      descripcion: "Completa el texto sobre lógica y argumentación con los términos correctos.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Lee el párrafo y escribe en cada hueco el concepto lógico que corresponde. Usa los términos del glosario de la progresión.",
        texto_con_huecos: "Cuando Aristóteles construyó su ___ categórico, combinó una premisa mayor con una menor para derivar una conclusión necesaria. Este método de razonamiento se llama ___. En cambio, cuando un científico observa muchos casos particulares para llegar a una ley general, utiliza el razonamiento ___. Si alguien refuta a su oponente atacando su carácter en lugar de su argumento, comete una falacia ___.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "silogismo",
            alternativas_aceptadas: [],
            pista: "Forma de argumento aristotélico de tres partes: premisa mayor, premisa menor y conclusión.",
          },
          {
            posicion: 1,
            respuesta_correcta: "deducción",
            alternativas_aceptadas: ["razonamiento deductivo"],
            pista: "Tipo de razonamiento que parte de lo general hacia lo particular con necesidad lógica.",
          },
          {
            posicion: 2,
            respuesta_correcta: "inductivo",
            alternativas_aceptadas: ["inducción"],
            pista: "Razonamiento que generaliza a partir de casos observados; sus conclusiones son probables.",
          },
          {
            posicion: 3,
            respuesta_correcta: "ad hominem",
            alternativas_aceptadas: [],
            pista: "Locución latina que significa 'contra la persona'; es una falacia informal muy común.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Lógica y argumentación",
      descripcion: "Reflexiona sobre tu dominio de los conceptos y habilidades de lógica formal e informal.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio. Esta autoevaluación no tiene calificación: es para reconocer tus fortalezas y áreas de mejora.",
        criterios: [
          { descripcion: "Puedo distinguir entre razonamiento deductivo e inductivo y explicar sus diferencias con ejemplos.", escala: escala4 },
          { descripcion: "Identifico proposiciones simples y compuestas, y evalúo su valor de verdad.", escala: escala4 },
          { descripcion: "Reconozco falacias formales e informales en discursos del entorno (noticia, anuncio, debate).", escala: escala4 },
          { descripcion: "Construyo un silogismo válido y verifico su corrección lógica.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿En qué situación de tu vida cotidiana has detectado recientemente una falacia o un argumento débil? ¿Cómo lo identificaste?",
      },
    },
  ],

  // ════════════ P02 — Filosofía política ════════════
  [
    {
      titulo: "Verdadero o Falso — Filosofía política",
      descripcion: "Decide si cada afirmación sobre poder, Estado, democracia, justicia social y ciudadanía es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "Para John Rawls, los principios de justicia deben elegirse desde un 'velo de ignorancia', es decir, sin saber qué posición social ocupará cada quien.",
            respuesta: true,
            retroalimentacion: "Correcto. El velo de ignorancia en la posición original garantiza imparcialidad: nadie diseñaría reglas injustas si no supiera si será rico o pobre, hombre o mujer, mayoritario o minoritario.",
          },
          {
            enunciado: "La democracia deliberativa propone que las decisiones colectivas deben basarse exclusivamente en el voto de la mayoría, sin necesidad de argumentación pública.",
            respuesta: false,
            retroalimentacion: "Falso. La democracia deliberativa (Habermas, Cohen) exige que las decisiones se legitimen mediante razones públicas intercambiadas entre ciudadanos libres e iguales; el voto es insuficiente sin deliberación.",
          },
          {
            enunciado: "Para Enrique Dussel, la filosofía política latinoamericana debe partir de la experiencia de los excluidos y oprimidos como lugar privilegiado de crítica al sistema.",
            respuesta: true,
            retroalimentacion: "Correcto. Dussel llama a esto 'el punto de vista de la víctima': quienes sufren la injusticia del sistema tienen una perspectiva epistémica privilegiada para cuestionarlo.",
          },
          {
            enunciado: "La desobediencia civil, según Henry D. Thoreau y Martin Luther King Jr., es una acción pública, no violenta y orientada a cambiar leyes consideradas injustas.",
            respuesta: true,
            retroalimentacion: "Correcto. La desobediencia civil clásica es pública (no clandestina), pacífica, consciente y acepta las consecuencias legales para interpelar a la sociedad y al Estado.",
          },
          {
            enunciado: "Martha Nussbaum propone el enfoque de las capacidades para evaluar la justicia de una sociedad atendiendo exclusivamente al ingreso económico per cápita.",
            respuesta: false,
            retroalimentacion: "Falso. Nussbaum (y Sen) critican justamente que el PIB per cápita es insuficiente. El enfoque de las capacidades mide qué tan capaz es cada persona de hacer y ser lo que tiene razones para valorar.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Filosofía política",
      descripcion: "Glosario interactivo de conceptos fundamentales: poder, Estado, democracia deliberativa, justicia social, ciudadanía y desobediencia civil.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Estado",
            definicion: "Organización política que ejerce poder soberano sobre un territorio y una población mediante instituciones jurídicas, coercitivas y administrativas.",
            ejemplo: "El Estado mexicano tiene como pilares el territorio, la población, el gobierno y la soberanía reconocida internacionalmente.",
            etiquetas: ["poder", "institución"],
          },
          {
            termino: "Democracia deliberativa",
            definicion: "Modelo democrático que legitima las decisiones colectivas mediante el intercambio público de razones entre ciudadanos, más allá del simple conteo de votos.",
            ejemplo: "Un presupuesto participativo donde vecinos debaten y justifican prioridades antes de votar es un ejercicio de democracia deliberativa.",
            etiquetas: ["democracia", "Habermas", "ciudadanía"],
          },
          {
            termino: "Velo de ignorancia (Rawls)",
            definicion: "Dispositivo conceptual que exige diseñar principios de justicia sin conocer la propia posición social, asegurando imparcialidad.",
            ejemplo: "Si no supieras si nacer en una familia rica o pobre, elegirías un sistema que proteja a los más vulnerables.",
            etiquetas: ["justicia", "Rawls", "equidad"],
          },
          {
            termino: "Desobediencia civil",
            definicion: "Acto político público, no violento y colectivo que viola una ley considerada injusta para interpelar a la autoridad y a la opinión pública.",
            ejemplo: "Las sentadas de los estudiantes en el movimiento por los derechos civiles en EE. UU. son un ejemplo clásico.",
            etiquetas: ["resistencia", "ciudadanía", "Thoreau"],
          },
          {
            termino: "Enfoque de las capacidades (Nussbaum)",
            definicion: "Marco filosófico que evalúa la justicia de una sociedad según qué capacidades centrales (vida, salud, juego, afiliación política, etc.) pueden ejercer efectivamente sus miembros.",
            ejemplo: "Una sociedad que priva a las mujeres de educación viola su capacidad de razón práctica, según Nussbaum.",
            etiquetas: ["justicia social", "Nussbaum", "derechos"],
          },
          {
            termino: "Filosofía de la liberación (Dussel)",
            definicion: "Corriente latinoamericana que parte de la experiencia de los oprimidos y excluidos para construir una ética y una política alternativas al eurocentrismo.",
            ejemplo: "Dussel propone escuchar la voz de los pueblos indígenas, migrantes y pobres como punto de partida filosófico.",
            etiquetas: ["Dussel", "América Latina", "crítica"],
          },
        ],
        actividad_final: "Identifica un problema político o social de tu comunidad. Aplica al menos dos conceptos del glosario (ej. democracia deliberativa y desobediencia civil) para analizarlo en un párrafo argumentado.",
      },
    },
    {
      titulo: "Completa los huecos — Filosofía política",
      descripcion: "Completa el texto sobre poder, Estado y justicia con los conceptos filosóficos correctos.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Lee el párrafo y escribe en cada hueco el concepto o nombre que corresponde. Respeta la ortografía del glosario.",
        texto_con_huecos: "John ___ propuso que los principios de justicia deben elegirse tras un 'velo de ignorancia' para garantizar imparcialidad. Martha Nussbaum complementa esta visión con el enfoque de las ___, que evalúa qué tan capaces son las personas de llevar una vida digna. Para Enrique Dussel, la filosofía política debe partir de la experiencia de los ___. Cuando un ciudadano viola pacíficamente una ley injusta para interpelar al Estado, realiza un acto de ___ civil.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "Rawls",
            alternativas_aceptadas: ["rawls"],
            pista: "Filósofo estadounidense autor de 'Una teoría de la justicia' (1971).",
          },
          {
            posicion: 1,
            respuesta_correcta: "capacidades",
            alternativas_aceptadas: ["capacidades centrales"],
            pista: "Enfoque de Nussbaum y Sen que evalúa la justicia más allá del ingreso económico.",
          },
          {
            posicion: 2,
            respuesta_correcta: "excluidos",
            alternativas_aceptadas: ["oprimidos", "víctimas", "pobres"],
            pista: "Dussel llama a este lugar epistémico privilegiado 'el punto de vista de la ___'.",
          },
          {
            posicion: 3,
            respuesta_correcta: "desobediencia",
            alternativas_aceptadas: [],
            pista: "Acción política pública y no violenta para protestar contra leyes injustas: ___ civil.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Filosofía política",
      descripcion: "Reflexiona sobre tu comprensión de los conceptos de poder, Estado, democracia y justicia social.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio. El objetivo es reconocer tu punto de partida para seguir aprendiendo.",
        criterios: [
          { descripcion: "Explico qué es el Estado y cómo se relaciona con el poder y la ciudadanía.", escala: escala4 },
          { descripcion: "Distingo entre democracia representativa y deliberativa, y argumento cuál favorece mejor la justicia.", escala: escala4 },
          { descripcion: "Aplico los conceptos de Rawls, Nussbaum o Dussel para analizar un problema social concreto.", escala: escala4 },
          { descripcion: "Evalúo éticamente actos de desobediencia civil en contextos históricos o actuales.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué decisión política de tu entorno (escuela, municipio, país) analizarías con herramientas de filosofía política? ¿Qué criterio de justicia aplicarías?",
      },
    },
  ],

  // ════════════ P03 — Estética como disciplina filosófica ════════════
  [
    {
      titulo: "Verdadero o Falso — Estética filosófica",
      descripcion: "Decide si cada afirmación sobre lo bello, lo sublime, la experiencia estética y el arte como conocimiento es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "Para Immanuel Kant, el juicio estético de gusto ('esto es bello') tiene una pretensión de universalidad aunque no se funde en un concepto determinado.",
            respuesta: true,
            retroalimentacion: "Correcto. Kant distingue el gusto del mero agrado: cuando digo 'esto es bello' pretendo que todos deberían estar de acuerdo, aunque el juicio sea subjetivo y no derive de una regla objetiva.",
          },
          {
            enunciado: "Lo sublime, a diferencia de lo bello, produce solo placer puro sin ningún elemento de temor o incomodidad.",
            respuesta: false,
            retroalimentacion: "Falso. Lo sublime (Burke, Kant) mezcla atracción y una especie de pavor o desproporción: nos confronta con algo que supera nuestra capacidad de comprensión inmediata (una tormenta, una montaña enorme).",
          },
          {
            enunciado: "La estética latinoamericana propone que el arte producido en América Latina debe analizarse también desde sus contextos históricos de colonialidad y resistencia cultural.",
            respuesta: true,
            retroalimentacion: "Correcto. Pensadores como Néstor García Canclini y Bolívar Echeverría destacan que las formas artísticas latinoamericanas están atravesadas por procesos de hibridación cultural, colonialidad y resistencia.",
          },
          {
            enunciado: "El arte, según la tradición filosófica que va de Platón a Hegel, puede ser una forma de conocimiento que revela verdades que la ciencia no puede expresar.",
            respuesta: true,
            retroalimentacion: "Correcto. Para Hegel el arte es la primera forma del Espíritu Absoluto: hace sensible la Idea. Para Heidegger, la obra de arte 'abre un mundo' y des-oculta el ser.",
          },
          {
            enunciado: "La experiencia estética se limita exclusivamente a las obras de arte reconocidas en museos e instituciones culturales oficiales.",
            respuesta: false,
            retroalimentacion: "Falso. La estética contemporánea amplía la experiencia estética a lo cotidiano: el diseño, la naturaleza, la música popular, las artesanías o las prácticas rituales también pueden ser objetos de experiencia estética.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Estética filosófica",
      descripcion: "Glosario interactivo de categorías estéticas: lo bello, lo sublime, la mímesis, la experiencia estética y la estética latinoamericana.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Estética",
            definicion: "Rama de la filosofía que estudia la belleza, el arte, la sensibilidad y la experiencia que tenemos de lo bello, lo sublime y lo artístico.",
            ejemplo: "La estética pregunta: ¿qué hace que algo sea bello? ¿Es la belleza objetiva o depende del observador?",
            etiquetas: ["disciplina filosófica", "Baumgarten"],
          },
          {
            termino: "Lo bello (Kant)",
            definicion: "Categoría estética que designa aquello cuya contemplación produce un placer desinteresado con pretensión de universalidad, sin mediación de conceptos determinados.",
            ejemplo: "Un atardecer produce un juicio de gusto: 'qué bello', aunque no podamos reducir esa belleza a una fórmula.",
            etiquetas: ["Kant", "juicio de gusto", "belleza"],
          },
          {
            termino: "Lo sublime",
            definicion: "Experiencia de algo de magnitud o poder tan grande que desborda nuestra capacidad sensible y produce una mezcla de asombro y cierta inquietud.",
            ejemplo: "Contemplar un volcán en erupción o el océano en tormenta genera lo sublime: nos atrae y a la vez nos abruma.",
            etiquetas: ["Burke", "Kant", "asombro"],
          },
          {
            termino: "Mímesis",
            definicion: "Concepto griego que significa 'imitación': Platón la usó para criticar el arte (imitación de copias), Aristóteles la revalorizó como representación que produce catarsis.",
            ejemplo: "Una tragedia griega imita acciones humanas para que el espectador purgue sus emociones (catarsis).",
            etiquetas: ["Platón", "Aristóteles", "representación"],
          },
          {
            termino: "Experiencia estética",
            definicion: "Modo de percepción y valoración sensible-afectiva en el que se suspende la utilidad inmediata y se atiende a la forma, el significado o la expresión del objeto.",
            ejemplo: "Escuchar una pieza de música tradicional con atención plena, dejando que evoque imágenes o emociones, es una experiencia estética.",
            etiquetas: ["percepción", "arte", "cotidiano"],
          },
          {
            termino: "Estética latinoamericana",
            definicion: "Corriente que analiza las manifestaciones artísticas y culturales de América Latina considerando la colonialidad, la hibridación cultural y las resistencias estéticas propias.",
            ejemplo: "El muralismo mexicano (Rivera, Orozco, Siqueiros) es un arte que fusiona iconografía prehispánica con técnicas europeas para narrar la historia del pueblo.",
            etiquetas: ["América Latina", "colonialidad", "García Canclini"],
          },
        ],
        actividad_final: "Elige una obra artística de tu comunidad (mural, artesanía, música, danza o fotografía). Analízala usando al menos tres conceptos del glosario. Escribe un párrafo argumentado.",
      },
    },
    {
      titulo: "Completa los huecos — Estética filosófica",
      descripcion: "Completa el texto sobre categorías estéticas con los términos filosóficos correctos.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Lee el párrafo y escribe en cada hueco el concepto estético que corresponde. Cuida la ortografía.",
        texto_con_huecos: "La ___ es la rama de la filosofía que estudia la belleza y el arte. Kant distingue entre lo bello, que produce un placer ___, y lo sublime, que genera una mezcla de asombro e inquietud ante algo que supera nuestra comprensión. Aristóteles revalorizó la ___ como representación que permite al espectador experimentar catarsis. La estética ___ propone analizar el arte de la región considerando la colonialidad y la hibridación cultural.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "estética",
            alternativas_aceptadas: [],
            pista: "Disciplina filosófica fundada por Baumgarten que estudia lo bello y la experiencia artística.",
          },
          {
            posicion: 1,
            respuesta_correcta: "desinteresado",
            alternativas_aceptadas: ["libre", "puro"],
            pista: "Kant afirma que el placer de lo bello es ___, sin fin utilitario ni concepto determinado.",
          },
          {
            posicion: 2,
            respuesta_correcta: "mímesis",
            alternativas_aceptadas: ["mimesis"],
            pista: "Concepto griego de 'imitación': Aristóteles lo usa para explicar el valor cognitivo y emocional del arte.",
          },
          {
            posicion: 3,
            respuesta_correcta: "latinoamericana",
            alternativas_aceptadas: ["latinoamerica", "latinoamerciana"],
            pista: "Corriente filosófica que analiza el arte de nuestra región desde la colonialidad y la resistencia cultural.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Estética filosófica",
      descripcion: "Reflexiona sobre tu comprensión de las categorías estéticas y tu capacidad para analizar obras artísticas filosóficamente.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio. No hay respuestas incorrectas: es un ejercicio de autoconocimiento filosófico.",
        criterios: [
          { descripcion: "Explico la diferencia entre lo bello y lo sublime con ejemplos concretos.", escala: escala4 },
          { descripcion: "Analizo una obra de arte aplicando conceptos estéticos filosóficos (mímesis, experiencia estética, juicio de gusto).", escala: escala4 },
          { descripcion: "Reconozco manifestaciones de la estética latinoamericana en expresiones artísticas de mi entorno.", escala: escala4 },
          { descripcion: "Argumento por qué el arte puede ser considerado una forma de conocimiento filosófico.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué obra artística (canción, mural, película, artesanía) de tu comunidad o región consideras filosóficamente significativa? ¿Qué verdad o experiencia te revela?",
      },
    },
  ],

  // ════════════ P04 — Praxis filosófica transformadora ════════════
  [
    {
      titulo: "Verdadero o Falso — Praxis filosófica transformadora",
      descripcion: "Decide si cada afirmación sobre praxis, filosofía comunitaria e intervención social filosófica es verdadera o falsa.",
      tipo: "quiz_verdadero_falso",
      xp: 10,
      contenido: {
        preguntas: [
          {
            enunciado: "El concepto de 'praxis' en Marx designa la actividad humana consciente que transforma la realidad, integrando teoría y práctica.",
            respuesta: true,
            retroalimentacion: "Correcto. Para Marx, la praxis supera la dicotomía teoría/práctica: no basta con interpretar el mundo, hay que transformarlo (Tesis 11 sobre Feuerbach).",
          },
          {
            enunciado: "La filosofía comunitaria propone que el saber filosófico debe permanecer en el ámbito académico y universitario, sin vincularse con las comunidades.",
            respuesta: false,
            retroalimentacion: "Falso. La filosofía comunitaria (Mignolo, Fals Borda, comunidades de diálogo filosófico) promueve que el pensamiento filosófico surja del diálogo con las comunidades y sirva para resolver sus problemas reales.",
          },
          {
            enunciado: "Una acción de praxis filosófica transformadora debe estar fundamentada en un análisis filosófico riguroso y no solo en intuiciones o buenas intenciones.",
            respuesta: true,
            retroalimentacion: "Correcto. La praxis filosófica articula diagnóstico filosófico (¿cuál es el problema conceptual y ético?), marco teórico (¿qué herramientas filosóficas aplico?) y diseño de acción concreta.",
          },
          {
            enunciado: "Paulo Freire propone una pedagogía del oprimido que concibe la educación como depósito de conocimientos del maestro hacia el alumno.",
            respuesta: false,
            retroalimentacion: "Falso. Freire critica precisamente la 'educación bancaria' (depósito). Propone en cambio un diálogo crítico y horizontal donde educador y educando aprenden mutuamente a partir de su realidad.",
          },
          {
            enunciado: "Una propuesta de intervención social filosófica debe incluir un diagnóstico del problema, fundamentos teóricos, una acción concreta y una reflexión sobre sus implicaciones éticas.",
            respuesta: true,
            retroalimentacion: "Correcto. La estructura de una praxis filosófica rigurosa integra: (1) diagnóstico filosófico del problema, (2) fundamentación teórica, (3) diseño de la acción, (4) ejecución, (5) evaluación ética.",
          },
        ],
        intentos_maximos: 2,
        puntaje_minimo_aprobacion: 70,
      },
    },
    {
      titulo: "Glosario — Praxis filosófica transformadora",
      descripcion: "Glosario interactivo de conceptos clave: praxis, filosofía comunitaria, intervención social, pedagogía crítica y transformación.",
      tipo: "glosario_interactivo",
      xp: 15,
      contenido: {
        terminos: [
          {
            termino: "Praxis",
            definicion: "Actividad humana consciente, libre y transformadora que integra teoría y práctica para modificar las condiciones de la realidad social.",
            ejemplo: "Diseñar y ejecutar un taller de derechos humanos en tu colonia, fundamentado en filosofía política, es un ejercicio de praxis.",
            etiquetas: ["Marx", "transformación", "teoría-práctica"],
          },
          {
            termino: "Filosofía comunitaria",
            definicion: "Enfoque filosófico que sitúa el diálogo con las comunidades como punto de partida y destino del pensamiento filosófico, reconociendo saberes locales.",
            ejemplo: "Las asambleas comunitarias indígenas donde se delibera sobre el bien común son espacios de filosofía comunitaria en acción.",
            etiquetas: ["comunidad", "diálogo", "saberes locales"],
          },
          {
            termino: "Intervención social filosófica",
            definicion: "Acción planificada y argumentada filosóficamente que busca transformar una situación problemática en una comunidad específica.",
            ejemplo: "Organizar un foro de ética ambiental con vecinos afectados por un problema de contaminación es una intervención social filosófica.",
            etiquetas: ["acción", "comunidad", "ética aplicada"],
          },
          {
            termino: "Pedagogía crítica (Freire)",
            definicion: "Propuesta educativa de Paulo Freire que rechaza la 'educación bancaria' y propone un diálogo horizontal entre educador y educando para leer críticamente su mundo.",
            ejemplo: "Un círculo de lectura donde estudiantes y maestros analizan juntos problemas reales de su entorno sigue la pedagogía freireana.",
            etiquetas: ["Freire", "educación", "diálogo crítico"],
          },
          {
            termino: "Diagnóstico filosófico",
            definicion: "Primera etapa de la praxis: identificar y analizar el problema desde categorías filosóficas (éticas, políticas, estéticas) antes de diseñar la acción.",
            ejemplo: "Antes de organizar una campaña sobre violencia de género, el diagnóstico filosófico pregunta: ¿qué concepto de justicia y dignidad está en juego?",
            etiquetas: ["metodología", "análisis", "problema"],
          },
          {
            termino: "Transformación social",
            definicion: "Cambio intencional y colectivo en las estructuras, prácticas o valores de una comunidad, orientado por principios filosóficos de justicia, dignidad y bien común.",
            ejemplo: "Lograr que una comunidad adopte un reglamento de convivencia más justo tras un proceso de deliberación filosófica es un ejemplo de transformación social.",
            etiquetas: ["cambio", "justicia", "colectivo"],
          },
        ],
        actividad_final: "Identifica un problema real de tu escuela o comunidad. Escribe un diagnóstico filosófico de una página: ¿qué valores o principios están vulnerados? ¿Qué acción concreta podrías diseñar para transformar esa situación?",
      },
    },
    {
      titulo: "Completa los huecos — Praxis filosófica",
      descripcion: "Completa el texto sobre praxis filosófica y transformación social con los conceptos correctos.",
      tipo: "fill_blanks",
      xp: 10,
      contenido: {
        instrucciones: "Lee el párrafo y escribe en cada hueco el concepto filosófico que corresponde. Usa los términos del glosario de la progresión.",
        texto_con_huecos: "Marx señaló que la ___ es la actividad humana que integra teoría y práctica para transformar la realidad. Paulo Freire criticó la educación ___, en la que el maestro deposita conocimientos en el alumno, y propuso en su lugar un diálogo crítico. La filosofía ___ reconoce los saberes locales y sitúa a la comunidad como punto de partida del pensamiento filosófico. Antes de diseñar una acción transformadora, es necesario realizar un ___ filosófico del problema.",
        huecos: [
          {
            posicion: 0,
            respuesta_correcta: "praxis",
            alternativas_aceptadas: [],
            pista: "Concepto central de Marx para la actividad humana consciente y transformadora que une teoría y práctica.",
          },
          {
            posicion: 1,
            respuesta_correcta: "bancaria",
            alternativas_aceptadas: [],
            pista: "Freire critica la educación '___ ': el maestro 'deposita' conocimientos como si el alumno fuera una alcancía.",
          },
          {
            posicion: 2,
            respuesta_correcta: "comunitaria",
            alternativas_aceptadas: [],
            pista: "Enfoque filosófico que valora el diálogo con las comunidades y sus saberes locales: filosofía ___.",
          },
          {
            posicion: 3,
            respuesta_correcta: "diagnóstico",
            alternativas_aceptadas: [],
            pista: "Primera etapa de la praxis: identificar y analizar el problema filosóficamente antes de actuar.",
          },
        ],
        distingue_mayusculas: false,
      },
    },
    {
      titulo: "Autoevaluación — Praxis filosófica transformadora",
      descripcion: "Reflexiona sobre tu capacidad para diseñar y fundamentar filosóficamente una acción de transformación comunitaria.",
      tipo: "autoevaluacion",
      xp: 10,
      contenido: {
        instrucciones: "Marca tu nivel honesto en cada criterio. Esta reflexión es el punto de partida para tu Producto Integrador.",
        criterios: [
          { descripcion: "Explico qué es la praxis filosófica y por qué integrar teoría y práctica es indispensable para transformar la realidad.", escala: escala4 },
          { descripcion: "Realizo un diagnóstico filosófico de un problema de mi comunidad, identificando los valores y principios en juego.", escala: escala4 },
          { descripcion: "Diseño una propuesta de acción concreta fundamentada en conceptos filosóficos (éticos, políticos, estéticos).", escala: escala4 },
          { descripcion: "Evalúo críticamente mi propuesta desde una perspectiva ética, reconociendo sus alcances y limitaciones.", escala: escala4 },
        ],
        reflexion_final_prompt: "¿Qué problema de tu escuela o comunidad te parece más urgente transformar? ¿Qué herramientas filosóficas de este semestre usarías para fundamentar una acción concreta?",
      },
    },
  ],
];

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });

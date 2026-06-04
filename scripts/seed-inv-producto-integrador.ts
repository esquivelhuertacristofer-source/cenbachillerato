/**
 * Producto Integrador del semestre para IN-V (Inglés V — nivel A2+/B1,
 * unidad "We are the champions", semestre 5, MCCEMS 2025).
 * - Crea 1 capstone (reflexion_escrita) que integra las 8 progresiones:
 *   P01 Describir el área de estudio · P02 Compartir experiencias · P03 Preguntas sobre procesos ·
 *   P04 Opiniones y preferencias · P05 Comprensión lectora · P06 Escritura funcional ·
 *   P07 Interacción oral semiestructurada · P08 Proyecto final integrador.
 *   Se aloja en la progresión de mayor número (culminante de IN-V).
 * - Queda en estado 'borrador' (no publica nada): el usuario decide cuándo publicar.
 * Uso: npx tsx scripts/seed-inv-producto-integrador.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🎓 Producto Integrador IN-V (borrador)\n");

  const progs = await getProgresionesDeUAC(sb, "IN-V");
  if (progs.length === 0) throw new Error("No se encontraron progresiones de IN-V");
  const pFinal = progs.reduce((a, b) => (b.numero > a.numero ? b : a), progs[0]);

  const ok = await upsertActividad(sb, {
    codigo: "IN-V-PRODUCTO-INTEGRADOR",
    progresion_id: pFinal.id,
    titulo: "Producto Integrador: We Are the Champions — My Field of Study in English",
    descripcion: "Capstone del semestre: integra las ocho progresiones de IN-V (describir el área de estudio, narrar experiencias, formular preguntas sobre procesos, expresar opiniones, comprensión lectora, escritura funcional, interacción oral semiestructurada y proyecto final) en un ensayo integrador en inglés vinculado al campo de estudio o área de interés del grupo.",
    tipo: "reflexion_escrita",
    xp: 50,
    estado: "borrador",
    contenido: {
      prompt:
        "PRODUCTO INTEGRADOR — IN-V: Inglés V\n" +
        "Unidad: We Are the Champions\n\n" +
        "A lo largo de este semestre desarrollaste ocho competencias comunicativas en inglés:\n" +
        "(P01) explorar y describir tu área de estudio o interés;\n" +
        "(P02) compartir experiencias personales o escolares relacionadas con ese campo;\n" +
        "(P03) formular y responder preguntas sobre procesos o procedimientos;\n" +
        "(P04) expresar opiniones, preferencias y preocupaciones;\n" +
        "(P05) leer y analizar textos breves vinculados al campo temático;\n" +
        "(P06) redactar textos funcionales en inglés (correos, solicitudes, propuestas);\n" +
        "(P07) participar en una interacción oral semiestructurada (entrevista, presentación, panel); y\n" +
        "(P08) integrar todas las habilidades lingüísticas en un proyecto final.\n\n" +
        "INSTRUCCIONES GENERALES:\n" +
        "Escribe un ensayo en inglés (mínimo 300 palabras) que integre las ocho progresiones de la unidad. El ensayo debe estar escrito principalmente en inglés (A2+/B1); puedes incluir instrucciones o notas de contexto en español únicamente donde sea estrictamente necesario para la claridad, pero el cuerpo del ensayo debe estar en inglés.\n\n" +
        "Tu ensayo debe desarrollar CADA UNO de los siguientes ocho puntos. Para cada punto, escribe al menos 2-4 oraciones en inglés:\n\n" +
        "1) DESCRIBE YOUR FIELD OF STUDY (P01 — Exploring the Field):\n" +
        "Introduce your group's field of study or area of interest in English. Use phrases such as 'My field of study is...', 'This area involves...', and 'One of the main goals of this field is to...' Explain what professionals in this field do and why it is relevant to your community or to Mexico.\n\n" +
        "2) SHARE A PERSONAL EXPERIENCE (P02 — Narrating Experiences):\n" +
        "Write about a personal or school experience that is related to your field of study. Use the past simple to narrate what happened. Include sequencing connectors (first, then, after that, finally) and end with a reflection phrase such as 'This experience taught me...' or 'That is why I decided to...' to explain how this experience shaped your interest.\n\n" +
        "3) EXPLAIN A PROCESS OR CONCEPT (P03 — Questions and Answers About Processes):\n" +
        "Describe an important process, concept, or procedure from your field using step-by-step language. Write as if you are answering the question 'How does [this process] work?' or 'What is the process for [doing this]?' Use structures like 'The first step is to...', 'It is used to...', and passive voice where appropriate (e.g., 'The data is collected and then analyzed.').\n\n" +
        "4) EXPRESS YOUR OPINIONS AND CONCERNS (P04 — Opinions, Preferences, and Concerns):\n" +
        "Share your opinion about a challenge, trend, or ethical issue related to your field. Use at least one opinion phrase ('In my opinion...', 'I believe that...', 'From my point of view...'), one preference ('I prefer... to...' or 'I would rather...'), and one concern ('I am worried about...' or 'I am concerned about...').\n\n" +
        "5) REFERENCE A TEXT YOU READ (P05 — Reading Comprehension):\n" +
        "Briefly mention a short text, article, or source that you read during this unit or that is related to your field. Use 'According to [source/author]...' to cite one specific idea from the text. Then, add your own reaction: 'I find this [convincing / interesting / questionable] because...' Use at least one contrast or addition connector (however, furthermore, in addition).\n\n" +
        "6) WRITE A FUNCTIONAL TEXT ELEMENT (P06 — Functional Writing):\n" +
        "Include within your essay a short functional writing element (3-5 sentences). This can be: (a) the opening and closing of a formal email related to your field ('Dear..., I am writing to...'), (b) a brief proposal ('I would like to propose that our school...'), or (c) a short request ('I would appreciate it if...'). It should be realistic and connected to your field of study.\n\n" +
        "7) OUTLINE YOUR ORAL PRESENTATION (P07 — Semi-Structured Speaking):\n" +
        "Write a brief outline or script excerpt (3-5 sentences) for an oral presentation about your field, as if you were presenting to classmates or a panel. Use presentation signposting language: opening ('Today I am going to talk about...'), a transition ('Moving on to...'), and a closing phrase ('In conclusion,...'). You may also describe one question you would ask or answer in such a presentation.\n\n" +
        "8) REFLECT ON YOUR ENGLISH LEARNING JOURNEY (P08 — Final Integration):\n" +
        "Close your essay with a personal reflection in English about your learning process throughout the unit 'We Are the Champions'. Use phrases such as 'Throughout this unit, I have...', 'This project demonstrates that...', or 'Based on what I have learned...'. Make one recommendation for someone starting to study English in your field: 'I would recommend...' or 'For future learners, it would be useful to...'\n\n" +
        "CIERRE DEL ENSAYO:\n" +
        "Asegúrate de que tu ensayo tenga: (a) una introducción que presente tu campo y el propósito del ensayo; (b) un cuerpo que desarrolle cada uno de los ocho puntos anteriores; y (c) una conclusión que integre una reflexión final y una recomendación. Usa conectores ('furthermore', 'however', 'in addition', 'therefore') para unir tus ideas con coherencia.\n\n" +
        "Revisa tu ensayo antes de entregarlo: verifica gramática (sujeto-verbo, tiempos verbales, preposiciones), vocabulario específico del campo, y estructura del texto. Puedes escribir a doble espacio y señalar claramente cada sección con su número o título en inglés.",
      pistas: [
        "For sections 1 and 2, key vocabulary: 'My field of study is...', 'This area involves + gerund (-ing)', 'When I was [age/place], I [past simple verb]...', 'First... Then... After that... Finally...', 'This experience taught me that...' Remember: use simple past for completed past events with a specific time (e.g., 'last year', 'when I was a child'). Use present perfect ('I have always been interested in...') for experiences without a specific time that connect to the present.",
        "For section 3, useful structures: 'The first step is to [base verb]...', 'How does [process] work?', 'It is used to + base verb', passive voice: 'The sample is collected, processed, and then analyzed.' Passive is common in scientific and technical English because the action matters more than who does it. Example: 'The report is written by the team' → focus on the report.",
        "For sections 4 and 5, opinion phrases: 'In my opinion...', 'I believe that...', 'I am worried about + noun/gerund', 'I prefer [gerund] to [gerund]', 'I would rather [base verb] than [base verb]'. For reading references: 'According to [author/text], [idea].' Then react: 'I find this convincing/interesting because...' Contrast connector: 'However, [contrasting idea].' Addition: 'Furthermore, / In addition, [extra point].'",
        "For section 6 (functional writing), formal email key phrases: Opening: 'Dear [Title] [Last Name],' / 'I am writing to [inform / request / propose]...' / 'I would like to...' / 'I would appreciate it if you could...' / 'Please find attached...' Closing: 'I look forward to hearing from you.' / 'Best regards,' / 'Yours sincerely,' Remember: no contractions in formal writing (write 'I am', not 'I'm'; 'do not', not 'don't').",
        "For sections 7 and 8, presentation phrases: Opening: 'Today I am going to talk about...' / 'My presentation focuses on...' Transitions: 'Moving on to...' / 'Now let's look at...' / 'As I mentioned earlier...' Closing: 'In conclusion,...' / 'To wrap up,...' Reflection: 'Throughout this unit, I have [past participle]...' / 'This project demonstrates that...' / 'Based on what I have learned, I would recommend [gerund] to future learners of English in this field.'",
      ],
      longitud_minima_palabras: 300,
      criterios_evaluacion: [
        "P01 — Field Description: The student introduces their field of study in English using appropriate vocabulary ('my field of study is...', 'this area involves...') and explains its relevance to their community or to Mexico with at least 2 complete, grammatically correct sentences.",
        "P02 — Personal Experience: The student narrates a past experience related to the field using the past simple correctly, includes at least two sequencing connectors (first, then, after that, finally), and concludes with a reflection phrase ('This experience taught me...' or 'That is why I decided to...').",
        "P03 — Process Explanation: The student explains a process or concept from their field step by step in English, using structures like 'The first step is to...' and appropriate passive voice constructions ('The data is collected and analyzed'), demonstrating understanding of how processes are described technically in English.",
        "P04 — Opinions and Concerns: The student expresses a clear opinion ('In my opinion...', 'I believe that...'), a preference ('I prefer... to...' or 'I would rather...'), and a concern ('I am worried/concerned about...') about a topic related to their field, using correct grammar and appropriate vocabulary.",
        "P05 — Reading Reference: The student cites at least one idea from a text or source using 'According to [author/text]...', adds a personal reaction ('I find this... because...'), and uses at least one contrast or addition connector (however, furthermore, in addition) to link ideas coherently.",
        "P06 — Functional Writing: The student includes a short, correctly structured functional text element (email opening/closing, proposal, or request) using formal English conventions (no contractions, correct salutation and closing, 'I am writing to...' structure), connected to their field of study.",
        "P07 — Oral Presentation Outline: The student writes a brief, well-structured presentation script excerpt using signposting language: a formal opening ('Today I am going to talk about...'), at least one transition phrase ('Moving on to...'), and a closing statement ('In conclusion,...'), demonstrating knowledge of oral presentation conventions in English.",
        "P08 — Reflection and Integration: The student writes a personal reflection on their English learning journey using present perfect ('Throughout this unit, I have...'), references their overall project ('This project demonstrates that...'), and makes at least one concrete recommendation for future learners ('I would recommend...' or 'For future learners, it would be useful to...'), showing metacognitive awareness.",
      ],
      formato_esperado: "ensayo",
    },
  });
  log(ok ? "  ✓ Producto Integrador IN-V creado (borrador)\n" : "  ✗ Falló el Producto Integrador\n");

  // Estado actual de IN-V (sin publicar)
  const ids = progs.map((p) => p.id);
  const { data: all } = await sb.from("actividades").select("estado").in("progresion_id", ids);
  const porEstado: Record<string, number> = {};
  for (const a of all ?? []) porEstado[a.estado] = (porEstado[a.estado] ?? 0) + 1;
  log(`  📊 IN-V total: ${all?.length ?? 0} actividades → ${JSON.stringify(porEstado)}\n`);
}

main().catch((e) => { console.error("❌ Error:", e.message); process.exit(1); });

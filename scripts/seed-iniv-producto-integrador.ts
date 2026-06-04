/**
 * Producto Integrador del semestre para IN-IV (Inglés IV — A2+ MCER "Should I stay or should I go?").
 * - Crea 1 capstone (reflexion_escrita) que integra las 8 progresiones:
 *   narrar experiencias pasadas, expresar y justificar preferencias, describir rutinas con propósito,
 *   dar consejos empáticos, hablar de planes futuros, participar en conversaciones sociales,
 *   contar una anécdota significativa y consolidar estrategias de comunicación.
 *   Se aloja en la progresión de mayor número (culminante de IN-IV).
 * - Queda en estado 'borrador' (no publica nada): el usuario decide cuándo publicar.
 * Uso: npx tsx scripts/seed-iniv-producto-integrador.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🎓 Producto Integrador IN-IV (borrador)\n");

  const progs = await getProgresionesDeUAC(sb, "IN-IV");
  if (progs.length === 0) throw new Error("No se encontraron progresiones de IN-IV");
  const pFinal = progs.reduce((a, b) => (b.numero > a.numero ? b : a), progs[0]);

  const ok = await upsertActividad(sb, {
    codigo: "IN-IV-PRODUCTO-INTEGRADOR",
    progresion_id: pFinal.id,
    titulo: "Producto Integrador: Should I Stay or Should I Go?",
    descripcion: "Capstone del semestre: integra narración detallada del pasado, expresión y justificación de preferencias, descripción de rutinas contextualizadas, consejos empáticos, planes futuros, conversación social con cortesía y narración de anécdotas en un ensayo personal en inglés.",
    tipo: "reflexion_escrita",
    xp: 50,
    estado: "borrador",
    contenido: {
      prompt:
        "Producto Integrador del semestre — Should I Stay or Should I Go?\n\n" +
        "A lo largo de Inglés IV exploraste cómo comunicarte con mayor fluidez y confianza en inglés: narraste experiencias pasadas con detalle, expresaste y justificaste tus preferencias, describiste rutinas con contexto y propósito, diste y pediste consejos de forma empática, hablaste de planes y propósitos futuros, participaste en conversaciones sociales con cortesía y contaste anécdotas de forma organizada. Ahora vas a integrar todo eso en un ensayo personal titulado 'Should I Stay or Should I Go?'\n\n" +
        "Write a personal essay in English (at least 300 words) structured around the central question: Should you stay in your comfort zone or push yourself to try new things? Use your own life experiences to explore this question. Your essay MUST include all of the following:\n\n" +
        "1) PAST EXPERIENCE (Progresión 1 & 7): Begin with a detailed anecdote about a time you did something new or stayed in your comfort zone. Use past continuous to set the scene ('I was feeling nervous because...') and past simple for the events ('I decided to join...'). Include time expressions (last year, when I was..., at that moment) and narrative connectors (suddenly, eventually, in the end). Open with an anecdote opener like 'You won't believe what happened...' or 'I'll never forget the day...'\n\n" +
        "2) PREFERENCE & JUSTIFICATION (Progresión 2): Explain whether you generally prefer to stay in familiar situations or to explore new ones. Use at least two preference structures: 'I prefer X to Y because...' and 'I'd rather X than Y since...' Give a reason for your preference using a connector (because, since, as).\n\n" +
        "3) ROUTINES & PURPOSE (Progresión 3): Describe one or two of your current habits or routines that either keep you in your comfort zone or help you grow. Use 'I tend to...', 'I'm used to...', and explain the purpose with 'so that' or 'in order to'. Include context expressions (on school days, in the evenings, every week).\n\n" +
        "4) ADVICE (Progresión 4): Give advice to a friend who is deciding whether to try something new (a club, a course, a trip, a challenge). Use at least two different advice structures: 'You should...', 'If I were you, I would...', 'Have you thought about...?', or 'Why don't you...?' Start with an empathy expression ('That must be scary, but...').\n\n" +
        "5) FUTURE PLANS (Progresión 5): Share one or two of your own future plans related to stepping out of (or staying in) your comfort zone. Use 'I'm going to...', 'I'm planning to...' and/or 'I hope to...' Explain why the plan matters to you with 'because' or 'so that'.\n\n" +
        "6) SOCIAL CONVERSATION MOMENT (Progresión 6): Include a brief imagined or real conversation (4-6 exchanges) with a friend, classmate or family member about your decision to stay or go. Use conversation expressions: a greeting ('How have you been?'), a backchannel ('Really? That's great!'), a topic shift ('By the way...') and a polite close ('Anyway, I should get going...').\n\n" +
        "7) CONCLUSION & REFLECTION (Progresión 8): End your essay with a consolidating paragraph. Answer the central question: 'Should I stay or should I go?' Summarise what you have learned about yourself through this reflection. Use at least one complex sentence with 'although', 'even though', or 'however' to show both sides.\n\n" +
        "Write entirely in English. It is fine to make mistakes — the goal is to show what you have learned across all eight progresiones this semester.\n\n" +
        "Al final del ensayo, agrega en español un párrafo breve (3-4 oraciones) titulado 'Mi reflexión final': ¿qué tema de Inglés IV te resultó más difícil y por qué? ¿Cuál fue tu mayor logro como estudiante de inglés este semestre?",
      pistas: [
        "Para la anécdota: ábrela con 'You won't believe...' o 'I'll never forget...', luego establece la escena con past continuous ('I was feeling...'), narra los eventos con past simple ('I decided / I went / I saw') y cierra con tu reacción ('In the end, I was so relieved / It was the best decision I ever made'). Incluye al menos 3 verbos irregulares en pasado (go→went, feel→felt, take→took, meet→met).",
        "Para preferencias y consejos: recuerda que 'I'd rather' va seguido del verbo base SIN 'to' ('I'd rather stay, not I'd rather to stay'), y que 'If I were you' siempre usa 'were', no 'was'. Añade razones concretas: no solo digas 'I prefer X' — explica por qué ('because it helps me / since it feels safer / as I enjoy the challenge').",
        "Para rutinas y planes futuros: usa 'I'm used to + verb-ing' para hábitos establecidos ('I'm used to studying alone') y 'be going to / I'm planning to + infinitive' para planes decididos. Conecta tu rutina con tu plan: '...that is why I'm planning to change my habits next semester'.",
        "Para la conversación social: escríbela como un mini-script (A: / B: / A: / B:...). Asegúrate de incluir una pregunta de seguimiento ('How did that go?'), un backchannel genuino ('Wow, really?') y un cierre natural. La conversación debe relacionarse con el tema central del ensayo (quedarse o atreverse a cambiar).",
        "Para la conclusión: usa conectores de contraste para mostrar complejidad ('Although staying in my comfort zone feels safe, I have learned that...', 'However, sometimes pushing yourself leads to...'). No tienes que dar una respuesta definitiva — la reflexión honesta vale más que una conclusión perfecta.",
      ],
      longitud_minima_palabras: 300,
      criterios_evaluacion: [
        "Narra una experiencia pasada con detalle usando past continuous + past simple, conectores narrativos y expresiones temporales (Progresión 1 & 7).",
        "Expresa y justifica preferencias personales con al menos dos estructuras ('prefer X to Y', 'I'd rather X than Y') y razones conectadas con 'because', 'since' o 'as' (Progresión 2).",
        "Describe rutinas o hábitos con contexto y propósito usando 'I tend to', 'I'm used to + -ing' y conectores 'so that' / 'in order to' (Progresión 3).",
        "Da consejos empáticos usando al menos dos estructuras diferentes ('You should', 'If I were you', 'Have you thought about...?') precedidos de una expresión de empatía (Progresión 4).",
        "Habla de planes y propósitos futuros con 'be going to', 'I'm planning to' o 'I hope to', explicando su importancia (Progresión 5).",
        "Incluye un intercambio conversacional breve con expresiones de inicio, backchannels, cambio de tema y cierre cortés (Progresión 6).",
        "Escribe una conclusión reflexiva sobre la pregunta central usando conectores de contraste ('although', 'however', 'even though') para mostrar ambas perspectivas (Progresión 8).",
      ],
      formato_esperado: "ensayo",
    },
  });
  log(ok ? "  ✓ Producto Integrador IN-IV creado (borrador)\n" : "  ✗ Falló el Producto Integrador\n");

  // Estado actual de IN-IV (sin publicar)
  const ids = progs.map((p) => p.id);
  const { data: all } = await sb.from("actividades").select("estado").in("progresion_id", ids);
  const porEstado: Record<string, number> = {};
  for (const a of all ?? []) porEstado[a.estado] = (porEstado[a.estado] ?? 0) + 1;
  log(`  📊 IN-IV total: ${all?.length ?? 0} actividades → ${JSON.stringify(porEstado)}\n`);
}

main().catch((e) => { console.error("❌ Error:", e.message); process.exit(1); });

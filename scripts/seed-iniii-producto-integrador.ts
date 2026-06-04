/**
 * Producto Integrador del semestre para IN-III (Inglés III — A2 MCER "What we were, we share").
 * - Crea 1 capstone (reflexion_escrita) que integra las 8 progresiones (pasado simple,
 *   presente perfecto, describir lugares, hábitos/comparativos, must/have to,
 *   instrucciones con conectores, narración y consolidación).
 *   Se aloja en la progresión de mayor número (culminante de IN-III).
 * - Queda en estado 'borrador' (no publica nada): el usuario decide cuándo publicar IN-III.
 * Uso: npx tsx scripts/seed-iniii-producto-integrador.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🎓 Producto Integrador IN-III (borrador)\n");

  const progs = await getProgresionesDeUAC(sb, "IN-III");
  if (progs.length === 0) throw new Error("No se encontraron progresiones de IN-III");
  const pFinal = progs.reduce((a, b) => (b.numero > a.numero ? b : a), progs[0]);

  const ok = await upsertActividad(sb, {
    codigo: "IN-III-PRODUCTO-INTEGRADOR",
    progresion_id: pFinal.id,
    titulo: "Producto Integrador: What We Were, We Share",
    descripcion: "Capstone del semestre: integra pasado simple, presente perfecto, descripción de lugares, hábitos y preferencias, obligaciones y normas, instrucciones con conectores y narración de eventos en un texto personal en inglés.",
    tipo: "reflexion_escrita",
    xp: 50,
    estado: "borrador",
    contenido: {
      prompt:
        "Producto Integrador del semestre. A lo largo de Inglés III aprendiste a hablar de lo que hiciste recientemente usando el pasado simple, a compartir experiencias personales con el presente perfecto, a describir lugares conocidos, a expresar hábitos y preferencias con comparativos y superlativos, a hablar de obligaciones y normas con must/have to, a dar instrucciones paso a paso con conectores secuenciales y a narrar eventos cotidianos con conectores narrativos. Ahora vas a integrarlo todo.\n\nWrite a personal text titled 'What We Were, We Share' (at least 300 words) in English that includes:\n\n1) A short paragraph about what you did recently or this week using the Simple Past (include at least 3 irregular verbs and a time marker such as yesterday, last week, or ago).\n2) Two or three personal experiences using the Present Perfect (use ever, never, already or yet and say who you shared the experience with).\n3) A description of a place you know well: use there is/are, at least two prepositions of place (next to, between, in front of, behind) and a recommendation with 'you should' or 'you can'.\n4) A short paragraph about your habits and preferences using frequency adverbs (always, often, rarely), a comparative (-er than / more...than) and a superlative (the -est / the most).\n5) Three rules or responsibilities from your home, school or community using must/mustn't and have to/don't have to.\n6) Step-by-step instructions for something you know how to do (a recipe, a process, a game) using imperatives and the connectors First, Then, After that and Finally.\n7) A short narrative of an interesting or funny event from your life, using Simple Past irregular verbs and narrative connectors (then, after, later, suddenly, in the end).\n\nWrite in English. It's okay to make mistakes — the goal is to show everything you learned this semester. Al final, agrega en español dos líneas: '¿Qué tema de Inglés III me resultó más difícil y por qué?' y '¿Cuál fue mi mayor logro este semestre?'",
      pistas: [
        "Para el pasado simple recuerda los irregulares: go→went, eat→ate, see→saw, buy→bought, wake up→woke up. Usa 'yesterday', 'last week' o 'ago' para situar la acción.",
        "Para el presente perfecto usa have/has + participio pasado. Agrega 'ever', 'never', 'already' o 'yet' y menciona con quién compartiste la experiencia ('with my family', 'with my best friend').",
        "Para la descripción de lugares escribe 'There is/are...' y coloca el lugar con preposiciones: 'The market is next to the park, between the cathedral and the library'.",
        "Para hábitos y preferencias combina adverbios de frecuencia con comparativos/superlativos: 'I usually prefer cycling because it is healthier than driving' / 'Football is the most popular sport in my school'.",
        "Para obligaciones escribe al menos un ejemplo de cada: must ('You must recycle'), mustn't ('You mustn't litter'), have to ('We have to wear a uniform') y don't have to ('You don't have to arrive early on Saturdays').",
      ],
      longitud_minima_palabras: 300,
      criterios_evaluacion: [
        "Narra eventos recientes en pasado simple usando al menos 3 verbos irregulares y un marcador de tiempo.",
        "Describe experiencias personales con el presente perfecto (have/has + participio) y marcadores ever/never/already/yet.",
        "Describe un lugar conocido con there is/are, preposiciones de lugar y una recomendación.",
        "Expresa hábitos y preferencias con adverbios de frecuencia, comparativos y superlativos.",
        "Redacta reglas y responsabilidades con must/mustn't y have to/don't have to, distinguiendo prohibición de ausencia de obligación.",
        "Da instrucciones paso a paso con imperativos y conectores secuenciales (First, Then, After that, Finally).",
        "Narra un evento de forma coherente con verbos irregulares en pasado y conectores narrativos (then, after, later, suddenly, in the end).",
      ],
      formato_esperado: "ensayo",
    },
  });
  log(ok ? "  ✓ Producto Integrador IN-III creado (borrador)\n" : "  ✗ Falló el Producto Integrador\n");

  // Estado actual de IN-III (sin publicar)
  const ids = progs.map((p) => p.id);
  const { data: all } = await sb.from("actividades").select("estado").in("progresion_id", ids);
  const porEstado: Record<string, number> = {};
  for (const a of all ?? []) porEstado[a.estado] = (porEstado[a.estado] ?? 0) + 1;
  log(`  📊 IN-III total: ${all?.length ?? 0} actividades → ${JSON.stringify(porEstado)}\n`);
}

main().catch((e) => { console.error("❌ Error:", e.message); process.exit(1); });

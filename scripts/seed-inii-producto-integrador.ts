/**
 * Producto Integrador del semestre para IN-II (Inglés II — A1+).
 * - Crea 1 capstone (reflexion_escrita) que integra las 8 progresiones (rutinas, tiempo libre,
 *   habilidades, descripciones, comparaciones, indicaciones, necesidades cotidianas y números).
 *   Se aloja en la progresión de mayor número (culminante de IN-II).
 * - Queda en estado 'borrador' (no publica nada): el usuario decide cuándo publicar IN-II.
 * Uso: npx tsx scripts/seed-inii-producto-integrador.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🎓 Producto Integrador IN-II (borrador)\n");

  const progs = await getProgresionesDeUAC(sb, "IN-II");
  if (progs.length === 0) throw new Error("No se encontraron progresiones de IN-II");
  const pFinal = progs.reduce((a, b) => (b.numero > a.numero ? b : a), progs[0]);

  const ok = await upsertActividad(sb, {
    codigo: "IN-II-PRODUCTO-INTEGRADOR",
    progresion_id: pFinal.id,
    titulo: "Producto Integrador: My Daily Life",
    descripcion: "Capstone del semestre: integra rutinas diarias, tiempo libre, habilidades, descripciones, comparaciones e intercambios cotidianos en un texto personal en inglés.",
    tipo: "reflexion_escrita",
    xp: 50,
    estado: "borrador",
    contenido: {
      prompt:
        "Producto Integrador del semestre. A lo largo de Inglés II aprendiste a describir tu rutina diaria, a hablar de lo que otros hacen en su tiempo libre, a expresar habilidades y pedir permiso, a describir personas, ropa y clima, a comparar cosas, a dar indicaciones y a resolver intercambios cotidianos sobre lo que necesitas. Ahora vas a integrarlo todo en un solo texto personal en inglés.\n\nWrite a text titled 'My Daily Life' (at least 300 words) in English that includes:\n\n1) Your daily routine in present simple, using frequency adverbs (always, usually, sometimes, never).\n2) What a friend or relative does in their free time (use do/does and the negative form).\n3) Two or three things you can and can't do (abilities), and one rule at home or school.\n4) A short description of a person (appearance and clothes) and the weather today.\n5) A comparison between two people, places or objects (use -er than or more ... than).\n6) Simple directions from your home to a place in your town (use imperatives like go straight, turn left).\n7) A short dialogue where you ask for something you need, using 'I'd like...' and 'How much/How many...?'.\n\nWrite in English. It's okay to make mistakes — the goal is to show everything you learned this semester. Al final, agrega en español una línea: '¿Qué parte me costó más escribir en inglés y por qué?'",
      pistas: [
        "Para la rutina usa el presente simple y coloca bien el adverbio: 'I always get up early'.",
        "Para el tiempo libre de otra persona usa do/does: 'My brother doesn't play soccer; he plays basketball'.",
        "Para habilidades usa can/can't: 'I can swim, but I can't drive'.",
        "Para comparar recuerda -er than (adjetivos cortos) y more ... than (adjetivos largos).",
        "Para pedir algo usa 'I'd like a/an...' y pregunta 'How much is it?'.",
      ],
      longitud_minima_palabras: 300,
      criterios_evaluacion: [
        "Describe la rutina diaria en presente simple con adverbios de frecuencia.",
        "Habla de lo que otra persona hace o no hace en su tiempo libre (do/does).",
        "Expresa habilidades con can/can't y una norma del aula o el hogar.",
        "Describe a una persona (apariencia y ropa) y el clima.",
        "Hace al menos una comparación correcta (-er than / more ... than).",
        "Da indicaciones con imperativos hacia un lugar de la comunidad.",
        "Incluye un intercambio cotidiano con 'I'd like...' y 'How much/How many...'.",
      ],
      formato_esperado: "ensayo",
    },
  });
  log(ok ? "  ✓ Producto Integrador IN-II creado (borrador)\n" : "  ✗ Falló el Producto Integrador\n");

  // Estado actual de IN-II (sin publicar)
  const ids = progs.map((p) => p.id);
  const { data: all } = await sb.from("actividades").select("estado").in("progresion_id", ids);
  const porEstado: Record<string, number> = {};
  for (const a of all ?? []) porEstado[a.estado] = (porEstado[a.estado] ?? 0) + 1;
  log(`  📊 IN-II total: ${all?.length ?? 0} actividades → ${JSON.stringify(porEstado)}\n`);
}

main().catch((e) => { console.error("❌ Error:", e.message); process.exit(1); });

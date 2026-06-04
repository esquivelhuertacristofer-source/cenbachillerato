/**
 * Producto Integrador PFH-II (capstone): reflexion_escrita, 50 XP, estado='borrador'.
 * Se aloja en la progresión de mayor numero. Uso: npx tsx scripts/seed-pfhii-producto-integrador.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🎓 Producto Integrador PFH-II\n");
  const progs = await getProgresionesDeUAC(sb, "PFH-II");
  if (!progs.length) throw new Error("PFH-II sin progresiones");
  const culminante = progs.reduce((a, b) => (b.numero > a.numero ? b : a), progs[0]);
  log(`  Alojado en progresión culminante: ${culminante.codigo} (numero ${culminante.numero})`);

  const res = await upsertActividad(sb, {
    codigo: "PFH-II-PRODUCTO-INTEGRADOR",
    titulo: "Producto Integrador: Problematizar el conocer",
    descripcion: "Ensayo final que integra el pensamiento ontológico, la ética, los desafíos de la ciencia y la tecnología, la perspectiva de género y la síntesis humanista, desde una actitud filosófica que problematiza el conocer.",
    tipo: "reflexion_escrita",
    progresion_id: culminante.id,
    xp: 50,
    estado: "borrador",
    contenido: {
      instrucciones: "Redacta un ensayo que integre los aprendizajes de todo el semestre sobre 'Las reflexiones filosóficas sobre el Conocer'. Organízalo con introducción, desarrollo y conclusión, partiendo de una experiencia o problema de tu propia vida, y asumiendo que conocer implica posicionarse, interpretar y dialogar con distintos marcos de sentido.",
      prompt: "Escribe un ensayo en el que problematices el conocimiento desde una actitud filosófica, integrando lo aprendido en el semestre: (1) el pensamiento ontológico (el asombro, el Ser, realidad y apariencia, la existencia); (2) los fundamentos éticos y un dilema moral de la vida cotidiana, vinculando justicia, libertad e igualdad; (3) un desafío ético de la ciencia y la tecnología (bioética, inteligencia artificial, ambiente o animalidad); (4) una perspectiva filosófica sobre la desigualdad de género; y (5) la síntesis humanista (praxis transformadora, Humanismo Mexicano y ética del pensamiento). Plantea una pregunta filosófica propia sobre el conocer, dialoga con al menos dos marcos de sentido distintos y explica cómo este semestre transformó tu manera de pensar, posicionarte e interpretar el mundo.",
      formato_esperado: "ensayo",
      longitud_minima_palabras: 300,
    },
  });
  log(res ? "\n✅ Producto Integrador PFH-II creado (borrador).\n" : "\n❌ Falló la creación.\n");
}
main().catch((e) => { console.error("❌", e.message); process.exit(1); });

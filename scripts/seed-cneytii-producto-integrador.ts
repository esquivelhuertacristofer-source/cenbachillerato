/**
 * Producto Integrador CNEYT-II (capstone): reflexion_escrita, 50 XP, estado='borrador'.
 * Se aloja en la progresión OFICIAL de mayor numero (numero < 100), es decir CNEYT-II-P08.
 * Uso: npx tsx scripts/seed-cneytii-producto-integrador.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC, upsertActividad } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  log("\n🎓 Producto Integrador CNEYT-II\n");
  const progs = await getProgresionesDeUAC(sb, "CNEYT-II");
  if (!progs.length) throw new Error("CNEYT-II sin progresiones");
  const oficiales = progs.filter((p) => p.numero < 100);
  if (!oficiales.length) throw new Error("CNEYT-II sin progresiones oficiales (numero < 100)");
  const culminante = oficiales.reduce((a, b) => (b.numero > a.numero ? b : a), oficiales[0]);
  log(`  Alojado en progresión culminante oficial: ${culminante.codigo} (numero ${culminante.numero})`);

  const res = await upsertActividad(sb, {
    codigo: "CNEYT-II-PRODUCTO-INTEGRADOR",
    titulo: "Producto Integrador: La energía en mi entorno",
    descripcion: "Ensayo final que integra la energía, sus formas, transformación y conservación, el calor y los principios de la termodinámica para explicar un fenómeno natural o tecnológico del entorno.",
    tipo: "reflexion_escrita",
    progresion_id: culminante.id,
    xp: 50,
    estado: "borrador",
    contenido: {
      instrucciones: "Redacta un ensayo donde integres los aprendizajes de toda la UAC. Organízalo con introducción, desarrollo y conclusión, partiendo de un fenómeno natural o tecnológico que observes en tu propio entorno.",
      prompt: "Elige un fenómeno natural o un dispositivo tecnológico de tu entorno (por ejemplo: una estufa, un refrigerador, un panel solar, el motor de un transporte, el ciclo del agua o una tormenta) y explícalo integrando lo aprendido en el semestre: (1) qué es la energía y qué formas de energía intervienen (cinética, potencial, térmica, eléctrica, química); (2) cómo se transforma y se transfiere la energía, aplicando la ley de la conservación de la energía; (3) el papel del calor y la temperatura, y si hay trabajo mecánico; (4) cómo se aplican los principios de la termodinámica (primera ley ΔU = Q − W y la idea de que ninguna máquina es 100% eficiente por la segunda ley). Cierra reflexionando sobre la eficiencia energética y la sustentabilidad de ese fenómeno o tecnología.",
      formato_esperado: "ensayo",
      longitud_minima_palabras: 300,
    },
  });
  log(res ? "\n✅ Producto Integrador CNEYT-II creado (borrador).\n" : "\n❌ Falló la creación.\n");
}
main().catch((e) => { console.error("❌", e.message); process.exit(1); });

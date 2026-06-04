/**
 * Fix de deuda técnica: total_progresiones debe ser el conteo REAL de progresiones
 * de cada UAC, porque el numerador de progreso (progreso.ts) cuenta TODAS las
 * progresiones (incl. complemento). Si el denominador es menor, el % supera 100.
 * Idempotente: recalcula total_progresiones = COUNT(progresiones) por UAC robustecida.
 * Uso: npx tsx scripts/fix-total-progresiones.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { createSB } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

const ROBUSTECIDAS = [
  "IN-I", "CS-I", "CNEYT-I", "PM-I", "CD-I", "PFH-I",
  "IN-II", "LC-II", "CS-II", "CD-II", "PFH-II", "CNEYT-II", "PM-II",
];

async function main() {
  const sb = createSB();
  console.log("\n🔧 Fix total_progresiones = COUNT(progresiones reales)\n");

  for (const codigo of ROBUSTECIDAS) {
    const { data: uac } = await sb.from("uac").select("id,total_progresiones").eq("codigo", codigo).single();
    if (!uac) { console.log(`  ✗ ${codigo} no encontrada`); continue; }

    const { count } = await sb
      .from("progresiones")
      .select("id", { count: "exact", head: true })
      .eq("uac_id", uac.id);
    const real = count ?? 0;

    if (uac.total_progresiones === real) {
      console.log(`  = ${codigo.padEnd(9)} ya correcto (${real})`);
      continue;
    }
    const { error } = await sb.from("uac").update({ total_progresiones: real }).eq("id", uac.id);
    if (error) console.log(`  ✗ ${codigo}: ${error.message}`);
    else console.log(`  ✓ ${codigo.padEnd(9)} ${uac.total_progresiones} → ${real}`);
  }
  console.log("");
}
main().catch((e) => { console.error("❌", e.message); process.exit(1); });

/**
 * Elimina las 12 actividades 'simulacion' con enlaces externos sembradas
 * antes del pivote a "Práctica experimental" (componentes React propios).
 *
 * Identificadas por: tipo = 'simulacion' Y codigo terminado en '-SIM01'.
 *
 * Uso:
 *   npx tsx scripts/del-sem1-simuladores.ts            → DRY-RUN (solo lista)
 *   npx tsx scripts/del-sem1-simuladores.ts --confirmar → elimina
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createSB } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const confirmar = process.argv.includes("--confirmar");
  const sb = createSB();

  const { data: acts, error } = await sb
    .from("actividades")
    .select("id, codigo, titulo, tipo, estado")
    .eq("tipo", "simulacion")
    .like("codigo", "%-SIM01");

  if (error) { console.error("❌ Error consultando:", error.message); process.exit(1); }
  if (!acts || acts.length === 0) {
    console.log("ℹ️  No se encontraron actividades simulacion con sufijo -SIM01. Nada que borrar.");
    return;
  }

  console.log(`\n${acts.length} actividad(es) candidata(s):\n`);
  for (const a of acts) {
    console.log(`  · ${a.codigo}  [${a.estado}]  ${a.titulo}`);
  }

  if (!confirmar) {
    console.log(`\n🟡 DRY-RUN. No se borró nada.`);
    console.log(`   Para eliminar: npx tsx scripts/del-sem1-simuladores.ts --confirmar\n`);
    return;
  }

  const ids = acts.map((a) => a.id);
  const { error: delErr } = await sb.from("actividades").delete().in("id", ids);
  if (delErr) { console.error("❌ Error eliminando:", delErr.message); process.exit(1); }

  console.log(`\n✅ Eliminadas ${ids.length} actividad(es) simulacion externas.\n`);
}

main().catch((e) => { console.error("❌", e.message); process.exit(1); });

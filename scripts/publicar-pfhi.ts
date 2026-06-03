/** Publica TODAS las actividades de PFH-I (borrador → publicada). Uso: npx tsx scripts/publicar-pfhi.ts */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC } from "./lib/activity-utils";
config({ path: resolve(process.cwd(), ".env.local") });
async function main() {
  const sb = createSB();
  log("\n🚀 Publicando PFH-I\n");
  const progs = await getProgresionesDeUAC(sb, "PFH-I");
  const ids = progs.map((p) => p.id);
  const { data: updated, error } = await sb
    .from("actividades").update({ estado: "publicada" })
    .in("progresion_id", ids).neq("estado", "publicada").select("id");
  if (error) throw error;
  log(`  ✓ ${updated?.length ?? 0} actividades pasadas a 'publicada'.`);
  const { data: all } = await sb.from("actividades").select("estado").in("progresion_id", ids);
  const porEstado: Record<string, number> = {};
  for (const a of all ?? []) porEstado[a.estado] = (porEstado[a.estado] ?? 0) + 1;
  log(`  📊 PFH-I total: ${all?.length ?? 0} → ${JSON.stringify(porEstado)}\n`);
}
main().catch((e) => { console.error("❌", e.message); process.exit(1); });

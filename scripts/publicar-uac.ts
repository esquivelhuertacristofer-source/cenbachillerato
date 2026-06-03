/**
 * Publica todas las actividades de una UAC: estado borrador -> publicada.
 * Uso: npx tsx scripts/publicar-uac.ts <CODIGO_UAC>   (ej. IN-I)
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const codigo = process.argv[2];
  if (!codigo) throw new Error("Falta el código de UAC. Uso: npx tsx scripts/publicar-uac.ts IN-I");

  const sb = createSB();
  log(`\n📢 Publicando UAC ${codigo}\n`);

  const progs = await getProgresionesDeUAC(sb, codigo);
  const ids = progs.map((p) => p.id);

  const { data: updated, error } = await sb
    .from("actividades")
    .update({ estado: "publicada" })
    .in("progresion_id", ids)
    .eq("estado", "borrador")
    .select("codigo");
  if (error) throw error;
  log(`  ✓ Publicadas ${updated?.length ?? 0} actividades que estaban en borrador.\n`);

  const { data: all } = await sb.from("actividades").select("estado").in("progresion_id", ids);
  const porEstado: Record<string, number> = {};
  for (const a of all ?? []) porEstado[a.estado] = (porEstado[a.estado] ?? 0) + 1;
  log(`  📊 ${codigo} total: ${all?.length ?? 0} actividades → ${JSON.stringify(porEstado)}\n`);
}

main().catch((e) => { console.error("❌ Error:", e.message); process.exit(1); });

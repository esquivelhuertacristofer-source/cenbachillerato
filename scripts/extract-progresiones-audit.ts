/**
 * Extrae todas las progresiones con su UAC para el mapa de laboratorios.
 * Uso: npx tsx scripts/extract-progresiones-audit.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { writeFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

config({ path: resolve(process.cwd(), ".env.local") });

const sb = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data: uacs } = await sb.from("uac" as never).select("id,codigo,nombre,semestre").order("semestre");
  const uacMap = new Map((uacs as any[]).map((u: any) => [u.id, u]));

  const { data: progs, error } = await sb
    .from("progresiones" as never)
    .select("id,codigo,titulo,numero,uac_id,meta_aprendizaje,descripcion")
    .order("uac_id,numero");

  if (error) throw new Error(error.message);

  const rows = (progs as any[]).map((p: any) => {
    const uac = uacMap.get(p.uac_id);
    return {
      codigo: p.codigo,
      titulo: p.titulo,
      numero: p.numero,
      meta_aprendizaje: p.meta_aprendizaje,
      descripcion: p.descripcion,
      uac_codigo: uac?.codigo ?? "",
      uac_nombre: uac?.nombre ?? "",
      semestre: uac?.semestre ?? 0,
    };
  });

  const byUac: Record<string, any[]> = {};
  for (const r of rows) {
    if (!byUac[r.uac_codigo]) byUac[r.uac_codigo] = [];
    byUac[r.uac_codigo].push(r);
  }

  const outPath = resolve(process.cwd(), "docs/auditoria/data/progresiones-bachillerato.json");
  writeFileSync(outPath, JSON.stringify({ total: rows.length, por_uac: byUac, progresiones: rows }, null, 2), "utf-8");
  console.log(`✅ ${rows.length} progresiones extraídas → ${outPath}`);

  // Resumen por familia de materia (para labs)
  const familias: Record<string, string[]> = { PM: [], CNEYT: [], CD: [], PFH: [], LC: [], IN: [], CS: [], CH: [] };
  for (const uac of (uacs as any[])) {
    const fam = Object.keys(familias).find(f => uac.codigo.startsWith(f));
    if (fam) familias[fam].push(uac.codigo);
  }
  console.log("\nFamilias UAC:");
  for (const [fam, uacCodes] of Object.entries(familias)) {
    if (uacCodes.length > 0) console.log(`  ${fam}: ${uacCodes.join(", ")}`);
  }
}

main().catch(err => { console.error(err.message); process.exit(1); });

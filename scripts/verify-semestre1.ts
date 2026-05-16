import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

async function main() {
  const { data: uacs, error: uacErr } = await sb
    .from("uac")
    .select("id, codigo")
    .eq("semestre", 1)
    .order("codigo");

  if (uacErr || !uacs) { console.error("Error cargando UAC:", uacErr?.message); process.exit(1); }

  console.log("\nVerificación Semestre 1:\n");
  console.log("uac_codigo  | total | con_meta_real | con_desc_extendida");
  console.log("------------|-------|---------------|-------------------");

  for (const uac of uacs) {
    const { data: progs } = await sb
      .from("progresiones")
      .select("id, meta_aprendizaje, descripcion_extendida")
      .eq("uac_id", uac.id);

    const total = progs?.length ?? 0;
    const conMeta = progs?.filter(p => p.meta_aprendizaje && p.meta_aprendizaje.length > 50).length ?? 0;
    const conDesc = progs?.filter(p => p.descripcion_extendida !== null).length ?? 0;
    console.log(`${uac.codigo.padEnd(11)} | ${String(total).padEnd(5)} | ${String(conMeta).padEnd(13)} | ${conDesc}`);
  }
}

main().catch(err => { console.error("Error:", err.message); process.exit(1); });

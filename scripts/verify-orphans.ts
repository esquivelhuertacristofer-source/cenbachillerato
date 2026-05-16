import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env.local") });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const CODIGOS = [
  'CS-I-P09', 'CS-I-P10',
  'HUM-I-P09', 'HUM-I-P10',
  'IN-I-P09', 'IN-I-P10', 'IN-I-P11', 'IN-I-P12',
];

async function main() {
  const { data: progs, error } = await sb
    .from("progresiones")
    .select("id, codigo")
    .in("codigo", CODIGOS);

  if (error || !progs) { console.error("Error:", error?.message); process.exit(1); }

  console.log("\nVerificación de progresiones sobrantes:\n");
  console.log("codigo      | actividades | intentos");
  console.log("------------|-------------|----------");

  for (const p of progs) {
    const [{ count: acts }, { count: ints }] = await Promise.all([
      sb.from("actividades").select("id", { count: "exact", head: true }).eq("progresion_id", p.id),
      sb.from("intentos").select("id", { count: "exact", head: true }).eq("progresion_id", p.id),
    ]);
    console.log(`${p.codigo.padEnd(11)} | ${String(acts ?? 0).padEnd(11)} | ${ints ?? 0}`);
  }

  if (progs.length < CODIGOS.length) {
    const encontrados = progs.map(p => p.codigo);
    const faltantes = CODIGOS.filter(c => !encontrados.includes(c));
    console.log(`\nNota: no encontrados en DB (ya no existen): ${faltantes.join(', ')}`);
  }
}

main().catch(err => { console.error(err.message); process.exit(1); });

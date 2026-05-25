import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data, error } = await sb
    .from("actividades")
    .select(`
      codigo,
      titulo,
      contenido,
      progresiones!inner(
        titulo,
        uac!inner(
          codigo,
          semestre
        )
      )
    `)
    .eq("tipo", "infografia")
    .in("progresiones.uac.codigo" as never, ["CNEYT-III", "CNEYT-IV", "CNEYT-V", "CNEYT-VI"])
    .order("codigo");

  if (error) { console.error(error); process.exit(1); }
  if (!data || data.length === 0) { console.log("Sin resultados"); process.exit(0); }

  console.log(`\nTotal encontradas: ${data.length}\n`);
  for (const a of data) {
    const p = (a as Record<string, unknown>).progresiones as Record<string, unknown>;
    const u = (p?.uac as Record<string, unknown>);
    const c = a.contenido as Record<string, unknown>;
    console.log(`${"─".repeat(60)}`);
    console.log(`CÓDIGO : ${a.codigo}`);
    console.log(`UAC    : ${u?.codigo ?? "?"} (sem ${u?.semestre ?? "?"})`);
    console.log(`TÍTULO : ${a.titulo}`);
    console.log(`PUNTOS : ${(c?.puntos_clave as string[] ?? []).length}`);
    console.log(`CONTEXTO_MX: ${c?.contexto_mexicano ? "sí" : "NO"}`);
    console.log(`GLOSARIO: ${(c?.glosario as unknown[] ?? []).length} términos`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });

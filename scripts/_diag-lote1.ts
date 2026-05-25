import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

config({ path: resolve(process.cwd(), ".env.local") });

const CODIGOS = [
  'CD-II-P04-A1', 'CD-III-P03-A1',
  'CH-I-P02-A1', 'CH-II-P04-A1', 'CH-III-P04-A1',
  'CNEYT-II-P04-A1', 'CNEYT-II-P07-A1',
];

async function main() {
  const sb = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  for (const codigo of CODIGOS) {
    const { data } = await sb
      .from("actividades")
      .select("codigo, titulo, contenido")
      .eq("codigo", codigo)
      .single();

    if (!data) { console.log(`\n${codigo}: NO ENCONTRADA`); continue; }
    const c = data.contenido as Record<string, unknown>;
    console.log(`\n${"─".repeat(60)}`);
    console.log(`CÓDIGO: ${data.codigo}`);
    console.log(`TÍTULO: ${data.titulo}`);
    console.log(`PUNTOS (${(c.puntos_clave as string[] ?? []).length}):`);
    for (const p of (c.puntos_clave as string[] ?? [])) console.log(`  • ${p}`);
    console.log(`DESC: ${c.descripcion_accesible}`);
    console.log(`FUENTE: ${c.fuente}`);
    console.log(`ACT_POST: ${c.actividad_post}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });

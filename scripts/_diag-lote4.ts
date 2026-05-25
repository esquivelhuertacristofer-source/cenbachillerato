import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

config({ path: resolve(process.cwd(), ".env.local") });

const CODIGOS = [
  'IN-II-P04-A1', 'IN-III-P08-A1',
  'PM-II-P06-A1', 'PM-III-P04-A1',
  'PM-IV-P04-A1', 'PM-IV-P07-A1',
  'PM-V-P02-A1', 'PM-V-P06-A1', 'PM-VI-P08-A1',
];

async function main() {
  const sb = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data, error } = await sb
    .from("actividades")
    .select(`codigo, titulo, contenido, progresiones!inner(titulo, uac!inner(codigo, semestre))`)
    .in("codigo", CODIGOS)
    .order("codigo");

  if (error) { console.error(error); process.exit(1); }

  console.log(`\nEncontradas: ${data?.length ?? 0} de ${CODIGOS.length}\n`);

  const encontrados = new Set(data?.map(a => a.codigo) ?? []);
  for (const c of CODIGOS) {
    if (!encontrados.has(c)) console.log(`❌ NO ENCONTRADO: ${c}`);
  }

  for (const a of (data ?? [])) {
    const p = (a as Record<string, unknown>).progresiones as Record<string, unknown>;
    const u = (p?.uac as Record<string, unknown>);
    const c = a.contenido as Record<string, unknown>;
    const puntos = c?.puntos_clave as string[] ?? [];
    console.log(`${"─".repeat(60)}`);
    console.log(`CÓDIGO : ${a.codigo}`);
    console.log(`UAC    : ${u?.codigo} (sem ${u?.semestre})`);
    console.log(`TÍTULO : ${a.titulo}`);
    console.log(`PUNTOS (${puntos.length}):`);
    puntos.forEach(p => console.log(`  • ${p.slice(0, 80)}…`));
    console.log(`CONTEXTO_MX: ${c?.contexto_mexicano ? "sí" : "NO"}`);
    console.log(`GLOSARIO: ${(c?.glosario as unknown[] ?? []).length} términos`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });

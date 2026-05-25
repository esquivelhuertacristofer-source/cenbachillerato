import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

config({ path: resolve(process.cwd(), ".env.local") });

const YA_HECHOS = new Set([
  'CD-II-P04-A1', 'CD-III-P03-A1',
  'CH-I-P02-A1', 'CH-II-P04-A1', 'CH-III-P04-A1',
]);

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
    .order("codigo");

  if (error) { console.error(error); process.exit(1); }
  if (!data) { console.log("Sin resultados"); process.exit(0); }

  // Filtrar familias del lote 3 que no estén ya hechas
  const familias = ['PFH', 'CS', 'CD', 'LC'];
  const lote3 = data.filter(a => {
    const p = (a as Record<string, unknown>).progresiones as Record<string, unknown>;
    const u = (p?.uac as Record<string, unknown>);
    const uacCodigo = String(u?.codigo ?? '');
    const familia = uacCodigo.split('-')[0];
    return familias.includes(familia) && !YA_HECHOS.has(a.codigo);
  });

  console.log(`\nTotal Lote 3 candidatas: ${lote3.length}\n`);
  for (const a of lote3) {
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

  // También mostrar qué queda (familias PM e IN para lote 4)
  const lote4 = data.filter(a => {
    const p = (a as Record<string, unknown>).progresiones as Record<string, unknown>;
    const u = (p?.uac as Record<string, unknown>);
    const uacCodigo = String(u?.codigo ?? '');
    const familia = uacCodigo.split('-')[0];
    return ['PM', 'IN'].includes(familia);
  });
  console.log(`\n== LOTE 4 CANDIDATAS (PM/IN): ${lote4.length} ==`);
  for (const a of lote4) {
    const p = (a as Record<string, unknown>).progresiones as Record<string, unknown>;
    const u = (p?.uac as Record<string, unknown>);
    console.log(`  ${a.codigo} — ${u?.codigo} sem${u?.semestre} — ${a.titulo}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });

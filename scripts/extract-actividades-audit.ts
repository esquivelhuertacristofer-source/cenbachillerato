/**
 * Extrae todas las actividades de Supabase para auditoría pedagógica.
 * Guarda el resultado en docs/auditoria/data/actividades-bachillerato-completo.json
 *
 * Uso: npx tsx scripts/extract-actividades-audit.ts
 * Solo lectura — no modifica nada en la DB.
 */

import { config } from "dotenv";
import { resolve } from "path";
import { writeFileSync, mkdirSync } from "fs";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

config({ path: resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("ERROR: Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const sb = createClient<Database>(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log("\n🔍 Extrayendo actividades de Supabase para auditoría...\n");

  // Query directa con joins
  const { data, error: qError } = await sb
    .from("actividades" as never)
    .select(`
      codigo,
      tipo,
      titulo,
      contenido,
      xp,
      progresion_id,
      progresiones!inner (
        codigo,
        titulo,
        numero,
        uac_id,
        uac!inner (
          codigo,
          nombre,
          semestre
        )
      )
    `)
    .order("codigo");

  if (qError) {
    // Fallback: query separadas
    console.log("  Query con joins falló, usando queries separadas...");
    await extractViaJoin();
    return;
  }

  const rows = (data as any[]).map((a: any) => ({
    codigo: a.codigo,
    tipo: a.tipo,
    titulo: a.titulo,
    contenido: a.contenido,
    xp: a.xp,
    progresion: a.progresiones?.codigo ?? "",
    progresion_titulo: a.progresiones?.titulo ?? "",
    progresion_numero: a.progresiones?.numero ?? 0,
    uac: a.progresiones?.uac?.codigo ?? "",
    uac_nombre: a.progresiones?.uac?.nombre ?? "",
    semestre: a.progresiones?.uac?.semestre ?? 0,
  }));

  saveResult(rows);
}

async function extractViaJoin() {
  // Paso 1: UAC
  const { data: uacs } = await sb.from("uac" as never).select("id,codigo,nombre,semestre");
  const uacMap = new Map((uacs as any[]).map((u: any) => [u.id, u]));

  // Paso 2: Progresiones
  const { data: progs } = await sb.from("progresiones" as never).select("id,codigo,titulo,numero,uac_id");
  const progMap = new Map((progs as any[]).map((p: any) => [p.id, p]));

  // Paso 3: Actividades (paginadas)
  let allActividades: any[] = [];
  let page = 0;
  const pageSize = 200;

  while (true) {
    const { data: batch, error } = await sb
      .from("actividades" as never)
      .select("codigo,tipo,titulo,contenido,xp,progresion_id")
      .range(page * pageSize, (page + 1) * pageSize - 1)
      .order("codigo");

    if (error) throw new Error(`Error en página ${page}: ${error.message}`);
    if (!batch || batch.length === 0) break;

    allActividades = allActividades.concat(batch);
    console.log(`  Página ${page + 1}: ${batch.length} actividades (total: ${allActividades.length})`);

    if (batch.length < pageSize) break;
    page++;
  }

  const rows = allActividades.map((a: any) => {
    const prog = progMap.get(a.progresion_id);
    const uac = prog ? uacMap.get(prog.uac_id) : null;
    return {
      codigo: a.codigo,
      tipo: a.tipo,
      titulo: a.titulo,
      contenido: a.contenido,
      xp: a.xp,
      progresion: prog?.codigo ?? "",
      progresion_titulo: prog?.titulo ?? "",
      progresion_numero: prog?.numero ?? 0,
      uac: uac?.codigo ?? "",
      uac_nombre: uac?.nombre ?? "",
      semestre: uac?.semestre ?? 0,
    };
  });

  saveResult(rows);
}

function saveResult(rows: any[]) {
  const outDir = resolve(process.cwd(), "docs/auditoria/data");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "actividades-bachillerato-completo.json");

  // Estadísticas rápidas
  const byTipo = new Map<string, number>();
  const byUac = new Map<string, number>();
  const bySemestre = new Map<number, number>();

  for (const r of rows) {
    byTipo.set(r.tipo, (byTipo.get(r.tipo) ?? 0) + 1);
    byUac.set(r.uac, (byUac.get(r.uac) ?? 0) + 1);
    bySemestre.set(r.semestre, (bySemestre.get(r.semestre) ?? 0) + 1);
  }

  const summary = {
    total: rows.length,
    fecha_extraccion: new Date().toISOString(),
    por_tipo: Object.fromEntries([...byTipo.entries()].sort((a, b) => b[1] - a[1])),
    por_uac: Object.fromEntries([...byUac.entries()].sort()),
    por_semestre: Object.fromEntries([...bySemestre.entries()].sort()),
  };

  writeFileSync(outPath, JSON.stringify({ summary, actividades: rows }, null, 2), "utf-8");

  console.log("\n✅ Extracción completa:");
  console.log(`   Total actividades: ${rows.length}`);
  console.log(`   Por semestre: ${JSON.stringify(summary.por_semestre)}`);
  console.log(`   Por tipo:`);
  for (const [tipo, n] of Object.entries(summary.por_tipo)) {
    console.log(`     ${tipo}: ${n}`);
  }
  console.log(`\n   Archivo: ${outPath}\n`);
}

main().catch((err) => {
  console.error("ERROR FATAL:", err instanceof Error ? err.message : err);
  process.exit(1);
});

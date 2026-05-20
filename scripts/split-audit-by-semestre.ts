/**
 * Parte actividades-bachillerato-completo.json en archivos por semestre.
 * Uso: npx tsx scripts/split-audit-by-semestre.ts
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const src = resolve(process.cwd(), "docs/auditoria/data/actividades-bachillerato-completo.json");
const data = JSON.parse(readFileSync(src, "utf-8"));
const actividades: any[] = data.actividades;

for (let sem = 1; sem <= 6; sem++) {
  const subset = actividades.filter((a) => a.semestre === sem);
  const byUac: Record<string, number> = {};
  const byTipo: Record<string, number> = {};
  for (const a of subset) {
    byUac[a.uac] = (byUac[a.uac] ?? 0) + 1;
    byTipo[a.tipo] = (byTipo[a.tipo] ?? 0) + 1;
  }
  const out = {
    semestre: sem,
    total: subset.length,
    por_uac: byUac,
    por_tipo: byTipo,
    actividades: subset,
  };
  const outPath = resolve(process.cwd(), `docs/auditoria/data/actividades-sem${sem}.json`);
  writeFileSync(outPath, JSON.stringify(out, null, 2), "utf-8");
  console.log(`Semestre ${sem}: ${subset.length} actividades → ${outPath}`);
}

console.log("\n✅ Split completado.");

/** Chequeo de integridad de datos en TODA la BD. Solo lectura. */
import { config } from "dotenv";
import { resolve } from "path";
import { createSB } from "./lib/activity-utils";
config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createSB();
  const { data: uacs } = await sb.from("uac").select("id,codigo,semestre,total_progresiones").order("semestre").order("codigo");
  let problemas = 0;
  let totalAct = 0, totalBorr = 0, totalProgr = 0;
  const progSinMin: string[] = [];
  const totalMismatch: string[] = [];

  for (const u of uacs ?? []) {
    const { data: progs } = await sb.from("progresiones").select("id,codigo,numero").eq("uac_id", u.id);
    const nProg = progs?.length ?? 0;
    totalProgr += nProg;
    if (u.total_progresiones !== nProg) {
      totalMismatch.push(`${u.codigo}: total_progresiones=${u.total_progresiones} pero hay ${nProg} reales`);
      problemas++;
    }
    const ids = (progs ?? []).map((p) => p.id);
    const { data: acts } = ids.length
      ? await sb.from("actividades").select("estado,progresion_id").in("progresion_id", ids)
      : { data: [] };
    totalAct += acts?.length ?? 0;
    totalBorr += (acts ?? []).filter((a) => a.estado === "borrador").length;
    for (const p of progs ?? []) {
      const n = (acts ?? []).filter((a) => a.progresion_id === p.id).length;
      if (n < 7) { progSinMin.push(`${p.codigo} (sem${u.semestre}) tiene ${n} act`); problemas++; }
    }
  }

  console.log(`\n📊 RESUMEN GLOBAL`);
  console.log(`   UACs: ${uacs?.length} · progresiones: ${totalProgr} · actividades: ${totalAct} (borrador: ${totalBorr})`);
  console.log(`\n🔎 INTEGRIDAD`);
  console.log(`   total_progresiones desalineado: ${totalMismatch.length}`);
  totalMismatch.forEach((m) => console.log(`     ⚠ ${m}`));
  console.log(`   progresiones con <7 actividades: ${progSinMin.length}`);
  progSinMin.slice(0, 30).forEach((m) => console.log(`     ⚠ ${m}`));
  console.log(`   borradores pendientes: ${totalBorr}`);
  console.log(`\n${problemas === 0 ? "✅ SIN DEUDA DE DATOS" : `❌ ${problemas} problemas`}\n`);
}
main().catch((e) => { console.error("❌", e.message); process.exit(1); });

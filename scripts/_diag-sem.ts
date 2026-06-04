/**
 * Diagnóstico genérico de un semestre: UACs, progresiones (orden, placeholder),
 * actividades por progresión y estado. Solo lectura.
 * Uso: npx tsx scripts/_diag-sem.ts <numero_semestre>   (ej. 4)
 */
import { config } from "dotenv";
import { resolve } from "path";
import { createSB } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sem = Number(process.argv[2] ?? "4");
  const sb = createSB();
  console.log(`\n📚 SEMESTRE ${sem} — estado actual\n`);

  const { data: uacs } = await sb
    .from("uac")
    .select("id,codigo,nombre,total_progresiones")
    .eq("semestre", sem)
    .order("codigo");

  if (!uacs?.length) { console.log("  (sin UACs)"); return; }

  for (const u of uacs) {
    const { data: progs } = await sb
      .from("progresiones")
      .select("id,codigo,numero,titulo,es_placeholder")
      .eq("uac_id", u.id)
      .order("numero");
    const ph = (progs ?? []).filter((p) => p.es_placeholder).length;
    const ids = (progs ?? []).map((p) => p.id);
    const { data: acts } = ids.length
      ? await sb.from("actividades").select("estado,progresion_id").in("progresion_id", ids)
      : { data: [] };
    const total = acts?.length ?? 0;
    const pub = (acts ?? []).filter((a) => a.estado === "publicada").length;
    const borr = (acts ?? []).filter((a) => a.estado === "borrador").length;

    console.log(`\n━━ ${u.codigo}  «${u.nombre}»  total_progr=${u.total_progresiones}`);
    console.log(`   progresiones=${progs?.length ?? 0} (placeholder=${ph}) · actividades=${total} (pub=${pub}, borr=${borr})`);
    for (const p of progs ?? []) {
      const n = (acts ?? []).filter((a) => a.progresion_id === p.id).length;
      const flag = p.es_placeholder ? "·placeholder" : "";
      console.log(`     ${String(p.numero).padStart(3, "0")} [${p.codigo}] act=${n} ${flag}  ${p.titulo}`);
    }
  }
  console.log("");
}
main().catch((e) => { console.error("❌", e.message); process.exit(1); });

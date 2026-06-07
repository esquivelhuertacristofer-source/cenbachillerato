/**
 * Asocia (o desasocia) una práctica experimental a una actividad.
 * El slug debe existir en src/components/practicas/registry.tsx.
 *
 * Uso:
 *   npx tsx scripts/set-practica.ts <CODIGO_ACTIVIDAD> <slug>   → asocia
 *   npx tsx scripts/set-practica.ts <CODIGO_ACTIVIDAD> --quitar → desasocia (NULL)
 *
 * Ejemplos:
 *   npx tsx scripts/set-practica.ts CNEYT-I-P02-A2 plantilla-demo
 *   npx tsx scripts/set-practica.ts CNEYT-I-P02-A2 --quitar
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createSB } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const [codigo, slugArg] = process.argv.slice(2);

  if (!codigo || !slugArg) {
    console.error("Uso: npx tsx scripts/set-practica.ts <CODIGO_ACTIVIDAD> <slug|--quitar>");
    process.exit(1);
  }

  const quitar = slugArg === "--quitar";
  const practica_slug = quitar ? null : slugArg;

  const sb = createSB();

  // Verificar que la actividad existe
  const { data: act, error: findErr } = await sb
    .from("actividades")
    .select("id, codigo, titulo, practica_slug")
    .eq("codigo", codigo)
    .maybeSingle();

  if (findErr) { console.error("❌ Error consultando:", findErr.message); process.exit(1); }
  if (!act) { console.error(`❌ No existe la actividad con código «${codigo}».`); process.exit(1); }

  const { error: updErr } = await sb
    .from("actividades")
    .update({ practica_slug })
    .eq("id", act.id);

  if (updErr) { console.error("❌ Error actualizando:", updErr.message); process.exit(1); }

  if (quitar) {
    console.log(`✅ ${codigo} — práctica desasociada (antes: ${act.practica_slug ?? "ninguna"}).`);
  } else {
    console.log(`✅ ${codigo} — práctica asociada → «${practica_slug}»  (${act.titulo})`);
  }
}

main().catch((e) => { console.error("❌", e.message); process.exit(1); });

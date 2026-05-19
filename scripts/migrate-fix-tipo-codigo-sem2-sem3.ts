/**
 * Script idempotente para llenar tipo_codigo en actividades de Sem 2 y Sem 3
 * que fueron insertadas sin este campo.
 *
 * Regla: tipo_codigo = tipo (copia directa, sin transformación).
 * Sem 1 funciona correctamente y NO se toca.
 *
 * Uso: npx tsx scripts/migrate-fix-tipo-codigo-sem2-sem3.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

config({ path: resolve(process.cwd(), ".env.local") });

const SEM2_UACS = ["LC-II", "PM-II", "IN-II", "CD-II", "CS-II", "PFH-II", "CNEYT-II"];
const SEM3_UACS = ["LC-III", "PM-III", "IN-III", "PFH-III", "CNEYT-III"];
const TARGET_UACS = [...SEM2_UACS, ...SEM3_UACS];

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");

  const sb = createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("\n🔧 Migración: llenar tipo_codigo NULL en actividades Sem 2 y Sem 3\n");
  console.log(`UACs objetivo: ${TARGET_UACS.join(", ")}\n`);

  // 1. Obtener IDs de las UACs objetivo
  const { data: uacs, error: uacErr } = await sb
    .from("uac")
    .select("id, codigo")
    .in("codigo", TARGET_UACS);

  if (uacErr || !uacs || uacs.length === 0) {
    console.error("❌ No se encontraron las UACs:", uacErr?.message);
    process.exit(1);
  }
  console.log(`✓ UACs encontradas: ${uacs.map(u => u.codigo).join(", ")}`);

  const uacIds = uacs.map(u => u.id);

  // 2. Obtener progresiones de esas UACs
  const { data: progs, error: progErr } = await sb
    .from("progresiones")
    .select("id")
    .in("uac_id", uacIds);

  if (progErr || !progs || progs.length === 0) {
    console.error("❌ No se encontraron progresiones:", progErr?.message);
    process.exit(1);
  }
  console.log(`✓ Progresiones encontradas: ${progs.length}`);

  const progIds = progs.map(p => p.id);

  // 3. Obtener actividades con tipo_codigo = NULL en esas progresiones
  const { data: sinTipoCodigo, error: actErr } = await sb
    .from("actividades")
    .select("id, codigo, tipo")
    .in("progresion_id", progIds)
    .is("tipo_codigo", null);

  if (actErr) {
    console.error("❌ Error consultando actividades:", actErr.message);
    process.exit(1);
  }

  if (!sinTipoCodigo || sinTipoCodigo.length === 0) {
    console.log("\n✅ No hay actividades con tipo_codigo=NULL en Sem 2/3. Nada que hacer.");
    process.exit(0);
  }

  console.log(`\n⚠️  Actividades con tipo_codigo=NULL: ${sinTipoCodigo.length}`);
  console.log("Iniciando actualización (tipo_codigo = tipo)...\n");

  // 4. Actualizar en lotes de 20
  const BATCH = 20;
  let ok = 0;
  let fail = 0;

  // Agrupar por UAC para el log
  const uacById = Object.fromEntries(uacs.map(u => [u.id, u.codigo]));
  const progToUac: Record<string, string> = {};
  const { data: progsDetail } = await sb
    .from("progresiones")
    .select("id, uac_id")
    .in("id", progIds);
  if (progsDetail) {
    for (const p of progsDetail) {
      progToUac[p.id] = uacById[p.uac_id ?? ""] ?? "?";
    }
  }

  // Obtener progresion_id de cada actividad para el log
  const { data: actsDetalle } = await sb
    .from("actividades")
    .select("id, codigo, tipo, progresion_id")
    .in("id", sinTipoCodigo.map(a => a.id));

  const actMap = new Map((actsDetalle ?? []).map(a => [a.id, a]));

  for (let i = 0; i < sinTipoCodigo.length; i += BATCH) {
    const lote = sinTipoCodigo.slice(i, i + BATCH);
    for (const act of lote) {
      const detalle = actMap.get(act.id);
      const uacCodigo = detalle ? (progToUac[detalle.progresion_id] ?? "?") : "?";
      console.log(`  Actualizando ${act.codigo} [${uacCodigo}]: tipo='${act.tipo}' → tipo_codigo='${act.tipo}'`);

      const { error } = await sb
        .from("actividades")
        .update({ tipo_codigo: act.tipo } as { tipo_codigo: string })
        .eq("id", act.id);

      if (error) {
        console.error(`  ❌ Error en ${act.codigo}: ${error.message}`);
        fail++;
      } else {
        ok++;
      }
    }
  }

  // 5. Verificar resultado
  const { data: restantes } = await sb
    .from("actividades")
    .select("id")
    .in("progresion_id", progIds)
    .is("tipo_codigo", null);

  console.log("\n" + "=".repeat(60));
  console.log("REPORTE FINAL");
  console.log("=".repeat(60));
  console.log(`Total actualizadas: ${ok}`);
  console.log(`Errores: ${fail}`);
  console.log(`tipo_codigo=NULL restantes en Sem 2/3: ${restantes?.length ?? "?"}`);
  console.log(`Estado: ${fail === 0 && (restantes?.length ?? 0) === 0 ? "✅ COMPLETO" : "⚠️ REVISAR ERRORES"}`);
}

main().catch((err) => {
  console.error("❌ Error fatal:", err.message);
  process.exit(1);
});

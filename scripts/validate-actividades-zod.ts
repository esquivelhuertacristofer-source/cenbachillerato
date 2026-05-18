/**
 * FASE 2 — Validación Zod masiva de actividades Semestre 1.
 * También sincroniza tipo_codigo (FK) desde tipo (legado).
 * Ejecutar: npx tsx scripts/validate-actividades-zod.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";
import { validarContenidoActividad } from "../src/lib/activities/validators";
import type { TipoActividadKey } from "../src/lib/activities/validators";
import * as fs from "fs";

config({ path: resolve(process.cwd(), ".env.local") });

const sb = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const lines: string[] = [];
function log(msg: string) { console.log(msg); lines.push(msg); }

const TIPOS_VALIDOS: TipoActividadKey[] = [
  "lectura", "quiz_multiple_opcion", "quiz_verdadero_falso", "fill_blanks",
  "ejercicio_matematico", "reflexion_escrita", "video_con_preguntas",
  "infografia", "debate_estructurado", "simulacion", "glosario_interactivo", "autoevaluacion",
];

async function main() {
  log("=".repeat(70));
  log("FASE 2 — VALIDACIÓN ZOD MASIVA + SINCRONIZACIÓN tipo_codigo");
  log("=".repeat(70));
  log(`Ejecutado: ${new Date().toISOString()}\n`);

  // Obtener todas las actividades de Semestre 1
  const { data: uacs, error: uacErr } = await sb
    .from("uac").select("id").eq("semestre", 1);
  if (uacErr || !uacs) { log(`ERROR UAC: ${uacErr?.message}`); process.exit(1); }

  const { data: progs, error: progsErr } = await sb
    .from("progresiones").select("id").in("uac_id", uacs.map(u => u.id));
  if (progsErr || !progs) { log(`ERROR progs: ${progsErr?.message}`); process.exit(1); }

  const { data: acts, error: actsErr } = await sb
    .from("actividades")
    .select("id, codigo, titulo, tipo, contenido")
    .in("progresion_id", progs.map(p => p.id))
    .order("codigo");

  if (actsErr || !acts) { log(`ERROR acts: ${actsErr?.message}`); process.exit(1); }

  log(`Actividades a validar: ${acts.length}\n`);

  // ── 2A. Validación Zod ──────────────────────────────────────────────────

  log("── 2A. RESULTADOS DE VALIDACIÓN ZOD ────────────────────────────────");

  let validas = 0;
  let invalidas = 0;
  const erroresDetallados: Array<{ codigo: string; tipo: string; errores: string[] }> = [];

  for (const act of acts) {
    if (!TIPOS_VALIDOS.includes(act.tipo as TipoActividadKey)) {
      log(`  ⚠️  ${act.codigo}: tipo desconocido '${act.tipo}'`);
      invalidas++;
      erroresDetallados.push({ codigo: act.codigo, tipo: act.tipo, errores: [`tipo_desconocido: ${act.tipo}`] });
      continue;
    }

    const result = validarContenidoActividad(act.tipo as TipoActividadKey, act.contenido);
    if (result.success) {
      validas++;
    } else {
      invalidas++;
      const erroresZod = "error" in result && result.error && "issues" in result.error
        ? (result.error as { issues: Array<{ path: (string | number)[]; message: string }> }).issues.map(
            (i) => `${i.path.join(".")}: ${i.message}`
          )
        : ["error_desconocido"];
      erroresDetallados.push({ codigo: act.codigo, tipo: act.tipo, errores: erroresZod });
      log(`  ❌ ${act.codigo} [${act.tipo}]:`);
      for (const e of erroresZod) log(`       ${e}`);
    }
  }

  log(`\nResultado Zod: ${validas} válidas, ${invalidas} inválidas de ${acts.length} totales`);

  if (invalidas > 0) {
    log("\n── DETALLE DE ERRORES ZOD ───────────────────────────────────────────");
    for (const { codigo, tipo, errores } of erroresDetallados) {
      log(`\n  Actividad: ${codigo} [${tipo}]`);
      for (const e of errores) log(`    • ${e}`);
    }
  } else {
    log("  ✅ Todas las actividades pasan validación Zod.");
  }

  // ── 2B. Sincronización tipo_codigo ──────────────────────────────────────

  log("\n── 2B. SINCRONIZACIÓN tipo_codigo (FK) ──────────────────────────────");

  // Verificar cuántas tienen tipo_codigo=NULL
  const { data: sinTipoCodigo } = await sb
    .from("actividades")
    .select("id, codigo, tipo")
    .in("progresion_id", progs.map(p => p.id))
    .is("tipo_codigo", null);

  if (!sinTipoCodigo || sinTipoCodigo.length === 0) {
    log("  ✅ tipo_codigo ya está sincronizado en todas las actividades.");
  } else {
    log(`  Sincronizando tipo_codigo en ${sinTipoCodigo.length} actividades...`);
    let sincronizadas = 0;
    let errorSync = 0;

    // Update en lotes de 20
    const BATCH = 20;
    for (let i = 0; i < sinTipoCodigo.length; i += BATCH) {
      const lote = sinTipoCodigo.slice(i, i + BATCH);
      for (const a of lote) {
        const { error } = await sb
          .from("actividades")
          .update({ tipo_codigo: a.tipo } as { tipo_codigo: string })
          .eq("id", a.id);
        if (error) {
          log(`  ❌ Error sincronizando ${a.codigo}: ${error.message}`);
          errorSync++;
        } else {
          sincronizadas++;
        }
      }
    }
    log(`  Sincronización: ${sincronizadas} OK, ${errorSync} errores.`);
    if (errorSync === 0) log("  ✅ tipo_codigo sincronizado correctamente.");
  }

  // ── RESUMEN FASE 2 ──────────────────────────────────────────────────────

  log("\n" + "=".repeat(70));
  log("RESUMEN FASE 2");
  log("=".repeat(70));
  log(`Validación Zod: ${validas}/${acts.length} válidas`);
  log(`Actividades inválidas: ${invalidas}`);
  log(`tipo_codigo sincronizado: ✅`);
  log(`Estado Fase 2: ${invalidas === 0 ? "✅ PASS" : "❌ ERRORES ENCONTRADOS — revisar arriba"}`);

  // Write log
  const logPath = resolve(process.cwd(), "_diagnostico-robustez-actividades.log");
  const existing = fs.existsSync(logPath) ? fs.readFileSync(logPath, "utf8") : "";
  fs.writeFileSync(logPath, existing + "\n" + lines.join("\n") + "\n\n");
  log(`\nLog actualizado en: ${logPath}`);
}

main().catch((err) => { console.error("❌", err.message); process.exit(1); });

/**
 * FASE 1 — Inventario y verificación de integridad de actividades Semestre 1.
 * Ejecutar: npx tsx scripts/audit-fase1-inventario.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";
import * as fs from "fs";

config({ path: resolve(process.cwd(), ".env.local") });

const sb = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const lines: string[] = [];
function log(msg: string) { console.log(msg); lines.push(msg); }

async function main() {
  log("=".repeat(70));
  log("FASE 1 — INVENTARIO Y VERIFICACIÓN DE INTEGRIDAD — SEMESTRE 1");
  log("=".repeat(70));
  log(`Ejecutado: ${new Date().toISOString()}\n`);

  // ── 1.1 Conteo de actividades por progresión ─────────────────────────────

  log("── 1.1 ACTIVIDADES POR PROGRESIÓN ──────────────────────────────────");

  const { data: progs, error: progsErr } = await sb
    .from("progresiones")
    .select(`
      id, codigo, numero,
      uac:uac_id ( codigo, semestre ),
      actividades ( id, codigo, tipo )
    `)
    .order("codigo");

  if (progsErr || !progs) {
    log(`ERROR obteniendo progresiones: ${progsErr?.message}`);
    process.exit(1);
  }

  // Filter semestre 1
  const sem1Progs = progs.filter((p) => {
    const uac = p.uac as { codigo: string; semestre: number } | null;
    return uac?.semestre === 1;
  });

  log(`Total progresiones Semestre 1: ${sem1Progs.length} (esperado: 48)`);

  let totalActividades = 0;
  let progsConMenos3 = 0;
  let progsConMas3 = 0;
  let progsOK = 0;

  // Group by UAC
  const byUAC: Record<string, { prog: typeof sem1Progs[0]; count: number }[]> = {};
  for (const p of sem1Progs) {
    const uacCodigo = (p.uac as { codigo: string } | null)?.codigo ?? "?";
    const actsArr = Array.isArray(p.actividades) ? p.actividades : [];
    const count = actsArr.length;
    totalActividades += count;
    if (!byUAC[uacCodigo]) byUAC[uacCodigo] = [];
    byUAC[uacCodigo].push({ prog: p, count });
    if (count < 3) progsConMenos3++;
    else if (count > 3) progsConMas3++;
    else progsOK++;
  }

  log(`\nResumen por UAC:`);
  log(`${"UAC".padEnd(12)} ${"Progs".padStart(5)} ${"Acts".padStart(5)} ${"Estado"}`);
  log("-".repeat(40));

  for (const [uac, items] of Object.entries(byUAC).sort()) {
    const totalActs = items.reduce((s, i) => s + i.count, 0);
    const issues = items.filter(i => i.count !== 3);
    const status = issues.length === 0 ? "✅ OK" : `⚠️  ${issues.length} progs con ≠3 acts`;
    log(`${uac.padEnd(12)} ${String(items.length).padStart(5)} ${String(totalActs).padStart(5)}  ${status}`);
  }

  log(`\nTotal actividades Semestre 1: ${totalActividades} (esperado: 144)`);
  log(`Progresiones con exactamente 3 actividades: ${progsOK}/48`);
  log(`Progresiones con menos de 3 actividades: ${progsConMenos3}`);
  log(`Progresiones con más de 3 actividades: ${progsConMas3}`);

  // Detalle de problemas
  const problemas: string[] = [];
  for (const [uac, items] of Object.entries(byUAC)) {
    for (const { prog, count } of items) {
      if (count !== 3) {
        const msg = `  ⚠️  ${prog.codigo} (${uac}): ${count} actividades (esperado 3)`;
        log(msg);
        problemas.push(msg);
      }
    }
  }
  if (problemas.length === 0) log("  ✅ Todas las progresiones tienen exactamente 3 actividades.");

  // ── 1.2 Distribución de tipos ────────────────────────────────────────────

  log("\n── 1.2 DISTRIBUCIÓN DE TIPOS POR UAC ───────────────────────────────");

  const tiposByUAC: Record<string, Record<string, number>> = {};
  for (const p of sem1Progs) {
    const uacCodigo = (p.uac as { codigo: string } | null)?.codigo ?? "?";
    const actsArr = Array.isArray(p.actividades) ? p.actividades as { tipo: string }[] : [];
    if (!tiposByUAC[uacCodigo]) tiposByUAC[uacCodigo] = {};
    for (const a of actsArr) {
      tiposByUAC[uacCodigo][a.tipo] = (tiposByUAC[uacCodigo][a.tipo] ?? 0) + 1;
    }
  }

  for (const [uac, tipos] of Object.entries(tiposByUAC).sort()) {
    log(`\n${uac}:`);
    for (const [tipo, cnt] of Object.entries(tipos).sort()) {
      log(`  ${tipo.padEnd(25)} ${cnt}`);
    }
  }

  // ── 1.3 Verificación de campos obligatorios ──────────────────────────────

  log("\n── 1.3 VERIFICACIÓN DE CAMPOS OBLIGATORIOS ─────────────────────────");

  const { data: allActs, error: actsErr } = await sb
    .from("actividades")
    .select("codigo, titulo, tipo, contenido, estado, progresion_id")
    .in("progresion_id", sem1Progs.map(p => p.id));

  if (actsErr || !allActs) {
    log(`ERROR obteniendo actividades: ${actsErr?.message}`);
    process.exit(1);
  }

  let camposFaltantes = 0;
  for (const a of allActs) {
    const issues: string[] = [];
    if (!a.titulo || a.titulo.length < 5) issues.push("titulo_corto");
    if (!a.contenido) issues.push("contenido_null");
    if (typeof a.contenido === "object" && Object.keys(a.contenido as object).length === 0) issues.push("contenido_vacio");
    if (!a.estado) issues.push("estado_null");
    if (!a.progresion_id) issues.push("progresion_id_null");
    if (issues.length > 0) {
      log(`  ⚠️  ${a.codigo}: ${issues.join(", ")}`);
      camposFaltantes++;
    }
  }
  if (camposFaltantes === 0) log("  ✅ Todos los campos obligatorios están presentes (0 anomalías).");
  else log(`  ❌ ${camposFaltantes} actividades con campos faltantes.`);

  // ── tipo_codigo check ──
  log("\n── 1.4 VERIFICACIÓN DE tipo_codigo (FK normalizado) ─────────────────");
  const { data: sinTipoCodigo, error: tcErr } = await sb
    .from("actividades")
    .select("codigo, tipo")
    .in("progresion_id", sem1Progs.map(p => p.id))
    .is("tipo_codigo", null);

  if (!tcErr) {
    if (sinTipoCodigo && sinTipoCodigo.length > 0) {
      log(`  ⚠️  ${sinTipoCodigo.length} actividades tienen tipo_codigo=NULL (FK no sincronizada con tipo).`);
      log("     Causa: el seed usó la columna 'tipo' (legado) sin sincronizar tipo_codigo.");
      log("     Impacto: ninguno funcional por ahora (UI lee 'tipo'). Pendiente de sincronización.");
    } else {
      log("  ✅ Todas las actividades tienen tipo_codigo poblado.");
    }
  }

  // ── Estado check ──
  log("\n── 1.5 DISTRIBUCIÓN DE ESTADOS ─────────────────────────────────────");
  const estadoCounts: Record<string, number> = {};
  for (const a of allActs) {
    estadoCounts[a.estado ?? "null"] = (estadoCounts[a.estado ?? "null"] ?? 0) + 1;
  }
  for (const [estado, cnt] of Object.entries(estadoCounts)) {
    const esperado = estado === "borrador" ? "(✅ correcto)" : "(⚠️ inesperado)";
    log(`  ${estado}: ${cnt} ${esperado}`);
  }

  // ── RESUMEN FASE 1 ─────────────────────────────────────────────────────

  log("\n" + "=".repeat(70));
  log("RESUMEN FASE 1");
  log("=".repeat(70));
  log(`Progresiones Semestre 1: ${sem1Progs.length}/48`);
  log(`Actividades totales: ${totalActividades}/144`);
  log(`Progs con 3 actividades: ${progsOK}/48`);
  log(`Campos obligatorios OK: ${camposFaltantes === 0 ? "✅" : "❌"}`);
  log(`Integridad estructural: ${progsOK === 48 && totalActividades === 144 && camposFaltantes === 0 ? "✅ PASS" : "❌ ISSUES ENCONTRADOS"}`);

  // Write log
  const logPath = resolve(process.cwd(), "_diagnostico-robustez-actividades.log");
  const existing = fs.existsSync(logPath) ? fs.readFileSync(logPath, "utf8") : "";
  fs.writeFileSync(logPath, existing + lines.join("\n") + "\n\n");
  log(`\nLog escrito en: ${logPath}`);
}

main().catch((err) => { console.error("❌", err.message); process.exit(1); });

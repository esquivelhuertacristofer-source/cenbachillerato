/**
 * Limpieza de la jornada de carga: borra TODO lo sintético.
 *
 * Enumera los alumnos sintéticos de la escuela sandbox y borra, en orden seguro
 * de llaves foráneas: intentos → snapshot → profiles → usuarios de Auth → la
 * escuela sandbox. Solo toca lo que cuelga de la escuela LOADTEST-000; nunca
 * datos reales.
 *
 * ⚠️ BORRA en tu proyecto Supabase (probable PROD). Solo corre con
 * LOADTEST_CONFIRM=si; sin eso, imprime el plan y sale.
 *
 * Uso:
 *   # simulacro (cuenta qué borraría, no borra):
 *   npx tsx scripts/loadtest/limpiar-usuarios-carga.ts
 *   # de verdad:
 *   LOADTEST_CONFIRM=si npx tsx scripts/loadtest/limpiar-usuarios-carga.ts
 */
import { pathToFileURL } from "url";
import {
  SANDBOX_CCT,
  SANDBOX_NOMBRE,
  confirmado,
  getServiceClient,
  targetHost,
  objetivoEsElDeLaApp,
  reintentar,
  esErrorTransitorio,
} from "./config";

type SB = ReturnType<typeof getServiceClient>;

async function mapLimit<T>(items: T[], limite: number, fn: (item: T) => Promise<void>) {
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limite, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      await fn(items[i]!);
    }
  });
  await Promise.all(workers);
}

/** ids (auth) de los profiles que cuelgan de la escuela sandbox. */
async function idsSinteticos(sb: SB, escuelaId: string): Promise<string[]> {
  const { data, error } = await sb.from("profiles").select("id").eq("escuela_id", escuelaId);
  if (error) throw new Error(`listar profiles: ${error.message}`);
  return ((data ?? []) as { id: string }[]).map((p) => p.id);
}

async function main() {
  console.log("\n🧹 CEN Bachillerato — Limpieza de cuentas de CARGA (sintéticas)\n");
  console.log(`  Objetivo Supabase : ${targetHost()}${objetivoEsElDeLaApp() ? "  ⚠️ (proyecto de la app / probable PROD)" : ""}`);
  console.log(`  Escuela sandbox   : ${SANDBOX_NOMBRE} (CCT ${SANDBOX_CCT})`);

  const sb = getServiceClient();
  const { data: esc } = await sb.from("escuelas").select("id").eq("cct", SANDBOX_CCT).maybeSingle();
  if (!esc) {
    console.log("\n  ✓ No existe la escuela sandbox: no hay nada que limpiar.\n");
    return;
  }
  const escuelaId = esc.id;
  const ids = await idsSinteticos(sb, escuelaId);
  console.log(`  Alumnos sintéticos: ${ids.length}`);

  if (!confirmado()) {
    console.log("\n🟡 SIMULACRO — no se borró nada.");
    console.log(`   Borraría: intentos + snapshot + profiles de ${ids.length} alumnos,`);
    console.log("   sus usuarios de Auth y la escuela sandbox.");
    console.log("   Para ejecutar de verdad, repite con LOADTEST_CONFIRM=si en el entorno.\n");
    return;
  }

  if (ids.length > 0) {
    console.log("\n1. Borrando intentos…");
    // .in() con listas enormes es frágil; troceamos en lotes.
    const LOTE = 200;
    let intentosBorrados = 0;
    for (let i = 0; i < ids.length; i += LOTE) {
      const chunk = ids.slice(i, i + LOTE);
      const { error, count } = await sb
        .from("intentos")
        .delete({ count: "exact" })
        .in("user_id", chunk);
      if (error) throw new Error(`borrar intentos: ${error.message}`);
      intentosBorrados += count ?? 0;
    }
    console.log(`   ✓ ${intentosBorrados} intentos`);

    console.log("\n2. Borrando snapshots…");
    let snapsBorrados = 0;
    for (let i = 0; i < ids.length; i += LOTE) {
      const chunk = ids.slice(i, i + LOTE);
      const { error, count } = await sb
        .from("progreso_alumno_snapshot")
        .delete({ count: "exact" })
        .in("user_id", chunk);
      if (error) throw new Error(`borrar snapshot: ${error.message}`);
      snapsBorrados += count ?? 0;
    }
    console.log(`   ✓ ${snapsBorrados} snapshots`);

    console.log("\n3. Borrando profiles…");
    const { error: pErr, count: pCount } = await sb
      .from("profiles")
      .delete({ count: "exact" })
      .eq("escuela_id", escuelaId);
    if (pErr) throw new Error(`borrar profiles: ${pErr.message}`);
    console.log(`   ✓ ${pCount ?? 0} profiles`);

    console.log("\n4. Borrando usuarios de Auth…");
    let authBorrados = 0;
    let authFallidos = 0;
    await mapLimit(ids, 8, async (id) => {
      try {
        await reintentar(async () => {
          const { error } = await sb.auth.admin.deleteUser(id);
          if (error && esErrorTransitorio(error.message)) throw error;
          if (error) authFallidos++;
          else authBorrados++;
        });
      } catch {
        authFallidos++;
      }
    });
    console.log(`   ✓ ${authBorrados} usuarios${authFallidos ? `  (${authFallidos} ya no existían)` : ""}`);
  }

  console.log("\n5. Borrando escuela sandbox…");
  const { error: eErr } = await sb.from("escuelas").delete().eq("id", escuelaId);
  if (eErr) throw new Error(`borrar escuela: ${eErr.message}`);
  console.log("   ✓ escuela sandbox eliminada");

  console.log("\n✅ Limpieza completa. No queda rastro sintético.\n");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error("\nERROR FATAL:", err instanceof Error ? err.message : err);
    process.exit(1);
  });
}

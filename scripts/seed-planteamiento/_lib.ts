/**
 * Utilidades compartidas para los seeds de planteamiento_progresiones.
 * Cada script de familia importa upsertFamilia() y llama a seedFamilia().
 */

import { readFileSync } from "fs";
import { join, resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../src/types/database.types";

export type SB = ReturnType<typeof createClient<Database>>;

const DATA_DIR = resolve(process.cwd(), "scripts/seed-planteamiento/data");

// ── Stub detection ─────────────────────────────────────────────────────────

type MaybeObj = Record<string, unknown>;

function isStub(contenido: MaybeObj): boolean {
  const meta = contenido.metadata as MaybeObj | undefined;
  const objective = meta?.objective as string | undefined;
  return !objective || objective.startsWith("_TODO");
}

// ── Core upsert ────────────────────────────────────────────────────────────

async function upsertProgresion(
  sb: SB,
  codigo: string,
  contenido: MaybeObj,
): Promise<"upserted" | "skipped" | "notfound" | "error"> {
  // 1. Find progresion_id by codigo
  const { data, error: findErr } = await sb
    .from("progresiones")
    .select("id")
    .eq("codigo", codigo)
    .single();

  if (findErr || !data) {
    console.warn(`  ⚠ SKIP: ${codigo} — no encontrada en progresiones (${findErr?.message ?? "null"})`);
    return "notfound";
  }

  // 2. Upsert into planteamiento_progresiones (table not yet in DB types)
  const sbAny = sb as unknown as ReturnType<typeof createClient>;
  const { error: upsertErr } = await sbAny
    .from("planteamiento_progresiones")
    .upsert(
      {
        progresion_id: data.id,
        contenido,
        version_curricular: "MCCEMS_2025",
        nivel_revision: "borrador",
      },
      { onConflict: "progresion_id,version_curricular" },
    );

  if (upsertErr) {
    console.error(`  ✗ ERROR: ${codigo} — ${upsertErr.message}`);
    return "error";
  }

  console.log(`  ✓ ${codigo}`);
  return "upserted";
}

// ── Public API ─────────────────────────────────────────────────────────────

export interface ArchivoDef {
  archivo: string; // e.g. "lc-i.json"
}

export async function seedFamilia(
  sb: SB,
  familia: string,
  archivos: ArchivoDef[],
): Promise<void> {
  console.log(`\n🌱 Planteamiento ${familia} — upsert a planteamiento_progresiones\n`);

  let total = 0;
  let stubs = 0;
  let notfound = 0;
  let errors = 0;

  for (const { archivo } of archivos) {
    const filePath = join(DATA_DIR, archivo);
    let raw: Record<string, MaybeObj>;
    try {
      raw = JSON.parse(readFileSync(filePath, "utf-8")) as Record<string, MaybeObj>;
    } catch (err) {
      console.error(`  ✗ No se pudo leer ${archivo}: ${(err as Error).message}`);
      continue;
    }

    for (const [codigo, contenido] of Object.entries(raw)) {
      total++;
      if (isStub(contenido)) {
        console.log(`  ○ STUB: ${codigo} — omitido`);
        stubs++;
        continue;
      }
      const result = await upsertProgresion(sb, codigo, contenido);
      if (result === "notfound") notfound++;
      if (result === "error") errors++;
    }
  }

  const upserted = total - stubs - notfound - errors;
  console.log(`\n✅ ${familia}: ${upserted} upserted | ${stubs} stubs omitidos | ${notfound} no encontrados | ${errors} errores\n`);

  if (errors > 0) process.exitCode = 1;
}

// ── Bootstrap helper ───────────────────────────────────────────────────────

export function createSB(): SB {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("❌ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
    process.exit(1);
  }
  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

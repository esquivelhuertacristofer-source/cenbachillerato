/**
 * Seed planteamiento_progresiones — familia Lengua y Comunicación (LC).
 * Archivos: lc-i.json, lc-ii.json, lc-iii.json
 *
 * Idempotente: ON CONFLICT (progresion_id, version_curricular) DO UPDATE
 * Omite progresiones stub (_TODO en metadata.objective).
 *
 * Uso: npx tsx scripts/seed-planteamiento/seed-planteamiento-lc.ts
 * Prerequisito: migración 08_planteamiento_progresiones.sql aplicada.
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { seedFamilia, createSB, type SB } from "./_lib";

const ARCHIVOS = [
  { archivo: "lc-i.json" },
  { archivo: "lc-ii.json" },
  { archivo: "lc-iii.json" },
];

export async function seedPlanteamientoLC(sb: SB): Promise<void> {
  await seedFamilia(sb, "LC", ARCHIVOS);
}

if (
  process.env.NODE_ENV !== "test" &&
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  config({ path: resolve(process.cwd(), ".env.local") });
  const sb = createSB();
  seedPlanteamientoLC(sb).catch((err: Error) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
}

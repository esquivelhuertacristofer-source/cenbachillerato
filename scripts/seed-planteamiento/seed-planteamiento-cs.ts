/**
 * Seed planteamiento_progresiones — familia Ciencias Sociales (CS).
 * Archivos: cs-i.json, cs-ii.json, cs-iii.json
 *
 * Idempotente: ON CONFLICT (progresion_id, version_curricular) DO UPDATE
 * Omite progresiones stub (_TODO en metadata.objective).
 *
 * Uso: npx tsx scripts/seed-planteamiento/seed-planteamiento-cs.ts
 * Prerequisito: migración 08_planteamiento_progresiones.sql aplicada.
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { seedFamilia, createSB, type SB } from "./_lib";

const ARCHIVOS = [
  { archivo: "cs-i.json" },
  { archivo: "cs-ii.json" },
  { archivo: "cs-iii.json" },
];

export async function seedPlanteamientoCS(sb: SB): Promise<void> {
  await seedFamilia(sb, "CS", ARCHIVOS);
}

if (
  process.env.NODE_ENV !== "test" &&
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  config({ path: resolve(process.cwd(), ".env.local") });
  const sb = createSB();
  seedPlanteamientoCS(sb).catch((err: Error) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
}

/**
 * Seed planteamiento_progresiones — familia Pensamiento Filosófico y Humanidades (PFH).
 * Archivos: pfh-i.json, pfh-ii.json, pfh-iii.json
 *
 * Idempotente: ON CONFLICT (progresion_id, version_curricular) DO UPDATE
 * Omite progresiones stub (_TODO en metadata.objective).
 *
 * Uso: npx tsx scripts/seed-planteamiento/seed-planteamiento-pfh.ts
 * Prerequisito: migración 08_planteamiento_progresiones.sql aplicada.
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { seedFamilia, createSB, type SB } from "./_lib";

const ARCHIVOS = [
  { archivo: "pfh-i.json" },
  { archivo: "pfh-ii.json" },
  { archivo: "pfh-iii.json" },
];

export async function seedPlanteamientoPFH(sb: SB): Promise<void> {
  await seedFamilia(sb, "PFH", ARCHIVOS);
}

if (
  process.env.NODE_ENV !== "test" &&
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  config({ path: resolve(process.cwd(), ".env.local") });
  const sb = createSB();
  seedPlanteamientoPFH(sb).catch((err: Error) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
}

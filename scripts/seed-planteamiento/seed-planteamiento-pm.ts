/**
 * Seed planteamiento_progresiones — familia Pensamiento Matemático (PM).
 * Archivos: pm-i.json … pm-vi.json
 *
 * Idempotente: ON CONFLICT (progresion_id, version_curricular) DO UPDATE
 * Omite progresiones stub (_TODO en metadata.objective).
 *
 * Uso: npx tsx scripts/seed-planteamiento/seed-planteamiento-pm.ts
 * Prerequisito: migración 08_planteamiento_progresiones.sql aplicada.
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { seedFamilia, createSB, type SB } from "./_lib";

const ARCHIVOS = [
  { archivo: "pm-i.json" },
  { archivo: "pm-ii.json" },
  { archivo: "pm-iii.json" },
  { archivo: "pm-iv.json" },
  { archivo: "pm-v.json" },
  { archivo: "pm-vi.json" },
];

export async function seedPlanteamientoPM(sb: SB): Promise<void> {
  await seedFamilia(sb, "PM", ARCHIVOS);
}

if (
  process.env.NODE_ENV !== "test" &&
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  config({ path: resolve(process.cwd(), ".env.local") });
  const sb = createSB();
  seedPlanteamientoPM(sb).catch((err: Error) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
}

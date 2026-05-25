/**
 * Seed planteamiento_progresiones — familia Ciencias Naturales, Experimentales y
 * Tecnología (CNEYT).
 * Archivos: cneyt-i.json … cneyt-vi.json
 *
 * Idempotente: ON CONFLICT (progresion_id, version_curricular) DO UPDATE
 * Omite progresiones stub (_TODO en metadata.objective).
 *
 * Uso: npx tsx scripts/seed-planteamiento/seed-planteamiento-cneyt.ts
 * Prerequisito: migración 08_planteamiento_progresiones.sql aplicada.
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { seedFamilia, createSB, type SB } from "./_lib";

const ARCHIVOS = [
  { archivo: "cneyt-i.json" },
  { archivo: "cneyt-ii.json" },
  { archivo: "cneyt-iii.json" },
  { archivo: "cneyt-iv.json" },
  { archivo: "cneyt-v.json" },
  { archivo: "cneyt-vi.json" },
];

export async function seedPlanteamientoCNEYT(sb: SB): Promise<void> {
  await seedFamilia(sb, "CNEYT", ARCHIVOS);
}

if (
  process.env.NODE_ENV !== "test" &&
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  config({ path: resolve(process.cwd(), ".env.local") });
  const sb = createSB();
  seedPlanteamientoCNEYT(sb).catch((err: Error) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
}

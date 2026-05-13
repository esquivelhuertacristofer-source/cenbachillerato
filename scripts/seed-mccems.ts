/**
 * Seed de datos MCCEMS en Supabase.
 * Uso: npx tsx scripts/seed-mccems.ts
 *
 * Requiere NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local
 * Es idempotente (usa upsert).
 */
import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";
import {
  COMPONENTES_CURRICULARES,
  RECURSOS_SOCIOEMOCIONALES,
  UAC_BASE,
} from "../src/lib/mccems/estructura";
import { RECURSOS_SOCIOCOGNITIVOS } from "../src/lib/mccems/recursos-sociocognitivos";
import { AREAS_CONOCIMIENTO } from "../src/lib/mccems/areas-conocimiento";

type SB = ReturnType<typeof createClient<Database>>;

async function seedComponentes(sb: SB): Promise<Map<string, string>> {
  const rows = COMPONENTES_CURRICULARES.map((c) => ({
    codigo: c.codigo,
    nombre: c.nombre,
    descripcion: c.descripcion ?? null,
    tipo: c.tipo,
  }));

  const { error } = await sb.from("componentes_curriculares").upsert(rows, { onConflict: "codigo" });
  if (error) throw new Error(`Error seeding componentes: ${error.message}`);

  const { data } = await sb.from("componentes_curriculares").select("id, codigo");
  const map = new Map<string, string>();
  data?.forEach((r) => map.set(r.codigo, r.id));
  console.log(`  ✓ ${rows.length} componentes curriculares`);
  return map;
}

async function seedRecursosSC(sb: SB): Promise<Map<string, string>> {
  const rows = RECURSOS_SOCIOCOGNITIVOS.map((r) => ({
    codigo: r.codigo,
    nombre: r.nombre,
    descripcion: r.descripcion ?? null,
    color: r.color ?? null,
    icono: r.icono ?? null,
    orden: r.orden ?? null,
  }));

  const { error } = await sb.from("recursos_sociocognitivos").upsert(rows, { onConflict: "codigo" });
  if (error) throw new Error(`Error seeding recursos_sociocognitivos: ${error.message}`);

  const { data } = await sb.from("recursos_sociocognitivos").select("id, codigo");
  const map = new Map<string, string>();
  data?.forEach((r) => map.set(r.codigo, r.id));
  console.log(`  ✓ ${rows.length} recursos sociocognitivos`);
  return map;
}

async function seedAreas(sb: SB): Promise<Map<string, string>> {
  const rows = AREAS_CONOCIMIENTO.map((a) => ({
    codigo: a.codigo,
    nombre: a.nombre,
    descripcion: a.descripcion ?? null,
    color: a.color ?? null,
    icono: a.icono ?? null,
    orden: a.orden ?? null,
  }));

  const { error } = await sb.from("areas_conocimiento").upsert(rows, { onConflict: "codigo" });
  if (error) throw new Error(`Error seeding areas_conocimiento: ${error.message}`);

  const { data } = await sb.from("areas_conocimiento").select("id, codigo");
  const map = new Map<string, string>();
  data?.forEach((r) => map.set(r.codigo, r.id));
  console.log(`  ✓ ${rows.length} áreas de conocimiento`);
  return map;
}

async function seedRecursosSE(sb: SB) {
  const rows = RECURSOS_SOCIOEMOCIONALES.map((r) => ({
    codigo: r.codigo,
    nombre: r.nombre,
    descripcion: r.descripcion ?? null,
    orden: r.orden ?? null,
  }));

  const { error } = await sb.from("recursos_socioemocionales").upsert(rows, { onConflict: "codigo" });
  if (error) throw new Error(`Error seeding recursos_socioemocionales: ${error.message}`);
  console.log(`  ✓ ${rows.length} recursos socioemocionales`);
}

async function seedUAC(
  sb: SB,
  componenteMap: Map<string, string>,
  recursoMap: Map<string, string>,
  areaMap: Map<string, string>
): Promise<Map<string, string>> {
  const rows = UAC_BASE.map((u) => {
    const componente_id = componenteMap.get(u.componenteCodigo);
    if (!componente_id) throw new Error(`Componente no encontrado: ${u.componenteCodigo}`);

    return {
      codigo: u.codigo,
      nombre: u.nombre,
      descripcion: null,
      semestre: u.semestre,
      componente_id,
      recurso_id: u.recursoCodigo ? (recursoMap.get(u.recursoCodigo) ?? null) : null,
      area_id: u.areaCodigo ? (areaMap.get(u.areaCodigo) ?? null) : null,
      orden: u.orden ?? null,
      total_progresiones: u.totalProgresionesEsperadas,
    };
  });

  const { error } = await sb.from("uac").upsert(rows, { onConflict: "codigo" });
  if (error) throw new Error(`Error seeding uac: ${error.message}`);

  const { data } = await sb.from("uac").select("id, codigo");
  const map = new Map<string, string>();
  data?.forEach((r) => map.set(r.codigo, r.id));
  console.log(`  ✓ ${rows.length} UAC`);
  return map;
}

async function seedProgresiones(sb: SB, uacMap: Map<string, string>) {
  const rows: Array<{
    codigo: string;
    uac_id: string;
    numero: number;
    titulo: string;
    descripcion: string | null;
    meta_aprendizaje: string | null;
  }> = [];

  for (const uac of UAC_BASE) {
    const uac_id = uacMap.get(uac.codigo);
    if (!uac_id) continue;

    for (let n = 1; n <= uac.totalProgresionesEsperadas; n++) {
      rows.push({
        codigo: `${uac.codigo}-P${String(n).padStart(2, "0")}`,
        uac_id,
        numero: n,
        titulo: `Progresión ${n} — ${uac.nombre}`,
        descripcion: null,
        meta_aprendizaje: null,
      });
    }
  }

  const { error } = await sb
    .from("progresiones")
    .upsert(rows, { onConflict: "codigo" });

  if (error) throw new Error(`Error seeding progresiones: ${error.message}`);
  console.log(`  ✓ ${rows.length} progresiones`);
}

export async function runSeedMCCEMS(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed MCCEMS\n");

  console.log("1. Componentes curriculares:");
  const componenteMap = await seedComponentes(sb);

  console.log("\n2. Recursos sociocognitivos:");
  const recursoMap = await seedRecursosSC(sb);

  console.log("\n3. Áreas de conocimiento:");
  const areaMap = await seedAreas(sb);

  console.log("\n4. Recursos socioemocionales:");
  await seedRecursosSE(sb);

  console.log("\n5. UAC (Unidades de Aprendizaje Curricular):");
  const uacMap = await seedUAC(sb, componenteMap, recursoMap, areaMap);

  console.log("\n6. Progresiones de aprendizaje (placeholders):");
  await seedProgresiones(sb, uacMap);

  console.log("\n✅ Seed MCCEMS completado.\n");
}

if (process.env.NODE_ENV !== "test" && process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  config({ path: resolve(process.cwd(), ".env.local") });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("ERROR: Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
    process.exit(1);
  }

  const sb = createClient<Database>(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  runSeedMCCEMS(sb).catch((err) => {
    console.error("\nERROR FATAL:", err);
    process.exit(1);
  });
}

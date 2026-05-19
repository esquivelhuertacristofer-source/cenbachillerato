/**
 * Seed de propósitos formativos oficiales para CS-II (Ciencias Sociales II).
 * Fuente: docs/programas-oficiales/extraidos/06-CIENCIAS-SOCIALES.md
 *         Modelo Educativo 2025
 *
 * Uso: npx tsx scripts/seed-csii.ts
 * Idempotente: upsert por campo "codigo".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

const META = "Comprenda la forma en que las personas participan en la organización social, económica y productiva, analizando el bienestar social, las estructuras de organización y las relaciones de poder que las configuran.";

const PROGRESIONES_CSII = [
  {
    codigo: "CS-II-P01",
    numero: 1,
    titulo: "Analiza los conceptos de bienestar social, desarrollo humano y calidad de vida, y examina las desigualdades en su distribución en México y el mundo.",
    descripcion: "Analiza bienestar social, desarrollo humano y calidad de vida, examinando desigualdades en México y el mundo.",
    descripcion_extendida: "Analiza los conceptos de bienestar social, desarrollo humano y calidad de vida, y examina las desigualdades en su distribución en México y el mundo. Contenidos: bienestar social y desarrollo humano; índices IDH y GINI; satisfacción de necesidades básicas; desigualdad socioeconómica en México; causas estructurales de la pobreza; movilidad social.",
    meta_aprendizaje: META,
    categoria: "Sociedad y economía",
    subcategoria: "Bienestar social y desigualdad",
    ejes_articuladores: ["Pensamiento crítico", "Igualdad de género"],
    transversalidades: ["PM-II", "LC-II"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CS-II-P02",
    numero: 2,
    titulo: "Examina las formas de organización social —familia, comunidad, asociaciones civiles, movimientos sociales— y su papel en la construcción del tejido social.",
    descripcion: "Examina las formas de organización social y su papel en la construcción del tejido social.",
    descripcion_extendida: "Examina las formas de organización social —familia, comunidad, asociaciones civiles, movimientos sociales— y su papel en la construcción del tejido social. Contenidos: organización social; formas de asociación comunitaria; sociedad civil y OSC; movimientos sociales: historia, tipos e impacto (derechos laborales, feminismo, ambientalismo).",
    meta_aprendizaje: META,
    categoria: "Organización social",
    subcategoria: "Tejido social",
    ejes_articuladores: ["Pensamiento crítico", "Interculturalidad crítica"],
    transversalidades: ["LC-II"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CS-II-P03",
    numero: 3,
    titulo: "Estudia los procesos de producción, distribución y consumo desde una perspectiva crítica, vinculando economía formal e informal, y trabajo remunerado y no remunerado.",
    descripcion: "Estudia los procesos de producción, distribución y consumo desde una perspectiva crítica.",
    descripcion_extendida: "Estudia los procesos de producción, distribución y consumo desde una perspectiva crítica, vinculando economía formal e informal, y trabajo remunerado y no remunerado. Contenidos: sectores económicos; economía informal; división sexual del trabajo; trabajo remunerado y no remunerado; cadenas productivas.",
    meta_aprendizaje: META,
    categoria: "Economía y trabajo",
    subcategoria: "Producción y distribución",
    ejes_articuladores: ["Pensamiento crítico", "Igualdad de género"],
    transversalidades: ["PM-II"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CS-II-P04",
    numero: 4,
    titulo: "Analiza las relaciones de poder en la sociedad —clase, género, etnia, edad— y cómo estas estructuran el acceso a recursos y oportunidades.",
    descripcion: "Analiza las relaciones de poder en la sociedad y cómo estructuran el acceso a recursos y oportunidades.",
    descripcion_extendida: "Analiza las relaciones de poder en la sociedad —clase, género, etnia, edad— y cómo estas estructuran el acceso a recursos y oportunidades. Contenidos: patriarcado; racismo; clasismo; interseccionalidad; discriminación estructural; acceso diferenciado a recursos y oportunidades.",
    meta_aprendizaje: META,
    categoria: "Poder y sociedad",
    subcategoria: "Relaciones de poder",
    ejes_articuladores: ["Pensamiento crítico", "Igualdad de género", "Interculturalidad crítica"],
    transversalidades: ["PFH-II", "LC-II"],
    tiempo_estimado_horas: 3,
  },
] as const;

export async function seedCSII(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed CS-II (propósitos oficiales 2025)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac").select("id").eq("codigo", "CS-II").single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC CS-II no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const rows = PROGRESIONES_CSII.map((p) => ({
    codigo: p.codigo,
    uac_id: uacRow.id,
    numero: p.numero,
    titulo: p.titulo,
    descripcion: p.descripcion,
    meta_aprendizaje: p.meta_aprendizaje,
    categoria: p.categoria,
    subcategoria: p.subcategoria,
    descripcion_extendida: p.descripcion_extendida,
    ejes_articuladores: p.ejes_articuladores as unknown as string[],
    transversalidades: p.transversalidades as unknown as string[],
    tiempo_estimado_horas: p.tiempo_estimado_horas,
    es_placeholder: false,
  }));

  const { error } = await sb.from("progresiones").upsert(rows, { onConflict: "codigo" });
  if (error) throw new Error(`Error seeding CS-II: ${error.message}`);
  console.log(`  ✓ ${rows.length} propósitos formativos de CS-II (es_placeholder=false)`);
  console.log("\n✅ Seed CS-II completado.\n");
}

if (
  process.env.NODE_ENV !== "test" &&
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  config({ path: resolve(process.cwd(), ".env.local") });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) { console.error("Faltan variables de entorno"); process.exit(1); }
  const sb = createClient<Database>(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  seedCSII(sb).catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
}

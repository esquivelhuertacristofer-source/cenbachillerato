/**
 * Seed de propósitos formativos oficiales para CS-I (Ciencias Sociales I).
 * Fuente: docs/programas-oficiales/extraidos/06-CIENCIAS-SOCIALES.md
 *         PDF: vf_MCC_CIENCIAS SOCIALES_BN.pdf — Modelo Educativo 2025
 *
 * Uso: npx tsx scripts/seed-csi.ts
 * Idempotente: upsert por campo "codigo".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

const META = "Problematice la ciudadanía como un derecho y una práctica social, analizando el Estado, las normas sociales y la diversidad como dimensiones constitutivas del espacio democrático.";

const PROGRESIONES_CSI = [
  {
    codigo: "CS-I-P01",
    numero: 1,
    titulo: "Examina la noción de Estado, sus funciones, instituciones y la relación entre Estado y ciudadanía en el contexto mexicano.",
    descripcion: "Examina la noción de Estado, sus funciones, instituciones y la relación entre Estado y ciudadanía en el contexto mexicano.",
    descripcion_extendida: "Examina la noción de Estado, sus funciones, instituciones y la relación entre Estado y ciudadanía en el contexto mexicano. Contenidos: Estado: origen, funciones, formas de gobierno; Estado mexicano y su estructura; democracia representativa, participativa y deliberativa.",
    meta_aprendizaje: META,
    categoria: "Estado y ciudadanía",
    subcategoria: "El Estado mexicano",
    ejes_articuladores: ["Ciudadanía", "Pensamiento crítico"],
    transversalidades: ["PFH-I", "LC-I"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CS-I-P02",
    numero: 2,
    titulo: "Analiza la ciudadanía como derecho histórico y práctica social, reconociendo su dimensión formal y sus brechas reales.",
    descripcion: "Analiza la ciudadanía como derecho histórico y práctica social, reconociendo su dimensión formal y sus brechas reales.",
    descripcion_extendida: "Analiza la ciudadanía como derecho histórico y práctica social, reconociendo su dimensión formal y sus brechas reales. Contenidos: ciudadanía: derechos civiles, políticos y sociales; ciudadanía formal vs. ciudadanía sustantiva; derechos humanos: fundamentos y generaciones.",
    meta_aprendizaje: META,
    categoria: "Estado y ciudadanía",
    subcategoria: "Ciudadanía y derechos",
    ejes_articuladores: ["Ciudadanía", "Pensamiento crítico", "Igualdad de género"],
    transversalidades: ["PFH-I", "LC-I"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CS-I-P03",
    numero: 3,
    titulo: "Problematiza las normas sociales e instituciones como construcciones históricas sujetas a cambio y disputa.",
    descripcion: "Problematiza las normas sociales e instituciones como construcciones históricas sujetas a cambio y disputa.",
    descripcion_extendida: "Problematiza las normas sociales e instituciones como construcciones históricas sujetas a cambio y disputa. Contenidos: normas sociales: costumbre, moral y derecho; legitimidad e instituciones.",
    meta_aprendizaje: META,
    categoria: "Sociedad y normas",
    subcategoria: "Normas e instituciones sociales",
    ejes_articuladores: ["Pensamiento crítico", "Ciudadanía"],
    transversalidades: ["PFH-I"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CS-I-P04",
    numero: 4,
    titulo: "Discute y reconoce que la diversidad —étnica, cultural, de género, de orientación sexual, de capacidad— forma parte del espacio democrático y es condición de justicia.",
    descripcion: "Discute y reconoce que la diversidad —étnica, cultural, de género, de orientación sexual, de capacidad— forma parte del espacio democrático y es condición de justicia.",
    descripcion_extendida: "Discute y reconoce que la diversidad —étnica, cultural, de género, de orientación sexual, de capacidad— forma parte del espacio democrático y es condición de justicia. Contenidos: diversidad e inclusión: identidades sociales, derechos de minorías, discriminación y justicia.",
    meta_aprendizaje: META,
    categoria: "Sociedad y normas",
    subcategoria: "Diversidad y democracia",
    ejes_articuladores: ["Ciudadanía", "Interculturalidad crítica", "Igualdad de género", "Inclusión"],
    transversalidades: ["PFH-I", "LC-I"],
    tiempo_estimado_horas: 3,
  },
] as const;

export async function seedCSI(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed CS-I (propósitos oficiales 2025)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac").select("id").eq("codigo", "CS-I").single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC CS-I no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const rows = PROGRESIONES_CSI.map((p) => ({
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
  if (error) throw new Error(`Error seeding CS-I: ${error.message}`);
  console.log(`  ✓ ${rows.length} propósitos formativos de CS-I (es_placeholder=false)`);
  console.log("\n✅ Seed CS-I completado.\n");
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
  seedCSI(sb).catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
}

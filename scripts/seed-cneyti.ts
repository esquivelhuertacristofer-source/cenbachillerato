/**
 * Seed de propósitos formativos oficiales para CNEYT-I (Ciencias Naturales, Experimentales y Tecnología I).
 * Fuente: docs/programas-oficiales/extraidos/03-CIENCIAS-NATURALES.md
 *         PDF: 2025_MCC_CIENCIAS NATURALES_BN.pdf — Modelo Educativo 2025
 *
 * Uso: npx tsx scripts/seed-cneyti.ts
 * Idempotente: upsert por campo "codigo".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

const META = "Comprenda el carácter creativo, social y colectivo de las ciencias al explorar la naturaleza de la materia, sus propiedades y sus transformaciones físicas en contextos cotidianos y relevantes.";

const PROGRESIONES_CNEYTI = [
  {
    codigo: "CNEYT-I-P01",
    numero: 1,
    titulo: "Reconoce a las ciencias como práctica social, histórica y colectiva influida por contextos culturales.",
    descripcion: "Reconoce a las ciencias como práctica social, histórica y colectiva influida por contextos culturales.",
    descripcion_extendida: "Reconoce a las ciencias como práctica social, histórica y colectiva influida por contextos culturales. Contenidos: naturaleza de las ciencias: historia, sociología y epistemología de la ciencia; ciencia como práctica social y colectiva.",
    meta_aprendizaje: META,
    categoria: "Naturaleza de la ciencia",
    subcategoria: "Ciencia como práctica social",
    ejes_articuladores: ["Pensamiento crítico", "Interculturalidad crítica"],
    transversalidades: ["LC-I", "CS-I"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-I-P02",
    numero: 2,
    titulo: "Distingue la materia y sus propiedades físicas y químicas generales.",
    descripcion: "Distingue la materia y sus propiedades físicas y químicas generales.",
    descripcion_extendida: "Distingue la materia y sus propiedades físicas y químicas generales. Contenidos: propiedades de la materia: densidad, solubilidad, punto de fusión/ebullición; propiedades físicas y químicas.",
    meta_aprendizaje: META,
    categoria: "Materia y sus propiedades",
    subcategoria: "Propiedades físicas y químicas",
    ejes_articuladores: ["Pensamiento crítico"],
    transversalidades: ["PM-I"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-I-P03",
    numero: 3,
    titulo: "Describe la estructura básica del átomo y su relevancia para entender la naturaleza de la materia.",
    descripcion: "Describe la estructura básica del átomo y su relevancia para entender la naturaleza de la materia.",
    descripcion_extendida: "Describe la estructura básica del átomo y su relevancia para entender la naturaleza de la materia. Contenidos: estructura atómica: modelos atómicos (Dalton → Bohr → cuántico simplificado); protones, neutrones y electrones.",
    meta_aprendizaje: META,
    categoria: "Materia y sus propiedades",
    subcategoria: "Estructura atómica",
    ejes_articuladores: ["Pensamiento crítico"],
    transversalidades: ["PM-I"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-I-P04",
    numero: 4,
    titulo: "Clasifica la materia en sustancias puras y mezclas, y aplica métodos de separación.",
    descripcion: "Clasifica la materia en sustancias puras y mezclas, y aplica métodos de separación.",
    descripcion_extendida: "Clasifica la materia en sustancias puras y mezclas, y aplica métodos de separación. Contenidos: sustancias puras y mezclas; mezclas homogéneas y heterogéneas; métodos de separación: filtración, destilación, decantación, cristalización.",
    meta_aprendizaje: META,
    categoria: "Materia y sus propiedades",
    subcategoria: "Sustancias y mezclas",
    ejes_articuladores: ["Pensamiento crítico"],
    transversalidades: ["PM-I"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-I-P05",
    numero: 5,
    titulo: "Explica los estados de agregación de la materia y sus cambios en función de temperatura y presión.",
    descripcion: "Explica los estados de agregación de la materia y sus cambios en función de temperatura y presión.",
    descripcion_extendida: "Explica los estados de agregación de la materia y sus cambios en función de temperatura y presión. Contenidos: estados de agregación: sólido, líquido y gaseoso; cambios de estado: fusión, solidificación, evaporación, condensación, sublimación.",
    meta_aprendizaje: META,
    categoria: "Materia y sus propiedades",
    subcategoria: "Estados de la materia",
    ejes_articuladores: ["Pensamiento crítico"],
    transversalidades: ["PM-I"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-I-P06",
    numero: 6,
    titulo: "Aplica el método científico en observaciones y pequeñas investigaciones del entorno.",
    descripcion: "Aplica el método científico en observaciones y pequeñas investigaciones del entorno.",
    descripcion_extendida: "Aplica el método científico en observaciones y pequeñas investigaciones del entorno. Contenidos: método científico y diseño experimental básico: observación, hipótesis, experimentación, análisis y conclusión.",
    meta_aprendizaje: META,
    categoria: "Naturaleza de la ciencia",
    subcategoria: "Método científico",
    ejes_articuladores: ["Pensamiento crítico"],
    transversalidades: ["PM-I", "LC-I"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-I-P07",
    numero: 7,
    titulo: "Valora el papel de las mujeres y grupos históricamente marginados en el desarrollo científico.",
    descripcion: "Valora el papel de las mujeres y grupos históricamente marginados en el desarrollo científico.",
    descripcion_extendida: "Valora el papel de las mujeres y grupos históricamente marginados en el desarrollo científico. Contenidos: historia de la ciencia con perspectiva de género e interculturalidad; aportaciones de científicas y de comunidades indígenas al conocimiento.",
    meta_aprendizaje: META,
    categoria: "Naturaleza de la ciencia",
    subcategoria: "Ciencia, género e inclusión",
    ejes_articuladores: ["Igualdad de género", "Interculturalidad crítica", "Inclusión"],
    transversalidades: ["CS-I", "PFH-I"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-I-P08",
    numero: 8,
    titulo: "Relaciona los conceptos de materia y sus transformaciones con problemas ambientales locales y globales.",
    descripcion: "Relaciona los conceptos de materia y sus transformaciones con problemas ambientales locales y globales.",
    descripcion_extendida: "Relaciona los conceptos de materia y sus transformaciones con problemas ambientales locales y globales. Contenidos: transformaciones de la materia y su impacto ambiental; contaminación, residuos y cambio climático; sustentabilidad desde la perspectiva de las ciencias.",
    meta_aprendizaje: META,
    categoria: "Ciencia y sociedad",
    subcategoria: "Ciencia y medio ambiente",
    ejes_articuladores: ["Pensamiento crítico", "Ciudadanía"],
    transversalidades: ["CS-I", "CD-I"],
    tiempo_estimado_horas: 3,
  },
] as const;

export async function seedCNEYTI(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed CNEYT-I (propósitos oficiales 2025)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac").select("id").eq("codigo", "CNEYT-I").single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC CNEYT-I no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const rows = PROGRESIONES_CNEYTI.map((p) => ({
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
  if (error) throw new Error(`Error seeding CNEYT-I: ${error.message}`);
  console.log(`  ✓ ${rows.length} propósitos formativos de CNEYT-I (es_placeholder=false)`);
  console.log("\n✅ Seed CNEYT-I completado.\n");
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
  seedCNEYTI(sb).catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
}

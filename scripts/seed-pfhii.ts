/**
 * Seed de propósitos formativos oficiales para PFH-II (Pensamiento Filosófico y Humanidades II).
 * Fuente: docs/programas-oficiales/extraidos/04-PENSAMIENTO-FILOSOFICO.md
 *         Modelo Educativo 2025
 *
 * Uso: npx tsx scripts/seed-pfhii.ts
 * Idempotente: upsert por campo "codigo".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

const META = "Desarrolle la capacidad de problematizar el conocimiento y la realidad desde categorías filosóficas —ontológicas, éticas y epistemológicas— con perspectiva de género y humanismo mexicano.";

const PROGRESIONES_PFHII = [
  {
    codigo: "PFH-II-P01",
    numero: 1,
    titulo: "Examina preguntas ontológicas sobre el ser, la existencia y la realidad desde diversas tradiciones filosóficas.",
    descripcion: "Examina preguntas ontológicas sobre el ser, la existencia y la realidad desde diversas tradiciones filosóficas.",
    descripcion_extendida: "Examina preguntas ontológicas sobre el ser, la existencia y la realidad desde diversas tradiciones filosóficas. Contenidos: ontología: el problema del ser; realismo, idealismo y materialismo; preguntas filosóficas fundamentales; tradiciones filosóficas occidentales y no occidentales.",
    meta_aprendizaje: META,
    categoria: "Ontología",
    subcategoria: "El ser y la realidad",
    ejes_articuladores: ["Pensamiento crítico", "Interculturalidad crítica"],
    transversalidades: ["LC-II"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PFH-II-P02",
    numero: 2,
    titulo: "Analiza los fundamentos éticos de la acción humana, reconociendo la diversidad de enfoques: deontológico, consecuencialista, de la virtud y del cuidado.",
    descripcion: "Analiza los fundamentos éticos de la acción humana desde diversas corrientes filosóficas.",
    descripcion_extendida: "Analiza los fundamentos éticos de la acción humana, reconociendo la diversidad de enfoques: deontológico, consecuencialista, de la virtud y del cuidado. Contenidos: ética: fundamentos y corrientes; dilemas morales aplicados; Kant, Aristóteles, Mill, Gilligan; ética aplicada a situaciones cotidianas.",
    meta_aprendizaje: META,
    categoria: "Ética",
    subcategoria: "Fundamentos éticos",
    ejes_articuladores: ["Pensamiento crítico", "Igualdad de género"],
    transversalidades: ["CS-II"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PFH-II-P03",
    numero: 3,
    titulo: "Reflexiona sobre dilemas bioéticos contemporáneos —uso de tecnologías, medio ambiente, salud, derechos del cuerpo— desde marcos filosóficos críticos.",
    descripcion: "Reflexiona sobre dilemas bioéticos contemporáneos desde marcos filosóficos críticos.",
    descripcion_extendida: "Reflexiona sobre dilemas bioéticos contemporáneos —uso de tecnologías, medio ambiente, salud, derechos del cuerpo— desde marcos filosóficos críticos. Contenidos: bioética: eutanasia, aborto, ingeniería genética, ecología; derechos del cuerpo; tecnología y ética; perspectiva de género en la bioética.",
    meta_aprendizaje: META,
    categoria: "Bioética",
    subcategoria: "Dilemas bioéticos contemporáneos",
    ejes_articuladores: ["Pensamiento crítico", "Vida saludable"],
    transversalidades: ["CNEYT-II", "CS-II"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PFH-II-P04",
    numero: 4,
    titulo: "Incorpora la perspectiva de género al análisis filosófico, cuestionando sesgos históricos en la producción del conocimiento y la ética.",
    descripcion: "Incorpora la perspectiva de género al análisis filosófico, cuestionando sesgos históricos.",
    descripcion_extendida: "Incorpora la perspectiva de género al análisis filosófico, cuestionando sesgos históricos en la producción del conocimiento y la ética. Contenidos: filosofía feminista y perspectiva de género; epistemología crítica: ¿cómo sabemos lo que sabemos?; sesgos androcéntricos en la filosofía; Simone de Beauvoir, bell hooks, Graciela Hierro.",
    meta_aprendizaje: META,
    categoria: "Filosofía y género",
    subcategoria: "Perspectiva de género",
    ejes_articuladores: ["Pensamiento crítico", "Igualdad de género", "Interculturalidad crítica"],
    transversalidades: ["CS-II", "LC-II"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PFH-II-P05",
    numero: 5,
    titulo: "Reconoce el humanismo mexicano —en sus vertientes indígena, novohispana y moderna— como tradición filosófica propia y vigente.",
    descripcion: "Reconoce el humanismo mexicano como tradición filosófica propia y vigente.",
    descripcion_extendida: "Reconoce el humanismo mexicano —en sus vertientes indígena, novohispana y moderna— como tradición filosófica propia y vigente. Contenidos: humanismo mexicano; José Vasconcelos, Alfonso Reyes, Leopoldo Zea; Filosofía de la liberación; pensamiento filosófico indígena; tradición novohispana; vigencia del humanismo mexicano.",
    meta_aprendizaje: META,
    categoria: "Humanismo mexicano",
    subcategoria: "Tradición filosófica propia",
    ejes_articuladores: ["Pensamiento crítico", "Interculturalidad crítica"],
    transversalidades: ["CS-II"],
    tiempo_estimado_horas: 3,
  },
] as const;

export async function seedPFHII(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed PFH-II (propósitos oficiales 2025)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac").select("id").eq("codigo", "PFH-II").single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC PFH-II no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const rows = PROGRESIONES_PFHII.map((p) => ({
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
  if (error) throw new Error(`Error seeding PFH-II: ${error.message}`);
  console.log(`  ✓ ${rows.length} propósitos formativos de PFH-II (es_placeholder=false)`);
  console.log("\n✅ Seed PFH-II completado.\n");
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
  seedPFHII(sb).catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
}

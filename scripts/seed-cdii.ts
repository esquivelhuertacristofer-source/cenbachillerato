/**
 * Seed de propósitos formativos oficiales para CD-II (Cultura Digital II).
 * Fuente: docs/programas-oficiales/extraidos/02-CULTURA-DIGITAL.md
 *         Modelo Educativo 2025
 *
 * Uso: npx tsx scripts/seed-cdii.ts
 * Idempotente: upsert por campo "codigo".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

const META = "Interactúe con las TICCAD de forma colaborativa y crítica para investigar, producir y comunicar conocimiento relevante para su comunidad.";

const PROGRESIONES_CDII = [
  {
    codigo: "CD-II-P01",
    numero: 1,
    titulo: "Aplica estrategias de búsqueda, evaluación y organización de información en entornos digitales.",
    descripcion: "Aplica estrategias de búsqueda, evaluación y organización de información en entornos digitales.",
    descripcion_extendida: "Aplica estrategias de búsqueda, evaluación y organización de información en entornos digitales. Contenidos: estrategias de búsqueda avanzada; evaluación de fuentes digitales (confiabilidad, autoridad, actualidad); organización de información; gestores de referencias.",
    meta_aprendizaje: META,
    categoria: "Información digital",
    subcategoria: "Búsqueda y evaluación",
    ejes_articuladores: ["Pensamiento crítico", "Vida saludable"],
    transversalidades: ["LC-II", "CS-II"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CD-II-P02",
    numero: 2,
    titulo: "Utiliza herramientas digitales colaborativas para el trabajo en equipo y la producción colectiva de conocimiento.",
    descripcion: "Utiliza herramientas digitales colaborativas para el trabajo en equipo y la producción colectiva de conocimiento.",
    descripcion_extendida: "Utiliza herramientas digitales colaborativas para el trabajo en equipo y la producción colectiva de conocimiento. Contenidos: herramientas colaborativas (documentos compartidos, pizarras digitales, plataformas educativas); comunicación asincrónica y sincrónica; producción colectiva.",
    meta_aprendizaje: META,
    categoria: "Colaboración digital",
    subcategoria: "Herramientas colaborativas",
    ejes_articuladores: ["Pensamiento crítico"],
    transversalidades: ["LC-II"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CD-II-P03",
    numero: 3,
    titulo: "Desarrolla investigaciones utilizando fuentes digitales confiables y metodologías de verificación de información.",
    descripcion: "Desarrolla investigaciones utilizando fuentes digitales confiables y metodologías de verificación de información.",
    descripcion_extendida: "Desarrolla investigaciones utilizando fuentes digitales confiables y metodologías de verificación de información. Contenidos: fact-checking; lateral reading; identificación de desinformación y fake news; criterios de confiabilidad de fuentes digitales.",
    meta_aprendizaje: META,
    categoria: "Información digital",
    subcategoria: "Verificación de información",
    ejes_articuladores: ["Pensamiento crítico"],
    transversalidades: ["LC-II", "CS-II"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CD-II-P04",
    numero: 4,
    titulo: "Emplea software estadístico básico para la representación y análisis de datos relevantes para su comunidad.",
    descripcion: "Emplea software estadístico básico para la representación y análisis de datos relevantes para su comunidad.",
    descripcion_extendida: "Emplea software estadístico básico para la representación y análisis de datos relevantes para su comunidad. Contenidos: hojas de cálculo; tipos de gráficas; representación gráfica de datos; análisis básico: promedio, mediana, moda; interpretación de resultados.",
    meta_aprendizaje: META,
    categoria: "Datos digitales",
    subcategoria: "Análisis estadístico básico",
    ejes_articuladores: ["Pensamiento crítico", "Vida saludable"],
    transversalidades: ["PM-II", "CS-II"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CD-II-P05",
    numero: 5,
    titulo: "Crea y difunde contenidos digitales éticos, creativos y con perspectiva crítica en plataformas colaborativas.",
    descripcion: "Crea y difunde contenidos digitales éticos, creativos y con perspectiva crítica en plataformas colaborativas.",
    descripcion_extendida: "Crea y difunde contenidos digitales éticos, creativos y con perspectiva crítica en plataformas colaborativas. Contenidos: producción de contenido digital (blog, infografía, video, podcast); ética en la producción: propiedad intelectual, licencias Creative Commons, créditos; perspectiva crítica en la comunicación digital.",
    meta_aprendizaje: META,
    categoria: "Producción digital",
    subcategoria: "Contenido ético y creativo",
    ejes_articuladores: ["Pensamiento crítico", "Vida saludable"],
    transversalidades: ["LC-II"],
    tiempo_estimado_horas: 3,
  },
] as const;

export async function seedCDII(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed CD-II (propósitos oficiales 2025)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac").select("id").eq("codigo", "CD-II").single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC CD-II no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const rows = PROGRESIONES_CDII.map((p) => ({
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
  if (error) throw new Error(`Error seeding CD-II: ${error.message}`);
  console.log(`  ✓ ${rows.length} propósitos formativos de CD-II (es_placeholder=false)`);
  console.log("\n✅ Seed CD-II completado.\n");
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
  seedCDII(sb).catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
}

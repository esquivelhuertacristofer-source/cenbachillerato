/**
 * Seed de propósitos formativos oficiales para CNEYT-III (Ciencias Naturales, Experimentales y Tecnología III).
 * Fuente: docs/programas-oficiales/extraidos/03-CIENCIAS-NATURALES.md
 *         PDF: 2025_MCC_CIENCIAS NATURALES_BN.pdf — Modelo Educativo 2025
 *
 * Uso: npx tsx scripts/seed-cneytiii.ts
 * Idempotente: upsert por campo "codigo".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

const META = "Construya explicaciones sobre fenómenos que ocurren en el sistema terrestre, reconociendo la interacción entre los subsistemas biótico y abiótico, y analizando el impacto de la actividad humana en el equilibrio ambiental.";

const PROGRESIONES_CNEYTIII = [
  {
    codigo: "CNEYT-III-P01",
    numero: 1,
    titulo: "Describe los componentes y características de los principales biomas y ecosistemas del planeta.",
    descripcion: "Describe los principales biomas y ecosistemas del planeta y sus características.",
    descripcion_extendida: "Describe los componentes y características de los principales biomas y ecosistemas del planeta. Contenidos: biomas terrestres (bosque tropical, bosque templado, desierto, pradera, tundra, taiga) y acuáticos (océano, lago, río, manglar, arrecife de coral); biodiversidad de México; componentes bióticos y abióticos.",
    meta_aprendizaje: META,
    categoria: "Ecología",
    subcategoria: "Biomas y ecosistemas",
    ejes_articuladores: ["Pensamiento matemático y científico", "Sustentabilidad"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-III-P02",
    numero: 2,
    titulo: "Explica el flujo de energía y el ciclo de materia en los ecosistemas (cadenas y redes tróficas).",
    descripcion: "Explica el flujo de energía y el ciclo de materia en ecosistemas mediante cadenas y redes tróficas.",
    descripcion_extendida: "Explica el flujo de energía y el ciclo de materia en los ecosistemas (cadenas y redes tróficas). Contenidos: niveles tróficos: productores, consumidores primarios/secundarios/terciarios, descomponedores; pirámides de energía, biomasa y número; eficiencia ecológica del 10%; redes tróficas y su complejidad.",
    meta_aprendizaje: META,
    categoria: "Ecología",
    subcategoria: "Flujo de energía y redes tróficas",
    ejes_articuladores: ["Pensamiento matemático y científico", "Sustentabilidad"],
    transversalidades: ["PM-III"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-III-P03",
    numero: 3,
    titulo: "Analiza la fotosíntesis como proceso fundamental de transformación de energía en los ecosistemas.",
    descripcion: "Analiza la fotosíntesis como proceso de transformación de energía en los ecosistemas.",
    descripcion_extendida: "Analiza la fotosíntesis como proceso fundamental de transformación de energía en los ecosistemas. Contenidos: reactivos y productos de la fotosíntesis; tipos de fotosíntesis (C3, C4, CAM) y su adaptación a diferentes climas; luz como energía; relación entre fotosíntesis y respiración celular; importancia ecológica y agrícola.",
    meta_aprendizaje: META,
    categoria: "Biología",
    subcategoria: "Fotosíntesis",
    ejes_articuladores: ["Pensamiento matemático y científico"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-III-P04",
    numero: 4,
    titulo: "Examina los ciclos biogeoquímicos del agua, carbono, nitrógeno y fósforo.",
    descripcion: "Examina los ciclos biogeoquímicos del agua, carbono, nitrógeno y fósforo.",
    descripcion_extendida: "Examina los ciclos biogeoquímicos del agua, carbono, nitrógeno y fósforo. Contenidos: ciclo hidrológico: evaporación, transpiración, condensación, precipitación; ciclo del carbono: fijación, respiración, combustión; ciclo del nitrógeno: fijación, nitrificación, desnitrificación; ciclo del fósforo; impacto humano en los ciclos (fertilizantes, combustibles fósiles).",
    meta_aprendizaje: META,
    categoria: "Ecología",
    subcategoria: "Ciclos biogeoquímicos",
    ejes_articuladores: ["Pensamiento matemático y científico", "Sustentabilidad"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-III-P05",
    numero: 5,
    titulo: "Reconoce los subsistemas terrestres (atmósfera, hidrosfera, litosfera, biosfera) y sus interacciones.",
    descripcion: "Reconoce los subsistemas terrestres y analiza sus interacciones.",
    descripcion_extendida: "Reconoce los subsistemas terrestres (atmósfera, hidrosfera, litosfera, biosfera) y sus interacciones. Contenidos: características de cada subsistema; interacciones: ciclos del agua, erosión, vulcanismo, movimiento de placas tectónicas, influencia del clima en la biodiversidad; el sistema terrestre como un todo integrado.",
    meta_aprendizaje: META,
    categoria: "Ciencias de la Tierra",
    subcategoria: "Subsistemas terrestres",
    ejes_articuladores: ["Pensamiento matemático y científico", "Sustentabilidad"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-III-P06",
    numero: 6,
    titulo: "Investiga el deterioro ambiental en sus escalas local, regional y global (contaminación, deforestación, cambio climático).",
    descripcion: "Investiga el deterioro ambiental en escalas local, regional y global.",
    descripcion_extendida: "Investiga el deterioro ambiental en sus escalas local, regional y global (contaminación, deforestación, cambio climático). Contenidos: contaminación del agua, aire y suelo; deforestación y pérdida de biodiversidad; cambio climático: causas, evidencias y consecuencias; huella ecológica; casos en México; uso de evidencia científica para argumentar.",
    meta_aprendizaje: META,
    categoria: "Ambiente y sustentabilidad",
    subcategoria: "Deterioro ambiental",
    ejes_articuladores: ["Sustentabilidad", "Pensamiento crítico"],
    transversalidades: ["CS-III", "LC-III"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-III-P07",
    numero: 7,
    titulo: "Analiza políticas y estrategias de conservación y restauración de ecosistemas en México.",
    descripcion: "Analiza políticas y estrategias de conservación y restauración de ecosistemas en México.",
    descripcion_extendida: "Analiza políticas y estrategias de conservación y restauración de ecosistemas en México. Contenidos: áreas naturales protegidas (ANP) en México; legislación ambiental: LGEEPA, NOM-059; Convenio de Biodiversidad Biológica; estrategias de restauración ecológica; papel de las comunidades indígenas en la conservación.",
    meta_aprendizaje: META,
    categoria: "Ambiente y sustentabilidad",
    subcategoria: "Conservación y políticas ambientales",
    ejes_articuladores: ["Sustentabilidad", "Vida democrática y ciudadanía"],
    transversalidades: ["CS-III"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-III-P08",
    numero: 8,
    titulo: "Propone acciones locales fundamentadas en evidencia para la conservación del ambiente.",
    descripcion: "Propone acciones locales fundamentadas en evidencia científica para conservar el ambiente.",
    descripcion_extendida: "Propone acciones locales fundamentadas en evidencia para la conservación del ambiente. Contenidos: investigación acción participativa en temas ambientales; diseño de propuestas: diagnóstico, objetivos, acciones y evaluación; comunicación de resultados a la comunidad; vinculación con la agenda 2030 y los ODS; el papel del ciudadano en la sustentabilidad.",
    meta_aprendizaje: META,
    categoria: "Proyecto científico",
    subcategoria: "Acción ambiental local",
    ejes_articuladores: ["Sustentabilidad", "Pensamiento crítico"],
    transversalidades: ["LC-III"],
    tiempo_estimado_horas: 3,
  },
] as const;

export async function seedCNEYTIII(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed CNEYT-III (propósitos oficiales 2025)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac").select("id").eq("codigo", "CNEYT-III").single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC CNEYT-III no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const rows = PROGRESIONES_CNEYTIII.map((p) => ({
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
  if (error) throw new Error(`Error seeding CNEYT-III: ${error.message}`);
  console.log(`  ✓ ${rows.length} propósitos formativos de CNEYT-III (es_placeholder=false)`);
  console.log("\n✅ Seed CNEYT-III completado: 8 propósitos oficiales insertados.\n");
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
  seedCNEYTIII(sb).catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
}

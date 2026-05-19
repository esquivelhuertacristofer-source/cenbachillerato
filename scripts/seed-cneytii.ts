/**
 * Seed de propósitos formativos oficiales para CNEYT-II (CNEyT II).
 * Fuente: docs/programas-oficiales/extraidos/03-CIENCIAS-NATURALES.md
 *         Modelo Educativo 2025
 *
 * Uso: npx tsx scripts/seed-cneytii.ts
 * Idempotente: upsert por campo "codigo".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

const META = "Comprenda la importancia de la energía en los procesos naturales y tecnológicos, analizando sus formas, transformaciones y la relación entre calor, trabajo y temperatura en sistemas cotidianos.";

const PROGRESIONES_CNEYTII = [
  {
    codigo: "CNEYT-II-P01",
    numero: 1,
    titulo: "Define energía y reconoce sus diversas formas: cinética, potencial, térmica, luminosa y eléctrica.",
    descripcion: "Define energía y reconoce sus diversas formas: cinética, potencial, térmica, luminosa y eléctrica.",
    descripcion_extendida: "Define energía y reconoce sus diversas formas: cinética, potencial, térmica, luminosa y eléctrica. Contenidos: concepto de energía; formas de energía; ejemplos cotidianos de cada forma; diferencias y relaciones entre tipos de energía; principio de conservación introductorio.",
    meta_aprendizaje: META,
    categoria: "Energía",
    subcategoria: "Formas de energía",
    ejes_articuladores: ["Pensamiento científico", "Vida saludable"],
    transversalidades: ["PM-II"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-II-P02",
    numero: 2,
    titulo: "Analiza la transformación y conservación de la energía en sistemas físicos.",
    descripcion: "Analiza la transformación y conservación de la energía en sistemas físicos.",
    descripcion_extendida: "Analiza la transformación y conservación de la energía en sistemas físicos. Contenidos: principio de conservación de la energía; transformaciones energéticas: cadenas y diagramas; eficiencia energética; ejemplos: paneles solares, generadores, motores.",
    meta_aprendizaje: META,
    categoria: "Energía",
    subcategoria: "Transformación y conservación",
    ejes_articuladores: ["Pensamiento científico", "Vida saludable"],
    transversalidades: ["PM-II"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-II-P03",
    numero: 3,
    titulo: "Explica los principios básicos de la termodinámica aplicados a fenómenos cotidianos.",
    descripcion: "Explica los principios básicos de la termodinámica aplicados a fenómenos cotidianos.",
    descripcion_extendida: "Explica los principios básicos de la termodinámica aplicados a fenómenos cotidianos. Contenidos: termodinámica básica: 1ª y 2ª ley (nivel introductorio); sistemas abiertos y cerrados; entropía conceptual; aplicaciones: refrigeración, motores de combustión, sistemas biológicos.",
    meta_aprendizaje: META,
    categoria: "Termodinámica",
    subcategoria: "Principios básicos",
    ejes_articuladores: ["Pensamiento científico"],
    transversalidades: ["PM-II"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-II-P04",
    numero: 4,
    titulo: "Distingue entre calor y temperatura, y describe los mecanismos de transferencia de calor.",
    descripcion: "Distingue entre calor y temperatura, y describe los mecanismos de transferencia de calor.",
    descripcion_extendida: "Distingue entre calor y temperatura, y describe los mecanismos de transferencia de calor. Contenidos: calor y temperatura: diferencias conceptuales; unidades (Joules, calorías, Kelvin, Celsius); mecanismos de transferencia: conducción, convección y radiación; aplicaciones cotidianas.",
    meta_aprendizaje: META,
    categoria: "Termodinámica",
    subcategoria: "Calor y temperatura",
    ejes_articuladores: ["Pensamiento científico", "Vida saludable"],
    transversalidades: ["PM-II"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-II-P05",
    numero: 5,
    titulo: "Calcula trabajo y potencia mecánica en situaciones prácticas.",
    descripcion: "Calcula trabajo y potencia mecánica en situaciones prácticas.",
    descripcion_extendida: "Calcula trabajo y potencia mecánica en situaciones prácticas. Contenidos: trabajo mecánico: definición y fórmula (W = F × d × cos θ); potencia: definición y fórmula (P = W/t); unidades (Joules, Watts); resolución de problemas en contextos reales.",
    meta_aprendizaje: META,
    categoria: "Mecánica",
    subcategoria: "Trabajo y potencia",
    ejes_articuladores: ["Pensamiento científico", "Pensamiento matemático"],
    transversalidades: ["PM-II"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-II-P06",
    numero: 6,
    titulo: "Relaciona el consumo energético con el impacto ambiental y propone alternativas sustentables.",
    descripcion: "Relaciona el consumo energético con el impacto ambiental y propone alternativas sustentables.",
    descripcion_extendida: "Relaciona el consumo energético con el impacto ambiental y propone alternativas sustentables. Contenidos: huella de carbono; impacto de los combustibles fósiles; transición energética; sustentabilidad; eficiencia energética en el hogar; análisis crítico del consumo.",
    meta_aprendizaje: META,
    categoria: "Energía y ambiente",
    subcategoria: "Consumo e impacto ambiental",
    ejes_articuladores: ["Pensamiento científico", "Vida saludable"],
    transversalidades: ["CS-II", "PM-II"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-II-P07",
    numero: 7,
    titulo: "Analiza las fuentes de energía renovable y no renovable en el contexto mexicano.",
    descripcion: "Analiza las fuentes de energía renovable y no renovable en el contexto mexicano.",
    descripcion_extendida: "Analiza las fuentes de energía renovable y no renovable en el contexto mexicano. Contenidos: fuentes renovables: solar, eólica, hidroeléctrica, geotérmica, biomasa; fuentes no renovables: petróleo, gas natural, carbón; potencial energético de México; políticas energéticas nacionales.",
    meta_aprendizaje: META,
    categoria: "Energía y sociedad",
    subcategoria: "Fuentes de energía",
    ejes_articuladores: ["Pensamiento científico", "Vida saludable"],
    transversalidades: ["CS-II"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-II-P08",
    numero: 8,
    titulo: "Diseña investigaciones sobre fenómenos energéticos en su entorno inmediato.",
    descripcion: "Diseña investigaciones sobre fenómenos energéticos en su entorno inmediato.",
    descripcion_extendida: "Diseña investigaciones sobre fenómenos energéticos en su entorno inmediato. Contenidos: método científico aplicado a la energía; diseño experimental: pregunta, hipótesis, variables, metodología; recolección y análisis de datos; presentación de resultados; conexión con problemáticas locales.",
    meta_aprendizaje: META,
    categoria: "Investigación científica",
    subcategoria: "Diseño de investigaciones",
    ejes_articuladores: ["Pensamiento científico", "Vida saludable"],
    transversalidades: ["PM-II", "CD-II"],
    tiempo_estimado_horas: 3,
  },
] as const;

export async function seedCNEYTII(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed CNEYT-II (propósitos oficiales 2025)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac").select("id").eq("codigo", "CNEYT-II").single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC CNEYT-II no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const rows = PROGRESIONES_CNEYTII.map((p) => ({
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
  if (error) throw new Error(`Error seeding CNEYT-II: ${error.message}`);
  console.log(`  ✓ ${rows.length} propósitos formativos de CNEYT-II (es_placeholder=false)`);
  console.log("\n✅ Seed CNEYT-II completado.\n");
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
  seedCNEYTII(sb).catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
}

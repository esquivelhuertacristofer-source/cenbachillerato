/**
 * Seed de propósitos formativos oficiales para PM-III (Pensamiento Matemático III).
 * Fuente: docs/programas-oficiales/extraidos/05-PENSAMIENTO-MATEMATICO.md
 *         PDF: 2025_MCC_PENSAMIENTO MATEMATICO_BN.pdf — Modelo Educativo 2025
 *
 * Uso: npx tsx scripts/seed-pmiii.ts
 * Idempotente: upsert por campo "codigo".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

const META = "Aplique el lenguaje algebraico y los conceptos de geometría plana para resolver problemas que involucran ecuaciones de segundo grado, figuras geométricas y sus propiedades métricas.";

const PROGRESIONES_PMIII = [
  {
    codigo: "PM-III-P01",
    numero: 1,
    titulo: "Comprende y aplica el Teorema de Pitágoras en situaciones geométricas y de medición.",
    descripcion: "Comprende y aplica el Teorema de Pitágoras en situaciones geométricas y de medición.",
    descripcion_extendida: "Comprende y aplica el Teorema de Pitágoras en situaciones geométricas y de medición. Contenidos: demostración del Teorema de Pitágoras; triples pitagóricos (3-4-5, 5-12-13, 8-15-17); aplicaciones en problemas de distancia, altura y construcción; errores comunes en su aplicación.",
    meta_aprendizaje: META,
    categoria: "Geometría",
    subcategoria: "Teorema de Pitágoras",
    ejes_articuladores: ["Pensamiento matemático y científico", "Resolución de problemas"],
    transversalidades: ["CNEYT-III"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PM-III-P02",
    numero: 2,
    titulo: "Plantea y resuelve ecuaciones cuadráticas mediante distintos métodos (factorización, fórmula general, completar el cuadrado).",
    descripcion: "Plantea y resuelve ecuaciones cuadráticas usando factorización, fórmula general y completar el cuadrado.",
    descripcion_extendida: "Plantea y resuelve ecuaciones cuadráticas mediante distintos métodos (factorización, fórmula general, completar el cuadrado). Contenidos: formas de resolución de ecuaciones cuadráticas; selección del método más eficiente según la ecuación; verificación de soluciones; aplicaciones en contextos reales.",
    meta_aprendizaje: META,
    categoria: "Álgebra",
    subcategoria: "Ecuaciones cuadráticas",
    ejes_articuladores: ["Pensamiento matemático y científico", "Resolución de problemas"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PM-III-P03",
    numero: 3,
    titulo: "Analiza e interpreta la naturaleza de las raíces de una ecuación cuadrática (discriminante).",
    descripcion: "Analiza e interpreta el discriminante para determinar la naturaleza de las raíces de una ecuación cuadrática.",
    descripcion_extendida: "Analiza e interpreta la naturaleza de las raíces de una ecuación cuadrática (discriminante). Contenidos: fórmula del discriminante (b²-4ac); interpretación: dos raíces reales distintas, raíz doble, raíces complejas; relación con la gráfica de la parábola; aplicaciones.",
    meta_aprendizaje: META,
    categoria: "Álgebra",
    subcategoria: "Discriminante",
    ejes_articuladores: ["Pensamiento matemático y científico", "Pensamiento crítico"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PM-III-P04",
    numero: 4,
    titulo: "Calcula perímetros, áreas y volúmenes de figuras y sólidos geométricos comunes.",
    descripcion: "Calcula perímetros, áreas y volúmenes de figuras planas y sólidos geométricos.",
    descripcion_extendida: "Calcula perímetros, áreas y volúmenes de figuras y sólidos geométricos comunes. Contenidos: polígonos regulares e irregulares; círculo y sus partes; prismas, cilindros, pirámides, conos y esferas; unidades de medida; aplicaciones en contextos reales de construcción y diseño.",
    meta_aprendizaje: META,
    categoria: "Geometría",
    subcategoria: "Medición y cálculo geométrico",
    ejes_articuladores: ["Pensamiento matemático y científico", "Resolución de problemas"],
    transversalidades: ["CNEYT-III"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PM-III-P05",
    numero: 5,
    titulo: "Aplica semejanza y congruencia de triángulos en la resolución de problemas geométricos.",
    descripcion: "Aplica semejanza y congruencia de triángulos en la resolución de problemas geométricos.",
    descripcion_extendida: "Aplica semejanza y congruencia de triángulos en la resolución de problemas geométricos. Contenidos: criterios de congruencia (LLL, LAL, ALA, LAA); criterios de semejanza (AA, LAL, LLL); razón de semejanza; aplicaciones en medición indirecta y problemas de escala.",
    meta_aprendizaje: META,
    categoria: "Geometría",
    subcategoria: "Semejanza y congruencia",
    ejes_articuladores: ["Pensamiento matemático y científico", "Resolución de problemas"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PM-III-P06",
    numero: 6,
    titulo: "Relaciona el álgebra con la geometría mediante la representación gráfica de ecuaciones cuadráticas (parábolas).",
    descripcion: "Relaciona el álgebra con la geometría representando gráficamente ecuaciones cuadráticas como parábolas.",
    descripcion_extendida: "Relaciona el álgebra con la geometría mediante la representación gráfica de ecuaciones cuadráticas (parábolas). Contenidos: vértice, eje de simetría y ceros de la parábola; forma estándar y forma factorizada; transformaciones de la parábola (traslaciones, reflexiones); conexión entre álgebra y geometría analítica.",
    meta_aprendizaje: META,
    categoria: "Álgebra y geometría",
    subcategoria: "Representación gráfica de parábolas",
    ejes_articuladores: ["Pensamiento matemático y científico", "Pensamiento crítico"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
] as const;

export async function seedPMIII(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed PM-III (propósitos oficiales 2025)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac").select("id").eq("codigo", "PM-III").single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC PM-III no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const rows = PROGRESIONES_PMIII.map((p) => ({
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
  if (error) throw new Error(`Error seeding PM-III: ${error.message}`);
  console.log(`  ✓ ${rows.length} propósitos formativos de PM-III (es_placeholder=false)`);
  console.log("\n✅ Seed PM-III completado: 6 propósitos oficiales insertados.\n");
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
  seedPMIII(sb).catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
}

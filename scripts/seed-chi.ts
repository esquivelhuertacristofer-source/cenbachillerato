/**
 * Seed de propósitos formativos oficiales para CH-I (Conciencia Histórica I).
 * Fuente: docs/programas-oficiales/extraidos/01-CONCIENCIA-HISTORICA.md
 *         Modelo Curricular MCCEMS 2025 — Semestre 4
 *
 * FAMILIA NUEVA: Primera aparición de Conciencia Histórica en el currículo.
 * La familia CH se extiende por semestres 4 (CH-I), 5 (CH-II) y 6 (CH-III).
 *
 * Uso: npx tsx scripts/seed-chi.ts
 * Idempotente: upsert por campo "codigo".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

const META = "Formule problemas históricos a partir del reconocimiento de coordenadas de tiempo y espacio, identificando causas, consecuencias y el papel de los sujetos históricos en los procesos del pasado.";

const PROGRESIONES_CHI = [
  {
    codigo: "CH-I-P01",
    numero: 1,
    titulo: "Ubica eventos y procesos históricos en coordenadas espacio-temporales para situar su contexto de desarrollo.",
    descripcion: "Ubica eventos y procesos históricos en coordenadas espacio-temporales para situar su contexto de desarrollo.",
    descripcion_extendida: "Ubica eventos y procesos históricos en coordenadas espacio-temporales para situar su contexto de desarrollo. Contenidos: coordenadas históricas de tiempo y espacio; líneas del tiempo y mapas históricos; periodización y sus criterios; nociones de simultaneidad histórica; relación entre espacio geográfico y desarrollo de los procesos históricos; lectura e interpretación de fuentes cartográficas históricas.",
    meta_aprendizaje: META,
    categoria: "Pensamiento histórico",
    subcategoria: "Coordenadas históricas: tiempo y espacio",
    ejes_articuladores: ["Pensamiento crítico", "Conciencia histórica"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CH-I-P02",
    numero: 2,
    titulo: "Distingue diferentes formas de medir y conceptualizar el tiempo histórico (cronológico, cíclico, subjetivo).",
    descripcion: "Distingue diferentes formas de medir y conceptualizar el tiempo histórico: cronológico, cíclico y subjetivo.",
    descripcion_extendida: "Distingue diferentes formas de medir y conceptualizar el tiempo histórico (cronológico, cíclico, subjetivo). Contenidos: tiempo cronológico: datación, eras y calendarios; tiempo cíclico: visiones de recurrencia en diversas culturas (mesoamerican, greco-romana); tiempo subjetivo: la memoria, la experiencia vivida y su relación con la historia; periodización histórica y sus convenciones; conceptos de duración, ritmo y cambio en la historia.",
    meta_aprendizaje: META,
    categoria: "Tiempo histórico",
    subcategoria: "Conceptos del tiempo: cronología, periodización, simultaneidad",
    ejes_articuladores: ["Pensamiento crítico", "Conciencia histórica"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CH-I-P03",
    numero: 3,
    titulo: "Analiza relaciones de causalidad entre fenómenos históricos para comprender su multicausalidad y consecuencias.",
    descripcion: "Analiza relaciones de causalidad entre fenómenos históricos para comprender su multicausalidad y consecuencias.",
    descripcion_extendida: "Analiza relaciones de causalidad entre fenómenos históricos para comprender su multicausalidad y consecuencias. Contenidos: causalidad histórica: tipos de causas (estructurales, coyunturales y contingentes); multicausalidad y multidimensionalidad de los procesos históricos; consecuencias inmediatas y a largo plazo; intencionalidad de los sujetos históricos; análisis de casos históricos concretos aplicando el esquema causal; relación entre crisis sociales y transformaciones políticas.",
    meta_aprendizaje: META,
    categoria: "Causalidad histórica",
    subcategoria: "Causalidad histórica: causas estructurales, coyunturales y contingentes",
    ejes_articuladores: ["Pensamiento crítico", "Conciencia histórica", "Ciudadanía democrática"],
    transversalidades: ["CS-III"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CH-I-P04",
    numero: 4,
    titulo: "Identifica y evalúa fuentes históricas primarias y secundarias como evidencias del pasado.",
    descripcion: "Identifica y evalúa fuentes históricas primarias y secundarias como evidencias del pasado.",
    descripcion_extendida: "Identifica y evalúa fuentes históricas primarias y secundarias como evidencias del pasado. Contenidos: tipos de fuentes históricas: materiales, escritas, orales e iconográficas; distinción entre fuente primaria y fuente secundaria; criterios para evaluar la fiabilidad, pertinencia y sesgo de una fuente; heurística histórica: contextualización, corroboración y lectura cercana; uso de archivos, museos y bibliotecas digitales; relación entre fuentes documentales y expresión escrita.",
    meta_aprendizaje: META,
    categoria: "Fuentes históricas",
    subcategoria: "Tipos de fuentes históricas: materiales, escritas, orales, iconográficas",
    ejes_articuladores: ["Pensamiento crítico", "Conciencia histórica"],
    transversalidades: ["LC-III"],
    tiempo_estimado_horas: 3,
  },
] as const;

export async function seedCHI(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed CH-I (propósitos oficiales 2025)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac").select("id").eq("codigo", "CH-I").single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC CH-I no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const rows = PROGRESIONES_CHI.map((p) => ({
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
  if (error) throw new Error(`Error seeding CH-I: ${error.message}`);
  console.log(`  ✓ ${rows.length} propósitos formativos de CH-I (es_placeholder=false)`);
  console.log("\n✅ Seed CH-I completado: 4 propósitos oficiales insertados.\n");
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
  seedCHI(sb).catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
}

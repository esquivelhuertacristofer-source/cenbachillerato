/**
 * Seed de propósitos formativos oficiales para PM-I (Pensamiento Matemático I).
 * Fuente: docs/programas-oficiales/extraidos/05-PENSAMIENTO-MATEMATICO.md
 *         PDF: 2025_MCC_PENSAMIENTO MATEMATICO_BN.pdf — Modelo Educativo 2025
 *
 * Uso: npx tsx scripts/seed-pmi.ts
 * Idempotente: upsert por campo "codigo".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

const META = "Comprenda las matemáticas como expresión del pensamiento humano y desarrolle el razonamiento lógico y aritmético para resolver problemas del entorno cotidiano con precisión y creatividad.";

const PROGRESIONES_PMI = [
  {
    codigo: "PM-I-P01",
    numero: 1,
    titulo: "Reconoce las matemáticas como construcción humana con historia, diversidad cultural y vinculación con la vida cotidiana.",
    descripcion: "Reconoce las matemáticas como construcción humana con historia, diversidad cultural y vinculación con la vida cotidiana.",
    descripcion_extendida: "Reconoce las matemáticas como construcción humana con historia, diversidad cultural y vinculación con la vida cotidiana. Contenidos: historia de las matemáticas; diversidad de sistemas numéricos (maya, romano, árabe); matemáticas como práctica social.",
    meta_aprendizaje: META,
    categoria: "Pensamiento matemático como práctica social",
    subcategoria: "Historia y cultura matemática",
    ejes_articuladores: ["Pensamiento crítico", "Interculturalidad crítica"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PM-I-P02",
    numero: 2,
    titulo: "Aplica operaciones con números naturales, enteros y racionales en situaciones problemáticas concretas.",
    descripcion: "Aplica operaciones con números naturales, enteros y racionales en situaciones problemáticas concretas.",
    descripcion_extendida: "Aplica operaciones con números naturales, enteros y racionales en situaciones problemáticas concretas. Contenidos: conjuntos numéricos N, Z, Q; operaciones y propiedades.",
    meta_aprendizaje: META,
    categoria: "Aritmética",
    subcategoria: "Conjuntos numéricos y operaciones",
    ejes_articuladores: ["Pensamiento crítico"],
    transversalidades: ["CNEYT-I"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PM-I-P03",
    numero: 3,
    titulo: "Utiliza el razonamiento lógico (proposiciones, conectivos, negación, tablas de verdad) para analizar enunciados y argumentos.",
    descripcion: "Utiliza el razonamiento lógico (proposiciones, conectivos, negación, tablas de verdad) para analizar enunciados y argumentos.",
    descripcion_extendida: "Utiliza el razonamiento lógico (proposiciones, conectivos, negación, tablas de verdad) para analizar enunciados y argumentos. Contenidos: lógica proposicional básica; proposiciones, conectivos lógicos, negación y tablas de verdad.",
    meta_aprendizaje: META,
    categoria: "Lógica matemática",
    subcategoria: "Proposiciones y tablas de verdad",
    ejes_articuladores: ["Pensamiento crítico"],
    transversalidades: ["LC-I"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PM-I-P04",
    numero: 4,
    titulo: "Opera con fracciones, decimales y porcentajes en contextos de medición, economía y ciencias.",
    descripcion: "Opera con fracciones, decimales y porcentajes en contextos de medición, economía y ciencias.",
    descripcion_extendida: "Opera con fracciones, decimales y porcentajes en contextos de medición, economía y ciencias. Contenidos: fracciones y decimales: operaciones, representaciones, conversiones; porcentajes: cálculo e interpretación en contextos reales.",
    meta_aprendizaje: META,
    categoria: "Aritmética",
    subcategoria: "Fracciones, decimales y porcentajes",
    ejes_articuladores: ["Pensamiento crítico"],
    transversalidades: ["CNEYT-I", "CS-I"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PM-I-P05",
    numero: 5,
    titulo: "Comprende y aplica el concepto de razón y proporción en situaciones de proporcionalidad directa e inversa.",
    descripcion: "Comprende y aplica el concepto de razón y proporción en situaciones de proporcionalidad directa e inversa.",
    descripcion_extendida: "Comprende y aplica el concepto de razón y proporción en situaciones de proporcionalidad directa e inversa. Contenidos: razón, proporción y regla de tres; proporcionalidad directa e inversa.",
    meta_aprendizaje: META,
    categoria: "Aritmética",
    subcategoria: "Proporcionalidad",
    ejes_articuladores: ["Pensamiento crítico"],
    transversalidades: ["CNEYT-I"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PM-I-P06",
    numero: 6,
    titulo: "Realiza mediciones con unidades del Sistema Internacional y convierte entre unidades.",
    descripcion: "Realiza mediciones con unidades del Sistema Internacional y convierte entre unidades.",
    descripcion_extendida: "Realiza mediciones con unidades del Sistema Internacional y convierte entre unidades. Contenidos: Sistema Internacional de Unidades: longitud, masa, tiempo, área, volumen; conversión de unidades.",
    meta_aprendizaje: META,
    categoria: "Medición",
    subcategoria: "Sistema Internacional de Unidades",
    ejes_articuladores: ["Pensamiento crítico"],
    transversalidades: ["CNEYT-I"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PM-I-P07",
    numero: 7,
    titulo: "Estima, aproxima y verifica la razonabilidad de resultados en cálculos numéricos.",
    descripcion: "Estima, aproxima y verifica la razonabilidad de resultados en cálculos numéricos.",
    descripcion_extendida: "Estima, aproxima y verifica la razonabilidad de resultados en cálculos numéricos. Contenidos: estimación y aproximación; verificación de resultados; sentido numérico.",
    meta_aprendizaje: META,
    categoria: "Razonamiento matemático",
    subcategoria: "Estimación y verificación",
    ejes_articuladores: ["Pensamiento crítico"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
] as const;

export async function seedPMI(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed PM-I (propósitos oficiales 2025)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac").select("id").eq("codigo", "PM-I").single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC PM-I no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const rows = PROGRESIONES_PMI.map((p) => ({
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
  if (error) throw new Error(`Error seeding PM-I: ${error.message}`);
  console.log(`  ✓ ${rows.length} propósitos formativos de PM-I (es_placeholder=false)`);
  console.log("\n✅ Seed PM-I completado.\n");
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
  seedPMI(sb).catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
}

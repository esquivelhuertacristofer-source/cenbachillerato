/**
 * Seed de propósitos formativos oficiales para CH-III (Conciencia Histórica III).
 * Fuente: docs/programas-oficiales/extraidos/01-CONCIENCIA-HISTORICA.md
 *         Modelo Curricular MCCEMS 2025 — Semestre 6
 *
 * Cierre de la familia CH (Semestres 4-5-6). CH-III completa el ciclo:
 * CH-I (fuentes, causalidad) → CH-II (hipótesis, historicidad) → CH-III (narrativa argumentada).
 *
 * Uso: npx tsx scripts/seed-chiii.ts
 * Idempotente: upsert por campo "codigo".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

const META = "Construya narraciones históricas argumentadas, articulando fuentes, evidencias y análisis crítico, para comprender y comunicar su interpretación de los procesos históricos.";

export const PROGRESIONES_CHIII = [
  {
    codigo: "CH-III-P01",
    numero: 1,
    titulo: "Selecciona, evalúa y contrasta fuentes históricas diversas para construir interpretaciones informadas.",
    descripcion: "Selecciona, evalúa y contrasta fuentes históricas diversas para construir interpretaciones informadas.",
    descripcion_extendida: "Selecciona, evalúa y contrasta fuentes históricas diversas para construir interpretaciones informadas. Contenidos: tipología avanzada de fuentes históricas: materiales, escritas, orales, iconográficas, digitales; criterios de evaluación: autoría, fecha, intención, audiencia, contexto de producción; análisis interno y externo de las fuentes: veracidad, representatividad, sesgo; selección estratégica de fuentes para sustentar una tesis histórica; fuentes primarias de la historia de México: archivo, hemeroteca, patrimonio oral; contrastación de versiones contradictorias sobre un mismo evento; historia oral como fuente en comunidades sin escritura.",
    meta_aprendizaje: META,
    categoria: "Crítica y evaluación de fuentes",
    subcategoria: "Crítica y corroboración de fuentes históricas",
    ejes_articuladores: ["Pensamiento crítico", "Conciencia histórica"],
    transversalidades: ["CH-II"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CH-III-P02",
    numero: 2,
    titulo: "Aplica el procedimiento de corroboración de fuentes para validar evidencias históricas.",
    descripcion: "Aplica el procedimiento de corroboración de fuentes para validar evidencias históricas.",
    descripcion_extendida: "Aplica el procedimiento de corroboración de fuentes para validar evidencias históricas. Contenidos: corroboración histórica: comparar dos o más fuentes sobre el mismo evento para validar la evidencia; triangulación de fuentes: buscar convergencia entre tipos distintos (oral, escrita, material); procedimientos de análisis documental: lectura activa, anotación, extracción de evidencias; análisis iconográfico: lectura de imágenes, fotografías y representaciones visuales; herramientas digitales para el trabajo con fuentes: repositorios, hemerotecas digitales, AGN en línea; limitaciones del método: ausencias documentales, destrucción intencional de fuentes, sesgo de supervivencia; presentación y cita de fuentes con formato académico.",
    meta_aprendizaje: META,
    categoria: "Metodología histórica avanzada",
    subcategoria: "Técnicas de análisis documental e iconográfico",
    ejes_articuladores: ["Pensamiento crítico", "Conciencia histórica"],
    transversalidades: ["LC-III", "CD-II"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CH-III-P03",
    numero: 3,
    titulo: "Elabora narraciones históricas argumentadas que incorporan causas, consecuencias y perspectivas múltiples.",
    descripcion: "Elabora narraciones históricas argumentadas que incorporan causas, consecuencias y perspectivas múltiples.",
    descripcion_extendida: "Elabora narraciones históricas argumentadas que incorporan causas, consecuencias y perspectivas múltiples. Contenidos: estructura de la narrativa histórica: tesis, argumentos, evidencias, conclusión; narración desde múltiples perspectivas: subalternos, género, etnia, clase; causas y consecuencias en la narrativa: encadenamiento causal y efecto dominó; historia del presente: conexiones entre pasado y actualidad mexicana e internacional; ejercicios de escritura histórica: ensayo breve, línea del tiempo argumentada, mapa conceptual histórico; errores comunes en la narrativa histórica: generalización, anacronismo, determinismo; reescritura de la historia desde voces históricamente silenciadas.",
    meta_aprendizaje: META,
    categoria: "Narrativa histórica argumentada",
    subcategoria: "Estructura de la narrativa histórica: tesis, argumentos, evidencias",
    ejes_articuladores: ["Pensamiento crítico", "Conciencia histórica", "Igualdad de género"],
    transversalidades: ["LC-III", "CH-II"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CH-III-P04",
    numero: 4,
    titulo: "Comunica su interpretación histórica de manera oral o escrita con rigor y creatividad.",
    descripcion: "Comunica su interpretación histórica de manera oral o escrita con rigor y creatividad.",
    descripcion_extendida: "Comunica su interpretación histórica de manera oral o escrita con rigor y creatividad. Contenidos: formatos de comunicación histórica: ensayo, artículo de divulgación, exposición oral, documental, podcast, infografía; divulgación histórica: adaptación del lenguaje académico a públicos generales; historia pública: museos, conmemoraciones, monumentos, redes sociales; rigor histórico y creatividad: conciliar precisión académica con narración atractiva; presentación oral con evidencias: defensa de una interpretación histórica ante audiencia; historiografía: diversas escuelas y corrientes (Annales, historia social, historia de género, microhistoria); proyecto integrador: investigación y comunicación histórica sobre un problema de la comunidad.",
    meta_aprendizaje: META,
    categoria: "Comunicación histórica y ciudadanía",
    subcategoria: "Historia del presente: conexiones entre pasado y actualidad",
    ejes_articuladores: ["Pensamiento crítico", "Conciencia histórica", "Ciudadanía democrática"],
    transversalidades: ["LC-III", "CD-III"],
    tiempo_estimado_horas: 3,
  },
] as const;

export async function seedCHIII(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed CH-III (propósitos oficiales 2025)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac").select("id").eq("codigo", "CH-III").single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC CH-III no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const rows = PROGRESIONES_CHIII.map((p) => ({
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
  if (error) throw new Error(`Error seeding CH-III: ${error.message}`);
  console.log(`  ✓ ${rows.length} propósitos formativos de CH-III (es_placeholder=false)`);
  console.log("\n✅ Seed CH-III completado: 4 propósitos oficiales insertados.\n");
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
  seedCHIII(sb).catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
}

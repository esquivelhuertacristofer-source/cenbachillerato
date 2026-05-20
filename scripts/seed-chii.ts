/**
 * Seed de propósitos formativos oficiales para CH-II (Conciencia Histórica II).
 * Fuente: docs/programas-oficiales/extraidos/01-CONCIENCIA-HISTORICA.md
 *         Modelo Curricular MCCEMS 2025 — Semestre 5
 *
 * Continuación de CH-I (Semestre 4). La familia CH se extiende por semestres 4-5-6.
 *
 * Uso: npx tsx scripts/seed-chii.ts
 * Idempotente: upsert por campo "codigo".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

const META = "Descubra su propia historicidad al reconocerse como sujeto histórico situado en un tiempo y lugar específicos, capaz de formular hipótesis sobre procesos del pasado con base en evidencias.";

const PROGRESIONES_CHII = [
  {
    codigo: "CH-II-P01",
    numero: 1,
    titulo: "Reflexiona sobre su propia historicidad como sujeto inscrito en procesos sociales, culturales e históricos.",
    descripcion: "Reflexiona sobre su propia historicidad como sujeto inscrito en procesos sociales, culturales e históricos.",
    descripcion_extendida: "Reflexiona sobre su propia historicidad como sujeto inscrito en procesos sociales, culturales e históricos. Contenidos: concepto de historicidad: el ser humano como producto y agente de la historia; identidad individual y colectiva en contexto histórico; autobiografía histórica: cómo los grandes procesos han marcado la vida familiar y comunitaria; memoria colectiva e identidad cultural; la historia oral como herramienta de recuperación de experiencias; relación entre historia personal e historia social.",
    meta_aprendizaje: META,
    categoria: "Historicidad y sujeto histórico",
    subcategoria: "Historicidad: el ser humano como sujeto y objeto de la historia",
    ejes_articuladores: ["Pensamiento crítico", "Conciencia histórica"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CH-II-P02",
    numero: 2,
    titulo: "Formula hipótesis históricas a partir de la interpretación de fuentes y evidencias del pasado.",
    descripcion: "Formula hipótesis históricas a partir de la interpretación de fuentes y evidencias del pasado.",
    descripcion_extendida: "Formula hipótesis históricas a partir de la interpretación de fuentes y evidencias del pasado. Contenidos: hipótesis histórica: concepto y diferencia con hipótesis científica; procedimiento para formular hipótesis: observar, contextualizar, interrogar, proponer; selección y evaluación crítica de fuentes primarias y secundarias; corroboración de fuentes: triangulación de evidencias; construcción de argumentos históricos basados en evidencia; errores comunes al interpretar fuentes (anacronismo, presentismo, sesgo); ejercicios prácticos con documentos históricos mexicanos.",
    meta_aprendizaje: META,
    categoria: "Metodología histórica",
    subcategoria: "Formulación y contrastación de hipótesis históricas",
    ejes_articuladores: ["Pensamiento crítico", "Conciencia histórica"],
    transversalidades: ["LC-V"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CH-II-P03",
    numero: 3,
    titulo: "Reconoce el sentido histórico como capacidad humana para comprender el presente desde el pasado.",
    descripcion: "Reconoce el sentido histórico como capacidad humana para comprender el presente desde el pasado.",
    descripcion_extendida: "Reconoce el sentido histórico como capacidad humana para comprender el presente desde el pasado. Contenidos: sentido histórico: definición y dimensiones (temporal, espacial, cultural); conciencia histórica y pensamiento prospectivo; memoria colectiva: cómo las sociedades recuerdan, olvidan y reinterpretan el pasado; historia y política: usos y abusos de la historia; la historia como herramienta para entender conflictos actuales; historia de vida como forma de sentido histórico; vinculación entre pasado, presente y futuro.",
    meta_aprendizaje: META,
    categoria: "Sentido histórico y memoria",
    subcategoria: "Sentido histórico y memoria colectiva",
    ejes_articuladores: ["Pensamiento crítico", "Conciencia histórica", "Ciudadanía democrática"],
    transversalidades: ["CS-III"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CH-II-P04",
    numero: 4,
    titulo: "Analiza procesos históricos de México y el mundo en su contexto multicausal e interconectado.",
    descripcion: "Analiza procesos históricos de México y el mundo en su contexto multicausal e interconectado.",
    descripcion_extendida: "Analiza procesos históricos de México y el mundo en su contexto multicausal e interconectado. Contenidos: procesos históricos globales con impacto en México: colonialismo, independencias, revoluciones, guerras mundiales; historia conectada: cómo procesos nacionales se enlazan con dinámicas internacionales; análisis multicausal de los grandes cambios históricos; actores colectivos e individuales en los procesos históricos; periodización del siglo XIX y XX en México: Reforma, Porfiriato, Revolución Mexicana, posrevolución; historia comparada: México en relación con América Latina; globalización histórica.",
    meta_aprendizaje: META,
    categoria: "Procesos históricos",
    subcategoria: "Procesos históricos nacionales y globales: colonialismo, independencias, revoluciones",
    ejes_articuladores: ["Pensamiento crítico", "Conciencia histórica", "Sustentabilidad"],
    transversalidades: ["CH-I"],
    tiempo_estimado_horas: 3,
  },
] as const;

export async function seedCHII(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed CH-II (propósitos oficiales 2025)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac").select("id").eq("codigo", "CH-II").single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC CH-II no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const rows = PROGRESIONES_CHII.map((p) => ({
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
  if (error) throw new Error(`Error seeding CH-II: ${error.message}`);
  console.log(`  ✓ ${rows.length} propósitos formativos de CH-II (es_placeholder=false)`);
  console.log("\n✅ Seed CH-II completado: 4 propósitos oficiales insertados.\n");
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
  seedCHII(sb).catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
}

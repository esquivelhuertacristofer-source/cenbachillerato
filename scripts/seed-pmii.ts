/**
 * Seed de propósitos formativos oficiales para PM-II (Pensamiento Matemático II).
 * Fuente: docs/programas-oficiales/extraidos/05-PENSAMIENTO-MATEMATICO.md
 *         Modelo Educativo 2025
 *
 * Uso: npx tsx scripts/seed-pmii.ts
 * Idempotente: upsert por campo "codigo".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

const META = "Entienda el lenguaje algebraico como forma de generalizar patrones y relaciones numéricas, y lo aplique para plantear y resolver ecuaciones e inecuaciones lineales en contextos reales.";

const PROGRESIONES_PMII = [
  {
    codigo: "PM-II-P01",
    numero: 1,
    titulo: "Identifica y describe patrones numéricos y geométricos para generalizarlos mediante expresiones algebraicas.",
    descripcion: "Identifica y describe patrones numéricos y geométricos para generalizarlos mediante expresiones algebraicas.",
    descripcion_extendida: "Identifica y describe patrones numéricos y geométricos para generalizarlos mediante expresiones algebraicas. Contenidos: patrones y secuencias aritméticas y geométricas; generalización con variables; introducción al lenguaje algebraico.",
    meta_aprendizaje: META,
    categoria: "Álgebra",
    subcategoria: "Patrones y generalización",
    ejes_articuladores: ["Pensamiento matemático", "Vida saludable"],
    transversalidades: ["CD-II"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PM-II-P02",
    numero: 2,
    titulo: "Interpreta y manipula expresiones algebraicas: monomios, polinomios, operaciones entre ellos.",
    descripcion: "Interpreta y manipula expresiones algebraicas: monomios, polinomios, operaciones entre ellos.",
    descripcion_extendida: "Interpreta y manipula expresiones algebraicas: monomios, polinomios, operaciones entre ellos. Contenidos: expresiones algebraicas; monomios y polinomios; suma, resta, multiplicación y división de polinomios; simplificación de expresiones.",
    meta_aprendizaje: META,
    categoria: "Álgebra",
    subcategoria: "Expresiones algebraicas",
    ejes_articuladores: ["Pensamiento matemático"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PM-II-P03",
    numero: 3,
    titulo: "Factoriza polinomios mediante técnicas básicas: factor común, diferencia de cuadrados, trinomio cuadrado perfecto.",
    descripcion: "Factoriza polinomios mediante técnicas básicas: factor común, diferencia de cuadrados, trinomio cuadrado perfecto.",
    descripcion_extendida: "Factoriza polinomios mediante técnicas básicas: factor común, diferencia de cuadrados y trinomio cuadrado perfecto. Contenidos: factorización como proceso inverso a la multiplicación; factor común; cuadrado perfecto; diferencia de cuadrados; trinomio general.",
    meta_aprendizaje: META,
    categoria: "Álgebra",
    subcategoria: "Factorización",
    ejes_articuladores: ["Pensamiento matemático"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PM-II-P04",
    numero: 4,
    titulo: "Plantea y resuelve ecuaciones lineales en una variable en contextos problemáticos.",
    descripcion: "Plantea y resuelve ecuaciones lineales en una variable en contextos problemáticos.",
    descripcion_extendida: "Plantea y resuelve ecuaciones lineales en una variable en contextos problemáticos. Contenidos: ecuaciones lineales: definición, solución y verificación; modelación de problemas con ecuaciones; aplicaciones en contextos cotidianos y comunitarios.",
    meta_aprendizaje: META,
    categoria: "Álgebra",
    subcategoria: "Ecuaciones lineales",
    ejes_articuladores: ["Pensamiento matemático", "Igualdad de género"],
    transversalidades: ["CS-II"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PM-II-P05",
    numero: 5,
    titulo: "Plantea y resuelve sistemas de ecuaciones lineales en dos variables mediante los métodos de sustitución, igualación y eliminación.",
    descripcion: "Plantea y resuelve sistemas de ecuaciones lineales en dos variables usando múltiples métodos.",
    descripcion_extendida: "Plantea y resuelve sistemas de ecuaciones lineales en dos variables mediante los métodos de sustitución, igualación y eliminación. Contenidos: sistemas de ecuaciones 2×2; interpretación gráfica; método de sustitución; igualación; eliminación-Gauss; aplicaciones en situaciones reales.",
    meta_aprendizaje: META,
    categoria: "Álgebra",
    subcategoria: "Sistemas de ecuaciones",
    ejes_articuladores: ["Pensamiento matemático"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PM-II-P06",
    numero: 6,
    titulo: "Aplica inecuaciones lineales para describir y resolver situaciones de restricción y optimización básica.",
    descripcion: "Aplica inecuaciones lineales para describir y resolver situaciones de restricción y optimización básica.",
    descripcion_extendida: "Aplica inecuaciones lineales para describir y resolver situaciones de restricción y optimización básica. Contenidos: inecuaciones lineales; representación en recta numérica y plano cartesiano; solución de inecuaciones; aplicaciones en problemas de restricción y optimización.",
    meta_aprendizaje: META,
    categoria: "Álgebra",
    subcategoria: "Inecuaciones lineales",
    ejes_articuladores: ["Pensamiento matemático", "Vida saludable"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
] as const;

export async function seedPMII(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed PM-II (propósitos oficiales 2025)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac").select("id").eq("codigo", "PM-II").single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC PM-II no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const rows = PROGRESIONES_PMII.map((p) => ({
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
  if (error) throw new Error(`Error seeding PM-II: ${error.message}`);
  console.log(`  ✓ ${rows.length} propósitos formativos de PM-II (es_placeholder=false)`);
  console.log("\n✅ Seed PM-II completado.\n");
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
  seedPMII(sb).catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
}

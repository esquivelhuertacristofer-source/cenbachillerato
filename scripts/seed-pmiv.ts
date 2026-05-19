/**
 * Seed de propósitos formativos oficiales para PM-IV (Pensamiento Matemático IV — Trigonometría y Geometría Analítica).
 * Fuente: docs/programas-oficiales/extraidos/05-PENSAMIENTO-MATEMATICO.md
 *         PDF: 2025_MCC_PENSAMIENTO MATEMATICO_BN.pdf — Modelo Educativo 2025
 *
 * Uso: npx tsx scripts/seed-pmiv.ts
 * Idempotente: upsert por campo "codigo".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

const META = "Resuelva problemas que involucran funciones trigonométricas y geométricas analíticas, aplicando sus propiedades en contextos científicos, tecnológicos y cotidianos.";

const PROGRESIONES_PMIV = [
  {
    codigo: "PM-IV-P01",
    numero: 1,
    titulo: "Comprende el concepto de función y sus representaciones (tabular, gráfica, algebraica, verbal).",
    descripcion: "Comprende el concepto de función y sus distintas representaciones.",
    descripcion_extendida: "Comprende el concepto de función y sus representaciones (tabular, gráfica, algebraica, verbal). Contenidos: definición formal de función; dominio y rango; tipos de función: inyectiva, sobreyectiva, biyectiva; representaciones: tabla de valores, gráfica cartesiana, expresión algebraica y descripción verbal; identificación de funciones mediante la prueba de la línea vertical. Construye sobre los conocimientos de funciones cuadráticas de PM-III.",
    meta_aprendizaje: META,
    categoria: "Funciones",
    subcategoria: "Concepto de función",
    ejes_articuladores: ["Pensamiento matemático y científico"],
    transversalidades: ["PM-III"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PM-IV-P02",
    numero: 2,
    titulo: "Analiza y grafica funciones polinomiales de primer y segundo grado y sus transformaciones.",
    descripcion: "Analiza y grafica funciones lineales y cuadráticas aplicando transformaciones.",
    descripcion_extendida: "Analiza y grafica funciones polinomiales de primer y segundo grado y sus transformaciones. Contenidos: función lineal f(x) = mx + b: pendiente, ordenada al origen, gráfica; función cuadrática f(x) = ax² + bx + c: vértice, eje de simetría, concavidad; transformaciones: traslaciones verticales y horizontales, reflexiones, escalamientos; modelación de situaciones reales con funciones de primer y segundo grado.",
    meta_aprendizaje: META,
    categoria: "Funciones",
    subcategoria: "Funciones lineales y cuadráticas",
    ejes_articuladores: ["Pensamiento matemático y científico"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PM-IV-P03",
    numero: 3,
    titulo: "Define las razones trigonométricas en triángulos rectángulos y las aplica en problemas de medición indirecta.",
    descripcion: "Define y aplica las razones trigonométricas en triángulos rectángulos.",
    descripcion_extendida: "Define las razones trigonométricas en triángulos rectángulos y las aplica en problemas de medición indirecta. Contenidos: razones trigonométricas: seno (sen θ = cateto opuesto / hipotenusa), coseno (cos θ = cateto adyacente / hipotenusa), tangente (tan θ = sen θ / cos θ) y sus recíprocas (cosecante, secante, cotangente); identidad fundamental sin²θ + cos²θ = 1; ángulos notables (30°, 45°, 60°); aplicaciones: ángulos de elevación y depresión, alturas inaccesibles, distancias en física y topografía.",
    meta_aprendizaje: META,
    categoria: "Trigonometría",
    subcategoria: "Razones trigonométricas",
    ejes_articuladores: ["Pensamiento matemático y científico"],
    transversalidades: ["CNEYT-IV"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PM-IV-P04",
    numero: 4,
    titulo: "Extiende las razones trigonométricas a ángulos en el círculo unitario y maneja sus valores.",
    descripcion: "Extiende las razones trigonométricas al círculo unitario y determina valores exactos.",
    descripcion_extendida: "Extiende las razones trigonométricas a ángulos en el círculo unitario y maneja sus valores. Contenidos: definición de las funciones seno y coseno sobre el círculo unitario (radio = 1); ángulos en posición estándar; conversión entre grados y radianes; cuadrantes y signos de las funciones trigonométricas; valores exactos de sin, cos y tan para ángulos múltiplos de 30° y 45°; periodicidad de las funciones trigonométricas; aplicaciones en ondas y movimiento armónico simple en física.",
    meta_aprendizaje: META,
    categoria: "Trigonometría",
    subcategoria: "Círculo unitario",
    ejes_articuladores: ["Pensamiento matemático y científico"],
    transversalidades: ["CNEYT-IV"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PM-IV-P05",
    numero: 5,
    titulo: "Aplica la Ley de Senos y la Ley de Cosenos en la resolución de triángulos oblicuángulos.",
    descripcion: "Aplica la Ley de Senos y la Ley de Cosenos para resolver triángulos oblicuángulos.",
    descripcion_extendida: "Aplica la Ley de Senos y la Ley de Cosenos en la resolución de triángulos oblicuángulos. Contenidos: Ley de Senos: sen(A)/a = sen(B)/b = sen(C)/c; Ley de Cosenos: a² = b² + c² - 2bc·cos(A); criterios de solución de triángulos (ALA, LAL, LLL, AAL); casos de ambigüedad en la Ley de Senos; cálculo de áreas mediante trigonometría: Área = (1/2)·b·c·sen(A); aplicaciones en navegación, arquitectura y problemas de ingeniería.",
    meta_aprendizaje: META,
    categoria: "Trigonometría",
    subcategoria: "Ley de Senos y Cosenos",
    ejes_articuladores: ["Pensamiento matemático y científico"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PM-IV-P06",
    numero: 6,
    titulo: "Introduce la geometría analítica: distancia, punto medio y ecuación de la recta en el plano cartesiano.",
    descripcion: "Aplica fórmulas de geometría analítica: distancia, punto medio y ecuaciones de la recta.",
    descripcion_extendida: "Introduce la geometría analítica: distancia, punto medio y ecuación de la recta en el plano cartesiano. Contenidos: fórmula de distancia entre dos puntos: d = √((x₂-x₁)² + (y₂-y₁)²); fórmula del punto medio: M = ((x₁+x₂)/2, (y₁+y₂)/2); pendiente de una recta: m = (y₂-y₁)/(x₂-x₁); formas de la ecuación de la recta: pendiente-intercepto (y = mx + b), punto-pendiente (y - y₁ = m(x - x₁)) y general (Ax + By + C = 0); rectas paralelas y perpendiculares; distancia de un punto a una recta.",
    meta_aprendizaje: META,
    categoria: "Geometría analítica",
    subcategoria: "Recta en el plano cartesiano",
    ejes_articuladores: ["Pensamiento matemático y científico"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PM-IV-P07",
    numero: 7,
    titulo: "Analiza cónicas básicas: circunferencia y parábola como lugares geométricos en el plano.",
    descripcion: "Analiza la circunferencia y la parábola como lugares geométricos en el plano cartesiano.",
    descripcion_extendida: "Analiza cónicas básicas: circunferencia y parábola como lugares geométricos en el plano. Contenidos: circunferencia: definición como lugar geométrico, ecuación canónica (x-h)² + (y-k)² = r², centro y radio, ecuación general y conversión a forma canónica; parábola: definición con foco y directriz, ecuación canónica y = a(x-h)² + k (eje vertical) y x = a(y-k)² + h (eje horizontal), vértice, foco, directriz y eje de simetría; trazado e interpretación gráfica; aplicaciones de la parábola en física (tiro parabólico) y tecnología (antenas, espejos).",
    meta_aprendizaje: META,
    categoria: "Geometría analítica",
    subcategoria: "Cónicas: circunferencia y parábola",
    ejes_articuladores: ["Pensamiento matemático y científico"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
] as const;

export async function seedPMIV(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed PM-IV (propósitos oficiales 2025)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac").select("id").eq("codigo", "PM-IV").single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC PM-IV no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const rows = PROGRESIONES_PMIV.map((p) => ({
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
  if (error) throw new Error(`Error seeding PM-IV: ${error.message}`);
  console.log(`  ✓ ${rows.length} propósitos formativos de PM-IV (es_placeholder=false)`);
  console.log("\n✅ Seed PM-IV completado: 7 propósitos oficiales insertados.\n");
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
  seedPMIV(sb).catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
}

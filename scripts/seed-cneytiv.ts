/**
 * Seed de propósitos formativos oficiales para CNEYT-IV (Ciencias Naturales, Experimentales y Tecnología IV — Química).
 * Fuente: docs/programas-oficiales/extraidos/03-CIENCIAS-NATURALES.md
 *         PDF: 2025_MCC_CIENCIAS NATURALES_BN.pdf — Modelo Educativo 2025
 *
 * Uso: npx tsx scripts/seed-cneytiv.ts
 * Idempotente: upsert por campo "codigo".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

const META = "Comprenda la química como herramienta para explicar la transformación de la materia, analizando reacciones químicas, el comportamiento de ácidos y bases, los compuestos orgánicos y las biomoléculas esenciales para la vida.";

const PROGRESIONES_CNEYTIV = [
  {
    codigo: "CNEYT-IV-P01",
    numero: 1,
    titulo: "Interpreta y balancea ecuaciones químicas aplicando la ley de conservación de la masa.",
    descripcion: "Interpreta y balancea ecuaciones químicas aplicando la ley de conservación de la masa.",
    descripcion_extendida: "Interpreta y balancea ecuaciones químicas aplicando la ley de conservación de la masa. Contenidos: representación de reactivos y productos; coeficientes estequiométricos; método de tanteo e inspección; método algebraico de balanceo; verificación de la conservación de masa y átomos; introducción a la estequiometría básica: cálculo de cantidades de reactivos y productos en una reacción.",
    meta_aprendizaje: META,
    categoria: "Química inorgánica",
    subcategoria: "Ecuaciones y balanceo",
    ejes_articuladores: ["Pensamiento matemático y científico"],
    transversalidades: ["PM-IV"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-IV-P02",
    numero: 2,
    titulo: "Clasifica los tipos de reacciones químicas y predice sus productos.",
    descripcion: "Clasifica los tipos de reacciones químicas y predice sus productos.",
    descripcion_extendida: "Clasifica los tipos de reacciones químicas y predice sus productos. Contenidos: reacciones de síntesis o combinación; reacciones de descomposición; reacciones de desplazamiento simple y doble; reacciones de combustión; reacciones de oxidación-reducción (redox) básicas; predicción de productos a partir del tipo de reacción y características de los reactivos; ejemplos en contextos cotidianos e industriales.",
    meta_aprendizaje: META,
    categoria: "Química inorgánica",
    subcategoria: "Tipos de reacciones",
    ejes_articuladores: ["Pensamiento matemático y científico"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-IV-P03",
    numero: 3,
    titulo: "Analiza el concepto de pH y la importancia de los ácidos y bases en contextos cotidianos y biológicos.",
    descripcion: "Analiza el pH y la importancia de los ácidos y bases en contextos cotidianos y biológicos.",
    descripcion_extendida: "Analiza el concepto de pH y la importancia de los ácidos y bases en contextos cotidianos y biológicos. Contenidos: teorías ácido-base (Arrhenius, Brønsted-Lowry); escala de pH: medición con indicadores (papel tornasol, fenolftaleína, indicador universal) y pHmetro; soluciones ácidas, básicas y neutras; reacciones de neutralización y sales; regulación del pH en sistemas biológicos (sangre, saliva); pH de productos domésticos; aplicaciones en medicina, agricultura e industria.",
    meta_aprendizaje: META,
    categoria: "Ácidos y bases",
    subcategoria: "pH y neutralización",
    ejes_articuladores: ["Pensamiento matemático y científico", "Sustentabilidad"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-IV-P04",
    numero: 4,
    titulo: "Describe las propiedades y reactividad de los compuestos orgánicos básicos (alcanos, alquenos, alcoholes, ácidos carboxílicos).",
    descripcion: "Describe las propiedades y reactividad de los compuestos orgánicos básicos.",
    descripcion_extendida: "Describe las propiedades y reactividad de los compuestos orgánicos básicos (alcanos, alquenos, alcoholes, ácidos carboxílicos). Contenidos: enlace carbono-carbono simple, doble y triple; grupos funcionales como determinantes de reactividad; nomenclatura IUPAC básica para alcanos, alquenos, alcoholes y ácidos carboxílicos; propiedades físicas (punto de ebullición, solubilidad, polaridad) en función del grupo funcional; reacciones características: combustión, adición, sustitución, esterificación; ejemplos en la vida cotidiana (etanol, ácido acético, propano).",
    meta_aprendizaje: META,
    categoria: "Química orgánica",
    subcategoria: "Grupos funcionales y nomenclatura",
    ejes_articuladores: ["Pensamiento matemático y científico"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-IV-P05",
    numero: 5,
    titulo: "Identifica las biomoléculas (carbohidratos, lípidos, proteínas, ácidos nucleicos) y sus funciones biológicas.",
    descripcion: "Identifica las biomoléculas y sus funciones biológicas.",
    descripcion_extendida: "Identifica las biomoléculas (carbohidratos, lípidos, proteínas, ácidos nucleicos) y sus funciones biológicas. Contenidos: carbohidratos: monosacáridos, disacáridos y polisacáridos; funciones energética y estructural; lípidos: triglicéridos, fosfolípidos y esteroides; proteínas: aminoácidos, enlace peptídico, niveles de organización y funciones enzimáticas, estructurales y de transporte; ácidos nucleicos: ADN y ARN, monómeros y función informacional; relación entre la estructura química y la función biológica de cada biomolécula.",
    meta_aprendizaje: META,
    categoria: "Química orgánica",
    subcategoria: "Biomoléculas",
    ejes_articuladores: ["Pensamiento matemático y científico"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-IV-P06",
    numero: 6,
    titulo: "Relaciona la química orgánica con la industria farmacéutica, alimentaria y de materiales.",
    descripcion: "Relaciona la química orgánica con la industria farmacéutica, alimentaria y de materiales.",
    descripcion_extendida: "Relaciona la química orgánica con la industria farmacéutica, alimentaria y de materiales. Contenidos: síntesis de fármacos: aspirina, antibióticos, analgésicos; aditivos alimentarios: conservadores, colorantes, edulcorantes y su base química; polímeros sintéticos: nylon, poliéster, polietileno y sus propiedades; materiales avanzados: cauchos sintéticos, adhesivos, pinturas; biotecnología y fermentación industrial; lectura e interpretación de etiquetas de productos comerciales; debate sobre el rol social de la industria química.",
    meta_aprendizaje: META,
    categoria: "Química orgánica",
    subcategoria: "Química aplicada e industria",
    ejes_articuladores: ["Pensamiento matemático y científico", "Sustentabilidad"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-IV-P07",
    numero: 7,
    titulo: "Evalúa el impacto de los contaminantes químicos y los plásticos en el ambiente.",
    descripcion: "Evalúa el impacto de los contaminantes químicos y los plásticos en el ambiente.",
    descripcion_extendida: "Evalúa el impacto de los contaminantes químicos y los plásticos en el ambiente. Contenidos: tipos de contaminantes: orgánicos persistentes (POPs), metales pesados, plaguicidas; ciclo de vida del plástico: producción, uso y disposición final; microplásticos en ecosistemas acuáticos y terrestres; lluvia ácida: formación química y efectos; eutrofización de cuerpos de agua; normativa ambiental en México (NOM) sobre contaminantes; alternativas: bioplásticos, economía circular, reducción y reciclaje; análisis de casos locales y globales con evidencia científica.",
    meta_aprendizaje: META,
    categoria: "Química ambiental",
    subcategoria: "Contaminación y plásticos",
    ejes_articuladores: ["Sustentabilidad", "Pensamiento crítico"],
    transversalidades: ["CS-III"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-IV-P08",
    numero: 8,
    titulo: "Diseña y realiza experimentos sencillos de química con materiales accesibles.",
    descripcion: "Diseña y realiza experimentos sencillos de química con materiales accesibles.",
    descripcion_extendida: "Diseña y realiza experimentos sencillos de química con materiales accesibles. Contenidos: metodología experimental: planteamiento de hipótesis, variables independiente y dependiente, control de variables; protocolos de seguridad en el laboratorio: manejo de sustancias, EPP, gestión de residuos; experimentos propuestos: determinación de pH de soluciones caseras, reacciones de neutralización (vinagre y bicarbonato), identificación de almidón con lugol, preparación de indicadores naturales (col morada); registro, análisis e interpretación de datos; comunicación de resultados mediante reporte escrito o presentación.",
    meta_aprendizaje: META,
    categoria: "Metodología científica",
    subcategoria: "Experimentación en química",
    ejes_articuladores: ["Pensamiento matemático y científico"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
] as const;

export async function seedCNEYTIV(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed CNEYT-IV (propósitos oficiales 2025)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac").select("id").eq("codigo", "CNEYT-IV").single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC CNEYT-IV no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const rows = PROGRESIONES_CNEYTIV.map((p) => ({
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
  if (error) throw new Error(`Error seeding CNEYT-IV: ${error.message}`);
  console.log(`  ✓ ${rows.length} propósitos formativos de CNEYT-IV (es_placeholder=false)`);
  console.log("\n✅ Seed CNEYT-IV completado: 8 propósitos oficiales insertados.\n");
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
  seedCNEYTIV(sb).catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
}

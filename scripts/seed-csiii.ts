/**
 * Seed de propósitos formativos oficiales para CS-III (Ciencias Sociales III, Semestre 4).
 * Fuente: docs/programas-oficiales/extraidos/06-CIENCIAS-SOCIALES.md
 *         PDF: 2025_MCC_CIENCIAS SOCIALES_BN.pdf — Modelo Educativo 2025
 *
 * Uso: npx tsx scripts/seed-csiii.ts
 * Idempotente: upsert por campo "codigo".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

const META = "Analice su papel como sujeto joven en contextos de crisis y conflictividad social, comprendiendo las políticas públicas, los actores sociales y las formas de participación juvenil como herramientas de transformación.";

const PROGRESIONES_CSIII = [
  {
    codigo: "CS-III-P01",
    numero: 1,
    titulo: "Analiza situaciones de crisis social desde múltiples escalas e identifica causas estructurales y actores involucrados.",
    descripcion: "Analiza situaciones de crisis social —económica, ambiental, sanitaria, de violencia— desde múltiples escalas y perspectivas, identificando sus causas estructurales y actores involucrados.",
    descripcion_extendida: "Analiza situaciones de crisis social —económica, ambiental, sanitaria, de violencia— desde múltiples escalas (local, nacional, global) y perspectivas disciplinares, identificando sus causas estructurales y los actores involucrados. Contenidos: concepto de crisis social y sus dimensiones (económica, ambiental, sanitaria, de violencia); análisis multicausal: factores históricos, políticos, económicos y culturales; actores sociales: Estado, mercado, sociedad civil, organismos internacionales; escalas de análisis: local, regional, nacional, global; casos paradigmáticos en México y América Latina.",
    meta_aprendizaje: META,
    categoria: "Crisis y análisis social",
    subcategoria: "Crisis sociales y análisis multicausal",
    ejes_articuladores: ["Pensamiento crítico", "Sustentabilidad"],
    transversalidades: ["CH-I", "CNEYT-IV"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CS-III-P02",
    numero: 2,
    titulo: "Examina el diseño, implementación y evaluación de políticas públicas como respuesta institucional a problemas sociales.",
    descripcion: "Examina el diseño, implementación y evaluación de políticas públicas como respuesta institucional a problemas sociales, y valora la participación ciudadana en dicho proceso.",
    descripcion_extendida: "Examina el diseño, implementación y evaluación de políticas públicas como respuesta institucional a problemas sociales, y valora el papel de la participación ciudadana en dicho proceso. Contenidos: ciclo de las políticas públicas: diagnóstico, diseño, implementación, evaluación y retroalimentación; actores del proceso: gobierno, organismos internacionales, ONG, ciudadanía; análisis de casos concretos en México (política de salud, educación, seguridad, medio ambiente); participación ciudadana: consulta, veeduría social, contraloría ciudadana; transparencia y rendición de cuentas como mecanismos democráticos.",
    meta_aprendizaje: META,
    categoria: "Políticas públicas y ciudadanía",
    subcategoria: "Políticas públicas y participación ciudadana",
    ejes_articuladores: ["Vida democrática y ciudadanía", "Pensamiento crítico"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CS-III-P03",
    numero: 3,
    titulo: "Reconoce a las juventudes como sujetos históricos y políticos con agencia propia y explora formas de participación juvenil.",
    descripcion: "Reconoce a las juventudes como sujetos históricos y políticos con agencia propia, explorando formas de participación juvenil —electoral, comunitaria, cultural, digital— para incidir en su realidad.",
    descripcion_extendida: "Reconoce a las juventudes como sujetos históricos y políticos con agencia propia, explorando diversas formas de participación juvenil —electoral, comunitaria, cultural y digital— como vías para incidir en su realidad social. Contenidos: identidades juveniles: diversidad, interseccionalidad, culturas juveniles; violencias que enfrentan las juventudes: discriminación, acoso, violencia de género; derechos de las juventudes en el marco legal mexicano e internacional; organizaciones y movimientos juveniles en México y América Latina; participación política juvenil: voto joven, movimientos estudiantiles; redes sociales como espacio político y de organización; participación comunitaria y cultural como ejercicio de ciudadanía activa.",
    meta_aprendizaje: META,
    categoria: "Juventudes y agencia política",
    subcategoria: "Participación política juvenil",
    ejes_articuladores: ["Vida democrática y ciudadanía", "Pensamiento crítico"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
] as const;

export async function seedCSIII(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed CS-III (propósitos oficiales 2025)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac").select("id").eq("codigo", "CS-III").single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC CS-III no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const rows = PROGRESIONES_CSIII.map((p) => ({
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
  if (error) throw new Error(`Error seeding CS-III: ${error.message}`);
  console.log(`  ✓ ${rows.length} propósitos formativos de CS-III (es_placeholder=false)`);
  console.log("\n✅ Seed CS-III completado: 3 propósitos oficiales insertados.\n");
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
  seedCSIII(sb).catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
}

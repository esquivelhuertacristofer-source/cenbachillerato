/**
 * Seed de propósitos formativos oficiales para LC-II (Lengua y Comunicación II).
 * Fuente: docs/programas-oficiales/extraidos/08-LENGUA-COMUNICACION.md
 *         PDF: vf_MCC_LENGUA Y COMUNICACION_BN.pdf — Modelo Educativo 2025
 *
 * Uso: npx tsx scripts/seed-lcii.ts
 * Idempotente: upsert por campo "codigo".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

const META = "Reconozca sus capacidades creativas y comunicativas en la elaboración de textos libres.";

const PROGRESIONES_LCII = [
  {
    codigo: "LC-II-P01",
    numero: 1,
    titulo: "Narra situaciones de su historia de vida para compartir cómo han dejado una huella en su persona.",
    descripcion: "Narra situaciones de su historia de vida para compartir cómo han dejado una huella en su persona.",
    descripcion_extendida: "Narra situaciones de su historia de vida para compartir cómo han dejado una huella en su persona. Contenidos: narración y descripción de situaciones vividas; diálogo y reflexión colectiva; la escritura como posibilidad de desarrollo del pensamiento humano y la empatía.",
    meta_aprendizaje: META,
    categoria: "Oralidad y escritura",
    subcategoria: "Narración autobiográfica",
    ejes_articuladores: ["Apropiación de las culturas a través de la lectura y la escritura", "Pensamiento crítico"],
    transversalidades: ["CS-II"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "LC-II-P02",
    numero: 2,
    titulo: "Escribe un texto descriptivo o narrativo de su autoría.",
    descripcion: "Escribe un texto descriptivo o narrativo de su autoría.",
    descripcion_extendida: "Escribe un texto descriptivo o narrativo de su autoría. Contenidos: organización de ideas para la escritura; delimitación del sentido comunicativo; ficción y realidad; trama, conflicto o situación; tonos narrativos: humorístico, dramático, irónico.",
    meta_aprendizaje: META,
    categoria: "Escritura",
    subcategoria: "Texto propio",
    ejes_articuladores: ["Apropiación de las culturas a través de la lectura y la escritura", "Pensamiento crítico"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "LC-II-P03",
    numero: 3,
    titulo: "Identifica características lingüísticas a partir de la lectura de narrativas populares.",
    descripcion: "Identifica características lingüísticas a partir de la lectura de narrativas populares.",
    descripcion_extendida: "Identifica características lingüísticas a partir de la lectura de narrativas populares. Contenidos: narrativas populares (cómics, creepypastas, cuentos, obras de teatro, leyendas y mitos); características formales: léxico, sintaxis, registros de habla.",
    meta_aprendizaje: META,
    categoria: "Lectura",
    subcategoria: "Características lingüísticas",
    ejes_articuladores: ["Apropiación de las culturas a través de la lectura y la escritura", "Interculturalidad crítica"],
    transversalidades: ["CS-II"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "LC-II-P04",
    numero: 4,
    titulo: "Comprende, a partir de la exploración de diversos textos, la relevancia de personajes y escenarios en la narrativa popular, para desarrollar elementos que pueda integrar en sus propios escritos.",
    descripcion: "Comprende la relevancia de personajes y escenarios en la narrativa popular para integrarlos en sus propios escritos.",
    descripcion_extendida: "Comprende, a partir de la exploración de diversos textos, la relevancia de personajes y escenarios en la narrativa popular, para desarrollar elementos que pueda integrar en sus propios escritos. Contenidos: caracterización de personajes: tipología, relaciones, construcción narrativa; narraciones realistas, fantásticas, históricas y autobiográficas.",
    meta_aprendizaje: META,
    categoria: "Lectura",
    subcategoria: "Narrativa popular",
    ejes_articuladores: ["Apropiación de las culturas a través de la lectura y la escritura", "Interculturalidad crítica"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "LC-II-P05",
    numero: 5,
    titulo: "Distingue los temas y las ideas centrales y secundarias en las narrativas populares, para reconocer su papel en las distintas expresiones.",
    descripcion: "Distingue los temas y las ideas centrales y secundarias en las narrativas populares.",
    descripcion_extendida: "Distingue los temas y las ideas centrales y secundarias en las narrativas populares, para reconocer su papel en las distintas expresiones. Contenidos: tema e ideas centrales y secundarias; conectores textuales; jerarquías en la narración; reescritura y adaptaciones modernas de narrativas tradicionales.",
    meta_aprendizaje: META,
    categoria: "Lectura",
    subcategoria: "Tema e ideas",
    ejes_articuladores: ["Apropiación de las culturas a través de la lectura y la escritura", "Pensamiento crítico"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "LC-II-P06",
    numero: 6,
    titulo: "Reescribe un texto para integrar los elementos lingüísticos y narrativos que considere pertinentes.",
    descripcion: "Reescribe un texto para integrar los elementos lingüísticos y narrativos que considere pertinentes.",
    descripcion_extendida: "Reescribe un texto para integrar los elementos lingüísticos y narrativos que considere pertinentes. Contenidos: reescritura y adaptaciones; integración de elementos narrativos (personaje, escenario, trama, tono); uso de conectores y recursos lingüísticos en la narración.",
    meta_aprendizaje: META,
    categoria: "Escritura",
    subcategoria: "Reescritura",
    ejes_articuladores: ["Apropiación de las culturas a través de la lectura y la escritura"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "LC-II-P07",
    numero: 7,
    titulo: "Colabora en el análisis de textos para conocer, aprovechar o corregir los procedimientos narrativos.",
    descripcion: "Colabora en el análisis de textos para conocer, aprovechar o corregir los procedimientos narrativos.",
    descripcion_extendida: "Colabora en el análisis de textos para conocer, aprovechar o corregir los procedimientos narrativos. Contenidos: análisis colaborativo de textos; identificación de procedimientos narrativos; revisión y retroalimentación entre pares; criterios de calidad narrativa.",
    meta_aprendizaje: META,
    categoria: "Lectura y escritura",
    subcategoria: "Análisis colaborativo",
    ejes_articuladores: ["Apropiación de las culturas a través de la lectura y la escritura", "Pensamiento crítico"],
    transversalidades: ["CD-II"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "LC-II-P08",
    numero: 8,
    titulo: "Integra prácticas de lectura, escritura y oralidad en proyectos creativos para presentar el texto elaborado.",
    descripcion: "Integra prácticas de lectura, escritura y oralidad en proyectos creativos para presentar el texto elaborado.",
    descripcion_extendida: "Integra prácticas de lectura, escritura y oralidad en proyectos creativos para presentar el texto elaborado. Contenidos: producción de guion para podcast u otro formato digital; grabación, edición; elementos extralingüísticos; integración de lo aprendido en un producto creativo multimodal.",
    meta_aprendizaje: META,
    categoria: "Proyecto integrador",
    subcategoria: "Multimodalidad",
    ejes_articuladores: ["Apropiación de las culturas a través de la lectura y la escritura", "Pensamiento crítico"],
    transversalidades: ["CD-II"],
    tiempo_estimado_horas: 3,
  },
] as const;

export async function seedLCII(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed LC-II (propósitos oficiales 2025)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac").select("id").eq("codigo", "LC-II").single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC LC-II no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const rows = PROGRESIONES_LCII.map((p) => ({
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
  if (error) throw new Error(`Error seeding LC-II: ${error.message}`);
  console.log(`  ✓ ${rows.length} propósitos formativos de LC-II (es_placeholder=false)`);
  console.log("\n✅ Seed LC-II completado.\n");
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
  seedLCII(sb).catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
}

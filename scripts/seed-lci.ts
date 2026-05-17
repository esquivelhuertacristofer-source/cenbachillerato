/**
 * Seed de propósitos formativos oficiales para LC-I (Lengua y Comunicación I).
 * Fuente: docs/programas-oficiales/extraidos/08-LENGUA-COMUNICACION.md
 *         PDF: vf_MCC_LENGUA Y COMUNICACION_BN.pdf — Modelo Educativo 2025
 *
 * Uso: npx tsx scripts/seed-lci.ts
 * Idempotente: upsert por campo "codigo".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

const META = "Identifique la lectura y la escritura como actos colectivos de la experiencia humana útiles en la reflexión, comunicación y problematización del mundo circundante, y utilice algunos rasgos importantes para la escritura de textos propios.";

const PROGRESIONES_LCI = [
  {
    codigo: "LC-I-P01",
    numero: 1,
    titulo: "Reflexiona sobre los vínculos entre la escritura y la lectura para dar sentido a la necesidad humana por comunicar información, ideas, pensamientos u opiniones.",
    descripcion: "Reflexiona sobre los vínculos entre la escritura y la lectura para dar sentido a la necesidad humana por comunicar información, ideas, pensamientos u opiniones.",
    descripcion_extendida: "Reflexiona sobre los vínculos entre la escritura y la lectura para dar sentido a la necesidad humana por comunicar información, ideas, pensamientos u opiniones. Contenidos: la escritura como posibilidad de desarrollo del pensamiento humano, la empatía y la comunicación; la lectura como experiencia de diálogo y de placer individual o compartido.",
    meta_aprendizaje: META,
    categoria: "Lectura y escritura como prácticas sociales",
    subcategoria: "Escritura y pensamiento",
    ejes_articuladores: ["Apropiación de las culturas a través de la lectura y la escritura", "Pensamiento crítico"],
    transversalidades: ["CS-I"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "LC-I-P02",
    numero: 2,
    titulo: "Investiga los gustos y las inclinaciones de las personas de su comunidad escolar respecto de la lectura y la escritura para conocer la diversidad de textos.",
    descripcion: "Investiga los gustos y las inclinaciones de las personas de su comunidad escolar respecto de la lectura y la escritura para conocer la diversidad de textos.",
    descripcion_extendida: "Investiga los gustos y las inclinaciones de las personas de su comunidad escolar respecto de la lectura y la escritura para conocer la diversidad de textos. Contenidos: diversidad de textos escritos (soportes, formatos, características generales).",
    meta_aprendizaje: META,
    categoria: "Lectura y escritura como prácticas sociales",
    subcategoria: "Diversidad de textos",
    ejes_articuladores: ["Apropiación de las culturas a través de la lectura y la escritura", "Interculturalidad crítica"],
    transversalidades: ["CD-I"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "LC-I-P03",
    numero: 3,
    titulo: "Analiza en textos de su elección la información, ideas, pensamientos y opiniones, para comprender la importancia de transmitir con claridad las ideas en textos escritos.",
    descripcion: "Analiza en textos de su elección la información, ideas, pensamientos y opiniones, para comprender la importancia de transmitir con claridad las ideas en textos escritos.",
    descripcion_extendida: "Analiza en textos de su elección la información, ideas, pensamientos y opiniones, para comprender la importancia de transmitir con claridad las ideas en textos escritos. Contenidos: propiedades del texto (claridad, coherencia, concordancia). Transversal con CS-I P.4: analizar textos sobre desigualdad y diversidad democrática.",
    meta_aprendizaje: META,
    categoria: "Lectura y escritura como prácticas sociales",
    subcategoria: "Propiedades del texto",
    ejes_articuladores: ["Apropiación de las culturas a través de la lectura y la escritura", "Pensamiento crítico"],
    transversalidades: ["CS-I"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "LC-I-P04",
    numero: 4,
    titulo: "Reconoce los tipos de párrafos a partir de la exploración de diversos textos, para contrastar su estructura y diferenciar sus rasgos.",
    descripcion: "Reconoce los tipos de párrafos a partir de la exploración de diversos textos, para contrastar su estructura y diferenciar sus rasgos.",
    descripcion_extendida: "Reconoce los tipos de párrafos a partir de la exploración de diversos textos, para contrastar su estructura y diferenciar sus rasgos. Contenidos: párrafos descriptivos, narrativos y argumentativos; estructura y rasgos diferenciales.",
    meta_aprendizaje: META,
    categoria: "Escritura",
    subcategoria: "Tipos de párrafos",
    ejes_articuladores: ["Apropiación de las culturas a través de la lectura y la escritura"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "LC-I-P05",
    numero: 5,
    titulo: "Identifica información de un texto que lee para resaltar los elementos significativos.",
    descripcion: "Identifica información de un texto que lee para resaltar los elementos significativos.",
    descripcion_extendida: "Identifica información de un texto que lee para resaltar los elementos significativos. Contenidos: ideas principales y secundarias; elementos paratextuales.",
    meta_aprendizaje: META,
    categoria: "Lectura",
    subcategoria: "Comprensión lectora",
    ejes_articuladores: ["Apropiación de las culturas a través de la lectura y la escritura", "Pensamiento crítico"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "LC-I-P06",
    numero: 6,
    titulo: "Analiza la concordancia y el uso de conectores a partir de la lectura de un texto para destacar su importancia.",
    descripcion: "Analiza la concordancia y el uso de conectores a partir de la lectura de un texto para destacar su importancia.",
    descripcion_extendida: "Analiza la concordancia y el uso de conectores a partir de la lectura de un texto para destacar su importancia. Contenidos: conectores causales, comparativos y de adición; puntuación y sintaxis.",
    meta_aprendizaje: META,
    categoria: "Escritura",
    subcategoria: "Conectores y sintaxis",
    ejes_articuladores: ["Apropiación de las culturas a través de la lectura y la escritura"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "LC-I-P07",
    numero: 7,
    titulo: "Practica la lectura en voz alta de algunos textos para luego emitir opiniones al respecto.",
    descripcion: "Practica la lectura en voz alta de algunos textos para luego emitir opiniones al respecto.",
    descripcion_extendida: "Practica la lectura en voz alta de algunos textos para luego emitir opiniones al respecto. Contenidos: lectura como experiencia de diálogo; expresión oral de opiniones fundamentadas.",
    meta_aprendizaje: META,
    categoria: "Oralidad",
    subcategoria: "Lectura en voz alta y opinión",
    ejes_articuladores: ["Apropiación de las culturas a través de la lectura y la escritura", "Pensamiento crítico"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "LC-I-P08",
    numero: 8,
    titulo: "Identifica las características de una exposición oral para conocer su desarrollo y ponerlo en práctica.",
    descripcion: "Identifica las características de una exposición oral para conocer su desarrollo y ponerlo en práctica.",
    descripcion_extendida: "Identifica las características de una exposición oral para conocer su desarrollo y ponerlo en práctica. Contenidos: exposición oral (planeación, acompañamiento, ejecución); recursos de apoyo (diapositivas, mapas mentales).",
    meta_aprendizaje: META,
    categoria: "Oralidad",
    subcategoria: "Exposición oral",
    ejes_articuladores: ["Apropiación de las culturas a través de la lectura y la escritura"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
] as const;

export async function seedLCI(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed LC-I (propósitos oficiales 2025)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac").select("id").eq("codigo", "LC-I").single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC LC-I no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const rows = PROGRESIONES_LCI.map((p) => ({
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
  if (error) throw new Error(`Error seeding LC-I: ${error.message}`);
  console.log(`  ✓ ${rows.length} propósitos formativos de LC-I (es_placeholder=false)`);
  console.log("\n✅ Seed LC-I completado.\n");
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
  seedLCI(sb).catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
}

/**
 * Seed de propósitos formativos oficiales para IN-I (Inglés I).
 * Fuente: docs/programas-oficiales/extraidos/07-INGLES.md
 *         PDF: vf_MCC_INGLES_BN.pdf — Modelo Educativo 2025
 *
 * Uso: npx tsx scripts/seed-ini.ts
 * Idempotente: upsert por campo "codigo".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

const META = "Reconozca y comprenda palabras, frases y expresiones básicas para presentarse, interactuar en el aula y hablar de su entorno inmediato.";

const PROGRESIONES_INI = [
  {
    codigo: "IN-I-P01",
    numero: 1,
    titulo: "Se presenta y presenta a otras personas en distintos contextos sociales y culturales (saluda y comparte información básica con respeto e inclusión).",
    descripcion: "Se presenta y presenta a otras personas en distintos contextos sociales y culturales (saluda y comparte información básica con respeto e inclusión).",
    descripcion_extendida: "Se presenta y presenta a otras personas en distintos contextos sociales y culturales (saluda y comparte información básica con respeto e inclusión). Contenidos: verbo to be; pronombres personales; saludos formales e informales; información personal.",
    meta_aprendizaje: META,
    categoria: "Comunicación interpersonal",
    subcategoria: "Presentaciones y saludos",
    ejes_articuladores: ["Inclusión", "Interculturalidad crítica"],
    transversalidades: ["LC-I"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "IN-I-P02",
    numero: 2,
    titulo: "Sigue indicaciones y participa en interacciones básicas dentro del aula (pide permiso, aclara dudas y responde a instrucciones).",
    descripcion: "Sigue indicaciones y participa en interacciones básicas dentro del aula (pide permiso, aclara dudas y responde a instrucciones).",
    descripcion_extendida: "Sigue indicaciones y participa en interacciones básicas dentro del aula (pide permiso, aclara dudas y responde a instrucciones). Contenidos: imperativos; verbos frecuentes (open, close, read, listen); expresiones útiles para el aula.",
    meta_aprendizaje: META,
    categoria: "Comunicación interpersonal",
    subcategoria: "Interacciones en el aula",
    ejes_articuladores: ["Inclusión"],
    transversalidades: ["LC-I"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "IN-I-P03",
    numero: 3,
    titulo: "Identifica y describe objetos y espacios cotidianos del hogar o la escuela (reconoce características como forma, color y tamaño).",
    descripcion: "Identifica y describe objetos y espacios cotidianos del hogar o la escuela (reconoce características como forma, color y tamaño).",
    descripcion_extendida: "Identifica y describe objetos y espacios cotidianos del hogar o la escuela (reconoce características como forma, color y tamaño). Contenidos: sustantivos comunes; artículos (the, a, an); adjetivos comunes; demostrativos (this, that, these, those); there is/are.",
    meta_aprendizaje: META,
    categoria: "Descripción y vocabulario",
    subcategoria: "Objetos y espacios cotidianos",
    ejes_articuladores: ["Interculturalidad crítica"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "IN-I-P04",
    numero: 4,
    titulo: "Solicita y proporciona información personal básica en contextos escolares y comunitarios (nombre, edad, nacionalidad, teléfono, dirección, correo).",
    descripcion: "Solicita y proporciona información personal básica en contextos escolares y comunitarios (nombre, edad, nacionalidad, teléfono, dirección, correo).",
    descripcion_extendida: "Solicita y proporciona información personal básica en contextos escolares y comunitarios (nombre, edad, nacionalidad, teléfono, dirección, correo). Contenidos: números cardinales y ordinales; países y nacionalidades; preguntas con wh- (what, where, who).",
    meta_aprendizaje: META,
    categoria: "Comunicación interpersonal",
    subcategoria: "Información personal",
    ejes_articuladores: ["Inclusión", "Interculturalidad crítica"],
    transversalidades: ["LC-I", "CS-I"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "IN-I-P05",
    numero: 5,
    titulo: "Hace preguntas sencillas para obtener información general (ubicación, horarios).",
    descripcion: "Hace preguntas sencillas para obtener información general (ubicación, horarios).",
    descripcion_extendida: "Hace preguntas sencillas para obtener información general (ubicación, horarios). Contenidos: preguntas con wh- (when, how); preposiciones de tiempo y lugar; lugares de la comunidad.",
    meta_aprendizaje: META,
    categoria: "Comunicación interpersonal",
    subcategoria: "Preguntas y solicitudes de información",
    ejes_articuladores: ["Inclusión"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "IN-I-P06",
    numero: 6,
    titulo: "Describe personas, vestimenta y clima en contextos cotidianos, respetando la diversidad.",
    descripcion: "Describe personas, vestimenta y clima en contextos cotidianos, respetando la diversidad.",
    descripcion_extendida: "Describe personas, vestimenta y clima en contextos cotidianos, respetando la diversidad. Contenidos: adjetivos físicos; there is/are; pronombres posesivos; vocabulario de vestimenta y clima.",
    meta_aprendizaje: META,
    categoria: "Descripción y vocabulario",
    subcategoria: "Descripción de personas y entorno",
    ejes_articuladores: ["Interculturalidad crítica", "Igualdad de género"],
    transversalidades: ["LC-I"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "IN-I-P07",
    numero: 7,
    titulo: "Expresa gustos y opiniones simples en situaciones cotidianas (habla sobre preferencias y razones de forma empática).",
    descripcion: "Expresa gustos y opiniones simples en situaciones cotidianas (habla sobre preferencias y razones de forma empática).",
    descripcion_extendida: "Expresa gustos y opiniones simples en situaciones cotidianas (habla sobre preferencias y razones de forma empática). Contenidos: verbo-ing (gerundio) para gustos; adjetivos; conjunciones; intensificadores (very).",
    meta_aprendizaje: META,
    categoria: "Comunicación interpersonal",
    subcategoria: "Gustos y preferencias",
    ejes_articuladores: ["Interculturalidad crítica"],
    transversalidades: ["LC-I"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "IN-I-P08",
    numero: 8,
    titulo: "Expresa pertenencia de forma clara y respetuosa (pregunta y responde sobre posesión con el genitivo y los pronombres posesivos).",
    descripcion: "Expresa pertenencia de forma clara y respetuosa (pregunta y responde sobre posesión con el genitivo y los pronombres posesivos).",
    descripcion_extendida: "Expresa pertenencia de forma clara y respetuosa (pregunta y responde sobre posesión con el genitivo y los pronombres posesivos). Contenidos: genitivo sajón ('s); adjetivos posesivos; pronombres posesivos (mine, yours, his, hers).",
    meta_aprendizaje: META,
    categoria: "Gramática comunicativa",
    subcategoria: "Posesión y pertenencia",
    ejes_articuladores: ["Inclusión"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
] as const;

export async function seedINI(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed IN-I (propósitos oficiales 2025)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac").select("id").eq("codigo", "IN-I").single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC IN-I no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const rows = PROGRESIONES_INI.map((p) => ({
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
  if (error) throw new Error(`Error seeding IN-I: ${error.message}`);
  console.log(`  ✓ ${rows.length} propósitos formativos de IN-I (es_placeholder=false)`);
  console.log("\n✅ Seed IN-I completado.\n");
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
  seedINI(sb).catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
}

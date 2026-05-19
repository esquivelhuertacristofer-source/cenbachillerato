/**
 * Seed de propósitos formativos oficiales para IN-III (Inglés III — A2).
 * Fuente: docs/programas-oficiales/extraidos/07-INGLES.md
 *         PDF: vf_MCC_INGLES_BN.pdf — Modelo Educativo 2025
 *
 * Uso: npx tsx scripts/seed-iniii.ts
 * Idempotente: upsert por campo "codigo".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

const META = "Participe en intercambios sociales básicos, exprese ideas sobre experiencias personales y amplíe su repertorio comunicativo en contextos cotidianos escolares y comunitarios.";

const PROGRESIONES_INIII = [
  {
    codigo: "IN-III-P01",
    numero: 1,
    titulo: "Habla sobre rutinas pasadas y recientes en la vida cotidiana (describe lo que hizo en días recientes o durante la semana).",
    descripcion: "Describe rutinas pasadas y recientes usando el pasado simple en inglés.",
    descripcion_extendida: "Habla sobre rutinas pasadas y recientes en la vida cotidiana (describe lo que hizo en días recientes o durante la semana). Contenidos: pasado simple con verbos regulares e irregulares básicos; expresiones de tiempo pasado (yesterday, last week, ago); diferencia entre pasado simple y presente perfecto introductorio.",
    meta_aprendizaje: META,
    categoria: "Comunicación oral",
    subcategoria: "Pasado simple — rutinas",
    ejes_articuladores: ["Prácticas sociales del lenguaje", "Interculturalidad crítica"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "IN-III-P02",
    numero: 2,
    titulo: "Comparte experiencias personales recientes (cuenta qué ha hecho y con quién).",
    descripcion: "Comparte experiencias personales recientes usando el presente perfecto introductorio.",
    descripcion_extendida: "Comparte experiencias personales recientes (cuenta qué ha hecho y con quién). Contenidos: presente perfecto (have/has + past participle): introducción para experiencias personales; contraste presente perfecto vs. pasado simple; vocabulario de actividades y relaciones sociales.",
    meta_aprendizaje: META,
    categoria: "Comunicación oral",
    subcategoria: "Presente perfecto — experiencias",
    ejes_articuladores: ["Prácticas sociales del lenguaje"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "IN-III-P03",
    numero: 3,
    titulo: "Describe lugares conocidos y actividades que se pueden realizar ahí (da información y recomendaciones básicas).",
    descripcion: "Describe lugares y recomienda actividades en inglés usando vocabulario de ubicación.",
    descripcion_extendida: "Describe lugares conocidos y actividades que se pueden realizar ahí (da información y recomendaciones básicas). Contenidos: there is/are revisión; can para posibilidad; preposiciones de lugar (next to, in front of, between, behind); vocabulario de lugares en la comunidad; formas básicas de recomendar.",
    meta_aprendizaje: META,
    categoria: "Comunicación oral y escrita",
    subcategoria: "Descripción de lugares",
    ejes_articuladores: ["Prácticas sociales del lenguaje", "Interculturalidad crítica"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "IN-III-P04",
    numero: 4,
    titulo: "Habla sobre hábitos, frecuencia y preferencias en la vida cotidiana (compara lo que hacen, eligen o prefieren las personas).",
    descripcion: "Habla sobre hábitos y preferencias usando comparativos y superlativos en inglés.",
    descripcion_extendida: "Habla sobre hábitos, frecuencia y preferencias en la vida cotidiana (compara lo que hacen, eligen o prefieren las personas). Contenidos: adverbios de frecuencia revisión; comparativos y superlativos; like + noun/verb-ing; expresiones de preferencia (prefer, would rather); vocabulario de actividades cotidianas.",
    meta_aprendizaje: META,
    categoria: "Comunicación oral",
    subcategoria: "Hábitos y comparación",
    ejes_articuladores: ["Prácticas sociales del lenguaje"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "IN-III-P05",
    numero: 5,
    titulo: "Habla sobre responsabilidades y normas en la casa, la escuela o la comunidad (expresa obligación y prohibición).",
    descripcion: "Expresa obligación y prohibición en inglés usando must/mustn't y have to.",
    descripcion_extendida: "Habla sobre responsabilidades y normas en la casa, la escuela o la comunidad (expresa obligación y prohibición). Contenidos: must / mustn't para reglas y normas; have to / don't have to para obligaciones externas; diferencia entre must y have to; contextos escolares, domésticos y comunitarios.",
    meta_aprendizaje: META,
    categoria: "Comunicación oral",
    subcategoria: "Modales de obligación",
    ejes_articuladores: ["Prácticas sociales del lenguaje", "Vida saludable"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "IN-III-P06",
    numero: 6,
    titulo: "Pide, da y entiende instrucciones más completas (orienta a otra persona para hacer algo o llegar a un lugar).",
    descripcion: "Da y sigue instrucciones más completas usando imperativos y conectores secuenciales en inglés.",
    descripcion_extendida: "Pide, da y entiende instrucciones más completas (orienta a otra persona para hacer algo o llegar a un lugar). Contenidos: imperativos afirmativos y negativos; conectores secuenciales (first, then, after that, next, finally); preposiciones de movimiento; vocabulario de orientación espacial.",
    meta_aprendizaje: META,
    categoria: "Comunicación oral y escrita",
    subcategoria: "Instrucciones y secuencias",
    ejes_articuladores: ["Prácticas sociales del lenguaje"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "IN-III-P07",
    numero: 7,
    titulo: "Relata eventos cotidianos y su secuencia (cuenta algo que pasó usando conectores simples).",
    descripcion: "Relata eventos cotidianos en secuencia usando conectores narrativos en inglés.",
    descripcion_extendida: "Relata eventos cotidianos y su secuencia (cuenta algo que pasó usando conectores simples). Contenidos: pasado simple con verbos irregulares frecuentes; conectores narrativos (then, after, later, suddenly, finally); estructura básica de narración: inicio, nudo, desenlace; vocabulario de emociones y eventos.",
    meta_aprendizaje: META,
    categoria: "Producción escrita",
    subcategoria: "Narración en pasado",
    ejes_articuladores: ["Prácticas sociales del lenguaje", "Apropiación de las culturas a través de la lectura y la escritura"],
    transversalidades: ["LC-III"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "IN-III-P08",
    numero: 8,
    titulo: "Consolida lo aprendido mediante actividades significativas y producción guiada.",
    descripcion: "Consolida los aprendizajes del semestre mediante un proyecto integrador en inglés.",
    descripcion_extendida: "Consolida lo aprendido mediante actividades significativas y producción guiada. Contenidos: revisión integrada de presente perfecto, pasado simple, conectores y modales; producción escrita u oral guiada sobre un tema de interés; autoevaluación de progreso comunicativo en inglés A2.",
    meta_aprendizaje: META,
    categoria: "Proyecto integrador",
    subcategoria: "Consolidación A2",
    ejes_articuladores: ["Prácticas sociales del lenguaje", "Pensamiento crítico"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
] as const;

export async function seedINIII(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed IN-III (propósitos oficiales 2025)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac").select("id").eq("codigo", "IN-III").single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC IN-III no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const rows = PROGRESIONES_INIII.map((p) => ({
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
  if (error) throw new Error(`Error seeding IN-III: ${error.message}`);
  console.log(`  ✓ ${rows.length} propósitos formativos de IN-III (es_placeholder=false)`);
  console.log("\n✅ Seed IN-III completado: 8 propósitos oficiales insertados.\n");
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
  seedINIII(sb).catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
}

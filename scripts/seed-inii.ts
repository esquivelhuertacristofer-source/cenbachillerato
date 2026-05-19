/**
 * Seed de propósitos formativos oficiales para IN-II (Inglés II).
 * Fuente: docs/programas-oficiales/extraidos/07-INGLES.md
 *         Modelo Educativo 2025
 *
 * Uso: npx tsx scripts/seed-inii.ts
 * Idempotente: upsert por campo "codigo".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

const META = "Intercambie información básica sobre su vida cotidiana y su entorno. Participe en interacciones breves y comprensibles que impliquen rutinas sociales, gustos, descripciones simples y necesidades básicas, en contextos escolares y comunitarios.";

const PROGRESIONES_INII = [
  {
    codigo: "IN-II-P01",
    numero: 1,
    titulo: "Describes daily routines and everyday activities at home, school, or in the community.",
    descripcion: "Describes daily routines and everyday activities at home, school, or in the community.",
    descripcion_extendida: "Describes daily routines and everyday activities at home, school, or in the community. Contents: present simple (affirmative, negative, interrogative with do/does); adverbs of frequency; vocabulary for daily routines and time expressions.",
    meta_aprendizaje: META,
    categoria: "Comunicación oral y escrita",
    subcategoria: "Rutinas cotidianas",
    ejes_articuladores: ["Vida saludable", "Pensamiento crítico"],
    transversalidades: ["CS-II"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "IN-II-P02",
    numero: 2,
    titulo: "Talks about what other people do in their free time and when they do it.",
    descripcion: "Talks about what other people do in their free time and when they do it.",
    descripcion_extendida: "Talks about what other people do in their free time and when they do it. Contents: verbs in third person singular; hobbies and leisure activities; time expressions; present simple with he/she/it.",
    meta_aprendizaje: META,
    categoria: "Comunicación oral y escrita",
    subcategoria: "Tiempo libre",
    ejes_articuladores: ["Vida saludable", "Interculturalidad crítica"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "IN-II-P03",
    numero: 3,
    titulo: "Expresses abilities and asks for or gives permission in everyday situations.",
    descripcion: "Expresses abilities and asks for or gives permission in everyday situations.",
    descripcion_extendida: "Expresses abilities and asks for or gives permission in everyday situations. Contents: can / can't for ability and permission; classroom and home rules; polite requests; modal verbs introduction.",
    meta_aprendizaje: META,
    categoria: "Comunicación oral y escrita",
    subcategoria: "Habilidades y permisos",
    ejes_articuladores: ["Vida saludable"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "IN-II-P04",
    numero: 4,
    titulo: "Describes people, clothing, and weather while respecting diversity and cultural context.",
    descripcion: "Describes people, clothing, and weather while respecting diversity and cultural context.",
    descripcion_extendida: "Describes people, clothing, and weather while respecting diversity and cultural context. Contents: have/has for physical descriptions; adjectives of appearance; present continuous for descriptions; weather vocabulary; respecting cultural diversity in descriptions.",
    meta_aprendizaje: META,
    categoria: "Comunicación oral y escrita",
    subcategoria: "Descripción de personas y contexto",
    ejes_articuladores: ["Interculturalidad crítica", "Igualdad de género"],
    transversalidades: ["CS-II"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "IN-II-P05",
    numero: 5,
    titulo: "Compares people, places, and objects in familiar contexts.",
    descripcion: "Compares people, places, and objects in familiar contexts.",
    descripcion_extendida: "Compares people, places, and objects in familiar contexts. Contents: comparative adjectives (bigger than, more interesting than); adjectives with one and two syllables; superlatives introduction; vocabulary for comparison.",
    meta_aprendizaje: META,
    categoria: "Comunicación oral y escrita",
    subcategoria: "Comparación",
    ejes_articuladores: ["Pensamiento crítico"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "IN-II-P06",
    numero: 6,
    titulo: "Asks how to get to a place and gives directions to other people in the community.",
    descripcion: "Asks how to get to a place and gives directions to other people in the community.",
    descripcion_extendida: "Asks how to get to a place and gives directions to other people in the community. Contents: imperatives for directions; prepositions of movement (into, across, next to, between); cardinal points; community vocabulary.",
    meta_aprendizaje: META,
    categoria: "Comunicación oral y escrita",
    subcategoria: "Direcciones y ubicación",
    ejes_articuladores: ["Vida saludable"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "IN-II-P07",
    numero: 7,
    titulo: "Participates in everyday exchanges about personal or community needs, expressing desires and showing empathy.",
    descripcion: "Participates in everyday exchanges about personal or community needs, expressing desires and showing empathy.",
    descripcion_extendida: "Participates in everyday exchanges about personal or community needs, expressing desires and showing empathy. Contents: would like + noun/infinitive; how much/how many; countable and uncountable nouns; expressing preferences and empathy.",
    meta_aprendizaje: META,
    categoria: "Comunicación oral y escrita",
    subcategoria: "Necesidades y deseos",
    ejes_articuladores: ["Vida saludable", "Interculturalidad crítica"],
    transversalidades: ["CS-II"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "IN-II-P08",
    numero: 8,
    titulo: "Consolidates key learnings in school and community contexts through guided and integrative activities.",
    descripcion: "Consolidates key learnings in school and community contexts through guided and integrative activities.",
    descripcion_extendida: "Consolidates key learnings in school and community contexts through guided and integrative activities. Contents: review of all Inglés II structures; cardinal and ordinal numbers; spelling review; integrated communicative tasks; self-assessment of progress.",
    meta_aprendizaje: META,
    categoria: "Consolidación",
    subcategoria: "Integración de aprendizajes",
    ejes_articuladores: ["Vida saludable", "Pensamiento crítico"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
] as const;

export async function seedINII(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed IN-II (propósitos oficiales 2025)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac").select("id").eq("codigo", "IN-II").single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC IN-II no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const rows = PROGRESIONES_INII.map((p) => ({
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
  if (error) throw new Error(`Error seeding IN-II: ${error.message}`);
  console.log(`  ✓ ${rows.length} propósitos formativos de IN-II (es_placeholder=false)`);
  console.log("\n✅ Seed IN-II completado.\n");
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
  seedINII(sb).catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
}

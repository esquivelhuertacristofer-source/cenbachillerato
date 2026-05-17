/**
 * Seed de propósitos formativos oficiales para PFH-I (Pensamiento Filosófico y Humanidades I).
 * Fuente: docs/programas-oficiales/extraidos/04-PENSAMIENTO-FILOSOFICO.md
 *         PDF: 2025_MCC_PENSAMIENTO FILOSOFICO_BN.pdf — Modelo Educativo 2025
 *
 * Uso: npx tsx scripts/seed-pfhi.ts
 * Idempotente: upsert por campo "codigo".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

const META = "Desarrolle la capacidad de formular preguntas filosóficas sobre sí mismo, su entorno y la realidad, ejercitando el pensamiento crítico a través del diálogo filosófico y la reflexión argumentada.";

const PROGRESIONES_PFHI = [
  {
    codigo: "PFH-I-P01",
    numero: 1,
    titulo: "Distingue el ejercicio de filosofar —el acto de preguntarse, dudar y reflexionar— como práctica humana fundamental, diferenciándolo del conocimiento filosófico acumulado.",
    descripcion: "Distingue el ejercicio de filosofar —el acto de preguntarse, dudar y reflexionar— como práctica humana fundamental, diferenciándolo del conocimiento filosófico acumulado.",
    descripcion_extendida: "Distingue el ejercicio de filosofar —el acto de preguntarse, dudar y reflexionar— como práctica humana fundamental, diferenciándolo del conocimiento filosófico acumulado. Contenidos: el filosofar: asombro, duda metódica, reflexión crítica.",
    meta_aprendizaje: META,
    categoria: "Filosofía como práctica",
    subcategoria: "El filosofar",
    ejes_articuladores: ["Pensamiento crítico"],
    transversalidades: ["LC-I"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PFH-I-P02",
    numero: 2,
    titulo: "Identifica los tipos de preguntas filosóficas (ontológicas, epistemológicas, éticas, estéticas, políticas) y sus características frente a preguntas científicas o cotidianas.",
    descripcion: "Identifica los tipos de preguntas filosóficas (ontológicas, epistemológicas, éticas, estéticas, políticas) y sus características frente a preguntas científicas o cotidianas.",
    descripcion_extendida: "Identifica los tipos de preguntas filosóficas (ontológicas, epistemológicas, éticas, estéticas, políticas) y sus características frente a preguntas científicas o cotidianas. Contenidos: tipos de preguntas: filosóficas, científicas, cotidianas; ramas de la filosofía: ontología, epistemología, ética, estética, filosofía política.",
    meta_aprendizaje: META,
    categoria: "Filosofía como práctica",
    subcategoria: "Tipos de preguntas filosóficas",
    ejes_articuladores: ["Pensamiento crítico"],
    transversalidades: ["LC-I", "CNEYT-I"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PFH-I-P03",
    numero: 3,
    titulo: "Analiza problemas filosóficos clásicos y contemporáneos relacionados con su propia experiencia (identidad, libertad, justicia, verdad).",
    descripcion: "Analiza problemas filosóficos clásicos y contemporáneos relacionados con su propia experiencia (identidad, libertad, justicia, verdad).",
    descripcion_extendida: "Analiza problemas filosóficos clásicos y contemporáneos relacionados con su propia experiencia (identidad, libertad, justicia, verdad). Contenidos: problemas filosóficos perennes: existencia, conocimiento, libertad, justicia, belleza.",
    meta_aprendizaje: META,
    categoria: "Problemas filosóficos",
    subcategoria: "Problemas clásicos y contemporáneos",
    ejes_articuladores: ["Pensamiento crítico", "Ciudadanía"],
    transversalidades: ["CS-I", "LC-I"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PFH-I-P04",
    numero: 4,
    titulo: "Practica el diálogo filosófico como forma de construir conocimiento colectivo, escuchar con apertura y reformular las propias ideas.",
    descripcion: "Practica el diálogo filosófico como forma de construir conocimiento colectivo, escuchar con apertura y reformular las propias ideas.",
    descripcion_extendida: "Practica el diálogo filosófico como forma de construir conocimiento colectivo, escuchar con apertura y reformular las propias ideas. Contenidos: diálogo socrático: escucha activa, argumentación, reformulación.",
    meta_aprendizaje: META,
    categoria: "Filosofía como práctica",
    subcategoria: "Diálogo filosófico",
    ejes_articuladores: ["Pensamiento crítico", "Ciudadanía"],
    transversalidades: ["LC-I"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PFH-I-P05",
    numero: 5,
    titulo: "Reconoce la diversidad de tradiciones filosóficas —occidental, oriental, indígena— como formas legítimas de pensar el mundo.",
    descripcion: "Reconoce la diversidad de tradiciones filosóficas —occidental, oriental, indígena— como formas legítimas de pensar el mundo.",
    descripcion_extendida: "Reconoce la diversidad de tradiciones filosóficas —occidental, oriental, indígena— como formas legítimas de pensar el mundo. Contenidos: pensamiento filosófico indígena y mesoamericano; tradiciones filosóficas: occidental, oriental, indígena.",
    meta_aprendizaje: META,
    categoria: "Pensamiento filosófico diverso",
    subcategoria: "Tradiciones filosóficas",
    ejes_articuladores: ["Pensamiento crítico", "Interculturalidad crítica"],
    transversalidades: ["CS-I"],
    tiempo_estimado_horas: 3,
  },
] as const;

export async function seedPFHI(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed PFH-I (propósitos oficiales 2025)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac").select("id").eq("codigo", "PFH-I").single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC PFH-I no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const rows = PROGRESIONES_PFHI.map((p) => ({
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
  if (error) throw new Error(`Error seeding PFH-I: ${error.message}`);
  console.log(`  ✓ ${rows.length} propósitos formativos de PFH-I (es_placeholder=false)`);
  console.log("\n✅ Seed PFH-I completado.\n");
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
  seedPFHI(sb).catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
}

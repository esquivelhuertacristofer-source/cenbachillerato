/**
 * Seed de propósitos formativos oficiales para PFH-III (Pensamiento Filosófico y Humanidades III).
 * Fuente: docs/programas-oficiales/extraidos/04-PENSAMIENTO-FILOSOFICO.md
 *         PDF: 2025_MCC_PENSAMIENTO FILOSOFICO_BN.pdf — Modelo Educativo 2025
 *
 * Uso: npx tsx scripts/seed-pfhiii.ts
 * Idempotente: upsert por campo "codigo".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

const META = "Desarrolle capacidades para analizar, debatir e intervenir en su realidad social y cultural mediante herramientas de la lógica, la argumentación, la filosofía política, la estética y la praxis transformadora.";

const PROGRESIONES_PFHIII = [
  {
    codigo: "PFH-III-P01",
    numero: 1,
    titulo: "Aplica herramientas de lógica y argumentación (deducción, inducción, falacias) para analizar discursos, textos y situaciones de su entorno.",
    descripcion: "Aplica lógica y argumentación para analizar discursos, textos y situaciones del entorno.",
    descripcion_extendida: "Aplica herramientas de lógica y argumentación (deducción, inducción, falacias) para analizar discursos, textos y situaciones de su entorno. Contenidos: lógica formal: proposiciones, silogismos, tablas de verdad; argumentación: tipos de argumentos (deductivo, inductivo, abductivo); falacias formales e informales (ad hominem, hombre de paja, pendiente resbaladiza); análisis crítico de discursos políticos y mediáticos.",
    meta_aprendizaje: META,
    categoria: "Lógica y argumentación",
    subcategoria: "Herramientas lógico-argumentativas",
    ejes_articuladores: ["Pensamiento crítico", "Vida democrática y ciudadanía"],
    transversalidades: ["LC-III"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PFH-III-P02",
    numero: 2,
    titulo: "Analiza conceptos de la filosofía política (poder, Estado, democracia, justicia social, ciudadanía) para comprender y problematizar su realidad política.",
    descripcion: "Analiza conceptos de filosofía política para comprender y problematizar la realidad política.",
    descripcion_extendida: "Analiza conceptos de la filosofía política (poder, Estado, democracia, justicia social, ciudadanía) para comprender y problematizar su realidad política. Contenidos: filosofía política: Estado, poder, democracia deliberativa, desobediencia civil; justicia social: Rawls, Nussbaum, Dussel; ciudadanía activa y participación política; análisis de situaciones políticas en México.",
    meta_aprendizaje: META,
    categoria: "Filosofía política",
    subcategoria: "Estado, democracia y justicia social",
    ejes_articuladores: ["Pensamiento crítico", "Vida democrática y ciudadanía"],
    transversalidades: ["CS-III"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PFH-III-P03",
    numero: 3,
    titulo: "Reflexiona sobre la estética como disciplina filosófica al explorar el arte, la belleza y la experiencia estética en contextos culturales diversos.",
    descripcion: "Reflexiona sobre la estética filosófica al explorar el arte, la belleza y la experiencia estética.",
    descripcion_extendida: "Reflexiona sobre la estética como disciplina filosófica al explorar el arte, la belleza y la experiencia estética en contextos culturales diversos. Contenidos: estética: lo bello, lo sublime, lo grotesco; el arte como conocimiento y como práctica social; estética latinoamericana; experiencia estética en contextos cotidianos; arte indígena y popular mexicano.",
    meta_aprendizaje: META,
    categoria: "Estética",
    subcategoria: "Arte, belleza y experiencia estética",
    ejes_articuladores: ["Pensamiento crítico", "Interculturalidad crítica"],
    transversalidades: ["LC-III"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "PFH-III-P04",
    numero: 4,
    titulo: "Diseña y ejecuta una propuesta de praxis filosófica transformadora: una acción concreta en su comunidad fundamentada en el análisis filosófico.",
    descripcion: "Diseña y ejecuta una propuesta de praxis filosófica transformadora en su comunidad.",
    descripcion_extendida: "Diseña y ejecuta una propuesta de praxis filosófica transformadora: una acción concreta en su comunidad fundamentada en el análisis filosófico. Contenidos: praxis filosófica: filosofía comunitaria, filosofía con niños y jóvenes, intervención social; metodología de proyecto filosófico: diagnóstico, planeación, ejecución y evaluación; vinculación entre teoría filosófica y acción transformadora.",
    meta_aprendizaje: META,
    categoria: "Praxis filosófica",
    subcategoria: "Acción transformadora comunitaria",
    ejes_articuladores: ["Pensamiento crítico", "Vida democrática y ciudadanía"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
] as const;

export async function seedPFHIII(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed PFH-III (propósitos oficiales 2025)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac").select("id").eq("codigo", "PFH-III").single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC PFH-III no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const rows = PROGRESIONES_PFHIII.map((p) => ({
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
  if (error) throw new Error(`Error seeding PFH-III: ${error.message}`);
  console.log(`  ✓ ${rows.length} propósitos formativos de PFH-III (es_placeholder=false)`);
  console.log("\n✅ Seed PFH-III completado: 4 propósitos oficiales insertados.\n");
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
  seedPFHIII(sb).catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
}

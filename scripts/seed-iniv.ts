/**
 * Seed de propósitos formativos oficiales para IN-IV (Inglés IV, Semestre 4, nivel A2+).
 * Fuente: docs/programas-oficiales/extraidos/07-INGLES.md
 *         PDF: 2025_MCC_INGLES_BN.pdf — Modelo Educativo 2025
 *
 * Uso: npx tsx scripts/seed-iniv.ts
 * Idempotente: upsert por campo "codigo".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

const META = "Fortalezca su autonomía comunicativa en tareas sociales y académicas sencillas, ampliando el uso del lenguaje para describir, explicar, comparar y argumentar ideas simples en contextos cotidianos.";

const PROGRESIONES_INIV = [
  {
    codigo: "IN-IV-P01",
    numero: 1,
    titulo: "Describe experiencias pasadas con mayor detalle y conexión (narra lo que ocurrió, dónde y cómo).",
    descripcion: "Narra experiencias pasadas con detalle, ubicación y secuencia de eventos.",
    descripcion_extendida: "Describe experiencias pasadas con mayor detalle y conexión en inglés A2+. Contenidos: pasado simple de verbos regulares e irregulares; conectores de secuencia (first, then, after that, finally); vocabulario de viajes y celebraciones; uso de marcadores temporales (yesterday, last week, ago); construcción de oraciones afirmativas, negativas e interrogativas en pasado.",
    meta_aprendizaje: META,
    categoria: "Narración en pasado",
    subcategoria: "Descripción de experiencias",
    ejes_articuladores: ["Comunicación efectiva", "Interculturalidad"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "IN-IV-P02",
    numero: 2,
    titulo: "Expresa y justifica preferencias de forma respetuosa (compara elecciones personales en contextos cotidianos).",
    descripcion: "Compara y justifica preferencias personales usando estructuras comparativas en contextos cotidianos.",
    descripcion_extendida: "Expresa y justifica preferencias de forma respetuosa en inglés A2+. Contenidos: adjetivos comparativos y superlativos (revisión y expansión); conjunciones coordinantes (and, so, but); vocabulario de preferencias, gustos y opiniones; expresiones de acuerdo y desacuerdo cortés (I prefer…, I think…, In my opinion…); comparación de personas, lugares y objetos.",
    meta_aprendizaje: META,
    categoria: "Expresión de preferencias",
    subcategoria: "Comparación y opinión",
    ejes_articuladores: ["Comunicación efectiva", "Pensamiento crítico"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "IN-IV-P03",
    numero: 3,
    titulo: "Describe rutinas y hábitos con conciencia del contexto (explica lo que se hace y por qué).",
    descripcion: "Describe rutinas y hábitos cotidianos y explica sus razones usando conectores causales.",
    descripcion_extendida: "Describe rutinas y hábitos con conciencia del contexto en inglés A2+. Contenidos: presente simple (revisión completa): afirmativo, negativo e interrogativo; conectores causales (because, so); adverbios de frecuencia (always, usually, often, sometimes, never); vocabulario de hábitos saludables; expresiones de frecuencia y temporalidad; frases para explicar la razón de una rutina.",
    meta_aprendizaje: META,
    categoria: "Hábitos y rutinas",
    subcategoria: "Presente simple y causalidad",
    ejes_articuladores: ["Comunicación efectiva", "Interculturalidad"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "IN-IV-P04",
    numero: 4,
    titulo: "Solicita y da consejos de forma empática y contextualizada (salud, estudio, convivencia).",
    descripcion: "Formula y responde consejos usando modalidad en contextos de salud, estudio y convivencia.",
    descripcion_extendida: "Solicita y da consejos de forma empática y contextualizada en inglés A2+. Contenidos: should / shouldn't para expresar recomendaciones; imperativos afirmativos y negativos; vocabulario de salud, vida académica y convivencia social; expresiones para pedir consejo (What should I do? Can you give me some advice?); respuestas empáticas y construcción de diálogos de asesoramiento breve.",
    meta_aprendizaje: META,
    categoria: "Modalidad y consejos",
    subcategoria: "Should y recomendaciones",
    ejes_articuladores: ["Comunicación efectiva", "Pensamiento crítico"],
    transversalidades: ["CS-III"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "IN-IV-P05",
    numero: 5,
    titulo: "Habla sobre planes y propósitos personales o comunitarios (expresa lo que se piensa hacer y por qué es importante).",
    descripcion: "Expresa planes y propósitos a futuro y argumenta su importancia en contextos personales o comunitarios.",
    descripcion_extendida: "Habla sobre planes y propósitos personales o comunitarios en inglés A2+. Contenidos: futuro idiomático con be going to (planes decididos y evidencias); futuro simple con will (introducción: predicciones y decisiones espontáneas); vocabulario de metas personales y proyectos comunitarios; conectores de propósito (because, so that); diferenciación entre will y be going to en contexto.",
    meta_aprendizaje: META,
    categoria: "Planes y futuro",
    subcategoria: "Be going to y will",
    ejes_articuladores: ["Comunicación efectiva", "Pensamiento crítico"],
    transversalidades: ["CS-III"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "IN-IV-P06",
    numero: 6,
    titulo: "Participa en conversaciones sociales breves con expresiones de cortesía (inicia, mantiene y cierra intercambios breves).",
    descripcion: "Desarrolla competencia conversacional en intercambios sociales breves usando expresiones de cortesía.",
    descripcion_extendida: "Participa en conversaciones sociales breves con expresiones de cortesía en inglés A2+. Contenidos: expresiones de cortesía para iniciar, mantener y cerrar conversaciones; revisión de preguntas y respuestas comunes (WH-questions y Yes/No questions); small talk: temas comunes (clima, fin de semana, estudios); estrategias conversacionales (turn-taking, backchanneling); vocabulario para interacciones sociales cotidianas.",
    meta_aprendizaje: META,
    categoria: "Interacción social",
    subcategoria: "Cortesía y small talk",
    ejes_articuladores: ["Comunicación efectiva", "Interculturalidad"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "IN-IV-P07",
    numero: 7,
    titulo: "Cuenta una anécdota o experiencia significativa (narra de forma clara y organizada).",
    descripcion: "Narra anécdotas o experiencias significativas con estructura clara usando pasado simple y continuo.",
    descripcion_extendida: "Cuenta una anécdota o experiencia significativa de forma clara y organizada en inglés A2+. Contenidos: pasado simple y pasado continuo (contraste: acción en progreso interrumpida); adverbios de tiempo y lugar (suddenly, at that moment, near, far); vocabulario de emociones y reacciones; conectores narrativos (while, when, after, before); estructura de la anécdota: contexto, desarrollo y cierre.",
    meta_aprendizaje: META,
    categoria: "Narración en pasado",
    subcategoria: "Anécdota y pasado continuo",
    ejes_articuladores: ["Comunicación efectiva", "Interculturalidad"],
    transversalidades: ["CH-I"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "IN-IV-P08",
    numero: 8,
    titulo: "Consolida estrategias para comprender y expresar ideas de forma clara y estructurada.",
    descripcion: "Integra y aplica estrategias comunicativas y gramaticales de nivel A2+ para comprender y producir textos.",
    descripcion_extendida: "Consolida estrategias para comprender y expresar ideas de forma clara y estructurada en inglés A2+. Contenidos: revisión integrada de tiempos verbales: presente simple, pasado simple/continuo y futuro (be going to / will); estructura de párrafos en inglés (topic sentence, supporting ideas, concluding sentence); textos funcionales: correos, mensajes y notas breves; estrategias de comprensión lectora y auditiva (skimming, scanning, inferencing); autoevaluación del aprendizaje.",
    meta_aprendizaje: META,
    categoria: "Consolidación comunicativa",
    subcategoria: "Revisión integral A2+",
    ejes_articuladores: ["Comunicación efectiva", "Pensamiento crítico"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
] as const;

export async function seedINIV(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed IN-IV (propósitos oficiales 2025)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac").select("id").eq("codigo", "IN-IV").single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC IN-IV no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const rows = PROGRESIONES_INIV.map((p) => ({
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
  if (error) throw new Error(`Error seeding IN-IV: ${error.message}`);
  console.log(`  ✓ ${rows.length} propósitos formativos de IN-IV (es_placeholder=false)`);
  console.log("\n✅ Seed IN-IV completado: 8 propósitos oficiales insertados.\n");
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
  seedINIV(sb).catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
}

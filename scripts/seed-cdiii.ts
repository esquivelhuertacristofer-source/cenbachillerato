/**
 * Seed de propósitos formativos oficiales para CD-III (Cultura Digital III).
 * Fuente: docs/programas-oficiales/extraidos/02-CULTURA-DIGITAL.md
 *         Modelo Curricular MCCEMS 2025 — Semestre 6
 *
 * Continuación de CD-I (Sem 1) y CD-II (Sem 2). La familia CD salta a Sem 6.
 * CD-III cierra la familia con ciudadanía digital, vocaciones y proyecto comunitario.
 *
 * Uso: npx tsx scripts/seed-cdiii.ts
 * Idempotente: upsert por campo "codigo".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

const META = "Interactúe con las TICCAD para ampliar su conocimiento, explorar vocaciones profesionales y ejercer su ciudadanía digital con responsabilidad y perspectiva de género.";

export const PROGRESIONES_CDIII = [
  {
    codigo: "CD-III-P01",
    numero: 1,
    titulo: "Analiza críticamente la comunicación digital multimodal y sus efectos en la construcción de identidades y realidades sociales.",
    descripcion: "Analiza críticamente la comunicación digital multimodal y sus efectos en la construcción de identidades y realidades sociales.",
    descripcion_extendida: "Analiza críticamente la comunicación digital multimodal y sus efectos en la construcción de identidades y realidades sociales. Contenidos: comunicación multimodal: integración de texto, imagen, audio y video en la producción de sentido; identidad digital: construcción, performatividad y riesgos de la identidad en línea; redes sociales y algoritmos: cómo las plataformas moldean la percepción de la realidad; desinformación y posverdad: análisis de mecanismos y estrategias de verificación; brecha digital de género: causas estructurales y expresiones contemporáneas; lectura crítica de productos culturales digitales; estrategias de alfabetización mediática.",
    meta_aprendizaje: META,
    categoria: "Ciudadanía digital crítica",
    subcategoria: "Comunicación digital multimodal: texto, imagen, audio, video",
    ejes_articuladores: ["Pensamiento crítico", "Igualdad de género", "Ciudadanía democrática"],
    transversalidades: ["LC-III", "CD-I"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CD-III-P02",
    numero: 2,
    titulo: "Produce contenidos digitales de calidad orientados a la transformación social con perspectiva de género e inclusión.",
    descripcion: "Produce contenidos digitales de calidad orientados a la transformación social con perspectiva de género e inclusión.",
    descripcion_extendida: "Produce contenidos digitales de calidad orientados a la transformación social con perspectiva de género e inclusión. Contenidos: criterios de calidad en la producción digital: claridad, accesibilidad, pertinencia, rigor; perspectiva de género en la producción de contenidos: representación, lenguaje incluyente, estereotipos; herramientas digitales para la creación: video, podcast, infografía, blog, redes; propiedad intelectual y licencias Creative Commons en la producción propia; ética en la difusión: privacidad, consentimiento, uso responsable de imágenes; diseño universal para el aprendizaje (DUA): accesibilidad digital; evaluación de impacto social de los contenidos producidos.",
    meta_aprendizaje: META,
    categoria: "Producción digital con perspectiva crítica",
    subcategoria: "Brecha digital de género: causas, consecuencias, estrategias de equidad",
    ejes_articuladores: ["Igualdad de género", "Pensamiento crítico", "Ciudadanía democrática"],
    transversalidades: ["CD-II", "LC-III"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CD-III-P03",
    numero: 3,
    titulo: "Explora vocaciones y trayectorias profesionales vinculadas a las tecnologías digitales con perspectiva de género.",
    descripcion: "Explora vocaciones y trayectorias profesionales vinculadas a las tecnologías digitales con perspectiva de género.",
    descripcion_extendida: "Explora vocaciones y trayectorias profesionales vinculadas a las tecnologías digitales con perspectiva de género. Contenidos: panorama de profesiones y vocaciones en el campo digital: programación, diseño UX/UI, ciberseguridad, ciencia de datos, inteligencia artificial; perspectiva de género en las carreras STEM: brechas salariales, subrepresentación femenina, referentes; trayectorias académicas y profesionales en México: universidades, institutos técnicos, bootcamps, certificaciones; emprendimiento digital: modelos de negocio en línea, startups, economía gig; habilidades del siglo XXI demandadas por el mercado digital; autoconocimiento y vocación: fortalezas personales y campos digitales; casos de éxito de mujeres en tecnología en México y América Latina.",
    meta_aprendizaje: META,
    categoria: "Vocaciones y trayectorias digitales",
    subcategoria: "Vocaciones y carreras en el campo digital: programación, diseño, datos, ciberseguridad",
    ejes_articuladores: ["Igualdad de género", "Pensamiento crítico"],
    transversalidades: ["PFH-III"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CD-III-P04",
    numero: 4,
    titulo: "Diseña un proyecto de participación comunitaria mediado por tecnologías digitales.",
    descripcion: "Diseña un proyecto de participación comunitaria mediado por tecnologías digitales.",
    descripcion_extendida: "Diseña un proyecto de participación comunitaria mediado por tecnologías digitales. Contenidos: participación ciudadana digital: activismo, comunidades en línea, peticiones y propuestas digitales; metodología de proyectos comunitarios: diagnóstico, diseño, implementación y evaluación; herramientas para el trabajo colaborativo en línea: plataformas de gestión de proyectos, repositorios, comunicación; diseño centrado en el usuario (DCU) aplicado a soluciones comunitarias; presentación y comunicación del proyecto: pitching digital, storytelling, visualización de datos; evaluación de impacto social: indicadores cualitativos y cuantitativos; sostenibilidad del proyecto: recursos, alianzas, escalabilidad.",
    meta_aprendizaje: META,
    categoria: "Proyecto comunitario digital",
    subcategoria: "Participación ciudadana digital: activismo, comunidades en línea, peticiones, propuestas",
    ejes_articuladores: ["Ciudadanía democrática", "Pensamiento crítico", "Sustentabilidad"],
    transversalidades: ["CS-III", "CD-II"],
    tiempo_estimado_horas: 3,
  },
] as const;

export async function seedCDIII(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed CD-III (propósitos oficiales 2025)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac").select("id").eq("codigo", "CD-III").single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC CD-III no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const rows = PROGRESIONES_CDIII.map((p) => ({
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
  if (error) throw new Error(`Error seeding CD-III: ${error.message}`);
  console.log(`  ✓ ${rows.length} propósitos formativos de CD-III (es_placeholder=false)`);
  console.log("\n✅ Seed CD-III completado: 4 propósitos oficiales insertados.\n");
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
  seedCDIII(sb).catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
}

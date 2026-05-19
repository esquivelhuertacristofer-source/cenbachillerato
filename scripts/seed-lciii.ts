/**
 * Seed de propósitos formativos oficiales para LC-III (Lengua y Comunicación III).
 * Fuente: docs/programas-oficiales/extraidos/08-LENGUA-COMUNICACION.md
 *         PDF: vf_MCC_LENGUA Y COMUNICACION_BN.pdf — Modelo Educativo 2025
 *
 * Uso: npx tsx scripts/seed-lciii.ts
 * Idempotente: upsert por campo "codigo".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

const META = "Explore y experimente con los movimientos y géneros literarios como manifestaciones culturales, para apropiarse de los diferentes elementos discursivos.";

const PROGRESIONES_LCIII = [
  {
    codigo: "LC-III-P01",
    numero: 1,
    titulo: "Analiza la información extraída de un texto para darle sentido desde sus conocimientos previos y toma postura frente a lo expuesto por quien lo escribió.",
    descripcion: "Analiza la información extraída de un texto para darle sentido desde sus conocimientos previos y toma postura frente a lo expuesto.",
    descripcion_extendida: "Analiza la información extraída de un texto para darle sentido desde sus conocimientos previos y toma postura frente a lo expuesto por quien lo escribió. Contenidos: sentido global del texto; intención del autor; pensamiento crítico; paráfrasis; lectura activa y posicionamiento del lector.",
    meta_aprendizaje: META,
    categoria: "Lectura crítica",
    subcategoria: "Pensamiento crítico y paráfrasis",
    ejes_articuladores: ["Apropiación de las culturas a través de la lectura y la escritura", "Pensamiento crítico"],
    transversalidades: ["PFH-III"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "LC-III-P02",
    numero: 2,
    titulo: "Reconoce, mediante la lectura, los diversos movimientos literarios para comprender sus particularidades.",
    descripcion: "Reconoce los diversos movimientos literarios y comprende sus particularidades mediante la lectura.",
    descripcion_extendida: "Reconoce, mediante la lectura, los diversos movimientos literarios para comprender sus particularidades. Contenidos: movimientos literarios: Barroco, Neoclasicismo, Romanticismo, Realismo, Modernismo, Vanguardias, Realismo mágico, Literaturas disidentes y digitales.",
    meta_aprendizaje: META,
    categoria: "Literatura",
    subcategoria: "Movimientos literarios",
    ejes_articuladores: ["Apropiación de las culturas a través de la lectura y la escritura", "Interculturalidad crítica"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "LC-III-P03",
    numero: 3,
    titulo: "Lee los géneros literarios para analizar su papel como forma de involucrar perspectivas de diversa índole.",
    descripcion: "Lee los géneros literarios y analiza su papel para involucrar perspectivas diversas.",
    descripcion_extendida: "Lee los géneros literarios para analizar su papel como forma de involucrar perspectivas de diversa índole. Contenidos: géneros literarios: novela, cuento, poesía, drama, ensayo; perspectivas de género, culturales, históricas y políticas en la literatura.",
    meta_aprendizaje: META,
    categoria: "Literatura",
    subcategoria: "Géneros literarios",
    ejes_articuladores: ["Apropiación de las culturas a través de la lectura y la escritura", "Interculturalidad crítica"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "LC-III-P04",
    numero: 4,
    titulo: "Identifica lecturas de subgéneros narrativos y sus elementos discursivos a partir de la lectura.",
    descripcion: "Identifica subgéneros narrativos y sus elementos discursivos.",
    descripcion_extendida: "Identifica lecturas de subgéneros narrativos y sus elementos discursivos a partir de la lectura. Contenidos: subgéneros narrativos: suspenso, terror, ciencia ficción, narrativas del cuerpo y autoficción, neorrealismo urbano, literaturas del Antropoceno; elementos discursivos específicos de cada subgénero.",
    meta_aprendizaje: META,
    categoria: "Literatura",
    subcategoria: "Subgéneros narrativos",
    ejes_articuladores: ["Apropiación de las culturas a través de la lectura y la escritura", "Pensamiento crítico"],
    transversalidades: ["CNEYT-III"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "LC-III-P05",
    numero: 5,
    titulo: "Analiza fragmentos de poesía, a los que da lectura en voz alta, para valorar las figuras retóricas.",
    descripcion: "Analiza fragmentos de poesía y valora las figuras retóricas mediante la lectura en voz alta.",
    descripcion_extendida: "Analiza fragmentos de poesía, a los que da lectura en voz alta, para valorar las figuras retóricas. Contenidos: género lírico: estructura, subgéneros; figuras retóricas: metáfora, hipérbaton, hipérbole, ironía, prosopopeya; rima y métrica; lectura expresiva en voz alta.",
    meta_aprendizaje: META,
    categoria: "Literatura",
    subcategoria: "Género lírico y figuras retóricas",
    ejes_articuladores: ["Apropiación de las culturas a través de la lectura y la escritura"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "LC-III-P06",
    numero: 6,
    titulo: "Comprende las características de la reseña crítica para realizar una composición basada en uno de los movimientos literarios.",
    descripcion: "Comprende la reseña crítica y realiza una composición basada en un movimiento literario.",
    descripcion_extendida: "Comprende las características de la reseña crítica para realizar una composición basada en uno de los movimientos literarios. Contenidos: reseña crítica: características, idea principal e idea secundaria, interpretación; proceso de escritura: planificación, borrador, revisión, versión final.",
    meta_aprendizaje: META,
    categoria: "Escritura",
    subcategoria: "Reseña crítica",
    ejes_articuladores: ["Apropiación de las culturas a través de la lectura y la escritura", "Pensamiento crítico"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "LC-III-P07",
    numero: 7,
    titulo: "Realiza la exposición oral formal (coloquio, simposio o foro presencial/virtual) de una reseña para explicar y compartir su análisis crítico.",
    descripcion: "Realiza una exposición oral formal de una reseña crítica en coloquio, simposio o foro.",
    descripcion_extendida: "Realiza la exposición oral formal (coloquio, simposio o foro presencial/virtual) de una reseña para explicar y compartir su análisis crítico. Contenidos: exposición oral formal: organización del coloquio/foro, planeación logística, ejecución y seguimiento; recursos de apoyo digital; argumentación oral crítica.",
    meta_aprendizaje: META,
    categoria: "Oralidad",
    subcategoria: "Exposición oral formal",
    ejes_articuladores: ["Apropiación de las culturas a través de la lectura y la escritura", "Pensamiento crítico"],
    transversalidades: ["CD-III"],
    tiempo_estimado_horas: 3,
  },
] as const;

export async function seedLCIII(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed LC-III (propósitos oficiales 2025)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac").select("id").eq("codigo", "LC-III").single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC LC-III no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const rows = PROGRESIONES_LCIII.map((p) => ({
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
  if (error) throw new Error(`Error seeding LC-III: ${error.message}`);
  console.log(`  ✓ ${rows.length} propósitos formativos de LC-III (es_placeholder=false)`);
  console.log("\n✅ Seed LC-III completado: 7 propósitos oficiales insertados.\n");
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
  seedLCIII(sb).catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
}

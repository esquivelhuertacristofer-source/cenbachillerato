/**
 * Seed de propósitos formativos oficiales para CNEYT-VI (Ciencias Naturales, Experimentales y Tecnología VI).
 * Fuente: docs/programas-oficiales/extraidos/03-CIENCIAS-NATURALES.md
 *         Modelo Curricular MCCEMS 2025 — Semestre 6
 *
 * Cierre de la familia CNEYT (Semestres 1-6). CNEYT-VI regresa a Biología después de
 * Física Clásica (Sem 5) y Química (Sem 4). Cubre origen de vida, célula, genética y evolución.
 *
 * Uso: npx tsx scripts/seed-cneytvi.ts
 * Idempotente: upsert por campo "codigo".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

const META = "Comprenda los rasgos que caracterizan a los seres vivos al explorar el origen de la vida, la organización celular, la transmisión de la información genética y los mecanismos de la evolución biológica.";

export const PROGRESIONES_CNEYTVI = [
  {
    codigo: "CNEYT-VI-P01",
    numero: 1,
    titulo: "Analiza las hipótesis sobre el origen de la vida en la Tierra y su relación con las condiciones planetarias primitivas.",
    descripcion: "Analiza las hipótesis sobre el origen de la vida en la Tierra y su relación con las condiciones planetarias primitivas.",
    descripcion_extendida: "Analiza las hipótesis sobre el origen de la vida en la Tierra y su relación con las condiciones planetarias primitivas. Contenidos: condiciones de la Tierra primitiva: atmósfera reductora, energía, temperatura; hipótesis abióticas: caldo primordial (Oparin-Haldane), síntesis química prebiótica; experimento de Miller-Urey (1953) y sus implicaciones; hipótesis de los ventiladeros hidrotermales; hipótesis de la panspermia: meteoritos y vida extraterrestre; primeras moléculas orgánicas: aminoácidos, ARN, protocélulas; línea del tiempo de la evolución de la vida en la Tierra; evidencias fósiles y geológicas del origen de la vida.",
    meta_aprendizaje: META,
    categoria: "Origen de la vida",
    subcategoria: "Origen de la vida: hipótesis abióticas, experimento de Miller-Urey, panspermia",
    ejes_articuladores: ["Pensamiento crítico", "Sustentabilidad"],
    transversalidades: ["CNEYT-V"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-VI-P02",
    numero: 2,
    titulo: "Compara las características de la célula procariota y eucariota, y describe sus organelos y funciones.",
    descripcion: "Compara las características de la célula procariota y eucariota, y describe sus organelos y funciones.",
    descripcion_extendida: "Compara las características de la célula procariota y eucariota, y describe sus organelos y funciones. Contenidos: teoría celular: postulados y desarrollo histórico; célula procariota: características, estructura, ejemplos (bacterias, arqueas); célula eucariota: animal y vegetal; organelos y sus funciones: núcleo, mitocondria, cloroplasto, retículo endoplásmico, aparato de Golgi, lisosomas, vacuolas, ribosomas; membrana celular: estructura y funciones de transporte; teoría endosimbiótica: origen de mitocondrias y cloroplastos; microscopía: tipos y aplicaciones; tamaño y escala celular; diversidad celular en organismos multicelulares.",
    meta_aprendizaje: META,
    categoria: "Organización celular",
    subcategoria: "Teoría celular: estructura y función de organelos",
    ejes_articuladores: ["Pensamiento crítico"],
    transversalidades: ["CNEYT-I"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-VI-P03",
    numero: 3,
    titulo: "Explica los procesos de metabolismo celular: respiración celular y fotosíntesis a nivel molecular.",
    descripcion: "Explica los procesos de metabolismo celular: respiración celular y fotosíntesis a nivel molecular.",
    descripcion_extendida: "Explica los procesos de metabolismo celular: respiración celular y fotosíntesis a nivel molecular. Contenidos: metabolismo celular: anabolismo y catabolismo; fotosíntesis: reacciones luminosas y oscuras, cloroplasto, ecuación general; respiración celular aerobia: glucólisis, ciclo de Krebs, cadena de transporte de electrones, síntesis de ATP; respiración anaerobia: fermentación láctica y alcohólica; ATP como moneda energética de la célula; comparación fotosíntesis-respiración: complementariedad; impacto del metabolismo celular en los ecosistemas; aplicaciones biotecnológicas: fermentación industrial en México (tequila, pulque, pan).",
    meta_aprendizaje: META,
    categoria: "Metabolismo celular",
    subcategoria: "Metabolismo celular: respiración aerobia/anaerobia, fotosíntesis",
    ejes_articuladores: ["Pensamiento crítico", "Sustentabilidad"],
    transversalidades: ["CNEYT-III"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-VI-P04",
    numero: 4,
    titulo: "Describe la estructura del ADN y los mecanismos de replicación, transcripción y traducción.",
    descripcion: "Describe la estructura del ADN y los mecanismos de replicación, transcripción y traducción.",
    descripcion_extendida: "Describe la estructura del ADN y los mecanismos de replicación, transcripción y traducción. Contenidos: estructura del ADN: doble hélice, nucleótidos, bases nitrogenadas, pares de bases; historia del descubrimiento: Watson, Crick, Franklin y Wilkins; replicación del ADN: semiconservativa, enzimas clave, fidelidad; ARN: tipos (ARNm, ARNt, ARNr) y funciones; transcripción: síntesis de ARN a partir de ADN, promotor, terminador; código genético: codones, degeneración, codones de inicio y paro; traducción: síntesis proteica en el ribosoma; mutaciones puntuales: sustitución, inserción, deleción; expresión génica: regulación en procariotas y eucariotas.",
    meta_aprendizaje: META,
    categoria: "Genética molecular",
    subcategoria: "ADN y genética molecular: replicación, transcripción, traducción",
    ejes_articuladores: ["Pensamiento crítico"],
    transversalidades: ["CNEYT-IV"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-VI-P05",
    numero: 5,
    titulo: "Analiza los patrones de herencia genética: leyes de Mendel y herencia no mendeliana.",
    descripcion: "Analiza los patrones de herencia genética: leyes de Mendel y herencia no mendeliana.",
    descripcion_extendida: "Analiza los patrones de herencia genética: leyes de Mendel y herencia no mendeliana. Contenidos: Gregor Mendel: experimentos con guisantes y metodología; primera Ley de Mendel: principio de segregación; segunda Ley de Mendel: principio de distribución independiente; cruces monohíbridos y dihíbridos: cuadro de Punnett; dominancia incompleta y codominancia: ejemplos; herencia ligada al sexo: genes en cromosomas sexuales, daltonismo, hemofilia; herencia poligénica: color de piel, estatura; grupos sanguíneos ABO: codominancia y alelos múltiples; cariotipo y trastornos cromosómicos: síndrome de Down, Turner, Klinefelter.",
    meta_aprendizaje: META,
    categoria: "Genética mendeliana y no mendeliana",
    subcategoria: "Herencia mendeliana y no mendeliana",
    ejes_articuladores: ["Pensamiento crítico", "Igualdad de género"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-VI-P06",
    numero: 6,
    titulo: "Examina las causas de las mutaciones y su papel en la variabilidad genética y la evolución.",
    descripcion: "Examina las causas de las mutaciones y su papel en la variabilidad genética y la evolución.",
    descripcion_extendida: "Examina las causas de las mutaciones y su papel en la variabilidad genética y la evolución. Contenidos: concepto de mutación: cambio en la secuencia del ADN; tipos de mutaciones: génicas (sustitución, deleción, inserción) y cromosómicas (deleción, duplicación, inversión, translocación); mutágenos: físicos (radiación UV, rayos X), químicos (benceno, aflatoxinas), biológicos (virus); mutaciones somáticas vs. germinales: consecuencias diferenciadas; relación mutación-cáncer: oncogenes y genes supresores de tumores; variabilidad genética: mutaciones como fuente de diversidad; recombinación genética: crossing-over en meiosis; polimorfismo genético en poblaciones: implicaciones evolutivas.",
    meta_aprendizaje: META,
    categoria: "Mutaciones y variabilidad genética",
    subcategoria: "Mutaciones y variabilidad genética",
    ejes_articuladores: ["Pensamiento crítico", "Sustentabilidad"],
    transversalidades: ["CNEYT-VI-P05"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-VI-P07",
    numero: 7,
    titulo: "Explica la teoría de la evolución por selección natural y la evidencia que la sustenta.",
    descripcion: "Explica la teoría de la evolución por selección natural y la evidencia que la sustenta.",
    descripcion_extendida: "Explica la teoría de la evolución por selección natural y la evidencia que la sustenta. Contenidos: Darwin y Wallace: historia del descubrimiento de la selección natural; teoría sintética de la evolución: síntesis neodarwiniana; selección natural: variación, herencia, presión selectiva, adaptación; otros mecanismos evolutivos: deriva génica, flujo génico, mutación; especiación: aislamiento reproductivo, especiación alopátrica y simpátrica; evidencias de la evolución: registro fósil, anatomía comparada, embriología, biogeografía, genómica; árbol filogenético: lectura e interpretación; evolución humana: Homo sapiens en el contexto de los homínidos; evolución de organismos en México: especies endémicas.",
    meta_aprendizaje: META,
    categoria: "Evolución biológica",
    subcategoria: "Evolución: selección natural, deriva génica, especiación",
    ejes_articuladores: ["Pensamiento crítico", "Sustentabilidad"],
    transversalidades: ["CNEYT-III"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CNEYT-VI-P08",
    numero: 8,
    titulo: "Reflexiona sobre las implicaciones éticas de la biotecnología (transgénicos, CRISPR, clonación).",
    descripcion: "Reflexiona sobre las implicaciones éticas de la biotecnología (transgénicos, CRISPR, clonación).",
    descripcion_extendida: "Reflexiona sobre las implicaciones éticas de la biotecnología (transgénicos, CRISPR, clonación). Contenidos: biotecnología: definición, historia y alcances actuales; organismos genéticamente modificados (OGM): proceso, usos en agricultura y medicina; CRISPR-Cas9: mecanismo, aplicaciones terapéuticas y cuestionamientos éticos; clonación: reproductiva vs. terapéutica; bioprospección y soberanía biológica: el caso del maíz mexicano; bioética: principios de autonomía, beneficencia, no maleficencia y justicia aplicados a la biología; regulación de la biotecnología en México: CIBIOGEM, normatividad; debate público: voces comunitarias, indígenas y científicas; perspectiva de género en la biotecnología reproductiva.",
    meta_aprendizaje: META,
    categoria: "Bioética y biotecnología",
    subcategoria: "Biotecnología y bioética",
    ejes_articuladores: ["Pensamiento crítico", "Ciudadanía democrática", "Igualdad de género"],
    transversalidades: ["PFH-III", "CS-III"],
    tiempo_estimado_horas: 3,
  },
] as const;

export async function seedCNEYTVI(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed CNEYT-VI (propósitos oficiales 2025)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac").select("id").eq("codigo", "CNEYT-VI").single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC CNEYT-VI no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const rows = PROGRESIONES_CNEYTVI.map((p) => ({
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
  if (error) throw new Error(`Error seeding CNEYT-VI: ${error.message}`);
  console.log(`  ✓ ${rows.length} propósitos formativos de CNEYT-VI (es_placeholder=false)`);
  console.log("\n✅ Seed CNEYT-VI completado: 8 propósitos oficiales insertados.\n");
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
  seedCNEYTVI(sb).catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
}

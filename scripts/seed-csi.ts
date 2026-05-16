/**
 * Seed de progresiones reales para CS-I (Ciencias Sociales I).
 * Alineado con el MCCEMS oficial — Semestre 1.
 *
 * Uso: npx tsx scripts/seed-csi.ts
 *
 * Requiere NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local
 * Es idempotente: upsert por campo "codigo".
 *
 * NOTA: es_placeholder=true hasta que el área pedagógica valide el contenido.
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

// ── Datos de las 8 progresiones de CS-I ─────────────────────────────────────
// Fuente: MCCEMS — Recurso Sociocognitivo: Ciencias Sociales — Semestre 1

const PROGRESIONES_CSI = [
  {
    codigo: "CS-I-P01",
    numero: 1,
    titulo: "Las ciencias sociales: objeto de estudio y métodos",
    descripcion: "Presentación de las ciencias sociales y sus disciplinas (sociología, economía, politología, geografía humana, antropología). Diferencias entre ciencias naturales y sociales. Métodos de investigación social.",
    descripcion_extendida: "Los estudiantes construyen una visión panorámica de las ciencias sociales comprendiendo que estudian a los seres humanos como seres sociales, culturales e históricos. Se discuten las diferencias epistemológicas entre ciencias naturales y sociales (objetividad, valores, reproducibilidad) y se introducen los principales métodos de investigación social: encuesta, entrevista, observación participante y análisis de fuentes documentales. La reflexión final conecta las ciencias sociales con preguntas que el estudiante ya tiene sobre su entorno.",
    meta_aprendizaje: "Identifica las principales disciplinas de las ciencias sociales, sus métodos de investigación y las diferencias epistemológicas con las ciencias naturales.",
    categoria: "Introducción a las ciencias sociales",
    subcategoria: "Objeto de estudio y métodos",
    ejes_articuladores: ["Pensamiento crítico", "Ciudadanía"],
    transversalidades: ["LC-I", "HUM-I"],
    tiempo_estimado_horas: 4,
  },
  {
    codigo: "CS-I-P02",
    numero: 2,
    titulo: "La sociedad: estructura, organización e instituciones",
    descripcion: "Concepto de sociedad, grupo social e institución. Estratificación social: clases, castas y estamentos. Movilidad social. Instituciones sociales: familia, escuela, Estado e Iglesia.",
    descripcion_extendida: "Los estudiantes analizan la sociedad como sistema de relaciones estructuradas, identificando los principales grupos sociales e instituciones que la conforman. Se trabajan las teorías de estratificación social (Marx, Weber) de forma accesible, vinculándolas con la realidad mexicana contemporánea. El análisis de la movilidad social en México (con datos del INEGI y CONEVAL) conecta lo teórico con lo empírico, promoviendo la lectura crítica de estadísticas sociales. Se discute el papel de la escuela como institución social y su relación con la movilidad.",
    meta_aprendizaje: "Analiza la estructura social, los grupos sociales y las instituciones, relacionando los conceptos de estratificación y movilidad social con la realidad de México.",
    categoria: "Estructura social",
    subcategoria: "Grupos e instituciones",
    ejes_articuladores: ["Ciudadanía", "Igualdad de género", "Inclusión"],
    transversalidades: ["HUM-I", "PM-I"],
    tiempo_estimado_horas: 4.5,
  },
  {
    codigo: "CS-I-P03",
    numero: 3,
    titulo: "Cultura e identidad: diversidad y convivencia",
    descripcion: "Concepto de cultura: elementos, funciones y diversidad. Etnocentrismo y relativismo cultural. Identidad cultural, nacional y global. Multiculturalismo e interculturalidad en México.",
    descripcion_extendida: "Los estudiantes exploran el concepto de cultura como sistema de creencias, valores, prácticas y símbolos compartidos, analizando la diversidad cultural de México (68 pueblos indígenas, regiones culturales, culturas juveniles). Se trabajan el etnocentrismo como obstáculo al diálogo intercultural y el relativismo cultural como punto de partida para la comprensión, discutiendo sus límites frente a los derechos humanos. La actividad de investigación implica documentar un elemento de la cultura local y compartirlo con el grupo.",
    meta_aprendizaje: "Analiza la diversidad cultural de México desde una perspectiva intercultural, reconociendo el etnocentrismo como obstáculo al diálogo y valorando la pluralidad cultural.",
    categoria: "Cultura e identidad",
    subcategoria: "Diversidad e interculturalidad",
    ejes_articuladores: ["Interculturalidad crítica", "Inclusión", "Ciudadanía"],
    transversalidades: ["HUM-I", "LC-I"],
    tiempo_estimado_horas: 5,
  },
  {
    codigo: "CS-I-P04",
    numero: 4,
    titulo: "Economía básica: conceptos, agentes y mercados",
    descripcion: "El problema económico: escasez y elección. Agentes económicos: familias, empresas, gobierno y sector externo. Tipos de bienes y servicios. Oferta, demanda y precio de equilibrio.",
    descripcion_extendida: "Los estudiantes comprenden la economía como la ciencia que estudia cómo las sociedades administran recursos escasos para satisfacer necesidades ilimitadas. Se trabajan los conceptos de costo de oportunidad, especialización e intercambio a través de simulaciones y casos concretos. El análisis de oferta y demanda se realiza con ejemplos cotidianos (precio de la tortilla, gasolina, aguacate) y se introduce la noción de mercado como mecanismo de coordinación. Se discute críticamente el papel del mercado y del Estado en la economía mexicana.",
    meta_aprendizaje: "Comprende los conceptos económicos básicos (escasez, agentes, oferta, demanda) y los aplica para analizar situaciones del mercado cotidiano mexicano.",
    categoria: "Economía",
    subcategoria: "Fundamentos económicos",
    ejes_articuladores: ["Pensamiento crítico", "Ciudadanía"],
    transversalidades: ["PM-I", "CD-I"],
    tiempo_estimado_horas: 5,
  },
  {
    codigo: "CS-I-P05",
    numero: 5,
    titulo: "El Estado, el gobierno y la democracia",
    descripcion: "Conceptos de Estado, nación y gobierno. Formas de gobierno. La democracia: principios, instituciones y participación ciudadana. El Estado mexicano: estructura constitucional.",
    descripcion_extendida: "Los estudiantes analizan la diferencia conceptual entre Estado (entidad política permanente) y gobierno (quienes ejercen el poder en un momento dado), y comprenden la estructura del Estado mexicano conforme a la CPEUM: poderes (ejecutivo, legislativo, judicial) y ámbitos (federal, estatal, municipal). Se trabaja la democracia no solo como sistema de votación sino como cultura política que implica respeto a los derechos, separación de poderes y rendición de cuentas. Se analiza críticamente el funcionamiento de las instituciones democráticas en México con casos reales.",
    meta_aprendizaje: "Distingue Estado, nación y gobierno, analiza los principios democráticos y la estructura constitucional del Estado mexicano, evaluando el ejercicio del poder con criterios de rendición de cuentas.",
    categoria: "Política y ciudadanía",
    subcategoria: "Estado y democracia",
    ejes_articuladores: ["Ciudadanía", "Pensamiento crítico"],
    transversalidades: ["HUM-I", "LC-I"],
    tiempo_estimado_horas: 5,
  },
  {
    codigo: "CS-I-P06",
    numero: 6,
    titulo: "Derechos humanos y justicia social",
    descripcion: "Historia y fundamentos de los derechos humanos. Clasificación: civiles, políticos, económicos, sociales, culturales y ambientales. Instrumentos internacionales. Situación de los DDHH en México.",
    descripcion_extendida: "Los estudiantes comprenden los derechos humanos como conquistas históricas de la humanidad y no como concesiones del poder, analizando su evolución desde la Declaración Universal de 1948 hasta los instrumentos contemporáneos. Se trabajan las tres generaciones de derechos y se analizan casos de violaciones de DDHH en México (feminicidios, desaparición forzada, discriminación) usando fuentes de la CNDH, Amnistía Internacional y Human Rights Watch. La reflexión culmina en la identificación de mecanismos de exigibilidad de derechos.",
    meta_aprendizaje: "Comprende los fundamentos e historia de los derechos humanos, analiza críticamente su situación en México e identifica mecanismos para su exigibilidad.",
    categoria: "Derechos humanos",
    subcategoria: "Derechos y justicia social",
    ejes_articuladores: ["Ciudadanía", "Igualdad de género", "Inclusión", "Interculturalidad crítica"],
    transversalidades: ["HUM-I", "LC-I"],
    tiempo_estimado_horas: 5,
  },
  {
    codigo: "CS-I-P07",
    numero: 7,
    titulo: "México en el mundo: globalización y sus efectos",
    descripcion: "Concepto y dimensiones de la globalización: económica, cultural, política y tecnológica. Efectos de la globalización en México. Organismos internacionales (ONU, OMC, FMI). Resistencias locales.",
    descripcion_extendida: "Los estudiantes analizan la globalización como proceso histórico multidimensional que ha intensificado la interconexión mundial, con efectos ambivalentes: mayor acceso a bienes y comunicación, pero también desigualdad, pérdida cultural y precariedad laboral. Se trabaja el lugar de México en la economía global (maquiladora, tratados comerciales, remesas, migración) y se analizan los principales organismos internacionales y su influencia en las políticas nacionales. La discusión final aborda las resistencias locales a la globalización como expresiones de identidad cultural y soberanía.",
    meta_aprendizaje: "Analiza las dimensiones y efectos de la globalización en México, evaluando sus impactos positivos y negativos en la economía, la cultura y los derechos.",
    categoria: "Relaciones internacionales",
    subcategoria: "Globalización y México",
    ejes_articuladores: ["Ciudadanía", "Interculturalidad crítica", "Pensamiento crítico"],
    transversalidades: ["HUM-I", "IN-I", "CD-I"],
    tiempo_estimado_horas: 4.5,
  },
  {
    codigo: "CS-I-P08",
    numero: 8,
    titulo: "Problemas sociales contemporáneos: análisis y propuestas",
    descripcion: "Metodología de análisis de problemas sociales: descripción, causas, consecuencias y propuestas. Aplicación a problemáticas actuales: desigualdad, violencia de género, pobreza, cambio climático social.",
    descripcion_extendida: "Los estudiantes aplican las herramientas conceptuales de las ciencias sociales para analizar un problema social de su comunidad o del país, siguiendo una metodología estructurada: descripción del problema con datos, análisis de causas (históricas, estructurales, culturales), identificación de consecuencias y propuesta de soluciones viables. El trabajo es colaborativo y culmina en una presentación o informe que integra fuentes académicas, estadísticas y testimonios. El enfoque es en la ciudadanía activa: las ciencias sociales como herramienta de transformación social.",
    meta_aprendizaje: "Aplica conceptos de las ciencias sociales para analizar un problema social contemporáneo (causas, consecuencias y propuestas), articulando evidencia empírica con marcos teóricos.",
    categoria: "Problemas sociales",
    subcategoria: "Análisis y ciudadanía activa",
    ejes_articuladores: ["Ciudadanía", "Pensamiento crítico", "Igualdad de género", "Inclusión"],
    transversalidades: ["LC-I", "PM-I", "CD-I"],
    tiempo_estimado_horas: 5,
  },
] as const;

export async function seedCSI(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed CS-I (Ciencias Sociales I)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", "CS-I")
    .single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC CS-I no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const uac_id = uacRow.id;

  const rows = PROGRESIONES_CSI.map((p) => ({
    codigo: p.codigo,
    uac_id,
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
    es_placeholder: true,
  }));

  const { error } = await sb.from("progresiones").upsert(rows, { onConflict: "codigo" });
  if (error) throw new Error(`Error seeding progresiones CS-I: ${error.message}`);
  console.log(`  ✓ ${rows.length} progresiones de CS-I enriquecidas (es_placeholder=true)`);
  console.log("\n✅ Seed CS-I completado.\n");
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
  seedCSI(sb).catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
}

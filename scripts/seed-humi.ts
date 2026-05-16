/**
 * Seed de progresiones reales para HUM-I (Humanidades I).
 * Alineado con el MCCEMS oficial — Semestre 1.
 *
 * Uso: npx tsx scripts/seed-humi.ts
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

// ── Datos de las 8 progresiones de HUM-I ────────────────────────────────────
// Fuente: MCCEMS — Recurso Sociocognitivo: Humanidades — Semestre 1

const PROGRESIONES_HUMI = [
  {
    codigo: "HUM-I-P01",
    numero: 1,
    titulo: "¿Qué son las humanidades? Filosofía, arte e historia",
    descripcion: "Introducción a las humanidades: objeto de estudio, métodos y valor en la formación integral. Las disciplinas humanísticas: filosofía, historia, literatura, arte y ética.",
    descripcion_extendida: "Los estudiantes construyen una comprensión de las humanidades como formas de conocimiento que abordan la experiencia humana en su complejidad (valores, significados, expresión, temporalidad). Se discute por qué las humanidades son relevantes en un mundo tecnológico y se exploran las preguntas que guían cada disciplina. La reflexión inicial conecta las humanidades con preguntas que el estudiante ya tiene: ¿qué es el bien? ¿qué es la belleza? ¿cómo sabemos lo que pasó en el pasado? ¿para qué sirve el arte?",
    meta_aprendizaje: "Comprende el campo y objeto de estudio de las humanidades, identifica sus disciplinas y valora su contribución a la formación integral y a la comprensión de la experiencia humana.",
    categoria: "Introducción a las humanidades",
    subcategoria: "Campos y métodos",
    ejes_articuladores: ["Pensamiento crítico", "Apropiación de las culturas a través de la lectura y la escritura"],
    transversalidades: ["LC-I", "CS-I"],
    tiempo_estimado_horas: 3.5,
  },
  {
    codigo: "HUM-I-P02",
    numero: 2,
    titulo: "Filosofía del conocimiento: ¿cómo conocemos?",
    descripcion: "Epistemología básica: fuentes del conocimiento (razón, experiencia, intuición). El problema del conocimiento. Verdad, creencia y justificación. Pensamiento crítico y reflexivo.",
    descripcion_extendida: "Los estudiantes exploran las preguntas epistemológicas fundamentales: ¿qué es el conocimiento? ¿cómo sabemos que algo es verdad? ¿cuáles son los límites de lo que podemos conocer? Se trabajan las posiciones del empirismo (Locke, Hume) y el racionalismo (Descartes) de forma accesible y conectada con situaciones actuales (noticias falsas, sesgos cognitivos, redes sociales). La actividad central aplica el pensamiento crítico al análisis de argumentos cotidianos, desarrollando la capacidad de identificar premisas, conclusiones y falacias.",
    meta_aprendizaje: "Identifica las principales fuentes del conocimiento humano y aplica el pensamiento crítico para evaluar la validez y confiabilidad de argumentos y afirmaciones.",
    categoria: "Filosofía",
    subcategoria: "Epistemología y pensamiento crítico",
    ejes_articuladores: ["Pensamiento crítico"],
    transversalidades: ["LC-I", "CS-I", "CNEYT-I"],
    tiempo_estimado_horas: 4.5,
  },
  {
    codigo: "HUM-I-P03",
    numero: 3,
    titulo: "Ética: valores, principios y dilemas morales",
    descripcion: "Ética y moral: diferencias y relación. Teorías éticas básicas: utilitarismo, deontología y ética de la virtud. Dilemas morales y toma de decisiones. Ética en la vida cotidiana.",
    descripcion_extendida: "Los estudiantes comprenden la ética como la reflexión filosófica sobre el bien actuar y su diferencia con la moral como conjunto de normas socialmente aceptadas. Se trabajan las tres grandes tradiciones éticas (utilitarismo de Mill, deontología de Kant, ética de la virtud de Aristóteles) aplicándolas a dilemas morales contemporáneos (eutanasia, uso de datos personales, responsabilidad ambiental). El énfasis está en desarrollar la capacidad de argumentar éticamente y reconocer la complejidad de los dilemas, no en dar respuestas definitivas.",
    meta_aprendizaje: "Aplica las principales teorías éticas al análisis de dilemas morales contemporáneos, desarrollando la capacidad de argumentar éticamente con rigor y apertura al diálogo.",
    categoria: "Filosofía",
    subcategoria: "Ética y valores",
    ejes_articuladores: ["Pensamiento crítico", "Ciudadanía", "Igualdad de género"],
    transversalidades: ["CS-I", "LC-I"],
    tiempo_estimado_horas: 5,
  },
  {
    codigo: "HUM-I-P04",
    numero: 4,
    titulo: "Historia: tiempo, fuentes y métodos",
    descripcion: "El tiempo histórico: cronología, periodización y simultaneidad. Fuentes históricas: primarias y secundarias, su crítica y uso. El método histórico. Historia y memoria.",
    descripcion_extendida: "Los estudiantes aprenden a pensar históricamente comprendiendo que la historia es una construcción interpretativa del pasado, no un inventario de hechos fijos. Se trabajan los conceptos de continuidad y cambio, causa y consecuencia, perspectiva histórica y relevancia. El análisis de fuentes primarias (documentos, fotografías, testimonios orales) permite a los estudiantes actuar como historiadores, sometiendo las fuentes a crítica interna y externa. Se discute la diferencia entre historia y memoria, y cómo ambas construyen la identidad colectiva.",
    meta_aprendizaje: "Comprende el tiempo histórico y el método de análisis de fuentes, aplicando la perspectiva histórica para interpretar el pasado como construcción interpretativa.",
    categoria: "Historia",
    subcategoria: "Método histórico y tiempo",
    ejes_articuladores: ["Interculturalidad crítica", "Pensamiento crítico"],
    transversalidades: ["LC-I", "CS-I"],
    tiempo_estimado_horas: 4,
  },
  {
    codigo: "HUM-I-P05",
    numero: 5,
    titulo: "Las civilizaciones antiguas y el origen de la cultura",
    descripcion: "Las grandes civilizaciones de la antigüedad: Mesopotamia, Egipto, Grecia, Roma y Mesoamérica. Aportes culturales, científicos y filosóficos. El legado de la antigüedad en el mundo contemporáneo.",
    descripcion_extendida: "Los estudiantes exploran las grandes civilizaciones de la antigüedad reconociendo que todas las culturas humanas son igualmente complejas y valiosas, evitando el eurocentrismo. Se trabajan en paralelo las civilizaciones mesoamericanas (olmeca, maya, mexica) y las mediterráneas (griega, romana), identificando sus aportes en filosofía, ciencia, arte, arquitectura y organización política. El análisis de vestigios y fuentes documentales permite comprender cómo se construye el conocimiento histórico sobre el mundo antiguo.",
    meta_aprendizaje: "Analiza los aportes culturales, científicos y filosóficos de las civilizaciones antiguas (incluyendo Mesoamérica), reconociendo su influencia en el mundo contemporáneo desde una perspectiva no eurocéntrica.",
    categoria: "Historia",
    subcategoria: "Historia antigua y Mesoamérica",
    ejes_articuladores: ["Interculturalidad crítica", "Pensamiento crítico"],
    transversalidades: ["CS-I", "LC-I"],
    tiempo_estimado_horas: 5,
  },
  {
    codigo: "HUM-I-P06",
    numero: 6,
    titulo: "Arte y expresión: lenguajes artísticos y apreciación",
    descripcion: "Los lenguajes del arte: plástica, música, literatura, teatro y danza. Elementos del análisis artístico. Apreciación e interpretación. Arte popular y arte de élite. Arte mexicano.",
    descripcion_extendida: "Los estudiantes desarrollan competencias de apreciación e interpretación artística, comprendiendo que el arte es un lenguaje específico con sus propias reglas y convenciones. Se trabajan los elementos formales de análisis (línea, color, forma, ritmo, armonía) en distintas expresiones artísticas, con énfasis en el arte mexicano (muralismo, música popular, literatura, arquitectura prehispánica y colonial). Se discute la distinción entre arte popular y arte de élite como construcción social, y se exploran las funciones del arte en distintas culturas y períodos históricos.",
    meta_aprendizaje: "Analiza e interpreta expresiones artísticas de distintos lenguajes y culturas usando categorías de análisis, valorando el arte mexicano como expresión de identidad cultural.",
    categoria: "Arte y expresión",
    subcategoria: "Lenguajes artísticos y apreciación",
    ejes_articuladores: ["Apropiación de las culturas a través de la lectura y la escritura", "Interculturalidad crítica"],
    transversalidades: ["LC-I", "CS-I"],
    tiempo_estimado_horas: 4.5,
  },
  {
    codigo: "HUM-I-P07",
    numero: 7,
    titulo: "Literatura y condición humana",
    descripcion: "La literatura como expresión de la condición humana. Géneros literarios: narrativa, lírica y dramática. Análisis literario básico: tema, estilo y contexto. Literatura mexicana e iberoamericana.",
    descripcion_extendida: "Los estudiantes se acercan a la literatura como forma de conocimiento que explora la condición humana desde el interior de la experiencia subjetiva, diferenciándose del conocimiento científico y filosófico. Se analizan textos literarios representativos de la literatura mexicana e iberoamericana (cuentos, poemas, fragmentos dramáticos) identificando temas, recursos literarios y contexto histórico-cultural. Se trabaja la escritura creativa como forma de expresión personal y se promueve la lectura por placer como hábito que trasciende la escuela.",
    meta_aprendizaje: "Analiza textos literarios de distintos géneros identificando temas, recursos y contexto, y produce textos creativos breves como expresión de su experiencia y visión del mundo.",
    categoria: "Literatura",
    subcategoria: "Análisis y producción literaria",
    ejes_articuladores: ["Apropiación de las culturas a través de la lectura y la escritura", "Interculturalidad crítica"],
    transversalidades: ["LC-I", "IN-I"],
    tiempo_estimado_horas: 5,
  },
  {
    codigo: "HUM-I-P08",
    numero: 8,
    titulo: "Las humanidades y los problemas del presente",
    descripcion: "Aplicación de las humanidades a problemas contemporáneos: bioética, crisis ecológica, inteligencia artificial y democracia. Las humanidades digitales. El humanismo crítico como actitud.",
    descripcion_extendida: "Los estudiantes integran los aprendizajes de las progresiones anteriores aplicando las herramientas humanísticas (análisis filosófico, perspectiva histórica, análisis artístico, reflexión ética) a problemas complejos del presente. Se abordan la bioética (dilemas de la medicina moderna), la crisis ecológica como problema ético-político, la inteligencia artificial y el impacto en el trabajo y la creatividad, y la salud de la democracia en el mundo. La actividad final es un ensayo breve que aplica el humanismo crítico a un problema de la realidad del estudiante.",
    meta_aprendizaje: "Aplica las herramientas analíticas de las humanidades (filosófica, histórica, ética, estética) a problemas contemporáneos complejos, desarrollando el humanismo crítico como actitud intelectual.",
    categoria: "Humanidades aplicadas",
    subcategoria: "Humanismo y problemas del presente",
    ejes_articuladores: ["Pensamiento crítico", "Ciudadanía", "Igualdad de género"],
    transversalidades: ["CS-I", "CNEYT-I", "LC-I"],
    tiempo_estimado_horas: 5,
  },
] as const;

export async function seedHUMI(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed HUM-I (Humanidades I)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", "HUM-I")
    .single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC HUM-I no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const uac_id = uacRow.id;

  const rows = PROGRESIONES_HUMI.map((p) => ({
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
  if (error) throw new Error(`Error seeding progresiones HUM-I: ${error.message}`);
  console.log(`  ✓ ${rows.length} progresiones de HUM-I enriquecidas (es_placeholder=true)`);
  console.log("\n✅ Seed HUM-I completado.\n");
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
  seedHUMI(sb).catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
}

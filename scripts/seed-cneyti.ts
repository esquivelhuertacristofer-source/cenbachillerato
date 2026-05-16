/**
 * Seed de progresiones reales para CNEYT-I (Ciencias Naturales, Experimentales y Tecnología I).
 * Alineado con el MCCEMS oficial — Semestre 1.
 *
 * Uso: npx tsx scripts/seed-cneyti.ts
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

// ── Datos de las 10 progresiones de CNEYT-I ──────────────────────────────────
// Fuente: MCCEMS — Recurso Sociocognitivo: Ciencias Naturales, Experimentales
//         y Tecnología — Semestre 1

const PROGRESIONES_CNEYTI = [
  {
    codigo: "CNEYT-I-P01",
    numero: 1,
    titulo: "La ciencia: método científico y pensamiento científico",
    descripcion: "El conocimiento científico y sus características. El método científico: observación, hipótesis, experimentación y conclusión. Tipos de ciencias. Historia y filosofía de la ciencia.",
    descripcion_extendida: "Los estudiantes comprenden el método científico no como un algoritmo rígido sino como una actitud de indagación sistemática y apertura a la revisión. Se trabajan las características del conocimiento científico (empírico, racional, objetivo, provisional, sistemático) y se discuten las diferencias entre ciencia, pseudociencia y religión. A través del análisis de descubrimientos históricos (teoría heliocéntrica, vacunas, evolución, relatividad), los estudiantes comprenden cómo el conocimiento científico se construye colectiva y progresivamente. La actividad experimental introductoria aplica el método científico a una pregunta simple del entorno.",
    meta_aprendizaje: "Comprende las características del conocimiento científico y aplica el método científico a situaciones problema simples, distinguiendo ciencia de pseudociencia.",
    categoria: "Naturaleza de la ciencia",
    subcategoria: "Método y pensamiento científico",
    ejes_articuladores: ["Pensamiento crítico"],
    transversalidades: ["PM-I", "LC-I"],
    tiempo_estimado_horas: 4,
  },
  {
    codigo: "CNEYT-I-P02",
    numero: 2,
    titulo: "Materia, energía y sus transformaciones",
    descripcion: "Propiedades de la materia: físicas y químicas. Estados de la materia y cambios de estado. Energía: formas y transformaciones. Ley de conservación de la materia y la energía.",
    descripcion_extendida: "Los estudiantes exploran los conceptos fundamentales de materia y energía a través de fenómenos observables en la vida cotidiana. Se trabajan experimentalmente las propiedades de la materia (masa, volumen, densidad, punto de fusión y ebullición) y se analizan los cambios de estado como fenómenos energéticos. Las formas de energía (mecánica, térmica, química, eléctrica, nuclear) se trabajan en relación con sus transformaciones, subrayando la ley de conservación como principio unificador de las ciencias. Los experimentos simples usan materiales accesibles para hacer tangibles los conceptos abstractos.",
    meta_aprendizaje: "Describe las propiedades de la materia y las transformaciones de energía en situaciones cotidianas, aplicando la ley de conservación de la materia y la energía.",
    categoria: "Física y química básica",
    subcategoria: "Materia y energía",
    ejes_articuladores: ["Pensamiento crítico"],
    transversalidades: ["PM-I"],
    tiempo_estimado_horas: 5,
  },
  {
    codigo: "CNEYT-I-P03",
    numero: 3,
    titulo: "La célula: unidad de vida",
    descripcion: "La teoría celular. Tipos celulares: procarionte y eucarionte, animal y vegetal. Organelos y sus funciones. Procesos celulares básicos: transporte, respiración y reproducción celular.",
    descripcion_extendida: "Los estudiantes comprenden la célula como unidad estructural y funcional de todos los seres vivos, explorando su organización y los procesos que la mantienen viva. Se trabajan los organelos y sus funciones de forma funcional (¿para qué sirve cada uno?) y no meramente memorística. Se introduce la diferencia entre procarionte y eucarionte como salto evolutivo fundamental. Los procesos celulares básicos (difusión, ósmosis, respiración celular) se ilustran con experimentos simples y simulaciones interactivas. La reflexión final conecta la biología celular con la salud: ¿qué pasa cuando las células fallan?",
    meta_aprendizaje: "Comprende la teoría celular, distingue los tipos celulares y describe los procesos básicos que mantienen la vida a nivel celular, vinculándolos con la salud.",
    categoria: "Biología",
    subcategoria: "Célula y procesos vitales",
    ejes_articuladores: ["Vida saludable", "Pensamiento crítico"],
    transversalidades: ["PM-I"],
    tiempo_estimado_horas: 5,
  },
  {
    codigo: "CNEYT-I-P04",
    numero: 4,
    titulo: "Genética básica: herencia y variación",
    descripcion: "Las leyes de Mendel. Conceptos de gen, alelo, genotipo y fenotipo. Herencia dominante y recesiva. Mutaciones y variabilidad genética. Biotecnología y sus implicaciones éticas.",
    descripcion_extendida: "Los estudiantes comprenden los principios básicos de la herencia a partir de los experimentos de Mendel con guisantes, aplicando los conceptos de dominancia, recesividad, homocigoto, heterocigoto y cuadro de Punnett. Se trabajan las excepciones a las leyes de Mendel (codominancia, dominancia incompleta) con ejemplos del mundo real. La biotecnología (transgénicos, terapia génica, secuenciación del genoma) se introduce como extensión de la genética con implicaciones éticas y sociales que invitan a la reflexión ciudadana. Los patrones de herencia de rasgos sencillos en la familia del estudiante se usan como punto de partida.",
    meta_aprendizaje: "Aplica los principios de la genética mendeliana para predecir patrones de herencia e interpreta críticamente las implicaciones éticas de la biotecnología.",
    categoria: "Biología",
    subcategoria: "Genética y herencia",
    ejes_articuladores: ["Pensamiento crítico", "Vida saludable"],
    transversalidades: ["PM-I", "HUM-I"],
    tiempo_estimado_horas: 5,
  },
  {
    codigo: "CNEYT-I-P05",
    numero: 5,
    titulo: "Evolución: el origen y diversidad de la vida",
    descripcion: "La teoría de la evolución por selección natural (Darwin). Evidencias de la evolución: registro fósil, anatomía comparada, biología molecular. Evolución humana. Diversidad y clasificación de los seres vivos.",
    descripcion_extendida: "Los estudiantes comprenden la teoría evolutiva como el eje unificador de la biología, no como una opinión sino como la teoría científica mejor fundamentada sobre el origen de la diversidad de la vida. Se trabajan las evidencias de la evolución desde múltiples campos (paleontología, anatomía comparada, embriología, biología molecular) y se aplica la selección natural a casos actuales (resistencia a antibióticos, evolución de los perros domésticos). La evolución humana se trabaja con respeto a las creencias culturales pero con rigor científico.",
    meta_aprendizaje: "Comprende la teoría evolutiva por selección natural, analiza sus evidencias desde múltiples campos y relaciona la diversidad biológica con los procesos evolutivos.",
    categoria: "Biología",
    subcategoria: "Evolución y diversidad",
    ejes_articuladores: ["Pensamiento crítico", "Interculturalidad crítica"],
    transversalidades: ["HUM-I", "CS-I"],
    tiempo_estimado_horas: 5,
  },
  {
    codigo: "CNEYT-I-P06",
    numero: 6,
    titulo: "Ecosistemas, biodiversidad y sustentabilidad",
    descripcion: "Concepto de ecosistema: componentes bióticos y abióticos. Cadenas y redes tróficas. Flujo de energía y ciclos biogeoquímicos. Biodiversidad de México. Crisis ecológica y sustentabilidad.",
    descripcion_extendida: "Los estudiantes analizan los ecosistemas como sistemas complejos donde los seres vivos interactúan entre sí y con su entorno, identificando los flujos de energía y materia que los mantienen. Se trabaja la extraordinaria biodiversidad de México (4to lugar mundial) como patrimonio natural y responsabilidad colectiva. La crisis ecológica (pérdida de biodiversidad, cambio climático, contaminación, deforestación) se aborda con datos actualizados, y la sustentabilidad se trabaja como marco para pensar las relaciones entre sociedad, economía y naturaleza. El análisis del ecosistema local conecta lo global con lo cercano.",
    meta_aprendizaje: "Analiza la estructura y funcionamiento de los ecosistemas, valora la biodiversidad de México como patrimonio y evalúa la crisis ecológica desde una perspectiva de sustentabilidad.",
    categoria: "Ecología y sustentabilidad",
    subcategoria: "Ecosistemas y biodiversidad",
    ejes_articuladores: ["Pensamiento crítico", "Ciudadanía"],
    transversalidades: ["CS-I", "HUM-I"],
    tiempo_estimado_horas: 5,
  },
  {
    codigo: "CNEYT-I-P07",
    numero: 7,
    titulo: "Química del mundo cotidiano: mezclas, soluciones y reacciones",
    descripcion: "Mezclas homogéneas y heterogéneas. Soluciones: soluto, solvente y concentración. Reacciones químicas: tipos y signos de cambio. pH y acidez en la vida cotidiana.",
    descripcion_extendida: "Los estudiantes exploran la química desde la perspectiva de los fenómenos que ya conocen: la sal que se disuelve en agua, el vinagre que reacciona con el bicarbonato, el jabón que limpia la grasa. Se trabajan las mezclas y sus métodos de separación, las soluciones y su concentración, y las reacciones químicas con sus signos de cambio (temperatura, color, precipitado, gas). El pH se trabaja con indicadores naturales (col morada) y se conecta con la química del cuerpo humano, los alimentos y los productos de limpieza del hogar.",
    meta_aprendizaje: "Describe y distingue mezclas, soluciones y reacciones químicas en fenómenos cotidianos, aplicando conceptos de pH y concentración en contextos de vida diaria.",
    categoria: "Química",
    subcategoria: "Mezclas, soluciones y reacciones",
    ejes_articuladores: ["Vida saludable", "Pensamiento crítico"],
    transversalidades: ["PM-I"],
    tiempo_estimado_horas: 5,
  },
  {
    codigo: "CNEYT-I-P08",
    numero: 8,
    titulo: "Física del movimiento: cinemática y dinámica básica",
    descripcion: "Magnitudes físicas: escalares y vectoriales. Movimiento rectilíneo uniforme y uniformemente acelerado. Las leyes de Newton. Aplicaciones: vehículos, deportes y tecnología.",
    descripcion_extendida: "Los estudiantes estudian el movimiento de los cuerpos aplicando las leyes de Newton en situaciones cotidianas (frenada de un auto, pelota en caída libre, cohete, colisión). Se trabajan las magnitudes físicas y su medición, las ecuaciones del movimiento rectilíneo (MRU y MRUA) con resolución gráfica y algebraica, y las tres leyes de Newton con énfasis en sus aplicaciones tecnológicas. Se utiliza el análisis de datos de movimientos reales (videotracking simple con el celular) como forma de conectar la teoría con la práctica experimental.",
    meta_aprendizaje: "Aplica los conceptos de cinemática y las leyes de Newton para describir y predecir el movimiento de cuerpos en situaciones cotidianas y tecnológicas.",
    categoria: "Física",
    subcategoria: "Cinemática y dinámica",
    ejes_articuladores: ["Pensamiento crítico"],
    transversalidades: ["PM-I"],
    tiempo_estimado_horas: 5.5,
  },
  {
    codigo: "CNEYT-I-P09",
    numero: 9,
    titulo: "Tecnología e innovación: el ser humano transforma el mundo",
    descripcion: "La tecnología como sistema. Historia de la tecnología. Innovación y diseño tecnológico: ciclo de vida de un producto. Tecnologías emergentes: IA, robótica, biotecnología e impresión 3D.",
    descripcion_extendida: "Los estudiantes comprenden la tecnología como la aplicación del conocimiento científico para transformar el entorno y resolver problemas humanos, distinguiéndola de la ciencia pura. Se trabaja la historia de la tecnología como proceso no lineal de innovación e impacto social, y se introduce el proceso de diseño tecnológico (identificar problema → definir requerimientos → generar ideas → prototipar → evaluar). Las tecnologías emergentes (inteligencia artificial, robótica, biotecnología, impresión 3D) se analizan con sus posibilidades y sus implicaciones éticas y sociales.",
    meta_aprendizaje: "Comprende el proceso de diseño tecnológico y analiza críticamente el impacto de las tecnologías emergentes en la sociedad, la economía y el medio ambiente.",
    categoria: "Tecnología e innovación",
    subcategoria: "Diseño tecnológico y tecnologías emergentes",
    ejes_articuladores: ["Pensamiento crítico", "Ciudadanía"],
    transversalidades: ["CD-I", "PM-I", "HUM-I"],
    tiempo_estimado_horas: 4.5,
  },
  {
    codigo: "CNEYT-I-P10",
    numero: 10,
    titulo: "Salud, ciencia y bienestar integral",
    descripcion: "Determinantes de la salud: biológicos, sociales y ambientales. Enfermedades infecciosas, crónicas y emergentes. Vacunas y sistema inmune. Salud mental. Ciencia y políticas de salud pública.",
    descripcion_extendida: "Los estudiantes analizan la salud desde una perspectiva integral (física, mental, social y ambiental) comprendiendo que la salud no es solo la ausencia de enfermedad. Se trabajan los determinantes sociales de la salud (nutrición, acceso a servicios, condiciones laborales, medio ambiente) con datos de México, y se analiza el papel de la ciencia en el desarrollo de vacunas y tratamientos con énfasis en la evidencia científica frente a la desinformación. La salud mental se aborda con datos y sin estigma, conectando con los recursos socioemocionales del MCCEMS.",
    meta_aprendizaje: "Analiza los determinantes biológicos, sociales y ambientales de la salud, comprende el funcionamiento del sistema inmune y evalúa la información de salud con criterio científico.",
    categoria: "Salud y bienestar",
    subcategoria: "Ciencia y salud pública",
    ejes_articuladores: ["Vida saludable", "Pensamiento crítico", "Ciudadanía"],
    transversalidades: ["CS-I", "HUM-I", "PM-I"],
    tiempo_estimado_horas: 5,
  },
] as const;

export async function seedCNEYTI(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed CNEYT-I (Ciencias Naturales, Experimentales y Tecnología I)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", "CNEYT-I")
    .single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC CNEYT-I no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const uac_id = uacRow.id;

  const rows = PROGRESIONES_CNEYTI.map((p) => ({
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
  if (error) throw new Error(`Error seeding progresiones CNEYT-I: ${error.message}`);
  console.log(`  ✓ ${rows.length} progresiones de CNEYT-I enriquecidas (es_placeholder=true)`);
  console.log("\n✅ Seed CNEYT-I completado.\n");
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
  seedCNEYTI(sb).catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
}

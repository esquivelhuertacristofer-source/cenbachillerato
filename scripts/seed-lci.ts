/**
 * Seed de progresiones reales para LC-I (Lengua y Comunicación I).
 * Alineado con el MCCEMS oficial — Semestre 1.
 *
 * Uso: npx tsx scripts/seed-lci.ts
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

// ── Datos de las 10 progresiones de LC-I ────────────────────────────────────
// Fuente: Marco Curricular Común de la Educación Media Superior (MCCEMS)
//         Recurso Sociocognitivo: Lengua y Comunicación — Semestre 1

const PROGRESIONES_LCI = [
  {
    codigo: "LC-I-P01",
    numero: 1,
    titulo: "La comunicación humana y sus dimensiones",
    descripcion: "Exploración de los modelos de comunicación (Shannon-Weaver, Jakobson) y sus elementos constitutivos: emisor, receptor, mensaje, canal, código y contexto.",
    descripcion_extendida: "Los estudiantes identifican y analizan los componentes del proceso comunicativo a través de situaciones cotidianas y mediáticas. Se enfatiza la dimensión contextual e intencional de todo acto comunicativo, reconociendo que comunicar es siempre un acto social e histórico. Se incorpora el análisis de funciones del lenguaje (emotiva, conativa, referencial, poética, fática y metalingüística) como herramienta para comprender la diversidad de usos comunicativos.",
    meta_aprendizaje: "Analiza los elementos y funciones del proceso comunicativo en situaciones concretas, reconociendo la intencionalidad y el contexto como factores determinantes del significado.",
    categoria: "Comunicación oral y escrita",
    subcategoria: "Modelos y funciones de la comunicación",
    ejes_articuladores: ["Igualdad de género", "Inclusión"],
    transversalidades: ["IN-I", "CS-I"],
    tiempo_estimado_horas: 4,
  },
  {
    codigo: "LC-I-P02",
    numero: 2,
    titulo: "Lenguaje, lengua, habla y dialecto",
    descripcion: "Distinción entre lenguaje como facultad humana, lengua como sistema compartido, habla como realización individual y dialecto como variante regional o social.",
    descripcion_extendida: "A partir de textos literarios, conversaciones grabadas y materiales audiovisuales, los estudiantes distinguen los conceptos saussureanos fundamentales e identifican la riqueza de la variación lingüística del español mexicano. Se analiza la relación entre lengua e identidad cultural, con especial atención a las variedades dialectales de México y al valor de las lenguas indígenas nacionales. La reflexión metalingüística se vincula con actitudes de respeto a la diversidad.",
    meta_aprendizaje: "Distingue los conceptos de lenguaje, lengua, habla y dialecto, y valora la diversidad lingüística como expresión de identidades culturales.",
    categoria: "Lingüística y variación",
    subcategoria: "Variación y diversidad lingüística",
    ejes_articuladores: ["Interculturalidad crítica", "Inclusión"],
    transversalidades: ["HUM-I", "CS-I"],
    tiempo_estimado_horas: 3.5,
  },
  {
    codigo: "LC-I-P03",
    numero: 3,
    titulo: "La lectura como proceso activo de construcción de significado",
    descripcion: "Modelos de lectura (ascendente, descendente e interactivo) y estrategias de comprensión lectora: prelectura, lectura y poslectura.",
    descripcion_extendida: "Los estudiantes reconocen que leer es un proceso cognitivo complejo que va más allá de la decodificación de signos. Se trabajan estrategias concretas: activación de conocimientos previos, formulación de hipótesis, monitoreo de la comprensión, elaboración de inferencias y síntesis. Se aplican estas estrategias en textos de divulgación científica, noticia periodística y fragmento literario, promoviendo la lectura crítica como herramienta ciudadana.",
    meta_aprendizaje: "Aplica estrategias de comprensión lectora (prelectura, lectura y poslectura) en textos de distintos géneros, construyendo significado a partir del diálogo entre el texto y sus conocimientos previos.",
    categoria: "Comprensión lectora",
    subcategoria: "Estrategias de lectura",
    ejes_articuladores: ["Pensamiento crítico", "Apropiación de las culturas a través de la lectura y la escritura"],
    transversalidades: ["IN-I", "CNEYT-I"],
    tiempo_estimado_horas: 5,
  },
  {
    codigo: "LC-I-P04",
    numero: 4,
    titulo: "Tipos y géneros textuales",
    descripcion: "Clasificación de textos según su propósito comunicativo: narrativos, descriptivos, expositivos, argumentativos e instructivos. Reconocimiento de sus características formales.",
    descripcion_extendida: "Los estudiantes construyen un mapa tipológico de los textos que circulan en su entorno cotidiano (redes sociales, escuela, hogar, medios). Se analizan ejemplos auténticos de cada tipo y se discute cómo el propósito del texto determina su estructura, su lenguaje y su audiencia. Se hace énfasis en la hibridación textual propia de los géneros digitales (post, hilo, infografía) como evidencia de la evolución de los géneros discursivos.",
    meta_aprendizaje: "Identifica y caracteriza distintos tipos y géneros textuales a partir de su propósito comunicativo, estructura y rasgos lingüísticos, reconociendo la hibridación de géneros en entornos digitales.",
    categoria: "Géneros discursivos",
    subcategoria: "Tipología y clasificación textual",
    ejes_articuladores: ["Apropiación de las culturas a través de la lectura y la escritura", "Pensamiento crítico"],
    transversalidades: ["CD-I", "IN-I"],
    tiempo_estimado_horas: 4,
  },
  {
    codigo: "LC-I-P05",
    numero: 5,
    titulo: "El texto narrativo: elementos y análisis",
    descripcion: "Análisis de la narrativa literaria y cotidiana: narrador, personajes, espacio, tiempo, trama y tema. Narrativa oral e identidad cultural.",
    descripcion_extendida: "Los estudiantes analizan cuentos cortos, microrrelatos y narraciones orales de tradición oral mexicana, identificando los elementos estructurales del texto narrativo. Se trabaja la distinción entre historia y discurso (qué se cuenta y cómo se cuenta), y se introducen categorías narratológicas básicas (focalización, analepsis, prolepsis). La actividad culmina con la producción de una narración breve que incorpore un elemento de la tradición oral local, vinculando la competencia literaria con la identidad cultural.",
    meta_aprendizaje: "Analiza textos narrativos identificando sus elementos constitutivos y produce una narración breve con intención literaria, reconociendo el valor de la tradición oral como patrimonio cultural.",
    categoria: "Literatura y narrativa",
    subcategoria: "Narrativa literaria y oral",
    ejes_articuladores: ["Apropiación de las culturas a través de la lectura y la escritura", "Interculturalidad crítica"],
    transversalidades: ["HUM-I", "CS-I"],
    tiempo_estimado_horas: 5,
  },
  {
    codigo: "LC-I-P06",
    numero: 6,
    titulo: "El texto descriptivo: técnicas y aplicaciones",
    descripcion: "Descripción objetiva y subjetiva. Recursos lingüísticos de la descripción: adjetivación, comparaciones y orden de presentación. Aplicaciones en contextos académicos y creativos.",
    descripcion_extendida: "A través del análisis de textos científicos, turísticos y literarios, los estudiantes identifican los recursos lingüísticos propios de la descripción e identifican el efecto que producen distintos tipos de adjetivación, orden de presentación y punto de vista descriptivo. Se trabaja la distinción entre descripción técnica (objetiva) y descripción literaria (subjetiva). La producción escrita integra la descripción de objetos, personas, lugares y procesos, promoviendo la precisión léxica.",
    meta_aprendizaje: "Produce textos descriptivos con precisión léxica y adecuación al propósito, distinguiendo entre la descripción objetiva y subjetiva en contextos académicos y creativos.",
    categoria: "Producción escrita",
    subcategoria: "Descripción y precisión léxica",
    ejes_articuladores: ["Apropiación de las culturas a través de la lectura y la escritura"],
    transversalidades: ["CNEYT-I", "CD-I"],
    tiempo_estimado_horas: 3.5,
  },
  {
    codigo: "LC-I-P07",
    numero: 7,
    titulo: "El párrafo: unidad de significado y coherencia textual",
    descripcion: "Estructura del párrafo (oración temática, oraciones de desarrollo, oración de cierre). Tipos de párrafos. Propiedades textuales: coherencia, cohesión y adecuación.",
    descripcion_extendida: "Los estudiantes analizan y producen párrafos de distintos tipos (enunciativo, de enumeración, de causa-efecto, de contraste, de problema-solución) comprendiendo que el párrafo es la unidad mínima de organización del pensamiento en el texto escrito. Se trabajan explícitamente los mecanismos de cohesión (conectores, referencia, sustitución, elipsis) y las propiedades de coherencia y adecuación. La revisión colaborativa entre pares se usa como herramienta de mejora de la producción escrita.",
    meta_aprendizaje: "Redacta párrafos coherentes y cohesivos utilizando distintas estructuras según el propósito comunicativo, empleando mecanismos de cohesión textual de forma consciente.",
    categoria: "Producción escrita",
    subcategoria: "Estructura y cohesión textual",
    ejes_articuladores: ["Apropiación de las culturas a través de la lectura y la escritura", "Pensamiento crítico"],
    transversalidades: ["PM-I", "IN-I"],
    tiempo_estimado_horas: 4.5,
  },
  {
    codigo: "LC-I-P08",
    numero: 8,
    titulo: "Comunicación oral: la exposición y la conversación académica",
    descripcion: "Planificación y estructura de la exposición oral. Recursos paraverbales (volumen, ritmo, entonación) y no verbales (gestos, postura, contacto visual). La escucha activa.",
    descripcion_extendida: "Los estudiantes diseñan y presentan exposiciones orales breves sobre temas de su interés o vinculados a otras UAC, aplicando una estructura clara (introducción, desarrollo, conclusión) y atendiendo a los recursos paraverbales y no verbales. Se trabaja explícitamente la escucha activa y la retroalimentación constructiva entre pares. El componente de comunicación oral se vincula con la participación ciudadana y la capacidad de argumentar en espacios públicos, fundamentales para la vida democrática.",
    meta_aprendizaje: "Planifica y presenta exposiciones orales estructuradas, utilizando recursos paraverbales y no verbales de forma consciente, y practica la escucha activa como competencia comunicativa.",
    categoria: "Comunicación oral y escrita",
    subcategoria: "Oralidad formal e informal",
    ejes_articuladores: ["Vida saludable", "Igualdad de género", "Inclusión"],
    transversalidades: ["CS-I", "HUM-I"],
    tiempo_estimado_horas: 4,
  },
  {
    codigo: "LC-I-P09",
    numero: 9,
    titulo: "Medios de comunicación, multimodalidad y literacidad digital",
    descripcion: "Análisis crítico de los medios: prensa, radio, televisión e internet. Multimodalidad: combinación de lenguajes verbal, visual, sonoro y gestual. Competencia mediática.",
    descripcion_extendida: "Los estudiantes analizan textos multimodales (anuncios publicitarios, infografías, memes, videos explicativos) comprendiendo cómo se articulan distintos sistemas de signos para producir significado. Se abordan conceptos de literacidad digital: verificación de fuentes, derechos de autor, gestión de la privacidad y producción responsable de contenidos. La actividad culmina con la producción colaborativa de un texto multimodal (infografía o video breve) sobre un tema de relevancia social.",
    meta_aprendizaje: "Analiza críticamente textos multimodales identificando los recursos semióticos utilizados, y produce contenidos digitales con responsabilidad, creatividad y propósito comunicativo claro.",
    categoria: "Literacidad digital y medios",
    subcategoria: "Multimodalidad y competencia mediática",
    ejes_articuladores: ["Apropiación de las culturas a través de la lectura y la escritura", "Pensamiento crítico", "Ciudadanía"],
    transversalidades: ["CD-I", "CNEYT-I"],
    tiempo_estimado_horas: 5,
  },
  {
    codigo: "LC-I-P10",
    numero: 10,
    titulo: "El texto argumentativo y el pensamiento crítico",
    descripcion: "Estructura del argumento: tesis, argumentos de apoyo y conclusión. Tipos de argumentos (autoridad, ejemplo, analogía, estadístico). Identificación de falacias comunes.",
    descripcion_extendida: "Los estudiantes leen y producen textos argumentativos breves (cartas de opinión, ensayos cortos, comentarios razonados) comprendiendo la estructura lógica del argumento. Se analizan textos de opinión de medios nacionales para identificar tipos de argumentos, estrategias retóricas y falacias lógicas comunes (ad hominem, pendiente resbaladiza, apelación a la emoción). La integración con el pensamiento crítico se concreta en la evaluación de la solidez y la pertinencia de los argumentos, preparando a los estudiantes para la argumentación académica y ciudadana.",
    meta_aprendizaje: "Produce y analiza textos argumentativos reconociendo la estructura lógica del argumento, identifica falacias frecuentes y evalúa la validez de los razonamientos en textos de opinión.",
    categoria: "Argumentación y pensamiento crítico",
    subcategoria: "Argumentación escrita y oral",
    ejes_articuladores: ["Pensamiento crítico", "Ciudadanía", "Apropiación de las culturas a través de la lectura y la escritura"],
    transversalidades: ["CS-I", "HUM-I", "PM-I"],
    tiempo_estimado_horas: 5.5,
  },
] as const;

// ── Runner ───────────────────────────────────────────────────────────────────

export async function seedLCI(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed LC-I (Lengua y Comunicación I)\n");

  // Obtener uac_id de LC-I
  const { data: uacRow, error: uacErr } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", "LC-I")
    .single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC LC-I no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const uac_id = uacRow.id;
  console.log(`  ✓ UAC LC-I encontrada (id: ${uac_id})`);

  const rows = PROGRESIONES_LCI.map((p) => ({
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

  const { error } = await sb
    .from("progresiones")
    .upsert(rows, { onConflict: "codigo" });

  if (error) throw new Error(`Error seeding progresiones LC-I: ${error.message}`);

  console.log(`  ✓ ${rows.length} progresiones de LC-I enriquecidas (es_placeholder=true)`);
  console.log("\n✅ Seed LC-I completado.\n");
}

if (
  process.env.NODE_ENV !== "test" &&
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  config({ path: resolve(process.cwd(), ".env.local") });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("ERROR: Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
    process.exit(1);
  }

  const sb = createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  seedLCI(sb).catch((err) => {
    console.error("❌ Error en seed LC-I:", err.message);
    process.exit(1);
  });
}

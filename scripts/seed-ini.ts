/**
 * Seed de progresiones reales para IN-I (Inglés I).
 * Alineado con el MCCEMS oficial — Semestre 1.
 *
 * Uso: npx tsx scripts/seed-ini.ts
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

// ── Datos de las 8 progresiones de IN-I ─────────────────────────────────────
// Fuente: Marco Curricular Común de la Educación Media Superior (MCCEMS)
//         Recurso Sociocognitivo: Inglés — Semestre 1
// Nivel MCER: A1-A2 (usuarios básicos)

const PROGRESIONES_INI = [
  {
    codigo: "IN-I-P01",
    numero: 1,
    titulo: "Greetings, introductions and personal information",
    descripcion: "Presentaciones personales y saludos formales e informales en inglés. Vocabulario de datos personales (nombre, edad, lugar de origen, familia). Verbo to be en presente.",
    descripcion_extendida: "Los estudiantes se presentan en inglés en situaciones comunicativas simuladas (sala de clases, primer día de trabajo, reunión informal). Se trabajan los saludos formales e informales, expresiones de cortesía y el intercambio de información personal básica. La gramática se introduce de forma inductiva a través de diálogos auténticos, enfatizando el uso del verbo to be (afirmativo, negativo e interrogativo) con pronombres personales. Se desarrollan las cuatro habilidades lingüísticas (listening, speaking, reading, writing) desde la primera progresión.",
    meta_aprendizaje: "Se presenta en inglés e intercambia información personal básica en situaciones comunicativas formales e informales, usando el verbo to be en presente simple.",
    categoria: "Comunicación interpersonal",
    subcategoria: "Presentaciones y saludos",
    ejes_articuladores: ["Inclusión", "Interculturalidad crítica"],
    transversalidades: ["LC-I", "CS-I"],
    tiempo_estimado_horas: 4,
  },
  {
    codigo: "IN-I-P02",
    numero: 2,
    titulo: "Describing people, places and things",
    descripcion: "Vocabulario descriptivo: adjetivos de características físicas, personalidad y objetos. Uso de there is/there are. Artículos definidos e indefinidos (a, an, the).",
    descripcion_extendida: "Los estudiantes describen personas, objetos y lugares de su entorno usando adjetivos y las estructuras there is/there are. Se trabaja el orden de los adjetivos en inglés (opinión, tamaño, forma, color, origen, material) como contraste con el español. Los textos de input incluyen descripciones de personas en redes sociales, anuncios de búsqueda de objetos perdidos y descripciones de lugares turísticos. La producción escrita culmina en la descripción de un lugar significativo para el estudiante.",
    meta_aprendizaje: "Describe personas, objetos y lugares con vocabulario y estructuras adecuadas (adjetivos, there is/there are, artículos), produciendo textos descriptivos breves en inglés.",
    categoria: "Descripción y vocabulario",
    subcategoria: "Adjetivos y estructuras descriptivas",
    ejes_articuladores: ["Interculturalidad crítica"],
    transversalidades: ["LC-I"],
    tiempo_estimado_horas: 4,
  },
  {
    codigo: "IN-I-P03",
    numero: 3,
    titulo: "Daily routines and present simple tense",
    descripcion: "Rutinas y hábitos en inglés. Presente simple: formas afirmativa, negativa e interrogativa. Adverbios de frecuencia. Vocabulario de actividades cotidianas y tiempo libre.",
    descripcion_extendida: "Los estudiantes narran sus rutinas diarias y las de personas de su familia o comunidad usando el presente simple. Se trabajan los adverbios de frecuencia (always, usually, often, sometimes, rarely, never) y expresiones de tiempo (in the morning, at night, on weekends). El contexto cultural se enriquece con la comparación de rutinas de jóvenes de países angloparlantes, desarrollando conciencia intercultural. La producción incluye un texto descriptivo de rutina semanal y una entrevista oral a un compañero.",
    meta_aprendizaje: "Describe rutinas y hábitos en presente simple con adverbios de frecuencia, en textos orales y escritos, comparando estilos de vida de distintas culturas anglófonas.",
    categoria: "Comunicación interpersonal",
    subcategoria: "Presente simple y rutinas",
    ejes_articuladores: ["Interculturalidad crítica", "Vida saludable"],
    transversalidades: ["LC-I", "CS-I"],
    tiempo_estimado_horas: 5,
  },
  {
    codigo: "IN-I-P04",
    numero: 4,
    titulo: "Talking about the present: present continuous tense",
    descripcion: "Presente continuo para acciones en progreso. Contraste present simple vs. present continuous. Verbos de estado (stative verbs). Descripción de situaciones actuales.",
    descripcion_extendida: "Los estudiantes comprenden y usan el presente continuo para describir acciones que ocurren en el momento o en un período temporal amplio, contrastándolo con el presente simple. Se trabajan los verbos de estado (know, like, want, need) que normalmente no se usan en continuo, y se discute por qué mediante ejemplos auténticos. Los textos de input incluyen comentarios en tiempo real de un partido deportivo, transmisiones en vivo y descripciones de fotografías. La actividad de producción es la narración oral de una fotografía o escena.",
    meta_aprendizaje: "Usa el presente continuo para describir acciones en progreso, distinguiéndolo del presente simple y reconociendo los verbos de estado en contextos comunicativos reales.",
    categoria: "Gramática comunicativa",
    subcategoria: "Tiempos del presente",
    ejes_articuladores: ["Interculturalidad crítica"],
    transversalidades: ["LC-I"],
    tiempo_estimado_horas: 4,
  },
  {
    codigo: "IN-I-P05",
    numero: 5,
    titulo: "Past events: simple past tense",
    descripcion: "Pasado simple de verbos regulares e irregulares. Forma afirmativa, negativa e interrogativa. Marcadores temporales del pasado. Narración de eventos y experiencias pasadas.",
    descripcion_extendida: "Los estudiantes narran eventos pasados usando el pasado simple, trabajando los principales verbos irregulares en contexto (go-went, see-saw, have-had, make-made). Se construye de forma colaborativa una lista de los 50 verbos irregulares más frecuentes en inglés cotidiano. Los textos de input incluyen anécdotas personales, noticias históricas breves y biografías de personajes relevantes para los estudiantes. La actividad de cierre es la narración escrita de un evento memorable, con atención a la coherencia temporal y el uso de conectores narrativos.",
    meta_aprendizaje: "Narra eventos y experiencias pasadas usando el pasado simple de verbos regulares e irregulares en textos orales y escritos coherentes con marcadores temporales.",
    categoria: "Narración y descripción",
    subcategoria: "Pasado simple",
    ejes_articuladores: ["Interculturalidad crítica", "Apropiación de las culturas a través de la lectura y la escritura"],
    transversalidades: ["LC-I", "HUM-I"],
    tiempo_estimado_horas: 5,
  },
  {
    codigo: "IN-I-P06",
    numero: 6,
    titulo: "Making plans and predictions: will and going to",
    descripcion: "Expresión del futuro con will (predicciones y decisiones espontáneas) y going to (planes e intenciones). Contraste entre ambas formas. Vocabulario de planes y proyectos.",
    descripcion_extendida: "Los estudiantes comprenden y usan las dos formas principales de expresar el futuro en inglés, desarrollando la sensibilidad para elegir la forma adecuada según el contexto (predicción basada en evidencia vs. decisión espontánea, plan previo vs. promesa). Se trabajan a través de situaciones auténticas: pronósticos del tiempo, anuncios de eventos, planes de viaje y conversaciones sobre el futuro. La actividad integradora es una presentación oral de los planes del estudiante para el siguiente año escolar o sus metas profesionales.",
    meta_aprendizaje: "Expresa planes, intenciones y predicciones en inglés usando will y going to de forma contextualmente apropiada, en textos orales y escritos.",
    categoria: "Comunicación interpersonal",
    subcategoria: "Expresión del futuro",
    ejes_articuladores: ["Vida saludable", "Ciudadanía"],
    transversalidades: ["LC-I", "CS-I"],
    tiempo_estimado_horas: 4.5,
  },
  {
    codigo: "IN-I-P07",
    numero: 7,
    titulo: "Reading and understanding authentic texts",
    descripcion: "Estrategias de comprensión lectora en inglés: skimming, scanning, inferencia de vocabulario por contexto. Tipos de texto: artículo de divulgación, infografía, correo electrónico.",
    descripcion_extendida: "Los estudiantes aplican estrategias específicas de comprensión lectora en inglés trabajando con textos auténticos de nivel A2: artículos breves de revistas de divulgación (National Geographic Junior, Science for Kids), infografías temáticas e intercambios de correo electrónico. Se trabaja la inferencia de vocabulario desconocido por contexto como estrategia clave, evitando la dependencia del diccionario. El énfasis está en la comprensión global (skimming) y la localización de información específica (scanning), como preparación para los exámenes CENEVAL y las habilidades académicas del bachillerato.",
    meta_aprendizaje: "Comprende textos auténticos en inglés de nivel A2 aplicando estrategias de skimming, scanning e inferencia de vocabulario, extrayendo información global y específica.",
    categoria: "Comprensión lectora",
    subcategoria: "Lectura de textos auténticos",
    ejes_articuladores: ["Apropiación de las culturas a través de la lectura y la escritura", "Pensamiento crítico"],
    transversalidades: ["LC-I", "CNEYT-I"],
    tiempo_estimado_horas: 4,
  },
  {
    codigo: "IN-I-P08",
    numero: 8,
    titulo: "Writing in English: emails, messages and short paragraphs",
    descripcion: "Producción escrita en inglés: correo electrónico formal e informal, mensaje de texto y párrafo descriptivo/narrativo. Estructura, registro y convenciones del texto escrito en inglés.",
    descripcion_extendida: "Los estudiantes producen textos escritos breves en inglés con propósito comunicativo real: correos electrónicos formales (solicitud de información a una escuela), correos informales (mensaje a un amigo angloparlante) y párrafos de presentación personal. Se trabajan explícitamente las diferencias de registro (formal/informal) y las convenciones del inglés escrito (salutaciones, despedidas, párrafos). El proceso de escritura (planificación, borrador, revisión, edición) se practica de forma explícita con retroalimentación entre pares, preparando a los estudiantes para la escritura académica en inglés.",
    meta_aprendizaje: "Produce textos escritos breves en inglés (correos, párrafos) con propósito comunicativo claro, adecuando el registro al destinatario y siguiendo las convenciones del texto escrito.",
    categoria: "Producción escrita",
    subcategoria: "Escritura funcional y académica",
    ejes_articuladores: ["Apropiación de las culturas a través de la lectura y la escritura", "Interculturalidad crítica"],
    transversalidades: ["LC-I", "CD-I"],
    tiempo_estimado_horas: 4.5,
  },
] as const;

// ── Runner ───────────────────────────────────────────────────────────────────

export async function seedINI(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed IN-I (Inglés I)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", "IN-I")
    .single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC IN-I no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const uac_id = uacRow.id;
  console.log(`  ✓ UAC IN-I encontrada (id: ${uac_id})`);

  const rows = PROGRESIONES_INI.map((p) => ({
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

  if (error) throw new Error(`Error seeding progresiones IN-I: ${error.message}`);

  console.log(`  ✓ ${rows.length} progresiones de IN-I enriquecidas (es_placeholder=true)`);
  console.log("\n✅ Seed IN-I completado.\n");
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

  seedINI(sb).catch((err) => {
    console.error("❌ Error en seed IN-I:", err.message);
    process.exit(1);
  });
}

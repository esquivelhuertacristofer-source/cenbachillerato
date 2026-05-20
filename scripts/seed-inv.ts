/**
 * Seed de propósitos formativos oficiales para IN-V (Inglés V — A2+/B1).
 * Fuente: docs/programas-oficiales/extraidos/07-INGLES.md
 *         PDF: vf_MCC_INGLES_BN.pdf — Modelo Educativo 2025
 *
 * Semestre 5 — Título: "We are the champions"
 * Nivel MCER: A2+ / B1 — 5 horas/semana (distinto de los semestres anteriores)
 *
 * Uso: npx tsx scripts/seed-inv.ts
 * Idempotente: upsert por campo "codigo".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

const META = "Desarrolle habilidades comunicativas que le permitan comprender y producir textos orales y escritos sobre temas de interés académico, técnico, profesional o comunitario, para fortalecer su agencia lingüística, su pensamiento crítico y su colaboración.";

const PROGRESIONES_INV = [
  {
    codigo: "IN-V-P01",
    numero: 1,
    titulo: "Explora y describe el área de estudio, ocupación o interés del grupo (introduce el campo o tema y su relevancia).",
    descripcion: "Explora y describe el área de estudio, ocupación o interés del grupo, introduciendo el campo o tema y su relevancia.",
    descripcion_extendida: "Explora y describe el área de estudio, ocupación o interés del grupo (introduce el campo o tema y su relevancia). Contenidos: vocabulario temático específico al campo de interés (tecnología, salud, medio ambiente, arte, deportes); presentación oral estructurada: introducción, desarrollo, conclusión; describir con detalle: adjetivos, comparativos y relativos; presente simple y continuo revisados en contexto académico; conectores de organización: first, then, also, in addition, finally; expresar relevancia e importancia: it is important because, the main reason is; práctica de la pronunciación de terminología específica; escuchar y tomar notas sobre descripciones de campos de estudio.",
    meta_aprendizaje: META,
    categoria: "Comunicación académica",
    subcategoria: "Descripción y exploración de campos temáticos",
    ejes_articuladores: ["Pensamiento crítico"],
    transversalidades: [],
    tiempo_estimado_horas: 5,
  },
  {
    codigo: "IN-V-P02",
    numero: 2,
    titulo: "Comparte experiencias personales o escolares relacionadas con el campo de estudio elegido (narra por qué le interesa).",
    descripcion: "Comparte experiencias personales o escolares relacionadas con el campo de estudio elegido, narrando por qué le interesa.",
    descripcion_extendida: "Comparte experiencias personales o escolares relacionadas con el campo de estudio elegido (narra por qué le interesa). Contenidos: present perfect para hablar de experiencias acumuladas: I have always been interested in...; past simple para narrar experiencias específicas; conectores narrativos de secuencia y causa: because, since, due to, as a result; vocabulario emocional y de motivación: passionate about, curious about, fascinated by; narración de anécdotas relevantes al campo de interés; estrategias de cohesión textual: referencia, sustitución, conectores; comprender y discutir testimonios e historias de personas en el campo de interés.",
    meta_aprendizaje: META,
    categoria: "Comunicación académica",
    subcategoria: "Narración de experiencias académicas y personales",
    ejes_articuladores: ["Pensamiento crítico"],
    transversalidades: [],
    tiempo_estimado_horas: 5,
  },
  {
    codigo: "IN-V-P03",
    numero: 3,
    titulo: "Formula y responde preguntas sobre procesos, conceptos o procedimientos básicos (entrevistas simuladas, demostraciones, explicaciones).",
    descripcion: "Formula y responde preguntas sobre procesos, conceptos o procedimientos básicos mediante entrevistas simuladas, demostraciones y explicaciones.",
    descripcion_extendida: "Formula y responde preguntas sobre procesos, conceptos o procedimientos básicos (entrevistas simuladas, demostraciones, explicaciones). Contenidos: formas interrogativas avanzadas: How does it work? What happens when...? Why is it important to...? What are the steps to...?; voz pasiva introducción: it is used to..., it is made of...; procedimientos paso a paso: first you need to, then you should, after that, finally; vocabulario de proceso y causa-efecto: leads to, results in, causes, enables; entrevista como género discursivo; preguntas abiertas vs. cerradas; estrategias de aclaración y reformulación: Could you explain what you mean? In other words...; práctica con demostraciones cortas.",
    meta_aprendizaje: META,
    categoria: "Habilidades comunicativas B1",
    subcategoria: "Formulación de preguntas y explicación de procesos",
    ejes_articuladores: ["Pensamiento crítico"],
    transversalidades: ["CNEYT-V"],
    tiempo_estimado_horas: 5,
  },
  {
    codigo: "IN-V-P04",
    numero: 4,
    titulo: "Expresa opiniones, preferencias y preocupaciones sobre temas relacionados con el campo de estudio o la comunidad.",
    descripcion: "Expresa opiniones, preferencias y preocupaciones sobre temas relacionados con el campo de estudio o la comunidad.",
    descripcion_extendida: "Expresa opiniones, preferencias y preocupaciones sobre temas relacionados con el campo de estudio o la comunidad. Contenidos: expresar opinión con fundamentos: In my opinion..., I believe that..., From my perspective..., The evidence suggests...; modales para hipótesis y posibilidad: should, could, might, would; expresar preocupación y proponer soluciones: I'm concerned about..., One possible solution is...; conectores de contraste y concesión: however, although, on the other hand, despite; lectura y análisis de textos de opinión (artículos, editoriales); participación en discusiones grupales respetando turnos; construcción de argumentos simples: tesis + evidencia + conclusión; debate respetuoso de perspectivas distintas.",
    meta_aprendizaje: META,
    categoria: "Habilidades comunicativas B1",
    subcategoria: "Expresión de opiniones y argumentación básica",
    ejes_articuladores: ["Pensamiento crítico", "Vida democrática y ciudadanía"],
    transversalidades: [],
    tiempo_estimado_horas: 5,
  },
  {
    codigo: "IN-V-P05",
    numero: 5,
    titulo: "Lee y analiza textos breves vinculados con el campo temático (comprensión, resumen, opinión).",
    descripcion: "Lee y analiza textos breves vinculados con el campo temático mediante comprensión, resumen y emisión de opiniones fundamentadas.",
    descripcion_extendida: "Lee y analiza textos breves vinculados con el campo temático (comprensión, resumen, opinión). Contenidos: estrategias de lectura en B1: skimming (lectura rápida para idea general), scanning (búsqueda de información específica), lectura detallada (análisis profundo); identificar hechos vs. opiniones en textos; vocabulario académico: Tier 2 (analyze, identify, compare, describe, explain, evaluate) y Tier 3 (campo-específico); resumen escrito: qué incluir y qué omitir; cita y paráfrasis básicas; respuesta escrita a textos: agree/disagree con evidencia del texto; tipos de textos: artículo informativo, reseña, informe breve, texto instructivo; manejo de textos auténticos en inglés sobre temas relevantes para el grupo.",
    meta_aprendizaje: META,
    categoria: "Comprensión lectora B1",
    subcategoria: "Estrategias de lectura: skimming, scanning, lectura detallada",
    ejes_articuladores: ["Pensamiento crítico"],
    transversalidades: [],
    tiempo_estimado_horas: 5,
  },
  {
    codigo: "IN-V-P06",
    numero: 6,
    titulo: "Redacta textos funcionales para informar, solicitar o proponer acciones (correos, solicitudes, propuestas breves).",
    descripcion: "Redacta textos funcionales para informar, solicitar o proponer acciones: correos, solicitudes y propuestas breves.",
    descripcion_extendida: "Redacta textos funcionales para informar, solicitar o proponer acciones (correos, solicitudes, propuestas breves). Contenidos: registro formal e informal en la escritura: diferencias léxicas y gramaticales; estructura del correo electrónico formal: saludo, propósito, desarrollo, cierre, firma; cartas de solicitud: fórmulas de cortesía y argumentación; propuesta breve: problema, solución propuesta, justificación, conclusión; cohesión y coherencia textual: pronombres de referencia, sinónimos, conectores; puntuación y ortografía en inglés: mayúsculas, coma, punto, signos; revisión y corrección de borradores (drafting y editing); producción de textos funcionales reales: solicitar información sobre una carrera, proponer un proyecto comunitario.",
    meta_aprendizaje: META,
    categoria: "Producción escrita B1",
    subcategoria: "Textos funcionales: correos, solicitudes y propuestas",
    ejes_articuladores: ["Pensamiento crítico"],
    transversalidades: [],
    tiempo_estimado_horas: 5,
  },
  {
    codigo: "IN-V-P07",
    numero: 7,
    titulo: "Participa en una interacción oral semiestructurada (entrevista, presentación breve, panel).",
    descripcion: "Participa en una interacción oral semiestructurada como entrevista, presentación breve o panel de discusión.",
    descripcion_extendida: "Participa en una interacción oral semiestructurada (entrevista, presentación breve, panel). Contenidos: estrategias de participación oral: turn-taking (tomar y ceder la palabra), backchanneling (señales de escucha activa: I see, Right, Go on), fillers naturales (Well, Let me think, Actually); frases guía para discusiones: In my opinion, I agree with that because, However, I'd like to add, That's a good point; presentación oral estructurada de 3-5 minutos: slide o apoyo visual, hablar sin leer; entrevista simulada de trabajo o académica; panel de expertos o debate estructurado; pronunciación: énfasis, ritmo y entonación para la comunicación efectiva; superar el miedo a hablar en público; retroalimentación constructiva entre pares.",
    meta_aprendizaje: META,
    categoria: "Habilidades comunicativas B1",
    subcategoria: "Interacción oral: entrevistas, presentaciones y paneles",
    ejes_articuladores: ["Pensamiento crítico", "Vida democrática y ciudadanía"],
    transversalidades: [],
    tiempo_estimado_horas: 5,
  },
  {
    codigo: "IN-V-P08",
    numero: 8,
    titulo: "Integra habilidades lingüísticas y produce un proyecto final vinculado al campo temático del grupo.",
    descripcion: "Integra todas las habilidades lingüísticas desarrolladas en el semestre para producir un proyecto final vinculado al campo temático del grupo.",
    descripcion_extendida: "Integra habilidades lingüísticas y produce un proyecto final vinculado al campo temático del grupo. Contenidos: proyecto integrador: combina escritura, presentación oral, investigación y colaboración; formatos posibles: cartel / póster académico, mini-artículo informativo, podcast (guión + grabación), video breve, propuesta de acción comunitaria; planificación del proyecto: brainstorming, selección de tema, investigación de fuentes, borrador, revisión, versión final; rúbrica de evaluación: claridad, precisión lingüística, relevancia del contenido, creatividad; trabajo colaborativo: roles y responsabilidades; presentación al grupo o comunidad escolar; reflexión final: qué aprendí, cómo mejoré, qué sigue.",
    meta_aprendizaje: META,
    categoria: "Proyecto integrador",
    subcategoria: "Producción de proyecto final vinculado al campo temático",
    ejes_articuladores: ["Pensamiento crítico", "Vida democrática y ciudadanía"],
    transversalidades: [],
    tiempo_estimado_horas: 5,
  },
] as const;

export async function seedINV(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed IN-V (propósitos oficiales 2025)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac").select("id").eq("codigo", "IN-V").single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC IN-V no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const rows = PROGRESIONES_INV.map((p) => ({
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
  if (error) throw new Error(`Error seeding IN-V: ${error.message}`);
  console.log(`  ✓ ${rows.length} propósitos formativos de IN-V (es_placeholder=false)`);
  console.log("\n✅ Seed IN-V completado: 8 propósitos oficiales insertados.\n");
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
  seedINV(sb).catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
}

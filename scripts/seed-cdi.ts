/**
 * Seed de progresiones reales para CD-I (Conocimiento del Entorno Digital I).
 * Alineado con el MCCEMS oficial — Semestre 1.
 *
 * Uso: npx tsx scripts/seed-cdi.ts
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

// ── Datos de las 8 progresiones de CD-I ─────────────────────────────────────
// Fuente: Marco Curricular Común de la Educación Media Superior (MCCEMS)
//         Recurso Sociocognitivo: Conocimiento del Entorno Digital — Semestre 1

const PROGRESIONES_CDI = [
  {
    codigo: "CD-I-P01",
    numero: 1,
    titulo: "Identidad digital y ciudadanía en línea",
    descripcion: "Concepto de identidad digital: huella digital, reputación en línea y privacidad. Derechos y responsabilidades del ciudadano digital. Netiqueta y convivencia digital.",
    descripcion_extendida: "Los estudiantes reflexionan sobre su propia identidad digital analizando su presencia en redes sociales y plataformas digitales. Se trabajan los conceptos de huella digital permanente, reputación en línea y privacidad como derechos. Se discuten las normas de convivencia digital (netiqueta) y se analizan casos reales de cyberbullying, desinformación y violación de privacidad. La actividad de cierre implica la creación de un perfil digital reflexivo y responsable, discutiendo qué información se comparte y con quién.",
    meta_aprendizaje: "Reflexiona críticamente sobre su identidad digital y actúa como ciudadano digital responsable, aplicando principios de privacidad, netiqueta y derechos digitales.",
    categoria: "Ciudadanía digital",
    subcategoria: "Identidad y privacidad",
    ejes_articuladores: ["Ciudadanía", "Pensamiento crítico", "Igualdad de género"],
    transversalidades: ["LC-I", "CS-I", "HUM-I"],
    tiempo_estimado_horas: 4,
  },
  {
    codigo: "CD-I-P02",
    numero: 2,
    titulo: "Seguridad digital: amenazas y protección",
    descripcion: "Principales amenazas digitales: phishing, malware, robo de identidad y ciberacoso. Medidas de protección: contraseñas seguras, autenticación en dos pasos, actualizaciones.",
    descripcion_extendida: "Los estudiantes identifican las principales amenazas de seguridad digital a las que están expuestos cotidianamente y aprenden medidas concretas de protección. Se trabajan casos reales (noticias de fraudes, phishing mediante WhatsApp, ransomware) para hacer tangibles los riesgos. Se construye un protocolo personal de seguridad digital que incluye gestión de contraseñas, revisión de configuraciones de privacidad en redes sociales, y hábitos de verificación de fuentes. El componente de equidad digital se aborda reconociendo el acceso diferenciado a dispositivos y conectividad.",
    meta_aprendizaje: "Identifica las principales amenazas de seguridad digital y aplica medidas concretas de protección en sus dispositivos y cuentas en línea.",
    categoria: "Ciudadanía digital",
    subcategoria: "Seguridad y protección",
    ejes_articuladores: ["Ciudadanía", "Pensamiento crítico"],
    transversalidades: ["LC-I", "CS-I"],
    tiempo_estimado_horas: 4,
  },
  {
    codigo: "CD-I-P03",
    numero: 3,
    titulo: "Búsqueda y evaluación de información en línea",
    descripcion: "Motores de búsqueda: operadores avanzados y filtros. Criterios de evaluación de fuentes digitales: autoría, actualidad, propósito, exactitud. Derechos de autor y licencias Creative Commons.",
    descripcion_extendida: "Los estudiantes aprenden a buscar información con eficiencia y a evaluar críticamente la calidad y confiabilidad de las fuentes digitales. Se trabajan operadores de búsqueda avanzada de Google (comillas, site:, filetype:, -), y se aplica el método CRAAP (Currency, Relevance, Authority, Accuracy, Purpose) para evaluar páginas web. Se introduce el concepto de derechos de autor y las licencias Creative Commons para el uso ético de contenidos digitales. La actividad culmina con una búsqueda investigativa sobre un tema de otra UAC aplicando todos los criterios.",
    meta_aprendizaje: "Busca información digital usando operadores avanzados y evalúa críticamente la calidad de las fuentes aplicando criterios de autoría, actualidad, propósito y exactitud.",
    categoria: "Literacidad informacional",
    subcategoria: "Búsqueda y evaluación de fuentes",
    ejes_articuladores: ["Pensamiento crítico", "Apropiación de las culturas a través de la lectura y la escritura"],
    transversalidades: ["LC-I", "CNEYT-I", "CS-I"],
    tiempo_estimado_horas: 4.5,
  },
  {
    codigo: "CD-I-P04",
    numero: 4,
    titulo: "Procesadores de texto y documentos académicos",
    descripcion: "Uso avanzado de procesadores de texto (Google Docs, Word). Formato de documentos académicos: portada, índice, citas y referencias (APA básico). Trabajo colaborativo en la nube.",
    descripcion_extendida: "Los estudiantes producen documentos académicos correctamente formateados usando procesadores de texto, con énfasis en las funciones que más se usan en el bachillerato: estilos de párrafo, índice automático, tablas, imágenes con pie de foto, y formato de citas y referencias en APA 7a edición (básico). Se trabaja la colaboración en documentos compartidos en la nube (Google Docs) incluyendo comentarios, sugerencias y control de versiones. El documento final integra contenido de otra UAC, vinculando la competencia digital con el aprendizaje de otras asignaturas.",
    meta_aprendizaje: "Produce documentos académicos correctamente formateados en procesadores de texto, con citas y referencias básicas en APA, usando herramientas de colaboración en la nube.",
    categoria: "Productividad digital",
    subcategoria: "Herramientas de oficina",
    ejes_articuladores: ["Apropiación de las culturas a través de la lectura y la escritura"],
    transversalidades: ["LC-I", "PM-I", "CNEYT-I"],
    tiempo_estimado_horas: 5,
  },
  {
    codigo: "CD-I-P05",
    numero: 5,
    titulo: "Hojas de cálculo: organización y análisis de datos",
    descripcion: "Introducción a hojas de cálculo (Google Sheets, Excel). Fórmulas básicas, gráficas y tablas dinámicas. Organización y visualización de datos propios. Aplicaciones en matemáticas y ciencias.",
    descripcion_extendida: "Los estudiantes aprenden a organizar, calcular y visualizar datos usando hojas de cálculo, con aplicaciones directas en matemáticas (estadística descriptiva de PM-I) y ciencias. Se trabajan fórmulas aritméticas básicas (SUMA, PROMEDIO, MAX, MIN, SI), la construcción de gráficas (barras, líneas, circular) y la interpretación de los resultados. El enfoque es en el uso de las hojas de cálculo como herramienta de pensamiento, no solo de cálculo. La actividad de cierre implica analizar un conjunto de datos real (encuesta propia, datos INEGI) y presentar conclusiones con gráficas.",
    meta_aprendizaje: "Usa hojas de cálculo para organizar, calcular y visualizar datos aplicando fórmulas básicas y gráficas, interpretando los resultados en contextos reales.",
    categoria: "Productividad digital",
    subcategoria: "Análisis de datos",
    ejes_articuladores: ["Pensamiento crítico", "Ciudadanía"],
    transversalidades: ["PM-I", "CNEYT-I", "CS-I"],
    tiempo_estimado_horas: 5,
  },
  {
    codigo: "CD-I-P06",
    numero: 6,
    titulo: "Presentaciones digitales efectivas",
    descripcion: "Diseño de presentaciones (Google Slides, PowerPoint, Canva). Principios de diseño visual: contraste, alineación, proximidad y repetición. Presentación oral apoyada en diapositivas.",
    descripcion_extendida: "Los estudiantes aprenden a diseñar presentaciones digitales visualmente efectivas aplicando principios básicos de diseño gráfico (contraste, alineación, proximidad, repetición — principios CARP). Se trabaja la regla 10-20-30 de Guy Kawasaki (no más de 10 diapositivas, 20 minutos, fuente de 30 puntos) como heurística de diseño, y se analiza la diferencia entre diapositivas centradas en texto vs. diapositivas centradas en imágenes. La actividad final es la presentación oral de un tema investigado, evaluada por rúbrica que incluye diseño de diapositivas y desempeño oral.",
    meta_aprendizaje: "Diseña y presenta presentaciones digitales visualmente efectivas, aplicando principios de diseño gráfico y combinando competencias orales y digitales.",
    categoria: "Productividad digital",
    subcategoria: "Comunicación visual",
    ejes_articuladores: ["Apropiación de las culturas a través de la lectura y la escritura"],
    transversalidades: ["LC-I", "IN-I"],
    tiempo_estimado_horas: 4.5,
  },
  {
    codigo: "CD-I-P07",
    numero: 7,
    titulo: "Pensamiento computacional y resolución de problemas",
    descripcion: "Los cuatro pilares del pensamiento computacional: descomposición, reconocimiento de patrones, abstracción y algoritmos. Resolución de problemas mediante diagramas de flujo.",
    descripcion_extendida: "Los estudiantes exploran el pensamiento computacional como forma de resolver problemas complejos mediante descomposición, reconocimiento de patrones, abstracción y diseño de algoritmos. Se trabaja sin necesidad de programar: mediante juegos de rol, rompecabezas lógicos y la construcción de diagramas de flujo en papel y digital. Se conecta el pensamiento computacional con situaciones cotidianas (planificar una semana, escribir una receta, organizar un evento) y con otras UAC (resolver problemas matemáticos paso a paso). La actividad culmina con el diseño de un algoritmo para un problema real del entorno del estudiante.",
    meta_aprendizaje: "Aplica los cuatro pilares del pensamiento computacional (descomposición, patrones, abstracción y algoritmos) para resolver problemas complejos mediante diagramas de flujo.",
    categoria: "Pensamiento computacional",
    subcategoria: "Algoritmos y lógica",
    ejes_articuladores: ["Pensamiento crítico"],
    transversalidades: ["PM-I", "CNEYT-I"],
    tiempo_estimado_horas: 5,
  },
  {
    codigo: "CD-I-P08",
    numero: 8,
    titulo: "Creación de contenidos digitales responsables",
    descripcion: "Producción de contenidos digitales: infografías, videos cortos y podcasts. Narrativa digital y storytelling. Uso responsable de imágenes y música (Creative Commons). Publicación y audiencia.",
    descripcion_extendida: "Los estudiantes producen contenidos digitales originales con propósito comunicativo y audiencia definida, aplicando principios de narrativa digital (storytelling) y seleccionando el formato más adecuado para el mensaje (infografía, video, podcast, carrusel). Se trabajan herramientas accesibles y gratuitas (Canva, CapCut, Anchor/Spotify for Podcasters) y se practica la selección responsable de imágenes y música con licencias Creative Commons o de dominio público. La reflexión final conecta la creación de contenidos con la ciudadanía digital: ¿qué se publica, para quién y con qué efecto?",
    meta_aprendizaje: "Produce contenidos digitales originales (infografías, videos o podcasts) con propósito y audiencia definidos, usando recursos bajo licencia libre y principios de narrativa digital.",
    categoria: "Creación y comunicación digital",
    subcategoria: "Producción de contenidos",
    ejes_articuladores: ["Apropiación de las culturas a través de la lectura y la escritura", "Ciudadanía", "Igualdad de género"],
    transversalidades: ["LC-I", "IN-I", "CS-I"],
    tiempo_estimado_horas: 5,
  },
] as const;

// ── Runner ───────────────────────────────────────────────────────────────────

export async function seedCDI(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed CD-I (Conocimiento del Entorno Digital I)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac")
    .select("id")
    .eq("codigo", "CD-I")
    .single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC CD-I no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const uac_id = uacRow.id;
  console.log(`  ✓ UAC CD-I encontrada (id: ${uac_id})`);

  const rows = PROGRESIONES_CDI.map((p) => ({
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

  if (error) throw new Error(`Error seeding progresiones CD-I: ${error.message}`);

  console.log(`  ✓ ${rows.length} progresiones de CD-I enriquecidas (es_placeholder=true)`);
  console.log("\n✅ Seed CD-I completado.\n");
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

  seedCDI(sb).catch((err) => {
    console.error("❌ Error en seed CD-I:", err.message);
    process.exit(1);
  });
}

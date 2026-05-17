/**
 * Seed de propósitos formativos oficiales para CD-I (Cultura Digital I).
 * Fuente: docs/programas-oficiales/extraidos/02-CULTURA-DIGITAL.md
 *         PDF: 2025_ MCC_CULTURA DIGITAL_BN.pdf — Modelo Educativo 2025
 *
 * Uso: npx tsx scripts/seed-cdi.ts
 * Idempotente: upsert por campo "codigo".
 */

import { config } from "dotenv";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type SB = ReturnType<typeof createClient<Database>>;

const META = "Conozca y utilice el ciberespacio de forma crítica, reflexiva y responsable, identificando los componentes básicos del entorno digital y sus implicaciones sociales, culturales y éticas.";

const PROGRESIONES_CDI = [
  {
    codigo: "CD-I-P01",
    numero: 1,
    titulo: "Identifica los componentes básicos del hardware y software de dispositivos digitales.",
    descripcion: "Identifica los componentes básicos del hardware y software de dispositivos digitales.",
    descripcion_extendida: "Identifica los componentes básicos del hardware y software de dispositivos digitales. Contenidos: hardware y software: componentes, sistemas operativos, dispositivos.",
    meta_aprendizaje: META,
    categoria: "Cultura digital",
    subcategoria: "Hardware y software",
    ejes_articuladores: ["Pensamiento crítico"],
    transversalidades: [],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CD-I-P02",
    numero: 2,
    titulo: "Distingue tipos de licencias de uso de software y contenidos digitales (libre, propietario, Creative Commons).",
    descripcion: "Distingue tipos de licencias de uso de software y contenidos digitales (libre, propietario, Creative Commons).",
    descripcion_extendida: "Distingue tipos de licencias de uso de software y contenidos digitales (libre, propietario, Creative Commons). Contenidos: tipos de licencias: software libre vs. propietario, Creative Commons.",
    meta_aprendizaje: META,
    categoria: "Cultura digital",
    subcategoria: "Licencias y derechos digitales",
    ejes_articuladores: ["Pensamiento crítico", "Ciudadanía"],
    transversalidades: ["LC-I"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CD-I-P03",
    numero: 3,
    titulo: "Reflexiona sobre el colonialismo de datos y las asimetrías en la producción y control de información digital.",
    descripcion: "Reflexiona sobre el colonialismo de datos y las asimetrías en la producción y control de información digital.",
    descripcion_extendida: "Reflexiona sobre el colonialismo de datos y las asimetrías en la producción y control de información digital. Contenidos: economía y colonialismo de datos: big data, privacidad, soberanía digital.",
    meta_aprendizaje: META,
    categoria: "Ciudadanía digital",
    subcategoria: "Soberanía y colonialismo de datos",
    ejes_articuladores: ["Pensamiento crítico", "Ciudadanía", "Interculturalidad crítica"],
    transversalidades: ["CS-I"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CD-I-P04",
    numero: 4,
    titulo: "Analiza el funcionamiento básico de los algoritmos y su impacto en la experiencia digital cotidiana.",
    descripcion: "Analiza el funcionamiento básico de los algoritmos y su impacto en la experiencia digital cotidiana.",
    descripcion_extendida: "Analiza el funcionamiento básico de los algoritmos y su impacto en la experiencia digital cotidiana. Contenidos: algoritmos: qué son, cómo funcionan, filtros de burbuja.",
    meta_aprendizaje: META,
    categoria: "Ciudadanía digital",
    subcategoria: "Algoritmos y filtros",
    ejes_articuladores: ["Pensamiento crítico"],
    transversalidades: ["PM-I"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CD-I-P05",
    numero: 5,
    titulo: "Reconoce sus derechos digitales y los mecanismos para ejercerlos.",
    descripcion: "Reconoce sus derechos digitales y los mecanismos para ejercerlos.",
    descripcion_extendida: "Reconoce sus derechos digitales y los mecanismos para ejercerlos. Contenidos: derechos digitales: privacidad, acceso, no discriminación.",
    meta_aprendizaje: META,
    categoria: "Ciudadanía digital",
    subcategoria: "Derechos digitales",
    ejes_articuladores: ["Ciudadanía", "Inclusión"],
    transversalidades: ["CS-I"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CD-I-P06",
    numero: 6,
    titulo: "Navega de forma segura y crítica en entornos digitales, identificando riesgos (phishing, desinformación, vigilancia).",
    descripcion: "Navega de forma segura y crítica en entornos digitales, identificando riesgos (phishing, desinformación, vigilancia).",
    descripcion_extendida: "Navega de forma segura y crítica en entornos digitales, identificando riesgos (phishing, desinformación, vigilancia). Contenidos: navegación segura: contraseñas, phishing, desinformación.",
    meta_aprendizaje: META,
    categoria: "Ciudadanía digital",
    subcategoria: "Seguridad y navegación crítica",
    ejes_articuladores: ["Pensamiento crítico", "Ciudadanía"],
    transversalidades: ["LC-I"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CD-I-P07",
    numero: 7,
    titulo: "Valora la diversidad de identidades en el ciberespacio y practica la comunicación digital respetuosa e inclusiva.",
    descripcion: "Valora la diversidad de identidades en el ciberespacio y practica la comunicación digital respetuosa e inclusiva.",
    descripcion_extendida: "Valora la diversidad de identidades en el ciberespacio y practica la comunicación digital respetuosa e inclusiva. Contenidos: ciudadanía digital e identidad en línea.",
    meta_aprendizaje: META,
    categoria: "Ciudadanía digital",
    subcategoria: "Identidad digital e inclusión",
    ejes_articuladores: ["Ciudadanía", "Inclusión", "Igualdad de género"],
    transversalidades: ["LC-I", "CS-I"],
    tiempo_estimado_horas: 3,
  },
  {
    codigo: "CD-I-P08",
    numero: 8,
    titulo: "Utiliza herramientas digitales básicas para la organización de información y la comunicación escolar.",
    descripcion: "Utiliza herramientas digitales básicas para la organización de información y la comunicación escolar.",
    descripcion_extendida: "Utiliza herramientas digitales básicas para la organización de información y la comunicación escolar. Contenidos: herramientas digitales para organización de información y comunicación.",
    meta_aprendizaje: META,
    categoria: "Productividad digital",
    subcategoria: "Herramientas para la organización",
    ejes_articuladores: ["Apropiación de las culturas a través de la lectura y la escritura"],
    transversalidades: ["LC-I"],
    tiempo_estimado_horas: 3,
  },
] as const;

export async function seedCDI(sb: SB) {
  console.log("\n🌱 CEN Bachillerato — Seed CD-I (propósitos oficiales 2025)\n");

  const { data: uacRow, error: uacErr } = await sb
    .from("uac").select("id").eq("codigo", "CD-I").single();

  if (uacErr || !uacRow) {
    throw new Error(`UAC CD-I no encontrada. Ejecuta primero seed-mccems.ts. Error: ${uacErr?.message}`);
  }

  const rows = PROGRESIONES_CDI.map((p) => ({
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
  if (error) throw new Error(`Error seeding CD-I: ${error.message}`);
  console.log(`  ✓ ${rows.length} propósitos formativos de CD-I (es_placeholder=false)`);
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
  if (!url || !key) { console.error("Faltan variables de entorno"); process.exit(1); }
  const sb = createClient<Database>(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  seedCDI(sb).catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });
}

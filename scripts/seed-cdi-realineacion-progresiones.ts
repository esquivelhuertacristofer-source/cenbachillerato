/**
 * Realineación de las progresiones de CD-I al programa oficial MCCEMS 2025
 * (Cultura Digital I — Ciudadanía digital, Tabla 1 del PDF oficial).
 * Los 8 propósitos formativos oficiales quedan en orden (numero 1-8); las 3 progresiones
 * previas no oficiales valiosas se conservan como complemento (numero 9-11).
 *   Oficial 1 → P01 (hardware/software + evolución)   Oficial 5 → P06 (normatividad/seguridad)
 *   Oficial 2 → P02 (licenciamiento + navegadores/SO) Oficial 6 → P10 (NUEVA: uso responsable, IA, copyleft, ambiente)
 *   Oficial 3 → P03 (impacto crítico)                 Oficial 7 → P04 (resolución de problemas algorítmicos)
 *   Oficial 4 → P09 (NUEVA: software libre/ofimática) Oficial 8 → P11 (NUEVA: lenguaje algorítmico)
 *   Complementos → P05 (derechos digitales), P07 (diversidad/inclusión), P08 (ofimática escolar)
 * Estrategia anti-colisión: primero se bombean los numeros existentes a +100, luego se hace el upsert final.
 * Uso: npx tsx scripts/seed-cdi-realineacion-progresiones.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { createSB, log } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

const META = "Conozca y utilice de manera crítica y responsable el ciberespacio y los distintos recursos digitales, apegándose a su marco normativo para ejercer una ciudadanía digital, acceder al conocimiento y resolver situaciones, fenómenos o problemas de su contexto.";

type Prog = {
  codigo: string; numero: number; titulo: string; descripcion: string; descripcion_extendida: string;
  categoria: string; subcategoria: string; ejes: string[]; transversalidades: string[]; horas: number;
};

const PROGRESIONES: Prog[] = [
  // ───────── OFICIAL 1 ─────────
  {
    codigo: "CD-I-P01", numero: 1,
    titulo: "Identifica los elementos físicos y lógicos de un dispositivo electrónico para analizar críticamente la evolución de la tecnología digital a lo largo del tiempo.",
    descripcion: "Identifica el hardware (elementos físicos) y el software (programas, instrucciones y reglas) de un dispositivo digital, y analiza críticamente la evolución de la tecnología y la historia del software libre.",
    descripcion_extendida: "Propósito formativo 1 (oficial MCCEMS 2025). Contenidos: introducción al hardware y software; historia crítica del desarrollo de la tecnología digital; historia del software libre; licencia GPL (General Public License); Creative Commons y otras licencias libres; conectividad.",
    categoria: "Ciudadanía digital", subcategoria: "Hardware, software e historia de la tecnología",
    ejes: ["Pensamiento crítico"], transversalidades: ["CNEYT-I"], horas: 3,
  },
  // ───────── OFICIAL 2 ─────────
  {
    codigo: "CD-I-P02", numero: 2,
    titulo: "Conoce los requerimientos y tipos de licenciamiento de software y hardware para acceder a servicios tecnológicos, al ciberespacio y a los servicios digitales.",
    descripcion: "Conoce los requerimientos y los tipos de licenciamiento (licencias de uso privativo y licencias libres), así como navegadores, sistemas operativos, niveles de acceso y unidades de medida, para acceder a servicios tecnológicos y digitales.",
    descripcion_extendida: "Propósito formativo 2 (oficial MCCEMS 2025). Contenidos: navegadores; sistemas operativos; niveles de acceso; unidades de medida (velocidad, procesamiento y almacenamiento); licencias de uso privativo y licencias libres; Creative Commons.",
    categoria: "Ciudadanía digital", subcategoria: "Licenciamiento y acceso a servicios digitales",
    ejes: ["Pensamiento crítico"], transversalidades: [], horas: 3,
  },
  // ───────── OFICIAL 3 ─────────
  {
    codigo: "CD-I-P03", numero: 3,
    titulo: "Analiza de manera crítica el impacto del uso de las tecnologías digitales y de las políticas de gestión de la información en las personas y comunidades.",
    descripcion: "Analiza críticamente el impacto de las tecnologías digitales en las personas y comunidades: corporaciones tecnológicas, colonialismo de datos, mercantilización de la atención, dependencia tecnológica y desigualdad en el acceso.",
    descripcion_extendida: "Propósito formativo 3 (oficial MCCEMS 2025). Contenidos: corporaciones de innovación tecnológica; colonialismo de datos; mercantilización de la atención de las personas usuarias; dependencia tecnológica; desigualdad en el acceso a las tecnologías digitales (socioeconómica, regional o de género).",
    categoria: "Ciudadanía digital", subcategoria: "Impacto social de las tecnologías digitales",
    ejes: ["Pensamiento crítico", "Igualdad de género"], transversalidades: ["CS-I"], horas: 3,
  },
  // ───────── OFICIAL 4 (NUEVA) ─────────
  {
    codigo: "CD-I-P09", numero: 4,
    titulo: "Utiliza herramientas de software libre y experimenta con alternativas a los programas de patente y al software como servicio.",
    descripcion: "Utiliza herramientas de software libre (incluyendo procesadores de texto, hojas de cálculo y presentaciones) y experimenta con alternativas a los programas de patente, comprendiendo las 4 libertades del software libre y la cultura hacker.",
    descripcion_extendida: "Propósito formativo 4 (oficial MCCEMS 2025). Contenidos: las 4 libertades del software libre; GNU/Linux; cultura hacker y el 'Hazlo tú mismx' en la tecnología; software libre vs. open source; procesadores de texto, hojas de cálculo y presentaciones electrónicas.",
    categoria: "Ciudadanía digital", subcategoria: "Software libre y ofimática",
    ejes: ["Pensamiento crítico"], transversalidades: [], horas: 3,
  },
  // ───────── OFICIAL 5 ─────────
  {
    codigo: "CD-I-P06", numero: 5,
    titulo: "Identifica y aplica la normatividad que regula el uso del ciberespacio y los servicios digitales para cuidar su seguridad digital y la de otras personas.",
    descripcion: "Identifica y aplica la normatividad del ciberespacio y los servicios digitales, y navega de forma segura cuidando la privacidad, la protección de datos y la seguridad digital frente a riesgos (phishing, desinformación, vigilancia).",
    descripcion_extendida: "Propósito formativo 5 (oficial MCCEMS 2025). Contenidos: normatividad en el uso del ciberespacio y servicios digitales; privacidad de la información; seguridad digital; protección de datos. Incluye la identificación de riesgos como phishing, desinformación y vigilancia.",
    categoria: "Ciudadanía digital", subcategoria: "Normatividad, privacidad y seguridad digital",
    ejes: ["Pensamiento crítico"], transversalidades: [], horas: 3,
  },
  // ───────── OFICIAL 6 (NUEVA) ─────────
  {
    codigo: "CD-I-P10", numero: 6,
    titulo: "Utiliza los recursos digitales a su alcance con fines personales, académicos y sociales para interactuar con seguridad y con consideración al medio ambiente.",
    descripcion: "Utiliza los recursos digitales con fines personales, académicos y sociales de forma segura y responsable, incluyendo el uso ético de la Inteligencia Artificial, los licenciamientos copyleft y la consideración de la contaminación digital y tecnológica.",
    descripcion_extendida: "Propósito formativo 6 (oficial MCCEMS 2025). Contenidos: uso responsable y ético de la Inteligencia Artificial (IA); licenciamientos copyleft; contaminación digital y tecnológica (impacto ambiental del uso de recursos digitales).",
    categoria: "Ciudadanía digital", subcategoria: "Uso responsable, IA y medio ambiente",
    ejes: ["Pensamiento crítico", "Educación ambiental"], transversalidades: ["CNEYT-I"], horas: 3,
  },
  // ───────── OFICIAL 7 ─────────
  {
    codigo: "CD-I-P04", numero: 7,
    titulo: "Reconoce formas de comprensión y resolución de problemas algorítmicos para desarrollar una estrategia frente a una situación, fenómeno o problemática usando medios digitales.",
    descripcion: "Reconoce las formas de comprensión y resolución de problemas algorítmicos (identificar, comprender, analizar alternativas, seleccionar la mejor y usar diagramas de flujo) en el marco de la ciudadanía e identidad digital y las plataformas de uso cotidiano.",
    descripcion_extendida: "Propósito formativo 7 (oficial MCCEMS 2025). Contenidos: ciudadanía e identidad digital; credenciales de acceso; plataformas de uso cotidiano; contaminación digital y tecnológica; pasos para solucionar un problema (identificar el problema, comprenderlo, analizar alternativas de solución, seleccionar la mejor alternativa, utilizar métodos, técnicas o diagramas de flujo).",
    categoria: "Ciudadanía digital", subcategoria: "Resolución de problemas algorítmicos",
    ejes: ["Pensamiento crítico"], transversalidades: ["PM-I"], horas: 3,
  },
  // ───────── OFICIAL 8 (NUEVA) ─────────
  {
    codigo: "CD-I-P11", numero: 8,
    titulo: "Conoce los elementos del lenguaje algorítmico a través de medios digitales para resolver situaciones, fenómenos o problemáticas presentes en las diferentes asignaturas.",
    descripcion: "Conoce los elementos del lenguaje algorítmico (dato, información, variables, constantes, expresiones, operadores y estructuras de control) para representar y resolver problemas mediante algoritmos en distintas asignaturas.",
    descripcion_extendida: "Propósito formativo 8 (oficial MCCEMS 2025). Contenidos: dato; información; variables; constantes; expresiones; operadores lógicos; operaciones relacionales; operadores aritméticos; estructuras condicionales, selectivas y repetitivas.",
    categoria: "Ciudadanía digital", subcategoria: "Lenguaje algorítmico y pensamiento computacional",
    ejes: ["Pensamiento crítico"], transversalidades: ["PM-I"], horas: 3,
  },
  // ───────── COMPLEMENTOS (contenido valioso conservado) ─────────
  {
    codigo: "CD-I-P05", numero: 9,
    titulo: "Reconoce sus derechos digitales y los mecanismos para ejercerlos.",
    descripcion: "Reconoce los derechos digitales (acceso, privacidad, libertad de expresión, olvido) y los mecanismos e instituciones para ejercerlos y defenderlos.",
    descripcion_extendida: "Complemento CEN que profundiza la dimensión de ciudadanía y normatividad de los propósitos oficiales 3 y 5. Contenidos: derechos digitales; mecanismos e instituciones para ejercerlos; derecho a la privacidad y a la protección de datos.",
    categoria: "Ciudadanía digital", subcategoria: "Derechos digitales",
    ejes: ["Pensamiento crítico"], transversalidades: ["CS-I"], horas: 2,
  },
  {
    codigo: "CD-I-P07", numero: 10,
    titulo: "Valora la diversidad de identidades en el ciberespacio y practica la comunicación digital respetuosa e inclusiva.",
    descripcion: "Valora la diversidad de identidades en el ciberespacio y practica una comunicación digital respetuosa, inclusiva y libre de violencia.",
    descripcion_extendida: "Complemento CEN que enriquece la identidad digital del propósito oficial 7 con un enfoque de inclusión y convivencia. Contenidos: diversidad de identidades en línea; comunicación digital respetuosa e inclusiva; prevención de la violencia digital.",
    categoria: "Ciudadanía digital", subcategoria: "Identidad, inclusión y convivencia digital",
    ejes: ["Igualdad de género", "Inclusión", "Interculturalidad crítica"], transversalidades: ["CS-I"], horas: 2,
  },
  {
    codigo: "CD-I-P08", numero: 11,
    titulo: "Utiliza herramientas digitales básicas para la organización de información y la comunicación escolar.",
    descripcion: "Utiliza herramientas digitales básicas (gestión de archivos, ofimática y plataformas de comunicación) para organizar información y colaborar en el ámbito escolar.",
    descripcion_extendida: "Complemento CEN que aplica de forma práctica la ofimática del propósito oficial 4 al trabajo escolar cotidiano. Contenidos: organización y gestión de archivos e información; ofimática aplicada; plataformas de comunicación y colaboración escolar.",
    categoria: "Ciudadanía digital", subcategoria: "Herramientas digitales para la escuela",
    ejes: ["Pensamiento crítico"], transversalidades: [], horas: 2,
  },
];

async function main() {
  const sb = createSB();
  log("\n🔧 Realineación de progresiones CD-I al programa oficial MCCEMS 2025\n");

  const { data: uacRow, error: uacErr } = await sb.from("uac").select("id").eq("codigo", "CD-I").single();
  if (uacErr || !uacRow) throw new Error(`UAC CD-I no encontrada: ${uacErr?.message}`);

  // Paso 1: liberar el rango 1-11 bombeando los numeros existentes a +100.
  const { data: existentes } = await sb.from("progresiones").select("id, numero").eq("uac_id", uacRow.id);
  for (const e of existentes ?? []) {
    if (e.numero != null && e.numero < 100) {
      await sb.from("progresiones").update({ numero: e.numero + 100 }).eq("id", e.id);
    }
  }
  log(`  ✓ ${existentes?.length ?? 0} progresiones existentes desplazadas temporalmente (+100).`);

  // Paso 2: upsert con el orden oficial final.
  const rows = PROGRESIONES.map((p) => ({
    codigo: p.codigo, uac_id: uacRow.id, numero: p.numero,
    titulo: p.titulo, descripcion: p.descripcion, descripcion_extendida: p.descripcion_extendida,
    meta_aprendizaje: META, categoria: p.categoria, subcategoria: p.subcategoria,
    ejes_articuladores: p.ejes, transversalidades: p.transversalidades,
    tiempo_estimado_horas: p.horas, es_placeholder: false,
  }));
  const { error } = await sb.from("progresiones").upsert(rows, { onConflict: "codigo" });
  if (error) throw new Error(`Error en upsert: ${error.message}`);
  log(`  ✓ ${rows.length} progresiones CD-I en orden oficial (8 oficiales + 3 complementos).\n`);

  // Verificación
  const { data: final } = await sb.from("progresiones").select("codigo,numero,titulo").eq("uac_id", uacRow.id).order("numero");
  for (const p of final ?? []) log(`  P${String(p.numero).padStart(2, "0")} [${p.codigo}] — ${p.titulo.slice(0, 70)}`);
  log("");
}

main().catch((e) => { console.error("❌ Error:", e.message); process.exit(1); });

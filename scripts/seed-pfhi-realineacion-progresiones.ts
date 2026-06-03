/**
 * Realineación PFH-I (Pensamiento Filosófico y Humanidades I) al programa oficial MCCEMS 2025 (Tabla 1).
 * 5 propósitos oficiales + 1 complemento (tradiciones filosóficas).
 * Falta oficial: Propósito 4 (Conocimiento, Ciencia, Verdad, Posverdad) → se crea PFH-I-P06.
 * Anti-colisión: bump +100 a numero existentes, luego upsert al orden oficial.
 * Uso: npx tsx scripts/seed-pfhi-realineacion-progresiones.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

const META = "Desarrolle la capacidad de formular preguntas filosóficas y de participar en diálogos argumentativos. Para ello, aplica métodos de razonamiento y considera diversos enfoques filosóficos, lo que le permite analizar los desafíos de su entorno desde una perspectiva humanista.";

type Prog = {
  codigo: string; numero: number; titulo: string; descripcion: string; descripcion_extendida: string;
  categoria: string; subcategoria: string; ejes: string[]; transversalidades: string[]; horas: number;
};

const ejesComunes = ["Pensamiento Crítico", "Interculturalidad crítica"];

const progresiones: Prog[] = [
  {
    codigo: "PFH-I-P01", numero: 1,
    titulo: "El ejercicio de filosofar y la perspectiva humanista",
    descripcion: "Reconoce la posibilidad del pensamiento propio a partir de experiencias cotidianas, identificando la práctica filosófica como un modo de problematizar la realidad.",
    descripcion_extendida: "¿Para qué reflexionar sobre el pensamiento? Naturaleza del pensamiento filosófico y perspectiva humanista. Introducción a la argumentación filosófica y comunidades de diálogo. Se distingue el ejercicio de filosofar —preguntarse, dudar, reflexionar— del conocimiento filosófico acumulado.",
    categoria: "Naturaleza del pensamiento filosófico", subcategoria: "El ejercicio de filosofar",
    ejes: ejesComunes, transversalidades: ["Educación para la paz"], horas: 16,
  },
  {
    codigo: "PFH-I-P02", numero: 2,
    titulo: "¿Por qué y para qué preguntar? La formulación de preguntas filosóficas",
    descripcion: "Formula preguntas significativas sobre la vida a partir de un ejercicio filosófico que genere pensamiento crítico, creativo y cuidadoso, para cuestionar lo que comúnmente se considera cierto y explorar respuestas que enriquezcan la visión del mundo.",
    descripcion_extendida: "Tipos de preguntas. Importancia de preguntar. Validez de las preguntas. La formulación de preguntas filosóficas frente a preguntas científicas o cotidianas (ontológicas, epistemológicas, éticas, estéticas, políticas).",
    categoria: "Pensamiento crítico", subcategoria: "La pregunta filosófica",
    ejes: ejesComunes, transversalidades: ["Pensamiento crítico"], horas: 16,
  },
  {
    codigo: "PFH-I-P03", numero: 3,
    titulo: "¿Qué es un problema filosófico? El sentido de la vida",
    descripcion: "Analiza la cotidianidad desde las normas, valores, creencias y visiones del mundo, para comprender el sentido de la vida desde distintas perspectivas filosóficas, cuestionando lo dado.",
    descripcion_extendida: "La experiencia de categorizar y conceptualizar. Problemas filosóficos: Realidad, Devenir, Tiempo, Muerte, Libertad, Felicidad, Lenguaje, Sentido de la vida, entre otros, relacionados con la propia experiencia (identidad, libertad, justicia).",
    categoria: "Problemas filosóficos", subcategoria: "El sentido de la vida",
    ejes: ejesComunes, transversalidades: ["Vida saludable"], horas: 16,
  },
  {
    codigo: "PFH-I-P06", numero: 4,
    titulo: "Conocimiento, Ciencia y Verdad",
    descripcion: "Formula preguntas filosóficas en torno al Conocimiento, la Ciencia y los grados de Verdad para reconocer su relevancia en la vida cotidiana, desarrollando una comprensión crítica sobre cómo se construye el conocimiento.",
    descripcion_extendida: "Encuentros y desencuentros entre el conocimiento científico y los saberes sociales y humanísticos. Teorías del Conocimiento. El Problema de la Verdad. Percepción y Razón. Posverdad. ¿Qué implica interpretar?",
    categoria: "Teoría del conocimiento", subcategoria: "El problema de la verdad",
    ejes: ejesComunes, transversalidades: ["Pensamiento crítico"], horas: 16,
  },
  {
    codigo: "PFH-I-P04", numero: 5,
    titulo: "El diálogo filosófico y las comunidades de diálogo",
    descripcion: "Integra la formulación de preguntas para participar con mayor rigor en comunidades de diálogo centradas en problemas filosóficos contemporáneos, escuchando con apertura y reformulando las propias ideas.",
    descripcion_extendida: "¿Para qué dialogamos? Características del diálogo filosófico con perspectiva humanista. Actitudes y posturas del diálogo filosófico. Reglas para la discusión filosófica. La controversia como posibilidad de diálogo filosófico.",
    categoria: "Diálogo filosófico", subcategoria: "Comunidades de diálogo",
    ejes: ejesComunes, transversalidades: ["Educación para la paz"], horas: 16,
  },
  {
    codigo: "PFH-I-P05", numero: 6,
    titulo: "Diversidad de tradiciones filosóficas (complemento)",
    descripcion: "Reconoce la diversidad de tradiciones filosóficas —occidental, oriental, indígena— como formas legítimas de pensar el mundo.",
    descripcion_extendida: "Complemento intercultural: amplía la perspectiva humanista al valorar distintas tradiciones de pensamiento (occidental, oriental, mesoamericana e indígena) como modos válidos de filosofar y comprender la realidad.",
    categoria: "Interculturalidad", subcategoria: "Tradiciones filosóficas",
    ejes: ejesComunes, transversalidades: ["Interculturalidad crítica"], horas: 8,
  },
];

async function main() {
  const sb = createSB();
  log("\n🔧 Realineación de progresiones PFH-I al programa oficial\n");

  const { data: uac } = await sb.from("uac").select("id").eq("codigo", "PFH-I").single();
  if (!uac) throw new Error("UAC PFH-I no encontrada");
  const uacId = uac.id;

  // 1) Anti-colisión: bump numero existentes +100
  const existentes = await getProgresionesDeUAC(sb, "PFH-I");
  for (const p of existentes) {
    const { data: cur } = await sb.from("progresiones").select("numero").eq("id", p.id).single();
    if (cur && cur.numero < 100) {
      await sb.from("progresiones").update({ numero: cur.numero + 100 }).eq("id", p.id);
    }
  }
  log("  ✓ numero existentes desplazados +100 (anti-colisión).");

  // 2) Upsert al orden oficial
  for (const p of progresiones) {
    const { error } = await sb.from("progresiones").upsert({
      codigo: p.codigo, uac_id: uacId, numero: p.numero, titulo: p.titulo,
      descripcion: p.descripcion, descripcion_extendida: p.descripcion_extendida,
      meta_aprendizaje: META, categoria: p.categoria, subcategoria: p.subcategoria,
      ejes_articuladores: p.ejes, transversalidades: p.transversalidades,
      tiempo_estimado_horas: p.horas, es_placeholder: false,
    }, { onConflict: "codigo" });
    if (error) { log(`  ✗ ${p.codigo}: ${error.message}`); } else { log(`  ✓ ${p.codigo} → numero ${p.numero} — ${p.titulo}`); }
  }

  // 3) Verificación
  log("\n📋 Orden final PFH-I:");
  const final = await getProgresionesDeUAC(sb, "PFH-I");
  for (const p of final) {
    const { data: full } = await sb.from("progresiones").select("numero,titulo").eq("id", p.id).single();
    log(`  ${String(full?.numero).padStart(2, "0")}. [${p.codigo}] ${full?.titulo}`);
  }
  log("");
}
main().catch((e) => { console.error("❌", e.message); process.exit(1); });

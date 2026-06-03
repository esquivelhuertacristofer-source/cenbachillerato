/**
 * Realineación de las progresiones de PM-I al programa oficial MCCEMS 2025
 * (Pensamiento Matemático I — Pensamiento aritmético, Tabla 1 del PDF oficial).
 * Los 7 propósitos formativos oficiales quedan en orden (numero 1-7); las 3 progresiones
 * previas no oficiales se conservan como complemento (numero 8-10).
 *   Oficial 1 → P03 (lógica)            Oficial 5 → P09 (NUEVA: potenciación y radicación)
 *   Oficial 2 → P08 (NUEVA: conteo)     Oficial 6 → P06 (medición/SI/notación científica)
 *   Oficial 3 → P02 (reales/enteros)    Oficial 7 → P10 (NUEVA: operaciones combinadas)
 *   Oficial 4 → P04 (fracciones)        Complementos → P05 (razón/proporción), P01 (historia), P07 (estimación)
 * Estrategia anti-colisión: primero se bombean los numeros existentes a +100, luego se hace el upsert final.
 * Uso: npx tsx scripts/seed-pmi-realineacion-progresiones.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { createSB, log } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

const META = "Comprenda las matemáticas como expresión del pensamiento humano para aplicar los elementos esenciales de la aritmética y el pensamiento lógico en situaciones de interés.";

type Prog = {
  codigo: string; numero: number; titulo: string; descripcion: string; descripcion_extendida: string;
  categoria: string; subcategoria: string; ejes: string[]; transversalidades: string[]; horas: number;
};

const PROGRESIONES: Prog[] = [
  // ───────── OFICIAL 1 ─────────
  {
    codigo: "PM-I-P03", numero: 1,
    titulo: "Aplica conceptos básicos de lógica matemática en situaciones de su contexto para desarrollar esquemas de razonamiento estructurado.",
    descripcion: "Aplica conceptos básicos de lógica matemática (proposiciones, tablas de verdad y operadores lógicos) en situaciones de su contexto para desarrollar esquemas de razonamiento estructurado.",
    descripcion_extendida: "Propósito formativo 1 (oficial MCCEMS 2025). Contenidos: conceptualización de la lógica matemática; tablas de verdad; proposiciones compuestas y operadores lógicos: conjunción (y) y disyunción (o); negación; proposiciones condicionales y bicondicionales.",
    categoria: "Lógica matemática", subcategoria: "Proposiciones y tablas de verdad",
    ejes: ["Pensamiento crítico"], transversalidades: ["LC-I"], horas: 4,
  },
  // ───────── OFICIAL 2 (NUEVA) ─────────
  {
    codigo: "PM-I-P08", numero: 2,
    titulo: "Comprende el concepto de conteo a partir del análisis de los procesos sociales que llevaron a su desarrollo para aplicarlo en situaciones de interés.",
    descripcion: "Comprende el concepto de conteo y los sistemas de numeración (Mesopotamia, Egipto, América, India y Arabia) a partir de los procesos sociales que les dieron origen, incluyendo la importancia del cero en los pueblos olmeca y maya.",
    descripcion_extendida: "Propósito formativo 2 (oficial MCCEMS 2025). Contenidos: sistemas de conteo en Mesopotamia, Egipto, América, India y Arabia; importancia del cero en los pueblos olmeca y maya; concepto de número y números naturales; Leonardo de Pisa (Fibonacci) y el sistema numeral indoarábigo; concepto y uso del ábaco.",
    categoria: "Aritmética", subcategoria: "Conteo y sistemas de numeración",
    ejes: ["Pensamiento crítico", "Interculturalidad crítica"], transversalidades: ["CS-I"], horas: 4,
  },
  // ───────── OFICIAL 3 ─────────
  {
    codigo: "PM-I-P02", numero: 3,
    titulo: "Analiza distintas situaciones cotidianas donde interviene el proceso de contar para comprender la clasificación de los números y realizar operaciones básicas entre números naturales y enteros.",
    descripcion: "Comprende la clasificación de los números reales y realiza operaciones con números naturales y enteros, sus propiedades, la factorización y el cálculo de MCD y mcm.",
    descripcion_extendida: "Propósito formativo 3 (oficial MCCEMS 2025). Contenidos: clasificación de los números reales; operaciones aritméticas y sus operaciones inversas con números enteros; propiedades de las operaciones aritméticas: cerradura, conmutación, asociación y distribución, neutros e inversos aditivo y multiplicativo; factorización de números naturales (teorema fundamental de la aritmética); máximo común divisor (MCD) y mínimo común múltiplo (mcm).",
    categoria: "Aritmética", subcategoria: "Números reales y operaciones",
    ejes: ["Pensamiento crítico"], transversalidades: ["CNEYT-I"], horas: 4,
  },
  // ───────── OFICIAL 4 ─────────
  {
    codigo: "PM-I-P04", numero: 4,
    titulo: "Comprende el concepto de unidad y la relación entre números fraccionarios y enteros para realizar operaciones con fracciones y porcentajes.",
    descripcion: "Comprende el concepto de unidad y la relación entre fracciones y enteros para operar con fracciones, equivalencias, simplificación, proporción y porcentajes.",
    descripcion_extendida: "Propósito formativo 4 (oficial MCCEMS 2025). Contenidos: concepto de unidad y de los números racionales como fracciones (estructura); equivalencias entre fracciones y entre números enteros y fracciones; simplificación de fracciones; proporción, proporción inversa y porcentaje.",
    categoria: "Aritmética", subcategoria: "Fracciones, porcentajes y proporción",
    ejes: ["Pensamiento crítico"], transversalidades: ["CNEYT-I", "CS-I"], horas: 4,
  },
  // ───────── OFICIAL 5 (NUEVA) ─────────
  {
    codigo: "PM-I-P09", numero: 5,
    titulo: "Comprende los conceptos de potenciación y radicación para realizar operaciones con exponentes y radicales.",
    descripcion: "Comprende los conceptos de potenciación y radicación para operar con exponentes (incluyendo exponentes negativos como inverso multiplicativo) y con radicales (raíz cuadrada).",
    descripcion_extendida: "Propósito formativo 5 (oficial MCCEMS 2025). Contenidos: componentes de una potencia; operaciones con potenciación (reglas); explicación de los exponentes negativos como el inverso multiplicativo de la base; operaciones con exponentes (reglas); definición de raíz cuadrada (enunciación de sus partes) y radicando; la raíz cuadrada como inverso de potencias de números positivos y cancelación de potencias y raíces.",
    categoria: "Aritmética", subcategoria: "Potenciación y radicación",
    ejes: ["Pensamiento crítico"], transversalidades: ["CNEYT-I"], horas: 4,
  },
  // ───────── OFICIAL 6 ─────────
  {
    codigo: "PM-I-P06", numero: 6,
    titulo: "Comprende el concepto de medición a partir del análisis de los procesos sociales que llevaron a su desarrollo para aplicarlo en situaciones de interés.",
    descripcion: "Comprende el concepto de medición y aplica las unidades del Sistema Internacional, las magnitudes y la notación científica para medir y convertir entre unidades en situaciones de interés.",
    descripcion_extendida: "Propósito formativo 6 (oficial MCCEMS 2025). Contenidos: concepto de medición; unidades de medida y Sistema Internacional; magnitudes y notación científica; razón y proporción. Incluye la conversión entre unidades.",
    categoria: "Medición", subcategoria: "Sistema Internacional y notación científica",
    ejes: ["Pensamiento crítico"], transversalidades: ["CNEYT-I"], horas: 4,
  },
  // ───────── OFICIAL 7 (NUEVA) ─────────
  {
    codigo: "PM-I-P10", numero: 7,
    titulo: "Aplica los elementos de la aritmética para resolver cálculos combinados con números reales.",
    descripcion: "Aplica los elementos de la aritmética para resolver operaciones combinadas con números reales usando la jerarquía de operaciones y los símbolos de agrupación.",
    descripcion_extendida: "Propósito formativo 7 (oficial MCCEMS 2025). Contenidos: técnicas para la resolución de operaciones combinadas (jerarquía de operaciones); uso de símbolos para resolución de operaciones combinadas (paréntesis, corchetes, llaves y puntos); resolución de restas de números enteros como la suma con el opuesto de otro; operaciones combinadas con adición, sustracción, multiplicación, división, potencias y raíces.",
    categoria: "Aritmética", subcategoria: "Operaciones combinadas y jerarquía",
    ejes: ["Pensamiento crítico"], transversalidades: ["CNEYT-I"], horas: 4,
  },
  // ───────── COMPLEMENTOS (contenido valioso conservado) ─────────
  {
    codigo: "PM-I-P05", numero: 8,
    titulo: "Comprende y aplica el concepto de razón y proporción en situaciones de proporcionalidad directa e inversa.",
    descripcion: "Comprende y aplica la razón, la proporción y la regla de tres en situaciones de proporcionalidad directa e inversa.",
    descripcion_extendida: "Complemento CEN que profundiza los contenidos oficiales de proporción (propósitos 4 y 6). Contenidos: razón, proporción y regla de tres; proporcionalidad directa e inversa.",
    categoria: "Aritmética", subcategoria: "Proporcionalidad",
    ejes: ["Pensamiento crítico"], transversalidades: ["CNEYT-I"], horas: 3,
  },
  {
    codigo: "PM-I-P01", numero: 9,
    titulo: "Reconoce las matemáticas como construcción humana con historia, diversidad cultural y vinculación con la vida cotidiana.",
    descripcion: "Reconoce las matemáticas como una construcción humana, histórica e intercultural, vinculada con la vida cotidiana.",
    descripcion_extendida: "Complemento CEN alineado con la meta educativa oficial ('comprender las matemáticas como expresión del pensamiento humano') y con el enfoque de procesos sociales de los propósitos 2 y 6. Contenidos: historia de las matemáticas; diversidad de sistemas numéricos; las matemáticas como práctica social.",
    categoria: "Pensamiento matemático como práctica social", subcategoria: "Historia y cultura matemática",
    ejes: ["Pensamiento crítico", "Interculturalidad crítica"], transversalidades: [], horas: 3,
  },
  {
    codigo: "PM-I-P07", numero: 10,
    titulo: "Estima, aproxima y verifica la razonabilidad de resultados en cálculos numéricos.",
    descripcion: "Estima, aproxima y verifica la razonabilidad de los resultados en cálculos numéricos para desarrollar el sentido numérico.",
    descripcion_extendida: "Complemento CEN que desarrolla el sentido numérico transversal a todos los propósitos oficiales. Contenidos: estimación y aproximación; verificación de resultados; sentido numérico.",
    categoria: "Razonamiento matemático", subcategoria: "Estimación y verificación",
    ejes: ["Pensamiento crítico"], transversalidades: [], horas: 3,
  },
];

async function main() {
  const sb = createSB();
  log("\n🔧 Realineación de progresiones PM-I al programa oficial MCCEMS 2025\n");

  const { data: uacRow, error: uacErr } = await sb.from("uac").select("id").eq("codigo", "PM-I").single();
  if (uacErr || !uacRow) throw new Error(`UAC PM-I no encontrada: ${uacErr?.message}`);

  // Paso 1: liberar el rango 1-10 bombeando los numeros existentes a +100.
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
  log(`  ✓ ${rows.length} progresiones PM-I en orden oficial (7 oficiales + 3 complementos).\n`);

  // Verificación
  const { data: final } = await sb.from("progresiones").select("codigo,numero,titulo").eq("uac_id", uacRow.id).order("numero");
  for (const p of final ?? []) log(`  P${String(p.numero).padStart(2, "0")} [${p.codigo}] — ${p.titulo.slice(0, 70)}`);
  log("");
}

main().catch((e) => { console.error("❌ Error:", e.message); process.exit(1); });

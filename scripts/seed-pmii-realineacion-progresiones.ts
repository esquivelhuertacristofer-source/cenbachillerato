/**
 * Realineación PM-II al programa oficial MCCEMS 2025 ("Introducción al Álgebra").
 * - Corrige el nombre de la UAC: "Pensamiento Matemático II" → "Introducción al Álgebra".
 * - Renumera las progresiones existentes al orden oficial (preserva su tema y sus actividades).
 * - Conserva 3 no-oficiales (ecuaciones lineales 1var, sistemas 2×2, inecuaciones) como COMPLEMENTO (numero 101+).
 * - Crea 3 progresiones oficiales faltantes: P07 (operaciones monomios/binomios), P08 (trinomios/polinomios/productos
 *   notables), P09 (ecuación, igualdad y propiedades).
 * Anti-colisión: bump +200 a numero existentes, luego upsert al orden oficial.
 * Uso: npx tsx scripts/seed-pmii-realineacion-progresiones.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

const META =
  "Entienda al lenguaje algebraico como un medio de representación de situaciones cotidianas y escolares para estimular el pensamiento abstracto.";

const ejesComunes = ["Pensamiento Crítico"];

type Prog = {
  codigo: string; numero: number; titulo: string; descripcion: string; descripcion_extendida: string;
  categoria: string; subcategoria: string; ejes: string[]; transversalidades: string[]; horas: number;
};

const progresiones: Prog[] = [
  {
    codigo: "PM-II-P01", numero: 1,
    titulo: "Del lenguaje aritmético al lenguaje algebraico",
    descripcion: "Representa operaciones aritméticas con letras y símbolos, comprende el concepto de incógnita y traduce situaciones del lenguaje común al lenguaje algebraico.",
    descripcion_extendida: "Definición de suma, producto, razón, cociente, diferencia y residuo. Uso de símbolos y letras. Concepto de incógnita. Términos y expresiones algebraicas. Traducción del lenguaje común al lenguaje algebraico a partir de situaciones cotidianas y escolares.",
    categoria: "Lenguaje algebraico", subcategoria: "De lo aritmético a lo simbólico",
    ejes: ejesComunes, transversalidades: ["Pensamiento crítico"], horas: 8,
  },
  {
    codigo: "PM-II-P02", numero: 2,
    titulo: "Expresiones algebraicas: monomios, binomios, trinomios y polinomios",
    descripcion: "Clasifica las expresiones algebraicas e identifica los componentes de un monomio para representar situaciones reales.",
    descripcion_extendida: "Clasificación de expresiones algebraicas (monomio, binomio, trinomio, polinomio). Componentes de un monomio: coeficiente, variable, exponente positivo y grado. Representación de situaciones reales mediante expresiones algebraicas.",
    categoria: "Expresiones algebraicas", subcategoria: "Clasificación y componentes",
    ejes: ejesComunes, transversalidades: ["Pensamiento crítico"], horas: 8,
  },
  {
    codigo: "PM-II-P07", numero: 3, // NUEVA — Oficial 3
    titulo: "Operaciones con monomios y binomios",
    descripcion: "Realiza sumas, restas, multiplicaciones y divisiones con monomios y binomios aplicando las reglas de los exponentes y de los signos.",
    descripcion_extendida: "Operaciones con monomios y binomios: suma, resta, multiplicación y división. Reglas de los exponentes y de los signos. Operaciones con fracciones algebraicas. Factorización de monomios. Introducción al binomio y al trinomio simple.",
    categoria: "Operaciones algebraicas", subcategoria: "Monomios y binomios",
    ejes: ejesComunes, transversalidades: ["Pensamiento crítico"], horas: 8,
  },
  {
    codigo: "PM-II-P08", numero: 4, // NUEVA — Oficial 4
    titulo: "Operaciones con trinomios y polinomios; productos notables",
    descripcion: "Opera con trinomios y polinomios y aplica los productos notables para simplificar y desarrollar expresiones algebraicas.",
    descripcion_extendida: "Operaciones con trinomios y polinomios (suma, resta, multiplicación y división). Productos notables: binomio al cuadrado, binomios conjugados, binomios con término común, binomio al cubo. Aplicación a la simplificación de expresiones.",
    categoria: "Operaciones algebraicas", subcategoria: "Trinomios, polinomios y productos notables",
    ejes: ejesComunes, transversalidades: ["Pensamiento crítico"], horas: 8,
  },
  {
    codigo: "PM-II-P03", numero: 5,
    titulo: "Factorización y álgebra aplicada",
    descripcion: "Factoriza polinomios y aplica el álgebra a situaciones cotidianas como presupuestos, proporciones y precios con descuento.",
    descripcion_extendida: "Factorización de polinomios: factor común, diferencia de cuadrados, trinomio cuadrado perfecto. Álgebra aplicada a la vida diaria: presupuesto personal, ajuste de proporciones en recetas, precios con descuento y porcentajes.",
    categoria: "Álgebra aplicada", subcategoria: "Factorización y aplicaciones",
    ejes: ejesComunes, transversalidades: ["Educación financiera"], horas: 8,
  },
  {
    codigo: "PM-II-P09", numero: 6, // NUEVA — Oficial 6
    titulo: "Ecuación, igualdad y sus propiedades",
    descripcion: "Comprende el concepto de ecuación e igualdad, distingue la identidad algebraica y aplica las propiedades de la igualdad entre números reales.",
    descripcion_extendida: "Concepto de ecuación e igualdad. Identidad algebraica. Relaciones de igualdad entre números reales. Propiedades de la igualdad: reflexiva, simétrica, transitiva y de uniformidad. Distinción entre identidad y ecuación.",
    categoria: "Igualdad y ecuaciones", subcategoria: "Concepto y propiedades de la igualdad",
    ejes: ejesComunes, transversalidades: ["Pensamiento crítico"], horas: 8,
  },
  // ---- COMPLEMENTO (no oficial en PM-II; se conservan) ----
  {
    codigo: "PM-II-P04", numero: 101,
    titulo: "Ecuaciones lineales en una variable (complemento)",
    descripcion: "Plantea y resuelve ecuaciones lineales en una variable en contextos problemáticos.",
    descripcion_extendida: "Complemento de profundización: planteamiento y resolución de ecuaciones lineales de primer grado con una incógnita, y su aplicación a problemas cotidianos. Extiende el concepto oficial de igualdad hacia la resolución de ecuaciones.",
    categoria: "Ecuaciones (complemento)", subcategoria: "Ecuaciones lineales de una variable",
    ejes: ejesComunes, transversalidades: ["Pensamiento crítico"], horas: 6,
  },
  {
    codigo: "PM-II-P05", numero: 102,
    titulo: "Sistemas de ecuaciones lineales 2×2 (complemento)",
    descripcion: "Plantea y resuelve sistemas de ecuaciones lineales con dos variables mediante sustitución, igualación y eliminación.",
    descripcion_extendida: "Complemento de profundización: sistemas de dos ecuaciones lineales con dos incógnitas; métodos de sustitución, igualación y eliminación; interpretación de soluciones. Anticipa contenidos de cursos posteriores.",
    categoria: "Ecuaciones (complemento)", subcategoria: "Sistemas 2×2",
    ejes: ejesComunes, transversalidades: ["Pensamiento crítico"], horas: 6,
  },
  {
    codigo: "PM-II-P06", numero: 103,
    titulo: "Inecuaciones lineales (complemento)",
    descripcion: "Aplica inecuaciones lineales para describir y resolver situaciones de restricción y optimización básica.",
    descripcion_extendida: "Complemento de profundización: desigualdades e inecuaciones lineales de primer grado; representación en la recta numérica; aplicación a situaciones de restricción y optimización sencilla.",
    categoria: "Desigualdades (complemento)", subcategoria: "Inecuaciones lineales",
    ejes: ejesComunes, transversalidades: ["Pensamiento crítico"], horas: 6,
  },
];

async function main() {
  const sb = createSB();
  log("\n🔧 Realineación de progresiones PM-II al programa oficial\n");

  const { data: uac } = await sb.from("uac").select("id").eq("codigo", "PM-II").single();
  if (!uac) throw new Error("UAC PM-II no encontrada");
  const uacId = uac.id;

  // 0) Corregir nombre oficial de la UAC
  await sb.from("uac").update({ nombre: "Introducción al Álgebra" }).eq("id", uacId);
  log("  ✓ Nombre UAC corregido → 'Introducción al Álgebra'");

  // 1) Anti-colisión: bump numero existentes +200
  const existentes = await getProgresionesDeUAC(sb, "PM-II");
  for (const p of existentes) {
    const { data: cur } = await sb.from("progresiones").select("numero").eq("id", p.id).single();
    if (cur && cur.numero < 200) {
      await sb.from("progresiones").update({ numero: cur.numero + 200 }).eq("id", p.id);
    }
  }
  log("  ✓ numero existentes desplazados +200 (anti-colisión).");

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

  // 3) total_progresiones (solo oficiales)
  const oficiales = progresiones.filter((p) => p.numero < 100).length;
  await sb.from("uac").update({ total_progresiones: oficiales }).eq("id", uacId);

  // 4) Verificación
  log("\n📋 Orden final PM-II:");
  const final = await getProgresionesDeUAC(sb, "PM-II");
  for (const p of final) {
    const { data: full } = await sb.from("progresiones").select("numero,titulo").eq("id", p.id).single();
    log(`  ${String(full?.numero).padStart(3, "0")}. [${p.codigo}] ${full?.titulo}`);
  }
  log("");
}
main().catch((e) => { console.error("❌", e.message); process.exit(1); });

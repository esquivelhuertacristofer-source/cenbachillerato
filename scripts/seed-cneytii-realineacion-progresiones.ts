/**
 * Realineación CNEYT-II al programa oficial MCCEMS 2025 ("El poder de la energía").
 * - Corrige el nombre de la UAC: "Conservación de la energía" → "El poder de la energía".
 * - Renumera las progresiones existentes al orden oficial (preserva su tema y sus actividades).
 * - Conserva las 2 no-oficiales (consumo/impacto ambiental y renovables) como COMPLEMENTO (numero 101+).
 * - Crea 2 progresiones oficiales faltantes: P09 (gas ideal/1ª ley), P10 (entropía/entalpía/2ª-3ª leyes).
 * Anti-colisión: bump +200 a numero existentes, luego upsert al orden oficial.
 * Uso: npx tsx scripts/seed-cneytii-realineacion-progresiones.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { log, createSB, getProgresionesDeUAC } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

const META =
  "Comprenda la importancia de la energía para construir explicaciones sobre diversos fenómenos naturales, reconociendo sus formas, transformaciones y las leyes que la rigen.";

const ejesComunes = ["Pensamiento Crítico", "Apropiación de las culturas a través de la lectura y la escritura"];

type Prog = {
  codigo: string; numero: number; titulo: string; descripcion: string; descripcion_extendida: string;
  categoria: string; subcategoria: string; ejes: string[]; transversalidades: string[]; horas: number;
};

// Orden oficial final. Códigos existentes se renumeran; P09/P10 son NUEVOS; P06/P07 pasan a complemento.
const progresiones: Prog[] = [
  {
    codigo: "CNEYT-II-P01", numero: 1,
    titulo: "Energía: definición, formas y unidades de medición",
    descripcion: "Comprende qué es la energía, identifica sus distintas formas (cinética, potencial, térmica, luminosa, eléctrica, química) y las unidades con que se mide.",
    descripcion_extendida: "Definición de energía. Manifestaciones, tipos y transformación de la energía. Introducción a la medición de la energía y sus unidades (Joule, caloría). La energía como capacidad para producir cambios en la naturaleza.",
    categoria: "Energía", subcategoria: "Formas y medición de la energía",
    ejes: ejesComunes, transversalidades: ["Educación ambiental para la sustentabilidad"], horas: 8,
  },
  {
    codigo: "CNEYT-II-P02", numero: 2,
    titulo: "Transformación, transferencia y conservación de la energía",
    descripcion: "Analiza cómo la energía se transforma y se transfiere de un sistema a otro sin crearse ni destruirse, aplicando la ley de la conservación de la energía.",
    descripcion_extendida: "La energía se transforma y se transfiere sin destruirse. Ley de la conservación de la energía. Transformaciones de energía en sistemas físicos y en fenómenos cotidianos. Medición de la energía transferida.",
    categoria: "Energía", subcategoria: "Ley de conservación de la energía",
    ejes: ejesComunes, transversalidades: ["Educación ambiental para la sustentabilidad"], horas: 8,
  },
  {
    codigo: "CNEYT-II-P05", numero: 3,
    titulo: "Energía mecánica: fuerza, movimiento y energía cinética",
    descripcion: "Relaciona fuerza, posición, movimiento y velocidad con la energía mecánica, y calcula la energía cinética de un cuerpo en movimiento.",
    descripcion_extendida: "Fuerza, posición, movimiento y velocidad. Energía mecánica (cinética y potencial). Cálculo de la energía cinética. Relación entre el movimiento de los cuerpos y la energía mecánica en situaciones prácticas.",
    categoria: "Energía mecánica", subcategoria: "Fuerza y energía cinética",
    ejes: ejesComunes, transversalidades: ["Vida saludable"], horas: 8,
  },
  {
    codigo: "CNEYT-II-P04", numero: 4,
    titulo: "Calor, temperatura y transferencia de calor",
    descripcion: "Distingue entre calor y temperatura, mide el calor, usa escalas termométricas y describe la propagación del calor por conducción, convección y radiación.",
    descripcion_extendida: "Diferencia entre calor y temperatura. Medición del calor. Escalas termométricas (Celsius, Kelvin, Fahrenheit). Equilibrio térmico. Propagación del calor: conducción, convección y radiación. Conductividad calorífica y capacidad térmica específica.",
    categoria: "Termología", subcategoria: "Calor, temperatura y propagación",
    ejes: ejesComunes, transversalidades: ["Educación ambiental para la sustentabilidad"], horas: 8,
  },
  {
    codigo: "CNEYT-II-P03", numero: 5,
    titulo: "Trabajo mecánico y principios de la termodinámica",
    descripcion: "Comprende el trabajo mecánico y el concepto de termodinámica, y reconoce el vínculo entre el trabajo y los procesos termodinámicos.",
    descripcion_extendida: "Trabajo mecánico. Concepto de termodinámica. Vínculo entre trabajo y termodinámica. Producción de calor por procesos mecánicos. Aplicación a fenómenos cotidianos donde el trabajo se relaciona con el intercambio de energía térmica.",
    categoria: "Termodinámica", subcategoria: "Trabajo y termodinámica",
    ejes: ejesComunes, transversalidades: ["Vida saludable"], horas: 8,
  },
  {
    codigo: "CNEYT-II-P09", numero: 6, // NUEVA — Oficial 6
    titulo: "Gas ideal y primera ley de la termodinámica",
    descripcion: "Analiza el comportamiento del gas ideal y la primera ley de la termodinámica, reconociendo el sistema termodinámico y la equivalencia entre caloría y Joule.",
    descripcion_extendida: "Producción de calor por procesos mecánicos. Gas ideal: equivalencia caloría-Joule, principio cero de la termodinámica, dinámica y ecuación del gas ideal. Sistema termodinámico (fronteras, sistemas abiertos y cerrados, variables de estado). Primera ley de la termodinámica.",
    categoria: "Termodinámica", subcategoria: "Gas ideal y primera ley",
    ejes: ejesComunes, transversalidades: ["Educación ambiental para la sustentabilidad"], horas: 8,
  },
  {
    codigo: "CNEYT-II-P10", numero: 7, // NUEVA — Oficial 7
    titulo: "Entropía, entalpía y leyes de la termodinámica",
    descripcion: "Aplica la primera ley de la termodinámica y comprende los conceptos de entropía y entalpía, así como la segunda y tercera leyes de la termodinámica.",
    descripcion_extendida: "Aplicaciones de la primera ley de la termodinámica. Entropía y entalpía. Segunda ley de la termodinámica (dirección de los procesos y degradación de la energía). Tercera ley de la termodinámica. Implicaciones en máquinas térmicas y procesos naturales.",
    categoria: "Termodinámica", subcategoria: "Entropía, entalpía y leyes",
    ejes: ejesComunes, transversalidades: ["Educación ambiental para la sustentabilidad"], horas: 8,
  },
  {
    codigo: "CNEYT-II-P08", numero: 8,
    titulo: "Explicaciones de fenómenos energéticos y aplicaciones tecnológicas",
    descripcion: "Construye explicaciones sobre diversos fenómenos naturales a partir del concepto de energía y reconoce sus aplicaciones tecnológicas en su entorno.",
    descripcion_extendida: "Construcción de explicaciones sobre fenómenos naturales con base en la energía y sus transformaciones. Aplicaciones tecnológicas de la energía. Diseño de investigaciones y argumentación científica sobre fenómenos energéticos del entorno inmediato.",
    categoria: "Energía y sociedad", subcategoria: "Explicaciones y aplicaciones tecnológicas",
    ejes: ejesComunes, transversalidades: ["Educación ambiental para la sustentabilidad"], horas: 8,
  },
  // ---- COMPLEMENTO (no oficial en CNEYT-II; pertenecen a CNEYT-III, se conservan) ----
  {
    codigo: "CNEYT-II-P06", numero: 101,
    titulo: "Consumo energético e impacto ambiental (complemento)",
    descripcion: "Relaciona el consumo energético con el impacto ambiental y propone alternativas sustentables.",
    descripcion_extendida: "Complemento de educación ambiental: relación entre el consumo de energía, la huella ecológica y el impacto ambiental; propuestas de uso eficiente y sustentable de la energía en la vida cotidiana.",
    categoria: "Energía y sociedad (complemento)", subcategoria: "Consumo e impacto ambiental",
    ejes: ejesComunes, transversalidades: ["Educación ambiental para la sustentabilidad"], horas: 6,
  },
  {
    codigo: "CNEYT-II-P07", numero: 102,
    titulo: "Energías renovables y no renovables en México (complemento)",
    descripcion: "Analiza las fuentes de energía renovable y no renovable en el contexto mexicano.",
    descripcion_extendida: "Complemento contextual: fuentes de energía renovable (solar, eólica, hidráulica, geotérmica) y no renovable (fósiles), su papel en el contexto energético de México y los retos de la transición energética.",
    categoria: "Energía y sociedad (complemento)", subcategoria: "Fuentes de energía en México",
    ejes: ejesComunes, transversalidades: ["Educación ambiental para la sustentabilidad"], horas: 6,
  },
];

async function main() {
  const sb = createSB();
  log("\n🔧 Realineación de progresiones CNEYT-II al programa oficial\n");

  const { data: uac } = await sb.from("uac").select("id").eq("codigo", "CNEYT-II").single();
  if (!uac) throw new Error("UAC CNEYT-II no encontrada");
  const uacId = uac.id;

  // 0) Corregir nombre oficial de la UAC
  await sb.from("uac").update({ nombre: "El poder de la energía" }).eq("id", uacId);
  log("  ✓ Nombre UAC corregido → 'El poder de la energía'");

  // 1) Anti-colisión: bump numero existentes +200
  const existentes = await getProgresionesDeUAC(sb, "CNEYT-II");
  for (const p of existentes) {
    const { data: cur } = await sb.from("progresiones").select("numero").eq("id", p.id).single();
    if (cur && cur.numero < 200) {
      await sb.from("progresiones").update({ numero: cur.numero + 200 }).eq("id", p.id);
    }
  }
  log("  ✓ numero existentes desplazados +200 (anti-colisión).");

  // 2) Upsert al orden oficial (existentes renumeradas + nuevas insertadas + complemento)
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

  // 3) total_progresiones (solo oficiales, numero < 100)
  const oficiales = progresiones.filter((p) => p.numero < 100).length;
  await sb.from("uac").update({ total_progresiones: oficiales }).eq("id", uacId);

  // 4) Verificación
  log("\n📋 Orden final CNEYT-II:");
  const final = await getProgresionesDeUAC(sb, "CNEYT-II");
  for (const p of final) {
    const { data: full } = await sb.from("progresiones").select("numero,titulo").eq("id", p.id).single();
    log(`  ${String(full?.numero).padStart(3, "0")}. [${p.codigo}] ${full?.titulo}`);
  }
  log("");
}
main().catch((e) => { console.error("❌", e.message); process.exit(1); });

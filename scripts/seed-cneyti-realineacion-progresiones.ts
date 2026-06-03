/**
 * Realineación de progresiones de CNEYT-I a los 8 propósitos formativos oficiales (MCCEMS 2025).
 * Fuente oficial: public/2025_MCC_CIENCIAS NATURALES_BN.pdf — Tabla 1 (8 propósitos, 4 h/sem).
 *
 * Qué hace (idempotente, upsert por "codigo"):
 *  1. Renumera las 8 progresiones existentes al ORDEN oficial (campo numero).
 *  2. AUGMENTA descripcion/descripcion_extendida de P02, P03, P04, P05, P06 para cubrir
 *     el contenido oficial que faltaba (masa/densidad/cálculo, modelos atómicos Dalton→Schrödinger,
 *     disoluciones+tabla periódica, energía cinética/potencial/interna+teoría cinética, medición).
 *  3. AGREGA 3 progresiones oficiales que faltaban por completo:
 *       P09 = Propósito 2 (interrelación física/química/biología + tecnología)
 *       P10 = Propósito 6 (enlaces químicos: iones, moléculas, isótopos, config. electrónica, valencia, electronegatividad)
 *       P11 = Propósito 8 (naturaleza energética y corpuscular + actividad eléctrica + aplicaciones tecnológicas)
 *  4. Conserva como COMPLEMENTO (decisión del usuario): P06 (método, ahora oficial 1b), P07 (mujeres) y P08 (ambiente).
 *
 * NO borra ninguna progresión ni actividad existente. Las actividades quedan ligadas por progresion_id (FK estable).
 * Uso: npx tsx scripts/seed-cneyti-realineacion-progresiones.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

config({ path: resolve(process.cwd(), ".env.local") });

const META =
  "Comprenda el carácter creativo, social y colectivo de las ciencias al explorar la naturaleza de la materia, sus propiedades y sus transformaciones físicas en contextos cotidianos y relevantes.";

// numero = orden de presentación al estudiante (secuencia oficial); codigo = identidad estable.
const PROGRESIONES = [
  // ── Propósito 1a ─────────────────────────────────────────────────────────────
  {
    codigo: "CNEYT-I-P01",
    numero: 1,
    titulo: "Reconoce a las ciencias como práctica social, histórica y colectiva influida por contextos culturales.",
    descripcion: "Reconoce a las ciencias como práctica social, histórica y colectiva influida por contextos culturales.",
    descripcion_extendida:
      "Reconoce el carácter creativo, social, histórico y colectivo de las ciencias. Contenidos: naturaleza de las ciencias (historia, sociología y epistemología); ciencia como construcción colectiva sujeta a revisión, debate y autocorrección; influencia de los contextos culturales y de financiamiento. (Propósito formativo oficial 1, parte a.)",
    categoria: "Naturaleza de la ciencia",
    subcategoria: "Ciencia como práctica social",
    ejes: ["Pensamiento crítico", "Interculturalidad crítica"],
    transv: ["LC-I", "CS-I"],
    horas: 3,
  },
  // ── Propósito 1b ─────────────────────────────────────────────────────────────
  {
    codigo: "CNEYT-I-P06",
    numero: 2,
    titulo: "Aplica el método científico y la medición en observaciones e investigaciones del entorno.",
    descripcion: "Aplica el método científico y la medición en observaciones e investigaciones del entorno.",
    descripcion_extendida:
      "Aplica el método científico y los procesos de medición en pequeñas investigaciones. Contenidos: observación, pregunta, hipótesis falsificable, experimentación controlada (variables independiente, dependiente y de control), análisis y conclusión; medición: magnitudes, unidades del Sistema Internacional, instrumentos, incertidumbre y cifras significativas. (Propósito formativo oficial 1, parte b: método científico y medición.)",
    categoria: "Naturaleza de la ciencia",
    subcategoria: "Método científico y medición",
    ejes: ["Pensamiento crítico"],
    transv: ["PM-I", "LC-I"],
    horas: 3,
  },
  // ── Propósito 2 (NUEVA) ──────────────────────────────────────────────────────
  {
    codigo: "CNEYT-I-P09",
    numero: 3,
    titulo: "Relaciona los fenómenos naturales y la interrelación entre física, química, biología y tecnología.",
    descripcion: "Relaciona los fenómenos naturales como hechos interrelacionados que estudian la física, la química y la biología, y su vínculo con la tecnología.",
    descripcion_extendida:
      "Comprende que los fenómenos naturales están interrelacionados y son estudiados de forma complementaria por la física, la química y la biología, y reconoce el vínculo de las ciencias con la tecnología. Contenidos: objeto de estudio de cada ciencia natural y sus fronteras compartidas; fenómenos que requieren varias disciplinas (p. ej. la fotosíntesis: física de la luz, química de la reacción, biología del organismo); ciencia y tecnología como actividades que se retroalimentan. (Propósito formativo oficial 2.)",
    categoria: "Naturaleza de la ciencia",
    subcategoria: "Interrelación de las ciencias y tecnología",
    ejes: ["Pensamiento crítico"],
    transv: ["PM-I", "CD-I"],
    horas: 3,
  },
  // ── Propósito 3 (AUGMENTADA) ─────────────────────────────────────────────────
  {
    codigo: "CNEYT-I-P02",
    numero: 4,
    titulo: "Distingue la materia, el cuerpo, la masa y la densidad, y calcula volumen y densidad.",
    descripcion: "Distingue la materia y sus propiedades físicas y químicas generales, incluyendo masa, volumen y densidad, y realiza cálculos de volumen y densidad.",
    descripcion_extendida:
      "Distingue los conceptos de materia y cuerpo, y sus propiedades físicas y químicas. Contenidos: materia y cuerpo; masa (cantidad de materia) frente a peso; volumen y su cálculo (geométrico y por desplazamiento de agua); densidad como propiedad intensiva (ρ = m/V) y su uso para identificar sustancias y predecir flotación; otras propiedades (solubilidad, puntos de fusión/ebullición, conductividad); distinción entre propiedades físicas y químicas. (Propósito formativo oficial 3: materia, cuerpo, masa y densidad; cálculo de volumen y densidad.)",
    categoria: "Materia y sus propiedades",
    subcategoria: "Materia, masa, volumen y densidad",
    ejes: ["Pensamiento crítico"],
    transv: ["PM-I"],
    horas: 3,
  },
  // ── Propósito 4 (AUGMENTADA) ─────────────────────────────────────────────────
  {
    codigo: "CNEYT-I-P04",
    numero: 5,
    titulo: "Clasifica la materia en sustancias puras y mezclas, separa mezclas y describe disoluciones y la clasificación periódica.",
    descripcion: "Clasifica la materia en sustancias puras (elementos y compuestos) y mezclas, aplica métodos de separación, describe la concentración de las disoluciones y la clasificación periódica de los elementos.",
    descripcion_extendida:
      "Clasifica la materia y la organiza. Contenidos: sustancia pura, elemento y compuesto; mezclas homogéneas (disoluciones) y heterogéneas; propiedades físicas y químicas que las distinguen; métodos de separación (filtración, decantación, destilación, evaporación, cristalización, tamizado); concentración de las disoluciones (cualitativa: diluida/concentrada/saturada; y cuantitativa básica: % masa, soluto/disolvente/disolución); clasificación periódica de los elementos (periodos, grupos, metales/no metales/metaloides). (Propósito formativo oficial 4.)",
    categoria: "Materia y sus propiedades",
    subcategoria: "Sustancias, mezclas, disoluciones y tabla periódica",
    ejes: ["Pensamiento crítico"],
    transv: ["PM-I"],
    horas: 4,
  },
  // ── Propósito 5 (AUGMENTADA) ─────────────────────────────────────────────────
  {
    codigo: "CNEYT-I-P03",
    numero: 6,
    titulo: "Describe el átomo, su composición eléctrica y la evolución de los modelos atómicos (Dalton a Schrödinger).",
    descripcion: "Describe la estructura del átomo, su naturaleza eléctrica y la evolución de los modelos atómicos de Dalton, Thomson, Rutherford, Bohr y Schrödinger.",
    descripcion_extendida:
      "Describe el átomo y su composición eléctrica. Contenidos: partículas subatómicas (protón, neutrón, electrón) y sus cargas; número atómico (Z) y número de masa (A); naturaleza eléctrica de la materia; evolución histórica de los modelos atómicos: Dalton (esfera indivisible), Thomson (pudín de pasas), Rutherford (núcleo), Bohr (niveles de energía) y Schrödinger (modelo cuántico de orbitales y probabilidad). (Propósito formativo oficial 5.)",
    categoria: "Materia y sus propiedades",
    subcategoria: "Estructura atómica y modelos",
    ejes: ["Pensamiento crítico"],
    transv: ["PM-I"],
    horas: 4,
  },
  // ── Propósito 6 (NUEVA) ──────────────────────────────────────────────────────
  {
    codigo: "CNEYT-I-P10",
    numero: 7,
    titulo: "Explica iones, moléculas, isótopos y los enlaces químicos a partir de la configuración electrónica, la valencia y la electronegatividad.",
    descripcion: "Explica la formación de iones y moléculas mediante enlaces químicos, y los relaciona con la configuración electrónica, la valencia, los isótopos y la electronegatividad.",
    descripcion_extendida:
      "Explica cómo se unen los átomos. Contenidos: configuración electrónica y electrones de valencia; regla del octeto; iones (cationes y aniones) e isótopos; electronegatividad; enlaces químicos: iónico (transferencia de electrones), covalente (compartición: polar y no polar) y metálico; molécula y fórmula química; relación de los enlaces con las propiedades de las sustancias. (Propósito formativo oficial 6.)",
    categoria: "Materia y sus propiedades",
    subcategoria: "Enlaces químicos y configuración electrónica",
    ejes: ["Pensamiento crítico"],
    transv: ["PM-I"],
    horas: 4,
  },
  // ── Propósito 7 (AUGMENTADA) ─────────────────────────────────────────────────
  {
    codigo: "CNEYT-I-P05",
    numero: 8,
    titulo: "Explica los estados de agregación y sus cambios en función de la energía cinética, potencial e interna (teoría cinética).",
    descripcion: "Explica los estados de agregación de la materia y sus cambios vinculándolos con la energía cinética, potencial e interna de las partículas y la teoría cinética molecular.",
    descripcion_extendida:
      "Explica los estados de agregación y sus cambios. Contenidos: estados sólido, líquido, gaseoso (y plasma); teoría cinética molecular: las partículas están en movimiento constante y la temperatura es medida de su energía cinética promedio; energía cinética (movimiento), energía potencial (fuerzas de atracción entre partículas) y energía interna (suma de ambas); cambios de estado (fusión, solidificación, vaporización, condensación, sublimación, deposición) y su explicación por transferencia de energía; relación con temperatura y presión. (Propósito formativo oficial 7.)",
    categoria: "Materia y sus propiedades",
    subcategoria: "Estados de la materia y energía",
    ejes: ["Pensamiento crítico"],
    transv: ["PM-I"],
    horas: 4,
  },
  // ── Propósito 8 (NUEVA) ──────────────────────────────────────────────────────
  {
    codigo: "CNEYT-I-P11",
    numero: 9,
    titulo: "Relaciona la naturaleza energética y corpuscular de la materia con la actividad eléctrica y sus aplicaciones tecnológicas.",
    descripcion: "Relaciona la naturaleza energética y corpuscular de la materia con la actividad eléctrica y reconoce sus aplicaciones tecnológicas.",
    descripcion_extendida:
      "Integra la doble naturaleza de la materia. Contenidos: naturaleza corpuscular (partículas) y energética de la materia; carga eléctrica y actividad eléctrica (electrones libres, conductores y aislantes, corriente eléctrica básica); transformaciones de energía; aplicaciones tecnológicas (pilas y baterías, electrólisis, semiconductores, electrónica cotidiana) y su relación con la estructura de la materia. (Propósito formativo oficial 8.)",
    categoria: "Materia y energía",
    subcategoria: "Naturaleza energética, eléctrica y tecnología",
    ejes: ["Pensamiento crítico", "Ciudadanía"],
    transv: ["PM-I", "CD-I"],
    horas: 4,
  },
  // ── Complemento (decisión del usuario: conservar) ────────────────────────────
  {
    codigo: "CNEYT-I-P07",
    numero: 10,
    titulo: "Valora el papel de las mujeres y grupos históricamente marginados en el desarrollo científico.",
    descripcion: "Valora el papel de las mujeres y grupos históricamente marginados en el desarrollo científico.",
    descripcion_extendida:
      "Valora el papel de las mujeres y grupos históricamente marginados en el desarrollo científico. Contenidos: historia de la ciencia con perspectiva de género e interculturalidad; aportaciones de científicas y de comunidades indígenas. Progresión COMPLEMENTARIA (no corresponde a un propósito oficial específico; refuerza el propósito 1 sobre la ciencia como práctica social).",
    categoria: "Naturaleza de la ciencia",
    subcategoria: "Ciencia, género e inclusión",
    ejes: ["Igualdad de género", "Interculturalidad crítica", "Inclusión"],
    transv: ["CS-I", "PFH-I"],
    horas: 3,
  },
  {
    codigo: "CNEYT-I-P08",
    numero: 11,
    titulo: "Relaciona la materia y sus transformaciones con problemas ambientales locales y globales.",
    descripcion: "Relaciona los conceptos de materia y sus transformaciones con problemas ambientales locales y globales.",
    descripcion_extendida:
      "Relaciona la materia y sus transformaciones con problemas ambientales. Contenidos: ley de conservación de la materia; transformaciones físicas y químicas y su impacto ambiental; contaminación, residuos y cambio climático; sustentabilidad. Progresión COMPLEMENTARIA (aplicación transversal de los propósitos oficiales a la sustentabilidad).",
    categoria: "Ciencia y sociedad",
    subcategoria: "Ciencia y medio ambiente",
    ejes: ["Pensamiento crítico", "Ciudadanía"],
    transv: ["CS-I", "CD-I"],
    horas: 3,
  },
] as const;

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  const sb = createClient<Database>(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  console.log("\n🔧 CNEYT-I — Realineación de progresiones a los 8 propósitos oficiales 2025\n");

  const { data: uacRow, error: uacErr } = await sb.from("uac").select("id").eq("codigo", "CNEYT-I").single();
  if (uacErr || !uacRow) throw new Error(`UAC CNEYT-I no encontrada: ${uacErr?.message}`);

  // Paso previo: liberar el espacio de numeración (constraint única uac_id+numero).
  // Subimos todas las progresiones existentes a numero+100 para evitar colisiones transitorias.
  const { data: existentes } = await sb
    .from("progresiones").select("id, numero").eq("uac_id", uacRow.id);
  for (const e of existentes ?? []) {
    if (e.numero != null && e.numero < 100) {
      await sb.from("progresiones").update({ numero: e.numero + 100 }).eq("id", e.id);
    }
  }
  console.log(`  ✓ Numeración liberada (${existentes?.length ?? 0} progresiones desplazadas temporalmente).`);

  const rows = PROGRESIONES.map((p) => ({
    codigo: p.codigo,
    uac_id: uacRow.id,
    numero: p.numero,
    titulo: p.titulo,
    descripcion: p.descripcion,
    descripcion_extendida: p.descripcion_extendida,
    meta_aprendizaje: META,
    categoria: p.categoria,
    subcategoria: p.subcategoria,
    ejes_articuladores: p.ejes as unknown as string[],
    transversalidades: p.transv as unknown as string[],
    tiempo_estimado_horas: p.horas,
    es_placeholder: false,
  }));

  const { error } = await sb.from("progresiones").upsert(rows, { onConflict: "codigo" });
  if (error) throw new Error(`Error en upsert de progresiones: ${error.message}`);

  console.log(`  ✓ ${rows.length} progresiones actualizadas/creadas (orden oficial aplicado).`);

  // Verificación: listar el orden final
  const { data: final } = await sb
    .from("progresiones")
    .select("numero, codigo, titulo")
    .eq("uac_id", uacRow.id)
    .order("numero", { ascending: true });

  console.log("\n  📋 Orden final de CNEYT-I:");
  for (const p of final ?? []) {
    console.log(`     P${String(p.numero).padStart(2, "0")} [${p.codigo}] — ${p.titulo.slice(0, 70)}`);
  }
  console.log("\n✅ Realineación de progresiones completada.\n");
}

main().catch((err) => { console.error("❌ Error:", err.message); process.exit(1); });

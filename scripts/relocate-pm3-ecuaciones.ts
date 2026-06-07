/**
 * Reubicación PM-II → PM-III: ecuaciones lineales (alineación Modelo 2025).
 *
 * El Modelo 2025 ubica "resolver ecuaciones lineales / sistemas" en PM-III
 * (Pensamiento algebraico), no en PM-II (Introducción al álgebra). La plataforma
 * las tenía como complementos en PM-II. Este script las mueve a PM-III para
 * cerrar los huecos oficiales O1 y O3, y reubica inecuaciones como complemento
 * de PM-III (no tiene propósito oficial 2025).
 *
 * - O1 ← PM-II-P04 (lab ecuacion-lineal-barras)  → PM-III-P07, numero 1 (OFICIAL)
 * - O3 ← PM-II-P05 (lab sistemas-ecuaciones-2x2) → PM-III-P08, numero 3 (OFICIAL)
 * - inecuaciones ← PM-II-P06 (lab inecuaciones-lineales) → PM-III-P09, numero 10 (COMPLEMENTO)
 * - O2 (dos incógnitas) NO se toca: queda hueco (sin contenido existente).
 *
 * Los labs van por practica_slug + progresion_id (no por código) ⇒ no se orfanan.
 * Idempotente: re-ejecutable. Dry-run por defecto; aplica solo con --apply.
 *
 * Uso:  npx tsx scripts/relocate-pm3-ecuaciones.ts            (dry-run)
 *       npx tsx scripts/relocate-pm3-ecuaciones.ts --apply    (aplica)
 */
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });
import { createSB } from "./lib/activity-utils";
import { CATEGORIA_COMPLEMENTO } from "../src/lib/mccems/categorias";

const APPLY = process.argv.includes("--apply");

// Verbatim de src/lib/mccems/contenido-2025.ts (PM-III)
const O1_TITULO =
  "Aplica la aritmética y el manejo del álgebra para encontrar el valor de una incógnita en ecuaciones lineales que refieran a situaciones de interés.";
const O1_CONTENIDO =
  "Concepto de ecuación y sus partes Ecuaciones lineales de primer grado Procedimiento para encontrar el valor de una incógnita Forma estándar de las ecuaciones lineales";
const O3_TITULO =
  "Aplica la aritmética, el manejo del álgebra y el método gráfico para resolver sistemas de ecuaciones lineales que refieran a situaciones de interés";
const O3_CONTENIDO =
  "Método de igualación Método de sustitución Método de reducción Método gráfico Método por determinantes";

interface Move {
  oldCodigo: string;
  newCodigo: string;
  numero: number;
  oficial: boolean;
  categoria: string | null;
  titulo?: string;
  contenido?: string;
}

const MOVES: Move[] = [
  { oldCodigo: "PM-II-P04", newCodigo: "PM-III-P07", numero: 1, oficial: true, categoria: "Ecuaciones lineales", titulo: O1_TITULO, contenido: O1_CONTENIDO },
  { oldCodigo: "PM-II-P05", newCodigo: "PM-III-P08", numero: 3, oficial: true, categoria: "Sistemas de ecuaciones", titulo: O3_TITULO, contenido: O3_CONTENIDO },
  { oldCodigo: "PM-II-P06", newCodigo: "PM-III-P09", numero: 10, oficial: false, categoria: CATEGORIA_COMPLEMENTO },
];

async function main() {
  const sb = createSB();
  const tag = APPLY ? "[APPLY]" : "[DRY-RUN]";
  console.log(`${tag} Reubicación PM-II → PM-III (ecuaciones lineales)\n`);

  const { data: pm3 } = await sb.from("uac").select("id, total_progresiones").eq("codigo", "PM-III").single();
  const { data: pm2 } = await sb.from("uac").select("id, total_progresiones").eq("codigo", "PM-II").single();
  if (!pm3 || !pm2) throw new Error("No se encontró PM-II o PM-III");

  for (const m of MOVES) {
    // Idempotencia: localizar por código viejo o nuevo.
    const { data: prog } = await sb
      .from("progresiones")
      .select("id, codigo, numero, uac_id")
      .in("codigo", [m.oldCodigo, m.newCodigo])
      .maybeSingle();
    if (!prog) { console.log(`  ?? ${m.oldCodigo}/${m.newCodigo}: no encontrada (omito)`); continue; }

    const yaEnPM3 = prog.uac_id === pm3.id && prog.codigo === m.newCodigo && prog.numero === m.numero;
    console.log(`  ${m.oldCodigo} -> ${m.newCodigo} | numero ${prog.numero} -> ${m.numero} | ${m.oficial ? "OFICIAL" : "complemento"}${yaEnPM3 ? "  (ya aplicado)" : ""}`);

    const progUpdate: Record<string, unknown> = {
      uac_id: pm3.id,
      numero: m.numero,
      codigo: m.newCodigo,
      categoria: m.categoria,
    };
    if (m.oficial) {
      progUpdate.titulo = m.titulo;
      progUpdate.descripcion_extendida = m.contenido;
    }

    // Renombrar códigos de actividad (prefijo viejo -> nuevo). Sufijo -A{n} intacto ⇒ rutas OK.
    const { data: acts } = await sb
      .from("actividades")
      .select("id, codigo, practica_slug")
      .eq("progresion_id", prog.id)
      .order("codigo");
    const actRenames = (acts ?? []).map((a) => ({
      id: a.id,
      from: a.codigo,
      to: a.codigo.replace(m.oldCodigo, m.newCodigo),
      lab: a.practica_slug,
    }));
    for (const r of actRenames) {
      const labTxt = r.lab ? `  [lab:${r.lab}]` : "";
      console.log(`        act ${r.from} -> ${r.to}${labTxt}`);
    }

    if (APPLY && !yaEnPM3) {
      const { error: pErr } = await sb.from("progresiones").update(progUpdate).eq("id", prog.id);
      if (pErr) throw new Error(`UPDATE progresión ${m.newCodigo}: ${pErr.message}`);
      for (const r of actRenames) {
        if (r.from === r.to) continue;
        const { error: aErr } = await sb.from("actividades").update({ codigo: r.to }).eq("id", r.id);
        if (aErr) throw new Error(`UPDATE actividad ${r.from}->${r.to}: ${aErr.message}`);
      }
    }
  }

  // Recontar total_progresiones (= nº real de filas) en ambas UAC.
  for (const [codigo, uac] of [["PM-II", pm2], ["PM-III", pm3]] as const) {
    const { count } = await sb.from("progresiones").select("id", { count: "exact", head: true }).eq("uac_id", uac.id);
    console.log(`  total_progresiones ${codigo}: ${uac.total_progresiones} -> ${count}`);
    if (APPLY && count != null && count !== uac.total_progresiones) {
      const { error } = await sb.from("uac").update({ total_progresiones: count }).eq("id", uac.id);
      if (error) throw new Error(`UPDATE total_progresiones ${codigo}: ${error.message}`);
    }
  }

  console.log(`\n${tag} ${APPLY ? "APLICADO." : "Sin cambios (dry-run). Re-ejecuta con --apply para aplicar."}`);
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });

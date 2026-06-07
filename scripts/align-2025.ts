/**
 * Frente 2 — Alineación de datos al Modelo MCCEMS 2025 ("fidelidad sin destruir").
 *
 * Lee la fuente verbatim src/lib/mccems/contenido-2025.ts y actualiza SOLO TEXTO
 * en Supabase (idempotente, re-ejecutable):
 *   - uac.nombre        ← asignaturaOficial 2025
 *   - uac.descripcion   ← temaOficial 2025
 *   - progresiones.titulo ← propósito formativo verbatim (mapeo semántico)
 *   - progresiones.categoria ← 'Complemento (no oficial 2025)' para los EXTRAS
 *
 * NO renumera, NO borra, NO toca actividades/labs ni descripcion_extendida.
 * => los códigos de actividad permanecen estables => los 77 labs no se orfanan.
 *
 * Mapeo:
 *   - 26 UAC "limpias": propósito k → progresión con numero===k.
 *   - 6 UAC "revueltas" (extras intercalados): mapa semántico explícito por código
 *     (índice oficial 1-based → código de progresión). Verificado contra el dump DB.
 *
 * Uso:
 *   npx tsx scripts/align-2025.ts            (DRY-RUN: imprime el plan, no escribe)
 *   npx tsx scripts/align-2025.ts --apply    (aplica los UPDATE)
 *
 * EFÍMERO en cuanto a ejecución, pero el archivo se CONSERVA (re-alineable).
 */
import { config } from "dotenv";
import { resolve } from "path";
import { createSB } from "./lib/activity-utils";
import { CONTENIDO_2025 } from "../src/lib/mccems/contenido-2025";

config({ path: resolve(process.cwd(), ".env.local") });

const APPLY = process.argv.includes("--apply");
const COMPLEMENTO = "Complemento (no oficial 2025)";

/**
 * Mapas semánticos para las UAC donde el orden/desglose de la DB (modelo 2022,
 * más fino) ≠ la posición de los propósitos oficiales 2025. Clave = índice
 * oficial 1-based → código de progresión. Índices oficiales sin clave = HUECO
 * (tema oficial sin contenido construido). Progresiones no referenciadas =
 * "Complemento (no oficial 2025)". Derivados y verificados contra el dump real
 * de la DB / sidebyside.txt (2026-06-07).
 *
 * Las UAC NO listadas aquí están alineadas 1:1 (propósito k → numero===k):
 *   LC-I/II/III, IN-I/II/III/IV, CS-I/II, PFH-II/III, CH-III, CD-II.
 */
const MESSY: Record<string, Record<number, string>> = {
  // ── Pensamiento Matemático ──────────────────────────────────────────────
  "PM-I": { 1: "PM-I-P03", 2: "PM-I-P08", 3: "PM-I-P02", 4: "PM-I-P04", 5: "PM-I-P09", 6: "PM-I-P06", 7: "PM-I-P10" },
  "PM-II": { 1: "PM-II-P01", 2: "PM-II-P02", 3: "PM-II-P07", 4: "PM-II-P08", 5: "PM-II-P03", 6: "PM-II-P09" },
  // PM-III: O1/O2/O3 (ecuaciones lineales) viven en complementos de PM-II => HUECOS.
  "PM-III": { 4: "PM-III-P02", 5: "PM-III-P06", 6: "PM-III-P05" },
  // PM-IV: O7 (estimaciones/consolidación) => HUECO. P05 (Senos/Cosenos) => complemento.
  "PM-IV": { 1: "PM-IV-P06", 2: "PM-IV-P03", 3: "PM-IV-P02", 4: "PM-IV-P01", 5: "PM-IV-P07", 6: "PM-IV-P04" },
  // PM-V (Cálculo dif.): O3 (funciones var. real) y O8 (TFC/integral) => HUECOS.
  "PM-V": { 1: "PM-V-P01", 2: "PM-V-P03", 4: "PM-V-P02", 5: "PM-V-P05", 6: "PM-V-P04", 7: "PM-V-P07" },
  // PM-VI (Estadística): muy divergente. O3 (conjuntos), O4 (conteo), O6 (2+ var.),
  //   O8 (distribución normal) => HUECOS.
  "PM-VI": { 1: "PM-VI-P01", 2: "PM-VI-P05", 5: "PM-VI-P02", 7: "PM-VI-P07" },

  // ── Inglés ──────────────────────────────────────────────────────────────
  // IN-V: el O8 oficial es un DUPLICADO verbatim del O1 (artefacto de paginación
  //   del PDF). La progresión IN-V-P08 (proyecto final integrador) es contenido
  //   real y se PRESERVA (ver KEEP + DUP_IDX). Solo mapeamos O1–O7.
  "IN-V": { 1: "IN-V-P01", 2: "IN-V-P02", 3: "IN-V-P03", 4: "IN-V-P04", 5: "IN-V-P05", 6: "IN-V-P06", 7: "IN-V-P07" },

  // ── Cultura Digital ─────────────────────────────────────────────────────
  "CD-I": { 1: "CD-I-P01", 2: "CD-I-P02", 3: "CD-I-P03", 4: "CD-I-P09", 5: "CD-I-P06", 6: "CD-I-P10", 7: "CD-I-P04", 8: "CD-I-P11" },
  // CD-III: O4 (desigualdades de género en vocaciones) ancla en P03 (vocaciones),
  //   no en P04. O3 (crear/editar contenido) → P04 (proyecto comunitario mediado).
  "CD-III": { 1: "CD-III-P01", 2: "CD-III-P02", 3: "CD-III-P04", 4: "CD-III-P03" },

  // ── Ciencias Sociales ───────────────────────────────────────────────────
  // CS-III: O1 (políticas públicas) ancla en P02; O2 (actores/dinámicas) en P01.
  "CS-III": { 1: "CS-III-P02", 2: "CS-III-P01", 3: "CS-III-P03" },

  // ── Conciencia Histórica ────────────────────────────────────────────────
  // CH-I: propósitos abstractos vs progresiones concretas (mejor ajuste semántico).
  "CH-I": { 1: "CH-I-P02", 2: "CH-I-P03", 3: "CH-I-P01", 4: "CH-I-P04" },
  // CH-II: O1 (hipótesis) → P02 (hipótesis); O2 (procesos) → P04; O4 (ético) → P01.
  "CH-II": { 1: "CH-II-P02", 2: "CH-II-P04", 3: "CH-II-P03", 4: "CH-II-P01" },

  // ── Pensamiento Filosófico y Humanidades ────────────────────────────────
  "PFH-I": { 1: "PFH-I-P01", 2: "PFH-I-P02", 3: "PFH-I-P03", 4: "PFH-I-P06", 5: "PFH-I-P04" },

  // ── Ciencias Naturales, Experimentales y Tecnología ─────────────────────
  "CNEYT-I": { 1: "CNEYT-I-P01", 2: "CNEYT-I-P09", 3: "CNEYT-I-P02", 4: "CNEYT-I-P04", 5: "CNEYT-I-P03", 6: "CNEYT-I-P10", 7: "CNEYT-I-P05", 8: "CNEYT-I-P11" },
  // CNEYT-II: O4 (propagación de calor) vive dentro de P04 (transferencia) => HUECO.
  //   P01 (definición/unidades) => complemento.
  "CNEYT-II": { 1: "CNEYT-II-P02", 2: "CNEYT-II-P05", 3: "CNEYT-II-P04", 5: "CNEYT-II-P03", 6: "CNEYT-II-P09", 7: "CNEYT-II-P10", 8: "CNEYT-II-P08" },
  // CNEYT-III: O2 (hidrósfera/atmósfera), O4 (reacción química), O5 (oxígeno/atm.
  //   primitiva) => HUECOS. P01(biomas), P04(ciclos biogeoq.), P07(políticas) => compl.
  "CNEYT-III": { 1: "CNEYT-III-P05", 3: "CNEYT-III-P02", 6: "CNEYT-III-P03", 7: "CNEYT-III-P06", 8: "CNEYT-III-P08" },
  // CNEYT-IV: O3 (equilibrio), O5 (redox/combustión), O8 (respiración) => HUECOS.
  //   P06(industria), P07(contaminantes), P08(experimentos) => complemento.
  "CNEYT-IV": { 1: "CNEYT-IV-P02", 2: "CNEYT-IV-P01", 4: "CNEYT-IV-P03", 6: "CNEYT-IV-P04", 7: "CNEYT-IV-P05" },
  // CNEYT-V (Física, labs P1–P7): mapa que mantiene CADA lab bajo un propósito
  //   oficial. O1(cinemática/MRUA)→P02(lab mrua); O2(Newton/acción-reacción)→
  //   P01(lab dcl); O3→P03(grav.); O4→P04(ondas); O5(luz/óptica)→P06(lab óptica);
  //   O7(electromag.)→P07(lab electromag.); O8(física moderna/contemp. divulgativa)
  //   →P05(lab espectro EM: c=λf, E=hf). O6(fluidos)=HUECO. P08(ética, sin lab)=compl.
  "CNEYT-V": { 1: "CNEYT-V-P02", 2: "CNEYT-V-P01", 3: "CNEYT-V-P03", 4: "CNEYT-V-P04", 5: "CNEYT-V-P06", 7: "CNEYT-V-P07", 8: "CNEYT-V-P05" },
  // CNEYT-VI (Biología, labs P1–P8): O1→P01(origen vida); O3(organelos)→P02;
  //   O4(ADN)→P04; O6(herencia)→P05(Mendel); O7(evolución)→P07; O8(biotec.)→P08(CRISPR).
  //   O2(teoría celular/historia) y O5(mitosis/meiosis)=HUECOS. P03(metabolismo) y
  //   P06(mutaciones) labs construidos => complemento (enriquecimiento).
  "CNEYT-VI": { 1: "CNEYT-VI-P01", 3: "CNEYT-VI-P02", 4: "CNEYT-VI-P04", 6: "CNEYT-VI-P05", 7: "CNEYT-VI-P07", 8: "CNEYT-VI-P08" },
};

/**
 * Progresiones LEGÍTIMAS (contenido real con actividades) que no corresponden a
 * un propósito oficial pero NO deben marcarse "complemento" ni sobrescribirse.
 * Caso IN-V-P08: proyecto final integrador real; su "propósito oficial #8" es un
 * duplicado del #1 por artefacto de paginación del PDF, así que se conserva tal cual.
 */
const KEEP: Record<string, string[]> = {
  "IN-V": ["IN-V-P08"],
};

/**
 * Índices de propósito oficial que son DUPLICADOS/artefactos del PDF: NO se
 * mapean y NO se reportan como huecos reales (se anotan como artefacto).
 */
const DUP_IDX: Record<string, number[]> = {
  "IN-V": [8],
};

interface Prog {
  id: string;
  codigo: string;
  numero: number;
  titulo: string;
  categoria: string | null;
}

interface UacUpd {
  nombre: { from: string; to: string };
  descripcion: { from: string | null; to: string };
}
interface TituloUpd {
  codigo: string;
  numero: number;
  from: string;
  to: string;
}
interface CatUpd {
  codigo: string;
  numero: number;
  from: string | null;
}

async function main() {
  const sb = createSB();
  let nUacText = 0;
  let nTitulo = 0;
  let nCat = 0;
  const huecos: string[] = [];
  const complementos: string[] = [];
  const artefactos: string[] = [];

  for (const c of CONTENIDO_2025) {
    const { data: uacRow, error: uacErr } = await sb
      .from("uac")
      .select("id,codigo,nombre,descripcion")
      .eq("codigo", c.codigo)
      .single();
    if (uacErr || !uacRow) {
      console.log(`!! UAC no encontrada en DB: ${c.codigo} (${uacErr?.message ?? "null"})`);
      continue;
    }

    const { data: progsRaw } = await sb
      .from("progresiones")
      .select("id,codigo,numero,titulo,categoria")
      .eq("uac_id", uacRow.id)
      .order("numero");
    const progs = (progsRaw ?? []) as Prog[];
    const byNumero = new Map(progs.map((p) => [p.numero, p]));
    const byCodigo = new Map(progs.map((p) => [p.codigo, p]));

    // ---- plan: uac text ----
    const uacUpd: UacUpd | null =
      uacRow.nombre !== c.asignaturaOficial || uacRow.descripcion !== c.temaOficial
        ? {
            nombre: { from: uacRow.nombre, to: c.asignaturaOficial },
            descripcion: { from: uacRow.descripcion, to: c.temaOficial },
          }
        : null;

    // ---- plan: mapa índice oficial -> progresión ----
    const map = MESSY[c.codigo];
    const dupIdx = new Set(DUP_IDX[c.codigo] ?? []);
    const keep = new Set(KEEP[c.codigo] ?? []);
    const mappedCodigos = new Set<string>();
    const tituloUpds: TituloUpd[] = [];
    c.propositos.forEach((prop, i) => {
      const idx = i + 1;
      // propósito oficial que es duplicado/artefacto del PDF: ni mapa ni hueco.
      if (dupIdx.has(idx)) {
        artefactos.push(`${c.codigo} · propósito oficial #${idx} es DUPLICADO/artefacto del PDF (se ignora): ${prop.slice(0, 70)}…`);
        return;
      }
      let target: Prog | undefined;
      if (map) {
        const code = map[idx];
        if (!code) {
          huecos.push(`${c.codigo} · propósito oficial #${idx} sin progresión (HUECO): ${prop.slice(0, 70)}…`);
          return;
        }
        target = byCodigo.get(code);
        if (!target) {
          console.log(`!! ${c.codigo}: código mapeado inexistente ${code}`);
          return;
        }
      } else {
        target = byNumero.get(idx);
        if (!target) {
          huecos.push(`${c.codigo} · propósito oficial #${idx} sin progresión numero=${idx} (HUECO): ${prop.slice(0, 70)}…`);
          return;
        }
      }
      mappedCodigos.add(target.codigo);
      if (target.titulo !== prop) {
        tituloUpds.push({ codigo: target.codigo, numero: target.numero, from: target.titulo, to: prop });
      }
    });

    // ---- plan: extras -> complemento (excluye progresiones "KEEP" legítimas) ----
    const catUpds: CatUpd[] = progs
      .filter((p) => !mappedCodigos.has(p.codigo) && !keep.has(p.codigo) && p.categoria !== COMPLEMENTO)
      .map((p) => ({ codigo: p.codigo, numero: p.numero, from: p.categoria }));
    for (const k of catUpds) complementos.push(`${c.codigo} · ${k.codigo} (n=${k.numero}): ${byCodigo.get(k.codigo)?.titulo.slice(0, 70) ?? ""}`);

    // ---- print ----
    const tag = map ? " (mapa semántico)" : "";
    console.log(`\n=== ${c.codigo}${tag} — ${progs.length} prog / ${c.propositos.length} propósitos ===`);
    if (uacUpd) {
      console.log(`  uac.nombre:      "${uacUpd.nombre.from}" → "${uacUpd.nombre.to}"`);
      console.log(`  uac.descripcion: "${uacUpd.descripcion.from ?? ""}" → "${uacUpd.descripcion.to}"`);
    } else {
      console.log(`  uac: (sin cambios)`);
    }
    for (const t of tituloUpds) console.log(`  titulo n=${t.numero} ${t.codigo}: "${t.from.slice(0, 50)}" → "${t.to.slice(0, 60)}…"`);
    for (const k of catUpds) console.log(`  EXTRA→complemento n=${k.numero} ${k.codigo} (era "${k.from ?? ""}")`);
    if (!tituloUpds.length && !catUpds.length && !uacUpd) console.log(`  (ya alineada)`);

    // ---- apply ----
    if (APPLY) {
      if (uacUpd) {
        const { error } = await sb.from("uac").update({ nombre: uacUpd.nombre.to, descripcion: uacUpd.descripcion.to }).eq("id", uacRow.id);
        if (error) console.log(`  !! error uac ${c.codigo}: ${error.message}`);
        else nUacText++;
      }
      for (const t of tituloUpds) {
        const p = byCodigo.get(t.codigo)!;
        const { error } = await sb.from("progresiones").update({ titulo: t.to }).eq("id", p.id);
        if (error) console.log(`  !! error titulo ${t.codigo}: ${error.message}`);
        else nTitulo++;
      }
      for (const k of catUpds) {
        const p = byCodigo.get(k.codigo)!;
        const { error } = await sb.from("progresiones").update({ categoria: COMPLEMENTO }).eq("id", p.id);
        if (error) console.log(`  !! error categoria ${k.codigo}: ${error.message}`);
        else nCat++;
      }
    } else {
      if (uacUpd) nUacText++;
      nTitulo += tituloUpds.length;
      nCat += catUpds.length;
    }
  }

  console.log(`\n${"─".repeat(60)}`);
  console.log(`${APPLY ? "APLICADO" : "DRY-RUN (sin escribir)"}:`);
  console.log(`  UAC con texto a actualizar: ${nUacText}`);
  console.log(`  títulos de progresión:      ${nTitulo}`);
  console.log(`  extras→complemento:         ${nCat}`);
  console.log(`\n  HUECOS (propósitos oficiales sin contenido construido): ${huecos.length}`);
  for (const h of huecos) console.log(`    · ${h}`);
  console.log(`\n  COMPLEMENTOS (contenido construido fuera de los 8 oficiales): ${complementos.length}`);
  for (const x of complementos) console.log(`    · ${x}`);
  console.log(`\n  ARTEFACTOS del PDF (propósitos duplicados ignorados): ${artefactos.length}`);
  for (const a of artefactos) console.log(`    · ${a}`);
  if (!APPLY) console.log(`\n→ Revisa el plan. Para aplicar: npx tsx scripts/align-2025.ts --apply`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

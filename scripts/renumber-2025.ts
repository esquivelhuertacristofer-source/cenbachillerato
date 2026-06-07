/**
 * Renumeración al Modelo MCCEMS 2025 (decisión del usuario: "Renumerar a 8 + extras al final").
 *
 * Para las UAC con mapeo semántico (MESSY de align-2025), el `numero` de la DB quedó
 * desacoplado del número de propósito oficial (p.ej. el propósito oficial #3 vivía en
 * numero=4). Este script reasigna `progresiones.numero` para que:
 *   - cada propósito oficial ocupe numero = su índice oficial (1..N, en orden);
 *   - los complementos / contenido extra pasen a numero = N+1, N+2, … (al final).
 *
 * Garantías:
 *   - NO toca actividades ni practica_slug → los 77 labs NO se orfanan (su URL de
 *     progresión cambia, pero la app regenera los enlaces desde `numero`).
 *   - NO toca titulo/categoria/descripcion (eso ya lo hizo align-2025).
 *   - Idempotente: re-ejecutar deja el mismo estado.
 *
 * Restricción UNIQUE(uac_id, numero) → update en dos fases (offset temporal 1000+).
 *
 * Uso:
 *   npx tsx scripts/renumber-2025.ts            (DRY-RUN)
 *   npx tsx scripts/renumber-2025.ts --apply
 *
 * El archivo se CONSERVA (re-ejecutable), igual que align-2025.ts.
 */
import { config } from "dotenv";
import { resolve } from "path";
import { createSB } from "./lib/activity-utils";
import { CONTENIDO_2025 } from "../src/lib/mccems/contenido-2025";

config({ path: resolve(process.cwd(), ".env.local") });

const APPLY = process.argv.includes("--apply");

/** Mismo mapa semántico que align-2025 (índice oficial 1-based → código de progresión). */
const MESSY: Record<string, Record<number, string>> = {
  "PM-I": { 1: "PM-I-P03", 2: "PM-I-P08", 3: "PM-I-P02", 4: "PM-I-P04", 5: "PM-I-P09", 6: "PM-I-P06", 7: "PM-I-P10" },
  "PM-II": { 1: "PM-II-P01", 2: "PM-II-P02", 3: "PM-II-P07", 4: "PM-II-P08", 5: "PM-II-P03", 6: "PM-II-P09" },
  "PM-III": { 4: "PM-III-P02", 5: "PM-III-P06", 6: "PM-III-P05" },
  "PM-IV": { 1: "PM-IV-P06", 2: "PM-IV-P03", 3: "PM-IV-P02", 4: "PM-IV-P01", 5: "PM-IV-P07", 6: "PM-IV-P04" },
  "PM-V": { 1: "PM-V-P01", 2: "PM-V-P03", 4: "PM-V-P02", 5: "PM-V-P05", 6: "PM-V-P04", 7: "PM-V-P07" },
  "PM-VI": { 1: "PM-VI-P01", 2: "PM-VI-P05", 5: "PM-VI-P02", 7: "PM-VI-P07" },
  "IN-V": { 1: "IN-V-P01", 2: "IN-V-P02", 3: "IN-V-P03", 4: "IN-V-P04", 5: "IN-V-P05", 6: "IN-V-P06", 7: "IN-V-P07" },
  "CD-I": { 1: "CD-I-P01", 2: "CD-I-P02", 3: "CD-I-P03", 4: "CD-I-P09", 5: "CD-I-P06", 6: "CD-I-P10", 7: "CD-I-P04", 8: "CD-I-P11" },
  "CD-III": { 1: "CD-III-P01", 2: "CD-III-P02", 3: "CD-III-P04", 4: "CD-III-P03" },
  "CS-III": { 1: "CS-III-P02", 2: "CS-III-P01", 3: "CS-III-P03" },
  "CH-I": { 1: "CH-I-P02", 2: "CH-I-P03", 3: "CH-I-P01", 4: "CH-I-P04" },
  "CH-II": { 1: "CH-II-P02", 2: "CH-II-P04", 3: "CH-II-P03", 4: "CH-II-P01" },
  "PFH-I": { 1: "PFH-I-P01", 2: "PFH-I-P02", 3: "PFH-I-P03", 4: "PFH-I-P06", 5: "PFH-I-P04" },
  "CNEYT-I": { 1: "CNEYT-I-P01", 2: "CNEYT-I-P09", 3: "CNEYT-I-P02", 4: "CNEYT-I-P04", 5: "CNEYT-I-P03", 6: "CNEYT-I-P10", 7: "CNEYT-I-P05", 8: "CNEYT-I-P11" },
  "CNEYT-II": { 1: "CNEYT-II-P02", 2: "CNEYT-II-P05", 3: "CNEYT-II-P04", 5: "CNEYT-II-P03", 6: "CNEYT-II-P09", 7: "CNEYT-II-P10", 8: "CNEYT-II-P08" },
  "CNEYT-III": { 1: "CNEYT-III-P05", 3: "CNEYT-III-P02", 6: "CNEYT-III-P03", 7: "CNEYT-III-P06", 8: "CNEYT-III-P08" },
  "CNEYT-IV": { 1: "CNEYT-IV-P02", 2: "CNEYT-IV-P01", 4: "CNEYT-IV-P03", 6: "CNEYT-IV-P04", 7: "CNEYT-IV-P05" },
  "CNEYT-V": { 1: "CNEYT-V-P02", 2: "CNEYT-V-P01", 3: "CNEYT-V-P03", 4: "CNEYT-V-P04", 5: "CNEYT-V-P06", 7: "CNEYT-V-P07", 8: "CNEYT-V-P05" },
  "CNEYT-VI": { 1: "CNEYT-VI-P01", 3: "CNEYT-VI-P02", 4: "CNEYT-VI-P04", 6: "CNEYT-VI-P05", 7: "CNEYT-VI-P07", 8: "CNEYT-VI-P08" },
};

interface Prog { id: string; codigo: string; numero: number; titulo: string; categoria: string | null; }

const propositosCount = new Map(CONTENIDO_2025.map((c) => [c.codigo, c.propositos.length]));

async function main() {
  const sb = createSB();
  let totalChanged = 0;

  for (const codigo of Object.keys(MESSY)) {
    const map = MESSY[codigo]!;
    const nOficial = propositosCount.get(codigo) ?? Math.max(...Object.keys(map).map(Number));

    const { data: uacRow } = await sb.from("uac").select("id").eq("codigo", codigo).single();
    if (!uacRow) { console.log(`!! UAC no encontrada: ${codigo}`); continue; }

    const { data: progsRaw } = await sb
      .from("progresiones")
      .select("id,codigo,numero,titulo,categoria")
      .eq("uac_id", uacRow.id)
      .order("numero");
    const progs = (progsRaw ?? []) as Prog[];

    // código → índice oficial (inverso del mapa)
    const codigoToIdx = new Map<string, number>();
    for (const [idxStr, code] of Object.entries(map)) codigoToIdx.set(code, Number(idxStr));

    // desired numero: mapeados = idx oficial; resto (complemento/keep) = nOficial+1,+2,…
    const mapped = progs.filter((p) => codigoToIdx.has(p.codigo));
    const extra = progs.filter((p) => !codigoToIdx.has(p.codigo)).sort((a, b) => a.numero - b.numero);

    const desired = new Map<string, number>();
    for (const p of mapped) desired.set(p.id, codigoToIdx.get(p.codigo)!);
    extra.forEach((p, i) => desired.set(p.id, nOficial + 1 + i));

    // ¿ya alineado?
    const cambios = progs.filter((p) => p.numero !== desired.get(p.id));
    console.log(`\n=== ${codigo} (${progs.length} prog, ${nOficial} oficiales) ===`);
    if (cambios.length === 0) { console.log("  (ya renumerado)"); continue; }

    const ordered = [...progs].sort((a, b) => desired.get(a.id)! - desired.get(b.id)!);
    for (const p of ordered) {
      const to = desired.get(p.id)!;
      const tag = codigoToIdx.has(p.codigo) ? "oficial" : (p.categoria ?? "extra");
      const arrow = p.numero === to ? "=" : `${p.numero}→`;
      console.log(`  numero ${arrow}${to}  ${p.codigo}  [${tag}]  ${p.titulo.slice(0, 42)}`);
    }

    if (APPLY) {
      // Fase 1: offset temporal para evitar choque con UNIQUE(uac_id, numero)
      for (let i = 0; i < progs.length; i++) {
        const { error } = await sb.from("progresiones").update({ numero: 1000 + i }).eq("id", progs[i]!.id);
        if (error) { console.log(`  !! fase1 ${progs[i]!.codigo}: ${error.message}`); }
      }
      // Fase 2: número definitivo
      for (const p of progs) {
        const { error } = await sb.from("progresiones").update({ numero: desired.get(p.id)! }).eq("id", p.id);
        if (error) console.log(`  !! fase2 ${p.codigo}: ${error.message}`);
      }
      totalChanged += cambios.length;
    } else {
      totalChanged += cambios.length;
    }
  }

  console.log(`\n${"─".repeat(56)}`);
  console.log(`${APPLY ? "APLICADO" : "DRY-RUN"}: ${totalChanged} progresiones con numero a cambiar.`);
  if (!APPLY) console.log("→ Para aplicar: npx tsx scripts/renumber-2025.ts --apply");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });

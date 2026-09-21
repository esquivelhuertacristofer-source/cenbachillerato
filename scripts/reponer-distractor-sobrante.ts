/**
 * DEVUELVE EL DISTRACTOR A LAS COLUMNAS QUE SE QUEDARON SIN NINGUNO.
 *
 * En una actividad de relacionar columnas sin distractores, la última pareja se
 * acierta por eliminación: el alumno no tiene que saberla. Medido el 2026-09-20:
 * 61 de 172 actividades estaban así.
 *
 * Este script NO inventa definiciones. Solo aprovecha las que ya existen y
 * nadie usa: cuando el glosario de la MISMA progresión tiene un término que no
 * aparece entre las parejas, su definición entra como distractor. Es plausible
 * —el alumno la reconoce— y es falsa como pareja, que es justo lo que un
 * distractor debe ser. `RelacionarColumnasActivity` ya avisa en pantalla de que
 * «hay opciones de la derecha que no emparejan con nada».
 *
 * Las actividades cuyo glosario no da sobrantes se quedan como están y se
 * listan al final: ahí haría falta escribir contenido nuevo, y eso no es
 * trabajo de un script.
 *
 * Uso:
 *   npx tsx scripts/reponer-distractor-sobrante.ts            (simula)
 *   npx tsx scripts/reponer-distractor-sobrante.ts --aplicar
 */
import { config } from "dotenv";
import { resolve } from "path";
import { createSB } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

interface Fila { codigo: string; contenido: Record<string, unknown> | null }

const norm = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

async function main() {
  const aplicar = process.argv.includes("--aplicar");
  const sb = createSB();

  const filas: Fila[] = [];
  for (let desde = 0; ; desde += 1000) {
    const { data, error } = await sb.from("actividades").select("codigo, contenido").order("codigo").range(desde, desde + 999);
    if (error) { console.error(error.message); process.exit(1); }
    if (!data || data.length === 0) break;
    filas.push(...(data as Fila[]));
    if (data.length < 1000) break;
  }

  /** Glosario por progresión: término → definición. */
  const glosario = new Map<string, { termino: string; definicion: string }[]>();
  for (const f of filas) {
    const c = f.contenido as { terminos?: { termino?: unknown; definicion?: unknown }[] } | null;
    if (!Array.isArray(c?.terminos)) continue;
    const prog = f.codigo.replace(/-A\d+$/, "");
    const xs = c.terminos
      .filter((t) => typeof t.termino === "string" && typeof t.definicion === "string")
      .map((t) => ({ termino: t.termino as string, definicion: t.definicion as string }));
    glosario.set(prog, [...(glosario.get(prog) ?? []), ...xs]);
  }

  const arreglables: { codigo: string; contenido: unknown; termino: string }[] = [];
  const sinMaterial: string[] = [];

  for (const f of filas) {
    const c = f.contenido as { parejas?: { derecha?: unknown }[]; distractores?: unknown } | null;
    if (!Array.isArray(c?.parejas)) continue;
    if (Array.isArray(c.distractores) && c.distractores.length > 0) continue;

    const prog = f.codigo.replace(/-A\d+$/, "");
    const usadas = new Set(c.parejas.map((p) => norm(String(p.derecha ?? ""))));
    const sobrante = (glosario.get(prog) ?? []).find((g) => !usadas.has(norm(g.definicion)));
    if (!sobrante) { sinMaterial.push(f.codigo); continue; }

    arreglables.push({
      codigo: f.codigo,
      termino: sobrante.termino,
      contenido: { ...f.contenido, distractores: [sobrante.definicion] },
    });
  }

  console.log(`actividades sin distractor: ${arreglables.length + sinMaterial.length}`);
  console.log(`  con una definición del glosario sin usar: ${arreglables.length}`);
  for (const a of arreglables) console.log(`    ${a.codigo} ← «${a.termino}»`);
  console.log(`  sin sobrantes (harían falta definiciones nuevas, escritas a mano): ${sinMaterial.length}`);

  if (!aplicar) { console.log("\nSIMULACIÓN. Nada se escribió. Añade --aplicar."); return; }

  let ok = 0;
  for (const a of arreglables) {
    const { error } = await sb.from("actividades").update({ contenido: a.contenido }).eq("codigo", a.codigo);
    if (error) { console.error(`  ✗ ${a.codigo}: ${error.message}`); continue; }
    ok++;
  }
  console.log(`\nescritas ${ok}/${arreglables.length}.`);
}

void main();

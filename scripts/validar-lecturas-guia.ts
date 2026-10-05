/**
 * Valida las guías de lectura (public/lecturas-guia/*.json) contra el texto
 * REAL de la BD: forma correcta y que cubran todos los párrafos en orden.
 * Una guía que no cuadra no rompe nada (la lectura se ve como antes), pero
 * no se vería: por eso se revisa aquí y no en el navegador.
 *
 *   npx tsx scripts/validar-lecturas-guia.ts            → todas
 *   npx tsx scripts/validar-lecturas-guia.ts PM-I-P04-A1 CS-II-P04-A1
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { erroresGuia, parrafosDe, type LecturaGuia } from "../src/lib/contenido/lectura-guia";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")]),
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const DIR = join("public", "lecturas-guia");

async function main() {
  const { data, error } = await sb.from("actividades").select("codigo,contenido").eq("tipo", "lectura");
  if (error) throw error;
  const textos = new Map(data.map((f) => [f.codigo as string, (f.contenido as { texto?: string })?.texto ?? ""]));
  const pedidos = process.argv.slice(2);
  const codigos = pedidos.length ? pedidos : readdirSync(DIR).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5));
  let malas = 0;
  for (const c of codigos) {
    const ruta = join(DIR, `${c}.json`);
    if (!existsSync(ruta)) { console.log(`✗ ${c}: no existe la guía`); malas++; continue; }
    if (!textos.has(c)) { console.log(`✗ ${c}: no hay lectura con ese código en BD`); malas++; continue; }
    let g: LecturaGuia;
    try { g = JSON.parse(readFileSync(ruta, "utf8")); } catch (e) { console.log(`✗ ${c}: JSON inválido — ${(e as Error).message}`); malas++; continue; }
    const errs = erroresGuia(g, parrafosDe(textos.get(c)!).length);
    if (g.codigo !== c) errs.push(`codigo interno ${g.codigo} ≠ archivo`);
    if (errs.length) { console.log(`✗ ${c}: ${errs.join(" · ")}`); malas++; }
  }
  const sin = [...textos.keys()].filter((c) => !existsSync(join(DIR, `${c}.json`)));
  console.log(`\n${codigos.length - malas}/${codigos.length} válidas · lecturas sin guía: ${sin.length}/${textos.size}`);
  if (malas) process.exit(1);
}
main();

// Vuelca los términos de las fichas para escribir a mano sus escenas.
// Uso: node scripts/dump-terminos.mjs [desde] [cuantos] [--lista]
import { readFileSync, existsSync, readdirSync } from "fs";
const mapa = JSON.parse(readFileSync("data/mapa-fichas.json", "utf8"));
const hechos = new Set();
for (const f of readdirSync("data/escenas-terminos").filter((f) => f.endsWith(".json"))) {
  const d = JSON.parse(readFileSync(`data/escenas-terminos/${f}`, "utf8"));
  for (const ficha of Array.isArray(d) ? d : [d]) hechos.add(ficha.slug);
}
const slugs = Object.keys(mapa).filter((s) => (mapa[s].terminos?.length ?? 0) > 0 && !hechos.has(s)).sort();
if (process.argv.includes("--lista")) {
  console.log(`${hechos.size} listos, ${slugs.length} pendientes, ${slugs.reduce((n, s) => n + mapa[s].terminos.length, 0)} viñetas por escribir`);
  process.exit(0);
}
const desde = Number(process.argv[2] ?? 0);
const cuantos = Number(process.argv[3] ?? 10);
for (const s of slugs.slice(desde, desde + cuantos)) {
  console.log(`\n### ${s}`);
  for (const t of mapa[s].terminos) console.log(`${t.clave} | ${t.texto} | ${(t.definicion ?? "").slice(0, 150)}`);
}

/**
 * Engancha en la BD los laboratorios que estan en el registry y no tienen actividad.
 *
 * Deduce el destino del codigo de actividad declarado DENTRO del archivo del lab.
 * Solo propone los que declaran UN unico destino, que existe y esta libre.
 *
 *   npx tsx scripts/enganchar-labs-pendientes.ts             ensayo, no escribe
 *   npx tsx scripts/enganchar-labs-pendientes.ts --aplicar    escribe
 */
import { config } from "dotenv";
import { resolve } from "path";
import { readFileSync, existsSync } from "fs";
import { createClient } from "@supabase/supabase-js";
config({ path: resolve(process.cwd(), ".env.local") });

const RAIZ = process.cwd();
const reg = readFileSync(resolve(RAIZ, "src/components/practicas/registry.tsx"), "utf8");

// import: const LabX = dynamic(() => import("./labs/Archivo") ...
const compAArchivo = new Map<string, string>();
for (const m of reg.matchAll(/const\s+(\w+)\s*=\s*dynamic\(\s*\(\)\s*=>\s*import\(\s*["']\.\/labs\/([\w./-]+)["']/g)) {
  compAArchivo.set(m[1]!, m[2]!);
}
// entrada: "slug": { ...META["slug"]!, Component: LabX }
const slugAComp = new Map<string, string>();
for (const m of reg.matchAll(/^\s+"?([a-z0-9_-]+)"?:\s*\{[^}]*Component:\s*(\w+)/gm)) {
  slugAComp.set(m[1]!, m[2]!);
}

async function main() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const acts: { codigo: string; titulo: string; practica_slug: string | null; estado: string }[] = [];
  for (let desde = 0; ; desde += 1000) {
    const { data, error } = await sb
      .from("actividades")
      .select("codigo, titulo, practica_slug, estado")
      .order("codigo")
      .range(desde, desde + 999);
    if (error) { console.error(error.message); process.exit(1); }
    acts.push(...((data ?? []) as typeof acts));
    if (!data || data.length < 1000) break;
  }
  console.log("actividades leidas:", acts.length);
  const porCodigo = new Map(acts.map((a) => [a.codigo as string, a]));
  const yaAsociados = new Set(acts.filter((a) => a.practica_slug).map((a) => a.practica_slug as string));

  const sinAsociar = [...slugAComp.keys()].filter((s) => !yaAsociados.has(s)).sort();
  const ambiguos: string[] = [];
  const paraAplicar: [string, string][] = [];
  const listos: string[] = [], ocupados: string[] = [], inexistentes: string[] = [], sinPista: string[] = [];

  for (const slug of sinAsociar) {
    const comp = slugAComp.get(slug)!;
    const arch = compAArchivo.get(comp);
    const ruta = arch ? resolve(RAIZ, "src/components/practicas/labs", arch + ".tsx") : null;
    if (!ruta || !existsSync(ruta)) { sinPista.push(`${slug} (sin archivo: ${arch})`); continue; }
    const txt = readFileSync(ruta, "utf8");
    const codigos = [...new Set([...txt.matchAll(/\b([A-Z]{2,6}-[IVX]+-P\d{2}-A\d)\b/g)].map((m) => m[1]!))];
    if (!codigos.length) { sinPista.push(slug); continue; }
    if (codigos.length > 1) { ambiguos.push(`${slug} -> ${codigos.join(", ")}`); continue; }
    const cod = codigos[0]!;
    const act = porCodigo.get(cod);
    if (!act) { inexistentes.push(`${slug} -> ${cod} (no existe en BD)`); continue; }
    if (act.practica_slug) { ocupados.push(`${slug} -> ${cod} (ya tiene ${act.practica_slug})`); continue; }
    listos.push(`${slug}\t${cod}\t${(act.titulo as string).slice(0, 55)}`);
  }

  console.log(`sin asociar: ${sinAsociar.length}`);
  console.log(`LISTOS para enganchar: ${listos.length}`);
  console.log(`destino ya ocupado: ${ocupados.length}`);
  console.log(`codigo inexistente en BD: ${inexistentes.length}`);
  console.log(`sin pista en el archivo: ${sinPista.length}`);
  console.log(`AMBIGUOS (varios destinos): ${ambiguos.length}`);
  if (listos.length) console.log("\n--- LISTOS ---\n" + listos.join("\n"));
  if (ocupados.length) console.log("\n--- OCUPADOS ---\n" + ocupados.join("\n"));
  if (inexistentes.length) console.log("\n--- INEXISTENTES ---\n" + inexistentes.join("\n"));
  if (sinPista.length) console.log("\n--- SIN PISTA ---\n" + sinPista.join("\n"));
}
async function aplicar(sb: ReturnType<typeof createClient>, pares: [string, string][]) {
  let ok = 0;
  for (const [cod, slug] of pares) {
    const { error } = await sb.from("actividades").update({ practica_slug: slug }).eq("codigo", cod);
    if (error) console.error(`FALLO ${cod} -> ${slug}: ${error.message}`);
    else { ok++; console.log(`ok ${cod} -> ${slug}`); }
  }
  console.log(`
enganchados: ${ok}/${pares.length}`);
}
main();

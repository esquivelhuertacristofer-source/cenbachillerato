/**
 * MAPA laboratorio → ficha teórica → términos ilustrables.
 *
 * El registro (`registry.tsx`) dice qué componente monta cada slug; cada
 * componente importa su ficha (`*-ficha.ts`), y la ficha trae los conceptos y
 * el glosario. Los nombres de archivo NO coinciden con los slugs (hay 65 que
 * difieren), así que el mapa se deriva leyendo los imports en vez de adivinar.
 *
 * Escribe `data/mapa-fichas.json`:
 *   { "densidad": { "componente": "LabDensidad", "ficha": "densidad-ficha",
 *                   "export": "DENSIDAD_FICHA",
 *                   "terminos": [{ "clave": "masa", "texto": "Masa" }, ...] } }
 *
 * Uso: npx tsx scripts/mapa-fichas-labs.ts
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

const RAIZ = resolve(process.cwd());
const LABS = resolve(RAIZ, "src", "components", "practicas", "labs");

/** Igual que `claveDeTermino` en src/lib/practicas/terminos-imagen.ts. */
export function claveDeTermino(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

interface Entrada {
  componente: string;
  ficha: string | null;
  export: string | null;
  terminos: { clave: string; texto: string; definicion: string }[];
}

function terminosDeFicha(archivo: string): { clave: string; texto: string; definicion: string }[] {
  const ruta = resolve(LABS, `${archivo}.ts`);
  if (!existsSync(ruta)) return [];
  const src = readFileSync(ruta, "utf8");
  const vistos = new Set<string>();
  const salida: { clave: string; texto: string; definicion: string }[] = [];
  // `termino: "..."` seguido de `definicion: "..."` (el orden real de las fichas).
  const re = /termino:\s*"((?:[^"\\]|\\.)*)"\s*,\s*definicion:\s*"((?:[^"\\]|\\.)*)"/g;
  for (const m of src.matchAll(re)) {
    const texto = m[1]!.replace(/\\"/g, '"');
    const clave = claveDeTermino(texto);
    if (!clave || vistos.has(clave)) continue;
    vistos.add(clave);
    salida.push({ clave, texto, definicion: m[2]!.replace(/\\"/g, '"') });
  }
  return salida;
}

function main() {
  const registry = readFileSync(resolve(RAIZ, "src", "components", "practicas", "registry.tsx"), "utf8");

  // const LabX = dynamic(() => import("./labs/LabX").then((m) => m.LabX), ...)
  const comp = new Map<string, string>();
  for (const m of registry.matchAll(/const\s+(\w+)\s*=\s*dynamic\(\(\)\s*=>\s*import\("\.\/labs\/([\w-]+)"\)/g)) {
    comp.set(m[1]!, m[2]!);
  }

  // "slug": { ...PRACTICAS_META["slug"]!, Component: LabX },
  const slugs = new Map<string, string>();
  for (const m of registry.matchAll(/"?([a-z0-9-]+)"?:\s*\{[^}]*?Component:\s*(\w+)\s*\}/g)) {
    slugs.set(m[1]!, m[2]!);
  }

  const salida: Record<string, Entrada> = {};
  for (const [slug, nombreComp] of slugs) {
    const archivo = comp.get(nombreComp);
    let ficha: string | null = null;
    let exportado: string | null = null;
    let terminos: Entrada["terminos"] = [];
    if (archivo) {
      const ruta = resolve(LABS, `${archivo}.tsx`);
      if (existsSync(ruta)) {
        const src = readFileSync(ruta, "utf8");
        const imp = src.match(/import\s*\{\s*([A-Z0-9_]+)\s*\}\s*from\s*"\.\/([\w-]+-ficha)"/);
        if (imp) {
          exportado = imp[1]!;
          ficha = imp[2]!;
          terminos = terminosDeFicha(ficha);
        }
      }
    }
    salida[slug] = { componente: nombreComp, ficha, export: exportado, terminos };
  }

  writeFileSync(resolve(RAIZ, "data", "mapa-fichas.json"), JSON.stringify(salida, null, 1), "utf8");

  const conFicha = Object.values(salida).filter((e) => e.ficha).length;
  const todos = Object.values(salida).flatMap((e) => e.terminos.map((t) => t.clave));
  const unicos = new Set(todos);
  console.log(`labs: ${Object.keys(salida).length} · con ficha: ${conFicha} · sin ficha: ${Object.keys(salida).length - conFicha}`);
  console.log(`términos: ${todos.length} en total, ${unicos.size} distintos`);
  const sinFicha = Object.entries(salida).filter(([, e]) => !e.ficha).map(([s]) => s);
  if (sinFicha.length) console.log(`sin ficha: ${sinFicha.join(", ")}`);
}

main();

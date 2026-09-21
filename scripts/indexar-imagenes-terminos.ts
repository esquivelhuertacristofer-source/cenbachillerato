/**
 * ÍNDICE de las viñetas de términos que YA existen en disco.
 *
 * Escribe `src/lib/practicas/terminos-imagen.generated.ts`. Hay que correrlo
 * después de generar viñetas nuevas (`generar-imagenes-terminos.ts`): la app
 * solo pide las que están en este índice, así que una viñeta sin indexar es
 * una viñeta que nadie ve, y una indexada que no existe es un hueco roto.
 *
 * Uso: npx tsx scripts/indexar-imagenes-terminos.ts
 */
import { readdirSync, existsSync, writeFileSync } from "fs";
import { resolve, join } from "path";

const RAIZ = resolve(process.cwd());
const DIR = resolve(RAIZ, "public", "media", "labs-terminos");
const DESTINO = resolve(RAIZ, "src", "lib", "practicas", "terminos-imagen.generated.ts");

function main() {
  const indice: Record<string, string[]> = {};
  if (existsSync(DIR)) {
    for (const slug of readdirSync(DIR)) {
      const dir = join(DIR, slug);
      const claves = readdirSync(dir)
        .filter((f) => f.endsWith(".webp"))
        .map((f) => f.replace(/\.webp$/, ""))
        .sort();
      if (claves.length > 0) indice[slug] = claves;
    }
  }

  const slugs = Object.keys(indice).sort();
  const cuerpo = slugs.map((s) => `  "${s}": [${indice[s]!.map((c) => `"${c}"`).join(", ")}],`).join("\n");
  const total = slugs.reduce((n, s) => n + indice[s]!.length, 0);

  writeFileSync(
    DESTINO,
    `// GENERADO por scripts/indexar-imagenes-terminos.ts — no editar a mano.\n` +
      `// ${total} viñetas en ${slugs.length} laboratorios.\n\n` +
      `export const TERMINOS_CON_IMAGEN: Record<string, string[]> = {\n${cuerpo}\n};\n`,
    "utf8"
  );
  console.log(`${total} viñetas · ${slugs.length} laboratorios → ${DESTINO}`);
}

main();

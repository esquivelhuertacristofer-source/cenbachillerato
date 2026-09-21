/**
 * REGISTRO de fichas teóricas por laboratorio.
 *
 * La Expedición arma sus capítulos con la ficha del laboratorio (conceptos,
 * glosario, marco teórico). Los nombres de archivo NO coinciden con los slugs
 * —hay 65 que difieren—, así que el mapa se deriva de los imports reales con
 * `mapa-fichas-labs.ts` y aquí se convierte en código.
 *
 * Cada ficha se importa PEREZOSAMENTE: si se importaran las 187 de golpe, el
 * texto verbatim de todas viajaría en el bundle de cada práctica (y el Worker
 * tiene 3 MiB). Así solo viaja la del laboratorio abierto.
 *
 * Escribe `src/components/practicas/expedicion/fichas-registry.generated.ts`.
 *
 * Uso: npx tsx scripts/mapa-fichas-labs.ts && npx tsx scripts/generar-registro-fichas.ts
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const RAIZ = resolve(process.cwd());
const MAPA = resolve(RAIZ, "data", "mapa-fichas.json");
const DESTINO = resolve(RAIZ, "src", "components", "practicas", "expedicion", "fichas-registry.generated.ts");

interface Entrada {
  componente: string;
  ficha: string | null;
  export: string | null;
}

function main() {
  const mapa = JSON.parse(readFileSync(MAPA, "utf8")) as Record<string, Entrada>;
  const filas = Object.entries(mapa)
    .filter(([, e]) => e.ficha && e.export)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([slug, e]) => `  "${slug}": () => import("../labs/${e.ficha}").then((m) => m.${e.export}),`);

  writeFileSync(
    DESTINO,
    `// GENERADO por scripts/generar-registro-fichas.ts — no editar a mano.\n` +
      `// ${filas.length} laboratorios con ficha teórica.\n\n` +
      `import type { FichaTeoricaData } from "../labs/_ficha";\n\n` +
      `export const FICHAS: Record<string, () => Promise<FichaTeoricaData>> = {\n${filas.join("\n")}\n};\n\n` +
      `/** La ficha del laboratorio, o null si ese slug no tiene ninguna. */\n` +
      `export async function cargarFicha(slug: string): Promise<FichaTeoricaData | null> {\n` +
      `  const cargar = FICHAS[slug];\n` +
      `  if (!cargar) return null;\n` +
      `  try {\n` +
      `    return await cargar();\n` +
      `  } catch {\n` +
      `    // Una ficha rota no puede dejar al alumno sin laboratorio.\n` +
      `    return null;\n` +
      `  }\n` +
      `}\n`,
    "utf8"
  );
  console.log(`${filas.length} fichas → ${DESTINO}`);
}

main();

/**
 * Registra el hueco de un laboratorio que todavía no existe.
 *
 * Una campaña de laboratorios necesita que el slug exista ANTES de que el lab
 * esté escrito: así el banco de pruebas (`/zz-prueba-lab?slug=…`) puede montarlo
 * y quien lo construye sólo reemplaza el componente provisional.
 *
 * Uso:
 *   npx tsx scripts/registrar-stub-lab.ts <slug> <Componente> "<Título>" "<Descripción>"
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

const RAIZ = process.cwd();
const REGISTRY = resolve(RAIZ, "src/components/practicas/registry.tsx");
const META = resolve(RAIZ, "src/components/practicas/registry-meta.ts");
const LABS = resolve(RAIZ, "src/components/practicas/labs");

const MARCA_DYNAMIC = "loading: LabCargando });";

function provisional(componente: string, titulo: string): string {
  return [
    '"use client";',
    "",
    "// PROVISIONAL — reemplazar por el laboratorio real (misma exportación nombrada).",
    'import type { PracticaLabProps } from "../registry";',
    "",
    `export function ${componente}({ color }: PracticaLabProps) {`,
    "  return (",
    '    <div style={{ padding: 40, color: "#fff", fontFamily: "system-ui" }}>',
    `      <h2 style={{ color: color.hex }}>${titulo}</h2>`,
    "      <p>Laboratorio en construcción.</p>",
    "    </div>",
    "  );",
    "}",
    "",
  ].join("\n");
}

function main() {
  const [slug, componente, titulo, descripcion] = process.argv.slice(2);
  if (!slug || !componente || !titulo || !descripcion) {
    console.error('Uso: npx tsx scripts/registrar-stub-lab.ts <slug> <Componente> "<Título>" "<Descripción>"');
    process.exit(1);
  }

  // 1. El componente provisional, que quien construya el lab reemplaza entero.
  const ruta = resolve(LABS, `${componente}.tsx`);
  if (existsSync(ruta)) {
    console.log(`· ${componente}.tsx ya existe, no lo toco`);
  } else {
    writeFileSync(ruta, provisional(componente, titulo), "utf8");
    console.log(`✓ ${componente}.tsx (provisional)`);
  }

  // 2. registry-meta.ts primero: registry.tsx lee de él con `...PRACTICAS_META[slug]!`.
  let meta = readFileSync(META, "utf8");
  if (meta.includes(`slug: "${slug}"`)) {
    console.log("· ya estaba en registry-meta.ts");
  } else {
    const abre = meta.indexOf("{", meta.indexOf("export const PRACTICAS_META"));
    const entrada = `\n  ${JSON.stringify(slug)}: {\n    slug: ${JSON.stringify(slug)},\n    titulo: ${JSON.stringify(titulo)},\n    descripcion: ${JSON.stringify(descripcion)},\n  },`;
    meta = meta.slice(0, abre + 1) + entrada + meta.slice(abre + 1);
    writeFileSync(META, meta, "utf8");
    console.log("✓ registry-meta.ts");
  }

  // 3. registry.tsx: el import perezoso (tras el último) y la entrada de PRACTICAS.
  let reg = readFileSync(REGISTRY, "utf8");
  if (reg.includes(`"./labs/${componente}"`)) {
    console.log("· ya estaba en registry.tsx");
    return;
  }
  const ultimo = reg.lastIndexOf(MARCA_DYNAMIC);
  if (ultimo < 0) throw new Error("no encontré dónde insertar el dynamic()");
  const finLinea = reg.indexOf("\n", ultimo) + 1;
  const linea = `const ${componente} = dynamic(() => import("./labs/${componente}").then((m) => m.${componente}), { ssr: false, loading: LabCargando });\n`;
  reg = reg.slice(0, finLinea) + linea + reg.slice(finLinea);

  const abre = reg.indexOf("{", reg.indexOf("export const PRACTICAS"));
  reg = reg.slice(0, abre + 1) + `\n  ${JSON.stringify(slug)}: { ...PRACTICAS_META[${JSON.stringify(slug)}]!, Component: ${componente} },` + reg.slice(abre + 1);
  writeFileSync(REGISTRY, reg, "utf8");
  console.log("✓ registry.tsx");
}

main();

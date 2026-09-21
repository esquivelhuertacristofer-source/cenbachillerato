/**
 * ENGANCHA LOS OBJETIVOS DE UN LABORATORIO AL TABLERO QUE SÍ DEJA MARCA.
 *
 * 29 laboratorios 3D pintan su lista de objetivos a mano, derivada del estado
 * de la escena. Eso tiene dos defectos que el alumno nota: los objetivos se
 * desmarcan solos al cambiar de modo, y cumplirlos no deja ninguna marca —ni
 * estrellas ni memoria entre sesiones—. Los otros 158 laboratorios ya usan
 * `useLogros` + `useEstrellas`; este codemod pone a estos en la misma línea.
 *
 * La sustitución es la rejilla interna de la tarjeta de objetivos:
 *
 *   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", … }}>
 *     {[ { txt: …, done: … }, … ].map((o, i) => ( … ))}
 *   </div>
 *       → <TableroObjetivos retoKey={RETO_KEY} accent={accent} objetivos={[ … ]} />
 *
 * La tarjeta, su cejilla y el resto del laboratorio no se tocan: el arreglo es
 * de contabilidad, no de diseño.
 *
 * Los laboratorios cuya tarjeta tiene otra forma (una sola línea de objetivo,
 * una lista de chips, etc.) NO se tocan y se reportan al final para hacerlos a
 * mano: un reemplazo de texto no puede adivinar su estructura.
 *
 * Uso: npx tsx scripts/migrar-objetivos-labs.ts [--dry] [--solo=LabX]
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const RAIZ = process.cwd();
const LABS_DIR = resolve(RAIZ, "src/components/practicas/labs");
const REGISTRY = resolve(RAIZ, "src/components/practicas/registry.tsx");

/**
 * La rejilla de objetivos. Aparece de tres formas, según quién escribió el
 * laboratorio: con el arreglo escrito dentro del JSX, con el arreglo escrito
 * dentro y anotado con `as`, o con el arreglo ya en una variable `objetivos`.
 */
const REJILLAS: Array<{ re: RegExp; lista: (m: RegExpExecArray) => string }> = [
  {
    re: /([ \t]*)<div style=\{\{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" \}\}>\s*\{\[([\s\S]*?)\]\.map\(\(o, i\) => \([\s\S]*?\n[ \t]*\)\)\}\s*<\/div>/,
    lista: (m) => `[${m[2].trimEnd()}\n${m[1]}  ]`,
  },
  {
    re: /([ \t]*)<div style=\{\{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" \}\}>\s*\{\(\s*\[([\s\S]*?)\][\s\S]{0,80}?\)\.map\(\(o, i\) => \([\s\S]*?\n[ \t]*\)\)\}\s*<\/div>/,
    lista: (m) => `[${m[2].trimEnd()}\n${m[1]}  ]`,
  },
  {
    re: /([ \t]*)<div style=\{\{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" \}\}>\s*\{(\w+)\.map\(\(o, i\) => \([\s\S]*?\n[ \t]*\)\)\}\s*<\/div>/,
    lista: (m) => m[2],
  },
];

export interface Resultado {
  componente: string;
  archivo: string;
  ok: boolean;
  motivo?: string;
}

/** slug -> componente, y componente -> archivo, leídos del registry. */
function mapaLabs(): Array<{ slug: string; componente: string; archivo: string }> {
  const src = readFileSync(REGISTRY, "utf8");
  const compAArchivo = new Map<string, string>();
  for (const m of src.matchAll(/const (\w+) = dynamic\(\(\) => import\("\.\/labs\/([\w-]+)"\)/g)) {
    compAArchivo.set(m[1], m[2]);
  }
  const bloque = src.slice(src.indexOf("export const PRACTICAS"));
  const out: Array<{ slug: string; componente: string; archivo: string }> = [];
  for (const m of bloque.matchAll(/^\s{2}"?([a-z0-9][a-z0-9-]*)"?:\s*\{[^}]*Component:\s*(\w+)/gm)) {
    const archivo = compAArchivo.get(m[2]);
    if (archivo) out.push({ slug: m[1], componente: m[2], archivo });
  }
  return out;
}

/** Inserta una línea después del último import del módulo. */
function trasLosImports(src: string, linea: string): string {
  const imports = [...src.matchAll(/^import [\s\S]*?;$/gm)];
  if (imports.length === 0) return `${linea}\n${src}`;
  const ultimo = imports[imports.length - 1];
  const fin = ultimo.index! + ultimo[0].length;
  return `${src.slice(0, fin)}\n\n${linea}${src.slice(fin)}`;
}

export function migrar(archivo: string, slug: string, dry: boolean): Resultado {
  const ruta = resolve(LABS_DIR, `${archivo}.tsx`);
  const original = readFileSync(ruta, "utf8");
  const base = { componente: archivo, archivo: `${archivo}.tsx` };

  if (original.includes("TableroObjetivos")) {
    return { ...base, ok: false, motivo: "ya usa TableroObjetivos" };
  }
  let m: RegExpExecArray | null = null;
  let lista = "";
  for (const forma of REJILLAS) {
    const hit = forma.re.exec(original);
    if (hit) {
      m = hit;
      lista = forma.lista(hit);
      break;
    }
  }
  if (!m) return { ...base, ok: false, motivo: "la tarjeta de objetivos tiene otra forma" };

  const sangria = m[1];
  let out =
    original.slice(0, m.index) +
    `${sangria}<TableroObjetivos\n` +
    `${sangria}  retoKey={RETO_KEY}\n` +
    `${sangria}  accent={accent}\n` +
    `${sangria}  objetivos={${lista}}\n` +
    `${sangria}/>` +
    original.slice(m.index + m[0].length);

  // La clave del reto: la misma convención que los otros laboratorios.
  if (!/const RETO_KEY\s*=/.test(out)) {
    out = trasLosImports(out, `\n/** Clave de la mejor marca de este laboratorio. */\nconst RETO_KEY = "cen-${slug}-reto";\n`);
  }
  if (!out.includes('from "./_objetivos"')) {
    out = trasLosImports(out, `import { TableroObjetivos } from "./_objetivos";`);
  }

  if (!dry) writeFileSync(ruta, out, "utf8");
  return { ...base, ok: true };
}

function main() {
  const dry = process.argv.includes("--dry");
  const solo = process.argv.find((a) => a.startsWith("--solo="))?.slice(7);

  const labs = mapaLabs().filter((l) => {
    if (solo) return l.componente === solo;
    const src = readFileSync(resolve(LABS_DIR, `${l.archivo}.tsx`), "utf8");
    return !src.includes("useEstrellas");
  });

  const hechos: Resultado[] = [];
  const saltados: Resultado[] = [];
  for (const l of labs) {
    const r = migrar(l.archivo, l.slug, dry);
    (r.ok ? hechos : saltados).push(r);
  }

  for (const r of hechos) console.log(`  ✓ ${r.archivo}`);
  console.log(`\n${hechos.length} migrados${dry ? " (simulación, nada escrito)" : ""} · ${saltados.length} a mano`);
  for (const r of saltados) console.log(`   ${r.archivo}: ${r.motivo}`);
}

if (process.argv[1]?.includes("migrar-objetivos-labs")) main();

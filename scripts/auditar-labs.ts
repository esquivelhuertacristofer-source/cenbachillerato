/**
 * INVENTARIO DE LABORATORIOS — ¿qué le falta a cada práctica?
 *
 * Sólo lectura, sólo disco (no toca la base). Recorre `PRACTICAS` del registry,
 * resuelve el archivo del componente y mide, por laboratorio, qué piezas del
 * "tratamiento" están presentes. La lista de piezas es la de la campaña:
 *
 *   A  ficha teórica en cajón   → import de `./_ficha` + `{algo}-ficha.ts` en disco
 *   B  tarjeta evaluable        → RetoQuizCard | RetoNumericoCard | QuizCard | CalcCard…
 *   C1 sonido                   → LabSfx (lab-audio) o módulo de audio propio
 *   C2 reto/estrellas           → useEstrellas o localStorage con reto/mejor/estrellas
 *   C3 etiquetas conmutables    → estado `etiquetas`
 *   IMG carátula                → public/media/semN/labs/<slug>.webp o LAB_TEMA
 *
 * El shell de un lab 3D delega la escena a un `*Scene.tsx` hermano, así que
 * "3D" se decide mirando también los archivos que el shell importa: buscar
 * `<Canvas>` sólo en el shell da 0 y es falso.
 *
 * Uso:  npx tsx scripts/auditar-labs.ts [--faltantes] [--csv]
 */
import { existsSync, readFileSync, readdirSync } from "fs";
import { resolve, sep } from "path";

const RAIZ = process.cwd();
const LABS_DIR = resolve(RAIZ, "src/components/practicas/labs");
const PUBLIC_DIR = resolve(RAIZ, "public");

/** slug -> nombre del componente, leído del objeto PRACTICAS. */
function slugAComponente(): Map<string, string> {
  const src = readFileSync(resolve(RAIZ, "src/components/practicas/registry.tsx"), "utf8");
  const bloque = src.slice(src.indexOf("export const PRACTICAS"));
  const out = new Map<string, string>();
  for (const m of bloque.matchAll(/^\s{2}"?([a-z0-9][a-z0-9-]*)"?:\s*\{[^}]*Component:\s*(\w+)/gm)) {
    out.set(m[1], m[2]);
  }
  return out;
}

/** componente -> ruta del archivo, leída de los `dynamic(() => import("./labs/X"))`. */
function componenteAArchivo(): Map<string, string> {
  const src = readFileSync(resolve(RAIZ, "src/components/practicas/registry.tsx"), "utf8");
  const out = new Map<string, string>();
  for (const m of src.matchAll(/const (\w+) = dynamic\(\(\) => import\("\.\/labs\/([\w-]+)"\)/g)) {
    out.set(m[1], resolve(LABS_DIR, `${m[2]}.tsx`));
  }
  return out;
}

function labTema(): Record<string, string> {
  const src = readFileSync(resolve(RAIZ, "src/lib/practicas/lab-imagenes.ts"), "utf8");
  const out: Record<string, string> = {};
  for (const m of src.matchAll(/^\s*"([a-z0-9][a-z0-9-]*)":\s*"([a-z0-9-]+)",/gm)) out[m[1]] = m[2];
  return out;
}

function caratulaPropia(slug: string): boolean {
  for (let sem = 1; sem <= 6; sem++) {
    if (existsSync(resolve(PUBLIC_DIR, "media", `sem${sem}`, "labs", `${slug}.webp`))) return true;
  }
  return false;
}

/**
 * Los `./algo` que referencia un archivo, resueltos a .tsx/.ts existentes.
 * Cuenta las dos formas: el `from "./X"` de un import normal Y el
 * `import("./X")` de un `dynamic(...)`. La mayoría de los shells sólo monta su
 * escena por `dynamic`, así que mirar únicamente los `from` deja fuera el 3D.
 */
function importesLocales(src: string): string[] {
  const out: string[] = [];
  const nombres = new Set<string>();
  for (const m of src.matchAll(/from\s+"\.\/([\w-]+)"/g)) nombres.add(m[1]);
  for (const m of src.matchAll(/import\(\s*"\.\/([\w-]+)"\s*\)/g)) nombres.add(m[1]);
  for (const n of nombres) {
    for (const ext of [".tsx", ".ts"]) {
      const p = resolve(LABS_DIR, n + ext);
      if (existsSync(p)) { out.push(p); break; }
    }
  }
  return out;
}

export interface FilaLab {
  slug: string;
  componente: string;
  archivo: string;
  lineas: number;
  lineasTotales: number;
  tresD: boolean;
  ficha: boolean;
  fichaData: string | null;
  evaluable: string | null;
  sonido: boolean;
  estrellas: boolean;
  etiquetas: boolean;
  imagen: boolean;
}

const EVALUABLES = [
  "RetoQuizCard",
  "RetoNumericoCard",
  "RetoDisolucionCard",
  "QuizCard",
  "CalcCard",
  "CalcDensidadCard",
];

export function inventario(): FilaLab[] {
  const comp = slugAComponente();
  const arch = componenteAArchivo();
  const temas = labTema();
  const fichasEnDisco = new Set(readdirSync(LABS_DIR).filter((f) => f.endsWith("-ficha.ts")));

  const filas: FilaLab[] = [];
  for (const [slug, componente] of comp) {
    const archivo = arch.get(componente);
    if (!archivo || !existsSync(archivo)) {
      filas.push({
        slug, componente, archivo: archivo ?? "(sin import)", lineas: 0, lineasTotales: 0,
        tresD: false, ficha: false, fichaData: null, evaluable: null, sonido: false,
        estrellas: false, etiquetas: false, imagen: false,
      });
      continue;
    }
    const src = readFileSync(archivo, "utf8");
    const hijos = importesLocales(src);
    const srcHijos = hijos.map((p) => readFileSync(p, "utf8"));
    const todo = [src, ...srcHijos].join("\n");

    // La ficha se importa desde "./_ficha"; el módulo de datos puede llamarse
    // distinto al slug (aprendizaje de Sem6), así que se busca por el import.
    let fichaData: string | null = null;
    for (const m of src.matchAll(/from\s+"\.\/([\w-]*-ficha)"/g)) {
      if (fichasEnDisco.has(`${m[1]}.ts`)) fichaData = `${m[1]}.ts`;
    }

    const evaluables = EVALUABLES.filter((n) => src.includes(`<${n}`));

    filas.push({
      slug,
      componente,
      archivo: archivo.slice(RAIZ.length + 1).split(sep).join("/"),
      lineas: src.split("\n").length,
      lineasTotales: todo.split("\n").length,
      tresD: /@react-three\//.test(todo),
      ficha: src.includes('from "./_ficha"'),
      fichaData,
      evaluable: evaluables[0] ?? null,
      sonido: /LabSfx|lab-audio/.test(src) || /-audio"/.test(src),
      // La clave casi nunca es un literal en la llamada: los labs la guardan en
      // una constante (RETO_KEY = "cen-…"). Basta con ver que hay persistencia
      // y que el archivo habla de reto/estrellas.
      estrellas:
        /useEstrellas/.test(src) ||
        (/localStorage/.test(src) && /RETO_KEY|MEJOR_KEY|estrellas|Estrellas/.test(src)),
      etiquetas: /\betiquetas\b/.test(src),
      imagen: caratulaPropia(slug) || Boolean(temas[slug]),
    });
  }
  return filas.sort((a, b) => a.slug.localeCompare(b.slug));
}

function main() {
  const filas = inventario();
  const soloFaltantes = process.argv.includes("--faltantes");

  if (process.argv.includes("--csv")) {
    console.log("slug,componente,lineas,lineasTotales,3d,ficha,fichaData,evaluable,sonido,estrellas,etiquetas,imagen");
    for (const f of filas) {
      console.log([f.slug, f.componente, f.lineas, f.lineasTotales, f.tresD, f.ficha,
        f.fichaData ?? "", f.evaluable ?? "", f.sonido, f.estrellas, f.etiquetas, f.imagen].join(","));
    }
    return;
  }

  const marca = (b: boolean) => (b ? "✓" : "·");
  const completo = (f: FilaLab) => f.ficha && Boolean(f.evaluable) && f.sonido && f.imagen;

  console.log(`\n=== INVENTARIO DE LABORATORIOS (${filas.length}) ===\n`);
  console.log("slug                                  3D  A  B                   C1 C2 C3 IMG");
  for (const f of filas) {
    if (soloFaltantes && completo(f)) continue;
    console.log(
      `${f.slug.padEnd(37)} ${marca(f.tresD)}   ${marca(f.ficha)}  ` +
        `${(f.evaluable ?? "—").padEnd(19)} ${marca(f.sonido)}  ${marca(f.estrellas)}  ` +
        `${marca(f.etiquetas)}  ${marca(f.imagen)}`
    );
  }

  const n = filas.length;
  const cuenta = (p: (f: FilaLab) => boolean) => filas.filter(p).length;
  console.log(`\n--- RESUMEN sobre ${n} laboratorios ---`);
  console.log(`  3D (three.js)          ${cuenta((f) => f.tresD)}`);
  console.log(`  DOM puro               ${cuenta((f) => !f.tresD)}`);
  console.log(`  A  ficha teórica       ${cuenta((f) => f.ficha)}   faltan ${n - cuenta((f) => f.ficha)}`);
  console.log(`  B  tarjeta evaluable   ${cuenta((f) => Boolean(f.evaluable))}   faltan ${n - cuenta((f) => Boolean(f.evaluable))}`);
  console.log(`  C1 sonido              ${cuenta((f) => f.sonido)}   faltan ${n - cuenta((f) => f.sonido)}`);
  console.log(`  C2 reto/estrellas      ${cuenta((f) => f.estrellas)}`);
  console.log(`  C3 etiquetas           ${cuenta((f) => f.etiquetas)}`);
  console.log(`  IMG carátula           ${cuenta((f) => f.imagen)}   faltan ${n - cuenta((f) => f.imagen)}`);
  console.log(`  COMPLETOS (A+B+C1+IMG) ${cuenta(completo)}`);
}

if (process.argv[1] && process.argv[1].includes("auditar-labs")) main();

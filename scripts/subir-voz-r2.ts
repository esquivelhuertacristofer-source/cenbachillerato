/**
 * SUBE LA NARRACIÓN AL BUCKET PÚBLICO DE R2.
 *
 * Portado de `subir-medios-r2.mjs` de la plataforma de robótica, con sus dos
 * decisiones intactas:
 *
 * ES IDEMPOTENTE, Y ESO NO ES UN LUJO. Son ~1 300 archivos y ~170 MB por una
 * subida doméstica: se corta. Se lleva un índice al lado con el hash de lo ya
 * subido y relanzarlo continúa donde iba en vez de empezar de cero.
 *
 * POR QUÉ `wrangler r2 object put` Y NO EL SDK DE S3. Porque wrangler ya está
 * instalado, ya sabe qué cuenta es y ya tiene el token. El SDK querría unas
 * credenciales de acceso R2 aparte —otro secreto que guardar, rotar y explicar—
 * para hacer exactamente lo mismo. El precio es que va de archivo en archivo;
 * por eso hay concurrencia.
 *
 * Uso:
 *   npx tsx scripts/subir-voz-r2.ts              sube lo que falte
 *   npx tsx scripts/subir-voz-r2.ts --todo       vuelve a subir todo
 *   npx tsx scripts/subir-voz-r2.ts --verificar  no sube: comprueba por HTTP
 *   npx tsx scripts/subir-voz-r2.ts --dry        dice qué haría
 */
import { resolve, relative, join } from "path";
import { existsSync, readdirSync, statSync, readFileSync, writeFileSync } from "fs";
import { execFile } from "child_process";
import { VOZ_BASE } from "../src/lib/voz/ruta-voz";

const ORIGEN = resolve(process.cwd(), "../video-pipeline/voz-out");
const INDICE = resolve(ORIGEN, "subidos.json");
const BUCKET = "nem-videos";
const PREFIJO = "bachillerato-voz";

const TODO = process.argv.includes("--todo");
const DRY = process.argv.includes("--dry");
const VERIFICAR = process.argv.includes("--verificar");

/** Seis a la vez: donde deja de mejorar y empieza a saturar una subida doméstica. */
const A_LA_VEZ = 6;

function mp3s(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...mp3s(p));
    else if (e.name.endsWith(".mp3")) out.push(p);
  }
  return out;
}

/**
 * Se invoca el .js de wrangler con el propio Node, NO `npx`.
 *
 * Node 22 en Windows se niega a `spawn` un `.cmd` sin shell (el arreglo de
 * CVE-2024-27980) y devuelve EINVAL: las 1 322 subidas fallaban antes de
 * empezar. Meter `shell: true` lo arreglaría, pero entonces las rutas con
 * espacios —y este proyecto vive en "NEM BACHILLERATO"— hay que citarlas a mano
 * y cualquier comilla de más rompe el comando. Llamando al script directamente
 * no hay shell, no hay citas y no hay EINVAL.
 */
const WRANGLER = resolve(process.cwd(), "node_modules/wrangler/bin/wrangler.js");

function put(objectPath: string, file: string): Promise<void> {
  return new Promise((ok, fail) => {
    execFile(
      process.execPath,
      [WRANGLER, "r2", "object", "put", objectPath, "--file", file, "--content-type", "audio/mpeg", "--remote"],
      { maxBuffer: 1 << 22 },
      (err, _out, stderr) => (err ? fail(new Error(String(stderr).slice(-200))) : ok())
    );
  });
}

async function enParalelo<T>(items: T[], n: number, fn: (t: T, i: number) => Promise<void>) {
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      for (;;) {
        const k = i++;
        if (k >= items.length) return;
        await fn(items[k], k);
      }
    })
  );
}

async function main() {
  if (!existsSync(ORIGEN)) throw new Error(`No hay nada grabado en ${ORIGEN}`);
  const archivos = mp3s(ORIGEN);
  if (archivos.length === 0) throw new Error("No hay MP3 que subir");

  const indice: Record<string, number> = existsSync(INDICE)
    ? JSON.parse(readFileSync(INDICE, "utf8"))
    : {};

  if (VERIFICAR) {
    let ok = 0; const faltan: string[] = [];
    await enParalelo(archivos, 12, async (f) => {
      const rel = relative(ORIGEN, f).split("\\").join("/");
      const r = await fetch(`${VOZ_BASE}/${rel}`, { method: "HEAD" });
      if (r.ok) ok++; else faltan.push(rel);
    });
    console.log(`\nVerificación: ${ok}/${archivos.length} presentes en R2, faltan ${faltan.length}`);
    for (const f of faltan.slice(0, 20)) console.log(`  FALTA ${f}`);
    if (faltan.length) process.exit(1);
    return;
  }

  const pendientes = archivos.filter((f) => {
    const rel = relative(ORIGEN, f).split("\\").join("/");
    return TODO || indice[rel] !== statSync(f).size;
  });

  console.log(
    `${archivos.length} MP3 en disco | ${pendientes.length} por subir a ${BUCKET}/${PREFIJO}/` +
    (DRY ? " (DRY, no sube nada)" : "")
  );
  if (DRY || pendientes.length === 0) return;

  let hechos = 0; const fallos: string[] = [];
  await enParalelo(pendientes, A_LA_VEZ, async (f) => {
    const rel = relative(ORIGEN, f).split("\\").join("/");
    try {
      await put(`${BUCKET}/${PREFIJO}/${rel}`, f);
      indice[rel] = statSync(f).size;
      hechos++;
      if (hechos % 50 === 0) {
        console.log(`  ${hechos}/${pendientes.length}  ${rel}`);
        writeFileSync(INDICE, JSON.stringify(indice), "utf8");
      }
    } catch (err) {
      fallos.push(`${rel}: ${(err as Error).message.slice(0, 90)}`);
    }
  });

  writeFileSync(INDICE, JSON.stringify(indice), "utf8");
  console.log(`\nsubidos ${hechos}   fallos ${fallos.length}`);
  for (const f of fallos.slice(0, 20)) console.log(`  FALLO ${f}`);
  if (fallos.length) process.exit(1);
}

main().catch((err) => { console.error("ERROR:", err.message); process.exit(1); });

/**
 * SUBE LOS VIDEOS RENDERIZADOS AL BUCKET PÚBLICO DE R2.
 *
 * Hermano de `subir-voz-r2.ts`, con las mismas dos decisiones y un cambio.
 *
 * LA MISMA LLAMADA A WRANGLER, POR LA MISMA RAZÓN. Node 22 en Windows se niega
 * a `spawn` un `.cmd` sin shell —el arreglo de CVE-2024-27980— y devuelve EINVAL.
 * Invocar `node node_modules/wrangler/bin/wrangler.js` evita el shell, y de paso
 * evita tener que citar la ruta del proyecto, que vive en una carpeta con espacio
 * ("NEM BACHILLERATO") y con `shell: true` se rompería.
 *
 * EL CAMBIO: DOS A LA VEZ, NO SEIS. La narración son clips de 30 KB; un video son
 * 20-45 MB. Seis subidas concurrentes de ese tamaño no van más rápido en una
 * conexión doméstica: se pelean por el mismo ancho de banda y hacen que una falle
 * a la mitad, que es el peor caso porque hay que repetirla entera.
 *
 * POR QUÉ NO SE SIRVEN COMO ASSET DE NEXT. Los assets estáticos de Cloudflare
 * Workers tienen un tope duro de 25 MiB por archivo y varios de estos videos lo
 * superan. Servirlos desde la URL pública de R2 además no consume la cuota de
 * 100 mil peticiones diarias del plan Free.
 *
 * ES IDEMPOTENTE. Lleva un índice con el tamaño de lo ya subido; si la corrida se
 * corta a la mitad, relanzarla continúa donde iba.
 *
 * Uso:
 *   npx tsx scripts/subir-videos-r2.ts               sube lo que falte
 *   npx tsx scripts/subir-videos-r2.ts --solo=<slug>  sube uno o varios (repetible)
 *   npx tsx scripts/subir-videos-r2.ts --verificar    no sube: comprueba por HTTP
 *   npx tsx scripts/subir-videos-r2.ts --todo         vuelve a subir todo
 *   npx tsx scripts/subir-videos-r2.ts --dry          dice qué haría
 */
import { resolve, join, basename } from "path";
import { existsSync, readdirSync, statSync, readFileSync, writeFileSync } from "fs";
import { execFile } from "child_process";

const ORIGEN = resolve(process.cwd(), "..", "video-pipeline", "out");
const INDICE = resolve(ORIGEN, "subidos-r2.json");
const BUCKET = "nem-videos";
const PREFIJO = "bachillerato";
const BASE_PUBLICA = "https://pub-94a8196c0c59456a89cf72193424c9d1.r2.dev/bachillerato";

const TODO = process.argv.includes("--todo");
const DRY = process.argv.includes("--dry");
const VERIFICAR = process.argv.includes("--verificar");
const SOLO = process.argv
  .filter((a) => a.startsWith("--solo="))
  .map((a) => a.slice("--solo=".length).replace(/\.mp4$/, ""));

const A_LA_VEZ = 2;

const WRANGLER = resolve(process.cwd(), "node_modules/wrangler/bin/wrangler.js");

function put(objectPath: string, file: string): Promise<void> {
  return new Promise((ok, fail) => {
    execFile(
      process.execPath,
      [WRANGLER, "r2", "object", "put", objectPath, "--file", file, "--content-type", "video/mp4", "--remote"],
      { maxBuffer: 1 << 22 },
      (err, _out, stderr) => (err ? fail(new Error(String(stderr).slice(-220))) : ok())
    );
  });
}

async function enParalelo<T>(items: T[], n: number, fn: (t: T) => Promise<void>) {
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      for (;;) {
        const k = i++;
        if (k >= items.length) return;
        await fn(items[k]!);
      }
    })
  );
}

function mb(bytes: number) {
  return (bytes / 1024 / 1024).toFixed(1);
}

async function main() {
  if (!existsSync(ORIGEN)) throw new Error(`No existe ${ORIGEN}`);

  let archivos = readdirSync(ORIGEN)
    .filter((f) => f.endsWith(".mp4"))
    .map((f) => join(ORIGEN, f));

  if (SOLO.length) {
    const quiero = new Set(SOLO);
    archivos = archivos.filter((f) => quiero.has(basename(f, ".mp4")));
    const faltan = [...quiero].filter((s) => !archivos.some((f) => basename(f, ".mp4") === s));
    if (faltan.length) throw new Error(`No hay MP4 para: ${faltan.join(", ")}`);
  }
  if (archivos.length === 0) throw new Error("No hay MP4 que subir");

  if (VERIFICAR) {
    let ok = 0;
    const faltan: string[] = [];
    await enParalelo(archivos, 8, async (f) => {
      const nombre = basename(f);
      const r = await fetch(`${BASE_PUBLICA}/${nombre}`, { method: "HEAD" });
      if (r.ok) ok++;
      else faltan.push(nombre);
    });
    console.log(`\nVerificación: ${ok}/${archivos.length} presentes en R2, faltan ${faltan.length}`);
    for (const f of faltan.slice(0, 30)) console.log(`  FALTA ${f}`);
    if (faltan.length) process.exit(1);
    return;
  }

  const indice: Record<string, number> = existsSync(INDICE)
    ? (JSON.parse(readFileSync(INDICE, "utf8")) as Record<string, number>)
    : {};

  const pendientes = archivos.filter((f) => TODO || indice[basename(f)] !== statSync(f).size);
  const pesoTotal = pendientes.reduce((s, f) => s + statSync(f).size, 0);

  console.log(
    `${archivos.length} MP4 en disco | ${pendientes.length} por subir (${mb(pesoTotal)} MB) ` +
    `a ${BUCKET}/${PREFIJO}/` + (DRY ? "  (DRY, no sube nada)" : "")
  );
  if (DRY || pendientes.length === 0) return;

  let hechos = 0;
  const fallos: string[] = [];
  await enParalelo(pendientes, A_LA_VEZ, async (f) => {
    const nombre = basename(f);
    try {
      await put(`${BUCKET}/${PREFIJO}/${nombre}`, f);
      indice[nombre] = statSync(f).size;
      hechos++;
      console.log(`  ${hechos}/${pendientes.length}  ${nombre} (${mb(statSync(f).size)} MB)`);
      writeFileSync(INDICE, JSON.stringify(indice), "utf8");
    } catch (err) {
      fallos.push(`${nombre}: ${(err as Error).message.slice(0, 120)}`);
    }
  });

  writeFileSync(INDICE, JSON.stringify(indice), "utf8");
  console.log(`\nsubidos ${hechos}   fallos ${fallos.length}`);
  for (const f of fallos.slice(0, 20)) console.log(`  FALLO ${f}`);
  if (fallos.length) process.exit(1);
}

main();

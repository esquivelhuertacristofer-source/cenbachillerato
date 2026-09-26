/**
 * ILUSTRA LOS TÉRMINOS Y CONCEPTOS DE CADA LABORATORIO.
 *
 * El capítulo «Prepárate» y el capítulo «Comprueba» de la Expedición muestran
 * conceptos y glosario. En texto solo, son un muro de letras. Aquí se genera
 * una viñeta por término, con el MISMO modelo, la MISMA ficha de estilo y la
 * misma semilla estable que las carátulas, para que todo parezca de la misma
 * serie.
 *
 * Igual que en `escenas-imagenes.ts`, la escena de cada término se escribe a
 * mano (viven en `data/escenas-terminos/*.json`): un prompt hecho con el nombre
 * del término da borrones, porque «densidad» no nombra ningún objeto que se
 * pueda poner sobre una mesa.
 *
 * Entrada: uno o varios JSON con la forma
 *   { "slug": "densidad", "items": [{ "clave": "masa", "escena": "..." }, ...] }
 *
 * Salida: public/media/labs-terminos/<slug>/<clave>.webp (cuadradas, 420 px).
 *
 * Requiere ComfyUI escuchando en 127.0.0.1:8188.
 *
 * Uso:
 *   npx tsx scripts/generar-imagenes-terminos.ts --dry
 *   npx tsx scripts/generar-imagenes-terminos.ts [--solo=slug] [--rehacer]
 */
import { resolve, join } from "path";
import { existsSync, mkdirSync, readdirSync, readFileSync } from "fs";
import sharp from "sharp";
import { claveDeTermino } from "../src/lib/practicas/terminos-imagen";

const HOST = "http://127.0.0.1:8188";
const UNET = "krea2TurboOfficialComfy_krea2TurboFp8.safetensors";
const CLIP = "qwen3vl_4b_fp8_scaled.safetensors";
const VAE = "qwen_image_vae.safetensors";

const RAIZ = resolve(process.cwd());
const ENTRADA = resolve(RAIZ, "data", "escenas-terminos");
const SALIDA = resolve(RAIZ, "public", "media", "labs-terminos");

/** Cuadradas: las viñetas se muestran en mosaico dentro de las tarjetas. */
const LADO = 640;
const LADO_WEBP = 420;
const CALIDAD = 78;

/** La MISMA ficha de estilo de las carátulas, recortada a viñeta. */
const ESTILO = [
  "Soft matte plasticine clay 3D render, handmade stop-motion diorama,",
  "rounded chunky shapes modelled in coloured modelling clay with a slightly soft matte surface,",
  "warm muted pastel palette of dusty terracotta, sage green, soft blue and cream,",
  "plain softly graded studio backdrop, gentle diffuse light with a warm glow and one soft contact shadow,",
  "a single clear subject centred with generous empty space around it,",
  "friendly educational illustration, polished like a stop-motion short film.",
  "No text, no letters, no numbers, no watermark, no logos, no signage, no UI.",
].join(" ");

/**
 * `texto` es lo que el alumno LEE en la ficha o en la zona («GNU/Linux»,
 * «Software privativo»). La clave se saca de ahí con la MISMA función que usa
 * la app para buscar la imagen: escrita a mano, una tilde o el corte de 48
 * caracteres bastan para que la imagen exista y nunca se pinte.
 */
interface Item { clave?: string; texto?: string; escena: string }
interface Ficha { slug: string; items: (Item & { clave: string })[] }

interface Grafo { [k: string]: { class_type: string; inputs: Record<string, unknown> } }

function grafo(texto: string, prefijo: string, seed: number): Grafo {
  return {
    "1": { class_type: "UNETLoader", inputs: { unet_name: UNET, weight_dtype: "default" } },
    "2": { class_type: "CLIPLoader", inputs: { clip_name: CLIP, type: "krea2", device: "default" } },
    "3": { class_type: "VAELoader", inputs: { vae_name: VAE } },
    "4": { class_type: "CLIPTextEncode", inputs: { clip: ["2", 0], text: texto } },
    "5": { class_type: "ConditioningZeroOut", inputs: { conditioning: ["4", 0] } },
    "6": { class_type: "EmptyLatentImage", inputs: { width: LADO, height: LADO, batch_size: 1 } },
    "7": {
      class_type: "KSampler",
      inputs: {
        model: ["1", 0], positive: ["4", 0], negative: ["5", 0], latent_image: ["6", 0],
        seed, steps: 7, cfg: 1.0, sampler_name: "er_sde", scheduler: "simple", denoise: 1.0,
      },
    },
    "8": { class_type: "VAEDecode", inputs: { samples: ["7", 0], vae: ["3", 0] } },
    "15": { class_type: "SaveImage", inputs: { images: ["8", 0], filename_prefix: prefijo } },
  };
}

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

function semillaDe(texto: string): number {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) { h ^= texto.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) % 2 ** 31;
}

async function unaPasada(texto: string, id: string): Promise<Buffer> {
  const envio = await fetch(`${HOST}/prompt`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt: grafo(texto, `term-${id}`, semillaDe(id)) }),
  });
  if (!envio.ok) throw new Error(`ComfyUI rechazó el grafo (${envio.status}): ${(await envio.text()).slice(0, 160)}`);
  const { prompt_id } = (await envio.json()) as { prompt_id: string };

  for (let i = 0; i < 120; i++) {
    await dormir(350);
    const h = (await (await fetch(`${HOST}/history/${prompt_id}`)).json()) as Record<string, {
      status?: { status_str?: string };
      outputs?: Record<string, { images?: Array<{ filename: string; subfolder?: string; type?: string }> }>;
    }>;
    const registro = h[prompt_id];
    if (!registro) continue;
    if (registro.status?.status_str === "error") throw new Error(`ComfyUI falló: ${JSON.stringify(registro.status).slice(0, 160)}`);
    const img = registro.outputs?.["15"]?.images?.[0];
    if (!img) continue;
    const url = `${HOST}/view?filename=${encodeURIComponent(img.filename)}`
      + `&subfolder=${encodeURIComponent(img.subfolder ?? "")}&type=${img.type ?? "output"}`;
    return Buffer.from(await (await fetch(url)).arrayBuffer());
  }
  throw new Error(`la viñeta "${id}" no salió en dos minutos`);
}

async function generar(texto: string, id: string, intentos = 3): Promise<Buffer> {
  for (let i = 1; ; i++) {
    try { return await unaPasada(texto, id); }
    catch (e) {
      if (i >= intentos) throw e;
      console.log(`      intento ${i} falló (${(e as Error).message.slice(0, 70)}); reintentando…`);
      await dormir(3500);
    }
  }
}

function fichas(): Ficha[] {
  if (!existsSync(ENTRADA)) return [];
  const salida: Ficha[] = [];
  for (const f of readdirSync(ENTRADA).filter((f) => f.endsWith(".json"))) {
    const dato = JSON.parse(readFileSync(join(ENTRADA, f), "utf8")) as
      | { slug: string; items: Item[] }
      | { slug: string; items: Item[] }[];
    for (const d of Array.isArray(dato) ? dato : [dato]) {
      salida.push({
        slug: d.slug,
        items: d.items
          .map((it) => ({ ...it, clave: it.clave ?? (it.texto ? claveDeTermino(it.texto) : "") }))
          .filter((it) => it.clave),
      });
    }
  }
  return salida;
}

async function main() {
  const dry = process.argv.includes("--dry");
  const rehacer = process.argv.includes("--rehacer");
  const solo = process.argv.find((a) => a.startsWith("--solo="))?.slice(7);
  const lista = fichas().filter((f) => !solo || f.slug === solo);

  if (lista.length === 0) {
    console.log(`Sin fichas en ${ENTRADA}${solo ? ` para "${solo}"` : ""}.`);
    return;
  }

  const total = lista.reduce((n, f) => n + f.items.length, 0);
  if (dry) {
    for (const f of lista) {
      console.log(`\n${f.slug} (${f.items.length})`);
      for (const it of f.items) console.log(`   ${it.clave}: ${it.escena.slice(0, 110)}…`);
    }
    console.log(`\n${total} viñetas en ${lista.length} laboratorios. Nada escrito.`);
    return;
  }

  let hechas = 0, saltadas = 0;
  const fallos: string[] = [];
  const t0 = Date.now();

  for (const f of lista) {
    const dir = join(SALIDA, f.slug);
    mkdirSync(dir, { recursive: true });
    for (const it of f.items) {
      const destino = join(dir, `${it.clave}.webp`);
      if (existsSync(destino) && !rehacer) { saltadas++; continue; }
      try {
        const png = await generar(`${it.escena}. ${ESTILO}`, `${f.slug}-${it.clave}`);
        await sharp(png).resize(LADO_WEBP, LADO_WEBP, { fit: "cover" }).webp({ quality: CALIDAD }).toFile(destino);
        hechas++;
        const seg = ((Date.now() - t0) / 1000 / hechas).toFixed(1);
        console.log(`  ✓ ${f.slug}/${it.clave}  (${hechas}/${total}, ${seg}s por viñeta)`);
      } catch (e) {
        fallos.push(`${f.slug}/${it.clave}: ${(e as Error).message.slice(0, 90)}`);
        console.log(`  ✗ ${f.slug}/${it.clave}`);
      }
    }
  }

  console.log(`\n${hechas} generadas · ${saltadas} ya estaban · ${fallos.length} fallidas`);
  for (const f of fallos) console.log(`   ${f}`);
}

async function bucle() {
  // --loop: vuelve a revisar la carpeta cada minuto. Sirve para ir generando
  // mientras se escriben las escenas de los demás laboratorios.
  if (!process.argv.includes("--loop")) return main();
  for (;;) {
    await main();
    await dormir(60_000);
  }
}

void bucle();

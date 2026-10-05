/**
 * IMÁGENES DE LOS SIMULADORES (labs de arrastre convertidos, ver docs/ESTANDAR-LABS.md §4).
 *
 * Los agentes que convierten un lab no ejecutan ComfyUI (la GPU es una sola):
 * escriben la escena de cada imagen en `data/escenas-fotos/<slug>.json` y este
 * script las genera en lote, de una en una.
 *
 * Entrada: { "slug": "...", "items": [{ "clave", "formato": "16:9"|"1:1", "estilo": "foto"|"ilustracion", "escena" }] }
 * Salida:  public/media/labs-sim/<slug>/<clave>.webp
 *
 * Uso: npx tsx scripts/generar-imagenes-sim.ts [--solo=slug] [--rehacer] [--semilla=N]
 * Requiere ComfyUI escuchando en 127.0.0.1:8188.
 */
import { resolve, join } from "path";
import { existsSync, mkdirSync, readdirSync, readFileSync } from "fs";
import sharp from "sharp";

const HOST = "http://127.0.0.1:8188";
const UNET = "krea2TurboOfficialComfy_krea2TurboFp8.safetensors";
const CLIP = "qwen3vl_4b_fp8_scaled.safetensors";
const VAE = "qwen_image_vae.safetensors";

const ENTRADA = resolve(process.cwd(), "data", "escenas-fotos");
const SALIDA = resolve(process.cwd(), "public", "media", "labs-sim");

const SIN_TEXTO = "No text, no letters, no numbers, no watermark, no logos, no signage, no captions.";
const ESTILOS = {
  foto: "Candid documentary photograph, natural light, realistic colours, slight grain, sharp subject.",
  ilustracion: "Clean modern editorial illustration, soft shading, friendly rounded shapes, rich but calm colours, plain background.",
} as const;
const FORMATOS = {
  "16:9": { gen: [1024, 576], out: [900, 506] },
  "1:1": { gen: [768, 768], out: [600, 600] },
} as const;

interface Item { clave: string; formato?: keyof typeof FORMATOS; estilo?: keyof typeof ESTILOS; escena: string }

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

function grafo(texto: string, prefijo: string, seed: number, w: number, h: number) {
  return {
    "1": { class_type: "UNETLoader", inputs: { unet_name: UNET, weight_dtype: "default" } },
    "2": { class_type: "CLIPLoader", inputs: { clip_name: CLIP, type: "krea2", device: "default" } },
    "3": { class_type: "VAELoader", inputs: { vae_name: VAE } },
    "4": { class_type: "CLIPTextEncode", inputs: { clip: ["2", 0], text: texto } },
    "5": { class_type: "ConditioningZeroOut", inputs: { conditioning: ["4", 0] } },
    "6": { class_type: "EmptyLatentImage", inputs: { width: w, height: h, batch_size: 1 } },
    "7": { class_type: "KSampler", inputs: { model: ["1", 0], positive: ["4", 0], negative: ["5", 0], latent_image: ["6", 0], seed, steps: 7, cfg: 1.0, sampler_name: "er_sde", scheduler: "simple", denoise: 1.0 } },
    "8": { class_type: "VAEDecode", inputs: { samples: ["7", 0], vae: ["3", 0] } },
    "15": { class_type: "SaveImage", inputs: { images: ["8", 0], filename_prefix: prefijo } },
  };
}

async function generar(texto: string, id: string, seed: number, w: number, h: number): Promise<Buffer> {
  const envio = await fetch(`${HOST}/prompt`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ prompt: grafo(texto, `sim-${id}`, seed, w, h) }) });
  if (!envio.ok) throw new Error(`ComfyUI rechazó el grafo (${envio.status})`);
  const { prompt_id } = (await envio.json()) as { prompt_id: string };
  for (let i = 0; i < 400; i++) {
    await dormir(500);
    const hist = (await (await fetch(`${HOST}/history/${prompt_id}`)).json()) as Record<string, { status?: { status_str?: string }; outputs?: Record<string, { images?: Array<{ filename: string; subfolder?: string; type?: string }> }> }>;
    const r = hist[prompt_id];
    if (!r) continue;
    if (r.status?.status_str === "error") throw new Error("ComfyUI falló");
    const img = r.outputs?.["15"]?.images?.[0];
    if (!img) continue;
    const url = `${HOST}/view?filename=${encodeURIComponent(img.filename)}&subfolder=${encodeURIComponent(img.subfolder ?? "")}&type=${img.type ?? "output"}`;
    return Buffer.from(await (await fetch(url)).arrayBuffer());
  }
  throw new Error(`"${id}" no salió a tiempo`);
}

async function main() {
  const rehacer = process.argv.includes("--rehacer");
  const solo = process.argv.find((a) => a.startsWith("--solo="))?.slice(7);
  const semilla = Number(process.argv.find((a) => a.startsWith("--semilla="))?.slice(10) ?? 1234);
  if (!existsSync(ENTRADA)) return console.log("Sin escenas.");
  let hechas = 0, fallas = 0;
  for (const archivo of readdirSync(ENTRADA).filter((f) => f.endsWith(".json"))) {
    const { slug, items } = JSON.parse(readFileSync(join(ENTRADA, archivo), "utf8")) as { slug: string; items: Item[] };
    if (solo && slug !== solo) continue;
    const dir = join(SALIDA, slug);
    mkdirSync(dir, { recursive: true });
    for (const it of items) {
      const destino = join(dir, `${it.clave}.webp`);
      if (existsSync(destino) && !rehacer) continue;
      const f = FORMATOS[it.formato ?? "16:9"] ?? FORMATOS["16:9"];
      const estilo = ESTILOS[it.estilo ?? "foto"] ?? ESTILOS.foto;
      try {
        const png = await generar(`${it.escena}. ${estilo} ${SIN_TEXTO}`, `${slug}-${it.clave}`, semilla, f.gen[0], f.gen[1]);
        let q = 80;
        let buf = await sharp(png).resize(f.out[0], f.out[1], { fit: "cover" }).webp({ quality: q }).toBuffer();
        while (buf.length > 140_000 && q > 50) { q -= 8; buf = await sharp(png).resize(f.out[0], f.out[1], { fit: "cover" }).webp({ quality: q }).toBuffer(); }
        await sharp(buf).toFile(destino);
        hechas++;
        console.log(`✓ ${slug}/${it.clave} (${(buf.length / 1024).toFixed(0)} KB)`);
      } catch (e) {
        fallas++;
        console.log(`✘ ${slug}/${it.clave}: ${(e as Error).message}`);
      }
    }
  }
  console.log(`listo: ${hechas} generadas, ${fallas} fallas`);
}
void main();

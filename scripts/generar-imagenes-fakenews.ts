/**
 * Fotos del simulador de verificación (LabFakeNews, «deteccion-fake-news»).
 * Estilo FOTOPERIODÍSTICO (no plastilina). Escenas escritas a mano, sin texto,
 * sin marcas y sin regalar el veredicto. Un solo trabajo a la vez en ComfyUI.
 *
 * Salida: public/media/labs-fakenews/<clave>.webp (900 px de ancho, 16:9).
 * Uso: npx tsx scripts/generar-imagenes-fakenews.ts [--solo=clave] [--rehacer] [--semilla=N]
 */
import { resolve, join } from "path";
import { existsSync, mkdirSync } from "fs";
import sharp from "sharp";

const HOST = "http://127.0.0.1:8188";
const UNET = "krea2TurboOfficialComfy_krea2TurboFp8.safetensors";
const CLIP = "qwen3vl_4b_fp8_scaled.safetensors";
const VAE = "qwen_image_vae.safetensors";
const SALIDA = resolve(process.cwd(), "public", "media", "labs-fakenews");

const ESTILO = [
  "Candid photojournalistic photograph taken with a smartphone or a news camera, natural daylight, realistic colours, slight grain, documentary look, sharp subject.",
  "No text, no letters, no numbers, no watermark, no logos, no signage, no captions.",
].join(" ");

const ESCENAS: { clave: string; escena: string }[] = [
  { clave: "inundacion", escena: "A flooded city street with muddy brown water up to the doors of parked cars, a few people wading carefully along the pavement, low two-storey houses and power lines, overcast sky" },
  { clave: "remedio", escena: "A wooden kitchen table with a glass jar of honey, whole lemons, garlic bulbs, a piece of ginger root and a steaming clay mug, soft window light" },
  { clave: "aviso", escena: "A closed cream-coloured folder with a plain round red wax seal and a blue ribbon, lying on a clean office desk next to a pen and a smartphone, the folder cover is blank and smooth, shallow depth of field" },
  { clave: "obra", escena: "Municipal workers in orange vests and hard hats repairing a broken water pipe in a trench in a city street, traffic cones, a yellow excavator, a water truck, clear morning" },
  { clave: "ciclovia", escena: "A wide city avenue with a painted bicycle lane, several cyclists riding in the lane, trees along the avenue, buses in the background, afternoon sun" },
  { clave: "paloma", escena: "A grey pigeon standing on a wooden podium with two microphones in front of the steps of a stone town hall building, a small crowd of blurred people in the background, funny but realistic" },
];

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

function grafo(texto: string, prefijo: string, seed: number) {
  return {
    "1": { class_type: "UNETLoader", inputs: { unet_name: UNET, weight_dtype: "default" } },
    "2": { class_type: "CLIPLoader", inputs: { clip_name: CLIP, type: "krea2", device: "default" } },
    "3": { class_type: "VAELoader", inputs: { vae_name: VAE } },
    "4": { class_type: "CLIPTextEncode", inputs: { clip: ["2", 0], text: texto } },
    "5": { class_type: "ConditioningZeroOut", inputs: { conditioning: ["4", 0] } },
    "6": { class_type: "EmptyLatentImage", inputs: { width: 1024, height: 576, batch_size: 1 } },
    "7": { class_type: "KSampler", inputs: { model: ["1", 0], positive: ["4", 0], negative: ["5", 0], latent_image: ["6", 0], seed, steps: 7, cfg: 1.0, sampler_name: "er_sde", scheduler: "simple", denoise: 1.0 } },
    "8": { class_type: "VAEDecode", inputs: { samples: ["7", 0], vae: ["3", 0] } },
    "15": { class_type: "SaveImage", inputs: { images: ["8", 0], filename_prefix: prefijo } },
  };
}

async function generar(texto: string, id: string, seed: number): Promise<Buffer> {
  const envio = await fetch(`${HOST}/prompt`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ prompt: grafo(texto, `fn-${id}`, seed) }) });
  if (!envio.ok) throw new Error(`ComfyUI rechazó el grafo (${envio.status})`);
  const { prompt_id } = (await envio.json()) as { prompt_id: string };
  for (let i = 0; i < 400; i++) {
    await dormir(500);
    const h = (await (await fetch(`${HOST}/history/${prompt_id}`)).json()) as Record<string, { status?: { status_str?: string }; outputs?: Record<string, { images?: Array<{ filename: string; subfolder?: string; type?: string }> }> }>;
    const r = h[prompt_id];
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
  mkdirSync(SALIDA, { recursive: true });
  for (const e of ESCENAS.filter((x) => !solo || x.clave === solo)) {
    const destino = join(SALIDA, `${e.clave}.webp`);
    if (existsSync(destino) && !rehacer) { console.log(`= ${e.clave} ya estaba`); continue; }
    const png = await generar(`${e.escena}. ${ESTILO}`, e.clave, semilla);
    let calidad = 80;
    let buf = await sharp(png).resize(900, 506, { fit: "cover" }).webp({ quality: calidad }).toBuffer();
    while (buf.length > 145_000 && calidad > 50) { calidad -= 8; buf = await sharp(png).resize(900, 506, { fit: "cover" }).webp({ quality: calidad }).toBuffer(); }
    await sharp(buf).toFile(destino);
    console.log(`✓ ${e.clave} (${(buf.length / 1024).toFixed(0)} KB, q${calidad})`);
  }
}
void main();

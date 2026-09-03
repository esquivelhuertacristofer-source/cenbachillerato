/**
 * GENERA LA CARÁTULA PROPIA DE UN LABORATORIO.
 *
 * `generar-imagenes-faltantes.ts` sólo cubre actividades: entra por la tabla
 * `actividades` y escribe `contenido.url_imagen`. Los laboratorios no tienen
 * fila propia —su carátula vive en disco y la resuelve `lab-imagenes.ts`—, así
 * que necesitan esta variante. Comparte lo que importa: el mismo modelo, el
 * mismo grafo mínimo armado a mano, la MISMA ficha de estilo y la misma semilla
 * estable por nombre, para que las carátulas nuevas no desentonen con las 137
 * que ya están.
 *
 * La escena se escribe a mano, aquí abajo. Un prompt hecho con el título del
 * laboratorio da borrones: hay que nombrar objetos que se puedan poner sobre
 * una mesa.
 *
 * Después de generar hay que registrar el slug en el `Set` del semestre en
 * `src/lib/practicas/lab-imagenes.ts`, o el archivo queda en disco sin que
 * nadie lo pida.
 *
 * Requiere ComfyUI escuchando en 127.0.0.1:8188.
 *
 * Uso:
 *   npx tsx scripts/generar-caratula-lab.ts --dry
 *   npx tsx scripts/generar-caratula-lab.ts [--solo=slug] [--rehacer]
 */
import { resolve } from "path";
import { existsSync, mkdirSync } from "fs";
import sharp from "sharp";

const HOST = "http://127.0.0.1:8188";
const UNET = "krea2TurboOfficialComfy_krea2TurboFp8.safetensors";
const CLIP = "qwen3vl_4b_fp8_scaled.safetensors";
const VAE = "qwen_image_vae.safetensors";

const PUBLIC_DIR = resolve(process.cwd(), "public");
const ANCHO = 1216, ALTO = 832;
/** Mismo ancho final que las carátulas ya publicadas (800 px). */
const ANCHO_WEBP = 800;
const CALIDAD = 80;

/** La ficha de estilo de CEN Bachillerato — copiada tal cual, no reescribir. */
const ESTILO = [
  "Soft matte plasticine clay 3D render, handmade stop-motion diorama,",
  "rounded chunky shapes modelled in coloured modelling clay with a slightly soft matte surface,",
  "warm muted pastel palette of dusty terracotta, sage green, soft blue and cream,",
  "plain softly graded studio backdrop, gentle diffuse light with a warm glow and one soft contact shadow,",
  "calm uncluttered composition with generous empty space, the subject centred, large and fully lit,",
  "friendly educational illustration, polished like a stop-motion short film.",
  "No text, no letters, no numbers, no watermark, no logos, no signage, no UI.",
].join(" ");

interface Caratula { slug: string; semestre: number; escena: string }

/**
 * Los laboratorios que todavía comparten una foto de tema con otros. La escena
 * describe objetos concretos, no el tema en abstracto.
 */
const PENDIENTES: Caratula[] = [
  {
    slug: "biomas-ecosistemas",
    semestre: 3,
    escena:
      "A round clay diorama island split into four quarters like a cake, each quarter a different biome: " +
      "dark green pine trees on snow, a yellow sand dune with a tall cactus, a dense emerald rainforest with " +
      "broad leaves, and a flat golden grassland with a small acacia tree; tiny clay animals stand on each quarter",
  },
  {
    slug: "ciclo-carbono",
    semestre: 3,
    escena:
      "A clay landscape with a leafy green tree on the left, a small factory with a chimney on the right and " +
      "a curl of grey clay smoke, a strip of blue sea in front and dark brown soil underneath showing a buried " +
      "black seam; thick rounded clay arrows loop between the tree, the smoke, the sea and the soil",
  },
  {
    // CS-III-P01, el laboratorio que estaba escrito y sin enganchar. Su
    // lectura A1 analiza la crisis de la pandemia: causas, actores y
    // consecuencias, que es lo que la escena pone sobre la mesa.
    slug: "crisis-sociales",
    semestre: 4,
    escena:
      "A clay tabletop model of a small city street: a shop with its metal shutter rolled down, a low white " +
      "hospital building with a red cross on the wall, and three tiny clay figures standing apart from each " +
      "other — a nurse in blue scrubs, a person carrying a cloth bag of groceries, and a figure behind a small " +
      "lectern; a thick red clay arrow bends downward over the rooftops",
  },
  {
    slug: "subsistemas-terrestres",
    semestre: 3,
    escena:
      "A clay model of the Earth cut open like a wedge on a table, showing four stacked layers: brown rock, " +
      "blue water, a pale translucent shell of air with small white clouds, and a green surface with tiny trees " +
      "and a deer; each layer is a distinct band of coloured clay",
  },
];

interface Grafo { [k: string]: { class_type: string; inputs: Record<string, unknown> } }

function grafo(texto: string, prefijo: string, seed: number): Grafo {
  return {
    "1": { class_type: "UNETLoader", inputs: { unet_name: UNET, weight_dtype: "default" } },
    "2": { class_type: "CLIPLoader", inputs: { clip_name: CLIP, type: "krea2", device: "default" } },
    "3": { class_type: "VAELoader", inputs: { vae_name: VAE } },
    "4": { class_type: "CLIPTextEncode", inputs: { clip: ["2", 0], text: texto } },
    "5": { class_type: "ConditioningZeroOut", inputs: { conditioning: ["4", 0] } },
    "6": { class_type: "EmptyLatentImage", inputs: { width: ANCHO, height: ALTO, batch_size: 1 } },
    "7": {
      class_type: "KSampler",
      inputs: {
        model: ["1", 0], positive: ["4", 0], negative: ["5", 0], latent_image: ["6", 0],
        seed, steps: 8, cfg: 1.0, sampler_name: "er_sde", scheduler: "simple", denoise: 1.0,
      },
    },
    "8": { class_type: "VAEDecode", inputs: { samples: ["7", 0], vae: ["3", 0] } },
    "15": { class_type: "SaveImage", inputs: { images: ["8", 0], filename_prefix: prefijo } },
  };
}

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Semilla estable por slug: relanzar da la MISMA imagen. */
function semillaDe(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) { h ^= slug.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) % 2 ** 31;
}

async function unaPasada(texto: string, slug: string): Promise<Buffer> {
  const envio = await fetch(`${HOST}/prompt`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt: grafo(texto, `lab-${slug}`, semillaDe(slug)) }),
  });
  if (!envio.ok) throw new Error(`ComfyUI rechazó el grafo (${envio.status}): ${(await envio.text()).slice(0, 200)}`);
  const { prompt_id } = (await envio.json()) as { prompt_id: string };

  for (let i = 0; i < 120; i++) {
    await dormir(1500);
    const h = (await (await fetch(`${HOST}/history/${prompt_id}`)).json()) as Record<string, {
      status?: { status_str?: string };
      outputs?: Record<string, { images?: Array<{ filename: string; subfolder?: string; type?: string }> }>;
    }>;
    const registro = h[prompt_id];
    if (!registro) continue;
    if (registro.status?.status_str === "error") {
      throw new Error(`ComfyUI falló: ${JSON.stringify(registro.status).slice(0, 200)}`);
    }
    const img = registro.outputs?.["15"]?.images?.[0];
    if (!img) continue;
    const url = `${HOST}/view?filename=${encodeURIComponent(img.filename)}`
      + `&subfolder=${encodeURIComponent(img.subfolder ?? "")}&type=${img.type ?? "output"}`;
    return Buffer.from(await (await fetch(url)).arrayBuffer());
  }
  throw new Error(`la carátula "${slug}" no salió en tres minutos`);
}

/** ComfyUI tira la conexión al cargar el modelo o liberar VRAM; se reintenta. */
async function generar(texto: string, slug: string, intentos = 3): Promise<Buffer> {
  for (let i = 1; ; i++) {
    try { return await unaPasada(texto, slug); }
    catch (e) {
      if (i >= intentos) throw e;
      console.log(`    intento ${i} falló (${(e as Error).message.slice(0, 80)}); reintentando…`);
      await dormir(4000);
    }
  }
}

async function main() {
  const dry = process.argv.includes("--dry");
  const rehacer = process.argv.includes("--rehacer");
  const solo = process.argv.find((a) => a.startsWith("--solo="))?.slice(7);
  const lista = PENDIENTES.filter((c) => !solo || c.slug === solo);

  if (dry) {
    for (const c of lista) console.log(`${c.slug} (sem${c.semestre})\n   ${c.escena}\n`);
    console.log(`${lista.length} carátulas. Nada escrito.`);
    return;
  }

  let hechas = 0;
  const fallos: string[] = [];
  for (const c of lista) {
    const dirRel = `media/sem${c.semestre}/labs`;
    const destino = resolve(PUBLIC_DIR, dirRel, `${c.slug}.webp`);
    if (existsSync(destino) && !rehacer) { console.log(`  = ${c.slug}: ya existe`); continue; }
    try {
      const png = await generar(`${c.escena}. ${ESTILO}`, c.slug);
      mkdirSync(resolve(PUBLIC_DIR, dirRel), { recursive: true });
      await sharp(png).resize({ width: ANCHO_WEBP, withoutEnlargement: true })
        .webp({ quality: CALIDAD }).toFile(destino);
      hechas++;
      console.log(`  ✓ ${c.slug} → /${dirRel}/${c.slug}.webp`);
    } catch (e) {
      fallos.push(`${c.slug}: ${(e as Error).message.slice(0, 100)}`);
    }
  }

  console.log(`\ngeneradas ${hechas}  fallos ${fallos.length}`);
  for (const f of fallos) console.log(`  FALLO ${f}`);
  if (hechas > 0) {
    console.log("\nFalta registrarlas en src/lib/practicas/lab-imagenes.ts:");
    for (const c of lista) console.log(`  LABS_CON_IMAGEN_ESPECIFICA_SEM${c.semestre} ← "${c.slug}"`);
  }
  if (fallos.length) process.exit(1);
}

main().catch((err) => { console.error("ERROR:", err.message); process.exit(1); });

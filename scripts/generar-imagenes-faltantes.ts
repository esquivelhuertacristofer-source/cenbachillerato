/**
 * GENERA LAS IMÁGENES QUE FALTAN, CON EL MISMO MOTOR Y EL MISMO ESTILO QUE LAS
 * 2 135 QUE YA ESTÁN.
 *
 * Portado de `scripts/krea2-lib.mjs` de la plataforma de robótica, que a su vez
 * viene del pipeline de la plataforma de tecnología. Dos decisiones que se
 * conservan porque ya costaron caro allá:
 *
 * 1. NO se carga el `.json` de workflow exportado por ComfyUI. El grafo mínimo
 *    se arma aquí, a mano. Un workflow exportado arrastra nodos en bypass, y
 *    basta con que alguien abra la UI y mueva algo para que el lote siguiente
 *    salga distinto sin que nadie se entere.
 * 2. `steps: 8` con `cfg: 1.0`. Es lo que pide el modelo *turbo*. Subirlos no
 *    mejora la imagen, la quema.
 *
 * LA FICHA DE ESTILO ES LO ÚNICO QUE HACE QUE 2 230 IMÁGENES PAREZCAN DE LA
 * MISMA SERIE, y por eso vive en UNA constante que nadie debe reescribir por
 * imagen. Está copiada de lo que se ve en las imágenes ya publicadas: plastilina
 * mate, paleta cálida apagada, fondo degradado liso, sin una sola letra.
 *
 * EL PROMPT NO SALE DEL TÍTULO. Se intentó —el encoder `qwen3vl_4b` es
 * multilingüe— y las tres imágenes de prueba salieron idénticas: seis bultos de
 * plastilina sobre fondo liso. Un título como "Comunicación digital: alcance y
 * medios" no nombra ningún objeto que se pueda poner en una mesa, así que el
 * modelo aplicó el estilo y descartó el sujeto. La escena física de cada
 * actividad se escribe a mano en `escenas-imagenes.ts`, y sin escena no se
 * genera nada.
 *
 * IDEMPOTENTE: salta lo que ya tiene archivo. Se puede interrumpir.
 *
 * Requiere ComfyUI escuchando en 127.0.0.1:8188 con los tres modelos.
 *
 * Uso:
 *   npx tsx scripts/generar-imagenes-faltantes.ts --dry
 *   npx tsx scripts/generar-imagenes-faltantes.ts --limite 3
 *   npx tsx scripts/generar-imagenes-faltantes.ts
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { existsSync, mkdirSync } from "fs";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";
import { ESCENAS } from "./escenas-imagenes";

loadEnv({ path: resolve(process.cwd(), ".env.local") });

const DRY = process.argv.includes("--dry");
const LIMITE = process.argv.includes("--limite")
  ? Number(process.argv[process.argv.indexOf("--limite") + 1])
  : null;

const HOST = "http://127.0.0.1:8188";
/** Los tres archivos exactos. Si alguno falta, el error tiene que ser claro. */
const UNET = "krea2TurboOfficialComfy_krea2TurboFp8.safetensors";
const CLIP = "qwen3vl_4b_fp8_scaled.safetensors";
const VAE = "qwen_image_vae.safetensors";

const PUBLIC_DIR = resolve(process.cwd(), "public");
const ANCHO = 1216, ALTO = 832;
/** Ancho final del WebP: es la anchura máxima de la columna de actividad. */
const ANCHO_WEBP = 800;
const CALIDAD = 80;

/** La ficha de estilo de CEN Bachillerato. Va pegada al final de CADA prompt. */
const ESTILO = [
  "Soft matte plasticine clay 3D render, handmade stop-motion diorama,",
  "rounded chunky shapes modelled in coloured modelling clay with a slightly soft matte surface,",
  "warm muted pastel palette of dusty terracotta, sage green, soft blue and cream,",
  "plain softly graded studio backdrop, gentle diffuse light with a warm glow and one soft contact shadow,",
  "calm uncluttered composition with generous empty space, the subject centred, large and fully lit,",
  "friendly educational illustration, polished like a stop-motion short film.",
  "No text, no letters, no numbers, no watermark, no logos, no signage, no UI.",
].join(" ");

/** Carpeta de `public/media/semN/` según el tipo de actividad. */
const CARPETA: Record<string, string> = {
  lectura: "lecturas",
  quiz_multiple_opcion: "quiz_multiple_opcion",
  quiz_verdadero_falso: "quiz_verdadero_falso",
  fill_blanks: "fill_blanks",
  ejercicio_matematico: "ejercicio_matematico",
  reflexion_escrita: "reflexion_escrita",
  debate_estructurado: "debate_estructurado",
  glosario_interactivo: "glosario_interactivo",
  autoevaluacion: "autoevaluacion",
};

/**
 * LA ESCENA DE UNA ACTIVIDAD, O NADA.
 *
 * Se probó derivarla del título en español y el modelo devolvió imágenes
 * idénticas de bultos de plastilina: un título como "Comunicación digital:
 * alcance y medios" no nombra ningún objeto que se pueda poner en una mesa, así
 * que el modelo aplicó la ficha de estilo y descartó el sujeto.
 *
 * Si una actividad no tiene escena escrita en `escenas-imagenes.ts`, NO se
 * genera nada. Una imagen bonita que no ilustra la actividad es peor que la
 * imagen temática de respaldo que el componente ya sabe poner: ocupa el lugar
 * de la buena y nadie vuelve a revisarla.
 */
function escenaDe(codigo: string): string | null {
  return ESCENAS[codigo] ?? null;
}

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

/** Semilla estable por código: relanzar con --rehacer da la MISMA imagen. */
function semillaDe(codigo: string): number {
  let h = 2166136261;
  for (let i = 0; i < codigo.length; i++) { h ^= codigo.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) % 2 ** 31;
}

async function unaPasada(texto: string, codigo: string): Promise<Buffer> {
  const envio = await fetch(`${HOST}/prompt`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt: grafo(texto, codigo, semillaDe(codigo)) }),
  });
  if (!envio.ok) throw new Error(`ComfyUI rechazó el grafo (${envio.status}): ${(await envio.text()).slice(0, 200)}`);
  const { prompt_id } = (await envio.json()) as { prompt_id: string };

  // 120 sondeos de segundo y medio son tres minutos: de sobra para ocho pasos,
  // y corto para que un cuelgue no deje el lote plantado toda la noche.
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
  throw new Error(`la imagen "${codigo}" no salió en tres minutos`);
}

/** ComfyUI tira la conexión al cargar el modelo o liberar VRAM; se reintenta. */
async function generar(texto: string, codigo: string, intentos = 3): Promise<Buffer> {
  for (let i = 1; ; i++) {
    try { return await unaPasada(texto, codigo); }
    catch (e) {
      if (i >= intentos) throw e;
      console.log(`    intento ${i} falló (${(e as Error).message.slice(0, 80)}); reintentando…`);
      await dormir(4000);
    }
  }
}

async function main() {
  const sb = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: uacs } = await sb.from("uac").select("id, semestre");
  const { data: progs } = await sb.from("progresiones").select("id, uac_id");
  const semUac = new Map((uacs ?? []).map((u) => [u.id, u.semestre]));
  const semProg = new Map<string, number>();
  for (const p of progs ?? []) {
    const s = semUac.get(p.uac_id!);
    if (s != null) semProg.set(p.id, s);
  }

  type Act = { codigo: string; titulo: string; tipo: string; progresion_id: string | null; contenido: Record<string, unknown> };
  const acts: Act[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb
      .from("actividades").select("codigo, titulo, tipo, progresion_id, contenido")
      .in("tipo", Object.keys(CARPETA)).order("codigo").range(from, from + 999);
    if (error) throw new Error(error.message);
    if (!data?.length) break;
    acts.push(...(data as unknown as Act[]));
    if (data.length < 1000) break;
  }

  let pendientes = acts.filter((a) => !a.contenido?.url_imagen && a.progresion_id && semProg.has(a.progresion_id));
  if (LIMITE) pendientes = pendientes.slice(0, LIMITE);

  const sinEscena = pendientes.filter((a) => !escenaDe(a.codigo)).map((a) => a.codigo);
  pendientes = pendientes.filter((a) => escenaDe(a.codigo));

  console.log(`${pendientes.length} por generar | ${sinEscena.length} sin escena escrita (se dejan como están)`);
  for (const c of sinEscena) console.log(`  SIN ESCENA ${c}`);
  if (DRY) {
    for (const a of pendientes.slice(0, 6)) {
      console.log(`  ${a.codigo} [${a.tipo}]\n     ${escenaDe(a.codigo)}`);
    }
    return;
  }

  let hechas = 0, saltadas = 0;
  const fallos: string[] = [];
  for (const a of pendientes) {
    const sem = semProg.get(a.progresion_id!)!;
    const dirRel = `media/sem${sem}/${CARPETA[a.tipo]}`;
    const destino = resolve(PUBLIC_DIR, dirRel, `${a.codigo}.webp`);
    const rutaPublica = `/${dirRel}/${a.codigo}.webp`;

    if (!existsSync(destino)) {
      const prompt = `${escenaDe(a.codigo)}. ${ESTILO}`;
      try {
        const png = await generar(prompt, a.codigo);
        mkdirSync(resolve(PUBLIC_DIR, dirRel), { recursive: true });
        await sharp(png).resize({ width: ANCHO_WEBP, withoutEnlargement: true })
          .webp({ quality: CALIDAD }).toFile(destino);
        hechas++;
        console.log(`  ✓ ${hechas + saltadas}/${pendientes.length}  ${a.codigo}`);
      } catch (e) {
        fallos.push(`${a.codigo}: ${(e as Error).message.slice(0, 90)}`);
        continue;
      }
    } else {
      saltadas++;
    }

    const contenido = { ...a.contenido, url_imagen: rutaPublica };
    const { error } = await sb.from("actividades").update({ contenido }).eq("codigo", a.codigo);
    if (error) fallos.push(`${a.codigo}: update — ${error.message}`);
  }

  console.log(`\ngeneradas ${hechas}  ya estaban ${saltadas}  fallos ${fallos.length}`);
  for (const f of fallos.slice(0, 20)) console.log(`  FALLO ${f}`);
  if (fallos.length) process.exit(1);
}

main().catch((err) => { console.error("ERROR:", err.message); process.exit(1); });

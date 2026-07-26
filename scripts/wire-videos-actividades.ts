/**
 * Enlaza actividades `video_con_preguntas` con el video generado
 * (TTS + Remotion) publicado en el bucket R2 público `nem-videos`.
 * Reemplaza el placeholder `url_video = "https://www.youtube.com/embed/PENDIENTE"`
 * sembrado antes. Idempotente: re-ejecutable sin efectos.
 *
 * Los mp4 NO se sirven como asset estático de Next.js: Cloudflare Workers
 * static assets tiene un límite duro de 25 MiB por archivo y la mayoría de
 * estos videos lo supera (hasta 45 MiB). Se suben vía
 * `wrangler r2 object put nem-videos/bachillerato/<slug>.mp4` (prefijo
 * "bachillerato/" porque el bucket es compartido con el proyecto hermano
 * NEM-BASICA) y se sirven directo desde la URL pública r2.dev, sin pasar
 * por el Worker — así no consumen cuota de 100k req/día del plan Free.
 *
 * Auto-descubre el mapeo escaneando video-pipeline/out/*.mp4 (la fuente de
 * verdad de render-batch.mjs) en vez de mantener una lista a mano — cada
 * mp4 se nombra `<slug>.mp4` (mismo slug que video-pipeline/content/<slug>.json)
 * y el codigo de actividad es SIEMPRE ese slug en mayúsculas (ver
 * generar-narracion-bachillerato.py).
 *
 * Uso: npx tsx scripts/wire-videos-actividades.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { readdirSync } from "fs";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env.local") });

const VIDEOS_DIR = resolve(process.cwd(), "..", "video-pipeline", "out");
const R2_PUBLIC_BASE = "https://pub-94a8196c0c59456a89cf72193424c9d1.r2.dev/bachillerato";

function descubrirMapeo(): Record<string, string> {
  const archivos = readdirSync(VIDEOS_DIR).filter((f) => f.endsWith(".mp4"));
  const mapeo: Record<string, string> = {};
  for (const archivo of archivos) {
    const slug = archivo.replace(/\.mp4$/, "");
    mapeo[slug.toUpperCase()] = `${R2_PUBLIC_BASE}/${archivo}`;
  }
  return mapeo;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const mapeo = descubrirMapeo();
  console.log(`Encontrados ${Object.keys(mapeo).length} video(s) en ${VIDEOS_DIR}`);

  for (const [codigo, archivo] of Object.entries(mapeo)) {
    const { data: act, error: e1 } = await sb
      .from("actividades")
      .select("contenido")
      .eq("codigo", codigo)
      .single();
    if (e1 || !act) { console.error(`✗ ${codigo}: no encontrada`, e1?.message ?? ""); continue; }

    const contenidoActual = act.contenido as { url_video?: string };
    if (contenidoActual?.url_video === archivo) {
      console.log(`= ${codigo}: ya enlazada a ${archivo}`);
      continue;
    }

    const contenido = { ...(act.contenido as Record<string, unknown>), url_video: archivo };
    const { error: e2 } = await sb.from("actividades").update({ contenido }).eq("codigo", codigo);
    if (e2) { console.error(`✗ ${codigo}: update falló`, e2.message); continue; }
    console.log(`✓ ${codigo} → ${archivo}`);
  }
  console.log("Listo.");
}

main().catch((e) => { console.error(e); process.exit(1); });

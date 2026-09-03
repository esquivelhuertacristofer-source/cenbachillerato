/**
 * MINIATURAS (poster) DE LOS VIDEOS DE LA PLATAFORMA.
 *
 * El `<video>` de una actividad sin `poster` arranca en negro: hasta que el
 * alumno le da play, la tarjeta es un rectángulo vacío. La auditoría encontró
 * 196 de 211 videos así. El fotograma del segundo 2.5 de cada video es la
 * portada ya compuesta —título de la UAC, subtítulo y arte de fondo—, o sea que
 * la portada ya estaba hecha: sólo había que sacarla del MP4.
 *
 * POR QUÉ 2.5 s Y NO 0. La portada entra con animación; en el frame 0 el texto
 * todavía no está escrito. A los 2.5 s ya asentó en todos los videos medidos.
 *
 * POR QUÉ ffmpeg + sharp Y NO ffmpeg SOLO. El ffmpeg que trae el compositor de
 * Remotion —el único que hay en esta máquina— no lleva muxer de WebP. Sale PNG
 * y `sharp` lo pasa a WebP, que es el formato del resto de las imágenes.
 *
 * IDEMPOTENTE: salta el que ya tiene archivo y BD al día. Se puede interrumpir.
 *
 * Uso:
 *   npx tsx scripts/generar-miniaturas-video.ts            (solo lo que falta)
 *   npx tsx scripts/generar-miniaturas-video.ts --rehacer  (todos otra vez)
 *   npx tsx scripts/generar-miniaturas-video.ts --dry      (no escribe nada)
 */
import { config as loadEnv } from "dotenv";
import { resolve, basename } from "path";
import { existsSync, mkdirSync, readFileSync, unlinkSync } from "fs";
import { execFileSync } from "child_process";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

loadEnv({ path: resolve(process.cwd(), ".env.local") });

const REHACER = process.argv.includes("--rehacer");
const DRY = process.argv.includes("--dry");

const RAIZ_VIDEOS = resolve(process.cwd(), "../video-pipeline/out");
const FFMPEG = resolve(
  process.cwd(),
  "../video-pipeline/remotion/node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe"
);
const PUBLIC_DIR = resolve(process.cwd(), "public");
const TMP = resolve(process.cwd(), "scripts/out/.frames");

/** Segundo del que se saca la portada. */
const SEGUNDO = 2.5;
/** Ancho del WebP. El `<video>` nunca pasa de ~900 px en el hub. */
const ANCHO = 960;
const CALIDAD = 78;

type Act = {
  codigo: string;
  progresion_id: string | null;
  contenido: Record<string, unknown>;
};

async function main() {
  if (!existsSync(FFMPEG)) throw new Error(`No hay ffmpeg en ${FFMPEG}`);

  const sb = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: uacs } = await sb.from("uac").select("id, semestre");
  const { data: progs } = await sb.from("progresiones").select("id, uac_id");
  const semDeProg = new Map<string, number>();
  const semUac = new Map((uacs ?? []).map((u) => [u.id, u.semestre]));
  for (const p of progs ?? []) {
    const s = semUac.get(p.uac_id!);
    if (s != null) semDeProg.set(p.id, s);
  }

  const acts: Act[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb
      .from("actividades")
      .select("codigo, progresion_id, contenido")
      .eq("tipo", "video_con_preguntas")
      .order("codigo")
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    if (!data?.length) break;
    acts.push(...(data as unknown as Act[]));
    if (data.length < 1000) break;
  }

  mkdirSync(TMP, { recursive: true });
  let hechas = 0, saltadas = 0, publicadas = 0;
  const fallos: string[] = [];

  for (const a of acts) {
    const sem = a.progresion_id ? semDeProg.get(a.progresion_id) : null;
    if (sem == null) { fallos.push(`${a.codigo}: sin semestre`); continue; }

    const urlVideo = a.contenido?.url_video as string | undefined;
    if (!urlVideo) { fallos.push(`${a.codigo}: sin url_video`); continue; }
    const mp4 = resolve(RAIZ_VIDEOS, basename(new URL(urlVideo).pathname));
    if (!existsSync(mp4)) { fallos.push(`${a.codigo}: falta ${basename(mp4)}`); continue; }

    const dirRel = `media/sem${sem}/video_con_preguntas`;
    const destino = resolve(PUBLIC_DIR, dirRel, `${a.codigo}.webp`);
    const rutaPublica = `/${dirRel}/${a.codigo}.webp`;

    if (!REHACER && existsSync(destino)) {
      saltadas++;
    } else if (!DRY) {
      const png = resolve(TMP, `${a.codigo}.png`);
      try {
        execFileSync(FFMPEG, [
          "-v", "error", "-ss", String(SEGUNDO), "-i", mp4,
          "-frames:v", "1", "-y", png,
        ], { stdio: "pipe" });
        mkdirSync(resolve(PUBLIC_DIR, dirRel), { recursive: true });
        await sharp(readFileSync(png))
          .resize({ width: ANCHO, withoutEnlargement: true })
          .webp({ quality: CALIDAD })
          .toFile(destino);
        unlinkSync(png);
        hechas++;
      } catch (err) {
        fallos.push(`${a.codigo}: ffmpeg/sharp — ${(err as Error).message.slice(0, 80)}`);
        continue;
      }
    }

    if (a.contenido?.url_miniatura !== rutaPublica && !DRY) {
      const contenido = { ...a.contenido, url_miniatura: rutaPublica };
      const { error } = await sb.from("actividades").update({ contenido }).eq("codigo", a.codigo);
      if (error) { fallos.push(`${a.codigo}: update — ${error.message}`); continue; }
      publicadas++;
    }
  }

  console.log(
    `\nMiniaturas: ${hechas} generadas | ${saltadas} ya estaban | ${publicadas} publicadas en BD | ${fallos.length} fallos`
  );
  for (const f of fallos.slice(0, 30)) console.log(`  FALLO ${f}`);
  if (fallos.length > 30) console.log(`  ...y ${fallos.length - 30} más`);
}

main().catch((err) => { console.error("ERROR:", err.message); process.exit(1); });

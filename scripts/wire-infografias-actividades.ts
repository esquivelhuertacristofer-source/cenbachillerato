/**
 * Enlaza actividades `infografia` existentes con la lámina real cuyo tema
 * coincide EXACTAMENTE (mismo UAC, mismo semestre, mismo concepto). Solo
 * coincidencias de alta confianza — el resto de láminas vive en el carrusel
 * de Biblioteca. Idempotente: re-ejecutable sin efectos.
 *
 * Uso: npx tsx scripts/wire-infografias-actividades.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env.local") });

/** codigo de actividad → ruta pública de la lámina real (verbatim, tema idéntico). */
const MAPEO: Record<string, string> = {
  // imagen 10 — "Tipos de reacciones químicas" (CNEYT-IV · S4)
  "CNEYT-IV-P02-A1": "/biblioteca/infografias/10.webp",
  // imagen 19 — "El círculo unitario" (PM-IV · S4)
  "PM-IV-P04-A1": "/biblioteca/infografias/19.webp",
};

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  for (const [codigo, archivo] of Object.entries(MAPEO)) {
    const { data: act, error: e1 } = await sb
      .from("actividades")
      .select("contenido")
      .eq("codigo", codigo)
      .single();
    if (e1 || !act) { console.error(`✗ ${codigo}: no encontrada`, e1?.message ?? ""); continue; }

    const contenido = { ...(act.contenido as Record<string, unknown>), url_imagen: archivo };
    if ((act.contenido as { url_imagen?: string })?.url_imagen === archivo) {
      console.log(`= ${codigo}: ya enlazada a ${archivo}`);
      continue;
    }

    const { error: e2 } = await sb.from("actividades").update({ contenido }).eq("codigo", codigo);
    if (e2) { console.error(`✗ ${codigo}: update falló`, e2.message); continue; }
    console.log(`✓ ${codigo} → ${archivo}`);
  }
  console.log("Listo.");
}

main().catch((e) => { console.error(e); process.exit(1); });

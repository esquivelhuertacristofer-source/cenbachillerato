/**
 * apply-infografias-biblioteca.ts
 *
 * Cablea las infografías reales (public/biblioteca/infografias/NN.png) a su ficha
 * en `fichas_biblioteca`. Idempotente y re-ejecutable: solo procesa los NN.png que
 * EXISTEN en disco; el resto se salta (conservan el placeholder oscuro).
 *
 * Para cada ficha presente:
 *   - sustituye la url de la primera sección `tipo:"imagen"` por /biblioteca/infografias/NN.png
 *   - usa la misma imagen como `imagen_destacada` (portada de la card)
 *   - marca `es_placeholder = false`
 *
 * Correr:  npx tsx scripts/apply-infografias-biblioteca.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { existsSync } from "fs";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env.local") });

// NN (dos dígitos, como el archivo) -> slug de la ficha en BD.
// Verificado contra los seeds de biblioteca (slug exacto) y el _INDICE.txt.
const MAPPING: Record<string, string> = {
  "01": "cneyt-i-tabla-periodica",
  "02": "cneyt-i-metodo-cientifico",
  "03": "cneyt-i-materia-y-sus-estados",
  "04": "cneyt-ii-transformaciones-energeticas",
  "05": "cneyt-ii-energias-renovables-mexico",
  "06": "cneyt-iii-sistema-terrestre-subsistemas",
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en .env.local");
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (const [num, slug] of Object.entries(MAPPING)) {
    const file = resolve(process.cwd(), `public/biblioteca/infografias/${num}.webp`);
    if (!existsSync(file)) {
      console.log(`· ${num} → (sin archivo, se salta) ${slug}`);
      skip++;
      continue;
    }
    const publicUrl = `/biblioteca/infografias/${num}.webp`;

    const { data: ficha, error } = await sb
      .from("fichas_biblioteca")
      .select("id, slug, titulo, contenido, imagen_destacada, es_placeholder")
      .eq("slug", slug)
      .single();

    if (error || !ficha) {
      console.error(`✗ ${num} ERROR buscando ficha "${slug}": ${error?.message ?? "no encontrada"}`);
      fail++;
      continue;
    }

    const contenido = (ficha.contenido ?? {}) as { secciones?: Array<Record<string, unknown>> };
    const secciones = Array.isArray(contenido.secciones) ? contenido.secciones : [];

    let placed = false;
    for (const s of secciones) {
      if (s.tipo === "imagen") {
        s.url = publicUrl;
        placed = true;
        break;
      }
    }
    if (!placed) {
      secciones.push({ tipo: "imagen", url: publicUrl, alt: ficha.titulo });
      console.warn(`  (${slug} no tenía sección imagen; se agregó una)`);
    }

    const { error: upErr } = await sb
      .from("fichas_biblioteca")
      .update({
        contenido: { ...contenido, secciones },
        imagen_destacada: publicUrl,
        es_placeholder: false,
      })
      .eq("id", ficha.id);

    if (upErr) {
      console.error(`✗ ${num} ERROR actualizando "${slug}": ${upErr.message}`);
      fail++;
      continue;
    }

    console.log(`✓ ${num} → ${slug}  (cuerpo + portada + es_placeholder=false)`);
    ok++;
  }

  console.log(`\nResumen: ${ok} aplicadas, ${skip} saltadas (sin archivo), ${fail} con error.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

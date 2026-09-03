/**
 * Quita de la BD las rutas de imagen que apuntan a archivos borrados.
 *
 * `/placeholder/infografia.svg` no existe en `public/` desde hace meses: los SVG
 * de relleno se borraron y quedaron 27 filas apuntando a ellos. Los componentes
 * aprendieron a detectar la palabra "placeholder" y esquivarla, que es una
 * curita: el dato en la base sigue siendo mentira y cualquier consumidor nuevo
 * —un export, un reporte, una app futura— vuelve a tropezar con él.
 *
 * Se pone `url_imagen` en null. La infografía se dibuja con sus propios datos
 * (LaminaInfografia.tsx), así que no pierde nada.
 *
 * Uso: npx tsx scripts/limpiar-placeholders-imagen.ts [--dry]
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

loadEnv({ path: resolve(process.cwd(), ".env.local") });
const DRY = process.argv.includes("--dry");

async function main() {
  const sb = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const filas: Array<{ codigo: string; contenido: Record<string, unknown> }> = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb
      .from("actividades").select("codigo, contenido").order("codigo").range(from, from + 999);
    if (error) throw new Error(error.message);
    if (!data?.length) break;
    filas.push(...(data as unknown as typeof filas));
    if (data.length < 1000) break;
  }

  const sucias = filas.filter((f) => {
    const c = f.contenido ?? {};
    return ["url_imagen", "url_miniatura"].some(
      (k) => typeof c[k] === "string" && /placeholder/i.test(c[k] as string)
    );
  });

  console.log(`${sucias.length} actividades con ruta de placeholder`);
  if (DRY) { for (const s of sucias) console.log(`  ${s.codigo}`); return; }

  let ok = 0;
  for (const s of sucias) {
    const c = { ...s.contenido };
    for (const k of ["url_imagen", "url_miniatura"]) {
      if (typeof c[k] === "string" && /placeholder/i.test(c[k] as string)) delete c[k];
    }
    const { error } = await sb.from("actividades").update({ contenido: c }).eq("codigo", s.codigo);
    if (error) { console.log(`  FALLO ${s.codigo}: ${error.message}`); continue; }
    ok++;
  }
  console.log(`limpiadas ${ok}`);
}

main().catch((err) => { console.error("ERROR:", err.message); process.exit(1); });

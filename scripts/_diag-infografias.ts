import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const sb = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data, error } = await sb
    .from("actividades")
    .select("codigo, titulo, contenido, nivel_revision")
    .eq("tipo", "infografia")
    .order("codigo");

  if (error) { console.error(error); process.exit(1); }

  console.log(`\nTotal infografías: ${data?.length ?? 0}\n`);

  for (const a of data ?? []) {
    const c = a.contenido as Record<string, unknown>;
    const puntos = Array.isArray(c.puntos_clave) ? (c.puntos_clave as string[]).length : 0;
    const descLen = typeof c.descripcion_accesible === "string" ? c.descripcion_accesible.length : 0;
    const imgUrl = c.url_imagen ?? "—";
    console.log(`${a.codigo} | ${String(a.titulo).substring(0,52)} | puntos:${puntos} | desc:${descLen}c | ${a.nivel_revision} | img:${String(imgUrl).substring(0,35)}`);
  }

  // Also dump full contenido for first infografia as schema reference
  if (data && data.length > 0) {
    console.log("\n--- CONTENIDO MUESTRA (primera) ---");
    console.log(JSON.stringify(data[0]!.contenido, null, 2));
  }
}

main().catch(e => { console.error(e); process.exit(1); });

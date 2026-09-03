/**
 * APLICA LA MIGRACIÓN 27 SIN ABRIR EL EDITOR SQL.
 *
 * Las migraciones de este proyecto se aplican pegándolas a mano en el editor SQL
 * de Supabase, y eso ya causó un problema conocido: no hay registro de cuáles
 * entraron. La 27 es un `UPDATE` de una sola fila sobre una columna jsonb, así
 * que se puede hacer con el cliente y quedar comprobada aquí mismo.
 *
 * Hace exactamente lo que dice el .sql: deja `required` del tipo 'infografia'
 * en `["titulo"]`, quitando "url_imagen". Es idempotente y verifica el
 * resultado leyendo la fila de vuelta.
 *
 * Uso: npx tsx scripts/aplicar-migracion-27.ts [--dry]
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

  const { data, error } = await sb
    .from("tipos_actividad")
    .select("codigo, schema_validacion")
    .eq("codigo", "infografia")
    .single();
  if (error || !data) throw new Error(`No se pudo leer el tipo 'infografia': ${error?.message}`);

  const schema = (data.schema_validacion ?? {}) as Record<string, unknown>;
  const antes = JSON.stringify(schema.required);
  console.log(`required actual: ${antes}`);

  if (antes === JSON.stringify(["titulo"])) {
    console.log("Ya estaba aplicada ✓");
    return;
  }
  if (DRY) {
    console.log('[--dry] Se pondría required = ["titulo"]. Nada escrito.');
    return;
  }

  const nuevo = { ...schema, required: ["titulo"] };
  const { error: e2 } = await sb
    .from("tipos_actividad")
    .update({ schema_validacion: nuevo as never })
    .eq("codigo", "infografia");
  if (e2) throw new Error(`No se pudo escribir: ${e2.message}`);

  const { data: check } = await sb
    .from("tipos_actividad")
    .select("schema_validacion")
    .eq("codigo", "infografia")
    .single();
  const despues = JSON.stringify(((check?.schema_validacion ?? {}) as Record<string, unknown>).required);
  console.log(`required nuevo:  ${despues}`);
  if (despues !== JSON.stringify(["titulo"])) throw new Error("La escritura no quedó como se esperaba");
  console.log("Migración 27 aplicada y verificada ✓");
}

main().catch((e) => { console.error("ERROR:", (e as Error).message); process.exit(1); });

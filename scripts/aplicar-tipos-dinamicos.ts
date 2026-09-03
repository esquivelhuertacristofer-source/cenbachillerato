/**
 * Da de alta en `tipos_actividad` los cinco tipos dinámicos de la migración 26.
 *
 * POR QUÉ UN SCRIPT Y NO SÓLO EL .sql. El .sql es el registro de la migración,
 * pero aplicarlo requiere entrar al editor SQL del panel de Supabase a mano. La
 * parte que de verdad hay que ejecutar —dar de alta cinco filas de catálogo— se
 * puede hacer con la service_role desde aquí, y así el despliegue no depende de
 * que alguien se acuerde de pegar el SQL. El resto de la migración 26 no toca
 * el esquema: `actividades.tipo` es texto libre y `tipo_codigo` es una FK a
 * estas filas.
 *
 * IDEMPOTENTE: hace upsert por `codigo`; relanzarlo no duplica nada.
 *
 * Uso: npx tsx scripts/aplicar-tipos-dinamicos.ts
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

loadEnv({ path: resolve(process.cwd(), ".env.local") });

const MIGRACION = resolve(process.cwd(), "supabase/migrations/26_tipos_actividad_dinamicos.sql");

/**
 * Los `schema_validacion` se leen del propio .sql para que no haya dos
 * versiones del mismo JSON: si alguien corrige el esquema en la migración,
 * este script publica el corregido y no una copia vieja pegada aquí.
 */
function tiposDelSql(): Array<{
  codigo: string; nombre: string; descripcion: string; icono: string;
  orden: number; schema_validacion: unknown;
}> {
  const sql = readFileSync(MIGRACION, "utf8");
  const filas: ReturnType<typeof tiposDelSql> = [];
  // ('codigo', 'nombre', 'descripcion', 'Icono', orden, '{...}'::jsonb)
  const re = /\('([a-z_]+)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'([A-Za-z]+)',\s*(\d+),\s*'([\s\S]*?)'::jsonb\)/g;
  for (const m of sql.matchAll(re)) {
    filas.push({
      codigo: m[1]!,
      nombre: m[2]!.replace(/''/g, "'"),
      descripcion: m[3]!.replace(/''/g, "'"),
      icono: m[4]!,
      orden: Number(m[5]),
      schema_validacion: JSON.parse(m[6]!.replace(/''/g, "'")),
    });
  }
  return filas;
}

async function main() {
  const filas = tiposDelSql();
  if (filas.length !== 5) {
    throw new Error(`Se esperaban 5 tipos en la migración 26 y se leyeron ${filas.length}`);
  }

  const sb = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  for (const f of filas) {
    const { data: existe } = await sb
      .from("tipos_actividad").select("codigo").eq("codigo", f.codigo).maybeSingle();
    if (existe) {
      console.log(`= ${f.codigo}: ya estaba`);
      continue;
    }
    const { error } = await sb.from("tipos_actividad").insert(f as never);
    if (error) throw new Error(`${f.codigo}: ${error.message}`);
    console.log(`+ ${f.codigo}: ${f.nombre}`);
  }

  const { count } = await sb
    .from("tipos_actividad").select("codigo", { count: "exact", head: true });
  console.log(`\nCatálogo de tipos: ${count} en total.`);
}

main().catch((err) => { console.error("ERROR:", err.message); process.exit(1); });

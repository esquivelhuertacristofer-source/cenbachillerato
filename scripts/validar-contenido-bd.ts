/**
 * ¿HAY ALGUNA ACTIVIDAD EN PRODUCCIÓN QUE EL RENDERIZADOR NO PUEDA DIBUJAR?
 *
 * Cada tipo de actividad tiene un esquema Zod en `src/lib/activities/validators.ts`
 * y los sembradores validan ANTES de insertar. Pero eso sólo protege lo que entró
 * por un sembrador: el contenido también se ha editado a mano en el editor SQL, se
 * ha migrado entre esquemas y se ha reescrito por lotes. Una fila que se salió del
 * esquema no rompe nada hasta que un alumno abre esa actividad, y entonces rompe
 * en su pantalla.
 *
 * Esto lee las 2 189 filas de producción y pasa cada `contenido` por el mismo
 * validador que usa la aplicación. Es de sólo lectura y no arregla nada: dice
 * exactamente qué fila y qué campo, para arreglarlo a mano y a propósito.
 *
 * TAMBIÉN AVISA DE LOS TIPOS SIN VALIDADOR. Si aparece un `tipo` que no está en
 * `VALIDADORES_CONTENIDO`, no se puede afirmar nada sobre esas filas — y callarlo
 * daría un informe en verde que no significa nada.
 *
 * Uso: npx tsx scripts/validar-contenido-bd.ts [--detalle]
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";
import { VALIDADORES_CONTENIDO, validarContenidoActividad, type TipoActividadKey } from "../src/lib/activities/validators";

loadEnv({ path: resolve(process.cwd(), ".env.local") });

const DETALLE = process.argv.includes("--detalle");

interface Fila {
  codigo: string;
  tipo: string;
  estado: string;
  contenido: unknown;
}

async function main() {
  const sb = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const filas: Fila[] = [];
  for (let desde = 0; ; desde += 1000) {
    const { data, error } = await sb
      .from("actividades")
      .select("codigo, tipo, estado, contenido")
      .order("codigo")
      .range(desde, desde + 999);
    if (error) throw new Error(error.message);
    if (!data?.length) break;
    filas.push(...(data as unknown as Fila[]));
    if (data.length < 1000) break;
  }

  const conocidos = new Set(Object.keys(VALIDADORES_CONTENIDO));
  const sinValidador = new Map<string, number>();
  const malos: Array<{ codigo: string; tipo: string; estado: string; problemas: string[] }> = [];
  let validadas = 0;

  for (const f of filas) {
    if (!conocidos.has(f.tipo)) {
      sinValidador.set(f.tipo, (sinValidador.get(f.tipo) ?? 0) + 1);
      continue;
    }
    const r = validarContenidoActividad(f.tipo as TipoActividadKey, f.contenido ?? {});
    validadas++;
    if (!r.success) {
      const issues = (r.error as unknown as { issues?: Array<{ path: unknown[]; message: string }> }).issues ?? [];
      malos.push({
        codigo: f.codigo,
        tipo: f.tipo,
        estado: f.estado,
        problemas: issues.slice(0, 4).map((i) => `${i.path.join(".") || "(raíz)"}: ${i.message}`),
      });
    }
  }

  console.log(`\n=== VALIDACIÓN DE CONTENIDO CONTRA LOS ESQUEMAS ===`);
  console.log(`filas leídas ${filas.length} | validadas ${validadas} | inválidas ${malos.length}`);

  if (sinValidador.size > 0) {
    console.log(`\nTipos SIN validador (no se pudo afirmar nada de estas filas):`);
    for (const [t, n] of [...sinValidador].sort((a, b) => b[1] - a[1])) {
      console.log(`  ${String(n).padStart(5)}  ${t}`);
    }
  }

  if (malos.length === 0) {
    console.log(`\nTodas las actividades con validador cumplen su esquema ✓\n`);
    return;
  }

  const porTipo = new Map<string, number>();
  for (const m of malos) porTipo.set(m.tipo, (porTipo.get(m.tipo) ?? 0) + 1);
  console.log(`\nInválidas por tipo:`);
  for (const [t, n] of [...porTipo].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(5)}  ${t}`);
  }

  console.log(`\nDetalle${DETALLE ? "" : " (primeras 25; usa --detalle para todas)"}:`);
  for (const m of (DETALLE ? malos : malos.slice(0, 25))) {
    console.log(`  ✗ ${m.codigo} [${m.tipo}, ${m.estado}]`);
    for (const p of m.problemas) console.log(`      ${p}`);
  }
  console.log("");
  process.exit(1);
}

main().catch((e) => { console.error("ERROR:", (e as Error).message); process.exit(1); });

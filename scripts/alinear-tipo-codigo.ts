/**
 * alinear-tipo-codigo.ts
 *
 * `actividades` guarda el tipo dos veces: la columna original `tipo` (texto
 * libre, la que ActivityRunner usa para elegir el componente) y la columna
 * normalizada `tipo_codigo` (FK a tipos_actividad, añadida en la migración 03).
 * La regla, fijada por la migración 07, es `tipo_codigo = tipo`.
 *
 * 34 filas quedaron desalineadas: `tipo='lectura'` pero
 * `tipo_codigo='video_con_preguntas'`. Se retiparon a lectura en algún momento
 * y solo se actualizó `tipo`. Efecto real: la pantalla del alumno está BIEN
 * (despacha por `tipo`), pero /hub/progreso lee `tipo_codigo` y las cuenta y
 * etiqueta como "Video" en vez de "Lectura" (progreso-shared.ts:137,189).
 *
 * Este script alinea `tipo_codigo` a `tipo` en ese par concreto. NO toca
 * `estado`, `tipo` ni `contenido`. IDEMPOTENTE: una segunda corrida ve 0
 * desalineadas y no escribe.
 *
 *   npx tsx scripts/alinear-tipo-codigo.ts          # dry-run (por defecto)
 *   npx tsx scripts/alinear-tipo-codigo.ts --apply  # escribe
 */
import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env.local") });

const APPLY = process.argv.includes("--apply");
/** Único desalineamiento conocido y auditado. Cualquier otro par se reporta y NO se toca. */
const PAR_ESPERADO = { tipo: "lectura", tipo_codigo: "video_con_preguntas" };

async function main() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  // El catálogo de tipos válidos: `tipo_codigo` es FK, escribir un valor
  // ausente reventaría la restricción.
  const { data: tipos, error: eT } = await sb.from("tipos_actividad").select("codigo");
  if (eT) throw eT;
  const validos = new Set((tipos ?? []).map((t) => t.codigo));

  // Paginado: la tabla supera el tope por defecto de PostgREST (1000 filas).
  const todas: {
    id: string; codigo: string; estado: string;
    tipo: string; tipo_codigo: string | null;
    contenido: unknown;
  }[] = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await sb
      .from("actividades")
      .select("id, codigo, estado, tipo, tipo_codigo, contenido")
      .order("codigo")
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    todas.push(...data);
    if (data.length < PAGE) break;
  }

  const desalineadas = todas.filter((a) => a.tipo_codigo !== null && a.tipo_codigo !== a.tipo);
  console.log(`Actividades: ${todas.length}`);
  console.log(`Desalineadas (tipo_codigo != tipo): ${desalineadas.length}\n`);

  const aptas: typeof desalineadas = [];
  const fuera: string[] = [];
  for (const a of desalineadas) {
    const problemas: string[] = [];
    if (a.tipo !== PAR_ESPERADO.tipo || a.tipo_codigo !== PAR_ESPERADO.tipo_codigo)
      problemas.push(`par no auditado: tipo=${a.tipo} tipo_codigo=${a.tipo_codigo}`);
    if (!validos.has(a.tipo)) problemas.push(`tipo="${a.tipo}" no existe en tipos_actividad (FK)`);
    // El contenido debe ser una lectura de verdad, no un video sin migrar.
    const c = (a.contenido ?? {}) as Record<string, unknown>;
    if (c.url_video) problemas.push(`tiene url_video (es un video real)`);
    if (typeof c.texto !== "string" || c.texto.length < 50)
      problemas.push(`sin texto de lectura válido (>=50 chars)`);
    if (problemas.length > 0) fuera.push(`  ✗ ${a.codigo} — ${problemas.join("; ")}`);
    else aptas.push(a);
  }

  if (fuera.length > 0) {
    console.log(`NO se tocan (${fuera.length}):`);
    console.log(fuera.join("\n") + "\n");
  }

  const pub = aptas.filter((a) => a.estado === "publicada").length;
  console.log(`A alinear → tipo_codigo='${PAR_ESPERADO.tipo}': ${aptas.length}`);
  console.log(`  (${pub} publicada / ${aptas.length - pub} borrador)\n`);

  if (!APPLY) {
    for (const a of aptas) console.log(`  · ${a.codigo} [${a.estado}]`);
    console.log(`\nDRY-RUN. Nada escrito. Usa --apply para ejecutar.`);
    return;
  }

  let ok = 0;
  let fail = 0;
  for (const a of aptas) {
    const { error } = await sb
      .from("actividades")
      .update({ tipo_codigo: a.tipo })
      .eq("id", a.id)
      .eq("tipo_codigo", PAR_ESPERADO.tipo_codigo); // no pisa una corrección concurrente
    if (error) {
      console.log(`  ✗ ${a.codigo} — ${error.message}`);
      fail++;
    } else {
      console.log(`  ✓ ${a.codigo} [${a.estado}] tipo_codigo → ${a.tipo}`);
      ok++;
    }
  }
  console.log(`\n=== alineadas OK=${ok} FAIL=${fail} ===`);
  if (fail > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

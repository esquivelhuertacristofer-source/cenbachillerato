/**
 * publicar-borradores.ts
 *
 * Pone `estado='publicada'` en las actividades que siguen en 'borrador'.
 *
 * Bajo RLS, `estado='publicada'` es el ÚNICO candado que hace visible una
 * actividad al alumno (01_schema_inicial.sql:303-305; `uac` y `progresiones`
 * son legibles sin condición). Esto publica contenido hacia MENORES, así que
 * cada fila pasa por guardas antes de tocarse y se registra una por una.
 *
 * Guardas (una fila que falle cualquiera NO se publica y se reporta):
 *   · tiene progresion_id (no es huérfana: sería invisible en el hub)
 *   · contenido no vacío
 *   · tipo válido en el catálogo tipos_actividad y alineado con tipo_codigo
 *   · si es video_con_preguntas: url_video apuntando a R2 (no al PENDIENTE viejo)
 *
 * NO toca `tipo`, `tipo_codigo` ni `contenido`. IDEMPOTENTE: una segunda
 * corrida ve 0 borradores y no escribe.
 *
 *   npx tsx scripts/publicar-borradores.ts          # dry-run (por defecto)
 *   npx tsx scripts/publicar-borradores.ts --apply  # escribe
 */
import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env.local") });

const APPLY = process.argv.includes("--apply");
const R2 = "https://pub-94a8196c0c59456a89cf72193424c9d1.r2.dev/bachillerato/";

type Fila = {
  id: string;
  codigo: string;
  titulo: string;
  estado: string;
  tipo: string;
  tipo_codigo: string | null;
  contenido: Record<string, unknown> | null;
  progresion_id: string | null;
};

async function main() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { data: tipos, error: eT } = await sb.from("tipos_actividad").select("codigo");
  if (eT) throw eT;
  const validos = new Set((tipos ?? []).map((t) => t.codigo));

  // Paginado: la tabla supera el tope por defecto de PostgREST (1000 filas).
  const todas: Fila[] = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await sb
      .from("actividades")
      .select("id, codigo, titulo, estado, tipo, tipo_codigo, contenido, progresion_id")
      .order("codigo")
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    todas.push(...(data as Fila[]));
    if (data.length < PAGE) break;
  }

  const porEstado = new Map<string, number>();
  for (const a of todas) porEstado.set(a.estado, (porEstado.get(a.estado) ?? 0) + 1);
  console.log(`Actividades: ${todas.length}`);
  for (const [e, n] of [...porEstado].sort((a, b) => b[1] - a[1]))
    console.log(`  ${String(n).padStart(5)}  ${e}`);

  const borradores = todas.filter((a) => a.estado === "borrador");
  console.log(`\nBorradores a evaluar: ${borradores.length}\n`);
  if (borradores.length === 0) {
    console.log("No hay nada que publicar ✅");
    return;
  }

  const aptas: Fila[] = [];
  const fuera: string[] = [];
  for (const a of borradores) {
    const problemas: string[] = [];
    const c = a.contenido ?? {};
    if (!a.progresion_id) problemas.push("sin progresion_id (huérfana)");
    if (Object.keys(c).length === 0) problemas.push("contenido vacío");
    if (!validos.has(a.tipo)) problemas.push(`tipo="${a.tipo}" no existe en tipos_actividad`);
    if (a.tipo_codigo !== null && a.tipo_codigo !== a.tipo)
      problemas.push(`tipo_codigo="${a.tipo_codigo}" != tipo="${a.tipo}"`);
    if (a.tipo === "video_con_preguntas") {
      const url = String(c.url_video ?? "");
      if (!url.startsWith(R2)) problemas.push(`url_video no apunta a R2: "${url.slice(0, 60)}"`);
    }
    if (problemas.length > 0) fuera.push(`  ✗ ${a.codigo} [${a.tipo}] — ${problemas.join("; ")}`);
    else aptas.push(a);
  }

  if (fuera.length > 0) {
    console.log(`NO se publican (${fuera.length}):`);
    console.log(fuera.join("\n") + "\n");
  }

  const porTipo = new Map<string, number>();
  for (const a of aptas) porTipo.set(a.tipo, (porTipo.get(a.tipo) ?? 0) + 1);
  console.log(`A publicar: ${aptas.length}`);
  for (const [t, n] of [...porTipo].sort((a, b) => b[1] - a[1]))
    console.log(`  ${String(n).padStart(5)}  ${t}`);

  if (!APPLY) {
    console.log(`\nDRY-RUN. Nada escrito. Usa --apply para ejecutar.`);
    return;
  }

  console.log("");
  let ok = 0;
  let fail = 0;
  for (const a of aptas) {
    const { error } = await sb
      .from("actividades")
      .update({ estado: "publicada" })
      .eq("id", a.id)
      .eq("estado", "borrador"); // no pisa un cambio de estado concurrente
    if (error) {
      console.log(`  ✗ ${a.codigo} — ${error.message}`);
      fail++;
    } else {
      console.log(`  ✓ ${a.codigo} [${a.tipo}] → publicada`);
      ok++;
    }
  }
  console.log(`\n=== publicadas OK=${ok} FAIL=${fail} (no aptas: ${fuera.length}) ===`);
  if (fail > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

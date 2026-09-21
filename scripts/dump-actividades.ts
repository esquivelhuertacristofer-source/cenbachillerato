/**
 * Vuelca el contenido VERBATIM de actividades de la base, para construir un
 * laboratorio sobre ellas sin reescribirlas.
 *
 * Existía como script temporal y se borraba en cada limpieza; vive aquí porque
 * cada campaña de laboratorios lo vuelve a necesitar.
 *
 * Uso:
 *   npx tsx scripts/dump-actividades.ts CNEYT-I-P06-A1 CNEYT-I-P06-A2 …
 *   npx tsx scripts/dump-actividades.ts --progresion LC-I-P01   (todas sus actividades)
 *   ACT_OUT=ruta/act.txt npx tsx scripts/dump-actividades.ts …  (además, a archivo)
 */
import { config } from "dotenv";
import { resolve } from "path";
import { writeFileSync } from "fs";
import { createSB } from "./lib/activity-utils";

config({ path: resolve(process.cwd(), ".env.local") });

interface Fila {
  codigo: string;
  titulo: string;
  descripcion: string | null;
  tipo: string;
  tipo_codigo: string | null;
  estado: string;
  practica_slug: string | null;
  contenido: unknown;
}

async function main() {
  const args = process.argv.slice(2);
  const i = args.indexOf("--progresion");
  const sb = createSB();
  let filas: Fila[] = [];

  if (i >= 0) {
    const codigoProg = args[i + 1];
    if (!codigoProg) { console.error("Falta el código de la progresión."); process.exit(1); }
    const { data: prog, error: e1 } = await sb.from("progresiones").select("id, codigo, titulo, numero").eq("codigo", codigoProg).maybeSingle();
    if (e1 || !prog) { console.error(`No encontré la progresión ${codigoProg}: ${e1?.message ?? "no existe"}`); process.exit(1); }
    console.log(`# Progresión ${prog.codigo} (P${prog.numero}) — ${prog.titulo}\n`);
    const { data, error } = await sb
      .from("actividades")
      .select("codigo, titulo, descripcion, tipo, tipo_codigo, estado, practica_slug, contenido")
      .eq("progresion_id", prog.id)
      .order("codigo");
    if (error) { console.error(error.message); process.exit(1); }
    filas = (data ?? []) as Fila[];
  } else {
    if (args.length === 0) { console.error("Pasa códigos de actividad o --progresion <CODIGO>."); process.exit(1); }
    const { data, error } = await sb
      .from("actividades")
      .select("codigo, titulo, descripcion, tipo, tipo_codigo, estado, practica_slug, contenido")
      .in("codigo", args)
      .order("codigo");
    if (error) { console.error(error.message); process.exit(1); }
    filas = (data ?? []) as Fila[];
    for (const c of args) if (!filas.some((f) => f.codigo === c)) console.log(`ERROR: no existe la actividad ${c}`);
  }

  const partes: string[] = [];
  for (const f of filas) {
    partes.push(
      `\n${"=".repeat(78)}\n${f.codigo} · tipo ${f.tipo}${f.tipo_codigo && f.tipo_codigo !== f.tipo ? ` (tipo_codigo: ${f.tipo_codigo})` : ""} · ${f.estado}` +
        `${f.practica_slug ? ` · práctica: ${f.practica_slug}` : ""}\n${"=".repeat(78)}\n` +
        `TÍTULO: ${f.titulo}\nDESCRIPCIÓN: ${f.descripcion ?? "—"}\n\nCONTENIDO:\n${JSON.stringify(f.contenido, null, 2)}`
    );
  }
  const texto = partes.join("\n");
  console.log(texto);
  console.log(`\n${"-".repeat(78)}\n${filas.length} actividades.`);

  const out = process.env.ACT_OUT;
  if (out) { writeFileSync(out, texto, "utf8"); console.log(`Escrito en ${out}`); }
}
void main();

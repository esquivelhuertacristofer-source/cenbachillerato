/**
 * VUELCA EL CONTENIDO ANCLA DE UNO O VARIOS LABORATORIOS.
 *
 * Para escribir la ficha teórica de un lab hay una regla dura de la campaña:
 * el texto es VERBATIM de las actividades de su progresión (lectura A1 +
 * glosario A5), nada inventado. Este script trae exactamente eso: dado un
 * `practica_slug`, encuentra la actividad asociada, sube a su progresión y
 * vuelca todas las actividades hermanas con su contenido.
 *
 * Sólo lectura. Recuerda que PostgREST corta el SELECT en 1000 filas, así que
 * la carga completa va paginada.
 *
 * Uso:
 *   npx tsx scripts/dump-anclas-lab.ts <slug> [<slug>…]      → a stdout
 *   npx tsx scripts/dump-anclas-lab.ts --archivo salida.json <slug>…
 *   npx tsx scripts/dump-anclas-lab.ts --sin-ficha --archivo out.json
 *       → todos los labs que el inventario marca sin ficha teórica
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { writeFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";
import { inventario } from "./auditar-labs";

loadEnv({ path: resolve(process.cwd(), ".env.local") });

type Act = {
  id: string;
  codigo: string;
  titulo: string;
  tipo: string;
  progresion_id: string;
  practica_slug: string | null;
  contenido: unknown;
  estado: string;
};

/** Lee una tabla entera saltando el tope de 1000 filas de PostgREST. */
async function todas<T>(
  sb: ReturnType<typeof createClient<Database>>,
  tabla: string,
  columnas: string
): Promise<T[]> {
  const out: T[] = [];
  for (let desde = 0; ; desde += 1000) {
    const { data, error } = await sb.from(tabla).select(columnas).range(desde, desde + 999);
    if (error) throw new Error(`${tabla}: ${error.message}`);
    const filas = (data ?? []) as unknown as T[];
    out.push(...filas);
    if (filas.length < 1000) break;
  }
  return out;
}

export interface AnclaLab {
  slug: string;
  actividadAsociada: string | null;
  progresion: { codigo: string; numero: number; titulo: string } | null;
  uac: { codigo: string; nombre: string; semestre: number } | null;
  actividades: { codigo: string; titulo: string; tipo: string; estado: string; contenido: unknown }[];
}

export async function anclasDe(slugs: string[]): Promise<AnclaLab[]> {
  const sb = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const acts = await todas<Act>(
    sb,
    "actividades",
    "id, codigo, titulo, tipo, progresion_id, practica_slug, contenido, estado"
  );
  const progs = await todas<{ id: string; codigo: string; numero: number; titulo: string; uac_id: string }>(
    sb,
    "progresiones",
    "id, codigo, numero, titulo, uac_id"
  );
  const uacs = await todas<{ id: string; codigo: string; nombre: string; semestre: number }>(
    sb,
    "uac",
    "id, codigo, nombre, semestre"
  );

  const progPorId = new Map(progs.map((p) => [p.id, p]));
  const uacPorId = new Map(uacs.map((u) => [u.id, u]));
  const porProgresion = new Map<string, Act[]>();
  for (const a of acts) {
    const lista = porProgresion.get(a.progresion_id) ?? [];
    lista.push(a);
    porProgresion.set(a.progresion_id, lista);
  }

  return slugs.map((slug) => {
    const ancla = acts.find((a) => a.practica_slug === slug) ?? null;
    if (!ancla) return { slug, actividadAsociada: null, progresion: null, uac: null, actividades: [] };
    const p = progPorId.get(ancla.progresion_id) ?? null;
    const u = p ? uacPorId.get(p.uac_id) ?? null : null;
    const hermanas = (porProgresion.get(ancla.progresion_id) ?? [])
      .slice()
      .sort((a, b) => a.codigo.localeCompare(b.codigo, "es", { numeric: true }));
    return {
      slug,
      actividadAsociada: ancla.codigo,
      progresion: p ? { codigo: p.codigo, numero: p.numero, titulo: p.titulo } : null,
      uac: u ? { codigo: u.codigo, nombre: u.nombre, semestre: u.semestre } : null,
      actividades: hermanas.map((a) => ({
        codigo: a.codigo,
        titulo: a.titulo,
        tipo: a.tipo,
        estado: a.estado,
        contenido: a.contenido,
      })),
    };
  });
}

async function main() {
  const args = process.argv.slice(2);
  const iArch = args.indexOf("--archivo");
  const archivo = iArch >= 0 ? args[iArch + 1] : null;
  let slugs = args.filter((a, i) => !a.startsWith("--") && i !== iArch + 1);

  if (args.includes("--sin-ficha")) {
    slugs = inventario().filter((f) => !f.ficha).map((f) => f.slug);
    console.error(`[--sin-ficha] ${slugs.length} laboratorios`);
  }
  if (slugs.length === 0) {
    console.error("Uso: npx tsx scripts/dump-anclas-lab.ts <slug>… | --sin-ficha [--archivo out.json]");
    process.exit(1);
  }

  const datos = await anclasDe(slugs);
  const sinAncla = datos.filter((d) => !d.actividadAsociada).map((d) => d.slug);
  if (sinAncla.length) console.error(`⚠️  sin actividad asociada: ${sinAncla.join(", ")}`);

  const json = JSON.stringify(datos, null, 2);
  if (archivo) {
    writeFileSync(resolve(process.cwd(), archivo), json, "utf8");
    console.error(`Escrito ${archivo} (${(json.length / 1024).toFixed(0)} KB, ${datos.length} labs)`);
  } else {
    console.log(json);
  }
}

if (process.argv[1] && process.argv[1].includes("dump-anclas-lab")) main().catch((e) => {
  console.error("ERROR:", (e as Error).message);
  process.exit(1);
});

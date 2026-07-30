/**
 * Solo lectura. Emite las rutas reales del hub donde viven los videos y las
 * prácticas 3D, para poder verificarlas a mano en producción.
 *
 * El [orden] de la ruta NO es una columna: `getActividadContenido` lo resuelve
 * del sufijo `-A{n}` del `codigo` de la actividad (src/lib/queries/hub.ts).
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { mkdirSync, writeFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

loadEnv({ path: resolve(process.cwd(), ".env.local") });

const BASE = "https://cen-bachillerato.campanaeducativanacional.workers.dev";

async function main() {
  const sb = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: uacs } = await sb.from("uac").select("id, codigo, nombre, semestre");
  const { data: progs } = await sb.from("progresiones").select("id, numero, uac_id");
  const uacById = new Map((uacs ?? []).map((u) => [u.id, u]));
  const progById = new Map((progs ?? []).map((p) => [p.id, p]));

  type Fila = {
    codigo: string;
    titulo: string;
    tipo: string;
    estado: string;
    practica_slug: string | null;
    progresion_id: string;
    contenido: unknown;
  };
  const acts: Fila[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb
      .from("actividades")
      .select("codigo, titulo, tipo, estado, practica_slug, progresion_id, contenido")
      .in("tipo", ["video_con_preguntas"])
      .order("codigo")
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    if (!data?.length) break;
    acts.push(...(data as Fila[]));
    if (data.length < 1000) break;
  }

  // Prácticas 3D (cualquier tipo, con practica_slug)
  const practicas: Fila[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb
      .from("actividades")
      .select("codigo, titulo, tipo, estado, practica_slug, progresion_id, contenido")
      .not("practica_slug", "is", null)
      .order("codigo")
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    if (!data?.length) break;
    practicas.push(...(data as Fila[]));
    if (data.length < 1000) break;
  }

  function ruta(a: Fila, sufijo = ""): string | null {
    const prog = progById.get(a.progresion_id);
    if (!prog) return null;
    const uac = uacById.get(prog.uac_id);
    if (!uac) return null;
    const m = a.codigo.match(/-A(\d+)$/);
    if (!m) return null;
    return `${BASE}/hub/uac/${uac.codigo}/progresion/${prog.numero}/actividad/${m[1]}${sufijo}`;
  }

  const lineas: string[] = [];
  const porSem = new Map<number, string[]>();
  let sinRuta = 0;
  for (const a of acts) {
    const r = ruta(a);
    if (!r) {
      sinRuta++;
      continue;
    }
    const prog = progById.get(a.progresion_id)!;
    const uac = uacById.get(prog.uac_id)!;
    const url = (a.contenido as { url_video?: string } | null)?.url_video ?? "(sin url)";
    const linea = `[sem ${uac.semestre}] ${a.codigo} | ${a.estado} | ${a.titulo}\n    hub:   ${r}\n    video: ${url}`;
    lineas.push(linea);
    if (!porSem.has(uac.semestre)) porSem.set(uac.semestre, []);
    porSem.get(uac.semestre)!.push(linea);
  }

  const lp: string[] = [];
  for (const a of practicas) {
    const r = ruta(a, "/practica");
    if (!r) continue;
    const prog = progById.get(a.progresion_id)!;
    const uac = uacById.get(prog.uac_id)!;
    lp.push(`[sem ${uac.semestre}] ${a.codigo} | ${a.practica_slug} | ${a.estado}\n    ${r}`);
  }

  console.log(`videos=${acts.length} conRuta=${lineas.length} sinRuta=${sinRuta}`);
  console.log(`practicas=${practicas.length} conRuta=${lp.length}`);
  console.log(
    `estados video: ${JSON.stringify(
      acts.reduce<Record<string, number>>((m, a) => ((m[a.estado] = (m[a.estado] ?? 0) + 1), m), {})
    )}`
  );
  for (const [sem, l] of [...porSem.entries()].sort((a, b) => a[0] - b[0])) {
    console.log(`\n--- SEMESTRE ${sem} (${l.length} videos) — primeros 3 ---`);
    console.log(l.slice(0, 3).join("\n"));
  }
  console.log(`\n--- PRÁCTICAS 3D — primeras 6 ---`);
  console.log(lp.slice(0, 6).join("\n"));

  mkdirSync("scripts/out", { recursive: true });
  writeFileSync("scripts/out/rutas-verificacion.txt", lineas.join("\n") + "\n\n=== PRÁCTICAS ===\n" + lp.join("\n"), "utf8");
  console.log("\n→ scripts/out/rutas-verificacion.txt");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

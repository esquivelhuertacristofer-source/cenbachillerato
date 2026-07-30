/**
 * Renombra el `codigo` de las actividades de video de `<PROG>-VID0n` a
 * `<PROG>-A{n}` para que el hub pueda RUTEARLAS.
 *
 * ── Por qué ────────────────────────────────────────────────────────────────────
 * La ruta de una actividad es /hub/uac/{uac}/progresion/{numero}/actividad/{orden}
 * y `orden` NO es una columna: se deriva del sufijo `-A{n}` del código. Eso está
 * cableado en 9 lugares (src/lib/queries/hub.ts, hub-browser.ts, buscar.ts), todos
 * con el mismo fallback `?? 1`.
 *
 * Los 211 videos generados (TTS+Remotion) se sembraron con códigos `-VID01`, que
 * NO casan con esa expresión. Consecuencias en producción, medidas hoy:
 *   • 208 de 211 videos caen al fallback `orden = 1`, así que su tarjeta en la
 *     progresión apunta a /actividad/1 — la MISMA URL que la actividad `-A1`
 *     (lectura/infografía) de esa progresión. El alumno hace clic en el video y
 *     abre otra actividad.
 *   • Aunque se adivine la URL, `getActividadContenido` busca la actividad cuyo
 *     código termina en `-A{orden}`: una fila `-VID01` no es alcanzable por
 *     NINGUNA ruta.
 *   • 207 de esas 208 progresiones ya tienen una `-A1`, así que la colisión es real.
 * Los otros 3 videos (códigos `-A1`/`-A8`) sí funcionan hoy.
 *
 * ── Por qué renombrar el dato y no parchear el código ──────────────────────────
 * La alternativa era enseñarle a las 9 derivaciones a entender `-VID0n`. Además de
 * tocar 9 sitios (varios sin la lista de hermanas a la vista para calcular un orden
 * libre), el número derivado se PINTA en la UI (`A-{orden}` en ActivityCard,
 * `A{orden}` en ActivityShell/ProgresionCard), así que cualquier offset sintético
 * saldría en pantalla. Ajustar el dato a la convención que ya usa toda la
 * plataforma arregla ruteo, orden, buscador, biblioteca y recursos sin código nuevo.
 *
 * El video queda como ÚLTIMA actividad de su progresión (max(A)+1). Renumerar las
 * demás para meterlo en otra posición sería un cambio mucho más invasivo.
 *
 * `url_video` vive en `contenido` y no se toca: los mp4 en R2 conservan su nombre
 * (`cd-i-p02-vid01.mp4`), solo deja de coincidir con el código de la actividad.
 *
 * ⚠️ Tras aplicar esto hay que subir CATALOG_CACHE_VERSION y desplegar: los árboles
 * `sem:N:tree` / `uac:X:progtree` cacheados en KV traen los códigos viejos.
 *
 * ⚠️ Los seeders históricos (scripts/seed-sem*-videos*.ts) siguen refiriéndose a los
 * códigos `-VID01`. Ya corrieron y no deben volver a correr: lo harían por
 * `upsertActividad`, que al no encontrar el código viejo INSERTARÍA el video
 * duplicado.
 *
 * Uso:
 *   npx tsx scripts/renombrar-codigos-video.ts            # simulacro (no escribe)
 *   npx tsx scripts/renombrar-codigos-video.ts --aplicar  # escribe
 *
 * Es idempotente: en la segunda corrida no queda ningún `-VID` que renombrar.
 * El mapeo completo se guarda en scripts/out/renombrado-videos.json para revertir.
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { mkdirSync, writeFileSync } from "fs";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

loadEnv({ path: resolve(process.cwd(), ".env.local") });

const APLICAR = process.argv.includes("--aplicar");

type SB = SupabaseClient<Database>;

async function main() {
  const sb: SB = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Todas las actividades (paginado: PostgREST tope 1000).
  type Act = { id: string; codigo: string; tipo: string; progresion_id: string };
  const acts: Act[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb
      .from("actividades")
      .select("id, codigo, tipo, progresion_id")
      .order("codigo")
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    if (!data?.length) break;
    acts.push(...(data as Act[]));
    if (data.length < 1000) break;
  }

  const porProg = new Map<string, Act[]>();
  for (const a of acts) {
    if (!porProg.has(a.progresion_id)) porProg.set(a.progresion_id, []);
    porProg.get(a.progresion_id)!.push(a);
  }

  const usados = new Set(acts.map((a) => a.codigo));
  const plan: { id: string; de: string; a: string }[] = [];

  for (const [, hermanas] of porProg) {
    const vids = hermanas
      .filter((a) => /-VID(\d+)$/.test(a.codigo))
      .sort((a, b) => a.codigo.localeCompare(b.codigo));
    if (vids.length === 0) continue;

    let max = 0;
    for (const h of hermanas) {
      const m = h.codigo.match(/-A(\d+)$/);
      if (m?.[1]) max = Math.max(max, parseInt(m[1]));
    }

    for (const v of vids) {
      const base = v.codigo.replace(/-VID\d+$/, "");
      let n = max + 1;
      // `codigo` es UNIQUE: salta cualquier número ya tomado (aquí o en otra prog).
      while (usados.has(`${base}-A${n}`)) n++;
      const nuevo = `${base}-A${n}`;
      usados.add(nuevo);
      max = n;
      plan.push({ id: v.id, de: v.codigo, a: nuevo });
    }
  }

  console.log(`actividades totales: ${acts.length}`);
  console.log(`a renombrar: ${plan.length}`);
  const distribucion = plan.reduce<Record<string, number>>((m, p) => {
    const n = p.a.match(/-A(\d+)$/)![1]!;
    m[`A${n}`] = (m[`A${n}`] ?? 0) + 1;
    return m;
  }, {});
  console.log(`nuevo sufijo: ${JSON.stringify(distribucion)}`);
  console.log("\nprimeros 10:");
  for (const p of plan.slice(0, 10)) console.log(`  ${p.de}  →  ${p.a}`);

  mkdirSync("scripts/out", { recursive: true });
  writeFileSync("scripts/out/renombrado-videos.json", JSON.stringify(plan, null, 2), "utf8");
  console.log("\n→ mapeo en scripts/out/renombrado-videos.json (para revertir)");

  if (!APLICAR) {
    console.log("\nSIMULACRO — no se escribió nada. Repite con --aplicar.");
    return;
  }

  let ok = 0;
  const fallos: string[] = [];
  for (const p of plan) {
    const { error } = await sb.from("actividades").update({ codigo: p.a }).eq("id", p.id);
    if (error) fallos.push(`${p.de}: ${error.message}`);
    else ok++;
  }
  console.log(`\nrenombradas: ${ok}/${plan.length}`);
  if (fallos.length) console.log(`FALLOS:\n${fallos.join("\n")}`);

  // Verificación: no debe quedar ningún -VID
  const { count } = await sb
    .from("actividades")
    .select("id", { count: "exact", head: true })
    .like("codigo", "%-VID%");
  console.log(`quedan con -VID: ${count ?? "?"} (esperado 0)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

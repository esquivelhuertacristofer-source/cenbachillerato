/**
 * SACA DE LA BD TODO LO QUE HAY QUE LEERLE EN VOZ ALTA AL ALUMNO.
 *
 * Portado de `scripts/extraer-voz-clases.mjs` de la plataforma de robótica.
 *
 * POR QUÉ EXISTE ESTO. Hoy el botón "Escuchar" usa la Web Speech API: la voz
 * que suena es la que esa máquina tenga instalada. En la laptop de una escuela
 * pública eso es la SAPI vieja de Windows —"Microsoft Sabina"—, que suena
 * robótica y lee las cifras mal. Aquí se prepara el texto para grabarlo una
 * sola vez con `es-MX-DaliaNeural`, la misma locutora de los 211 videos, de modo
 * que el alumno oiga siempre a la misma persona suene donde suene.
 *
 * LA CLAVE DE CADA CLIP ES UN CONTRATO. Lo que se escribe aquí (`titulo`,
 * `p-0`, `p-1`, …) es exactamente lo que el reproductor pide después. Se
 * escribe una sola vez, en `clavesDeActividad()`, y `NarracionContext` arma la
 * misma clave con la misma regla.
 *
 * QUÉ SE NARRA Y QUÉ NO. Las 198 `lectura` y las 29 `infografia`. Las lecturas
 * son prosa larga: escucharlas en vez de leerlas cambia algo. Las infografías
 * entraron después, cuando se contó que 42 progresiones NO tienen lectura y usan
 * una infografía o un video como su pieza expositiva — en esas, dejar fuera la
 * infografía significaba que el alumno que depende del audio se quedaba sin el
 * contenido principal de la progresión.
 *
 * Un quiz de cinco opciones no se escucha, se lee; grabarlo sería 1 500 clips
 * más para nada. El resto de tipos conserva el narrador del navegador.
 *
 * Uso: npx tsx scripts/extraer-voz-actividades.ts
 *      → scripts/out/voz-actividades.json
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { mkdirSync, writeFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

loadEnv({ path: resolve(process.cwd(), ".env.local") });

import { segmentosDeLectura, segmentosDeInfografia } from "../src/lib/voz/segmentos";

export interface FilaVoz {
  codigo: string;
  clave: string;
  texto: string;
}

/**
 * Todas las parejas (clave, texto) de una actividad, en el orden en que se leen.
 * La regla de corte vive en `src/lib/voz/segmentos.ts` porque el reproductor
 * del navegador tiene que aplicar EXACTAMENTE la misma para pedir el MP3 que
 * corresponde a cada párrafo.
 */
export function clavesDeActividad(
  codigo: string,
  titulo: string,
  contenido: Record<string, unknown>,
  tipo: string = "lectura"
): FilaVoz[] {
  const segs = tipo === "infografia"
    ? segmentosDeInfografia(titulo, contenido.puntos_clave)
    : segmentosDeLectura(titulo, String(contenido.texto ?? ""));
  return segs.map((s) => ({ codigo, clave: s.clave, texto: s.texto }));
}

async function main() {
  const sb = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  type Act = { codigo: string; titulo: string; tipo: string; contenido: Record<string, unknown> };
  const acts: Act[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb
      .from("actividades")
      .select("codigo, titulo, tipo, contenido")
      .in("tipo", ["lectura", "infografia"])
      .eq("estado", "publicada")
      .order("codigo")
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    if (!data?.length) break;
    acts.push(...(data as unknown as Act[]));
    if (data.length < 1000) break;
  }

  const filas: FilaVoz[] = [];
  for (const a of acts) filas.push(...clavesDeActividad(a.codigo, a.titulo, a.contenido ?? {}, a.tipo));

  mkdirSync(resolve(process.cwd(), "scripts/out"), { recursive: true });
  writeFileSync(
    resolve(process.cwd(), "scripts/out/voz-actividades.json"),
    JSON.stringify(filas, null, 0),
    "utf8"
  );

  const chars = filas.reduce((n, f) => n + f.texto.length, 0);
  const porTipo = acts.reduce<Record<string, number>>((m, a) => { m[a.tipo] = (m[a.tipo] ?? 0) + 1; return m; }, {});
  console.log(
    `${acts.length} actividades (${JSON.stringify(porTipo)}) -> ${filas.length} clips, ${(chars / 1000).toFixed(0)}k caracteres ` +
    `(~${Math.round(chars / 14 / 60)} min de audio, ~${Math.round((chars / 14) * 6 / 1000)} MB)`
  );
  console.log("-> scripts/out/voz-actividades.json");
}

main().catch((err) => { console.error("ERROR:", err.message); process.exit(1); });

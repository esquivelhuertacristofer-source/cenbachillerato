"use server";

import { getSupabaseServer, getUser } from "@/lib/supabase-helpers";

/**
 * Persiste la mejor marca de estrellas (0-3) de un reto de lab.
 * Aplica lógica MAX: solo actualiza si la nueva marca supera la guardada.
 * Silencia errores (localStorage sigue siendo la fuente de verdad local).
 */
export async function guardarEstrellas(retoKey: string, estrellas: number): Promise<void> {
  if (estrellas < 1 || estrellas > 3) return;
  const user = await getUser();
  if (!user) return;

  try {
    const sb = await getSupabaseServer();
    // Leer marca actual para aplicar MAX en JavaScript (evita PL/pgSQL extra)
    const { data: existing } = await sb
      .from("valoraciones_lab")
      .select("estrellas")
      .eq("alumno_id", user.id)
      .eq("reto_key", retoKey)
      .maybeSingle();

    const guardadas = existing?.estrellas ?? 0;
    if (estrellas <= guardadas) return; // ya tenemos igual o mejor

    await sb.from("valoraciones_lab").upsert(
      { alumno_id: user.id, reto_key: retoKey, estrellas, updated_at: new Date().toISOString() },
      { onConflict: "alumno_id,reto_key" },
    );
  } catch {
    // localStorage mantiene la marca; no interrumpir la UX por fallo de red
  }
}

/**
 * Lee la mejor marca de estrellas de un reto desde la BD.
 * Devuelve 0 si no hay registro o si el usuario no está autenticado.
 */
export async function leerEstrellas(retoKey: string): Promise<number> {
  const user = await getUser();
  if (!user) return 0;

  try {
    const sb = await getSupabaseServer();
    const { data } = await sb
      .from("valoraciones_lab")
      .select("estrellas")
      .eq("alumno_id", user.id)
      .eq("reto_key", retoKey)
      .maybeSingle();
    return data?.estrellas ?? 0;
  } catch {
    return 0;
  }
}

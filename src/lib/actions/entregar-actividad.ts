"use server";

import { getSupabaseServer, getUser } from "@/lib/supabase-helpers";

export async function entregarActividad(
  actividadId: string,
  resultado: {
    puntaje?: number;
    respuestas?: unknown;
    tiempoSegundos?: number;
  }
): Promise<{ ok: true } | { error: string }> {
  const user = await getUser();
  if (!user) return { error: "No autenticado" };

  const sb = await getSupabaseServer();
  const now = new Date().toISOString();

  const { error } = await sb.from("intentos").insert({
    user_id: user.id,
    actividad_id: actividadId,
    status: "completed",
    score: resultado.puntaje ?? null,
    tiempo_segundos: resultado.tiempoSegundos ?? null,
    respuestas: resultado.respuestas ? (resultado.respuestas as never) : null,
    started_at: now,
    completed_at: now,
  });

  if (error) {
    console.error("[entregarActividad] Error inserting intento:", error, { actividadId, userId: user.id });
    return { error: error.message };
  }

  return { ok: true };
}

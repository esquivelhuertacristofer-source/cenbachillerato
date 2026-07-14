"use server";

import { z } from "zod";
import { getSupabaseServer, getUser } from "@/lib/supabase-helpers";
import { checkRateLimit } from "@/lib/rate-limit";

const EntregaSchema = z.object({
  actividadId: z.string().uuid({ message: "actividadId debe ser un UUID válido" }),
  resultado: z.object({
    puntaje: z.number().min(0).max(100).optional(),
    respuestas: z.unknown().optional(),
    tiempoSegundos: z.number().int().min(0).optional(),
  }),
});

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

  const { allowed } = await checkRateLimit(`entregar-actividad:${user.id}`, {
    limit: 30,
    windowSeconds: 60,
  });
  if (!allowed) {
    return { error: "Demasiados intentos. Intenta de nuevo en unos minutos." };
  }

  const parsed = EntregaSchema.safeParse({ actividadId, resultado });
  if (!parsed.success) {
    const issues = parsed.error.issues;
    const msg = issues[0]?.message ?? "Input inválido";
    return { error: msg };
  }

  const { actividadId: validId, resultado: validResultado } = parsed.data;

  const sb = await getSupabaseServer();

  // Verificar que la actividad existe y está publicada
  const { data: actividad } = await sb
    .from("actividades")
    .select("id, estado")
    .eq("id", validId)
    .eq("estado", "publicada")
    .maybeSingle();

  if (!actividad) {
    return { error: "Actividad no encontrada o no disponible" };
  }

  const now = new Date().toISOString();

  const { error } = await sb.from("intentos").insert({
    user_id: user.id,
    actividad_id: validId,
    status: "completed",
    score: validResultado.puntaje ?? null,
    tiempo_segundos: validResultado.tiempoSegundos ?? null,
    respuestas: validResultado.respuestas ? (validResultado.respuestas as never) : null,
    started_at: now,
    completed_at: now,
  });

  if (error) {
    // 23505 = unique_violation sobre (user_id, actividad_id, status): ya existe
    // un intento "completed" para esta actividad. Esto ocurre cuando la
    // sync-queue reintenta una entrega que en realidad ya se guardó antes
    // (p.ej. el insert original tuvo éxito pero la respuesta se perdió por un
    // corte de red). Tratarlo como error dejaría la entrada reintentando para
    // siempre; es evidencia de éxito previo, no de fallo.
    if (error.code === "23505") {
      return { ok: true };
    }
    console.error("[entregarActividad] Error inserting intento:", error.message, { actividadId: validId });
    return { error: "Error al guardar el intento. Intenta de nuevo." };
  }

  return { ok: true };
}

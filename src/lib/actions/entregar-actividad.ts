"use server";

import { z } from "zod";
import { getSupabaseServer, getUser } from "@/lib/supabase-helpers";

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
    console.error("[entregarActividad] Error inserting intento:", error.message, { actividadId: validId });
    return { error: "Error al guardar el intento. Intenta de nuevo." };
  }

  return { ok: true };
}

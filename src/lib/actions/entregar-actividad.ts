"use server";

import { z } from "zod";
import { getSupabaseServer, getUser } from "@/lib/supabase-helpers";
import { checkRateLimit } from "@/lib/rate-limit";
import { putRespuestas } from "@/lib/r2-respuestas";

// Tope al jsonb "respuestas": es el único campo de tamaño variable que persiste
// el alumno (quizzes/ejercicios mandan objetos chicos, pero reflexión escrita
// es texto libre sin límite en el cliente). 20 KB cubre con margen amplio
// cualquier reflexión legítima y acota el crecimiento de intentos frente al
// tope de 500 MB de la base en el plan Free de Supabase.
const RESPUESTAS_MAX_BYTES = 20_000;

// Umbral a partir del cual "respuestas" se descarga a R2 en vez de vivir en
// el jsonb de Postgres: es el driver de tamaño de la fila (con él, un ciclo
// de 20k alumnos rebasa hasta los 8 GB del plan Pro; sin él, la fila baja a
// ~270 B). 2 KB deja en Postgres los objetos chicos (quizzes/ejercicios, que
// además son los que se leen más seguido) y solo saca a R2 el texto libre
// largo (reflexiones), que es lo que de verdad hincha la tabla.
const RESPUESTAS_R2_THRESHOLD_BYTES = 2_048;

const EntregaSchema = z.object({
  actividadId: z.string().uuid({ message: "actividadId debe ser un UUID válido" }),
  resultado: z.object({
    puntaje: z.number().min(0).max(100).optional(),
    respuestas: z.unknown().optional().refine(
      (val) => val === undefined || JSON.stringify(val).length <= RESPUESTAS_MAX_BYTES,
      { message: `respuestas excede el tamaño máximo permitido (${RESPUESTAS_MAX_BYTES} bytes)` }
    ),
    tiempoSegundos: z.number().int().min(0).optional(),
  }),
});

/**
 * Núcleo compartido de una entrega ya autenticada: valida con `EntregaSchema`,
 * verifica la actividad, decide si "respuestas" va a R2 o a Postgres, inserta
 * el intento y trata 23505 como éxito idempotente. Usado tanto por
 * `entregarActividad` (auth + rate limit ya resueltos arriba, un solo item)
 * como por `entregarActividadesBatch` (mismo auth y rate limit resueltos UNA
 * vez para todo el lote, este núcleo se llama una vez por item). Exportado
 * — no solo interno del módulo — porque es la única forma de compartirlo sin
 * duplicar código entre los dos archivos de acción; al ser `async` cumple la
 * regla de "use server" de que todo export del archivo sea una función server
 * (ver docs/use-server.md), y al no importarse nunca desde un Client
 * Component no queda expuesto como acción invocable por el cliente.
 */
export async function procesarEntregaValidada(
  sb: Awaited<ReturnType<typeof getSupabaseServer>>,
  userId: string,
  actividadId: unknown,
  resultado: unknown
): Promise<{ ok: true } | { error: string }> {
  const parsed = EntregaSchema.safeParse({ actividadId, resultado });
  if (!parsed.success) {
    const issues = parsed.error.issues;
    const msg = issues[0]?.message ?? "Input inválido";
    return { error: msg };
  }

  const { actividadId: validId, resultado: validResultado } = parsed.data;

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

  // "respuestas" grande → intenta R2; si sube bien, en Postgres solo queda el
  // marcador {"__r2": 1} (lo lee getActividadConContenido). Si R2 falla (sin
  // binding, o cualquier error — putRespuestas nunca lanza), cae al jsonb
  // completo como hoy: la entrega nunca se pierde por un problema de R2.
  let respuestasParaGuardar: unknown = null;
  if (validResultado.respuestas != null) {
    const serializado = JSON.stringify(validResultado.respuestas);
    if (serializado.length > RESPUESTAS_R2_THRESHOLD_BYTES) {
      const subioAR2 = await putRespuestas(userId, validId, validResultado.respuestas);
      respuestasParaGuardar = subioAR2 ? { __r2: 1 } : validResultado.respuestas;
    } else {
      respuestasParaGuardar = validResultado.respuestas;
    }
  }

  const { error } = await sb.from("intentos").insert({
    user_id: userId,
    actividad_id: validId,
    status: "completed",
    score: validResultado.puntaje ?? null,
    tiempo_segundos: validResultado.tiempoSegundos ?? null,
    respuestas: respuestasParaGuardar as never,
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

  const sb = await getSupabaseServer();
  return procesarEntregaValidada(sb, user.id, actividadId, resultado);
}

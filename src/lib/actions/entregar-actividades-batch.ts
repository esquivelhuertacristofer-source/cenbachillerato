"use server";

import { getSupabaseServer, getUser } from "@/lib/supabase-helpers";
import { checkRateLimit } from "@/lib/rate-limit";
import { procesarEntregaValidada } from "@/lib/actions/entregar-actividad";

/**
 * Tope de entregas por lote. `syncQueue.flush` (sync-queue.ts) solo llama a
 * esta action cuando hay más de una entrega pendiente del usuario; en la
 * práctica una cola local rara vez acumula más de un puñado de actividades
 * offline, pero el tope evita que un caso patológico (localStorage con miles
 * de entradas viejas) mande un payload sin límite al server.
 */
const MAX_ENTREGAS_POR_LOTE = 20;

export interface EntregaBatchItem {
  actividadId: string;
  resultado: {
    puntaje?: number;
    respuestas?: unknown;
    tiempoSegundos?: number;
  };
}

export type ResultadoEntregaBatch =
  | { actividadId: string; ok: true }
  | { actividadId: string; error: string };

/**
 * Variante en lote de `entregarActividad`: auth y rate limit se resuelven UNA
 * sola vez para todo el lote (no por item — así 5 entregas encoladas no
 * gastan 5 unidades del límite de 30/60 s), y cada item se valida e inserta
 * con el mismo núcleo (`procesarEntregaValidada`) que usa la entrega
 * individual, así que 23505→ok y el volcado a R2 de "respuestas" largas se
 * comportan idéntico item por item.
 *
 * Auth se revalida AQUÍ (no basta con que el Proxy la haya cubierto): Next.js
 * no garantiza que el matcher de Proxy cubra las Server Functions — ver el
 * comentario en src/proxy.ts, sección de responsabilidades — así que cada
 * Server Action (esta incluida) debe volver a comprobar sesión por su cuenta.
 *
 * Inserta SECUENCIALMENTE (no Promise.all): son escrituras del mismo alumno,
 * no hay beneficio en paralelizarlas, y secuencial mantiene los logs/errores
 * de Postgres fáciles de leer por item sin interleaving.
 */
export async function entregarActividadesBatch(
  entregas: EntregaBatchItem[]
): Promise<{ ok: true; resultados: ResultadoEntregaBatch[] } | { error: string }> {
  const user = await getUser();
  if (!user) return { error: "No autenticado" };

  if (!Array.isArray(entregas) || entregas.length === 0) {
    return { error: "No hay entregas para procesar" };
  }
  if (entregas.length > MAX_ENTREGAS_POR_LOTE) {
    return { error: `Máximo ${MAX_ENTREGAS_POR_LOTE} entregas por lote` };
  }

  const { allowed } = await checkRateLimit(`entregar-actividad:${user.id}`, {
    limit: 30,
    windowSeconds: 60,
  });
  if (!allowed) {
    return { error: "Demasiados intentos. Intenta de nuevo en unos minutos." };
  }

  const sb = await getSupabaseServer();

  const resultados: ResultadoEntregaBatch[] = [];
  for (const entrega of entregas) {
    const actividadId = entrega?.actividadId;
    const r = await procesarEntregaValidada(sb, user.id, actividadId, entrega?.resultado);
    resultados.push(
      "ok" in r
        ? { actividadId, ok: true }
        : { actividadId, error: r.error }
    );
  }

  return { ok: true, resultados };
}

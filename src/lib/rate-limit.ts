import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";

/**
 * Minimal shape of the KV methods this module needs. Deliberately NOT the real
 * `@cloudflare/workers-types` `KVNamespace` type — that package is only a devDependency of
 * `@opennextjs/cloudflare` and is not installed in this project, so the global `KVNamespace`
 * type does not resolve here. This local interface is call-compatible with the real one for
 * the two methods used below.
 */
interface RateLimitKV {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

/**
 * Forma mínima del binding nativo de Rate Limiting de Workers (GA desde 2025-09-19).
 * Mismo criterio que `RateLimitKV`: `@cloudflare/workers-types` no está instalado en este
 * proyecto, así que se declara localmente solo el método usado, call-compatible con el
 * `RateLimit.limit()` real.
 */
interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

declare global {
  interface CloudflareEnv {
    RATE_LIMIT_KV?: RateLimitKV;
    /** Binding nativo para keys `login:*` — ver `[[ratelimits]]` en wrangler.toml. */
    LOGIN_RATE_LIMITER?: RateLimiter;
    /** Binding nativo para keys `entregar-actividad:*` — ver `[[ratelimits]]` en wrangler.toml. */
    ENTREGA_RATE_LIMITER?: RateLimiter;
  }
}

const FALLBACK_IP = "ip-desconocida";

/**
 * Selecciona el binding nativo según el prefijo de la key. Los prefijos son exactamente
 * los que usan los llamadores actuales: `login:${ip}` (iniciar-sesion.ts) y
 * `entregar-actividad:${user.id}` (entregar-actividad.ts). Una key con prefijo
 * desconocido devuelve undefined y cae al camino KV, donde `opts` sí gobierna — así un
 * llamador futuro con límites propios no queda atrapado en un binding que no le
 * corresponde.
 */
function limiterNativoPara(env: CloudflareEnv, key: string): RateLimiter | undefined {
  if (key.startsWith("login:")) return env.LOGIN_RATE_LIMITER;
  if (key.startsWith("entregar-actividad:")) return env.ENTREGA_RATE_LIMITER;
  return undefined;
}

/**
 * Rate limiter con dos caminos, en orden de preferencia:
 *
 * 1. Binding nativo de Rate Limiting de Workers, si el prefijo de la key tiene binding y
 *    este existe en el env. A diferencia de KV no consume el cupo de escrituras del plan
 *    Free (1,000/día POR CUENTA — con KV, a escala, el limiter entero desaparecía en
 *    silencio a media mañana, fallando abierto). Semántica a tener presente: los
 *    contadores son POR COLO (datacenter) y eventually consistent — NO es un contador
 *    global exacto; un atacante repartido entre colos ve un límite efectivo mayor.
 *    `period` solo acepta 10 o 60 segundos. Los límites REALES viven en wrangler.toml
 *    (`[[ratelimits]]`); cuando aplica este camino, `opts` se ignora.
 *
 * 2. Fallback: la ventana fija original sobre el KV `RATE_LIMIT_KV` (wrangler.toml).
 *    Se usa cuando el binding nativo no está en el env — `next dev` local, Jest, o si el
 *    plan Free no lo expusiera — o cuando la key no coincide con ningún prefijo
 *    conocido. Aquí `opts.limit`/`opts.windowSeconds` sí gobiernan.
 *
 * FALLA ABIERTO, siempre: sin binding nativo ni KV, `getCloudflareContext()` lanzando
 * (fuera de un runtime de Workers), un error del binding o de KV, o cualquier otra cosa
 * inesperada se atrapa aquí y se trata como "permitido". Este módulo nunca debe ser la
 * razón de que una request legítima — o la app misma — se rompa.
 */
export async function checkRateLimit(
  key: string,
  opts: { limit: number; windowSeconds: number }
): Promise<{ allowed: boolean }> {
  try {
    const { env } = await getCloudflareContext({ async: true });

    // Camino 1: binding nativo. Si su limit() lanza, el catch de abajo falla
    // abierto (no se intenta KV: si el runtime de Workers está tan degradado
    // que el binding nativo falla, gastar escrituras KV no mejora nada).
    const nativo = limiterNativoPara(env, key);
    if (nativo) {
      const { success } = await nativo.limit({ key });
      return { allowed: success };
    }

    // Camino 2: KV (comportamiento original, intacto).
    const kv = env.RATE_LIMIT_KV;
    if (!kv) return { allowed: true };

    // KV es eventually-consistent y este get-then-put no es atómico: bajo
    // ráfagas concurrentes dos requests pueden leer el mismo `count` y ambos
    // escribir `count + 1`, subcontando ligeramente. Aceptable para un
    // rate-limit best-effort (no es un contador financiero); el peor caso es
    // permitir algunas requests de más, nunca bloquear de más.
    const raw = await kv.get(key);
    let count = raw ? Number(raw) : 0;
    if (!Number.isFinite(count)) {
      console.error("[rate-limit] valor corrupto en KV, tratando como 0:", { key, raw });
      count = 0;
    }

    if (count < opts.limit) {
      await kv.put(key, String(count + 1), { expirationTtl: opts.windowSeconds });
      return { allowed: true };
    }

    return { allowed: false };
  } catch (error) {
    console.error("[rate-limit] fail-open:", (error as Error)?.message ?? error);
    return { allowed: true };
  }
}

/**
 * Best-effort client IP for use as (part of) a rate-limit key. Reads `cf-connecting-ip`,
 * the header Cloudflare's edge sets and overwrites on every request (so it can't be spoofed
 * by the client when the app is actually served from behind Cloudflare). Falls back to a
 * constant when the header is absent — e.g. local `next dev`, or any non-Cloudflare
 * environment — in which case callers effectively share one bucket rather than getting a
 * real per-IP limit.
 */
export async function getClientIp(): Promise<string> {
  try {
    const h = await headers();
    return h.get("cf-connecting-ip") || FALLBACK_IP;
  } catch (error) {
    console.error("[rate-limit] getClientIp fail-open:", (error as Error)?.message ?? error);
    return FALLBACK_IP;
  }
}

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

declare global {
  interface CloudflareEnv {
    RATE_LIMIT_KV?: RateLimitKV;
  }
}

const FALLBACK_IP = "ip-desconocida";

/**
 * Fixed-window rate limiter backed by the `RATE_LIMIT_KV` Cloudflare KV namespace
 * (see wrangler.toml). Increments a counter for `key`; once `opts.limit` is reached within
 * `opts.windowSeconds`, further calls are denied until the KV entry's TTL expires and the
 * window resets.
 *
 * FAILS OPEN, always: missing binding, `getCloudflareContext()` throwing (e.g. outside a
 * Workers runtime — local `next dev`, Jest), a KV read/write error, or anything else
 * unexpected is caught here and treated as "allowed". This module must never be the reason
 * a legitimate request — or the app itself — breaks.
 */
export async function checkRateLimit(
  key: string,
  opts: { limit: number; windowSeconds: number }
): Promise<{ allowed: boolean }> {
  try {
    const { env } = await getCloudflareContext({ async: true });
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

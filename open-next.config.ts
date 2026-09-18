import type { OpenNextConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";

const config: OpenNextConfig = {
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: () => kvIncrementalCache,
      tagCache: "dummy",
      queue: "dummy",
    },
  },
  // node:crypto expuesto explícitamente para que Supabase funcione en edge
  edgeExternals: ["node:crypto"],
  middleware: {
    external: true,
    override: {
      wrapper: "cloudflare-edge",
      converter: "edge",
      proxyExternalRequest: "fetch",
      // La intercepción de caché (abajo) corre AQUÍ, en el middleware: sin estos
      // tres, OpenNext cae a sus defaults de AWS (S3/DynamoDB/SQS), falla en
      // silencio y todo termina en el servidor de Next como si no existiera.
      incrementalCache: () => kvIncrementalCache,
      tagCache: "dummy",
      queue: "dummy",
    },
  },
  // Sirve las páginas prerenderizadas (/, /bachillerato, /log-in, avisos) y sus
  // peticiones RSC / prefetch directo desde KV, SIN importar el servidor de Next
  // (handler.mjs, ~9 MB). Medido en producción 2026-09-18: la primera visita a
  // un isolate frío gastaba ~170 ms de CPU solo en arrancar ese servidor, y el
  // plan Free de Workers corta en 10 ms (Error 1102). Si la entrada no está en
  // caché o hay cualquier error, cae al servidor de Next como siempre.
  dangerous: {
    enableCacheInterception: true,
  },
};

export default config;

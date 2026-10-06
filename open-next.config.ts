import type { OpenNextConfig } from "@opennextjs/cloudflare";
// Caché incremental de SOLO LECTURA sobre los static assets del Worker: las
// páginas prerenderizadas se suben con el deploy (cdn-cgi/_next_cache, solo las
// ve el Worker). Antes vivía en KV y cada deploy escribía ahí; KV Free tiene
// 1,000 escrituras/día POR CUENTA y cuando la caché de catálogo las agotaba el
// deploy fallaba (código 10048, 2026-10-06). Válido porque no hay ISR: ninguna
// ruta usa revalidate / revalidatePath / revalidateTag. Si algún día se usa,
// volver a kv-incremental-cache.
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

const config: OpenNextConfig = {
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: () => staticAssetsIncrementalCache,
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
      incrementalCache: () => staticAssetsIncrementalCache,
      tagCache: "dummy",
      queue: "dummy",
    },
  },
  // Sirve las páginas prerenderizadas (/, /bachillerato, /log-in, avisos) y sus
  // peticiones RSC / prefetch directo desde la caché, SIN importar el servidor de Next
  // (handler.mjs, ~9 MB). Medido en producción 2026-09-18: la primera visita a
  // un isolate frío gastaba ~170 ms de CPU solo en arrancar ese servidor, y el
  // plan Free de Workers corta en 10 ms (Error 1102). Si la entrada no está en
  // caché o hay cualquier error, cae al servidor de Next como siempre.
  dangerous: {
    enableCacheInterception: true,
  },
};

export default config;

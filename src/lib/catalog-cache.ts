/**
 * Caché de solo-lectura para datos de CATÁLOGO (currículo: uac, progresiones,
 * actividades, contenido) — idénticos para TODOS los alumnos y que solo cambian
 * cuando se corre una migración de contenido y se re-despliega.
 *
 * Vive en Cloudflare KV (binding `NEXT_INC_CACHE_KV` de wrangler.toml, el mismo
 * namespace del incremental cache de OpenNext, con prefijo propio) para
 * compartir el resultado ENTRE requests y ENTRE usuarios: la primera request de
 * cualquier alumno paga la consulta a Postgres, las demás la sirven desde KV sin
 * tocar la base.
 *
 * Por qué esto importa para el costo: el driver real de gasto es la carga
 * concurrente autenticada contra Postgres, no el tamaño de los datos. ~60% de
 * las consultas del hub son de catálogo compartido; cachearlas colapsa esa carga
 * a "una lectura por clave por TTL" en lugar de "una por alumno por request".
 * Los datos PERSONALES (intentos / progreso) NUNCA pasan por aquí — se consultan
 * vivos con el cliente de sesión del alumno (RLS). La clave de caché NO incluye
 * userId por diseño.
 *
 * Por qué KV manual y no `use cache` / `unstable_cache`:
 *  - `use cache` exige `cacheComponents` (no habilitado; su migración tocaría
 *    todas las rutas dinámicas). `unstable_cache` está deprecado en Next 16.
 *  - Ambos PROHÍBEN leer `cookies()` dentro del scope cacheado, pero el productor
 *    de catálogo necesita el cliente autenticado del alumno: las tablas de
 *    catálogo tienen RLS `TO authenticated` (un cliente anon devolvería 0 filas,
 *    y aflojar la RLS a `anon` expondría las respuestas correctas del jsonb
 *    `contenido`). Aquí el productor corre con la sesión real del alumno (RLS
 *    satisfecha) y solo el RESULTADO se comparte por clave de catálogo. El blob
 *    cacheado vive en KV privado del Worker — misma exposición que hoy.
 *
 * FALLA ABIERTO, siempre: binding ausente (dev local, Jest), getCloudflareContext
 * lanzando fuera de Workers, o cualquier error de KV → se corre el productor y se
 * devuelve su resultado sin cachear. Este módulo jamás debe romper el hub.
 *
 * Presupuesto de escrituras: KV Free = 1,000 writes/DÍA POR CUENTA (ver
 * rate-limit.ts). Solo se escribe en cache MISS; con TTLs largos (horas) y claves
 * gruesas (por semestre / uac) las escrituras quedan muy por debajo del cupo. Las
 * lecturas NO cuentan contra ese cupo.
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";

// Interfaz mínima local del namespace KV — NO usamos @cloudflare/workers-types
// (no está instalado). Mismo patrón que rate-limit.ts / r2-respuestas.ts.
interface CatalogKV {
  get(key: string): Promise<string | null>;
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number }
  ): Promise<void>;
}

declare global {
  interface CloudflareEnv {
    /**
     * KV del incremental cache de OpenNext (ver `[[kv_namespaces]]` en
     * wrangler.toml). Reutilizado aquí para la caché de catálogo con prefijo
     * propio — el presupuesto de escrituras de KV Free es POR CUENTA, así que un
     * namespace nuevo no daría más cupo; reusar este no cuesta un paso de ops.
     */
    NEXT_INC_CACHE_KV?: CatalogKV;
  }
}

/**
 * Bump manual para invalidar TODA la caché de catálogo de golpe. Súbelo (v1→v2…)
 * cuando una migración cambie el contenido/estructura del currículo y vayas a
 * desplegar — así los alumnos no ven catálogo viejo hasta que expire el TTL.
 * (El TTL es solo la red de seguridad si se olvida el bump.)
 */
// v1 → v2 (2026-07-26): se publicaron 258 actividades que estaban en borrador
// (211 video_con_preguntas + 47 de otros tipos). Los árboles `sem:N:tree` y
// `uac:X:progtree` se filtran por RLS `estado='publicada'`, así que toda clave
// cacheada antes de esa publicación lista el catálogo VIEJO y omitiría el
// contenido nuevo hasta 12 h (TREE) / 24 h (CONTENT). El bump las invalida de golpe.
const CATALOG_CACHE_VERSION = "v2";
const PREFIX = `__catalog__:${CATALOG_CACHE_VERSION}:`;

/** TTLs sugeridos (segundos). El catálogo cambia solo al desplegar; el TTL es la red de seguridad. */
export const CATALOG_TTL = {
  /** Árboles gruesos por semestre / uac: pocas claves, baratas de recomputar. */
  TREE: 60 * 60 * 12, // 12 h
  /** Contenido pesado por actividad (jsonb): más valioso de cachear, más volumen de claves. */
  CONTENT: 60 * 60 * 24, // 24 h
} as const;

/**
 * Devuelve datos de catálogo cacheados en KV por `key` (sin userId). En MISS
 * corre `producer()` (consulta autenticada a Postgres) y guarda el resultado con
 * TTL `ttlSeconds`.
 *
 * Solo cachea resultados NO nulos: un `null` del productor significa "no se pudo
 * obtener / no existe", nunca envenena la caché con un vacío espurio y permite
 * que el contenido recién agregado se recoja en la siguiente request. Un vacío
 * LEGÍTIMO (p.ej. una UAC sin progresiones publicadas) debe representarse como un
 * objeto con arreglos vacíos (no como null) para que sí se cachee.
 *
 * Nunca lanza por causa de KV; si el productor lanza, la excepción se propaga
 * (para que withTimeout degrade o withTimeoutOrThrow relance, según el caller).
 */
export async function getCachedCatalog<T>(
  key: string,
  ttlSeconds: number,
  producer: () => Promise<T | null>
): Promise<T | null> {
  const fullKey = PREFIX + key;
  let kv: CatalogKV | undefined;

  // 1. Lectura desde KV (fail-open: cualquier fallo cae al productor)
  try {
    const { env } = await getCloudflareContext({ async: true });
    kv = env.NEXT_INC_CACHE_KV;
    if (kv) {
      const cached = await kv.get(fullKey);
      if (cached !== null) {
        return JSON.parse(cached) as T;
      }
    }
  } catch (error) {
    console.error(
      "[catalog-cache] read fail-open:",
      (error as Error)?.message ?? error
    );
    kv = undefined; // no intentes escribir si el contexto/KV está roto
  }

  // 2. MISS (o sin KV): corre el productor (fuera del try/catch a propósito —
  //    su excepción debe propagarse al caller, no ser tragada aquí).
  const fresh = await producer();

  // 3. Escritura best-effort. Solo cachea resultados reales (no nulos). Nunca lanza.
  if (kv && fresh !== null && fresh !== undefined) {
    try {
      await kv.put(fullKey, JSON.stringify(fresh), {
        expirationTtl: ttlSeconds,
      });
    } catch (error) {
      console.error(
        "[catalog-cache] write fail-open:",
        (error as Error)?.message ?? error
      );
    }
  }

  return fresh;
}

import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Helper fail-safe para descargar el jsonb "respuestas" de `intentos` a R2
 * cuando supera el tamaño que conviene guardar en Postgres (ver
 * `entregar-actividad.ts`). R2 Free da 10 GB + 1M operaciones Clase A/mes —
 * de sobra para reflexiones de texto libre de un ciclo escolar completo — y
 * saca ese jsonb variable del driver de tamaño de la fila en Supabase
 * (plan Free: 500 MB totales).
 *
 * Mismo criterio que `rate-limit.ts`: nunca debe ser la razón de que una
 * entrega falle. `put` devuelve `false` y `get` devuelve `null` ante
 * cualquier problema (binding ausente, `getCloudflareContext()` lanzando
 * fuera de un runtime de Workers, o un error del propio R2) — jamás lanzan.
 * Los llamadores tratan esos valores como "usa el fallback"/"no hay dato",
 * nunca como excepción a atrapar.
 */

/**
 * Forma mínima del binding R2 que usa este módulo. Deliberadamente NO el
 * `R2Bucket` real de `@cloudflare/workers-types` — ese paquete no está
 * instalado en este proyecto (ver el mismo comentario en `rate-limit.ts`
 * sobre `KVNamespace`) — sino una interfaz local call-compatible con los
 * dos métodos que se usan abajo.
 */
interface RespuestasBucket {
  put(
    key: string,
    value: string,
    options?: { httpMetadata?: { contentType?: string } }
  ): Promise<unknown>;
  get(key: string): Promise<{ text(): Promise<string> } | null>;
}

declare global {
  interface CloudflareEnv {
    /** Binding R2 para el jsonb "respuestas" grande — ver `[[r2_buckets]]` en wrangler.toml. */
    RESPUESTAS_BUCKET?: RespuestasBucket;
  }
}

/**
 * Clave determinística por usuario+actividad. Un alumno solo tiene UN
 * intento "completed" por actividad (unique_violation 23505 en
 * `entregar-actividad.ts` lo garantiza), así que sobreescribir esta key en
 * un reintento es correcto: no hay dos entregas legítimas para el mismo par.
 */
function claveRespuestas(userId: string, actividadId: string): string {
  return `respuestas/${userId}/${actividadId}.json`;
}

/**
 * Sube `valor` como JSON a R2. `false` si no hay binding (dev local, Jest,
 * o el binding aún no existe en el env) o si la subida falla — el llamador
 * debe entonces caer a guardar el jsonb completo en Postgres, nunca perder
 * la entrega del alumno por esto.
 */
export async function putRespuestas(
  userId: string,
  actividadId: string,
  valor: unknown
): Promise<boolean> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const bucket = env.RESPUESTAS_BUCKET;
    if (!bucket) return false;

    await bucket.put(claveRespuestas(userId, actividadId), JSON.stringify(valor), {
      httpMetadata: { contentType: "application/json" },
    });
    return true;
  } catch (error) {
    console.error("[r2-respuestas] put fail-safe:", (error as Error)?.message ?? error);
    return false;
  }
}

/**
 * Descarga y parsea el JSON guardado por `putRespuestas`. `null` si no hay
 * binding, si el objeto no existe (nunca se subió, o R2 lo perdió) o si
 * falla por cualquier razón — el llamador debe tratar `null` como "sin
 * datos para revisión", el mismo estado neutral que ya maneja cuando
 * `respuestas` viene null desde Postgres.
 */
export async function getRespuestas(
  userId: string,
  actividadId: string
): Promise<unknown | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const bucket = env.RESPUESTAS_BUCKET;
    if (!bucket) return null;

    const obj = await bucket.get(claveRespuestas(userId, actividadId));
    if (!obj) return null;

    const texto = await obj.text();
    return JSON.parse(texto);
  } catch (error) {
    console.error("[r2-respuestas] get fail-safe:", (error as Error)?.message ?? error);
    return null;
  }
}

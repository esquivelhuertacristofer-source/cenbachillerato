/**
 * Races a promise against a timer. If the timer wins, or the promise rejects
 * for any reason, resolves to `fallback` instead — never throws itself.
 *
 * Used to bound Supabase queries so a slow/hung network call degrades to a
 * safe empty/default value instead of blocking the whole render.
 */
export function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise<T>((resolve) => {
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      resolve(fallback);
    }, ms);

    promise.then(
      (value) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(fallback);
      }
    );
  });
}

/**
 * Variante de `withTimeout` para consultas cuyo resultado "vacío" el caller
 * interpreta como ausencia real (dispara `notFound()`/`redirect()`): en vez
 * de resolver a un fallback —indistinguible de "genuinamente no existe"—
 * relanza el error (timeout o el rechazo original de la promesa). El caller
 * debe vivir bajo un error boundary de ruta (ver src/app/hub/error.tsx) para
 * que el timeout se muestre como un error reintentable en vez de una
 * excepción sin capturar.
 */
export function withTimeoutOrThrow<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error(`Tiempo de espera agotado (${ms}ms)`));
    }, ms);

    promise.then(
      (value) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

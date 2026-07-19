/**
 * Cola de reintentos para entregas de actividad (`entregarActividad`) que
 * fallaron por red o por el servidor. Sigue la convención ya establecida en
 * el proyecto (ver narrador-prefs.ts / useEstrellas.ts): cada acceso a
 * localStorage va envuelto en try/catch silencioso y toda lectura inicial
 * está protegida con `typeof window === "undefined"` para ser SSR-safe. Este
 * módulo nunca debe lanzar — si localStorage no está disponible (modo
 * privado, contexto restringido, cuota llena) la cola simplemente no
 * persiste entre recargas, pero la página sigue funcionando.
 *
 * La cola es POR USUARIO (`cen.syncQueue.entregas.<userId>`), no global. En
 * las PCs compartidas de escuela una clave global provocaba un bug de
 * atribución grave: las entregas encoladas del alumno A se insertaban bajo
 * la sesión del alumno B que entraba después (el flush automático corre con
 * la sesión activa del momento, no con la del alumno que encoló). Cada
 * flush resuelve al usuario con sesión activa EN ESE INSTANTE y procesa
 * solo su cola; las de otros usuarios quedan intactas en la máquina hasta
 * que cada quien vuelva a iniciar sesión ahí.
 *
 * No requiere wiring manual desde un componente: al importarse en el
 * cliente se auto-inicializa (evento 'online' + intervalo) para reintentar
 * lo pendiente, incluso si el alumno ya navegó lejos de la actividad que
 * falló. `enqueue`/`dequeue` son las únicas funciones que otros módulos
 * necesitan llamar explícitamente.
 */

import { entregarActividad } from "@/lib/actions/entregar-actividad";
import { entregarActividadesBatch } from "@/lib/actions/entregar-actividades-batch";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

/**
 * Prefijo común de todas las claves de la cola. La clave real de cada
 * usuario es `<prefijo>.<userId>` (UUID de Supabase, así que no puede
 * colisionar con los sufijos reservados 'anon' y 'legacy').
 */
const PREFIJO_CLAVE = "cen.syncQueue.entregas";
/** Clave GLOBAL antigua (sin userId). Ya no se escribe ni se flushea: solo se migra a cuarentena. */
const CLAVE_LEGACY_GLOBAL = PREFIJO_CLAVE;
/**
 * Cuarentena de la clave global antigua. Las entradas ahí NO son atribuibles
 * con seguridad a un usuario (pudieron encolarse bajo cualquier sesión de la
 * PC compartida), así que NUNCA se flushean: preferimos perder esas entregas
 * antes que insertarlas bajo el alumno equivocado — una entrega perdida se
 * puede rehacer; una calificación atribuida a otro alumno corrompe datos
 * académicos de dos personas y es casi imposible de detectar después.
 */
const CLAVE_CUARENTENA = `${PREFIJO_CLAVE}.legacy`;
/**
 * Cola para entregas encoladas SIN sesión activa (p.ej. token expirado tras
 * horas offline). Tampoco se flushea nunca automáticamente: sin sesión no
 * hay forma segura de saber de quién es la entrega, y el server la
 * rechazaría igual ("No autenticado"). Se conserva solo como respaldo.
 */
const CLAVE_ANON = `${PREFIJO_CLAVE}.anon`;

const INTERVALO_MS = 30_000;
/** Tope de reintentos automáticos por intervalo antes de marcar una entrada como varada (evita martillar p.ej. un 403 permanente cada 30 s). */
const MAX_INTENTOS = 10;
/** Evento disparado en `window` cuando un flush de fondo resuelve una entrega pendiente, para que un componente que siga montado (banner de error) pueda enterarse sin sondear. */
export const EVENTO_SYNC_RESUELTO = "cen:sync-queue:resuelto";
/**
 * Evento disparado en `window` cuando una entrada agota MAX_INTENTOS y queda
 * varada (mismo patrón que EVENTO_SYNC_RESUELTO). Un banner puede escucharlo
 * para avisar al alumno que su entrega sigue guardada localmente pero
 * necesita mejor conexión o un reintento manual. detail: { actividadId }.
 */
export const EVENTO_SYNC_VARADA = "cen:sync-queue:varada";

export interface PayloadEntrega {
  puntaje?: number;
  respuestas?: unknown;
  tiempoSegundos?: number;
}

interface EntradaCola {
  actividadId: string;
  resultado: PayloadEntrega;
  intentos: number;
  ts: number;
  /**
   * true cuando la entrada agotó MAX_INTENTOS. NO se borra (borrarla perdía
   * en silencio la entrega del alumno con solo ~5 min de BD caída): deja de
   * reintentarse en el tick de 30 s, pero SÍ se reintenta en el evento
   * 'online' y al cargar la página — momentos en los que las condiciones
   * cambiaron de verdad, no un timer ciego.
   */
  varada?: boolean;
}

type Cola = Record<string, EntradaCola>;

function claveDeUsuario(userId: string): string {
  return `${PREFIJO_CLAVE}.${userId}`;
}

/**
 * Resuelve el id del usuario con sesión activa vía el cliente browser de
 * Supabase. `auth.getSession()` lee la sesión de cookies/localStorage sin
 * salir a red, así que es seguro llamarla incluso offline. Devuelve null si
 * no hay sesión (o si el cliente no puede crearse, p.ej. env vars ausentes).
 */
async function obtenerUserId(): Promise<string | null> {
  try {
    const sb = getSupabaseBrowser();
    const { data } = await sb.auth.getSession();
    return data.session?.user?.id ?? null;
  } catch {
    return null;
  }
}

function leerCola(clave: string): Cola {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(clave);
    return raw ? (JSON.parse(raw) as Cola) : {};
  } catch {
    return {}; // JSON corrupto o storage no disponible: se trata como vacía
  }
}

function escribirCola(clave: string, cola: Cola) {
  try {
    window.localStorage.setItem(clave, JSON.stringify(cola));
  } catch {
    /* localStorage no disponible: la cola solo vive en memoria de esta pestaña */
  }
}

/**
 * Migra la clave global antigua a cuarentena. Se llama al inicializar el
 * módulo y al inicio de cada flush (cubre el caso de una pestaña con código
 * viejo escribiendo la clave global mientras otra ya corre este código).
 * Ver el comentario de CLAVE_CUARENTENA para el porqué de no flushearla.
 */
function cuarentenarClaveLegacy() {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(CLAVE_LEGACY_GLOBAL);
    if (raw === null) return;
    try {
      const legacy = JSON.parse(raw) as Cola;
      const cuarentena = leerCola(CLAVE_CUARENTENA);
      for (const [id, entrada] of Object.entries(legacy)) {
        // Ante colisión gana la entrada más reciente (mismo last-write-wins
        // por actividadId que usa enqueue).
        const previa = cuarentena[id];
        if (!previa || (entrada?.ts ?? 0) > (previa.ts ?? 0)) cuarentena[id] = entrada;
      }
      escribirCola(CLAVE_CUARENTENA, cuarentena);
    } catch {
      /* JSON legacy corrupto: no hay nada rescatable, solo se elimina */
    }
    window.localStorage.removeItem(CLAVE_LEGACY_GLOBAL);
  } catch {
    /* storage no disponible: nada que migrar */
  }
}

/**
 * Detecta la respuesta de rate limit de `entregarActividad` (30 entregas /
 * 60 s por usuario). Acoplado al texto exacto que devuelve
 * entregar-actividad.ts porque el server action solo expone `{ error:
 * string }` (cambiar su forma pública rompería a sus otros llamadores);
 * si ese mensaje cambia, actualizar aquí.
 */
function esErrorRateLimit(mensaje: string): boolean {
  return mensaje.startsWith("Demasiados intentos");
}

let sincronizando = false;

export const syncQueue = {
  /**
   * Encola (o sobreescribe) la entrega fallida de una actividad bajo la cola
   * del usuario con sesión activa (o bajo la cola anónima si no hay sesión;
   * esa nunca se flushea sola). Overwrite = last-write-wins por
   * `actividadId`: si el alumno reintentó varias veces offline, solo el
   * resultado más reciente importa (mismo criterio que el patrón MAX ya
   * usado en guardarEstrellas para reconciliar local/remoto). Una entrega
   * recién encolada resetea `intentos`/`varada`: viene de una acción manual
   * del alumno, así que merece su ronda completa de reintentos (con 'varada'
   * en lugar de borrado ya no hay riesgo de reintentos eternos).
   */
  async enqueue(actividadId: string, resultado: PayloadEntrega) {
    try {
      const userId = await obtenerUserId();
      const clave = userId ? claveDeUsuario(userId) : CLAVE_ANON;
      const cola = leerCola(clave);
      cola[actividadId] = {
        actividadId,
        resultado,
        intentos: 0,
        ts: Date.now(),
      };
      escribirCola(clave, cola);
    } catch {
      /* nunca debe tumbar la página por esto */
    }
  },

  /**
   * Quita una entrada de la cola del usuario actual (p.ej. tras un reintento
   * manual exitoso). Limpia también la copia anónima si existiera: una
   * entrega pudo encolarse en `.anon` con el token expirado y luego tener
   * éxito por la vía manual ya con sesión renovada; sin esta limpieza esa
   * copia quedaría huérfana para siempre (inofensiva — `.anon` nunca se
   * flushea — pero es basura). No-op si no existía en ninguna.
   */
  async dequeue(actividadId: string) {
    try {
      const userId = await obtenerUserId();
      const claves = userId ? [claveDeUsuario(userId), CLAVE_ANON] : [CLAVE_ANON];
      for (const clave of claves) {
        const cola = leerCola(clave);
        if (!(actividadId in cola)) continue;
        delete cola[actividadId];
        escribirCola(clave, cola);
      }
    } catch {
      /* noop */
    }
  },

  /** Lista las entradas pendientes del usuario con sesión activa (vacía si no hay sesión). */
  async list(): Promise<EntradaCola[]> {
    try {
      const userId = await obtenerUserId();
      if (!userId) return [];
      return Object.values(leerCola(claveDeUsuario(userId)));
    } catch {
      return [];
    }
  },

  /**
   * Reintenta las entregas pendientes DEL USUARIO CON SESIÓN ACTIVA contra
   * el servidor. El usuario se resuelve al inicio de CADA flush (nunca se
   * cachea entre flushes): en una PC compartida la sesión puede cambiar
   * entre un tick y el siguiente, y cachearla reintroduciría el bug de
   * atribución. Sin sesión no se flushea nada. Serializado con
   * `sincronizando` para que el evento 'online' y el intervalo no disparen
   * dos flushes en paralelo. No navega ni toca UI: quien esté mirando la
   * actividad en ese momento (si acaso) se entera vía EVENTO_SYNC_RESUELTO /
   * EVENTO_SYNC_VARADA; esta cola es puramente un mecanismo de persistencia
   * de datos, no de navegación (evita mandar al alumno a otra pantalla desde
   * un timer de fondo).
   *
   * `incluirVaradas`: el tick de 30 s llama sin ella (las varadas ya
   * demostraron que el timer no las destranca); el evento 'online' y la
   * carga de página llaman con true, porque ahí las condiciones sí
   * cambiaron.
   *
   * Con MÁS DE UNA pendiente usa `entregarActividadesBatch` en una sola
   * llamada (`_flushLote`); con exactamente una usa la action individual
   * (`_flushUno`) — no hay beneficio en pagar el overhead del lote (y su
   * propio tope de 20 ítems) para un solo elemento. Ambos caminos respetan
   * la misma clasificación varada/transitoria y disparan los mismos eventos
   * (`EVENTO_SYNC_RESUELTO` / `EVENTO_SYNC_VARADA`) que ya escuchan los
   * componentes.
   */
  async flush(opts?: { incluirVaradas?: boolean }) {
    if (sincronizando) return;
    if (typeof window === "undefined") return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) return;

    // El flag se activa ANTES del primer await: entre resolver la sesión y
    // leer la cola no debe colarse un segundo flush concurrente.
    sincronizando = true;
    try {
      cuarentenarClaveLegacy();

      const userId = await obtenerUserId();
      if (!userId) return; // sin sesión: las colas de otros usuarios y la anónima quedan intactas

      const clave = claveDeUsuario(userId);
      const todas = Object.values(leerCola(clave));
      const pendientes = opts?.incluirVaradas ? todas : todas.filter((e) => !e.varada);
      if (pendientes.length === 0) return;

      if (pendientes.length > 1) {
        await this._flushLote(clave, pendientes);
      } else {
        // pendientes.length === 1 aquí (el 0 ya se descartó arriba); el
        // acceso queda como `| undefined` solo por noUncheckedIndexedAccess.
        const unica = pendientes[0];
        if (unica) await this._flushUno(clave, unica);
      }
    } finally {
      sincronizando = false;
    }
  },

  /**
   * Entrega UNA entrada pendiente vía la action individual
   * (`entregarActividad`). Es el cuerpo original de `flush` antes de existir
   * el camino en lote, extraído para que `flush` pueda elegir entre este y
   * `_flushLote` según cuántas pendientes haya.
   */
  async _flushUno(clave: string, entrada: EntradaCola) {
    try {
      const res = await entregarActividad(entrada.actividadId, entrada.resultado);
      if ("ok" in res) {
        // Se espera el dequeue para que la entrada quede fuera de
        // localStorage ANTES de seguir: un flush que terminara con
        // dequeues pendientes dejaría una ventana en la que otro flush
        // podría releer y reenviar una entrega ya guardada.
        await this.dequeue(entrada.actividadId);
        window.dispatchEvent(
          new CustomEvent(EVENTO_SYNC_RESUELTO, { detail: { actividadId: entrada.actividadId } })
        );
      } else if (esErrorRateLimit(res.error)) {
        // El server nos está limitando (30/60 s por usuario): esta entrada
        // NO suma intento (el throttle no es culpa suya); se reintenta en
        // el próximo tick.
      } else {
        this._bumpIntentos(clave, entrada.actividadId);
      }
    } catch {
      // Sigue sin conexión (o el server no respondió): se reintenta en
      // el próximo evento 'online' o tick del intervalo. Nada se pierde.
      this._bumpIntentos(clave, entrada.actividadId);
    }
  },

  /**
   * Entrega VARIAS pendientes en UNA sola llamada a `entregarActividadesBatch`
   * (auth + rate limit se resuelven una vez para todo el lote server-side).
   *
   * - Si la llamada responde `{ ok, resultados }`: cada ítem se trata
   *   exactamente como en `_flushUno` (dequeue + EVENTO_SYNC_RESUELTO si tuvo
   *   éxito, `_bumpIntentos` si no) — el lote es solo transporte, no cambia
   *   la semántica por ítem.
   * - Si la llamada responde `{ error }` (p.ej. rate limit del lote, o
   *   cualquier otra falla que impidió procesar el lote completo): NINGÚN
   *   ítem suma intento, igual que el corte por rate limit en `_flushUno` —
   *   la falla es del lote, no de una entrada en particular, y se reintenta
   *   entero en el próximo tick.
   * - Si la promesa se rechaza (sin red / server no respondió): tampoco se
   *   sabe qué ítem falló, así que se suma intento a CADA pendiente del
   *   lote (equivalente a que cada una hubiera fallado individualmente por
   *   red, como en el catch de `_flushUno`).
   */
  async _flushLote(clave: string, pendientes: EntradaCola[]) {
    try {
      const res = await entregarActividadesBatch(
        pendientes.map((e) => ({ actividadId: e.actividadId, resultado: e.resultado }))
      );
      if ("error" in res) {
        return; // falla del lote completo: ningún ítem suma intento, se reintenta entero
      }
      for (const item of res.resultados) {
        if ("ok" in item) {
          await this.dequeue(item.actividadId);
          window.dispatchEvent(
            new CustomEvent(EVENTO_SYNC_RESUELTO, { detail: { actividadId: item.actividadId } })
          );
        } else {
          this._bumpIntentos(clave, item.actividadId);
        }
      }
    } catch {
      for (const entrada of pendientes) {
        this._bumpIntentos(clave, entrada.actividadId);
      }
    }
  },

  /**
   * Incrementa el contador de intentos de una entrada de la cola `clave`; al
   * llegar a MAX_INTENTOS la marca como varada (NUNCA la borra: borrar
   * perdía la entrega del alumno en silencio con que la BD estuviera caída
   * ~5 minutos) y lo anuncia una sola vez vía EVENTO_SYNC_VARADA para que
   * un banner pueda avisar al alumno.
   */
  _bumpIntentos(clave: string, actividadId: string) {
    try {
      const cola = leerCola(clave);
      const entrada = cola[actividadId];
      if (!entrada) return;
      entrada.intentos += 1;
      if (!entrada.varada && entrada.intentos >= MAX_INTENTOS) {
        entrada.varada = true;
        escribirCola(clave, cola);
        console.warn(
          `[syncQueue] Entrega de actividad ${actividadId} varada tras ${MAX_INTENTOS} intentos fallidos; se conserva y se reintentará al volver la conexión o recargar.`
        );
        window.dispatchEvent(new CustomEvent(EVENTO_SYNC_VARADA, { detail: { actividadId } }));
        return;
      }
      escribirCola(clave, cola);
    } catch {
      /* noop */
    }
  },
};

// ── Auto-inicialización en cliente ──────────────────────────────────────
// Un único listener 'online' + un único intervalo por pestaña, sin importar
// cuántas veces se importe/reevalúe este módulo (HMR en dev puede
// re-ejecutar el cuerpo del módulo al recargar en caliente).
declare global {
  interface Window {
    __cenSyncQueueInit?: boolean;
  }
}

if (typeof window !== "undefined" && !window.__cenSyncQueueInit) {
  window.__cenSyncQueueInit = true;
  cuarentenarClaveLegacy();
  // 'online' y la carga de página sí reintentan las varadas: son las señales
  // de que las condiciones cambiaron. El intervalo de 30 s no las incluye.
  window.addEventListener("online", () => void syncQueue.flush({ incluirVaradas: true }));
  window.setInterval(() => void syncQueue.flush(), INTERVALO_MS);
  // Intento inmediato al cargar: cubre el caso de recargar la página ya con
  // conexión habiendo quedado entregas pendientes de una sesión offline.
  void syncQueue.flush({ incluirVaradas: true });
}

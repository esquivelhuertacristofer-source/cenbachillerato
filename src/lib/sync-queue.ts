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
 * No requiere wiring manual desde un componente: al importarse en el
 * cliente se auto-inicializa (evento 'online' + intervalo) para reintentar
 * lo pendiente, incluso si el alumno ya navegó lejos de la actividad que
 * falló. `enqueue`/`dequeue` son las únicas funciones que otros módulos
 * necesitan llamar explícitamente.
 */

import { entregarActividad } from "@/lib/actions/entregar-actividad";

const CLAVE = "cen.syncQueue.entregas";
const INTERVALO_MS = 30_000;
/** Tope de reintentos antes de abandonar una entrada (evita reintentos eternos p.ej. contra un 403 permanente). */
const MAX_INTENTOS = 10;
/** Evento disparado en `window` cuando un flush de fondo resuelve una entrega pendiente, para que un componente que siga montado (banner de error) pueda enterarse sin sondear. */
export const EVENTO_SYNC_RESUELTO = "cen:sync-queue:resuelto";

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
}

type Cola = Record<string, EntradaCola>;

function leerCola(): Cola {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(CLAVE);
    return raw ? (JSON.parse(raw) as Cola) : {};
  } catch {
    return {}; // JSON corrupto o storage no disponible: se trata como vacía
  }
}

function escribirCola(cola: Cola) {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(cola));
  } catch {
    /* localStorage no disponible: la cola solo vive en memoria de esta pestaña */
  }
}

let sincronizando = false;

export const syncQueue = {
  /**
   * Encola (o sobreescribe) la entrega fallida de una actividad. Overwrite =
   * last-write-wins por `actividadId`: si el alumno reintentó varias veces
   * offline, solo el resultado más reciente importa (mismo criterio que el
   * patrón MAX ya usado en guardarEstrellas para reconciliar local/remoto).
   */
  enqueue(actividadId: string, resultado: PayloadEntrega) {
    try {
      const cola = leerCola();
      const previa = cola[actividadId];
      cola[actividadId] = {
        actividadId,
        resultado,
        intentos: previa?.intentos ?? 0,
        ts: Date.now(),
      };
      escribirCola(cola);
    } catch {
      /* nunca debe tumbar la página por esto */
    }
  },

  /** Quita una entrada de la cola (p.ej. tras un reintento manual exitoso). No-op si no existía. */
  dequeue(actividadId: string) {
    try {
      const cola = leerCola();
      if (!(actividadId in cola)) return;
      delete cola[actividadId];
      escribirCola(cola);
    } catch {
      /* noop */
    }
  },

  list(): EntradaCola[] {
    try {
      return Object.values(leerCola());
    } catch {
      return [];
    }
  },

  /**
   * Reintenta todas las entregas pendientes contra el servidor. Serializado
   * con `sincronizando` para que el evento 'online' y el intervalo no
   * disparen dos flushes en paralelo. No navega ni toca UI: quien esté
   * mirando la actividad en ese momento (si acaso) se entera porque el
   * banner de error desaparece la próxima vez que reintente manualmente;
   * esta cola es puramente un mecanismo de persistencia de datos, no de
   * navegación (evita mandar al alumno a otra pantalla desde un timer de
   * fondo).
   */
  async flush() {
    if (sincronizando) return;
    if (typeof window === "undefined") return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) return;

    const pendientes = this.list();
    if (pendientes.length === 0) return;

    sincronizando = true;
    try {
      for (const entrada of pendientes) {
        try {
          const res = await entregarActividad(entrada.actividadId, entrada.resultado);
          if ("ok" in res) {
            this.dequeue(entrada.actividadId);
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent(EVENTO_SYNC_RESUELTO, { detail: { actividadId: entrada.actividadId } })
              );
            }
          } else {
            this._bumpIntentos(entrada.actividadId);
          }
        } catch {
          // Sigue sin conexión (o el server no respondió): se reintenta en
          // el próximo evento 'online' o tick del intervalo. Nada se pierde.
          this._bumpIntentos(entrada.actividadId);
        }
      }
    } finally {
      sincronizando = false;
    }
  },

  /** Incrementa el contador de intentos; si supera MAX_INTENTOS abandona la entrada (nada la habría desatascado igual: red intacta pero el server la rechaza siempre, p.ej. sesión expirada). */
  _bumpIntentos(actividadId: string) {
    try {
      const cola = leerCola();
      const entrada = cola[actividadId];
      if (!entrada) return;
      entrada.intentos += 1;
      if (entrada.intentos >= MAX_INTENTOS) {
        delete cola[actividadId];
        escribirCola(cola);
        console.warn(
          `[syncQueue] Entrega de actividad ${actividadId} abandonada tras ${MAX_INTENTOS} intentos fallidos.`
        );
        return;
      }
      escribirCola(cola);
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
  window.addEventListener("online", () => void syncQueue.flush());
  window.setInterval(() => void syncQueue.flush(), INTERVALO_MS);
  // Intento inmediato al cargar: cubre el caso de recargar la página ya con
  // conexión habiendo quedado entregas pendientes de una sesión offline.
  void syncQueue.flush();
}

/**
 * Store externo de preferencias del lector en voz alta (Web Speech API).
 *
 * Se consume con `useSyncExternalStore` para que el primer render del cliente
 * coincida con el SSR (getServerSnapshot devuelve los valores por defecto) y la
 * hidratación desde localStorage ocurra DESPUÉS, dentro de `subscribe` —nunca en
 * el cuerpo de un efecto ni en render—, notificando a los suscriptores.
 *
 * El snapshot mantiene una referencia ESTABLE: solo se reemplaza el objeto
 * cuando un valor cambia, para no provocar bucles en useSyncExternalStore.
 */

export interface NarradorPrefs {
  /** voiceURI de la voz elegida; null = elegir automáticamente la mejor es-*. */
  vozURI: string | null;
  /** Velocidad de lectura, 0.5–2. */
  rate: number;
}

const CLAVE_VOZ = "cen.narrador.voz";
const CLAVE_RATE = "cen.narrador.rate";

const DEFECTOS: NarradorPrefs = Object.freeze({ vozURI: null, rate: 1 });

let actual: NarradorPrefs = DEFECTOS;
let hidratado = false;
const oyentes = new Set<() => void>();

function clampRate(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.min(2, Math.max(0.5, n));
}

function notificar() {
  for (const o of oyentes) o();
}

function hidratar() {
  if (hidratado || typeof window === "undefined") return;
  hidratado = true;
  try {
    const voz = window.localStorage.getItem(CLAVE_VOZ);
    const rateRaw = window.localStorage.getItem(CLAVE_RATE);
    const rate = rateRaw != null ? clampRate(Number(rateRaw)) : DEFECTOS.rate;
    const vozURI = voz && voz.trim() ? voz : DEFECTOS.vozURI;
    if (vozURI !== actual.vozURI || rate !== actual.rate) {
      actual = { vozURI, rate };
      notificar();
    }
  } catch {
    /* localStorage no disponible (modo privado, etc.): se queda en defectos. */
  }
}

export const narradorStore = {
  subscribe(listener: () => void): () => void {
    oyentes.add(listener);
    // Hidrata al primer suscriptor (ya en cliente, fuera de render).
    hidratar();
    return () => {
      oyentes.delete(listener);
    };
  },
  getSnapshot(): NarradorPrefs {
    return actual;
  },
  getServerSnapshot(): NarradorPrefs {
    return DEFECTOS;
  },
  setVoz(vozURI: string | null) {
    if (vozURI === actual.vozURI) return;
    actual = { ...actual, vozURI };
    try {
      if (vozURI) window.localStorage.setItem(CLAVE_VOZ, vozURI);
      else window.localStorage.removeItem(CLAVE_VOZ);
    } catch {
      /* ignora fallo de persistencia */
    }
    notificar();
  },
  setRate(rate: number) {
    const r = clampRate(rate);
    if (r === actual.rate) return;
    actual = { ...actual, rate: r };
    try {
      window.localStorage.setItem(CLAVE_RATE, String(r));
    } catch {
      /* ignora fallo de persistencia */
    }
    notificar();
  },
};

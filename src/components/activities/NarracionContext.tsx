"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";

import { narradorStore } from "@/lib/narrador-prefs";

/**
 * Narrador nativo del navegador (Web Speech API) para CUALQUIER actividad.
 *
 * - Las lecturas (y otros componentes con prosa) registran un texto limpio con
 *   {@link useRegistrarNarracion}; el botón lo lee tal cual.
 * - Si nadie registra texto, el botón cae al `innerText` del contenido en
 *   pantalla (el contenedor referenciado por `contentRef`), de modo que TODAS
 *   las actividades tienen narrador funcional sin tocar cada componente.
 * - Si el navegador no soporta `speechSynthesis`, el botón simplemente no se
 *   renderiza (degradación elegante).
 */

interface NarracionCtx {
  /** Registra el texto limpio a narrar (null para volver al fallback de pantalla). */
  registrar: (texto: string | null) => void;
  /** Ref al contenedor del contenido visible; fallback cuando no hay texto registrado. */
  contentRef: RefObject<HTMLDivElement | null>;
}

const Ctx = createContext<NarracionCtx | null>(null);

export function NarracionProvider({ children }: { children: ReactNode }) {
  const textoRef = useRef<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const registrar = useCallback((texto: string | null) => {
    textoRef.current = texto;
  }, []);

  // Al desmontar la actividad (p.ej. navegar a otra), corta cualquier locución.
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <Ctx.Provider value={{ registrar, contentRef }}>
      <NarracionTextoRefContext.Provider value={textoRef}>
        {children}
      </NarracionTextoRefContext.Provider>
    </Ctx.Provider>
  );
}

// El botón necesita leer el texto registrado en tiempo de clic (no de render),
// así que el ref viaja por un contexto aparte para no re-renderizar a nadie.
const NarracionTextoRefContext = createContext<RefObject<string | null> | null>(null);

/**
 * Hook para que un componente de actividad registre la prosa que debe leerse.
 * Se re-registra cuando cambia `texto` y se limpia al desmontar.
 */
export function useRegistrarNarracion(texto: string | null | undefined) {
  const ctx = useContext(Ctx);
  useEffect(() => {
    if (!ctx) return;
    ctx.registrar(texto && texto.trim() ? texto : null);
    return () => ctx.registrar(null);
  }, [ctx, texto]);
}

/** Asigna el `contentRef` del provider a un contenedor (el wrapper de children). */
export function useContenidoRef(): RefObject<HTMLDivElement | null> | undefined {
  return useContext(Ctx)?.contentRef;
}

/**
 * Envuelve el contenido visible de la actividad y le adjunta el `contentRef`,
 * de modo que el narrador pueda leer el texto en pantalla cuando no hay prosa
 * registrada explícitamente.
 */
export function ContenidoNarrable({ children }: { children: ReactNode }) {
  const ref = useContenidoRef();
  return <div ref={ref}>{children}</div>;
}

type EstadoNarrador = "idle" | "playing" | "paused";

/** Trocea el texto en fragmentos cortos por oración: evita el corte de ~15 s de Chrome. */
function trocear(texto: string): string[] {
  const limpio = texto.replace(/\s+/g, " ").trim();
  if (!limpio) return [];
  const oraciones = limpio.match(/[^.!?]+[.!?]*\s*/g) ?? [limpio];
  const trozos: string[] = [];
  let buffer = "";
  for (const o of oraciones) {
    if ((buffer + o).length > 220 && buffer) {
      trozos.push(buffer.trim());
      buffer = o;
    } else {
      buffer += o;
    }
  }
  if (buffer.trim()) trozos.push(buffer.trim());
  return trozos;
}

/** Soporte del narrador nativo, leído sin setState-en-effect (evita mismatch SSR). */
const SUSCRIBIR_NOOP = () => () => {};
function leerSoporte(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function elegirVozEspanol(
  voces: SpeechSynthesisVoice[],
  vozURI: string | null,
): SpeechSynthesisVoice | null {
  if (vozURI) {
    const elegida = voces.find((x) => x.voiceURI === vozURI);
    if (elegida) return elegida;
  }
  return (
    voces.find((x) => /es[-_]MX/i.test(x.lang)) ??
    voces.find((x) => /es[-_]419/i.test(x.lang)) ??
    voces.find((x) => /es[-_]US/i.test(x.lang)) ??
    voces.find((x) => /^es/i.test(x.lang)) ??
    null
  );
}

/* ── Store externo de voces disponibles (se llenan async vía voiceschanged) ── */
const VOCES_VACIO: SpeechSynthesisVoice[] = [];
let vocesCache: SpeechSynthesisVoice[] = VOCES_VACIO;
const vocesOyentes = new Set<() => void>();

function leerVocesEspanol(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return VOCES_VACIO;
  const todas = window.speechSynthesis.getVoices().filter((v) => /^es/i.test(v.lang));
  // Conserva referencia estable si el conjunto no cambió (clave para useSyncExternalStore).
  if (
    todas.length === vocesCache.length &&
    todas.every((v, i) => v.voiceURI === vocesCache[i]?.voiceURI)
  ) {
    return vocesCache;
  }
  vocesCache = todas;
  return vocesCache;
}

const vocesStore = {
  subscribe(listener: () => void): () => void {
    vocesOyentes.add(listener);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const onVoices = () => {
        leerVocesEspanol();
        for (const o of vocesOyentes) o();
      };
      window.speechSynthesis.getVoices(); // dispara carga async en algunos navegadores
      onVoices();
      window.speechSynthesis.addEventListener?.("voiceschanged", onVoices);
      return () => {
        window.speechSynthesis.removeEventListener?.("voiceschanged", onVoices);
        vocesOyentes.delete(listener);
      };
    }
    return () => vocesOyentes.delete(listener);
  },
  getSnapshot: () => leerVocesEspanol(),
  getServerSnapshot: () => VOCES_VACIO,
};

const VELOCIDADES = [0.75, 1, 1.25, 1.5, 2] as const;

/**
 * Lector en voz alta avanzado. Lee el texto registrado (o el contenido en
 * pantalla) con la Web Speech API y ofrece accesibilidad real:
 * - reproducir / pausar-reanudar / detener (máquina de 3 estados),
 * - selección de voz en español y velocidad 0.75×–2× (persistidas),
 * - subtítulo "karaoke" que resalta el fragmento que se está leyendo.
 */
export function NarradorControl({ accentHex }: { accentHex: string }) {
  const ctx = useContext(Ctx);
  const textoRef = useContext(NarracionTextoRefContext);
  const soportado = useSyncExternalStore(SUSCRIBIR_NOOP, leerSoporte, () => false);
  const voces = useSyncExternalStore(
    vocesStore.subscribe,
    vocesStore.getSnapshot,
    vocesStore.getServerSnapshot,
  );
  const prefs = useSyncExternalStore(
    narradorStore.subscribe,
    narradorStore.getSnapshot,
    narradorStore.getServerSnapshot,
  );
  const [estado, setEstado] = useState<EstadoNarrador>("idle");
  const [fragmento, setFragmento] = useState<string | null>(null);
  const [ajustes, setAjustes] = useState(false);

  const detener = useCallback(() => {
    if (!soportado) return;
    window.speechSynthesis.cancel();
    setEstado("idle");
    setFragmento(null);
  }, [soportado]);

  const iniciar = useCallback(() => {
    if (!soportado || !ctx) return;
    const registrado = textoRef?.current;
    const fallback = ctx.contentRef.current?.innerText ?? "";
    const fuente = registrado && registrado.trim() ? registrado : fallback;
    const trozos = trocear(fuente);
    if (trozos.length === 0) return;

    const synth = window.speechSynthesis;
    synth.cancel();
    const voz = elegirVozEspanol(synth.getVoices(), prefs.vozURI);
    const rate = Math.min(2, Math.max(0.5, prefs.rate));
    setEstado("playing");
    // La Web Speech API encola las utterances y las reproduce en orden; trocear
    // en fragmentos cortos evita el corte de ~15 s de Chrome. El último marca el fin.
    trozos.forEach((frag, i) => {
      const u = new SpeechSynthesisUtterance(frag);
      u.lang = voz?.lang ?? "es-MX";
      if (voz) u.voice = voz;
      u.rate = rate;
      u.pitch = 1;
      // onstart/onend son callbacks de evento (no cuerpo de efecto): aquí sí
      // podemos fijar estado para mover el resaltado del subtítulo.
      u.onstart = () => setFragmento(frag);
      if (i === trozos.length - 1) {
        u.onend = () => {
          setEstado("idle");
          setFragmento(null);
        };
      }
      u.onerror = () => {
        setEstado("idle");
        setFragmento(null);
      };
      synth.speak(u);
    });
  }, [soportado, ctx, textoRef, prefs.vozURI, prefs.rate]);

  const alternarReproduccion = useCallback(() => {
    if (!soportado) return;
    const synth = window.speechSynthesis;
    if (estado === "idle") {
      iniciar();
    } else if (estado === "playing") {
      synth.pause();
      setEstado("paused");
    } else {
      synth.resume();
      setEstado("playing");
    }
  }, [soportado, estado, iniciar]);

  if (!soportado) return null;

  const activo = estado !== "idle";
  const reproduciendo = estado === "playing";
  const iconoPrincipal = estado === "idle"
    ? "fa-volume-high"
    : reproduciendo
      ? "fa-pause"
      : "fa-play";
  const etiquetaPrincipal = estado === "idle"
    ? "Escuchar en voz alta"
    : reproduciendo
      ? "Pausar narración"
      : "Reanudar narración";

  const pill = (extra: CSSProperties): CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "5px 14px",
    borderRadius: 999,
    fontSize: 10,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    cursor: "pointer",
    transition: "all 0.2s ease",
    ...extra,
  });
  const activoBg: CSSProperties = {
    color: accentHex,
    background: `${accentHex}1f`,
    border: `1px solid ${accentHex}55`,
  };
  const inactivoBg: CSSProperties = {
    color: "rgba(255,255,255,0.62)",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.10)",
  };

  return (
    <span
      role="group"
      aria-label="Lector en voz alta"
      style={{ display: "inline-flex", alignItems: "center", gap: 6, position: "relative" }}
    >
      <button
        type="button"
        onClick={alternarReproduccion}
        aria-label={etiquetaPrincipal}
        aria-pressed={activo}
        title={etiquetaPrincipal}
        className="ash-narrador"
        style={pill(activo ? activoBg : inactivoBg)}
      >
        <i className={`fa-solid ${iconoPrincipal}`} style={{ fontSize: 11 }} />
        {estado === "idle" ? "Escuchar" : reproduciendo ? "Pausar" : "Reanudar"}
        {reproduciendo && (
          <span className="ash-narrador-eq" aria-hidden="true">
            <span /><span /><span />
          </span>
        )}
      </button>

      {activo && (
        <button
          type="button"
          onClick={detener}
          aria-label="Detener narración"
          title="Detener narración"
          className="ash-narrador"
          style={pill({ ...inactivoBg, padding: "5px 10px" })}
        >
          <i className="fa-solid fa-stop" style={{ fontSize: 11 }} />
        </button>
      )}

      <button
        type="button"
        onClick={() => setAjustes((a) => !a)}
        aria-label="Ajustes de lectura (voz y velocidad)"
        aria-expanded={ajustes}
        title="Ajustes de lectura"
        className="ash-narrador"
        style={pill({ ...inactivoBg, padding: "5px 10px" })}
      >
        <i className="fa-solid fa-sliders" style={{ fontSize: 11 }} />
      </button>

      {ajustes && (
        <div
          role="group"
          aria-label="Ajustes del lector"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            zIndex: 40,
            width: 248,
            padding: 14,
            borderRadius: 14,
            background: "rgba(2,12,28,0.97)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 18px 48px rgba(0,0,0,0.5)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            textTransform: "none",
            letterSpacing: "normal",
          }}
        >
          <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.72)" }}>
              Voz
            </span>
            <select
              value={prefs.vozURI ?? ""}
              onChange={(e) => narradorStore.setVoz(e.target.value || null)}
              aria-label="Voz del lector"
              style={{
                fontSize: 12,
                padding: "7px 8px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.06)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.14)",
              }}
            >
              <option value="">Automática (mejor en español)</option>
              {voces.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
            {voces.length === 0 && (
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
                Tu navegador no expone voces en español; se usará la del sistema.
              </span>
            )}
          </label>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.72)" }}>
              Velocidad: {prefs.rate.toFixed(2)}×
            </span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {VELOCIDADES.map((v) => {
                const sel = Math.abs(prefs.rate - v) < 0.001;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => narradorStore.setRate(v)}
                    aria-pressed={sel}
                    aria-label={`Velocidad ${v}x`}
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "5px 9px",
                      borderRadius: 8,
                      cursor: "pointer",
                      color: sel ? accentHex : "rgba(255,255,255,0.66)",
                      background: sel ? `${accentHex}22` : "rgba(255,255,255,0.05)",
                      border: sel ? `1px solid ${accentHex}66` : "1px solid rgba(255,255,255,0.10)",
                    }}
                  >
                    {v}×
                  </button>
                );
              })}
            </div>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
              El cambio se aplica al volver a iniciar la lectura.
            </span>
          </div>
        </div>
      )}

      {fragmento && (
        <span
          className="ash-narrador-caption"
          aria-hidden="true"
          style={{
            position: "fixed",
            left: "50%",
            bottom: 24,
            transform: "translateX(-50%)",
            zIndex: 60,
            maxWidth: "min(720px, 92vw)",
            padding: "12px 20px",
            borderRadius: 14,
            background: "rgba(2,8,20,0.94)",
            border: `1px solid ${accentHex}55`,
            boxShadow: "0 16px 44px rgba(0,0,0,0.55)",
            color: "#fff",
            fontSize: 17,
            lineHeight: 1.5,
            fontWeight: 600,
            textAlign: "center",
            textTransform: "none",
            letterSpacing: "normal",
          }}
        >
          <i
            className="fa-solid fa-volume-high"
            style={{ fontSize: 12, color: accentHex, marginRight: 8 }}
          />
          {fragmento}
        </span>
      )}
    </span>
  );
}

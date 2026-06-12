"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from "react";

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

function elegirVozEspanol(synth: SpeechSynthesis): SpeechSynthesisVoice | null {
  const v = synth.getVoices();
  return (
    v.find((x) => /es[-_]MX/i.test(x.lang)) ??
    v.find((x) => /es[-_]419/i.test(x.lang)) ??
    v.find((x) => /es[-_]US/i.test(x.lang)) ??
    v.find((x) => /^es/i.test(x.lang)) ??
    null
  );
}

/**
 * Botón compacto de bocina. Lee el texto registrado (o el contenido en pantalla).
 * Un solo botón que alterna escuchar / detener, con animación sutil al sonar.
 */
export function NarradorControl({ accentHex }: { accentHex: string }) {
  const ctx = useContext(Ctx);
  const textoRef = useContext(NarracionTextoRefContext);
  const soportado = useSyncExternalStore(SUSCRIBIR_NOOP, leerSoporte, () => false);
  const [estado, setEstado] = useState<EstadoNarrador>("idle");

  useEffect(() => {
    if (!soportado) return undefined;
    // Fuerza la carga de voces en navegadores que las traen async.
    window.speechSynthesis.getVoices();
    const onVoices = () => window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", onVoices);
    return () => window.speechSynthesis.removeEventListener?.("voiceschanged", onVoices);
  }, [soportado]);

  const detener = useCallback(() => {
    if (!soportado) return;
    window.speechSynthesis.cancel();
    setEstado("idle");
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
    const voz = elegirVozEspanol(synth);
    setEstado("playing");
    // La Web Speech API encola las utterances y las reproduce en orden; trocear
    // en fragmentos cortos evita el corte de ~15 s de Chrome. El último marca el fin.
    trozos.forEach((frag, i) => {
      const u = new SpeechSynthesisUtterance(frag);
      u.lang = "es-MX";
      if (voz) u.voice = voz;
      u.rate = 1;
      u.pitch = 1;
      if (i === trozos.length - 1) u.onend = () => setEstado("idle");
      u.onerror = () => setEstado("idle");
      synth.speak(u);
    });
  }, [soportado, ctx, textoRef]);

  if (!soportado) return null;

  const activo = estado !== "idle";

  return (
    <button
      type="button"
      onClick={activo ? detener : iniciar}
      aria-label={activo ? "Detener narración" : "Escuchar en voz alta"}
      title={activo ? "Detener narración" : "Escuchar en voz alta"}
      className="ash-narrador"
      style={{
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
        color: activo ? accentHex : "rgba(255,255,255,0.55)",
        background: activo ? `${accentHex}1f` : "rgba(255,255,255,0.05)",
        border: activo ? `1px solid ${accentHex}55` : "1px solid rgba(255,255,255,0.10)",
        transition: "all 0.2s ease",
      }}
    >
      <i
        className={`fa-solid ${activo ? "fa-stop" : "fa-volume-high"}`}
        style={{ fontSize: 11 }}
      />
      {activo ? "Detener" : "Escuchar"}
      {activo && (
        <span className="ash-narrador-eq" aria-hidden="true">
          <span /><span /><span />
        </span>
      )}
    </button>
  );
}

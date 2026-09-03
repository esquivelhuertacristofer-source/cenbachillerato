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
import { tieneVozGrabada } from "@/lib/voz/voz-hecha";
import { rutaVoz } from "@/lib/voz/ruta-voz";
import type { SegmentoVoz } from "@/lib/voz/segmentos";

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
 *
 * DOS NARRADORES, Y EL BUENO GANA CUANDO EXISTE.
 *
 * La Web Speech API es gratis pero la voz que suena es la que esa máquina tenga
 * instalada: en la laptop de una escuela pública es la SAPI vieja de Windows
 * —"Microsoft Sabina"—, que suena robótica, y en algún Chromebook no hay
 * ninguna voz en español. Por eso las lecturas se grabaron una sola vez con
 * `es-MX-DaliaNeural`, la misma locutora de los 211 videos
 * (`scripts/narrar-actividades.py`).
 *
 * Cuando la actividad está en `voz-hecha.ts` el botón reproduce esos MP3 desde
 * R2: misma voz en toda la plataforma, en cualquier máquina. Cuando no lo está
 * —el resto de los tipos de actividad— sigue el narrador del navegador exacto
 * de antes. El botón nunca desaparece; sólo suena mejor donde hay grabación.
 *
 * UN CLIP QUE FALTA NO ROMPE LA FILA: el `error` del <audio> avanza al
 * siguiente en vez de dejar la lectura colgada a media página.
 */

interface NarracionCtx {
  /** Registra el texto limpio a narrar (null para volver al fallback de pantalla). */
  registrar: (texto: string | null) => void;
  /** Registra los trozos grabados (clave + texto) de una lectura con voz propia. */
  registrarSegmentos: (segmentos: SegmentoVoz[] | null) => void;
  /** Ref al contenedor del contenido visible; fallback cuando no hay texto registrado. */
  contentRef: RefObject<HTMLDivElement | null>;
  /** Código de la actividad (p.ej. "CD-I-P01-A1"); decide si hay voz grabada. */
  codigo: string | null;
}

const Ctx = createContext<NarracionCtx | null>(null);

export function NarracionProvider({
  children,
  codigo = null,
}: {
  children: ReactNode;
  /** Código de la actividad. Sin él, sólo hay narrador del navegador. */
  codigo?: string | null;
}) {
  const textoRef = useRef<string | null>(null);
  const segmentosRef = useRef<SegmentoVoz[] | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const registrar = useCallback((texto: string | null) => {
    textoRef.current = texto;
  }, []);

  const registrarSegmentos = useCallback((segmentos: SegmentoVoz[] | null) => {
    segmentosRef.current = segmentos && segmentos.length > 0 ? segmentos : null;
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
    <Ctx.Provider value={{ registrar, registrarSegmentos, contentRef, codigo }}>
      <NarracionTextoRefContext.Provider value={textoRef}>
        <NarracionSegmentosRefContext.Provider value={segmentosRef}>
          {children}
        </NarracionSegmentosRefContext.Provider>
      </NarracionTextoRefContext.Provider>
    </Ctx.Provider>
  );
}

// El botón necesita leer el texto registrado en tiempo de clic (no de render),
// así que el ref viaja por un contexto aparte para no re-renderizar a nadie.
const NarracionTextoRefContext = createContext<RefObject<string | null> | null>(null);
const NarracionSegmentosRefContext = createContext<RefObject<SegmentoVoz[] | null> | null>(null);

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

/**
 * Hook para que una lectura registre sus trozos grabados.
 *
 * Los `segmentos` tienen que salir de `segmentosDeLectura(titulo, texto)` con el
 * MISMO título y el MISMO texto que vio `scripts/extraer-voz-actividades.ts`;
 * si no, se pediría el MP3 de otro párrafo y la lectura sonaría corrida.
 */
export function useRegistrarSegmentosVoz(segmentos: SegmentoVoz[] | null | undefined) {
  const ctx = useContext(Ctx);
  useEffect(() => {
    if (!ctx) return;
    ctx.registrarSegmentos(segmentos ?? null);
    return () => ctx.registrarSegmentos(null);
  }, [ctx, segmentos]);
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

/**
 * Puntúa una voz por CALIDAD percibida. La Web Speech API solo expone las voces
 * instaladas en el sistema; la elección por defecto del navegador suele caer en
 * la voz SAPI genérica de Windows ("Microsoft Sabina"), que suena robótica.
 * Esta heurística prioriza las voces neuronales/cloud — mucho más naturales —
 * cuando están disponibles, para que la narración no use la voz genérica.
 *
 * Mejores voces gratuitas habituales:
 *  - Edge: "Microsoft … Online (Natural)" (neuronales, localService=false).
 *  - Chrome: "Google español" / "Google español de Estados Unidos".
 */
export function puntuarVoz(v: SpeechSynthesisVoice): number {
  const n = v.name.toLowerCase();
  let s = 0;
  // Voces neuronales de Edge ("… Online (Natural)") — las más naturales.
  if (/natural|neural/.test(n)) s += 120;
  // Voces de Google (Chrome) — muy naturales.
  if (/google/.test(n)) s += 80;
  if (/premium|enhanced|wavenet|studio|siri/.test(n)) s += 60;
  // Las voces remotas (cloud) suenan mejor que las SAPI locales del sistema.
  if (v.localService === false) s += 40;
  // Región preferida para el público mexicano.
  if (/es[-_]MX/i.test(v.lang)) s += 16;
  else if (/es[-_]419/i.test(v.lang)) s += 12;
  else if (/es[-_]US/i.test(v.lang)) s += 8;
  else if (/^es/i.test(v.lang)) s += 4;
  // Penaliza las voces SAPI genéricas de Windows (las "robóticas").
  if (/sabina|helena|laura|pablo|raul|microsoft server/.test(n)) s -= 14;
  return s;
}

/** ¿La voz es de alta calidad (neuronal o cloud)? Para etiquetarla en la UI. */
export function esVozPremium(v: SpeechSynthesisVoice): boolean {
  return /natural|neural|google|premium|enhanced|wavenet|studio/i.test(v.name) || v.localService === false;
}

function elegirVozEspanol(
  voces: SpeechSynthesisVoice[],
  vozURI: string | null,
): SpeechSynthesisVoice | null {
  if (vozURI) {
    const elegida = voces.find((x) => x.voiceURI === vozURI);
    if (elegida) return elegida;
  }
  const espanol = voces.filter((x) => /^es/i.test(x.lang));
  if (espanol.length === 0) return null;
  // Mejor voz por calidad (no la primera es-MX que aparezca).
  return espanol.slice().sort((a, b) => puntuarVoz(b) - puntuarVoz(a))[0] ?? null;
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
  const segmentosRef = useContext(NarracionSegmentosRefContext);
  const soporteVoz = useSyncExternalStore(SUSCRIBIR_NOOP, leerSoporte, () => false);
  const codigo = ctx?.codigo ?? null;
  /** ¿Esta actividad tiene grabación propia con la voz de la plataforma? */
  const grabada = tieneVozGrabada(codigo);
  // Con grabación el botón vale aunque el navegador no traiga sintetizador: el
  // audio es un <audio>, no la Web Speech API.
  const soportado = grabada || soporteVoz;
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

  /* ── Reproducción de la voz grabada (MP3 en R2) ──────────────────────────
     Una cola de claves y UN solo <audio> que las va tocando en orden. Nunca
     suenan dos a la vez y nada arranca solo: arranca cuando un dedo lo pide. */
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const colaRef = useRef<SegmentoVoz[]>([]);
  const parandoRef = useRef(false);

  /** Suelta el <audio> al desmontar para no dejar audio sonando al navegar. */
  useEffect(() => {
    return () => {
      const a = audioRef.current;
      if (a) {
        a.pause();
        a.src = "";
      }
      colaRef.current = [];
    };
  }, []);

  const avanzarClip = useCallback(() => {
    const a = audioRef.current;
    if (!a || parandoRef.current) return;
    const seg = colaRef.current.shift();
    if (!seg || !codigo) {
      setEstado("idle");
      setFragmento(null);
      return;
    }
    a.src = rutaVoz(codigo, seg.clave);
    a.playbackRate = Math.min(2, Math.max(0.5, prefs.rate));
    setFragmento(seg.texto);
    // El navegador sólo deja sonar audio nacido de un gesto; todas las colas
    // nacen de un clic. Si aun así lo rechaza, se corta en vez de dejar el
    // subtítulo encendido sobre un silencio.
    void a.play().catch(() => {
      colaRef.current = [];
      setEstado("idle");
      setFragmento(null);
    });
  }, [codigo, prefs.rate]);

  const detener = useCallback(() => {
    if (grabada) {
      colaRef.current = [];
      parandoRef.current = true;
      const a = audioRef.current;
      if (a) {
        a.pause();
        a.currentTime = 0;
      }
      parandoRef.current = false;
      setEstado("idle");
      setFragmento(null);
      return;
    }
    if (!soporteVoz) return;
    window.speechSynthesis.cancel();
    setEstado("idle");
    setFragmento(null);
  }, [grabada, soporteVoz]);

  // El manejador de `ended` se registra una sola vez, pero `avanzarClip` cambia
  // cuando cambia la velocidad: se lee del ref para no re-suscribir eventos.
  const avanzarClipRef = useRef(avanzarClip);
  useEffect(() => { avanzarClipRef.current = avanzarClip; }, [avanzarClip]);

  const iniciarGrabada = useCallback(() => {
    const segmentos = segmentosRef?.current;
    if (!segmentos || segmentos.length === 0 || !codigo) return false;
    let a = audioRef.current;
    if (!a) {
      a = new Audio();
      a.preload = "auto";
      // `ended` y `error` comparten manejador a propósito: un MP3 que falta se
      // salta al siguiente en vez de dejar la lectura colgada a media página.
      const seguir = () => avanzarClipRef.current();
      a.addEventListener("ended", seguir);
      a.addEventListener("error", seguir);
      audioRef.current = a;
    }
    colaRef.current = [...segmentos];
    a.pause();
    setEstado("playing");
    avanzarClip();
    return true;
  }, [codigo, segmentosRef, avanzarClip]);


  const iniciar = useCallback(() => {
    // Con grabación propia gana el MP3; si por lo que sea no hay segmentos
    // registrados, cae al sintetizador del navegador como cualquier otro tipo.
    if (grabada && iniciarGrabada()) return;
    if (!soporteVoz || !ctx) return;
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
  }, [grabada, iniciarGrabada, soporteVoz, ctx, textoRef, prefs.vozURI, prefs.rate]);

  const alternarReproduccion = useCallback(() => {
    if (!soportado) return;
    if (estado === "idle") {
      iniciar();
      return;
    }
    if (grabada) {
      const a = audioRef.current;
      if (!a) return;
      if (estado === "playing") {
        a.pause();
        setEstado("paused");
      } else {
        void a.play().catch(() => detener());
        setEstado("playing");
      }
      return;
    }
    const synth = window.speechSynthesis;
    if (estado === "playing") {
      synth.pause();
      setEstado("paused");
    } else {
      synth.resume();
      setEstado("playing");
    }
  }, [soportado, estado, iniciar, grabada, detener]);

  /* La velocidad del <audio> sí se puede cambiar sin reiniciar (a diferencia de
     la Web Speech API, donde el `rate` viaja pegado a cada utterance ya
     encolada). Se aplica en caliente para que el alumno oiga el cambio. */
  useEffect(() => {
    const a = audioRef.current;
    if (grabada && a) a.playbackRate = Math.min(2, Math.max(0.5, prefs.rate));
  }, [grabada, prefs.rate]);

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
          {grabada ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.72)" }}>
                Voz
              </span>
              <span
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  fontSize: 12, fontWeight: 700, color: accentHex,
                  padding: "7px 10px", borderRadius: 8,
                  background: `${accentHex}18`, border: `1px solid ${accentHex}44`,
                }}
              >
                <i className="fa-solid fa-certificate" style={{ fontSize: 11 }} />
                Voz de la plataforma
              </span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
                Esta lectura está grabada con la misma locutora de los videos, así que
                suena igual en cualquier computadora.
              </span>
            </div>
          ) : (
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
              <option value="">Automática (mejor calidad)</option>
              {[...voces]
                .sort((a, b) => puntuarVoz(b) - puntuarVoz(a))
                .map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {esVozPremium(v) ? "★ " : ""}{v.name} ({v.lang})
                  </option>
                ))}
            </select>
            {voces.length === 0 ? (
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
                Tu navegador no expone voces en español; se usará la del sistema.
              </span>
            ) : !voces.some(esVozPremium) ? (
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
                Para una voz más natural, abre en Microsoft Edge o Chrome (voces ★).
              </span>
            ) : null}
          </label>
          )}

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
              {grabada
                ? "El cambio se aplica al instante."
                : "El cambio se aplica al volver a iniciar la lectura."}
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

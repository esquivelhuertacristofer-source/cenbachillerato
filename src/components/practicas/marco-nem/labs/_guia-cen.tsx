"use client";
 
// =============================================================================
// Guía CEN — misión, álbum de estampas y Citlali con voz, encima de un laboratorio
// =============================================================================
// La misma capa la usan el Observatorio CEN (explorador espacial) y el
// Laboratorio del Cuerpo CEN (atlas). Cada uno la crea con `crearGuiaCEN(cfg)`:
// sus frases, sus pasos y sus estampas; la capa recibe `evento` = la estampa que
// el niño acaba de abrir (un planeta, un órgano) o null.
//
// El progreso vive en localStorage a través de un almacén externo
// (useSyncExternalStore): el servidor y la hidratación ven «sin progreso» y el
// valor guardado llega justo después, sin desajuste ni setState en efectos.
// =============================================================================

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { efectosActivos } from "../lib/efectos-sonoros";
import { CEN } from "../lib/marca-cen";

/** Retrato recortado de Citlali (el mismo en todos los laboratorios). */
const RETRATO = "/media/nem/observatorio/citlali.webp";

export interface GuiaCfg {
  /** Llave de localStorage. */
  clave: string;
  /** Carpeta pública con `citlali-<frase>.mp3`. */
  audios: string;
  titulo: string;
  /** Frases de Citlali: «bienvenida», una por paso (id del paso), «album» y la del último paso. */
  frases: Record<string, string>;
  pasos: { id: string; texto: string }[];
  estampas: { id: string; nombre: string }[];
  /** Cómo se dibuja la estampa ya ganada (dentro de su marquito). */
  arte: (id: string) => CSSProperties;
}

export function crearGuiaCEN(cfg: GuiaCfg) {
  const { clave: CLAVE, frases: FRASES, pasos: PASOS, estampas: ESTAMPAS } = cfg;
  const ULTIMA = PASOS[PASOS.length - 1]!.id;
/* ── Progreso: almacén externo sobre localStorage ────────────────────────────
   useSyncExternalStore da «sin progreso» al servidor y en la hidratación, y el
   valor guardado justo después: sin desajuste y sin setState dentro de efectos. */
type Progreso = { paso: number; album: string[]; dicho: string };
  const VACIO: Progreso = { paso: 0, album: [], dicho: "bienvenida" };
  const avisos = new Set<() => void>();
  let cache: { crudo: string | null; valor: Progreso } = { crudo: null, valor: VACIO };

function leerCrudo(): string | null {
  try {
    return localStorage.getItem(CLAVE);
  } catch {
    return null;
  }
}
function progresoCliente(): Progreso {
  const crudo = leerCrudo();
  if (crudo === cache.crudo) return cache.valor;
  let valor = VACIO;
  try {
    const g = JSON.parse(crudo ?? "null") as Partial<Progreso> | null;
    if (g) {
      const paso = Math.min(PASOS.length, Math.max(0, Number(g.paso) || 0));
      valor = {
        paso,
        album: Array.isArray(g.album) ? g.album.filter((id) => ESTAMPAS.some((e) => e.id === id)) : [],
        dicho: g.dicho && g.dicho in FRASES ? g.dicho : paso >= PASOS.length ? ULTIMA : "bienvenida",
      };
    }
  } catch {
    /* guardado ilegible: se empieza de cero */
  }
  cache = { crudo, valor };
  return valor;
}
const progresoServidor = () => VACIO;
function suscribir(aviso: () => void) {
  avisos.add(aviso);
  return () => {
    avisos.delete(aviso);
  };
}
function guardar(p: Progreso) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(p));
  } catch {
    /* sin almacenamiento: el progreso dura lo que la página */
    cache = { crudo: cache.crudo, valor: p };
  }
  avisos.forEach((a) => a());
}

return function CapaGuiaCEN({ evento: ficha }: { evento: string | null }) {
  const { paso, album, dicho } = useSyncExternalStore(suscribir, progresoCliente, progresoServidor);
  const [hablando, setHablando] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const saludo = useRef(false);

  /** Reproduce una frase de Citlali. Respeta el silencio del laboratorio salvo que se pida con el botón. */
  const sonar = useCallback((f: string, forzar = false) => {
    if (!forzar && !efectosActivos()) return;
    if (!audio.current) {
      audio.current = new Audio();
      audio.current.onplaying = () => setHablando(true);
      audio.current.onended = () => setHablando(false);
      audio.current.onpause = () => setHablando(false);
      audio.current.onerror = () => setHablando(false);
    }
    audio.current.pause();
    audio.current.src = `${cfg.audios}/citlali-${f}.mp3`;
    audio.current.play().catch(() => setHablando(false));
  }, []);

  useEffect(() => () => audio.current?.pause(), []);

  // El saludo suena con el primer toque dentro del laboratorio (antes, el
  // navegador no deja reproducir sonido).
  useEffect(() => {
    const primerToque = () => {
      if (saludo.current) return;
      saludo.current = true;
      if (progresoCliente().paso === 0) sonar("bienvenida");
    };
    window.addEventListener("pointerdown", primerToque, { once: true });
    return () => window.removeEventListener("pointerdown", primerToque);
  }, [sonar]);

  // Cada astro que se abre: estampa nueva y, si es el paso que tocaba, avanza.
  useEffect(() => {
    if (!ficha) return;
    saludo.current = true;
    const ahora = progresoCliente();
    const nuevoAlbum = ESTAMPAS.some((e) => e.id === ficha) && !ahora.album.includes(ficha) ? [...ahora.album, ficha] : ahora.album;
    let frase: string | null = null;
    let paso = ahora.paso;
    if (paso < PASOS.length && PASOS[paso]!.id === ficha) {
      frase = PASOS[paso]!.id;
      paso += 1;
    } else if (nuevoAlbum !== ahora.album && nuevoAlbum.length === ESTAMPAS.length) {
      frase = "album";
    }
    if (nuevoAlbum === ahora.album && paso === ahora.paso) return;
    guardar({ paso, album: nuevoAlbum, dicho: frase ?? ahora.dicho });
    if (frase) sonar(frase);
  }, [ficha, sonar]);

  const terminada = paso >= PASOS.length;

  return (
    <>
      {/* Misión + álbum, arriba a la izquierda. */}
      <section className="obs-mision" aria-label="Misión del laboratorio" style={TARJETA}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span style={PILDORA}>{terminada ? "MISIÓN CUMPLIDA" : `MISIÓN · PASO ${paso + 1} DE ${PASOS.length}`}</span>
          {terminada && (
            <button
              type="button"
              onClick={() => {
                guardar(VACIO);
                sonar("bienvenida");
              }}
              style={{ minHeight: 30, minWidth: 0, padding: "0 10px", borderRadius: 99, border: "1px solid rgba(184,235,80,.5)", background: "transparent", color: CEN.lima, fontFamily: CEN.fuente, fontSize: 12, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}
            >
              <i className="fa-solid fa-rotate-left" aria-hidden /> Repetir
            </button>
          )}
        </div>
        <h2 style={{ margin: "10px 0 4px", fontFamily: CEN.fuente, fontWeight: 900, fontSize: 21, lineHeight: 1.1, color: "#fff" }}>{cfg.titulo}</h2>
        <ol style={{ listStyle: "none", margin: "8px 0 0", padding: 0, display: "grid", gap: 6 }}>
          {PASOS.map((p, i) => {
            const hecho = i < paso;
            const ahora = i === paso;
            return (
              <li key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14.5, fontWeight: 700, color: ahora ? CEN.lima : hecho ? "#fff" : "#a9c0e6" }}>
                <span
                  aria-hidden
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 99,
                    display: "grid",
                    placeItems: "center",
                    fontSize: 12,
                    fontWeight: 900,
                    flex: "none",
                    background: hecho ? CEN.lima : "rgba(255,255,255,.12)",
                    color: hecho ? CEN.navy : "#fff",
                  }}
                >
                  {hecho ? <i className="fa-solid fa-check" /> : i + 1}
                </span>
                <span style={{ textDecoration: hecho ? "line-through" : "none", textDecorationColor: "rgba(184,235,80,.6)" }}>{p.texto}</span>
              </li>
            );
          })}
        </ol>
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(184,235,80,.2)" }}>
          <div style={{ fontSize: 11.5, fontWeight: 900, letterSpacing: ".1em", color: "#cfe0ff" }}>
            MI ÁLBUM CEN · {album.length} DE {ESTAMPAS.length}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(9, 1fr)", gap: 4, marginTop: 8 }}>
            {ESTAMPAS.map((e) => {
              const tiene = album.includes(e.id);
              return (
                <span
                  key={e.id}
                  title={tiene ? e.nombre : "Estampa por descubrir"}
                  className={tiene ? "obs-estampa obs-estampa-on" : "obs-estampa"}
                  style={{
                    aspectRatio: "3 / 4",
                    borderRadius: 5,
                    display: "grid",
                    placeItems: "center",
                    border: tiene ? "2px solid #fff" : "2px dashed rgba(255,255,255,.3)",
                    background: tiene ? "#0b2a6e" : "transparent",
                    color: "rgba(255,255,255,.4)",
                    fontSize: 11,
                    fontWeight: 900,
                  }}
                >
                  {tiene ? (
                    <span aria-label={e.nombre} style={cfg.arte(e.id)} />
                  ) : (
                    "?"
                  )}
                </span>
              );
            })}
          </div>
        </div>
      </section>

      {/* Citlali y su globo, a la derecha. La ficha de un astro se abre debajo del globo. */}
      {(
        <div className="obs-globo" role="status" style={GLOBO}>
          <div style={{ fontSize: 12.5, fontWeight: 900, letterSpacing: ".12em", color: CEN.azul }}>CITLALI · TU GUÍA CEN</div>
          <p style={{ margin: "6px 0 0", fontSize: 17, fontWeight: 700, lineHeight: 1.38, color: CEN.navy }}>{FRASES[dicho]}</p>
          <button
            type="button"
            onClick={() => sonar(dicho, true)}
            style={{
              marginTop: 10,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              minHeight: 40,
              padding: "0 16px",
              borderRadius: 99,
              border: "none",
              background: CEN.lima,
              color: CEN.navy,
              fontFamily: CEN.fuente,
              fontWeight: 900,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            <i className={hablando ? "fa-solid fa-volume-high fa-beat-fade" : "fa-solid fa-volume-high"} aria-hidden />
            {hablando ? "Hablando…" : "Escuchar"}
          </button>
        </div>
      )}
      { }
      <img className="obs-guia" src={RETRATO} alt="Citlali, tu guía CEN" style={GUIA} />

      <style>{`
        .obs-estampa-on { animation: obs-pega .5s cubic-bezier(.2,1.6,.4,1) both; }
        @keyframes obs-pega { from { transform: scale(.4) rotate(-12deg); } to { transform: none; } }
        @media (max-width: 820px) {
          .obs-guia, .obs-globo { display: none !important; }
          .obs-mision { top: 124px !important; left: 12px !important; right: 12px !important; width: auto !important; }
        }
        @media (prefers-reduced-motion: reduce) { .obs-estampa-on { animation: none; } }
      `}</style>
    </>
  );
  };
}

const TARJETA: CSSProperties = {
  position: "absolute",
  left: 16,
  top: 70,
  width: 300,
  padding: "14px 16px",
  borderRadius: 14,
  background: "rgba(0,21,59,.88)",
  border: "1px solid rgba(184,235,80,.32)",
  boxShadow: "0 18px 40px -20px rgba(0,0,0,.8)",
  color: "#fff",
  zIndex: 3,
};
const PILDORA: CSSProperties = {
  display: "inline-block",
  padding: "4px 10px",
  borderRadius: 99,
  background: CEN.lima,
  color: CEN.navy,
  fontSize: 11.5,
  fontWeight: 900,
  letterSpacing: ".1em",
};
const GLOBO: CSSProperties = {
  position: "absolute",
  right: 24,
  top: 70,
  width: "min(380px, 30%)",
  padding: "16px 20px",
  borderRadius: 20,
  background: "#fff",
  border: `3px solid ${CEN.lima}`,
  boxShadow: "0 18px 40px -12px rgba(0,0,0,.6)",
  zIndex: 3,
};
const GUIA: CSSProperties = {
  position: "absolute",
  right: 0,
  bottom: 0,
  height: "min(54%, 470px)",
  pointerEvents: "none",
  zIndex: 2,
  filter: "drop-shadow(0 10px 24px rgba(0,0,0,.5))",
};

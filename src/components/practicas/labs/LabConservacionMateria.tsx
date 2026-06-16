"use client";

/**
 * Laboratorio 3D — Conservación de la materia (Ley de Lavoisier).
 * Práctica experimental para CNEYT-I-P08-A1.
 *
 * El estudiante elige una REACCIÓN química y la "avanza" con un control: ve cómo
 * los MISMOS átomos de los reactivos se separan y se reacomodan para formar los
 * productos. Una tabla cuenta los átomos de cada elemento (iguales antes y
 * después) y una balanza muestra que la masa total no cambia: en una reacción
 * química la materia no se crea ni se destruye, solo se transforma.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { CONSERVACION_MATERIA_FICHA } from "./conservacion-materia-ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { QUIZ_A2 } from "./conservacion-materia-data";
import { LabSfx } from "./lab-audio";
import { REACCIONES, ELEMS_R, buildReaccion } from "./reacciones-data";

const ConservacionMateriaScene = dynamic(() => import("./ConservacionMateriaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-flask-vial fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const fmt = (n: number, dec = 0) => n.toLocaleString("es-MX", { minimumFractionDigits: dec, maximumFractionDigits: dec });

const STEP = 0.02; // avance por tick de reproducción
const TICK_MS = 32;

export function LabConservacionMateria({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [reaccionKey, setReaccionKey] = useState("combustion-metano");
  const [progreso, setProgreso] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetNonce, setResetNonce] = useState(0);
  const [vistas, setVistas] = useState<Set<string>>(() => new Set<string>(["combustion-metano"]));
  const [completadas, setCompletadas] = useState<Set<string>>(() => new Set<string>());
  const [interactuo, setInteractuo] = useState(false);
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  // teoría (cajón deslizable) y sonido
  const [drawer, setDrawer] = useState(false);
  const [sonido, setSonido] = useState(false);
  const audioRef = useRef<LabSfx | null>(null);

  const toggleSonido = useCallback(async () => {
    if (!audioRef.current) audioRef.current = new LabSfx();
    const sfx = audioRef.current;
    if (sonido) {
      sfx.mute();
      setSonido(false);
    } else {
      await sfx.enable();
      setSonido(true);
    }
  }, [sonido]);

  useEffect(() => {
    return () => {
      audioRef.current?.dispose();
      audioRef.current = null;
    };
  }, []);

  const reaccion = REACCIONES.find((r) => r.key === reaccionKey)!;
  const idx = REACCIONES.findIndex((r) => r.key === reaccionKey);
  const built = useMemo(() => buildReaccion(reaccion), [reaccion]);

  // Reproducción automática: al llegar al 100% se detiene y marca como completada
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setProgreso((p) => {
        const np = Math.min(1, p + STEP);
        if (np >= 1) {
          setPlaying(false);
          setCompletadas((prev) => {
            if (prev.has(reaccionKey)) return prev;
            const next = new Set(prev);
            next.add(reaccionKey);
            return next;
          });
        }
        return np;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [playing, reaccionKey]);

  const irAReaccion = (k: string) => {
    setReaccionKey(k);
    setProgreso(0);
    setPlaying(false);
    if (sonido) audioRef.current?.blip();
    setVistas((prev) => {
      if (prev.has(k)) return prev;
      const next = new Set(prev);
      next.add(k);
      return next;
    });
  };
  const paso = (dir: number) => {
    const i = Math.max(0, Math.min(REACCIONES.length - 1, idx + dir));
    irAReaccion(REACCIONES[i]!.key);
  };
  const togglePlay = () => {
    setInteractuo(true);
    if (progreso >= 1) {
      setProgreso(0);
      setPlaying(true);
      return;
    }
    setPlaying((v) => !v);
  };
  const scrub = (v: number) => {
    setInteractuo(true);
    setPlaying(false);
    setProgreso(v);
  };

  const totalAtomos = built.conteo.reduce((s, c) => s + c.n, 0);
  const completada = completadas.has(reaccionKey);

  // Fase actual (para la cinta del visor)
  const fase = progreso < 0.04 ? "Reactivos" : progreso > 0.96 ? "Productos" : "Reaccionando…";
  const faseColor = progreso < 0.04 ? "#8AB4FF" : progreso > 0.96 ? OK : "#FBBF24";

  const objetivos = [
    { txt: "Inicia una reacción (mueve el control)", done: interactuo },
    { txt: "Lleva una reacción al 100%", done: completadas.size >= 1 },
    { txt: "Comprueba la conservación en las 4 reacciones", done: completadas.size >= 4 },
    { txt: "Recorre las 4 ecuaciones", done: vistas.size >= 4 },
    { txt: "Resuelve el reto de conservación de la materia", done: ejercicioAprobado },
  ];

  const [izqEc, derEc] = reaccion.ecuacion.split("→");

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-atom" />
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, color: T.text }}>{reaccion.ecuacion}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero el experimento sigue: <strong style={{ color: T.text }}>{reaccion.nombre}</strong> — {reaccion.descripcion}
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes exPulse { 0%,100%{ box-shadow:0 0 0 0 var(--exc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ex-live-dot { animation: exPulse 1.6s ease-in-out infinite; }
        .ex-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .ex-grid { grid-template-columns: 1fr; } }
        .ex-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .ex-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .ex-icobtn:hover { background:rgba(255,255,255,0.12); }
        .ex-divider { height:1px; background:${T.line}; margin:18px 0; }
        .ex-rx { position:relative; cursor:pointer; border-radius:12px; border:1px solid ${T.line}; background:${T.glass};
          display:flex; flex-direction:column; gap:3px; padding:11px 13px; transition:all .14s ease; text-align:left; width:100%; }
        .ex-rx:hover { border-color:${T.lineStrong}; background:${T.glassSoft}; }
        .ex-step { cursor:pointer; flex:1; display:flex; align-items:center; justify-content:center; gap:8px; padding:10px;
          border-radius:11px; border:1px solid ${T.line}; background:${T.inset}; color:${T.text2}; font-size:13px; font-weight:700; transition:all .15s; }
        .ex-step:hover:not(:disabled) { color:#fff; border-color:${T.lineStrong}; }
        .ex-step:disabled { opacity:0.35; cursor:not-allowed; }
        .ex-range { -webkit-appearance:none; appearance:none; width:100%; height:8px; border-radius:999px; outline:none;
          background:linear-gradient(90deg, ${accent} var(--p,0%), rgba(255,255,255,0.12) var(--p,0%)); cursor:pointer; }
        .ex-range::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:20px; height:20px; border-radius:50%;
          background:#fff; border:3px solid ${accent}; box-shadow:0 2px 8px rgba(0,0,0,0.5); cursor:pointer; }
        .ex-range::-moz-range-thumb { width:20px; height:20px; border-radius:50%; background:#fff; border:3px solid ${accent}; cursor:pointer; }
        .ex-play { cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:11px 20px;
          border-radius:12px; border:none; background:${accent}; color:#04121f; font-size:14px; font-weight:800; transition:all .15s; }
        .ex-play:hover { filter:brightness(1.08); }
        @media (max-width: 1000px){ .ex-bottom { grid-template-columns: 1fr !important; } }

        /* Cajón de teoría */
        .ex-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .ex-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .ex-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .ex-drawer[data-open="true"] { transform:translateX(0); }
        .ex-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .ex-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .ex-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .ex-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .ex-teoria-fab { position:absolute; bottom:16px; left:50%; transform:translateX(-50%); cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .ex-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateX(-50%) translateY(-1px); }
      `}</style>

      <div className="ex-grid">
        {/* ── Columna visor ──────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              position: "relative",
              height: "clamp(460px, 66vh, 780px)",
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid rgba(${color.rgba},0.22)`,
              background: `radial-gradient(120% 80% at 50% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#06182f 0%,#020d1d 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <ConservacionMateriaScene
                reaccionKey={reaccion.key}
                atoms={built.atoms}
                reactBonds={built.reactBonds}
                prodBonds={built.prodBonds}
                progreso={progreso}
                accent={accent}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO + fase */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${faseColor}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${faseColor}aa`, width: 9, height: 9, borderRadius: "50%", background: faseColor }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13.5, fontWeight: 800, color: faseColor }}>{fase}</span>
            </div>

            {/* Etiquetas reactivos/productos */}
            <div style={{ position: "absolute", top: 56, left: 16, fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", pointerEvents: "none" }}>← Reactivos</div>
            <div style={{ position: "absolute", top: 56, right: 16, fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", pointerEvents: "none" }}>Productos →</div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(2,12,28,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="ex-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="ex-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((v) => !v)} title="Girar automáticamente">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="ex-icobtn" onClick={() => { setProgreso(0); setPlaying(false); setResetNonce((n) => n + 1); }} title="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Ecuación (esquina inferior) */}
            <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 12, padding: "9px 18px", borderRadius: 13, background: "rgba(2,12,28,0.7)", border: `1px solid ${T.line}`, backdropFilter: "blur(8px)", pointerEvents: "none", whiteSpace: "nowrap" }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#8AB4FF" }}>{izqEc?.trim()}</span>
              <i className="fa-solid fa-arrow-right-long" style={{ color: T.text3, fontSize: 13 }} />
              <span style={{ fontSize: 15, fontWeight: 800, color: OK }}>{derEc?.trim()}</span>
            </div>

            {/* Botón flotante de Teoría */}
            <button className="ex-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>
          </div>

          {/* Control de avance de la reacción */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 13 }}>
              <Eyebrow>Avance de la reacción</Eyebrow>
              <span style={{ fontSize: 16, fontWeight: 900, color: accent, ...NUM }}>{fmt(progreso * 100)}%</span>
            </div>
            <input
              className="ex-range"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={progreso}
              onChange={(e) => scrub(parseFloat(e.target.value))}
              style={{ ["--p" as string]: `${progreso * 100}%` }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 15 }}>
              <button className="ex-play" onClick={togglePlay}>
                <i className={`fa-solid ${playing ? "fa-pause" : progreso >= 1 ? "fa-rotate-right" : "fa-play"}`} />
                {playing ? "Pausar" : progreso >= 1 ? "Repetir reacción" : "Iniciar reacción"}
              </button>
              <span style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.4 }}>
                Arrastra el control o pulsa iniciar para ver cómo los átomos se reacomodan.
              </span>
            </div>
          </div>
        </div>

        {/* ── Columna controles ──────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          {/* Reacción actual */}
          <Eyebrow>Reacción actual</Eyebrow>
          <div style={{ borderRadius: 14, border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.1)`, padding: "16px 18px" }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: T.text, lineHeight: 1.15 }}>{reaccion.nombre}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: accent, marginTop: 5, ...NUM }}>{reaccion.ecuacion}</div>
            <p style={{ margin: "12px 0 0", fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>{reaccion.descripcion}</p>
          </div>

          {/* Pasos */}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button className="ex-step" onClick={() => paso(-1)} disabled={idx === 0}>
              <i className="fa-solid fa-arrow-left" /> Anterior
            </button>
            <button className="ex-step" onClick={() => paso(1)} disabled={idx === REACCIONES.length - 1}>
              Siguiente <i className="fa-solid fa-arrow-right" />
            </button>
          </div>

          <div className="ex-divider" />

          {/* Selector de reacciones */}
          <Eyebrow>Elige una reacción</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {REACCIONES.map((r) => {
              const on = r.key === reaccionKey;
              const done = completadas.has(r.key);
              return (
                <button
                  key={r.key}
                  className="ex-rx"
                  onClick={() => irAReaccion(r.key)}
                  style={{ borderColor: on ? accent : T.line, background: on ? `rgba(${color.rgba},0.16)` : T.glass, boxShadow: on ? `0 0 16px -6px ${accent}` : "none" }}
                >
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: on ? "#fff" : T.text }}>{r.nombre}</span>
                    {done && <i className="fa-solid fa-circle-check" style={{ color: OK, fontSize: 13 }} />}
                  </span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: on ? accent : T.text3, ...NUM }}>{r.ecuacion}</span>
                </button>
              );
            })}
          </div>

          <div className="ex-divider" />

          {/* Conservación de átomos */}
          <Eyebrow>
            <i className="fa-solid fa-scale-balanced" style={{ marginRight: 8, color: OK }} />
            ¿Se conservan los átomos?
          </Eyebrow>
          <div style={{ borderRadius: 13, border: `1px solid ${T.line}`, background: T.inset, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 0, fontSize: 11, fontWeight: 800, letterSpacing: "0.05em", color: T.text3, textTransform: "uppercase", padding: "9px 14px", borderBottom: `1px solid ${T.line}` }}>
              <span>Elemento</span>
              <span style={{ width: 52, textAlign: "center" }}>Antes</span>
              <span style={{ width: 52, textAlign: "center" }}>Después</span>
              <span style={{ width: 22, textAlign: "center" }}> </span>
            </div>
            {built.conteo.map((c) => (
              <div key={c.el} style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", alignItems: "center", padding: "9px 14px", borderBottom: `1px solid ${T.line}` }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 9, fontSize: 13, fontWeight: 600, color: T.text2 }}>
                  <span style={{ width: 13, height: 13, borderRadius: "50%", background: ELEMS_R[c.el].color, border: "1px solid rgba(255,255,255,0.25)", boxShadow: `0 0 8px -2px ${ELEMS_R[c.el].color}` }} />
                  {ELEMS_R[c.el].nombre}
                </span>
                <span style={{ width: 52, textAlign: "center", fontSize: 14, fontWeight: 800, color: T.text, ...NUM }}>{c.n}</span>
                <span style={{ width: 52, textAlign: "center", fontSize: 14, fontWeight: 800, color: T.text, ...NUM }}>{c.n}</span>
                <span style={{ width: 22, textAlign: "center" }}><i className="fa-solid fa-check" style={{ color: OK, fontSize: 12 }} /></span>
              </div>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", alignItems: "center", padding: "10px 14px", background: `${OK}12` }}>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: OK }}>Masa total (u)</span>
              <span style={{ width: 52, textAlign: "center", fontSize: 13.5, fontWeight: 900, color: T.text, ...NUM }}>{fmt(built.masaReact, 1)}</span>
              <span style={{ width: 52, textAlign: "center", fontSize: 13.5, fontWeight: 900, color: T.text, ...NUM }}>{fmt(built.masaProd, 1)}</span>
              <span style={{ width: 22, textAlign: "center" }}><i className="fa-solid fa-equals" style={{ color: OK, fontSize: 12 }} /></span>
            </div>
          </div>

          {/* Lecturas */}
          <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}`, marginTop: 12 }}>
            <Readout label="Átomos" value={fmt(totalAtomos)} col={OK} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="Masa total" value={fmt(built.masaReact, 1)} unit="u" col={OK} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="Estado" value={completada ? "✓" : `${fmt(progreso * 100)}%`} col={completada ? OK : T.text} />
          </div>
        </div>
      </div>

      {/* ── Objetivos + pista ──────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="ex-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
            Objetivos
          </Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
            {objetivos.map((o, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: o.done ? OK : T.text2 }}>
                <i className={`fa-solid ${o.done ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: o.done ? 1 : 0.3 }} />
                <span style={{ fontWeight: o.done ? 700 : 500 }}>{o.txt}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderRadius: 18, padding: "18px 20px", border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.08)`, fontSize: 13.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 13 }}>
          <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 17, marginTop: 1 }} />
          <span>
            <strong style={{ color: T.text }}>Ley de conservación de la materia</strong> (Lavoisier): en una reacción química la materia{" "}
            <strong style={{ color: T.text }}>no se crea ni se destruye, solo se transforma</strong>. Por eso hay los mismos átomos —y la misma masa— antes y después.
          </span>
        </div>
      </div>

      {/* ── Reto evaluable: el quiz verbatim del ancla ───────────────── */}
      <RetoQuizCard
        quiz={QUIZ_A2}
        accent={accent}
        rgba={color.rgba}
        aprobado={ejercicioAprobado}
        onAprobado={() => setEjercicioAprobado(true)}
        playSfx={
          sonido
            ? (ok) => {
                if (ok) audioRef.current?.correcto();
                else audioRef.current?.incorrecto();
              }
            : undefined
        }
        playPick={sonido ? () => audioRef.current?.blip() : undefined}
      />

      {/* ── Cajón de teoría ──────────────────────────────────────────── */}
      <div className="ex-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="ex-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="ex-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="ex-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="ex-drawer-body">
          <FichaTeorica data={CONSERVACION_MATERIA_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}

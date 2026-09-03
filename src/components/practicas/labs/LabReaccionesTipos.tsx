"use client";

/**
 * Laboratorio 3D — Clasificador de tipos de reacciones químicas.
 * Práctica experimental para CNEYT-IV-P02-A1 (infografía "Tipos de reacciones
 * químicas: de la síntesis a la combustión"; UAC "Reacciones químicas",
 * progresión 2: "Clasifica los tipos de reacciones químicas y predice sus
 * productos").
 *
 * El alumno elige uno de los CINCO tipos de reacción (síntesis, descomposición,
 * desplazamiento simple, doble desplazamiento, combustión) y una reacción
 * representativa, y la reproduce: los MISMOS átomos viajan de los reactivos a los
 * productos mientras unos enlaces se rompen y otros se forman. El panel de
 * conservación muestra que el conteo de átomos por elemento es idéntico antes y
 * después (ley de conservación de la masa, Lavoisier). Las ecuaciones son
 * exactas y están balanceadas; las geometrías son representaciones didácticas.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, card, Eyebrow, SceneBoundary } from "./_kit";
import {
  TIPOS, ELEMS, reaccion, tipoInfo, reaccionesDe, conteo, faseDe,
  IDEAS, DATOS, RETO, REACCION_DEF, type TipoId,
} from "./reacciones-tipos-data";
import { FichaTeorica } from "./_ficha";
import { REACCIONES_TIPOS_FICHA } from "./tipos-reacciones-quimicas-ficha";
import { RetoQuizCard } from "./_reto-quiz";
import { QUIZ_A2 } from "./tipos-reacciones-quimicas-data";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { useLogros } from "./_partida";

const ReaccionesTiposScene = dynamic(() => import("./ReaccionesTiposScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-atom fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando la reacción…</span>
    </div>
  ),
});

const RETO_KEY = "cen-tipos-reacciones-quimicas-reto";

export function LabReaccionesTipos({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [reaccId, setReaccId] = useState(REACCION_DEF);
  const [progreso, setProgreso] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [girar, setGirar] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
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

  const r = useMemo(() => reaccion(reaccId), [reaccId]);
  const tipo = useMemo(() => tipoInfo(r.tipo), [r.tipo]);
  const conteos = useMemo(() => conteo(r), [r]);
  const tc = tipo.color;
  const fase = faseDe(progreso);

  // reproducir: avanza el progreso 0→1 con setInterval (permitido en useEffect).
  // Al llegar a 1 se detiene desde el propio callback del intervalo —no en el
  // cuerpo del efecto— para no disparar setState dentro del efecto.
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setProgreso((p) => {
        const next = Math.min(1, p + 0.018);
        if (next >= 1) setPlaying(false);
        return next;
      });
    }, 28);
    return () => clearInterval(id);
  }, [playing]);

  const togglePlay = () => {
    if (playing) { setPlaying(false); return; }
    if (progreso >= 1) setProgreso(0);
    setPlaying(true);
  };
  const elegirReaccion = (id: string) => {
    setReaccId(id);
    setProgreso(0);
    setPlaying(false);
    if (sonido) audioRef.current?.blip();
  };
  const elegirTipo = (id: TipoId) => {
    const lista = reaccionesDe(id);
    if (lista.length > 0) elegirReaccion(lista[0]!.id);
  };
  const reiniciar = () => { setProgreso(0); setPlaying(false); setResetNonce((n) => n + 1); };

  const objetivos = [
    { txt: "Explora los 5 tipos de reacción", done: TIPOS.every((tp) => reaccionesDe(tp.id).length > 0) },
    { txt: "Reproduce una reacción completa (llega al 100%)", done: progreso >= 1 },
    { txt: "Observa la conservación de la masa (Lavoisier)", done: progreso > 0.5 },
    { txt: "Aprueba el cuestionario de la actividad A2", done: ejercicioAprobado },
  ];
  // Los objetivos se recuerdan (algunos dependían del modo y se desmarcaban
  // solos) y se convierten en la marca del laboratorio, que antes no se
  // guardaba en ninguna parte.
  const { logros: logrosLab, cumplidos: cumplidosLab, total: totalLab } = useLogros(objetivos.map((o) => o.done));
  const { registraEstrellas } = useEstrellas(RETO_KEY);
  useEffect(() => {
    if (cumplidosLab === 0) return;
    const est = cumplidosLab >= totalLab ? 3 : cumplidosLab >= Math.ceil((totalLab * 2) / 3) ? 2 : 1;
    registraEstrellas(est);
  }, [cumplidosLab, totalLab, registraEstrellas]);

  const faseLabel = fase === "reactivos" ? "REACTIVOS" : fase === "productos" ? "PRODUCTOS" : "REACCIONANDO";
  const faseColor = fase === "reactivos" ? "#9DB4CE" : fase === "productos" ? "#7DF0C0" : tc;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: tc, boxShadow: `0 10px 30px -6px ${tc}` }}>
        <i className={`fa-solid ${tipo.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text, fontFamily: "ui-monospace, monospace" }}>{r.ecuacion}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: es una reacción de {tipo.label.toLowerCase()} ({tipo.patron}).
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes rxPulse { 0%,100%{ box-shadow:0 0 0 0 var(--exc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .rx-live-dot { animation: rxPulse 1.6s ease-in-out infinite; }
        .rx-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .rx-grid { grid-template-columns: 1fr; } }
        .rx-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .rx-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .rx-icobtn:hover { background:rgba(255,255,255,0.12); }
        .rx-tipo { cursor:pointer; padding:10px 12px; border-radius:12px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; font-size:12px; font-weight:800; transition:all .15s; text-align:left; display:flex; align-items:center; gap:9px; }
        .rx-tipo:hover { border-color:var(--fc); color:#fff; }
        .rx-tipo[data-on="true"] { border-color:var(--fc); background:color-mix(in srgb, var(--fc) 16%, transparent); color:#fff; }
        .rx-chip { cursor:pointer; padding:7px 12px; border-radius:999px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; font-size:12px; font-weight:800; transition:all .15s; font-family:ui-monospace, monospace; }
        .rx-chip:hover { border-color:var(--fc); color:#fff; }
        .rx-chip[data-on="true"] { border-color:var(--fc); background:color-mix(in srgb, var(--fc) 18%, transparent); color:#fff; }
        .rx-range { -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:999px; outline:none;
          background:linear-gradient(90deg, var(--fc) 0%, var(--fc) var(--pct), rgba(255,255,255,0.14) var(--pct), rgba(255,255,255,0.14) 100%); }
        .rx-range::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:18px; height:18px; border-radius:50%;
          background:#fff; border:3px solid var(--fc); cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
        .rx-range::-moz-range-thumb { width:18px; height:18px; border-radius:50%; background:#fff; border:3px solid var(--fc); cursor:pointer; }
        @media (max-width: 1000px){ .rx-bottom { grid-template-columns: 1fr !important; } }

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

      <div className="rx-grid">
        {/* ── Columna visor ──────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              position: "relative",
              height: "clamp(440px, 62vh, 720px)",
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid rgba(${color.rgba},0.22)`,
              background: `radial-gradient(120% 80% at 30% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#0b2233 0%,#08131f 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <ReaccionesTiposScene
                reaccionId={r.id}
                atoms={r.atoms}
                rbonds={r.rbonds}
                pbonds={r.pbonds}
                progreso={progreso}
                accent={accent}
                girar={girar}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="rx-live-dot" style={{ ["--exc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 14, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{r.ecuacion}</span>
            </div>

            {/* Badge tipo + fase */}
            <div style={{ position: "absolute", top: 58, left: 16, display: "flex", gap: 8 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${tc}88`, backdropFilter: "blur(10px)" }}>
                <i className={`fa-solid ${tipo.icono}`} style={{ color: tc, fontSize: 12 }} />
                <span style={{ fontSize: 11.5, fontWeight: 900, color: tc }}>{tipo.label}</span>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${faseColor}66`, backdropFilter: "blur(10px)" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: faseColor }} />
                <span style={{ fontSize: 10.5, fontWeight: 900, letterSpacing: "0.1em", color: faseColor }}>{faseLabel}</span>
              </div>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="rx-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="rx-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              <button className="rx-icobtn" data-on={playing} onClick={togglePlay} title="Reproducir la reacción">
                <i className={`fa-solid ${playing ? "fa-pause" : "fa-play"}`} />
              </button>
              <button className="rx-icobtn" data-on={girar} onClick={() => setGirar((v) => !v)} title="Girar el modelo">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="rx-icobtn" onClick={reiniciar} title="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Pie: reproductor de progreso */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "34px 18px 16px", background: "linear-gradient(0deg, rgba(3,8,18,0.94) 0%, transparent 100%)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#9DB4CE", fontFamily: "ui-monospace, monospace" }}>{r.reactivos}</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: tc, letterSpacing: "0.06em" }}>
                  <i className="fa-solid fa-arrow-right-long" style={{ marginRight: 6 }} />{Math.round(progreso * 100)}%
                </span>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#7DF0C0", fontFamily: "ui-monospace, monospace" }}>{r.productos}</span>
              </div>
              <input
                className="rx-range"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={progreso}
                onChange={(e) => { setPlaying(false); setProgreso(parseFloat(e.target.value)); }}
                style={{ ["--fc" as string]: tc, ["--pct" as string]: `${progreso * 100}%` }}
              />
            </div>

            {/* Botón flotante de Teoría */}
            <button className="ex-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>
          </div>

          {/* Selector de tipo + reacciones */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-shapes" style={{ marginRight: 8, color: accent }} />
              Los cinco tipos de reacción
            </Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
              {TIPOS.map((tp) => (
                <button key={tp.id} className="rx-tipo" data-on={tp.id === r.tipo} onClick={() => elegirTipo(tp.id)}
                  style={{ ["--fc" as string]: tp.color }}>
                  <span style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#04121f", background: tp.color, flexShrink: 0 }}>
                    <i className={`fa-solid ${tp.icono}`} />
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ color: "#fff", fontWeight: 900, display: "block" }}>{tp.label}</span>
                    <span style={{ fontSize: 11, color: T.text2, fontWeight: 700, fontFamily: "ui-monospace, monospace" }}>{tp.patron}</span>
                  </span>
                </button>
              ))}
            </div>

            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, margin: "18px 0 9px" }}>REACCIONES DE ESTE TIPO</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {reaccionesDe(r.tipo).map((rr) => (
                <button key={rr.id} className="rx-chip" data-on={rr.id === reaccId} onClick={() => elegirReaccion(rr.id)} title={rr.nombre} style={{ ["--fc" as string]: tc }}>
                  {rr.ecuacion}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Ficha de la reacción */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${tc}55`, background: `color-mix(in srgb, ${tc} 10%, transparent)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: tc }}>
                <i className={`fa-solid ${tipo.icono}`} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", lineHeight: 1.15, fontFamily: "ui-monospace, monospace" }}>{r.ecuacion}</div>
                <div style={{ fontSize: 12, color: tc, fontWeight: 800 }}>{r.nombre} · {tipo.label}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 12px", fontSize: 12.5 }}>
              <span style={{ color: T.text3, fontWeight: 800 }}>Patrón</span>
              <span style={{ color: "#fff", fontWeight: 700, fontFamily: "ui-monospace, monospace" }}>{tipo.patron}</span>
              <span style={{ color: T.text3, fontWeight: 800 }}>Reactivos</span>
              <span style={{ color: "#9DB4CE", fontWeight: 700, fontFamily: "ui-monospace, monospace" }}>{r.reactivos}</span>
              <span style={{ color: T.text3, fontWeight: 800 }}>Productos</span>
              <span style={{ color: "#7DF0C0", fontWeight: 700, fontFamily: "ui-monospace, monospace" }}>{r.productos}</span>
            </div>
          </div>

          {/* Conservación de la masa */}
          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: `1px solid ${accent}40`, background: `rgba(${color.rgba},0.08)` }}>
            <Eyebrow>
              <i className="fa-solid fa-scale-balanced" style={{ marginRight: 8, color: accent }} />
              Conservación de la masa
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5, marginBottom: 13 }}>
              Los <strong style={{ color: "#fff" }}>mismos átomos</strong> están antes y después: solo se reorganizan. Por eso el conteo por elemento es idéntico (Lavoisier).
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {conteos.map((c) => (
                <div key={c.el} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 11px", borderRadius: 999, background: T.inset, border: `1px solid ${T.line}` }}>
                  <span style={{ width: 16, height: 16, borderRadius: "50%", background: ELEMS[c.el].color, border: "1px solid rgba(255,255,255,0.25)", flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{c.el}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.text2 }}>×{c.n}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontSize: 12, fontWeight: 800 }}>
              <span style={{ color: "#9DB4CE" }}>{r.atoms.length} átomos</span>
              <i className="fa-solid fa-equals" style={{ color: accent }} />
              <span style={{ color: "#7DF0C0" }}>{r.atoms.length} átomos</span>
            </div>
          </div>

          {/* Definición del tipo */}
          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow>
              <i className={`fa-solid ${tipo.icono}`} style={{ marginRight: 8, color: tc }} />
              ¿Qué es una reacción de {tipo.label.toLowerCase()}?
            </Eyebrow>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{tipo.definicion}</div>
          </div>

          {/* Contexto */}
          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-location-dot" style={{ marginRight: 8, color: accent }} />
              ¿Dónde ocurre?
            </Eyebrow>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{r.contexto}</div>
          </div>

          {/* Reto: predice los productos */}
          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: `1px solid ${accent}55`, background: `rgba(${color.rgba},0.10)` }}>
            <Eyebrow>
              <i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: 8, color: accent }} />
              Reto: predice los productos
            </Eyebrow>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5, marginBottom: 10 }}>{RETO.intro}</div>
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "grid", gap: 7 }}>
              {RETO.items.map((it, i) => (
                <li key={i} style={{ fontSize: 13, color: "#fff", fontWeight: 700, fontFamily: "ui-monospace, monospace", padding: "8px 12px", borderRadius: 9, background: T.inset, border: `1px solid ${T.line}` }}>{it}</li>
              ))}
            </ul>
            <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.45, marginTop: 10 }}>
              Pista: identifica primero el TIPO (el patrón) y luego reorganiza los átomos.
            </div>
          </div>
        </div>
      </div>

      {/* ── Datos + ideas clave ────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="rx-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-flask-vial" style={{ marginRight: 8, color: accent }} />
            Lo esencial de las reacciones
          </Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {DATOS.map((dd, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 10, background: T.glass, border: `1px solid ${T.line}` }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: accent, background: `rgba(${color.rgba},0.16)`, flexShrink: 0 }}>
                  <i className={`fa-solid ${dd.icono}`} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: "#fff" }}>{dd.valor}</div>
                  <div style={{ fontSize: 11, color: T.text2, lineHeight: 1.4 }}>{dd.texto}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-lightbulb" style={{ marginRight: 8, color: accent }} />
            Ideas clave
          </Eyebrow>
          <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 9 }}>
            {IDEAS.map((x, i) => (
              <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>{x}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* nota de honestidad del modelo */}
      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          Las <strong>ecuaciones químicas son exactas y están balanceadas</strong>, y el conteo de átomos por elemento es real (igual en reactivos y productos). El movimiento de los átomos y las distancias entre ellos son una representación <strong>didáctica</strong> de bolas y barras: sirven para ver cómo se rompen y se forman enlaces, no son las geometrías ni las trayectorias reales. Reacciones tomadas de la progresión 2 (CNEYT-IV).
        </span>
      </div>

      {/* ── Objetivos guiados ─────────────────────────────────────────── */}
      <div style={{ ...card, padding: "18px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
          Objetivos
        </Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
          {objetivos.map((o, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: logrosLab[i] ? "#34D399" : T.text2 }}>
              <i className={`fa-solid ${logrosLab[i] ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: logrosLab[i] ? 1 : 0.3 }} />
              <span style={{ fontWeight: logrosLab[i] ? 700 : 500 }}>{o.txt}</span>
            </div>
          ))}
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
          <FichaTeorica data={REACCIONES_TIPOS_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}

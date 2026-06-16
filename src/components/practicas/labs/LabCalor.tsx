"use client";

/**
 * Laboratorio 3D — "Propagación del calor: conducción, convección y radiación".
 * Práctica experimental anclada a CNEYT-II-P11-A2 (ejercicio; propósito formativo
 * O4, UAC CNEYT-II "El poder de la energía"). Recorre cada mecanismo paso a paso
 * y calcula el flujo de calor con la conductividad térmica k y la energía con la
 * capacidad térmica específica c, con la matemática exacta del módulo de datos.
 *
 * Cuatro modos: conducción · convección · radiación · comparar.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { LabSfx } from "./lab-audio";
import { PROPAGACION_CALOR_FICHA } from "./propagacion-calor-ficha";
import { RETO_A2 } from "./propagacion-calor-data";
import {
  type Modo,
  MODOS,
  MODOS_DEF,
  FASES,
  numFases,
  escenaPara,
  MATERIALES,
  materialPorNombre,
  conduccion,
  calorSensible,
  tiempoCalentar,
  fmtNum,
  COMPARACION,
  PROBLEMA,
  INSTRUCCIONES,
  PREGUNTAS,
  IDEAS,
  GLOSARIO,
  CONTEXTO,
  FUENTE,
  EJEMPLO,
  DATOS,
  HECHOS,
} from "./calor-data";

const CalorScene = dynamic(() => import("./CalorScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-fire-flame-curved fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Cargando la propagación del calor en 3D…</span>
    </div>
  ),
});

export function LabCalor({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("conduccion");
  const [paso, setPaso] = useState<number>(0);
  const [playing, setPlaying] = useState<boolean>(true);
  const [resetNonce, setResetNonce] = useState(0);

  // calculadora de la actividad A2
  const [matNombre, setMatNombre] = useState<string>("Cobre");
  const [areaCm2, setAreaCm2] = useState<number>(100);
  const [largoCm, setLargoCm] = useState<number>(20);
  const [deltaT, setDeltaT] = useState<number>(80);
  const [masaKg, setMasaKg] = useState<number>(1);

  // reto evaluable, teoría (cajón deslizable) y sonido
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
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

  const bump = () => setResetNonce((n) => n + 1);

  const def = MODOS_DEF[modo];
  const modoCol = `#${def.color.replace("#", "")}`;
  const totalFases = numFases(modo);
  const total = Math.max(0, totalFases - 1);
  const idx = Math.min(paso, total);
  const escena = escenaPara(modo, idx);
  const esComparar = modo === "comparar";
  const nombresFase = esComparar ? [] : FASES[modo];

  useEffect(() => {
    if (!playing || esComparar || total === 0) return;
    if (idx >= total) return;
    const t = setInterval(() => setPaso((p) => Math.min(total, p + 1)), 1600);
    return () => clearInterval(t);
  }, [playing, total, idx, esComparar]);

  const cambiarModo = (m: Modo) => {
    setModo(m);
    setPaso(0);
    setPlaying(m !== "comparar");
    bump();
    if (sonido) audioRef.current?.blip();
  };
  const reiniciar = () => {
    setPaso(0);
    setPlaying(!esComparar);
    bump();
  };

  // resultados de la calculadora (A2)
  const mat = materialPorNombre(matNombre);
  const areaM2 = Math.max(0.0001, areaCm2) / 10000;
  const largoM = Math.max(0.001, largoCm) / 100;
  const dT = Math.max(0, deltaT);
  const m = Math.max(0.001, masaKg);
  const flujo = conduccion(mat.k, areaM2, dT, largoM); // W
  const energia = calorSensible(m, mat.c, dT); // J
  const tCal = tiempoCalentar(m, mat.c, dT, flujo); // s

  const objetivo = { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado };

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#04121f", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${def.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{def.etq}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 440, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la información sigue aquí. {def.subtitulo}.
      </div>
    </div>
  );

  const pie: string = esComparar
    ? "Compara los tres caminos del calor: por contacto en sólidos (conducción), por corrientes en fluidos (convección) y por ondas en el vacío (radiación)."
    : `Fase ${idx + 1}/${totalFases} — ${escena.nombre}. ${escena.desc}`;

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes clPulse { 0%,100%{ box-shadow:0 0 0 0 var(--cld); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .cl-live-dot { animation: clPulse 1.6s ease-in-out infinite; }
        .cl-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .cl-grid { grid-template-columns: 1fr; } }
        .cl-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .cl-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .cl-icobtn:hover { background:rgba(255,255,255,0.12); }
        .cl-tabs { display:grid; grid-template-columns: repeat(4,1fr); gap:8px; }
        @media (max-width: 560px){ .cl-tabs { grid-template-columns: repeat(2,1fr); } }
        .cl-tab { cursor:pointer; border:1px solid var(--clc); border-radius:12px; padding:11px 8px; text-align:center;
          background:transparent; transition:all .15s; color:#fff; }
        .cl-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .cl-tab:hover { background:rgba(255,255,255,0.06); }
        .cl-phases { display:flex; flex-wrap:wrap; gap:6px; }
        .cl-phase { cursor:pointer; padding:6px 10px; border-radius:9px; border:1px solid; font-size:11px; font-weight:800; transition:all .12s; }
        .cl-range { width:100%; accent-color: var(--clc); cursor:pointer; }
        .cl-num { width:90px; box-sizing:border-box; font-family:ui-monospace,monospace; font-size:14px; font-weight:800;
          color:#fff; background:rgba(4,10,22,0.55); border:1px solid var(--clc); border-radius:9px; padding:8px 10px; outline:none; text-align:center; }
        .cl-sel { box-sizing:border-box; font-size:13px; font-weight:700; color:#fff; background:rgba(4,10,22,0.55);
          border:1px solid var(--clc); border-radius:9px; padding:8px 10px; outline:none; cursor:pointer; }
        .cl-cmp { width:100%; border-collapse:collapse; }
        .cl-cmp td, .cl-cmp th { padding:8px 9px; font-size:11px; border-bottom:1px solid ${T.line}; vertical-align:top; text-align:left; }
        .cl-cmp th { font-size:9.5px; letter-spacing:0.08em; text-transform:uppercase; color:${T.text3}; }
        @media (max-width: 1000px){ .cl-bottom { grid-template-columns: 1fr !important; } }

        /* Cajón de teoría */
        .ex-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .ex-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .ex-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06121e 0%,#040a16 100%); border-left:1px solid rgba(${color.rgba},0.32);
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
          background:rgba(4,10,22,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; z-index:5; }
        .ex-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateX(-50%) translateY(-1px); }
      `}</style>

      {/* Selector de modo */}
      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="cl-tabs">
          {MODOS.map((mm) => {
            const d = MODOS_DEF[mm];
            const col = `#${d.color.replace("#", "")}`;
            const on = mm === modo;
            return (
              <button key={mm} className="cl-tab" data-on={on} onClick={() => cambiarModo(mm)} style={{ ["--clc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                <div style={{ fontSize: 18, marginBottom: 4, color: on ? col : "inherit" }}><i className={`fa-solid ${d.icono}`} /></div>
                <div style={{ fontSize: 12.5, fontWeight: 900 }}>{d.etq}</div>
                <div style={{ fontSize: 10, color: T.text3, marginTop: 3, lineHeight: 1.25 }}>{d.subtitulo}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="cl-grid">
        {/* ── Columna visor ──────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              position: "relative",
              height: "clamp(440px, 58vh, 660px)",
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid rgba(${color.rgba},0.22)`,
              background: `radial-gradient(120% 80% at 30% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#06121e 0%,#040a16 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <CalorScene modo={modo} escena={escena} playing={playing} modoColor={modoCol} resetNonce={resetNonce} />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)" }}>
              <span className="cl-live-dot" style={{ ["--cld" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{def.etq.toUpperCase()}</span>
            </div>

            {/* Toolbar siempre visible: teoría + sonido */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="cl-icobtn" data-on={drawerOpen} onClick={() => setDrawerOpen(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="cl-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
            </div>

            {/* Toolbar de fases (oculta en comparar) */}
            {!esComparar && (
              <div style={{ position: "absolute", top: 60, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
                <button className="cl-icobtn" onClick={() => { setPlaying(false); setPaso((p) => Math.max(0, p - 1)); }} title="Fase anterior">
                  <i className="fa-solid fa-backward-step" />
                </button>
                <button className="cl-icobtn" data-on={playing} onClick={() => setPlaying((p) => !p)} title={playing ? "Pausar" : "Reanudar"}>
                  <i className={`fa-solid ${playing ? "fa-pause" : "fa-play"}`} />
                </button>
                <button className="cl-icobtn" onClick={() => { setPlaying(false); setPaso((p) => Math.min(total, p + 1)); }} title="Fase siguiente">
                  <i className="fa-solid fa-forward-step" />
                </button>
                <button className="cl-icobtn" onClick={reiniciar} title="Reiniciar">
                  <i className="fa-solid fa-rotate-left" />
                </button>
              </div>
            )}

            {/* Pie: lectura en vivo */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                <i className={`fa-solid ${def.icono}`} style={{ color: modoCol, marginRight: 7 }} />
                {esComparar ? "Tres mecanismos del calor" : escena.nombre} — <span style={{ color: "#cdd8ec" }}>viaja por {escena.medio}</span>
              </div>
              <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>{pie}</div>
            </div>

            {/* Botón flotante de Teoría */}
            <button className="ex-teoria-fab" onClick={() => setDrawerOpen(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>
          </div>

          {/* Panel de control */}
          <div style={{ ...card, padding: "18px 22px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <Eyebrow>
                <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: modoCol }} />
                Controles — {def.etq}
              </Eyebrow>
              <span style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "0.08em", color: "#7dd3fc", border: "1px solid #7dd3fc55", borderRadius: 6, padding: "3px 7px" }}>
                EJERCICIO A2
              </span>
            </div>

            {esComparar ? (
              <div>
                <Eyebrow><i className="fa-solid fa-table-list" style={{ marginRight: 8, color: modoCol }} />Conducción · Convección · Radiación</Eyebrow>
                <table className="cl-cmp">
                  <thead>
                    <tr><th>Rasgo</th><th style={{ color: "#fb923c" }}>Conducción</th><th style={{ color: "#38bdf8" }}>Convección</th><th style={{ color: "#f472b6" }}>Radiación</th></tr>
                  </thead>
                  <tbody>
                    {COMPARACION.map((f) => (
                      <tr key={f.rasgo}>
                        <td style={{ color: T.text2, fontWeight: 700 }}>{f.rasgo}</td>
                        <td style={{ color: "#fff" }}>{f.conduccion}</td>
                        <td style={{ color: "#fff" }}>{f.conveccion}</td>
                        <td style={{ color: "#fff" }}>{f.radiacion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                  <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.1em", color: T.text3 }}>FASE</span>
                  <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{idx + 1} / {totalFases}</span>
                </div>
                <input type="range" min={0} max={total} value={idx} onChange={(e) => { setPlaying(false); setPaso(Number(e.target.value)); }} className="cl-range" style={{ ["--clc" as string]: modoCol, marginBottom: 14 }} />
                <div className="cl-phases" style={{ marginBottom: 4 }}>
                  {nombresFase.map((nom, i) => {
                    const on = i === idx;
                    const visto = i < idx;
                    return (
                      <button
                        key={nom}
                        className="cl-phase"
                        onClick={() => { setPlaying(false); setPaso(i); }}
                        style={{
                          borderColor: on ? modoCol : visto ? `${modoCol}55` : "rgba(255,255,255,0.12)",
                          background: on ? `${modoCol}22` : "transparent",
                          color: on ? "#fff" : visto ? "#cdd8ec" : T.text3,
                        }}
                      >
                        {nom}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Calculadora de la actividad A2 */}
          <div style={{ ...card, padding: "18px 22px 22px" }}>
            <Eyebrow><i className="fa-solid fa-calculator" style={{ marginRight: 8, color: accent }} />Calculadora — flujo y energía de calor</Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "10px 0 16px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <span style={{ fontSize: 11, color: T.text3, fontWeight: 700 }}>Material (k, c)</span>
                <select className="cl-sel" value={matNombre} onChange={(e) => setMatNombre(e.target.value)} style={{ ["--clc" as string]: accent }}>
                  {MATERIALES.map((mt) => (
                    <option key={mt.nombre} value={mt.nombre}>{mt.nombre} — k={mt.k}</option>
                  ))}
                </select>
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <span style={{ fontSize: 11, color: T.text3, fontWeight: 700 }}>ΔT (°C)</span>
                <input type="number" className="cl-num" min={0} max={2000} step={5} value={deltaT} onChange={(e) => setDeltaT(Number(e.target.value) || 0)} style={{ ["--clc" as string]: accent, width: "100%" }} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <span style={{ fontSize: 11, color: T.text3, fontWeight: 700 }}>Área (cm²)</span>
                <input type="number" className="cl-num" min={1} max={100000} step={10} value={areaCm2} onChange={(e) => setAreaCm2(Number(e.target.value) || 1)} style={{ ["--clc" as string]: accent, width: "100%" }} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <span style={{ fontSize: 11, color: T.text3, fontWeight: 700 }}>Largo / grosor (cm)</span>
                <input type="number" className="cl-num" min={0.1} max={1000} step={1} value={largoCm} onChange={(e) => setLargoCm(Number(e.target.value) || 0.1)} style={{ ["--clc" as string]: accent, width: "100%" }} />
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid #fb923c55", background: "rgba(251,146,60,0.08)" }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: "#fb923c", marginBottom: 6 }}><i className="fa-solid fa-fire-burner" style={{ marginRight: 6 }} />CONDUCCIÓN</div>
                <div style={{ fontSize: 12.5, color: "#fff", lineHeight: 1.6 }}>
                  Q/t = <strong>{fmtNum(flujo)}</strong> W<br />
                  <span style={{ color: T.text3 }}>= k·A·ΔT/L</span>
                </div>
              </div>
              <div style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid #38bdf855", background: "rgba(56,189,248,0.08)" }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: "#38bdf8", marginBottom: 6 }}><i className="fa-solid fa-temperature-half" style={{ marginRight: 6 }} />ENERGÍA</div>
                <div style={{ fontSize: 12.5, color: "#fff", lineHeight: 1.6 }}>
                  Q = <strong>{fmtNum(energia)}</strong> J<br />
                  <span style={{ color: T.text3 }}>= m·c·ΔT ({m} kg)</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: T.text2 }}>Masa a calentar (kg):</span>
              <input type="number" className="cl-num" min={0.01} max={10000} step={0.5} value={masaKg} onChange={(e) => setMasaKg(Number(e.target.value) || 0.01)} style={{ ["--clc" as string]: accent }} />
            </div>

            <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: 11, border: `1px solid ${accent}44`, background: `rgba(${color.rgba},0.08)`, fontSize: 12, color: "#eaf0fb", lineHeight: 1.5 }}>
              <i className="fa-solid fa-circle-info" style={{ color: accent, marginRight: 8 }} />
              Con esa potencia de conducción, calentar {m} kg de {mat.nombre.toLowerCase()} (c = {mat.c} J/kg·K) {dT} °C tomaría <strong>{fmtNum(tCal)} s</strong>. El agua, con c muy alta, necesita mucha más energía: por eso modera el clima.
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Descripción del laboratorio */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}66`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-fire-flame-curved" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>El visor de la propagación del calor</div>
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{PROBLEMA}</div>
          </div>

          {/* Para reflexionar */}
          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: "1px solid #7dd3fc55", background: "rgba(125,211,252,0.07)" }}>
            <Eyebrow><i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: "#7dd3fc" }} />Para reflexionar — {def.etq}</Eyebrow>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 8 }}>
              {PREGUNTAS[modo].map((q, i) => (
                <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>{q}</li>
              ))}
            </ul>
          </div>

          {/* Ejemplo resuelto (A2) */}
          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow><i className="fa-solid fa-square-root-variable" style={{ marginRight: 8, color: accent }} />Ejemplo resuelto (A2)</Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55, marginBottom: 10 }}>{EJEMPLO.enunciado}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
              {EJEMPLO.datos.map((d, i) => (
                <span key={i} style={{ fontSize: 11, fontWeight: 800, color: "#fff", padding: "4px 9px", borderRadius: 8, background: "rgba(4,10,22,0.5)", border: `1px solid ${T.line}` }}>{d}</span>
              ))}
            </div>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55, marginBottom: 10 }}>{EJEMPLO.solucion}</div>
            <div style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${accent}44`, background: `rgba(${color.rgba},0.08)`, fontSize: 12, fontWeight: 800, color: "#86efac" }}>
              <i className="fa-solid fa-flag-checkered" style={{ marginRight: 7, color: accent }} />{EJEMPLO.resultado}
            </div>
          </div>

          {/* Cómo usar */}
          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow><i className="fa-solid fa-list-ol" style={{ marginRight: 8, color: accent }} />Cómo usar el laboratorio</Eyebrow>
            <div style={{ display: "grid", gap: 9 }}>
              {INSTRUCCIONES[modo].map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${accent}25` }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#04121f", background: accent, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontSize: 12, color: "#fff", lineHeight: 1.45, minWidth: 0 }}>{p}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Datos + ideas clave ────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="cl-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow><i className="fa-solid fa-magnifying-glass-chart" style={{ marginRight: 8, color: accent }} />Datos de la propagación del calor</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {DATOS.map((dd, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 10, background: T.glass, border: `1px solid ${T.line}` }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: accent, background: `rgba(${color.rgba},0.16)`, flexShrink: 0 }}>
                  <i className={`fa-solid ${dd.icono}`} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{dd.valor}</div>
                  <div style={{ fontSize: 11, color: T.text2, lineHeight: 1.4 }}>{dd.texto}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Contexto mexicano */}
          <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 12, border: `1px solid ${accent}33`, background: `rgba(${color.rgba},0.07)` }}>
            <Eyebrow><i className="fa-solid fa-location-dot" style={{ marginRight: 8, color: accent }} />México: clima y vivienda</Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{CONTEXTO}</div>
          </div>

          {/* ¿Sabías que? */}
          <div style={{ marginTop: 16 }}>
            <Eyebrow><i className="fa-solid fa-circle-question" style={{ marginRight: 8, color: accent }} />¿Sabías que?</Eyebrow>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 8 }}>
              {HECHOS.map((h, i) => (
                <li key={i} style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{h}</li>
              ))}
            </ul>
          </div>

          {/* Glosario */}
          <div style={{ marginTop: 16 }}>
            <Eyebrow><i className="fa-solid fa-book" style={{ marginRight: 8, color: accent }} />Glosario</Eyebrow>
            <div style={{ display: "grid", gap: 8 }}>
              {GLOSARIO.map((g, i) => (
                <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${T.line}` }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: accent }}>{g.termino}. </span>
                  <span style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{g.definicion}</span>
                  <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.4, marginTop: 4 }}><i className="fa-solid fa-flask" style={{ marginRight: 6, color: accent }} />{g.ejemplo}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow><i className="fa-solid fa-lightbulb" style={{ marginRight: 8, color: accent }} />Ideas clave</Eyebrow>
          <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 9 }}>
            {IDEAS.map((x, i) => (
              <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>{x}</li>
            ))}
          </ul>

          <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.line}` }}>
            <Eyebrow><i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />Objetivo</Eyebrow>
            <div style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13, color: objetivo.done ? OK : T.text2, marginTop: 4 }}>
              <i className={`fa-solid ${objetivo.done ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: objetivo.done ? 1 : 0.3 }} />
              <span style={{ fontWeight: objetivo.done ? 700 : 500 }}>{objetivo.txt}</span>
            </div>
          </div>
        </div>
      </div>

      {/* nota de honestidad del modelo */}
      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          El flujo de conducción (Q/t = k·A·ΔT/L), la energía sensible (Q = m·c·ΔT) y el tiempo de calentamiento que devuelve la calculadora son <strong>exactos</strong> para los valores de k y c reales de cada material. El modelo 3D es <strong>esquemático</strong> (no a escala): el gradiente de color, las corrientes del fluido y los anillos de onda representan el mecanismo de transporte, no medidas físicas. Fuente: {FUENTE}
        </span>
      </div>

      {/* ── Reto evaluable: el ejercicio verbatim del ancla A2 ────────── */}
      <RetoNumericoCard
        reto={RETO_A2}
        accent={accent}
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
      />

      {/* ── Cajón de teoría ──────────────────────────────────────────── */}
      <div className="ex-scrim" data-open={drawerOpen} onClick={() => setDrawerOpen(false)} />
      <aside className="ex-drawer" data-open={drawerOpen} aria-hidden={!drawerOpen}>
        <div className="ex-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="ex-close" onClick={() => setDrawerOpen(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="ex-drawer-body">
          <FichaTeorica data={PROPAGACION_CALOR_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}

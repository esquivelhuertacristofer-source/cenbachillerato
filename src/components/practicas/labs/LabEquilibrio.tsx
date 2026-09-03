"use client";

/**
 * Laboratorio 3D — "Equilibrio químico y reacciones reversibles".
 * Práctica experimental anclada a CNEYT-IV·O3 (UAC "El poder de la química").
 * Recorre el equilibrio dinámico paso a paso y calcula el cociente Q frente a la
 * constante Kc (para predecir el sentido) y la respuesta de Le Châtelier, con la
 * química exacta del módulo de datos.
 *
 * Cuatro modos: equilibrio dinámico · constante Kc · Le Châtelier · comparar.
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow, SceneBoundary } from "./_kit";
import { FichaTeorica } from "./_ficha";
import { EQUILIBRIO_FICHA } from "./equilibrio-quimico-ficha";
import { RetoNumericoCard } from "./_reto-numerico";
import { RETO_A2 } from "./equilibrio-quimico-data";
import { LabSfx } from "./lab-audio";
import { useEstrellas } from "@/lib/hooks/useEstrellas";
import { useLogros } from "./_partida";
import {
  type Modo,
  MODOS,
  MODOS_DEF,
  FASES,
  numFases,
  escenaPara,
  REACCIONES,
  reaccionPorId,
  evaluarEquilibrio,
  PERTURBACIONES,
  type Perturbacion,
  prediceLeChatelier,
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
} from "./equilibrio-data";

const EquilibrioScene = dynamic(() => import("./EquilibrioScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-arrows-rotate fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Cargando el equilibrio químico en 3D…</span>
    </div>
  ),
});

const RETO_KEY = "cen-equilibrio-quimico-reto";

export function LabEquilibrio({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("reversible");
  const [paso, setPaso] = useState<number>(0);
  const [playing, setPlaying] = useState<boolean>(true);
  const [resetNonce, setResetNonce] = useState(0);

  // calculadora de la actividad A2
  const [reacId, setReacId] = useState<string>("hi");
  const [conc, setConc] = useState<Record<string, number>>({ "H₂": 0.2, "I₂": 0.2, HI: 0.5 });
  const [perturb, setPerturb] = useState<Perturbacion>("subir-presion");

  // reto evaluable, teoría (cajón deslizable) y sonido
  const [ejercicioAprobado, setEjercicioAprobado] = useState(false);
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
    const t = setInterval(() => setPaso((p) => Math.min(total, p + 1)), 1700);
    return () => clearInterval(t);
  }, [playing, total, idx, esComparar]);

  const cambiarModo = (m: Modo) => {
    if (sonido) audioRef.current?.blip();
    setModo(m);
    setPaso(0);
    setPlaying(m !== "comparar");
    bump();
  };
  const reiniciar = () => {
    setPaso(0);
    setPlaying(!esComparar);
    bump();
  };

  // ── Calculadora A2: cociente Q vs Kc + Le Châtelier ──────────────────────
  const reac = reaccionPorId(reacId);
  const especies = useMemo(() => [...reac.reactivos, ...reac.productos], [reac]);

  // al cambiar de reacción, sembrar concentraciones por defecto razonables
  const cambiarReaccion = (id: string) => {
    const r = reaccionPorId(id);
    const next: Record<string, number> = {};
    for (const e of [...r.reactivos, ...r.productos]) next[e.formula] = 0.5;
    setReacId(id);
    setConc(next);
  };

  const evalEq = evaluarEquilibrio(reac, conc);
  const pred = prediceLeChatelier(reac, perturb);
  const sentidoTxt = evalEq.sentido === "directa" ? "→ derecha" : evalEq.sentido === "inversa" ? "← izquierda" : "= equilibrio";
  const sentidoCol = evalEq.sentido === "directa" ? "#fb923c" : evalEq.sentido === "inversa" ? "#38bdf8" : "#34d399";
  const predCol = pred.sentido === "directa" ? "#fb923c" : pred.sentido === "inversa" ? "#38bdf8" : "#94a3b8";

  const objetivos = [
    { txt: "Observa el equilibrio dinámico en las cuatro fases de la animación", done: idx > 0 },
    { txt: "Usa la calculadora para comparar Q con Kc en la reacción H₂ + I₂ ⇌ 2 HI", done: evalEq.q > 0 },
    { txt: "Predice el desplazamiento con Le Châtelier", done: perturb !== "subir-presion" || pred.sentido !== "directa" },
    { txt: "Resuelve el reto evaluable de la actividad A2", done: ejercicioAprobado },
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
    ? "Compara una reacción reversible (llega al equilibrio y conserva reactivos y productos) con una irreversible (avanza hasta agotar un reactivo)."
    : `Fase ${idx + 1}/${totalFases} — ${escena.nombre}. ${escena.desc}`;

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes eqPulse { 0%,100%{ box-shadow:0 0 0 0 var(--eqd); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .eq-live-dot { animation: eqPulse 1.6s ease-in-out infinite; }
        .eq-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .eq-grid { grid-template-columns: 1fr; } }
        .eq-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .eq-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .eq-icobtn:hover { background:rgba(255,255,255,0.12); }
        .eq-tabs { display:grid; grid-template-columns: repeat(4,1fr); gap:8px; }
        @media (max-width: 560px){ .eq-tabs { grid-template-columns: repeat(2,1fr); } }
        .eq-tab { cursor:pointer; border:1px solid var(--eqc); border-radius:12px; padding:11px 8px; text-align:center;
          background:transparent; transition:all .15s; color:#fff; }
        .eq-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .eq-tab:hover { background:rgba(255,255,255,0.06); }
        .eq-phases { display:flex; flex-wrap:wrap; gap:6px; }
        .eq-phase { cursor:pointer; padding:6px 10px; border-radius:9px; border:1px solid; font-size:11px; font-weight:800; transition:all .12s; }
        .eq-range { width:100%; accent-color: var(--eqc); cursor:pointer; }
        .eq-num { width:100%; box-sizing:border-box; font-family:ui-monospace,monospace; font-size:14px; font-weight:800;
          color:#fff; background:rgba(4,10,22,0.55); border:1px solid var(--eqc); border-radius:9px; padding:8px 10px; outline:none; text-align:center; }
        .eq-sel { box-sizing:border-box; font-size:13px; font-weight:700; color:#fff; background:rgba(4,10,22,0.55);
          border:1px solid var(--eqc); border-radius:9px; padding:8px 10px; outline:none; cursor:pointer; }
        .eq-cmp { width:100%; border-collapse:collapse; }
        .eq-cmp td, .eq-cmp th { padding:8px 9px; font-size:11px; border-bottom:1px solid ${T.line}; vertical-align:top; text-align:left; }
        .eq-cmp th { font-size:9.5px; letter-spacing:0.08em; text-transform:uppercase; color:${T.text3}; }
        @media (max-width: 1000px){ .eq-bottom { grid-template-columns: 1fr !important; } }

        /* Cajón de teoría */
        .eq-scrim { position:fixed; inset:0; background:rgba(2,8,20,0.55); backdrop-filter:blur(2px);
          opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:60; }
        .eq-scrim[data-open="true"] { opacity:1; pointer-events:auto; }
        .eq-drawer { position:fixed; top:0; right:0; height:100dvh; width:min(560px,94vw); z-index:61;
          background:linear-gradient(180deg,#06182f 0%,#020d1d 100%); border-left:1px solid rgba(${color.rgba},0.32);
          box-shadow:-24px 0 60px -20px rgba(0,0,0,0.7); transform:translateX(102%); transition:transform .34s cubic-bezier(.4,0,.2,1);
          display:flex; flex-direction:column; }
        .eq-drawer[data-open="true"] { transform:translateX(0); }
        .eq-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:18px 20px; border-bottom:1px solid ${T.line}; }
        .eq-drawer-body { overflow-y:auto; padding:20px; flex:1; }
        .eq-close { cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid ${T.line};
          background:${T.glass}; color:#fff; font-size:15px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .eq-close:hover { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .eq-teoria-fab { position:absolute; bottom:16px; left:50%; transform:translateX(-50%); cursor:pointer; display:inline-flex; align-items:center; gap:9px;
          padding:11px 16px; border-radius:999px; border:1px solid ${accent}88; color:#fff; font-size:13px; font-weight:800;
          background:rgba(2,12,28,0.82); backdrop-filter:blur(10px); box-shadow:0 8px 28px -8px ${accent}; transition:all .16s; }
        .eq-teoria-fab:hover { background:rgba(${color.rgba},0.28); transform:translateX(-50%) translateY(-1px); }
      `}</style>

      {/* Selector de modo */}
      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="eq-tabs">
          {MODOS.map((mm) => {
            const d = MODOS_DEF[mm];
            const col = `#${d.color.replace("#", "")}`;
            const on = mm === modo;
            return (
              <button key={mm} className="eq-tab" data-on={on} onClick={() => cambiarModo(mm)} style={{ ["--eqc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                <div style={{ fontSize: 18, marginBottom: 4, color: on ? col : "inherit" }}><i className={`fa-solid ${d.icono}`} /></div>
                <div style={{ fontSize: 12.5, fontWeight: 900 }}>{d.etq}</div>
                <div style={{ fontSize: 10, color: T.text3, marginTop: 3, lineHeight: 1.25 }}>{d.subtitulo}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="eq-grid">
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
              <EquilibrioScene modo={modo} escena={escena} playing={playing} modoColor={modoCol} resetNonce={resetNonce} />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)" }}>
              <span className="eq-live-dot" style={{ ["--eqd" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{def.etq.toUpperCase()}</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="eq-icobtn" data-on={drawer} onClick={() => setDrawer(true)} title="Teoría">
                <i className="fa-solid fa-book-open" />
              </button>
              <button className="eq-icobtn" data-on={sonido} onClick={toggleSonido} title={sonido ? "Silenciar" : "Activar sonido"}>
                <i className={`fa-solid ${sonido ? "fa-volume-high" : "fa-volume-xmark"}`} />
              </button>
              {!esComparar && (
                <>
                  <button className="eq-icobtn" onClick={() => { setPlaying(false); setPaso((p) => Math.max(0, p - 1)); }} title="Fase anterior">
                    <i className="fa-solid fa-backward-step" />
                  </button>
                  <button className="eq-icobtn" data-on={playing} onClick={() => setPlaying((p) => !p)} title={playing ? "Pausar" : "Reanudar"}>
                    <i className={`fa-solid ${playing ? "fa-pause" : "fa-play"}`} />
                  </button>
                  <button className="eq-icobtn" onClick={() => { setPlaying(false); setPaso((p) => Math.min(total, p + 1)); }} title="Fase siguiente">
                    <i className="fa-solid fa-forward-step" />
                  </button>
                  <button className="eq-icobtn" onClick={reiniciar} title="Reiniciar">
                    <i className="fa-solid fa-rotate-left" />
                  </button>
                </>
              )}
            </div>

            {/* Botón flotante de Teoría */}
            <button className="eq-teoria-fab" onClick={() => setDrawer(true)}>
              <i className="fa-solid fa-book-open" />
              Teoría
            </button>

            {/* Pie: lectura en vivo */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                <i className={`fa-solid ${def.icono}`} style={{ color: modoCol, marginRight: 7 }} />
                {esComparar ? "Reversible vs irreversible" : escena.nombre} — <span style={{ color: "#cdd8ec" }}>{escena.medio}</span>
              </div>
              <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>{pie}</div>
            </div>
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
                <Eyebrow><i className="fa-solid fa-table-list" style={{ marginRight: 8, color: modoCol }} />Reversible (⇌) vs irreversible (→)</Eyebrow>
                <table className="eq-cmp">
                  <thead>
                    <tr><th>Rasgo</th><th style={{ color: "#34d399" }}>Reversible ⇌</th><th style={{ color: "#fb923c" }}>Irreversible →</th></tr>
                  </thead>
                  <tbody>
                    {COMPARACION.map((f) => (
                      <tr key={f.rasgo}>
                        <td style={{ color: T.text2, fontWeight: 700 }}>{f.rasgo}</td>
                        <td style={{ color: "#fff" }}>{f.reversible}</td>
                        <td style={{ color: "#fff" }}>{f.irreversible}</td>
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
                <input type="range" min={0} max={total} value={idx} onChange={(e) => { setPlaying(false); setPaso(Number(e.target.value)); }} className="eq-range" style={{ ["--eqc" as string]: modoCol, marginBottom: 14 }} />
                <div className="eq-phases" style={{ marginBottom: 4 }}>
                  {nombresFase.map((nom, i) => {
                    const on = i === idx;
                    const visto = i < idx;
                    return (
                      <button
                        key={nom}
                        className="eq-phase"
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
            <Eyebrow><i className="fa-solid fa-calculator" style={{ marginRight: 8, color: accent }} />Calculadora — cociente Q vs constante Kc</Eyebrow>

            <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: T.text3, fontWeight: 700 }}>Reacción en equilibrio</span>
              <select className="eq-sel" value={reacId} onChange={(e) => cambiarReaccion(e.target.value)} style={{ ["--eqc" as string]: accent }}>
                {REACCIONES.map((r) => (
                  <option key={r.id} value={r.id}>{r.ecuacion} — Kc={fmtNum(r.kc)} ({r.temperatura})</option>
                ))}
              </select>
            </div>

            {/* Concentraciones por especie */}
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.06em", color: accent, margin: "4px 0 8px" }}>
              <i className="fa-solid fa-flask-vial" style={{ marginRight: 7 }} />CONCENTRACIONES (mol/L)
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 10, marginBottom: 14 }}>
              {especies.map((e) => {
                const esProd = reac.productos.some((p) => p.formula === e.formula);
                return (
                  <label key={e.formula} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <span style={{ fontSize: 11, color: esProd ? "#fb923c" : "#38bdf8", fontWeight: 800 }}>
                      [{e.formula}]{e.coef > 1 ? ` (×${e.coef})` : ""}
                    </span>
                    <input
                      type="number"
                      className="eq-num"
                      min={0}
                      max={100}
                      step={0.05}
                      value={conc[e.formula] ?? 0}
                      onChange={(ev) => setConc((c) => ({ ...c, [e.formula]: Math.max(0, Number(ev.target.value) || 0) }))}
                      style={{ ["--eqc" as string]: accent }}
                    />
                  </label>
                );
              })}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid #fbbf2455", background: "rgba(251,191,36,0.08)" }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: "#fbbf24", marginBottom: 6 }}><i className="fa-solid fa-q" style={{ marginRight: 6 }} />COCIENTE Q</div>
                <div style={{ fontSize: 12.5, color: "#fff", lineHeight: 1.6 }}>
                  Q = <strong>{fmtNum(evalEq.q)}</strong><br />
                  <span style={{ color: T.text3 }}>Kc = {fmtNum(evalEq.kc)}</span>
                </div>
              </div>
              <div style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${sentidoCol}55`, background: `${sentidoCol}14` }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: sentidoCol, marginBottom: 6 }}><i className="fa-solid fa-arrows-left-right" style={{ marginRight: 6 }} />SENTIDO</div>
                <div style={{ fontSize: 12.5, color: "#fff", lineHeight: 1.6 }}>
                  <strong>{sentidoTxt}</strong><br />
                  <span style={{ color: T.text3 }}>{evalEq.sentido === "directa" ? "Q < Kc" : evalEq.sentido === "inversa" ? "Q > Kc" : "Q = Kc"}</span>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 10, padding: "9px 12px", borderRadius: 10, border: `1px solid ${sentidoCol}44`, background: `${sentidoCol}12`, fontSize: 11.5, color: "#eaf0fb", lineHeight: 1.45 }}>
              <i className="fa-solid fa-circle-info" style={{ marginRight: 7, color: sentidoCol }} />
              {evalEq.texto}
            </div>

            {/* Le Châtelier */}
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.06em", color: "#a78bfa", margin: "16px 0 8px" }}>
              <i className="fa-solid fa-weight-hanging" style={{ marginRight: 7 }} />LE CHÂTELIER — ¿qué pasa si…?
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: T.text3, fontWeight: 700 }}>Perturbación al equilibrio</span>
              <select className="eq-sel" value={perturb} onChange={(e) => setPerturb(e.target.value as Perturbacion)} style={{ ["--eqc" as string]: "#a78bfa" }}>
                {PERTURBACIONES.map((p) => (
                  <option key={p.id} value={p.id}>{p.etq}</option>
                ))}
              </select>
            </div>
            <div style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${predCol}55`, background: `${predCol}14` }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: predCol, marginBottom: 6 }}>
                <i className="fa-solid fa-arrow-right-arrow-left" style={{ marginRight: 6 }} />DESPLAZAMIENTO <span style={{ fontFamily: "ui-monospace, monospace", marginLeft: 6 }}>{pred.flecha}</span>
              </div>
              <div style={{ fontSize: 12, color: "#fff", lineHeight: 1.5 }}>{pred.texto}</div>
            </div>

            <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: 11, border: `1px solid ${accent}44`, background: `rgba(${color.rgba},0.08)`, fontSize: 12, color: "#eaf0fb", lineHeight: 1.5 }}>
              <i className="fa-solid fa-circle-info" style={{ color: accent, marginRight: 8 }} />
              El cociente Q se calcula igual que Kc (productos sobre reactivos, cada uno elevado a su coeficiente). Compararlos te dice hacia dónde se moverá el sistema; Le Châtelier predice la respuesta a perturbaciones. Para {reac.ecuacion}, Kc = {fmtNum(reac.kc)} a {reac.temperatura}.
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Descripción del laboratorio */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}66`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-arrows-rotate" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>El visor del equilibrio químico</div>
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
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="eq-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow><i className="fa-solid fa-magnifying-glass-chart" style={{ marginRight: 8, color: accent }} />Datos del equilibrio químico</Eyebrow>
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
            <Eyebrow><i className="fa-solid fa-location-dot" style={{ marginRight: 8, color: accent }} />México: fertilizantes, esmog y la sangre</Eyebrow>
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
        </div>
      </div>

      {/* nota de honestidad del modelo */}
      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          El cociente Q = [productos]^coef / [reactivos]^coef, su comparación con Kc y la predicción de Le Châtelier que devuelve la calculadora son <strong>exactos</strong> para los valores tabulados de Kc y ΔH de cada reacción. El modelo 3D es <strong>esquemático</strong> (no a escala): las esferas, las barras de velocidad y el medidor representan el mecanismo del equilibrio dinámico, no medidas físicas. Fuente: {FUENTE}
        </span>
      </div>

      {/* ── Objetivos ──────────────────────────────────────────────────────── */}
      <div style={{ ...card, padding: "18px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
          Objetivos
        </Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
          {objetivos.map((o, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: logrosLab[i] ? OK : T.text2 }}>
              <i className={`fa-solid ${logrosLab[i] ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: logrosLab[i] ? 1 : 0.3 }} />
              <span style={{ fontWeight: logrosLab[i] ? 700 : 500 }}>{o.txt}</span>
            </div>
          ))}
        </div>
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
      <div className="eq-scrim" data-open={drawer} onClick={() => setDrawer(false)} />
      <aside className="eq-drawer" data-open={drawer} aria-hidden={!drawer}>
        <div className="eq-drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <i className="fa-solid fa-book-open" style={{ color: accent, fontSize: 17 }} />
            <span style={{ fontSize: 15, fontWeight: 900, color: T.text }}>Teoría de la práctica</span>
          </div>
          <button className="eq-close" onClick={() => setDrawer(false)} title="Cerrar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="eq-drawer-body">
          <FichaTeorica data={EQUILIBRIO_FICHA} accent={accent} rgba={color.rgba} defaultOpen />
        </div>
      </aside>
    </div>
  );
}

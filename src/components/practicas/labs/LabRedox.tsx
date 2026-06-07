"use client";

/**
 * Laboratorio 3D — "Reacciones redox y combustión".
 * Práctica experimental anclada a CNEYT-IV-P09-A2 (ejercicio; propósito formativo
 * O5, UAC CNEYT-IV "El poder de la química"). Recorre cada proceso paso a paso y
 * calcula el potencial de una pila (E°pila = E°cátodo − E°ánodo) y la energía que
 * libera un combustible, con la química exacta del módulo de datos.
 *
 * Cuatro modos: óxido-reducción · combustión · pila galvánica · comparar.
 */

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, card, Eyebrow, SceneBoundary } from "./_kit";
import {
  type Modo,
  MODOS,
  MODOS_DEF,
  FASES,
  numFases,
  escenaPara,
  PARES_REDOX,
  parPorSimbolo,
  celdaEspontanea,
  COMBUSTIBLES,
  combustiblePorNombre,
  energiaCombustion,
  energiaElectrica,
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
} from "./redox-data";

const RedoxScene = dynamic(() => import("./RedoxScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-atom fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Cargando las reacciones redox en 3D…</span>
    </div>
  ),
});

export function LabRedox({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("redox");
  const [paso, setPaso] = useState<number>(0);
  const [playing, setPlaying] = useState<boolean>(true);
  const [resetNonce, setResetNonce] = useState(0);

  // calculadora de la actividad A2
  const [catSimbolo, setCatSimbolo] = useState<string>("Cu²⁺/Cu");
  const [anoSimbolo, setAnoSimbolo] = useState<string>("Zn²⁺/Zn");
  const [combNombre, setCombNombre] = useState<string>("Metano");
  const [moles, setMoles] = useState<number>(1);

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
  };
  const reiniciar = () => {
    setPaso(0);
    setPlaying(!esComparar);
    bump();
  };

  // resultados de la calculadora (A2)
  const parA = parPorSimbolo(catSimbolo);
  const parB = parPorSimbolo(anoSimbolo);
  const celda = celdaEspontanea(parA, parB);
  const espontaneaEnOrden = parA.eRed >= parB.eRed; // ¿el elegido como cátodo realmente lo es?
  const nElec = Math.max(parA.n, parB.n);
  const wElec = energiaElectrica(nElec, celda.ePila); // J por avance de reacción

  const comb = combustiblePorNombre(combNombre);
  const mol = Math.max(0, moles);
  const energiaQuema = energiaCombustion(comb.deltaH, mol); // kJ

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
    ? "Compara los tres procesos: en todos hay transferencia de electrones. La combustión es un redox muy rápido; la pila es un redox separado para dar corriente."
    : `Fase ${idx + 1}/${totalFases} — ${escena.nombre}. ${escena.desc}`;

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes rxPulse { 0%,100%{ box-shadow:0 0 0 0 var(--rxd); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .rx-live-dot { animation: rxPulse 1.6s ease-in-out infinite; }
        .rx-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .rx-grid { grid-template-columns: 1fr; } }
        .rx-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .rx-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .rx-icobtn:hover { background:rgba(255,255,255,0.12); }
        .rx-tabs { display:grid; grid-template-columns: repeat(4,1fr); gap:8px; }
        @media (max-width: 560px){ .rx-tabs { grid-template-columns: repeat(2,1fr); } }
        .rx-tab { cursor:pointer; border:1px solid var(--rxc); border-radius:12px; padding:11px 8px; text-align:center;
          background:transparent; transition:all .15s; color:#fff; }
        .rx-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .rx-tab:hover { background:rgba(255,255,255,0.06); }
        .rx-phases { display:flex; flex-wrap:wrap; gap:6px; }
        .rx-phase { cursor:pointer; padding:6px 10px; border-radius:9px; border:1px solid; font-size:11px; font-weight:800; transition:all .12s; }
        .rx-range { width:100%; accent-color: var(--rxc); cursor:pointer; }
        .rx-num { width:90px; box-sizing:border-box; font-family:ui-monospace,monospace; font-size:14px; font-weight:800;
          color:#fff; background:rgba(4,10,22,0.55); border:1px solid var(--rxc); border-radius:9px; padding:8px 10px; outline:none; text-align:center; }
        .rx-sel { box-sizing:border-box; font-size:13px; font-weight:700; color:#fff; background:rgba(4,10,22,0.55);
          border:1px solid var(--rxc); border-radius:9px; padding:8px 10px; outline:none; cursor:pointer; }
        .rx-cmp { width:100%; border-collapse:collapse; }
        .rx-cmp td, .rx-cmp th { padding:8px 9px; font-size:11px; border-bottom:1px solid ${T.line}; vertical-align:top; text-align:left; }
        .rx-cmp th { font-size:9.5px; letter-spacing:0.08em; text-transform:uppercase; color:${T.text3}; }
        @media (max-width: 1000px){ .rx-bottom { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* Selector de modo */}
      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="rx-tabs">
          {MODOS.map((mm) => {
            const d = MODOS_DEF[mm];
            const col = `#${d.color.replace("#", "")}`;
            const on = mm === modo;
            return (
              <button key={mm} className="rx-tab" data-on={on} onClick={() => cambiarModo(mm)} style={{ ["--rxc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                <div style={{ fontSize: 18, marginBottom: 4, color: on ? col : "inherit" }}><i className={`fa-solid ${d.icono}`} /></div>
                <div style={{ fontSize: 12.5, fontWeight: 900 }}>{d.etq}</div>
                <div style={{ fontSize: 10, color: T.text3, marginTop: 3, lineHeight: 1.25 }}>{d.subtitulo}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rx-grid">
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
              <RedoxScene modo={modo} escena={escena} playing={playing} modoColor={modoCol} resetNonce={resetNonce} />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)" }}>
              <span className="rx-live-dot" style={{ ["--rxd" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{def.etq.toUpperCase()}</span>
            </div>

            {/* Toolbar (oculta en comparar) */}
            {!esComparar && (
              <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
                <button className="rx-icobtn" onClick={() => { setPlaying(false); setPaso((p) => Math.max(0, p - 1)); }} title="Fase anterior">
                  <i className="fa-solid fa-backward-step" />
                </button>
                <button className="rx-icobtn" data-on={playing} onClick={() => setPlaying((p) => !p)} title={playing ? "Pausar" : "Reanudar"}>
                  <i className={`fa-solid ${playing ? "fa-pause" : "fa-play"}`} />
                </button>
                <button className="rx-icobtn" onClick={() => { setPlaying(false); setPaso((p) => Math.min(total, p + 1)); }} title="Fase siguiente">
                  <i className="fa-solid fa-forward-step" />
                </button>
                <button className="rx-icobtn" onClick={reiniciar} title="Reiniciar">
                  <i className="fa-solid fa-rotate-left" />
                </button>
              </div>
            )}

            {/* Pie: lectura en vivo */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                <i className={`fa-solid ${def.icono}`} style={{ color: modoCol, marginRight: 7 }} />
                {esComparar ? "Tres procesos redox" : escena.nombre} — <span style={{ color: "#cdd8ec" }}>{escena.medio}</span>
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
                <Eyebrow><i className="fa-solid fa-table-list" style={{ marginRight: 8, color: modoCol }} />Redox · Combustión · Pila</Eyebrow>
                <table className="rx-cmp">
                  <thead>
                    <tr><th>Rasgo</th><th style={{ color: "#34d399" }}>Redox</th><th style={{ color: "#fb923c" }}>Combustión</th><th style={{ color: "#38bdf8" }}>Pila</th></tr>
                  </thead>
                  <tbody>
                    {COMPARACION.map((f) => (
                      <tr key={f.rasgo}>
                        <td style={{ color: T.text2, fontWeight: 700 }}>{f.rasgo}</td>
                        <td style={{ color: "#fff" }}>{f.redox}</td>
                        <td style={{ color: "#fff" }}>{f.combustion}</td>
                        <td style={{ color: "#fff" }}>{f.pila}</td>
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
                <input type="range" min={0} max={total} value={idx} onChange={(e) => { setPlaying(false); setPaso(Number(e.target.value)); }} className="rx-range" style={{ ["--rxc" as string]: modoCol, marginBottom: 14 }} />
                <div className="rx-phases" style={{ marginBottom: 4 }}>
                  {nombresFase.map((nom, i) => {
                    const on = i === idx;
                    const visto = i < idx;
                    return (
                      <button
                        key={nom}
                        className="rx-phase"
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
            <Eyebrow><i className="fa-solid fa-calculator" style={{ marginRight: 8, color: accent }} />Calculadora — potencial de pila y energía de combustión</Eyebrow>

            {/* Pila */}
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.06em", color: "#38bdf8", margin: "8px 0 8px" }}>
              <i className="fa-solid fa-car-battery" style={{ marginRight: 7 }} />PILA GALVÁNICA — E°pila = E°cátodo − E°ánodo
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <span style={{ fontSize: 11, color: T.text3, fontWeight: 700 }}>Cátodo (se reduce)</span>
                <select className="rx-sel" value={catSimbolo} onChange={(e) => setCatSimbolo(e.target.value)} style={{ ["--rxc" as string]: accent }}>
                  {PARES_REDOX.map((p) => (
                    <option key={p.simbolo} value={p.simbolo}>{p.simbolo} — E°={p.eRed} V</option>
                  ))}
                </select>
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <span style={{ fontSize: 11, color: T.text3, fontWeight: 700 }}>Ánodo (se oxida)</span>
                <select className="rx-sel" value={anoSimbolo} onChange={(e) => setAnoSimbolo(e.target.value)} style={{ ["--rxc" as string]: accent }}>
                  {PARES_REDOX.map((p) => (
                    <option key={p.simbolo} value={p.simbolo}>{p.simbolo} — E°={p.eRed} V</option>
                  ))}
                </select>
              </label>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid #38bdf855", background: "rgba(56,189,248,0.08)" }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: "#38bdf8", marginBottom: 6 }}><i className="fa-solid fa-bolt" style={{ marginRight: 6 }} />POTENCIAL</div>
                <div style={{ fontSize: 12.5, color: "#fff", lineHeight: 1.6 }}>
                  E°pila = <strong>{fmtNum(celda.ePila)}</strong> V<br />
                  <span style={{ color: T.text3 }}>{celda.catodo.simbolo} vs {celda.anodo.simbolo}</span>
                </div>
              </div>
              <div style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid #a78bfa55", background: "rgba(167,139,250,0.08)" }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: "#a78bfa", marginBottom: 6 }}><i className="fa-solid fa-battery-full" style={{ marginRight: 6 }} />ENERGÍA</div>
                <div style={{ fontSize: 12.5, color: "#fff", lineHeight: 1.6 }}>
                  W = <strong>{fmtNum(wElec / 1000)}</strong> kJ<br />
                  <span style={{ color: T.text3 }}>= n·F·E° ({nElec} e⁻)</span>
                </div>
              </div>
            </div>
            {!espontaneaEnOrden && (
              <div style={{ marginTop: 10, padding: "9px 12px", borderRadius: 10, border: "1px solid #fbbf2444", background: "rgba(251,191,36,0.08)", fontSize: 11.5, color: "#fde68a", lineHeight: 1.45 }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 7 }} />
                Elegiste como cátodo el par de menor E°: la celda real invierte los electrodos para ser espontánea. El módulo ya toma {celda.catodo.simbolo} como cátodo (mayor E°).
              </div>
            )}

            {/* Combustión */}
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.06em", color: "#fb923c", margin: "16px 0 8px" }}>
              <i className="fa-solid fa-fire" style={{ marginRight: 7 }} />COMBUSTIÓN — energía liberada
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1, minWidth: 160 }}>
                <span style={{ fontSize: 11, color: T.text3, fontWeight: 700 }}>Combustible (ΔH)</span>
                <select className="rx-sel" value={combNombre} onChange={(e) => setCombNombre(e.target.value)} style={{ ["--rxc" as string]: accent }}>
                  {COMBUSTIBLES.map((c) => (
                    <option key={c.nombre} value={c.nombre}>{c.nombre} ({c.formula}) — ΔH={c.deltaH} kJ/mol</option>
                  ))}
                </select>
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <span style={{ fontSize: 11, color: T.text3, fontWeight: 700 }}>Moles</span>
                <input type="number" className="rx-num" min={0} max={100000} step={0.5} value={moles} onChange={(e) => setMoles(Number(e.target.value) || 0)} style={{ ["--rxc" as string]: accent, width: "100%" }} />
              </label>
            </div>
            <div style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid #fb923c55", background: "rgba(251,146,60,0.08)" }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: "#fb923c", marginBottom: 6 }}><i className="fa-solid fa-fire-flame-curved" style={{ marginRight: 6 }} />CALOR LIBERADO</div>
              <div style={{ fontSize: 12.5, color: "#fff", lineHeight: 1.6 }}>
                Q = <strong>{fmtNum(energiaQuema)}</strong> kJ <span style={{ color: T.text3 }}>(|ΔH|·n)</span><br />
                <span style={{ color: T.text3, fontFamily: "ui-monospace, monospace", fontSize: 11.5 }}>{comb.ecuacion}</span>
              </div>
            </div>

            <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: 11, border: `1px solid ${accent}44`, background: `rgba(${color.rgba},0.08)`, fontSize: 12, color: "#eaf0fb", lineHeight: 1.5 }}>
              <i className="fa-solid fa-circle-info" style={{ color: accent, marginRight: 8 }} />
              La pila Zn–Cu da +1.10 V porque el cobre (E° = +0.34) se reduce y el zinc (E° = −0.76) se oxida. Quemar {mol} mol de {comb.nombre.toLowerCase()} libera <strong>{fmtNum(energiaQuema)} kJ</strong>: en ambos casos hay transferencia de electrones, lo que sostiene a la industria y a la vida.
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Descripción del laboratorio */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}66`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-atom" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>El visor de las reacciones redox</div>
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
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="rx-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow><i className="fa-solid fa-magnifying-glass-chart" style={{ marginRight: 8, color: accent }} />Datos del redox y la combustión</Eyebrow>
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
            <Eyebrow><i className="fa-solid fa-location-dot" style={{ marginRight: 8, color: accent }} />México: energía, corrosión y baterías</Eyebrow>
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
          El potencial de la pila (E°pila = E°cátodo − E°ánodo), la energía eléctrica (W = n·F·E°) y el calor de combustión (Q = |ΔH|·n) que devuelve la calculadora son <strong>exactos</strong> para los potenciales estándar y las entalpías reales de cada especie. El modelo 3D es <strong>esquemático</strong> (no a escala): las esferas, los electrones y la llama representan el mecanismo de transferencia de electrones, no medidas físicas. Fuente: {FUENTE}
        </span>
      </div>
    </div>
  );
}

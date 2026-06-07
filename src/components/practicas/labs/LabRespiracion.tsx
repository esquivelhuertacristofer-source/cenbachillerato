"use client";

/**
 * Laboratorio 3D — "Respiración aerobia y anaerobia".
 * Práctica experimental anclada a CNEYT-IV·O8 (UAC "El poder de la química").
 * Recorre los procesos químicos de la respiración celular paso a paso y calcula
 * el balance de ATP, el O₂ consumido y el CO₂/H₂O producido por mol de glucosa,
 * con la estequiometría exacta del módulo de datos.
 *
 * Cuatro modos: glucólisis · respiración aerobia · fermentación · comparar.
 */

import { useState, useEffect, useMemo } from "react";
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
  RUTAS,
  rutaPorId,
  balanceVia,
  ventajaAerobia,
  DESGLOSE_AEROBIA,
  totalDesglose,
  fmtNum,
  fmtPorcentaje,
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
} from "./respiracion-data";

const RespiracionScene = dynamic(() => import("./RespiracionScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-arrows-rotate fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Cargando la respiración celular en 3D…</span>
    </div>
  ),
});

export function LabRespiracion({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("glucolisis");
  const [paso, setPaso] = useState<number>(0);
  const [playing, setPlaying] = useState<boolean>(true);
  const [resetNonce, setResetNonce] = useState(0);

  // calculadora de la actividad A2
  const [rutaId, setRutaId] = useState<string>("aerobia");
  const [molGlucosa, setMolGlucosa] = useState<number>(5);

  const bump = () => setResetNonce((n) => n + 1);

  const def = MODOS_DEF[modo];
  const modoCol = `#${def.color.replace("#", "")}`;
  const totalFases = numFases(modo);
  const total = Math.max(0, totalFases - 1);
  const idx = Math.min(paso, total);
  const escena = escenaPara(modo, idx);
  const esComparar = modo === "comparar";
  const nombresFase = esComparar ? [] : FASES[modo as Exclude<Modo, "comparar">];

  useEffect(() => {
    if (!playing || esComparar || total === 0) return;
    if (idx >= total) return;
    const t = setInterval(() => setPaso((p) => Math.min(total, p + 1)), 1700);
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

  // ── Calculadora A2: balance de ATP / O₂ / CO₂ ────────────────────────────
  const ruta = rutaPorId(rutaId);
  const bal = useMemo(() => balanceVia(ruta, molGlucosa), [ruta, molGlucosa]);
  const ventaja = ventajaAerobia();
  const totalAtp = totalDesglose();

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
    ? "Compara la respiración aerobia (con O₂, en la mitocondria, ~38 ATP) con la fermentación anaerobia (sin O₂, en el citoplasma, solo 2 ATP)."
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
              <RespiracionScene modo={modo} escena={escena} playing={playing} modoColor={modoCol} resetNonce={resetNonce} />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)" }}>
              <span className="eq-live-dot" style={{ ["--eqd" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{def.etq.toUpperCase()}</span>
            </div>

            {/* Toolbar (oculta en comparar) */}
            {!esComparar && (
              <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
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
              </div>
            )}

            {/* Pie: lectura en vivo */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                <i className={`fa-solid ${def.icono}`} style={{ color: modoCol, marginRight: 7 }} />
                {esComparar ? "Aerobia vs anaerobia" : escena.nombre} — <span style={{ color: "#cdd8ec" }}>{escena.medio}</span>
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
                <Eyebrow><i className="fa-solid fa-table-list" style={{ marginRight: 8, color: modoCol }} />Aerobia (con O₂) vs anaerobia (sin O₂)</Eyebrow>
                <table className="eq-cmp">
                  <thead>
                    <tr><th>Rasgo</th><th style={{ color: "#34d399" }}>Aerobia</th><th style={{ color: "#a78bfa" }}>Anaerobia</th></tr>
                  </thead>
                  <tbody>
                    {COMPARACION.map((f) => (
                      <tr key={f.rasgo}>
                        <td style={{ color: T.text2, fontWeight: 700 }}>{f.rasgo}</td>
                        <td style={{ color: "#fff" }}>{f.aerobia}</td>
                        <td style={{ color: "#fff" }}>{f.anaerobia}</td>
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
            <Eyebrow><i className="fa-solid fa-calculator" style={{ marginRight: 8, color: accent }} />Calculadora — balance de ATP, O₂ y CO₂</Eyebrow>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 110px", gap: 12, marginBottom: 14 }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <span style={{ fontSize: 11, color: T.text3, fontWeight: 700 }}>Vía metabólica</span>
                <select className="eq-sel" value={rutaId} onChange={(e) => setRutaId(e.target.value)} style={{ ["--eqc" as string]: accent }}>
                  {RUTAS.map((r) => (
                    <option key={r.id} value={r.id}>{r.nombre}</option>
                  ))}
                </select>
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <span style={{ fontSize: 11, color: T.text3, fontWeight: 700 }}>mol glucosa</span>
                <input
                  type="number"
                  className="eq-num"
                  min={0}
                  max={1000}
                  step={1}
                  value={molGlucosa}
                  onChange={(ev) => setMolGlucosa(Math.max(0, Number(ev.target.value) || 0))}
                  style={{ ["--eqc" as string]: accent }}
                />
              </label>
            </div>

            <div style={{ padding: "9px 12px", borderRadius: 10, border: `1px solid ${accent}44`, background: `rgba(${color.rgba},0.08)`, fontSize: 12, color: "#eaf0fb", lineHeight: 1.45, marginBottom: 14, fontFamily: "ui-monospace, monospace" }}>
              <i className="fa-solid fa-flask" style={{ marginRight: 7, color: accent }} />{ruta.ecuacion}
            </div>

            {/* Resultados */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid #fde04755", background: "rgba(253,224,71,0.08)" }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: "#fde047", marginBottom: 6 }}><i className="fa-solid fa-bolt" style={{ marginRight: 6 }} />ATP TOTAL</div>
                <div style={{ fontSize: 12.5, color: "#fff", lineHeight: 1.6 }}>
                  <strong>{fmtNum(bal.atp)} ATP</strong><br />
                  <span style={{ color: T.text3 }}>{ruta.atpPorGlucosa} por glucosa</span>
                </div>
              </div>
              <div style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid #38bdf855", background: "rgba(56,189,248,0.10)" }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: "#38bdf8", marginBottom: 6 }}><i className="fa-solid fa-wind" style={{ marginRight: 6 }} />O₂ Y CO₂</div>
                <div style={{ fontSize: 12.5, color: "#fff", lineHeight: 1.6 }}>
                  O₂: <strong>{fmtNum(bal.o2)} mol</strong><br />
                  CO₂: <strong>{fmtNum(bal.co2)} mol</strong>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ padding: "10px 13px", borderRadius: 10, border: `1px solid ${accent}44`, background: `rgba(${color.rgba},0.07)` }}>
                <div style={{ fontSize: 10.5, fontWeight: 900, color: accent, marginBottom: 4 }}><i className="fa-solid fa-droplet" style={{ marginRight: 6 }} />H₂O</div>
                <div style={{ fontSize: 12, color: "#fff", fontWeight: 800 }}>{fmtNum(bal.h2o)} mol</div>
              </div>
              <div style={{ padding: "10px 13px", borderRadius: 10, border: "1px solid #34d39944", background: "rgba(52,211,153,0.08)" }}>
                <div style={{ fontSize: 10.5, fontWeight: 900, color: "#34d399", marginBottom: 4 }}><i className="fa-solid fa-gauge-high" style={{ marginRight: 6 }} />EFICIENCIA</div>
                <div style={{ fontSize: 12, color: "#fff", fontWeight: 800 }}>{fmtPorcentaje(bal.eficiencia)}</div>
              </div>
            </div>

            <div style={{ marginTop: 10, padding: "9px 12px", borderRadius: 10, border: `1px solid ${accent}44`, background: `rgba(${color.rgba},0.08)`, fontSize: 11.5, color: "#eaf0fb", lineHeight: 1.45 }}>
              <i className="fa-solid fa-circle-info" style={{ marginRight: 7, color: accent }} />
              {ruta.aerobica
                ? `La aerobia captura ~${fmtNum(bal.energiaKJ)} kJ como ATP de los ${fmtNum(molGlucosa * 2870)} kJ disponibles en la glucosa. Rinde ${fmtNum(ventaja)}× más ATP que la fermentación.`
                : `La fermentación solo aprovecha los 2 ATP de la glucólisis: ${fmtNum(ventaja)} veces menos que la respiración aerobia. ${ruta.contexto}`}
            </div>

            {/* Desglose del rendimiento aerobio */}
            {ruta.aerobica && (
              <>
                <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.06em", color: "#34d399", margin: "16px 0 8px" }}>
                  <i className="fa-solid fa-layer-group" style={{ marginRight: 7 }} />DE DÓNDE SALEN LOS {totalAtp} ATP (por glucosa)
                </div>
                <table className="eq-cmp">
                  <thead>
                    <tr><th>Etapa</th><th>Fuente</th><th style={{ textAlign: "right" }}>ATP</th></tr>
                  </thead>
                  <tbody>
                    {DESGLOSE_AEROBIA.map((f, i) => (
                      <tr key={i}>
                        <td style={{ color: T.text2, fontWeight: 700 }}>{f.etapa}</td>
                        <td style={{ color: "#cdd8ec" }}>{f.fuente}</td>
                        <td style={{ color: "#fde047", fontWeight: 900, textAlign: "right", fontFamily: "ui-monospace, monospace" }}>{f.atp}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={2} style={{ color: "#fff", fontWeight: 900 }}>Total</td>
                      <td style={{ color: "#34d399", fontWeight: 900, textAlign: "right", fontFamily: "ui-monospace, monospace" }}>{totalAtp}</td>
                    </tr>
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Descripción del laboratorio */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}66`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-lungs" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>El visor de la respiración celular</div>
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
          <Eyebrow><i className="fa-solid fa-magnifying-glass-chart" style={{ marginRight: 8, color: accent }} />Datos de la respiración celular</Eyebrow>
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
            <Eyebrow><i className="fa-solid fa-location-dot" style={{ marginRight: 8, color: accent }} />México: tequila, pan, yogur y biogás</Eyebrow>
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
          El balance de ATP, el O₂ consumido, el CO₂/H₂O producido y la eficiencia energética que devuelve la calculadora usan la <strong>estequiometría estándar</strong> y el <strong>rendimiento teórico máximo</strong> (38 ATP/glucosa). Las estimaciones modernas, contando el costo de transportar protones, lo sitúan en <strong>~30–32 ATP</strong>. El modelo 3D es <strong>esquemático</strong> (no a escala): las esferas, la mitocondria, la cadena de complejos y las monedas de ATP representan el mecanismo, no medidas físicas. Fuente: {FUENTE}
        </span>
      </div>
    </div>
  );
}

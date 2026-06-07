"use client";

/**
 * Laboratorio 3D — "División celular: mitosis y meiosis".
 * Práctica experimental anclada a CNEYT-VI-P09-A2 (ejercicio "Analizando la
 * división celular"; propósito formativo O5, UAC CNEYT-VI). El laboratorio
 * recorre fase por fase cada proceso y deja calcular células hijas, ploidía y
 * combinaciones genéticas con la matemática exacta del módulo de datos.
 *
 * Tres modos:
 *  (1) mitosis  — 1 célula → 2 idénticas (2n): crecer, reparar, regenerar.
 *  (2) meiosis  — 1 célula → 4 diversas (n): gametos y variabilidad genética.
 *  (3) comparar — vista estática lado a lado de ambos resultados + tabla.
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
  calcularDivision,
  celulasTrasMitosis,
  fmtEntero,
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
} from "./division-celular-data";

const DivisionCelularScene = dynamic(() => import("./DivisionCelularScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-dna fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Cargando la división celular en 3D…</span>
    </div>
  ),
});

export function LabDivisionCelular({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>("mitosis");
  const [paso, setPaso] = useState<number>(0);
  const [playing, setPlaying] = useState<boolean>(true);
  const [resetNonce, setResetNonce] = useState(0);
  // calculadora de la actividad A2
  const [cel2n, setCel2n] = useState<number>(46);

  const bump = () => setResetNonce((n) => n + 1);

  const def = MODOS_DEF[modo];
  const modoCol = `#${def.color.replace("#", "")}`;
  const totalFases = numFases(modo);
  const total = Math.max(0, totalFases - 1); // máximo del slider (índice de fase)
  const idx = Math.min(paso, total);
  const escena = escenaPara(modo, idx);
  const esComparar = modo === "comparar";
  const nombresFase = modo === "comparar" ? [] : FASES[modo];

  // avance automático de fases (más lento que el de bases: cada fase es densa)
  useEffect(() => {
    if (!playing || esComparar || total === 0) return;
    if (idx >= total) return;
    const t = setInterval(() => setPaso((p) => Math.min(total, p + 1)), 1500);
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
  const cel2nSafe = Math.max(2, Math.min(200, cel2n % 2 === 0 ? cel2n : cel2n + 1));
  const rMit = calcularDivision("mitosis", cel2nSafe);
  const rMei = calcularDivision("meiosis", cel2nSafe);

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

  // pie del visor
  const pie: string = esComparar
    ? "Compara los resultados: la mitosis conserva la ploidía (2 células 2n idénticas); la meiosis la reduce a la mitad (4 células n distintas)."
    : `Fase ${idx + 1}/${totalFases} — ${escena.nombre}. ${escena.desc}`;

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes dcPulse { 0%,100%{ box-shadow:0 0 0 0 var(--dcd); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .dc-live-dot { animation: dcPulse 1.6s ease-in-out infinite; }
        .dc-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(310px,28vw,410px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .dc-grid { grid-template-columns: 1fr; } }
        .dc-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .dc-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .dc-icobtn:hover { background:rgba(255,255,255,0.12); }
        .dc-tabs { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; }
        .dc-tab { cursor:pointer; border:1px solid var(--dcc); border-radius:12px; padding:11px 8px; text-align:center;
          background:transparent; transition:all .15s; color:#fff; }
        .dc-tab[data-on="false"] { border-color:rgba(255,255,255,0.12); color:rgba(255,255,255,0.62); }
        .dc-tab:hover { background:rgba(255,255,255,0.06); }
        .dc-phases { display:flex; flex-wrap:wrap; gap:6px; }
        .dc-phase { cursor:pointer; padding:6px 10px; border-radius:9px; border:1px solid; font-size:11px; font-weight:800; transition:all .12s; }
        .dc-range { width:100%; accent-color: var(--dcc); cursor:pointer; }
        .dc-num { width:84px; box-sizing:border-box; font-family:ui-monospace,monospace; font-size:15px; font-weight:800;
          color:#fff; background:rgba(4,10,22,0.55); border:1px solid var(--dcc); border-radius:9px; padding:8px 10px; outline:none; text-align:center; }
        .dc-cmp { width:100%; border-collapse:collapse; }
        .dc-cmp td, .dc-cmp th { padding:8px 10px; font-size:11.5px; border-bottom:1px solid ${T.line}; vertical-align:top; text-align:left; }
        .dc-cmp th { font-size:9.5px; letter-spacing:0.08em; text-transform:uppercase; color:${T.text3}; }
        @media (max-width: 1000px){ .dc-bottom { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* Selector de modo */}
      <div style={{ ...card, padding: "14px 16px", marginBottom: 18 }}>
        <div className="dc-tabs">
          {MODOS.map((m) => {
            const d = MODOS_DEF[m];
            const col = `#${d.color.replace("#", "")}`;
            const on = m === modo;
            return (
              <button key={m} className="dc-tab" data-on={on} onClick={() => cambiarModo(m)} style={{ ["--dcc" as string]: col, background: on ? `${col}1f` : "transparent" }}>
                <div style={{ fontSize: 18, marginBottom: 4, color: on ? col : "inherit" }}><i className={`fa-solid ${d.icono}`} /></div>
                <div style={{ fontSize: 12.5, fontWeight: 900 }}>{d.etq}</div>
                <div style={{ fontSize: 10, color: T.text3, marginTop: 3, lineHeight: 1.25 }}>{d.subtitulo}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="dc-grid">
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
              <DivisionCelularScene modo={modo} escena={escena} playing={playing} modoColor={modoCol} resetNonce={resetNonce} />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${modoCol}66`, backdropFilter: "blur(10px)" }}>
              <span className="dc-live-dot" style={{ ["--dcd" as string]: `${modoCol}aa`, width: 9, height: 9, borderRadius: "50%", background: modoCol }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{def.etq.toUpperCase()}</span>
            </div>

            {/* Toolbar (oculta en comparar) */}
            {!esComparar && (
              <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
                <button className="dc-icobtn" onClick={() => { setPlaying(false); setPaso((p) => Math.max(0, p - 1)); }} title="Fase anterior">
                  <i className="fa-solid fa-backward-step" />
                </button>
                <button className="dc-icobtn" data-on={playing} onClick={() => setPlaying((p) => !p)} title={playing ? "Pausar" : "Reanudar"}>
                  <i className={`fa-solid ${playing ? "fa-pause" : "fa-play"}`} />
                </button>
                <button className="dc-icobtn" onClick={() => { setPlaying(false); setPaso((p) => Math.min(total, p + 1)); }} title="Fase siguiente">
                  <i className="fa-solid fa-forward-step" />
                </button>
                <button className="dc-icobtn" onClick={reiniciar} title="Reiniciar">
                  <i className="fa-solid fa-rotate-left" />
                </button>
              </div>
            )}

            {/* Pie: lectura en vivo */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                <i className={`fa-solid ${def.icono}`} style={{ color: modoCol, marginRight: 7 }} />
                {esComparar ? "Mitosis vs. Meiosis" : escena.nombre} — <span style={{ color: "#cdd8ec" }}>{escena.ploidia}</span>
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
                <Eyebrow><i className="fa-solid fa-table-list" style={{ marginRight: 8, color: modoCol }} />Mitosis vs. Meiosis</Eyebrow>
                <table className="dc-cmp">
                  <thead>
                    <tr><th>Rasgo</th><th style={{ color: "#34d399" }}>Mitosis</th><th style={{ color: "#a78bfa" }}>Meiosis</th></tr>
                  </thead>
                  <tbody>
                    {COMPARACION.map((f) => (
                      <tr key={f.rasgo}>
                        <td style={{ color: T.text2, fontWeight: 700 }}>{f.rasgo}</td>
                        <td style={{ color: "#fff" }}>{f.mitosis}</td>
                        <td style={{ color: "#fff" }}>{f.meiosis}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <>
                {/* fases */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                  <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.1em", color: T.text3 }}>FASE</span>
                  <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{idx + 1} / {totalFases}</span>
                </div>
                <input type="range" min={0} max={total} value={idx} onChange={(e) => { setPlaying(false); setPaso(Number(e.target.value)); }} className="dc-range" style={{ ["--dcc" as string]: modoCol, marginBottom: 14 }} />
                <div className="dc-phases" style={{ marginBottom: 4 }}>
                  {nombresFase.map((nom, i) => {
                    const on = i === idx;
                    const visto = i < idx;
                    return (
                      <button
                        key={nom}
                        className="dc-phase"
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
            <Eyebrow><i className="fa-solid fa-calculator" style={{ marginRight: 8, color: accent }} />Calculadora — divide una célula 2n</Eyebrow>
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "10px 0 16px", flexWrap: "wrap" }}>
              <span style={{ fontSize: 12.5, color: T.text2 }}>Cromosomas de la célula madre (2n):</span>
              <input type="number" className="dc-num" min={2} max={200} step={2} value={cel2n} onChange={(e) => setCel2n(Number(e.target.value) || 2)} style={{ ["--dcc" as string]: accent }} />
              <span style={{ fontSize: 11.5, color: T.text3 }}>n = {cel2nSafe / 2}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid #34d39955", background: "rgba(52,211,153,0.08)" }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: "#34d399", marginBottom: 6 }}><i className="fa-solid fa-clone" style={{ marginRight: 6 }} />MITOSIS</div>
                <div style={{ fontSize: 12.5, color: "#fff", lineHeight: 1.6 }}>
                  <strong>{rMit.celulasHijas}</strong> células hijas<br />
                  <strong>{rMit.cromosomasPorHija}</strong> cromosomas c/u (2n)<br />
                  <span style={{ color: T.text3 }}>idénticas a la madre</span>
                </div>
              </div>
              <div style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid #a78bfa55", background: "rgba(167,139,250,0.08)" }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: "#a78bfa", marginBottom: 6 }}><i className="fa-solid fa-shuffle" style={{ marginRight: 6 }} />MEIOSIS</div>
                <div style={{ fontSize: 12.5, color: "#fff", lineHeight: 1.6 }}>
                  <strong>{rMei.celulasHijas}</strong> células hijas<br />
                  <strong>{rMei.cromosomasPorHija}</strong> cromosomas c/u (n)<br />
                  <span style={{ color: T.text3 }}>{fmtEntero(rMei.combinaciones)} combinaciones (2ⁿ)</span>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: 11, border: `1px solid ${accent}44`, background: `rgba(${color.rgba},0.08)`, fontSize: 12, color: "#eaf0fb", lineHeight: 1.5 }}>
              <i className="fa-solid fa-circle-info" style={{ color: accent, marginRight: 8 }} />
              Tras <strong>3 rondas de mitosis</strong> a partir de una sola célula tendrías <strong>{celulasTrasMitosis(3)} células</strong> (2³). La meiosis, en cambio, baja la ploidía: por eso al unirse dos gametos (n + n) se restaura el 2n de la especie.
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Descripción del laboratorio */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}66`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-dna" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>El visor de la división celular</div>
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
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="dc-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow><i className="fa-solid fa-magnifying-glass-chart" style={{ marginRight: 8, color: accent }} />Datos de la división celular</Eyebrow>
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
            <Eyebrow><i className="fa-solid fa-location-dot" style={{ marginRight: 8, color: accent }} />México: salud y biodiversidad</Eyebrow>
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
          Los conteos de células hijas, la ploidía resultante (2n→2n en mitosis, 2n→n en meiosis), la separación reduccional de homólogos en Anafase I, la separación de cromátidas hermanas en Anafase II y las combinaciones por distribución independiente (2ⁿ) son <strong>exactos</strong>: la calculadora los obtiene para cualquier 2n que escribas. El modelo 3D usa <strong>2n = 4</strong> (dos pares de homólogos) y es <strong>esquemático</strong> (no a escala): representa el mecanismo del reparto de cromosomas, no estructuras medidas. Fuente: {FUENTE}
        </span>
      </div>
    </div>
  );
}

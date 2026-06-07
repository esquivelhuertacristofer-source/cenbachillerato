"use client";

/**
 * Laboratorio 3D — Razón y proporción.
 * Práctica experimental para PM-I-P05-A2.
 *
 * El estudiante elige un escenario de la vida real y mueve un deslizador (la
 * cantidad X). En la gráfica 3D ve cómo responde Y y, sobre todo, QUÉ permanece
 * constante:
 *   · DIRECTA  →  la razón  Y / X = k  (recta por el origen). Si X sube, Y sube.
 *   · INVERSA  →  el producto X · Y = k (hipérbola). Si X sube, Y baja.
 * El lector del INVARIANTE no se mueve aunque el deslizador sí: ese es el "ajá".
 * Pensamiento Matemático I.
 */

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { ESCENARIOS, valorY, invariante, yMaxGlobal, type Escenario } from "./proporcion-data";

const ProporcionScene = dynamic(() => import("./ProporcionScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-chart-line fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const K_COL = "#FFD166"; // color del invariante

const fmt = (n: number) =>
  Number.isInteger(n) ? n.toLocaleString("es-MX") : n.toLocaleString("es-MX", { maximumFractionDigits: 2 });

export function LabProporcion({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [escKey, setEscKey] = useState(ESCENARIOS[0]!.key);
  const esc = useMemo<Escenario>(() => ESCENARIOS.find((e) => e.key === escKey) ?? ESCENARIOS[0]!, [escKey]);

  const [x, setX] = useState(ESCENARIOS[0]!.xDefault);
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetNonce, setResetNonce] = useState(0);

  // seguimiento de objetivos
  const [movioDeslizador, setMovioDeslizador] = useState(false);
  const [tiposVistos, setTiposVistos] = useState<Set<string>>(() => new Set<string>([ESCENARIOS[0]!.tipo]));

  const elegirEscenario = (e: Escenario) => {
    setEscKey(e.key);
    setX(e.xDefault);
    setTiposVistos((prev) => {
      if (prev.has(e.tipo)) return prev;
      const next = new Set(prev);
      next.add(e.tipo);
      return next;
    });
  };

  const moverX = (v: number) => {
    setX(v);
    setMovioDeslizador(true);
  };

  const reset = () => {
    setX(esc.xDefault);
    setResetNonce((n) => n + 1);
  };

  const y = useMemo(() => valorY(esc, x), [esc, x]);
  const inv = useMemo(() => invariante(esc, x), [esc, x]);
  const yMax = useMemo(() => yMaxGlobal(esc), [esc]);

  const esDirecta = esc.tipo === "directa";
  const invSimbolo = esDirecta ? `${esc.yNombre} ÷ ${esc.xNombre}` : `${esc.xNombre} × ${esc.yNombre}`;

  const objetivos = [
    { txt: "Mueve el deslizador y observa la gráfica", done: movioDeslizador },
    { txt: "Explora una proporción directa (recta)", done: tiposVistos.has("directa") },
    { txt: "Explora una proporción inversa (hipérbola)", done: tiposVistos.has("inversa") },
    { txt: "Comprueba que el invariante no cambia", done: movioDeslizador && tiposVistos.size >= 2 },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${esc.icono}`} />
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, color: T.text, ...NUM }}>
        {esc.xNombre} {fmt(x)}{esc.xUnidad ? ` ${esc.xUnidad}` : ""} → {esc.yNombre} {fmt(y)}{esc.yUnidad ? ` ${esc.yUnidad}` : ""}
      </div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: {esDirecta ? "la razón" : "el producto"} {invSimbolo} se mantiene en <strong>{fmt(inv)}</strong> — esa es la constante de proporcionalidad.
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
        .ex-esc { cursor:pointer; text-align:left; border-radius:12px; border:1px solid ${T.line}; background:${T.glass}; color:${T.text2};
          padding:11px 13px; transition:all .14s ease; display:flex; align-items:center; gap:11px; width:100%; }
        .ex-esc:hover { border-color:${T.lineStrong}; background:${T.glassSoft}; color:#fff; }
        .ex-esc[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .ex-slider { -webkit-appearance:none; appearance:none; width:100%; height:7px; border-radius:999px; background:${T.lineStrong}; outline:none; cursor:pointer; }
        .ex-slider::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:21px; height:21px; border-radius:50%; background:#fff; border:3px solid ${accent}; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
        .ex-slider::-moz-range-thumb { width:21px; height:21px; border-radius:50%; background:#fff; border:3px solid ${accent}; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
        @media (max-width: 1000px){ .ex-bottom { grid-template-columns: 1fr !important; } }
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
              <ProporcionScene tipo={esc.tipo} x={x} y={y} k={esc.k} xMin={esc.xMin} xMax={esc.xMax} yMax={yMax} accent={accent} autoRotate={autoRotate} resetNonce={resetNonce} />
            </SceneBoundary>

            {/* Cinta EN VIVO con el invariante */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13.5, fontWeight: 900, color: K_COL, ...NUM }}>
                {invSimbolo} = {fmt(inv)}
              </span>
            </div>

            {/* Etiqueta inferior */}
            <div style={{ position: "absolute", bottom: 16, left: 18, fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", pointerEvents: "none" }}>
              <i className={`fa-solid ${esc.icono}`} style={{ marginRight: 7, color: accent }} />
              {esDirecta ? "Proporción directa · recta por el origen" : "Proporción inversa · hipérbola"}
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(2,12,28,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((v) => !v)} title="Girar automáticamente">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="ex-icobtn" onClick={reset} title="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>
          </div>

          {/* El deslizador y la lectura X → Y */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className={`fa-solid ${esc.icono}`} style={{ marginRight: 8, color: accent }} />
              {esc.titulo}
            </Eyebrow>
            <div style={{ fontSize: 13.5, color: T.text2, lineHeight: 1.5, marginBottom: 16 }}>
              {esc.contexto}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 9 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>
                {esc.xNombre}
              </span>
              <span style={{ fontSize: 18, fontWeight: 900, color: accent, ...NUM }}>
                {fmt(x)}{esc.xUnidad ? ` ${esc.xUnidad}` : ""}
              </span>
            </div>
            <input
              className="ex-slider"
              type="range"
              min={esc.xMin}
              max={esc.xMax}
              step={esc.xStep}
              value={x}
              onChange={(e) => moverX(Number(e.target.value))}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: T.text3, ...NUM }}>
              <span>{fmt(esc.xMin)}</span>
              <span>{fmt(esc.xMax)}</span>
            </div>

            <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}`, marginTop: 16 }}>
              <Readout label={esc.xNombre} value={fmt(x)} unit={esc.xUnidad || undefined} col={accent} />
              <div style={{ width: 1, background: T.line }} />
              <Readout label={esc.yNombre} value={fmt(y)} unit={esc.yUnidad || undefined} />
              <div style={{ width: 1, background: T.line }} />
              <Readout label={esDirecta ? "Razón (constante)" : "Producto (constante)"} value={fmt(inv)} col={K_COL} />
            </div>
          </div>

          {/* Qué permanece constante */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>El corazón de la proporción</Eyebrow>
            <div style={{ fontSize: 13.5, color: T.text2, lineHeight: 1.55 }}>
              {esDirecta ? (
                <>
                  Es proporción <strong style={{ color: accent }}>directa</strong>: {esc.porque} Por eso la gráfica es una <strong style={{ color: T.text }}>recta que sale del origen</strong> y la razón{" "}
                  <strong style={{ color: K_COL, ...NUM }}>{esc.yNombre} ÷ {esc.xNombre}</strong> se queda fija en <strong style={{ color: K_COL, ...NUM }}>{fmt(esc.k)}</strong> ({esc.kNombre}).
                </>
              ) : (
                <>
                  Es proporción <strong style={{ color: accent }}>inversa</strong>: {esc.porque} Por eso la gráfica es una <strong style={{ color: T.text }}>hipérbola</strong> y el producto{" "}
                  <strong style={{ color: K_COL, ...NUM }}>{esc.xNombre} × {esc.yNombre}</strong> se queda fijo en <strong style={{ color: K_COL, ...NUM }}>{fmt(esc.k)}</strong> ({esc.kNombre}).
                </>
              )}
            </div>
            <div style={{ marginTop: 16, borderRadius: 13, border: `1px solid ${K_COL}55`, background: `${K_COL}14`, padding: "13px 16px", display: "flex", gap: 12, alignItems: "center" }}>
              <i className={`fa-solid ${esDirecta ? "fa-divide" : "fa-xmark"}`} style={{ color: K_COL, fontSize: 18 }} />
              <div style={{ fontSize: 15, fontWeight: 800, color: T.text, ...NUM }}>
                {esDirecta
                  ? `${fmt(y)} ÷ ${fmt(x)} = ${fmt(inv)}`
                  : `${fmt(x)} × ${fmt(y)} = ${fmt(inv)}`}
                <span style={{ fontSize: 12.5, fontWeight: 600, color: T.text2, marginLeft: 10 }}>
                  (mueve el deslizador: este número no cambia)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Columna controles ──────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          <Eyebrow>Directa · si una sube, la otra sube</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ESCENARIOS.filter((e) => e.tipo === "directa").map((e) => (
              <button key={e.key} className="ex-esc" data-on={e.key === escKey} onClick={() => elegirEscenario(e)}>
                <i className={`fa-solid ${e.icono}`} style={{ fontSize: 16, width: 20, textAlign: "center", color: e.key === escKey ? accent : T.text3 }} />
                <span style={{ fontSize: 13.5, fontWeight: 700 }}>{e.titulo}</span>
              </button>
            ))}
          </div>

          <div className="ex-divider" />

          <Eyebrow>Inversa · si una sube, la otra baja</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ESCENARIOS.filter((e) => e.tipo === "inversa").map((e) => (
              <button key={e.key} className="ex-esc" data-on={e.key === escKey} onClick={() => elegirEscenario(e)}>
                <i className={`fa-solid ${e.icono}`} style={{ fontSize: 16, width: 20, textAlign: "center", color: e.key === escKey ? accent : T.text3 }} />
                <span style={{ fontSize: 13.5, fontWeight: 700 }}>{e.titulo}</span>
              </button>
            ))}
          </div>

          <div className="ex-divider" />

          <Eyebrow>Marcador</Eyebrow>
          <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}` }}>
            <Readout label="Tipo" value={esDirecta ? "Directa" : "Inversa"} col={accent} size={15} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label={esc.kNombre} value={fmt(esc.k)} col={K_COL} />
          </div>

          <div style={{ marginTop: 14, fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
            <i className="fa-solid fa-circle-info" style={{ marginRight: 7, color: accent }} />
            No siempre que una cantidad sube la otra sube. En la <strong style={{ color: T.text }}>inversa</strong> sucede lo contrario, y aun así algo se conserva.
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
            Una <strong style={{ color: T.text }}>proporción</strong> dice que dos razones son iguales. Lo importante no es solo si Y sube o baja, sino{" "}
            <strong style={{ color: K_COL }}>qué se mantiene constante</strong>: la razón <strong style={{ color: T.text, ...NUM }}>Y/X</strong> en la directa, el producto{" "}
            <strong style={{ color: T.text, ...NUM }}>X·Y</strong> en la inversa.
          </span>
        </div>
      </div>
    </div>
  );
}

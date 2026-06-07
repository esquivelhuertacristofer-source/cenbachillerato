"use client";

/**
 * Laboratorio 3D — Continuidad: las 3 condiciones, los tipos de discontinuidad
 * y el Teorema del Valor Intermedio.
 * Práctica experimental para PM-V-P02-A2 (ejercicio_matematico "Analizando
 * discontinuidades: evitable, salto y esencial"; progresión 2, UAC PM-V).
 *
 * Dos modos:
 *  · CONTINUIDAD — el alumno elige una función (evitable / salto / esencial /
 *    continua), mueve el punto x y un semáforo evalúa las 3 condiciones en x = a.
 *    Caso ancla verbatim: f(x) = (x²−4)/(x−2), evitable en x = 2 (lim = 4,
 *    reparable con F(2) = 4).
 *  · TVI — g(x) = x³ − x − 1 en [1,2]; g(1) = −1 < 0 < 5 = g(2), así que existe
 *    c ∈ (1,2) con g(c) = N (verbatim A2 parte d).
 */

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import {
  FUNCIONES, func, evalFunc, condiciones, conUnidad, valOInf,
  TVI, bisectN,
  IDEAS, DATOS, fmt0, fmt1, fmt2,
  MODO_DEF, FUNC_DEF, type Modo, type FuncId,
} from "./continuidad-data";

const ContinuidadScene = dynamic(() => import("./ContinuidadScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-traffic-light fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Dibujando el plano…</span>
    </div>
  ),
});

const X_COL = "#fbbf24";
const OK_COL = "#34D399";
const HOLE_COL = "#f87171";

export function LabContinuidad({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<Modo>(MODO_DEF);
  const [funcId, setFuncId] = useState<FuncId>(FUNC_DEF);
  const [xPos, setXPos] = useState<number>(func(FUNC_DEF).xDef);
  const [nObj, setNObj] = useState<number>(0); // valor objetivo N del TVI (raíz)
  const [playing, setPlaying] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  const f = useMemo(() => func(funcId), [funcId]);
  const conds = useMemo(() => condiciones(funcId), [funcId]);

  // Modo continuidad: barrido de x que se acerca a `a` (efecto acercamiento).
  useEffect(() => {
    if (!playing || modo !== "continuidad") return;
    let raf = 0;
    let last = 0;
    let dir = -1; // empieza acercándose desde la izquierda
    const tick = (ts: number) => {
      if (last === 0) last = ts;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      setXPos((prev) => {
        let next = prev + dir * dt * (f.domMax - f.domMin) * 0.28;
        if (next >= f.domMax) { next = f.domMax; dir = -1; }
        else if (next <= f.domMin) { next = f.domMin; dir = 1; }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, modo, f.domMin, f.domMax]);

  // Modo TVI: barrido del valor objetivo N entre g(1) y g(2).
  useEffect(() => {
    if (!playing || modo !== "tvi") return;
    let raf = 0;
    let last = 0;
    let dir = 1;
    const tick = (ts: number) => {
      if (last === 0) last = ts;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      setNObj((prev) => {
        let next = prev + dir * dt * (TVI.gb - TVI.ga) * 0.3;
        if (next >= TVI.gb) { next = TVI.gb; dir = -1; }
        else if (next <= TVI.ga) { next = TVI.ga; dir = 1; }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, modo]);

  const bump = () => setResetNonce((n) => n + 1);
  const elegirModo = (m: Modo) => {
    setPlaying(false);
    setModo(m);
    bump();
  };
  const elegirFunc = (id: FuncId) => {
    setPlaying(false);
    setFuncId(id);
    setXPos(func(id).xDef);
    bump();
  };
  const reset = () => {
    setPlaying(false);
    setModo(MODO_DEF);
    setFuncId(FUNC_DEF);
    setXPos(func(FUNC_DEF).xDef);
    setNObj(0);
    bump();
  };

  // valores en vivo (modo continuidad)
  const yVal = evalFunc(funcId, xPos);
  // valores en vivo (modo TVI)
  const cTvi = bisectN(nObj);

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-traffic-light" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>
        {modo === "tvi" ? "Teorema del Valor Intermedio" : f.titulo}
      </div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        {modo === "tvi"
          ? "Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: g es continua en [1,2], g(1)=−1 y g(2)=5, así que existe c∈(1,2) con g(c)=0."
          : `Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: ${f.tipoLabel}. ${f.contexto}`}
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes exPulseCont { 0%,100%{ box-shadow:0 0 0 0 var(--exc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ex-live-dot { animation: exPulseCont 1.6s ease-in-out infinite; }
        .ex-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .ex-grid { grid-template-columns: 1fr; } }
        .ex-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .ex-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .ex-icobtn:hover { background:rgba(255,255,255,0.12); }
        .ex-range { -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:999px; outline:none;
          background:linear-gradient(90deg, var(--exc) 0%, var(--exc) var(--exfill), rgba(255,255,255,0.12) var(--exfill), rgba(255,255,255,0.12) 100%); }
        .ex-range::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:20px; height:20px; border-radius:50%;
          background:#fff; border:3px solid var(--exc); cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
        .ex-range::-moz-range-thumb { width:20px; height:20px; border-radius:50%; background:#fff; border:3px solid var(--exc); cursor:pointer; }
        .ex-chip { cursor:pointer; padding:8px 12px; border-radius:12px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; font-size:12px; font-weight:800; transition:all .15s; text-align:left; display:flex; align-items:center; gap:7px; }
        .ex-chip:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .ex-chip[data-on="true"] { border-color:rgba(${color.rgba},0.7); background:rgba(${color.rgba},0.18); color:#fff; }
        .ex-seg { cursor:pointer; flex:1; padding:9px 12px; border-radius:10px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; font-size:12.5px; font-weight:800; transition:all .15s; display:flex; align-items:center; justify-content:center; gap:7px; }
        .ex-seg[data-on="true"] { border-color:rgba(${color.rgba},0.7); background:rgba(${color.rgba},0.2); color:#fff; }
        @media (max-width: 1000px){ .ex-bottom { grid-template-columns: 1fr !important; } }
      `}</style>

      <div className="ex-grid">
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
              <ContinuidadScene modo={modo} funcId={funcId} xPos={xPos} nObj={nObj} accent={accent} resetNonce={resetNonce} />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>
                {modo === "tvi" ? "g(x) = x³ − x − 1" : f.expr}
              </span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={playing} onClick={() => setPlaying((p) => !p)} title={playing ? "Pausar" : "Animar"}>
                <i className={`fa-solid ${playing ? "fa-pause" : "fa-play"}`} />
              </button>
              <button className="ex-icobtn" onClick={reset} title="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Pie: lectura en vivo */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              {modo === "continuidad" ? (
                <>
                  <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                    <i className="fa-solid fa-location-crosshairs" style={{ color: X_COL, marginRight: 7 }} />
                    x = <strong style={{ color: X_COL }}>{fmt2(xPos)}</strong>
                    &nbsp;&nbsp;→&nbsp;&nbsp;
                    f(x) = <strong style={{ color: Number.isFinite(yVal) ? OK_COL : HOLE_COL }}>{Number.isFinite(yVal) ? fmt2(yVal) : "no definida"}</strong>
                  </div>
                  <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>
                    {f.continua
                      ? `En x = ${fmt0(f.a)} se cumplen las tres condiciones: f es continua ahí.`
                      : `En x = ${fmt0(f.a)} falla la continuidad → ${f.tipoLabel}.`}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                    <i className="fa-solid fa-arrows-up-down" style={{ color: X_COL, marginRight: 7 }} />
                    N = <strong style={{ color: Math.abs(nObj) < 1e-9 ? OK_COL : X_COL }}>{fmt2(nObj)}</strong>
                    &nbsp;&nbsp;→&nbsp;&nbsp;
                    existe c = <strong style={{ color: OK_COL }}>{fmt2(cTvi)}</strong> con g(c) = N
                  </div>
                  <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>
                    {Math.abs(nObj) < 1e-9
                      ? `N = 0: el punto c ≈ ${fmt2(cTvi)} es la raíz de g en (1,2).`
                      : `Como g es continua y N está entre g(1) = −1 y g(2) = 5, siempre hay un c en (1,2).`}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Controles */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            {/* selector de modo */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <button className="ex-seg" data-on={modo === "continuidad"} onClick={() => elegirModo("continuidad")}>
                <i className="fa-solid fa-traffic-light" /> Continuidad (3 condiciones)
              </button>
              <button className="ex-seg" data-on={modo === "tvi"} onClick={() => elegirModo("tvi")}>
                <i className="fa-solid fa-arrow-down-up-across-line" /> Valor Intermedio (TVI)
              </button>
            </div>

            {modo === "continuidad" ? (
              <>
                <Eyebrow>
                  <i className="fa-solid fa-location-crosshairs" style={{ marginRight: 8, color: accent }} />
                  Mueve x y observa f(x) acercarse al punto de análisis
                </Eyebrow>
                <Deslizador
                  label="posición de x"
                  icon="fa-location-crosshairs"
                  colr={X_COL}
                  valor={fmt2(xPos)}
                  min={f.domMin} max={f.domMax} step={f.xStep} value={xPos}
                  onChange={(v) => { setPlaying(false); setXPos(v); }}
                  hintL={fmt1(f.domMin)} hintR={fmt1(f.domMax)}
                />
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px" }}>
                  ELIGE UNA FUNCIÓN
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {FUNCIONES.map((ff) => (
                    <button key={ff.id} className="ex-chip" data-on={funcId === ff.id} onClick={() => elegirFunc(ff.id)} title={ff.titulo}>
                      <i className={`fa-solid ${ff.icono}`} style={{ color: ff.color }} />
                      {ff.label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <Eyebrow>
                  <i className="fa-solid fa-arrows-up-down" style={{ marginRight: 8, color: accent }} />
                  Mueve el valor objetivo N entre g(1) = −1 y g(2) = 5
                </Eyebrow>
                <Deslizador
                  label="valor objetivo N"
                  icon="fa-arrows-up-down"
                  colr={Math.abs(nObj) < 1e-9 ? OK_COL : X_COL}
                  valor={fmt2(nObj)}
                  min={TVI.ga} max={TVI.gb} step={0.05} value={nObj}
                  onChange={(v) => { setPlaying(false); setNObj(v); }}
                  hintL="−1 = g(1)" hintR="5 = g(2)"
                />
                <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 12, border: `1px solid ${OK_COL}55`, background: `${OK_COL}12`, fontSize: 12, color: T.text2, lineHeight: 1.5 }}>
                  <i className="fa-solid fa-check" style={{ color: OK_COL, marginRight: 8 }} />
                  Para cualquier N en [−1, 5] siempre existe un <strong style={{ color: OK_COL }}>c ∈ (1,2)</strong> con g(c) = N. En N = 0, ese c ≈ {fmt2(bisectN(0))} es la raíz de g.
                </div>
              </>
            )}
          </div>

          {/* Semáforo de continuidad (modo continuidad) / pasos TVI */}
          {modo === "continuidad" ? (
            <div style={{ ...card, padding: "18px 22px 20px" }}>
              <Eyebrow>
                <i className="fa-solid fa-traffic-light" style={{ marginRight: 8, color: accent }} />
                Las 3 condiciones de continuidad en x = {fmt0(f.a)}
              </Eyebrow>
              <div style={{ display: "grid", gap: 9 }}>
                {conds.map((cd) => (
                  <div key={cd.etiqueta} style={{ display: "flex", gap: 11, alignItems: "center", padding: "10px 13px", borderRadius: 11, background: cd.cumple ? `${OK_COL}12` : `${HOLE_COL}10`, border: `1px solid ${cd.cumple ? OK_COL : HOLE_COL}44` }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#04121f", background: cd.cumple ? OK_COL : HOLE_COL, flexShrink: 0 }}>
                      <i className={`fa-solid ${cd.cumple ? "fa-check" : "fa-xmark"}`} />
                    </div>
                    <div style={{ fontSize: 12.5, color: "#fff", lineHeight: 1.4 }}>
                      <strong>({cd.etiqueta})</strong> {cd.texto}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, padding: "11px 14px", borderRadius: 12, border: `1px solid ${f.continua ? OK_COL : HOLE_COL}55`, background: `${f.continua ? OK_COL : HOLE_COL}12`, fontSize: 12.5, color: "#fff", lineHeight: 1.5 }}>
                <i className={`fa-solid ${f.continua ? "fa-circle-check" : "fa-circle-exclamation"}`} style={{ color: f.continua ? OK_COL : HOLE_COL, marginRight: 8 }} />
                {f.continua
                  ? `Las tres se cumplen → f es CONTINUA en x = ${fmt0(f.a)}.`
                  : `Falla al menos una → discontinuidad ${f.tipoLabel}.`}
                {f.reparable && f.reparacion ? ` Se repara: ${f.reparacion}` : ""}
                {!f.continua && !f.reparable ? " No es reparable." : ""}
              </div>
            </div>
          ) : (
            <div style={{ ...card, padding: "18px 22px 20px" }}>
              <Eyebrow>
                <i className="fa-solid fa-list-ol" style={{ marginRight: 8, color: accent }} />
                Teorema del Valor Intermedio — ¿hay raíz en (1, 2)?
              </Eyebrow>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 14 }}>
                <Readout label="g(1)" value={fmt0(TVI.ga)} col={HOLE_COL} size={18} />
                <Readout label="g(2)" value={fmt0(TVI.gb)} col={OK_COL} size={18} />
                <Readout label="N (objetivo)" value={fmt2(nObj)} col={X_COL} size={16} />
                <Readout label="c con g(c)=N" value={fmt2(cTvi)} col={OK_COL} size={16} />
              </div>
              <div style={{ display: "grid", gap: 9 }}>
                {TVI.pasos.map((p) => (
                  <div key={p.etiqueta} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${accent}25` }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#04121f", background: accent, flexShrink: 0 }}>{p.etiqueta}</div>
                    <div style={{ fontSize: 12, color: "#fff", lineHeight: 1.45, minWidth: 0 }}>{p.texto}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Veredicto / resultado */}
          {modo === "continuidad" ? (
            <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${f.continua ? OK_COL : HOLE_COL}66`, background: `${f.continua ? OK_COL : HOLE_COL}12` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: f.color }}>
                  <i className={`fa-solid ${f.icono}`} />
                </div>
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>{f.tipoLabel}</div>
                  <div style={{ fontSize: 12.5, color: f.continua ? OK_COL : HOLE_COL, fontWeight: 800, fontFamily: "ui-monospace, monospace" }}>{f.expr}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{f.contexto}</div>
              {/* límites laterales */}
              <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                <MiniVal label="lím izq" value={valOInf(f.limIzq, f.infIzq)} col={X_COL} />
                <MiniVal label="lím der" value={valOInf(f.limDer, f.infDer)} col={X_COL} />
                <MiniVal label={`f(${fmt0(f.a)})`} value={f.fa !== null ? fmt2(f.fa) : "no existe"} col={f.fa !== null ? OK_COL : HOLE_COL} />
              </div>
            </div>
          ) : (
            <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${OK_COL}66`, background: `${OK_COL}12` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: "#a78bfa" }}>
                  <i className="fa-solid fa-arrow-down-up-across-line" />
                </div>
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>Teorema del Valor Intermedio</div>
                  <div style={{ fontSize: 12.5, color: OK_COL, fontWeight: 800, fontFamily: "ui-monospace, monospace" }}>{TVI.expr} en [1, 2]</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{TVI.contexto}</div>
            </div>
          )}

          {/* Resolución paso a paso (modo continuidad) */}
          {modo === "continuidad" && (
            <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: `1px solid ${accent}40`, background: `rgba(${color.rgba},0.08)` }}>
              <Eyebrow>
                <i className="fa-solid fa-list-ol" style={{ marginRight: 8, color: accent }} />
                Análisis paso a paso
              </Eyebrow>
              <div style={{ display: "grid", gap: 9 }}>
                {f.pasos.map((p) => (
                  <div key={p.etiqueta} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${accent}25` }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#04121f", background: accent, flexShrink: 0 }}>{p.etiqueta}</div>
                    <div style={{ fontSize: 12, color: "#fff", lineHeight: 1.45, minWidth: 0 }}>{p.texto}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tipos de discontinuidad (referencia) */}
          <div style={{ ...card, padding: "20px 22px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-shapes" style={{ marginRight: 8, color: accent }} />
              Los tipos de discontinuidad
            </Eyebrow>
            <div style={{ display: "grid", gap: 9 }}>
              <TipoRef icono="fa-circle-notch" col="#FB923C" titulo="Evitable (removible)" texto="El límite existe pero f(a) no, o difiere. Se repara redefiniendo f(a) = límite." />
              <TipoRef icono="fa-stairs" col="#60A5FA" titulo="De salto (1.ª especie)" texto="Los límites laterales existen pero son distintos. La función salta (tarifas CFE)." />
              <TipoRef icono="fa-bolt" col="#F472B6" titulo="Esencial (2.ª especie)" texto="Un límite lateral es infinito o no existe (asíntota vertical, como 1/x). No se repara." />
            </div>
          </div>
        </div>
      </div>

      {/* ── Lecturas + ideas clave ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="ex-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-gauge-high" style={{ marginRight: 8, color: accent }} />
            Lecturas
          </Eyebrow>
          {modo === "continuidad" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <Readout label="posición x" value={fmt2(xPos)} col={X_COL} size={15} />
              <Readout label="f(x)" value={Number.isFinite(yVal) ? conUnidad(yVal, "", 2) : "—"} col={Number.isFinite(yVal) ? OK_COL : HOLE_COL} size={15} />
              <Readout label={`punto a`} value={fmt0(f.a)} col={X_COL} size={15} />
              <Readout label="¿continua en a?" value={f.continua ? "sí" : "no"} col={f.continua ? OK_COL : HOLE_COL} size={16} />
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <Readout label="g(1)" value={fmt0(TVI.ga)} col={HOLE_COL} size={16} />
              <Readout label="g(2)" value={fmt0(TVI.gb)} col={OK_COL} size={16} />
              <Readout label="N objetivo" value={fmt2(nObj)} col={X_COL} size={15} />
              <Readout label="c (g(c)=N)" value={fmt2(cTvi)} col={OK_COL} size={16} />
            </div>
          )}
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {DATOS.map((dd, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 10, background: T.glass, border: `1px solid ${T.line}` }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: accent, background: `rgba(${color.rgba},0.16)`, flexShrink: 0 }}>
                  <i className={`fa-solid ${dd.icono}`} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{dd.valor}</div>
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
          Cálculo <strong>exacto</strong>: f(x), los límites laterales, las 3 condiciones y la raíz del TVI (por bisección sobre g(x) = x³ − x − 1) salen de la fórmula real. El caso ancla <strong>(x²−4)/(x−2)</strong> y el TVI sobre <strong>g en [1,2]</strong> son verbatim del enunciado A2; los ejemplos de salto y esencial son <strong>didácticos</strong> (alineados con la infografía A1). El plano se dibuja a escala propia por caso para mostrar valores reales; el anillo abierto señala dónde el límite no se alcanza y la línea punteada en la esencial marca la asíntota vertical.
        </span>
      </div>
    </div>
  );
}

/* ── Mini valor (límites laterales) ───────────────────────────────────────── */
function MiniVal({ label, value, col }: { label: string; value: string; col: string }) {
  return (
    <div style={{ padding: "8px 10px", borderRadius: 10, background: "rgba(4,10,22,0.4)", border: `1px solid ${col}33` }}>
      <div style={{ fontSize: 10, color: T.text3, fontWeight: 800, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13.5, fontWeight: 900, color: col, fontFamily: "ui-monospace, monospace" }}>{value}</div>
    </div>
  );
}

/* ── Tarjeta de tipo de discontinuidad ────────────────────────────────────── */
function TipoRef({ icono, col, titulo, texto }: { icono: string; col: string; titulo: string; texto: string }) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: T.glass, border: `1px solid ${col}33` }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: col, background: `${col}1e`, flexShrink: 0 }}>
        <i className={`fa-solid ${icono}`} />
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 900, color: "#fff" }}>{titulo}</div>
        <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{texto}</div>
      </div>
    </div>
  );
}

/* ── Deslizador reutilizable ─────────────────────────────────────────────── */
function Deslizador({ label, icon, colr, valor, min, max, step, value, onChange, hintL, hintR }: {
  label: string; icon: string; colr: string; valor: string;
  min: number; max: number; step: number; value: number; onChange: (v: number) => void;
  hintL?: string; hintR?: string;
}) {
  const fill = `${((Math.min(max, Math.max(min, value)) - min) / (max - min)) * 100}%`;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: colr }}>
          <i className={`fa-solid ${icon}`} style={{ marginRight: 6 }} />
          {label}
        </span>
        <span style={{ fontSize: 14, fontWeight: 900, color: colr, fontFamily: "ui-monospace, monospace" }}>{valor}</span>
      </div>
      <input type="range" className="ex-range" min={min} max={max} step={step} value={Math.min(max, Math.max(min, value))}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--exc" as string]: colr, ["--exfill" as string]: fill }} />
      {(hintL || hintR) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
          <span>{hintL}</span>
          <span>{hintR}</span>
        </div>
      )}
    </div>
  );
}

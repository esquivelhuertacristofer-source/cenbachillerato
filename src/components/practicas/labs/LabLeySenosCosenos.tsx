"use client";

/**
 * Laboratorio 3D — Ley de Senos y Ley de Cosenos (resolución de triángulos
 * oblicuángulos). Práctica experimental para PM-IV-P05-A2 (ejercicio_matematico;
 * progresión 5).
 *
 * El alumno conoce dos lados de un terreno (a y b) y el ángulo C que forman, y
 * halla el tercer lado c —el que cruza un lago/barranco y no puede medir con
 * cinta— con la LEY DE COSENOS: c = √(a²+b²−2ab·cos C). Luego la LEY DE SENOS da
 * los ángulos restantes. Cálculo exacto.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import {
  calcTri, LEYES, ESCENARIOS, IDEAS, DATOS,
  A_MIN, A_MAX, A_STEP, A_DEF, B_MIN, B_MAX, B_STEP, B_DEF,
  C_MIN, C_MAX, C_STEP, C_DEF,
  fmtNum2, fmtM, fmtM2, fmtDeg, type Escenario,
} from "./ley-senos-cosenos-data";

const LeySenosCosenosScene = dynamic(() => import("./LeySenosCosenosScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-draw-polygon fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Levantando el terreno triangular…</span>
    </div>
  ),
});

const A_COL = "#60a5fa";   // lado a
const B_COL = "#34D399";   // lado b
const C_COL = "#f5d36b";   // lado c (incógnita)
const ANGC_COL = "#fbbf24"; // ángulo C

export function LabLeySenosCosenos({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [a, setA] = useState(A_DEF);
  const [b, setB] = useState(B_DEF);
  const [angC, setAngC] = useState(C_DEF);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [mostrarAngulos, setMostrarAngulos] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
  const dir = useRef(1);

  // Barrido automático del ángulo C (rebota entre los límites).
  useEffect(() => {
    if (!reproduciendo) return;
    let raf = 0;
    let last = 0;
    const tick = (ts: number) => {
      if (last === 0) last = ts;
      const dt = ts - last;
      last = ts;
      setAngC((prev) => {
        let next = prev + dt * 0.025 * dir.current; // ~25°/s
        if (next >= C_MAX) { next = C_MAX; dir.current = -1; }
        else if (next <= C_MIN) { next = C_MIN; dir.current = 1; }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reproduciendo]);

  const t = useMemo(() => calcTri(a, b, angC), [a, b, angC]);

  const setAman = (v: number) => { setReproduciendo(false); setA(v); };
  const setBman = (v: number) => { setReproduciendo(false); setB(v); };
  const setCman = (v: number) => { setReproduciendo(false); setAngC(v); };
  const aplicar = (e: Escenario) => { setReproduciendo(false); setA(e.a); setB(e.b); setAngC(e.angC); bump(); };
  const reset = () => { setReproduciendo(false); setA(A_DEF); setB(B_DEF); setAngC(C_DEF); bump(); };
  const bump = () => setResetNonce((n) => n + 1);

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-draw-polygon" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Resuelve el triángulo del terreno</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero la idea sigue: con dos lados (a = {fmtM(t.a)}, b = {fmtM(t.b)}) y el ángulo C = {fmtDeg(t.angC)}, la Ley de Cosenos da c = {fmtM(t.c)}.
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes exPulseLsc { 0%,100%{ box-shadow:0 0 0 0 var(--exc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ex-live-dot { animation: exPulseLsc 1.6s ease-in-out infinite; }
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
          color:${T.text2}; font-size:12px; font-weight:800; transition:all .15s; text-align:left; }
        .ex-chip:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .ex-chip[data-on="true"] { border-color:rgba(${color.rgba},0.7); background:rgba(${color.rgba},0.18); color:#fff; }
        .ex-tog { cursor:pointer; display:flex; align-items:center; gap:8px; padding:9px 12px; border-radius:11px;
          border:1px solid ${T.line}; background:${T.inset}; color:${T.text2}; font-size:12px; font-weight:800; transition:all .15s; }
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
              <LeySenosCosenosScene
                a={a}
                b={b}
                angC={angC}
                accent={accent}
                mostrarAngulos={mostrarAngulos}
                autoRotate={autoRotate}
                pausado={false}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13.5, fontWeight: 900, color: "#fff" }}>c = {fmtM(t.c)}</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={reproduciendo} onClick={() => setReproduciendo((p) => !p)} title={reproduciendo ? "Pausar el barrido del ángulo C" : "Barrer el ángulo C"}>
                <i className={`fa-solid ${reproduciendo ? "fa-pause" : "fa-play"}`} />
              </button>
              <button className="ex-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((vv) => !vv)} title="Girar la cámara">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="ex-icobtn" onClick={reset} title="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Pie: ecuación en vivo */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 13, color: "#eaf0fb", fontWeight: 800, fontFamily: "ui-monospace, monospace" }}>
                c² = <span style={{ color: A_COL }}>{fmtNum2(t.a)}</span>² + <span style={{ color: B_COL }}>{fmtNum2(t.b)}</span>² − 2·a·b·cos <span style={{ color: ANGC_COL }}>{fmtDeg(t.angC)}</span> → c = <span style={{ color: C_COL }}>{fmtM(t.c)}</span>
              </div>
              <div style={{ fontSize: 12.5, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>
                <i className="fa-solid fa-scale-balanced" style={{ color: ANG_LABEL_COL, marginRight: 7 }} />
                Ley de Senos → A = {fmtDeg(t.angA)}, B = {fmtDeg(t.angB)} (y A + B + C = 180°).
              </div>
            </div>
          </div>

          {/* Controles */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: accent }} />
              Lo que mides en campo: dos lados y el ángulo entre ellos
            </Eyebrow>
            <div style={{ display: "grid", gap: 16 }}>
              <Deslizador label="a · lado conocido" icon="fa-ruler-horizontal" colr={A_COL}
                valor={fmtM(t.a)} min={A_MIN} max={A_MAX} step={A_STEP} value={a}
                onChange={setAman} hintL={`${A_MIN} m`} hintR={`${A_MAX} m`} />
              <Deslizador label="b · lado conocido" icon="fa-ruler-horizontal" colr={B_COL}
                valor={fmtM(t.b)} min={B_MIN} max={B_MAX} step={B_STEP} value={b}
                onChange={setBman} hintL={`${B_MIN} m`} hintR={`${B_MAX} m`} />
              <Deslizador label="C · ángulo entre a y b (incluido)" icon="fa-angle-up" colr={ANGC_COL}
                valor={fmtDeg(t.angC)} min={C_MIN} max={C_MAX} step={C_STEP} value={angC}
                onChange={setCman} hintL={`${C_MIN}°`} hintR={`${C_MAX}°`} />
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
              <button className="ex-tog" onClick={() => setMostrarAngulos((v) => !v)} style={{ borderColor: mostrarAngulos ? `${ANG_LABEL_COL}88` : T.line, background: mostrarAngulos ? `${ANG_LABEL_COL}1a` : T.inset, color: mostrarAngulos ? "#fff" : T.text2 }}>
                <i className={`fa-solid ${mostrarAngulos ? "fa-eye" : "fa-eye-slash"}`} style={{ color: ANG_LABEL_COL }} /> Ángulos A y B
              </button>
            </div>

            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px" }}>SITUACIONES</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ESCENARIOS.map((e) => (
                <button key={e.label} className="ex-chip" title={e.desc}
                  data-on={Math.abs(t.a - e.a) < 0.5 && Math.abs(t.b - e.b) < 0.5 && Math.abs(t.angC - e.angC) < 0.5}
                  onClick={() => aplicar(e)}
                  style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <i className={`fa-solid ${e.icono}`} style={{ color: accent }} />
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          {/* Las dos leyes */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-scroll" style={{ marginRight: 8, color: accent }} />
              Las dos leyes de los triángulos oblicuángulos
            </Eyebrow>
            <div style={{ display: "grid", gap: 10 }}>
              {LEYES.map((l) => (
                <div key={l.nombre} style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${l.color}33`, background: "rgba(4,10,22,0.4)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 5 }}>
                    <span style={{ width: 9, height: 9, borderRadius: "50%", background: l.color }} />
                    <span style={{ fontSize: 13, fontWeight: 900, color: "#fff" }}>{l.nombre}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: l.color, fontFamily: "ui-monospace, monospace", marginBottom: 4 }}>{l.formula}</div>
                  <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{l.uso}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* El cálculo paso a paso */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}55`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-calculator" />
              </div>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>El cálculo, paso a paso</div>
                <div style={{ fontSize: 11.5, color: accent, fontWeight: 800 }}>Ley de Cosenos</div>
              </div>
            </div>
            <div style={{ display: "grid", gap: 9 }}>
              <PasoRow n={1} texto="Conozco dos lados y el ángulo entre ellos:" valor={`a = ${fmtM(t.a)},  b = ${fmtM(t.b)},  C = ${fmtDeg(t.angC)}`} col={A_COL} />
              <PasoRow n={2} texto="Aplico la Ley de Cosenos:" valor={`c² = a² + b² − 2ab·cos C`} col={ANGC_COL} />
              <PasoRow n={3} texto="Sustituyo los valores:" valor={`c² = ${fmtNum2(t.a * t.a + t.b * t.b - 2 * t.a * t.b * Math.cos(t.radC))}`} col={C_COL} />
              <PasoRow n={4} texto="Saco la raíz cuadrada:" valor={`c = ${fmtM(t.c)}`} col={accent} />
              <PasoRow n={5} texto="Con la Ley de Senos hallo los ángulos:" valor={`A = ${fmtDeg(t.angA)},  B = ${fmtDeg(t.angB)}`} col={ANG_LABEL_COL} />
            </div>
          </div>

          {/* Anatomía del triángulo */}
          <div style={{ ...card, padding: "20px 22px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-vector-square" style={{ marginRight: 8, color: accent }} />
              Anatomía del triángulo
            </Eyebrow>
            <div style={{ display: "grid", gap: 9 }}>
              <LadoRow label="Lado a (conocido)" valor={fmtM(t.a)} col={A_COL} icon="fa-ruler" />
              <LadoRow label="Lado b (conocido)" valor={fmtM(t.b)} col={B_COL} icon="fa-ruler" />
              <LadoRow label="Lado c (la incógnita)" valor={fmtM(t.c)} col={C_COL} icon="fa-circle-question" />
              <LadoRow label="Ángulo C (entre a y b)" valor={fmtDeg(t.angC)} col={ANGC_COL} icon="fa-angle-up" />
            </div>
            <div style={{ fontSize: 11.8, color: T.text2, lineHeight: 1.5, marginTop: 11 }}>
              El ángulo <strong style={{ color: ANGC_COL }}>C</strong> está entre los lados conocidos; el lado <strong style={{ color: C_COL }}>c</strong> que buscas es el que está <strong>enfrente</strong> de él (su opuesto).
            </div>
          </div>

          {/* Pitágoras como caso particular */}
          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: `1px solid ${accent}40`, background: `rgba(${color.rgba},0.08)` }}>
            <Eyebrow>
              <i className="fa-solid fa-lightbulb" style={{ marginRight: 8, color: accent }} />
              Generaliza a Pitágoras
            </Eyebrow>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>
              Cuando C = 90°, cos 90° = 0 y el término −2ab·cos C desaparece: la Ley de Cosenos se vuelve <strong style={{ color: "#fff" }}>c² = a² + b²</strong>, ¡el Teorema de Pitágoras! Por eso sirve para <strong style={{ color: C_COL }}>cualquier</strong> triángulo, no solo los rectángulos. {t.angC > 88 && t.angC < 92 ? "Estás justo en ese caso ahora." : "Prueba el escenario «Casi recto» para verlo."}
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            <Readout label="lado c" value={fmtM(t.c)} col={C_COL} size={18} />
            <Readout label="ángulo A" value={fmtDeg(t.angA)} col={ANG_LABEL_COL} size={18} />
            <Readout label="ángulo B" value={fmtDeg(t.angB)} col={ANG_LABEL_COL} size={18} />
            <Readout label="área" value={fmtM2(t.area)} col={accent} size={18} />
          </div>
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
          Cálculo <strong>exacto</strong>: el lado c sale de la Ley de Cosenos (c = √(a²+b²−2ab·cos C)) y los ángulos A y B de la Ley de Senos/Cosenos; siempre A + B + C = 180°. La escena <strong>centra y escala</strong> el terreno para encuadrarlo (su forma depende de a, b y C), pero los <strong>valores numéricos</strong> de las etiquetas y lecturas siempre son reales.
        </span>
      </div>
    </div>
  );
}

const ANG_LABEL_COL = "#c4b5fd";

/* ── Fila de un paso del cálculo ─────────────────────────────────────────── */
function PasoRow({ n, texto, valor, col }: { n: number; texto: string; valor: string; col: string }) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${col}30` }}>
      <div style={{ width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#04121f", background: col, flexShrink: 0 }}>{n}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.35 }}>{texto}</div>
        <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace", marginTop: 2 }}>{valor}</div>
      </div>
    </div>
  );
}

/* ── Fila de un lado/ángulo del triángulo ────────────────────────────────── */
function LadoRow({ label, valor, col, icon }: { label: string; valor: string; col: string; icon: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 13px", borderRadius: 11, background: "rgba(4,10,22,0.45)", border: `1px solid ${col}33` }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: col, background: `${col}1e`, flexShrink: 0 }}>
        <i className={`fa-solid ${icon}`} />
      </div>
      <span style={{ fontSize: 12.5, fontWeight: 800, color: T.text2 }}>{label}</span>
      <span style={{ marginLeft: "auto", fontSize: 15, fontWeight: 900, color: col, fontFamily: "ui-monospace, monospace" }}>{valor}</span>
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

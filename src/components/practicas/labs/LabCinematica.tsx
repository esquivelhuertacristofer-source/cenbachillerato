"use client";

/**
 * Laboratorio 3D — "Cinemática del MRUA: acelerar y frenar".
 * Práctica experimental para CNEYT-V-P02-A2 ("Práctica de verificación y ejercicio
 * científico"; progresión 2 "Describe el movimiento rectilíneo uniforme y
 * uniformemente acelerado con representaciones gráficas y algebraicas", UAC CNEYT-V
 * "La energía en procesos de vida diaria").
 *
 * El alumno ve un automóvil recorrer una autopista (problema verbatim Puebla–CDMX):
 * acelera uniformemente, alcanza su velocidad máxima y luego frena hasta detenerse.
 * Una línea de tiempo reproduce el recorrido y, en paralelo, se dibujan las TRES
 * representaciones gráficas del MRUA —posición-tiempo, velocidad-tiempo y
 * aceleración-tiempo— con una sonda sincronizada al instante actual. Puede mover la
 * aceleración, la duración y el frenado y ver cómo cambian la velocidad final y las
 * distancias. Toda la cinemática es de cálculo cerrado.
 */

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import {
  resolver, estadoEn, resultado, muestrear,
  A1_MIN, A1_MAX, T1_MIN, T1_MAX, A2_MIN, A2_MAX,
  A1_DEF, T1_DEF, A2_DEF,
  PROBLEMA, PASOS, IDEAS, DATOS, type Punto,
  fmt0, fmt1,
} from "./cinematica-data";

const CinematicaScene = dynamic(() => import("./CinematicaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-car-side fa-fade" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Trazando la autopista…</span>
    </div>
  ),
});

const C_POS = "#c084fc";   // posición x-t
const C_VEL = "#7dd3fc";   // velocidad v-t
const C_ACC = "#34D399";   // aceleración (positiva)
const C_BRK = "#f87171";   // aceleración (frenado)

export function LabCinematica({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [a1, setA1] = useState<number>(A1_DEF);
  const [t1, setT1] = useState<number>(T1_DEF);
  const [a2, setA2] = useState<number>(A2_DEF);
  const [t, setT] = useState<number>(0);
  const [playing, setPlaying] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // Reproduce el recorrido en el tiempo (rAF). Al llegar al final, reinicia.
  useEffect(() => {
    if (!playing) return;
    const mov = resolver(a1, t1, a2);
    let raf = 0;
    let last = 0;
    const tick = (ts: number) => {
      if (last === 0) last = ts;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      setT((prev) => {
        const next = prev + dt * 1.4;     // ~1.4× tiempo real
        return next >= mov.tTotal ? 0 : next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, a1, t1, a2]);

  const bump = () => setResetNonce((n) => n + 1);
  const reset = () => {
    setPlaying(false);
    setA1(A1_DEF); setT1(T1_DEF); setA2(A2_DEF);
    setT(0); bump();
  };
  const scrub = (v: number) => { setPlaying(false); setT(v); };

  const mov = resolver(a1, t1, a2);
  const tCur = Math.min(t, mov.tTotal);
  const est = estadoEn(mov, tCur);
  const res = resultado(mov);
  const pts = muestrear(mov, 140);

  const fase = est.fase === 1 ? "acelerando" : est.fase === 2 ? "frenando" : "detenido";
  const faseCol = est.fase === 2 ? C_BRK : est.fase === 1 ? C_ACC : "#9fb4cc";
  const verbatim = a1 === A1_DEF && t1 === T1_DEF && a2 === A2_DEF;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-car-side" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>x = v₀t + ½at²</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 420, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la escena en 3D, pero las gráficas y los números siguen aquí. En t = {fmt1(tCur)} s el auto va a {fmt1(est.v)} m/s y ha recorrido {fmt0(est.x)} m.
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes cnPulse { 0%,100%{ box-shadow:0 0 0 0 var(--cnc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .cn-live-dot { animation: cnPulse 1.6s ease-in-out infinite; }
        .cn-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .cn-grid { grid-template-columns: 1fr; } }
        .cn-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .cn-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .cn-icobtn:hover { background:rgba(255,255,255,0.12); }
        .cn-range { -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:999px; outline:none;
          background:linear-gradient(90deg, var(--cnc) 0%, var(--cnc) var(--cnfill), rgba(255,255,255,0.12) var(--cnfill), rgba(255,255,255,0.12) 100%); }
        .cn-range::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:20px; height:20px; border-radius:50%;
          background:#fff; border:3px solid var(--cnc); cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
        .cn-range::-moz-range-thumb { width:20px; height:20px; border-radius:50%; background:#fff; border:3px solid var(--cnc); cursor:pointer; }
        .cn-graf3 { display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; }
        @media (max-width: 720px){ .cn-graf3 { grid-template-columns: 1fr; } }
        @media (max-width: 1000px){ .cn-bottom { grid-template-columns: 1fr !important; } }
      `}</style>

      <div className="cn-grid">
        {/* ── Columna visor ──────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              position: "relative",
              height: "clamp(420px, 56vh, 640px)",
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid rgba(${color.rgba},0.22)`,
              background: `radial-gradient(120% 80% at 30% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#0b2233 0%,#08131f 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <CinematicaScene a1={a1} t1={t1} a2={a2} t={tCur} accent={accent} resetNonce={resetNonce} />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(4,10,22,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="cn-live-dot" style={{ ["--cnc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>MRUA</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(4,10,22,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="cn-icobtn" data-on={playing} onClick={() => setPlaying((p) => !p)} title={playing ? "Pausar" : "Reproducir el recorrido"}>
                <i className={`fa-solid ${playing ? "fa-pause" : "fa-play"}`} />
              </button>
              <button className="cn-icobtn" onClick={reset} title="Reiniciar al problema verbatim">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Leyenda */}
            <div style={{ position: "absolute", top: 60, left: 16, display: "flex", flexDirection: "column", gap: 6, padding: "9px 12px", borderRadius: 12, background: "rgba(4,10,22,0.7)", border: `1px solid ${T.line}`, backdropFilter: "blur(8px)" }}>
              <LegItem col={C_VEL} txt="velocidad  v" />
              <LegItem col={C_ACC} txt="aceleración  (+)" />
              <LegItem col={C_BRK} txt="frenado  (−)" />
            </div>

            {/* Pie: lectura en vivo */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(3,8,18,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#eaf0fb", fontWeight: 800 }}>
                <i className="fa-solid fa-car-side" style={{ color: faseCol, marginRight: 7 }} />
                t = {fmt1(est.t)} s · {fase} · v = {fmt1(est.v)} m/s ({fmt0(est.v * 3.6)} km/h) · x = {fmt0(est.x)} m · a = {fmt1(est.a)} m/s²
              </div>
              <div style={{ fontSize: 12, color: "#cdd8ec", lineHeight: 1.5, marginTop: 6 }}>
                Reproduce el recorrido o arrastra la línea de tiempo; la carretera se ajusta a la distancia total ({fmt0(mov.xTotal)} m).
              </div>
            </div>
          </div>

          {/* Línea de tiempo */}
          <div style={{ ...card, padding: "16px 22px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: accent }}>
                <i className="fa-solid fa-clock" style={{ marginRight: 6 }} />
                línea de tiempo  t
              </span>
              <span style={{ fontSize: 14, fontWeight: 900, color: accent, fontFamily: "ui-monospace, monospace" }}>{fmt1(tCur)} / {fmt1(mov.tTotal)} s</span>
            </div>
            <input type="range" className="cn-range" min={0} max={mov.tTotal} step={0.05} value={tCur}
              onChange={(e) => scrub(Number(e.target.value))}
              style={{ ["--cnc" as string]: accent, ["--cnfill" as string]: `${(tCur / mov.tTotal) * 100}%` }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
              <span>0 s · salida</span>
              <span style={{ color: faseCol, fontWeight: 800 }}>{fase}</span>
              <span>{fmt1(mov.tTotal)} s · alto</span>
            </div>
          </div>

          {/* Variables del recorrido */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <Eyebrow>
                <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: accent }} />
                Explora las variables del MRUA
              </Eyebrow>
              {!verbatim && (
                <button onClick={reset} style={{ cursor: "pointer", fontSize: 11, fontWeight: 800, color: accent, background: `rgba(${color.rgba},0.14)`, border: `1px solid ${accent}55`, borderRadius: 8, padding: "5px 10px" }}>
                  <i className="fa-solid fa-rotate-left" style={{ marginRight: 6 }} />volver al problema
                </button>
              )}
            </div>
            <div style={{ display: "grid", gap: 18 }}>
              <Deslizador label="aceleración  a₁ (m/s²)" icon="fa-gauge-high" colr={C_ACC} valor={`${fmt1(a1)} m/s²`}
                min={A1_MIN} max={A1_MAX} step={0.1} value={a1}
                onChange={(v) => setA1(v)} hintL={`${fmt0(A1_MIN)}`} hintR={`${fmt0(A1_MAX)}`} />
              <Deslizador label="tiempo de aceleración  t₁ (s)" icon="fa-stopwatch" colr={accent} valor={`${fmt1(t1)} s`}
                min={T1_MIN} max={T1_MAX} step={0.5} value={t1}
                onChange={(v) => setT1(v)} hintL={`${fmt0(T1_MIN)}`} hintR={`${fmt0(T1_MAX)}`} />
              <Deslizador label="frenado  a₂ (m/s²)" icon="fa-car-burst" colr={C_BRK} valor={`−${fmt1(a2)} m/s²`}
                min={A2_MIN} max={A2_MAX} step={0.1} value={a2}
                onChange={(v) => setA2(v)} hintL={`${fmt0(A2_MIN)}`} hintR={`${fmt0(A2_MAX)}`} />
            </div>
            <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 12, border: `1px solid ${accent}44`, background: `rgba(${color.rgba},0.10)`, fontSize: 12.5, color: "#fff", lineHeight: 1.5 }}>
              <i className="fa-solid fa-flag-checkered" style={{ color: accent, marginRight: 8 }} />
              v₀ = 0 (parte del reposo). Alcanza <strong style={{ color: C_VEL }}>{fmt0(res.vFin)} m/s ≈ {fmt0(res.vKmh)} km/h</strong> tras recorrer <strong style={{ color: C_POS }}>{fmt0(res.dAccel)} m</strong>; frena en <strong>{fmt1(res.tFreno)} s</strong> sumando <strong style={{ color: C_BRK }}>{fmt0(res.dFreno)} m</strong>. Total: <strong>{fmt0(res.dTotal)} m</strong>.
            </div>
          </div>

          {/* Las tres representaciones gráficas */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-chart-line" style={{ marginRight: 8, color: accent }} />
              Representaciones gráficas del movimiento
            </Eyebrow>
            <div className="cn-graf3">
              <Grafica pts={pts} acc={(p) => p.x} tTotal={mov.tTotal} t1={mov.t1} tCur={tCur} valCur={est.x}
                color={C_POS} titulo="posición  x – t" unidad="m" yMin={0} yMax={mov.xTotal} fill curva />
              <Grafica pts={pts} acc={(p) => p.v} tTotal={mov.tTotal} t1={mov.t1} tCur={tCur} valCur={est.v}
                color={C_VEL} titulo="velocidad  v – t" unidad="m/s" yMin={0} yMax={mov.v1} fill />
              <Grafica pts={pts} acc={(p) => p.a} tTotal={mov.tTotal} t1={mov.t1} tCur={tCur} valCur={est.a}
                color={est.a >= 0 ? C_ACC : C_BRK} titulo="aceleración  a – t" unidad="m/s²" yMin={-a2} yMax={a1} escalonada />
            </div>
            <div style={{ marginTop: 12, fontSize: 11.5, color: T.text2, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
              <i className="fa-solid fa-lightbulb" style={{ color: accent, marginTop: 2 }} />
              <span>La <strong style={{ color: C_VEL }}>pendiente</strong> de la recta v–t es la aceleración; el <strong style={{ color: C_VEL }}>área</strong> bajo ella es la distancia (área sombreada = {fmt0(mov.xTotal)} m). La x–t es una parábola que sube y luego se aplana al detenerse.</span>
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* El problema verbatim */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${accent}66`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#04121f", background: accent }}>
                <i className="fa-solid fa-road" />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>El problema</div>
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>{PROBLEMA}</div>
          </div>

          {/* Resultados */}
          <div style={{ borderRadius: 18, padding: "18px 20px 20px", border: `1px solid ${accent}40`, background: `rgba(${color.rgba},0.08)` }}>
            <Eyebrow>
              <i className="fa-solid fa-square-check" style={{ marginRight: 8, color: accent }} />
              Respuestas
            </Eyebrow>
            <div style={{ display: "grid", gap: 9 }}>
              <Respuesta etq="a" col={C_VEL} txt={`v = ${fmt0(res.vFin)} m/s ≈ ${fmt0(res.vKmh)} km/h`} sub="velocidad al final de la aceleración" />
              <Respuesta etq="b" col={C_POS} txt={`d₁ = ${fmt0(res.dAccel)} m`} sub="distancia durante la aceleración" />
              <Respuesta etq="c" col={C_BRK} txt={`t = ${fmt1(res.tFreno)} s · d₂ = ${fmt0(res.dFreno)} m`} sub="tiempo y distancia de frenado" />
              <Respuesta etq="Σ" col={accent} txt={`d_total = ${fmt0(res.dTotal)} m`} sub="distancia total del recorrido" />
            </div>
          </div>

          {/* Procedimiento paso a paso (verbatim A2) */}
          <div style={{ ...card, padding: "18px 20px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-list-ol" style={{ marginRight: 8, color: accent }} />
              Procedimiento con las ecuaciones del MRUA
            </Eyebrow>
            <div style={{ display: "grid", gap: 9 }}>
              {PASOS.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${accent}25` }}>
                  <div style={{ width: 24, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#04121f", background: accent, flexShrink: 0 }}>{p.etiqueta}</div>
                  <div style={{ fontSize: 12, color: "#fff", lineHeight: 1.45, minWidth: 0 }}>{p.texto}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Lecturas + ideas clave ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="cn-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-gauge-high" style={{ marginRight: 8, color: accent }} />
            Lecturas en t = {fmt1(tCur)} s
          </Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            <Readout label="tiempo t" value={`${fmt1(est.t)}`} unit="s" col={accent} size={15} />
            <Readout label="posición x" value={`${fmt0(est.x)}`} unit="m" col={C_POS} size={15} />
            <Readout label="velocidad v" value={`${fmt1(est.v)}`} unit="m/s" col={C_VEL} size={15} />
            <Readout label="aceler. a" value={`${fmt1(est.a)}`} unit="m/s²" col={faseCol} size={15} />
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
          Cinemática <strong>exacta</strong> de cálculo cerrado (MRUA): v = v₀ + a·t, x = v₀·t + ½·a·t², v² = v₀² + 2·a·x, con v₀ = 0. Se desprecian la resistencia del aire y el tiempo de reacción del conductor; el frenado es a aceleración constante. La carretera 3D se reescala a la distancia total para verse completa, pero las longitudes de las flechas y las gráficas son proporcionales a sus magnitudes reales. Valores y procedimiento son verbatim del enunciado A2.
        </span>
      </div>
    </div>
  );
}

/* ── Gráfica SVG (x-t, v-t, a-t) con sonda en el tiempo actual ────────────── */
function Grafica({
  pts, acc, tTotal, t1, tCur, valCur, color, titulo, unidad, yMin, yMax, fill = false, curva = false, escalonada = false,
}: {
  pts: Punto[]; acc: (p: Punto) => number; tTotal: number; t1: number; tCur: number; valCur: number;
  color: string; titulo: string; unidad: string; yMin: number; yMax: number;
  fill?: boolean; curva?: boolean; escalonada?: boolean;
}) {
  const W = 200, H = 132;
  const pad = { l: 30, r: 8, t: 10, b: 22 };
  const lo = Math.min(yMin, 0);
  const hi = Math.max(yMax, 0.0001);
  const span = hi - lo || 1;

  const mapX = (tv: number) => pad.l + (tv / (tTotal || 1)) * (W - pad.l - pad.r);
  const mapY = (yv: number) => H - pad.b - ((yv - lo) / span) * (H - pad.t - pad.b);

  const path = pts.map((p, i) => `${i ? "L" : "M"} ${mapX(p.t).toFixed(1)} ${mapY(acc(p)).toFixed(1)}`).join(" ");
  const y0 = mapY(0);
  const areaPath = fill ? `${path} L ${mapX(tTotal).toFixed(1)} ${y0.toFixed(1)} L ${mapX(0).toFixed(1)} ${y0.toFixed(1)} Z` : "";

  // escalón de la aceleración: tramo + a1 hasta t1, − a2 después
  const stepPath = escalonada
    ? `M ${mapX(0)} ${mapY(acc(pts[0]!))} L ${mapX(t1)} ${mapY(acc(pts[0]!))} L ${mapX(t1)} ${mapY(acc(pts[pts.length - 1]!))} L ${mapX(tTotal)} ${mapY(acc(pts[pts.length - 1]!))}`
    : "";

  const probeX = mapX(tCur);
  const probeY = mapY(valCur);

  return (
    <div style={{ borderRadius: 12, padding: "10px 10px 6px", background: "rgba(4,10,22,0.4)", border: `1px solid ${color}33` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2, padding: "0 2px" }}>
        <span style={{ fontSize: 11, fontWeight: 900, color }}>{titulo}</span>
        <span style={{ fontSize: 11, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{fmt1(valCur)} {unidad}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
        {/* ejes */}
        <line x1={pad.l} y1={pad.t} x2={pad.l} y2={H - pad.b} stroke="rgba(255,255,255,0.22)" strokeWidth={1} />
        <line x1={pad.l} y1={y0} x2={W - pad.r} y2={y0} stroke="rgba(255,255,255,0.22)" strokeWidth={1} />
        {/* límite de fase t₁ */}
        <line x1={mapX(t1)} y1={pad.t} x2={mapX(t1)} y2={H - pad.b} stroke="rgba(255,255,255,0.18)" strokeWidth={1} strokeDasharray="3 3" />
        {/* área (distancia) */}
        {fill && <path d={areaPath} fill={`${color}22`} stroke="none" />}
        {/* curva */}
        <path d={escalonada ? stepPath : path} fill="none" stroke={color} strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" />
        {/* sonda */}
        <line x1={probeX} y1={pad.t} x2={probeX} y2={H - pad.b} stroke="#ffffff" strokeWidth={1} strokeDasharray="2 3" opacity={0.5} />
        <circle cx={probeX} cy={probeY} r={3.4} fill="#fff" stroke={color} strokeWidth={2} />
        {/* etiquetas de ejes */}
        <text x={pad.l - 4} y={mapY(hi) + 3} textAnchor="end" fontSize={7} fill="rgba(255,255,255,0.5)">{fmt0(hi)}</text>
        {lo < 0 && <text x={pad.l - 4} y={mapY(lo) + 3} textAnchor="end" fontSize={7} fill="rgba(255,255,255,0.5)">{fmt0(lo)}</text>}
        <text x={W - pad.r} y={H - pad.b + 12} textAnchor="end" fontSize={7} fill="rgba(255,255,255,0.5)">{fmt0(tTotal)} s</text>
        {curva && <text x={pad.l + 2} y={H - pad.b + 12} textAnchor="start" fontSize={7} fill="rgba(255,255,255,0.5)">0</text>}
      </svg>
    </div>
  );
}

/* ── Tarjeta de respuesta ─────────────────────────────────────────────────── */
function Respuesta({ etq, col, txt, sub }: { etq: string; col: string; txt: string; sub: string }) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "center", padding: "10px 12px", borderRadius: 11, background: "rgba(4,10,22,0.4)", border: `1px solid ${col}44` }}>
      <div style={{ width: 24, height: 24, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#04121f", background: col, flexShrink: 0 }}>{etq}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{txt}</div>
        <div style={{ fontSize: 10.5, color: T.text2, lineHeight: 1.3 }}>{sub}</div>
      </div>
    </div>
  );
}

/* ── Item de leyenda (visor) ──────────────────────────────────────────────── */
function LegItem({ col, txt }: { col: string; txt: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10.5, fontWeight: 800, color: "#dce6f5" }}>
      <span style={{ width: 18, height: 0, borderTop: `3px solid ${col}`, flexShrink: 0 }} />
      {txt}
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
      <input type="range" className="cn-range" min={min} max={max} step={step} value={Math.min(max, Math.max(min, value))}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--cnc" as string]: colr, ["--cnfill" as string]: fill }} />
      {(hintL || hintR) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
          <span>{hintL}</span>
          <span>{hintR}</span>
        </div>
      )}
    </div>
  );
}

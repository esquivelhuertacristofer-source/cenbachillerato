"use client";

/**
 * Laboratorio 3D — Distribución normal (campana de Gauss).
 * Práctica experimental para PM-VI-P09-A2
 * ("Modelo un evento aleatorio con la distribución normal y calculo su
 *  probabilidad"; progresión 8 / propósito formativo O8).
 *
 * El alumno toma un fenómeno real de México (estaturas ENSANUT, puntajes
 * PLANEA/PISA, CI) y lo modela con una normal: mueve la media μ (la campana
 * se desplaza) y la desviación σ (la campana se ensancha o se estrecha) en el
 * modo CAMPANA; comprueba la regla empírica 68-95-99.7 en el modo REGLA; y en
 * PROBABILIDAD elige un rango [a, b] cuyo área es la probabilidad, con la
 * puntuación z = (x−μ)/σ que estandariza cada extremo. Pensamiento Matemático
 * VI — «Pensamiento estadístico y probabilístico», propósito formativo 8
 * (MCCEMS 2025).
 */

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import {
  PRESETS,
  PRESET_DEFAULT,
  presetPorId,
  MODOS,
  REGLA_EMPIRICA,
  PROBLEMA,
  IDEAS,
  GLOSARIO,
  areaEntre,
  zScore,
  cdfEstandar,
  fmtNum,
  fmtPct,
  type Modo,
} from "./normal-data";

const NormalScene = dynamic(() => import("./NormalScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-bell fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const VERDE = "#34D399";
const ORO = "#ffd24a";
const AZUL = "#5fb0ff";
const MAGENTA = "#f0a6ff";

export function LabNormal({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const inicial = presetPorId(PRESET_DEFAULT);
  const [presetId, setPresetId] = useState(PRESET_DEFAULT);
  const [modo, setModo] = useState<Modo>("campana");
  const [mu, setMu] = useState(inicial.mu);
  const [sigma, setSigma] = useState(inicial.sigma);
  const [a, setA] = useState(inicial.mu - inicial.sigma);
  const [b, setB] = useState(inicial.mu + inicial.sigma);
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // objetivos
  const [movioMu, setMovioMu] = useState(false);
  const [movioSigma, setMovioSigma] = useState(false);
  const [vioEmpirica, setVioEmpirica] = useState(false);
  const [calculoProb, setCalculoProb] = useState(false);

  const bump = () => setResetNonce((k) => k + 1);

  const preset = useMemo(() => presetPorId(presetId), [presetId]);

  const elegirPreset = (id: string) => {
    const p = presetPorId(id);
    setPresetId(id);
    setMu(p.mu);
    setSigma(p.sigma);
    setA(p.mu - p.sigma);
    setB(p.mu + p.sigma);
    bump();
  };

  const elegirModo = (m: Modo) => {
    setModo(m);
    if (m === "empirica") setVioEmpirica(true);
    if (m === "probabilidad") setCalculoProb(true);
  };

  const cambiarMu = (v: number) => { setMu(v); setMovioMu(true); };
  const cambiarSigma = (v: number) => { setSigma(v); setMovioSigma(true); };

  const reset = () => {
    const p = presetPorId(presetId);
    setModo("campana");
    setMu(p.mu); setSigma(p.sigma);
    setA(p.mu - p.sigma); setB(p.mu + p.sigma);
    bump();
  };

  // magnitudes estadísticas (deterministas)
  const prob = useMemo(() => areaEntre(a, b, mu, sigma), [a, b, mu, sigma]);
  const za = useMemo(() => zScore(Math.min(a, b), mu, sigma), [a, b, mu, sigma]);
  const zb = useMemo(() => zScore(Math.max(a, b), mu, sigma), [a, b, mu, sigma]);
  const varianza = sigma * sigma;

  const modoActual = MODOS.find((m) => m.id === modo) ?? MODOS[0]!;

  const objetivos = [
    { txt: "Desplaza la media μ", done: movioMu },
    { txt: "Cambia la dispersión σ", done: movioSigma },
    { txt: "Observa la regla 68-95-99.7", done: vioEmpirica },
    { txt: "Calcula una probabilidad P(a≤X≤b)", done: calculoProb },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-bell" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>El área bajo la campana es la probabilidad</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: una distribución normal se describe por su media μ (el centro) y su desviación σ (el ancho). El área bajo la curva entre a y b es P(a ≤ X ≤ b), y el área total vale 1. Con z = (x−μ)/σ comparas cualquier valor con la normal estándar.
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes nrmPulse { 0%,100%{ box-shadow:0 0 0 0 var(--nrm); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .nrm-live-dot { animation: nrmPulse 1.6s ease-in-out infinite; }
        .nrm-grid { display:grid; grid-template-columns: minmax(0,1fr) clamp(300px,26vw,380px); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .nrm-grid { grid-template-columns: 1fr; } }
        .nrm-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:rgba(255,255,255,0.7); transition:all .15s; }
        .nrm-icobtn[data-on="true"] { background:rgba(${color.rgba},0.22); color:#fff; }
        .nrm-icobtn:hover { background:rgba(255,255,255,0.12); }
        .nrm-divider { height:1px; background:${T.line}; margin:18px 0; }
        .nrm-catgrid { display:grid; grid-template-columns: 1fr; gap:8px; }
        .nrm-catbtn { cursor:pointer; text-align:left; display:flex; flex-direction:column; gap:2px;
          padding:9px 11px; border-radius:11px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; transition:all .15s; }
        .nrm-catbtn:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .nrm-catbtn[data-on="true"] { border-color:var(--nrm); background:rgba(${color.rgba},0.14); color:#fff; box-shadow:0 4px 16px -8px var(--nrm); }
        .nrm-modgrid { display:grid; grid-template-columns: 1fr 1fr 1fr; gap:8px; }
        @media (max-width: 560px){ .nrm-modgrid { grid-template-columns: 1fr; } }
        .nrm-modbtn { cursor:pointer; text-align:center; display:flex; flex-direction:column; align-items:center; gap:5px;
          padding:11px 8px; border-radius:12px; border:1px solid ${T.line}; background:${T.inset}; color:${T.text2}; transition:all .15s; }
        .nrm-modbtn:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .nrm-modbtn[data-on="true"] { border-color:var(--nrm); background:rgba(${color.rgba},0.14); color:#fff; box-shadow:0 4px 16px -8px var(--nrm); }
        .nrm-slider { -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:999px;
          background:${T.inset}; outline:none; cursor:pointer; }
        .nrm-slider::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:18px; height:18px; border-radius:50%;
          background:var(--nrm); border:2px solid #061528; box-shadow:0 2px 8px -2px var(--nrm); cursor:pointer; }
        .nrm-slider::-moz-range-thumb { width:18px; height:18px; border-radius:50%; background:var(--nrm); border:2px solid #061528; cursor:pointer; }
        @media (max-width: 1000px){ .nrm-bottom { grid-template-columns: 1fr !important; } }
      `}</style>

      <div className="nrm-grid">
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
              <NormalScene
                presetId={presetId}
                accent={accent}
                modo={modo}
                mu={mu}
                sigma={sigma}
                a={a}
                b={b}
                pausado={pausado}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="nrm-live-dot" style={{ ["--nrm" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 15, fontWeight: 900, color: accent, fontFamily: "ui-monospace, monospace" }}>
                <i className="fa-solid fa-bell" style={{ marginRight: 8 }} />
                N(μ={fmtNum(mu, 1)}, σ={fmtNum(sigma, 1)})
              </span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(2,12,28,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="nrm-icobtn" data-on={!pausado} onClick={() => setPausado((p) => !p)} title={pausado ? "Reanudar" : "Pausar"}>
                <i className={`fa-solid ${pausado ? "fa-play" : "fa-pause"}`} />
              </button>
              <button className="nrm-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((v) => !v)} title="Girar la cámara">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="nrm-icobtn" onClick={reset} title="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Pie: lectura del modo actual */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(2,10,24,0.88) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#dCE8F6", lineHeight: 1.5, maxWidth: 640 }}>
                {modo === "probabilidad" ? (
                  <>
                    <strong style={{ color: VERDE }}>P({fmtNum(Math.min(a, b), 0)} ≤ X ≤ {fmtNum(Math.max(a, b), 0)})</strong> = {fmtPct(prob, 2)} · <strong style={{ color: AZUL }}>z</strong> de {fmtNum(za, 2)} a {fmtNum(zb, 2)}
                  </>
                ) : (
                  <>
                    <strong style={{ color: ORO }}>media μ</strong> {fmtNum(mu, 1)} {preset.unidad} · <strong style={{ color: AZUL }}>desviación σ</strong> {fmtNum(sigma, 1)} {preset.unidad} · <strong style={{ color: MAGENTA }}>varianza σ²</strong> {fmtNum(varianza, 1)}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Controles: modo + sliders */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: accent }} />
              ¿Qué quieres explorar?
            </Eyebrow>
            <div className="nrm-modgrid">
              {MODOS.map((m) => (
                <button
                  key={m.id}
                  className="nrm-modbtn"
                  data-on={modo === m.id}
                  onClick={() => elegirModo(m.id)}
                  style={{ ["--nrm" as string]: accent }}
                >
                  <i className={`fa-solid ${m.icon}`} style={{ fontSize: 17, color: modo === m.id ? accent : T.text3 }} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: modo === m.id ? accent : T.text }}>{m.nombre}</span>
                </button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: T.text3, lineHeight: 1.5, marginTop: 10 }}>{modoActual.desc}</div>

            {/* Slider de la media μ */}
            <div style={{ marginTop: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: T.text2 }}>
                  <i className="fa-solid fa-arrows-left-right" style={{ marginRight: 7, color: ORO }} />
                  Media μ (centro)
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 900, color: ORO, fontFamily: "ui-monospace, monospace" }}>{fmtNum(mu, 1)} {preset.unidad}</span>
              </div>
              <input
                className="nrm-slider"
                type="range"
                min={preset.muMin}
                max={preset.muMax}
                step={(preset.muMax - preset.muMin) / 100}
                value={mu}
                onChange={(e) => cambiarMu(Number(e.target.value))}
                style={{ ["--nrm" as string]: ORO }}
              />
            </div>

            {/* Slider de la desviación σ */}
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: T.text2 }}>
                  <i className="fa-solid fa-left-right" style={{ marginRight: 7, color: AZUL }} />
                  Desviación estándar σ (ancho)
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 900, color: AZUL, fontFamily: "ui-monospace, monospace" }}>{fmtNum(sigma, 1)} {preset.unidad}</span>
              </div>
              <input
                className="nrm-slider"
                type="range"
                min={preset.sigmaMin}
                max={preset.sigmaMax}
                step={(preset.sigmaMax - preset.sigmaMin) / 100}
                value={sigma}
                onChange={(e) => cambiarSigma(Number(e.target.value))}
                style={{ ["--nrm" as string]: AZUL }}
              />
            </div>

            {/* Sliders del rango [a, b] — solo en modo probabilidad */}
            <div style={{ marginTop: 16, opacity: modo === "probabilidad" ? 1 : 0.45 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: T.text2 }}>
                  <i className="fa-solid fa-arrow-right-to-bracket" style={{ marginRight: 7, color: VERDE }} />
                  Extremo inferior a
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 900, color: VERDE, fontFamily: "ui-monospace, monospace" }}>{fmtNum(a, 1)} {preset.unidad}</span>
              </div>
              <input
                className="nrm-slider"
                type="range"
                min={preset.xMin}
                max={preset.xMax}
                step={(preset.xMax - preset.xMin) / 200}
                value={a}
                onChange={(e) => setA(Number(e.target.value))}
                disabled={modo !== "probabilidad"}
                style={{ ["--nrm" as string]: VERDE }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", margin: "12px 0 7px" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: T.text2 }}>
                  <i className="fa-solid fa-arrow-right-from-bracket" style={{ marginRight: 7, color: VERDE }} />
                  Extremo superior b
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 900, color: VERDE, fontFamily: "ui-monospace, monospace" }}>{fmtNum(b, 1)} {preset.unidad}</span>
              </div>
              <input
                className="nrm-slider"
                type="range"
                min={preset.xMin}
                max={preset.xMax}
                step={(preset.xMax - preset.xMin) / 200}
                value={b}
                onChange={(e) => setB(Number(e.target.value))}
                disabled={modo !== "probabilidad"}
                style={{ ["--nrm" as string]: VERDE }}
              />
            </div>
          </div>

          {/* Resultado en vivo */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-magnifying-glass-chart" style={{ marginRight: 8, color: accent }} />
              {preset.nombre} — N(μ = {fmtNum(mu, 1)}, σ = {fmtNum(sigma, 1)})
            </Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 12 }}>
              <Readout label="Media μ" value={`${fmtNum(mu, 1)} ${preset.unidad}`} col={ORO} size={15} />
              <Readout label="Desviación σ" value={`${fmtNum(sigma, 1)} ${preset.unidad}`} col={AZUL} size={15} />
              <Readout label="Varianza σ²" value={fmtNum(varianza, 1)} col={MAGENTA} size={15} />
            </div>

            {modo === "probabilidad" ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 12 }}>
                  <Readout label={`P(${fmtNum(Math.min(a, b), 0)} ≤ X ≤ ${fmtNum(Math.max(a, b), 0)})`} value={fmtPct(prob, 2)} col={VERDE} size={15} />
                  <Readout label="z del extremo inferior" value={fmtNum(za, 2)} col={AZUL} size={15} />
                  <Readout label="z del extremo superior" value={fmtNum(zb, 2)} col={AZUL} size={15} />
                </div>
                <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
                  El área sombreada entre <strong style={{ color: VERDE }}>{fmtNum(Math.min(a, b), 1)}</strong> y <strong style={{ color: VERDE }}>{fmtNum(Math.max(a, b), 1)} {preset.unidad}</strong> es la probabilidad de que un valor caiga en ese rango: <strong style={{ color: VERDE }}>{fmtPct(prob, 2)}</strong>. Estandarizando con z = (x−μ)/σ, ese rango va de <strong style={{ color: AZUL }}>z = {fmtNum(za, 2)}</strong> a <strong style={{ color: AZUL }}>z = {fmtNum(zb, 2)}</strong>.
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 12 }}>
                  {REGLA_EMPIRICA.map((r) => (
                    <Readout
                      key={r.k}
                      label={r.etiqueta}
                      value={`${fmtNum(r.pct, 1)} %`}
                      col={r.k === 1 ? VERDE : r.k === 2 ? AZUL : MAGENTA}
                      size={14}
                    />
                  ))}
                </div>
                <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
                  La <strong style={{ color: T.text }}>regla empírica</strong> dice que en cualquier normal, aprox. el <strong style={{ color: VERDE }}>68 %</strong> de los datos cae a una σ de la media, el <strong style={{ color: AZUL }}>95 %</strong> a dos σ y el <strong style={{ color: MAGENTA }}>99.7 %</strong> a tres σ. Aquí, μ ± 2σ = [<strong>{fmtNum(mu - 2 * sigma, 1)}</strong>, <strong>{fmtNum(mu + 2 * sigma, 1)}</strong>] {preset.unidad}.
                </div>
              </>
            )}

            {/* Bloque del contexto real — el corazón del propósito O8 */}
            <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 12, background: `rgba(${color.rgba},0.08)`, border: `1px solid rgba(${color.rgba},0.28)` }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: T.text, marginBottom: 7 }}>
                <i className="fa-solid fa-location-dot" style={{ marginRight: 7, color: accent }} />
                {preset.nombre}
              </div>
              <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>{preset.contexto}</div>
            </div>
          </div>

          {/* Catálogo de fenómenos */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-database" style={{ marginRight: 8, color: accent }} />
              Elige un fenómeno real para modelar
            </Eyebrow>
            <div className="nrm-catgrid">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  className="nrm-catbtn"
                  data-on={presetId === p.id}
                  onClick={() => elegirPreset(p.id)}
                  style={{ ["--nrm" as string]: accent }}
                >
                  <span style={{ fontSize: 13.5, fontWeight: 900, color: presetId === p.id ? accent : T.text }}>{p.nombre}</span>
                  <span style={{ fontSize: 11, color: T.text3, fontFamily: "ui-monospace, monospace" }}>μ = {p.mu} {p.unidad} · σ = {p.sigma} {p.unidad}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          <Eyebrow>Qué es la distribución normal</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            La <strong style={{ color: T.text }}>distribución normal</strong> es un modelo en forma de <strong style={{ color: accent }}>campana simétrica</strong> que aparece una y otra vez en datos reales. Queda totalmente definida por dos números: la media <strong style={{ color: ORO }}>μ</strong> (dónde está el centro) y la desviación estándar <strong style={{ color: AZUL }}>σ</strong> (qué tan ancha es). El área bajo la curva entre dos valores es la <strong style={{ color: VERDE }}>probabilidad</strong> de caer ahí.
          </div>

          <div className="nrm-divider" />

          <Eyebrow>Las ideas a leer</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Parte col={ORO} icon="fa-arrows-left-right" titulo="Media μ — tendencia central">
              μ es el centro y eje de simetría de la campana. En una normal perfecta, media = mediana = moda.
            </Parte>
            <Parte col={AZUL} icon="fa-left-right" titulo="Desviación σ — dispersión">
              σ mide qué tan esparcidos están los datos. A mayor σ, campana más ancha y baja; a menor σ, más alta y angosta.
            </Parte>
            <Parte col={VERDE} icon="fa-layer-group" titulo="Regla 68-95-99.7">
              ~68 % de los datos cae en μ±1σ, ~95 % en μ±2σ y ~99.7 % en μ±3σ. Casi todo está a tres σ del centro.
            </Parte>
            <Parte col={AZUL} icon="fa-percent" titulo="Puntuación z y probabilidad">
              z = (x−μ)/σ traduce a la normal estándar; el área bajo la curva es la probabilidad del rango.
            </Parte>
          </div>

          <div className="nrm-divider" />

          <Eyebrow>De los datos a la campana</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            Cuando medimos muchas veces algo natural —estaturas, errores, calificaciones— los valores se <strong style={{ color: T.text }}>amontonan</strong> cerca del promedio y se vuelven raros en los extremos. Esa forma de campana es la normal. Estandarizar con <strong style={{ color: AZUL }}>z</strong> permite comparar cosas distintas: un 184 cm de estatura y un 700 de PLANEA pueden ser ambos «z = 2», igual de excepcionales.
          </div>

          <div className="nrm-divider" />

          <Eyebrow>En la vida real (México)</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            La <strong>ENSANUT</strong> (INEGI/Salud) describe estaturas y pesos con campanas; <strong>PLANEA</strong> (SEP) y <strong>PISA</strong> (OCDE) escalan sus puntajes a una normal para comparar generaciones y países; las escalas de <strong>CI</strong> se diseñan normales con μ = 100 y σ = 15. La normal permite estimar qué tan común o raro es un valor y decidir con probabilidades.
          </div>
        </div>
      </div>

      {/* ── Objetivos + pista ──────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="nrm-bottom">
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
            Para el ejercicio de A2 usa el fenómeno <strong style={{ color: accent }}>estaturas</strong> con <strong>μ = 170</strong> y <strong>σ = 7</strong>. En «Regla 68-95-99.7» verás que entre <strong style={{ color: VERDE }}>163 y 177</strong> cae el 68 %; en «Probabilidad / z», lleva b a <strong>184</strong> (z = 2) y obtén P(X &lt; 184) = <strong style={{ color: AZUL }}>{fmtPct(cdfEstandar(2), 2)}</strong>. El 95 % central es μ ± 2σ = [156, 184].
          </span>
        </div>
      </div>

      {/* ── Problema guía + glosario + ideas ────────────────────────── */}
      <div style={{ ...card, padding: "20px 22px 22px", marginTop: 22 }}>
        <Eyebrow>
          <i className="fa-solid fa-flask-vial" style={{ marginRight: 8, color: accent }} />
          Problema guía — {PROBLEMA.titulo}
        </Eyebrow>
        <div style={{ fontSize: 13, color: T.text, lineHeight: 1.55, marginBottom: 12 }}>{PROBLEMA.enunciado}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {PROBLEMA.solucion.map((s, i) => (
            <div key={i} style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5, padding: "9px 12px", borderRadius: 10, background: T.inset, border: `1px solid ${T.line}` }}>{s}</div>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: "11px 14px", borderRadius: 11, background: `rgba(${color.rgba},0.08)`, border: `1px solid rgba(${color.rgba},0.28)`, fontSize: 12.5, color: T.text, lineHeight: 1.5 }}>
          <strong style={{ color: accent }}>Respuesta. </strong>{PROBLEMA.respuesta}
        </div>

        <div className="nrm-divider" />

        <Eyebrow>Ideas clave</Eyebrow>
        <ul style={{ margin: "0 0 4px", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
          {IDEAS.map((idea, i) => (
            <li key={i} style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>{idea}</li>
          ))}
        </ul>

        <div className="nrm-divider" />

        <Eyebrow>Glosario</Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {GLOSARIO.map((g) => (
            <div key={g.termino} style={{ padding: "10px 12px", borderRadius: 11, background: T.inset, border: `1px solid ${T.line}` }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: T.text, marginBottom: 3 }}>{g.termino}</div>
              <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{g.definicion}</div>
              <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.4, marginTop: 4 }}><i className="fa-solid fa-angle-right" style={{ marginRight: 5, color: accent }} />{g.ejemplo}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Tarjeta de "parte" en el panel lateral ──────────────────────────── */
function Parte({ col, icon, titulo, children }: { col: string; icon: string; titulo: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
      <div style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: col, background: `${col}1f` }}>
        <i className={`fa-solid ${icon}`} />
      </div>
      <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.5 }}>
        <strong style={{ color: T.text, display: "block", marginBottom: 2 }}>{titulo}</strong>
        {children}
      </div>
    </div>
  );
}

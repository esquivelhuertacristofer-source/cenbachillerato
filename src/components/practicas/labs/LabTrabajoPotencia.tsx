"use client";

/**
 * Laboratorio 3D — Trabajo y potencia mecánica.
 * Práctica experimental para CNEYT-II-P05-A1
 * ("Trabajo y potencia mecánica: fórmulas y contexto real").
 *
 * En física, TRABAJO (W) es la transferencia de energía cuando una fuerza
 * desplaza un objeto en la dirección de esa fuerza: W = F · d · cos θ (Joules).
 * Solo cuenta la parte de la fuerza alineada con el movimiento; si la fuerza es
 * perpendicular (θ = 90°), el trabajo es cero. La POTENCIA (P) mide qué tan
 * rápido se hace ese trabajo: P = W / t (Watts; 1 hp ≈ 746 W). El lab deja ver
 * la descomposición de la fuerza y una carrera de potencia entre dos máquinas.
 * Ciencias Naturales, Experimentales y Tecnología II (MCCEMS 2025).
 */

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import {
  type ModoKey,
  MODOS,
  getModo,
  DEFAULTS,
  trabajo,
  fuerzaUtil,
  fuerzaPerp,
  tiempo,
  wattAHp,
  fmtNum,
  W_POTENCIA,
  F_MIN, F_MAX, F_STEP, D_MIN, D_MAX, D_STEP, THETA_MIN, THETA_MAX, THETA_STEP,
  P_MIN, P_MAX, P_STEP,
} from "./trabajo-potencia-data";

const TrabajoPotenciaScene = dynamic(() => import("./TrabajoPotenciaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-gauge-high fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const UTILC = "#34D399";
const ORO = "#ffd24a";

export function LabTrabajoPotencia({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<ModoKey>("trabajo");
  const [F, setF] = useState(DEFAULTS.F);
  const [d, setD] = useState(DEFAULTS.d);
  const [theta, setTheta] = useState(DEFAULTS.theta);
  const [pA, setPA] = useState(DEFAULTS.pA);
  const [pB, setPB] = useState(DEFAULTS.pB);
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // objetivos
  const [vioTrabajo, setVioTrabajo] = useState(true);
  const [vioPotencia, setVioPotencia] = useState(false);
  const [puso90, setPuso90] = useState(false);
  const [cambioPot, setCambioPot] = useState(false);

  const md = useMemo(() => getModo(modo), [modo]);
  const esTrabajo = modo === "trabajo";

  const bump = () => setResetNonce((n) => n + 1);

  const cambiarModo = (k: ModoKey) => {
    setModo(k);
    bump();
    if (k === "trabajo") setVioTrabajo(true);
    if (k === "potencia") setVioPotencia(true);
  };

  const cambiarTheta = (v: number) => {
    setTheta(v);
    if (v >= 90) setPuso90(true);
  };
  const cambiarPA = (v: number) => { setPA(v); setCambioPot(true); };
  const cambiarPB = (v: number) => { setPB(v); setCambioPot(true); };

  const reset = () => {
    if (esTrabajo) { setF(DEFAULTS.F); setD(DEFAULTS.d); setTheta(DEFAULTS.theta); }
    else { setPA(DEFAULTS.pA); setPB(DEFAULTS.pB); }
    bump();
  };

  // cálculos en vivo
  const W = useMemo(() => trabajo(F, d, theta), [F, d, theta]);
  const Fu = useMemo(() => fuerzaUtil(F, theta), [F, theta]);
  const Fp = useMemo(() => fuerzaPerp(F, theta), [F, theta]);
  const tA = useMemo(() => tiempo(W_POTENCIA, pA), [pA]);
  const tB = useMemo(() => tiempo(W_POTENCIA, pB), [pB]);

  const objetivos = [
    { txt: "Calcula un trabajo con W = F·d·cos θ", done: vioTrabajo },
    { txt: "Pon θ = 90° y ve el trabajo en cero", done: puso90 },
    { txt: "Compara dos potencias (carrera)", done: vioPotencia },
    { txt: "Cambia una potencia y ve el tiempo", done: cambioPot },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-person-walking" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Trabajo es fuerza por distancia… en la misma dirección</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: W = F·d·cos θ. Solo la parte de la fuerza que va con el movimiento hace trabajo; la potencia (P = W/t) dice qué tan rápido se hace.
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
        .ex-range { -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:999px; outline:none;
          background:linear-gradient(90deg, var(--exc) 0%, var(--exc) var(--exfill), rgba(255,255,255,0.12) var(--exfill), rgba(255,255,255,0.12) 100%); }
        .ex-range::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:20px; height:20px; border-radius:50%;
          background:#fff; border:3px solid var(--exc); cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
        .ex-range::-moz-range-thumb { width:20px; height:20px; border-radius:50%; background:#fff; border:3px solid var(--exc); cursor:pointer; }
        .ex-seg { display:flex; gap:6px; flex-wrap:wrap; }
        .ex-segbtn { cursor:pointer; flex:1 1 0; min-width:92px; display:flex; flex-direction:column; align-items:center; gap:5px;
          padding:11px 8px; border-radius:12px; border:1px solid ${T.line}; background:${T.inset}; color:${T.text2};
          font-size:12.5px; font-weight:700; transition:all .15s; }
        .ex-segbtn:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
        .ex-segbtn[data-on="true"] { border-color:var(--exc); background:rgba(${color.rgba},0.14); color:#fff; box-shadow:0 4px 16px -8px var(--exc); }
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
              <TrabajoPotenciaScene
                modo={modo}
                F={F}
                d={d}
                theta={theta}
                pA={pA}
                pB={pB}
                accent={accent}
                pausado={pausado}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13, fontWeight: 900, color: accent }}>
                <i className={`fa-solid ${md.icono}`} style={{ marginRight: 7 }} />
                {md.nombre}
              </span>
              <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999, background: `rgba(${color.rgba},0.18)`, color: T.text2, fontFamily: "ui-monospace, monospace" }}>{md.formula}</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(2,12,28,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={!pausado} onClick={() => setPausado((p) => !p)} title={pausado ? "Reanudar" : "Pausar"}>
                <i className={`fa-solid ${pausado ? "fa-play" : "fa-pause"}`} />
              </button>
              <button className="ex-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((v) => !v)} title="Girar la cámara">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="ex-icobtn" onClick={reset} title="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Pie: descripción del modo */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(2,10,24,0.88) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#dCE8F6", lineHeight: 1.5, maxWidth: 580 }}>{md.resumen}</div>
            </div>
          </div>

          {/* Selector de modo + controles */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: accent }} />
              {esTrabajo ? "Fuerza, distancia y ángulo" : "Potencia de cada máquina"}
            </Eyebrow>
            <div className="ex-seg" style={{ marginBottom: 18 }}>
              {MODOS.map((m) => (
                <button
                  key={m.key}
                  className="ex-segbtn"
                  data-on={modo === m.key}
                  onClick={() => cambiarModo(m.key)}
                  style={{ ["--exc" as string]: accent }}
                >
                  <i className={`fa-solid ${m.icono}`} style={{ fontSize: 18, color: modo === m.key ? accent : T.text3 }} />
                  {m.nombre}
                </button>
              ))}
            </div>

            {esTrabajo ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Fuerza */}
                <Deslizador label="Fuerza aplicada (F)" icon="fa-hand-fist" colr={accent}
                  valor={`${fmtNum(F, 0)} N`} min={F_MIN} max={F_MAX} step={F_STEP} value={F}
                  onChange={setF} />
                {/* Distancia */}
                <Deslizador label="Distancia (d)" icon="fa-ruler-horizontal" colr={accent}
                  valor={`${fmtNum(d, 1)} m`} min={D_MIN} max={D_MAX} step={D_STEP} value={d}
                  onChange={setD} />
                {/* Ángulo */}
                <Deslizador label="Ángulo fuerza–movimiento (θ)" icon="fa-rotate" colr={ORO}
                  valor={`${fmtNum(theta, 0)}°`} min={THETA_MIN} max={THETA_MAX} step={THETA_STEP} value={theta}
                  onChange={cambiarTheta}
                  hintL="0° (todo cuenta)" hintR="90° (W = 0)" />
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Deslizador label="Máquina A" icon="fa-gauge-high" colr={accent}
                  valor={`${fmtNum(pA, 0)} W · ${fmtNum(wattAHp(pA), 2)} hp`} min={P_MIN} max={P_MAX} step={P_STEP} value={pA}
                  onChange={cambiarPA} />
                <Deslizador label="Máquina B" icon="fa-gauge-high" colr={ORO}
                  valor={`${fmtNum(pB, 0)} W · ${fmtNum(wattAHp(pB), 2)} hp`} min={P_MIN} max={P_MAX} step={P_STEP} value={pB}
                  onChange={cambiarPB} />
              </div>
            )}
          </div>

          {/* Resultado en vivo */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-calculator" style={{ marginRight: 8, color: accent }} />
              {esTrabajo ? "Trabajo realizado" : "¿Quién llega primero?"}
            </Eyebrow>
            {esTrabajo ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 12 }}>
                  <Readout label="Trabajo W" value={fmtNum(W, 0)} unit="J" col={accent} />
                  <Readout label="Fuerza útil F·cos θ" value={fmtNum(Fu, 0)} unit="N" col={UTILC} />
                  <Readout label="Perpendicular F·sen θ" value={fmtNum(Fp, 0)} unit="N" col={"#9fb2c8"} />
                </div>
                <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
                  W = <strong style={{ color: accent }}>{fmtNum(F, 0)}</strong> N × <strong style={{ color: accent }}>{fmtNum(d, 1)}</strong> m × cos(<strong style={{ color: ORO }}>{fmtNum(theta, 0)}°</strong>) = <strong style={{ color: accent }}>{fmtNum(W, 0)} J</strong>. La parte perpendicular (<strong style={{ color: "#9fb2c8" }}>{fmtNum(Fp, 0)} N</strong>) no aporta trabajo.
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 12 }}>
                  <Readout label="Tiempo máquina A" value={fmtNum(tA, 1)} unit="s" col={accent} />
                  <Readout label="Tiempo máquina B" value={fmtNum(tB, 1)} unit="s" col={ORO} />
                </div>
                <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
                  Las dos hacen el mismo trabajo (<strong style={{ color: T.text }}>{fmtNum(W_POTENCIA, 0)} J</strong>), pero{" "}
                  {tA < tB ? (
                    <>la <strong style={{ color: accent }}>máquina A</strong> llega primero: más potencia = menos tiempo (t = W/P).</>
                  ) : tB < tA ? (
                    <>la <strong style={{ color: ORO }}>máquina B</strong> llega primero: más potencia = menos tiempo (t = W/P).</>
                  ) : (
                    <>las dos tardan lo mismo: igual potencia, igual tiempo (t = W/P).</>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          <Eyebrow>Las dos fórmulas</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff", background: `rgba(${color.rgba},0.22)` }}>
                <i className="fa-solid fa-person-walking" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>Trabajo · W = F · d · cos θ</div>
                <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>Energía transferida al desplazar un objeto con una fuerza. Se mide en Joules (1 J = 1 N·m).</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff", background: `rgba(${color.rgba},0.22)` }}>
                <i className="fa-solid fa-gauge-high" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>Potencia · P = W / t</div>
                <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>Qué tan rápido se hace el trabajo. Se mide en Watts (1 W = 1 J/s); 1 hp ≈ 746 W.</div>
              </div>
            </div>
          </div>

          <div className="ex-divider" />

          <Eyebrow>El papel del ángulo θ</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            Solo la parte de la fuerza alineada con el movimiento hace trabajo: <strong style={{ color: UTILC }}>F·cos θ</strong>. Si empujas justo en la dirección del movimiento (<strong style={{ color: T.text }}>θ = 0°</strong>, cos 0° = 1) todo cuenta; si la fuerza es <strong style={{ color: "#9fb2c8" }}>perpendicular</strong> (θ = 90°, cos 90° = 0) el trabajo es <strong style={{ color: T.text }}>cero</strong>. Por eso cargar una mochila sin caminar no hace trabajo.
          </div>

          <div className="ex-divider" />

          <Eyebrow>Comparar máquinas</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            Un motor de <strong style={{ color: accent }}>2000 W</strong> hace el mismo trabajo que uno de <strong style={{ color: ORO }}>1000 W</strong>, pero en <strong style={{ color: T.text }}>la mitad del tiempo</strong>. Por eso las bombillas, electrodomésticos y motores se etiquetan en Watts: indican cuánta energía consumen o producen por segundo.
          </div>

          <div className="ex-divider" />

          <Eyebrow>Para pensar</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 9 }}>
            <div><i className="fa-solid fa-circle-question" style={{ marginRight: 7, color: accent }} />¿Por qué sostener un peso sin moverlo no realiza trabajo mecánico?</div>
            <div><i className="fa-solid fa-circle-question" style={{ marginRight: 7, color: accent }} />Si un motor de 500 W trabaja 10 s, ¿cuántos Joules realiza?</div>
            <div><i className="fa-solid fa-circle-question" style={{ marginRight: 7, color: accent }} />¿Dos máquinas con la misma potencia siempre hacen el mismo trabajo?</div>
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
            En <strong style={{ color: accent }}>Trabajo</strong>, mira la flecha <strong style={{ color: UTILC }}>verde</strong> (F·cos θ): es la única que llena la barra. Sube θ hacia 90° y verás cómo el trabajo cae a cero aunque la caja siga avanzando.
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Deslizador reutilizable ─────────────────────────────────────────── */
function Deslizador({ label, icon, colr, valor, min, max, step, value, onChange, hintL, hintR }: {
  label: string; icon: string; colr: string; valor: string;
  min: number; max: number; step: number; value: number; onChange: (v: number) => void;
  hintL?: string; hintR?: string;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: colr }}>
          <i className={`fa-solid ${icon}`} style={{ marginRight: 6 }} />
          {label}
        </span>
        <span style={{ fontSize: 14, fontWeight: 900, color: colr }}>{valor}</span>
      </div>
      <input type="range" className="ex-range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--exc" as string]: colr, ["--exfill" as string]: `${((value - min) / (max - min)) * 100}%` }} />
      {(hintL || hintR) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
          <span>{hintL}</span>
          <span>{hintR}</span>
        </div>
      )}
    </div>
  );
}

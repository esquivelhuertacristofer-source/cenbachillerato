"use client";

/**
 * Laboratorio 3D — Conservación de la energía: el péndulo.
 * Práctica experimental para CNEYT-II-P02-A1
 * ("Transformación, transferencia y conservación de la energía").
 *
 * "La energía no se crea ni se destruye, solo se transforma." Un péndulo lo
 * hace visible: en lo alto toda la energía es POTENCIAL (Ep = m·g·h) y v = 0;
 * en el punto más bajo toda es CINÉTICA (Ec = ½·m·v²) y v es máxima. Sin
 * fricción, Ep + Ec se mantiene constante. Con fricción, parte pasa a CALOR y
 * el péndulo se detiene: la energía cambia de forma, nunca desaparece.
 * Ciencias Naturales, Experimentales y Tecnología II (MCCEMS 2025).
 */

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import {
  PLANETAS,
  grados2rad,
  altura,
  energiaTotal,
  velocidadMax,
  periodo,
  fmtNum,
  ANG_MIN, ANG_MAX, ANG_STEP,
  LARGO_MIN, LARGO_MAX, LARGO_STEP,
  MASA_MIN, MASA_MAX, MASA_STEP,
} from "./conservacion-data";

const ConservacionScene = dynamic(() => import("./ConservacionScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-atom fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const EP_COL = "#3BA7FF";
const EC_COL = "#FFB13B";
const HEAT_COL = "#FF5A5A";

export function LabConservacion({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [planetaKey, setPlanetaKey] = useState("tierra");
  const planeta = useMemo(() => PLANETAS.find((p) => p.key === planetaKey) ?? PLANETAS[0]!, [planetaKey]);

  const [anguloDeg, setAnguloDeg] = useState(45);
  const [largo, setLargo] = useState(1.6);
  const [masa, setMasa] = useState(1.5);
  const [friccion, setFriccion] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // objetivos
  const [movioAngulo, setMovioAngulo] = useState(false);
  const [cambioGravedad, setCambioGravedad] = useState(false);
  const [vioFriccion, setVioFriccion] = useState(false);
  const [pauso, setPauso] = useState(false);

  // valores estáticos (calculados de los controles, no de la animación)
  const theta0 = grados2rad(anguloDeg);
  const hMax = altura(largo, theta0);
  const eTotal = energiaTotal(masa, planeta.g, largo, theta0);
  const vMax = velocidadMax(planeta.g, largo, theta0);
  const T_periodo = periodo(largo, planeta.g);

  const bump = () => setResetNonce((n) => n + 1);

  const cambiarPlaneta = (k: string) => { setPlanetaKey(k); setCambioGravedad(k !== "tierra" ? true : cambioGravedad); bump(); };
  const cambiarAngulo = (v: number) => { setAnguloDeg(v); setMovioAngulo(true); bump(); };
  const cambiarLargo = (v: number) => { setLargo(v); bump(); };
  const cambiarMasa = (v: number) => { setMasa(v); bump(); };
  const cambiarFriccion = (v: number) => { setFriccion(v); if (v > 0) setVioFriccion(true); };
  const togglePausa = () => { setPausado((p) => { if (!p) setPauso(true); return !p; }); };
  const reset = () => { bump(); };

  const objetivos = [
    { txt: "Suelta el péndulo desde distintos ángulos", done: movioAngulo },
    { txt: "Cambia la gravedad (otro planeta)", done: cambioGravedad },
    { txt: "Activa la fricción y observa el calor", done: vioFriccion },
    { txt: "Pausa para comparar Ep y Ec", done: pauso },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-atom" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text, ...NUM }}>Ep + Ec = constante</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: sin fricción la energía solo cambia de forma, su suma se conserva.
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
        .ex-range { -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:999px; outline:none;
          background:linear-gradient(90deg, var(--exc) 0%, var(--exc) var(--exfill), rgba(255,255,255,0.12) var(--exfill), rgba(255,255,255,0.12) 100%); }
        .ex-range::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:20px; height:20px; border-radius:50%;
          background:#fff; border:3px solid var(--exc); cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
        .ex-range::-moz-range-thumb { width:20px; height:20px; border-radius:50%; background:#fff; border:3px solid var(--exc); cursor:pointer; }
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
              <ConservacionScene
                anguloDeg={anguloDeg}
                largo={largo}
                masa={masa}
                g={planeta.g}
                friccion={friccion}
                pausado={pausado}
                accent={accent}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13.5, fontWeight: 900, color: accent, ...NUM }}>Ep + Ec = E₀</span>
            </div>

            {/* Datos del experimento */}
            <div style={{ position: "absolute", bottom: 16, left: 18, display: "flex", gap: 8, alignItems: "baseline", fontSize: 16, fontWeight: 900, pointerEvents: "none", ...NUM }}>
              <span style={{ color: T.text3, fontWeight: 700 }}>
                <i className={`fa-solid ${planeta.icono}`} style={{ marginRight: 7 }} />
                {planeta.nombre} · g = {fmtNum(planeta.g, 2)} m/s² →
              </span>
              <span style={{ color: accent }}>E₀ = {fmtNum(eTotal, 1)} J</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(2,12,28,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={!pausado} onClick={togglePausa} title={pausado ? "Reanudar" : "Pausar"}>
                <i className={`fa-solid ${pausado ? "fa-play" : "fa-pause"}`} />
              </button>
              <button className="ex-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((v) => !v)} title="Girar la cámara">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="ex-icobtn" onClick={reset} title="Reiniciar el péndulo">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* aviso de fricción */}
            {friccion > 0 && (
              <div style={{ position: "absolute", bottom: 56, left: 18, fontSize: 12.5, fontWeight: 700, color: HEAT_COL, background: "rgba(2,12,28,0.8)", padding: "6px 11px", borderRadius: 9, border: `1px solid ${HEAT_COL}55` }}>
                <i className="fa-solid fa-fire" style={{ marginRight: 7 }} />
                Con fricción la energía mecánica se disipa como calor.
              </div>
            )}
          </div>

          {/* Controles del experimento */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: accent }} />
              Condiciones del experimento
            </Eyebrow>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, marginBottom: 16 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: accent }}>Ángulo inicial</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: accent, ...NUM }}>{anguloDeg}°</span>
                </div>
                <input type="range" className="ex-range" min={ANG_MIN} max={ANG_MAX} step={ANG_STEP} value={anguloDeg}
                  onChange={(e) => cambiarAngulo(Number(e.target.value))}
                  style={{ ["--exc" as string]: accent, ["--exfill" as string]: `${((anguloDeg - ANG_MIN) / (ANG_MAX - ANG_MIN)) * 100}%` }} />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: EP_COL }}>Largo del hilo</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: EP_COL, ...NUM }}>{fmtNum(largo, 1)} m</span>
                </div>
                <input type="range" className="ex-range" min={LARGO_MIN} max={LARGO_MAX} step={LARGO_STEP} value={largo}
                  onChange={(e) => cambiarLargo(Number(e.target.value))}
                  style={{ ["--exc" as string]: EP_COL, ["--exfill" as string]: `${((largo - LARGO_MIN) / (LARGO_MAX - LARGO_MIN)) * 100}%` }} />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: EC_COL }}>Masa</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: EC_COL, ...NUM }}>{fmtNum(masa, 1)} kg</span>
                </div>
                <input type="range" className="ex-range" min={MASA_MIN} max={MASA_MAX} step={MASA_STEP} value={masa}
                  onChange={(e) => cambiarMasa(Number(e.target.value))}
                  style={{ ["--exc" as string]: EC_COL, ["--exfill" as string]: `${((masa - MASA_MIN) / (MASA_MAX - MASA_MIN)) * 100}%` }} />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: HEAT_COL }}>
                    <i className="fa-solid fa-fire" style={{ marginRight: 6 }} />
                    Fricción
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: HEAT_COL, ...NUM }}>{Math.round(friccion * 100)}%</span>
                </div>
                <input type="range" className="ex-range" min={0} max={1} step={0.01} value={friccion}
                  onChange={(e) => cambiarFriccion(Number(e.target.value))}
                  style={{ ["--exc" as string]: HEAT_COL, ["--exfill" as string]: `${friccion * 100}%` }} />
              </div>
            </div>

            {/* lecturas */}
            <div style={{ display: "flex", flexWrap: "wrap", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}`, overflow: "hidden" }}>
              <div style={{ flex: "1 1 0", minWidth: 96 }}>
                <Readout label="Altura máx." value={fmtNum(hMax, 2)} unit="m" col={accent} size={15} />
              </div>
              <div style={{ flex: "1 1 0", minWidth: 96, borderLeft: `1px solid ${T.line}` }}>
                <Readout label="Energía E₀" value={fmtNum(eTotal, 1)} unit="J" col={EP_COL} size={15} />
              </div>
              <div style={{ flex: "1 1 0", minWidth: 96, borderLeft: `1px solid ${T.line}` }}>
                <Readout label="Rapidez máx." value={fmtNum(vMax, 2)} unit="m/s" col={EC_COL} size={15} />
              </div>
              <div style={{ flex: "1 1 0", minWidth: 96, borderLeft: `1px solid ${T.line}` }}>
                <Readout label="Periodo" value={fmtNum(T_periodo, 2)} unit="s" col={T.text} size={15} />
              </div>
            </div>
          </div>

          {/* Por qué funciona */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>Por qué se conserva</Eyebrow>
            <div style={{ fontSize: 13.5, color: T.text2, lineHeight: 1.55, marginBottom: 12 }}>
              Al soltar el péndulo desde lo alto, toda su energía es <strong style={{ color: EP_COL }}>potencial</strong> (Ep = m·g·h) y no se mueve. Al caer, esa energía se transforma en <strong style={{ color: EC_COL }}>cinética</strong> (Ec = ½·m·v²): abajo la rapidez es máxima. Sube de nuevo y la cinética vuelve a ser potencial. <strong style={{ color: T.text }}>Sin fricción, Ep + Ec es siempre la misma.</strong>
            </div>
            <div style={{ borderRadius: 12, border: `1px solid ${accent}44`, background: `rgba(${color.rgba},0.08)`, padding: "11px 14px" }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: T.text3, marginBottom: 5 }}>LA LEY</div>
              <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.5 }}>
                La energía no se crea ni se destruye, solo se transforma. Con fricción no se pierde: pasa a <strong style={{ color: HEAT_COL }}>calor</strong>.
              </div>
              <div style={{ marginTop: 9, fontSize: 16, fontWeight: 900, color: accent, ...NUM }}>Ep + Ec + Calor = E₀</div>
            </div>
          </div>
        </div>

        {/* ── Columna controles ──────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          <Eyebrow>Gravedad (planeta)</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {PLANETAS.map((p) => {
              const on = p.key === planetaKey;
              return (
                <button key={p.key} className="ex-esc" data-on={on} onClick={() => cambiarPlaneta(p.key)}>
                  <i className={`fa-solid ${p.icono}`} style={{ fontSize: 16, width: 20, textAlign: "center", color: on ? accent : T.text3 }} />
                  <span style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>{p.nombre}</span>
                    <span style={{ fontSize: 11.5, color: T.text3, ...NUM }}>g = {fmtNum(p.g, 2)} m/s²</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="ex-divider" />

          <Eyebrow>Las fórmulas</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 6, ...NUM }}>
            <div><strong style={{ color: EP_COL }}>Ep</strong> = m · g · h</div>
            <div><strong style={{ color: EC_COL }}>Ec</strong> = ½ · m · v²</div>
            <div>h = L · (1 − cos θ)</div>
            <div>v<sub>máx</sub> = √(2 · g · h)</div>
          </div>

          <div className="ex-divider" />

          <Eyebrow>Para pensar</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 9 }}>
            <div><i className="fa-solid fa-circle-question" style={{ marginRight: 7, color: accent }} />¿La masa cambia la rapidez máxima? Cámbiala y observa v<sub>máx</sub>.</div>
            <div><i className="fa-solid fa-circle-question" style={{ marginRight: 7, color: accent }} />En la Luna, ¿el péndulo va más lento o más rápido? ¿Por qué?</div>
            <div><i className="fa-solid fa-circle-question" style={{ marginRight: 7, color: accent }} />Con fricción, ¿a dónde se fue la energía? No se perdió.</div>
          </div>

          <div style={{ marginTop: 14, fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
            <i className="fa-solid fa-circle-info" style={{ marginRight: 7, color: accent }} />
            <strong style={{ color: accent }}>Pausa</strong> el péndulo en cualquier punto para comparar las barras de <strong style={{ color: EP_COL }}>Ep</strong> y <strong style={{ color: EC_COL }}>Ec</strong>.
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
            Fíjate: cambiar la <strong style={{ color: EC_COL }}>masa</strong> no cambia la <strong style={{ color: T.text }}>rapidez máxima</strong> (v depende solo de g y h), pero sí cambia la <strong style={{ color: EP_COL }}>energía</strong>. La gravedad sí cambia ambas.
          </span>
        </div>
      </div>
    </div>
  );
}

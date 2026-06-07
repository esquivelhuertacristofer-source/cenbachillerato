"use client";

/**
 * Laboratorio 3D — Gas ideal y primera ley de la termodinámica.
 * Práctica experimental para CNEYT-II-P09-A1
 * ("Gas ideal y primera ley de la termodinámica").
 *
 * Un gas encerrado en un cilindro con pistón es un sistema cerrado. Su estado se
 * describe con P, V, T y n, relacionados por PV = nRT. El lab hace visible de
 * dónde sale la presión: las partículas chocan contra las paredes y el pistón.
 * Sube T y se mueven más rápido (↑P); baja V y chocan más seguido (↑P); mete más
 * gas (↑n) y hay más choques (↑P). La energía interna U = 3/2·n·R·T y la primera
 * ley ΔU = Q − W cierran la idea: la energía solo cambia de forma o se transfiere.
 * Ciencias Naturales, Experimentales y Tecnología II (MCCEMS 2025).
 */

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import {
  presion,
  energiaInterna,
  kelvinACelsius,
  fmtNum,
  R_GAS,
  T_MIN, T_MAX, T_STEP,
  V_MIN, V_MAX, V_STEP,
  N_MIN, N_MAX, N_STEP,
} from "./gas-ideal-data";

const GasIdealScene = dynamic(() => import("./GasIdealScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-wind fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const T_COL = "#FF7A45"; // temperatura → cálido
const V_COL = "#3BA7FF"; // volumen → azul
const N_COL = "#34D399"; // cantidad → verde

export function LabGasIdeal({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [temp, setTemp] = useState(300); // K
  const [volumen, setVolumen] = useState(10); // L
  const [moles, setMoles] = useState(1.0); // mol
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // objetivos
  const [subioTemp, setSubioTemp] = useState(false);
  const [comprimio, setComprimio] = useState(false);
  const [cambioMoles, setCambioMoles] = useState(false);
  const [pauso, setPauso] = useState(false);

  // valores de estado (calculados de los controles)
  const P = useMemo(() => presion(moles, temp, volumen), [moles, temp, volumen]);
  const U = useMemo(() => energiaInterna(moles, temp), [moles, temp]);
  const tC = useMemo(() => kelvinACelsius(temp), [temp]);
  const pAtm = P / 101.325; // kPa → atm

  const bump = () => setResetNonce((n) => n + 1);

  const cambiarTemp = (v: number) => { setTemp(v); if (v > 300) setSubioTemp(true); };
  const cambiarVolumen = (v: number) => { setVolumen(v); if (v < 10) setComprimio(true); };
  const cambiarMoles = (v: number) => { setMoles(v); if (v !== 1.0) setCambioMoles(true); };
  const togglePausa = () => { setPausado((p) => { if (!p) setPauso(true); return !p; }); };
  const reset = () => { setTemp(300); setVolumen(10); setMoles(1.0); bump(); };

  const objetivos = [
    { txt: "Calienta el gas y observa la presión", done: subioTemp },
    { txt: "Comprime (baja el volumen)", done: comprimio },
    { txt: "Cambia la cantidad de gas (n)", done: cambioMoles },
    { txt: "Pausa para contar los choques", done: pauso },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-wind" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text, ...NUM }}>P · V = n · R · T</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: la presión nace de los choques de las partículas; más temperatura o menos volumen significan más presión.
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
              <GasIdealScene
                temp={temp}
                volumen={volumen}
                moles={moles}
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
              <span style={{ fontSize: 13.5, fontWeight: 900, color: accent, ...NUM }}>PV = nRT</span>
            </div>

            {/* Estado del gas */}
            <div style={{ position: "absolute", bottom: 16, left: 18, display: "flex", gap: 8, alignItems: "baseline", fontSize: 16, fontWeight: 900, pointerEvents: "none", ...NUM }}>
              <span style={{ color: accent }}>P = {fmtNum(P, 0)} kPa</span>
              <span style={{ color: T.text3, fontWeight: 700 }}>({fmtNum(pAtm, 2)} atm)</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(2,12,28,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={!pausado} onClick={togglePausa} title={pausado ? "Reanudar" : "Pausar"}>
                <i className={`fa-solid ${pausado ? "fa-play" : "fa-pause"}`} />
              </button>
              <button className="ex-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((v) => !v)} title="Girar la cámara">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="ex-icobtn" onClick={reset} title="Reiniciar el gas">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>
          </div>

          {/* Controles del experimento */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: accent }} />
              Variables de estado del gas
            </Eyebrow>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 22, marginBottom: 16 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: T_COL }}>
                    <i className="fa-solid fa-temperature-half" style={{ marginRight: 6 }} />
                    Temperatura
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: T_COL, ...NUM }}>{temp} K</span>
                </div>
                <input type="range" className="ex-range" min={T_MIN} max={T_MAX} step={T_STEP} value={temp}
                  onChange={(e) => cambiarTemp(Number(e.target.value))}
                  style={{ ["--exc" as string]: T_COL, ["--exfill" as string]: `${((temp - T_MIN) / (T_MAX - T_MIN)) * 100}%` }} />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: V_COL }}>
                    <i className="fa-solid fa-down-left-and-up-right-to-center" style={{ marginRight: 6 }} />
                    Volumen
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: V_COL, ...NUM }}>{fmtNum(volumen, 1)} L</span>
                </div>
                <input type="range" className="ex-range" min={V_MIN} max={V_MAX} step={V_STEP} value={volumen}
                  onChange={(e) => cambiarVolumen(Number(e.target.value))}
                  style={{ ["--exc" as string]: V_COL, ["--exfill" as string]: `${((volumen - V_MIN) / (V_MAX - V_MIN)) * 100}%` }} />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: N_COL }}>
                    <i className="fa-solid fa-atom" style={{ marginRight: 6 }} />
                    Cantidad (n)
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: N_COL, ...NUM }}>{fmtNum(moles, 1)} mol</span>
                </div>
                <input type="range" className="ex-range" min={N_MIN} max={N_MAX} step={N_STEP} value={moles}
                  onChange={(e) => cambiarMoles(Number(e.target.value))}
                  style={{ ["--exc" as string]: N_COL, ["--exfill" as string]: `${((moles - N_MIN) / (N_MAX - N_MIN)) * 100}%` }} />
              </div>
            </div>

            {/* lecturas */}
            <div style={{ display: "flex", flexWrap: "wrap", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}`, overflow: "hidden" }}>
              <div style={{ flex: "1 1 0", minWidth: 96 }}>
                <Readout label="Presión" value={fmtNum(P, 0)} unit="kPa" col={accent} size={15} />
              </div>
              <div style={{ flex: "1 1 0", minWidth: 96, borderLeft: `1px solid ${T.line}` }}>
                <Readout label="Volumen" value={fmtNum(volumen, 1)} unit="L" col={V_COL} size={15} />
              </div>
              <div style={{ flex: "1 1 0", minWidth: 96, borderLeft: `1px solid ${T.line}` }}>
                <Readout label="Temperatura" value={fmtNum(tC, 0)} unit="°C" col={T_COL} size={15} />
              </div>
              <div style={{ flex: "1 1 0", minWidth: 96, borderLeft: `1px solid ${T.line}` }}>
                <Readout label="Energía interna" value={fmtNum(U, 0)} unit="J" col={N_COL} size={15} />
              </div>
            </div>
          </div>

          {/* Por qué funciona */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>De dónde sale la presión</Eyebrow>
            <div style={{ fontSize: 13.5, color: T.text2, lineHeight: 1.55, marginBottom: 12 }}>
              La <strong style={{ color: accent }}>presión</strong> es el resultado de millones de choques de las partículas contra las paredes. Si subes la <strong style={{ color: T_COL }}>temperatura</strong>, se mueven más rápido y golpean con más fuerza. Si bajas el <strong style={{ color: V_COL }}>volumen</strong>, el mismo gas choca más seguido. Si metes más <strong style={{ color: N_COL }}>gas</strong> (n), hay más partículas chocando. Todo se resume en una sola ecuación.
            </div>
            <div style={{ borderRadius: 12, border: `1px solid ${accent}44`, background: `rgba(${color.rgba},0.08)`, padding: "11px 14px" }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: T.text3, marginBottom: 5 }}>PRIMERA LEY DE LA TERMODINÁMICA</div>
              <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.5 }}>
                La energía interna del gas solo cambia por el <strong style={{ color: T_COL }}>calor</strong> que entra (Q) menos el <strong style={{ color: V_COL }}>trabajo</strong> que hace al expandirse (W). La energía no se crea ni se destruye.
              </div>
              <div style={{ marginTop: 9, fontSize: 16, fontWeight: 900, color: accent, ...NUM }}>ΔU = Q − W</div>
            </div>
          </div>
        </div>

        {/* ── Columna controles ──────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          <Eyebrow>La ecuación de estado</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 6, ...NUM }}>
            <div style={{ fontSize: 17, fontWeight: 900, color: accent }}>P · V = n · R · T</div>
            <div><strong style={{ color: accent }}>P</strong> = presión (kPa)</div>
            <div><strong style={{ color: V_COL }}>V</strong> = volumen (L)</div>
            <div><strong style={{ color: N_COL }}>n</strong> = cantidad (mol)</div>
            <div><strong style={{ color: T_COL }}>T</strong> = temperatura (K)</div>
            <div>R = {fmtNum(R_GAS, 3)} J/mol·K</div>
          </div>

          <div className="ex-divider" />

          <Eyebrow>El gas ideal</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            Un modelo donde las partículas no interactúan (salvo en choques) y su volumen propio es despreciable. Describe bien a los gases reales a <strong style={{ color: T.text }}>baja presión y alta temperatura</strong>.
          </div>

          <div className="ex-divider" />

          <Eyebrow>Para pensar</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 9 }}>
            <div><i className="fa-solid fa-circle-question" style={{ marginRight: 7, color: accent }} />Si duplicas la temperatura (en K) sin cambiar V ni n, ¿qué pasa con P?</div>
            <div><i className="fa-solid fa-circle-question" style={{ marginRight: 7, color: accent }} />Comprime a la mitad el volumen: ¿la presión sube al doble?</div>
            <div><i className="fa-solid fa-circle-question" style={{ marginRight: 7, color: accent }} />¿Por qué la temperatura va en kelvin y no en °C?</div>
          </div>

          <div style={{ marginTop: 14, fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
            <i className="fa-solid fa-circle-info" style={{ marginRight: 7, color: accent }} />
            <strong style={{ color: accent }}>Pausa</strong> el gas para ver las partículas detenidas y comparar cuántas hay y qué tan apretadas están.
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
            Fíjate: P, V y T están <strong style={{ color: T.text }}>amarradas</strong>. No puedes cambiar una sin que las otras (o la presión) respondan. Eso es lo que dice <strong style={{ color: accent }}>PV = nRT</strong>.
          </span>
        </div>
      </div>
    </div>
  );
}

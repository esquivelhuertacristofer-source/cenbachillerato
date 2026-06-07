"use client";

/**
 * Laboratorio 3D — Máquinas térmicas: motores y refrigeradores.
 * Práctica experimental para CNEYT-II-P03-A1
 * ("Introducción a la termodinámica: leyes y aplicaciones").
 *
 * La primera ley es la conservación de la energía aplicada al calor (ΔU = Q − W).
 * Un motor de calor toma calor de un foco caliente, convierte una parte en
 * trabajo y forzosamente tira el resto a un foco frío: por la segunda ley nunca
 * es 100% eficiente (η = 1 − T_f/T_c). Un refrigerador es el mismo proceso al
 * revés: gasta trabajo para mover calor de frío a caliente, contra su flujo
 * natural (COP = Q_f/W). El lab deja ver ambos como uno el reverso del otro.
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
  balanceMotor,
  balanceRefrigerador,
  eficienciaCarnot,
  copRefrigerador,
  kelvinACelsius,
  fmtNum,
  T_CAL_MIN, T_CAL_MAX, T_FRIO_MIN, T_FRIO_MAX, T_STEP, T_GAP_MIN,
} from "./maquina-termica-data";

const MaquinaTermicaScene = dynamic(() => import("./MaquinaTermicaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-gears fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const CAL = "#ff8a5a";
const FRIO = "#5BC8FF";

export function LabMaquinaTermica({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [modo, setModo] = useState<ModoKey>("motor");
  const [tCal, setTCal] = useState(DEFAULTS.motor.tCal);
  const [tFrio, setTFrio] = useState(DEFAULTS.motor.tFrio);
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // objetivos
  const [vioMotor, setVioMotor] = useState(true); // arranca en motor
  const [vioRefri, setVioRefri] = useState(false);
  const [subioTCal, setSubioTCal] = useState(false);
  const [acercoFocos, setAcercoFocos] = useState(false);

  const md = useMemo(() => getModo(modo), [modo]);
  const esMotor = modo === "motor";

  const bump = () => setResetNonce((n) => n + 1);

  const cambiarModo = (k: ModoKey) => {
    setModo(k);
    setTCal(DEFAULTS[k].tCal);
    setTFrio(DEFAULTS[k].tFrio);
    bump();
    if (k === "motor") setVioMotor(true);
    if (k === "refrigerador") setVioRefri(true);
  };

  // El foco frío nunca puede igualar o superar al caliente (holgura T_GAP_MIN).
  const cambiarTCal = (k: number) => {
    const v = Math.max(T_CAL_MIN, Math.min(T_CAL_MAX, k));
    setTCal(v);
    if (tFrio > v - T_GAP_MIN) setTFrio(v - T_GAP_MIN);
    if (esMotor && v > DEFAULTS.motor.tCal) setSubioTCal(true);
    if (v - tFrio <= 40) setAcercoFocos(true);
  };
  const cambiarTFrio = (k: number) => {
    const v = Math.max(T_FRIO_MIN, Math.min(tCal - T_GAP_MIN, k));
    setTFrio(v);
    if (tCal - v <= 40) setAcercoFocos(true);
  };

  const reset = () => {
    setTCal(DEFAULTS[modo].tCal);
    setTFrio(DEFAULTS[modo].tFrio);
    bump();
  };

  // Balances energéticos en vivo
  const eta = useMemo(() => eficienciaCarnot(tCal, tFrio), [tCal, tFrio]);
  const cop = useMemo(() => copRefrigerador(tCal, tFrio), [tCal, tFrio]);
  const bMotor = useMemo(() => balanceMotor(tCal, tFrio), [tCal, tFrio]);
  const bRefri = useMemo(() => balanceRefrigerador(tCal, tFrio), [tCal, tFrio]);

  const objetivos = [
    { txt: "Observa un motor de calor", done: vioMotor },
    { txt: "Invierte el ciclo: refrigerador", done: vioRefri },
    { txt: "Sube T caliente y ve subir η", done: subioTCal },
    { txt: "Acerca los focos y ve caer el rendimiento", done: acercoFocos },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-gears" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Ninguna máquina aprovecha todo el calor</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: un motor toma calor del foco caliente, convierte una parte en trabajo y tira el resto al frío. La segunda ley pone el techo: η = 1 − T_f/T_c.
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
              <MaquinaTermicaScene
                modo={modo}
                tCal={tCal}
                tFrio={tFrio}
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
              <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 999, background: `rgba(${color.rgba},0.18)`, color: T.text2 }}>{md.ley}</span>
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
              <i className="fa-solid fa-toggle-on" style={{ marginRight: 8, color: accent }} />
              Tipo de máquina
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

            {/* Deslizador foco caliente */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: CAL }}>
                  <i className="fa-solid fa-fire" style={{ marginRight: 6 }} />
                  {esMotor ? "Foco caliente (combustión)" : "Exterior (caliente)"}
                </span>
                <span style={{ fontSize: 14, fontWeight: 900, color: CAL }}>{fmtNum(tCal, 0)} K · {fmtNum(kelvinACelsius(tCal), 0)} °C</span>
              </div>
              <input type="range" className="ex-range" min={T_CAL_MIN} max={T_CAL_MAX} step={T_STEP} value={tCal}
                onChange={(e) => cambiarTCal(Number(e.target.value))}
                style={{ ["--exc" as string]: CAL, ["--exfill" as string]: `${((tCal - T_CAL_MIN) / (T_CAL_MAX - T_CAL_MIN)) * 100}%` }} />
            </div>

            {/* Deslizador foco frío */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: FRIO }}>
                  <i className="fa-solid fa-snowflake" style={{ marginRight: 6 }} />
                  {esMotor ? "Foco frío (ambiente)" : "Interior (frío)"}
                </span>
                <span style={{ fontSize: 14, fontWeight: 900, color: FRIO }}>{fmtNum(tFrio, 0)} K · {fmtNum(kelvinACelsius(tFrio), 0)} °C</span>
              </div>
              <input type="range" className="ex-range" min={T_FRIO_MIN} max={T_FRIO_MAX} step={T_STEP} value={tFrio}
                onChange={(e) => cambiarTFrio(Number(e.target.value))}
                style={{ ["--exc" as string]: FRIO, ["--exfill" as string]: `${((tFrio - T_FRIO_MIN) / (T_FRIO_MAX - T_FRIO_MIN)) * 100}%` }} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: T.text3 }}>
                <span>El frío nunca alcanza al caliente</span>
                <span>holgura {T_GAP_MIN} K</span>
              </div>
            </div>
          </div>

          {/* Balance de energía en vivo */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-scale-balanced" style={{ marginRight: 8, color: accent }} />
              Balance de energía (1.ª ley)
            </Eyebrow>
            {esMotor ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 12 }}>
                  <Readout label="Eficiencia η" value={fmtNum(eta * 100, 0)} unit="%" col={accent} />
                  <Readout label="Calor entra" value={fmtNum(bMotor.qCal, 0)} unit="J" col={CAL} />
                  <Readout label="Trabajo útil" value={fmtNum(bMotor.W, 0)} unit="J" col={OK} />
                  <Readout label="Calor desecho" value={fmtNum(bMotor.Qf, 0)} unit="J" col={FRIO} />
                </div>
                <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
                  De cada <strong style={{ color: CAL }}>{fmtNum(bMotor.qCal, 0)} J</strong> que entran, solo <strong style={{ color: OK }}>{fmtNum(bMotor.W, 0)} J</strong> se vuelven trabajo; los otros <strong style={{ color: FRIO }}>{fmtNum(bMotor.Qf, 0)} J</strong> se tiran al foco frío. La 2.ª ley lo exige.
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 12 }}>
                  <Readout label="COP" value={fmtNum(cop, 1)} col={accent} />
                  <Readout label="Trabajo W" value={fmtNum(bRefri.w, 0)} unit="J" col={"#ffd24a"} />
                  <Readout label="Calor extraído" value={fmtNum(bRefri.Qf, 0)} unit="J" col={FRIO} />
                  <Readout label="Calor expulsado" value={fmtNum(bRefri.Qc, 0)} unit="J" col={CAL} />
                </div>
                <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
                  Con <strong style={{ color: "#ffd24a" }}>{fmtNum(bRefri.w, 0)} J</strong> de trabajo se sacan <strong style={{ color: FRIO }}>{fmtNum(bRefri.Qf, 0)} J</strong> del interior frío y se expulsan <strong style={{ color: CAL }}>{fmtNum(bRefri.Qc, 0)} J</strong> afuera. El COP baja cuando afuera hace más calor.
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          <Eyebrow>Las leyes en juego</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: "#fff", background: `rgba(${color.rgba},0.22)` }}>1</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>Primera ley · ΔU = Q − W</div>
                <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>La energía se conserva: el calor que entra se reparte entre energía interna y trabajo. Nada se crea ni se pierde.</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: "#fff", background: `rgba(${color.rgba},0.22)` }}>2</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>Segunda ley · el límite</div>
                <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>El calor fluye solo de caliente a frío. Por eso ningún motor es 100% eficiente y un refri necesita gastar trabajo para ir al revés.</div>
              </div>
            </div>
          </div>

          <div className="ex-divider" />

          <Eyebrow>Eficiencia de Carnot</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            La eficiencia máxima posible de un motor depende <strong style={{ color: T.text }}>solo de las temperaturas</strong>: <strong style={{ color: accent }}>η = 1 − T_f / T_c</strong>. Sube el foco caliente o baja el frío y η crece; pero como T_f nunca llega a 0 K, η <strong style={{ color: FRIO }}>nunca llega a 100%</strong>.
          </div>

          <div className="ex-divider" />

          <Eyebrow>El refrigerador (COP)</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            Un refri mueve calor de adentro (frío) hacia afuera (caliente), en <strong style={{ color: T.text }}>contra</strong> de su flujo natural. Eso cuesta trabajo eléctrico. Su rendimiento es <strong style={{ color: accent }}>COP = Q_f / W = T_f / (T_c − T_f)</strong>: entre más parecidas las temperaturas, más rinde; en un día de calor afuera, rinde menos.
          </div>

          <div className="ex-divider" />

          <Eyebrow>Para pensar</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 9 }}>
            <div><i className="fa-solid fa-circle-question" style={{ marginRight: 7, color: accent }} />¿Por qué ningún motor puede convertir todo el calor en trabajo?</div>
            <div><i className="fa-solid fa-circle-question" style={{ marginRight: 7, color: accent }} />¿Por qué un refrigerador calienta la cocina en lugar de enfriarla?</div>
            <div><i className="fa-solid fa-circle-question" style={{ marginRight: 7, color: accent }} />¿Qué le pasa al COP cuando sube la temperatura exterior?</div>
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
            Fíjate en los <strong style={{ color: accent }}>chorros de partículas</strong>: en el motor, el de <strong style={{ color: OK }}>trabajo</strong> que sube nunca es tan grueso como el de <strong style={{ color: CAL }}>calor</strong> que entró. En el refrigerador, todo va al <strong style={{ color: T.text }}>revés</strong> y empujado desde arriba.
          </span>
        </div>
      </div>
    </div>
  );
}

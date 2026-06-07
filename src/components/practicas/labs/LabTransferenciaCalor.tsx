"use client";

/**
 * Laboratorio 3D — Calor, temperatura y mecanismos de transferencia.
 * Práctica experimental para CNEYT-II-P04-A1
 * ("Calor, temperatura y mecanismos de transferencia").
 *
 * La temperatura mide el movimiento promedio de las partículas; el calor es
 * energía en tránsito que fluye del cuerpo caliente al frío hasta el equilibrio
 * térmico. Esa energía viaja por tres caminos: conducción (contacto, partícula a
 * partícula), convección (el fluido caliente sube y el frío baja) y radiación
 * (ondas que cruzan incluso el vacío). El lab los hace visibles uno por uno y
 * deja comparar conductores y aislantes.
 * Ciencias Naturales, Experimentales y Tecnología II (MCCEMS 2025).
 */

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import {
  type MecanismoKey,
  MECANISMOS,
  getMecanismo,
  MATERIALES,
  getMaterial,
  celsiusAKelvin,
  celsiusAFahrenheit,
  fmtNum,
  T_FUENTE_MIN, T_FUENTE_MAX, T_FUENTE_STEP,
} from "./transferencia-calor-data";

const TransferenciaCalorScene = dynamic(() => import("./TransferenciaCalorScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-fire fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const FUEGO = "#FF7A45";

export function LabTransferenciaCalor({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [mecanismo, setMecanismo] = useState<MecanismoKey>("conduccion");
  const [materialKey, setMaterialKey] = useState("cobre");
  const [tFuente, setTFuente] = useState(250); // °C
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // objetivos
  const [vioConduccion, setVioConduccion] = useState(false);
  const [vioConveccion, setVioConveccion] = useState(false);
  const [vioRadiacion, setVioRadiacion] = useState(false);
  const [comparoMaterial, setComparoMaterial] = useState(false);

  const mec = useMemo(() => getMecanismo(mecanismo), [mecanismo]);
  const mat = useMemo(() => getMaterial(materialKey), [materialKey]);
  const tK = useMemo(() => celsiusAKelvin(tFuente), [tFuente]);
  const tF = useMemo(() => celsiusAFahrenheit(tFuente), [tFuente]);

  const bump = () => setResetNonce((n) => n + 1);

  const cambiarMecanismo = (k: MecanismoKey) => {
    setMecanismo(k);
    if (k === "conduccion") setVioConduccion(true);
    if (k === "conveccion") setVioConveccion(true);
    if (k === "radiacion") setVioRadiacion(true);
  };
  const cambiarMaterial = (k: string) => {
    setMaterialKey(k);
    if (k !== "cobre") setComparoMaterial(true);
  };
  const reset = () => { setTFuente(250); bump(); };

  const objetivos = [
    { txt: "Observa la conducción en la barra", done: vioConduccion },
    { txt: "Mira cómo circula el fluido (convección)", done: vioConveccion },
    { txt: "Comprueba la radiación en el vacío", done: vioRadiacion },
    { txt: "Compara un metal con un aislante", done: comparoMaterial },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-fire" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>El calor siempre viaja de lo caliente a lo frío</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: la energía se transfiere por conducción (contacto), convección (el fluido que circula) y radiación (ondas que cruzan el vacío).
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
        .ex-matbtn { cursor:pointer; flex:1 1 0; min-width:70px; display:flex; flex-direction:column; align-items:center; gap:3px;
          padding:9px 6px; border-radius:10px; border:1px solid ${T.line}; background:${T.inset}; color:${T.text2};
          font-size:11.5px; font-weight:700; transition:all .15s; }
        .ex-matbtn[data-on="true"] { border-color:var(--exc); background:rgba(${color.rgba},0.14); color:#fff; }
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
              <TransferenciaCalorScene
                mecanismo={mecanismo}
                materialKey={materialKey}
                tFuente={tFuente}
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
                <i className={`fa-solid ${mec.icono}`} style={{ marginRight: 7 }} />
                {mec.nombre}
              </span>
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

            {/* Pie: descripción del mecanismo */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(2,10,24,0.88) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#dCE8F6", lineHeight: 1.5, maxWidth: 560 }}>{mec.resumen}</div>
            </div>
          </div>

          {/* Selector de mecanismo + controles */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-route" style={{ marginRight: 8, color: accent }} />
              Mecanismo de transferencia
            </Eyebrow>
            <div className="ex-seg" style={{ marginBottom: 18 }}>
              {MECANISMOS.map((m) => (
                <button
                  key={m.key}
                  className="ex-segbtn"
                  data-on={mecanismo === m.key}
                  onClick={() => cambiarMecanismo(m.key)}
                  style={{ ["--exc" as string]: accent }}
                >
                  <i className={`fa-solid ${m.icono}`} style={{ fontSize: 18, color: mecanismo === m.key ? accent : T.text3 }} />
                  {m.nombre}
                </button>
              ))}
            </div>

            {/* Material (solo conducción) */}
            {mecanismo === "conduccion" && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.text2, marginBottom: 8 }}>
                  <i className="fa-solid fa-cubes-stacked" style={{ marginRight: 7, color: accent }} />
                  Material de la barra
                </div>
                <div className="ex-seg">
                  {MATERIALES.map((m) => (
                    <button
                      key={m.key}
                      className="ex-matbtn"
                      data-on={materialKey === m.key}
                      onClick={() => cambiarMaterial(m.key)}
                      style={{ ["--exc" as string]: accent }}
                    >
                      <span>{m.nombre}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, color: m.conductor ? OK : "#9fb6d6" }}>
                        {m.conductor ? "conductor" : "aislante"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Temperatura de la fuente */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: FUEGO }}>
                  <i className="fa-solid fa-fire-flame-curved" style={{ marginRight: 6 }} />
                  Temperatura de la fuente
                </span>
                <span style={{ fontSize: 14, fontWeight: 900, color: FUEGO, ...NUM }}>{tFuente} °C</span>
              </div>
              <input type="range" className="ex-range" min={T_FUENTE_MIN} max={T_FUENTE_MAX} step={T_FUENTE_STEP} value={tFuente}
                onChange={(e) => setTFuente(Number(e.target.value))}
                style={{ ["--exc" as string]: FUEGO, ["--exfill" as string]: `${((tFuente - T_FUENTE_MIN) / (T_FUENTE_MAX - T_FUENTE_MIN)) * 100}%` }} />
            </div>

            {/* lecturas: escalas de temperatura */}
            <div style={{ display: "flex", flexWrap: "wrap", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}`, overflow: "hidden", marginTop: 16 }}>
              <div style={{ flex: "1 1 0", minWidth: 92 }}>
                <Readout label="Celsius" value={fmtNum(tFuente, 0)} unit="°C" col={FUEGO} size={15} />
              </div>
              <div style={{ flex: "1 1 0", minWidth: 92, borderLeft: `1px solid ${T.line}` }}>
                <Readout label="Kelvin" value={fmtNum(tK, 0)} unit="K" col={accent} size={15} />
              </div>
              <div style={{ flex: "1 1 0", minWidth: 92, borderLeft: `1px solid ${T.line}` }}>
                <Readout label="Fahrenheit" value={fmtNum(tF, 0)} unit="°F" col="#9fb6d6" size={15} />
              </div>
              {mecanismo === "conduccion" && (
                <div style={{ flex: "1 1 0", minWidth: 92, borderLeft: `1px solid ${T.line}` }}>
                  <Readout label="Conductividad" value={fmtNum(mat.k, mat.k < 1 ? 2 : 0)} unit="W/m·K" col={mat.conductor ? OK : "#9fb6d6"} size={15} />
                </div>
              )}
            </div>
          </div>

          {/* Por qué funciona */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>Calor y temperatura no son lo mismo</Eyebrow>
            <div style={{ fontSize: 13.5, color: T.text2, lineHeight: 1.55, marginBottom: 12 }}>
              La <strong style={{ color: accent }}>temperatura</strong> mide qué tan rápido se mueven las partículas en promedio. El <strong style={{ color: FUEGO }}>calor</strong> es energía en tránsito: fluye <strong style={{ color: T.text }}>siempre</strong> del cuerpo más caliente al más frío, hasta que ambos quedan a la misma temperatura (equilibrio térmico).
            </div>
            <div style={{ borderRadius: 12, border: `1px solid ${accent}44`, background: `rgba(${color.rgba},0.08)`, padding: "11px 14px" }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: T.text3, marginBottom: 5 }}>EN ESTE MECANISMO</div>
              <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.5 }}>
                <i className="fa-solid fa-circle-info" style={{ marginRight: 7, color: accent }} />
                {mec.necesitaMedio}
              </div>
              <div style={{ marginTop: 8, fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
                <i className="fa-solid fa-lightbulb" style={{ marginRight: 7, color: FUEGO }} />
                {mec.ejemplo}
              </div>
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          <Eyebrow>Los tres mecanismos</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {MECANISMOS.map((m) => (
              <div key={m.key} style={{ display: "flex", gap: 11, alignItems: "flex-start", opacity: mecanismo === m.key ? 1 : 0.62 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: mecanismo === m.key ? "#fff" : accent, background: mecanismo === m.key ? accent : `rgba(${color.rgba},0.14)` }}>
                  <i className={`fa-solid ${m.icono}`} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{m.nombre}</div>
                  <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>{m.necesitaMedio}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="ex-divider" />

          <Eyebrow>El cero absoluto</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            La escala <strong style={{ color: accent }}>Kelvin</strong> empieza en el <strong style={{ color: T.text }}>cero absoluto</strong> (−273.15 °C): el punto donde las partículas tendrían el mínimo movimiento posible. No existe una temperatura más baja.
          </div>

          <div className="ex-divider" />

          <Eyebrow>Para pensar</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 9 }}>
            <div><i className="fa-solid fa-circle-question" style={{ marginRight: 7, color: accent }} />¿Por qué el mango de metal de una olla quema y el de madera no?</div>
            <div><i className="fa-solid fa-circle-question" style={{ marginRight: 7, color: accent }} />Si el espacio es vacío, ¿cómo nos llega el calor del Sol?</div>
            <div><i className="fa-solid fa-circle-question" style={{ marginRight: 7, color: accent }} />¿Por qué el aire caliente de un cuarto se va hacia arriba?</div>
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
            En conducción, cambia de <strong style={{ color: OK }}>cobre</strong> a <strong style={{ color: T.text }}>madera</strong>: con el aislante el calor casi no avanza. Esa es la diferencia entre un <strong style={{ color: accent }}>conductor</strong> y un <strong style={{ color: accent }}>aislante</strong>.
          </span>
        </div>
      </div>
    </div>
  );
}

"use client";

/**
 * Laboratorio 3D — Fotosíntesis: la fábrica de vida del planeta.
 * Práctica experimental para CNEYT-III-P03-A1 (progresión 3).
 *
 * Un cloroplasto 3D recibe los reactivos (luz, CO₂, H₂O) y emite los productos
 * (glucosa y O₂) de la ecuación 6CO₂ + 6H₂O + luz → C₆H₁₂O₆ + 6O₂. El alumno
 * mueve la intensidad luminosa, la concentración de CO₂ y la temperatura, y ve
 * cómo cambia la TASA fotosintética: cada factor satura y siempre hay uno que
 * LIMITA el proceso (factor limitante). El caudal de partículas en cada chorro
 * es proporcional a su factor, así la idea se ve, no solo se calcula.
 * Ciencias Naturales, Experimentales y Tecnología III — Ecosistemas (MCCEMS 2025).
 */

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import {
  FASES,
  TIPOS_PLANTA,
  tasaPct,
  factorLuz,
  factorCO2,
  factorTemp,
  factorLimitante,
  ETIQUETA_FACTOR,
  fmtPct,
  LUZ_MIN, LUZ_MAX, LUZ_STEP, LUZ_DEFAULT,
  CO2_MIN, CO2_MAX, CO2_STEP, CO2_DEFAULT,
  TEMP_MIN, TEMP_MAX, TEMP_STEP, TEMP_DEFAULT, TEMP_OPT,
} from "./fotosintesis-data";

const FotosintesisScene = dynamic(() => import("./FotosintesisScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-leaf fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const VERDE = "#34D399";
const SOL = "#ffd24a";
const AZUL = "#7fb2ff";

export function LabFotosintesis({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [luz, setLuz] = useState(LUZ_DEFAULT);
  const [co2, setCo2] = useState(CO2_DEFAULT);
  const [temp, setTemp] = useState(TEMP_DEFAULT);
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // objetivos
  const [vioProceso] = useState(true);
  const [movioLuz, setMovioLuz] = useState(false);
  const [movioCO2, setMovioCO2] = useState(false);
  const [movioTemp, setMovioTemp] = useState(false);

  const bump = () => setResetNonce((n) => n + 1);
  const cambiarLuz = (v: number) => { setLuz(v); setMovioLuz(true); };
  const cambiarCO2 = (v: number) => { setCo2(v); setMovioCO2(true); };
  const cambiarTemp = (v: number) => { setTemp(v); setMovioTemp(true); };
  const reset = () => { setLuz(LUZ_DEFAULT); setCo2(CO2_DEFAULT); setTemp(TEMP_DEFAULT); bump(); };

  const tPct = useMemo(() => tasaPct(luz, co2, temp), [luz, co2, temp]);
  const fl = useMemo(() => factorLuz(luz) * 100, [luz]);
  const fc = useMemo(() => factorCO2(co2) * 100, [co2]);
  const ft = useMemo(() => factorTemp(temp) * 100, [temp]);
  const limit = useMemo(() => factorLimitante(luz, co2, temp), [luz, co2, temp]);

  const objetivos = [
    { txt: "Observa el cloroplasto y la ecuación", done: vioProceso },
    { txt: "Sube y baja la luz (mira la saturación)", done: movioLuz },
    { txt: "Cambia la concentración de CO₂", done: movioCO2 },
    { txt: "Busca la temperatura óptima", done: movioTemp },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: VERDE, boxShadow: `0 10px 30px -6px ${VERDE}` }}>
        <i className="fa-solid fa-leaf" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>La planta convierte luz en glucosa</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 400, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: 6 CO₂ + 6 H₂O + luz → C₆H₁₂O₆ + 6 O₂. La velocidad del proceso depende de la luz, el CO₂ y la temperatura.
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
        .ex-chip { cursor:pointer; padding:8px 14px; border-radius:999px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; font-size:12.5px; font-weight:800; transition:all .15s; }
        .ex-chip:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
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
              background: `radial-gradient(120% 80% at 30% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#08221a 0%,#03100a 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <FotosintesisScene
                luz={luz}
                co2={co2}
                temp={temp}
                accent={accent}
                pausado={pausado}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO — tasa */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${VERDE}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${VERDE}aa`, width: 9, height: 9, borderRadius: "50%", background: VERDE }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 15, fontWeight: 900, color: VERDE, fontFamily: "ui-monospace, monospace" }}>
                <i className="fa-solid fa-gauge-high" style={{ marginRight: 8 }} />
                tasa {fmtPct(tPct)}
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

            {/* Pie: ecuación + factor limitante */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(2,10,24,0.9) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 14, color: "#eaf6ee", fontFamily: "ui-monospace, monospace", fontWeight: 800, letterSpacing: "0.01em" }}>
                <span style={{ color: AZUL }}>6 CO₂</span> + <span style={{ color: "#67e8f9" }}>6 H₂O</span> + <span style={{ color: SOL }}>luz</span> → <span style={{ color: "#ffb454" }}>C₆H₁₂O₆</span> + <span style={{ color: "#e8f4ff" }}>6 O₂</span>
              </div>
              <div style={{ fontSize: 12.5, color: "#cfe0d6", lineHeight: 1.5, marginTop: 6 }}>
                Ahora mismo, lo que más limita la tasa es <strong style={{ color: SOL }}>{ETIQUETA_FACTOR[limit]}</strong>: súbelo y verás acelerar el proceso.
              </div>
            </div>
          </div>

          {/* Controles */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: accent }} />
              Ajusta los factores
            </Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Deslizador label="Intensidad luminosa" icon="fa-sun" colr={SOL}
                valor={`${luz}%`} min={LUZ_MIN} max={LUZ_MAX} step={LUZ_STEP} value={luz} onChange={cambiarLuz}
                hintL="oscuridad" hintR="pleno sol" />
              <Deslizador label="Concentración de CO₂" icon="fa-wind" colr={AZUL}
                valor={`${co2}%`} min={CO2_MIN} max={CO2_MAX} step={CO2_STEP} value={co2} onChange={cambiarCO2}
                hintL="poco CO₂" hintR="mucho CO₂" />
              <Deslizador label="Temperatura" icon="fa-temperature-half" colr={VERDE}
                valor={`${temp} °C`} min={TEMP_MIN} max={TEMP_MAX} step={TEMP_STEP} value={temp} onChange={cambiarTemp}
                hintL="frío" hintR={`óptimo ~${TEMP_OPT} °C`} />
            </div>
          </div>

          {/* Resultado en vivo — factores y tasa */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-chart-simple" style={{ marginRight: 8, color: accent }} />
              ¿Qué tan rápido va la fotosíntesis?
            </Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 14 }}>
              <Readout label="Factor luz" value={fmtPct(fl)} col={SOL} size={15} />
              <Readout label="Factor CO₂" value={fmtPct(fc)} col={AZUL} size={15} />
              <Readout label="Factor temp." value={fmtPct(ft)} col={VERDE} size={15} />
              <Readout label="Tasa total" value={fmtPct(tPct)} col={accent} size={16} />
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
              La tasa total es el producto de los tres factores: si <strong>uno</strong> está bajo, frena a todos los demás (ley del <strong>factor limitante</strong>). Por eso, en un invernadero con mucha luz pero poco CO₂, agregar CO₂ —no más luz— es lo que acelera el crecimiento. La luz y el CO₂ <strong style={{ color: SOL }}>saturan</strong> (pasado cierto punto, más ya casi no ayuda) y la temperatura tiene un <strong style={{ color: VERDE }}>óptimo</strong>: si te pasas, las enzimas del ciclo de Calvin se vuelven menos eficientes.
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          <Eyebrow>El proceso en dos fases</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {FASES.map((f) => (
              <div key={f.key} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: f.color, background: `${f.color}1f` }}>
                  <i className={`fa-solid ${f.key === "luz" ? "fa-bolt" : "fa-arrows-spin"}`} />
                </div>
                <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>
                  <strong style={{ color: f.color }}>{f.nombre}</strong> <span style={{ color: T.text3 }}>({f.lugar})</span> — {f.resumen}
                </div>
              </div>
            ))}
          </div>

          <div className="ex-divider" />

          <Eyebrow>¿Por qué las plantas son verdes?</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            La <strong style={{ color: VERDE }}>clorofila</strong> absorbe la luz <strong style={{ color: "#ff6b6b" }}>roja</strong> y la <strong style={{ color: AZUL }}>azul-violeta</strong> para impulsar la fotosíntesis, pero <strong>refleja la verde</strong>: por eso la vemos verde. El <strong>O₂</strong> que respiramos no sale del CO₂, sino de romper el agua (<strong>fotólisis</strong>).
          </div>

          <div className="ex-divider" />

          <Eyebrow>Tres estrategias de planta</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {TIPOS_PLANTA.map((tp) => (
              <div key={tp.tipo} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>
                <strong style={{ color: T.text }}>Plantas {tp.tipo}</strong> <span style={{ color: T.text3 }}>({tp.ejemplo})</span>: {tp.ventaja}.
              </div>
            ))}
          </div>

          <div className="ex-divider" />

          <Eyebrow>En México: la milpa</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            La <strong style={{ color: VERDE }}>milpa</strong> (maíz, frijol y calabaza juntos) aprovecha al máximo la luz por metro cuadrado: el maíz capta la luz directa, el frijol trepa a niveles medios y la calabaza cubre el suelo con la luz difusa. Biodiversidad agrícola al servicio de una fotosíntesis eficiente (UNAM, 2022).
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
            Baja la luz casi a cero: el cloroplasto casi deja de emitir O₂ y glucosa. Súbela poco a poco y verás que llega un punto donde más luz ya no acelera nada: ahí el <strong style={{ color: AZUL }}>CO₂</strong> o la <strong style={{ color: VERDE }}>temperatura</strong> pasaron a ser el factor limitante.
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
        <span style={{ fontSize: 14, fontWeight: 900, color: colr, fontFamily: "ui-monospace, monospace" }}>{valor}</span>
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

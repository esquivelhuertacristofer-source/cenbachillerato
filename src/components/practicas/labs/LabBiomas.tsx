"use client";

/**
 * Laboratorio 3D — Biomas y ecosistemas: clima → vida.
 * Práctica experimental para CNEYT-III-P01-A1 (infografía; progresión 1).
 *
 * El alumno mueve la temperatura media anual y la precipitación y descubre qué
 * BIOMA emerge —tipo diagrama de Whittaker— sobre un diorama 3D que se
 * transforma (selva, desierto, bosque templado, pastizal, manglar, tundra),
 * anclado a ejemplos reales de México: el país megadiverso con 12 de los 14
 * biomas terrestres, su fauna emblemática y su estado de conservación.
 * Ecosistemas, interacciones y energía — biomas y biodiversidad (MCCEMS 2025).
 */

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import {
  BIOMAS, BIOMAS_LISTA, ESCENARIOS, CIFRAS_MX, DATOS_MX, biomaDe,
  TEMP_MIN, TEMP_MAX, TEMP_STEP, TEMP_DEFAULT,
  PRECIP_MIN, PRECIP_MAX, PRECIP_STEP, PRECIP_DEFAULT,
  fmt0, type BiomaKey,
} from "./biomas-data";

const BiomasScene = dynamic(() => import("./BiomasScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-seedling fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Sembrando el bioma…</span>
    </div>
  ),
});

const AZUL = "#3aa0ff";

export function LabBiomas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [temp, setTemp] = useState(TEMP_DEFAULT);
  const [precip, setPrecip] = useState(PRECIP_DEFAULT);
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // objetivos: descubrir biomas distintos
  const [vistos, setVistos] = useState<Record<string, boolean>>({});

  const bump = () => setResetNonce((n) => n + 1);

  const bioma = useMemo(() => BIOMAS[biomaDe(temp, precip)], [temp, precip]);

  // registra el bioma actual como "visto"
  if (!vistos[bioma.key]) setVistos((v) => ({ ...v, [bioma.key]: true }));
  const nVistos = Object.keys(vistos).length;

  const cargar = (t: number, p: number) => { setTemp(t); setPrecip(p); bump(); };
  const reset = () => cargar(TEMP_DEFAULT, PRECIP_DEFAULT);

  // ── diagrama de Whittaker: malla coloreada por biomaDe ──
  const COLS = 28, ROWS = 20;
  const celdas = useMemo(() => {
    const out: { x: number; y: number; w: number; h: number; col: string }[] = [];
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        const t = TEMP_MIN + ((c + 0.5) / COLS) * (TEMP_MAX - TEMP_MIN);
        const p = PRECIP_MIN + ((r + 0.5) / ROWS) * (PRECIP_MAX - PRECIP_MIN);
        out.push({
          x: (c / COLS) * 100,
          y: 100 - ((r + 1) / ROWS) * 100, // precip crece hacia arriba
          w: 100 / COLS + 0.4,
          h: 100 / ROWS + 0.4,
          col: BIOMAS[biomaDe(t, p)].colorVeg,
        });
      }
    }
    return out;
  }, []);
  const markX = ((temp - TEMP_MIN) / (TEMP_MAX - TEMP_MIN)) * 100;
  const markY = 100 - ((precip - PRECIP_MIN) / (PRECIP_MAX - PRECIP_MIN)) * 100;

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-seedling" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>El clima dibuja la vida</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 410, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar el diorama en 3D, pero la idea sigue: la temperatura y la lluvia de un lugar deciden qué bioma se forma —selva, desierto, bosque o manglar— y qué seres vivos lo habitan. Usa el diagrama de la derecha para explorarlo.
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes exPulseB { 0%,100%{ box-shadow:0 0 0 0 var(--exc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ex-live-dot { animation: exPulseB 1.6s ease-in-out infinite; }
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
        .ex-chip { cursor:pointer; padding:8px 12px; border-radius:12px; border:1px solid ${T.line}; background:${T.inset};
          color:${T.text2}; font-size:12px; font-weight:800; transition:all .15s; text-align:left; }
        .ex-chip:hover { border-color:rgba(${color.rgba},0.5); color:#fff; }
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
              background: `radial-gradient(120% 80% at 30% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#0a2236 0%,#06182c 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <BiomasScene
                temp={temp} precip={precip}
                accent={accent}
                pausado={pausado}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO — bioma actual */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${bioma.colorVeg}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${bioma.colorVeg}aa`, width: 9, height: 9, borderRadius: "50%", background: bioma.colorVeg }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13.5, fontWeight: 900, color: bioma.colorVeg }}>
                <i className={`fa-solid ${bioma.icono}`} style={{ marginRight: 7 }} />
                {bioma.nombre}
              </span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(2,12,28,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={!pausado} onClick={() => setPausado((p) => !p)} title={pausado ? "Reanudar" : "Pausar"}>
                <i className={`fa-solid ${pausado ? "fa-play" : "fa-pause"}`} />
              </button>
              <button className="ex-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((vv) => !vv)} title="Girar la cámara">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="ex-icobtn" onClick={reset} title="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Pie: clima → bioma */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(2,10,24,0.9) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 13.5, color: "#eaf6ee", fontWeight: 800 }}>
                <i className="fa-solid fa-temperature-half" style={{ color: accent, marginRight: 6 }} />
                {fmt0(temp)} °C ·
                <i className="fa-solid fa-cloud-showers-heavy" style={{ color: AZUL, margin: "0 6px 0 10px" }} />
                {fmt0(precip)} mm/año
              </div>
              <div style={{ fontSize: 12.5, color: "#cfe0d6", lineHeight: 1.5, marginTop: 6 }}>{bioma.resumen}</div>
            </div>
          </div>

          {/* Controles */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: accent }} />
              El clima del lugar
            </Eyebrow>
            <div style={{ display: "grid", gap: 16 }}>
              <Deslizador label="Temperatura media anual" icon="fa-temperature-half" colr={accent}
                valor={`${fmt0(temp)} °C`} min={TEMP_MIN} max={TEMP_MAX} step={TEMP_STEP} value={temp}
                onChange={setTemp} hintL={`${TEMP_MIN}° (frío)`} hintR={`${TEMP_MAX}° (cálido)`} />
              <Deslizador label="Precipitación anual" icon="fa-cloud-showers-heavy" colr={AZUL}
                valor={`${fmt0(precip)} mm`} min={PRECIP_MIN} max={PRECIP_MAX} step={PRECIP_STEP} value={precip}
                onChange={setPrecip} hintL="0 mm (árido)" hintR={`${fmt0(PRECIP_MAX)} mm (muy húmedo)`} />
            </div>

            {/* escenarios */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
              {ESCENARIOS.map((e) => (
                <button key={e.label} className="ex-chip" title={e.desc}
                  onClick={() => cargar(e.temp, e.precip)}
                  style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <i className={`fa-solid ${e.icono}`} style={{ color: accent }} />
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          {/* Diagrama de Whittaker */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-chart-area" style={{ marginRight: 8, color: accent }} />
              Diagrama de Whittaker — clima decide el bioma
            </Eyebrow>
            <div style={{ display: "flex", gap: 16, alignItems: "stretch", flexWrap: "wrap" }}>
              <div style={{ position: "relative", flex: "1 1 320px", minWidth: 280 }}>
                {/* eje Y */}
                <div style={{ position: "absolute", left: -6, top: 0, bottom: 22, display: "flex", alignItems: "center", writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: 10.5, color: T.text3, fontWeight: 700 }}>
                  Precipitación (mm/año) →
                </div>
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: 230, borderRadius: 10, marginLeft: 16, border: `1px solid ${T.line}`, display: "block" }}>
                  {celdas.map((c, i) => (
                    <rect key={i} x={c.x} y={c.y} width={c.w} height={c.h} fill={c.col} opacity={0.9} />
                  ))}
                  {/* marcador del punto actual */}
                  <circle cx={markX} cy={markY} r={3.4} fill="#ffffff" stroke="#0a0a0a" strokeWidth={1.1} />
                  <circle cx={markX} cy={markY} r={6.2} fill="none" stroke="#ffffff" strokeWidth={1} opacity={0.7} />
                </svg>
                <div style={{ marginLeft: 16, marginTop: 4, fontSize: 10.5, color: T.text3, fontWeight: 700, textAlign: "center" }}>
                  Temperatura media anual (°C) →
                </div>
              </div>
              {/* leyenda */}
              <div style={{ flex: "0 0 auto", display: "grid", gap: 6, alignContent: "start" }}>
                {BIOMAS_LISTA.map((b) => {
                  const activo = b.key === bioma.key;
                  return (
                    <div key={b.key} style={{ display: "flex", alignItems: "center", gap: 8, opacity: activo ? 1 : 0.62, fontWeight: activo ? 800 : 500 }}>
                      <span style={{ width: 12, height: 12, borderRadius: 3, background: b.colorVeg, border: activo ? "2px solid #fff" : "none", flexShrink: 0 }} />
                      <span style={{ fontSize: 11.5, color: activo ? "#fff" : T.text2 }}>{b.nombre.split(" (")[0]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* México megadiverso */}
          <div style={{ ...card, padding: "20px 22px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-earth-americas" style={{ marginRight: 8, color: accent }} />
              México megadiverso
            </Eyebrow>
            <div style={{ display: "grid", gap: 12 }}>
              {CIFRAS_MX.map((cf, i) => (
                <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: accent, background: `rgba(${color.rgba},0.16)`, flexShrink: 0 }}>
                    <i className={`fa-solid ${cf.icono}`} />
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{cf.valor}</div>
                    <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.4 }}>{cf.texto}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detalle del bioma actual */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid ${bioma.colorVeg}55`, background: `${bioma.colorVeg}12` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#fff", background: bioma.colorVeg }}>
                <i className={`fa-solid ${bioma.icono}`} />
              </div>
              <span style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>{bioma.nombre}</span>
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5, marginBottom: 12 }}>{bioma.resumen}</div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: bioma.colorVeg, marginBottom: 6 }}>EN MÉXICO</div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5, marginBottom: 12 }}>{bioma.ejemploMx}</div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: bioma.colorVeg, marginBottom: 6 }}>ESPECIES REPRESENTATIVAS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
              {bioma.especies.map((sp, i) => (
                <span key={i} style={{ fontSize: 11, fontWeight: 700, color: "#eaf2fb", padding: "4px 9px", borderRadius: 999, background: "rgba(255,255,255,0.08)", border: `1px solid ${T.line}` }}>{sp}</span>
              ))}
            </div>
            <div style={{ fontSize: 12, color: T.text, lineHeight: 1.5, padding: "10px 12px", borderRadius: 10, background: "rgba(2,12,28,0.4)", border: `1px solid ${T.line}` }}>
              <i className="fa-solid fa-circle-info" style={{ color: bioma.colorVeg, marginRight: 7 }} />
              {bioma.dato}
            </div>
          </div>

          {/* Megadiversidad y conservación */}
          <div style={{ ...card, padding: "20px 22px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-shield-halved" style={{ marginRight: 8, color: accent }} />
              Megadiversidad y conservación
            </Eyebrow>
            <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 9 }}>
              {DATOS_MX.map((d, i) => (
                <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Lecturas + objetivos ───────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="ex-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-gauge-high" style={{ marginRight: 8, color: accent }} />
            Lectura del bioma
          </Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            <Readout label="Temperatura" value={fmt0(temp)} unit="°C" col={accent} size={18} />
            <Readout label="Precipitación" value={fmt0(precip)} unit="mm" col={AZUL} size={18} />
            <Readout label="Vegetación" value={`${fmt0(bioma.densidad * 100)}`} unit="% densidad" col={bioma.colorVeg} size={16} />
            <Readout label="Biomas vistos" value={`${nVistos}`} unit="/ 7" col={OK} size={18} />
          </div>
        </div>

        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
            Reto: encuentra los 7 biomas
          </Eyebrow>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {BIOMAS_LISTA.map((b) => {
              const done = !!vistos[b.key as BiomaKey];
              return (
                <span key={b.key} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: done ? 800 : 500, color: done ? OK : T.text3, padding: "5px 10px", borderRadius: 999, border: `1px solid ${done ? `${OK}55` : T.line}`, background: done ? `${OK}14` : "transparent" }}>
                  <i className={`fa-solid ${done ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 12, opacity: done ? 1 : 0.4 }} />
                  {b.nombre.split(" (")[0]}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* nota de honestidad del modelo */}
      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          Modelo cualitativo con fines didácticos: los umbrales de temperatura y precipitación siguen el esquema clásico de Whittaker para mostrar la <strong>relación clima→bioma</strong>, no para clasificar un sitio con precisión. El manglar, además, depende de ser costa salobre (agua salada poco profunda) y no solo del clima; aquí se aproxima en el extremo cálido y muy húmedo. Datos de México verbatim: CONABIO 2023, CONAFOR 2020 y SEMARNAT 2022.
        </span>
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

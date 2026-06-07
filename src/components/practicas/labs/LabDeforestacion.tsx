"use client";

/**
 * Laboratorio 3D — Deforestación y sus efectos.
 * Práctica experimental para CNEYT-III-P06-A1 (lectura; progresión 6).
 *
 * El alumno ajusta la COBERTURA FORESTAL de un predio (y un esfuerzo de
 * RESTAURACIÓN) y elige la CAUSA de la deforestación (ganadería 55 %,
 * roza-tumba-quema 28 %, tala ilegal 17 % — CONAFOR 2023). En 3D los árboles se
 * vuelven tocones, del área talada se eleva humo/CO₂, la fauna desaparece y el
 * suelo se erosiona. Los servicios ecosistémicos (carbono, biodiversidad, agua,
 * suelo) caen a la vez y se hace visible la TRAMPA DE SINERGIAS.
 * Deterioro ambiental — escalas local, regional y global (MCCEMS 2025).
 */

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import {
  CAUSAS, EFECTOS, ESCENARIOS, REGIONES, SINERGIA, SOLUCIONES, CIFRAS_MX, IDEAS,
  causaDe, coberturaEfectiva, co2Liberado, riesgoIncendio,
  COB_MIN, COB_MAX, COB_STEP, COB_DEFAULT,
  REF_MIN, REF_MAX, REF_STEP, REF_DEFAULT,
  fmt0, type CausaKey,
} from "./deforestacion-data";

const DeforestacionScene = dynamic(() => import("./DeforestacionScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-tree fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Sembrando el bosque…</span>
    </div>
  ),
});

const ROJO = "#f97316";

export function LabDeforestacion({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [cobertura, setCobertura] = useState(COB_DEFAULT);
  const [restauracion, setRestauracion] = useState(REF_DEFAULT);
  const [causa, setCausa] = useState<CausaKey>("ganaderia");
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  const bump = () => setResetNonce((n) => n + 1);

  const cobEf = useMemo(() => coberturaEfectiva(cobertura, restauracion), [cobertura, restauracion]);
  const causaInfo = causaDe(causa);
  const co2 = co2Liberado(cobEf);
  const riesgo = riesgoIncendio(cobEf);

  const aplicar = (e: (typeof ESCENARIOS)[number]) => {
    setCobertura(e.cobertura); setRestauracion(e.restauracion); setCausa(e.causa); bump();
  };
  const reset = () => { setCobertura(COB_DEFAULT); setRestauracion(REF_DEFAULT); setCausa("ganaderia"); bump(); };

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-tree" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Un bosque es mucho más que árboles</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 410, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar el predio en 3D, pero la idea sigue: al deforestar caen a la vez el carbono fijado, la biodiversidad, la regulación del agua y la sujeción del suelo. México pierde ~92,000 ha de bosque y selva al año. Usa los controles y las lecturas para explorarlo.
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes exPulseD { 0%,100%{ box-shadow:0 0 0 0 var(--exc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ex-live-dot { animation: exPulseD 1.6s ease-in-out infinite; }
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
              background: `radial-gradient(120% 80% at 30% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#0a2618 0%,#06140f 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <DeforestacionScene
                cobertura={cobertura} restauracion={restauracion} causa={causa}
                accent={accent}
                pausado={pausado}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO — cobertura efectiva */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,16,10,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13.5, fontWeight: 900, color: accent }}>
                <i className="fa-solid fa-tree" style={{ marginRight: 7 }} />
                Cobertura {fmt0(cobEf)}%
              </span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(2,16,10,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
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

            {/* Pie: causa y CO₂ */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(2,12,8,0.92) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 13.5, color: "#eaf6ee", fontWeight: 800 }}>
                <i className={`fa-solid ${causaInfo.icono}`} style={{ color: causaInfo.color, marginRight: 6 }} />
                {causaInfo.nombre} ({causaInfo.porcentaje}%) ·
                <i className="fa-solid fa-smog" style={{ color: ROJO, margin: "0 6px 0 10px" }} />
                CO₂ liberado {fmt0(co2)}%
              </div>
              <div style={{ fontSize: 12.5, color: "#cfe0d6", lineHeight: 1.5, marginTop: 6 }}>
                {cobEf >= 99
                  ? "Bosque intacto: carbono, biodiversidad, agua y suelo al máximo."
                  : `Al perder ${fmt0(100 - cobEf)}% de cobertura, los servicios del bosque caen y se libera el carbono almacenado.`}
              </div>
            </div>
          </div>

          {/* Controles */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: accent }} />
              El predio forestal
            </Eyebrow>
            <div style={{ display: "grid", gap: 16 }}>
              <Deslizador label="Cobertura forestal" icon="fa-tree" colr={accent}
                valor={`${fmt0(cobertura)} %`} min={COB_MIN} max={COB_MAX} step={COB_STEP} value={cobertura}
                onChange={setCobertura} hintL="0% (todo talado)" hintR="100% (intacto)" />
              <Deslizador label="Restauración del área perdida" icon="fa-seedling" colr={OK}
                valor={`${fmt0(restauracion)} %`} min={REF_MIN} max={REF_MAX} step={REF_STEP} value={restauracion}
                onChange={setRestauracion} hintL="0% (sin reforestar)" hintR="100% (recuperado)" />
            </div>

            {/* selector de causa */}
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px" }}>CAUSA DE LA DEFORESTACIÓN</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {CAUSAS.map((c) => (
                <button key={c.key} className="ex-chip" data-on={c.key === causa} title={c.descripcion}
                  onClick={() => setCausa(c.key)}
                  style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <i className={`fa-solid ${c.icono}`} style={{ color: c.color }} />
                  {c.nombre} <span style={{ color: T.text3, fontWeight: 700 }}>{c.porcentaje}%</span>
                </button>
              ))}
            </div>

            {/* escenarios guiados */}
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, margin: "16px 0 8px" }}>ESCENARIOS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ESCENARIOS.map((e) => (
                <button key={e.label} className="ex-chip" title={e.desc}
                  onClick={() => aplicar(e)}
                  style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <i className={`fa-solid ${e.icono}`} style={{ color: accent }} />
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          {/* Servicios ecosistémicos — barras */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-chart-simple" style={{ marginRight: 8, color: accent }} />
              Servicios ecosistémicos
            </Eyebrow>
            <div style={{ display: "grid", gap: 10 }}>
              {EFECTOS.map((ef) => {
                const v = ef.calc(cobEf);
                return (
                  <div key={ef.key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 146, flexShrink: 0, textAlign: "right" }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: ef.color }}>
                        <i className={`fa-solid ${ef.icono}`} style={{ marginRight: 6 }} />{ef.nombre}
                      </div>
                      <div style={{ fontSize: 10.5, color: T.text3 }}>{ef.bueno ? "servicio" : "daño"}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ height: 24, borderRadius: 7, display: "flex", alignItems: "center", paddingLeft: 10, color: "#04121f", fontWeight: 900, fontSize: 11.5, fontFamily: "ui-monospace, monospace", width: `${Math.max(7, v)}%`, minWidth: 52, background: `linear-gradient(90deg, ${ef.color}, ${ef.color}bb)`, boxShadow: `0 0 14px -4px ${ef.color}`, transition: "width .25s ease" }}>
                        {fmt0(v)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, border: `1px dashed ${ROJO}66`, background: `${ROJO}10` }}>
              <i className="fa-solid fa-fire" style={{ color: ROJO, fontSize: 14 }} />
              <span style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.4 }}>
                <strong style={{ color: ROJO }}>Riesgo de incendio {fmt0(riesgo)}%</strong> — la pérdida de bosque y el calentamiento se retroalimentan: es la <strong>trampa de sinergias</strong>.
              </span>
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Causa actual */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid rgba(${color.rgba},0.4)`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#fff", background: causaInfo.color }}>
                <i className={`fa-solid ${causaInfo.icono}`} />
              </div>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>{causaInfo.nombre}</div>
                <div style={{ fontSize: 11.5, color: accent, fontWeight: 800 }}>{causaInfo.porcentaje}% de la deforestación nacional · {causaInfo.reemplazo}</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: T.text, lineHeight: 1.5, padding: "10px 12px", borderRadius: 10, background: "rgba(2,16,10,0.4)", border: `1px solid ${T.line}` }}>
              <i className="fa-solid fa-circle-info" style={{ color: accent, marginRight: 7 }} />
              {causaInfo.descripcion}
            </div>
          </div>

          {/* Trampa de sinergias */}
          <div style={{ ...card, padding: "20px 22px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-arrows-spin" style={{ marginRight: 8, color: ROJO }} />
              Trampa de sinergias
            </Eyebrow>
            <div style={{ display: "grid", gap: 9 }}>
              {SINERGIA.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: ROJO, background: `${ROJO}1c`, flexShrink: 0 }}>
                    <i className={`fa-solid ${s.icono}`} />
                  </div>
                  <span style={{ fontSize: 11.8, color: T.text2, lineHeight: 1.4 }}>{s.texto}</span>
                  {i < SINERGIA.length - 1 && <i className="fa-solid fa-arrow-down" style={{ fontSize: 9, color: T.text3, marginLeft: "auto" }} />}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: T.text3, fontStyle: "italic", lineHeight: 1.4 }}>
              …y el ciclo se repite, cada vez más fuerte.
            </div>
          </div>

          {/* Soluciones */}
          <div style={{ ...card, padding: "20px 22px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-hand-holding-heart" style={{ marginRight: 8, color: OK }} />
              Cómo revertirlo
            </Eyebrow>
            <div style={{ display: "grid", gap: 11 }}>
              {SOLUCIONES.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: OK, background: `${OK}1c`, flexShrink: 0 }}>
                    <i className={`fa-solid ${s.icono}`} />
                  </div>
                  <span style={{ fontSize: 11.8, color: T.text2, lineHeight: 1.45 }}>{s.texto}</span>
                </div>
              ))}
            </div>
          </div>

          {/* México — cifras + regiones */}
          <div style={{ ...card, padding: "20px 22px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-earth-americas" style={{ marginRight: 8, color: accent }} />
              México en cifras
            </Eyebrow>
            <div style={{ display: "grid", gap: 12 }}>
              {CIFRAS_MX.map((cf, i) => (
                <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: accent, background: `rgba(${color.rgba},0.16)`, flexShrink: 0 }}>
                    <i className={`fa-solid ${cf.icono}`} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", fontFamily: "ui-monospace, monospace" }}>{cf.valor}</div>
                    <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.4 }}>{cf.texto}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: accent, marginBottom: 8 }}>REGIONES MÁS AFECTADAS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {REGIONES.map((r) => (
                <span key={r.nombre} style={{ fontSize: 11, fontWeight: 700, color: "#eaf2fb", padding: "4px 9px", borderRadius: 999, background: `rgba(${color.rgba},0.16)`, border: `1px solid rgba(${color.rgba},0.4)` }}>
                  <i className="fa-solid fa-location-dot" style={{ marginRight: 5, color: accent }} />{r.nombre}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Lecturas + ideas clave ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="ex-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-gauge-high" style={{ marginRight: 8, color: accent }} />
            Estado del predio
          </Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {EFECTOS.map((ef) => (
              <Readout key={ef.key} label={ef.nombre} value={fmt0(ef.calc(cobEf))} unit="%" col={ef.color} size={17} />
            ))}
          </div>
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            <Readout label="Cobertura efectiva" value={fmt0(cobEf)} unit="%" col={OK} size={18} />
            <Readout label="CO₂ liberado" value={fmt0(co2)} unit="% rel." col={ROJO} size={18} />
            <Readout label="Riesgo de incendio" value={fmt0(riesgo)} unit="%" col={ROJO} size={18} />
          </div>
        </div>

        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-lightbulb" style={{ marginRight: 8, color: accent }} />
            Ideas clave
          </Eyebrow>
          <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 9 }}>
            {IDEAS.map((d, i) => (
              <li key={i} style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>{d}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* nota de honestidad del modelo */}
      <div style={{ marginTop: 16, fontSize: 11.5, color: T.text3, lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start" }}>
        <i className="fa-solid fa-circle-info" style={{ marginTop: 2 }} />
        <span>
          Modelo didáctico: los porcentajes de servicios ecosistémicos (carbono, biodiversidad, agua, suelo) son <strong>relativos a un bosque intacto</strong> y muestran la <strong>dirección y proporción</strong> de los efectos, no medidas de un sitio concreto. Las cifras nacionales —<strong>92,000 ha/año</strong>, causas <strong>55 / 28 / 17 %</strong> y regiones— son verbatim de la actividad (CONAFOR 2023).
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

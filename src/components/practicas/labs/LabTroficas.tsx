"use client";

/**
 * Laboratorio 3D — Redes tróficas y flujo de energía.
 * Práctica experimental para CNEYT-III-P02-A1 (lectura; progresión 2).
 *
 * El alumno fija la ENERGÍA de los productores (kcal) y la EFICIENCIA ECOLÓGICA
 * (%) y ve cómo la energía sube por una pirámide trófica 3D como partículas
 * verdes, mientras el ~90% se escapa como calor (naranja) en cada nivel: la
 * "regla del 10%". Anclado a ecosistemas de México (Mar de Cortés, bosque
 * templado, selva húmeda) y a su megadiversidad marina.
 * Ecosistemas, interacciones y energía — flujo de energía (MCCEMS 2025).
 */

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import {
  NIVELES, DESCOMPONEDORES, ECOSISTEMAS, DATOS_MX, IDEAS, calcularNiveles,
  ENERGIA_MIN, ENERGIA_MAX, ENERGIA_STEP, ENERGIA_DEFAULT,
  EF_MIN, EF_MAX, EF_STEP, EF_DEFAULT,
  fmt0, fmtKcal, type NivelKey,
} from "./troficas-data";

const TroficasScene = dynamic(() => import("./TroficasScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-seedling fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Encendiendo el flujo de energía…</span>
    </div>
  ),
});

const NARANJA = "#f97316";

export function LabTroficas({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [energia, setEnergia] = useState(ENERGIA_DEFAULT);
  const [eficiencia, setEficiencia] = useState(EF_DEFAULT);
  const [ecoIdx, setEcoIdx] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  const bump = () => setResetNonce((n) => n + 1);

  const eco = ECOSISTEMAS[ecoIdx]!;
  const niveles = useMemo(() => calcularNiveles(energia, eficiencia), [energia, eficiencia]);

  const reset = () => { setEnergia(ENERGIA_DEFAULT); setEficiencia(EF_DEFAULT); bump(); };

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-seedling" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>La energía fluye y se pierde</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 410, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la pirámide en 3D, pero la idea sigue: la energía del Sol entra por los productores y al subir de un nivel al siguiente solo pasa ~10% —el resto se escapa como calor—. Por eso hay muchos más herbívoros que depredadores. Usa los controles y las lecturas para explorarlo.
      </div>
    </div>
  );

  return (
    <div style={{ color: T.text }}>
      <style>{`
        @keyframes exPulseT { 0%,100%{ box-shadow:0 0 0 0 var(--exc); } 50%{ box-shadow:0 0 0 6px transparent; } }
        .ex-live-dot { animation: exPulseT 1.6s ease-in-out infinite; }
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
              background: `radial-gradient(120% 80% at 30% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#0a2236 0%,#06182c 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <TroficasScene
                energia={energia} eficiencia={eficiencia}
                accent={accent}
                pausado={pausado}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO — eficiencia actual */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13.5, fontWeight: 900, color: accent }}>
                <i className="fa-solid fa-gauge-high" style={{ marginRight: 7 }} />
                Eficiencia {fmt0(eficiencia)}%
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

            {/* Pie: regla del 10% */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(2,10,24,0.9) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 13.5, color: "#eaf6ee", fontWeight: 800 }}>
                <i className="fa-solid fa-bolt" style={{ color: accent, marginRight: 6 }} />
                {fmtKcal(energia)} kcal en la base ·
                <i className="fa-solid fa-fire" style={{ color: NARANJA, margin: "0 6px 0 10px" }} />
                {fmt0(100 - eficiencia)}% perdido como calor por nivel
              </div>
              <div style={{ fontSize: 12.5, color: "#cfe0d6", lineHeight: 1.5, marginTop: 6 }}>
                De los {fmtKcal(energia)} kcal de los productores solo llegan ~{fmtKcal(niveles[3]!.energia)} kcal a los depredadores tope: por eso son pocos.
              </div>
            </div>
          </div>

          {/* Controles */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: accent }} />
              El flujo de energía
            </Eyebrow>
            <div style={{ display: "grid", gap: 16 }}>
              <Deslizador label="Energía de los productores" icon="fa-bolt" colr={accent}
                valor={`${fmtKcal(energia)} kcal`} min={ENERGIA_MIN} max={ENERGIA_MAX} step={ENERGIA_STEP} value={energia}
                onChange={setEnergia} hintL={`${fmtKcal(ENERGIA_MIN)} kcal`} hintR={`${fmtKcal(ENERGIA_MAX)} kcal`} />
              <Deslizador label="Eficiencia ecológica" icon="fa-gauge-high" colr={NARANJA}
                valor={`${fmt0(eficiencia)} %`} min={EF_MIN} max={EF_MAX} step={EF_STEP} value={eficiencia}
                onChange={setEficiencia} hintL={`${EF_MIN}% (poco eficiente)`} hintR={`${EF_MAX}% (muy eficiente)`} />
            </div>

            {/* selector de ecosistema */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
              {ECOSISTEMAS.map((e, i) => (
                <button key={e.key} className="ex-chip" data-on={i === ecoIdx} title={e.dato}
                  onClick={() => setEcoIdx(i)}
                  style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <i className={`fa-solid ${e.icono}`} style={{ color: accent }} />
                  {e.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* Pirámide de energía — niveles del ecosistema elegido */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-chart-simple" style={{ marginRight: 8, color: accent }} />
              Pirámide trófica — {eco.nombre}
            </Eyebrow>
            <div style={{ display: "grid", gap: 8 }}>
              {[...NIVELES].reverse().map((nv) => {
                const calc = niveles[nv.orden]!;
                const ancho = Math.max(8, Math.pow(eficiencia / 100, nv.orden) * 100);
                const orgs = eco.organismos[nv.key as NivelKey];
                return (
                  <div key={nv.key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 132, flexShrink: 0, textAlign: "right" }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: nv.color }}>
                        <i className={`fa-solid ${nv.icono}`} style={{ marginRight: 6 }} />{nv.nombre.replace("Consumidores ", "Cons. ")}
                      </div>
                      <div style={{ fontSize: 10.5, color: T.text3 }}>{orgs.join(" · ")}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ height: 26, borderRadius: 7, display: "flex", alignItems: "center", paddingLeft: 10, color: "#04121f", fontWeight: 900, fontSize: 11.5, fontFamily: "ui-monospace, monospace", width: `${ancho}%`, minWidth: 64, background: `linear-gradient(90deg, ${nv.color}, ${nv.color}bb)`, boxShadow: `0 0 14px -4px ${nv.color}` }}>
                        {fmtKcal(calc.energia)} kcal
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* descomponedores */}
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, border: `1px dashed ${DESCOMPONEDORES.color}66`, background: `${DESCOMPONEDORES.color}10` }}>
              <i className={`fa-solid ${DESCOMPONEDORES.icono}`} style={{ color: DESCOMPONEDORES.color, fontSize: 14 }} />
              <span style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.4 }}>
                <strong style={{ color: DESCOMPONEDORES.color }}>{DESCOMPONEDORES.nombre}</strong> ({eco.descomponedor}) cierran el ciclo de la materia: devuelven nutrientes al suelo para que los productores vuelvan a empezar.
              </span>
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Niveles tróficos */}
          <div style={{ ...card, padding: "20px 22px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-layer-group" style={{ marginRight: 8, color: accent }} />
              Niveles tróficos
            </Eyebrow>
            <div style={{ display: "grid", gap: 12 }}>
              {NIVELES.map((nv) => (
                <div key={nv.key} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: nv.color, background: `${nv.color}22`, flexShrink: 0 }}>
                    <i className={`fa-solid ${nv.icono}`} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 900, color: "#fff" }}>{nv.nombre} <span style={{ color: nv.color, fontWeight: 700 }}>· {nv.rol}</span></div>
                    <div style={{ fontSize: 11.5, color: T.text2, lineHeight: 1.45 }}>{nv.descripcion}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ecosistema actual */}
          <div style={{ borderRadius: 18, padding: "20px 22px 22px", border: `1px solid rgba(${color.rgba},0.4)`, background: `rgba(${color.rgba},0.10)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#fff", background: accent }}>
                <i className={`fa-solid ${eco.icono}`} />
              </div>
              <span style={{ fontSize: 14.5, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>{eco.nombre}</span>
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: accent, marginBottom: 6 }}>CADENA TRÓFICA</div>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, marginBottom: 12 }}>
              {NIVELES.map((nv, i) => (
                <span key={nv.key} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#eaf2fb", padding: "4px 9px", borderRadius: 999, background: `${nv.color}22`, border: `1px solid ${nv.color}55` }}>
                    {eco.organismos[nv.key as NivelKey][0]}
                  </span>
                  {i < NIVELES.length - 1 && <i className="fa-solid fa-arrow-right" style={{ fontSize: 9, color: T.text3 }} />}
                </span>
              ))}
            </div>
            <div style={{ fontSize: 12, color: T.text, lineHeight: 1.5, padding: "10px 12px", borderRadius: 10, background: "rgba(2,12,28,0.4)", border: `1px solid ${T.line}` }}>
              <i className="fa-solid fa-circle-info" style={{ color: accent, marginRight: 7 }} />
              {eco.dato}
            </div>
          </div>

          {/* México megadiverso (marino) */}
          <div style={{ ...card, padding: "20px 22px 22px" }}>
            <Eyebrow>
              <i className="fa-solid fa-earth-americas" style={{ marginRight: 8, color: accent }} />
              México megadiverso
            </Eyebrow>
            <div style={{ display: "grid", gap: 12 }}>
              {DATOS_MX.map((cf, i) => (
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
        </div>
      </div>

      {/* ── Lecturas + ideas clave ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) clamp(300px,26vw,380px)", gap: 22, marginTop: 22 }} className="ex-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-gauge-high" style={{ marginRight: 8, color: accent }} />
            Energía por nivel
          </Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {niveles.map((nv) => (
              <Readout key={nv.key} label={nv.nombre.replace("Consumidores ", "C. ")} value={fmtKcal(nv.energia)} unit="kcal" col={nv.color} size={16} />
            ))}
          </div>
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            <Readout label="Llega a la cima" value={fmtKcal(niveles[3]!.porcentaje)} unit="%" col={NARANJA} size={18} />
            <Readout label="Perdido por nivel" value={fmt0(100 - eficiencia)} unit="% calor" col={NARANJA} size={18} />
            <Readout label="Niveles tróficos" value={`${NIVELES.length}`} unit="+ descomp." col={OK} size={18} />
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
          Modelo didáctico: la <strong>«regla del 10%»</strong> es una simplificación reconocida; la eficiencia ecológica real varía entre <strong>5% y 20%</strong> según el ecosistema. Las kcal son valores de referencia para mostrar la <strong>proporción</strong> entre niveles, no medidas de un sitio concreto. Datos de México verbatim sobre megadiversidad marina (Mar de Cortés, Cousteau).
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

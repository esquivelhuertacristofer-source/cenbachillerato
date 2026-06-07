"use client";

/**
 * Laboratorio 3D — Pirámide de energía y flujo trófico.
 * Práctica experimental para CNEYT-III-P02-A2
 * ("Calcula: ¿cuánta energía llega al tercer nivel trófico?"; progresión 2).
 *
 * La energía entra por los productores (fotosíntesis) y sube por la cadena
 * trófica, pero en cada salto solo se transfiere ~10% al siguiente nivel
 * (eficiencia ecológica); el ~90% restante se pierde como calor. Por eso la
 * energía disponible forma una pirámide: muchos productores sostienen a pocos
 * depredadores tope. El alumno mueve la energía inicial y la eficiencia y ve
 * cuánto llega a cada nivel y cuánto se disipa.
 * Ciencias Naturales, Experimentales y Tecnología III — Ecosistemas (MCCEMS 2025).
 */

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import {
  NIVELES,
  N_NIVELES,
  flujo,
  pctTope,
  calorTotal,
  fmtKcal,
  fmtPct,
  E0_MIN, E0_MAX, E0_STEP, E0_DEFAULT,
  EFIC_MIN, EFIC_MAX, EFIC_STEP, EFIC_DEFAULT,
} from "./piramide-energia-data";

const PiramideEnergiaScene = dynamic(() => import("./PiramideEnergiaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-layer-group fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const VERDE = "#34D399";
const CALOR = "#ff7a4a";

export function LabPiramideEnergia({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [e0, setE0] = useState(E0_DEFAULT);
  const [efic, setEfic] = useState(EFIC_DEFAULT);
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // objetivos
  const [vioPiramide] = useState(true);
  const [movioE0, setMovioE0] = useState(false);
  const [movioEfic, setMovioEfic] = useState(false);
  const [esVerbatim, setEsVerbatim] = useState(true);

  const bump = () => setResetNonce((n) => n + 1);

  const cambiarE0 = (v: number) => { setE0(v); setMovioE0(true); setEsVerbatim(v === E0_DEFAULT && efic === EFIC_DEFAULT); };
  const cambiarEfic = (v: number) => { setEfic(v); setMovioEfic(true); setEsVerbatim(e0 === E0_DEFAULT && v === EFIC_DEFAULT); };

  const reset = () => { setE0(E0_DEFAULT); setEfic(EFIC_DEFAULT); setEsVerbatim(true); bump(); };

  const datos = useMemo(() => flujo(e0, efic), [e0, efic]);
  const tope = useMemo(() => pctTope(e0, efic), [e0, efic]);
  const calor = useMemo(() => calorTotal(e0, efic), [e0, efic]);

  const objetivos = [
    { txt: "Observa la pirámide de energía", done: vioPiramide },
    { txt: "Cambia la energía de los productores", done: movioE0 },
    { txt: "Mueve la eficiencia (5–20%)", done: movioEfic },
    { txt: "Reproduce el caso de la actividad", done: esVerbatim },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-layer-group" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>La energía disminuye en cada nivel trófico</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: solo ~10% de la energía pasa al siguiente nivel; el ~90% se pierde como calor. Por eso hay muchos productores y pocos depredadores.
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
        .ex-chip[data-on="true"] { border-color:var(--exc); background:rgba(${color.rgba},0.16); color:#fff; }
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
              <PiramideEnergiaScene
                e0={e0}
                eficPct={efic}
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
              <span style={{ fontSize: 15, fontWeight: 900, color: accent, fontFamily: "ui-monospace, monospace" }}>
                <i className="fa-solid fa-arrow-up-right-dots" style={{ marginRight: 8 }} />
                eficiencia {efic}%
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

            {/* Pie: lectura del tope */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(2,10,24,0.88) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 12.5, color: "#dCE8F6", lineHeight: 1.5, maxWidth: 600 }}>
                Al nivel de las <strong style={{ color: CALOR }}>águilas</strong> solo llega <strong style={{ color: accent }}>{fmtKcal(datos[N_NIVELES - 1]!.energia)} kcal</strong> ({fmtPct(tope)} de la energía inicial). El resto se disipó como <strong style={{ color: CALOR }}>calor</strong>.
              </div>
            </div>
          </div>

          {/* Controles */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: accent }} />
              Ajusta el flujo de energía
            </Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Deslizador label="Energía de los productores (fotosíntesis)" icon="fa-seedling" colr={VERDE}
                valor={`${fmtKcal(e0)} kcal`} min={E0_MIN} max={E0_MAX} step={E0_STEP} value={e0} onChange={cambiarE0}
                hintL="lo que el Sol fija en las plantas" />
              <Deslizador label="Eficiencia ecológica por salto" icon="fa-percent" colr={accent}
                valor={`${efic}%`} min={EFIC_MIN} max={EFIC_MAX} step={EFIC_STEP} value={efic} onChange={cambiarEfic}
                hintL="real: 5–20%" hintR="regla del 10%" />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
              <button className="ex-chip" data-on={esVerbatim} onClick={reset} style={{ ["--exc" as string]: accent }}>
                <i className="fa-solid fa-rotate-left" style={{ marginRight: 6 }} />
                Caso de la actividad (10,000 kcal · 10%)
              </button>
            </div>
          </div>

          {/* Resultado en vivo — energía por nivel */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-table-cells" style={{ marginRight: 8, color: accent }} />
              Energía disponible por nivel
            </Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              {NIVELES.map((nv, i) => {
                const dn = datos[i]!;
                return (
                  <div key={nv.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 12px", borderRadius: 11, background: T.inset, border: `1px solid ${nv.color}33` }}>
                    <div style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: nv.color, background: `${nv.color}1f` }}>
                      <i className={`fa-solid ${nv.icono}`} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: T.text }}>{nv.nombre}</div>
                      <div style={{ fontSize: 11, color: T.text3 }}>{nv.ejemplo}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: nv.color, fontFamily: "ui-monospace, monospace" }}>{fmtKcal(dn.energia)} kcal</div>
                      <div style={{ fontSize: 10.5, color: T.text3 }}>{fmtPct(dn.pctDelOriginal)} del total</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 12 }}>
              <Readout label="Llega al nivel tope" value={fmtPct(tope)} col={CALOR} size={16} />
              <Readout label="Perdido como calor" value={fmtKcal(calor)} unit="kcal" col={CALOR} size={15} />
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
              Con eficiencia del <strong style={{ color: accent }}>{efic}%</strong>, cada nivel conserva solo esa fracción del anterior: por eso al tope llega apenas <strong style={{ color: CALOR }}>{fmtPct(tope)}</strong> de la energía original. La pérdida no desaparece: se transforma en <strong style={{ color: CALOR }}>calor</strong> (respiración, movimiento, calor corporal) — la energía se conserva, pero deja de estar disponible para comer.
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          <Eyebrow>La regla del 10%</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            Al pasar de un nivel trófico al siguiente, solo se transfiere alrededor del <strong style={{ color: accent }}>10%</strong> de la energía; el otro <strong style={{ color: CALOR }}>90%</strong> se pierde como calor. Es una <strong>simplificación didáctica</strong>: en ecosistemas reales la eficiencia va del <strong>5% al 20%</strong> (por eso el deslizador la deja mover).
          </div>

          <div className="ex-divider" />

          <Eyebrow>Los niveles tróficos</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {NIVELES.map((nv) => (
              <div key={nv.key} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: nv.color, background: `${nv.color}1f` }}>
                  <i className={`fa-solid ${nv.icono}`} />
                </div>
                <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>
                  <strong style={{ color: T.text }}>{nv.nombre}</strong> — {nv.ejemplo}
                </div>
              </div>
            ))}
          </div>

          <div className="ex-divider" />

          <Eyebrow>¿Por qué es una pirámide?</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            Como la energía cae a una décima parte en cada salto, hace falta una base enorme de productores para sostener unos pocos depredadores tope. Por eso siempre hay <strong>muchísimo más pasto que águilas</strong>. Y por eso comer del primer nivel (plantas) es más eficiente para el planeta: evita las pérdidas de los niveles intermedios.
          </div>

          <div className="ex-divider" />

          <Eyebrow>En la vida real (México)</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            El <strong style={{ color: accent }}>Mar de Cortés</strong> —«el acuario del mundo»— sostiene cadenas enormes: el fitoplancton (productor) alimenta peces pequeños, que alimentan atunes y, en la cúspide, a tiburones y orcas. Por la regla del 10%, los depredadores tope son escasos y muy vulnerables: si desaparece la base, toda la pirámide se cae.
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
            Empieza con el caso de la actividad: <strong style={{ color: VERDE }}>10,000 kcal</strong> y eficiencia <strong style={{ color: accent }}>10%</strong>. Sigue el hilo de energía hacia arriba (cada vez más delgado) y el calor que escapa (enorme en la base). Luego sube la eficiencia al 20% y mira cómo la pirámide se vuelve menos empinada.
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

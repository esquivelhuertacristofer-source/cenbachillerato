"use client";

/**
 * Laboratorio 3D — El ciclo del carbono: equilibrio y desequilibrio.
 * Práctica experimental para CNEYT-III-P04-A1 (progresión 4).
 *
 * Una Tierra rodeada por sus reservorios de carbono (atmósfera, vegetación,
 * animales, suelo, océano y combustibles fósiles); entre ellos viajan átomos de
 * carbono por los procesos del ciclo (fotosíntesis, respiración, descomposición,
 * disolución oceánica, fosilización). El alumno mueve las EMISIONES humanas por
 * quema de fósiles y ve, en vivo, cuánto CO₂ alcanzan a reabsorber océano y
 * bosques y cuánto se acumula en la atmósfera (y cuántas ppm sube al año). A 0
 * el ciclo está en equilibrio; al subir, la atmósfera se tiñe de naranja.
 * Ciencias Naturales, Experimentales y Tecnología III — Ecosistemas y energía
 * (MCCEMS 2025); datos verbatim de INECC 2022 / SEMARNAT / CONAFOR.
 */

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import {
  RESERVORIOS,
  DATOS_MX,
  TIEMPOS,
  acumAtm,
  absorbido,
  ppmAnual,
  fmtGt,
  fmtPpm,
  EMIS_MIN, EMIS_MAX, EMIS_STEP, EMIS_DEFAULT, FRAC_AEREA,
} from "./carbono-data";

const CicloCarbonoScene = dynamic(() => import("./CicloCarbonoScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-arrows-spin fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const VERDE = "#34D399";
const AZUL = "#38bdf8";
const ROJO = "#ef4444";
const NARANJA = "#f59e0b";

export function LabCicloCarbono({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [emisiones, setEmisiones] = useState(EMIS_DEFAULT);
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // objetivos
  const [vioCiclo] = useState(true);
  const [bajoEquilibrio, setBajoEquilibrio] = useState(false);
  const [subioEmisiones, setSubioEmisiones] = useState(false);
  const [vioMexico, setVioMexico] = useState(false);

  const bump = () => setResetNonce((n) => n + 1);
  const cambiarEmis = (v: number) => {
    setEmisiones(v);
    if (v === 0) setBajoEquilibrio(true);
    if (v > EMIS_DEFAULT) setSubioEmisiones(true);
  };
  const reset = () => { setEmisiones(EMIS_DEFAULT); bump(); };

  const acum = useMemo(() => acumAtm(emisiones), [emisiones]);
  const abs = useMemo(() => absorbido(emisiones), [emisiones]);
  const ppm = useMemo(() => ppmAnual(emisiones), [emisiones]);
  const equilibrio = emisiones === 0;

  const objetivos = [
    { txt: "Observa el ciclo en equilibrio", done: vioCiclo },
    { txt: "Baja las emisiones a cero", done: bajoEquilibrio },
    { txt: "Sube las emisiones (mira la atmósfera)", done: subioEmisiones },
    { txt: "Lee el caso de México", done: vioMexico },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: VERDE, boxShadow: `0 10px 30px -6px ${VERDE}` }}>
        <i className="fa-solid fa-arrows-spin" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>El carbono no se gasta: circula</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 410, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: el carbono pasa entre atmósfera, plantas, animales, suelo, océano y fósiles. Quemar fósiles añade carbono más rápido de lo que océano y bosques pueden reabsorber.
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
              background: `radial-gradient(120% 80% at 30% 0%, rgba(${color.rgba},0.12) 0%, transparent 55%), linear-gradient(180deg,#06182c 0%,#03101f 100%)`,
              boxShadow: `0 0 50px -18px rgba(${color.rgba},0.4), ${T.shadow}`,
            }}
          >
            <SceneBoundary fallback={sceneFallback}>
              <CicloCarbonoScene
                emisiones={emisiones}
                accent={accent}
                pausado={pausado}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO — estado del balance */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${equilibrio ? VERDE : ROJO}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${equilibrio ? VERDE : ROJO}aa`, width: 9, height: 9, borderRadius: "50%", background: equilibrio ? VERDE : ROJO }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 15, fontWeight: 900, color: equilibrio ? VERDE : ROJO, fontFamily: "ui-monospace, monospace" }}>
                <i className={`fa-solid ${equilibrio ? "fa-scale-balanced" : "fa-temperature-arrow-up"}`} style={{ marginRight: 8 }} />
                {equilibrio ? "ciclo en equilibrio" : `+${fmtGt(acum)} Gt/año al aire`}
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

            {/* Pie: lectura del balance */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(2,10,24,0.9) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 14, color: "#eaf6ee", fontFamily: "ui-monospace, monospace", fontWeight: 800, letterSpacing: "0.01em" }}>
                <span style={{ color: ROJO }}>{fmtGt(emisiones)} Gt CO₂</span> emitidas → <span style={{ color: AZUL }}>{fmtGt(abs)}</span> reabsorbidas, <span style={{ color: NARANJA }}>{fmtGt(acum)}</span> al aire
              </div>
              <div style={{ fontSize: 12.5, color: "#cfe0d6", lineHeight: 1.5, marginTop: 6 }}>
                {equilibrio
                  ? "Sin combustión humana, lo que las plantas fijan iguala a lo que sale por respiración: el carbono solo circula."
                  : <>Cerca del <strong style={{ color: NARANJA }}>{Math.round(FRAC_AEREA * 100)} %</strong> de lo que emitimos se queda en la atmósfera: el CO₂ sube ~<strong style={{ color: ROJO }}>{fmtPpm(ppm)} ppm</strong> al año y atrapa más calor.</>}
              </div>
            </div>
          </div>

          {/* Control de emisiones */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: accent }} />
              Emisiones humanas de CO₂
            </Eyebrow>
            <Deslizador label="Quema de fósiles + cambio de uso de suelo" icon="fa-industry" colr={ROJO}
              valor={`${emisiones} Gt/año`} min={EMIS_MIN} max={EMIS_MAX} step={EMIS_STEP} value={emisiones} onChange={cambiarEmis}
              hintL="0 (equilibrio natural)" hintR={`${EMIS_MAX} Gt/año`} />
            <div style={{ fontSize: 12, color: T.text3, marginTop: 10, lineHeight: 1.45 }}>
              Hoy el mundo emite <strong style={{ color: T.text2 }}>~37 Gt de CO₂ al año</strong> (INECC 2022). Llévalo a 0 para ver el ciclo natural en equilibrio.
            </div>
          </div>

          {/* Resultado en vivo — balance del carbono */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-chart-simple" style={{ marginRight: 8, color: accent }} />
              ¿Adónde va el carbono que emitimos?
            </Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 14 }}>
              <Readout label="Emitido" value={`${fmtGt(emisiones)} Gt`} col={ROJO} size={15} />
              <Readout label="Reabsorbido" value={`${fmtGt(abs)} Gt`} col={AZUL} size={15} />
              <Readout label="Queda al aire" value={`${fmtGt(acum)} Gt`} col={NARANJA} size={15} />
              <Readout label="CO₂ sube" value={`${fmtPpm(ppm)} ppm`} col={ROJO} size={16} />
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
              El océano y los bosques son <strong style={{ color: AZUL }}>sumideros</strong>: reabsorben un poco más de la mitad de lo que emitimos. El resto se <strong style={{ color: NARANJA }}>acumula</strong> en la atmósfera año tras año —por eso el CO₂ sube de forma sostenida—. Si un sumidero se destruye (talar un bosque, calentar el océano), reabsorbe menos y deja de ser sumidero para volverse <strong style={{ color: ROJO }}>fuente</strong>. La fracción aérea (~{Math.round(FRAC_AEREA * 100)} %) es aproximada (IPCC).
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          <Eyebrow>Los reservorios de carbono</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {RESERVORIOS.map((r) => (
              <div key={r.key} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: r.color, background: `${r.color}1f` }}>
                  <i className={`fa-solid ${r.icono}`} />
                </div>
                <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>
                  <strong style={{ color: r.color }}>{r.nombre}</strong> <span style={{ color: T.text3, fontFamily: "ui-monospace, monospace" }}>(~{r.gtC.toLocaleString("es-MX")} GtC)</span> — {r.resumen}
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.45, marginTop: 10 }}>
            Tamaños globales aproximados, en gigatoneladas de carbono (GtC). 1 GtC = mil millones de toneladas.
          </div>

          <div className="ex-divider" />

          <Eyebrow>El carbono en México</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }} onMouseEnter={() => setVioMexico(true)}>
            {DATOS_MX.map((d) => (
              <div key={d.titulo} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: accent, background: `rgba(${color.rgba},0.16)` }}>
                  <i className={`fa-solid ${d.icono}`} />
                </div>
                <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>
                  <strong style={{ color: T.text }}>{d.titulo}</strong> — {d.texto}
                </div>
              </div>
            ))}
          </div>

          <div className="ex-divider" />

          <Eyebrow>Cada ciclo a su ritmo</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {TIEMPOS.map((t) => (
              <div key={t.ciclo} style={{ fontSize: 12, color: T.text2, lineHeight: 1.4 }}>
                <strong style={{ color: t.color }}>{t.ciclo}:</strong> {t.tiempo}
              </div>
            ))}
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
            Pon las emisiones en <strong style={{ color: VERDE }}>0</strong>: los átomos siguen circulando, pero la atmósfera se mantiene azul (equilibrio). Sube el control: el flujo rojo de <strong style={{ color: ROJO }}>combustión</strong> se dispara y la capa de aire se vuelve naranja. El carbono no desaparece: solo cambia de reservorio.
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

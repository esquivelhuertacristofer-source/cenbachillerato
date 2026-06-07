"use client";

/**
 * Laboratorio 3D — Semejanza de triángulos: mido una altura inalcanzable.
 * Práctica experimental para PM-III-P05-A2 (progresión 5).
 *
 * El Sol proyecta rayos PARALELOS sobre una persona (referencia, de altura
 * conocida) y sobre una torre (el objeto que no podemos medir directamente).
 * Cada objeto con su sombra forma un triángulo rectángulo; como los rayos son
 * paralelos, ambos triángulos comparten el mismo ángulo → son SEMEJANTES (AA), y
 * sus lados son proporcionales:  altura_obj / sombra_obj = altura_ref / sombra_ref.
 * De ahí se despeja la altura de la torre midiendo solo sombras y una estatura.
 * Lo notable: al mover el Sol, las dos sombras se alargan a la par, pero la razón
 * de semejanza k y la altura calculada NO cambian.
 * Pensamiento Matemático III — semejanza y congruencia (MCCEMS 2025).
 */

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import {
  CASO,
  CRITERIOS_SEMEJANZA,
  CRITERIOS_CONGRUENCIA,
  sombra,
  razonK,
  alturaIndirecta,
  fmtM,
  fmtNum,
  ANG_MIN, ANG_MAX, ANG_STEP, ANG_DEFAULT,
  HREF_MIN, HREF_MAX, HREF_STEP, HREF_DEFAULT,
  HOBJ_MIN, HOBJ_MAX, HOBJ_STEP, HOBJ_DEFAULT,
} from "./semejanza-data";

const SemejanzaScene = dynamic(() => import("./SemejanzaScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-ruler-vertical fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const VERDE = "#34D399";
const SOL = "#ffd24a";
const AZUL = "#7fb2ff";

export function LabSemejanza({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [ang, setAng] = useState(ANG_DEFAULT);
  const [hRef, setHRef] = useState(HREF_DEFAULT);
  const [hObj, setHObj] = useState(HOBJ_DEFAULT);
  const [pausado, setPausado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // objetivos
  const [vioEscena] = useState(true);
  const [movioSol, setMovioSol] = useState(false);
  const [movioAlturas, setMovioAlturas] = useState(false);
  const [usoCaso, setUsoCaso] = useState(false);

  const bump = () => setResetNonce((n) => n + 1);
  const cambiarAng = (v: number) => { setAng(v); setMovioSol(true); };
  const cambiarHRef = (v: number) => { setHRef(v); setMovioAlturas(true); };
  const cambiarHObj = (v: number) => { setHObj(v); setMovioAlturas(true); };
  const reset = () => { setAng(ANG_DEFAULT); setHRef(HREF_DEFAULT); setHObj(HOBJ_DEFAULT); bump(); };
  const ponerCaso = () => { setHRef(CASO.hRef); setHObj(CASO.hObj); setAng(CASO.ang); setUsoCaso(true); bump(); };

  const sRef = useMemo(() => sombra(hRef, ang), [hRef, ang]);
  const sObj = useMemo(() => sombra(hObj, ang), [hObj, ang]);
  const k = useMemo(() => razonK(hObj, hRef), [hObj, hRef]);
  const hCalc = useMemo(() => alturaIndirecta(hRef, sObj, sRef), [hRef, sObj, sRef]);

  const objetivos = [
    { txt: "Observa los dos triángulos semejantes", done: vioEscena },
    { txt: "Mueve el Sol (mira las sombras)", done: movioSol },
    { txt: "Cambia las alturas", done: movioAlturas },
    { txt: "Reproduce el caso de Sofía", done: usoCaso },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-ruler-vertical" />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Mido una altura sin treparme a ella</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 400, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: una persona y una torre proyectan sombras al mismo Sol. Como los triángulos son semejantes, altura_obj / sombra_obj = altura_ref / sombra_ref.
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
              <SemejanzaScene
                ang={ang}
                hRef={hRef}
                hObj={hObj}
                accent={accent}
                pausado={pausado}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO — altura calculada */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${VERDE}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${VERDE}aa`, width: 9, height: 9, borderRadius: "50%", background: VERDE }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 15, fontWeight: 900, color: VERDE, fontFamily: "ui-monospace, monospace" }}>
                <i className="fa-solid fa-ruler-vertical" style={{ marginRight: 8 }} />
                torre {fmtM(hCalc)}
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

            {/* Pie: proporción + lectura */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 18px 14px", background: "linear-gradient(0deg, rgba(2,10,24,0.9) 0%, transparent 100%)", pointerEvents: "none" }}>
              <div style={{ fontSize: 14, color: "#eaf6ee", fontFamily: "ui-monospace, monospace", fontWeight: 800, letterSpacing: "0.01em" }}>
                <span style={{ color: VERDE }}>altura_torre</span> / <span style={{ color: VERDE }}>{fmtNum(sObj)}</span> = <span style={{ color: accent }}>{fmtNum(hRef)}</span> / <span style={{ color: accent }}>{fmtNum(sRef)}</span>
              </div>
              <div style={{ fontSize: 12.5, color: "#cfe0d6", lineHeight: 1.5, marginTop: 6 }}>
                Despejando: altura_torre = <strong style={{ color: SOL }}>{fmtM(hCalc)}</strong>. Baja el Sol y las dos sombras crecen a la par: la proporción —y este resultado— no cambian.
              </div>
            </div>
          </div>

          {/* Controles */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <Eyebrow>
                <i className="fa-solid fa-sliders" style={{ marginRight: 8, color: accent }} />
                Ajusta la escena
              </Eyebrow>
              <button className="ex-chip" onClick={ponerCaso} style={{ pointerEvents: "auto" }}>
                <i className="fa-solid fa-clock" style={{ marginRight: 7, color: SOL }} />
                Caso de Sofía
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 12 }}>
              <Deslizador label="Elevación del Sol" icon="fa-sun" colr={SOL}
                valor={`${ang}°`} min={ANG_MIN} max={ANG_MAX} step={ANG_STEP} value={ang} onChange={cambiarAng}
                hintL="Sol bajo (sombras largas)" hintR="Sol alto (sombras cortas)" />
              <Deslizador label="Altura de la persona" icon="fa-person" colr={accent}
                valor={fmtM(hRef)} min={HREF_MIN} max={HREF_MAX} step={HREF_STEP} value={hRef} onChange={cambiarHRef}
                hintL="1.20 m" hintR="2.00 m" />
              <Deslizador label="Altura real de la torre" icon="fa-tower-observation" colr={VERDE}
                valor={fmtM(hObj)} min={HOBJ_MIN} max={HOBJ_MAX} step={HOBJ_STEP} value={hObj} onChange={cambiarHObj}
                hintL="5 m" hintR="40 m" />
            </div>
          </div>

          {/* Resultado en vivo — medidas y razón */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className="fa-solid fa-chart-simple" style={{ marginRight: 8, color: accent }} />
              ¿Qué dicen las sombras?
            </Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 14 }}>
              <Readout label="Sombra persona" value={fmtM(sRef)} col={accent} size={15} />
              <Readout label="Sombra torre" value={fmtM(sObj)} col={VERDE} size={15} />
              <Readout label="Razón k" value={fmtNum(k)} col={SOL} size={16} />
              <Readout label="Altura calculada" value={fmtM(hCalc)} col={VERDE} size={16} />
            </div>
            <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
              La <strong style={{ color: SOL }}>razón de semejanza k</strong> = altura_torre / altura_persona = {fmtNum(k)}: la torre es <strong>{fmtNum(k)}</strong> veces más alta que la persona, y su sombra es <strong>{fmtNum(k)}</strong> veces más larga. Como solo conocemos sombras y una estatura, despejamos la altura con la proporción. La altura calculada coincide exactamente con la real: <strong style={{ color: VERDE }}>el método funciona</strong>. (Áreas crecen con <strong>k²</strong>, volúmenes con <strong>k³</strong>.)
            </div>
          </div>
        </div>

        {/* ── Columna lateral ────────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          <Eyebrow>El caso de la actividad</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            Sofía mide <strong style={{ color: accent }}>1.60 m</strong> y proyecta <strong>0.80 m</strong> de sombra; la torre del reloj proyecta <strong>12.40 m</strong>. Entonces la torre mide <strong style={{ color: VERDE }}>24.8 m</strong> y k = <strong style={{ color: SOL }}>15.5</strong>. Un monumento con sombra de <strong>3.2 m</strong>, en el mismo instante, mide <strong style={{ color: VERDE }}>6.4 m</strong>. Pulsa «Caso de Sofía» para reproducirlo.
          </div>

          <div className="ex-divider" />

          <Eyebrow>Criterios de semejanza (≈)</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {CRITERIOS_SEMEJANZA.map((c) => (
              <div key={c.sigla} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                <div style={{ flexShrink: 0, minWidth: 64, textAlign: "center", padding: "3px 8px", borderRadius: 7, fontSize: 11, fontWeight: 900, color: SOL, background: `${SOL}1f` }}>{c.sigla}</div>
                <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>{c.desc}</div>
              </div>
            ))}
          </div>

          <div className="ex-divider" />

          <Eyebrow>Criterios de congruencia (≅)</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {CRITERIOS_CONGRUENCIA.map((c) => (
              <div key={c.sigla} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                <div style={{ flexShrink: 0, minWidth: 64, textAlign: "center", padding: "3px 8px", borderRadius: 7, fontSize: 11, fontWeight: 900, color: AZUL, background: `${AZUL}1f` }}>{c.sigla}</div>
                <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.45 }}>{c.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11.5, color: T.text3, lineHeight: 1.45, marginTop: 10 }}>
            Congruentes (≅): misma forma <em>y</em> tamaño. Semejantes (≈): misma forma, distinto tamaño (k ≠ 1). Toda figura es semejante a sí misma con k = 1.
          </div>

          <div className="ex-divider" />

          <Eyebrow>Una técnica milenaria</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.55 }}>
            Egipcios y griegos ya medían pirámides y barcos lejanos con sombras y proporciones. Hoy la <strong style={{ color: accent }}>semejanza</strong> sostiene la topografía, la arquitectura, los mapas a escala y hasta la fotografía. Medir lo inalcanzable sin tocarlo: pura geometría.
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
            Fíjate en la <strong style={{ color: SOL }}>razón k</strong> y en la <strong style={{ color: VERDE }}>altura calculada</strong>: mueve el Sol de arriba a abajo y verás que no cambian, aunque las sombras se vuelvan enormes. Eso es lo poderoso de la semejanza: la <strong>proporción</strong> se conserva.
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

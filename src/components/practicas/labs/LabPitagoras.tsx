"use client";

/**
 * Laboratorio 3D — Teorema de Pitágoras.
 * Práctica experimental para PM-III-P01-A2 (calcular distancias reales).
 *
 * Sobre cada lado de un triángulo RECTÁNGULO se construye un cuadrado. El de la
 * hipotenusa (c²) tiene siempre la misma área que la suma de los de los catetos
 * (a² + b²): por eso a² + b² = c². Moviendo los catetos el estudiante descubre
 * la relación, reconoce ternas pitagóricas (lados enteros) y calcula la distancia
 * real (la escalera, la diagonal, el hilo del papalote) cuando conoce dos lados.
 * Pensamiento Matemático III — Triángulo rectángulo y Teorema de Pitágoras (MCCEMS 2025).
 */

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import {
  ESCENARIOS,
  CAT_MIN,
  CAT_MAX,
  CAT_STEP,
  hipotenusa,
  esTerna,
  fmtNum,
  type Escenario,
} from "./pitagoras-data";

const PitagorasScene = dynamic(() => import("./PitagorasScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-ruler-combined fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const B_COL = "#5EE6C5";
const C_COL = "#FFD166";

export function LabPitagoras({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [escKey, setEscKey] = useState(ESCENARIOS[0]!.key);
  const esc = useMemo<Escenario>(() => ESCENARIOS.find((e) => e.key === escKey) ?? ESCENARIOS[0]!, [escKey]);

  const [a, setA] = useState(ESCENARIOS[0]!.a);
  const [b, setB] = useState(ESCENARIOS[0]!.b);
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetNonce, setResetNonce] = useState(0);

  // seguimiento de objetivos
  const [movioCateto, setMovioCateto] = useState(false);
  const [vioTerna, setVioTerna] = useState(false);
  const [vioDecimal, setVioDecimal] = useState(false);
  const [explorados, setExplorados] = useState<Set<string>>(() => new Set<string>());

  const c = useMemo(() => hipotenusa(a, b), [a, b]);
  const terna = useMemo(() => esTerna(a, b), [a, b]);
  const a2 = a * a;
  const b2 = b * b;
  const c2 = a2 + b2;

  const aplicarCatetos = (na: number, nb: number) => {
    setA(na);
    setB(nb);
    if (esTerna(na, nb)) setVioTerna(true);
    else setVioDecimal(true);
  };

  const cambiarA = (na: number) => {
    aplicarCatetos(na, b);
    setMovioCateto(true);
  };
  const cambiarB = (nb: number) => {
    aplicarCatetos(a, nb);
    setMovioCateto(true);
  };

  const cargar = (e: Escenario) => {
    setEscKey(e.key);
    aplicarCatetos(e.a, e.b);
    setExplorados((prev) => (prev.has(e.key) ? prev : new Set(prev).add(e.key)));
    setResetNonce((n) => n + 1);
  };

  const reset = () => {
    aplicarCatetos(esc.a, esc.b);
    setResetNonce((n) => n + 1);
  };

  const estadoColor = terna ? C_COL : accent;
  const estadoTxt = terna ? "Terna pitagórica" : "Hipotenusa con decimales";

  const objetivos = [
    { txt: "Mueve un cateto y observa cómo cambia c²", done: movioCateto },
    { txt: "Forma una terna pitagórica (los tres lados enteros)", done: vioTerna },
    { txt: "Encuentra un caso con hipotenusa decimal", done: vioDecimal },
    { txt: "Explora 3 situaciones reales", done: explorados.size >= 3 },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${esc.icono}`} />
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, color: T.text, ...NUM }}>{`${a}² + ${b}² = ${c2}`}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: con catetos{" "}
        <strong>{a}</strong> y <strong>{b}</strong>, la hipotenusa mide <strong>{fmtNum(c)} {esc.unidad}</strong> porque a² + b² = c².
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
        .ex-esc { cursor:pointer; text-align:left; border-radius:12px; border:1px solid ${T.line}; background:${T.glass}; color:${T.text2};
          padding:11px 13px; transition:all .14s ease; display:flex; align-items:center; gap:11px; width:100%; }
        .ex-esc:hover { border-color:${T.lineStrong}; background:${T.glassSoft}; color:#fff; }
        .ex-esc[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.16); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
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
              <PitagorasScene a={a} b={b} accent={accent} autoRotate={autoRotate} resetNonce={resetNonce} />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${estadoColor}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${estadoColor}aa`, width: 9, height: 9, borderRadius: "50%", background: estadoColor }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13.5, fontWeight: 900, color: estadoColor, ...NUM }}>{estadoTxt}</span>
            </div>

            {/* Ecuación actual */}
            <div style={{ position: "absolute", bottom: 16, left: 18, display: "flex", gap: 8, alignItems: "baseline", fontSize: 18, fontWeight: 900, pointerEvents: "none", ...NUM }}>
              <span style={{ color: accent }}>{a}²</span>
              <span style={{ color: T.text3 }}>+</span>
              <span style={{ color: B_COL }}>{b}²</span>
              <span style={{ color: T.text3 }}>=</span>
              <span style={{ color: C_COL }}>{c2}</span>
              <span style={{ color: T.text3, fontSize: 14, fontWeight: 700 }}>→ c = {fmtNum(c)} {esc.unidad}</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(2,12,28,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((v) => !v)} title="Girar automáticamente">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="ex-icobtn" onClick={reset} title="Volver al escenario">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>
          </div>

          {/* Deslizadores de catetos */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className={`fa-solid ${esc.icono}`} style={{ marginRight: 8, color: accent }} />
              {esc.titulo}
            </Eyebrow>
            <div style={{ fontSize: 13.5, color: T.text2, lineHeight: 1.5, marginBottom: 18 }}>{esc.contexto}</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 9 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: accent }}>
                    Cateto a · {esc.aNombre}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 900, color: accent, ...NUM }}>{a} {esc.unidad}</span>
                </div>
                <input
                  type="range"
                  className="ex-range"
                  min={CAT_MIN}
                  max={CAT_MAX}
                  step={CAT_STEP}
                  value={a}
                  onChange={(e) => cambiarA(Number(e.target.value))}
                  style={{ ["--exc" as string]: accent, ["--exfill" as string]: `${((a - CAT_MIN) / (CAT_MAX - CAT_MIN)) * 100}%` }}
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 9 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: B_COL }}>
                    Cateto b · {esc.bNombre}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 900, color: B_COL, ...NUM }}>{b} {esc.unidad}</span>
                </div>
                <input
                  type="range"
                  className="ex-range"
                  min={CAT_MIN}
                  max={CAT_MAX}
                  step={CAT_STEP}
                  value={b}
                  onChange={(e) => cambiarB(Number(e.target.value))}
                  style={{ ["--exc" as string]: B_COL, ["--exfill" as string]: `${((b - CAT_MIN) / (CAT_MAX - CAT_MIN)) * 100}%` }}
                />
              </div>
            </div>

            <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}`, marginTop: 18 }}>
              <Readout label="a²" value={String(a2)} col={accent} size={16} />
              <div style={{ width: 1, background: T.line }} />
              <Readout label="b²" value={String(b2)} col={B_COL} size={16} />
              <div style={{ width: 1, background: T.line }} />
              <Readout label="c² = a² + b²" value={String(c2)} col={C_COL} size={16} />
              <div style={{ width: 1, background: T.line }} />
              <Readout label={`c (${esc.cNombre})`} value={`${fmtNum(c)} ${esc.unidad}`} col={terna ? C_COL : "#c8d6e6"} size={15} />
            </div>

            <div style={{ marginTop: 14, borderRadius: 13, border: `1px solid ${estadoColor}55`, background: `${estadoColor}14`, padding: "12px 15px", display: "flex", gap: 12, alignItems: "center" }}>
              <i className={`fa-solid ${terna ? "fa-star" : "fa-square-root-variable"}`} style={{ color: estadoColor, fontSize: 17 }} />
              <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text, lineHeight: 1.45 }}>
                {terna
                  ? `Los tres lados son enteros: ${a}, ${b} y ${fmtNum(c)} forman una terna pitagórica.`
                  : `La hipotenusa es c = √${c2} = ${fmtNum(c)} ${esc.unidad}: no todos los triángulos rectángulos tienen lados enteros.`}
              </div>
            </div>
          </div>

          {/* Por qué */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>Por qué funciona</Eyebrow>
            <div style={{ fontSize: 13.5, color: T.text2, lineHeight: 1.55 }}>
              El cuadrado dorado de la hipotenusa contiene exactamente <strong style={{ color: T.text }}>tantos cuadritos</strong> como los dos cuadrados de los catetos juntos. Cuéntalos: el área del grande (<strong style={{ color: C_COL }}>c²</strong>) es igual a la suma de las áreas de los chicos (<strong style={{ color: accent }}>a²</strong> + <strong style={{ color: B_COL }}>b²</strong>). Por eso, si conoces dos lados de un triángulo rectángulo, puedes calcular el tercero: <strong style={{ color: T.text }}>c = √(a² + b²)</strong>.
            </div>
            <div style={{ marginTop: 14, borderRadius: 13, border: `1px solid ${accent}44`, background: `rgba(${color.rgba},0.10)`, padding: "13px 16px", display: "flex", gap: 12, alignItems: "center" }}>
              <i className="fa-solid fa-down-left-and-up-right-to-center" style={{ color: accent, fontSize: 18 }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, lineHeight: 1.4 }}>{esc.porque}</div>
            </div>
          </div>
        </div>

        {/* ── Columna controles ──────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          <Eyebrow>Elige una situación real</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ESCENARIOS.map((e) => {
              const on = e.key === escKey;
              const hecho = explorados.has(e.key);
              const ce = hipotenusa(e.a, e.b);
              return (
                <button key={e.key} className="ex-esc" data-on={on} onClick={() => cargar(e)}>
                  <i className={`fa-solid ${e.icono}`} style={{ fontSize: 16, width: 20, textAlign: "center", color: on ? accent : T.text3 }} />
                  <span style={{ fontSize: 13.5, fontWeight: 700, flex: 1 }}>{e.titulo}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: T.text3, ...NUM }}>
                    {e.a},{e.b}→{fmtNum(ce)}
                  </span>
                  {hecho && <i className="fa-solid fa-circle-check" style={{ color: OK, fontSize: 13 }} />}
                </button>
              );
            })}
          </div>

          <div className="ex-divider" />

          <Eyebrow>Cómo calcular un lado</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5, display: "flex", flexDirection: "column", gap: 9 }}>
            <div><strong style={{ color: T.text }}>1.</strong> Identifica el ángulo recto: sus dos lados son los <strong>catetos</strong> (a y b).</div>
            <div><strong style={{ color: T.text }}>2.</strong> El lado frente al ángulo recto es la <strong>hipotenusa</strong> (c), siempre el más largo.</div>
            <div><strong style={{ color: T.text }}>3.</strong> Eleva al cuadrado, suma y saca raíz: <strong style={{ color: T.text }}>c = √(a² + b²)</strong>.</div>
          </div>

          <div className="ex-divider" />

          <Eyebrow>Marcador</Eyebrow>
          <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}` }}>
            <Readout label="Explorados" value={`${explorados.size}/${ESCENARIOS.length}`} col={accent} size={15} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="Triángulo" value={terna ? "Lados enteros" : "Con decimales"} col={terna ? C_COL : T.text3} size={14} />
          </div>

          <div style={{ marginTop: 14, fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
            <i className="fa-solid fa-circle-info" style={{ marginRight: 7, color: accent }} />
            Una <strong style={{ color: C_COL }}>terna pitagórica</strong> (como 3-4-5 o 5-12-13) es un triángulo rectángulo con los tres lados enteros. Son raras: la mayoría dan hipotenusa con decimales.
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
            El Teorema de Pitágoras convierte dos medidas que sí puedes tomar (los <strong style={{ color: T.text }}>catetos</strong>) en una que no siempre alcanzas a medir: la <strong style={{ color: C_COL }}>distancia en diagonal</strong>.
          </span>
        </div>
      </div>
    </div>
  );
}

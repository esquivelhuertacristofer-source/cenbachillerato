"use client";

/**
 * Laboratorio 3D — Productos notables: área y volumen.
 * Práctica experimental para PM-II-P08-A8 ("Ejercicio — Productos notables y
 * operaciones con polinomios").
 *
 * Un producto notable no se memoriza, se VE como una figura que se descompone:
 *   (a+b)²        → área de un cuadrado de lado (a+b)  → a² + 2ab + b²
 *   (a+b)³        → volumen de un cubo de arista (a+b) → a³ + 3a²b + 3ab² + b³
 *   (a+b)(a−b)    → un cuadrado a² menos un cuadrado b² → a² − b²
 * El cubo (a+b)³ es donde el 3D realmente aporta: es imposible verlo en 2D.
 * Pensamiento Matemático II — Productos notables (MCCEMS 2025).
 */

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import {
  MODOS,
  cuadrado,
  cubo,
  conjugados,
  numerico,
  fmtNum,
  A_MIN, A_MAX, A_STEP,
  B_MIN, B_MAX, B_STEP,
  type Modo,
  type ModoInfo,
} from "./productos-data";

const ProductosScene = dynamic(() => import("./ProductosScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-cube fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const TEAL = "#5EE6C5";
const AMBER = "#FFD166";
const PINK = "#FF6FA5";

export function LabProductos({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [modoKey, setModoKey] = useState<Modo>("cuadrado");
  const modo = useMemo<ModoInfo>(() => MODOS.find((m) => m.key === modoKey) ?? MODOS[0]!, [modoKey]);

  const [a, setA] = useState(3);
  const [b, setB] = useState(1.5);
  const [sep, setSep] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetNonce, setResetNonce] = useState(0);

  // objetivos
  const [vioCuadrado, setVioCuadrado] = useState(true); // arranca en cuadrado
  const [vioCubo, setVioCubo] = useState(false);
  const [vioConjugados, setVioConjugados] = useState(false);
  const [despiezo, setDespiezo] = useState(false);
  const [movioLados, setMovioLados] = useState(false);

  const cuad = cuadrado(a, b);
  const cub = cubo(a, b);
  const conj = conjugados(a, b);
  const conjValido = a > b;

  const cambiarModo = (k: Modo) => {
    setModoKey(k);
    setSep(0);
    setResetNonce((n) => n + 1);
    if (k === "cuadrado") setVioCuadrado(true);
    if (k === "cubo") setVioCubo(true);
    if (k === "conjugados") setVioConjugados(true);
  };

  const cambiarA = (v: number) => { setA(v); setMovioLados(true); };
  const cambiarB = (v: number) => { setB(v); setMovioLados(true); };
  const cambiarSep = (v: number) => { setSep(v); if (v > 0.5) setDespiezo(true); };

  const reset = () => { setSep(0); setResetNonce((n) => n + 1); };

  const objetivos = [
    { txt: "Mueve los lados a y b y observa la figura", done: movioLados },
    { txt: "Despieza la figura para ver cada término", done: despiezo },
    { txt: "Explora el cubo (a + b)³ en 3D", done: vioCubo },
    { txt: "Explora los tres productos notables", done: vioCuadrado && vioCubo && vioConjugados },
  ];

  // chips de términos según el modo
  const terminos = useMemo(() => {
    if (modoKey === "cuadrado") {
      return [
        { lbl: "a²", val: fmtNum(cuad.a2), col: accent },
        { lbl: "2ab", val: fmtNum(cuad.dosAB), col: TEAL },
        { lbl: "b²", val: fmtNum(cuad.b2), col: AMBER },
        { lbl: "(a+b)²", val: fmtNum(cuad.total), col: T.text },
      ];
    }
    if (modoKey === "cubo") {
      return [
        { lbl: "a³", val: fmtNum(cub.a3), col: accent },
        { lbl: "3a²b", val: fmtNum(cub.tresA2B), col: TEAL },
        { lbl: "3ab²", val: fmtNum(cub.tresAB2), col: AMBER },
        { lbl: "b³", val: fmtNum(cub.b3), col: PINK },
        { lbl: "(a+b)³", val: fmtNum(cub.total), col: T.text },
      ];
    }
    return [
      { lbl: "a²", val: fmtNum(conj.a2), col: accent },
      { lbl: "b²", val: fmtNum(conj.b2), col: PINK },
      { lbl: "a²−b²", val: fmtNum(conj.resultado), col: T.text },
    ];
  }, [modoKey, cuad, cub, conj, accent]);

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${modo.icono}`} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text, ...NUM }}>{modo.identidad}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: {modo.descripcion}
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
              <ProductosScene modo={modoKey} a={a} b={b} sep={sep} accent={accent} autoRotate={autoRotate} resetNonce={resetNonce} />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13.5, fontWeight: 900, color: accent, ...NUM }}>{modo.identidad}</span>
            </div>

            {/* Resultado numérico */}
            <div style={{ position: "absolute", bottom: 16, left: 18, display: "flex", gap: 8, alignItems: "baseline", fontSize: 16, fontWeight: 900, pointerEvents: "none", ...NUM }}>
              <span style={{ color: T.text3, fontWeight: 700 }}>a = {fmtNum(a, 1)}, b = {fmtNum(b, 1)} →</span>
              <span style={{ color: accent }}>{numerico(modoKey, a, b)}</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(2,12,28,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((v) => !v)} title="Girar automáticamente">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="ex-icobtn" onClick={reset} title="Reiniciar (juntar piezas)">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* aviso conjugados */}
            {modoKey === "conjugados" && !conjValido && (
              <div style={{ position: "absolute", bottom: 56, left: 18, fontSize: 12.5, fontWeight: 700, color: "#FFD166", background: "rgba(2,12,28,0.8)", padding: "6px 11px", borderRadius: 9, border: "1px solid #FFD16655" }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 7 }} />
                Para el rectángulo (a − b) necesitas a &gt; b.
              </div>
            )}
          </div>

          {/* Controles: lados + separación */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className={`fa-solid ${modo.icono}`} style={{ marginRight: 8, color: accent }} />
              {modo.titulo}
            </Eyebrow>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, marginBottom: 16 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: accent }}>Lado a</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: accent, ...NUM }}>{fmtNum(a, 1)}</span>
                </div>
                <input type="range" className="ex-range" min={A_MIN} max={A_MAX} step={A_STEP} value={a}
                  onChange={(e) => cambiarA(Number(e.target.value))}
                  style={{ ["--exc" as string]: accent, ["--exfill" as string]: `${((a - A_MIN) / (A_MAX - A_MIN)) * 100}%` }} />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: AMBER }}>Lado b</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: AMBER, ...NUM }}>{fmtNum(b, 1)}</span>
                </div>
                <input type="range" className="ex-range" min={B_MIN} max={B_MAX} step={B_STEP} value={b}
                  onChange={(e) => cambiarB(Number(e.target.value))}
                  style={{ ["--exc" as string]: AMBER, ["--exfill" as string]: `${((b - B_MIN) / (B_MAX - B_MIN)) * 100}%` }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: TEAL }}>
                  <i className="fa-solid fa-up-down-left-right" style={{ marginRight: 6 }} />
                  Separación (despiezar)
                </span>
                <span style={{ fontSize: 14, fontWeight: 900, color: TEAL, ...NUM }}>{Math.round(sep * 100)}%</span>
              </div>
              <input type="range" className="ex-range" min={0} max={1} step={0.01} value={sep}
                onChange={(e) => cambiarSep(Number(e.target.value))}
                style={{ ["--exc" as string]: TEAL, ["--exfill" as string]: `${sep * 100}%` }} />
            </div>

            {/* términos */}
            <div style={{ display: "flex", flexWrap: "wrap", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}`, marginTop: 18, overflow: "hidden" }}>
              {terminos.map((t, i) => (
                <div key={t.lbl} style={{ flex: "1 1 0", minWidth: 84, borderLeft: i === 0 ? "none" : `1px solid ${T.line}` }}>
                  <Readout label={t.lbl} value={t.val} col={t.col} size={15} />
                </div>
              ))}
            </div>
          </div>

          {/* Por qué */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>Por qué funciona</Eyebrow>
            <div style={{ fontSize: 13.5, color: T.text2, lineHeight: 1.55, marginBottom: 12 }}>{modo.descripcion}</div>
            <div style={{ borderRadius: 12, border: `1px solid ${accent}44`, background: `rgba(${color.rgba},0.08)`, padding: "11px 14px" }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: T.text3, marginBottom: 5 }}>PIEZAS</div>
              <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.5 }}>{modo.piezas}</div>
              <div style={{ marginTop: 9, fontSize: 16, fontWeight: 900, color: accent, ...NUM }}>{modo.identidad}</div>
            </div>
          </div>
        </div>

        {/* ── Columna controles ──────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          <Eyebrow>Producto notable</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {MODOS.map((m) => {
              const on = m.key === modoKey;
              return (
                <button key={m.key} className="ex-esc" data-on={on} onClick={() => cambiarModo(m.key)}>
                  <i className={`fa-solid ${m.icono}`} style={{ fontSize: 16, width: 20, textAlign: "center", color: on ? accent : T.text3 }} />
                  <span style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>{m.titulo}</span>
                    <span style={{ fontSize: 11.5, color: T.text3, ...NUM }}>{m.identidad}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="ex-divider" />

          <Eyebrow>El ejercicio de la actividad</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5, marginBottom: 10 }}>
            Una plaza cuadrada mide <strong style={{ color: T.text }}>(x + 5)</strong> metros por lado:
          </div>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 7, ...NUM }}>
            <div><strong style={{ color: accent }}>(a)</strong> (x + 5)² = x² + 10x + 25</div>
            <div><strong style={{ color: TEAL }}>(b)</strong> (x + 5)(x − 5) = x² − 25</div>
            <div><strong style={{ color: AMBER }}>(c)</strong> (x² + 2x − 1) + (3x² − x + 4) = 4x² + x + 3</div>
          </div>

          <div className="ex-divider" />

          <Eyebrow>Las reglas</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 6, ...NUM }}>
            <div>(a + b)² = a² + 2ab + b²</div>
            <div>(a − b)² = a² − 2ab + b²</div>
            <div>(a + b)(a − b) = a² − b²</div>
            <div>(a + b)³ = a³ + 3a²b + 3ab² + b³</div>
          </div>

          <div style={{ marginTop: 14, fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
            <i className="fa-solid fa-circle-info" style={{ marginRight: 7, color: accent }} />
            Mueve la <strong style={{ color: TEAL }}>separación</strong> para despiezar la figura y ver de dónde sale cada término.
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
            El término del medio nunca es casualidad: en <strong style={{ color: T.text }}>(a+b)²</strong> son los <strong style={{ color: TEAL }}>dos</strong> rectángulos ab; en <strong style={{ color: T.text }}>(a+b)³</strong> son las <strong style={{ color: TEAL }}>tres</strong> losas a²b y las <strong style={{ color: AMBER }}>tres</strong> columnas ab². Por eso los coeficientes son 2 y 3.
          </span>
        </div>
      </div>
    </div>
  );
}

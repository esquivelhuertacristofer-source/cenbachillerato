"use client";

/**
 * Laboratorio 3D — Potencias y raíces.
 * Práctica experimental para PM-I-P09-A1.
 *
 * El estudiante elige una BASE y un EXPONENTE (² o ³) y ve la potencia
 * CONSTRUIDA con cubitos: n² es un cuadrado (área) y n³ es un cubo (volumen);
 * el número de cubitos es el valor de la potencia. Al resaltar el LADO descubre
 * la raíz como operación inversa: √(n²) = n y ∛(n³) = n. Pensamiento Matemático I.
 */

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { BASES, EXPONENTES, expansion, potencia, type Exponente } from "./potencias-data";

const PotenciasScene = dynamic(() => import("./PotenciasScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-cube fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const LADO = "#FFD166";

const fmt = (n: number) => n.toLocaleString("es-MX");

export function LabPotencias({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [base, setBase] = useState(3);
  const [exponente, setExponente] = useState<Exponente>(2);
  const [resaltarLado, setResaltarLado] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetNonce, setResetNonce] = useState(0);
  // seguimiento de objetivos
  const [interactuo, setInteractuo] = useState(false);
  const [expsVistos, setExpsVistos] = useState<Set<number>>(() => new Set<number>());
  const [usoRaiz, setUsoRaiz] = useState(false);

  const registrarExp = (e: Exponente) =>
    setExpsVistos((prev) => {
      if (prev.has(e)) return prev;
      const next = new Set(prev);
      next.add(e);
      return next;
    });

  const elegirBase = (n: number) => {
    setBase(n);
    setInteractuo(true);
    registrarExp(exponente);
  };
  const elegirExponente = (e: Exponente) => {
    setExponente(e);
    setInteractuo(true);
    registrarExp(e);
  };
  const toggleLado = () => {
    setResaltarLado((v) => {
      if (!v) setUsoRaiz(true);
      return !v;
    });
  };
  const reset = () => {
    setBase(3);
    setExponente(2);
    setResaltarLado(false);
    setResetNonce((n) => n + 1);
  };

  const info = useMemo(() => EXPONENTES.find((x) => x.e === exponente)!, [exponente]);
  const resultado = useMemo(() => potencia(base, exponente), [base, exponente]);

  const objetivos = [
    { txt: "Cambia la base y observa el crecimiento", done: interactuo },
    { txt: "Construye un cuadrado: n² (área)", done: expsVistos.has(2) },
    { txt: "Construye un cubo: n³ (volumen)", done: expsVistos.has(3) },
    { txt: "Descubre la raíz: identifica el lado", done: usoRaiz },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${info.icono}`} />
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, color: T.text, ...NUM }}>
        {base}{info.simbolo} = {fmt(resultado)}
      </div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: {base}{info.simbolo} es {expansion(base, exponente)} = {fmt(resultado)} cubitos, y su raíz devuelve el lado {base}.
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
        .ex-chip { cursor:pointer; border-radius:11px; border:1px solid ${T.line}; background:${T.glass}; color:${T.text2};
          font-size:15px; font-weight:800; padding:11px 0; transition:all .14s ease; }
        .ex-chip:hover { border-color:${T.lineStrong}; background:${T.glassSoft}; color:#fff; }
        .ex-chip[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.18); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .ex-exp { cursor:pointer; flex:1; border-radius:12px; border:1px solid ${T.line}; background:${T.glass}; color:${T.text2};
          font-size:14px; font-weight:800; padding:13px 6px; transition:all .14s ease; display:flex; flex-direction:column; align-items:center; gap:6px; }
        .ex-exp:hover { border-color:${T.lineStrong}; color:#fff; }
        .ex-exp[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.18); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .ex-toggle { cursor:pointer; width:100%; display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:12px 18px;
          border-radius:12px; border:1.5px solid ${T.line}; background:${T.inset}; color:${T.text}; font-size:14px; font-weight:800; transition:all .14s; }
        .ex-toggle:hover { border-color:${LADO}; }
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
              <PotenciasScene base={base} exponente={exponente} resaltarLado={resaltarLado} accent={accent} autoRotate={autoRotate} resetNonce={resetNonce} />
            </SceneBoundary>

            {/* Cinta EN VIVO con la potencia */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13.5, fontWeight: 900, color: accent, ...NUM }}>
                {base}{info.simbolo} = {expansion(base, exponente)} = {fmt(resultado)}
              </span>
            </div>

            {/* Etiqueta inferior */}
            <div style={{ position: "absolute", bottom: 16, left: 18, fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", pointerEvents: "none" }}>
              <i className={`fa-solid ${info.icono}`} style={{ marginRight: 7, color: accent }} />
              {fmt(resultado)} cubitos · {info.forma} del {info.figura}
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(2,12,28,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((v) => !v)} title="Girar automáticamente">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="ex-icobtn" onClick={reset} title="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>
          </div>

          {/* La potencia: lectura completa */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>La potencia paso a paso</Eyebrow>
            <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}` }}>
              <Readout label="Base" value={`${base}`} col={accent} />
              <div style={{ width: 1, background: T.line }} />
              <Readout label="Exponente" value={`${exponente}`} />
              <div style={{ width: 1, background: T.line }} />
              <Readout label={`Potencia (${info.figura})`} value={fmt(resultado)} col={accent} />
            </div>
            <div style={{ marginTop: 12, fontSize: 13.5, color: T.text2, lineHeight: 1.5 }}>
              <i className={`fa-solid ${info.icono}`} style={{ marginRight: 8, color: accent }} />
              <strong style={{ color: T.text, ...NUM }}>{base}{info.simbolo}</strong> significa multiplicar la base por sí misma {exponente} veces:{" "}
              <strong style={{ color: accent, ...NUM }}>{expansion(base, exponente)} = {fmt(resultado)}</strong>. Es el {info.forma} de un {info.figura} de lado {base}.
            </div>
          </div>

          {/* La raíz: operación inversa */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>La raíz · operación inversa</Eyebrow>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200, fontSize: 13.5, color: T.text2, lineHeight: 1.5 }}>
                Si la potencia te da el {info.forma}, la raíz hace lo contrario: a partir del {info.forma}{" "}
                <strong style={{ color: T.text, ...NUM }}>{fmt(resultado)}</strong> recupera el lado.
              </div>
              <div style={{ width: 200 }}>
                <button className="ex-toggle" onClick={toggleLado} style={resaltarLado ? { borderColor: LADO, background: `${LADO}1f` } : undefined}>
                  <i className="fa-solid fa-ruler-combined" style={{ color: LADO }} />
                  {resaltarLado ? "Ocultar el lado" : "Mostrar el lado"}
                </button>
              </div>
            </div>
            <div style={{ marginTop: 16, borderRadius: 13, border: `1px solid ${LADO}55`, background: `${LADO}14`, padding: "13px 16px", display: "flex", gap: 12, alignItems: "center" }}>
              <i className="fa-solid fa-square-root-variable" style={{ color: LADO, fontSize: 20 }} />
              <div style={{ fontSize: 15, fontWeight: 800, color: T.text, ...NUM }}>
                {info.raiz}
                {fmt(resultado)} = {base}
                <span style={{ fontSize: 12.5, fontWeight: 600, color: T.text2, marginLeft: 10 }}>
                  (el lado resaltado mide {base} cubitos)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Columna controles ──────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          {/* Base */}
          <Eyebrow>Base · el número que se repite</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 7 }}>
            {BASES.map((b) => (
              <button key={b} className="ex-chip" data-on={b === base} onClick={() => elegirBase(b)}>
                {b}
              </button>
            ))}
          </div>

          <div className="ex-divider" />

          {/* Exponente */}
          <Eyebrow>Exponente · cuántas veces se multiplica</Eyebrow>
          <div style={{ display: "flex", gap: 10 }}>
            {EXPONENTES.map((x) => (
              <button key={x.e} className="ex-exp" data-on={x.e === exponente} onClick={() => elegirExponente(x.e)}>
                <i className={`fa-solid ${x.icono}`} style={{ fontSize: 18, color: x.e === exponente ? accent : T.text3 }} />
                <span>
                  {x.nombre} <strong style={NUM}>(n{x.simbolo})</strong>
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: T.text3 }}>{x.forma}</span>
              </button>
            ))}
          </div>

          <div className="ex-divider" />

          {/* Marcador */}
          <Eyebrow>Marcador</Eyebrow>
          <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}` }}>
            <Readout label="Potencia" value={`${base}${info.simbolo}`} col={accent} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="Vale" value={fmt(resultado)} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="Raíz (lado)" value={`${base}`} col={resaltarLado ? LADO : T.text} />
          </div>

          <div style={{ marginTop: 14, fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
            <i className="fa-solid fa-circle-info" style={{ marginRight: 7, color: accent }} />
            Compara <strong style={{ color: T.text }}>5²= 25</strong> con <strong style={{ color: T.text }}>5³ = 125</strong>: el cubo crece mucho más rápido.
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
            El <strong style={{ color: T.text }}>exponente</strong> dice cuántas veces se multiplica la base, no por cuánto se multiplica. La{" "}
            <strong style={{ color: LADO }}>raíz</strong> deshace la potencia: por eso <strong style={{ color: T.text, ...NUM }}>√(n²) = n</strong> y{" "}
            <strong style={{ color: T.text, ...NUM }}>∛(n³) = n</strong>.
          </span>
        </div>
      </div>
    </div>
  );
}

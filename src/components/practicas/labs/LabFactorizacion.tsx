"use client";

/**
 * Laboratorio 3D — Factorización: el modelo de área.
 * Práctica experimental para PM-II-P03-A2 ("Factorizo polinomios paso a paso").
 *
 * Un trinomio x² + bx + c es el ÁREA de un rectángulo; factorizarlo es hallar
 * sus dos LADOS (x + p) y (x + q). Moviendo p y q el estudiante descubre la
 * relación "suma y producto": b = p + q y c = p·q, y ve el caso especial del
 * trinomio cuadrado perfecto (p = q → un cuadrado). Un panel reúne las cuatro
 * técnicas de la actividad (factor común, diferencia de cuadrados, trinomio
 * cuadrado perfecto y trinomio x²+bx+c).
 * Pensamiento Matemático II — Factorización y álgebra aplicada (MCCEMS 2025).
 */

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import {
  ESCENARIOS,
  TECNICAS,
  P_MIN, P_MAX, P_STEP,
  desarrolla,
  formaFactorizada,
  formaDesarrollada,
  type Escenario,
} from "./factorizacion-data";

const FactorizacionScene = dynamic(() => import("./FactorizacionScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-table-cells-large fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const TEAL = "#5EE6C5";
const AMBER = "#FFD166";

export function LabFactorizacion({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [escKey, setEscKey] = useState(ESCENARIOS[0]!.key);
  const esc = useMemo<Escenario>(() => ESCENARIOS.find((e) => e.key === escKey) ?? ESCENARIOS[0]!, [escKey]);

  const [p, setP] = useState(ESCENARIOS[0]!.p);
  const [q, setQ] = useState(ESCENARIOS[0]!.q);
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetNonce, setResetNonce] = useState(0);

  // seguimiento de objetivos
  const [movioLados, setMovioLados] = useState(false);
  const [vioCuadrado, setVioCuadrado] = useState(false);
  const [explorados, setExplorados] = useState<Set<string>>(() => new Set<string>());

  const { b, c } = useMemo(() => desarrolla(p, q), [p, q]);
  const esCuadrado = p === q;

  const cambiarP = (np: number) => { setP(np); setMovioLados(true); if (np === q) setVioCuadrado(true); };
  const cambiarQ = (nq: number) => { setQ(nq); setMovioLados(true); if (nq === p) setVioCuadrado(true); };

  const cargar = (e: Escenario) => {
    setEscKey(e.key);
    setP(e.p);
    setQ(e.q);
    if (e.p === e.q) setVioCuadrado(true);
    setExplorados((prev) => (prev.has(e.key) ? prev : new Set(prev).add(e.key)));
    setResetNonce((n) => n + 1);
  };

  const reset = () => {
    setP(esc.p);
    setQ(esc.q);
    setResetNonce((n) => n + 1);
  };

  const objetivos = [
    { txt: "Mueve los dos lados (p y q) y observa el rectángulo", done: movioLados },
    { txt: "Forma un trinomio cuadrado perfecto (p = q)", done: vioCuadrado },
    { txt: "Comprueba que b = p + q y c = p·q", done: movioLados },
    { txt: "Explora 3 trinomios distintos", done: explorados.size >= 3 },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${esc.icono}`} />
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, color: T.text, ...NUM }}>{`${formaDesarrollada(p, q)} = ${formaFactorizada(p, q)}`}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: el trinomio es el área de un rectángulo de lados{" "}
        <strong>x + {p}</strong> y <strong>x + {q}</strong>.
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
              <FactorizacionScene p={p} q={q} accent={accent} autoRotate={autoRotate} resetNonce={resetNonce} />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13.5, fontWeight: 900, color: accent, ...NUM }}>
                {esCuadrado ? "Cuadrado perfecto" : "Rectángulo"}
              </span>
            </div>

            {/* Igualdad actual */}
            <div style={{ position: "absolute", bottom: 16, left: 18, display: "flex", gap: 8, alignItems: "baseline", fontSize: 17, fontWeight: 900, pointerEvents: "none", ...NUM, flexWrap: "wrap", maxWidth: "85%" }}>
              <span style={{ color: T.text3, fontWeight: 700 }}>{formaDesarrollada(p, q)} =</span>
              <span style={{ color: accent }}>{formaFactorizada(p, q)}</span>
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

          {/* Deslizadores */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className={`fa-solid ${esc.icono}`} style={{ marginRight: 8, color: accent }} />
              {esc.titulo}
            </Eyebrow>
            <div style={{ fontSize: 13.5, color: T.text2, lineHeight: 1.5, marginBottom: 18 }}>{esc.contexto}</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 9 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: accent }}>Lado ancho · x + {p}</span>
                  <span style={{ fontSize: 15, fontWeight: 900, color: accent, ...NUM }}>p = {p}</span>
                </div>
                <input type="range" className="ex-range" min={P_MIN} max={P_MAX} step={P_STEP} value={p}
                  onChange={(e) => cambiarP(Number(e.target.value))}
                  style={{ ["--exc" as string]: accent, ["--exfill" as string]: `${((p - P_MIN) / (P_MAX - P_MIN)) * 100}%` }} />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 9 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: TEAL }}>Lado alto · x + {q}</span>
                  <span style={{ fontSize: 15, fontWeight: 900, color: TEAL, ...NUM }}>q = {q}</span>
                </div>
                <input type="range" className="ex-range" min={P_MIN} max={P_MAX} step={P_STEP} value={q}
                  onChange={(e) => cambiarQ(Number(e.target.value))}
                  style={{ ["--exc" as string]: TEAL, ["--exfill" as string]: `${((q - P_MIN) / (P_MAX - P_MIN)) * 100}%` }} />
              </div>
            </div>

            <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}`, marginTop: 18 }}>
              <Readout label="Suma  b = p + q" value={String(b)} col={accent} size={15} />
              <div style={{ width: 1, background: T.line }} />
              <Readout label="Producto  c = p·q" value={String(c)} col={AMBER} size={15} />
              <div style={{ width: 1, background: T.line }} />
              <Readout label="Lados (factores)" value={formaFactorizada(p, q)} col={TEAL} size={14} />
            </div>

            <div style={{ marginTop: 14, borderRadius: 13, border: `1px solid ${accent}55`, background: `rgba(${color.rgba},0.10)`, padding: "12px 15px", display: "flex", gap: 12, alignItems: "center" }}>
              <i className="fa-solid fa-arrows-left-right-to-line" style={{ color: accent, fontSize: 17 }} />
              <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text, lineHeight: 1.45 }}>
                Lee el rectángulo: 1 pieza <strong style={{ color: accent }}>x²</strong>, {b} piezas <strong style={{ color: TEAL }}>x</strong> y {c} <strong style={{ color: AMBER }}>unidades</strong> → <strong>{formaDesarrollada(p, q)}</strong>, con lados <strong>{formaFactorizada(p, q)}</strong>.
              </div>
            </div>
          </div>

          {/* Por qué */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>Por qué funciona</Eyebrow>
            <div style={{ fontSize: 13.5, color: T.text2, lineHeight: 1.55 }}>
              Multiplicar dos cosas es calcular el <strong style={{ color: T.text }}>área</strong> de un rectángulo cuyos lados son esas cosas. Por eso <strong style={{ color: accent }}>(x + p)(x + q)</strong> es el área de un rectángulo de lados <strong>x + p</strong> y <strong>x + q</strong>, y al partirlo en piezas obtienes <strong style={{ color: T.text }}>x² + (p + q)x + p·q</strong>. <strong>Factorizar es el camino inverso:</strong> tienes el área (el trinomio) y buscas los lados. Por eso conviene hallar dos números cuya <strong style={{ color: accent }}>suma</strong> sea b y cuyo <strong style={{ color: AMBER }}>producto</strong> sea c.
            </div>
            <div style={{ marginTop: 14, borderRadius: 13, border: `1px solid ${accent}44`, background: `rgba(${color.rgba},0.10)`, padding: "13px 16px", display: "flex", gap: 12, alignItems: "center" }}>
              <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 18 }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, lineHeight: 1.4 }}>
                {esCuadrado
                  ? `Como p = q = ${p}, los dos lados son iguales: el rectángulo es un CUADRADO y el trinomio es perfecto, (x + ${p})².`
                  : `Aquí los lados son distintos (${p} ≠ ${q}): el rectángulo no es cuadrado. Aun así, sus lados ${formaFactorizada(p, q)} son la factorización.`}
              </div>
            </div>
          </div>
        </div>

        {/* ── Columna controles ──────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          <Eyebrow>Trinomios para construir</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ESCENARIOS.map((e) => {
              const on = e.key === escKey;
              const hecho = explorados.has(e.key);
              return (
                <button key={e.key} className="ex-esc" data-on={on} onClick={() => cargar(e)}>
                  <i className={`fa-solid ${e.icono}`} style={{ fontSize: 16, width: 20, textAlign: "center", color: on ? accent : T.text3 }} />
                  <span style={{ fontSize: 13, fontWeight: 700, flex: 1, lineHeight: 1.3 }}>{e.titulo}</span>
                  {hecho && <i className="fa-solid fa-circle-check" style={{ color: OK, fontSize: 13 }} />}
                </button>
              );
            })}
          </div>

          <div className="ex-divider" />

          <Eyebrow>Las 4 técnicas de esta actividad</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {TECNICAS.map((t) => (
              <div key={t.etiqueta} style={{ borderRadius: 11, border: `1px solid ${t.interactivo ? `${accent}55` : T.line}`, background: t.interactivo ? `rgba(${color.rgba},0.08)` : T.glass, padding: "9px 11px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                  <span style={{ fontSize: 11, fontWeight: 900, color: accent, ...NUM }}>{t.etiqueta}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: T.text }}>{t.nombre}</span>
                  {t.interactivo && <i className="fa-solid fa-cube" style={{ color: accent, fontSize: 10, marginLeft: "auto" }} title="Visible en el modelo 3D" />}
                </div>
                <div style={{ fontSize: 12.5, color: T.text2, ...NUM }}>
                  {t.polinomio} = <strong style={{ color: T.text }}>{t.factorizado}</strong>
                </div>
              </div>
            ))}
          </div>

          <div className="ex-divider" />

          <Eyebrow>Marcador</Eyebrow>
          <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}` }}>
            <Readout label="Explorados" value={`${explorados.size}/${ESCENARIOS.length}`} col={accent} size={15} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="Tipo" value={esCuadrado ? "Cuadrado" : "Rectángulo"} col={TEAL} size={14} />
          </div>

          <div style={{ marginTop: 14, fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
            <i className="fa-solid fa-circle-info" style={{ marginRight: 7, color: accent }} />
            El modelo de área muestra trinomios con términos positivos. Las técnicas <strong style={{ color: T.text }}>(a)</strong> y <strong style={{ color: T.text }}>(b)</strong> y los signos negativos de <strong style={{ color: T.text }}>(d)</strong> se explican en el panel de arriba.
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
            La regla de oro para factorizar <strong style={{ color: T.text }}>x² + bx + c</strong>: busca dos números cuya <strong style={{ color: accent }}>suma sea b</strong> y cuyo <strong style={{ color: AMBER }}>producto sea c</strong>. Esos números son p y q, y los factores son <strong style={{ color: TEAL }}>(x + p)(x + q)</strong>.
          </span>
        </div>
      </div>
    </div>
  );
}

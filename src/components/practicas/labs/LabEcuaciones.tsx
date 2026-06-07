"use client";

/**
 * Laboratorio 3D — Ecuaciones lineales: el modelo de barras.
 * Práctica experimental para PM-II-P04-A2 ("Planteo y resuelvo ecuaciones lineales").
 *
 * El reto de esta actividad es PLANTEAR un problema en palabras como una ecuación
 * a·x + b = c y luego resolverlo. El modelo de barras lo hace visible: cada
 * cantidad de la historia es un segmento; mover la incógnita alarga la barra y
 * resolver es hacerla llegar a la meta c. Se complementa con el despeje
 * x = (c − b) / a. Es un enfoque distinto al laboratorio de la balanza
 * (PM-II-P09-A8), que enfatiza el equilibrio al despejar.
 * Pensamiento Matemático II — Ecuaciones lineales en una variable (MCCEMS 2025).
 */

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import {
  ESCENARIOS,
  solucion,
  total,
  ecuacionStr,
  fmtNum,
  type Escenario,
} from "./ecuaciones-data";

const EcuacionesScene = dynamic(() => import("./EcuacionesScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-ruler-horizontal fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const AMBER = "#FFD166";

export function LabEcuaciones({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [escKey, setEscKey] = useState(ESCENARIOS[0]!.key);
  const esc = useMemo<Escenario>(() => ESCENARIOS.find((e) => e.key === escKey) ?? ESCENARIOS[0]!, [escKey]);

  const [x, setX] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetNonce, setResetNonce] = useState(0);
  const [verDespeje, setVerDespeje] = useState(false);

  // seguimiento de objetivos
  const [movioX, setMovioX] = useState(false);
  const [resueltos, setResueltos] = useState<Set<string>>(() => new Set<string>());

  const sol = useMemo(() => solucion(esc), [esc]);
  const totalActual = total(esc.a, esc.b, x);
  const resuelto = totalActual === esc.c;
  const dif = esc.c - totalActual;

  const cambiarX = (nx: number) => {
    setX(nx);
    setMovioX(true);
    if (esc.a * nx + esc.b === esc.c) {
      setResueltos((prev) => (prev.has(esc.key) ? prev : new Set(prev).add(esc.key)));
    }
  };

  const cargar = (e: Escenario) => {
    setEscKey(e.key);
    setX(0);
    setVerDespeje(false);
    setResetNonce((n) => n + 1);
  };

  const reset = () => {
    setX(0);
    setResetNonce((n) => n + 1);
  };

  const resolver = () => {
    setX(sol);
    setMovioX(true);
    setResueltos((prev) => (prev.has(esc.key) ? prev : new Set(prev).add(esc.key)));
  };

  const objetivos = [
    { txt: "Mueve la incógnita y observa cómo crece la barra", done: movioX },
    { txt: "Haz que la barra llegue justo a la meta (resuelve uno)", done: resueltos.size >= 1 },
    { txt: "Resuelve los 3 problemas planteados", done: resueltos.size >= ESCENARIOS.length },
    { txt: "Descubre el despeje x = (c − b) / a", done: verDespeje },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${esc.icono}`} />
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, color: T.text, ...NUM }}>{ecuacionStr(esc)}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: despeja{" "}
        <strong>{esc.xNombre} = (c − b) / a = {fmtNum(sol, 2)} {esc.unidad}</strong>.
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
        .ex-btn { cursor:pointer; border-radius:11px; border:1px solid ${accent}66; background:rgba(${color.rgba},0.14); color:#fff;
          padding:10px 14px; font-size:13px; font-weight:800; transition:all .14s; display:inline-flex; align-items:center; gap:8px; }
        .ex-btn:hover { background:rgba(${color.rgba},0.26); border-color:${accent}; }
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
              <EcuacionesScene a={esc.a} b={esc.b} c={esc.c} x={x} xNombre={esc.xNombre} accent={accent} autoRotate={autoRotate} resetNonce={resetNonce} />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${resuelto ? OK : accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${resuelto ? OK : accent}aa`, width: 9, height: 9, borderRadius: "50%", background: resuelto ? OK : accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13.5, fontWeight: 900, color: resuelto ? OK : accent, ...NUM }}>
                {resuelto ? "¡Resuelto!" : `${fmtNum(totalActual)} / ${fmtNum(esc.c)}`}
              </span>
            </div>

            {/* Ecuación actual */}
            <div style={{ position: "absolute", bottom: 16, left: 18, display: "flex", gap: 8, alignItems: "baseline", fontSize: 17, fontWeight: 900, pointerEvents: "none", ...NUM }}>
              <span style={{ color: T.text3, fontWeight: 700 }}>{esc.a === 1 ? "" : esc.a}{esc.xNombre}{esc.b ? ` + ${esc.b}` : ""} =</span>
              <span style={{ color: resuelto ? OK : accent }}>{fmtNum(totalActual)}</span>
              <span style={{ color: T.text3, fontSize: 14, fontWeight: 700 }}>(meta {fmtNum(esc.c)})</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(2,12,28,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((v) => !v)} title="Girar automáticamente">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="ex-icobtn" onClick={reset} title="Reiniciar la incógnita a 0">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>
          </div>

          {/* Planteamiento + deslizador */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>
              <i className={`fa-solid ${esc.icono}`} style={{ marginRight: 8, color: accent }} />
              {esc.titulo}
            </Eyebrow>
            <div style={{ fontSize: 14, color: T.text, lineHeight: 1.5, marginBottom: 12, fontWeight: 600 }}>{esc.historia}</div>

            <div style={{ borderRadius: 12, border: `1px solid ${accent}44`, background: `rgba(${color.rgba},0.08)`, padding: "11px 14px", marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: T.text3, marginBottom: 5 }}>CÓMO PLANTEARLO</div>
              <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.5 }}>{esc.comoPlantear}</div>
              <div style={{ marginTop: 9, fontSize: 17, fontWeight: 900, color: accent, ...NUM }}>{ecuacionStr(esc)}</div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 9 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: accent }}>Incógnita · {esc.xNombre}{esc.unidad ? ` (${esc.unidad})` : ""}</span>
                <span style={{ fontSize: 15, fontWeight: 900, color: accent, ...NUM }}>{esc.xNombre} = {fmtNum(x)}</span>
              </div>
              <input type="range" className="ex-range" min={esc.xMin} max={esc.xMax} step={esc.xStep} value={x}
                onChange={(e) => cambiarX(Number(e.target.value))}
                style={{ ["--exc" as string]: accent, ["--exfill" as string]: `${((x - esc.xMin) / (esc.xMax - esc.xMin)) * 100}%` }} />
            </div>

            <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}`, marginTop: 18 }}>
              <Readout label={`${esc.a === 1 ? "" : esc.a + "·"}${esc.xNombre}`} value={fmtNum(esc.a * x)} col={accent} size={15} />
              <div style={{ width: 1, background: T.line }} />
              <Readout label="+ constante" value={`+ ${fmtNum(esc.b)}`} col={AMBER} size={15} />
              <div style={{ width: 1, background: T.line }} />
              <Readout label="Total barra" value={fmtNum(totalActual)} col={resuelto ? OK : T.text} size={15} />
              <div style={{ width: 1, background: T.line }} />
              <Readout label={resuelto ? "Diferencia" : "Falta"} value={fmtNum(dif)} col={resuelto ? OK : T.text2} size={15} />
            </div>

            <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <button className="ex-btn" onClick={resolver}>
                <i className="fa-solid fa-wand-magic-sparkles" /> Resolver
              </button>
              <button className="ex-btn" onClick={() => setVerDespeje((v) => !v)}>
                <i className="fa-solid fa-square-root-variable" /> {verDespeje ? "Ocultar" : "Ver"} despeje
              </button>
            </div>

            {verDespeje && (
              <div style={{ marginTop: 14, borderRadius: 13, border: `1px solid ${accent}55`, background: `rgba(${color.rgba},0.10)`, padding: "13px 16px", fontSize: 14, color: T.text, lineHeight: 1.7, ...NUM }}>
                <div>{ecuacionStr(esc)}</div>
                <div style={{ color: T.text2 }}>{esc.a === 1 ? "" : esc.a + esc.xNombre} {esc.b ? `= ${fmtNum(esc.c)} − ${fmtNum(esc.b)} = ${fmtNum(esc.c - esc.b)}` : `= ${fmtNum(esc.c)}`}</div>
                <div style={{ color: accent, fontWeight: 900 }}>{esc.xNombre} = {esc.a === 1 ? "" : `${fmtNum(esc.c - esc.b)} / ${esc.a} = `}{fmtNum(sol, 2)} {esc.unidad}</div>
                {esc.key === "hermanos" && (
                  <div style={{ color: T.text2, marginTop: 4 }}>menor = {fmtNum(sol)} años · mayor = {fmtNum(sol + 9)} años</div>
                )}
              </div>
            )}
          </div>

          {/* Por qué */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>Por qué funciona</Eyebrow>
            <div style={{ fontSize: 13.5, color: T.text2, lineHeight: 1.55 }}>
              Plantear una ecuación es <strong style={{ color: T.text }}>traducir la historia a una barra</strong>: la parte que depende de la incógnita es <strong style={{ color: accent }}>a·{esc.xNombre}</strong>, lo que se suma siempre es la <strong style={{ color: AMBER }}>constante b</strong>, y el total conocido es la <strong style={{ color: "#9fc0e0" }}>meta c</strong>. Resolver es encontrar el valor de {esc.xNombre} que hace que la barra mida justo c. Despejando: primero quitas la constante (c − b) y luego repartes entre a, es decir <strong style={{ color: T.text }}>{esc.xNombre} = (c − b) / a</strong>.
            </div>
          </div>
        </div>

        {/* ── Columna controles ──────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          <Eyebrow>Problemas para plantear</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ESCENARIOS.map((e) => {
              const on = e.key === escKey;
              const hecho = resueltos.has(e.key);
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

          <Eyebrow>Cómo plantear y resolver</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5, display: "flex", flexDirection: "column", gap: 9 }}>
            <div><strong style={{ color: T.text }}>1.</strong> Nombra la incógnita: «sea {esc.xNombre} …».</div>
            <div><strong style={{ color: T.text }}>2.</strong> Traduce cada dato a un segmento: <strong>a·{esc.xNombre}</strong> y la constante <strong>b</strong>.</div>
            <div><strong style={{ color: T.text }}>3.</strong> Iguala a la meta: <strong>a·{esc.xNombre} + b = c</strong>.</div>
            <div><strong style={{ color: T.text }}>4.</strong> Despeja: <strong>{esc.xNombre} = (c − b) / a</strong>.</div>
          </div>

          <div className="ex-divider" />

          <Eyebrow>Marcador</Eyebrow>
          <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}` }}>
            <Readout label="Resueltos" value={`${resueltos.size}/${ESCENARIOS.length}`} col={accent} size={15} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="Solución" value={`${esc.xNombre} = ${fmtNum(sol, 2)}`} col={OK} size={14} />
          </div>

          <div style={{ marginTop: 14, fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
            <i className="fa-solid fa-circle-info" style={{ marginRight: 7, color: accent }} />
            Este lab va de <strong style={{ color: T.text }}>plantear</strong> el problema. Para profundizar en el <strong style={{ color: T.text }}>despeje</strong> con equilibrio, está el laboratorio de la balanza.
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
            La clave de un problema con palabras es <strong style={{ color: T.text }}>nombrar la incógnita</strong> y traducir cada frase a un segmento de la barra. Una vez que ves <strong style={{ color: accent }}>a·{esc.xNombre} + b = c</strong>, resolver es solo aritmética: <strong style={{ color: T.text }}>{esc.xNombre} = (c − b) / a</strong>.
          </span>
        </div>
      </div>
    </div>
  );
}

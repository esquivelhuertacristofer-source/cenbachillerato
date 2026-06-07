"use client";

/**
 * Laboratorio 3D — Volumen de un cilindro (la capacidad de un tanque).
 * Práctica experimental para PM-III-P04-A2.
 *
 * Un tanque cilíndrico que se llena de líquido. El volumen es el área de la base
 * circular (π·r²) por la altura (h): V = π·r²·h. Moviendo el radio, la altura y
 * el nivel de llenado el estudiante descubre la fórmula, lee la capacidad real en
 * litros (1 m³ = 1000 L) y comprueba que —como el radio está al cuadrado—
 * ensanchar el tanque sube el volumen mucho más rápido que hacerlo más alto.
 * Pensamiento Matemático III — Perímetros, áreas y volúmenes (MCCEMS 2025).
 */

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import {
  ESCENARIOS,
  R_MIN, R_MAX, R_STEP,
  H_MIN, H_MAX, H_STEP,
  volumen,
  areaBase,
  litros,
  fmtNum,
  type Escenario,
} from "./cilindro-data";

const CilindroScene = dynamic(() => import("./CilindroScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-fill-drip fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const AGUA = "#3BA7FF";

function colorLiquido(liquido: string): string {
  const l = liquido.toLowerCase();
  if (l.includes("combustible")) return "#F0A030";
  if (l.includes("grano")) return "#E0B341";
  return AGUA;
}

export function LabCilindro({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [escKey, setEscKey] = useState(ESCENARIOS[0]!.key);
  const esc = useMemo<Escenario>(() => ESCENARIOS.find((e) => e.key === escKey) ?? ESCENARIOS[0]!, [escKey]);

  const [r, setR] = useState(ESCENARIOS[0]!.r);
  const [h, setH] = useState(ESCENARIOS[0]!.h);
  const [fill, setFill] = useState(1);
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetNonce, setResetNonce] = useState(0);

  // seguimiento de objetivos
  const [movioRadio, setMovioRadio] = useState(false);
  const [movioAltura, setMovioAltura] = useState(false);
  const [llenoLlenado, setLlenoLlenado] = useState(false);
  const [explorados, setExplorados] = useState<Set<string>>(() => new Set<string>());

  const V = useMemo(() => volumen(r, h), [r, h]);
  const Lt = useMemo(() => litros(r, h), [r, h]);
  const A = useMemo(() => areaBase(r), [r]);
  const Lagua = Lt * fill;
  const fillColor = useMemo(() => colorLiquido(esc.liquido), [esc]);

  const cambiarR = (nr: number) => { setR(nr); setMovioRadio(true); };
  const cambiarH = (nh: number) => { setH(nh); setMovioAltura(true); };
  const cambiarFill = (f: number) => {
    setFill(f);
    if (f >= 0.999) setLlenoLlenado(true);
  };

  const cargar = (e: Escenario) => {
    setEscKey(e.key);
    setR(e.r);
    setH(e.h);
    setFill(1);
    setExplorados((prev) => (prev.has(e.key) ? prev : new Set(prev).add(e.key)));
    setResetNonce((n) => n + 1);
  };

  const reset = () => {
    setR(esc.r);
    setH(esc.h);
    setFill(1);
    setResetNonce((n) => n + 1);
  };

  const objetivos = [
    { txt: "Mueve el radio y observa cómo cambia el volumen", done: movioRadio },
    { txt: "Mueve la altura y compara su efecto con el del radio", done: movioAltura },
    { txt: "Llena un tanque al 100 % y lee su capacidad", done: llenoLlenado },
    { txt: "Explora 3 tanques reales distintos", done: explorados.size >= 3 },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${esc.icono}`} />
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, color: T.text, ...NUM }}>{`V = π·${fmtNum(r)}²·${fmtNum(h)} = ${fmtNum(V, 3)} m³`}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: un tanque de radio{" "}
        <strong>{fmtNum(r)} m</strong> y altura <strong>{fmtNum(h)} m</strong> almacena <strong>{fmtNum(Lt, 0)} litros</strong>.
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
              <CilindroScene r={r} h={h} fill={fill} accent={accent} fillColor={fillColor} autoRotate={autoRotate} resetNonce={resetNonce} />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13.5, fontWeight: 900, color: accent, ...NUM }}>
                {fmtNum(Lagua, 0)} / {fmtNum(Lt, 0)} L · {Math.round(fill * 100)}%
              </span>
            </div>

            {/* Fórmula actual */}
            <div style={{ position: "absolute", bottom: 16, left: 18, display: "flex", gap: 8, alignItems: "baseline", fontSize: 17, fontWeight: 900, pointerEvents: "none", ...NUM }}>
              <span style={{ color: T.text3, fontWeight: 700 }}>V = π·r²·h =</span>
              <span style={{ color: accent }}>{fmtNum(V, 3)} m³</span>
              <span style={{ color: T.text3, fontSize: 14, fontWeight: 700 }}>= {fmtNum(Lt, 0)} L</span>
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
                  <span style={{ fontSize: 13, fontWeight: 700, color: accent }}>Radio · r</span>
                  <span style={{ fontSize: 15, fontWeight: 900, color: accent, ...NUM }}>{fmtNum(r)} m</span>
                </div>
                <input type="range" className="ex-range" min={R_MIN} max={R_MAX} step={R_STEP} value={r}
                  onChange={(e) => cambiarR(Number(e.target.value))}
                  style={{ ["--exc" as string]: accent, ["--exfill" as string]: `${((r - R_MIN) / (R_MAX - R_MIN)) * 100}%` }} />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 9 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#cfe2f5" }}>Altura · h</span>
                  <span style={{ fontSize: 15, fontWeight: 900, color: "#cfe2f5", ...NUM }}>{fmtNum(h)} m</span>
                </div>
                <input type="range" className="ex-range" min={H_MIN} max={H_MAX} step={H_STEP} value={h}
                  onChange={(e) => cambiarH(Number(e.target.value))}
                  style={{ ["--exc" as string]: "#cfe2f5", ["--exfill" as string]: `${((h - H_MIN) / (H_MAX - H_MIN)) * 100}%` }} />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 9 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: fillColor }}>Nivel de llenado · {esc.liquido}</span>
                  <span style={{ fontSize: 15, fontWeight: 900, color: fillColor, ...NUM }}>{Math.round(fill * 100)} %</span>
                </div>
                <input type="range" className="ex-range" min={0} max={1} step={0.01} value={fill}
                  onChange={(e) => cambiarFill(Number(e.target.value))}
                  style={{ ["--exc" as string]: fillColor, ["--exfill" as string]: `${fill * 100}%` }} />
              </div>
            </div>

            <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}`, marginTop: 18 }}>
              <Readout label="Área base π·r²" value={`${fmtNum(A, 3)} m²`} col={accent} size={15} />
              <div style={{ width: 1, background: T.line }} />
              <Readout label="Volumen total" value={`${fmtNum(V, 3)} m³`} col="#cfe2f5" size={15} />
              <div style={{ width: 1, background: T.line }} />
              <Readout label="Capacidad" value={`${fmtNum(Lt, 0)} L`} col={accent} size={15} />
              <div style={{ width: 1, background: T.line }} />
              <Readout label="Contenido actual" value={`${fmtNum(Lagua, 0)} L`} col={fillColor} size={15} />
            </div>

            <div style={{ marginTop: 14, borderRadius: 13, border: `1px solid ${accent}55`, background: `rgba(${color.rgba},0.10)`, padding: "12px 15px", display: "flex", gap: 12, alignItems: "center" }}>
              <i className="fa-solid fa-layer-group" style={{ color: accent, fontSize: 17 }} />
              <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text, lineHeight: 1.45 }}>
                El volumen es <strong>apilar discos</strong>: cada disco mide π·r² = {fmtNum(A, 3)} m², y hay {fmtNum(h)} m de altura → V = {fmtNum(A, 3)} × {fmtNum(h)} = {fmtNum(V, 3)} m³.
              </div>
            </div>
          </div>

          {/* Por qué */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>Por qué funciona</Eyebrow>
            <div style={{ fontSize: 13.5, color: T.text2, lineHeight: 1.55 }}>
              Un cilindro es una <strong style={{ color: T.text }}>pila de discos</strong> iguales. El área de cada disco es la de un círculo, <strong style={{ color: accent }}>π·r²</strong>, y al multiplicarla por la <strong style={{ color: "#cfe2f5" }}>altura</strong> obtienes cuánto espacio ocupa: <strong style={{ color: T.text }}>V = π·r²·h</strong>. Si pasas los metros cúbicos a litros (×1000) tienes la capacidad real del tanque. Como el radio va <strong style={{ color: T.text }}>al cuadrado</strong>, ensanchar el tanque almacena mucho más que hacerlo más alto.
            </div>
            <div style={{ marginTop: 14, borderRadius: 13, border: `1px solid ${accent}44`, background: `rgba(${color.rgba},0.10)`, padding: "13px 16px", display: "flex", gap: 12, alignItems: "center" }}>
              <i className="fa-solid fa-circle-info" style={{ color: accent, fontSize: 18 }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, lineHeight: 1.4 }}>{esc.porque}</div>
            </div>
          </div>
        </div>

        {/* ── Columna controles ──────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          <Eyebrow>Elige un tanque real</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ESCENARIOS.map((e) => {
              const on = e.key === escKey;
              const hecho = explorados.has(e.key);
              return (
                <button key={e.key} className="ex-esc" data-on={on} onClick={() => cargar(e)}>
                  <i className={`fa-solid ${e.icono}`} style={{ fontSize: 16, width: 20, textAlign: "center", color: on ? accent : T.text3 }} />
                  <span style={{ fontSize: 13.5, fontWeight: 700, flex: 1 }}>{e.titulo}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: T.text3, ...NUM }}>
                    {fmtNum(litros(e.r, e.h), 0)} L
                  </span>
                  {hecho && <i className="fa-solid fa-circle-check" style={{ color: OK, fontSize: 13 }} />}
                </button>
              );
            })}
          </div>

          <div className="ex-divider" />

          <Eyebrow>Cómo calcular la capacidad</Eyebrow>
          <div style={{ fontSize: 12.5, color: T.text2, lineHeight: 1.5, display: "flex", flexDirection: "column", gap: 9 }}>
            <div><strong style={{ color: T.text }}>1.</strong> Área de la base: <strong>π·r²</strong> (el círculo de la tapa).</div>
            <div><strong style={{ color: T.text }}>2.</strong> Multiplica por la altura: <strong>V = π·r²·h</strong> (en m³).</div>
            <div><strong style={{ color: T.text }}>3.</strong> Pasa a litros: <strong>×1000</strong> (1 m³ = 1000 L).</div>
          </div>

          <div className="ex-divider" />

          <Eyebrow>Marcador</Eyebrow>
          <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}` }}>
            <Readout label="Explorados" value={`${explorados.size}/${ESCENARIOS.length}`} col={accent} size={15} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="Llenado" value={`${Math.round(fill * 100)}%`} col={fillColor} size={15} />
          </div>

          <div style={{ marginTop: 14, fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
            <i className="fa-solid fa-circle-info" style={{ marginRight: 7, color: accent }} />
            Prueba: <strong style={{ color: T.text }}>duplica el radio</strong> y mira el volumen — se hace <strong style={{ color: accent }}>4 veces mayor</strong>, porque el radio está al cuadrado. Duplicar la altura solo lo duplica.
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
            Saber el volumen de un cilindro te dice cuánta agua cabe en un <strong style={{ color: T.text }}>tinaco</strong>, cuánto combustible en un <strong style={{ color: T.text }}>tambo</strong> o cuánto grano en un <strong style={{ color: T.text }}>silo</strong>: una sola fórmula, <strong style={{ color: accent }}>V = π·r²·h</strong>, para todos.
          </span>
        </div>
      </div>
    </div>
  );
}

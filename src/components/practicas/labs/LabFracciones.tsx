"use client";

/**
 * Laboratorio 3D — Fracciones, decimales y porcentajes.
 * Práctica experimental para PM-I-P04-A1.
 *
 * El estudiante CONSTRUYE una fracción n/d (numerador y denominador) y la ve
 * representada como pastel y barra. Al instante lee la MISMA cantidad de tres
 * formas equivalentes —fracción, decimal y porcentaje— descubre fracciones
 * equivalentes (1/2 = 2/4 = 50%) y aplica el porcentaje a una cantidad real
 * (descuento, propina, impuesto). Pensamiento Matemático I.
 */

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import {
  CANTIDADES,
  CONTEXTOS,
  DENOMINADORES,
  type ContextoKey,
  decimalDe,
  porcentajeDe,
  simplifica,
} from "./fracciones-data";

const FraccionesScene = dynamic(() => import("./FraccionesScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-chart-pie fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const fmtDec = (n: number) => n.toLocaleString("es-MX", { maximumFractionDigits: 4 });
const fmtPct = (n: number) => n.toLocaleString("es-MX", { maximumFractionDigits: 1 });
const fmtMXN = (n: number) => n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function LabFracciones({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [numerador, setNumerador] = useState(1);
  const [denominador, setDenominador] = useState(2);
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetNonce, setResetNonce] = useState(0);
  const [cantidad, setCantidad] = useState<number>(CANTIDADES[0]);
  const [contextoKey, setContextoKey] = useState<ContextoKey>("descuento");
  // seguimiento de objetivos
  const [interactuo, setInteractuo] = useState(false);
  const [vioFormas, setVioFormas] = useState(false);
  const [encontroEquiv, setEncontroEquiv] = useState(false);
  const [aplicoPorcentaje, setAplicoPorcentaje] = useState(false);
  // valores decimales ya vistos → denominadores con que se alcanzaron (para detectar equivalentes)
  const [vistos, setVistos] = useState<Record<string, number[]>>({});

  /** Fija la fracción, registra objetivos y detecta fracciones equivalentes. */
  const setFrac = (n: number, d: number) => {
    const dd = Math.max(1, d);
    const nn = Math.max(0, Math.min(dd, n));
    setNumerador(nn);
    setDenominador(dd);
    setInteractuo(true);
    if (nn > 0) setVioFormas(true);
    if (nn > 0) {
      const key = (nn / dd).toFixed(5);
      const arr = vistos[key];
      // si ya vimos este mismo valor con OTRO denominador → son fracciones equivalentes
      if (arr && arr.length >= 1 && !arr.includes(dd)) setEncontroEquiv(true);
      setVistos((prev) => {
        const prevArr = prev[key] ?? [];
        if (prevArr.includes(dd)) return prev;
        return { ...prev, [key]: [...prevArr, dd] };
      });
    }
  };

  const cambiarNumerador = (delta: number) => setFrac(numerador + delta, denominador);
  const cambiarDenominador = (d: number) => setFrac(numerador, d); // setFrac re-acota el numerador a ≤ d
  const elegirCantidad = (c: number) => {
    setCantidad(c);
    setAplicoPorcentaje(true);
  };
  const elegirContexto = (k: ContextoKey) => {
    setContextoKey(k);
    setAplicoPorcentaje(true);
  };
  const reset = () => {
    setFrac(1, 2);
    setResetNonce((n) => n + 1);
  };

  // valores derivados
  const decimal = useMemo(() => decimalDe(numerador, denominador), [numerador, denominador]);
  const porcentaje = useMemo(() => porcentajeDe(numerador, denominador), [numerador, denominador]);
  const [sn, sd] = useMemo(() => simplifica(numerador, denominador), [numerador, denominador]);
  const esReducible = numerador > 0 && (sn !== numerador || sd !== denominador);
  const contexto = useMemo(() => CONTEXTOS.find((c) => c.key === contextoKey)!, [contextoKey]);
  const parte = cantidad * decimal;
  const totalAplicado = contexto.op === "resta" ? cantidad - parte : cantidad + parte;

  const objetivos = [
    { txt: "Construye y modifica una fracción", done: interactuo },
    { txt: "Léela como fracción, decimal y %", done: vioFormas },
    { txt: "Descubre dos fracciones equivalentes", done: encontroEquiv },
    { txt: "Aplica un porcentaje a una cantidad", done: aplicoPorcentaje },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-chart-pie" />
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, color: T.text, ...NUM }}>
        {numerador}/{denominador} = {fmtDec(decimal)} = {fmtPct(porcentaje)}%
      </div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: la fracción, el decimal y el porcentaje son tres formas de escribir la misma cantidad.
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
          font-size:14px; font-weight:800; padding:10px 0; transition:all .14s ease; ${"" /* ancho lo da el grid */} }
        .ex-chip:hover { border-color:${T.lineStrong}; background:${T.glassSoft}; color:#fff; }
        .ex-chip[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.18); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .ex-step { cursor:pointer; width:48px; height:48px; border-radius:12px; border:1px solid ${T.lineStrong}; background:${T.inset};
          color:#fff; font-size:18px; display:flex; align-items:center; justify-content:center; transition:all .14s; }
        .ex-step:hover:not(:disabled) { background:rgba(${color.rgba},0.2); border-color:${accent}; }
        .ex-step:disabled { opacity:0.35; cursor:default; }
        .ex-ctx { cursor:pointer; border-radius:11px; border:1px solid ${T.line}; background:${T.glass}; color:${T.text2};
          font-size:13px; font-weight:800; padding:11px 6px; transition:all .14s ease; display:flex; flex-direction:column; align-items:center; gap:6px; }
        .ex-ctx:hover { border-color:${T.lineStrong}; color:#fff; }
        .ex-ctx[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.18); color:#fff; }
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
              <FraccionesScene numerador={numerador} denominador={denominador} accent={accent} autoRotate={autoRotate} resetNonce={resetNonce} />
            </SceneBoundary>

            {/* Cinta EN VIVO con la fracción en sus tres formas */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13.5, fontWeight: 900, color: accent, ...NUM }}>
                {numerador}/{denominador} = {fmtDec(decimal)} = {fmtPct(porcentaje)}%
              </span>
            </div>

            {/* Etiqueta inferior */}
            <div style={{ position: "absolute", bottom: 16, left: 18, fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", pointerEvents: "none" }}>
              <i className="fa-solid fa-chart-pie" style={{ marginRight: 7, color: accent }} />
              Pastel y barra: misma fracción
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

          {/* Las tres formas */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>La misma cantidad, tres formas</Eyebrow>
            <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}` }}>
              <Readout label="Fracción" value={`${numerador}/${denominador}`} col={accent} />
              <div style={{ width: 1, background: T.line }} />
              <Readout label="Decimal" value={fmtDec(decimal)} />
              <div style={{ width: 1, background: T.line }} />
              <Readout label="Porcentaje" value={`${fmtPct(porcentaje)}%`} />
            </div>
            <div style={{ marginTop: 12, fontSize: 13, color: esReducible ? T.text : T.text2, lineHeight: 1.5 }}>
              <i className="fa-solid fa-equals" style={{ marginRight: 8, color: accent }} />
              {esReducible ? (
                <>
                  La fracción <strong style={{ color: T.text, ...NUM }}>{numerador}/{denominador}</strong> equivale a la fracción simplificada{" "}
                  <strong style={{ color: accent, ...NUM }}>{sn}/{sd}</strong>: ambas son la misma parte del todo.
                </>
              ) : numerador === 0 ? (
                <>No tomas ninguna parte: la fracción vale <strong style={{ color: T.text }}>0</strong> (0%).</>
              ) : numerador === denominador ? (
                <>Tomas todas las partes: la fracción vale <strong style={{ color: T.text }}>1</strong> (100%), el entero completo.</>
              ) : (
                <>Esta fracción ya está en su forma más simple: no se puede reducir más.</>
              )}
            </div>
          </div>

          {/* Aplica el porcentaje a una cantidad real */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>Aplica el porcentaje a una cantidad</Eyebrow>

            <div style={{ display: "grid", gridTemplateColumns: `repeat(${CANTIDADES.length}, 1fr)`, gap: 8 }}>
              {CANTIDADES.map((c) => (
                <button key={c} className="ex-chip" data-on={c === cantidad} onClick={() => elegirCantidad(c)}>
                  ${c}
                </button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: `repeat(${CONTEXTOS.length}, 1fr)`, gap: 8, marginTop: 10 }}>
              {CONTEXTOS.map((c) => (
                <button key={c.key} className="ex-ctx" data-on={c.key === contextoKey} onClick={() => elegirContexto(c.key)}>
                  <i className={`fa-solid ${c.icono}`} style={{ fontSize: 15, color: c.key === contextoKey ? accent : T.text3 }} />
                  {c.nombre}
                </button>
              ))}
            </div>

            <div style={{ marginTop: 16, borderRadius: 13, border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.1)`, padding: "14px 16px" }}>
              <div style={{ fontSize: 13.5, color: T.text2, lineHeight: 1.55 }}>
                El <strong style={{ color: T.text }}>{contexto.nombre.toLowerCase()}</strong> es el{" "}
                <strong style={{ color: accent, ...NUM }}>{fmtPct(porcentaje)}%</strong> de{" "}
                <strong style={{ color: T.text, ...NUM }}>${fmtMXN(cantidad)}</strong> ={" "}
                <strong style={{ color: accent, ...NUM }}>${fmtMXN(parte)}</strong>.
              </div>
              <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                <span style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: T.text3 }}>
                  {contexto.etiqueta}
                </span>
                <span style={{ fontSize: 24, fontWeight: 900, color: T.text, ...NUM, textShadow: `0 0 18px ${accent}44` }}>
                  ${fmtMXN(totalAplicado)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Columna controles ──────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          {/* Numerador */}
          <Eyebrow>Numerador · partes que tomas</Eyebrow>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <button className="ex-step" onClick={() => cambiarNumerador(-1)} disabled={numerador <= 0} title="Quitar una parte">
              <i className="fa-solid fa-minus" />
            </button>
            <div style={{ textAlign: "center", lineHeight: 1 }}>
              <div style={{ fontSize: 40, fontWeight: 900, color: accent, ...NUM, textShadow: `0 0 22px ${accent}55` }}>{numerador}</div>
              <div style={{ height: 2, background: T.lineStrong, margin: "6px auto", width: 54 }} />
              <div style={{ fontSize: 28, fontWeight: 800, color: T.text2, ...NUM }}>{denominador}</div>
            </div>
            <button className="ex-step" onClick={() => cambiarNumerador(1)} disabled={numerador >= denominador} title="Tomar una parte más">
              <i className="fa-solid fa-plus" />
            </button>
          </div>

          <div className="ex-divider" />

          {/* Denominador */}
          <Eyebrow>Denominador · en cuántas partes divides</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {DENOMINADORES.map((d) => (
              <button key={d} className="ex-chip" data-on={d === denominador} onClick={() => cambiarDenominador(d)}>
                {d}
              </button>
            ))}
          </div>

          <div className="ex-divider" />

          {/* Marcador */}
          <Eyebrow>Marcador</Eyebrow>
          <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}` }}>
            <Readout label="Decimal" value={fmtDec(decimal)} col={accent} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="Porcentaje" value={`${fmtPct(porcentaje)}%`} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="Equivalentes" value={encontroEquiv ? "Sí" : "—"} col={encontroEquiv ? OK : T.text3} />
          </div>

          <div style={{ marginTop: 14, fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
            <i className="fa-solid fa-circle-info" style={{ marginRight: 7, color: accent }} />
            Prueba <strong style={{ color: T.text }}>1/2</strong> y luego <strong style={{ color: T.text }}>2/4</strong>: distinta fracción, mismo valor.
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
            Para pasar de fracción a porcentaje, <strong style={{ color: T.text }}>divide y multiplica por 100</strong>: 3/4 = 0.75 = 75%. Por eso el{" "}
            <strong style={{ color: T.text }}>porcentaje es una fracción con denominador 100</strong>.
          </span>
        </div>
      </div>
    </div>
  );
}

"use client";

/**
 * Laboratorio 3D — Valor posicional.
 * Práctica experimental para PM-I-P08-A2.
 *
 * El estudiante arma un número de hasta 4 cifras y ve, con bloques base-10:
 *   · que cada posición vale 10 veces la de su derecha (unidad→decena→centena→millar);
 *   · que el VALOR de una cifra = cifra × valor del lugar (descomposición);
 *   · que el CERO es un marcador de posición: guarda el lugar aunque no aporte.
 * Pensamiento Matemático I.
 */

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import {
  LUGARES,
  MAX_DIGITO,
  NUM_DEFAULT,
  numeroDe,
  digitosDe,
  tieneCeroIntermedio,
  type Digitos,
  type Lugar,
} from "./valor-data";

const ValorPosicionalScene = dynamic(() => import("./ValorPosicionalScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-cubes-stacked fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

export function LabValorPosicional({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;

  const [digitos, setDigitos] = useState<Digitos>(NUM_DEFAULT);
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetNonce, setResetNonce] = useState(0);

  // seguimiento de objetivos
  const [movio, setMovio] = useState(false);
  const [vioMillar, setVioMillar] = useState(false);
  const [vioCero, setVioCero] = useState(false);
  const [vioMax, setVioMax] = useState(false);

  const aplicar = (next: Digitos) => {
    setDigitos(next);
    setMovio(true);
    if (next.millares >= 1) setVioMillar(true);
    if (tieneCeroIntermedio(next)) setVioCero(true);
    if (next.millares === 9 && next.centenas === 9 && next.decenas === 9 && next.unidades === 9) setVioMax(true);
  };

  const setCifra = (key: Lugar["key"], v: number) => {
    const clamp = Math.max(0, Math.min(MAX_DIGITO, v));
    aplicar({ ...digitos, [key]: clamp });
  };
  const setNumero = (n: number) => aplicar(digitosDe(n));
  const reset = () => setResetNonce((k) => k + 1);

  const numero = useMemo(() => numeroDe(digitos), [digitos]);

  const objetivos = [
    { txt: "Cambia alguna posición", done: movio },
    { txt: "Forma un número de millares (≥ 1000)", done: vioMillar },
    { txt: "Usa el 0 como marcador (un 0 en medio)", done: vioCero },
    { txt: "Forma el número mayor: 9999", done: vioMax },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className="fa-solid fa-cubes" />
      </div>
      <div style={{ fontSize: 26, fontWeight: 900, color: T.text, ...NUM }}>{numero.toLocaleString("es-MX")}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar los bloques 3D, pero la idea sigue: cada posición vale 10 veces la de su derecha.
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
        .ex-step { cursor:pointer; width:34px; height:34px; border-radius:9px; border:1px solid ${T.line}; background:${T.inset};
          color:#fff; font-size:14px; display:flex; align-items:center; justify-content:center; transition:all .14s; }
        .ex-step:hover { border-color:${T.lineStrong}; background:${T.glassSoft}; }
        .ex-step:disabled { opacity:0.3; cursor:not-allowed; }
        .ex-slider { -webkit-appearance:none; appearance:none; width:100%; height:7px; border-radius:999px; background:${T.lineStrong}; outline:none; cursor:pointer; }
        .ex-slider::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:21px; height:21px; border-radius:50%; background:#fff; border:3px solid ${accent}; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
        .ex-slider::-moz-range-thumb { width:21px; height:21px; border-radius:50%; background:#fff; border:3px solid ${accent}; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
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
              <ValorPosicionalScene digitos={digitos} accent={accent} autoRotate={autoRotate} resetNonce={resetNonce} />
            </SceneBoundary>

            {/* Cinta EN VIVO */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 14.5, fontWeight: 900, color: accent, ...NUM }}>{numero.toLocaleString("es-MX")}</span>
            </div>

            {/* Etiqueta inferior */}
            <div style={{ position: "absolute", bottom: 16, left: 18, fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", pointerEvents: "none" }}>
              <i className="fa-solid fa-cubes-stacked" style={{ marginRight: 7, color: accent }} />
              Bloques base-10 · cubito → barra → placa → cubo
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(2,12,28,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((v) => !v)} title="Girar automáticamente">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="ex-icobtn" onClick={reset} title="Reiniciar vista">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>
          </div>

          {/* Controles: una cifra por posición */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>Arma el número — una cifra por posición</Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {LUGARES.map((l) => {
                const cifra = digitos[l.key];
                return (
                  <div key={l.key} style={{ borderRadius: 14, border: `1px solid ${cifra > 0 ? `${l.color}66` : T.line}`, background: cifra > 0 ? `${l.color}14` : T.inset, padding: "12px 10px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", color: T.text3, textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <i className={`fa-solid ${l.icono}`} style={{ color: l.color }} />
                      {l.nombre}
                    </div>
                    <div style={{ margin: "8px 0 4px", fontSize: 40, fontWeight: 900, lineHeight: 1, color: cifra > 0 ? l.color : T.text3, ...NUM }}>{cifra}</div>
                    <div style={{ fontSize: 10.5, color: T.text3, ...NUM }}>×{l.valor.toLocaleString("es-MX")} = {(cifra * l.valor).toLocaleString("es-MX")}</div>
                    <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 10 }}>
                      <button className="ex-step" onClick={() => setCifra(l.key, cifra - 1)} disabled={cifra <= 0} aria-label={`Bajar ${l.nombre}`}>
                        <i className="fa-solid fa-minus" />
                      </button>
                      <button className="ex-step" onClick={() => setCifra(l.key, cifra + 1)} disabled={cifra >= MAX_DIGITO} aria-label={`Subir ${l.nombre}`}>
                        <i className="fa-solid fa-plus" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 9 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>O desliza el número completo</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: accent, ...NUM }}>{numero.toLocaleString("es-MX")}</span>
              </div>
              <input className="ex-slider" type="range" min={0} max={9999} step={1} value={numero} onChange={(e) => setNumero(Number(e.target.value))} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: T.text3, ...NUM }}>
                <span>0</span>
                <span>9999</span>
              </div>
            </div>
          </div>

          {/* El corazón: descomposición posicional */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>El valor de cada cifra = cifra × valor del lugar</Eyebrow>
            <div style={{ fontSize: 16, fontWeight: 800, color: T.text2, lineHeight: 1.7, display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 8 }}>
              {LUGARES.map((l, i) => {
                const cifra = digitos[l.key];
                const aporte = cifra * l.valor;
                return (
                  <span key={l.key} style={{ display: "inline-flex", alignItems: "baseline", gap: 8 }}>
                    {i > 0 && <span style={{ color: T.text3 }}>+</span>}
                    <span style={{ ...NUM, color: aporte > 0 ? l.color : T.text3, fontWeight: 900 }}>{aporte.toLocaleString("es-MX")}</span>
                  </span>
                );
              })}
              <span style={{ color: T.text3 }}>=</span>
              <span style={{ ...NUM, color: accent, fontWeight: 900 }}>{numero.toLocaleString("es-MX")}</span>
            </div>
            <div style={{ marginTop: 14, fontSize: 13.5, color: T.text2, lineHeight: 1.55 }}>
              {tieneCeroIntermedio(digitos) ? (
                <>
                  <i className="fa-solid fa-circle-info" style={{ marginRight: 7, color: accent }} />
                  Hay un <strong style={{ color: T.text }}>cero</strong> en medio: no aporta valor, pero <strong style={{ color: T.text }}>guarda el lugar</strong> para que las demás cifras valgan lo que deben. Sin él, el número cambiaría por completo.
                </>
              ) : (
                <>
                  <i className="fa-solid fa-circle-info" style={{ marginRight: 7, color: accent }} />
                  La misma cifra vale distinto según su lugar: un <strong style={{ color: T.text }}>5</strong> en las decenas vale <strong style={{ color: T.text, ...NUM }}>50</strong>, pero en los millares vale <strong style={{ color: T.text, ...NUM }}>5000</strong>.
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Columna controles ──────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          <Eyebrow>Cada posición vale 10 veces la anterior</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {LUGARES.map((l, i) => {
              const cifra = digitos[l.key];
              return (
                <div key={l.key} style={{ display: "flex", alignItems: "center", gap: 12, borderRadius: 12, border: `1px solid ${cifra > 0 ? `${l.color}55` : T.line}`, background: cifra > 0 ? `${l.color}12` : T.inset, padding: "10px 12px" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#fff", background: l.color, flexShrink: 0 }}>
                    <i className={`fa-solid ${l.icono}`} />
                  </div>
                  <div style={{ flex: 1, lineHeight: 1.3 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{l.nombre}</div>
                    <div style={{ fontSize: 11, color: T.text3, ...NUM }}>
                      {i < LUGARES.length - 1 ? `= 10 × ${LUGARES[i + 1]?.singular ?? ""}` : "el bloque base"} · vale {l.valor.toLocaleString("es-MX")}
                    </div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: cifra > 0 ? l.color : T.text3, ...NUM }}>{cifra}</div>
                </div>
              );
            })}
          </div>

          <div className="ex-divider" />

          <Eyebrow>Lectura</Eyebrow>
          <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}` }}>
            <Readout label="Número" value={numero.toLocaleString("es-MX")} col={accent} size={17} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="Cifras" value={`${numero >= 1000 ? 4 : numero >= 100 ? 3 : numero >= 10 ? 2 : 1}`} size={17} />
          </div>

          <div style={{ marginTop: 14, fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>
            <i className="fa-solid fa-circle-info" style={{ marginRight: 7, color: accent }} />
            Diez <strong style={{ color: T.text }}>cubitos</strong> forman una <strong style={{ color: T.text }}>barra</strong>; diez barras, una <strong style={{ color: T.text }}>placa</strong>; diez placas, un <strong style={{ color: T.text }}>cubo</strong>. Ese “diez a la vez” es la base del sistema decimal.
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
            El valor posicional es lo que hace tan poderoso al sistema decimal: con solo <strong style={{ color: T.text }}>diez símbolos</strong> (0–9) y la <strong style={{ color: accent }}>posición</strong>, escribes cualquier número, por grande que sea.
          </span>
        </div>
      </div>
    </div>
  );
}

"use client";

/**
 * Laboratorio 3D — Concentración de una disolución (% en masa).
 * Práctica experimental para CNEYT-I-P04-A6.
 *
 * El estudiante prepara una disolución: elige un SOLUTO, agrega gramos de soluto
 * y de DISOLVENTE (agua) y observa cómo cambia la CONCENTRACIÓN en % en masa
 * = (masa de soluto / masa de la disolución) × 100. Si agrega más soluto del que
 * el agua admite (solubilidad), el excedente no se disuelve: la disolución se
 * SATURA. Conecta la química con los porcentajes. Ciencias Naturales,
 * Experimentales y Tecnología I.
 */

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, OK, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import { SOLUTOS, AGUAS, SOLUTO_MAX, SOLUTO_PASO, disolver, nivelDisolucion } from "./concentracion-data";

const ConcentracionScene = dynamic(() => import("./ConcentracionScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-flask fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const SAT = "#FF8A3C"; // color de saturación

const fmtG = (n: number) => `${n % 1 === 0 ? n.toLocaleString("es-MX") : n.toLocaleString("es-MX", { maximumFractionDigits: 1 })} g`;
const fmtPct = (n: number) => `${n.toLocaleString("es-MX", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;

export function LabConcentracion({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [solutoKey, setSolutoKey] = useState(SOLUTOS[0]!.key);
  const [masaSoluto, setMasaSoluto] = useState(20);
  const [masaAgua, setMasaAgua] = useState<number>(100);
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetNonce, setResetNonce] = useState(0);
  // seguimiento de objetivos
  const [interactuo, setInteractuo] = useState(false);
  const [vioConcentrada, setVioConcentrada] = useState(false);
  const [diluyo, setDiluyo] = useState(false);
  const [saturo, setSaturo] = useState(false);

  // marca objetivos a partir del resultado de una combinación
  const marcar = (soluto: number, aguaG: number, key: string) => {
    const s = SOLUTOS.find((x) => x.key === key)!;
    const d = disolver(soluto, aguaG, s.solubilidad);
    if (d.concentracion >= 20) setVioConcentrada(true);
    if (d.saturada) setSaturo(true);
  };

  const elegirSoluto = (key: string) => {
    setSolutoKey(key);
    setInteractuo(true);
    marcar(masaSoluto, masaAgua, key);
  };
  const masSoluto = () => {
    const n = Math.min(SOLUTO_MAX, masaSoluto + SOLUTO_PASO);
    setMasaSoluto(n);
    setInteractuo(true);
    marcar(n, masaAgua, solutoKey);
  };
  const menosSoluto = () => {
    const n = Math.max(0, masaSoluto - SOLUTO_PASO);
    setMasaSoluto(n);
    setInteractuo(true);
    marcar(n, masaAgua, solutoKey);
  };
  const elegirAgua = (g: number) => {
    if (g > masaAgua && masaSoluto > 0) setDiluyo(true);
    setMasaAgua(g);
    setInteractuo(true);
    marcar(masaSoluto, g, solutoKey);
  };
  const reset = () => {
    setSolutoKey(SOLUTOS[0]!.key);
    setMasaSoluto(20);
    setMasaAgua(100);
    setResetNonce((n) => n + 1);
  };

  const soluto = useMemo(() => SOLUTOS.find((x) => x.key === solutoKey)!, [solutoKey]);
  const d = useMemo(() => disolver(masaSoluto, masaAgua, soluto.solubilidad), [masaSoluto, masaAgua, soluto.solubilidad]);
  const nivelInfo = useMemo(() => nivelDisolucion(masaSoluto, d), [masaSoluto, d]);

  const nivel = 0.28 + ((masaAgua - 50) / 150) * 0.6; // 50 g → 0.28, 200 g → 0.88
  const intensidad = Math.min(1, d.concentracion / 35);
  const excedenteFrac = Math.min(1, d.excedente / 40);

  const objetivos = [
    { txt: "Agrega soluto y prepara una disolución", done: interactuo && masaSoluto > 0 },
    { txt: "Llega a una disolución concentrada (≥ 20 %)", done: vioConcentrada },
    { txt: "Diluye agregando más agua (baja el %)", done: diluyo },
    { txt: "Satura: deja soluto sin disolver", done: saturo },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: accent, boxShadow: `0 10px 30px -6px ${accent}` }}>
        <i className={`fa-solid ${soluto.icono}`} />
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, color: T.text, ...NUM }}>{fmtPct(d.concentracion)}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 380, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero la idea sigue: {fmtG(d.disuelto)} de {soluto.nombre} disueltos en {fmtG(masaAgua)} de agua dan una disolución del {fmtPct(d.concentracion)} en masa.
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
          font-size:14px; font-weight:800; padding:11px 0; transition:all .14s ease; }
        .ex-chip:hover { border-color:${T.lineStrong}; background:${T.glassSoft}; color:#fff; }
        .ex-chip[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.18); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .ex-sol { cursor:pointer; flex:1; border-radius:12px; border:1px solid ${T.line}; background:${T.glass}; color:${T.text2};
          font-weight:800; padding:13px 6px; transition:all .14s ease; display:flex; flex-direction:column; align-items:center; gap:5px; }
        .ex-sol:hover { border-color:${T.lineStrong}; color:#fff; }
        .ex-sol[data-on="true"] { border-color:${accent}; background:rgba(${color.rgba},0.18); color:#fff; box-shadow:0 0 16px -6px ${accent}; }
        .ex-step { cursor:pointer; width:46px; height:46px; border-radius:12px; border:1px solid ${T.line}; background:${T.glass};
          color:#fff; font-size:18px; transition:all .14s; display:flex; align-items:center; justify-content:center; }
        .ex-step:hover:not(:disabled) { border-color:${accent}; background:rgba(${color.rgba},0.16); }
        .ex-step:disabled { opacity:0.32; cursor:not-allowed; }
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
              <ConcentracionScene
                nivel={nivel}
                solutoColor={soluto.color}
                intensidad={intensidad}
                saturada={d.saturada}
                excedenteFrac={excedenteFrac}
                accent={accent}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO con la concentración */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${accent}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${accent}aa`, width: 9, height: 9, borderRadius: "50%", background: accent }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 13.5, fontWeight: 900, color: accent, ...NUM }}>{fmtPct(d.concentracion)} en masa</span>
            </div>

            {/* Etiqueta de estado (diluida / concentrada / saturada) */}
            <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 14px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${nivelInfo.color}66`, backdropFilter: "blur(10px)" }}>
              <i className={`fa-solid ${d.saturada ? "fa-triangle-exclamation" : "fa-droplet"}`} style={{ color: nivelInfo.color, fontSize: 12 }} />
              <span style={{ fontSize: 12, fontWeight: 800, color: nivelInfo.color }}>{nivelInfo.texto}</span>
            </div>

            {/* Etiqueta inferior */}
            <div style={{ position: "absolute", bottom: 16, left: 18, fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", pointerEvents: "none" }}>
              <i className={`fa-solid ${soluto.icono}`} style={{ marginRight: 7, color: accent }} />
              {fmtG(d.disuelto)} {soluto.nombre} · {fmtG(masaAgua)} agua
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

          {/* La concentración paso a paso */}
          <div style={{ ...card, padding: "18px 22px 20px" }}>
            <Eyebrow>La concentración paso a paso</Eyebrow>
            <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}` }}>
              <Readout label="Soluto disuelto" value={fmtG(d.disuelto)} col={accent} />
              <div style={{ width: 1, background: T.line }} />
              <Readout label="Disolvente" value={fmtG(masaAgua)} />
              <div style={{ width: 1, background: T.line }} />
              <Readout label="Disolución" value={fmtG(d.masaDisolucion)} />
              <div style={{ width: 1, background: T.line }} />
              <Readout label="% en masa" value={fmtPct(d.concentracion)} col={nivelInfo.color} />
            </div>
            <div style={{ marginTop: 12, fontSize: 13.5, color: T.text2, lineHeight: 1.5 }}>
              <i className="fa-solid fa-percent" style={{ marginRight: 8, color: accent }} />
              <strong style={{ color: T.text }}>% en masa</strong> ={" "}
              <span style={{ ...NUM }}>
                ({fmtG(d.disuelto).replace(" g", "")} ÷ {fmtG(d.masaDisolucion).replace(" g", "")}) × 100 ={" "}
              </span>
              <strong style={{ color: nivelInfo.color, ...NUM }}>{fmtPct(d.concentracion)}</strong>. La masa de la disolución es soluto disuelto + disolvente.
            </div>

            {/* Aviso de saturación */}
            {d.saturada && (
              <div style={{ marginTop: 14, borderRadius: 13, border: `1px solid ${SAT}66`, background: `${SAT}14`, padding: "12px 16px", display: "flex", gap: 12, alignItems: "center" }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ color: SAT, fontSize: 18 }} />
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text, lineHeight: 1.45 }}>
                  Disolución <span style={{ color: SAT }}>saturada</span>: el agua solo disuelve {fmtG(d.maxDisuelto)} de {soluto.nombre}.{" "}
                  <strong style={{ color: SAT, ...NUM }}>{fmtG(d.excedente)}</strong> quedan sin disolver en el fondo.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Columna controles ──────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          {/* Soluto */}
          <Eyebrow>Soluto · lo que se disuelve</Eyebrow>
          <div style={{ display: "flex", gap: 8 }}>
            {SOLUTOS.map((s) => (
              <button key={s.key} className="ex-sol" data-on={s.key === solutoKey} onClick={() => elegirSoluto(s.key)}>
                <i className={`fa-solid ${s.icono}`} style={{ fontSize: 18, color: s.key === solutoKey ? accent : T.text3 }} />
                <span style={{ fontSize: 12.5 }}>{s.nombre}</span>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: T.text3, ...NUM }}>{s.formula}</span>
              </button>
            ))}
          </div>

          <div className="ex-divider" />

          {/* Masa de soluto */}
          <Eyebrow>Masa de soluto</Eyebrow>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <button className="ex-step" onClick={menosSoluto} disabled={masaSoluto <= 0} title="Quitar soluto">
              <i className="fa-solid fa-minus" />
            </button>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: accent, ...NUM, textShadow: `0 0 18px ${accent}55` }}>{fmtG(masaSoluto)}</div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: T.text3, letterSpacing: "0.05em", textTransform: "uppercase" }}>de {soluto.nombre}</div>
            </div>
            <button className="ex-step" onClick={masSoluto} disabled={masaSoluto >= SOLUTO_MAX} title="Agregar soluto">
              <i className="fa-solid fa-plus" />
            </button>
          </div>
          <div style={{ marginTop: 11, fontSize: 12, color: T.text2, lineHeight: 1.45 }}>
            <i className="fa-solid fa-circle-info" style={{ marginRight: 7, color: accent }} />
            En este vaso el agua disuelve hasta <strong style={{ color: T.text, ...NUM }}>{fmtG(d.maxDisuelto)}</strong> de {soluto.nombre}.
          </div>

          <div className="ex-divider" />

          {/* Disolvente */}
          <Eyebrow>Disolvente · agua</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 7 }}>
            {AGUAS.map((g) => (
              <button key={g} className="ex-chip" data-on={g === masaAgua} onClick={() => elegirAgua(g)}>
                {g} g
              </button>
            ))}
          </div>

          <div className="ex-divider" />

          {/* Marcador */}
          <Eyebrow>Marcador</Eyebrow>
          <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}` }}>
            <Readout label="Concentración" value={fmtPct(d.concentracion)} col={nivelInfo.color} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="Estado" value={nivelInfo.texto} col={nivelInfo.color} />
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
            La <strong style={{ color: T.text }}>concentración</strong> sube si agregas soluto y baja si agregas agua (la diluyes). Pero el agua tiene un límite: al rebasar la{" "}
            <strong style={{ color: SAT }}>solubilidad</strong>, el soluto extra se queda sin disolver y la disolución está saturada.
          </span>
        </div>
      </div>
    </div>
  );
}

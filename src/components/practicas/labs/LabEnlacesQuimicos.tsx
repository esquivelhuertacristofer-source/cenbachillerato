"use client";

/**
 * Laboratorio 3D — Enlaces químicos (¿por qué los átomos se unen?).
 * Práctica experimental para CNEYT-I-P10-A1.
 *
 * El estudiante elige una MOLÉCULA y la ve en 3D (modelo de barras y esferas).
 * Descubre que los átomos se unen para ganar estabilidad (regla del octeto) y
 * que el TIPO de enlace lo decide la diferencia de electronegatividad (ΔEN):
 *   · ΔEN < 0.4  → covalente no polar (comparten por igual)
 *   · 0.4 – 1.7  → covalente polar (comparten desigual)
 *   · ΔEN ≥ 1.7  → iónico (un átomo cede su electrón al otro)
 *
 * Diseño coherente con los demás laboratorios; fallback 2D si no hay WebGL.
 */

import { useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";
import { T, NUM, card, Eyebrow, Readout, SceneBoundary } from "./_kit";
import {
  MOLECULAS,
  ELEMS,
  CAT_COLOR,
  CAT_LABEL,
  deltaEN,
  type ElementoQuim,
} from "./enlaces-data";

const EnlacesQuimicosScene = dynamic(() => import("./EnlacesQuimicosScene"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.55)" }}>
      <i className="fa-solid fa-flask-vial fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const fmt = (n: number, dec = 0) => n.toLocaleString("es-MX", { minimumFractionDigits: dec, maximumFractionDigits: dec });

/* ── Componentes de UI (fuera del render: estado estable) ─────────────── */

const ElemDot = ({ el }: { el: ElementoQuim }) => {
  const e = ELEMS[el];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12, color: T.text2, fontWeight: 600 }}>
      <span style={{ width: 13, height: 13, borderRadius: "50%", background: e.color, border: "1px solid rgba(255,255,255,0.25)", boxShadow: `0 0 8px -2px ${e.color}` }} />
      {el} <span style={{ color: T.text3, fontWeight: 500 }}>· EN {e.en}</span>
    </span>
  );
};

// Chip de molécula seleccionable
const MolChip = ({ active, formula, nombre, cat, onClick }: { active: boolean; formula: string; nombre: string; cat: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="ex-mol"
    data-on={active}
    title={nombre}
    style={{
      borderColor: active ? cat : T.line,
      background: active ? `${cat}22` : T.glass,
      boxShadow: active ? `0 0 16px -5px ${cat}` : "none",
    }}
  >
    <span style={{ position: "absolute", top: 7, right: 8, width: 7, height: 7, borderRadius: "50%", background: cat }} />
    <span style={{ fontSize: 17, fontWeight: 900, color: active ? "#fff" : T.text, lineHeight: 1.1 }}>{formula}</span>
    <span style={{ fontSize: 10.5, color: T.text3, lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>{nombre}</span>
  </button>
);

/* ── Escala de electronegatividad: dónde cae este enlace ──────────────── */
const MAX_EN = 3.3;
const EscalaEN = ({ delta, catColor }: { delta: number; catColor: string }) => {
  const pct = Math.min(100, (delta / MAX_EN) * 100);
  const z1 = (0.4 / MAX_EN) * 100;
  const z2 = (1.7 / MAX_EN) * 100;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <Eyebrow>Diferencia de electronegatividad (ΔEN)</Eyebrow>
        <span style={{ fontSize: 16, fontWeight: 900, color: catColor, ...NUM, textShadow: `0 0 14px ${catColor}66` }}>{fmt(delta, 2)}</span>
      </div>
      <div style={{ position: "relative", height: 16, borderRadius: 999, overflow: "hidden", display: "flex", border: `1px solid ${T.line}` }}>
        <div style={{ width: `${z1}%`, background: `${CAT_COLOR["no-polar"]}55` }} />
        <div style={{ width: `${z2 - z1}%`, background: `${CAT_COLOR["polar"]}55` }} />
        <div style={{ flex: 1, background: `${CAT_COLOR["ionico"]}55` }} />
        {/* marcador */}
        <div
          style={{
            position: "absolute",
            top: -3,
            left: `calc(${pct}% - 2px)`,
            width: 4,
            height: 22,
            borderRadius: 2,
            background: "#fff",
            boxShadow: `0 0 10px 1px ${catColor}`,
            transition: "left 0.4s ease",
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7, fontSize: 10.5, fontWeight: 700, color: T.text3 }}>
        <span style={{ color: CAT_COLOR["no-polar"] }}>No polar</span>
        <span style={{ color: CAT_COLOR["polar"] }}>Polar</span>
        <span style={{ color: CAT_COLOR["ionico"] }}>Iónico</span>
      </div>
    </div>
  );
};

const EXPLICA: Record<string, string> = {
  "no-polar": "Los átomos tienen electronegatividad parecida (ΔEN < 0.4): comparten los electrones por igual. Es un enlace covalente no polar.",
  polar: "Un átomo atrae más los electrones que el otro (ΔEN entre 0.4 y 1.7). Comparten, pero desigual: enlace covalente polar, con un lado más negativo.",
  ionico: "La diferencia es tan grande (ΔEN ≥ 1.7) que un átomo CEDE su electrón al otro. Se forman iones de carga opuesta que se atraen: enlace iónico.",
};

export function LabEnlacesQuimicos({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [molKey, setMolKey] = useState("H2O");
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetNonce, setResetNonce] = useState(0);
  const [visitados, setVisitados] = useState<Set<string>>(() => new Set<string>(["H2O"]));

  const mol = MOLECULAS.find((m) => m.key === molKey)!;
  const idx = MOLECULAS.findIndex((m) => m.key === molKey);
  const delta = deltaEN(mol.par);
  const catColor = CAT_COLOR[mol.categoria];
  const elementos = Array.from(new Set(mol.atoms.map((a) => a.el)));

  const irAMol = (k: string) => {
    setMolKey(k);
    setVisitados((prev) => {
      if (prev.has(k)) return prev;
      const next = new Set(prev);
      next.add(k);
      return next;
    });
  };
  const paso = (dir: number) => {
    const i = Math.max(0, Math.min(MOLECULAS.length - 1, idx + dir));
    irAMol(MOLECULAS[i]!.key);
  };

  const catsVisitadas = new Set(Array.from(visitados).map((k) => MOLECULAS.find((m) => m.key === k)!.categoria));
  const objetivos = [
    { txt: "Construye un enlace covalente no polar", done: catsVisitadas.has("no-polar") },
    { txt: "Construye un enlace covalente polar", done: catsVisitadas.has("polar") },
    { txt: "Observa un enlace iónico (transferencia)", done: catsVisitadas.has("ionico") },
    { txt: "Recorre al menos 5 moléculas", done: visitados.size >= 5 },
  ];

  const sceneFallback = (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" }}>
      <div style={{ width: 74, height: 74, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", background: catColor, boxShadow: `0 10px 30px -6px ${catColor}` }}>
        <i className="fa-solid fa-atom" />
      </div>
      <div style={{ fontSize: 24, fontWeight: 900, color: T.text }}>{mol.formula}</div>
      <div style={{ fontSize: 13.5, color: T.text2, maxWidth: 360, lineHeight: 1.5 }}>
        Tu equipo no puede mostrar la vista 3D, pero el experimento sigue: <strong style={{ color: T.text }}>{mol.nombre}</strong> — {mol.descripcion}
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
        .ex-mol { position:relative; cursor:pointer; border-radius:12px; border:1px solid ${T.line}; background:${T.glass};
          display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; padding:13px 6px 10px; transition:all .14s ease; min-width:0; }
        .ex-mol:hover { border-color:${T.lineStrong}; background:${T.glassSoft}; }
        .ex-step { cursor:pointer; flex:1; display:flex; align-items:center; justify-content:center; gap:8px; padding:10px;
          border-radius:11px; border:1px solid ${T.line}; background:${T.inset}; color:${T.text2}; font-size:13px; font-weight:700; transition:all .15s; }
        .ex-step:hover:not(:disabled) { color:#fff; border-color:${T.lineStrong}; }
        .ex-step:disabled { opacity:0.35; cursor:not-allowed; }
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
              <EnlacesQuimicosScene
                molKey={mol.key}
                atoms={mol.atoms}
                bonds={mol.bonds}
                ionico={mol.ionico}
                accent={accent}
                autoRotate={autoRotate}
                resetNonce={resetNonce}
              />
            </SceneBoundary>

            {/* Cinta EN VIVO + molécula */}
            <div style={{ position: "absolute", top: 14, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 12px", borderRadius: 999, background: "rgba(2,12,28,0.74)", border: `1px solid ${catColor}66`, backdropFilter: "blur(10px)" }}>
              <span className="ex-live-dot" style={{ ["--exc" as string]: `${catColor}aa`, width: 9, height: 9, borderRadius: "50%", background: catColor }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: T.text3 }}>EN VIVO</span>
              <span style={{ width: 1, height: 13, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 14, fontWeight: 900, color: T.text }}>{mol.formula}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.text3 }}>{mol.nombre}</span>
            </div>

            {/* Toolbar */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 2, padding: 4, borderRadius: 12, background: "rgba(2,12,28,0.74)", border: `1px solid ${T.line}`, backdropFilter: "blur(10px)" }}>
              <button className="ex-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((v) => !v)} title="Girar automáticamente">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="ex-icobtn" onClick={() => setResetNonce((n) => n + 1)} title="Reiniciar">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            {/* Tipo de enlace (esquina inferior derecha) */}
            <div style={{ position: "absolute", bottom: 14, right: 16, textAlign: "right", pointerEvents: "none", background: "rgba(2,12,28,0.6)", padding: "8px 14px", borderRadius: 13, backdropFilter: "blur(6px)", border: `1px solid ${catColor}55` }}>
              <div style={{ fontSize: 10, color: T.text3, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Tipo de enlace</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: catColor, marginTop: 2, textShadow: `0 0 14px ${catColor}66` }}>{CAT_LABEL[mol.categoria]}</div>
            </div>

            {/* Leyenda de átomos */}
            <div style={{ position: "absolute", bottom: 14, left: 16, display: "flex", gap: 14, flexWrap: "wrap", maxWidth: "55%", pointerEvents: "none", background: "rgba(2,12,28,0.6)", padding: "7px 13px", borderRadius: 14, backdropFilter: "blur(6px)" }}>
              {elementos.map((el) => (
                <ElemDot key={el} el={el} />
              ))}
            </div>
          </div>

          {/* Lectura: escala EN + por qué se unen */}
          <div style={{ ...card, padding: "20px 22px" }}>
            <EscalaEN delta={delta} catColor={catColor} />
            <div className="ex-divider" />
            <Eyebrow>¿Por qué se unen?</Eyebrow>
            <p style={{ margin: 0, fontSize: 13, color: T.text2, lineHeight: 1.55 }}>{EXPLICA[mol.categoria]}</p>
          </div>
        </div>

        {/* ── Columna controles ──────────────────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          {/* Molécula actual */}
          <Eyebrow>Molécula actual</Eyebrow>
          <div style={{ borderRadius: 14, border: `1px solid ${catColor}55`, background: `${catColor}14`, padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 54, height: 54, flexShrink: 0, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: "#fff", background: catColor, boxShadow: `0 8px 22px -6px ${catColor}` }}>
                {mol.formula}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: T.text, lineHeight: 1.1 }}>{mol.nombre}</div>
                <div style={{ fontSize: 12, color: catColor, fontWeight: 700, marginTop: 2 }}>{CAT_LABEL[mol.categoria]}</div>
              </div>
            </div>
            <p style={{ margin: "12px 0 0", fontSize: 12.5, color: T.text2, lineHeight: 1.5 }}>{mol.descripcion}</p>
          </div>

          {/* Pasos */}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button className="ex-step" onClick={() => paso(-1)} disabled={idx === 0}>
              <i className="fa-solid fa-arrow-left" /> Anterior
            </button>
            <button className="ex-step" onClick={() => paso(1)} disabled={idx === MOLECULAS.length - 1}>
              Siguiente <i className="fa-solid fa-arrow-right" />
            </button>
          </div>

          <div className="ex-divider" />

          {/* Selector de moléculas */}
          <Eyebrow>Elige una molécula</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {MOLECULAS.map((m) => (
              <MolChip key={m.key} active={m.key === molKey} formula={m.formula} nombre={m.nombre} cat={CAT_COLOR[m.categoria]} onClick={() => irAMol(m.key)} />
            ))}
          </div>

          <div className="ex-divider" />

          {/* Lecturas */}
          <Eyebrow>Datos del enlace</Eyebrow>
          <div style={{ display: "flex", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}` }}>
            <Readout label="Átomos" value={fmt(mol.atoms.length)} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label={mol.ionico ? "Iones" : "Enlaces"} value={fmt(mol.ionico ? mol.atoms.length : mol.bonds.length)} />
            <div style={{ width: 1, background: T.line }} />
            <Readout label="ΔEN" value={fmt(delta, 2)} col={catColor} />
          </div>

          {/* Geometría */}
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 13, background: T.inset, border: `1px solid ${T.line}` }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: T.text3, textTransform: "uppercase" }}>Geometría</span>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: T.text }}>{mol.geometria}</span>
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
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: o.done ? "#34D399" : T.text2 }}>
                <i className={`fa-solid ${o.done ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: o.done ? 1 : 0.3 }} />
                <span style={{ fontWeight: o.done ? 700 : 500 }}>{o.txt}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderRadius: 18, padding: "18px 20px", border: `1px solid rgba(${color.rgba},0.3)`, background: `rgba(${color.rgba},0.08)`, fontSize: 13.5, color: T.text2, lineHeight: 1.55, display: "flex", gap: 13 }}>
          <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 17, marginTop: 1 }} />
          <span>
            Los átomos se unen para alcanzar <strong style={{ color: T.text }}>estabilidad</strong> (regla del octeto): pueden{" "}
            <strong style={{ color: T.text }}>compartir</strong> electrones (covalente) o <strong style={{ color: T.text }}>transferirlos</strong> (iónico). La{" "}
            <strong style={{ color: T.text }}>ΔEN</strong> decide cuál ocurre.
          </span>
        </div>
      </div>
    </div>
  );
}

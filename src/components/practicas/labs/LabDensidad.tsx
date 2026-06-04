"use client";

/**
 * Laboratorio 3D — Densidad y Flotación.
 * Práctica experimental para "Cálculo de densidad" (CNEYT-I-P02-A6).
 *
 * El estudiante elige un líquido y un material (o entra en modo personalizado
 * con masa y volumen), y observa en 3D si el objeto flota o se hunde según
 * ρ = m / V comparada con la densidad del líquido (principio de Arquímedes).
 *
 * Diseño: sistema visual consistente (una escala de tipografía/espaciado,
 * controles propios — segmentados, tiles, lectura tipo instrumento).
 */

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PracticaLabProps } from "../registry";

const DensidadScene = dynamic(() => import("./DensidadScene"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        color: "#64748b",
      }}
    >
      <i className="fa-solid fa-flask-vial fa-bounce" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>Preparando el laboratorio 3D…</span>
    </div>
  ),
});

const G = 9.81; // m/s²

/* ── Tokens de diseño ───────────────────────────────────────────────── */
const T = {
  ink: "#13233b",
  ink2: "#56657b",
  ink3: "#93a0b2",
  line: "#e8edf3",
  lineStrong: "#d7dfea",
  surface: "#ffffff",
  canvas: "#f4f7fb",
  shadow: "0 1px 2px rgba(19,35,59,0.05), 0 16px 38px -18px rgba(19,35,59,0.18)",
  shadowSm: "0 1px 2px rgba(19,35,59,0.06)",
};
const NUM: React.CSSProperties = { fontVariantNumeric: "tabular-nums" };

/* ── Datos físicos ──────────────────────────────────────────────────── */
interface Liquido {
  key: string;
  label: string;
  d: number; // g/mL
  color: string;
}
const LIQUIDOS: Liquido[] = [
  { key: "aceite", label: "Aceite", d: 0.92, color: "#e6c84f" },
  { key: "agua", label: "Agua", d: 1.0, color: "#3FA9F5" },
  { key: "salada", label: "Agua salada", d: 1.03, color: "#2FBFA6" },
  { key: "glicerina", label: "Glicerina", d: 1.26, color: "#bfe3d0" },
  { key: "miel", label: "Miel", d: 1.42, color: "#d99100" },
  { key: "mercurio", label: "Mercurio", d: 13.53, color: "#aab2bb" },
];

interface Material {
  key: string;
  label: string;
  d: number; // g/cm³
  color: string;
  metal: number;
  rough: number;
}
const MATERIALES: Material[] = [
  { key: "corcho", label: "Corcho", d: 0.24, color: "#caa472", metal: 0, rough: 0.85 },
  { key: "madera", label: "Madera", d: 0.55, color: "#9c6b3f", metal: 0, rough: 0.7 },
  { key: "hielo", label: "Hielo", d: 0.92, color: "#cfeaff", metal: 0, rough: 0.12 },
  { key: "plastico", label: "Plástico", d: 1.4, color: "#e94f8a", metal: 0, rough: 0.4 },
  { key: "aluminio", label: "Aluminio", d: 2.7, color: "#b9bfc6", metal: 1, rough: 0.28 },
  { key: "hierro", label: "Hierro", d: 7.87, color: "#8a8f96", metal: 1, rough: 0.35 },
  { key: "plomo", label: "Plomo", d: 11.34, color: "#6e7378", metal: 1, rough: 0.42 },
  { key: "oro", label: "Oro", d: 19.32, color: "#e8b53a", metal: 1, rough: 0.22 },
];

const fmt = (n: number, dec = 2) =>
  n.toLocaleString("es-MX", { minimumFractionDigits: dec, maximumFractionDigits: dec });

/* ── Componentes de UI (declarados fuera del render: estado estable) ──── */

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.13em", color: T.ink3, margin: "0 0 12px" }}>
    {children}
  </p>
);

// Tile seleccionable (líquido / material)
const Tile = ({
  active,
  swatch,
  round,
  label,
  sub,
  onClick,
  accent,
  colorRgba,
}: {
  active: boolean;
  swatch: string;
  round?: boolean;
  label: string;
  sub: string;
  onClick: () => void;
  accent: string;
  colorRgba: string;
}) => (
  <button
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 11,
      padding: "11px 13px",
      textAlign: "left",
      cursor: "pointer",
      borderRadius: 13,
      border: active ? `1.5px solid ${accent}` : `1px solid ${T.line}`,
      background: active ? `rgba(${colorRgba},0.08)` : T.surface,
      boxShadow: active ? `inset 0 0 0 1px ${accent}` : T.shadowSm,
      transition: "all 0.15s ease",
      width: "100%",
    }}
  >
    <span
      style={{
        width: 18,
        height: 18,
        flexShrink: 0,
        borderRadius: round ? "50%" : 5,
        background: swatch,
        border: "1px solid rgba(0,0,0,0.14)",
        boxShadow: "inset 0 1px 2px rgba(255,255,255,0.4)",
      }}
    />
    <span style={{ flex: 1, minWidth: 0 }}>
      <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: T.ink, lineHeight: 1.2 }}>{label}</span>
      <span style={{ display: "block", fontSize: 12, color: T.ink3, ...NUM }}>{sub}</span>
    </span>
    {active && <i className="fa-solid fa-check" style={{ fontSize: 12, color: accent }} />}
  </button>
);

// Lectura tipo instrumento
const Readout = ({ label, value, unit, col }: { label: string; value: string; unit: string; col?: string }) => (
  <div style={{ flex: 1, padding: "12px 8px", textAlign: "center" }}>
    <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.07em", color: T.ink3, textTransform: "uppercase" }}>{label}</div>
    <div style={{ marginTop: 5, fontSize: 18, fontWeight: 800, color: col ?? T.ink, ...NUM }}>
      {value} <span style={{ fontSize: 11, fontWeight: 600, color: T.ink3 }}>{unit}</span>
    </div>
  </div>
);

export function LabDensidad({ color }: PracticaLabProps) {
  const accent = `#${color.hex.replace("#", "")}`;
  const [liquidoKey, setLiquidoKey] = useState("agua");
  const [materialKey, setMaterialKey] = useState("madera");
  const [shape, setShape] = useState<"cube" | "sphere">("cube");
  const [volume, setVolume] = useState(120); // cm³
  const [customMass, setCustomMass] = useState(80); // g (modo personalizado)
  const [showForces, setShowForces] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [dropNonce, setDropNonce] = useState(0);

  const liquido = LIQUIDOS.find((l) => l.key === liquidoKey)!;
  const isCustom = materialKey === "custom";
  const material = MATERIALES.find((m) => m.key === materialKey);

  // Densidad y masa según el modo
  const objDensity = isCustom ? customMass / volume : material!.d;
  const objMass = isCustom ? customMass : material!.d * volume; // g
  const objColor = isCustom ? accent : material!.color;
  const objMetal = isCustom ? 0.2 : material!.metal;
  const objRough = isCustom ? 0.4 : material!.rough;

  // ── Física ────────────────────────────────────────────────────────
  const ratio = objDensity / liquido.d;
  const neutral = Math.abs(ratio - 1) < 0.02;
  const submFrac = neutral ? 1 : ratio < 1 ? Math.min(ratio, 1) : 1;
  const sumergido = Math.round(submFrac * 100);

  // Fuerzas (N). m[kg]=g/1000 ; V_sub[m³]=submFrac·volume/1e6 ; ρl[kg/m³]=d·1000
  const weightN = (objMass / 1000) * G;
  const buoyancyN = liquido.d * 1000 * ((submFrac * volume) / 1e6) * G;
  const netN = weightN - buoyancyN;

  const veredicto = useMemo(() => {
    if (neutral) return { txt: "Equilibrio", sub: "Densidades casi iguales: queda suspendido", icon: "fa-arrows-up-down", col: "#C2790B" };
    if (ratio < 1) return { txt: "Flota", sub: `Se sumerge sólo el ${sumergido}%`, icon: "fa-arrow-up", col: "#0E9F6E" };
    return { txt: "Se hunde", sub: "Más denso que el líquido", icon: "fa-arrow-down", col: "#D63A3A" };
  }, [neutral, ratio, sumergido]);

  // ── Objetivos guiados (se marcan en vivo) ──────────────────────────
  const objetivos = [
    { txt: "Haz que un objeto flote", done: ratio < 1 && !neutral },
    { txt: "Haz que un objeto se hunda", done: ratio > 1 },
    { txt: "Logra el equilibrio (ρ ≈ ρ líquido)", done: neutral },
    { txt: "Haz flotar un metal cambiando el líquido", done: !isCustom && (material?.metal ?? 0) > 0.5 && ratio < 1 },
  ];

  const card: React.CSSProperties = {
    background: T.surface,
    border: `1px solid ${T.line}`,
    borderRadius: 18,
    boxShadow: T.shadow,
  };

  const grid2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 };

  return (
    <div style={{ color: T.ink }}>
      <style>{`
        .dx-slider { -webkit-appearance:none; appearance:none; width:100%; height:7px; border-radius:999px;
          background:${T.lineStrong}; outline:none; }
        .dx-slider::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:21px; height:21px;
          border-radius:50%; background:#fff; cursor:pointer; border:1px solid ${T.lineStrong};
          box-shadow:0 1px 4px rgba(19,35,59,0.22); }
        .dx-slider::-webkit-slider-thumb:hover { border-color:${accent}; }
        .dx-slider::-moz-range-thumb { width:21px; height:21px; border-radius:50%; background:#fff; cursor:pointer;
          border:1px solid ${T.lineStrong}; box-shadow:0 1px 4px rgba(19,35,59,0.22); }
        .dx-grid { display:grid; grid-template-columns: minmax(0,1.5fr) minmax(0,1fr); gap:22px; align-items:start; }
        @media (max-width: 1000px){ .dx-grid { grid-template-columns: 1fr; } }
        .dx-seg { display:flex; gap:4px; padding:4px; border-radius:12px; background:${T.canvas}; border:1px solid ${T.line}; }
        .dx-seg button { flex:1; cursor:pointer; border:none; background:transparent; border-radius:9px;
          padding:9px 10px; font-size:13.5px; font-weight:700; color:${T.ink2}; display:flex; align-items:center;
          justify-content:center; gap:7px; transition:all .15s ease; }
        .dx-seg button[data-on="true"] { background:#fff; color:${T.ink}; box-shadow:${T.shadowSm}; }
        .dx-icobtn { cursor:pointer; width:36px; height:36px; border-radius:9px; display:flex; align-items:center;
          justify-content:center; font-size:14px; border:none; background:transparent; color:${T.ink2}; transition:all .15s; }
        .dx-icobtn[data-on="true"] { background:rgba(${color.rgba},0.14); color:${T.ink}; }
        .dx-icobtn:hover { background:rgba(${color.rgba},0.10); }
        .dx-divider { height:1px; background:${T.line}; margin:18px 0; }
      `}</style>

      {/* ── Encabezado ─────────────────────────────────────────────── */}
      <header style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <p style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.14em", color: accent, margin: 0, textTransform: "uppercase" }}>
            Práctica experimental
          </p>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: T.ink, margin: "4px 0 0", letterSpacing: "-0.01em" }}>
            Densidad y flotación
          </h2>
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 16px",
            borderRadius: 999,
            background: `${veredicto.col}14`,
            border: `1px solid ${veredicto.col}33`,
          }}
        >
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: veredicto.col, boxShadow: `0 0 0 3px ${veredicto.col}22` }} />
          <span style={{ fontSize: 14, fontWeight: 800, color: veredicto.col }}>{veredicto.txt}</span>
          <span style={{ fontSize: 13, color: T.ink2, ...NUM }}>· {sumergido}% sumergido</span>
        </div>
      </header>

      <div className="dx-grid">
        {/* ── Columna visor ──────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Escena 3D */}
          <div
            style={{
              position: "relative",
              height: 520,
              borderRadius: 18,
              overflow: "hidden",
              border: `1px solid ${T.line}`,
              background: "linear-gradient(180deg,#eef4fb 0%,#dde9f6 100%)",
              boxShadow: T.shadow,
            }}
          >
            <DensidadScene
              liquidDensity={liquido.d}
              liquidColor={liquido.color}
              objDensity={objDensity}
              objColor={objColor}
              objMetalness={objMetal}
              objRoughness={objRough}
              shape={shape}
              volume={volume}
              accent={accent}
              showForces={showForces}
              autoRotate={autoRotate}
              dropNonce={dropNonce}
              weightN={weightN}
              buoyancyN={buoyancyN}
            />

            {/* Toolbar unificada */}
            <div
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                display: "flex",
                gap: 2,
                padding: 4,
                borderRadius: 12,
                background: "rgba(255,255,255,0.92)",
                border: `1px solid ${T.line}`,
                boxShadow: T.shadowSm,
                backdropFilter: "blur(8px)",
              }}
            >
              <button className="dx-icobtn" data-on={showForces} onClick={() => setShowForces((v) => !v)} title="Vectores de fuerza">
                <i className="fa-solid fa-arrows-up-down" />
              </button>
              <button className="dx-icobtn" data-on={autoRotate} onClick={() => setAutoRotate((v) => !v)} title="Girar automáticamente">
                <i className="fa-solid fa-arrows-rotate" />
              </button>
              <button className="dx-icobtn" onClick={() => setDropNonce((n) => n + 1)} title="Soltar de nuevo">
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>

            <div
              style={{
                position: "absolute",
                bottom: 14,
                left: 16,
                fontSize: 11.5,
                color: T.ink2,
                fontWeight: 600,
                pointerEvents: "none",
                background: "rgba(255,255,255,0.78)",
                padding: "4px 11px",
                borderRadius: 999,
                backdropFilter: "blur(4px)",
              }}
            >
              <i className="fa-solid fa-hand-pointer" style={{ marginRight: 6 }} />
              Arrastra para girar · rueda para acercar
            </div>
          </div>

          {/* Veredicto + barra de sumergido */}
          <div style={{ ...card, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 13,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 19,
                  color: "#fff",
                  background: veredicto.col,
                  boxShadow: `0 6px 16px -4px ${veredicto.col}88`,
                }}
              >
                <i className={`fa-solid ${veredicto.icon}`} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: T.ink }}>{veredicto.txt}</div>
                <div style={{ fontSize: 13, color: T.ink2, marginTop: 1 }}>{veredicto.sub}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: T.ink, ...NUM, lineHeight: 1 }}>{sumergido}%</div>
                <div style={{ fontSize: 10.5, color: T.ink3, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 3 }}>
                  Sumergido
                </div>
              </div>
            </div>

            <div style={{ marginTop: 16, height: 9, borderRadius: 999, background: T.canvas, overflow: "hidden", border: `1px solid ${T.line}` }}>
              <div style={{ width: `${sumergido}%`, height: "100%", borderRadius: 999, background: veredicto.col, transition: "width 0.4s ease" }} />
            </div>

            <div style={{ marginTop: 16, display: "flex", borderRadius: 13, background: T.canvas, border: `1px solid ${T.line}` }}>
              <Readout label="Peso (P)" value={fmt(weightN)} unit="N" col="#D63A3A" />
              <div style={{ width: 1, background: T.line }} />
              <Readout label="Empuje (E)" value={fmt(buoyancyN)} unit="N" col="#1E84C7" />
              <div style={{ width: 1, background: T.line }} />
              <Readout
                label="Fuerza neta"
                value={`${netN > 0.005 ? "↓" : netN < -0.005 ? "↑" : "="} ${fmt(Math.abs(netN))}`}
                unit="N"
                col={veredicto.col}
              />
            </div>
          </div>
        </div>

        {/* ── Columna controles (panel único) ────────────────────── */}
        <div style={{ ...card, padding: "22px 22px 24px" }}>
          {/* Densidad calculada */}
          <Eyebrow>Cálculo de densidad</Eyebrow>
          <div
            style={{
              borderRadius: 14,
              border: `1px solid ${T.line}`,
              background: T.canvas,
              padding: "16px 18px",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <span style={{ color: T.ink2, fontSize: 17, fontWeight: 700 }}>ρ =</span>
            <div style={{ textAlign: "center", ...NUM }}>
              <div style={{ color: T.ink, fontWeight: 700, fontSize: 14 }}>{fmt(objMass, 0)} g</div>
              <div style={{ height: 2, background: T.ink2, margin: "4px 0", borderRadius: 2 }} />
              <div style={{ color: T.ink, fontWeight: 700, fontSize: 14 }}>{fmt(volume, 0)} cm³</div>
            </div>
            <span style={{ color: T.ink2, fontSize: 17, fontWeight: 700 }}>=</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ color: accent, fontWeight: 800, fontSize: 30, ...NUM, letterSpacing: "-0.02em" }}>{fmt(objDensity)}</span>
              <span style={{ color: T.ink2, fontSize: 13, fontWeight: 600 }}>g/cm³</span>
            </div>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <div style={{ fontSize: 10.5, color: T.ink3, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Líquido</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.ink, ...NUM }}>{fmt(liquido.d)} g/mL</div>
            </div>
          </div>

          <div className="dx-divider" />

          {/* Líquido */}
          <Eyebrow>Líquido</Eyebrow>
          <div style={grid2}>
            {LIQUIDOS.map((l) => (
              <Tile
                key={l.key}
                active={l.key === liquidoKey}
                swatch={l.color}
                round
                label={l.label}
                sub={`${fmt(l.d)} g/mL`}
                onClick={() => setLiquidoKey(l.key)}
                accent={accent}
                colorRgba={color.rgba}
              />
            ))}
          </div>

          <div className="dx-divider" />

          {/* Material */}
          <Eyebrow>Material del objeto</Eyebrow>
          <div style={grid2}>
            {MATERIALES.map((m) => (
              <Tile
                key={m.key}
                active={m.key === materialKey}
                swatch={m.color}
                label={m.label}
                sub={`${fmt(m.d)} g/cm³`}
                onClick={() => setMaterialKey(m.key)}
                accent={accent}
                colorRgba={color.rgba}
              />
            ))}
          </div>
          <button
            onClick={() => setMaterialKey("custom")}
            style={{
              marginTop: 9,
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "10px",
              borderRadius: 13,
              cursor: "pointer",
              fontSize: 13.5,
              fontWeight: 700,
              border: isCustom ? `1.5px solid ${accent}` : `1px dashed ${T.lineStrong}`,
              background: isCustom ? `rgba(${color.rgba},0.08)` : T.surface,
              color: isCustom ? T.ink : T.ink2,
            }}
          >
            <i className="fa-solid fa-sliders" /> Masa y volumen personalizados
          </button>

          <div className="dx-divider" />

          {/* Forma */}
          <Eyebrow>Forma</Eyebrow>
          <div className="dx-seg">
            <button data-on={shape === "cube"} onClick={() => setShape("cube")}>
              <i className="fa-solid fa-cube" /> Cubo
            </button>
            <button data-on={shape === "sphere"} onClick={() => setShape("sphere")}>
              <i className="fa-solid fa-circle" /> Esfera
            </button>
          </div>

          <div className="dx-divider" />

          {/* Sliders */}
          {isCustom && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 13.5, color: T.ink2, fontWeight: 700 }}>Masa</span>
                <span style={{ fontSize: 14, color: T.ink, fontWeight: 800, ...NUM }}>{fmt(customMass, 0)} g</span>
              </div>
              <input className="dx-slider" type="range" min={5} max={2000} step={5} value={customMass} onChange={(e) => setCustomMass(Number(e.target.value))} />
            </div>
          )}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 13.5, color: T.ink2, fontWeight: 700 }}>Volumen</span>
              <span style={{ fontSize: 14, color: T.ink, fontWeight: 800, ...NUM }}>{fmt(volume, 0)} cm³</span>
            </div>
            <input className="dx-slider" type="range" min={10} max={500} step={5} value={volume} onChange={(e) => setVolume(Number(e.target.value))} />
          </div>
        </div>
      </div>

      {/* ── Objetivos + pista ──────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr)", gap: 22, marginTop: 22 }} className="dx-bottom">
        <div style={{ ...card, padding: "18px 22px" }}>
          <Eyebrow>
            <i className="fa-solid fa-bullseye" style={{ marginRight: 8, color: accent }} />
            Objetivos
          </Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
            {objetivos.map((o, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: o.done ? "#0E9F6E" : T.ink2 }}>
                <i className={`fa-solid ${o.done ? "fa-circle-check" : "fa-circle"}`} style={{ fontSize: 15, opacity: o.done ? 1 : 0.28 }} />
                <span style={{ fontWeight: o.done ? 700 : 500 }}>{o.txt}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            borderRadius: 18,
            padding: "18px 20px",
            border: `1px solid rgba(${color.rgba},0.3)`,
            background: `rgba(${color.rgba},0.05)`,
            fontSize: 13.5,
            color: T.ink2,
            lineHeight: 1.55,
            display: "flex",
            gap: 13,
          }}
        >
          <i className="fa-solid fa-lightbulb" style={{ color: accent, fontSize: 17, marginTop: 1 }} />
          <span>
            El objeto flota cuando su densidad es <strong style={{ color: T.ink }}>menor</strong> que la del líquido. Por eso el
            hierro se hunde en agua… pero <strong style={{ color: T.ink }}>flota en mercurio</strong>. ¡Compruébalo!
          </span>
        </div>
      </div>

      <style>{`@media (max-width: 1000px){ .dx-bottom { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
